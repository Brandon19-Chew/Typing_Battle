import { GameStats, TimeDuration } from '@/types/game';
import { Zap, Target, Flame, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsBarProps {
  stats: GameStats;
  duration: TimeDuration;
}

export default function StatsBar({ stats, duration }: StatsBarProps) {
  const timePercent = (stats.timeLeft / duration) * 100;
  const isLowTime = stats.timeLeft <= 10;
  const isHighCombo = stats.combo >= 10;

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      {/* Timer bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className={cn(isLowTime ? 'text-red-400' : 'text-muted-foreground')} />
            <span className="text-xs text-muted-foreground">TIME</span>
          </div>
          <span className={cn(
            'font-mono font-bold text-lg tabular-nums',
            isLowTime ? 'neon-text-red animate-pulse' : 'neon-text-cyan'
          )}>
            {stats.timeLeft}s
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${timePercent}%`,
              background: isLowTime
                ? 'linear-gradient(90deg, #ff4444, #ff8800)'
                : 'linear-gradient(90deg, hsl(185 100% 50%), hsl(270 80% 65%))',
              boxShadow: isLowTime
                ? '0 0 8px #ff4444'
                : '0 0 8px hsl(185 100% 50% / 0.6)',
            }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatItem
          icon={<Zap size={14} />}
          label="WPM"
          value={stats.wpm}
          color="cyan"
        />
        <StatItem
          icon={<Target size={14} />}
          label="ACC"
          value={`${stats.accuracy}%`}
          color={stats.accuracy >= 95 ? 'green' : stats.accuracy >= 80 ? 'cyan' : 'red'}
        />
        <StatItem
          icon={<Flame size={14} />}
          label="COMBO"
          value={`×${stats.combo}`}
          color={isHighCombo ? 'orange' : 'purple'}
          pulse={isHighCombo}
        />
      </div>
    </div>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'cyan' | 'green' | 'red' | 'purple' | 'orange';
  pulse?: boolean;
}

const colorMap = {
  cyan: { text: 'neon-text-cyan', bg: 'hsl(185 100% 50% / 0.08)', border: 'hsl(185 100% 50% / 0.2)' },
  green: { text: 'neon-text-green', bg: 'hsl(145 80% 50% / 0.08)', border: 'hsl(145 80% 50% / 0.2)' },
  red: { text: 'neon-text-red', bg: 'hsl(0 80% 60% / 0.08)', border: 'hsl(0 80% 60% / 0.2)' },
  purple: { text: 'neon-text-purple', bg: 'hsl(270 80% 65% / 0.08)', border: 'hsl(270 80% 65% / 0.2)' },
  orange: { text: 'text-orange-400', bg: 'hsl(30 100% 55% / 0.08)', border: 'hsl(30 100% 55% / 0.2)' },
};

function StatItem({ icon, label, value, color, pulse }: StatItemProps) {
  const c = colorMap[color];
  return (
    <div
      className={cn(
        'rounded-lg p-2.5 flex flex-col items-center gap-1 border',
        pulse && 'animate-combo-pulse'
      )}
      style={{ background: c.bg, borderColor: c.border }}
    >
      <div className={cn('flex items-center gap-1 text-xs text-muted-foreground', c.text)}>
        {icon}
        <span>{label}</span>
      </div>
      <span className={cn('font-mono font-bold text-xl tabular-nums', c.text)}>
        {value}
      </span>
    </div>
  );
}
