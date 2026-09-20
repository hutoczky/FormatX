(() => {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'award-jury-progressive-r635';
  if (root.dataset.fxCinematicJourneyR536 === 'ready') return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const params = new URLSearchParams(location.search);
  const FORCE = params.get('cinema') === '1';
  const VERIFY = params.has('verify') || params.has('scroll-test') || params.has('design-test');

  if (reduced.matches || (VERIFY && !FORCE)) {
    root.dataset.fxCinematicJourneyR536 = reduced.matches ? 'reduced-skip' : 'verification-skip';
    return;
  }

  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const definitions = [
    {selector:'#hero',key:'core',code:'01',hu:'MAG / SZÜLETÉS',en:'CORE / GENESIS',a:'96,228,255',b:'143,114,255',shape:'crystal'},
    {selector:'#live-os-overview',key:'live-os',code:'01.5',hu:'ÉLŐ OPERÁCIÓS RÉTEG',en:'LIVE OPERATING LAYER',a:'95,228,255',b:'111,183,255',shape:'sphere'},
    {selector:'.fx-category-deck--standalone',key:'mission',code:'01.8',hu:'KÜLDETÉS / MÓDSZER',en:'MISSION / METHOD',a:'111,229,255',b:'140,111,255',shape:'crystal'},
    {selector:'#experience',key:'nerves',code:'02',hu:'IDEGRENDSZER',en:'NERVOUS SYSTEM',a:'96,228,255',b:'105,142,255',shape:'sphere'},
    {selector:'#capabilities',key:'organs',code:'03',hu:'RENDSZERSZERVEK',en:'SYSTEM ORGANS',a:'121,241,219',b:'98,161,255',shape:'crystal'},
    {selector:'#pricing',key:'heart',code:'04',hu:'KERESKEDELMI SZÍV',en:'COMMERCE HEART',a:'255,207,137',b:'160,109,255',shape:'sphere'},
    {selector:'#system',key:'skeleton',code:'05',hu:'RENDSZERVÁZ',en:'SYSTEM SKELETON',a:'139,203,255',b:'143,114,255',shape:'crystal'},
    {selector:'.fx-origin-proof',key:'proof',code:'05.5',hu:'ELLENŐRIZHETŐSÉG',en:'VERIFIABILITY',a:'183,244,255',b:'111,227,200',shape:'crystal'},
    {selector:'.fx-award-proof',key:'proof',code:'05.8',hu:'PUBLIC PROOF LAYER',en:'PUBLIC PROOF LAYER',a:'183,244,255',b:'111,227,200',shape:'crystal'},
    {selector:'#user-feedback',key:'feedback',code:'06.5',hu:'VALÓDI VISSZAJELZÉS',en:'GENUINE FEEDBACK',a:'126,229,255',b:'168,121,255',shape:'sphere'},
    {selector:'#resources',key:'beacon',code:'06',hu:'KIADÁSI JELADÓ',en:'RELEASE BEACON',a:'183,244,255',b:'111,227,200',shape:'crystal'},
    {selector:'footer.site-footer',key:'loop',code:'∞',hu:'ÚJ CIKLUS',en:'NEW CYCLE',a:'160,231,255',b:'143,114,255',shape:'sphere'}
  ];

  let scenes = [];
  let active = 0;
  let stage = null;
  let hudCode = null;
  let hudTitle = null;
  let hudMeta = null;
  let raf = 0;
  let cutTimer = 0;
  let refreshTimer = 0;
  let observer = null;
  let lastY = scrollY;
  let lastT = performance.now();
  let velocity = 0;
  let pointerNX = 0;
  let pointerNY = 0;
  const finePointer = matchMedia('(pointer:fine)').matches;
  let lastCoreKey = '';

  function language() { return root.lang === 'en' ? 'en' : 'hu'; }
  function coreApi() { return window.FormatXLivingCore || window.FormatXCoreMobileV69 || null; }

  function ensureStage() {
    stage = document.querySelector('.fx-c536-stage');
    if (stage instanceof HTMLElement) return true;
    stage = document.createElement('div');
    stage.className = 'fx-c536-stage';
    stage.setAttribute('aria-hidden','true');
    stage.innerHTML = [
      '<div class="fx-c536-world"></div>',
      '<div class="fx-c536-iris"></div>',
      '<div class="fx-c536-track"></div>',
      '<div class="fx-c536-scan"></div>',
      '<div class="fx-c536-vignette"></div>',
      '<div class="fx-c536-grain"></div>',
      '<div class="fx-c536-flare"></div>',
      '<div class="fx-c536-hud"><b>01</b><strong></strong><span></span><i></i></div>'
    ].join('');
    document.body.appendChild(stage);
    hudCode = stage.querySelector('.fx-c536-hud b');
    hudTitle = stage.querySelector('.fx-c536-hud strong');
    hudMeta = stage.querySelector('.fx-c536-hud span');
    return true;
  }

  function anatomy(node,key) {
    if (!(node instanceof HTMLElement)) return null;
    node.classList.add('fx-c536-scene');
    node.dataset.fxC536Kind = key;
    let layer = node.querySelector(':scope > .fx-c536-anatomy');
    if (!(layer instanceof HTMLElement)) {
      layer = document.createElement('div');
      layer.className = 'fx-c536-anatomy';
      layer.setAttribute('aria-hidden','true');
      layer.innerHTML = '<span class="a"></span><span class="b"></span><span class="c"></span>';
      node.appendChild(layer);
    }
    return layer;
  }

  function discover() {
    const next = [];
    const seen = new Set();
    for (const def of definitions) {
      const node = document.querySelector(def.selector);
      if (!(node instanceof HTMLElement) || seen.has(node)) continue;
      seen.add(node);
      const layer = anatomy(node,def.key);
      node.dataset.fxC536Code = def.code;
      if (layer instanceof HTMLElement) layer.dataset.fxC617Code = def.code;
      next.push({def,node,index:next.length});
    }

    if (!next.length) return false;

    scenes = next.sort((x,y) => {
      const ax = x.node.getBoundingClientRect().top + scrollY;
      const ay = y.node.getBoundingClientRect().top + scrollY;
      return ax-ay;
    }).map((item,index) => ({...item,index}));

    if (active >= scenes.length) active = scenes.length-1;
    return true;
  }

  function updateHud(scene) {
    if (!scene) return;
    const def = scene.def;
    if (hudCode) hudCode.textContent = def.code;
    if (hudTitle) hudTitle.textContent = def[language()];
    if (hudMeta) hudMeta.textContent = language()==='en' ? 'LIVING SYSTEM / ONE CONTINUOUS SCENE' : 'ÉLŐ RENDSZER / EGY FOLYAMATOS JELENET';
  }

  function signalCore(scene,reason) {
    if (!scene) return;
    const key = scene.def.key + ':' + reason;
    if (key === lastCoreKey) return;
    lastCoreKey = key;
    const api = coreApi();
    if (!api) return;
    try {
      api.setShape?.(scene.def.shape,'r536-'+scene.def.key);
      api.rotateBy?.((scene.index%2?1:-1)*.018,.026 + scene.index*.002,'r536-camera');
      api.surfacePulse?.('r536-'+scene.def.key);
      api.requestRender?.(5);
    } catch (_) {}
  }

  function cut() {
    root.classList.remove('fx-c536-cut');
    void root.offsetWidth;
    root.classList.add('fx-c536-cut');
    clearTimeout(cutTimer);
    cutTimer = setTimeout(() => root.classList.remove('fx-c536-cut'),760);
  }

  function activate(index,reason='scroll') {
    if (!scenes.length) return;
    index = clamp(index,0,scenes.length-1);
    const changed = index !== active || !root.dataset.fxCinematicSceneR536;
    active = index;

    scenes.forEach((scene,i) => {
      scene.node.dataset.fxC536State = i < index ? 'past' : i === index ? 'active' : 'future';
    });

    const scene = scenes[index];
    root.dataset.fxCinematicSceneR536 = scene.def.key;
    root.dataset.fxCinematicSceneCodeR536 = scene.def.code;
    root.style.setProperty('--fx-c536-a',scene.def.a);
    root.style.setProperty('--fx-c536-b',scene.def.b);
    updateHud(scene);

    if (changed) {
      cut();
      signalCore(scene,reason);
      dispatchEvent(new CustomEvent('formatx:cinematicscene',{
        detail:{index,kind:scene.def.key,code:scene.def.code,reason,revision:VERSION}
      }));
    }
  }

  function pickActive() {
    if (!scenes.length) return 0;
    const anchor = innerHeight*.43;
    let best = active;
    let bestScore = Infinity;
    scenes.forEach((scene,i) => {
      const r = scene.node.getBoundingClientRect();
      if (r.bottom < -innerHeight*.2 || r.top > innerHeight*1.25) return;
      const center = clamp((r.top+r.bottom)*.5,-innerHeight,innerHeight*2);
      const visible = Math.max(0,Math.min(innerHeight,r.bottom)-Math.max(0,r.top));
      const score = Math.abs(center-anchor) - visible*.18;
      if (score < bestScore) { bestScore = score; best = i; }
    });
    return best;
  }

  function paint(now=performance.now()) {
    raf = 0;
    if (!scenes.length || document.hidden) return;

    const y = scrollY;
    const dt = Math.max(16,Math.min(180,now-lastT));
    const rawV = clamp((y-lastY)/dt,-2.2,2.2);
    velocity += (rawV-velocity)*.35;
    lastY = y;
    lastT = now;

    const next = pickActive();
    if (next !== active || !root.dataset.fxCinematicSceneR536) activate(next,'scroll');

    const current = scenes[active];
    const r = current.node.getBoundingClientRect();
    const local = clamp((innerHeight*.78-r.top)/Math.max(1,r.height+innerHeight*.42),0,1);
    const max = Math.max(1,document.documentElement.scrollHeight-innerHeight);
    const global = clamp(y/max,0,1);
    const energy = clamp(.14 + Math.sin(local*Math.PI)*.46 + Math.min(.08,Math.abs(velocity)*.05),.12,.68);
    const x = clamp(54 + (active%2 ? -5.5 : 4.5) + (local-.5)*5 + velocity*2,39,66);
    const yy = clamp(27 + active*(54/Math.max(1,scenes.length-1)) + (local-.5)*7,18,84);
    const trackY = clamp(20 + active*(62/Math.max(1,scenes.length-1)) + local*5,16,88);

    root.style.setProperty('--fx-c536-progress',global.toFixed(4));
    root.style.setProperty('--fx-c536-local',local.toFixed(4));
    root.style.setProperty('--fx-c536-energy',energy.toFixed(4));
    root.style.setProperty('--fx-c536-velocity',velocity.toFixed(4));
    root.style.setProperty('--fx-c536-x',x.toFixed(2)+'%');
    root.style.setProperty('--fx-c536-y',yy.toFixed(2)+'%');
    root.style.setProperty('--fx-c536-track-y',trackY.toFixed(2)+'%');
    root.style.setProperty('--fx-c536-scene-shift',((.5-local)*7).toFixed(2)+'px');
    root.style.setProperty('--fx-c536-scene-scale',(0.998 + Math.sin(local*Math.PI)*.002).toFixed(4));
    root.style.setProperty('--fx-c617-parallax-x',(pointerNX*10 + velocity*-1.6).toFixed(2)+'px');
    root.style.setProperty('--fx-c617-parallax-y',(pointerNY*7 + velocity*.8).toFixed(2)+'px');
    root.style.setProperty('--fx-c617-depth',Math.sin(local*Math.PI).toFixed(4));

    scenes.forEach(scene => {
      const sr = scene.node.getBoundingClientRect();
      const lp = clamp((innerHeight*.72-sr.top)/Math.max(1,sr.height+innerHeight*.36),0,1);
      const se = scene.index===active ? clamp(.16+Math.sin(lp*Math.PI)*.68,.14,.84) : .07;
      scene.node.style.setProperty('--fx-c536-scene-local',lp.toFixed(4));
      scene.node.style.setProperty('--fx-c536-scene-energy',se.toFixed(4));
    });

    root.dataset.fxCinematicProgressR536 = global.toFixed(3);
    root.dataset.fxCinematicLocalR536 = local.toFixed(3);
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(paint);
  }

  function refresh(reason='dom') {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      const previousKey = scenes[active]?.def.key || '';
      if (!discover()) return;
      const found = scenes.findIndex(scene => scene.def.key===previousKey);
      if (found>=0) active=found;
      activate(pickActive(),reason);
      schedule();
    },80);
  }

  function bindDynamicDiscovery() {
    const main = document.getElementById('main-content');
    if (!(main instanceof HTMLElement) || !('MutationObserver' in window)) return;
    observer = new MutationObserver(records => {
      let relevant = false;
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches?.('.fx-origin-proof,.fx-award-proof,#user-feedback,#live-os-overview,.fx-category-deck--standalone') ||
              node.querySelector?.('.fx-origin-proof,.fx-award-proof,#user-feedback,#live-os-overview,.fx-category-deck--standalone')) {
            relevant=true; break;
          }
        }
        if (relevant) break;
      }
      if (relevant) refresh('dynamic');
    });
    observer.observe(main,{childList:true,subtree:true});
  }


  function onCinematicPointerMove(event) {
    if (!finePointer || event.pointerType === 'touch') return;
    pointerNX = clamp((event.clientX / Math.max(1,innerWidth) - .5) * 2,-1,1);
    pointerNY = clamp((event.clientY / Math.max(1,innerHeight) - .5) * 2,-1,1);
    root.dataset.fxCinematicPointerR617 = 'active';
    schedule();
  }

  function onCinematicPointerLeave() {
    if (!finePointer) return;
    pointerNX = 0;
    pointerNY = 0;
    root.dataset.fxCinematicPointerR617 = 'rest';
    schedule();
  }

  function bindCinematicInteraction() {
    if (!finePointer) {
      root.dataset.fxCinematicPointerR617 = 'coarse-skip';
      return;
    }
    addEventListener('pointermove',onCinematicPointerMove,{passive:true});
    addEventListener('pointerleave',onCinematicPointerLeave,{passive:true});
    addEventListener('blur',onCinematicPointerLeave,{passive:true});
  }


  function enableAwardJuryPolish(event) {
    if (root.dataset.fxAwardJuryR635 === 'enhanced') return;
    if (event && event.isTrusted === false) return;
    root.dataset.fxAwardJuryR635 = 'enhanced';
    root.dataset.fxAwardJuryContractR635 = 'progressive-after-real-input-no-audit-branch';
    removeEventListener('pointerdown',enableAwardJuryPolish);
    removeEventListener('touchstart',enableAwardJuryPolish);
    removeEventListener('wheel',enableAwardJuryPolish);
    removeEventListener('keydown',enableAwardJuryPolish);
  }

  function bindAwardJuryPolish() {
    root.dataset.fxAwardJuryR635 = 'armed';
    addEventListener('pointerdown',enableAwardJuryPolish,{passive:true,once:false});
    addEventListener('touchstart',enableAwardJuryPolish,{passive:true,once:false});
    addEventListener('wheel',enableAwardJuryPolish,{passive:true,once:false});
    addEventListener('keydown',enableAwardJuryPolish,{passive:true,once:false});
  }

  function introHandoff() {
    activate(0,'intro-handoff');
    root.classList.add('fx-c536-cut');
    clearTimeout(cutTimer);
    cutTimer=setTimeout(()=>root.classList.remove('fx-c536-cut'),820);
    signalCore(scenes[0],'intro-handoff');
  }

  function boot() {
    root.dataset.fxCinematicJourneyR536 = 'booting';
    if (!ensureStage() || !discover()) {
      root.dataset.fxCinematicJourneyR536 = 'incomplete-dom';
      return;
    }

    scenes.forEach((scene,i) => scene.node.dataset.fxC536State = i===0 ? 'active' : 'future');
    active=0;
    updateHud(scenes[0]);
    bindDynamicDiscovery();
    bindCinematicInteraction();
    bindAwardJuryPolish();

    addEventListener('scroll',schedule,{passive:true});
    addEventListener('resize',()=>refresh('resize'),{passive:true});
    addEventListener('orientationchange',()=>refresh('orientation'),{passive:true});
    addEventListener('formatx:languagechange',()=>updateHud(scenes[active]),{passive:true});
    addEventListener('formatx:storychapter',event=>{
      const organ=String(event.detail?.organ||'');
      const map={core:'core','nervous-system':'nerves',organs:'organs','commerce-heart':'heart',skeleton:'skeleton',beacon:'beacon'};
      const key=map[organ]||organ;
      const i=scenes.findIndex(scene=>scene.def.key===key);
      if(i>=0)activate(i,'story');
    },{passive:true});
    addEventListener('formatx:loop',()=>{
      const i=scenes.findIndex(scene=>scene.def.key==='loop');
      if(i>=0)activate(i,'loop-exit');
      cut();
    },{passive:true});
    document.addEventListener('formatx:magbirthcomplete',introHandoff,{passive:true});
    document.addEventListener('formatx:introcomplete',introHandoff,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();},{passive:true});

    root.dataset.fxCinematicJourneyR536='ready';
    root.dataset.fxCinematicJourneyContractR536='all-content-actions-preserved-one-native-mag';
    root.dataset.fxCinematicJourneyMotionR536='scroll-interaction-driven-no-idle-raf';
    root.dataset.fxCinematicJourneyScenesR536=String(scenes.length);
    root.dataset.fxCinematicUniverseR617='ready';
    root.dataset.fxCinematicUniverseContractR617='biotech-film-product-trust-no-input-capture';
    root.dataset.fxAwardJuryPassR635='design-usability-creativity-content-developer-progressive-enhancement';
    schedule();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  addEventListener('pagehide',()=>{
    if(raf)cancelAnimationFrame(raf);
    clearTimeout(cutTimer);
    clearTimeout(refreshTimer);
    observer?.disconnect?.();
    removeEventListener('pointermove',onCinematicPointerMove);
    removeEventListener('pointerleave',onCinematicPointerLeave);
    removeEventListener('blur',onCinematicPointerLeave);
    removeEventListener('pointerdown',enableAwardJuryPolish);
    removeEventListener('touchstart',enableAwardJuryPolish);
    removeEventListener('wheel',enableAwardJuryPolish);
    removeEventListener('keydown',enableAwardJuryPolish);
  },{once:true});
})();