import { NextResponse } from 'next/server'
import { z } from 'zod'
import { openrouter, OPENROUTER_MODEL } from '@/lib/ai/openrouter'

const Input = z.object({
  players: z.number().min(1).max(6),
  classes: z.array(z.string()).min(1)
})


export async function POST(req: Request) {
  const data = Input.parse(await req.json())

  // Helper: mock party when credits are unavailable
  const mockParty = () => {
    const names = ["Arin", "Bela", "Corin", "Dara", "Eryn", "Falk"]
    const base = (i: number) => ({
      id: `char_${Date.now()}_${i}`,
      name: names[i % names.length],
      cls: data.classes[i % data.classes.length],
      hp: 10 + (i % 3),
      maxHp: 10 + (i % 3),
      mp: 7 + (i % 3),
      maxMp: 7 + (i % 3),
      level: 1,
      experience: 0,
      stats: { STR: 12, DEX: 10, CON: 11, INT: 10, WIS: 9, CHA: 12 },
      armorClass: 12,
      skills: [
        { name: "Schwertkampf", level: 2, max: 5, description: "Geübter Nahkampf" }
      ],
      spells: [],
      traits: [ { name: "Mutig", description: "Weicht selten zurück", type: "class" } ],
      inventory: [ { name: "Heiltrank", type: "misc", quantity: 1, description: "Stellt 5 HP her", equipped: false } ],
      conditions: [],
      backstory: { origin: "Dorf", personality: "Loyal", motivation: "Ehre", flaw: "Übereilt", background: "Ein junger Abenteurer." },
  portraitSeed: Math.floor(Math.random() * 1_000_000) // kept for deterministic portraits in future
    })
    return { party: Array.from({ length: data.players }).map((_, i) => base(i)) }
  }

  const prompt = `
Erstelle ${data.players} ausgewogene Spielercharaktere als JSON unter dem Schlüssel "party".
Alle Textfelder auf DEUTSCH, JSON-Keys ENGLISCH.

Erweiterte Charakterstruktur:
{
  "id": "unique_string",
  "name": "deutscher Name",
  "cls": "Klasse aus ${data.classes.join(', ')}",
  "hp": number (8-15),
  "maxHp": number (gleich hp),
  "mp": number (5-12),
  "maxMp": number (gleich mp),
  "level": 1,
  "experience": 0,
  "stats": {
    "STR": number (8-16),
    "DEX": number (8-16), 
    "CON": number (8-16),
    "INT": number (8-16),
    "WIS": number (8-16),
    "CHA": number (8-16)
  },
  "armorClass": number (10-14),
  "skills": [
    {
      "name": "Fähigkeitsname",
      "level": number (1-4),
      "max": 5,
      "description": "kurze Beschreibung"
    }
  ],
  "spells": [
    {
      "name": "Zauber name",
      "cost": number (1-3),
      "description": "Was der Zauber bewirkt",
      "level": number (1-2)
    }
  ],
  "traits": [
    {
      "name": "Eigenschaft",
      "description": "Was diese Eigenschaft bewirkt",
      "type": "class"
    }
  ],
  "inventory": [
    {
      "name": "Gegenstand",
      "type": "weapon|armor|tool|misc",
      "quantity": 1,
      "description": "Beschreibung",
      "equipped": boolean
    }
  ],
  "conditions": [],
  "backstory": {
    "origin": "Herkunft des Charakters",
    "personality": "Persönlichkeit",
    "motivation": "Was treibt den Charakter an",
    "flaw": "Eine charakteristische Schwäche",
    "background": "2-3 Sätze Hintergrundgeschichte"
  },
  "portraitSeed": number (Zufallszahl für optionale Portraits)
}

Balancing-Regeln:
- Gesamt-Statwerte pro Charakter: 60-75 Punkte
- Mindestens eine Schwäche (Stat unter 10)
- Skills passend zur Klasse, Level 1-4
- Startausrüstung je nach Klasse
- Keine übermächtigen Kombinationen
- Jeder Charakter einzigartig

Klassen-Richtlinien:

Gib NUR gültiges JSON zurück, ohne weiteren Text.
`

  const selectedModel = OPENROUTER_MODEL;
  
  let raw = '{}' as string
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(mockParty())
    }
    const chat = await openrouter.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: 'Du bist ein D&D Charaktergenerator. Antworte ausschließlich auf DEUTSCH. Gib NUR gültiges JSON zurück.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
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
    if (status === 402 || msg.includes('402') || /insufficient credits/i.test(msg)) {
      return NextResponse.json(mockParty())
    }
    console.error('OpenRouter request failed (characters):', err)
  }
  try {
    // Clean up common JSON formatting issues (same as scenarios)
    let cleanedJson = raw.trim()
    
    // Remove markdown code blocks if present
    cleanedJson = cleanedJson.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    
    // Remove any leading/trailing text that's not JSON
    const jsonStart = cleanedJson.indexOf('{')
    const jsonEnd = cleanedJson.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedJson = cleanedJson.substring(jsonStart, jsonEnd + 1)
    }
    
    const parsed = JSON.parse(cleanedJson)
    
    // Post-process to ensure balance and add missing fields
    if (parsed.party && Array.isArray(parsed.party)) {
      parsed.party = parsed.party.map((char: unknown, index: number) => {
  const c = char as Record<string, unknown>;
        // Ensure all required fields exist with defaults
        const processedChar = {
          id: c.id || `char_${Date.now()}_${index}`,
          name: c.name || `Charakter ${index + 1}`,
          cls: c.cls || data.classes[index % data.classes.length],
          hp: Math.min(15, Math.max(8, Number(c.hp) || 10)),
          maxHp: Number(c.maxHp) || Number(c.hp) || 10,
          mp: Math.min(12, Math.max(5, Number(c.mp) || 8)),
          maxMp: Number(c.maxMp) || Number(c.mp) || 8,
          level: 1,
          experience: 0,
          stats: {
            STR: Math.min(16, Math.max(8, Number((c.stats && (c.stats as Record<string, number>).STR) || 10))),
            DEX: Math.min(16, Math.max(8, Number((c.stats && (c.stats as Record<string, number>).DEX) || 10))),
            CON: Math.min(16, Math.max(8, Number((c.stats && (c.stats as Record<string, number>).CON) || 10))),
            INT: Math.min(16, Math.max(8, Number((c.stats && (c.stats as Record<string, number>).INT) || 10))),
            WIS: Math.min(16, Math.max(8, Number((c.stats && (c.stats as Record<string, number>).WIS) || 10))),
            CHA: Math.min(16, Math.max(8, Number((c.stats && (c.stats as Record<string, number>).CHA) || 10))),
          },
          armorClass: c.armorClass || 10,
          skills: c.skills || [],
          spells: c.spells || [],
          traits: c.traits || [],
          inventory: c.inventory || [],
          conditions: [],
          backstory: c.backstory || {
            origin: 'Unbekannte Herkunft',
            personality: 'Vielseitig',
            motivation: 'Auf der Suche nach Abenteuern',
            flaw: 'Noch unentdeckt',
            background: 'Ein geheimnisvoller Abenteurer.'
          },
          portraitSeed: c.portraitSeed || Math.floor(Math.random() * 1000000)
        }

        // Ensure maxHp and maxMp are set
        processedChar.maxHp = processedChar.hp
        processedChar.maxMp = processedChar.mp

        return processedChar
      })
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Character generation failed:', error)
    return NextResponse.json({ error: 'Bad JSON from model', raw }, { status: 502 })
  }
}
