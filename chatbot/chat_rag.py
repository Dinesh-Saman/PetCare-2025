import re
import json
from pathlib import Path
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_retrieval_chain

def rag_chain():
    # Consistency: Low temperature for deterministic answers
    model = ChatOllama(
        model="llama3.2",
        temperature=0.1,
        num_ctx=4096
    )
    
    # Grounded Prompting for Dr. Sara
    prompt = PromptTemplate.from_template(
        """
        [System]
        You are Dr. Sara, an AI veterinary assistant for Pawpal (Sri Lanka). 
        Your primary duty is to provide safe, accurate, and evidence-based pet care advice using ONLY the context provided below.
        
        [Safety Protocol]
        - If the user describes a life-threatening emergency (e.g., snake bite, severe bleeding), advise immediate veterinary visit.
        - NEVER recommend human medications (like Ibuprofen or Chocolate) unless specified in the context.
        
        [Constraints]
        1. Contextual Integrity: Use ONLY the provided context. Do NOT use outside knowledge.
        2. Unavailability: If the answer is not in the context, explicitly state: "I'm sorry, my current knowledge on that specific topic is limited. I recommend consulting a veterinarian at a registered Sri Lankan clinic for a precise diagnosis."
        3. Local Context: Sri Lanka has high incidences of Rabies and Leptospirosis. If relevant, mention these local risks.
        4. Tone: Compassionate, professional, and concise.
        
        Context:
        {context}
        
        User Question: {input}
        
        Dr. Sara's Response:
        """
    )
    
    # Load vector store with absolute path
    base_dir = Path(__file__).resolve().parent
    persist_dir = base_dir / "sql_chroma_db"
    
    embedding = FastEmbedEmbeddings()
    vector_store = Chroma(persist_directory=str(persist_dir), embedding_function=embedding)

    # Enhanced Retrieval (k=5)
    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5},
    )

    document_chain = create_stuff_documents_chain(model, prompt)
    chain = create_retrieval_chain(retriever, document_chain)
    
    return chain

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
        chain = rag_chain()
        result = chain.invoke({"input": query})
        response = result.get("answer", "No response generated.")
    except Exception as e:
        print(f"Error in RAG chain: {e}")
        return "I'm experiencing a technical issue right now. Please try again or contact support."

    # Clean up response
    def _clean_response(text):
        s = text.strip()
        s = re.sub(r'(?i)^\s*(answer[:\-\s]*)', '', s).strip()
        s = re.sub(r'(?i)^based on the provided context[,:]?\s*', '', s).strip()
        # Remove any lingering prompt tags if AI leaks them
        s = s.split("[/Instructions]")[0].strip() if "[/Instructions]" in s else s
        return s

    return _clean_response(response)
