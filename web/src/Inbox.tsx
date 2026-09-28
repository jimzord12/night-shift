import type { ReactNode } from 'react';
import type { NightSummary, Overview } from '../../src/types.ts';
import { OUTCOMES, morningEstimate, neverStarted, ownerState, ownersTurn, readable } from '../../src/types.ts';
import { Icon, NightBadge, STATUS, StoppedEarly, nightTitle } from './ui.tsx';
import { HowItWorks } from './Explainer.tsx';
import { StepTrack } from './StepTrack.tsx';

interface Props {
  overview: Overview;
  // The nights that were not done when the Viewer loaded, with their live state (fixed at load, so a
  // night does not vanish while the developer works on it).
  inbox: NightSummary[];
  // Open follow-up items across repositories: what the next night picks up.
  scheduled: number;
  // Every open question across nights is loaded and ready for the deck.
  questionsReady: boolean;
  // Nights with open questions whose detail could not be loaded: left out of the deck, named here.
  unloaded: { repo: string; night: string; count: number }[];
  onReload: () => void;
  onOpen: (repo: string, night: string) => void;
  onAnswer: (repo: string, night: string) => void;
  onStartMorning: () => void;
  onNext: () => void;
  onHistory: () => void;
}

const repoName = (o: Overview, id: string) => o.repos.find((r) => r.id === id)?.name ?? id;
// A card is a night that is running or the developer's turn; the rest sit in the slim strip (D24).
const isCard = (n: NightSummary) => readable(n) && (ownerState(n) === 'running' || ownersTurn(ownerState(n)));

// The Inbox (D24): what needs the developer at a glance, then one card per night that is running or
// theirs, then the nights waiting for an agent or settled. No night opens until it is picked.
export function Inbox({ overview, inbox, scheduled, questionsReady, unloaded, onReload, onOpen, onAnswer, onStartMorning, onNext, onHistory }: Props) {
  if (!overview.nights.length) return <Empty />;
  const now = Date.now();
  const cards = inbox.filter(isCard);
  const strip = inbox.filter((n) => !isCard(n));
  const questions = overview.nights.reduce((sum, n) => sum + n.questions_open, 0);
  // What Start my morning can actually walk: the questions of the nights that loaded.
  const missing = unloaded.reduce((sum, u) => sum + u.count, 0);
  const reachable = questions - missing;
  const failedKeys = new Set(unloaded.map((u) => `${u.repo}/${u.night}`));
  const questionRepos = new Set(overview.nights.filter((n) => n.questions_open > 0 && !failedKeys.has(`${n.repo}/${n.id}`)).map((n) => n.repo)).size;
  const estimate = morningEstimate(overview.nights.filter((n) => !failedKeys.has(`${n.repo}/${n.id}`)));
  const yours = inbox.filter((n) => readable(n) && ownersTurn(ownerState(n))).length;
  const last = overview.nights[0];

  return (
    <div className="space-y-6">
      <section aria-label="At a glance" className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat value={questions} label={questions === 1 ? 'question for you' : 'questions for you'} color="var(--color-eyes)" onClick={reachable && questionsReady ? onStartMorning : undefined} />
        <Stat value={yours} label={yours === 1 ? 'night needs you' : 'nights need you'} color="var(--color-eyes)" />
        <Stat value={scheduled} label="for the next night" color="var(--color-agent)" onClick={onNext} />
      </section>

      {reachable > 0 && (
        <button onClick={onStartMorning} disabled={!questionsReady} className="cta cta-block flex w-full flex-col items-center justify-center gap-x-3 gap-y-0.5 px-6 py-3.5 text-lg disabled:opacity-70 lg:flex-row lg:py-4">
          <span className="cta-shine" />
          <Icon name="sparkle" className="size-5 text-moon drop-shadow-[0_0_6px_#f5d76e]" strokeWidth={2.2} />
          <span className={`font-semibold ${questionsReady ? 'whitespace-nowrap' : ''}`}>{questionsReady ? 'Start my morning' : 'Getting the questions…'}</span>
          <span className="text-sm text-white/80 sm:text-base">
            {reachable} question{reachable === 1 ? '' : 's'}{questionRepos > 1 ? ` in ${questionRepos} repositories` : ''}
            {estimate.saves > 0 && `, ${estimate.saves} save${estimate.saves === 1 ? '' : 's'}`}
            {/* Its own line when the button stacks; after a dot when it is one row. */}
            <span className="block whitespace-nowrap lg:inline"><span className="hidden lg:inline"> · </span>about {estimate.minutes} min</span>
          </span>
        </button>
      )}
      {unloaded.length > 0 && (
        <p role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-broken/15 px-4 py-3 text-sm text-broken">
          <span>
            {[...new Set(unloaded.map((u) => repoName(overview, u.repo)))].join(', ')} could not be loaded, so {missing} question{missing === 1 ? ' is' : 's are'} not in Start my morning.
          </span>
          <button onClick={onReload} className="rounded-full border border-broken/40 bg-broken/15 px-3 py-0.5 font-semibold hover:bg-broken/25">Reload</button>
        </p>
      )}

      {cards.length > 0 ? (
        <Section title="Nights">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((n, i) => (
              <NightCard key={`${n.repo}/${n.id}`} n={n} now={now} name={repoName(overview, n.repo)} delay={i * 50} onOpen={() => onOpen(n.repo, n.id)} onAnswer={() => onAnswer(n.repo, n.id)} />
            ))}
          </div>
        </Section>
      ) : (
        <CaughtUp onLast={() => onOpen(last.repo, last.id)} onHistory={onHistory} />
      )}

      {strip.length > 0 && (
        <Section title="Waiting for an agent or settled">
          <ul className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {strip.map((n) => (
              <li key={`${n.repo}/${n.id}`}>
                <button onClick={() => onOpen(n.repo, n.id)} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-left transition hover:bg-white/5">
                  <span className="font-semibold">{repoName(overview, n.repo)}</span>
                  <span className="text-white/55">{nightTitle(n.id, true)}</span>
                  <NightBadge n={n} now={now} small />
                  <span className="ml-auto hidden sm:block"><StoppedEarly count={neverStarted(n)} short /></span>
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

// A page section: a small heading over its content, so the hierarchy reads at a glance.
export function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-semibold tracking-widest text-white/55 uppercase">{title}</h2>
        {aside && <span className="text-sm text-white/45">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function Stat({ value, label, color, onClick }: { value: number; label: string; color: string; onClick?: () => void }) {
  const body = (
    <>
      <span className="block text-3xl leading-none font-bold sm:text-4xl" style={{ color: value ? `color-mix(in srgb, ${color} 80%, white)` : 'rgb(255 255 255 / 0.35)' }}>{value}</span>
      <span className="mt-1.5 block text-[13px] leading-snug text-white/65 sm:text-sm">{label}</span>
    </>
  );
  const cls = 'glass rounded-2xl px-3 py-3 text-left sm:px-5 sm:py-4';
  return onClick ? <button onClick={onClick} className={`${cls} transition hover:bg-white/10`}>{body}</button> : <div className={cls}>{body}</div>;
}

// One night, big: its repository, date and state, a one-line result, and the one next step.
function NightCard({ n, now, name, delay, onOpen, onAnswer }: { n: NightSummary; now: number; name: string; delay: number; onOpen: () => void; onAnswer: () => void }) {
  const state = ownerState(n);
  const step =
    state === 'needs_answers' && n.questions_open === 0 ? { label: 'Talk it through', act: onOpen }
      : state === 'needs_answers' ? { label: `Answer ${n.questions_open} question${n.questions_open === 1 ? '' : 's'}`, act: onAnswer }
      : state === 'ready_to_save' ? { label: 'Save for the next agent', act: onOpen }
        : state === 'running' ? { label: 'Watch it run', act: onOpen }
          : { label: 'Read the report', act: onOpen };
  const counts = OUTCOMES.filter((o) => n.counts[o] > 0);
  return (
    <article className="glass pop-in flex min-w-0 cursor-pointer flex-col gap-3 rounded-3xl p-5 transition hover:-translate-y-0.5 hover:bg-white/10" style={{ animationDelay: `${delay}ms` }} onClick={onOpen}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-display text-xl font-semibold" title={name}>{name}</div>
          <div className="text-sm text-white/55">{nightTitle(n.id)}</div>
        </div>
        <NightBadge n={n} now={now} />
      </div>
      <StepTrack state={state} small />
      <p className="line-clamp-2 text-white/80">{n.summary ?? (n.running ? 'Working through the plan…' : 'No summary.')}</p>
      {counts.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {counts.map((o) => <span key={o} style={{ color: STATUS[o].color }}>{n.counts[o]} {STATUS[o].label.toLowerCase()}</span>)}
        </div>
      )}
      <StoppedEarly count={neverStarted(n)} />
      <button
        onClick={(e) => {
          e.stopPropagation();
          step.act();
        }}
        className="mt-auto inline-flex max-w-full items-center justify-center gap-2 self-start rounded-full bg-[var(--accent)] px-4 py-2 text-left font-semibold text-white transition hover:brightness-110"
      >
        {step.label} <Icon name="right" className="size-4" strokeWidth={2.6} />
      </button>
    </article>
  );
}

function CaughtUp({ onLast, onHistory }: { onLast: () => void; onHistory: () => void }) {
  return (
    <div className="glass pop-in flex flex-col items-center gap-3 rounded-3xl px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-shipped/15 text-shipped">
        <Icon name="check" className="size-6" strokeWidth={2.6} />
      </span>
      <div className="font-display text-2xl font-semibold">All caught up</div>
      <p className="max-w-md text-white/60">Every night is read, every question answered, and the unfinished work saved for the next agent.</p>
      <div className="mt-1 flex flex-wrap justify-center gap-2">
        <button onClick={onLast} className="rounded-full bg-[var(--accent)] px-5 py-2 font-semibold text-white transition hover:brightness-110">Open the last night</button>
        <button onClick={onHistory} className="glass rounded-full px-5 py-2 text-white/80 transition hover:bg-white/10">History</button>
      </div>
    </div>
  );
}

// The first run: how the loop works, then how to start the first night.
function Empty() {
  return (
    <div className="grid gap-6">
      <section className="glass rounded-3xl p-5 sm:p-8">
        <HowItWorks autoplay />
      </section>
      <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 py-10 text-center text-white/55">
        <div className="font-display text-xl font-semibold text-white/80">No nights yet</div>
        <p className="mt-2 max-w-md px-4">Run <code className="rounded bg-white/10 px-1.5">night-shift install</code> in a repository, then tell an agent there: “start night shift”. Its nights appear here.</p>
      </div>
    </div>
  );
}
