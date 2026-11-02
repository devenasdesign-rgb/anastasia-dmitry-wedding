(() => {
  const intro = document.getElementById('letter-intro');
  const main = document.querySelector('main');
  if (!intro || !main) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  let opening = false, revealed = false;
  // Once initialized, keep the envelope closed until the seal is pressed.
  clearTimeout(window.letterSafety);
  main.inert = true;

  // Motif ids with their source sizes; the sprite is shared with the closing pattern.
  window.weddingMotifs = window.weddingMotifs || fetch('assets/motifs.svg')
    .then(response => response.text())
    .then(text => {
      const holder = document.createElement('div');
      holder.hidden = true;
      holder.innerHTML = text;
      document.body.prepend(holder);
      return [...holder.querySelectorAll('symbol')].map(symbol => {
        const [, , w, h] = symbol.getAttribute('viewBox').split(' ').map(Number);
        return { id: symbol.id, w, h };
      });
    })
    .catch(() => []);

  const el = (name, attrs = {}) => {
    const node = document.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  };

  // Wavy envelope edges, drawn for the real screen size.
  function drawEnvelope() {
    const w = innerWidth, h = innerHeight, tip = h * .58, shoulder = h * .31, pocketTop = h * .24, pocketLow = h * .5;
    intro.style.setProperty('--tip', `${tip - 6}px`);
    const wave = (x0, y0, x1, y1, amp) => {
      const dx = x1 - x0, dy = y1 - y0;
      return `C${x0 + dx * .25 + amp} ${y0 + dy * .25 - amp} ${x0 + dx * .5 - amp} ${y0 + dy * .55 + amp} ${x0 + dx * .62} ${y0 + dy * .62}` +
        `S${x0 + dx * .92 - amp * .4} ${y1 - dy * .02} ${x1} ${y1}`;
    };
    const flap = `M0 0H${w}V${shoulder}${wave(w, shoulder, w / 2 + 22, tip, -9)}Q${w / 2} ${tip + 10} ${w / 2 - 22} ${tip}` +
      `${wave(w / 2 - 22, tip, 0, shoulder, 9).replace(/^C/, 'C')}Z`;
    const pocket = `M0 ${h + 2}V${pocketTop}${wave(0, pocketTop, w / 2, pocketLow, 10)}${wave(w / 2, pocketLow, w, pocketTop, -10)}V${h + 2}Z`;
    const defs = `<defs>
      <linearGradient id="env-flap-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6ecdc"/><stop offset="1" stop-color="#ead9bf"/></linearGradient>
      <linearGradient id="env-pocket-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe2cd"/><stop offset="1" stop-color="#e6d3b6"/></linearGradient></defs>`;
    for (const [selector, d] of [['.env-flap', flap], ['.env-pocket', pocket]]) {
      const svg = intro.querySelector(`${selector} .env-shape`);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.innerHTML = `${defs}<path class="paper" d="${d}"/><path class="edge" d="${d}"/>`;
    }
  }

  // The liner: motifs scattered in a loose grid, each one its own vector.
  let motifs = [];
  async function drawPattern() {
    const list = await window.weddingMotifs;
    const svg = intro.querySelector('.intro-pattern');
    const w = innerWidth, h = innerHeight;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.replaceChildren(el('rect', { class: 'liner', width: w, height: h }));
    if (!list.length) return;
    const cell = 78, cols = Math.ceil(w / cell) + 1, rows = Math.ceil(h / cell) + 1;
    let n = 0;
    motifs = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const m = list[(r * 7 + c * 11 + n++) % list.length];
      const size = (m.w > 200 || m.h > 200 ? 74 : m.w < 60 ? 26 : 50) * (.85 + ((r * 13 + c * 7) % 5) * .06);
      const scale = size / Math.max(m.w, m.h);
      const x = c * cell + (r % 2) * cell / 2 - cell / 2 + ((c * 37 + r * 17) % 19) - 9;
      const y = r * cell - cell / 2 + ((c * 23 + r * 41) % 17) - 8;
      const g = el('g', { class: 'motif' });
      g.append(el('use', { href: `#${m.id}`, x, y, width: m.w * scale, height: m.h * scale, transform: `rotate(${((r * 5 + c * 9) % 31) - 15} ${x + m.w * scale / 2} ${y + m.h * scale / 2})` }));
      svg.append(g);
      motifs.push({ g, cx: x + m.w * scale / 2, cy: y + m.h * scale / 2 });
    }
  }

  function scatter() {
    const w = innerWidth, h = innerHeight, cx = w / 2, cy = h * .45, far = Math.hypot(w, h);
    let longest = 0;
    for (const { g, cx: x, cy: y } of motifs) {
      const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1;
      const delay = d / far * 900 + Math.random() * 120;
      const push = far * (.55 + Math.random() * .35);
      const spin = (Math.random() - .5) * 140;
      longest = Math.max(longest, delay + 1300);
      g.animate([
        { transform: 'translate(0,0) rotate(0) scale(1)', opacity: 1 },
        { transform: `translate(${dx / d * push * .12}px,${dy / d * push * .12 - 10}px) rotate(${spin * .15}deg) scale(1.08)`, opacity: 1, offset: .25 },
        { transform: `translate(${dx / d * push}px,${dy / d * push}px) rotate(${spin}deg) scale(.7)`, opacity: 0 }
      ], { duration: 1300, delay, easing: 'cubic-bezier(.5,0,.75,.4)', fill: 'forwards' });
    }
    return longest;
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    clearTimeout(window.letterSafety);
    main.inert = false;
    intro.classList.add('is-revealing');
    document.documentElement.classList.remove('letter-loading');
    main.classList.add('invitation-opened');
  }

  function open() {
    if (opening) return;
    opening = true;
    if (reducedMotion) { reveal(); intro.remove(); return; }
    intro.classList.add('is-opening');
    setTimeout(() => intro.classList.add('is-sliding'), 1200);
    setTimeout(() => {
      const total = scatter();
      setTimeout(reveal, 350);
      setTimeout(() => intro.remove(), total + 200);
    }, 2250);
  }

  drawEnvelope();
  drawPattern();
  let resizeTimer;
  addEventListener('resize', () => {
    if (opening) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { drawEnvelope(); drawPattern(); }, 150);
  });
  intro.querySelector('.wax-seal').addEventListener('click', open);
})();
