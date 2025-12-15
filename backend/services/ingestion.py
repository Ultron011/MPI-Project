from fastapi import UploadFile
from pypdf import PdfReader
import io
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def process_pdf(file: UploadFile):
    """
    Reads a PDF file and extracts text.
    """
    try:
        logger.info(f"Processing PDF: {file.filename}")
        content = await file.read()
        logger.info(f"File size: {len(content)} bytes")
        
        reader = PdfReader(io.BytesIO(content))
        logger.info(f"Number of pages: {len(reader.pages)}")
        
        text = ""
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            logger.info(f"Page {i+1} extracted {len(page_text)} characters")
            text += page_text + "\n"
        
        logger.info(f"Total text extracted: {len(text)} characters")
        
        if not text.strip():
            logger.warning("No text extracted from PDF - PDF might be image-based or encrypted")
            return ""
        
        return text
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}", exc_info=True)
        raise

def chunk_text(text: str, chunk_size: int = 1000):
    """
    Splits text into chunks for embedding.
    """
    if not text or not text.strip():
        logger.warning("Empty text provided for chunking")
        return []
    
    chunks = []
    for i in range(0, len(text), chunk_size):
        chunk = text[i:i + chunk_size].strip()
        if chunk:  # Only add non-empty chunks
            chunks.append(chunk)
    
    logger.info(f"Created {len(chunks)} chunks from text")
    return chunks
