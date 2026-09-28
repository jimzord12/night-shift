import { useEffect, useRef, useState } from 'react';
import type { Outcome } from '../../src/types.ts';
import { Icon, STATUS } from './ui.tsx';
import type { IconName } from './ui.tsx';

// How it works (TASK-32, D24): the whole loop in one animated view, because the concepts fade
// between mornings. Shown on the first run (no nights yet) and behind a ? beside the few terms that
// need it, opened at their step. No docs page.

export type ExplainStep = 'night' | 'report' | 'answer' | 'save' | 'start';

const OUTCOME_MEANS: Record<Outcome, string> = {
  done: 'finished and checked',
  partial: 'progress saved; an agent continues',
  blocked: 'waits for your answer',
  failed: 'tried; needs a look',
  not_started: 'the night never reached it',
  skipped: 'left out on purpose, with a reason',
};

const STEPS: { id: ExplainStep; icon: IconName; short: string; title: string; body: string }[] = [
  {
    id: 'night',
    icon: 'moon',
    short: 'Night',
    title: 'An agent works through the night',
    body: 'You give it a plan of tasks. It takes them one by one, records how each ended with proof, and asks you instead of guessing when a decision is yours.',
  },
  {
    id: 'report',
    icon: 'file',
    short: 'Report',
    title: 'A Night Report waits in the morning',
    body: 'Every task ends with one of six outcomes. "Stopped early" means the night ended before some tasks started; they carry over to the next one.',
  },
  {
    id: 'answer',
    icon: 'question',
    short: 'Answer',
    title: 'You answer its questions',
    body: 'Each question comes with options and the agent’s pick. Choose one and add a note if it helps. You can change an answer until an agent takes it on.',
  },
  {
    id: 'save',
    icon: 'forward',
    short: 'Save',
    title: 'Save for the next agent',
    body: 'Your answers and the unfinished tasks go into a follow-up file in the repository. Saving starts nothing: it makes sure the next agent begins where this one stopped.',
  },
  {
    id: 'start',
    icon: 'play',
    short: 'Start',
    title: 'You start the next agent',
    body: 'When you want the work done, open Claude Code in that folder and say “start night shift” (tonight, unattended) or “work on the follow-up” (now, with you there). It reads the follow-up first, and the loop begins again.',
  },
];

// Anything can open the view at a step, without threading callbacks through every screen.
const EVENT = 'night-shift:explain';
export function explain(step: ExplainStep = 'night') {
  window.dispatchEvent(new CustomEvent<ExplainStep>(EVENT, { detail: step }));
}
export function useExplainRequests(open: (step: ExplainStep) => void) {
  useEffect(() => {
    const on = (e: Event) => open((e as CustomEvent<ExplainStep>).detail);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, [open]);
}

// The small ? beside a term.
export function HelpDot({ step, term }: { step: ExplainStep; term: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        explain(step);
      }}
      className="inline-grid size-5 shrink-0 place-items-center rounded-full border border-white/20 align-middle text-[0.7rem] font-bold text-white/60 transition hover:border-white/50 hover:text-white"
      title={`What is “${term}”?`}
      aria-label={`What is “${term}”?`}
    >
      ?
    </button>
  );
}

// The view over everything (the question deck included), closed by Esc, the backdrop or the button.
export function ExplainerOverlay({ step, onClose }: { step: ExplainStep; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panel.current?.focus({ preventScroll: true });
    return () => opener?.focus?.();
  }, []);
  return (
    // Centred when it fits; taller than the screen (a phone), it scrolls from its top instead of
    // being cut off above.
    <div className="fixed inset-0 z-50 overflow-y-auto bg-night-950/80 backdrop-blur-sm" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          ref={panel}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="How Night Shift works"
          onClick={(e) => e.stopPropagation()}
          className="pop-in relative w-full max-w-2xl rounded-3xl border border-white/10 bg-night-900 p-5 shadow-2xl outline-none sm:p-8"
        >
          <button onClick={onClose} className="absolute top-3 right-3 rounded-full p-2 text-white/60 hover:text-white" aria-label="Close" title="Close (Esc)">
            <Icon name="close" className="size-5" />
          </button>
          <HowItWorks start={step} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

// The loop itself: a ring of five steps with the current one lit, its words below, and arrows to
// move. It plays by itself until the developer takes a step, and never when it was opened at a step
// or motion is reduced. With onClose it is the overlay: it takes every key first (a capture on
// window runs before the deck's own keys), so Esc closes this view only and arrows move its steps.
export function HowItWorks({ start, autoplay = false, onClose }: { start?: ExplainStep; autoplay?: boolean; onClose?: () => void }) {
  const [at, setAt] = useState(() => Math.max(0, STEPS.findIndex((s) => s.id === start)));
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [playing, setPlaying] = useState(autoplay && !reduced);
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setAt((i) => (i + 1) % STEPS.length), 6000);
    return () => clearTimeout(t);
  }, [playing, at]);
  const go = (i: number) => {
    setPlaying(false);
    setAt((i + STEPS.length) % STEPS.length);
  };
  const step = (by: number) => {
    setPlaying(false);
    setAt((i) => (i + by + STEPS.length) % STEPS.length);
  };
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        step(e.key === 'ArrowRight' ? 1 : -1);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);
  const s = STEPS[at];
  return (
    <div
      onKeyDown={(e) => {
        if (onClose) return;
        if (e.key === 'ArrowRight') step(1);
        if (e.key === 'ArrowLeft') step(-1);
      }}
    >
      <div className="px-8 text-center text-xs font-semibold tracking-widest text-white/45 uppercase">How Night Shift works</div>
      <Loop at={at} onPick={go} />
      <div key={s.id} className="pop-in mx-auto mt-2 max-w-lg text-center" aria-live="polite">
        <div className="text-xs text-white/45">Step {at + 1} of {STEPS.length}</div>
        <h2 className="font-display mt-1 text-2xl font-semibold">{s.title}</h2>
        <p className="mt-2 text-white/70">{s.body}</p>
        {s.id === 'report' && (
          <ul className="mt-4 grid gap-1.5 text-left text-sm sm:grid-cols-2">
            {(Object.keys(STATUS) as Outcome[]).map((o) => (
              <li key={o} className="flex items-center gap-2">
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-px text-xs font-semibold" style={{ color: `color-mix(in srgb, ${STATUS[o].color} 80%, white)`, background: `color-mix(in srgb, ${STATUS[o].color} 18%, transparent)` }}>
                  <Icon name={STATUS[o].icon} className="size-3" strokeWidth={2.6} /> {STATUS[o].label}
                </span>
                <span className="text-white/60">{OUTCOME_MEANS[o]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button onClick={() => step(-1)} className="moon-btn size-10" aria-label="Previous step" title="Previous step">
          <Icon name="left" className="size-5" strokeWidth={2.4} />
        </button>
        <div className="flex gap-1.5" aria-hidden>
          {STEPS.map((x, i) => (
            <span key={x.id} className="h-1.5 rounded-full transition-all duration-500" style={{ width: i === at ? 20 : 6, background: i === at ? 'var(--color-moon)' : '#ffffff30' }} />
          ))}
        </div>
        <button onClick={() => step(1)} className="moon-btn size-10" aria-label="Next step" title="Next step">
          <Icon name="right" className="size-5" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

// Five steps on a circle, read clockwise from the top, with a moon that travels to the current one.
function Loop({ at, onPick }: { at: number; onPick: (i: number) => void }) {
  const size = 260;
  const r = 90;
  const c = size / 2;
  const pos = (i: number) => {
    const a = (i / STEPS.length) * 2 * Math.PI - Math.PI / 2;
    return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
  };
  return (
    <div className="relative mx-auto mt-3" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" aria-hidden>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#ffffff18" strokeWidth={2} strokeDasharray="3 6" />
        {/* The travelled part of the loop, up to the current step. */}
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={`${(2 * Math.PI * r * at) / STEPS.length} ${2 * Math.PI * r}`}
          transform={`rotate(-90 ${c} ${c})`}
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />
      </svg>
      {STEPS.map((s, i) => {
        const p = pos(i);
        const now = i === at;
        return (
          <button
            key={s.id}
            onClick={() => onPick(i)}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ left: p.x, top: p.y }}
            aria-label={`Step ${i + 1}: ${s.title}`}
            aria-current={now ? 'step' : undefined}
          >
            <span
              className="grid size-11 place-items-center rounded-full border-2 transition-all duration-500"
              style={{
                borderColor: now ? 'var(--color-moon)' : i < at ? 'var(--accent)' : '#ffffff26',
                background: now ? 'color-mix(in srgb, var(--accent) 35%, var(--color-night-900))' : 'var(--color-night-900)',
                boxShadow: now ? '0 0 22px var(--accent)' : undefined,
                transform: now ? 'scale(1.12)' : undefined,
              }}
            >
              <Icon name={s.icon} className={`size-5 ${now ? 'text-moon' : 'text-white/55'}`} strokeWidth={2} />
            </span>
          </button>
        );
      })}
      <div className="absolute inset-0 grid place-items-center text-center">
        <div className="font-display text-lg font-semibold text-white/85">{STEPS[at].short}</div>
      </div>
    </div>
  );
}
