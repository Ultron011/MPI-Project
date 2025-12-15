"use client";

import { useState, useEffect } from 'react';
import UploadModal from './UploadModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Trash2, FileText, Calendar } from "lucide-react";

type Session = {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    document_count: number;
};

export default function SessionList({ onSelectSession, userName }: {
    onSelectSession: (session: Session) => void,
    userName: string
}) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteSession, setDeleteSession] = useState<Session | null>(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/sessions');
            const data = await response.json();
            setSessions(data.sessions || []);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async (sessionName: string) => {
        try {
            const response = await fetch('http://localhost:8000/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: sessionName,
                    description: `Created on ${new Date().toLocaleDateString()}`
                }),
            });
            const data = await response.json();
            return data.session.id;
        } catch (error) {
            console.error('Failed to create session:', error);
            return null;
        }
    };

    const handleDeleteSession = async () => {
        if (!deleteSession) return;

        try {
            const response = await fetch(`http://localhost:8000/api/sessions/${deleteSession.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchSessions();
                setDeleteSession(null);
            } else {
                throw new Error('Failed to delete session');
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
            alert('Failed to delete session. Please try again.');
        }
    };

    const filteredSessions = sessions.filter(session =>
        session.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSessionIcon = (index: number) => {
        const icons = ['📚', '🧬', '💻', '📊', '🎨', '🔬', '📖', '🎓'];
        return icons[index % icons.length];
    };

    const getSessionColor = (index: number) => {
        const colors = [
            'from-blue-500 to-cyan-500',
            'from-green-500 to-emerald-500',
            'from-purple-500 to-pink-500',
            'from-orange-500 to-red-500',
            'from-yellow-500 to-amber-500',
            'from-indigo-500 to-blue-500',
        ];
        return colors[index % colors.length];
    };

    return (
        <>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Hello, {userName}! 👋
                        </h2>
                        <p className="text-muted-foreground mt-2">Ready to study smarter with AI?</p>
                    </div>
                    <Button
                        onClick={() => setShowUploadModal(true)}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        New Session
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search sessions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Sessions List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-14 w-14 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-48" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredSessions.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Your Sessions
                            </h3>
                            <Badge variant="secondary">{filteredSessions.length}</Badge>
                        </div>

                        <div className="grid gap-4">
                            {filteredSessions.map((session, index) => (
                                <Card
                                    key={session.id}
                                    className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50"
                                    onClick={() => onSelectSession(session)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className={`w-14 h-14 bg-gradient-to-br ${getSessionColor(index)} rounded-xl flex items-center justify-center text-3xl shadow-md`}>
                                                    {getSessionIcon(index)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                                        {session.name}
                                                    </h4>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <FileText className="h-3 w-3" />
                                                            <span>{session.document_count} document{session.document_count !== 1 ? 's' : ''}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{new Date(session.updated_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteSession(session);
                                                }}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <Card className="border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="text-6xl mb-4">📚</div>
                            <CardTitle className="mb-2">No sessions yet</CardTitle>
                            <CardDescription className="mb-6 text-center">
                                Create your first study session to get started with AI-powered learning!
                            </CardDescription>
                            <Button
                                onClick={() => setShowUploadModal(true)}
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Create New Session
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <UploadModal
                    onClose={() => setShowUploadModal(false)}
                    onUploadComplete={(sessionId: number) => {
                        setShowUploadModal(false);
                        fetchSessions();
                        const newSession = sessions.find(s => s.id === sessionId);
                        if (newSession) {
                            onSelectSession(newSession);
                        }
                    }}
                    onCreateSession={handleCreateSession}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteSession} onOpenChange={() => setDeleteSession(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{deleteSession?.name}</strong> and all its documents.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteSession}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete Session
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
