/**
 * Site-wide scroll choreography:
 *   1. Reveals [data-reveal] elements as they enter the viewport.
 *   2. Counts up [data-count] numbers once their strip is in view.
 *
 * GSAP + ScrollTrigger are dynamically imported so they stay out of the
 * critical path. If motion is reduced, GSAP is skipped entirely and a tiny
 * IntersectionObserver does the (instant) reveal so content is always shown.
 */

function animateCount(el: HTMLElement): void {
  const to = Number(el.dataset.to ?? '0');
  const suffix = el.dataset.suffix ?? '';
  const dur = 1600;
  const start = performance.now();
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

  const tick = (now: number) => {
    const p = Math.min((now - start) / dur, 1);
    const val = Math.round(easeOut(p) * to);
    el.textContent = `${val}${suffix}`;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function fallbackReveal(reduce: boolean): void {
  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    if (reduce) el.classList.add('is-in');
    else io.observe(el);
  });

  // Counters via their own observer (fire once visible).
  const co = new IntersectionObserver(
    (entries, obs) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        animateCount(e.target as HTMLElement);
        obs.unobserve(e.target);
      }
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    if (reduce) {
      el.textContent = `${el.dataset.to ?? ''}${el.dataset.suffix ?? ''}`;
    } else {
      co.observe(el);
    }
  });
}

export async function initScroll(): Promise<void> {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce) {
    fallbackReveal(true);
    return;
  }

  try {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    gsap.registerPlugin(ScrollTrigger);

    const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]');
    gsap.set(reveals, { y: 28, opacity: 0 });

    // One ScrollTrigger per element. Unlike batch(), per-element triggers
    // reliably fire for anything already in view on refresh — so a section
    // reached via an anchor jump can never get stranded invisible.
    reveals.forEach((el) => {
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });

    // Counters.
    document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => animateCount(el),
      });
    });

    // Recompute positions once web fonts settle (guards against layout shift
    // moving triggers after they were measured).
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    window.addEventListener('load', () => ScrollTrigger.refresh());
  } catch {
    // GSAP failed to load — fall back to the lightweight observer.
    fallbackReveal(false);
  }
}
