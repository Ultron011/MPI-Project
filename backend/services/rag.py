import os
from typing import List
from supabase import create_client, Client
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize Clients
supabase_url = os.environ.get("SUPABASE_URL", "")
supabase_key = os.environ.get("SUPABASE_KEY", "")
supabase: Client = create_client(supabase_url, supabase_key)

openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))

def get_embedding(text: str) -> List[float]:
    """
    Generates embedding for a given text using OpenAI.
    """
    response = openai_client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

async def store_embeddings(file_name: str, chunks: List[str]):
    """
    Stores text chunks and their embeddings in Supabase.
    """
    data = []
    for chunk in chunks:
        embedding = get_embedding(chunk)
        data.append({
            "content": chunk,
            "metadata": {"file_name": file_name},
            "embedding": embedding
        })
    
    # Assuming 'documents' table exists with vector column
    response = supabase.table("documents").insert(data).execute()
    return response

async def query_documents(query: str, match_threshold: float = 0.5, match_count: int = 5):
    """
    Searches for relevant documents using vector similarity.
    Required: A Postgres function 'match_documents' in Supabase.
    """
    embedding = get_embedding(query)
    
    # RPC call to Supabase function
    params = {
        "query_embedding": embedding,
        "match_threshold": match_threshold,
        "match_count": match_count
    }
    response = supabase.rpc("match_documents", params).execute()
    return response.data
