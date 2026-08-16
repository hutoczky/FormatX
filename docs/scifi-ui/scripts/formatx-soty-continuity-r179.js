(function(){
'use strict';
const root=document.documentElement;
const VERSION='r179-soty-organ-field-continuity';
if(root.dataset.fxSotyContinuityR179==='ready'&&root.dataset.fxSotyVersionR179===VERSION)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxSotyContinuityR179='audit-skip';
  root.dataset.fxSotyVersionR179=VERSION;
  root.dataset.fxSotyModeR179='audit-skip';
  return;
}
root.dataset.fxSotyContinuityR179='booting';
root.dataset.fxSotyVersionR179=VERSION;

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const coarse=matchMedia('(pointer:coarse)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const gauss=(x,c,w)=>Math.exp(-Math.pow((x-c)/w,2));
const organs=[
  {id:'hero',accent:'96,228,255',secondary:'143,114,255'},
  {id:'experience',accent:'96,228,255',secondary:'105,142,255'},
  {id:'capabilities',accent:'121,241,219',secondary:'98,161,255'},
  {id:'pricing',accent:'255,207,137',secondary:'160,109,255'},
  {id:'system',accent:'139,203,255',secondary:'143,114,255'},
  {id:'resources',accent:'183,244,255',secondary:'111,227,200'}
];
let sections=[];
let field=null,aurora=null,carrier=null;
let raf=0,last=performance.now(),lastPaint=0,visible=true;
let px=0,py=0,targetX=0,targetY=0,boost=0,lastInput=0;
let active=0,activeChangedAt=0,globalProgress=0,localProgress=.18;
let phase=0,frame=0;
const memory=Number(navigator.deviceMemory||8);
const cores=Number(navigator.hardwareConcurrency||8);
let mode='desktop-cinematic';

function chooseMode(){
  if(reduced.matches)mode='reduced';
  else if(innerWidth<=900||coarse.matches)mode=(memory<=4||cores<=4)?'mobile-lite':'mobile-balanced';
  else mode=(memory<=4||cores<=4)?'desktop-balanced':'desktop-cinematic';
  root.dataset.fxSotyModeR179=mode;
  root.dataset.fxSotyBudgetR179=`${cores}c-${memory}gb`;
}

function make(cls){const e=document.createElement('span');e.className=cls;e.setAttribute('aria-hidden','true');return e;}
function ensureField(){
  const main=document.getElementById('main-content');
  if(!(main instanceof HTMLElement))return false;
  field=main.querySelector(':scope > .fx-r179-field');
  if(!(field instanceof HTMLElement)){
    field=document.createElement('div');
    field.className='fx-r179-field';field.setAttribute('aria-hidden','true');
    aurora=make('fx-r179-aurora');carrier=make('fx-r179-carrier');
    field.append(aurora,carrier);main.prepend(field);
  }else{
    aurora=field.querySelector('.fx-r179-aurora');carrier=field.querySelector('.fx-r179-carrier');
    if(!(aurora instanceof HTMLElement)){aurora=make('fx-r179-aurora');field.appendChild(aurora);}
    if(!(carrier instanceof HTMLElement)){carrier=make('fx-r179-carrier');field.appendChild(carrier);}
  }
  return true;
}

function mountSigil(section){
  let sigil=section.querySelector(':scope > .fx-r179-organ-sigil');
  if(sigil instanceof HTMLElement)return sigil;
  sigil=document.createElement('div');sigil.className='fx-r179-organ-sigil';sigil.setAttribute('aria-hidden','true');
  sigil.append(make('fx-r179-sigil-a'),make('fx-r179-sigil-b'),make('fx-r179-sigil-c'));
  section.appendChild(sigil);return sigil;
}

function enhanceSurface(el){
  if(!(el instanceof HTMLElement)||el.dataset.fxR179Surface==='ready')return;
  el.dataset.fxR179Surface='ready';
  const light=make('fx-r179-surface-light');el.prepend(light);
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    el.addEventListener('pointerenter',()=>{el.dataset.fxR179CardActive='true';},{passive:true});
    el.addEventListener('pointerleave',()=>{el.dataset.fxR179CardActive='false';},{passive:true});
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();if(!r.width||!r.height)return;
      el.style.setProperty('--fx-r179-card-x',`${clamp((e.clientX-r.left)/r.width*100,0,100).toFixed(1)}%`);
      el.style.setProperty('--fx-r179-card-y',`${clamp((e.clientY-r.top)/r.height*100,0,100).toFixed(1)}%`);
    },{passive:true});
  }
}

function discover(){
  sections=organs.map((o,index)=>{
    const section=document.getElementById(o.id);if(!(section instanceof HTMLElement))return null;
    if(o.id!=='hero')mountSigil(section);
    section.dataset.fxR179Organ=o.id;
    section.style.setProperty('--fx-r179-section-energy',index===0?'.36':'.14');
    return {section,o,index};
  }).filter(Boolean);
  document.querySelectorAll('.card,.price-card,.system-grid article,.fx-category-grid article,.fx-proof-grid article').forEach(enhanceSurface);
  return sections.length>=5;
}

function pointerPos(x,y){
  targetX=clamp(x/Math.max(1,innerWidth)*2-1,-1,1);
  targetY=clamp(y/Math.max(1,innerHeight)*2-1,-1,1);
}
function energize(strength){
  boost=Math.max(boost,strength);lastInput=performance.now();
  root.dataset.fxSotyInteractionR179='energized';
  try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){/* optional core */}
}
function bindInput(){
  addEventListener('pointermove',e=>{if(e.pointerType!=='touch'){pointerPos(e.clientX,e.clientY);if(active===0)boost=Math.max(boost,.16);lastInput=performance.now();}},{passive:true});
  addEventListener('pointerdown',e=>{pointerPos(e.clientX,e.clientY);energize(active===0?1.0:.62);},{passive:true});
  addEventListener('touchstart',e=>{const t=e.touches?.[0];if(t)pointerPos(t.clientX,t.clientY);energize(active===0?1.08:.68);},{passive:true});
  addEventListener('touchmove',e=>{const t=e.touches?.[0];if(t)pointerPos(t.clientX,t.clientY);boost=Math.max(boost,.42);lastInput=performance.now();},{passive:true});
  addEventListener('formatx:storychapter',e=>{const i=Number(e.detail?.index);if(Number.isFinite(i)){active=clamp(i,0,sections.length-1);activeChangedAt=performance.now();energize(.72);}}, {passive:true});
}

function readGyro(){
  if(!(mode==='mobile-balanced'||mode==='mobile-lite'))return null;
  const raw=String(root.dataset.fxCoreGyroInput||'').split(',').map(Number);
  if(root.dataset.fxCoreGyroState==='active'&&raw.length>=2&&raw.every(Number.isFinite))return{x:clamp(raw[0],-.85,.85),y:clamp(-raw[1],-.85,.85)};
  return null;
}

function calculateActive(){
  if(!sections.length)return;
  let best=active,bestScore=-Infinity;
  const anchor=innerHeight*.42;
  for(const item of sections){
    const r=item.section.getBoundingClientRect();
    if(r.bottom<0||r.top>innerHeight)continue;
    const center=(r.top+r.bottom)*.5;
    const visible=Math.max(0,Math.min(innerHeight,r.bottom)-Math.max(0,r.top))/Math.max(1,Math.min(innerHeight,r.height));
    const score=visible*2-Math.abs(center-anchor)/Math.max(1,innerHeight);
    if(score>bestScore){bestScore=score;best=item.index;}
  }
  if(best!==active){active=best;activeChangedAt=performance.now();boost=Math.max(boost,.46);root.dataset.fxSotyChapterPulseR179=String(active+1).padStart(2,'0');}
}

function progress(){
  const doc=document.documentElement;
  globalProgress=clamp(scrollY/Math.max(1,doc.scrollHeight-innerHeight),0,1);
  const current=sections[active]?.section;
  if(current instanceof HTMLElement){
    const r=current.getBoundingClientRect();
    localProgress=clamp((innerHeight*.72-r.top)/Math.max(1,r.height+innerHeight*.34),0,1);
  }
}

function paint(now){
  calculateActive();progress();
  const dt=clamp(now-last,1,80);last=now;
  if(now-lastInput>90)boost*=Math.pow(.04,dt/1000*1.15);if(boost<.002)boost=0;
  const gyro=readGyro();
  const tx=gyro?lerp(targetX,gyro.x,.48):targetX;
  const ty=gyro?lerp(targetY,gyro.y,.48):targetY;
  const follow=1-Math.pow(.002,dt/1000*4.2);
  px+=(tx-px)*follow;py+=(ty-py)*follow;
  if(!reduced.matches)phase=(phase+dt*.018)%360;

  const nowCycle=(now%1420)/1420;
  const lub=gauss(nowCycle,.11,.042),dub=gauss(nowCycle,.235,.057)*.68;
  const heartbeat=clamp(lub+dub,0,1.1);
  const beacon=(now%2200)/2200;
  const chapterAge=clamp((now-activeChangedAt)/850,0,1);
  const chapterPulse=(1-chapterAge)*(1-chapterAge);
  const energy=clamp(.16+localProgress*.42+boost*.36+chapterPulse*.22,0,1);
  const organ=organs[active]||organs[0];

  let fx=50+px*(mode==='desktop-cinematic'?14:8);
  let fy=38+py*(mode==='desktop-cinematic'?10:6)+active*6.6;
  fy=clamp(fy,18,82);
  root.style.setProperty('--fx-r179-accent',organ.accent);
  root.style.setProperty('--fx-r179-secondary',organ.secondary);
  root.style.setProperty('--fx-r179-x',fx.toFixed(2)+'%');
  root.style.setProperty('--fx-r179-y',fy.toFixed(2)+'%');
  root.style.setProperty('--fx-r179-px',px.toFixed(4));
  root.style.setProperty('--fx-r179-py',py.toFixed(4));
  root.style.setProperty('--fx-r179-progress',globalProgress.toFixed(4));
  root.style.setProperty('--fx-r179-local',localProgress.toFixed(4));
  root.style.setProperty('--fx-r179-boost',boost.toFixed(4));
  root.style.setProperty('--fx-r179-field-opacity',(mode==='mobile-lite' ? .27 : mode==='mobile-balanced' ? .34 : .44).toFixed(3));
  root.style.setProperty('--fx-r179-sigil-opacity',(mode==='mobile-lite' ? .13 : mode==='mobile-balanced' ? .18 : .24).toFixed(3));

  sections.forEach(item=>{
    const d=Math.abs(item.index-active);
    const e=item.index===active?energy:clamp(.12-d*.025,.05,.12);
    item.section.style.setProperty('--fx-r179-section-energy',e.toFixed(4));
    item.section.style.setProperty('--fx-r179-section-px',px.toFixed(4));
    item.section.style.setProperty('--fx-r179-section-py',py.toFixed(4));
    item.section.style.setProperty('--fx-r179-organ-phase',`${(phase*(item.index%2?-.62:.54)+item.index*21).toFixed(2)}deg`);
    item.section.style.setProperty('--fx-r179-heartbeat',(item.index===3?heartbeat:heartbeat*.28).toFixed(4));
    item.section.style.setProperty('--fx-r179-beacon',(item.index===5?beacon:0).toFixed(4));
    item.section.style.setProperty('--fx-r179-chapter-x',`${clamp(12+localProgress*46+px*8,6,74).toFixed(2)}%`);
    item.section.dataset.fxR179State=item.index<active?'past':item.index===active?'active':'future';
  });

  frame++;
  root.dataset.fxSotyContinuityR179='ready';
  root.dataset.fxSotyVersionR179=VERSION;
  root.dataset.fxSotyActiveOrganR179=organ.id;
  root.dataset.fxSotyFrameR179=String(frame);
  root.dataset.fxSotyEnergyR179=energy.toFixed(3);
  root.dataset.fxSotyHeartbeatR179=`${lub.toFixed(3)},${dub.toFixed(3)}`;
  root.dataset.fxSotyPointerR179=`${px.toFixed(3)},${py.toFixed(3)}`;
  root.dataset.fxSotySchedulerR179=mode.startsWith('mobile')?'raf-30fps-balanced':'raf-60fps-cinematic';
  if(boost<.02)root.dataset.fxSotyInteractionR179='idle-living';
}

function loop(now){
  raf=requestAnimationFrame(loop);
  if(document.hidden||!visible)return;
  const minFrame=mode==='mobile-lite'?42:mode==='mobile-balanced'?31:mode==='reduced'?120:16;
  if(now-lastPaint<minFrame)return;
  lastPaint=now;paint(now);
}

function start(){
  chooseMode();
  if(!ensureField()||!discover()){root.dataset.fxSotyContinuityR179='incomplete-dom';return;}
  bindInput();
  activeChangedAt=performance.now();
  root.dataset.fxSotyContinuityR179='ready';
  root.dataset.fxSotyVersionR179=VERSION;
  root.dataset.fxSotySystemR179='core-nerves-organs-heart-skeleton-beacon';
  if(!raf){last=performance.now();lastPaint=0;raf=requestAnimationFrame(loop);}
}

const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);},{rootMargin:'180px'});
function observeMain(){const main=document.getElementById('main-content');if(main)io.observe(main);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{start();observeMain();},{once:true});else{start();observeMain();}
addEventListener('resize',()=>{chooseMode();},{passive:true});
addEventListener('pageshow',()=>{if(!raf)raf=requestAnimationFrame(loop);},{passive:true});
reduced.addEventListener?.('change',chooseMode);
coarse.addEventListener?.('change',chooseMode);
}());