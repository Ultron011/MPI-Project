# 🧠 AI Study Buddy

**AI Study Buddy** is a powerful web application designed to transform how students interact with their study materials. By leveraging advanced AI, it turns static textbooks, lecture notes, and articles into an interactive "Study Partner" that can summarize, quiz, and answer questions 24/7.

---

## 🚀 Features

### ✅ Implemented (MVP)
*   **📄 Multi-Format Ingestion**: Upload PDF documents and text files directly to the platform.
*   **🤖 Interactive Chat (RAG)**: Chat with your documents! Ask questions about your uploads and get instant, cited answers based on the content using Retrieval-Augmented Generation.
*   **📝 Instant Summaries**: Get concise AI-generated summaries of complex topics or entire files.
*   **🎴 Flashcards**: Basic flashcard view to test your knowledge (powered by AI).
*   **📂 Drag-and-Drop Interface**: Modern, intuitive UI for easy file management.

### 🔮 Roadmap (Planned)
*   **Video/Audio Processing**: Transcribe MP4/MP3 files (lectures, YouTube videos) into text for querying.
*   **Quiz Generator**: Automatically generate multiple-choice and short-answer quizzes from course material.
*   **User Accounts**: Save your history, courses, and progress with Supabase Auth.
*   **Deep Research Mode**: Connect to external web sources for broader context.

---

## 🛠️ Tech Stack

This project uses a modern, high-performance stack optimized for AI applications:

### **Frontend**
*   **Framework**: [Next.js 14](https://nextjs.org/) (React, TypeScript)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: Lucide React

### **Backend**
*   **API**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   **AI orchestration**: OpenAI API (GPT-4o) + LangChain (conceptually)
*   **PDF Processing**: `pypdf`

### **Data & Infrastructure**
*   **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **Vector Store**: `pgvector` (via Supabase) for RAG support.

---

## 📦 Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
*   Node.js (v18+)
*   Python (v3.9+)
*   Surpabase Project (for DB URL/Key)
*   OpenAI API Key

### 1. Backend Setup
1.  Navigate to the backend:
    ```bash
    cd backend
    ```
2.  Install Python dependencies:
    ```bash
    # (Optional) Create venv first: python -m venv venv && venv\Scripts\activate
    pip install -r requirements.txt
    ```
3.  Configure Environment:
    *   Rename `.env.example` to `.env` (or create one).
    *   Add your keys:
        ```ini
        OPENAI_API_KEY=sk-...
        SUPABASE_URL=https://your-project.supabase.co
        SUPABASE_KEY=your-anon-key
        ```
4.  Run the API Server:
    ```bash
    python -m uvicorn main:app --reload
    ```
    *   Server running at: `http://localhost:8000`

### 2. Frontend Setup
1.  Navigate to the frontend:
    ```bash
    cd frontend
    ```
2.  Install Node packages:
    ```bash
    npm install
    ```
3.  Run the Development Server:
    ```bash
    npm run dev
    ```
    *   App running at: `http://localhost:3000`

---

## 🤝 Contributing
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---

## 📄 License
This project is open-source and available under the MIT License.
