import { NextResponse } from 'next/server'
import { z } from 'zod'
import { openrouter, OPENROUTER_MODEL } from '@/lib/ai/openrouter'
import { generateInitialQuests } from '@/lib/engine/questGenerator'

const Input = z.object({
  scenario: z.object({ id: z.string().optional(), title: z.string().optional(), summary: z.string().optional() }).optional(),
  selections: z.object({
    genre: z.string().optional(),
    frame: z.string().optional(),
    world: z.object({ magic: z.string().optional(), climate: z.string().optional() }).optional(),
    conflict: z.string().optional()
  }).optional(),
  party: z.array(z.object({
    id: z.string(),
    name: z.string(),
    cls: z.string().optional(),
    race: z.string().optional(),
    gender: z.string().optional(),
  })).default([])
})

const Quest = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.enum(['main','side','personal','guild']).optional(),
  status: z.enum(['open','in-progress','completed','failed']).optional().default('in-progress'),
  priority: z.enum(['low','medium','high','urgent']).optional().default('medium'),
  progress: z.object({ current: z.number().int().nonnegative(), total: z.number().int().positive(), description: z.string().optional() }).optional(),
  location: z.string().optional(),
  giver: z.string().optional(),
  timeLimit: z.number().optional(),
  rewards: z.array(z.string()).optional(),
  note: z.string().optional(),
})

export async function POST(req: Request) {
  const data = Input.parse(await req.json())

  // Build a concise system + user prompt
  const sys = 'Du bist ein Quest-Designer für ein Fantasy-RPG. Antworte NUR mit gültigem JSON.'
  const parts: string[] = []
  if (data.selections?.genre) parts.push(`Genre: ${data.selections.genre}`)
  if (data.selections?.frame) parts.push(`Rahmen: ${data.selections.frame}`)
  if (data.selections?.world?.magic) parts.push(`Magie: ${data.selections.world.magic}`)
  if (data.selections?.world?.climate) parts.push(`Klima: ${data.selections.world.climate}`)
  if (data.selections?.conflict) parts.push(`Konflikt: ${data.selections.conflict}`)
  if (data.scenario?.title) parts.push(`Szenario: ${data.scenario.title}`)
  const party = data.party.map(p => `${p.name} (${[p.cls,p.race,p.gender].filter(Boolean).join(', ')})`).join('; ')

  const user = `
Erzeuge 3-5 Quests als JSON unter dem Schlüssel "quests".
Orientiere dich an folgenden Informationen:
${parts.join(' | ')}
Gruppe: ${party || 'Unbekannt'}

Questschema:
{
  "quests": [
    {
      "title": "…",
      "description": "…",
      "category": "main|side|personal|guild",
      "status": "open|in-progress|completed|failed",
      "priority": "low|medium|high|urgent",
      "progress": { "current": 0, "total": 3, "description": "…" },
      "location": "…",
      "giver": "…",
      "rewards": ["…"],
      "note": "knappe Anweisung für die Spieler"
    }
  ]
}

Nur gültiges JSON ausgeben, keine Erklärungen.`

  const model = OPENROUTER_MODEL
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      // Fallback when no key present
  const simpleScenario = data.scenario ? { id: (data.scenario.id || 'scn') as string, title: (data.scenario.title || 'Unbekannt') as string } : undefined
  const fallback = generateInitialQuests(simpleScenario, data.party.map(p => ({ id: p.id, name: p.name, cls: p.cls })) )
      return NextResponse.json({ quests: fallback })
    }
    const chat = await openrouter.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user }
      ],
      temperature: 0.8,
    })
    let raw = chat.choices?.[0]?.message?.content || '{}'
    raw = raw.trim().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(raw)
    const arr = Array.isArray(parsed.quests) ? parsed.quests : []
    const quests = z.array(Quest).safeParse(arr)
    if (!quests.success) {
  const simpleScenario = data.scenario ? { id: (data.scenario.id || 'scn') as string, title: (data.scenario.title || 'Unbekannt') as string } : undefined
  const fallback = generateInitialQuests(simpleScenario, data.party.map(p => ({ id: p.id, name: p.name, cls: p.cls })) )
      return NextResponse.json({ quests: fallback })
    }
    return NextResponse.json({ quests: quests.data })
  } catch (err) {
    console.error('OpenRouter request failed (quests):', err)
  const simpleScenario = data.scenario ? { id: (data.scenario.id || 'scn') as string, title: (data.scenario.title || 'Unbekannt') as string } : undefined
  const fallback = generateInitialQuests(simpleScenario, data.party.map(p => ({ id: p.id, name: p.name, cls: p.cls })) )
    return NextResponse.json({ quests: fallback })
  }
}
