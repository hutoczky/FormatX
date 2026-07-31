(function(){
'use strict';
const R=document.documentElement;
const L=()=>R.lang==='en'?'en':'hu';
function bi(e,hu,en){if(!e)return;e.dataset.hu=hu;e.dataset.en=en;e.textContent=L()==='en'?en:hu}
function release(){return R.__FORMATX_RELEASE_METADATA__?.release||null}
function allowed(url){try{const u=new URL(url,location.origin);return u.origin===location.origin||(u.protocol==='https:'&&u.hostname==='github.com'&&u.pathname.startsWith('/hutoczky/FormatX-Updates/releases/download/'))}catch(_){return false}}
function apply(){
 const lead=document.querySelector('#hero .hero-lead');
 bi(lead,'A FormatX Suite Pro független fejlesztésű technikusi szoftver. Valós rendszerállapotot tár fel, műveleti tervet készít, csak kontrollált megerősítés után hajt végre, majd visszaellenőrzi az eredményt.','FormatX Suite Pro is independently developed technician software. It discovers real system state, builds an operation plan, executes only after controlled confirmation, then verifies the result.');
 const nav=[['#experience','Idegrendszer — Hogyan működik','Nervous system — How it works'],['#capabilities','Szervek — Funkciók és modulok','Organs — Functions and modules'],['#pricing','Kereskedelmi szív — Licencek és árak','Commerce heart — Licences and pricing'],['#system','Váz — Technológia és biztonság','Skeleton — Technology and safety'],['#resources','Jeladó — Letöltés és bizonyítékok','Beacon — Downloads and evidence']];
 nav.forEach(x=>document.querySelectorAll('#main-nav a[href="'+x[0]+'"]').forEach(e=>bi(e,x[1],x[2])));
 const a=document.getElementById('hero-download');
 if(a){const r=release(),asset=r?.channels?.windows,version=typeof r?.version==='string'?r.version.trim():'';const text=L()==='en'?(version?'Download Windows '+version+' public beta':'Download Windows public beta'):(version?'Windows '+version+' nyilvános béta letöltése':'Windows nyilvános béta letöltése');bi(a.querySelector('span')||a,text,text);a.dataset.releaseDownload='windows';a.removeAttribute('download');if(asset?.available===true&&allowed(asset.download_url)){a.href=asset.download_url;a.classList.remove('is-metadata-fallback')}else{a.href='/scifi-ui/downloads/';a.classList.add('is-metadata-fallback')}}
}
['formatx:languagechange','formatx:platformstatusready','formatx:organisminterfaceready','formatx:releasemetadataready'].forEach(n=>addEventListener(n,apply));
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',apply,{once:true}):apply();
setTimeout(apply,1200);setTimeout(apply,3600);
}());
