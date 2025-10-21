(function(){
  const pre=document.getElementById('preloader'); if(!pre) return;
  pre.setAttribute('role','status');
  pre.setAttribute('aria-live','polite');
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const assets=['styles/base.css','styles/themes.css','styles/lcars.css','styles/starwars.css','styles/cyberpunk.css','assets/svgs/hud-grid.svg'];
  let progress=0;
  function setProgress(val){progress=val; pre.setAttribute('aria-valuenow',String(Math.min(100,val)));}
  function tick(n){setProgress(progress+n);}
  if(prefersReduced){
    setProgress(100);
    setTimeout(()=>{pre.style.display='none';pre.setAttribute('aria-hidden','true');document.dispatchEvent(new CustomEvent('preloader:done'));},100);
  }else{
    Promise.all(assets.map(u=>fetch(u,{cache:'force-cache'}).then(r=>r.ok).catch(()=>false))).then(()=>{
      const theme=document.documentElement.getAttribute('data-theme')||'lcars';
      const jitter=()=>60+Math.random()*30;
      const step=()=>{
        if(progress>=100){
          setTimeout(()=>{pre.style.display='none';pre.setAttribute('aria-hidden','true');document.dispatchEvent(new CustomEvent('preloader:done'));},200);
        }else{
          tick(theme==='lcars'?6:theme==='starwars'?5:8);
          setTimeout(step,jitter());
        }
      };
      step();
    });
  }
})();
