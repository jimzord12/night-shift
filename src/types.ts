// The file shapes of a night (docs/design.md) and what the Viewer's API sends. Types and small
// pure helpers only: the web app imports this file too.

export const OUTCOMES = ['done', 'partial', 'blocked', 'failed', 'not_started', 'skipped'] as const;
export type Outcome = (typeof OUTCOMES)[number];

export const BLOCK_TYPES = ['image', 'compare', 'video', 'pdf', 'link', 'command', 'note'] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

// Proof and notes come only from these (the fixed vocabulary). Paths are relative to the night's
// folder and must lie inside its evidence/ folder.
export type Block =
  | { type: 'image'; path: string; caption?: string }
  | { type: 'compare'; before: string; after: string; caption?: string }
  | { type: 'video'; path: string; caption?: string }
  | { type: 'pdf'; path: string; caption?: string }
  | { type: 'link'; url: string; label?: string }
  | { type: 'command'; command: string; exit_code: number; excerpt: string }
  | { type: 'note'; text: string };

// Version 2 of the three shapes (D24, TASK-29): a `discuss` answer and follow-up item, file
// references on questions, and a task that follows several follow-up items. Version 1 files stay
// valid and are read as they are; new files are written as version 2.
export const PLAN_SCHEMA = 'night-shift/plan@2';
export const NIGHT_SCHEMA = 'night-shift/night@2';
export const FOLLOW_UP_SCHEMA = 'night-shift/follow-up@2';

// "<follow-up id>/<item id>", or a list of them when one task carries several items forward.
export type FollowUpRefs = string | string[];
export const refsOf = (t: { follow_up?: FollowUpRefs }): string[] => (t.follow_up === undefined ? [] : Array.isArray(t.follow_up) ? t.follow_up : [t.follow_up]);

// The answer that says "I'm not sure, let's discuss": it needs a note, and it becomes a `discuss`
// follow-up item that no unattended night acts on.
export const DISCUSS = 'discuss';

export interface PlanTask {
  id: string;
  title: string;
  source: string;
  done_when: string[];
  follow_up?: FollowUpRefs;
}

export interface SkippedFollowUp {
  follow_up: string;
  reason: string;
}

// What the agent hands to `night-shift start`.
export interface PlanInput {
  schema: 'night-shift/plan@1' | 'night-shift/plan@2';
  tasks: PlanTask[];
  skipped_follow_ups?: SkippedFollowUp[];
}

// The stored plan: the input plus what the tool adds.
export interface Plan extends PlanInput {
  night: string;
  started_at: string;
}

export interface Check {
  done_when: string;
  met: boolean;
  note?: string;
}

export interface Task {
  id: string;
  title: string;
  source?: string;
  follow_up?: FollowUpRefs;
  unplanned?: true;
  done_when: string[];
  outcome: Outcome | null;
  checks: Check[];
  evidence: Block[];
  blocked_by?: string;
  why?: string;
  reason?: string;
  recorded_at?: string;
}

export interface Option {
  id: string;
  label: string;
  detail?: string;
  image?: string;
}

export interface Question {
  id: string;
  task: string | null;
  ask: string;
  why?: string;
  options: Option[];
  recommended: string;
  // Files in the repository the question is about, shown to the developer with Show in folder.
  files?: QuestionFile[];
  // Written by the Viewer only: an option id, DISCUSS (with a note), or null.
  answer: string | null;
  note: string | null;
  answered_at?: string;
}

export interface QuestionFile {
  // Relative to the repository root, inside it.
  path: string;
  caption?: string;
}

export interface FeedbackSent {
  at: string;
  via: 'gh' | 'link';
  url?: string;
}

export interface Feedback {
  id: string;
  kind: string;
  title: string;
  tags: string[];
  body: string;
  // Written by the Viewer only.
  sent: FeedbackSent | null;
}

export interface ModelUsage {
  tokens: { input: number | null; output: number | null; reasoning: number | null; cache_read: number | null; cache_write: number | null };
  cost_usd: number | null;
}

// Measured from the harness, never claimed by the agent. Anything the harness did not provide is null
// and shows as "unknown".
export interface Metrics {
  source: 'claude-code';
  harness_version: string | null;
  session_id: string | null;
  measured_at: string;
  duration_min: { total: number | null; model: number | null; tools: number | null };
  models: Record<string, ModelUsage>;
  cost_usd: number | null;
  sub_agents: { type: string | null; model: string | null; purpose: string | null }[];
  lines: { added: number | null; removed: number | null };
}

export interface Session {
  harness: 'claude-code';
  id: string;
  pid: number | null;
  transcript: string | null;
}

export type NightStatus = 'open' | 'complete' | 'interrupted';

export interface Night {
  schema: 'night-shift/night@1' | 'night-shift/night@2';
  night: string;
  status: NightStatus;
  started_at: string;
  ended_at: string | null;
  summary: string | null;
  session: Session | null;
  tasks: Task[];
  skipped_follow_ups: SkippedFollowUp[];
  questions: Question[];
  feedback: Feedback[];
  metrics: Metrics | null;
}

// carried: a night took the item on as a task; that task's outcome is the item's fate now.
export type ItemStatus = 'open' | 'done' | 'skipped' | 'carried';
// discuss: the developer wants to talk it through; only a day session with them works on it.
export type ItemKind = 'decision' | 'unfinished' | 'waiting' | 'discuss';

export interface FollowUpItem {
  id: string;
  status: ItemStatus;
  kind: ItemKind;
  task: string | null;
  title: string;
  question?: string;
  decision?: string;
  decision_label?: string;
  owner_note?: string;
  left?: string[];
  done_when: string[];
  resolved?: { at: string; by: string; reason?: string };
}

export interface FollowUp {
  schema: 'night-shift/follow-up@1' | 'night-shift/follow-up@2';
  id: string;
  from_night: string;
  created_at: string;
  items: FollowUpItem[];
}

// ------------------------------------------------------------------ the Viewer's API

export interface RepoRef {
  id: string;
  name: string;
  path: string;
  missing: boolean;
}

export interface NightSummary {
  repo: string;
  id: string;
  status: NightStatus;
  started_at: string;
  ended_at: string | null;
  summary: string | null;
  counts: Record<Outcome, number>;
  tasks: number;
  questions_open: number;
  feedback_unsent: number;
  duration_min: number | null;
  cost_usd: number | null;
  read: boolean;
  follow_up: boolean;
  // Open items in the follow-up, and when it was created; null without one, or when it cannot be read.
  follow_up_open: number | null;
  // Open items of kind discuss: when every open item is one, it is the developer's turn.
  follow_up_discuss: number | null;
  follow_up_at: string | null;
  // Closed with work or questions for the next agent, and no follow-up yet.
  hand_over: boolean;
  running: boolean;
  problems: string[];
}

export interface Overview {
  version: string;
  repos: RepoRef[];
  nights: NightSummary[];
  loadedAt: string;
}

// What the next night in each repository will pick up: the open items of its follow-up files,
// oldest follow-up first. A follow-up file that cannot be read is a problem, not an item.
export interface NextNightItem {
  ref: string;
  from_night: string;
  created_at: string;
  item: FollowUpItem;
  // No night works on it until the developer has talked it through (forTalk).
  held: boolean;
}

export interface NextNightRepo {
  repo: RepoRef;
  items: NextNightItem[];
  problems: string[];
}

export interface NextNight {
  repos: NextNightRepo[];
}

export interface NightDetail {
  repo: RepoRef;
  night: Night;
  hash: string;
  running: boolean;
  follow_up: FollowUp | null;
  // This night's follow-up items a running night has taken on, by item ref, with that night's id:
  // their answers are locked until it closes.
  taken: Record<string, string>;
  problems: string[];
}

export function emptyCounts(): Record<Outcome, number> {
  return { done: 0, partial: 0, blocked: 0, failed: 0, not_started: 0, skipped: 0 };
}

export function countOutcomes(tasks: Task[]): Record<Outcome, number> {
  const counts = emptyCounts();
  for (const t of tasks) if (t.outcome) counts[t.outcome]++;
  return counts;
}

// A question still waits for the owner while it has no answer.
export const isOpenQuestion = (q: Question) => q.answer === null;

// The follow-up item a question was handed over as, if any.
export const handedItem = (f: FollowUp | null | undefined, q: Question): FollowUpItem | undefined =>
  f ? (f.items.find((i) => i.question === q.ask && i.task === q.task) ?? f.items.find((i) => i.question === q.ask)) : undefined;

// Waiting for the developer: unanswered, not handed over unanswered and settled since (asked
// again by a later night, or worked on by day), and not held by a night running now that took its
// item on (`taken`, keyed "<night>/<item>"). An answer there would reach no agent, or must wait.
export const isOpenQuestionIn = (q: Question, f: FollowUp | null | undefined, taken?: Record<string, string>) => {
  if (q.answer !== null) return false;
  const h = handedItem(f, q);
  if (h && f && taken?.[`${f.from_night}/${h.id}`]) return false;
  return !h || h.status === 'open';
};

// Tasks a follow-up would hand over: not done or skipped, leaving out follow-up items the night
// never reached (they stay open in their own follow-up). Matches buildFollowUp.
export const unfinishedList = (n: Night) => n.tasks.filter((t) => t.outcome !== 'done' && t.outcome !== 'skipped' && !(refsOf(t).length && t.outcome === 'not_started'));
export const unfinishedTasks = (n: Night) => unfinishedList(n).length;

// A closed night with work or questions for the next agent and no follow-up yet: the developer
// still has to hand it over.
export const needsHandOver = (n: Night, f: FollowUp | null | undefined) => n.status !== 'open' && !f && (unfinishedTasks(n) > 0 || n.questions.length > 0);

export const followUpOpen = (f: FollowUp) => f.items.filter((i) => i.status === 'open').length;
// Waits for a talk with the developer: a discuss item, and every other open item of the same task in
// that follow-up (its carried decisions): no night works on the task until the talk.
export const forTalk = (f: FollowUp, item: FollowUpItem) =>
  item.status === 'open' && (item.kind === 'discuss' || (!!item.task && f.items.some((o) => o.status === 'open' && o.kind === 'discuss' && o.task === item.task)));
export const followUpDiscuss = (f: FollowUp) => f.items.filter((i) => forTalk(f, i)).length;

// How an answer reads to a person: the option's label, or "Let's discuss".
export const answerLabel = (q: Question): string | null => (q.answer === null ? null : q.answer === DISCUSS ? "Let's discuss" : (q.options.find((o) => o.id === q.answer)?.label ?? q.answer));

// D24: one state per night, in this order; the first that holds wins. Whose turn it is decides
// the colour (web/src/ui.tsx), and the same labels show on cards, the report and History.
// - running: still open, including a night whose session is gone until recovery closes it (a
//   night file that cannot be read has no start and is never running);
// - new: closed and not opened since it ended;
// - needs_answers: a question still waits for the developer;
// - ready_to_save: work or answers the developer has not saved for the next agent yet;
// - waiting: saved, and the follow-up still has open items (one that cannot be read counts);
// - done: every item done, skipped or carried, or nothing was owed.
export const OWNER_STATES = ['running', 'new', 'needs_answers', 'ready_to_save', 'waiting', 'done'] as const;
export type OwnerState = (typeof OWNER_STATES)[number];
type StateInput = Pick<NightSummary, 'status' | 'started_at' | 'read' | 'questions_open' | 'hand_over' | 'follow_up' | 'follow_up_open'> & Partial<Pick<NightSummary, 'follow_up_discuss'>>;
// A follow-up whose open items are all `discuss` waits for the developer, not an agent (D24).
export const onlyDiscussLeft = (s: StateInput) => !!s.follow_up_open && s.follow_up_discuss === s.follow_up_open;
export const ownerState = (s: StateInput): OwnerState =>
  s.status === 'open' && s.started_at ? 'running'
    : !s.read ? 'new'
      : s.questions_open > 0 || onlyDiscussLeft(s) ? 'needs_answers'
        : s.hand_over ? 'ready_to_save'
          : s.follow_up && s.follow_up_open !== 0 ? 'waiting'
            : 'done';

// Each state's one label and colour (a theme colour of the web app), for cards, the report and
// History alike: purple new, amber the developer's turn, blue an agent's, green with a tick only
// when nothing is left.
export const OWNER_STATE: Record<OwnerState, { label: string; color: string; hint: string }> = {
  running: { label: 'Running', color: 'var(--color-agent)', hint: 'An agent is working through this night' },
  new: { label: 'New', color: 'var(--accent)', hint: 'Ended since you last looked' },
  needs_answers: { label: 'Needs answers', color: 'var(--color-eyes)', hint: 'A question waits for your answer' },
  ready_to_save: { label: 'Ready to save', color: 'var(--color-eyes)', hint: 'Unfinished work or answers to save for the next agent' },
  waiting: { label: 'Waiting for an agent', color: 'var(--color-agent)', hint: 'Saved; the next agent has not finished it yet' },
  done: { label: 'Done', color: 'var(--color-shipped)', hint: 'Nothing is left for anyone' },
};

// The developer's turn: new, or something only they can do.
export const ownersTurn = (st: OwnerState) => st === 'new' || st === 'needs_answers' || st === 'ready_to_save';

// A night file that cannot be read has no start, so no state to judge; the Viewer shows it red.
export const readable = (s: Pick<NightSummary, 'started_at'>) => !!s.started_at;

// Start my morning's estimate (TASK-31): its questions, the saves its gates will ask for (the closed
// nights among them not saved yet), and about a minute a question and half a minute a save.
export function morningEstimate(nights: Pick<NightSummary, 'questions_open' | 'status' | 'hand_over'>[]) {
  const walked = nights.filter((n) => n.questions_open > 0);
  const questions = walked.reduce((sum, n) => sum + n.questions_open, 0);
  const saves = walked.filter((n) => n.status !== 'open' && n.hand_over).length;
  return { questions, saves, minutes: questions ? Math.max(1, Math.ceil(questions + saves / 2)) : 0 };
}

// Morning lists every night that is not done: the running ones, the developer's turn, and those
// waiting for an agent (D24). A night file that cannot be read stays only until it is opened once;
// History keeps it.
export const inMorning = (s: StateInput) => (readable(s) ? ownerState(s) !== 'done' : !s.read);

// How a night ended matters only when it cost work: the tasks a night stopped early never started.
export const neverStarted = (s: Pick<NightSummary, 'status' | 'counts'>) => (s.status === 'interrupted' ? s.counts.not_started : 0);

// Whole days a follow-up has waited for an agent, from two days on; null before that.
export function waitedDays(since: string | null, now: number): number | null {
  if (!since) return null;
  const days = Math.floor((now - Date.parse(since)) / 86_400_000);
  return days >= 2 ? days : null;
}
