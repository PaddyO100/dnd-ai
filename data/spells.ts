import type { CharacterClass, Spell } from '@/schemas/character';

export interface SpellData {
  id: string;
  name: string;
  nameDE: string;
  level: number;
  school: MagicSchool;
  castingTime: string;
  range: string;
  components: string[];
  duration: string;
  description: string;
  descriptionDE: string;
  allowedClasses: CharacterClass[];
  allowedRaces?: string[];
  manaCost: number;
  prerequisites?: string[];
  damageType?: DamageType;
  savingThrow?: string;
  concentration?: boolean;
  ritual?: boolean;
  comboPotential?: string[]; // IDs of spells that combo with this one
}

export type MagicSchool = 
  | 'abjuration'    // Schutzmagie
  | 'conjuration'   // Beschwörung
  | 'divination'    // Wahrsagung
  | 'enchantment'   // Verzauberung
  | 'evocation'     // Hervorrufung
  | 'illusion'      // Illusion
  | 'necromancy'    // Nekromantie
  | 'transmutation' // Verwandlung
  | 'elemental'     // Elementarmagie
  | 'divine'        // Göttliche Magie
  | 'nature'        // Naturmagie
  | 'arcane';       // Arkane Magie

export type DamageType = 
  | 'fire' | 'cold' | 'lightning' | 'thunder' | 'acid' | 'poison'
  | 'necrotic' | 'radiant' | 'force' | 'psychic'
  | 'slashing' | 'piercing' | 'bludgeoning';

// Comprehensive spell database organized by class
export const spellDatabase: Record<CharacterClass, SpellData[]> = {
  mage: [
    {
      id: 'fireball',
      name: 'Fireball',
      nameDE: 'Feuerball',
      level: 3,
      school: 'evocation',
      castingTime: '1 Action',
      range: '45 Meter',
      components: ['V', 'S', 'M'],
      duration: 'Sofort',
      description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.',
      descriptionDE: 'Ein heller Streifen blitzt von deinem Zeigefinger zu einem gewählten Punkt und explodiert in einem Flammenmeer.',
      allowedClasses: ['mage', 'warlock'],
      manaCost: 6,
      damageType: 'fire',
      savingThrow: 'Dexterity'
    },
    {
      id: 'magic_missile',
      name: 'Magic Missile',
      nameDE: 'Magisches Geschoss',
      level: 1,
      school: 'evocation',
      castingTime: '1 Action',
      range: '36 Meter',
      components: ['V', 'S'],
      duration: 'Sofort',
      description: 'You create three glowing darts of magical force that automatically hit their targets.',
      descriptionDE: 'Du erschaffst drei leuchtende Pfeile magischer Kraft, die ihre Ziele automatisch treffen.',
      allowedClasses: ['mage'],
      manaCost: 2
    },
    {
      id: 'lightning_bolt',
      name: 'Lightning Bolt',
      nameDE: 'Blitzschlag',
      level: 3,
      school: 'evocation',
      castingTime: '1 Action',
      range: '30 Meter Linie',
      components: ['V', 'S', 'M'],
      duration: 'Sofort',
      description: 'A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you.',
      descriptionDE: 'Ein Blitzstrahl formt eine 30 Meter lange und 1,5 Meter breite Linie von dir ausgehend.',
      allowedClasses: ['mage'],
      manaCost: 6,
      damageType: 'lightning',
      savingThrow: 'Dexterity'
    },
    {
      id: 'shield',
      name: 'Shield',
      nameDE: 'Schild',
      level: 1,
      school: 'abjuration',
      castingTime: '1 Reaction',
      range: 'Selbst',
      components: ['V', 'S'],
      duration: '1 Runde',
      description: 'An invisible barrier of magical force appears and protects you.',
      descriptionDE: 'Eine unsichtbare Barriere magischer Kraft erscheint und schützt dich.',
      allowedClasses: ['mage', 'warlock'],
      manaCost: 2
    },
    {
      id: 'teleport',
      name: 'Teleport',
      nameDE: 'Teleportation',
      level: 7,
      school: 'conjuration',
      castingTime: '1 Action',
      range: '3 Kilometer',
      components: ['V'],
      duration: 'Sofort',
      description: 'This spell instantly transports you and up to eight willing creatures of your choice.',
      descriptionDE: 'Dieser Zauber transportiert dich und bis zu acht willige Kreaturen deiner Wahl sofort.',
      allowedClasses: ['mage'],
      manaCost: 14,
      prerequisites: ['level_13']
    },
    {
      id: 'time_stop',
      name: 'Time Stop',
      nameDE: 'Zeitstop',
      level: 9,
      school: 'transmutation',
      castingTime: '1 Action',
      range: 'Selbst',
      components: ['V'],
      duration: 'Sofort',
      description: 'You briefly stop the flow of time for everyone but yourself.',
      descriptionDE: 'Du stoppst kurzzeitig den Zeitfluss für alle außer dir selbst.',
      allowedClasses: ['mage'],
      manaCost: 20,
      prerequisites: ['level_17']
    },
    {
      id: 'invisibility',
      name: 'Invisibility',
      nameDE: 'Unsichtbarkeit',
      level: 2,
      school: 'illusion',
      castingTime: '1 Action',
      range: 'Berührung',
      components: ['V', 'S', 'M'],
      duration: '1 Stunde',
      description: 'A creature you touch becomes invisible until the spell ends.',
      descriptionDE: 'Eine Kreatur, die du berührst, wird unsichtbar bis der Zauber endet.',
      allowedClasses: ['mage', 'bard'],
      manaCost: 4,
      concentration: true
    }
  ],

  warlock: [
    {
      id: 'eldritch_blast',
      name: 'Eldritch Blast',
      nameDE: 'Eldritch-Strahl',
      level: 0,
      school: 'evocation',
      castingTime: '1 Action',
      range: '36 Meter',
      components: ['V', 'S'],
      duration: 'Sofort',
      description: 'A beam of crackling energy streaks toward a creature within range.',
      descriptionDE: 'Ein Strahl knisternder Energie schießt auf eine Kreatur in Reichweite zu.',
      allowedClasses: ['warlock'],
      manaCost: 0,
      damageType: 'force',
      comboPotential: ['hex', 'curse_of_weakness']
    },
    {
      id: 'hex',
      name: 'Hex',
      nameDE: 'Fluch',
      level: 1,
      school: 'enchantment',
      castingTime: '1 Bonus Action',
      range: '27 Meter',
      components: ['V', 'S', 'M'],
      duration: '1 Stunde',
      description: 'You place a curse on a creature that you can see within range.',
      descriptionDE: 'Du belegst eine sichtbare Kreatur in Reichweite mit einem Fluch.',
      allowedClasses: ['warlock'],
      manaCost: 2,
      concentration: true,
      comboPotential: ['eldritch_blast']
    },
    {
      id: 'summon_demon',
      name: 'Summon Demon',
      nameDE: 'Dämon beschwören',
      level: 4,
      school: 'conjuration',
      castingTime: '1 Action',
      range: '18 Meter',
      components: ['V', 'S', 'M'],
      duration: '1 Stunde',
      description: 'You summon a fiend from the lower planes to serve you.',
      descriptionDE: 'Du beschwörst einen Unheilsbringer aus den niederen Ebenen, der dir dient.',
      allowedClasses: ['warlock'],
      manaCost: 8,
      concentration: true,
      prerequisites: ['pact_level_2']
    },
    {
      id: 'dark_vision',
      name: 'Dark Vision',
      nameDE: 'Dunkelsicht',
      level: 2,
      school: 'transmutation',
      castingTime: '1 Action',
      range: 'Berührung',
      components: ['V', 'S'],
      duration: '8 Stunden',
      description: 'You touch a willing creature to grant the ability to see in the dark.',
      descriptionDE: 'Du berührst eine willige Kreatur und gewährst die Fähigkeit, im Dunkeln zu sehen.',
      allowedClasses: ['warlock', 'ranger'],
      manaCost: 4
    }
  ],

  paladin: [
    {
      id: 'cure_wounds',
      name: 'Cure Wounds',
      nameDE: 'Wunden heilen',
      level: 1,
      school: 'evocation',
      castingTime: '1 Action',
      range: 'Berührung',
      components: ['V', 'S'],
      duration: 'Sofort',
      description: 'A creature you touch regains a number of hit points.',
      descriptionDE: 'Eine Kreatur, die du berührst, erhält Trefferpunkte zurück.',
      allowedClasses: ['paladin', 'druid'],
      manaCost: 2
    },
    {
      id: 'divine_smite',
      name: 'Divine Smite',
      nameDE: 'Göttlicher Schlag',
      level: 2,
      school: 'evocation',
      castingTime: 'Beim Treffen',
      range: 'Selbst',
      components: ['V'],
      duration: 'Sofort',
      description: 'When you hit a creature with a melee weapon attack, you can expend a spell slot to deal radiant damage.',
      descriptionDE: 'Wenn du eine Kreatur mit einem Nahkampfangriff triffst, kannst du einen Zauberplatz aufwenden, um strahlenden Schaden zu verursachen.',
      allowedClasses: ['paladin'],
      manaCost: 4,
      damageType: 'radiant'
    },
    {
      id: 'protection_aura',
      name: 'Protection Aura',
      nameDE: 'Schutzaura',
      level: 3,
      school: 'abjuration',
      castingTime: '1 Action',
      range: '9 Meter Radius',
      components: ['V', 'S', 'M'],
      duration: '10 Minuten',
      description: 'Divine energy radiates from you, protecting nearby allies.',
      descriptionDE: 'Göttliche Energie strahlt von dir aus und schützt nahegelegene Verbündete.',
      allowedClasses: ['paladin'],
      manaCost: 6,
      concentration: true
    },
    {
      id: 'banish_evil',
      name: 'Banish Evil',
      nameDE: 'Böses bannen',
      level: 5,
      school: 'abjuration',
      castingTime: '1 Action',
      range: '18 Meter',
      components: ['V', 'S', 'M'],
      duration: '1 Minute',
      description: 'You attempt to send one creature that you can see within range to another plane of existence.',
      descriptionDE: 'Du versuchst, eine sichtbare Kreatur in Reichweite auf eine andere Existenzebene zu verbannen.',
      allowedClasses: ['paladin'],
      manaCost: 10,
      savingThrow: 'Charisma',
      concentration: true
    }
  ],

  druid: [
    {
      id: 'entangle',
      name: 'Entangle',
      nameDE: 'Ranken',
      level: 1,
      school: 'conjuration',
      castingTime: '1 Action',
      range: '27 Meter',
      components: ['V', 'S'],
      duration: '1 Minute',
      description: 'Grasping weeds and vines sprout from the ground in a 20-foot square.',
      descriptionDE: 'Greifende Pflanzen und Ranken sprießen aus dem Boden in einem 6-Meter-Quadrat.',
      allowedClasses: ['druid', 'ranger'],
      manaCost: 2,
      savingThrow: 'Strength',
      concentration: true
    },
    {
      id: 'wild_shape',
      name: 'Wild Shape',
      nameDE: 'Tiergestalt',
      level: 2,
      school: 'transmutation',
      castingTime: '1 Action',
      range: 'Selbst',
      components: ['V', 'S'],
      duration: '1 Stunde',
      description: 'You assume the shape of a beast that you have seen before.',
      descriptionDE: 'Du nimmst die Gestalt eines Tieres an, das du zuvor gesehen hast.',
      allowedClasses: ['druid'],
      manaCost: 4
    },
    {
      id: 'call_lightning',
      name: 'Call Lightning',
      nameDE: 'Blitz rufen',
      level: 3,
      school: 'conjuration',
      castingTime: '1 Action',
      range: '36 Meter',
      components: ['V', 'S'],
      duration: '10 Minuten',
      description: 'A storm cloud appears in the shape of a cylinder that is 10 feet tall with a 60-foot radius.',
      descriptionDE: 'Eine Gewitterwolke erscheint in zylindrischer Form, 3 Meter hoch mit 18 Meter Radius.',
      allowedClasses: ['druid'],
      manaCost: 6,
      damageType: 'lightning',
      savingThrow: 'Dexterity',
      concentration: true
    },
    {
      id: 'heal',
      name: 'Heal',
      nameDE: 'Heilung',
      level: 6,
      school: 'evocation',
      castingTime: '1 Action',
      range: 'Berührung',
      components: ['V', 'S'],
      duration: 'Sofort',
      description: 'Choose a creature that you can see within range. The target regains 70 hit points.',
      descriptionDE: 'Wähle eine sichtbare Kreatur in Reichweite. Das Ziel erhält 70 Trefferpunkte zurück.',
      allowedClasses: ['druid', 'paladin'],
      manaCost: 12
    },
    {
      id: 'earthquake',
      name: 'Earthquake',
      nameDE: 'Erdbeben',
      level: 8,
      school: 'evocation',
      castingTime: '1 Action',
      range: '150 Meter',
      components: ['V', 'S', 'M'],
      duration: '1 Minute',
      description: 'You create a seismic disturbance at a point on the ground that you can see.',
      descriptionDE: 'Du erzeugst eine seismische Störung an einem sichtbaren Punkt auf dem Boden.',
      allowedClasses: ['druid'],
      manaCost: 16,
      savingThrow: 'Dexterity',
      concentration: true
    }
  ],

  bard: [
    {
      id: 'vicious_mockery',
      name: 'Vicious Mockery',
      nameDE: 'Bösartiger Spott',
      level: 0,
      school: 'enchantment',
      castingTime: '1 Action',
      range: '18 Meter',
      components: ['V'],
      duration: 'Sofort',
      description: 'You unleash a string of insults laced with subtle enchantments.',
      descriptionDE: 'Du schmetterst eine Reihe von Beleidigungen mit subtilen Verzauberungen.',
      allowedClasses: ['bard'],
      manaCost: 0,
      damageType: 'psychic',
      savingThrow: 'Wisdom'
    },
    {
      id: 'bardic_inspiration',
      name: 'Bardic Inspiration',
      nameDE: 'Bardische Inspiration',
      level: 1,
      school: 'enchantment',
      castingTime: '1 Bonus Action',
      range: '18 Meter',
      components: ['V'],
      duration: '10 Minuten',
      description: 'You can inspire others through stirring words or music.',
      descriptionDE: 'Du kannst andere durch bewegende Worte oder Musik inspirieren.',
      allowedClasses: ['bard'],
      manaCost: 2
    },
    {
      id: 'charm_person',
      name: 'Charm Person',
      nameDE: 'Person bezaubern',
      level: 1,
      school: 'enchantment',
      castingTime: '1 Action',
      range: '9 Meter',
      components: ['V', 'S'],
      duration: '1 Stunde',
      description: 'You attempt to charm a humanoid you can see within range.',
      descriptionDE: 'Du versuchst, einen sichtbaren Humanoiden in Reichweite zu bezaubern.',
      allowedClasses: ['bard', 'warlock'],
      manaCost: 2,
      savingThrow: 'Wisdom'
    },
    {
      id: 'mass_suggestion',
      name: 'Mass Suggestion',
      nameDE: 'Massensuggestion',
      level: 6,
      school: 'enchantment',
      castingTime: '1 Action',
      range: '18 Meter',
      components: ['V', 'M'],
      duration: '24 Stunden',
      description: 'You suggest a course of activity (limited to a sentence or two) and magically influence up to twelve creatures.',
      descriptionDE: 'Du schlägst eine Handlung vor und beeinflusst magisch bis zu zwölf Kreaturen.',
      allowedClasses: ['bard'],
      manaCost: 12,
      savingThrow: 'Wisdom'
    }
  ],

  // For non-magical classes, provide limited spell access through items/scrolls
  warrior: [],
  rogue: [],
  monk: [],
  ranger: [
    {
      id: 'hunters_mark',
      name: "Hunter's Mark",
      nameDE: 'Jägerzeichen',
      level: 1,
      school: 'divination',
      castingTime: '1 Bonus Action',
      range: '27 Meter',
      components: ['V'],
      duration: '1 Stunde',
      description: 'You choose a creature you can see within range and mystically mark it as your quarry.',
      descriptionDE: 'Du wählst eine sichtbare Kreatur in Reichweite und markierst sie mystisch als deine Beute.',
      allowedClasses: ['ranger'],
      manaCost: 2,
      concentration: true
    },
    {
      id: 'animal_friendship',
      name: 'Animal Friendship',
      nameDE: 'Tierfreundschaft',
      level: 1,
      school: 'enchantment',
      castingTime: '1 Action',
      range: '9 Meter',
      components: ['V', 'S', 'M'],
      duration: '24 Stunden',
      description: 'This spell lets you convince a beast that you mean it no harm.',
      descriptionDE: 'Dieser Zauber lässt dich ein Tier überzeugen, dass du ihm nichts Böses willst.',
      allowedClasses: ['ranger', 'druid'],
      manaCost: 2,
      savingThrow: 'Wisdom'
    }
  ]
};

// Spell progression tables
export const spellSlotProgression: Record<number, Record<number, number>> = {
  // Level -> Spell Level -> Number of Slots
  1: { 1: 2 },
  2: { 1: 3 },
  3: { 1: 4, 2: 2 },
  4: { 1: 4, 2: 3 },
  5: { 1: 4, 2: 3, 3: 2 },
  6: { 1: 4, 2: 3, 3: 3 },
  7: { 1: 4, 2: 3, 3: 3, 4: 1 },
  8: { 1: 4, 2: 3, 3: 3, 4: 2 },
  9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 }
};

// Utility functions for spell system
export class SpellSystem {
  static getAvailableSpells(characterClass: CharacterClass, level: number): SpellData[] {
    const classSpells = spellDatabase[characterClass] || [];
    return classSpells.filter(spell => {
      // Check level requirement
      if (spell.level > Math.floor(level / 2) + 1) return false;
      
      // Check prerequisites
      if (spell.prerequisites) {
        return spell.prerequisites.every(prereq => {
          if (prereq.startsWith('level_')) {
            const requiredLevel = parseInt(prereq.split('_')[1]);
            return level >= requiredLevel;
          }
          return true; // For now, assume other prerequisites are met
        });
      }
      
      return true;
    });
  }
  
  static getSpellSlots(level: number): Record<number, number> {
    return spellSlotProgression[Math.min(level, 10)] || {};
  }
  
  static getSpellById(spellId: string): SpellData | null {
    for (const classSpells of Object.values(spellDatabase)) {
      const spell = classSpells.find(s => s.id === spellId);
      if (spell) return spell;
    }
    return null;
  }
  
  static canCastSpell(spell: SpellData, currentMana: number, spellSlots: Record<number, number>): boolean {
    // Check mana cost
    if (currentMana < spell.manaCost) return false;
    
    // For leveled spells, check if we have spell slots
    if (spell.level > 0) {
      const availableSlots = spellSlots[spell.level] || 0;
      return availableSlots > 0;
    }
    
    return true; // Cantrips can always be cast if mana is sufficient
  }
  
  static getSpellCombos(spellId: string): SpellData[] {
    const spell = this.getSpellById(spellId);
    if (!spell || !spell.comboPotential) return [];
    
    return spell.comboPotential
      .map(id => this.getSpellById(id))
      .filter((s): s is SpellData => s !== null);
  }
}

export default spellDatabase;
