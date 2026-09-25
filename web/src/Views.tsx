import type { Overview, QuestionEntry, QueueCard, Shift } from '../../src/types.ts';
import { OUTCOME_STATUSES } from '../../src/types.ts';
import { fileUrl } from './api.ts';
import { BufferWords } from './Morning.tsx';
import { Icon, Pill, STATUS, Tachometer, shiftTitle, taskId } from './ui.tsx';

// ---------------------------------------------------------------- questions

function stateOf(e: QuestionEntry): { label: string; color: string } {
  const q = e.question;
  if (!q) return { label: 'invalid file', color: 'var(--color-blocked)' };
  if (q.resolved) return { label: 'done', color: 'var(--color-shipped)' };
  if (q.answer?.status === 'answered') return { label: 'answered', color: 'var(--accent)' };
  if (q.answer?.status === 'deferred') return { label: 'not now', color: 'var(--color-skipped)' };
  return { label: 'open', color: 'var(--color-eyes)' };
}

export function QuestionsView({ entries, onOpen }: { entries: QuestionEntry[]; onOpen: (id?: string) => void }) {
  const groups = new Map<string, QuestionEntry[]>();
  for (const e of entries) {
    const key = e.question?.topic ?? (e.question ? 'Other' : 'Invalid files');
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  if (!entries.length) return <Empty icon="question" text="No questions. Agents write them into .night-shift/questions/." />;
  return (
    <div className="space-y-8">
      {[...groups.entries()].map(([topic, list]) => (
        <section key={topic}>
          <h2 className="mb-3 text-sm tracking-widest text-white/50 uppercase">{topic}</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((e, i) => {
              const st = stateOf(e);
              const q = e.question;
              const thumb = q?.options?.find((o) => o.image)?.image ?? q?.images?.[0];
              return (
                <button key={e.file} disabled={!q} onClick={() => q && onOpen(q.id)} className="glass glow-soft pop-in flex gap-3 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 disabled:cursor-default" style={{ ['--glow' as string]: st.color, animationDelay: `${i * 40}ms` }}>
                  {thumb && <img src={fileUrl(thumb)} alt="" className="size-16 shrink-0 rounded-xl bg-white object-cover" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold" style={{ color: st.color }}>● {st.label}</span>
                      {q?.blocking && <span className="text-blocked">blocks a card</span>}
                      <span className="ml-auto font-mono text-white/35">{q?.kind}</span>
                    </div>
                    <div className="mt-1 leading-snug font-medium">{q?.question ?? e.file}</div>
                    {q?.answer?.status === 'answered' && <div className="mt-1 truncate text-sm text-white/55">→ {q.answer.value.join(q.kind === 'rank' ? ' → ' : ', ')}</div>}
                    {!q && <ul className="mt-1 list-inside list-disc text-xs text-blocked">{e.problems.map((p) => <li key={p}>{p}</li>)}</ul>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- queue

const COLLISION_COLORS = ['#f472b6', '#60a5fa', '#facc15', '#a78bfa', '#2dd4bf', '#fb923c'];

// Cards that collide, directly or through a chain, share one colour.
function collisionGroups(queue: QueueCard[]): Map<string, string> {
  const group = new Map<string, number>();
  let next = 0;
  const visit = (id: string, g: number) => {
    if (group.has(id)) return;
    group.set(id, g);
    for (const other of queue.find((c) => c.id === id)?.collidesWith ?? []) visit(other, g);
  };
  for (const c of queue) if (c.collidesWith.length && !group.has(c.id)) visit(c.id, next++);
  return new Map([...group.entries()].map(([id, g]) => [id, COLLISION_COLORS[g % COLLISION_COLORS.length]]));
}

const SIZE_WIDTH = { S: '33%', M: '66%', L: '100%' };

export function QueueView({ overview }: { overview: Overview }) {
  const { queue, buffer } = overview;
  const colours = collisionGroups(queue);
  const name = (id: string) => taskId(queue.find((c) => c.id === id)?.name ?? id).id;
  return (
    <div className="space-y-6">
      <div className="glass flex flex-wrap items-center gap-6 rounded-3xl p-6">
        <Tachometer value={queue.length} max={buffer.max} low={buffer.low} className="w-72" />
        <div className="flex-1">
          <BufferWords overview={overview} />
          <div className="mt-3 text-center text-xs text-white/45">
            sweet spot {Math.ceil(buffer.max * 0.7)}–{Math.floor(buffer.max * 0.8)} cards · redline from {Math.ceil(buffer.max * 0.9)} · idle below {buffer.low}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs text-white/60">
            <span className="inline-flex items-center gap-1"><Icon name="hammer" className="size-3.5" /> build: finished overnight</span>
            <span className="inline-flex items-center gap-1"><Icon name="compass" className="size-3.5" /> explore: options for the morning</span>
            <span className="inline-flex items-center gap-1"><Icon name="collide" className="size-3.5" /> same colour: never in parallel</span>
          </div>
        </div>
      </div>
      {!queue.length && <Empty icon="moon" text={`No card carries the ${overview.project.board.readyLabel} label yet.`} />}
      <ol className="space-y-2">
        {queue.map((c, i) => {
          const { id, rest } = taskId(c.name);
          const h = c.header;
          const colour = colours.get(c.id);
          return (
            <li key={c.id} className="glass pop-in flex items-center gap-4 rounded-2xl p-4" style={{ animationDelay: `${i * 35}ms`, borderLeft: colour ? `4px solid ${colour}` : undefined }}>
              <span className="w-6 text-center text-lg font-bold text-white/40 tabular-nums">{i + 1}</span>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ background: h?.kind === 'explore' ? '#a78bfa22' : '#60a5fa22', color: h?.kind === 'explore' ? '#a78bfa' : '#60a5fa' }}>
                <Icon name={h?.kind === 'explore' ? 'compass' : 'hammer'} className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <a href={c.url} target="_blank" rel="noreferrer" className="font-mono font-semibold hover:underline">{id}</a>
                {rest && <span className="ml-2 text-sm text-white/55">{rest}</span>}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {h?.touches.map((t) => <Pill key={t} className="font-mono">{t}</Pill>)}
                  {colour && (
                    <span className="inline-flex items-center gap-1 text-xs" style={{ color: colour }}>
                      <Icon name="collide" className="size-3.5" /> with {c.collidesWith.map(name).join(', ')}
                    </span>
                  )}
                  {(!h || h.problems.length > 0) && (
                    <span className="inline-flex items-center gap-1 text-xs text-eyes">
                      <Icon name="warn" className="size-3.5" /> {h ? h.problems.join('; ') : 'no night-shift header'}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-20 shrink-0">
                <div className="text-right text-xs text-white/50">{h?.size ?? '?'}</div>
                <div className="mt-1 h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-white/60" style={{ width: h?.size ? SIZE_WIDTH[h.size] : '0%' }} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------- history

export function HistoryView({ shifts, selected, onPick }: { shifts: Shift[]; selected?: string; onPick: (id: string) => void }) {
  if (!shifts.length) return <Empty icon="moon" text="No shift has posted an outcome yet." />;
  return (
    <ol className="relative space-y-3 border-l border-white/10 pl-6">
      {shifts.map((s, i) => {
        const total = s.outcomes.length;
        return (
          <li key={s.id} className="pop-in" style={{ animationDelay: `${i * 40}ms` }}>
            <span className="absolute -left-[7px] mt-5 size-3.5 rounded-full border-2 border-night-950" style={{ background: s.kind === 'night' ? 'var(--color-moon)' : '#fb923c' }} />
            <button onClick={() => onPick(s.id)} className={`glass w-full rounded-2xl p-4 text-left transition hover:bg-white/10 ${s.id === selected ? 'ring-2 ring-[var(--accent)]' : ''}`}>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg font-semibold">{shiftTitle(s.id)}</span>
                <span className="text-sm text-white/50">{total} card{total === 1 ? '' : 's'}</span>
              </div>
              <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-white/5">
                {OUTCOME_STATUSES.map((st) => s.counts[st] > 0 && <div key={st} style={{ width: `${(s.counts[st] / total) * 100}%`, background: STATUS[st].color }} title={`${s.counts[st]} ${STATUS[st].label}`} />)}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/60">
                {OUTCOME_STATUSES.map((st) => s.counts[st] > 0 && <span key={st} className={STATUS[st].text}>{s.counts[st]} {STATUS[st].label.toLowerCase()}</span>)}
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Empty({ icon, text }: { icon: 'question' | 'moon'; text: string }) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 py-16 text-center text-white/50">
      <Icon name={icon} className="mb-3 size-10" strokeWidth={1.5} />
      {text}
    </div>
  );
}
