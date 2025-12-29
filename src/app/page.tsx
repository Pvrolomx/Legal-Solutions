'use client';

import { useEffect, useState } from 'react';
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

const CASE_TYPES: Record<string, string> = {
  civil: 'Civil',
  penal: 'Penal',
  familiar: 'Familiar',
  mercantil: 'Mercantil',
  laboral: 'Laboral',
  amparo: 'Amparo',
  administrativo: 'Administrativo',
};

const STATUS_COLORS: Record<string, string> = {
  activo: 'bg-green-100 text-green-700',
  suspendido: 'bg-yellow-100 text-yellow-700',
  cerrado: 'bg-gray-100 text-gray-600',
  archivado: 'bg-stone-100 text-stone-600',
};

export default function Dashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ total: 0, activos: 0, audienciasHoy: 0, tareasPendientes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [casesRes, hearingsRes, tasksRes] = await Promise.all([
        fetch('/api/cases?limit=5'),
        fetch('/api/hearings/upcoming'),
        fetch('/api/tasks?status=pendiente&limit=5'),
      ]);
      
      const casesData = await casesRes.json();
      const hearingsData = await hearingsRes.json();
      const tasksData = await tasksRes.json();
      
      setCases(casesData.cases || []);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚖️</span>
            <h1 className="text-2xl font-bold">LEGAL <span className="font-light text-blue-400">Solutions</span></h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/casos" className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700">Casos</Link>
            <Link href="/clientes" className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700">Clientes</Link>
            <Link href="/agenda" className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700">Agenda</Link>
            <Link href="/tareas" className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700">Tareas</Link>
            <Link href="/ai" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700">🤖 Asistente IA</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-blue-500">
            <p className="text-sm text-slate-500">Total Casos</p>
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-slate-500">Casos Activos</p>
            <p className="text-3xl font-bold text-green-600">{stats.activos}</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-amber-500">
            <p className="text-sm text-slate-500">Audiencias Hoy</p>
            <p className="text-3xl font-bold text-amber-600">{stats.audienciasHoy}</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-red-500">
            <p className="text-sm text-slate-500">Tareas Pendientes</p>
            <p className="text-3xl font-bold text-red-600">{stats.tareasPendientes}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Recent Cases */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-lg">Casos Recientes</h2>
              <Link href="/casos" className="text-blue-600 text-sm hover:underline">Ver todos →</Link>
            </div>
            <div className="divide-y">
              {cases.length === 0 ? (
                <p className="p-5 text-slate-400 text-center">No hay casos registrados</p>
              ) : (
                cases.map(c => (
                  <Link href={`/casos/${c.id}`} key={c.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <p className="font-medium">{c.matter}</p>
                      <p className="text-sm text-slate-500">{c.client.name} • {c.caseNumber || 'Sin expediente'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-slate-100">{CASE_TYPES[c.caseType] || c.caseType}</span>
                      <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Hearings */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-5 py-4 border-b">
                <h2 className="font-semibold">Próximas Audiencias</h2>
              </div>
              <div className="p-4 space-y-3">
                {hearings.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center">Sin audiencias próximas</p>
                ) : (
                  hearings.slice(0, 3).map(h => (
                    <div key={h.id} className="p-3 bg-slate-50 rounded">
                      <p className="font-medium text-sm">{h.type}</p>
                      <p className="text-xs text-slate-500">{h.case.matter}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        {new Date(h.date).toLocaleDateString('es-MX')} • {h.time}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-5 py-4 border-b">
                <h2 className="font-semibold">Tareas Pendientes</h2>
              </div>
              <div className="p-4 space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center">Sin tareas pendientes</p>
                ) : (
                  tasks.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded">
                      <input type="checkbox" className="rounded" />
                      <div className="flex-1">
                        <p className="text-sm">{t.title}</p>
                        {t.dueDate && (
                          <p className="text-xs text-slate-400">
                            Vence: {new Date(t.dueDate).toLocaleDateString('es-MX')}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        t.priority === 'alta' ? 'bg-red-100 text-red-600' :
                        t.priority === 'media' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>{t.priority}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Quick Access */}
            <Link href="/ai" className="block bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-5 shadow-sm hover:from-blue-700 hover:to-blue-800 transition">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                <div>
                  <p className="font-semibold">Asistente Legal IA</p>
                  <p className="text-sm text-blue-200">Consulta, analiza y redacta</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">Hecho por <span className="text-blue-400 font-semibold">Colmena (C6)</span> • 28/12/2025</p>
          <Link href="/privacidad" className="text-xs hover:text-white">Aviso de Privacidad</Link>
        </div>
      </footer>
    </div>
  );
}
