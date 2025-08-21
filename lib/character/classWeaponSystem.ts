// Class-specific weapon restrictions system
// Based on PORTRAIT_AND_RACE_SYSTEM_DESIGN.md

import { CharacterClass } from '../../schemas/character'

export interface WeaponRestrictions {
  primary: string[]
  secondary: string[]
  forbidden: string[]
}

export interface ClassWeaponInfo {
  name: CharacterClass
  displayName: string
  weaponRestrictions: WeaponRestrictions
}

export const CLASS_WEAPON_DATA: Record<CharacterClass, ClassWeaponInfo> = {
  warrior: {
    name: 'warrior',
    displayName: 'Krieger',
    weaponRestrictions: {
      primary: [
        'Langschwerter', 'Streitäxte', 'Kriegshämmer', 'Zweihandschwerter'
      ],
      secondary: [
        'Schilde', 'Armbrüste', 'Wurfspeere'
      ],
      forbidden: [
        'Zauberstäbe', 'Zauberkomponenten', 'leichte Bögen'
      ]
    }
  },

  mage: {
    name: 'mage',
    displayName: 'Magier',
    weaponRestrictions: {
      primary: [
        'Zauberstäbe', 'Stäbe', 'Dolche', 'Orbs'
      ],
      secondary: [
        'Zauberkomponenten', 'Zauberbücher', 'Kristalle'
      ],
      forbidden: [
        'Schwere Rüstungen', 'Zweihandwaffen', 'schwere Schilde'
      ]
    }
  },

  rogue: {
    name: 'rogue',
    displayName: 'Schurke',
    weaponRestrictions: {
      primary: [
        'Dolche', 'Kurzschwerter', 'Bögen', 'Armbrüste'
      ],
      secondary: [
        'Dietriche', 'Gifte', 'Wurfmesser', 'leichte Armbrüste'
      ],
      forbidden: [
        'Schwere Rüstungen', 'Zweihandwaffen', 'große Schilde'
      ]
    }
  },

  bard: {
    name: 'bard',
    displayName: 'Barde',
    weaponRestrictions: {
      primary: [
        'Rapiere', 'leichte Bögen', 'Dolche', 'Musikinstrumente'
      ],
      secondary: [
        'Zauberkomponenten', 'Wurfwaffen', 'leichte Armbrüste'
      ],
      forbidden: [
        'Schwere Rüstungen', 'Zweihandwaffen', 'Kriegshämmer'
      ]
    }
  },

  paladin: {
    name: 'paladin',
    displayName: 'Paladin',
    weaponRestrictions: {
      primary: [
        'Langschwerter', 'Streitkolben', 'Kriegshämmer', 'heilige Symbole'
      ],
      secondary: [
        'Große Schilde', 'Lanzen', 'gesegnete Waffen'
      ],
      forbidden: [
        'Unheilige Waffen', 'Gifte', 'dunkle Magie-Items'
      ]
    }
  },

  ranger: {
    name: 'ranger',
    displayName: 'Waldläufer',
    weaponRestrictions: {
      primary: [
        'Bögen', 'Langbögen', 'Speere', 'Kurzschwerter'
      ],
      secondary: [
        'Überlebensausrüstung', 'Fallen', 'Wurfäxte', 'leichte Armbrüste'
      ],
      forbidden: [
        'Schwere Rüstungen', 'große Zweihandwaffen'
      ]
    }
  },

  druid: {
    name: 'druid',
    displayName: 'Druide',
    weaponRestrictions: {
      primary: [
        'Stäbe', 'Keulen', 'Speere', 'Sicheln', 'Naturkristalle'
      ],
      secondary: [
        'Naturkomponenten', 'Heilkräuter', 'Tierknochen-Fokus'
      ],
      forbidden: [
        'Metallrüstungen', 'Metallwaffen', 'künstliche Magie-Items'
      ]
    }
  },

  monk: {
    name: 'monk',
    displayName: 'Mönch',
    weaponRestrictions: {
      primary: [
        'Kampfstäbe', 'Nunchaku', 'Klauen', 'unbewaffnet'
      ],
      secondary: [
        'Shuriken', 'Mönchswaffen', 'Meditationsperlen'
      ],
      forbidden: [
        'Rüstungen', 'schwere Waffen', 'Fernkampfwaffen (außer Mönchswaffen)'
      ]
    }
  },

  warlock: {
    name: 'warlock',
    displayName: 'Hexenmeister',
    weaponRestrictions: {
      primary: [
        'Eldritch Blast (magisch)', 'Dolche', 'leichte Armbrüste', 'Pakt-Waffen'
      ],
      secondary: [
        'Pakt-Fokus', 'okkulte Symbole', 'verfluchte Gegenstände'
      ],
      forbidden: [
        'Schwere Rüstungen', 'heilige Waffen', 'gesegnete Gegenstände'
      ]
    }
  },

  
}

// Helper functions
export function getClassWeaponInfo(characterClass: CharacterClass): ClassWeaponInfo {
  return CLASS_WEAPON_DATA[characterClass]
}

export function isWeaponAllowed(characterClass: CharacterClass, weapon: string): 'primary' | 'secondary' | 'forbidden' {
  const weaponInfo = getClassWeaponInfo(characterClass)
  
  if (weaponInfo.weaponRestrictions.primary.includes(weapon)) {
    return 'primary'
  }
  
  if (weaponInfo.weaponRestrictions.secondary.includes(weapon)) {
    return 'secondary'
  }
  
  if (weaponInfo.weaponRestrictions.forbidden.includes(weapon)) {
    return 'forbidden'
  }
  
  // Default to secondary if not explicitly listed
  return 'secondary'
}

export function canUseWeapon(characterClass: CharacterClass, weapon: string): boolean {
  return isWeaponAllowed(characterClass, weapon) !== 'forbidden'
}

export function getPrimaryWeapons(characterClass: CharacterClass): string[] {
  return getClassWeaponInfo(characterClass).weaponRestrictions.primary
}

export function getSecondaryWeapons(characterClass: CharacterClass): string[] {
  return getClassWeaponInfo(characterClass).weaponRestrictions.secondary
}

export function getForbiddenWeapons(characterClass: CharacterClass): string[] {
  return getClassWeaponInfo(characterClass).weaponRestrictions.forbidden
}

export function getAllClasses(): CharacterClass[] {
  return Object.keys(CLASS_WEAPON_DATA) as CharacterClass[]
}

export function getWeaponEfficiency(characterClass: CharacterClass, weapon: string): number {
  const weaponType = isWeaponAllowed(characterClass, weapon)
  
  switch (weaponType) {
    case 'primary':
      return 1.0 // Full proficiency
    case 'secondary':
      return 0.8 // Reduced efficiency
    case 'forbidden':
      return 0.3 // Severe penalty
    default:
      return 0.6 // Default efficiency for unlisted weapons
  }
}
