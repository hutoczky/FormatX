/* FormatX R2100 — lazy code path for below-the-fold cinematic archive.
   The native 10s MAG and permanent R326 renderer remain untouched. The
   original 73KB archive module executes on proximity, user navigation,
   post-paint idle or once the cinematic intro has handed off. */
(function(){
  'use strict';
  const root=document.documentElement;
  if(root.dataset.fxArchiveLoaderR2100)return;
  root.dataset.fxArchiveLoaderR2100='armed';
  const params=new URLSearchParams(location.search);
  const eager=params.has('archive')||params.has('r486-optics-energy-check')
    ||params.has('mobileproof')||params.has('organism-validation');
  const original='/scifi-ui/scripts/formatx-cinematic-archive-r1987.js?v=20261013-r2059-keyboard-focus';
  const target=document.getElementById('experience');
  let started=false,observer=null,timeout=0;
  const unbind=()=>{
    observer?.disconnect();
    observer=null;
    clearTimeout(timeout);
    removeEventListener('scroll',checkViewport);
    removeEventListener('hashchange',checkHash);
    document.removeEventListener('formatx:magbirthcomplete',onFilmDone);
    removeEventListener('pageshow',onPageshow);
  };
  const start=reason=>{
    if(started)return;
    started=true;
    unbind();
    root.dataset.fxArchiveLoaderR2100='loading-'+reason;
    const script=document.createElement('script');
    script.src=original;
    script.async=true;
    script.dataset.fxCinematicArchiveR1987='true';
    script.dataset.fxArchiveModuleR2100='true';
    script.addEventListener('load',()=>{
      root.dataset.fxArchiveLoaderR2100='loaded-'+reason;
    },{once:true});
    script.addEventListener('error',()=>{
      root.dataset.fxArchiveLoaderR2100='failed';
      console.error('FormatX cinematic archive module could not be loaded');
    },{once:true});
    document.head.appendChild(script);
  };
  function checkHash(){
    if(location.hash&&location.hash!=='#top'&&location.hash!=='#hero')
      start('direct-section-navigation');
  }
  function checkViewport(){
    if(!target)return;
    const rect=target.getBoundingClientRect();
    if(rect.top<innerHeight+80&&rect.bottom>-80)
      start('near-archive-viewport');
  }
  function onFilmDone(){start('native-mag-handoff');}
  function onPageshow(){checkViewport();}
  const arm=()=>{
    if(eager){
      start('explicit-cinematic-request');
      return;
    }
    const filmActive=root.dataset.fxMagBirthOwnerR533==='active'
      ||root.dataset.fxIntroPrepaintR1611==='show';
    if(filmActive){
      document.addEventListener('formatx:magbirthcomplete',onFilmDone,{once:true});
      timeout=setTimeout(()=>start('film-watchdog'),14500);
      return;
    }
    if(location.hash&&location.hash!=='#top'&&location.hash!=='#hero'){
      start('direct-section-navigation');
      return;
    }
    if(target&&'IntersectionObserver'in window){
      observer=new IntersectionObserver(entries=>{
        if(entries.some(entry=>entry.isIntersecting))
          start('near-archive-viewport');
      },{rootMargin:'80px 0px',threshold:0});
      observer.observe(target);
    }
    addEventListener('scroll',checkViewport,{passive:true});
    addEventListener('hashchange',checkHash,{passive:true});
    addEventListener('pageshow',onPageshow,{passive:true});
    timeout=setTimeout(()=>start('post-first-paint-idle'),3200);
    checkViewport();
  };
  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',arm,{once:true});
  else arm();
})();