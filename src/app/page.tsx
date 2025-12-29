'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LegalAIcon from '@/components/LegalAIcon';

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
    <div className="min-h-screen bg-stone-50">
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
              className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg border border-stone-200 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 active:scale-95">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-stone-800 font-semibold text-lg">Cliente</span>
              <span className="text-stone-400 text-xs mt-1">Ver y agregar</span>
            </button>

            {/* Expediente */}
            <button onClick={() => handleSectionClick('expediente')}
              className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg border border-stone-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 active:scale-95">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <span className="text-stone-800 font-semibold text-lg">Expediente</span>
              <span className="text-stone-400 text-xs mt-1">Casos legales</span>
            </button>

            {/* Escrito */}
            <button onClick={() => handleSectionClick('escrito')}
              className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg border border-stone-200 hover:shadow-xl hover:border-purple-300 transition-all duration-300 active:scale-95">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-purple-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-stone-800 font-semibold text-lg">Escrito</span>
              <span className="text-stone-400 text-xs mt-1">Documentos</span>
            </button>

            {/* IA */}
            <button onClick={() => handleSectionClick('ia')}
              className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg border border-stone-200 hover:shadow-xl hover:border-amber-300 transition-all duration-300 active:scale-95">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-amber-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-stone-800 font-semibold text-lg">IA</span>
              <span className="text-stone-400 text-xs mt-1">Asistente legal</span>
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
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
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
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
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
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
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
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
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
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-stone-800">Escritos</h2>
                  </div>
                </div>
                
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <p className="text-stone-500 mb-4">Genera escritos legales con IA</p>
                  <Link href="/ai" className="inline-block px-6 py-3 bg-gradient-to-b from-purple-500 to-purple-600 text-white rounded-xl font-medium shadow-md hover:from-purple-600 hover:to-purple-700 transition">
                    Generar con IA
                  </Link>
                </div>
              </div>
            )}

            {/* IA Section */}
            {activeSection === 'ia' && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-stone-800">Asistente Legal IA</h2>
                    <p className="text-sm text-stone-500">Haiku + Sonnet</p>
                  </div>
                </div>
                
                <p className="text-stone-600 mb-6">¿En qué puedo ayudarte?</p>
                
                <div className="space-y-3">
                  <Link href="/ai?prompt=redactar" className="block p-4 bg-stone-50 hover:bg-amber-50 rounded-xl transition border border-stone-100 hover:border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">Redactar escrito legal</p>
                        <p className="text-sm text-stone-500">Demandas, contestaciones, recursos...</p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/ai?prompt=analizar" className="block p-4 bg-stone-50 hover:bg-amber-50 rounded-xl transition border border-stone-100 hover:border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">Analizar caso</p>
                        <p className="text-sm text-stone-500">Estrategia, fortalezas, debilidades...</p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/ai?prompt=jurisprudencia" className="block p-4 bg-stone-50 hover:bg-amber-50 rounded-xl transition border border-stone-100 hover:border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">Buscar jurisprudencia</p>
                        <p className="text-sm text-stone-500">Precedentes y criterios aplicables...</p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/ai?prompt=interrogatorio" className="block p-4 bg-stone-50 hover:bg-amber-50 rounded-xl transition border border-stone-100 hover:border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">Preparar interrogatorio</p>
                        <p className="text-sm text-stone-500">Preguntas para testigos...</p>
                      </div>
                    </div>
                  </Link>
                </div>
                
                <Link href="/ai" className="block mt-6 text-center py-3 bg-gradient-to-b from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-md hover:from-amber-600 hover:to-orange-600 transition">
                  Abrir chat completo →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        {!activeSection && (
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/agenda" className="px-4 py-2 bg-white rounded-xl text-stone-600 font-medium text-sm shadow border border-stone-200 hover:border-amber-300 transition">
              📅 Agenda
            </Link>
            <Link href="/tareas" className="px-4 py-2 bg-white rounded-xl text-stone-600 font-medium text-sm shadow border border-stone-200 hover:border-amber-300 transition">
              ✅ Tareas
            </Link>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <LegalAIcon size={28} color="#a8a29e" strokeWidth={3} dotRadius={2} className="mx-auto mb-2" />
          <p className="text-stone-400 text-sm">
            Hecho por <span className="text-amber-600">Colmena (C6)</span> • 2025
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
