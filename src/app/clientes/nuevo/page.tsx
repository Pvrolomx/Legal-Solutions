'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import mammoth from 'mammoth';

export default function NuevoClientePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '', rfc: '', curp: '', phone: '', email: '', address: '', notes: '',
  });

  const parseDocxContent = (text: string) => {
    const lines = text.split('\n');
    const data: Record<string, string> = {};
    
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim().toUpperCase();
        const value = parts.slice(1).join(':').trim();
        data[key] = value;
      }
    }
    
    // Map DOCX fields to form fields
    setForm({
      name: data['NOMBRE'] || data['NOMBRE COMPLETO'] || '',
      rfc: data['RFC'] || '',
      curp: data['CURP'] || '',
      phone: data['TELEFONO PERSONAL'] || data['TELEFONO'] || data['TELEFONO DE CASA'] || '',
      email: data['EMAIL'] || data['CORREO'] || '',
      address: data['DOMICILIO'] || data['DIRECCION'] || '',
      notes: [
        data['ESTADO CIVIL (INDICAR RÉGIMEN)'] ? `Estado Civil: ${data['ESTADO CIVIL (INDICAR RÉGIMEN)']}` : '',
        data['FECHA DE NACIMIENTO'] ? `Nacimiento: ${data['FECHA DE NACIMIENTO']}` : '',
        data['LUGAR DE NACIMIENTO'] ? `Lugar: ${data['LUGAR DE NACIMIENTO']}` : '',
        data['NACIONALIDAD'] ? `Nacionalidad: ${data['NACIONALIDAD']}` : '',
        data['IDENTIFICACIÓN'] ? `ID: ${data['IDENTIFICACIÓN']}` : '',
        data['ACTIVIDAD PRINCIPAL'] ? `Actividad: ${data['ACTIVIDAD PRINCIPAL']}` : '',
      ].filter(Boolean).join('\n'),
    });
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      parseDocxContent(result.value);
      alert('✅ Datos importados correctamente');
    } catch (error) {
      console.error('Error importing:', error);
      alert('Error al importar archivo');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      alert('Nombre y teléfono son requeridos');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push('/');
    } else {
      alert('Error al guardar');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="pt-6 px-4">
        <div className="max-w-lg mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-4">
            <span>←</span> Volver
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Nuevo Cliente</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Import Button */}
        <div className="mb-4">
          <input
            type="file"
            ref={fileInputRef}
            accept=".docx"
            onChange={handleFileImport}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {importing ? (
              <>⏳ Importando...</>
            ) : (
              <>📄 Importar desde Word (.docx)</>
            )}
          </button>
          <p className="text-xs text-slate-400 mt-1 text-center">
            Sube un archivo &quot;Datos Generales&quot; para autorellenar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nombre completo *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Nombre del cliente"
              className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono *</label>
            <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              placeholder="10 dígitos"
              className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">RFC</label>
              <input type="text" value={form.rfc} onChange={e => setForm({...form, rfc: e.target.value})}
                placeholder="RFC"
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">CURP</label>
              <input type="text" value={form.curp} onChange={e => setForm({...form, curp: e.target.value})}
                placeholder="CURP"
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Dirección</label>
            <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
              placeholder="Dirección completa"
              className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              rows={3} placeholder="Notas adicionales..."
              className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg transition disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar Cliente'}
          </button>
        </form>
      </main>
    </div>
  );
}
