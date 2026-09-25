import type { Overview, QuestionEntry } from '../../src/types.ts';

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

export const getOverview = (refresh = false) => call<Overview>(`/api/overview${refresh ? '?refresh=1' : ''}`);
export const getQuestions = () => call<QuestionEntry[]>('/api/questions');

export function postAnswer(id: string, body: { status: 'answered' | 'deferred'; value: string[]; note: string; baseHash: string }) {
  return call<QuestionEntry>(`/api/questions/${encodeURIComponent(id)}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// A path relative to .night-shift/ (question images).
export const fileUrl = (rel: string) => `/api/files/${rel.split('/').map(encodeURIComponent).join('/')}`;
