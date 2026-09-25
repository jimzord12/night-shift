import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Overview, QuestionEntry } from '../../src/types.ts';
import { isOpen } from '../../src/types.ts';
import { getOverview, getQuestions } from './api.ts';
import { Morning } from './Morning.tsx';
import { Starfield } from './Starfield.tsx';
import { QuestionDeck } from './QuestionDeck.tsx';
import { HistoryView, QueueView, QuestionsView } from './Views.tsx';
import { Icon, shiftTitle } from './ui.tsx';

type View = 'morning' | 'questions' | 'queue' | 'history';
const VIEWS: { id: View; label: string }[] = [
  { id: 'morning', label: 'Morning' },
  { id: 'questions', label: 'Questions' },
  { id: 'queue', label: 'Queue' },
  { id: 'history', label: 'History' },
];

export function App() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [questions, setQuestions] = useState<QuestionEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>('morning');
  const [shiftId, setShiftId] = useState<string | undefined>();
  const [deck, setDeck] = useState<{ startId?: string } | null>(null);

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    try {
      const [o, q] = await Promise.all([getOverview(refresh), getQuestions()]);
      setOverview(o);
      setQuestions(q);
      setError(null);
      document.documentElement.style.setProperty('--accent', o.project.accent ?? '#7c5cff');
      document.title = `Night Shift · ${o.project.name}`;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    // Questions change on disk while the app is open (an agent adds one): refresh on focus.
    const onFocus = () => void getQuestions().then(setQuestions).catch(() => {});
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [load]);

  const refreshQuestions = useCallback(async () => setQuestions(await getQuestions()), []);
  const saved = useCallback((entry: QuestionEntry) => setQuestions((all) => all.map((e) => (e.file === entry.file ? entry : e))), []);

  const shift = overview?.shifts.find((s) => s.id === shiftId) ?? overview?.shifts[0];
  const openCount = questions.filter((e) => e.question && isOpen(e.question)).length;

  return (
    <div className="sky min-h-screen">
      <Starfield />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <header className="flex flex-wrap items-center gap-4 py-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-moon/15 text-moon shadow-[0_0_24px_#f5d76e55]">
              <Icon name="moon" className="size-5" strokeWidth={2.2} />
            </span>
            <div>
              <div className="font-display text-lg leading-tight font-semibold">Night Shift</div>
              <div className="text-xs text-white/50">{overview ? overview.project.name : '…'}</div>
            </div>
          </div>
          <nav className="glass flex rounded-full p-1">
            {VIEWS.map((v) => (
              <button key={v.id} onClick={() => setView(v.id)} className={`relative rounded-full px-4 py-1.5 text-sm transition ${view === v.id ? 'bg-[var(--accent)] font-semibold text-white shadow' : 'text-white/65 hover:text-white'}`}>
                {v.label}
                {v.id === 'questions' && openCount > 0 && <span className="ml-1.5 rounded-full bg-eyes px-1.5 text-[13px] font-bold text-night-950">{openCount}</span>}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-xs text-white/40">
            {shift && view === 'morning' && overview && overview.shifts.length > 1 && (
              <select value={shift.id} onChange={(e) => setShiftId(e.target.value)} className="glass rounded-full px-3 py-1.5 text-sm text-white outline-none">
                {overview.shifts.map((s) => <option key={s.id} value={s.id} className="bg-night-900">{shiftTitle(s.id)}</option>)}
              </select>
            )}
            <span className="hidden sm:inline">{overview?.version}</span>
            <button onClick={() => void load(true)} className="glass rounded-full p-2 text-white/70 hover:text-white" title="Reload from the board">
              <Icon name="refresh" className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {error && <Banner tone="error">{error}</Banner>}
        {overview?.boardError && <Banner tone="warn">The board could not be read: {overview.boardError}. Questions still work.</Banner>}

        {overview && (
          <main className="mt-4">
            {view === 'morning' && <Morning overview={overview} shift={shift} questions={questions} onOpenDeck={(id) => setDeck({ startId: id })} onShowQueue={() => setView('queue')} />}
            {view === 'questions' && <QuestionsView entries={questions} onOpen={(id) => setDeck({ startId: id })} />}
            {view === 'queue' && <QueueView overview={overview} />}
            {view === 'history' && <HistoryView shifts={overview.shifts} selected={shift?.id} onPick={(id) => { setShiftId(id); setView('morning'); }} />}
          </main>
        )}
        {!overview && !error && <div className="py-32 text-center text-white/40">Loading the night…</div>}
      </div>
      {deck && <QuestionDeck entries={questions} startId={deck.startId} onClose={() => setDeck(null)} onSaved={saved} onConflict={refreshQuestions} />}
    </div>
  );
}

function Banner({ tone, children }: { tone: 'error' | 'warn'; children: ReactNode }) {
  return <div className={`mb-4 rounded-2xl px-4 py-3 text-sm ${tone === 'error' ? 'bg-blocked/15 text-blocked' : 'bg-eyes/15 text-eyes'}`}>{children}</div>;
}
