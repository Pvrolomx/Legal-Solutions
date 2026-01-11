'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Client { id: string; name: string; }

const CASE_TYPES = [
  { value: 'civil', label: 'Civil' },
  { value: 'penal', label: 'Penal' },
  { value: 'familiar', label: 'Familiar' },
  { value: 'mercantil', label: 'Mercantil' },
  { value: 'laboral', label: 'Laboral' },
  { value: 'amparo', label: 'Amparo' },
  { value: 'administrativo', label: 'Administrativo' },
];

export default function NuevoCasoPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clientId: '', caseNumber: '', court: '', judge: '',
    caseType: 'civil', matter: '', description: '',
    opponent: '', opponentLawyer: '', notes: '',
  });

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.matter) {
      alert('Cliente y asunto son requeridos');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/casos/${data.id}`);
    } else {
      alert('Error al guardar');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/casos" className="p-2 hover:bg-white/10 rounded-lg">←</Link>
            <div>
              <h1 className="text-xl font-bold">Nuevo Caso</h1>
              <p className="text-xs text-slate-400">Registrar expediente</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
            <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required>
              <option value="">Seleccionar cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Link href="/clientes/nuevo" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
              + Agregar nuevo cliente
            </Link>
          </div>

          {/* Asunto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asunto / Materia *</label>
            <input type="text" value={form.matter} onChange={e => setForm({...form, matter: e.target.value})}
              placeholder="Ej: Divorcio voluntario, Demanda mercantil..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
          </div>

          {/* Tipo y Expediente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Caso</label>
              <select value={form.caseType} onChange={e => setForm({...form, caseType: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                {CASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">No. Expediente</label>
              <input type="text" value={form.caseNumber} onChange={e => setForm({...form, caseNumber: e.target.value})}
                placeholder="Ej: 123/2024" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Juzgado y Juez */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Juzgado / Tribunal</label>
              <input type="text" value={form.court} onChange={e => setForm({...form, court: e.target.value})}
                placeholder="Ej: Juzgado 5to Civil" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Juez</label>
              <input type="text" value={form.judge} onChange={e => setForm({...form, judge: e.target.value})}
                placeholder="Nombre del juez" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Contraparte */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraparte</label>
              <input type="text" value={form.opponent} onChange={e => setForm({...form, opponent: e.target.value})}
                placeholder="Nombre de la contraparte" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Abogado Contraparte</label>
              <input type="text" value={form.opponentLawyer} onChange={e => setForm({...form, opponentLawyer: e.target.value})}
                placeholder="Nombre del abogado" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={3} placeholder="Descripción general del caso..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas internas</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              rows={2} placeholder="Notas privadas..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Crear Caso'}
            </button>
            <Link href="/casos" className="px-6 py-3 border rounded-lg font-medium text-slate-600 hover:bg-slate-50">
              Cancelar
            </Link>
          </div>
        </form>
      
        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-stone-400 text-sm">
            Hecho por <span className="text-amber-600">Colmena</span> - C6 (Mike) 2026
          </p>
        </footer>
      </main>
    </div>
  );
}
