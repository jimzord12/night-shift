#!/usr/bin/env node
// npm run sandbox: named scenarios for trying the Viewer by hand or from a reviewer's brief
// (TASK-49.3). Each one gets its own install folder that the kit always sets itself (never the
// real ~/.night-shift), repositories whose nights are built through the tool's own code, and the
// freshly built Viewer on a free port, tracked so one command stops and removes it all.

import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { SCENARIOS, buildAll, scenario } from './sandbox/scenarios.ts';

const REPO = path.resolve(import.meta.dirname, '..');
// NIGHT_SHIFT_SANDBOX moves the whole kit elsewhere (the kit's own tests use it).
const HOME = path.resolve(process.env.NIGHT_SHIFT_SANDBOX || path.join(os.tmpdir(), 'night-shift-sandbox'));
const CLI = path.join(REPO, 'src', 'cli.ts');

const DOCS = `npm run sandbox — named scenarios in a throwaway install, served by the Viewer

  npm run sandbox list                     the scenarios and what each one shows
  npm run sandbox <scenario>               build it and serve it: prints the Viewer's address
  npm run sandbox all                      every scenario side by side in one Viewer
  npm run sandbox shot <scenario> [#/path ...]
                                           screenshots of a running scenario (its first pages by default)
  npm run sandbox stop [<scenario>]        stop one scenario's Viewer, or all of them
  npm run sandbox clean                    stop every Viewer and delete every sandbox
  npm run sandbox docs                     this manual

Flags go after "--", or npm takes them: npm run sandbox -- morning --port 4799
  --port N      serve on N instead of a free port
  --no-build    keep the Viewer build in web/dist as it is
  --phone       (shot) phone width, 390 px, instead of laptop, 1280 px

Where: ${HOME}${path.sep}<scenario>, with install/ (its own NIGHT_SHIFT_ROOT), repos/, shots/
and viewer.log. Your real install (~/.night-shift) and your real repositories are never touched.
Each run rebuilds the Viewer (npm run build) and the scenario from scratch, on a free port unless
--port says otherwise. To run the tool against a scenario yourself:
  NIGHT_SHIFT_ROOT=${HOME}${path.sep}<scenario>${path.sep}install node src/cli.ts <command>   (in one of its repos/)
The UI tests build the same scenarios (tests/ui/scenarios.test.ts).
Exit codes: 0 done · 1 a step failed · 2 a usage error.`;

class UsageError extends Error {}

interface State {
  scenario: string;
  pid: number;
  port: number;
  url: string;
  open: string[];
}

const dirOf = (name: string) => path.join(HOME, name);
const stateFile = (name: string) => path.join(dirOf(name), 'sandbox.json');

function readState(name: string): State | null {
  try {
    return JSON.parse(fs.readFileSync(stateFile(name), 'utf8')) as State;
  } catch {
    return null;
  }
}

async function answers(url: string): Promise<boolean> {
  try {
    return (await fetch(`${url}api/overview`, { signal: AbortSignal.timeout(1500) })).ok;
  } catch {
    return false;
  }
}

// Only a Viewer this kit started and that still answers on its port: a process id reused by
// something else after a reboot is left alone.
async function stop(name: string): Promise<boolean> {
  const s = readState(name);
  if (!s) return false;
  let stopped = false;
  if (await answers(s.url)) {
    try {
      process.kill(s.pid);
      stopped = true;
    } catch {
      // Already gone.
    }
  }
  fs.rmSync(stateFile(name), { force: true });
  return stopped;
}

function sandboxes(): string[] {
  return fs.existsSync(HOME) ? fs.readdirSync(HOME).filter((n) => fs.statSync(dirOf(n)).isDirectory()) : [];
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address() as net.AddressInfo;
      srv.close(() => resolve(port));
    });
  });
}

function buildViewer(): void {
  console.log('· building the Viewer');
  const r = spawnSync('npm', ['run', 'build', '--silent'], { cwd: REPO, encoding: 'utf8', shell: process.platform === 'win32', windowsHide: true });
  if (r.status !== 0) throw new Error(`npm run build failed:\n${`${r.stdout}${r.stderr}`.trim().split('\n').slice(-12).join('\n')}`);
}

async function up(name: string, port: number | undefined, build: boolean): Promise<void> {
  const s = name === 'all' ? null : scenario(name);
  if (name !== 'all' && !s) throw new UsageError(`no scenario "${name}"; npm run sandbox list shows them`);
  if (build) buildViewer();
  await stop(name);
  const dir = dirOf(name);
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
  const install = path.join(dir, 'install');
  fs.mkdirSync(install, { recursive: true });
  // Set before any scenario code runs: everything the tool registers lands in the sandbox.
  process.env.NIGHT_SHIFT_ROOT = install;
  console.log(`· building ${name}`);
  const built = s ? await s.build(path.join(dir, 'repos')) : await buildAll(path.join(dir, 'repos'));

  const p = port ?? (await freePort());
  const log = fs.openSync(path.join(dir, 'viewer.log'), 'a');
  const child = spawn(process.execPath, [CLI, 'view', '--port', String(p)], {
    cwd: REPO,
    env: { ...process.env, NIGHT_SHIFT_ROOT: install },
    detached: true,
    stdio: ['ignore', log, log],
    windowsHide: true,
  });
  child.unref();
  const url = `http://127.0.0.1:${p}/`;
  for (let i = 0; i < 50 && !(await answers(url)); i++) await new Promise((r) => setTimeout(r, 200));
  if (!(await answers(url))) {
    try {
      process.kill(child.pid!);
    } catch {
      // It never started.
    }
    throw new Error(`the Viewer did not start on port ${p}; see ${path.join(dir, 'viewer.log')}`);
  }
  const state: State = { scenario: name, pid: child.pid!, port: p, url, open: built.open };
  fs.writeFileSync(stateFile(name), `${JSON.stringify(state, null, 2)}\n`);
  console.log(`\n${name}: ${url}`);
  for (const o of built.open) console.log(`  ${url}${o}`);
  console.log(`\nrepositories: ${built.repos.map((r) => r.path).join(', ')}`);
  console.log(`install folder: ${install}`);
  console.log(`stop it: npm run sandbox stop ${name} · remove every sandbox: npm run sandbox clean`);
}

async function shot(name: string, paths: string[], phone: boolean): Promise<void> {
  const s = readState(name);
  if (!s || !(await answers(s.url))) throw new UsageError(`${name} is not running; start it: npm run sandbox ${name}`);
  // Playwright from this repository's own dependencies (npx playwright install chromium once).
  const { chromium } = await import('playwright');
  const out = path.join(dirOf(name), 'shots');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: phone ? { width: 390, height: 844 } : { width: 1280, height: 800 }, deviceScaleFactor: phone ? 2 : 1 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    for (const p of paths.length ? paths : s.open) {
      await page.goto(`${s.url}${p}`);
      await page.waitForLoadState('networkidle');
      const file = path.join(out, `${p.replace(/^#\/?/, '').replace(/[^a-z0-9-]+/gi, '_') || 'inbox'}${phone ? '-phone' : ''}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(file);
    }
    if (errors.length) console.log(`browser errors:\n  ${errors.join('\n  ')}`);
  } finally {
    await browser.close();
  }
}

async function main(argv: string[]): Promise<void> {
  const words: string[] = [];
  let port: number | undefined;
  let phone = false;
  let build = true;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--port') {
      port = Number(argv[++i]);
      if (!Number.isInteger(port) || port < 1 || port > 65535) throw new UsageError('--port must be a number from 1 to 65535');
    } else if (a === '--phone') phone = true;
    else if (a === '--no-build') build = false;
    else if (a.startsWith('--')) throw new UsageError(`unknown flag ${a}; npm run sandbox docs lists them`);
    else words.push(a);
  }
  const [verb, ...rest] = words;
  switch (verb) {
    case undefined:
    case 'docs':
      return console.log(DOCS);
    case 'list':
      for (const s of SCENARIOS) console.log(`${s.name.padEnd(14)}${s.about}`);
      return console.log(`${'all'.padEnd(14)}every scenario above, side by side in one Viewer`);
    case 'shot':
      if (!rest[0]) throw new UsageError('which scenario? npm run sandbox shot <scenario> [#/path ...]');
      return shot(rest[0], rest.slice(1), phone);
    case 'stop': {
      const names = rest.length ? rest : sandboxes();
      for (const n of names) console.log(`${n}: ${(await stop(n)) ? 'stopped' : 'not running'}`);
      return;
    }
    case 'clean': {
      for (const n of sandboxes()) await stop(n);
      fs.rmSync(HOME, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
      return console.log(`removed ${HOME}`);
    }
    default:
      if (rest.length) throw new UsageError(`unexpected "${rest.join(' ')}"; npm run sandbox docs lists the commands`);
      return up(verb, port, build);
  }
}

main(process.argv.slice(2)).catch((error: Error) => {
  console.error(`error: ${error.message}`);
  process.exit(error instanceof UsageError ? 2 : 1);
});
