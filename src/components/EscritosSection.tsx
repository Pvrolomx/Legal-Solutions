'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import * as localFS from '@/lib/localFileSystem';

interface LocalFile {
  name: string;
  size: number;
  lastModified: number;
}

export default function EscritosSection() {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [hasFolder, setHasFolder] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    if (!localFS.isSupported()) {
      setIsSupported(false);
      setLoading(false);
      return;
    }

    const hasAccess = await localFS.hasAccess();
    if (hasAccess) {
      setHasFolder(true);
      const name = await localFS.getFolderName();
      setFolderName(name);
      await loadFiles();
    }
    setLoading(false);
  };

  const loadFiles = async () => {
    const fileList = await localFS.listFiles();
    setFiles(fileList);
  };

  const handleSelectFolder = async () => {
    const success = await localFS.requestDirectory();
    if (success) {
      setHasFolder(true);
      setShowFolderPicker(false);
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const success = await localFS.saveFile(file.name, file);
    
    if (success) {
      await loadFiles();
      setShowUpload(false);
    } else {
      alert('Error al guardar archivo');
    }
    
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = async (fileName: string) => {
    const file = await localFS.getFile(fileName);
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert('Error al leer archivo');
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm(`¿Eliminar "${fileName}"?`)) return;
    
    const success = await localFS.deleteFile(fileName);
    if (success) {
      await loadFiles();
    } else {
      alert('Error al eliminar');
    }
  };

  const createBlankDoc = async () => {
    const docContent = new Blob(
      [''],
      { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    );
    
    const fileName = `documento_${Date.now()}.docx`;
    const success = await localFS.saveFile(fileName, docContent);
    
    if (success) {
      await loadFiles();
      handleDownload(fileName);
    } else {
      alert('Error al crear documento');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Navegador no soportado
  if (!isSupported) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
        <div className="flex items-center gap-3 mb-6">
          <img src="/btn-escrito.jpg" alt="Escrito" className="w-12 h-12 rounded-xl object-cover" />
          <h2 className="text-xl font-bold text-stone-800">Escritos</h2>
        </div>
        
        <div className="text-center py-8">
          <span className="text-4xl mb-4 block">⚠️</span>
          <p className="text-stone-700 font-medium mb-2">Navegador no compatible</p>
          <p className="text-stone-500 text-sm">
            Tu navegador no soporta guardar archivos localmente.
            <br />
            Usa <strong>Chrome actualizado</strong> para esta función.
          </p>
        </div>
      </div>
    );
  }

  // Pantalla de selección de carpeta
  if (showFolderPicker && !hasFolder) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
        <div className="flex items-center gap-3 mb-6">
          <img src="/btn-escrito.jpg" alt="Escrito" className="w-12 h-12 rounded-xl object-cover" />
          <h2 className="text-xl font-bold text-stone-800">Escritos</h2>
        </div>
        
        <div className="text-center py-6">
          <span className="text-4xl mb-4 block">📁</span>
          <p className="text-stone-700 font-medium mb-2">Elige dónde guardar tus documentos</p>
          <p className="text-stone-500 text-sm mb-4">
            Selecciona una carpeta en tu celular o tarjeta SD.
            <br />
            Los archivos se guardarán ahí y podrás verlos en tu explorador.
          </p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleSelectFolder}
              className="px-6 py-3 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-md hover:from-emerald-600 hover:to-emerald-700 transition"
            >
              📂 Elegir carpeta
            </button>
            <button
              onClick={() => setShowFolderPicker(false)}
              className="px-6 py-3 bg-stone-100 text-stone-600 rounded-xl font-semibold hover:bg-stone-200 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sin carpeta seleccionada - mostrar opciones básicas
  if (!hasFolder) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="/btn-escrito.jpg" alt="Escrito" className="w-12 h-12 rounded-xl object-cover" />
            <h2 className="text-xl font-bold text-stone-800">Escritos</h2>
          </div>
        </div>

        {/* Opciones */}
        <div className="space-y-3">
          <Link href="/ai?prompt=redactar"
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition border border-purple-200">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="font-semibold text-purple-800">Generar con IA</p>
              <p className="text-sm text-purple-600">Claude redacta tu escrito</p>
            </div>
          </Link>

          <button
            onClick={() => setShowFolderPicker(true)}
            className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl transition border border-emerald-200 text-left"
          >
            <span className="text-2xl">📂</span>
            <div>
              <p className="font-semibold text-emerald-800">Guardar en mi celular</p>
              <p className="text-sm text-emerald-600">Elegir carpeta para documentos</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Con carpeta seleccionada
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src="/btn-escrito.jpg" alt="Escrito" className="w-12 h-12 rounded-xl object-cover" />
          <h2 className="text-xl font-bold text-stone-800">Escritos</h2>
        </div>
      </div>

      {/* Carpeta seleccionada */}
      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📂</span>
          <span className="text-emerald-800 font-medium text-sm">{folderName}</span>
        </div>
        <button
          onClick={handleChangeFolder}
          className="text-xs text-emerald-600 hover:text-emerald-800"
        >
          Cambiar
        </button>
      </div>

      {/* Opciones */}
      <div className="space-y-3 mb-6">
        <button onClick={() => setShowUpload(!showUpload)}
          className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition border border-blue-200 text-left">
          <span className="text-2xl">📤</span>
          <div>
            <p className="font-semibold text-blue-800">Subir formato</p>
            <p className="text-sm text-blue-600">Guardar archivo en la carpeta</p>
          </div>
        </button>

        {showUpload && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 animate-fadeIn">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc,.pdf,.txt"
              onChange={handleUpload}
              disabled={uploading}
              className="w-full text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:font-medium hover:file:bg-blue-600"
            />
            {uploading && <p className="text-sm text-blue-600 mt-2">Guardando...</p>}
          </div>
        )}

        <button onClick={createBlankDoc}
          className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-stone-50 to-stone-100 hover:from-stone-100 hover:to-stone-200 rounded-xl transition border border-stone-200 text-left">
          <span className="text-2xl">📝</span>
          <div>
            <p className="font-semibold text-stone-800">Documento en blanco</p>
            <p className="text-sm text-stone-600">Crear Word vacío</p>
          </div>
        </button>
      </div>

      {/* Lista de archivos */}
      <div className="border-t border-stone-200 pt-4">
        <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
          📁 Archivos en carpeta
          <span className="text-xs bg-stone-100 px-2 py-0.5 rounded-full">{files.length}</span>
        </h3>

        {loading ? (
          <p className="text-stone-400 text-center py-4">Cargando...</p>
        ) : files.length === 0 ? (
          <p className="text-stone-400 text-center py-4 text-sm">Carpeta vacía</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map(file => (
              <div key={file.name}
                className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 hover:border-stone-300 transition">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-lg">
                    {file.name.endsWith('.pdf') ? '📕' : file.name.endsWith('.docx') || file.name.endsWith('.doc') ? '📄' : '📃'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-stone-800 truncate">{file.name}</p>
                    <p className="text-xs text-stone-500">
                      {formatSize(file.size)} • {formatDate(file.lastModified)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDownload(file.name)}
                    className="px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition">
                    ⬇️
                  </button>
                  <button onClick={() => handleDelete(file.name)}
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
