(() => {
  'use strict';

  const root = document.querySelector('.fx-birth');
  const canvas = document.getElementById('fx-birth-particles');
  const percent = document.getElementById('fx-birth-percent');
  const bar = document.getElementById('fx-birth-progress-bar');
  const status = document.getElementById('fx-birth-status');
  const replay = document.getElementById('fx-birth-replay');
  if (!(root instanceof HTMLElement)) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = 5200;
  const statuses = [
    [0.00, 'ENERGIAMEZŐ ÉBRESZTÉSE'],
    [0.16, 'JELMAGOK BEFOGÁSA'],
    [0.34, 'KRISTÁLYSTRUKTÚRA ÖSSZEÁLLÍTÁSA'],
    [0.58, 'ELSŐ IMPULZUS'],
    [0.77, 'IDEGRENDSZER SZINKRONIZÁLÁSA'],
    [0.93, 'MAG ONLINE']
  ];

  let raf = 0;
  let startedAt = 0;
  let particles = [];
  let ctx = null;
  let dpr = 1;

  function sizeCanvas() {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    dpr = Math.min(2, devicePixelRatio || 1);
    const w = innerWidth, h = innerHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedParticles(w, h);
  }

  function seedParticles(w, h) {
    const count = Math.max(42, Math.min(110, Math.round((w * h) / 15000)));
    particles = Array.from({ length: count }, (_, i) => {
      const edge = i % 4;
      let x, y;
      if (edge === 0) { x = Math.random() * w; y = -30 - Math.random() * h * .18; }
      else if (edge === 1) { x = w + 30 + Math.random() * w * .18; y = Math.random() * h; }
      else if (edge === 2) { x = Math.random() * w; y = h + 30 + Math.random() * h * .18; }
      else { x = -30 - Math.random() * w * .18; y = Math.random() * h; }
      return {
        x, y,
        ox: x, oy: y,
        a: .15 + Math.random() * .75,
        s: .45 + Math.random() * 1.5,
        drift: (Math.random() - .5) * 18,
        seed: Math.random() * Math.PI * 2
      };
    });
  }

  function phaseFor(r) {
    if (r < .16) return '0';
    if (r < .34) return '1';
    if (r < .63) return '2';
    if (r < .82) return '3';
    return '4';
  }

  function statusFor(r) {
    let value = statuses[0][1];
    for (const [limit, label] of statuses) if (r >= limit) value = label;
    return value;
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function draw(r, time) {
    if (!ctx || !(canvas instanceof HTMLCanvasElement)) return;
    const w = innerWidth, h = innerHeight;
    ctx.clearRect(0, 0, w, h);
    const cx = w * .5, cy = h * .48;

    const gather = Math.min(1, Math.max(0, (r - .08) / .50));
    const burst = Math.min(1, Math.max(0, (r - .62) / .20));
    const settle = Math.min(1, Math.max(0, (r - .80) / .20));

    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const e = easeOutCubic(gather);
      let x = p.ox + (cx - p.ox) * e;
      let y = p.oy + (cy - p.oy) * e;
      const wobble = Math.sin(time * .0018 + p.seed) * p.drift * (1 - e);
      x += wobble;
      y += Math.cos(time * .0015 + p.seed) * p.drift * .5 * (1 - e);

      if (burst > 0) {
        const angle = Math.atan2(p.oy - cy, p.ox - cx);
        const radius = 46 + burst * (110 + (p.seed % 1) * 90);
        x = cx + Math.cos(angle) * radius * (1 - settle * .45);
        y = cy + Math.sin(angle) * radius * (1 - settle * .45);
      }

      const alpha = p.a * (r < .08 ? r / .08 : 1) * (settle ? .45 : 1);
      ctx.fillStyle = 'rgba(126,235,255,' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(x, y, p.s * (1 + burst * 1.8), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function render(now) {
    if (!startedAt) startedAt = now;
    const elapsed = now - startedAt;
    const r = Math.min(1, elapsed / duration);
    root.dataset.phase = phaseFor(r);

    const value = Math.min(100, Math.round(easeOutCubic(r) * 100));
    if (percent instanceof HTMLOutputElement) percent.value = String(value).padStart(3, '0');
    if (bar instanceof HTMLElement) bar.style.width = value + '%';
    if (status instanceof HTMLElement) status.textContent = statusFor(r);

    draw(r, now);

    if (r < 1) raf = requestAnimationFrame(render);
    else {
      root.dataset.phase = '4';
      if (percent instanceof HTMLOutputElement) percent.value = '100';
      if (bar instanceof HTMLElement) bar.style.width = '100%';
      if (status instanceof HTMLElement) status.textContent = 'MAG ONLINE';
    }
  }

  function start() {
    cancelAnimationFrame(raf);
    startedAt = 0;
    root.dataset.phase = reduced ? '4' : '0';
    if (percent instanceof HTMLOutputElement) percent.value = reduced ? '100' : '000';
    if (bar instanceof HTMLElement) bar.style.width = reduced ? '100%' : '0%';
    if (status instanceof HTMLElement) status.textContent = reduced ? 'MAG ONLINE' : 'ENERGIAMEZŐ ÉBRESZTÉSE';
    if (!reduced) raf = requestAnimationFrame(render);
    else draw(1, performance.now());
  }

  addEventListener('resize', sizeCanvas, { passive: true });
  addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
  replay?.addEventListener('click', start);

  sizeCanvas();
  start();
})();