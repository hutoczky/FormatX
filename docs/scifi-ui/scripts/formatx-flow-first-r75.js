(function(){
'use strict';
const root=document.documentElement;
let queued=false;
const imp=(el,prop,value)=>{if(el instanceof HTMLElement)el.style.setProperty(prop,value,'important');};
function normal(el){if(!(el instanceof HTMLElement))return;imp(el,'position','relative');imp(el,'inset','auto');imp(el,'top','auto');imp(el,'right','auto');imp(el,'bottom','auto');imp(el,'left','auto');imp(el,'grid-area','auto');imp(el,'grid-row','auto');imp(el,'grid-column','auto');imp(el,'transform','none');imp(el,'translate','none');}
function fixed(el,top,right,width,height){if(!(el instanceof HTMLElement))return;imp(el,'position','fixed');imp(el,'inset','auto');imp(el,'top',top);imp(el,'right',right);imp(el,'bottom','auto');imp(el,'left','auto');imp(el,'width',width);imp(el,'height',height);imp(el,'margin','0');imp(el,'transform','none');imp(el,'translate','none');imp(el,'flex','0 0 auto');imp(el,'visibility','visible');imp(el,'opacity','1');imp(el,'display','inline-flex');imp(el,'pointer-events','auto');}
function restoreDesktopMenu(){
 const ref=document.querySelector('.fx-reference-menu-button');
 const legacy=document.querySelector('#fx-reference-legacy-menu');
 if(ref instanceof HTMLElement){ref.removeAttribute('id');imp(ref,'display','none');imp(ref,'visibility','hidden');imp(ref,'opacity','0');imp(ref,'pointer-events','none');}
 if(legacy instanceof HTMLButtonElement){legacy.id='menu-toggle';legacy.hidden=false;legacy.removeAttribute('aria-hidden');legacy.removeAttribute('tabindex');imp(legacy,'display','inline-flex');imp(legacy,'visibility','visible');imp(legacy,'opacity','1');imp(legacy,'pointer-events','auto');}
}
function apply(){
 queued=false;
 const mobile=innerWidth<=900;
 const bar=document.querySelector('.topbar');
 if(bar instanceof HTMLElement){
  imp(bar,'position','relative');imp(bar,'inset','auto');imp(bar,'top','auto');imp(bar,'display','flex');imp(bar,'align-items','center');imp(bar,'flex-wrap','nowrap');
  const brand=bar.querySelector('.brand');
  const mag=document.querySelector('.fx-reference-mag-button'),language=document.querySelector('.fx-language-toggle'),menu=document.querySelector('.fx-reference-menu-button');
  if(mobile){
   if(brand instanceof HTMLElement){imp(brand,'position','fixed');imp(brand,'inset','auto');imp(brand,'top','19px');imp(brand,'right','auto');imp(brand,'bottom','auto');imp(brand,'left','18px');imp(brand,'width','auto');imp(brand,'height','34px');imp(brand,'margin','0');imp(brand,'min-width','0');imp(brand,'flex','0 0 auto');imp(brand,'transform','none');imp(brand,'translate','none');}
   fixed(mag,'16px','calc(clamp(16px,6.55vw,57px) + 109px)','48px','36px');
   fixed(language,'14px','calc(clamp(16px,6.55vw,57px) + 61px)','40px','40px');
   fixed(menu,'8px','clamp(16px,6.55vw,57px)','48px','52px');
  }else{
   normal(brand);imp(brand,'margin-right','auto');imp(brand,'min-width','0');imp(brand,'flex','0 1 auto');
   if(language instanceof HTMLElement){normal(language);imp(language,'margin','0');imp(language,'flex','0 0 auto');imp(language,'visibility','visible');imp(language,'opacity','1');imp(language,'display','inline-flex');}
   for(const el of [mag,menu]){if(!(el instanceof HTMLElement))continue;normal(el);imp(el,'margin','0');imp(el,'flex','0 0 auto');imp(el,'visibility','hidden');imp(el,'opacity','0');imp(el,'display','none');imp(el,'pointer-events','none');}
  }
 }
 if(mobile){document.querySelectorAll('#fx-reference-legacy-menu,body>.menu-toggle.fx-organism-system-toggle:not(.fx-reference-menu-button)').forEach(el=>{imp(el,'display','none');imp(el,'visibility','hidden');imp(el,'opacity','0');imp(el,'pointer-events','none');});}
 const hero=document.getElementById('hero'),grid=hero?.querySelector('.hero-grid'),space=hero?.querySelector('.hero-space'),rail=hero?.querySelector('.fx-reference-rail'),copy=hero?.querySelector('.hero-copy'),heading=hero?.querySelector('.fx-reference-heading'),proof=hero?.querySelector('.fx-reference-proof');
 if(!(hero instanceof HTMLElement)||!(grid instanceof HTMLElement)||!(space instanceof HTMLElement)||!(copy instanceof HTMLElement))return false;
 imp(hero,'display','block');imp(hero,'height','auto');imp(hero,'min-height','0');imp(hero,'max-height','none');imp(hero,'padding-top',mobile?'0':'12px');imp(hero,'overflow','visible');
 imp(grid,'position','relative');imp(grid,'display','flex');imp(grid,'flex-direction','column');imp(grid,'grid-template-columns','none');imp(grid,'grid-template-rows','none');imp(grid,'align-items','stretch');imp(grid,'width','100%');imp(grid,'max-width','none');imp(grid,'height','auto');imp(grid,'min-height','0');imp(grid,'gap','0');imp(grid,'margin','0');imp(grid,'padding','0');imp(grid,'overflow','visible');
 normal(space);imp(space,'order','0');imp(space,'align-self','center');imp(space,'margin','0 auto');

 if(mobile){
  if(rail instanceof HTMLElement){imp(rail,'position','absolute');imp(rail,'inset','auto');imp(rail,'top','14px');imp(rail,'right','6.55%');imp(rail,'left','auto');imp(rail,'bottom','auto');imp(rail,'z-index','20');imp(rail,'display','flex');imp(rail,'flex-direction','column');imp(rail,'align-items','center');imp(rail,'justify-content','flex-start');imp(rail,'gap','13px');imp(rail,'width','auto');imp(rail,'height','auto');imp(rail,'margin','0');imp(rail,'transform','none');}
  imp(copy,'position','absolute');imp(copy,'width','1px');imp(copy,'height','1px');imp(copy,'padding','0');imp(copy,'margin','-1px');imp(copy,'overflow','hidden');imp(copy,'clip','rect(0,0,0,0)');imp(copy,'clip-path','inset(50%)');imp(copy,'white-space','nowrap');imp(copy,'border','0');imp(copy,'opacity','1');imp(copy,'visibility','visible');
  if(heading instanceof HTMLElement){normal(heading);imp(heading,'display','flex');imp(heading,'visibility','visible');imp(heading,'opacity','1');imp(heading,'order','2');imp(heading,'align-self','stretch');imp(heading,'margin','-24px 6% 24px');imp(heading,'z-index','21');}
  if(proof instanceof HTMLElement){normal(proof);imp(proof,'display','block');imp(proof,'visibility','visible');imp(proof,'opacity','1');imp(proof,'order','3');imp(proof,'align-self','stretch');imp(proof,'height','auto');imp(proof,'min-height','222px');imp(proof,'margin','0 7% 30px 6%');imp(proof,'overflow','hidden');const live=proof.querySelector('.fx-reference-liveos');if(live instanceof HTMLElement){imp(live,'position','absolute');imp(live,'right','6px');imp(live,'top','143px');imp(live,'left','auto');imp(live,'bottom','auto');imp(live,'display','grid');imp(live,'margin','0');}}
  root.dataset.fxReferenceComposition='award-reference-overlay-r132';root.dataset.fxFlowFirstR75='ready-r132';return true;
 }

 restoreDesktopMenu();
 if(rail instanceof HTMLElement){normal(rail);imp(rail,'display','none');imp(rail,'visibility','hidden');imp(rail,'opacity','0');imp(rail,'pointer-events','none');}
 normal(copy);imp(copy,'order','2');imp(copy,'align-self','center');imp(copy,'display','grid');imp(copy,'grid-template-columns','minmax(0,1fr)');imp(copy,'grid-template-rows','none');imp(copy,'align-content','start');imp(copy,'row-gap','16px');imp(copy,'width','min(960px,calc(100% - 40px))');imp(copy,'max-width','960px');imp(copy,'height','auto');imp(copy,'min-height','260px');imp(copy,'margin','0 auto 48px');imp(copy,'padding','0');imp(copy,'overflow','visible');imp(copy,'clip','auto');imp(copy,'clip-path','none');imp(copy,'white-space','normal');imp(copy,'opacity','1');imp(copy,'visibility','visible');
 Array.from(copy.children).forEach(el=>{normal(el);imp(el,'float','none');imp(el,'opacity','1');imp(el,'visibility','visible');imp(el,'max-height','none');imp(el,'clip','auto');imp(el,'clip-path','none');});
 const kicker=copy.querySelector('.kicker'),category=copy.querySelector('.fx-category-definition'),title=copy.querySelector('#hero-title'),lead=copy.querySelector('.hero-lead'),method=copy.querySelector('.fx-method-inline'),actions=copy.querySelector('.hero-actions'),facts=copy.querySelector('.hero-facts');
 [kicker,category,title,lead].forEach(el=>{imp(el,'display','block');imp(el,'width','auto');imp(el,'height','auto');imp(el,'margin-left','0');imp(el,'margin-right','0');});
 imp(kicker,'min-height','16px');imp(kicker,'font-size','12px');imp(kicker,'line-height','1.35');imp(category,'width','min(620px,100%)');imp(category,'min-height','48px');imp(category,'font-size','14px');imp(category,'line-height','1.55');imp(title,'min-height','94px');imp(title,'margin','8px 0 4px');const main=title?.querySelector('.hero-title-main'),sub=title?.querySelector('.hero-title-sub');normal(main);normal(sub);imp(main,'display','block');imp(main,'height','auto');imp(main,'min-height','58px');imp(main,'font-size','clamp(64px,6.4vw,104px)');imp(main,'line-height','.9');imp(sub,'display','block');imp(sub,'height','auto');imp(sub,'min-height','26px');imp(sub,'margin-top','8px');imp(sub,'font-size','clamp(25px,2.5vw,38px)');imp(sub,'line-height','1');imp(lead,'width','min(620px,100%)');imp(lead,'min-height','48px');imp(lead,'font-size','17px');imp(lead,'line-height','1.55');
 if(method instanceof HTMLElement){imp(method,'display','flex');imp(method,'flex-wrap','wrap');imp(method,'gap','8px 18px');imp(method,'width','100%');imp(method,'height','auto');imp(method,'min-height','24px');}
 if(actions instanceof HTMLElement){imp(actions,'display','flex');imp(actions,'flex-wrap','wrap');imp(actions,'gap','10px');imp(actions,'width','100%');imp(actions,'height','auto');imp(actions,'min-height','1px');}
 if(facts instanceof HTMLElement){imp(facts,'display','flex');imp(facts,'flex-wrap','wrap');imp(facts,'gap','10px 20px');imp(facts,'width','100%');imp(facts,'height','auto');imp(facts,'min-height','1px');}
 if(heading instanceof HTMLElement){normal(heading);imp(heading,'display','none');imp(heading,'visibility','hidden');imp(heading,'opacity','0');}
 if(proof instanceof HTMLElement){normal(proof);imp(proof,'display','none');imp(proof,'visibility','hidden');imp(proof,'opacity','0');}
 root.dataset.fxReferenceComposition='desktop-native-content-r132';root.dataset.fxFlowFirstR75='ready-r132';return true;
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(apply);}
function boot(){schedule();setTimeout(schedule,120);setTimeout(schedule,700);setTimeout(schedule,1800);setTimeout(schedule,3200);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
['formatx:real3dready','formatx:languagechange','formatx:organisminterfaceready'].forEach(name=>addEventListener(name,schedule));
addEventListener('resize',schedule,{passive:true});
}());