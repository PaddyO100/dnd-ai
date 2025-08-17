import { z } from 'zod'
import { openrouter, OPENROUTER_MODEL } from '@/lib/ai/openrouter'
import { SYSTEM_SCENARIO, SCENARIO_USER } from '@/lib/ai/prompts';
import { NextResponse } from 'next/server'

const Input = z.object({
  genre: z.string(),
  frame: z.string(),
  world: z.object({ magic: z.string(), tech: z.string(), climate: z.string() }),
  players: z.number().min(1).max(6),
  classes: z.array(z.string()).min(1),
  startingWeapons: z.array(z.string()).optional(),
  // aiModel removed; model is taken from environment
})

export async function POST(req: Request) {
  const body = await req.json()
  const data = Input.parse(body)

  // Helper: deterministic mock scenarios when credits are unavailable
  const mock = () => {
    const base = `${data.genre} • ${data.frame}`
    return {
      scenarios: [1, 2, 3].map((i) => ({
        id: `scn-${Date.now()}-${i}`,
        title: `${base} – Pfad ${i}`,
        summary: `In einer Welt mit ${data.world.magic.toLowerCase()} Magie, ${data.world.tech.toLowerCase()} Technologie und ${data.world.climate.toLowerCase()}m Klima entsteht ein Konflikt: ${data.frame.toLowerCase()}e Herausforderungen verlangen den Helden alles ab.`,
        mapIdea: `Region mit ${data.world.climate.toLowerCase()}m Klima; Hotspots: Stadt, Ruinen, geheimnisvoller Wald; Hook: ${data.frame}`,
      }))
    }
  }

  const selectedModel = OPENROUTER_MODEL;

  let raw = '{}' as string
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      // No key -> return mock
      return NextResponse.json(mock())
    }

    const chat = await openrouter.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: SYSTEM_SCENARIO },
        { role: 'user', content: SCENARIO_USER(data) }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }, // Enforce JSON response
    })
    raw = chat.choices?.[0]?.message?.content || '{}'
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    const status = typeof err === 'object' && err !== null
      ? (('status' in err && typeof (err as Record<string, unknown>).status === 'number')
          ? (err as Record<string, unknown>).status as number
          : ('code' in err && typeof (err as Record<string, unknown>).code === 'number')
            ? (err as Record<string, unknown>).code as number
            : undefined)
      : undefined
    // Insufficient credits or similar -> graceful mock fallback
    if (status === 402 || msg.includes('402') || /insufficient credits/i.test(msg)) {
      return NextResponse.json(mock())
    }
    // Other transport errors -> still try to continue to JSON cleanup (raw stays '{}')
    console.error('OpenRouter request failed (scenarios):', err)
  }
  
  // Enhanced JSON parsing with cleanup
  try {
    // Clean up common JSON formatting issues
    let cleanedJson = raw.trim()
    
    // Remove markdown code blocks if present
    cleanedJson = cleanedJson.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    
    // Remove any leading/trailing text that's not JSON
    const jsonStart = cleanedJson.indexOf('{')
    const jsonEnd = cleanedJson.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedJson = cleanedJson.substring(jsonStart, jsonEnd + 1)
    }
    
    const json = JSON.parse(cleanedJson)
    
    // Fix inconsistent field naming: convert "map" to "mapIdea"
    if (json.scenarios && Array.isArray(json.scenarios)) {
      json.scenarios.forEach((scenario: Record<string, unknown>) => {
        if (scenario.map && !scenario.mapIdea) {
          scenario.mapIdea = scenario.map;
          delete scenario.map;
        }
      });
    }
    
      const ScenarioSchema = z.object({
        scenarios: z.array(z.object({
          id: z.string(),
          title: z.string(),
          summary: z.string(),
          mapIdea: z.string(),
        })).min(1),
      })
    const out = ScenarioSchema.parse(json)
    return NextResponse.json(out)
  } catch (parseError) {
    console.error('JSON parsing failed:', parseError)
    console.error('Raw response:', raw)
    return NextResponse.json({ 
      error: 'Fehler beim Generieren der Szenarien. Bitte versuchen Sie es erneut.', 
      details: 'Bad JSON from model',
      raw 
    }, { status: 502 })
  }
}