// lib/character/characterGenerator.ts

import { Character, Skill, Trait, InventoryItem, Race, Gender, Quest } from '@/schemas/character';
import { skillDefinitions, SkillName, spellDefinitions } from './skillSystem';
import { generateAIBackstory } from './backstoryGenerator';
import { applyRacialBonuses, getRacialTraits } from './raceSystem';
import { getClassWeaponInfo } from './classWeaponSystem';
import { getPortraitUrl } from './portraitSystem';
// Entfernt: Doppelter Import von itemTemplates

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
  startingSpells?: string[];
  hpMultiplier: number;
  mpMultiplier: number;
}

export const characterClasses: Record<string, CharacterClass> = {
  warrior: {
    name: "Krieger",
    description: "Krieger sind die unerschütterlichen Bollwerke auf dem Schlachtfeld. Sie sind Meister aller Waffen, von scharfen Schwertern bis zu schweren Äxten, und tragen die stärksten Rüstungen. Ihre Ausbildung konzentriert sich auf rohe Stärke, Ausdauer und taktisches Geschick. Ein Krieger ist immer an vorderster Front zu finden, um seine Verbündeten zu schützen und Feinde mit überwältigender Kraft zu vernichten.",
    primaryStats: ["strength", "constitution"],
    startingSkills: ["melee_combat", "athletics", "intimidation"],
    startingTraits: ["combat_training", "weapon_expertise"],
    startingItems: ["langschwert", "kurzschwert", "schild", "kettenhemd", "heiltrank"],
    startingSpells: ["klingenschild"],
    hpMultiplier: 1.3,
    mpMultiplier: 0.8
  },
  mage: {
    name: "Magier",
    description: "Magier sind Gelehrte der arkanen Künste, die die Realität durch das Wirken mächtiger Zaubersprüche formen. Sie verbringen Jahre mit dem Studium alter Folianten und dem Entschlüsseln mystischer Geheimnisse. Obwohl sie im direkten Kampf verletzlich sind, können sie aus der Ferne verheerenden Schaden anrichten, ihre Verbündeten schützen oder das Schlachtfeld mit Illusionen und Kontrollelementen manipulieren.",
    primaryStats: ["intelligence", "wisdom"],
    startingSkills: ["arcane_knowledge", "spell_focus", "investigation"],
    startingTraits: ["arcane_sight", "spell_knowledge"],
    startingItems: ["stab", "dolch", "stoffruestung", "manatrank"],
    startingSpells: ["feuerball", "magisches_geschoss", "schild"],
    hpMultiplier: 0.8,
    mpMultiplier: 1.5
  },
  rogue: {
    name: "Schurke",
    description: "Schurken sind Meister der Schatten, der Täuschung und des präzisen Angriffs. Sie bewegen sich ungesehen, entschärfen Fallen und öffnen verschlossene Türen mit Leichtigkeit. Im Kampf nutzen sie ihre Agilität und ihr schnelles Denken, um die Schwachstellen ihrer Feinde auszunutzen. Ein Schurke verlässt sich lieber auf List und Tücke als auf rohe Gewalt und ist ein unverzichtbarer Meister der verdeckten Operationen.",
    primaryStats: ["dexterity", "intelligence"],
    startingSkills: ["stealth", "lockpicking", "sleight_of_hand"],
    startingTraits: ["sneak_attack", "nimble"],
    startingItems: ["kurzschwert", "dolch", "lederruestung", "diebeswerkzeug", "heiltrank"],
    hpMultiplier: 1.0,
    mpMultiplier: 1.0
  },
  ranger: {
    name: "Waldläufer",
    description: "Waldläufer sind die unübertroffenen Meister der Wildnis. Sie sind erfahrene Jäger, Spurenleser und Überlebenskünstler, die eine tiefe Verbindung zur Natur haben. Mit Bogen und Pfeil sind sie aus der Ferne tödlich und oft von einem treuen Tiergefährten begleitet. Ihre Fähigkeiten machen sie zu exzellenten Fährtensuchern und Beschützern der unberührten Gebiete der Welt.",
    primaryStats: ["dexterity", "wisdom"],
    startingSkills: ["survival", "nature_lore", "ranged_combat"],
    startingTraits: ["nature_bond", "tracking"],
    startingItems: ["langbogen", "kurzbogen", "pfeile", "lederruestung", "heiltrank"],
    startingSpells: ["giftpfeil", "dornenpfeil"],
    hpMultiplier: 1.1,
    mpMultiplier: 1.1
  },
  
  bard: {
    name: "Barde",
    description: "Barden sind charismatische Künstler, deren Magie in ihren Liedern, Geschichten und Darbietungen liegt. Sie sind die Seele jeder Abenteurergruppe, inspirieren ihre Verbündeten mit heldenhaften Balladen und schwächen ihre Feinde mit entmutigenden Versen. Mit ihrer scharfen Zunge und ihrem schnellen Verstand können sie Konflikte oft ohne einen einzigen Schwerthieb lösen.",
    primaryStats: ["charisma", "dexterity"],
    startingSkills: ["performance", "persuasion", "deception"],
    startingTraits: ["silver_tongue", "inspiration"],
    startingItems: ["rapier", "dolch", "lederruestung", "laute", "manatrank"],
    hpMultiplier: 1.0,
    mpMultiplier: 1.2
  },
  paladin: {
    name: "Paladin",
    description: "Paladine sind heilige Krieger, die einem göttlichen Eid verpflichtet sind. Sie kanalisieren die Macht ihres Glaubens, um die Unschuldigen zu schützen, das Böse zu vernichten und das Licht der Hoffnung in die dunkelsten Ecken der Welt zu tragen. Ihre Fähigkeiten kombinieren Kampfkunst mit heilender und schützender Magie, was sie zu standhaften Verteidigern und Anführern macht.",
    primaryStats: ["strength", "charisma"],
    startingSkills: ["divine_magic", "melee_combat", "insight"],
    startingTraits: ["divine_smite", "lay_on_hands"],
    startingItems: ["langschwert", "kriegshammer", "schild", "kettenhemd", "heiligensymbol"],
    startingSpells: ["heilung", "schutz_vor_boesem"],
    hpMultiplier: 1.2,
    mpMultiplier: 1.1
  },
  druid: {
    name: "Druide",
    description: "Druiden sind die Wächter der Natur und schöpfen ihre Macht aus der Essenz der Wildnis. Sie können die Gestalt von Tieren annehmen, Pflanzen kontrollieren und die Elemente befehligen. Ihre Magie ist sowohl schöpferisch als auch zerstörerisch, immer im Gleichgewicht mit der Natur. Ein Druide ist ein weiser Ratgeber und ein furchterregender Gegner für alle, die das natürliche Gleichgewicht stören.",
    primaryStats: ["wisdom", "constitution"],
    startingSkills: ["nature_lore", "animal_handling", "survival"],
    startingTraits: ["wild_shape", "nature_magic"],
    startingItems: ["stab", "keule", "lederruestung", "kraeuterbeutel", "heiltrank"],
    startingSpells: ["dornenpeitsche", "heilen"],
    hpMultiplier: 1.1,
    mpMultiplier: 1.2
  },
  monk: {
    name: "Mönch",
    description: "Mönche sind disziplinierte Kampfkünstler, die ihren Körper und Geist zur Perfektion trainiert haben. Sie benötigen keine Waffen, denn ihre Hände und Füße sind tödlicher als jedes Schwert. Durch die Kontrolle ihrer Lebensenergie, auch Ki genannt, können sie übermenschliche Leistungen vollbringen, wie zum Beispiel pfeilschnelle Schlagkombinationen ausführen oder magischen Angriffen widerstehen.",
    primaryStats: ["dexterity", "wisdom"],
    startingSkills: ["acrobatics", "athletics", "insight"],
    startingTraits: ["unarmored_defense", "flurry_of_blows"],
    startingItems: ["kurzschwert", "speer", "wurfpfeile", "heiltrank"],
    hpMultiplier: 1.1,
    mpMultiplier: 1.0
  },
  warlock: {
    name: "Hexenmeister",
    description: "Hexenmeister gehen einen Pakt mit mächtigen, oft mysteriösen Wesenheiten ein, um Zugang zu arkaner Macht zu erhalten. Ihre Magie ist ein Geschenk oder ein Handel und oft unheimlicher Natur. Sie verlassen sich auf wenige, aber starke Zauber und unheimliche Fähigkeiten, die ihnen von ihrem Patron verliehen werden. Ein Hexenmeister wandelt auf einem schmalen Grat zwischen Kontrolle und dem Wahnsinn, den seine Macht mit sich bringen kann.",
    primaryStats: ["charisma", "constitution"],
    startingSkills: ["arcane_knowledge", "deception", "intimidation"],
    startingTraits: ["eldritch_blast", "dark_ones_blessing"],
    startingItems: ["dolch", "leichte_armbrust", "stoffruestung", "zauberfokus", "manatrank"],
    startingSpells: ["schauriger_strahl", "hexenpfeil"],
    hpMultiplier: 1.0,
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
  },
  silver_tongue: {
    name: "Silberzunge",
    description: "+2 Bonus auf Überzeugen und Täuschen.",
    type: "class",
    effects: [{ type: "skill_bonus", value: 2, target: "persuasion" }, { type: "skill_bonus", value: 2, target: "deception" }],
    prerequisites: []
  },
  inspiration: {
    name: "Inspiration",
    description: "Kann Verbündeten einen Bonus auf einen Wurf geben.",
    type: "class",
    effects: [{ type: "special_ability", value: "inspiration", target: "ally" }],
    prerequisites: []
  },
  divine_smite: {
    name: "Göttliches Niederstrecken",
    description: "Verbraucht einen Zauberslot, um zusätzlichen gleißenden Schaden zu verursachen.",
    type: "class",
    effects: [{ type: "special_ability", value: "divine_smite", target: "melee_attack" }],
    prerequisites: []
  },
  lay_on_hands: {
    name: "Handauflegen",
    description: "Kann eine begrenzte Menge an Trefferpunkten pro Tag heilen.",
    type: "class",
    effects: [{ type: "special_ability", value: "lay_on_hands", target: "healing" }],
    prerequisites: []
  },
  wild_shape: {
    name: "Tiergestalt",
    description: "Kann sich in ein Tier verwandeln.",
    type: "class",
    effects: [{ type: "special_ability", value: "wild_shape", target: "self" }],
    prerequisites: []
  },
  nature_magic: {
    name: "Naturmagie",
    description: "+2 Bonus auf Naturmagie.",
    type: "class",
    effects: [{ type: "skill_bonus", value: 2, target: "nature_magic" }],
    prerequisites: []
  },
  unarmored_defense: {
    name: "Ungepanzerte Verteidigung",
    description: "Rüstungsklasse basiert auf Geschicklichkeit und Weisheit, wenn keine Rüstung getragen wird.",
    type: "class",
    effects: [{ type: "special_ability", value: "unarmored_defense", target: "ac" }],
    prerequisites: []
  },
  flurry_of_blows: {
    name: "Schlaghagel",
    description: "Kann nach einem Angriff einen zusätzlichen unbewaffneten Schlag ausführen.",
    type: "class",
    effects: [{ type: "special_ability", value: "flurry_of_blows", target: "bonus_action" }],
    prerequisites: []
  },
  eldritch_blast: {
    name: "Schauriger Strahl",
    description: "Ein mächtiger magischer Angriff.",
    type: "class",
    effects: [{ type: "special_ability", value: "eldritch_blast", target: "ranged_spell_attack" }],
    prerequisites: []
  },
  dark_ones_blessing: {
    name: "Segen des Dunklen",
    description: "Erhält temporäre Trefferpunkte, wenn ein Feind getötet wird.",
    type: "class",
    effects: [{ type: "special_ability", value: "dark_ones_blessing", target: "on_kill" }],
    prerequisites: []
  }
};

import { itemTemplates } from './itemGenerator';

/**
 * Point-Buy Kosten für Attributswerte
 */
const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5,
  14: 7, 15: 9, 16: 12, 17: 15, 18: 19
};

/**
 * Generiert Start-Zauber basierend auf Klasse und Rasse
 */
export function generateStartingSpells(className: string, race: Race): Array<{name: string; cost: number; description: string; school: string; type: string}> {
  const classData = characterClasses[className.toLowerCase()];
  if (!classData) return [];

  const allowedSpells = Object.entries(spellDefinitions).filter(([, spellDef]) => {
    const classAllowed = spellDef.allowedClasses.length === 0 || spellDef.allowedClasses.includes(className.toLowerCase());
    const raceAllowed = spellDef.allowedRaces.length === 0 || spellDef.allowedRaces.includes(race);
    return classAllowed && raceAllowed;
  });

  // Nimm eine Auswahl an Zaubern, die zur Klasse passen
  const startingSpells = (classData.startingSpells || []).map(spellName => spellDefinitions[spellName]).filter(Boolean);

  // Füge Rassen-spezifische Zauber hinzu
  const racialSpells = allowedSpells
    .filter(([, spellDef]) => spellDef.allowedRaces.includes(race))
    .map(([, spellDef]) => spellDef);

  // Kombiniere und entferne Duplikate
  const allSpells = [...startingSpells, ...racialSpells];
  const uniqueSpells = Array.from(new Set(allSpells.map(s => s.name)))
    .map(name => allSpells.find(s => s.name === name));

  return uniqueSpells.filter((spell): spell is NonNullable<typeof spell> => Boolean(spell)).map(spell => ({
    name: spell.name,
    cost: spell.cost,
    description: spell.description,
    school: spell.school,
    type: spell.type
  }));
}

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

export function generateStartingQuests(className: string): Quest[] {
  const classQuests: Record<string, Quest[]> = {
    warrior: [
      { title: 'Beweise deine Stärke', status: 'open', note: 'Besiege 10 Goblins in den Wäldern.' },
      { title: 'Die Schmiede ruft', status: 'open', note: 'Sammle 5 Eisenerz, um deine Waffe zu verbessern.' },
    ],
    mage: [
      { title: 'Verlorenes Wissen', status: 'open', note: 'Finde das vermisste Zauberbuch in der alten Bibliothek.' },
      { title: 'Magische Zutaten', status: 'open', note: 'Sammle 3 Mondblumen für ein seltenes Ritual.' },
    ],
    rogue: [
      { title: 'Die Gilde der Schatten', status: 'open', note: 'Stiehl den goldenen Kelch aus dem Haus des Bürgermeisters.' },
      { title: 'Eine Nachricht für einen Freund', status: 'open', note: 'Überbringe eine geheime Nachricht an den Kontakt in der Taverne.' },
    ],
  };

  return classQuests[className.toLowerCase()] || [];
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
 * Generiert Startausrüstung basierend auf Klasse und Schwierigkeitsgrad
 */
export function generateStartingInventory(
  className: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  customEquipment?: string[]
): InventoryItem[] {
  const classData = characterClasses[className.toLowerCase()];
  if (!classData) return [];

  const startingItems = customEquipment || [...classData.startingItems];

  // Passe die Ausrüstung basierend auf dem Schwierigkeitsgrad an
  if (difficulty === 'beginner') {
    // Füge einen zusätzlichen Heiltrank für Anfänger hinzu
    if (itemTemplates['heiltrank']) {
      startingItems.push('heiltrank');
    }
  } else if (difficulty === 'advanced') {
    // Entferne einen Heiltrank für Fortgeschrittene, falls vorhanden
    const potionIndex = startingItems.indexOf('heiltrank');
    if (potionIndex > -1) {
      startingItems.splice(potionIndex, 1);
    }
  }

  return startingItems.map((itemKey) => {
    const template = itemTemplates[itemKey];
    if (!template) {
      console.warn(`Item template not found: ${itemKey}`);
      return null;
    }

    const item: InventoryItem = {
      name: template.name,
      type: template.type,
      subtype: template.subtype || 'none',
      location: 'inventory',
      rarity: template.rarity,
      quantity: 1,
      description: template.description,
      equipped: false,
      effects: template.effects || [],
      value: template.value,
      weight: template.weight,
    };

    // Auto-equip all starting items
    item.equipped = true;
    item.location = 'equipped';

    return item;
  }).filter(Boolean) as InventoryItem[];
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

import { PredefinedCampaign } from '@/lib/state/gameStore';

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
    customEquipment?: string[];
    customOptions?: Partial<Character>;
    campaign?: PredefinedCampaign;
  } = {}
): Promise<Character> {
  const {
    race = 'human',
    gender = 'male',
    statMethod = 'point_buy',
    generateBackstory = true,
    customStats,
    customEquipment,
    customOptions = {},
    campaign = undefined
  } = options;
  
  const id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Generate base stats and apply racial modifiers
  const baseStats = customStats || generateStats(className, statMethod);
  const modifiedStats = applyRacialBonuses(baseStats, race);
  
  const skills = generateStartingSkills(className);
  const traits = generateTraits(className);
  const racialTraits = getRacialTraits(race);
  const weaponRestrictionTraits = generateWeaponRestrictionTraits(className);
  const inventory = generateStartingInventory(className, campaign?.difficulty, customEquipment);
  const quests = generateStartingQuests(className);
  const derived = calculateDerivedStats(modifiedStats, className);
  const spells = generateStartingSpells(className, race);
  
  // Generate physical attributes
  const physicalAttributes = generatePhysicalAttributes();
  
  const baseCharacter: Character = {
    id,
    name,
    cls: className.toLowerCase(),
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
    quests,
    armorClass: derived.armorClass,
    level: 1,
    experience: 0,
    conditions: [],
    spells: spells.map(spell => ({
      name: spell.name,
      description: spell.description,
      cost: spell.cost,
      level: 1,
      school: spell.school
    })),
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