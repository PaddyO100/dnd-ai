import { z } from 'zod'
import type { GameState } from '@/lib/state/gameStore'

// Common API response schemas
export const ApiError = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
})

export const ApiSuccess = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
})

// Pagination schemas
export const PaginationParams = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const PaginatedResponse = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
})

// Campaign schemas
export const Campaign = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  estimatedHours: z.number().min(1).max(100),
  playerCount: z.object({
    min: z.number().min(1),
    max: z.number().min(1),
  }),
  tags: z.array(z.string()),
  thumbnail: z.string().url().optional(),
  scenarios: z.array(z.object({
    id: z.string(),
    title: z.string(),
    summary: z.string(),
    mapIdea: z.string(),
    order: z.number(),
  })),
  presetCharacters: z.array(z.object({
    name: z.string(),
    class: z.string(),
    level: z.number(),
    description: z.string(),
  })).optional(),
  worldInfo: z.object({
    setting: z.string(),
    theme: z.string(),
    magicLevel: z.enum(['none', 'low', 'medium', 'high']),
    techLevel: z.enum(['stone', 'bronze', 'iron', 'medieval', 'renaissance', 'industrial', 'modern', 'futuristic']),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CampaignSummary = Campaign.omit({ 
  scenarios: true, 
  presetCharacters: true 
}).extend({
  scenarioCount: z.number(),
  isOfficial: z.boolean(),
})

export const LoadCampaignRequest = z.object({
  campaignId: z.string(),
  startFromScenario: z.number().optional(),
  usePresetCharacters: z.boolean().default(false),
})

// Save/Load schemas
export const SaveMetadata = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  campaignId: z.string().optional(),
  scenarioTitle: z.string().optional(),
  partyLevel: z.number().optional(),
  partyNames: z.array(z.string()),
  thumbnail: z.string().optional(), // base64 encoded screenshot
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  gameVersion: z.string(),
  tags: z.array(z.string()).default([]),
})

export const SaveData = SaveMetadata.extend({
  gameState: z.custom<GameState>(),
  checksum: z.string(), // for data integrity
})

export const CreateSaveRequest = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  gameState: z.custom<GameState>(),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
})

export const UpdateSaveRequest = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
})

// Settings schemas
export const UserSettings = z.object({
  id: z.string(),
  userId: z.string().optional(), // for future user system
  display: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
    animations: z.boolean().default(true),
    soundEffects: z.boolean().default(true),
    showDiceAnimations: z.boolean().default(true),
    compactMode: z.boolean().default(false),
  }),
  gameplay: z.object({
    autoSave: z.boolean().default(true),
    autoSaveInterval: z.number().min(30).max(600).default(60), // seconds
    confirmDangerousActions: z.boolean().default(true),
    showTutorialHints: z.boolean().default(true),
    enableAdvancedFeatures: z.boolean().default(false),
    defaultDiceFormula: z.string().default('1d20'),
  }),
  ai: z.object({
    creativity: z.number().min(0).max(1).default(0.7),
    verbosity: z.enum(['concise', 'normal', 'detailed']).default('normal'),
  // Image generation removed
  }),
  privacy: z.object({
    analytics: z.boolean().default(true),
    crashReporting: z.boolean().default(true),
    shareAnonymousUsage: z.boolean().default(false),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const UpdateSettingsRequest = UserSettings.omit({ 
  id: true, 
  userId: true,
  createdAt: true, 
  updatedAt: true 
}).partial()

// Tutorial schemas
export const TutorialStep = z.object({
  id: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string(),
  component: z.string(), // which UI component this step targets
  position: z.enum(['top', 'bottom', 'left', 'right', 'center']).optional(),
  trigger: z.enum(['auto', 'click', 'hover', 'manual']).default('auto'),
  prerequisites: z.array(z.string()).default([]), // step IDs that must be completed first
  optional: z.boolean().default(false),
  content: z.object({
    text: z.string(),
    media: z.object({
      type: z.enum(['image', 'video', 'gif']),
      url: z.string().url(),
      alt: z.string().optional(),
    }).optional(),
    tips: z.array(z.string()).default([]),
    warnings: z.array(z.string()).default([]),
  }),
  actions: z.array(z.object({
    type: z.enum(['highlight', 'disable', 'focus', 'scroll']),
    target: z.string(), // CSS selector or component ID
    duration: z.number().optional(),
  })).default([]),
})

export const TutorialProgress = z.object({
  id: z.string(),
  userId: z.string().optional(),
  completedSteps: z.array(z.string()),
  skippedSteps: z.array(z.string()),
  currentStep: z.string().optional(),
  startedAt: z.string().datetime(),
  lastActiveAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  totalSteps: z.number(),
  completionPercentage: z.number().min(0).max(100),
})

export const UpdateTutorialProgressRequest = z.object({
  stepId: z.string(),
  action: z.enum(['complete', 'skip', 'reset']),
  timeSpent: z.number().optional(), // milliseconds
})

// Enhanced dice schemas
export const DiceRollRequest = z.object({
  formula: z.string().min(2),
  seed: z.number().optional(),
  label: z.string().optional(),
  metadata: z.object({
    character: z.string().optional(),
    skill: z.string().optional(),
    advantage: z.boolean().default(false),
    disadvantage: z.boolean().default(false),
  }).optional(),
})

export const DiceRollBatch = z.object({
  rolls: z.array(DiceRollRequest),
  seed: z.number().optional(), // shared seed for all rolls
})

export const DiceRollResult = z.object({
  id: z.string(),
  formula: z.string(),
  result: z.number(),
  rolls: z.array(z.number()),
  label: z.string().optional(),
  metadata: z.any().optional(),
  timestamp: z.string().datetime(),
  seed: z.number().optional(),
})

export const DiceHistoryQuery = z.object({
  limit: z.number().min(1).max(100).default(20),
  character: z.string().optional(),
  skill: z.string().optional(),
  since: z.string().datetime().optional(),
})

// Type exports
export type Campaign = z.infer<typeof Campaign>
export type CampaignSummary = z.infer<typeof CampaignSummary>
export type LoadCampaignRequest = z.infer<typeof LoadCampaignRequest>
export type SaveMetadata = z.infer<typeof SaveMetadata>
export type SaveData = z.infer<typeof SaveData>
export type CreateSaveRequest = z.infer<typeof CreateSaveRequest>
export type UpdateSaveRequest = z.infer<typeof UpdateSaveRequest>
export type UserSettings = z.infer<typeof UserSettings>
export type UpdateSettingsRequest = z.infer<typeof UpdateSettingsRequest>
export type TutorialStep = z.infer<typeof TutorialStep>
export type TutorialProgress = z.infer<typeof TutorialProgress>
export type UpdateTutorialProgressRequest = z.infer<typeof UpdateTutorialProgressRequest>
export type DiceRollRequest = z.infer<typeof DiceRollRequest>
export type DiceRollBatch = z.infer<typeof DiceRollBatch>
export type DiceRollResult = z.infer<typeof DiceRollResult>
export type DiceHistoryQuery = z.infer<typeof DiceHistoryQuery>
export type ApiError = z.infer<typeof ApiError>
export type ApiSuccess = z.infer<typeof ApiSuccess>
export type PaginatedResponse = z.infer<typeof PaginatedResponse>