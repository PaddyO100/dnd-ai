import { z } from 'zod'

export const Effects = z.object({
  party: z.array(z.object({ name: z.string(), hpDelta: z.number().optional(), status: z.string().optional() })).optional(),
  inventory: z.array(z.object({ op: z.enum(['add','remove']), item: z.string() })).optional(),
  quests: z.array(z.object({ op: z.enum(['add','update','complete']), title: z.string(), note: z.string().optional() })).optional(),
})

export const DiceRequest = z.object({ formula: z.string().min(2), reason: z.string().optional() })
export const DiceResult = z.object({ formula: z.string(), result: z.number(), rolls: z.array(z.number()) })

export const TurnOut = z.object({
  summary: z.string().optional(),
  dmText: z.string().optional(),
  effects: Effects.optional(),
  diceRequests: z.array(DiceRequest).optional(),
  diceResults: z.array(DiceResult).optional(),
}).passthrough()

export type Effects = z.infer<typeof Effects>
export type TurnOut = z.infer<typeof TurnOut>
export type DiceRequest = z.infer<typeof DiceRequest>
export type DiceResult = z.infer<typeof DiceResult>
