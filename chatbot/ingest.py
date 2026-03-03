import sys
from pathlib import Path
import json
# from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyPDFLoader, TextLoader, JSONLoader
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

def ingest():
    base_dir = Path(__file__).resolve().parent.parent
    pdf_dir = base_dir / "pdf"
    pet_data_dir = base_dir / "Backend" / "pet_data"
    persist_dir = base_dir / "chatbot" / "sql_chroma_db"

    all_docs = []
    
    # # 1. Ingest all PDFs
    # if pdf_dir.exists():
    #     print(f"Reading PDFs from {pdf_dir}...")
    #     for pdf_file in pdf_dir.glob("*.pdf"):
    #         try:
    #             loader = PyPDFLoader(str(pdf_file))
    #             all_docs.extend(loader.load())
    #             print(f"  [OK] Loaded {pdf_file.name}")
    #         except Exception as e:
    #             print(f"  [ERROR] Loading {pdf_file.name}: {e}")

    # 2. Ingest JSON and TXT from pet_data
    if pet_data_dir.exists():
        print(f"Reading pet data from {pet_data_dir}...")
        for data_file in pet_data_dir.iterdir():
            try:
                if data_file.suffix == '.txt':
                    loader = TextLoader(str(data_file), encoding='utf-8')
                    all_docs.extend(loader.load())
                    print(f"  [OK] Loaded {data_file.name}")
                elif data_file.suffix == '.json':
                    with open(data_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            for item in data:
                                content = ""
                                if 'question' in item and 'answer' in item:
                                    content = f"Question: {item['question']}\nAnswer: {item['answer']}"
                                else:
                                    content = json.dumps(item)
                                all_docs.append(Document(page_content=content, metadata={"source": data_file.name}))
                    print(f"  [OK] Loaded {data_file.name}")
            except Exception as e:
                print(f"  [ERROR] Loading {data_file.name}: {e}")

    if not all_docs:
        print("No documents found to ingest!")
        return

    # Split documents
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(all_docs)
    print(f"Split {len(all_docs)} documents into {len(chunks)} chunks.")

    # Create vector store in batches to avoid OOM
    embedding = FastEmbedEmbeddings()
    print(f"Persisting to {persist_dir}...")
    
    from langchain_community.vectorstores import FAISS
    
    # Process in smaller batches
    batch_size = 50
    vector_store = None
    
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        print(f"  Adding batch {i // batch_size + 1} ({len(batch)} chunks)...")
        if vector_store is None:
            vector_store = FAISS.from_documents(batch, embedding)
        else:
            vector_store.add_documents(batch)
            
    if vector_store:
        vector_store.save_local(str(persist_dir))
        print(f"[OK] Ingestion complete. {len(chunks)} chunks persisted.")
    else:
        print("❌ No documents found to persist.")

if __name__ == "__main__":
    ingest()