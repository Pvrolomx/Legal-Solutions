'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

interface Case {
  id: string;
  caseNumber: string | null;
  matter: string;
  caseType: string;
  court: string | null;
  opponent: string | null;
  description: string | null;
}

const QUICK_PROMPTS = [
  { label: '📝 Redactar demanda', prompt: 'Ayúdame a redactar una demanda para este caso' },
  { label: '⚖️ Buscar fundamentos', prompt: '¿Cuáles son los fundamentos legales aplicables a este caso?' },
  { label: '🔍 Analizar caso', prompt: 'Analiza los elementos jurídicos de este caso y sugiere una estrategia' },
  { label: '❓ Preparar interrogatorio', prompt: 'Sugiere preguntas para el interrogatorio de testigos' },
  { label: '📅 Calcular términos', prompt: 'Ayúdame a calcular los términos legales aplicables' },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadCases(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadCases = async () => {
    try {
      const res = await fetch('/api/cases');
      const data = await res.json();
      setCases(data.cases || []);
    } catch (e) {
      console.error('Error loading cases:', e);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setCurrentModel(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          caseContext: selectedCase,
          history: messages.slice(-10),
        }),
      });

      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response,
        model: data.model 
      };
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentModel(data.model);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message}. Por favor intenta de nuevo.` 
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="pt-6 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-4">
            <span>←</span> Inicio
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Asistente Legal IA</h1>
                <p className="text-sm text-slate-400">Powered by Claude</p>
              </div>
            </div>
            <button onClick={() => setMessages([])} className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition">
              Limpiar
            </button>
          </div>
        </div>
      </header>

      {/* Case Selector */}
      <div className="px-4 py-4 max-w-3xl mx-auto w-full">
        <select 
          value={selectedCase?.id || ''} 
          onChange={(e) => setSelectedCase(cases.find(c => c.id === e.target.value) || null)}
          className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
        >
          <option value="">📁 Sin caso seleccionado (consulta general)</option>
          {cases.map(c => (
            <option key={c.id} value={c.id}>📁 {c.matter} - {c.caseNumber || 'Sin exp.'}</option>
          ))}
        </select>
        {selectedCase && (
          <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-300">
            <strong>Caso activo:</strong> {selectedCase.matter} | {selectedCase.caseType} | {selectedCase.court || 'Sin juzgado'}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 pb-4 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-5xl mb-4">🤖⚖️</p>
              <h2 className="text-xl font-semibold text-white mb-2">¿En qué puedo ayudarte?</h2>
              <p className="text-slate-400 mb-6 text-sm">
                Usa Haiku para consultas rápidas, Sonnet para tareas pesadas
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(qp.prompt)}
                    className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm text-white hover:bg-white/20 transition"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-white/10 border border-white/10 text-white'
              }`}>
                <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
                {msg.model && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-xs text-slate-400">
                    {msg.model === 'sonnet' ? '🚀 Sonnet (potente)' : '⚡ Haiku (rápido)'}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                  </div>
                  <span className="ml-2 text-sm">Pensando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-3">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Escribe tu consulta legal..."
              className="flex-1 resize-none bg-transparent border-0 focus:ring-0 text-white placeholder-slate-500 text-sm"
              rows={2}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="self-end bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? '...' : 'Enviar'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-3">
          ⚡ Haiku = consultas simples | 🚀 Sonnet = redacción y análisis
        </p>
      </main>
    </div>
  );
}
