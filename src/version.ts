import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { REPO_ROOT } from './store.ts';

export interface ReleaseManifest {
  version: string;
  commit: string;
  date: string;
}

export function readReleaseManifest(dir: string): ReleaseManifest | null {
  try {
    const m = JSON.parse(fs.readFileSync(path.join(dir, 'version.json'), 'utf8')) as ReleaseManifest;
    return typeof m.version === 'string' && typeof m.commit === 'string' ? m : null;
  } catch {
    return null;
  }
}

// "v3 · a1b2c3d" from a release folder, "dev · a1b2c3d" from a checkout.
export function versionString(): string {
  const m = readReleaseManifest(REPO_ROOT);
  if (m) return `${m.version} · ${m.commit.slice(0, 7)}`;
  const sha = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8', windowsHide: true });
  return `dev · ${sha.status === 0 ? sha.stdout.trim() : 'unknown'}`;
}
