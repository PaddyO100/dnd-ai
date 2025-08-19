'use client';

import { useEffect, useCallback } from 'react';
import { useTutorialStore, useActiveTutorial } from '@/lib/tutorial/tutorialState';
import { 
  allTutorials, 
  getTutorialByTrigger, 
  shouldShowTutorial,
  type TutorialTrigger 
} from '@/lib/tutorial/tutorialSteps';
import { useGameStore } from '@/lib/state/gameStore';

interface TutorialManagerProps {
  children: React.ReactNode;
}

/**
 * TutorialManager handles the logic for when to show tutorials
 * It listens to game state changes and triggers appropriate tutorials
 */
export default function TutorialManager({ children }: TutorialManagerProps) {
  const gameState = useGameStore();
  const { 
    settings, 
    completedTutorials, 
    queueTutorial, 
    triggerEvent, 
    hasTriggered,
    startTutorial 
  } = useTutorialStore();
  
  const activeTutorial = useActiveTutorial();

  // Trigger tutorial based on event
  const handleTrigger = useCallback((trigger: TutorialTrigger) => {
    if (!settings.enabled) return;
    
    // Don't trigger the same event multiple times
    if (hasTriggered(trigger)) return;
    
    // Mark event as triggered
    triggerEvent(trigger);
    
    // Find tutorials for this trigger
    const tutorials = getTutorialByTrigger(trigger);
    
    tutorials.forEach(tutorial => {
      if (shouldShowTutorial(tutorial, completedTutorials)) {
        if (activeTutorial) {
          queueTutorial(tutorial);
        } else {
          startTutorial(tutorial);
        }
      }
    });
  }, [settings.enabled, hasTriggered, triggerEvent, completedTutorials, activeTutorial, queueTutorial, startTutorial]);

  // Monitor game state changes for tutorial triggers
  useEffect(() => {
    // Game start trigger - when stepping from onboarding to inGame
    if (gameState.step === 'inGame' && gameState.party.length > 0) {
      handleTrigger('game_start');
    }
  }, [gameState.step, gameState.party.length, handleTrigger]);

  // Monitor history for contextual triggers
  useEffect(() => {
    const last = gameState.history[gameState.history.length - 1];
    if (!last || last.role !== 'player') return;
    const content = last.content.toLowerCase();
    
    // Combat triggers
    const combatKeywords = ['angriff', 'attacke', 'kämpf', 'schlag', 'stich', 'schwert', 'waffe', 'treffe', 'greife an', 'angreifen'];
    if (combatKeywords.some(keyword => content.includes(keyword))) {
      handleTrigger('first_combat');
    }
    
    // Spell triggers  
    const spellKeywords = ['zauber', 'spell', 'magie', 'feuerball', 'heilung', 'wirke', 'zaubere', 'beschwöre'];
    if (spellKeywords.some(keyword => content.includes(keyword))) {
      handleTrigger('first_spell');
    }
    
    // Dice roll triggers
    const diceKeywords = ['würfel', 'wurf', 'w20', 'w6', 'w8', 'w10', 'w12', 'roll', 'würfle', 'probe'];
    if (diceKeywords.some(keyword => content.includes(keyword))) {
      handleTrigger('first_dice_roll');
    }
    
    // Inventory triggers
    const inventoryKeywords = ['inventar', 'gegenstand', 'item', 'nehme', 'verwende', 'trinke', 'equipment', 'rüstung'];
    if (inventoryKeywords.some(keyword => content.includes(keyword))) {
      handleTrigger('first_inventory_use');
    }
    
    // Check for errors in DM responses
  const maybeDm = gameState.history[gameState.history.length - 1];
  if (maybeDm && maybeDm.role === 'dm' && content.includes('fehler')) {
      handleTrigger('first_error_encounter');
    }
  }, [gameState.history, handleTrigger]);

  // Monitor for export/import actions
  useEffect(() => {
    const handleExportImportEvents = () => {
      handleTrigger('first_export_import');
    };

    // Listen for export/import button clicks
    const exportButtons = document.querySelectorAll('button:contains("Exportieren"), label:contains("Importieren")');
    exportButtons.forEach(button => {
      button.addEventListener('click', handleExportImportEvents);
    });

    return () => {
      exportButtons.forEach(button => {
        button.removeEventListener('click', handleExportImportEvents);
      });
    };
  }, [handleTrigger]);

  // Monitor character selection
  useEffect(() => {
    if (gameState.selectedPlayerId) {
      handleTrigger('first_character_selection');
    }
  }, [gameState.selectedPlayerId, handleTrigger]);

  // Monitor quest completion
  useEffect(() => {
    const completedQuests = gameState.quests.filter(q => q.status === 'completed');
    if (completedQuests.length > 0) {
      handleTrigger('first_quest_completion');
    }
  }, [gameState.quests, handleTrigger]);

  // Monitor for level ups
  useEffect(() => {
    const hasLevelledUp = gameState.party.some(p => p.level && p.level > 1);
    if (hasLevelledUp) {
      handleTrigger('first_level_up');
    }
  }, [gameState.party, handleTrigger]);

  // Create global trigger function for manual triggers
  useEffect(() => {
    // Add global function to window for manual triggering
  (window as unknown as Record<string, unknown>).triggerTutorial = (tutorialId: string) => {
      const tutorial = allTutorials.find(t => t.id === tutorialId);
      if (tutorial && shouldShowTutorial(tutorial, completedTutorials)) {
        if (activeTutorial) {
          queueTutorial(tutorial);
        } else {
          startTutorial(tutorial);
        }
      }
    };

    // Add trigger event function
  (window as unknown as Record<string, unknown>).triggerTutorialEvent = handleTrigger;

    return () => {
  delete (window as unknown as Record<string, unknown>).triggerTutorial;
  delete (window as unknown as Record<string, unknown>).triggerTutorialEvent;
    };
  }, [handleTrigger, completedTutorials, activeTutorial, queueTutorial, startTutorial]);

  // Auto-start intro tutorial for new users
  useEffect(() => {
    if (settings.enabled && settings.showOnboarding && gameState.step === 'inGame') {
      const introTutorial = allTutorials.find(t => t.id === 'game_intro');
      if (introTutorial && shouldShowTutorial(introTutorial, completedTutorials)) {
        // Small delay to let the page load and render
        const timer = setTimeout(() => {
          if (!activeTutorial) {
            startTutorial(introTutorial);
          }
        }, 3000); // Increased delay for better loading
        
        return () => clearTimeout(timer);
      }
    }
  }, [settings.enabled, settings.showOnboarding, completedTutorials, activeTutorial, startTutorial, gameState.step]);

  // Progressive tutorial suggestions
  useEffect(() => {
    // After completing 3 basic tutorials, suggest advanced features
    const basicTutorials = completedTutorials.filter(id => {
      const tutorial = allTutorials.find(t => t.id === id);
      return tutorial && tutorial.category === 'basics';
    });
    
    if (basicTutorials.length >= 3 && !hasTriggered('advanced_features')) {
      const timer = setTimeout(() => {
        handleTrigger('advanced_features');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [completedTutorials, hasTriggered, handleTrigger]);

  return (
    <>
      {children}
      {/* Tutorial trigger buttons for testing/accessibility */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-[10000] space-y-2">
          <details className="bg-white border rounded-lg shadow-lg p-2">
            <summary className="text-xs cursor-pointer">Tutorial Debug</summary>
            <div className="mt-2 space-y-1">
              <button 
                onClick={() => handleTrigger('game_start')}
                className="block text-xs px-2 py-1 bg-blue-100 rounded hover:bg-blue-200"
              >
                Game Start
              </button>
              <button 
                onClick={() => handleTrigger('first_combat')}
                className="block text-xs px-2 py-1 bg-red-100 rounded hover:bg-red-200"
              >
                First Combat
              </button>
              <button 
                onClick={() => handleTrigger('advanced_features')}
                className="block text-xs px-2 py-1 bg-purple-100 rounded hover:bg-purple-200"
              >
                Advanced
              </button>
            </div>
          </details>
        </div>
      )}
    </>
  );
}

// Custom hook for triggering tutorials from components
export function useTutorialTrigger() {
  const { settings, hasTriggered, triggerEvent, queueTutorial, startTutorial, completedTutorials } = useTutorialStore();
  const activeTutorial = useActiveTutorial();

  return useCallback((trigger: TutorialTrigger) => {
    if (!settings.enabled) return;
    if (hasTriggered(trigger)) return;
    
    triggerEvent(trigger);
    
    const tutorials = getTutorialByTrigger(trigger);
    tutorials.forEach(tutorial => {
      if (shouldShowTutorial(tutorial, completedTutorials)) {
        if (activeTutorial) {
          queueTutorial(tutorial);
        } else {
          startTutorial(tutorial);
        }
      }
    });
  }, [settings.enabled, hasTriggered, triggerEvent, activeTutorial, queueTutorial, startTutorial, completedTutorials]);
}

// Hook for manual tutorial starting
export function useManualTutorial() {
  const { startTutorial, queueTutorial } = useTutorialStore();
  const activeTutorial = useActiveTutorial();

  return useCallback((tutorialId: string) => {
    const tutorial = allTutorials.find(t => t.id === tutorialId);
    if (tutorial) {
      // Allow manual restart even if completed
      if (activeTutorial) {
        queueTutorial(tutorial);
      } else {
        startTutorial(tutorial);
      }
      return true;
    }
    return false;
  }, [activeTutorial, queueTutorial, startTutorial]);
}

// Hook for getting tutorial recommendations
export function useTutorialRecommendations() {
  const { completedTutorials } = useTutorialStore();
  
  return useCallback(() => {
    const available = allTutorials
      .filter(t => shouldShowTutorial(t, completedTutorials))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3); // Top 3 recommendations
    
    return available;
  }, [completedTutorials]);
}