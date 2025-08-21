import { z } from 'zod'
import type { SessionFlow, SessionInsight } from '../sessionFlowOptimizer'
import type { Challenge, PartyCapability, ChallengeType } from '../difficultyAdjuster'
import type { CharacterSpotlight } from '../spotlightManager'

export const ToolUpdateCharacter = z.object({ id: z.string(), patch: z.object({
  hp: z.number().optional(), mp: z.number().optional(),
  stats: z.record(z.number()).optional(),
  addItem: z.string().optional(), removeItem: z.string().optional(),
  status: z.string().optional(),
}) })

export const ToolRequestDice = z.object({ formula: z.string().min(2), reason: z.string().optional() })
export const ToolCall = z.discriminatedUnion('tool', [
  z.object({ tool: z.literal('updateCharacter'), args: ToolUpdateCharacter }),
  z.object({ tool: z.literal('requestDiceRoll'), args: ToolRequestDice }),
])

export type ToolCall = z.infer<typeof ToolCall>

// Enhanced Director Analysis Types
export type PacingType = 'exploration' | 'combat' | 'social' | 'downtime' | 'puzzle'
export type TensionLevel = 'low' | 'building' | 'high' | 'climax' | 'resolution'
export type DifficultyScale = 'trivial' | 'easy' | 'moderate' | 'hard' | 'extreme'

export type PacingAnalysis = {
  currentPacing: PacingType
  recentTrend: PacingType[]
  timeSinceLastCombat: number
  timeSinceLastSocial: number
  timeSinceLastExploration: number
  recommendation: string
  varietyScore: number // 0-1, how varied the recent pacing has been
}

export type SpotlightAnalysis = {
  characterSpotlights: Record<string, CharacterSpotlight>
  suggestedCharacter?: string
  reason?: string
  balanceScore: number // 0-1, how balanced spotlight distribution is
  recommendations: {
    character: string
    action: string
    priority: 'low' | 'medium' | 'high'
    reason: string
  }[]
  groupDynamics: {
    dominantCharacters: string[]
    quietCharacters: string[]
    pairings: { char1: string; char2: string; interactions: number }[]
    teamwork: number // 0-1, how well characters work together
  }
}

export type TensionAnalysis = {
  currentLevel: TensionLevel
  trajectory: 'rising' | 'falling' | 'stable'
  storyBeats: string[]
  nextBeatSuggestion: string
  intensityScore: number // 0-1
}

export type DifficultyAnalysis = {
  currentScale: DifficultyScale
  recentChallenges: Challenge[]
  partyCapability: PartyCapability
  recommendation: DifficultyScale
  reasoning: string
  adjustmentSuggestions: {
    type: ChallengeType
    currentDifficulty: DifficultyScale
    suggestedDifficulty: DifficultyScale
    reason: string
    priority: 'low' | 'medium' | 'high'
  }[]
  confidenceScore: number
}

export type DirectorState = {
  pacing: PacingAnalysis
  spotlight: SpotlightAnalysis
  tension: TensionAnalysis
  difficulty: DifficultyAnalysis
  encounterSuggestions: {
    type: PacingType
    description: string
    reasoning: string
    priority: 'low' | 'medium' | 'high'
  }[]
}

export type DirectorAdvice = {
  state: DirectorState
  pacingNote?: string
  spotlight?: string
    toolCalls?: ToolCall[]
  dmHints: string[]
  scenarioSuggestions: string[]
  sessionFlow?: SessionFlow
  insights: SessionInsight[]
  realTimeAdvice: {
    immediate: string[]
    upcoming: string[]
    longTerm: string[]
  }
  storytellingGuidance: {
    nextBeat: string
    characterFocus: string
    toneAdjustment: string
    paceRecommendation: string
  }
}
