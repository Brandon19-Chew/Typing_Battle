import { useState, useCallback } from 'react';
import { Language, TimeDuration } from '@/types/game';

const HISTORY_KEY = 'typing_battle_history';
const MAX_HISTORY = 200;

export interface SessionRecord {
  id: string;
  date: string;      // ISO string
  wpm: number;
  rawWpm: number;
  accuracy: number;
  combo: number;
  score: number;
  correctChars: number;
  incorrectChars: number;
  language: Language;
  duration: TimeDuration;
}

export function useStatsHistory() {
  const [sessions, setSessions] = useState<SessionRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const addSession = useCallback((record: Omit<SessionRecord, 'id' | 'date'>) => {
    const newRecord: SessionRecord = {
      ...record,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setSessions(prev => {
      const updated = [newRecord, ...prev].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
    return newRecord;
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setSessions([]);
  }, []);

  /** Sessions sorted oldest → newest for charting */
  const getChronological = useCallback(
    (language?: Language, duration?: TimeDuration): SessionRecord[] => {
      return [...sessions]
        .filter(s =>
          (!language || s.language === language) &&
          (!duration || s.duration === duration)
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
    [sessions]
  );

  /** Aggregate stats */
  const getSummary = useCallback(() => {
    const totalSessions = sessions.length;
    const totalChars = sessions.reduce((s, r) => s + r.correctChars + r.incorrectChars, 0);
    const avgWpm = totalSessions
      ? Math.round(sessions.reduce((s, r) => s + r.wpm, 0) / totalSessions)
      : 0;
    const avgAccuracy = totalSessions
      ? Math.round(sessions.reduce((s, r) => s + r.accuracy, 0) / totalSessions)
      : 0;
    const bestWpm = totalSessions ? Math.max(...sessions.map(r => r.wpm)) : 0;

    // Last-7-days vs prior-7-days improvement
    const now = Date.now();
    const DAY = 86_400_000;
    const last7 = sessions.filter(s => now - new Date(s.date).getTime() < 7 * DAY);
    const prior7 = sessions.filter(s => {
      const age = now - new Date(s.date).getTime();
      return age >= 7 * DAY && age < 14 * DAY;
    });
    const last7Wpm = last7.length
      ? Math.round(last7.reduce((s, r) => s + r.wpm, 0) / last7.length)
      : null;
    const prior7Wpm = prior7.length
      ? Math.round(prior7.reduce((s, r) => s + r.wpm, 0) / prior7.length)
      : null;
    const weeklyImprovement =
      last7Wpm !== null && prior7Wpm !== null && prior7Wpm > 0
        ? Math.round(((last7Wpm - prior7Wpm) / prior7Wpm) * 100)
        : null;

    return { totalSessions, totalChars, avgWpm, avgAccuracy, bestWpm, weeklyImprovement, last7Wpm, prior7Wpm };
  }, [sessions]);

  return { sessions, addSession, clearHistory, getChronological, getSummary };
}
