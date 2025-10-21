(function(){
  const pre=document.getElementById('preloader');
  if(!pre) return;
  
  // Add ARIA attributes
  pre.setAttribute('role','status');
  pre.setAttribute('aria-live','polite');
  
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const assets=['styles/base.css','styles/themes.css','styles/lcars.css','styles/starwars.css','styles/cyberpunk.css','assets/svgs/hud-grid.svg'];
  
  let currentProgress = 0;
  
  function setProgress(val){
    currentProgress = Math.min(100, val);
    pre.setAttribute('aria-valuenow', String(currentProgress));
  }
  
  function finishPreloader(){
    setProgress(100);
    setTimeout(()=>{
      pre.style.display = 'none';
      pre.setAttribute('aria-hidden', 'true');
      document.dispatchEvent(new Event('preloader:done'));
    }, prefersReduced ? 100 : 300);
  }
  
  // If reduced motion, finish immediately
  if(prefersReduced){
    setProgress(100);
    finishPreloader();
    return;
  }
  
  // Preload critical resources
  let loaded = 0;
  const jitter = () => 60 + Math.random() * 30; // 60-90ms jitter
  
  Promise.all(assets.map(u=>
    fetch(u,{cache:'force-cache'})
      .then(r=>{
        loaded++;
        const progress = Math.round((loaded / assets.length) * 90); // 0-90%
        setProgress(progress);
        return r.ok;
      })
      .catch(()=>{
        loaded++;
        const progress = Math.round((loaded / assets.length) * 90);
        setProgress(progress);
      })
  )).then(()=>{
    // Final stage: 90->100 with jitter
    const stages = [92, 95, 98, 100];
    let stageIdx = 0;
    function nextStage(){
      if(stageIdx < stages.length){
        setProgress(stages[stageIdx]);
        stageIdx++;
        setTimeout(nextStage, jitter());
      } else {
        finishPreloader();
      }
    }
    setTimeout(nextStage, jitter());
  });
})();
