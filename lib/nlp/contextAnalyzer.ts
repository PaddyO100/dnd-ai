import { keywordDictionary, KeywordCategory } from './keywordExtractor';
import { analyzeSentiment } from './sentimentAnalyzer';

export interface TextAnalysisResult {
  categories: Record<KeywordCategory, number>; // Weighted score for each category
  dominantCategory: KeywordCategory;
  sentiment: number;
}

export function analyzeText(text: string): TextAnalysisResult {
  const words = text.toLowerCase().split(/\s+/);
  const categories: Record<KeywordCategory, number> = {
    combat: 0,
    social: 0,
    exploration: 0,
    puzzle: 0,
    downtime: 0,
  };

  for (const word of words) {
    const keywordData = keywordDictionary[word];
    if (keywordData) {
      categories[keywordData.category] += keywordData.weight;
    }
  }

  let dominantCategory: KeywordCategory = 'downtime';
  let maxScore = 0;
  for (const category in categories) {
    if (categories[category as KeywordCategory] > maxScore) {
      maxScore = categories[category as KeywordCategory];
      dominantCategory = category as KeywordCategory;
    }
  }

  const sentiment = analyzeSentiment(text);

  return {
    categories,
    dominantCategory,
    sentiment,
  };
}
