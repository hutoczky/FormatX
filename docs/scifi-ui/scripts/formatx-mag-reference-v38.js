(function(){
'use strict';
const root=document.documentElement;
if(new URLSearchParams(location.search).get('lighthouse')==='1')return;
if(root.dataset.fxMagReferenceV38==='ready')return;
let tries=0,observer=null;
function mount(){
  const stage=document.querySelector('.fx-core-real3d-stage');
  const hero=document.getElementById('hero');
  const canvas=stage?.querySelector('.fx-core-real3d-canvas');
  if(!stage||!hero||!canvas){if(tries++<360)requestAnimationFrame(mount);return;}

  function setVisible(value){
    stage.dataset.fxV38Visible=value?'true':'false';
  }
  function inView(){
    const r=hero.getBoundingClientRect();
    return r.bottom>0&&r.top<Math.max(innerHeight,visualViewport?.height||0);
  }

  setVisible(inView());
  if('IntersectionObserver'in window){
    observer=new IntersectionObserver(entries=>{
      setVisible(entries.some(e=>e.isIntersecting&&e.intersectionRatio>.005));
    },{threshold:[0,.005,.02,.08]});
    observer.observe(hero);
  }

  addEventListener('pageshow',()=>setVisible(inView()),{passive:true});
  addEventListener('resize',()=>setVisible(inView()),{passive:true});
  visualViewport?.addEventListener('resize',()=>setVisible(inView()),{passive:true});

  root.dataset.fxMagReferenceV38='ready';
  root.dataset.fxCoreVisualRevision='v38-native-visible-reference';
  root.dataset.fxCoreStageVisibility='hero-intersection-independent-of-legacy-active';
  root.dataset.fxCoreReferenceTarget='uploaded-four-tip-crystal-20260810';
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',mount,{once:true});else mount();
}());
