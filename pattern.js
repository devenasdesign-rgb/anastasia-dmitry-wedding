(() => {
  // The closing pattern rebuilt from separate vector motifs: they bloom in one by one,
  // keep swaying, and bounce when tapped.
  const footer = document.querySelector('.closing');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!footer || !window.weddingMotifs || !('IntersectionObserver' in window)) return;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('closing-motifs');
  svg.setAttribute('aria-hidden', 'true');
  let items = [];

  async function build() {
    const list = await window.weddingMotifs;
    if (!list.length) return;
    const w = footer.offsetWidth, h = footer.offsetHeight;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.replaceChildren();
    items = [];
    // Place motifs on a jittered grid, skipping any spot that would overlap a neighbour.
    const cell = w / 5.2, cols = Math.ceil(w / cell) + 1, rows = Math.ceil(h / cell) + 1;
    const placed = [], gap = cell * .06;
    const free = (x, y, mw, mh) => placed.every(p => x + mw + gap < p.x || p.x + p.w + gap < x || y + mh + gap < p.y || p.y + p.h + gap < y);
    const small = list.filter(m => m.w < 100 && m.h < 140);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      let m = list[(r * 5 + c * 13 + r * c) % list.length], x, y, mw, mh, fits = false;
      for (let attempt = 0; attempt < 3 && !fits; attempt++) {
        if (attempt) m = small[(r * 7 + c * 3 + attempt * 11) % small.length];
        const big = m.w > 200 || m.h > 200, tiny = m.w < 60;
        const size = cell * (big ? .85 : tiny ? .3 : .55) * (attempt === 2 ? .7 : 1);
        const scale = size / Math.max(m.w, m.h);
        mw = m.w * scale; mh = m.h * scale;
        x = c * cell + (r % 2) * cell / 2 - mw / 2 + ((c * 31 + r * 17) % 13) - 6;
        y = r * cell - mh / 2 + ((c * 19 + r * 29) % 11) - 5;
        fits = free(x, y, mw, mh);
      }
      if (!fits) continue;
      placed.push({ x, y, w: mw, h: mh });
      const g = document.createElementNS(NS, 'g');
      g.classList.add('cm');
      g.style.setProperty('--r', `${((r * 7 + c * 11) % 29) - 14}deg`);
      g.style.setProperty('--d', `${3.6 + ((r + c * 3) % 7) * .45}s`);
      g.style.setProperty('--delay', `${-((r * 3 + c * 5) % 9) * .4}s`);
      const use = document.createElementNS(NS, 'use');
      use.setAttribute('href', `#${m.id}`);
      for (const [k, v] of Object.entries({ x, y, width: mw, height: mh })) use.setAttribute(k, v);
      g.append(use);
      svg.append(g);
      items.push({ g, cx: x + mw / 2, cy: y + mh / 2 });
    }
    footer.classList.add('motifs-ready');
  }

  function bloom() {
    const w = footer.offsetWidth, h = footer.offsetHeight;
    for (const { g, cx, cy } of items) {
      const d = Math.hypot(cx - w / 2, cy - h / 2) / Math.hypot(w / 2, h / 2);
      g.style.setProperty('--in', `${Math.round(d * 900 + Math.random() * 200)}ms`);
    }
    footer.classList.add('motifs-bloom');
  }

  svg.addEventListener('pointerdown', event => {
    const g = event.target.closest('.cm');
    if (!g) return;
    g.classList.remove('boing'); void g.getBBox(); g.classList.add('boing');
  });

  footer.prepend(svg);
  build().then(() => {
    if (reduced.matches) { footer.classList.add('motifs-bloom', 'motifs-still'); return; }
    new IntersectionObserver((entries, observer) => {
      if (!entries[0].isIntersecting || document.documentElement.classList.contains('letter-loading')) return;
      bloom(); observer.disconnect();
    }, { threshold: .15 }).observe(footer);
  });
  let width = footer.offsetWidth;
  addEventListener('resize', () => {
    if (Math.abs(footer.offsetWidth - width) < 2) return;
    width = footer.offsetWidth;
    build().then(() => footer.classList.contains('motifs-bloom') && bloom());
  }, { passive: true });
})();
