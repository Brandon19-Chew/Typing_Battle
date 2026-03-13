import { useState } from 'react';
import { LeaderboardEntry, Language, TimeDuration } from '@/types/game';
import { getLanguageLabel, formatDate } from '@/lib/scoring';
import { Trophy, Medal, Crown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  getEntries: (language: Language, duration?: TimeDuration) => LeaderboardEntry[];
  onClear: () => void;
}

const languages: Language[] = ['english', 'chinese', 'japanese'];
const durations: TimeDuration[] = [15, 30, 60, 120];

export default function Leaderboard({ getEntries, onClear }: LeaderboardProps) {
  const [selectedLang, setSelectedLang] = useState<Language>('english');
  const [selectedDuration, setSelectedDuration] = useState<TimeDuration | 'all'>('all');

  const entries = getEntries(
    selectedLang,
    selectedDuration === 'all' ? undefined : selectedDuration
  );

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Crown size={16} className="text-yellow-400" />;
    if (rank === 1) return <Trophy size={16} className="text-slate-400" />;
    if (rank === 2) return <Medal size={16} className="text-amber-600" />;
    return <span className="text-xs font-bold text-muted-foreground w-4 text-center">{rank + 1}</span>;
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold gradient-text">Leaderboard</h2>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
            title="Clear leaderboard"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Language tabs */}
      <div className="flex gap-1.5 bg-muted rounded-lg p-1">
        {languages.map(lang => (
          <button
            key={lang}
            onClick={() => setSelectedLang(lang)}
            className={cn(
              'flex-1 py-1.5 rounded-md text-xs font-semibold transition-all duration-200',
              selectedLang === lang
                ? 'bg-background neon-text-cyan shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {getLanguageLabel(lang)}
          </button>
        ))}
      </div>

      {/* Duration filter */}
      <div className="flex gap-1.5">
        {(['all', ...durations] as const).map(d => (
          <button
            key={d}
            onClick={() => setSelectedDuration(d)}
            className={cn(
              'flex-1 py-1 rounded-md text-xs font-medium transition-all duration-200 border',
              selectedDuration === d
                ? 'border-cyan-500/50 neon-text-cyan bg-cyan-500/10'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {d === 'all' ? 'All' : `${d}s`}
          </button>
        ))}
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No records yet. Start playing!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-all',
                i === 0
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : 'border-border/50 bg-muted/30'
              )}
            >
              <div className="flex items-center justify-center w-5">
                {getRankIcon(i)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">{entry.name}</span>
                  <span className="text-xs text-muted-foreground">{entry.duration}s</span>
                </div>
                <div className="text-xs text-muted-foreground">{formatDate(entry.date)}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold neon-text-cyan">{entry.wpm}</div>
                <div className="text-xs text-muted-foreground">WPM</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-semibold text-green-400">{entry.accuracy}%</div>
                <div className="text-xs text-muted-foreground">ACC</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
