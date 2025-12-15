from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Initialize Supabase
supabase_url = os.environ.get("SUPABASE_URL", "")
supabase_key = os.environ.get("SUPABASE_KEY", "")
supabase: Client = create_client(supabase_url, supabase_key)

class SessionCreate(BaseModel):
    name: str
    description: Optional[str] = None

class SessionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

@router.get("/sessions")
async def list_sessions():
    """
    Get all sessions with document counts
    """
    try:
        response = supabase.rpc("get_sessions_with_stats").execute()
        return {"sessions": response.data}
    except Exception as e:
        print(f"Error fetching sessions: {e}")
        return {"sessions": []}

@router.post("/sessions")
async def create_session(session: SessionCreate):
    """
    Create a new session
    """
    try:
        response = supabase.table("sessions").insert({
            "name": session.name,
            "description": session.description
        }).execute()
        
        return {"session": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@router.get("/sessions/{session_id}")
async def get_session(session_id: int):
    """
    Get a specific session with its documents
    """
    try:
        # Get session info
        session_response = supabase.table("sessions").select("*").eq("id", session_id).execute()
        
        if not session_response.data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get documents for this session
        docs_response = supabase.table("documents").select("id, metadata").eq("session_id", session_id).execute()
        
        session = session_response.data[0]
        session["documents"] = docs_response.data
        
        return {"session": session}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch session: {str(e)}")

@router.put("/sessions/{session_id}")
async def update_session(session_id: int, session: SessionUpdate):
    """
    Update a session
    """
    try:
        update_data = {}
        if session.name is not None:
            update_data["name"] = session.name
        if session.description is not None:
            update_data["description"] = session.description
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        response = supabase.table("sessions").update(update_data).eq("id", session_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {"session": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update session: {str(e)}")

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: int):
    """
    Delete a session and all its documents
    """
    try:
        response = supabase.table("sessions").delete().eq("id", session_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {"message": "Session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")
