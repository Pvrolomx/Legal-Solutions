'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Nota {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: string;
  createdAt: string;
  case: { id: string; matter: string } | null;
}

export default function NotasPage() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNota, setEditingNota] = useState<Nota | null>(null);
  const [content, setContent] = useState('');
  const [reminder, setReminder] = useState('');

  useEffect(() => { loadNotas(); }, []);

  const loadNotas = async () => {
    const res = await fetch('/api/tasks?limit=100');
    const data = await res.json();
    setNotas(data.tasks || []);
    setLoading(false);
  };

  const saveNota = async () => {
    if (!content.trim()) return;
    
    const payload = {
      title: content.slice(0, 100), // Primeros 100 chars como título
      description: content,
      dueDate: reminder || null,
      priority: 'media',
    };

    if (editingNota) {
      await fetch(`/api/tasks/${editingNota.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    
    setContent('');
    setReminder('');
    setEditingNota(null);
    setShowEditor(false);
    loadNotas();
  };

  const deleteNota = async (id: string) => {
    if (!confirm('¿Eliminar esta nota?')) return;
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    loadNotas();
  };

  const editNota = (nota: Nota) => {
    setEditingNota(nota);
    setContent(nota.description || nota.title);
    setReminder(nota.dueDate ? nota.dueDate.split('T')[0] : '');
    setShowEditor(true);
  };

  const newNota = () => {
    setEditingNota(null);
    setContent('');
    setReminder('');
    setShowEditor(true);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { text: `Hace ${Math.abs(days)} día(s)`, color: 'text-red-400' };
    if (days === 0) return { text: 'Hoy', color: 'text-amber-400' };
    if (days === 1) return { text: 'Mañana', color: 'text-amber-400' };
    return { text: d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }), color: 'text-stone-400' };
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 pt-6 pb-4 px-4">
        <div className="max-w-lg mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-800 transition mb-3">
            <span>←</span> Inicio
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-800">Notas</h1>
                <p className="text-sm text-stone-500">{notas.length} nota(s)</p>
              </div>
            </div>
            <button onClick={newNota} 
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition shadow-md">
              + Nueva
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Editor */}
        {showEditor && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
            <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex justify-between items-center">
              <span className="text-amber-800 font-medium text-sm">
                {editingNota ? '✏️ Editando nota' : '📝 Nueva nota'}
              </span>
              <button onClick={() => setShowEditor(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu nota aquí..."
              autoFocus
              className="w-full p-4 text-stone-800 placeholder-stone-400 resize-none focus:outline-none"
              style={{ minHeight: '150px', fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
            />
            <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-stone-400 text-sm">🔔</span>
                <input 
                  type="date" 
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                  className="text-sm px-2 py-1 border border-stone-200 rounded-lg text-stone-600 focus:outline-none focus:border-amber-400"
                  placeholder="Recordatorio"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowEditor(false)} 
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 font-medium">
                  Cancelar
                </button>
                <button onClick={saveNota}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium shadow">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Notas */}
        {loading ? (
          <p className="text-stone-400 text-center py-12">Cargando...</p>
        ) : notas.length === 0 && !showEditor ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-stone-200">
            <span className="text-5xl block mb-4">📝</span>
            <p className="text-stone-500 mb-4">No hay notas</p>
            <button onClick={newNota} className="text-amber-600 font-medium hover:underline">
              + Crear primera nota
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {notas.map(nota => (
              <div key={nota.id} 
                className="bg-white rounded-2xl shadow border border-stone-200 overflow-hidden hover:shadow-md transition">
                <div className="p-4 cursor-pointer" onClick={() => editNota(nota)}>
                  <p className="text-stone-800 whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.6' }}>
                    {nota.description || nota.title}
                  </p>
                  
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {nota.dueDate && (
                        <span className={`flex items-center gap-1 ${formatDate(nota.dueDate).color}`}>
                          🔔 {formatDate(nota.dueDate).text}
                        </span>
                      )}
                      <span className="text-stone-300">
                        {new Date(nota.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteNota(nota.id); }}
                      className="text-stone-300 hover:text-red-400 transition p-1"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-stone-400 text-sm">
            Hecho por <span className="text-amber-600">Colmena</span> - 2026
          </p>
        </footer>
      </main>
    </div>
  );
}
