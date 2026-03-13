import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, ReferenceLine,
} from 'recharts';
import { useStatsHistory, SessionRecord } from '@/hooks/useStatsHistory';
import { Language, TimeDuration } from '@/types/game';
import { getLanguageLabel } from '@/lib/scoring';
import Header from '@/components/layout/Header';
import {
  TrendingUp, TrendingDown, Minus, BarChart2, Keyboard,
  Target, Zap, Trash2, Calendar, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const languages: { key: Language; label: string }[] = [
  { key: 'english', label: 'English' },
  { key: 'chinese', label: '中文' },
  { key: 'japanese', label: '日本語' },
];
const durations: (TimeDuration | 'all')[] = ['all', 15, 30, 60, 120];

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs border"
      style={{ background: 'hsl(220 20% 8%)', borderColor: 'hsl(185 100% 50% / 0.3)' }}
    >
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono font-bold">
          {p.name}: {p.value}{p.unit ?? ''}
        </p>
      ))}
    </div>
  );
};

export default function StatsHistory() {
  const navigate = useNavigate();
  const { sessions, clearHistory, getChronological, getSummary } = useStatsHistory();
  const [filterLang, setFilterLang] = useState<Language>('english');
  const [filterDur, setFilterDur] = useState<TimeDuration | 'all'>('all');
  const [chartMode, setChartMode] = useState<'wpm' | 'accuracy'>('wpm');

  const summary = useMemo(() => getSummary(), [getSummary]);

  const chartData = useMemo(() => {
    const records = getChronological(
      filterLang,
      filterDur === 'all' ? undefined : filterDur
    );
    // Group by date if too many, else show each session
    const show = records.slice(-40);
    return show.map((r, i) => ({
      label: formatShortDate(r.date),
      fullDate: formatFullDate(r.date),
      wpm: r.wpm,
      accuracy: r.accuracy,
      session: i + 1,
    }));
  }, [getChronological, filterLang, filterDur]);

  const avgWpm = chartData.length
    ? Math.round(chartData.reduce((s, r) => s + r.wpm, 0) / chartData.length)
    : 0;

  const recentSessions = useMemo(
    () => sessions
      .filter(s => s.language === filterLang && (filterDur === 'all' || s.duration === filterDur))
      .slice(0, 15),
    [sessions, filterLang, filterDur]
  );

  const { weeklyImprovement } = summary;

  const ImprovementBadge = () => {
    if (weeklyImprovement === null) return <span className="text-muted-foreground text-xs">Not enough data</span>;
    if (weeklyImprovement > 0)
      return (
        <span className="flex items-center gap-1 text-green-400 text-sm font-bold">
          <TrendingUp size={14} /> +{weeklyImprovement}% vs last week
        </span>
      );
    if (weeklyImprovement < 0)
      return (
        <span className="flex items-center gap-1 text-red-400 text-sm font-bold">
          <TrendingDown size={14} /> {weeklyImprovement}% vs last week
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-muted-foreground text-sm">
        <Minus size={14} /> No change vs last week
      </span>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: 'hsl(220 20% 4%)' }}>
      <Header />

      <main className="max-w-5xl mx-auto px-4 pt-20 pb-20">
        {/* Page title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black gradient-text tracking-tight">Stats History</h1>
            <p className="text-muted-foreground text-sm mt-1">Your personal typing performance over time</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all flex items-center gap-2"
            >
              <Keyboard size={14} />
              Play
            </button>
            {sessions.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-3 py-2 rounded-lg text-sm border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all"
                title="Clear all history"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {sessions.length === 0 ? (
          /* Empty state */
          <div className="glass-card rounded-2xl p-16 text-center">
            <BarChart2 size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-semibold text-muted-foreground mb-2">No sessions yet</p>
            <p className="text-sm text-muted-foreground mb-6">Play a game and your stats will appear here.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, hsl(185 100% 45%), hsl(270 80% 60%))',
                color: 'hsl(220 20% 4%)',
              }}
            >
              Start Playing
            </button>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <SummaryCard
                icon={<Zap size={16} className="neon-text-cyan" />}
                label="Best WPM"
                value={String(summary.bestWpm)}
                sub="all time"
                color="cyan"
              />
              <SummaryCard
                icon={<Target size={16} className="text-green-400" />}
                label="Avg Accuracy"
                value={`${summary.avgAccuracy}%`}
                sub="all sessions"
                color="green"
              />
              <SummaryCard
                icon={<BarChart2 size={16} className="neon-text-purple" />}
                label="Sessions"
                value={String(summary.totalSessions)}
                sub="total played"
                color="purple"
              />
              <SummaryCard
                icon={<Calendar size={16} className="text-yellow-400" />}
                label="Chars Typed"
                value={summary.totalChars >= 1000
                  ? `${(summary.totalChars / 1000).toFixed(1)}k`
                  : String(summary.totalChars)}
                sub="total"
                color="yellow"
              />
            </div>

            {/* Weekly improvement */}
            <div className="glass-card rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-muted-foreground" />
                <span className="text-sm font-semibold">Weekly Progress</span>
              </div>
              <ImprovementBadge />
            </div>

            {/* Filters */}
            <div className="glass-card rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-center">
              <div className="flex gap-1.5 bg-muted rounded-lg p-1">
                {languages.map(l => (
                  <button
                    key={l.key}
                    onClick={() => setFilterLang(l.key)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                      filterLang === l.key
                        ? 'bg-background neon-text-cyan shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {durations.map(d => (
                  <button
                    key={d}
                    onClick={() => setFilterDur(d)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all',
                      filterDur === d
                        ? 'border-cyan-500/50 neon-text-cyan bg-cyan-500/10'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {d === 'all' ? 'All' : `${d}s`}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex gap-1.5">
                {(['wpm', 'accuracy'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setChartMode(m)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-semibold border transition-all uppercase',
                      chartMode === m
                        ? 'border-purple-500/50 neon-text-purple bg-purple-500/10'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="glass-card rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold">
                    {chartMode === 'wpm' ? 'WPM Trend' : 'Accuracy Trend'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {getLanguageLabel(filterLang)} · {filterDur === 'all' ? 'all durations' : `${filterDur}s`}
                    {chartData.length > 0 && ` · avg ${chartMode === 'wpm' ? avgWpm + ' WPM' : Math.round(chartData.reduce((s, r) => s + r.accuracy, 0) / chartData.length) + '%'}`}
                  </p>
                </div>
                {chartData.length > 0 && (
                  <span className="font-mono font-black text-2xl neon-text-cyan">
                    {chartMode === 'wpm'
                      ? `${chartData[chartData.length - 1].wpm}`
                      : `${chartData[chartData.length - 1].accuracy}%`}
                    <span className="text-xs font-normal text-muted-foreground ml-1">latest</span>
                  </span>
                )}
              </div>

              {chartData.length < 2 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  Play at least 2 games to see your trend chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(185 100% 50%)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(185 100% 50%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(145 80% 50%)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(145 80% 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 15%)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: 'hsl(220 15% 50%)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'hsl(220 15% 50%)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      domain={chartMode === 'accuracy' ? [0, 100] : ['auto', 'auto']}
                      unit={chartMode === 'accuracy' ? '%' : ''}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {chartMode === 'wpm' && avgWpm > 0 && (
                      <ReferenceLine
                        y={avgWpm}
                        stroke="hsl(270 80% 65% / 0.5)"
                        strokeDasharray="4 4"
                        label={{ value: `avg ${avgWpm}`, fill: 'hsl(270 80% 65%)', fontSize: 10, position: 'insideTopRight' }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey={chartMode}
                      name={chartMode === 'wpm' ? 'WPM' : 'Accuracy'}
                      unit={chartMode === 'accuracy' ? '%' : ''}
                      stroke={chartMode === 'wpm' ? 'hsl(185 100% 50%)' : 'hsl(145 80% 50%)'}
                      strokeWidth={2}
                      fill={chartMode === 'wpm' ? 'url(#wpmGrad)' : 'url(#accGrad)'}
                      dot={{ fill: chartMode === 'wpm' ? 'hsl(185 100% 50%)' : 'hsl(145 80% 50%)', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent sessions table */}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-base font-bold mb-4">Recent Sessions</h2>
              {recentSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No sessions for this filter. Try changing language or duration.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentSessions.map((s, i) => (
                    <SessionRow key={s.id} session={s} rank={i} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: 'cyan' | 'green' | 'purple' | 'yellow';
}) {
  const borders = {
    cyan: 'hsl(185 100% 50% / 0.2)',
    green: 'hsl(145 80% 50% / 0.2)',
    purple: 'hsl(270 80% 65% / 0.2)',
    yellow: 'hsl(50 100% 55% / 0.2)',
  };
  const bgs = {
    cyan: 'hsl(185 100% 50% / 0.06)',
    green: 'hsl(145 80% 50% / 0.06)',
    purple: 'hsl(270 80% 65% / 0.06)',
    yellow: 'hsl(50 100% 55% / 0.06)',
  };
  const texts = {
    cyan: 'neon-text-cyan',
    green: 'neon-text-green',
    purple: 'neon-text-purple',
    yellow: 'text-yellow-400',
  };
  return (
    <div className="glass-card rounded-xl p-4 border" style={{ borderColor: borders[color], background: bgs[color] }}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className={cn('font-mono font-black text-2xl', texts[color])}>{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function SessionRow({ session, rank }: { session: SessionRecord; rank: number }) {
  const isTop = rank === 0;
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all',
        isTop ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-border/40 bg-muted/20 hover:bg-muted/30'
      )}
    >
      <span className="text-xs font-mono text-muted-foreground w-5 text-center">{rank + 1}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">{formatFullDate(session.date)}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {getLanguageLabel(session.language)}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {session.duration}s
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono font-bold neon-text-cyan text-sm">{session.wpm} WPM</div>
        <div className="text-xs text-muted-foreground">{session.accuracy}% acc</div>
      </div>
      <div className="text-right hidden sm:block">
        <div className="font-mono text-sm font-semibold text-purple-400">×{session.combo}</div>
        <div className="text-xs text-muted-foreground">combo</div>
      </div>
      <ChevronRight size={14} className="text-muted-foreground/40 shrink-0" />
    </div>
  );
}
