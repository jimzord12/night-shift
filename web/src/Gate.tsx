import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { isOpenQuestionIn, needsHandOver } from '../../src/types.ts';
import type { NightDetail, Task } from '../../src/types.ts';
import { createFollowUp } from './api.ts';
import { Icon, nightTitle } from './ui.tsx';

const keyOf = (d: NightDetail) => `${d.repo.id}/${d.night.night}`;
// The same tasks the follow-up takes: not done or skipped, and not an item left open elsewhere.
const unfinished = (d: NightDetail): Task[] => d.night.tasks.filter((t) => t.outcome !== 'done' && t.outcome !== 'skipped' && !(t.follow_up && t.outcome === 'not_started'));

// The end of the question deck (D24's explicit gate): for every night in the deck that is not saved
// yet, what the next agent gets and one Save for the next agent; once saved, a confirmation that
// nothing runs until the developer starts an agent, with the phrase to say.
export function Gate({ nights, onSaved, onClose }: { nights: NightDetail[]; onSaved: (d: NightDetail) => void; onClose: () => void }) {
  const [savedNow, setSavedNow] = useState<ReadonlySet<string>>(new Set());
  const closed = nights.filter((d) => d.night.status !== 'open');
  const toSave = closed.filter((d) => needsHandOver(d.night, d.follow_up));
  const justSaved = closed.filter((d) => savedNow.has(keyOf(d)) && d.follow_up);
  const earlier = closed.filter((d) => !savedNow.has(keyOf(d)) && d.follow_up);
  const allSaved = toSave.length === 0;

  useEffect(() => {
    if (!allSaved) return;
    // One short burst from the bottom corners that falls away within a second, so it never sits
    // over the text the developer has to read.
    const colors = ['#f5d76e', '#7c5cff', '#34d399', '#ffffff'];
    const burst = { particleCount: 24, spread: 55, startVelocity: 45, ticks: 90, scalar: 0.8, colors };
    confetti({ ...burst, angle: 60, origin: { x: 0, y: 1 } });
    confetti({ ...burst, angle: 120, origin: { x: 1, y: 1 } });
  }, [allSaved]);

  return (
    <div className="pop-in my-auto py-8">
      <div className="text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-[var(--accent)]/20 text-moon shadow-[0_0_60px_var(--accent)]">
          <Icon name={allSaved ? 'moon' : 'forward'} className="size-10" strokeWidth={1.8} />
        </div>
        <h2 className="font-display mt-5 text-3xl font-semibold sm:text-4xl">{allSaved ? 'All clear' : 'One step left'}</h2>
        <p className="mx-auto mt-2 max-w-xl text-white/60">
          {allSaved
            ? 'Everything you answered is saved for the next agent.'
            : `Save ${toSave.length === 1 ? 'this night' : 'these nights'} for the next agent, so your answers and the unfinished work reach them. Nothing runs until you start an agent.`}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {toSave.map((d) => (
          <SaveCard key={keyOf(d)} detail={d} onSaved={(nd) => {
            setSavedNow((s) => new Set(s).add(keyOf(nd)));
            onSaved(nd);
          }} />
        ))}
        {justSaved.map((d) => <Saved key={keyOf(d)} detail={d} />)}
        {earlier.length > 0 && (
          <p className="text-center text-sm text-white/50">
            Already saved earlier: {earlier.map((d) => d.repo.name).join(', ')}. Your answers there reach the next agent{earlier.some((d) => Object.keys(d.taken).length) ? ', unless an agent is working on them now' : ''}.
          </p>
        )}
      </div>

      <div className="mt-8 text-center">
        <button onClick={onClose} className={`rounded-full px-6 py-2.5 font-semibold ${allSaved ? 'bg-[var(--accent)] text-white shadow-lg' : 'glass text-white/80'}`}>
          {allSaved ? 'Back to the Inbox' : 'Not now, back to the Inbox'}
        </button>
      </div>
    </div>
  );
}

function SaveCard({ detail: d, onSaved }: { detail: NightDetail; onSaved: (d: NightDetail) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tasks = unfinished(d);
  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      onSaved(await createFollowUp(d.repo.id, d.night.night));
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };
  return (
    <section className="rounded-2xl border border-white/10 bg-night-900/80 p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h3 className="font-semibold">{d.repo.name}</h3>
        <span className="text-sm text-white/55">{nightTitle(d.night.night)}</span>
      </div>
      {d.night.questions.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm">
          {d.night.questions.map((q) => {
            const label = q.answer === null ? null : (q.options.find((o) => o.id === q.answer)?.label ?? q.answer);
            return (
              <li key={q.id} className="flex gap-2">
                <Icon name={label ? 'check' : 'question'} className={`mt-0.5 size-4 shrink-0 ${label ? 'text-shipped' : 'text-eyes'}`} strokeWidth={2.6} />
                <span className="min-w-0">
                  <span className="text-white/60">{q.ask}</span>{' '}
                  {label ? <span className="font-medium text-white">{label}</span> : <span className="text-eyes">{isOpenQuestionIn(q, d.follow_up) ? 'not answered: the next agent asks again' : 'settled elsewhere'}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {tasks.length > 0 && (
        <div className="mt-3 text-sm">
          <div className="text-white/50">Unfinished work it carries:</div>
          <ul className="mt-1 space-y-0.5">
            {tasks.map((t) => (
              <li key={t.id} className="text-white/80"><span className="font-mono text-white/50">{t.id}</span> {t.title} <span className="text-white/45">({(t.outcome ?? 'running').replace('_', ' ')})</span></li>
            ))}
          </ul>
        </div>
      )}
      {error && <div className="mt-3 rounded-xl bg-broken/15 px-3 py-2 text-sm text-broken">{error}</div>}
      <button onClick={() => void save()} disabled={busy} className="cta mt-4 inline-flex w-full items-center justify-center gap-2 px-5 py-3 font-semibold disabled:opacity-70 sm:w-auto">
        <Icon name="forward" className="size-4" strokeWidth={2.6} /> {busy ? 'Saving…' : 'Save for the next agent'}
      </button>
    </section>
  );
}

// What happens next, in plain words: nothing runs by itself; the phrase to say, and where.
function Saved({ detail: d }: { detail: NightDetail }) {
  return (
    <section className="pop-in rounded-2xl border border-shipped/30 bg-shipped/10 p-4 sm:p-5">
      <div className="flex items-center gap-2 font-semibold text-shipped">
        <Icon name="check" className="size-5" strokeWidth={2.8} /> Saved for the next agent: {d.repo.name}
      </div>
      <p className="mt-2 text-sm text-white/75">
        Nothing runs yet. When you want the work done, open a Claude Code session in <span className="font-mono text-xs break-all text-white/90">{d.repo.path}</span> and say one of these:
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Phrase text="start night shift" hint="tonight, unattended" />
        <Phrase text="work on the follow-up" hint="now, with you there" />
      </div>
    </section>
  );
}

function Phrase({ text, hint }: { text: string; hint: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button onClick={() => void copy()} className="flex items-center gap-3 rounded-xl border border-white/10 bg-night-950/60 px-3 py-2 text-left transition hover:border-white/25" title="Copy the phrase">
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-sm text-white">{text}</span>
        <span className="block text-xs text-white/50">{hint}</span>
      </span>
      <span className="shrink-0 text-xs font-semibold text-white/70">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}
