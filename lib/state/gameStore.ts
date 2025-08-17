import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, Skill, Spell, InventoryItem, Condition } from '../../schemas/character';

// Extend Character type for game usage
export type Player = Character & {
  // Additional game-specific properties can be added here
  isSelected?: boolean;
};

export type Scenario = {
  id: string;
  title: string;
  summary: string;
  mapIdea: string;
};

export type HistoryEntry = { role: 'dm' | 'player'; content: string };
export type Effects = {
  party?: Array<{ 
    name: string; 
    hpDelta?: number; 
    mpDelta?: number;
    status?: string;
    addCondition?: Condition;
    removeCondition?: string;
    skillBonus?: { skill: string; bonus: number };
  }>;
  inventory?: Array<{ op: 'add' | 'remove'; item: string | InventoryItem }>;
  quests?: Array<{ op: 'add' | 'update' | 'complete'; title: string; note?: string }>;
  experience?: Array<{ name: string; xpGain: number }>;
};

export type AppSettings = {
  language: 'DE' | 'EN';
  autosaveInterval: number; // minutes, 0 = disabled
  enableSoundEffects: boolean;
  enableVisualDice: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  // AI model now comes from .env (OPENROUTER_MODEL)
  theme: 'light' | 'dark' | 'aethel' | 'mystic' | 'dragon';
  audio: {
    masterVolume: number;
    diceVolume: number;
    ambientVolume: number;
    uiVolume: number;
  };
};

export type PredefinedCampaign = {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  estimatedDuration: string;
  playerCount: { min: number; max: number };
  theme: string;
  preview: {
    setting: string;
    hook: string;
    features: string[];
  };
};

export type GameState = {
  step: 'onboarding' | 'campaignSelection' | 'inGame';
  selections: {
    genre?: string;
    frame?: string;
    world?: { magic: string; climate: string };
    conflict?: string;
    players?: number;
    classes: string[];
    startingWeapons: string[];
    scenario?: Scenario;
    campaign?: PredefinedCampaign;
  };
  party: Player[];
  history: HistoryEntry[];
  inventory: string[];
  quests: { title: string; status: 'open' | 'done'; note?: string }[];
  rngSeed?: number;
  map?: { seed?: number; imageUrl?: string };
  selectedPlayerId?: string;
  settings: AppSettings;
  autoSave?: {
    enabled: boolean;
    interval: number;
    lastAutoSave: number;
    nextAutoSave: number;
  };

  setSelections: (p: Partial<GameState['selections']>) => void;
  startGame: (scenario: Scenario, party: Player[]) => void;
  pushHistory: (entry: HistoryEntry) => void;
  applyEffects: (effects: Effects) => void;
  updatePlayerConditions: (playerId: string, conditions: Condition[]) => void;
  updatePlayerSkill: (playerId: string, skillName: string, newLevel: number) => void;
  addPlayerSkill: (playerId: string, skill: Skill) => void;
  updatePlayerSpell: (playerId: string, spellName: string, updates: Partial<Spell>) => void;
  addPlayerSpell: (playerId: string, spell: Spell) => void;
  updatePlayerMP: (playerId: string, mpChange: number) => void;
  updatePlayerHP: (playerId: string, hpChange: number) => void;
  updatePlayerInventory: (playerId: string, inventory: InventoryItem[]) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  reset: () => void;
  resetToStartPage: () => void;
  importState: (data: Partial<GameState>) => void;
  setMapImage: (url: string) => void;
  setPlayerPortrait: (id: string, url: string) => void;
  setSelectedPlayer: (id: string) => void;
  setCampaignSelectionStep: () => void;
  triggerAutoSave: () => void;
  updateAutoSaveSettings: (enabled: boolean, interval: number) => void;
};

const defaultSettings: AppSettings = {
  language: 'DE',
  autosaveInterval: 5,
  enableSoundEffects: true,
  enableVisualDice: true,
  difficulty: 'normal',
  theme: 'light',
  audio: {
    masterVolume: 0.7,
    diceVolume: 0.8,
    ambientVolume: 0.3,
    uiVolume: 0.5,
  },
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      step: 'onboarding',
      selections: { classes: [], startingWeapons: [] },
      party: [],
      history: [],
      inventory: [],
      quests: [],
      settings: defaultSettings,

      setSelections: (p) =>
        set((s) => ({ selections: { ...s.selections, ...p } })),

      startGame: (scenario, party) =>
        set(() => {
          // seed assignment
          const seededParty = party.map((p) => ({
            ...p,
            portraitSeed: p.portraitSeed ?? Math.floor(Math.random() * 1e9),
          }));
          return {
            step: 'inGame',
            selections: { ...get().selections, scenario },
            party: seededParty,
            history: [],
            inventory: [],
            quests: [],
            rngSeed: Math.floor(Math.random() * 1e9),
            map: { seed: Math.floor(Math.random() * 1e9) },
            selectedPlayerId: seededParty[0]?.id,
          };
        }),

      pushHistory: (entry) =>
        set((s) => ({ history: [...s.history, entry] })),

      applyEffects: (effects) => {
        const s = get();
        // Party HP/MP/Status/Conditions
        const updatedParty = s.party.map((p) => {
          const delta = effects?.party?.find((e) => e.name === p.name);
          if (!delta) return p;
          
          const maxHp = typeof p.maxHp === 'number' ? p.maxHp : Infinity
          const maxMp = typeof p.maxMp === 'number' ? p.maxMp : Infinity
          const updatedPlayer = { 
            ...p, 
            hp: Math.max(0, Math.min(maxHp, p.hp + (delta.hpDelta || 0))),
            mp: Math.max(0, Math.min(maxMp, p.mp + (delta.mpDelta || 0)))
          };
          
          // Handle conditions
          if (delta.addCondition) {
            updatedPlayer.conditions = [...(p.conditions || []), delta.addCondition];
          }
          if (delta.removeCondition) {
            updatedPlayer.conditions = (p.conditions || []).filter(c => c.name !== delta.removeCondition);
          }
          
          // Handle skill bonuses (temporary effects)
          if (delta.skillBonus) {
            const skills = [...(p.skills || [])];
            const skillIdx = skills.findIndex(s => s.name === delta.skillBonus!.skill);
            if (skillIdx >= 0) {
              skills[skillIdx] = { 
                ...skills[skillIdx], 
                level: Math.min(5, skills[skillIdx].level + delta.skillBonus!.bonus)
              };
              updatedPlayer.skills = skills;
            }
          }
          
          return updatedPlayer;
        });

        // Experience gains
        let partyWithXP = updatedParty;
        if (effects?.experience) {
          partyWithXP = updatedParty.map(p => {
            const xpGain = effects.experience?.find(e => e.name === p.name);
            if (xpGain) {
              const newXP = (p.experience || 0) + xpGain.xpGain;
              const newLevel = Math.floor(newXP / 1000) + 1; // Simple leveling formula
              return { ...p, experience: newXP, level: newLevel };
            }
            return p;
          });
        }

        // Inventory
        let inventory = [...s.inventory];
        for (const it of effects?.inventory || []) {
          if (it.op === 'add') {
            const itemName = typeof it.item === 'string' ? it.item : it.item.name;
            inventory.push(itemName);
          }
          if (it.op === 'remove') {
            const itemName = typeof it.item === 'string' ? it.item : it.item.name;
            inventory = inventory.filter((x) => x !== itemName);
          }
        }

        // Quests
        const quests = [...s.quests];
        for (const q of effects?.quests || []) {
          if (q.op === 'add') quests.push({ title: q.title, status: 'open', note: q.note });
          if (q.op === 'update') {
            const idx = quests.findIndex((x) => x.title === q.title);
            if (idx >= 0) quests[idx] = { ...quests[idx], note: q.note ?? quests[idx].note };
          }
          if (q.op === 'complete') {
            const idx = quests.findIndex((x) => x.title === q.title);
            if (idx >= 0) quests[idx] = { ...quests[idx], status: 'done' };
          }
        }

        set({ party: partyWithXP, inventory, quests });
      },

      updatePlayerConditions: (playerId, conditions) =>
        set((s) => ({
          party: s.party.map((p) => 
            p.id === playerId ? { ...p, conditions } : p
          ),
        })),

      updatePlayerSkill: (playerId, skillName, newLevel) =>
        set((s) => ({
          party: s.party.map((p) => {
            if (p.id !== playerId) return p;
            const skills = [...(p.skills || [])];
            const skillIdx = skills.findIndex(s => s.name === skillName);
            if (skillIdx >= 0) {
              skills[skillIdx] = { ...skills[skillIdx], level: Math.min(5, Math.max(0, newLevel)) };
            }
            return { ...p, skills };
          }),
        })),

      addPlayerSkill: (playerId, skill) =>
        set((s) => ({
          party: s.party.map((p) => {
            if (p.id !== playerId) return p;
            const skills = [...(p.skills || [])];
            const existingIdx = skills.findIndex(s => s.name === skill.name);
            if (existingIdx >= 0) {
              skills[existingIdx] = skill;
            } else {
              skills.push(skill);
            }
            return { ...p, skills };
          }),
        })),

      updatePlayerSpell: (playerId, spellName, updates) =>
        set((s) => ({
          party: s.party.map((p) => {
            if (p.id !== playerId) return p;
            const spells = [...(p.spells || [])];
            const spellIdx = spells.findIndex(s => s.name === spellName);
            if (spellIdx >= 0) {
              spells[spellIdx] = { ...spells[spellIdx], ...updates };
            }
            return { ...p, spells };
          }),
        })),

      addPlayerSpell: (playerId, spell) =>
        set((s) => ({
          party: s.party.map((p) => {
            if (p.id !== playerId) return p;
            const spells = [...(p.spells || [])];
            const existingIdx = spells.findIndex(s => s.name === spell.name);
            if (existingIdx >= 0) {
              spells[existingIdx] = spell;
            } else {
              spells.push(spell);
            }
            return { ...p, spells };
          }),
        })),

      updatePlayerMP: (playerId, mpChange) =>
        set((s) => ({
          party: s.party.map((p) => {
            if (p.id !== playerId) return p;
            const newMP = Math.max(0, Math.min(p.maxMp || p.mp, p.mp + mpChange));
            return { ...p, mp: newMP };
          }),
        })),

      updatePlayerHP: (playerId, hpChange) =>
        set((s) => ({
          party: s.party.map((p) => {
            if (p.id !== playerId) return p;
            const newHP = Math.max(0, Math.min(p.maxHp || p.hp, p.hp + hpChange));
            return { ...p, hp: newHP };
          }),
        })),

      updatePlayerInventory: (playerId, inventory) =>
        set((s) => ({
          party: s.party.map((p) => 
            p.id === playerId ? { ...p, inventory } : p
          ),
        })),

      updateSettings: (newSettings) =>
        set((s) => ({
          settings: { ...s.settings, ...newSettings },
        })),

      reset: () =>
        set({
          step: 'onboarding',
          selections: { classes: [], startingWeapons: [] },
          party: [],
          history: [],
          inventory: [],
          quests: [],
          settings: defaultSettings,
        }),

      resetToStartPage: () => {
        // Clear localStorage completely and reset to start page
        if (typeof window !== 'undefined') {
          localStorage.removeItem('dnd-ai-save');
          // Also clear any individual save slots
          for (let i = 1; i <= 6; i++) {
            localStorage.removeItem(`dnd-ai-save-slot-${i}`);
          }
          localStorage.removeItem('dnd-ai-save-metadata');
        }
        set({
          step: 'onboarding',
          selections: { classes: [], startingWeapons: [] },
          party: [],
          history: [],
          inventory: [],
          quests: [],
          settings: defaultSettings,
        });
      },

      setCampaignSelectionStep: () => set({ step: 'campaignSelection' }),

  importState: (data) => {
        // Defensive merge; ensure arrays are present
        set((s) => ({
      step: data.step ?? s.step,
          selections: {
            classes: data.selections?.classes ?? s.selections.classes,
            startingWeapons:
              data.selections?.startingWeapons ?? s.selections.startingWeapons,
            genre: data.selections?.genre ?? s.selections.genre,
            frame: data.selections?.frame ?? s.selections.frame,
            world: data.selections?.world ?? s.selections.world,
            players: data.selections?.players ?? s.selections.players,
            scenario: data.selections?.scenario ?? s.selections.scenario,
          },
          party: data.party ?? s.party,
          history: data.history ?? s.history,
          inventory: data.inventory ?? s.inventory,
          quests: data.quests ?? s.quests,
          rngSeed: data.rngSeed ?? s.rngSeed,
          map: data.map ?? s.map,
        }));
      },

      setMapImage: (url) => set((s) => ({ map: { ...(s.map || {}), imageUrl: url } })),
      setPlayerPortrait: (id, url) =>
        set((s) => ({
          party: s.party.map((p) => (p.id === id ? { ...p, portraitUrl: url } : p)),
        })),
      setSelectedPlayer: (id) => set(() => ({ selectedPlayerId: id })),


      triggerAutoSave: () => {
        const state = get();
        if (state.step === 'inGame' && state.settings.autosaveInterval > 0) {
          // Call auto-save API
          fetch('/api/saves/autosave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameState: state })
          }).then(response => {
            if (response.ok) {
              const now = Date.now();
              const interval = state.settings.autosaveInterval * 60 * 1000; // Convert minutes to ms
              set(() => ({
                autoSave: {
                  enabled: true,
                  interval,
                  lastAutoSave: now,
                  nextAutoSave: now + interval
                }
              }));
            }
          }).catch(error => {
            console.warn('Auto-save failed:', error);
          });
        }
      },

      updateAutoSaveSettings: (enabled, interval) => {
        const now = Date.now();
        const intervalMs = interval * 60 * 1000; // Convert minutes to ms
    set((prev) => ({
          autoSave: {
            enabled,
            interval: intervalMs,
      lastAutoSave: prev.autoSave?.lastAutoSave || now,
            nextAutoSave: enabled ? now + intervalMs : 0
          }
        }));
      },
    }),
    { name: 'dnd-ai-save' }
  )
);
