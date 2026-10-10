'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const URL=process.env.FORMATX_ARCHIVE_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html?archive=1&r486-optics-energy-check=1';
const out='.archive-artifacts';
fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function evaluate(viewport,isMobile,browser){
  const context=await browser.newContext({
    viewport,deviceScaleFactor:isMobile?2:1,
    isMobile,hasTouch:isMobile,
    reducedMotion:'no-preference'
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>Boolean(window.FormatXArchiveExperience),null,{timeout:60000});
  await page.waitForFunction(()=>{
    const s=document.documentElement.dataset.fxArchiveExperience;
    return s==='ready'||s==='context-error'||s==='no-scenes';
  },null,{timeout:90000});
  const init=await page.evaluate(()=>({
    status:document.documentElement.dataset.fxArchiveExperience,
    shared:window.FormatXLivingCore?.sharedWebGL2||false,
    sceneCount:window.FormatXArchiveExperience.scenes.length,
    contextCount:document.documentElement.dataset.fxCoreContexts
  }));
  assert.equal(init.status,'ready',JSON.stringify(init));
  // The renderer can re-announce readiness after a restored tab or a
  // responsive layout change. This MUST NOT allocate duplicate WebGL passes.
  const rendererProbe=await page.evaluate(()=>{
    const root=document.documentElement;
    const before=root.dataset.fxArchiveExperience;
    const canvas=window.FormatXLivingCore?.canvas;
    const refBefore=window.FormatXArchiveExperience?.version;
    window.dispatchEvent(new CustomEvent('formatx:real3dready'));
    window.dispatchEvent(new CustomEvent('formatx:real3dready'));
    return {before,after:root.dataset.fxArchiveExperience,
      stable:canvas===window.FormatXLivingCore?.canvas,
      version:refBefore};
  });
  assert.ok(rendererProbe.stable&&rendererProbe.after==='ready',
    'Repeated MAG readiness must retain the exact native renderer: '+JSON.stringify(rendererProbe));
  
  assert.equal(init.shared,true,JSON.stringify(init));
  assert.ok(init.sceneCount>=6,'Expected at least six real source sections');
  assert.equal(init.contextCount,'1','Original MAG owns the sole WebGL context');
  const prepared=await page.evaluate(()=>document.documentElement.dataset.fxArchiveCinemaPrepared);
  assert.ok(Number(prepared)>=6,'Cinematic archival DOM panels were not constructed: '+prepared);
  await page.waitForFunction(()=>document.documentElement.dataset.fxArchiveCinema==='active',null,{timeout:12000});
  const first=await page.evaluate(()=>{
    const root=document.documentElement;
    const hero=document.querySelector('#hero .hero-copy');
    const p=document.querySelector('main#main-content > [data-fx-cinema-host-active="true"] > .fx-archive-cinema-folio-r2030');
    return {mode:root.dataset.fxArchiveCinema,firstScene:root.dataset.fxArchiveCurrent,
      heroVisibility:hero?getComputedStyle(hero).visibility:null,
      heroDisplay:hero?getComputedStyle(hero).display:null,
      heroRectCount:hero?.getClientRects().length??-1,
      firstCssLoaded:!!document.querySelector('link[data-fx-mag-exclusive-first-frame-r2032]')?.sheet,
      bodyClass:document.body.className,
      panel:!!p&&getComputedStyle(p).visibility==='visible',
      source:root.dataset.fxArchiveSheetMotion||null};
  });
  assert.equal(first.mode,'active','MAG must take over on first frame after intro');
  assert.ok(first.heroDisplay==='none'||first.heroVisibility==='hidden'||first.heroRectCount===0,
    'Old landing text is visibly competing with MAG: '+JSON.stringify(first));
  assert.ok(first.panel,'The first archival papyrus must be on screen: '+JSON.stringify(first));
  const proofContract=await page.evaluate(()=>{
    const all=[...document.querySelectorAll('.fx-award-proof[data-fx-award-proof]')];
    const loopCopy=document.querySelectorAll('.fx-loop-reference-proof').length;
    const oldHero=document.querySelector('#hero .fx-reference-proof');
    const oldVisible=oldHero?getComputedStyle(oldHero).display!=='none'&&oldHero.getClientRects().length>0:false;
    const canonical=all[0];
    const inFinal=canonical?.closest('[data-fx-archive-scene="final"] .fx-archive-cinema-folio-r2030');
    return {count:all.length,loopCopy,oldVisible,inFinal:!!inFinal,links:canonical?.querySelectorAll('a[href]').length||0};
  });
  assert.equal(proofContract.count,1,'Expected one canonical visual-proof block: '+JSON.stringify(proofContract));
  assert.equal(proofContract.loopCopy,0,'Infinite loop duplicates visible proof content: '+JSON.stringify(proofContract));
  assert.ok(!proofContract.oldVisible,'Duplicate legacy hero proof block still visible: '+JSON.stringify(proofContract));
  assert.ok(proofContract.inFinal&&proofContract.links>=2,'Original public proof must be in final MAG folio with real links: '+JSON.stringify(proofContract));

  const scenes=await page.evaluate(()=>window.FormatXArchiveExperience.scenes);
  let passed=0;
  const coverage=[];
  for(const scene of scenes){
    const selector=/^[#.]/.test(scene.id)?scene.id:'#'+scene.id;
    await page.locator(selector).first().evaluate(n=>n.scrollIntoView({block:'center',behavior:'instant'}));
    // Some FormatX sections have independent content-visibility sizing and
    // smooth-loop reconciliation. Use a native document scroll when a section
    // remains entirely outside the viewport after scrollIntoView.
    await page.evaluate(sel=>{
      const n=document.querySelector(sel),r=n?.getBoundingClientRect();
      if(r&&(r.top>innerHeight*.92||r.bottom<0)){
        window.scrollTo({top:scrollY+r.top-innerHeight*.32,behavior:'instant'});
      }
    },selector);
    await page.waitForFunction(key=>{
      const state=window.FormatXArchiveExperience?.state;
      return state?.active&&state?.scene===key;
    },scene.key,{timeout:8000}).catch(()=>{});
    const state=await page.evaluate(()=>window.FormatXArchiveExperience.state);
    let postRefresh=null;
    if(state.scene!==scene.key){
      await page.evaluate(()=>window.FormatXArchiveExperience.refresh());
      await page.waitForTimeout(240);
      postRefresh=await page.evaluate(()=>window.FormatXArchiveExperience.state);
    }
    const diagnostics=await page.evaluate(sel=>{
      const node=document.querySelector(sel),r=node?.getBoundingClientRect();
      return {scrollY,scrollHeight:document.documentElement.scrollHeight,innerHeight,
        target:r?{top:r.top,bottom:r.bottom,height:r.height,display:getComputedStyle(node).display}:null,
        archive:document.documentElement.dataset.fxArchiveDock,
        nearby:[...document.querySelectorAll('[data-fx-archive-scene]')].map(n=>{const b=n.getBoundingClientRect();return{key:n.dataset.fxArchiveScene,top:Math.round(b.top),bottom:Math.round(b.bottom)};}).slice(0,12)};
    },selector);
    console.log('ARCHIVE_SCENE_PROBE',JSON.stringify({expected:scene.key,actual:state.scene,active:state.active,progress:state.progress,postRefresh,diagnostics}));
    if(state.scene===scene.key&&state.active){

      // R2026: a status label alone cannot satisfy the requested cinematic
      // archival handoff. The active folio must use actual section copy, and
      // the ORIGINAL semantic content must itself receive a 3D arrival.
      const physical=await page.evaluate(key=>{
        const folio=document.querySelector('.fx-archive-physical-paper-r2026');
        const live=[...document.querySelectorAll('.fx-archive-live-sheet-r2026')];
        const current=document.querySelector('[data-fx-archive-scene="'+key+'"]');
        const headings=current?.querySelector('h2,h3');
        const folioTitle=folio?.querySelector('.fx-archive-telemetry-r2022__title')?.textContent?.trim()||'';
        return {folio:!!folio,liveCount:live.length,currentLive:(current?.classList.contains('fx-archive-live-sheet-r2026')?1:0)+(current?.querySelectorAll('.fx-archive-live-sheet-r2026').length||0),
          actualContent:!!headings&&folioTitle===headings.textContent.trim().slice(0,140),
          mode:document.documentElement.dataset.fxArchiveRealContent||null};
      },scene.key);
      assert.ok(physical.folio,'Missing physical MAG paper for '+scene.key);
      assert.ok(physical.liveCount>=8,'Native content sheets were not prepared: '+JSON.stringify(physical));
      assert.ok(physical.currentLive>=1,'Real HTML lacks MAG-delivered elements for '+scene.key+': '+JSON.stringify(physical));
      // R2030: old site surfaces must be invisible, with ONE original working
      // HTML folio presented at a time. Geometry must reserve a separate
      // MAG camera lane, never paint the living core on top of actual text.
      const cinema=await page.evaluate(()=>{
        const root=document.documentElement;
        const hosts=[...document.querySelectorAll('main#main-content > [data-fx-cinema-host-active]')];
        const visibleHosts=hosts.filter(h=>h.dataset.fxCinemaHostActive==='true');
        const panel=visibleHosts[0]?.querySelector(':scope > .fx-archive-cinema-folio-r2030');
        const mag=document.querySelector('#hero .fx-crystal-organism-r326-stage.fx-archive-native-docked');
        const mr=mag?.getBoundingClientRect(),pr=panel?.getBoundingClientRect();
        const active=panel?getComputedStyle(panel):null;
        const hostRect=visibleHosts[0]?.getBoundingClientRect();
        const old=hosts.filter(h=>h!==visibleHosts[0]).map(h=>getComputedStyle(h).visibility);
        const hasActualInputs=Boolean(panel?.querySelector('a[href],button,input,select,textarea'));
        return {
          mode:root.dataset.fxArchiveCinema,
          count:visibleHosts.length,
          paperVisible:active?.visibility,
          paperPosition:active?.position,
          paperPointer:active?.pointerEvents,
          paperText:(panel?.textContent||'').trim().length,
          oldHidden:old.every(v=>v==='hidden'),
          hasActualInputs,
          mag:mr?{x:mr.x,y:mr.y,w:mr.width,h:mr.height}:null,
          paper:pr?{x:pr.x,y:pr.y,w:pr.width,h:pr.height,
            top:active?.top,translate:active?.translate,
            shift:panel?.dataset.fxMobileScreenTop||null}:null,
          hostTop:hostRect?.top,
          hostTransform:visibleHosts[0]?getComputedStyle(visibleHosts[0]).transform:null,
          mainTransform:getComputedStyle(document.getElementById('main-content')).transform
        };
      });
      if(scene.key==='final'){
        const existingCTA=await page.evaluate(()=>{
          const p=document.querySelector('[data-fx-archive-scene="final"] .fx-archive-cinema-folio-r2030');
          const link=p?.querySelector('#hero-download');
          return {exists:!!link,href:link?.getAttribute('href'),inPaper:link?.closest('.fx-archive-cinema-folio-r2030')===p};
        });
        assert.ok(existingCTA.exists&&existingCTA.inPaper&&existingCTA.href==='/download/multiplatform',
          'Final scene must deliver the original functional primary CTA: '+JSON.stringify(existingCTA));
      }
      const real3D=await page.evaluate(()=>{
        const panel=document.querySelector('main#main-content > [data-fx-cinema-host-active="true"] > .fx-archive-cinema-folio-r2030[data-fx-cinema-panel-active="true"]');
        return {bridge:document.documentElement.dataset.fxArchiveNativeHandoff,
          source:panel?.dataset.fxCinemaSource,phase:panel?.dataset.fxCinemaHandoff,
          transform:panel?getComputedStyle(panel).transform:'none'};
      });
      assert.equal(real3D.bridge,'scroll-coupled-real-3d-paper','Native HTML was not coupled to actual MAG retrieval');
      assert.equal(real3D.source,scene.source,'The handed-off folio does not originate from the scene shelf');
      assert.ok(real3D.phase&&real3D.transform.startsWith('matrix3d('),
        'Actual HTML papyrus lacks GPU-composited 3D presentation: '+JSON.stringify(real3D));
      assert.equal(cinema.mode,'active','MAG did not replace legacy site');
      assert.equal(cinema.count,1,'More than one original content folio is visible: '+JSON.stringify(cinema));
      assert.equal(cinema.paperVisible,'visible','Current paper is not visible: '+JSON.stringify(cinema));
      assert.equal(cinema.paperPosition,'fixed','Original HTML module is not physically presented in front of visitor');
      assert.equal(cinema.paperPointer,'auto','Interactive original controls are disabled');
      assert.ok(cinema.paperText>70,'Original functional content is not present in MAG folio');
      assert.ok(cinema.oldHidden,'Other legacy sections remain visible behind MAG');
      assert.ok(cinema.mag&&cinema.paper,'Missing two cinematic lanes');
      // R2038 screenshot regression: a GPU draw-call and 8 scene labels are
      // insufficient if the original working HTML pane is invisible behind
      // the full-width old hero's z-index, as seen on an actual 1660px desktop.
      const painted=await page.evaluate(()=>{
        const panel=document.querySelector('main#main-content > [data-fx-cinema-host-active="true"] > .fx-archive-cinema-folio-r2030[data-fx-cinema-panel-active="true"]');
        const hero=document.getElementById('hero');
        const host=panel?.parentElement;
        const pr=panel?.getBoundingClientRect();
        const st=panel?getComputedStyle(panel):null;
        const point=pr?{x:pr.x+pr.width*.55,y:pr.y+Math.min(pr.height*.52,innerHeight*.42)}:null;
        const topmost=point?document.elementFromPoint(point.x,point.y):null;
        return {exists:!!panel,paperOpacity:Number(st?.opacity||0),
          paperVisibility:st?.visibility,hit:!!topmost&&panel.contains(topmost),
          paperWidth:pr?.width||0,paperHeight:pr?.height||0,
          heroZ:Number(getComputedStyle(hero).zIndex)||0,hostZ:Number(getComputedStyle(host).zIndex)||0,
          obstruction:topmost?.className?.toString().slice(0,80)||topmost?.tagName||'none'};
      });
      assert.ok(painted.paperOpacity>=.7&&painted.paperVisibility==='visible',
        'User screenshot defect: handed-off original HTML paper invisible: '+JSON.stringify(painted));
      assert.ok(painted.paperWidth>=viewport.width*(isMobile?.78:.43)&&painted.paperHeight>=viewport.height*(isMobile?.35:.61),
        'User screenshot defect: original interactive paper is thumbnail-sized: '+JSON.stringify(painted));
      assert.ok(painted.hostZ>painted.heroZ,
        'User screenshot defect: full-width legacy hero masks the handed-off page: '+JSON.stringify(painted));
      assert.ok(painted.hit,
        'User screenshot defect: something else covers the native paper at reading center: '+JSON.stringify(painted));

      if(isMobile){
        assert.ok(cinema.mag.y+cinema.mag.h <= cinema.paper.y+10,
          'MAG overlaps reading panel on phone: '+JSON.stringify(cinema));
      }else{
        assert.ok(cinema.mag.x+cinema.mag.w <= cinema.paper.x+10,
          'MAG jumps over reading panel on desktop: '+JSON.stringify(cinema));
      }
      if(scene.key==='network'||scene.key==='licensing'){
        assert.ok(cinema.hasActualInputs,'Original functional controls not transferred with '+scene.key);
      }

      assert.ok(physical.actualContent,'The MAG paper is not connected to the real section copy: '+JSON.stringify(physical));
      assert.equal(physical.mode,'native-paper-handoff','Native document transfer missing');
      // R2022: all eight sources must present their own visible chapter label,
      // rather than a permanently docked opaque overlay or stale HUD.
      const chapterHandoff=await page.evaluate(()=>{
        const el=document.querySelector('.fx-archive-telemetry-r2022');
        return {key:el?.dataset.scene,active:el?.dataset.active,
          label:el?.querySelector('.fx-archive-telemetry-r2022__title')?.textContent||''};
      });
      assert.equal(chapterHandoff.key,scene.key,'MAG handoff not updated for '+scene.key+': '+JSON.stringify(chapterHandoff));
      assert.equal(chapterHandoff.active,'true','MAG handoff not active for '+scene.key);
      assert.ok(chapterHandoff.label.length>5,'No semantic chapter label for '+scene.key);
      passed++;
      coverage.push({key:scene.key,progress:state.progress,frames:state.frames});
      const inside=await page.locator(selector).first().evaluate(n=>{
        const focusable=n.querySelector('a[href],button,input,select,textarea');
        return{nativeText:((n.textContent||'').trim().length>10),focusable:!!focusable,tag:n.tagName};
      });
      assert.ok(inside.nativeText,'Native semantic content is missing: '+scene.key);
    }
  }
  assert.equal(passed,scenes.length,'Every real archive scene must activate: '+JSON.stringify({passed,total:scenes.length,coverage}));
  const one=scenes.find(s=>s.key==='capabilities')||scenes[0];
  const selector=/^[#.]/.test(one.id)?one.id:'#'+one.id;
  await page.locator(selector).first().evaluate(n=>n.scrollIntoView({block:'center',behavior:'instant'}));
  await sleep(150);
  const center=await page.evaluate(()=>window.FormatXArchiveExperience.state);
  await page.evaluate(()=>scrollBy({top:-Math.max(60,Math.round(innerHeight*.2)),behavior:'instant'}));
  await sleep(140);
  const back=await page.evaluate(()=>window.FormatXArchiveExperience.state);
  if(back.scene===center.scene)assert.ok(back.progress<=center.progress+.03,'Reverse scroll must reverse the timeline');
  const native=await page.evaluate(()=>({
    renderer:document.documentElement.dataset.fxArchiveNativePass,
    drawCalls:Number(document.documentElement.dataset.fxArchiveDrawCalls||0),
    filamentCount:Number(document.documentElement.dataset.fxArchiveFilamentCount||0),
    frames:window.FormatXArchiveExperience.state.frames,
    controls:document.querySelectorAll('#menu-toggle,.fx-language-toggle,.fx-reference-ask').length,
    scrollHeight:document.documentElement.scrollHeight,
    viewport:innerHeight,
    magDomCanonical:!!document.querySelector('#hero .hero-space > .fx-crystal-organism-r326-stage'),
    canvasRect:(()=>{const r=document.querySelector('#hero .fx-crystal-organism-r326-stage')?.getBoundingClientRect();return r?{x:r.x,y:r.y,w:r.width,h:r.height}:null;})()
  }));
  assert.ok(native.frames>0,'Native WebGL archive never drew');
  assert.ok(native.magDomCanonical,'Native MAG must remain inside the original hero DOM');
  assert.ok(native.canvasRect?.w>110&&native.canvasRect?.h>110,'Archive canvas must have usable viewport geometry');
  if(isMobile){
    assert.ok(native.canvasRect.w>=viewport.width*.88,'Mobile archive must use the available screen width rather than a thumbnail: '+JSON.stringify(native.canvasRect));
    assert.ok(native.canvasRect.h>=viewport.height*.33&&native.canvasRect.h<=viewport.height*.48,
      'Mobile MAG must occupy its own upper cinematic stage without covering the native HTML paper: '+JSON.stringify(native.canvasRect));
  }
  assert.ok(native.drawCalls>0,'Archive WebGL geometry did not render');
  if (!isMobile && native.filamentCount < 1 && await page.evaluate(()=>document.documentElement.dataset.fxArchiveQuality==='high')) {
    throw new Error('High-quality archive scene did not emit any physical 3D filaments');
  }

  // The old suite merely counted GPU draw calls, so an entirely hidden archive
  // could still PASS. Prove the native MAG stage is layered over opaque chapters
  // and that scroll produces a visible, legible live chapter identifier.
  const handoff=await page.evaluate(()=>{
    const el=document.querySelector('.fx-archive-telemetry-r2022');
    const hero=document.querySelector('#hero');
    const stage=document.querySelector('#hero .fx-crystal-organism-r326-stage.fx-archive-native-docked');
    const hStyle=el?getComputedStyle(el):null;
    const heroStyle=hero?getComputedStyle(hero):null;
    const stageStyle=stage?getComputedStyle(stage):null;
    const rect=el?.getBoundingClientRect();
    return {
      exists:!!el,
      active:el?.dataset.active,
      name:el?.querySelector('.fx-archive-telemetry-r2022__title')?.textContent||'',
      opacity:Number(hStyle?.opacity||0),
      visibility:hStyle?.visibility,
      heroZ:Number(heroStyle?.zIndex||0),
      heroOpacity:Number(heroStyle?.opacity||0),
      stageZ:Number(stageStyle?.zIndex||0),
      stageOpacity:Number(stageStyle?.opacity||0),
      stageVisibility:stageStyle?.visibility,
      rect:rect?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:null
    };
  });
  assert.ok(handoff.exists&&handoff.active==='true','Visible MAG handoff missing: '+JSON.stringify(handoff));
  assert.ok(handoff.name.length>5,'MAG handoff lacks native chapter identity: '+JSON.stringify(handoff));
  assert.ok(handoff.opacity>.7&&handoff.visibility==='visible','MAG archive telemetry is transparent or hidden: '+JSON.stringify(handoff));
  assert.ok(handoff.heroZ>4&&handoff.stageZ>4,'MAG WebGL stage is hidden below opaque section stacking contexts: '+JSON.stringify(handoff));
  assert.ok(handoff.heroOpacity>.35&&handoff.stageOpacity>.35&&handoff.stageVisibility==='visible',
    'MAG scene is invisible despite GPU draw calls: '+JSON.stringify(handoff));
  assert.ok(handoff.rect&&handoff.rect.left>=0&&handoff.rect.top>=0&&handoff.rect.left+handoff.rect.width<=viewport.width+2,'MAG handoff outside mobile or desktop viewport: '+JSON.stringify(handoff));
  console.log('ARCHIVE_VISIBLE_HANDOFF_PASS',JSON.stringify({mode:isMobile?'mobile':'desktop',handoff}));

  assert.equal(native.renderer,'shared-webgl2');
  // Existing organism technical panels remain genuine working UI; opening
  // pricing must keep the same MAG renderer visible behind its glass console.
  await page.evaluate(()=>window.scrollTo({top:document.querySelector('#pricing')?.offsetTop||0,behavior:'instant'}));
  await page.waitForTimeout(350);
  const pricingTrigger=page.locator('[data-organism-open="pricing"]').first();
  if(await pricingTrigger.count()){
    await pricingTrigger.evaluate(el=>el.click());
    await page.waitForFunction(()=>document.body.classList.contains('fx-organism-panel-open'),null,{timeout:6000});
    const technical=await page.evaluate(()=>{
      const modal=document.querySelector('#fx-organism-console');
      const panel=modal?.querySelector('[data-organism-panel="pricing"]');
      return {on:!!modal&&!modal.hidden,mag:document.documentElement.dataset.fxArchiveCinema,
        controls:panel?.querySelectorAll('a[href],button,input,select').length||0};
    });
    assert.ok(technical.on&&technical.controls>=2&&technical.mag==='active',
      'Real licensing tech console must open inside MAG environment: '+JSON.stringify(technical));
    await page.locator('#fx-organism-console [data-organism-close]').first().evaluate(el=>el.click());
  }
    assert.ok(native.scrollHeight>native.viewport,'Native scrolling was lost');
  // Software WebGL readback can stall screenshots in CI even after all
  // native scroll/WebGL assertions pass. Capture is evidence, not a substitute
  // for functional testing; report incomplete captures explicitly.
  try {
    await page.screenshot({
      path:`${out}/archive-${isMobile?'mobile':'desktop'}.png`,
      fullPage:false,animations:'disabled',timeout:12000
    });
  } catch(error) {
    console.warn('ARCHIVE_CAPTURE_UNAVAILABLE',JSON.stringify({
      mode:isMobile?'mobile':'desktop',reason:String(error?.message||error).slice(0,400)
    }));
  }
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await sleep(200);
  const restored=await page.evaluate(()=>({dock:document.documentElement.dataset.fxArchiveDock,stage:!!document.querySelector('#hero .fx-crystal-organism-r326-stage')}));
  assert.ok(restored.stage,'MAG was not returned to original hero');
  assert.ok(errors.length===0,'Uncaught script errors: '+errors.join(' | '));
  console.log('ARCHIVE_PASS',JSON.stringify({mode:isMobile?'mobile':'desktop',init,passed,coverage,native,restored}));
  await context.close();
}
async function verifyNormalEntry(browser,isMobile){
  const address=new (require('node:url').URL)(URL);
  for(const key of ['archive','r486-optics-energy-check','mobileproof','lighthouse','visualintro'])
    address.searchParams.delete(key);
  const context=await browser.newContext({
    viewport:isMobile?{width:390,height:844}:{width:1440,height:900},
    isMobile,hasTouch:isMobile,reducedMotion:'no-preference'
  });
  await context.addInitScript(()=>{
    try{sessionStorage.setItem('formatx:mag-birth-live-r533-seen','1')}catch(_){}
    try{localStorage.setItem('formatx:intro-seen-v1','1')}catch(_){}
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  await page.goto(address.href,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>{
    const root=document.documentElement;
    return root.dataset.fxArchiveExperience==='ready'
      && root.dataset.fxArchiveCinema==='active';
  },null,{timeout:65000});
  const result=await page.evaluate(()=>{
    const root=document.documentElement;
    const folio=document.querySelector('[data-fx-cinema-panel-active="true"]');
    const hero=document.querySelector('#hero .hero-copy');
    const canvas=document.querySelector('#hero .fx-crystal-organism-r326-canvas');
    const folioStyle=folio&&getComputedStyle(folio);
    return {
      version:window.FormatXArchiveExperience?.version,
      experience:root.dataset.fxArchiveExperience,
      mode:root.dataset.fxArchiveCinema,
      scene:root.dataset.fxArchiveCurrent,
      activeFolio:!!folio&&folioStyle.visibility==='visible'
        &&folioStyle.display!=='none'&&folio.getBoundingClientRect().width>90,
      legacyVisible:!!hero&&getComputedStyle(hero).display!=='none'
        &&getComputedStyle(hero).visibility!=='hidden'&&hero.getClientRects().length>0,
      originalMAG:!!canvas,
      nativeLinkCount:folio?.querySelectorAll('a[href],button').length||0,
      source:location.search
    };
  });
  assert.equal(result.mode,'active','Plain public URL must enter exclusive MAG archive: '+JSON.stringify(result));
  assert.ok(result.activeFolio&&!result.legacyVisible&&result.originalMAG,
    'Normal returning visitor must see the real MAG and ONE interactive original papyrus, not the old UI: '+JSON.stringify(result));
  assert.equal(errors.length,0,'Uncaught normal-entry errors '+errors.join(' | '));
  console.log('ARCHIVE_NORMAL_ENTRY_PASS',JSON.stringify({mode:isMobile?'mobile':'desktop',...result}));
  await context.close();
}
async function missingGpuFallback(browser){
  const context=await browser.newContext({
    viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'
  });
  await context.addInitScript(()=>{
    const nativeGet=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      if(typeof type==='string'&&/^(webgl|webgl2|experimental-webgl)$/i.test(type))return null;
      return nativeGet.call(this,type,...args);
    };
  });
  const page=await context.newPage();
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>Boolean(window.FormatXArchiveExperience),null,{timeout:20000});
  await page.waitForTimeout(1300);
  const state=await page.evaluate(()=>{
    const root=document.documentElement;
    const experience=document.querySelector('#experience');
    const css=experience?getComputedStyle(experience):null;
    return {status:root.dataset.fxArchiveExperience,
      cinema:root.dataset.fxArchiveCinema||'home',
      prepared:root.dataset.fxArchiveCinemaPrepared||'',
      wrapperCount:document.querySelectorAll('.fx-archive-cinema-folio-r2030').length,
      stationCount:document.querySelectorAll('#fx-mag-ai-scroll-station-r2030').length,
      readable:!!experience&&experience.textContent.trim().length>80,
      visibility:css?.visibility,
      height:experience?.getBoundingClientRect().height};
  });
  assert.notEqual(state.cinema,'active','GPU-less browser hijacked into cinematic mode: '+JSON.stringify(state));
  assert.equal(state.wrapperCount,0,'No GPU: native HTML may not be reparented: '+JSON.stringify(state));
  assert.equal(state.stationCount,0,'No GPU: invisible scroll station must not be inserted: '+JSON.stringify(state));
  assert.ok(state.readable&&state.visibility==='visible','No GPU: semantic HTML unavailable: '+JSON.stringify(state));
  console.log('ARCHIVE_NO_WEBGL_FALLBACK_PASS',JSON.stringify(state));
  await context.close();
}
async function fallback(browser){
  const ctx=await browser.newContext({viewport:{width:1024,height:768},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Boolean(window.FormatXArchiveExperience),null,{timeout:30000});
  const v=await page.evaluate(()=>({
    state:document.documentElement.dataset.fxArchiveExperience,
    scene:document.querySelector('#experience')?.tagName,
    text:document.querySelector('#experience')?.textContent?.trim().length||0
  }));
  assert.equal(v.state,'reduced-html');
  assert.ok(v.text>20,'Reduced motion must preserve native HTML');
  console.log('ARCHIVE_REDUCED_PASS',JSON.stringify(v));
  await ctx.close();
}
(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
  ]});
  try{
    await evaluate({width:1440,height:900},false,browser);
    await evaluate({width:390,height:844},true,browser);
    await verifyNormalEntry(browser,false);
    await verifyNormalEntry(browser,true);
    await missingGpuFallback(browser);
    await fallback(browser);
  }finally{await browser.close();}
})().catch(e=>{console.error('ARCHIVE_FAIL',e.stack||String(e));process.exitCode=1;});
