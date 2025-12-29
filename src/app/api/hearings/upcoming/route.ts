import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const hearings = await prisma.hearing.findMany({
    where: {
      date: { gte: today, lte: nextWeek },
      status: 'programada',
    },
    include: {
      case: {
        select: { matter: true, client: { select: { name: true } } },
      },
    },
    orderBy: { date: 'asc' },
  });
  
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  
  const todayCount = await prisma.hearing.count({
    where: {
      date: { gte: today, lte: todayEnd },
      status: 'programada',
    },
  });
  
  return NextResponse.json({ hearings, today: todayCount });
}
