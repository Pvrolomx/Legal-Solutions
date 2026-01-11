'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Case {
  id: string;
  caseNumber: string | null;
  matter: string;
  caseType: string;
  status: string;
  court: string | null;
  opponent: string | null;
  startDate: string;
  client: { id: string; name: string };
}

const CASE_TYPES: Record<string, string> = {
  civil: 'Civil', penal: 'Penal', familiar: 'Familiar',
  mercantil: 'Mercantil', laboral: 'Laboral', amparo: 'Amparo',
  administrativo: 'Administrativo',
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'suspendido', label: 'Suspendidos' },
  { value: 'cerrado', label: 'Cerrados' },
  { value: 'archivado', label: 'Archivados' },
];

export default function CasosPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => { loadCases(); }, []);

  const loadCases = async () => {
    const res = await fetch('/api/cases?limit=100');
    const data = await res.json();
    setCases(data.cases || []);
    setLoading(false);
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = search === '' || 
      c.matter.toLowerCase().includes(search.toLowerCase()) ||
      c.client.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.caseNumber && c.caseNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === '' || c.status === statusFilter;
    const matchesType = typeFilter === '' || c.caseType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-3">
            <span>←</span> Inicio
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Casos</h1>
                <p className="text-xs text-slate-400">{cases.length} casos registrados</p>
              </div>
            </div>
            <Link href="/casos/nuevo" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm flex items-center gap-2">
              <span>+</span> Nuevo Caso
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por asunto, cliente o expediente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los tipos</option>
            {Object.entries(CASE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Cases List */}
        {loading ? (
          <div className="text-center py-12"><p className="text-slate-500">Cargando...</p></div>
        ) : filteredCases.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
            <span className="text-5xl block mb-4">📂</span>
            <p className="text-slate-500 mb-4">No hay casos que coincidan</p>
            <Link href="/casos/nuevo" className="text-blue-600 font-medium hover:underline">+ Crear nuevo caso</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="divide-y">
              {filteredCases.map(c => (
                <Link href={`/casos/${c.id}`} key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition">
                      <span className="text-xl">📁</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{c.matter}</p>
                      <p className="text-sm text-slate-500">{c.client.name} • {c.caseNumber || 'Sin expediente'}</p>
                      {c.court && <p className="text-xs text-slate-400">{c.court}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {CASE_TYPES[c.caseType] || c.caseType}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      c.status === 'activo' ? 'bg-green-100 text-green-700' :
                      c.status === 'suspendido' ? 'bg-yellow-100 text-yellow-700' :
                      c.status === 'cerrado' ? 'bg-gray-100 text-gray-600' :
                      'bg-stone-100 text-stone-600'
                    }`}>{c.status}</span>
                    <span className="text-slate-400 group-hover:text-blue-500">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      
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
