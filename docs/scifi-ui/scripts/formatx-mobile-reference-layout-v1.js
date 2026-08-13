(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMobileReferenceLayout==='ready-v1')return;
if(!matchMedia('(max-width:900px),(pointer:coarse)').matches){root.dataset.fxMobileReferenceLayout='desktop-skip';return;}
root.dataset.fxMobileReferenceLayout='booting-v1';

function loadStyle(){
 if(document.querySelector('link[data-fx-mobile-reference-layout-style]'))return;
 const l=document.createElement('link');l.rel='stylesheet';l.href='/scifi-ui/styles/formatx-mobile-reference-layout-v1.css?v=20260813-reference-layout-r2';l.dataset.fxMobileReferenceLayoutStyle='true';document.head.appendChild(l);
}
function pulse(){window.FormatXCoreMobileV68?.pulse?.();window.FormatXCoreMobileV67?.pulse?.()}
function create(){
 const hero=document.getElementById('hero'),grid=hero?.querySelector('.hero-grid'),space=hero?.querySelector('.hero-space');if(!hero||!grid||!space)return false;
 if(!hero.querySelector('.fx-reference-heading')){const h=document.createElement('div');h.className='fx-reference-heading';h.textContent=root.lang==='en'?'DISCOVER HOW IT WORKS':'A MŰKÖDÉS MEGISMERÉSE';space.after(h)}
 if(!hero.querySelector('.fx-reference-proof')){const card=document.createElement('article');card.className='fx-reference-proof';card.innerHTML=`<span class="fx-reference-proof-kicker">PUBLIC PROOF LAYER</span><h2>${root.lang==='en'?'Proof behind the visual.':'Bizonyíték a látvány mögött.'}</h2><p>${root.lang==='en'?'FormatX does not ask for blind trust: releases, tests, limitations and the security model are separately and publicly verifiable.':'A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető.'}</p><a class="fx-reference-liveos" href="#experience">Live OS</a>`;hero.querySelector('.fx-reference-heading').after(card);card.querySelector('.fx-reference-liveos').addEventListener('click',pulse,{passive:true})}
 if(!hero.querySelector('.fx-reference-rail')){const rail=document.createElement('div');rail.className='fx-reference-rail';rail.innerHTML='<button class="fx-reference-ask" type="button" aria-label="Kérdezz"><i></i><span>KÉRDEZZ</span></button><button class="fx-reference-pause" type="button" aria-label="Animáció ki/be" data-paused="false">Ⅱ</button>';hero.appendChild(rail);rail.querySelector('.fx-reference-ask').addEventListener('click',()=>{if(window.FormatXOrganismVoice?.open)window.FormatXOrganismVoice.open();else document.querySelector('.fx-organism-thought-trigger')?.click();pulse()});let paused=false;rail.querySelector('.fx-reference-pause').addEventListener('click',e=>{paused=!paused;e.currentTarget.dataset.paused=String(paused);e.currentTarget.textContent=paused?'▶':'Ⅱ';root.dataset.fxReferenceMotionPaused=String(paused);dispatchEvent(new CustomEvent('formatx:referencepause',{detail:{paused}}));if(!paused)pulse()})}
 root.dataset.fxMobileReferenceLayout='ready-v1';return true;
}
loadStyle();
if(!create()){const mo=new MutationObserver(()=>{if(create())mo.disconnect()});mo.observe(document.documentElement,{subtree:true,childList:true})}
addEventListener('formatx:languagechange',()=>{const h=document.querySelector('.fx-reference-heading'),c=document.querySelector('.fx-reference-proof'),ask=document.querySelector('.fx-reference-ask span');if(h)h.textContent=root.lang==='en'?'DISCOVER HOW IT WORKS':'A MŰKÖDÉS MEGISMERÉSE';if(c){c.querySelector('h2').textContent=root.lang==='en'?'Proof behind the visual.':'Bizonyíték a látvány mögött.';c.querySelector('p').textContent=root.lang==='en'?'FormatX does not ask for blind trust: releases, tests, limitations and the security model are separately and publicly verifiable.':'A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető.'}if(ask)ask.textContent=root.lang==='en'?'ASK':'KÉRDEZZ'});
}());