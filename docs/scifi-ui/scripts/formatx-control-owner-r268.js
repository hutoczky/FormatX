(function(){
'use strict';

const root=document.documentElement;
const REFERENCE_STYLE='/scifi-ui/styles/formatx-native-orb-reference-r250.css?v=20260824-native-orb-r250';
const SHAPESHIFTER_URL='/scifi-ui/scripts/formatx-core-shapeshifter-r337.js?v=20260830-r455-soft-mobile-optics';
if(root.dataset.fxControlOwnerR268==='ready')return;
root.dataset.fxControlOwnerR268='booting';
root.dataset.fxControlOwnerR264='booting';

const mobileQuery=matchMedia('(max-width:900px)');
let menu=null,queued=false,bootObserver=null,bootTimer=0,controlObserver=null,controlObserverTarget=null,audioObserver=null,lastMobile=null,applying=false;
const language=()=>root.lang==='en'?'en':'hu';
const isMobile=()=>mobileQuery.matches;

function ensureReferenceStyle(){
  let link=document.querySelector('link[data-fx-native-orb-reference-r250]');
  if(!(link instanceof HTMLLinkElement)){
    link=document.createElement('link');link.rel='stylesheet';link.href=REFERENCE_STYLE;link.dataset.fxNativeOrbReferenceR250='true';document.head.appendChild(link);
  }else if(link.parentElement!==document.head)document.head.appendChild(link);
  root.dataset.fxNativeOrbReferenceStyleR250='ready-static-order-r340';
}
function ensureShapeshifter(){
  if(root.dataset.fxCoreShapeshifterR337==='ready'||document.querySelector('script[data-fx-core-shapeshifter-r337]'))return;
  const script=document.createElement('script');script.src=SHAPESHIFTER_URL;script.async=true;script.dataset.fxCoreShapeshifterR337='true';document.head.appendChild(script);
}
function stripInline(node){if(node instanceof HTMLElement&&node.hasAttribute('style'))node.removeAttribute('style');}
function retireLegacyMenu(node){
  if(!(node instanceof HTMLElement)||node.classList.contains('fx-reference-menu-button'))return;
  node.removeAttribute('id');node.classList.remove('menu-toggle','fx-organism-system-toggle');node.dataset.fxLegacyMenu='true';node.hidden=true;node.setAttribute('aria-hidden','true');node.setAttribute('tabindex','-1');node.style.removeProperty('transform');node.style.removeProperty('translate');
}
function retireLegacyMenus(){
  for(const legacy of document.querySelectorAll('#fx-reference-legacy-menu,.menu-toggle:not(.fx-reference-menu-button),.fx-organism-system-toggle:not(.fx-reference-menu-button),[data-fx-legacy-menu="true"]'))retireLegacyMenu(legacy);
  root.dataset.fxLegacyMenuRetirementR280='contained-no-200vw';
}
function canonicalTopbar(){
  const bars=Array.from(document.querySelectorAll('.topbar')).filter(node=>node instanceof HTMLElement);
  if(!bars.length)return null;
  return bars.find(bar=>bar.querySelector(':scope > .brand'))||bars.find(bar=>bar.querySelector('.brand'))||bars[0];
}
function retireLegacyTopbars(owner){
  if(!(owner instanceof HTMLElement))return;
  owner.hidden=false;owner.removeAttribute('aria-hidden');owner.style.removeProperty('display');
  for(const bar of document.querySelectorAll('.topbar')){
    if(!(bar instanceof HTMLElement)||bar===owner)continue;
    const meaningful=Array.from(bar.children).some(child=>{
      if(!(child instanceof HTMLElement))return true;
      if(child.hidden||child.getAttribute('aria-hidden')==='true'||child.dataset.fxLegacyMenu==='true')return false;
      return !child.matches('.fx-reference-mag-button,.fx-language-toggle,.fx-reference-menu-button');
    });
    if(meaningful||bar.querySelector('.brand'))continue;
    bar.dataset.fxLegacyTopbarR417='retired-empty-owner';bar.hidden=true;bar.setAttribute('aria-hidden','true');bar.style.setProperty('display','none','important');
  }
  root.dataset.fxCanonicalTopbarR417=owner.querySelector('.brand')?'branded-owner':'fallback-owner';
}
function closeConflictingPanels(){
  root.classList.remove('fx-organism-menu-open','fx-page-scrolling');document.body?.classList.remove('fx-organism-panel-open');document.getElementById('main-nav')?.classList.remove('open');
  const consoleRoot=document.getElementById('fx-organism-console');if(consoleRoot instanceof HTMLElement){consoleRoot.hidden=true;consoleRoot.setAttribute('aria-hidden','true');}
  for(const panel of document.querySelectorAll('[data-organism-panel]'))if(panel instanceof HTMLElement){panel.hidden=true;panel.setAttribute('aria-hidden','true');}
  for(const tab of document.querySelectorAll('[data-organism-tab]'))tab.setAttribute('aria-selected','false');
}
function liveMenuButton(){
  const current=document.getElementById('menu-toggle');if(!(current instanceof HTMLButtonElement)||!current.classList.contains('fx-reference-menu-button'))return null;menu=current;return current;
}
function setMenuOpen(open){
  const nav=document.getElementById('main-nav'),current=liveMenuButton();if(!(nav instanceof HTMLElement)||!(current instanceof HTMLButtonElement))return;
  if(open){closeConflictingPanels();if(document.body&&nav.parentElement!==document.body)document.body.appendChild(nav);}
  nav.classList.toggle('open',open);nav.hidden=false;nav.removeAttribute('aria-hidden');nav.removeAttribute('inert');current.classList.toggle('open',open);current.setAttribute('aria-expanded',String(open));root.classList.toggle('fx-organism-menu-open',open);dispatchEvent(new CustomEvent('formatx:menustatechange',{detail:{open,source:'control-owner-r268'}}));
}
function canonicalMenu(topbar){
  let current=document.querySelector('.fx-reference-menu-button');
  if(!(current instanceof HTMLButtonElement)){current=document.createElement('button');current.className='fx-reference-menu-button';current.type='button';current.innerHTML='<span></span><span></span>';topbar.appendChild(current);}
  if(current.dataset.fxControlOwnerR268!=='true'){
    const clean=current.cloneNode(true);clean.removeAttribute('style');clean.dataset.fxControlOwnerR268='true';clean.dataset.fxControlOwnerR264='true';current.replaceWith(clean);current=clean;
  }
  for(const duplicate of Array.from(document.querySelectorAll('#menu-toggle')))if(duplicate!==current)retireLegacyMenu(duplicate);
  current.id='menu-toggle';current.type='button';current.classList.add('fx-reference-menu-button','fx-control-owner-r264');current.dataset.fxR244Bound='true';current.dataset.fxControlMenuBoundR264='capture-owner';current.hidden=false;current.removeAttribute('aria-hidden');current.removeAttribute('tabindex');current.setAttribute('aria-controls','main-nav');current.setAttribute('aria-label',language()==='en'?'Menu':'Menü');if(!current.hasAttribute('aria-expanded'))current.setAttribute('aria-expanded','false');stripInline(current);if(current.parentElement!==topbar)topbar.appendChild(current);menu=current;return current;
}
function ensureLanguageToggle(topbar){
  let lang=document.querySelector('.fx-language-toggle');
  if(!(lang instanceof HTMLButtonElement)){
    lang=document.createElement('button');
    lang.type='button';
    lang.className='fx-language-toggle';
    lang.dataset.fxControlLanguageFallbackR423='true';
    lang.addEventListener('click',()=>{
      const next=language()==='en'?'hu':'en';
      const url=new URL(location.href);
      url.searchParams.set('lang',next);
      try{localStorage.setItem('formatx-language',next);}catch(_){}
      location.assign(url.href);
    });
    topbar.appendChild(lang);
  }
  lang.classList.add('fx-control-owner-r264');
  lang.hidden=false;
  lang.removeAttribute('aria-hidden');
  lang.removeAttribute('tabindex');
  stripInline(lang);
  const current=language();
  if(lang.textContent!==current.toUpperCase())lang.textContent=current.toUpperCase();
  lang.lang=current;
  lang.setAttribute('aria-label',current==='en'?'EN – switch to Hungarian':'HU – váltás angol nyelvre');
  lang.setAttribute('title',current==='en'?'EN – switch to Hungarian':'HU – váltás angol nyelvre');
  if(lang.parentElement!==topbar)topbar.appendChild(lang);
  root.dataset.fxReferenceLanguageLayout='r423-direct-topbar-child';
  return lang;
}
function canonicalHeader(hero){
  const topbar=canonicalTopbar();if(!(topbar instanceof HTMLElement))return false;
  topbar.hidden=false;topbar.removeAttribute('aria-hidden');topbar.style.removeProperty('display');
  let mag=document.querySelector('.fx-reference-mag-button');
  if(!(mag instanceof HTMLButtonElement)){mag=document.createElement('button');mag.type='button';mag.className='fx-reference-mag-button';topbar.appendChild(mag);}
  mag.classList.add('fx-control-owner-r264');const magText=language()==='en'?'CORE':'MAG';if(mag.textContent!==magText)mag.textContent=magText;mag.setAttribute('aria-label',language()==='en'?'Change the living core shape':'Az élő MAG alakjának váltása');mag.hidden=false;mag.removeAttribute('aria-hidden');stripInline(mag);if(mag.parentElement!==topbar)topbar.appendChild(mag);
  if(mag.dataset.fxControlMagBoundR268!=='true'){
    mag.dataset.fxControlMagBoundR268='true';mag.addEventListener('click',()=>{if(typeof window.FormatXCoreShapeR337?.next==='function'){window.FormatXCoreShapeR337.next();return;}window.FormatXCoreMobileV69?.pulse?.();});
  }
  ensureLanguageToggle(topbar);
  canonicalMenu(topbar);retireLegacyMenus();retireLegacyTopbars(topbar);
  root.dataset.fxReferenceHeaderLayout=isMobile()?'r423-mobile-branded-language-owned':'r264-desktop-three-control';
  return true;
}
function ensureAsk(rail){
  let ask=rail.querySelector('.fx-reference-ask');if(!(ask instanceof HTMLButtonElement)){ask=document.createElement('button');ask.className='fx-reference-ask';ask.type='button';rail.prepend(ask);}if(!ask.querySelector('i'))ask.prepend(document.createElement('i'));
  let label=ask.querySelector('span');if(!(label instanceof HTMLElement)){label=document.createElement('span');ask.appendChild(label);}const askText=language()==='en'?'ASK':'KÉRDEZZ';if(label.textContent!==askText)label.textContent=askText;ask.setAttribute('aria-label',language()==='en'?'Ask FormatX':'Kérdezz a FormatX-től');
  if(ask.dataset.fxControlAskBoundR268!=='true'){
    const clean=ask.cloneNode(true);clean.dataset.fxControlAskBoundR268='true';ask.replaceWith(clean);ask=clean;ask.addEventListener('click',()=>{closeConflictingPanels();queueMicrotask(()=>{const api=window.FormatXOrganismVoice;if(api){if(root.dataset.fxOrganismDialogueEnabled==='false'&&typeof api.setEnabled==='function'){api.setEnabled(true);root.dataset.fxCanonicalAskReenableR478='api-set-enabled';}if(typeof api.open==='function')api.open();}else document.querySelector('.fx-organism-thought-trigger')?.click();window.FormatXCoreMobileV69?.pulse?.();});});
  }
  return ask;
}
function canonicalControls(hero){
  const grid=hero.querySelector(':scope > .hero-grid'),space=grid?.querySelector(':scope > .hero-space');if(!(grid instanceof HTMLElement)||!(space instanceof HTMLElement))return false;
  let controls=hero.querySelector('.fx-reference-controls-r204');if(!(controls instanceof HTMLElement)){controls=document.createElement('div');controls.className='fx-reference-controls-r204';}controls.classList.add('fx-reference-controls-r264');controls.hidden=false;controls.removeAttribute('aria-hidden');controls.setAttribute('aria-label',language()==='en'?'Hero controls':'Hero vezérlők');
  let rail=controls.querySelector(':scope > .fx-reference-rail')||hero.querySelector('.fx-reference-rail');if(!(rail instanceof HTMLElement)){rail=document.createElement('div');rail.className='fx-reference-rail';}rail.classList.add('fx-reference-rail-r264');
  rail.querySelectorAll('.fx-reference-pause').forEach(node=>node.remove());
  const ask=ensureAsk(rail),sound=document.querySelector('.fx-three-sound');
  if(sound instanceof HTMLButtonElement){sound.type='button';sound.classList.add('fx-control-owner-r264');sound.hidden=false;sound.removeAttribute('aria-hidden');sound.removeAttribute('tabindex');if(sound.parentElement!==controls)controls.prepend(sound);}
  if(rail.parentElement!==controls)controls.appendChild(rail);if(controls.parentElement!==space)space.appendChild(controls);for(const node of [controls,rail,sound,ask,ask.querySelector('span')])stripInline(node);
  root.dataset.fxReferenceControlLayout=isMobile()?'r528-mobile-ask-rail':'r528-desktop-ask-rail';
  root.dataset.fxMagProductContractR528='living-core-continuous-normal-motion';
  return sound instanceof HTMLButtonElement;
}
function visibleControl(node){if(!(node instanceof HTMLElement)||node.hidden||node.getAttribute('aria-hidden')==='true')return false;const style=getComputedStyle(node),rect=node.getBoundingClientRect();return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity||1)>.02&&rect.width>=40&&rect.height>=40;}
function healthy(hero,mobile){
  const topbar=canonicalTopbar(),currentMenu=document.getElementById('menu-toggle'),lang=topbar?.querySelector(':scope > .fx-language-toggle'),controls=hero.querySelector('.fx-reference-controls-r204.fx-reference-controls-r264'),grid=hero.querySelector(':scope > .hero-grid'),space=grid?.querySelector(':scope > .hero-space'),sound=controls?.querySelector(':scope > .fx-three-sound'),ask=controls?.querySelector('.fx-reference-ask'),pauseCount=controls?.querySelectorAll('.fx-reference-pause').length||0;
  return topbar instanceof HTMLElement&&Boolean(topbar.querySelector('.brand'))&&lang instanceof HTMLButtonElement&&lang.parentElement===topbar&&visibleControl(lang)&&currentMenu instanceof HTMLButtonElement&&currentMenu.classList.contains('fx-reference-menu-button')&&currentMenu.parentElement===topbar&&controls instanceof HTMLElement&&controls.parentElement===space&&(mobile||visibleControl(sound))&&visibleControl(ask)&&pauseCount===0;
}
function bindControlObserver(hero){
  const controls=hero.querySelector('.fx-reference-controls-r204.fx-reference-controls-r264');if(!(controls instanceof HTMLElement)||controlObserverTarget===controls&&controlObserver)return;controlObserver?.disconnect();controlObserverTarget=controls;controlObserver=new MutationObserver(records=>{if(applying)return;if(records.some(record=>record.type==='childList'))schedule(true);});controlObserver.observe(controls,{childList:true});root.dataset.fxControlStabilityR321='direct-structure-observer-no-feedback';
}
function bindAudioObserver(){
  if(audioObserver)return;audioObserver=new MutationObserver(records=>{if(records.some(record=>record.attributeName==='data-fx-audio-owner'||record.attributeName==='data-fx-audio-state'))schedule(true);});audioObserver.observe(root,{attributes:true,attributeFilter:['data-fx-audio-owner','data-fx-audio-state']});root.dataset.fxAudioControlHandoffR321='state-only-no-level-feedback-r340';
}
function reconcile(force=false){
  queued=false;if(applying)return false;const hero=document.getElementById('hero');if(!(hero instanceof HTMLElement))return false;const mobile=isMobile();
  if(!force&&root.dataset.fxControlOwnerR268==='ready'&&mobile===lastMobile&&healthy(hero,mobile)){retireLegacyMenus();retireLegacyTopbars(canonicalTopbar());return true;}
  ensureReferenceStyle();ensureShapeshifter();applying=true;
  try{
    const headerReady=canonicalHeader(hero),controlsReady=canonicalControls(hero);
    if(headerReady&&controlsReady&&healthy(hero,mobile)){lastMobile=mobile;root.dataset.fxControlOwnerR264='ready';root.dataset.fxControlOwnerR268='ready';bindControlObserver(hero);bootObserver?.disconnect();bootObserver=null;if(bootTimer)clearTimeout(bootTimer);bootTimer=0;dispatchEvent(new CustomEvent('formatx:controlownerready',{detail:{mobile,revision:'r528-living-core-controls'}}));return true;}
    return false;
  }finally{applying=false;}
}
function schedule(force=false){if(queued)return;queued=true;requestAnimationFrame(()=>reconcile(force));}
function boot(){ensureShapeshifter();bindAudioObserver();if(reconcile(true))return;if(bootObserver)return;const target=document.body||document.documentElement;bootObserver=new MutationObserver(()=>schedule(true));bootObserver.observe(target,{subtree:true,childList:true});bootTimer=setTimeout(()=>{bootObserver?.disconnect();bootObserver=null;bootTimer=0;reconcile(true);},4000);}

document.addEventListener('pointerdown',event=>{const current=liveMenuButton(),nav=document.getElementById('main-nav');if(!(current instanceof HTMLButtonElement)||!(nav instanceof HTMLElement)||!nav.classList.contains('open'))return;const target=event.target;if(target instanceof Node&&(current.contains(target)||nav.contains(target)))return;setMenuOpen(false);},true);
document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null,menuTarget=target?.closest('#menu-toggle.fx-reference-menu-button');if(menuTarget instanceof HTMLButtonElement){menu=menuTarget;event.preventDefault();event.stopImmediatePropagation();const nav=document.getElementById('main-nav');setMenuOpen(!(nav instanceof HTMLElement&&nav.classList.contains('open')));return;}const nav=document.getElementById('main-nav');if(nav instanceof HTMLElement&&nav.classList.contains('open')&&target?.closest('#main-nav a[href]'))setMenuOpen(false);},true);
addEventListener('keydown',event=>{if(event.key==='Escape')setMenuOpen(false);});
for(const eventName of ['formatx:languagechange','formatx:real3dready','formatx:coredetailready','formatx:organisminterfaceready','formatx:mobilelayoutready','pageshow'])addEventListener(eventName,()=>schedule(eventName==='formatx:languagechange'),{passive:true});
addEventListener('formatx:immersiveactivate',()=>schedule(true),{passive:true});addEventListener('resize',()=>schedule(true),{passive:true});addEventListener('orientationchange',()=>schedule(true),{passive:true});
for(const delay of [250,900,2200,5000])setTimeout(()=>{if(root.dataset.fxControlOwnerR268!=='ready')schedule(true);},delay);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
}());
