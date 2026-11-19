/* R2216 – read-only sales readiness on the real checkout API.
   Never start an order, infer legal approval, or prevent navigation. */
(()=>{
  'use strict';
  const root=document.documentElement;
  const status=document.getElementById('formatx-sales-readiness');
  const pricing=document.getElementById('pricing');
  if(!status||!pricing||root.dataset.fxSalesReadinessR2216)return;
  root.dataset.fxSalesReadinessR2216='armed';
  const messages={
    checking:{
      hu:'Az új licencvásárlás elérhetőségét ellenőrizzük.',
      en:'Checking whether new licence purchases are available.'
    },
    blocked:{
      hu:'Az új licencvásárlás átmenetileg nem indítható. Az árak és a csomagok tájékoztatásként láthatók. A vásárlási oldalon a jogi és számlázási feltételekről kapsz tájékoztatást.',
      en:'New licence purchases are temporarily unavailable. Plans and prices are displayed for information. The checkout page explains the legal and billing requirements.'
    },
    ready:{
      hu:'A licencvásárlás elérhető. A rendelés véglegesítése előtt ellenőrizd az összeget és a feltételeket.',
      en:'Licence purchasing is available. Verify the amount and terms before submitting an order.'
    },
    unknown:{
      hu:'A fizetés elérhetőségét jelenleg nem tudjuk megerősíteni. A rendelés állapotát a vásárlási oldalon ellenőrizheted.',
      en:'Payment availability could not be confirmed. Check the order status on the checkout page.'
    }
  };
  let state='checking';
  let started=false;
  function paint(){
    const copy=messages[state]||messages.unknown;
    status.dataset.fxSalesState=state;
    status.dataset.hu=copy.hu;
    status.dataset.en=copy.en;
    const value=root.lang==='en'?copy.en:copy.hu;
    if(status.textContent!==value)status.textContent=value;
    root.dataset.fxSalesReadinessR2216=state;
  }
  async function load(){
    if(started)return;
    started=true;
    try{
      const response=await fetch('/api/checkout-readiness',{
        method:'GET',headers:{Accept:'application/json'},
        credentials:'same-origin',cache:'no-store'
      });
      if(!response.ok)throw new Error('sales-readiness-http');
      const payload=await response.json();
      if(payload.provider!=='bank_transfer' ||
         typeof payload.sales_ready!=='boolean' ||
         typeof payload.live_ready!=='boolean')throw new Error('sales-readiness-schema');
      state=(payload.sales_ready===true&&payload.live_ready===true&&
        payload.ok===true)?'ready':'blocked';
    }catch(_){
      state='unknown';
    }
    paint();
  }
  paint();
  window.addEventListener('formatx:languagechange',paint,{passive:true});
  if(location.hash==='#pricing'){
    load();
  }else if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){
        observer.disconnect();
        load();
      }
    },{rootMargin:'450px 0px 450px 0px',threshold:0});
    observer.observe(pricing);
    window.addEventListener('hashchange',()=>{
      if(location.hash==='#pricing'){observer.disconnect();load();}
    },{passive:true});
  }else{
    const onIntent=()=>load();
    window.addEventListener('wheel',onIntent,{passive:true,once:true});
    window.addEventListener('touchstart',onIntent,{passive:true,once:true});
    window.addEventListener('keydown',onIntent,{passive:true,once:true});
  }
})();