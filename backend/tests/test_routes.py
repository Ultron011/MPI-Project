import requests
import os
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_root():
    """Test the root endpoint"""
    print("\n🧪 Testing GET / (Root endpoint)...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_upload():
    """Test PDF upload endpoint"""
    print("\n🧪 Testing POST /api/study/upload (Upload PDF)...")
    
    # Create a simple test PDF or use an existing one
    # For now, we'll just show how to test with a file
    test_pdf_path = Path("test_sample.pdf")
    
    if not test_pdf_path.exists():
        print("⚠️  No test PDF found. Skipping upload test.")
        print("   To test: Create a file called 'test_sample.pdf' in the backend folder")
        return None
    
    try:
        with open(test_pdf_path, 'rb') as f:
            files = {'file': ('test_sample.pdf', f, 'application/pdf')}
            response = requests.post(f"{BASE_URL}/api/study/upload", files=files)
        
        print(f"✅ Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_chat():
    """Test chat endpoint"""
    print("\n🧪 Testing POST /api/study/chat (Chat with documents)...")
    try:
        payload = {"message": "What is machine learning?"}
        response = requests.post(f"{BASE_URL}/api/study/chat", json=payload)
        
        print(f"✅ Status: {response.status_code}")
        result = response.json()
        print(f"   Reply: {result.get('reply', 'No reply')[:100]}...")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_summary():
    """Test summary endpoint"""
    print("\n🧪 Testing POST /api/study/summary (Summarize text)...")
    try:
        payload = {
            "message": "Machine learning is a subset of artificial intelligence that focuses on the development of algorithms and statistical models that enable computers to improve their performance on a specific task through experience."
        }
        response = requests.post(f"{BASE_URL}/api/study/summary", json=payload)
        
        print(f"✅ Status: {response.status_code}")
        result = response.json()
        print(f"   Summary: {result.get('summary', 'No summary')[:100]}...")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("🚀 AI Study Buddy - API Route Testing")
    print("=" * 60)
    
    # Check if server is running
    try:
        requests.get(BASE_URL, timeout=2)
    except:
        print("\n❌ Server is not running!")
        print("   Start it with: python -m uvicorn main:app --reload")
        return
    
    results = {
        "Root": test_root(),
        "Chat": test_chat(),
        "Summary": test_summary(),
        "Upload": test_upload()
    }
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    
    for test_name, result in results.items():
        if result is True:
            print(f"✅ {test_name}: PASSED")
        elif result is False:
            print(f"❌ {test_name}: FAILED")
        else:
            print(f"⚠️  {test_name}: SKIPPED")
    
    print("\n💡 Tip: You can also test routes at http://localhost:8000/docs")
    print("   (FastAPI auto-generates interactive API documentation)")

if __name__ == "__main__":
    main()
