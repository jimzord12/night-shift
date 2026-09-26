// `night-shift install`: sets a repository up for Claude Code. It copies the two skills into
// .claude/skills/, adds the session-end hook that runs the Meter to .claude/settings.json (keeping
// every existing setting), adds the .gitignore lines and registers the repository with the Viewer.

import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, parseJson, registerRepo, writeJson } from './store.ts';
import { readReleaseManifest } from './version.ts';
import { ensureGitignore } from './repo.ts';

export const SKILLS = ['start-night-shift', 'do-night-shift-follow-up'];

// How agents and the hook call the tool: the `night-shift` launcher when this is an installed
// release, else this checkout's CLI through node.
export function cliCommand(): string {
  if (readReleaseManifest(REPO_ROOT)) return 'night-shift';
  return `node "${path.join(REPO_ROOT, 'src', 'cli.ts').split(path.sep).join('/')}"`;
}

interface HookEntry {
  matcher?: string;
  hooks?: { type?: string; command?: string }[];
}

export function install(repo: string, cli = cliCommand()): string[] {
  const out: string[] = [];
  for (const name of SKILLS) {
    const text = fs.readFileSync(path.join(REPO_ROOT, 'skills', name, 'SKILL.md'), 'utf8').replaceAll('{{cli}}', cli);
    const to = path.join(repo, '.claude', 'skills', name, 'SKILL.md');
    const before = fs.existsSync(to) ? fs.readFileSync(to, 'utf8') : null;
    if (before !== text) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.writeFileSync(to, text);
      out.push(`${before === null ? 'Added' : 'Updated'} the ${name} skill.`);
    }
  }

  const settingsFile = path.join(repo, '.claude', 'settings.json');
  let settings: Record<string, unknown> = {};
  if (fs.existsSync(settingsFile)) {
    try {
      settings = parseJson(fs.readFileSync(settingsFile, 'utf8')) as Record<string, unknown>;
    } catch (error) {
      throw new Error(`${settingsFile} is not valid JSON (${(error as Error).message}); fix it, then run install again`);
    }
  }
  const hooks = (settings.hooks ?? {}) as Record<string, HookEntry[]>;
  const command = `${cli} meter`;
  const entries = (hooks.SessionEnd ?? []).map((e) => ({ ...e, hooks: (e.hooks ?? []).filter((h) => h.command !== command && !/(night-shift|cli\.ts"?) meter$/.test(h.command ?? '')) })).filter((e) => e.hooks.length);
  const had = JSON.stringify(hooks.SessionEnd ?? []);
  hooks.SessionEnd = [...entries, { hooks: [{ type: 'command', command }] }];
  if (JSON.stringify(hooks.SessionEnd) !== had) {
    settings.hooks = hooks;
    writeJson(settingsFile, settings);
    out.push('Added the session-end hook that measures each night.');
  }

  if (ensureGitignore(repo)) out.push('Added the Night Shift lines to .gitignore.');
  const ref = registerRepo(repo);
  out.push(`Registered ${ref.name} with the Viewer.`);
  out.push(`Ready. Tell an agent "start night shift" in ${repo}; open the Viewer with: ${cli} view`);
  return out;
}
