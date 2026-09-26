import { useEffect, useState } from 'react';
import type { NightDetail, NightSummary, Overview, Task } from '../../src/types.ts';
import { OUTCOMES, countOutcomes, inMorning, isOpenQuestionIn, needsHandOver, ownerSide, unfinishedTasks } from '../../src/types.ts';
import { createFollowUp, fileUrl, ghStatus, sendFeedback } from './api.ts';
import { BlockView, MediaViewer } from './Evidence.tsx';
import type { Media } from './Evidence.tsx';
import { Icon, NIGHT_STATUS, OwnerPill, Pill, Ring, STATUS, dollars, minutes, nightTitle, taskStyle } from './ui.tsx';

interface Props {
  overview: Overview;
  // The nights that needed the developer when the Viewer loaded, with their live state.
  inbox: NightSummary[];
  detail: NightDetail | null;
  onPick: (repo: string, night: string) => void;
  onHistory: () => void;
  onOpenDeck: (startKey?: string) => void;
  onDetail: (d: NightDetail) => void;
}

const repoName = (o: Overview, id: string) => o.repos.find((r) => r.id === id)?.name ?? id;

// The morning is an inbox: the nights still unread or needing the developer (open questions, or
// work not yet handed over) as chips, newest first, and the chosen night in full. Nothing left
// means "All caught up"; every night stays one click away in History.
export function Morning({ overview, inbox, detail, onPick, onHistory, onOpenDeck, onDetail }: Props) {
  if (!overview.nights.length) return <Empty />;
  const left = inbox.filter(inMorning).length;
  const last = overview.nights[0];
  return (
    <div className="space-y-6">
      {inbox.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm tracking-widest text-white/50 uppercase">{left ? 'Waiting for you' : 'All caught up'}</span>
          {inbox.map((n) => (
            <NightChip key={`${n.repo}/${n.id}`} n={n} name={repoName(overview, n.repo)} active={detail?.repo.id === n.repo && detail.night.night === n.id} onClick={() => onPick(n.repo, n.id)} />
          ))}
        </div>
      )}
      {!inbox.length && <CaughtUp onLast={() => onPick(last.repo, last.id)} onHistory={onHistory} showLast={!detail} />}
      {detail ? <NightView detail={detail} onOpenDeck={onOpenDeck} onDetail={onDetail} /> : inbox.length > 0 && <div className="py-24 text-center text-white/40">Loading the night…</div>}
    </div>
  );
}

// What the developer still owes a night, newest reason first; a chip with nothing left is dimmed.
function NightChip({ n, name, active, onClick }: { n: NightSummary; name: string; active: boolean; onClick: () => void }) {
  const st = NIGHT_STATUS[n.running ? 'running' : n.status];
  const settled = !inMorning(n);
  return (
    <button onClick={onClick} className={`glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm transition hover:bg-white/10 ${active ? 'ring-2 ring-[var(--accent)]' : ''} ${settled && !active ? 'opacity-60' : ''}`}>
      <span className="size-2 rounded-full" style={{ background: st.color, boxShadow: `0 0 8px ${st.color}` }} />
      <span className="font-semibold whitespace-nowrap">{name}</span>
      <span className="text-white/60">{nightTitle(n.id)}</span>
      {!n.read && <span className="rounded-full bg-[var(--accent)] px-1.5 text-[11px] font-bold tracking-wide text-white uppercase">new</span>}
      {n.questions_open > 0 && <span className="rounded-full bg-eyes px-1.5 text-[13px] font-bold text-night-950" title={`${n.questions_open} open question${n.questions_open === 1 ? '' : 's'}`}>{n.questions_open}</span>}
      {n.hand_over && <span className="text-xs text-eyes" title="Unfinished work or answers not handed over yet">hand over</span>}
      {settled && <Icon name="check" className="size-4 text-shipped" strokeWidth={2.6} />}
    </button>
  );
}

function CaughtUp({ onLast, onHistory, showLast }: { onLast: () => void; onHistory: () => void; showLast: boolean }) {
  return (
    <div className="glass pop-in flex flex-col items-center gap-3 rounded-3xl px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-shipped/15 text-shipped">
        <Icon name="check" className="size-6" strokeWidth={2.6} />
      </span>
      <div className="font-display text-2xl font-semibold">All caught up</div>
      <p className="max-w-md text-white/60">Every night is read, every question answered, and the unfinished work handed to the next agent.</p>
      <div className="mt-1 flex flex-wrap justify-center gap-2">
        {showLast && <button onClick={onLast} className="rounded-full bg-[var(--accent)] px-5 py-2 font-semibold text-white transition hover:brightness-110">Open the last night</button>}
        <button onClick={onHistory} className="glass rounded-full px-5 py-2 text-white/80 transition hover:bg-white/10">History</button>
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 py-20 text-center text-white/55">
      <Icon name="moon" className="mb-3 size-10" strokeWidth={1.5} />
      <div className="font-display text-xl font-semibold text-white/80">No nights yet</div>
      <p className="mt-2 max-w-md">Run <code className="rounded bg-white/10 px-1.5">night-shift install</code> in a repository, then tell an agent there: “start night shift”. Its nights appear here.</p>
    </div>
  );
}

export function NightView({ detail, onOpenDeck, onDetail }: { detail: NightDetail; onOpenDeck: (startKey?: string) => void; onDetail: (d: NightDetail) => void }) {
  const [open, setOpen] = useState<Task | null>(null);
  const n = detail.night;
  const counts = countOutcomes(n.tasks);
  const openQ = n.questions.filter((q) => isOpenQuestionIn(q, detail.follow_up)).length;
  const answered = n.questions.length - openQ;
  const st = NIGHT_STATUS[detail.running ? 'running' : n.status];
  const side = ownerSide({ questions_open: openQ, hand_over: needsHandOver(n, detail.follow_up), follow_up: !!detail.follow_up });
  const m = n.metrics;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="glass pop-in rounded-3xl p-6 md:col-span-2 2xl:col-span-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="tracking-widest text-white/50 uppercase">{detail.repo.name}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ color: st.color, background: `color-mix(in srgb, ${st.color} 15%, transparent)` }}>
              <span className="size-1.5 rounded-full" style={{ background: st.color, animation: detail.running ? 'redline 1.2s ease-in-out infinite' : undefined }} />
              {st.label}
            </span>
            {!detail.running && <OwnerPill side={side} />}
          </div>
          <h1 className="font-display mt-1 text-2xl font-semibold sm:text-3xl">{nightTitle(n.night)}</h1>
          {n.summary ? <p className="mt-3 leading-snug text-white/85 sm:text-lg">{n.summary}</p> : <p className="mt-3 text-white/50">{n.status === 'open' ? 'The night has no summary yet.' : 'The night stopped before the agent wrote a summary.'}</p>}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
            {OUTCOMES.map((o) => (
              <div key={o} className="flex min-w-0 items-center gap-2 rounded-2xl bg-white/5 px-2 py-2 sm:gap-2.5 sm:px-3" style={{ opacity: counts[o] ? 1 : 0.35 }}>
                <span className="grid size-7 shrink-0 place-items-center rounded-full sm:size-8" style={{ background: `color-mix(in srgb, ${STATUS[o].color} 18%, transparent)`, color: STATUS[o].color }}>
                  <Icon name={STATUS[o].icon} className="size-4" strokeWidth={2.4} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xl leading-none font-bold">{counts[o]}</span>
                  <span className="block truncate text-xs text-white/60">{STATUS[o].label}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/60">
            <span className="inline-flex items-center gap-1.5" title="Measured from Claude Code's session log"><Icon name="clock" /> {m ? minutes(m.duration_min.total) : n.status === 'open' ? 'running' : 'not measured yet'}</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="coin" /> {m ? dollars(m.cost_usd) : '—'}</span>
            {m && <span className="inline-flex items-center gap-1.5"><Icon name="bot" /> {m.sub_agents.length} sub-agent{m.sub_agents.length === 1 ? '' : 's'}</span>}
          </div>
        </div>

        <button onClick={() => onOpenDeck()} disabled={!n.questions.length} className="glass pop-in group flex min-w-0 flex-col items-center justify-center gap-6 rounded-3xl p-6 text-center transition hover:bg-white/10 disabled:cursor-default disabled:hover:bg-transparent" style={{ animationDelay: '60ms' }}>
          {n.questions.length > 0 && (
            <span className="cta inline-flex items-center gap-2 text-base sm:text-lg sm:whitespace-nowrap">
              <span className="cta-shine" />
              <Icon name="sparkle" className="size-5 text-moon drop-shadow-[0_0_6px_#f5d76e]" strokeWidth={2.2} />
              {openQ ? 'Start answering' : 'Review answers'}
              <Icon name="right" className="size-5" strokeWidth={2.6} />
            </span>
          )}
          <div className="flex flex-wrap items-center justify-center gap-5 text-left">
            <Ring done={answered} total={n.questions.length}>
              <div>
                <div className="text-2xl font-bold">{openQ}</div>
                <div className="text-[13px] text-white/60">open</div>
              </div>
            </Ring>
            <div>
              <div className="text-sm tracking-widest text-white/50 uppercase">Questions</div>
              <div className="font-display mt-1 text-xl font-semibold">{!n.questions.length ? 'None asked' : openQ ? `${openQ} waiting for you` : 'All answered'}</div>
              <div className="mt-1 text-sm text-white/55">{answered} of {n.questions.length} answered</div>
            </div>
          </div>
        </button>

        <FollowUpCard detail={detail} onDetail={onDetail} />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold">What happened</h2>
          <span className="hidden text-sm text-white/50 sm:inline">click a task for its checks and proof</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {n.tasks.map((t, i) => (
            <TaskTile key={t.id} task={t} detail={detail} delay={i * 50} onOpen={() => setOpen(t)} />
          ))}
        </div>
      </section>

      {n.feedback.length > 0 && <FeedbackSection detail={detail} onDetail={onDetail} />}

      {detail.problems.length > 0 && (
        <div className="rounded-2xl border border-blocked/40 bg-blocked/10 p-4 text-sm text-blocked">
          <div className="mb-1 font-semibold">This night file has problems</div>
          <ul className="list-inside list-disc">{detail.problems.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}

      {open && <TaskDrawer task={open} detail={detail} onClose={() => setOpen(null)} onQuestion={(key) => { setOpen(null); onOpenDeck(key); }} />}
    </div>
  );
}

function FollowUpCard({ detail, onDetail }: { detail: NightDetail; onDetail: (d: NightDetail) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const f = detail.follow_up;
  const n = detail.night;
  const pending = unfinishedTasks(n);
  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      onDetail(await createFollowUp(detail.repo.id, n.night));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="glass pop-in flex flex-col justify-center gap-3 rounded-3xl p-6" style={{ animationDelay: '120ms' }}>
      <div className="text-sm tracking-widest text-white/50 uppercase">Follow-up</div>
      {f ? (
        <>
          <div className="font-display text-xl font-semibold">Handed to the next agent</div>
          <ul className="space-y-1.5 text-sm">
            {f.items.map((i) => (
              <li key={i.id} className="flex items-start gap-2">
                <span className="mt-0.5 rounded bg-white/10 px-1.5 font-mono text-xs">{i.id}</span>
                <span className="flex-1 text-white/80">
                  {i.title}
                  {i.decision_label && <span className="text-[var(--accent)]"> → {i.decision_label}</span>}
                </span>
                <span className="text-xs text-white/50">{i.status === 'open' ? i.kind : i.status}</span>
              </li>
            ))}
          </ul>
        </>
      ) : n.status === 'open' ? (
        <p className="text-white/60">Once the night closes, turn your answers and its unfinished work into instructions for the next agent.</p>
      ) : pending || n.questions.length ? (
        <>
          <p className="text-white/70">{pending} unfinished task{pending === 1 ? '' : 's'} and {n.questions.length} question{n.questions.length === 1 ? '' : 's'}. Answer what you can, then hand it over; the next night, or an agent by day, picks it up.</p>
          <button onClick={() => void create()} disabled={busy} className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[var(--accent)] px-5 py-2 font-semibold text-white shadow-[0_8px_30px_-8px_var(--accent)] transition hover:brightness-110 disabled:opacity-60">
            <Icon name="forward" className="size-4" strokeWidth={2.6} /> {busy ? 'Creating…' : 'Create follow-up'}
          </button>
        </>
      ) : (
        <p className="text-white/60">Nothing to follow up: every task is done or skipped.</p>
      )}
      {error && <div className="rounded-xl bg-blocked/15 px-3 py-2 text-sm text-blocked">{error}</div>}
    </div>
  );
}

function thumbnail(t: Task, url: (rel: string) => string): string | undefined {
  for (const b of t.evidence) {
    if (b.type === 'image') return url(b.path);
    if (b.type === 'compare') return url(b.after);
  }
  return undefined;
}

function TaskTile({ task: t, detail, delay, onOpen }: { task: Task; detail: NightDetail; delay: number; onOpen: () => void }) {
  const s = taskStyle(t.outcome);
  const url = (rel: string) => fileUrl(detail.repo.id, detail.night.night, rel);
  const thumb = thumbnail(t, url);
  const met = t.checks.filter((c) => c.met).length;
  const line = t.outcome === null ? 'In progress' : t.why ?? t.reason ?? (t.checks.length ? `${met} of ${t.checks.length} checks met` : '');
  return (
    <button onClick={onOpen} className="glass glow pop-in group flex flex-col overflow-hidden rounded-2xl text-left transition hover:-translate-y-1" style={{ ['--glow' as string]: s.color, animationDelay: `${delay}ms` }}>
      <div className="relative h-32 w-full overflow-hidden" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${s.color} 30%, #0b0d24), #0b0d24)` }}>
        {thumb ? (
          <img src={thumb} alt="" className="h-full w-full bg-white object-cover object-top opacity-90 transition group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center" style={{ color: s.color }}>
            <Icon name={s.icon} className="size-12 opacity-60" strokeWidth={1.5} />
          </div>
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold" style={{ color: s.color }}>
          <Icon name={s.icon} className="size-3.5" strokeWidth={2.6} /> {s.label}
        </span>
        {t.unplanned && <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white/80">unplanned</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="font-mono text-sm font-semibold" style={{ color: s.color }}>{t.id}</div>
        <p className="text-[18px] leading-snug text-white/90">{t.title}</p>
        {line && <p className="text-sm text-white/55">{line}</p>}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {t.evidence.length > 0 && (
            <Pill title={`${t.evidence.length} piece${t.evidence.length === 1 ? '' : 's'} of evidence`}>
              <Icon name={t.evidence.some((b) => b.type === 'image' || b.type === 'compare' || b.type === 'video') ? 'image' : 'file'} className="size-3" /> {t.evidence.length}
            </Pill>
          )}
          {t.blocked_by && <Pill className="!bg-[var(--accent)]/25 !text-white"><Icon name="question" className="size-3" /> {t.blocked_by}</Pill>}
          {t.follow_up && <Pill>from {t.follow_up}</Pill>}
        </div>
      </div>
    </button>
  );
}

function TaskDrawer({ task: t, detail, onClose, onQuestion }: { task: Task; detail: NightDetail; onClose: () => void; onQuestion: (key: string) => void }) {
  const [zoom, setZoom] = useState<Media | null>(null);
  const s = taskStyle(t.outcome);
  const url = (rel: string) => fileUrl(detail.repo.id, detail.night.night, rel);
  const questions = detail.night.questions.filter((q) => q.task === t.id || q.id === t.blocked_by);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !zoom && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, zoom]);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <aside className="slide-in h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-night-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="sticky -top-6 z-10 -mx-6 -mt-6 flex items-center justify-between gap-4 bg-night-900 px-6 pt-6 pb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: s.color, background: `color-mix(in srgb, ${s.color} 15%, transparent)` }}>
            <Icon name={s.icon} className="size-3.5" strokeWidth={2.6} /> {s.label}
          </span>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Close">
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <h2 className="font-display mt-1 text-2xl font-semibold"><span className="font-mono">{t.id}</span> · {t.title}</h2>
        {t.source && <div className="mt-1 text-sm text-white/50">from {t.source}</div>}

        {(t.why || t.reason) && <p className="mt-4 rounded-xl bg-white/5 px-4 py-3 text-white/85">{t.why ?? t.reason}</p>}

        {t.checks.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm tracking-widest text-white/50 uppercase">Done when</h3>
            <ul className="space-y-2">
              {t.checks.map((c, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full" style={{ background: c.met ? 'color-mix(in srgb, var(--color-shipped) 20%, transparent)' : 'color-mix(in srgb, var(--color-blocked) 20%, transparent)', color: c.met ? 'var(--color-shipped)' : 'var(--color-blocked)' }}>
                    <Icon name={c.met ? 'check' : 'close'} className="size-3.5" strokeWidth={3} />
                  </span>
                  <span>
                    <span className="block">{c.done_when}</span>
                    {c.note && <span className="block text-sm text-white/60">{c.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {questions.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm tracking-widest text-white/50 uppercase">Questions</h3>
            <div className="space-y-2">
              {questions.map((q) => (
                <button key={q.id} onClick={() => onQuestion(`${detail.repo.id}/${detail.night.night}/${q.id}`)} className="glass flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-white/10">
                  <Icon name="question" className="size-5 shrink-0 text-[var(--accent)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block">{q.ask}</span>
                    <span className="block text-xs text-white/50">{q.answer !== null ? `→ ${q.options.find((o) => o.id === q.answer)?.label ?? q.answer}` : isOpenQuestionIn(q, detail.follow_up) ? 'open' : 'locked'}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {t.evidence.length > 0 && (
          <div className="mt-6 space-y-5">
            <h3 className="text-sm tracking-widest text-white/50 uppercase">Evidence</h3>
            {t.evidence.map((b, i) => <BlockView key={i} block={b} url={url} onZoom={setZoom} />)}
          </div>
        )}
      </aside>
      {zoom && <MediaViewer media={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}

function FeedbackSection({ detail, onDetail }: { detail: NightDetail; onDetail: (d: NightDetail) => void }) {
  const unsent = detail.night.feedback.filter((f) => !f.sent);
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [gh, setGh] = useState<boolean | null>(null);
  const [issuesRepo, setIssuesRepo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    void ghStatus().then((s) => {
      setGh(s.ready);
      setIssuesRepo(s.repo);
    }).catch(() => setGh(false));
  }, []);
  const toggle = (id: string) => setTicked((s) => {
    const next = new Set(s);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const send = async (via: 'gh' | 'link', ids = [...ticked]) => {
    setBusy(true);
    setMessage(null);
    try {
      const r = await sendFeedback(detail.repo.id, detail.night.night, ids, via);
      for (const l of r.links) window.open(l.url, '_blank', 'noopener');
      onDetail(r.detail);
      setTicked(new Set());
      setMessage(r.errors.length ? r.errors.join('; ') : via === 'gh' ? `Sent ${ids.length} as GitHub issue${ids.length === 1 ? '' : 's'}.` : 'Opened on GitHub: submit it there.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Feedback for Night Shift</h2>
        <span className="text-sm text-white/50">friction the agent hit; tick what the maintainers should see</span>
      </div>
      <div className="space-y-2">
        {detail.night.feedback.map((f) => (
          <div key={f.id} className="glass flex items-start gap-3 rounded-2xl px-4 py-3">
            {f.sent ? (
              <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-shipped/15 px-2 py-0.5 text-xs font-semibold text-shipped"><Icon name="check" className="size-3" strokeWidth={3} /> Sent</span>
            ) : (
              <input type="checkbox" checked={ticked.has(f.id)} onChange={() => toggle(f.id)} className="mt-1.5 size-4 accent-[var(--accent)]" aria-label={`Send ${f.title}`} />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{f.title}</span>
                <Pill>{f.kind}</Pill>
                {f.tags.map((t) => <Pill key={t}>{t}</Pill>)}
              </div>
              <p className="mt-1 text-sm whitespace-pre-wrap text-white/65">{f.body}</p>
              {f.sent && <div className="mt-1 text-xs text-white/45">sent {f.sent.via === 'gh' ? 'with gh' : 'as a link'}{f.sent.url ? <> · <a className="underline" href={f.sent.url} target="_blank" rel="noreferrer">issue</a></> : null}</div>}
            </div>
            {!f.sent && gh === false && (
              <button onClick={() => void send('link', [f.id])} disabled={busy} className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm hover:bg-white/20">Open on GitHub</button>
            )}
          </div>
        ))}
      </div>
      {unsent.length > 0 && gh && (
        <button onClick={() => void send('gh')} disabled={busy || !ticked.size} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2 font-semibold text-white disabled:opacity-50">
          <Icon name="send" className="size-4" /> {busy ? 'Sending…' : `Send ${ticked.size || ''} to GitHub`}
        </button>
      )}
      {unsent.length > 0 && <p className="mt-2 text-xs text-white/50">Sending creates a public issue{issuesRepo ? ` on github.com/${issuesRepo}` : ' on GitHub'}. Read each entry first and untick anything private.</p>}
      {message && <div className="mt-2 text-sm text-white/70">{message}</div>}
    </section>
  );
}
