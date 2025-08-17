// lib/character/itemGenerator.ts

import { InventoryItem, type Character } from '@/schemas/character';

export interface ItemTemplate {
  name: string;
  type: InventoryItem['type'];
  subtype?: InventoryItem['subtype'];
  rarity: InventoryItem['rarity'];
  description: string;
  effects: InventoryItem['effects'];
  value: number;
  weight: number;
  requiresAttunement?: boolean;
  prerequisites?: string[];
}

export const itemDatabase: Record<string, ItemTemplate> = {
  // Common Weapons
  'kurzschwert': {
    name: 'Kurzschwert',
    type: 'weapon',
    rarity: 'common',
    description: '1d6+DEX Schaden, finesse, leicht',
    effects: [
      { type: 'damage_bonus', value: '1d6', description: 'Piercingschaden + DEX Modifier' }
    ],
    value: 10,
    weight: 2
  },
  'langschwert': {
    name: 'Langschwert',
    type: 'weapon', 
    rarity: 'common',
    description: '1d8+STR Schaden, vielseitig (1d10 beidhändig)',
    effects: [
      { type: 'damage_bonus', value: '1d8', description: 'Slashingschaden + STR Modifier' }
    ],
    value: 15,
    weight: 3
  },
  'kriegshammer': {
    name: 'Kriegshammer',
    type: 'weapon',
    rarity: 'common',
    description: '1d8+STR Schaden, vielseitig (1d10 beidhändig)',
    effects: [
      { type: 'damage_bonus', value: '1d8', description: 'Bluntschaden + STR Modifier' }
    ],
    value: 15,
    weight: 4
  },
  'dolch': {
    name: 'Dolch',
    type: 'weapon',
    rarity: 'common', 
    description: '1d4+DEX Schaden, finesse, leicht, werfbar (20/60 ft)',
    effects: [
      { type: 'damage_bonus', value: '1d4', description: 'Piercingschaden + DEX Modifier' }
    ],
    value: 2,
    weight: 1
  },
  'kurzbogen': {
    name: 'Kurzbogen',
    type: 'weapon',
    rarity: 'common',
    description: '1d6+DEX Schaden, Reichweite 80/320 ft, Munition',
    effects: [
      { type: 'damage_bonus', value: '1d6', description: 'Piercingschaden + DEX Modifier' }
    ],
    value: 25,
    weight: 2
  },
  'langbogen': {
    name: 'Langbogen', 
    type: 'weapon',
    rarity: 'common',
    description: '1d8+DEX Schaden, Reichweite 150/600 ft, Munition, schwer',
    effects: [
      { type: 'damage_bonus', value: '1d8', description: 'Piercingschaden + DEX Modifier' }
    ],
    value: 50,
    weight: 3
  },

  // Uncommon Weapons
  'flammenschwert': {
    name: 'Flammenschwert +1',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Magisches Langschwert das bei Kommando in Flammen aufgeht',
    effects: [
      { type: 'damage_bonus', value: '1d8+1', description: 'Slashingschaden + STR Modifier + 1' },
      { type: 'damage_bonus', value: '1d4', description: 'Zusätzlicher Feuerschaden' }
    ],
    value: 300,
    weight: 3,
    requiresAttunement: true
  },
  'elfenbogen': {
    name: 'Elfenbogen der Präzision',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Eleganter Bogen der die Treffsicherheit erhöht',
    effects: [
      { type: 'damage_bonus', value: '1d8+1', description: 'Piercingschaden + DEX Modifier + 1' },
      { type: 'stat_bonus', value: 2, description: '+2 auf Angriffswürfe' }
    ],
    value: 400,
    weight: 2,
    requiresAttunement: true
  },

  // Armor
  'lederruestung': {
    name: 'Lederrüstung',
    type: 'armor',
    rarity: 'common',
    description: 'RK 11 + DEX Modifier, leicht',
    effects: [
      { type: 'stat_bonus', value: 11, description: 'Grundrüstungsklasse + DEX Modifier' }
    ],
    value: 10,
    weight: 10
  },
  'schuppenpanzer': {
    name: 'Schuppenpanzer',
    type: 'armor',
    rarity: 'common', 
    description: 'RK 14 + DEX (max 2), medium',
    effects: [
      { type: 'stat_bonus', value: 14, description: 'Grundrüstungsklasse + DEX Modifier (max 2)' }
    ],
    value: 50,
    weight: 45
  },
  'plattenpanzer': {
    name: 'Plattenpanzer',
    type: 'armor',
    rarity: 'common',
    description: 'RK 18, schwer, Stärke 15 erforderlich',
    effects: [
      { type: 'stat_bonus', value: 18, description: 'Grundrüstungsklasse (kein DEX Bonus)' }
    ],
    value: 1500,
    weight: 65,
    prerequisites: ['Stärke 15']
  },

  // Consumables
  'heiltrank': {
    name: 'Heiltrank',
    type: 'consumable',
    rarity: 'common',
    description: 'Heilt 2d4+2 Trefferpunkte',
    effects: [
      { type: 'spell', value: '2d4+2', description: 'Heilt sofort Trefferpunkte' }
    ],
    value: 50,
    weight: 0.5
  },
  'grosser_heiltrank': {
    name: 'Großer Heiltrank',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'Heilt 4d4+4 Trefferpunkte',
    effects: [
      { type: 'spell', value: '4d4+4', description: 'Heilt sofort Trefferpunkte' }
    ],
    value: 200,
    weight: 1
  },
  'manatrank': {
    name: 'Manatrank',
    type: 'consumable',
    rarity: 'common', 
    description: 'Stellt 1d4+1 Manapunkte wieder her',
    effects: [
      { type: 'spell', value: '1d4+1', description: 'Stellt Manapunkte wieder her' }
    ],
    value: 60,
    weight: 0.5
  },
  'staerketrank': {
    name: 'Trank der Stärke',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'Verleiht 1 Stunde lang +2 Stärke',
    effects: [
      { type: 'stat_bonus', value: 2, description: '+2 Stärke für 1 Stunde' }
    ],
    value: 150,
    weight: 0.5
  },

  // Tools
  'dietriche': {
    name: 'Dietriche',
    type: 'tool',
    rarity: 'common',
    description: 'Professionelle Werkzeuge zum Schlösser knacken',
    effects: [
      { type: 'stat_bonus', value: 2, description: '+2 auf Schlösser knacken' }
    ],
    value: 25,
    weight: 1
  },
  'meisterdietriche': {
    name: 'Meister-Dietriche',
    type: 'tool',
    rarity: 'rare',
    description: 'Magische Dietriche die fast jedes Schloss öffnen können',
    effects: [
      { type: 'stat_bonus', value: 5, description: '+5 auf Schlösser knacken' },
      { type: 'passive', value: 'ignore_magic', description: 'Kann magische Schlösser knacken' }
    ],
    value: 500,
    weight: 1,
    requiresAttunement: true
  },
  'seil': {
    name: 'Hanfseil (15m)',
    type: 'tool',
    rarity: 'common',
    description: 'Starkes Seil für Klettern und andere Zwecke',
    effects: [],
    value: 2,
    weight: 10
  },

  // Rare Items
  'ring_des_schutzes': {
    name: 'Ring des Schutzes +1',
    type: 'misc',
    rarity: 'rare',
    description: 'Verleiht magischen Schutz vor Angriffen',
    effects: [
      { type: 'stat_bonus', value: 1, description: '+1 Rüstungsklasse' },
      { type: 'stat_bonus', value: 1, description: '+1 auf Rettungswürfe' }
    ],
    value: 3500,
    weight: 0,
    requiresAttunement: true
  },
  'amulett_der_gesundheit': {
    name: 'Amulett der Gesundheit',
    type: 'misc',
    rarity: 'rare',
    description: 'Setzt die Konstitution auf 19',
    effects: [
      { type: 'stat_bonus', value: 19, description: 'Konstitution wird auf 19 gesetzt' }
    ],
    value: 8000,
    weight: 1,
    requiresAttunement: true
  },

  // Epic Items
  'vorpal_schwert': {
    name: 'Vorpal-Schwert +3',
    type: 'weapon',
    rarity: 'epic',
    description: 'Legendäres Schwert das bei kritischen Treffern köpft',
    effects: [
      { type: 'damage_bonus', value: '1d8+3', description: 'Slashingschaden + STR Modifier + 3' },
      { type: 'passive', value: 'vorpal', description: 'Natürliche 20 köpft Kreaturen mit <100 HP' }
    ],
    value: 50000,
    weight: 3,
    requiresAttunement: true
  },

  // Quest Items
  'antiker_schluessel': {
    name: 'Antiker Schlüssel',
    type: 'quest',
    rarity: 'uncommon',
    description: 'Ein rätselhafter Schlüssel mit unbekannten Runen',
    effects: [
      { type: 'passive', value: 'quest', description: 'Öffnet spezielle Türen und Truhen' }
    ],
    value: 0,
    weight: 0.1
  },
  'drachenei': {
    name: 'Drachenei',
    type: 'quest',
    rarity: 'legendary',
    description: 'Ein versteinerte Drachenei mit schwacher magischer Aura',
    effects: [
      { type: 'passive', value: 'dragon_egg', description: 'Könnte unter den richtigen Umständen schlüpfen' }
    ],
    value: 100000,
    weight: 50
  },

  // Valuables
  'rubin': {
    name: 'Rubin',
    type: 'valuable',
    rarity: 'uncommon',
    description: 'Ein perfekt geschliffener roter Edelstein',
    effects: [],
    value: 500,
    weight: 0
  },
  'diamant': {
    name: 'Diamant',
    type: 'valuable',
    rarity: 'rare', 
    description: 'Ein lupenreiner Diamant von außergewöhnlicher Größe',
    effects: [],
    value: 2000,
    weight: 0
  }
};

/**
 * Generiert zufällige Beute basierend auf Begegnungstyp und Level
 */
export function generateLoot(
  encounterType: 'weak' | 'normal' | 'strong' | 'boss',
  partyLevel: number,
  quantity: number = 1
): InventoryItem[] {
  const loot: InventoryItem[] = [];
  const rarityPools = getRarityPoolsForEncounter(encounterType, partyLevel);
  
  for (let i = 0; i < quantity; i++) {
    const rarity = selectWeightedRarity(rarityPools);
    const items = getItemsByRarity(rarity);
    
    if (items.length > 0) {
      const template = items[Math.floor(Math.random() * items.length)];
      loot.push(createItemFromTemplate(template));
    }
  }
  
  return loot;
}

/**
 * Erstellt Item aus Template
 */
function createItemFromTemplate(template: ItemTemplate): InventoryItem {
  return {
    name: template.name,
    type: template.type,
    subtype: template.subtype || 'none',
    location: 'inventory',
    rarity: template.rarity,
    quantity: 1,
    description: template.description,
    equipped: false,
    effects: [...template.effects],
    value: template.value,
    weight: template.weight
  };
}

/**
 * Bestimmt Seltenheitspools basierend auf Begegnung und Level
 */
function getRarityPoolsForEncounter(
  encounterType: string,
  level: number
): Record<InventoryItem['rarity'], number> {
  const basePools = {
    common: 70,
    uncommon: 25,
    rare: 4,
    epic: 1,
    legendary: 0
  };
  
  // Anpassungen basierend auf Encounter-Typ
  switch (encounterType) {
    case 'weak':
      return {
        common: 90,
        uncommon: 10,
        rare: 0,
        epic: 0,
        legendary: 0
      };
    case 'strong':
      return {
        common: 50,
        uncommon: 35,
        rare: 12,
        epic: 3,
        legendary: 0
      };
    case 'boss':
      return {
        common: 30,
        uncommon: 40,
        rare: 20,
        epic: 8,
        legendary: level >= 15 ? 2 : 0
      };
    default:
      return basePools;
  }
}

/**
 * Wählt zufällige Seltenheit basierend auf Gewichtung
 */
function selectWeightedRarity(pools: Record<InventoryItem['rarity'], number>): InventoryItem['rarity'] {
  const total = Object.values(pools).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * total;
  
  for (const [rarity, weight] of Object.entries(pools)) {
    random -= weight;
    if (random <= 0) {
      return rarity as InventoryItem['rarity'];
    }
  }
  
  return 'common';
}

/**
 * Holt alle Items einer bestimmten Seltenheit
 */
function getItemsByRarity(rarity: InventoryItem['rarity']): ItemTemplate[] {
  return Object.values(itemDatabase).filter(item => item.rarity === rarity);
}

/**
 * Generiert Startausrüstung für eine Klasse
 */
export function generateStartingGear(className: string): InventoryItem[] {
  const startingGear: Record<string, string[]> = {
    warrior: ['langschwert', 'lederruestung', 'heiltrank', 'seil'],
    mage: ['dolch', 'manatrank', 'manatrank', 'antiker_schluessel'],
    rogue: ['kurzschwert', 'dolch', 'dietriche', 'seil', 'heiltrank'],
    ranger: ['kurzbogen', 'dolch', 'lederruestung', 'seil'],
    cleric: ['kriegshammer', 'schuppenpanzer', 'heiltrank', 'heiltrank']
  };
  
  const gearList = startingGear[className.toLowerCase()] || startingGear.warrior;
  
  return gearList.map(itemKey => {
    const template = itemDatabase[itemKey];
    if (!template) {
      console.warn(`Item template not found: ${itemKey}`);
      return null;
    }
    return createItemFromTemplate(template);
  }).filter(Boolean) as InventoryItem[];
}

/**
 * Berechnet Gesamtwert des Inventars
 */
export function calculateInventoryValue(inventory: InventoryItem[]): number {
  return inventory.reduce((total, item) => total + (item.value * item.quantity), 0);
}

/**
 * Berechnet Gesamtgewicht des Inventars
 */
export function calculateInventoryWeight(inventory: InventoryItem[]): number {
  return inventory.reduce((total, item) => total + (item.weight * item.quantity), 0);
}

/**
 * Überprüft ob Charakter Item nutzen kann
 */
export function canUseItem(item: InventoryItem, character: Pick<Character, 'stats'>): { canUse: boolean; reason?: string } {
  const template = itemDatabase[item.name.toLowerCase().replace(/\s+/g, '_')];
  
  if (!template) return { canUse: true };
  
  if (template.prerequisites) {
    for (const prereq of template.prerequisites) {
      // Prüfe Attributsvoraussetzungen
      const match = prereq.match(/(Stärke|Geschicklichkeit|Konstitution|Intelligenz|Weisheit|Charisma)\s+(\d+)/);
      if (match) {
        const [, stat, minValue] = match;
        const statMap = {
          'Stärke': 'strength',
          'Geschicklichkeit': 'dexterity', 
          'Konstitution': 'constitution',
          'Intelligenz': 'intelligence',
          'Weisheit': 'wisdom',
          'Charisma': 'charisma'
        };
        const statValue = character.stats?.[statMap[stat as keyof typeof statMap]] || 10;
        if (statValue < parseInt(minValue)) {
          return { canUse: false, reason: `Benötigt ${prereq}` };
        }
      }
    }
  }
  
  return { canUse: true };
}

/**
 * Wendet Item-Effekte auf Charakter an
 */
export function applyItemEffects<T extends object>(item: InventoryItem, character: T): T {
  const updatedCharacter = { ...character } as T;
  
  item.effects.forEach(effect => {
    switch (effect.type) {
      case 'stat_bonus':
        // Implementierung abhängig vom spezifischen Effekt
        break;
      case 'damage_bonus':
        // Für Waffen - wird beim Angriff angewendet
        break;
      case 'resistance':
        // Schadenresistenz hinzufügen
        break;
      case 'spell':
        // Zaubereffekt anwenden (z.B. Heilung)
        break;
    }
  });
  
  return updatedCharacter;
}

/**
 * Exportiert Inventar als lesbare Liste
 */
export function exportInventorySummary(inventory: InventoryItem[]): string {
  const byType = inventory.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);
  
  let summary = '';
  Object.entries(byType).forEach(([type, items]) => {
    summary += `\n**${type.toUpperCase()}:**\n`;
    items.forEach(item => {
      const qty = item.quantity > 1 ? ` x${item.quantity}` : '';
      const equipped = item.equipped ? ' (angelegt)' : '';
      summary += `• ${item.name}${qty}${equipped}\n`;
      if (item.description) {
        summary += `  ${item.description}\n`;
      }
    });
  });
  
  return summary.trim();
}