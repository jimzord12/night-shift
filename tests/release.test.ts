// The release script (TASK-49.1): build, install and publish as separate verbs. It runs for real in
// a scratch repository that holds a copy of the script, with a bare repository standing in for
// origin, so tags are really created, pushed and fetched; npm ci and the build run on a package
// with no dependencies. And every script's docs names every verb.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const HERE = path.resolve(import.meta.dirname, '..');

function sh(cwd: string, cmd: string, args: string[], env: Record<string, string> = {}) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', windowsHide: true, env: { ...process.env, ...env } });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}
const git = (cwd: string, ...args: string[]) => {
  const r = sh(cwd, 'git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args]);
  assert.equal(r.status, 0, r.out);
  return r.out.trim();
};

// A repository shaped like this one for the script: its copy of release.ts and version.ts, a package
// whose check and build do nothing, pushed to a bare origin.
function scratch(build = 'node -e 0') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-release-'));
  const origin = path.join(dir, 'origin.git');
  const repo = path.join(dir, 'repo');
  git(dir, 'init', '--quiet', '--bare', '-b', 'main', origin);
  fs.mkdirSync(path.join(repo, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(repo, 'src'));
  fs.copyFileSync(path.join(HERE, 'scripts', 'release.ts'), path.join(repo, 'scripts', 'release.ts'));
  fs.copyFileSync(path.join(HERE, 'src', 'version.ts'), path.join(repo, 'src', 'version.ts'));
  const pkg = { name: 'ns-scratch', version: '0.0.0', private: true, type: 'module', scripts: { check: 'node -e 0', build } };
  fs.writeFileSync(path.join(repo, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
  fs.writeFileSync(path.join(repo, 'package-lock.json'), `${JSON.stringify({ name: 'ns-scratch', version: '0.0.0', lockfileVersion: 3, requires: true, packages: { '': { name: 'ns-scratch', version: '0.0.0' } } }, null, 2)}\n`);
  git(repo, 'init', '--quiet', '-b', 'main');
  git(repo, 'add', '-A');
  git(repo, 'commit', '--quiet', '-m', 'init');
  git(repo, 'remote', 'add', 'origin', origin);
  git(repo, 'push', '--quiet', '-u', 'origin', 'main');
  const root = (name: string) => path.join(dir, name);
  // The script tags with git's own identity: set one, as a CI runner has none.
  const identity = { GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
  const release = (cwd: string, nsRoot: string, ...args: string[]) => sh(cwd, process.execPath, [path.join(cwd, 'scripts', 'release.ts'), ...args], { NIGHT_SHIFT_ROOT: nsRoot, ...identity });
  const manifest = (nsRoot: string, v: string) => JSON.parse(fs.readFileSync(path.join(nsRoot, 'releases', v, 'version.json'), 'utf8'));
  return { dir, origin, repo, root, release, manifest };
}

test('a new version is built as a candidate, installed and tried, then published: the tag names the commit that was built', () => {
  const s = scratch();
  const ns = s.root('maintainer');
  const head = git(s.repo, 'rev-parse', 'HEAD');
  let r = s.release(s.repo, ns, 'build', 'v1');
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /not published: building a candidate/);
  assert.match(r.out, /next: npm run release install v1, try it, then npm run release publish v1/);
  assert.deepEqual([s.manifest(ns, 'v1').commit, s.manifest(ns, 'v1').candidate], [head, true]);
  assert.equal(git(s.repo, 'tag', '-l', 'v1'), '');
  assert.match(s.release(s.repo, ns, 'list').out, /^ {2}v1 +[0-9a-f]{7} .* candidate$/m);

  r = s.release(s.repo, ns, 'install', 'v1');
  assert.equal(r.status, 0, r.out);
  assert.equal(fs.readFileSync(path.join(ns, 'releases', 'current'), 'utf8').trim(), 'v1');
  assert.ok(fs.existsSync(path.join(ns, 'bin', 'night-shift')) && fs.existsSync(path.join(ns, 'bin', 'night-shift.cmd')));

  // Work goes on meanwhile: publishing still tags the commit the candidate was built from.
  fs.writeFileSync(path.join(s.repo, 'later.txt'), 'later\n');
  git(s.repo, 'add', '-A');
  git(s.repo, 'commit', '--quiet', '-m', 'later');
  git(s.repo, 'push', '--quiet');
  r = s.release(s.repo, ns, 'publish', 'v1');
  assert.equal(r.status, 0, r.out);
  assert.equal(git(s.origin, 'rev-parse', 'v1^{commit}'), head);
  assert.equal(s.manifest(ns, 'v1').candidate, undefined);
  // Published once: again is refused, and so is building it over.
  assert.equal(s.release(s.repo, ns, 'publish', 'v1').status, 2);
  assert.match(s.release(s.repo, ns, 'build', 'v1').out, /never rebuilt/);
});

test('a stranger\'s clone builds a published version from its tag, even before the tag is fetched', () => {
  const s = scratch();
  const first = git(s.repo, 'rev-parse', 'HEAD');
  const maintainer = s.root('maintainer');
  assert.equal(s.release(s.repo, maintainer, 'build', 'v1').status, 0);
  assert.equal(s.release(s.repo, maintainer, 'publish', 'v1').status, 0);
  fs.writeFileSync(path.join(s.repo, 'later.txt'), 'later\n');
  git(s.repo, 'add', '-A');
  git(s.repo, 'commit', '--quiet', '-m', 'later');
  git(s.repo, 'push', '--quiet');

  const clone = path.join(s.dir, 'stranger');
  git(s.dir, 'clone', '--quiet', '--no-tags', s.origin, clone);
  assert.equal(git(clone, 'tag', '-l'), '');
  const ns = s.root('stranger-home');
  const r = s.release(clone, ns, 'build', 'v1');
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /building v1 from its tag/);
  // The tag's commit, not the clone's newer HEAD; and not a candidate.
  assert.deepEqual([s.manifest(ns, 'v1').commit, s.manifest(ns, 'v1').candidate], [first, undefined]);
  assert.ok(!fs.existsSync(path.join(ns, 'releases', 'v1', 'later.txt')));
  assert.equal(s.release(clone, ns, 'install', 'v1').status, 0);
  assert.match(s.release(clone, ns, 'publish', 'v1').out, /nothing to publish/);
});

test('a candidate needs a clean tree pushed to origin/main; publishing needs a built candidate', () => {
  const s = scratch();
  const ns = s.root('maintainer');
  fs.writeFileSync(path.join(s.repo, 'draft.txt'), 'draft\n');
  let r = s.release(s.repo, ns, 'build', 'v1');
  assert.equal(r.status, 2);
  assert.match(r.out, /the tree is dirty/);
  git(s.repo, 'add', '-A');
  git(s.repo, 'commit', '--quiet', '-m', 'draft');
  r = s.release(s.repo, ns, 'build', 'v1');
  assert.equal(r.status, 2);
  assert.match(r.out, /not on origin\/main; push first/);
  assert.match(s.release(s.repo, ns, 'publish', 'v1').out, /not built here/);
  assert.match(s.release(s.repo, ns, 'install', 'v1').out, /not built here/);
  assert.equal(git(s.origin, 'tag', '-l'), '');
});

test('the old verbs say what replaced them, and every script\'s docs names every verb', () => {
  const release = (...args: string[]) => sh(HERE, process.execPath, ['scripts/release.ts', ...args]);
  assert.match(release('switch', 'v1').out, /"switch" is now npm run release install v<N>/);
  assert.match(release('install-launchers').out, /npm run release install v<N>/);
  assert.match(release('v19').out, /build v19, install v19, publish v19/);
  const docs = release('docs');
  assert.equal(docs.status, 0);
  for (const verb of ['build v<N>', 'install v<N>', 'publish v<N>', 'list', 'docs']) assert.match(docs.out, new RegExp(`npm run release ${verb}`));

  const clean = sh(HERE, process.execPath, ['scripts/clean-check.ts', 'docs']);
  assert.equal(clean.status, 0);
  assert.match(clean.out, /npm run check:clean -- \[v<N>\] \[--ref <branch>\]/);
  assert.equal(sh(HERE, process.execPath, ['scripts/clean-check.ts', 'nonsense']).status, 2);

  const cli = sh(HERE, process.execPath, ['src/cli.ts', 'docs']);
  assert.equal(cli.status, 0);
  for (const command of ['status', 'start', 'record', 'ask', 'decide', 'close', 'view', 'docs']) assert.match(cli.out, new RegExp(`night-shift ${command}`));
  assert.match(cli.out, /How a night goes/);
  // Agents are told to read them.
  const agents = fs.readFileSync(path.join(HERE, 'AGENTS.md'), 'utf8');
  for (const manual of ['npm run release docs', 'npm run check:clean docs', 'night-shift docs']) assert.ok(agents.includes(manual), manual);
});

test('a candidate is built again after a fix, and one whose number was published elsewhere cannot run as that number', () => {
  const s = scratch();
  const ns = s.root('maintainer');
  assert.equal(s.release(s.repo, ns, 'build', 'v1').status, 0);
  const first = s.manifest(ns, 'v1').commit;
  // The try found a bug: fix it, push, build the candidate again.
  fs.writeFileSync(path.join(s.repo, 'fix.txt'), 'fix\n');
  git(s.repo, 'add', '-A');
  git(s.repo, 'commit', '--quiet', '-m', 'fix');
  git(s.repo, 'push', '--quiet');
  let r = s.release(s.repo, ns, 'build', 'v1');
  assert.equal(r.status, 0, r.out);
  assert.notEqual(s.manifest(ns, 'v1').commit, first);
  assert.ok(fs.existsSync(path.join(ns, 'releases', 'v1', 'fix.txt')));

  // Meanwhile another clone publishes v1 from a newer commit.
  const other = path.join(s.dir, 'other');
  git(s.dir, 'clone', '--quiet', s.origin, other);
  fs.writeFileSync(path.join(other, 'theirs.txt'), 'theirs\n');
  git(other, 'add', '-A');
  git(other, 'commit', '--quiet', '-m', 'theirs');
  git(other, 'push', '--quiet');
  const theirs = git(other, 'rev-parse', 'HEAD');
  assert.equal(s.release(other, s.root('other-home'), 'build', 'v1').status, 0);
  assert.equal(s.release(other, s.root('other-home'), 'publish', 'v1').status, 0);
  // This candidate no longer runs as v1, cannot be published over it, and building gives the real v1.
  r = s.release(s.repo, ns, 'install', 'v1');
  assert.equal(r.status, 2);
  assert.match(r.out, /was published from [0-9a-f]{7}, not from this candidate/);
  assert.match(s.release(s.repo, ns, 'publish', 'v1').out, /names [0-9a-f]{7}, not this candidate/);
  r = s.release(s.repo, ns, 'build', 'v1');
  assert.equal(r.status, 0, r.out);
  assert.deepEqual([s.manifest(ns, 'v1').commit, s.manifest(ns, 'v1').candidate], [theirs, undefined]);
  assert.equal(s.release(s.repo, ns, 'install', 'v1').status, 0);
});

test('a publish that stopped after tagging is finished by publishing again; a tag only here is not a release', () => {
  const s = scratch();
  const ns = s.root('maintainer');
  assert.equal(s.release(s.repo, ns, 'build', 'v1').status, 0);
  const commit = s.manifest(ns, 'v1').commit;
  // Tagged here, not pushed: what a rejected push leaves.
  git(s.repo, 'tag', '-a', 'v1', commit, '-m', 'release v1');
  assert.match(s.release(s.repo, s.root('fresh'), 'build', 'v1').out, /exists only here, not on origin/);
  const r = s.release(s.repo, ns, 'publish', 'v1');
  assert.equal(r.status, 0, r.out);
  assert.equal(git(s.origin, 'rev-parse', 'v1^{commit}'), commit);
  assert.equal(s.manifest(ns, 'v1').candidate, undefined);
});

test('offline, an unknown number is not built as a candidate; a failed build leaves nothing to install', () => {
  const s = scratch();
  git(s.repo, 'remote', 'set-url', 'origin', path.join(s.dir, 'missing.git'));
  let r = s.release(s.repo, s.root('offline'), 'build', 'v1');
  assert.equal(r.status, 2);
  assert.match(r.out, /origin cannot be reached/);

  const f = scratch('node -e "process.exit(3)"');
  const ns = f.root('maintainer');
  r = f.release(f.repo, ns, 'build', 'v1');
  assert.equal(r.status, 1);
  assert.match(r.out, /the web build failed/);
  assert.match(f.release(f.repo, ns, 'install', 'v1').out, /not built here/);
});

test('a tag that disagrees with origin, or cannot be checked on a candidate, is not built as a release; a tag pushed elsewhere at the same commit is taken, not made twice', () => {
  const s = scratch();
  const ns = s.root('maintainer');
  assert.equal(s.release(s.repo, ns, 'build', 'v1').status, 0);
  // Another clone publishes v1 from this same commit first.
  const other = path.join(s.dir, 'other');
  git(s.dir, 'clone', '--quiet', s.origin, other);
  assert.equal(s.release(other, s.root('other-home'), 'build', 'v1').status, 0);
  assert.equal(s.release(other, s.root('other-home'), 'publish', 'v1').status, 0);
  // A tag made here a second later would be a different object than origin's.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1100);
  const r = s.release(s.repo, ns, 'publish', 'v1');
  assert.equal(r.status, 0, r.out);
  assert.equal(git(s.repo, 'rev-parse', 'v1'), git(s.origin, 'rev-parse', 'v1'));

  // Here, v2's tag names a different commit than origin's.
  const t = scratch();
  const tns = t.root('maintainer');
  git(t.repo, 'tag', '-a', 'v2', '-m', 'v2');
  git(t.repo, 'push', '--quiet', 'origin', 'v2');
  fs.writeFileSync(path.join(t.repo, 'more.txt'), 'more\n');
  git(t.repo, 'add', '-A');
  git(t.repo, 'commit', '--quiet', '-m', 'more');
  git(t.repo, 'tag', '-f', '-a', 'v2', '-m', 'v2 moved');
  assert.match(t.release(t.repo, tns, 'build', 'v2').out, /origin's names/);

  // Offline, a candidate carrying a local tag (a rejected push) is not built as published.
  assert.equal(t.release(t.repo, tns, 'build', 'v3').status, 2); // not pushed: refused
  git(t.repo, 'push', '--quiet', 'origin', 'main');
  assert.equal(t.release(t.repo, tns, 'build', 'v3').status, 0);
  git(t.repo, 'tag', '-a', 'v3', t.manifest(tns, 'v3').commit, '-m', 'v3');
  git(t.repo, 'remote', 'set-url', 'origin', path.join(t.dir, 'missing.git'));
  const off = t.release(t.repo, tns, 'build', 'v3');
  assert.equal(off.status, 2);
  assert.match(off.out, /no telling whether tag v3 was ever pushed/);
  assert.equal(t.manifest(tns, 'v3').candidate, true);
});
