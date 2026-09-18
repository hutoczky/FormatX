'use strict';

/* FormatX R852 — independent desktop preloader release clock.
   The canonical Event Horizon runtime remains the only release/finalize owner.
   This worker only emits one absolute-time signal so renderer/raster work cannot
   starve the main-thread delay queue past the existing 1350–1650 ms contract. */
let timer=0;
let token='r852';

function cancel(){
  if(timer) clearTimeout(timer);
  timer=0;
}

self.onmessage=event=>{
  const data=event.data||{};
  if(data.type==='cancel'){
    cancel();
    return;
  }
  if(data.type!=='arm') return;
  cancel();
  token=String(data.token||'r852');
  const targetEpoch=Number(data.targetEpoch);
  const delay=Number.isFinite(targetEpoch)?Math.max(0,targetEpoch-Date.now()):0;
  timer=setTimeout(()=>{
    timer=0;
    self.postMessage({type:'release',token,at:Date.now()});
  },delay);
};
