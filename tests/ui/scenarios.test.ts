// The sandbox's scenarios in a real browser (TASK-49.3): each one's first pages render what the
// scenario promises, at laptop and phone width, without a page error. The same scenarios serve
// `npm run sandbox` and reviewer briefs. Run with `npm run test:ui` (it builds the web app first).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { serve } from '@hono/node-server';
import { chromium } from 'playwright';
import '../helpers.ts';
import { scenario } from '../../scripts/sandbox/scenarios.ts';
import { createApp } from '../../src/server.ts';

// What a person should see on each scenario's own page (its open[] entry, the first by default),
// in text no other scenario's repositories show: they share one install folder here.
const SEE: Record<string, RegExp[] | { page: number; see: RegExp[] }> = {
  empty: [/No nights yet|no nights/i],
  morning: [/Start my morning/, /Night of/],
  'two-nights': [/Start my morning/, /shop/],
  running: [/Running/],
  interrupted: [/Stopped early|stopped early|never started/i],
  'follow-up': [/Let.s discuss/],
  'second-night': { page: 1, see: [/Follow up: /, /Redid the priority default your way/] },
  broken: [/Cannot be read/],
};

test('every scenario renders at laptop and phone width without a page error', async () => {
  const browser = await chromium.launch();
  const server = serve({ fetch: createApp({ version: 'test' }).fetch, hostname: '127.0.0.1', port: 0 });
  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address() as AddressInfo;
    for (const [name, want] of Object.entries(SEE)) {
      const { page: at, see: patterns } = Array.isArray(want) ? { page: 0, see: want } : want;
      // One install folder shared by the run: each scenario's repositories sit beside the others,
      // so the first page is checked for this scenario's own text.
      const built = await scenario(name)!.build(fs.mkdtempSync(path.join(os.tmpdir(), `ns-ui-${name}-`)));
      for (const width of [1280, 390]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await page.goto(`http://127.0.0.1:${port}/${built.open[at]}`);
        await page.waitForLoadState('networkidle');
        const text = await page.locator('body').innerText();
        for (const p of patterns) assert.match(text, p, `${name} at ${width}px`);
        const wide = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        assert.equal(wide, false, `${name} scrolls sideways at ${width}px`);
        assert.deepEqual(errors, [], `${name} at ${width}px`);
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
});
