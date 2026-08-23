(function(){
'use strict';
const root=document.documentElement;
const VERSION='r156-mobile-proof-first-stability';
if(root.dataset.fxMobileHeroStabilityR151===VERSION)return;
root.dataset.fxMobileHeroStabilityR151='booting';
const mobileQuery=matchMedia('(max-width:900px),(pointer:coarse)');
const isMobile=()=>mobileQuery.matches;
let bootObserver=null,bootTimer=0,queued=false,lastMobile=null,sanitizedSpace=null;

function removeInvalidVisualNodes(){
  if(!isMobile())return true;
  const space=document.querySelector('#hero .hero-space');
  if(!(space instanceof HTMLElement))return false;
  if(space===sanitizedSpace)return true;
  let removed=0;
  space.querySelectorAll('img,picture,iframe,object,embed').forEach(node=>{node.remove();removed++;});
  if(removed)root.dataset.fxMobileHeroInvalidVisualRemovedR151=String(removed);
  if(space.style.getPropertyValue('background-color')!=='#010610'||space.style.getPropertyPriority('background-color')!=='important')space.style.setProperty('background-color','#010610','important');
  sanitizedSpace=space;
  return true;
}
function makeDock(){
  const dock=document.createElement('section');dock.className='fx-mobile-download-r151';dock.setAttribute('aria-labelledby','fx-mobile-download-title-r151');
  dock.innerHTML=`<div class="fx-mobile-download-head-r151"><span data-fx-mobile-download-eyebrow-r151>LETÖLTÉS</span><h2 id="fx-mobile-download-title-r151">FormatX Suite Pro</h2><p data-fx-mobile-download-note-r151>Válaszd ki a platformot. Az elsődleges gomb mindig a hivatalos multiplatform kiadást követi.</p></div><div class="fx-mobile-download-actions-r151"><a id="mobile-hero-download-r151" class="button button-solid" href="/download/multiplatform" data-release-download="multiplatform"><span data-release-download-label>Teljes multiplatform verzió letöltése</span><i aria-hidden="true">↗</i></a><a class="button button-line" href="/download/android"><span data-fx-mobile-android-label-r151>Android alkalmazás</span><i aria-hidden="true">↓</i></a></div>`;
  return dock;
}
function syncPrimaryFromCanonical(dock){
  const primary=dock?.querySelector('[data-release-download="multiplatform"]'),source=document.querySelector('#hero-download');
  if(!(primary instanceof HTMLAnchorElement)||!(source instanceof HTMLAnchorElement))return;
  const href=source.getAttribute('href');if(href&&primary.getAttribute('href')!==href)primary.setAttribute('href',href);
  for(const attr of ['target','rel','title','aria-describedby']){const value=source.getAttribute(attr);if(value){if(primary.getAttribute(attr)!==value)primary.setAttribute(attr,value);}else if(primary.hasAttribute(attr))primary.removeAttribute(attr);}
  for(const key of ['releaseState','releaseChannel'])if(source.dataset[key]&&primary.dataset[key]!==source.dataset[key])primary.dataset[key]=source.dataset[key];
}
function syncLanguage(dock){
  if(!(dock instanceof HTMLElement))return;
  const en=root.lang==='en',eyebrow=dock.querySelector('[data-fx-mobile-download-eyebrow-r151]'),note=dock.querySelector('[data-fx-mobile-download-note-r151]'),primary=dock.querySelector('[data-release-download-label]'),android=dock.querySelector('[data-fx-mobile-android-label-r151]');
  const eyebrowText=en?'DOWNLOAD':'LETÖLTÉS',noteText=en?'Choose a platform. The primary button always follows the official multiplatform release.':'Válaszd ki a platformot. Az elsődleges gomb mindig a hivatalos multiplatform kiadást követi.',primaryText=en?'Download full multiplatform version':'Teljes multiplatform verzió letöltése',androidText=en?'Android application':'Android alkalmazás';
  if(eyebrow&&eyebrow.textContent!==eyebrowText)eyebrow.textContent=eyebrowText;
  if(note&&note.textContent!==noteText)note.textContent=noteText;
  if(primary&&primary.textContent!==primaryText)primary.textContent=primaryText;
  if(android&&android.textContent!==androidText)android.textContent=androidText;
}
function ensureDownload(){
  const hero=document.getElementById('hero');if(!(hero instanceof HTMLElement))return false;
  const old=hero.querySelector('.fx-mobile-download-r150');if(old)old.remove();
  let dock=hero.querySelector('.fx-mobile-download-r151');
  if(!isMobile()){if(dock instanceof HTMLElement&&!dock.hidden)dock.hidden=true;return true;}
  const proof=hero.querySelector('.fx-reference-proof'),heading=hero.querySelector('.fx-reference-heading');
  if(!(proof instanceof HTMLElement)||!(heading instanceof HTMLElement))return false;
  if(!(dock instanceof HTMLElement))dock=makeDock();
  if(dock.hidden)dock.hidden=false;
  if(proof.nextElementSibling!==dock)proof.insertAdjacentElement('afterend',dock);
  if(heading.style.order!=='2')heading.style.setProperty('order','2','important');
  if(proof.style.order!=='3')proof.style.setProperty('order','3','important');
  if(dock.style.order!=='4')dock.style.setProperty('order','4','important');
  syncLanguage(dock);syncPrimaryFromCanonical(dock);
  root.dataset.fxMobileDownloadR151='ready';root.dataset.fxMobileDownloadPlacementR151='heading-proof-download';
  return true;
}
function stopBootObserver(){
  bootObserver?.disconnect();bootObserver=null;
  if(bootTimer)clearTimeout(bootTimer);bootTimer=0;
}
function stabilize(){
  queued=false;
  const mobile=isMobile();
  if(lastMobile!==mobile){sanitizedSpace=null;lastMobile=mobile;}
  const ready=removeInvalidVisualNodes()&&ensureDownload();
  if(ready){root.dataset.fxMobileHeroStabilityR151=VERSION;stopBootObserver();}
  return ready;
}
function queue(){if(queued)return;queued=true;requestAnimationFrame(stabilize);}
function boot(){
  if(stabilize())return;
  const hero=document.getElementById('hero')||document.documentElement;
  bootObserver=new MutationObserver(queue);
  bootObserver.observe(hero,{subtree:true,childList:true});
  bootTimer=setTimeout(()=>{stopBootObserver();stabilize();},4500);
}

document.addEventListener('error',event=>{
  const target=event.target;
  if(isMobile()&&target instanceof HTMLImageElement&&target.closest('#hero .hero-space')){target.remove();root.dataset.fxMobileHeroBrokenImageR151='removed';sanitizedSpace=null;queue();}
},true);
for(const eventName of ['formatx:languagechange','formatx:releasemetadataready','pageshow'])addEventListener(eventName,queue,{passive:true});
function queueViewportClassChange(){if(lastMobile!==isMobile())queue();}
addEventListener('resize',queueViewportClassChange,{passive:true});
addEventListener('orientationchange',queueViewportClassChange,{passive:true});
mobileQuery.addEventListener?.('change',queue);
root.dataset.fxMobileHeroSchedulerR304='boot-once-semantic-events-only';
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
}());
