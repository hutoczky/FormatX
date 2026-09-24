(()=>{'use strict';
const root=document.documentElement;
const hero=document.getElementById('hero');
if(!(hero instanceof HTMLElement))return;
let world=hero.querySelector(':scope > .fx-r1724-world');
if(!(world instanceof HTMLElement)){
  world=document.createElement('div');
  world.className='fx-r1724-world';
  world.setAttribute('aria-hidden','true');
  hero.prepend(world);
}
let x=0,y=0,energy=.72,breath=.20,pending=0;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function paint(){
  pending=0;
  world.style.setProperty('--fx-r1724-x',x.toFixed(3));
  world.style.setProperty('--fx-r1724-y',y.toFixed(3));
  world.style.setProperty('--fx-r1724-energy',energy.toFixed(3));
  world.style.setProperty('--fx-r1724-breath',breath.toFixed(3));
}
function schedule(){if(!pending)pending=requestAnimationFrame(paint);}
function point(clientX,clientY){
  const r=hero.getBoundingClientRect();
  if(!r.width||!r.height)return;
  x=clamp(((clientX-r.left)/r.width-.5)*2,-1,1);
  y=clamp(((clientY-r.top)/r.height-.5)*2,-1,1);
  energy=Math.max(energy,.74);
  breath=Math.max(breath,.26);
  schedule();
}
addEventListener('pointermove',e=>point(e.clientX,e.clientY),{passive:true});
addEventListener('pointerdown',e=>{point(e.clientX,e.clientY);energy=.98;breath=.72;schedule();},{passive:true});
addEventListener('pointerup',()=>{energy=Math.max(.76,energy*.88);breath=Math.max(.28,breath*.72);schedule();},{passive:true});
addEventListener('touchmove',e=>{const t=e.touches&&e.touches[0];if(t)point(t.clientX,t.clientY);},{passive:true});
addEventListener('scroll',()=>{
  const r=hero.getBoundingClientRect();
  const p=clamp(-r.top/Math.max(innerHeight,1),0,1);
  world.style.setProperty('--fx-r1724-scroll',p.toFixed(3));
  y=clamp(y-p*.12,-1,1);
  schedule();
},{passive:true});
addEventListener('formatx:organismphysiology',e=>{
  const d=e.detail||{};
  if(Number.isFinite(Number(d.energy)))energy=clamp(Number(d.energy),.12,1.2);
  if(Number.isFinite(Number(d.breath)))breath=clamp(Number(d.breath),.04,1.2);
  if(Number.isFinite(Number(d.x)))x=clamp(Number(d.x),-1,1);
  if(Number.isFinite(Number(d.y)))y=clamp(Number(d.y),-1,1);
  world.dataset.fxPhysiology=String(d.kind||'stimulus');
  schedule();
},{passive:true});
addEventListener('formatx:organismresponse',()=>{energy=1;breath=.82;schedule();},{passive:true});
addEventListener('formatx:open-live-os',()=>{energy=.88;breath=.48;schedule();},{passive:true});
addEventListener('formatx:languagechange',()=>{energy=.82;breath=.42;schedule();},{passive:true});
addEventListener('formatx:menustatechange',e=>{energy=e.detail?.open?.90:.68;breath=e.detail?.open?.50:.22;schedule();},{passive:true});
addEventListener('resize',schedule,{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();},{passive:true});
root.dataset.fxR1724World='ready';
root.dataset.fxR1724Creature='white-black-biomechanical-blue-gold-quadruped';
root.dataset.fxR1724Interaction='event-driven-pointer-touch-scroll-physiology-zero-idle';
paint();
})();