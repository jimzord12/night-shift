// The question deck through the real app (TASK-8): a real night on disk, the real server with the
// built web app, a real browser. Run with `npm run test:ui` (it builds the web app first).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { serve } from '@hono/node-server';
import { chromium } from 'playwright';
import { DEAD_PID, TASKS, gitRepo, plan, session } from '../helpers.ts';
import { createApp } from '../../src/server.ts';
import { ask, close, record, start } from '../../src/night.ts';
import { loadNight, registerRepo } from '../../src/store.ts';

test('the deck saves the chosen answer and its note into the night file', async () => {
  const repo = gitRepo('shop');
  const id = start(repo, plan(TASKS.slice(0, 2)), session('s', DEAD_PID), new Date('2026-09-26T23:10:00')).night.night;
  record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'command', command: 'npm test', exit_code: 0, excerpt: 'ok' }] });
  ask(repo, { task: 'T2', ask: 'Which login fix?', why: 'Both work.', options: [{ label: 'Relax the cookie' }, { label: 'Own-domain login' }], recommended: 'a' });
  record(repo, { task: 'T2', outcome: 'blocked', checks: [false], blocked_by: 'Q1' });
  close(repo, 'Invoices shipped; login waits for you.');
  const ref = registerRepo(repo);

  const server = serve({ fetch: createApp({ version: 'test' }).fetch, hostname: '127.0.0.1', port: 0 });
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`http://127.0.0.1:${port}/#/night/${ref.id}/${id}`);
    await page.getByRole('button', { name: /Start answering/ }).click();
    await page.getByRole('heading', { name: 'Which login fix?' }).waitFor();
    await page.getByRole('button', { name: /Own-domain login/ }).click();
    await page.getByRole('button', { name: '+ add a note' }).click();
    await page.getByPlaceholder('A note for the agent (optional)').fill('We own the domain already.');
    const deck = page.locator('div.sky.fixed');
    await deck.getByRole('button', { name: /^Save/ }).click();
    // The deck moves on once the server has written the answer.
    await deck.getByRole('heading', { name: 'Which login fix?' }).waitFor({ state: 'detached' });
    const q = loadNight(repo, id).night.questions[0];
    assert.deepEqual([q.answer, q.note], ['b', 'We own the domain already.']);
    assert.ok(q.answered_at);
  } finally {
    await browser.close();
    server.close();
  }
});
