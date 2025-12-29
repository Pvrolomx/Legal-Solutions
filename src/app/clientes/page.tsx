'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  rfc: string | null;
  address: string | null;
  _count?: { cases: number };
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    const res = await fetch('/api/clients');
    const data = await res.json();
    setClients(data || []);
    setLoading(false);
  };

  const filtered = clients.filter(c => 
    search === '' ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="pt-6 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-4">
            <span>←</span> Inicio
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Clientes</h1>
                <p className="text-sm text-slate-400">{clients.length} registrados</p>
              </div>
            </div>
            <Link href="/clientes/nuevo" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition">
              + Nuevo
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* List */}
        {loading ? (
          <p className="text-slate-400 text-center py-12">Cargando...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/10">
            <span className="text-5xl block mb-4">👤</span>
            <p className="text-slate-400 mb-4">{search ? 'Sin resultados' : 'No hay clientes'}</p>
            <Link href="/clientes/nuevo" className="text-emerald-400 font-medium hover:underline">+ Agregar cliente</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <Link href={`/clientes/${c.id}`} key={c.id}
                className="block bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/30 transition">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-lg">{c.name}</p>
                      <p className="text-slate-400 text-sm">{c.phone} {c.email && `• ${c.email}`}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {c._count && c._count.cases > 0 && (
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                        {c._count.cases} caso{c._count.cases > 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="text-slate-500 ml-2 group-hover:text-emerald-400 transition">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
