import Dexie, { type Table } from 'dexie';
import type { GameState } from '../state/gameStore';
import type { Scenario } from '../../schemas/scenario';
import type { Character, InventoryItem } from '../../schemas/character';

export interface SavedGame {
  id?: number;
  name: string;
  timestamp: Date;
  gameState: string; // JSON stringified state
  version: string;
  lastLocation: string;
  partyLevel: number;
  campaignProgress: number;
  thumbnailUrl?: string;
  autoSave: boolean;
  slotNumber?: number;
}

export interface Campaign {
  id?: number;
  title: string;
  description: string;
  scenarios: Scenario[];
  customContent: boolean;
  createdAt: Date;
}

export interface CharacterTemplate {
  id?: number;
  name: string;
  classId: string;
  raceId: string;
  equipment: InventoryItem[];
  stats: Record<string, number>;
  createdAt: Date;
}

export interface GameSettings {
  id?: number;
  language: string;
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  difficulty: string;
  updatedAt: Date;
}

class AethelsForgeDB extends Dexie {
  games!: Table<SavedGame>;
  campaigns!: Table<Campaign>;
  characters!: Table<CharacterTemplate>;
  settings!: Table<GameSettings>;
  
  constructor() {
    super('AethelsForgeDB');
    
    // Schema Version 1
    this.version(1).stores({
      games: '++id, name, timestamp, autoSave, slotNumber',
      campaigns: '++id, title, customContent, createdAt',
      characters: '++id, name, classId, raceId, createdAt',
      settings: '++id, language, theme, updatedAt'
    });
    
    // Enable debugging in development
    if (process.env.NODE_ENV === 'development') {
      this.on('close', () => {
        console.log('Dexie database closed');
      });
    }
  }
}

export const db = new AethelsForgeDB();

// Database utility functions
export class DatabaseManager {
  
  // Save game methods
  async saveGame(name: string, gameState: GameState, autoSave: boolean = false): Promise<number> {
    try {
      const gameStateString = JSON.stringify(gameState);
      
      const saveData: SavedGame = {
        name,
        timestamp: new Date(),
        gameState: gameStateString,
        version: '1.0.0',
        lastLocation: this.extractLocation(gameState),
        partyLevel: this.calculatePartyLevel(gameState.party || []),
        campaignProgress: this.calculateProgress(gameState),
        autoSave,
        slotNumber: autoSave ? 0 : undefined
      };
      
      const id = await db.games.add(saveData);
      console.log(`✅ Game saved to IndexedDB with ID: ${id}`);
      return id;
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
      throw new Error(`Failed to save game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async loadGame(id: number): Promise<GameState> {
    try {
      const saveData = await db.games.get(id);
      if (!saveData) {
        throw new Error(`Save game with ID ${id} not found`);
      }
      
      const gameState = JSON.parse(saveData.gameState) as GameState;
      console.log(`✅ Game loaded from IndexedDB: ${saveData.name}`);
      return gameState;
    } catch (error) {
      console.error('Error loading from IndexedDB:', error);
      throw new Error(`Failed to load game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getAllSaves(): Promise<SavedGame[]> {
    try {
      return await db.games
        .orderBy('timestamp')
        .reverse()
        .toArray();
    } catch (error) {
      console.error('Error getting all saves:', error);
      return [];
    }
  }
  
  async deleteSave(id: number): Promise<void> {
    try {
      await db.games.delete(id);
      console.log(`✅ Save game ${id} deleted from IndexedDB`);
    } catch (error) {
      console.error('Error deleting save:', error);
      throw new Error(`Failed to delete save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Campaign methods
  async saveCampaign(campaign: Omit<Campaign, 'id' | 'createdAt'>): Promise<number> {
    try {
      const campaignData: Campaign = {
        ...campaign,
        createdAt: new Date()
      };
      
      const id = await db.campaigns.add(campaignData);
      console.log(`✅ Campaign saved with ID: ${id}`);
      return id;
    } catch (error) {
      console.error('Error saving campaign:', error);
      throw new Error(`Failed to save campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getAllCampaigns(): Promise<Campaign[]> {
    return await db.campaigns.orderBy('createdAt').reverse().toArray();
  }
  
  // Character template methods  
  async saveCharacterTemplate(character: Omit<CharacterTemplate, 'id' | 'createdAt'>): Promise<number> {
    try {
      const characterData: CharacterTemplate = {
        ...character,
        createdAt: new Date()
      };
      
      const id = await db.characters.add(characterData);
      console.log(`✅ Character template saved with ID: ${id}`);
      return id;
    } catch (error) {
      console.error('Error saving character template:', error);
      throw new Error(`Failed to save character: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getAllCharacterTemplates(): Promise<CharacterTemplate[]> {
    return await db.characters.orderBy('createdAt').reverse().toArray();
  }
  
  // Settings methods
  async saveSettings(settings: Omit<GameSettings, 'id' | 'updatedAt'>): Promise<void> {
    try {
      const settingsData: GameSettings = {
        ...settings,
        updatedAt: new Date()
      };
      
      // Always update the first settings record, or create if none exists
      const existingSettings = await db.settings.orderBy('id').first();
      if (existingSettings) {
        await db.settings.update(existingSettings.id!, settingsData);
      } else {
        await db.settings.add(settingsData);
      }
      
      console.log('✅ Settings saved to IndexedDB');
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getSettings(): Promise<GameSettings | null> {
    return await db.settings.orderBy('updatedAt').reverse().first() || null;
  }
  
  // Utility methods
  private extractLocation(gameState: GameState): string {
    // Extract location from the last DM message
    const lastDmEntry = [...(gameState.history || [])].reverse().find(entry => entry.role === 'dm');
    if (lastDmEntry) {
      const content = lastDmEntry.content.toLowerCase();
      if (content.includes('taverne')) return 'Taverne';
      if (content.includes('wald')) return 'Wald';
      if (content.includes('stadt')) return 'Stadt';
      if (content.includes('dungeon')) return 'Dungeon';
      if (content.includes('berg')) return 'Bergregion';
    }
    
    return gameState.selections?.scenario?.title?.substring(0, 30) || 'Unbekannt';
  }
  
  private calculatePartyLevel(party: Character[]): number {
    if (!party.length) return 1;
    const totalLevel = party.reduce((sum, member) => sum + (member.level || 1), 0);
    return Math.round(totalLevel / party.length);
  }
  
  private calculateProgress(gameState: GameState): number {
    // Simple progress calculation based on history length and quests
    const historyProgress = Math.min((gameState.history?.length || 0) / 100, 0.5);
    const completedQuests = (gameState.quests || []).filter(q => q.status === 'completed').length;
    const questProgress = Math.min(completedQuests / 10, 0.5);
    
    return Math.round((historyProgress + questProgress) * 100);
  }
  
  // Database maintenance
  async clearAllData(): Promise<void> {
    await db.transaction('rw', [db.games, db.campaigns, db.characters, db.settings], async () => {
      await db.games.clear();
      await db.campaigns.clear();  
      await db.characters.clear();
      await db.settings.clear();
    });
    
    console.log('✅ All database data cleared');
  }
  
  async exportBackup(): Promise<string> {
    const data = {
      games: await db.games.toArray(),
      campaigns: await db.campaigns.toArray(),
      characters: await db.characters.toArray(),
      settings: await db.settings.toArray(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    return JSON.stringify(data, null, 2);
  }
  
  async importBackup(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      await db.transaction('rw', [db.games, db.campaigns, db.characters, db.settings], async () => {
        // Clear existing data
        await db.games.clear();
        await db.campaigns.clear();
        await db.characters.clear();
        await db.settings.clear();
        
        // Import new data
        if (data.games) await db.games.bulkAdd(data.games);
        if (data.campaigns) await db.campaigns.bulkAdd(data.campaigns);
        if (data.characters) await db.characters.bulkAdd(data.characters);
        if (data.settings) await db.settings.bulkAdd(data.settings);
      });
      
      console.log('✅ Backup imported successfully');
    } catch (error) {
      console.error('Error importing backup:', error);
      throw new Error(`Failed to import backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const databaseManager = new DatabaseManager();
