import os
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

async def check_database():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    print("=" * 60)
    print("🔍 Database Debug Tool")
    print("=" * 60)
    
    if not url or not key:
        print("❌ Error: SUPABASE_URL or SUPABASE_KEY not found in .env")
        return
    
    try:
        supabase: Client = create_client(url, key)
        
        # 1. Check if documents table has any data
        print("\n1️⃣ Checking documents table...")
        response = supabase.table("documents").select("*").execute()
        
        if not response.data or len(response.data) == 0:
            print("❌ No documents found in database!")
            print("   This means uploads are not being stored.")
            print("\n💡 Solution: Try uploading a PDF again through the UI")
        else:
            print(f"✅ Found {len(response.data)} document chunks in database")
            print("\n📄 Documents:")
            for idx, doc in enumerate(response.data[:3]):  # Show first 3
                print(f"\n   Document {idx + 1}:")
                print(f"   - ID: {doc.get('id')}")
                print(f"   - Filename: {doc.get('metadata', {}).get('file_name', 'Unknown')}")
                print(f"   - Content preview: {doc.get('content', '')[:100]}...")
                print(f"   - Has embedding: {'Yes' if doc.get('embedding') else 'No'}")
        
        # 2. Test the match_documents function
        print("\n2️⃣ Testing match_documents function...")
        try:
            # Create a dummy embedding (1536 dimensions of zeros)
            dummy_embedding = [0.0] * 1536
            params = {
                "query_embedding": dummy_embedding,
                "match_threshold": 0.0,  # Very low threshold to match anything
                "match_count": 5
            }
            result = supabase.rpc("match_documents", params).execute()
            print(f"✅ match_documents function works!")
            print(f"   Returned {len(result.data)} results")
        except Exception as e:
            print(f"❌ match_documents function error: {e}")
            print("   Make sure you ran the SQL setup script!")
        
        # 3. Test with a real query
        if response.data and len(response.data) > 0:
            print("\n3️⃣ Testing real query...")
            from services.rag import get_embedding
            
            test_query = "name"
            embedding = get_embedding(test_query)
            
            params = {
                "query_embedding": embedding,
                "match_threshold": 0.3,
                "match_count": 5
            }
            result = supabase.rpc("match_documents", params).execute()
            
            print(f"   Query: '{test_query}'")
            print(f"   Results: {len(result.data)} documents found")
            
            if result.data:
                for idx, doc in enumerate(result.data[:2]):
                    print(f"\n   Result {idx + 1}:")
                    print(f"   - Similarity: {doc.get('similarity', 0):.2%}")
                    print(f"   - Content: {doc.get('content', '')[:100]}...")
            else:
                print("   ⚠️ No results found - try lowering match_threshold")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_database())
