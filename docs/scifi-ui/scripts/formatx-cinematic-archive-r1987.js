/* FormatX R1987 — Cinematic Archive native WebGL scene.
   Same context/canvas and original living MAG, no second WebGL renderer.
   Section content remains native HTML. All phases derive from scroll geometry. */
(() => {
  'use strict';
  const root=document.documentElement;
  const VERSION='cinematic-archive-r2301-reactive-volume';
  if(root.dataset.fxArchiveExperience) return;
  const params=new URLSearchParams(location.search);
  const audit=/Chrome-Lighthouse/i.test(navigator.userAgent||'')||params.get('lighthouse')==='1';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const force=params.get('archive')==='1';
  // R2220: do not jump the hero into archive dock automatically when the
  // native shader becomes ready several seconds after first paint.
  // Explicit archive URLs and deep links keep their existing semantics.
  // Layout anchoring during boot can move scrollY without any user action.
  // Only an explicit deep link, requested archive, or genuine restored
  // history navigation may arm the archive before trusted visitor input.
  const navigationType=performance.getEntriesByType?.('navigation')?.[0]?.type;
  function initialJourney(force,hash,scroll,navigation){
    return force || Boolean(hash&&hash!=='#hero'&&hash!=='#top') ||
      (scroll>32 && navigation==='back_forward');
  }
  let journeyArmed=initialJourney(force,location.hash,scrollY,navigationType);
  root.dataset.fxArchiveEngagementR2220=journeyArmed?'deep-link':'awaiting-visitor';
  const requestedHtmlFallback=params.get('archive')==='off';
  const isolatedMagCheck=params.has('r486-optics-energy-check')||params.has('mobileproof');
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const mobileQuery=matchMedia('(max-width: 900px)');
  const mobile=()=>mobileQuery.matches;
  const blueprint=[
    {selector:'#experience',key:'ecosystem',hu:'FORMATX ÖKOSZISZTÉMA',en:'FORMATX ECOSYSTEM',source:'left-shelf',color:[.50,.81,.94]},
    {selector:'#live-os-overview, .fx-category-deck--standalone',key:'systems',hu:'LIVE OS / RENDSZERKATEGÓRIÁK',en:'LIVE OS / SYSTEM CATEGORIES',source:'rotor',color:[.65,.78,.99]},
    {selector:'#capabilities',key:'diagnostics',hu:'DIAGNOSZTIKA',en:'DIAGNOSTICS',source:'bottom-drawer',color:[.48,.95,.87]},
    {selector:'#network',key:'network',hu:'HÁLÓZATI ESZKÖZÖK',en:'NETWORK TOOLS',source:'right-cell',color:[.54,.80,.97]},
    {selector:'#system',key:'security',hu:'RENDSZER ÉS BIZTONSÁG',en:'SYSTEM & SECURITY',source:'sealed-vault',color:[.74,.86,.98]},
    {selector:'#pricing',key:'licensing',hu:'LICENCEK ÉS CSOMAGOK',en:'LICENSING & PLANS',source:'vertical-crystal',color:[.92,.77,.60]},
    {selector:'#fx-mag-ai-scroll-station-r2030 .cards .card, #capabilities .cards .card:last-child',key:'intelligence',hu:'AI SEGÍTSÉG',en:'AI GUIDANCE',source:'inner-chamber',color:[.66,.88,1]},
    {selector:'#resources',key:'final',hu:'FORMATX ERŐFORRÁSOK',en:'FORMATX RESOURCES',source:'assembled',color:[.82,.91,1]}
  ];
  let scenes=[],current=null,drawPass=null,detach=null,stage=null,heroHost=null;
  let lastPanelNode=null;
  let raf=0,domRaf=0,gpuTailTimer=0,lastGpu=0,lastScene=-1,disposed=false,painted=0,archiveActive=false,updates=0,domComposes=0;
  // R2235: the idle home scene has no readable 3D archive chapter. Its
  // initial DOM/ARIA synchronization only needs one composed frame.
  let idleComposed=false,idleFastPathSkips=0;
  const reactorProof={entryFrames:0,corridorFrames:0,chapters:new Set(),peakAlpha:0};
  let lastRenderedGate=false;
  let sceneObserver=null,handoff=null,handoffKey='',paperNodes=[];
  let registeredCanvas=null,registeredApi=null;
  let cinemaHosts=[],cinemaPrepared=false,lastCinemaKey='',entryReactorHost=null;
  let aiCardHome=null; // the real sixth module, never a cloned/placeholder AI scene

  let cinemaControlHome=null,finalCtaHome=null,uniqueProofHome=null;
  const legacyHeroDisplay=new Map();
  let heroVisualState=null;
  function setHeroCanvasLaneFront(active){
    const hero=document.getElementById('hero');
    if(!hero)return;
    const properties=['z-index','pointer-events','background','box-shadow'];
    if(active&&!heroVisualState){
      heroVisualState={hero,prior:properties.map(name=>[
        name,hero.style.getPropertyValue(name),hero.style.getPropertyPriority(name)
      ])};
      // The MAG owns the visual lane without stealing gestures from the
      // active native HTML paper. The original Ask/Pause controls stay live.
      hero.style.setProperty('z-index','55','important');
      hero.style.setProperty('pointer-events','none','important');
      hero.style.setProperty('background','transparent','important');
      hero.style.setProperty('box-shadow','none','important');
    }else if(!active&&heroVisualState){
      for(const [name,value,priority] of heroVisualState.prior){
        if(value)heroVisualState.hero.style.setProperty(name,value,priority);
        else heroVisualState.hero.style.removeProperty(name);
      }
      heroVisualState=null;
    }
  }
  function setLegacyHeroHidden(hide){
    if(hide){
      // Older hero styles contain high-specificity !important declarations.
      // CSS-only takeover still left the old heading on top of the archive.
      // Inline CSSOM important guarantees one exclusive stage, and can be
      // restored exactly, including the previous inline priority.
      if(legacyHeroDisplay.size)return;
      const hero=document.getElementById('hero');
      if(!hero)return;
      const furniture=[
        ...hero.querySelectorAll(':scope .hero-grid > :not(.hero-space)'),
        ...hero.querySelectorAll(':scope .scroll-cue')
      ];
      for(const node of new Set(furniture)){
        legacyHeroDisplay.set(node,{
          value:node.style.getPropertyValue('display'),
          priority:node.style.getPropertyPriority('display')
        });
        node.style.setProperty('display','none','important');
      }
      root.dataset.fxArchiveLegacyHero='suppressed';
    }else if(legacyHeroDisplay.size){
      for(const [node,old] of legacyHeroDisplay){
        if(old.value)node.style.setProperty('display',old.value,old.priority);
        else node.style.removeProperty('display');
      }
      legacyHeroDisplay.clear();
      root.dataset.fxArchiveLegacyHero='restored';
    }
  }
  function attachExistingProofBlock(){
    if(uniqueProofHome)return;
    const proof=document.querySelector('main#main-content > .fx-award-proof[data-fx-award-proof]');
    const scene=scenes.find(s=>s.key==='final');
    if(!proof||!scene?.cinemaPanel)return;
    uniqueProofHome={node:proof,parent:proof.parentNode,next:proof.nextSibling};
    const holder=document.createElement('div');
    holder.className='fx-archive-canonical-proof-r2033';
    holder.appendChild(proof);
    scene.cinemaPanel.appendChild(holder);
    uniqueProofHome.holder=holder;
    root.dataset.fxArchiveUniqueProof='final-native-folio';
  }
  function restoreExistingProofBlock(){
    if(!uniqueProofHome)return;
    const {node,parent,next,holder}=uniqueProofHome;
    if(parent.isConnected)parent.insertBefore(node,next&&next.parentNode===parent?next:null);
    holder.remove();
    uniqueProofHome=null;
    delete root.dataset.fxArchiveUniqueProof;
  }
  function attachExistingFinalCta(){
    if(finalCtaHome)return;
    const anchor=document.getElementById('hero-download');
    const scene=scenes.find(s=>s.key==='final');
    const panel=scene?.cinemaPanel;
    if(!anchor||!panel||!anchor.parentNode)return;
    finalCtaHome={node:anchor,parent:anchor.parentNode,next:anchor.nextSibling};
    const holder=document.createElement('div');
    holder.className='fx-archive-final-cta-r2032';
    holder.appendChild(anchor);
    panel.appendChild(holder);
    finalCtaHome.holder=holder;
  }
  function restoreExistingFinalCta(){
    if(!finalCtaHome)return;
    const {node,parent,next,holder}=finalCtaHome;
    if(parent.isConnected)parent.insertBefore(node,next&&next.parentNode===parent?next:null);
    holder.remove();
    finalCtaHome=null;
  }
  function keepExistingCinemaControls(){
    // R2038: keep the real SOUND + ASK controls in their original shared
    // .fx-reference-controls-r204 container. Moving the rail alone broke
    // both the original control contract and real pointer hit testing.
    root.dataset.fxCinemaControls='original-shared-live-controls';
  }
  function restoreExistingCinemaControls(){
    delete root.dataset.fxCinemaControls;
  }
  // Do not displace the original MAG while the first-visit ten-second film owns it.
  let introDone=!(root.dataset.fxMagBirthOwnerR533==='active'||document.getElementById('fx-mag-birth-prepaint-r1606'));
  const paperLast=new WeakMap();
  // Compare actual inline values, not a stale shadow cache: other owners may
  // legitimately change a shared DOM node between two archive frames.
  let styleWrites=0,styleSkips=0;
  function setMotionStyle(node,name,value){
    if(node.style.getPropertyValue(name)===value&&!node.style.getPropertyPriority(name)){
      styleSkips++;return;
    }
    node.style.setProperty(name,value);
    styleWrites++;
  }
  function setData(node,name,value){
    if(node.dataset[name]!==value)node.dataset[name]=value;
  }
  function clearMotionStyle(node,name){
    if(node.style.getPropertyValue(name))node.style.removeProperty(name);
  }
  const memoryGB=Number(navigator.deviceMemory||0);
  const cores=Number(navigator.hardwareConcurrency||0);
  const mobilePerf=mobile()&&Boolean((memoryGB>0&&memoryGB<=4)||(cores>0&&cores<=4));
  const veryLowPower=mobile()&&Boolean((memoryGB>0&&memoryGB<=2)||(cores>0&&cores<=2));
  let quality=mobilePerf?'low':'high';
  // R2227: reuse the ONLY living MAG renderer's already-computed
  // hardware/software classification; no second GPU probe or fingerprint.
  // Keep premium high-detail material on genuine GPU-backed desktops.
  const softwareMagRenderer=()=>root.dataset.fxCoreRendererClassR1541==='software-adaptive';
  root.dataset.fxArchiveExperience='pending';
  function ensureAIScrollStation(){
    if(document.getElementById('fx-mag-ai-scroll-station-r2030'))return;
    const original=document.querySelector('#capabilities .cards .card:last-child');
    const destination=document.getElementById('network')||document.getElementById('pricing');
    if(!(original instanceof HTMLElement)||!destination?.parentNode||!original.parentNode)return;
    const anchor=document.createElement('section');
    anchor.id='fx-mag-ai-scroll-station-r2030';
    anchor.className='scene fx-mag-ai-scroll-station-r2030';
    anchor.dataset.fxArchivePhysicalAi='original-card';
    anchor.setAttribute('aria-label','MAG // AI / AUTOMATION');
    // Preserve the SAME six-module original card and its listeners; only the
    // successful WebGL experience may move this content out of diagnostics.
    aiCardHome={node:original,parent:original.parentNode,next:original.nextSibling};
    const realCards=document.createElement('div');
    realCards.className='cards fx-mag-ai-native-cards-r2046';
    realCards.appendChild(original);
    const ask=document.createElement('button');
    ask.type='button';
    ask.className='fx-mag-ai-real-ask-r2046';
    ask.dataset.hu='Kérdezd a MAG-ot';
    ask.dataset.en='Ask the MAG';
    ask.textContent=root.lang==='en'?ask.dataset.en:ask.dataset.hu;
    ask.addEventListener('click',()=>{
      if(window.FormatXOrganismVoice?.open)window.FormatXOrganismVoice.open();
      else document.querySelector('.fx-reference-ask')?.click();
    });
    realCards.appendChild(ask);
    anchor.appendChild(realCards);
    // Placed after the REAL network chapter and before the final release:
    // the chapter has its own physical source and its own real document.
    destination.after(anchor);
    for(const name of ['height','min-height','max-height'])anchor.style.setProperty(name,'165dvh','important');
    root.dataset.fxArchiveAiOriginal='moved-once';
  }
  function restoreOriginalAI(){
    const prior=aiCardHome;
    if(prior){
      const {node,parent,next}=prior;
      if(parent.isConnected)parent.insertBefore(node,next?.parentNode===parent?next:null);
      aiCardHome=null;
    }
    document.getElementById('fx-mag-ai-scroll-station-r2030')?.remove();
    delete root.dataset.fxArchiveAiOriginal;
  }
  function discover(){
    const previous=scenes.map(x=>x.node);
    const retained=new Map(scenes.map(s=>[s.key,s]));
    scenes=blueprint.map(def=>{
      // querySelector() respects DOCUMENT order, not comma-separated selector
      // order. Once the original AI card moves to the final rack, the old
      // capabilities "last-child" is a different diagnostic card. Prefer the
      // original node in its real separate archive; fallback only pre-WebGL.
      const node=def.key==='intelligence'
        ?(document.querySelector('#fx-mag-ai-scroll-station-r2030 .cards .card')
          ||document.querySelector('#capabilities .cards .card:last-child'))
        :document.querySelector(def.selector);
      if(!(node instanceof HTMLElement))return null;
      const prior=retained.get(def.key);
      // Survives readiness/resize/language/locale rediscovery. Newly minted
      // scene objects previously lost cinemaHost and cinemaPanel, leaving
      // native document content invisible after refresh.
      return prior?.node===node?{...prior,...def,node}:{...def,node};
    }).filter(Boolean);
    for(const scene of scenes){
      scene.scrollAnchor=scene.key==='intelligence'
        ? document.getElementById('fx-mag-ai-scroll-station-r2030')||scene.node
        : scene.node;
    }
    scenes.sort((a,b)=>a.scrollAnchor.compareDocumentPosition(b.scrollAnchor)&Node.DOCUMENT_POSITION_PRECEDING?1:-1);
    for(const node of previous){if(!scenes.some(s=>s.node===node))node.removeAttribute('data-fx-archive-scene');}
    scenes.forEach((s,i)=>{s.index=i;s.node.dataset.fxArchiveScene=s.key;});
    if(sceneObserver){
      sceneObserver.disconnect();
      scenes.forEach(s=>sceneObserver.observe(s.node));
    }
    root.dataset.fxArchiveSceneCount=String(scenes.length);
    if(!cinemaPrepared&&root.dataset.fxArchiveExperience==='ready'){
      prepareRealContentSheets();
      prepareCinemaHosts();
    }else if(cinemaPrepared){
      // Rebind existing ONLY; no new WebGL context, no second paper or clone.
      for(const scene of scenes){
        const host=scene.node.closest('main#main-content > section.scene,main#main-content > section.fx-category-deck--standalone');
        scene.cinemaHost=host;
        scene.cinemaPanel=host?.querySelector(':scope > .fx-archive-cinema-folio-r2030')||null;
      }
    }
    root.dataset.fxArchiveDistinctFolios=String(new Set(scenes.map(s=>s.cinemaPanel).filter(Boolean)).size);
  }

  /* R2030 EXCLUSIVE FORMATX ARCHIVE.
     The original live DOM nodes are moved ONCE into a semantic, scrollable
     cinematic folio inside their original section, preserving their identity,
     event handlers, links, IDs and delegated events on the section.
     Every original section remains in the document as a scroll anchor.
     No clones, dummy tiles, canvas text, videos or second 3D renderer. */
  function prepareCinemaHosts(){
    // R2230: measure every unique native section BEFORE moving even one
    // child. Interleaving host.getBoundingClientRect() with prior
    // appendChild()/height writes forced 7 expensive layout flushes.
    // One read phase + one write phase retains all original DOM nodes.
    const originalHeights=new Map();
    for(const scene of scenes){
      const host=scene.node.closest('main#main-content > section.scene,main#main-content > section.fx-category-deck--standalone');
      if(!(host instanceof HTMLElement)||originalHeights.has(host))continue;
      if(!host.querySelector(':scope > .fx-archive-cinema-folio-r2030')){
        originalHeights.set(host,Math.max(520,host.getBoundingClientRect().height||host.offsetHeight));
      }
    }
    root.dataset.fxArchiveLayoutBatchR2230='read-before-write';
    root.dataset.fxArchiveLayoutReadCountR2230=String(originalHeights.size);
    for(const scene of scenes){
      const host=scene.node.closest('main#main-content > section.scene,main#main-content > section.fx-category-deck--standalone');
      if(!(host instanceof HTMLElement))continue;
      scene.cinemaHost=host;
      let panel=host.querySelector(':scope > .fx-archive-cinema-folio-r2030');
      if(!panel){
        const oldHeight=originalHeights.get(host)||520;
        panel=document.createElement('div');
        panel.className='fx-archive-cinema-folio-r2030';
        panel.setAttribute('role','region');
        panel.setAttribute('aria-label','FormatX MAG cinematic content');
        // Adding one wrapper preserves the source section's layout anchor,
        // its own events and all real interactive descendants.
        const nodes=Array.from(host.childNodes);
        for(const node of nodes)panel.appendChild(node);
        host.appendChild(panel);
        // The actual original HTML is the ONLY readable archive display.
        // One discreet physical source ID lives inside that same document,
        // never as a second overlapping card near the living MAG.
        const sourceMarker=document.createElement('span');
        sourceMarker.className='fx-mag-folio-origin-r2041';
        sourceMarker.setAttribute('aria-hidden','true');
        panel.prepend(sourceMarker);
        // Inline important chapter sizing wins over older high-specificity
        // content-visibility/intrinsic-height rules, which otherwise collapse
        // mobile sections to ~62px during the DOM-to-paper handoff.
        if(!host._fxArchiveOriginalHeights){
          host._fxArchiveOriginalHeights=['min-height','height','max-height'].map(name=>[
            name,host.style.getPropertyValue(name),host.style.getPropertyPriority(name)
          ]);
        }
        host.style.setProperty('min-height','165dvh','important');
        host.style.setProperty('height','165dvh','important');
        host.style.setProperty('max-height','165dvh','important');
        host.dataset.fxCinemaAnchorHeight=String(Math.round(oldHeight));
      }
      if(!cinemaHosts.includes(host))cinemaHosts.push(host);
      scene.cinemaPanel=panel;
    }
    if(cinemaHosts.length){
      // Actual document order, not the blueprint's editorial source order.
      entryReactorHost=cinemaHosts.reduce((first,host)=>
        !first||(host.compareDocumentPosition(first)&Node.DOCUMENT_POSITION_FOLLOWING)?host:first,null);
      cinemaPrepared=true;
      root.dataset.fxArchiveCinemaPrepared=String(cinemaHosts.length);
      attachExistingFinalCta();
      attachExistingProofBlock();
    }
  }

  const cinematicAnchorOverrides=[
    ['transform','none'],['translate','none'],['rotate','none'],
    ['scale','none'],['filter','none'],['perspective','none'],
    ['contain','none'],['will-change','auto'],['content-visibility','visible']
  ];
  // An active MAG scroll chapter is an anchor, not a styled page section.
  // Switching these nine geometry overrides every wheel/touch event forced
  // repeated style invalidation and stole CPU time from the one WebGL2 MAG.
  // Apply only on actual scene transitions and restore exact inline priorities.
  function setArchiveAnchorNeutral(host,active){
    if(!(host instanceof HTMLElement))return;
    if(active){
      if(host._fxCinemaOriginalTransform)return;
      host._fxCinemaOriginalTransform=cinematicAnchorOverrides.map(([name])=>
        [name,host.style.getPropertyValue(name),host.style.getPropertyPriority(name)]);
      for(const [name,value] of cinematicAnchorOverrides)
        host.style.setProperty(name,value,'important');
    }else{
      if(!host._fxCinemaOriginalTransform)return;
      for(const [name,value,priority] of host._fxCinemaOriginalTransform){
        if(value)host.style.setProperty(name,value,priority);
        else host.style.removeProperty(name);
      }
      delete host._fxCinemaOriginalTransform;
    }
    root.dataset.fxArchiveAnchorTransitions=String(
      (Number(root.dataset.fxArchiveAnchorTransitions)||0)+1);
  }
  function positionCinemaFolio(panel){
    if(!panel||!panel.isConnected)return;
    // The canonical site contains ancestor perspective/transform contexts,
    // which change the containing block of a fixed child. Solve in viewport
    // coordinates instead of resetting those ancestors (doing so breaks
    // the living MAG renderer and the native pricing/menu consoles).
    const w=innerWidth,h=innerHeight,phone=mobile();
    // A transformed chapter captures position:fixed descendants. Neutralize
    // only the active cinematic scroll anchor (its original HTML has already
    // been transferred into the folio), preserving the original parent state
    // for the accessible HTML fallback and the existing MAG hero renderer.
    // The selected scroll anchor is already neutralized by syncCinema().
    // Do not mutate the same nine ancestor properties again per frame.
    // On portrait devices the folio has a strict fixed top/bottom lane in CSS.
    // Compensating viewport offsets on every scroll caused cumulative Y drift
    // (-394px) and the genuine native paper overlapped the MAG stage.
    // Never apply legacy transform-ancestor compensation on a phone.
    if(phone){
      // CSS fixed positioned descendants can still be captured by transformed
      // chapter ancestors. Correct their ACTUAL screen box, once per scrub.
      // Use a bounded, absolute-in-screen translation, not an accumulating
      // transform offset from a previous scroll chapter.
      const stage=document.querySelector('#hero .fx-crystal-organism-r326-stage.fx-archive-native-docked');
      const magBottom=stage?.getBoundingClientRect().bottom||h*.45;
      const viewportTop=Math.max(h*.51,magBottom+Math.min(24,h*.034));
      // No per-scroll cumulative coordinates: this is genuinely viewport-
      // fixed once the source chapter no longer creates a containing block.
      clearMotionStyle(panel,'translate');
      clearMotionStyle(panel,'--fx-cinema-screen-x');
      clearMotionStyle(panel,'--fx-cinema-screen-y');
      const screenTop=viewportTop.toFixed(2);
      if(panel.dataset.fxMobileScreenTop!==screenTop){
        panel.style.setProperty('top',screenTop+'px','important');
        panel.dataset.fxMobileScreenTop=screenTop;
      }
      return;
    }
    const desiredWidth=Math.min(w*(phone?.92:.51),phone?w:920);
    const x=phone?w*.04:w-w*.027-desiredWidth;
    const y=phone?h*.48:h*.11;
    const r=panel.getBoundingClientRect();
    const previousX=parseFloat(panel.style.getPropertyValue('--fx-cinema-screen-x'))||0;
    const previousY=parseFloat(panel.style.getPropertyValue('--fx-cinema-screen-y'))||0;
    const dx=x-r.left,dy=y-r.top;
    if(Math.abs(dx)>1)panel.style.setProperty('--fx-cinema-screen-x',(previousX+dx).toFixed(2)+'px');
    if(Math.abs(dy)>1)panel.style.setProperty('--fx-cinema-screen-y',(previousY+dy).toFixed(2)+'px');
  }

  function syncCinema(){
    if(!cinemaPrepared)return;
    // Technical dialogs retain the same living MAG stage; only the native
    // interactive paper expands into a focused technical instrument.
    const enabled=Boolean(root.dataset.fxArchiveExperience==='ready'&&archiveActive&&current&&!reduced.matches);
    const sceneMode=enabled?'active':'home';
    if(root.dataset.fxArchiveCinema!==sceneMode)root.dataset.fxArchiveCinema=sceneMode;
    if(enabled)keepExistingCinemaControls();
    setLegacyHeroHidden(enabled);
    setHeroCanvasLaneFront(enabled);
    const selected=enabled?current.s:null;
    const key=selected?.key||'home';
    if(root.dataset.fxArchiveCinemaChapter!==key)root.dataset.fxArchiveCinemaChapter=key;
    for(const host of cinemaHosts){
      const active=Boolean(selected&&selected.cinemaHost===host);
      const hostState=active?'true':'false';
      if(host.dataset.fxCinemaHostActive!==hostState){
        host.dataset.fxCinemaHostActive=hostState;
        setArchiveAnchorNeutral(host,active);
      }
      const panel=host.querySelector(':scope > .fx-archive-cinema-folio-r2030');
      if(panel){
        // Hidden chapters must never remain in tab/screen-reader order.
        // The HTML stays native and focusable again on its own turn.
        if(panel.inert===active)panel.inert=!active;
        const panelState=active?'true':'false';
        if(panel.dataset.fxCinemaPanelActive!==panelState)panel.dataset.fxCinemaPanelActive=panelState;
        if(active){
          const marker=panel.querySelector(':scope > .fx-mag-folio-origin-r2041');
          const english=root.lang==='en';
          const sourceName=(sourceNames[selected.source]||[selected.source,selected.source])[english?1:0];
          const accessibleSource='FormatX MAG: '+String(selected.index+1).padStart(2,'0')+' / '+String(scenes.length).padStart(2,'0')+' · '+sourceName;
          if(panel.getAttribute('aria-label')!==accessibleSource)panel.setAttribute('aria-label',accessibleSource);
          const transfer=reactorHandoff(selected,current.progress);
          if(marker){
            const destination='MAG // '+String(selected.index+1).padStart(2,'0')+' / '+String(scenes.length).padStart(2,'0')+' · '+sourceName;
            const arrival=systemArrivalPhase(selected,current.progress,current.travel,mobile()&&softwareMagRenderer());
            const expected=systemArrivalLabel(arrival,english,destination);
            if(marker.textContent!==expected)marker.textContent=expected;
            setData(marker,'fxArrivalPhaseR2290',arrival);
          }
          setData(root,'fxArchiveVisibleInterface','single-native-folio');
          const p=clamp(current.progress);
          // R2038: deliver the REAL interactive folio throughout the scroll beat.
          // Previously opacity zero hid all actual content while a small
          // decorative status card remained visible in production screenshots.
          const entry=smooth((p-.035)/.28)*transfer.settle,exit=smooth((p-.94)/.06);
          const materialize=(.83+.17*entry)*(1-.09*exit);
          setMotionStyle(panel,'--fx-cinema-materialize',materialize.toFixed(4));
          setMotionStyle(panel,'--fx-cinema-orbit',(1-materialize).toFixed(4));
          setMotionStyle(panel,'--fx-cinema-depth',Math.round((1-materialize)*-95)+'px');
          // Each original native HTML module physically settles out of the
          // existing source's 3D retrieval trajectory. The small travel range
          // stays INSIDE its reading lane; unlike old hero animation it can
          // never sweep over MAG or cover functional controls.
          const sourceAxis={
            'left-shelf':-1,rotor:1,'bottom-drawer':0,
            'right-cell':1,'sealed-vault':-1,'vertical-crystal':0,
            'inner-chamber':0,assembled:1
          }[selected.source]||0;
          const paperExit=smooth((p-.94)/.06);
          const paperArrival=smooth((p-.08)/.38)*transfer.settle;
          const unresolved=1-paperArrival;
          const phone=mobile();
          const lateral=phone?0:sourceAxis*(unresolved*14-paperExit*9);
          const vertical=(phone?7:12)*unresolved+(phone?5:10)*paperExit;
          const yaw=phone?0:sourceAxis*(unresolved*-5.5+paperExit*3.5);
          const pitch=phone?unresolved*3.5-paperExit*2:unresolved*1.5-paperExit;
          const depth=-(phone?25:48)*unresolved-25*paperExit;
          const scale=1-.025*unresolved-.018*paperExit;
          setMotionStyle(panel,'--fx-cinema-handoff-x',lateral.toFixed(2)+'px');
          setMotionStyle(panel,'--fx-cinema-handoff-y',vertical.toFixed(2)+'px');
          setMotionStyle(panel,'--fx-cinema-handoff-z',depth.toFixed(2)+'px');
          setMotionStyle(panel,'--fx-cinema-handoff-yaw',yaw.toFixed(3)+'deg');
          setMotionStyle(panel,'--fx-cinema-handoff-pitch',pitch.toFixed(3)+'deg');
          setMotionStyle(panel,'--fx-cinema-handoff-scale',scale.toFixed(4));
          setData(panel,'fxCinemaSource',selected.source);
          setData(panel,'fxCinemaHandoff',paperArrival>.99?(paperExit>.02?'archiving':'presented'):'retrieving');
          setData(root,'fxArchiveNativeHandoff','scroll-coupled-real-3d-paper');
          positionCinemaFolio(panel);
        }
      }
    }
    if(enabled&&key!==lastCinemaKey){
      const panel=selected.cinemaPanel;
      if(panel)panel.scrollTop=0;
      lastCinemaKey=key;
    }else if(!enabled)lastCinemaKey='';
  }

  // R2026: The real existing HTML content is the handoff destination.
  // Keep DOM elements and their listeners in place: no cloning, portals,
  // duplicated element IDs, fake buttons or canvas-rendered text.
  function prepareRealContentSheets(){
    for(const node of paperNodes){
      if(!node.isConnected){
        node.classList.remove('fx-archive-live-sheet-r2026');
        node.removeAttribute('data-fx-archive-paper-source');
      }
    }
    const mapping={
      systems:[':scope > header',':scope > .section-heading',':scope > *:first-child',':scope > .fx-category-grid > *'],
      ecosystem:[':scope > .section-heading',':scope > .flow .flow-chapters > article'],
      diagnostics:[':scope > .section-heading',':scope > .cards > .card:not(:last-child)'],
      intelligence:[':scope'],
      licensing:[':scope > .section-heading',':scope > .pricing > .price-card',':scope > .payment',':scope > #formatx-plan-qr-dock'],
      security:[':scope > .section-heading',':scope > .system-grid > article'],
      network:[':scope > .fx-net-head',':scope > .fx-net-grid > .fx-net-console'],
      final:[':scope > .release-layout']
    };
    const all=new Set();
    for(const scene of scenes){
      const next=[];
      for(const selector of (mapping[scene.key]||[])){
        const targets=selector===':scope'?[scene.node]:Array.from(scene.node.querySelectorAll(selector));
        for(const target of targets){
          if(!(target instanceof HTMLElement)||next.includes(target))continue;
          next.push(target);
          target.classList.add('fx-archive-live-sheet-r2026');
          target.dataset.fxArchivePaperSource=scene.source;
          all.add(target);
        }
      }
      scene.paperNodes=next;
    }
    paperNodes=Array.from(all);
    root.dataset.fxArchivePhysicalSheetCount=String(paperNodes.length);
  }

  function updateRealContentSheets(){
    if(!archiveActive||reduced.matches)return;
    const vh=Math.max(1,innerHeight),portrait=mobile();
    // R2053: read every source document rectangle BEFORE writing a single
    // transform/opacity. Previously each write invalidated geometry read for
    // the next native HTML card, creating layout thrash on mobile scroll.
    // One deterministic snapshot keeps all original interactive cards and
    // exact reversible scroll coordinates, without blocking native scrolling.
    const nearby=new Set(),writes=[];
    if(current){
      const i=current.s.index;
      for(const scene of scenes){
        if(Math.abs(scene.index-i)<=1)for(const node of scene.paperNodes||[])nearby.add(node);
      }
    }
    for(const node of nearby){
      if(!node.isConnected)continue;
      // R2277: R2030/R2040 already animate the entire real native folio.
      // Its descendants have transform/opacity/animation explicitly reset
      // by the cinematic CSS. Reading their boxes defeats content-visibility
      // for hidden adjacent chapters and writes visually redundant styles.
      // Preserve the legacy path for genuine non-folio sheets.
      if(node.closest('.fx-archive-cinema-folio-r2030'))continue;
      const bounds=node.getBoundingClientRect();
      const entry=clamp((vh*.89-bounds.top)/Math.max(160,vh*.37));
      const last=paperLast.get(node);
      if(last!==undefined&&Math.abs(entry-last)<.007)continue;
      const s=sceneForElement(node);
      writes.push({node,entry,dir:portrait?0:(s?.index%2===0?-1:1)});
    }
    for(const {node,entry,dir} of writes){
      paperLast.set(node,entry);
      const settled=smooth(entry),away=1-settled;
      node.style.setProperty('--fx-archive-paper-x',(away*dir*46).toFixed(1)+'px');
      node.style.setProperty('--fx-archive-paper-y',(away*36).toFixed(1)+'px');
      node.style.setProperty('--fx-archive-paper-rot',(away*dir*-13).toFixed(2)+'deg');
      node.style.setProperty('--fx-archive-paper-scale',(1-away*.075).toFixed(4));
      node.style.setProperty('--fx-archive-paper-opacity',(.66+settled*.34).toFixed(3));
      node.dataset.fxArchivePaperPhase=entry>=.99?'presented':'being-handed';
    }
    setData(root,'fxArchiveRealContent','native-paper-handoff');
  }
  function sceneForElement(node){
    for(const s of scenes)if((s.paperNodes||[]).includes(node))return s;
    return null;
  }

  // Measure the stable document-flow chapter, never its fixed moving folio.
  function physicalScrollAnchor(scene){
    return scene.cinemaHost||scene.scrollAnchor||scene.node;
  }
  class ScrollTimelineController {
    static get(){
      if(!scenes.length)return null;
      // Absolute layout only, never alter document scroll position.
      let closest=null,score=Infinity;
      const vh=innerHeight,anchor=vh*.52;
      const measured=new Map();
      for(const s of scenes){
        const node=physicalScrollAnchor(s);
        let r=measured.get(node);
        if(!r){r=node.getBoundingClientRect();measured.set(node,r);}
        if(r.height<1||r.width<1)continue;
        const contains=r.top<=anchor&&r.bottom>=anchor;
        const distance=contains ? Math.abs((r.top+r.bottom)*.5-anchor)/Math.max(1,r.height)
          : r.top>anchor ? r.top-anchor : anchor-r.bottom;
        // Prefer the real visible section containing the viewport's reading line.
        // Tall sections must never lose to a neighbour's off-screen quarter point.
        const delta=contains?(distance*.01+Math.min(r.height,vh*5)*.0000003):10+distance;
        if(delta<score){score=delta;closest={s,rect:r};}
      }
      if(!closest)return null;
      const r=closest.rect;
      // R2022: In long chapters the prior scrub saturated at 1 while the
      // section was still on screen. release=1 then made the panel invisible.
      // Hold the physically flattened membrane through the reading interval
      // and only release once the section actually exits the viewport.
      const entering=clamp((vh*.88-r.top)/Math.max(1,vh*1.15));
      // R2032: the old sheet MUST finish its physical return before the
      // reading line advances to the next shelf, not after leaving the screen.
      const exiting=clamp((vh*.94-r.bottom)/Math.max(1,vh*.44));
      const p=Math.min(.78,entering)+.22*exiting;
      // Independent, continuous physical travel through the held reading beat.
      // Do not change the established content disclosure or release progress.
      return {...closest,progress:clamp(p),travel:readingTravel(r,vh)};
    }
  }
  class PerformanceManager {
    // 60 Hz render-request TARGET on capable phones; no device FPS is inferred.
    // The existing MAG renderer remains the sole owner of WebGL presentation.
    static emaMs=0;
    static samples=0;
    static slowSamples=0;
    static fastSamples=0;
    static frameInterval(){
      // Allow for fractional rAF timestamps: using 16.7ms on a 60Hz
      // display can miss every 16.667ms paint and accidentally cap at 30Hz.
      if(!mobile())return softwareMagRenderer()?32:15.5;
      if(veryLowPower)return 48;
      return quality==='low'?32:15.5;
    }
    static setQuality(value){
      const next=value==='low'?'low':'high';
      if(quality===next)return;
      quality=next;
      root.dataset.fxArchiveQuality=quality;
      root.dataset.fxArchiveTargetFrameMs=String(PerformanceManager.frameInterval());
      invalidate();
    }
    static observeSubmission(ms){
      // CPU command submission only: this does not measure GPU swap or FPS.
      if(!Number.isFinite(ms)||ms<0||ms>120)return;
      this.emaMs=this.samples?this.emaMs*.86+ms*.14:ms;
      this.samples++;
      if(this.samples%8===0)root.dataset.fxArchiveCpuSubmitMs=this.emaMs.toFixed(2);
      if(softwareMagRenderer()||!mobile()||mobilePerf||this.samples<20)return;
      // Hysteresis: neither first shader compilation nor one GC pause
      // can permanently reduce MAG's native filament quality.
      if(quality==='high'){
        this.slowSamples=this.emaMs>13.5?this.slowSamples+1:Math.max(0,this.slowSamples-2);
        if(this.slowSamples>=12){
          this.slowSamples=0;this.fastSamples=0;this.setQuality('low');
        }
      }else{
        this.fastSamples=this.emaMs<7?this.fastSamples+1:0;
        if(this.fastSamples>=65){
          this.slowSamples=0;this.fastSamples=0;this.setQuality('high');
        }
      }
    }
  }
  class ResponsiveExperience {
    static dock(){
      if(!stage||archiveActive)return;
      if(!heroHost||!heroHost.isConnected)return;
      // Keep the canonical canvas inside #hero. Moving it would break the
      // original MAG DOM contract and WebGL identity checks. The external
      // archive stylesheet owns docking geometry so strict style-src remains
      // intact and renderer-authored canvas state is never overwritten.
      stage.classList.add('fx-archive-native-docked');
      root.dataset.fxArchiveDock='active';
      archiveActive=true;
      window.FormatXLivingCore?.requestRender?.(1);
    }
    static restore(){
      if(!archiveActive||!stage)return;
      stage.classList.remove('fx-archive-native-docked');
      root.dataset.fxArchiveDock='home';
      archiveActive=false;
      window.FormatXLivingCore?.requestRender?.(1);
    }
  }
  class CameraDirector {
    static forScene(scene,p,travel=0){
      // The camera lives in ONE archive, so chapter changes must not teleport
      // it. Absolute native document scroll makes the track reversible.
      const distance=scrollY/Math.max(1,innerHeight);
      const approach=smooth((p-.16)/.69);
      // One continuous world-space dolly/orbit track. Every component depends
      // on absolute scroll, not discrete chapter indices (no camera teleport).
      const orbit=Math.sin(distance*.18)*.085+Math.sin(distance*.37)*.026;
      const dolly=Math.sin(distance*.13)*.11;
      const lift=Math.sin(distance*.12)*.035;
      const flight=readingFlight(travel);
      // R2289: travel THROUGH the bulkhead, rather than only scaling it.
      // Native HTML progress and the checkout are not moved or retimed.
      const passage=passageFlight(scene,p,mobile());
      return [orbit+flight.x+passage.x,lift+mix(-.025,.027,approach)+flight.y+passage.y,
        dolly+mix(-.035,.085,approach)+flight.z+passage.z];
    }
  }
  function cubeGeometry(){
    const v=[],faces=[
      [[0,0,1],[0,1,2,0,2,3],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],
      [[0,0,-1],[0,2,1,0,3,2],[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1]],
      [[1,0,0],[0,1,2,0,2,3],[1,-1,-1],[1,-1,1],[1,1,1],[1,1,-1]],
      [[-1,0,0],[0,2,1,0,3,2],[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],
      [[0,1,0],[0,1,2,0,2,3],[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]],
      [[0,-1,0],[0,2,1,0,3,2],[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]
    ];
    for(const [normal,tri,...corners] of faces){
      for(const i of tri){const p=corners[i];v.push(p[0]*.5,p[1]*.5,p[2]*.5,...normal,0,0);}
    }
    return new Float32Array(v);
  }
  // Three physical octagonal reactor bulkheads, one immutable vertex buffer.
  // Build once, reuse the native archive shader, depth and WebGL context.
  // A true chamfered prism: eight side faces and two closed end caps.
  // Local X/Z bevels produce genuine specular highlights, not texture strips.
  function reactorHousing(width,span,depth,bevel){
    const x=width*.5,z=depth*.5,y=span*.5,b=Math.min(bevel,x*.8,z*.8);
    const corners=[[-x+b,-z],[x-b,-z],[x,-z+b],[x,z-b],[x-b,z],[-x+b,z],[-x,z-b],[-x,-z+b]];
    const data=[];
    const vertex=(i,yy,n)=>{const [xx,zz]=corners[i];data.push(xx,yy,zz,...n,0,0);};
    for(let i=0;i<8;i++){
      const j=(i+1)%8,dx=corners[j][0]-corners[i][0],dz=corners[j][1]-corners[i][1];
      const length=Math.hypot(dx,dz),n=[dz/length,0,-dx/length];
      for(const [k,yy] of [[i,-y],[j,y],[j,-y],[i,-y],[i,y],[j,y]])vertex(k,yy,n);
    }
    for(let i=1;i<7;i++){
      for(const k of [0,i+1,i])vertex(k,y,[0,1,0]);
      for(const k of [0,i,i+1])vertex(k,-y,[0,-1,0]);
    }
    return data;
  }
  function reactorGeometry(){
    const cube=cubeGeometry(),data=[];
    for(let ring=0;ring<3;ring++){
      const radius=2.26+ring*.12,z=-2.3+ring*1.05;
      for(let edge=0;edge<8;edge++){
        const angle=(edge+.5)*Math.PI/4,ca=Math.cos(angle),sa=Math.sin(angle);
        const length=2*radius*Math.tan(Math.PI/8);
        const housing=reactorHousing(.19,length,.23,.035);
        for(let i=0;i<housing.length;i+=8){
          const x=housing[i]+radius,y=housing[i+1];
          data.push(x*ca-y*sa,x*sa+y*ca,housing[i+2]+z,
            housing[i+3]*ca-housing[i+4]*sa,housing[i+3]*sa+housing[i+4]*ca,housing[i+5],.25,2+ring+edge/16);
        }
        // Separate emissive inlay, above the entry face of the solid metal.
        for(let i=0;i<cube.length;i+=8){
          const x=cube[i]*.035+radius-.045,y=cube[i+1]*length*.88;
          data.push(x*ca-y*sa,x*sa+y*ca,cube[i+2]*.034+z+.13,
            cube[i+3]*ca-cube[i+4]*sa,cube[i+3]*sa+cube[i+4]*ca,cube[i+5],.85,2+ring+edge/16);
        }
      }
    }
    return new Float32Array(data);
  }
  // Ring 2 fades first, then ring 1, then ring 0. They occupy contiguous
  // vertex ranges in reverse disappearance order. Never submit the rings
  // whose shader visibility has reached exactly zero; retain a small FP32
  // boundary margin to avoid removing even a subpixel visible fragment.
  function reactorVisibleVertices(progress,total){
    let rings=3;
    while(rings>0&&progress>=.68+(3-rings)*.16+.00001)rings--;
    return total*rings/3;
  }
  // Three ring transforms are invariant across each ring's vertices.
  // Compute them once per submitted gate, not thousands of times in GLSL.
  function reactorRingState(progress){
    const scale=[],visibility=[],axisX=[],axisY=[],opening=[];
    for(let ring=0;ring<3;ring++){
      const phase=clamp((progress-(2-ring)*.16)/.68);
      const angle=progress*6.2831853-ring*.76;
      scale.push(mix(.82,3.10,smooth(phase)));
      visibility.push(1-smooth((phase-.72)/.28));
      axisX.push(Math.cos(angle));axisY.push(Math.sin(angle));
      opening.push(smooth((phase-.035)/.33));
    }
    return {scale,visibility,axisX,axisY,opening};
  }
  // Mobile software GL needs a wider sampling window. Continue the
  // physical gate into the first part of the existing reading interval.
  // Never delay the real content handoff, even on a constrained renderer.
  function entryTransitProgress(p,travel,limited){
    if(!limited||p>.78)return p;
    if(p<.78)return p*.65/.78;
    return .65+.13*clamp((travel||0)/.35);
  }
  function reactorEntry(scene,p){
    // Extend the physical passage to the end of the entry beat, without
    // holding back the native document (its handoff still ends at .62).
    // This gives large touch-wheel steps a wider chance to render a gate.
    if(!entryReactorHost||scene.cinemaHost!==entryReactorHost||p>=.78)return null;
    const t=clamp(p/.78);
    // Reversible scroll track. Near bulkhead expands toward the visitor,
    // the two rear bulkheads follow in depth; preserve MAG's front lane.
    return {progress:t,z:mix(-1.5,1.05,smooth(t)),alpha:(.42+.58*smooth(t/.25))*(1-smooth((t-.92)/.08))};
  }
  // One reversible cue for the actual native document, not a duplicated
  // loading panel. Keep all checkout and other chapters on their old path.
  function reactorHandoff(scene,p){
    if(!entryReactorHost||scene.cinemaHost!==entryReactorHost||scene.key==='licensing')
      return {settle:1,phase:'clear'};
    const t=clamp(p/.62);
    return {
      settle:.58+.42*smooth((t-.35)/.65),
      phase:t<.34?'approach':t<.82?'traverse':t<1?'arrival':'clear'
    };
  }
  // Short, lower-intensity bulkhead passage at the entrance of every
  // subsequent system. No new document sections, geometry or draw budget.
  // Preserve the full-quality trajectory, but give constrained mobile
  // rasterizers a longer physical sampling interval. The document's
  // reading progress and checkout are deliberately not retimed.
  function corridorTransitProgress(scene,p,travel,limited){
    if(!limited||scene.key==='licensing'||p<=.43||p>.78)return p;
    if(p<.78)return .43+.09*clamp((p-.43)/.35);
    return .52+.12*clamp((travel||0)/.35);
  }
  function corridorEntry(scene,p){
    // The reading line selects a contiguous incoming chapter around
    // (.88-.52)/1.15 = .313. The old 0.. .30 interval had already ended.
    // Allow the bulkhead to arrive AFTER the actual chapter becomes active.
    const start=.30,end=.64;
    if(!entryReactorHost||!scene.cinemaHost||scene.cinemaHost===entryReactorHost||p<start||p>=end)return null;
    const t=clamp((p-start)/(end-start));
    const alpha=(scene.key==='licensing'?.38:.66)*smooth(t/.18)*(1-smooth((t-.65)/.35));
    return {progress:.12+.88*t,z:mix(-1.35,.72,smooth(t)),alpha};
  }
  // At 165dvh the document's retrieval value remains .78 for about
  // .69 viewport heights. Use the already-measured rectangle to traverse
  // this interval without touching the actual interactive reading panel.
  // R2289: reversible, C1-continuous camera excursion during each real gate.
  // Start after the contiguous chapter-selection boundary (~.313), and
  // return to the baseline before the reading beat. No added draw calls.
  // R2290: describe the same physical track used by the native gate.
  // Never gate focus, visibility or payment behind this presentation cue.
  function systemArrivalPhase(scene,p,travel=0,limited=false){
    if(!entryReactorHost||!scene.cinemaHost||scene.key==='licensing')return 'clear';
    const first=scene.cinemaHost===entryReactorHost;
    const physical=first?entryTransitProgress(p,travel,limited):corridorTransitProgress(scene,p,travel,limited);
    const start=first?0:.30,end=first?.78:.64;
    if(physical<start||physical>=end)return 'clear';
    const t=clamp((physical-start)/(end-start));
    if(t<.18)return first?'approach':'system-approach';
    if(t<.65)return 'traverse';
    if(t<.88)return 'arrival';
    return 'handoff';
  }
  function systemArrivalLabel(phase,english,destination){
    const labels={
      approach:['BELÉPÉS A MAG TÉRBE','ENTER THE CORE'],
      'system-approach':['BELÉPÉS A RENDSZERTÉRBE','ENTER SYSTEM SPACE'],
      traverse:['REAKTOR ÁTJÁRÓ','REACTOR TRANSIT'],
      arrival:['RENDSZER AKTÍV','SYSTEM ONLINE'],
      handoff:['RENDSZERÁTVÉTEL','SYSTEM HANDOFF']
    };
    if(!labels[phase])return destination;
    const phaseLabel='MAG // '+labels[phase][english?1:0];
    return destination.startsWith('MAG // ')?phaseLabel+' · '+destination.slice(7):phaseLabel;
  }
  function passageFlight(scene,p,portrait){
    const first=Boolean(entryReactorHost&&scene.cinemaHost===entryReactorHost);
    if(!scene.cinemaHost||scene.key==='licensing')return {x:0,y:0,z:0};
    const start=first?.315:.325,end=first?.78:.64;
    const t=clamp((p-start)/(end-start));
    // Ease in, pass the near plane, then settle without a camera cut.
    const envelope=smooth(t/.46)*(1-smooth((t-.52)/.48));
    const direction=scene.index%2===0?1:-1;
    const lateral=portrait?.07:.23,depth=portrait?.43:.76;
    return {x:direction*lateral*Math.sin(Math.PI*t)*envelope,
      y:(portrait?.035:.09)*envelope,
      z:-depth*envelope};
  }
  // R2299: smooth camera orientation along the same reversible gate track.
  // Keep the native HTML and original MAG framing independent. Rotate the
  // room and gate about the actual eye, not the model or screen center.
  function passageOrientation(scene,p,portrait){
    if(!scene.cinemaHost||scene.key==='licensing')return [0,0,0];
    const first=Boolean(entryReactorHost&&scene.cinemaHost===entryReactorHost);
    const start=first?.315:.325,end=first?.78:.64;
    const t=clamp((p-start)/(end-start));
    const envelope=Math.sin(Math.PI*t)**2;
    const side=scene.index%2===0?1:-1;
    return [side*(portrait?.027:.078)*Math.sin(2*Math.PI*t)*envelope,
      (portrait?.018:.043)*envelope,
      -side*(portrait?.012:.031)*Math.sin(2*Math.PI*t)*envelope];
  }
  function readingTravel(rect,vh){
    const from=-.017*vh,to=.94*vh-rect.height;
    const span=from-to;
    return span>1?clamp((from-rect.top)/span):0;
  }
  function readingFlight(t){
    t=clamp(t);
    const envelope=Math.sin(Math.PI*t)**2;
    return {x:Math.sin(2*Math.PI*t)*.16*envelope,y:.045*envelope,z:-.30*envelope};
  }
  function readingEnergy(t,rack,count){
    t=clamp(t);
    const envelope=Math.sin(Math.PI*t)**2;
    const distance=Math.abs(t*(count+1)-(rack+1));
    return envelope*(1-smooth(distance/1.35));
  }
  // R2292: a permanent, genuinely three-dimensional architectural shell.
  // Eight-sided interior, seven deep bays, recessed plates and physical ribs.
  // Material tags use negative UV.y, disjoint from the gate and folio tags.
  // One immutable vertex buffer; no extra context or post-processing.
  // R2294: independent depth excursion of the architectural environment.
  // Native panels, MAG and checkout retain their existing framing.
  // Equivalent to moving the camera along the room axis; no scaling trick.
  function roomDolly(scene,p,portrait){
    if(scene.key==='licensing')return 0;
    const t=clamp((p-.315)/.465);
    return (portrait?1.12:2.05)*Math.sin(Math.PI*t)**2;
  }
  // R2300: a bounded energy packet travels from the nearest bay to the
  // distant reactor, then settles during the existing native reading beat.
  // Driven only by document progress; reversing scroll reverses the wave.
  function roomEnergyTrack(scene,p,travel){
    if(scene.key==='licensing')return [-.4,0];
    const t=.65*clamp((p-.315)/.465)+.35*clamp(travel||0);
    const amplitude=smooth(t/.12)*(1-smooth((t-.86)/.14));
    return [mix(-.4,-12.7,t),amplitude];
  }
  function corridorRoomGeometry(){
    const data=[],cube=cubeGeometry();
    const corners=[[-3.65,-1.62],[-2.65,-2.62],[2.65,-2.62],[3.65,-1.62],
      [3.65,1.62],[2.65,2.62],[-2.65,2.62],[-3.65,1.62]];
    const quad=(a,b,c,d,n,material)=>{
      for(const v of [a,b,c,a,c,d])data.push(...v,...n,material,-1);
    };
    const solid=(center,size,angle,material)=>{
      const ca=Math.cos(angle),sa=Math.sin(angle);
      for(let i=0;i<cube.length;i+=8){
        const x=cube[i]*size[0],y=cube[i+1]*size[1];
        const nx=cube[i+3]/size[0],ny=cube[i+4]/size[1],nz=cube[i+5]/size[2];
        const len=Math.hypot(nx,ny,nz);
        data.push(center[0]+x*ca-y*sa,center[1]+x*sa+y*ca,center[2]+cube[i+2]*size[2],
          (nx*ca-ny*sa)/len,(nx*sa+ny*ca)/len,nz/len,material,-1);
      }
    };
    // Back wall leaves no flat, disconnected screen-space background.
    for(let edge=0;edge<8;edge++){
      const a=corners[edge],b=corners[(edge+1)%8];
      for(const v of [[0,0,-13],[a[0],a[1],-13],[b[0],b[1],-13]])data.push(...v,0,0,1,.12,-1);
    }
    for(let bay=0;bay<7;bay++){
      const back=-13+bay*1.88,front=back+1.88;
      for(let edge=0;edge<8;edge++){
        const a=corners[edge],b=corners[(edge+1)%8],dx=b[0]-a[0],dy=b[1]-a[1];
        const length=Math.hypot(dx,dy),nx=-dy/length,ny=dx/length;
        const mx=(a[0]+b[0])*.5,my=(a[1]+b[1])*.5,angle=Math.atan2(dy,dx);
        quad([a[0],a[1],back],[b[0],b[1],back],[b[0],b[1],front],[a[0],a[1],front],[nx,ny,0],.14);
        // Recessed structural panel, solid bulkhead rib, flush light rail.
        solid([mx+nx*.036,my+ny*.036,(back+front)*.5],[length*.84,.055,1.50],angle,.25);
        solid([mx+nx*.115,my+ny*.115,front-.10],[length+.04,.34,.30],angle,.42);
        if(edge%2===0){
          solid([mx+nx*.125,my+ny*.125,(back+front)*.5],[.085,.045,1.36],angle,.85);
          // R2297: physical armored conduits staggered across adjacent bays.
          const side=bay%2===0?1:-1,shift=length*.28*side;
          solid([mx+nx*.155+dx/length*shift,my+ny*.155+dy/length*shift,(back+front)*.5],
            [.24,.21,1.48],angle,.53);
        }
      }
    }
    return new Float32Array(data);
  }
  function panelGeometry(detail){
    const u=detail?20:10,v=detail?16:9,data=[];
    for(let y=0;y<v;y++)for(let x=0;x<u;x++){
      const point=(xx,yy)=>{const px=xx/u,py=yy/v;return [(px-.5)*1.55,(py-.5)*1.06,0,0,0,1,px,py];};
      for(const p of [point(x,y),point(x+1,y),point(x+1,y+1),point(x,y),point(x+1,y+1),point(x,y+1)])data.push(...p);
    }
    return new Float32Array(data);
  }
  class MAGScene {
    constructor(gl){
      this.gl=gl;
      this.program=this.programFor(gl);
      this.box=this.buffer(cubeGeometry());
      this.reactor=this.buffer(reactorGeometry());
      this.room=this.buffer(corridorRoomGeometry());
      this.panelDetail=quality==='high';
      this.panel=this.buffer(panelGeometry(this.panelDetail));
      this.uniform={};
      for(const name of ['uOffset','uScale','uColor','uCamera','uRotation','uTilt','uBend','uOpacity','uPanel','uFiber','uAspect','uMobile','uShadow','uReactorRingScale','uReactorRingVisibility','uReactorAxisX','uReactorAxisY','uReactorOpening','uArchiveCameraAngles','uRoomEnergy']){
        this.uniform[name]=gl.getUniformLocation(this.program,name);
      }
      this.vao=gl.createVertexArray();
      if(!this.vao)throw new Error('VAO unavailable');
      // R2228: WebGL2 VAOs retain vertex attribute pointers. Two meshes
      // share this pass; only rebind when switching between them.
      this.boundMesh=null;
      this.attributeSetups=0;
      this.drawCalls=0;
      this.scalarCache=new Map();
      this.scalarWrites=0;
      this.scalarSkips=0;
    }
    scalar(name,value){
      if(this.scalarCache.get(name)===value){this.scalarSkips++;return;}
      this.gl.uniform1f(this.uniform[name],value);
      this.scalarCache.set(name,value);
      this.scalarWrites++;
    }
    programFor(gl){
      const vert=`#version 300 es
precision highp float;
in vec3 aPosition;in vec3 aNormal;in vec2 aUv;
uniform vec3 uOffset,uScale,uCamera,uArchiveCameraAngles;
uniform vec3 uReactorRingScale,uReactorRingVisibility,uReactorAxisX,uReactorAxisY,uReactorOpening;
uniform float uRotation,uTilt,uBend,uAspect,uMobile;
out vec3 vNormal;out vec2 vUv;out float vViewDistance;out float vReactorVisibility;out float vReactorLight;out vec3 vReactorView;
vec3 archiveCameraRotate(vec3 v){
  float cy=cos(uArchiveCameraAngles.x),sy=sin(uArchiveCameraAngles.x);
  float cp=cos(uArchiveCameraAngles.y),sp=sin(uArchiveCameraAngles.y);
  float cr=cos(uArchiveCameraAngles.z),sr=sin(uArchiveCameraAngles.z);
  v=vec3(cy*v.x+sy*v.z,v.y,-sy*v.x+cy*v.z);
  v=vec3(v.x,cp*v.y-sp*v.z,sp*v.y+cp*v.z);
  return vec3(cr*v.x-sr*v.y,sr*v.x+cr*v.y,v.z);
}
void main(){
 vec3 p=aPosition*uScale;
 // R2262: UV.y above 1 is reserved for the three real reactor bulkheads.
 // The nearest frame passes first, followed by two independently timed frames.
 bool reactor=aUv.y>1.5;
 bool room=aUv.y<-.5;
 vReactorVisibility=1.0;
 vReactorLight=0.0;
 float ringScale=1.0;
 if(reactor){
   int ring=int(aUv.y-2.0);
   vec2 axis=vec2(uReactorAxisX[ring],uReactorAxisY[ring]);
   vReactorLight=smoothstep(.15,.96,dot(normalize(aPosition.xy),axis));
   ringScale=uReactorRingScale[ring];
   p.xy*=ringScale;
   // R2298: each machined segment and its guide are rigidly translated
   // together. The fractional ring tag stores a constant edge identity.
   float edge=floor(fract(aUv.y)*16.0+.5);
   float angle=(edge+.5)*.7853981634;
   vec2 radial=vec2(cos(angle),sin(angle));
   float delayed=smoothstep(.15*mod(edge,2.0),.85+.15*mod(edge,2.0),uReactorOpening[ring]);
   p.xy+=radial*(.48*delayed);
   p.z-=.32*delayed*(.65+.35*mod(edge,2.0));
   vReactorVisibility=uReactorRingVisibility[ring];
 }
 // Planar geometry has no bend: avoid the trigonometric calculation.
 float bendX=0.0;
 float sinY=0.0;
 if(uBend!=0.0){
   bendX=2.0*aUv.x-1.0;
   sinY=sin(3.14159265*aUv.y);
   p.z+=uBend*bendX*bendX*sinY;
 }
 // Analytic differential normal of the *actual* curved glass membrane:
 // previous lighting used the flat sheet normal after bending vertices.
 // Derivatives divide by physical mesh width/height, so reflections stay
 // stable through the eight different extraction and flattening paths.
 vec3 localNormal=aNormal;
 // Inverse transpose of the expanding gate's nonuniform world scale.
 // Bevels must not keep the unexpanded face normal as they fly past.
 if(reactor)localNormal=normalize(vec3(aNormal.xy/ringScale,aNormal.z));
 if(abs(uBend)>.00001){
   float dzdx=4.0*uBend*bendX*sinY/max(.001,1.55*uScale.x);
   float dzdy=3.14159265*uBend*bendX*bendX*cos(3.14159265*aUv.y)
              /max(.001,1.06*uScale.y);
   localNormal=normalize(vec3(-dzdx,-dzdy,1.0));
 }
 float st=sin(uTilt),ct=cos(uTilt);
 p=vec3(p.x,ct*p.y-st*p.z,st*p.y+ct*p.z);
 float s=sin(uRotation),c=cos(uRotation);
 p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z)+uOffset-uCamera;
 // The projection's eye sits at z=6.2 in this camera-relative space.
 // Capture the physical view ray before the portrait framing adjustment.
 vReactorView=room?aPosition:(reactor?vec3(0.0,0.0,6.2)-p:vec3(.10,-.07,1.0));
 // Rotate the room/gate geometry about the physical optical center.
 // World-space normals and light rays remain unrotated, so highlights
 // stay attached to the materials rather than moving with the camera.
 if(room||reactor){
   vec3 eye=vec3(0.0,0.0,6.2);
   p=archiveCameraRotate(p-eye)+eye;
 }
 // Portrait atlas projection: make every physical shelf AND the flexible
 // panel visible in the mobile archive instead of clipping at the sides.
 if(uMobile>.5){
   if(room){p.x*=.58;p.y=p.y*.80-.18;}
    else if(reactor){p.x*=.58;p.y=p.y*.80-.18;}
   else{p.x*=.34;p.y=p.y*.63-.18;}
 }
 float d=max(2.4,6.2-p.z);
 vViewDistance=d;
 // R2035: canonical MAG uses NDC depth close to zero. The old background
 // projection produced negative NDC z for far rack rails, incorrectly placing
 // long horizontal strips in FRONT of the original MAG on desktop and mobile.
 // Keep shelves behind the existing 3D core, while the retrieved sheet alone
 // can approach the audience. No renderer/canvas/geometry replacement.
 float opticalDepth=room?(.56+.37*clamp((4.0-p.z)/20.0,0.0,1.0)):clamp(.33-.15*p.z,-.16,.86);
 gl_Position=vec4(p.x*3.3/max(0.6,uAspect),p.y*3.3,opticalDepth*d,d);
 vec3 n=vec3(localNormal.x,ct*localNormal.y-st*localNormal.z,st*localNormal.y+ct*localNormal.z);
 vNormal=vec3(c*n.x+s*n.z,n.y,-s*n.x+c*n.z);
 vUv=aUv;
}`;
      const frag=`#version 300 es
precision highp float;
in vec3 vNormal;in vec2 vUv;in float vViewDistance;in float vReactorVisibility;in float vReactorLight;in vec3 vReactorView;
uniform vec3 uColor,uCamera,uOffset;uniform vec2 uRoomEnergy;uniform float uOpacity,uPanel,uFiber,uShadow,uMobile;
out vec4 outColor;
// R2296: integrate finite illuminated fog volumes along the camera ray.
// The intersection stops at the room surface; no screen-space overlay,
// ray-marching loop, extra framebuffer or extra draw. The native MAG
// retains its original foreground depth and material.
float roomVolumeLength(vec3 origin,vec3 ray,vec3 center,vec3 invRadius){
  vec3 o=(origin-center)*invRadius;
  vec3 d=ray*invRadius;
  float a=max(dot(d,d),.000001);
  float b=dot(o,d);
  float c=dot(o,o)-1.0;
  float disc=b*b-a*c;
  if(disc<=0.0)return 0.0;
  float h=sqrt(disc);
  float enter=max(0.0,(-b-h)/a);
  float leave=min(1.0,(-b+h)/a);
  return max(0.0,leave-enter)*length(ray);
}
void main(){
 if(uShadow>.5){
   // Soft analytical contact penumbra underneath the moving archive drawer.
   // No second depth buffer, post-process or fake bloom. Cost: one shared
   // panel mesh. This is a planar approximation, not shadow-map tracing.
   vec2 q=(vUv-vec2(.5))*vec2(2.1,2.5);
   float shadow=exp(-3.8*dot(q,q))*(1.0-smoothstep(.76,1.20,length(q)));
   outColor=vec4(vec3(.003,.010,.018),uOpacity*shadow*.65);
   return;
 }
 vec3 N=normalize(vNormal+vec3(.0001));
  // R2292: opaque architectural materials behind the canonical MAG.
  // Depth cues are from the physical vertices and view distance, not CSS.
  if(vUv.y<-.5){
    // R2294: each physical bay has a pool of light and a contact-shadow
    // envelope near its structural ribs. The lighting is object-space, not
    // a screen overlay, so it remains attached to the architecture.
    vec3 local=vReactorView;
    float bay=fract((local.z+13.0)/1.88);
    float seam=min(bay,1.0-bay);
    float contact=mix(.52,1.0,smoothstep(.04,.25,seam));
    float pool=1.0-smoothstep(.10,.49,abs(bay-.5));
    float distanceFog=smoothstep(7.5,19.5,vViewDistance);
    float key=.30+.70*max(0.0,dot(N,normalize(vec3(-.44,.68,.59))));
    float rib=step(.35,vUv.x);
    vec3 graphite=mix(vec3(.045,.065,.090),vec3(.16,.23,.29),rib)*key*contact;
    // R2300: the moving packet illuminates the actual physical panels,
    // conduits and inlaid light strips, with smooth spatial falloff.
    float packet=uRoomEnergy.y*(1.0-smoothstep(.22,1.45,abs(local.z-uRoomEnergy.x)));
    vec3 bounce=uColor*(.045+.15*pool+.19*packet)*(.48+.52*abs(N.y));
    // Broad reflection response on structural metal; no thin aliasing grids.
    // R2301: use the same physical eye for reflections and scattering.
    vec3 eye=uCamera-uOffset+vec3(0.0,0.0,6.2);
    vec3 V=normalize(eye-local);
    float grazing=1.0-abs(dot(N,V));
    vec3 metal=vec3(.09,.13,.17)*rib*grazing*grazing;
    vec3 tint=graphite+(bounce+metal)*(1.0-distanceFog*.75);
    // R2297: machined panel seams with derivative-based detail attenuation.
    if(vUv.x>.20&&vUv.x<.30){
      float tangent=dot(local.xy,vec2(-N.y,N.x));
      float grooveCoord=tangent*1.35;
      float groove=abs(fract(grooveCoord+.5)-.5);
      float aa=max(fwidth(grooveCoord),.008);
      float detail=1.0-smoothstep(.04,.22,aa);
      float cut=(1.0-smoothstep(.018,.018+aa,groove))*detail;
      float machinedEdge=(1.0-smoothstep(.035,.035+aa,abs(groove-.065)))*detail;
      tint=tint*(1.0-.28*cut)+vec3(.055,.078,.095)*machinedEdge*key;
    }
    if(vUv.x>.50&&vUv.x<.60){
      vec3 alloyRay=reflect(-V,N);
      float strip=smoothstep(.40,.97,dot(alloyRay,vec3(-.6,.8,0.0)));
      tint=vec3(.075,.104,.128)*(.55+.45*key)+bounce*.75
        +vec3(.22,.31,.38)*strip*(1.0-distanceFog*.65);
    }
    vec3 lamp=mix(uColor*(.65+.30*(1.0-distanceFog)),mix(uColor,vec3(.76,.92,1.0),.48),packet*.85);
    vec3 material=mix(tint,lamp,step(.70,vUv.x));
    // Beer-Lambert transmission through two finite, elongated light pools.
    // These are analytic single-scattering approximations, not a path tracer.
    // R2301: a pair of finite fog lobes follow the same object-space
    // energy packet as the physical conduits. At rest they return smoothly
    // to the original stationary pools. No extra ray intersection.
    vec3 ray=local-eye;
    float energy=clamp(uRoomEnergy.y,0.0,1.0);
    float waveZ=clamp(uRoomEnergy.x,-12.7,-.4);
    vec3 primaryCenter=vec3(-1.72,.80,mix(-3.6,waveZ,energy));
    vec3 secondaryCenter=vec3(1.85,.85,mix(-7.2,clamp(waveZ-1.10,-12.7,-.4),energy));
    float path=roomVolumeLength(eye,ray,primaryCenter,vec3(1.45,.52,.65));
    if(uMobile<.5)path+=.80*roomVolumeLength(eye,ray,secondaryCenter,vec3(1.55,.50,.60));
    float scatter=1.0-exp(-.20*path);
    vec3 surface=mix(material,vec3(.013,.029,.045),distanceFog*.76);
    vec3 fogLight=mix(vec3(.18,.29,.38),uColor,.42);
    vec3 activeLight=mix(uColor,vec3(.54,.79,.96),.55);
    fogLight=mix(fogLight,activeLight,energy*.52);
    outColor=vec4(mix(surface,fogLight,scatter*(.62+.14*energy)),1.0);
    return;
  }
 bool reactor=vUv.y>1.5;
 vec3 V=normalize(reactor?vReactorView:vec3(.10,-.07,1.0));
 vec3 L=normalize(vec3(-.38,.68,1.0));
 vec3 H=normalize(L+V);
 float ndl=max(.06,dot(N,L));
 float facing=clamp(dot(N,V),0.0,1.0);
 // The reactor guide is emissive, not a reflective metal surface.
 // This exactly preserves the final guide color and alpha from the full
 // material path, while bypassing unused GGX, Fresnel and atmosphere work.
 if(reactor&&vUv.x>=.6){
   vec3 emitter=uColor*(.56+.18*facing+.26*vReactorLight);
   float guideAlpha=uOpacity*.80*(.54+.36*ndl)*vReactorVisibility;
   outColor=vec4(emitter,clamp(guideAlpha,0.0,1.0));
   return;
 }
 float fresnel=pow(1.0-facing,5.0);
 // Normalized GGX microfacet reflection and Fresnel-Schlick form a
 // single physically coherent lighting response for the archival glass.
 float roughness=reactor?.32:(uPanel>.5?.20:.44);
 float a2=roughness*roughness; a2*=a2;
 float ndh=max(.001,dot(N,H));
 float ndv=max(.001,dot(N,V));
 float denom=ndh*ndh*(a2-1.0)+1.0;
 float D=a2/(3.14159265*denom*denom+1e-5);
 float k=pow(roughness+1.0,2.0)*.125;
 float G=(ndl/(ndl*(1.0-k)+k))*(ndv/(ndv*(1.0-k)+k));
 float vh=max(0.0,dot(V,H));
 vec3 F0=reactor?vec3(.48,.53,.58):mix(vec3(.038),uColor*.22,uPanel>.5?.24:.08);
 vec3 F=F0+(1.0-F0)*pow(1.0-vh,5.0);
 vec3 specular=(D*G*F)/max(.02,4.0*ndl*ndv);
 float spec=clamp(dot(specular,vec3(.33)),0.0,1.0);
 vec3 base=mix(vec3(.025,.047,.060),uColor,uPanel>.5?.23:.18);
 vec3 col=base*(.27+.68*ndl)*(1.0-max(F.r,max(F.g,F.b)))+specular*.65+uColor*fresnel*.12;
 float a=uOpacity*(uPanel>.5?.68:.80);
 if(uPanel>.5){
   // Smooth glass-membrane edge, directional internal light guides and
   // antialiased micro-filaments; suppress high-frequency aliasing via fwidth.
   float edge=max(abs(vUv.x-.5)*2.0,abs(vUv.y-.5)*2.0);
   float edgeWidth=max(fwidth(edge)*1.35,.004);
   float rim=smoothstep(.972-edgeWidth,.972+edgeWidth,edge);
   float strand=abs(fract(vUv.x*68.0)-.5);
   float aa=max(fwidth(vUv.x*68.0)*.75,.028);
   float micro=1.0-smoothstep(.012,.012+aa,strand);
   float rail=abs(fract(vUv.y*13.0)-.5);
   float railAA=max(fwidth(vUv.y*13.0)*.6,.035);
   float guide=(1.0-smoothstep(.015,.015+railAA,rail))
             *smoothstep(.07,.13,vUv.x)*(1.0-smoothstep(.87,.93,vUv.x));
   col+=uColor*(rim*.31+guide*.060+micro*.037);
   col+=vec3(1.0,.98,.91)*spec*.11;
   a=mix(a,.91,rim);
   a+=fresnel*.045;
 }else if(uFiber>.5){
   // Energy threads are hairline solid 3D geometry, not additive 2D strokes.
   col=mix(uColor,vec3(.73,.91,.94),.15+spec*.29);
   a*=.54+.36*ndl;
 }
 // Monotonic, view-distance dependent atmospheric extinction unifies the
 // permanent rear racks into the same deep physical archive. The approaching
 // display and filament remain crisp; no second bloom/post-process pass.
 if(uPanel<.5 && uFiber<.5){
   float aerial=clamp((vViewDistance-5.4)*.095,0.0,.25);
   col=mix(col,vec3(.013,.029,.044),aerial);
 }
 // Restrict the optical boost to the gate; ordinary racks and MAG sheets
 // retain their exact material response. No full-screen flash or bloom.
 if(vUv.y>1.5){
   // Face the viewer with material contrast rather than making the entire
   // chamber glow. Constant per-primitive material tags, no extra texture.
   float guide=step(.6,vUv.x);
   // Controlled cool key and warm rim on the true bevel normals.
   float rimKey=max(0.0,dot(N,normalize(vec3(.72,-.31,.48))));
   float aerial=clamp((vViewDistance-4.0)*.048,0.0,.22);
   // Soft shoulder keeps moving metallic highlights from clipping.
   vec3 reflection=specular/(vec3(1.0)+specular);
   vec3 titanium=vec3(.10,.15,.19)*(.42+.58*ndl)+reflection*.52;
   titanium+=vec3(.18,.15,.10)*rimKey*.30+uColor*fresnel*.14;
   titanium+=uColor*vReactorLight*.038;
    // R2291: analytic studio strip reflections on the actual chamfer normals.
    // Two broad reflection lobes, one cool and one warm, with a soft shoulder.
    // Unlike screen-space glow, the highlight travels with the metal and eye.
    vec3 reflected=reflect(-V,N);
    float strip=smoothstep(.55,.98,dot(reflected,vec3(-.6,.8,0.0)));
    float fill=smoothstep(.60,.99,dot(reflected,vec3(.8,0.0,.6)));
    float distanceFade=1.0-smoothstep(5.2,9.5,vViewDistance);
    vec3 studio=(vec3(.24,.38,.48)*strip+vec3(.42,.27,.15)*fill)
      *(.32+.68*fresnel)*(.48+.52*distanceFade);
    titanium+=studio/(vec3(1.0)+studio);
   vec3 emitter=uColor*(.56+.18*facing+.26*vReactorLight);
   col=mix(mix(titanium,vec3(.013,.029,.044),aerial),emitter,guide);
   a=mix(a*.96,a,guide)*vReactorVisibility;
 }
 outColor=vec4(col,clamp(a,0.0,1.0));
}`;
      const shader=(type,source)=>{
        const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
        if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(e);}
        return s;
      };
      const v=shader(gl.VERTEX_SHADER,vert),f=shader(gl.FRAGMENT_SHADER,frag);
      const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);
      gl.bindAttribLocation(p,0,'aPosition');gl.bindAttribLocation(p,1,'aNormal');gl.bindAttribLocation(p,2,'aUv');
      gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);
      if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const e=gl.getProgramInfoLog(p);gl.deleteProgram(p);throw new Error(e);}
      return p;
    }
    buffer(data){const gl=this.gl,b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);return{buffer:b,count:data.length/8};}
    mesh(mesh,pos,size,color,rot=0,alpha=1,bend=0,cam=[0,0,0],fiber=false,tilt=0,shadow=false,vertexCount=mesh.count){
      const gl=this.gl,u=this.uniform;
      if(this.boundMesh!==mesh){
        gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);
        gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);
        gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,32,12);
        gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,2,gl.FLOAT,false,32,24);
        gl.uniform1f(u.uPanel,mesh===this.panel?1:0);
        this.boundMesh=mesh;
        this.attributeSetups++;
      }
      gl.uniform3fv(u.uOffset,pos);gl.uniform3fv(u.uScale,size);gl.uniform3fv(u.uColor,color);
      this.scalar('uRotation',rot);this.scalar('uTilt',tilt);
      this.scalar('uOpacity',alpha);
      this.scalar('uFiber',fiber?1:0);this.scalar('uBend',bend);
      this.scalar('uShadow',shadow?1:0);
      gl.drawArrays(gl.TRIANGLES,0,vertexCount);
      this.drawCalls++;
    }
    render(frame){
      if(!current||!archiveActive||document.hidden)return;
      const start=performance.now();
      const gl=this.gl,scene=current.s,p=current.progress,index=scene.index;
      const detail=quality==='high';
      if(detail!==this.panelDetail){
        // Switch VBO data in-place. No duplicate buffer, VAO, new context or
        // stale high-poly mesh when power-saving switches to lower detail.
        const vertices=panelGeometry(detail);
        gl.bindBuffer(gl.ARRAY_BUFFER,this.panel.buffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
        this.panel.count=vertices.length/8;
        this.panelDetail=detail;
      }
      if(root.dataset.fxArchivePanelTriangles!==String(this.panel.count/3))
        root.dataset.fxArchivePanelTriangles=String(this.panel.count/3);
      const pro=clamp(p),reveal=smooth((pro-.16)/.35),align=smooth((pro-.48)/.31),release=smooth((pro-.84)/.15);
      const travel=current.travel||0;
      const cam=CameraDirector.forScene(scene,pro,travel);
      const limitedTransit=mobile()&&softwareMagRenderer();
      const firstIngress=reactorEntry(scene,entryTransitProgress(pro,current.travel,limitedTransit));
      const corridor=firstIngress?null:corridorEntry(scene,corridorTransitProgress(scene,pro,current.travel,limitedTransit));
      const candidateIngress=firstIngress||corridor;
      const gateVertices=candidateIngress?reactorVisibleVertices(candidateIngress.progress,this.reactor.count):0;
      const ingress=gateVertices>0?candidateIngress:null;
      const transfer=reactorHandoff(scene,pro);
      const hue=scene.color,metal=[.23,.32,.39],edge=[.56,.71,.77];
      gl.useProgram(this.program);gl.bindVertexArray(this.vao);
      // Shared renderer: never assume uniforms survived another pass/frame.
      // Within this pass only, identical scalar values need no driver call.
      this.scalarCache.clear();this.scalarWrites=0;this.scalarSkips=0;
      // Camera is identical for every primitive in this scene frame.
      gl.uniform3fv(this.uniform.uCamera,cam);
      const orientation=passageOrientation(scene,pro,mobile());
      gl.uniform3fv(this.uniform.uArchiveCameraAngles,orientation);
      const energyTrack=roomEnergyTrack(scene,pro,travel);
      gl.uniform2fv(this.uniform.uRoomEnergy,energyTrack);
      setData(root,'fxArchiveEnergyR2300',energyTrack.map(x=>x.toFixed(3)).join(','));
      setData(root,'fxArchiveReactiveVolumeR2301',scene.key==='licensing'?'commerce-original':'energy-coupled-finite-scattering');
      setData(root,'fxArchiveCameraR2299',orientation.map(x=>x.toFixed(4)).join(','));
      gl.uniform1f(this.uniform.uAspect,frame.aspect);
      gl.uniform1f(this.uniform.uMobile,mobile()?1:0);
      if(ingress){
        const rings=reactorRingState(ingress.progress);
        gl.uniform3fv(this.uniform.uReactorRingScale,rings.scale);
        gl.uniform3fv(this.uniform.uReactorRingVisibility,rings.visibility);
        gl.uniform3fv(this.uniform.uReactorAxisX,rings.axisX);
        gl.uniform3fv(this.uniform.uReactorAxisY,rings.axisY);
        gl.uniform3fv(this.uniform.uReactorOpening,scene.key==='licensing'?[0,0,0]:rings.opening);
      }
      gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.DEPTH_TEST);gl.depthMask(false);gl.disable(gl.CULL_FACE);
      this.drawCalls=0;
      // Source-specific mechanics are attenuated on entry and return, not
      // teleported into view at full intensity when the reading line changes.
      // Architectural geometry below keeps its own stable opacity.
      let sourceOpacity=1;
      const box=(x,y,z,w,h,d,c=metal,rot=0,a=.8,fiber=false,tilt=0)=>
        this.mesh(this.box,[x,y,z],[w,h,d],c,rot,a*sourceOpacity,0,cam,fiber,tilt);
      const plate=(x,y,z,w,h,c=hue,rot=0,a=1,bend=.2)=>
        this.mesh(this.panel,[x,y,z],[w,h,1],c,rot,a*sourceOpacity,bend,cam);
      const side=index%2?-1:1;
      const sx=side*2.4,sy=.12*Math.sin(index),sz=-.3;
      // One opaque, depth-tested room draw replaces the disconnected rails.
      // Keep commerce on its original rendering path, preserve MAG depth.
      if(scene.key!=='licensing'){
        gl.disable(gl.BLEND);gl.depthMask(true);
        const roomZ=roomDolly(scene,pro,mobile());
        this.mesh(this.room,[0,0,roomZ],[1,1,1],hue,0,1,0,cam);
        setData(root,'fxArchiveRoomDollyR2294',roomZ.toFixed(3));
        setData(root,'fxArchiveAlloyR2297','machined-panels-armored-conduits');
        setData(root,'fxArchiveVolumeR2296',mobile()?'one-analytic-light-volume':'two-analytic-light-volumes');
        gl.depthMask(false);gl.enable(gl.BLEND);
        setData(root,'fxArchiveRoomR2292','seven-bay-eight-sided-native-depth-shell');
        setData(root,'fxArchiveRoomTrianglesR2292',String(this.room.count/3));
      }else{
        setData(root,'fxArchiveRoomR2292','commerce-original');
        setData(root,'fxArchiveRoomTrianglesR2292','0');
        setData(root,'fxArchiveRoomDollyR2294','0.000');
        setData(root,'fxArchiveAlloyR2297','commerce-original');
        setData(root,'fxArchiveVolumeR2296','commerce-original');
      }
      // One modest-depth contact penumbra connects drawer/shelf to archive.
      this.mesh(this.panel,[sx,sy-.74,-.72],[1.52,.37,1],[.06,.10,.14],
        0,.66,0,cam,false,0,true);
      // Shared deep archive architectural rails. Fixed in one world, not separate scene backgrounds.
      if(scene.key==='licensing')for(let k=-2;k<=2;k+=(quality==='low'?2:1)){
        const x=k*1.48;
        box(x,-1.60,-1.45,.042,2.65,.035,[.14,.23,.28],0,.24);
        box(x,1.34,-1.45,1.18,.045,.10,[.15,.31,.38],0,.19);
      }
      // Exchange one decorative rail for the batched gate, rather than
      // increasing the number of submitted draw calls on low-power devices.
      lastRenderedGate=Boolean(ingress&&ingress.alpha>.001);
      if(ingress&&ingress.alpha>.001){
        this.mesh(this.reactor,[0,0,ingress.z],[1,1,1],firstIngress?[.36,.73,.86]:hue,0,ingress.alpha,0,cam,true,0,false,gateVertices);
        // Count actual submitted gate geometry, not merely selected chapters.
        if(firstIngress)reactorProof.entryFrames++;
        else{reactorProof.corridorFrames++;reactorProof.chapters.add(scene.key);}
        reactorProof.peakAlpha=Math.max(reactorProof.peakAlpha,ingress.alpha);
      }
      setData(root,'fxArchiveReactorEntryR2261',firstIngress?'ingress':'clear');
      setData(root,'fxArchiveReactorPhaseR2262',firstIngress?(firstIngress.progress<.34?'approach':firstIngress.progress<.82?'traverse':'arrival'):'clear');
      setData(root,'fxArchiveCorridorR2265',corridor&&corridor.alpha>.001?scene.key:'clear');
      if(scene.key==='licensing')for(let k=0;k<3;k++){
        if(ingress&&ingress.alpha>.001&&k===1)continue;
        const y=-.95+k*.91;
        box(0,y,-1.15,7.2,.028,.065,[.18,.31,.38],0,.17);
      }
      // Eight architecturally fixed bays coexist in the SAME WebGL2 world.
      // In the previous release only the current source existed, making each
      // chapter feel like an abrupt environment replacement. A fixed
      // perforated atlas persists while exactly one bay animates its drawer.
      // Keep the hardware budget: 8 low-poly calls on mobile; 16 on desktop.
      const rackCount=Math.min(8,scenes.length);
      for(let rack=0;rack<rackCount;rack++){
        const side=rack%2===0?-1:1;
        const level=Math.floor(rack/2);
        const rx=side*2.78,ry=1.05-level*.68,rz=-.88-level*.10;
        const active=rack===index;
        const rc=scenes[rack].color;
        const pulse=readingEnergy(travel,rack,rackCount);
        const rackColor=active?rc:[mix(metal[0],rc[0],pulse),mix(metal[1],rc[1],pulse),mix(metal[2],rc[2],pulse)];
        box(rx,ry,rz,.90,.042,.18,rackColor,0,(active?.53:.19)+pulse*.29);
        // R2229: all eight actual source bays remain visible on every
        // renderer. Thin auxiliary struts cost eight extra GL draw calls
        // on SwiftShader but add almost no readable detail there. Keep
        // every strut on hardware-quality desktop MAG.
        if(!mobile()&&quality==='high'){
          box(rx+side*.45,ry-.14,rz-.08,.032,.46,.10,active?rc:edge,0,active?.45:.13);
        }
      }
      setData(root,'fxArchiveReadingTravelR2266',travel.toFixed(3));
      setData(root,'fxArchivePassageFlightR2289',scene.key==='licensing'?'checkout-static':'reversible-dolly');
      setData(root,'fxArchiveGateOpticsR2291','view-dependent-chamfer-studio-reflection');
      setData(root,'fxArchiveGateMechanicsR2298',ingress&&scene.key!=='licensing'?'24-rigid-retracting-segments':'clear');
      setData(root,'fxArchiveReactorSubmittedTrianglesR2279',String(lastRenderedGate?gateVertices/3:0));
      if(root.dataset.fxArchivePersistentRackCount!==String(rackCount))
        root.dataset.fxArchivePersistentRackCount=String(rackCount);
      if(root.dataset.fxArchiveWorldContinuity!=='persistent-one-world-r2044')
        root.dataset.fxArchiveWorldContinuity='persistent-one-world-r2044';
      // Only the selected bay moves; an arriving section gradually energizes
      // its own mechanisms. On reverse-scroll it settles back into storage.
      sourceOpacity=.20+.80*smooth(pro/.30)*(1-.78*smooth((pro-.86)/.14));
      // Eight distinct physical retrieval sources; geometry and trajectories differ.
      switch(scene.source){
        case 'left-shelf':
          for(let j=0;j<3;j++){box(-2.15+j*.26,-.17,-.15,.11,1.35,.19,metal,-.13*j,.63);}
          box(-2.30+.32*reveal,-.18,.05,.60,.055,.54,hue,.16,.8);break;
        case 'rotor':
          for(let j=0;j<5;j++){let t=j*Math.PI*.4+pro*1.7;box(sx+Math.sin(t)*.65,Math.cos(t)*.55,sz,.38,.045,.35,metal,t,.82);}
          box(sx,-.9,-.1,.12,2.3,.12,edge,pro*.35,.45);break;
        case 'bottom-drawer':
          box(sx,-1.05,-.45,1.2,.48,.70,metal,.12,.75);
          box(sx,-.94+reveal*.46,.10,1.02,.035,.62,hue,-.08,.9);
          box(sx,-1.0+.43*reveal,.45,.76,.03,.08,edge,0,.83);break;
        case 'right-cell':
          for(let j=0;j<4;j++){let a=j*Math.PI*.5;box(sx+Math.cos(a)*.7,sy+Math.sin(a)*.7,sz,.95,.035,.055,hue,a,.59);}
          box(sx,sy,sz-.4,1.43,1.43,.025,[.18,.38,.47],pro*.24,.28);break;
        case 'sealed-vault':
          box(sx,sy,sz,1.52,1.54,.62,metal,0,.85);
          box(sx-.39-.41*reveal,sy,sz+.36,.64,1.33,.10,hue,0,.9);
          box(sx+.39+.41*reveal,sy,sz+.36,.64,1.33,.10,hue,0,.9);
          for(let j=0;j<3;j++)box(sx,sy-.43+j*.43,sz+.48,.97,.03,.05,edge,0,.8);break;
        case 'vertical-crystal':
          box(sx,sy+1.1-.5*reveal,sz,.9,2.2,.33,metal,pro*.43,.75);
          box(sx,sy+.18,sz+.28,.54,1.65,.03,hue,.16,.84);break;
        case 'inner-chamber':
          for(let j=0;j<12;j+=(quality==='low'?2:1)){const a=j*Math.PI/6+pro*.34;box(Math.cos(a)*.83,Math.sin(a)*.72,.08,.34,.038,.038,hue,a,.4);}
          box(0,0,.16,.40,.40,.40,edge,pro*.24,.5);break;
        case 'assembled':
          for(let j=0;j<7;j+=(quality==='low'?2:1)){const a=j*Math.PI*2/7+pro*.30;plate(Math.cos(a)*1.9,Math.sin(a)*.95,-.3,.36,.57,hue,a*.12,.39,.1);}
          break;
      }
      sourceOpacity=1;
      // Archive data sheet: bent in storage, follows distinct 3D paths, becomes flat
      // at hand-off. It never contains rasterised application text.
      const sourceX=scene.source==='inner-chamber'?0:sx;
      const phase=scene.source==='bottom-drawer'?-.85:scene.source==='vertical-crystal'?.78:0;
      const wave=scene.index%3===0?Math.sin(reveal*Math.PI)*.62:
        scene.index%3===1?-Math.sin(reveal*Math.PI)*.48:
        Math.sin(reveal*Math.PI*1.2)*.24;
      const x=mix(sourceX,1.05,align)+wave*(1-align);
      const y=mix(sy+phase,.05,align)+Math.sin(reveal*Math.PI)*.19;
      const z=mix(.18,2.30,align);
      const bend=mix(.44,.006,smooth((pro-.46)/.30));
      const rotation=(1-align)*(side*.74)+align*.02;
      const alpha=reveal*(1-release)*transfer.settle;
      if(root.dataset.fxArchiveOptics!=='ggx-curved-normal-analytic-contact-aerial-fwidth')
        root.dataset.fxArchiveOptics='ggx-curved-normal-analytic-contact-aerial-fwidth';
      root.dataset.fxArchiveSheetMotion=pro<.16?'anticipation':
        pro<.48?'retrieval':pro<.78?'delivery':pro<.88?'held':'archiving';
      let filamentCount=0;
      if(alpha>.001){
        plate(x,y,z,.88+align*.40,.78+align*.42,hue,rotation,alpha,bend);
        // Every hardware tier keeps an actual 3D energy filament attached
        // to the SAME MAG. Low-end phones use 2 Bezier segments, not zero
        // filament geometry; higher tiers get subpixel-stable refinement.
        {
          const from=[-.16,.02,.56],to=[x-.13,y+.02,z-.06];
          const segments=quality==='high'?(mobile()?4:6):(mobile()?2:3);
          const strands=quality==='high'&&!mobile()?3:1;
          const bezier=(a,b,d,e,t)=>{
            const q=1-t;
            return q*q*q*a+3*q*q*t*b+3*q*t*t*d+t*t*t*e;
          };
          for(let strand=0;strand<strands;strand++){
            const dy=(strand-1)*.073;
            let prev=null;
            for(let k=0;k<=segments;k++){
              const t=k/segments;
              const point=[
                bezier(from[0],from[0]+(side*.38),to[0]-(side*.32),to[0],t),
                bezier(from[1]+dy,from[1]+dy+.27,to[1]+dy+.31,to[1]+dy,t),
                bezier(from[2],from[2]+.33,to[2]-.39,to[2],t)
              ];
              if(prev){
                const dx=point[0]-prev[0],dy3=point[1]-prev[1],dz=point[2]-prev[2];
                const dist=Math.hypot(dx,dy3,dz);
                 const tilt=-Math.atan2(dy3,Math.hypot(dx,dz));
                const midpoint=[(point[0]+prev[0])*.5,(point[1]+prev[1])*.5,(point[2]+prev[2])*.5];
                const thickness=.010+strand*.001;
                // The box's long Z axis follows the filament path in XZ.
                box(midpoint[0],midpoint[1],midpoint[2],thickness,thickness,
                  Math.max(dist,.012),hue,Math.atan2(dx,dz),alpha*(.18+.19*Math.sin(Math.PI*t)),true,tilt);
                filamentCount++;
              }
              prev=point;
            }
          }
        }
      }
      root.dataset.fxArchiveFilamentCount=String(filamentCount);
      gl.bindVertexArray(null);
      gl.depthMask(true);
      gl.disable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      if(root.dataset.fxArchiveDrawCalls!==String(this.drawCalls))root.dataset.fxArchiveDrawCalls=String(this.drawCalls);
      if(root.dataset.fxArchiveScalarWritesR2239!==String(this.scalarWrites))root.dataset.fxArchiveScalarWritesR2239=String(this.scalarWrites);
      if(root.dataset.fxArchiveScalarSkipsR2239!==String(this.scalarSkips))root.dataset.fxArchiveScalarSkipsR2239=String(this.scalarSkips);
      if(root.dataset.fxArchiveAttributeSwitchesR2228!==String(this.attributeSetups))
        root.dataset.fxArchiveAttributeSwitchesR2228=String(this.attributeSetups);
      if(root.dataset.fxArchiveDepthPolicyR2035!=='canonical-mag-front-deep-shelves-behind')
        root.dataset.fxArchiveDepthPolicyR2035='canonical-mag-front-deep-shelves-behind';
      if(root.dataset.fxArchiveNativePass!=='shared-webgl2')
        root.dataset.fxArchiveNativePass='shared-webgl2';
       if(filamentCount>0)root.dataset.fxArchiveFilamentOrientation='full-3d-bezier-r2007';
      painted++;
      PerformanceManager.observeSubmission(performance.now()-start);
    }
    dispose(){
      const gl=this.gl;
      gl.deleteBuffer(this.box.buffer);gl.deleteBuffer(this.panel.buffer);gl.deleteBuffer(this.reactor.buffer);gl.deleteBuffer(this.room.buffer);
      gl.deleteVertexArray(this.vao);gl.deleteProgram(this.program);
    }
  }

  const sourceNames={
    'left-shelf':['BAL ARCHÍVUMPOLC','LEFT ARCHIVE SHELF'],
    rotor:['FORGÓ ADATÁLLVÁNY','ROTATING DATA RACK'],
    'bottom-drawer':['MECHANIKUS REKESZ','MECHANICAL DRAWER'],
    'right-cell':['HOLOGRAFIKUS CELLA','HOLOGRAPHIC CELL'],
    'sealed-vault':['ZÁRT ARCHÍVUM','SEALED ARCHIVE'],
    'vertical-crystal':['KRISTÁLYTÁROLÓ','CRYSTAL STORAGE'],
    'inner-chamber':['MAG BELSŐ MAG','MAG INNER CORE'],
    assembled:['ÖKOSZISZTÉMA','ECOSYSTEM']
  };
  function createHandoff(){
    if(handoff?.isConnected)return;
    handoff=document.createElement('div');
    handoff.className='fx-archive-telemetry-r2022';
    handoff.setAttribute('aria-hidden','true');
    handoff.dataset.active='false';
    // Presentation metadata only. Native HTML owns all readable content
    // and actions; this HUD cannot intercept clicks or keyboard focus.
    // A flexible glass/papyrus display with source-derived real site content,
    // not a telemetry-only status badge. Original controls remain in-place.
    handoff.classList.add('fx-archive-physical-paper-r2026');
    handoff.innerHTML='<span class="fx-archive-physical-paper-r2026__rail" aria-hidden="true"></span>'+
      '<span class="fx-archive-telemetry-r2022__eyebrow">MAG // ARCHIVE INTERFACE</span>'+
      '<span class="fx-archive-physical-paper-r2026__step"></span>'+
      '<strong class="fx-archive-telemetry-r2022__title"></strong>'+
      '<p class="fx-archive-physical-paper-r2026__excerpt"></p>'+
      '<span class="fx-archive-telemetry-r2022__source"></span>'+
      '<span class="fx-archive-telemetry-r2022__foot">FORMATX // LIVE SYSTEM</span>';
    document.body.appendChild(handoff);
  }
  function updateHandoff(){
    if(!handoff?.isConnected)return;
    const showing=Boolean(current&&archiveActive&&!reduced.matches&&!document.body.classList.contains('fx-organism-panel-open'));
    setData(handoff,'active',showing?'true':'false');
    // Legacy R2022 telemetry remains available to nonvisual diagnostics but
    // must never compete with the only ORIGINAL working HTML folio.
    setData(handoff,'fxArchiveScreenVisible','false');
    if(!showing){handoffKey='';return;}
    const english=root.lang==='en',scene=current.s;
    const key=scene.key+':'+(english?'en':'hu');
    if(handoffKey!==key){
      handoffKey=key;
      handoff.querySelector('.fx-archive-telemetry-r2022__title').textContent=english?scene.en:scene.hu;
      handoff.querySelector('.fx-archive-telemetry-r2022__source').textContent=(sourceNames[scene.source]||[scene.source,scene.source])[english?1:0];
      handoff.querySelector('.fx-archive-physical-paper-r2026__step').textContent=
        '0'+(scene.index+1)+' / 0'+scenes.length;
      // Titles and copy come from the current, live DOM (including language).
      const h=scene.node.querySelector('h2,h3')||scene.node;
      const paragraphs=Array.from(scene.node.querySelectorAll('p'));
      const excerpt=paragraphs.find(p=>p.classList.contains('section-index')===false
        && p.textContent.trim().length>=28);
      handoff.querySelector('.fx-archive-telemetry-r2022__title').textContent=
        String(h.textContent||scene[english?'en':'hu']).trim().slice(0,140);
      handoff.querySelector('.fx-archive-physical-paper-r2026__excerpt').textContent=
        String(excerpt?.textContent||'').trim().slice(0,mobile()?100:210);
      const rgb=scene.color.map(x=>Math.round(x*255)).join(',');
      handoff.style.setProperty('--fx-archive-paper-light',rgb);
      handoff.dataset.source=scene.source;
      handoff.dataset.scene=scene.key;
    }
    // Site language/content modules may rerender the original heading within
    // the same cinematic chapter. Do not hold an outdated telemetry copy.
    const actualHeading=scene.node.querySelector('h2,h3')||scene.node;
    const actualTitle=String(actualHeading.textContent||scene[english?'en':'hu']).trim().slice(0,140);
    const liveTitle=handoff.querySelector('.fx-archive-telemetry-r2022__title');
    if(liveTitle.textContent!==actualTitle)liveTitle.textContent=actualTitle;
    const p=current.progress;
    // R2041 hides this duplicate diagnostic panel in the exclusive native
    // folio. Retain its metadata but don't animate a display:none element.
    if(root.dataset.fxArchiveCinema!=='active'||!document.body.classList.contains('living-architecture')){
      // The membrane unfolds from its unique archive location and approaches
      // the reader. After the handoff, the *actual* HTML headings/cards continue
      // the same motion as a native, functional interactive display.
      const push=smooth((p-.06)/.38);
      const settle=smooth((p-.44)/.31);
      const dir=mobile()?0:(scene.index%2===0?-1:1);
      setMotionStyle(handoff,'--fx-folio-translate-x',(dir*(1-push)*95+settle*dir*14).toFixed(1)+'px');
      setMotionStyle(handoff,'--fx-folio-translate-y',((1-push)*42+settle*14).toFixed(1)+'px');
      setMotionStyle(handoff,'--fx-folio-rotate-y',(dir*(1-push)*-24).toFixed(1)+'deg');
      setMotionStyle(handoff,'--fx-folio-rotate-x',((1-push)*12).toFixed(1)+'deg');
      setMotionStyle(handoff,'--fx-folio-scale',(0.82+push*.18-settle*.035).toFixed(3));
      setMotionStyle(handoff,'--fx-folio-bend',(1-push).toFixed(3));
    }
    setData(handoff,'phase',p<.24?'extracting':p<.52?'transferring':'presented');
    setData(root,'fxArchiveVisibleHandoff','physical-paper-active');
  }

  function setPanelState(){
    // R2053: there can only be one presented papyrus. Reset the previous
    // physical source ONCE on chapter change; don't rewrite seven inactive
    // source DOM/style attributes on every native pointer/touch scroll.
    const next=current?.s.node||null;
    if(lastPanelNode&&lastPanelNode!==next){
      lastPanelNode.style.removeProperty('--fx-archive-progress');
      lastPanelNode.removeAttribute('data-fx-archive-active');
    }
    if(next){
      const progress=current.progress.toFixed(4);
      if(next.style.getPropertyValue('--fx-archive-progress')!==progress)
        next.style.setProperty('--fx-archive-progress',progress);
      if(next.dataset.fxArchiveActive!=='true')
        next.dataset.fxArchiveActive='true';
    }
    lastPanelNode=next;
  }
  /* Lightweight selection is synchronous on native scroll. GPU rendering is
     still requestAnimationFrame-budgeted. This prevents stale chapters when
     content-visibility, infinite-scroll or a slow software GPU delays RAF. */
  function selectLiveChapter(){
    // Loading WebGL is not a user request to rearrange an already painted
    // document. The native MAG remains a usable hero until a real gesture.
    if(!journeyArmed){
      current=null;
      setData(root,'fxArchiveCurrent','none');
      return false;
    }
    if(!scenes.length)discover();
    const next=ScrollTimelineController.get();
    // From the moment the intro ends, the MAG owns the page. Do not leave the
    // old landing page visible for a whole first viewport of scrolling.
    // The same native scrolling and eight source anchors remain intact.
    const inArchive=Boolean(introDone&&root.dataset.fxArchiveExperience==='ready'&&next);
    current=inArchive?next:null;
    setData(root,'fxArchiveCurrent',current?.s.key||'none');
    if(current)setData(root,'fxArchivePhase',String(Math.min(9,Math.floor(current.progress*10))));
    return inArchive;
  }
  function update(){
    raf=0;if(disposed||document.hidden||reduced.matches)return;
    updates++;
    root.dataset.fxArchiveUpdateCount=String(updates);
    root.dataset.fxArchiveUpdateScroll=String(Math.round(scrollY));
    // R2053: invalidate() has already selected and docked the correct
    // chapter synchronously. Never measure the same eight physical anchors
    // again AFTER CSS writes in a queued GPU rAF: the re-measurement caused
    // forced style/layout and redundant stage docking on native scroll.
    // This frame owns only renderer scheduling and semantic scene events.
    if(current){
      const nextIndex=current.s.index;
      // Chapter identity was committed during synchronous chapter selection.
      if(nextIndex!==lastScene){
        lastScene=nextIndex;
        dispatchEvent(new CustomEvent('formatx:archivechapter',{detail:{key:current.s.key,index:nextIndex,source:current.s.source}}));
      }
    }else{lastScene=-1;}
    requestArchiveFrame();
  }
  // A gate leaving the screen is as important as one appearing: software
  // scroll must not hold its last visible frame over the next reading beat.
  function transitNeedsFrame(selection,previousGate,limited=false){
    const gate=selection&&(reactorEntry(selection.s,entryTransitProgress(selection.progress,selection.travel,limited))||
      corridorEntry(selection.s,corridorTransitProgress(selection.s,selection.progress,selection.travel,limited)));
    return Boolean(previousGate||(gate&&gate.alpha>.001));
  }
  function requestArchiveFrame(){
    if(gpuTailTimer){clearTimeout(gpuTailTimer);gpuTailTimer=0;}
    if(disposed||document.hidden||reduced.matches||!archiveActive)return;
    const now=performance.now(),remaining=PerformanceManager.frameInterval()-(now-lastGpu);
    if(remaining>0){
      // A final scroll event may arrive within the throttle interval.
      // Guarantee one trailing render without restarting a continuous loop.
      gpuTailTimer=setTimeout(()=>{gpuTailTimer=0;requestArchiveFrame();},Math.ceil(remaining));
      return;
    }
    lastGpu=now;
    const api=window.FormatXLivingCore;
    if(transitNeedsFrame(current,lastRenderedGate,mobile()&&softwareMagRenderer())&&typeof api?.requestTransitRender==='function')api.requestTransitRender();
    else api?.requestRender?.(1);
  }
  function invalidate(){
    if(disposed)return;
    // R2236: early module/intro/ResizeObserver readiness events do not own
    // an archive document yet. They were scheduling empty DOM/GPU frames
    // before connect() had built the seven real folios (6 idle commits).
    // The successful native WebGL connect() always invokes invalidate()
    // AFTER prepareCinemaHosts(), so the first real sync is preserved.
    if(!force&&!journeyArmed&&!cinemaPrepared){
      root.dataset.fxArchiveIdlePhaseR2236='awaiting-native-folios';
      return;
    }
    // The first cinematic home render must establish all original folios,
    // inert attributes and legal checkout visibility. Subsequent resize-
    // observer bursts before visitor intent must not trigger the same
    // seven-host style walk plus an empty GPU request every time.
    if(!journeyArmed&&!archiveActive&&!force&&idleComposed&&
       cinemaPrepared&&root.dataset.fxArchiveExperience==='ready'){
      idleFastPathSkips++;
      return;
    }
    if(!disposed&&!document.hidden&&!reduced.matches){
      try{
        // R2022: synchronize the visible archive layer and chapter identity
        // with the native scroll event, not a deferred GPU RAF. A slow WebGL
        // frame must never strand a previous panel/HUD over the next chapter.
        const active=selectLiveChapter();
        if(active&&stage)ResponsiveExperience.dock();
        else if(archiveActive)ResponsiveExperience.restore();
        setPanelState();
        // R2057: keep chapter identity and canonical MAG docking synchronous.
        // Expensive native-document transformations share one pre-paint
        // animation frame, so wheel/touch bursts cannot repeatedly recompute
        // styles in the same 16.7ms visual interval. The GPU pass is separate.
        if(!domRaf){
          domRaf=requestAnimationFrame(()=>{
            domRaf=0;
            if(disposed||document.hidden||reduced.matches)return;
            try{
              updateRealContentSheets();
              syncCinema();
              updateHandoff();
              domComposes++;
              root.dataset.fxArchiveDomComposes=String(domComposes);
              if(!journeyArmed&&!archiveActive&&cinemaPrepared){
                idleComposed=true;
                root.dataset.fxArchiveIdleFirstSyncR2235='complete';
              }
            }catch(e){root.dataset.fxArchiveError=String(e?.message||e);}
          });
        }
      }catch(e){root.dataset.fxArchiveError=String(e?.message||e);}
    }
    if(!raf&&!disposed)raf=requestAnimationFrame(()=>{
      try{update();}catch(e){raf=0;root.dataset.fxArchiveError=String(e?.message||e);console.error('FormatX archive update error',e);}
    });
  }
  function connect(){
    if(disposed||reduced.matches||(!force&&(audit||isolatedMagCheck)))return;
    const api=window.FormatXLivingCore;
    if(!api?.registerScenePass||!api.sharedWebGL2||!api.canvas||!api.stage)return;
    // `formatx:real3dready` may fire again for the same canonical MAG
    // renderer. Never register a duplicate render pass or orphan GPU buffers.
    if(detach&&registeredCanvas===api.canvas&&registeredApi===api)return;
    if(detach){
      detach();
      detach=null;drawPass=null;
      registeredCanvas=null;registeredApi=null;
    }
    stage=api.stage;heroHost=document.querySelector('#hero .hero-space');
    // The canonical organism already identifies software fallback. Its
    // 3D paper shares that renderer and must use a matching lightweight
    // mesh/rail/filament budget, not desktop-high draw calls on SwiftShader.
    if(softwareMagRenderer())quality='low';
    root.dataset.fxArchiveQualityPolicyR2227=softwareMagRenderer()
      ?'software-lite-single-webgl2'
      :'hardware-photographic-full';
    try{
      const nativeScene=new MAGScene(api.canvas.getContext('webgl2'));
      api.canvas.addEventListener('webglcontextlost',()=>{
        if(registeredCanvas!==api.canvas)return;
        if(archiveActive)ResponsiveExperience.restore();
        root.dataset.fxArchiveExperience='context-lost';
        root.dataset.fxArchiveCinema='home';
        setLegacyHeroHidden(false);
        setHeroCanvasLaneFront(false);
        restoreExistingCinemaControls();
        delete root.dataset.fxArchiveCinemaPrepared;
        // Return all ORIGINAL section nodes to their canonical locations.
        // A lost WebGL renderer must never strand content inside 3D panels.
        queueMicrotask(()=>stop());
      },{once:true});
      drawPass=frame=>nativeScene.render(frame);
      drawPass.dispose=()=>nativeScene.dispose();
      detach=api.registerScenePass(drawPass);
      registeredCanvas=api.canvas;
      registeredApi=api;
      root.dataset.fxArchiveExperience='ready';
      root.dataset.fxArchiveQuality=quality;
      root.dataset.fxArchiveTargetFrameMs=String(PerformanceManager.frameInterval());
      // Only after one real shared WebGL2 renderer exists may the original
      // website be replaced by the one-chapter cinematic archive. A blocked
      // WebGL context must retain the usable original HTML experience.
      ensureAIScrollStation();
      discover();
      invalidate();
    }catch(error){
      root.dataset.fxArchiveExperience='context-error';
      console.warn('FormatX archive WebGL pass unavailable:',error);
    }
  }
  function stop(){
    if(disposed)return;
    disposed=true;
    root.dataset.fxArchiveStopReason='lifecycle-stop';
    if(raf)cancelAnimationFrame(raf);
    if(domRaf)cancelAnimationFrame(domRaf);
    if(gpuTailTimer)clearTimeout(gpuTailTimer);
    raf=domRaf=gpuTailTimer=0;
    sceneObserver?.disconnect();
    sceneObserver=null;
    handoff?.remove();handoff=null;
    restoreExistingCinemaControls();
    restoreExistingFinalCta();
    restoreExistingProofBlock();
    setLegacyHeroHidden(false);
    setHeroCanvasLaneFront(false);
    root.dataset.fxArchiveCinema='home';
    delete root.dataset.fxArchiveCinemaPrepared;
    delete root.dataset.fxArchiveCinemaChapter;
    for(const host of cinemaHosts){
      const panel=host.querySelector(':scope > .fx-archive-cinema-folio-r2030');
      if(panel){
        // Synthetic source telemetry is not part of the original product UI:
        // remove it BEFORE restoring exactly the native source DOM children.
        panel.querySelector(':scope > .fx-mag-folio-origin-r2041')?.remove();
        panel.inert=false;
        while(panel.firstChild)host.insertBefore(panel.firstChild,panel);
        panel.remove();
      }
      host.removeAttribute('data-fx-cinema-host-active');
      host.removeAttribute('data-fx-cinema-anchor-height');
      for(const [name,value,priority] of host._fxArchiveOriginalHeights||[]){
        if(value)host.style.setProperty(name,value,priority);
        else host.style.removeProperty(name);
      }
      delete host._fxArchiveOriginalHeights;
      // Idempotent, including WebGL context loss during a scene transition.
      setArchiveAnchorNeutral(host,false);
    }
    restoreOriginalAI();
    cinemaHosts=[];cinemaPrepared=false;entryReactorHost=null;lastRenderedGate=false;
    delete root.dataset.fxArchiveReactorEntryR2261;
    delete root.dataset.fxArchiveReactorPhaseR2262;
    delete root.dataset.fxArchiveCorridorR2265;
    delete root.dataset.fxArchiveReadingTravelR2266;
    for(const node of paperNodes){
      node.classList.remove('fx-archive-live-sheet-r2026');
      node.removeAttribute('data-fx-archive-paper-source');
      node.removeAttribute('data-fx-archive-paper-phase');
      for(const prop of ['--fx-archive-paper-x','--fx-archive-paper-y','--fx-archive-paper-rot','--fx-archive-paper-scale','--fx-archive-paper-opacity'])node.style.removeProperty(prop);
    }
    ResponsiveExperience.restore();
    detach?.();detach=null;drawPass=null;
    registeredCanvas=null;registeredApi=null;
    scenes.forEach(s=>{s.node.style.removeProperty('--fx-archive-progress');s.node.removeAttribute('data-fx-archive-active');});
    lastPanelNode=null;
    root.dataset.fxArchiveExperience='disposed';
  }
  function init(){
    if(reduced.matches||requestedHtmlFallback){
      root.dataset.fxArchiveExperience='reduced-html';
      root.dataset.fxArchiveHtmlFallback=requestedHtmlFallback?'user-requested':'reduced-motion';
      return;
    }
    if(!force&&(audit||isolatedMagCheck)){root.dataset.fxArchiveExperience=isolatedMagCheck?'isolated-mag-test':'audit-html';return;}
    // Real user intent activates the cinematic world without a delayed,
    // unsolicited 3D stage relocation (measured CLS 0.17/0.99 at 2-4s).
    // The first scroll still initiates the Igloo-style scene journey.
    const startJourney=event=>{
      if(journeyArmed||(event&&!event.isTrusted))return;
      if(event?.type==='keydown'&&![
        'ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Spacebar'
      ].includes(event.key))return;
      journeyArmed=true;
      idleComposed=false;
      root.dataset.fxArchiveEngagementR2220='visitor-'+(event?.type||'navigation');
      invalidate();
    };
    if(!journeyArmed){
      // Observe genuine visitor gestures before descendant controls can stop
      // propagation. Passive capture neither cancels nor redirects scrolling.
      addEventListener('wheel',startJourney,{passive:true,capture:true});
      addEventListener('touchmove',startJourney,{passive:true,capture:true});
      addEventListener('keydown',startJourney,{passive:true,capture:true});
      addEventListener('pointerdown',event=>{
        if(event.isTrusted &&
           (event.target instanceof Element &&
             (event.target.closest('button,a')||
              event.clientX>=document.documentElement.clientWidth-20)))
          startJourney(event);
      },{passive:true});
      addEventListener('hashchange',()=>startJourney(null),{passive:true});
      addEventListener('formatx:mag-chapter-toggle',()=>startJourney(null),{passive:true});
    }
    sceneObserver=new ResizeObserver(()=>invalidate());
    createHandoff();
    // If the introductory film completed before this deferred module loaded,
    // its overlay will already have been removed. It must never replay here.
    if(root.dataset.fxMagBirthOwnerR533!=='active'
        && !document.getElementById('fx-mag-birth-prepaint-r1606')
        && !document.querySelector('[data-fx-mag-birth-live]'))introDone=true;
    discover();
    if(scenes.length<2){root.dataset.fxArchiveExperience='no-scenes';return;}
    connect();
    addEventListener('formatx:real3dready',()=>{connect();},{passive:true});
    addEventListener('scroll',invalidate,{passive:true});
    addEventListener('resize',()=>{idleComposed=false;invalidate();},{passive:true});
    addEventListener('formatx:cinematicscene',invalidate,{passive:true});
    addEventListener('formatx:livingready',()=>{
      if(disposed)return;
      idleComposed=false;
      discover();invalidate();
    },{passive:true});
    document.addEventListener('formatx:magbirthcomplete',()=>{
      introDone=true;
      idleComposed=false;
      invalidate();
    },{passive:true});
    addEventListener('formatx:languagechange',()=>{
      idleComposed=false;
      invalidate();
    },{passive:true});
    // R2288: preserve original folios, controls and native scene pass
    // when the document is put into the browser back/forward cache.
    function onPageHide(event){
      if(!event.persisted){stop();return;}
      if(raf)cancelAnimationFrame(raf);
      if(domRaf)cancelAnimationFrame(domRaf);
      if(gpuTailTimer)clearTimeout(gpuTailTimer);
      raf=domRaf=gpuTailTimer=0;
      root.dataset.fxArchiveLifecycleR2288='suspended';
    }
    function onPageShow(event){
      if(event.persisted){
        lastGpu=0;
        root.dataset.fxArchiveLifecycleR2288='restored';
      }
      idleComposed=false;invalidate();
    }
    addEventListener('pageshow',onPageShow,{passive:true});
    document.addEventListener('visibilitychange',()=>{
      if(!document.hidden){idleComposed=false;invalidate();}
    },{passive:true});
    reduced.addEventListener('change',()=>{if(reduced.matches)stop();},{passive:true});
    addEventListener('pagehide',onPageHide,{passive:true});
    invalidate();
  }
  window.FormatXArchiveExperience={
    version:VERSION,get scenes(){return scenes.map(s=>({key:s.key,source:s.source,id:s.scrollAnchor?.id||s.node.id||s.selector}));},
    get state(){return{active:archiveActive,scene:current?.s.key||null,progress:current?.progress??0,frames:painted,quality,updates,disposed,raf,scrollY,lastUpdateScroll:root.dataset.fxArchiveUpdateScroll||null,error:root.dataset.fxArchiveError||null,
      targetFrameMs:PerformanceManager.frameInterval(),
      idleFastPathSkips,idleComposed,styleWrites,styleSkips,
      cpuSubmitMs:PerformanceManager.samples?Number(PerformanceManager.emaMs.toFixed(2)):null,
      cpuSamples:PerformanceManager.samples,domComposes,
      reactorProof:{entryFrames:reactorProof.entryFrames,corridorFrames:reactorProof.corridorFrames,chapters:Array.from(reactorProof.chapters),peakAlpha:reactorProof.peakAlpha}};},
    refresh:()=>{if(!disposed){discover();invalidate();}},setQuality:value=>{if(!disposed)PerformanceManager.setQuality(value);}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
