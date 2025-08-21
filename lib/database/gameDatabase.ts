// Enhanced Game Database using Dexie.js (IndexedDB)
// Provides stable, structured storage with cache separation

import Dexie, { Table } from 'dexie';
import type { GameState } from '@/lib/state/gameStore';

export interface SaveGame {
  id?: number;
  name: string;
  gameState: GameState;
  createdAt: Date;
  updatedAt: Date;
  isAutoSave: boolean;
  scenarioTitle?: string;
  characterCount?: number;
  playTime?: number; // minutes
  thumbnail?: string; // base64 image or portrait URL
}

export interface SessionCache {
  id?: number;
  sessionId: string;
  gameState: Partial<GameState>;
  lastActivity: Date;
  expiresAt: Date;
}

export interface GameSettings {
  id?: number;
  userId: string;
  settings: Record<string, unknown>;
  updatedAt: Date;
}

class GameDatabase extends Dexie {
  // Tables definition
  saveGames!: Table<SaveGame>;
  sessionCache!: Table<SessionCache>;
  gameSettings!: Table<GameSettings>;

  constructor() {
    super('AethelForgeDB');
    
    // Schema definition with indexes
    this.version(1).stores({
      saveGames: '++id, name, createdAt, updatedAt, isAutoSave, scenarioTitle',
      sessionCache: '++id, sessionId, lastActivity, expiresAt',
      gameSettings: '++id, userId, updatedAt'
    });

    // Hooks for automatic timestamps
    this.saveGames.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.saveGames.hook('updating', (modifications) => {
      (modifications as SaveGame).updatedAt = new Date();
    });

    this.sessionCache.hook('creating', (_primKey, obj) => {
      obj.lastActivity = new Date();
      // Cache expires after 1 hour of inactivity
      obj.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    });
  }

  // Save Game Management
  async saveGame(name: string, gameState: GameState, isAutoSave: boolean = false): Promise<number> {
    const saveData: SaveGame = {
      name,
      gameState,
      isAutoSave,
      scenarioTitle: gameState.selections?.scenario?.title,
      characterCount: gameState.party?.length || 0,
      playTime: this.calculatePlayTime(gameState),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // For autosave, replace existing autosave instead of creating new
    if (isAutoSave) {
      const existingAutoSave = await this.saveGames
        .where('isAutoSave')
        .equals(1)
        .first();

      if (existingAutoSave) {
        await this.saveGames.update(existingAutoSave.id!, {
          gameState,
          updatedAt: new Date(),
          playTime: saveData.playTime,
          characterCount: saveData.characterCount
        });
        return existingAutoSave.id!;
      }
    }

    return await this.saveGames.add(saveData);
  }

  async loadGame(id: number): Promise<SaveGame | undefined> {
    return await this.saveGames.get(id);
  }

  async getAllSaves(): Promise<SaveGame[]> {
    return await this.saveGames
      .orderBy('updatedAt')
      .reverse()
      .toArray();
  }

  async getManualSaves(): Promise<SaveGame[]> {
    return await this.saveGames
      .where('isAutoSave')
      .equals(0)
      .reverse()
      .sortBy('updatedAt');
  }

  async getAutoSave(): Promise<SaveGame | undefined> {
    return await this.saveGames
      .where('isAutoSave')
      .equals(1)
      .first();
  }

  async deleteSave(id: number): Promise<void> {
    await this.saveGames.delete(id);
  }

  // Session Cache Management (temporary, clears on browser close)
  async cacheGameState(sessionId: string, gameState: Partial<GameState>): Promise<void> {
    // Remove old cache entries for this session
    await this.sessionCache.where('sessionId').equals(sessionId).delete();
    
    await this.sessionCache.add({
      sessionId,
      gameState,
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });
  }

  async getCachedGameState(sessionId: string): Promise<Partial<GameState> | null> {
    const cached = await this.sessionCache
      .where('sessionId')
      .equals(sessionId)
      .first();

    if (!cached || cached.expiresAt < new Date()) {
      if (cached) {
        await this.sessionCache.delete(cached.id!);
      }
      return null;
    }

    // Update last activity
    await this.sessionCache.update(cached.id!, {
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });

    return cached.gameState;
  }

  async clearAllCache(): Promise<void> {
    await this.sessionCache.clear();
  }

  async clearExpiredCache(): Promise<void> {
    const now = new Date();
    await this.sessionCache.where('expiresAt').below(now).delete();
  }

  // Settings Management
  async saveSettings(userId: string, settings: Record<string, unknown>): Promise<void> {
    const existing = await this.gameSettings.where('userId').equals(userId).first();
    
    if (existing) {
      await this.gameSettings.update(existing.id!, {
        settings,
        updatedAt: new Date()
      });
    } else {
      await this.gameSettings.add({
        userId,
        settings,
        updatedAt: new Date()
      });
    }
  }

  async loadSettings(userId: string): Promise<Record<string, unknown> | null> {
    const stored = await this.gameSettings.where('userId').equals(userId).first();
    return stored?.settings || null;
  }

  // Utility functions
  private calculatePlayTime(gameState: GameState): number {
    if (!gameState.history || gameState.history.length < 2) {
      return 0;
    }
    const firstEntry = gameState.history[0];
    const lastEntry = gameState.history[gameState.history.length - 1];
    const startTime = firstEntry.timestamp;
    const endTime = lastEntry.timestamp;
    const durationInMs = endTime - startTime;
    return Math.round(durationInMs / (1000 * 60)); // in minutes
  }

  async getDatabaseStats(): Promise<{
    saveCount: number;
    cacheCount: number;
    totalSize: string;
    lastAutoSave?: Date;
  }> {
    const saveCount = await this.saveGames.count();
    const cacheCount = await this.sessionCache.count();
    const autoSave = await this.getAutoSave();

    return {
      saveCount,
      cacheCount,
      totalSize: 'Unknown', // IndexedDB size is not easily accessible
      lastAutoSave: autoSave?.updatedAt
    };
  }

  // Clean up old data
  async cleanup(): Promise<void> {
    await this.clearExpiredCache();
    
    // Keep only last 20 manual saves (configurable)
    const saves = await this.getManualSaves();
    if (saves.length > 20) {
      const oldSaves = saves.slice(20);
      for (const save of oldSaves) {
        if (save.id) {
          await this.deleteSave(save.id);
        }
      }
    }
  }
}

// Export singleton instance
export const gameDB = new GameDatabase();

// Initialize database and cleanup on app start
if (typeof window !== 'undefined') {
  gameDB.open().then(() => {
    // Clean up expired cache on startup
    gameDB.clearExpiredCache();
    
    // Clean up old saves periodically
    setInterval(() => {
      gameDB.cleanup();
    }, 30 * 60 * 1000); // Every 30 minutes
  });

  // Clear cache when browser/tab closes
  window.addEventListener('beforeunload', () => {
    // Use synchronous operations for cleanup on close
    gameDB.clearAllCache();
  });

  // Clean up cache on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      gameDB.clearAllCache();
    }
  });
}
