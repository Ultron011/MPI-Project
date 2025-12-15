"use client";

import { useState } from 'react';
import SessionList from "@/components/SessionList";
import StudySession from "@/components/StudySession";

export default function Home() {
  const [currentSession, setCurrentSession] = useState<number | null>(null);
  const [userName] = useState("Student");

  if (currentSession) {
    return <StudySession sessionId={currentSession} onBack={() => setCurrentSession(null)} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🧠</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">AI Study Buddy</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900">
              <span className="text-xl">🔔</span>
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {userName[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SessionList onSelectSession={setCurrentSession} userName={userName} />
      </div>
    </main>
  );
}
