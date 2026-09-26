// The Viewer's local HTTP app: a JSON API over the nights of every registered repository, plus the
// built web app from web/dist. Bound to 127.0.0.1 by the CLI; it has no login because nothing but
// this machine can reach it. It writes only answers, notes, `sent`, follow-up files (once per
// night) and its own read marks.

import fs from 'node:fs';
import path from 'node:path';
import { Hono } from 'hono';
import { contentType, insideDir } from './files.ts';
import { createFollowUp, followAnswer } from './followup.ts';
import { ISSUES_REPO, createIssue, ghReady, newIssueUrl } from './github.ts';
import { recover, sessionRunning } from './night.ts';
import { REPO_ROOT, StoreError, findRepo, listNightIds, listRepos, loadNight, localIso, markRead, nightDir, readFollowUp, readNight, readViewerState, saveFollowUp, saveNight, followUpFile } from './store.ts';
import type { FollowUp, NightDetail, NightSummary, Overview, RepoRef } from './types.ts';
import { countOutcomes, emptyCounts, isOpenQuestionIn } from './types.ts';

const WEB_DIST = path.join(REPO_ROOT, 'web', 'dist');

export interface AppOptions {
  version: string;
  // The port the server listens on. When set, requests whose Host is not this machine at this
  // port are refused, so a web page elsewhere cannot reach the app through DNS rebinding.
  port?: number;
}

function safeDecode(s: string): string | null {
  try {
    return decodeURIComponent(s);
  } catch {
    return null;
  }
}

// Media the Viewer shows inline. HTML is shown too, but only as a sandboxed document with an
// opaque origin (scripts may run, yet it can never read or act on this app); anything else
// (scripts, archives, unknown types) downloads instead.
const INLINE = /^(image\/(png|jpeg|gif|webp|svg\+xml)|application\/pdf|video\/(mp4|webm|quicktime))$/;
const HTML = /^text\/html\b/;

function fileResponse(body: Uint8Array, type: string): Response {
  const bare = type.split(';')[0].trim().toLowerCase();
  const headers: Record<string, string> = { 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' };
  if (HTML.test(bare)) {
    headers['Content-Type'] = 'text/html; charset=utf-8';
    headers['Content-Security-Policy'] = 'sandbox allow-scripts';
  } else if (INLINE.test(bare)) {
    headers['Content-Type'] = bare;
    if (bare !== 'application/pdf' && !bare.startsWith('video/')) headers['Content-Security-Policy'] = 'sandbox';
  } else {
    headers['Content-Type'] = 'application/octet-stream';
    headers['Content-Disposition'] = 'attachment';
    headers['Content-Security-Policy'] = 'sandbox';
  }
  return new Response(body as BodyInit, { headers });
}

async function body<T>(c: { req: { json: () => Promise<unknown> } }): Promise<T> {
  try {
    return (await c.req.json()) as T;
  } catch {
    throw new StoreError('the request body is not JSON');
  }
}

function followUpOf(repo: string, id: string): FollowUp | null {
  try {
    return fs.existsSync(followUpFile(repo, id)) ? readFollowUp(repo, id) : null;
  } catch {
    return null;
  }
}

function summarise(repo: RepoRef, id: string, readMarks: Record<string, string>, now: number): NightSummary {
  const r = readNight(repo.path, id);
  const base: NightSummary = {
    repo: repo.id,
    id,
    status: 'open',
    started_at: '',
    ended_at: null,
    summary: null,
    counts: emptyCounts(),
    tasks: 0,
    questions_open: 0,
    feedback_unsent: 0,
    duration_min: null,
    cost_usd: null,
    read: !!readMarks[`${repo.id}/${id}`],
    follow_up: fs.existsSync(followUpFile(repo.path, id)),
    running: false,
    problems: r.problems,
  };
  const n = r.night;
  if (!n) return base;
  const followUp = followUpOf(repo.path, id);
  return {
    ...base,
    status: n.status,
    started_at: n.started_at,
    ended_at: n.ended_at,
    summary: n.summary,
    counts: countOutcomes(n.tasks),
    tasks: n.tasks.length,
    questions_open: n.questions.filter((q) => isOpenQuestionIn(q, followUp)).length,
    feedback_unsent: n.feedback.filter((f) => !f.sent).length,
    duration_min: n.metrics?.duration_min.total ?? null,
    cost_usd: n.metrics?.cost_usd ?? null,
    running: n.status === 'open' && sessionRunning(repo.path, n, now),
  };
}

export function createApp({ version, port }: AppOptions): Hono {
  const app = new Hono();

  if (port !== undefined) {
    const allowed = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
    app.use('*', async (c, next) => {
      // The Node adapter builds the request URL from the Host header, so this is the Host.
      if (!allowed.has(new URL(c.req.url).host)) return c.text('night-shift only answers requests for this machine', 403);
      await next();
    });
  }

  app.onError((error, c) => {
    if (error instanceof StoreError) return c.json({ error: error.message }, error.status as 400);
    console.error(error);
    return c.json({ error: `internal error: ${(error as Error).message}` }, 500);
  });

  app.get('/api/overview', (c) => {
    const repos = listRepos();
    const readMarks = readViewerState().read;
    const nights: NightSummary[] = [];
    const now = Date.now();
    for (const repo of repos) {
      if (repo.missing) continue;
      try {
        recover(repo.path);
      } catch (error) {
        console.error(`recovery in ${repo.path}: ${(error as Error).message}`);
      }
      for (const id of listNightIds(repo.path)) nights.push(summarise(repo, id, readMarks, now));
    }
    nights.sort((a, b) => (b.started_at || b.id).localeCompare(a.started_at || a.id));
    const overview: Overview = { version, repos, nights, loadedAt: localIso(new Date()) };
    return c.json(overview);
  });

  const detail = (repoId: string, id: string): NightDetail => {
    const repo = findRepo(repoId);
    const r = readNight(repo.path, id);
    if (!r.night) throw new StoreError(`night ${id} is invalid: ${r.problems.join('; ')}`, 422);
    const followUp = followUpOf(repo.path, id);
    return { repo, night: r.night, hash: r.hash, running: r.night.status === 'open' && sessionRunning(repo.path, r.night), follow_up: followUp, problems: r.problems };
  };

  app.get('/api/nights/:repo/:night', (c) => c.json(detail(c.req.param('repo'), c.req.param('night'))));

  // The Viewer's one write to a question: the answer and a note, over the exact file version the
  // developer saw (409 otherwise). `answer: null` takes an answer back.
  app.post('/api/nights/:repo/:night/answer', async (c) => {
    const b = await body<{ question?: string; answer?: string | null; note?: string; baseHash?: string }>(c);
    const repo = findRepo(c.req.param('repo'));
    const r = readNight(repo.path, c.req.param('night'));
    if (!r.night) throw new StoreError('the night file is invalid', 422);
    if (r.hash !== b.baseHash) throw new StoreError('the night changed since you opened it; showing the new version', 409);
    const q = r.night.questions.find((x) => x.id === b.question);
    if (!q) throw new StoreError(`no question ${String(b.question)}`, 404);
    if (b.answer !== null && b.answer !== undefined && !q.options.some((o) => o.id === b.answer)) throw new StoreError(`"${b.answer}" is not an option of ${q.id}`);
    q.answer = b.answer ?? null;
    q.note = b.note?.trim() ? b.note.trim() : null;
    if (q.answer) q.answered_at = localIso(new Date());
    else delete q.answered_at;
    const followUp = followAnswer(repo.path, r.night.night, q);
    saveNight(repo.path, r.night);
    if (followUp) saveFollowUp(repo.path, followUp);
    return c.json(detail(repo.id, r.night.night));
  });

  app.post('/api/nights/:repo/:night/read', (c) => {
    const repo = findRepo(c.req.param('repo'));
    readNight(repo.path, c.req.param('night'));
    markRead(repo.id, c.req.param('night'));
    return c.json({ ok: true });
  });

  app.post('/api/nights/:repo/:night/follow-up', (c) => {
    const repo = findRepo(c.req.param('repo'));
    const r = readNight(repo.path, c.req.param('night'));
    if (!r.night) throw new StoreError('the night file is invalid', 422);
    createFollowUp(repo.path, r.night);
    return c.json(detail(repo.id, r.night.night));
  });

  app.get('/api/gh', (c) => c.json({ ready: ghReady(), repo: ISSUES_REPO() }));

  // Sends ticked feedback entries: with gh when it is ready, else hands back pre-filled links.
  app.post('/api/nights/:repo/:night/feedback/send', async (c) => {
    const b = await body<{ ids?: string[]; via?: 'gh' | 'link' }>(c);
    const repo = findRepo(c.req.param('repo'));
    const r = readNight(repo.path, c.req.param('night'));
    if (!r.night) throw new StoreError('the night file is invalid', 422);
    const n = r.night;
    const ids = Array.isArray(b.ids) ? b.ids : [];
    const entries = n.feedback.filter((f) => ids.includes(f.id) && !f.sent);
    if (!entries.length) throw new StoreError('tick at least one unsent entry');
    const ctx = { repo: repo.name, night: n.night, version };
    const links: { id: string; url: string }[] = [];
    const errors: string[] = [];
    for (const f of entries) {
      if (b.via === 'link') {
        const url = newIssueUrl(f, ctx);
        links.push({ id: f.id, url });
        f.sent = { at: localIso(new Date()), via: 'link' };
        continue;
      }
      try {
        const { url } = createIssue(f, ctx);
        f.sent = { at: localIso(new Date()), via: 'gh', url };
      } catch (error) {
        errors.push(`${f.id}: ${(error as Error).message}`);
      }
    }
    const fresh = loadNight(repo.path, n.night).night;
    for (const f of entries) {
      const target = fresh.feedback.find((x) => x.id === f.id);
      if (target && f.sent) target.sent = f.sent;
    }
    saveNight(repo.path, fresh);
    return c.json({ detail: detail(repo.id, n.night), links, errors });
  });

  // Evidence of a night: files inside that night's folder, never outside it.
  app.get('/api/files/:repo/:night/*', (c) => {
    const repo = findRepo(c.req.param('repo'));
    const night = c.req.param('night');
    const prefix = `/api/files/${c.req.param('repo')}/${night}/`;
    const rel = safeDecode(c.req.path.slice(prefix.length));
    const dir = nightDir(repo.path, night);
    const file = rel === null ? '' : path.resolve(dir, rel);
    if (rel === null || !/^\d{4}-\d{2}-\d{2}-[a-z]+$/.test(night) || !insideDir(path.join(dir, 'evidence'), file) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return c.json({ error: 'no such file' }, 404);
    return fileResponse(fs.readFileSync(file), contentType(file));
  });

  app.all('/api/*', (c) => c.json({ error: 'no such endpoint' }, 404));

  // The web app; unknown paths fall back to index.html.
  app.get('*', (c) => {
    if (!fs.existsSync(path.join(WEB_DIST, 'index.html'))) {
      return c.text('The web app is not built. Run `npm run build` in the night-shift checkout (a release builds it for you).', 503);
    }
    const rel = (safeDecode(c.req.path) ?? '').replace(/^\/+/, '');
    const file = path.resolve(WEB_DIST, rel);
    const serve = rel && insideDir(WEB_DIST, file) && fs.existsSync(file) && fs.statSync(file).isFile() ? file : path.join(WEB_DIST, 'index.html');
    return new Response(fs.readFileSync(serve), { headers: { 'Content-Type': contentType(serve) } });
  });

  return app;
}
