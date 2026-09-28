import type { FollowUpItem, NextNight, NextNightItem, Overview } from '../../src/types.ts';
import { OUTCOMES, OWNER_STATE, neverStarted, ownerState } from '../../src/types.ts';
import { Icon, NightBadge, STATUS, StoppedEarly, dollars, minutes, nightTitle } from './ui.tsx';

// ---------------------------------------------------------------- next night

// Each item's kind, coloured by whose turn it is: a decision or unfinished work is the agent's
// (blue); a question still without an answer is asked again, and a point to discuss waits for a day
// session with you, so both are yours (amber).
export const KIND: Record<FollowUpItem['kind'], { label: string; color: string }> = {
  decision: { label: 'Your decision', color: 'var(--color-agent)' },
  unfinished: { label: 'Unfinished', color: 'var(--color-agent)' },
  waiting: { label: 'Needs your answer', color: 'var(--color-eyes)' },
  // Only a day session with you works on it, so it is yours too.
  discuss: { label: "Let's discuss", color: 'var(--color-eyes)' },
  // A decision the agent took that you disagree with: the next agent revisits it (D31).
  disagreed: { label: 'You disagree', color: 'var(--color-agent)' },
};

// What the next night in each repository will pick up: every open follow-up item, per repository,
// grouped by the night it came from (D24 keeps one follow-up per night).
// The discuss item a held item waits on, named by its id: " (A1)".
function talkAbout(list: NextNightItem[], item: FollowUpItem): string {
  const talk = list.find((x) => x.item.kind === 'discuss' && x.item.task === item.task);
  return talk ? ` (${talk.item.id})` : '';
}

export function NextNightView({ next, onPick }: { next: NextNight | null; onPick: (repo: string, night: string) => void }) {
  if (!next) return <div className="py-24 text-center text-white/40">Loading what is scheduled…</div>;
  if (!next.repos.length) return <Empty icon="moon" text="Nothing is scheduled. When you save a night's unfinished work or answers for the next agent, the items show here until an agent finishes them." />;
  return (
    <div className="space-y-8">
      <p className="text-white/60">What the next night in each repository will pick up, and what waits for your talk first. It starts when you tell an agent there: “start night shift” (or “work on the follow-up” by day).</p>
      {next.repos.map(({ repo, items, problems }) => {
        const groups = new Map<string, NextNightItem[]>();
        for (const i of items) groups.set(i.from_night, [...(groups.get(i.from_night) ?? []), i]);
        return (
          <section key={repo.id}>
            <h2 className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display text-xl font-semibold">{repo.name}</span>
              <span className="text-sm text-white/50">{items.length} item{items.length === 1 ? '' : 's'}</span>
            </h2>
            <div className="space-y-3">
              {[...groups.entries()].map(([night, list]) => (
                <div key={night} className="glass rounded-2xl p-4">
                  <button onClick={() => onPick(repo.id, night)} className="mb-2 block text-left text-sm text-[color-mix(in_srgb,var(--accent)_70%,white)] hover:underline">
                    From the {nightTitle(night)} <Icon name="right" className="inline size-3.5 align-[-0.15em]" />
                  </button>
                  <ul className="space-y-3">
                    {list.map(({ ref, item, held }) => {
                      const k = KIND[item.kind];
                      return (
                        <li key={ref} className="flex min-w-0 gap-3">
                          <span className="mt-0.5 shrink-0 self-start rounded bg-white/10 px-1.5 font-mono text-xs leading-6">{item.id}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-medium">{item.title}</span>
                              <span className="rounded-full px-2 py-px text-xs font-semibold whitespace-nowrap" style={{ color: `color-mix(in srgb, ${k.color} 75%, white)`, background: `color-mix(in srgb, ${k.color} 18%, transparent)` }}>{k.label}</span>
                            </div>
                            {item.decision_label && <div className="mt-0.5 text-sm text-white/70">{item.question ? `${item.question} ` : ''}<span className="font-semibold text-white/85">→ {item.decision_label}</span></div>}
                            {!item.decision_label && item.question && <div className="mt-0.5 text-sm text-white/60">{item.question}</div>}
                            {item.owner_note && <div className="mt-0.5 text-sm text-white/60">Your note: {item.owner_note}</div>}
                            {item.left && item.left.length > 0 && <div className="mt-0.5 text-sm text-white/55">Still to do: {item.left.join(' · ')}</div>}
                            {item.kind === 'discuss' && <div className="mt-0.5 text-sm text-eyes/90">No night works on this: talk it through with an agent, with you there (&ldquo;work on the follow-up&rdquo;).</div>}
                            {held && item.kind !== 'discuss' && <div className="mt-0.5 text-sm text-eyes/90">Waits for your talk{talkAbout(list, item)}.</div>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              {problems.map((p) => <div key={p} className="rounded-2xl border border-broken/40 bg-broken/10 px-4 py-2 text-sm text-broken">{p}</div>)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- history

export function HistoryView({ overview, selected, onPick }: { overview: Overview; selected?: string; onPick: (repo: string, night: string) => void }) {
  if (!overview.nights.length) return <Empty icon="moon" text="No night has run yet." />;
  const name = (id: string) => overview.repos.find((r) => r.id === id)?.name ?? id;
  const now = Date.now();
  return (
    <ol className="relative space-y-3 border-l border-white/10 pl-6">
      {overview.nights.map((n, i) => {
        // A night file that could not be read has no start and nothing to judge: red, no state.
        const readable = !!n.started_at;
        const state = ownerState(n);
        const color = readable ? OWNER_STATE[state].color : 'var(--color-broken)';
        const total = n.tasks || 1;
        return (
          <li key={`${n.repo}/${n.id}`} className="pop-in relative" style={{ animationDelay: `${i * 30}ms` }}>
            {/* Centred on the list's left border: pl-6 (1.5rem) + half the border + half the dot (size-3.5 / 2). */}
            <span className="absolute left-[calc(-1.9375rem-0.5px)] z-10 mt-5 size-3.5 rounded-full border-2 border-night-950" style={{ background: color }} />
            <button onClick={() => onPick(n.repo, n.id)} className={`glass w-full rounded-2xl p-4 text-left transition hover:bg-white/10 ${`${n.repo}/${n.id}` === selected ? 'ring-2 ring-[var(--accent)]' : ''}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="flex max-w-full min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="font-display text-lg font-semibold">{nightTitle(n.id)}</span>
                  <span title={`Repository: ${name(n.repo)}`} className="inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium" style={{ color: 'color-mix(in srgb, var(--accent) 45%, white)', background: 'color-mix(in srgb, var(--accent) 20%, transparent)', borderColor: 'color-mix(in srgb, var(--accent) 45%, transparent)' }}>
                    <Icon name="folder" className="size-3.5 shrink-0" /> <span className="truncate">{name(n.repo)}</span>
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-4 text-sm text-white/55">
                  <span className="inline-flex items-center gap-1"><Icon name="clock" /> {minutes(n.duration_min)}</span>
                  <span className="inline-flex items-center gap-1"><Icon name="coin" /> {dollars(n.cost_usd)}</span>
                  <NightBadge n={n} now={now} />
                </span>
              </div>
              {n.summary && <p className="mt-2 text-sm text-white/70">{n.summary}</p>}
              {neverStarted(n) > 0 && <div className="mt-1.5 flex min-w-0"><StoppedEarly count={neverStarted(n)} /></div>}
              <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-white/5">
                {OUTCOMES.map((o) => n.counts[o] > 0 && <div key={o} style={{ width: `${(n.counts[o] / total) * 100}%`, background: STATUS[o].color }} title={`${n.counts[o]} ${STATUS[o].label}`} />)}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/60">
                {OUTCOMES.map((o) => n.counts[o] > 0 && <span key={o} style={{ color: STATUS[o].color }}>{n.counts[o]} {STATUS[o].label.toLowerCase()}</span>)}
                {n.questions_open > 0 && <span className="text-eyes">{n.questions_open} open question{n.questions_open === 1 ? '' : 's'}</span>}
                {n.decisions_open > 0 && <span className="text-eyes">{n.decisions_open} decision{n.decisions_open === 1 ? '' : 's'} to review</span>}
                {n.problems.length > 0 && <span className="text-broken">{n.problems.length} file problem{n.problems.length === 1 ? '' : 's'}</span>}
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Empty({ icon, text }: { icon: 'moon'; text: string }) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center text-white/50">
      <Icon name={icon} className="mb-3 size-10" strokeWidth={1.5} />
      <p className="max-w-lg">{text}</p>
    </div>
  );
}
