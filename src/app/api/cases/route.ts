import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const status = searchParams.get('status');
  
  const where: any = {};
  if (status) where.status = status;
  
  const cases = await prisma.case.findMany({
    where,
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  
  const total = await prisma.case.count();
  const activos = await prisma.case.count({ where: { status: 'activo' } });
  
  return NextResponse.json({ cases, total, activos });
}

export async function POST(request: Request) {
  const data = await request.json();
  
  const newCase = await prisma.case.create({
    data: {
      clientId: data.clientId,
      caseNumber: data.caseNumber,
      court: data.court,
      judge: data.judge,
      caseType: data.caseType,
      matter: data.matter,
      description: data.description,
      opponent: data.opponent,
      opponentLawyer: data.opponentLawyer,
      notes: data.notes,
    },
  });
  
  return NextResponse.json(newCase);
}
