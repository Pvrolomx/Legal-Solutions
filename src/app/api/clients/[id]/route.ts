import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      cases: {
        select: { id: true, matter: true, caseNumber: true, status: true, caseType: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  
  return NextResponse.json(client);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  
  const updated = await prisma.client.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      rfc: data.rfc || null,
      curp: data.curp || null,
      address: data.address || null,
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
  
  // Delete associated cases first
  await prisma.case.deleteMany({ where: { clientId: id } });
  await prisma.client.delete({ where: { id } });
  
  return NextResponse.json({ success: true });
}
