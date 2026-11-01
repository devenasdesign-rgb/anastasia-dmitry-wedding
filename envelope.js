(() => {
  const intro = document.getElementById('letter-intro');
  const main = document.querySelector('main');
  if (!intro || !main) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let opening = false;
  let finished = false;
  // Once initialized, keep the envelope closed until the seal is pressed.
  clearTimeout(window.letterSafety);
  main.inert = true;

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(window.letterSafety);
    main.inert = false;
    document.documentElement.classList.remove('letter-loading');
    main.classList.add('invitation-opened');
    intro.remove();
  }

  function open() {
    if (opening || finished) return;
    opening = true;
    intro.classList.add('is-opening');
    if (reducedMotion) { finish(); return; }
    setTimeout(() => intro.classList.add('is-extracting'), 700);
    setTimeout(() => intro.classList.add('is-finished'), 1750);
    setTimeout(finish, 2400);
  }

  intro.querySelector('.wax-seal').addEventListener('click', open);
})();
