import { useState } from 'react';
import type { Outcome, Overview, QuestionEntry, Shift } from '../../src/types.ts';
import { OUTCOME_STATUSES, isOpen } from '../../src/types.ts';
import { EvidenceView, MediaViewer } from './Evidence.tsx';
import { FuelGauge, Icon, Pill, Ring, STATUS, shiftTitle, taskId } from './ui.tsx';

interface Props {
  overview: Overview;
  shift: Shift | undefined;
  questions: QuestionEntry[];
  onOpenDeck: (startId?: string) => void;
  onShowQueue: () => void;
}

export function Morning({ overview, shift, questions, onOpenDeck, onShowQueue }: Props) {
  const [open, setOpen] = useState<Outcome | null>(null);
  const valid = questions.filter((q) => q.question);
  const openCount = valid.filter((q) => isOpen(q.question!)).length;
  const answered = valid.length - openCount;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="glass pop-in rounded-3xl p-6 md:col-span-2 2xl:col-span-1">
          <div className="text-sm tracking-widest text-white/50 uppercase">{shift ? (shift.kind === 'night' ? 'Last night' : 'Last shift') : 'No shifts yet'}</div>
          <h1 className="font-display mt-1 text-3xl font-semibold">{shift ? shiftTitle(shift.id) : 'Nothing has run yet'}</h1>
          <div className="mt-5 flex flex-wrap gap-3">
            {OUTCOME_STATUSES.map((s) => (
              <div key={s} className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3" style={{ opacity: shift?.counts[s] ? 1 : 0.4 }}>
                <span className="grid size-10 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${STATUS[s].color} 18%, transparent)`, color: STATUS[s].color }}>
                  <Icon name={STATUS[s].icon} className="size-5" strokeWidth={2.4} />
                </span>
                <span>
                  <span className="block text-2xl leading-none font-bold">{shift?.counts[s] ?? 0}</span>
                  <span className="text-xs text-white/60">{STATUS[s].label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Questions: the call to action on its own row, centred; the ring and its words together below it. */}
        <button onClick={() => onOpenDeck()} className="glass pop-in group flex flex-col items-center justify-center gap-6 rounded-3xl p-6 text-center transition hover:bg-white/10" style={{ animationDelay: '60ms' }}>
          <div className="flex w-full justify-center">
            <span className="cta inline-flex items-center gap-2 text-lg">
              <span className="cta-shine" />
              <Icon name="sparkle" className="size-5 text-moon drop-shadow-[0_0_6px_#f5d76e]" strokeWidth={2.2} />
              {openCount ? 'Start answering' : 'Review answers'}
              <Icon name="right" className="size-5" strokeWidth={2.6} />
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 text-left">
            <Ring done={answered} total={valid.length}>
              <div>
                <div className="text-2xl font-bold">{openCount}</div>
                <div className="text-[13px] text-white/60">open</div>
              </div>
            </Ring>
            <div>
              <div className="text-sm tracking-widest text-white/50 uppercase">Questions</div>
              <div className="font-display mt-1 text-xl font-semibold">{openCount ? `${openCount} waiting for you` : 'All clear'}</div>
              <div className="mt-1 text-sm text-white/55">{answered} of {valid.length} answered</div>
            </div>
          </div>
        </button>

        {/* Buffer: the gauge large in the upper half, its words underneath. */}
        <button onClick={onShowQueue} className="glass pop-in flex flex-col items-center justify-center gap-2 rounded-3xl p-6 text-center transition hover:bg-white/10" style={{ animationDelay: '120ms' }}>
          <FuelGauge value={overview.queue.length} target={overview.buffer.target} low={overview.buffer.low} className="w-full max-w-sm" />
          <div>
            <div className="text-sm tracking-widest text-white/50 uppercase">Buffer</div>
            <div className="font-display mt-1 text-xl font-semibold">{overview.queue.length} Night-ready</div>
            <div className={`mt-1 text-sm ${overview.queue.length < overview.buffer.low ? 'font-semibold text-blocked' : 'text-white/60'}`}>{overview.queue.length < overview.buffer.low ? 'Low: time for a Day Shift' : `target ${overview.buffer.target}`}</div>
          </div>
        </button>
      </section>

      {shift && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">What happened</h2>
            <span className="text-sm text-white/50">click a tile for details</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shift.outcomes.map((o, i) => (
              <OutcomeTile key={`${o.card.id}-${o.shift}`} outcome={o} delay={i * 50} onOpen={() => setOpen(o)} />
            ))}
          </div>
        </section>
      )}

      {open && <OutcomeDrawer outcome={open} questions={questions} onClose={() => setOpen(null)} onQuestion={(id) => { setOpen(null); onOpenDeck(id); }} />}
    </div>
  );
}

function thumbnail(o: Outcome): string | undefined {
  const ev = o.evidence.find((e) => (e.kind === 'image' || e.kind === 'compare') && e.src);
  return ev?.src;
}

function OutcomeTile({ outcome: o, delay, onOpen }: { outcome: Outcome; delay: number; onOpen: () => void }) {
  const s = STATUS[o.status];
  const { id, rest } = taskId(o.card.name);
  const thumb = thumbnail(o);
  return (
    <button onClick={onOpen} className="glass glow pop-in group flex flex-col overflow-hidden rounded-2xl text-left transition hover:-translate-y-1" style={{ ['--glow' as string]: s.color, animationDelay: `${delay}ms` }}>
      <div className="relative h-36 w-full overflow-hidden" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${s.color} 30%, #0b0d24), #0b0d24)` }}>
        {thumb ? (
          <img src={thumb} alt="" className="h-full w-full object-cover object-top opacity-90 transition group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center" style={{ color: s.color }}>
            <Icon name={s.icon} className="size-14 opacity-60" strokeWidth={1.5} />
          </div>
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold" style={{ color: s.color }}>
          <Icon name={s.icon} className="size-3.5" strokeWidth={2.6} /> {s.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <div className="font-mono text-sm font-semibold" style={{ color: s.color }}>{id}</div>
          {rest && <div className="text-xs text-white/50">{rest}</div>}
        </div>
        <p className="text-[18px] leading-snug text-white/90">{o.line}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {o.review && <Pill><Icon name="check" className="size-3" /> {o.review}</Pill>}
          {o.commits.length > 0 && <Pill><Icon name="commit" className="size-3" /> {o.commits.length}</Pill>}
          {o.evidence.length > 0 && <Pill><Icon name="image" className="size-3" /> {o.evidence.length}</Pill>}
          {o.questions.length > 0 && <Pill className="!bg-[var(--accent)]/25 !text-white"><Icon name="question" className="size-3" /> {o.questions.length}</Pill>}
          {o.problems.length > 0 && <Pill className="!bg-blocked/20 !text-blocked"><Icon name="warn" className="size-3" /> {o.problems.length}</Pill>}
        </div>
      </div>
    </button>
  );
}

function OutcomeDrawer({ outcome: o, questions, onClose, onQuestion }: { outcome: Outcome; questions: QuestionEntry[]; onClose: () => void; onQuestion: (id: string) => void }) {
  const [zoom, setZoom] = useState<string | null>(null);
  const s = STATUS[o.status];
  const { id, rest } = taskId(o.card.name);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <aside className="slide-in h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-night-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: s.color, background: `color-mix(in srgb, ${s.color} 15%, transparent)` }}>
              <Icon name={s.icon} className="size-3.5" strokeWidth={2.6} /> {s.label}
            </span>
            <h2 className="font-display mt-3 font-mono text-2xl font-semibold">{id}</h2>
            {rest && <div className="text-white/60">{rest}</div>}
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Close">
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <p className="mt-4 text-lg leading-snug">{o.line}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {o.card.url && (
            <a href={o.card.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1 text-sm hover:bg-white/15">
              <Icon name="link" className="size-3.5" /> card
            </a>
          )}
          {o.review && <Pill className="!text-sm !px-3 !py-1">review {o.review}</Pill>}
          {o.commits.map((c) =>
            c.url ? (
              <a key={c.sha} href={c.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1 font-mono text-sm hover:bg-white/15">
                <Icon name="commit" className="size-3.5" /> {c.sha.slice(0, 7)}
              </a>
            ) : (
              <Pill key={c.sha} className="!text-sm !px-3 !py-1 font-mono">{c.sha.slice(0, 7)}</Pill>
            ),
          )}
        </div>

        {o.problems.length > 0 && (
          <div className="mt-5 rounded-xl border border-blocked/40 bg-blocked/10 p-3 text-sm text-blocked">
            <div className="mb-1 font-semibold">The outcome comment has problems</div>
            <ul className="list-inside list-disc">{o.problems.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
        )}

        {o.questions.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm tracking-widest text-white/50 uppercase">Questions raised</h3>
            <div className="space-y-2">
              {o.questions.map((qid) => {
                const q = questions.find((e) => e.question?.id === qid)?.question;
                return (
                  <button key={qid} onClick={() => onQuestion(qid)} className="glass flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-white/10">
                    <Icon name="question" className="size-5 text-[var(--accent)]" />
                    <span className="flex-1">{q?.question ?? qid}</span>
                    <span className="text-xs text-white/50">{q ? (q.resolved ? 'done' : q.answer?.status === 'answered' ? 'answered' : q.answer ? 'not now' : 'open') : 'not found'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {o.evidence.length > 0 && (
          <div className="mt-6 space-y-5">
            <h3 className="text-sm tracking-widest text-white/50 uppercase">Evidence</h3>
            {o.evidence.map((ev, i) => <EvidenceView key={i} ev={ev} onZoom={setZoom} />)}
          </div>
        )}
      </aside>
      {zoom && <MediaViewer media={{ src: zoom, kind: 'image' }} onClose={() => setZoom(null)} />}
    </div>
  );
}
