/* FormatX r471 — one static language control, event-driven public-shell handoff. */
(function(){
'use strict';
const ROOT=document.documentElement;
const STORAGE_KEY='formatx-language';
const SUPPORTED=new Set(['hu','en']);
const VERSION='7';
if(ROOT.dataset.fxSingleLanguageToggle==='ready'&&ROOT.dataset.fxSingleLanguageToggleVersion===VERSION)return;
ROOT.dataset.fxSingleLanguageToggle='loading';
ROOT.dataset.fxSingleLanguageToggleVersion=VERSION;
let installed=false;

const FIXED_COPY=[
  ['.topbar .brand small','LIVING SYSTEM','LIVING SYSTEM'],
  ['.site-footer .footer-brand .brand small','ÉLŐ RENDSZER','LIVING SYSTEM'],
  ['#hero .hero-label.a b','MAG ÁLLAPOT','CORE STATE'],
  ['#hero .hero-label.b b','KIADÁSI CSATORNA','RELEASE CHANNEL'],
  ['#hero .hero-label.c b','INTEGRITÁS','INTEGRITY'],
  ['#experience .section-heading .section-index','02 — IDEGRENDSZER','02 — NERVOUS SYSTEM'],
  ['#capabilities .section-heading .section-index','03 — RENDSZERSZERVEK','03 — SYSTEM ORGANS'],
  ['#pricing .section-heading .section-index','04 — KERESKEDELMI SZÍV','04 — COMMERCE HEART'],
  ['#system .section-heading .section-index','05 — RENDSZERVÁZ','05 — SYSTEM SKELETON'],
  ['#resources .section-index','06 — KIADÁSI JELADÓ','06 — RELEASE BEACON'],
  ['#experience .flow-chapters article[data-flow="0"] small','FELDERÍTÉS','DISCOVER'],
  ['#experience .flow-chapters article[data-flow="1"] small','TERVEZÉS','PLAN'],
  ['#experience .flow-chapters article[data-flow="2"] small','VÉGREHAJTÁS','EXECUTE'],
  ['#experience .flow-chapters article[data-flow="3"] small','ELLENŐRZÉS','VERIFY'],
  ['#capabilities .card:nth-child(1) > b','ÍRÁS / ELLENŐRZÉS','WRITE / VERIFY'],
  ['#capabilities .card:nth-child(2) > b','GYORS / MÉLY','QUICK / DEEP'],
  ['#capabilities .card:nth-child(3) > b','TERV / ELŐNÉZET','PLAN / PREVIEW'],
  ['#capabilities .card:nth-child(4) > b','MEGERŐSÍTÉS / TÖRLÉS','CONFIRM / ERASE'],
  ['#capabilities .card:nth-child(5) > b','OLVASÁS / ELEMZÉS','READ / ANALYSE'],
  ['#capabilities .card:nth-child(6) > b','MAGYARÁZAT / SEGÍTSÉG','EXPLAIN / GUIDE'],
  ['#pricing .price-card:nth-child(1) header b','EGYÉNI','INDIVIDUAL'],
  ['#pricing .price-card:nth-child(2) header b','AJÁNLOTT','RECOMMENDED'],
  ['#pricing .price-card:nth-child(3) header b','CSAPAT','TEAM'],
  ['#hero .fx-reference-ask span','KÉRDEZZ','ASK'],
  ['#hero .fx-reference-proof h2','Bizonyíték a látvány mögött.','Proof behind the visual.'],
  ['#hero .fx-method-inline li:nth-child(1)','Felderítés','Discover'],
  ['#hero .fx-method-inline li:nth-child(2)','Terv','Plan'],
  ['#hero .fx-method-inline li:nth-child(3)','Kontrollált végrehajtás','Controlled execution'],
  ['#hero .fx-method-inline li:nth-child(4)','Visszaellenőrzés','Verification']
];

function publicPageMode(){return Boolean(document.body?.dataset.fxPublicPage||document.querySelector('header.fx-public-header'));}
function storedLanguage(){
  const query=new URLSearchParams(location.search).get('lang');
  if(SUPPORTED.has(query))return query;
  try{const stored=localStorage.getItem(STORAGE_KEY);if(SUPPORTED.has(stored))return stored;}catch(_){}
  if(SUPPORTED.has(ROOT.lang))return ROOT.lang;
  return String(navigator.language||'').toLowerCase().startsWith('hu')?'hu':'en';
}
function setFixed(language){
  const index=language==='en'?2:1;
  for(const [selector,hu,en] of FIXED_COPY){
    const value=index===2?en:hu;
    document.querySelectorAll(selector).forEach(node=>{if(node.textContent!==value)node.textContent=value;});
  }
  ROOT.dataset.fxFixedCopyLanguage=language;
  ROOT.dataset.fxFixedCopyVersion='r471';
}
function applyCopy(language){
  ROOT.lang=language;
  document.querySelectorAll('[data-hu][data-en]').forEach(node=>{
    const value=node.dataset[language];
    if(typeof value==='string'&&node.textContent!==value)node.textContent=value;
  });
  document.querySelectorAll('[data-hu-label][data-en-label]').forEach(node=>{
    const value=node.dataset[language+'Label'];if(value)node.setAttribute('aria-label',value);
  });
  setFixed(language);
}
function updateButton(button,language){
  const code=language==='en'?'EN':'HU';
  button.textContent=code;
  button.lang=language;
  button.dataset.nextLanguage=language==='en'?'hu':'en';
  button.dataset.fxSingleLanguageToggle='ready-v3';
  const label=language==='en'?'EN – switch to Hungarian':'HU – váltás angol nyelvre';
  button.setAttribute('aria-label',label);
  button.title=label;
  button.hidden=false;
  button.removeAttribute('aria-hidden');
  button.removeAttribute('tabindex');
}
function hideLegacy(container){
  document.querySelectorAll('[data-language],[data-language-choice]').forEach(button=>{
    if(button.classList.contains('fx-language-toggle'))return;
    button.hidden=true;button.tabIndex=-1;button.setAttribute('aria-hidden','true');
  });
  if(!publicPageMode()){
    for(const legacy of document.querySelectorAll('.language-switch,.language-control')){
      if(legacy===container)continue;
      legacy.hidden=true;legacy.setAttribute('aria-hidden','true');
    }
  }
}
function targetContainer(){
  if(!publicPageMode())return document.querySelector('.topbar');
  return document.querySelector('.language-switch,.language-control,.fx-public-header .header-actions,.legal-header-inner');
}
function ensureButton(){
  const host=targetContainer();
  if(!(host instanceof HTMLElement))return null;
  let button=document.querySelector('.fx-language-toggle');
  if(!(button instanceof HTMLButtonElement)){
    button=document.createElement('button');
    button.type='button';
    button.className='fx-language-toggle';
    button.dataset.languageToggle='true';
  }
  if(button.parentElement!==host)host.appendChild(button);
  if(!publicPageMode())button.classList.add('fx-control-owner-r264');
  else button.classList.remove('fx-control-owner-r264');
  hideLegacy(host);
  return button;
}
function persist(language){
  try{localStorage.setItem(STORAGE_KEY,language);}catch(_){}
  const url=new URL(location.href);url.searchParams.set('lang',language);
  history.replaceState({},'',url.pathname+url.search+url.hash);
}
function publish(language){
  dispatchEvent(new CustomEvent('formatx:languagechange',{detail:{language,source:'single-language-toggle-r462'}}));
}
function remountInstalledButton(){
  if(!installed)return false;
  const button=document.querySelector('.fx-language-toggle');
  const host=targetContainer();
  if(!(button instanceof HTMLButtonElement)||!(host instanceof HTMLElement))return false;
  if(button.parentElement!==host)host.appendChild(button);
  hideLegacy(host);
  updateButton(button,SUPPORTED.has(ROOT.lang)?ROOT.lang:storedLanguage());
  return true;
}
function install(){
  if(installed)return remountInstalledButton();
  const button=ensureButton();
  if(!(button instanceof HTMLButtonElement)){
    ROOT.dataset.fxSingleLanguageToggle='waiting-public-shell';
    return false;
  }
  const initial=storedLanguage();applyCopy(initial);updateButton(button,initial);
  if(button.dataset.fxLanguageBoundR461!=='true'){
    button.dataset.fxLanguageBoundR461='true';
    button.addEventListener('click',()=>{
      const current=SUPPORTED.has(ROOT.lang)?ROOT.lang:storedLanguage();
      const next=current==='hu'?'en':'hu';
      persist(next);applyCopy(next);updateButton(button,next);
      window.FormatXI18n?.setLanguage?.(next,true);
      publish(next);
    });
  }
  addEventListener('formatx:languagechange',event=>{
    if(event.detail?.source==='single-language-toggle-r462')return;
    const language=event.detail?.language;
    if(!SUPPORTED.has(language))return;
    applyCopy(language);updateButton(button,language);
    const host=targetContainer();if(host instanceof HTMLElement&&button.parentElement!==host)host.appendChild(button);
  },{passive:true});
  for(const eventName of ['formatx:controlownerready','formatx:mobilelayoutready','pageshow'])addEventListener(eventName,()=>{
    const host=targetContainer();if(host instanceof HTMLElement&&button.parentElement!==host)host.appendChild(button);
    hideLegacy(host);
    updateButton(button,SUPPORTED.has(ROOT.lang)?ROOT.lang:storedLanguage());
  },{passive:true});
  installed=true;
  ROOT.dataset.fxSingleLanguageToggle='ready';
  ROOT.dataset.fxSingleLanguageToggleVersion=VERSION;
  ROOT.dataset.fxLanguageObserverPolicyR461='event-driven-no-document-mutation-observer';
  ROOT.dataset.fxLanguagePublicShellHandoffR471=publicPageMode()?'ready':'not-required';
  return true;
}
function requestInstall(){install();}

addEventListener('formatx:publicshellready',requestInstall,{passive:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',requestInstall,{once:true});else requestInstall();
}());
