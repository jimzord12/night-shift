// `night-shift install`: sets a repository up for Claude Code. It copies the two skills into
// .claude/skills/, adds the session-end hook that runs the Meter to .claude/settings.json (keeping
// every existing setting), adds the .gitignore lines and registers the repository with the Viewer.

import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, parseJson, registerRepo, writeJson } from './store.ts';
import { readReleaseManifest } from './version.ts';
import { ensureGitignore, ensureIgnored, isTracked } from './repo.ts';

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
  out.push(`For nights nobody watches, let agents run the tool without asking: ${cli} allow`);
  return out;
}

// What an unattended agent needs: to run the tool, and to write its JSON under .night-shift/.
export function allowRules(cli: string): string[] {
  return [`Bash(${cli}:*)`, `PowerShell(${cli}:*)`, 'Edit(/.night-shift/**)'];
}

// `night-shift allow`: adds allowRules to the developer's own .claude/settings.local.json, keeping
// every other setting, and makes sure git ignores that file. Permissions are personal, so they
// never go into the shared settings.json.
export function allow(repo: string, cli = cliCommand()): string[] {
  const rel = '.claude/settings.local.json';
  const file = path.join(repo, ...rel.split('/'));
  let settings: Record<string, unknown> = {};
  if (fs.existsSync(file)) {
    try {
      settings = parseJson(fs.readFileSync(file, 'utf8')) as Record<string, unknown>;
    } catch (error) {
      throw new Error(`${file} is not valid JSON (${(error as Error).message}); fix it, then run allow again`);
    }
  }
  const permissions = (settings.permissions ?? {}) as { allow?: string[] };
  const have = permissions.allow ?? [];
  const added = allowRules(cli).filter((r) => !have.includes(r));
  const out: string[] = [];
  if (added.length) {
    settings.permissions = { ...permissions, allow: [...have, ...added] };
    writeJson(file, settings);
    out.push(`Allowed in ${rel}: ${added.join(', ')}.`);
  } else out.push(`${rel} already allows the tool; nothing changed.`);
  const ignored = ensureIgnored(repo, rel);
  if (isTracked(repo, rel)) out.push(`Warning: git already tracks ${rel}, so these rules would be committed for everyone. Untrack it with: git rm --cached ${rel}${ignored ? '; .gitignore now lists it' : ''}`);
  else if (ignored) out.push(`Added ${rel} to .gitignore: permissions are yours, not the repository's.`);
  out.push('Agents here can now run the tool and write .night-shift/ without asking. Anything else a night needs (tests, git, a database) follows your own permissions; allow it before you leave a night running.');
  return out;
}
