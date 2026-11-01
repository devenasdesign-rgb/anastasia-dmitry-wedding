(() => {
  const main = document.querySelector('.invitation');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!main) return;
  let started = false, observer, ticking = false;
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  function updateProgress() {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.scale = `${distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0} 1`;
    ticking = false;
  }
  function start() {
    if (started || document.documentElement.classList.contains('letter-loading')) return;
    started = true;
    if (motion.matches || !('IntersectionObserver' in window)) return;
    const selectors = '.countdown, .scene-no, .intro h2, .intro .copy, .story h2, .messages-scene, .story-copy, .memory, .dinner h2, .dinner > .copy, .dinner-illustration, .location h2, .wedding-calendar, .location h3, .location address, .venue-map, .map-link, .dress-code > img, .dress-copy, .closing-card';
    observer = new IntersectionObserver(entries => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.style.setProperty('--reveal-delay', `${Math.min(order++ * 75, 225)}ms`);
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -12px 0px' });
    for (const element of main.querySelectorAll(selectors)) {
      element.classList.add('reveal');
      if (element.matches('.memory, .dinner-illustration, .couple, .dress-code > img')) element.classList.add('reveal-art');
      observer.observe(element);
    }
    main.classList.add('motion-active');
    updateProgress();
  }
  const envelopeObserver = new MutationObserver(() => {
    if (!document.documentElement.classList.contains('letter-loading')) { start(); envelopeObserver.disconnect(); }
  });
  envelopeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  start();
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  motion.addEventListener('change', event => {
    if (!event.matches) return;
    observer?.disconnect();
    main.classList.remove('motion-active');
    main.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
  });
})();
