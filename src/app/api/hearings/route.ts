import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  
  const where: any = {};
  
  if (start && end) {
    where.date = {
      gte: new Date(start),
      lte: new Date(end + 'T23:59:59'),
    };
  }
  
  const hearings = await prisma.hearing.findMany({
    where,
    include: {
      case: {
        select: { id: true, matter: true, client: { select: { name: true } } },
      },
    },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });
  
  return NextResponse.json({ hearings });
}

export async function POST(request: Request) {
  const data = await request.json();
  
  const hearing = await prisma.hearing.create({
    data: {
      caseId: data.caseId,
      date: new Date(data.date),
      time: data.time || '09:00',
      type: data.type || 'otra',
      location: data.location || null,
      notes: data.notes || null,
      status: 'programada',
    },
  });
  
  return NextResponse.json(hearing);
}
