/* FormatX MAG chapter aperture r2200. No changes to MAG renderer or scroll ownership. */
(()=>{'use strict';
 const root=document.documentElement;
 const main=document.getElementById('main-content');
 if(!main||root.dataset.fxMagChapters==='r2200')return;
 const sections=Array.from(main.querySelectorAll(':scope > section.scene:not(#hero)'));
 let count=0;
 sections.forEach(section=>{
  const headingId=section.getAttribute('aria-labelledby');
  const h2=headingId&&document.getElementById(headingId);
  if(!h2||!section.contains(h2))return;
  const container=h2.parentElement;
  if(!container)return;
  // Title is the only visible chapter entry. All existing nodes remain in the DOM.
  const button=document.createElement('button');
  button.type='button';
  button.className='fx-mag-chapter-title';
  button.setAttribute('aria-expanded','false');
  const contentId='fx-mag-panel-'+section.id;
  button.setAttribute('aria-controls',contentId);
  while(h2.firstChild)button.appendChild(h2.firstChild);
  h2.appendChild(button);
  const panel=document.createElement('div');
  panel.className='fx-mag-chapter-content';
  panel.id=contentId;
  panel.hidden=true;
  // Move only the chapter body nodes, not its heading or its MAG/3D scene.
  if(container===section||container.classList.contains('section-heading')||container.classList.contains('fx-net-head')){
   const siblings=Array.from(section.children).filter(child=>child!==container);
   // Some sections keep metadata in the heading container.
   siblings.forEach(el=>panel.appendChild(el));
   section.appendChild(panel);
   Array.from(container.children).filter(el=>el!==h2).forEach(el=>{if(el.classList.contains('section-index'))el.hidden=true;});
  }else{
   // Resources heading lives inside release-layout. Keep the heading visible;
   // move the remaining release contents into a sibling fold panel.
   const outer=container.parentElement;
   if(!outer)return;
   Array.from(container.children).filter(el=>el!==h2).forEach(el=>panel.appendChild(el));
   Array.from(outer.children).filter(el=>el!==container).forEach(el=>panel.appendChild(el));
   outer.appendChild(panel);
   Array.from(section.children).filter(el=>el!==outer).forEach(el=>panel.appendChild(el));
  }
  section.classList.add('fx-mag-chapter');
  section.dataset.fxExpanded='false';
  button.addEventListener('click',()=>{
   const expand=section.dataset.fxExpanded!=='true';
   // Preserve a stable document scroll flow; no scroll locks or synthetic wheel.
   panel.hidden=!expand;
   button.setAttribute('aria-expanded',String(expand));
   section.dataset.fxExpanded=String(expand);
   section.dispatchEvent(new CustomEvent('formatx:mag-chapter-toggle',{bubbles:true,detail:{chapter:section.id,open:expand}}));
  });
  count++;
 });
 if(count){root.classList.add('fx-mag-chapters-ready');root.dataset.fxMagChapters='r2200';}
})();
