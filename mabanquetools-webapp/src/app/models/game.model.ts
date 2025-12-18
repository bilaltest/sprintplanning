export interface Game {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GameScore {
  id: string;
  gameId: string;
  userId?: string;
  visitorName?: string;
  score: number;
  wpm?: number;
  accuracy?: number;
  metadata?: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface LeaderboardEntry extends GameScore {
  rank: number;
}

export interface MyScoresResponse {
  scores: GameScore[];
  bestScore: number;
  gamesPlayed: number;
}

export interface SubmitScoreResponse extends GameScore {
  rank: number;
  isNewPersonalBest: boolean;
}

export type GameState = 'idle' | 'countdown' | 'playing' | 'finished';

export interface TypingGameResult {
  wordsTyped: number;
  correctWords: number;
  wpm: number;
  accuracy: number;
  streak: number;
  maxStreak: number;
}
