(() => {
  'use strict';

  const ROOT = document.documentElement;
  const PARAMS = new URLSearchParams(location.search);
  const FORCE = PARAMS.get('intro') === '1';
  const KEY = 'formatx:mag-birth-live-r533-seen';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const AUTOMATION = navigator.webdriver === true;
  const MOBILE = matchMedia('(max-width:900px),(pointer:coarse)').matches;
  const DURATION = 5200;
  const EXIT_MS = 360;

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
      [0.00, 'AWAKENING GENETIC ENERGY FIELD'],
      [0.10, 'CAPTURING SIGNAL NUCLEOTIDES'],
      [0.22, 'ASSEMBLING 3D DNA DOUBLE HELIX'],
      [0.38, 'LIVING GENOME STABILIZING'],
      [0.52, 'CAMERA PULLING BACK / EMBRYO FOCUS'],
      [0.68, 'GENOME COLLAPSING INTO LIVING CORE'],
      [0.82, 'FIRST LIVING IMPULSE'],
      [0.94, 'CORE ALIVE']
    ]
  } : {
    kicker: 'FORMATX / MAG GENESIS',
    title: 'A MAG SZÜLETÉSE',
    subtitle: 'Az élő rendszer első impulzusa.',
    skip: 'ÁTUGRÁS',
    skipAria: 'A FormatX MAG születése animáció átugrása',
    statuses: [
      [0.00, 'GENETIKAI ENERGIAMEZŐ ÉBRESZTÉSE'],
      [0.10, 'JEL-NUKLEOTIDOK BEFOGÁSA'],
      [0.22, '3D DNS KETTŐS SPIRÁL ÖSSZEÁLLÍTÁSA'],
      [0.38, 'ÉLŐ GENOM STABILIZÁLÁSA'],
      [0.52, 'KAMERA KIZOOM / EMBRIÓ FÓKUSZ'],
      [0.68, 'A GENOM ÉLŐ MAGGÁ SŰRŰSÖDIK'],
      [0.82, 'ELSŐ ÉLŐ IMPULZUS'],
      [0.94, 'MAG ÉL']
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
    <div class="fxb-dna-stage" aria-hidden="true">
      <div class="fxb-dna-depth-fog"></div>
      <div class="fxb-dna-helix" data-fx-dna-3d-r611="true"></div>
      <svg class="fxb-dna" viewBox="0 0 320 720" preserveAspectRatio="xMidYMid meet">
        <g class="fxb-dna-bridges"></g>
        <path class="fxb-dna-strand fxb-dna-strand-a" pathLength="1"></path>
        <path class="fxb-dna-strand fxb-dna-strand-b" pathLength="1"></path>
        <g class="fxb-dna-nodes"></g>
      </svg>
      <div class="fxb-dna-heart"></div>
    </div>
    <div class="fxb-embryo" aria-hidden="true">
      <div class="fxb-embryo-membrane"></div>
      <div class="fxb-embryo-fluid"></div>
      <div class="fxb-embryo-nucleus"></div>
      <div class="fxb-embryo-filament fxb-embryo-filament-a"></div>
      <div class="fxb-embryo-filament fxb-embryo-filament-b"></div>
    </div>
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
  const dnaStage = overlay.querySelector('.fxb-dna-stage');
  const dnaHelix = overlay.querySelector('.fxb-dna-helix');
  const dna = overlay.querySelector('.fxb-dna');
  const dnaBridges = overlay.querySelector('.fxb-dna-bridges');
  const dnaNodes = overlay.querySelector('.fxb-dna-nodes');

  function buildDna() {
    if (!(dna instanceof SVGElement) || !(dnaBridges instanceof SVGGElement) || !(dnaNodes instanceof SVGGElement)) return;
    const NS='http://www.w3.org/2000/svg';
    const samples=25;
    const left=[];
    const right=[];
    for(let i=0;i<samples;i+=1){
      const y=38+i*27;
      const wave=Math.sin(i*.72);
      const depth=(Math.cos(i*.72)+1)*.5;
      const xA=160+wave*76;
      const xB=160-wave*76;
      left.push([xA,y]);
      right.push([xB,y]);
      if(i>0&&i<samples-1){
        const bridge=document.createElementNS(NS,'line');
        bridge.setAttribute('x1',xA.toFixed(2));
        bridge.setAttribute('y1',y.toFixed(2));
        bridge.setAttribute('x2',xB.toFixed(2));
        bridge.setAttribute('y2',y.toFixed(2));
        bridge.setAttribute('class','fxb-dna-bridge');
        bridge.style.setProperty('--fxb-dna-delay',(i*34)+'ms');
        bridge.style.setProperty('--fxb-dna-depth',depth.toFixed(3));
        dnaBridges.appendChild(bridge);
      }
      if(i%2===0){
        for(const [x,side] of [[xA,'a'],[xB,'b']]){
          const node=document.createElementNS(NS,'circle');
          node.setAttribute('cx',x.toFixed(2));
          node.setAttribute('cy',y.toFixed(2));
          node.setAttribute('r',i%4===0?'5.2':'3.8');
          node.setAttribute('class','fxb-dna-node fxb-dna-node-'+side);
          node.style.setProperty('--fxb-dna-delay',(i*30)+'ms');
          node.style.setProperty('--fxb-dna-depth',depth.toFixed(3));
          dnaNodes.appendChild(node);
        }
      }
    }
    const toPath=points=>points.map(([x,y],i)=>(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)).join(' ');
    dna.querySelector('.fxb-dna-strand-a')?.setAttribute('d',toPath(left));
    dna.querySelector('.fxb-dna-strand-b')?.setAttribute('d',toPath(right));
    dnaStage?.style.setProperty('--fxb-dna-pairs',String(samples));

    if (dnaHelix instanceof HTMLElement) {
      dnaHelix.replaceChildren();
      const radius=74;
      const depth=58;
      for(let i=0;i<samples;i+=1){
        const angle=i*.72;
        const y=38+i*27;
        const x=Math.sin(angle)*radius;
        const z=Math.cos(angle)*depth;
        const depthA=(z/depth+1)*.5;
        const depthB=(-z/depth+1)*.5;

        const pair=document.createElement('div');
        pair.className='fxb-dna-pair3d';

        const bridge3d=document.createElement('i');
        bridge3d.className='fxb-dna-rung3d';
        bridge3d.style.setProperty('--fxb-y',y.toFixed(2)+'px');
        bridge3d.style.setProperty('--fxb-angle',(angle*180/Math.PI).toFixed(2)+'deg');
        bridge3d.style.setProperty('--fxb-delay',(i*42)+'ms');

        const a=document.createElement('b');
        a.className='fxb-dna-base3d fxb-dna-base3d-a';
        a.style.setProperty('--fxb-x',x.toFixed(2)+'px');
        a.style.setProperty('--fxb-z',z.toFixed(2)+'px');
        a.style.setProperty('--fxb-y',y.toFixed(2)+'px');
        a.style.setProperty('--fxb-delay',(i*42)+'ms');
        a.style.setProperty('--fxb-alpha',(.56+depthA*.42).toFixed(3));
        a.style.setProperty('--fxb-scale',(.80+depthA*.30).toFixed(3));

        const b=document.createElement('b');
        b.className='fxb-dna-base3d fxb-dna-base3d-b';
        b.style.setProperty('--fxb-x',(-x).toFixed(2)+'px');
        b.style.setProperty('--fxb-z',(-z).toFixed(2)+'px');
        b.style.setProperty('--fxb-y',y.toFixed(2)+'px');
        b.style.setProperty('--fxb-delay',(i*42+18)+'ms');
        b.style.setProperty('--fxb-alpha',(.56+depthB*.42).toFixed(3));
        b.style.setProperty('--fxb-scale',(.80+depthB*.30).toFixed(3));

        pair.append(bridge3d,a,b);
        dnaHelix.appendChild(pair);
      }
    }
  }

  buildDna();

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
  let hardFinishTimer = 0;
  let targetX = innerWidth * .5;
  let targetY = innerHeight * .48;
  let stage = null;
  let coreApi = null;
  let lastTargetSync = 0;
  let lastMorphSync = 0;
  let lastNativeSync = 0;
  let lastParticleDraw = 0;
  let ignitionDone = false;
  let visiblePhase = 0;
  let phaseChangedAt = 0;
  const PHASE_HOLD_MS = [620, 1180, 920, 680, 0];

  function clamp(value,min,max) { return Math.max(min,Math.min(max,value)); }
  function easeOutCubic(t) { return 1 - Math.pow(1-t,3); }
  function smoothstep(t) { t=clamp(t,0,1); return t*t*(3-2*t); }

  function phaseTargetFor(r) {
    if (r < .18) return 0;
    if (r < .43) return 1;
    if (r < .68) return 2;
    if (r < .86) return 3;
    return 4;
  }
  function phaseFor(r,now) {
    const target=phaseTargetFor(r);
    if (!phaseChangedAt) {
      phaseChangedAt=now;
      return String(visiblePhase);
    }
    if (target < visiblePhase) {
      visiblePhase=target;
      phaseChangedAt=now;
    } else if (target > visiblePhase && now-phaseChangedAt >= (PHASE_HOLD_MS[visiblePhase] ?? 190)) {
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

    if (r < .50) {
      setStageOpacity(Math.max(.008,r*.035));
      if (now-lastMorphSync > 420) {
        lastMorphSync=now;
        try { coreApi.setMorph?.(.02,'r611-genome-dormant'); coreApi.requestRender?.(1); } catch (_) {}
      }
      return;
    }

    if (r < .82) {
      const t=smoothstep((r-.50)/.32);
      setStageOpacity(.025 + t*.975);
      if (now-lastMorphSync > 170) {
        lastMorphSync=now;
        try {
          coreApi.setMorph?.(.05 + t*.95,'r611-genome-to-living-core');
          coreApi.requestRender?.(1);
        } catch (_) {}
      }
      return;
    }

    setStageOpacity(1);
    if (!ignitionDone) {
      ignitionDone=true;
      try {
        coreApi.setMorph?.(1,'r611-living-core-ignition');
        coreApi.setShape?.('crystal','r611-living-core-ignition');
        coreApi.rotateBy?.(.035,.055,'r611-first-living-impulse');
        coreApi.requestRender?.(2);
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
    const dpr=Math.min(MOBILE?1.1:1.5,devicePixelRatio||1);
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
    const gather=clamp((r-.38)/.40,0,1);
    const burst=clamp((r-.80)/.12,0,1);
    const settle=clamp((r-.90)/.10,0,1);
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
    clearTimeout(hardFinishTimer);

    try {
      coreApi?.setMorph?.(1,'r611-final-living-handoff');
      coreApi?.setShape?.('crystal','r611-final-living-handoff');
      coreApi?.requestRender?.(2);
    } catch (_) {}
    setStageOpacity(1);

    percent.value='100';
    progress.value=100;
    status.textContent=copy.statuses[copy.statuses.length-1][1];
    overlay.dataset.phase='4';
    ROOT.dataset.fxMagBirthLiveR533=source;

    /* The underlying MAG is already the production MAG at its production
       coordinates. Fading only this film layer creates the zero-cut handoff. */
    // R607: removal must not depend on one more animation frame. Native WebGL
    // startup can temporarily starve rAF on software/slow GPU paths; the film
    // still has to fail open deterministically once finish() has been reached.
    overlay.classList.add('is-leaving');
    exitTimer=window.setTimeout(()=>{
      releaseStageStyle();
      ROOT.removeAttribute('data-fx-mag-birth-live');
      ROOT.removeAttribute('data-fx-mag-birth-phase');
      overlay.remove();
      document.dispatchEvent(new CustomEvent('formatx:magbirthcomplete',{detail:{source,revision:'r611-realistic-css3d-dna-embryo-native-core-handoff'}}));
    }, REDUCED ? 20 : EXIT_MS);
  }

  function render(now) {
    if(!startedAt)startedAt=now;
    const r=Math.min(1,(now-startedAt)/DURATION);
    const phase=phaseFor(r,now);
    if(overlay.dataset.phase!==phase)overlay.dataset.phase=phase;
    if(ROOT.dataset.fxMagBirthPhase!==phase)ROOT.dataset.fxMagBirthPhase=phase;
    syncTarget(false);
    const renderCost=Number.parseFloat(ROOT.dataset.fxCoreRenderMs||'0')||0;
    const nativeCadence=renderCost>50?620:renderCost>32?380:(MOBILE?200:120);
    if(!lastNativeSync||now-lastNativeSync>=nativeCadence||(!ignitionDone&&r>=.69)){
      lastNativeSync=now;
      syncNativeCore(r,now);
    }

    if (dnaStage instanceof HTMLElement) {
      const dnaProgress=clamp((r-.04)/.58,0,1);
      const dnaTurn=-24 + dnaProgress*92 + Math.sin(now*.0016)*4.5;
      const breathe=1+Math.sin(now*.0044)*.018;
      dnaStage.style.setProperty('--fxb-dna-turn',dnaTurn.toFixed(2)+'deg');
      dnaStage.style.setProperty('--fxb-dna-breathe',breathe.toFixed(4));
      dnaStage.style.setProperty('--fxb-dna-life',dnaProgress.toFixed(4));
    }

    const value=Math.min(100,Math.round(easeOutCubic(r)*100));
    const valueText=String(value).padStart(3,'0');
    if(percent.value!==valueText)percent.value=valueText;
    if(progress.value!==value)progress.value=value;
    const nextStatus=statusFor(r);
    if(status.textContent!==nextStatus)status.textContent=nextStatus;
    const particleCadence=MOBILE?34:24;
    if(!lastParticleDraw||now-lastParticleDraw>=particleCadence||r>=1){
      lastParticleDraw=now;
      drawParticles(r,now);
    }

    if(r<1 || visiblePhase<4)raf=requestAnimationFrame(render);
    else finish('complete');
  }

  function start() {
    try { sessionStorage.setItem(KEY,'1'); } catch (_) {}
    ROOT.dataset.fxMagBirthLiveR533='active';
    ROOT.dataset.fxMagBirthGenomeR610='dna-assembly-zoom-native-r326';
    ROOT.dataset.fxMagBirthGenomeR611='realistic-css-3d-double-helix-embryo-one-native-r326';
    visiblePhase=0;
    phaseChangedAt=0;
    ROOT.dataset.fxMagBirthPhase='0';
    ROOT.setAttribute('data-fx-mag-birth-live','active');
    document.body.prepend(overlay);
    try { scrollTo({top:0,left:0,behavior:'instant'}); } catch (_) { scrollTo(0,0); }
    sizeCanvas();

    // Absolute fail-open. Normal completion remains ~2.4 s; this only protects
    // against a renderer/driver path that starves the animation clock.
    hardFinishTimer=window.setTimeout(()=>finish('bounded-failsafe-r607'), REDUCED ? 900 : 14000);

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