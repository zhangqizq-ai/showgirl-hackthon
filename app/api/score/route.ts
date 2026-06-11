import { NextResponse } from 'next/server';
import { scorePitch } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { objection, answer, persona, category } = body;
    if (!objection || !answer) {
      return NextResponse.json({ error: 'Missing objection or answer.' }, { status: 400 });
    }

    const score = await scorePitch({ objection, answer, persona, category, sessionId: body.sessionId });
    return NextResponse.json(score);
  } catch (error: any) {
    console.error('Score API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
