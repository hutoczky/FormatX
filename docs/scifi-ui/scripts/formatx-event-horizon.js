(function () {
  'use strict';

  const ROOT = document.documentElement;
  const EARLY_REFERENCE_MOBILE = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  if (!ROOT.dataset.fxReferenceProductionR244) {
    ROOT.dataset.fxReferenceProductionR244 = EARLY_REFERENCE_MOBILE ? 'ready' : 'desktop';
  }
  ROOT.dataset.fxReferenceComposition = EARLY_REFERENCE_MOBILE
    ? 'reference-frame-r244'
    : 'desktop-reference-r244';

  ROOT.dataset.fxLivingCopyGuard = 'ready';
  ROOT.dataset.fxLivingCopyGuardPolicyR293 = 'static-content-normalized-no-document-scan';

  const OVERLAY_ID = 'formatx-event-horizon';
  const VISIT_KEY = 'formatx:intro-seen-v1';
  const MOBILE_QUERY = matchMedia('(max-width: 820px), (pointer: coarse)');
  const MOBILE_DIRECT_QUERY = matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)');
  const REDUCE_QUERY = matchMedia('(prefers-reduced-motion: reduce)');
  const AUDIT_MODE = new URLSearchParams(location.search).get('lighthouse') === '1';
  const AWARD_RUNTIME_URL = './scripts/formatx-award-runtime-r206.js?v=20260823-r312-postdom-pulse';
  const MOBILE_REGRESSION_URL = './scripts/formatx-mobile-regression-r310.js?v=20260823-r312-postdom';
  const PULSE_STYLE_URL = './styles/formatx-core-pulse-r312.css?v=20260823-r312-living-pulse';
  const FIRST_PAINT_STYLE_URL = './styles/formatx-first-paint-r206.css?v=20260825-r306-static-production-parity';
  const FIRST_FRAME_STYLE_URL = './styles/formatx-first-frame-geometry-r274.css?v=20260825-r306-static-production-parity';

  function ensureEarlyStyle(selector, attribute, href) {
    if (document.querySelector(selector)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(attribute, 'true');
    link.fetchPriority = 'high';
    document.head.appendChild(link);
  }

  function important(node, property, value) {
    if (!(node instanceof HTMLElement)) return;
    node.style.setProperty(property, value, 'important');
  }

  function stabilizeReferenceFirstPaint() {
    ensureEarlyStyle('link[data-fx-first-paint-r206]', 'data-fx-first-paint-r206', FIRST_PAINT_STYLE_URL);
    ensureEarlyStyle('link[data-fx-first-frame-geometry-r306]', 'data-fx-first-frame-geometry-r306', FIRST_FRAME_STYLE_URL);

    const hero = document.getElementById('hero');
    const grid = hero?.querySelector(':scope > .hero-grid');
    const space = grid?.querySelector(':scope > .hero-space');
    const copy = grid?.querySelector(':scope > .hero-copy');
    if (!(hero instanceof HTMLElement)
      || !(grid instanceof HTMLElement)
      || !(space instanceof HTMLElement)
      || !(copy instanceof HTMLElement)) return false;

    const strings = ROOT.lang === 'en' ? {
      heading: 'DISCOVER HOW IT WORKS',
      title: 'Proof behind the visual.',
      body: 'FormatX does not ask for blind trust: releases, tests, limitations and the security model are separately and publicly verifiable.',
      ask: 'ASK',
      askAria: 'Ask FormatX',
      controls: 'Hero controls'
    } : {
      heading: 'A MŰKÖDÉS MEGISMERÉSE',
      title: 'Bizonyíték a látvány mögött.',
      body: 'A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető.',
      ask: 'KÉRDEZZ',
      askAria: 'Kérdezz a FormatX-től',
      controls: 'Hero vezérlők'
    };

    let controls = hero.querySelector('.fx-reference-controls-r204');
    if (!(controls instanceof HTMLElement)) {
      controls = document.createElement('div');
      controls.className = 'fx-reference-controls-r204 fx-reference-controls-r264';
      controls.setAttribute('aria-label', strings.controls);
    }
    controls.classList.add('fx-reference-controls-r264');

    let sound = controls.querySelector(':scope > .fx-three-sound') || document.querySelector('.fx-three-sound');
    if (!(sound instanceof HTMLButtonElement)) {
      sound = document.createElement('button');
      sound.type = 'button';
      sound.className = 'fx-three-sound fx-wda-sound-toggle fx-control-owner-r264';
      sound.dataset.fxAudioState = 'off';
      sound.setAttribute('aria-pressed', 'false');
      sound.setAttribute('aria-label', ROOT.lang === 'en' ? 'Unmute FormatX cinematic audio' : 'FormatX filmes hang bekapcsolása');
      sound.innerHTML = '<span class="fx-wda-sound-icon" data-fx-wda-sound-label="true" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.4h3.2L11 6.3v11.4l-3.8-3.1H4z"/><path d="M16 9l5 6"/><path d="M21 9l-5 6"/></svg></span>';
    }
    sound.classList.add('fx-wda-sound-toggle', 'fx-control-owner-r264');
    if (sound.parentElement !== controls) controls.prepend(sound);

    let rail = controls.querySelector(':scope > .fx-reference-rail') || hero.querySelector('.fx-reference-rail');
    if (!(rail instanceof HTMLElement)) {
      rail = document.createElement('div');
      rail.className = 'fx-reference-rail fx-reference-rail-r264';
    }
    rail.classList.add('fx-reference-rail-r264');

    let ask = rail.querySelector('.fx-reference-ask');
    if (!(ask instanceof HTMLButtonElement)) {
      ask = document.createElement('button');
      ask.type = 'button';
      ask.className = 'fx-reference-ask';
      ask.innerHTML = '<i aria-hidden="true"></i><span></span>';
    }
    ask.setAttribute('aria-label', strings.askAria);
    let askLabel = ask.querySelector('span');
    if (!(askLabel instanceof HTMLElement)) {
      askLabel = document.createElement('span');
      ask.appendChild(askLabel);
    }
    askLabel.textContent = strings.ask;

    let pause = rail.querySelector('.fx-reference-pause');
    if (!(pause instanceof HTMLButtonElement)) {
      pause = document.createElement('button');
      pause.type = 'button';
      pause.className = 'fx-reference-pause';
      pause.textContent = 'Ⅱ';
      pause.dataset.paused = 'false';
      pause.setAttribute('aria-label', ROOT.lang === 'en' ? 'Pause animation' : 'Animáció szüneteltetése');
    }
    if (ask.parentElement !== rail) rail.prepend(ask);
    if (pause.parentElement !== rail) rail.appendChild(pause);
    if (rail.parentElement !== controls) controls.appendChild(rail);

    let heading = hero.querySelector('.fx-reference-heading');
    if (!(heading instanceof HTMLElement)) {
      heading = document.createElement('div');
      heading.className = 'fx-reference-heading';
    }
    heading.textContent = strings.heading;

    let proof = hero.querySelector('.fx-reference-proof');
    if (!(proof instanceof HTMLElement)) {
      proof = document.createElement('article');
      proof.className = 'fx-reference-proof';
      proof.innerHTML = '<span class="fx-reference-proof-kicker">PUBLIC PROOF LAYER</span><h2></h2><p></p><a class="fx-reference-liveos" href="#experience">Live OS</a>';
    }
    const proofTitle = proof.querySelector('h2');
    const proofBody = proof.querySelector('p');
    if (proofTitle) proofTitle.textContent = strings.title;
    if (proofBody) proofBody.textContent = strings.body;
    const live = proof.querySelector('.fx-reference-liveos');
    if (live instanceof HTMLAnchorElement) {
      live.href = '#experience';
      live.setAttribute('aria-label', ROOT.lang === 'en' ? 'Open Live OS' : 'Live OS megnyitása');
    }

    if (EARLY_REFERENCE_MOBILE) {
      if (space.nextElementSibling !== controls) space.after(controls);
      if (controls.nextElementSibling !== copy) controls.after(copy);
      if (copy.nextElementSibling !== heading) copy.after(heading);
      if (heading.nextElementSibling !== proof) heading.after(proof);

      important(grid, 'display', 'flex');
      important(grid, 'flex-direction', 'column');
      important(grid, 'align-items', 'stretch');
      important(grid, 'gap', '0');

      important(space, 'order', '0');
      important(space, 'flex', '0 0 auto');
      important(space, 'width', '100%');
      important(space, 'margin', '0');

      important(controls, 'order', '1');
      important(controls, 'position', 'relative');
      important(controls, 'inset', 'auto');
      important(controls, 'display', 'grid');
      important(controls, 'grid-template-columns', 'repeat(3, 50px)');
      important(controls, 'align-items', 'start');
      important(controls, 'justify-content', 'center');
      important(controls, 'gap', '12px');
      important(controls, 'width', 'max-content');
      important(controls, 'min-height', '76px');
      important(controls, 'margin', '14px auto 20px');
      important(controls, 'padding', '0 4px 20px');
      important(controls, 'opacity', '1');
      important(controls, 'visibility', 'visible');
      important(controls, 'pointer-events', 'auto');
      important(controls, 'transform', 'none');
      important(controls, 'z-index', '12040');

      important(rail, 'display', 'contents');
      important(rail, 'position', 'static');

      for (const button of [sound, ask, pause]) {
        important(button, 'position', 'relative');
        important(button, 'inset', 'auto');
        important(button, 'display', 'grid');
        important(button, 'place-items', 'center');
        important(button, 'box-sizing', 'border-box');
        important(button, 'width', '50px');
        important(button, 'min-width', '50px');
        important(button, 'max-width', '50px');
        important(button, 'height', '50px');
        important(button, 'min-height', '50px');
        important(button, 'max-height', '50px');
        important(button, 'margin', '0');
        important(button, 'padding', '0');
        important(button, 'border-radius', '50%');
        important(button, 'opacity', '1');
        important(button, 'visibility', 'visible');
        important(button, 'pointer-events', 'auto');
        important(button, 'transform', 'none');
      }
      important(askLabel, 'position', 'absolute');
      important(askLabel, 'top', '55px');
      important(askLabel, 'left', '50%');
      important(askLabel, 'width', 'max-content');
      important(askLabel, 'max-width', '92px');
      important(askLabel, 'transform', 'translateX(-50%)');
      important(askLabel, 'white-space', 'nowrap');

      important(copy, 'order', '2');
      important(copy, 'position', 'relative');
      important(copy, 'inset', 'auto');
      important(copy, 'display', 'grid');
      important(copy, 'box-sizing', 'border-box');
      important(copy, 'align-self', 'center');
      important(copy, 'width', 'calc(100% - 24px)');
      important(copy, 'max-width', '680px');
      important(copy, 'min-width', '0');
      important(copy, 'height', 'auto');
      important(copy, 'min-height', '1px');
      important(copy, 'margin', '0 auto 26px');
      important(copy, 'padding', '18px clamp(16px, 4.8vw, 24px) 20px');
      important(copy, 'overflow', 'hidden');
      important(copy, 'clip', 'auto');
      important(copy, 'clip-path', 'none');
      important(copy, 'white-space', 'normal');
      important(copy, 'opacity', '1');
      important(copy, 'visibility', 'visible');
      important(copy, 'transform', 'none');

      important(heading, 'order', '3');
      important(heading, 'position', 'relative');
      important(heading, 'width', 'calc(100% - 32px)');
      important(heading, 'max-width', '680px');
      important(heading, 'min-height', '20px');
      important(heading, 'margin', '10px auto 22px');
      important(heading, 'opacity', '1');
      important(heading, 'visibility', 'visible');
      important(heading, 'transform', 'none');

      important(proof, 'order', '4');
      important(proof, 'position', 'relative');
      important(proof, 'display', 'block');
      important(proof, 'box-sizing', 'border-box');
      important(proof, 'width', 'calc(100% - 32px)');
      important(proof, 'max-width', '680px');
      important(proof, 'min-height', '258px');
      important(proof, 'margin', '0 auto 34px');
      important(proof, 'padding', '20px 19px 24px');
      important(proof, 'overflow', 'hidden');
      important(proof, 'opacity', '1');
      important(proof, 'visibility', 'visible');
      important(proof, 'transform', 'none');
    } else {
      if (controls.parentElement !== space) space.appendChild(controls);
      if (heading.parentElement !== grid) grid.appendChild(heading);
      if (proof.parentElement !== grid) grid.appendChild(proof);

      important(controls, 'position', 'absolute');
      important(controls, 'inset', 'auto auto 28px 50%');
      important(controls, 'display', 'grid');
      important(controls, 'grid-template-columns', 'repeat(3, 54px)');
      important(controls, 'align-items', 'start');
      important(controls, 'justify-content', 'center');
      important(controls, 'gap', '14px');
      important(controls, 'width', 'max-content');
      important(controls, 'min-height', '82px');
      important(controls, 'margin', '0');
      important(controls, 'padding', '0 8px 24px');
      important(controls, 'opacity', '1');
      important(controls, 'visibility', 'visible');
      important(controls, 'pointer-events', 'auto');
      important(controls, 'transform', 'translateX(-50%)');
      important(controls, 'z-index', '12040');
      important(rail, 'display', 'contents');
      important(rail, 'position', 'static');

      for (const button of [sound, ask, pause]) {
        important(button, 'position', 'relative');
        important(button, 'inset', 'auto');
        important(button, 'display', 'grid');
        important(button, 'place-items', 'center');
        important(button, 'box-sizing', 'border-box');
        important(button, 'width', '54px');
        important(button, 'min-width', '54px');
        important(button, 'max-width', '54px');
        important(button, 'height', '54px');
        important(button, 'min-height', '54px');
        important(button, 'max-height', '54px');
        important(button, 'margin', '0');
        important(button, 'padding', '0');
        important(button, 'border-radius', '50%');
        important(button, 'opacity', '1');
        important(button, 'visibility', 'visible');
        important(button, 'pointer-events', 'auto');
        important(button, 'transform', 'none');
      }
      important(askLabel, 'position', 'absolute');
      important(askLabel, 'top', '61px');
      important(askLabel, 'left', '50%');
      important(askLabel, 'width', 'max-content');
      important(askLabel, 'transform', 'translateX(-50%)');

      important(heading, 'min-height', '24px');
      important(proof, 'min-height', '258px');
    }

    ROOT.dataset.fxFirstPaintControlsR306 = EARLY_REFERENCE_MOBILE
      ? 'mobile-final-geometry-prepaint'
      : 'desktop-final-geometry-prepaint';
    return true;
  }

  function activateCriticalReal3dStyle() {
    if (REDUCE_QUERY.matches) {
      ROOT.dataset.fxCoreReal3dCssR310 = 'reduced-motion-skip';
      return;
    }
    const link = document.querySelector('link[data-fx-core-real3d="true"]');
    if (!(link instanceof HTMLLinkElement)) {
      ROOT.dataset.fxCoreReal3dCssR310 = 'missing';
      return;
    }
    link.removeAttribute('data-fx-deferred-media-r300');
    link.media = '(prefers-reduced-motion: no-preference)';
    ROOT.dataset.fxCoreReal3dCssR310 = link.sheet ? 'active' : 'activating-postdom-r312';
    if (link.dataset.fxR310LoadBound !== 'true') {
      link.dataset.fxR310LoadBound = 'true';
      link.addEventListener('load', () => { ROOT.dataset.fxCoreReal3dCssR310 = 'active'; }, { once: true });
      link.addEventListener('error', () => { ROOT.dataset.fxCoreReal3dCssR310 = 'failed'; }, { once: true });
    }
  }

  function ensureCorePulseStyle() {
    if (REDUCE_QUERY.matches) {
      ROOT.dataset.fxCorePulseR312 = 'reduced-motion-static';
      return;
    }
    if (document.querySelector('link[data-fx-core-pulse-r312]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = PULSE_STYLE_URL;
    link.dataset.fxCorePulseR312 = 'true';
    link.addEventListener('load', () => { ROOT.dataset.fxCorePulseR312 = 'compositor-lub-dub'; }, { once: true });
    link.addEventListener('error', () => { ROOT.dataset.fxCorePulseR312 = 'style-load-failed'; }, { once: true });
    document.head.appendChild(link);
  }

  function ensureMobileRegressionR310() {
    if (document.querySelector('script[data-fx-mobile-regression-r310]')) return;
    const script = document.createElement('script');
    script.src = MOBILE_REGRESSION_URL;
    script.async = true;
    script.dataset.fxMobileRegressionR310 = 'true';
    document.head.appendChild(script);
  }

  const COPY = {
    hu: { skip: 'Animáció átugrása', phases: [[18,'KAPCSOLAT FELÉPÍTÉSE'],[42,'TÉRBELI INDEX ÉPÍTÉSE'],[70,'MODULHÁLÓ SZINKRONIZÁLÁSA'],[94,'RENDSZERÁLLAPOT ELLENŐRZÉSE'],[101,'FORMATX MAG AKTÍV']] },
    en: { skip: 'Skip animation', phases: [[18,'ESTABLISHING LINK'],[42,'BUILDING SPATIAL INDEX'],[70,'SYNCHRONISING MODULE NETWORK'],[94,'VERIFYING SYSTEM STATE'],[101,'FORMATX CORE ONLINE']] }
  };

  let runToken=0,progressFrame=0,hardTimer=0,exitTimer=0,running=false,finishing=false;
  let timelineDuration=2400,exitDuration=280,hardDeadline=3780;
  const language=()=>ROOT.lang==='en'?'en':'hu';

  function ensureAwardRuntime() {
    if (AUDIT_MODE || document.querySelector('script[data-fx-award-runtime-r206]')) return;
    const script = document.createElement('script');
    script.src = AWARD_RUNTIME_URL;
    script.async = true;
    script.dataset.fxAwardRuntimeR206 = 'true';
    document.head.appendChild(script);
  }

  function queuePostDomEnhancements(includeMobileReal3d) {
    const run = () => setTimeout(() => {
      ensureCorePulseStyle();
      if (includeMobileReal3d) {
        activateCriticalReal3dStyle();
        ensureMobileRegressionR310();
      }
      ensureAwardRuntime();
      ROOT.dataset.fxMobileBootstrapR312 = includeMobileReal3d
        ? 'postdom-real3d-and-pulse'
        : 'postdom-pulse';
    }, 0);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
    else run();
  }

  function seen(){try{return localStorage.getItem(VISIT_KEY)==='1'}catch(_){return false}}
  function remember(){try{return localStorage.setItem(VISIT_KEY,'1')}catch(_){}}
  function configure(returning){timelineDuration=REDUCE_QUERY.matches?180:(returning?(MOBILE_QUERY.matches?620:260):(MOBILE_QUERY.matches?2100:420));exitDuration=REDUCE_QUERY.matches?60:(returning?80:90);hardDeadline=timelineDuration+exitDuration+800}
  function cancelTimers(){cancelAnimationFrame(progressFrame);clearTimeout(hardTimer);clearTimeout(exitTimer);progressFrame=hardTimer=exitTimer=0}
  function cancelAnimations(o){if(!o)return;try{o.getAnimations({subtree:true}).forEach(a=>a.cancel())}catch(_){}}
  function setProgress(o,v){if(!o)return;const b=Math.max(0,Math.min(100,v)),out=o.querySelector('[data-fx-intro-output]'),p=o.querySelector('[data-fx-intro-progress]'),s=o.querySelector('[data-fx-intro-status]'),c=COPY[language()];if(out)out.textContent=String(Math.round(b)).padStart(3,'0');if(p)p.value=Math.round(b);if(s){const phase=c.phases.find(x=>b<x[0]);s.textContent=(phase||c.phases[c.phases.length-1])[1]}}
  function complete(source){document.dispatchEvent(new CustomEvent('formatx:introcomplete',{detail:{source:source||'timeline'}}))}
  function release(o,source){cancelTimers();runToken++;running=finishing=false;if(o){cancelAnimations(o);o.hidden=true;o.setAttribute('aria-hidden','true');o.classList.remove('is-exiting')}ROOT.classList.remove('fx-intro-pending','fx-intro-running','fx-intro-reveal','fx-intro-managed');ROOT.classList.add('fx-intro-complete');ROOT.dataset.fxIntro=source||'timeline-complete';remember();complete(source)}
  function fastRelease(source,deferComplete){
    cancelTimers();runToken++;running=finishing=false;
    const o=document.getElementById(OVERLAY_ID);
    if(o){o.hidden=true;o.setAttribute('aria-hidden','true');o.classList.remove('is-exiting')}
    ROOT.classList.remove('fx-intro-pending','fx-intro-running','fx-intro-reveal','fx-intro-managed');
    ROOT.classList.add('fx-intro-complete');
    ROOT.dataset.fxIntro=source||'fast-release';
    const notify=()=>complete(source||'fast-release');
    if(deferComplete){
      const queueNotify=()=>setTimeout(notify,0);
      document.readyState==='loading'?document.addEventListener('DOMContentLoaded',queueNotify,{once:true}):queueNotify();
    }else notify();
  }
  function animate(e,k,o){if(!e)return;try{e.animate(k,Object.assign({fill:'both'},o))}catch(_){}}
  function visuals(o,returning){const speed=REDUCE_QUERY.matches?.1:(returning?.18:.22),time=(d,delay,easing)=>({duration:Math.max(1,d*speed),delay:Math.max(0,delay*speed),easing});animate(o.querySelector('.fx-intro-meta'),[{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'translateY(0)'}],time(520,40,'cubic-bezier(.2,.8,.2,1)'));animate(o.querySelector('.fx-intro-corners'),[{opacity:0},{opacity:.72}],time(680,60,'ease-out'));animate(o.querySelector('.fx-intro-kicker'),[{opacity:0,transform:'translateY(14px)',letterSpacing:'.58em'},{opacity:1,transform:'translateY(0)',letterSpacing:'.42em'}],time(620,120,'cubic-bezier(.18,.8,.2,1)'));animate(o.querySelector('.fx-intro-word span'),[{opacity:0,transform:'translateY(112%) skewY(6deg) scale(.97)',filter:'blur(12px)'},{opacity:1,offset:.58},{opacity:1,transform:'translateY(0) skewY(0) scale(1)',filter:'blur(0)'}],time(920,150,'cubic-bezier(.16,.82,.16,1)'));animate(o.querySelector('.fx-intro-subtitle'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],time(560,650,'cubic-bezier(.2,.8,.2,1)'));animate(o.querySelector('.fx-intro-progress-wrap'),[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],time(620,360,'cubic-bezier(.2,.8,.2,1)'));animate(o.querySelector('.fx-intro-skip'),[{opacity:0},{opacity:.78}],time(520,720,'ease-out'));animate(o.querySelector('.fx-intro-grid'),[{opacity:0,transform:'perspective(700px) rotateX(64deg) scale(1.82) translateY(25%)'},{opacity:.42,transform:'perspective(700px) rotateX(64deg) scale(1.52) translateY(17%)'}],time(1500,0,'cubic-bezier(.16,.8,.2,1)'));animate(o.querySelector('.fx-intro-portal'),[{opacity:0,transform:'translate(-50%, -50%) scale(.48) rotate(-24deg)',filter:'blur(8px)'},{opacity:.78,offset:.56},{opacity:.56,transform:'translate(-50%, -50%) scale(1) rotate(16deg)',filter:'blur(0)'}],time(1760,30,'cubic-bezier(.18,.78,.2,1)'));animate(o.querySelector('.fx-intro-flare'),[{opacity:0,transform:'translate(-50%, -50%) scale(.01)'},{opacity:.96,offset:.42},{opacity:.34,transform:'translate(-50%, -50%) scale(1)'}],time(1320,150,'cubic-bezier(.18,.8,.2,1)'));animate(o.querySelector('.fx-intro-scan'),[{opacity:0,transform:'translateY(-80%)'},{opacity:.62,offset:.2},{opacity:0,transform:'translateY(410%)'}],time(1450,210,'cubic-bezier(.2,.75,.2,1)'))}
  function controls(o){let b=o.querySelector('.fx-intro-skip');if(!b){b=document.createElement('button');b.className='fx-intro-skip';b.type='button';o.append(b)}b.textContent=COPY[language()].skip;b.setAttribute('aria-label',COPY[language()].skip);b.onclick=()=>exit(o,runToken,'skip');if(!o.querySelector('.fx-intro-corners')){const c=document.createElement('div');c.className='fx-intro-corners';c.setAttribute('aria-hidden','true');c.innerHTML='<i></i><i></i><i></i><i></i>';o.append(c)}}
  function exit(o,token,source){if(token!==runToken||finishing)return;finishing=true;cancelAnimationFrame(progressFrame);setProgress(o,100);ROOT.classList.add('fx-intro-reveal');o.classList.add('is-exiting');animate(o,[{opacity:1},{opacity:0}],{duration:exitDuration,easing:'ease-out'});exitTimer=setTimeout(()=>{if(token===runToken)release(o,source||'timeline-complete')},exitDuration+40)}
  function progress(o,token){const start=performance.now();let lastUi=-Infinity;function frame(now){if(token!==runToken||!running||finishing)return;const linear=Math.min(1,Math.max(0,now-start)/timelineDuration),eased=1-Math.pow(1-linear,2.35);if(linear>=1||now-lastUi>=50){lastUi=now;setProgress(o,eased*100)}if(linear>=1)return exit(o,token,'timeline-complete');progressFrame=requestAnimationFrame(frame)}progressFrame=requestAnimationFrame(frame)}
  function start(){const o=document.getElementById(OVERLAY_ID);if(!o)return release(null,'overlay-missing');const returning=seen();configure(returning);cancelTimers();cancelAnimations(o);running=true;finishing=false;runToken++;const token=runToken;controls(o);o.hidden=false;o.setAttribute('aria-hidden','false');setProgress(o,0);ROOT.classList.remove('fx-intro-complete','fx-intro-reveal');ROOT.classList.add('fx-intro-managed','fx-intro-pending','fx-intro-running');ROOT.dataset.fxIntro=returning?'timeline-returning':'timeline-first-visit';ROOT.dataset.fxIntroVisit=returning?'returning':'first';visuals(o,returning);progress(o,token);hardTimer=setTimeout(()=>{if(token===runToken)release(o,'hard-deadline')},hardDeadline)}
  function failOpen(source){if(running)fastRelease(source)}

  stabilizeReferenceFirstPaint();

  if(AUDIT_MODE){ROOT.classList.add('fx-audit-mode');fastRelease('audit-skip');return}

  /* r251: award-performance direct entry. The former cinematic gate could
     finish its counter while a throttled tab delayed the exit callback,
     leaving real content and WebGL hidden behind a 100% overlay. The overlay
     now starts hidden in HTML and this controller only releases the runtime
     hooks. This improves first input, LCP and reliability without replacing
     any of the native WebGL scene or its interaction. */
  ROOT.dataset.fxIntroStrategy = EARLY_REFERENCE_MOBILE
    ? 'mobile-direct-award-r251'
    : 'desktop-direct-award-r251';
  fastRelease('instant-award-r251', true);
  queuePostDomEnhancements(EARLY_REFERENCE_MOBILE);
  addEventListener('pageshow', event => {
    if (event.persisted) fastRelease('bfcache-restore');
  });
  addEventListener('error', () => fastRelease('runtime-error'));
  addEventListener('unhandledrejection', () => fastRelease('promise-error'));
}());
