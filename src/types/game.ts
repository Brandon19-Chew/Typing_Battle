export type Language = 'english' | 'chinese' | 'japanese';
export type TimeDuration = 15 | 30 | 60 | 120;
export type GameStatus = 'idle' | 'countdown' | 'playing' | 'finished';

export interface GameConfig {
  language: Language;
  duration: TimeDuration;
}

export interface CharState {
  char: string;
  status: 'pending' | 'correct' | 'incorrect' | 'current';
}

export interface GameStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  combo: number;
  maxCombo: number;
  timeLeft: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  combo: number;
  language: Language;
  duration: TimeDuration;
  date: string;
  score: number;
}

export interface DailyBest {
  wpm: number;
  accuracy: number;
  date: string;
  language: Language;
}
