import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');
  
  const where: any = {};
  if (status) where.status = status;
  
  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    take: limit,
  });
  
  const total = await prisma.task.count({ where: { status: 'pendiente' } });
  
  return NextResponse.json({ tasks, total });
}

export async function POST(request: Request) {
  const data = await request.json();
  
  const task = await prisma.task.create({
    data: {
      caseId: data.caseId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority || 'media',
    },
  });
  
  return NextResponse.json(task);
}
