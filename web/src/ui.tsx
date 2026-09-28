import type { ReactNode } from 'react';
import { OWNER_STATE, ownerState, waitedDays } from '../../src/types.ts';
import type { NightSummary, Outcome, OwnerState } from '../../src/types.ts';

const PATHS = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  stop: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 8.5l7 7m0-7l-7 7',
  skip: 'M5 5l8 7-8 7V5zm12 0v14',
  half: 'M12 3a9 9 0 1 0 0 18V3z M12 3a9 9 0 0 1 0 18',
  dash: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12h8',
  moon: 'M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9.5a1.5 1.5 0 1 0 0-.01',
  question: 'M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.4M12 17.5v.01',
  terminal: 'M4 5h16v14H4zM7.5 9.5l3 2.5-3 2.5M12.5 15h4',
  note: 'M6 4h9l4 4v12H6zM9 12h7M9 16h5',
  close: 'M6 6l12 12M18 6L6 18',
  left: 'M15 6l-6 6 6 6',
  right: 'M9 6l6 6-6 6',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
  file: 'M7 3h7l5 5v13H7zM14 3v5h5',
  warn: 'M12 4l9 16H3L12 4zm0 6v4m0 3v.01',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  play: 'M7 4.5v15l12-7.5-12-7.5z',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z',
  send: 'M4 12l16-8-6 16-3-7-7-1z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  coin: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM14.5 9.5c-.5-1-1.4-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.9 2.5 2-1 2-2.5 2c-1.2 0-2.1-.6-2.6-1.6M12 6.5V8m0 8v1.5',
  bot: 'M8 9h8a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3zM12 5v4M9.5 13.5v.01M14.5 13.5v.01',
  forward: 'M5 12h13M13 6l6 6-6 6',
  lock: 'M7.5 11V8a4.5 4.5 0 0 1 9 0v3M5.5 11h13v9.5h-13z',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  folder: 'M3 6.5A1.5 1.5 0 0 1 4.5 5h4.2l2 2.5h8.8A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = 'size-4', strokeWidth = 2 }: { name: IconName; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}

// The six outcomes a task can end a night with, coloured like the owner states: amber when the
// developer must act, blue when an agent continues, red only when something broke (D24).
export const STATUS: Record<Outcome, { label: string; color: string; icon: IconName }> = {
  done: { label: 'Done', color: 'var(--color-shipped)', icon: 'check' },
  partial: { label: 'Partial', color: 'var(--color-agent)', icon: 'half' },
  blocked: { label: 'Blocked', color: 'var(--color-eyes)', icon: 'stop' },
  failed: { label: 'Failed', color: 'var(--color-broken)', icon: 'warn' },
  not_started: { label: 'Not started', color: 'var(--color-idle)', icon: 'dash' },
  skipped: { label: 'Skipped', color: 'var(--color-skipped)', icon: 'skip' },
};

// A task of a running night with no outcome yet.
export const WORKING = { label: 'Working', color: 'var(--color-agent)', icon: 'moon' as IconName };
export const taskStyle = (outcome: Outcome | null) => (outcome === null ? WORKING : STATUS[outcome]);

// The one badge a night shows; `waited` adds how long it has waited for an agent, from two days on.
export function StateBadge({ state, waited = null, small = false }: { state: OwnerState; waited?: number | null; small?: boolean }) {
  const s = OWNER_STATE[state];
  const days = state === 'waiting' && waited ? ` · ${waited} days` : '';
  return (
    <span title={s.hint} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${small ? 'px-2 py-px text-xs' : 'px-2.5 py-0.5 text-xs'}`} style={{ color: `color-mix(in srgb, ${s.color} 75%, white)`, background: `color-mix(in srgb, ${s.color} 18%, transparent)` }}>
      {state === 'done' ? <Icon name="check" className="size-3.5" strokeWidth={3} /> : <span className="size-1.5 rounded-full" style={{ background: s.color, animation: state === 'running' ? 'redline 1.2s ease-in-out infinite' : undefined }} />}
      {s.label}{days}
    </span>
  );
}

// A night's badge wherever it is listed: its state, or red when its night file cannot be read
// (no start to judge by).
export function NightBadge({ n, now, small = false }: { n: NightSummary; now: number; small?: boolean }) {
  if (!n.started_at) return <span title="The night file cannot be read" className={`inline-flex shrink-0 items-center rounded-full bg-broken/15 font-semibold whitespace-nowrap text-broken ${small ? 'px-2 py-px text-xs' : 'px-2.5 py-0.5 text-xs'}`}>Cannot be read</span>;
  return <StateBadge state={ownerState(n)} waited={waitedDays(n.follow_up_at, now)} small={small} />;
}

// How a night ended, only when it cost work: grey, a warning rather than a state.
export function StoppedEarly({ count, short = false }: { count: number; short?: boolean }) {
  if (!count) return null;
  const text = `${count} task${count === 1 ? '' : 's'} never started`;
  return (
    <span title={`Stopped early: ${text}`} className="flex max-w-full min-w-0 items-start gap-1 text-sm text-white/50">
      <Icon name="warn" className="mt-[0.2em] size-3.5 shrink-0" /> <span className={short ? 'truncate' : 'min-w-0'}>{short ? `${count} never started` : `Stopped early: ${text}`}</span>
    </span>
  );
}

export function Pill({ children, className = '', title }: { children: ReactNode; className?: string; title?: string }) {
  return <span title={title} className={`inline-flex items-center gap-1 rounded-full bg-white/8 px-2 py-0.5 text-xs text-white/75 ${className}`}>{children}</span>;
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

const DAY = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

// "Night of Sat 26 Sept", and "(2nd)" for the second night that started the same day; short:
// "26 Sept (2nd)", for chips where space is tight.
export function nightTitle(id: string, short = false): string {
  const m = /^(\d{4}-\d{2}-\d{2})-([a-z]+)$/.exec(id);
  if (!m) return id;
  const d = (short ? DATE : DAY).format(new Date(`${m[1]}T12:00:00`));
  const n = m[2].length === 1 ? m[2].charCodeAt(0) - 96 : 27;
  const ord = n === 1 ? '' : ` (${n}${n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'})`;
  return `${short ? '' : 'Night of '}${d}${ord}`;
}

export function minutes(total: number | null | undefined): string {
  if (total === null || total === undefined) return 'unknown';
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

export const dollars = (usd: number | null | undefined) => (usd === null || usd === undefined ? 'unknown' : `$${usd.toFixed(2)}`);
