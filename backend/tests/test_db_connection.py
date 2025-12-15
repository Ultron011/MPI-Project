import os
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

async def test_connection():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    if not url or not key:
        print("❌ Error: SUPABASE_URL or SUPABASE_KEY not found in .env")
        return

    print(f"Connecting to Supabase at: {url}...")
    
    try:
        supabase: Client = create_client(url, key)
        
        # 1. Test basic connection by querying the table (even if empty)
        print("Testing 'documents' table access...")
        response = supabase.table("documents").select("*").limit(1).execute()
        print("✅ Connection successful! Table 'documents' found.")
        
        # 2. Test if vector extension and function exist (by trying a dummy RPC call)
        # Note: This might fail if the function expects exact arguments, but we just want to see if it errors on 'function not found'
        print("Testing 'match_documents' RPC function...")
        try:
            # Passing dummy values. The database might return empty or error on dimensions, 
            # but if it says 'function not found', we know setup is incomplete.
            # 1536 dim dummy vector
            dummy_vector = [0.0] * 1536
            params = {
                "query_embedding": dummy_vector,
                "match_threshold": 0.5,
                "match_count": 1
            }
            supabase.rpc("match_documents", params).execute()
            print("✅ RPC 'match_documents' is callable.")
        except Exception as e:
            # If the error is about dimensions or empty results, that's fine. 
            # If it's "function does not exist", that's the issue.
            error_msg = str(e)
            if "function" in error_msg and "does not exist" in error_msg:
                print("❌ Error: Function 'match_documents' not found. Did you run the SQL setup?")
            else:
                 print(f"✅ RPC call attempted (Result/Error: {error_msg}). This usually means the function exists.")

    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("Hint: Check your database URL, Key, or if the 'documents' table exists.")

if __name__ == "__main__":
    asyncio.run(test_connection())
