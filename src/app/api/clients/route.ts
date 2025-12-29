import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const data = await request.json();
  
  const client = await prisma.client.create({
    data: {
      name: data.name,
      rfc: data.rfc,
      curp: data.curp,
      phone: data.phone,
      email: data.email,
      address: data.address,
      notes: data.notes,
    },
  });
  
  return NextResponse.json(client);
}
