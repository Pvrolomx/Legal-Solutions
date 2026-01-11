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
    name: '', 
    rfc: '', 
    curp: '', 
    phone: '', 
    phone2: '',
    email: '', 
    address: '', 
    estadoCivil: '',
    fechaNacimiento: '',
    lugarNacimiento: '',
    nacionalidad: '',
    identificacion: '',
    actividad: '',
    notes: '',
  });

  const parseDocxContent = (text: string) => {
    const lines = text.split('\n');
    const data: Record<string, string> = {};
    
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim().toUpperCase();
        const value = line.substring(colonIdx + 1).trim();
        if (value) data[key] = value;
      }
    }
    
    setForm({
      name: data['NOMBRE'] || '',
      rfc: data['RFC'] || '',
      curp: data['CURP'] || '',
      phone: data['TELEFONO PERSONAL'] || data['TELEFONO'] || '',
      phone2: data['TELEFONO DE CASA'] || '',
      email: data['EMAIL'] || data['CORREO'] || '',
      address: data['DOMICILIO'] || data['DIRECCION'] || '',
      estadoCivil: data['ESTADO CIVIL (INDICAR RÉGIMEN)'] || data['ESTADO CIVIL'] || '',
      fechaNacimiento: data['FECHA DE NACIMIENTO'] || '',
      lugarNacimiento: data['LUGAR DE NACIMIENTO'] || '',
      nacionalidad: data['NACIONALIDAD'] || '',
      identificacion: data['IDENTIFICACIÓN'] || data['IDENTIFICACION'] || '',
      actividad: data['ACTIVIDAD PRINCIPAL'] || data['OCUPACION'] || '',
      notes: '',
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

  const inputClass = "w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="pt-6 px-4">
        <div className="max-w-lg mx-auto">
          <Link href="/clientes" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-4">
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
        <div className="mb-4">
          <input type="file" ref={fileInputRef} accept=".docx" onChange={handleFileImport} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={importing}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50">
            {importing ? '⏳ Importando...' : '📄 Importar desde Word (.docx)'}
          </button>
          <p className="text-xs text-slate-400 mt-1 text-center">Sube un archivo Datos Generales para autorellenar</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nombre completo *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nombre del cliente" className={inputClass} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">RFC</label>
              <input type="text" value={form.rfc} onChange={e => setForm({...form, rfc: e.target.value})} placeholder="RFC" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">CURP</label>
              <input type="text" value={form.curp} onChange={e => setForm({...form, curp: e.target.value})} placeholder="CURP" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono *</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Teléfono personal" className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono 2</label>
              <input type="tel" value={form.phone2} onChange={e => setForm({...form, phone2: e.target.value})} placeholder="Casa/Oficina" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="correo@ejemplo.com" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Domicilio</label>
            <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Dirección completa" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Estado Civil</label>
              <input type="text" value={form.estadoCivil} onChange={e => setForm({...form, estadoCivil: e.target.value})} placeholder="Casado, Soltero..." className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nacionalidad</label>
              <input type="text" value={form.nacionalidad} onChange={e => setForm({...form, nacionalidad: e.target.value})} placeholder="Mexicana, USA..." className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Fecha Nacimiento</label>
              <input type="text" value={form.fechaNacimiento} onChange={e => setForm({...form, fechaNacimiento: e.target.value})} placeholder="DD/MM/AAAA" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Lugar Nacimiento</label>
              <input type="text" value={form.lugarNacimiento} onChange={e => setForm({...form, lugarNacimiento: e.target.value})} placeholder="Ciudad, País" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Identificación</label>
            <input type="text" value={form.identificacion} onChange={e => setForm({...form, identificacion: e.target.value})} placeholder="INE, Pasaporte, etc." className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Actividad/Ocupación</label>
            <input type="text" value={form.actividad} onChange={e => setForm({...form, actividad: e.target.value})} placeholder="Profesión u oficio" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} placeholder="Notas adicionales..." className={inputClass} />
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg transition disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar Cliente'}
          </button>
        </form>
      
        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-slate-500 text-sm">
            Hecho por <span className="text-amber-500">Colmena</span> - C6 (Mike) 2026
          </p>
        </footer>
      </main>
    </div>
  );
}
