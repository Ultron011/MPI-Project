"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function UploadModal({ onClose, onUploadComplete, onCreateSession }: {
    onClose: () => void;
    onUploadComplete?: (sessionId: number) => void;
    onCreateSession: (name: string) => Promise<number | null>;
}) {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [sessionName, setSessionName] = useState('');
    const [step, setStep] = useState<'name' | 'upload'>('name');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
    });

    const handleNext = () => {
        if (sessionName.trim()) {
            setStep('upload');
        }
    };

    const handleUpload = async () => {
        if (uploadedFiles.length === 0 || !sessionName.trim()) return;

        setUploading(true);

        try {
            // 1. Create session first
            const sessionId = await onCreateSession(sessionName);

            if (!sessionId) {
                throw new Error('Failed to create session');
            }

            // 2. Upload files to the session
            for (const file of uploadedFiles) {
                const formData = new FormData();
                formData.append('file', file);

                await fetch(`http://localhost:8000/api/study/upload?session_id=${sessionId}`, {
                    method: 'POST',
                    body: formData,
                });
            }

            setUploading(false);
            setUploadComplete(true);

            // Auto-redirect after 1 second
            setTimeout(() => {
                if (onUploadComplete) {
                    onUploadComplete(sessionId);
                }
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Upload failed:', error);
            setUploading(false);
            alert('Upload failed. Please try again.');
        }
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {uploadComplete ? 'Session Created!' : step === 'name' ? 'Create New Session' : 'Upload Files'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {!uploadComplete ? (
                        <>
                            {step === 'name' ? (
                                /* Step 1: Name the Session */
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Session Name
                                        </label>
                                        <input
                                            type="text"
                                            value={sessionName}
                                            onChange={(e) => setSessionName(e.target.value)}
                                            placeholder="e.g., Biology 101, Math Finals, History Notes..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <p className="text-sm text-blue-800">
                                            💡 <strong>Tip:</strong> Give your session a descriptive name so you can easily find it later!
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        disabled={!sessionName.trim()}
                                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Continue to Upload
                                    </button>
                                </div>
                            ) : (
                                /* Step 2: Upload Files */
                                <>
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                        <p className="text-sm text-gray-700">
                                            <strong>Session:</strong> {sessionName}
                                        </p>
                                    </div>

                                    {/* Dropzone */}
                                    <div
                                        {...getRootProps()}
                                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
                      ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}
                                    >
                                        <input {...getInputProps()} />
                                        <div className="text-5xl mb-4">📄</div>
                                        {isDragActive ? (
                                            <p className="text-lg font-medium text-blue-600">Drop your files here...</p>
                                        ) : (
                                            <>
                                                <p className="text-lg font-medium text-gray-700 mb-2">
                                                    Drag & drop your PDF files here
                                                </p>
                                                <p className="text-sm text-gray-500">or click to browse</p>
                                            </>
                                        )}
                                    </div>

                                    {/* Uploaded Files List */}
                                    {uploadedFiles.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-gray-900">Files to upload ({uploadedFiles.length})</h4>
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">📄</span>
                                                        <span className="text-sm font-medium text-gray-700">{file.name}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFile(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload Button */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setStep('name')}
                                            className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-medium"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploadedFiles.length === 0 || uploading}
                                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {uploading ? '⏳ Uploading...' : `Upload ${uploadedFiles.length} file(s)`}
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        /* Upload Complete State */
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">✅</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Session Created!</h3>
                            <p className="text-gray-600 mb-2">
                                <strong>{sessionName}</strong>
                            </p>
                            <p className="text-gray-600 mb-6">
                                Your files have been successfully uploaded and processed.
                            </p>
                            <p className="text-sm text-gray-500">Redirecting to session...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
