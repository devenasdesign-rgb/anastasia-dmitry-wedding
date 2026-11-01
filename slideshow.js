(() => {
  const frame = document.querySelector('.memory');
  if (!frame) return;
  const images = [...frame.querySelectorAll('.memory-photo')];
  const photos = ['assets/photo.png', ...Array.from({ length: 13 }, (_, i) => `assets/slide-${i + 1}.png`)];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, front = 0, timer, busy = false, visible = false;
  let paused = motion.matches;
  const ready = new Map();

  function preload(src) {
    if (!ready.has(src)) ready.set(src, new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => { ready.delete(src); resolve(null); };
      image.src = src;
    }));
    return ready.get(src);
  }

  function stop() { clearTimeout(timer); }
  function schedule() {
    stop();
    if (!paused && visible && !document.hidden) timer = setTimeout(next, 1200);
  }

  async function next() {
    if (busy || paused || !visible || document.hidden) return;
    busy = true;
    const nextIndex = (index + 1) % photos.length;
    const loaded = await preload(photos[nextIndex]);
    if (loaded && !paused && visible && !document.hidden) {
      const incoming = images[1 - front], outgoing = images[front];
      incoming.src = photos[nextIndex];
      incoming.alt = `Наш совместный снимок ${nextIndex + 1}`;
      incoming.classList.remove('memory-photo-next');
      incoming.setAttribute('aria-hidden', 'false');
      outgoing.classList.add('memory-photo-next');
      outgoing.setAttribute('aria-hidden', 'true');
      index = nextIndex;
      front = 1 - front;
      preload(photos[(index + 1) % photos.length]);
    } else if (!loaded) {
      // A missing image must not stop the rest of the gallery.
      index = nextIndex;
    }
    busy = false;
    schedule();
  }

  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', event => { paused = event.matches; schedule(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) { preload(photos[(index + 1) % photos.length]); }
      schedule();
    }, { threshold: 0.15 }).observe(frame);
  } else { visible = true; schedule(); }
})();
