/* FormatX R841 — monotonic preloader release clock.
   This worker owns no DOM or lifecycle state. It only publishes a same-origin
   timing signal so the Event Horizon single finalizer is not dependent on
   renderer-throttled main-thread timers. */
'use strict';

self.onmessage=event=>{
  const targetEpoch=Number(event?.data?.targetEpoch||0);
  if(!Number.isFinite(targetEpoch)||targetEpoch<=0)return;
  const fire=()=>self.postMessage({type:'release-tick',at:Date.now()});
  const delay=Math.max(0,targetEpoch-Date.now());
  setTimeout(fire,delay);
};
