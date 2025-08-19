import type { GameState } from '../state/gameStore';

export interface SaveMetadataStats {
  totalSaves: number;
  averagePlayTime: number;
  mostPlayedCharacter: string | null;
  favoriteLocation: string | null;
  completionRate: number;
}

// Summary type used for generating aggregate stats across saves
export type SaveSummary = {
  metadata?: {
    playTime?: number;
    primaryCharacter?: string;
    lastLocation?: string;
    campaignProgress?: number;
  };
};

export interface SaveValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canRecover: boolean;
}

export class SaveMetadataManager {
  private readonly METADATA_VERSION = '1.1.0';

  /**
   * Extract rich metadata from game state
   */
  extractMetadata(gameState: GameState): Record<string, unknown> {
    const metadata: Record<string, unknown> = {
      version: this.METADATA_VERSION,
      extractedAt: Date.now(),
    };

    // Party information
    if (gameState.party?.length > 0) {
      metadata.party = {
        size: gameState.party.length,
        levels: gameState.party.map(p => p.level || 1),
        classes: gameState.party.map(p => p.cls),
        totalExperience: gameState.party.reduce((sum, p) => sum + (p.experience || 0), 0),
        averageLevel: gameState.party.reduce((sum, p) => sum + (p.level || 1), 0) / gameState.party.length,
        healthStatus: gameState.party.map(p => ({
          name: p.name,
          hpPercent: p.hp / (p.maxHp || p.hp || 1)
        }))
      };
      
      // Find most active character (by experience or level)
      const mostActive = gameState.party.reduce((prev, current) => 
        (current.experience || 0) > (prev.experience || 0) ? current : prev
      );
      metadata.primaryCharacter = mostActive.name;
    }

    // Campaign progress analysis
    if (gameState.history?.length > 0) {
      metadata.campaign = {
        totalMessages: gameState.history.length,
        dmMessages: gameState.history.filter(h => h.role === 'dm').length,
        playerMessages: gameState.history.filter(h => h.role === 'player').length,
        avgMessageLength: gameState.history.reduce((sum, h) => sum + h.content.length, 0) / gameState.history.length,
        
        // Extract story beats
        storyBeats: this.extractStoryBeats(gameState.history),
        
        // Location tracking
        locations: this.extractLocations(gameState.history),
        
        // Combat encounters
        combatEncounters: this.countCombatEncounters(gameState.history)
      };

      // Play session analysis
      metadata.playSession = this.analyzePlaySession(gameState.history);
    }

    // Quest progress
    if (gameState.quests?.length > 0) {
      const completedQuests = gameState.quests.filter(q => q.status === 'completed').length;
      metadata.questProgress = {
        total: gameState.quests.length,
        completed: completedQuests,
        active: gameState.quests.length - completedQuests,
        completionRate: (completedQuests / gameState.quests.length) * 100
      };
    }

    // Inventory analysis
    if (gameState.inventory?.length > 0) {
      metadata.inventory = {
        itemCount: gameState.inventory.length,
        items: gameState.inventory.slice(0, 10), // Store first 10 items for preview
        hasValuables: gameState.inventory.some(item => 
          item.toLowerCase().includes('gold') || 
          item.toLowerCase().includes('gem') || 
          item.toLowerCase().includes('treasure')
        )
      };
    }

    // World state
    if (gameState.map) {
      metadata.world = {
        mapGenerated: !!gameState.map.imageUrl,
        seed: gameState.map.seed
      };
    }

    // Settings snapshot
    metadata.settings = {
      difficulty: gameState.settings?.difficulty,
      language: gameState.settings?.language,
      autosaveEnabled: (gameState.settings?.autosaveInterval || 0) > 0
    };

    // Genre and theme
    if (gameState.selections) {
      metadata.theme = {
        genre: gameState.selections.genre,
        frame: gameState.selections.frame,
        conflict: gameState.selections.conflict,
        worldType: gameState.selections.world
      };
    }

    return metadata;
  }

  /**
   * Extract key story moments from chat history
   */
  private extractStoryBeats(history: Array<{ role: string; content: string }>): string[] {
    const storyBeats: string[] = [];
    
    // Look for DM messages that seem important
  history.forEach((entry) => {
      if (entry.role === 'dm' && entry.content.length > 100) {
        // Check for story indicators
        const content = entry.content.toLowerCase();
        if (
          content.includes('suddenly') ||
          content.includes('you see') ||
          content.includes('appears') ||
          content.includes('encounter') ||
          content.includes('discover') ||
          content.includes('boss') ||
          content.includes('treasure')
        ) {
          storyBeats.push(entry.content.substring(0, 100) + '...');
        }
      }
    });

    return storyBeats.slice(0, 5); // Keep top 5 story beats
  }

  /**
   * Extract locations mentioned in the campaign
   */
  private extractLocations(history: Array<{ role: string; content: string }>): string[] {
    const locationKeywords = [
      'taverne', 'tavern', 'inn', 'gasthof',
      'wald', 'forest', 'woods',
      'stadt', 'city', 'town', 'village', 'dorf',
      'dungeon', 'höhle', 'cave',
      'berg', 'mountain', 'hill', 'hügel',
      'fluss', 'river', 'stream',
      'castle', 'schloss', 'burg',
      'temple', 'tempel', 'kirche',
      'tower', 'turm'
    ];

    const locations = new Set<string>();
    
    history.forEach(entry => {
      if (entry.role === 'dm') {
        locationKeywords.forEach(keyword => {
          if (entry.content.toLowerCase().includes(keyword)) {
            // Try to extract the specific location name
            const words = entry.content.split(/\s+/);
            const keywordIndex = words.findIndex(w => 
              w.toLowerCase().includes(keyword.toLowerCase())
            );
            
            if (keywordIndex >= 0) {
              // Take the keyword and potentially the next word
              let locationName = words[keywordIndex];
              if (keywordIndex + 1 < words.length) {
                locationName += ' ' + words[keywordIndex + 1];
              }
              locations.add(locationName);
            }
          }
        });
      }
    });

    return Array.from(locations).slice(0, 10);
  }

  /**
   * Count combat encounters in the history
   */
  private countCombatEncounters(history: Array<{ role: string; content: string }>): number {
    const combatKeywords = [
      'attack', 'angriff', 'combat', 'kampf', 'fight',
      'roll', 'würfel', 'damage', 'schaden', 'hit',
      'initiative', 'monster', 'enemy', 'feind'
    ];

    let combatCount = 0;
    let inCombat = false;
    
    history.forEach(entry => {
      const hasKeyword = combatKeywords.some(keyword => 
        entry.content.toLowerCase().includes(keyword)
      );
      
      if (hasKeyword && !inCombat) {
        combatCount++;
        inCombat = true;
      } else if (!hasKeyword && inCombat) {
        inCombat = false;
      }
    });

    return combatCount;
  }

  /**
   * Analyze play session patterns
   */
  private analyzePlaySession(history: Array<{ role: string; content: string }>): Record<string, unknown> {
    const session: Record<string, unknown> = {
      messageFrequency: 0,
      averageResponseTime: 0,
      interactionStyle: 'unknown',
      pacing: 'moderate'
    };

    if (history.length < 2) return session;

    // Calculate message frequency (if timestamps available)
    // This is a simplified version - in practice you'd use real timestamps
    session.messageFrequency = history.length / Math.max(1, history.length * 0.1);

    // Analyze interaction style based on message patterns
    const playerMessages = history.filter(h => h.role === 'player');
    const avgPlayerMessageLength = playerMessages.reduce((sum, msg) => 
      sum + msg.content.length, 0) / Math.max(1, playerMessages.length);

    if (avgPlayerMessageLength > 100) {
      session.interactionStyle = 'detailed';
    } else if (avgPlayerMessageLength > 50) {
      session.interactionStyle = 'moderate';
    } else {
      session.interactionStyle = 'quick';
    }

    // Determine pacing based on message count
    if (history.length > 50) {
      session.pacing = 'fast';
    } else if (history.length < 20) {
      session.pacing = 'slow';
    }

    return session;
  }

  /**
   * Validate save data integrity
   */
  validateSaveData(gameState: unknown): SaveValidationResult {
    const result: SaveValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      canRecover: true
    };

    // Check required properties
    if (!gameState || typeof gameState !== 'object') {
      result.errors.push('Game state is null or undefined');
      result.isValid = false;
      result.canRecover = false;
      return result;
    }

    const gs = gameState as Partial<GameState>;
    // Check step
    if (!gs.step || !['onboarding', 'campaignSelection', 'inGame'].includes(gs.step)) {
      result.errors.push('Invalid or missing step');
      result.isValid = false;
    }

    // Check party
  if (!Array.isArray(gs.party)) {
      result.errors.push('Party must be an array');
      result.isValid = false;
  } else if (gs.party.length === 0 && gs.step === 'inGame') {
      result.warnings.push('No party members found for in-game state');
    }

    // Validate party members
  gs.party?.forEach((character, index: number) => {
      if (!character.id) {
        result.errors.push(`Character ${index + 1} missing ID`);
        result.isValid = false;
      }
      if (!character.name) {
        result.warnings.push(`Character ${index + 1} missing name`);
      }
      if (typeof character.hp !== 'number' || character.hp < 0) {
        result.warnings.push(`Character ${character.name || index + 1} has invalid HP`);
      }
    });

    // Check history
  if (!Array.isArray(gs.history)) {
      result.errors.push('History must be an array');
      result.isValid = false;
    }

    // Check inventory
  if (!Array.isArray(gs.inventory)) {
      result.errors.push('Inventory must be an array');
      result.isValid = false;
    }

    // Check quests
  if (!Array.isArray(gs.quests)) {
      result.errors.push('Quests must be an array');
      result.isValid = false;
    }

    // Check settings
  if (!gs.settings) {
      result.warnings.push('Settings object missing - will use defaults');
    }

    // Data size check
  const dataSize = JSON.stringify(gs).length;
    if (dataSize > 1024 * 1024) { // 1MB limit
      result.warnings.push('Save file is very large and may cause performance issues');
    }

    return result;
  }

  /**
   * Generate comprehensive save statistics
   */
  generateSaveStats(saves: SaveSummary[]): SaveMetadataStats {
    if (!saves.length) {
      return {
        totalSaves: 0,
        averagePlayTime: 0,
        mostPlayedCharacter: null,
        favoriteLocation: null,
        completionRate: 0
      };
    }

  const totalPlayTime = saves.reduce((sum, save) => sum + (save.metadata?.playTime ?? 0), 0);

    // Find most common character
    const characterCounts = new Map<string, number>();
    saves.forEach(save => {
      const primaryChar = save.metadata?.primaryCharacter ?? null;
      if (primaryChar) {
        characterCounts.set(primaryChar, (characterCounts.get(primaryChar) || 0) + 1);
      }
    });
    
    const mostPlayedCharacter = characterCounts.size > 0 
      ? Array.from(characterCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    // Find most common location
    const locationCounts = new Map<string, number>();
    saves.forEach(save => {
      const location = save.metadata?.lastLocation ?? null;
      if (location && location !== 'Unknown Location') {
        locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
      }
    });
    
    const favoriteLocation = locationCounts.size > 0
      ? Array.from(locationCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    // Calculate average completion rate
    const completionRates = saves
      .map(save => save.metadata?.campaignProgress ?? 0)
      .filter((rate): rate is number => typeof rate === 'number' && rate > 0);
    
    const avgCompletionRate = completionRates.length > 0
      ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
      : 0;

    return {
      totalSaves: saves.length,
      averagePlayTime: totalPlayTime / saves.length,
      mostPlayedCharacter,
      favoriteLocation,
      completionRate: avgCompletionRate
    };
  }

  /**
   * Repair corrupted save data
   */
  repairSaveData(corruptedData: unknown): Partial<GameState> {
    const repaired = { ...(corruptedData as Record<string, unknown>) } as Partial<GameState>;

    // Fix missing required arrays
    if (!Array.isArray(repaired.party)) repaired.party = [];
    if (!Array.isArray(repaired.history)) repaired.history = [];
    if (!Array.isArray(repaired.inventory)) repaired.inventory = [];
    if (!Array.isArray(repaired.quests)) repaired.quests = [];

    // Fix missing selections
    if (!repaired.selections) {
      repaired.selections = { classes: [], startingWeapons: [] };
    }
    if (!Array.isArray(repaired.selections.classes)) {
      repaired.selections.classes = [];
    }
    if (!Array.isArray(repaired.selections.startingWeapons)) {
      repaired.selections.startingWeapons = [];
    }

    // Fix invalid step
  if (!repaired.step || !['onboarding', 'campaignSelection', 'inGame'].includes(repaired.step)) {
      repaired.step = 'onboarding';
    }

    // Fix party member data
  repaired.party = repaired.party.map((character, index: number) => ({
      ...character,
      id: character.id || `char_${index + 1}`,
      name: character.name || `Character ${index + 1}`,
      hp: typeof character.hp === 'number' ? Math.max(0, character.hp) : 20,
      maxHp: typeof character.maxHp === 'number' ? Math.max(1, character.maxHp) : 20,
      level: typeof character.level === 'number' ? Math.max(1, character.level) : 1
    }));

    // Fix settings
    if (!repaired.settings) {
      repaired.settings = {
        language: 'DE',
        autosaveInterval: 5,
        enableSoundEffects: true,
        enableVisualDice: true,
        difficulty: 'normal',
        theme: 'light',
        // image generation removed
        audio: {
          masterVolume: 0.7,
          diceVolume: 0.8,
          ambientVolume: 0.3,
          uiVolume: 0.5
        }
      };
    }

    return repaired;
  }
}

export const saveMetadataManager = new SaveMetadataManager();