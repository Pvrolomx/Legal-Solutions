import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar documentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const caseId = searchParams.get('caseId');

    const where: any = {};
    if (category) where.category = category;
    if (caseId) where.caseId = caseId;

    const documents = await prisma.document.findMany({
      where,
      select: {
        id: true,
        name: true,
        docType: true,
        filename: true,
        size: true,
        category: true,
        createdAt: true,
        case: {
          select: { id: true, matter: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json({ error: 'Error al listar documentos' }, { status: 500 });
  }
}

// POST - Subir documento
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string || file?.name || 'Sin nombre';
    const category = formData.get('category') as string || 'documento';
    const caseId = formData.get('caseId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    // Convertir archivo a Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Determinar tipo de documento
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const docType = ext === 'pdf' ? 'PDF' : ext === 'docx' ? 'Word' : ext.toUpperCase();

    const document = await prisma.document.create({
      data: {
        name,
        docType,
        filename: file.name,
        data: base64,
        size: file.size,
        category,
        caseId: caseId || null
      }
    });

    return NextResponse.json({ 
      success: true, 
      document: {
        id: document.id,
        name: document.name,
        filename: document.filename,
        size: document.size,
        category: document.category
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: 'Error al subir documento' }, { status: 500 });
  }
}
