import { useEffect, useRef, useCallback } from 'react';
import { useGameStore, type GameState, type HistoryEntry } from '../state/gameStore';

export class AutoSaveManager {
  private intervalId: NodeJS.Timeout | null = null;
  private lastSaveTime = 0;
  private isEnabled = false;
  private intervalMinutes = 5;

  constructor() {
    this.setupAutoSave();
  }

  /**
   * Initialize auto-save with current settings
   */
  setupAutoSave() {
    // Clear existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Only set up if auto-save is enabled
  if (this.isEnabled && this.intervalMinutes > 0) {
      this.intervalId = setInterval(() => {
        this.checkAndTriggerAutoSave();
      }, 30000); // Check every 30 seconds for more responsive auto-saving
      
      console.log(`Auto-save enabled: every ${this.intervalMinutes} minutes`);
    }
  }

  /**
   * Update auto-save settings
   */
  updateSettings(enabled: boolean, intervalMinutes: number) {
    this.isEnabled = enabled;
    this.intervalMinutes = intervalMinutes;
    this.setupAutoSave();
  }

  /**
   * Check if auto-save should trigger and execute if needed
   */
  private async checkAndTriggerAutoSave() {
    const now = Date.now();
    const timeSinceLastSave = now - this.lastSaveTime;
    const intervalMs = this.intervalMinutes * 60 * 1000;

    // Check if enough time has passed since last auto-save
    if (timeSinceLastSave >= intervalMs) {
      try {
        // Get current game state from store
        const gameState = useGameStore.getState();
        
        // Only auto-save if in game and has meaningful progress
        if (gameState.step === 'inGame' && this.shouldAutoSave(gameState)) {
          await this.performAutoSave(gameState);
          this.lastSaveTime = now;
          
          // Show notification (non-intrusive)
          this.showAutoSaveNotification();
        }
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }
  }

  /**
   * Determine if the game state warrants an auto-save
   */
  private shouldAutoSave(gameState: GameState): boolean {
    // Don't auto-save if no meaningful progress
    if (!gameState.party?.length || gameState.history.length < 3) {
      return false;
    }

    // Check if there have been recent changes
    const recentMessages = gameState.history.slice(-5) as (HistoryEntry & { timestamp?: number })[];
    const hasRecentActivity = recentMessages.some((msg) => {
      const ts = typeof msg.timestamp === 'number' ? msg.timestamp : undefined;
      return ts !== undefined && (Date.now() - ts) < 5 * 60 * 1000; // 5 minutes
    });

    return hasRecentActivity;
  }

  /**
   * Execute the auto-save operation
   */
  private async performAutoSave(gameState: GameState): Promise<void> {
    try {
      const response = await fetch('/api/saves/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState })
      });

      if (!response.ok) {
        throw new Error(`Auto-save failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Auto-save completed:', result.metadata);
    } catch (error) {
      console.error('Auto-save error:', error);
      throw error;
    }
  }

  /**
   * Show a subtle notification that auto-save occurred
   */
  private showAutoSaveNotification() {
    // Create a temporary toast notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(34, 197, 94, 0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 9999;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(4px);
      animation: slideInFromRight 0.3s ease-out;
    `;
    
    notification.textContent = '✓ Auto-saved';
    
    // Add animation keyframes if not already present
    if (!document.querySelector('#autosave-animations')) {
      const style = document.createElement('style');
      style.id = 'autosave-animations';
      style.textContent = `
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutToRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutToRight 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Force an immediate auto-save
   */
  async forceAutoSave(): Promise<boolean> {
    try {
      const gameState = useGameStore.getState();
      if (gameState.step === 'inGame') {
        await this.performAutoSave(gameState);
        this.lastSaveTime = Date.now();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Forced auto-save failed:', error);
      return false;
    }
  }

  /**
   * Get auto-save status
   */
  getStatus(): {
    enabled: boolean;
    interval: number;
    lastSaveTime: number;
    nextSaveTime: number;
  } {
    const nextSaveTime = this.lastSaveTime + (this.intervalMinutes * 60 * 1000);
    return {
      enabled: this.isEnabled,
      interval: this.intervalMinutes,
      lastSaveTime: this.lastSaveTime,
      nextSaveTime: this.isEnabled ? nextSaveTime : 0
    };
  }

  /**
   * Clean up auto-save manager
   */
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Singleton instance
export const autoSaveManager = new AutoSaveManager();

/**
 * React hook for auto-save functionality
 */
export function useAutoSave() {
  const settings = useGameStore(state => state.settings);
  const managerRef = useRef(autoSaveManager);

  // Update auto-save settings when they change
  useEffect(() => {
    const enabled = settings.autosaveInterval > 0;
    managerRef.current.updateSettings(enabled, settings.autosaveInterval);
  }, [settings.autosaveInterval]);

  // Set up auto-save on component mount
  useEffect(() => {
    const manager = managerRef.current;
    
    return () => {
      // Cleanup on unmount
      manager.destroy();
    };
  }, []);

  // Provide manual controls
  const forceAutoSave = useCallback(async () => {
    return await managerRef.current.forceAutoSave();
  }, []);

  const getStatus = useCallback(() => {
    return managerRef.current.getStatus();
  }, []);

  return {
    forceAutoSave,
    getStatus,
    isAutoSaveEnabled: settings.autosaveInterval > 0,
    autoSaveInterval: settings.autosaveInterval
  };
}

/**
 * Initialize auto-save on app startup
 */
export function initializeAutoSave() {
  const gs = useGameStore.getState();
  const enabled = gs.settings.autosaveInterval > 0;
  
  autoSaveManager.updateSettings(enabled, gs.settings.autosaveInterval);
  
  // Subscribe to settings changes
  let lastInterval = gs.settings.autosaveInterval;
  useGameStore.subscribe((state) => {
    if (state.settings.autosaveInterval !== lastInterval) {
      lastInterval = state.settings.autosaveInterval;
      const en = state.settings.autosaveInterval > 0;
      autoSaveManager.updateSettings(en, state.settings.autosaveInterval);
    }
  });
}