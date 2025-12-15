from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from services.ingestion import process_pdf, chunk_text
from services.rag import store_embeddings, query_documents, openai_client

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if file.filename.endswith(".pdf"):
        text = await process_pdf(file)
        chunks = chunk_text(text)
        # Store in DB (Wait for DB setup to uncomment)
        # await store_embeddings(file.filename, chunks)
        return {"filename": file.filename, "chunks_processed": len(chunks), "status": "success"}
    else:
        raise HTTPException(status_code=400, detail="Only PDF files are supported currently.")

@router.post("/chat")
async def chat(request: ChatRequest):
    # Context retrieval (mocked for now until DB is ready)
    relevant_docs = [] # await query_documents(request.message)
    
    context = "\n".join([doc['content'] for doc in relevant_docs]) if relevant_docs else "No specific context available."
    
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful study assistant. Use the following context to answer the user's question."},
            {"role": "user", "content": f"Context: {context}\n\nQuestion: {request.message}"}
        ]
    )
    
    return {"reply": response.choices[0].message.content}

@router.post("/summary")
async def summarize(request: ChatRequest):
    """
    Summarize the provided text or the last uploaded document context.
    For MVP, we'll just summarize the input message if it's long, or mock it.
    """
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Summarize the following text efficiently."},
            {"role": "user", "content": request.message}
        ]
    )
    return {"summary": response.choices[0].message.content}
