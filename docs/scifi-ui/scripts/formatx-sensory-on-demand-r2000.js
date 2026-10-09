/* R2000 — sensory module is a progressive, user-initiated enhancement.
   Do not spend the first-paint task budget parsing/initialising reactions that
   are not used yet. Navigation, controls and the MAG remain available immediately.
   No input is prevented, captured or replayed. */
(()=>{
 'use strict';
 const root=document.documentElement;
 if(root.dataset.fxSensoryLoaderR2000)return;
 // Identical progressive activation for visitors and browser measurements.
 root.dataset.fxSensoryLoaderR2000='armed';
 const events=['pointermove','pointerdown','touchstart','wheel','keydown','focusin','click','scroll'];
 let loading=false;
 const listenOptions={capture:false,passive:true};
 function cleanup(){
   for(const kind of events)window.removeEventListener(kind,load,listenOptions);
 }
 function load(){
   if(loading)return;
   loading=true;
   cleanup();
   root.dataset.fxSensoryLoaderR2000='loading';
   const script=document.createElement('script');
   script.src='/scifi-ui/scripts/formatx-site-sensory-r1755.js?v=20261009-r2058-parity-intent';
   script.async=true;
   script.dataset.fxSiteSensoryR1755='true';
   script.addEventListener('load',()=>{
     root.dataset.fxSensoryLoaderR2000='loaded';
   },{once:true});
   script.addEventListener('error',()=>{
     root.dataset.fxSensoryLoaderR2000='unavailable';
   },{once:true});
   (document.head||document.documentElement).appendChild(script);
 }
 for(const kind of events)window.addEventListener(kind,load,listenOptions);
})();
