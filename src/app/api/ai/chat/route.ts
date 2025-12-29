import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Eres un asistente legal experto en derecho mexicano. Tu rol es ayudar a abogados litigantes con:

1. ANÁLISIS DE CASOS: Analizar hechos, identificar elementos jurídicos relevantes, sugerir estrategias.

2. REDACCIÓN LEGAL: Ayudar a redactar demandas, contestaciones, recursos, amparos y otros escritos legales.

3. INVESTIGACIÓN JURÍDICA: Buscar fundamentos legales, jurisprudencia aplicable, y precedentes relevantes.

4. PREPARACIÓN DE AUDIENCIAS: Sugerir preguntas para interrogatorios, anticipar argumentos de la contraparte.

5. CÁLCULOS LEGALES: Ayudar con cálculos de términos, prescripciones, intereses legales.

REGLAS:
- Siempre cita artículos específicos de leyes mexicanas cuando sea relevante
- Menciona si la información podría estar desactualizada
- Sugiere consultar fuentes oficiales para casos específicos
- Sé preciso y profesional en tu lenguaje
- Si no estás seguro, indícalo claramente

ÁREAS DE ESPECIALIZACIÓN:
- Derecho Civil y Familiar
- Derecho Penal
- Derecho Mercantil
- Derecho Laboral
- Amparo
- Derecho Administrativo`;

export async function POST(request: Request) {
  try {
    const { message, caseContext, history } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }
    
    // Build messages array
    const messages: { role: 'user' | 'assistant'; content: string }[] = [];
    
    // Add history if provided
    if (history && Array.isArray(history)) {
      messages.push(...history);
    }
    
    // Add case context to the message if provided
    let userMessage = message;
    if (caseContext) {
      userMessage = `[CONTEXTO DEL CASO]
Expediente: ${caseContext.caseNumber || 'N/A'}
Tipo: ${caseContext.caseType || 'N/A'}
Materia: ${caseContext.matter || 'N/A'}
Juzgado: ${caseContext.court || 'N/A'}
Contraparte: ${caseContext.opponent || 'N/A'}
Descripción: ${caseContext.description || 'N/A'}

[CONSULTA]
${message}`;
    }
    
    messages.push({ role: 'user', content: userMessage });
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages,
    });
    
    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
    
    return NextResponse.json({ 
      response: assistantMessage,
      usage: response.usage,
    });
    
  } catch (error: any) {
    console.error('AI Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Error processing request' 
    }, { status: 500 });
  }
}
