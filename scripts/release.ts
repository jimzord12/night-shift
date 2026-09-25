#!/usr/bin/env node
// release — cut a versioned release of night-shift and manage the releases on this machine.
// One git tag = one version = one exported snapshot that the `night-shift` launcher runs, while
// the checkout keeps being edited.
//
//   npm run release v<N>                 export HEAD, install, build the web app, write version.json, tag, push
//   npm run release switch v<N>          make v<N> the release the launcher runs (`current`)
//   npm run release list                 the releases on this machine, current marked
//   npm run release install-launchers    write night-shift(.cmd) into <root>/bin
//
// Root: ~/.night-shift (NIGHT_SHIFT_ROOT overrides): releases/v<N>/, releases/current, bin/.
// Tags are v1, v2, … never moved: a bad release takes the next number. Cheap refusals first,
// the tag last. Exit codes: 0 done · 1 a step failed · 2 a refusal or a usage error.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readReleaseManifest } from '../src/version.ts';

const REPO = path.resolve(import.meta.dirname, '..');
const VERSION = /^v([1-9]\d*)$/;

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

function npm(args: string[], cwd: string) {
  return run(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, cwd, process.platform === 'win32');
}

const tail = (s: string) => s.trim().split(/\r?\n/).slice(-12).join('\n');

function readCurrent(): string | null {
  try {
    return fs.readFileSync(currentFile(), 'utf8').trim() || null;
  } catch {
    return null;
  }
}

function build(version: string): void {
  const folder = path.join(releasesDir(), version);
  if (git(['tag', '-l', version]).trim()) throw new Refusal(`tag ${version} already exists; a bad release takes the next number`);
  if (readReleaseManifest(folder)) throw new Refusal(`${folder} is already a complete release; releases are never rebuilt`);
  const remote = run('git', ['ls-remote', '--tags', 'origin', version], REPO);
  if (remote.status === 0 && remote.stdout.trim()) throw new Refusal(`tag ${version} exists on origin; fetch tags and take the next number`);
  const dirty = git(['status', '--porcelain']).trim();
  if (dirty) throw new Refusal(`the tree is dirty; commit first:\n${dirty}`);
  run('git', ['fetch', 'origin', 'main', '--quiet'], REPO);
  const sha = git(['rev-parse', 'HEAD']).trim();
  if (run('git', ['merge-base', '--is-ancestor', 'HEAD', 'origin/main'], REPO).status !== 0) throw new Refusal(`HEAD ${sha.slice(0, 7)} is not on origin/main; push first`);

  console.log(`releasing ${version} from ${sha.slice(0, 7)}; running the check gate…`);
  const check = npm(['run', 'check'], REPO);
  if (check.status !== 0) throw new Refusal(`the check gate is red:\n${tail(check.stdout + check.stderr)}`);

  // An incomplete folder (no version.json) is this script's own leftover: empty it for a clean build.
  if (fs.existsSync(folder)) for (const entry of fs.readdirSync(folder)) fs.rmSync(path.join(folder, entry), { recursive: true, force: true, maxRetries: 3 });
  fs.mkdirSync(folder, { recursive: true });
  const tar = `.release-${version}.tar`;
  try {
    git(['archive', '--format=tar', '-o', path.join(folder, tar), 'HEAD']);
    const x = run('tar', ['-xf', tar], folder);
    if (x.status !== 0) throw new Refusal(`tar failed: ${x.stderr.trim()}`, 1);
  } finally {
    fs.rmSync(path.join(folder, tar), { force: true });
  }
  console.log(`exported into ${folder}; installing and building…`);
  const ci = npm(['ci', '--no-audit', '--no-fund'], folder);
  if (ci.status !== 0) throw new Refusal(`npm ci failed; no tag written:\n${tail(ci.stdout + ci.stderr)}`, 1);
  const web = npm(['run', 'build'], folder);
  if (web.status !== 0) throw new Refusal(`the web build failed; no tag written:\n${tail(web.stdout + web.stderr)}`, 1);
  fs.writeFileSync(path.join(folder, 'version.json'), `${JSON.stringify({ version, commit: sha, date: new Date().toISOString() }, null, 2)}\n`);

  const tag = run('git', ['tag', '-a', version, sha, '-m', `release ${version}`], REPO);
  if (tag.status !== 0) {
    fs.rmSync(path.join(folder, 'version.json'), { force: true });
    throw new Refusal(`git tag failed: ${tag.stderr.trim()}; re-run to rebuild and tag`, 1);
  }
  const push = run('git', ['push', 'origin', version], REPO);
  if (push.status !== 0) throw new Refusal(`tagged locally, push rejected: ${push.stderr.trim()}; run git push origin ${version}`, 1);
  console.log(`release ${version} ready: ${folder}`);
  if (!readCurrent()) switchTo(version);
}

function switchTo(version: string): void {
  const m = readReleaseManifest(path.join(releasesDir(), version));
  if (!m || m.version !== version) throw new Refusal(`${version} is not an installed release; run npm run release list`);
  fs.writeFileSync(currentFile(), `${version}\n`);
  console.log(`current → ${version} (${m.commit.slice(0, 7)}); NIGHT_SHIFT_VERSION pins another per shell`);
}

function list(): void {
  const current = readCurrent();
  const names = fs.existsSync(releasesDir()) ? fs.readdirSync(releasesDir()).filter((n) => VERSION.test(n)) : [];
  if (!names.length) return console.log(`no releases under ${releasesDir()}`);
  for (const n of names.sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))) {
    const m = readReleaseManifest(path.join(releasesDir(), n));
    console.log(`${n === current ? '*' : ' '} ${n.padEnd(5)} ${m ? `${m.commit.slice(0, 7)}  ${m.date}` : '(incomplete)'}`);
  }
}

function installLaunchers(): void {
  const bin = path.join(root(), 'bin');
  fs.mkdirSync(bin, { recursive: true });
  const r = releasesDir();
  const cmd = [
    '@echo off',
    'rem night-shift launcher; written by `npm run release install-launchers`.',
    'setlocal',
    `set "R=${r}"`,
    'set "V=%NIGHT_SHIFT_VERSION%"',
    'if not defined V if exist "%R%\\current" set /p V=<"%R%\\current"',
    'if not defined V (',
    '  echo night-shift: no current release; run "npm run release switch v<N>" in the night-shift checkout 1>&2',
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
    '# night-shift launcher; written by `npm run release install-launchers`.',
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
  console.log(`launchers written into ${bin}${onPath ? '' : `\n${bin} is not on PATH: add it to your user PATH, then open a new shell`}`);
}

function main(argv: string[]): void {
  const [command, arg] = argv;
  switch (command) {
    case 'switch':
      if (!arg || !VERSION.test(arg)) throw new Refusal('usage: npm run release switch v<N>');
      return switchTo(arg);
    case 'list':
      return list();
    case 'install-launchers':
      return installLaunchers();
    default:
      if (!command || !VERSION.test(command)) throw new Refusal('usage: npm run release v<N> | switch v<N> | list | install-launchers (v1, v2, … no leading zero)');
      return build(command);
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(`error: ${(error as Error).message}`);
  process.exit(error instanceof Refusal ? error.code : 1);
}
