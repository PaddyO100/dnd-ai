import { NextResponse } from 'next/server';
import { z } from 'zod';
import { openrouter, OPENROUTER_MODEL } from '@/lib/ai/openrouter';
import { SYSTEM_DM, NEXT_TURN_USER } from '@/lib/ai/prompts';
import { roll } from '@/lib/engine/dice';
import { getDirectorAdvice, ToolCall, ToolUpdateCharacter, ToolRequestDice } from '@/lib/engine/director';
import { mergeEffects } from '@/lib/engine/mergeEffects';
import type { Player, HistoryEntry } from '@/lib/state/gameStore';


const Input = z.object({
  history: z.array(z.object({
    role: z.string(),            // oder z.enum(['dm','player'])
    content: z.string(),
  })),
  state: z.any(),                // <-- WICHTIG: NICHT optional!
  playerInput: z.string().min(1),
  directorAdvice: z.any().optional(), // Enhanced Director AI insights
});

type NextTurnInput = z.infer<typeof Input>;

export async function POST(req: Request) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'Missing OPENROUTER_API_KEY (check .env.local)' },
        { status: 500 }
      );
    }
    let json: unknown
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    const parsed = Input.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: parsed.error.format() },
        { status: 400 }
      );
    }
    const data: NextTurnInput = parsed.data;

    const userMsg = NEXT_TURN_USER();

    const chat = await openrouter.chat.completions.create({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_DM },
        { role: 'user', content: userMsg },
      ],
      temperature: 0.7,
    });

    const raw = chat.choices?.[0]?.message?.content;
    if (!raw || typeof raw !== 'string' || raw.trim().length === 0) {
      return NextResponse.json({ error: 'Bad JSON from model', raw: raw ?? null }, { status: 502 });
    }
    try {
      const json = JSON.parse(raw);
      const DiceReq = z.object({ formula: z.string(), reason: z.string().optional() });
      const Effects = z.object({
        party: z.array(z.object({ name: z.string(), hpDelta: z.number().optional(), status: z.string().optional() })).optional(),
        inventory: z.array(z.object({ op: z.enum(['add','remove']), item: z.string() })).optional(),
        quests: z.array(z.object({ op: z.enum(['add','update','complete']), title: z.string(), note: z.string().optional() })).optional(),
      });
      const TurnOut = z.object({
        summary: z.string().optional(),
        dmText: z.string().optional(),
        effects: Effects.optional(),
        diceRequests: z.array(DiceReq).optional(),
        // allow model to return toolCalls in JSON
        toolCalls: z.array(z.any()).optional(),
      }).passthrough();

      const out = TurnOut.parse(json);
      
      // helper: read state.party for id->name mapping and seeds  
      type PartyMember = { id?: string; name?: string; portraitSeed?: number };
      const getParty = (state: unknown): PartyMember[] => {
        if (typeof state === 'object' && state && 'party' in (state as { party?: PartyMember[] })) {
          const p = (state as { party?: PartyMember[] }).party;
          if (Array.isArray(p)) return p;
        }
        return [];
      };
      
      const party = getParty(data.state);
      const advice = getDirectorAdvice({ 
        effects: out.effects, 
        historyCount: data.history.length,
        // Normalize to HistoryEntry shape expected by director
        history: (data.history || []).map(h => ({
          role: (h.role === 'dm' || h.role === 'player') ? h.role : 'dm',
          content: h.content || ''
        })) as HistoryEntry[],
        party: (party as Player[]) || []
      });
      
      const getSeedFromState = (state: unknown): number | undefined => {
        if (typeof state === 'object' && state && 'rngSeed' in (state as { rngSeed?: number })) {
          const v = (state as { rngSeed?: number }).rngSeed;
          return typeof v === 'number' ? v : undefined;
        }
        return undefined;
      };
  // map seed helper removed with image generation

      // 1) Collect tool calls (model + director advice)
      const parsedToolCalls: ToolCall[] = [];
      if (Array.isArray(out.toolCalls)) {
        for (const t of out.toolCalls) {
          const parsed = ToolCall.safeParse(t);
          if (parsed.success) parsedToolCalls.push(parsed.data);
        }
      }
      if (advice.toolCalls) {
        for (const t of advice.toolCalls) {
          const parsed = ToolCall.safeParse(t);
          if (parsed.success) parsedToolCalls.push(parsed.data);
        }
      }

      // 2) Execute updateCharacter → to Effects
      const effectsFromTools: z.infer<typeof Effects> = {};
      for (const tc of parsedToolCalls) {
        if (tc.tool === 'updateCharacter') {
          const u = ToolUpdateCharacter.parse(tc.args);
          const target = party.find(p => p.id === u.id || p.name === u.id);
          const name = target?.name || u.id; // fallback
          if (u.patch.hp !== undefined) {
            effectsFromTools.party = effectsFromTools.party || [];
            effectsFromTools.party.push({ name, hpDelta: u.patch.hp });
          }
          if (u.patch.addItem) {
            effectsFromTools.inventory = effectsFromTools.inventory || [];
            effectsFromTools.inventory.push({ op: 'add', item: u.patch.addItem });
          }
          if (u.patch.removeItem) {
            effectsFromTools.inventory = effectsFromTools.inventory || [];
            effectsFromTools.inventory.push({ op: 'remove', item: u.patch.removeItem });
          }
          // status/mp/stats can be mapped later (store currently supports party hp/inventory/quests)
        }
      }

      // 3) Collect dice requests (toolCalls + model + director)
      const suggestedReqs = parsedToolCalls
        .filter((t) => t.tool === 'requestDiceRoll')
        .map((t) => ToolRequestDice.parse((t as ToolCall & { args: unknown }).args))
        .map((t) => ({ formula: t.formula, reason: t.reason }));
      const diceFromModel = (out.diceRequests || []).map(r => ({ formula: r.formula, reason: r.reason }));
      const adviceDice = (advice.toolCalls || [])
        .filter((t): t is { tool: 'requestDiceRoll'; args: z.infer<typeof ToolRequestDice> } => t.tool === 'requestDiceRoll')
        .map((t) => ({ formula: t.args.formula, reason: t.args.reason }));
  // Include director dice suggestions even if model/toolCalls provided none
  const allDiceReqs = [...diceFromModel, ...suggestedReqs, ...adviceDice];

      const seed = getSeedFromState(data.state);
      const results = allDiceReqs.map((r) => roll(r.formula, seed));

  // Image vision generation removed.

  // Merge effects: model + tools
  const mergedEffects = mergeEffects(out.effects, effectsFromTools);

      const suffix = results.length ? `\n\n[Würfel] ${results.map(r => `${r.formula} → ${r.result}`).join(', ')}` : '';
  return NextResponse.json({ ...out, effects: mergedEffects, diceRequests: allDiceReqs, diceResults: results, director: advice, dmText: (out.dmText || '') + suffix });
    } catch {
      return NextResponse.json({ error: 'Bad JSON from model', raw }, { status: 502 });
    }
  } catch (err) {
    console.error('next-turn error:', err);
    const message = err instanceof Error ? err.message : 'Internal error in next-turn';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
