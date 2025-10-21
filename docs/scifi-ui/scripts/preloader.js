(function(){
  const pre=document.getElementById('preloader'); if(!pre) return;
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const assets=['styles/base.css','styles/themes.css','styles/lcars.css','styles/starwars.css','styles/cyberpunk.css','assets/svgs/hud-grid.svg'];
  let done=0; function tick(){done++; const now=Math.min(100,Math.round(done/assets.length*100)); pre.setAttribute('aria-valuenow',String(now));}
  Promise.all(assets.map(u=>fetch(u,{cache:'force-cache'}).then(r=>{tick();return r.ok;}).catch(()=>{tick();}))).then(()=>new Promise(res=>setTimeout(res,prefersReduced?100:600))).finally(()=>{pre.hidden=true; document.dispatchEvent(new CustomEvent('preloader:done'));});
})();
