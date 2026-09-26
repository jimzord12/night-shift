import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import type { NightDetail, Question } from '../../src/types.ts';
import { ApiError, fileUrl, postAnswer } from './api.ts';
import { MediaThumb, MediaViewer } from './Evidence.tsx';
import type { Media } from './Evidence.tsx';
import { Starfield } from './Starfield.tsx';
import { Icon, nightTitle } from './ui.tsx';

// One question as the deck shows it, with the night it belongs to.
export interface DeckItem {
  key: string;
  detail: NightDetail;
  question: Question;
}

interface Draft {
  answer: string;
  note: string;
}

interface Props {
  items: DeckItem[];
  startKey?: string;
  onClose: () => void;
  onSaved: (detail: NightDetail) => void;
  onConflict: (repo: string, night: string) => Promise<void>;
}

export const deckKey = (d: NightDetail, q: Question) => `${d.repo.id}/${d.night.night}/${q.id}`;

// One question per screen, the agent's recommendation preselected. The order is fixed when the
// deck opens: the question clicked, then the open ones; with nothing open, every question, so
// answers can be reviewed and changed.
export function QuestionDeck({ items, startKey, onClose, onSaved, onConflict }: Props) {
  const order = useMemo(() => {
    const open = items.filter((i) => i.question.answer === null);
    const base = (open.length ? open : items).map((i) => i.key);
    if (startKey) return [startKey, ...base.filter((k) => k !== startKey)];
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byKey = new Map(items.map((i) => [i.key, i]));
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [focusNote, setFocusNote] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<Media | null>(null);
  const [finished, setFinished] = useState(false);

  const key = order[index];
  const item = key ? byKey.get(key) : undefined;
  const q = item?.question ?? null;
  const draft: Draft | null = q && key ? (drafts[key] ?? { answer: q.answer ?? q.recommended, note: q.note ?? '' }) : null;
  const handled = (k: string, saved: Set<string>) => saved.has(k) || (byKey.get(k)?.question.answer ?? null) !== null;
  const setDraft = (d: Draft) => key && setDrafts((all) => ({ ...all, [key]: d }));
  const url = (rel: string) => (item ? fileUrl(item.detail.repo.id, item.detail.night.night, rel) : rel);

  useEffect(() => {
    setMessage(null);
    setShowNote(!!draft?.note);
    setFocusNote(false);
    scroller.current?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const go = useCallback((i: number) => setIndex(Math.max(0, Math.min(order.length - 1, i))), [order.length]);

  const advance = (nextSaved: Set<string>) => {
    const ahead = order.findIndex((k, i) => i > index && !handled(k, nextSaved));
    const behind = order.findIndex((k, i) => i < index && !handled(k, nextSaved));
    if (ahead >= 0) setIndex(ahead);
    else if (behind >= 0) setIndex(behind);
    else if (index < order.length - 1) setIndex(index + 1);
    else setFinished(true);
  };

  const save = useCallback(async () => {
    if (!q || !item || !draft || !key || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const detail = await postAnswer(item.detail.repo.id, item.detail.night.night, { question: q.id, answer: draft.answer, note: draft.note, baseHash: item.detail.hash });
      onSaved(detail);
      const nextSaved = new Set(savedKeys).add(key);
      setSavedKeys(nextSaved);
      setDrafts((all) => {
        const { [key]: _, ...rest } = all;
        return rest;
      });
      const ahead = order.findIndex((k, i) => i > index && !handled(k, nextSaved));
      const behind = order.findIndex((k, i) => i < index && !handled(k, nextSaved));
      if (ahead >= 0) setIndex(ahead);
      else if (behind >= 0) setIndex(behind);
      else setFinished(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) await onConflict(item.detail.repo.id, item.detail.night.night);
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, item, draft, key, busy, savedKeys, order, index]);

  useEffect(() => {
    if (!finished) return;
    const end = Date.now() + 900;
    const colors = ['#f5d76e', '#7c5cff', '#34d399', '#ffffff'];
    (function frame() {
      confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [finished]);

  const qRef = useRef(q);
  qRef.current = q;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (zoom) return;
      const typing = e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement;
      if (e.key === 'Escape' && typing) return (e.target as HTMLElement).blur();
      if (e.key === 'Escape') return onClose();
      if (finished) {
        if (e.key === 'Enter') onClose();
        return;
      }
      if (e.key === 'Enter' && (!typing || e.ctrlKey)) {
        e.preventDefault();
        return void save();
      }
      if (typing || !qRef.current || !draft) return;
      if (e.key === 'ArrowRight') return go(index + 1);
      if (e.key === 'ArrowLeft') return go(index - 1);
      if (e.key.toLowerCase() === 'd') return advance(savedKeys);
      const n = Number(e.key);
      const pick = qRef.current.options[n - 1];
      if (n >= 1 && pick) setDraft({ ...draft, answer: pick.id });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const answeredCount = order.filter((k) => handled(k, savedKeys)).length;
  const rec = q?.options.find((o) => o.id === q.recommended);

  return (
    <div ref={scroller} className="sky fixed inset-0 z-40 overflow-y-auto">
      <Starfield />
      <div className="relative mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6">
        <header className="flex items-center gap-4">
          <div className="flex flex-1 flex-wrap gap-1.5">
            {order.map((k, i) => {
              const done = handled(k, savedKeys);
              return (
                <button
                  key={k}
                  onClick={() => {
                    setFinished(false);
                    go(i);
                  }}
                  title={byKey.get(k)?.question.ask ?? k}
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
            <p className="mt-2 text-white/60">{order.every((k) => byKey.get(k)?.detail.follow_up) ? 'Every question has an answer. The follow-up already handed over now carries them.' : 'Every question has an answer. Create the follow-up so the next agent picks them up.'}</p>
            <button onClick={onClose} className="mt-8 rounded-full bg-[var(--accent)] px-6 py-2.5 font-semibold text-white shadow-lg">Back to the morning</button>
          </div>
        ) : !q || !draft || !item ? (
          <div className="my-auto text-center text-white/60">No open questions.</div>
        ) : (
          <div key={key} className="pop-in mt-8 flex flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-white/10 px-2.5 py-1 font-semibold tracking-wide uppercase">{item.detail.repo.name}</span>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-white/60">{nightTitle(item.detail.night.night)}</span>
              {q.task && <span className="rounded-full bg-blocked/20 px-2.5 py-1 font-mono font-semibold text-blocked">{q.task}</span>}
              {q.answer !== null && <span className="rounded-full bg-[var(--accent)]/20 px-2.5 py-1 text-white/80">answered; you can change it</span>}
            </div>
            <h2 className="font-display mt-4 text-3xl leading-tight font-semibold sm:text-4xl">{q.ask}</h2>
            {q.why && <p className="mt-2 text-lg text-white/60">{q.why}</p>}

            <div className="mt-6 grid gap-3">
              {q.options.map((o, i) => {
                const on = draft.answer === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => setDraft({ ...draft, answer: o.id })}
                    className="flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition hover:bg-white/5"
                    style={{ borderColor: on ? 'var(--accent)' : '#ffffff14', background: on ? 'color-mix(in srgb, var(--accent) 22%, var(--color-night-900))' : 'color-mix(in srgb, var(--color-night-800) 92%, transparent)' }}
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border-2" style={{ borderColor: on ? 'var(--accent)' : '#ffffff30', background: on ? 'var(--accent)' : undefined }}>
                      {on && <Icon name="check" className="size-4" strokeWidth={3} />}
                    </span>
                    {o.image && (
                      <span
                        role="button"
                        tabIndex={0}
                        title={`View ${o.label} in full`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoom({ src: url(o.image!), title: o.label });
                        }}
                        className="shrink-0 overflow-hidden rounded-lg"
                      >
                        <MediaThumb src={url(o.image)} className="h-16" />
                      </span>
                    )}
                    <span className="flex-1">
                      <span className="block text-lg font-medium">{o.label}</span>
                      {o.detail && <span className="block text-sm text-white/55">{o.detail}</span>}
                    </span>
                    {o.id === q.recommended && <Icon name="sparkle" className="size-4 text-moon" />}
                    <kbd className="text-white/40">{i + 1}</kbd>
                  </button>
                );
              })}
            </div>

            {rec && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-moon/8 px-4 py-3 text-sm">
                <Icon name="sparkle" className="mt-0.5 size-4 shrink-0 text-moon" />
                <div className="flex-1">
                  <span className="text-white/70">Recommended: </span>
                  <span className="font-semibold text-moon">{rec.label}</span>
                </div>
                <button onClick={() => setDraft({ ...draft, answer: rec.id })} className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20">use it</button>
              </div>
            )}

            <div className="mt-4">
              {showNote ? (
                <textarea value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="A note for the agent (optional)" rows={2} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" autoFocus={focusNote} />
              ) : (
                <button onClick={() => { setShowNote(true); setFocusNote(true); }} className="text-sm text-white/50 hover:text-white">+ add a note</button>
              )}
            </div>

            {message && <div className="mt-4 rounded-xl bg-blocked/15 px-4 py-2 text-sm text-blocked">{message}</div>}

            <footer className="mt-auto flex items-center gap-2 pt-8">
              <button onClick={() => go(index - 1)} disabled={index === 0} className="moon-btn size-12" aria-label="Previous"><Icon name="left" className="size-5" strokeWidth={2.8} /></button>
              <button onClick={() => go(index + 1)} disabled={index === order.length - 1} className="moon-btn size-12" aria-label="Next"><Icon name="right" className="size-5" strokeWidth={2.8} /></button>
              <div className="flex-1" />
              <button onClick={() => advance(savedKeys)} disabled={busy} className="moon-btn !inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold" title="Leave it unanswered; the next agent asks again">Not now <kbd>D</kbd></button>
              <button onClick={() => void save()} disabled={busy} className="rounded-full bg-[var(--accent)] px-6 py-2.5 font-semibold text-white shadow-[0_8px_30px_-8px_var(--accent)] transition hover:brightness-110 disabled:opacity-60">
                {busy ? 'Saving…' : 'Save'} <kbd className="ml-1 !border-white/40">Enter</kbd>
              </button>
            </footer>
          </div>
        )}
      </div>
      {zoom && <MediaViewer media={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}
