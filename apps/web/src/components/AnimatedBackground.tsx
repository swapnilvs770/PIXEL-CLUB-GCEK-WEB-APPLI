import { useEffect, useRef } from 'react';

/**
 * AnimatedBackground
 * ------------------
 * Subtle canvas-based background: slow-drifting particles with a gentle
 * mouse-parallax effect and faint connecting lines between nearby particles
 * (constellation style). Designed to sit behind page content without
 * interfering with interaction (pointer-events: none).
 *
 * - Theme-aware: uses CSS vars (--foreground, --muted-foreground) so it
 *   looks correct in both light and dark mode.
 * - Performance: caps DPR at 2, pauses when document is hidden.
 * - Accessibility: honors prefers-reduced-motion (static starfield only).
 * - Cleanup: tears down RAF + listeners on unmount.
 *
 * Drop <AnimatedBackground /> at the top of any page's <main> and it will
 * position itself as a fixed full-viewport layer behind everything.
 */
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const reducedMotionRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mql.matches;
    const onMqlChange = () => {
      reducedMotionRef.current = mql.matches;
    };
    mql.addEventListener?.('change', onMqlChange);

    // Resolve theme colors from CSS variables so it adapts to light/dark.
    const css = getComputedStyle(document.documentElement);
    const resolveColor = (varName: string, fallback: string): string => {
      const v = css.getPropertyValue(varName).trim();
      return v || fallback;
    };
    const toHsl = (raw: string): string => {
      // shadcn sets vars as "H S% L%" triples. Wrap in hsl().
      // If a full color is returned (already hsl/rgb/hex), pass through.
      if (!raw) return '0 0% 50%';
      if (raw.startsWith('hsl') || raw.startsWith('rgb') || raw.startsWith('#')) return raw;
      return `hsl(${raw})`;
    };
    const dotColor = toHsl(resolveColor('--foreground', '222.2 84% 4.9%'));
    const lineColor = toHsl(resolveColor('--muted-foreground', '215.4 16.3% 46.9%'));

    // Mouse state (normalized -1..1 from center)
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };
    const onMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      mouse.tx = (e.clientX / w) * 2 - 1;
      mouse.ty = (e.clientY / h) * 2 - 1;
      mouse.active = true;
    };
    const onMouseLeave = () => {
      mouse.active = false;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);

    // Canvas sizing
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle population scales with screen area (capped).
    const area = () => width * height;
    const particleCount = Math.max(
      40,
      Math.min(110, Math.round(area() / 14000))
    );

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      o: number; // base opacity
    }
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-0.15, 0.15),
      vy: rand(-0.15, 0.15),
      r: rand(0.6, 1.8),
      o: rand(0.25, 0.7),
    }));

    // Pause when tab is hidden — saves battery.
    let visible = !document.hidden;
    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Render loop
    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      if (!visible) return;

      // Smooth mouse easing
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const parallax = reducedMotionRef.current ? 0 : 1;
      const drift = reducedMotionRef.current ? 0 : 1;

      // Draw connecting lines first so dots overlay them
      const linkDist = 120;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        // Apply drift
        if (drift) {
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < -10) a.x = width + 10;
          if (a.x > width + 10) a.x = -10;
          if (a.y < -10) a.y = height + 10;
          if (a.y > height + 10) a.y = -10;
        }
        // Mouse parallax: gently shift particles opposite to cursor
        if (parallax && mouse.active) {
          a.x += (mouse.x * 8 - (a.x - width / 2) * 0) * 0; // no-op baseline
          // The above keeps signature stable; actual visual parallax comes
          // from the slight positional bias applied below.
          const dx = (mouse.x - 0) * 4;
          const dy = (mouse.y - 0) * 4;
          a.x += (dx - (a.x - width / 2) * 0.002) * 0.02;
          a.y += (dy - (a.y - height / 2) * 0.002) * 0.02;
        }
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const ddx = a.x - b.x;
          const ddy = a.y - b.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * 0.18;
            ctx.strokeStyle = lineColor.replace(/hsl\(([^)]+)\)/, (_m, hsl) => {
              // If --muted-foreground was returned as "H S% L%" we wrapped it.
              // Strip the wrapper to inject alpha.
              return `hsl(${hsl} / ${alpha.toFixed(3)})`;
            }).replace(/^hsl\((.+)\)$/, (_m, inner) => `hsl(${inner} / ${alpha.toFixed(3)})`);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      ctx.fillStyle = dotColor;
      for (const p of particles) {
        ctx.globalAlpha = p.o;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    render();

    // Cleanup
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      mql.removeEventListener?.('change', onMqlChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
      }}
    />
  );
}
