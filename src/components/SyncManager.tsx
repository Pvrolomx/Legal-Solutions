'use client';

import { useState } from 'react';
import { exportAllData, importAllData } from '@/lib/db';

export default function SyncManager() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setMessage(null);
    
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `legal-backup-${date}.json`;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: `Exportado: ${filename}` });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'Error al exportar datos' });
    }
    
    setExporting(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate structure
      if (!data.version || !data.exportedAt) {
        throw new Error('Archivo inválido');
      }

      await importAllData(data);
      
      setMessage({ type: 'success', text: 'Datos importados correctamente. Recargando...' });
      
      // Reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Import error:', error);
      setMessage({ type: 'error', text: 'Error al importar. Verifica el archivo.' });
    }

    setImporting(false);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-200">
      <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
        🔄 Sincronización
      </h3>
      
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition"
        >
          {exporting ? '...' : '📤 Exportar'}
        </button>
        
        <label className="flex-1">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={importing}
            className="hidden"
          />
          <span className={`block text-center py-2 px-3 bg-green-500 hover:bg-green-600 ${importing ? 'opacity-50' : 'cursor-pointer'} text-white rounded-xl text-sm font-medium transition`}>
            {importing ? '...' : '📥 Importar'}
          </span>
        </label>
      </div>

      {message && (
        <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
      
      <p className="text-xs text-stone-400 mt-2">
        Exporta en PC, importa en celular
      </p>
    </div>
  );
}
