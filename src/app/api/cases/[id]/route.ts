import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, phone: true, email: true } },
      hearings: { orderBy: { date: 'asc' }, take: 10 },
      documents: { orderBy: { createdAt: 'desc' }, take: 10 },
      tasks: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });
  
  if (!caseData) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }
  
  return NextResponse.json(caseData);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  
  const updated = await prisma.case.update({
    where: { id },
    data: {
      caseNumber: data.caseNumber || null,
      matter: data.matter,
      caseType: data.caseType,
      status: data.status,
      court: data.court || null,
      judge: data.judge || null,
      opponent: data.opponent || null,
      opponentLawyer: data.opponentLawyer || null,
      description: data.description || null,
      notes: data.notes || null,
    },
  });
  
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  await prisma.case.delete({ where: { id } });
  
  return NextResponse.json({ success: true });
}
