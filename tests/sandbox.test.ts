// The sandbox kit (TASK-49.3): every scenario builds through the real tool and the Viewer's API
// shows what the scenario promises; the command keeps to its own install folder and stops what it
// starts. The Viewer in a browser over the same scenarios: tests/ui/scenarios.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import './helpers.ts';
import { SCENARIOS, scenario } from '../scripts/sandbox/scenarios.ts';
import { createApp } from '../src/server.ts';
import { installRoot, listRepos } from '../src/store.ts';

interface OverviewNight {
  repo: string;
  id: string;
  tasks: number;
  status: string;
  running: boolean;
  questions_open: number;
  decisions_open: number;
  counts: Record<string, number>;
  follow_up: boolean;
  problems: string[];
}

async function build(name: string) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), `ns-sandbox-${name}-`));
  const built = await scenario(name)!.build(base);
  const app = createApp({ version: 'test' });
  const ids = new Set(built.repos.map((r) => r.id));
  const overview = (await (await app.request('/api/overview')).json()) as { nights: OverviewNight[] };
  const next: unknown = await (await app.request('/api/next-night')).json();
  return { built, nights: overview.nights.filter((n) => ids.has(n.repo)), next, ids };
}

test('every scenario builds, and the Viewer shows what it promises', async () => {
  const expect: Record<string, (b: Awaited<ReturnType<typeof build>>) => void> = {
    empty: ({ built, nights }) => {
      assert.equal(built.repos.length, 1);
      assert.equal(nights.length, 0);
    },
    morning: ({ nights: [n] }) => {
      assert.equal(n.status, 'complete');
      assert.deepEqual(n.counts, { done: 2, partial: 1, blocked: 1, failed: 1, not_started: 0, skipped: 1 });
      assert.deepEqual([n.questions_open, n.decisions_open], [3, 3]);
    },
    'two-nights': ({ built, nights }) => {
      assert.equal(built.repos.length, 2);
      assert.deepEqual(
        nights.map((n) => [n.status, n.questions_open > 0]),
        [
          ['complete', true],
          ['complete', true],
        ],
      );
    },
    running: ({ nights: [n] }) => assert.deepEqual([n.status, n.running, n.counts.done], ['open', true, 2]),
    interrupted: ({ nights: [n] }) => assert.deepEqual([n.status, n.running, n.counts.not_started], ['interrupted', false, 3]),
    'follow-up': ({ nights: [n] }) => {
      assert.equal(n.follow_up, true);
      assert.deepEqual([n.questions_open, n.decisions_open], [0, 1]);
    },
    'second-night': ({ built, nights }) => {
      assert.equal(nights.length, 2);
      // The second night by its id: the first, a full night, has two done tasks too.
      const second = nights.find((n) => n.id === built.open[1].split('/').pop());
      assert.deepEqual([second?.status, second?.tasks, second?.counts.done], ['complete', 2, 2]);
    },
    broken: ({ nights: [n] }) => assert.match(n.problems.join(' '), /not valid JSON/),
  };
  assert.deepEqual(SCENARIOS.map((s) => s.name).sort(), Object.keys(expect).sort(), 'a new scenario needs its promise checked here');
  for (const s of SCENARIOS) {
    const b = await build(s.name);
    try {
      expect[s.name](b);
    } catch (error) {
      throw new Error(`scenario ${s.name}: ${(error as Error).message}`);
    }
  }
});

test('the second night took the follow-up items it planned and left the discussion open', async () => {
  const { next, ids } = await build('second-night');
  const repos = (next as { repos: { repo: { id: string }; items: { item: { kind: string } }[] }[] }).repos.filter((r) => ids.has(r.repo.id));
  assert.deepEqual(repos.flatMap((r) => r.items.map((i) => i.item.kind)), ['discuss']);
});

const node = (args: string[], env: NodeJS.ProcessEnv) => spawnSync(process.execPath, ['scripts/sandbox.ts', ...args], { encoding: 'utf8', env: { ...process.env, ...env }, windowsHide: true });

test('npm run sandbox serves a scenario from its own install folder and stops it again', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-sandbox-home-'));
  // What a careless run would write to: the tool's install folder for this test run.
  const before = listRepos().length;
  const up = node(['empty', '--no-build'], { NIGHT_SHIFT_SANDBOX: home });
  assert.equal(up.status, 0, up.stderr);
  const url = /empty: (http:\S+)/.exec(up.stdout)?.[1];
  assert.ok(url, up.stdout);
  try {
    const repos = (await (await fetch(`${url}api/overview`)).json()) as { repos: { path: string }[] };
    assert.equal(repos.repos.length, 1);
    assert.ok(repos.repos[0].path.startsWith(fs.realpathSync.native(home)), repos.repos[0].path);
    assert.ok(fs.existsSync(path.join(home, 'empty', 'install', 'repos.json')));
    assert.equal(listRepos().length, before, `the sandbox registered a repository in ${installRoot()}`);
    // A port another Viewer holds is a failure, never that Viewer taken for this scenario.
    const port = new URL(url).port;
    const taken = node(['interrupted', '--no-build', '--port', port], { NIGHT_SHIFT_SANDBOX: home });
    assert.equal(taken.status, 1, taken.stdout);
    assert.match(taken.stderr, /did not start on port/);
    assert.equal(fs.existsSync(path.join(home, 'interrupted', 'sandbox.json')), false);
    assert.ok((await fetch(`${url}api/overview`)).ok, 'the other Viewer was stopped');
  } finally {
    const stop = node(['stop', 'empty'], { NIGHT_SHIFT_SANDBOX: home });
    assert.match(stop.stdout, /empty: stopped/);
  }
  const gone = await fetch(`${url}api/overview`).then(
    () => false,
    () => true,
  );
  assert.ok(gone, 'the Viewer still answers after stop');
  // clean removes only what the kit made: a stray file in the home stays, and so does the home.
  fs.writeFileSync(path.join(home, 'keep.txt'), 'not the kit’s');
  const clean = node(['clean'], { NIGHT_SHIFT_SANDBOX: home });
  assert.equal(clean.status, 0, clean.stderr);
  assert.deepEqual(fs.readdirSync(home), ['keep.txt']);
});

test('npm run sandbox refuses an unknown scenario, a stray flag and a stray word', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-sandbox-home-'));
  for (const args of [['nope', '--no-build'], ['empty', '--nope'], ['empty', 'extra'], ['stop', '../x']]) {
    const r = node(args, { NIGHT_SHIFT_SANDBOX: home });
    assert.equal(r.status, 2, `${args.join(' ')}: ${r.stdout}${r.stderr}`);
  }
  assert.match(node(['docs'], {}).stdout, /npm run sandbox clean/);
});
