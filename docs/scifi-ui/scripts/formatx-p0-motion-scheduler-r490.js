/* FormatX R490 — post-first-paint motion/MAG scheduler.
   Keeps the readable hero off the heavy R326/WebGL startup critical path while
   preserving the exact canonical motion runtime and all user-triggered features. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxP0MotionSchedulerR490)return;
root.dataset.fxP0MotionSchedulerR490='armed';
const SRC='/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js?v=20260831-r484-periodic-native-energy';
let started=false;
let idleId=0;
let timer=0;

function clearPending(){
  if(timer){clearTimeout(timer);timer=0;}
  if(idleId&&'cancelIdleCallback' in window){cancelIdleCallback(idleId);idleId=0;}
}

function start(reason){
  if(started)return;
  started=true;
  clearPending();
  root.dataset.fxP0MotionSchedulerR490=`starting:${reason}`;
  if(document.querySelector('script[src*="formatx-motion-runtime-loader-r239.js"]')){
    root.dataset.fxP0MotionSchedulerR490='runtime-already-present';
    return;
  }
  const script=document.createElement('script');
  script.src=SRC;
  script.async=false;
  script.dataset.fxMotionRuntimeLoaderR239='true';
  script.dataset.fxP0PostPaintR490='true';
  script.addEventListener('load',()=>{root.dataset.fxP0MotionSchedulerR490=`loaded:${reason}`;},{once:true});
  script.addEventListener('error',()=>{root.dataset.fxP0MotionSchedulerR490='load-failed';},{once:true});
  document.head.appendChild(script);
}

function afterFirstPaint(){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    root.dataset.fxP0FirstPaintR490='committed';
    if('requestIdleCallback' in window){
      idleId=requestIdleCallback(()=>start('idle-after-first-paint'),{timeout:700});
    }else{
      timer=setTimeout(()=>start('timer-after-first-paint'),320);
    }
  }));
}

function onIntent(){start('user-intent');}
for(const type of ['pointerdown','touchstart','keydown'])addEventListener(type,onIntent,{once:true,passive:true});

if(document.readyState==='loading')addEventListener('DOMContentLoaded',afterFirstPaint,{once:true,passive:true});
else afterFirstPaint();
}());
