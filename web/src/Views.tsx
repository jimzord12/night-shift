import type { Overview } from '../../src/types.ts';
import { OUTCOMES } from '../../src/types.ts';
import type { DeckItem } from './QuestionDeck.tsx';
import { Icon, NIGHT_STATUS, STATUS, dollars, minutes, nightTitle } from './ui.tsx';

// ---------------------------------------------------------------- questions

export function QuestionsView({ items, loading, onOpen }: { items: DeckItem[]; loading: boolean; onOpen: (key: string) => void }) {
  if (loading && !items.length) return <div className="py-24 text-center text-white/40">Loading the questions…</div>;
  if (!items.length) return <Empty icon="question" text="No questions. When an agent needs a decision, it asks here instead of guessing." />;
  const groups = new Map<string, DeckItem[]>();
  for (const i of items) {
    const k = `${i.detail.repo.name} · ${nightTitle(i.detail.night.night)}`;
    groups.set(k, [...(groups.get(k) ?? []), i]);
  }
  return (
    <div className="space-y-8">
      {[...groups.entries()].map(([title, list]) => (
        <section key={title}>
          <h2 className="mb-3 text-sm tracking-widest text-white/50 uppercase">{title}</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((i, n) => {
              const q = i.question;
              const color = q.answer === null ? 'var(--color-eyes)' : 'var(--accent)';
              return (
                <button key={i.key} onClick={() => onOpen(i.key)} className="glass glow-soft pop-in flex flex-col gap-1 rounded-2xl p-4 text-left transition hover:-translate-y-0.5" style={{ ['--glow' as string]: color, animationDelay: `${n * 40}ms` }}>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold" style={{ color }}>● {q.answer === null ? 'open' : 'answered'}</span>
                    {q.task && <span className="font-mono text-white/45">{q.task}</span>}
                  </div>
                  <div className="leading-snug font-medium">{q.ask}</div>
                  {q.answer !== null && <div className="truncate text-sm text-white/55">→ {q.options.find((o) => o.id === q.answer)?.label ?? q.answer}</div>}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- history

export function HistoryView({ overview, selected, onPick }: { overview: Overview; selected?: string; onPick: (repo: string, night: string) => void }) {
  if (!overview.nights.length) return <Empty icon="moon" text="No night has run yet." />;
  const name = (id: string) => overview.repos.find((r) => r.id === id)?.name ?? id;
  return (
    <ol className="relative space-y-3 border-l border-white/10 pl-6">
      {overview.nights.map((n, i) => {
        const st = NIGHT_STATUS[n.running ? 'running' : n.status];
        const total = n.tasks || 1;
        return (
          <li key={`${n.repo}/${n.id}`} className="pop-in" style={{ animationDelay: `${i * 30}ms` }}>
            <span className="absolute -left-[7px] mt-5 size-3.5 rounded-full border-2 border-night-950" style={{ background: st.color }} />
            <button onClick={() => onPick(n.repo, n.id)} className={`glass w-full rounded-2xl p-4 text-left transition hover:bg-white/10 ${`${n.repo}/${n.id}` === selected ? 'ring-2 ring-[var(--accent)]' : ''}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span>
                  <span className="font-display text-lg font-semibold">{nightTitle(n.id)}</span>
                  <span className="ml-2 text-sm text-white/55">{name(n.repo)}</span>
                </span>
                <span className="flex flex-wrap items-center gap-4 text-sm text-white/55">
                  <span className="inline-flex items-center gap-1"><Icon name="clock" /> {minutes(n.duration_min)}</span>
                  <span className="inline-flex items-center gap-1"><Icon name="coin" /> {dollars(n.cost_usd)}</span>
                  <span className="font-semibold" style={{ color: st.color }}>{st.label}</span>
                </span>
              </div>
              {n.summary && <p className="mt-1 text-sm text-white/70">{n.summary}</p>}
              <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-white/5">
                {OUTCOMES.map((o) => n.counts[o] > 0 && <div key={o} style={{ width: `${(n.counts[o] / total) * 100}%`, background: STATUS[o].color }} title={`${n.counts[o]} ${STATUS[o].label}`} />)}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/60">
                {OUTCOMES.map((o) => n.counts[o] > 0 && <span key={o} style={{ color: STATUS[o].color }}>{n.counts[o]} {STATUS[o].label.toLowerCase()}</span>)}
                {n.questions_open > 0 && <span className="text-eyes">{n.questions_open} open question{n.questions_open === 1 ? '' : 's'}</span>}
                {n.problems.length > 0 && <span className="text-blocked">{n.problems.length} file problem{n.problems.length === 1 ? '' : 's'}</span>}
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------- trends

export function TrendsView() {
  return <Empty icon="chart" text="Trends arrive once there are enough nights to compare. Which measures matter (promised versus delivered, cost per finished task, …) is still being decided." />;
}

function Empty({ icon, text }: { icon: 'question' | 'moon' | 'chart'; text: string }) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center text-white/50">
      <Icon name={icon} className="mb-3 size-10" strokeWidth={1.5} />
      <p className="max-w-lg">{text}</p>
    </div>
  );
}
