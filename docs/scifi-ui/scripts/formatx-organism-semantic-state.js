(function(){
'use strict';
const R=document.documentElement;
const S=[
 {id:'hero',organ:'core',method:'discover',source:'current-release.json',hu:'Mag — termékazonosság, kiadás és belépési pont',en:'Core — product identity, release and entry point'},
 {id:'experience',organ:'nervous-system',method:'plan',source:'workflow-cases.json',hu:'Idegrendszer — felderítés és döntési útvonal',en:'Nervous system — discovery and decision path'},
 {id:'capabilities',organ:'system-organs',method:'plan',source:'platform-status.json',hu:'Szervek — technikusi funkciók és modulok',en:'Organs — technician functions and modules'},
 {id:'pricing',organ:'commerce-heart',method:'controlled-execution',source:'license.html',hu:'Kereskedelmi szív — licenc, hozzáférés és projektfenntartás',en:'Commerce heart — licence, access and project continuity'},
 {id:'system',organ:'safety-skeleton',method:'controlled-execution',source:'security.html',hu:'Váz — biztonsági modell és technikai architektúra',en:'Skeleton — security model and technical architecture'},
 {id:'resources',organ:'release-beacon',method:'verify',source:'verification.html',hu:'Jeladó — letöltések, kiadások és bizonyítékok',en:'Beacon — downloads, releases and evidence'}
];
const L=()=>R.lang==='en'?'en':'hu';
function apply(scene){const n=Math.max(0,Math.min(5,Number(scene)||0)),s=S[n];R.dataset.fxOrganismSemantic=s.organ;R.dataset.fxMethodStep=s.method;R.dataset.fxOrganismDataSource=s.source;const status=document.querySelector('.fx-organism-status');if(status){status.setAttribute('aria-label',s[L()]);const small=status.querySelector('small');if(small)small.textContent=s[L()]}
dispatchEvent(new CustomEvent('formatx:organismsemanticstate',{detail:{scene:n,...s,label:s[L()]}}))}
addEventListener('formatx:organismstatechange',e=>apply(e.detail?.scene));addEventListener('formatx:languagechange',()=>apply(R.dataset.fxScene));document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>apply(R.dataset.fxScene),{once:true}):apply(R.dataset.fxScene);
}());
