import { useRef, useEffect, useCallback } from 'react';
import { CharState } from '@/types/game';
import { cn } from '@/lib/utils';

interface TypingAreaProps {
  charStates: CharState[];
  currentIndex: number;
  inputValue: string;
  onInput: (value: string) => void;
  disabled?: boolean;
  language: 'english' | 'chinese' | 'japanese';
}

const VISIBLE_CHARS = 200;

export default function TypingArea({
  charStates, currentIndex, inputValue, onInput, disabled, language
}: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const isIME = language === 'chinese' || language === 'japanese';

  // Focus input on mount
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  // Auto-scroll to keep current character in view
  useEffect(() => {
    if (!displayRef.current) return;
    const currentEl = displayRef.current.querySelector('.char-current');
    if (currentEl) {
      currentEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [currentIndex]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onInput(e.target.value);
  }, [onInput]);

  const visibleStart = Math.max(0, currentIndex - 30);
  const visibleChars = charStates.slice(0, Math.min(charStates.length, visibleStart + VISIBLE_CHARS));

  return (
    <div className="space-y-4">
      {/* Text display */}
      <div
        className="glass-card rounded-xl p-6 min-h-[140px] cursor-text relative overflow-hidden"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Glow line at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40" />

        <div
          ref={displayRef}
          className="font-mono text-xl leading-relaxed tracking-wide select-none overflow-hidden"
          style={{ maxHeight: '120px', overflowY: 'hidden' }}
        >
          {visibleChars.map((cs, i) => (
            <span
              key={i + visibleStart}
              className={cn(
                'transition-colors duration-75',
                {
                  'char-correct': cs.status === 'correct',
                  'char-incorrect': cs.status === 'incorrect',
                  'char-current': cs.status === 'current',
                  'char-pending': cs.status === 'pending',
                }
              )}
            >
              {cs.char}
            </span>
          ))}
          {charStates.length > visibleStart + VISIBLE_CHARS && (
            <span className="char-pending opacity-40">...</span>
          )}
        </div>
      </div>

      {/* Input field */}
      {isIME ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={inputValue}
          onChange={handleChange}
          disabled={disabled}
          rows={2}
          className={cn(
            'w-full font-mono text-lg bg-muted border border-border rounded-xl px-4 py-3',
            'focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30',
            'text-foreground placeholder:text-muted-foreground resize-none',
            'transition-all duration-200',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          placeholder="Type here... (IME input supported)"
          style={{ boxShadow: 'inset 0 0 20px hsl(185 100% 50% / 0.03)' }}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={inputValue}
          onChange={handleChange}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={cn(
            'w-full font-mono text-lg bg-muted border border-border rounded-xl px-4 py-3',
            'focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30',
            'text-foreground placeholder:text-muted-foreground',
            'transition-all duration-200',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          placeholder="Start typing..."
          style={{ boxShadow: 'inset 0 0 20px hsl(185 100% 50% / 0.03)' }}
        />
      )}
    </div>
  );
}
