(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxCoreDetailR122==='ready'||root.dataset.fxCoreDetailR122==='booting')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxCoreDetailR122='audit-skip';return;}
root.dataset.fxCoreDetailR122='booting';
root.dataset.fxCoreReferenceTextureR130='loading';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const PARTS=Array.from({length:6},(_,i)=>`/scifi-ui/assets/reference-r130/part${i}.b64?v=20260815-reference-material-r138`);

async function reconstructHeadingArtifactR138(source){
  const w=source.width,h=source.height;
  const off=typeof OffscreenCanvas==='function'?new OffscreenCanvas(w,h):document.createElement('canvas');
  off.width=w;off.height=h;
  const c=off.getContext('2d',{alpha:true,willReadFrequently:true});
  if(!c){root.dataset.fxCoreReferenceArtifactRepairR138='context-unavailable';return source;}
  c.drawImage(source,0,0,w,h);
  const image=c.getImageData(0,0,w,h),d=image.data;

  /* The source reference contains one residual neutral-blue "SMER" fragment at
     the lower crystal tail. The old implementation erased a wide title band,
     which also cut the cyan tail. Reconstruct only this 60x20 source-pixel area
     by vertical interpolation from clean rows immediately above/below it. This
     removes the baked fragment while preserving the continuous tail/water field. */
  const x0=Math.max(0,Math.round(w*.437)),x1=Math.min(w-1,Math.round(w*.588));
  const y0=Math.max(1,Math.round(h*.895)),y1=Math.min(h-2,Math.round(h*.939));
  const top=Math.max(0,y0-4),bottom=Math.min(h-1,y1+4);
  const row=(x,y)=>(y*w+x)*4;
  for(let y=y0;y<=y1;y++){
    const t=(y-y0+1)/(y1-y0+2);
    for(let x=x0;x<=x1;x++){
      const i=row(x,y),a=row(x,top),b=row(x,bottom);
      d[i]=Math.round(d[a]+(d[b]-d[a])*t);
      d[i+1]=Math.round(d[a+1]+(d[b+1]-d[a+1])*t);
      d[i+2]=Math.round(d[a+2]+(d[b+2]-d[a+2])*t);
      d[i+3]=Math.round(d[a+3]+(d[b+3]-d[a+3])*t);
    }
  }

  /* r157 desktop-only luminance key.
     The supplied 412x410 reference contains a dark navy image background. On a
     near-square mobile hero that background is part of the approved reference,
     but on a wide desktop page its rectangular extent reads as a separate panel.
     Key only the dark pixels to alpha on fine-pointer desktop. Bright cyan/white/
     violet crystal facets, star tips and water highlights stay opaque. */
  const desktopKey=matchMedia('(min-width:901px) and (pointer:fine)').matches;
  if(desktopKey){
    let keyed=0,kept=0;
    for(let i=0;i<d.length;i+=4){
      const r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];
      if(a===0)continue;
      const peak=Math.max(r,g,b);
      const lum=.2126*r+.7152*g+.0722*b;
      const signal=Math.max(peak*.72+lum*.28,lum);
      let f=1;
      if(signal<=20)f=0;
      else if(signal<38)f=(signal-20)/18*.16;
      else if(signal<58)f=.16+(signal-38)/20*.28;
      else if(signal<82)f=.44+(signal-58)/24*.38;
      else if(signal<108)f=.82+(signal-82)/26*.18;
      if(f<.995)keyed++;else kept++;
      d[i+3]=Math.round(a*clamp(f,0,1));
    }
    root.dataset.fxCoreDesktopLumaKeyR157='applied';
    root.dataset.fxCoreDesktopLumaKeyStatsR157=`${keyed},${kept}`;
  }else{
    root.dataset.fxCoreDesktopLumaKeyR157='mobile-bypass';
  }

  c.putImageData(image,0,0);
  source.close?.();
  root.dataset.fxCoreReferenceArtifactRepairR138='applied';
  root.dataset.fxCoreReferenceHeadingR138='dom-visible-clean-reference';
  return createImageBitmap(off);
}

async function loadReferenceBitmap(){
  const chunks=await Promise.all(PARTS.map(async url=>{
    const r=await fetch(url,{cache:'force-cache',credentials:'same-origin'});
    if(!r.ok)throw new Error(`reference chunk ${r.status}`);
    return (await r.text()).trim();
  }));

  /* r131 repair retained: two one-character transport defects were isolated by
     block hashes on the live Worker asset path. Repair before decoding. */
  chunks[0]=chunks[0].slice(0,754)+'n'+chunks[0].slice(754);
  chunks[4]=chunks[4].slice(0,10770)+chunks[4].slice(10771);
  const expected=[11000,11000,11000,11000,11000,10608];
  if(chunks.some((chunk,i)=>chunk.length!==expected[i]))throw new Error(`reference repair length mismatch ${chunks.map(v=>v.length).join(',')}`);
  root.dataset.fxCoreReferenceRepairR131='applied';

  const joined=chunks.join('');
  if(joined.length!==65608)throw new Error(`reference base64 length ${joined.length}`);
  const bin=atob(joined);
  if(bin.length!==49204)throw new Error(`reference byte length ${bin.length}`);
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  if(bytes[0]!==82||bytes[1]!==73||bytes[2]!==70||bytes[3]!==70||bytes[8]!==87||bytes[9]!==69||bytes[10]!==66||bytes[11]!==80)throw new Error('reference RIFF/WEBP signature mismatch');
  const raw=await createImageBitmap(new Blob([bytes],{type:'image/webp'}));
  return reconstructHeadingArtifactR138(raw);
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

    if(!reduced.matches&&(Math.abs(tx)+Math.abs(ty)>.006||energy>.42)){
      ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=clamp(.025+(energy-.30)*.035,.025,.075);
      ctx.translate(-tx*cssW*.018,ty*cssH*.014);
      ctx.drawImage(bitmap,0,0,cssW,cssH);
      ctx.restore();
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
    root.dataset.fxCoreDetailFrame=bitmap?'reference-material-r138':failed?'reference-fallback-r138':'reference-loading-r138';
    if(!raf)raf=requestAnimationFrame(render);
  }

  loadReferenceBitmap().then(b=>{
    bitmap=b;root.dataset.fxCoreReferenceTextureR130='ready';root.dataset.fxCoreFacetMode='reference-material-r138';root.dataset.fxCoreReferenceHeadingR138='dom-visible-clean-reference';
    dispatchEvent(new CustomEvent('formatx:coredetailready',{detail:{version:'r157',mode:'reference-material-interactive-desktop-key'}}));
    if(!raf&&visible){last=performance.now();raf=requestAnimationFrame(render);}
  }).catch(err=>{
    failed=true;root.dataset.fxCoreReferenceTextureR130='failed';root.dataset.fxCoreFacetMode='native-webgl-fallback-r138';
    console.warn('FormatX reference material r157 fallback',err);
  });

  const ro=new ResizeObserver(resize);ro.observe(stage);
  const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible&&!raf&&root.dataset.fxReferenceMotionPaused!=='true'){last=performance.now();raf=requestAnimationFrame(render);}},{rootMargin:'160px'});io.observe(stage);resize();
  addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&visible){last=performance.now();raf=requestAnimationFrame(render);}},{passive:true});
  root.dataset.fxCoreDetailR122='ready';raf=requestAnimationFrame(render);
}
boot();
}());
