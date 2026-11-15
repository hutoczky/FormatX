/* FormatX MAG chapter aperture — r2209 intent-activated cinematic disclosure.
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
  if(!main || root.dataset.fxMagChapters==='r2209' || new URLSearchParams(location.search).get('magchapters')==='off')return;
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
  function finishClose(entry,reason='close'){
    const {section,button,subtitle}=entry;
    clearTimeout(entry.timer);
    entry.timer=0;
    if(section.dataset.fxExpanded==='false')return;
    if(section.contains(document.activeElement) && document.activeElement!==button){
      button.focus({preventScroll:true});
    }
    section.dataset.fxExpanded='false';
    section.dataset.fxMagPhase='closed';
    button.setAttribute('aria-expanded','false');
    if(subtitle)subtitle.hidden=true;
    notify(section,false,reason);
  }
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
      // Keep the tapped heading stationary when a taller earlier chapter
      // closes. A synchronous collapse prevents 340ms of delayed scroll jump.
      const before=button.getBoundingClientRect().top;
      let closedEarlier=false;
      for(const other of registry.values()){
        if(other!==entry&&other.section.dataset.fxExpanded==='true'){
          if(other.section.compareDocumentPosition(section)&Node.DOCUMENT_POSITION_FOLLOWING){
            closedEarlier=true;
          }
          finishClose(other,'another-chapter');
        }
      }
      if(closedEarlier&&!root.classList.contains('fx-seamless-loop-transfer')){
        const delta=button.getBoundingClientRect().top-before;
        if(Number.isFinite(delta)&&Math.abs(delta)>1){
          window.scrollBy({top:delta,left:0,behavior:'instant'});
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
        entry.timer=window.setTimeout(()=>finishClose(entry,origin),340);
      }else{
        // Explicit, reduced-motion and interrupted closes complete at once.
        // finishClose is idempotent when another chapter already closed it.
        if(previous)finishClose(entry,origin);
        else{
          section.dataset.fxExpanded='false';
          section.dataset.fxMagPhase='closed';
          if(subtitle)subtitle.hidden=true;
        }
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
    // Render just the ONE emphatic keyword. Preserve the original editorial
    // heading separately, revealed only when the MAG aperture is open.
    const COPY={
      'live-os-overview':['ÉLŐ RENDSZER','LIVE OS'],
      'experience':['MAG','MAG'],
      'capabilities':['KÉPESSÉGEK','CAPABILITIES'],
      'product-showcase':['BEMUTATÓ','SHOWCASE'],
      'pricing':['CSOMAGOK','PLANS'],
      'system':['ARCHITEKTÚRA','ARCHITECTURE'],
      'network':['HÁLÓZAT','NETWORK'],
      'user-feedback':['VÉLEMÉNYEK','REVIEWS'],
      'resources':['LETÖLTÉSEK','DOWNLOADS']
    };
    const slug=section.id||(section.classList.contains('fx-award-proof')?'fx-award-proof':
      section.classList.contains('fx-category-deck')?'fx-category-deck':'');
    const words=COPY[slug]||(
      slug==='fx-award-proof'?['BIZONYÍTÉKOK','EVIDENCE']:
      slug==='fx-category-deck'?['MEGOLDÁSOK','SOLUTIONS']:
      null
    );
    const originalText=(heading.textContent||'').trim();
    const fallback=(originalText.split(/\s+/).filter(Boolean).slice(0,3).join(' ')||'FORMATX');
    const label=document.createElement('strong');
    label.className='fx-mag-title-copy';
    label.dataset.hu=words?.[0]||fallback;
    label.dataset.en=words?.[1]||fallback;
    label.textContent=root.lang==='en'?label.dataset.en:label.dataset.hu;
    const subtitle=document.createElement('span');
    subtitle.className='fx-mag-editorial-heading';
    subtitle.setAttribute('data-fx-mag-subtitle','');
    subtitle.id='fx-mag-editorial-'+(slug.replace(/[^a-zA-Z0-9_-]/g,'')||String(registry.size));
    subtitle.hidden=true;
    // Language and dynamically-rendered titles retain their original owner.
    // A source runtime can still update [data-fx-category-title] or
    // [data-showcase-title] without destroying the button or iris.
    for(const attr of ['data-hu','data-en','data-fx-category-title','data-showcase-title']){
      if(heading.hasAttribute(attr)){
        subtitle.setAttribute(attr,heading.getAttribute(attr));
        heading.removeAttribute(attr);
      }
    }
    while(heading.firstChild)subtitle.appendChild(heading.firstChild);
    const iris=document.createElement('span');
    iris.className='fx-mag-iris';
    iris.setAttribute('aria-hidden','true');
    for(let i=0;i<4;i++)iris.appendChild(document.createElement('i'));
    button.append(label,iris);
    button.setAttribute('aria-describedby',subtitle.id);
    heading.append(button,subtitle);
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
    // aria-controls accepts a whitespace-separated list of IDs. Associate
    // each native content subtree without moving or wrapping it.
    const content=Array.from(section.querySelectorAll('[data-fx-mag-route]:not(h2) > :not([data-fx-mag-route])'))
      .filter(node=>node instanceof HTMLElement && !['META','SCRIPT','TEMPLATE'].includes(node.tagName));
    const base=section.id||('chapter-'+registry.size);
    content.forEach((node,index)=>{
      if(!node.id)node.id='fx-mag-body-'+base+'-'+index;
    });
    const ids=content.map(node=>node.id);
    if(ids.length)button.setAttribute('aria-controls',ids.join(' '));
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
      root.dataset.fxMagChapters='r2209';
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
    version:'r2209',
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