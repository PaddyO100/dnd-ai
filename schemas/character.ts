import { z } from 'zod'

// Character Race definitions
export const Race = z.enum(['human', 'orc', 'dark_elf', 'high_elf', 'wood_elf', 'dwarf'])

// Character Gender definitions  
export const Gender = z.enum(['male', 'female'])

// Character Class definitions (alle 9 Klassen)
export const CharacterClass = z.enum([
  'warrior', 'mage', 'rogue', 'bard', 'paladin', 
  'ranger', 'druid', 'monk', 'warlock'
])

export const Skill = z.object({
  name: z.string(),
  level: z.number().min(0).max(5),
  max: z.number().default(5),
  description: z.string().optional(),
})

export const Spell = z.object({
  name: z.string(),
  cost: z.number(),
  description: z.string(),
  level: z.number().min(1).max(9).optional(),
  school: z.string().optional(),
})

export const Trait = z.object({
  name: z.string(),
  description: z.string(),
  shortDescription: z.string().optional(),
  type: z.enum(['racial', 'class', 'background', 'special', 'feat']).optional(),
  effects: z.array(z.object({
    type: z.enum(['stat_modifier', 'skill_bonus', 'damage_bonus', 'resistance', 'special_ability', 'spell']),
    value: z.union([z.number(), z.string()]),
    target: z.string().optional(), // What stat/skill this affects
    condition: z.string().optional() // When this effect applies
  })).default([]),
  prerequisites: z.array(z.string()).default([]), // Required stats, skills, or other traits
})

export const InventoryItem = z.object({
  name: z.string(),
  type: z.enum(['weapon', 'armor', 'consumable', 'tool', 'misc', 'quest', 'valuable', 'clothing']),
  subtype: z.enum(['main_hand', 'off_hand', 'two_handed', 'helmet', 'chest', 'legs', 'feet', 'gloves', 'cloak', 'ring', 'amulet', 'belt', 'none']).default('none'),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).default('common'),
  quantity: z.number().default(1),
  description: z.string().optional(),
  equipped: z.boolean().default(false),
  location: z.enum(['equipped', 'inventory', 'bag']).default('inventory'),
  effects: z.array(z.object({
    type: z.enum(['stat_bonus', 'damage_bonus', 'resistance', 'immunity', 'spell', 'passive']),
    value: z.union([z.number(), z.string()]),
    description: z.string()
  })).default([]),
  value: z.number().default(0), // Gold value
  weight: z.number().default(0), // For encumbrance
})

export const Condition = z.object({
  name: z.string(),
  description: z.string(),
  duration: z.number().optional(), // rounds remaining, -1 for permanent
  type: z.enum(['buff', 'debuff', 'neutral']).default('neutral'),
})

export const Character = z.object({
  id: z.string(),
  name: z.string(),
  cls: z.string(),
  race: Race,
  gender: Gender,
  hp: z.number(),
  maxHp: z.number().optional(),
  mp: z.number(),
  maxMp: z.number().optional(),
  stats: z.record(z.number()),
  portraitUrl: z.string().url().optional(),
  portraitSeed: z.number().optional(),
  // New extended attributes
  skills: z.array(Skill).default([]),
  spells: z.array(Spell).default([]),
  traits: z.array(Trait).default([]),
  inventory: z.array(InventoryItem).default([]),
  quests: z.array(z.any()).default([]),
  conditions: z.array(Condition).default([]),
  backstory: z.object({
    origin: z.string().optional(),
    personality: z.string().optional(),
    motivation: z.string().optional(),
    flaw: z.string().optional(),
    background: z.string().optional(),
    bonds: z.array(z.string()).default([]),
    ideals: z.array(z.string()).default([]),
    fears: z.array(z.string()).default([]),
    generated: z.boolean().default(false) // Whether backstory was AI-generated
  }).optional(),
  // Derived stats for better gameplay
  armorClass: z.number().optional(),
  level: z.number().default(1),
  experience: z.number().default(0),
  // Character progression
  skillPoints: z.number().default(0),
  featPoints: z.number().default(0),
  // Physical attributes
  age: z.number().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  eyes: z.string().optional(),
  hair: z.string().optional(),
  skin: z.string().optional(),
  // Social attributes
  reputation: z.number().default(0),
  wealth: z.number().default(0), // Gold pieces
  // Character creation metadata
  creationChoices: z.object({
    statMethod: z.enum(['point_buy', 'rolled', 'standard_array']).default('point_buy'),
    pointsSpent: z.number().default(0),
    startingPackage: z.string().optional()
  }).optional(),
})

export type Character = z.infer<typeof Character>
export type Race = z.infer<typeof Race>
export type Gender = z.infer<typeof Gender>
export type CharacterClass = z.infer<typeof CharacterClass>
export type Skill = z.infer<typeof Skill>
export type Spell = z.infer<typeof Spell>
export type Trait = z.infer<typeof Trait>
export type InventoryItem = z.infer<typeof InventoryItem>
export type Condition = z.infer<typeof Condition>

export const Quest = z.object({
  title: z.string(),
  status: z.enum(['open', 'in-progress', 'completed', 'failed']),
  note: z.string().optional(),
});

export type Quest = z.infer<typeof Quest>;
