from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama
# ─── Classic chain constructors (updated) ───
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_retrieval_chain
import re
import json


def rag_chain():
    model = ChatOllama(model="llama3.2")
    #
    prompt = PromptTemplate.from_template(
        """
        <s> [Instructions] You are a concise assistant. Answer the question using ONLY the Context below. Return only the direct answer — no labels, no explanations, and no JSON. If the answer is not in the context, reply exactly: No context available for this question. [/Instructions] </s>
        Question: {input}
        Context: {context}
        Answer:
        """
    )
    #Load vector store
    embedding = FastEmbedEmbeddings()
    vector_store = Chroma(persist_directory="./sql_chroma_db", embedding_function=embedding)

    #Create chain
    retriever = vector_store.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={
            "k": 3,
            "score_threshold": 0.5,
        },
    )

    document_chain = create_stuff_documents_chain(model, prompt)
    chain = create_retrieval_chain(retriever, document_chain)
    #
    return chain

def ask(query: str):
    q = (query or "").strip()
    if re.search(r"\b(thanks?|thank you|thx|ty)\b", q, re.I):
        return "You're welcome! Let me know if you have more questions about pet care."
    if re.search(r"\b(hi|hello|hey)\b", q, re.I) and len(q.split()) <= 3:
        return "Hello! How can I help you with your pet today?"
    if re.search(r"\b(bye|goodbye|see you)\b", q, re.I) and len(q.split()) <= 3:
        return "Goodbye! Feel free to come back if you have more questions about your pet."

    chain = rag_chain()
    
    result = chain.invoke({"input": query})

    response = result.get("answer", "No response generated.")

    def _extract_plain(r):
        s = r.strip() if isinstance(r, str) else str(r)
        try:
            j = json.loads(s)
            def find_first_str(o):
                if isinstance(o, str):
                    return o
                if isinstance(o, dict):
                    for v in o.values():
                        res = find_first_str(v)
                        if res:
                            return res
                if isinstance(o, list):
                    for v in o:
                        res = find_first_str(v)
                        if res:
                            return res
                return None
            text = find_first_str(j)
            if text:
                s = text
        except Exception:
            pass
        s = re.sub(r'(?i)^\s*(answer[:\-\s]*)', '', s).strip()
        m = re.search(r'"response"\s*:\s*"(.+?)"', s, re.DOTALL)
        if m:
            s = m.group(1).strip()
        s = re.sub(r'(?i)^based on the provided context[,:]?\s*', '', s).strip()
        return s

    plain = _extract_plain(response)
    if not plain:
        plain = "No response generated."

    return plain