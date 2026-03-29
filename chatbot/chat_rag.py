import re
import json
from pathlib import Path
# from langchain_community.vectorstores import Chroma
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain

import threading

# Initialize the chain once globally to improve response speed
_CACHED_CHAIN = None
_LOCK = threading.Lock()

def get_rag_chain():
    global _CACHED_CHAIN
    with _LOCK:
        if _CACHED_CHAIN is not None:
            return _CACHED_CHAIN

    # Consistency: Low temperature for deterministic answers
    # Note: If llama3.2:1b fails due to RAM, try tinyllama:latest (637MB)
    model = ChatOllama(
        model="llama3.2:1b",
        temperature=0.1,
        num_ctx=2048,
        base_url="http://127.0.0.1:11434"
    )
    
    # Tightly constrained prompt for llama3.2:1b — small model needs very explicit instructions
    prompt = PromptTemplate.from_template(
        """You are Dr. Sara, an AI veterinarian for PawPal (Sri Lanka). Answer ONLY the user's question below.

RULES (follow exactly):
1. Start with the MOST RELEVANT category tag: [HEALTH_GUIDELINES] for general health, [VACCINATION_SCHEDULES] for shots/vaccines, [VET_FAQ] for common questions, or [PET_NUTRITION] for food.
2. Answer using 2-4 bullet points (•). No colons after headers.
3. End with: "Always consult a local vet in Sri Lanka for personalized advice."
4. Do NOT use markdown symbols like * or #. Plain text only.
5. Answer ONLY what the user asked. Be concise.

Context (use only if relevant):
{context}

User Question: {input}

Dr. Sara's Response:"""
    )
    
    # Load vector store with absolute path
    base_dir = Path(__file__).resolve().parent
    persist_dir = base_dir / "sql_chroma_db"
    
    from langchain_community.vectorstores import FAISS
    embedding = FastEmbedEmbeddings(cache_dir=str(base_dir / ".fastembed_cache"))
    
    # Load if exists
    if persist_dir.exists():
        vector_store = FAISS.load_local(
            str(persist_dir), 
            embedding, 
            allow_dangerous_deserialization=True
        )
        retriever = vector_store.as_retriever(
            search_type="similarity",
            # k=2: small model (1b) gets confused with too many docs; 2 is enough
            search_kwargs={"k": 2},
        )
    else:
        # Fallback if no vector store found
        retriever = None

    document_chain = create_stuff_documents_chain(model, prompt)
    
    if retriever:
        _CACHED_CHAIN = create_retrieval_chain(retriever, document_chain)
    else:
        # Minimal chain if DB missing
        _CACHED_CHAIN = document_chain
        
    return _CACHED_CHAIN

def ask(query: str, **kwargs):
    q = (query or "").strip()
    
    # Sub-category Specific Advice
    emergency_map = {
        r"bleed": "🩸 **Bleeding**: Apply firm, direct pressure to the wound with a clean cloth. Do not apply a tourniquet unless you know how.",
        r"poison": "🧪 **Poisoning**: If your pet ingested something toxic, do not induce vomiting unless specifically told by a vet. Bring the packaging with you.",
        r"seizure": "🌀 **Seizure**: Move all furniture and hard objects away from your pet. Do not try to hold their head or tongue.",
        r"chok": "🦴 **Choking**: Gently open the mouth and try to clear the object, being careful not to get bitten. Do not push the object deeper.",
        r"breath": "🫁 **Respiratory Distress**: Check if the airway is clear. Keep your pet upright and avoid stressing them further.",
        r"unconscious": "💤 **Unconscious**: Check if your pet is breathing. Keep them in a flat position and transport immediately.",
        r"snake": "🐍 **Snake Bite**: Keep your pet extremely still to prevent the venom from spreading. Do not cut the wound.",
        r"dying": "⚠️ **Critical Condition**: Every second counts. Focus on getting them into a vehicle now."
    }

    # Detect if any emergency keyword hit
    detected_advice = []
    for pattern, advice in emergency_map.items():
        if re.search(pattern, q, re.I):
            detected_advice.append(advice)

    if detected_advice:
        specific_str = "\n".join(detected_advice)
        return (
            "[DISEASE_AND_FIRST_AID]\n"
            "🚨 **EMERGENCY DETECTED**\n\n"
            "I understand this is urgent. Please take these immediate actions:\n\n"
            f"{specific_str}\n\n"
            "**Next Steps:**\n"
            "1. **Stay calm** - Your pet needs your focus.\n"
            "2. **Call an emergency vet NOW** (Colombo: 011-2694533).\n"
            "3. **Do not wait** - Immediate professional care is vital.\n"
            "4. **Transport safely** - Keep your pet warm and still.\n\n"
            "⚠️ Seek veterinary care immediately."
        )

    # Basic Conversational Handling
    if re.search(r"\b(thanks?|thank you|thx|ty)\b", q, re.I):
        return "You're welcome! I'm here to help you and your pet. Do you have any other questions?"
    if re.search(r"\b(hi|hello|hey)\b", q, re.I) and len(q.split()) <= 3:
        return "Hello! I'm Dr. Sara. How can I assist you with your pet's health today?"
    if re.search(r"\b(bye|goodbye|see you)\b", q, re.I) and len(q.split()) <= 3:
        return "Goodbye! Wishing you and your pet a healthy day ahead."

    try:
        chain = get_rag_chain()
        
        # Ignore tag_only override modifying the prompt for inference, 
        # as it heavily poisons the 1b model's logic rules.
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(chain.invoke, {"input": query})
            # llama3.2:1b can take ~60s on first load; 120s gives enough headroom
            result = future.result(timeout=120)
        
        if isinstance(result, dict):
            response = result.get("answer", result.get("output", str(result)))
        else:
            response = str(result)
            
    except concurrent.futures.TimeoutError:
        print("\n[CRITICAL] Error in Dr. Sara RAG chain: Timed out waiting for Ollama response (>120s)")
        return "The AI model is taking longer than expected to load. Please wait a moment and try again."
    except Exception as e:
        # Return friendly message and log issue for debugging
        error_msg = str(e)
        error_type = type(e).__name__
        print(f"\n[CRITICAL] Error in Dr. Sara RAG chain: [{error_type}] {error_msg}")
        
        if "allocate" in error_msg.lower() or "memory" in error_msg.lower():
            return "Ollama is running low on memory. Please close other apps and restart Ollama, or try again in a moment."
        
        if "10061" in error_msg or "Connection refused" in error_msg:
            return "I can't reach the AI server right now. Please ensure Ollama is running on your computer."

        return f"I'm experiencing high traffic right now. Please try again in a moment."

    # Clean up response
    def _clean_response(text):
        if not isinstance(text, str):
            text = str(text)
        s = text.strip()
        
        # 1. Standardize and split all bullet marks (•, *, -)
        # Force a newline before any bullet that isn't at the start of the string
        s = re.sub(r'([^\n])\s*[•*-]\s+', r'\1\n• ', s)
        s = re.sub(r'^[•*-]\s+', '• ', s)

        # 2. Catch known tags even without brackets and force them to be bracketed and on their own line
        known_tags = ['HEALTH_GUIDELINES', 'VACCINATION_SCHEDULES', 'VET_FAQ', 'PET_NUTRITION']
        for tag in known_tags:
            # Match tag if it's at start or after whitespace, and NOT already bracketed
            s = re.sub(rf'(?<!\[)\b{tag}\b(?!\])', f'[{tag}]', s)
        
        # 3. Ensure bracketed tags (e.g., [VET_FAQ]) are on their own line with spacing
        s = re.sub(r'\[([A-Z_]+)\]', r'\n[\1]\n', s)

        # 4. Strip all '#', leftovers '*', and COLONS on their own line
        s = re.sub(r'[#*]+', '', s)
        s = re.sub(r'(?m)^\s*:\s*$', '', s) # Remove line with only a colon

        # 5. Cleanup filler
        s = re.sub(r'(?i)^\s*(answer[:\-\s]*)', '', s).strip()
        s = re.sub(r'(?i)^based on the provided context[,:]?\s*', '', s).strip()
        
        # 6. Ensure single newline before numbering (e.g. 1.)
        s = re.sub(r'([^\n])\s*(\d+\.)\s+', r'\1\n\2 ', s)
        
        # 7. Clean up multiple newlines to stay concise (max 2)
        s = re.sub(r'\n{3,}', '\n\n', s)
        
        # 8. Remove any prompt leakage
        s = s.split("[/Instructions]")[0].strip() if "[/Instructions]" in s else s
        return s.strip()

    return _clean_response(response)
