import { useState, useCallback } from 'react';
import { LeaderboardEntry, Language, TimeDuration, DailyBest } from '@/types/game';

const LEADERBOARD_KEY = 'typing_battle_leaderboard';
const DAILY_BEST_KEY = 'typing_battle_daily_best';
const MAX_ENTRIES = 10;

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const addEntry = useCallback((entry: Omit<LeaderboardEntry, 'id' | 'date'>) => {
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    setEntries(prev => {
      const updated = [...prev, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_ENTRIES);
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
      return updated;
    });

    return newEntry;
  }, []);

  const getEntriesByLanguage = useCallback((language: Language, duration?: TimeDuration) => {
    return entries.filter(e =>
      e.language === language && (!duration || e.duration === duration)
    ).sort((a, b) => b.score - a.score);
  }, [entries]);

  const getDailyBest = useCallback((language: Language): DailyBest | null => {
    try {
      const all = JSON.parse(localStorage.getItem(DAILY_BEST_KEY) || '{}');
      const today = new Date().toDateString();
      const key = `${language}_${today}`;
      return all[key] || null;
    } catch {
      return null;
    }
  }, []);

  const updateDailyBest = useCallback((language: Language, wpm: number, accuracy: number) => {
    try {
      const all = JSON.parse(localStorage.getItem(DAILY_BEST_KEY) || '{}');
      const today = new Date().toDateString();
      const key = `${language}_${today}`;
      const current = all[key];
      if (!current || wpm > current.wpm) {
        all[key] = { wpm, accuracy, date: today, language };
        localStorage.setItem(DAILY_BEST_KEY, JSON.stringify(all));
      }
    } catch {
      // ignore
    }
  }, []);

  const clearLeaderboard = useCallback(() => {
    localStorage.removeItem(LEADERBOARD_KEY);
    setEntries([]);
  }, []);

  return {
    entries,
    addEntry,
    getEntriesByLanguage,
    getDailyBest,
    updateDailyBest,
    clearLeaderboard,
  };
}
