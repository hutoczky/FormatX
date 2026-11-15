'use strict';
/* Read-only browser regression. No POST, no checkout submit, no payment. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ORIGIN=process.env.FORMATX_COMMERCE_BASE||'https://www.formatxsuite.com/scifi-ui/';
const OUTPUT=process.env.FORMATX_COMMERCE_PROOF||'artifacts/commerce-visible-r2211';
const PLANS=['business_lite','business_pro','technician_team'];
const CASES=[
  {name:'desktop',width:1366,height:768,mobile:false,motion:'reduce',archive:'off'},
  {name:'mobile',width:390,height:844,mobile:true,motion:'reduce',archive:'off'},
  {name:'desktop-cinematic',width:1366,height:768,mobile:false,motion:'no-preference',archive:'1'},
  {name:'mobile-cinematic',width:390,height:844,mobile:true,motion:'no-preference',archive:'1'}
];
function isExpectedCheckout(href,plan){
  const url=new URL(href,ORIGIN);
  return ['formatxsuite.com','www.formatxsuite.com'].includes(url.hostname) &&
    url.protocol==='https:' &&
    url.pathname==='/scifi-ui/checkout.html' &&
    url.searchParams.get('plan')===plan;
}
async function observe(page){
  return page.evaluate(()=>{
    const section=document.querySelector('#pricing');
    const visible=node=>{
      if(!(node instanceof HTMLElement))return false;
      const box=node.getBoundingClientRect();
      if(box.width<20||box.height<16)return false;
      for(let p=node;p;p=p.parentElement){
        const style=getComputedStyle(p);
        if(style.display==='none'||style.visibility==='hidden'||
           Number(style.opacity||'1')<.02)return false;
      }
      return true;
    };
    const cards=Array.from(section?.querySelectorAll('.price-card')||[]);
    return {
      archive:document.documentElement.dataset.fxArchiveCinema||'',
      archiveScene:document.documentElement.dataset.fxArchiveCurrent||'',
      mag:document.documentElement.dataset.fxMagChapters||'',
      chapterOpen:section?.dataset.fxExpanded,
      commerceFlag:section?.dataset.fxCommerceVisible||'',
      chapterVisible:visible(section),
      folio:section?.querySelector('.fx-archive-cinema-folio-r2030')?.dataset.fxCinemaPanelActive||'',
      cards:cards.map(card=>{
        const link=card.querySelector('a[href*="checkout.html"]');
        return {plan:card.dataset.planId,visible:visible(card),
          linkVisible:visible(link),href:link?.getAttribute('href')||''};
      }),
      payment:visible(section?.querySelector('.payment')),
      paymentConsole:visible(section?.querySelector('.payment-console')),
      primaryCheckout:visible(section?.querySelector('#preview-checkout-link')),
      primaryHref:section?.querySelector('#preview-checkout-link')?.getAttribute('href')||'',
      qr:visible(section?.querySelector('#formatx-plan-qr-dock')),
      horizontalOverflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-
        document.documentElement.clientWidth,
      horizontalPagePan:(()=>{
        const x=scrollX, y=scrollY;
        window.scrollTo({left:99999,top:y,behavior:'instant'});
        const actual=scrollX;
        window.scrollTo({left:x,top:y,behavior:'instant'});
        return actual;
      })(),
      sensoryRect:(()=>{
        const el=document.querySelector('.fx-site-sensory-field-r1755');
        const r=el?.getBoundingClientRect();
        const cs=el?getComputedStyle(el):null;
        return {present:!!el,x:Math.round(r?.x||0),width:Math.round(r?.width||0),
          inset:cs?.inset,clip:cs?.overflowX};
      })(),
      overflowOffenders:Array.from(document.querySelectorAll('body *')).map(node=>{
        const c=getComputedStyle(node),r=node.getBoundingClientRect();
        if(c.display==='none'||c.visibility==='hidden'||r.width<3)return null;
        if(r.right<=document.documentElement.clientWidth+3&&r.left>=-3)return null;
        return {tag:node.tagName,id:node.id,cls:String(node.className||'').slice(0,95),
          left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),
          position:c.position,overflow:c.overflow};
      }).filter(Boolean).slice(0,22)
    };
  });
}
async function runCase(browser,spec){
  const context=await browser.newContext({
    viewport:{width:spec.width,height:spec.height},isMobile:spec.mobile,
    hasTouch:spec.mobile,deviceScaleFactor:1,
    reducedMotion:spec.motion,locale:'hu-HU'
  });
  await context.addInitScript(()=>{
    try{
      localStorage.setItem('formatx:intro-seen-v1','1');
      sessionStorage.setItem('formatx:mag-birth-live-r533-seen','1');
    }catch(_){}
  });
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const url=new URL(ORIGIN);
  url.searchParams.set('archive',spec.archive);
  url.searchParams.set('commerce-visibility-check','r2211');
  url.hash='pricing';
  try{
    await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:60000});
    await page.locator('#pricing .price-card').first().waitFor({state:'attached',timeout:30000});
    // Trigger the deferred chapter stylesheet through a genuine input event.
    await page.mouse.wheel(0,360);
    await page.waitForFunction(()=>
      document.documentElement.dataset.fxMagChapters==='r2210',
      null,{timeout:30000});
    await page.evaluate(()=>{
      const section=document.getElementById('pricing');
      section?.scrollIntoView({behavior:'instant',block:'center'});
      document.dispatchEvent(new CustomEvent('formatx:livingready'));
      window.dispatchEvent(new CustomEvent('formatx:livingready'));
    });
    await page.waitForTimeout(spec.archive==='1'?1300:150);
    await page.waitForFunction(()=>{
      const s=document.getElementById('pricing');
      return s?.dataset.fxExpanded==='true'&&s.dataset.fxCommerceVisible==='true';
    },null,{timeout:15000});
    // Archive has its own scene scheduler. Give the real document one more
    // chance to select the pricing chapter after its layout is settled.
    if(spec.archive==='1'){
      await page.evaluate(()=>document.getElementById('pricing')?.scrollIntoView({
        behavior:'instant',block:'center'
      }));
      await page.waitForTimeout(650);
    }
    const state=await observe(page);
    assert.equal(state.chapterOpen,'true',spec.name+' pricing is closed: '+JSON.stringify(state));
    assert.equal(state.commerceFlag,'true',spec.name+' pricing flag missing');
    assert(state.chapterVisible,spec.name+' section invisible: '+JSON.stringify(state));
    assert.equal(state.cards.length,3,spec.name+' missing plan cards: '+JSON.stringify(state));
    for(const plan of PLANS){
      const card=state.cards.find(x=>x.plan===plan);
      assert(card&&card.visible&&card.linkVisible,spec.name+' hidden plan '+plan+': '+JSON.stringify(state));
      assert(isExpectedCheckout(card.href,plan),spec.name+' invalid checkout link '+plan+': '+card.href);
    }
    assert(state.payment&&state.paymentConsole&&state.primaryCheckout&&state.qr,
      spec.name+' payment console or QR is hidden: '+JSON.stringify(state));
    assert(isExpectedCheckout(state.primaryHref,'business_pro'),
      spec.name+' primary checkout points to wrong page: '+state.primaryHref);
    assert(state.horizontalPagePan<=3,
      spec.name+' actual sideways panning: '+JSON.stringify(state));
    // Browser actionability, not a real click: no order, no payment, no POST.
    for(const plan of PLANS){
      const link=page.locator('#pricing .price-card[data-plan-id="'+plan+'"] a[href*="checkout.html"]');
      await link.click({trial:true,timeout:15000});
    }
    await page.locator('#pricing #preview-checkout-link').click({trial:true,timeout:15000});
    fs.mkdirSync(OUTPUT,{recursive:true});
    await page.screenshot({path:path.join(OUTPUT,spec.name+'.jpg'),type:'jpeg',quality:72,timeout:30000});
    assert.equal(errors.length,0,spec.name+' browser errors: '+JSON.stringify(errors));
    console.log('COMMERCE_VISIBLE_PASS '+spec.name+' '+JSON.stringify(state));
  }catch(e){
    fs.mkdirSync(OUTPUT,{recursive:true});
    const state=await observe(page).catch(()=>({}));
    await page.screenshot({path:path.join(OUTPUT,spec.name+'-FAIL.jpg'),type:'jpeg',
      quality:72,timeout:8000}).catch(()=>{});
    console.error('COMMERCE_VISIBLE_FAIL '+spec.name+' '+JSON.stringify(state));
    throw e;
  }finally{await context.close();}
}
async function verifyCheckout(browser){
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try{
    const page=await ctx.newPage();
    const url=new URL('checkout.html?plan=business_pro&cycle=monthly&currency=HUF',ORIGIN);
    const response=await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:60000});
    assert.equal(response?.status(),200,'Checkout page HTTP status');
    await page.locator('.checkout-summary').waitFor({state:'visible',timeout:15000});
    assert.match(await page.locator('#summary-plan').innerText(),/Business Pro/i,
      'Selected plan missing from checkout summary');
    console.log('CHECKOUT_READ_ONLY_PASS '+url.pathname);
  }finally{await ctx.close();}
}
(async()=>{
  fs.mkdirSync(OUTPUT,{recursive:true});
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist','--enable-webgl'
  ]});
  try{
    for(const spec of CASES)await runCase(browser,spec);
    await verifyCheckout(browser);
  }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
