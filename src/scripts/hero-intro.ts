/**
 * Hero entrance animation. GSAP is dynamically imported so it is never part of
 * the critical bundle — the page is meaningful before it loads. If motion is
 * reduced (or GSAP fails to load), elements are simply shown with no animation.
 */
export async function initHeroIntro(reduce: boolean): Promise<void> {
  const lines = Array.from(document.querySelectorAll<HTMLElement>('[data-hero-line] .word'));
  const supporting = [
    document.querySelector<HTMLElement>('[data-hero-eyebrow]'),
    document.querySelector<HTMLElement>('[data-hero-lead]'),
    document.querySelector<HTMLElement>('[data-hero-actions]'),
    document.querySelector<HTMLElement>('[data-hero-scroll]'),
  ].filter(Boolean) as HTMLElement[];

  if (reduce) return; // CSS leaves everything visible by default.

  // Hide before paint to avoid a flash, then animate in.
  const { gsap } = await import('gsap');

  gsap.set(lines, { yPercent: 120, opacity: 0 });
  gsap.set(supporting, { y: 20, opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to(lines, {
    yPercent: 0,
    opacity: 1,
    duration: 0.9,
    stagger: 0.045,
  })
    .to(
      supporting,
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.12 },
      '-=0.5'
    );
}
