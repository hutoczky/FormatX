/* FormatX R1755 — sitewide sensory coordinator.
   No continuous idle RAF. Input is coalesced to at most one animation frame and
   the existing living-core renderer remains the sole WebGL owner. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxSiteSensoryR1755==='ready'||root.dataset.fxSiteSensoryR1755==='booting')return;
root.dataset.fxSiteSensoryR1755='booting';

const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const coarse=matchMedia('(max-width:900px),(pointer:coarse)');
const STYLE='/scifi-ui/styles/formatx-site-sensory-r1755.css?v=20260927-r1755-photoreal-60fps';
let field=null,raf=0,actionTimer=0,scrollSettleTimer=0,lastX=innerWidth*.5,lastY=innerHeight*.38,lastScroll=scrollY||0;
const state={x:0,y:.12,vx:0,vy:0,energy:.18,press:0,scroll:0};

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function ensureStyle(){
  if(document.querySelector('link[data-fx-site-sensory-r1755]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';link.href=STYLE;link.dataset.fxSiteSensoryR1755='true';
  document.head.appendChild(link);
}
function ensureField(){
  if(field?.isConnected)return field;
  field=document.querySelector('.fx-site-sensory-field-r1755');
  if(!field){
    field=document.createElement('div');
    field.className='fx-site-sensory-field-r1755';
    field.setAttribute('aria-hidden','true');
    document.body.appendChild(field);
  }
  return field;
}
function setVar(name,value){
  const node=ensureField();
  if(node.style.getPropertyValue(name)!==value)node.style.setProperty(name,value);
}
function commit(){
  raf=0;
  if(reduced.matches){
    state.energy=Math.min(state.energy,.20);
    state.press=0;
  }
  /* R1755b: keep pointer/scroll reaction on compositor properties only.
     Moving gradient focal points forces rasterization; translate the already
     rasterized field instead and preserve the same spatial response. */
  const dx=(state.x*(coarse.matches?4.5:9.0)+state.vx*(coarse.matches?1.0:1.8)).toFixed(2)+'px';
  const dy=(-state.y*(coarse.matches?3.5:7.0)+state.scroll*(coarse.matches?1.5:3.0)+state.vy*.8).toFixed(2)+'px';
  setVar('--fx-sense-dx',dx);
  setVar('--fx-sense-dy',dy);
  setVar('--fx-sense-energy',clamp(state.energy,0,1).toFixed(3));
  setVar('--fx-sense-press',clamp(state.press,0,1).toFixed(3));
}
function queue(){
  if(raf)return;
  raf=requestAnimationFrame(commit);
}
function point(clientX,clientY,strength=.22){
  const x=clamp((clientX/Math.max(1,innerWidth)-.5)*2,-1,1);
  const y=clamp(-((clientY/Math.max(1,innerHeight)-.5)*2),-1,1);
  const dx=clamp((clientX-lastX)/42,-1,1);
  const dy=clamp((clientY-lastY)/42,-1,1);
  lastX=clientX;lastY=clientY;
  state.vx=state.vx*.45+dx*.55;
  state.vy=state.vy*.45+dy*.55;
  state.x=x;state.y=y;
  state.energy=Math.max(state.energy,strength+Math.min(.20,Math.hypot(dx,dy)*.12));
  queue();
}
function pulse(kind='action',energy=.68){
  state.energy=Math.max(state.energy,energy);
  root.dataset.fxSensoryActionR1755='true';
  root.dataset.fxSensoryKindR1755=String(kind);
  clearTimeout(actionTimer);
  actionTimer=setTimeout(()=>{
    root.dataset.fxSensoryActionR1755='false';
    state.energy=reduced.matches ? .14 : .20;
    state.press=0;
    queue();
  },210);
  queue();
}
function onPointerMove(event){
  const batch=typeof event.getCoalescedEvents==='function'?event.getCoalescedEvents():null;
  const sample=batch?.length?batch[batch.length-1]:event;
  point(Number(sample.clientX)||innerWidth*.5,Number(sample.clientY)||innerHeight*.4,event.pointerType==='touch' ? .28 : .22);
}
function onPointerDown(event){
  state.press=1;
  point(Number(event.clientX)||innerWidth*.5,Number(event.clientY)||innerHeight*.4,.86);
  pulse('press',.86);
}
function onPointerUp(event){
  state.press=0;
  point(Number(event.clientX)||innerWidth*.5,Number(event.clientY)||innerHeight*.4,.42);
  queue();
}
function onScroll(){
  const current=scrollY||0;
  const delta=clamp((current-lastScroll)/140,-1,1);
  lastScroll=current;
  const range=Math.max(1,document.documentElement.scrollHeight-innerHeight);
  state.scroll=clamp(current/range,0,1);
  state.vy=state.vy*.5+delta*.5;
  state.energy=Math.max(state.energy,.24+Math.abs(delta)*.18);
  /* R1755c: the canonical MAG already consumes scroll as a physical stimulus.
     Do not schedule a second visual frame here. Pause non-essential atmosphere
     while scroll is hot, then restore it after the gesture settles. */
  if(root.dataset.fxScrollPressureR1755!=='true')root.dataset.fxScrollPressureR1755='true';
  clearTimeout(scrollSettleTimer);
  scrollSettleTimer=setTimeout(()=>{
    root.dataset.fxScrollPressureR1755='false';
    state.energy=Math.max(.18,state.energy*.72);
    queue();
  },120);
}
function semantic(kind,energy){
  pulse(kind,energy);
}
function onFocus(event){
  if(event.target instanceof Element&&event.target.matches('a,button,input,select,textarea,[tabindex]'))semantic('focus',.54);
}
function onClick(event){
  if(!(event.target instanceof Element))return;
  const action=event.target.closest('a,button,[role="button"],input,select,textarea,label');
  if(action)semantic('action',action.matches('a[href*="download"],[data-release-download]') ? .90 : .66);
}
function onInput(){semantic('input',.48);}
function onChange(){semantic('change',.62);}
function onSubmit(){semantic('submit',.92);}
function onKey(event){if(!event.repeat)semantic('key',(event.key==='Enter'||event.key===' ') ? .62 : .42);}
function onOrientation(event){
  if(reduced.matches)return;
  const gamma=Number(event.gamma),beta=Number(event.beta);
  if(!Number.isFinite(gamma)||!Number.isFinite(beta))return;
  state.x=clamp(gamma/45,-1,1)*.34;
  state.y=clamp((beta-38)/55,-1,1)*.26;
  state.energy=Math.max(state.energy,.24);
  queue();
}

ensureStyle();
ensureField();
root.dataset.fxSiteSensoryR1755='ready';
root.dataset.fxSiteSensorySchedulerR1755='single-coalesced-raf-zero-idle';
root.dataset.fxSiteSensoryBudgetR1755='16.67ms-target-no-extra-webgl-transform-opacity-only-scroll-atmosphere-shed';
root.dataset.fxSiteSensoryInputR1755='pointer-touch-scroll-wheel-key-focus-click-input-change-submit-orientation';

addEventListener('pointermove',onPointerMove,{passive:true});
addEventListener('pointerdown',onPointerDown,{passive:true});
addEventListener('pointerup',onPointerUp,{passive:true});
addEventListener('pointercancel',onPointerUp,{passive:true});
addEventListener('scroll',onScroll,{passive:true});
addEventListener('wheel',()=>semantic('wheel',.38),{passive:true});
addEventListener('keydown',onKey,{passive:true});
addEventListener('deviceorientation',onOrientation,{passive:true});
document.addEventListener('focusin',onFocus,{passive:true});
document.addEventListener('click',onClick,{passive:true});
document.addEventListener('input',onInput,{passive:true});
document.addEventListener('change',onChange,{passive:true});
document.addEventListener('submit',onSubmit,{passive:true});
reduced.addEventListener?.('change',()=>{state.energy=.14;state.press=0;queue();},{passive:true});

const sections=[...document.querySelectorAll('main > section[id],main section.scene[id]')];
if('IntersectionObserver'in window&&sections.length){
  const observer=new IntersectionObserver(entries=>{
    const hit=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    const id=hit?.target?.id;
    if(!id)return;
    root.dataset.fxSensoryOrganR1755=id;
    semantic('section-'+id,.34);
  },{rootMargin:'-24% 0px -56% 0px',threshold:[0,.2,.45,.7]});
  sections.forEach(section=>observer.observe(section));
}
queue();
}());
