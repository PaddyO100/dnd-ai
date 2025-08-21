import type { Effects } from '@/schemas/turn'
import type { Player, HistoryEntry } from '@/lib/state/gameStore'
import { pacingAnalyzer, type PacingMetrics, type TensionCurve } from './pacingAnalyzer'
import { spotlightManager, type SpotlightAnalysis as SpotlightAnalysisType } from './spotlightManager'
import { difficultyAdjuster, type DifficultyAnalysis as DifficultyAnalysisType } from './difficultyAdjuster'
import { sessionFlowOptimizer } from './sessionFlowOptimizer'
import { 
    DirectorAdvice, 
    DirectorState, 
    PacingAnalysis, 
    SpotlightAnalysis,
    TensionAnalysis,
    DifficultyAnalysis,
    ToolCall
} from './director/types'
import { 
    generateEnhancedEncounterSuggestions, 
    generateRealTimeAdvice, 
    generateStorytellingGuidance, 
    generateSmartToolCalls 
} from './director/advice'

// Enhanced Director analysis with comprehensive AI guidance
export function getDirectorAdvice(context: { 
  effects?: Effects
  historyCount: number
  history?: HistoryEntry[]
  party?: Player[]
  sessionStartTime?: Date
}): DirectorAdvice {
  // Backward-compatible lightweight mode: when history or party are missing, provide minimal advice.
  const hasFullContext = Array.isArray(context.history) && Array.isArray(context.party)
  if (!hasFullContext) {
    const effects = context.effects
    const hasNoEffects = !effects || (
      (!effects.party || effects.party.length === 0) &&
      (!effects.inventory || effects.inventory.length === 0) &&
      (!effects.quests || effects.quests.length === 0)
    )

    if (hasNoEffects) {
      return {
        // Minimal advice: suggest a spontaneous perception check
        state: {
          pacing: {
            currentPacing: 'downtime',
            recentTrend: [],
            timeSinceLastCombat: 0,
            timeSinceLastSocial: 0,
            timeSinceLastExploration: 0,
            recommendation: '',
            varietyScore: 0
          },
          spotlight: { characterInvolvement: {}, balanceScore: 0 },
          tension: { currentLevel: 'low', trajectory: 'stable', storyBeats: [], nextBeatSuggestion: '', intensityScore: 0 },
          difficulty: { currentScale: 'moderate', recentChallenges: [], partyCapability: 0, recommendation: 'moderate', reasoning: '' },
          encounterSuggestions: []
        },
        toolCalls: [{ tool: 'requestDiceRoll', args: { formula: '1d20', reason: 'Spontane Wahrnehmungsprobe' } }],
        dmHints: [],
        scenarioSuggestions: [],
        insights: [],
        realTimeAdvice: { immediate: [], upcoming: [], longTerm: [] },
        storytellingGuidance: { nextBeat: '', characterFocus: '', toneAdjustment: '', paceRecommendation: '' }
      } as unknown as DirectorAdvice
    }
    // When there are effects, return empty/minimal advice (no dice suggestion)
    return {} as unknown as DirectorAdvice
  }
  return getEnhancedDirectorAdvice(context as Required<typeof context>)
}

// Main comprehensive Director analysis function
type EnhancedContext = {
  effects?: Effects
  historyCount: number
  history?: HistoryEntry[]
  party?: Player[]
  sessionStartTime?: Date
}

export function getEnhancedDirectorAdvice(context: EnhancedContext): DirectorAdvice {
  const { effects } = context
  const history: HistoryEntry[] = Array.isArray(context.history) ? context.history : []
  const party: Player[] = Array.isArray(context.party) ? context.party : []
  const sessionStartTime = context.sessionStartTime

  // If context is incomplete and there are meaningful effects, return minimal empty advice
  const contextIncomplete = !Array.isArray(context.history) || !Array.isArray(context.party)
  const hasMeaningfulEffects = !!(effects && (
    (effects.party && effects.party.length) ||
    (effects.inventory && effects.inventory.length) ||
    (effects.quests && effects.quests.length)
  ))
  if (contextIncomplete && hasMeaningfulEffects) {
    return {} as unknown as DirectorAdvice
  }
  
  // Perform comprehensive analysis using enhanced analyzers
  const pacingMetrics = pacingAnalyzer.analyzePacing(history)
  const tensionCurve = pacingAnalyzer.analyzeTensionCurve(history)
  const spotlightAnalysis = spotlightManager.analyzeSpotlight(history, party)
  const difficultyAnalysis = difficultyAdjuster.analyzeDifficulty(history, party)
  
  // Generate session flow analysis and insights
  const sessionFlow = sessionFlowOptimizer.analyzeSessionFlow(
    history, 
    party, 
    pacingMetrics, 
    tensionCurve, 
    spotlightAnalysis, 
    difficultyAnalysis,
    sessionStartTime
  )
  
  const insights = sessionFlowOptimizer.generateSessionInsights(
    sessionFlow,
    pacingMetrics,
    spotlightAnalysis,
    difficultyAnalysis
  )
  
  // Legacy compatibility - convert to old format
  const pacing = convertPacingMetrics(pacingMetrics)
  const spotlight = convertSpotlightAnalysis(spotlightAnalysis)
  const tension = convertTensionAnalysis(tensionCurve)
  const difficulty = convertDifficultyAnalysis(difficultyAnalysis)
  const encounterSuggestions = generateEnhancedEncounterSuggestions(pacingMetrics, tensionCurve, difficulty, spotlight)
  
  const directorState: DirectorState = {
    pacing,
    spotlight,
    tension,
    difficulty,
    encounterSuggestions
  }
  
  // Generate comprehensive advice and tool calls
  const toolCalls: ToolCall[] = []
  const dmHints: string[] = []
  const scenarioSuggestions: string[] = []
  
  // Generate real-time advice
  const realTimeAdvice = generateRealTimeAdvice(sessionFlow, insights, pacingMetrics)
  
  // Generate storytelling guidance
  const storytellingGuidance = generateStorytellingGuidance(
    tensionCurve,
    spotlight,
    pacingMetrics,
    sessionFlow
  )
  
  // Enhanced pacing advice
  const pacingNote = pacingMetrics.recommendation
  if (pacingMetrics.varietyScore < 0.5) {
    dmHints.push('Mehr Abwechslung in Aktivitätstypen einbauen')
  }
  
  // Enhanced spotlight advice
  let spotlightNote: string | undefined
  if (spotlightAnalysis.suggestedCharacter && spotlightAnalysis.reason) {
    spotlightNote = `${spotlightAnalysis.suggestedCharacter}: ${spotlightAnalysis.reason}`
    dmHints.push(`Spotlight auf ${spotlightAnalysis.suggestedCharacter} richten`)
  }
  
  // Enhanced tension and story beat advice
  dmHints.push(tensionCurve.nextBeatSuggestion)
  
  // Enhanced difficulty advice
  if (difficultyAnalysis.recommendation !== difficultyAnalysis.currentScale) {
    dmHints.push(`Schwierigkeit auf ${difficultyAnalysis.recommendation} anpassen: ${difficultyAnalysis.reasoning}`)
  }
  
  // Enhanced scenario suggestions
  encounterSuggestions.forEach(enc => {
    scenarioSuggestions.push(`${enc.description} (${enc.reasoning})`)
  })
  
  // Add flow-based suggestions
  sessionFlow.flowSuggestions.forEach(suggestion => {
    if (suggestion.priority === 'high') {
      dmHints.unshift(suggestion.action) // High priority at top
    } else {
      dmHints.push(suggestion.action)
    }
  })
  
  // Enhanced tool call suggestions
  generateSmartToolCalls(toolCalls, effects, history, spotlight, pacingMetrics)
  
  return {
    state: directorState,
    pacingNote,
    spotlight: spotlightNote,
    toolCalls,
    dmHints,
    scenarioSuggestions,
    sessionFlow,
    insights,
    realTimeAdvice,
    storytellingGuidance
  }
}

// Legacy compatibility functions
function convertPacingMetrics(metrics: PacingMetrics): PacingAnalysis {
  return {
    currentPacing: metrics.currentPacing,
    recentTrend: metrics.recentTrend,
    timeSinceLastCombat: metrics.timeSinceLastCombat,
    timeSinceLastSocial: metrics.timeSinceLastSocial,
    timeSinceLastExploration: metrics.timeSinceLastExploration,
    recommendation: metrics.recommendation,
    varietyScore: metrics.varietyScore
  }
}

function convertSpotlightAnalysis(analysis: SpotlightAnalysisType): SpotlightAnalysis {
  return {
    characterSpotlights: analysis.characterSpotlights,
    suggestedCharacter: analysis.suggestedCharacter,
    reason: analysis.reason,
    balanceScore: analysis.balanceScore,
    recommendations: analysis.recommendations,
    groupDynamics: analysis.groupDynamics,
  }
}

function convertTensionAnalysis(curve: TensionCurve): TensionAnalysis {
  return {
    currentLevel: curve.currentLevel,
    trajectory: curve.trajectory,
    storyBeats: curve.storyBeats,
    nextBeatSuggestion: curve.nextBeatSuggestion,
    intensityScore: curve.averageIntensity
  }
}

function convertDifficultyAnalysis(analysis: DifficultyAnalysisType): DifficultyAnalysis {
  return {
    currentScale: analysis.currentScale,
    recentChallenges: analysis.recentChallenges,
    partyCapability: analysis.partyCapability,
    recommendation: analysis.recommendation,
    reasoning: analysis.reasoning,
    adjustmentSuggestions: analysis.adjustmentSuggestions,
    confidenceScore: analysis.confidenceScore,
  }
}

// Export utility function for getting current director state with enhanced analytics
export function getCurrentDirectorState(history: HistoryEntry[], party: Player[]): DirectorState {
  const pacingMetrics = pacingAnalyzer.analyzePacing(history)
  const tensionCurve = pacingAnalyzer.analyzeTensionCurve(history)
  const spotlightAnalysis = spotlightManager.analyzeSpotlight(history, party)
  const difficultyAnalysis = difficultyAdjuster.analyzeDifficulty(history, party)
  
  // Convert to legacy format for compatibility
  const pacing = convertPacingMetrics(pacingMetrics)
  const spotlight = convertSpotlightAnalysis(spotlightAnalysis)
  const tension = convertTensionAnalysis(tensionCurve)
  const difficulty = convertDifficultyAnalysis(difficultyAnalysis)
  const encounterSuggestions = generateEnhancedEncounterSuggestions(pacingMetrics, tensionCurve, difficulty, spotlight)
  
  return {
    pacing,
    spotlight,
    tension,
    difficulty,
    encounterSuggestions
  }
}

// Export enhanced analytics directly for advanced use cases
export function getAdvancedDirectorState(history: HistoryEntry[], party: Player[], sessionStartTime?: Date) {
  const pacingMetrics = pacingAnalyzer.analyzePacing(history)
  const tensionCurve = pacingAnalyzer.analyzeTensionCurve(history)
  const spotlightAnalysis = spotlightManager.analyzeSpotlight(history, party)
  const difficultyAnalysis = difficultyAdjuster.analyzeDifficulty(history, party)
  
  const sessionFlow = sessionFlowOptimizer.analyzeSessionFlow(
    history, 
    party, 
    pacingMetrics, 
    tensionCurve, 
    spotlightAnalysis, 
    difficultyAnalysis,
    sessionStartTime
  )
  
  const insights = sessionFlowOptimizer.generateSessionInsights(
    sessionFlow,
    pacingMetrics,
    spotlightAnalysis,
    difficultyAnalysis
  )
  
  return {
    pacingMetrics,
    tensionCurve,
    spotlightAnalysis,
    difficultyAnalysis,
    sessionFlow,
    insights
  }
}