import requests
import os

# Check if backend is running
try:
    response = requests.get("http://localhost:8000/")
    print("✅ Backend is running")
except:
    print("❌ Backend is NOT running!")
    print("   Start it with: python -m uvicorn main:app --reload")
    exit(1)

# Check if we have a test PDF
test_file = "test_sample.pdf"
if not os.path.exists(test_file):
    print(f"❌ Test file '{test_file}' not found")
    print("   Run: python create_test_pdf.py")
    exit(1)

print(f"\n📤 Uploading {test_file}...")

# Upload the file
with open(test_file, 'rb') as f:
    files = {'file': (test_file, f, 'application/pdf')}
    response = requests.post('http://localhost:8000/api/study/upload', files=files)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 200:
    print("\n✅ Upload successful!")
    print("\n💡 Now check the database:")
    print("   python debug_db.py")
else:
    print("\n❌ Upload failed!")
    print("Check backend logs for errors")
