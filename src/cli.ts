#!/usr/bin/env node
// night-shift — records unattended agent work as nights a developer reads in the morning.
// Exit codes: 0 done · 1 refused or failed (the message says why and how to fix it) · 2 usage error.

import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { serve } from '@hono/node-server';
import { createApp } from './server.ts';
import { StoreError, followUpSchemaProblems, forgetRepo, listFollowUpIds, listNightIds, parseJson, readFollowUp, readNight } from './store.ts';
import { ask, close, feedback, onSessionEnd, record, recover, start, status } from './night.ts';
import { openItems, resolveItem } from './followup.ts';
import { install } from './install.ts';
import { repoRoot } from './repo.ts';
import { versionString } from './version.ts';
import type { AskInput, RecordInput } from './night.ts';

const USAGE = `night-shift — unattended agent work, read in the morning

For agents (JSON with --file .night-shift/input.json, on stdin, or with --json '<json>'):
  night-shift status                          where the open night stands, and the next step
  night-shift start                           open a night from a plan (night-shift/plan@1)
  night-shift record                          record one task's outcome, checks and evidence
  night-shift ask                             add a question for the developer
  night-shift feedback                        log friction with Night Shift itself
  night-shift close --summary "<text>"        close the night
  night-shift follow-up list | show <id>      open follow-up items
  night-shift follow-up resolve <id>/<item> --status done|skipped [--reason "<text>"]

For the developer:
  night-shift install [repo]                  add the skills and the session-end hook to a repository
  night-shift view [--port 4747] [--open]     the Viewer: every registered repository's nights
  night-shift forget <repo id or path>        take a repository off the Viewer (its files stay)
  night-shift check [repo]                    validate a repository's night and follow-up files
  night-shift --version

For the harness:
  night-shift meter                           the session-end hook (reads Claude Code's hook JSON on stdin)

Commands act on the git repository of the current folder.`;

class UsageError extends Error {}

interface Parsed {
  command: string | undefined;
  args: string[];
  flags: Record<string, string | true>;
}

const VALUED = new Set(['port', 'file', 'json', 'summary', 'status', 'reason']);

function parse(argv: string[]): Parsed {
  const args: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      const k = eq > 0 ? a.slice(2, eq) : a.slice(2);
      if (eq > 0) flags[k] = a.slice(eq + 1);
      else if (VALUED.has(k)) flags[k] = argv[++i] ?? '';
      else flags[k] = true;
    } else if (a === '-h') flags.help = true;
    else args.push(a);
  }
  return { command: args.shift(), args, flags };
}

// The JSON an agent hands over: --json, --file, or stdin.
function input<T>(p: Parsed): T {
  let text: string;
  if (typeof p.flags.json === 'string') text = p.flags.json;
  else if (typeof p.flags.file === 'string') {
    if (!fs.existsSync(p.flags.file)) throw new UsageError(`no such file: ${p.flags.file}`);
    text = fs.readFileSync(p.flags.file, 'utf8');
  } else if (!process.stdin.isTTY) text = fs.readFileSync(0, 'utf8');
  else throw new UsageError('write the JSON to .night-shift/input.json and pass --file .night-shift/input.json (or send it on stdin)');
  if (!text.trim()) throw new UsageError('the JSON input is empty');
  try {
    return parseJson(text) as T;
  } catch (error) {
    throw new StoreError(`the input is not valid JSON: ${(error as Error).message}`);
  }
}

function inputText(p: Parsed): string {
  if (typeof p.flags.json === 'string') return p.flags.json;
  if (typeof p.flags.file === 'string') {
    if (!fs.existsSync(p.flags.file)) throw new UsageError(`no such file: ${p.flags.file}`);
    return fs.readFileSync(p.flags.file, 'utf8');
  }
  if (!process.stdin.isTTY) return fs.readFileSync(0, 'utf8');
  throw new UsageError('write the plan to .night-shift/input.json and pass --file .night-shift/input.json (or send it on stdin)');
}

function openBrowser(url: string): void {
  const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  spawn(cmd, args, { stdio: 'ignore', detached: true, windowsHide: true }).unref();
}

function commandView(p: Parsed): void {
  const port = p.flags.port === undefined ? 4747 : Number(p.flags.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new UsageError(`--port must be a number from 1 to 65535, got ${String(p.flags.port)}`);
  const app = createApp({ version: versionString(), port });
  const server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port }, () => {
    const url = `http://127.0.0.1:${port}/`;
    console.log(`night-shift ${versionString()} — the Viewer at ${url} (Ctrl+C stops it)`);
    if (p.flags.open) openBrowser(url);
  });
  server.on('error', (error: NodeJS.ErrnoException) => {
    console.error(`error: ${error.code === 'EADDRINUSE' ? `port ${port} is taken; is the Viewer already running? try --port ${port + 1}` : error.message}`);
    process.exit(2);
  });
}

function commandCheck(p: Parsed): number {
  const repo = repoRoot(p.args[0] ?? '.');
  let problems = 0;
  const ids = listNightIds(repo);
  for (const id of ids) {
    const r = readNight(repo, id);
    if (r.problems.length) {
      console.log(`✗ night ${id}`);
      for (const msg of r.problems) console.log(`    ${msg}`);
      problems += r.problems.length;
    } else console.log(`✓ night ${id} (${r.night!.status})`);
  }
  for (const id of listFollowUpIds(repo)) {
    try {
      readFollowUp(repo, id);
      console.log(`✓ follow-up ${id}`);
    } catch (error) {
      console.log(`✗ follow-up ${id}: ${(error as Error).message}`);
      problems++;
    }
  }
  if (!ids.length) console.log('no nights yet');
  console.log(problems ? `${problems} problem(s)` : 'all good');
  return problems ? 1 : 0;
}

function commandFollowUp(p: Parsed, repo: string): number {
  const sub = p.args[0] ?? 'list';
  if (sub === 'list') {
    const items = openItems(repo);
    if (!items.length) console.log('No open follow-up items.');
    for (const o of items) console.log(`${o.ref}  ${o.item.kind.padEnd(10)} ${o.item.title}${o.item.decision_label ? ` → ${o.item.decision_label}` : ''}`);
    return 0;
  }
  if (sub === 'show') {
    const id = p.args[1];
    if (!id) throw new UsageError('night-shift follow-up show <follow-up id>');
    console.log(JSON.stringify(readFollowUp(repo, id), null, 2));
    return 0;
  }
  if (sub === 'resolve') {
    const ref = p.args[1];
    const st = p.flags.status;
    if (!ref || (st !== 'done' && st !== 'skipped')) throw new UsageError('night-shift follow-up resolve <follow-up id>/<item> --status done|skipped [--reason "<text>"]');
    const item = resolveItem(repo, ref, st, 'day', typeof p.flags.reason === 'string' ? p.flags.reason : undefined);
    console.log(`${ref} is ${item.status}. ${openItems(repo).length} open item(s) left.`);
    return 0;
  }
  throw new UsageError(`unknown follow-up command "${sub}"; use list, show or resolve`);
}

// The session-end hook must never disturb the harness: it reports problems to a log and exits 0.
function commandMeter(): number {
  let hook: { session_id?: string; transcript_path?: string; cwd?: string } = {};
  try {
    if (!process.stdin.isTTY) hook = parseJson(fs.readFileSync(0, 'utf8') || '{}') as typeof hook;
  } catch {
    hook = {};
  }
  try {
    const repo = repoRoot(hook.cwd ?? '.');
    const done = hook.session_id ? onSessionEnd(repo, hook.session_id, hook.transcript_path ?? null) : recover(repo);
    if (done.length) console.log(`night-shift: ${done.join('; ')}`);
  } catch (error) {
    console.error(`night-shift meter: ${(error as Error).message}`);
  }
  return 0;
}

async function main(argv: string[]): Promise<number> {
  const p = parse(argv);
  if (p.flags.version) {
    console.log(versionString());
    return 0;
  }
  if (!p.command || p.flags.help) {
    console.log(USAGE);
    return p.flags.help ? 0 : 2;
  }
  const repo = () => repoRoot('.');
  switch (p.command) {
    case 'view':
    case 'serve':
      commandView(p);
      return -1; // keeps running
    case 'status':
      console.log(status(repo()));
      return 0;
    case 'start': {
      const r = start(repo(), inputText(p));
      console.log(r.messages.join('\n'));
      return 0;
    }
    case 'record':
      console.log(record(repo(), input<RecordInput>(p)).message);
      return 0;
    case 'ask':
      console.log(ask(repo(), input<AskInput>(p)).message);
      return 0;
    case 'feedback':
      console.log(feedback(repo(), input<{ kind?: string; title: string; tags?: string[]; body: string }>(p)).message);
      return 0;
    case 'close': {
      const summary = typeof p.flags.summary === 'string' ? p.flags.summary : undefined;
      if (summary === undefined) throw new UsageError('night-shift close --summary "<one or two sentences>"');
      console.log(close(repo(), summary).message);
      return 0;
    }
    case 'follow-up':
      return commandFollowUp(p, repo());
    case 'meter':
      return commandMeter();
    case 'install': {
      const target = repoRoot(p.args[0] ?? '.');
      console.log(install(target).join('\n'));
      return 0;
    }
    case 'check':
      return commandCheck(p);
    case 'forget': {
      if (!p.args[0]) throw new UsageError('night-shift forget <repo id or path>; the ids are in the Viewer and in ~/.night-shift/repos.json');
      const r = forgetRepo(p.args[0]);
      console.log(`Forgot ${r.id} (${r.path}): the Viewer no longer shows it. Its .night-shift/ folder is untouched; night-shift install there, or the next night started there, adds it back.`);
      return 0;
    }
    default:
      throw new UsageError(`unknown command "${p.command}"; run night-shift --help`);
  }
}

// Kept for `night-shift check`: a follow-up file's own schema problems.
export { followUpSchemaProblems };

main(process.argv.slice(2)).then(
  (code) => {
    if (code >= 0) process.exitCode = code;
  },
  (error: unknown) => {
    console.error(`${error instanceof StoreError || error instanceof UsageError ? 'refused' : 'error'}: ${(error as Error).message}`);
    process.exitCode = error instanceof UsageError ? 2 : 1;
  },
);
