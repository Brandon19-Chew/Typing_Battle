import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStatsHistory } from '@/hooks/useStatsHistory';
import { useEffect, useState, useRef } from 'react';
import { Language, TimeDuration } from '@/types/game';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { getWPMRank, getLanguageLabel, formatDate } from '@/lib/scoring';
import Header from '@/components/layout/Header';
import { Trophy, RotateCcw, Home, Crown, Star, Zap, Target, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

const CONFETTI_COLORS = ['#00f5ff', '#b500ff', '#ffd700', '#00ff88', '#ff6b6b', '#ff8800'];

export default function Results() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addEntry, getDailyBest, updateDailyBest } = useLeaderboard();
  const { addSession } = useStatsHistory();

  const language = (searchParams.get('lang') as Language) || 'english';
  const duration = Number(searchParams.get('duration') || 60) as TimeDuration;
  const wpm = Number(searchParams.get('wpm') || 0);
  const rawWpm = Number(searchParams.get('rawWpm') || 0);
  const accuracy = Number(searchParams.get('accuracy') || 100);
  const combo = Number(searchParams.get('combo') || 0);
  const score = Number(searchParams.get('score') || 0);
  const correct = Number(searchParams.get('correct') || 0);
  const incorrect = Number(searchParams.get('incorrect') || 0);

  const [playerName, setPlayerName] = useState(() => localStorage.getItem('typing_player_name') || '');
  const [saved, setSaved] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showStats, setShowStats] = useState(false);
  const savedRef = useRef(false);

  const rank = getWPMRank(wpm);
  const dailyBest = getDailyBest(language);
  const isNewDailyBest = !dailyBest || wpm > dailyBest.wpm;

  // Save session to history once on mount
  const sessionSavedRef = useRef(false);
  useEffect(() => {
    if (sessionSavedRef.current || wpm === 0) return;
    sessionSavedRef.current = true;
    addSession({ wpm, rawWpm, accuracy, combo, score, correctChars: correct, incorrectChars: incorrect, language, duration });
    updateDailyBest(language, wpm, accuracy);
  }, []);

  useEffect(() => {
    // Confetti
    const p: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 1.5,
      duration: 1.5 + Math.random() * 1.5,
      size: 6 + Math.random() * 8,
    }));
    setParticles(p);
    setTimeout(() => setShowStats(true), 400);
  }, []);

  const handleSave = () => {
    if (!playerName.trim() || savedRef.current) return;
    savedRef.current = true;
    localStorage.setItem('typing_player_name', playerName.trim());
    addEntry({
      name: playerName.trim(),
      wpm, accuracy, combo,
      language, duration, score,
    });
    setSaved(true);
  };

  const handlePlayAgain = () => {
    navigate(`/game?lang=${language}&duration=${duration}`);
  };

  return (
    <div className="min-h-screen" style={{ background: 'hsl(220 20% 4%)' }}>
      <Header />

      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-sm animate-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size / 2,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size}px ${p.color}`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      <main className="relative z-20 pt-20 pb-16 max-w-2xl mx-auto px-4">
        {/* Rank reveal */}
        <div className={cn('text-center mb-8 transition-all duration-700', showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
          {isNewDailyBest && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
              style={{ background: 'hsl(50 100% 55% / 0.15)', border: '1px solid hsl(50 100% 55% / 0.4)', color: 'hsl(50 100% 55%)' }}>
              <Star size={10} />
              NEW DAILY BEST!
            </div>
          )}

          <div className="text-6xl mb-3">{rank.emoji}</div>
          <div className={cn('text-3xl font-black tracking-widest mb-1', rank.color)}
            style={{ textShadow: '0 0 20px currentColor' }}>
            {rank.label}
          </div>
          <div className="text-muted-foreground text-sm">{getLanguageLabel(language)} · {duration}s</div>
        </div>

        {/* Main WPM */}
        <div className={cn('glass-card rounded-2xl p-8 text-center mb-4 transition-all duration-700 delay-100', showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
          <div className="neon-text-cyan font-mono font-black text-8xl leading-none mb-1"
            style={{ textShadow: '0 0 40px hsl(185 100% 50% / 0.6)' }}>
            {wpm}
          </div>
          <div className="text-muted-foreground font-semibold tracking-wider text-sm">WORDS PER MINUTE</div>
          <div className="mt-3 text-xs text-muted-foreground">Raw: {rawWpm} WPM</div>
        </div>

        {/* Stat grid */}
        <div className={cn('grid grid-cols-3 gap-3 mb-4 transition-all duration-700 delay-200', showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
          <StatCard icon={<Target size={18} className="text-green-400" />} label="Accuracy" value={`${accuracy}%`} color="green" />
          <StatCard icon={<Flame size={18} className="text-purple-400" />} label="Max Combo" value={`×${combo}`} color="purple" />
          <StatCard icon={<Zap size={18} className="text-yellow-400" />} label="Score" value={score.toLocaleString()} color="yellow" />
        </div>

        {/* Char breakdown */}
        <div className={cn('glass-card rounded-xl p-4 mb-4 transition-all duration-700 delay-300', showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
          <div className="flex justify-around">
            <div className="text-center">
              <div className="font-mono font-bold text-2xl neon-text-green">{correct}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="font-mono font-bold text-2xl neon-text-red">{incorrect}</div>
              <div className="text-xs text-muted-foreground">Mistakes</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="font-mono font-bold text-2xl text-foreground">{correct + incorrect}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </div>

        {/* Daily best */}
        {dailyBest && !isNewDailyBest && (
          <div className={cn('glass-card rounded-xl p-3 mb-4 flex items-center justify-between transition-all duration-700 delay-350', showStats ? 'opacity-100' : 'opacity-0')}>
            <div className="flex items-center gap-2">
              <Crown size={14} className="text-yellow-400" />
              <span className="text-sm text-muted-foreground">Daily Best</span>
            </div>
            <span className="font-mono font-bold neon-text-cyan">{dailyBest.wpm} WPM · {dailyBest.accuracy}%</span>
          </div>
        )}

        {/* Save to leaderboard */}
        {!saved ? (
          <div className={cn('glass-card rounded-xl p-4 mb-5 space-y-3 transition-all duration-700 delay-400', showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
            <div className="flex items-center gap-2">
              <Trophy size={16} className="neon-text-cyan" />
              <span className="text-sm font-semibold">Save to Leaderboard</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                maxLength={20}
                placeholder="Enter your name..."
                className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
              />
              <button
                onClick={handleSave}
                disabled={!playerName.trim()}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, hsl(185 100% 45%), hsl(270 80% 60%))',
                  color: 'hsl(220 20% 4%)',
                }}
              >
                SAVE
              </button>
            </div>
          </div>
        ) : (
          <div className={cn('glass-card rounded-xl p-4 mb-5 text-center transition-all duration-700', showStats ? 'opacity-100' : 'opacity-0')}>
            <div className="flex items-center justify-center gap-2 neon-text-green">
              <Trophy size={16} />
              <span className="text-sm font-semibold">Score saved! Check the leaderboard.</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={cn('flex gap-3 transition-all duration-700 delay-500', showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-muted/30 transition-all flex items-center justify-center gap-2"
          >
            <Home size={16} />
            Home
          </button>
          <button
            onClick={handlePlayAgain}
            className="flex-1 py-3 rounded-xl text-sm font-black tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, hsl(185 100% 45%), hsl(270 80% 60%))',
              color: 'hsl(220 20% 4%)',
              boxShadow: '0 0 20px hsl(185 100% 50% / 0.25)',
            }}
          >
            <RotateCcw size={16} />
            PLAY AGAIN
          </button>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const borderColor = color === 'green' ? 'hsl(145 80% 50% / 0.2)' : color === 'purple' ? 'hsl(270 80% 65% / 0.2)' : 'hsl(50 100% 55% / 0.2)';
  const bg = color === 'green' ? 'hsl(145 80% 50% / 0.06)' : color === 'purple' ? 'hsl(270 80% 65% / 0.06)' : 'hsl(50 100% 55% / 0.06)';
  const textColor = color === 'green' ? 'neon-text-green' : color === 'purple' ? 'neon-text-purple' : 'text-yellow-400';
  return (
    <div className="glass-card rounded-xl p-4 text-center border" style={{ borderColor, background: bg }}>
      <div className="flex justify-center mb-1">{icon}</div>
      <div className={cn('font-mono font-black text-xl', textColor)}>{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
