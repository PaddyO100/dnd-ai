import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateFantasyName } from '@/lib/ai/nameGenerator'
import type { Race, Gender } from '@/schemas/character'

const Input = z.object({
  race: z.string(),
  gender: z.string(),
  scenarioTitle: z.string().optional(),
})

export async function POST(req: Request) {
  const data = Input.parse(await req.json())

  const name = generateFantasyName(data.race as Race, data.gender as Gender, data.scenarioTitle)

  return NextResponse.json({ name })
}
