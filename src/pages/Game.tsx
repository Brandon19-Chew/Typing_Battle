import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Language, TimeDuration, GameConfig } from '@/types/game';
import { useTypingGame } from '@/hooks/useTypingGame';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import TypingArea from '@/components/features/TypingArea';
import StatsBar from '@/components/features/StatsBar';
import WowEffect from '@/components/features/WowEffect';
import Header from '@/components/layout/Header';
import { calculateScore, getLanguageLabel } from '@/lib/scoring';
import { Keyboard, ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Game() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateDailyBest } = useLeaderboard();

  const language = (searchParams.get('lang') as Language) || 'english';
  const duration = (Number(searchParams.get('duration')) as TimeDuration) || 60;

  const config: GameConfig = { language, duration };

  const {
    status, countdown, charStates, currentIndex,
    inputValue, stats, showWow, wowType,
    startCountdown, handleInput, resetGame,
  } = useTypingGame(config);

  const navigatedRef = useRef(false);

  // Navigate to results when finished
  useEffect(() => {
    if (status === 'finished' && !navigatedRef.current) {
      navigatedRef.current = true;
      updateDailyBest(language, stats.wpm, stats.accuracy);
      const score = calculateScore(stats.wpm, stats.accuracy, stats.maxCombo, duration);
      const params = new URLSearchParams({
        lang: language,
        duration: String(duration),
        wpm: String(stats.wpm),
        rawWpm: String(stats.rawWpm),
        accuracy: String(stats.accuracy),
        combo: String(stats.maxCombo),
        score: String(score),
        correct: String(stats.correctChars),
        incorrect: String(stats.incorrectChars),
      });
      setTimeout(() => navigate(`/results?${params}`), 300);
    }
  }, [status]);

  const handleRestart = () => {
    navigatedRef.current = false;
    resetGame();
    startCountdown();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(220 20% 4%)' }}>
      <Header />

      <WowEffect show={showWow} type={wowType} combo={stats.combo} />

      <main className="flex-1 pt-14">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg gradient-text">TYPING BATTLE</span>
                  <span className="text-xs px-2 py-0.5 rounded-full border font-semibold"
                    style={{ borderColor: 'hsl(185 100% 50% / 0.3)', color: 'hsl(185 100% 50%)', background: 'hsl(185 100% 50% / 0.08)' }}>
                    {getLanguageLabel(language)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{duration}s challenge</div>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all border border-transparent hover:border-border"
            >
              <RotateCcw size={14} />
              Restart
            </button>
          </div>

          {/* Stats */}
          {(status === 'playing') && (
            <StatsBar stats={stats} duration={duration} />
          )}

          {/* Countdown overlay or game */}
          {status === 'idle' && (
            <div className="glass-card rounded-2xl p-12 text-center space-y-6">
              <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center neon-glow-cyan"
                style={{ background: 'linear-gradient(135deg, hsl(185 100% 50% / 0.15), hsl(270 80% 65% / 0.15))', border: '2px solid hsl(185 100% 50% / 0.3)' }}>
                <Keyboard size={32} className="neon-text-cyan" />
              </div>
              <div>
                <h2 className="text-2xl font-black mb-2">Ready to Battle?</h2>
                <p className="text-muted-foreground">Type as fast and accurately as you can in {duration} seconds</p>
              </div>
              <button
                onClick={startCountdown}
                className="px-10 py-3.5 rounded-xl font-black text-lg tracking-wider transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, hsl(185 100% 45%), hsl(270 80% 60%))',
                  color: 'hsl(220 20% 4%)',
                  boxShadow: '0 0 25px hsl(185 100% 50% / 0.3)',
                }}
              >
                PLAY
              </button>
            </div>
          )}

          {status === 'countdown' && (
            <div className="glass-card rounded-2xl p-16 text-center">
              <div
                key={countdown}
                className="text-9xl font-black animate-countdown"
                style={{
                  color: countdown === 1 ? 'hsl(0 80% 60%)' : countdown === 2 ? 'hsl(30 100% 55%)' : 'hsl(185 100% 50%)',
                  textShadow: `0 0 40px currentColor, 0 0 100px currentColor`,
                }}
              >
                {countdown > 0 ? countdown : 'GO!'}
              </div>
              <p className="text-muted-foreground mt-4">Get ready...</p>
            </div>
          )}

          {status === 'playing' && (
            <TypingArea
              charStates={charStates}
              currentIndex={currentIndex}
              inputValue={inputValue}
              onInput={handleInput}
              language={language}
            />
          )}

          {/* Combo fire display */}
          {status === 'playing' && stats.combo >= 5 && (
            <div className="flex justify-center">
              <div
                className="px-4 py-2 rounded-full flex items-center gap-2 border animate-combo-pulse"
                style={{
                  borderColor: stats.combo >= 15 ? 'hsl(30 100% 55% / 0.5)' : 'hsl(270 80% 65% / 0.3)',
                  background: stats.combo >= 15 ? 'hsl(30 100% 55% / 0.1)' : 'hsl(270 80% 65% / 0.08)',
                }}
              >
                <span className="text-xl">🔥</span>
                <span
                  className="font-black text-sm"
                  style={{ color: stats.combo >= 15 ? 'hsl(30 100% 55%)' : 'hsl(270 80% 65%)' }}
                >
                  {stats.combo} COMBO STREAK
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
