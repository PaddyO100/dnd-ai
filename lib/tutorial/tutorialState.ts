// Tutorial state management for progress tracking and settings
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tutorial, TutorialTrigger } from './tutorialSteps';

export interface TutorialProgress {
  tutorialId: string;
  completedSteps: string[];
  isCompleted: boolean;
  completedAt?: number;
  skippedAt?: number;
}

export interface ActiveTutorial {
  tutorial: Tutorial;
  currentStepIndex: number;
  isVisible: boolean;
  isPaused: boolean;
  startedAt: number;
}

export interface TutorialSettings {
  enabled: boolean;
  showOnboarding: boolean;
  autoAdvance: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  soundEnabled: boolean;
  highlightColor: string;
  overlayOpacity: number;
}

export interface TutorialState {
  // Settings
  settings: TutorialSettings;
  
  // Progress tracking
  completedTutorials: string[];
  tutorialProgress: Record<string, TutorialProgress>;
  
  // Active tutorial state
  activeTutorial: ActiveTutorial | null;
  tutorialQueue: Tutorial[];
  
  // Trigger tracking
  triggeredEvents: TutorialTrigger[];
  
  // Actions
  updateSettings: (settings: Partial<TutorialSettings>) => void;
  
  // Tutorial lifecycle
  startTutorial: (tutorial: Tutorial) => void;
  pauseTutorial: () => void;
  resumeTutorial: () => void;
  stopTutorial: (reason?: 'completed' | 'skipped' | 'cancelled') => void;
  
  // Step navigation
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepIndex: number) => void;
  skipStep: () => void;
  
  // Progress management
  markTutorialCompleted: (tutorialId: string) => void;
  markStepCompleted: (tutorialId: string, stepId: string) => void;
  resetTutorialProgress: (tutorialId?: string) => void;
  
  // Queue management
  queueTutorial: (tutorial: Tutorial) => void;
  clearQueue: () => void;
  
  // Event tracking
  triggerEvent: (event: TutorialTrigger) => void;
  hasTriggered: (event: TutorialTrigger) => boolean;
  
  // Utility
  getTutorialProgress: (tutorialId: string) => TutorialProgress | null;
  isStepCompleted: (tutorialId: string, stepId: string) => boolean;
  getCompletionRate: () => number;
  
  // Reset all tutorial data
  reset: () => void;
}

const defaultSettings: TutorialSettings = {
  enabled: true,
  showOnboarding: true,
  autoAdvance: false,
  animationSpeed: 'normal',
  soundEnabled: true,
  highlightColor: '#f59e0b', // amber-500
  overlayOpacity: 0.8
};

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: defaultSettings,
      completedTutorials: [],
      tutorialProgress: {},
      activeTutorial: null,
      tutorialQueue: [],
      triggeredEvents: [],

      // Settings management
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),

      // Tutorial lifecycle
      startTutorial: (tutorial) => {
        const state = get();
        
        // Don't start if tutorials are disabled
        if (!state.settings.enabled) return;
        
        // Don't start if there's already an active tutorial
        if (state.activeTutorial && state.activeTutorial.isVisible) {
          // Queue it instead
          state.queueTutorial(tutorial);
          return;
        }

        // Initialize progress if it doesn't exist
        if (!state.tutorialProgress[tutorial.id]) {
          set((state) => ({
            tutorialProgress: {
              ...state.tutorialProgress,
              [tutorial.id]: {
                tutorialId: tutorial.id,
                completedSteps: [],
                isCompleted: false
              }
            }
          }));
        }

        set({
          activeTutorial: {
            tutorial,
            currentStepIndex: 0,
            isVisible: true,
            isPaused: false,
            startedAt: Date.now()
          }
        });
      },

      pauseTutorial: () =>
        set((state) => ({
          activeTutorial: state.activeTutorial 
            ? { ...state.activeTutorial, isPaused: true }
            : null
        })),

      resumeTutorial: () =>
        set((state) => ({
          activeTutorial: state.activeTutorial 
            ? { ...state.activeTutorial, isPaused: false }
            : null
        })),

      stopTutorial: (reason = 'cancelled') => {
        const state = get();
        const activeTutorial = state.activeTutorial;
        
        if (!activeTutorial) return;

        // Mark as completed or skipped
        if (reason === 'completed') {
          state.markTutorialCompleted(activeTutorial.tutorial.id);
        } else if (reason === 'skipped') {
          set((state) => ({
            tutorialProgress: {
              ...state.tutorialProgress,
              [activeTutorial.tutorial.id]: {
                ...state.tutorialProgress[activeTutorial.tutorial.id],
                skippedAt: Date.now()
              }
            }
          }));
        }

        set({ activeTutorial: null });

        // Start next tutorial in queue
        if (state.tutorialQueue.length > 0) {
          const nextTutorial = state.tutorialQueue[0];
          set((state) => ({
            tutorialQueue: state.tutorialQueue.slice(1)
          }));
          
          // Small delay before starting next tutorial
          setTimeout(() => {
            get().startTutorial(nextTutorial);
          }, 1000);
        }
      },

      // Step navigation
      nextStep: () => {
        const state = get();
        const activeTutorial = state.activeTutorial;
        
        if (!activeTutorial) return;

        const currentStep = activeTutorial.tutorial.steps[activeTutorial.currentStepIndex];
        
        // Mark current step as completed
        if (currentStep) {
          state.markStepCompleted(activeTutorial.tutorial.id, currentStep.id);
        }

        const nextIndex = activeTutorial.currentStepIndex + 1;
        
        if (nextIndex >= activeTutorial.tutorial.steps.length) {
          // Tutorial completed
          state.stopTutorial('completed');
        } else {
          set((state) => ({
            activeTutorial: state.activeTutorial 
              ? { ...state.activeTutorial, currentStepIndex: nextIndex }
              : null
          }));
        }
      },

      previousStep: () =>
        set((state) => ({
          activeTutorial: state.activeTutorial 
            ? { 
                ...state.activeTutorial, 
                currentStepIndex: Math.max(0, state.activeTutorial.currentStepIndex - 1)
              }
            : null
        })),

      goToStep: (stepIndex) =>
        set((state) => ({
          activeTutorial: state.activeTutorial 
            ? { 
                ...state.activeTutorial, 
                currentStepIndex: Math.max(0, Math.min(stepIndex, state.activeTutorial.tutorial.steps.length - 1))
              }
            : null
        })),

      skipStep: () => {
        const state = get();
        const activeTutorial = state.activeTutorial;
        
        if (!activeTutorial) return;
        
        const currentStep = activeTutorial.tutorial.steps[activeTutorial.currentStepIndex];
        
        // Only skip if step is skippable
        if (currentStep && currentStep.skippable !== false) {
          state.nextStep();
        }
      },

      // Progress management
      markTutorialCompleted: (tutorialId) =>
        set((state) => ({
          completedTutorials: [...new Set([...state.completedTutorials, tutorialId])],
          tutorialProgress: {
            ...state.tutorialProgress,
            [tutorialId]: {
              ...state.tutorialProgress[tutorialId],
              isCompleted: true,
              completedAt: Date.now()
            }
          }
        })),

      markStepCompleted: (tutorialId, stepId) =>
        set((state) => {
          const progress = state.tutorialProgress[tutorialId];
          if (!progress) return state;

          return {
            tutorialProgress: {
              ...state.tutorialProgress,
              [tutorialId]: {
                ...progress,
                completedSteps: [...new Set([...progress.completedSteps, stepId])]
              }
            }
          };
        }),

      resetTutorialProgress: (tutorialId) => {
        if (tutorialId) {
          set((state) => ({
            completedTutorials: state.completedTutorials.filter(id => id !== tutorialId),
            tutorialProgress: {
              ...state.tutorialProgress,
              [tutorialId]: {
                tutorialId,
                completedSteps: [],
                isCompleted: false
              }
            }
          }));
        } else {
          set({
            completedTutorials: [],
            tutorialProgress: {},
            activeTutorial: null,
            tutorialQueue: []
          });
        }
      },

      // Queue management
      queueTutorial: (tutorial) =>
        set((state) => ({
          tutorialQueue: [...state.tutorialQueue.filter(t => t.id !== tutorial.id), tutorial]
            .sort((a, b) => b.priority - a.priority)
        })),

      clearQueue: () => set({ tutorialQueue: [] }),

      // Event tracking
      triggerEvent: (event) =>
        set((state) => ({
          triggeredEvents: [...new Set([...state.triggeredEvents, event])]
        })),

      hasTriggered: (event) => {
        return get().triggeredEvents.includes(event);
      },

      // Utility functions
      getTutorialProgress: (tutorialId) => {
        return get().tutorialProgress[tutorialId] || null;
      },

      isStepCompleted: (tutorialId, stepId) => {
        const progress = get().tutorialProgress[tutorialId];
        return progress ? progress.completedSteps.includes(stepId) : false;
      },

      getCompletionRate: () => {
        const state = get();
        const totalTutorials = Object.keys(state.tutorialProgress).length;
        if (totalTutorials === 0) return 0;
        
        const completedCount = state.completedTutorials.length;
        return Math.round((completedCount / totalTutorials) * 100);
      },

      // Reset all data
      reset: () =>
        set({
          completedTutorials: [],
          tutorialProgress: {},
          activeTutorial: null,
          tutorialQueue: [],
          triggeredEvents: [],
          settings: defaultSettings
        })
    }),
    {
      name: 'aethel-tutorial-store',
      // Only persist settings and progress, not active state
      partialize: (state) => ({
        settings: state.settings,
        completedTutorials: state.completedTutorials,
        tutorialProgress: state.tutorialProgress,
        triggeredEvents: state.triggeredEvents
      })
    }
  )
);

// Helper hooks for common operations
export function useActiveTutorial() {
  return useTutorialStore(state => state.activeTutorial);
}

export function useCurrentStep() {
  const activeTutorial = useTutorialStore(state => state.activeTutorial);
  if (!activeTutorial) return null;
  
  return activeTutorial.tutorial.steps[activeTutorial.currentStepIndex] || null;
}

export function useTutorialSettings() {
  return useTutorialStore(state => state.settings);
}

export function useCompletedTutorials() {
  return useTutorialStore(state => state.completedTutorials);
}