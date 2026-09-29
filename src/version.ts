import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// This file's own root rather than store.ts's: the release script imports it in a fresh clone,
// before npm ci, so it must need nothing outside Node.
const REPO_ROOT = path.resolve(import.meta.dirname, '..');

export interface ReleaseManifest {
  version: string;
  commit: string;
  date: string;
  // Built from a checkout and not published yet (npm run release publish drops it).
  candidate?: boolean;
}

export function readReleaseManifest(dir: string): ReleaseManifest | null {
  try {
    const m = JSON.parse(fs.readFileSync(path.join(dir, 'version.json'), 'utf8')) as ReleaseManifest;
    return typeof m.version === 'string' && typeof m.commit === 'string' ? m : null;
  } catch {
    return null;
  }
}

// "v3 · a1b2c3d" from a release folder ("v4 candidate · …" until it is published), "dev · a1b2c3d"
// from a checkout.
export function versionString(): string {
  const m = readReleaseManifest(REPO_ROOT);
  if (m) return `${m.version}${m.candidate ? ' candidate' : ''} · ${m.commit.slice(0, 7)}`;
  const sha = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8', windowsHide: true });
  return `dev · ${sha.status === 0 ? sha.stdout.trim() : 'unknown'}`;
}
