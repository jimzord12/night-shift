import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AgentDecision, FollowUp, FollowUpItem, NightDetail, NightSummary, Task } from '../../src/types.ts';
import { takenBack, agentDecisions, decisionsOpen, disagreed, OUTCOMES, answerLabel, countOutcomes, forTalk, handedItem, refsOf, isOpenQuestionIn, needsHandOver, neverStarted, ownerState, unfinishedTasks, waitedDays } from '../../src/types.ts';
import { Phrase } from './Gate.tsx';
import { ApiError, createFollowUp, fileUrl, ghStatus, sendFeedback } from './api.ts';
import { BlockView, MediaViewer } from './Evidence.tsx';
import { Saved } from './Gate.tsx';
import type { Media } from './Evidence.tsx';
import { Section } from './Inbox.tsx';
import { KIND } from './Views.tsx';
import { Icon, Pill, Ring, STATUS, StateBadge, StoppedEarly, dollars, minutes, nightTitle, taskStyle } from './ui.tsx';
import { HelpDot } from './Explainer.tsx';
import { NextLine, StepTrack, nextStep } from './StepTrack.tsx';

// The Night Report page (D24): back to the Inbox, a header strip, what needs the developer, then
// what happened as one row per task. Sections that have nothing to say are left out.
export function ReportPage({ detail, summary, picking, failed, onBack, onOpenDeck, onDetail, onReload }: {
  detail: NightDetail | null;
  summary: NightSummary | null;
  // The detail is on the way, or could not be loaded (the banner above says why).
  picking: boolean;
  failed: boolean;
  onBack: () => void;
  onOpenDeck: (startKey?: string, only?: 'decisions') => void;
  onDetail: (d: NightDetail) => void;
  onReload: () => void;
}) {
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-full px-1 text-sm text-white/65 transition hover:text-white">
        <Icon name="left" className="size-4" strokeWidth={2.4} /> Inbox
      </button>
      {detail && summary ? (
        <NightView detail={detail} summary={summary} onOpenDeck={onOpenDeck} onDetail={onDetail} onReload={onReload} />
      ) : failed ? (
        <div className="py-24 text-center text-white/50">This night could not be opened; the message above says why.</div>
      ) : picking ? (
        <div className="py-24 text-center text-white/40">Loading the night…</div>
      ) : (
        <div className="py-24 text-center text-white/50">This night is not in the list any more; reload the nights.</div>
      )}
    </div>
  );
}

// The discuss item a held item waits on, named by its id: " (A1)".
function talkId(f: FollowUp, item: FollowUpItem): string {
  const talk = f.items.find((o) => o.status === 'open' && o.kind === 'discuss' && o.task === item.task);
  return talk ? ` (${talk.id})` : '';
}

function NightView({ detail, summary, onOpenDeck, onDetail, onReload }: { detail: NightDetail; summary: NightSummary; onOpenDeck: (startKey?: string, only?: 'decisions') => void; onDetail: (d: NightDetail) => void; onReload: () => void }) {
  const [open, setOpen] = useState<Task | null>(null);
  const n = detail.night;
  const counts = countOutcomes(n.tasks);
  // Open on the page: no longer new.
  const state = ownerState({ ...summary, read: true });
  const m = n.metrics;
  const nonZero = OUTCOMES.filter((o) => counts[o] > 0);

  return (
    <div className="space-y-7">
      <header className="glass pop-in rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="tracking-widest text-white/50 uppercase">{detail.repo.name}</span>
          <StateBadge state={state} waited={waitedDays(summary.follow_up_at, Date.now())} />
        </div>
        <h1 className="font-display mt-1 text-2xl font-semibold sm:text-3xl">{nightTitle(n.night)}</h1>
        {n.summary ? <p className="mt-2 leading-snug text-white/85 sm:text-lg">{n.summary}</p> : <p className="mt-2 text-white/50">{n.status === 'open' ? 'The night has no summary yet.' : 'The night stopped before the agent wrote a summary.'}</p>}
        {neverStarted(summary) > 0 && <div className="mt-2 flex min-w-0"><StoppedEarly count={neverStarted(summary)} after={<HelpDot step="report" term="stopped early" />} /></div>}
        <div className="mt-5">
          <StepTrack state={state} />
          <div className="mt-3">
            <NextLine {...nextStep(state, summary, !!detail.follow_up && detail.follow_up.items.some((i) => i.status === 'open') && detail.follow_up.items.every((i) => i.status !== 'open' || !!detail.taken[`${n.night}/${i.id}`]))} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-white/10 pt-3 text-sm">
          {nonZero.map((o, i) => (
            <span key={o} className="inline-flex items-center gap-1.5 font-semibold" style={{ color: STATUS[o].color }}>
              <Icon name={STATUS[o].icon} className="size-4" strokeWidth={2.4} /> {counts[o]} {STATUS[o].label.toLowerCase()}
              {i === nonZero.length - 1 && <HelpDot step="report" term="the six outcomes" />}
            </span>
          ))}
          {/* Only what was measured: an unknown duration or cost, or no sub-agent, says nothing (D24). */}
          {m?.duration_min.total != null && <span className="inline-flex items-center gap-1.5 text-white/60" title="Measured from Claude Code's session log"><Icon name="clock" /> {minutes(m.duration_min.total)}</span>}
          {m?.cost_usd != null && <span className="inline-flex items-center gap-1.5 text-white/60"><Icon name="coin" /> {dollars(m.cost_usd)}</span>}
          {m && m.sub_agents.length > 0 && <span className="inline-flex items-center gap-1.5 text-white/60"><Icon name="bot" /> {m.sub_agents.length} sub-agent{m.sub_agents.length === 1 ? '' : 's'}</span>}
          {!m && n.status !== 'open' && <span className="text-white/45">not measured yet</span>}
        </div>
      </header>

      <Section title="What needs you">
        <NeedsYou detail={detail} onOpenDeck={onOpenDeck} onDetail={onDetail} onReload={onReload} />
      </Section>

      {agentDecisions(n).length > 0 && (
        <Section title="Decisions the agent took for you" aside={decisionsOpen(n) ? `${decisionsOpen(n)} to review` : 'all reviewed'}>
          <ul className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {agentDecisions(n).map((d) => <DecisionRow key={d.id} decision={d} onOpen={() => onOpenDeck(decisionKey(detail, d), 'decisions')} />)}
          </ul>
        </Section>
      )}

      {detail.follow_up && (
        <Section title="Saved for the next agent" aside={`${detail.follow_up.items.filter((i) => i.status === 'open').length} open`}>
          <ul className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {detail.follow_up.items.map((i) => (
              <li key={i.id} className="flex flex-wrap items-start gap-x-3 gap-y-1 px-4 py-2.5">
                <span className="mt-0.5 shrink-0 self-start rounded bg-white/10 px-1.5 font-mono text-xs leading-6">{i.id}</span>
                <span className="min-w-[10rem] flex-1 text-white/85">
                  {i.title}
                  {i.decision_label && <span className="font-semibold text-white"> → {i.decision_label}</span>}
                  {i.decision_label && i.question && <span className="block text-sm text-white/55">{i.question}</span>}
                  {i.kind === 'disagreed' && (
                    <span className="block text-sm text-white/55">
                      The agent decided: {i.question}
                      {i.owner_note && <span className="block text-white/80">Your note: {i.owner_note}</span>}
                    </span>
                  )}
                  {i.status === 'open' && i.kind !== 'discuss' && forTalk(detail.follow_up!, i) && (
                    // Held with a point the developer wants to talk through: no night takes it on.
                    <span className="block text-sm text-eyes/90">Waits for your talk{talkId(detail.follow_up!, i)}.</span>
                  )}
                </span>
                {i.status === 'open' && detail.taken[`${n.night}/${i.id}`] ? (
                  // A night running now took it on: the agent's turn, not the developer's.
                  <span className="shrink-0 rounded-full bg-agent/15 px-2 py-px text-xs font-semibold whitespace-nowrap text-agent">Taken by a running night</span>
                ) : i.status === 'open' ? (
                  <span className="shrink-0 rounded-full px-2 py-px text-xs font-semibold whitespace-nowrap" style={{ color: `color-mix(in srgb, ${KIND[i.kind].color} 75%, white)`, background: `color-mix(in srgb, ${KIND[i.kind].color} 18%, transparent)` }}>{KIND[i.kind].label}</span>
                ) : (
                  <span className="shrink-0 text-xs text-white/50">{takenBack(i) ? 'withdrawn: you kept the decision' : i.status}</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="What happened" aside={<span className="hidden sm:inline">open a task for its checks and proof</span>}>
        {n.tasks.length ? (
          <ul className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {n.tasks.map((t) => <TaskRow key={t.id} task={t} decisions={agentDecisions(n).filter((d) => d.task === t.id)} onOpen={() => setOpen(t)} />)}
          </ul>
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white/60">No task yet.</p>
        )}
      </Section>

      {n.feedback.length > 0 && <FeedbackSection detail={detail} onDetail={onDetail} />}

      {detail.problems.length > 0 && (
        <div className="rounded-2xl border border-broken/40 bg-broken/10 p-4 text-sm text-broken">
          <div className="mb-1 font-semibold">This night file has problems</div>
          <ul className="list-inside list-disc">{detail.problems.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}

      {open && <TaskDrawer task={open} detail={detail} onClose={() => setOpen(null)} onQuestion={(key, only) => { setOpen(null); onOpenDeck(key, only); }} />}
    </div>
  );
}

// The questions as one compact row, and the save for the next agent; what is left when neither applies.
function NeedsYou({ detail, onOpenDeck, onDetail, onReload }: { detail: NightDetail; onOpenDeck: (startKey?: string, only?: 'decisions') => void; onDetail: (d: NightDetail) => void; onReload: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Saved from this row just now: say what happens next, as the deck's gate does.
  const [justSaved, setJustSaved] = useState(false);
  const n = detail.night;
  const f = detail.follow_up;
  const openQ = n.questions.filter((q) => isOpenQuestionIn(q, f, detail.taken)).length;
  const answered = n.questions.filter((q) => q.answer !== null).length;
  // Unanswered, and its item taken on by a night running now.
  const held = n.questions.filter((q) => {
    const h = q.answer === null ? handedItem(f, q) : undefined;
    return !!h && !!detail.taken[`${n.night}/${h.id}`];
  }).length;
  const save = n.status !== 'open' && needsHandOver(n, f);
  const pending = unfinishedTasks(n);
  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      onDetail(await createFollowUp(detail.repo.id, n.night));
      setJustSaved(true);
    } catch (e) {
      setError((e as Error).message);
      // Saved elsewhere meanwhile (another tab): show the night as it is now.
      if (e instanceof ApiError && e.status === 409) onReload();
    } finally {
      setBusy(false);
    }
  };
  const rows: ReactNode[] = [];
  // Points the developer wants to talk through: no night acts on them, a session with them does.
  const talks = f ? f.items.filter((i) => i.status === 'open' && i.kind === 'discuss') : [];
  if (talks.length) {
    rows.push(
      <div key="d" className="flex flex-wrap items-start gap-x-4 gap-y-3 px-4 py-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-eyes/15 text-eyes"><Icon name="question" className="size-5" strokeWidth={2.4} /></span>
        <div className="min-w-[14rem] flex-1">
          <div className="font-semibold">{talks.length === 1 ? '1 point to talk through' : `${talks.length} points to talk through`}</div>
          <ul className="mt-1 space-y-1 text-sm text-white/65">
            {talks.map((i) => (
              <li key={i.id}>{i.question ?? i.title}{i.owner_note && <span className="text-white/85"> · your note: {i.owner_note}</span>}</li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-white/55">{talks.length === 1 ? 'No night works on this' : 'No night works on these'}. Open Claude Code in this folder and say:</p>
          <div className="mt-2 sm:max-w-sm"><Phrase text="work on the follow-up" hint="now, with you there" /></div>
        </div>
      </div>,
    );
  }
  if (n.questions.length) {
    rows.push(
      <div key="q" className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
        <Ring done={answered} total={n.questions.length} size={64}>
          <span className="text-lg font-bold">{openQ}</span>
        </Ring>
        <div className="min-w-[12rem] flex-1">
          <div className="font-semibold">{openQ ? `${openQ} question${openQ === 1 ? '' : 's'} waiting for you` : answered < n.questions.length ? 'Nothing waiting for you' : 'Every question answered'}</div>
          <div className="text-sm text-white/55">{answered} of {n.questions.length} answered{openQ && f ? '; your answer still reaches the next agent' : ''}{!openQ && answered < n.questions.length ? (held ? `; ${held} held by a running night` : '; the rest were settled elsewhere') : ''}</div>
        </div>
        <button onClick={() => onOpenDeck()} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition hover:brightness-110 ${openQ ? 'bg-[var(--accent)] text-white' : 'glass text-white/85'}`}>
          {openQ ? 'Start answering' : 'Review answers'} <Icon name="right" className="size-4" strokeWidth={2.6} />
        </button>
      </div>,
    );
  }
  const decisions = agentDecisions(n);
  if (decisions.length) {
    const toReview = decisions.filter((d) => d.review === null);
    const against = disagreed(n).length;
    rows.push(
      <div key="a" className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
        <Ring done={decisions.length - toReview.length} total={decisions.length} size={64}>
          <span className="text-lg font-bold">{toReview.length}</span>
        </Ring>
        <div className="min-w-[12rem] flex-1">
          <div className="font-semibold">{toReview.length ? `${toReview.length} decision${toReview.length === 1 ? '' : 's'} to review` : 'Every decision reviewed'}</div>
          <div className="text-sm text-white/55">{decisions.length - toReview.length} of {decisions.length} reviewed{against ? `; you disagree with ${against}, which the next agent revisits` : ''}</div>
        </div>
        <button onClick={() => onOpenDeck(decisionKey(detail, toReview[0] ?? decisions[0]), 'decisions')} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition hover:brightness-110 ${toReview.length ? 'bg-[var(--accent)] text-white' : 'glass text-white/85'}`}>
          {toReview.length ? 'Review decisions' : 'See decisions'} <Icon name="right" className="size-4" strokeWidth={2.6} />
        </button>
      </div>,
    );
  }
  if (save) {
    rows.push(
      <div key="s" className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-eyes/15 text-eyes"><Icon name="forward" className="size-5" strokeWidth={2.4} /></span>
        <div className="min-w-[14rem] flex-1">
          <div className="flex items-center gap-2 font-semibold">Save for the next agent <HelpDot step="save" term="Save for the next agent" /></div>
          <div className="text-sm text-white/55">{[pending ? `${pending} unfinished task${pending === 1 ? '' : 's'}` : '', n.questions.length ? `${n.questions.length} question${n.questions.length === 1 ? '' : 's'}` : '', disagreed(n).length ? `${disagreed(n).length} disagreement${disagreed(n).length === 1 ? '' : 's'}` : ''].filter(Boolean).join(' and ')}. {openQ || decisionsOpen(n) ? `${[openQ && 'Answer', decisionsOpen(n) && 'review'].filter(Boolean).join(' and ')} what you can first; nothing` : 'Nothing'} runs until you start an agent.</div>
        </div>
        <button onClick={() => void create()} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>,
    );
  }
  if (justSaved && f) rows.push(<Saved key="saved" detail={detail} flat />);
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      {rows.length ? <div className="divide-y divide-white/8">{rows}</div> : (
        <p className="px-4 py-3 text-white/60">{n.status === 'open' ? 'Nothing yet: the night is still running.' : 'Nothing: no question was asked and nothing is left to save.'}</p>
      )}
      {error && (save || !f) && <div className="border-t border-white/8 bg-broken/15 px-4 py-2 text-sm text-broken">{error}</div>}
    </div>
  );
}

// One task as a row: its outcome, id and title, one line of result, and what it carries.
function TaskRow({ task: t, decisions, onOpen }: { task: Task; decisions: AgentDecision[]; onOpen: () => void }) {
  const toReview = decisions.filter((d) => d.review === null).length;
  const s = taskStyle(t.outcome);
  const met = t.checks.filter((c) => c.met).length;
  const line = t.outcome === null ? 'In progress' : t.why ?? t.reason ?? (t.checks.length ? `${met} of ${t.checks.length} checks met` : '');
  const pills = [
    t.evidence.length > 0 && (
      <Pill key="e" title={`${t.evidence.length} piece${t.evidence.length === 1 ? '' : 's'} of evidence`}>
        <Icon name={t.evidence.some((b) => b.type === 'image' || b.type === 'compare' || b.type === 'video') ? 'image' : 'file'} className="size-3" /> {t.evidence.length}
      </Pill>
    ),
    t.blocked_by && <Pill key="b" className="!bg-eyes/20 !text-eyes"><Icon name="question" className="size-3" /> {t.blocked_by}</Pill>,
    decisions.length > 0 && (
      <Pill key="d" className={toReview ? '!bg-eyes/20 !text-eyes' : ''} title="Decisions the agent took for you in this task">
        <Icon name="compass" className="size-3.5" /> {toReview ? `${toReview} to review` : `${decisions.length} decision${decisions.length === 1 ? '' : 's'}`}
      </Pill>
    ),
    refsOf(t).length > 0 && <Pill key="f">from {refsOf(t).join(', ')}</Pill>,
    t.unplanned && <Pill key="u">unplanned</Pill>,
  ].filter(Boolean);
  return (
    <li>
      <button onClick={onOpen} className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/5">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${s.color} 18%, transparent)`, color: s.color }} title={s.label}>
          <Icon name={s.icon} className="size-4" strokeWidth={2.4} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block">
            <span className="mr-2 font-mono text-sm font-semibold" style={{ color: s.color }}>{t.id}</span>
            <span className="text-white/90">{t.title}</span>
          </span>
          {line && <span className="mt-0.5 block text-sm text-white/55">{s.label} · {line}</span>}
          {pills.length > 0 && <span className="mt-1.5 flex flex-wrap gap-1.5 sm:hidden">{pills}</span>}
        </span>
        <span className="mt-1 hidden shrink-0 flex-wrap justify-end gap-1.5 sm:flex">
          {pills}
          <Icon name="right" className="mt-0.5 size-4 text-white/35" />
        </span>
      </button>
    </li>
  );
}

function TaskDrawer({ task: t, detail, onClose, onQuestion }: { task: Task; detail: NightDetail; onClose: () => void; onQuestion: (key: string, only?: 'decisions') => void }) {
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
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full" style={{ background: c.met ? 'color-mix(in srgb, var(--color-shipped) 20%, transparent)' : 'color-mix(in srgb, var(--color-idle) 20%, transparent)', color: c.met ? 'var(--color-shipped)' : 'var(--color-idle)' }}>
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
                    <span className="block text-xs text-white/50">{q.answer !== null ? `→ ${answerLabel(q)}` : isOpenQuestionIn(q, detail.follow_up, detail.taken) ? 'open' : 'locked'}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {agentDecisions(detail.night).some((d) => d.task === t.id) && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm tracking-widest text-white/50 uppercase">Decisions the agent took for you</h3>
            <ul className="divide-y divide-white/8 overflow-hidden rounded-xl border border-white/10">
              {agentDecisions(detail.night).filter((d) => d.task === t.id).map((d) => <DecisionRow key={d.id} decision={d} inTask onOpen={() => onQuestion(decisionKey(detail, d), 'decisions')} />)}
            </ul>
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

const decisionKey = (detail: NightDetail, d: AgentDecision) => `${detail.repo.id}/${detail.night.night}/${d.id}`;

// A decision the agent took for the developer (D31): what, why, and where the review stands. Opens it
// in the deck to review or change.
function DecisionRow({ decision: d, inTask = false, onOpen }: { decision: AgentDecision; inTask?: boolean; onOpen: () => void }) {
  const state =
    d.review === null ? { label: 'Not reviewed', cls: 'bg-eyes/15 text-eyes' }
      : d.review === 'ok' ? { label: 'Fine', cls: 'bg-shipped/15 text-shipped' }
        : { label: 'You disagree', cls: 'bg-agent/15 text-agent' };
  return (
    <li>
      <button onClick={onOpen} className="flex w-full flex-wrap items-start gap-x-3 gap-y-1 px-4 py-3 text-left transition hover:bg-white/5">
        {!inTask && <span className="mt-0.5 shrink-0 self-start rounded bg-white/10 px-1.5 font-mono text-xs leading-6">{d.task ?? d.id}</span>}
        <span className="min-w-[12rem] flex-1">
          <span className="block text-white/90">{d.decision}</span>
          <span className="block text-sm text-white/55">{d.why}</span>
          {d.review === 'disagree' && d.note && <span className="mt-0.5 block text-sm text-white/80">Your note: {d.note}</span>}
        </span>
        <span className={`shrink-0 rounded-full px-2 py-px text-xs font-semibold whitespace-nowrap ${state.cls}`}>{state.label}</span>
      </button>
    </li>
  );
}
