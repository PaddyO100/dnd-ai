import type { Race, Trait } from '@/schemas/character'
import type { StatDistribution } from './characterGenerator'

// Race stat bonuses and abilities
export interface RaceInfo {
  name: string
  displayName: string
  description: string
  statBonuses: Record<string, number>
  racialTraits: Trait[]
  size: 'small' | 'medium' | 'large'
  speed: number
  languages: string[]
  proficiencies: string[]
}

export const RACE_DATA: Record<Race, RaceInfo> = {
  human: {
    name: 'human',
    displayName: 'Mensch',
    description: 'Vielseitige und anpassungsfähige Wesen mit großer Entschlossenheit.',
    statBonuses: {
      strength: 1,
      dexterity: 1,
      constitution: 1,
      intelligence: 1,
      wisdom: 1,
      charisma: 1
    },
    racialTraits: [
      {
        name: 'Vielseitigkeit',
        description: 'Menschen erhalten +1 auf alle Grundattribute und einen zusätzlichen Skill-Punkt pro Level.',
        shortDescription: '+1 auf alle Attribute, +1 Skill-Punkt/Level',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'stat_modifier',
            value: 1,
            target: 'all_stats'
          },
          {
            type: 'skill_bonus',
            value: 1,
            target: 'skill_points_per_level'
          }
        ]
      },
      {
        name: 'Anpassungsfähig',
        description: 'Menschen können alle Waffentypen verwenden ohne Beschränkungen.',
        shortDescription: 'Keine Waffenbeschränkungen',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'special_ability',
            value: 'universal_weapon_proficiency',
            target: 'weapons'
          }
        ]
      },
      {
        name: 'Determination',
        description: '+2 auf Rettungswürfe gegen Furcht.',
        shortDescription: '+2 auf Furcht-Rettungswürfe',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'skill_bonus',
            value: 2,
            target: 'fear_saves'
          }
        ]
      }
    ],
    size: 'medium',
    speed: 30,
    languages: ['Common'],
    proficiencies: []
  },

  orc: {
    name: 'orc',
    displayName: 'Orc',
    description: 'Mächtige Krieger mit unerschütterlicher Stärke und Kampfeswille.',
    statBonuses: {
      strength: 2,
      constitution: 1,
      intelligence: -1
    },
    racialTraits: [
      {
        name: 'Orcische Stärke',
        description: 'Orcs erhalten +2 Stärke, +1 Konstitution, aber -1 Intelligenz.',
        shortDescription: '+2 STR, +1 CON, -1 INT',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'stat_modifier',
            value: 2,
            target: 'strength'
          },
          {
            type: 'stat_modifier',
            value: 1,
            target: 'constitution'
          },
          {
            type: 'stat_modifier',
            value: -1,
            target: 'intelligence'
          }
        ]
      },
      {
        name: 'Rohe Kraft',
        description: '+25% Nahkampfschaden durch überlegene körperliche Stärke.',
        shortDescription: '+25% Nahkampfschaden',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'damage_bonus',
            value: '25%',
            target: 'melee_damage'
          }
        ]
      },
      {
        name: 'Zähigkeit',
        description: '+2 HP pro Level durch orcische Widerstandsfähigkeit.',
        shortDescription: '+2 HP/Level',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'stat_modifier',
            value: 2,
            target: 'hp_per_level'
          }
        ]
      },
      {
        name: 'Berserker-Wut',
        description: 'Einmal pro Tag Wut aktivieren (+3 STR, -1 AC für 10 Runden).',
        shortDescription: '1x/Tag: +3 STR, -1 AC (10 Runden)',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'special_ability',
            value: 'berserker_rage',
            target: 'combat',
            condition: 'once_per_day'
          }
        ]
      }
    ],
    size: 'medium',
    speed: 30,
    languages: ['Common', 'Orcish'],
    proficiencies: ['Intimidation']
  },

  dark_elf: {
    name: 'dark_elf',
    displayName: 'Dunkelelf',
    description: 'Geheimnisvolle Unterweltbewohner mit natürlicher Magie und Nachtsicht.',
    statBonuses: {
      dexterity: 2,
      intelligence: 1,
      constitution: -1
    },
    racialTraits: [
      {
        name: 'Dunkelelfen-Erbe',
        description: 'Dunkelelfen erhalten +2 Geschicklichkeit, +1 Intelligenz, aber -1 Konstitution.',
        shortDescription: '+2 DEX, +1 INT, -1 CON',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'stat_modifier',
            value: 2,
            target: 'dexterity'
          },
          {
            type: 'stat_modifier',
            value: 1,
            target: 'intelligence'
          },
          {
            type: 'stat_modifier',
            value: -1,
            target: 'constitution'
          }
        ]
      },
      {
        name: 'Dunkelsicht',
        description: 'Kann in völliger Dunkelheit bis zu 60 Fuß sehen.',
        shortDescription: 'Sicht in Dunkelheit (60 Fuß)',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'special_ability',
            value: 'darkvision_60',
            target: 'vision'
          }
        ]
      },
      {
        name: 'Schattenmagie',
        description: 'Bonus auf dunkle Zauber und Schattenzauber.',
        shortDescription: 'Bonus auf Schattenmagie',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'spell',
            value: 'shadow_magic_bonus',
            target: 'dark_spells'
          }
        ]
      },
      {
        name: 'Giftresistenz',
        description: '+4 Bonus auf Rettungswürfe gegen Gifte.',
        shortDescription: '+4 auf Gift-Rettungswürfe',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'resistance',
            value: 4,
            target: 'poison_saves'
          }
        ]
      }
    ],
    size: 'medium',
    speed: 30,
    languages: ['Common', 'Elvish'],
    proficiencies: ['Stealth', 'Perception']
  },

  high_elf: {
    name: 'high_elf',
    displayName: 'Hochelf',
    description: 'Edle Zauberer mit angeborener Magie und überragender Intelligenz.',
    statBonuses: {
      intelligence: 2,
      dexterity: 1,
      constitution: -1
    },
    racialTraits: [
      {
        name: 'Hochelfen-Intellekt',
        description: 'Hochelfen erhalten +2 Intelligenz, +1 Geschicklichkeit, aber -1 Konstitution.',
        shortDescription: '+2 INT, +1 DEX, -1 CON',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'stat_modifier',
            value: 2,
            target: 'intelligence'
          },
          {
            type: 'stat_modifier',
            value: 1,
            target: 'dexterity'
          },
          {
            type: 'stat_modifier',
            value: -1,
            target: 'constitution'
          }
        ]
      },
      {
        name: 'Magische Begabung',
        description: '+1 Zauberslot pro Level durch angeborene Magie.',
        shortDescription: '+1 Zauberslot/Level',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'stat_modifier',
            value: 1,
            target: 'spell_slots_per_level'
          }
        ]
      },
      {
        name: 'Elfen-Präzision',
        description: 'Kritische Treffer bei 19-20 statt nur 20.',
        shortDescription: 'Kritischer Treffer bei 19-20',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'special_ability',
            value: 'improved_critical',
            target: 'attacks'
          }
        ]
      },
      {
        name: 'Meditation',
        description: 'Braucht nur 4 Stunden Ruhe statt 8 für vollständige Erholung.',
        shortDescription: 'Benötigt nur 4h Schlaf',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'special_ability',
            value: 'trance',
            target: 'rest'
          }
        ]
      }
    ],
    size: 'medium',
    speed: 30,
    languages: ['Common', 'Elvish'],
    proficiencies: ['Arcana', 'History']
  },

  wood_elf: {
    name: 'wood_elf',
    displayName: 'Waldelf',
    description: 'Naturverbundene Jäger mit überragenden Bogenfähigkeiten.',
    statBonuses: {
      dexterity: 2,
      wisdom: 1,
      constitution: -1
    },
    racialTraits: [
      {
        name: 'Waldelf-Agilität',
        description: 'Waldelfen erhalten +2 Geschicklichkeit, +1 Weisheit, aber -1 Konstitution.',
        shortDescription: '+2 DEX, +1 WIS, -1 CON',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'stat_modifier',
            value: 2,
            target: 'dexterity'
          },
          {
            type: 'stat_modifier',
            value: 1,
            target: 'wisdom'
          },
          {
            type: 'stat_modifier',
            value: -1,
            target: 'constitution'
          }
        ]
      },
      {
        name: 'Naturverbundenheit',
        description: '+3 auf alle Natur-, Survival- und Animal Handling-Würfe.',
        shortDescription: '+3 auf Natur, Survival, Animal Handling',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'skill_bonus',
            value: 3,
            target: 'nature'
          },
          {
            type: 'skill_bonus',
            value: 3,
            target: 'survival'
          },
          {
            type: 'skill_bonus',
            value: 3,
            target: 'animal_handling'
          }
        ]
      },
      {
        name: 'Meister-Bogenschütze',
        description: '+2 Angriff und +50% Schaden mit Bögen.',
        shortDescription: '+2 Angriff, +50% Schaden mit Bögen',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'skill_bonus',
            value: 2,
            target: 'ranged_attack_bow'
          },
          {
            type: 'damage_bonus',
            value: '50%',
            target: 'bow_damage'
          }
        ]
      },
      {
        name: 'Tiersprache',
        description: 'Kann 1x pro Tag mit Tieren sprechen.',
        shortDescription: '1x/Tag mit Tieren sprechen',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'special_ability',
            value: 'speak_with_animals',
            target: 'communication',
            condition: 'once_per_day'
          }
        ]
      }
    ],
    size: 'medium',
    speed: 35,
    languages: ['Common', 'Elvish', 'Sylvan'],
    proficiencies: ['Survival', 'Nature', 'Animal Handling']
  },

  dwarf: {
    name: 'dwarf',
    displayName: 'Zwerg',
    description: 'Robuste Handwerker mit unerschütterlicher Ausdauer und Meisterschaft in der Schmiedekunst.',
    statBonuses: {
      constitution: 2,
      strength: 1,
      dexterity: -1
    },
    racialTraits: [
      {
        name: 'Zwergische Zähigkeit',
        description: 'Zwerge erhalten +2 Konstitution, +1 Stärke, aber -1 Geschicklichkeit.',
        shortDescription: '+2 CON, +1 STR, -1 DEX',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'stat_modifier',
            value: 2,
            target: 'constitution'
          },
          {
            type: 'stat_modifier',
            value: 1,
            target: 'strength'
          },
          {
            type: 'stat_modifier',
            value: -1,
            target: 'dexterity'
          }
        ]
      },
      {
        name: 'Steinhaut',
        description: '-1 Schaden von allen physischen Angriffen durch natürliche Resistenz.',
        shortDescription: '-1 Schaden von physischen Angriffen',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'damage_bonus',
            value: '-1',
            target: 'physical_damage_reduction'
          }
        ]
      },
      {
        name: 'Giftresistenz',
        description: '+4 auf Rettungswürfe gegen Gift und halbiert Giftschaden.',
        shortDescription: '+4 auf Gift-Rettungswürfe, halber Giftschaden',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'resistance',
            value: 4,
            target: 'poison_saves'
          },
          {
            type: 'resistance',
            value: 'half',
            target: 'poison_damage'
          }
        ]
      },
      {
        name: 'Handwerkskunst',
        description: '+3 auf alle Handwerkswürfe und doppelte Proficiency mit Werkzeugen.',
        shortDescription: '+3 auf Handwerk, doppelte Werkzeug-Proficiency',
        type: 'racial',
        prerequisites: [],
        effects: [
          {
            type: 'skill_bonus',
            value: 3,
            target: 'crafting'
          },
          {
            type: 'special_ability',
            value: 'double_tool_proficiency',
            target: 'crafting_tools'
          }
        ]
      }
    ],
    size: 'medium',
    speed: 25,
    languages: ['Common', 'Dwarvish'],
    proficiencies: ['Smith Tools', 'Mason Tools']
  }
}

// Helper functions
export function getRaceInfo(race: Race): RaceInfo {
  return RACE_DATA[race]
}

export function applyRacialBonuses(baseStats: Record<string, number>, race: Race): Record<string, number>
export function applyRacialBonuses(baseStats: StatDistribution, race: Race): StatDistribution
export function applyRacialBonuses(baseStats: Record<string, number> | StatDistribution, race: Race): Record<string, number> | StatDistribution {
  const raceInfo = getRaceInfo(race)
  const modifiedStats = { ...baseStats }
  
  Object.entries(raceInfo.statBonuses).forEach(([stat, bonus]) => {
    if ((modifiedStats as Record<string, number>)[stat] !== undefined) {
      (modifiedStats as Record<string, number>)[stat] += bonus
    }
  })
  
  return modifiedStats
}

export function getRacialTraits(race: Race): Trait[] {
  return getRaceInfo(race).racialTraits
}

export function getAllRaces(): Race[] {
  return Object.keys(RACE_DATA) as Race[]
}
