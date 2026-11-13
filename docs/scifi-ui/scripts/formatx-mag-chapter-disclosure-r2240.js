/* FormatX R2240 — title-only chapters, physically opened by the ONE MAG.
   Progressive enhancement: keep all original DOM, IDs and functional controls.
   No second renderer, clones, synthetic scrolling or initial layout work. */
(() => {
  'use strict';
  if(window.__FORMATX_MAG_DISCLOSURE_R2240__)return;
  window.__FORMATX_MAG_DISCLOSURE_R2240__=true;
  const root=document.documentElement;
  const main=document.getElementById('main-content');
  if(!main)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  // R2242: the canonical organism fallback may own the startup lifecycle
  // before R1987 publishes its final runtime state. archive=off is definitive.
  const forcedHtmlFallback=new URLSearchParams(location.search).get('archive')==='off';
  const style=document.querySelector('link[data-fx-mag-disclosure-r2240]');
  const styleReady=()=>Boolean(style&&style.media!=='print'&&style.sheet);
  const labels={
    experience:['IDEGRENDSZER','NERVOUS SYSTEM','02'],
    capabilities:['KÉPESSÉGEK','CAPABILITIES','03'],
    pricing:['KERESKEDELMI MAG','COMMERCE CORE','04'],
    system:['RENDSZER','SYSTEM','05'],
    network:['HÁLÓZAT','NETWORK','06'],
    resources:['JELADÓ','RELEASE BEACON','07'],
    'live-os-overview':['LIVE OS / RENDSZERKATEGÓRIÁK','LIVE OS / SYSTEM CATEGORIES','01'],
    'fx-mag-ai-scroll-station-r2030':['AI SEGÍTSÉG','AI GUIDANCE','07']
  };
  const archiveLabels={
    systems:['LIVE OS / RENDSZERKATEGÓRIÁK','LIVE OS / SYSTEM CATEGORIES','01'],
    ecosystem:['IDEGRENDSZER','NERVOUS SYSTEM','02'],
    diagnostics:['KÉPESSÉGEK','CAPABILITIES','03'],
    licensing:['KERESKEDELMI MAG','COMMERCE CORE','04'],
    security:['RENDSZER','SYSTEM','05'],
    network:['HÁLÓZAT','NETWORK','06'],
    intelligence:['AI SEGÍTSÉG','AI GUIDANCE','07'],
    final:['JELADÓ','RELEASE BEACON','08']
  };
  const entries=new Map();
  const originalInert=new WeakMap();
  const originalDisplay=new WeakMap();
  const english=()=>root.lang.toLowerCase().startsWith('en');
  let lastCinemaChapter='';
  let ready=false;
  // R2243: legacy organism-interface moves original section nodes into its
  // canonical console at DOMContentLoaded. Never insert a MAG trigger before
  // that move, or the console would carry away our title button too.
  let domReady=document.readyState==='complete';
  function childrenOf(panel){
    return Array.from(panel.children).filter(node=>
      !node.classList.contains('fx-mag-disclosure-heading')
      && !node.classList.contains('fx-mag-folio-origin-r2041'));
  }
  function setOpen(entry,open,{motion=true}={}){
    if(entry.open===open)return;
    entry.open=open;
    entry.panel.dataset.fxMagOpen=open?'true':'false';
    entry.button.setAttribute('aria-expanded',String(open));
    entry.button.setAttribute('aria-label',String(
      (english()?entry.names[1]:entry.names[0])+' — '+
      (open?(english()?'close chapter':'fejezet bezárása'):(english()?'open chapter':'fejezet megnyitása'))));
    for(const node of childrenOf(entry.panel)){
      if(!originalInert.has(node))originalInert.set(node,node.inert);
      if(!originalDisplay.has(node))originalDisplay.set(node,{
        value:node.style.getPropertyValue('display'),
        priority:node.style.getPropertyPriority('display')
      });
      node.inert=open?originalInert.get(node):true;
      if(open){
        const initial=originalDisplay.get(node);
        if(initial.value)node.style.setProperty('display',initial.value,initial.priority);
        else node.style.removeProperty('display');
      }else{
        // R2244: source modules contain legacy stylesheet !important rules.
        // Inline !important beats those rules without changing any source node,
        // while open restores the exact original inline declaration/priority.
        node.style.setProperty('display','none','important');
      }
    }
    if(open&&motion&&!reduced.matches){
      // The canonical R326 GPU body opens the physical paper; never create
      // another scene, canvas or continuous render loop.
      const core=window.FormatXLivingCore||window.FormatXCoreMobileV69;
      if(typeof core?.rotateBy==='function'){
        core.rotateBy(-.11,.27,'mag-chapter-open-r2240');
        root.dataset.fxMagDisclosureCoreAction='native-r326-rotateby';
        root.dataset.fxMagDisclosureCoreOpened=entry.id;
      }
      core?.requestRender?.();
      entry.panel.classList.remove('fx-mag-disclosure-unsealing');
      void entry.button.offsetWidth; // one deliberate click-time animation restart
      entry.panel.classList.add('fx-mag-disclosure-unsealing');
    }else if(!open){
      entry.panel.classList.remove('fx-mag-disclosure-unsealing');
    }
  }
  function closeOtherEntries(except){
    for(const entry of entries.values())if(entry!==except&&entry.open)setOpen(entry,false,{motion:false});
  }
  function ensure(panel,names,id){
    if(!(panel instanceof HTMLElement)||entries.has(panel))return;
    if(panel.querySelector(':scope > .fx-mag-disclosure-heading'))return;
    const heading=document.createElement('h2');
    heading.className='fx-mag-disclosure-heading';
    const button=document.createElement('button');
    button.type='button';
    button.className='fx-mag-disclosure-trigger';
    button.dataset.fxMagDisclosureTrigger=id;
    button.setAttribute('aria-expanded','false');
    button.innerHTML='<span class="fx-mag-disclosure-index" aria-hidden="true"></span>'+
      '<strong class="fx-mag-disclosure-word"></strong>'+
      '<span class="fx-mag-disclosure-mechanism" aria-hidden="true"></span>';
    button.querySelector('.fx-mag-disclosure-index').textContent=names[2];
    heading.appendChild(button);
    panel.prepend(heading);
    panel.classList.add('fx-mag-disclosure-panel');
    const entry={panel,button,names,id,open:true};
    entries.set(panel,entry);
    setOpen(entry,false,{motion:false});
    button.addEventListener('click',()=>{
      const open=!entry.open;
      if(open)closeOtherEntries(entry);
      setOpen(entry,open);
    });
    panel.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&entry.open&&!event.defaultPrevented){
        setOpen(entry,false,{motion:false});
        entry.button.focus({preventScroll:true});
        event.stopPropagation();
      }
    });
    updateLabel(entry);
  }
  function updateLabel(entry){
    const name=english()?entry.names[1]:entry.names[0];
    const text=entry.button.querySelector('.fx-mag-disclosure-word');
    if(text.textContent!==name)text.textContent=name;
    entry.button.setAttribute('aria-label',name+' — '+(entry.open
      ?(english()?'close chapter':'fejezet bezárása')
      :(english()?'open chapter':'fejezet megnyitása')));
  }
  function archiveReady(){
    return root.dataset.fxArchiveExperience==='ready'
      && Boolean(root.dataset.fxArchiveCinemaPrepared);
  }
  function buildArchive(){
    const scenes=window.FormatXArchiveExperience?.scenes||[];
    for(const scene of scenes){
      const node=document.querySelector('[data-fx-archive-scene="'+scene.key+'"]');
      const host=node?.closest('main#main-content > section.scene, main#main-content > section.fx-category-deck--standalone');
      const panel=host?.querySelector(':scope > .fx-archive-cinema-folio-r2030');
      if(panel)ensure(panel,archiveLabels[scene.key]||labels[host.id]||[scene.key.toUpperCase(),scene.key.toUpperCase(),'00'],scene.key);
    }
  }
  function buildNative(){
    for(const [id,names] of Object.entries(labels)){
      if(id==='fx-mag-ai-scroll-station-r2030')continue;
      const panel=document.getElementById(id);
      if(panel&&panel.matches('main#main-content > section.scene,main#main-content > section.fx-category-deck--standalone'))
        ensure(panel,names,id);
    }
    // The generated LIVE OS catalogue is a real standalone semantic section.
    // In fallback mode it must be a title-only chapter as well, not a
    // full product grid unexpectedly exposed between the MAG and section 02.
    const catalogue=main.querySelector(':scope > section.fx-category-deck--standalone');
    if(catalogue)ensure(catalogue,labels['live-os-overview'],'live-os-overview');
  }
  function refresh(){
    if(!domReady)return;
    if(archiveReady())buildArchive();
    else if(forcedHtmlFallback||
      ['reduced-html','audit-html','isolated-mag-test','no-scenes'].includes(root.dataset.fxArchiveExperience))
      buildNative();
    if(entries.size&&styleReady()&&!ready){
      root.dataset.fxMagDisclosure='ready';
      ready=true;
    }
    for(const entry of entries.values())updateLabel(entry);
    const scene=root.dataset.fxArchiveCinemaChapter||'';
    if(archiveReady()&&scene!==lastCinemaChapter){
      lastCinemaChapter=scene;
      closeOtherEntries(null);
    }
  }
  const obs=new MutationObserver(refresh);
  obs.observe(root,{attributes:true,attributeFilter:[
    'lang','data-fx-archive-experience','data-fx-archive-cinema-prepared',
    'data-fx-archive-cinema-chapter'
  ]});
  addEventListener('formatx:deferredcssready',refresh,{passive:true});
  addEventListener('formatx:real3dready',refresh,{passive:true});
  addEventListener('formatx:livingready',refresh,{passive:true});
  style?.addEventListener('load',refresh,{passive:true});
  if(!domReady)document.addEventListener('DOMContentLoaded',()=>{
    domReady=true;
    refresh();
  },{once:true});
  refresh();
  window.__FORMATX_MAG_DISCLOSURE_STATUS__=()=>({
    version:'r2240',ready,panels:entries.size,
    opened:[...entries.values()].filter(x=>x.open).map(x=>x.id),
    archive:archiveReady(),singleCanvas:document.querySelectorAll('#hero canvas.fx-crystal-organism-r326-canvas').length
  });
})();
