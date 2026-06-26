/**
 * Ambient hero background: a slow drift of gold "survey points" connected by
 * faint hairlines, with a large, barely-there rotating compass ring. Pure
 * <canvas> (no Three.js) to stay lightweight and dependency-free.
 *
 * - Respects prefers-reduced-motion (renders one static frame, no loop).
 * - Pauses when the tab is hidden or the hero scrolls out of view.
 * - DPR-aware and resilient to resize.
 */

interface Pt {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

const GOLD = '227, 177, 103';

export function initHeroCanvas(canvas: HTMLCanvasElement, reduce: boolean): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let points: Pt[] = [];
  let raf = 0;
  let running = false;
  let angle = 0;

  const LINK_DIST = 150;

  function seed(): void {
    const target = Math.min(90, Math.floor((width * height) / 16000) + 18);
    points = Array.from({ length: target }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.4 + 0.5,
    }));
  }

  function resize(): void {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (reduce) drawStatic();
  }

  function drawCompass(): void {
    const cx = width * 0.72;
    const cy = height * 0.42;
    const R = Math.min(width, height) * 0.42;
    ctx!.save();
    ctx!.translate(cx, cy);
    ctx!.rotate(angle);
    ctx!.strokeStyle = `rgba(${GOLD}, 0.06)`;
    ctx!.lineWidth = 1;
    ctx!.beginPath();
    ctx!.arc(0, 0, R, 0, Math.PI * 2);
    ctx!.stroke();
    ctx!.beginPath();
    ctx!.arc(0, 0, R * 0.74, 0, Math.PI * 2);
    ctx!.stroke();
    // tick marks
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const inner = i % 5 === 0 ? R * 0.9 : R * 0.95;
      ctx!.beginPath();
      ctx!.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
      ctx!.lineTo(Math.cos(a) * R, Math.sin(a) * R);
      ctx!.stroke();
    }
    ctx!.restore();
  }

  function render(): void {
    ctx!.clearRect(0, 0, width, height);
    drawCompass();

    // links
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      for (let j = i + 1; j < points.length; j++) {
        const b = points[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          const o = (1 - d / LINK_DIST) * 0.18;
          ctx!.strokeStyle = `rgba(${GOLD}, ${o})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }
    }
    // points
    for (const p of points) {
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(${GOLD}, 0.7)`;
      ctx!.fill();
    }
  }

  function step(): void {
    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;
    }
    angle += 0.0006;
    render();
    raf = requestAnimationFrame(step);
  }

  function drawStatic(): void {
    render();
  }

  function start(): void {
    if (running || reduce) return;
    running = true;
    raf = requestAnimationFrame(step);
  }
  function stop(): void {
    running = false;
    cancelAnimationFrame(raf);
  }

  // Resize handling (debounced via rAF).
  let resizeQueued = false;
  const onResize = () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      resize();
    });
  };
  window.addEventListener('resize', onResize);

  // Pause when offscreen.
  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries[0]?.isIntersecting;
      if (visible) start();
      else stop();
    },
    { threshold: 0 }
  );
  io.observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  resize();
  if (!reduce) start();
}
