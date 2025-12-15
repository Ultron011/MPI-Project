"use client";

import { useState } from 'react';
import ChatInterface from './ChatInterface';
import FlashcardView from './FlashcardView';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageSquare, Sparkles, FileText, Lightbulb, X, Loader2 } from "lucide-react";

type Tab = 'notes' | 'summary' | 'flashcards';

export default function StudySession({ sessionId, onBack }: { sessionId: number; onBack: () => void }) {
    const [activeTab, setActiveTab] = useState<Tab>('notes');
    const [showAITutor, setShowAITutor] = useState(true);
    const [summary, setSummary] = useState<string>('');
    const [generatingSummary, setGeneratingSummary] = useState(false);

    const suggestedQuestions = [
        "Summarize the key points",
        "Explain this concept in simple terms",
        "Create practice questions for me",
        "What are the main takeaways?",
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
                <div className="px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={onBack} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Sessions
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Study Session
                        </h1>
                    </div>

                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                        Active
                    </Badge>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Side - Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                                <TabsTrigger value="notes" className="gap-2 py-3">
                                    <MessageSquare className="h-4 w-4" />
                                    Chat with Notes
                                </TabsTrigger>
                                <TabsTrigger value="flashcards" className="gap-2 py-3">
                                    <Sparkles className="h-4 w-4" />
                                    AI Flashcards
                                </TabsTrigger>
                                <TabsTrigger value="summary" className="gap-2 py-3">
                                    <FileText className="h-4 w-4" />
                                    AI Summary
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="notes" className="space-y-4">
                                <Card className="border-2">
                                    <CardContent className="p-6">
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold mb-2">Chat with Your Notes</h2>
                                            <p className="text-muted-foreground">
                                                Ask questions about your uploaded documents. The AI will answer based only on your materials.
                                            </p>
                                        </div>
                                        <ChatInterface sessionId={sessionId} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="flashcards">
                                <FlashcardView sessionId={sessionId} />
                            </TabsContent>

                            <TabsContent value="summary" className="space-y-4">
                                <Card className="border-2">
                                    <CardContent className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-2">AI-Generated Summary</h2>
                                                <p className="text-muted-foreground">
                                                    Get a comprehensive summary of all your documents
                                                </p>
                                            </div>
                                            <Button
                                                onClick={generateSummary}
                                                disabled={generatingSummary}
                                                size="lg"
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                                            >
                                                {generatingSummary ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="mr-2 h-4 w-4" />
                                                        Generate Summary
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {summary ? (
                                            <div className="prose max-w-none">
                                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-primary/20 rounded-xl p-6">
                                                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{summary}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-16">
                                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                                                    📋
                                                </div>
                                                <h3 className="text-lg font-semibold mb-2">No summary yet</h3>
                                                <p className="text-muted-foreground">
                                                    Click "Generate Summary" to create a concise summary of your documents
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Right Side - AI Tutor (only on notes tab) */}
                {activeTab === 'notes' && showAITutor && (
                    <div className="w-80 border-l bg-white/80 backdrop-blur-sm flex flex-col shadow-lg">
                        <div className="p-6 border-b bg-gradient-to-br from-purple-50 to-blue-50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                        <Lightbulb className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="font-bold">Quick Tips</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowAITutor(false)}
                                    className="h-8 w-8"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4">
                                Try asking these questions:
                            </p>

                            <div className="space-y-2">
                                {suggestedQuestions.map((q, i) => (
                                    <Card
                                        key={i}
                                        className="cursor-pointer hover:shadow-md transition-all bg-white border-2 hover:border-primary/50"
                                    >
                                        <CardContent className="p-3">
                                            <p className="text-sm font-medium text-foreground">{q}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 flex-1">
                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-4">
                                    <p className="text-sm text-blue-800">
                                        💡 <strong>Pro Tip:</strong> Be specific with your questions to get better answers from the AI!
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Show AI Tutor Button (when hidden) */}
                {!showAITutor && activeTab === 'notes' && (
                    <Button
                        onClick={() => setShowAITutor(true)}
                        size="lg"
                        className="fixed right-6 bottom-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        <Lightbulb className="h-6 w-6" />
                    </Button>
                )}
            </div>
        </div>
    );
}
