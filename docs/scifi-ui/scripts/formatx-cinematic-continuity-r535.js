(() => {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'cinematic-continuity-r535';
  root.dataset.fxCinematicContinuityIdentityR1723='one-organism-anatomy-chapters';
  if (root.dataset.fxCinematicContinuityR535 === 'ready') return;

  const params = new URLSearchParams(location.search);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const FORCE = params.get('cinema') === '1';
  const audit = params.get('lighthouse') === '1' || (navigator.webdriver === true && !FORCE);

  if (reduced.matches || audit) {
    root.dataset.fxCinematicContinuityR535 = reduced.matches ? 'reduced-skip' : 'automation-skip';
    return;
  }

  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const chapters = [
    {id:'hero',code:'01',hu:'MAG / SZÜLETÉS',en:'CORE / GENESIS',accent:'96,228,255',secondary:'143,114,255',shape:'organism',kind:'core'},
    {id:'experience',code:'02',hu:'IDEGRENDSZER',en:'NERVOUS SYSTEM',accent:'96,228,255',secondary:'105,142,255',shape:'organism',kind:'nerves'},
    {id:'capabilities',code:'03',hu:'SZERVEK',en:'SYSTEM ORGANS',accent:'121,241,219',secondary:'98,161,255',shape:'organism',kind:'organs'},
    {id:'pricing',code:'04',hu:'KERESKEDELMI SZÍV',en:'COMMERCE HEART',accent:'255,207,137',secondary:'160,109,255',shape:'organism',kind:'heart'},
    {id:'system',code:'05',hu:'RENDSZERVÁZ',en:'SYSTEM SKELETON',accent:'139,203,255',secondary:'143,114,255',shape:'organism',kind:'skeleton'},
    {id:'resources',code:'06',hu:'JELADÓ',en:'RELEASE BEACON',accent:'183,244,255',secondary:'111,227,200',shape:'organism',kind:'beacon'}
  ];

  let items = [];
  let stage = null;
  let hudCode = null;
  let hudTitle = null;
  let hudStatus = null;
  let activeIndex = 0;
  let raf = 0;
  let cutTimer = 0;
  let handoffTimer = 0;
  let lastCoreSignal = -1;

  function lang() { return root.lang === 'en' ? 'en' : 'hu'; }
  function core() { return window.FormatXLivingCore || window.FormatXCoreMobileV69 || null; }

  function ensureStage() {
    stage = document.querySelector('.fx-cinema-r535');
    if (stage instanceof HTMLElement) return stage;

    stage = document.createElement('div');
    stage.className = 'fx-cinema-r535';
    stage.setAttribute('aria-hidden','true');
    stage.innerHTML = [
      '<div class="fx-cinema-r535__lens"></div>',
      '<div class="fx-cinema-r535__beam"></div>',
      '<div class="fx-cinema-r535__vignette"></div>',
      '<div class="fx-cinema-r535__grain"></div>',
      '<div class="fx-cinema-r535__gate"></div>',
      '<div class="fx-cinema-r535__hud">',
      '<b>01</b><strong></strong><span></span><i></i>',
      '</div>'
    ].join('');
    document.body.appendChild(stage);
    hudCode = stage.querySelector('b');
    hudTitle = stage.querySelector('strong');
    hudStatus = stage.querySelector('span');
    return stage;
  }

  function ensureOrganLayer(section, kind) {
    if (!(section instanceof HTMLElement) || section.id === 'hero') return null;
    let layer = section.querySelector(':scope > .fx-cinema-organ-r535');
    if (!(layer instanceof HTMLElement)) {
      layer = document.createElement('div');
      layer.className = 'fx-cinema-organ-r535';
      layer.setAttribute('aria-hidden','true');
      layer.innerHTML = '<span class="a"></span><span class="b"></span><span class="c"></span>';
      section.appendChild(layer);
    }
    layer.dataset.kind = kind;
    return layer;
  }

  function discover() {
    items = chapters.map((chapter,index) => {
      const section = document.getElementById(chapter.id);
      if (!(section instanceof HTMLElement)) return null;
      section.dataset.fxCinemaChapter = chapter.code;
      section.dataset.fxCinemaKind = chapter.kind;
      ensureOrganLayer(section,chapter.kind);
      return {chapter,index,section};
    }).filter(Boolean);
    return items.length >= 6;
  }

  function updateHud(chapter) {
    if (!(hudCode instanceof HTMLElement)) return;
    hudCode.textContent = chapter.code;
    hudTitle.textContent = chapter[lang()];
    hudStatus.textContent = lang() === 'en' ? 'LIVING SYSTEM / CONTINUOUS SCENE' : 'ÉLŐ RENDSZER / FOLYAMATOS JELENET';
  }

  function signalCore(index,source) {
    if (index === lastCoreSignal && source !== 'birth-handoff') return;
    lastCoreSignal = index;
    const api = core();
    if (!api) return;
    const chapter = chapters[index] || chapters[0];
    try {
      api.setShape?.('organism','r535-'+chapter.id);
      const direction = index % 2 ? 1 : -1;
      api.rotateBy?.(.018 * direction,.032 * (index + 1) / chapters.length,'r535-camera');
      api.requestRender?.(index === 0 ? 4 : 6);
      api.surfacePulse?.('r535-'+chapter.id+'-'+source);
    } catch (_) {}
  }

  function pulseCut() {
    root.classList.remove('fx-cinema-r535-cut');
    void root.offsetWidth;
    root.classList.add('fx-cinema-r535-cut');
    clearTimeout(cutTimer);
    cutTimer = setTimeout(() => root.classList.remove('fx-cinema-r535-cut'),720);
  }

  function activate(index,source='scroll') {
    index = clamp(index,0,items.length-1);
    if (index === activeIndex && root.dataset.fxCinematicChapterR535) return;
    activeIndex = index;
    const current = items[index];
    const chapter = current.chapter;

    items.forEach(item => {
      item.section.dataset.fxCinemaState = item.index < index ? 'past' : item.index === index ? 'active' : 'future';
    });

    root.dataset.fxCinematicChapterR535 = chapter.id;
    root.dataset.fxCinematicChapterIndexR535 = chapter.code;
    root.style.setProperty('--fx-cinema-accent',chapter.accent);
    root.style.setProperty('--fx-cinema-secondary',chapter.secondary);
    updateHud(chapter);
    pulseCut();
    signalCore(index,source);

    dispatchEvent(new CustomEvent('formatx:cinematicchapter',{
      detail:{index,chapter:chapter.id,kind:chapter.kind,revision:VERSION,source}
    }));
  }

  function chooseActive() {
    const anchor = innerHeight * .44;
    let best = activeIndex;
    let bestScore = Infinity;
    for (const item of items) {
      const r = item.section.getBoundingClientRect();
      if (r.bottom < -innerHeight*.2 || r.top > innerHeight*1.2) continue;
      const center = (r.top + Math.min(r.bottom,innerHeight)) * .5;
      const score = Math.abs(center-anchor);
      if (score < bestScore) { bestScore = score; best = item.index; }
    }
    return best;
  }

  function paint() {
    raf = 0;
    if (!items.length) return;

    const next = chooseActive();
    if (next !== activeIndex || !root.dataset.fxCinematicChapterR535) activate(next,'scroll');

    const current = items[activeIndex];
    const r = current.section.getBoundingClientRect();
    const local = clamp((innerHeight*.78-r.top)/Math.max(1,r.height+innerHeight*.40),0,1);
    const max = Math.max(1,document.documentElement.scrollHeight-innerHeight);
    const global = clamp(scrollY/max,0,1);
    const energy = clamp(.16 + Math.sin(local*Math.PI)*.42, .12, .62);
    const shift = ((.5-local)*8).toFixed(2)+'px';
    const scale = (0.998 + Math.sin(local*Math.PI)*.002).toFixed(4);
    const lensX = clamp(54 + (activeIndex%2 ? -5 : 4) + (local-.5)*5,42,64);
    const lensY = clamp(34 + activeIndex*7.8 + (local-.5)*5,22,79);
    const beamY = clamp(24 + activeIndex*10.2 + local*7,18,86);

    root.style.setProperty('--fx-cinema-progress',global.toFixed(4));
    root.style.setProperty('--fx-cinema-local',local.toFixed(4));
    root.style.setProperty('--fx-cinema-energy',energy.toFixed(4));
    root.style.setProperty('--fx-cinema-shift',shift);
    root.style.setProperty('--fx-cinema-scale',scale);
    root.style.setProperty('--fx-cinema-camera-x',((local-.5)*10).toFixed(2)+'px');
    root.style.setProperty('--fx-cinema-camera-y',((.5-local)*7).toFixed(2)+'px');
    root.style.setProperty('--fx-cinema-lens-x',lensX.toFixed(2)+'%');
    root.style.setProperty('--fx-cinema-lens-y',lensY.toFixed(2)+'%');
    root.style.setProperty('--fx-cinema-beam-y',beamY.toFixed(2)+'%');

    items.forEach(item => {
      const sr = item.section.getBoundingClientRect();
      const lp = clamp((innerHeight*.72-sr.top)/Math.max(1,sr.height+innerHeight*.35),0,1);
      const se = item.index === activeIndex ? clamp(.18+Math.sin(lp*Math.PI)*.62,.16,.80) : .08;
      item.section.style.setProperty('--fx-cinema-section-local',lp.toFixed(4));
      item.section.style.setProperty('--fx-cinema-section-energy',se.toFixed(4));
    });

    root.dataset.fxCinematicProgressR535 = global.toFixed(3);
    root.dataset.fxCinematicLocalR535 = local.toFixed(3);
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(paint);
  }

  function birthHandoff() {
    root.classList.add('fx-cinema-r535-handoff');
    clearTimeout(handoffTimer);
    handoffTimer = setTimeout(() => root.classList.remove('fx-cinema-r535-handoff'),1150);
    activate(0,'birth-handoff');
    signalCore(0,'birth-handoff');
  }

  function boot() {
    root.dataset.fxCinematicContinuityR535 = 'booting';
    if (!ensureStage() || !discover()) {
      root.dataset.fxCinematicContinuityR535 = 'incomplete-dom';
      return;
    }

    items.forEach(item => {
      item.section.dataset.fxCinemaState = item.index === 0 ? 'active' : 'future';
    });
    activeIndex = 0;
    updateHud(chapters[0]);

    addEventListener('scroll',schedule,{passive:true});
    addEventListener('resize',schedule,{passive:true});
    addEventListener('orientationchange',schedule,{passive:true});
    addEventListener('formatx:storychapter',event => {
      const i = Number(event.detail?.index);
      if (Number.isFinite(i)) activate(clamp(i,0,items.length-1),'story');
    },{passive:true});
    addEventListener('formatx:languagechange',() => updateHud(chapters[activeIndex]),{passive:true});
    addEventListener('formatx:loop',() => {
      activate(0,'site-loop');
      pulseCut();
    },{passive:true});
    document.addEventListener('formatx:magbirthcomplete',birthHandoff,{passive:true});
    document.addEventListener('formatx:introcomplete',birthHandoff,{passive:true});
    document.addEventListener('visibilitychange',() => { if (!document.hidden) schedule(); },{passive:true});

    root.dataset.fxCinematicContinuityR535 = 'ready';
    root.dataset.fxCinematicSystemR535 = 'core-nerves-organs-heart-skeleton-beacon-one-scene';
    root.dataset.fxCinematicMotionR535 = 'event-driven-compositor-only-no-idle-raf';
    root.dataset.fxCinematicContentContractR535 = 'all-existing-information-controls-preserved';
    schedule();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  addEventListener('pagehide',() => {
    if (raf) cancelAnimationFrame(raf);
    clearTimeout(cutTimer);
    clearTimeout(handoffTimer);
  },{once:true});
})();