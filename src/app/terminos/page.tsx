'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Termino {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaVencimiento: string;
  tipo: string;
  diasAlerta: number;
  estado: string;
  notas: string | null;
  case: { 
    id: string; 
    matter: string; 
    caseNumber: string | null;
    client: { name: string } | null;
  };
}

interface Stats {
  totalPendientes: number;
  proximosVencer: number;
  vencidos: number;
}

const TIPO_COLORS: Record<string, string> = {
  fatal: 'bg-red-500/20 text-red-400 border-red-500/30',
  procesal: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  convencional: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const TIPO_LABELS: Record<string, string> = {
  fatal: '⚠️ Fatal',
  procesal: '⏰ Procesal',
  convencional: '📅 Convencional',
};

function diasRestantes(fecha: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(fecha);
  vencimiento.setHours(0, 0, 0, 0);
  const diff = vencimiento.getTime() - hoy.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getUrgenciaColor(dias: number, estado: string): string {
  if (estado === 'cumplido') return 'border-green-500/30 bg-green-500/5';
  if (dias < 0) return 'border-red-500/50 bg-red-500/10'; // vencido
  if (dias <= 1) return 'border-red-500/50 bg-red-500/10'; // urgente
  if (dias <= 3) return 'border-amber-500/50 bg-amber-500/10'; // próximo
  return 'border-white/10 bg-white/5'; // normal
}

export default function TerminosPage() {
  const [terminos, setTerminos] = useState<Termino[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPendientes: 0, proximosVencer: 0, vencidos: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'pendiente' | 'cumplido' | 'vencido'>('pendiente');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadTerminos(); }, []);

  const loadTerminos = async () => {
    const res = await fetch('/api/terminos?limit=100');
    const data = await res.json();
    setTerminos(data.terminos || []);
    setStats(data.stats || { totalPendientes: 0, proximosVencer: 0, vencidos: 0 });
    setLoading(false);
  };

  const marcarCumplido = async (id: string) => {
    await fetch(`/api/terminos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'cumplido' }),
    });
    loadTerminos();
  };

  const deleteTermino = async (id: string) => {
    if (!confirm('¿Eliminar este término?')) return;
    await fetch(`/api/terminos/${id}`, { method: 'DELETE' });
    loadTerminos();
  };

  // Filtrar y marcar vencidos automáticamente
  const hoy = new Date();
  const filtered = terminos.filter(t => {
    const dias = diasRestantes(t.fechaVencimiento);
    const estaVencido = dias < 0 && t.estado === 'pendiente';
    
    if (filter === 'todos') return true;
    if (filter === 'vencido') return estaVencido;
    if (filter === 'cumplido') return t.estado === 'cumplido';
    if (filter === 'pendiente') return t.estado === 'pendiente' && !estaVencido;
    return true;
  });

  // Ordenar por urgencia
  const sorted = [...filtered].sort((a, b) => {
    const diasA = diasRestantes(a.fechaVencimiento);
    const diasB = diasRestantes(b.fechaVencimiento);
    return diasA - diasB;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="pt-6 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-4">
            <span>←</span> Inicio
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Términos</h1>
                <p className="text-sm text-slate-400">
                  {stats.totalPendientes} pendientes • 
                  <span className={stats.proximosVencer > 0 ? ' text-amber-400' : ''}> {stats.proximosVencer} próximos</span> • 
                  <span className={stats.vencidos > 0 ? ' text-red-400' : ''}> {stats.vencidos} vencidos</span>
                </p>
              </div>
            </div>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition">
              + Nuevo
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Alert Banner */}
        {stats.vencidos > 0 && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="text-red-400 font-semibold">¡Atención! Tienes {stats.vencidos} término(s) vencido(s)</p>
              <p className="text-red-300/70 text-sm">Revisa y actualiza el estado de tus términos</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {([
            { key: 'pendiente', label: 'Pendientes' },
            { key: 'vencido', label: '⚠️ Vencidos' },
            { key: 'cumplido', label: '✓ Cumplidos' },
            { key: 'todos', label: 'Todos' },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl font-medium transition whitespace-nowrap ${
                filter === f.key ? 'bg-amber-500 text-white' : 'bg-white/10 text-slate-400 hover:bg-white/20'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Términos List */}
        {loading ? (
          <p className="text-slate-400 text-center py-12">Cargando...</p>
        ) : sorted.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/10">
            <span className="text-5xl block mb-4">⏰</span>
            <p className="text-slate-400 mb-4">No hay términos {filter !== 'todos' ? filter + 's' : ''}</p>
            <button onClick={() => setShowModal(true)} className="text-amber-400 font-medium hover:underline">+ Crear término</button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(t => {
              const dias = diasRestantes(t.fechaVencimiento);
              const vencido = dias < 0 && t.estado === 'pendiente';
              
              return (
                <div key={t.id} className={`backdrop-blur-lg rounded-2xl p-4 border ${getUrgenciaColor(dias, t.estado)} ${t.estado === 'cumplido' ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    {/* Checkbox cumplido */}
                    <button onClick={() => t.estado !== 'cumplido' && marcarCumplido(t.id)}
                      disabled={t.estado === 'cumplido'}
                      className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${
                        t.estado === 'cumplido' ? 'bg-green-500 border-green-500' : 'border-slate-500 hover:border-green-500'
                      }`}>
                      {t.estado === 'cumplido' && <span className="text-white text-sm">✓</span>}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold text-white ${t.estado === 'cumplido' ? 'line-through' : ''}`}>
                          {t.titulo}
                        </p>
                        {vencido && <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">VENCIDO</span>}
                      </div>
                      
                      {t.descripcion && <p className="text-sm text-slate-400 mt-1">{t.descripcion}</p>}
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${TIPO_COLORS[t.tipo]}`}>
                          {TIPO_LABELS[t.tipo] || t.tipo}
                        </span>
                        
                        <span className={`text-xs font-medium ${
                          vencido ? 'text-red-400' :
                          dias <= 1 ? 'text-red-400' : 
                          dias <= 3 ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {t.estado === 'cumplido' ? '✓ Cumplido' :
                           vencido ? `Venció hace ${Math.abs(dias)} día(s)` :
                           dias === 0 ? '¡Vence HOY!' :
                           dias === 1 ? 'Vence MAÑANA' :
                           `Vence en ${dias} días`}
                        </span>
                        
                        <span className="text-xs text-slate-500">
                          {new Date(t.fechaVencimiento).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      
                      {/* Caso asociado */}
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <Link href={`/casos/${t.case.id}`} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                          <span>📁</span>
                          <span className="truncate">{t.case.matter}</span>
                          {t.case.client && <span className="text-slate-500">• {t.case.client.name}</span>}
                        </Link>
                      </div>
                    </div>
                    
                    <button onClick={() => deleteTermino(t.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-400 transition">
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      
        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-slate-500 text-sm">
            Hecho por <span className="text-amber-500">Colmena</span> - 2026
          </p>
        </footer>
      </main>

      {/* New Termino Modal */}
      {showModal && (
        <NewTerminoModal onClose={() => setShowModal(false)} onSave={() => { loadTerminos(); setShowModal(false); }} />
      )}
    </div>
  );
}

function NewTerminoModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [cases, setCases] = useState<Array<{ id: string; matter: string; caseNumber: string | null }>>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titulo: '', 
    descripcion: '', 
    tipo: 'procesal', 
    caseId: '', 
    fechaVencimiento: '',
    diasAlerta: 3,
    notas: ''
  });

  useEffect(() => {
    fetch('/api/cases?limit=100').then(r => r.json()).then(d => setCases(d.cases || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo) return alert('Título requerido');
    if (!form.caseId) return alert('Debe asociar a un expediente');
    if (!form.fechaVencimiento) return alert('Fecha de vencimiento requerida');
    
    setSaving(true);
    const res = await fetch('/api/terminos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) onSave();
    else setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-3xl p-6 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Nuevo Término</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400">Título *</label>
            <input type="text" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})}
              placeholder="Ej: Contestar demanda"
              className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500" required />
          </div>
          
          <div>
            <label className="text-sm text-slate-400">Expediente *</label>
            <select value={form.caseId} onChange={e => setForm({...form, caseId: e.target.value})}
              className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white" required>
              <option value="">Seleccionar expediente...</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber ? `${c.caseNumber} - ` : ''}{c.matter}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400">Fecha vencimiento *</label>
              <input type="date" value={form.fechaVencimiento} onChange={e => setForm({...form, fechaVencimiento: e.target.value})}
                className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white" required />
            </div>
            <div>
              <label className="text-sm text-slate-400">Tipo</label>
              <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}
                className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white">
                <option value="fatal">⚠️ Fatal (improrrogable)</option>
                <option value="procesal">⏰ Procesal</option>
                <option value="convencional">📅 Convencional</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-slate-400">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})}
              rows={2} placeholder="Detalles del término..."
              className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500" />
          </div>
          
          <div>
            <label className="text-sm text-slate-400">Días de anticipación para alerta</label>
            <input type="number" min="1" max="30" value={form.diasAlerta} 
              onChange={e => setForm({...form, diasAlerta: parseInt(e.target.value) || 3})}
              className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white" />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold disabled:opacity-50">
              {saving ? 'Guardando...' : 'Crear Término'}
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
