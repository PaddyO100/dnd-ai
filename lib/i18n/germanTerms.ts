export type TermKey =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma'
  | 'hp'
  | 'mp'
  | 'armorClass'
  | 'initiative'
  | 'perception'
  | 'persuasion'
  | 'spellSlots'
  | 'concentration'
  | 'cooldown'
  | 'savingThrow'
  | 'warrior'
  | 'mage'
  | 'rogue'
  | 'paladin'
  | 'ranger'
  | 'druid'
  | 'monk'
  | 'warlock'
  | 'bard';

export interface GermanTerm {
  title: string;
  description: string;
}

export const germanTerms: Record<TermKey, GermanTerm> = {
  strength: { title: 'Stärke', description: 'Beeinflusst Nahkampfschaden, Tragkraft und körperliche Kraftakte.' },
  dexterity: { title: 'Geschicklichkeit', description: 'Bestimmt Initiative, Fernkampffähigkeiten und Ausweichen.' },
  constitution: { title: 'Konstitution', description: 'Erhöht Trefferpunkte (HP) und Widerstand gegen Erschöpfung und Gifte.' },
  intelligence: { title: 'Intelligenz', description: 'Wichtig für Wissensproben und arkanes Zauberwirken.' },
  wisdom: { title: 'Weisheit', description: 'Beeinflusst Wahrnehmung, Intuition und viele göttliche Zauber.' },
  charisma: { title: 'Charisma', description: 'Wirkt sich auf Überzeugungskraft, Auftreten und manche Magieformen aus.' },
  hp: { title: 'Trefferpunkte (HP)', description: 'Wie viel Schaden du aushältst, bevor du kampfunfähig wirst.' },
  mp: { title: 'Magiepunkte (MP)', description: 'Ressource zum Wirken von Zaubern; regeneriert sich mit Ruhe.' },
  armorClass: { title: 'Rüstungsklasse (RK)', description: 'Wie schwer du zu treffen bist – je höher, desto besser.' },
  initiative: { title: 'Initiative', description: 'Bestimmt die Reihenfolge in Kampfrunden.' },
  perception: { title: 'Wahrnehmung', description: 'Wie gut du versteckte Dinge bemerkst und Gefahren erkennst.' },
  persuasion: { title: 'Überzeugung', description: 'Fähigkeit, andere zu beeinflussen oder zu überzeugen.' },
  spellSlots: { title: 'Zauberplätze', description: 'Anzahl der Zauber, die du pro Stufe wirken kannst, bevor du rasten musst.' },
  concentration: { title: 'Konzentration', description: 'Manche Zauber erfordern anhaltende Konzentration und enden, wenn du sie verlierst.' },
  cooldown: { title: 'Abklingzeit', description: 'Zeit oder Runden, bis eine Fähigkeit/Zauber erneut einsetzbar ist.' },
  savingThrow: { title: 'Rettungswurf', description: 'Wurf, um negativen Effekten zu widerstehen (z. B. Gift, Magie).'},
  warrior: { title: 'Krieger', description: 'Frontkämpfer mit Fokus auf Waffen und Rüstung.' },
  mage: { title: 'Magier', description: 'Arkaner Zauberwirker mit mächtigen, aber fragilen Fähigkeiten.' },
  rogue: { title: 'Schurke', description: 'Heimlichkeit, Fallen, gezielte Angriffe und Beweglichkeit.' },
  paladin: { title: 'Paladin', description: 'Heiliger Krieger mit Schutz- und Heilfähigkeiten.' },
  ranger: { title: 'Waldläufer', description: 'Fährtenlesen, Fernkampf und Naturverbundenheit.' },
  druid: { title: 'Druide', description: 'Naturmagie, Verwandlungen und Heilung.' },
  monk: { title: 'Mönch', description: 'Schnell, diszipliniert, mit innerer Ki-Energie.' },
  warlock: { title: 'Hexenmeister', description: 'Paktmagie mit anderenweltlichen Mächten.' },
  bard: { title: 'Barde', description: 'Unterstützung, Inspiration und vielseitige Magie.' },
};

export function getGermanTerm(key: TermKey): GermanTerm | undefined {
  return germanTerms[key];
}
