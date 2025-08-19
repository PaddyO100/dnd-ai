 import type { GameState } from '../state/gameStore';

export interface SaveMetadata {
  id: string;
  name: string;
  timestamp: number;
  version: string;
  playTime: number; // in seconds
  lastLocation: string;
  partyLevel: number;
  campaignProgress: number;
  thumbnailUrl?: string;
  checksum: string;
  autoSave: boolean;
  slotNumber: number;
}

export interface SavedGame {
  id: string;
  name: string;
  gameState: GameState;
  metadata: SaveMetadata;
  thumbnail?: string; // base64 encoded image
}

export interface SaveSlot {
  id: number;
  name: string;
  isEmpty: boolean;
  save?: SavedGame;
}

class SaveManager {
  private readonly STORAGE_PREFIX = 'dnd-ai-save-';
  private readonly METADATA_KEY = 'dnd-ai-save-metadata';
  private readonly MAX_SAVES = 100;
  private readonly SAVE_SLOTS = 6;
  private readonly VERSION = '1.0.0';

  // Helper method to safely access localStorage (only in browser)
  private getStorageItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  }

  private setStorageItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  }

  private removeStorageItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  // Generate save metadata from game state
  generateMetadata(gameState: GameState, name: string, slotNumber: number, autoSave = false): SaveMetadata {
    const party = gameState.party;
    const avgLevel = party.length > 0 ? Math.round(party.reduce((sum, p) => sum + (p.level || 1), 0) / party.length) : 1;
    
    // Calculate play time based on history timestamps
    let playTime = 0;
    if (gameState.history.length > 0) {
      const firstEntry = gameState.history[0];
      const lastEntry = gameState.history[gameState.history.length - 1];
      if (firstEntry && lastEntry && 'ts' in lastEntry && 'ts' in firstEntry) {
        playTime = Math.round(((lastEntry.ts as number) - (firstEntry.ts as number)) / 1000);
      }
    }

    // Determine current location from last DM message
    let lastLocation = 'Unknown Location';
    const lastDmEntry = [...gameState.history].reverse().find(entry => entry.role === 'dm');
    if (lastDmEntry) {
      // Extract location hints from DM message
      const content = lastDmEntry.content.toLowerCase();
      if (content.includes('taverne')) lastLocation = 'Taverne';
      else if (content.includes('wald')) lastLocation = 'Wald';
      else if (content.includes('stadt')) lastLocation = 'Stadt';
      else if (content.includes('dungeon')) lastLocation = 'Dungeon';
      else if (content.includes('berg')) lastLocation = 'Bergregion';
      else if (gameState.selections?.scenario?.title) {
        lastLocation = gameState.selections.scenario.title.substring(0, 30);
      }
    }

    const gameStateString = JSON.stringify(gameState);
    const checksum = this.generateChecksum(gameStateString);

    return {
      id: `save_${Date.now()}_${slotNumber}`,
      name,
      timestamp: Date.now(),
      version: this.VERSION,
      playTime,
      lastLocation,
      partyLevel: avgLevel,
      campaignProgress: Math.min(100, Math.round((gameState.history.length / 50) * 100)), // Rough progress based on history length
      checksum,
      autoSave,
      slotNumber
    };
  }

  // Generate simple checksum for data integrity
  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Verify save data integrity
  private verifySaveIntegrity(save: SavedGame): boolean {
    try {
      const gameStateString = JSON.stringify(save.gameState);
      const currentChecksum = this.generateChecksum(gameStateString);
      return currentChecksum === save.metadata.checksum;
    } catch {
      return false;
    }
  }

  // Generate thumbnail from game state
  async generateThumbnail(gameState: GameState): Promise<string | undefined> {
    try {
      // Skip thumbnail generation on server side
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return undefined;
      }
      
      // Create a simple canvas-based thumbnail showing party info
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return undefined;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 150);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 200, 150);

      // Title
      ctx.fillStyle = '#f4d03f';
      ctx.font = 'bold 14px serif';
      ctx.textAlign = 'center';
      const title = gameState.selections?.scenario?.title || 'Campaign';
      ctx.fillText(title.substring(0, 20), 100, 25);

      // Party info
      ctx.fillStyle = '#ecf0f1';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      
      const party = gameState.party.slice(0, 3); // Show first 3 characters
      party.forEach((character, i) => {
        const y = 50 + (i * 20);
        ctx.fillText(`${character.name} (Lv.${character.level || 1})`, 10, y);
        
        // HP bar
        const hpPercent = character.hp / (character.maxHp || character.hp);
        ctx.fillStyle = hpPercent > 0.5 ? '#27ae60' : hpPercent > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(10, y + 5, Math.max(1, 50 * hpPercent), 3);
        ctx.fillStyle = '#34495e';
        ctx.fillRect(10 + (50 * hpPercent), y + 5, 50 * (1 - hpPercent), 3);
        ctx.fillStyle = '#ecf0f1';
      });

      // Location
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#bdc3c7';
      const location = gameState.selections?.scenario?.summary?.substring(0, 25) || 'Unknown';
      ctx.fillText(location, 100, 135);

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.warn('Failed to generate thumbnail:', error);
      return undefined;
    }
  }

  // Save game to specific slot
  async saveToSlot(gameState: GameState, slotNumber: number, name?: string, autoSave = false): Promise<SaveMetadata> {
    try {
      const saveName = name || `Save ${slotNumber}`;
      const metadata = this.generateMetadata(gameState, saveName, slotNumber, autoSave);
      const thumbnail = await this.generateThumbnail(gameState);

      const savedGame: SavedGame = {
        id: metadata.id,
        name: saveName,
        gameState,
        metadata,
        thumbnail
      };

      // Save to localStorage (in production, this would be a database)
      const saveKey = `${this.STORAGE_PREFIX}slot_${slotNumber}`;
      this.setStorageItem(saveKey, JSON.stringify(savedGame));

      // Update metadata index
      this.updateMetadataIndex(metadata);

      return metadata;
    } catch (error) {
      throw new Error(`Failed to save game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Load game from specific slot
  async loadFromSlot(slotNumber: number): Promise<SavedGame> {
    try {
      const saveKey = `${this.STORAGE_PREFIX}slot_${slotNumber}`;
      const saveData = this.getStorageItem(saveKey);

      if (!saveData) {
        throw new Error(`No save found in slot ${slotNumber}`);
      }

      const savedGame: SavedGame = JSON.parse(saveData);

      // Verify data integrity
      if (!this.verifySaveIntegrity(savedGame)) {
        throw new Error('Save data is corrupted');
      }

      return savedGame;
    } catch (error) {
      throw new Error(`Failed to load game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all save slots
  getAllSlots(): SaveSlot[] {
    // Skip in SSR environment
    if (typeof window === 'undefined') {
      // Return empty slots for SSR
      return Array.from({ length: this.SAVE_SLOTS }, (_, i) => ({
        id: i + 1,
        name: `Empty Slot ${i + 1}`,
        isEmpty: true
      }));
    }

    const slots: SaveSlot[] = [];

    for (let i = 1; i <= this.SAVE_SLOTS; i++) {
      const saveKey = `${this.STORAGE_PREFIX}slot_${i}`;
      const saveData = this.getStorageItem(saveKey);
      
      if (saveData) {
        try {
          const savedGame: SavedGame = JSON.parse(saveData);
          slots.push({
            id: i,
            name: savedGame.name,
            isEmpty: false,
            save: savedGame
          });
        } catch {
          // Corrupted save
          slots.push({
            id: i,
            name: `Slot ${i} (Corrupted)`,
            isEmpty: true
          });
        }
      } else {
        slots.push({
          id: i,
          name: `Empty Slot ${i}`,
          isEmpty: true
        });
      }
    }

    return slots;
  }

  // Delete save from slot
  async deleteSlot(slotNumber: number): Promise<void> {
    try {
      const saveKey = `${this.STORAGE_PREFIX}slot_${slotNumber}`;
      this.removeStorageItem(saveKey);
      
      // Remove from metadata index
      this.removeFromMetadataIndex(slotNumber);
    } catch (error) {
      throw new Error(`Failed to delete save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Auto-save functionality
  async autoSave(gameState: GameState): Promise<SaveMetadata | null> {
    try {
      // Use slot 0 for auto-saves (special slot)
      const autoSaveKey = `${this.STORAGE_PREFIX}autosave`;
      const metadata = this.generateMetadata(gameState, 'Auto Save', 0, true);
      const thumbnail = await this.generateThumbnail(gameState);

      const savedGame: SavedGame = {
        id: metadata.id,
        name: 'Auto Save',
        gameState,
        metadata,
        thumbnail
      };

      this.setStorageItem(autoSaveKey, JSON.stringify(savedGame));
      
      // Keep only last 5 auto-saves
      this.cleanupAutoSaves();

      return metadata;
    } catch (error) {
      console.error('Auto-save failed:', error);
      return null;
    }
  }

  // Load latest auto-save
  async loadAutoSave(): Promise<SavedGame | null> {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        return null;
      }
      
      const autoSaveKey = `${this.STORAGE_PREFIX}autosave`;
      const saveData = this.getStorageItem(autoSaveKey);

      if (!saveData) return null;

      const savedGame: SavedGame = JSON.parse(saveData);

      if (!this.verifySaveIntegrity(savedGame)) {
        console.warn('Auto-save data is corrupted');
        return null;
      }

      return savedGame;
    } catch (error) {
      console.error('Failed to load auto-save:', error);
      return null;
    }
  }

  // Quick save (to dedicated quick save slot)
  async quickSave(gameState: GameState): Promise<SaveMetadata> {
    return this.saveToSlot(gameState, 999, 'Quick Save'); // Special slot number for quick save
  }

  // Quick load (from dedicated quick save slot)
  async quickLoad(): Promise<SavedGame> {
    return this.loadFromSlot(999);
  }

  // Recovery functions
  async recoverCorruptedSave(slotNumber: number): Promise<SavedGame | null> {
    try {
      // Try to recover from backup or auto-save
      const autoSave = await this.loadAutoSave();
      if (autoSave) {
        // Restore to the corrupted slot
        await this.saveToSlot(autoSave.gameState, slotNumber, autoSave.name);
        return autoSave;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Export save for backup
  exportSave(slotNumber: number): string {
    const saveKey = `${this.STORAGE_PREFIX}slot_${slotNumber}`;
    const saveData = this.getStorageItem(saveKey);
    
    if (!saveData) {
      throw new Error(`No save found in slot ${slotNumber}`);
    }

    return btoa(saveData); // Base64 encode for safe transport
  }

  // Import save from backup
  async importSave(encodedSave: string, targetSlot: number): Promise<SaveMetadata> {
    try {
      const saveData = atob(encodedSave);
      const savedGame: SavedGame = JSON.parse(saveData);

      if (!this.verifySaveIntegrity(savedGame)) {
        throw new Error('Imported save data is corrupted');
      }

      // Update metadata for new slot
      savedGame.metadata.slotNumber = targetSlot;
      savedGame.metadata.id = `save_${Date.now()}_${targetSlot}`;

      const saveKey = `${this.STORAGE_PREFIX}slot_${targetSlot}`;
      this.setStorageItem(saveKey, JSON.stringify(savedGame));

      this.updateMetadataIndex(savedGame.metadata);

      return savedGame.metadata;
    } catch (error) {
      throw new Error(`Failed to import save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods
  private updateMetadataIndex(metadata: SaveMetadata): void {
    try {
      const indexData = this.getStorageItem(this.METADATA_KEY);
      const index: SaveMetadata[] = indexData ? JSON.parse(indexData) : [];
      
      // Remove existing entry for this slot
      const filteredIndex = index.filter(meta => meta.slotNumber !== metadata.slotNumber);
      
      // Add new metadata
      filteredIndex.push(metadata);
      
      // Keep only latest saves (limit to MAX_SAVES)
      const sortedIndex = filteredIndex
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.MAX_SAVES);

      this.setStorageItem(this.METADATA_KEY, JSON.stringify(sortedIndex));
    } catch (error) {
      console.warn('Failed to update metadata index:', error);
    }
  }

  private removeFromMetadataIndex(slotNumber: number): void {
    try {
      const indexData = this.getStorageItem(this.METADATA_KEY);
      if (!indexData) return;

      const index: SaveMetadata[] = JSON.parse(indexData);
      const filteredIndex = index.filter(meta => meta.slotNumber !== slotNumber);

      this.setStorageItem(this.METADATA_KEY, JSON.stringify(filteredIndex));
    } catch (error) {
      console.warn('Failed to remove from metadata index:', error);
    }
  }

  private cleanupAutoSaves(): void {
    // This would remove old auto-saves in a real implementation
    // For now, we just keep the latest one
  }

  // Get save statistics
  getSaveStatistics(): {
    totalSaves: number;
    slotsUsed: number;
    totalPlayTime: number;
    lastSaveTime: number | null;
  } {
    const slots = this.getAllSlots();
    const usedSlots = slots.filter(slot => !slot.isEmpty);
    
    const totalPlayTime = usedSlots.reduce((total, slot) => {
      return total + (slot.save?.metadata.playTime || 0);
    }, 0);

    const lastSaveTime = Math.max(...usedSlots.map(slot => slot.save?.metadata.timestamp || 0));

    return {
      totalSaves: usedSlots.length,
      slotsUsed: usedSlots.length,
      totalPlayTime,
      lastSaveTime: lastSaveTime > 0 ? lastSaveTime : null
    };
  }

  // Get all saves as metadata list for MainMenu
  async getAllSaves(): Promise<SaveMetadata[]> {
    const slots = this.getAllSlots();
    const saves: SaveMetadata[] = [];
    
    for (const slot of slots) {
      if (!slot.isEmpty && slot.save) {
        saves.push({
          ...slot.save.metadata,
          id: `save_slot_${slot.id}` // Add consistent ID format for MainMenu
        });
      }
    }
    
    // Sort by timestamp (newest first)
    return saves.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Delete a save by slot number
  async deleteSave(slotNumber: number): Promise<void> {
    try {
      const saveKey = `${this.STORAGE_PREFIX}slot_${slotNumber}`;
      
      // Check if save exists
      const saveData = this.getStorageItem(saveKey);
      if (!saveData) {
        throw new Error(`No save found in slot ${slotNumber}`);
      }
      
      // Remove from storage
      this.removeStorageItem(saveKey);
      
      // Remove from metadata index
      this.removeFromMetadataIndex(slotNumber);
      
    } catch (error) {
      throw new Error(`Failed to delete save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const saveManager = new SaveManager();