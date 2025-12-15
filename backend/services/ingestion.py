from fastapi import UploadFile
from pypdf import PdfReader
import io

async def process_pdf(file: UploadFile):
    """
    Reads a PDF file and extracts text.
    """
    content = await file.read()
    reader = PdfReader(io.BytesIO(content))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    return text

def chunk_text(text: str, chunk_size: int = 1000):
    """
    Splits text into chunks for embedding.
    """
    chunks = []
    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i + chunk_size])
    return chunks
