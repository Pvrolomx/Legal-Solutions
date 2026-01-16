import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const termino = await prisma.termino.findUnique({
    where: { id },
    include: { 
      case: { 
        select: { 
          id: true, 
          matter: true, 
          caseNumber: true,
          client: { select: { name: true } }
        } 
      } 
    },
  });
  
  if (!termino) {
    return NextResponse.json({ error: 'Término not found' }, { status: 404 });
  }
  
  return NextResponse.json(termino);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  
  const updateData: any = {};
  if (data.titulo !== undefined) updateData.titulo = data.titulo;
  if (data.descripcion !== undefined) updateData.descripcion = data.descripcion || null;
  if (data.fechaVencimiento !== undefined) updateData.fechaVencimiento = new Date(data.fechaVencimiento);
  if (data.tipo !== undefined) updateData.tipo = data.tipo;
  if (data.diasAlerta !== undefined) updateData.diasAlerta = data.diasAlerta;
  if (data.estado !== undefined) updateData.estado = data.estado;
  if (data.recordatorio !== undefined) updateData.recordatorio = data.recordatorio;
  if (data.notas !== undefined) updateData.notas = data.notas || null;
  
  const updated = await prisma.termino.update({
    where: { id },
    data: updateData,
  });
  
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  await prisma.termino.delete({ where: { id } });
  
  return NextResponse.json({ success: true });
}
