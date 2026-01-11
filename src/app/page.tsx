'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LegalAIcon from '@/components/LegalAIcon';
import EscritosSection from '@/components/EscritosSection';

interface Client { id: string; name: string; phone: string; email: string | null; }
interface Case { id: string; matter: string; caseNumber: string | null; status: string; client: { name: string }; }

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async (section: string) => {
    setLoading(true);
    if (section === 'cliente') {
      const res = await fetch('/api/clients');
      setClients(await res.json() || []);
    } else if (section === 'expediente') {
      const res = await fetch('/api/cases?limit=20');
      const data = await res.json();
      setCases(data.cases || []);
    }
    setLoading(false);
  };

  const handleSectionClick = async (section: string) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
      if (section === 'cliente' || section === 'expediente') {
        await loadData(section);
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 pt-6 pb-4 px-6">
        <div className="max-w-lg mx-auto text-center">
          <img src="/logo.png" alt="Legal Solutions" className="h-20 mx-auto mb-2" />
          <p className="text-stone-500 text-sm">Sistema de Gestión Legal con IA</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-lg mx-auto">
        {!activeSection ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Cliente */}
            <button onClick={() => handleSectionClick('cliente')}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
              <img src="/btn-cliente.jpg" alt="Cliente" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-gradient-to-t from-white to-transparent -mt-8 relative">
                <span className="text-stone-800 font-semibold text-lg block">Cliente</span>
                <span className="text-stone-400 text-xs">Ver y agregar</span>
              </div>
            </button>

            {/* Expediente */}
            <button onClick={() => handleSectionClick('expediente')}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
              <img src="/btn-expediente.jpg" alt="Expediente" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-gradient-to-t from-white to-transparent -mt-8 relative">
                <span className="text-stone-800 font-semibold text-lg block">Expediente</span>
                <span className="text-stone-400 text-xs">Casos legales</span>
              </div>
            </button>

            {/* Escrito */}
            <button onClick={() => handleSectionClick('escrito')}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
              <img src="/btn-escrito.jpg" alt="Escrito" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-gradient-to-t from-white to-transparent -mt-8 relative">
                <span className="text-stone-800 font-semibold text-lg block">Escrito</span>
                <span className="text-stone-400 text-xs">Documentos</span>
              </div>
            </button>

            {/* Agenda */}
            <button onClick={() => handleSectionClick('agenda')}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
              <img src="/btn-agenda.jpg" alt="Agenda" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-gradient-to-t from-white to-transparent -mt-8 relative">
                <span className="text-stone-800 font-semibold text-lg block">Agenda</span>
                <span className="text-stone-400 text-xs">Citas y audiencias</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="animate-fadeIn">
            {/* Back button */}
            <button onClick={() => setActiveSection(null)}
              className="mb-4 flex items-center gap-2 text-stone-500 hover:text-stone-800 transition">
              <span>←</span> <span>Volver</span>
            </button>

            {/* Cliente Section */}
            {activeSection === 'cliente' && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img src="/btn-cliente.jpg" alt="Cliente" className="w-12 h-12 rounded-xl object-cover" />
                    <h2 className="text-xl font-bold text-stone-800">Clientes</h2>
                  </div>
                  <Link href="/clientes/nuevo" className="px-4 py-2 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-xl font-medium text-sm shadow-md hover:from-emerald-600 hover:to-emerald-700 transition">
                    + Nuevo
                  </Link>
                </div>
                
                {loading ? (
                  <p className="text-stone-400 text-center py-8">Cargando...</p>
                ) : clients.length === 0 ? (
                  <div className="text-center py-8">
                    <img src="/btn-cliente.jpg" alt="" className="w-20 h-20 mx-auto mb-3 rounded-2xl opacity-50" />
                    <p className="text-stone-500">No hay clientes</p>
                    <Link href="/clientes/nuevo" className="text-emerald-600 font-medium mt-2 inline-block hover:underline">Agregar primero</Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {clients.map(c => (
                      <Link href={`/clientes/${c.id}`} key={c.id}
                        className="block p-4 bg-stone-50 hover:bg-emerald-50 rounded-xl transition border border-stone-100 hover:border-emerald-200">
                        <p className="font-medium text-stone-800">{c.name}</p>
                        <p className="text-sm text-stone-500">{c.phone} {c.email && `• ${c.email}`}</p>
                      </Link>
                    ))}
                  </div>
                )}
                
                <Link href="/clientes" className="block mt-4 text-center text-emerald-600 text-sm font-medium hover:underline">
                  Ver todos los clientes →
                </Link>
              </div>
            )}

            {/* Expediente Section */}
            {activeSection === 'expediente' && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img src="/btn-expediente.jpg" alt="Expediente" className="w-12 h-12 rounded-xl object-cover" />
                    <h2 className="text-xl font-bold text-stone-800">Expedientes</h2>
                  </div>
                  <Link href="/casos/nuevo" className="px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl font-medium text-sm shadow-md hover:from-blue-600 hover:to-blue-700 transition">
                    + Nuevo
                  </Link>
                </div>
                
                {loading ? (
                  <p className="text-stone-400 text-center py-8">Cargando...</p>
                ) : cases.length === 0 ? (
                  <div className="text-center py-8">
                    <img src="/btn-expediente.jpg" alt="" className="w-20 h-20 mx-auto mb-3 rounded-2xl opacity-50" />
                    <p className="text-stone-500">No hay expedientes</p>
                    <Link href="/casos/nuevo" className="text-blue-600 font-medium mt-2 inline-block hover:underline">Crear primero</Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {cases.map(c => (
                      <Link href={`/casos/${c.id}`} key={c.id}
                        className="block p-4 bg-stone-50 hover:bg-blue-50 rounded-xl transition border border-stone-100 hover:border-blue-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-stone-800">{c.matter}</p>
                            <p className="text-sm text-stone-500">{c.client.name} • {c.caseNumber || 'Sin exp.'}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            c.status === 'activo' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'
                          }`}>{c.status}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                <Link href="/casos" className="block mt-4 text-center text-blue-600 text-sm font-medium hover:underline">
                  Ver todos los expedientes →
                </Link>
              </div>
            )}

            {/* Escrito Section */}
            {activeSection === 'escrito' && (
              <EscritosSection />
            )}

            {/* Agenda Section */}
            {activeSection === 'agenda' && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
                <div className="flex items-center gap-3 mb-6">
                  <img src="/btn-agenda.jpg" alt="Agenda" className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h2 className="text-xl font-bold text-stone-800">Agenda</h2>
                    <p className="text-sm text-stone-500">Citas y audiencias</p>
                  </div>
                </div>
                
                <p className="text-stone-600 mb-6">Gestiona tus compromisos legales</p>
                
                <Link href="/agenda" className="block mt-4 text-center py-3 bg-gradient-to-b from-teal-500 to-teal-600 text-white rounded-xl font-semibold shadow-md hover:from-teal-600 hover:to-teal-700 transition">
                  Ver agenda completa →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        {!activeSection && (
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/tareas" className="px-4 py-2 bg-white rounded-xl text-stone-600 font-medium text-sm shadow border border-stone-200 hover:border-amber-300 transition">
              ✅ Tareas
            </Link>
            <Link href="/ai" className="px-4 py-2 bg-white rounded-xl text-stone-600 font-medium text-sm shadow border border-stone-200 hover:border-amber-300 transition">
              🤖 IA
            </Link>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <LegalAIcon size={28} color="#a8a29e" strokeWidth={3} dotRadius={2} className="mx-auto mb-2" />
          <p className="text-stone-400 text-sm">
            Hecho por <span className="text-amber-600">Colmena</span> - C6 (Mike) 2026
          </p>
        </footer>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
