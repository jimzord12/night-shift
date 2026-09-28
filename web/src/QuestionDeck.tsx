import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DISCUSS, answerLabel, handedItem, isOpenQuestionIn } from '../../src/types.ts';
import type { NightDetail, Question } from '../../src/types.ts';
import { ApiError, fileUrl, postAnswer, questionFileUrl, revealQuestionFile } from './api.ts';
import { MediaThumb, MediaViewer, mediaKind } from './Evidence.tsx';
import { Gate, gateState } from './Gate.tsx';
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
  // Where closing returns to, named on the gate's button.
  from: 'Inbox' | 'report';
  onClose: () => void;
  onSaved: (detail: NightDetail) => void;
  onConflict: (repo: string, night: string) => Promise<boolean>;
}

export const deckKey = (d: NightDetail, q: Question) => `${d.repo.id}/${d.night.night}/${q.id}`;

// One question per screen, the agent's recommendation preselected. The order is fixed when the
// deck opens: the question clicked, then the open ones; with nothing open, every question, so
// answers can be reviewed and changed.
export function QuestionDeck({ items, startKey, from, onClose, onSaved, onConflict }: Props) {
  const order = useMemo(() => {
    const open = items.filter((i) => isOpenQuestionIn(i.question, i.detail.follow_up, i.detail.taken));
    const base = (open.length ? open : items).map((i) => i.key);
    if (startKey) return [startKey, ...base.filter((k) => k !== startKey)];
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byKey = new Map(items.map((i) => [i.key, i]));
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  // Questions left with Not now: the deck moves past them, and the gate says the next agent asks again.
  const [passed, setPassed] = useState<Set<string>>(new Set());
  const [inNote, setInNote] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [focusNote, setFocusNote] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  // Whether the focus came from a click rather than the keyboard: a clicked button leaves Enter to
  // Save. Tab clears it. (Browsers mark a clicked button :focus-visible once a key is pressed.)
  const clicked = useRef(false);
  // A focus the note still owes (D on a note not drawn yet); Esc cancels it, or it pulls the cursor back.
  const noteFocus = useRef<ReturnType<typeof setTimeout>>(undefined);
  const focusNoteSoon = () => {
    noteRef.current?.focus();
    clearTimeout(noteFocus.current);
    noteFocus.current = setTimeout(() => noteRef.current?.focus(), 0);
  };
  const [zoom, setZoom] = useState<Media | null>(null);
  const [finished, setFinished] = useState(false);
  const [savedNow, setSavedNow] = useState<ReadonlySet<string>>(new Set());
  const [celebrated, setCelebrated] = useState(false);

  const key = order[index];
  const item = key ? byKey.get(key) : undefined;
  const q = item?.question ?? null;
  // A night running now that took this item on (planned it or skipped it) holds it until it closes.
  const takenBy = (i: DeckItem | undefined) => {
    const h = i ? handedItem(i.detail.follow_up, i.question) : undefined;
    return h && i ? i.detail.taken?.[`${i.detail.night.night}/${h.id}`] : undefined;
  };
  // Settled or held elsewhere: no recommendation is shown as if it were the answer.
  const settledHere = !!q && !!item && ((handedItem(item.detail.follow_up, q)?.status ?? 'open') !== 'open' || !!takenBy(item));
  const draft: Draft | null = q && key ? (drafts[key] ?? { answer: q.answer ?? (settledHere ? '' : q.recommended), note: q.note ?? '' }) : null;
  const locked = (i: DeckItem | undefined) => {
    const h = i ? handedItem(i.detail.follow_up, i.question) : undefined;
    return (!!h && h.status !== 'open') || !!takenBy(i);
  };
  const handled = (k: string, saved: Set<string>) => saved.has(k) || (byKey.get(k)?.question.answer ?? null) !== null || locked(byKey.get(k));
  // Editing the answer clears an earlier save error: it no longer describes what is on screen.
  const setDraft = (d: Draft) => {
    if (!key) return;
    setMessage(null);
    setDrafts((all) => ({ ...all, [key]: d }));
  };
  const url = (rel: string) => (item ? fileUrl(item.detail.repo.id, item.detail.night.night, rel) : rel);
  // The follow-up item this question was handed over as; once an agent worked on its decision, the
  // answer is locked (the server refuses a change too).
  const handed = q && item ? handedItem(item.detail.follow_up, q) : undefined;
  const running = takenBy(item);
  const nightOf = (id: string) => nightTitle(id).replace(/^Night/, 'night');
  const lock = handed && handed.status !== 'open'
    ? handed.status === 'carried' && handed.kind === 'waiting'
      ? 'Locked: a later night asked this again. Answer it there.'
      : `Locked: an agent already worked on this (${handed.status} ${handed.resolved?.by === 'day' ? 'by day' : `in the ${nightOf(handed.resolved?.by ?? '')}`}), so the answer can no longer change.`
    : running
      ? `Locked: the ${nightOf(running)} has taken this on. You can change it once that night ends.`
      : null;

  useEffect(() => {
    setMessage(null);
    setShowNote(!!draft?.note);
    setFocusNote(false);
    // The note that had the cursor is gone with the question: Save's hint is plain Enter again.
    setInNote(false);
    scroller.current?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // The deck takes the focus from whatever opened it, so keys act on the deck, not the page behind.
  useEffect(() => {
    scroller.current?.focus({ preventScroll: true });
  }, []);

  const go = useCallback((i: number) => setIndex(Math.max(0, Math.min(order.length - 1, i))), [order.length]);

  // The next question still waiting: ahead first, then behind; none left opens the gate. Not now
  // (pass) leaves the current one for the next agent; a locked question's Next just browses on.
  const moveOn = (nextSaved: Set<string>, nextPassed: Set<string>, browse: boolean) => {
    const waiting = (k: string) => !handled(k, nextSaved) && !nextPassed.has(k);
    const ahead = order.findIndex((k, i) => i > index && waiting(k));
    const behind = order.findIndex((k, i) => i < index && waiting(k));
    if (ahead >= 0) setIndex(ahead);
    else if (behind >= 0) setIndex(behind);
    else if (browse && index < order.length - 1) setIndex(index + 1);
    else setFinished(true);
  };
  const advance = (nextSaved: Set<string>, pass = false) => {
    const nextPassed = pass && key ? new Set(passed).add(key) : passed;
    if (nextPassed !== passed) setPassed(nextPassed);
    moveOn(nextSaved, nextPassed, !pass);
  };

  // An answer given with the save (Enter on a focused option) is the one saved.
  const save = useCallback(async (answer?: string) => {
    if (!q || !item || !draft || !key || busy || lock) return;
    const draft_ = answer ? { ...draft, answer } : draft;
    if (answer) setDraft(draft_);
    // Let's discuss says what to talk through, or the next agent has nothing to start from.
    if (draft_.answer === DISCUSS && !draft_.note.trim()) {
      setMessage("Let's discuss needs a note: what is unclear, or what you want to talk through.");
      setShowNote(true);
      setFocusNote(true);
      // The error makes the footer taller: bring the note above it and into focus.
      setTimeout(() => {
        noteRef.current?.focus({ preventScroll: true });
        noteRef.current?.scrollIntoView({ block: 'center' });
      }, 0);
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const detail = await postAnswer(item.detail.repo.id, item.detail.night.night, { question: q.id, answer: draft_.answer, note: draft_.note, baseHash: item.detail.hash, was: { answer: q.answer, note: q.note } });
      onSaved(detail);
      const nextSaved = new Set(savedKeys).add(key);
      setSavedKeys(nextSaved);
      setDrafts((all) => {
        const { [key]: _, ...rest } = all;
        return rest;
      });
      moveOn(nextSaved, passed, false);
    } catch (error) {
      const reloaded = error instanceof ApiError && error.status === 409 ? await onConflict(item.detail.repo.id, item.detail.night.night) : true;
      setMessage(reloaded ? (error as Error).message : 'This night changed, and the new version could not be loaded. Reload the Viewer and try again.');
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, item, draft, key, busy, savedKeys, passed, order, index]);

  const noteRef = useRef<HTMLTextAreaElement>(null);
  const qRef = useRef(q);
  qRef.current = q;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (zoom) return;
      if (e.key === 'Tab') clicked.current = false;
      const letter = e.code.startsWith('Key') ? e.code.slice(3).toLowerCase() : e.key.toLowerCase();
      const typing = e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement;
      if (e.key === 'Escape' && typing) {
        clearTimeout(noteFocus.current);
        return (e.target as HTMLElement).blur();
      }
      if (e.key === 'Escape') return onClose();
      // On the gate Enter only leaves once nothing is left to save; on a focused button it presses it.
      if (finished) {
        const ownButton = e.target instanceof HTMLButtonElement && !!scroller.current?.contains(e.target);
        if (e.key === 'Enter' && !ownButton) {
          // A button behind the deck (the one that opened it) must not take the key.
          e.preventDefault();
          if (gateState(deckNights).clear) onClose();
        }
        if (letter === 's' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          document.querySelector<HTMLButtonElement>('[data-gate-save]:not(:disabled)')?.click();
        }
        return;
      }
      // Enter on a control the keyboard reached does that control's job: an answer option saves that
      // option, a thumbnail opens, a link or button presses itself. A button that holds the focus only
      // because it was clicked leaves Enter to Save.
      const t = e.target instanceof HTMLElement && e.target !== scroller.current && scroller.current?.contains(e.target) ? e.target : null;
      if (e.key === 'Enter' && !e.ctrlKey && t) {
        if (t.matches('[role=button]:not(button)') && !clicked.current) {
          e.preventDefault();
          return t.click();
        }
        const option = t.getAttribute('data-option');
        if (option === DISCUSS && !draft?.note.trim()) {
          // Nothing to talk through yet: pick it and write the note first, as D does.
          e.preventDefault();
          if (draft) setDraft({ ...draft, answer: DISCUSS });
          setShowNote(true);
          setFocusNote(true);
          return focusNoteSoon();
        }
        if (option) {
          e.preventDefault();
          return void save(option);
        }
        if ((t instanceof HTMLButtonElement || t.matches('a[href]')) && !clicked.current) return;
      }
      if (e.key === 'Enter' && (!typing || e.ctrlKey)) {
        e.preventDefault();
        // A locked question has nothing to save: Enter moves on, like its Next button.
        if (lock) return index === order.length - 1 ? setFinished(true) : advance(savedKeys);
        return void save();
      }
      if (typing || !qRef.current || !draft) return;
      if (e.key === 'ArrowRight') return go(index + 1);
      if (e.key === 'ArrowLeft') return go(index - 1);
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (letter === 'n') return advance(savedKeys, !lock);
      if (lock) return;
      const n = Number(e.key);
      const pick = qRef.current.options[n - 1];
      if (n >= 1 && pick) {
        setDraft({ ...draft, answer: pick.id });
        // The picked option takes the focus, so Enter saves what the screen shows as chosen.
        clicked.current = false;
        scroller.current?.querySelector<HTMLElement>(`[data-option="${CSS.escape(pick.id)}"]`)?.focus();
      }
      if (letter === 'd') {
        // The key picks the choice; it must not also land in the note that opens focused.
        e.preventDefault();
        setDraft({ ...draft, answer: DISCUSS });
        setShowNote(true);
        setFocusNote(true);
        // An open note takes the cursor now, before the next key; a new one once it is drawn.
        focusNoteSoon();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const answeredCount = order.filter((k) => handled(k, savedKeys)).length;
  // The nights this deck walked, each with its latest detail, in the deck's order.
  const deckNights = [...new Map(order.map((k) => byKey.get(k)!).filter(Boolean).map((i) => [`${i.detail.repo.id}/${i.detail.night.night}`, i.detail])).values()];
  const rec = q?.options.find((o) => o.id === q.recommended);

  return (
    <div ref={scroller} tabIndex={-1} onPointerDown={() => (clicked.current = true)} className="sky fixed inset-0 z-40 overflow-y-auto outline-none">
      <Starfield />
      <div className="relative mx-auto flex min-h-full max-w-3xl flex-col px-4 pt-6">
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
          <Gate nights={deckNights} savedNow={savedNow} onSavedNow={(k) => setSavedNow((s) => new Set(s).add(k))} onSaved={onSaved} onConflict={onConflict} onClose={onClose} back={from} onTop={() => scroller.current?.scrollTo({ top: 0 })} celebrated={celebrated} onCelebrated={() => setCelebrated(true)} />
        ) : !q || !draft || !item ? (
          <div className="my-auto text-center text-white/60">No open questions.</div>
        ) : (
          <div key={key} className="pop-in mt-8 flex flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-white/10 px-2.5 py-1 font-semibold tracking-wide uppercase">{item.detail.repo.name}</span>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-white/60">{nightTitle(item.detail.night.night)}</span>
              {q.task && <span className="rounded-full bg-eyes/20 px-2.5 py-1 font-mono font-semibold text-eyes">{q.task}</span>}
              {q.answer !== null && !lock && <span className="rounded-full bg-[var(--accent)]/20 px-2.5 py-1 text-white/80">answered; you can change it</span>}
            </div>
            {lock && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-sm text-white/85">
                <Icon name="lock" className="mt-0.5 size-4 shrink-0" strokeWidth={2.4} />
                <span>{lock}</span>
              </div>
            )}
            <h2 className="font-display mt-4 text-2xl leading-tight font-semibold sm:text-4xl">{q.ask}</h2>
            {q.why && <p className="mt-2 text-white/60 sm:text-lg">{q.why}</p>}
            {q.files && q.files.length > 0 && <QuestionFiles detail={item.detail} q={q} onView={setZoom} />}

            <div className="mt-6 grid gap-3">
              {q.options.map((o, i) => {
                const on = draft.answer === o.id;
                return (
                  <button
                    key={o.id}
                    data-option={o.id}
                    onClick={() => setDraft({ ...draft, answer: o.id })}
                    disabled={!!lock}
                    className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition ${lock ? 'cursor-not-allowed' : 'hover:bg-white/5'}`}
                    style={{ borderColor: on ? 'var(--accent)' : '#ffffff14', background: on ? 'color-mix(in srgb, var(--accent) 22%, var(--color-night-900))' : 'color-mix(in srgb, var(--color-night-800) 92%, transparent)', opacity: lock && !on ? 0.4 : 1 }}
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
                      <span className="block font-medium sm:text-lg">{o.label}</span>
                      {o.detail && <span className="block text-sm text-white/55">{o.detail}</span>}
                    </span>
                    {o.id === q.recommended && <Icon name="sparkle" className="size-4 text-moon" />}
                    {lock && on && <Icon name="lock" className="size-4 text-white/70" strokeWidth={2.4} />}
                    {!lock && <kbd className="hidden text-white/40 sm:inline">{i + 1}</kbd>}
                  </button>
                );
              })}
            </div>

            {(() => {
              const on = draft.answer === DISCUSS;
              if (lock && !on) return null;
              return (
                <button
                  data-option={DISCUSS}
                  onClick={() => {
                    setDraft({ ...draft, answer: DISCUSS });
                    setShowNote(true);
                    setFocusNote(true);
                  }}
                  disabled={!!lock}
                  className={`mt-3 flex w-full items-center gap-4 rounded-2xl border-2 border-dashed px-4 py-3 text-left transition ${lock ? 'cursor-not-allowed' : 'hover:bg-white/5'}`}
                  style={{ borderColor: on ? 'var(--color-eyes)' : '#ffffff1f', background: on ? 'color-mix(in srgb, var(--color-eyes) 14%, var(--color-night-900))' : 'transparent' }}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border-2" style={{ borderColor: on ? 'var(--color-eyes)' : '#ffffff30', background: on ? 'var(--color-eyes)' : undefined }}>
                    {on && <Icon name="check" className="size-4 text-night-950" strokeWidth={3} />}
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium">I'm not sure, let's discuss</span>
                    <span className="block text-sm text-white/55">Say what is unclear in a note; the next agent talks it through with you before any work on it.</span>
                  </span>
                  {lock && on && <Icon name="lock" className="size-4 text-white/70" strokeWidth={2.4} />}
                  {!lock && <kbd className="hidden text-white/40 sm:inline">D</kbd>}
                </button>
              );
            })()}

            {rec && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-moon/8 px-4 py-3 text-sm">
                <Icon name="sparkle" className="mt-0.5 size-4 shrink-0 text-moon" />
                <div className="flex-1">
                  <span className="text-white/70">Recommended: </span>
                  <span className="font-semibold text-moon">{rec.label}</span>
                </div>
                {!lock && <button onClick={() => setDraft({ ...draft, answer: rec.id })} className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20">use it</button>}
              </div>
            )}

            <div className="mt-4">
              {lock ? (
                q.note && <p className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/70">Your note: {q.note}</p>
              ) : showNote ? (
                <>
                <textarea ref={noteRef} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder={draft.answer === DISCUSS ? 'What is unclear, or what do you want to talk through? (needed)' : 'A note for the agent (optional)'} rows={2} className="w-full scroll-mb-52 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" autoFocus={focusNote} onFocus={(e) => { setInNote(true); e.currentTarget.scrollIntoView({ block: 'nearest' }); }} onBlur={() => setInNote(false)} />
                  <p className="mt-1 hidden text-xs text-white/40 sm:block"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> saves · <kbd>Esc</kbd> leaves the note</p>
                </>
              ) : (
                <button onClick={() => { setShowNote(true); setFocusNote(true); }} className="text-sm text-white/50 hover:text-white">+ add a note</button>
              )}
            </div>

            <footer className="sticky bottom-0 z-10 -mx-4 mt-auto border-t border-white/10 bg-night-950 px-4 py-3 sm:mt-6">
              {message && <div className="mb-2 rounded-xl bg-broken/15 px-4 py-2 text-sm text-broken">{message}</div>}
              {/* On a phone the options may be above the fold: name the answer Save would keep. */}
              {!lock && draft.answer && <div className="mb-2 truncate text-xs text-white/60 sm:hidden">Your answer: <span className="text-white/85">{answerLabel({ ...q, answer: draft.answer })}</span></div>}
              <div className="flex items-center gap-2">
              <div className="hidden gap-2 sm:flex">
                <button onClick={() => go(index - 1)} disabled={index === 0} className="moon-btn size-12 shrink-0" aria-label="Previous" title="Previous question (←)"><Icon name="left" className="size-5" strokeWidth={2.8} /></button>
                <button onClick={() => go(index + 1)} disabled={index === order.length - 1} className="moon-btn size-12 shrink-0" aria-label="Next" title="Next question (→)"><Icon name="right" className="size-5" strokeWidth={2.8} /></button>
              </div>
              <div className="flex-1" />
              <button onClick={() => (lock && index === order.length - 1 ? setFinished(true) : advance(savedKeys, !lock))} disabled={busy} className="moon-btn !inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap sm:px-5" title={lock ? 'Go to the next question' : 'Leave it unanswered; the next agent asks again'}>{lock ? (index === order.length - 1 ? 'Done' : 'Next') : 'Not now'} {!lock && <kbd className="hidden sm:inline">N</kbd>}</button>
              {!lock && (
                <button onClick={() => void save()} disabled={busy} className="rounded-full bg-[var(--accent)] px-5 py-2.5 font-semibold whitespace-nowrap text-white sm:px-6 shadow-[0_8px_30px_-8px_var(--accent)] transition hover:brightness-110 disabled:opacity-60">
                  {busy ? 'Saving…' : 'Save'} <kbd className="ml-1 hidden !border-white/40 sm:inline">{inNote ? 'Ctrl+Enter' : 'Enter'}</kbd>
                </button>
              )}
              </div>
            </footer>
          </div>
        )}
      </div>
      {zoom && <MediaViewer media={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}

// The files a question points at (TASK-30): view one here, or have the tool show it in the file
// manager, since a browser cannot open a folder on the machine.
function QuestionFiles({ detail, q, onView }: { detail: NightDetail; q: Question; onView: (m: Media) => void }) {
  const [error, setError] = useState<string | null>(null);
  const repo = detail.repo.id;
  const night = detail.night.night;
  return (
    <div className="mt-4">
      <ul className="grid gap-2">
        {(q.files ?? []).map((f, i) => {
          const src = questionFileUrl(repo, night, q.id, i);
          const viewable = mediaKind(f.path) !== 'page' || /\.html?$/i.test(f.path);
          return (
            <li key={`${f.path}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-white/10 bg-night-900/70 px-3 py-2">
              <Icon name="file" className="size-4 shrink-0 text-white/50" />
              <span className="min-w-[12rem] flex-1">
                <span className="block font-mono text-sm break-all text-white/85">{f.path}</span>
                {f.caption && <span className="block text-xs text-white/55">{f.caption}</span>}
              </span>
              <span className="flex shrink-0 gap-2">
                {viewable ? (
                  <button onClick={() => onView({ src, kind: mediaKind(f.path), title: f.caption ?? f.path })} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20">View</button>
                ) : (
                  <a href={src} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20">Open</a>
                )}
                <button
                  onClick={() => {
                    setError(null);
                    revealQuestionFile(repo, night, q.id, i).catch((e: Error) => setError(e.message));
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20"
                >
                  <Icon name="folder" className="size-3.5" /> Show in folder
                </button>
              </span>
            </li>
          );
        })}
      </ul>
      {error && <p className="mt-2 text-sm text-broken">{error}</p>}
    </div>
  );
}
