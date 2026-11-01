(() => {
  const root = document.querySelector('.countdown');
  if (!root) return;
  const target = Date.parse('2026-11-11T18:00:00+05:00');
  const fields = Object.fromEntries(['days', 'hours', 'minutes', 'seconds'].map(name => [name, root.querySelector(`[data-count="${name}"]`)]));
  let timer;
  function update() {
    const total = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const values = { days: Math.floor(total / 86400), hours: Math.floor(total / 3600) % 24, minutes: Math.floor(total / 60) % 60, seconds: total % 60 };
    for (const [name, value] of Object.entries(values)) fields[name].textContent = String(value).padStart(2, '0');
    root.hidden = false;
    document.querySelector('.hero').classList.add('has-countdown');
    if (total === 0) {
      root.querySelector('.countdown-title').textContent = 'Наш день настал!';
      clearInterval(timer);
    }
    return total;
  }
  if (update() > 0) timer = setInterval(update, 1000);
  document.addEventListener('visibilitychange', update);
})();
