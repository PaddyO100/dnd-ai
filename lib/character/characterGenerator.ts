// lib/character/characterGenerator.ts

import { Character, Skill, Trait, InventoryItem, Race, Gender } from '@/schemas/character';
import { skillDefinitions, SkillName } from './skillSystem';
import { generateStartingGear } from './itemGenerator';
import { generateAIBackstory } from './backstoryGenerator';
import { applyRacialBonuses, getRacialTraits } from './raceSystem';
import { getClassWeaponInfo } from './classWeaponSystem';
import { getPortraitUrl } from './portraitSystem';

export interface StatDistribution {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface CharacterClass {
  name: string;
  description: string;
  primaryStats: (keyof StatDistribution)[];
  startingSkills: SkillName[];
  startingTraits: string[];
  startingItems: string[];
  hpMultiplier: number;
  mpMultiplier: number;
}

export const characterClasses: Record<string, CharacterClass> = {
  warrior: {
    name: "Krieger",
    description: "Meister des Kampfes mit Waffen und Rüstung",
    primaryStats: ["strength", "constitution"],
    startingSkills: ["melee_combat", "athletics", "intimidation"],
    startingTraits: ["combat_training", "weapon_expertise"],
    startingItems: ["langschwert", "lederschiene", "heiltrank"],
    hpMultiplier: 1.3,
    mpMultiplier: 0.8
  },
  mage: {
    name: "Magier",
    description: "Gelehrter der arkanen Künste und Zaubersprüche",
    primaryStats: ["intelligence", "wisdom"],
    startingSkills: ["arcane_knowledge", "spell_focus", "investigation"],
    startingTraits: ["arcane_sight", "spell_knowledge"],
    startingItems: ["zauberstab", "zauberkomponenten", "manatrank"],
    hpMultiplier: 0.8,
    mpMultiplier: 1.5
  },
  rogue: {
    name: "Schurke",
    description: "Meister der Heimlichkeit und des präzisen Angriffs",
    primaryStats: ["dexterity", "intelligence"],
    startingSkills: ["stealth", "lockpicking", "sleight_of_hand"],
    startingTraits: ["sneak_attack", "nimble"],
    startingItems: ["dolch", "dietriche", "seil"],
    hpMultiplier: 1.0,
    mpMultiplier: 1.0
  },
  ranger: {
    name: "Waldläufer",
    description: "Experte für Natur, Überlebenskunst und Fernkampf",
    primaryStats: ["dexterity", "wisdom"],
    startingSkills: ["survival", "nature_lore", "ranged_combat"],
    startingTraits: ["nature_bond", "tracking"],
    startingItems: ["bogen", "pfeile", "rations"],
    hpMultiplier: 1.1,
    mpMultiplier: 1.1
  },
  cleric: {
    name: "Kleriker",
    description: "Diener der Götter mit heilenden und schützenden Kräften",
    primaryStats: ["wisdom", "charisma"],
    startingSkills: ["divine_magic", "healing", "religion"],
    startingTraits: ["divine_favor", "turn_undead"],
    startingItems: ["heiligensymbol", "heiltrank", "gebetsbuch"],
    hpMultiplier: 1.1,
    mpMultiplier: 1.3
  }
};

export const traitDefinitions: Record<string, Trait> = {
  combat_training: {
    name: "Kampftraining",
    description: "+2 Bonus auf Nahkampfangriffe, +1 Rüstungsklasse",
    type: "class",
    effects: [
      { type: "skill_bonus", value: 2, target: "combat" },
      { type: "stat_modifier", value: 1, target: "ac" }
    ],
    prerequisites: []
  },
  weapon_expertise: {
    name: "Waffenexpertise", 
    description: "Zusätzlicher Schaden mit bevorzugter Waffe",
    type: "class",
    effects: [{ type: "damage_bonus", value: 2, target: "weapon" }],
    prerequisites: []
  },
  arcane_sight: {
    name: "Arkaner Blick",
    description: "Kann magische Auren erkennen und identifizieren",
    type: "class",
    effects: [{ type: "special_ability", value: "detect_magic", target: "magic" }],
    prerequisites: []
  },
  spell_knowledge: {
    name: "Zauberkundigkeit",
    description: "+3 Bonus bei Zauberwissen und Identifizierung",
    type: "class",
    effects: [{ type: "skill_bonus", value: 3, target: "magic_knowledge" }],
    prerequisites: []
  },
  sneak_attack: {
    name: "Hinterlistiger Angriff",
    description: "Doppelter Schaden bei Angriffen aus dem Verborgenen",
    type: "class",
    effects: [{ type: "damage_bonus", value: 100, target: "sneak_attack", condition: "hidden" }],
    prerequisites: []
  },
  nimble: {
    name: "Gewandtheit",
    description: "+2 Bonus auf Geschicklichkeit und Heimlichkeit",
    type: "class",
    effects: [{ type: "stat_modifier", value: 2, target: "dexterity" }],
    prerequisites: []
  },
  nature_bond: {
    name: "Naturverbundenheit",
    description: "+3 Bonus bei Überlebenskunst und Tierführung",
    type: "class",
    effects: [{ type: "skill_bonus", value: 3, target: "survival" }],
    prerequisites: []
  },
  tracking: {
    name: "Spurenlesen",
    description: "Kann Spuren verfolgen und Alter bestimmen",
    type: "class",
    effects: [{ type: "special_ability", value: "tracking", target: "survival" }],
    prerequisites: []
  },
  divine_favor: {
    name: "Göttliche Gunst",
    description: "+2 Bonus auf Heilungsmagie und Schutzsprüche",
    type: "class",
    effects: [{ type: "skill_bonus", value: 2, target: "divine_magic" }],
    prerequisites: []
  },
  turn_undead: {
    name: "Untote Bannen",
    description: "Kann Untote vertreiben oder kontrollieren",
    type: "class",
    effects: [{ type: "special_ability", value: "turn_undead", target: "undead" }],
    prerequisites: []
  },
  lucky: {
    name: "Glückspilz",
    description: "Kann einmal pro Tag einen Wurf wiederholen",
    type: "background",
    effects: [{ type: "special_ability", value: "reroll", target: "daily" }],
    prerequisites: []
  },
  observant: {
    name: "Aufmerksam",
    description: "+2 Bonus auf Wahrnehmung und Untersuchung",
    type: "background",
    effects: [{ type: "skill_bonus", value: 2, target: "perception" }],
    prerequisites: []
  },
  charismatic: {
    name: "Charismatisch",
    description: "+2 Bonus auf alle sozialen Würfe",
    type: "background",
    effects: [{ type: "skill_bonus", value: 2, target: "social" }],
    prerequisites: []
  }
};

export const itemTemplates: Record<string, Omit<InventoryItem, 'quantity'>> = {
  // Waffen
  langschwert: {
    name: "Langschwert",
    type: "weapon",
    subtype: "main_hand",
    location: "inventory",
    value: 15,
    effects: [{ type: "damage_bonus", value: "1d8", description: "Versatile weapon damage" }],
    rarity: "common",
    weight: 3,
    description: "1d8+STR Schaden, vielseitig (1d10 beidhändig)",
    equipped: false
  },
  dolch: {
    name: "Dolch", 
    type: "weapon",
    subtype: "main_hand",
    location: "inventory",
    value: 2,
    effects: [{ type: "damage_bonus", value: "1d4", description: "Light finesse weapon" }],
    rarity: "common",
    weight: 1,
    description: "1d4+DEX Schaden, werfbar, finesse",
    equipped: false
  },
  bogen: {
    name: "Bogen",
    type: "weapon",
    subtype: "two_handed",
    location: "inventory", 
    value: 25,
    effects: [{ type: "damage_bonus", value: "1d8", description: "Ranged weapon" }],
    rarity: "common",
    weight: 2,
    description: "1d8+DEX Schaden, Reichweite 150/600ft",
    equipped: false
  },
  zauberstab: {
    name: "Zauberstab",
    type: "weapon",
    subtype: "main_hand",
    location: "inventory",
    value: 100,
    effects: [{ type: "spell", value: "+1", description: "Magic weapon bonus" }],
    rarity: "uncommon",
    weight: 1,
    description: "+1 Zauberbonus, 1d6 arkaner Schaden",
    equipped: false
  },
  
  // Rüstung
  lederschiene: {
    name: "Lederschiene",
    type: "armor",
    subtype: "chest",
    location: "inventory",
    value: 10,
    effects: [{ type: "stat_bonus", value: "11+DEX", description: "Armor Class bonus" }],
    rarity: "common",
    weight: 10,
    description: "RK 11 + DEX Bonus (max 2)",
    equipped: false
  },
  
  // Verbrauchsgegenstände
  heiltrank: {
    name: "Heiltrank",
    type: "consumable",
    subtype: "none",
    location: "inventory", 
    value: 50,
    effects: [{ type: "spell", value: "2d4+2", description: "Healing potion" }],
    rarity: "common",
    weight: 0.5,
    description: "Heilt 2d4+2 Trefferpunkte",
    equipped: false
  },
  manatrank: {
    name: "Manatrank",
    type: "consumable",
    subtype: "none",
    location: "inventory",
    value: 25,
    effects: [{ type: "spell", value: "1d4+1", description: "Mana restoration" }],
    rarity: "common",
    weight: 0.5,
    description: "Stellt 1d4+1 Manapunkte wieder her", 
    equipped: false
  },
  rations: {
    name: "Reiserationen",
    type: "consumable",
    subtype: "none",
    location: "inventory",
    value: 2,
    effects: [{ type: "passive", value: "sustenance", description: "Daily food" }],
    rarity: "common",
    weight: 2,
    description: "Nahrung für einen Tag",
    equipped: false
  },
  
  // Werkzeuge
  dietriche: {
    name: "Dietriche",
    type: "tool",
    subtype: "none",
    location: "inventory",
    value: 25,
    effects: [{ type: "stat_bonus", value: "+2", description: "Lockpicking bonus" }],
    rarity: "common",
    weight: 1,
    description: "+2 Bonus beim Schlösser knacken",
    equipped: false
  },
  seil: {
    name: "Seil (15m)",
    type: "tool",
    subtype: "none",
    location: "inventory", 
    value: 2,
    effects: [{ type: "passive", value: "utility", description: "Climbing and binding" }],
    rarity: "common",
    weight: 3,
    description: "Hanfseil für Klettern und Fesseln",
    equipped: false
  },
  pfeile: {
    name: "Pfeile (30 Stück)",
    type: "misc",
    subtype: "none",
    location: "inventory",
    value: 1,
    effects: [{ type: "passive", value: "ammunition", description: "Bow ammunition" }],
    rarity: "common",
    weight: 1,
    description: "Munition für Bogen",
    equipped: false
  },
  
  // Magische Gegenstände
  zauberkomponenten: {
    name: "Zauberkomponenten",
    type: "misc",
    subtype: "none",
    location: "inventory",
    value: 25,
    effects: [{ type: "passive", value: "spell_focus", description: "Spellcasting materials" }],
    rarity: "common",
    weight: 1,
    description: "Materialien für Zaubersprüche",
    equipped: false
  },
  heiligensymbol: {
    name: "Heiliges Symbol",
    type: "misc",
    subtype: "none",
    location: "inventory",
    value: 5,
    effects: [{ type: "passive", value: "divine_focus", description: "Divine spellcasting focus" }],
    rarity: "common",
    weight: 1,
    description: "Fokus für göttliche Magie",
    equipped: false
  },
  gebetsbuch: {
    name: "Gebetsbuch",
    type: "misc",
    subtype: "none",
    location: "inventory",
    value: 25,
    effects: [{ type: "passive", value: "divine_knowledge", description: "Religious texts and prayers" }],
    rarity: "common",
    weight: 3,
    description: "Sammlung heiliger Texte und Gebete",
    equipped: false
  }
};

/**
 * Point-Buy Kosten für Attributswerte
 */
const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5,
  14: 7, 15: 9, 16: 12, 17: 15, 18: 19
};

/**
 * Generiert eine ausgewogene Attributsverteilung basierend auf Klasse
 */
export function generateStats(className: string, method: 'point_buy' | 'rolled' | 'standard_array' = 'point_buy'): StatDistribution {
  const classData = characterClasses[className.toLowerCase()];
  
  if (method === 'standard_array') {
    return generateStandardArrayStats(className);
  } else if (method === 'rolled') {
    return generateRolledStats(className);
  }
  
  // Point-Buy System (Default)
  const baseStats: StatDistribution = {
    strength: 8, dexterity: 8, constitution: 8,
    intelligence: 8, wisdom: 8, charisma: 8
  };
  
  let remainingPoints = 27;
  
  if (classData) {
    const primaryStats = classData.primaryStats;
    const secondaryStats = Object.keys(baseStats).filter(
      stat => !primaryStats.includes(stat as keyof StatDistribution)
    ) as (keyof StatDistribution)[];
    
    // Verteile Punkte strategisch
    // 1. Primäre Stats auf 15 setzen
    primaryStats.forEach(stat => {
      const targetValue = Math.min(15, 8 + Math.floor(remainingPoints / primaryStats.length));
      const cost = calculatePointBuyCost(8, targetValue);
      if (cost <= remainingPoints) {
        baseStats[stat] = targetValue;
        remainingPoints -= cost;
      }
    });
    
    // 2. Constitution auf mindestens 12 für Überlebensfähigkeit
    if (!primaryStats.includes('constitution') && baseStats.constitution < 12) {
      const cost = calculatePointBuyCost(baseStats.constitution, 12);
      if (cost <= remainingPoints) {
        baseStats.constitution = 12;
        remainingPoints -= cost;
      }
    }
    
    // 3. Restpunkte auf sekundäre Stats verteilen
    while (remainingPoints > 0) {
      let improved = false;
      for (const stat of secondaryStats) {
        if (baseStats[stat] < 15) {
          const cost = calculatePointBuyCost(baseStats[stat], baseStats[stat] + 1);
          if (cost <= remainingPoints) {
            baseStats[stat] += 1;
            remainingPoints -= cost;
            improved = true;
            break;
          }
        }
      }
      if (!improved) break;
    }
  }
  
  return baseStats;
}

/**
 * Standard Array Verteilung
 */
function generateStandardArrayStats(className: string): StatDistribution {
  const standardArray = [15, 14, 13, 12, 10, 8];
  const classData = characterClasses[className.toLowerCase()];
  const stats: StatDistribution = {
    strength: 8, dexterity: 8, constitution: 8,
    intelligence: 8, wisdom: 8, charisma: 8
  };
  
  if (classData) {
    const statKeys = Object.keys(stats) as (keyof StatDistribution)[];
    const primaryStats = classData.primaryStats;
    
    // Weise höchste Werte zu primären Stats zu
    let arrayIndex = 0;
    primaryStats.forEach(stat => {
      stats[stat] = standardArray[arrayIndex++];
    });
    
    // Constitution bekommt einen guten Wert
    if (!primaryStats.includes('constitution')) {
      stats.constitution = standardArray[arrayIndex++];
    }
    
    // Restliche Stats
    const remainingStats = statKeys.filter(stat => 
      !primaryStats.includes(stat) && (stat !== 'constitution' || primaryStats.includes('constitution'))
    );
    remainingStats.forEach(stat => {
      stats[stat] = standardArray[arrayIndex++];
    });
  }
  
  return stats;
}

/**
 * Gewürfelte Stats (4d6, niedrigsten Würfel weglassen)
 */
function generateRolledStats(className: string): StatDistribution {
  const rollStat = () => {
    const rolls = Array.from({length: 4}, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => b - a);
    return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
  };
  
  const classData = characterClasses[className.toLowerCase()];
  const rolledValues = Array.from({length: 6}, () => rollStat()).sort((a, b) => b - a);
  
  const stats: StatDistribution = {
    strength: 8, dexterity: 8, constitution: 8,
    intelligence: 8, wisdom: 8, charisma: 8
  };
  
  if (classData) {
    const statKeys = Object.keys(stats) as (keyof StatDistribution)[];
    const primaryStats = classData.primaryStats;
    
    let valueIndex = 0;
    primaryStats.forEach(stat => {
      stats[stat] = rolledValues[valueIndex++];
    });
    
    const remainingStats = statKeys.filter(stat => !primaryStats.includes(stat));
    remainingStats.forEach(stat => {
      stats[stat] = rolledValues[valueIndex++];
    });
  }
  
  return stats;
}

/**
 * Berechnet Point-Buy Kosten für Upgrade von einem Wert zum anderen
 */
export function calculatePointBuyCost(fromValue: number, toValue: number): number {
  let cost = 0;
  for (let i = fromValue; i < toValue; i++) {
    cost += POINT_BUY_COSTS[i + 1] - POINT_BUY_COSTS[i];
  }
  return cost;
}

/**
 * Validiert Point-Buy Allokation
 */
export function validatePointBuy(stats: StatDistribution): { valid: boolean; pointsUsed: number; errors: string[] } {
  const errors: string[] = [];
  let pointsUsed = 0;
  
  Object.entries(stats).forEach(([stat, value]) => {
    if (value < 8 || value > 18) {
      errors.push(`${stat} muss zwischen 8 und 18 liegen`);
    }
    pointsUsed += POINT_BUY_COSTS[value] || 0;
  });
  
  if (pointsUsed > 27) {
    errors.push(`Point-Buy Budget überschritten: ${pointsUsed}/27`);
  }
  
  return { valid: errors.length === 0, pointsUsed, errors };
}

/**
 * Generiert Startfertigkeiten basierend auf Klasse
 */
export function generateStartingSkills(className: string): Skill[] {
  const classData = characterClasses[className.toLowerCase()];
  if (!classData) return [];
  
  return classData.startingSkills.map(skillName => ({
    name: skillDefinitions[skillName]?.name || skillName,
    level: 1,
    max: 5,
    description: skillDefinitions[skillName]?.description
  }));
}

/**
 * Generiert Charaktereigenschaften basierend auf Klasse
 */
export function generateTraits(className: string): Trait[] {
  const classData = characterClasses[className.toLowerCase()];
  if (!classData) return [];
  
  const traits = classData.startingTraits.map(traitKey => 
    traitDefinitions[traitKey]
  ).filter(Boolean);
  
  // Füge zufällige Hintergrund-Eigenschaft hinzu
  const backgroundTraits = Object.values(traitDefinitions)
    .filter(trait => trait.type === 'background');
  
  if (backgroundTraits.length > 0) {
    const randomTrait = backgroundTraits[Math.floor(Math.random() * backgroundTraits.length)];
    traits.push(randomTrait);
  }
  
  return traits;
}

/**
 * Generiert Waffenrestriktions-Traits basierend auf Klasse
 */
export function generateWeaponRestrictionTraits(className: string): Trait[] {
  try {
    // Check if className is a valid CharacterClass
    const validClasses = ['warrior', 'mage', 'rogue', 'bard', 'paladin', 'ranger', 'druid', 'monk', 'warlock'];
    const normalizedClass = className.toLowerCase();
    
    if (!validClasses.includes(normalizedClass)) {
      return [];
    }
    
    const weaponInfo = getClassWeaponInfo(normalizedClass as 'warrior' | 'mage' | 'rogue' | 'bard' | 'paladin' | 'ranger' | 'druid' | 'monk' | 'warlock');
    
    return [
      {
        name: "Waffenbeherrschung",
        description: `Beherrschung der klassischen ${weaponInfo.displayName}-Waffen`,
        type: "class" as const,
        effects: [
          {
            type: "special_ability" as const,
            value: "weapon_proficiency",
            target: "primary_weapons",
            condition: weaponInfo.weaponRestrictions.primary.join(', ')
          }
        ],
        prerequisites: []
      },
      {
        name: "Waffenrestriktionen",
        description: `Einschränkungen bei der Nutzung bestimmter Waffen`,
        type: "class" as const,
        effects: [
          {
            type: "special_ability" as const,
            value: "weapon_restriction",
            target: "forbidden_weapons", 
            condition: weaponInfo.weaponRestrictions.forbidden.join(', ')
          }
        ],
        prerequisites: []
      }
    ];
  } catch {
    // Fallback if class not found in weapon system
    return [];
  }
}

/**
 * Generiert Startausrüstung basierend auf Klasse
 */
export function generateStartingInventory(className: string): InventoryItem[] {
  return generateStartingGear(className);
}

/**
 * Berechnet abgeleitete Werte basierend auf Stats und Klasse
 */
export function calculateDerivedStats(stats: StatDistribution, className: string) {
  const classData = characterClasses[className.toLowerCase()];
  const conModifier = Math.floor((stats.constitution - 10) / 2);
  const intModifier = Math.floor((stats.intelligence - 10) / 2);
  const dexModifier = Math.floor((stats.dexterity - 10) / 2);
  
  const baseHp = 10 + conModifier;
  const baseMp = 5 + intModifier;
  
  return {
    maxHp: Math.max(1, Math.floor(baseHp * (classData?.hpMultiplier || 1))),
    maxMp: Math.max(0, Math.floor(baseMp * (classData?.mpMultiplier || 1))),
    armorClass: 10 + dexModifier
  };
}

/**
 * Generiert einen vollständigen Charakter
 */
export async function generateCharacter(
  name: string,
  className: string,
  options: {
    race?: Race;
    gender?: Gender;
    statMethod?: 'point_buy' | 'rolled' | 'standard_array';
    generateBackstory?: boolean;
    customStats?: StatDistribution;
    customOptions?: Partial<Character>;
  } = {}
): Promise<Character> {
  const {
    race = 'human',
    gender = 'male',
    statMethod = 'point_buy',
    generateBackstory = true,
    customStats,
    customOptions = {}
  } = options;
  
  const id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Generate base stats and apply racial modifiers
  const baseStats = customStats || generateStats(className, statMethod);
  const modifiedStats = applyRacialBonuses(baseStats, race);
  
  const skills = generateStartingSkills(className);
  const traits = generateTraits(className);
  const racialTraits = getRacialTraits(race);
  const weaponRestrictionTraits = generateWeaponRestrictionTraits(className);
  const inventory = generateStartingInventory(className);
  const derived = calculateDerivedStats(modifiedStats, className);
  
  // Generate physical attributes
  const physicalAttributes = generatePhysicalAttributes();
  
  const baseCharacter: Character = {
    id,
    name,
    cls: characterClasses[className.toLowerCase()]?.name || className,
    race,
    gender,
    hp: derived.maxHp,
    maxHp: derived.maxHp,
    mp: derived.maxMp,
    maxMp: derived.maxMp,
    stats: modifiedStats as unknown as Record<string, number>,
    skills,
    traits: [...traits, ...racialTraits, ...weaponRestrictionTraits], // Combine class, racial, and weapon restriction traits
    inventory,
    armorClass: derived.armorClass,
    level: 1,
    experience: 0,
    conditions: [],
    spells: [],
    portraitUrl: getPortraitUrl(className as 'warrior' | 'mage' | 'rogue' | 'bard' | 'paladin' | 'ranger' | 'druid' | 'monk' | 'warlock', race, gender), // Set portrait based on selection
    portraitSeed: Math.floor(Math.random() * 1000000),
    skillPoints: 0,
    featPoints: 0,
    reputation: 0,
    wealth: Math.floor(Math.random() * 50) + 25, // 25-75 starting gold
    ...physicalAttributes,
    creationChoices: {
      statMethod,
      pointsSpent: statMethod === 'point_buy' ? calculatePointsSpent(modifiedStats) : 0
    },
    ...customOptions
  };
  
  // Generate backstory if requested
  if (generateBackstory) {
    try {
      const backstory = await generateAIBackstory(baseCharacter);
      baseCharacter.backstory = {
        ...backstory,
        generated: true
      };
    } catch (error) {
      console.warn('Failed to generate backstory:', error);
      // Fallback to empty backstory
      baseCharacter.backstory = { 
        generated: false, 
        bonds: [], 
        ideals: [], 
        fears: [] 
      };
    }
  }
  
  return baseCharacter;
}

/**
 * Generiert physische Attribute
 */
function generatePhysicalAttributes() {
  const ages = [18, 19, 20, 21, 22, 25, 30, 35, 40];
  const hairColors = ['schwarz', 'braun', 'blond', 'rot', 'grau', 'weiß'];
  const eyeColors = ['braun', 'blau', 'grün', 'grau', 'haselnuss', 'bernstein'];
  const skinTones = ['blass', 'hell', 'mittel', 'olive', 'dunkel', 'sehr dunkel'];
  
  const baseHeight = 160 + Math.floor(Math.random() * 40); // 160-200cm
  const baseWeight = 50 + Math.floor(Math.random() * 50); // 50-100kg
  
  return {
    age: ages[Math.floor(Math.random() * ages.length)],
    height: `${baseHeight} cm`,
    weight: `${baseWeight} kg`,
    hair: hairColors[Math.floor(Math.random() * hairColors.length)],
    eyes: eyeColors[Math.floor(Math.random() * eyeColors.length)],
    skin: skinTones[Math.floor(Math.random() * skinTones.length)]
  };
}

/**
 * Berechnet verwendete Point-Buy Punkte
 */
function calculatePointsSpent(stats: StatDistribution): number {
  return Object.values(stats).reduce((total, value) => {
    return total + (POINT_BUY_COSTS[value] || 0);
  }, 0);
}

/**
 * Validiert Charakterdaten
 */
export function validateCharacter(character: Partial<Character>): string[] {
  const errors: string[] = [];
  
  if (!character.name || character.name.trim().length < 2) {
    errors.push("Name muss mindestens 2 Zeichen lang sein");
  }
  
  if (!character.cls || character.cls.trim().length === 0) {
    errors.push("Klasse ist erforderlich");
  }
  
  if (character.hp !== undefined && character.hp < 1) {
    errors.push("Trefferpunkte müssen mindestens 1 betragen");
  }
  
  if (character.stats) {
    const statValues = Object.values(character.stats);
    if (statValues.some(val => val < 3 || val > 18)) {
      errors.push("Attributswerte müssen zwischen 3 und 18 liegen");
    }
  }
  
  return errors;
}

/**
 * Exportiert Charakter als JSON
 */
export function exportCharacter(character: Character): string {
  return JSON.stringify(character, null, 2);
}

/**
 * Importiert Charakter aus JSON
 */
export function importCharacter(json: string): Character | null {
  try {
    const parsed = JSON.parse(json);
    const errors = validateCharacter(parsed);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    return parsed as Character;
  } catch (error) {
    console.error('Fehler beim Importieren des Charakters:', error);
    return null;
  }
}