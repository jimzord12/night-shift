// File adapter: a board.json beside project.json (docs/contract.md). For demos and tests, and for
// trying the protocol on a project that has no board yet.

import fs from 'node:fs';
import path from 'node:path';
import type { AttachmentBody, BoardAdapter, RawAttachment, RawCard, RawComment } from './adapter.ts';
import { BoardError } from './adapter.ts';
import { contentType, insideDir } from '../files.ts';
import { parseJson } from '../store.ts';

interface FileCard {
  id: string;
  name: string;
  url?: string;
  list: string;
  labels?: string[];
  desc?: string;
  closed?: boolean;
  attachments?: { name: string; path: string }[];
}

interface FileData {
  cards?: FileCard[];
  comments?: { card: string; date: string; text: string }[];
}

export class FileBoard implements BoardAdapter {
  private readonly file: string;
  private readonly dataDir: string;

  constructor(dataDir: string, relativePath: string) {
    this.dataDir = dataDir;
    this.file = path.resolve(dataDir, relativePath);
  }

  private read(): FileData {
    try {
      return parseJson(fs.readFileSync(this.file, 'utf8')) as FileData;
    } catch (error) {
      throw new BoardError(`cannot read ${this.file}: ${(error as Error).message}`);
    }
  }

  async cards(): Promise<RawCard[]> {
    return (this.read().cards ?? [])
      .filter((c) => !c.closed)
      .map((c) => ({ id: c.id, name: c.name, url: c.url ?? '', list: c.list, labels: c.labels ?? [], desc: c.desc ?? '', closed: false }));
  }

  async comments(): Promise<RawComment[]> {
    const data = this.read();
    const cards = new Map((data.cards ?? []).map((c) => [c.id, c]));
    return (data.comments ?? [])
      .map((c) => ({ cardId: c.card, cardName: cards.get(c.card)?.name ?? c.card, cardUrl: cards.get(c.card)?.url ?? '', date: c.date, text: c.text }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async attachments(cardId: string): Promise<RawAttachment[]> {
    const card = (this.read().cards ?? []).find((c) => c.id === cardId);
    return (card?.attachments ?? []).map((a) => ({ id: a.name, name: a.name }));
  }

  async attachment(cardId: string, attachmentId: string): Promise<AttachmentBody> {
    const card = (this.read().cards ?? []).find((c) => c.id === cardId);
    const att = card?.attachments?.find((a) => a.name === attachmentId);
    if (!att) throw new BoardError(`card ${cardId} has no attachment ${attachmentId}`);
    const file = path.resolve(this.dataDir, att.path);
    if (!insideDir(this.dataDir, file)) throw new BoardError(`attachment path ${att.path} leaves the .night-shift folder`);
    const body = fs.readFileSync(file);
    return { body: body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer, contentType: contentType(file) };
  }
}
