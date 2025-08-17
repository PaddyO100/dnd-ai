import { NextResponse } from 'next/server'
import { z } from 'zod'
import { roll } from '@/lib/engine/dice'

// Note: API routes are server-only. We cannot use the client store directly here.
// Instead, accept an optional seed in request, or ignore for now.

const Input = z.object({ formula: z.string().min(2), seed: z.number().optional() })

export async function POST(req: Request) {
  try {
    const data = Input.parse(await req.json())
    const out = roll(data.formula, data.seed)
    return NextResponse.json(out)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Dice error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
