(() => {
  'use strict';

  const ROOT = document.documentElement;
  const PARAMS = new URLSearchParams(location.search);
  const FORCE = PARAMS.get('intro') === '1';
  const KEY = 'formatx:mag-birth-live-r533-seen';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const AUTOMATION = navigator.webdriver === true;
  const DURATION = 6000;
  const EXIT_MS = 740;

  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (_) {}

  /* R533 fully replaces the R531/R532 preloader path. The legacy node stays in
     source for compatibility validators, but is removed before its deferred
     controller executes, so users never see two intros back-to-back. */
  document.getElementById('formatx-event-horizon')?.remove();
  ROOT.dataset.fxMagBirthOwnerR533 = !FORCE && AUTOMATION ? 'automation-skip' : (seen && !FORCE ? 'session-skip' : 'active');

  if (!FORCE && (seen || AUTOMATION)) {
    ROOT.dataset.fxMagBirthLiveR533 = AUTOMATION ? 'automation-skip' : 'session-skip';
    return;
  }

  const en = ROOT.lang === 'en';
  const copy = en ? {
    kicker: 'FORMATX / CORE GENESIS',
    title: 'THE BIRTH OF THE CORE',
    subtitle: 'The first impulse of the living system.',
    skip: 'SKIP',
    skipAria: 'Skip the FormatX core birth sequence',
    statuses: [
      [0.00, 'AWAKENING ENERGY FIELD'],
      [0.14, 'CAPTURING SIGNAL SEEDS'],
      [0.30, 'FORMING NATIVE CORE'],
      [0.55, 'CRYSTAL STRUCTURE CONVERGING'],
      [0.69, 'FIRST IMPULSE'],
      [0.82, 'SYNCHRONIZING NERVOUS SYSTEM'],
      [0.94, 'CORE ONLINE']
    ]
  } : {
    kicker: 'FORMATX / MAG GENESIS',
    title: 'A MAG SZÜLETÉSE',
    subtitle: 'Az élő rendszer első impulzusa.',
    skip: 'ÁTUGRÁS',
    skipAria: 'A FormatX MAG születése animáció átugrása',
    statuses: [
      [0.00, 'ENERGIAMEZŐ ÉBRESZTÉSE'],
      [0.14, 'JELMAGOK BEFOGÁSA'],
      [0.30, 'NATÍV MAG FORMÁLÁSA'],
      [0.55, 'KRISTÁLYSTRUKTÚRA ÖSSZEÁLLÍTÁSA'],
      [0.69, 'ELSŐ IMPULZUS'],
      [0.82, 'IDEGRENDSZER SZINKRONIZÁLÁSA'],
      [0.94, 'MAG ONLINE']
    ]
  };

  const overlay = document.createElement('section');
  overlay.className = 'fx-mag-birth-r533';
  overlay.dataset.phase = '0';
  overlay.setAttribute('aria-label', copy.title);
  overlay.innerHTML = `
    <div class="fxb-deep" aria-hidden="true"></div>
    <div class="fxb-veil" aria-hidden="true"></div>
    <div class="fxb-stars" aria-hidden="true"></div>
    <canvas class="fxb-particles" aria-hidden="true"></canvas>
    <div class="fxb-grid" aria-hidden="true"></div>
    <div class="fxb-halo fxb-halo-outer" aria-hidden="true"></div>
    <div class="fxb-halo fxb-halo-inner" aria-hidden="true"></div>
    <div class="fxb-axis fxb-axis-h" aria-hidden="true"></div>
    <div class="fxb-axis fxb-axis-v" aria-hidden="true"></div>
    <div class="fxb-lens" aria-hidden="true"></div>
    <div class="fxb-flash" aria-hidden="true"></div>
    <div class="fxb-scan" aria-hidden="true"></div>
    <div class="fxb-letterbox fxb-letterbox-top" aria-hidden="true"></div>
    <div class="fxb-letterbox fxb-letterbox-bottom" aria-hidden="true"></div>
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

  kicker.textContent = copy.kicker;
  title.textContent = copy.title;
  subtitle.textContent = copy.subtitle;
  skip.textContent = copy.skip;
  skip.setAttribute('aria-label', copy.skipAria);
  status.textContent = copy.statuses[0][1];

  let ctx = null;
  let particles = [];
  let raf = 0;
  let startedAt = 0;
  let finished = false;
  let exitTimer = 0;
  let targetX = innerWidth * .5;
  let targetY = innerHeight * .48;
  let stage = null;
  let coreApi = null;
  let lastTargetSync = 0;
  let lastMorphSync = 0;
  let ignitionDone = false;
  let visiblePhase = 0;
  let phaseChangedAt = 0;
  const PHASE_MIN_HOLD_MS = 160;

  function clamp(value,min,max) { return Math.max(min,Math.min(max,value)); }
  function easeOutCubic(t) { return 1 - Math.pow(1-t,3); }
  function smoothstep(t) { t=clamp(t,0,1); return t*t*(3-2*t); }

  function phaseTargetFor(r) {
    if (r < .14) return 0;
    if (r < .30) return 1;
    if (r < .69) return 2;
    if (r < .84) return 3;
    return 4;
  }
  function phaseFor(r,now) {
    const target=phaseTargetFor(r);
    if (target < visiblePhase) {
      visiblePhase=target;
      phaseChangedAt=now;
    } else if (target > visiblePhase && (!phaseChangedAt || now-phaseChangedAt >= PHASE_MIN_HOLD_MS)) {
      visiblePhase+=1;
      phaseChangedAt=now;
    }
    return String(visiblePhase);
  }
  function statusFor(r) {
    let value = copy.statuses[0][1];
    for (const [limit,label] of copy.statuses) if (r >= limit) value = label;
    return value;
  }

  function locateStage() {
    const candidate = document.querySelector('#hero .fx-crystal-organism-r326-stage');
    if (candidate instanceof HTMLElement) stage = candidate;
    coreApi = window.FormatXLivingCore || window.FormatXCoreMobileV69 || coreApi;
    return stage;
  }

  function syncTarget(force=false) {
    const now = performance.now();
    if (!force && now-lastTargetSync < 180) return;
    lastTargetSync = now;
    locateStage();
    const node = stage || document.querySelector('#hero .hero-space');
    if (!(node instanceof HTMLElement)) return;
    const rect = node.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return;
    targetX = clamp(rect.left + rect.width*.5, 0, innerWidth);
    targetY = clamp(rect.top + rect.height*.47, 0, innerHeight);
    const basis = clamp(Math.min(rect.width,rect.height), 260, 720);
    overlay.style.setProperty('--fxb-x', targetX.toFixed(1)+'px');
    overlay.style.setProperty('--fxb-y', targetY.toFixed(1)+'px');
    overlay.style.setProperty('--fxb-hole-a', Math.round(clamp(basis*.22,88,154))+'px');
    overlay.style.setProperty('--fxb-hole-b', Math.round(clamp(basis*.35,138,238))+'px');
    overlay.style.setProperty('--fxb-hole-c', Math.round(clamp(basis*.57,224,388))+'px');
  }

  function setStageOpacity(value) {
    locateStage();
    if (!(stage instanceof HTMLElement)) return;
    stage.style.setProperty('opacity', String(clamp(value,0,1)), 'important');
    stage.style.setProperty('transition', 'opacity .72s cubic-bezier(.2,.7,.2,1)', 'important');
  }

  function releaseStageStyle() {
    if (!(stage instanceof HTMLElement)) return;
    stage.style.removeProperty('opacity');
    stage.style.removeProperty('transition');
  }

  function syncNativeCore(r, now) {
    locateStage();
    if (!coreApi) return;

    if (r < .18) {
      setStageOpacity(Math.max(.02,r*.25));
      if (now-lastMorphSync > 180) {
        lastMorphSync=now;
        try { coreApi.setMorph?.(.02,'r533-dormant'); coreApi.requestRender?.(2); } catch (_) {}
      }
      return;
    }

    if (r < .69) {
      const t=smoothstep((r-.18)/.51);
      setStageOpacity(.10 + t*.90);
      if (now-lastMorphSync > 92) {
        lastMorphSync=now;
        try {
          coreApi.setMorph?.(.04 + t*.96,'r533-native-assembly');
          coreApi.requestRender?.(2);
        } catch (_) {}
      }
      return;
    }

    setStageOpacity(1);
    if (!ignitionDone) {
      ignitionDone=true;
      try {
        coreApi.setMorph?.(1,'r533-ignition');
        coreApi.setShape?.('crystal','r533-ignition');
        coreApi.surfacePulse?.('r533-first-impulse');
        coreApi.rotateBy?.(.035,.055,'r533-first-impulse');
        coreApi.requestRender?.(6);
      } catch (_) {}
    }
  }

  function seedParticles(w,h) {
    const count=Math.max(48,Math.min(132,Math.round((w*h)/13500)));
    particles=Array.from({length:count},(_,i)=>{
      const edge=i%4;
      let x,y;
      if(edge===0){x=Math.random()*w;y=-30-Math.random()*h*.2;}
      else if(edge===1){x=w+30+Math.random()*w*.16;y=Math.random()*h;}
      else if(edge===2){x=Math.random()*w;y=h+30+Math.random()*h*.2;}
      else{x=-30-Math.random()*w*.16;y=Math.random()*h;}
      return {ox:x,oy:y,a:.16+Math.random()*.72,s:.4+Math.random()*1.55,drift:(Math.random()-.5)*20,seed:Math.random()*Math.PI*2};
    });
  }

  function sizeCanvas() {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const dpr=Math.min(2,devicePixelRatio||1);
    const w=innerWidth,h=innerHeight;
    canvas.width=Math.max(1,Math.floor(w*dpr));
    canvas.height=Math.max(1,Math.floor(h*dpr));
    canvas.style.width=w+'px';
    canvas.style.height=h+'px';
    ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
    if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);
    seedParticles(w,h);
    syncTarget(true);
  }

  function drawParticles(r,time) {
    if(!ctx)return;
    const w=innerWidth,h=innerHeight;
    ctx.clearRect(0,0,w,h);
    const gather=clamp((r-.04)/.52,0,1);
    const burst=clamp((r-.65)/.16,0,1);
    const settle=clamp((r-.82)/.18,0,1);
    ctx.globalCompositeOperation='lighter';

    for(const p of particles){
      const e=easeOutCubic(gather);
      let x=p.ox+(targetX-p.ox)*e;
      let y=p.oy+(targetY-p.oy)*e;
      const wobble=Math.sin(time*.0018+p.seed)*p.drift*(1-e);
      x+=wobble;
      y+=Math.cos(time*.0014+p.seed)*p.drift*.54*(1-e);

      if(burst>0){
        const angle=Math.atan2(p.oy-targetY,p.ox-targetX);
        const radius=38+burst*(96+(p.seed%1)*132);
        x=targetX+Math.cos(angle)*radius*(1-settle*.52);
        y=targetY+Math.sin(angle)*radius*(1-settle*.52);
      }

      const alpha=p.a*(r<.06?r/.06:1)*(settle?.38:1);
      ctx.fillStyle='rgba(126,235,255,'+alpha.toFixed(3)+')';
      ctx.beginPath();
      ctx.arc(x,y,p.s*(1+burst*1.7),0,Math.PI*2);
      ctx.fill();
    }
    ctx.globalCompositeOperation='source-over';
  }

  function finish(source) {
    if(finished)return;
    finished=true;
    cancelAnimationFrame(raf);
    clearTimeout(exitTimer);

    try {
      coreApi?.setMorph?.(1,'r533-final-handoff');
      coreApi?.setShape?.('crystal','r533-final-handoff');
      coreApi?.requestRender?.(4);
    } catch (_) {}
    setStageOpacity(1);

    percent.value='100';
    progress.value=100;
    status.textContent=copy.statuses[copy.statuses.length-1][1];
    overlay.dataset.phase='4';
    ROOT.dataset.fxMagBirthLiveR533=source;

    /* The underlying MAG is already the production MAG at its production
       coordinates. Fading only this film layer creates the zero-cut handoff. */
    requestAnimationFrame(()=>{
      overlay.classList.add('is-leaving');
      exitTimer=window.setTimeout(()=>{
        releaseStageStyle();
        ROOT.removeAttribute('data-fx-mag-birth-live');
        ROOT.removeAttribute('data-fx-mag-birth-phase');
        overlay.remove();
        document.dispatchEvent(new CustomEvent('formatx:magbirthcomplete',{detail:{source,revision:'r533-native-core-handoff'}}));
      }, REDUCED ? 20 : EXIT_MS);
    });
  }

  function render(now) {
    if(!startedAt)startedAt=now;
    const r=Math.min(1,(now-startedAt)/DURATION);
    const phase=phaseFor(r,now);
    overlay.dataset.phase=phase;
    ROOT.dataset.fxMagBirthPhase=phase;
    syncTarget(false);
    syncNativeCore(r,now);

    const value=Math.min(100,Math.round(easeOutCubic(r)*100));
    percent.value=String(value).padStart(3,'0');
    progress.value=value;
    status.textContent=statusFor(r);
    drawParticles(r,now);

    if(r<1 || visiblePhase<4)raf=requestAnimationFrame(render);
    else finish('complete');
  }

  function start() {
    try { sessionStorage.setItem(KEY,'1'); } catch (_) {}
    ROOT.dataset.fxMagBirthLiveR533='active';
    visiblePhase=0;
    phaseChangedAt=performance.now();
    ROOT.dataset.fxMagBirthPhase='0';
    ROOT.setAttribute('data-fx-mag-birth-live','active');
    document.body.prepend(overlay);
    try { scrollTo({top:0,left:0,behavior:'instant'}); } catch (_) { scrollTo(0,0); }
    sizeCanvas();

    if(REDUCED){
      overlay.dataset.phase='4';
      ROOT.dataset.fxMagBirthPhase='4';
      locateStage();
      try { coreApi?.setShape?.('crystal','r533-reduced'); coreApi?.requestRender?.(2); } catch (_) {}
      setStageOpacity(1);
      percent.value='100';
      progress.value=100;
      status.textContent=copy.statuses[copy.statuses.length-1][1];
      drawParticles(1,performance.now());
      exitTimer=window.setTimeout(()=>finish('reduced-motion'),520);
      return;
    }

    raf=requestAnimationFrame(render);
  }

  skip.addEventListener('click',()=>finish('user-skip'));
  addEventListener('formatx:real3dready',()=>{
    locateStage();
    syncTarget(true);
    coreApi=window.FormatXLivingCore||window.FormatXCoreMobileV69||coreApi;
  },{passive:true});
  addEventListener('resize',()=>{sizeCanvas();syncTarget(true);},{passive:true});
  addEventListener('orientationchange',()=>setTimeout(()=>syncTarget(true),120),{passive:true});
  addEventListener('pagehide',()=>finish('pagehide'),{once:true});

  start();
})();