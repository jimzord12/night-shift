import type { NightDetail, Overview } from '../../src/types.ts';

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiError('night-shift is not running (the server did not answer)', 0);
  }
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new ApiError(body.error ?? `request failed (${res.status})`, res.status);
  return body;
}

const post = <T,>(url: string, body?: object) => call<T>(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) });
const nightUrl = (repo: string, night: string) => `/api/nights/${encodeURIComponent(repo)}/${encodeURIComponent(night)}`;

export const getOverview = () => call<Overview>('/api/overview');
export const getNight = (repo: string, night: string) => call<NightDetail>(nightUrl(repo, night));
export const markRead = (repo: string, night: string) => post<{ ok: true }>(`${nightUrl(repo, night)}/read`);
export const createFollowUp = (repo: string, night: string) => post<NightDetail>(`${nightUrl(repo, night)}/follow-up`);
export const ghStatus = () => call<{ ready: boolean; repo: string }>('/api/gh');

export function postAnswer(repo: string, night: string, body: { question: string; answer: string | null; note: string; baseHash: string }) {
  return post<NightDetail>(`${nightUrl(repo, night)}/answer`, body);
}

export function sendFeedback(repo: string, night: string, ids: string[], via: 'gh' | 'link') {
  return post<{ detail: NightDetail; links: { id: string; url: string }[]; errors: string[] }>(`${nightUrl(repo, night)}/feedback/send`, { ids, via });
}

// A night's evidence (a path relative to the night's folder), or a web address used as it is.
export const fileUrl = (repo: string, night: string, rel: string) =>
  /^https?:\/\//i.test(rel) ? rel : `/api/files/${encodeURIComponent(repo)}/${encodeURIComponent(night)}/${rel.split('/').map(encodeURIComponent).join('/')}`;
