// lib/character/backstoryGenerator.ts

import { Character } from '@/schemas/character';

export interface BackstoryPrompts {
  originPrompts: string[];
  personalityPrompts: string[];
  motivationPrompts: string[];
  flawPrompts: string[];
  bondPrompts: string[];
  idealPrompts: string[];
  fearPrompts: string[];
}

export const backstoryPrompts: Record<string, BackstoryPrompts> = {
  warrior: {
    originPrompts: [
      "Ein ehemaliger Stadtgardist, der seine Heimat nach einem Skandal verlassen musste",
      "Ein Söldner, der nach Jahren des Kampfes nach einem neuen Lebenssinn sucht", 
      "Ein Adliger, der sein Erbe aufgab um als Krieger die Welt zu bereisen",
      "Ein ehemaliger Schmied, der zu den Waffen griff um seine Familie zu rächen",
      "Ein Veteran aus einem großen Krieg, der mit den Geistern der Vergangenheit kämpft"
    ],
    personalityPrompts: [
      "Direkt und ehrlich, manchmal zu einem Fehler",
      "Beschützend gegenüber den Schwächeren, misstrauisch gegenüber Autoritäten",
      "Ruhig und bedacht, explodiert nur in extremen Situationen",
      "Stolz auf ihre Kampffähigkeiten, respektiert würdige Gegner",
      "Pragmatisch und lösungsorientiert, wenig Geduld für endlose Diskussionen"
    ],
    motivationPrompts: [
      "Sucht nach einem würdigen Kampf, um ihre Fähigkeiten zu beweisen",
      "Will unschuldige Menschen vor den Gefahren der Welt beschützen", 
      "Ist auf der Suche nach einem verlorenen Freund oder Familienmitglied",
      "Möchte genug Gold verdienen, um in Würde zu leben",
      "Strebt danach, eine Legende zu werden, von der man noch lange erzählt"
    ],
    flawPrompts: [
      "Kann nicht widerstehen, einen Kampf anzunehmen, selbst wenn die Chancen schlecht stehen",
      "Vertraut zu schnell anderen Kriegern, wird oft von Betrügern ausgenutzt",
      "Trinkt zu viel, um die Erinnerungen an vergangene Schlachten zu vergessen",
      "Wird ungeduldig bei subtilen Problemen, die nicht mit dem Schwert gelöst werden können",
      "Hat Angst vor Magie und magischen Kreaturen aufgrund eines traumatischen Erlebnisses"
    ],
    bondPrompts: [
      "Meine alte Waffe ist ein Erbstück und mein wertvollster Besitz",
      "Ich schulde einem anderen Krieger mein Leben",
      "Meine Heimatstadt wird von Banditen bedroht",
      "Ein alter Mentor hat mich trainiert und ich will ihn stolz machen"
    ],
    idealPrompts: [
      "Ehre: Ein gegebenes Wort muss gehalten werden",
      "Mut: Niemals vor einer gerechten Sache zurückweichen", 
      "Schutz: Die Starken müssen die Schwachen beschützen",
      "Gerechtigkeit: Verbrechen müssen bestraft werden"
    ],
    fearPrompts: [
      "Dass ihre Kampfkraft nachlässt und sie nutzlos wird",
      "Magische Kreaturen und Untote",
      "Den Respekt der Kameraden zu verlieren",
      "Ihre Familie in Gefahr zu bringen"
    ]
  },
  
  mage: {
    originPrompts: [
      "Ein ehemaliger Akademie-Student, der wegen verbotener Experimente verwiesen wurde",
      "Ein Autodidakt, der Magie aus alten Büchern lernte und nun mehr Wissen sucht",
      "Ein ehemaliger Hofmagier, der bei politischen Intrigen in Ungnade fiel",
      "Ein Waisenkind, das seine magischen Fähigkeiten erst spät entdeckte", 
      "Ein Gelehrter, der durch ein magisches Artefakt Zugang zur Magie erhielt"
    ],
    personalityPrompts: [
      "Neugierig und wissenshungrig, manchmal rücksichtslos in der Forschung",
      "Vorsichtig und methodisch, testet alles dreimal bevor sie handeln",
      "Arrogant aufgrund ihres Wissens, lernt langsam Demut",
      "Freundlich aber zerstreut, verliert sich oft in magischen Theorien",
      "Misstrauisch gegenüber anderen Magiern, hütet ihre Geheimnisse eifersüchtig"
    ],
    motivationPrompts: [
      "Sucht nach verlorenem magischen Wissen in alten Ruinen und Bibliotheken",
      "Will ihre magischen Fähigkeiten perfektionieren und neue Zauber entwickeln",
      "Ist auf der Suche nach einem mächtigen Artefakt oder magischen Gegenstand",
      "Möchte die Geheimnisse einer bestimmten Schule der Magie entschlüsseln",
      "Strebt danach, Magie zu nutzen um der Menschheit zu helfen"
    ],
    flawPrompts: [
      "Experimentiert rücksichtslos und riskiert dabei sich selbst und andere",
      "Ist süchtig nach magischer Macht und nimmt große Risiken in Kauf",
      "Verachtet 'primitive' nicht-magische Lösungen für Probleme",
      "Hat Schwierigkeiten, einfache alltägliche Probleme ohne Magie zu lösen",
      "Wird obsessiv bei magischen Rätseln und vergisst alles andere"
    ],
    bondPrompts: [
      "Mein Zauberbuch enthält das gesammelte Wissen meines Mentors",
      "Ich bin einem anderen Magier einen großen Gefallen schuldig",
      "Meine magischen Experimente haben jemandem geschadet",
      "Eine magische Kreatur ist mir in einer schweren Zeit beigestanden"
    ],
    idealPrompts: [
      "Wissen: Information sollte frei zugänglich sein",
      "Macht: Magie muss verantwortungsvoll eingesetzt werden",
      "Fortschritt: Durch Magie kann die Welt verbessert werden",
      "Wahrheit: Die Geheimnisse des Universums müssen erforscht werden"
    ],
    fearPrompts: [
      "Ihre magischen Fähigkeiten zu verlieren",
      "Von einem mächtigeren Magier übertroffen zu werden", 
      "Dass ihre Experimente katastrophale Folgen haben",
      "Die Kontrolle über mächtige Magie zu verlieren"
    ]
  },
  
  rogue: {
    originPrompts: [
      "Ein ehemaliger Straßendieb, der nach größeren Abenteuern sucht",
      "Ein gefallener Adliger, der ihre Fähigkeiten für das Überleben entwickelte",
      "Ein ehemaliger Spion, der ihre alten Auftraggeber verriet",
      "Ein Waisenkind, das auf der Straße aufwuchs und dort alles lernte",
      "Ein ehemaliger Händler, der durch Betrug alles verlor und sich neu erfinden musste"
    ],
    personalityPrompts: [
      "Charmant und witzig, kann aber skrupellos werden wenn nötig",
      "Vorsichtig und paranoid, vertraut niemandem vollständig",
      "Selbstbewusst und waghalsig, liebt das Risiko und die Herausforderung",
      "Loyal zu ihren Freunden, aber erbarmungslos zu Feinden",
      "Zynisch und sarkastisch, verbirgt ein weiches Herz hinter rauer Schale"
    ],
    motivationPrompts: [
      "Sucht nach dem großen Coup, der sie für das Leben versorgt",
      "Will ihre Vergangenheit hinter sich lassen und eine neue Identität aufbauen",
      "Ist auf der Suche nach jemandem aus ihrer Vergangenheit",
      "Möchte einer kriminellen Organisation entkommen, die sie verfolgt",
      "Strebt danach, die besten Diebstahlfähigkeiten der Welt zu meistern"
    ],
    flawPrompts: [
      "Kann der Versuchung eines wertvollen Gegenstandes nicht widerstehen",
      "Vertraut niemandem vollständig und sabotiert dadurch Freundschaften",
      "Nimmt zu große Risiken für zu wenig Gewinn",
      "Hat Feinde aus der kriminellen Vergangenheit, die sie verfolgen",
      "Lügt zwanghaft, selbst wenn die Wahrheit besser wäre"
    ],
    bondPrompts: [
      "Meine Diebeswerkzeuge wurden mir von meinem Mentor geschenkt",
      "Ich schulde der Diebesgilde einen großen Gefallen",
      "Jemand aus meiner Familie sitzt im Gefängnis",
      "Ein alter Partner wurde verraten und ich will Rache"
    ],
    idealPrompts: [
      "Freiheit: Niemand sollte andere kontrollieren oder besitzen",
      "Ehrlichkeit: Es ist besser ehrlich zu stehlen als zu heucheln", 
      "Gemeinschaft: Die Familie (Diebesgilde) kommt zuerst",
      "Gleichgewicht: Die Reichen haben zu viel, die Armen zu wenig"
    ],
    fearPrompts: [
      "Gefangen genommen und eingesperrt zu werden",
      "Von alten Feinden entdeckt zu werden",
      "Die Beweglichkeit und Geschicklichkeit zu verlieren",
      "Ihre Freunde durch ihre Vergangenheit in Gefahr zu bringen"
    ]
  },

  ranger: {
    originPrompts: [
      "Ein ehemaliger Dorfbewohner, dessen Heimat zerstört wurde und der in der Wildnis Zuflucht fand",
      "Ein Waldläufer, der als Kind von Tieren aufgezogen wurde",
      "Ein ehemaliger Soldat, der nach dem Krieg Frieden in der Natur suchte",
      "Ein Wanderer, der zwischen der zivilisierten Welt und der Wildnis vermittelt",
      "Ein Stammeskrieger, der seine Heimat verließ um die große Welt zu erkunden"
    ],
    personalityPrompts: [
      "Ruhig und bedacht, bevorzugt die Gesellschaft der Tiere vor Menschen",
      "Weise und geduldig, aber entschlossen wenn Unrecht geschieht",
      "Misstrauisch gegenüber der Zivilisation, fühlt sich in Städten unwohl",
      "Beschützend gegenüber der Natur, wird wütend bei Umweltzerstörung",
      "Spirituell und nachdenklich, sieht Verbindungen die anderen verborgen bleiben"
    ],
    motivationPrompts: [
      "Sucht nach dem Gleichgewicht zwischen Natur und Zivilisation",
      "Will ein bestimmtes Naturgebiet vor Zerstörung bewahren",
      "Ist auf der Suche nach einem seltenen oder magischen Tier",
      "Möchte alte Waldläufer-Traditionen bewahren und weitergeben",
      "Strebt danach, ein Wächter der Wildnis zu werden"
    ],
    flawPrompts: [
      "Fühlt sich in sozialen Situationen unwohl und macht oft Fehler",
      "Vertraut Tieren mehr als Menschen und wird oft enttäuscht",
      "Wird gewalttätig wenn sie Tierquälerei oder Umweltzerstörung sieht",
      "Hat Schwierigkeiten mit moderner Technologie und Stadtleben",
      "Ist zu stolz um um Hilfe zu bitten, selbst wenn sie sie braucht"
    ],
    bondPrompts: [
      "Mein Tiergefährte ist mein treuester Freund",
      "Ein bestimmtes Waldgebiet ist meine Heimat und muss geschützt werden",
      "Ein alter Waldläufer lehrte mich alles was ich weiß",
      "Ich habe einen Eid geschworen, die Natur zu beschützen"
    ],
    idealPrompts: [
      "Natur: Die natürliche Ordnung muss bewahrt werden",
      "Leben: Alles Leben ist heilig und wertvoll",
      "Harmonie: Zivilisation und Natur müssen in Einklang stehen",
      "Weisheit: Die Natur lehrt uns mehr als jedes Buch"
    ],
    fearPrompts: [
      "Die Zerstörung der Wildnis durch die Zivilisation",
      "Den Kontakt zur Natur zu verlieren",
      "Ihren Tiergefährten zu verlieren",
      "In einer Stadt gefangen zu werden"
    ]
  },

  
};

/**
 * Generiert eine KI-gestützte Hintergrundgeschichte
 */
export async function generateAIBackstory(character: Partial<Character>): Promise<{
  origin: string;
  personality: string;
  motivation: string;
  flaw: string;
  bonds: string[];
  ideals: string[];
  fears: string[];
}> {
  const className = character.cls?.toLowerCase() || 'warrior';
  const prompts = backstoryPrompts[className] || backstoryPrompts.warrior;
  
  // Wähle zufällige Prompts aus
  const selectedOrigin = prompts.originPrompts[Math.floor(Math.random() * prompts.originPrompts.length)];
  const selectedPersonality = prompts.personalityPrompts[Math.floor(Math.random() * prompts.personalityPrompts.length)];
  const selectedMotivation = prompts.motivationPrompts[Math.floor(Math.random() * prompts.motivationPrompts.length)];
  const selectedFlaw = prompts.flawPrompts[Math.floor(Math.random() * prompts.flawPrompts.length)];
  
  // Wähle 2-3 Bonds, Ideals, Fears
  const selectedBonds = prompts.bondPrompts
    .sort(() => 0.5 - Math.random())
    .slice(0, 2 + Math.floor(Math.random() * 2));
  
  const selectedIdeals = prompts.idealPrompts
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);
    
  const selectedFears = prompts.fearPrompts
    .sort(() => 0.5 - Math.random())
    .slice(0, 1 + Math.floor(Math.random() * 2));

  return {
    origin: selectedOrigin,
    personality: selectedPersonality,
    motivation: selectedMotivation,
    flaw: selectedFlaw,
    bonds: selectedBonds,
    ideals: selectedIdeals,
    fears: selectedFears
  };
}

/**
 * Generiert eine vollständige Hintergrundgeschichte als Fließtext
 */
export function generateBackstoryNarrative(backstory: {
  origin: string;
  personality: string;
  motivation: string;
  flaw: string;
  bonds: string[];
  ideals: string[];
  fears: string[];
}, characterName: string, className: string): string {
  const narrative = `
**${characterName}, ${className}**

**Herkunft:** ${backstory.origin}

**Persönlichkeit:** ${backstory.personality}

**Motivation:** ${backstory.motivation}

**Schwäche:** ${backstory.flaw}

**Bindungen:**
${backstory.bonds.map(bond => `• ${bond}`).join('\n')}

**Ideale:**
${backstory.ideals.map(ideal => `• ${ideal}`).join('\n')}

**Ängste:**
${backstory.fears.map(fear => `• ${fear}`).join('\n')}
  `.trim();

  return narrative;
}

/**
 * Erstellt Backstory-Prompt für KI-Generierung
 */
export function createBackstoryPrompt(character: Partial<Character>): string {
  const name = character.name || 'Unbekannt';
  const className = character.cls || 'Abenteurer';
  const stats = character.stats || {};
  
  return `
Erstelle eine detaillierte Hintergrundgeschichte für den Charakter "${name}", einen ${className}.

Charaktereigenschaften:
- Stärke: ${stats.strength || 10}
- Geschicklichkeit: ${stats.dexterity || 10}
- Konstitution: ${stats.constitution || 10}
- Intelligenz: ${stats.intelligence || 10}
- Weisheit: ${stats.wisdom || 10}
- Charisma: ${stats.charisma || 10}

Erstelle eine Geschichte, die folgende Aspekte abdeckt:
1. Herkunft und frühes Leben
2. Wie sie zur aktuellen Klasse kam
3. Persönlichkeitsmerkmale basierend auf den Attributen
4. Eine zentrale Motivation für Abenteuer
5. Eine menschliche Schwäche oder einen Charakterfehler
6. 2-3 wichtige Bindungen (Personen, Orte, Objekte)
7. 1-2 Ideale die den Charakter antreiben
8. 1-2 Ängste die den Charakter verwundbar machen

Die Geschichte sollte etwa 200-300 Wörter lang sein und auf Deutsch verfasst werden.
Mache den Charakter interessant und vielschichtig, aber nicht übermächtig oder tragisch.
  `.trim();
}

/**
 * Backstory-Kompatibilitäts-Check mit Klasse
 */
export function validateBackstoryCompatibility(
  backstory: { motivation?: string; ideals?: string[] }, 
  className: string
): { compatible: boolean; suggestions: string[] } {
  const suggestions: string[] = [];
  const classData = backstoryPrompts[className.toLowerCase()];
  
  if (!classData) {
    return { compatible: true, suggestions: [] };
  }
  
  // Prüfe ob Motivation zur Klasse passt
  const hasRelevantMotivation = classData.motivationPrompts.some(prompt =>
    backstory.motivation?.toLowerCase().includes(prompt.toLowerCase().split(' ')[0])
  );
  
  if (!hasRelevantMotivation) {
    suggestions.push(`Motivation könnte besser zur ${className}-Klasse passen`);
  }
  
  // Prüfe Ideale
  if ((backstory.ideals ?? []).length < 1) {
    suggestions.push('Mindestens ein Ideal sollte definiert werden');
  }
  
  return {
    compatible: suggestions.length === 0,
    suggestions
  };
}