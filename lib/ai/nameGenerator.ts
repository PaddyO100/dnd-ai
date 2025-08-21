import type { Race, Gender } from '@/schemas/character';

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

export function generateFantasyName(race?: Race, gender?: Gender, scenarioTitle?: string): string {
  const humanMale = ['Alaric','Benedikt','Cedric','Dietmar','Eldric','Falko','Geralt','Hagen','Isen','Jorund','Konrad','Leofric','Marek','Nestor','Ortwin','Ragvald','Serik','Tristan','Ulric','Valten']
  const humanFemale = ['Adelheid','Brigida','Celia','Daria','Elara','Frida','Greta','Helena','Isolde','Jasmin','Klara','Livia','Mara','Neria','Odile','Runa','Serena','Thyra','Ulma','Vera']
  const elfMale = ['Aelar','Beluar','Caelion','Daerion','Elrohir','Faelar','Gaelin','Hadriel','Ithron','Kaelith']
  const elfFemale = ['Aelene','Belira','Caelya','Daenara','Elowen','Faelith','Gaelira','Hathiel','Ilyana','Kaelira']
  const dwarfMale = ['Balrik','Dorim','Edrun','Falkrim','Gorim','Hadrin','Kazmuk','Norrin','Orsik','Thorin']
  const dwarfFemale = ['Bera','Dagna','Edrika','Frida','Gerta','Helga','Ingra','Katla','Ragna','Thyra']
  const orcMale = ['Brakk','Darg','Gor','Hark','Karg','Morg','Ruk','Thrag','Urzog','Zug']
  const orcFemale = ['Brakka','Darga','Gora','Harka','Karga','Morga','Ruka','Thraga','Urza','Zuga']

  let pool: string[] = humanMale
  if (race === 'high_elf' || race === 'wood_elf' || race === 'dark_elf') pool = gender === 'female' ? elfFemale : elfMale
  else if (race === 'dwarf') pool = gender === 'female' ? dwarfFemale : dwarfMale
  else if (race === 'orc') pool = gender === 'female' ? orcFemale : orcMale
  else pool = gender === 'female' ? humanFemale : humanMale

  // optional epithet from scenario (e.g., "von Aethermoor")
  const place = (scenarioTitle || '').split(/[\s,:\-]+/).filter(Boolean)[0]
  const surname = place ? (Math.random() < 0.6 ? ` von ${place}` : '') : ''
  return `${pick(pool)}${surname}`
}