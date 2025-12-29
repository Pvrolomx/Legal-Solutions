'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LegalLogo from '@/components/LegalLogo';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="mx-auto mb-2">
            <LegalLogo width={260} />
          </div>
          <p className="text-slate-400 text-sm">Sistema de Gestión Legal con IA</p>
        </div>
      </header>

      {/* Main Grid */}
      <main className="px-4 pb-8 max-w-lg mx-auto">
        {!activeSection ? (
          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* Cliente */}
            <button onClick={() => handleSectionClick('cliente')}
              className="aspect-square bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all duration-300 active:scale-95">
              <span className="text-5xl mb-3">👤</span>
              <span className="text-white font-bold text-lg">Cliente</span>
              <span className="text-emerald-200 text-xs mt-1">Ver y agregar</span>
            </button>

            {/* Expediente */}
            <button onClick={() => handleSectionClick('expediente')}
              className="aspect-square bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl shadow-blue-500/20 hover:scale-105 transition-all duration-300 active:scale-95">
              <span className="text-5xl mb-3">📁</span>
              <span className="text-white font-bold text-lg">Expediente</span>
              <span className="text-blue-200 text-xs mt-1">Casos legales</span>
            </button>

            {/* Escrito */}
            <button onClick={() => handleSectionClick('escrito')}
              className="aspect-square bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl shadow-purple-500/20 hover:scale-105 transition-all duration-300 active:scale-95">
              <span className="text-5xl mb-3">📝</span>
              <span className="text-white font-bold text-lg">Escrito</span>
              <span className="text-purple-200 text-xs mt-1">Documentos</span>
            </button>

            {/* IA */}
            <button onClick={() => handleSectionClick('ia')}
              className="aspect-square bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl shadow-amber-500/20 hover:scale-105 transition-all duration-300 active:scale-95">
              <span className="text-5xl mb-3">🤖</span>
              <span className="text-white font-bold text-lg">IA</span>
              <span className="text-amber-200 text-xs mt-1">Asistente legal</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 animate-fadeIn">
            {/* Back button */}
            <button onClick={() => setActiveSection(null)}
              className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition">
              <span>←</span> <span>Volver</span>
            </button>

            {/* Cliente Section */}
            {activeSection === 'cliente' && (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">Clientes</h2>
                  </div>
                  <Link href="/clientes/nuevo" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition">
                    + Nuevo
                  </Link>
                </div>
                
                {loading ? (
                  <p className="text-slate-400 text-center py-8">Cargando...</p>
                ) : clients.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl block mb-2">📋</span>
                    <p className="text-slate-400">No hay clientes</p>
                    <Link href="/clientes/nuevo" className="text-emerald-400 font-medium mt-2 inline-block">Agregar primero</Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {clients.map(c => (
                      <Link href={`/clientes/${c.id}`} key={c.id}
                        className="block p-4 bg-white/5 hover:bg-white/10 rounded-xl transition">
                        <p className="font-medium text-white">{c.name}</p>
                        <p className="text-sm text-slate-400">{c.phone} {c.email && `• ${c.email}`}</p>
                      </Link>
                    ))}
                  </div>
                )}
                
                <Link href="/clientes" className="block mt-4 text-center text-emerald-400 text-sm hover:underline">
                  Ver todos los clientes →
                </Link>
              </div>
            )}

            {/* Expediente Section */}
            {activeSection === 'expediente' && (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📁</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">Expedientes</h2>
                  </div>
                  <Link href="/casos/nuevo" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition">
                    + Nuevo
                  </Link>
                </div>
                
                {loading ? (
                  <p className="text-slate-400 text-center py-8">Cargando...</p>
                ) : cases.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl block mb-2">📂</span>
                    <p className="text-slate-400">No hay expedientes</p>
                    <Link href="/casos/nuevo" className="text-blue-400 font-medium mt-2 inline-block">Crear primero</Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {cases.map(c => (
                      <Link href={`/casos/${c.id}`} key={c.id}
                        className="block p-4 bg-white/5 hover:bg-white/10 rounded-xl transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-white">{c.matter}</p>
                            <p className="text-sm text-slate-400">{c.client.name} • {c.caseNumber || 'Sin exp.'}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            c.status === 'activo' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                          }`}>{c.status}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                <Link href="/casos" className="block mt-4 text-center text-blue-400 text-sm hover:underline">
                  Ver todos los expedientes →
                </Link>
              </div>
            )}

            {/* Escrito Section */}
            {activeSection === 'escrito' && (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">Escritos</h2>
                  </div>
                  <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium text-sm transition">
                    + Nuevo
                  </button>
                </div>
                
                <div className="text-center py-8">
                  <span className="text-4xl block mb-2">📄</span>
                  <p className="text-slate-400 mb-4">Genera escritos legales con IA</p>
                  <Link href="/ai" className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition">
                    🤖 Generar con IA
                  </Link>
                </div>
              </div>
            )}

            {/* IA Section */}
            {activeSection === 'ia' && (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Asistente Legal IA</h2>
                    <p className="text-sm text-slate-400">Haiku + Sonnet</p>
                  </div>
                </div>
                
                <p className="text-slate-300 mb-6">¿En qué puedo ayudarte?</p>
                
                <div className="space-y-3">
                  <Link href="/ai?prompt=redactar" className="block p-4 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/5">
                    <p className="font-medium text-white">📝 Redactar escrito legal</p>
                    <p className="text-sm text-slate-400">Demandas, contestaciones, recursos...</p>
                  </Link>
                  <Link href="/ai?prompt=analizar" className="block p-4 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/5">
                    <p className="font-medium text-white">🔍 Analizar caso</p>
                    <p className="text-sm text-slate-400">Estrategia, fortalezas, debilidades...</p>
                  </Link>
                  <Link href="/ai?prompt=jurisprudencia" className="block p-4 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/5">
                    <p className="font-medium text-white">⚖️ Buscar jurisprudencia</p>
                    <p className="text-sm text-slate-400">Precedentes y criterios aplicables...</p>
                  </Link>
                  <Link href="/ai?prompt=interrogatorio" className="block p-4 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/5">
                    <p className="font-medium text-white">❓ Preparar interrogatorio</p>
                    <p className="text-sm text-slate-400">Preguntas para testigos...</p>
                  </Link>
                </div>
                
                <Link href="/ai" className="block mt-6 text-center py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition">
                  Abrir chat completo →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <LegalAIcon size={32} color="#64748b" strokeWidth={3} dotRadius={2} className="mx-auto mb-2" />
          <p className="text-slate-500 text-sm">
            Hecho por <span className="text-amber-500">Colmena (C6)</span> • 2025
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
