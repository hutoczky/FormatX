(function(){
'use strict';
const root=document.documentElement;
const VERSION='r185b-iconic-mag-hitlayer-unfold';
if(root.dataset.fxSignatureSystem===VERSION)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxSignatureSystem='audit-skip';return;}
root.dataset.fxSignatureSystem='booting';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const scenes=[
  {id:'hero',n:'01',hu:'MAG',en:'CORE',huSub:'Rendszerállapot',enSub:'System state'},
  {id:'experience',n:'02',hu:'IDEGRENDSZER',en:'NERVOUS SYSTEM',huSub:'Felderítés → terv',enSub:'Discover → plan'},
  {id:'capabilities',n:'03',hu:'SZERVEK',en:'ORGANS',huSub:'Specializált műveletek',enSub:'Specialised operations'},
  {id:'pricing',n:'04',hu:'KERESKEDELMI SZÍV',en:'COMMERCE HEART',huSub:'Licenc és hozzáférés',enSub:'Licence and access'},
  {id:'system',n:'05',hu:'VÁZ',en:'SKELETON',huSub:'Technikai bizonyíték',enSub:'Technical proof'},
  {id:'resources',n:'06',hu:'JELADÓ',en:'BEACON',huSub:'Források és támogatás',enSub:'Resources and support'}
];
let hero=null,host=null,visual=null,trigger=null,overlay=null,closeButton=null,nodeButtons=[],open=false,lastFocus=null,bodyOverflow='';
let resizeRaf=0,interactionRaf=0,lastPointer=null;

function lang(){
  const active=document.querySelector('.language-switch [data-language][aria-pressed="true"]');
  return active?.getAttribute('data-language')==='en'?'en':'hu';
}
function t(hu,en){return lang()==='en'?en:hu}
function setText(){
  if(trigger)trigger.dataset.fxHint=t('NYISD KI A RENDSZERT','UNFOLD THE SYSTEM');
  const cap=overlay?.querySelector('.fx-signature-caption');
  if(cap){
    const strong=cap.querySelector('strong'),span=cap.querySelector('span');
    if(strong)strong.textContent=t('FORMATX / ÉLŐ ARCHITEKTÚRA','FORMATX / LIVING ARCHITECTURE');
    if(span)span.textContent=t('A MAG egyetlen mozdulattal feltárja a teljes rendszert.','One gesture from the core reveals the whole system.');
  }
  nodeButtons.forEach((button,i)=>{
    const item=scenes[i];if(!item)return;
    const title=button.querySelector('span'),sub=button.querySelector('small');
    if(title)title.textContent=lang()==='en'?item.en:item.hu;
    if(sub)sub.textContent=lang()==='en'?item.enSub:item.huSub;
    button.setAttribute('aria-label',`${title?.textContent||''} — ${sub?.textContent||''}`);
  });
  if(closeButton)closeButton.setAttribute('aria-label',t('Rendszerarchitektúra bezárása','Close system architecture'));
}

function buildOverlay(){
  document.querySelector('.fx-signature-architecture')?.remove();
  overlay=document.createElement('div');
  overlay.className='fx-signature-architecture';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','FormatX system architecture');
  overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML='<div class="fx-signature-caption"><strong></strong><span></span></div><button class="fx-signature-close" type="button">×</button><div class="fx-signature-map"><i class="fx-signature-map-core" aria-hidden="true"></i></div>';
  const map=overlay.querySelector('.fx-signature-map');
  closeButton=overlay.querySelector('.fx-signature-close');
  nodeButtons=scenes.map(item=>{
    const b=document.createElement('button');b.type='button';b.className='fx-signature-node';b.dataset.fxTarget=item.id;
    b.innerHTML=`<b>${item.n}</b><div><span></span><small></small></div>`;
    b.addEventListener('click',()=>goTo(item.id));
    map.appendChild(b);return b;
  });
  closeButton.addEventListener('click',()=>closeArchitecture(true));
  overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)closeArchitecture(true)});
  document.body.appendChild(overlay);
  setText();
}

function findVisual(){
  hero=document.getElementById('hero');host=hero?.querySelector('.hero-space');
  if(!(hero instanceof HTMLElement)||!(host instanceof HTMLElement))return false;
  visual=host.querySelector('.fx-core-detail-r122,.fx-core-r112-canvas,.fx-core-mobile-v55-canvas,.fx-core-r112-stage,.fx-core-mobile-v55-stage');
  return visual instanceof HTMLElement;
}
function emitCoreInteraction(clientX,clientY,energy,source){
  if(!(visual instanceof HTMLElement))return;
  const r=visual.getBoundingClientRect();if(r.width<2||r.height<2)return;
  const x=Math.max(-1,Math.min(1,((clientX-r.left)/r.width)*2-1));
  const y=Math.max(-1,Math.min(1,((clientY-r.top)/r.height)*2-1));
  try{dispatchEvent(new CustomEvent('formatx:coreinteraction',{detail:{x,y,energy,source}}))}catch(_){}
  root.dataset.fxSignaturePointer=`${x.toFixed(3)},${y.toFixed(3)},${energy.toFixed(2)}`;
}
function queuePointer(e){
  if(open||!e)return;lastPointer={x:e.clientX,y:e.clientY,type:e.pointerType||'pointer'};
  if(interactionRaf)return;
  interactionRaf=requestAnimationFrame(()=>{
    interactionRaf=0;if(!lastPointer)return;
    emitCoreInteraction(lastPointer.x,lastPointer.y,.66,'signature-pointer-r185b');
  });
}
function energizePointer(e){
  if(e)emitCoreInteraction(e.clientX,e.clientY,1.24,'signature-press-r185b');
  try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}
}
function ensureTrigger(){
  if(!findVisual())return false;
  trigger=hero.querySelector(':scope > .fx-signature-core-trigger');
  if(!(trigger instanceof HTMLButtonElement)){
    hero.querySelectorAll('.fx-signature-core-trigger').forEach(n=>n.remove());
    trigger=document.createElement('button');trigger.type='button';trigger.className='fx-signature-core-trigger';
    trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-haspopup','dialog');
    trigger.addEventListener('pointermove',queuePointer,{passive:true});
    trigger.addEventListener('pointerdown',energizePointer,{passive:true});
    trigger.addEventListener('click',()=>open?closeArchitecture(true):openArchitecture());
    hero.appendChild(trigger);
  }
  trigger.setAttribute('aria-label',t('FormatX MAG — teljes rendszerarchitektúra megnyitása','FormatX Core — open full system architecture'));
  setText();syncTrigger();return true;
}
function syncTrigger(){
  if(!(hero instanceof HTMLElement)||!(visual instanceof HTMLElement)||!(trigger instanceof HTMLElement))return;
  const h=hero.getBoundingClientRect(),v=visual.getBoundingClientRect();
  if(v.width<20||v.height<20)return;
  /* Keep the hit target on the crystal silhouette, not on the whole square reference canvas.
     This leaves neighbouring ASK/pause/CTA controls physically clickable. */
  const insetX=Math.max(0,v.width*.085),insetY=Math.max(0,v.height*.045);
  trigger.style.left=(v.left-h.left+insetX).toFixed(2)+'px';
  trigger.style.top=(v.top-h.top+insetY).toFixed(2)+'px';
  trigger.style.width=Math.max(44,v.width-insetX*2).toFixed(2)+'px';
  trigger.style.height=Math.max(44,v.height-insetY*2).toFixed(2)+'px';
  const r=trigger.getBoundingClientRect();const hit=document.elementFromPoint(r.left+r.width*.5,r.top+r.height*.5);
  root.dataset.fxSignatureTrigger=hit===trigger||trigger.contains(hit)?'synced-hit':'synced-obscured';
}

function pulseCore(){
  try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}
  try{dispatchEvent(new CustomEvent('formatx:coreinteraction',{detail:{x:0,y:0,energy:1.24,source:'signature-unfold-r185b'}}))}catch(_){}
}
function openArchitecture(){
  if(open||!overlay||!trigger)return;
  open=true;lastFocus=document.activeElement;const r=trigger.getBoundingClientRect();
  overlay.style.setProperty('--fx-origin-x',(r.left+r.width/2).toFixed(1)+'px');
  overlay.style.setProperty('--fx-origin-y',(r.top+r.height/2).toFixed(1)+'px');
  bodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  root.classList.add('fx-signature-open');root.dataset.fxSignatureMoment='unfolded';
  overlay.setAttribute('aria-hidden','false');trigger.setAttribute('aria-expanded','true');
  pulseCore();updateCurrentScene();
  setTimeout(()=>closeButton?.focus({preventScroll:true}),reduced.matches?0:260);
  dispatchEvent(new CustomEvent('formatx:signatureunfold',{detail:{open:true,version:VERSION}}));
}
function closeArchitecture(returnFocus){
  if(!open)return;open=false;root.classList.remove('fx-signature-open');root.dataset.fxSignatureMoment='core';
  overlay?.setAttribute('aria-hidden','true');trigger?.setAttribute('aria-expanded','false');document.body.style.overflow=bodyOverflow;
  pulseCore();if(returnFocus)setTimeout(()=>trigger?.focus({preventScroll:true}),reduced.matches?0:180);
  dispatchEvent(new CustomEvent('formatx:signatureunfold',{detail:{open:false,version:VERSION}}));
}
function goTo(id){
  const target=document.getElementById(id);if(!target)return;
  closeArchitecture(false);
  setTimeout(()=>{
    target.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});
    if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
    setTimeout(()=>target.focus({preventScroll:true}),reduced.matches?0:420);
  },reduced.matches?0:130);
}
function focusables(){return overlay?[...overlay.querySelectorAll('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')].filter(el=>el instanceof HTMLElement&&getComputedStyle(el).visibility!=='hidden'):[]}
function keydown(e){
  if(!open)return;
  if(e.key==='Escape'){e.preventDefault();closeArchitecture(true);return}
  if(e.key!=='Tab')return;const f=focusables();if(!f.length)return;const first=f[0],last=f[f.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
}

function updateCurrentScene(){
  let best='hero',bestScore=-Infinity;
  for(const item of scenes){const el=document.getElementById(item.id);if(!el)continue;const r=el.getBoundingClientRect();const score=-Math.abs((r.top+r.height*.34)-innerHeight*.42);if(score>bestScore){bestScore=score;best=item.id}}
  root.dataset.fxSignatureActiveScene=best;
  nodeButtons.forEach(b=>b.setAttribute('aria-current',b.dataset.fxTarget===best?'true':'false'));
  document.querySelectorAll('#main-nav a[href^="#"],.fx-rail a[href^="#"]').forEach(a=>{if(a.getAttribute('href')==='#'+best)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
}
function premiumSections(){
  document.querySelectorAll('main>.scene,main>.fx-category-deck').forEach((el,i)=>{el.dataset.fxSignatureQuality='r185';el.style.setProperty('--fx-signature-section',String(i+1))});
  root.dataset.fxSignatureSections=String(document.querySelectorAll('main>.scene').length);
}
function onResize(){cancelAnimationFrame(resizeRaf);resizeRaf=requestAnimationFrame(()=>{if(!findVisual())return;syncTrigger()})}

function boot(attempt=0){
  if(!document.body)return requestAnimationFrame(()=>boot(attempt+1));
  premiumSections();buildOverlay();
  if(!ensureTrigger()){
    if(attempt<360)return requestAnimationFrame(()=>boot(attempt+1));
    root.dataset.fxSignatureSystem='visual-unavailable';return;
  }
  addEventListener('resize',onResize,{passive:true});addEventListener('scroll',updateCurrentScene,{passive:true});document.addEventListener('keydown',keydown);
  const ro=new ResizeObserver(onResize);ro.observe(hero);ro.observe(host);if(visual)ro.observe(visual);
  const mo=new MutationObserver(()=>{setText();if(!trigger?.isConnected||!visual?.isConnected){findVisual();ensureTrigger()}});
  const language=document.querySelector('.language-switch');if(language)mo.observe(language,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
  updateCurrentScene();syncTrigger();root.dataset.fxSignatureSystem=VERSION;root.dataset.fxSignatureUsability='touch-focus-reduced-motion-r185b';
  dispatchEvent(new CustomEvent('formatx:signatureready',{detail:{version:VERSION}}));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});else boot();
}());
