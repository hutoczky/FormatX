(function(){
'use strict';
const root=document.documentElement;
const VERSION='r172-physical-mobile-seam-bridge';
if(root.dataset.fxMobileSeamBridgeR172===VERSION)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxMobileSeamBridgeR172='audit-skip';return;}
const mobile=matchMedia('(max-width:900px),(pointer:coarse)');
let bridge=null,host=null,raf=0;

function imp(el,name,value){el.style.setProperty(name,value,'important');}
function styleBridge(){
  if(!(bridge instanceof HTMLElement))return;
  imp(bridge,'position','absolute');
  imp(bridge,'display','block');
  imp(bridge,'left','-12vw');
  imp(bridge,'right','-12vw');
  imp(bridge,'top','58%');
  imp(bridge,'height','72%');
  imp(bridge,'z-index','2');
  imp(bridge,'pointer-events','none');
  imp(bridge,'border','0');
  imp(bridge,'outline','0');
  imp(bridge,'box-shadow','none');
  imp(bridge,'border-radius','0');
  imp(bridge,'opacity','1');
  imp(bridge,'transform','translateZ(0)');
  imp(bridge,'background','radial-gradient(ellipse 74% 45% at 50% 5%,rgba(43,186,238,.105),transparent 63%),radial-gradient(ellipse 56% 38% at 61% 27%,rgba(142,70,255,.055),transparent 70%),linear-gradient(180deg,rgba(1,6,16,0) 0%,rgba(2,9,22,.07) 14%,rgba(2,11,27,.22) 34%,rgba(3,14,30,.52) 58%,rgba(4,13,30,.84) 80%,#040d1e 100%)');
}
function ensure(){
  if(!mobile.matches){root.dataset.fxMobileSeamBridgeR172='desktop-skip';return false;}
  host=document.querySelector('#hero .hero-space');
  if(!(host instanceof HTMLElement))return false;
  imp(host,'overflow','visible');
  if(!(bridge instanceof HTMLElement)||!bridge.isConnected){
    bridge=host.querySelector(':scope > .fx-mobile-seam-bridge-r172');
    if(!(bridge instanceof HTMLElement)){
      bridge=document.createElement('span');
      bridge.className='fx-mobile-seam-bridge-r172';
      bridge.setAttribute('aria-hidden','true');
      const first=host.firstElementChild;
      if(first)host.insertBefore(bridge,first);else host.appendChild(bridge);
    }
  }
  styleBridge();
  root.dataset.fxMobileSeamBridgeR172=VERSION;
  root.dataset.fxMobileSeamBridgeGeometryR172='top-58-height-72';
  return true;
}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;ensure();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{ensure();schedule();},{once:true});else{ensure();schedule();}
const mo=new MutationObserver(schedule);
mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','data-fx-mobile-reference-layout']});
mobile.addEventListener?.('change',schedule);
addEventListener('pageshow',schedule,{passive:true});
addEventListener('resize',schedule,{passive:true});
setTimeout(ensure,0);setTimeout(ensure,250);setTimeout(ensure,900);setTimeout(ensure,1800);
}());
