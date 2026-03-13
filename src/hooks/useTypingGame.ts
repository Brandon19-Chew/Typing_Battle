import { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, GameStats, CharState, GameConfig } from '@/types/game';
import { generateText } from '@/constants/words';
import { calculateWPM, calculateAccuracy } from '@/lib/scoring';

const COMBO_THRESHOLD = 5;

export function useTypingGame(config: GameConfig) {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [countdown, setCountdown] = useState(3);
  const [text, setText] = useState<string>('');
  const [charStates, setCharStates] = useState<CharState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [stats, setStats] = useState<GameStats>({
    wpm: 0, rawWpm: 0, accuracy: 100,
    correctChars: 0, incorrectChars: 0,
    combo: 0, maxCombo: 0, timeLeft: config.duration,
  });
  const [showWow, setShowWow] = useState(false);
  const [wowType, setWowType] = useState<'combo' | 'perfect' | 'speed'>('combo');

  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const correctCharsRef = useRef(0);
  const totalTypedRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const incorrectCharsRef = useRef(0);

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    const newText = generateText(config.language, 300);
    setText(newText);
    setCharStates(newText.split('').map((char, i) => ({
      char,
      status: i === 0 ? 'current' : 'pending',
    })));
    setCurrentIndex(0);
    setInputValue('');
    correctCharsRef.current = 0;
    totalTypedRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    incorrectCharsRef.current = 0;
    setStats({
      wpm: 0, rawWpm: 0, accuracy: 100,
      correctChars: 0, incorrectChars: 0,
      combo: 0, maxCombo: 0, timeLeft: config.duration,
    });
    setShowWow(false);
  }, [config]);

  const startCountdown = useCallback(() => {
    resetGame();
    setStatus('countdown');
    setCountdown(3);
    let count = 3;
    countdownRef.current = window.setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setStatus('playing');
        startTimeRef.current = Date.now();
      }
    }, 1000);
  }, [resetGame]);

  useEffect(() => {
    if (status !== 'playing') return;
    let timeLeft = config.duration;

    timerRef.current = window.setInterval(() => {
      timeLeft -= 1;
      const elapsed = config.duration - timeLeft;
      const wpm = calculateWPM(correctCharsRef.current, elapsed);
      const accuracy = calculateAccuracy(correctCharsRef.current, totalTypedRef.current);

      setStats(prev => ({
        ...prev,
        wpm,
        rawWpm: calculateWPM(totalTypedRef.current, elapsed),
        accuracy,
        correctChars: correctCharsRef.current,
        incorrectChars: incorrectCharsRef.current,
        combo: comboRef.current,
        maxCombo: maxComboRef.current,
        timeLeft,
      }));

      if (timeLeft <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setStatus('finished');
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, config.duration]);

  const handleInput = useCallback((value: string) => {
    if (status !== 'playing') return;

    // Handle backspace
    if (value.length < inputValue.length) {
      const newIndex = Math.max(0, currentIndex - 1);
      setCurrentIndex(newIndex);
      setInputValue(value);
      setCharStates(prev => {
        const updated = [...prev];
        if (updated[currentIndex]) updated[currentIndex] = { ...updated[currentIndex], status: 'pending' };
        if (updated[newIndex]) updated[newIndex] = { ...updated[newIndex], status: 'current' };
        return updated;
      });
      return;
    }

    const typedChar = value[value.length - 1];
    const expectedChar = text[currentIndex];

    if (!expectedChar) return;

    const isCorrect = typedChar === expectedChar;
    totalTypedRef.current += 1;

    if (isCorrect) {
      correctCharsRef.current += 1;
      comboRef.current += 1;
      if (comboRef.current > maxComboRef.current) {
        maxComboRef.current = comboRef.current;
      }

      // Trigger wow effects
      if (comboRef.current > 0 && comboRef.current % COMBO_THRESHOLD === 0) {
        setWowType(comboRef.current >= 20 ? 'speed' : 'combo');
        setShowWow(true);
        setTimeout(() => setShowWow(false), 1500);
      }
    } else {
      incorrectCharsRef.current += 1;
      comboRef.current = 0;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setInputValue(value);

    setCharStates(prev => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        status: isCorrect ? 'correct' : 'incorrect',
      };
      if (updated[nextIndex]) {
        updated[nextIndex] = { ...updated[nextIndex], status: 'current' };
      }
      return updated;
    });

    // Check if text is complete
    if (nextIndex >= text.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      setWowType('perfect');
      setShowWow(true);
      setTimeout(() => {
        setShowWow(false);
        setStatus('finished');
      }, 2000);
    }
  }, [status, currentIndex, text, inputValue]);

  useEffect(() => {
    resetGame();
  }, []);

  return {
    status,
    countdown,
    charStates,
    currentIndex,
    inputValue,
    stats,
    showWow,
    wowType,
    startCountdown,
    handleInput,
    resetGame,
  };
}
