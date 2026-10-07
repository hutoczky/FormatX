/* FormatX R1956 — early canonical navigation owner.
   Registers before deferred visual runtimes so touch/click cannot be swallowed
   by a later capture handler. It re-resolves live controls on every interaction,
   therefore DOM replacement during startup cannot orphan the hamburger. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMenuOwnerR1956==='installed')return;
root.dataset.fxMenuOwnerR1956='installed';

function live(){
  const toggle=document.getElementById('menu-toggle');
  const nav=document.getElementById('main-nav');
  return {
    toggle:toggle instanceof HTMLButtonElement?toggle:null,
    nav:nav instanceof HTMLElement?nav:null
  };
}

function normalize(){
  const {toggle,nav}=live();
  if(!(toggle instanceof HTMLButtonElement)||!(nav instanceof HTMLElement))return null;
  toggle.classList.add('fx-reference-menu-button');
  toggle.type='button';
  toggle.setAttribute('aria-controls','main-nav');
  if(!toggle.hasAttribute('aria-expanded'))toggle.setAttribute('aria-expanded','false');
  nav.classList.add('fx-organism-system-menu');
  nav.hidden=false;
  nav.removeAttribute('hidden');
  if(document.body&&nav.parentElement!==document.body)document.body.appendChild(nav);
  root.dataset.fxMenuOwnerR1956='ready';
  return {toggle,nav};
}

function setOpen(open,source){
  const state=normalize();
  if(!state)return false;
  const {toggle,nav}=state;

  if(open){
    document.body?.classList.remove('fx-organism-panel-open');
    const consoleRoot=document.getElementById('fx-organism-console');
    if(consoleRoot instanceof HTMLElement){
      consoleRoot.hidden=true;
      consoleRoot.setAttribute('aria-hidden','true');
    }
    nav.removeAttribute('aria-hidden');
    nav.removeAttribute('inert');
    nav.scrollTop=0;
    nav.scrollLeft=0;
  }

  nav.classList.toggle('open',open);
  toggle.classList.toggle('open',open);
  toggle.setAttribute('aria-expanded',String(open));
  root.classList.toggle('fx-organism-menu-open',open);
  root.dataset.fxMenuOwnerR1956=open?'open':'closed';

  dispatchEvent(new CustomEvent('formatx:menustatechange',{
    detail:{open,source:source||'menu-owner-r1956'}
  }));
  return true;
}

function toggleFromEvent(event){
  const target=event.target instanceof Element?event.target:null;
  const button=target?.closest('#menu-toggle,.fx-reference-menu-button');
  if(!(button instanceof HTMLButtonElement))return false;
  const state=normalize();
  if(!state||button!==state.toggle)return false;
  event.preventDefault();
  event.stopImmediatePropagation();
  setOpen(!state.nav.classList.contains('open'),'menu-owner-r1956-click');
  return true;
}

/* Capture is registered synchronously in <head>, before deferred application
   scripts. This is the authoritative hamburger interaction boundary. */
document.addEventListener('click',event=>{toggleFromEvent(event);},true);

/* R1963 — the same earliest owner that protects navigation also reserves the
   first trusted SOUND click. This publishes visible feedback synchronously and
   hands the intent to the lazy professional engine without adding a new request
   to first paint. Synthetic replay is deliberately ignored here. */
window.addEventListener('click',event=>{
  if(event.isTrusted===false)return;
  const target=event.target instanceof Element?event.target.closest('.fx-three-sound'):null;
  if(!(target instanceof HTMLButtonElement))return;
  if(root.dataset.fxAudioOwner==='professional-v6')return;
  event.preventDefault();
  event.stopImmediatePropagation();
  target.dataset.fxAudioState='pending';
  target.setAttribute('aria-pressed','false');
  root.dataset.fxAudioState='pending';
  root.dataset.fxSoundEarlyOwnerR1963='requested';
  let loader=document.querySelector('script[src*="formatx-wda-controls-r198.js"]');
  if(!(loader instanceof HTMLScriptElement)){
    loader=document.createElement('script');
    loader.src='/scifi-ui/scripts/formatx-wda-controls-r198.js?v=20261007-r1963-early-sound-handoff';
    loader.async=true;
    loader.dataset.fxAwardRuntimeControlsR206='true';
    loader.dataset.fxWdaHardeningR198='true';
    (document.head||document.documentElement).appendChild(loader);
  }
},true);

document.addEventListener('pointerdown',event=>{
  const state=live();
  if(!state.nav?.classList.contains('open'))return;
  const target=event.target;
  if(target instanceof Node&&(state.toggle?.contains(target)||state.nav.contains(target)))return;
  setOpen(false,'menu-owner-r1956-outside');
},true);

addEventListener('keydown',event=>{
  if(event.key==='Escape')setOpen(false,'menu-owner-r1956-escape');
},true);

for(const eventName of ['formatx:controlownerready','formatx:organisminterfaceready','formatx:mobilelayoutready','formatx:languagechange']){
  addEventListener(eventName,()=>queueMicrotask(()=>{
    const wasOpen=root.classList.contains('fx-organism-menu-open');
    const state=normalize();
    if(wasOpen&&state&&!state.nav.classList.contains('open'))setOpen(true,'menu-owner-r1956-reconcile');
  }),{passive:true});
}

function boot(){
  normalize();
  if(!root.classList.contains('fx-organism-menu-open'))setOpen(false,'menu-owner-r1956-boot');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
addEventListener('pageshow',()=>{normalize();setOpen(false,'menu-owner-r1956-pageshow');},{passive:true});
}());
