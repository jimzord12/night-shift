// The question deck through the real app (TASK-8): a real night on disk, the real server with the
// built web app, a real browser. Run with `npm run test:ui` (it builds the web app first).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { serve } from '@hono/node-server';
import { chromium } from 'playwright';
import { DEAD_PID, TASKS, gitRepo, plan, session } from '../helpers.ts';
import { createApp } from '../../src/server.ts';
import { ask, close, record, recover, start } from '../../src/night.ts';
import { loadNight, readFollowUp, registerRepo } from '../../src/store.ts';

test('the deck saves the chosen answer and its note into the night file', async () => {
  const repo = gitRepo('shop');
  const id = start(repo, plan(TASKS.slice(0, 2)), session('s', DEAD_PID), new Date('2026-09-26T23:10:00')).night.night;
  record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'command', command: 'npm test', exit_code: 0, excerpt: 'ok' }] });
  ask(repo, { task: 'T2', ask: 'Which login fix?', why: 'Both work.', options: [{ label: 'Relax the cookie' }, { label: 'Own-domain login' }], recommended: 'a' });
  record(repo, { task: 'T2', outcome: 'blocked', checks: [false], blocked_by: 'Q1' });
  close(repo, 'Invoices shipped; login waits for you.');
  // A real morning: the Meter measured the night when its session ended. Left unmeasured, the
  // Viewer's own recovery would rewrite the file while the deck is open (TASK-44).
  recover(repo);
  assert.ok(loadNight(repo, id).night.metrics);
  const ref = registerRepo(repo);

  // The browser first: if it cannot launch, no server is left holding the test run open.
  const browser = await chromium.launch();
  const server = serve({ fetch: createApp({ version: 'test' }).fetch, hostname: '127.0.0.1', port: 0 });
  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address() as AddressInfo;
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`http://127.0.0.1:${port}/#/night/${ref.id}/${id}`);
    await page.getByRole('button', { name: /Start answering/ }).click();
    await page.getByRole('heading', { name: 'Which login fix?' }).waitFor();
    await page.getByRole('button', { name: /Own-domain login/ }).click();
    await page.getByRole('button', { name: '+ add a note' }).click();
    await page.getByPlaceholder('A note for the agent (optional)').fill('We own the domain already.');
    const deck = page.locator('div.sky.fixed');
    await deck.getByRole('button', { name: /^Save/ }).click();
    // The deck moves on once the server has written the answer; if it does not, say why.
    await deck.getByRole('heading', { name: 'Which login fix?' }).waitFor({ state: 'detached', timeout: 10_000 }).catch(async (e: Error) => {
      throw new Error(`${e.message}\nthe deck shows: ${await deck.locator('.text-broken').allInnerTexts()}`);
    });
    const q = loadNight(repo, id).night.questions[0];
    assert.deepEqual([q.answer, q.note], ['b', 'We own the domain already.']);
    assert.ok(q.answered_at);
  } finally {
    await browser.close();
    server.close();
  }
});

test('a whole morning without the mouse: accept, discuss one, save', async () => {
  const repo = gitRepo('keys');
  const id = start(repo, plan(TASKS), session('k', DEAD_PID), new Date('2026-09-26T23:10:00')).night.night;
  ask(repo, { task: 'T1', ask: 'Which invoice layout?', options: [{ label: 'Compact' }, { label: 'Detailed' }], recommended: 'b' });
  record(repo, { task: 'T1', outcome: 'blocked', checks: [false, false], blocked_by: 'Q1' });
  ask(repo, { task: 'T2', ask: 'Which login fix?', options: [{ label: 'Relax the cookie' }, { label: 'Own-domain login' }], recommended: 'a' });
  record(repo, { task: 'T2', outcome: 'blocked', checks: [false], blocked_by: 'Q2' });
  ask(repo, { task: 'T3', ask: 'Upgrade now or after the release?', options: [{ label: 'Now' }, { label: 'After the release' }], recommended: 'b' });
  record(repo, { task: 'T3', outcome: 'blocked', checks: [false, false], blocked_by: 'Q3' });
  close(repo, 'Invoices, login and the upgrade wait for you.');
  recover(repo);
  registerRepo(repo);

  const browser = await chromium.launch();
  const server = serve({ fetch: createApp({ version: 'test' }).fetch, hostname: '127.0.0.1', port: 0 });
  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address() as AddressInfo;
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`http://127.0.0.1:${port}/#/`);
    await page.getByRole('button', { name: /Start my morning/ }).waitFor();
    // Tab to Start my morning, as a person would.
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      if (/Start my morning/.test((await page.evaluate(() => document.activeElement?.textContent)) ?? '')) break;
    }
    await page.keyboard.press('Enter');
    const deck = page.locator('div.sky.fixed');
    await deck.getByRole('heading', { name: 'Which invoice layout?' }).waitFor();
    // A browser shortcut is not an answer; Enter keeps the recommended one.
    await page.keyboard.press('Control+d');
    await page.keyboard.press('Enter');
    await deck.getByRole('heading', { name: 'Which login fix?' }).waitFor();
    // Enter on a focused Not now presses it, and the deck does not come back to that question.
    await deck.getByRole('button', { name: /Not now/ }).focus();
    await page.keyboard.press('Enter');
    await deck.getByRole('heading', { name: 'Upgrade now or after the release?' }).waitFor();
    // D picks let's discuss and puts the cursor in the note, also when pressed again after leaving it.
    await page.keyboard.press('d');
    await page.keyboard.press('Escape');
    await page.keyboard.press('1');
    await page.keyboard.press('d');
    await page.keyboard.type('Does the upgrade change the login?');
    await page.keyboard.press('Control+Enter');
    await deck.getByRole('heading', { name: 'One step left' }).waitFor({ timeout: 10_000 });
    // S saves for the next agent, by the key's place (here a Greek layout); then Enter leaves.
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'σ', code: 'KeyS' })));
    await deck.getByRole('heading', { name: 'All clear' }).waitFor({ timeout: 10_000 });
    await page.keyboard.press('Enter');
    await deck.waitFor({ state: 'detached' });

    const n = loadNight(repo, id).night;
    assert.deepEqual(n.questions.map((q) => [q.answer, q.note ?? null]), [['b', null], [null, null], ['discuss', 'Does the upgrade change the login?']]);
    assert.deepEqual(readFollowUp(repo, id).items.map((i) => [i.task, i.kind]), [['T1', 'decision'], ['T2', 'waiting'], ['T3', 'discuss']]);
  } finally {
    await browser.close();
    server.close();
  }
});
