'use client';

import { useState, useRef } from 'react';
import { saveDocument, generateId } from '@/lib/db';

interface DocumentUploadProps {
  caseId: string;
  onUpload?: () => void;
}

export default function DocumentUpload({ caseId, onUpload }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setMessage(null);

    try {
      let count = 0;
      
      for (const file of Array.from(files)) {
        // Validate file type
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['doc', 'docx', 'pdf'].includes(ext || '')) {
          continue;
        }

        // Read file as ArrayBuffer
        const buffer = await file.arrayBuffer();

        // Save to IndexedDB
        await saveDocument({
          id: generateId(),
          caseId,
          name: file.name,
          type: ext || 'unknown',
          size: file.size,
          data: buffer,
          createdAt: new Date().toISOString(),
        });

        count++;
      }

      setMessage(`${count} documento(s) subido(s)`);
      onUpload?.();
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Error al subir documentos');
    }

    setUploading(false);
    // Reset input
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="mb-4">
      <label className="block">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".doc,.docx,.pdf"
          onChange={handleFiles}
          disabled={uploading}
          className="hidden"
        />
        <span className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 ${uploading ? 'opacity-50' : 'cursor-pointer'} text-white rounded-xl text-sm font-medium transition`}>
          {uploading ? 'Subiendo...' : '📎 Agregar Documento'}
        </span>
      </label>
      
      {message && (
        <p className="text-sm text-slate-500 mt-2">{message}</p>
      )}
      
      <p className="text-xs text-slate-400 mt-1">
        Acepta: .doc, .docx, .pdf
      </p>
    </div>
  );
}
