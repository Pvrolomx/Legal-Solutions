'use client';

import { useState, useEffect, useRef } from 'react';
import * as localFS from '@/lib/localFileSystem';

interface LocalFile {
  name: string;
  size: number;
  lastModified: number;
}

type ViewMode = 'list' | 'editor';

export default function EscritosSection() {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFolder, setHasFolder] = useState(false);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  // Editor state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editorContent, setEditorContent] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    const supported = localFS.isSupported();
    setIsSupported(supported);
    
    if (supported) {
      const hasAccess = await localFS.hasAccess();
      if (hasAccess) {
        setHasFolder(true);
        const name = await localFS.getFolderName();
        setFolderName(name);
        await loadFiles();
      }
    }
    setLoading(false);
  };

  const loadFiles = async () => {
    const fileList = await localFS.listFiles();
    setFiles(fileList);
  };

  const handleSelectFolder = async () => {
    if (!isSupported) return;
    const success = await localFS.requestDirectory();
    if (success) {
      setHasFolder(true);
      const name = await localFS.getFolderName();
      setFolderName(name);
      await loadFiles();
    }
  };

  const handleChangeFolder = async () => {
    await localFS.clearSelectedFolder();
    setHasFolder(false);
    setFolderName(null);
    setFiles([]);
  };

  // Nuevo escrito
  const handleNewDoc = () => {
    setEditorContent('');
    setCurrentFileName('');
    setViewMode('editor');
  };

  // Desde archivo
  const handleFromFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setEditorContent(text);
    setCurrentFileName(file.name.replace(/\.[^/.]+$/, '') + '.txt');
    setViewMode('editor');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Editar archivo existente
  const handleEdit = async (fileName: string) => {
    const file = await localFS.getFile(fileName);
    if (file) {
      const text = await file.text();
      setEditorContent(text);
      setCurrentFileName(fileName);
      setViewMode('editor');
    }
  };

  // Guardar documento
  const handleSave = async () => {
    if (!editorContent.trim()) {
      alert('El documento está vacío');
      return;
    }

    let fileName = currentFileName;
    if (!fileName) {
      fileName = prompt('Nombre del archivo:', 'documento.txt') || '';
      if (!fileName) return;
      if (!fileName.includes('.')) fileName += '.txt';
    }

    setSaving(true);
    const blob = new Blob([editorContent], { type: 'text/plain' });
    
    // Si hay carpeta, guardar ahí. Si no, descargar.
    if (hasFolder) {
      const success = await localFS.saveFile(fileName, blob);
      if (success) {
        await loadFiles();
        setViewMode('list');
        setEditorContent('');
        setCurrentFileName('');
      } else {
        // Fallback a descarga
        downloadBlob(blob, fileName);
        setViewMode('list');
      }
    } else {
      // Sin carpeta, descargar directamente
      downloadBlob(blob, fileName);
      setViewMode('list');
      setEditorContent('');
      setCurrentFileName('');
    }
    setSaving(false);
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Descargar archivo
  const handleDownload = async (fileName: string) => {
    const file = await localFS.getFile(fileName);
    if (file) downloadBlob(file, fileName);
  };

  // Eliminar archivo
  const handleDelete = async (fileName: string) => {
    if (!confirm(`¿Eliminar "${fileName}"?`)) return;
    const success = await localFS.deleteFile(fileName);
    if (success) await loadFiles();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Editor
  if (viewMode === 'editor') {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setViewMode('list')} className="text-stone-400 hover:text-stone-600">←</button>
            <h2 className="text-xl font-bold text-stone-800">
              {currentFileName || 'Nuevo escrito'}
            </h2>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-md hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50">
            {saving ? 'Guardando...' : '💾 Guardar'}
          </button>
        </div>
        
        <textarea
          value={editorContent}
          onChange={(e) => setEditorContent(e.target.value)}
          placeholder="Escribe tu documento aquí..."
          className="w-full h-80 p-4 border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800"
        />
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-stone-400">
            {hasFolder ? `📂 ${folderName}` : '⬇️ Se descargará'}
          </p>
          <p className="text-xs text-stone-400">{editorContent.length} caracteres</p>
        </div>
      </div>
    );
  }

  // Lista principal
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
      <input ref={fileInputRef} type="file" accept=".txt,.md" onChange={handleFileSelect} className="hidden" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src="/btn-escrito.jpg" alt="Escrito" className="w-12 h-12 rounded-xl object-cover" />
          <h2 className="text-xl font-bold text-stone-800">Escritos</h2>
        </div>
      </div>

      {/* Carpeta (si hay) */}
      {hasFolder ? (
        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📂</span>
            <span className="text-emerald-800 font-medium text-sm">{folderName}</span>
          </div>
          <button onClick={handleChangeFolder} className="text-xs text-emerald-600 hover:text-emerald-800">
            Cambiar
          </button>
        </div>
      ) : isSupported ? (
        <button onClick={handleSelectFolder}
          className="w-full flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 mb-4 hover:bg-stone-100 transition">
          <div className="flex items-center gap-2">
            <span className="text-lg">📂</span>
            <span className="text-stone-600 text-sm">Sin carpeta (se descargará)</span>
          </div>
          <span className="text-xs text-blue-600">Elegir</span>
        </button>
      ) : (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4">
          <p className="text-amber-800 text-sm">⬇️ Los archivos se descargarán (usa Chrome para guardar en carpeta)</p>
        </div>
      )}

      {/* Botones principales */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={handleNewDoc}
          className="flex items-center justify-center gap-2 p-4 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transition">
          ✏️ Nuevo Escrito
        </button>
        <button onClick={handleFromFile}
          className="flex items-center justify-center gap-2 p-4 bg-gradient-to-b from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:from-purple-600 hover:to-purple-700 transition">
          📄 Desde Archivo
        </button>
      </div>

      {/* Lista de archivos (solo si hay carpeta) */}
      {hasFolder && (
        <div className="border-t border-stone-200 pt-4">
          <h3 className="font-semibold text-stone-700 mb-3">
            Mis documentos <span className="text-xs bg-stone-100 px-2 py-0.5 rounded-full ml-1">{files.length}</span>
          </h3>

          {loading ? (
            <p className="text-stone-400 text-center py-4">Cargando...</p>
          ) : files.length === 0 ? (
            <p className="text-stone-400 text-center py-4 text-sm">Sin documentos</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map(file => (
                <div key={file.name} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg">📄</span>
                    <div className="min-w-0">
                      <p className="font-medium text-stone-800 truncate">{file.name}</p>
                      <p className="text-xs text-stone-500">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(file.name)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                      ✏️
                    </button>
                    <button onClick={() => handleDownload(file.name)}
                      className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200">
                      ⬇️
                    </button>
                    <button onClick={() => handleDelete(file.name)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
