'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          caseContext: selectedCase,
          history: messages.slice(-10), // Last 10 messages for context
        }),
      });

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message}. Por favor intenta de nuevo.` 
      }]);
    }

    setLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-3xl">⚖️</Link>
            <div>
              <h1 className="text-xl font-bold">LEGAL <span className="text-blue-400 font-light">Solutions</span></h1>
              <p className="text-xs text-slate-400">Asistente Legal IA</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedCase?.id || ''} 
              onChange={(e) => setSelectedCase(cases.find(c => c.id === e.target.value) || null)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm"
            >
              <option value="">Sin caso seleccionado</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.caseNumber || c.matter}</option>
              ))}
            </select>
            <button onClick={clearChat} className="text-sm text-slate-400 hover:text-white">
              Limpiar chat
            </button>
            <Link href="/" className="text-sm text-slate-400 hover:text-white">← Volver</Link>
          </div>
        </div>
      </header>

      {/* Case Context Banner */}
      {selectedCase && (
        <div className="bg-blue-900 text-blue-100 px-6 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-sm">
            <span>
              <strong>Caso activo:</strong> {selectedCase.matter} | {selectedCase.caseType} | {selectedCase.court || 'Sin juzgado'}
            </span>
            <button onClick={() => setSelectedCase(null)} className="text-blue-300 hover:text-white">✕</button>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-6xl mb-4">🤖⚖️</p>
              <h2 className="text-xl font-semibold text-slate-700 mb-2">Asistente Legal IA</h2>
              <p className="text-slate-500 mb-6">
                Powered by Claude • Especializado en derecho mexicano
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(qp.prompt)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 hover:border-slate-300 transition"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}>
                <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="animate-pulse">●</div>
                  <div className="animate-pulse animation-delay-200">●</div>
                  <div className="animate-pulse animation-delay-400">●</div>
                  <span className="ml-2 text-sm">Analizando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border border-slate-200 rounded-lg p-3">
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
              className="flex-1 resize-none border-0 focus:ring-0 text-sm"
              rows={2}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="self-end bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : 'Enviar'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-3">
          Este asistente proporciona orientación general. Siempre verifica la información con fuentes oficiales.
        </p>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-4 text-center text-sm">
        Hecho por <span className="text-blue-400">Colmena (C6)</span> • 28/12/2025
      </footer>
    </div>
  );
}
