import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
}

interface WowEffectProps {
  show: boolean;
  type: 'combo' | 'perfect' | 'speed';
  combo?: number;
}

const COLORS = {
  combo: ['#00f5ff', '#b500ff', '#00ff88', '#ff8800'],
  perfect: ['#ffd700', '#ff6b6b', '#00f5ff', '#b500ff', '#00ff88'],
  speed: ['#ff8800', '#ff4444', '#ffd700', '#00f5ff'],
};

const MESSAGES = {
  combo: ['COMBO!', 'NICE!', 'ON FIRE!', 'BLAZING!'],
  perfect: ['PERFECT!', 'FLAWLESS!', 'INCREDIBLE!'],
  speed: ['LIGHTNING!', 'SUPERSONIC!', 'UNSTOPPABLE!'],
};

export default function WowEffect({ show, type, combo = 0 }: WowEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;

    const colors = COLORS[type];
    const msgs = MESSAGES[type];
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: 20 + Math.random() * 60,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8,
      angle: Math.random() * 360,
      speed: 0.5 + Math.random() * 1.5,
    }));

    setParticles(newParticles);
    setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      setParticles([]);
    }, 1400);

    return () => clearTimeout(timer);
  }, [show, type]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Screen flash */}
      <div
        className="absolute inset-0 animate-screen-flash"
        style={{
          background: type === 'perfect'
            ? 'radial-gradient(circle at center, #ffd700, transparent)'
            : type === 'speed'
            ? 'radial-gradient(circle at center, #ff8800, transparent)'
            : 'radial-gradient(circle at center, #00f5ff, transparent)',
        }}
      />

      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-particle rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animationDuration: `${0.8 + p.speed * 0.4}s`,
            animationDelay: `${Math.random() * 0.2}s`,
          }}
        />
      ))}

      {/* Message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-countdown">
          <div
            className="text-5xl font-black tracking-wider"
            style={{
              color: type === 'perfect' ? '#ffd700' : type === 'speed' ? '#ff8800' : '#00f5ff',
              textShadow: `0 0 20px currentColor, 0 0 60px currentColor`,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {message}
          </div>
          {combo > 0 && type === 'combo' && (
            <div className="text-2xl font-bold mt-1" style={{ color: '#b500ff', textShadow: '0 0 15px #b500ff' }}>
              ×{combo} COMBO
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
