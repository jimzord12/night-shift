// Desktop notifications when a night ends (D24, TASK-33): optional per install and off until the
// developer turns them on, since Night Shift imposes nothing. A click opens that night's report in
// the Viewer, which is started first when it is not running. Windows raises a toast; elsewhere, or
// by choice, a command of the developer's own receives the title, text and link.

import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import type { Night } from './types.ts';
import { decisionsOpen, OUTCOMES, countOutcomes } from './types.ts';
import { installRoot, parseJson, registerRepo, writeJson } from './store.ts';

export interface NotifySettings {
  enabled: boolean;
  // The Viewer's port the link points at (and the one started when none runs).
  port: number;
  // Run instead of the built-in toast, with NIGHT_SHIFT_TITLE, NIGHT_SHIFT_TEXT and NIGHT_SHIFT_URL set.
  command?: string;
}

const settingsFile = () => path.join(installRoot(), 'notify.json');

export function readNotify(): NotifySettings {
  try {
    const d = parseJson(fs.readFileSync(settingsFile(), 'utf8')) as Partial<NotifySettings>;
    return { enabled: d.enabled === true, port: Number.isInteger(d.port) ? d.port! : 4747, ...(typeof d.command === 'string' && d.command.trim() ? { command: d.command } : {}) };
  } catch {
    return { enabled: false, port: 4747 };
  }
}

export function writeNotify(s: NotifySettings): void {
  writeJson(settingsFile(), s);
}

export const reportUrl = (port: number, repoId: string, night: string) => `http://127.0.0.1:${port}/#/night/${encodeURIComponent(repoId)}/${encodeURIComponent(night)}`;

// "blog: night finished" and "2 questions, 1 decision for you · 3 done, 1 blocked".
export function nightMessage(repoName: string, n: Night): { title: string; text: string } {
  const open = n.questions.filter((q) => q.answer === null).length;
  const counts = countOutcomes(n.tasks);
  const tally = OUTCOMES.filter((o) => counts[o]).map((o) => `${counts[o]} ${o.replace('_', ' ')}`).join(', ');
  const decisions = decisionsOpen(n);
  const parts = [open && `${open} question${open === 1 ? '' : 's'}`, decisions && `${decisions} decision${decisions === 1 ? '' : 's'}`].filter(Boolean);
  const ask = parts.length ? `${parts.join(', ')} for you` : 'nothing to answer';
  return { title: `${repoName}: ${n.status === 'interrupted' ? 'night stopped early' : 'night finished'}`, text: [ask, tally].filter(Boolean).join(' · ') };
}

// Raises the notification for a night that just ended, when the developer turned them on.
// Returns what happened, for the command's output, or null when notifications are off.
export async function notifyNightEnded(repo: string, n: Night): Promise<string | null> {
  const s = readNotify();
  if (!s.enabled) return null;
  const ref = registerRepo(repo);
  const { title, text } = nightMessage(ref.name, n);
  return raise(s, title, text, reportUrl(s.port, ref.id, n.night));
}

export async function raise(s: NotifySettings, title: string, text: string, url: string): Promise<string> {
  if (s.command) {
    // Output ignored: a pipe a grandchild keeps open would hold the command past its timeout.
    const r = spawnSync(s.command, { shell: true, windowsHide: true, timeout: 10_000, stdio: 'ignore', env: { ...process.env, NIGHT_SHIFT_TITLE: title, NIGHT_SHIFT_TEXT: text, NIGHT_SHIFT_URL: url } });
    return r.status === 0 ? `Notified: ${title}.` : `The notify command failed (${r.error?.message ?? `exit ${r.status}`}).`;
  }
  if (process.platform !== 'win32') return 'Desktop notifications are built in on Windows only; set a command with night-shift notify on --command "<command>".';
  await ensureViewer(s.port);
  const failed = toast(title, text, url);
  return failed ? `The notification failed: ${failed}` : `Notified: ${title}.`;
}

// The link needs a Viewer to answer; start one in the background when the port is free.
async function ensureViewer(port: number): Promise<void> {
  const up = await new Promise<boolean>((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.setTimeout(400, () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => resolve(false));
  });
  if (up) return;
  const cli = fileURLToPath(new URL('./cli.ts', import.meta.url));
  fs.mkdirSync(installRoot(), { recursive: true });
  // Started from the install folder, so the long-lived Viewer never holds a repository's folder.
  spawn(process.execPath, [cli, 'view', '--port', String(port)], { cwd: installRoot(), detached: true, stdio: 'ignore', windowsHide: true })
    .on('error', () => {})
    .unref();
}

const xml = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// A Windows toast through Windows PowerShell's own app id, so nothing needs installing. The text
// travels base64-encoded, never through shell quoting. Waits for PowerShell (about a second), so a
// failure is reported rather than lost; returns the reason, or null when it was shown.
function toast(title: string, text: string, url: string): string | null {
  const body = `<toast activationType="protocol" launch="${xml(url)}"><visual><binding template="ToastGeneric"><text>${xml(title)}</text><text>${xml(text)}</text></binding></visual><actions><action content="Open the report" activationType="protocol" arguments="${xml(url)}"/></actions></toast>`;
  // Progress records off and errors as one plain line, so a failure reads as its reason.
  const script = [
    "$ProgressPreference = 'SilentlyContinue'",
    "$ErrorActionPreference = 'Stop'",
    'try {',
    '[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null',
    '[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] > $null',
    `$x = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${Buffer.from(body, 'utf8').toString('base64')}'))`,
    '$d = New-Object Windows.Data.Xml.Dom.XmlDocument',
    '$d.LoadXml($x)',
    "[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe').Show([Windows.UI.Notifications.ToastNotification]::new($d))",
    '} catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 }',
  ].join('\n');
  fs.mkdirSync(installRoot(), { recursive: true });
  const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(script, 'utf16le').toString('base64')], { cwd: installRoot(), encoding: 'utf8', timeout: 15_000, windowsHide: true });
  if (r.error) return r.error.message;
  if (r.status !== 0) return (r.stderr || '').trim().split(/\r?\n/)[0]?.slice(0, 300) || `exit ${r.status}`;
  return null;
}
