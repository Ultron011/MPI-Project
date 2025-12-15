"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function UploadZone() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setUploadStatus('uploading');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/study/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      setUploadStatus('success');
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  return (
    <div 
      {...getRootProps()} 
      className={`p-10 border-2 border-dashed rounded-xl transition-colors cursor-pointer text-center
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
    >
      <input {...getInputProps()} />
      {uploadStatus === 'uploading' ? (
        <p className="text-blue-600 font-medium">Uploading {fileName}...</p>
      ) : uploadStatus === 'success' ? (
        <p className="text-green-600 font-medium">✓ {fileName} uploaded successfully!</p>
      ) : uploadStatus === 'error' ? (
        <p className="text-red-500 font-medium">Failed to upload {fileName}. Try again.</p>
      ) : (
        <div>
          <p className="text-lg font-medium text-gray-700">Drop your PDF here</p>
          <p className="text-sm text-gray-500 mt-2">or click to select file</p>
        </div>
      )}
    </div>
  );
}
