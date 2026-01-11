'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  case: { id: string; matter: string } | null;
}

const PRIORITY_COLORS: Record<string, string> = {
  alta: 'bg-red-500/20 text-red-400 border-red-500/30',
  media: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  baja: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function TareasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'pendiente' | 'completada'>('pendiente');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    const res = await fetch('/api/tasks?limit=100');
    const data = await res.json();
    setTasks(data.tasks || []);
    setLoading(false);
  };

  const toggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completada' ? 'pendiente' : 'completada';
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    loadTasks();
  };

  const deleteTask = async (id: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  };

  const filtered = tasks.filter(t => filter === 'todas' || t.status === filter);
  const sortedTasks = [...filtered].sort((a, b) => {
    const priorityOrder = { alta: 0, media: 1, baja: 2 };
    return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
  });

  const pendingCount = tasks.filter(t => t.status === 'pendiente').length;
  const completedCount = tasks.filter(t => t.status === 'completada').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="pt-6 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-4">
            <span>←</span> Inicio
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Tareas</h1>
                <p className="text-sm text-slate-400">{pendingCount} pendientes • {completedCount} completadas</p>
              </div>
            </div>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition">
              + Nueva
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['pendiente', 'completada', 'todas'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filter === f ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-400 hover:bg-white/20'
              }`}>
              {f === 'pendiente' ? 'Pendientes' : f === 'completada' ? 'Completadas' : 'Todas'}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        {loading ? (
          <p className="text-slate-400 text-center py-12">Cargando...</p>
        ) : sortedTasks.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/10">
            <span className="text-5xl block mb-4">📝</span>
            <p className="text-slate-400 mb-4">No hay tareas {filter !== 'todas' ? filter + 's' : ''}</p>
            <button onClick={() => setShowModal(true)} className="text-purple-400 font-medium hover:underline">+ Crear tarea</button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map(t => (
              <div key={t.id} className={`bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10 ${t.status === 'completada' ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleTask(t.id, t.status)}
                    className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${
                      t.status === 'completada' ? 'bg-purple-500 border-purple-500' : 'border-slate-500 hover:border-purple-500'
                    }`}>
                    {t.status === 'completada' && <span className="text-white text-sm">✓</span>}
                  </button>
                  
                  <div className="flex-1">
                    <p className={`font-medium text-white ${t.status === 'completada' ? 'line-through' : ''}`}>{t.title}</p>
                    {t.description && <p className="text-sm text-slate-400 mt-1">{t.description}</p>}
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${PRIORITY_COLORS[t.priority]}`}>
                        {t.priority}
                      </span>
                      {t.dueDate && (
                        <span className="text-xs text-slate-500">
                          Vence: {new Date(t.dueDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      {t.case && (
                        <Link href={`/casos/${t.case.id}`} className="text-xs text-blue-400 hover:underline">
                          📁 {t.case.matter}
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  <button onClick={() => deleteTask(t.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-400 transition">
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      
        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-slate-500 text-sm">
            Hecho por <span className="text-amber-500">Colmena</span> - C6 (Mike) 2026
          </p>
        </footer>
      </main>

      {/* New Task Modal */}
      {showModal && (
        <NewTaskModal onClose={() => setShowModal(false)} onSave={() => { loadTasks(); setShowModal(false); }} />
      )}
    </div>
  );
}

function NewTaskModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [cases, setCases] = useState<Array<{ id: string; matter: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', priority: 'media', caseId: '', dueDate: ''
  });

  useEffect(() => {
    fetch('/api/cases?limit=100').then(r => r.json()).then(d => setCases(d.cases || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return alert('Título requerido');
    setSaving(true);
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) onSave();
    else setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-3xl p-6 w-full max-w-md border border-white/10" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Nueva Tarea</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400">Título *</label>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              placeholder="¿Qué necesitas hacer?"
              className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500" required />
          </div>
          <div>
            <label className="text-sm text-slate-400">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={2} placeholder="Detalles adicionales..."
              className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400">Prioridad</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white">
                <option value="alta">🔴 Alta</option>
                <option value="media">🟡 Media</option>
                <option value="baja">🟢 Baja</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400">Fecha límite</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})}
                className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white" />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400">Asociar a caso (opcional)</label>
            <select value={form.caseId} onChange={e => setForm({...form, caseId: e.target.value})}
              className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white">
              <option value="">Sin caso asociado</option>
              {cases.map(c => <option key={c.id} value={c.id}>{c.matter}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-50">
              {saving ? 'Guardando...' : 'Crear Tarea'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-white/10 text-white rounded-xl">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
