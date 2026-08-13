(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMobileReferenceLayout==='ready-v1')return;
if(!matchMedia('(max-width:900px),(pointer:coarse)').matches){root.dataset.fxMobileReferenceLayout='desktop-skip';return;}
root.dataset.fxMobileReferenceLayout='booting-v1';

function style(){
 if(document.getElementById('fx-mobile-reference-layout-style'))return;
 const s=document.createElement('style');s.id='fx-mobile-reference-layout-style';s.textContent=`
 @media (max-width:900px),(pointer:coarse){
   body.living-architecture #hero{padding-top:max(70px,calc(env(safe-area-inset-top) + 64px))!important;overflow:visible!important}
   body.living-architecture .topbar{min-height:72px!important;padding-top:6px!important;padding-bottom:6px!important}
   body.living-architecture #hero .hero-grid{display:flex!important;flex-direction:column!important;gap:0!important;overflow:visible!important}
   html[data-fx-mobile-reference-layout="ready-v1"] #hero .hero-copy{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
   html[data-fx-mobile-reference-layout="ready-v1"] #hero .scroll-cue{display:none!important}
   #hero .fx-reference-heading{order:1!important;position:relative!important;z-index:8!important;display:flex!important;align-items:center!important;gap:16px!important;margin:-10px 5.8% 18px!important;color:rgba(238,246,255,.84)!important;font:500 clamp(17px,4.2vw,24px)/1.1 system-ui,sans-serif!important;letter-spacing:.16em!important;text-transform:uppercase!important;white-space:nowrap!important}
   #hero .fx-reference-heading:after{content:"";display:block;width:56px;height:1px;background:linear-gradient(90deg,rgba(90,222,255,.95),transparent)}
   #hero .fx-reference-proof{order:2!important;position:relative!important;z-index:8!important;margin:0 5.8% 26px!important;padding:28px 34px 30px!important;min-height:260px!important;border:1px solid rgba(112,205,236,.28)!important;border-radius:28px!important;background:linear-gradient(145deg,rgba(8,30,44,.95),rgba(4,20,31,.94))!important;box-shadow:inset 0 1px 0 rgba(164,235,255,.08),0 16px 52px rgba(0,0,0,.28)!important;color:#eaf6ff!important;overflow:hidden!important}
   #hero .fx-reference-proof:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 82% 20%,rgba(28,192,255,.08),transparent 34%),linear-gradient(135deg,rgba(255,255,255,.015),transparent 44%);pointer-events:none}
   #hero .fx-reference-proof-kicker{position:relative;display:block;margin:0 0 18px;color:rgba(206,225,239,.73);font:600 13px/1 system-ui,sans-serif;letter-spacing:.24em;text-transform:uppercase}
   #hero .fx-reference-proof h2{position:relative;margin:0 0 22px;max-width:75%;color:#f1f8ff;font:800 clamp(28px,7.2vw,40px)/1.03 system-ui,sans-serif;letter-spacing:-.035em}
   #hero .fx-reference-proof p{position:relative;margin:0;max-width:78%;color:rgba(213,226,237,.72);font:400 clamp(17px,4.7vw,24px)/1.72 system-ui,sans-serif}
   #hero .fx-reference-liveos{position:absolute;right:12px;bottom:14px;display:grid;place-items:center;width:108px;height:108px;border:1px solid rgba(63,224,255,.72);border-radius:50%;background:rgba(3,20,31,.76);color:#fff;font:700 16px/1 system-ui,sans-serif;letter-spacing:.02em;text-decoration:none;box-shadow:inset 0 0 30px rgba(31,171,224,.05);backdrop-filter:blur(8px)}
   #hero .fx-reference-rail{position:absolute;right:4.5%;top:126px;z-index:14;display:flex;flex-direction:column;align-items:center;gap:14px;pointer-events:none}
   #hero .fx-reference-ask,#hero .fx-reference-pause{pointer-events:auto;appearance:none;border:1px solid rgba(139,198,226,.25);background:rgba(3,14,24,.63);color:#d9ecf7;box-shadow:inset 0 0 30px rgba(55,180,255,.035);backdrop-filter:blur(10px)}
   #hero .fx-reference-ask{width:76px;height:76px;border-radius:50%;display:grid;place-items:center;position:relative}
   #hero .fx-reference-ask i{width:29px;height:22px;border-radius:50%;display:block;background:radial-gradient(circle at 35% 36%,#fff 0 18%,#dff 35%,rgba(215,171,255,.82) 66%,transparent 72%);filter:drop-shadow(0 0 8px rgba(212,160,255,.55))}
   #hero .fx-reference-ask span{position:absolute;top:82px;left:50%;transform:translateX(-50%);font:600 11px/1 system-ui,sans-serif;letter-spacing:.05em;color:rgba(226,235,244,.78)}
   #hero .fx-reference-pause{width:76px;height:76px;border-radius:50%;font:800 18px/1 ui-monospace,monospace;color:#62dcff}
   #hero .fx-reference-pause[data-paused="true"]{color:#d6f8ff;box-shadow:0 0 24px rgba(54,203,255,.12),inset 0 0 30px rgba(55,180,255,.08)}
   @media(max-width:430px){#hero .fx-reference-proof{padding:24px 28px 28px;min-height:238px;border-radius:25px}#hero .fx-reference-liveos{width:96px;height:96px;right:10px;bottom:12px}#hero .fx-reference-rail{right:3.6%;top:112px}.fx-reference-ask,.fx-reference-pause{transform:scale(.92)}}
 }
 `;document.head.appendChild(s);
}
function create(){
 const hero=document.getElementById('hero'),grid=hero?.querySelector('.hero-grid'),space=hero?.querySelector('.hero-space');if(!hero||!grid||!space)return false;
 if(!hero.querySelector('.fx-reference-heading')){const h=document.createElement('div');h.className='fx-reference-heading';h.textContent=root.lang==='en'?'DISCOVER HOW IT WORKS':'A MŰKÖDÉS MEGISMERÉSE';space.after(h)}
 if(!hero.querySelector('.fx-reference-proof')){const card=document.createElement('article');card.className='fx-reference-proof';card.innerHTML=`<span class="fx-reference-proof-kicker">PUBLIC PROOF LAYER</span><h2>${root.lang==='en'?'Proof behind the visual.':'Bizonyíték a látvány mögött.'}</h2><p>${root.lang==='en'?'FormatX does not ask for blind trust: releases, tests, limitations and the security model are separately and publicly verifiable.':'A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető.'}</p><a class="fx-reference-liveos" href="#experience">Live OS</a>`;hero.querySelector('.fx-reference-heading').after(card);card.querySelector('.fx-reference-liveos').addEventListener('click',()=>window.FormatXCoreMobileV67?.pulse?.(),{passive:true})}
 if(!hero.querySelector('.fx-reference-rail')){const rail=document.createElement('div');rail.className='fx-reference-rail';rail.innerHTML='<button class="fx-reference-ask" type="button" aria-label="Kérdezz"><i></i><span>KÉRDEZZ</span></button><button class="fx-reference-pause" type="button" aria-label="Animáció ki/be" data-paused="false">Ⅱ</button>';hero.appendChild(rail);rail.querySelector('.fx-reference-ask').addEventListener('click',()=>{if(window.FormatXOrganismVoice?.open)window.FormatXOrganismVoice.open();else document.querySelector('.fx-organism-thought-trigger')?.click();window.FormatXCoreMobileV67?.pulse?.()});let paused=false;rail.querySelector('.fx-reference-pause').addEventListener('click',e=>{paused=!paused;e.currentTarget.dataset.paused=String(paused);e.currentTarget.textContent=paused?'▶':'Ⅱ';root.dataset.fxReferenceMotionPaused=String(paused);dispatchEvent(new CustomEvent('formatx:referencepause',{detail:{paused}}));if(!paused)window.FormatXCoreMobileV67?.pulse?.()})}
 root.dataset.fxMobileReferenceLayout='ready-v1';return true;
}
style();
if(!create()){const mo=new MutationObserver(()=>{if(create())mo.disconnect()});mo.observe(document.documentElement,{subtree:true,childList:true})}
addEventListener('formatx:languagechange',()=>{const h=document.querySelector('.fx-reference-heading'),c=document.querySelector('.fx-reference-proof');if(h)h.textContent=root.lang==='en'?'DISCOVER HOW IT WORKS':'A MŰKÖDÉS MEGISMERÉSE';if(c){c.querySelector('h2').textContent=root.lang==='en'?'Proof behind the visual.':'Bizonyíték a látvány mögött.';c.querySelector('p').textContent=root.lang==='en'?'FormatX does not ask for blind trust: releases, tests, limitations and the security model are separately and publicly verifiable.':'A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető.';c.querySelector('.fx-reference-ask span')?.replaceChildren(root.lang==='en'?'ASK':'KÉRDEZZ')}});
}());