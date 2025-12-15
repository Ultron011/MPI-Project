"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, FileText, AlertTriangle, Loader2 } from "lucide-react";

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

export default function ChatInterface({ sessionId }: { sessionId?: number }) {
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
                body: JSON.stringify({ message: input, session_id: sessionId }),
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
        <div className="flex flex-col h-full min-h-[600px] border-2 rounded-xl overflow-hidden bg-card">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                    {messages.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                                💬
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                            <p className="text-sm text-muted-foreground">
                                Ask questions about your documents and I'll help you understand them better.
                            </p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className="space-y-3">
                            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${msg.role === 'user'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm'
                                    : 'bg-muted border-2 rounded-bl-sm text-foreground'
                                    }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>

                            {/* Show sources if available */}
                            {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                                <div className="flex justify-start">
                                    <Card className="max-w-[85%] ml-2 bg-blue-50 border-blue-200">
                                        <CardContent className="p-3">
                                            <details className="text-xs">
                                                <summary className="cursor-pointer font-semibold text-blue-700 flex items-center gap-2 hover:text-blue-800">
                                                    <FileText className="h-3 w-3" />
                                                    {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''} used
                                                </summary>
                                                <div className="mt-3 space-y-2">
                                                    {msg.sources.map((source) => (
                                                        <Card key={source.source_number} className="bg-white border-blue-100">
                                                            <CardContent className="p-2">
                                                                <div className="font-semibold text-blue-800 text-xs mb-1">
                                                                    Source {source.source_number}: {source.filename}
                                                                </div>
                                                                <Badge variant="secondary" className="text-xs mb-1">
                                                                    {(source.similarity * 100).toFixed(1)}% match
                                                                </Badge>
                                                                <p className="text-gray-700 text-xs italic mt-1">
                                                                    "{source.preview}"
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </details>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Show warning if no context was used */}
                            {msg.role === 'assistant' && msg.context_used === false && (
                                <div className="flex justify-start">
                                    <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-800 border-yellow-200">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        No documents found for this question
                                    </Badge>
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <Card className="bg-muted border-2">
                                <CardContent className="p-3 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Thinking...</span>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-background border-t-2">
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Ask a question about your notes..."
                        className="flex-1 h-11"
                        disabled={loading}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
