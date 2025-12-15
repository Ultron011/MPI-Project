import os
from typing import List
from supabase import create_client, Client
from openai import OpenAI
from dotenv import load_dotenv
import logging

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Clients
supabase_url = os.environ.get("SUPABASE_URL", "")
supabase_key = os.environ.get("SUPABASE_KEY", "")
supabase: Client = create_client(supabase_url, supabase_key)

openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))

def get_embedding(text: str) -> List[float]:
    """
    Generates embedding for a given text using OpenAI.
    """
    try:
        logger.info(f"Generating embedding for text of length: {len(text)}")
        response = openai_client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        logger.info("Embedding generated successfully")
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}", exc_info=True)
        raise

async def store_embeddings(file_name: str, chunks: List[str], session_id: int = None):
    """
    Stores text chunks and their embeddings in Supabase.
    """
    try:
        logger.info(f"Storing {len(chunks)} chunks for file: {file_name}, session_id: {session_id}")
        
        if not chunks:
            logger.warning("No chunks to store - empty chunks list")
            return None
        
        data = []
        for idx, chunk in enumerate(chunks):
            logger.info(f"Processing chunk {idx+1}/{len(chunks)} - length: {len(chunk)}")
            
            if not chunk.strip():
                logger.warning(f"Skipping empty chunk {idx+1}")
                continue
            
            embedding = get_embedding(chunk)
            doc_data = {
                "content": chunk,
                "metadata": {"file_name": file_name},
                "embedding": embedding
            }
            if session_id is not None:
                doc_data["session_id"] = session_id
            data.append(doc_data)
        
        if not data:
            logger.error("No valid data to insert - all chunks were empty")
            return None
        
        logger.info(f"Inserting {len(data)} documents into Supabase")
        # Assuming 'documents' table exists with vector column
        response = supabase.table("documents").insert(data).execute()
        logger.info(f"Successfully inserted {len(data)} documents")
        return response
    except Exception as e:
        logger.error(f"Error storing embeddings: {str(e)}", exc_info=True)
        raise

async def query_documents(query: str, match_threshold: float = 0.3, match_count: int = 5, session_id: int = None):
    """
    Searches for relevant documents using vector similarity.
    Required: A Postgres function 'match_documents' in Supabase.
    """
    try:
        logger.info(f"Querying documents: query='{query[:50]}...', session_id={session_id}")
        embedding = get_embedding(query)
        
        # RPC call to Supabase function
        params = {
            "query_embedding": embedding,
            "match_threshold": match_threshold,
            "match_count": match_count,
            "filter_session_id": session_id
        }
        response = supabase.rpc("match_documents", params).execute()
        logger.info(f"Found {len(response.data) if response.data else 0} matching documents")
        return response.data
    except Exception as e:
        logger.error(f"Error querying documents: {str(e)}", exc_info=True)
        raise
