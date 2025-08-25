import { z } from 'zod';
import { openrouter, OPENROUTER_MODEL } from '@/lib/ai/openrouter';
import { NextResponse } from 'next/server';
import { NAME_GENERATION_PROMPT } from '@/lib/ai/prompts';

const Input = z.object({
  class: z.string(),
  race: z.string(),
  gender: z.string(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const data = Input.parse(body);

  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ name: 'FallbackName' });
    }

    const chat = await openrouter.chat.completions.create({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: 'You are a fantasy name generator.' },
        { role: 'user', content: NAME_GENERATION_PROMPT(data.class, data.race, data.gender) },
      ],
      temperature: 0.8,
      max_tokens: 20,
    });

    const name = chat.choices?.[0]?.message?.content?.trim() || 'FallbackName';
    return NextResponse.json({ name });
  } catch (err: unknown) {
    console.error('Name generation failed:', err);
    return NextResponse.json({ name: 'FallbackName' });
  }
}
