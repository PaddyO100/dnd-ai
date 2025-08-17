// lib/engine/pacingAnalyzer.ts

import type { HistoryEntry } from '@/lib/state/gameStore'

export type PacingType = 'exploration' | 'combat' | 'social' | 'downtime' | 'puzzle'
export type TensionLevel = 'low' | 'building' | 'high' | 'climax' | 'resolution'

export interface PacingMetrics {
  currentPacing: PacingType
  recentTrend: PacingType[]
  timeSinceLastCombat: number
  timeSinceLastSocial: number
  timeSinceLastExploration: number
  timeSinceLastPuzzle: number
  varietyScore: number // 0-1, how varied the recent pacing has been
  intensityScore: number // 0-1, current intensity level
  recommendation: string
  suggestedTransition?: {
    from: PacingType
    to: PacingType
    reason: string
    urgency: 'low' | 'medium' | 'high'
  }
  flowQuality: number // 0-1, how smooth transitions are
  pacingRhythm: {
    pattern: 'chaotic' | 'monotonous' | 'balanced' | 'dynamic'
    cycleLength: number // average turns between pacing changes
    predictability: number // 0-1, how predictable the pattern is
  }
  energyFlow: {
    current: 'building' | 'sustaining' | 'declining' | 'recovering'
    momentum: number // -1 to 1, direction of energy change
    sustainability: number // 0-1, can current pace be maintained
  }
}

export interface TensionCurve {
  points: { turn: number; tension: number; event: string }[]
  currentLevel: TensionLevel
  trajectory: 'rising' | 'falling' | 'stable'
  peakIntensity: number
  averageIntensity: number
  storyBeats: string[]
  nextBeatSuggestion: string
  optimalNextTension: number
  tensionArcs: {
    completedArcs: { start: number; peak: number; end: number; type: string }[]
    currentArc?: { start: number; currentPosition: 'rising' | 'peak' | 'falling'; expectedDuration: number }
  }
  dramaticMoments: {
    climaxes: number[]
    revelations: number[]
    betrayals: number[]
    victories: number[]
    losses: number[]
  }
  pacingHarmony: number // 0-1, how well tension matches pacing expectations
}

export class PacingAnalyzer {
  private readonly PACING_KEYWORDS = {
    combat: [
      'kampf', 'angriff', 'schaden', 'würfel', 'initiative', 'attacke', 
      'verteidigung', 'zauber', 'waffe', 'treffer', 'schlag', 'tod', 'verwundet'
    ],
    social: [
      'spricht', 'sagt', 'gespräch', 'überzeug', 'verhandl', 'diplomatie',
      'charme', 'einschüchterung', 'lügen', 'wahrheit', 'freund', 'feind'
    ],
    exploration: [
      'erkund', 'such', 'untersuch', 'raum', 'tür', 'gang', 'karte',
      'weg', 'pfad', 'entdeck', 'versteckt', 'geheim', 'durchgang'
    ],
    puzzle: [
      'rätsel', 'mechanismus', 'lösung', 'knobel', 'denk', 'logik',
      'code', 'schlüssel', 'hebel', 'schalter', 'symbol', 'muster'
    ],
    downtime: [
      'rast', 'pause', 'schläft', 'isst', 'trinkt', 'entspannt', 'wartet',
      'reparier', 'handel', 'einkauf', 'vorbereitung', 'planung'
    ]
  }

  private readonly INTENSITY_INDICATORS = {
    high: [
      'gefahr', 'bedrohung', 'tod', 'sterb', 'panik', 'angst', 'terror',
      'explosion', 'feuer', 'blut', 'schrei', 'flucht', 'verzweiflung'
    ],
    medium: [
      'spannung', 'mysteriös', 'unbekannt', 'verdächtig', 'seltsam',
      'unheimlich', 'düster', 'schatten', 'geräusch', 'bewegung'
    ],
    low: [
      'sicher', 'ruhig', 'friedlich', 'entspannt', 'gelöst', 'erfolgreich',
      'licht', 'warm', 'freundlich', 'vertraut', 'normal'
    ]
  }

  analyzePacing(history: HistoryEntry[], windowSize: number = 10): PacingMetrics {
    const recentTurns = history.slice(-windowSize)
    const pacingTypes: PacingType[] = []
    const counters = {
      combat: 0,
      social: 0,
      exploration: 0,
      puzzle: 0,
      downtime: 0
    }

    // Analyze each turn for pacing indicators
    recentTurns.forEach((turn) => {
      const pacingType = this.classifyPacingType(turn.content.toLowerCase())
      pacingTypes.push(pacingType)

      // Update counters
      Object.keys(counters).forEach(key => {
        if (key === pacingType) {
          counters[key as keyof typeof counters] = 0
        } else {
          counters[key as keyof typeof counters]++
        }
      })
    })

    const currentPacing = pacingTypes[pacingTypes.length - 1] || 'downtime'
    const varietyScore = this.calculateVarietyScore(pacingTypes)
    const intensityScore = this.calculateIntensityScore(recentTurns)
    
    const recommendation = this.generatePacingRecommendation(
      currentPacing,
      counters,
      varietyScore,
      intensityScore
    )

    const suggestedTransition = this.suggestTransition(
      currentPacing,
      counters,
      pacingTypes
    )
    
    const flowQuality = this.calculateFlowQuality(pacingTypes)
    const pacingRhythm = this.analyzePacingRhythm(pacingTypes)
    const energyFlow = this.analyzeEnergyFlow(pacingTypes)

    return {
      currentPacing,
      recentTrend: pacingTypes,
      timeSinceLastCombat: counters.combat,
      timeSinceLastSocial: counters.social,
      timeSinceLastExploration: counters.exploration,
      timeSinceLastPuzzle: counters.puzzle,
      varietyScore,
      intensityScore,
      recommendation,
      suggestedTransition,
      flowQuality,
      pacingRhythm,
      energyFlow
    }
  }

  analyzeTensionCurve(history: HistoryEntry[], maxPoints: number = 20): TensionCurve {
    const points: { turn: number; tension: number; event: string }[] = []
    const storyBeats: string[] = []
    let totalTension = 0

    // Sample points across the history for tension curve
    const stepSize = Math.max(1, Math.floor(history.length / maxPoints))
    
    for (let i = 0; i < history.length; i += stepSize) {
      const turn = history[i]
      const tension = this.calculateTurnTension(turn)
      const event = this.identifyStoryBeat(turn)
      
      points.push({
        turn: i,
        tension,
        event: event || 'normal'
      })
      
      if (event) storyBeats.push(event)
      totalTension += tension
    }

    const averageIntensity = totalTension / points.length
    const peakIntensity = Math.max(...points.map(p => p.tension))
    const currentLevel = this.getTensionLevel(points[points.length - 1]?.tension || 0)
    const trajectory = this.calculateTrajectory(points.slice(-5))
    const nextBeatSuggestion = this.suggestNextBeat(currentLevel, trajectory)
    const optimalNextTension = this.calculateOptimalNextTension(currentLevel, trajectory, averageIntensity)
    const tensionArcs = this.analyzeTensionArcs(points)
    const dramaticMoments = this.identifyDramaticMoments(history, points)
    const pacingHarmony = this.calculatePacingHarmony(points)

    return {
      points,
      currentLevel,
      trajectory,
      peakIntensity,
      averageIntensity,
      storyBeats,
      nextBeatSuggestion,
      optimalNextTension,
      tensionArcs,
      dramaticMoments,
      pacingHarmony
    }
  }

  private classifyPacingType(content: string): PacingType {
    let maxScore = 0
    let detectedType: PacingType = 'downtime'

    Object.entries(this.PACING_KEYWORDS).forEach(([type, keywords]) => {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (content.includes(keyword) ? 1 : 0)
      }, 0)

      if (score > maxScore) {
        maxScore = score
        detectedType = type as PacingType
      }
    })

    return detectedType
  }

  private calculateVarietyScore(pacingTypes: PacingType[]): number {
    const uniqueTypes = new Set(pacingTypes).size
    const maxTypes = 5 // combat, social, exploration, puzzle, downtime
    return Math.min(uniqueTypes / maxTypes, 1)
  }

  private calculateIntensityScore(turns: HistoryEntry[]): number {
    let totalIntensity = 0

    turns.forEach(turn => {
      const content = turn.content.toLowerCase()
      let turnIntensity = 0.3 // baseline

      // Check for intensity indicators
      this.INTENSITY_INDICATORS.high.forEach(keyword => {
        if (content.includes(keyword)) turnIntensity += 0.3
      })
      
      this.INTENSITY_INDICATORS.medium.forEach(keyword => {
        if (content.includes(keyword)) turnIntensity += 0.2
      })
      
      this.INTENSITY_INDICATORS.low.forEach(keyword => {
        if (content.includes(keyword)) turnIntensity -= 0.1
      })

      totalIntensity += Math.min(Math.max(turnIntensity, 0), 1)
    })

    return Math.min(totalIntensity / turns.length, 1)
  }

  private generatePacingRecommendation(
    currentPacing: PacingType,
    counters: Record<string, number>,
    varietyScore: number,
    intensityScore: number
  ): string {
    const suggestions: string[] = []

    // Time-based suggestions
    if (counters.combat > 5) {
      suggestions.push('Zeit für Action - ein Kampf oder eine Bedrohung wäre angemessen')
    }
    if (counters.social > 4) {
      suggestions.push('Soziale Interaktion einbauen - NPCs oder Rollenspiel-Gelegenheiten')
    }
    if (counters.exploration > 3) {
      suggestions.push('Erkundung fördern - neue Räume oder Geheimnisse')
    }
    if (counters.puzzle > 6) {
      suggestions.push('Kopfarbeit - Rätsel oder strategische Herausforderungen')
    }

    // Variety-based suggestions
    if (varietyScore < 0.4) {
      suggestions.push('Mehr Abwechslung - verschiedene Aktivitätstypen mischen')
    }

    // Intensity-based suggestions
    if (intensityScore > 0.8) {
      suggestions.push('Intensität ist hoch - Zeit für eine Atempause oder Entspannung')
    } else if (intensityScore < 0.3) {
      suggestions.push('Niedrige Spannung - etwas Aufregendes oder Unerwartetes einbauen')
    }

    return suggestions.length > 0 ? suggestions[0] : 'Gute Pacing-Balance - weiter so'
  }

  private suggestTransition(
    currentPacing: PacingType,
    counters: Record<string, number>,
    recentTypes: PacingType[]
  ): PacingMetrics['suggestedTransition'] {
    const transitions: { to: PacingType; reason: string; urgency: 'low' | 'medium' | 'high' }[] = []

    // High urgency transitions
    if (counters.combat > 6) {
      transitions.push({ to: 'combat', reason: 'Lange kein Kampf', urgency: 'high' })
    }
    
    // Medium urgency transitions
    if (counters.social > 4 && currentPacing !== 'social') {
      transitions.push({ to: 'social', reason: 'Soziale Interaktion fehlt', urgency: 'medium' })
    }
    
    if (counters.exploration > 4 && currentPacing !== 'exploration') {
      transitions.push({ to: 'exploration', reason: 'Zeit für Entdeckungen', urgency: 'medium' })
    }

    // Low urgency transitions
    if (recentTypes.slice(-3).every(type => type === currentPacing)) {
  const alternatives: PacingType[] = ['combat', 'social', 'exploration', 'puzzle'].map(v => v as PacingType)
        .filter(type => type !== currentPacing)
      
      if (alternatives.length > 0) {
        transitions.push({
          to: alternatives[0],
          reason: 'Abwechslung für besseren Flow',
          urgency: 'low'
        })
      }
    }

    const highestUrgency = transitions.find(t => t.urgency === 'high') ||
                          transitions.find(t => t.urgency === 'medium') ||
                          transitions.find(t => t.urgency === 'low')

    return highestUrgency ? {
      from: currentPacing,
      ...highestUrgency
    } : undefined
  }

  private calculateTurnTension(turn: HistoryEntry): number {
    const content = turn.content.toLowerCase()
    let tension = 0.3 // baseline

    // High tension events
    this.INTENSITY_INDICATORS.high.forEach(keyword => {
      if (content.includes(keyword)) tension += 0.25
    })

    // Medium tension events
    this.INTENSITY_INDICATORS.medium.forEach(keyword => {
      if (content.includes(keyword)) tension += 0.15
    })

    // Low tension events
    this.INTENSITY_INDICATORS.low.forEach(keyword => {
      if (content.includes(keyword)) tension -= 0.1
    })

    return Math.min(Math.max(tension, 0), 1)
  }

  private identifyStoryBeat(turn: HistoryEntry): string | null {
    const content = turn.content.toLowerCase()

    const beats = {
      'conflict_start': ['kampf beginnt', 'angriff', 'bedrohung erscheint'],
      'discovery': ['entdeckt', 'findet', 'geheimnis', 'hinweis'],
      'character_moment': ['entscheidet', 'opfert', 'rettet', 'verrät'],
      'plot_twist': ['überraschung', 'wendung', 'enthüllung', 'wahrheit'],
      'resolution': ['gelöst', 'besiegt', 'gerettet', 'erfolgreich'],
      'cliffhanger': ['plötzlich', 'unerwartets', 'aber dann', 'jedoch']
    }

    for (const [beat, keywords] of Object.entries(beats)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return beat
      }
    }

    return null
  }

  private getTensionLevel(tension: number): TensionLevel {
    if (tension < 0.2) return 'low'
    if (tension < 0.4) return 'building'
    if (tension < 0.7) return 'high'
    if (tension < 0.9) return 'climax'
    return 'resolution'
  }

  private calculateTrajectory(recentPoints: { tension: number }[]): 'rising' | 'falling' | 'stable' {
    if (recentPoints.length < 2) return 'stable'

    const first = recentPoints[0].tension
    const last = recentPoints[recentPoints.length - 1].tension
    const diff = last - first

    if (Math.abs(diff) < 0.1) return 'stable'
    return diff > 0 ? 'rising' : 'falling'
  }

  private suggestNextBeat(
    currentLevel: TensionLevel,
    trajectory: 'rising' | 'falling' | 'stable'
  ): string {
    if (currentLevel === 'low' && trajectory !== 'rising') {
      return 'Konflikt oder Bedrohung einführen um Spannung aufzubauen'
    }
    
    if (currentLevel === 'climax') {
      return 'Zur Auflösung führen - Höhepunkt abschließen'
    }
    
    if (currentLevel === 'high' && trajectory === 'rising') {
      return 'Höhepunkt vorbereiten oder dramatischen Moment schaffen'
    }
    
    if (trajectory === 'falling' && currentLevel === 'building') {
      return 'Neue Spannung aufbauen oder Wendung einführen'
    }
    
    return 'Aktuelle Spannung halten und Momentum nutzen'
  }

  private calculateOptimalNextTension(
    currentLevel: TensionLevel,
    trajectory: 'rising' | 'falling' | 'stable',
    averageIntensity: number
  ): number {
    const currentTensionMap = { low: 0.2, building: 0.4, high: 0.7, climax: 0.9, resolution: 0.5 }
    const current = currentTensionMap[currentLevel]

    if (trajectory === 'rising' && currentLevel !== 'climax') {
      return Math.min(current + 0.2, 1.0)
    }
    
    if (trajectory === 'falling' && currentLevel !== 'low') {
      return Math.max(current - 0.15, 0.1)
    }
    
    // For stable trajectory, suggest slight variation based on average
    if (current > averageIntensity) {
      return current - 0.1
    } else {
      return current + 0.1
    }
  }

  private calculateFlowQuality(pacingTypes: PacingType[]): number {
    if (pacingTypes.length < 3) return 0.5

    let smoothTransitions = 0
    const totalTransitions = pacingTypes.length - 1

    // Define transition quality matrix
    const transitionQuality = {
      combat: { social: 0.9, exploration: 0.7, puzzle: 0.6, downtime: 0.8, combat: 0.3 },
      social: { exploration: 0.8, puzzle: 0.7, downtime: 0.6, combat: 0.9, social: 0.2 },
      exploration: { puzzle: 0.9, social: 0.8, combat: 0.7, downtime: 0.5, exploration: 0.3 },
      puzzle: { social: 0.8, exploration: 0.9, downtime: 0.7, combat: 0.6, puzzle: 0.2 },
      downtime: { social: 0.9, exploration: 0.8, combat: 0.9, puzzle: 0.7, downtime: 0.1 }
    }

    for (let i = 0; i < totalTransitions; i++) {
      const from = pacingTypes[i]
      const to = pacingTypes[i + 1]
      smoothTransitions += transitionQuality[from]?.[to] || 0.5
    }

    return smoothTransitions / totalTransitions
  }

  private analyzePacingRhythm(pacingTypes: PacingType[]): PacingMetrics['pacingRhythm'] {
    if (pacingTypes.length < 4) {
      return { pattern: 'balanced', cycleLength: 1, predictability: 0.5 }
    }

    // Calculate transition intervals
    const transitions: number[] = []
    let currentType = pacingTypes[0]
    let currentStreak = 1

    for (let i = 1; i < pacingTypes.length; i++) {
      if (pacingTypes[i] === currentType) {
        currentStreak++
      } else {
        transitions.push(currentStreak)
        currentType = pacingTypes[i]
        currentStreak = 1
      }
    }
    transitions.push(currentStreak)

    const avgCycleLength = transitions.reduce((sum, len) => sum + len, 0) / transitions.length
    const variance = transitions.reduce((acc, len) => acc + Math.pow(len - avgCycleLength, 2), 0) / transitions.length
    const predictability = Math.max(0, 1 - (variance / avgCycleLength))

    // Determine pattern type
    let pattern: PacingMetrics['pacingRhythm']['pattern']
    if (variance > avgCycleLength * 2) {
      pattern = 'chaotic'
    } else if (variance < 0.5) {
      pattern = 'monotonous'
    } else if (predictability > 0.7) {
      pattern = 'balanced'
    } else {
      pattern = 'dynamic'
    }

    return { pattern, cycleLength: avgCycleLength, predictability }
  }

  private analyzeEnergyFlow(pacingTypes: PacingType[]): PacingMetrics['energyFlow'] {
    if (pacingTypes.length < 3) {
      return { current: 'sustaining', momentum: 0, sustainability: 0.5 }
    }

    // Energy values for different pacing types
    const energyValues = {
      combat: 0.9,
      social: 0.6,
      exploration: 0.5,
      puzzle: 0.7,
      downtime: 0.3
    }

    const recentEnergies = pacingTypes.slice(-3).map(type => energyValues[type])
    const currentEnergy = recentEnergies[recentEnergies.length - 1]
    const previousEnergy = recentEnergies[recentEnergies.length - 2]
    
    const momentum = currentEnergy - previousEnergy
    
    // Determine energy flow state
    let current: PacingMetrics['energyFlow']['current']
    if (momentum > 0.2) {
      current = 'building'
    } else if (momentum < -0.2) {
      current = 'declining'
    } else if (currentEnergy < 0.4) {
      current = 'recovering'
    } else {
      current = 'sustaining'
    }

    // Calculate sustainability based on high-energy streaks
    const highEnergyStreak = this.calculateHighEnergyStreak(pacingTypes)
    const sustainability = Math.max(0, 1 - (highEnergyStreak / 5)) // Diminishing returns after 5 high-energy turns

    return { current, momentum, sustainability }
  }

  private calculateHighEnergyStreak(pacingTypes: PacingType[]): number {
    const highEnergyTypes = new Set(['combat', 'puzzle'])
    let streak = 0
    
    for (let i = pacingTypes.length - 1; i >= 0; i--) {
      if (highEnergyTypes.has(pacingTypes[i])) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  private analyzeTensionArcs(points: { turn: number; tension: number; event: string }[]): TensionCurve['tensionArcs'] {
    const completedArcs: TensionCurve['tensionArcs']['completedArcs'] = []
    let currentArc: TensionCurve['tensionArcs']['currentArc'] | undefined

    if (points.length < 3) {
      return { completedArcs, currentArc }
    }

    // Find peaks (local maxima) and valleys (local minima)
    const peaks: number[] = []
    const valleys: number[] = []

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1].tension
      const curr = points[i].tension
      const next = points[i + 1].tension

      if (curr > prev && curr > next && curr > 0.6) {
        peaks.push(i)
      } else if (curr < prev && curr < next && curr < 0.4) {
        valleys.push(i)
      }
    }

    // Create completed arcs
    for (let i = 0; i < peaks.length - 1; i++) {
      const start = i > 0 ? valleys[i - 1] || 0 : 0
      const peak = peaks[i]
      const end = valleys[i] || peaks[i + 1] || points.length - 1

      completedArcs.push({
        start: points[start].turn,
        peak: points[peak].turn,
        end: points[end].turn,
        type: this.classifyArcType(points.slice(start, end + 1))
      })
    }

    // Determine current arc if we're in one
    const lastPeak = peaks[peaks.length - 1]
    const lastValley = valleys[valleys.length - 1]
    
    if (lastPeak !== undefined) {
      const currentTurn = points.length - 1
      const currentTension = points[currentTurn].tension
      
      if (lastPeak > (lastValley || -1)) {
        // We're past the last peak, potentially falling
        currentArc = {
          start: points[lastPeak].turn,
          currentPosition: 'falling',
          expectedDuration: Math.ceil((points[lastPeak].tension - 0.3) * 5) // Estimate based on tension drop needed
        }
      } else {
        // We might be building to a new peak
        currentArc = {
          start: points[lastValley || 0].turn,
          currentPosition: currentTension > 0.6 ? 'peak' : 'rising',
          expectedDuration: Math.ceil((0.7 - currentTension) * 3) // Estimate to reach high tension
        }
      }
    }

    return { completedArcs, currentArc }
  }

  private classifyArcType(arcPoints: { turn: number; tension: number; event: string }[]): string {
    const events = arcPoints.map(p => p.event).join(' ')
    
    if (events.includes('conflict') || events.includes('danger')) {
      return 'conflict_arc'
    } else if (events.includes('discovery') || events.includes('revelation')) {
      return 'mystery_arc'
    } else if (events.includes('character')) {
      return 'character_arc'
    } else {
      return 'plot_arc'
    }
  }

  private identifyDramaticMoments(history: HistoryEntry[], points: { turn: number; tension: number; event: string }[]): TensionCurve['dramaticMoments'] {
    const dramaticMoments: TensionCurve['dramaticMoments'] = {
      climaxes: [],
      revelations: [],
      betrayals: [],
      victories: [],
      losses: []
    }

    history.forEach((turn, index) => {
      const content = turn.content.toLowerCase()
      const point = points.find(p => p.turn === index)
      const tension = point?.tension || 0

      // High tension moments
      if (tension > 0.8) {
        if (content.includes('höhepunkt') || content.includes('finale') || content.includes('showdown')) {
          dramaticMoments.climaxes.push(index)
        }
      }

      // Story revelations
      if (content.includes('enthüllung') || content.includes('wahrheit') || content.includes('geheimnis gelüftet')) {
        dramaticMoments.revelations.push(index)
      }

      // Betrayals
      if (content.includes('verrat') || content.includes('täuschung') || content.includes('hintergangen')) {
        dramaticMoments.betrayals.push(index)
      }

      // Victories
      if (content.includes('sieg') || content.includes('besiegt') || content.includes('gewonnen') || content.includes('triumph')) {
        dramaticMoments.victories.push(index)
      }

      // Losses
      if (content.includes('verlust') || content.includes('niederlag') || content.includes('gescheitert') || content.includes('gefallen')) {
        dramaticMoments.losses.push(index)
      }
    })

    return dramaticMoments
  }

  private calculatePacingHarmony(points: { turn: number; tension: number; event: string }[]): number {
    if (points.length < 5) return 0.5

    let harmonicScore = 0
    let comparisons = 0

    // Check if tension changes align with expected pacing patterns
    for (let i = 1; i < points.length; i++) {
      const prevTension = points[i - 1].tension
      const currTension = points[i].tension
      const change = currTension - prevTension

      // Expected tension change based on current level
      let expectedChange = 0
      if (prevTension < 0.3) {
        expectedChange = 0.1 // Should be building
      } else if (prevTension > 0.8) {
        expectedChange = -0.1 // Should be resolving
      } else {
        expectedChange = Math.sin((i / points.length) * Math.PI) * 0.1 // Natural wave pattern
      }

      // Compare actual vs expected change
      const agreement = 1 - Math.abs(change - expectedChange)
      harmonicScore += Math.max(0, agreement)
      comparisons++
    }

    return harmonicScore / comparisons
  }
}

export const pacingAnalyzer = new PacingAnalyzer()