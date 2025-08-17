// lib/engine/sessionFlowOptimizer.ts

import type { HistoryEntry, Player } from '@/lib/state/gameStore'
import type { PacingMetrics, TensionCurve } from './pacingAnalyzer'
import type { SpotlightAnalysis } from './spotlightManager'
import type { DifficultyAnalysis } from './difficultyAdjuster'

export type SessionPhase = 'opening' | 'exploration' | 'complication' | 'climax' | 'resolution' | 'ending'
export type BreakSuggestion = 'none' | 'short' | 'long' | 'meal' | 'end_session'
export type EnergyLevel = 'low' | 'moderate' | 'high' | 'peak'

export interface SessionMetrics {
  duration: number // in minutes
  turnCount: number
  avgTurnLength: number
  playerEngagement: number // 0-1
  storyProgression: number // 0-1
  currentPhase: SessionPhase
  energyLevel: EnergyLevel
  breakRecommendation: BreakSuggestion
  fatigueSigns: string[]
}

export interface StoryBeat {
  type: 'hook' | 'inciting_incident' | 'plot_point_1' | 'midpoint' | 'plot_point_2' | 'climax' | 'resolution'
  turn: number
  description: string
  intensity: number // 0-1
  characters_involved: string[]
  completed: boolean
}

export interface SessionFlow {
  sessionMetrics: SessionMetrics
  storyBeats: StoryBeat[]
  upcomingBeats: StoryBeat[]
  flowSuggestions: {
    action: string
    reason: string
    timing: 'immediate' | 'soon' | 'when_appropriate'
    priority: 'low' | 'medium' | 'high'
  }[]
  paceAdjustments: {
    current: 'too_slow' | 'too_fast' | 'good'
    suggestion: string
  }
}

export interface SessionInsight {
  type: 'pacing' | 'engagement' | 'story' | 'difficulty' | 'break' | 'energy'
  message: string
  actionable: boolean
  urgency: 'low' | 'medium' | 'high'
  impact: 'minor' | 'moderate' | 'major'
}

export class SessionFlowOptimizer {
  private readonly STORY_BEAT_KEYWORDS = {
    hook: ['anfang', 'begin', 'auftrag', 'mission', 'quest', 'gerufen', 'beauftragt'],
    inciting_incident: ['problem', 'konflikt', 'bedrohung', 'gefahr', 'krise', 'notfall'],
    plot_point_1: ['entdeckung', 'enthüllung', 'wahrheit', 'geheimnis', 'wendung'],
    midpoint: ['wendepunkt', 'alles ändert', 'überraschung', 'schock', 'unerwartets'],
    plot_point_2: ['höhepunkt nähert', 'finale', 'entscheidend', 'alles oder nichts'],
    climax: ['höhepunkt', 'finale', 'boss', 'endkampf', 'letztes', 'entscheidung'],
    resolution: ['gelöst', 'besiegt', 'gerettet', 'erfolgreich', 'ende', 'abschluss']
  }

  private readonly FATIGUE_INDICATORS = [
    'längere pausen', 'weniger input', 'wiederholungen', 'kurze antworten',
    'unkonzentriert', 'müde', 'erschöpft', 'pause', 'break'
  ]

  private readonly ENERGY_INDICATORS = {
    high: ['begeistert', 'aufgeregt', 'aktiv', 'schnell', 'enthusiastisch'],
    moderate: ['normal', 'standard', 'angemessen', 'regelmäßig'],
    low: ['langsam', 'zögerlich', 'müde', 'wenig energie', 'träge']
  }

  analyzeSessionFlow(
    history: HistoryEntry[],
    party: Player[],
    pacingMetrics: PacingMetrics,
    tensionCurve: TensionCurve,
    spotlightAnalysis: SpotlightAnalysis,
    difficultyAnalysis: DifficultyAnalysis,
    sessionStartTime?: Date
  ): SessionFlow {
    const sessionMetrics = this.calculateSessionMetrics(history, party, sessionStartTime)
    const storyBeats = this.identifyStoryBeats(history)
    const upcomingBeats = this.predictUpcomingBeats(storyBeats, sessionMetrics.currentPhase)
    const flowSuggestions = this.generateFlowSuggestions(
      sessionMetrics,
      pacingMetrics,
      tensionCurve,
      spotlightAnalysis
    )
    const paceAdjustments = this.analyzePaceAdjustments(
      pacingMetrics,
      tensionCurve,
      sessionMetrics
    )

    return {
      sessionMetrics,
      storyBeats,
      upcomingBeats,
      flowSuggestions,
      paceAdjustments
    }
  }

  generateSessionInsights(
    sessionFlow: SessionFlow,
    pacingMetrics: PacingMetrics,
    spotlightAnalysis: SpotlightAnalysis,
    difficultyAnalysis: DifficultyAnalysis
  ): SessionInsight[] {
    const insights: SessionInsight[] = []

    // Energy and fatigue insights
    if (sessionFlow.sessionMetrics.energyLevel === 'low') {
      insights.push({
        type: 'energy',
        message: 'Niedrige Gruppenenergie - kurze Pause oder Tempoerhöhung empfohlen',
        actionable: true,
        urgency: 'medium',
        impact: 'moderate'
      })
    }

    // Break recommendations
    if (sessionFlow.sessionMetrics.breakRecommendation !== 'none') {
      const breakTypes = {
        short: 'kurze Pause (5-10 Min)',
        long: 'längere Pause (15-20 Min)',
        meal: 'Essenspause empfohlen',
        end_session: 'Session beenden erwägen'
      }
      
      insights.push({
        type: 'break',
        message: `${breakTypes[sessionFlow.sessionMetrics.breakRecommendation]} - ${sessionFlow.sessionMetrics.fatigueSigns.join(', ')}`,
        actionable: true,
        urgency: sessionFlow.sessionMetrics.breakRecommendation === 'end_session' ? 'high' : 'medium',
        impact: 'major'
      })
    }

    // Pacing insights
    if (pacingMetrics.varietyScore < 0.4) {
      insights.push({
        type: 'pacing',
        message: 'Niedrige Abwechslung - verschiedene Aktivitätstypen einbauen',
        actionable: true,
        urgency: 'medium',
        impact: 'moderate'
      })
    }

    // Engagement insights
    if (sessionFlow.sessionMetrics.playerEngagement < 0.5) {
      insights.push({
        type: 'engagement',
        message: 'Niedrige Spielerbeteiligung - direkte Ansprache oder Entscheidungen erforderlich',
        actionable: true,
        urgency: 'high',
        impact: 'major'
      })
    }

    // Spotlight insights
    if (spotlightAnalysis.balanceScore < 0.6) {
      insights.push({
        type: 'engagement',
        message: `Unausgewogener Spotlight - ${spotlightAnalysis.suggestedCharacter} braucht Aufmerksamkeit`,
        actionable: true,
        urgency: 'medium',
        impact: 'moderate'
      })
    }

    // Story progression insights
    if (sessionFlow.sessionMetrics.storyProgression < 0.3) {
      insights.push({
        type: 'story',
        message: 'Langsamer Handlungsfortschritt - Plot vorantreiben oder neue Entwicklungen',
        actionable: true,
        urgency: 'medium',
        impact: 'moderate'
      })
    }

    // Difficulty insights
    if (difficultyAnalysis.confidenceScore > 0.7 && difficultyAnalysis.recommendation !== difficultyAnalysis.currentScale) {
      insights.push({
        type: 'difficulty',
        message: `Schwierigkeit anpassen: ${difficultyAnalysis.reasoning}`,
        actionable: true,
        urgency: 'medium',
        impact: 'moderate'
      })
    }

    // Sort by urgency and impact
    return insights.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 }
      const impactOrder = { major: 3, moderate: 2, minor: 1 }
      
      const aScore = urgencyOrder[a.urgency] * impactOrder[a.impact]
      const bScore = urgencyOrder[b.urgency] * impactOrder[b.impact]
      
      return bScore - aScore
    }).slice(0, 5) // Top 5 insights
  }

  private calculateSessionMetrics(
    history: HistoryEntry[],
    party: Player[],
    sessionStartTime?: Date
  ): SessionMetrics {
    const now = new Date()
    const duration = sessionStartTime ? 
      Math.round((now.getTime() - sessionStartTime.getTime()) / 60000) : 
      Math.min(history.length * 5, 300) // Estimate: 5 min per turn, max 5 hours

    const turnCount = history.length
    const avgTurnLength = duration / Math.max(turnCount, 1)
    
    const playerEngagement = this.calculatePlayerEngagement(history)
    const storyProgression = this.calculateStoryProgression(history)
    const currentPhase = this.determineSessionPhase(history, duration)
    const energyLevel = this.assessEnergyLevel(history)
    const breakRecommendation = this.suggestBreak(duration, energyLevel, history)
    const fatigueSigns = this.detectFatigueSigns(history)

    return {
      duration,
      turnCount,
      avgTurnLength,
      playerEngagement,
      storyProgression,
      currentPhase,
      energyLevel,
      breakRecommendation,
      fatigueSigns
    }
  }

  private calculatePlayerEngagement(history: HistoryEntry[]): number {
    if (history.length === 0) return 0.5

    const recentTurns = history.slice(-10)
    let engagementScore = 0
    const totalTurns = recentTurns.length

    recentTurns.forEach(turn => {
      const content = turn.content.toLowerCase()
      
      // High engagement indicators
      if (content.includes('plan') || content.includes('idee') || content.includes('frage')) {
        engagementScore += 0.8
      }
      // Medium engagement
      else if (content.includes('macht') || content.includes('sagt') || content.includes('will')) {
        engagementScore += 0.6
      }
      // Low engagement
      else if (content.includes('wartet') || content.includes('schweigt')) {
        engagementScore += 0.2
      }
      // Default moderate engagement
      else {
        engagementScore += 0.4
      }
    })

    return Math.min(engagementScore / totalTurns, 1)
  }

  private calculateStoryProgression(history: HistoryEntry[]): number {
    const progressKeywords = [
      'entdeckt', 'löst', 'findet', 'erreicht', 'besiegt', 'erfüllt',
      'vorankommt', 'fortschritt', 'weiter', 'näher', 'ziel'
    ]

    const recentTurns = history.slice(-15)
    let progressCount = 0

    recentTurns.forEach(turn => {
      const content = turn.content.toLowerCase()
      if (progressKeywords.some(keyword => content.includes(keyword))) {
        progressCount++
      }
    })

    return Math.min(progressCount / 5, 1) // Normalize to 0-1
  }

  private determineSessionPhase(history: HistoryEntry[], duration: number): SessionPhase {
    if (duration < 30) return 'opening'
    if (duration > 240) return 'ending'

    // Analyze story content for phase indicators
    const recentContent = history.slice(-5).map(h => h.content.toLowerCase()).join(' ')
    
    if (recentContent.includes('finale') || recentContent.includes('höhepunkt')) {
      return 'climax'
    }
    if (recentContent.includes('gelöst') || recentContent.includes('abschluss')) {
      return 'resolution'
    }
    if (recentContent.includes('problem') || recentContent.includes('schwierigkeit')) {
      return 'complication'
    }
    
    // Default based on session time
    if (duration < 60) return 'exploration'
    if (duration < 180) return 'complication'
    return 'climax'
  }

  private assessEnergyLevel(history: HistoryEntry[]): EnergyLevel {
    if (history.length < 3) return 'moderate'

    const recentTurns = history.slice(-5)
    let energyScore = 0

    recentTurns.forEach(turn => {
      const content = turn.content.toLowerCase()
      
      this.ENERGY_INDICATORS.high.forEach(indicator => {
        if (content.includes(indicator)) energyScore += 0.3
      })
      
      this.ENERGY_INDICATORS.low.forEach(indicator => {
        if (content.includes(indicator)) energyScore -= 0.2
      })
    })

    if (energyScore > 0.5) return 'high'
    if (energyScore > 0.2) return 'peak'
    if (energyScore < -0.3) return 'low'
    return 'moderate'
  }

  private suggestBreak(duration: number, energyLevel: EnergyLevel, history: HistoryEntry[]): BreakSuggestion {
    // Time-based suggestions
    if (duration > 240) return 'end_session'
    if (duration > 180 && duration % 60 < 10) return 'long'
    if (duration > 120 && duration % 45 < 5) return 'meal'
    if (duration > 90 && duration % 30 < 5) return 'short'

    // Energy-based suggestions
    if (energyLevel === 'low') {
      if (duration > 120) return 'long'
      if (duration > 60) return 'short'
    }

    // Fatigue-based suggestions
    const fatigueSigns = this.detectFatigueSigns(history)
    if (fatigueSigns.length > 2) {
      return duration > 150 ? 'long' : 'short'
    }

    return 'none'
  }

  private detectFatigueSigns(history: HistoryEntry[]): string[] {
    const signs: string[] = []
    const recentTurns = history.slice(-8)

    // Check for fatigue indicators
    const recentContent = recentTurns.map(h => h.content.toLowerCase()).join(' ')
    
    this.FATIGUE_INDICATORS.forEach(indicator => {
      if (recentContent.includes(indicator)) {
        signs.push(indicator)
      }
    })

    // Check for declining turn quality
    if (recentTurns.length > 3) {
      const avgLengthRecent = recentTurns.slice(-3).reduce((sum, turn) => sum + turn.content.length, 0) / 3
      const avgLengthEarlier = recentTurns.slice(0, -3).reduce((sum, turn) => sum + turn.content.length, 0) / (recentTurns.length - 3)
      
      if (avgLengthRecent < avgLengthEarlier * 0.7) {
        signs.push('kürzere Beiträge')
      }
    }

    return [...new Set(signs)] // Remove duplicates
  }

  private identifyStoryBeats(history: HistoryEntry[]): StoryBeat[] {
    const beats: StoryBeat[] = []

    history.forEach((turn, index) => {
      const content = turn.content.toLowerCase()
      
      Object.entries(this.STORY_BEAT_KEYWORDS).forEach(([beatType, keywords]) => {
        if (keywords.some(keyword => content.includes(keyword))) {
          beats.push({
            type: beatType as StoryBeat['type'],
            turn: index,
            description: this.summarizeBeat(content, beatType as StoryBeat['type']),
            intensity: this.calculateBeatIntensity(content),
            characters_involved: this.extractCharacters(),
            completed: true
          })
        }
      })
    })

    // Remove duplicate beats of the same type
    const uniqueBeats: StoryBeat[] = []
    const seenTypes = new Set<string>()
    
    beats.reverse().forEach(beat => {
      if (!seenTypes.has(beat.type)) {
        uniqueBeats.unshift(beat)
        seenTypes.add(beat.type)
      }
    })

    return uniqueBeats
  }

  private predictUpcomingBeats(currentBeats: StoryBeat[], currentPhase: SessionPhase): StoryBeat[] {
    const upcomingBeats: StoryBeat[] = []
    const completedTypes = new Set(currentBeats.map(b => b.type))
    
    const storyStructure: StoryBeat['type'][] = [
      'hook', 'inciting_incident', 'plot_point_1', 'midpoint', 'plot_point_2', 'climax', 'resolution'
    ]

    const phaseMapping: Record<SessionPhase, number> = {
      opening: 0,
      exploration: 2,
      complication: 3,
      climax: 5,
      resolution: 6,
      ending: 6
    }

    const currentIndex = phaseMapping[currentPhase]
    
    // Suggest next logical beats
    for (let i = currentIndex; i < storyStructure.length; i++) {
      const beatType = storyStructure[i]
      if (!completedTypes.has(beatType)) {
        upcomingBeats.push({
          type: beatType,
          turn: -1, // Not yet occurred
          description: this.getSuggestedBeatDescription(beatType),
          intensity: this.getExpectedBeatIntensity(beatType),
          characters_involved: [],
          completed: false
        })
      }
    }

    return upcomingBeats.slice(0, 3) // Next 3 beats
  }

  private summarizeBeat(content: string, beatType: string): string {
    const summaries: Record<string, string> = {
      hook: 'Abenteuer beginnt',
      inciting_incident: 'Konflikt entsteht',
      plot_point_1: 'Wichtige Enthüllung',
      midpoint: 'Wendepunkt erreicht',
      plot_point_2: 'Finale vorbereitet',
      climax: 'Höhepunkt erreicht',
      resolution: 'Problem gelöst'
    }
    return summaries[beatType] || 'Story-Moment'
  }

  private getSuggestedBeatDescription(beatType: StoryBeat['type']): string {
    const descriptions: Record<StoryBeat['type'], string> = {
      hook: 'Auftrag oder Mission etablieren',
      inciting_incident: 'Hauptkonflikt einführen',
      plot_point_1: 'Wichtige Enthüllung oder Entdeckung',
      midpoint: 'Große Wendung oder Überraschung',
      plot_point_2: 'Finale vorbereiten, Spannung aufbauen',
      climax: 'Hauptkonflikt lösen, Höhepunkt',
      resolution: 'Abschluss und Konsequenzen'
    }
    return descriptions[beatType]
  }

  private calculateBeatIntensity(content: string): number {
    const highIntensity = ['kampf', 'tod', 'gefahr', 'schock', 'überraschung']
    const mediumIntensity = ['spannung', 'konflikt', 'problem', 'schwierigkeit']
    
    let intensity = 0.3 // baseline
    
    highIntensity.forEach(word => {
      if (content.includes(word)) intensity += 0.3
    })
    
    mediumIntensity.forEach(word => {
      if (content.includes(word)) intensity += 0.2
    })
    
    return Math.min(intensity, 1)
  }

  private getExpectedBeatIntensity(beatType: StoryBeat['type']): number {
    const intensities: Record<StoryBeat['type'], number> = {
      hook: 0.4,
      inciting_incident: 0.6,
      plot_point_1: 0.7,
      midpoint: 0.8,
      plot_point_2: 0.9,
      climax: 1.0,
      resolution: 0.5
    }
    return intensities[beatType]
  }

  private extractCharacters(): string[] {
    // This would need character names from context
    // For now, returning empty array
    return []
  }

  private generateFlowSuggestions(
    sessionMetrics: SessionMetrics,
    pacingMetrics: PacingMetrics,
    tensionCurve: TensionCurve,
    spotlightAnalysis: SpotlightAnalysis
  ): SessionFlow['flowSuggestions'] {
    const suggestions: SessionFlow['flowSuggestions'] = []

    // Break suggestions
    if (sessionMetrics.breakRecommendation !== 'none') {
      suggestions.push({
        action: `${sessionMetrics.breakRecommendation} Pause einlegen`,
        reason: 'Gruppenmüdigkeit erkannt',
        timing: 'immediate',
        priority: 'high'
      })
    }

    // Pacing suggestions
    if (pacingMetrics.suggestedTransition) {
      suggestions.push({
        action: `Übergang zu ${pacingMetrics.suggestedTransition.to}`,
        reason: pacingMetrics.suggestedTransition.reason,
        timing: pacingMetrics.suggestedTransition.urgency === 'high' ? 'immediate' : 'soon',
        priority: pacingMetrics.suggestedTransition.urgency
      })
    }

    // Spotlight suggestions
    if (spotlightAnalysis.suggestedCharacter) {
      suggestions.push({
        action: `${spotlightAnalysis.suggestedCharacter} in Szene einbeziehen`,
        reason: spotlightAnalysis.reason || 'Spotlight-Balance',
        timing: 'when_appropriate',
        priority: 'medium'
      })
    }

    // Tension suggestions
    suggestions.push({
      action: tensionCurve.nextBeatSuggestion,
      reason: `Aktuelle Spannung: ${tensionCurve.currentLevel}`,
      timing: 'soon',
      priority: tensionCurve.currentLevel === 'low' ? 'high' : 'medium'
    })

    return suggestions.slice(0, 4)
  }

  private analyzePaceAdjustments(
    pacingMetrics: PacingMetrics,
    tensionCurve: TensionCurve,
    sessionMetrics: SessionMetrics
  ): SessionFlow['paceAdjustments'] {
    let current: 'too_slow' | 'too_fast' | 'good' = 'good'
    let suggestion = 'Aktuelles Tempo beibehalten'

    // Check if pacing is too slow
    if (sessionMetrics.storyProgression < 0.3 && sessionMetrics.playerEngagement < 0.5) {
      current = 'too_slow'
      suggestion = 'Tempo erhöhen - neue Herausforderungen oder Ereignisse einführen'
    }
    // Check if pacing is too fast
    else if (tensionCurve.currentLevel === 'high' && pacingMetrics.intensityScore > 0.8) {
      current = 'too_fast'
      suggestion = 'Tempo verlangsamen - Charaktermomente oder Reflexion einbauen'
    }
    // Check variety issues
    else if (pacingMetrics.varietyScore < 0.4) {
      current = 'too_slow'
      suggestion = 'Mehr Abwechslung - verschiedene Aktivitätstypen mischen'
    }

    return { current, suggestion }
  }
}

export const sessionFlowOptimizer = new SessionFlowOptimizer()