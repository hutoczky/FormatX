'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const URL=process.env.FORMATX_ARCHIVE_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html?archive=1&r486-optics-energy-check=1';
const out='.archive-artifacts';
fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const jsSource=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
// R2058: film lighting follows the actual flexible membrane geometry,
 // rather than shading a curled display with a permanently flat surface
 // normal. Aerial depth haze is in the same shader and adds no draw calls.
 assert.match(jsSource,/localNormal=normalize\(vec3\(-dzdx,-dzdy,1\.0\)\)/,
   'R2058 missing physically curved glass normals');
 assert.match(jsSource,/in float vViewDistance;/,
   'R2058 missing interpolated archive depth for stable atmospheric extinction');
 assert.match(jsSource,/uPanel<\.5 && uFiber<\.5/,
   'R2058 depth treatment must never blur readable glass or energy filaments');
 const r2057Invalidate=jsSource.split('function invalidate(){')[1]?.split('function connect(){')[0]||'';
assert.match(r2057Invalidate,/if\(!domRaf\)/,
  'R2057 must coalesce repeated touch/wheel DOM transformations before next paint');
assert.match(r2057Invalidate,/requestAnimationFrame\(\(\)=>/,
  'R2057 must compose native HTML before the following browser paint');
assert.ok(r2057Invalidate.indexOf('setPanelState();')<r2057Invalidate.indexOf('if(!domRaf)'),
  'R2057 must keep source change and MAG selection synchronous for rapid reversing');
const rafUpdate=jsSource.split('function update(){')[1]?.split('function invalidate(){')[0]||'';
assert.ok(rafUpdate.length>180,'Missing canonical archive RAF update function');
assert.doesNotMatch(rafUpdate,/\b(?:setPanelState|updateRealContentSheets|syncCinema|updateHandoff|selectLiveChapter|ResponsiveExperience\.dock|ResponsiveExperience\.restore)\s*\(/,
  'R2053 must not remeasure eight live chapter anchors in the GPU RAF after synchronous scroll composition');
const folioUpdate=jsSource.split('function updateRealContentSheets(){')[1]?.split('function sceneForElement(')[0]||'';
const readStart=folioUpdate.indexOf('for(const node of nearby)');
const writeStart=folioUpdate.indexOf('for(const {node,entry,dir} of writes)');
assert.ok(readStart>=0&&writeStart>readStart,'R2053 missing measure-first/native-HTML-write-second passes');
assert.ok(folioUpdate.slice(readStart,writeStart).includes('node.getBoundingClientRect()'),
  'R2053 geometry snapshot no longer samples the actual original HTML documents');
assert.doesNotMatch(folioUpdate.slice(readStart,writeStart),/\.style\.setProperty\(/,
  'R2053 prohibits interleaving geometry reads with native HTML style writes');
assert.doesNotMatch(folioUpdate.slice(writeStart),/\.getBoundingClientRect\(/,
  'R2053 prohibits reading geometry after applying per-card layout transforms');
const panelState=jsSource.split('function setPanelState(){')[1]?.split('function selectLiveChapter(){')[0]||'';
assert.ok(panelState.includes('lastPanelNode')&&panelState.includes('lastPanelNode!==next'),
  'R2053 must clear only the previous physical paper when changing chapters');
assert.doesNotMatch(panelState,/for\s*\(const s of scenes\)/,
  'R2053 inactive archive sections must not receive redundant style writes per scroll');

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
  assert.equal(scenes.length,8,'Exactly eight original MAG shelf sources required');
  assert.equal(new Set(scenes.map(s=>s.key)).size,8,'MAG shelf keys must be unique');
  const uniquePapers=await page.evaluate(()=>{
    const scenes=window.FormatXArchiveExperience.scenes;
    const records=scenes.map(s=>{
      const node=document.querySelector('[data-fx-archive-scene="'+s.key+'"]');
      const host=node?.closest('main#main-content > section.scene, main#main-content > section.fx-category-deck--standalone');
      const panel=host?.querySelector(':scope > .fx-archive-cinema-folio-r2030');
      return {key:s.key,source:s.source,host:host?.id||host?.className||null,
        panel:!!panel,aiNative:node?.closest('#fx-mag-ai-scroll-station-r2030')!==null};
    });
    const hostElements=scenes.map(s=>document.querySelector('[data-fx-archive-scene="'+s.key+'"]')
      ?.closest('main#main-content > section.scene, main#main-content > section.fx-category-deck--standalone'));
    const ai=document.querySelector('#fx-mag-ai-scroll-station-r2030 .fx-mag-ai-native-cards-r2046 > .card');
    const diag=document.querySelector('#capabilities .fx-archive-cinema-folio-r2030');
    const aiPanel=document.querySelector('#fx-mag-ai-scroll-station-r2030 > .fx-archive-cinema-folio-r2030');
    return {records,uniqueHosts:new Set(hostElements).size,
      nativeAi:!!ai,aiDistinct:!!aiPanel&&aiPanel!==diag,
      legacyAiCardCount:document.querySelectorAll('#capabilities .cards > .card').length,
      interactiveAi:!!aiPanel?.querySelector('.fx-mag-ai-real-ask-r2046'),
      originalMoved:document.documentElement.dataset.fxArchiveAiOriginal,
      eightFolios:document.documentElement.dataset.fxArchiveDistinctFolios};
  });
  assert.equal(uniquePapers.uniqueHosts,8,'Two MAG shelf scenes illegally share a native paper: '+JSON.stringify(uniquePapers));
  assert.equal(Number(uniquePapers.eightFolios),8,'Renderer lost its eight original semantic folios: '+JSON.stringify(uniquePapers));
  assert.ok(uniquePapers.records.every(r=>r.panel),'Every source needs a real original HTML folio: '+JSON.stringify(uniquePapers));
  assert.ok(uniquePapers.nativeAi&&uniquePapers.aiDistinct&&uniquePapers.interactiveAi
    &&uniquePapers.originalMoved==='moved-once','AI still a false eighth scene: '+JSON.stringify(uniquePapers));
  await page.evaluate(()=>{
    const real=document.querySelector('#fx-mag-ai-scroll-station-r2030 .card');
    window.__fxAICardReferenceR2046=real;
    window.FormatXArchiveExperience.refresh();
    window.dispatchEvent(new CustomEvent('formatx:livingready'));
  });
  await page.waitForTimeout(180);
  const refreshContract=await page.evaluate(()=>{
    const root=document.documentElement;
    const ai=document.querySelector('#fx-mag-ai-scroll-station-r2030 .card');
    const scenes=window.FormatXArchiveExperience.scenes;
    const unique=new Set(scenes.map(s=>document.querySelector('[data-fx-archive-scene="'+s.key+'"]')
      ?.closest('main#main-content > section.scene, main#main-content > section.fx-category-deck--standalone')));
    return {sameAi:window.__fxAICardReferenceR2046===ai,hostCount:unique.size,
      panelCount:Number(root.dataset.fxArchiveDistinctFolios||0),
      sceneCount:scenes.length};
  });
  assert.ok(refreshContract.sameAi&&refreshContract.hostCount===8
    &&refreshContract.panelCount===8&&refreshContract.sceneCount===8,
    'Ready/refresh erased real MAG native paper identity: '+JSON.stringify(refreshContract));
  console.log('ARCHIVE_EIGHT_UNIQUE_NATIVE_FOLIOS_PASS',JSON.stringify({uniquePapers,refreshContract}));

  // R2048: native wheel/touch events within the SAME chapter must not
  // reapply nine ancestor CSSOM transform overrides on every scroll tick.
  // Test actual DOM state; do not turn this into an invented FPS metric.
  const anchorChanges=await page.evaluate(()=>{
    const before=Number(document.documentElement.dataset.fxArchiveAnchorTransitions||0);
    const chapter=document.documentElement.dataset.fxArchiveCinemaChapter||'';
    for(let i=0;i<7;i++)window.dispatchEvent(new Event('scroll'));
    const after=Number(document.documentElement.dataset.fxArchiveAnchorTransitions||0);
    return {before,after,chapter,afterChapter:document.documentElement.dataset.fxArchiveCinemaChapter};
  });
  assert.ok(anchorChanges.after<=anchorChanges.before+1
      &&anchorChanges.chapter===anchorChanges.afterChapter,
    'R2048 regressed into per-scroll CSSOM ancestor overrides: '+JSON.stringify(anchorChanges));
  console.log('ARCHIVE_TRANSITION_ONLY_STYLE_PASS',JSON.stringify(anchorChanges));

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
      // R2231: scene state can advance one frame before the native folio
      // handoff data attribute updates. Wait for the actual DOM source,
      // rather than asserting during the intermediate transition frame.
      await page.waitForFunction(expected=>{
        const panel=document.querySelector('main#main-content > [data-fx-cinema-host-active="true"] > .fx-archive-cinema-folio-r2030[data-fx-cinema-panel-active="true"]');
        return panel?.dataset.fxCinemaSource===expected;
      },scene.source,{timeout:5000});
      const real3D=await page.evaluate(()=>{
        const panel=document.querySelector('main#main-content > [data-fx-cinema-host-active="true"] > .fx-archive-cinema-folio-r2030[data-fx-cinema-panel-active="true"]');
        return {bridge:document.documentElement.dataset.fxArchiveNativeHandoff,
          source:panel?.dataset.fxCinemaSource,phase:panel?.dataset.fxCinemaHandoff,
          transform:panel?getComputedStyle(panel).transform:'none'};
      });
      const tabSafety=await page.evaluate(()=>{
        const panels=[...document.querySelectorAll('main#main-content > [data-fx-cinema-host-active] > .fx-archive-cinema-folio-r2030')];
        const active=panels.filter(p=>p.dataset.fxCinemaPanelActive==='true');
        const inactive=panels.filter(p=>p.dataset.fxCinemaPanelActive==='false');
        return {count:panels.length,active:active.length,
          activeInert:active.some(p=>p.inert),hiddenFocus:inactive.filter(p=>!p.inert).length,
          activeContentVisibility:active.map(p=>getComputedStyle(p).contentVisibility),
          archivedContentVisibility:inactive.map(p=>getComputedStyle(p).contentVisibility),
          remainingNativeNodes:inactive.every(p=>p.querySelectorAll('*').length>1)};
      });
      assert.ok(tabSafety.count===8&&tabSafety.active===1&&!tabSafety.activeInert&&!tabSafety.hiddenFocus,
        'Hidden native papers stole keyboard focus: '+JSON.stringify(tabSafety));
      assert.ok(tabSafety.activeContentVisibility.every(v=>v==='visible')
          &&tabSafety.archivedContentVisibility.every(v=>v==='hidden')
          &&tabSafety.remainingNativeNodes,
        'Inactive archived native HTML must skip expensive offscreen layout without deleting original content: '+JSON.stringify(tabSafety));
      console.log('ARCHIVE_SINGLE_LIVE_LAYOUT_PASS',JSON.stringify({scene:scene.key,active:tabSafety.activeContentVisibility,archived:tabSafety.archivedContentVisibility.length}));
            assert.equal(real3D.bridge,'scroll-coupled-real-3d-paper','Native HTML was not coupled to actual MAG retrieval');
      assert.equal(real3D.source,scene.source,'The handed-off folio does not originate from the scene shelf: '+JSON.stringify({expectedScene:scene.key,expectedSource:scene.source,actualSource:real3D.source,phase:real3D.phase,bridge:real3D.bridge}));
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
        const live=document.querySelector('[data-fx-cinema-panel-active="true"]');
        const marker=live?.querySelector(':scope > .fx-mag-folio-origin-r2041');
        const style=el?getComputedStyle(el):null;
        const markerStyle=marker?getComputedStyle(marker):null;
        return {key:el?.dataset.scene,active:el?.dataset.active,
          label:el?.querySelector('.fx-archive-telemetry-r2022__title')?.textContent||'',
          duplicateHidden:style?.display==='none'||style?.visibility==='hidden',
          marker:marker?.textContent||'',
          markerVisible:!!marker&&markerStyle?.display!=='none'&&markerStyle?.visibility!=='hidden',
          realCount:document.querySelectorAll('.fx-archive-cinema-folio-r2030[data-fx-cinema-panel-active="true"]').length
        };
      });
      assert.equal(chapterHandoff.key,scene.key,'MAG handoff not updated for '+scene.key+': '+JSON.stringify(chapterHandoff));
      assert.equal(chapterHandoff.active,'true','MAG handoff not active for '+scene.key);
      assert.ok(chapterHandoff.label.length>5,'No semantic chapter label for '+scene.key);
      assert.ok(chapterHandoff.duplicateHidden,'Decorative second papyrus competes with MAG: '+JSON.stringify(chapterHandoff));
      assert.equal(chapterHandoff.realCount,1,'Exactly ONE original, functional folio must be visible: '+JSON.stringify(chapterHandoff));
      assert.ok(chapterHandoff.markerVisible&&chapterHandoff.marker.startsWith('MAG // ')
        &&chapterHandoff.marker.includes('/ 08'),
        'The genuine folio must identify its source without a second overlay: '+JSON.stringify(chapterHandoff));
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
    permanentRacks:Number(document.documentElement.dataset.fxArchivePersistentRackCount||0),
    continuity:document.documentElement.dataset.fxArchiveWorldContinuity||'',
    optics:document.documentElement.dataset.fxArchiveOptics||'',
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
  assert.equal(native.permanentRacks,8,
    'The cinematic world must retain all eight physical archive bays: '+JSON.stringify(native));
  assert.equal(native.continuity,'persistent-one-world-r2044',
    'The archive background must be a persistent 3D world, not a section swap');
  assert.ok(native.filamentCount>=1,
    'Every quality tier must render actual 3D MAG energy filaments, including low-power mobile: '+JSON.stringify(native));

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
    const folio=document.querySelector('.fx-archive-cinema-folio-r2030[data-fx-cinema-panel-active="true"]');
    const nativeStyle=folio?getComputedStyle(folio):null;
    const paperRect=folio?.getBoundingClientRect();
    const marker=folio?.querySelector(':scope > .fx-mag-folio-origin-r2041');
    return {
      nativeVisible:!!folio&&nativeStyle?.visibility==='visible'&&nativeStyle?.display!=='none',
      nativeTag:marker?.textContent||'',
      nativeRect:paperRect?{left:paperRect.left,top:paperRect.top,width:paperRect.width,height:paperRect.height}:null,
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
  assert.ok(handoff.visibility==='hidden'||handoff.opacity<.1,
    'Old duplicate telemetry must NOT be visible above original native paper: '+JSON.stringify(handoff));
  assert.ok(handoff.nativeVisible&&handoff.nativeTag.startsWith('MAG // '),
    'Single original functional native papyrus must replace redundant overlay: '+JSON.stringify(handoff));
  assert.ok(handoff.heroZ>4&&handoff.stageZ>4,'MAG WebGL stage is hidden below opaque section stacking contexts: '+JSON.stringify(handoff));
  assert.ok(handoff.heroOpacity>.35&&handoff.stageOpacity>.35&&handoff.stageVisibility==='visible',
    'MAG scene is invisible despite GPU draw calls: '+JSON.stringify(handoff));
  assert.ok(handoff.nativeRect&&handoff.nativeRect.left>=-1
    &&handoff.nativeRect.left+handoff.nativeRect.width<=viewport.width+3,
    'Original folio outside mobile/desktop reading corridor: '+JSON.stringify(handoff));
  console.log('ARCHIVE_VISIBLE_HANDOFF_PASS',JSON.stringify({mode:isMobile?'mobile':'desktop',handoff}));

  assert.equal(native.renderer,'shared-webgl2');
  assert.equal(native.optics,'ggx-curved-normal-analytic-contact-aerial-fwidth',
    'The actual shared WebGL renderer did not activate R2058 curved glass optics');
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
    const renderBudget=await page.evaluate(()=>{
    const api=window.FormatXArchiveExperience;
    const original=document.documentElement.dataset.fxArchiveQuality||'high';
    const active=api.state;
    api.setQuality('low');
    const low=api.state.targetFrameMs;
    api.setQuality('high');
    const high=api.state.targetFrameMs;
    api.setQuality(original);
    const restored=api.state.targetFrameMs;
    return {before:active.targetFrameMs,low,high,restored,
      cpuSamples:active.cpuSamples,cpuSubmitMs:active.cpuSubmitMs,
      domComposes:active.domComposes,
      memoryGB:navigator.deviceMemory||null,cores:navigator.hardwareConcurrency||null};
  });
  assert.ok(Number.isInteger(renderBudget.domComposes)&&renderBudget.domComposes>=1,
    'Archive must synchronously compose the real original HTML folio: '+JSON.stringify(renderBudget));
    assert.ok(renderBudget.cpuSamples>=1,'Archive never recorded actual WebGL CPU submissions: '+JSON.stringify(renderBudget));
  assert.ok(renderBudget.low>=renderBudget.high&&renderBudget.high>0,
    'Adaptive renderer fails low/high quality cadence contract: '+JSON.stringify(renderBudget));
  if(isMobile&&!(renderBudget.memoryGB&&renderBudget.memoryGB<=2)
      &&!(renderBudget.cores&&renderBudget.cores<=2)){
    assert.ok(renderBudget.high<16.7&&renderBudget.low>=30,
      'High-capability mobile should allow 60Hz request pacing: '+JSON.stringify(renderBudget));
  }
  console.log('ARCHIVE_ADAPTIVE_CADENCE_PASS',JSON.stringify({mode:isMobile?'mobile':'desktop',...renderBudget}));

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
  // R2053: quantitative input-path time on this CI Chromium instance only.
  // No synthetic FPS claim: this records synchronous native scroll dispatch
  // and original HTML folio layout composition, not GPU paint time.
  const scrollMetrics=await page.evaluate(()=>{
    const y=scrollY,start=performance.now(),samples=[];
    const base=Math.max(0,document.querySelector('#experience')?.offsetTop||0);
    for(let i=0;i<32;i++){
      window.scrollTo({top:base+(i%2?18:58),behavior:'instant'});
      const t=performance.now();
      window.dispatchEvent(new Event('scroll'));
      samples.push(performance.now()-t);
    }
    window.scrollTo({top:y,behavior:'instant'});
    window.dispatchEvent(new Event('scroll'));
    samples.sort((a,b)=>a-b);
    const mean=samples.reduce((a,b)=>a+b,0)/samples.length;
    return {sampleCount:samples.length,meanMs:Number(mean.toFixed(3)),
      p95Ms:Number(samples[Math.floor(samples.length*.95)].toFixed(3)),
      totalWallMs:Number((performance.now()-start).toFixed(2)),
      contextCount:document.documentElement.dataset.fxCoreContexts||null};
  });
  assert.equal(scrollMetrics.sampleCount,32,'Scroll input benchmark must exercise real synchronous composition');
  console.log('ARCHIVE_SCROLL_INPUT_PROFILE_R2053',JSON.stringify({mode:isMobile?'mobile':'desktop',...scrollMetrics}));
  console.log('ARCHIVE_PASS',JSON.stringify({mode:isMobile?'mobile':'desktop',init,passed,coverage,native,restored}));
  await context.close();
}
async function verifyMobileLivingPulse(browser){
  const context=await browser.newContext({
    viewport:{width:390,height:844},isMobile:true,hasTouch:true,
    reducedMotion:'no-preference'
  });
  await context.addInitScript(()=>{
    try{sessionStorage.setItem('formatx:mag-birth-live-r533-seen','1')}catch(_){}
    try{localStorage.setItem('formatx:intro-seen-v1','1')}catch(_){}
  });
  const page=await context.newPage();
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>{
    const root=document.documentElement;
    const canvas=document.querySelector('#hero .fx-crystal-organism-r326-canvas');
    return root.dataset.fxCoreRenderer==='single-webgl-crystal-organism-r326'
      && !!canvas&&getComputedStyle(canvas).animationName.includes('fx-primary-mag');
  },null,{timeout:65000});
  const samples=[];
  for(let i=0;i<5;i++){
    samples.push(await page.evaluate(()=>{
      const canvas=document.querySelector('#hero .fx-crystal-organism-r326-canvas');
      const style=getComputedStyle(canvas);
      return {opacity:Number(style.opacity),animation:style.animationName,
        state:style.animationPlayState,
        registered:style.getPropertyValue('--fx-mag-life-opacity').trim()};
    }));
    await sleep(540);
  }
  const span=Math.max(...samples.map(x=>x.opacity))-Math.min(...samples.map(x=>x.opacity));
  assert.ok(samples.every(x=>x.state==='running'),
    'Living MAG unexpectedly paused on a normal visit: '+JSON.stringify(samples));
  assert.ok(span>.004,
    'MAG life animation masked by !important; no visible heartbeat: '+JSON.stringify({span,samples}));
  console.log('ARCHIVE_MOBILE_LIVING_PULSE_PASS',JSON.stringify({span,samples}));
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
  if(isMobile){
    // Lighthouse's authentic filmstrip found that the first native folio
    // could DISAPPEAR after ~14s despite passing immediate-entry assertions.
    // Keep this NORMAL browser session alive beyond all late intro/idle timers.
    await page.waitForTimeout(14800);
    const late=await page.evaluate(()=>{
      const root=document.documentElement;
      const p=document.querySelector('[data-fx-cinema-panel-active="true"]');
      const b=p?.getBoundingClientRect(),cs=p&&getComputedStyle(p);
      const mag=document.querySelector('#hero .fx-crystal-organism-r326-stage')?.getBoundingClientRect();
      const x=b?Math.max(4,Math.min(innerWidth-4,b.left+b.width/2)):0;
      const y=b?Math.max(4,Math.min(innerHeight-4,b.top+Math.min(b.height/2,140))):0;
      const overlay=p&&document.elementFromPoint(x,y);
      return {state:root.dataset.fxArchiveExperience,mode:root.dataset.fxArchiveCinema,
        chapter:root.dataset.fxArchiveCinemaChapter,
        p:!!p,box:b?{x:b.x,y:b.y,w:b.width,h:b.height}:null,
        display:cs?.display,visibility:cs?.visibility,opacity:cs?.opacity,
        ancestor:getComputedStyle(p?.parentElement||document.body).transform,
        hit:overlay?.tagName,withinPaper:!!p&&p.contains(overlay),
        magBottom:mag?.bottom||0,viewport:{w:innerWidth,h:innerHeight},
        error:root.dataset.fxArchiveError||null};
    });
    assert.ok(late.mode==='active'&&late.p&&late.display!=='none'&&late.visibility==='visible'
      &&Number(late.opacity)>.4&&late.box?.w>300&&late.box.y<late.viewport.h
      &&late.box.y>=0&&late.withinPaper,
      'Mobile MAG native paper disappeared after 14s (Lighthouse filmstrip regression): '+JSON.stringify(late));
    console.log('ARCHIVE_MOBILE_LATE_15S_VISIBLE_PASS',JSON.stringify(late));
  }
  await context.close();
}
async function verifyFirstVisitIntroHandoff(browser){
  // The normal-entry suite above uses a returning visitor. Production must
  // ALSO deliver a real paper on the FIRST visit after the full 10s genesis.
  // Guard against a late intro teardown blanking the actual interactive UI.
  const u=new (require('node:url').URL)(URL);
  for(const k of ['r486-optics-energy-check','lighthouse','visualintro','mobileproof'])u.searchParams.delete(k);
  u.searchParams.set('archive','1');
  u.searchParams.set('intro','1');
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,
    reducedMotion:'no-preference'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  await page.goto(u.href,{waitUntil:'domcontentloaded',timeout:65000});
  await page.waitForFunction(()=>{
    const root=document.documentElement;
    return root.dataset.fxMagBirthOwnerR533==='active';
  },null,{timeout:30000});
  await page.waitForFunction(()=>{
    const root=document.documentElement;
    return root.dataset.fxArchiveCinema==='active'
      && root.dataset.fxArchiveExperience==='ready'
      && !document.querySelector('.fx-mag-birth-r533:not([hidden])');
  },null,{timeout:45000});
  await page.waitForTimeout(1800);
  const state=await page.evaluate(()=>{
    const root=document.documentElement;
    const stage=document.querySelector('#hero .fx-crystal-organism-r326-stage');
    const folio=document.querySelector('[data-fx-cinema-panel-active="true"]');
    const rect=folio?.getBoundingClientRect();
    const style=folio&&getComputedStyle(folio);
    const magRect=stage?.getBoundingClientRect();
    const buttons=[...folio?.querySelectorAll('a[href],button')||[]]
      .filter(x=>x.getBoundingClientRect().width>30).length;
    return {intro:root.dataset.fxMagBirthOwnerR533,mode:root.dataset.fxArchiveCinema,
      chapter:root.dataset.fxArchiveCurrent,folio:!!folio,
      visible:style?.display!=='none'&&style?.visibility!=='hidden'&&Number(style?.opacity)>.4,
      rect:rect?{x:rect.x,y:rect.y,w:rect.width,h:rect.height}:null,
      mag:magRect?{y:magRect.y,h:magRect.height,bottom:magRect.bottom}:null,
      validOriginal:folio?.textContent?.trim().length>100,buttons,
      errors:root.dataset.fxArchiveError||''};
  });
  assert.ok(state.folio&&state.visible&&state.validOriginal&&state.rect?.w>260
    &&state.rect.y>=0
    &&state.rect.y<844&&state.rect.h>230,
    'First-ever user must see real interactive MAG paper after 10s cinematic intro: '+JSON.stringify(state));
  assert.deepEqual(errors,[],'First-visit intro JavaScript error');
  console.log('ARCHIVE_FIRST_VISIT_MAG_HANDOFF_PASS',JSON.stringify(state));
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
    await verifyFirstVisitIntroHandoff(browser);
    await verifyMobileLivingPulse(browser);
    await missingGpuFallback(browser);
    await fallback(browser);
  }finally{await browser.close();}
})().catch(e=>{console.error('ARCHIVE_FAIL',e.stack||String(e));process.exitCode=1;});
