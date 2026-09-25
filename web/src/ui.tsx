import type { ReactNode } from 'react';
import type { OutcomeStatus, Zone } from '../../src/types.ts';
import { bufferZone } from '../../src/types.ts';

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
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  play: 'M7 4.5v15l12-7.5-12-7.5z',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z',
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

export const ZONE: Record<Zone, { label: string; hint: string; color: string }> = {
  idle: { label: 'Idle', hint: 'Too few cards for a night: time for a Day Shift', color: '#7dd3fc' },
  warming: { label: 'Warming up', hint: 'Room for more cards', color: '#a3e635' },
  sweet: { label: 'Sweet spot', hint: 'Enough for the next nights, nothing going stale', color: '#34d399' },
  hot: { label: 'Running hot', hint: 'Enough for now: finish before adding', color: '#fbbf24' },
  redline: { label: 'Redline', hint: 'Too much queued: the plan goes stale before the nights clear it', color: '#fb7185' },
};

// The queue as an engine's tachometer: how many Night-ready cards wait for the Night Shift. A 240°
// dial with a band per zone (idle, warming up, the green sweet spot at 70-80%, running hot, and
// the hatched redline from 90%), a tick per card, a glowing needle on a moon hub, and the count
// in the middle. In the redline the needle and readout pulse.
export function Tachometer({ value, max, low, className = 'w-64' }: { value: number; max: number; low: number; className?: string }) {
  const cx = 150;
  const cy = 145;
  const r = 112;
  const SWEEP = 240;
  const START = 210; // degrees, counter-clockwise from the right, the dial's zero at lower left
  const clamp = (t: number) => Math.max(0, Math.min(t, 1));
  const polar = (t: number, radius: number) => {
    const a = ((START - SWEEP * clamp(t)) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(a), y: cy - radius * Math.sin(a) };
  };
  const arc = (t0: number, t1: number, radius: number) => {
    const p0 = polar(t0, radius);
    const p1 = polar(t1, radius);
    const large = (t1 - t0) * SWEEP > 180 ? 1 : 0;
    return `M ${p0.x} ${p0.y} A ${radius} ${radius} 0 ${large} 1 ${p1.x} ${p1.y}`;
  };
  const zone = bufferZone(value, { max, low });
  const lowT = clamp(low / max);
  const bands: { from: number; to: number; z: Zone }[] = [
    { from: 0, to: lowT, z: 'idle' },
    { from: lowT, to: 0.7, z: 'warming' },
    { from: 0.7, to: 0.8, z: 'sweet' },
    { from: 0.8, to: 0.9, z: 'hot' },
    { from: 0.9, to: 1, z: 'redline' },
  ].filter((b) => b.to > b.from) as { from: number; to: number; z: Zone }[];
  const step = max <= 12 ? 2 : 5;
  const ticks = Array.from({ length: max + 1 }, (_, i) => {
    const t = i / max;
    const major = i % step === 0 || i === max;
    return { i, t, major, a: polar(t, r - 16), b: polar(t, r - (major ? 30 : 23)), label: polar(t, r - 44) };
  });
  const frac = clamp(value / max);
  const tip = polar(frac, r - 18);
  const base = (dt: number) => polar(frac + dt, 10);
  const color = ZONE[zone].color;
  const hot = zone === 'redline';
  const idleLabel = polar(0, r + 2);
  const redLabel = polar(1, r + 2);
  return (
    <svg viewBox="0 0 300 276" className={className} role="img" aria-label={`${value} cards: ${ZONE[zone].label}`}>
      <defs>
        <radialGradient id="tacho-hub" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fffef8" />
          <stop offset="60%" stopColor="#d9d2bb" />
          <stop offset="100%" stopColor="#8f8871" />
        </radialGradient>
        <radialGradient id="tacho-face" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#ffffff0d" />
          <stop offset="100%" stopColor="#ffffff00" />
        </radialGradient>
        <pattern id="tacho-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#fb7185" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#7f1d2d" strokeWidth="3" />
        </pattern>
        <filter id="tacho-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={cx} cy={cy} r={r + 12} fill="url(#tacho-face)" stroke="#ffffff12" strokeWidth={1.5} />

      {bands.map((b) => {
        const lit = b.z === zone;
        return (
          <path
            key={b.z}
            d={arc(b.from, b.to, r)}
            stroke={b.z === 'redline' ? 'url(#tacho-hatch)' : ZONE[b.z].color}
            strokeWidth={lit ? 15 : 11}
            fill="none"
            opacity={lit ? 1 : 0.38}
            style={lit ? { filter: `drop-shadow(0 0 7px ${ZONE[b.z].color})` } : undefined}
          />
        );
      })}

      {ticks.map((t) => (
        <line key={t.i} x1={t.a.x} y1={t.a.y} x2={t.b.x} y2={t.b.y} stroke={t.t >= 0.9 ? '#fb7185' : t.major ? '#ffffffc0' : '#ffffff45'} strokeWidth={t.major ? 2.4 : 1.2} strokeLinecap="round" />
      ))}
      {ticks.filter((t) => t.major).map((t) => (
        <text key={`l${t.i}`} x={t.label.x} y={t.label.y + 4.5} fontSize={13} fontWeight={700} textAnchor="middle" fill={t.t >= 0.9 ? '#fb7185' : '#ffffffa0'}>{t.i}</text>
      ))}

      <text x={idleLabel.x + 4} y={idleLabel.y + 26} fontSize={11} fontWeight={700} letterSpacing={1.5} textAnchor="middle" fill="#7dd3fc">IDLE</text>
      <text x={redLabel.x - 8} y={redLabel.y + 26} fontSize={11} fontWeight={700} letterSpacing={1.5} textAnchor="middle" fill="#fb7185">REDLINE</text>

      {/* readout: the count, and what the scale means */}
      <text x={cx} y={cy + 52} fontSize={34} fontWeight={800} textAnchor="middle" fill="#fff" style={hot ? { animation: 'redline 0.9s ease-in-out infinite' } : undefined}>{value}</text>
      <text x={cx} y={cy + 70} fontSize={10} letterSpacing={2} textAnchor="middle" fill="#ffffff70">CARDS QUEUED</text>

      <polygon
        points={`${base(0.5).x},${base(0.5).y} ${tip.x},${tip.y} ${base(-0.5).x},${base(-0.5).y}`}
        fill={color}
        filter="url(#tacho-glow)"
        style={{ transition: 'all .9s cubic-bezier(.2,.9,.3,1.25)', animation: hot ? 'redline 0.9s ease-in-out infinite' : undefined }}
      />
      <circle cx={cx} cy={cy} r={14} fill="url(#tacho-hub)" stroke="#00000055" strokeWidth={1} />
      <circle cx={cx} cy={cy} r={4.5} fill={color} />
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
