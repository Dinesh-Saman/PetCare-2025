import re
import json
from pathlib import Path
# from langchain_community.vectorstores import Chroma
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain

# Initialize the chain once globally to improve response speed
_CACHED_CHAIN = None

def get_rag_chain():
    global _CACHED_CHAIN
    if _CACHED_CHAIN is not None:
        return _CACHED_CHAIN

    # Consistency: Low temperature for deterministic answers
    model = ChatOllama(
        model="llama3.2:1b",
        temperature=0.1,
        num_ctx=4096
    )
    
    # Direct and efficient prompt for Dr. Sara (llama3.2:1b optimized)
    prompt = PromptTemplate.from_template(
        """
        [Role]
        You are Dr. Sara, an AI veterinarian for Pawpal (Sri Lanka).
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
    embedding = FastEmbedEmbeddings()
    
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

def ask(query: str):
    q = (query or "").strip()
    
    # Emergency Detection Protocol
    emergency_keywords = [
        r"\bbleeding\b", r"\bpoison\b", r"\bseizure\b", r"\bchoking\b", 
        r"\bnot breathing\b", r"\bunconscious\b", r"\bsnake bite\b", r"\bdying\b"
    ]
    if any(re.search(kw, q, re.I) for kw in emergency_keywords):
        return (
            "🚨 **EMERGENCY DETECTED**\n\n"
            "Please take these immediate steps:\n"
            "1. **Stay calm** - Your pet needs you focused.\n"
            "2. **Call an emergency vet immediately** (Colombo: 011-2694533).\n"
            "3. **Do not wait** - Some conditions like snake bites or poisoning require instant care.\n"
            "4. **Transport safely** - Keep your pet still and warm.\n\n"
            "⚠️ Seek professional veterinary care NOW."
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
        # retrieval_chain usually returns a dict with 'answer'
        # document_chain returns a string or dict depending on configuration
        result = chain.invoke({"input": query})
        
        if isinstance(result, dict):
            response = result.get("answer", result.get("output", str(result)))
        else:
            response = str(result)
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error in RAG chain: {e}")
        return "I'm experiencing a technical issue right now. Please try again or contact support."

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
