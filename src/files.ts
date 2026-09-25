import path from 'node:path';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.htm': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

export function contentType(file: string): string {
  return TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
}

// True when `file` resolves to a path inside `dir` (no `..` escape, no other drive).
export function insideDir(dir: string, file: string): boolean {
  const rel = path.relative(path.resolve(dir), path.resolve(file));
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}
