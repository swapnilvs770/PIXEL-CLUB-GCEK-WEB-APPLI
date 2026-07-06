import { useEffect, useRef } from 'react';

/**
 * AuroraBackground — soft, animated aurora gradients that drift slowly.
 * Pure CSS (no canvas) for zero JS cost after mount. Pauses when the tab
 * is hidden to save battery. pointer-events: none so it never blocks UI.
 */
export function AuroraBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf: number | null = null;
    let start = performance.now();
    const tick = (t: number) => {
      const elapsed = (t - start) / 1000;
      el.style.setProperty('--aurora-t', elapsed.toFixed(2));
      raf = requestAnimationFrame(tick);
    };
    const onVis = () => {
      if (document.hidden) {
        if (raf != null) cancelAnimationFrame(raf);
        raf = null;
      } else if (raf == null) {
        start = performance.now() - 0; // resume
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf != null) cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Soft base wash */}
      <div className="absolute inset-0 bg-[#050505]" />
      {/* Aurora blobs — positioned, blurred, color-shifted */}
      <div
        className="absolute -top-32 -left-32 h-[60rem] w-[60rem] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(96,165,250,0.45), transparent 60%)',
          transform: 'translate3d(calc(sin(var(--aurora-t,0) * 0.4) * 40px), calc(cos(var(--aurora-t,0) * 0.3) * 30px), 0)',
        }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[55rem] w-[55rem] rounded-full opacity-45 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(168,85,247,0.45), transparent 60%)',
          transform: 'translate3d(calc(cos(var(--aurora-t,0) * 0.35) * 50px), calc(sin(var(--aurora-t,0) * 0.45) * 40px), 0)',
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[50rem] w-[50rem] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(236,72,153,0.35), transparent 60%)',
          transform: 'translate3d(calc(sin(var(--aurora-t,0) * 0.5 + 1) * 30px), calc(cos(var(--aurora-t,0) * 0.4 + 1) * 30px), 0)',
        }}
      />
      <div
        className="absolute top-1/4 left-1/4 h-[40rem] w-[40rem] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(34,211,238,0.35), transparent 60%)',
          transform: 'translate3d(calc(cos(var(--aurora-t,0) * 0.4 + 2) * 40px), calc(sin(var(--aurora-t,0) * 0.5 + 2) * 40px), 0)',
        }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)',
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  );
}
