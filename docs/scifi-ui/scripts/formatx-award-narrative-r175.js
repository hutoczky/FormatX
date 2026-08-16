(function(){
'use strict';
const root=document.documentElement;
const VERSION='r175-award-narrative-system';
if(root.dataset.fxAwardNarrativeR175===VERSION)return;
root.dataset.fxAwardNarrativeR175='booting';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const chapters=[
  {id:'hero',organ:'core',caption:'WAKE / SENSE / SIGNAL'},
  {id:'experience',organ:'nervous-system',caption:'SENSE / MAP / DECIDE'},
  {id:'capabilities',organ:'organs',caption:'ACT / VERIFY / REPORT'},
  {id:'pricing',organ:'commerce-heart',caption:'LICENSE / SCALE / CONTROL'},
  {id:'system',organ:'skeleton',caption:'TRUST / INTEGRITY / UPDATE'},
  {id:'resources',organ:'beacon',caption:'PROOF / SUPPORT / SIGNAL'}
];
let sections=[];
let activeIndex=0;
let scrollRaf=0;
let pulseTimer=0;
let previousActive=-1;

function discover(){
  sections=chapters.map((chapter,index)=>{
    const section=document.getElementById(chapter.id);
    if(!(section instanceof HTMLElement))return null;
    section.dataset.fxStoryIndex=String(index+1).padStart(2,'0');
    section.dataset.fxStoryOrgan=chapter.organ;
    const indexNode=section.querySelector('.section-heading .section-index');
    if(indexNode instanceof HTMLElement)indexNode.dataset.fxStoryCaption=chapter.caption;
    return {section,chapter,index};
  }).filter(Boolean);
  return sections.length>=5;
}

function pulse(index){
  if(reduced.matches)return;
  clearTimeout(pulseTimer);
  root.dataset.fxStoryPulseR175='on';
  root.dataset.fxStorySignalR175=`chapter-${index+1}`;
  try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){/* core is optional offscreen */}
  try{dispatchEvent(new CustomEvent('formatx:storychapter',{detail:{index,organ:chapters[index]?.organ||''}}));}catch(_){/* no-op */}
  pulseTimer=setTimeout(()=>{root.dataset.fxStoryPulseR175='off';},720);
}

function activate(index){
  index=clamp(index,0,Math.max(0,sections.length-1));
  if(index===activeIndex&&previousActive>=0)return;
  previousActive=activeIndex;
  activeIndex=index;
  root.dataset.fxActiveOrganR175=sections[index]?.chapter.organ||'core';
  root.dataset.fxActiveChapterR175=String(index+1).padStart(2,'0');
  for(const item of sections){
    item.section.dataset.fxStoryState=item.index<index?'past':item.index===index?'active':'future';
  }
  pulse(index);
}

function updateProgress(){
  scrollRaf=0;
  if(!sections.length)return;
  const doc=document.documentElement;
  const max=Math.max(1,doc.scrollHeight-innerHeight);
  const global=clamp(scrollY/max,0,1);
  root.style.setProperty('--fx-r175-story-progress',global.toFixed(4));
  root.style.setProperty('--fx-r175-story-x',(8+global*84).toFixed(2)+'%');

  const current=sections[activeIndex]?.section;
  if(current instanceof HTMLElement){
    const r=current.getBoundingClientRect();
    const denom=Math.max(1,r.height+innerHeight*.35);
    const local=clamp((innerHeight*.72-r.top)/denom,0,1);
    const energy=0.16+local*.52;
    root.style.setProperty('--fx-r175-chapter-progress',local.toFixed(4));
    root.style.setProperty('--fx-r175-energy',energy.toFixed(4));
    root.style.setProperty('--fx-r175-node-scale',(0.82+energy*.08).toFixed(4));
    root.style.setProperty('--fx-r175-carrier-opacity',(0.28+energy*.34).toFixed(4));
    root.style.setProperty('--fx-r175-carrier-scale',(0.64+local*.36).toFixed(4));
  }
}

function scheduleProgress(){
  if(scrollRaf)return;
  scrollRaf=requestAnimationFrame(updateProgress);
}

function observe(){
  const observer=new IntersectionObserver(entries=>{
    let candidate=null;
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      const item=sections.find(x=>x.section===entry.target);
      if(!item)continue;
      const score=entry.intersectionRatio+Math.max(0,1-Math.abs(entry.boundingClientRect.top-innerHeight*.28)/innerHeight);
      if(!candidate||score>candidate.score)candidate={index:item.index,score};
    }
    if(candidate)activate(candidate.index);
    scheduleProgress();
  },{root:null,rootMargin:'-16% 0px -48% 0px',threshold:[0,.08,.18,.32,.5,.68]});
  sections.forEach(x=>observer.observe(x.section));
}

function boot(){
  if(!discover()){
    root.dataset.fxAwardNarrativeR175='incomplete-dom';
    return;
  }
  for(const item of sections)item.section.dataset.fxStoryState=item.index===0?'active':'future';
  root.dataset.fxAwardNarrativeR175='ready';
  root.dataset.fxActiveOrganR175=sections[0].chapter.organ;
  root.dataset.fxActiveChapterR175='01';
  root.dataset.fxNarrativeMotionR175=reduced.matches?'reduced':'raf-intersection-transform-opacity';
  observe();
  addEventListener('scroll',scheduleProgress,{passive:true});
  addEventListener('resize',scheduleProgress,{passive:true});
  reduced.addEventListener?.('change',()=>{root.dataset.fxNarrativeMotionR175=reduced.matches?'reduced':'raf-intersection-transform-opacity';scheduleProgress();});
  scheduleProgress();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
}());
