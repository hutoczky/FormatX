(function () {
  'use strict';

  const ROOT = document.documentElement;
  const OVERLAY_ID = 'formatx-event-horizon';
  const VISIT_KEY = 'formatx:intro-seen-v1';
  const MOBILE_QUERY = matchMedia('(max-width: 820px), (pointer: coarse)');
  const MOBILE_DIRECT_QUERY = matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)');
  const REDUCE_QUERY = matchMedia('(prefers-reduced-motion: reduce)');
  const AUDIT_MODE = new URLSearchParams(location.search).get('lighthouse') === '1';

  const COPY = {
    hu: { skip: 'Animáció átugrása', phases: [[18,'KAPCSOLAT FELÉPÍTÉSE'],[42,'TÉRBELI INDEX ÉPÍTÉSE'],[70,'MODULHÁLÓ SZINKRONIZÁLÁSA'],[94,'RENDSZERÁLLAPOT ELLENŐRZÉSE'],[101,'FORMATX MAG AKTÍV']] },
    en: { skip: 'Skip animation', phases: [[18,'ESTABLISHING LINK'],[42,'BUILDING SPATIAL INDEX'],[70,'SYNCHRONISING MODULE NETWORK'],[94,'VERIFYING SYSTEM STATE'],[101,'FORMATX CORE ONLINE']] }
  };

  let runToken=0,progressFrame=0,hardTimer=0,exitTimer=0,running=false,finishing=false;
  let timelineDuration=2400,exitDuration=280,hardDeadline=3780;
  const language=()=>ROOT.lang==='en'?'en':'hu';
  function seen(){try{return localStorage.getItem(VISIT_KEY)==='1'}catch(_){return false}}
  function remember(){try{localStorage.setItem(VISIT_KEY,'1')}catch(_){}}
  function configure(returning){timelineDuration=REDUCE_QUERY.matches?180:(returning?(MOBILE_QUERY.matches?620:760):(MOBILE_QUERY.matches?2100:2400));exitDuration=REDUCE_QUERY.matches?60:(returning?180:280);hardDeadline=timelineDuration+exitDuration+1100}
  function cancelTimers(){cancelAnimationFrame(progressFrame);clearTimeout(hardTimer);clearTimeout(exitTimer);progressFrame=hardTimer=exitTimer=0}
  function cancelAnimations(o){if(!o)return;try{o.getAnimations({subtree:true}).forEach(a=>a.cancel())}catch(_){}}
  function setProgress(o,v){if(!o)return;const b=Math.max(0,Math.min(100,v)),out=o.querySelector('[data-fx-intro-output]'),p=o.querySelector('[data-fx-intro-progress]'),s=o.querySelector('[data-fx-intro-status]'),c=COPY[language()];if(out)out.textContent=String(Math.round(b)).padStart(3,'0');if(p)p.value=Math.round(b);if(s){const phase=c.phases.find(x=>b<x[0]);s.textContent=(phase||c.phases[c.phases.length-1])[1]}}
  function complete(source){document.dispatchEvent(new CustomEvent('formatx:introcomplete',{detail:{source:source||'timeline'}}))}
  function release(o,source){cancelTimers();runToken++;running=finishing=false;if(o){cancelAnimations(o);o.hidden=true;o.setAttribute('aria-hidden','true');o.classList.remove('is-exiting');o.style.opacity=''}ROOT.classList.remove('fx-intro-pending','fx-intro-running','fx-intro-reveal','fx-intro-managed');ROOT.classList.add('fx-intro-complete');ROOT.dataset.fxIntro=source||'timeline-complete';remember();complete(source)}
  function fastRelease(source,deferComplete){
    cancelTimers();runToken++;running=finishing=false;
    const o=document.getElementById(OVERLAY_ID);
    if(o){o.hidden=true;o.setAttribute('aria-hidden','true');o.classList.remove('is-exiting');o.style.display='none';o.style.opacity='0'}
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
  function visuals(o,returning){const speed=REDUCE_QUERY.matches?.1:(returning?.34:1),time=(d,delay,easing)=>({duration:Math.max(1,d*speed),delay:Math.max(0,delay*speed),easing});animate(o.querySelector('.fx-intro-meta'),[{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'translateY(0)'}],time(520,40,'cubic-bezier(.2,.8,.2,1)'));animate(o.querySelector('.fx-intro-corners'),[{opacity:0},{opacity:.72}],time(680,60,'ease-out'));animate(o.querySelector('.fx-intro-kicker'),[{opacity:0,transform:'translateY(14px)',letterSpacing:'.58em'},{opacity:1,transform:'translateY(0)',letterSpacing:'.42em'}],time(620,120,'cubic-bezier(.18,.8,.2,1)'));animate(o.querySelector('.fx-intro-word span'),[{opacity:0,transform:'translateY(112%) skewY(6deg) scale(.97)',filter:'blur(12px)'},{opacity:1,offset:.58},{opacity:1,transform:'translateY(0) skewY(0) scale(1)',filter:'blur(0)'}],time(920,150,'cubic-bezier(.16,.82,.16,1)'));animate(o.querySelector('.fx-intro-subtitle'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],time(560,650,'cubic-bezier(.2,.8,.2,1)'));animate(o.querySelector('.fx-intro-progress-wrap'),[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],time(620,360,'cubic-bezier(.2,.8,.2,1)'));animate(o.querySelector('.fx-intro-skip'),[{opacity:0},{opacity:.78}],time(520,720,'ease-out'));animate(o.querySelector('.fx-intro-grid'),[{opacity:0,transform:'perspective(700px) rotateX(64deg) scale(1.82) translateY(25%)'},{opacity:.42,transform:'perspective(700px) rotateX(64deg) scale(1.52) translateY(17%)'}],time(1500,0,'cubic-bezier(.16,.8,.2,1)'));animate(o.querySelector('.fx-intro-portal'),[{opacity:0,transform:'translate(-50%, -50%) scale(.48) rotate(-24deg)',filter:'blur(8px)'},{opacity:.78,offset:.56},{opacity:.56,transform:'translate(-50%, -50%) scale(1) rotate(16deg)',filter:'blur(0)'}],time(1760,30,'cubic-bezier(.18,.78,.2,1)'));animate(o.querySelector('.fx-intro-flare'),[{opacity:0,transform:'translate(-50%, -50%) scale(.01)'},{opacity:.96,offset:.42},{opacity:.34,transform:'translate(-50%, -50%) scale(1)'}],time(1320,150,'cubic-bezier(.18,.8,.2,1)'));animate(o.querySelector('.fx-intro-scan'),[{opacity:0,transform:'translateY(-80%)'},{opacity:.62,offset:.2},{opacity:0,transform:'translateY(410%)'}],time(1450,210,'cubic-bezier(.2,.75,.2,1)'))}
  function controls(o){let b=o.querySelector('.fx-intro-skip');if(!b){b=document.createElement('button');b.className='fx-intro-skip';b.type='button';o.append(b)}b.textContent=COPY[language()].skip;b.setAttribute('aria-label',COPY[language()].skip);b.onclick=()=>exit(o,runToken,'skip');if(!o.querySelector('.fx-intro-corners')){const c=document.createElement('div');c.className='fx-intro-corners';c.setAttribute('aria-hidden','true');c.innerHTML='<i></i><i></i><i></i><i></i>';o.append(c)}}
  function exit(o,token,source){if(token!==runToken||finishing)return;finishing=true;cancelAnimationFrame(progressFrame);setProgress(o,100);ROOT.classList.add('fx-intro-reveal');o.classList.add('is-exiting');animate(o,[{opacity:1},{opacity:0}],{duration:exitDuration,easing:'ease-out'});exitTimer=setTimeout(()=>{if(token===runToken)release(o,source||'timeline-complete')},exitDuration+40)}
  function progress(o,token){const start=performance.now();function frame(now){if(token!==runToken||!running||finishing)return;const linear=Math.min(1,Math.max(0,now-start)/timelineDuration),eased=1-Math.pow(1-linear,2.35);setProgress(o,eased*100);if(linear>=1)return exit(o,token,'timeline-complete');progressFrame=requestAnimationFrame(frame)}progressFrame=requestAnimationFrame(frame)}
  function start(){const o=document.getElementById(OVERLAY_ID);if(!o)return release(null,'overlay-missing');const returning=seen();configure(returning);cancelTimers();cancelAnimations(o);running=true;finishing=false;runToken++;const token=runToken;controls(o);o.hidden=false;o.setAttribute('aria-hidden','false');o.classList.remove('is-exiting');o.style.opacity='1';setProgress(o,0);ROOT.classList.remove('fx-intro-complete','fx-intro-reveal');ROOT.classList.add('fx-intro-managed','fx-intro-pending','fx-intro-running');ROOT.dataset.fxIntro=returning?'timeline-returning':'timeline-first-visit';ROOT.dataset.fxIntroVisit=returning?'returning':'first';visuals(o,returning);progress(o,token);hardTimer=setTimeout(()=>{if(token===runToken)release(o,'hard-deadline')},hardDeadline)}
  function failOpen(source){if(running)fastRelease(source)}
  if(AUDIT_MODE){ROOT.classList.add('fx-audit-mode');fastRelease('audit-skip');return}
  if(MOBILE_DIRECT_QUERY.matches){ROOT.dataset.fxIntroStrategy='mobile-direct';fastRelease('mobile-direct-v1',true);return}
  addEventListener('pageshow',e=>{if(e.persisted)fastRelease('bfcache-restore')});
  addEventListener('error',()=>failOpen('runtime-error'));
  addEventListener('unhandledrejection',()=>failOpen('promise-error'));
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
}());
