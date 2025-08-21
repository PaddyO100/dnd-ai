import { NextResponse } from 'next/server'
import { z } from 'zod'
import { openrouter, OPENROUTER_MODEL } from '@/lib/ai/openrouter'
import { getPortraitUrl } from '@/lib/character/portraitSystem'
import type { Race, Gender, CharacterClass, InventoryItem } from '@/schemas/character'

const Input = z.object({
  players: z.number().min(1).max(6),
  // Allow empty classes; we can infer from playerSelections or fill defaults
  classes: z.array(z.string()).default([]),
  // New: full multi-player selections
  playerSelections: z.array(z.object({
    class: z.string(),
    race: z.string(),
    gender: z.string(),
    name: z.string()
  })).optional(),
  scenario: z.object({ id: z.string().optional(), title: z.string().optional() }).optional()
})


import { generateFantasyName } from '@/lib/ai/nameGenerator';

export async function POST(req: Request) {
  const data = Input.parse(await req.json())

  // Map localized class display names to internal slugs
  const classNameToSlug = (cls?: string): CharacterClass | undefined => {
    if (!cls) return undefined as unknown as CharacterClass
    const c = String(cls).toLowerCase().replace(/\s|_/g, '')
    const map: Record<string, CharacterClass> = {
      'krieger': 'warrior',
      'magier': 'mage',
      'schurke': 'rogue',
      'barde': 'bard',
      'paladin': 'paladin',
      'waldläufer': 'ranger',
      'waldlaeufer': 'ranger',
      'druide': 'druid',
      'mönch': 'monk',
      'monch': 'monk',
      'hexenmeister': 'warlock',
      'warrior': 'warrior',
      'mage': 'mage',
      'rogue': 'rogue',
      'bard': 'bard',
      'ranger': 'ranger',
      'druid': 'druid',
      'monk': 'monk',
      'warlock': 'warlock',
    }
    return map[c] || (cls as CharacterClass)
  }

  type RawEffect = { type?: string; value?: number | string; description?: string }
  
  // Define item templates for starter equipment  
  const itemTemplates = {
    langschwert: {
      name: "Langschwert",
      type: "weapon" as const,
      subtype: "main_hand" as const,
      rarity: "common" as const,
      description: "Eine zuverlässige Waffe für den Nahkampf",
      equipped: true,
      location: "equipped" as const,
      effects: [{ type: "damage_bonus" as const, value: 2, description: "+2 Schaden" }],
      value: 50,
      weight: 3
    },
    dolch: {
      name: "Dolch",
      type: "weapon" as const,
      subtype: "main_hand" as const,
      rarity: "common" as const,
      description: "Schnell und tödlich",
      equipped: true,
      location: "equipped" as const,
      effects: [{ type: "damage_bonus" as const, value: 1, description: "+1 Schaden" }],
      value: 20,
      weight: 1
    },
    bogen: {
      name: "Bogen",
      type: "weapon" as const,
      subtype: "two_handed" as const,
      rarity: "common" as const,
      description: "Für den Fernkampf",
      equipped: true,
      location: "equipped" as const,
      effects: [{ type: "damage_bonus" as const, value: 2, description: "+2 Fernkampfschaden" }],
      value: 40,
      weight: 2
    },
    zauberstab: {
      name: "Zauberstab",
      type: "weapon" as const,
      subtype: "main_hand" as const,
      rarity: "common" as const,
      description: "Verstärkt magische Kräfte",
      equipped: true,
      location: "equipped" as const,
      effects: [{ type: "spell" as const, value: "Magiemissil", description: "Ermöglicht Zaubersprüche" }],
      value: 60,
      weight: 1
    },
    lederschiene: {
      name: "Lederschiene",
      type: "armor" as const,
      subtype: "chest" as const,
      rarity: "common" as const,
      description: "Leichte Schutzrüstung",
      equipped: true,
      location: "equipped" as const,
      effects: [{ type: "stat_bonus" as const, value: 1, description: "+1 Rüstungsklasse" }],
      value: 30,
      weight: 5
    },
    heiltrank: {
      name: "Heiltrank",
      type: "consumable" as const,
      subtype: "none" as const,
      rarity: "common" as const,
      description: "Stellt Lebenspunkte wieder her",
      equipped: false,
      location: "inventory" as const,
      effects: [{ type: "passive" as const, value: "5 HP", description: "Heilt 5 Lebenspunkte" }],
      value: 25,
      weight: 0.5
    },
    manatrank: {
      name: "Manatrank",
      type: "consumable" as const,
      subtype: "none" as const,
      rarity: "common" as const,
      description: "Stellt Manapunkte wieder her",
      equipped: false,
      location: "inventory" as const,
      effects: [{ type: "passive" as const, value: "5 MP", description: "Stellt 5 Manapunkte wieder her" }],
      value: 30,
      weight: 0.5
    },
    zauberkomponenten: {
      name: "Zauberkomponenten",
      type: "tool" as const,
      subtype: "none" as const,
      rarity: "common" as const,
      description: "Materialien für Zaubersprüche",
      equipped: false,
      location: "inventory" as const,
      effects: [{ type: "passive" as const, value: "Zaubern", description: "Ermöglicht das Wirken von Sprüchen" }],
      value: 15,
      weight: 1
    },
    dietriche: {
      name: "Dietriche",
      type: "tool" as const,
      subtype: "none" as const,
      rarity: "common" as const,
      description: "Zum Öffnen von Schlössern",
      equipped: false,
      location: "inventory" as const,
      effects: [{ type: "passive" as const, value: "Schlösser öffnen", description: "Schlösser knacken" }],
      value: 10,
      weight: 0.2
    },
    seil: {
      name: "Seil",
      type: "tool" as const,
      subtype: "none" as const,
      rarity: "common" as const,
      description: "10 Meter starkes Seil",
      equipped: false,
      location: "inventory" as const,
      effects: [{ type: "passive" as const, value: "Klettern", description: "Zum Klettern und Sichern" }],
      value: 5,
      weight: 2
    },
    pfeile: {
      name: "Pfeile",
      type: "consumable" as const,
      subtype: "none" as const,
      rarity: "common" as const,
      description: "20 Pfeile für den Bogen",
      equipped: false,
      location: "inventory" as const,
      effects: [{ type: "passive" as const, value: "20", description: "Munition für Fernkampfwaffen" }],
      value: 10,
      weight: 1
    },
    rations: {
      name: "Reiseproviant",
      type: "consumable" as const,
      subtype: "none" as const,
      rarity: "common" as const,
      description: "Nahrung für 3 Tage",
      equipped: false,
      location: "inventory" as const,
      effects: [{ type: "passive" as const, value: "Nahrung", description: "Verhindert Hunger" }],
      value: 5,
      weight: 2
    }
  } as const;

  const normalizeInventory = (inv: unknown, cls: CharacterClass): InventoryItem[] => {
    const items: InventoryItem[] = Array.isArray(inv) ? inv.map((raw) => {
      const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
      const typeStr = String(r.type || 'misc')
      const allowed = ['weapon','armor','consumable','tool','misc','quest','valuable','clothing']
      const type = (allowed.includes(typeStr) ? typeStr : 'misc') as InventoryItem['type']
      return {
        name: String(r.name || 'Gegenstand'),
        type,
        subtype: (String(r.subtype || 'none') as InventoryItem['subtype']) ?? 'none',
        rarity: (String(r.rarity || 'common') as InventoryItem['rarity']) ?? 'common',
        quantity: Number(r.quantity ?? 1),
        description: (r.description ? String(r.description) : undefined),
        equipped: Boolean(r.equipped ?? false),
        location: (String(r.location || (r.equipped ? 'equipped' : 'inventory')) as InventoryItem['location']),
        effects: Array.isArray(r.effects) ? (r.effects as RawEffect[]).map((e: RawEffect) => ({
          type: ((): InventoryItem['effects'][number]['type'] => {
            const t = String(e?.type || 'passive') as InventoryItem['effects'][number]['type'] | string
            const allowed: ReadonlyArray<InventoryItem['effects'][number]['type']> = ['stat_bonus','damage_bonus','resistance','immunity','spell','passive'] as const
            return (allowed as readonly string[]).includes(t) ? (t as InventoryItem['effects'][number]['type']) : 'passive'
          })(),
          value: (typeof e?.value === 'number' || typeof e?.value === 'string') ? e.value : 0,
          description: String(e?.description || 'Effekt')
        })) : [],
        value: Number(r.value ?? 0),
        weight: Number(r.weight ?? 0),
      }
    }) : []

    if (items.length > 0) return items

    // Provide a minimal class-based starting kit using itemTemplates
    const add = (key: keyof typeof itemTemplates): InventoryItem => {
      const t = itemTemplates[key]
      return { 
        ...t, 
        quantity: 1,
        effects: [...t.effects] // Make effects mutable
      }
    }
    switch (cls) {
      case 'warrior':
        return [add('langschwert'), add('lederschiene'), add('heiltrank')]
      case 'mage':
        return [add('zauberstab'), add('zauberkomponenten'), add('manatrank')]
      case 'rogue':
        return [add('dolch'), add('dietriche'), add('seil')]
      case 'ranger':
        return [add('bogen'), add('pfeile'), add('rations')]
      case 'paladin':
        return [add('langschwert'), add('heiltrank')]
      case 'druid':
        return [add('zauberkomponenten'), add('rations')]
      case 'monk':
        return [add('heiltrank')]
      case 'warlock':
        return [add('zauberstab'), add('zauberkomponenten')]
      case 'bard':
        return [add('dolch'), add('heiltrank')]
      default:
        return [add('heiltrank')]
    }
  }

  // Helper: mock party when credits are unavailable
  const mockParty = () => {
    const base = (i: number) => {
      const sel = (data.playerSelections?.[i] || {}) as {class?: string; race?: string; gender?: string; name?: string};
      const cls = classNameToSlug(sel.class || data.classes?.[i] || 'warrior') || 'warrior';
      const race = (sel.race || 'human') as Race;
      const gender = (sel.gender || (i % 2 === 0 ? 'male' : 'female')) as Gender;
      return {
        id: `char_${Date.now()}_${i}`,
        name: sel.name || generateFantasyName(race, gender, data.scenario?.title),
        cls,
        race,
        gender,
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
        inventory: normalizeInventory([], cls),
        conditions: [],
        backstory: { origin: "Dorf", personality: "Loyal", motivation: "Ehre", flaw: "Übereilt", background: "Ein junger Abenteurer." },
        portraitSeed: Math.floor(Math.random() * 1_000_000),
        portraitUrl: getPortraitUrl(cls, race, gender)
      }
    }
    return { party: Array.from({ length: data.players }).map((_, i) => base(i)) }
  }

  const prompt = `
Erstelle ${data.players} ausgewogene Spielercharaktere als JSON unter dem Schlüssel "party".
Alle Textfelder auf DEUTSCH, JSON-Keys ENGLISCH.

${data.playerSelections?.map((p, i) => `Charakter ${i+1} Name: ${p.name}`).join('\n')}

Erweiterte Charakterstruktur:
{
  "id": "unique_string",
  "name": "deutscher Name",
  "cls": "Klasse aus ${ (data.playerSelections?.map(x => x.class) || data.classes || ['warrior','mage','rogue']).join(', ') }",
  "hp": 8,
  "maxHp": 8,
  "mp": 8,
  "maxMp": 8,
  "level": 1,
  "experience": 0,
  "stats": {
    "STR": 10,
    "DEX": 10, 
    "CON": 10,
    "INT": 10,
    "WIS": 10,
    "CHA": 10
  },
  "armorClass": 10,
  "skills": [
    {
      "name": "Fähigkeitsname",
      "level": 1,
      "max": 5,
      "description": "kurze Beschreibung"
    }
  ],
  "spells": [],
  "traits": [
    {
      "name": "Eigenschaft",
      "description": "Was diese Eigenschaft bewirkt",
      "type": "class"
    }
  ],
  "inventory": [],
  "conditions": [],
  "backstory": {
    "origin": "Herkunft des Charakters",
    "personality": "Persönlichkeit",
    "motivation": "Was treibt den Charakter an",
    "flaw": "Eine charakteristische Schwäche",
    "background": "2-3 Sätze Hintergrundgeschichte"
  },
  "portraitSeed": 12345
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
        const c = (typeof char === 'object' && char !== null ? char : {}) as Record<string, unknown>;
        const selection = (data.playerSelections?.[index] || {}) as {class?: string; race?: string; gender?: string; name?: string};
        const clsSlug = (classNameToSlug(String(selection?.class || c.cls)) || 'warrior') as CharacterClass
        const race: Race = (selection?.race as Race) || (c.race as Race) || ('human' as Race)
        const gender: Gender = (selection?.gender as Gender) || (c.gender as Gender) || ((index % 2 === 0 ? 'male' : 'female') as Gender)
        // Ensure all required fields exist with defaults
        const processedChar = {
          id: c.id || `char_${Date.now()}_${index}`,
          name: selection.name || (() => {
            const provided = String(c.name || '').trim()
            const lower = provided.toLowerCase()
            const bad = !provided || /^charakter\s*\d+$/i.test(provided) ||
              ['krieger','magier','schurke','barde','paladin','waldläufer','waldlaeufer','druide','mönch','monch','hexenmeister','warrior','mage','rogue','bard','ranger','druid','monk','warlock'].includes(lower)
            if (!bad) return provided
            return generateFantasyName(race, gender, data.scenario?.title)
          })(),
          // PRIORITIZE user selections over AI - this fixes character class mismatch
          cls: clsSlug,
          race,
          gender,
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
          skills: Array.isArray(c.skills) ? c.skills : [],
          spells: Array.isArray(c.spells) ? c.spells : [],
          traits: Array.isArray(c.traits) ? c.traits : [],
          inventory: normalizeInventory(c.inventory, clsSlug),
          conditions: [],
          backstory: c.backstory || {
            origin: 'Unbekannte Herkunft',
            personality: 'Vielseitig',
            motivation: 'Auf der Suche nach Abenteuern',
            flaw: 'Noch unentdeckt',
            background: 'Ein geheimnisvoller Abenteurer.'
          },
          portraitSeed: c.portraitSeed || Math.floor(Math.random() * 1000000),
          portraitUrl: getPortraitUrl(
            clsSlug,
            race,
            gender
          )
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
