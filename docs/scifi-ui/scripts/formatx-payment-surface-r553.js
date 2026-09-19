(function(){
  'use strict';

  const root=document.documentElement;
  const STYLE='/scifi-ui/styles/payment-qr.css?v=20260906-r553-pricing-visible';
  const STYLE_ATTR='data-fx-payment-qr-style-r553';
  if(root.dataset.fxPaymentSurfaceR553==='ready'||root.dataset.fxPaymentSurfaceR553==='loading')return;
  root.dataset.fxPaymentSurfaceR553='loading';

  function expose(){
    const pricing=document.getElementById('pricing');
    if(!(pricing instanceof HTMLElement))return false;
    const payment=pricing.querySelector('.payment');
    const dock=document.getElementById('formatx-plan-qr-dock');
    for(const node of [payment,dock]){
      if(!(node instanceof HTMLElement))continue;
      node.style.setProperty('opacity','1','important');
      node.style.setProperty('visibility','visible','important');
      node.style.setProperty('transform','none','important');
      node.style.setProperty('filter','none','important');
    }
    if(dock instanceof HTMLElement){
      dock.classList.add('visible');
      dock.dataset.fxQrVisible='true';
    }
    root.dataset.fxPaymentSurfaceVisibleR553=payment&&dock?'payment-and-qr-visible':'partial-surface';
    return Boolean(payment&&dock);
  }

  function ensureStyle(){
    let link=document.querySelector(`link[${STYLE_ATTR}]`);
    if(link instanceof HTMLLinkElement){
      if(link.sheet){expose();root.dataset.fxPaymentSurfaceR553='ready';return;}
      link.addEventListener('load',()=>{expose();root.dataset.fxPaymentSurfaceR553='ready';},{once:true});
      link.addEventListener('error',()=>{expose();root.dataset.fxPaymentSurfaceR553='style-error-fallback-visible';},{once:true});
      return;
    }
    link=document.createElement('link');
    link.rel='stylesheet';
    link.href=STYLE;
    link.setAttribute(STYLE_ATTR,'true');
    link.addEventListener('load',()=>{expose();root.dataset.fxPaymentSurfaceR553='ready';},{once:true});
    link.addEventListener('error',()=>{expose();root.dataset.fxPaymentSurfaceR553='style-error-fallback-visible';},{once:true});
    document.head.appendChild(link);
  }

  function afterFirstPaint(callback){
    if(document.visibilityState==='hidden'){setTimeout(callback,0);return;}
    let done=false;
    const finish=()=>{if(done)return;done=true;callback();};
    try{
      const entries=performance.getEntriesByType?.('paint')||[];
      if(entries.some(entry=>entry.name==='first-contentful-paint')){setTimeout(finish,0);return;}
      const observer=new PerformanceObserver(list=>{
        if(list.getEntries().some(entry=>entry.name==='first-contentful-paint')){
          observer.disconnect();setTimeout(finish,0);
        }
      });
      observer.observe({type:'paint',buffered:true});
      setTimeout(()=>{observer.disconnect();requestAnimationFrame(()=>requestAnimationFrame(finish));},900);
    }catch(_){requestAnimationFrame(()=>requestAnimationFrame(finish));}
  }

  function start(){
    expose();
    afterFirstPaint(ensureStyle);
  }

  addEventListener('pageshow',expose,{passive:true});
  addEventListener('formatx:languagechange',expose,{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
}());
