#!/usr/bin/env node
// night-shift — the command line of the Night Shift Protocol.
//
//   night-shift serve [project] [--port 4747] [--open]   the morning review app for <project>
//   night-shift check [project] [--board]                validate .night-shift/ (and the board's cards and outcomes)
//   night-shift docs [protocol|contract|binding]         print the protocol documents of this version
//   night-shift --version
//
// [project] is the project's root folder (the one holding .night-shift/); default: the current folder.
// Exit codes: 0 done · 1 problems found or a step failed · 2 usage error or missing prerequisite.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { serve } from '@hono/node-server';
import { BoardError } from './board/adapter.ts';
import { adapterFor, buildQueue, buildShifts } from './overview.ts';
import { createApp } from './server.ts';
import { REPO_ROOT, StoreError, dataDir, listQuestions, loadProject } from './store.ts';
import { isOpen } from './types.ts';
import { versionString } from './version.ts';

const USAGE = `night-shift — prepare by day, build by night, review in the morning

  night-shift serve [project] [--port 4747] [--open]   open the morning review app
  night-shift check [project] [--board]                validate the project's .night-shift folder
                                                       (--board also checks card headers and outcomes)
  night-shift docs [protocol|contract|binding]         print a protocol document
  night-shift --version

[project] is the project's root folder; default: the current folder.
Exit codes: 0 done · 1 problems found · 2 usage error or missing prerequisite.`;

class UsageError extends Error {}

interface Parsed {
  command: string | undefined;
  args: string[];
  flags: Record<string, string | true>;
}

function parse(argv: string[]): Parsed {
  const args: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=', 2);
      if (v !== undefined) flags[k] = v;
      else if (k === 'port') flags[k] = argv[++i] ?? '';
      else flags[k] = true;
    } else if (a === '-h') flags.help = true;
    else args.push(a);
  }
  return { command: args.shift(), args, flags };
}

function projectData(arg: string | undefined): string {
  const root = path.resolve(arg ?? '.');
  if (!fs.existsSync(root)) throw new UsageError(`no such folder: ${root}`);
  const dir = dataDir(root);
  if (!fs.existsSync(path.join(dir, 'project.json'))) throw new UsageError(`${root} has no .night-shift/project.json; see \`night-shift docs binding\``);
  return dir;
}

function openBrowser(url: string): void {
  const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  spawn(cmd, args, { stdio: 'ignore', detached: true, windowsHide: true }).unref();
}

function commandServe(p: Parsed): void {
  const dir = projectData(p.args[0]);
  const project = loadProject(dir);
  const port = p.flags.port === undefined ? 4747 : Number(p.flags.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new UsageError(`--port must be a number from 1 to 65535, got ${String(p.flags.port)}`);
  const app = createApp({ dataDir: dir, version: versionString(), port });
  const server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port }, () => {
    const url = `http://127.0.0.1:${port}/`;
    console.log(`night-shift ${versionString()} — ${project.name} at ${url} (Ctrl+C stops it)`);
    if (p.flags.open) openBrowser(url);
  });
  server.on('error', (error: NodeJS.ErrnoException) => {
    console.error(`error: ${error.code === 'EADDRINUSE' ? `port ${port} is taken; is night-shift already running? try --port ${port + 1}` : error.message}`);
    process.exit(2);
  });
}

async function commandCheck(p: Parsed): Promise<number> {
  const dir = projectData(p.args[0]);
  let problems = 0;
  const report = (where: string, list: string[]) => {
    for (const msg of list) console.log(`  ✗ ${where}: ${msg}`);
    problems += list.length;
  };
  const project = loadProject(dir);
  console.log(`✓ project.json (${project.name}, board: ${project.board.type})`);
  const entries = listQuestions(dir);
  const valid = entries.filter((e) => e.question);
  console.log(`${entries.length === valid.length ? '✓' : '✗'} questions: ${valid.length} of ${entries.length} valid, ${valid.filter((e) => isOpen(e.question!)).length} open`);
  for (const e of entries) report(`questions/${e.file}`, e.problems);

  if (p.flags.board) {
    try {
      const board = adapterFor(project, dir);
      const queue = await buildQueue(project, board);
      console.log(`${queue.every((c) => c.header && !c.header.problems.length) ? '✓' : '✗'} queue: ${queue.length} Night-ready card(s)`);
      for (const c of queue) report(`card "${c.name}"`, c.header ? c.header.problems : ['no "night-shift:" header line']);
      const shifts = await buildShifts(project, board, await board.comments());
      const outcomes = shifts.flatMap((s) => s.outcomes);
      console.log(`${outcomes.every((o) => !o.problems.length) ? '✓' : '✗'} outcomes: ${outcomes.length} across ${shifts.length} shift(s)`);
      for (const o of outcomes) report(`outcome on "${o.card.name}" (${o.shift})`, o.problems);
    } catch (error) {
      if (!(error instanceof BoardError)) throw error;
      console.log(`✗ board: ${error.message}`);
      return 2;
    }
  }
  console.log(problems ? `${problems} problem(s)` : 'all good');
  return problems ? 1 : 0;
}

function commandDocs(p: Parsed): void {
  const name = p.args[0] ?? 'protocol';
  const file = path.join(REPO_ROOT, 'docs', `${name}.md`);
  if (!/^[a-z-]+$/.test(name) || !fs.existsSync(file)) throw new UsageError(`no document "${name}"; choose protocol, contract or binding`);
  process.stdout.write(fs.readFileSync(file, 'utf8'));
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
  switch (p.command) {
    case 'serve':
      commandServe(p);
      return -1; // keeps running
    case 'check':
      return commandCheck(p);
    case 'docs':
      commandDocs(p);
      return 0;
    default:
      throw new UsageError(`unknown command "${p.command}"; run night-shift --help`);
  }
}

main(process.argv.slice(2)).then(
  (code) => {
    if (code >= 0) process.exitCode = code;
  },
  (error: unknown) => {
    console.error(`error: ${(error as Error).message}`);
    process.exitCode = error instanceof UsageError || (error instanceof StoreError && error.status === 404) ? 2 : 1;
  },
);
