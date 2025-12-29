'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface Case {
  id: string;
  caseNumber: string | null;
  matter: string;
  caseType: string;
  status: string;
  client: { name: string };
}

interface Hearing {
  id: string;
  date: string;
  time: string;
  type: string;
  case: { matter: string; client: { name: string } };
}

interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  priority: string;
  status: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

const CASE_TYPES: Record<string, string> = {
  civil: 'Civil',
  penal: 'Penal',
  familiar: 'Familiar',
  mercantil: 'Mercantil',
  laboral: 'Laboral',
  amparo: 'Amparo',
  administrativo: 'Administrativo',
};

export default function Dashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ total: 0, activos: 0, audienciasHoy: 0, tareasPendientes: 0 });
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  
  // Search states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{cases: Case[], clients: Client[]}>({ cases: [], clients: [] });
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filteredCases = allCases.filter(c => 
        c.matter.toLowerCase().includes(query) ||
        c.client.name.toLowerCase().includes(query) ||
        (c.caseNumber && c.caseNumber.toLowerCase().includes(query))
      );
      const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        (c.email && c.email.toLowerCase().includes(query))
      );
      setSearchResults({ cases: filteredCases.slice(0, 5), clients: filteredClients.slice(0, 5) });
    } else {
      setSearchResults({ cases: [], clients: [] });
    }
  }, [searchQuery, allCases, clients]);

  const loadDashboard = async () => {
    try {
      const [casesRes, hearingsRes, tasksRes, clientsRes] = await Promise.all([
        fetch('/api/cases?limit=50'),
        fetch('/api/hearings/upcoming'),
        fetch('/api/tasks?status=pendiente&limit=5'),
        fetch('/api/clients'),
      ]);
      const casesData = await casesRes.json();
      const hearingsData = await hearingsRes.json();
      const tasksData = await tasksRes.json();
      const clientsData = await clientsRes.json();
      
      setAllCases(casesData.cases || []);
      setCases((casesData.cases || []).slice(0, 5));
      setClients(clientsData || []);
      setHearings(hearingsData.hearings || []);
      setTasks(tasksData.tasks || []);
      setStats({
        total: casesData.total || 0,
        activos: casesData.activos || 0,
        audienciasHoy: hearingsData.today || 0,
        tareasPendientes: tasksData.total || 0,
      });
    } catch (e) {
      console.error('Error loading dashboard:', e);
    }
    setLoading(false);
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults({ cases: [], clients: [] });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4" onClick={closeSearch}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar casos, clientes..."
                className="flex-1 text-lg outline-none"
              />
              <button onClick={closeSearch} className="p-1 hover:bg-slate-100 rounded">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {searchQuery && (
              <div className="max-h-96 overflow-y-auto">
                {searchResults.cases.length > 0 && (
                  <div className="p-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2 px-2">Casos</p>
                    {searchResults.cases.map(c => (
                      <Link href={`/casos/${c.id}`} key={c.id} onClick={closeSearch}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span>📁</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{c.matter}</p>
                          <p className="text-sm text-slate-500">{c.client.name} • {c.caseNumber || 'Sin expediente'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                {searchResults.clients.length > 0 && (
                  <div className="p-3 border-t">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2 px-2">Clientes</p>
                    {searchResults.clients.map(c => (
                      <Link href={`/clientes/${c.id}`} key={c.id} onClick={closeSearch}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <span>👤</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{c.name}</p>
                          <p className="text-sm text-slate-500">{c.phone} {c.email && `• ${c.email}`}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                {searchResults.cases.length === 0 && searchResults.clients.length === 0 && (
                  <div className="p-8 text-center">
                    <span className="text-4xl block mb-2">🔍</span>
                    <p className="text-slate-500">No se encontraron resultados</p>
                  </div>
                )}
              </div>
            )}
            
            {!searchQuery && (
              <div className="p-6 text-center text-slate-400">
                <p>Escribe para buscar casos o clientes</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">⚖️</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">LEGAL <span className="font-light text-blue-400">Solutions</span></h1>
                <p className="text-xs text-slate-400 hidden sm:block">Sistema de Gestión Legal</p>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {/* Search Button */}
              <button 
                onClick={() => setShowSearch(true)}
                className="p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="Buscar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <Link href="/casos" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition">
                📁 Casos
              </Link>
              <Link href="/clientes" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition">
                👥 Clientes
              </Link>
              <Link href="/agenda" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition">
                📅 Agenda
              </Link>
              <Link href="/ai" className="ml-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25 transition">
                🤖 Asistente IA
              </Link>
            </nav>

            {/* Mobile: Search + Menu */}
            <div className="flex items-center gap-2 md:hidden">
              <button 
                onClick={() => setShowSearch(true)}
                className="p-2 rounded-lg hover:bg-white/10"
                title="Buscar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg hover:bg-white/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMenu && (
            <div className="md:hidden pb-4 space-y-2">
              <Link href="/casos" className="block px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10">📁 Casos</Link>
              <Link href="/clientes" className="block px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10">👥 Clientes</Link>
              <Link href="/agenda" className="block px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10">📅 Agenda</Link>
              <Link href="/ai" className="block px-4 py-3 rounded-lg bg-blue-600 text-center font-semibold">🤖 Asistente IA</Link>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Bienvenido 👋</h2>
              <p className="text-blue-100">Gestiona tus casos legales de manera inteligente</p>
            </div>
            <Link href="/ai" className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition shadow-lg">
              <span className="text-xl">🤖</span>
              <span>Consultar Asistente IA</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Casos</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Activos</p>
                <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔔</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Audiencias Hoy</p>
                <p className="text-2xl font-bold text-amber-600">{stats.audienciasHoy}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Tareas</p>
                <p className="text-2xl font-bold text-red-600">{stats.tareasPendientes}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Link href="/casos/nuevo" className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition group">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition">
              <span className="text-lg">+</span>
            </div>
            <span className="font-medium text-slate-700">Nuevo Caso</span>
          </Link>
          <Link href="/clientes/nuevo" className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 hover:border-green-200 hover:shadow-md transition group">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition">
              <span className="text-lg">+</span>
            </div>
            <span className="font-medium text-slate-700">Nuevo Cliente</span>
          </Link>
          <Link href="/agenda/nueva" className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:shadow-md transition group">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition">
              <span className="text-lg">+</span>
            </div>
            <span className="font-medium text-slate-700">Nueva Audiencia</span>
          </Link>
          <Link href="/tareas/nueva" className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-md transition group">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition">
              <span className="text-lg">+</span>
            </div>
            <span className="font-medium text-slate-700">Nueva Tarea</span>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Cases - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-semibold text-lg text-slate-800">📁 Casos Recientes</h2>
              <Link href="/casos" className="text-blue-600 text-sm font-medium hover:underline">Ver todos →</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {cases.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="text-5xl mb-4 block">📂</span>
                  <p className="text-slate-500 mb-4">No hay casos registrados</p>
                  <Link href="/casos/nuevo" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline">
                    <span>+</span> Crear primer caso
                  </Link>
                </div>
              ) : (
                cases.map(c => (
                  <Link href={`/casos/${c.id}`} key={c.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition">
                        <span className="text-lg">📄</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{c.matter}</p>
                        <p className="text-sm text-slate-500">{c.client.name} • {c.caseNumber || 'Sin expediente'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {CASE_TYPES[c.caseType] || c.caseType}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        c.status === 'activo' ? 'bg-green-100 text-green-700' :
                        c.status === 'suspendido' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{c.status}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Hearings */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">📅 Próximas Audiencias</h2>
              </div>
              <div className="p-4 space-y-3">
                {hearings.length === 0 ? (
                  <div className="text-center py-6">
                    <span className="text-3xl block mb-2">📆</span>
                    <p className="text-slate-400 text-sm">Sin audiencias próximas</p>
                  </div>
                ) : (
                  hearings.slice(0, 3).map(h => (
                    <div key={h.id} className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg hover:from-blue-50 hover:to-blue-100 transition cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-lg">⚖️</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-800 truncate">{h.type}</p>
                          <p className="text-xs text-slate-500 truncate">{h.case.matter}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                          {new Date(h.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-slate-500">{h.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">✅ Tareas Pendientes</h2>
              </div>
              <div className="p-4 space-y-2">
                {tasks.length === 0 ? (
                  <div className="text-center py-6">
                    <span className="text-3xl block mb-2">📝</span>
                    <p className="text-slate-400 text-sm">Sin tareas pendientes</p>
                  </div>
                ) : (
                  tasks.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition">
                      <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700">{t.title}</p>
                        {t.dueDate && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Vence: {new Date(t.dueDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.priority === 'alta' ? 'bg-red-100 text-red-600' :
                        t.priority === 'media' ? 'bg-amber-100 text-amber-600' :
                        'bg-green-100 text-green-600'
                      }`}>{t.priority}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Card */}
            <Link href="/ai" className="block bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-lg hover:shadow-xl transition group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                  <span className="text-3xl">🤖</span>
                </div>
                <div>
                  <p className="font-bold text-lg">Asistente Legal IA</p>
                  <p className="text-sm text-slate-400">Powered by Claude</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-300">Analiza casos, redacta escritos y encuentra jurisprudencia con inteligencia artificial.</p>
              <div className="mt-4 flex items-center text-blue-400 text-sm font-medium">
                Consultar ahora <span className="ml-2 group-hover:translate-x-1 transition">→</span>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">⚖️</span>
            <span className="font-bold text-white">LEGAL <span className="font-light text-blue-400">Solutions</span></span>
          </div>
          <p className="text-sm mb-2">Hecho por <span className="text-blue-400 font-semibold">Colmena (C6)</span> • 28/12/2025</p>
          <Link href="/privacidad" className="text-xs hover:text-white transition">Aviso de Privacidad</Link>
        </div>
      </footer>
    </div>
  );
}
