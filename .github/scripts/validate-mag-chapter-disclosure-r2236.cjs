'use strict';
/* R2236 native MAG disclosure: read-only Chromium tests, never checkout POST. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');

const base=process.env.FORMATX_CHAPTER_TEST_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html?archive=off';

async function check(browser,label,viewport,mobile,reduced){
  const ctx=await browser.newContext({
    viewport,isMobile:mobile,hasTouch:mobile,
    reducedMotion:reduced?'reduce':'no-preference'
  });
  const page=await ctx.newPage();
  try{
    await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
    // The real production stylesheet is deferred until visitor intent. This
    // event exercises that lazy interaction without hijacking native scroll.
    await page.evaluate(()=>window.dispatchEvent(new WheelEvent('wheel',{
      deltaY:100,bubbles:true,cancelable:true
    })));
    await page.waitForFunction(()=>window.FormatXMagChapters?.audit().total>=4,
      null,{timeout:30000});
    const initial=await page.evaluate(()=>{
      const a=window.FormatXMagChapters.audit();
      const pricing=document.querySelector('#pricing');
      return {audit:a,
        experience:document.querySelector('#experience')?.dataset.fxExpanded,
        pricing:pricing?.dataset.fxExpanded,
        priceCards:pricing?.querySelectorAll('.price-card').length,
        actionable:!pricing?.querySelector('#preview-checkout-link')?.inert,
        interaction:document.documentElement.dataset.fxMagChaptersInteractionR2236};
    });
    assert.equal(initial.experience,'false',label+' should show chapter keyword first');
    assert.equal(initial.pricing,'true',label+' payment area must remain expanded');
    assert.equal(initial.priceCards,3,label+' must preserve all real licence plans');
    assert.equal(initial.actionable,true,label+' checkout action became inert');
    assert.equal(initial.interaction,'inert-native-optical',label+' upgrade not mounted');
    assert.equal(initial.audit.closedInteractiveLeaks,0,label+' hidden chapter remains tabbable');

    // Programmatic .click() avoids synthetic checkout navigation and tests
    // the same semantic button handler as real keyboard/mouse activation.
    await page.locator('#experience .fx-mag-chapter-title').evaluate(el=>el.click());
    let opened=await page.evaluate(()=>{
      const root=document.querySelector('#experience');
      return {expanded:root.dataset.fxExpanded,
        aria:root.querySelector('.fx-mag-chapter-title')?.getAttribute('aria-expanded'),
        inert:root.querySelector('.flow')?.inert,
        presence:!!root.querySelector('.fx-mag-presence-r2236'),
        hiddenLeaks:window.FormatXMagChapters.audit().closedInteractiveLeaks};
    });
    assert.equal(opened.expanded,'true',label+' first chapter did not open');
    assert.equal(opened.aria,'true',label+' accessibility expansion mismatch');
    assert.equal(opened.inert,false,label+' original module stayed inert');
    assert.equal(opened.presence,true,label+' title lacks optical presence');
    assert.equal(opened.hiddenLeaks,0,label+' another closed section leaked controls');

    await page.locator('#capabilities .fx-mag-chapter-title').evaluate(el=>el.click());
    const switched=await page.evaluate(()=>{
      const prev=document.querySelector('#experience');
      const next=document.querySelector('#capabilities');
      return {prev:prev.dataset.fxExpanded,
        prevInert:prev.querySelector('.flow')?.inert,
        next:next.dataset.fxExpanded,
        nextInert:next.querySelector('.cards')?.inert,
        count:window.FormatXMagChapters.audit().closedInteractiveLeaks};
    });
    assert.equal(switched.prev,'false',label+' previous chapter remains open');
    assert.equal(switched.prevInert,true,label+' old chapter controls remain active');
    assert.equal(switched.next,'true',label+' second chapter did not open');
    assert.equal(switched.nextInert,false,label+' new chapter controls did not recover');
    assert.equal(switched.count,0,label+' leaked interactive hidden content');

    await page.locator('#capabilities .fx-mag-chapter-title').evaluate(el=>el.click());
    const closed=await page.evaluate(()=>{
      const s=document.querySelector('#capabilities');
      return {aria:s.querySelector('.fx-mag-chapter-title')?.getAttribute('aria-expanded'),
        inert:s.querySelector('.cards')?.inert,
        payment:document.querySelector('#pricing')?.dataset.fxExpanded,
        links:document.querySelectorAll('#pricing .price-card a[href*="checkout.html"]').length};
    });
    assert.equal(closed.aria,'false',label+' second chapter failed to close');
    assert.equal(closed.inert,true,label+' closed module remained keyboard-active');
    assert.equal(closed.payment,'true',label+' commerce disappeared');
    assert.equal(closed.links,3,label+' checkout links were modified');
    console.log('R2236_MAG_DISCLOSURE_PASS',JSON.stringify({label,initial,opened,switched,closed}));
  }finally{await ctx.close();}
}
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
    await check(browser,'desktop',{width:1440,height:900},false,false);
    await check(browser,'mobile',{width:390,height:844},true,false);
    await check(browser,'reduced',{width:1280,height:800},false,true);
  }finally{await browser.close();}
})().catch(error=>{console.error('R2236_MAG_DISCLOSURE_FAIL',error.stack||error);process.exitCode=1;});
