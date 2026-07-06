import { useEffect, useRef } from 'react';

/**
 * Spotlight — a soft radial light that follows the cursor.
 * Drop into any container and it tracks the user's pointer with
 * a single global listener. GPU-only transforms. Pauses when hidden.
 */
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number | null = null;
    let tx = -1000;
    let ty = -1000;
    let cx = -1000;
    let cy = -1000;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (raf == null && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      tx = -1000;
      ty = -1000;
    };
    const tick = () => {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      el.style.setProperty('--sx', `${cx}px`);
      el.style.setProperty('--sy', `${cy}px`);
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          'radial-gradient(600px circle at var(--sx,-1000px) var(--sy,-1000px), rgba(99,102,241,0.10), transparent 50%)',
        transition: 'background 0.2s',
      }}
    />
  );
}
