// lib/engine/difficultyAdjuster.ts

import type { HistoryEntry, Player } from '@/lib/state/gameStore'

export type DifficultyScale = 'trivial' | 'easy' | 'moderate' | 'hard' | 'extreme'
export type ChallengeType = 'combat' | 'social' | 'puzzle' | 'skill' | 'exploration'
export type OutcomeType = 'success' | 'failure' | 'mixed' | 'critical_success' | 'critical_failure'

export interface Challenge {
  type: ChallengeType
  difficulty: DifficultyScale
  outcome: OutcomeType
  turn: number
  participatingCharacters: string[]
  description: string
  successRate: number // 0-1, how well the party performed
}

export interface PartyCapability {
  overallPower: number // 0-1, estimated party strength
  strengths: string[] // areas where party excels
  weaknesses: string[] // areas where party struggles
  recentPerformance: number // 0-1, how well they've been doing lately
  adaptability: number // 0-1, how well they handle varied challenges
  characterCapabilities: Record<string, {
    combat: number
    social: number
    problem_solving: number
    exploration: number
    overall: number
  }>
}

export interface DifficultyAnalysis {
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
  confidenceScore: number // 0-1, how confident we are in the recommendation
}

export interface DifficultySettings {
  targetSuccessRate: number // 0.6-0.8 typically
  adaptationRate: number // how quickly to adjust (0.1-0.3)
  riskTolerance: number // 0-1, how much challenge variation to allow
  considerIndividualSkills: boolean
  balanceForWeakestMember: boolean
}

export class DifficultyAdjuster {
  private readonly CHALLENGE_KEYWORDS = {
    combat: [
      'kampf', 'angriff', 'schlag', 'zauber', 'waffe', 'treffer', 
      'verteidigung', 'initiative', 'schaden', 'hp', 'lebenspunkte'
    ],
    social: [
      'überzeug', 'verhandl', 'diplomatie', 'einschüchter', 'charme', 
      'lügen', 'wahrheit', 'gespräch', 'npc', 'reaktion'
    ],
    puzzle: [
      'rätsel', 'lösung', 'mechanismus', 'code', 'schlüssel', 
      'symbol', 'muster', 'logik', 'durchschaut', 'herausgefunden'
    ],
    skill: [
      'würfel', 'probe', 'check', 'fertigk', 'attribut', 
      'geschicklichkeit', 'stärke', 'intelligenz', 'weisheit'
    ],
    exploration: [
      'erkund', 'such', 'untersuch', 'entdeck', 'karte', 
      'raum', 'gang', 'tür', 'versteckt', 'geheim'
    ]
  }

  private readonly OUTCOME_INDICATORS = {
    critical_success: ['kritisch', 'perfekt', 'brillant', 'meisterh', 'unglaublich'],
    success: ['erfolg', 'geschafft', 'gelungen', 'gewonnen', 'bestanden'],
    mixed: ['teils', 'gemischt', 'kompliziert', 'schwierig', 'knapp'],
    failure: ['versagt', 'misslungen', 'verloren', 'gescheitert', 'nicht geschafft'],
    critical_failure: ['katastrophe', 'desaster', 'völlig versagt', 'peinlich', 'pech']
  }

  private readonly DIFFICULTY_INDICATORS = {
    trivial: ['kinderleicht', 'simpel', 'ohne mühe'],
    easy: ['leicht', 'einfach', 'problemlos', 'schnell'],
    moderate: ['normal', 'angemessen', 'standard', 'durchschnitt'],
    hard: ['schwer', 'schwierig', 'herausfordernd', 'kompliziert'],
    extreme: ['extrem', 'unmöglich', 'verzweifelt', 'hoffnungslos']
  }

  private defaultSettings: DifficultySettings = {
    targetSuccessRate: 0.65,
    adaptationRate: 0.2,
    riskTolerance: 0.3,
    considerIndividualSkills: true,
    balanceForWeakestMember: false
  }

  analyzeDifficulty(
    history: HistoryEntry[], 
    party: Player[], 
    settings: Partial<DifficultySettings> = {}
  ): DifficultyAnalysis {
    const config = { ...this.defaultSettings, ...settings }
    
    const recentChallenges = this.extractChallenges(history, 10)
    const partyCapability = this.assessPartyCapability(history, party, recentChallenges)
    const currentScale = this.calculateCurrentDifficulty(recentChallenges)
    
    const recommendation = this.generateRecommendation(
      recentChallenges, 
      partyCapability, 
      config
    )
    
    const reasoning = this.generateReasoning(
      recentChallenges, 
      partyCapability, 
      currentScale, 
      recommendation.difficulty
    )
    
    const adjustmentSuggestions = this.generateAdjustmentSuggestions(
      recentChallenges, 
      partyCapability
    )

    return {
      currentScale,
      recentChallenges,
      partyCapability,
      recommendation: recommendation.difficulty,
      reasoning,
      adjustmentSuggestions,
      confidenceScore: recommendation.confidence
    }
  }

  private extractChallenges(history: HistoryEntry[], maxChallenges: number): Challenge[] {
    const challenges: Challenge[] = []
    
    history.forEach((turn, index) => {
      const content = turn.content.toLowerCase()
      const challengeType = this.identifyChallengeType(content)
      
      if (challengeType) {
        const difficulty = this.extractDifficulty(content)
        const outcome = this.extractOutcome(content)
        const successRate = this.calculateTurnSuccessRate(outcome)
        const participatingCharacters = this.extractParticipatingCharacters()
        
        challenges.push({
          type: challengeType,
          difficulty,
          outcome,
          turn: index,
          participatingCharacters,
          description: this.summarizeChallenge(content, challengeType),
          successRate
        })
      }
    })
    
    return challenges.slice(-maxChallenges)
  }

  private identifyChallengeType(content: string): ChallengeType | null {
    let maxScore = 0
    let detectedType: ChallengeType | null = null

    Object.entries(this.CHALLENGE_KEYWORDS).forEach(([type, keywords]) => {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (content.includes(keyword) ? 1 : 0)
      }, 0)

      if (score > maxScore) {
        maxScore = score
        detectedType = type as ChallengeType
      }
    })

    return maxScore > 0 ? detectedType : null
  }

  private extractDifficulty(content: string): DifficultyScale {
    for (const [difficulty, keywords] of Object.entries(this.DIFFICULTY_INDICATORS)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return difficulty as DifficultyScale
      }
    }
    return 'moderate' // default
  }

  private extractOutcome(content: string): OutcomeType {
    for (const [outcome, keywords] of Object.entries(this.OUTCOME_INDICATORS)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return outcome as OutcomeType
      }
    }
    return 'mixed' // default
  }

  private calculateTurnSuccessRate(outcome: OutcomeType): number {
    const rates = {
      critical_success: 1.0,
      success: 0.8,
      mixed: 0.5,
      failure: 0.2,
      critical_failure: 0.0
    }
    return rates[outcome]
  }

  private extractParticipatingCharacters(): string[] {
    const participants: string[] = []
    // This would need character names from context
    // For now, returning empty array
    return participants
  }

  private summarizeChallenge(content: string, type: ChallengeType): string {
    const summaries = {
      combat: 'Kampfsituation',
      social: 'Soziale Interaktion',
      puzzle: 'Rätsel oder Problem',
      skill: 'Fertigkeitsprobe',
      exploration: 'Erkundung'
    }
    return summaries[type]
  }

  private assessPartyCapability(
    history: HistoryEntry[], 
    party: Player[], 
    challenges: Challenge[]
  ): PartyCapability {
    const characterCapabilities: PartyCapability['characterCapabilities'] = {}
    
    // Assess individual character capabilities
    party.forEach(player => {
      const combat = this.assessCharacterCapability(player, 'combat')
      const social = this.assessCharacterCapability(player, 'social')
      const problem_solving = this.assessCharacterCapability(player, 'problem_solving')
      const exploration = this.assessCharacterCapability(player, 'exploration')
      const overall = (combat + social + problem_solving + exploration) / 4

      characterCapabilities[player.name] = {
        combat,
        social,
        problem_solving,
        exploration,
        overall
      }
    })

    // Calculate overall party metrics
    const overallPower = this.calculateOverallPower(characterCapabilities)
    const recentPerformance = this.calculateRecentPerformance(challenges)
    const adaptability = this.calculateAdaptability(challenges)
    const { strengths, weaknesses } = this.identifyStrengthsWeaknesses(challenges)

    return {
      overallPower,
      strengths,
      weaknesses,
      recentPerformance,
      adaptability,
      characterCapabilities
    }
  }

  private assessCharacterCapability(player: Player, capability: string): number {
    // This would need to analyze character stats, level, equipment, etc.
    // For now, using a simplified calculation based on stats
    const stats = player.stats || {}
    const relevantStats = this.getRelevantStats(capability)
    
    let total = 0
    let count = 0
    
    relevantStats.forEach(stat => {
      if (stats[stat]) {
        total += stats[stat]
        count++
      }
    })
    
    const average = count > 0 ? total / count : 10
    return Math.min(average / 20, 1) // Normalize to 0-1 scale
  }

  private getRelevantStats(capability: string): string[] {
    const statMappings = {
      combat: ['strength', 'dexterity', 'constitution', 'stärke', 'geschicklichkeit'],
      social: ['charisma', 'wisdom', 'charisma', 'weisheit'],
      problem_solving: ['intelligence', 'wisdom', 'intelligenz', 'weisheit'],
      exploration: ['dexterity', 'wisdom', 'perception', 'geschicklichkeit', 'wahrnehmung']
    }
    
    return statMappings[capability as keyof typeof statMappings] || []
  }

  private calculateOverallPower(capabilities: PartyCapability['characterCapabilities']): number {
    const overalls = Object.values(capabilities).map(cap => cap.overall)
    return overalls.reduce((sum, val) => sum + val, 0) / overalls.length
  }

  private calculateRecentPerformance(challenges: Challenge[]): number {
    if (challenges.length === 0) return 0.6 // default
    
    const recentChallenges = challenges.slice(-5)
    const avgSuccessRate = recentChallenges.reduce((sum, ch) => sum + ch.successRate, 0) / recentChallenges.length
    return avgSuccessRate
  }

  private calculateAdaptability(challenges: Challenge[]): number {
    const challengeTypes = challenges.map(ch => ch.type)
    const uniqueTypes = new Set(challengeTypes).size
    const maxTypes = 5 // combat, social, puzzle, skill, exploration
    
    // Adaptability is based on variety of challenges handled and average performance
    const varietyScore = uniqueTypes / maxTypes
    const consistencyScore = this.calculateConsistencyScore(challenges)
    
    return (varietyScore * 0.6) + (consistencyScore * 0.4)
  }

  private calculateConsistencyScore(challenges: Challenge[]): number {
    if (challenges.length < 2) return 0.5
    
    const successRates = challenges.map(ch => ch.successRate)
    const avg = successRates.reduce((a, b) => a + b, 0) / successRates.length
    const variance = successRates.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / successRates.length
    
    // Lower variance = higher consistency
    return Math.max(0, 1 - variance)
  }

  private identifyStrengthsWeaknesses(challenges: Challenge[]): { strengths: string[]; weaknesses: string[] } {
    const typePerformance: Record<string, number[]> = {}
    
    challenges.forEach(challenge => {
      if (!typePerformance[challenge.type]) {
        typePerformance[challenge.type] = []
      }
      typePerformance[challenge.type].push(challenge.successRate)
    })

    const averages: Record<string, number> = {}
    Object.entries(typePerformance).forEach(([type, rates]) => {
      averages[type] = rates.reduce((a, b) => a + b, 0) / rates.length
    })

    const overallAvg = Object.values(averages).reduce((a, b) => a + b, 0) / Object.values(averages).length

    const strengths = Object.entries(averages)
      .filter(([, avg]) => avg > overallAvg + 0.15)
      .map(([type]) => type)

    const weaknesses = Object.entries(averages)
      .filter(([, avg]) => avg < overallAvg - 0.15)
      .map(([type]) => type)

    return { strengths, weaknesses }
  }

  private calculateCurrentDifficulty(challenges: Challenge[]): DifficultyScale {
    if (challenges.length === 0) return 'moderate'
    
    const difficultyValues = {
      trivial: 1,
      easy: 2,
      moderate: 3,
      hard: 4,
      extreme: 5
    }
    
    const reverseMap = ['trivial', 'easy', 'moderate', 'hard', 'extreme']
    
    const avgDifficulty = challenges.reduce((sum, ch) => {
      return sum + difficultyValues[ch.difficulty]
    }, 0) / challenges.length
    
    return reverseMap[Math.round(avgDifficulty) - 1] as DifficultyScale
  }

  private generateRecommendation(
    challenges: Challenge[],
    capability: PartyCapability,
    config: DifficultySettings
  ): { difficulty: DifficultyScale; confidence: number } {
    const currentPerformance = capability.recentPerformance
    const target = config.targetSuccessRate
    // const adaptationRate = config.adaptationRate
    
    let adjustment = 0
    let confidence = 0.5

    if (currentPerformance > target + 0.1) {
      // Too easy - increase difficulty
      adjustment = 1
      confidence = Math.min((currentPerformance - target) * 2, 0.9)
    } else if (currentPerformance < target - 0.1) {
      // Too hard - decrease difficulty
      adjustment = -1
      confidence = Math.min((target - currentPerformance) * 2, 0.9)
    } else {
      // About right - maintain
      adjustment = 0
      confidence = 0.8
    }

    // Consider adaptability and overall power
    if (capability.adaptability > 0.7 && capability.overallPower > 0.6) {
      adjustment = Math.max(adjustment, 0) // Don't lower difficulty for adaptable parties
      confidence *= 1.1
    }

    const currentDifficulty = this.calculateCurrentDifficulty(challenges)
    const difficultyMap = ['trivial', 'easy', 'moderate', 'hard', 'extreme']
    const currentIndex = difficultyMap.indexOf(currentDifficulty)
    const newIndex = Math.max(0, Math.min(4, currentIndex + adjustment))
    
    return {
      difficulty: difficultyMap[newIndex] as DifficultyScale,
      confidence: Math.min(confidence, 1)
    }
  }

  private generateReasoning(
    challenges: Challenge[],
    capability: PartyCapability,
    current: DifficultyScale,
    recommended: DifficultyScale
  ): string {
    const performance = capability.recentPerformance
    const reasons: string[] = []

    if (performance > 0.75) {
      reasons.push('Gruppe löst Herausforderungen zu leicht')
    } else if (performance < 0.45) {
      reasons.push('Gruppe kämpft mit aktueller Schwierigkeit')
    } else {
      reasons.push('Aktuelle Schwierigkeit ist angemessen')
    }

    if (capability.adaptability > 0.7) {
      reasons.push('Hohe Anpassungsfähigkeit der Gruppe')
    }

    if (capability.strengths.length > 0) {
      reasons.push(`Stärken: ${capability.strengths.join(', ')}`)
    }

    if (capability.weaknesses.length > 0) {
      reasons.push(`Schwächen: ${capability.weaknesses.join(', ')}`)
    }

    if (current !== recommended) {
      const direction = ['trivial', 'easy', 'moderate', 'hard', 'extreme'].indexOf(recommended) > 
                       ['trivial', 'easy', 'moderate', 'hard', 'extreme'].indexOf(current) ? 
                       'erhöhen' : 'senken'
      reasons.push(`Schwierigkeit ${direction} empfohlen`)
    }

    return reasons.join(' • ')
  }

  private generateAdjustmentSuggestions(
    challenges: Challenge[],
    capability: PartyCapability
  ): DifficultyAnalysis['adjustmentSuggestions'] {
    const suggestions: DifficultyAnalysis['adjustmentSuggestions'] = []
    
    // Type-specific suggestions based on weaknesses
    capability.weaknesses.forEach(weakness => {
      const currentTypeChallenge = challenges.find(ch => ch.type === weakness)
      if (currentTypeChallenge) {
        suggestions.push({
          type: weakness as ChallengeType,
          currentDifficulty: currentTypeChallenge.difficulty,
          suggestedDifficulty: this.lowerDifficulty(currentTypeChallenge.difficulty),
          reason: `Schwäche der Gruppe in ${weakness}`,
          priority: 'high'
        })
      }
    })

    // Suggestions based on strengths
    capability.strengths.forEach(strength => {
      const currentTypeChallenge = challenges.find(ch => ch.type === strength)
      if (currentTypeChallenge) {
        suggestions.push({
          type: strength as ChallengeType,
          currentDifficulty: currentTypeChallenge.difficulty,
          suggestedDifficulty: this.raiseDifficulty(currentTypeChallenge.difficulty),
          reason: `Stärke der Gruppe in ${strength} nutzen`,
          priority: 'medium'
        })
      }
    })

    return suggestions.slice(0, 3) // Top 3 suggestions
  }

  private lowerDifficulty(current: DifficultyScale): DifficultyScale {
    const map: Record<DifficultyScale, DifficultyScale> = { 
      extreme: 'hard', 
      hard: 'moderate', 
      moderate: 'easy', 
      easy: 'trivial', 
      trivial: 'trivial' 
    }
    return map[current]
  }

  private raiseDifficulty(current: DifficultyScale): DifficultyScale {
    const map: Record<DifficultyScale, DifficultyScale> = { 
      trivial: 'easy', 
      easy: 'moderate', 
      moderate: 'hard', 
      hard: 'extreme', 
      extreme: 'extreme' 
    }
    return map[current]
  }
}

export const difficultyAdjuster = new DifficultyAdjuster()