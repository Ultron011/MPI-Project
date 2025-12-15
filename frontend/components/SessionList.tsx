"use client";

import { useState, useEffect } from 'react';
import UploadModal from './UploadModal'

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

    const handleDeleteSession = async (sessionId: number, sessionName: string) => {
        // Confirm deletion
        const confirmed = window.confirm(
            `Are you sure you want to delete "${sessionName}"?\n\nThis will permanently delete the session and all its documents. This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`http://localhost:8000/api/sessions/${sessionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Refresh the sessions list
                fetchSessions();
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
            'bg-blue-100 text-blue-700',
            'bg-green-100 text-green-700',
            'bg-purple-100 text-purple-700',
            'bg-pink-100 text-pink-700',
            'bg-yellow-100 text-yellow-700',
            'bg-cyan-100 text-cyan-700',
        ];
        return colors[index % colors.length];
    };

    return (
        <>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Hello, {userName}!</h2>
                        <p className="text-gray-600 mt-1">Ready to study smarter?</p>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <span className="text-xl">+</span>
                        New Session
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search sessions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
                    </div>
                </div>

                {/* Sessions List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="text-gray-600">Loading sessions...</p>
                    </div>
                ) : filteredSessions.length > 0 ? (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Your Sessions ({filteredSessions.length})
                        </h3>

                        {filteredSessions.map((session, index) => (
                            <div
                                key={session.id}
                                onClick={() => onSelectSession(session)}
                                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${getSessionColor(index)} rounded-lg flex items-center justify-center text-2xl`}>
                                            {getSessionIcon(index)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {session.name}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {session.document_count} document{session.document_count !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-gray-500">
                                        <span>{new Date(session.updated_at).toLocaleDateString()}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSession(session.id, session.name);
                                            }}
                                            className="text-gray-400 hover:text-red-600"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions yet</h3>
                        <p className="text-gray-600 mb-6">Create your first study session to get started!</p>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
                        >
                            Create New Session
                        </button>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <UploadModal
                    onClose={() => setShowUploadModal(false)}
                    onUploadComplete={(sessionId: number) => {
                        setShowUploadModal(false);
                        fetchSessions(); // Refresh the list
                        // Fetch the session details and pass the full object
                        const newSession = sessions.find(s => s.id === sessionId);
                        if (newSession) {
                            onSelectSession(newSession);
                        }
                    }}
                    onCreateSession={handleCreateSession}
                />
            )}
        </>
    );
}
