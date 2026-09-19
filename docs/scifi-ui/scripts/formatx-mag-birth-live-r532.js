(() => {
  'use strict';

  const ROOT = document.documentElement;
  const FORCE = new URLSearchParams(location.search).get('intro') === '1';
  const KEY = 'formatx:mag-birth-live-r532-seen';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DURATION = 5200;
  const EXIT_MS = 720;

  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (_) {}
  if (seen && !FORCE) {
    ROOT.dataset.fxMagBirthLiveR532 = 'session-skip';
    return;
  }

  const en = ROOT.lang === 'en';
  const text = en ? {
    kicker: 'FORMATX / CORE GENESIS',
    title: 'THE BIRTH OF THE CORE',
    subtitle: 'The first impulse of the living system.',
    skip: 'SKIP',
    skipAria: 'Skip the FormatX core birth intro',
    statuses: [
      [0.00, 'AWAKENING ENERGY FIELD'],
      [0.16, 'CAPTURING SIGNAL SEEDS'],
      [0.34, 'ASSEMBLING CRYSTAL STRUCTURE'],
      [0.58, 'FIRST IMPULSE'],
      [0.77, 'SYNCHRONIZING NERVOUS SYSTEM'],
      [0.93, 'CORE ONLINE']
    ]
  } : {
    kicker: 'FORMATX / MAG GENESIS',
    title: 'A MAG SZÜLETÉSE',
    subtitle: 'Az élő rendszer első impulzusa.',
    skip: 'ÁTUGRÁS',
    skipAria: 'A FormatX MAG születése intró átugrása',
    statuses: [
      [0.00, 'ENERGIAMEZŐ ÉBRESZTÉSE'],
      [0.16, 'JELMAGOK BEFOGÁSA'],
      [0.34, 'KRISTÁLYSTRUKTÚRA ÖSSZEÁLLÍTÁSA'],
      [0.58, 'ELSŐ IMPULZUS'],
      [0.77, 'IDEGRENDSZER SZINKRONIZÁLÁSA'],
      [0.93, 'MAG ONLINE']
    ]
  };

  const overlay = document.createElement('section');
  overlay.className = 'fx-mag-birth-live';
  overlay.dataset.phase = '0';
  overlay.setAttribute('aria-label', text.title);
  overlay.innerHTML = `
    <canvas class="fxb-particles" aria-hidden="true"></canvas>
    <div class="fxb-grid" aria-hidden="true"></div>
    <div class="fxb-halo fxb-halo-outer" aria-hidden="true"></div>
    <div class="fxb-halo fxb-halo-inner" aria-hidden="true"></div>
    <div class="fxb-axis fxb-axis-h" aria-hidden="true"></div>
    <div class="fxb-axis fxb-axis-v" aria-hidden="true"></div>
    <div class="fxb-core" aria-hidden="true">
      <span class="fxb-shard fxb-shard-n"></span>
      <span class="fxb-shard fxb-shard-e"></span>
      <span class="fxb-shard fxb-shard-s"></span>
      <span class="fxb-shard fxb-shard-w"></span>
      <span class="fxb-facet fxb-facet-nw"></span>
      <span class="fxb-facet fxb-facet-ne"></span>
      <span class="fxb-facet fxb-facet-se"></span>
      <span class="fxb-facet fxb-facet-sw"></span>
      <i class="fxb-nucleus"></i>
      <b class="fxb-heart"></b>
    </div>
    <div class="fxb-flash" aria-hidden="true"></div>
    <header class="fxb-copy">
      <p class="fxb-kicker"></p>
      <h1></h1>
      <p class="fxb-subtitle"></p>
    </header>
    <div class="fxb-telemetry" aria-live="polite">
      <output class="fxb-percent">000</output>
      <progress class="fxb-progress" max="100" value="0">0%</progress>
      <span class="fxb-status"></span>
    </div>
    <button class="fxb-skip" type="button"></button>
  `;

  const kicker = overlay.querySelector('.fxb-kicker');
  const title = overlay.querySelector('h1');
  const subtitle = overlay.querySelector('.fxb-subtitle');
  const skip = overlay.querySelector('.fxb-skip');
  const percent = overlay.querySelector('.fxb-percent');
  const progress = overlay.querySelector('.fxb-progress');
  const status = overlay.querySelector('.fxb-status');
  const canvas = overlay.querySelector('.fxb-particles');

  kicker.textContent = text.kicker;
  title.textContent = text.title;
  subtitle.textContent = text.subtitle;
  skip.textContent = text.skip;
  skip.setAttribute('aria-label', text.skipAria);
  status.textContent = text.statuses[0][1];

  let ctx = null;
  let particles = [];
  let raf = 0;
  let startedAt = 0;
  let finished = false;
  let exitTimer = 0;

  function phaseFor(r) {
    if (r < .16) return '0';
    if (r < .34) return '1';
    if (r < .63) return '2';
    if (r < .82) return '3';
    return '4';
  }
  function statusFor(r) {
    let value = text.statuses[0][1];
    for (const [limit,label] of text.statuses) if (r >= limit) value = label;
    return value;
  }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function seedParticles(w,h) {
    const count = Math.max(42, Math.min(110, Math.round((w*h)/15000)));
    particles = Array.from({length:count}, (_,i) => {
      const edge = i % 4;
      let x,y;
      if (edge === 0) { x=Math.random()*w; y=-30-Math.random()*h*.18; }
      else if (edge === 1) { x=w+30+Math.random()*w*.18; y=Math.random()*h; }
      else if (edge === 2) { x=Math.random()*w; y=h+30+Math.random()*h*.18; }
      else { x=-30-Math.random()*w*.18; y=Math.random()*h; }
      return {x,y,ox:x,oy:y,a:.15+Math.random()*.75,s:.45+Math.random()*1.5,drift:(Math.random()-.5)*18,seed:Math.random()*Math.PI*2};
    });
  }

  function sizeCanvas() {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = innerWidth, h = innerHeight;
    canvas.width = Math.max(1, Math.floor(w*dpr));
    canvas.height = Math.max(1, Math.floor(h*dpr));
    ctx = canvas.getContext('2d', {alpha:true,desynchronized:true});
    if (ctx) ctx.setTransform(dpr,0,0,dpr,0,0);
    seedParticles(w,h);
  }

  function draw(r,time) {
    if (!ctx || !(canvas instanceof HTMLCanvasElement)) return;
    const w=innerWidth,h=innerHeight,cx=w*.5,cy=h*.48;
    ctx.clearRect(0,0,w,h);
    const gather=Math.min(1,Math.max(0,(r-.08)/.50));
    const burst=Math.min(1,Math.max(0,(r-.62)/.20));
    const settle=Math.min(1,Math.max(0,(r-.80)/.20));
    ctx.globalCompositeOperation='lighter';
    for (const p of particles) {
      const e=easeOutCubic(gather);
      let x=p.ox+(cx-p.ox)*e;
      let y=p.oy+(cy-p.oy)*e;
      const wobble=Math.sin(time*.0018+p.seed)*p.drift*(1-e);
      x+=wobble;
      y+=Math.cos(time*.0015+p.seed)*p.drift*.5*(1-e);
      if (burst>0) {
        const angle=Math.atan2(p.oy-cy,p.ox-cx);
        const radius=46+burst*(110+(p.seed%1)*90);
        x=cx+Math.cos(angle)*radius*(1-settle*.45);
        y=cy+Math.sin(angle)*radius*(1-settle*.45);
      }
      const alpha=p.a*(r<.08?r/.08:1)*(settle?.45:1);
      ctx.fillStyle='rgba(126,235,255,'+alpha.toFixed(3)+')';
      ctx.beginPath();
      ctx.arc(x,y,p.s*(1+burst*1.8),0,Math.PI*2);
      ctx.fill();
    }
    ctx.globalCompositeOperation='source-over';
  }

  function cleanup(source) {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    clearTimeout(exitTimer);
    overlay.classList.add('is-leaving');
    ROOT.dataset.fxMagBirthLiveR532 = source;
    ROOT.removeAttribute('data-fx-mag-birth-live');
    exitTimer = window.setTimeout(() => {
      overlay.remove();
      document.dispatchEvent(new CustomEvent('formatx:magbirthcomplete',{detail:{source}}));
    }, REDUCED ? 20 : EXIT_MS);
  }

  function render(now) {
    if (!startedAt) startedAt=now;
    const r=Math.min(1,(now-startedAt)/DURATION);
    overlay.dataset.phase=phaseFor(r);
    const value=Math.min(100,Math.round(easeOutCubic(r)*100));
    percent.value=String(value).padStart(3,'0');
    progress.value=value;
    status.textContent=statusFor(r);
    draw(r,now);
    if (r<1) raf=requestAnimationFrame(render);
    else {
      overlay.dataset.phase='4';
      percent.value='100';
      progress.value=100;
      status.textContent=text.statuses[text.statuses.length-1][1];
      exitTimer=window.setTimeout(()=>cleanup('complete'),520);
    }
  }

  function start() {
    try { sessionStorage.setItem(KEY,'1'); } catch (_) {}
    ROOT.dataset.fxMagBirthLiveR532='active';
    ROOT.setAttribute('data-fx-mag-birth-live','active');
    document.body.prepend(overlay);
    sizeCanvas();
    if (REDUCED) {
      overlay.dataset.phase='4';
      percent.value='100';
      progress.value=100;
      status.textContent=text.statuses[text.statuses.length-1][1];
      draw(1,performance.now());
      exitTimer=window.setTimeout(()=>cleanup('reduced-motion'),650);
    } else {
      raf=requestAnimationFrame(render);
    }
  }

  skip.addEventListener('click',()=>cleanup('user-skip'));
  addEventListener('resize',sizeCanvas,{passive:true});
  addEventListener('pagehide',()=>cleanup('pagehide'),{once:true});
  addEventListener('error',()=>cleanup('runtime-error'),{once:true});

  start();
})();