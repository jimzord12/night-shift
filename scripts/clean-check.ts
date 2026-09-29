#!/usr/bin/env node
// check:clean — prove that a stranger's fresh clone installs a published release: a clean Linux
// container (scripts/clean/) clones the public repository, builds and installs the release, runs
// a tiny night by hand and asks the Viewer for it. Needs Docker. `npm run check:clean docs` explains.
// Exit codes: 0 PASS · 1 FAIL · 2 a refusal or a usage error.

import path from 'node:path';
import { spawnSync } from 'node:child_process';

const REPO = path.resolve(import.meta.dirname, '..');
const IMAGE = 'night-shift-clean';

const DOCS = `npm run check:clean — a fresh clone installs a published release, proven in a clean container

  npm run check:clean [v<N>] [--ref <branch>]   run the check (Docker must be running)
  npm run check:clean docs                      this manual

What it does, in a Linux container with Node and git and nothing else:
  clone the public repository (origin's URL) at <branch> (default main)
  npm run release build v<N>, npm run release install v<N>   (default: the newest published tag)
  night-shift --version names v<N>; night-shift docs runs
  a throwaway git repository: night-shift install ., start, record, close, check
  night-shift view answers and lists that night
The last line is PASS, or FAIL with the step that broke. It checks what is published (the tag,
and the release script on <branch>), not this checkout: push first. Linux only; Windows is
covered by using the tool, not by a fresh machine.
Run it once per release, after npm run release publish.
Exit codes: 0 PASS · 1 FAIL · 2 a refusal or a usage error.`;

function sh(cmd: string, args: string[], inherit = false) {
  return spawnSync(cmd, args, { cwd: REPO, encoding: 'utf8', windowsHide: true, stdio: inherit ? 'inherit' : 'pipe' });
}

function refuse(message: string): never {
  console.error(`error: ${message}`);
  process.exit(2);
}

function main(argv: string[]): number {
  if (argv[0] === 'docs') {
    console.log(DOCS);
    return 0;
  }
  let version: string | undefined;
  let ref = 'main';
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--ref' && argv[i + 1]) ref = argv[++i];
    else if (/^v[1-9]\d*$/.test(argv[i]) && !version) version = argv[i];
    else refuse(`usage: npm run check:clean [v<N>] [--ref <branch>] | docs (npm run check:clean docs explains)`);
  }
  if (sh('docker', ['info', '--format', '{{.ServerVersion}}']).status !== 0) refuse('Docker is not running; start Docker Desktop and try again');
  const url = sh('git', ['remote', 'get-url', 'origin']).stdout.trim();
  if (!url) refuse('this checkout has no origin to clone');
  if (!version) {
    const tags = sh('git', ['ls-remote', '--tags', 'origin', 'refs/tags/v*']).stdout.match(/refs\/tags\/v\d+$/gm) ?? [];
    const numbers = tags.map((t) => Number(t.slice('refs/tags/v'.length))).sort((a, b) => b - a);
    if (!numbers.length) refuse('origin has no published release tag');
    version = `v${numbers[0]}`;
  }
  console.log(`clean-machine check: ${url} at ${ref}, release ${version}`);
  if (sh('docker', ['build', '--quiet', '-t', IMAGE, path.join(REPO, 'scripts', 'clean')], true).status !== 0) return 1;
  return sh('docker', ['run', '--rm', IMAGE, url, ref, version], true).status === 0 ? 0 : 1;
}

process.exit(main(process.argv.slice(2)));
