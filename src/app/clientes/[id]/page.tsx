'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface ClientDetail {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  rfc: string | null;
  curp: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  cases: Array<{ id: string; matter: string; caseNumber: string | null; status: string; caseType: string }>;
}

export default function ClienteDetallePage() {
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => { loadClient(); }, [params.id]);

  const loadClient = async () => {
    const res = await fetch(`/api/clients/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setClient(data);
      setForm({
        name: data.name, phone: data.phone, email: data.email || '',
        rfc: data.rfc || '', curp: data.curp || '',
        address: data.address || '', notes: data.notes || '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/clients/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await loadClient();
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este cliente? Se eliminarán también sus casos asociados.')) return;
    const res = await fetch(`/api/clients/${params.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/clientes');
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center"><p className="text-slate-400">Cargando...</p></div>;
  if (!client) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center"><p className="text-slate-400">Cliente no encontrado</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="pt-6 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/clientes" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-4">
            <span>←</span> Clientes
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{client.name}</h1>
                <p className="text-sm text-slate-400">{client.phone}</p>
              </div>
            </div>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition">
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition disabled:opacity-50">
                  {saving ? '...' : 'Guardar'}
                </button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition">
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Info */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
          <h2 className="font-semibold text-white mb-4">Información</h2>
          
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Nombre</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Teléfono</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Email</label>
                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">RFC</label>
                  <input value={form.rfc} onChange={e => setForm({...form, rfc: e.target.value})}
                    className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">CURP</label>
                  <input value={form.curp} onChange={e => setForm({...form, curp: e.target.value})}
                    className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400">Dirección</label>
                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Notas</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
                  className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-slate-500">Teléfono</p><p className="text-white">{client.phone}</p></div>
                <div><p className="text-sm text-slate-500">Email</p><p className="text-white">{client.email || '-'}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-slate-500">RFC</p><p className="text-white">{client.rfc || '-'}</p></div>
                <div><p className="text-sm text-slate-500">CURP</p><p className="text-white">{client.curp || '-'}</p></div>
              </div>
              {client.address && <div><p className="text-sm text-slate-500">Dirección</p><p className="text-white">{client.address}</p></div>}
              {client.notes && <div><p className="text-sm text-slate-500">Notas</p><p className="text-slate-300">{client.notes}</p></div>}
            </div>
          )}
        </div>

        {/* Cases */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-white">📁 Casos ({client.cases.length})</h2>
            <Link href={`/casos/nuevo?clientId=${client.id}`} className="text-emerald-400 text-sm font-medium hover:underline">+ Nuevo caso</Link>
          </div>
          
          {client.cases.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Sin casos registrados</p>
          ) : (
            <div className="space-y-2">
              {client.cases.map(c => (
                <Link href={`/casos/${c.id}`} key={c.id}
                  className="block p-3 bg-white/5 hover:bg-white/10 rounded-xl transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white">{c.matter}</p>
                      <p className="text-sm text-slate-500">{c.caseNumber || 'Sin expediente'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      c.status === 'activo' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                    }`}>{c.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
          <h2 className="font-semibold text-white mb-4">Acciones</h2>
          <div className="space-y-3">
            <Link href={`/casos/nuevo?clientId=${client.id}`}
              className="block w-full text-center py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition">
              + Crear nuevo caso para este cliente
            </Link>
            <button onClick={handleDelete}
              className="w-full py-3 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition">
              Eliminar cliente
            </button>
          </div>
        </div>
      
        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-slate-500 text-sm">
            Hecho por <span className="text-amber-500">Colmena</span> - C6 (Mike) 2026
          </p>
        </footer>
      </main>
    </div>
  );
}
