// Builds what the morning screen shows from the board: the queue (Night-ready cards and which of
// them collide) and the shifts (outcome comments grouped by shift, newest first, evidence
// resolved to URLs the browser can load). Nothing here is stored: it is read again on refresh.

import type { BoardAdapter, RawComment } from './board/adapter.ts';
import { BoardError } from './board/adapter.ts';
import { BacklogBoard } from './board/backlog.ts';
import { FileBoard } from './board/file.ts';
import { TrelloBoard } from './board/trello.ts';
import { SHIFT_ID, isOutcome, parseHeader, parseOutcome, touchesOverlap } from './parse.ts';
import type { Evidence, Outcome, Overview, Project, QueueCard, Shift } from './types.ts';
import { OUTCOME_STATUSES } from './types.ts';
import { localIso } from './store.ts';

export function adapterFor(project: Project, dataDir: string): BoardAdapter {
  switch (project.board.type) {
    case 'trello':
      return new TrelloBoard(project.board.id);
    case 'backlog':
      return new BacklogBoard(dataDir, project.board.path, project.repo);
    default:
      return new FileBoard(dataDir, project.board.path);
  }
}

export async function buildQueue(project: Project, board: BoardAdapter): Promise<QueueCard[]> {
  const done = new Set(project.board.doneLists ?? []);
  const cards = (await board.cards()).filter((c) => c.labels.includes(project.board.readyLabel) && !done.has(c.list));
  const queue: QueueCard[] = cards.map((c) => ({ id: c.id, name: c.name, url: c.url, list: c.list, header: parseHeader(c.desc), collidesWith: [] }));
  for (const a of queue) {
    for (const b of queue) {
      if (a !== b && a.header?.touches.length && b.header?.touches.length && touchesOverlap(a.header.touches, b.header.touches)) a.collidesWith.push(b.id);
    }
  }
  return queue;
}

function commitUrl(repo: string | undefined, sha: string): string | undefined {
  if (!repo) return undefined;
  const base = repo.replace(/\.git$/, '').replace(/\/+$/, '');
  return /github\.com|gitlab\.com/.test(base) ? `${base}/commit/${sha}` : undefined;
}

export async function buildShifts(project: Project, board: BoardAdapter, comments: RawComment[]): Promise<Shift[]> {
  // Newest comment first; the first outcome per (card, shift) wins, so a corrected outcome
  // replaces the old one.
  const seen = new Set<string>();
  const outcomes: Outcome[] = [];
  const attachmentCache = new Map<string, Promise<Map<string, string>>>();
  const attachmentsOf = (cardId: string) => {
    let p = attachmentCache.get(cardId);
    if (!p) {
      p = board
        .attachments(cardId)
        .then((list) => new Map(list.map((a) => [a.name, `/api/attachment/${encodeURIComponent(cardId)}/${encodeURIComponent(a.id)}`])))
        .catch(() => new Map<string, string>());
      attachmentCache.set(cardId, p);
    }
    return p;
  };

  for (const c of [...comments].sort((a, b) => b.date.localeCompare(a.date))) {
    if (!isOutcome(c.text)) continue;
    const parsed = parseOutcome(c.text);
    if (!parsed) continue;
    const shift = parsed.shift ?? `${c.date.slice(0, 10)}-night`;
    const key = `${c.cardId} ${shift}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const files = await attachmentsOf(c.cardId);
    const resolve = (name: string) => files.get(name);
    const evidence: Evidence[] = parsed.evidence.map((e) => {
      if (e.kind === 'link') return { kind: 'link', src: e.url, caption: e.caption };
      const [first, second] = e.files;
      const ev: Evidence = e.kind === 'compare'
        ? { kind: 'compare', before: resolve(first), src: resolve(second), caption: e.caption, name: `${first}, ${second}` }
        : { kind: e.kind, src: resolve(first), caption: e.caption, name: first };
      ev.missing = e.kind === 'compare' ? !ev.src || !ev.before : !ev.src;
      return ev;
    });
    const problems = [...parsed.problems];
    for (const e of evidence) if (e.missing) problems.push(`attachment ${e.name} is not on the card`);
    outcomes.push({
      card: { id: c.cardId, name: c.cardName, url: c.cardUrl },
      date: c.date,
      shift,
      status: parsed.status ?? 'blocked',
      line: parsed.line ?? '(no line)',
      review: parsed.review,
      commits: parsed.commits.map((sha) => ({ sha, url: commitUrl(project.repo, sha) })),
      evidence,
      questions: parsed.questions,
      problems,
    });
  }

  const byShift = new Map<string, Outcome[]>();
  for (const o of outcomes) byShift.set(o.shift, [...(byShift.get(o.shift) ?? []), o]);
  const shifts: Shift[] = [...byShift.entries()].map(([id, list]) => {
    const m = SHIFT_ID.exec(id);
    const counts = Object.fromEntries(OUTCOME_STATUSES.map((s) => [s, list.filter((o) => o.status === s).length])) as Shift['counts'];
    const order = (o: Outcome) => OUTCOME_STATUSES.indexOf(o.status);
    return { id, kind: (m?.[2] as 'night' | 'day') ?? 'night', date: m?.[1] ?? id.slice(0, 10), counts, outcomes: list.sort((a, b) => order(a) - order(b) || b.date.localeCompare(a.date)) };
  });
  // Newest first; on one date the night (started later) above the day.
  return shifts.sort((a, b) => b.date.localeCompare(a.date) || (a.kind === 'night' ? -1 : 1));
}

export async function buildOverview(project: Project, board: BoardAdapter, version: string): Promise<Overview> {
  const buffer = { max: project.buffer?.max ?? 20, low: project.buffer?.low ?? 5 };
  const overview: Overview = { version, project, buffer, queue: [], shifts: [], boardError: null, loadedAt: localIso(new Date()) };
  try {
    const [queue, comments] = await Promise.all([buildQueue(project, board), board.comments()]);
    overview.queue = queue;
    overview.shifts = await buildShifts(project, board, comments);
  } catch (error) {
    if (!(error instanceof BoardError)) throw error;
    overview.boardError = error.message;
  }
  return overview;
}
