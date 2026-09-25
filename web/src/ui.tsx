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

// The buffer as a car's fuel gauge: how many Night-ready cards are queued against the target.
// A segmented arc shading from red (empty) through amber to green (full), a tick per card with
// numbers every five, a red flag at the "call a Day Shift" level, a glowing tapered needle, and
// large E/F marks with a pump between them.
export function FuelGauge({ value, target, low, className = 'w-44' }: { value: number; target: number; low: number; className?: string }) {
  const cx = 150;
  const cy = 150;
  const r = 112;
  const frac = Math.max(0, Math.min(value / target, 1));
  const polar = (t: number, radius: number) => {
    const a = Math.PI * (1 - t);
    return { x: cx + radius * Math.cos(a), y: cy - radius * Math.sin(a) };
  };
  const arc = (t0: number, t1: number, radius: number) => {
    const p0 = polar(t0, radius);
    const p1 = polar(t1, radius);
    return `M ${p0.x} ${p0.y} A ${radius} ${radius} 0 0 1 ${p1.x} ${p1.y}`;
  };
  const hue = (t: number) => `hsl(${(350 + 160 * t) % 360} 88% 62%)`;
  const SEGMENTS = 30;
  const gap = 0.006;
  const segments = Array.from({ length: SEGMENTS }, (_, i) => {
    const t0 = i / SEGMENTS + gap;
    const t1 = (i + 1) / SEGMENTS - gap;
    return { d: arc(t0, t1, r), color: hue((t0 + t1) / 2), lit: (i + 0.5) / SEGMENTS <= frac };
  });
  const ticks = Array.from({ length: target + 1 }, (_, i) => {
    const t = i / target;
    const major = i % 5 === 0 || i === target;
    const a = polar(t, r - 16);
    const b = polar(t, r - (major ? 30 : 23));
    const label = polar(t, r - 44);
    return { i, a, b, major, label };
  });
  const lowFlag = polar(Math.min(low / target, 1), r + 14);
  const tip = polar(frac, r - 20);
  const base = (dt: number) => polar(frac + dt, 9);
  const needleColor = hue(frac);
  return (
    <svg viewBox="0 0 300 212"className={className} role="img" aria-label={`${value} of ${target} cards ready`}>
      <defs>
        <radialGradient id="hub" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fffef8" />
          <stop offset="60%" stopColor="#d9d2bb" />
          <stop offset="100%" stopColor="#8f8871" />
        </radialGradient>
        <filter id="needle-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* the dial face */}
      <path d={`${arc(0, 1, r + 8)} L ${cx + r - 40} ${cy} A ${r - 40} ${r - 40} 0 0 0 ${cx - r + 40} ${cy} Z`} fill="#ffffff05" />

      {segments.map((s, i) => (
        <path key={i} d={s.d} stroke={s.lit ? s.color : '#ffffff14'} strokeWidth={14} fill="none" style={s.lit ? { filter: `drop-shadow(0 0 4px ${s.color})` } : undefined} />
      ))}

      {ticks.map((t) => (
        <line key={t.i} x1={t.a.x} y1={t.a.y} x2={t.b.x} y2={t.b.y} stroke={t.major ? '#ffffffb0' : '#ffffff45'} strokeWidth={t.major ? 2.4 : 1.2} strokeLinecap="round" />
      ))}
      {ticks.filter((t) => t.major && t.i !== 0 && t.i !== target).map((t) => (
        <text key={`l${t.i}`} x={t.label.x} y={t.label.y + 4} fontSize={12} fill="#ffffff80" textAnchor="middle" fontWeight={600}>{t.i}</text>
      ))}

      {/* the "call a Day Shift" flag */}
      <circle cx={lowFlag.x} cy={lowFlag.y} r={4.5} fill="var(--color-blocked)" style={{ filter: 'drop-shadow(0 0 4px var(--color-blocked))' }} />

      {/* E and F, with a pump between them */}
      <text x={cx - r + 6} y={cy + 30} fontSize={26} fontWeight={800} fill="var(--color-blocked)" textAnchor="middle" style={{ filter: 'drop-shadow(0 0 6px #fb718566)' }}>E</text>
      <text x={cx + r - 6} y={cy + 30} fontSize={26} fontWeight={800} fill="var(--color-shipped)" textAnchor="middle" style={{ filter: 'drop-shadow(0 0 6px #34d39966)' }}>F</text>
      <g transform={`translate(${cx - 11} ${cy - 62})`} fill="none" stroke="#ffffff70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x={2} y={4} width={12} height={17} rx={2} />
        <line x1={4.5} y1={9} x2={11.5} y2={9} />
        <path d="M14 8 h3 a2 2 0 0 1 2 2 v7 a1.5 1.5 0 0 0 3 0 V8 l-3 -3" />
      </g>

      {/* the needle */}
      <polygon points={`${base(0.5).x},${base(0.5).y} ${tip.x},${tip.y} ${base(-0.5).x},${base(-0.5).y}`} fill={needleColor} filter="url(#needle-glow)" style={{ transition: 'all .8s cubic-bezier(.2,.9,.3,1.2)' }} />
      <circle cx={cx} cy={cy} r={13} fill="url(#hub)" stroke="#00000055" strokeWidth={1} />
      <circle cx={cx} cy={cy} r={4} fill={needleColor} />

      {/* readout, below the hub where the needle never goes */}
      <text x={cx} y={cy + 50} fontSize={28} fontWeight={800} fill="#fff" textAnchor="middle">
        {value}
        <tspan fontSize={15} fontWeight={600} fill="#ffffff70"> / {target}</tspan>
      </text>
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
