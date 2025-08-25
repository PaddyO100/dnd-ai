/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getEnhancedDirectorAdvice } from '@/lib/engine/director';
import type { HistoryEntry, Player } from '@/lib/state/gameStore';

// Minimal schema to keep route a module and validate input shape
const RequestSchema = z.object({
	history: z.array(z.object({ role: z.string(), content: z.string(), timestamp: z.number().optional() })).default([]),
	state: z.unknown().optional(),
	playerInput: z.string().default(''),
	directorAdvice: z.unknown().optional(),
});

type StateWithParty = { party: Player[] };

function hasParty(state: unknown): state is StateWithParty {
	return typeof state === 'object' && state !== null && 'party' in state && Array.isArray((state as StateWithParty).party);
}

export async function POST(req: Request) {
	try {
		const json = await req.json();
		const parsed = RequestSchema.safeParse(json);
		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
		}

		const { history, state, playerInput } = parsed.data;
		const typedHistory: HistoryEntry[] = history.map(h => ({ ...h, timestamp: h.timestamp ?? Date.now() })) as HistoryEntry[];
		// Director advice can be recomputed server-side if desired
		const party: Player[] = hasParty(state) ? state.party : [];
		const advice = getEnhancedDirectorAdvice({ history: typedHistory, party, historyCount: typedHistory.length });

		// TODO: integrate OpenRouter call and tool execution. For now, echo a safe stub.
		const dmText = `Aethel überlegt kurz und antwortet: "${playerInput || 'Beschreibe deine Aktion, Abenteurer.'}"`;

		return NextResponse.json({ dmText, effects: null, diceResults: [], advice });
	} catch {
		return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
	}
}

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ ok: true });
}

