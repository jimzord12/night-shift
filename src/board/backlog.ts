// Backlog.md adapter: reads a project's backlog/ folder (https://github.com/MrLesk/Backlog.md) straight
// from disk, no CLI needed. A task is a card, its status is the list, its labels are the labels, its
// Description section holds the card header, and its Comments section holds the outcome blocks.
// Backlog.md has no attachments, so evidence files live in .night-shift/attachments/<task id>/.

import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { AttachmentBody, BoardAdapter, RawAttachment, RawCard, RawComment } from './adapter.ts';
import { BoardError } from './adapter.ts';
import { contentType, insideDir } from '../files.ts';

interface Task {
  card: RawCard;
  ordinal: number;
  number: number[];
  comments: { date: string; text: string }[];
}

// TASK-7, TASK-7.1 (a subtask), or any prefix the project configured.
const TASK_ID = /^[A-Za-z]+-\d+(?:\.\d+)*$/;

const FRONTMATTER = /^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function section(body: string, name: string): string | undefined {
  const m = new RegExp(`<!-- ${name}:BEGIN -->\\r?\\n?([\\s\\S]*?)\\r?\\n?<!-- ${name}:END -->`).exec(body);
  return m ? m[1] : undefined;
}

// Comments as Backlog.md 1.52 writes them: `key: value` lines (author, created), `---`, the body, `---`.
// The body ends at a `---` line followed by a blank line or the end of the section.
export function parseComments(block: string): { date: string; text: string }[] {
  const out: { date: string; text: string }[] = [];
  const re = /((?:^[a-z_]+: .*\r?\n)+)---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/gm;
  for (let m = re.exec(block); m; m = re.exec(block)) {
    const created = /^created: (\d{4}-\d{2}-\d{2})(?: (\d{2}:\d{2}))?/m.exec(m[1]);
    const date = created ? `${created[1]}T${created[2] ?? '00:00'}:00Z` : '';
    out.push({ date, text: m[2] });
  }
  return out;
}

export class BacklogBoard implements BoardAdapter {
  private readonly dataDir: string;
  private readonly dir: string;
  private readonly repo: string | undefined;

  constructor(dataDir: string, relativePath = '../backlog', repo?: string) {
    this.dataDir = dataDir;
    this.dir = path.resolve(dataDir, relativePath);
    this.repo = repo?.replace(/\.git$/, '').replace(/\/+$/, '');
  }

  private statuses(): string[] {
    try {
      const config = parseYaml(fs.readFileSync(path.join(this.dir, 'config.yml'), 'utf8')) as { statuses?: unknown };
      return Array.isArray(config?.statuses) ? config.statuses.map(String) : [];
    } catch {
      return [];
    }
  }

  private cardUrl(file: string): string {
    if (!this.repo || !/github\.com|gitlab\.com/.test(this.repo)) return '';
    const rel = path.relative(path.resolve(this.dataDir, '..'), file).split(path.sep).map(encodeURIComponent).join('/');
    return rel.startsWith('..') ? '' : `${this.repo}/blob/HEAD/${rel}`;
  }

  private tasks(): Task[] {
    const tasksDir = path.join(this.dir, 'tasks');
    let names: string[];
    try {
      names = fs.readdirSync(tasksDir).filter((n) => n.toLowerCase().endsWith('.md'));
    } catch (error) {
      throw new BoardError(`cannot read ${tasksDir}: ${(error as Error).message} (check board.path in project.json)`);
    }
    const tasks: Task[] = [];
    for (const name of names) {
      const file = path.join(tasksDir, name);
      const m = FRONTMATTER.exec(fs.readFileSync(file, 'utf8'));
      if (!m) continue;
      let meta: Record<string, unknown>;
      try {
        meta = (parseYaml(m[1]) ?? {}) as Record<string, unknown>;
      } catch {
        continue;
      }
      const id = String(meta.id ?? '');
      if (!TASK_ID.test(id)) continue;
      const body = m[2];
      const labels = Array.isArray(meta.labels) ? meta.labels.map(String) : [];
      tasks.push({
        card: {
          id,
          name: `${id}: ${String(meta.title ?? '')}`,
          url: this.cardUrl(file),
          list: String(meta.status ?? ''),
          labels,
          desc: (section(body, 'SECTION:DESCRIPTION') ?? body).trim(),
          closed: false,
        },
        ordinal: typeof meta.ordinal === 'number' ? meta.ordinal : Number.MAX_SAFE_INTEGER,
        number: id.replace(/^[A-Za-z]+-/, '').split('.').map(Number),
        comments: parseComments(section(body, 'COMMENTS') ?? ''),
      });
    }
    return tasks;
  }

  // Board order: status in config.yml order (unknown statuses last), then ordinal, then task number.
  async cards(): Promise<RawCard[]> {
    const order = this.statuses();
    const rank = (s: string) => (order.includes(s) ? order.indexOf(s) : order.length);
    const byNumber = (a: number[], b: number[]) => {
      for (let i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] ?? -1) !== (b[i] ?? -1)) return (a[i] ?? -1) - (b[i] ?? -1);
      return 0;
    };
    return this.tasks()
      .sort((a, b) => rank(a.card.list) - rank(b.card.list) || a.ordinal - b.ordinal || byNumber(a.number, b.number))
      .map((t) => t.card);
  }

  // Newest first. Backlog.md stamps comments to the minute, so within one task a later comment in the
  // file counts as newer: the list is built in reverse file order and the caller's sort is stable.
  async comments(): Promise<RawComment[]> {
    const out: RawComment[] = [];
    for (const t of this.tasks()) {
      for (const c of [...t.comments].reverse()) out.push({ cardId: t.card.id, cardName: t.card.name, cardUrl: t.card.url, date: c.date, text: c.text });
    }
    return out.sort((a, b) => b.date.localeCompare(a.date));
  }

  private attachmentDir(cardId: string): string {
    if (!TASK_ID.test(cardId)) throw new BoardError(`${cardId} is not a Backlog.md task id`);
    return path.join(this.dataDir, 'attachments', cardId);
  }

  async attachments(cardId: string): Promise<RawAttachment[]> {
    const dir = this.attachmentDir(cardId);
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => ({ id: e.name, name: e.name }));
  }

  async attachment(cardId: string, attachmentId: string): Promise<AttachmentBody> {
    const dir = path.resolve(this.attachmentDir(cardId));
    const file = path.resolve(dir, attachmentId);
    if (!insideDir(dir, file) || path.dirname(file) !== dir) throw new BoardError(`attachment ${attachmentId} leaves the attachments folder`);
    if (!fs.statSync(file, { throwIfNoEntry: false })?.isFile()) throw new BoardError(`card ${cardId} has no attachment ${attachmentId}`);
    const body = fs.readFileSync(file);
    return { body: body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer, contentType: contentType(file) };
  }
}
