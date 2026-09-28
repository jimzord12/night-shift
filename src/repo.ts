// What Night Shift touches in a repository outside its own files: the root folder, the
// .gitignore lines, and commits of the history folder (and nothing else).

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Hooks can print a lot (a whole test suite); a smaller buffer would kill git mid-commit.
function git(repo: string, args: string[]) {
  return spawnSync('git', args, { cwd: repo, encoding: 'utf8', windowsHide: true, maxBuffer: 256 * 1024 * 1024 });
}

// The repository a command acts on: the git top level of `dir`, else `dir` itself.
export function repoRoot(dir = process.cwd()): string {
  const r = git(dir, ['rev-parse', '--show-toplevel']);
  return r.status === 0 && r.stdout.trim() ? path.resolve(r.stdout.trim()) : path.resolve(dir);
}

export const isGitRepo = (repo: string) => git(repo, ['rev-parse', '--is-inside-work-tree']).stdout.trim() === 'true';

const IGNORE_BLOCK = ['# Night Shift: its working files stay local; the history of nights is committed.', '.night-shift/*', '!.night-shift/history/'];

// Adds the ignore lines once. An older bare `.night-shift/` line would hide the history folder
// from git, so it is replaced.
export function ensureGitignore(repo: string): boolean {
  const file = path.join(repo, '.gitignore');
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const lines = text.split(/\r?\n/);
  if (lines.some((l) => l.trim() === '.night-shift/*')) return false;
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const kept = lines.filter((l) => !['.night-shift/', '/.night-shift/', '.night-shift'].includes(l.trim()));
  while (kept.length && kept[kept.length - 1] === '') kept.pop();
  const next = [...kept, ...(kept.length ? [''] : []), ...IGNORE_BLOCK, ''].join(eol);
  fs.writeFileSync(file, next);
  return true;
}

// Keeps a personal file (relative path) out of commits: adds it to .gitignore unless git already
// ignores it, a global ignore included. Outside git there is nothing to protect.
export function ensureIgnored(repo: string, rel: string): boolean {
  if (!isGitRepo(repo) || git(repo, ['check-ignore', '-q', '--no-index', '--', rel]).status === 0) return false;
  const file = path.join(repo, '.gitignore');
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  fs.writeFileSync(file, `${text}${text && !text.endsWith('\n') ? eol : ''}${rel}${eol}`);
  return true;
}

// A file git already tracks: .gitignore no longer keeps its changes out of commits.
export const isTracked = (repo: string, rel: string) => isGitRepo(repo) && git(repo, ['ls-files', '--error-unmatch', '--', rel]).status === 0;

export interface CommitResult {
  committed: boolean;
  message: string;
  // Everything git and its hooks printed, when the commit was refused.
  output?: string;
}

// The last lines a refused commit printed: the hook's reason sits there, above git's own last line.
const tail = (out: string, lines = 6) =>
  out
    .trim()
    .split('\n')
    .map((l) => l.trimEnd())
    .filter(Boolean)
    .slice(-lines)
    .map((l) => (l.length > 500 ? `${l.slice(0, 500)}…` : l))
    .join('\n  ');

// Commits only `rel` (a path inside the repository), whatever else is staged or changed, so the
// developer's own work is never swept into a Night Shift commit. Git hooks run as usual.
export function commitPath(repo: string, rel: string, message: string): CommitResult {
  if (!isGitRepo(repo)) return { committed: false, message: 'not a git repository; history kept on disk only' };
  const add = git(repo, ['add', '--', rel]);
  if (add.status !== 0) return { committed: false, message: `git add failed: ${(add.stderr || add.stdout).trim().split('\n')[0]}` };
  const diff = git(repo, ['diff', '--cached', '--quiet', '--', rel]);
  if (diff.status === 0) return { committed: false, message: 'history already up to date' };
  const commit = git(repo, ['commit', '-m', message, '--only', '--', rel]);
  if (commit.status !== 0) {
    const output = [commit.stdout, commit.stderr, commit.error?.message].filter((s) => s?.trim()).join('\n');
    const reason = output.trim() ? tail(output) : `(no output; exit ${commit.status ?? commit.signal})`;
    return { committed: false, message: `git commit failed:\n  ${reason}`, output: output.trim() ? output : undefined };
  }
  return { committed: true, message: 'history committed' };
}
