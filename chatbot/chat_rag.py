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
    model = ChatOllama(
        model="llama3.2:1b",
        temperature=0.1,
        num_ctx=2048
    )
    
    # Direct and efficient prompt for Dr. Sara (llama3.2:1b optimized)
    prompt = PromptTemplate.from_template(
        """
        [Role]
        You are Dr. Sara, an AI veterinarian for PawPal (Sri Lanka).
        Your mission is to provide helpful, safe, and accurate advice to pet owners.
        
        [Guidelines]
        1. SEARCH THE CONTEXT FIRST: If the answer is found in the "Context" below, use it as your primary source.
        2. USE YOUR OWN KNOWLEDGE: If the answer is NOT in the context, use your professional veterinary knowledge to answer directly.
        3. STRUCTURE & FORMATTING (CRITICAL):
           - Use plain bullet points with the "•" symbol.
           - NEVER use asterisks (*) or hash symbols (#) for lists or formatting.
           - Use EXACTLY TWO newlines between every paragraph or section to ensure clear, vertical separation.
           - Headers should be plain text on their own line, NOT preceded by symbols.
           - Each bullet point or numbered item must be on its own line.
        4. BE DIRECT: Start answering the question directly with a friendly tone. Do not use filler phrases like "Based on the context...".
        5. PETS ONLY: Only answer questions about animals and pet health.
        6. SAFETY: Always remind users to consult a local veterinarian in Sri Lanka.
        7. DOMAIN TAGGING (MANDATORY): Begin EVERY response with the appropriate domain header on its own line:
           [HEALTH_GUIDELINES], [VACCINATION_SCHEDULES], [VET_FAQ], or [PET_NUTRITION].
        
        Context:
        {context}
        
        User Question: {input}
        
        Dr. Sara's Response:
        """
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
            search_kwargs={"k": 5},
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
            # Added a 45-second timeout so the execution does not hang forever if Ollama stalls
            result = future.result(timeout=45)
        
        if isinstance(result, dict):
            response = result.get("answer", result.get("output", str(result)))
        else:
            response = str(result)
            
    except Exception as e:
        # Return friendly message and log issue without cluttering console for user
        print(f"Error in RAG chain: {e}")
        return "I'm experiencing high traffic right now. Please try again or contact support."

    # Clean up response
    def _clean_response(text):
        if not isinstance(text, str):
            text = str(text)
        s = text.strip()
        
        # 1. Standardize all bullet marks (•, *, -) into a unique internal placeholder
        s = re.sub(r'(?m)(?:^|\s+)[•*-]\s+', ' __BT__ ', s)

        # 2. Strip all '#' and leftovers '*' symbols (bolding/headers)
        s = re.sub(r'[#*]+', '', s)

        # 3. Cleanup filler
        s = re.sub(r'(?i)^\s*(answer[:\-\s]*)', '', s).strip()
        s = re.sub(r'(?i)^based on the provided context[,:]?\s*', '', s).strip()
        
        # 4. Convert placeholders into "•" with mandatory double newlines
        s = re.sub(r'\s*__BT__\s+', '\n\n• ', s)
        
        # 5. Ensure double newlines before numbering (e.g. 1.)
        s = re.sub(r'([^\n])\s*(\d+\.)\s+', r'\1\n\n\2 ', s)
        
        # 6. Clean up spacing (max 2 newlines)
        s = re.sub(r'\n{3,}', '\n\n', s)
        
        # 7. Corner case fix for starting bullet
        if s.startswith('•') or s.startswith(' __BT__ '):
            s = re.sub(r'^ __BT__ ', '• ', s)
        elif text.strip().startswith(('•', '*', '-')):
            if not s.startswith('• '):
                s = '• ' + s.strip()

        # Remove any lingering prompt tags if AI leaks them
        s = s.split("[/Instructions]")[0].strip() if "[/Instructions]" in s else s
        return s.strip()

    return _clean_response(response)
