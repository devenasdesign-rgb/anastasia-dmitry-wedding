(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('animate' in Element.prototype) || !('IntersectionObserver' in window)) return;
  const root = document.documentElement;
  const hero = document.querySelector('.couple-scene');
  const dinner = document.querySelector('.dinner-scene');
  const film = document.querySelector('.dinner-film');
  if (!hero || !dinner || !film) return;
  root.classList.add('film-on', 'film-prelude');

  // Characters are vector groups in one sprite; until it arrives the flat drawing stays.
  fetch('assets/film/characters.svg')
    .then(response => response.ok ? response.text() : Promise.reject())
    .then(text => {
      const holder = document.createElement('div');
      holder.hidden = true;
      holder.innerHTML = text;
      document.body.prepend(holder);
      hero.classList.add('scene-ready');
      dinner.classList.add('scene-ready');
      document.querySelector('.dress-art')?.classList.add('scene-ready');
    })
    .catch(() => {});

  /* ---------- Sound: a soft synthesized glass "ding" ---------- */
  let audio, master, soundOn = true;
  try { soundOn = localStorage.getItem('wedding-sound') !== 'off'; } catch (e) {}
  function unlockAudio() {
    if (audio) { audio.resume(); return; }
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    audio = new Context();
    master = audio.createGain(); master.gain.value = .5; master.connect(audio.destination);
  }
  function ding(delay = 0, pitch = 1) {
    if (!soundOn || !audio || audio.state !== 'running') return;
    const now = audio.currentTime + delay;
    [2637, 3951, 5274].forEach((frequency, i) => {
      const osc = audio.createOscillator(), gain = audio.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency * pitch * (1 + Math.random() * .006);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(.16 / (i + 1), now + .004);
      gain.gain.exponentialRampToValueAtTime(.0001, now + 1.4 - i * .35);
      osc.connect(gain).connect(master);
      osc.start(now); osc.stop(now + 1.5);
    });
  }
  function clinkSound() { ding(0, 1); ding(.035, 1.06); }
  document.querySelector('.wax-seal')?.addEventListener('click', unlockAudio);
  window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
  const toggle = document.createElement('button');
  toggle.className = 'sound-toggle';
  toggle.type = 'button';
  toggle.textContent = '♪';
  const syncToggle = () => {
    toggle.setAttribute('aria-pressed', String(soundOn));
    toggle.setAttribute('aria-label', soundOn ? 'Выключить звук бокалов' : 'Включить звук бокалов');
  };
  syncToggle();
  toggle.addEventListener('click', () => {
    soundOn = !soundOn; unlockAudio(); syncToggle();
    try { localStorage.setItem('wedding-sound', soundOn ? 'on' : 'off'); } catch (e) {}
    if (soundOn) clinkSound();
  });
  document.body.append(toggle);

  /* ---------- Opening titles and hero ---------- */
  const grain = document.createElement('div'); grain.className = 'film-grain'; grain.setAttribute('aria-hidden', 'true');
  const vignette = document.createElement('div'); vignette.className = 'film-vignette'; vignette.setAttribute('aria-hidden', 'true');
  document.body.append(vignette, grain);

  const D = 6800, ease = 'cubic-bezier(.45,0,.25,1)';
  const lean = sign => [
    { transform: 'rotate(0deg)', offset: 0 },
    { transform: 'rotate(0deg)', offset: .12, easing: ease },
    { transform: `rotate(${5.6 * sign}deg) translateY(-5px)`, offset: .25, easing: 'ease-in-out' },
    { transform: `rotate(${4.7 * sign}deg) translateY(-2px)`, offset: .33, easing: 'ease-in-out' },
    { transform: `rotate(${5.5 * sign}deg) translateY(-5px)`, offset: .41, easing: 'ease-in-out' },
    { transform: `rotate(${4.7 * sign}deg) translateY(-2px)`, offset: .49, easing: 'ease-in-out' },
    { transform: `rotate(${5.3 * sign}deg) translateY(-4px)`, offset: .6, easing: ease },
    { transform: `rotate(${-1.1 * sign}deg)`, offset: .76, easing: 'ease-in-out' },
    { transform: 'rotate(0deg)', offset: .86 },
    { transform: 'rotate(0deg)', offset: 1 }
  ];
  const bride = hero.querySelector('.kiss-bride'), groom = hero.querySelector('.kiss-groom');
  bride.style.transformOrigin = '230px 440px';
  groom.style.transformOrigin = '470px 440px';
  const heroLoop = [
    bride.animate(lean(1), { duration: D, iterations: Infinity }),
    groom.animate(lean(-1), { duration: D, iterations: Infinity }),
    hero.querySelector('.kiss-blush').animate([
      { opacity: 0, offset: 0 }, { opacity: 0, offset: .2 }, { opacity: 1, offset: .32 },
      { opacity: .8, offset: .6 }, { opacity: 0, offset: .78 }, { opacity: 0, offset: 1 }
    ], { duration: D, iterations: Infinity }),
    hero.querySelector('.kiss-spark').animate([
      { opacity: 0, transform: 'scale(.6)', offset: 0 }, { opacity: 0, transform: 'scale(.6)', offset: .3 },
      { opacity: 1, transform: 'scale(1)', offset: .34 }, { opacity: 0, transform: 'scale(1.2)', offset: .4 },
      { opacity: 1, transform: 'scale(1)', offset: .43 }, { opacity: 0, transform: 'scale(1.25)', offset: .5 },
      { opacity: 0, offset: 1 }
    ], { duration: D, iterations: Infinity })
  ];
  const drift = [[0, -130, 1.3], [-48, -110, 1], [46, -120, 1.05], [10, -160, 1.15]];
  hero.querySelectorAll('.kiss-heart').forEach((heart, i) => {
    const start = .3 + i * .055, [dx, dy, s] = drift[i];
    heroLoop.push(heart.animate([
      { opacity: 0, transform: 'translate(0,10px) scale(.3)', offset: 0 },
      { opacity: 0, transform: 'translate(0,10px) scale(.3)', offset: start },
      { opacity: 1, transform: `translate(${dx * .3}px,${dy * .3}px) scale(${s})`, offset: start + .07 },
      { opacity: 0, transform: `translate(${dx}px,${dy}px) scale(${s * .8}) rotate(${dx / 3}deg)`, offset: start + .3 },
      { opacity: 0, offset: 1 }
    ], { duration: D, iterations: Infinity, easing: 'ease-out' }));
  });
  heroLoop.forEach(animation => animation.pause());

  let heroVisible = true, heroStarted = false;
  const playHero = () => heroLoop.forEach(a => (heroStarted && heroVisible ? a.play() : a.pause()));
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; playHero(); }).observe(hero);

  // The envelope scatters its pattern, then the hero writes itself in.
  function openingTitles() {
    setTimeout(() => { root.classList.add('hero-play'); root.classList.remove('film-prelude'); }, 250);
    setTimeout(() => toggle.classList.add('shown'), 1800);
    setTimeout(() => { heroStarted = true; playHero(); }, 2700);
  }
  if (root.classList.contains('letter-loading')) {
    const wait = new MutationObserver(() => {
      if (!root.classList.contains('letter-loading')) { wait.disconnect(); openingTitles(); }
    });
    wait.observe(root, { attributes: true, attributeFilter: ['class'] });
  } else openingTitles();

  /* ---------- Story: bubbles play when they scroll in ---------- */
  const messages = document.querySelector('.messages-scene');
  if (messages) new IntersectionObserver((entries, observer) => {
    if (entries[0].isIntersecting && !root.classList.contains('letter-loading')) {
      messages.classList.add('play'); observer.disconnect();
    }
  }, { threshold: .5 }).observe(messages);

  /* ---------- Dinner: scroll moves the camera, guests lean in and toast ---------- */
  const scrubbed = [];
  const scrub = (element, frames) => {
    const animation = element.animate(frames, { duration: 1000, fill: 'both' });
    animation.pause(); scrubbed.push(animation);
  };
  const shot = (x, y, s) => `translate(${390 - s * x}px,${472 - s * y}px) scale(${s})`;
  const inOut = 'cubic-bezier(.6,0,.3,1)';
  scrub(dinner.querySelector('.dinner-camera'), [
    { transform: shot(390, 472, 1), offset: 0 },
    { transform: shot(390, 472, 1), offset: .08, easing: inOut },
    { transform: shot(388, 170, 2.05), offset: .24 },
    { transform: shot(388, 176, 1.95), offset: .36, easing: inOut },
    { transform: shot(225, 410, 1.6), offset: .48 },
    { transform: shot(232, 418, 1.55), offset: .58, easing: inOut },
    { transform: shot(560, 440, 1.6), offset: .7 },
    { transform: shot(552, 446, 1.55), offset: .8, easing: inOut },
    { transform: shot(390, 450, 1.02), offset: .92 },
    { transform: shot(390, 472, 1), offset: 1 }
  ]);
  const leanKeys = (deg, inAt, outAt, extra = '') => [
    { transform: 'none', offset: 0 },
    { transform: 'none', offset: inAt - .07, easing: 'ease-in-out' },
    { transform: `rotate(${deg}deg) ${extra}`, offset: inAt },
    { transform: `rotate(${deg}deg) ${extra}`, offset: outAt - .06, easing: 'ease-in-out' },
    { transform: 'none', offset: outAt },
    { transform: 'none', offset: .86, easing: 'ease-in-out' },
    { transform: `rotate(${deg}deg) ${extra}`, offset: .94 },
    { transform: `rotate(${deg}deg) ${extra}`, offset: 1 }
  ];
  // Bodies only lean a little; the arms do the toast, swinging the glass towards the table centre.
  const guests = {
    couple: [0, .28, .42, 'translateY(-4px)'],
    aunt: [1.2, .5, .64], grandpa: [1, .52, .64], boy: [.9, .54, .66],
    grandma: [-1, .72, .84], uncle: [-.9, .74, .85], girl: [-.8, .76, .86]
  };
  for (const [name, [deg, inAt, outAt, extra]] of Object.entries(guests)) {
    scrub(dinner.querySelector(`.guest-${name}`), leanKeys(deg, inAt, outAt, extra));
  }
  const arms = {
    bride: [6, .28, .42], groom: [-6, .28, .42],
    aunt: [11, .5, .64], grandpa: [10, .52, .64], boy: [10, .54, .66],
    uncle: [-10, .74, .85], girl: [-10, .76, .86]
  };
  for (const [name, [deg, inAt, outAt]] of Object.entries(arms)) {
    scrub(dinner.querySelector(`.arm-${name}`), leanKeys(deg, inAt, outAt, 'translateY(-3px)'));
  }
  scrub(dinner.querySelector('.toast-glow'), [
    { opacity: 0, offset: 0 }, { opacity: 0, offset: .84 }, { opacity: 1, offset: .95 }, { opacity: 1, offset: 1 }
  ]);

  const clinkAt = { couple: [.29], aunt: [.51], grandpa: [.53], boy: [.55], uncle: [.75], girl: [.77] };
  const cues = [];
  for (const [name, times] of Object.entries(clinkAt)) {
    const el = dinner.querySelector(`.guest-${name} .clink`);
    for (const t of [...times, .95]) cues.push({ t, run: () => burst(el) });
  }
  cues.push({ t: .96, run: () => dinner.querySelectorAll('.party-heart').forEach((heart, i) => {
    heart.classList.remove('fly'); void heart.getBBox(); heart.style.animationDelay = `${i * 90}ms`; heart.classList.add('fly');
  }) });
  let lastSound = 0;
  function burst(el) {
    el.classList.remove('ding'); void el.getBBox(); el.classList.add('ding');
    const now = performance.now();
    if (now - lastSound > 120) { lastSound = now; clinkSound(); }
  }

  const captions = [...dinner.parentElement.querySelectorAll('.toast-caption span')];
  const captionRanges = [[.22, .42], [.45, .66], [.68, .86], [.9, 1.01]];
  const bars = [...dinner.parentElement.querySelectorAll('.film-progress i')];

  let inView = false, queued = false, last = -1;
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    dinner.classList.toggle('scene-in-view', inView);
    if (inView) requestUpdate();
  }, { rootMargin: '20% 0px' }).observe(film);

  function update() {
    queued = false;
    if (!inView || root.classList.contains('letter-loading')) return;
    const box = film.getBoundingClientRect();
    const distance = box.height - window.innerHeight;
    const p = Math.min(1, Math.max(0, distance > 0 ? -box.top / distance : 0));
    for (const animation of scrubbed) animation.currentTime = p * 999;
    if (last >= 0 && p > last) for (const cue of cues) if (cue.t > last && cue.t <= p) cue.run();
    last = p;
    captions.forEach((caption, i) => caption.classList.toggle('on', p >= captionRanges[i][0] && p < captionRanges[i][1]));
    bars.forEach((bar, i) => bar.style.setProperty('--p', Math.min(1, Math.max(0, (p - i * .25) / .25))));
  }
  function requestUpdate() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });

  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    heroLoop.concat(scrubbed).forEach(animation => animation.cancel());
    root.classList.remove('film-on', 'film-prelude', 'hero-play');
    [hero, dinner].forEach(scene => scene.classList.remove('scene-ready'));
    grain.remove(); vignette.remove();
  });
})();
