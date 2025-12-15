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
        # Store in DB
        await store_embeddings(file.filename, chunks)
        return {"filename": file.filename, "chunks_processed": len(chunks), "status": "success"}
    else:
        raise HTTPException(status_code=400, detail="Only PDF files are supported currently.")

@router.post("/chat")
async def chat(request: ChatRequest):
    # Context retrieval
    relevant_docs = await query_documents(request.message)
    
    # Check if we found any relevant documents
    if not relevant_docs or len(relevant_docs) == 0:
        return {
            "reply": "I don't have any information about that in your uploaded documents. Please upload relevant study materials first.",
            "sources": [],
            "context_used": False
        }
    
    # Build context from retrieved documents
    context_parts = []
    sources = []
    
    for idx, doc in enumerate(relevant_docs):
        context_parts.append(f"[Source {idx+1}]: {doc['content']}")
        sources.append({
            "source_number": idx + 1,
            "filename": doc.get('metadata', {}).get('file_name', 'Unknown'),
            "similarity": doc.get('similarity', 0),
            "preview": doc['content'][:100] + "..."
        })
    
    context = "\n\n".join(context_parts)
    
    # Enhanced system prompt to ensure LLM only uses provided context
    system_prompt = """You are a helpful study assistant. You MUST follow these rules strictly:

1. ONLY answer questions using the information provided in the context below
2. Answer naturally and conversationally - don't say "According to Source X"
3. If the answer is not in the provided context, say "I don't have information about that in your uploaded documents"
4. Do NOT use your general knowledge - ONLY use the provided context
5. Be direct and helpful - answer as if you're explaining content from the student's own notes

Remember: Your job is to help students understand THEIR materials, not to provide general knowledge."""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context from uploaded documents:\n\n{context}\n\nStudent's Question: {request.message}"}
        ],
        temperature=0.3  # Lower temperature for more focused, factual responses
    )
    
    return {
        "reply": response.choices[0].message.content,
        "sources": sources,
        "context_used": True,
        "num_sources": len(sources)
    }

@router.post("/summary")
async def summarize(request: ChatRequest):
    """
    Summarize the provided text or the last uploaded document context.
    For MVP, we'll just summarize the input message if it's long, or mock it.
    """
    response = openai_client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {"role": "system", "content": "Summarize the following text efficiently."},
            {"role": "user", "content": request.message}
        ]
    )
    return {"summary": response.choices[0].message.content}
