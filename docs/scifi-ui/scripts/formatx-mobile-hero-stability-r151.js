(function(){
'use strict';
const root=document.documentElement;
const VERSION='r156-mobile-proof-first-stability';
if(root.dataset.fxMobileHeroStabilityR151===VERSION)return;
root.dataset.fxMobileHeroStabilityR151='booting';
const isMobile=()=>matchMedia('(max-width:900px),(pointer:coarse)').matches;

function removeInvalidVisualNodes(){
  if(!isMobile())return;
  const space=document.querySelector('#hero .hero-space');
  if(!(space instanceof HTMLElement))return;
  let removed=0;
  space.querySelectorAll('img,picture,iframe,object,embed').forEach(node=>{node.remove();removed++;});
  if(removed)root.dataset.fxMobileHeroInvalidVisualRemovedR151=String(removed);
  space.style.setProperty('background-color','#010610','important');
}

function makeDock(){
  const dock=document.createElement('section');
  dock.className='fx-mobile-download-r151';
  dock.setAttribute('aria-labelledby','fx-mobile-download-title-r151');
  dock.innerHTML=`
    <div class="fx-mobile-download-head-r151">
      <span data-fx-mobile-download-eyebrow-r151>LETÖLTÉS</span>
      <h2 id="fx-mobile-download-title-r151">FormatX Suite Pro</h2>
      <p data-fx-mobile-download-note-r151>Válaszd ki a platformot. Az elsődleges gomb mindig a hivatalos multiplatform kiadást követi.</p>
    </div>
    <div class="fx-mobile-download-actions-r151">
      <a id="mobile-hero-download-r151" class="button button-solid" href="/download/multiplatform" data-release-download="multiplatform">
        <span data-release-download-label>Teljes multiplatform verzió letöltése</span><i aria-hidden="true">↗</i>
      </a>
      <a class="button button-line" href="/download/android">
        <span data-fx-mobile-android-label-r151>Android alkalmazás</span><i aria-hidden="true">↓</i>
      </a>
    </div>`;
  return dock;
}

function syncPrimaryFromCanonical(dock){
  const primary=dock?.querySelector('[data-release-download="multiplatform"]');
  const source=document.querySelector('#hero-download');
  if(!(primary instanceof HTMLAnchorElement)||!(source instanceof HTMLAnchorElement))return;
  const href=source.getAttribute('href');if(href)primary.setAttribute('href',href);
  for(const attr of ['target','rel','title','aria-describedby']){const value=source.getAttribute(attr);if(value)primary.setAttribute(attr,value);else primary.removeAttribute(attr);}
  for(const key of ['releaseState','releaseChannel'])if(source.dataset[key])primary.dataset[key]=source.dataset[key];
}

function syncLanguage(dock){
  if(!(dock instanceof HTMLElement))return;
  const en=root.lang==='en';
  const eyebrow=dock.querySelector('[data-fx-mobile-download-eyebrow-r151]'),note=dock.querySelector('[data-fx-mobile-download-note-r151]'),primary=dock.querySelector('[data-release-download-label]'),android=dock.querySelector('[data-fx-mobile-android-label-r151]');
  if(eyebrow)eyebrow.textContent=en?'DOWNLOAD':'LETÖLTÉS';
  if(note)note.textContent=en?'Choose a platform. The primary button always follows the official multiplatform release.':'Válaszd ki a platformot. Az elsődleges gomb mindig a hivatalos multiplatform kiadást követi.';
  if(primary)primary.textContent=en?'Download full multiplatform version':'Teljes multiplatform verzió letöltése';
  if(android)android.textContent=en?'Android application':'Android alkalmazás';
}

function ensureDownload(){
  const hero=document.getElementById('hero');if(!(hero instanceof HTMLElement))return false;
  hero.querySelectorAll('.fx-mobile-download-r150').forEach(n=>n.remove());
  let dock=hero.querySelector('.fx-mobile-download-r151');
  if(!isMobile()){if(dock instanceof HTMLElement)dock.hidden=true;return true;}
  const proof=hero.querySelector('.fx-reference-proof'),heading=hero.querySelector('.fx-reference-heading');
  if(!(proof instanceof HTMLElement)||!(heading instanceof HTMLElement))return false;
  if(!(dock instanceof HTMLElement))dock=makeDock();
  dock.hidden=false;
  if(proof.nextElementSibling!==dock)proof.insertAdjacentElement('afterend',dock);
  syncLanguage(dock);syncPrimaryFromCanonical(dock);
  root.dataset.fxMobileDownloadR151='ready';
  root.dataset.fxMobileDownloadPlacementR151='heading-proof-download';
  root.dataset.fxMobileHeroStabilityR151=VERSION;
  return true;
}

function stabilize(){removeInvalidVisualNodes();ensureDownload();root.dataset.fxMobileHeroStabilityR151=VERSION;}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;stabilize();});}
const observer=new MutationObserver(queue);observer.observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('error',event=>{const target=event.target;if(isMobile()&&target instanceof HTMLImageElement&&target.closest('#hero .hero-space')){target.remove();root.dataset.fxMobileHeroBrokenImageR151='removed';queue();}},true);
addEventListener('resize',queue,{passive:true});addEventListener('orientationchange',queue,{passive:true});addEventListener('formatx:languagechange',queue);addEventListener('formatx:releasemetadataready',queue);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
setTimeout(queue,120);setTimeout(queue,700);setTimeout(queue,1800);setTimeout(queue,4200);
}());
