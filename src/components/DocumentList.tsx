'use client';

import { useState, useEffect } from 'react';
import { getDocumentsByCase, getDocument, deleteDocument, formatFileSize } from '@/lib/db';

interface Document {
  id: string;
  caseId: string;
  name: string;
  type: string;
  size: number;
  data: ArrayBuffer;
  createdAt: string;
}

interface DocumentListProps {
  caseId: string;
  refreshTrigger?: number;
}

export default function DocumentList({ caseId, refreshTrigger }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [caseId, refreshTrigger]);

  const loadDocuments = async () => {
    try {
      const docs = await getDocumentsByCase(caseId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
    setLoading(false);
  };

  const handleDownload = async (docId: string) => {
    try {
      const doc = await getDocument(docId);
      if (!doc) return;

      const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };

      const blob = new Blob([doc.data], { type: mimeTypes[doc.type] || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDelete = async (docId: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    
    try {
      await deleteDocument(docId);
      await loadDocuments();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      default: return '📎';
    }
  };

  if (loading) {
    return <p className="text-slate-400 text-sm">Cargando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p className="text-slate-400 text-sm">Sin documentos</p>;
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <div 
          key={doc.id} 
          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-xl">{getIcon(doc.type)}</span>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{doc.name}</p>
              <p className="text-xs text-slate-500">
                {formatFileSize(doc.size)} • {new Date(doc.createdAt).toLocaleDateString('es-MX')}
              </p>
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleDownload(doc.id)}
              className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition"
              title="Descargar"
            >
              ⬇️
            </button>
            <button
              onClick={() => handleDelete(doc.id, doc.name)}
              className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition"
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
