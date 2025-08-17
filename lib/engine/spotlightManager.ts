// lib/engine/spotlightManager.ts

import type { HistoryEntry, Player } from '@/lib/state/gameStore';

export interface CharacterSpotlight {
  name: string
  totalMentions: number
  recentActivity: number
  lastSpotlight: number
  consecutiveSpotlights: number
  actionTypes: string[]
  participationScore: number // 0-1, overall participation quality
  engagementTrend: 'increasing' | 'decreasing' | 'stable'
  characterMoments: {
    type: 'heroic' | 'social' | 'clever' | 'dramatic' | 'comedic'
    turn: number
    description: string
  }[]
}

export interface SpotlightAnalysis {
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

export class SpotlightManager {
  private readonly ACTION_KEYWORDS = {
    combat: ['angriff', 'kämpf', 'schlag', 'zauber', 'schießt', 'verteidigung'],
    social: ['spricht', 'sagt', 'überzeug', 'charme', 'diplomatie', 'verhandl'],
    clever: ['plan', 'idee', 'trick', 'lösung', 'strategie', 'durchschaut'],
    heroic: ['rett', 'opfer', 'mut', 'tapfer', 'held', 'beschütz'],
    comedic: ['lacht', 'witzig', 'scherz', 'peinlich', 'tollpatsch', 'humor'],
    dramatic: ['ernst', 'emotional', 'träne', 'wut', 'verzweiflung', 'entscheidung']
  }

  private readonly PARTICIPATION_INDICATORS = {
    active: ['macht', 'tut', 'versucht', 'will', 'entscheidet', 'handelt'],
    reactive: ['antwortet', 'reagiert', 'folgt', 'stimmt zu', 'nickt'],
    passive: ['schweigt', 'wartet', 'beobachtet', 'hört zu', 'bleibt still']
  }

  analyzeSpotlight(history: HistoryEntry[], party: Player[], windowSize: number = 15): SpotlightAnalysis {
    const recentHistory = history.slice(-windowSize)
    const characterSpotlights: Record<string, CharacterSpotlight> = {}

    // Initialize character spotlights
    party.forEach(player => {
      characterSpotlights[player.name] = {
        name: player.name,
        totalMentions: 0,
        recentActivity: 0,
        lastSpotlight: history.length,
        consecutiveSpotlights: 0,
        actionTypes: [],
        participationScore: 0,
        engagementTrend: 'stable',
        characterMoments: []
      }
    })

    // Analyze each turn for character involvement
    this.analyzeCharacterInvolvement(history, characterSpotlights)
    this.analyzeRecentActivity(recentHistory, characterSpotlights)
    this.calculateParticipationScores(characterSpotlights)
    this.identifyCharacterMoments(history, characterSpotlights)
    this.calculateEngagementTrends(history, characterSpotlights, windowSize)

    const balanceScore = this.calculateBalanceScore(characterSpotlights)
    const groupDynamics = this.analyzeGroupDynamics(history, characterSpotlights)
    const suggestions = this.generateSpotlightSuggestions(characterSpotlights, groupDynamics)

    return {
      characterSpotlights,
      suggestedCharacter: suggestions[0]?.character,
      reason: suggestions[0]?.reason,
      balanceScore,
      recommendations: suggestions,
      groupDynamics
    }
  }

  private analyzeCharacterInvolvement(
    history: HistoryEntry[],
    spotlights: Record<string, CharacterSpotlight>
  ): void {
    const consecutiveTracker: Record<string, number> = {}

    history.forEach((turn, index) => {
      const content = turn.content.toLowerCase()
      const turnCharacters: string[] = []

      // Check which characters are mentioned
      Object.keys(spotlights).forEach(name => {
        const lowerName = name.toLowerCase()
        if (content.includes(lowerName)) {
          spotlights[name].totalMentions++
          spotlights[name].lastSpotlight = history.length - index
          turnCharacters.push(name)

          // Track action types
          this.classifyActions(content, spotlights[name])
        }
      })

      // Update consecutive spotlight tracking
      turnCharacters.forEach(char => {
        consecutiveTracker[char] = (consecutiveTracker[char] || 0) + 1
        spotlights[char].consecutiveSpotlights = consecutiveTracker[char]
      })

      // Reset consecutive count for characters not mentioned
      Object.keys(spotlights).forEach(char => {
        if (!turnCharacters.includes(char)) {
          consecutiveTracker[char] = 0
        }
      })
    })
  }

  private analyzeRecentActivity(
    recentHistory: HistoryEntry[],
    spotlights: Record<string, CharacterSpotlight>
  ): void {
    recentHistory.forEach(turn => {
      const content = turn.content.toLowerCase()
      
      Object.keys(spotlights).forEach(name => {
        const lowerName = name.toLowerCase()
        if (content.includes(lowerName)) {
          spotlights[name].recentActivity++
        }
      })
    })
  }

  private classifyActions(content: string, spotlight: CharacterSpotlight): void {
    Object.entries(this.ACTION_KEYWORDS).forEach(([type, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        if (!spotlight.actionTypes.includes(type)) {
          spotlight.actionTypes.push(type)
        }
      }
    })
  }

  private calculateParticipationScores(spotlights: Record<string, CharacterSpotlight>): void {
    Object.values(spotlights).forEach(spotlight => {
      let score = 0

      // Base score from mentions and recency
      score += Math.min(spotlight.totalMentions / 10, 0.3)
      score += Math.min(spotlight.recentActivity / 5, 0.3)
      
      // Bonus for action variety
      score += (spotlight.actionTypes.length / 6) * 0.2
      
      // Penalty for being quiet too long
      if (spotlight.lastSpotlight > 8) {
        score *= 0.7
      }
      
      // Bonus for character moments
      score += Math.min(spotlight.characterMoments.length / 3, 0.2)

      spotlight.participationScore = Math.min(score, 1)
    })
  }

  private identifyCharacterMoments(
    history: HistoryEntry[],
    spotlights: Record<string, CharacterSpotlight>
  ): void {
    history.forEach((turn, index) => {
      const content = turn.content.toLowerCase()
      
      Object.values(spotlights).forEach(spotlight => {
        const name = spotlight.name.toLowerCase()
        
        if (content.includes(name)) {
          // Check for different types of character moments
          if (this.ACTION_KEYWORDS.heroic.some(keyword => content.includes(keyword))) {
            spotlight.characterMoments.push({
              type: 'heroic',
              turn: index,
              description: 'Heldenhafte Tat oder mutiges Handeln'
            })
          }
          
          if (this.ACTION_KEYWORDS.clever.some(keyword => content.includes(keyword))) {
            spotlight.characterMoments.push({
              type: 'clever',
              turn: index,
              description: 'Clevere Lösung oder strategisches Denken'
            })
          }
          
          if (this.ACTION_KEYWORDS.dramatic.some(keyword => content.includes(keyword))) {
            spotlight.characterMoments.push({
              type: 'dramatic',
              turn: index,
              description: 'Emotionaler oder dramatischer Moment'
            })
          }
          
          if (this.ACTION_KEYWORDS.comedic.some(keyword => content.includes(keyword))) {
            spotlight.characterMoments.push({
              type: 'comedic',
              turn: index,
              description: 'Humorvoller oder unterhaltsamer Moment'
            })
          }
        }
      })
    })
  }

  private calculateEngagementTrends(
    history: HistoryEntry[],
    spotlights: Record<string, CharacterSpotlight>,
    windowSize: number
  ): void {
    const halfWindow = Math.floor(windowSize / 2)
    
    Object.values(spotlights).forEach(spotlight => {
      const recentHalf = history.slice(-halfWindow)
      const earlierHalf = history.slice(-windowSize, -halfWindow)
      
      const recentMentions = this.countMentions(recentHalf, spotlight.name)
      const earlierMentions = this.countMentions(earlierHalf, spotlight.name)
      
      const diff = recentMentions - earlierMentions
      
      if (diff > 1) {
        spotlight.engagementTrend = 'increasing'
      } else if (diff < -1) {
        spotlight.engagementTrend = 'decreasing'
      } else {
        spotlight.engagementTrend = 'stable'
      }
    })
  }

  private countMentions(turns: HistoryEntry[], characterName: string): number {
    return turns.reduce((count, turn) => {
      return count + (turn.content.toLowerCase().includes(characterName.toLowerCase()) ? 1 : 0)
    }, 0)
  }

  private calculateBalanceScore(spotlights: Record<string, CharacterSpotlight>): number {
    const activities = Object.values(spotlights).map(s => s.recentActivity)
    if (activities.length === 0) return 1

    const avg = activities.reduce((a, b) => a + b, 0) / activities.length
    const variance = activities.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / activities.length
    
    // Convert variance to balance score (lower variance = better balance)
    return Math.max(0, 1 - (variance / 10))
  }

  private analyzeGroupDynamics(
    history: HistoryEntry[],
    spotlights: Record<string, CharacterSpotlight>
  ): SpotlightAnalysis['groupDynamics'] {
    const characterNames = Object.keys(spotlights)
    const pairings: { char1: string; char2: string; interactions: number }[] = []
    const participationScores = Object.values(spotlights).map(s => s.participationScore)
    
    // Find character pairings
    for (let i = 0; i < characterNames.length; i++) {
      for (let j = i + 1; j < characterNames.length; j++) {
        const char1 = characterNames[i]
        const char2 = characterNames[j]
        
        const interactions = this.countInteractions(history, char1, char2)
        if (interactions > 0) {
          pairings.push({ char1, char2, interactions })
        }
      }
    }

    // Sort pairings by interaction count
    pairings.sort((a, b) => b.interactions - a.interactions)

    // Identify dominant and quiet characters
    const avgParticipation = participationScores.reduce((a, b) => a + b, 0) / participationScores.length
    const dominantCharacters = Object.entries(spotlights)
      .filter(([, spotlight]) => spotlight.participationScore > avgParticipation + 0.2)
      .map(([name]) => name)
    
    const quietCharacters = Object.entries(spotlights)
      .filter(([, spotlight]) => spotlight.participationScore < avgParticipation - 0.2)
      .map(([name]) => name)

    // Calculate teamwork score based on interactions and balance
    const totalInteractions = pairings.reduce((sum, pair) => sum + pair.interactions, 0)
    const teamwork = Math.min((totalInteractions / history.length) + (1 - Math.abs(dominantCharacters.length - quietCharacters.length) / characterNames.length), 1)

    return {
      dominantCharacters,
      quietCharacters,
      pairings,
      teamwork
    }
  }

  private countInteractions(history: HistoryEntry[], char1: string, char2: string): number {
    return history.reduce((count, turn) => {
      const content = turn.content.toLowerCase()
      const hasChar1 = content.includes(char1.toLowerCase())
      const hasChar2 = content.includes(char2.toLowerCase())
      
      return count + (hasChar1 && hasChar2 ? 1 : 0)
    }, 0)
  }

  private generateSpotlightSuggestions(
    spotlights: Record<string, CharacterSpotlight>,
    groupDynamics: SpotlightAnalysis['groupDynamics']
  ): SpotlightAnalysis['recommendations'] {
    const suggestions: SpotlightAnalysis['recommendations'] = []
    
    // Priority 1: Characters who haven't had spotlight in a while
    Object.values(spotlights).forEach(spotlight => {
      if (spotlight.lastSpotlight > 6 && spotlight.recentActivity === 0) {
        suggestions.push({
          character: spotlight.name,
          action: 'Direkte Ansprache oder wichtige Entscheidung',
          priority: 'high',
          reason: `${spotlight.name} war lange nicht im Fokus (${spotlight.lastSpotlight} Züge)`
        })
      }
    })

    // Priority 2: Quiet characters with potential
    groupDynamics.quietCharacters.forEach(char => {
      const spotlight = spotlights[char]
      if (spotlight && spotlight.actionTypes.length > 0) {
        const strength = spotlight.actionTypes[0]
        suggestions.push({
          character: char,
          action: `Gelegenheit für ${this.getActionSuggestion(strength)}`,
          priority: 'medium',
          reason: `${char} ist zurückhaltend, hat aber Stärken in ${strength}`
        })
      }
    })

    // Priority 3: Balance dominant characters
    if (groupDynamics.dominantCharacters.length > 0 && groupDynamics.quietCharacters.length > 0) {
      const dominant = groupDynamics.dominantCharacters[0]
      const quiet = groupDynamics.quietCharacters[0]
      
      suggestions.push({
        character: quiet,
        action: 'Wichtige Rolle in aktueller Situation',
        priority: 'medium',
        reason: `Balance schaffen - ${dominant} dominiert, ${quiet} braucht Spotlight`
      })
    }

    // Priority 4: Encourage new character pairings
    const underusedPairs = this.findUnderusedPairings(spotlights, groupDynamics.pairings)
    underusedPairs.forEach(([char1, char2]) => {
      suggestions.push({
        character: char1,
        action: `Interaktion oder Zusammenarbeit mit ${char2}`,
        priority: 'low',
        reason: `Neue Charakterdynamik zwischen ${char1} und ${char2} entwickeln`
      })
    })

    // Sort by priority and return top suggestions
  const priorityOrder: Record<'high' | 'medium' | 'low', number> = { high: 3, medium: 2, low: 1 }
  suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    
    return suggestions.slice(0, 5)
  }

  private getActionSuggestion(actionType: string): string {
    const suggestions: Record<string, string> = {
      combat: 'Kampfszene oder körperliche Herausforderung',
      social: 'Gespräch oder Verhandlung',
      clever: 'Rätsel oder strategische Aufgabe',
      heroic: 'Gelegenheit für heldenhaftes Handeln',
      comedic: 'Humorvolle oder entspannte Situation',
      dramatic: 'Emotionalen Moment oder wichtige Entscheidung'
    }
    return Object.prototype.hasOwnProperty.call(suggestions, actionType)
      ? suggestions[actionType]
      : 'passende Herausforderung'
  }

  private findUnderusedPairings(
    spotlights: Record<string, CharacterSpotlight>,
    existingPairings: { char1: string; char2: string; interactions: number }[]
  ): [string, string][] {
    const characterNames = Object.keys(spotlights)
    const underused: [string, string][] = []
    
    for (let i = 0; i < characterNames.length; i++) {
      for (let j = i + 1; j < characterNames.length; j++) {
        const char1 = characterNames[i]
        const char2 = characterNames[j]
        
        const existingPair = existingPairings.find(p => 
          (p.char1 === char1 && p.char2 === char2) || 
          (p.char1 === char2 && p.char2 === char1)
        )
        
        if (!existingPair || existingPair.interactions < 2) {
          underused.push([char1, char2])
        }
      }
    }
    
    return underused.slice(0, 3)
  }
}

export const spotlightManager = new SpotlightManager()