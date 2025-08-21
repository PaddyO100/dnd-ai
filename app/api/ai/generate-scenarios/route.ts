import { z } from 'zod'
import { openrouter, OPENROUTER_MODEL } from '@/lib/ai/openrouter'
import { SYSTEM_SCENARIO, SCENARIO_USER } from '@/lib/ai/prompts';
import { NextResponse } from 'next/server'

const Input = z.object({
  genre: z.string(),
  frame: z.string(),
  world: z.object({ magic: z.string(), tech: z.string(), climate: z.string() }),
  players: z.number().min(1).max(6),
  // Classes are optional now; characters can be chosen later
  classes: z.array(z.string()).default([]),
  startingWeapons: z.array(z.string()).optional(),
  // Conflict parameter - the main conflict input from the user
  conflict: z.string().default(""),
  // aiModel removed; model is taken from environment
})

export async function POST(req: Request) {
  const body = await req.json()
  const data = Input.parse(body)

  // Helper: deterministic but varied mock scenarios when credits are unavailable
  const mock = () => {
    const conflictText = data.conflict.trim() ? ` Der Hauptkonflikt: ${data.conflict}` : ""
    const timestamp = Date.now()
    
    const scenarios = [
      {
        id: `scn-${timestamp}-1`,
        title: `Die verlorenen Artefakte von ${data.world.climate === 'warm' ? 'Solaria' : data.world.climate === 'kalt' ? 'Frostheim' : 'Temporia'}`,
        summary: `In einer Welt mit ${data.world.magic.toLowerCase()} Magie und ${data.world.tech.toLowerCase()} Technologie müssen die Helden drei verstreute Artefakte finden, bevor sie in die falschen Hände geraten.${conflictText}`,
        mapIdea: `Drei getrennte Regionen: Antike Ruinen, versteckter Tempel, und eine moderne Festung mit magischen Fallen.`,
      },
      {
        id: `scn-${timestamp}-2`, 
        title: `Die Verschwörung der Schatten`,
        summary: `Eine politische Intrige erschüttert das Reich. Diplomatie und verdeckte Ermittlungen sind gefragt, um eine Katastrophe zu verhindern.${conflictText}`,
        mapIdea: `Städtische Umgebung: Königspalast, Schwarzmarkt-Viertel, geheime Unterschlupf-Netzwerke und ein nobles Anwesen.`,
      },
      {
        id: `scn-${timestamp}-3`,
        title: `Expedition in die Wildnis`,
        summary: `Ein gefährlicher Ritt durch unbekanntes Terrain. Survival-Skills und Kampfkraft sind gefragt gegen wilde Kreaturen und die Elemente.${conflictText}`,
        mapIdea: `Weite Landschaft: Dunkler Wald, reißender Fluss, geheimnisvolle Höhlen und ein verlassenes Lager.`,
      }
    ]
    
    return { scenarios }
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
    // Provider throttling or server errors -> graceful mock fallback
    if (status === 429 || (typeof status === 'number' && status >= 500)) {
      return NextResponse.json(mock())
    }
    // Other transport errors -> still try to continue to JSON cleanup (raw stays '{}')
    console.error('OpenRouter request failed (scenarios):', err)
  }
  // If nothing useful came back, return mock immediately
  if (!raw || raw.trim() === '{}' || raw.trim() === '') {
    return NextResponse.json(mock())
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
    const parsed = ScenarioSchema.safeParse(json)
    if (!parsed.success) {
      console.warn('Scenario JSON invalid, falling back to mock:', parsed.error?.issues)
      return NextResponse.json(mock())
    }
    return NextResponse.json(parsed.data)
  } catch (parseError) {
    console.error('JSON parsing failed (scenarios), using mock fallback:', parseError)
    return NextResponse.json(mock())
  }
}