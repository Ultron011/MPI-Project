"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";

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
            const sessionId = await onCreateSession(sessionName);

            if (!sessionId) {
                throw new Error('Failed to create session');
            }

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

            setTimeout(() => {
                if (onUploadComplete) {
                    onUploadComplete(sessionId);
                }
                onClose();
            }, 1500);
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
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {uploadComplete ? '✨ Session Created!' : step === 'name' ? 'Create New Session' : 'Upload Files'}
                    </DialogTitle>
                    <DialogDescription>
                        {uploadComplete
                            ? 'Your files have been successfully uploaded and processed.'
                            : step === 'name'
                                ? 'Give your study session a memorable name'
                                : 'Upload PDF files to your session'}
                    </DialogDescription>
                </DialogHeader>

                {!uploadComplete ? (
                    <div className="space-y-6">
                        {step === 'name' ? (
                            /* Step 1: Name the Session */
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="session-name">Session Name</Label>
                                    <Input
                                        id="session-name"
                                        value={sessionName}
                                        onChange={(e) => setSessionName(e.target.value)}
                                        placeholder="e.g., Biology 101, Math Finals, History Notes..."
                                        autoFocus
                                    />
                                </div>

                                <Card className="bg-blue-50 border-blue-200">
                                    <CardContent className="pt-4">
                                        <p className="text-sm text-blue-800">
                                            💡 <strong>Tip:</strong> Give your session a descriptive name so you can easily find it later!
                                        </p>
                                    </CardContent>
                                </Card>

                                <Button
                                    onClick={handleNext}
                                    disabled={!sessionName.trim()}
                                    className="w-full"
                                    size="lg"
                                >
                                    Continue to Upload
                                </Button>
                            </div>
                        ) : (
                            /* Step 2: Upload Files */
                            <div className="space-y-4">
                                <Card className="bg-muted/50">
                                    <CardContent className="pt-4">
                                        <p className="text-sm">
                                            <strong>Session:</strong> {sessionName}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Dropzone */}
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 bg-muted/20'}`}
                                >
                                    <input {...getInputProps()} />
                                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    {isDragActive ? (
                                        <p className="text-lg font-medium text-primary">Drop your files here...</p>
                                    ) : (
                                        <>
                                            <p className="text-lg font-medium text-foreground mb-2">
                                                Drag & drop your PDF files here
                                            </p>
                                            <p className="text-sm text-muted-foreground">or click to browse</p>
                                        </>
                                    )}
                                </div>

                                {/* Uploaded Files List */}
                                {uploadedFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Files to upload ({uploadedFiles.length})</Label>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {uploadedFiles.map((file, index) => (
                                                <Card key={index}>
                                                    <CardContent className="flex items-center justify-between p-3">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                                            <span className="text-sm font-medium">{file.name}</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeFile(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep('name')}
                                    >
                                        ← Back
                                    </Button>
                                    <Button
                                        onClick={handleUpload}
                                        disabled={uploadedFiles.length === 0 || uploading}
                                        className="flex-1"
                                        size="lg"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            `Upload ${uploadedFiles.length} file(s)`
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Upload Complete State */
                    <div className="text-center py-8">
                        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">{sessionName}</h3>
                        <p className="text-muted-foreground mb-6">
                            Your files have been successfully uploaded and processed.
                        </p>
                        <p className="text-sm text-muted-foreground">Redirecting to session...</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
