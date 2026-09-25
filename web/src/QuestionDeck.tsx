import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import type { Question, QuestionEntry } from '../../src/types.ts';
import { isOpen } from '../../src/types.ts';
import { ApiError, fileUrl, postAnswer } from './api.ts';
import { Lightbox } from './Evidence.tsx';
import { Starfield } from './Starfield.tsx';
import { Icon } from './ui.tsx';

interface Draft {
  value: string[];
  note: string;
  // The file version the owner was looking at when the draft began; the server refuses the save
  // if the file changed since, even when a background refresh already shows the newer version.
  baseHash: string;
}

function initialDraft(q: Question, baseHash: string): Draft {
  if (q.answer?.status === 'answered') return { value: [...q.answer.value], note: q.answer.note ?? '', baseHash };
  const note = q.answer?.note ?? '';
  if (q.kind === 'rank') {
    const ids = (q.options ?? []).map((o) => o.id);
    return { value: q.recommended.length === ids.length ? [...q.recommended] : ids, note, baseHash };
  }
  if (q.kind === 'text') return { value: [q.recommended[0] ?? ''], note, baseHash };
  return { value: [...q.recommended], note, baseHash };
}

function valueError(q: Question, value: string[]): string | null {
  if (q.kind === 'text') return value[0]?.trim() ? null : 'Write an answer first';
  if (q.kind === 'many') {
    const min = q.min ?? 1;
    const max = q.max ?? (q.options?.length ?? 0);
    if (value.length < min) return `Pick at least ${min}`;
    if (value.length > max) return `Pick at most ${max}`;
    return null;
  }
  if (q.kind === 'rank') return null;
  return value.length === 1 ? null : 'Pick one';
}

const labelOf = (q: Question, id: string) => (q.kind === 'confirm' ? (id === 'yes' ? 'Yes' : 'No') : q.options?.find((o) => o.id === id)?.label ?? id);

interface Props {
  entries: QuestionEntry[];
  startId?: string;
  onClose: () => void;
  onSaved: (entry: QuestionEntry) => void;
  onConflict: () => Promise<void>;
}

export function QuestionDeck({ entries, startId, onClose, onSaved, onConflict }: Props) {
  // The deck is fixed when it opens: the question clicked (if any), then the open ones
  // (blocking first); with nothing open, every question, so answers can be reviewed.
  const order = useMemo(() => {
    const valid = entries.filter((e) => e.question);
    const open = valid.filter((e) => isOpen(e.question!)).sort((a, b) => Number(!!b.question!.blocking) - Number(!!a.question!.blocking) || a.question!.id.localeCompare(b.question!.id));
    const base = open.length ? open : valid;
    const ids = base.map((e) => e.question!.id);
    if (startId && !ids.includes(startId)) ids.unshift(startId);
    else if (startId) ids.splice(0, 0, ...ids.splice(ids.indexOf(startId), 1));
    return ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byId = new Map(entries.filter((e) => e.question).map((e) => [e.question!.id, e]));
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const id = order[index];
  const entry = id ? byId.get(id) : undefined;
  const q = entry?.question ?? null;
  const draft = q && entry ? (drafts[q.id] ?? initialDraft(q, entry.hash)) : null;
  // Handled in this sitting (answered or put off), or already answered before it.
  const handled = (oid: string, saved: Set<string>) => saved.has(oid) || !isOpen(byId.get(oid)?.question ?? ({ answer: null, resolved: null } as unknown as Question));
  const setDraft = (d: Draft) => q && setDrafts((all) => ({ ...all, [q.id]: d }));
  const locked = !!q?.resolved;

  useEffect(() => {
    setMessage(null);
    setShowNote(!!draft?.note);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const go = useCallback((i: number) => setIndex(Math.max(0, Math.min(order.length - 1, i))), [order.length]);

  const save = useCallback(
    async (status: 'answered' | 'deferred') => {
      if (!q || !entry || !draft || busy || locked) return;
      if (status === 'answered') {
        const err = valueError(q, draft.value);
        if (err) return setMessage(err);
      }
      setBusy(true);
      setMessage(null);
      try {
        const saved = await postAnswer(q.id, { status, value: status === 'deferred' ? [] : draft.value, note: draft.note, baseHash: draft.baseHash });
        onSaved(saved);
        setDrafts((all) => {
          const { [q.id]: _, ...rest } = all;
          return rest;
        });
        const nextSaved = new Set(savedIds).add(q.id);
        setSavedIds(nextSaved);
        // The next unhandled question after this one, else the first skipped one before it.
        const ahead = order.findIndex((oid, i) => i > index && !handled(oid, nextSaved));
        const behind = order.findIndex((oid, i) => i < index && !handled(oid, nextSaved));
        if (ahead >= 0) setIndex(ahead);
        else if (behind >= 0) setIndex(behind);
        else setFinished(true);
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          await onConflict();
          setDrafts((all) => {
            const { [q.id]: _, ...rest } = all;
            return rest;
          });
        }
        setMessage((error as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [q, entry, draft, busy, locked, savedIds, order, index, byId, onSaved, onConflict],
  );

  useEffect(() => {
    if (finished) {
      const end = Date.now() + 900;
      const colors = ['#f5d76e', '#7c5cff', '#34d399', '#ffffff'];
      (function frame() {
        confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors });
        confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [finished]);

  const qRef = useRef(q);
  qRef.current = q;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (zoom) return;
      const typing = e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement;
      if (e.key === 'Escape') return onClose();
      if (finished) {
        if (e.key === 'Enter') onClose();
        return;
      }
      if (e.key === 'Enter' && (!typing || e.ctrlKey)) {
        e.preventDefault();
        return void save('answered');
      }
      if (typing || !qRef.current || !draft) return;
      const cq = qRef.current;
      if (e.key === 'ArrowRight') return go(index + 1);
      if (e.key === 'ArrowLeft') return go(index - 1);
      if (e.key.toLowerCase() === 'd') return void save('deferred');
      if (cq.kind === 'confirm' && (e.key.toLowerCase() === 'y' || e.key.toLowerCase() === 'n')) return setDraft({ ...draft, value: [e.key.toLowerCase() === 'y' ? 'yes' : 'no'] });
      const n = Number(e.key);
      if (n >= 1 && n <= 9) {
        const ids = cq.kind === 'confirm' ? ['yes', 'no'] : (cq.options ?? []).map((o) => o.id);
        const pick = ids[n - 1];
        if (!pick) return;
        if (cq.kind === 'one' || cq.kind === 'confirm') setDraft({ ...draft, value: [pick] });
        if (cq.kind === 'many') setDraft({ ...draft, value: draft.value.includes(pick) ? draft.value.filter((v) => v !== pick) : [...draft.value, pick] });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const answeredCount = order.filter((oid) => handled(oid, savedIds)).length;

  return (
    <div className="sky fixed inset-0 z-40 overflow-y-auto">
      <Starfield />
      <div className="relative mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6">
        <header className="flex items-center gap-4">
          <div className="flex flex-1 flex-wrap gap-1.5">
            {order.map((oid, i) => {
              const done = handled(oid, savedIds);
              return (
                <button
                  key={oid}
                  onClick={() => { setFinished(false); go(i); }}
                  title={byId.get(oid)?.question?.question ?? oid}
                  className="h-2 flex-1 rounded-full transition-all"
                  style={{ minWidth: 18, background: i === index && !finished ? '#fff' : done ? 'var(--accent)' : '#ffffff22', boxShadow: done ? '0 0 8px var(--accent)' : undefined }}
                />
              );
            })}
          </div>
          <span className="text-sm text-white/60 tabular-nums">{answeredCount} / {order.length}</span>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Close">
            <Icon name="close" className="size-5" />
          </button>
        </header>

        {finished ? (
          <div className="pop-in my-auto text-center">
            <div className="mx-auto grid size-28 place-items-center rounded-full bg-[var(--accent)]/20 text-moon shadow-[0_0_60px_var(--accent)]">
              <Icon name="moon" className="size-14" strokeWidth={1.6} />
            </div>
            <h2 className="font-display mt-6 text-4xl font-semibold">All clear</h2>
            <p className="mt-2 text-white/60">Every question has an answer. The next shift picks them up.</p>
            <button onClick={onClose} className="mt-8 rounded-full bg-[var(--accent)] px-6 py-2.5 font-semibold text-white shadow-lg">Back to the morning</button>
          </div>
        ) : !q || !draft ? (
          <div className="my-auto text-center text-white/60">{id ? `Question ${id} is not valid or no longer exists.` : 'No questions.'}</div>
        ) : (
          <div key={q.id} className="pop-in mt-8 flex flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {q.topic && <span className="rounded-full bg-white/10 px-2.5 py-1 font-semibold tracking-wide uppercase">{q.topic}</span>}
              {q.blocking && <span className="rounded-full bg-blocked/20 px-2.5 py-1 font-semibold text-blocked">blocks a card</span>}
              {q.card && <span className="rounded-full bg-white/5 px-2.5 py-1 font-mono text-white/60">{q.card}</span>}
              {q.answer && !locked && <span className="rounded-full bg-[var(--accent)]/20 px-2.5 py-1 text-white/80">{q.answer.status === 'deferred' ? 'deferred earlier' : 'answered; you can change it'}</span>}
            </div>
            <h2 className="font-display mt-4 text-3xl leading-tight font-semibold sm:text-4xl">{q.question}</h2>
            {q.why && <p className="mt-2 text-lg text-white/60">{q.why}</p>}
            {q.images?.length ? (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {q.images.map((img) => (
                  <button key={img} onClick={() => setZoom(fileUrl(img))} className="shrink-0 overflow-hidden rounded-xl bg-white transition hover:scale-[1.02]">
                    <img src={fileUrl(img)} alt="" className="h-40 w-auto" />
                  </button>
                ))}
              </div>
            ) : null}

            {locked && (
              <div className="mt-5 rounded-xl border border-shipped/40 bg-shipped/10 p-3 text-sm text-shipped">
                Done: this answer became <span className="font-semibold break-all">{q.resolved!.into}</span>
              </div>
            )}

            <div className={`mt-6 ${locked ? 'pointer-events-none opacity-60' : ''}`}>
              <AnswerInput q={q} draft={draft} setDraft={setDraft} onZoom={setZoom} />
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-moon/8 px-4 py-3 text-sm">
              <Icon name="sparkle" className="mt-0.5 size-4 shrink-0 text-moon" />
              <div className="flex-1">
                <span className="text-white/70">Recommended: </span>
                <span className="font-semibold text-moon">{q.kind === 'text' ? `“${q.recommended[0] ?? ''}”` : q.recommended.map((r) => labelOf(q, r)).join(q.kind === 'rank' ? ' → ' : ', ')}</span>
                <span className="text-white/60"> · {q.because}</span>
              </div>
              {!locked && (
                <button onClick={() => setDraft({ ...initialDraft({ ...q, answer: null }, draft.baseHash), note: draft.note })} className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20">use it</button>
              )}
            </div>

            {!locked && (
              <div className="mt-4">
                {showNote ? (
                  <textarea value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="A note for the agent (optional)" rows={2} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" autoFocus />
                ) : (
                  <button onClick={() => setShowNote(true)} className="text-sm text-white/50 hover:text-white">+ add a note</button>
                )}
              </div>
            )}

            {message && <div className="mt-4 rounded-xl bg-blocked/15 px-4 py-2 text-sm text-blocked">{message}</div>}

            <footer className="mt-auto flex items-center gap-2 pt-8">
              <button onClick={() => go(index - 1)} disabled={index === 0} className="moon-btn size-12" aria-label="Previous"><Icon name="left" className="size-5" strokeWidth={2.8} /></button>
              <button onClick={() => go(index + 1)} disabled={index === order.length - 1} className="moon-btn size-12" aria-label="Next"><Icon name="right" className="size-5" strokeWidth={2.8} /></button>
              <div className="flex-1" />
              {!locked && (
                <>
                  <button onClick={() => save('deferred')} disabled={busy} className="moon-btn !inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold">Not now <kbd>D</kbd></button>
                  <button onClick={() => save('answered')} disabled={busy} className="rounded-full bg-[var(--accent)] px-6 py-2.5 font-semibold text-white shadow-[0_8px_30px_-8px_var(--accent)] transition hover:brightness-110 disabled:opacity-60">
                    {busy ? 'Saving…' : 'Save'} <kbd className="ml-1 !border-white/40">Enter</kbd>
                  </button>
                </>
              )}
            </footer>
          </div>
        )}
      </div>
      {zoom && <Lightbox src={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}

function AnswerInput({ q, draft, setDraft, onZoom }: { q: Question; draft: Draft; setDraft: (d: Draft) => void; onZoom: (src: string) => void }) {
  const rec = new Set(q.recommended);
  if (q.kind === 'confirm') {
    return (
      <div className="grid grid-cols-2 gap-4">
        {(['yes', 'no'] as const).map((v, i) => {
          const on = draft.value[0] === v;
          const color = v === 'yes' ? 'var(--color-shipped)' : 'var(--color-blocked)';
          return (
            <button key={v} onClick={() => setDraft({ ...draft, value: [v] })} className="relative rounded-3xl border-2 py-10 text-3xl font-bold transition hover:scale-[1.02]" style={{ borderColor: on ? color : '#ffffff1a', background: on ? `color-mix(in srgb, ${color} 18%, var(--color-night-900))` : 'color-mix(in srgb, var(--color-night-800) 92%, transparent)', color: on ? color : '#ffffffb0', boxShadow: on ? `0 0 40px -10px ${color}` : undefined }}>
              {v === 'yes' ? 'Yes' : 'No'}
              <span className="absolute right-3 bottom-2 text-xs font-normal text-white/40"><kbd>{i + 1}</kbd> <kbd>{v === 'yes' ? 'Y' : 'N'}</kbd></span>
              {rec.has(v) && <Icon name="sparkle" className="absolute top-3 right-3 size-4 text-moon" />}
            </button>
          );
        })}
      </div>
    );
  }
  if (q.kind === 'one' || q.kind === 'many') {
    const options = q.options ?? [];
    const pictures = options.every((o) => o.image);
    const toggle = (oid: string) => {
      if (q.kind === 'one') return setDraft({ ...draft, value: [oid] });
      setDraft({ ...draft, value: draft.value.includes(oid) ? draft.value.filter((v) => v !== oid) : [...draft.value, oid] });
    };
    return (
      <div>
        {q.kind === 'many' && <div className="mb-3 text-sm text-white/60">{draft.value.length} picked · {q.min ?? 1} to {q.max ?? options.length}</div>}
        <div className={pictures ? 'grid grid-cols-2 gap-4 sm:grid-cols-3' : 'grid gap-3'}>
          {options.map((o, i) => {
            const on = draft.value.includes(o.id);
            return pictures ? (
              <button key={o.id} onClick={() => toggle(o.id)} onDoubleClick={() => onZoom(fileUrl(o.image!))} className="group relative overflow-hidden rounded-2xl border-2 text-left transition hover:-translate-y-1" style={{ borderColor: on ? 'var(--accent)' : '#ffffff14', boxShadow: on ? '0 0 40px -8px var(--accent)' : undefined }}>
                <img src={fileUrl(o.image!)} alt={o.label} className="aspect-square w-full bg-white object-cover" />
                <div className="p-3">
                  <div className="font-semibold">{o.label}</div>
                  {o.detail && <div className="text-xs text-white/60">{o.detail}</div>}
                </div>
                <span className="absolute top-2 left-2 rounded-md bg-black/60 px-1.5 text-xs"><kbd className="!border-0">{i + 1}</kbd></span>
                {rec.has(o.id) && <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-black/60 text-moon"><Icon name="sparkle" className="size-4" /></span>}
                {on && <span className="absolute right-2 bottom-16 grid size-8 place-items-center rounded-full bg-[var(--accent)] text-white shadow-lg"><Icon name="check" className="size-5" strokeWidth={3} /></span>}
              </button>
            ) : (
              <button key={o.id} onClick={() => toggle(o.id)} className="flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition hover:bg-white/5" style={{ borderColor: on ? 'var(--accent)' : '#ffffff14', background: on ? 'color-mix(in srgb, var(--accent) 22%, var(--color-night-900))' : 'color-mix(in srgb, var(--color-night-800) 92%, transparent)' }}>
                <span className={`grid size-7 shrink-0 place-items-center ${q.kind === 'one' ? 'rounded-full' : 'rounded-lg'} border-2`} style={{ borderColor: on ? 'var(--accent)' : '#ffffff30', background: on ? 'var(--accent)' : undefined }}>
                  {on && <Icon name="check" className="size-4" strokeWidth={3} />}
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-medium">{o.label}</span>
                  {o.detail && <span className="block text-sm text-white/55">{o.detail}</span>}
                </span>
                {rec.has(o.id) && <Icon name="sparkle" className="size-4 text-moon" />}
                <kbd className="text-white/40">{i + 1}</kbd>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  if (q.kind === 'rank') return <RankInput q={q} draft={draft} setDraft={setDraft} />;
  return (
    <textarea value={draft.value[0] ?? ''} onChange={(e) => setDraft({ ...draft, value: [e.target.value] })} rows={3} className="w-full rounded-2xl border-2 border-white/10 bg-night-800/95 px-4 py-3 text-xl outline-none focus:border-[var(--accent)]" placeholder="Your answer" />
  );
}

function RankInput({ q, draft, setDraft }: { q: Question; draft: Draft; setDraft: (d: Draft) => void }) {
  const [dragging, setDragging] = useState<string | null>(null);
  const option = (oid: string) => q.options?.find((o) => o.id === oid);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= draft.value.length || from === to) return;
    const next = [...draft.value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setDraft({ ...draft, value: next });
  };
  return (
    <ol className="space-y-2">
      {draft.value.map((oid, i) => (
        <li
          key={oid}
          draggable
          onDragStart={() => setDragging(oid)}
          onDragEnd={() => setDragging(null)}
          onDragOver={(e) => {
            e.preventDefault();
            if (dragging && dragging !== oid) move(draft.value.indexOf(dragging), i);
          }}
          className="flex cursor-grab items-center gap-3 rounded-2xl border-2 bg-night-800/95 px-3 py-3 transition active:cursor-grabbing"
          style={{ borderColor: dragging === oid ? 'var(--accent)' : '#ffffff14', opacity: dragging === oid ? 0.6 : 1 }}
        >
          <Icon name="grip" className="size-5 text-white/40" strokeWidth={3} />
          <span className="grid size-8 place-items-center rounded-full bg-[var(--accent)] font-bold">{i + 1}</span>
          <span className="flex-1">
            <span className="block text-lg font-medium">{option(oid)?.label ?? oid}</span>
            {option(oid)?.detail && <span className="block text-sm text-white/55">{option(oid)!.detail}</span>}
          </span>
          <button onClick={() => move(i, i - 1)} disabled={i === 0} className="rounded-lg p-1.5 hover:bg-white/10 disabled:opacity-20" aria-label="Move up"><Icon name="up" /></button>
          <button onClick={() => move(i, i + 1)} disabled={i === draft.value.length - 1} className="rounded-lg p-1.5 hover:bg-white/10 disabled:opacity-20" aria-label="Move down"><Icon name="down" /></button>
        </li>
      ))}
    </ol>
  );
}
