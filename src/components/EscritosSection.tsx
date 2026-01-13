'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Document {
  id: string;
  name: string;
  filename: string;
  size: number | null;
  category: string;
  createdAt: string;
}

export default function EscritosSection() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading documents:', e);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('category', 'formato');

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        await loadDocuments();
        setShowUpload(false);
      } else {
        alert('Error: ' + (data.error || 'No se pudo subir'));
      }
    } catch (e) {
      alert('Error al subir archivo');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = async (doc: Document) => {
    window.open(`/api/documents/${doc.id}`, '_blank');
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`¿Eliminar "${doc.name}"?`)) return;
    try {
      await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
      await loadDocuments();
    } catch (e) {
      alert('Error al eliminar');
    }
  };

  const createBlankDoc = async () => {
    // Crear documento Word en blanco usando la API
    const formData = new FormData();
    const blob = new Blob([''], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const file = new File([blob], 'documento_nuevo.docx', { type: blob.type });
    formData.append('file', file);
    formData.append('name', 'Documento en blanco');
    formData.append('category', 'escrito');

    try {
      const res = await fetch('/api/documents', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        window.open(`/api/documents/${data.document.id}`, '_blank');
      }
    } catch (e) {
      alert('Error al crear documento');
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src="/btn-escrito.jpg" alt="Escrito" className="w-12 h-12 rounded-xl object-cover" />
          <h2 className="text-xl font-bold text-stone-800">Escritos</h2>
        </div>
      </div>

      {/* Opciones principales */}
      <div className="space-y-3 mb-6">

        <button onClick={() => setShowUpload(!showUpload)}
          className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition border border-blue-200 text-left">
          <span className="text-2xl">📤</span>
          <div>
            <p className="font-semibold text-blue-800">Subir formato</p>
            <p className="text-sm text-blue-600">Cargar plantilla desde PC o cel</p>
          </div>
        </button>

        {showUpload && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 animate-fadeIn">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc,.pdf"
              onChange={handleUpload}
              disabled={uploading}
              className="w-full text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:font-medium hover:file:bg-blue-600"
            />
            {uploading && <p className="text-sm text-blue-600 mt-2">Subiendo...</p>}
          </div>
        )}

        <button onClick={createBlankDoc}
          className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-stone-50 to-stone-100 hover:from-stone-100 hover:to-stone-200 rounded-xl transition border border-stone-200 text-left">
          <span className="text-2xl">📝</span>
          <div>
            <p className="font-semibold text-stone-800">Documento en blanco</p>
            <p className="text-sm text-stone-600">Descargar Word vacío</p>
          </div>
        </button>
      </div>

      {/* Lista de documentos */}
      <div className="border-t border-stone-200 pt-4">
        <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
          📁 Mis documentos
          <span className="text-xs bg-stone-100 px-2 py-0.5 rounded-full">{documents.length}</span>
        </h3>

        {loading ? (
          <p className="text-stone-400 text-center py-4">Cargando...</p>
        ) : documents.length === 0 ? (
          <p className="text-stone-400 text-center py-4 text-sm">No hay documentos guardados</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {documents.map(doc => (
              <div key={doc.id}
                className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 hover:border-stone-300 transition">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-lg">{doc.filename.endsWith('.pdf') ? '📕' : '📄'}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-stone-800 truncate">{doc.name}</p>
                    <p className="text-xs text-stone-500">{formatSize(doc.size)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDownload(doc)}
                    className="px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition">
                    ⬇️
                  </button>
                  <button onClick={() => handleDelete(doc)}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
