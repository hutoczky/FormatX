(function(){
'use strict';

const root=document.documentElement;
const VERSION='r325-inert-hidden-architecture';
if(root.dataset.fxSignatureSystem===VERSION)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxSignatureSystem='audit-skip';
  return;
}
root.dataset.fxSignatureSystem='booting-r325';
root.dataset.fxSignatureSchedulerR277='event-driven-no-idle-scan';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const scenes=[
  {id:'hero',n:'01',hu:'MAG',en:'CORE',huSub:'Rendszerállapot',enSub:'System state'},
  {id:'experience',n:'02',hu:'IDEGRENDSZER',en:'NERVOUS SYSTEM',huSub:'Felderítés → terv',enSub:'Discover → plan'},
  {id:'capabilities',n:'03',hu:'SZERVEK',en:'ORGANS',huSub:'Specializált műveletek',enSub:'Specialised operations'},
  {id:'pricing',n:'04',hu:'KERESKEDELMI SZÍV',en:'COMMERCE HEART',huSub:'Licenc és hozzáférés',enSub:'Licence and access'},
  {id:'system',n:'05',hu:'VÁZ',en:'SKELETON',huSub:'Technikai bizonyíték',enSub:'Technical proof'},
  {id:'resources',n:'06',hu:'JELADÓ',en:'BEACON',huSub:'Források és támogatás',enSub:'Resources and support'}
];

let overlay=null;
let closeButton=null;
let nodeButtons=[];
let open=false;
let lastFocus=null;
let sceneObserver=null;
const sceneRatios=new Map();

function lang(){
  const active=document.querySelector('.language-switch [data-language][aria-pressed="true"]');
  if(active?.getAttribute('data-language')==='en')return'en';
  return root.lang==='en'?'en':'hu';
}
function t(hu,en){return lang()==='en'?en:hu}

function ensureExplicitStyle(){
  if(document.querySelector('link[data-fx-signature-explicit-r320]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='/scifi-ui/styles/formatx-signature-explicit-r320.css?v=20260824-r320-explicit-architecture';
  link.dataset.fxSignatureExplicitR320='true';
  document.head.appendChild(link);
}

function retireLegacyHitLayer(){
  document.querySelectorAll('#hero > .fx-signature-core-trigger,.fx-signature-core-trigger').forEach(node=>node.remove());
  root.dataset.fxSignatureTrigger='retired-r320-no-core-hitlayer';
  root.dataset.fxSignatureCoreInteraction='native-webgl-owner-r317';
}

function setText(){
  const cap=overlay?.querySelector('.fx-signature-caption');
  if(cap){
    const strong=cap.querySelector('strong');
    const span=cap.querySelector('span');
    if(strong)strong.textContent=t('FORMATX / ÉLŐ ARCHITEKTÚRA','FORMATX / LIVING ARCHITECTURE');
    if(span)span.textContent=t('A teljes rendszerarchitektúra külön vezérléssel nyitható meg.','The full system architecture opens through an explicit control.');
  }
  nodeButtons.forEach((button,index)=>{
    const item=scenes[index];
    if(!item)return;
    const title=button.querySelector('span');
    const sub=button.querySelector('small');
    if(title)title.textContent=lang()==='en'?item.en:item.hu;
    if(sub)sub.textContent=lang()==='en'?item.enSub:item.huSub;
    button.setAttribute('aria-label',`${title?.textContent||''} — ${sub?.textContent||''}`);
  });
  if(closeButton)closeButton.setAttribute('aria-label',t('Rendszerarchitektúra bezárása','Close system architecture'));
}

function setOverlayInteractive(next){
  if(!(overlay instanceof HTMLElement))return;
  overlay.setAttribute('aria-hidden',String(!next));
  if(next)overlay.removeAttribute('inert');
  else overlay.setAttribute('inert','');
}

function buildOverlay(){
  document.querySelectorAll('.fx-signature-architecture').forEach(node=>node.remove());
  overlay=document.createElement('div');
  overlay.className='fx-signature-architecture';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','FormatX system architecture');
  overlay.setAttribute('aria-hidden','true');
  overlay.setAttribute('inert','');
  overlay.innerHTML='<div class="fx-signature-caption"><strong></strong><span></span></div><button class="fx-signature-close" type="button">×</button><div class="fx-signature-map"><i class="fx-signature-map-core" aria-hidden="true"></i></div>';
  const map=overlay.querySelector('.fx-signature-map');
  closeButton=overlay.querySelector('.fx-signature-close');
  nodeButtons=scenes.map(item=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='fx-signature-node';
    button.dataset.fxTarget=item.id;
    button.innerHTML=`<b>${item.n}</b><div><span></span><small></small></div>`;
    button.addEventListener('click',()=>goTo(item.id));
    map?.appendChild(button);
    return button;
  });
  closeButton?.addEventListener('click',()=>closeArchitecture(true));
  overlay.addEventListener('pointerdown',event=>{if(event.target===overlay)closeArchitecture(true)});
  document.body.appendChild(overlay);
  setText();
}

function setCurrentScene(best){
  const current=best||'hero';
  root.dataset.fxSignatureActiveScene=current;
  nodeButtons.forEach(button=>button.setAttribute('aria-current',button.dataset.fxTarget===current?'true':'false'));
  document.querySelectorAll('#main-nav a[href^="#"],.fx-rail a[href^="#"]').forEach(anchor=>{
    if(anchor.getAttribute('href')==='#'+current)anchor.setAttribute('aria-current','true');
    else anchor.removeAttribute('aria-current');
  });
}

function updateCurrentScene(){
  let best=root.dataset.fxSignatureActiveScene||'hero';
  let score=-1;
  for(const item of scenes){
    const ratio=sceneRatios.get(item.id)||0;
    if(ratio>score){score=ratio;best=item.id;}
  }
  setCurrentScene(best);
}

function installSceneObserver(){
  sceneObserver?.disconnect();
  sceneRatios.clear();
  if(typeof IntersectionObserver!=='function'){
    setCurrentScene('hero');
    return;
  }
  sceneObserver=new IntersectionObserver(entries=>{
    for(const entry of entries)sceneRatios.set(entry.target.id,entry.isIntersecting?entry.intersectionRatio:0);
    updateCurrentScene();
  },{rootMargin:'-20% 0px -35% 0px',threshold:[0,.15,.35,.6,.85]});
  for(const item of scenes){
    const element=document.getElementById(item.id);
    if(element)sceneObserver.observe(element);
  }
}

function premiumSections(){
  const surfaces=document.querySelectorAll('main>.scene,main>.fx-category-deck');
  surfaces.forEach((element,index)=>{
    element.dataset.fxSignatureQuality='r185';
    element.dataset.fxSignatureSection=String(index+1);
  });
  root.dataset.fxSignatureSections=String(document.querySelectorAll('main>.scene').length);
}

function pulseCore(){
  try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}
  try{dispatchEvent(new CustomEvent('formatx:coreinteraction',{detail:{x:0,y:0,energy:1.08,source:'signature-explicit-r325'}}))}catch(_){}
}

function openArchitecture(source='explicit-api'){
  if(open||!(overlay instanceof HTMLElement))return false;
  open=true;
  lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  root.classList.add('fx-signature-open');
  root.dataset.fxSignatureMoment='unfolded-explicit-r325';
  root.dataset.fxSignatureOpenSource=String(source).slice(0,64);
  setOverlayInteractive(true);
  pulseCore();
  updateCurrentScene();
  setTimeout(()=>closeButton?.focus({preventScroll:true}),reduced.matches?0:120);
  dispatchEvent(new CustomEvent('formatx:signatureunfold',{detail:{open:true,version:VERSION,source}}));
  return true;
}

function closeArchitecture(returnFocus=true){
  if(!open)return false;
  open=false;
  root.classList.remove('fx-signature-open');
  root.dataset.fxSignatureMoment='core';
  setOverlayInteractive(false);
  pulseCore();
  if(returnFocus&&lastFocus?.isConnected)setTimeout(()=>lastFocus.focus({preventScroll:true}),reduced.matches?0:80);
  dispatchEvent(new CustomEvent('formatx:signatureunfold',{detail:{open:false,version:VERSION}}));
  return true;
}

function goTo(id){
  const target=document.getElementById(id);
  if(!target)return;
  closeArchitecture(false);
  setTimeout(()=>{
    target.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});
    if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
    setTimeout(()=>target.focus({preventScroll:true}),reduced.matches?0:360);
  },reduced.matches?0:100);
}

function focusables(){
  return overlay?[...overlay.querySelectorAll('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')]
    .filter(element=>element instanceof HTMLElement&&getComputedStyle(element).visibility!=='hidden'):[];
}

function keydown(event){
  if(!open)return;
  if(event.key==='Escape'){
    event.preventDefault();
    closeArchitecture(true);
    return;
  }
  if(event.key!=='Tab')return;
  const items=focusables();
  if(!items.length)return;
  const first=items[0];
  const last=items[items.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
}

function bindExplicitOpeners(){
  document.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target.closest('[data-fx-signature-open]'):null;
    if(!(target instanceof HTMLElement))return;
    event.preventDefault();
    openArchitecture('explicit-control');
  });
  addEventListener('formatx:signature-open-request',event=>openArchitecture(event.detail?.source||'explicit-event'));
}

function boot(){
  if(!document.body){document.addEventListener('DOMContentLoaded',boot,{once:true});return;}
  ensureExplicitStyle();
  retireLegacyHitLayer();
  premiumSections();
  buildOverlay();
  installSceneObserver();
  bindExplicitOpeners();
  document.addEventListener('keydown',keydown);
  addEventListener('formatx:languagechange',setText,{passive:true});
  addEventListener('formatx:real3dready',retireLegacyHitLayer,{passive:true});
  addEventListener('formatx:controlownerready',retireLegacyHitLayer,{passive:true});

  const language=document.querySelector('.language-switch');
  if(language)new MutationObserver(setText).observe(language,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});

  window.FormatXSignatureArchitecture=Object.freeze({
    version:VERSION,
    open:()=>openArchitecture('explicit-api'),
    close:()=>closeArchitecture(true),
    get isOpen(){return open;}
  });

  root.dataset.fxSignatureSystem=VERSION;
  root.dataset.fxSignatureUsability='explicit-disclosure-focus-inert-r325';
  root.dataset.fxSignatureCsp='external-css-no-inline-style-r325';
  dispatchEvent(new CustomEvent('formatx:signatureready',{detail:{version:VERSION,trigger:'explicit-only',hiddenInert:true}}));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
}());