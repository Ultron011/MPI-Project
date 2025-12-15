# Project Report: AI Study Buddy

## 1. Introduction
The **AI Study Buddy** is an advanced educational web application designed to assist students in understanding complex course materials. By leveraging Large Language Models (LLMs) and Retrieval-Augmented Generation (RAG), the system acts as a personalized tutor available 24/7. It transforms static documents (PDFs, notes) into an interactive knowledge base.

## 2. Problem Statement
*   **Information Overload**: Students often struggle to process large volumes of text from textbooks and research papers.
*   **Lack of Immediate Feedback**: Traditional study methods do not provide instant answers to specific doubts outside of classroom hours.
*   **Passive Learning**: Reading static notes is less effective than active engagement techniques like quizzing and flashcards.

## 3. Proposed Solution
The solution is a full-stack web application that allows users to:
1.  **Upload Materials**: Ingest course documents (PDF, Text).
2.  **Interact via Chat**: Ask natural language questions and receive accurate, context-aware answers cited from the source material.
3.  **Generate Study Aids**: Automatically create summaries and flashcards to reinforce learning.

## 4. System Architecture
The application follows a modern microservices-based architecture:

### 4.1 Frontend (User Interface)
*   **Framework**: Next.js 14 (React)
    *   Provides Server-Side Rendering (SSR) for performance and SEO.
*   **Styling**: Tailwind CSS
    *   Ensures a responsive and clean design system.
*   **Key Components**:
    *   `UploadZone`: Drag-and-drop interface for file ingestion.
    *   `ChatInterface`: Real-time chat UI with loading states.
    *   `FlashcardView`: Interactive flip-card component for self-testing.

### 4.2 Backend (API Layer)
*   **Framework**: FastAPI (Python)
    *   Chosen for its high performance (async capabilities) and native support for AI libraries.
*   **Services**:
    *   `Ingestion Service`: Handles file upload, text extraction (OCR), and cleaning.
    *   `RAG Service`: Manages embedding generation and vector database queries.

### 4.3 Data & AI Layer
*   **LLM Provider**: OpenAI (GPT-4o)
    *   The core "brain" responsible for understanding queries and synthesizing answers.
*   **Vector Database**: Supabase (PostgreSQL + pgvector)
    *   Stores high-dimensional vector embeddings of document chunks for semantic search.
*   **Embeddings**: OpenAI `text-embedding-3-small` model.

## 5. Implementation Details (Methodology)

### 5.1 Retrieval-Augmented Generation (RAG) Pipeline
1.  **Document Chunking**: Large PDF files are split into smaller, manageable text chunks (e.g., 1000 characters).
2.  **Embedding Generation**: Each chunk is converted into a vector representation using the embedding model.
3.  **Storage**: Vectors are stored in Supabase with a reference to the original file.
4.  **Retrieval**: When a user asks a question, it is converted to a vector and compared against stored chunks using Cosine Similarity.
5.  **Generation**: The top matching chunks are fed into GPT-4o as "Context" to answer the user's question accurately.

### 5.2 Summarization & Flashcards
*   **Summarization**: The system identifies key themes in the document and prompts the LLM to generate a concise summary.
*   **Flashcards**: The LLM is prompted to extract "Question-Answer" pairs from the text, which are then rendered as interactive cards on the frontend.

## 6. Technologies Used
*   **Language**: TypeScript (Frontend), Python 3.10+ (Backend)
*   **Libraries**: `pypdf`, `openai-python`, `supabase-py`, `lucide-react`, `react-dropzone`.
*   **Tools**: Git, npm, pip.

## 7. Future Scope
*   **Multi-Modal Support**: Integration of OpenAI Whisper to transcribe audio/video lectures.
*   **User Authentication**: Personalized profiles to save chat history and progress.
*   **Community Features**: Sharing flashcard decks and notes with other students.
*   **Mobile Application**: A React Native mobile app for studying on the go.

## 8. Conclusion
The AI Study Buddy successfully demonstrates how Generative AI can be applied to education. By automating the tedious parts of studying (summarizing, searching), it frees up students to focus on deep understanding and active recall.
