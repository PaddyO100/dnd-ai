export interface SaveMetadata {
  id: string;
  timestamp: number;
  campaignName?: string;
  playerNames?: string[];
  currentLocation?: string;
  playTime?: number; // in minutes
  version: string;
  gameState?: 'active' | 'completed' | 'paused';
}
