import { useEffect, useRef, useState } from 'react';
import type { Evidence } from '../../src/types.ts';
import { Icon } from './ui.tsx';

export function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/85 p-6" onClick={onClose}>
      <img src={src} alt="" className="max-h-full max-w-full rounded-lg shadow-2xl pop-in" />
    </div>
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
