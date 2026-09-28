// The question deck through the real app (TASK-8): a real night on disk, the real server with the
// built web app, a real browser. Run with `npm run test:ui` (it builds the web app first).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { serve } from '@hono/node-server';
import { chromium } from 'playwright';
import { DEAD_PID, TASKS, gitRepo, plan, session } from '../helpers.ts';
import { createApp } from '../../src/server.ts';
import { ask, close, decide, record, recover, start } from '../../src/night.ts';
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
  fs.writeFileSync(path.join(repo, 'login-notes.md'), '# Login\n\nBoth fixes work.\n');
  ask(repo, { task: 'T2', ask: 'Which login fix?', files: ['login-notes.md'], options: [{ label: 'Relax the cookie' }, { label: 'Own-domain login' }], recommended: 'a' });
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
    // A browser shortcut is not an answer; Enter on a focused option saves that option, not the
    // recommended one that was picked.
    await page.keyboard.press('Control+d');
    await page.keyboard.press('Tab');
    await deck.getByRole('button', { name: /^Compact/ }).focus();
    await page.keyboard.press('Enter');
    await deck.getByRole('heading', { name: 'Which login fix?' }).waitFor();
    // Enter on a file's Open link opens it and answers nothing.
    await deck.getByRole('link', { name: 'Open' }).focus();
    const [tab] = await Promise.all([page.context().waitForEvent('page'), page.keyboard.press('Enter')]);
    await tab.close();
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
    await deck.locator('[data-gate-save]:not(:disabled)').waitFor();
    // S saves for the next agent, by the key's place (here a Greek layout); then Enter leaves.
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'σ', code: 'KeyS' })));
    await deck.getByRole('heading', { name: 'All clear' }).waitFor({ timeout: 10_000 });
    await page.keyboard.press('Enter');
    await deck.waitFor({ state: 'detached' });

    const n = loadNight(repo, id).night;
    assert.deepEqual(n.questions.map((q) => [q.answer, q.note ?? null]), [['a', null], [null, null], ['discuss', 'Does the upgrade change the login?']]);
    assert.deepEqual(readFollowUp(repo, id).items.map((i) => [i.task, i.kind]), [['T1', 'decision'], ['T2', 'waiting'], ['T3', 'discuss']]);
  } finally {
    await browser.close();
    server.close();
  }
});

test('mouse and keyboard together: Enter saves what the screen shows as chosen', async () => {
  const repo = gitRepo('mixed');
  const id = start(repo, plan(TASKS), session('m', DEAD_PID), new Date('2026-09-26T23:10:00')).night.night;
  ask(repo, { task: 'T1', ask: 'Which invoice layout?', options: [{ label: 'Compact' }, { label: 'Detailed' }], recommended: 'a' });
  record(repo, { task: 'T1', outcome: 'blocked', checks: [false, false], blocked_by: 'Q1' });
  ask(repo, { task: 'T2', ask: 'Which login fix?', options: [{ label: 'Relax the cookie' }, { label: 'Own-domain login' }], recommended: 'a' });
  record(repo, { task: 'T2', outcome: 'blocked', checks: [false], blocked_by: 'Q2' });
  ask(repo, { task: 'T3', ask: 'Upgrade now or after the release?', options: [{ label: 'Now' }, { label: 'After the release' }], recommended: 'a' });
  // Picture options: a 1x1 PNG in the night's folder.
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const pics = path.join(repo, '.night-shift', 'nights', id, 'evidence');
  fs.mkdirSync(pics, { recursive: true });
  fs.writeFileSync(path.join(pics, 'red.png'), png);
  fs.writeFileSync(path.join(pics, 'blue.png'), png);
  ask(repo, { task: 'T3', ask: 'Which icon colour?', options: [{ label: 'Red', image: 'evidence/red.png' }, { label: 'Blue', image: 'evidence/blue.png' }], recommended: 'b' });
  record(repo, { task: 'T3', outcome: 'blocked', checks: [false, false], blocked_by: 'Q3' });
  close(repo, 'Four choices wait for you.');
  recover(repo);
  const ref = registerRepo(repo);

  const browser = await chromium.launch();
  const server = serve({ fetch: createApp({ version: 'test' }).fetch, hostname: '127.0.0.1', port: 0 });
  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address() as AddressInfo;
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`http://127.0.0.1:${port}/#/night/${ref.id}/${id}`);
    await page.getByRole('button', { name: /Start answering/ }).click();
    const deck = page.locator('div.sky.fixed');
    // A click on one option, then a number key for the other: Enter saves the one now checked.
    await deck.getByRole('heading', { name: 'Which invoice layout?' }).waitFor();
    await deck.getByRole('button', { name: /^Compact/ }).click();
    await page.keyboard.press('2');
    await page.keyboard.press('Enter');
    // After a click, a Tab hands Enter back to the control it reaches: Not now leaves the question.
    await deck.getByRole('heading', { name: 'Which login fix?' }).waitFor();
    await deck.getByRole('button', { name: 'use it' }).click();
    await deck.getByRole('button', { name: /Not now/ }).focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Enter');
    // A click on "use it" leaves Enter to Save.
    await deck.getByRole('heading', { name: 'Upgrade now or after the release?' }).waitFor();
    assert.equal(loadNight(repo, id).night.questions[1].answer, null);
    await page.keyboard.press('ArrowLeft');
    await deck.getByRole('heading', { name: 'Which login fix?' }).waitFor();
    await deck.getByRole('button', { name: 'use it' }).click();
    await page.keyboard.press('Enter');
    // From the keyboard alone: focus on one option, the number key of the other, Enter.
    await deck.getByRole('heading', { name: 'Upgrade now or after the release?' }).waitFor();
    await page.keyboard.press('Tab');
    await deck.getByRole('button', { name: /^Now/ }).focus();
    await page.keyboard.press('2');
    await page.keyboard.press('Enter');
    // A picture the keyboard reached opens on Enter and answers nothing; one that was clicked leaves
    // Enter to Save.
    await deck.getByRole('heading', { name: 'Which icon colour?' }).waitFor();
    const viewer = page.locator('[class*="bg-black/90"]');
    await page.keyboard.press('Tab');
    await deck.locator('[title="View Red in full"]').focus();
    await page.keyboard.press('Enter');
    await viewer.waitFor();
    assert.equal(loadNight(repo, id).night.questions[3].answer, null);
    await page.keyboard.press('Escape');
    await viewer.waitFor({ state: 'detached' });
    await deck.locator('[title="View Red in full"]').click();
    await viewer.waitFor();
    await page.keyboard.press('Escape');
    await viewer.waitFor({ state: 'detached' });
    await page.keyboard.press('Enter');
    await deck.getByRole('heading', { name: 'One step left' }).waitFor({ timeout: 10_000 });
    assert.deepEqual(loadNight(repo, id).night.questions.map((q) => q.answer), ['b', 'a', 'b', 'b']);
  } finally {
    await browser.close();
    server.close();
  }
});

test('a morning reviews the decisions the agent took, after the questions (D31)', async () => {
  const repo = gitRepo('decisions');
  const id = start(repo, plan(TASKS.slice(0, 2)), session('d', DEAD_PID), new Date('2026-09-26T23:10:00')).night.night;
  ask(repo, { task: 'T1', ask: 'Which invoice layout?', options: [{ label: 'Compact' }, { label: 'Detailed' }], recommended: 'b' });
  decide(repo, { task: 'T1', decision: 'Generate invoices with pdfkit', why: 'It streams large invoices.' });
  decide(repo, { task: 'T2', decision: 'Keep the login cookie at 14 days', why: 'The framework default.' });
  record(repo, { task: 'T1', outcome: 'blocked', checks: [false, false], blocked_by: 'Q1' });
  record(repo, { task: 'T2', outcome: 'done', checks: [true], evidence: [{ type: 'command', command: 'npm test', exit_code: 0, excerpt: 'ok' }] });
  close(repo, 'The login is fixed; invoices wait for you.');
  recover(repo);
  const ref = registerRepo(repo);

  const browser = await chromium.launch();
  const server = serve({ fetch: createApp({ version: 'test' }).fetch, hostname: '127.0.0.1', port: 0 });
  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address() as AddressInfo;
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    // The Inbox counts them and Start my morning names them (other tests' nights share the registry).
    await page.goto(`http://127.0.0.1:${port}/#/`);
    await page.getByText('decisions to review').waitFor();
    await page.locator('button', { hasText: 'Start my morning' }).filter({ hasText: '2 decisions' }).waitFor();
    // This night's own deck: its question, then its decisions.
    await page.goto(`http://127.0.0.1:${port}/#/night/${ref.id}/${id}`);
    await page.getByText('2 decisions to review', { exact: true }).waitFor();
    await page.getByRole('button', { name: /Start answering/ }).click();
    const deck = page.locator('div.sky.fixed');
    await deck.getByRole('heading', { name: 'Which invoice layout?' }).waitFor();
    await page.keyboard.press('Enter');
    // Enter keeps the decision; D disagrees, with a note for the next agent.
    await deck.getByRole('heading', { name: 'Generate invoices with pdfkit' }).waitFor();
    await deck.getByText('A decision the agent took for you').waitFor();
    // A note belongs to "I disagree" only: under "Fine, keep it" none is offered.
    assert.equal(await deck.getByText('+ add a note').count(), 0);
    assert.equal(await deck.locator('textarea').count(), 0);
    await page.keyboard.press('Enter');
    await deck.getByRole('heading', { name: 'Keep the login cookie at 14 days' }).waitFor();
    await page.keyboard.press('d');
    await page.keyboard.type('Seven days: the client asked for it.');
    await page.keyboard.press('Control+Enter');
    await deck.getByRole('heading', { name: 'One step left' }).waitFor({ timeout: 10_000 });
    await deck.getByText('You disagree: Seven days: the client asked for it.').waitFor();
    await deck.locator('[data-gate-save]:not(:disabled)').waitFor();
    await page.keyboard.press('s');
    await deck.getByRole('heading', { name: 'All clear' }).waitFor({ timeout: 10_000 });

    const n = loadNight(repo, id).night;
    assert.deepEqual(n.agent_decisions!.map((d) => [d.review, d.note]), [['ok', null], ['disagree', 'Seven days: the client asked for it.']]);
    assert.deepEqual(readFollowUp(repo, id).items.map((i) => [i.kind, i.task]), [['decision', 'T1'], ['disagreed', 'T2']]);
  } finally {
    await browser.close();
    server.close();
  }
});

test('saving one night on the gate never saves the next one before it is seen (TASK-48)', async () => {
  const nights = ['gate-a', 'gate-b'].map((name, i) => {
    const repo = gitRepo(name);
    const id = start(repo, plan(TASKS.slice(1, 2)), session(name, DEAD_PID), new Date(`2026-09-2${6 + i}T23:10:00`)).night.night;
    ask(repo, { task: 'T2', ask: `Which login fix for ${name}?`, options: [{ label: 'Relax the cookie' }, { label: 'Own-domain login' }], recommended: 'a' });
    record(repo, { task: 'T2', outcome: 'blocked', checks: [false], blocked_by: 'Q1' });
    close(repo, 'Login waits for you.');
    recover(repo);
    registerRepo(repo);
    return { repo, id };
  });
  const saved = () => nights.map(({ repo, id }) => fs.existsSync(path.join(repo, '.night-shift', 'follow-ups', `${id}.json`)));

  const browser = await chromium.launch();
  const server = serve({ fetch: createApp({ version: 'test' }).fetch, hostname: '127.0.0.1', port: 0 });
  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address() as AddressInfo;
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`http://127.0.0.1:${port}/#/`);
    await page.getByRole('button', { name: /Start my morning/ }).click();
    const deck = page.locator('div.sky.fixed');
    // Other tests' nights may share the Inbox: answer every question the deck holds.
    for (let i = 0; i < 20 && !(await deck.getByRole('heading', { name: 'One step left' }).count()); i++) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(250);
    }
    await deck.getByRole('heading', { name: 'One step left' }).waitFor({ timeout: 10_000 });
    const ours = /^gate-[ab]$/;
    // Save the cards before ours, if any, the way the developer would: one at a time.
    while (!ours.test((await deck.locator('section h3').first().textContent()) ?? '')) {
      await deck.locator('[data-gate-save]:not(:disabled)').click();
      await page.waitForTimeout(700);
    }
    assert.deepEqual(saved(), [false, false]);
    // Enter saves the first of ours; a second Enter and an S right after it land on the gate while
    // it waits, and save nothing.
    await deck.locator('[data-gate-save]:not(:disabled)').waitFor();
    await page.keyboard.press('Enter');
    // The keys come once the saved night shows as saved, when the next card is on the screen.
    await deck.getByText(/Saved for the next agent: gate-/).first().waitFor();
    // The second Enter is held down.
    await page.keyboard.down('Enter');
    await page.keyboard.press('s');
    await page.waitForTimeout(300);
    assert.equal(saved().filter(Boolean).length, 1);
    // A held Enter (the key's auto-repeat) saves nothing once the next Save is ready.
    await deck.locator('[data-gate-save]:not(:disabled)').waitFor();
    await page.keyboard.down('Enter');
    await page.waitForTimeout(300);
    assert.equal(saved().filter(Boolean).length, 1);
    await page.keyboard.up('Enter');
    // A fresh press saves the next night as usual.
    await page.keyboard.press('Enter');
    for (let i = 0; i < 40 && !saved().every(Boolean); i++) await page.waitForTimeout(100);
    assert.deepEqual(saved(), [true, true]);
  } finally {
    await browser.close();
    server.close();
  }
});
