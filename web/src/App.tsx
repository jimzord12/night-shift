import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { followUpOpen, inMorning, isOpenQuestionIn, needsHandOver, ownerState, ownersTurn, readable } from '../../src/types.ts';
import type { NextNight, NightDetail, Overview } from '../../src/types.ts';
import { getNextNight, getNight, getOverview, markRead } from './api.ts';
import { Morning } from './Morning.tsx';
import { Starfield } from './Starfield.tsx';
import { QuestionDeck, deckKey } from './QuestionDeck.tsx';
import type { DeckItem } from './QuestionDeck.tsx';
import { HistoryView, NextNightView, QuestionsView, TrendsView } from './Views.tsx';
import { Icon } from './ui.tsx';

type View = 'morning' | 'next' | 'questions' | 'history' | 'trends';
const VIEWS: { id: View; label: string }[] = [
  { id: 'morning', label: 'Morning' },
  { id: 'next', label: 'Next night' },
  { id: 'questions', label: 'Questions' },
  { id: 'history', label: 'History' },
  { id: 'trends', label: 'Trends' },
];

const keyOf = (repo: string, night: string) => `${repo}/${night}`;

export function App() {
  const [loaded, setOverview] = useState<Overview | null>(null);
  const [details, setDetails] = useState<Record<string, NightDetail>>({});
  // Nights opened since the last load; they count as read at once.
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set());
  // The overview as loaded, with each night's counts taken from its detail once the detail is here,
  // so an answer saved in the deck or a follow-up updates the badges without a reload.
  const overview = useMemo<Overview | null>(() => {
    if (!loaded) return null;
    const nights = loaded.nights.map((n) => {
      const key = keyOf(n.repo, n.id);
      const d = details[key];
      const live = { ...n, read: n.read || seen.has(key) };
      return d
        ? {
            ...live,
            questions_open: d.night.questions.filter((q) => isOpenQuestionIn(q, d.follow_up)).length,
            feedback_unsent: d.night.feedback.filter((f) => !f.sent).length,
            // A follow-up file the server found but could not read still counts as handed over.
            follow_up: n.follow_up || !!d.follow_up,
            hand_over: !n.follow_up && needsHandOver(d.night, d.follow_up),
            follow_up_open: d.follow_up ? followUpOpen(d.follow_up) : n.follow_up_open,
            follow_up_at: d.follow_up?.created_at ?? n.follow_up_at,
          }
        : live;
    });
    return { ...loaded, nights };
  }, [loaded, details, seen]);
  // Morning's list is fixed at load, so a night does not vanish while the developer works on it;
  // each entry still shows its live state.
  const inbox = useMemo(() => (loaded && overview ? overview.nights.filter((_, i) => inMorning(loaded.nights[i])) : []), [loaded, overview]);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>('morning');
  const [deck, setDeck] = useState<{ items: DeckItem[]; startKey?: string } | null>(null);

  // What the next night in each repository will pick up; fetched with the overview and whenever the
  // tab opens.
  const [next, setNext] = useState<NextNight | null>(null);
  const loadNext = useCallback(() => {
    getNextNight().then(setNext, (e: Error) => setError(e.message));
  }, []);
  // A saved answer or a new follow-up changes what the next night picks up.
  const putDetail = useCallback((d: NightDetail) => {
    setDetails((all) => ({ ...all, [keyOf(d.repo.id, d.night.night)]: d }));
    if (d.follow_up) loadNext();
  }, [loadNext]);

  // The night whose detail could not be loaded; its error shows until another night is picked.
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const loadNight = useCallback(async (repo: string, night: string) => {
    try {
      putDetail(await getNight(repo, night));
    } catch (e) {
      setFailedKey(keyOf(repo, night));
      setError(`${repo}: ${(e as Error).message}`);
    }
  }, [putDetail]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const o = await getOverview();
      setOverview(o);
      loadNext();
      setDetails({});
      setSeen(new Set());
      setError(null);
      setFailedKey(null);
      document.title = 'Night Shift';
      setSelected((current) => {
        if (current && o.nights.some((n) => keyOf(n.repo, n.id) === current && readable(n))) return current;
        // Morning opens on the newest night that is the developer's turn, else the newest running one;
        // none means all caught up.
        // A night file that cannot be read has nothing to open.
        const openable = o.nights.filter(readable);
        const first = openable.find((n) => ownersTurn(ownerState(n))) ?? openable.find((n) => ownerState(n) === 'running');
        return first ? keyOf(first.repo, first.id) : null;
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [loadNext]);

  useEffect(() => {
    void load();
  }, [load]);

  // The chosen night: load it once, and mark it read.
  useEffect(() => {
    if (!selected || details[selected]) return;
    const [repo, night] = selected.split('/');
    void loadNight(repo, night);
  }, [selected, details, loadNight]);
  useEffect(() => {
    if (!selected || !overview?.nights.some((n) => keyOf(n.repo, n.id) === selected && !n.read)) return;
    const [repo, night] = selected.split('/');
    setSeen((s) => new Set(s).add(selected));
    void markRead(repo, night).catch(() => {});
  }, [selected, overview]);

  // The Questions view needs every night that still has open questions.
  useEffect(() => {
    if (view !== 'questions' || !overview) return;
    for (const n of overview.nights) if (n.questions_open > 0 && !details[keyOf(n.repo, n.id)]) void loadNight(n.repo, n.id);
  }, [view, overview, details, loadNight]);

  const allItems = useMemo<DeckItem[]>(
    () => Object.values(details).flatMap((d) => d.night.questions.map((q) => ({ key: deckKey(d, q), detail: d, question: q }))),
    [details],
  );
  useEffect(() => {
    if (view === 'next') loadNext();
  }, [view, loadNext]);
  const nextCount = next?.repos.reduce((sum, r) => sum + r.items.length, 0) ?? 0;
  const openCount = overview?.nights.reduce((sum, n) => sum + n.questions_open, 0) ?? 0;
  const detail = selected ? (details[selected] ?? null) : null;

  // A night opens at the top of its report, wherever the list was scrolled.
  const pick = (repo: string, night: string) => {
    if (keyOf(repo, night) !== failedKey) {
      setError(null);
      setFailedKey(null);
    }
    setSelected(keyOf(repo, night));
    setView('morning');
    window.scrollTo(0, 0);
  };
  const openDeck = (items: DeckItem[], startKey?: string) => items.length && setDeck({ items, startKey });
  const nightItems = (d: NightDetail | null) => (d ? allItems.filter((i) => i.detail.repo.id === d.repo.id && i.detail.night.night === d.night.night) : []);
  // The deck reads the latest details, so a saved answer updates the file hash for the next save.
  const deckItems = deck ? deck.items.map((i) => allItems.find((x) => x.key === i.key) ?? i) : [];

  return (
    <div className="sky min-h-screen">
      <Starfield />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <header className="flex flex-wrap items-center gap-3 py-4 sm:gap-4 sm:py-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-moon/15 text-moon shadow-[0_0_24px_#f5d76e55]">
              <Icon name="moon" className="size-5" strokeWidth={2.2} />
            </span>
            <div>
              <div className="font-display text-lg leading-tight font-semibold">Night Shift</div>
              <div className="hidden text-xs text-white/50 sm:block">{overview ? `${overview.repos.filter((r) => !r.missing).length} repositor${overview.repos.length === 1 ? 'y' : 'ies'}` : '…'}</div>
            </div>
          </div>
          <nav className="glass order-last flex w-full justify-between overflow-x-auto rounded-full p-1 [scrollbar-width:none] sm:order-none sm:w-auto sm:justify-start">
            {VIEWS.map((v) => (
              <button key={v.id} onClick={() => setView(v.id)} className={`relative shrink-0 flex-auto rounded-full px-2 py-1.5 text-[13px] whitespace-nowrap transition sm:flex-none sm:px-4 sm:text-sm ${view === v.id ? 'bg-[var(--accent)] font-semibold text-white shadow' : 'text-white/65 hover:text-white'}`}>
                {v.label}
                {v.id === 'next' && nextCount > 0 && <span className="ml-1 rounded-full bg-agent px-1.5 text-[13px] font-bold text-night-950 sm:ml-1.5">{nextCount}</span>}
                {v.id === 'questions' && openCount > 0 && <span className="ml-1 rounded-full bg-eyes px-1.5 sm:ml-1.5 text-[13px] font-bold text-night-950">{openCount}</span>}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-xs text-white/40">
            <span className="hidden sm:inline">{overview?.version}</span>
            <button onClick={() => void load()} className="glass rounded-full p-2 text-white/70 hover:text-white" title="Reload the nights" aria-label="Reload the nights">
              <Icon name="refresh" className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {error && <Banner>{error}</Banner>}

        {overview && (
          <main className="mt-4">
            {view === 'morning' && <Morning overview={overview} inbox={inbox} detail={detail} selected={selected} picking={!!selected && !detail} failed={!!selected && selected === failedKey} onPick={pick} onHistory={() => setView('history')} onDetail={putDetail} onOpenDeck={(startKey) => openDeck(nightItems(detail), startKey)} />}
            {view === 'questions' && <QuestionsView items={allItems.filter((i) => isOpenQuestionIn(i.question, i.detail.follow_up) || overview.nights.some((n) => n.questions_open > 0 && keyOf(n.repo, n.id) === keyOf(i.detail.repo.id, i.detail.night.night)))} loading={loading} onOpen={(key) => openDeck(allItems, key)} />}
            {view === 'next' && <NextNightView next={next} onPick={pick} />}
            {view === 'history' && <HistoryView overview={overview} selected={selected ?? undefined} onPick={pick} />}
            {view === 'trends' && <TrendsView />}
          </main>
        )}
        {!overview && !error && <div className="py-32 text-center text-white/40">Loading the nights…</div>}
      </div>
      {deck && (
        <QuestionDeck
          items={deckItems}
          startKey={deck.startKey}
          onClose={() => setDeck(null)}
          onSaved={putDetail}
          onConflict={async (repo, night) => loadNight(repo, night)}
        />
      )}
    </div>
  );
}

function Banner({ children }: { children: ReactNode }) {
  return <div className="mb-4 rounded-2xl bg-broken/15 px-4 py-3 text-sm text-broken">{children}</div>;
}
