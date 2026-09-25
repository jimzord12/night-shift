import { useEffect, useRef } from 'react';

// The night sky behind every screen, drawn on one canvas:
// - stars of different size and brightness; about a third of them twinkle, each at its own pace
// - a shooting star every few seconds, falling from the upper right towards the lower left
// - rarely, a big glowing meteor crossing from a random edge in a random direction
// With "reduce motion" set in the OS, the stars stay still and nothing falls.

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  twinkle: number; // 0 = steady; otherwise how deep it blinks
  speed: number;
  phase: number;
  warm: boolean;
}

interface Streak {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  length: number;
  width: number;
  big: boolean;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function makeStars(w: number, h: number): Star[] {
  const count = Math.round((w * h) / 5200);
  return Array.from({ length: count }, () => {
    const bright = Math.random() < 0.08;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: bright ? rand(1.1, 1.8) : rand(0.35, 1),
      base: bright ? rand(0.75, 1) : rand(0.18, 0.6),
      twinkle: Math.random() < 0.33 ? rand(0.35, 0.8) : 0,
      speed: rand(0.6, 2.2),
      phase: rand(0, Math.PI * 2),
      warm: Math.random() < 0.12,
    };
  });
}

function shootingStar(w: number, h: number): Streak {
  const speed = rand(9, 14);
  const angle = rand(Math.PI * 0.72, Math.PI * 0.86); // down and to the left
  return { x: rand(w * 0.35, w * 1.05), y: rand(-20, h * 0.35), vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0, max: rand(45, 70), length: rand(90, 160), width: rand(1, 1.6), big: false };
}

function meteor(w: number, h: number): Streak {
  const speed = rand(5, 7.5);
  const edge = Math.floor(Math.random() * 4);
  const start = [
    { x: rand(0, w), y: -30 },
    { x: w + 30, y: rand(0, h * 0.7) },
    { x: rand(0, w), y: h + 30 },
    { x: -30, y: rand(0, h * 0.7) },
  ][edge];
  // Aim at a random point in the middle of the sky.
  const tx = rand(w * 0.25, w * 0.75);
  const ty = rand(h * 0.2, h * 0.6);
  const a = Math.atan2(ty - start.y, tx - start.x);
  const dist = Math.hypot(w, h);
  return { ...start, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 0, max: dist / speed, length: rand(220, 320), width: rand(2.5, 3.5), big: true };
}

export function Starfield() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    const streaks: Streak[] = [];
    let nextShoot = performance.now() + rand(1500, 4000);
    let nextMeteor = performance.now() + rand(18000, 35000);
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      el.width = w * dpr;
      el.height = h * dpr;
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = makeStars(w, h);
    };

    const drawStreak = (s: Streak) => {
      const fade = Math.min(1, s.life / 8) * Math.max(0, 1 - s.life / s.max);
      const len = Math.hypot(s.vx, s.vy);
      const tx = s.x - (s.vx / len) * s.length;
      const ty = s.y - (s.vy / len) * s.length;
      const g = ctx.createLinearGradient(s.x, s.y, tx, ty);
      g.addColorStop(0, `rgba(255,255,255,${0.95 * fade})`);
      g.addColorStop(0.25, s.big ? `rgba(255,214,140,${0.55 * fade})` : `rgba(200,210,255,${0.45 * fade})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = s.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      if (s.big) {
        const head = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 14);
        head.addColorStop(0, `rgba(255,244,214,${fade})`);
        head.addColorStop(0.4, `rgba(255,190,110,${0.5 * fade})`);
        head.addColorStop(1, 'rgba(255,160,80,0)');
        ctx.fillStyle = head;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let last = performance.now();
    const frame = (now: number) => {
      // Move by elapsed time, not by frame, so a slowed-down tab never piles streaks up.
      const dt = Math.min((now - last) / (1000 / 60), 3);
      last = now;
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      for (const s of stars) {
        const a = s.twinkle && !still ? s.base * (1 - s.twinkle * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))) : s.base;
        ctx.fillStyle = s.warm ? `rgba(255,226,170,${a})` : `rgba(235,240,255,${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.1) {
          // The bright ones get a soft halo.
          ctx.fillStyle = `rgba(200,215,255,${a * 0.12})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!still) {
        if (now > nextShoot) {
          streaks.push(shootingStar(w, h));
          nextShoot = now + rand(3500, 9000);
        }
        if (now > nextMeteor) {
          streaks.push(meteor(w, h));
          nextMeteor = now + rand(25000, 50000);
        }
        for (let i = streaks.length - 1; i >= 0; i--) {
          const s = streaks[i];
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.life += dt;
          if (s.life > s.max) streaks.splice(i, 1);
          else drawStreak(s);
        }
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(frame);
    // Pause while the tab is hidden: no work, and no burst of streaks on return.
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !still) {
        last = performance.now();
        nextShoot = performance.now() + rand(1500, 4000);
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvas} className="pointer-events-none fixed inset-0" aria-hidden />;
}
