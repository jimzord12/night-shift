// Follow-up files: what the developer hands to the next agent after answering a night's questions.
// The Viewer creates one from a closed night; afterwards only the tool changes it (item statuses).

import type { FollowUp, FollowUpItem, Night, Question } from './types.ts';
import { StoreError, followUpFile, listFollowUpIds, localIso, readFollowUp, saveFollowUp } from './store.ts';
import fs from 'node:fs';

// Every task that was not done or skipped, with the decision the developer made for it; answered
// questions about no such task become decision items of their own; unanswered ones wait.
// `earlier` finds the item a task took on, so a carried decision keeps the developer's answer.
export function buildFollowUp(n: Night, now = new Date(), earlier: (ref: string) => FollowUpItem | undefined = () => undefined): FollowUp {
  const items: FollowUpItem[] = [];
  const used = new Set<string>();
  const add = (item: Omit<FollowUpItem, 'id' | 'status'>) => items.push({ id: `A${items.length + 1}`, status: 'open', ...item });
  for (const t of n.tasks) {
    if (t.outcome === 'done' || t.outcome === 'skipped') continue;
    // Never reached: the item it took on is still open in its own follow-up.
    if (t.follow_up && t.outcome === 'not_started') continue;
    const q = n.questions.find((x) => x.id === t.blocked_by) ?? n.questions.find((x) => x.task === t.id);
    if (q) used.add(q.id);
    const base = { task: t.id, title: t.title, done_when: t.done_when };
    if (q && q.answer !== null) {
      const opt = q.options.find((o) => o.id === q.answer);
      add({ ...base, kind: 'decision', question: q.ask, decision: q.answer, decision_label: opt?.label ?? q.answer, ...(q.note ? { owner_note: q.note } : {}) });
    } else if (q) {
      add({ ...base, kind: 'waiting', question: q.ask });
    } else {
      const prior = t.follow_up ? earlier(t.follow_up) : undefined;
      const left = t.checks.filter((c) => !c.met).map((c) => (c.note ? `${c.done_when}: ${c.note}` : c.done_when));
      if (t.outcome === 'failed' && t.why) left.unshift(`failed: ${t.why}`);
      if (t.outcome === 'not_started' || (!left.length && t.outcome !== 'partial')) left.push('not started');
      if (prior?.kind === 'decision') add({ ...base, kind: 'decision', question: prior.question, decision: prior.decision, decision_label: prior.decision_label, ...(prior.owner_note ? { owner_note: prior.owner_note } : {}), left });
      else add({ ...base, kind: 'unfinished', left });
    }
  }
  for (const q of n.questions) {
    if (used.has(q.id)) continue;
    const base = { task: q.task, title: q.ask, done_when: [] as string[] };
    if (q.answer !== null) {
      const opt = q.options.find((o) => o.id === q.answer);
      add({ ...base, kind: 'decision', question: q.ask, decision: q.answer, decision_label: opt?.label ?? q.answer, ...(q.note ? { owner_note: q.note } : {}) });
    } else add({ ...base, kind: 'waiting', question: q.ask });
  }
  return { schema: 'night-shift/follow-up@1', id: n.night, from_night: n.night, created_at: localIso(now), items };
}

export function createFollowUp(repo: string, n: Night, now = new Date()): FollowUp {
  if (n.status === 'open') throw new StoreError('the night is still running; create the follow-up once it has closed', 409);
  if (fs.existsSync(followUpFile(repo, n.night))) throw new StoreError(`a follow-up for ${n.night} already exists`, 409);
  const f = buildFollowUp(n, now, (ref) => {
    try {
      return checkRef(repo, ref).item;
    } catch {
      return undefined;
    }
  });
  if (!f.items.length) throw new StoreError('nothing to follow up: every task is done or skipped, every question is settled, and any item this night did not reach is still open in its own follow-up', 422);
  saveFollowUp(repo, f);
  return f;
}

// An answer changed after the follow-up exists: its open item follows the change. An item an agent
// already worked on refuses it, so no agent ever acts on a decision the developer took back.
// Returns the updated follow-up to save once the night is saved, or null when there is none.
export function followAnswer(repo: string, night: string, q: Question): FollowUp | null {
  if (!fs.existsSync(followUpFile(repo, night))) return null;
  const f = readFollowUp(repo, night);
  const item = f.items.find((i) => i.question === q.ask);
  if (!item) return null;
  if (item.status !== 'open') {
    const by = item.resolved?.by === 'day' ? 'by day' : `in night ${item.resolved?.by ?? '?'}`;
    throw new StoreError(`the follow-up already handed this over and it was worked on ${by} (${night}/${item.id} is ${item.status}); the answer can no longer change`, 409);
  }
  delete item.decision;
  delete item.decision_label;
  delete item.owner_note;
  if (q.answer === null) item.kind = 'waiting';
  else {
    item.kind = 'decision';
    item.decision = q.answer;
    item.decision_label = q.options.find((o) => o.id === q.answer)?.label ?? q.answer;
    if (q.note) item.owner_note = q.note;
  }
  return f;
}

export interface OpenItem {
  ref: string;
  followUp: FollowUp;
  item: FollowUpItem;
}

export function openItems(repo: string): OpenItem[] {
  const out: OpenItem[] = [];
  for (const id of listFollowUpIds(repo)) {
    const f = readFollowUp(repo, id);
    for (const item of f.items) if (item.status === 'open') out.push({ ref: `${id}/${item.id}`, followUp: f, item });
  }
  return out;
}

function splitRef(ref: string): [string, string] {
  const m = /^(\d{4}-\d{2}-\d{2}-[a-z]+)\/(A\d+)$/.exec(ref);
  if (!m) throw new StoreError(`bad follow-up item ${JSON.stringify(ref)}; write it as <follow-up id>/<item id>, e.g. 2026-09-26-a/A1`);
  return [m[1], m[2]];
}

// Sets an item's status; `by` is a night id or "day" (worked on outside a night).
export function resolveItem(repo: string, ref: string, status: 'done' | 'skipped' | 'carried', by: string, reason: string | undefined, now = new Date()): FollowUpItem {
  const [fid, iid] = splitRef(ref);
  const f = readFollowUp(repo, fid);
  const item = f.items.find((i) => i.id === iid);
  if (!item) throw new StoreError(`follow-up ${fid} has no item ${iid}`, 404);
  if (status === 'skipped' && !reason?.trim()) throw new StoreError('a skipped item needs a reason');
  item.status = status;
  item.resolved = { at: localIso(now), by, ...(reason?.trim() ? { reason: reason.trim() } : {}) };
  saveFollowUp(repo, f);
  return item;
}

export function checkRef(repo: string, ref: string): OpenItem {
  const [fid, iid] = splitRef(ref);
  const f = readFollowUp(repo, fid);
  const item = f.items.find((i) => i.id === iid);
  if (!item) throw new StoreError(`follow-up ${fid} has no item ${iid}`);
  return { ref, followUp: f, item };
}

// What a closing night did to the follow-up items it planned for.
export function applyNightToFollowUps(repo: string, n: Night, now = new Date()): void {
  for (const t of n.tasks) {
    if (!t.follow_up || t.outcome === 'not_started') continue;
    const status = t.outcome === 'done' ? 'done' : t.outcome === 'skipped' ? 'skipped' : 'carried';
    const reason = t.outcome === 'done' ? undefined : t.outcome === 'skipped' ? t.reason : `${t.id} ended ${t.outcome ?? 'without an outcome'} in ${n.night}`;
    try {
      resolveItem(repo, t.follow_up, status, n.night, reason, now);
    } catch {
      // the follow-up was removed or edited by hand: nothing to update
    }
  }
  for (const s of n.skipped_follow_ups) {
    try {
      resolveItem(repo, s.follow_up, 'skipped', n.night, s.reason, now);
    } catch {
      // as above
    }
  }
}
