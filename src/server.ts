// The local HTTP app: a JSON API over the project's .night-shift folder and its board, plus the
// built web app from web/dist. Bound to 127.0.0.1 by the CLI; it has no login because nothing
// but this machine can reach it.

import fs from 'node:fs';
import path from 'node:path';
import { Hono } from 'hono';
import type { BoardAdapter } from './board/adapter.ts';
import { BoardError } from './board/adapter.ts';
import { contentType, insideDir } from './files.ts';
import { adapterFor, buildOverview } from './overview.ts';
import { REPO_ROOT, StoreError, listQuestions, loadProject, saveAnswer } from './store.ts';
import type { Overview } from './types.ts';

const WEB_DIST = path.join(REPO_ROOT, 'web', 'dist');
const CACHE_MS = 30_000;

export interface AppOptions {
  dataDir: string;
  version: string;
  board?: BoardAdapter; // tests inject one; otherwise project.json decides
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

// Media the viewer shows inline. HTML is shown too, but only as a sandboxed document with an
// opaque origin (scripts may run, yet it can never read or act on this app); anything else
// (scripts, archives, unknown types) downloads instead.
const INLINE = /^(image\/(png|jpeg|gif|webp|svg\+xml)|application\/pdf|video\/(mp4|webm|quicktime))$/;
const HTML = /^text\/html\b/;

function fileResponse(body: ArrayBuffer | Uint8Array, type: string, cache: string): Response {
  const bare = type.split(';')[0].trim().toLowerCase();
  const headers: Record<string, string> = { 'X-Content-Type-Options': 'nosniff', 'Cache-Control': cache };
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

export function createApp({ dataDir, version, board, port }: AppOptions): Hono {
  const app = new Hono();
  let cache: { at: number; overview: Overview } | null = null;
  const adapter = () => board ?? adapterFor(loadProject(dataDir), dataDir);

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
    if (error instanceof BoardError) return c.json({ error: error.message }, 502);
    console.error(error);
    return c.json({ error: `internal error: ${(error as Error).message}` }, 500);
  });

  app.get('/api/overview', async (c) => {
    const refresh = c.req.query('refresh') === '1';
    if (!refresh && cache && Date.now() - cache.at < CACHE_MS) return c.json(cache.overview);
    const project = loadProject(dataDir);
    const overview = await buildOverview(project, board ?? adapterFor(project, dataDir), version);
    cache = { at: Date.now(), overview };
    return c.json(overview);
  });

  app.get('/api/questions', (c) => c.json(listQuestions(dataDir)));

  app.post('/api/questions/:id/answer', async (c) => {
    let body: { status?: unknown; value?: unknown; note?: unknown; baseHash?: unknown };
    try {
      body = await c.req.json();
    } catch {
      throw new StoreError('the request body is not JSON');
    }
    const entry = saveAnswer(dataDir, c.req.param('id'), {
      status: body.status as 'answered' | 'deferred',
      value: Array.isArray(body.value) ? (body.value as string[]) : [],
      note: typeof body.note === 'string' ? body.note : undefined,
      baseHash: String(body.baseHash ?? ''),
    });
    return c.json(entry);
  });

  // Images questions show: files under .night-shift/, never outside it.
  app.get('/api/files/*', (c) => {
    const rel = safeDecode(c.req.path.slice('/api/files/'.length));
    const file = rel === null ? '' : path.resolve(dataDir, rel);
    if (rel === null || !insideDir(dataDir, file) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return c.json({ error: 'no such file' }, 404);
    return fileResponse(fs.readFileSync(file), contentType(file), 'no-cache');
  });

  // Card attachments, fetched with the board's credentials so the browser never holds them.
  app.get('/api/attachment/:card/:id', async (c) => {
    const { body, contentType: type } = await adapter().attachment(c.req.param('card'), c.req.param('id'));
    return fileResponse(body, type, 'private, max-age=3600');
  });

  app.get('/api/*', (c) => c.json({ error: 'no such endpoint' }, 404));

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
