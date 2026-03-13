import { Language, TimeDuration } from '@/types/game';

export function calculateWPM(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds === 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round(correctChars / 5 / minutes);
}

export function calculateAccuracy(correctChars: number, totalTyped: number): number {
  if (totalTyped === 0) return 100;
  return Math.round((correctChars / totalTyped) * 100);
}

export function calculateScore(wpm: number, accuracy: number, combo: number, duration: TimeDuration): number {
  const accuracyMultiplier = accuracy / 100;
  const comboBonus = Math.floor(combo / 10) * 50;
  const durationMultiplier = duration === 15 ? 1.5 : duration === 30 ? 1.2 : duration === 60 ? 1.0 : 0.8;
  return Math.round(wpm * accuracyMultiplier * durationMultiplier * 10 + comboBonus);
}

export function getWPMRank(wpm: number): { label: string; color: string; emoji: string } {
  if (wpm >= 120) return { label: 'LEGENDARY', color: 'text-yellow-400', emoji: '👑' };
  if (wpm >= 100) return { label: 'MASTER', color: 'text-purple-400', emoji: '⚡' };
  if (wpm >= 80) return { label: 'EXPERT', color: 'text-cyan-400', emoji: '🔥' };
  if (wpm >= 60) return { label: 'ADVANCED', color: 'text-green-400', emoji: '🚀' };
  if (wpm >= 40) return { label: 'INTERMEDIATE', color: 'text-blue-400', emoji: '⭐' };
  if (wpm >= 20) return { label: 'BEGINNER', color: 'text-orange-400', emoji: '🌱' };
  return { label: 'NOVICE', color: 'text-gray-400', emoji: '🐢' };
}

export function getLanguageLabel(language: Language): string {
  const map: Record<Language, string> = {
    english: 'English',
    chinese: '中文',
    japanese: '日本語',
  };
  return map[language];
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
