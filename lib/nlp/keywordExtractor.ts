export type KeywordCategory = 'combat' | 'social' | 'exploration' | 'puzzle' | 'downtime';

export interface KeywordMetadata {
  category: KeywordCategory;
  weight: number; // 0.1 - 1.0, how strongly this keyword indicates the category
  sentiment: number; // -1.0 (negative) to 1.0 (positive)
}

export const keywordDictionary: Record<string, KeywordMetadata> = {
  // Combat Keywords
  angriff: { category: 'combat', weight: 0.8, sentiment: -0.5 },
  attacke: { category: 'combat', weight: 0.8, sentiment: -0.5 },
  kampf: { category: 'combat', weight: 0.9, sentiment: -0.6 },
  schaden: { category: 'combat', weight: 0.7, sentiment: -0.7 },
  waffe: { category: 'combat', weight: 0.6, sentiment: -0.2 },
  verteidigen: { category: 'combat', weight: 0.5, sentiment: 0.1 },
  blocken: { category: 'combat', weight: 0.5, sentiment: 0.1 },
  ausweichen: { category: 'combat', weight: 0.5, sentiment: 0.2 },
  treffer: { category: 'combat', weight: 0.6, sentiment: -0.4 },
  kritisch: { category: 'combat', weight: 0.9, sentiment: -0.8 },
  feind: { category: 'combat', weight: 0.7, sentiment: -0.5 },
  gegner: { category: 'combat', weight: 0.7, sentiment: -0.5 },
  monster: { category: 'combat', weight: 0.8, sentiment: -0.7 },

  // Social Keywords
  sprechen: { category: 'social', weight: 0.7, sentiment: 0.2 },
  sagen: { category: 'social', weight: 0.6, sentiment: 0.1 },
  fragen: { category: 'social', weight: 0.7, sentiment: 0.1 },
  antworten: { category: 'social', weight: 0.6, sentiment: 0.2 },
  überzeugen: { category: 'social', weight: 0.8, sentiment: 0.4 },
  verhandeln: { category: 'social', weight: 0.9, sentiment: 0.3 },
  einschüchtern: { category: 'social', weight: 0.8, sentiment: -0.4 },
  lügen: { category: 'social', weight: 0.7, sentiment: -0.3 },
  diplomatie: { category: 'social', weight: 0.9, sentiment: 0.5 },
  gerücht: { category: 'social', weight: 0.6, sentiment: -0.1 },
  npc: { category: 'social', weight: 0.5, sentiment: 0.0 },

  // Exploration Keywords
  erkunden: { category: 'exploration', weight: 0.9, sentiment: 0.3 },
  suchen: { category: 'exploration', weight: 0.7, sentiment: 0.1 },
  untersuchen: { category: 'exploration', weight: 0.8, sentiment: 0.2 },
  entdecken: { category: 'exploration', weight: 0.9, sentiment: 0.5 },
  raum: { category: 'exploration', weight: 0.5, sentiment: 0.0 },
  tür: { category: 'exploration', weight: 0.6, sentiment: 0.1 },
  gang: { category: 'exploration', weight: 0.5, sentiment: 0.0 },
  karte: { category: 'exploration', weight: 0.7, sentiment: 0.1 },
  geheimnis: { category: 'exploration', weight: 0.8, sentiment: 0.4 },
  falle: { category: 'exploration', weight: 0.7, sentiment: -0.6 },
  umsehen: { category: 'exploration', weight: 0.7, sentiment: 0.1 },

  // Puzzle Keywords
  rätsel: { category: 'puzzle', weight: 0.9, sentiment: 0.2 },
  mechanismus: { category: 'puzzle', weight: 0.8, sentiment: 0.1 },
  lösung: { category: 'puzzle', weight: 0.7, sentiment: 0.4 },
  hebel: { category: 'puzzle', weight: 0.6, sentiment: 0.0 },
  schalter: { category: 'puzzle', weight: 0.6, sentiment: 0.0 },
  kombination: { category: 'puzzle', weight: 0.8, sentiment: 0.1 },
  symbol: { category: 'puzzle', weight: 0.7, sentiment: 0.1 },

  // Downtime Keywords
  rasten: { category: 'downtime', weight: 0.8, sentiment: 0.5 },
  lager: { category: 'downtime', weight: 0.7, sentiment: 0.3 },
  feuer: { category: 'downtime', weight: 0.6, sentiment: 0.2 },
  essen: { category: 'downtime', weight: 0.5, sentiment: 0.3 },
  trinken: { category: 'downtime', weight: 0.5, sentiment: 0.3 },
  schlafen: { category: 'downtime', weight: 0.8, sentiment: 0.5 },
  entspannen: { category: 'downtime', weight: 0.9, sentiment: 0.6 },
};
