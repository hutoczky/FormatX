(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxCoreTouchPulseR98==='ready')return;
const hero=document.getElementById('hero');
if(!hero){root.dataset.fxCoreTouchPulseR98='host-unavailable';return;}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function detail(touch,phase){
  const rect=hero.getBoundingClientRect();
  return {
    x:clamp(((touch.clientX-rect.left)/Math.max(1,rect.width)-.5)*2,-1,1),
    y:clamp(((touch.clientY-rect.top)/Math.max(1,rect.height)-.5)*2,-1,1),
    phase
  };
}
function send(touch,phase){
  if(!touch)return;
  window.dispatchEvent(new CustomEvent('formatx:coreinteraction',{detail:detail(touch,phase)}));
}
hero.addEventListener('touchstart',event=>send(event.touches?.[0]||event.changedTouches?.[0],'press'),{passive:true});
hero.addEventListener('touchmove',event=>send(event.touches?.[0]||event.changedTouches?.[0],'drag'),{passive:true});
hero.addEventListener('touchend',event=>{
  send(event.changedTouches?.[0],'tap');
  setTimeout(()=>window.FormatXCoreMobileV69?.pulse?.(),0);
},{passive:true});
hero.addEventListener('touchcancel',event=>send(event.changedTouches?.[0],'cancel'),{passive:true});
root.dataset.fxCoreTouchPulseR98='ready';
}());
