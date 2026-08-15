(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxCoreDetailR122==='ready'||root.dataset.fxCoreDetailR122==='booting')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxCoreDetailR122='audit-skip';return;}
root.dataset.fxCoreDetailR122='booting';
root.dataset.fxCoreReferenceTextureR130='loading';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const PARTS=Array.from({length:6},(_,i)=>`/scifi-ui/assets/reference-r130/part${i}.b64?v=20260815-reference-material-r130`);

async function loadReferenceBitmap(){
  const chunks=await Promise.all(PARTS.map(async url=>{
    const r=await fetch(url,{cache:'force-cache',credentials:'same-origin'});
    if(!r.ok)throw new Error(`reference chunk ${r.status}`);
    return (await r.text()).trim();
  }));
  const bin=atob(chunks.join(''));
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  const blob=new Blob([bytes],{type:'image/webp'});
  return createImageBitmap(blob);
}

function boot(attempt=0){
  const stage=document.querySelector('#hero .fx-core-r112-stage, #hero .fx-core-mobile-v55-stage');
  if(!stage){if(attempt<300)return requestAnimationFrame(()=>boot(attempt+1));root.dataset.fxCoreDetailR122='host-unavailable';root.dataset.fxCoreReferenceTextureR130='failed';return;}
  stage.querySelectorAll('.fx-core-detail-r122').forEach(n=>n.remove());
  const canvas=document.createElement('canvas');canvas.className='fx-core-detail-r122';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);
  const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
  if(!ctx){canvas.remove();root.dataset.fxCoreDetailR122='context-unavailable';root.dataset.fxCoreReferenceTextureR130='failed';return;}

  let cssW=0,cssH=0,dpr=1,raf=0,visible=true,last=performance.now(),phase=0,bitmap=null,failed=false;
  let lastTx=0,lastTy=0,lastEnergy=.30;

  function resize(){
    const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;
    cssW=r.width;cssH=r.height;dpr=Math.min(devicePixelRatio||1,1.35);
    const w=Math.round(cssW*dpr),h=Math.round(cssH*dpr);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;canvas.style.width=cssW+'px';canvas.style.height=cssH+'px';}
  }

  function clearReferenceTitleBand(){
    /* The supplied reference contains the same live section title near the bottom.
       Remove only that baked text band so the real DOM title remains the single copy. */
    ctx.save();ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=1;
    ctx.fillStyle='#000';ctx.fillRect(0,cssH*.888,cssW*.735,cssH*.078);
    ctx.restore();
  }

  function drawReference(tx,ty,energy){
    if(!bitmap)return;
    const moveX=tx*cssW*.13,moveY=-ty*cssH*.11;
    const pulse=reduced.matches?1:1+Math.sin(phase*.62)*.0027+(energy-.30)*.0045;
    const angle=reduced.matches?0:tx*.055;
    ctx.save();
    ctx.translate(cssW*.5+moveX,cssH*.5+moveY);
    ctx.rotate(angle);
    ctx.scale(pulse,pulse*(1+ty*.018));
    ctx.globalAlpha=.985;
    ctx.globalCompositeOperation='source-over';
    ctx.drawImage(bitmap,-cssW*.5,-cssH*.5,cssW,cssH);
    ctx.restore();
    clearReferenceTitleBand();

    /* A very small counter-shifted copy gives pointer-driven glass refraction while
       keeping the idle frame locked to the reference. */
    if(!reduced.matches&&(Math.abs(tx)+Math.abs(ty)>.006||energy>.42)){
      ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=clamp(.025+(energy-.30)*.035,.025,.075);
      ctx.translate(-tx*cssW*.018,ty*cssH*.014);
      ctx.drawImage(bitmap,0,0,cssW,cssH);
      ctx.restore();
      clearReferenceTitleBand();
    }
  }

  function drawLiveOptics(tx,ty,energy){
    if(!bitmap)return;
    const cx=cssW*(.5+tx*.12),cy=cssH*(.5-ty*.10),base=Math.min(cssW,cssH);
    ctx.save();ctx.globalCompositeOperation='screen';
    const pulse=reduced.matches?0:Math.sin(phase*1.08)*.5+.5;
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,base*(.053+.006*pulse));
    g.addColorStop(0,'rgba(255,255,255,.34)');g.addColorStop(.18,'rgba(205,255,255,.21)');g.addColorStop(.44,'rgba(68,239,255,.10)');g.addColorStop(.72,'rgba(185,74,255,.045)');g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.globalAlpha=clamp(.56+(energy-.30)*.20,.56,.76);ctx.beginPath();ctx.arc(cx,cy,base*.061,0,Math.PI*2);ctx.fill();

    for(let i=0;i<4;i++){
      const r=base*(.082+i*.034),start=-2.25+i*1.19+(reduced.matches?0:phase*(i%2?.032:-.026));
      ctx.beginPath();ctx.arc(cx,cy,r,start,start+.30+i*.025);
      ctx.strokeStyle=i%2?'rgba(203,81,255,.45)':'rgba(108,242,255,.48)';ctx.lineWidth=.55+i*.08;ctx.globalAlpha=.10+(energy-.30)*.06;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=5;ctx.stroke();ctx.shadowBlur=0;
    }
    ctx.restore();
  }

  function render(now){
    raf=0;if(!visible||root.dataset.fxReferenceMotionPaused==='true')return;
    resize();if(cssW<2||cssH<2)return;
    const dt=Math.min(40,Math.max(0,now-last));last=now;if(!reduced.matches)phase+=dt*.001;
    const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0],rawEnergy=Number(window.FormatXCoreMobileV69?.energy||.30);
    const targetTx=clamp(cp[0]||0,-.08,.08),targetTy=clamp(cp[1]||0,-.08,.08),targetEnergy=clamp(rawEnergy,.30,1.8);
    lastTx+=(targetTx-lastTx)*.12;lastTy+=(targetTy-lastTy)*.12;lastEnergy+=(targetEnergy-lastEnergy)*.10;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cssW,cssH);
    if(bitmap){drawReference(lastTx,lastTy,lastEnergy);drawLiveOptics(lastTx,lastTy,lastEnergy);}
    root.dataset.fxCoreDetailEnergy=lastEnergy.toFixed(2);
    root.dataset.fxCoreDetailFrame=bitmap?'reference-material-r130':failed?'reference-fallback-r130':'reference-loading-r130';
    if(!raf)raf=requestAnimationFrame(render);
  }

  loadReferenceBitmap().then(b=>{
    bitmap=b;root.dataset.fxCoreReferenceTextureR130='ready';root.dataset.fxCoreFacetMode='reference-material-r130';
    dispatchEvent(new CustomEvent('formatx:coredetailready',{detail:{version:'r130',mode:'reference-material-interactive'}}));
    if(!raf&&visible){last=performance.now();raf=requestAnimationFrame(render);}
  }).catch(err=>{
    failed=true;root.dataset.fxCoreReferenceTextureR130='failed';root.dataset.fxCoreFacetMode='native-webgl-fallback-r130';
    console.warn('FormatX reference material r130 fallback',err);
  });

  const ro=new ResizeObserver(resize);ro.observe(stage);
  const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible&&!raf&&root.dataset.fxReferenceMotionPaused!=='true'){last=performance.now();raf=requestAnimationFrame(render);}},{rootMargin:'160px'});io.observe(stage);resize();
  addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&visible){last=performance.now();raf=requestAnimationFrame(render);}},{passive:true});
  root.dataset.fxCoreDetailR122='ready';raf=requestAnimationFrame(render);
}
boot();
}());
