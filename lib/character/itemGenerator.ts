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

export const itemTemplates: Record<string, ItemTemplate> = {
  

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
 * Bestimmt automatisch den korrekten Subtype basierend auf Item-Typ und Name
 */
function determineSubtype(template: ItemTemplate): InventoryItem['subtype'] {
  if (template.subtype && template.subtype !== 'none') {
    return template.subtype;
  }
  
  // Auto-bestimmung für Waffen
  if (template.type === 'weapon') {
    const name = template.name.toLowerCase();
    
    // Zweihändige Waffen
    if (name.includes('zweihänder') || name.includes('bogen') || name.includes('streitaxt') || 
        name.includes('hellebarde') || name.includes('kampfstab') || template.description.includes('zweihändig')) {
      return 'two_handed';
    }
    
    // Nebenhand-Waffen (kleine, leichte Waffen)
    if (name.includes('dolch') || name.includes('wurfmesser') || name.includes('stilett') ||
        template.description.includes('leicht')) {
      return 'off_hand';
    }
    
    // Standard: Haupthand
    return 'main_hand';
  }
  
  // Auto-bestimmung für Rüstung
  if (template.type === 'armor') {
    const name = template.name.toLowerCase();
    
    if (name.includes('helm')) return 'helmet';
    if (name.includes('brustpanzer') || name.includes('rüstung') || name.includes('panzer')) return 'chest';
    if (name.includes('beinschutz') || name.includes('hose')) return 'legs';
    if (name.includes('stiefel') || name.includes('schuhe')) return 'feet';
    if (name.includes('handschuhe') || name.includes('stulpen')) return 'gloves';
    if (name.includes('umhang') || name.includes('mantel')) return 'cloak';
    if (name.includes('gürtel')) return 'belt';
    if (name.includes('ring')) return 'ring';
    if (name.includes('amulett') || name.includes('anhänger')) return 'amulet';
    
    // Standard Rüstung geht an Chest
    return 'chest';
  }
  
  return 'none';
}

/**
 * Erstellt Item aus Template
 */
function createItemFromTemplate(template: ItemTemplate): InventoryItem {
  return {
    name: template.name,
    type: template.type,
    subtype: determineSubtype(template),
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