import type { PredefinedCampaign } from '@/lib/state/gameStore';

export const predefinedCampaigns: PredefinedCampaign[] = [
  {
    id: 'lost-mine',
    title: 'Die Verlorene Mine von Phandelver',
    description: 'Ein klassisches Abenteuer für neue Helden. Entdeckt die Geheimnisse einer verlassenen Mine und rettet die Stadt Phandalin vor dunklen Mächten.',
    difficulty: 'beginner',
    tags: ['Classic', 'Dungeon', 'Mystery', 'Rescue'],
    estimatedDuration: '8-12 Sessions',
    playerCount: { min: 3, max: 5 },
    theme: 'High Fantasy',
    preview: {
      setting: 'Die malerische Stadt Phandalin und die gefährlichen Umgebungen der Schwertküste',
      hook: 'Gundren Rockseeker bittet euch, wichtige Güter nach Phandalin zu eskortieren, doch der Auftrag entpuppt sich als weitaus gefährlicher als erwartet.',
      features: ['Goblin-Verstecke', 'Antike Zwergenruinen', 'Mysteriöse Magie', 'Lokale Politik']
    }
  },
  {
    id: 'curse-strahd',
    title: 'Der Fluch des Strahd',
    description: 'Ein gotisches Horror-Abenteuer im verfluchten Land Barovia. Kämpft gegen den uralten Vampir Strahd von Zarovich in seinem eigenen Reich.',
    difficulty: 'advanced',
    tags: ['Horror', 'Gothic', 'Vampire', 'Dark'],
    estimatedDuration: '15-20 Sessions',
    playerCount: { min: 4, max: 6 },
    theme: 'Dark Fantasy',
    preview: {
      setting: 'Das nebelverhangene, verfluchte Land Barovia mit seinem düsteren Schloss Ravenloft',
      hook: 'Mysteriöse Nebel transportieren euch in ein Land ewiger Dunkelheit, regiert von einem unsterblichen Tyrannen.',
      features: ['Gotische Atmosphäre', 'Moralische Dilemmata', 'Übernatürlicher Horror', 'Komplexe NSCs']
    }
  },
  {
    id: 'dragon-heist',
    title: 'Drachenraub',
    description: 'Ein urbanes Abenteuer voller Intrigen in der großen Stadt Waterdeep. Politik, Verbrechen und ein verschwundener Schatz erwarten euch.',
    difficulty: 'intermediate',
    tags: ['Urban', 'Intrigue', 'Politics', 'Investigation'],
    estimatedDuration: '10-15 Sessions',
    playerCount: { min: 3, max: 6 },
    theme: 'Urban Fantasy',
    preview: {
      setting: 'Die geschäftige Metropole Waterdeep mit ihren verschiedenen Vierteln und Gilden',
      hook: 'Ein mysteriöser Schatz im Wert von 500.000 Goldmünzen ist verschwunden, und jeder will ihn haben.',
      features: ['Stadtpolitik', 'Gildenkonflikte', 'Soziale Begegnungen', 'Komplexe Ermittlungen']
    }
  },
  {
    id: 'tomb-annihilation',
    title: 'Gruft der Vernichtung',
    description: 'Erkundet den tödlichen Dschungel von Chult und die verfluchte Gruft der Neun Götter. Ein brutales Survival-Abenteuer.',
    difficulty: 'advanced',
    tags: ['Jungle', 'Exploration', 'Survival', 'Ancient'],
    estimatedDuration: '12-18 Sessions',
    playerCount: { min: 4, max: 6 },
    theme: 'Survival Horror',
    preview: {
      setting: 'Die gefährlichen Dschungel von Chult mit ihren Dinosauriern, Zombies und antiken Ruinen',
      hook: 'Ein Todesfluch plagt das Land. Nur in der legendären Gruft der Neun Götter findet ihr die Rettung.',
      features: ['Überlebenskampf', 'Antike Geheimnisse', 'Tödliche Fallen', 'Exotische Kreaturen']
    }
  },
  {
    id: 'storm-kings-thunder',
    title: 'Sturmkönigs Donner',
    description: 'Die Riesen sind erwacht und bedrohen die kleine Völker. Reist durch die Schwertküste und entscheidet das Schicksal der Welt.',
    difficulty: 'intermediate',
    tags: ['Epic', 'Giants', 'Politics', 'Travel'],
    estimatedDuration: '15-25 Sessions',
    playerCount: { min: 4, max: 6 },
    theme: 'Epic Fantasy',
    preview: {
      setting: 'Die gesamte Schwertküste und die legendären Reiche der Riesen hoch in den Bergen und Wolken',
      hook: 'Die Ordnung der Riesen ist zerbrochen, und ihr Krieg droht die Welt der kleinen Völker zu zerstören.',
      features: ['Epische Schlachten', 'Riesenpolitik', 'Weitläufige Reisen', 'Große Konsequenzen']
    }
  },
  {
    id: 'custom-sandbox',
    title: 'Freies Spiel (Sandbox)',
    description: 'Erschafft eure eigene Geschichte in einer offenen Welt. Perfekt für kreative Gruppen, die ihre eigenen Abenteuer gestalten möchten.',
    difficulty: 'beginner',
    tags: ['Sandbox', 'Creative', 'Open World', 'Custom'],
    estimatedDuration: 'Unbegrenzt',
    playerCount: { min: 1, max: 8 },
    theme: 'Variable',
    preview: {
      setting: 'Eine vollständig anpassbare Welt, die sich nach euren Entscheidungen formt',
      hook: 'Ihr seid Abenteurer in einer Welt voller Möglichkeiten. Was werdet ihr daraus machen?',
      features: ['Völlige Freiheit', 'Dynamische Weltentwicklung', 'Spieler-getriebene Handlung', 'Endlose Möglichkeiten']
    }
  }
];

export const characterClasses = [
  {
    name: 'Kämpfer',
    description: 'Meister des Nahkampfs mit hoher Ausdauer und vielseitigen Kampffähigkeiten',
    primaryStat: 'Stärke',
    hitDie: 'd10',
    armorProficiency: 'Alle Rüstungen und Schilde',
    weaponProficiency: 'Alle einfachen und Kriegswaffen',
    features: ['Kampfstil', 'Zweiter Wind', 'Action Surge']
  },
  {
    name: 'Magier',
    description: 'Gelehrter der arkanen Künste mit mächtigen Zaubern und schwacher körperlicher Verfassung',
    primaryStat: 'Intelligenz',
    hitDie: 'd6',
    armorProficiency: 'Keine',
    weaponProficiency: 'Dolche, Darts, Schleudern, Quarterstäbe, leichte Armbrüste',
    features: ['Zauberbuch', 'Arkane Wiederherstellung', 'Ritual-Zauber']
  },
  {
    name: 'Schurke',
    description: 'Meister der Heimlichkeit und der präzisen Angriffe',
    primaryStat: 'Geschicklichkeit',
    hitDie: 'd8',
    armorProficiency: 'Leichte Rüstung',
    weaponProficiency: 'Einfache Waffen, Handarmbrüste, Langschwerter, Rapiere, Kurzschwerter',
    features: ['Hinterhältiger Angriff', 'Diebesjargon', 'Geschicklichkeit']
  },
  {
    name: 'Kleriker',
    description: 'Diener der Götter mit Heilzaubern und göttlicher Magie',
    primaryStat: 'Weisheit',
    hitDie: 'd8',
    armorProficiency: 'Leichte und mittlere Rüstung, Schilde',
    weaponProficiency: 'Alle einfachen Waffen',
    features: ['Göttliche Domäne', 'Kanal Göttlichkeit', 'Ritual-Zauber']
  },
  {
    name: 'Waldläufer',
    description: 'Naturkundiger Jäger und Spurenleser mit Überlebenskünsten',
    primaryStat: 'Geschicklichkeit/Weisheit',
    hitDie: 'd10',
    armorProficiency: 'Leichte und mittlere Rüstung, Schilde',
    weaponProficiency: 'Alle einfachen und Kriegswaffen',
    features: ['Erzfeind', 'Natürlicher Entdecker', 'Kampfstil']
  },
  {
    name: 'Paladin',
    description: 'Heiliger Krieger mit göttlicher Magie und starkem Ehrkodex',
    primaryStat: 'Stärke/Charisma',
    hitDie: 'd10',
    armorProficiency: 'Alle Rüstungen und Schilde',
    weaponProficiency: 'Alle einfachen und Kriegswaffen',
    features: ['Göttlicher Sinn', 'Handauflegen', 'Kampfstil']
  }
];

export const startingWeapons = [
  {
    name: 'Langschwert',
    type: 'Kriegswaffe',
    damage: '1d8 Hiebschaden',
    properties: ['Vielseitig (1d10)'],
    description: 'Eine klassische Kriegswaffe für den Nahkampf'
  },
  {
    name: 'Kurzschwert',
    type: 'Kriegswaffe', 
    damage: '1d6 Stichschaden',
    properties: ['Finesse', 'Leicht'],
    description: 'Schnell und wendig, perfekt für Schurken'
  },
  {
    name: 'Langbogen',
    type: 'Kriegswaffe',
    damage: '1d8 Stichschaden',
    properties: ['Munition (150/600)', 'Schwer', 'Zweihändig'],
    description: 'Fernkampfwaffe mit großer Reichweite'
  },
  {
    name: 'Quarterstaff',
    type: 'Einfache Waffe',
    damage: '1d6 Hiebschaden',
    properties: ['Vielseitig (1d8)'],
    description: 'Einfacher Stab, ideal für Magier'
  },
  {
    name: 'Dolch',
    type: 'Einfache Waffe',
    damage: '1d4 Stichschaden', 
    properties: ['Finesse', 'Leicht', 'Wurfwaffe (20/60)'],
    description: 'Kleine, versteckbare Klinge'
  },
  {
    name: 'Streitkolben',
    type: 'Einfache Waffe',
    damage: '1d6 Hiebschaden',
    properties: [],
    description: 'Robuste Nahkampfwaffe für Kleriker'
  }
];