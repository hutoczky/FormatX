'use strict';

let timer=0,pulse=0;
function stop(){
  if(timer)clearTimeout(timer);
  if(pulse)clearInterval(pulse);
  timer=0;pulse=0;
}
self.onmessage=event=>{
  const data=event.data||{};
  if(data.type==='cancel'){stop();return;}
  if(data.type!=='arm')return;
  stop();
  const delay=Math.max(0,Number(data.delay)||0);
  const token=String(data.token||'');
  const emit=()=>self.postMessage({type:'release',token});
  timer=setTimeout(()=>{
    timer=0;
    emit();
    pulse=setInterval(emit,16);
  },delay);
};
