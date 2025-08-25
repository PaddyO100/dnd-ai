// lib/character/skillSystem.ts

import { Skill } from '@/schemas/character';

export type SkillName = 
  // Combat Skills
  | 'melee_combat' | 'ranged_combat' | 'defense' | 'intimidation'
  // Magic Skills  
  | 'arcane_knowledge' | 'spell_focus' | 'divine_magic' | 'alchemy'
  // Physical Skills
  | 'athletics' | 'stealth' | 'acrobatics' | 'sleight_of_hand'
  // Mental Skills
  | 'investigation' | 'perception' | 'insight' | 'medicine'
  // Social Skills
  | 'persuasion' | 'deception' | 'performance' | 'leadership'
  // Survival Skills
  | 'survival' | 'nature_lore' | 'tracking' | 'animal_handling'
  // Craft Skills
  | 'lockpicking' | 'crafting' | 'engineering' | 'cooking'
  // Knowledge Skills
  | 'history' | 'religion' | 'politics' | 'languages'
  // Specialized Skills
  | 'healing' | 'poison_knowledge' | 'trap_detection' | 'navigation';

export interface SkillDefinition {
  name: string;
  description: string;
  category: 'combat' | 'magic' | 'physical' | 'mental' | 'social' | 'survival' | 'craft' | 'knowledge' | 'specialized';
  associatedStat: 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
  levelBenefits: {
    [level: number]: string;
  };
  synergies?: SkillName[]; // Skills that provide bonuses to this skill
}

export const skillDefinitions: Record<SkillName, SkillDefinition> = {
  // Combat Skills
  melee_combat: {
    name: "Nahkampf",
    description: "Geschick im Kampf mit Nahkampfwaffen",
    category: "combat",
    associatedStat: "strength",
    levelBenefits: {
      1: "+1 Angriff, +1 Schaden",
      2: "+2 Angriff, +2 Schaden, kann Gelegenheitsangriffe ausführen", 
      3: "+3 Angriff, +3 Schaden, +1 zusätzlicher Angriff pro Runde",
      4: "+4 Angriff, +4 Schaden, kritische Treffer bei 19-20",
      5: "+5 Angriff, +5 Schaden, kann Kampfmanöver ausführen"
    },
    synergies: ['athletics', 'intimidation']
  },
  
  ranged_combat: {
    name: "Fernkampf", 
    description: "Präzision mit Bögen, Armbrüsten und Wurfwaffen",
    category: "combat",
    associatedStat: "dexterity",
    levelBenefits: {
      1: "+1 Angriff, +1 Schaden", 
      2: "+2 Angriff, +2 Schaden, erhöhte Reichweite (+50%)",
      3: "+3 Angriff, +3 Schaden, kann Zielen für +2 Schaden",
      4: "+4 Angriff, +4 Schaden, durchdringt leichte Rüstung",
      5: "+5 Angriff, +5 Schaden, kann mehrere Ziele angreifen"
    },
    synergies: ['perception', 'tracking']
  },
  
  defense: {
    name: "Verteidigung",
    description: "Kunst des Blocks, der Parade und des Ausweichens", 
    category: "combat",
    associatedStat: "dexterity",
    levelBenefits: {
      1: "+1 Rüstungsklasse",
      2: "+2 Rüstungsklasse, kann Angriffe parieren",
      3: "+3 Rüstungsklasse, Schadensreduktion -1",
      4: "+4 Rüstungsklasse, kann Zauber reflektieren",
      5: "+5 Rüstungsklasse, Immunität gegen Überraschungsangriffe"
    }
  },
  
  intimidation: {
    name: "Einschüchterung",
    description: "Durch Präsenz und Drohungen andere beeinflussen",
    category: "combat", 
    associatedStat: "strength",
    levelBenefits: {
      1: "Schwache Gegner können fliehen",
      2: "Kann Moral von Gegnern senken (-1 auf Würfe)",
      3: "Kann Gegner zum Aufgeben zwingen",
      4: "Kann Furcht auslösen (Lähmung für 1 Runde)",
      5: "Legendärer Ruf - Gegner ergeben sich oft sofort"
    },
    synergies: ['leadership', 'melee_combat']
  },

  // Magic Skills
  arcane_knowledge: {
    name: "Arkane Kunde",
    description: "Wissen über Magie, Zaubersprüche und magische Phänomene",
    category: "magic",
    associatedStat: "intelligence", 
    levelBenefits: {
      1: "Kann einfache magische Gegenstände identifizieren",
      2: "Kann Zaubersprüche der Stufe 1-2 analysieren",
      3: "Kann magische Fallen erkennen und entschärfen", 
      4: "Kann Zaubersprüche der Stufe 3-5 verstehen",
      5: "Kann arkane Rituale durchführen und Zauber modifizieren"
    },
    synergies: ['investigation', 'history']
  },
  
  spell_focus: {
    name: "Zauberbeherrschung",
    description: "Konzentration und Kontrolle beim Zaubern",
    category: "magic",
    associatedStat: "wisdom",
    levelBenefits: {
      1: "-1 MP Kosten für Zauber",
      2: "Kann Zauber während Bewegung wirken", 
      3: "+1 Schaden/Heilung bei Zaubern",
      4: "Kann 2 Zauber gleichzeitig aufrecht erhalten",
      5: "Immunität gegen Zauberunterbrechu ng, +2 Zauberschaden"
    }
  },
  
  divine_magic: {
    name: "Göttliche Magie", 
    description: "Macht der Götter für Heilung und Schutz kanalisieren",
    category: "magic",
    associatedStat: "wisdom",
    levelBenefits: {
      1: "Kann leichte Wunden heilen (1d4+WIS)",
      2: "Kann Untote abwehren, Segnungen gewähren",
      3: "Kann schwere Wunden heilen (2d6+WIS), Flüche aufheben",
      4: "Kann Krankheiten heilen, Schutzauren erschaffen",
      5: "Kann Tote wiederbeleben, göttliche Interventionen bewirken"
    },
    synergies: ['religion', 'healing']
  },
  
  alchemy: {
    name: "Alchemie",
    description: "Kunst der Tränke, Gifte und magischen Substanzen",
    category: "magic",
    associatedStat: "intelligence",
    levelBenefits: {
      1: "Kann einfache Heiltränke brauen",
      2: "Kann Giftsalben und Bombentränke herstellen",
      3: "Kann Verbesserungstränke (temporäre Stat-Boni) brauen",
      4: "Kann seltene Materialien transmutieren",
      5: "Kann Elixiere der Unsterblichkeit und Universallösungen brauen"
    }
  },

  // Physical Skills  
  athletics: {
    name: "Athletik",
    description: "Körperliche Kraft, Ausdauer und sportliche Fähigkeiten",
    category: "physical",
    associatedStat: "strength",
    levelBenefits: {
      1: "Kann weitere Sprünge machen (+50% Distanz)",
      2: "Erhöhte Tragkraft (+50%), schnelleres Klettern",
      3: "Kann schwere Objekte bewegen, längere Ausdauer",
      4: "Kann meterhohe Mauern erklimmen, Türen aufbrechen",
      5: "Übermenschliche Kraft - kann kleine Felsen werfen"
    }
  },
  
  stealth: {
    name: "Heimlichkeit", 
    description: "Kunst des Versteckens und lautlosen Bewegens",
    category: "physical",
    associatedStat: "dexterity",
    levelBenefits: {
      1: "+2 Bonus beim Verstecken und Schleichen",
      2: "Kann sich in schwacher Beleuchtung verstecken", 
      3: "Hinterhalt-Angriffe verursachen +1d6 Schaden",
      4: "Kann sich bei Tageslicht in Schatten verstecken",
      5: "Nahezu unsichtbar - kann sich vor den Augen anderer verstecken"
    },
    synergies: ['acrobatics', 'sleight_of_hand']
  },
  
  acrobatics: {
    name: "Akrobatik",
    description: "Geschicklichkeit, Balance und akrobatische Manöver", 
    category: "physical",
    associatedStat: "dexterity",
    levelBenefits: {
      1: "Kann Stürze aus 3m Höhe unbeschadet überstehen",
      2: "Kann auf schmalen Balken balancieren, durch Spalten springen",
      3: "Kann Wändeentlanglaufen, komplexe Sprungsequenzen ausführen",
      4: "Kann von Wänden abspringen, Saltos im Kampf einsetzen", 
      5: "Kann kurzzeitig auf Wasser laufen und an Decken hängen"
    }
  },
  
  sleight_of_hand: {
    name: "Fingerfertigkeit",
    description: "Geschickte Handbewegungen für Taschendiebstahl und Tricks",
    category: "physical", 
    associatedStat: "dexterity",
    levelBenefits: {
      1: "Kann kleine Gegenstände stehlen oder verstecken",
      2: "Kann Taschenspielertricks vorführen, Fallen entschärfen",
      3: "Kann im Kampf Gegenstände stehlen oder Waffen entwenden",
      4: "Kann komplexe Schlösser knacken, präzise Manipulationen",
      5: "Kann selbst unter Beobachtung unmerklich agieren"
    }
  },

  // Mental Skills
  investigation: {
    name: "Untersuchung",
    description: "Logisches Denken und systematische Suche nach Hinweisen",
    category: "mental",
    associatedStat: "intelligence",
    levelBenefits: {
      1: "Kann offensichtliche Hinweise entdecken",
      2: "Kann Zusammenhänge zwischen Hinweisen erkennen",
      3: "Kann versteckte Türen und Kammern finden", 
      4: "Kann komplexe Rätsel lösen, Lügner entlarven",
      5: "Kann durch pure Deduktion Geheimnisse aufdecken"
    }
  },
  
  perception: {
    name: "Wahrnehmung",
    description: "Aufmerksamkeit für Details und Gefahren",
    category: "mental",
    associatedStat: "wisdom", 
    levelBenefits: {
      1: "Schwer zu überraschen, bemerkt offensichtliche Gefahren",
      2: "Kann Fallen und Hinterhalte erkennen",
      3: "Erhöhte Sichtweite, kann feine Details unterscheiden",
      4: "Kann Lügen und versteckte Emotionen erkennen",
      5: "Übernatürliche Sinne - kann Magie und Präsenz spüren"
    }
  },
  
  insight: {
    name: "Menschenkenntnis",
    description: "Menschen und ihre Motive verstehen",
    category: "mental", 
    associatedStat: "wisdom",
    levelBenefits: {
      1: "Kann grundlegende Emotionen erkennen",
      2: "Kann Lügen mit 70% Wahrscheinlichkeit erkennen", 
      3: "Kann Absichten und Pläne erahnen",
      4: "Kann manipulative Versuche sofort durchschauen",
      5: "Kann die tiefsten Geheimnisse und Ängste lesen"
    }
  },
  
  medicine: {
    name: "Heilkunde",
    description: "Wissen über Anatomie, Krankheiten und medizinische Behandlung",
    category: "mental",
    associatedStat: "wisdom",
    levelBenefits: {
      1: "Kann Erste Hilfe leisten (+1 HP wiederherstellen)",
      2: "Kann Gifte und Krankheiten diagnostizieren",
      3: "Kann chirurgische Eingriffe durchführen (+1d4 HP)",
      4: "Kann komplexe Verletzungen behandeln, Prothesen bauen", 
      5: "Kann lebensrettende Operationen durchführen, Organe transplantieren"
    }
  },

  // Social Skills
  persuasion: {
    name: "Überredung",
    description: "Andere durch Logik und Charme überzeugen",
    category: "social",
    associatedStat: "charisma",
    levelBenefits: {
      1: "Kann Preise um 10% verhandeln",
      2: "Kann neutrale Personen positiv beeinflussen",
      3: "Kann Feinde zum Reden bringen, Informationen erhalten",
      4: "Kann Meinungen und Überzeugungen dauerhaft ändern",
      5: "Kann selbst fanatische Anhänger bekehren"
    }
  },
  
  deception: {
    name: "Täuschung", 
    description: "Kunst der Lüge und des Betrugs",
    category: "social",
    associatedStat: "charisma",
    levelBenefits: {
      1: "Kann einfache Lügen glaubhaft erzählen",
      2: "Kann falsche Identitäten annehmen",
      3: "Kann komplexe Intrigen spinnen",
      4: "Kann selbst unter Wahrheitszaubern lügen",
      5: "Meister der Illusion - kann Realität und Lüge verschwimmen lassen"
    }
  },
  
  performance: {
    name: "Auftreten",
    description: "Künstlerische Darbietung und Unterhaltung",
    category: "social", 
    associatedStat: "charisma",
    levelBenefits: {
      1: "Kann durch Auftritte Geld verdienen", 
      2: "Kann Menschenmengen unterhalten und ablenken",
      3: "Kann durch Kunst Emotionen manipulieren",
      4: "Kann magische Effekte in Auftritte einweben",
      5: "Legendärer Künstler - Auftritte verändern das Leben der Zuschauer"
    }
  },
  
  leadership: {
    name: "Führung",
    description: "Andere inspirieren und befehligen",
    category: "social",
    associatedStat: "charisma", 
    levelBenefits: {
      1: "Kann kleine Gruppen (bis 5 Personen) führen",
      2: "Gewährt Verbündeten +1 Moral in kritischen Situationen",
      3: "Kann Armeen organisieren, strategische Befehle erteilen", 
      4: "Inspiriert zu Heldentaten (+2 auf alle Würfe für Gruppe)",
      5: "Legendärer Anführer - Menschen folgen bis in den Tod"
    }
  },

  // Survival Skills
  survival: {
    name: "Überleben",
    description: "In der Wildnis überleben und sich zurechtfinden",
    category: "survival",
    associatedStat: "wisdom",
    levelBenefits: {
      1: "Kann essbare Pflanzen finden, einfache Unterkünfte bauen",
      2: "Kann Feuer machen, Wetter vorhersagen",
      3: "Kann Fallen bauen, sich in allen Klimazonen zurechtfinden", 
      4: "Kann giftige von ungefährlichen Kreaturen unterscheiden",
      5: "Kann jahrelang in der Wildnis leben, wird eins mit der Natur"
    }
  },
  
  nature_lore: {
    name: "Naturkunde",
    description: "Wissen über Pflanzen, Tiere und natürliche Phänomene", 
    category: "survival",
    associatedStat: "intelligence",
    levelBenefits: {
      1: "Kann häufige Tiere und Pflanzen identifizieren",
      2: "Kann Tierverhalten vorhersagen, Heilpflanzen finden",
      3: "Kann mit Tieren kommunizieren, Wetterphänomene verstehen",
      4: "Kann seltene Kreaturen verstehen, ökologische Zusammenhänge nutzen",
      5: "Wird von der Natur als Freund anerkannt - Tiere helfen freiwillig"
    }
  },
  
  tracking: {
    name: "Spurenlesen",
    description: "Spuren verfolgen und Hinweise in der Natur deuten",
    category: "survival",
    associatedStat: "wisdom",
    levelBenefits: {
      1: "Kann frische Spuren auf weichem Boden verfolgen",
      2: "Kann Alter von Spuren bestimmen, Spuren auf hartem Boden lesen",
      3: "Kann aus Spuren Größe, Gewicht und Zustand ableiten", 
      4: "Kann Spuren über große Distanzen und verschiedene Terrains verfolgen",
      5: "Kann selbst magisch verschleierte Spuren aufdecken"
    }
  },
  
  animal_handling: {
    name: "Tierführung", 
    description: "Mit Tieren arbeiten und sie trainieren",
    category: "survival",
    associatedStat: "wisdom",
    levelBenefits: {
      1: "Kann domestizierte Tiere beruhigen und führen",
      2: "Kann wilde Tiere beschwichtigen, einfache Tricks beibringen",
      3: "Kann Tiere als Reittiere nutzen, Bindung zu Tiergefährten aufbauen",
      4: "Kann exotische Kreaturen zähmen, telepathische Verbindung zu Tieren",
      5: "Wird von allen Tieren als Alpha anerkannt - sogar Drachen zeigen Respekt"
    }
  },

  // Craft Skills
  lockpicking: {
    name: "Schlösser knacken",
    description: "Mechanische Verschlüsse öffnen und überwinden",
    category: "craft", 
    associatedStat: "dexterity",
    levelBenefits: {
      1: "Kann einfache Schlösser knacken",
      2: "Kann komplexere Mechanismen öffnen, Dietriche selbst herstellen",
      3: "Kann Safes und Truhen öffnen, Schlösser ohne Werkzeuge knacken",
      4: "Kann magische Schlösser analysieren und umgehen", 
      5: "Kein Schloss kann widerstehen - selbst göttliche Siegel sind nicht sicher"
    }
  },
  
  crafting: {
    name: "Handwerk",
    description: "Gegenstände reparieren und herstellen",
    category: "craft",
    associatedStat: "intelligence",
    levelBenefits: {
      1: "Kann einfache Gegenstände reparieren",
      2: "Kann Waffen und Rüstungen instand halten", 
      3: "Kann neue Gegenstände aus verfügbaren Materialien herstellen",
      4: "Kann magische Eigenschaften in Gegenstände einarbeiten",
      5: "Kann legendäre Artefakte erschaffen - Werke für die Ewigkeit"
    }
  },
  
  engineering: {
    name: "Ingenieurskunst",
    description: "Komplexe Mechanismen und Strukturen verstehen und bauen",
    category: "craft",
    associatedStat: "intelligence", 
    levelBenefits: {
      1: "Kann einfache Maschinen verstehen und reparieren",
      2: "Kann Belagerungswaffen bedienen, Brücken und Befestigungen bauen",
      3: "Kann komplexe mechanische Fallen konstruieren",
      4: "Kann automatisierte Systeme und Golems erschaffen",
      5: "Kann unmögliche Maschinen bauen - Perpetuum Mobile und Dimensionstore"
    }
  },
  
  cooking: {
    name: "Kochkunst",
    description: "Nahrungszubereitung und kulinarische Künste",
    category: "craft",
    associatedStat: "wisdom",
    levelBenefits: {
      1: "Kann schmackhafte Mahlzeiten aus einfachen Zutaten zubereiten",
      2: "Gerichte gewähren temporäre Boni (+1 auf eine Eigenschaft für 4h)",
      3: "Kann aus giftigen Zutaten sichere Nahrung machen",
      4: "Gerichte haben magische Eigenschaften - Heilung, Stärkung, Schutz",
      5: "Göttliche Kochkunst - Gerichte können Flüche brechen und Leben verlängern"
    }
  },

  // Knowledge Skills  
  history: {
    name: "Geschichte",
    description: "Wissen über vergangene Ereignisse und Zivilisationen",
    category: "knowledge",
    associatedStat: "intelligence",
    levelBenefits: {
      1: "Kann wichtige historische Ereignisse einordnen",
      2: "Kann Artefakte und Ruinen zeitlich einordnen",
      3: "Kann aus historischen Parallelen Lösungen ableiten",
      4: "Kann verschollene Zivilisationen und ihre Geheimnisse verstehen", 
      5: "Lebende Chronik - kann jedes vergangene Ereignis rekonstruieren"
    }
  },
  
  religion: {
    name: "Religionskunde", 
    description: "Wissen über Götter, Rituale und spirituelle Praktiken",
    category: "knowledge",
    associatedStat: "wisdom",
    levelBenefits: {
      1: "Kann Göttersymbole und Rituale identifizieren",
      2: "Kann Segnungen sprechen, geheilgte Orte erkennen",
      3: "Kann mit Priestern aller Glaubensrichtungen kommunizieren",
      4: "Kann komplexe Rituale durchführen, göttliche Gunst erlangen",
      5: "Wird von allen Religionen respektiert - kann sogar mit Göttern sprechen"
    }
  },
  
  politics: {
    name: "Politik",
    description: "Verständnis für Machtverhältnisse und diplomatische Beziehungen", 
    category: "knowledge",
    associatedStat: "intelligence",
    levelBenefits: {
      1: "Kann lokale Machtstrukturen verstehen",
      2: "Kann politische Spannungen erkennen und nutzen",
      3: "Kann diplomatische Verhandlungen führen",
      4: "Kann Intrigen planen und Allianzen schmieden",
      5: "Königsmacher - kann Reiche stürzen und errichten"
    }
  },
  
  languages: {
    name: "Sprachen",
    description: "Beherrschung verschiedener Sprachen und Schriften",
    category: "knowledge", 
    associatedStat: "intelligence",
    levelBenefits: {
      1: "Spricht 2 zusätzliche Sprachen fließend",
      2: "Kann aus Kontext fremde Sprachen verstehen",
      3: "Kann alte und tote Sprachen entziffern", 
      4: "Kann jede gehörte Sprache innerhalb von Tagen erlernen",
      5: "Universalgelehrter - versteht alle Sprachen, auch magische Runen"
    }
  },

  // Specialized Skills
  healing: {
    name: "Heilung",
    description: "Natürliche und magische Heilmethoden",
    category: "specialized",
    associatedStat: "wisdom", 
    levelBenefits: {
      1: "Kann 1d4 HP bei Kurzer Rast heilen",
      2: "Kann Vergiftungen und leichte Krankheiten behandeln",
      3: "Kann 2d4+WIS HP pro Tag heilen, Wunden schließen", 
      4: "Kann verlorene Gliedmaßen regenerieren lassen",
      5: "Kann Tote wiederbeleben (innerhalb von 24h nach Tod)"
    }
  },
  
  poison_knowledge: {
    name: "Giftkunde",
    description: "Wissen über Gifte und deren Anwendung",
    category: "specialized",
    associatedStat: "intelligence",
    levelBenefits: {
      1: "Kann häufige Gifte identifizieren und behandeln",
      2: "Kann einfache Gifte aus Pflanzen herstellen",
      3: "Kann komplexe Gifte brauen, Waffen vergiften", 
      4: "Kann tödliche Gifte herstellen, Immunität gegen die meisten Toxine",
      5: "Meister der Toxikologie - kann unmerkliche Gifte erschaffen, die erst nach Wochen wirken"
    }
  },
  
  trap_detection: {
    name: "Fallen erkennen",
    description: "Mechanische und magische Fallen aufspüren und entschärfen",
    category: "specialized",
    associatedStat: "wisdom",
    levelBenefits: {
      1: "Kann offensichtliche mechanische Fallen erkennen",
      2: "Kann versteckte Druckplatten und Auslöser finden",
      3: "Kann magische Fallen und Glyphen erkennen",
      4: "Kann Fallen entschärfen und für eigene Zwecke umbauen", 
      5: "Fallenmeister - kann unmögliche Fallen konstruieren, die sich selbst reparieren"
    }
  },
  
  navigation: {
    name: "Navigation",
    description: "Orientierung und Wegfindung in unbekanntem Terrain",
    category: "specialized", 
    associatedStat: "wisdom",
    levelBenefits: {
      1: "Kann sich mit Kompass und Karte orientieren",
      2: "Kann nach den Sternen navigieren, Entfernungen schätzen",
      3: "Kann auch ohne Hilfsmittel die Richtung finden",
      4: "Kann magische Störungen in der Navigation umgehen", 
      5: "Unfehlbarer Orientierungssinn - findet immer den besten Weg, selbst zwischen Dimensionen"
    }
  }
};

/**
 * Berechnet Skill-Bonus basierend auf Level und Synergien
 */
export function calculateSkillBonus(
  skill: Skill,
  characterSkills: Skill[],
  stats: Record<string, number>
): number {
  const definition = skillDefinitions[skill.name as SkillName];
  if (!definition) return skill.level;
  
  let bonus = skill.level;
  
  // Attributsbonus
  const statValue = stats[definition.associatedStat] || 10;
  const statModifier = Math.floor((statValue - 10) / 2);
  bonus += statModifier;
  
  // Synergien
  if (definition.synergies) {
    const synergyBonus = definition.synergies.reduce((total, synergySkill) => {
      const synergyLevel = characterSkills.find(s => s.name === synergySkill)?.level || 0;
      return total + Math.floor(synergyLevel / 2); // Halbes Level als Synergie-Bonus
    }, 0);
    bonus += synergyBonus;
  }
  
  return bonus;
}

/**
 * Überprüft ob ein Skill auf das nächste Level aufgewertet werden kann
 */
export function canUpgradeSkill(skill: Skill, characterLevel: number): boolean {
  // Skill level kann nicht höher als Charakterlevel sein
  if (skill.level >= characterLevel) return false;
  
  // Skill level kann nicht höher als Maximum sein
  if (skill.level >= skill.max) return false;
  
  return true;
}

/**
 * Berechnet Kosten für Skill-Upgrade
 */
export function getSkillUpgradeCost(currentLevel: number): number {
  // Exponentiell ansteigende Kosten
  return currentLevel * 100; // 100 XP für Level 1→2, 200 XP für Level 2→3, etc.
}

/**
 * Führt ein Skill-Upgrade durch
 */
export function upgradeSkill(
  skill: Skill, 
  character: { experience: number; level: number }
): { success: boolean; message: string; updatedSkill?: Skill; remainingXP?: number } {
  
  if (!canUpgradeSkill(skill, character.level)) {
    return {
      success: false,
      message: "Skill kann nicht aufgewertet werden - Level-Limit erreicht"
    };
  }
  
  const cost = getSkillUpgradeCost(skill.level);
  if (character.experience < cost) {
    return {
      success: false, 
      message: `Nicht genügend Erfahrung. Benötigt: ${cost} XP, verfügbar: ${character.experience} XP`
    };
  }
  
  const updatedSkill = {
    ...skill,
    level: skill.level + 1
  };
  
  return {
    success: true,
    message: `${skill.name} auf Level ${updatedSkill.level} aufgewertet!`,
    updatedSkill,
    remainingXP: character.experience - cost
  };
}

/**
 * Gibt alle verfügbaren Skills einer Kategorie zurück
 */
export function getSkillsByCategory(category: SkillDefinition['category']): SkillDefinition[] {
  return Object.values(skillDefinitions).filter(skill => skill.category === category);
}

/**
 * Generiert Skill-Empfehlungen basierend auf Klasse und Level
 */
export function getSkillRecommendations(
  className: string,
  characterLevel: number,
  currentSkills: Skill[]
): SkillName[] {
  const recommendations: SkillName[] = [];
  const currentSkillNames = currentSkills.map(s => s.name);
  
  // Klassen-spezifische Empfehlungen
  const classRecommendations: Record<string, SkillName[]> = {
    warrior: ['melee_combat', 'defense', 'athletics', 'intimidation'],
    mage: ['arcane_knowledge', 'spell_focus', 'investigation', 'history'],
    rogue: ['stealth', 'sleight_of_hand', 'lockpicking', 'acrobatics'],
    ranger: ['ranged_combat', 'survival', 'tracking', 'nature_lore'],
    cleric: ['divine_magic', 'healing', 'religion', 'leadership']
  };
  
  const classSkills = classRecommendations[className.toLowerCase()] || [];
  
  // Füge noch nicht vorhandene Klassen-Skills hinzu
  classSkills.forEach(skill => {
    if (!currentSkillNames.includes(skill)) {
      recommendations.push(skill);
    }
  });
  
  // Füge synergistische Skills hinzu
  currentSkills.forEach(skill => {
    const definition = skillDefinitions[skill.name as SkillName];
    if (definition?.synergies) {
      definition.synergies.forEach(synergy => {
        if (!currentSkillNames.includes(synergy) && !recommendations.includes(synergy)) {
          recommendations.push(synergy);
        }
      });
    }
  });
  
  return recommendations.slice(0, 5); // Maximal 5 Empfehlungen
}

/**
 * Exportiert Skill-Übersicht als Text
 */
export function exportSkillSummary(skills: Skill[], stats: Record<string, number>): string {
  return skills.map(skill => {
    const bonus = calculateSkillBonus(skill, skills, stats);
    const definition = skillDefinitions[skill.name as SkillName];
    const benefit = definition?.levelBenefits[skill.level] || "Keine Beschreibung verfügbar";
    
    return `${skill.name} (Level ${skill.level}, +${bonus}): ${benefit}`;
  }).join('\n');
}

export const spellDefinitions: Record<string, { name: string; cost: number; description: string; school: string; type: string; tags: string[]; allowedClasses: string[]; allowedRaces: string[]; }> = {
  // --- Allgemeine Magie ---
  feuerball: { 
    name: 'Feuerball', cost: 10, description: 'Ein flammendes Geschoss, das bei Aufprall explodiert.', 
    school: 'evocation', type: 'arcane', tags: ['fire', 'aoe'], 
    allowedClasses: ['mage'], allowedRaces: [] 
  },
  magisches_geschoss: { 
    name: 'Magisches Geschoss', cost: 2, description: 'Ein Geschoss aus reiner Magie, das sein Ziel nie verfehlt.', 
    school: 'evocation', type: 'arcane', tags: ['force'], 
    allowedClasses: ['mage', 'warlock'], allowedRaces: [] 
  },
  schild: { 
    name: 'Schild', cost: 5, description: 'Ein magischer Schild, der Schaden abwehrt.', 
    school: 'abjuration', type: 'arcane', tags: ['defense'], 
    allowedClasses: ['mage', 'paladin'], allowedRaces: [] 
  },

  // --- Göttliche Magie (Paladin/Druide) ---
  heilung: { 
    name: 'Heilung', cost: 5, description: 'Heilt die Wunden eines Verbündeten.', 
    school: 'evocation', type: 'divine', tags: ['healing'], 
    allowedClasses: ['paladin', 'druid'], allowedRaces: [] 
  },
  schutz_vor_boesem: { 
    name: 'Schutz vor Bösem', cost: 8, description: 'Schützt ein Ziel vor bösen Kreaturen.', 
    school: 'abjuration', type: 'divine', tags: ['defense', 'utility'], 
    allowedClasses: ['paladin'], allowedRaces: [] 
  },

  // --- Naturmagie (Druide/Waldläufer) ---
  dornenpeitsche: { 
    name: 'Dornenpeitsche', cost: 4, description: 'Eine Peitsche aus Dornen, die den Gegner verletzt und zu dir zieht.', 
    school: 'transmutation', type: 'nature', tags: ['crowd-control'], 
    allowedClasses: ['druid'], allowedRaces: ['wood_elf'] 
  },
  wurzelfalle: { 
    name: 'Wurzelfalle', cost: 6, description: 'Lässt Wurzeln aus dem Boden schießen, die Gegner festhalten.', 
    school: 'conjuration', type: 'nature', tags: ['crowd-control'], 
    allowedClasses: ['druid', 'ranger'], allowedRaces: ['wood_elf'] 
  },
  tierfreund: { 
    name: 'Tierfreund', cost: 3, description: 'Beruhigt ein Tier oder macht es dir freundlich gesinnt.', 
    school: 'enchantment', type: 'nature', tags: ['utility', 'social'], 
    allowedClasses: ['druid', 'ranger'], allowedRaces: ['wood_elf'] 
  },

  // --- Hexenmeister Magie ---
  schauriger_strahl: { 
    name: 'Schauriger Strahl', cost: 3, description: 'Ein Strahl aus unheimlicher Energie.', 
    school: 'evocation', type: 'arcane', tags: ['necrotic', 'dark'], 
    allowedClasses: ['warlock'], allowedRaces: ['dark_elf'] 
  },
  hexenpfeil: { 
    name: 'Hexenpfeil', cost: 6, description: 'Ein Pfeil, der zusätzlichen Schaden über Zeit verursacht.', 
    school: 'enchantment', type: 'arcane', tags: ['dot'], 
    allowedClasses: ['warlock'], allowedRaces: [] 
  },

  // --- Rassenmagie ---
  helles_licht: { 
    name: 'Helles Licht', cost: 4, description: 'Erzeugt eine Kugel aus hellem Licht, die Untote verletzt.', 
    school: 'evocation', type: 'divine', tags: ['light', 'radiant'], 
    allowedClasses: [], allowedRaces: ['high_elf'] 
  },
  sonnenstrahl: { 
    name: 'Sonnenstrahl', cost: 8, description: 'Ein Strahl gleißenden Lichts, der Gegner blendet und verbrennt.', 
    school: 'evocation', type: 'divine', tags: ['light', 'radiant', 'fire'], 
    allowedClasses: [], allowedRaces: ['high_elf'] 
  },
  schattenmantel: { 
    name: 'Schattenmantel', cost: 5, description: 'Umhüllt dich mit Schatten und macht dich schwerer zu treffen.', 
    school: 'illusion', type: 'arcane', tags: ['dark', 'defense'], 
    allowedClasses: [], allowedRaces: ['dark_elf'] 
  },
  lebensentzug: { 
    name: 'Lebensentzug', cost: 7, description: 'Entzieht einem Gegner Lebensenergie und heilt dich.', 
    school: 'necromancy', type: 'arcane', tags: ['dark', 'necrotic', 'healing'], 
    allowedClasses: [], allowedRaces: ['dark_elf'] 
  },

  // --- Klassenspezifische "Zauber" (Krieger/Waldläufer) ---
  // Waldläufer
  giftpfeil: { 
    name: 'Giftpfeil', cost: 4, description: 'Ein Pfeil, der mit einem lähmenden Gift überzogen ist.', 
    school: 'transmutation', type: 'martial', tags: ['arrow', 'poison', 'crowd-control'], 
    allowedClasses: ['ranger'], allowedRaces: [] 
  },
  dornenpfeil: { 
    name: 'Dornenpfeil', cost: 5, description: 'Ein magischer Pfeil, der bei Aufprall Dornen explodieren lässt.', 
    school: 'conjuration', type: 'nature', tags: ['arrow', 'aoe'], 
    allowedClasses: ['ranger'], allowedRaces: ['wood_elf'] 
  },
  explosionspfeil: { 
    name: 'Explosionspfeil', cost: 8, description: 'Ein Pfeil, der bei Aufprall eine kleine Explosion verursacht.', 
    school: 'evocation', type: 'martial', tags: ['arrow', 'fire', 'aoe'], 
    allowedClasses: ['ranger'], allowedRaces: [] 
  },

  // Krieger
  klingenschild: { 
    name: 'Klingenschild', cost: 3, description: 'Du wirbelst deine Waffe so schnell, dass sie Geschosse abwehrt.', 
    school: 'abjuration', type: 'martial', tags: ['blade', 'defense'], 
    allowedClasses: ['warrior'], allowedRaces: [] 
  },
  tanz_der_klingen: { 
    name: 'Tanz der Klingen', cost: 6, description: 'Ein schneller Angriff, der mehrere Gegner in Reichweite trifft.', 
    school: 'evocation', type: 'martial', tags: ['blade', 'aoe'], 
    allowedClasses: ['warrior', 'rogue'], allowedRaces: [] 
  },
  schockwelle: { 
    name: 'Schockwelle', cost: 7, description: 'Du schlägst mit deiner Waffe auf den Boden und erzeugst eine Schockwelle, die Gegner umwirft.', 
    school: 'evocation', type: 'martial', tags: ['blade', 'crowd-control', 'aoe'], 
    allowedClasses: ['warrior'], allowedRaces: [] 
  }
};