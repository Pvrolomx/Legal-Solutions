import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estado = searchParams.get('estado');
  const proximos = searchParams.get('proximos'); // días para mostrar próximos
  const limit = parseInt(searchParams.get('limit') || '50');
  
  const where: any = {};
  if (estado) where.estado = estado;
  
  // Si se piden próximos a vencer
  if (proximos) {
    const dias = parseInt(proximos);
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);
    where.fechaVencimiento = { lte: fechaLimite };
    where.estado = 'pendiente';
  }
  
  const terminos = await prisma.termino.findMany({
    where,
    include: {
      case: { 
        select: { 
          id: true, 
          matter: true, 
          caseNumber: true,
          client: { select: { name: true } }
        } 
      },
    },
    orderBy: { fechaVencimiento: 'asc' },
    take: limit,
  });
  
  // Contar pendientes y próximos a vencer (3 días)
  const hoy = new Date();
  const tresDias = new Date();
  tresDias.setDate(tresDias.getDate() + 3);
  
  const totalPendientes = await prisma.termino.count({ 
    where: { estado: 'pendiente' } 
  });
  
  const proximosVencer = await prisma.termino.count({ 
    where: { 
      estado: 'pendiente',
      fechaVencimiento: { lte: tresDias }
    } 
  });
  
  const vencidos = await prisma.termino.count({ 
    where: { 
      estado: 'pendiente',
      fechaVencimiento: { lt: hoy }
    } 
  });
  
  return NextResponse.json({ 
    terminos, 
    stats: {
      totalPendientes,
      proximosVencer,
      vencidos
    }
  });
}

export async function POST(request: Request) {
  const data = await request.json();
  
  const termino = await prisma.termino.create({
    data: {
      caseId: data.caseId,
      titulo: data.titulo,
      descripcion: data.descripcion || null,
      fechaVencimiento: new Date(data.fechaVencimiento),
      tipo: data.tipo || 'procesal',
      diasAlerta: data.diasAlerta || 3,
      estado: 'pendiente',
      recordatorio: data.recordatorio !== false,
      notas: data.notas || null,
    },
  });
  
  return NextResponse.json(termino);
}
