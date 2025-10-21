(function(){
  const pre=document.getElementById('preloader'); if(!pre) return;
  pre.setAttribute('role','status'); pre.setAttribute('aria-live','polite');
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const assets=['styles/base.css','styles/themes.css','styles/lcars.css','styles/starwars.css','styles/cyberpunk.css','assets/svgs/hud-grid.svg','assets/svgs/lcars-panels.svg','assets/svgs/hologram-activation.svg'];
  let progress=0;
  const jitter=()=>Math.random()*8+2;
  function updateProgress(val){
    progress=Math.min(100,val);
    pre.setAttribute('aria-valuenow',String(Math.round(progress)));
  }
  function hidePreloader(delay){
    setTimeout(()=>{
      pre.hidden=true;
      pre.setAttribute('aria-hidden','true');
      document.dispatchEvent(new CustomEvent('preloader:done'));
    }, delay);
  }
  function tickHandler(){
    progress+=jitter();
    if(progress>=100){
      clearInterval(tick);
      updateProgress(100);
      hidePreloader(400);
    } else{
      updateProgress(progress);
    }
  }
  if(prefersReduced){
    updateProgress(100);
    hidePreloader(100);
    return;
  }
  const tick=setInterval(tickHandler,80);
  Promise.all(assets.map(u=>fetch(u,{cache:'force-cache'}).then(r=>r.ok).catch(()=>false)));
})();
