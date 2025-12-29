'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface CaseDetail {
  id: string;
  caseNumber: string | null;
  matter: string;
  caseType: string;
  status: string;
  court: string | null;
  judge: string | null;
  opponent: string | null;
  opponentLawyer: string | null;
  description: string | null;
  notes: string | null;
  startDate: string;
  client: { id: string; name: string; phone: string; email: string | null };
  hearings: Array<{ id: string; date: string; time: string; type: string; status: string }>;
  documents: Array<{ id: string; name: string; url: string; createdAt: string }>;
  tasks: Array<{ id: string; title: string; status: string; dueDate: string | null }>;
}

const CASE_TYPES: Record<string, string> = {
  civil: 'Civil', penal: 'Penal', familiar: 'Familiar',
  mercantil: 'Mercantil', laboral: 'Laboral', amparo: 'Amparo', administrativo: 'Administrativo',
};

const STATUS_OPTIONS = ['activo', 'suspendido', 'cerrado', 'archivado'];

export default function CasoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => { loadCase(); }, [params.id]);

  const loadCase = async () => {
    const res = await fetch(`/api/cases/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setCaseData(data);
      setForm({
        caseNumber: data.caseNumber || '',
        matter: data.matter,
        caseType: data.caseType,
        status: data.status,
        court: data.court || '',
        judge: data.judge || '',
        opponent: data.opponent || '',
        opponentLawyer: data.opponentLawyer || '',
        description: data.description || '',
        notes: data.notes || '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/cases/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await loadCase();
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este caso? Esta acción no se puede deshacer.')) return;
    const res = await fetch(`/api/cases/${params.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/casos');
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p>Cargando...</p></div>;
  if (!caseData) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p>Caso no encontrado</p></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/casos" className="p-2 hover:bg-white/10 rounded-lg">←</Link>
              <div>
                <h1 className="text-xl font-bold">{caseData.matter}</h1>
                <p className="text-xs text-slate-400">{caseData.caseNumber || 'Sin expediente'} • {caseData.client.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <>
                  <button onClick={() => setEditing(true)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">Editar</button>
                  <Link href={`/ai?caseId=${caseData.id}`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">🤖 Consultar IA</Link>
                </>
              ) : (
                <>
                  <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => setEditing(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">Cancelar</button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="font-semibold text-lg mb-4">Información del Caso</h2>
              
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-500">Asunto</label>
                      <input value={form.matter} onChange={e => setForm({...form, matter: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">Expediente</label>
                      <input value={form.caseNumber} onChange={e => setForm({...form, caseNumber: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-500">Tipo</label>
                      <select value={form.caseType} onChange={e => setForm({...form, caseType: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1">
                        {Object.entries(CASE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">Estatus</label>
                      <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-500">Juzgado</label>
                      <input value={form.court} onChange={e => setForm({...form, court: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">Juez</label>
                      <input value={form.judge} onChange={e => setForm({...form, judge: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-500">Contraparte</label>
                      <input value={form.opponent} onChange={e => setForm({...form, opponent: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">Abogado Contraparte</label>
                      <input value={form.opponentLawyer} onChange={e => setForm({...form, opponentLawyer: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Descripción</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      rows={3} className="w-full px-3 py-2 border rounded-lg mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Notas</label>
                    <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                      rows={2} className="w-full px-3 py-2 border rounded-lg mt-1" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-slate-500">Tipo</p><p className="font-medium">{CASE_TYPES[caseData.caseType]}</p></div>
                    <div><p className="text-sm text-slate-500">Estatus</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        caseData.status === 'activo' ? 'bg-green-100 text-green-700' :
                        caseData.status === 'suspendido' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'
                      }`}>{caseData.status}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-slate-500">Juzgado</p><p className="font-medium">{caseData.court || '-'}</p></div>
                    <div><p className="text-sm text-slate-500">Juez</p><p className="font-medium">{caseData.judge || '-'}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-slate-500">Contraparte</p><p className="font-medium">{caseData.opponent || '-'}</p></div>
                    <div><p className="text-sm text-slate-500">Abogado</p><p className="font-medium">{caseData.opponentLawyer || '-'}</p></div>
                  </div>
                  {caseData.description && <div><p className="text-sm text-slate-500">Descripción</p><p>{caseData.description}</p></div>}
                  {caseData.notes && <div><p className="text-sm text-slate-500">Notas</p><p className="text-slate-600">{caseData.notes}</p></div>}
                </div>
              )}
            </div>

            {/* Audiencias */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">📅 Audiencias</h2>
                <button className="text-blue-600 text-sm font-medium hover:underline">+ Agregar</button>
              </div>
              {caseData.hearings.length === 0 ? (
                <p className="text-slate-400 text-center py-4">Sin audiencias programadas</p>
              ) : (
                <div className="space-y-2">
                  {caseData.hearings.map(h => (
                    <div key={h.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{h.type}</p>
                        <p className="text-sm text-slate-500">{new Date(h.date).toLocaleDateString('es-MX')} • {h.time}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${h.status === 'programada' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cliente */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-semibold mb-3">👤 Cliente</h3>
              <p className="font-medium text-lg">{caseData.client.name}</p>
              <p className="text-sm text-slate-500">{caseData.client.phone}</p>
              {caseData.client.email && <p className="text-sm text-slate-500">{caseData.client.email}</p>}
              <Link href={`/clientes/${caseData.client.id}`} className="text-blue-600 text-sm mt-2 inline-block hover:underline">Ver cliente →</Link>
            </div>

            {/* Tareas */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">✅ Tareas</h3>
                <button className="text-blue-600 text-sm font-medium hover:underline">+ Nueva</button>
              </div>
              {caseData.tasks.length === 0 ? (
                <p className="text-slate-400 text-sm">Sin tareas</p>
              ) : (
                <div className="space-y-2">
                  {caseData.tasks.map(t => (
                    <div key={t.id} className="flex items-center gap-2">
                      <input type="checkbox" checked={t.status === 'completada'} readOnly className="rounded" />
                      <span className={t.status === 'completada' ? 'line-through text-slate-400' : ''}>{t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-semibold mb-3">Acciones</h3>
              <div className="space-y-2">
                <Link href={`/ai?caseId=${caseData.id}`} className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  🤖 Consultar IA sobre este caso
                </Link>
                <button onClick={handleDelete} className="w-full py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                  Eliminar caso
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
