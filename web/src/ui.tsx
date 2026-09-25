import type { ReactNode } from 'react';
import type { OutcomeStatus } from '../../src/types.ts';

const PATHS = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  stop: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 8.5l7 7m0-7l-7 7',
  skip: 'M5 5l8 7-8 7V5zm12 0v14',
  moon: 'M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  commit: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM3 12h6m6 0h6',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9.5a1.5 1.5 0 1 0 0-.01',
  question: 'M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.4M12 17.5v.01',
  hammer: 'M14 6l4 4M5 19l8-8M12 4l6 6-2 2-6-6 2-2z',
  compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm3.5 5.5l-2 5-5 2 2-5 5-2z',
  up: 'M12 19V5m-6 6l6-6 6 6',
  down: 'M12 5v14m-6-6l6 6 6-6',
  grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  close: 'M6 6l12 12M18 6L6 18',
  left: 'M15 6l-6 6 6 6',
  right: 'M9 6l6 6-6 6',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
  file: 'M7 3h7l5 5v13H7zM14 3v5h5',
  collide: 'M8 7l-4 5 4 5M16 7l4 5-4 5M11 5l2 14',
  warn: 'M12 4l9 16H3L12 4zm0 6v4m0 3v.01',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = 'size-4', strokeWidth = 2 }: { name: IconName; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}

export const STATUS: Record<OutcomeStatus, { label: string; color: string; icon: IconName; text: string }> = {
  shipped: { label: 'Shipped', color: 'var(--color-shipped)', icon: 'check', text: 'text-shipped' },
  'needs-eyes': { label: 'Needs your eyes', color: 'var(--color-eyes)', icon: 'eye', text: 'text-eyes' },
  blocked: { label: 'Blocked', color: 'var(--color-blocked)', icon: 'stop', text: 'text-blocked' },
  skipped: { label: 'Skipped', color: 'var(--color-skipped)', icon: 'skip', text: 'text-skipped' },
};

export function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full bg-white/8 px-2 py-0.5 text-xs text-white/75 ${className}`}>{children}</span>;
}

export function Ring({ done, total, size = 120, color = 'var(--accent)', children }: { done: number; total: number; size?: number; color?: string; children?: ReactNode }) {
  const r = size / 2 - 9;
  const c = 2 * Math.PI * r;
  const frac = total ? done / total : 1;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffffff14" strokeWidth={10} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.2,.9,.3,1)', filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

// A half-circle fuel gauge: how many Night-ready cards are queued against the target.
export function FuelGauge({ value, target, low }: { value: number; target: number; low: number }) {
  const w = 180;
  const r = 70;
  const frac = Math.min(value / target, 1);
  const angle = Math.PI * (1 - frac);
  const needle = { x: w / 2 + r * Math.cos(angle), y: 90 - r * Math.sin(angle) };
  const lowAngle = Math.PI * (1 - Math.min(low / target, 1));
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => `${w / 2 + r * Math.cos(a)} ${90 - r * Math.sin(a)}`;
    return `M ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)}`;
  };
  const color = value < low ? 'var(--color-blocked)' : value < target * 0.66 ? 'var(--color-eyes)' : 'var(--color-shipped)';
  return (
    <svg viewBox={`0 0 ${w} 104`} className="w-44">
      <path d={arc(Math.PI, 0)} stroke="#ffffff14" strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d={arc(Math.PI, lowAngle)} stroke="color-mix(in srgb, var(--color-blocked) 40%, transparent)" strokeWidth={12} fill="none" strokeLinecap="round" />
      {value > 0 && <path d={arc(Math.PI, angle)} stroke={color} strokeWidth={12} fill="none" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 5px ${color})` }} />}
      <line x1={w / 2} y1={90} x2={needle.x} y2={needle.y} stroke="#fff" strokeWidth={3} strokeLinecap="round" style={{ transition: 'all .6s' }} />
      <circle cx={w / 2} cy={90} r={6} fill="#fff" />
      <text x={14} y={103} fontSize={10} fill="#ffffff70">E</text>
      <text x={w - 22} y={103} fontSize={10} fill="#ffffff70">F</text>
    </svg>
  );
}

const DAY = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export function shiftTitle(id: string): string {
  const m = /^(\d{4}-\d{2}-\d{2})-(night|day)$/.exec(id);
  if (!m) return id;
  const d = DAY.format(new Date(`${m[1]}T12:00:00`));
  return m[2] === 'night' ? `Night of ${d}` : `Day Shift, ${d}`;
}

export function taskId(cardName: string): { id: string; rest: string } {
  const i = cardName.indexOf(':');
  return i > 0 ? { id: cardName.slice(0, i), rest: cardName.slice(i + 1).trim() } : { id: cardName, rest: '' };
}
