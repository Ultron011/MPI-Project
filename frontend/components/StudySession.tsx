"use client";

import { useState } from 'react';
import ChatInterface from './ChatInterface';
import FlashcardView from './FlashcardView';

type Tab = 'notes' | 'summary' | 'flashcards';

export default function StudySession({ sessionId, onBack }: { sessionId: number; onBack: () => void }) {
    const [activeTab, setActiveTab] = useState<Tab>('notes');
    const [showAITutor, setShowAITutor] = useState(true);
    const [summary, setSummary] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [generatingSummary, setGeneratingSummary] = useState(false);
    const [generatingNotes, setGeneratingNotes] = useState(false);

    const tabs = [
        { id: 'notes' as Tab, label: 'Chat with Notes', icon: '💬' },
        { id: 'flashcards' as Tab, label: 'AI Flashcards', icon: '🎴' },
        { id: 'summary' as Tab, label: 'AI Summary', icon: '📋' },
    ];

    const suggestedQuestions = [
        "Summarize the key points",
        "Explain this concept",
        "Create practice questions",
    ];

    const generateSummary = async () => {
        setGeneratingSummary(true);
        try {
            const response = await fetch('http://localhost:8000/api/study/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "Summarize all my uploaded documents", session_id: sessionId }),
            });
            const data = await response.json();
            setSummary(data.summary);
        } catch (error) {
            console.error('Failed to generate summary:', error);
        } finally {
            setGeneratingSummary(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 font-medium">
                            ← Back to Sessions
                        </button>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <h1 className="font-semibold text-gray-900">Study Session</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-green-600 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            Active
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 flex items-center gap-6 border-t">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-2 border-b-2 transition-colors font-medium flex items-center gap-2
                ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Side - Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'notes' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-xl p-8 shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Chat with Your Notes</h2>
                                <p className="text-gray-600 mb-6">
                                    Ask questions about your uploaded documents. The AI will answer based only on your materials.
                                </p>
                                <ChatInterface sessionId={sessionId} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'summary' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-xl p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">AI-Generated Summary</h2>
                                    <button
                                        onClick={generateSummary}
                                        disabled={generatingSummary}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {generatingSummary ? '⏳ Generating...' : '✨ Generate Summary'}
                                    </button>
                                </div>
                                {summary ? (
                                    <div className="prose max-w-none">
                                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{summary}</div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📋</div>
                                        <p className="text-gray-600 mb-4">
                                            Click "Generate Summary" to create a concise summary of your documents
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'flashcards' && (
                        <div className="max-w-2xl mx-auto">
                            <FlashcardView sessionId={sessionId} />
                        </div>
                    )}
                </div>

                {/* Right Side - AI Tutor (only on notes tab) */}
                {activeTab === 'notes' && showAITutor && (
                    <div className="w-96 border-l bg-white flex flex-col">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900">Quick Tips</h3>
                                <button onClick={() => setShowAITutor(false)} className="text-gray-400 hover:text-gray-600">
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">Try asking:</p>
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        className="w-full text-left px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Show AI Tutor Button (when hidden) */}
                {!showAITutor && activeTab === 'notes' && (
                    <button
                        onClick={() => setShowAITutor(true)}
                        className="fixed right-6 bottom-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                    >
                        <span className="text-2xl">💡</span>
                    </button>
                )}
            </div>
        </div>
    );
}
