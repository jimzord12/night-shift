import { useState } from 'react';
import { OWNER_STATE, OWNER_STATES } from '../../src/types.ts';
import type { NightSummary, OwnerState } from '../../src/types.ts';
import { Icon } from './ui.tsx';

// D24's step track: the six owner states in order. Steps before the current one are ticked (a
// night may skip one, say a night with no questions); the current one glows in its whose-turn
// colour; the rest wait. It animates on to the next step when the state changes.
export function StepTrack({ state, small = false }: { state: OwnerState; small?: boolean }) {
  const at = OWNER_STATES.indexOf(state);
  const color = OWNER_STATE[state].color;
  if (small) {
    return (
      <div className="flex items-center gap-1" aria-label={`Step ${at + 1} of ${OWNER_STATES.length}: ${OWNER_STATE[state].label}`} title={OWNER_STATE[state].label}>
        {OWNER_STATES.map((s, i) => (
          <span key={s} className="h-1.5 rounded-full transition-all duration-500" style={{ width: i === at ? 18 : 6, background: i < at ? 'color-mix(in srgb, var(--color-shipped) 70%, transparent)' : i === at ? color : '#ffffff22', boxShadow: i === at ? `0 0 8px ${color}` : undefined }} />
        ))}
      </div>
    );
  }
  return (
    <>
    <ol className="flex items-start" aria-label="Where this night stands">
      {OWNER_STATES.map((s, i) => {
        const done = i < at || (s === 'done' && state === 'done');
        const now = i === at;
        return (
          <li key={s} className="flex min-w-0 flex-1 flex-col items-center text-center" aria-current={now ? 'step' : undefined}>
            <div className="flex w-full items-center">
              <span className="h-0.5 flex-1 transition-colors duration-700" style={{ background: i === 0 ? 'transparent' : i <= at ? 'color-mix(in srgb, var(--color-shipped) 60%, transparent)' : '#ffffff1a' }} />
              <span
                key={now ? `now-${state}` : s}
                className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition-all duration-500 ${now ? 'pop-in' : ''}`}
                style={{
                  borderColor: now ? color : done ? 'var(--color-shipped)' : '#ffffff26',
                  background: now ? `color-mix(in srgb, ${color} 30%, var(--color-night-900))` : done ? 'color-mix(in srgb, var(--color-shipped) 25%, var(--color-night-900))' : 'var(--color-night-900)',
                  boxShadow: now ? `0 0 16px ${color}` : undefined,
                }}
              >
                {done ? <Icon name="check" className="size-3.5 text-shipped" strokeWidth={3} /> : <span className="size-2 rounded-full" style={{ background: now ? color : '#ffffff33' }} />}
              </span>
              <span className="h-0.5 flex-1 transition-colors duration-700" style={{ background: i === OWNER_STATES.length - 1 ? 'transparent' : i < at ? 'color-mix(in srgb, var(--color-shipped) 60%, transparent)' : '#ffffff1a' }} />
            </div>
            <span className={`mt-1.5 hidden px-1 text-xs leading-tight sm:block ${now ? 'font-semibold text-white' : done ? 'text-white/55' : 'text-white/35'}`}>{OWNER_STATE[s].label}</span>
          </li>
        );
      })}
    </ol>
    {/* A phone has no room for the labels: name the current step once. */}
    <div className="mt-1.5 text-xs text-white/60 sm:hidden">Step {at + 1} of {OWNER_STATES.length} · <span className="font-semibold text-white">{OWNER_STATE[state].label}</span></div>
    </>
  );
}

// What comes next in each state, in one line, with the phrase to say where an agent is the next step.
// `held`: every open follow-up item is taken on by a night running now.
export function nextStep(state: OwnerState, n: Pick<NightSummary, 'questions_open' | 'follow_up'> & Partial<Pick<NightSummary, 'decisions_open'>>, held = false): { text: string; phrase?: string } {
  switch (state) {
    case 'running':
      return { text: 'an agent is on it; reload to see how far it got.' };
    case 'new':
      return { text: 'read what the night did.' };
    case 'needs_answers':
    {
      const q = n.questions_open;
      const d = n.decisions_open ?? 0;
      if (!q && !d) return { text: 'talk it through with an agent: open Claude Code in this folder and say', phrase: 'work on the follow-up' };
      const todo = [q && `answer ${q === 1 ? 'its question' : `its ${q} questions`}`, d && `review ${d === 1 ? 'the decision' : `the ${d} decisions`} the agent took for you`].filter(Boolean).join(' and ');
      // Already saved: an answer or a disagreement now goes straight to the next agent.
      return { text: `${todo}${n.follow_up ? '; what you say reaches the next agent.' : ', then save for the next agent.'}` };
    }
    case 'ready_to_save':
      return { text: 'save for the next agent. Nothing runs until you start one.' };
    case 'waiting':
      return held ? { text: 'a running night is working on what it carried.' } : { text: 'start an agent in this folder when you want the work done; tonight, say', phrase: 'start night shift' };
    case 'done':
      return { text: 'nothing is left for this night.' };
  }
}

// One Next: line per state, with the phrase to copy where there is one.
export function NextLine({ text, phrase }: { text: string; phrase?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <p className="text-sm leading-relaxed text-white/70">
      <span className="font-semibold text-white/85">Next:</span> {text}{' '}
      {phrase && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            void navigator.clipboard.writeText(phrase).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }, () => {});
          }}
          className="inline-block rounded-full border border-white/15 bg-night-950/60 px-2.5 py-0.5 align-middle font-mono text-xs whitespace-nowrap text-white/85 hover:border-white/30"
          title="Copy the phrase"
        >
          {copied ? 'Copied' : phrase.replace(/-/g, '‑')}
        </button>
      )}
    </p>
  );
}
