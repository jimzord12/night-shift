// Trello adapter. Credentials come from TRELLO_API_KEY and TRELLO_API_TOKEN in the environment of
// the process that runs `night-shift serve`; they go out only in the Authorization header (never
// in a URL, which Trello echoes in error bodies) and never reach the browser.

import type { AttachmentBody, BoardAdapter, RawAttachment, RawCard, RawComment } from './adapter.ts';
import { BoardError } from './adapter.ts';

const API = 'https://api.trello.com/1';

function authHeader(): string {
  const key = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_API_TOKEN;
  if (!key || !token) throw new BoardError('TRELLO_API_KEY and TRELLO_API_TOKEN are not set in the shell that started night-shift');
  return `OAuth oauth_consumer_key="${key}", oauth_token="${token}"`;
}

async function get(path: string, query: Record<string, string> = {}): Promise<Response> {
  const url = `${API}${path}${Object.keys(query).length ? `?${new URLSearchParams(query)}` : ''}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { Authorization: authHeader(), Accept: 'application/json' } });
  } catch (error) {
    throw new BoardError(`Trello is unreachable (${(error as Error).message})`);
  }
  if (res.status === 401) throw new BoardError('Trello refused the credentials (401); check TRELLO_API_KEY and TRELLO_API_TOKEN');
  if (res.status === 404) throw new BoardError(`Trello has nothing at ${path} (404); check the board id in project.json`);
  if (!res.ok) throw new BoardError(`Trello answered ${res.status} for ${path}`);
  return res;
}

async function json<T>(path: string, query: Record<string, string> = {}): Promise<T> {
  return (await (await get(path, query)).json()) as T;
}

interface TList {
  id: string;
  name: string;
}
interface TLabel {
  id: string;
  name: string;
}
interface TCard {
  id: string;
  name: string;
  desc: string;
  idList: string;
  idLabels: string[];
  shortUrl: string;
  pos: number;
  closed: boolean;
}
interface TAction {
  date: string;
  data: { text?: string; card?: { id: string; name: string; shortLink: string } };
}

function checkId(id: string): void {
  if (!/^[0-9a-f]{24}$/.test(id)) throw new BoardError(`"${id.slice(0, 40)}" is not a Trello id`);
}

export class TrelloBoard implements BoardAdapter {
  private readonly boardId: string;

  constructor(boardId: string) {
    this.boardId = boardId;
  }

  async cards(): Promise<RawCard[]> {
    const [lists, labels, cards] = await Promise.all([
      json<TList[]>(`/boards/${this.boardId}/lists`, { fields: 'name', filter: 'open' }),
      json<TLabel[]>(`/boards/${this.boardId}/labels`, { fields: 'name', limit: '1000' }),
      json<TCard[]>(`/boards/${this.boardId}/cards/open`, { fields: 'name,desc,idList,idLabels,shortUrl,pos,closed' }),
    ]);
    const listOrder = new Map(lists.map((l, i) => [l.id, i]));
    const listName = new Map(lists.map((l) => [l.id, l.name]));
    const labelName = new Map(labels.map((l) => [l.id, l.name]));
    return cards
      .filter((c) => listOrder.has(c.idList))
      .sort((a, b) => (listOrder.get(a.idList)! - listOrder.get(b.idList)!) || a.pos - b.pos)
      .map((c) => ({
        id: c.id,
        name: c.name,
        url: c.shortUrl,
        list: listName.get(c.idList) ?? '',
        labels: c.idLabels.map((id) => labelName.get(id) ?? '').filter(Boolean),
        desc: c.desc,
        closed: c.closed,
      }));
  }

  async comments(): Promise<RawComment[]> {
    const actions = await json<TAction[]>(`/boards/${this.boardId}/actions`, { filter: 'commentCard', limit: '1000', fields: 'data,date' });
    return actions
      .filter((a) => a.data.card && typeof a.data.text === 'string')
      .map((a) => ({
        cardId: a.data.card!.id,
        cardName: a.data.card!.name,
        cardUrl: `https://trello.com/c/${a.data.card!.shortLink}`,
        date: a.date,
        text: a.data.text!,
      }));
  }

  async attachments(cardId: string): Promise<RawAttachment[]> {
    checkId(cardId);
    const list = await json<{ id: string; name: string }[]>(`/cards/${cardId}/attachments`, { fields: 'name' });
    return list.map((a) => ({ id: a.id, name: a.name }));
  }

  async attachment(cardId: string, attachmentId: string): Promise<AttachmentBody> {
    // Both ids come from a browser URL: only Trello's own id shape may reach the signed request,
    // so no path segment can steer the owner's credentials to another endpoint.
    checkId(cardId);
    checkId(attachmentId);
    const meta = await json<{ name: string; mimeType?: string }>(`/cards/${cardId}/attachments/${attachmentId}`, { fields: 'name,mimeType' });
    const res = await get(`/cards/${cardId}/attachments/${attachmentId}/download/${encodeURIComponent(meta.name)}`);
    return { body: await res.arrayBuffer(), contentType: meta.mimeType || res.headers.get('content-type') || 'application/octet-stream' };
  }
}
