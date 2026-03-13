import heroBg from '@/assets/hero-bg.jpg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Language, TimeDuration } from '@/types/game';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import Leaderboard from '@/components/features/Leaderboard';
import Header from '@/components/layout/Header';
import { Keyboard, Zap, Clock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLanguageLabel } from '@/lib/scoring';

const languages: { key: Language; label: string; sublabel: string; emoji: string }[] = [
  { key: 'english', label: 'English', sublabel: 'A-Z words', emoji: '🇺🇸' },
  { key: 'chinese', label: '中文', sublabel: 'Chinese', emoji: '🇨🇳' },
  { key: 'japanese', label: '日本語', sublabel: 'Japanese', emoji: '🇯🇵' },
];

const durations: { value: TimeDuration; label: string; badge?: string }[] = [
  { value: 15, label: '15s', badge: 'SPRINT' },
  { value: 30, label: '30s', badge: 'QUICK' },
  { value: 60, label: '60s', badge: 'STANDARD' },
  { value: 120, label: '120s', badge: 'ENDURANCE' },
];

export default function Index() {
  const navigate = useNavigate();
  const { getEntriesByLanguage, clearLeaderboard } = useLeaderboard();
  const [selectedLang, setSelectedLang] = useState<Language>('english');
  const [selectedDuration, setSelectedDuration] = useState<TimeDuration>(60);

  const handleStart = () => {
    navigate(`/game?lang=${selectedLang}&duration=${selectedDuration}`);
  };

  return (
    <div className="min-h-screen" style={{ background: 'hsl(220 20% 4%)' }}>
      <Header />

      {/* Hero */}
      <div className="relative pt-14 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-6"
            style={{ borderColor: 'hsl(185 100% 50% / 0.3)', background: 'hsl(185 100% 50% / 0.08)', color: 'hsl(185 100% 50%)' }}>
            <Zap size={10} />
            COMPETITIVE TYPING CHALLENGE
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-none">
            <span className="gradient-text">TYPING</span>
            <br />
            <span className="text-foreground">BATTLE</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10">
            Test your speed across English, Chinese & Japanese. Earn combo streaks. Claim the top spot.
          </p>

          {/* Config panel */}
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Language selection */}
            <div className="glass-card rounded-2xl p-5 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className="neon-text-cyan" />
                <span className="text-sm font-semibold text-muted-foreground tracking-wider">LANGUAGE</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {languages.map(lang => (
                  <button
                    key={lang.key}
                    onClick={() => setSelectedLang(lang.key)}
                    className={cn(
                      'relative py-4 px-3 rounded-xl border-2 transition-all duration-200 text-center',
                      selectedLang === lang.key
                        ? 'border-cyan-500/70 bg-cyan-500/10 neon-glow-cyan'
                        : 'border-border hover:border-border/80 bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <div className="text-2xl mb-1">{lang.emoji}</div>
                    <div className={cn('font-bold text-sm', selectedLang === lang.key ? 'neon-text-cyan' : 'text-foreground')}>
                      {lang.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{lang.sublabel}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration selection */}
            <div className="glass-card rounded-2xl p-5 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="neon-text-purple" />
                <span className="text-sm font-semibold text-muted-foreground tracking-wider">DURATION</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {durations.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDuration(d.value)}
                    className={cn(
                      'py-3 px-2 rounded-xl border-2 transition-all duration-200 text-center',
                      selectedDuration === d.value
                        ? 'border-purple-500/70 bg-purple-500/10 neon-glow-purple'
                        : 'border-border hover:border-border/80 bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <div className={cn('font-black text-xl', selectedDuration === d.value ? 'neon-text-purple' : 'text-foreground')}>
                      {d.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{d.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              className="w-full py-4 rounded-2xl font-black text-xl tracking-widest relative overflow-hidden group transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, hsl(185 100% 45%), hsl(270 80% 60%))',
                boxShadow: '0 0 30px hsl(185 100% 50% / 0.3), 0 0 60px hsl(270 80% 65% / 0.15)',
                color: 'hsl(220 20% 4%)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Keyboard size={22} />
                START BATTLE
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard section */}
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <Leaderboard getEntries={getEntriesByLanguage} onClear={clearLeaderboard} />
      </div>
    </div>
  );
}
