(function(){
'use strict';
const root=document.documentElement;
const VERSION='r150-mobile-download-restored';
if(root.dataset.fxMobileDownloadR150===VERSION)return;
root.dataset.fxMobileDownloadR150='booting';

function language(){return root.lang==='en'?'en':'hu';}

function cleanClone(source){
  const clone=source.cloneNode(true);
  clone.classList.add('fx-mobile-download-actions-r150');
  clone.querySelectorAll('[id]').forEach(el=>{
    if(el.id==='hero-download')el.id='mobile-hero-download-r150';
    else el.removeAttribute('id');
  });
  clone.querySelectorAll('a').forEach(link=>{
    link.classList.remove('magnetic');
    link.removeAttribute('style');
  });
  return clone;
}

function syncLanguage(dock){
  const en=language()==='en';
  const eyebrow=dock.querySelector('[data-fx-mobile-download-eyebrow]');
  const title=dock.querySelector('[data-fx-mobile-download-title]');
  const note=dock.querySelector('[data-fx-mobile-download-note]');
  if(eyebrow)eyebrow.textContent=en?'DOWNLOAD':'LETÖLTÉS';
  if(title)title.textContent='FormatX Suite Pro';
  if(note)note.textContent=en?'The primary button follows the latest official multiplatform release.':'Az elsődleges gomb mindig a legfrissebb hivatalos multiplatform kiadást követi.';
}

function ensureDock(){
  const hero=document.getElementById('hero');
  if(!(hero instanceof HTMLElement))return false;

  let dock=hero.querySelector('.fx-mobile-download-r150');
  if(innerWidth>900){
    if(dock instanceof HTMLElement)dock.hidden=true;
    root.dataset.fxMobileDownloadR150='desktop';
    return true;
  }

  const source=hero.querySelector('.hero-copy .hero-actions');
  const proof=hero.querySelector('.fx-reference-proof');
  if(!(source instanceof HTMLElement)||!(proof instanceof HTMLElement))return false;

  if(!(dock instanceof HTMLElement)){
    dock=document.createElement('section');
    dock.className='fx-mobile-download-r150';
    dock.setAttribute('aria-labelledby','fx-mobile-download-title-r150');
    dock.innerHTML=[
      '<div class="fx-mobile-download-head-r150">',
      '<span data-fx-mobile-download-eyebrow>LETÖLTÉS</span>',
      '<h2 id="fx-mobile-download-title-r150" data-fx-mobile-download-title>FormatX Suite Pro</h2>',
      '<p data-fx-mobile-download-note>Az elsődleges gomb mindig a legfrissebb hivatalos multiplatform kiadást követi.</p>',
      '</div>'
    ].join('');
    dock.appendChild(cleanClone(source));
  }

  dock.hidden=false;
  if(dock.nextElementSibling!==proof)proof.insertAdjacentElement('beforebegin',dock);
  syncLanguage(dock);
  root.dataset.fxMobileDownloadR150=VERSION;
  root.dataset.fxMobileDownloadPlacementR150='before-proof';
  return true;
}

let attempts=0;
function boot(){
  if(ensureDock())return;
  attempts+=1;
  if(attempts<360)requestAnimationFrame(boot);
  else root.dataset.fxMobileDownloadR150='host-unavailable';
}

const observer=new MutationObserver(()=>{ensureDock();});
observer.observe(document.documentElement,{subtree:true,childList:true});
addEventListener('resize',ensureDock,{passive:true});
addEventListener('orientationchange',ensureDock,{passive:true});
addEventListener('formatx:languagechange',()=>requestAnimationFrame(ensureDock));
addEventListener('formatx:releasemetadataready',()=>requestAnimationFrame(ensureDock));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
}());
