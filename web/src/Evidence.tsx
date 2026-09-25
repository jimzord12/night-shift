import { useEffect, useRef, useState } from 'react';
import type { Evidence } from '../../src/types.ts';
import { Icon } from './ui.tsx';

export type MediaKind = 'image' | 'video' | 'pdf' | 'page';

// What a file or link is, from its name. Anything unknown (an .html file, a website) is a page.
export function mediaKind(src: string): MediaKind {
  const clean = src.split(/[?#]/)[0].toLowerCase();
  if (/\.(png|jpe?g|gif|webp|svg|avif)$/.test(clean)) return 'image';
  if (/\.(mp4|webm|mov)$/.test(clean)) return 'video';
  if (/\.pdf$/.test(clean)) return 'pdf';
  return 'page';
}

export interface Media {
  src: string;
  kind?: MediaKind;
  title?: string;
}

const KIND_LABEL: Record<MediaKind, string> = { image: 'Image', video: 'Video', pdf: 'PDF', page: 'Web page' };

// Full-screen viewer for any asset: pictures (fit or 100%), video, PDF, HTML pages and websites.
// Esc or a click on the dark border closes it; "Open in new tab" always works, for sites that
// refuse to be shown inside another page.
export function MediaViewer({ media, onClose }: { media: Media; onClose: () => void }) {
  const kind = media.kind ?? mediaKind(media.src);
  const [actual, setActual] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);
  const external = /^https?:\/\//i.test(media.src);
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <header className="flex items-center gap-3 px-5 py-3" onClick={(e) => e.stopPropagation()}>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase">{KIND_LABEL[kind]}</span>
        <span className="min-w-0 flex-1 truncate text-white/80">{media.title ?? media.src.split('/').pop()}</span>
        {kind === 'image' && (
          <button onClick={() => setActual(!actual)} className="rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20">{actual ? 'Fit to screen' : 'Actual size'}</button>
        )}
        <a href={media.src} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20">
          <Icon name="link" className="size-4" /> Open in new tab
        </a>
        <button onClick={onClose} className="moon-btn size-10" aria-label="Close"><Icon name="close" className="size-5" strokeWidth={2.6} /></button>
      </header>
      <div className="min-h-0 flex-1 px-5 pb-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {kind === 'image' && (
          <div className={`h-full w-full ${actual ? 'overflow-auto' : 'grid place-items-center'}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <img src={media.src} alt={media.title ?? ''} onClick={() => setActual(!actual)} className={`pop-in rounded-lg bg-white shadow-2xl ${actual ? 'max-w-none cursor-zoom-out' : 'max-h-full max-w-full cursor-zoom-in object-contain'}`} />
          </div>
        )}
        {kind === 'video' && (
          <div className="grid h-full place-items-center">
            <video src={media.src} controls autoPlay className="pop-in max-h-full max-w-full rounded-lg shadow-2xl" />
          </div>
        )}
        {kind === 'pdf' && <iframe src={media.src} title={media.title ?? 'PDF'} className="pop-in h-full w-full rounded-lg bg-white" />}
        {kind === 'page' && (
          <div className="flex h-full flex-col gap-2">
            <iframe src={media.src} title={media.title ?? 'Web page'} sandbox="allow-scripts allow-forms allow-popups" className="pop-in min-h-0 w-full flex-1 rounded-lg bg-white" />
            {external && <p className="text-center text-xs text-white/50">Blank? Some sites refuse to be shown inside another page: use Open in new tab.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// A small preview tile for any media: the picture itself, or an icon card for the other kinds.
export function MediaThumb({ src, className = 'h-40' }: { src: string; className?: string }) {
  const kind = mediaKind(src);
  if (kind === 'image') return <img src={src} alt="" className={`${className} w-auto bg-white`} />;
  const icon = kind === 'video' ? 'play' : kind === 'pdf' ? 'file' : 'globe';
  return (
    <span className={`${className} grid aspect-[4/3] place-items-center bg-gradient-to-br from-night-600 to-night-800 px-4 text-center`}>
      <span>
        <Icon name={icon} className="mx-auto size-10 text-moon" strokeWidth={1.6} />
        <span className="mt-2 block max-w-40 truncate text-xs text-white/70">{src.split('/').pop()}</span>
      </span>
    </span>
  );
}

// Drag (or hover) across the picture: the left part shows "before", the right part "after".
export function CompareSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (r) setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={box}
      className="relative cursor-ew-resize select-none overflow-hidden rounded-xl bg-white"
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && move(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
    >
      <img src={after} alt="after" className="block w-full" draggable={false} />
      <img src={before} alt="before" className="absolute inset-0 block h-full w-full object-cover" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} draggable={false} />
      <div className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_#000a]" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 left-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-night-900 shadow-lg">
          <Icon name="left" className="size-3" strokeWidth={3} />
          <span className="sr-only">drag</span>
        </div>
      </div>
      <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">before</span>
      <span className="absolute top-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">after</span>
    </div>
  );
}

export function EvidenceView({ ev, onZoom }: { ev: Evidence; onZoom: (src: string) => void }) {
  const caption = ev.caption && <figcaption className="mt-1.5 text-sm text-white/60">{ev.caption}</figcaption>;
  if (ev.missing) {
    return (
      <div className="rounded-xl border border-dashed border-blocked/50 p-4 text-sm text-blocked">
        <Icon name="warn" className="mr-1 inline size-4" /> {ev.name} is named in the outcome but not attached to the card.
      </div>
    );
  }
  switch (ev.kind) {
    case 'compare':
      return (
        <figure>
          <CompareSlider before={ev.before!} after={ev.src!} />
          {caption}
        </figure>
      );
    case 'image':
      return (
        <figure>
          <button onClick={() => onZoom(ev.src!)} className="block w-full overflow-hidden rounded-xl bg-white transition hover:scale-[1.01]">
            <img src={ev.src} alt={ev.caption ?? ''} className="block w-full" />
          </button>
          {caption}
        </figure>
      );
    case 'pdf':
      return (
        <figure>
          <iframe src={ev.src} title={ev.caption ?? 'PDF'} className="h-96 w-full rounded-xl bg-white" />
          <a href={ev.src} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline">
            <Icon name="file" /> open the PDF
          </a>
          {caption}
        </figure>
      );
    case 'link':
      return (
        <a href={ev.src} target="_blank" rel="noreferrer" className="glass flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-white/10">
          <Icon name="link" className="size-5 text-[var(--accent)]" />
          <span className="min-w-0">
            <span className="block truncate font-medium">{ev.caption ?? ev.src}</span>
            <span className="block truncate text-xs text-white/50">{ev.src}</span>
          </span>
        </a>
      );
  }
}
