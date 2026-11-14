/* FormatX MAG chapter aperture — r2206 intent-activated cinematic disclosure.
   The live Cloudflare worker injects additional sections. Never move original
   module nodes: hiding them at the CSS route keeps module owners and selectors intact. */
(()=>{'use strict';
  const style=document.querySelector('link[data-fx-mag-chapters-style]');
  let initialised=false;
  function initialize(){
    if(initialised)return;
    initialised=true;
    const root=document.documentElement;
  const main=document.getElementById('main-content');
  if(!main || root.dataset.fxMagChapters==='r2206' || new URLSearchParams(location.search).get('magchapters')==='off')return;
  const registry=new Map();
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sectionsSelector=':scope > section:not(#hero):not(.fx-noscript-proof)';
  let pending=0;
  const findHeading=(section)=>{
    const id=section.getAttribute('aria-labelledby');
    let h=id?document.getElementById(id):null;
    if(!h||h.tagName!=='H2'||!section.contains(h)){
      h=Array.from(section.querySelectorAll('h2')).find(x=>x.closest('section')===section)||null;
    }
    return h;
  };
  const notify=(section,open,origin)=>{
    section.dispatchEvent(new CustomEvent('formatx:mag-chapter-toggle',{
      bubbles:true,detail:{chapter:section.id||'',open,origin}
    }));
    window.dispatchEvent(new CustomEvent('formatx:loopgeometryrefresh',{
      detail:{source:'mag-chapter-aperture-r2201'}
    }));
  };
  function toggle(entry,expand,origin='button'){
    const {section,button,subtitle}=entry;
    clearTimeout(entry.timer);
    entry.timer=0;
    const previous=section.dataset.fxExpanded==='true';
    if(expand){
      // Synchronise with the existing native 3D MAG when its renderer is active.
      // The section iris remains usable when WebGL is unavailable or offscreen.
      if(origin==='button'){
        const core=window.FormatXLivingCore||window.FormatXCoreMobileV69;
        try{
          core?.surfacePulse?.('mag-chapter-'+(section.id||'disclosure'));
          core?.rotateBy?.(.032,.014,'mag-chapter-aperture');
          core?.requestRender?.(3);
        }catch(_){ /* Runtime-independent disclosure. */ }
      }
      // The MAG reveals one chapter at a time; other headings remain available.
      for(const other of registry.values()){
        if(other!==entry&&other.section.dataset.fxExpanded==='true'){
          toggle(other,false,'another-chapter');
        }
      }
      section.dataset.fxMagPhase='opening';
      section.dataset.fxExpanded='true';
      button.setAttribute('aria-expanded','true');
      if(subtitle)subtitle.hidden=false;
      requestAnimationFrame(()=>{if(section.isConnected&&section.dataset.fxMagPhase==='opening')section.dataset.fxMagPhase='open';});
      notify(section,true,origin);
    }else{
      button.setAttribute('aria-expanded','false');
      if(previous&&!reduced){
        section.dataset.fxMagPhase='closing';
        entry.timer=window.setTimeout(()=>{
          entry.timer=0;
          section.dataset.fxExpanded='false';
          section.dataset.fxMagPhase='closed';
          if(subtitle)subtitle.hidden=true;
          notify(section,false,origin);
        },340);
      }else{
        section.dataset.fxExpanded='false';
        section.dataset.fxMagPhase='closed';
        if(subtitle)subtitle.hidden=true;
        notify(section,false,origin);
      }
    }
  }
  function mount(section){
    if(registry.has(section)||!section.isConnected)return;
    const heading=findHeading(section);
    if(!heading)return;
    // Preserve the original heading for SEO and existing section navigation.
    const button=document.createElement('button');
    button.type='button';
    button.className='fx-mag-chapter-title';
    button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-label','Részletek megnyitása');
    const label=document.createElement('span');
    label.className='fx-mag-title-copy';
    // The bilingual and category runtimes write textContent to these attributes.
    // Move them to the leaf span, never let a translation overwrite the button.
    for(const attr of ['data-hu','data-en','data-fx-category-title']){
      if(heading.hasAttribute(attr)){
        label.setAttribute(attr,heading.getAttribute(attr));
        heading.removeAttribute(attr);
      }
    }
    let subtitle=null;
    while(heading.firstChild){
      const node=heading.firstChild;
      if(node.nodeType===1&&node.tagName==='EM'&&!subtitle){
        subtitle=node;
        subtitle.setAttribute('data-fx-mag-subtitle','');
        subtitle.hidden=true;
      }else label.appendChild(node);
    }
    if(!label.textContent.trim()&&!label.hasAttribute('data-fx-category-title')){
      label.textContent='FORMATX';
    }
    const iris=document.createElement('span');
    iris.className='fx-mag-iris';
    iris.setAttribute('aria-hidden','true');
    for(let i=0;i<4;i++)iris.appendChild(document.createElement('i'));
    button.append(label,iris);
    if(subtitle)button.appendChild(subtitle);
    heading.appendChild(button);
    // Mark the unique route from the section to its heading. CSS hides all
    // siblings, including components injected *after* this script runs.
    let node=heading;
    while(node&&node!==main){
      node.setAttribute('data-fx-mag-route','');
      if(node===section)break;
      node=node.parentElement;
    }
    section.classList.add('fx-mag-chapter');
    section.dataset.fxExpanded='false';
    section.dataset.fxMagPhase='closed';
    button.removeAttribute('aria-label');
    const entry={section,button,subtitle,timer:0};
    registry.set(section,entry);
    button.addEventListener('click',()=>{
      const expanding=section.dataset.fxExpanded!=='true'||section.dataset.fxMagPhase==='closing';
      toggle(entry,expanding);
    });
    if('IntersectionObserver' in window&&!reduced){
      reveal.observe(button);
    }else button.dataset.fxMagSeen='true';
  }
  const reveal=typeof IntersectionObserver!=='undefined'
    ?new IntersectionObserver(entries=>{
      for(const item of entries){
        if(item.isIntersecting){
          item.target.dataset.fxMagSeen='true';
          reveal.unobserve(item.target);
        }
      }
    },{threshold:0.12,rootMargin:'0px 0px 80px 0px'}):null;
  function reconcile(){
    pending=0;
    for(const section of main.querySelectorAll(sectionsSelector)){
      if(section instanceof HTMLElement)mount(section);
    }
    for(const [node,entry] of registry){
      if(!node.isConnected){clearTimeout(entry.timer);registry.delete(node);}
    }
    if(registry.size){
      root.classList.add('fx-mag-chapters-ready');
      root.dataset.fxMagChapters='r2206';
      root.dataset.fxMagChapterCount=String(registry.size);
    }
  }
  function schedule(){
    if(!pending)pending=requestAnimationFrame(reconcile);
  }
  function revealAnchor(id){
    if(!id)return;
    const target=document.getElementById(id);
    const section=target?.closest('section.fx-mag-chapter');
    if(section&&registry.has(section))toggle(registry.get(section),true,'anchor');
  }
  reconcile();
  new MutationObserver(schedule).observe(main,{childList:true});
  document.addEventListener('click',event=>{
    const link=event.target instanceof Element?event.target.closest('a[href^="#"]'):null;
    if(!link)return;
    const id=decodeURIComponent(link.getAttribute('href').slice(1));
    revealAnchor(id);
  },true);
  window.addEventListener('hashchange',()=>{
    revealAnchor(decodeURIComponent(location.hash.slice(1)));
  });
  if(location.hash)revealAnchor(decodeURIComponent(location.hash.slice(1)));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  window.FormatXMagChapters=Object.freeze({
    version:'r2206',
    audit:()=>({
      total:registry.size,
      closed:Array.from(registry.values()).filter(x=>x.section.dataset.fxExpanded==='false').length,
      open:Array.from(registry.values()).filter(x=>x.section.dataset.fxExpanded==='true').map(x=>x.section.id||x.section.className),
      missingTriggers:Array.from(registry.values()).filter(x=>!x.button.isConnected).length
    }),
    open:(id)=>revealAnchor(id),
    closeAll:()=>{for(const entry of registry.values())toggle(entry,false,'api');}
  });
  }
  // Do not modify the hero during initial rendering. The visual chapter
  // system activates on the visitor's first real navigation/scroll intent.
  // Print-media prefetch keeps CSS outside the render-blocking critical path.
  if(!style){document.documentElement.dataset.fxMagChapters='style-missing';return;}
  let requested=false;
  let loaded=Boolean(style.sheet);
  const activate=()=>{
    if(!requested || initialised)return;
    if(!loaded && !style.sheet)return;
    style.media='all';
    initialize();
  };
  style.addEventListener('load',()=>{
    loaded=true;
    activate();
  },{once:true});
  style.addEventListener('error',()=>{
    document.documentElement.dataset.fxMagChapters='style-error';
  },{once:true});
  const request=()=>{
    if(requested)return;
    requested=true;
    style.media='all';
    activate();
  };
  window.addEventListener('wheel',request,{passive:true,once:true});
  // A script-triggered scroll (intro/loop geometry) is NOT visitor intent.
  // Mouse scrollbar dragging is supported without reacting to autoplay resets.
  window.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse'&&event.clientX>=document.documentElement.clientWidth-20)request();
  },{passive:true});
  window.addEventListener('touchmove',request,{passive:true,once:true});
  document.addEventListener('keydown',event=>{
    if(['ArrowDown','PageDown','End',' ','Spacebar'].includes(event.key))request();
  },{passive:true});
  document.addEventListener('click',event=>{
    const link=event.target instanceof Element?event.target.closest('a[href^="#"]'):null;
    if(link&&link.getAttribute('href')!=='#top')request();
  },{capture:true,passive:true});
  window.addEventListener('hashchange',()=>{
    if(location.hash&&location.hash!=='#top')request();
  },{passive:true});
  if(location.hash&&location.hash!=='#top')request();
})();