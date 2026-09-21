(() => {
  'use strict';

  const ROOT = document.documentElement;
  const BODY = document.body;
  if (!BODY || document.querySelector('.fx-living-habitat-r1530')) return;

  const PARAMS = new URLSearchParams(location.search);
  const REDUCED = matchMedia('(prefers-reduced-motion:reduce)');
  const MOBILE = matchMedia('(max-width:900px),(pointer:coarse)');
  const LIGHTHOUSE = PARAMS.get('lighthouse') === '1';
  const AUTOMATION = navigator.webdriver === true || LIGHTHOUSE;
  const LOW_POWER = MOBILE.matches && (
    Number(navigator.hardwareConcurrency || 8) <= 4 ||
    Number(navigator.deviceMemory || 8) <= 4
  );

  const canvas = document.createElement('canvas');
  canvas.className = 'fx-living-habitat-r1530';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.renderer = 'canvas2d-atmospheric-habitat';
  BODY.prepend(canvas);

  const ctx = canvas.getContext('2d', { alpha:true, desynchronized:true });
  if (!ctx) {
    canvas.remove();
    ROOT.dataset.fxLivingHabitatR1530 = 'canvas-unavailable';
    return;
  }

  let width = 1;
  let height = 1;
  let dpr = 1;
  let raf = 0;
  let last = 0;
  let running = true;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let scrollTarget = 0;
  let scrollValue = 0;
  let impulse = 0;
  let particles = [];
  let filaments = [];

  function seeded(seed = 0xF04A1530) {
    let s = seed >>> 0;
    return () => {
      s += 0x6D2B79F5;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const random = seeded();

  function seedScene() {
    const count = AUTOMATION ? 14 : LOW_POWER ? 20 : MOBILE.matches ? 32 : 58;
    particles = Array.from({length:count}, () => ({
      x: random(),
      y: random(),
      z: .18 + random() * .82,
      size: .45 + random() * 1.45,
      phase: random() * Math.PI * 2,
      drift: .20 + random() * .80,
      alpha: .14 + random() * .42
    }));

    const lineCount = AUTOMATION ? 2 : LOW_POWER ? 3 : MOBILE.matches ? 4 : 7;
    filaments = Array.from({length:lineCount}, (_,index) => ({
      x: .10 + random() * .80,
      y: .08 + random() * .84,
      len: .18 + random() * .26,
      bend: (random() - .5) * .22,
      phase: random() * Math.PI * 2,
      alpha: .018 + random() * .024,
      width: .45 + random() * .55,
      drift: .30 + random() * .70,
      dir: index % 2 ? 1 : -1
    }));
  }

  function resize() {
    width = Math.max(1, innerWidth);
    height = Math.max(1, innerHeight);
    dpr = Math.min(devicePixelRatio || 1, LOW_POWER ? 1 : MOBILE.matches ? 1.08 : 1.28);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedScene();
  }

  function updateScroll() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollTarget = Math.max(0, Math.min(1, scrollY / max));
  }

  function pointer(event) {
    if (MOBILE.matches) return;
    targetX = (event.clientX / Math.max(1, width) - .5) * 2;
    targetY = (event.clientY / Math.max(1, height) - .5) * 2;
  }

  function radial(x, y, radius, stops) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    stops.forEach((entry) => g.addColorStop(entry[0], entry[1]));
    return g;
  }

  function drawShaft(time, breath) {
    const x = width * (MOBILE.matches ? .50 : .66) + pointerX * width * .012;
    const y = -height * .04 + pointerY * height * .006;
    const radius = Math.max(width, height) * (.44 + breath * .012);

    ctx.fillStyle = radial(x, y, radius, [
      [0, 'rgba(214,248,251,' + (.030 + breath * .008 + impulse * .012) + ')'],
      [.18, 'rgba(112,204,220,' + (.022 + breath * .006) + ')'],
      [.52, 'rgba(42,104,122,.010)'],
      [1, 'rgba(0,0,0,0)']
    ]);
    ctx.fillRect(0, 0, width, height);

    const floor = ctx.createRadialGradient(
      width * .52, height * 1.04, 0,
      width * .52, height * 1.04, Math.max(width, height) * .54
    );
    floor.addColorStop(0, 'rgba(68,130,142,' + (.020 + breath * .004) + ')');
    floor.addColorStop(.45, 'rgba(23,68,79,.010)');
    floor.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = floor;
    ctx.fillRect(0, 0, width, height);
  }

  function drawFilaments(time, breath) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    filaments.forEach((f) => {
      const sway = Math.sin(time * .00015 * f.drift + f.phase) * width * .008;
      const scrollShift = (scrollValue - .5) * height * .035 * f.dir;
      const x = f.x * width + sway + pointerX * 4 * f.dir;
      const y = f.y * height + scrollShift;
      const len = f.len * height;
      const bend = f.bend * width + Math.cos(time * .00011 + f.phase) * width * .012;
      const alpha = f.alpha * (.78 + breath * .22);

      const grad = ctx.createLinearGradient(x, y - len * .5, x + bend, y + len * .5);
      grad.addColorStop(0, 'rgba(115,192,206,0)');
      grad.addColorStop(.36, 'rgba(115,192,206,' + (alpha * .55) + ')');
      grad.addColorStop(.56, 'rgba(173,224,232,' + alpha + ')');
      grad.addColorStop(1, 'rgba(115,192,206,0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = f.width;
      ctx.beginPath();
      ctx.moveTo(x, y - len * .5);
      ctx.bezierCurveTo(
        x + bend * .34, y - len * .18,
        x + bend * .80, y + len * .22,
        x + bend, y + len * .5
      );
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawParticles(time, breath) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const p of particles) {
      const driftX = Math.sin(time * .00011 * p.drift + p.phase) * 10 * p.z;
      const driftY = Math.cos(time * .00009 * p.drift + p.phase * .73) * 7 * p.z;
      const x = p.x * width + driftX + pointerX * 7 * p.z;
      let y = p.y * height + driftY - scrollValue * height * .055 * p.z;
      y = ((y % height) + height) % height;
      const size = p.size * (.65 + p.z * .75);
      const alpha = p.alpha * (.52 + .48 * breath) * (.45 + p.z * .55);

      ctx.fillStyle = 'rgba(174,226,235,' + (alpha * .24) + ')';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      if (!LOW_POWER && size > 1.15) {
        ctx.fillStyle = radial(x, y, size * 7, [
          [0, 'rgba(151,215,226,' + (alpha * .055) + ')'],
          [1, 'rgba(0,0,0,0)']
        ]);
        ctx.fillRect(x - size * 7, y - size * 7, size * 14, size * 14);
      }
    }
    ctx.restore();
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    pointerX += (targetX - pointerX) * .045;
    pointerY += (targetY - pointerY) * .045;
    scrollValue += (scrollTarget - scrollValue) * .035;
    impulse *= .965;

    const breath = .5 + .5 * Math.sin(time * .00026);
    drawShaft(time, breath);
    drawFilaments(time, breath);
    drawParticles(time, breath);
  }

  function frame(time) {
    if (!running) return;
    const minFrame = LOW_POWER || MOBILE.matches ? 34 : 20;
    if (!last || time - last >= minFrame) {
      last = time;
      draw(time);
    }
    raf = requestAnimationFrame(frame);
  }

  function restart() {
    cancelAnimationFrame(raf);
    running = !document.hidden;
    if (!running) return;
    last = 0;
    if (REDUCED.matches || AUTOMATION) {
      draw(performance.now());
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  function pulse() {
    impulse = 1;
  }

  addEventListener('resize', resize, { passive:true });
  addEventListener('scroll', updateScroll, { passive:true });
  addEventListener('pointermove', pointer, { passive:true });
  addEventListener('formatx:coretouchpulse', pulse, { passive:true });
  document.addEventListener('formatx:magbirthcomplete', pulse, { passive:true });
  document.addEventListener('visibilitychange', restart);
  REDUCED.addEventListener?.('change', restart);
  MOBILE.addEventListener?.('change', () => { resize(); restart(); });

  resize();
  updateScroll();
  ROOT.dataset.fxLivingHabitatR1530 = REDUCED.matches || AUTOMATION
    ? 'static-physical-atmosphere'
    : 'active-scroll-pointer-atmosphere';
  ROOT.dataset.fxHabitatPerformanceR1530 = LOW_POWER ? 'constrained' : MOBILE.matches ? 'mobile' : 'full';
  restart();
})();