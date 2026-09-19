'use strict';

let timer=0;
self.onmessage=event=>{
  const data=event.data||{};
  if(data.type==='cancel'){
    if(timer)clearTimeout(timer);
    timer=0;
    return;
  }
  if(data.type!=='arm')return;
  if(timer)clearTimeout(timer);
  const delay=Math.max(0,Number(data.delay)||0);
  const token=String(data.token||'');
  timer=setTimeout(()=>{
    timer=0;
    self.postMessage({type:'release',token});
  },delay);
};
