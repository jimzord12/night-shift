// The Meter: what a night cost, read from Claude Code's own session logs after the session ends.
// Claude Code documents those logs as internal and free to change between versions, so every
// field is optional here: whatever is missing becomes null ("unknown") and never fails a night.
//
// Sources, in order of trust:
//   the session log's last `cost-state` entry: cost, durations, lines and tokens per model, as
//     Claude Code itself counted them (present in most sessions, not all);
//   otherwise the assistant messages of the session log and of its sub-agents' logs, one usage
//     per message id, priced with the table below.

import fs from 'node:fs';
import path from 'node:path';
import type { Metrics, ModelUsage } from './types.ts';
import { localIso } from './store.ts';

// US dollars per million tokens: [input, output, cache read]. Cache writes cost 1.25x input for the
// 5-minute cache and 2x for the 1-hour cache. A model not listed here has no fallback price.
const PRICES: [RegExp, number, number, number][] = [
  [/^claude-fable-5-1/, 10, 50, 0.25],
  [/^claude-mythos-5-1/, 10, 50, 0.25],
  [/^claude-fable-5/, 10, 50, 1],
  [/^claude-opus-5-5/, 4, 20, 0.2],
  [/^claude-opus-(5|4-[5-9])/, 5, 25, 0.5],
  [/^claude-sonnet-5/, 2, 10, 0.2],
  [/^claude-sonnet-4/, 3, 15, 0.3],
  [/^claude-haiku-4/, 1, 5, 0.1],
];

// "claude-opus-5[1m]" and "claude-opus-5" are one model.
export const modelName = (m: string) => m.replace(/\[[^\]]*\]$/, '').trim();

interface Tally {
  input: number;
  output: number;
  reasoning: number;
  cacheRead: number;
  cacheWrite5m: number;
  cacheWrite1h: number;
}

const blank = (): Tally => ({ input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite5m: 0, cacheWrite1h: 0 });

export function priceOf(model: string, t: Tally): number | null {
  const row = PRICES.find(([re]) => re.test(modelName(model)));
  if (!row) return null;
  const [, input, output, read] = row;
  const usd = (t.input * input + t.output * output + t.cacheRead * read + t.cacheWrite5m * input * 1.25 + t.cacheWrite1h * input * 2) / 1e6;
  return Math.round(usd * 100) / 100;
}

interface LogLine {
  type?: string;
  timestamp?: string;
  version?: string;
  message?: { id?: string; model?: string; usage?: Record<string, unknown> };
  [k: string]: unknown;
}

function readLines(file: string): LogLine[] {
  let text: string;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  const out: LogLine[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    try {
      const v = JSON.parse(line) as unknown;
      if (v && typeof v === 'object') out.push(v as LogLine);
    } catch {
      // a line cut off by a crash: skip it
    }
  }
  return out;
}

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

// Token usage per model from assistant messages; a message logged several times counts once.
function tallyMessages(lines: LogLine[], into: Map<string, Tally>, seen: Set<string>): void {
  for (const l of lines) {
    if (l.type !== 'assistant' || !l.message?.usage) continue;
    const id = l.message.id ?? `${l.timestamp}-${Math.random()}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const u = l.message.usage;
    const model = modelName(l.message.model ?? 'unknown');
    if (model === '<synthetic>') continue;
    const t = into.get(model) ?? blank();
    t.input += num(u.input_tokens);
    t.output += num(u.output_tokens);
    t.reasoning += num((u.output_tokens_details as Record<string, unknown> | undefined)?.thinking_tokens);
    t.cacheRead += num(u.cache_read_input_tokens);
    const split = u.cache_creation as Record<string, unknown> | undefined;
    if (split && (typeof split.ephemeral_1h_input_tokens === 'number' || typeof split.ephemeral_5m_input_tokens === 'number')) {
      t.cacheWrite1h += num(split.ephemeral_1h_input_tokens);
      t.cacheWrite5m += num(split.ephemeral_5m_input_tokens);
    } else {
      t.cacheWrite5m += num(u.cache_creation_input_tokens);
    }
    into.set(model, t);
  }
}

// The session log of a Claude Code session, searched under every project folder of the config
// directory Claude Code uses (CLAUDE_CONFIG_DIR, else ~/.claude).
export function findTranscript(sessionId: string, configDir = process.env.CLAUDE_CONFIG_DIR): string | null {
  const base = path.join(configDir || path.join(process.env.USERPROFILE || process.env.HOME || '', '.claude'), 'projects');
  if (!/^[\w-]+$/.test(sessionId) || !fs.existsSync(base)) return null;
  for (const dir of fs.readdirSync(base)) {
    const file = path.join(base, dir, `${sessionId}.jsonl`);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

export function measure(transcript: string | null, sessionId: string | null, now = new Date()): Metrics {
  const metrics: Metrics = {
    source: 'claude-code',
    harness_version: null,
    session_id: sessionId,
    measured_at: localIso(now),
    duration_min: { total: null, model: null, tools: null },
    models: {},
    cost_usd: null,
    sub_agents: [],
    lines: { added: null, removed: null },
  };
  if (!transcript || !fs.existsSync(transcript)) return metrics;
  const lines = readLines(transcript);
  metrics.harness_version = [...lines].reverse().find((l) => typeof l.version === 'string')?.version ?? null;

  // Sub-agents: one log and one description file each, beside the session's log.
  const subDir = path.join(transcript.replace(/\.jsonl$/, ''), 'subagents');
  const subLogs: LogLine[][] = [];
  if (fs.existsSync(subDir)) {
    for (const f of fs.readdirSync(subDir).filter((x) => x.endsWith('.jsonl')).sort()) {
      const log = readLines(path.join(subDir, f));
      subLogs.push(log);
      let meta: Record<string, unknown> = {};
      try {
        meta = JSON.parse(fs.readFileSync(path.join(subDir, f.replace(/\.jsonl$/, '.meta.json')), 'utf8')) as Record<string, unknown>;
      } catch {
        // no description file: the agent still counts
      }
      const used = log.find((l) => l.type === 'assistant' && l.message?.model)?.message?.model;
      metrics.sub_agents.push({
        type: typeof meta.agentType === 'string' ? meta.agentType : null,
        model: used ? modelName(used) : typeof meta.model === 'string' ? meta.model : null,
        purpose: typeof meta.description === 'string' ? meta.description : null,
      });
    }
  }

  const cost = [...lines].reverse().find((l) => l.type === 'cost-state');
  if (cost) {
    const ms = (v: unknown) => (typeof v === 'number' ? Math.round(v / 600) / 100 : null);
    metrics.duration_min = { total: ms(cost.totalDuration), model: ms(cost.totalAPIDuration), tools: ms(cost.totalToolDuration) };
    metrics.lines = { added: typeof cost.totalLinesAdded === 'number' ? cost.totalLinesAdded : null, removed: typeof cost.totalLinesRemoved === 'number' ? cost.totalLinesRemoved : null };
    const usage = cost.modelUsage as Record<string, Record<string, unknown>> | undefined;
    if (usage && typeof usage === 'object') {
      for (const [m, u] of Object.entries(usage)) {
        const n = (k: string) => (typeof u[k] === 'number' ? (u[k] as number) : null);
        const entry: ModelUsage = {
          tokens: { input: n('inputTokens'), output: n('outputTokens'), reasoning: n('thinkingTokens'), cache_read: n('cacheReadInputTokens'), cache_write: n('cacheCreationInputTokens') },
          cost_usd: typeof u.costUSD === 'number' ? Math.round(u.costUSD * 100) / 100 : null,
        };
        metrics.models[modelName(m)] = merge(metrics.models[modelName(m)], entry);
      }
    }
    if (typeof cost.totalCostUSD === 'number') metrics.cost_usd = Math.round(cost.totalCostUSD * 100) / 100;
    return metrics;
  }

  // No cost record: count the messages and price them.
  const tallies = new Map<string, Tally>();
  const seen = new Set<string>();
  tallyMessages(lines, tallies, seen);
  for (const log of subLogs) tallyMessages(log, tallies, seen);
  let total: number | null = 0;
  for (const [m, t] of tallies) {
    const usd = priceOf(m, t);
    metrics.models[m] = { tokens: { input: t.input, output: t.output, reasoning: t.reasoning, cache_read: t.cacheRead, cache_write: t.cacheWrite5m + t.cacheWrite1h }, cost_usd: usd };
    total = usd === null || total === null ? null : total + usd;
  }
  metrics.cost_usd = tallies.size && total !== null ? Math.round(total * 100) / 100 : null;
  const stamps = lines.map((l) => (l.timestamp ? Date.parse(l.timestamp) : NaN)).filter(Number.isFinite);
  if (stamps.length > 1) metrics.duration_min.total = Math.round((Math.max(...stamps) - Math.min(...stamps)) / 600) / 100;
  return metrics;
}

function merge(a: ModelUsage | undefined, b: ModelUsage): ModelUsage {
  if (!a) return b;
  const add = (x: number | null, y: number | null) => (x === null || y === null ? null : x + y);
  return {
    tokens: {
      input: add(a.tokens.input, b.tokens.input),
      output: add(a.tokens.output, b.tokens.output),
      reasoning: add(a.tokens.reasoning, b.tokens.reasoning),
      cache_read: add(a.tokens.cache_read, b.tokens.cache_read),
      cache_write: add(a.tokens.cache_write, b.tokens.cache_write),
    },
    cost_usd: add(a.cost_usd, b.cost_usd),
  };
}
