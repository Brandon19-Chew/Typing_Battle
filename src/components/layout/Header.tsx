import { Link, useLocation } from 'react-router-dom';
import { Keyboard, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 backdrop-blur-md"
      style={{ background: 'hsl(220 20% 4% / 0.9)' }}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center neon-glow-cyan"
            style={{ background: 'linear-gradient(135deg, hsl(185 100% 50% / 0.2), hsl(270 80% 65% / 0.2))', border: '1px solid hsl(185 100% 50% / 0.4)' }}>
            <Keyboard size={16} className="neon-text-cyan" />
          </div>
          <span className="font-black text-lg tracking-tight gradient-text">TYPING BATTLE</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              location.pathname === '/'
                ? 'neon-text-cyan bg-cyan-500/10 border border-cyan-500/30'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Home
          </Link>
          <Link
            to="/stats"
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
              location.pathname === '/stats'
                ? 'neon-text-cyan bg-cyan-500/10 border border-cyan-500/30'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <BarChart2 size={13} />
            Stats
          </Link>
        </nav>
      </div>
    </header>
  );
}
