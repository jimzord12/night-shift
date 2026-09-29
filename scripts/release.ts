#!/usr/bin/env node
// release — build, install and publish versioned releases of night-shift on this machine.
// One git tag = one version = one exported snapshot that the `night-shift` launcher runs, while
// the checkout keeps being edited. Building, installing and publishing are separate verbs, so a
// fresh clone can build a published tag and a new version is tried before its number is used up.
// `npm run release docs` prints the manual (VERBS below is its single source).
//
// Root: ~/.night-shift (NIGHT_SHIFT_ROOT overrides): releases/v<N>/, releases/current, bin/.
// Tags are v1, v2, … never moved: a bad release takes the next number. Cheap refusals first,
// the tag last. Exit codes: 0 done · 1 a step failed · 2 a refusal or a usage error.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readReleaseManifest } from '../src/version.ts';
import type { ReleaseManifest } from '../src/version.ts';

const REPO = path.resolve(import.meta.dirname, '..');
const VERSION = /^v([1-9]\d*)$/;

// Every verb, with what it does: the manual and the usage line are built from this list.
const VERBS = [
  { verb: 'build', args: 'v<N>', what: 'build v<N> into the releases folder: from its tag when the tag is published, else a candidate from this clean, pushed checkout (the check gate first); a candidate may be built again, a published release never' },
  { verb: 'install', args: 'v<N>', what: 'make a built v<N> the release the night-shift command runs, and write that command (night-shift, night-shift.cmd) into <root>/bin' },
  { verb: 'publish', args: 'v<N>', what: 'tag the commit a candidate v<N> was built from and push the tag; only a commit on origin/main' },
  { verb: 'list', args: '', what: 'the releases on this machine: * current, candidates marked' },
  { verb: 'docs', args: '', what: 'this manual' },
];

const DOCS = `npm run release — build, install and publish night-shift releases

${VERBS.map((v) => `  npm run release ${`${v.verb} ${v.args}`.trim().padEnd(13)} ${v.what}`).join('\n')}

A stranger with a fresh clone:
  npm run release build v18      build the published v18 (its tag, fetched from origin)
  npm run release install v18    run it: the night-shift command, in <root>/bin (put it on PATH)

Cutting a new release (maintainer, from a clean main that is pushed):
  npm run release build v19      a candidate from HEAD, after npm run check; not tagged yet
  npm run release install v19    try it on this machine (a running night-shift view needs a restart)
  npm run release publish v19    tag exactly the commit that was built and tried, and push the tag
  then a CHANGELOG.md entry, night-shift install . in each repository that uses it, and
  npm run check:clean (a fresh clone installs the new release, in a clean container)

Rules: tags are never moved or reused; a bad release takes the next number. A published release
is never rebuilt; a candidate is, after a fix. A publish that stopped half way is finished by
running publish again. NIGHT_SHIFT_ROOT (default ~/.night-shift) holds releases/ and bin/;
NIGHT_SHIFT_VERSION=v<N> pins another installed release for one shell.
Exit codes: 0 done · 1 a step failed · 2 a refusal or a usage error.`;

class Refusal extends Error {
  readonly code: number;
  constructor(message: string, code = 2) {
    super(message);
    this.code = code;
  }
}

const root = () => path.resolve(process.env.NIGHT_SHIFT_ROOT || path.join(os.homedir(), '.night-shift'));
const releasesDir = () => path.join(root(), 'releases');
const currentFile = () => path.join(releasesDir(), 'current');

function run(cmd: string, args: string[], cwd: string, shell = false) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', windowsHide: true, shell, maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw new Refusal(`could not run ${cmd}: ${r.error.message}`);
  return r;
}

function git(args: string[]): string {
  const r = run('git', args, REPO);
  if (r.status !== 0) throw new Refusal(`git ${args.join(' ')} failed: ${(r.stderr || r.stdout).trim().split('\n')[0]}`);
  return r.stdout;
}

// npm's own script through node when `npm run` started us (npm_execpath), so no shell is needed;
// otherwise one command line through the shell (Windows needs it for npm.cmd). Both avoid Node's
// DEP0190 warning, which arguments passed alongside `shell: true` raise.
function npm(args: string[], cwd: string) {
  const cli = process.env.npm_execpath;
  if (cli && /\.c?js$/.test(cli)) return run(process.execPath, [cli, ...args], cwd);
  return process.platform === 'win32' ? run(['npm.cmd', ...args].join(' '), [], cwd, true) : run('npm', args, cwd);
}

const tail = (s: string) => s.trim().split(/\r?\n/).slice(-12).join('\n');

function readCurrent(): string | null {
  try {
    return fs.readFileSync(currentFile(), 'utf8').trim() || null;
  } catch {
    return null;
  }
}

const folderOf = (version: string) => path.join(releasesDir(), version);
const writeManifest = (folder: string, m: ReleaseManifest) => fs.writeFileSync(path.join(folder, 'version.json'), `${JSON.stringify(m, null, 2)}\n`);

// The commit origin's tag names: a sha, '' when origin has no such tag, null when origin cannot be
// asked (offline).
function originTag(version: string): string | null {
  const r = run('git', ['ls-remote', '--tags', 'origin', `refs/tags/${version}`, `refs/tags/${version}^{}`], REPO);
  if (r.status !== 0) return null;
  const lines = r.stdout.trim().split('\n').filter(Boolean).map((l) => l.split(/\s+/));
  // An annotated tag lists its object and, peeled (^{}), the commit it names.
  return (lines.find(([, ref]) => ref.endsWith('^{}')) ?? lines[0])?.[0] ?? '';
}
const localTag = (version: string) => (git(['tag', '-l', version]).trim() ? git(['rev-parse', `${version}^{commit}`]).trim() : '');

function build(version: string): void {
  const folder = folderOf(version);
  const built = readReleaseManifest(folder);
  // A published release is never rebuilt; a candidate may be, after a fix or once its tag exists.
  if (built && !built.candidate) throw new Refusal(`${folder} is already a complete release; releases are never rebuilt (npm run release install ${version} runs it)`);
  const remote = originTag(version);
  let local = localTag(version);
  if (local && remote !== null && remote !== local) {
    throw new Refusal(remote ? `tag ${version} here names ${local.slice(0, 7)}, origin's names ${remote.slice(0, 7)}; tags never move, so fix the local tag first` : `tag ${version} exists only here, not on origin: finish publishing it (npm run release publish ${version}) or take the next number`);
  }
  if (!local && remote) {
    // Published but not fetched here: fetch it, so a published version is always built from its tag.
    git(['fetch', 'origin', 'tag', version, '--no-tags', '--quiet']);
    local = localTag(version);
  }
  // Offline, a tag only here may be what a rejected push left on a candidate: not proof of a release.
  if (local && remote === null && built?.candidate) throw new Refusal(`origin cannot be reached, so there is no telling whether tag ${version} was ever pushed; build it again online, or finish with npm run release publish ${version}`);
  const tagged = !!local;
  let sha: string;
  if (tagged) {
    sha = local;
    console.log(`building ${version} from its tag (${sha.slice(0, 7)})…`);
  } else {
    if (remote === null) throw new Refusal(`origin cannot be reached, so there is no telling whether ${version} is published; a candidate needs origin`);
    const dirty = git(['status', '--porcelain']).trim();
    if (dirty) throw new Refusal(`${version} is not published, so it would be a candidate from this checkout, and the tree is dirty; commit first:\n${dirty}`);
    if (run('git', ['fetch', 'origin', 'main', '--quiet'], REPO).status !== 0) throw new Refusal('could not fetch origin/main; a candidate must be on it');
    sha = git(['rev-parse', 'HEAD']).trim();
    if (run('git', ['merge-base', '--is-ancestor', 'HEAD', 'origin/main'], REPO).status !== 0) throw new Refusal(`HEAD ${sha.slice(0, 7)} is not on origin/main; push first`);
    console.log(`${version} is not published: building a candidate from ${sha.slice(0, 7)}; running the check gate…`);
    const check = npm(['run', 'check'], REPO);
    if (check.status !== 0) throw new Refusal(`the check gate is red:\n${tail(check.stdout + check.stderr)}`);
  }

  // An incomplete folder (no version.json) is this script's own leftover: empty it for a clean build.
  if (fs.existsSync(folder)) for (const entry of fs.readdirSync(folder)) fs.rmSync(path.join(folder, entry), { recursive: true, force: true, maxRetries: 3 });
  fs.mkdirSync(folder, { recursive: true });
  const tar = `.release-${version}.tar`;
  try {
    git(['archive', '--format=tar', '-o', path.join(folder, tar), sha]);
    const x = run('tar', ['-xf', tar], folder);
    if (x.status !== 0) throw new Refusal(`tar failed: ${x.stderr.trim()}`, 1);
  } finally {
    fs.rmSync(path.join(folder, tar), { force: true });
  }
  console.log(`exported into ${folder}; installing and building…`);
  const ci = npm(['ci', '--no-audit', '--no-fund'], folder);
  if (ci.status !== 0) throw new Refusal(`npm ci failed:\n${tail(ci.stdout + ci.stderr)}`, 1);
  const web = npm(['run', 'build'], folder);
  if (web.status !== 0) throw new Refusal(`the web build failed:\n${tail(web.stdout + web.stderr)}`, 1);
  // The manifest last: a folder without it is incomplete, and the next build starts it over.
  writeManifest(folder, { version, commit: sha, date: new Date().toISOString(), ...(tagged ? {} : { candidate: true }) });
  console.log(`${tagged ? 'release' : 'candidate'} ${version} built: ${folder}`);
  console.log(`next: npm run release install ${version}${tagged ? '' : `, try it, then npm run release publish ${version}`}`);
}

function install(version: string): void {
  const m = readReleaseManifest(folderOf(version));
  if (!m || m.version !== version) throw new Refusal(`${version} is not built here; run npm run release build ${version} first (npm run release list shows what is)`);
  // A candidate whose number was published meanwhile from another commit would run the wrong code.
  if (m.candidate) {
    // Origin's tag decides; the local one only offline (it may be a half-finished publish).
    const tag = originTag(version) ?? localTag(version);
    if (tag && tag !== m.commit) throw new Refusal(`${version} was published from ${tag.slice(0, 7)}, not from this candidate (${m.commit.slice(0, 7)}); run npm run release build ${version} to build the published one`);
  }
  fs.writeFileSync(currentFile(), `${version}\n`);
  console.log(`current → ${version}${m.candidate ? ' (a candidate, not published)' : ''} (${m.commit.slice(0, 7)}); NIGHT_SHIFT_VERSION pins another per shell`);
  writeLaunchers();
}

function publish(version: string): void {
  const folder = folderOf(version);
  const m = readReleaseManifest(folder);
  if (!m || m.version !== version) throw new Refusal(`${version} is not built here; build and try a candidate first (npm run release build ${version})`);
  if (!m.candidate) throw new Refusal(`${version} was built from its published tag; there is nothing to publish`);
  const remote = originTag(version);
  if (remote === null) throw new Refusal('origin cannot be reached; publishing needs it to check and push the tag');
  const local = localTag(version);
  // A tag of this number that names another commit is someone else's release; one that names this
  // candidate is an earlier publish that stopped half way, which this run finishes.
  for (const [where, sha] of [['here', local], ['on origin', remote]] as const) {
    if (sha && sha !== m.commit) throw new Refusal(`tag ${version} exists ${where} and names ${sha.slice(0, 7)}, not this candidate (${m.commit.slice(0, 7)}); a bad release takes the next number`);
  }
  if (run('git', ['fetch', 'origin', 'main', '--quiet'], REPO).status !== 0) throw new Refusal('could not fetch origin/main; publishing needs it');
  if (run('git', ['merge-base', '--is-ancestor', m.commit, 'origin/main'], REPO).status !== 0) throw new Refusal(`the candidate was built from ${m.commit.slice(0, 7)}, which is not on origin/main`);

  if (!local && remote) {
    // Already pushed from another clone at this commit: take origin's tag rather than make a second one.
    git(['fetch', 'origin', 'tag', version, '--no-tags', '--quiet']);
  } else if (!local) {
    const tag = run('git', ['tag', '-a', version, m.commit, '-m', `release ${version}`], REPO);
    if (tag.status !== 0) throw new Refusal(`git tag failed: ${tag.stderr.trim()}`, 1);
  }
  if (!remote) {
    const push = run('git', ['push', 'origin', `refs/tags/${version}`], REPO);
    if (push.status !== 0) throw new Refusal(`tagged locally, but the push was rejected: ${push.stderr.trim()}; run npm run release publish ${version} again to finish`, 1);
  }
  writeManifest(folder, { version, commit: m.commit, date: m.date });
  console.log(`published ${version} (${m.commit.slice(0, 7)})`);
}

function list(): void {
  const current = readCurrent();
  const names = fs.existsSync(releasesDir()) ? fs.readdirSync(releasesDir()).filter((n) => VERSION.test(n)) : [];
  if (!names.length) return console.log(`no releases under ${releasesDir()}`);
  for (const n of names.sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))) {
    const m = readReleaseManifest(folderOf(n));
    console.log(`${n === current ? '*' : ' '} ${n.padEnd(5)} ${m ? `${m.commit.slice(0, 7)}  ${m.date}${m.candidate ? '  candidate' : ''}` : '(incomplete)'}`);
  }
}

function writeLaunchers(): void {
  const bin = path.join(root(), 'bin');
  fs.mkdirSync(bin, { recursive: true });
  const r = releasesDir();
  const cmd = [
    '@echo off',
    'rem night-shift launcher; written by `npm run release install`.',
    'setlocal',
    `set "R=${r}"`,
    'set "V=%NIGHT_SHIFT_VERSION%"',
    'if not defined V if exist "%R%\\current" set /p V=<"%R%\\current"',
    'if not defined V (',
    '  echo night-shift: no current release; run "npm run release install v<N>" in the night-shift checkout 1>&2',
    '  exit /b 2',
    ')',
    'if not exist "%R%\\%V%\\src\\cli.ts" (',
    '  echo night-shift: release %V% is not installed 1>&2',
    '  exit /b 2',
    ')',
    'node "%R%\\%V%\\src\\cli.ts" %*',
    'exit /b %ERRORLEVEL%',
  ].join('\r\n');
  const sh = [
    '#!/bin/sh',
    '# night-shift launcher; written by `npm run release install`.',
    `R="${r.replace(/\\/g, '/')}"`,
    'V="${NIGHT_SHIFT_VERSION:-}"',
    '[ -z "$V" ] && [ -f "$R/current" ] && V=$(head -n 1 "$R/current" | tr -d \'\\r\')',
    '[ -z "$V" ] && { echo "night-shift: no current release" >&2; exit 2; }',
    '[ -f "$R/$V/src/cli.ts" ] || { echo "night-shift: release $V is not installed" >&2; exit 2; }',
    'exec node "$R/$V/src/cli.ts" "$@"',
  ].join('\n');
  fs.writeFileSync(path.join(bin, 'night-shift.cmd'), `${cmd}\r\n`);
  fs.writeFileSync(path.join(bin, 'night-shift'), `${sh}\n`, { mode: 0o755 });
  const onPath = (process.env.PATH || '').split(path.delimiter).some((p) => p && path.resolve(p).toLowerCase() === bin.toLowerCase());
  console.log(`night-shift command written into ${bin}${onPath ? '' : `\n${bin} is not on PATH: add it to your user PATH, then open a new shell`}`);
}

// The verbs from before build, install and publish were split: say what replaced them.
const RENAMED: Record<string, string> = {
  switch: 'npm run release install v<N>',
  'install-launchers': 'npm run release install v<N> (it writes the command too)',
};

function main(argv: string[]): void {
  const [command, arg, ...rest] = argv;
  const usage = `usage: npm run release ${VERBS.map((v) => `${v.verb}${v.args ? ` ${v.args}` : ''}`).join(' | ')} (npm run release docs explains each)`;
  if (rest.length) throw new Refusal(usage);
  const version = () => {
    if (!arg || !VERSION.test(arg)) throw new Refusal(`usage: npm run release ${command} v<N> (v1, v2, … no leading zero)`);
    return arg;
  };
  switch (command) {
    case 'build':
      return build(version());
    case 'install':
      return install(version());
    case 'publish':
      return publish(version());
    case 'list':
      return list();
    case 'docs':
      return console.log(DOCS);
    default:
      if (command && RENAMED[command]) throw new Refusal(`"${command}" is now ${RENAMED[command]}; npm run release docs has the rest`);
      if (command && VERSION.test(command)) throw new Refusal(`releasing is now three steps: npm run release build ${command}, install ${command}, publish ${command}; npm run release docs explains them`);
      throw new Refusal(usage);
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(`error: ${(error as Error).message}`);
  process.exit(error instanceof Refusal ? error.code : 1);
}
