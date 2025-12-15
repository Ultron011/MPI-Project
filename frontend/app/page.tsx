import UploadZone from "@/components/UploadZone";
import ChatInterface from "@/components/ChatInterface";
import FlashcardView from "@/components/FlashcardView";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <h1 className="text-xl font-bold text-gray-900">AI Study Buddy</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</button>
            <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
              Get Started
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero / Upload Section */}
        <section className="text-center space-y-6">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Study Smarter, Not Harder
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Upload your course materials (PDF) and let our AI generate summaries, quizzes, and answer your questions instantly.
          </p>
          
          <div className="max-w-xl mx-auto mt-8">
            <UploadZone />
          </div>
        </section>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chat Section */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-6 gap-2">
              <span className="p-2 bg-blue-100 rounded-lg text-blue-600">💬</span>
              <h3 className="text-lg font-bold text-gray-900">Chat with your Notes</h3>
            </div>
            <ChatInterface />
          </section>

          {/* Flashcards Section */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-6 gap-2">
              <span className="p-2 bg-green-100 rounded-lg text-green-600">🎴</span>
              <h3 className="text-lg font-bold text-gray-900">Flashcards</h3>
            </div>
            <FlashcardView />
          </section>
        </div>
      </div>
    </main>
  );
}
