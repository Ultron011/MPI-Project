"use client";

import { useState } from 'react';

type Source = {
    source_number: number;
    filename: string;
    similarity: number;
    preview: string;
};

type Message = {
    role: 'user' | 'assistant';
    content: string;
    sources?: Source[];
    context_used?: boolean;
};

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/study/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input }),
            });
            const data = await response.json();

            const botMsg: Message = {
                role: 'assistant',
                content: data.reply,
                sources: data.sources || [],
                context_used: data.context_used !== false
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = { role: 'assistant', content: "Sorry, I couldn't process that." };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, idx) => (
                    <div key={idx} className="space-y-2">
                        <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white border rounded-bl-none text-gray-800'
                                }`}>
                                {msg.content}
                            </div>
                        </div>

                        {/* Show sources if available */}
                        {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] ml-2">
                                    <details className="text-xs text-gray-600 bg-blue-50 rounded-lg p-2 border border-blue-200">
                                        <summary className="cursor-pointer font-medium text-blue-700">
                                            📚 {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''} used
                                        </summary>
                                        <div className="mt-2 space-y-2">
                                            {msg.sources.map((source) => (
                                                <div key={source.source_number} className="bg-white p-2 rounded border border-blue-100">
                                                    <div className="font-semibold text-blue-800">
                                                        Source {source.source_number}: {source.filename}
                                                    </div>
                                                    <div className="text-gray-600 text-xs mt-1">
                                                        Similarity: {(source.similarity * 100).toFixed(1)}%
                                                    </div>
                                                    <div className="text-gray-700 text-xs mt-1 italic">
                                                        "{source.preview}"
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </div>
                            </div>
                        )}

                        {/* Show warning if no context was used */}
                        {msg.role === 'assistant' && msg.context_used === false && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] ml-2 text-xs bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full border border-yellow-200">
                                    ⚠️ No documents found for this question
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask a question about your notes..."
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={sendMessage}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
