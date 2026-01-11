'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Hearing {
  id: string;
  date: string;
  time: string;
  type: string;
  location: string | null;
  status: string;
  notes: string | null;
  case: { id: string; matter: string; client: { name: string } };
}

const HEARING_TYPES: Record<string, { label: string; color: string }> = {
  inicial: { label: 'Audiencia Inicial', color: 'bg-blue-500' },
  pruebas: { label: 'Desahogo de Pruebas', color: 'bg-purple-500' },
  alegatos: { label: 'Alegatos', color: 'bg-amber-500' },
  sentencia: { label: 'Sentencia', color: 'bg-red-500' },
  conciliacion: { label: 'Conciliación', color: 'bg-green-500' },
  otra: { label: 'Otra', color: 'bg-slate-500' },
};

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function AgendaPage() {
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadHearings(); }, [currentDate]);

  const loadHearings = async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1).toISOString().split('T')[0];
    const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
    
    const res = await fetch(`/api/hearings?start=${start}&end=${end}`);
    const data = await res.json();
    setHearings(data.hearings || []);
    setLoading(false);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const getHearingsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return hearings.filter(h => h.date.startsWith(dateStr));
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const today = new Date();
  const isToday = (day: number) => 
    day === today.getDate() && 
    currentDate.getMonth() === today.getMonth() && 
    currentDate.getFullYear() === today.getFullYear();

  const selectedHearings = selectedDate ? hearings.filter(h => h.date.startsWith(selectedDate)) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="pt-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-4">
            <span>←</span> Inicio
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Agenda</h1>
                <p className="text-sm text-slate-400">Audiencias y citas</p>
              </div>
            </div>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition">
              + Nueva
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Calendar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 mb-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg text-white">←</button>
            <h2 className="text-xl font-bold text-white">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg text-white">→</button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-sm font-medium text-slate-400 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <p className="text-slate-400 text-center py-12">Cargando...</p>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((day, i) => {
                if (!day) return <div key={i} className="aspect-square" />;
                const dayHearings = getHearingsForDay(day);
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-start transition ${
                      isToday(day) ? 'bg-amber-500 text-white' :
                      selectedDate === dateStr ? 'bg-white/20 text-white' :
                      'hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    {dayHearings.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                        {dayHearings.slice(0, 3).map((h, j) => (
                          <div key={j} className={`w-2 h-2 rounded-full ${HEARING_TYPES[h.type]?.color || 'bg-slate-500'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Day Detail */}
        {selectedDate && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
            <h3 className="font-semibold text-white mb-4">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            
            {selectedHearings.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Sin audiencias este día</p>
            ) : (
              <div className="space-y-3">
                {selectedHearings.map(h => (
                  <div key={h.id} className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${HEARING_TYPES[h.type]?.color || 'bg-slate-500'}`} />
                        <div>
                          <p className="font-medium text-white">{HEARING_TYPES[h.type]?.label || h.type}</p>
                          <p className="text-sm text-slate-400">{h.case.matter} • {h.case.client.name}</p>
                          {h.location && <p className="text-sm text-slate-500">{h.location}</p>}
                        </div>
                      </div>
                      <span className="text-amber-400 font-medium">{h.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {Object.entries(HEARING_TYPES).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 text-sm text-slate-400">
              <div className={`w-3 h-3 rounded-full ${val.color}`} />
              <span>{val.label}</span>
            </div>
          ))}
        </div>
      
        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-slate-500 text-sm">
            Hecho por <span className="text-amber-500">Colmena</span> - C6 (Mike) 2026
          </p>
        </footer>
      </main>

      {/* New Hearing Modal */}
      {showModal && (
        <NewHearingModal onClose={() => setShowModal(false)} onSave={() => { loadHearings(); setShowModal(false); }} />
      )}
    </div>
  );
}

function NewHearingModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [cases, setCases] = useState<Array<{ id: string; matter: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    caseId: '', date: '', time: '09:00', type: 'inicial', location: '', notes: ''
  });

  useEffect(() => {
    fetch('/api/cases?limit=100').then(r => r.json()).then(d => setCases(d.cases || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.caseId || !form.date) return alert('Caso y fecha requeridos');
    setSaving(true);
    const res = await fetch('/api/hearings', {
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
        <h2 className="text-xl font-bold text-white mb-4">Nueva Audiencia</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400">Caso *</label>
            <select value={form.caseId} onChange={e => setForm({...form, caseId: e.target.value})}
              className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white" required>
              <option value="">Seleccionar...</option>
              {cases.map(c => <option key={c.id} value={c.id}>{c.matter}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400">Fecha *</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white" required />
            </div>
            <div>
              <label className="text-sm text-slate-400">Hora</label>
              <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})}
                className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white" />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400">Tipo</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white">
              {Object.entries(HEARING_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400">Ubicación</label>
            <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
              placeholder="Juzgado, sala..."
              className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
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
