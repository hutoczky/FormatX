(function(){
  const layersHost=document.getElementById('theme-layers'); if(!layersHost) return;
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clearLayers(){layersHost.innerHTML='';}
  function elFrom(html){const c=document.createElement('div'); c.innerHTML=html.trim(); return c.firstElementChild;}
  const SVGS={
    starwars:`<svg class="fx holo-grid" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g id="grid">${Array.from({length:11},(_,i)=>`<line class='hud-line' x1='0' y1='${i*10}' x2='100' y2='${i*10}'/>`).join('')}${Array.from({length:11},(_,i)=>`<line class='hud-line' y1='0' x1='${i*10}' y2='100' x2='${i*10}'/>`).join('')}</g></svg>`,
    cyberpunk:`<svg class="fx glitch-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" stitchTiles="stitch"/></filter></defs><rect width="100%" height="100%" filter="url(#noise)" fill="#FF2EC0" opacity=".06"/></svg>`,
    lcars:''
  };
  function activate(theme){clearLayers(); if(SVGS[theme]) layersHost.appendChild(elFrom(SVGS[theme]));}
  activate(document.documentElement.getAttribute('data-theme')||'lcars');
  document.addEventListener('theme:changed',e=>{activate(e.detail.theme)});
  document.addEventListener('preloader:done',()=>{ if(prefersReduced) return; let raf=0; const onMove=(ev)=>{cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{const x=(ev.clientX/innerWidth-.5)*4; const y=(ev.clientY/innerHeight-.5)*4; layersHost.style.transform=`translate(${x}px, ${y}px)`;});}; window.addEventListener('pointermove',onMove,{passive:true});});
})();
