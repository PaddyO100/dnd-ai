import type { Race, Gender, CharacterClass } from '@/schemas/character'

// Portrait utility functions
export interface PortraitInfo {
  fileName: string
  displayName: string
  description: string
}

// Generate portrait filename based on class, race, and gender
export function getPortraitFileName(characterClass: CharacterClass, race: Race, gender: Gender): string {
  return `${characterClass}_${race}_${gender}.png`
}

// Get portrait URL for a character
export function getPortraitUrl(characterClass: CharacterClass, race: Race, gender: Gender): string {
  const fileName = getPortraitFileName(characterClass, race, gender)
  return `/portraits/${characterClass}/${fileName}`
}

// Check if portrait exists (based on your current folder structure)
export function isPortraitAvailable(characterClass: CharacterClass, race: Race, gender: Gender): boolean {
  // For now, we assume all portraits exist since you're creating them
  // Later this could check actual file existence
  const availableClasses: CharacterClass[] = ['warrior', 'mage', 'rogue', 'bard', 'paladin', 'ranger', 'druid', 'monk', 'warlock']
  const availableRaces: Race[] = ['human', 'orc', 'dark_elf', 'high_elf', 'wood_elf', 'dwarf']
  const availableGenders: Gender[] = ['male', 'female']
  
  return availableClasses.includes(characterClass) && 
         availableRaces.includes(race) && 
         availableGenders.includes(gender)
}

// Get display names
export function getRaceDisplayName(race: Race): string {
  const displayNames: Record<Race, string> = {
    human: 'Mensch',
    orc: 'Orc',
    dark_elf: 'Dunkelelf',
    high_elf: 'Hochelf',
    wood_elf: 'Waldelf',
    dwarf: 'Zwerg'
  }
  return displayNames[race] || race
}

export function getGenderDisplayName(gender: Gender): string {
  const displayNames: Record<Gender, string> = {
    male: 'Männlich',
    female: 'Weiblich'
  }
  return displayNames[gender] || gender
}

export function getClassDisplayName(characterClass: CharacterClass): string {
  const displayNames: Record<CharacterClass, string> = {
    warrior: 'Krieger',
    mage: 'Magier',
    rogue: 'Schurke',
    bard: 'Barde',
    paladin: 'Paladin',
    ranger: 'Waldläufer',
    druid: 'Druide',
    monk: 'Mönch',
    warlock: 'Hexenmeister'
  }
  return displayNames[characterClass] || characterClass
}

// Get all available options
export function getAllRaces(): Race[] {
  return ['human', 'orc', 'dark_elf', 'high_elf', 'wood_elf', 'dwarf']
}

export function getAllGenders(): Gender[] {
  return ['male', 'female']
}

export function getAllCharacterClasses(): CharacterClass[] {
  return ['warrior', 'mage', 'rogue', 'bard', 'paladin', 'ranger', 'druid', 'monk', 'warlock']
}

// Get portrait info for display
export function getPortraitInfo(characterClass: CharacterClass, race: Race, gender: Gender): PortraitInfo {
  const fileName = getPortraitFileName(characterClass, race, gender)
  const displayName = `${getRaceDisplayName(race)} ${getClassDisplayName(characterClass)} (${getGenderDisplayName(gender)})`
  const description = `Ein ${getGenderDisplayName(gender).toLowerCase()}er ${getRaceDisplayName(race)} ${getClassDisplayName(characterClass)}`
  
  return {
    fileName,
    displayName,
    description
  }
}

// Fallback portrait if specific one doesn't exist
export function getFallbackPortraitUrl(): string {
  return '/portraits/warrior/warrior_human_male.png'
}
