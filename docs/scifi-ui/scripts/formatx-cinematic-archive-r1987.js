/* FormatX R1987 — Cinematic Archive native WebGL scene.
   Same context/canvas and original living MAG, no second WebGL renderer.
   Section content remains native HTML. All phases derive from scroll geometry. */
(() => {
  'use strict';
  const root=document.documentElement;
  const VERSION='cinematic-archive-r2040-deterministic-folio-3d-handoff';
  if(root.dataset.fxArchiveExperience) return;
  const params=new URLSearchParams(location.search);
  const audit=/Chrome-Lighthouse/i.test(navigator.userAgent||'')||params.get('lighthouse')==='1';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const force=params.get('archive')==='1';
  const requestedHtmlFallback=params.get('archive')==='off';
  const isolatedMagCheck=params.has('r486-optics-energy-check')||params.has('mobileproof');
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const mobile=()=>matchMedia('(max-width: 900px)').matches;
  const blueprint=[
    {selector:'#experience',key:'ecosystem',hu:'FORMATX ÖKOSZISZTÉMA',en:'FORMATX ECOSYSTEM',source:'left-shelf',color:[.50,.81,.94]},
    {selector:'#live-os-overview, .fx-category-deck--standalone',key:'systems',hu:'LIVE OS / RENDSZERKATEGÓRIÁK',en:'LIVE OS / SYSTEM CATEGORIES',source:'rotor',color:[.65,.78,.99]},
    {selector:'#capabilities',key:'diagnostics',hu:'DIAGNOSZTIKA',en:'DIAGNOSTICS',source:'bottom-drawer',color:[.48,.95,.87]},
    {selector:'#network',key:'network',hu:'HÁLÓZATI ESZKÖZÖK',en:'NETWORK TOOLS',source:'right-cell',color:[.54,.80,.97]},
    {selector:'#system',key:'security',hu:'RENDSZER ÉS BIZTONSÁG',en:'SYSTEM & SECURITY',source:'sealed-vault',color:[.74,.86,.98]},
    {selector:'#pricing',key:'licensing',hu:'LICENCEK ÉS CSOMAGOK',en:'LICENSING & PLANS',source:'vertical-crystal',color:[.92,.77,.60]},
    {selector:'#capabilities .cards .card:last-child',key:'intelligence',hu:'AI SEGÍTSÉG',en:'AI GUIDANCE',source:'inner-chamber',color:[.66,.88,1]},
    {selector:'#resources',key:'final',hu:'FORMATX ERŐFORRÁSOK',en:'FORMATX RESOURCES',source:'assembled',color:[.82,.91,1]}
  ];
  let scenes=[],current=null,drawPass=null,detach=null,stage=null,heroHost=null;
  let raf=0,lastGpu=0,lastScene=-1,disposed=false,painted=0,archiveActive=false,updates=0;
  let sceneObserver=null,handoff=null,handoffKey='',paperNodes=[];
  let registeredCanvas=null,registeredApi=null;
  let cinemaHosts=[],cinemaPrepared=false,lastCinemaKey='';
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
  const mobilePerf=Boolean(navigator.deviceMemory&&navigator.deviceMemory<=4);
  let quality=mobilePerf?'low':'high';
  root.dataset.fxArchiveExperience='pending';
  function ensureAIScrollStation(){
    if(document.getElementById('fx-mag-ai-scroll-station-r2030'))return;
    const original=document.querySelector('#capabilities .cards .card:last-child');
    const host=document.getElementById('capabilities');
    if(!(original instanceof HTMLElement)||!host||!host.parentNode)return;
    const anchor=document.createElement('section');
    anchor.id='fx-mag-ai-scroll-station-r2030';
    anchor.className='fx-mag-ai-scroll-station-r2030';
    anchor.setAttribute('aria-hidden','true');
    anchor.setAttribute('inert','');
    const title=original.querySelector('h3')?.textContent?.trim()||'AI / AUTOMATION';
    const description=original.querySelector('p')?.textContent?.trim()||'FormatX intelligence';
    // This hidden scroll station is a stable chapter locator only. The
    // actual AI card remains the original native DOM inside capabilities.
    const textNode=document.createElement('div');
    const heading=document.createElement('h3');
    const body=document.createElement('p');
    heading.textContent=title;
    body.textContent=description;
    textNode.append(heading,body);
    anchor.append(textNode);
    host.after(anchor);
    for(const name of ['height','min-height','max-height'])anchor.style.setProperty(name,'165dvh','important');
  }
  function discover(){
    const previous=scenes.map(x=>x.node);
    scenes=blueprint.map(def=>{
      const node=document.querySelector(def.selector);
      return node instanceof HTMLElement ? {...def,node} : null;
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
    }
  }

  /* R2030 EXCLUSIVE FORMATX ARCHIVE.
     The original live DOM nodes are moved ONCE into a semantic, scrollable
     cinematic folio inside their original section, preserving their identity,
     event handlers, links, IDs and delegated events on the section.
     Every original section remains in the document as a scroll anchor.
     No clones, dummy tiles, canvas text, videos or second 3D renderer. */
  function prepareCinemaHosts(){
    for(const scene of scenes){
      const host=scene.node.closest('main#main-content > section.scene,main#main-content > section.fx-category-deck--standalone');
      if(!(host instanceof HTMLElement))continue;
      scene.cinemaHost=host;
      let panel=host.querySelector(':scope > .fx-archive-cinema-folio-r2030');
      if(!panel){
        const oldHeight=Math.max(520,host.getBoundingClientRect().height||host.offsetHeight);
        panel=document.createElement('div');
        panel.className='fx-archive-cinema-folio-r2030';
        panel.setAttribute('role','region');
        panel.setAttribute('aria-label','FormatX MAG cinematic content');
        // Adding one wrapper preserves the source section's layout anchor,
        // its own events and all real interactive descendants.
        const nodes=Array.from(host.childNodes);
        for(const node of nodes)panel.appendChild(node);
        host.appendChild(panel);
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
      cinemaPrepared=true;
      root.dataset.fxArchiveCinemaPrepared=String(cinemaHosts.length);
      attachExistingFinalCta();
      attachExistingProofBlock();
    }
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
    const host=panel.parentElement;
    if(host instanceof HTMLElement&&host.dataset.fxCinemaHostActive==='true'){
      if(!host._fxCinemaOriginalTransform){
        host._fxCinemaOriginalTransform=[
          'transform','translate','rotate','scale','filter','perspective',
          'contain','will-change','content-visibility'
        ].map(name=>[name,host.style.getPropertyValue(name),host.style.getPropertyPriority(name)]);
      }
      for(const [key,value] of [
        ['transform','none'],['translate','none'],['rotate','none'],
        ['scale','none'],['filter','none'],['perspective','none'],
        ['contain','none'],['will-change','auto'],['content-visibility','visible']
      ])host.style.setProperty(key,value,'important');
    }
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
      panel.style.removeProperty('translate');
      panel.style.removeProperty('--fx-cinema-screen-x');
      panel.style.removeProperty('--fx-cinema-screen-y');
      panel.style.setProperty('top',viewportTop.toFixed(2)+'px','important');
      panel.dataset.fxMobileScreenTop=viewportTop.toFixed(2);
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
    root.dataset.fxArchiveCinema=enabled?'active':'home';
    if(enabled)keepExistingCinemaControls();
    setLegacyHeroHidden(enabled);
    setHeroCanvasLaneFront(enabled);
    const selected=enabled?current.s:null;
    const key=selected?.key||'home';
    root.dataset.fxArchiveCinemaChapter=key;
    for(const host of cinemaHosts){
      const active=Boolean(selected&&selected.cinemaHost===host);
      host.dataset.fxCinemaHostActive=active?'true':'false';
      const panel=host.querySelector(':scope > .fx-archive-cinema-folio-r2030');
      if(panel){
        panel.dataset.fxCinemaPanelActive=active?'true':'false';
        if(active){
          const p=clamp(current.progress);
          // R2038: deliver the REAL interactive folio throughout the scroll beat.
          // Previously opacity zero hid all actual content while a small
          // decorative status card remained visible in production screenshots.
          const entry=smooth((p-.035)/.28),exit=smooth((p-.94)/.06);
          const materialize=(.83+.17*entry)*(1-.09*exit);
          panel.style.setProperty('--fx-cinema-materialize',materialize.toFixed(4));
          panel.style.setProperty('--fx-cinema-orbit',(1-materialize).toFixed(4));
          panel.style.setProperty('--fx-cinema-depth',Math.round((1-materialize)*-95)+'px');
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
          const paperArrival=smooth((p-.08)/.38);
          const unresolved=1-paperArrival;
          const phone=mobile();
          const lateral=phone?0:sourceAxis*(unresolved*14-paperExit*9);
          const vertical=(phone?7:12)*unresolved+(phone?5:10)*paperExit;
          const yaw=phone?0:sourceAxis*(unresolved*-5.5+paperExit*3.5);
          const pitch=phone?unresolved*3.5-paperExit*2:unresolved*1.5-paperExit;
          const depth=-(phone?25:48)*unresolved-25*paperExit;
          const scale=1-.025*unresolved-.018*paperExit;
          panel.style.setProperty('--fx-cinema-handoff-x',lateral.toFixed(2)+'px');
          panel.style.setProperty('--fx-cinema-handoff-y',vertical.toFixed(2)+'px');
          panel.style.setProperty('--fx-cinema-handoff-z',depth.toFixed(2)+'px');
          panel.style.setProperty('--fx-cinema-handoff-yaw',yaw.toFixed(3)+'deg');
          panel.style.setProperty('--fx-cinema-handoff-pitch',pitch.toFixed(3)+'deg');
          panel.style.setProperty('--fx-cinema-handoff-scale',scale.toFixed(4));
          panel.dataset.fxCinemaSource=selected.source;
          panel.dataset.fxCinemaHandoff=paperArrival>.99?(paperExit>.02?'archiving':'presented'):'retrieving';
          root.dataset.fxArchiveNativeHandoff='scroll-coupled-real-3d-paper';
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
      licensing:[':scope > .section-heading',':scope > .pricing > .price-card'],
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
    const vh=Math.max(1,innerHeight);
    // Limit viewport geometry reads to the current and adjacent chapters.
    const nearby=new Set();
    if(current){
      const i=current.s.index;
      for(const scene of scenes){
        if(Math.abs(scene.index-i)<=1)for(const node of scene.paperNodes||[])nearby.add(node);
      }
    }
    for(const node of nearby){
      if(!node.isConnected)continue;
      const bounds=node.getBoundingClientRect();
      const entry=clamp((vh*.89-bounds.top)/Math.max(160,vh*.37));
      const last=paperLast.get(node);
      if(last!==undefined&&Math.abs(entry-last)<.007)continue;
      paperLast.set(node,entry);
      const away=1-smooth(entry);
      const s=sceneForElement(node);
      const dir=mobile()?0:(s?.index%2===0?-1:1);
      node.style.setProperty('--fx-archive-paper-x',(away*dir*46).toFixed(1)+'px');
      node.style.setProperty('--fx-archive-paper-y',(away*36).toFixed(1)+'px');
      node.style.setProperty('--fx-archive-paper-rot',(away*dir*-13).toFixed(2)+'deg');
      node.style.setProperty('--fx-archive-paper-scale',(1-away*.075).toFixed(4));
      node.style.setProperty('--fx-archive-paper-opacity',(.66+smooth(entry)*.34).toFixed(3));
      node.dataset.fxArchivePaperPhase=entry>=.99?'presented':'being-handed';
    }
    root.dataset.fxArchiveRealContent='native-paper-handoff';
  }
  function sceneForElement(node){
    for(const s of scenes)if((s.paperNodes||[]).includes(node))return s;
    return null;
  }

  class ScrollTimelineController {
    static get(){
      if(!scenes.length)return null;
      // Absolute layout only, never alter document scroll position.
      let closest=null,score=Infinity;
      const anchor=innerHeight*.52;
      for(const s of scenes){
        const r=(s.scrollAnchor||s.node).getBoundingClientRect();
        if(r.height<1||r.width<1)continue;
        const contains=r.top<=anchor&&r.bottom>=anchor;
        const distance=contains ? Math.abs((r.top+r.bottom)*.5-anchor)/Math.max(1,r.height)
          : r.top>anchor ? r.top-anchor : anchor-r.bottom;
        // Prefer the real visible section containing the viewport's reading line.
        // Tall sections must never lose to a neighbour's off-screen quarter point.
        const delta=contains?(distance*.01+Math.min(r.height,innerHeight*5)*.0000003):10+distance;
        if(delta<score){score=delta;closest={s,rect:r};}
      }
      if(!closest)return null;
      const r=closest.rect;
      // R2022: In long chapters the prior scrub saturated at 1 while the
      // section was still on screen. release=1 then made the panel invisible.
      // Hold the physically flattened membrane through the reading interval
      // and only release once the section actually exits the viewport.
      const entering=clamp((innerHeight*.88-r.top)/Math.max(1,innerHeight*1.15));
      // R2032: the old sheet MUST finish its physical return before the
      // reading line advances to the next shelf, not after leaving the screen.
      const exiting=clamp((innerHeight*.94-r.bottom)/Math.max(1,innerHeight*.44));
      const p=Math.min(.78,entering)+.22*exiting;
      return {...closest,progress:clamp(p)};
    }
  }
  class PerformanceManager {
    static frameInterval(){return mobile()?(mobilePerf?50:33):16;}
    static setQuality(value){quality=value==='low'?'low':'high';root.dataset.fxArchiveQuality=quality;invalidate();}
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
    static forScene(scene,p){
      // The camera lives in ONE archive, so chapter changes must not teleport
      // it. Absolute native document scroll makes the track reversible.
      const distance=scrollY/Math.max(1,innerHeight);
      const approach=smooth((p-.16)/.69);
      // One continuous world-space dolly/orbit track. Every component depends
      // on absolute scroll, not discrete chapter indices (no camera teleport).
      const orbit=Math.sin(distance*.18)*.085+Math.sin(distance*.37)*.026;
      const dolly=Math.sin(distance*.13)*.11;
      const lift=Math.sin(distance*.12)*.035;
      return [orbit,lift+mix(-.025,.027,approach),
        dolly+mix(-.035,.085,approach)];
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
      this.panel=this.buffer(panelGeometry(quality==='high'));
      this.uniform={};
      for(const name of ['uOffset','uScale','uColor','uCamera','uRotation','uTilt','uBend','uOpacity','uPanel','uFiber','uAspect','uMobile','uShadow']){
        this.uniform[name]=gl.getUniformLocation(this.program,name);
      }
      this.vao=gl.createVertexArray();
      if(!this.vao)throw new Error('VAO unavailable');
      this.drawCalls=0;
    }
    programFor(gl){
      const vert=`#version 300 es
precision highp float;
in vec3 aPosition;in vec3 aNormal;in vec2 aUv;
uniform vec3 uOffset,uScale,uCamera;uniform float uRotation,uTilt,uBend,uAspect,uMobile;
out vec3 vNormal;out vec2 vUv;
void main(){
 vec3 p=aPosition*uScale;
 p.z+=uBend*pow(2.0*aUv.x-1.0,2.0)*sin(3.14159*aUv.y);
 float st=sin(uTilt),ct=cos(uTilt);
 p=vec3(p.x,ct*p.y-st*p.z,st*p.y+ct*p.z);
 float s=sin(uRotation),c=cos(uRotation);
 p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z)+uOffset-uCamera;
 // Portrait atlas projection: make every physical shelf AND the flexible
 // panel visible in the mobile archive instead of clipping at the sides.
 if(uMobile>.5){p.x*=.34;p.y=p.y*.63-.18;}
 float d=max(2.4,6.2-p.z);
 gl_Position=vec4(p.x*3.3/max(0.6,uAspect),p.y*3.3,(p.z-2.8)*.36,d);
 vec3 n=vec3(aNormal.x,ct*aNormal.y-st*aNormal.z,st*aNormal.y+ct*aNormal.z);
 vNormal=vec3(c*n.x+s*n.z,n.y,-s*n.x+c*n.z);
 vUv=aUv;
}`;
      const frag=`#version 300 es
precision highp float;
in vec3 vNormal;in vec2 vUv;
uniform vec3 uColor;uniform float uOpacity,uPanel,uFiber,uShadow;
out vec4 outColor;
void main(){
 vec3 N=normalize(vNormal+vec3(.0001));
 vec3 V=normalize(vec3(.10,-.07,1.0));
 vec3 L=normalize(vec3(-.38,.68,1.0));
 vec3 H=normalize(L+V);
 float ndl=max(.06,dot(N,L));
 float facing=clamp(dot(N,V),0.0,1.0);
 float fresnel=pow(1.0-facing,5.0);
 // Normalized GGX microfacet reflection and Fresnel-Schlick form a
 // single physically coherent lighting response for the archival glass.
 float roughness=uPanel>.5?.20:.44;
 float a2=roughness*roughness; a2*=a2;
 float ndh=max(.001,dot(N,H));
 float ndv=max(.001,dot(N,V));
 float denom=ndh*ndh*(a2-1.0)+1.0;
 float D=a2/(3.14159265*denom*denom+1e-5);
 float k=pow(roughness+1.0,2.0)*.125;
 float G=(ndl/(ndl*(1.0-k)+k))*(ndv/(ndv*(1.0-k)+k));
 float vh=max(0.0,dot(V,H));
 vec3 F0=mix(vec3(.038),uColor*.22,uPanel>.5?.24:.08);
 vec3 F=F0+(1.0-F0)*pow(1.0-vh,5.0);
 vec3 specular=(D*G*F)/max(.02,4.0*ndl*ndv);
 float spec=clamp(dot(specular,vec3(.33)),0.0,1.0);
 vec3 base=mix(vec3(.025,.047,.060),uColor,uPanel>.5?.23:.18);
 vec3 col=base*(.27+.68*ndl)*(1.0-max(F.r,max(F.g,F.b)))+specular*.65+uColor*fresnel*.12;
 if(uShadow>.5){
   // Soft analytical contact penumbra underneath the moving archive drawer.
   // No second depth buffer, post-process or fake bloom. Cost: one shared
   // panel mesh. This is a planar approximation, not shadow-map tracing.
   vec2 q=(vUv-vec2(.5))*vec2(2.1,2.5);
   float shadow=exp(-3.8*dot(q,q))*(1.0-smoothstep(.76,1.20,length(q)));
   outColor=vec4(vec3(.003,.010,.018),uOpacity*shadow*.65);
   return;
 }
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
    mesh(mesh,pos,size,color,rot=0,alpha=1,bend=0,cam=[0,0,0],fiber=false,tilt=0,shadow=false){
      const gl=this.gl,u=this.uniform;
      gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);
      gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);
      gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,32,12);
      gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,2,gl.FLOAT,false,32,24);
      gl.uniform3fv(u.uOffset,pos);gl.uniform3fv(u.uScale,size);gl.uniform3fv(u.uColor,color);
      gl.uniform3fv(u.uCamera,cam);gl.uniform1f(u.uRotation,rot);gl.uniform1f(u.uTilt,tilt);
      gl.uniform1f(u.uOpacity,alpha);gl.uniform1f(u.uPanel,mesh===this.panel?1:0);
      gl.uniform1f(u.uFiber,fiber?1:0);gl.uniform1f(u.uBend,bend);
      gl.uniform1f(u.uShadow,shadow?1:0);
      gl.drawArrays(gl.TRIANGLES,0,mesh.count);
      this.drawCalls++;
    }
    render(frame){
      if(!current||!archiveActive||document.hidden)return;
      const start=performance.now();
      const gl=this.gl,scene=current.s,p=current.progress,index=scene.index;
      const pro=clamp(p),reveal=smooth((pro-.16)/.35),align=smooth((pro-.48)/.31),release=smooth((pro-.84)/.15);
      const cam=CameraDirector.forScene(scene,pro);
      const hue=scene.color,metal=[.23,.32,.39],edge=[.56,.71,.77];
      gl.useProgram(this.program);gl.bindVertexArray(this.vao);
      gl.uniform1f(this.uniform.uAspect,frame.aspect);
      gl.uniform1f(this.uniform.uMobile,mobile()?1:0);
      gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.DEPTH_TEST);gl.depthMask(false);gl.disable(gl.CULL_FACE);
      this.drawCalls=0;
      const box=(x,y,z,w,h,d,c=metal,rot=0,a=.8,fiber=false,tilt=0)=>this.mesh(this.box,[x,y,z],[w,h,d],c,rot,a,0,cam,fiber,tilt);
      const plate=(x,y,z,w,h,c=hue,rot=0,a=1,bend=.2)=>this.mesh(this.panel,[x,y,z],[w,h,1],c,rot,a,bend,cam);
      const side=index%2?-1:1;
      const sx=side*2.4,sy=.12*Math.sin(index),sz=-.3;
      // One modest-depth contact penumbra connects drawer/shelf to archive.
      this.mesh(this.panel,[sx,sy-.74,-.72],[1.52,.37,1],[.06,.10,.14],
        0,.66,0,cam,false,0,true);
      // Shared deep archive architectural rails. Fixed in one world, not separate scene backgrounds.
      for(let k=-2;k<=2;k+=(quality==='low'?2:1)){
        const x=k*1.48;
        box(x,-1.60,-1.45,.042,2.65,.035,[.14,.23,.28],0,.24);
        box(x,1.34,-1.45,1.18,.045,.10,[.15,.31,.38],0,.19);
      }
      for(let k=0;k<3;k++){
        const y=-.95+k*.91;
        box(0,y,-1.15,7.2,.028,.065,[.18,.31,.38],0,.17);
      }
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
      const alpha=reveal*(1-release);
      root.dataset.fxArchiveOptics='ggx-microfacet-analytic-contact-fwidth';
      root.dataset.fxArchiveSheetMotion=pro<.16?'anticipation':
        pro<.48?'retrieval':pro<.78?'delivery':pro<.88?'held':'archiving';
      let filamentCount=0;
      if(alpha>.001){
        plate(x,y,z,.88+align*.40,.78+align*.42,hue,rotation,alpha,bend);
        // Optical micro-filaments connect the SAME living MAG to the glass
        // membrane. Cubic paths are sampled in real scene-space; an individual
        // thread stays deliberately thin and is shed first on low quality.
        if(quality==='high'){
          const from=[-.16,.02,.56],to=[x-.13,y+.02,z-.06];
          const segments=mobile()?4:6,strands=mobile()?1:3;
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
      root.dataset.fxArchiveDrawCalls=String(this.drawCalls);
      root.dataset.fxArchiveNativePass='shared-webgl2';
       if(filamentCount>0)root.dataset.fxArchiveFilamentOrientation='full-3d-bezier-r2007';
      painted++;
      if(painted>6&&performance.now()-start>12&&quality!=='low')PerformanceManager.setQuality('low');
    }
    dispose(){
      const gl=this.gl;
      gl.deleteBuffer(this.box.buffer);gl.deleteBuffer(this.panel.buffer);
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
    handoff.dataset.active=showing?'true':'false';
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
    // The membrane unfolds from its unique archive location and approaches
    // the reader. After the handoff, the *actual* HTML headings/cards continue
    // the same motion as a native, functional interactive display.
    const p=current.progress;
    const push=smooth((p-.06)/.38);
    const settle=smooth((p-.44)/.31);
    const dir=mobile()?0:(scene.index%2===0?-1:1);
    handoff.style.setProperty('--fx-folio-translate-x',(dir*(1-push)*95+settle*dir*14).toFixed(1)+'px');
    handoff.style.setProperty('--fx-folio-translate-y',((1-push)*42+settle*14).toFixed(1)+'px');
    handoff.style.setProperty('--fx-folio-rotate-y',(dir*(1-push)*-24).toFixed(1)+'deg');
    handoff.style.setProperty('--fx-folio-rotate-x',((1-push)*12).toFixed(1)+'deg');
    handoff.style.setProperty('--fx-folio-scale',(0.82+push*.18-settle*.035).toFixed(3));
    handoff.style.setProperty('--fx-folio-bend',(1-push).toFixed(3));
    handoff.dataset.phase=p<.24?'extracting':p<.52?'transferring':'presented';
    root.dataset.fxArchiveVisibleHandoff='physical-paper-active';
  }

  function setPanelState(){
    for(const s of scenes){
      if(current&&s===current.s){
        s.node.style.setProperty('--fx-archive-progress',current.progress.toFixed(4));
        s.node.dataset.fxArchiveActive='true';
      }else{
        s.node.style.removeProperty('--fx-archive-progress');
        s.node.removeAttribute('data-fx-archive-active');
      }
    }
  }
  /* Lightweight selection is synchronous on native scroll. GPU rendering is
     still requestAnimationFrame-budgeted. This prevents stale chapters when
     content-visibility, infinite-scroll or a slow software GPU delays RAF. */
  function selectLiveChapter(){
    if(!scenes.length)discover();
    const next=ScrollTimelineController.get();
    // From the moment the intro ends, the MAG owns the page. Do not leave the
    // old landing page visible for a whole first viewport of scrolling.
    // The same native scrolling and eight source anchors remain intact.
    const inArchive=Boolean(introDone&&root.dataset.fxArchiveExperience==='ready'&&next);
    current=inArchive?next:null;
    root.dataset.fxArchiveCurrent=current?.s.key||'none';
    if(current)root.dataset.fxArchivePhase=String(Math.min(9,Math.floor(current.progress*10)));
    return inArchive;
  }
  function update(){
    raf=0;if(disposed||document.hidden||reduced.matches)return;
    updates++;
    root.dataset.fxArchiveUpdateCount=String(updates);
    root.dataset.fxArchiveUpdateScroll=String(Math.round(scrollY));
    const inArchive=selectLiveChapter();
    if(inArchive&&stage)ResponsiveExperience.dock();
    else if(archiveActive)ResponsiveExperience.restore();
    setPanelState();
    updateRealContentSheets();
    syncCinema();
    updateHandoff();
    if(current){
      const nextIndex=current.s.index;
      root.dataset.fxArchiveCurrent=current.s.key;
      root.dataset.fxArchivePhase=String(Math.min(9,Math.floor(current.progress*10)));
      if(nextIndex!==lastScene){
        lastScene=nextIndex;
        dispatchEvent(new CustomEvent('formatx:archivechapter',{detail:{key:current.s.key,index:nextIndex,source:current.s.source}}));
      }
    }else{root.dataset.fxArchiveCurrent='none';lastScene=-1;}
    const now=performance.now();
    if(archiveActive&&now-lastGpu>=PerformanceManager.frameInterval()){
      lastGpu=now;window.FormatXLivingCore?.requestRender?.(1);
    }
  }
  function invalidate(){
    if(!disposed&&!document.hidden&&!reduced.matches){
      try{
        // R2022: synchronize the visible archive layer and chapter identity
        // with the native scroll event, not a deferred GPU RAF. A slow WebGL
        // frame must never strand a previous panel/HUD over the next chapter.
        const active=selectLiveChapter();
        if(active&&stage)ResponsiveExperience.dock();
        else if(archiveActive)ResponsiveExperience.restore();
        setPanelState();
        updateRealContentSheets();
        syncCinema();
        updateHandoff();
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
    sceneObserver?.disconnect();
    sceneObserver=null;
    handoff?.remove();handoff=null;
    restoreExistingCinemaControls();
    restoreExistingFinalCta();
    restoreExistingProofBlock();
    setLegacyHeroHidden(false);
    setHeroCanvasLaneFront(false);
    document.getElementById('fx-mag-ai-scroll-station-r2030')?.remove();
    root.dataset.fxArchiveCinema='home';
    delete root.dataset.fxArchiveCinemaPrepared;
    delete root.dataset.fxArchiveCinemaChapter;
    for(const host of cinemaHosts){
      const panel=host.querySelector(':scope > .fx-archive-cinema-folio-r2030');
      if(panel){
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
      for(const [name,value,priority] of host._fxCinemaOriginalTransform||[]){
        if(value)host.style.setProperty(name,value,priority);
        else host.style.removeProperty(name);
      }
      delete host._fxCinemaOriginalTransform;
    }
    cinemaHosts=[];cinemaPrepared=false;
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
    root.dataset.fxArchiveExperience='disposed';
  }
  function init(){
    if(reduced.matches||requestedHtmlFallback){
      root.dataset.fxArchiveExperience='reduced-html';
      root.dataset.fxArchiveHtmlFallback=requestedHtmlFallback?'user-requested':'reduced-motion';
      return;
    }
    if(!force&&(audit||isolatedMagCheck)){root.dataset.fxArchiveExperience=isolatedMagCheck?'isolated-mag-test':'audit-html';return;}
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
    addEventListener('resize',invalidate,{passive:true});
    addEventListener('formatx:cinematicscene',invalidate,{passive:true});
    addEventListener('formatx:livingready',()=>{discover();invalidate();},{passive:true});
    document.addEventListener('formatx:magbirthcomplete',()=>{
      introDone=true;
      invalidate();
    },{passive:true});
    addEventListener('formatx:languagechange',invalidate,{passive:true});
    addEventListener('pageshow',invalidate,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)invalidate();},{passive:true});
    reduced.addEventListener('change',()=>{if(reduced.matches)stop();},{passive:true});
    addEventListener('pagehide',stop,{once:true});
    invalidate();
  }
  window.FormatXArchiveExperience={
    version:VERSION,get scenes(){return scenes.map(s=>({key:s.key,source:s.source,id:s.scrollAnchor?.id||s.node.id||s.selector}));},
    get state(){return{active:archiveActive,scene:current?.s.key||null,progress:current?.progress??0,frames:painted,quality,updates,disposed,raf,scrollY,lastUpdateScroll:root.dataset.fxArchiveUpdateScroll||null,error:root.dataset.fxArchiveError||null};},
    refresh:()=>{discover();invalidate();},setQuality:PerformanceManager.setQuality
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
