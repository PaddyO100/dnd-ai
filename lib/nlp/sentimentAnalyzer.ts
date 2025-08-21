export const sentimentScores: Record<string, number> = {
  // Positive words
  erfolg: 2,
  gewonnen: 3,
  gelungen: 2,
  freund: 2,
  hilfe: 2,
  schatz: 3,
  sieg: 3,
  held: 3,
  gut: 1,
  schön: 1,
  toll: 1,
  super: 1,
  perfekt: 2,

  // Negative words
  versagt: -2,
  verloren: -3,
  misslungen: -2,
  feind: -2,
  gegner: -2,
  monster: -3,
  falle: -2,
  gefahr: -3,
  bedrohung: -3,
  tod: -4,
  schlecht: -1,
  hässlich: -1,
  schrecklich: -2,
  furchtbar: -2,
};

export function analyzeSentiment(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let totalScore = 0;
  let wordCount = 0;

  for (const word of words) {
    if (sentimentScores[word]) {
      totalScore += sentimentScores[word];
      wordCount++;
    }
  }

  return wordCount > 0 ? totalScore / wordCount : 0;
}
