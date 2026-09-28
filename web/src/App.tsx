import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { followUpOpen, inMorning, isOpenQuestionIn, needsHandOver, readable } from '../../src/types.ts';
import type { NextNight, NightDetail, Overview } from '../../src/types.ts';
import { getNextNight, getNight, getOverview, markRead } from './api.ts';
import { Inbox } from './Inbox.tsx';
import { ReportPage } from './Report.tsx';
import { Starfield } from './Starfield.tsx';
import { QuestionDeck, deckKey } from './QuestionDeck.tsx';
import type { DeckItem } from './QuestionDeck.tsx';
import { HistoryView, NextNightView } from './Views.tsx';
import { Icon } from './ui.tsx';

// Every page has its own address, so the browser's Back works: #/ the Inbox, #/next, #/history,
// and #/night/<repo>/<night> for one Night Report (D24, D26).
type Route = { page: 'inbox' } | { page: 'next' } | { page: 'history' } | { page: 'night'; key: string };
function parseRoute(hash: string): Route {
  const m = /^#\/night\/([^/]+)\/([^/]+)$/.exec(hash);
  if (m) {
    try {
      return { page: 'night', key: `${decodeURIComponent(m[1])}/${decodeURIComponent(m[2])}` };
    } catch {
      return { page: 'inbox' };
    }
  }
  return hash === '#/next' ? { page: 'next' } : hash === '#/history' ? { page: 'history' } : { page: 'inbox' };
}
const TABS: { page: 'inbox' | 'next' | 'history'; hash: string; label: string; short?: string }[] = [
  { page: 'inbox', hash: '#/', label: 'Inbox' },
  { page: 'next', hash: '#/next', label: 'Next night', short: 'Next' },
  { page: 'history', hash: '#/history', label: 'History' },
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
  // The Inbox's list is fixed at load, so a night does not vanish while the developer works on it;
  // each entry still shows its live state.
  const inbox = useMemo(() => (loaded && overview ? overview.nights.filter((_, i) => inMorning(loaded.nights[i])) : []), [loaded, overview]);
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const go = (hash: string) => {
    if (window.location.hash === hash || (hash === '#/' && !window.location.hash)) return;
    window.location.hash = hash;
  };
  const selected = route.page === 'night' ? route.key : null;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  // The night whose detail could not be loaded; its error shows on its page, until the developer
  // leaves it. Loads in flight and failed ones are remembered, so a night is not fetched twice.
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [failedLoads, setFailedLoads] = useState<ReadonlySet<string>>(new Set());
  const inFlight = useRef(new Set<string>());
  const loadNight = useCallback(async (repo: string, night: string, force = false) => {
    const key = keyOf(repo, night);
    if (inFlight.current.has(key) && !force) return;
    inFlight.current.add(key);
    try {
      putDetail(await getNight(repo, night));
      setFailedLoads((s) => (s.has(key) ? new Set([...s].filter((k) => k !== key)) : s));
    } catch (e) {
      setFailedKey(key);
      setFailedLoads((s) => new Set(s).add(key));
      setError(`${repo}: ${(e as Error).message}`);
    } finally {
      inFlight.current.delete(key);
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
      setFailedLoads(new Set());
      document.title = 'Night Shift';
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
    if (!selected || details[selected] || failedLoads.has(selected)) return;
    const [repo, night] = selected.split('/');
    void loadNight(repo, night);
  }, [selected, details, failedLoads, loadNight]);
  // Leaving the night that failed takes its error with it.
  useEffect(() => {
    if (failedKey && selected !== failedKey) {
      setError(null);
      setFailedKey(null);
    }
  }, [selected, failedKey]);
  useEffect(() => {
    if (!selected || !overview?.nights.some((n) => keyOf(n.repo, n.id) === selected && !n.read)) return;
    const [repo, night] = selected.split('/');
    setSeen((s) => new Set(s).add(selected));
    void markRead(repo, night).catch(() => {});
  }, [selected, overview]);

  // The Inbox's Start my morning needs every night that still has open questions.
  useEffect(() => {
    if (route.page !== 'inbox' || !overview) return;
    for (const n of overview.nights) if (n.questions_open > 0 && readable(n) && !details[keyOf(n.repo, n.id)] && !failedLoads.has(keyOf(n.repo, n.id))) void loadNight(n.repo, n.id);
  }, [route.page, overview, details, failedLoads, loadNight]);

  const allItems = useMemo<DeckItem[]>(
    () => Object.values(details).flatMap((d) => d.night.questions.map((q) => ({ key: deckKey(d, q), detail: d, question: q }))),
    [details],
  );
  useEffect(() => {
    if (route.page === 'next') loadNext();
  }, [route.page, loadNext]);
  const nextCount = next?.repos.reduce((sum, r) => sum + r.items.length, 0) ?? 0;
  // Amber when an item still needs the developer's answer: their turn (D24).
  const nextWaits = !!next?.repos.some((r) => r.items.some((i) => i.item.kind === 'waiting'));
  const detail = selected ? (details[selected] ?? null) : null;
  const summary = selected ? (overview?.nights.find((n) => keyOf(n.repo, n.id) === selected) ?? null) : null;
  // Every open question across nights: what Start my morning walks through.
  const openItems = allItems.filter((i) => isOpenQuestionIn(i.question, i.detail.follow_up));
  // A night whose load failed is left out rather than holding the button back.
  const questionsReady = !!overview && overview.nights.every((n) => !n.questions_open || !readable(n) || !!details[keyOf(n.repo, n.id)] || failedLoads.has(keyOf(n.repo, n.id)));

  // A night opens on its own page, at the top.
  const pick = (repo: string, night: string) => {
    if (keyOf(repo, night) !== failedKey) {
      setError(null);
      setFailedKey(null);
    }
    go(`#/night/${encodeURIComponent(repo)}/${encodeURIComponent(night)}`);
  };
  const openDeck = (items: DeckItem[], startKey?: string) => items.length && setDeck({ items, startKey });
  const nightItems = (key: string | null) => (key ? allItems.filter((i) => keyOf(i.detail.repo.id, i.detail.night.night) === key) : []);
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
          <nav className="glass order-last flex w-full justify-between rounded-full p-1 sm:order-none sm:w-auto sm:justify-start">
            {TABS.map((t) => (
              <a key={t.page} href={t.hash} aria-current={route.page === t.page ? 'page' : undefined} className={`relative flex-auto rounded-full px-3 py-1.5 text-center text-sm whitespace-nowrap transition sm:flex-none sm:px-4 ${route.page === t.page ? 'bg-[var(--accent)] font-semibold text-white shadow' : 'text-white/65 hover:text-white'}`}>
                <span className="sm:hidden">{t.short ?? t.label}</span>
                <span className="hidden sm:inline">{t.label}</span>
                {t.page === 'next' && nextCount > 0 && <span className={`ml-1.5 rounded-full px-1.5 text-[13px] font-bold text-night-950 ${nextWaits ? 'bg-eyes' : 'bg-agent'}`}>{nextCount}</span>}
              </a>
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
            {route.page === 'inbox' && (
              <Inbox
                overview={overview}
                inbox={inbox}
                scheduled={nextCount}
                questionsReady={questionsReady}
                onOpen={pick}
                onAnswer={(repo, night) => {
                  const items = nightItems(keyOf(repo, night));
                  if (items.length) openDeck(items, items.find((i) => isOpenQuestionIn(i.question, i.detail.follow_up))?.key);
                  else pick(repo, night);
                }}
                onStartMorning={() => openDeck(openItems)}
                onNext={() => go('#/next')}
                onHistory={() => go('#/history')}
              />
            )}
            {route.page === 'night' && (
              <ReportPage detail={detail} summary={summary} picking={!detail} failed={selected === failedKey} onBack={() => go('#/')} onDetail={putDetail} onOpenDeck={(startKey) => openDeck(nightItems(selected), startKey)} />
            )}
            {route.page === 'next' && <NextNightView next={next} onPick={pick} />}
            {route.page === 'history' && <HistoryView overview={overview} selected={selected ?? undefined} onPick={pick} />}
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
          onConflict={async (repo, night) => loadNight(repo, night, true)}
        />
      )}
    </div>
  );
}

function Banner({ children }: { children: ReactNode }) {
  return <div className="mb-4 rounded-2xl bg-broken/15 px-4 py-3 text-sm text-broken">{children}</div>;
}
