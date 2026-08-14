(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxCoreDetailR122==='ready'||root.dataset.fxCoreDetailR122==='booting')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxCoreDetailR122='audit-skip';return;}
root.dataset.fxCoreDetailR122='booting';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=n=>{const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x)};
function boot(attempt=0){
  const stage=document.querySelector('#hero .fx-core-r112-stage, #hero .fx-core-mobile-v55-stage');
  if(!stage){if(attempt<300)return requestAnimationFrame(()=>boot(attempt+1));root.dataset.fxCoreDetailR122='host-unavailable';return;}
  stage.querySelectorAll('.fx-core-detail-r122').forEach(n=>n.remove());
  const canvas=document.createElement('canvas');canvas.className='fx-core-detail-r122';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);
  const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});if(!ctx){canvas.remove();root.dataset.fxCoreDetailR122='context-unavailable';return;}
  let cssW=0,cssH=0,dpr=1,raf=0,visible=true,last=performance.now(),phase=0;
  const veins=Array.from({length:42},(_,i)=>({
    a:i/42*TAU+(rnd(i+1)-.5)*.13,
    bend:(rnd(i+61)-.5)*.58,
    width:.45+rnd(i+121)*1.05,
    hue:rnd(i+181),
    reach:.46+rnd(i+241)*.50,
    wobble:.45+rnd(i+301)*1.10
  }));
  const chords=Array.from({length:29},(_,i)=>({
    a:rnd(i+401)*TAU,b:rnd(i+461)*TAU,
    r1:.20+rnd(i+521)*.67,r2:.20+rnd(i+581)*.67,
    hue:rnd(i+641),width:.35+rnd(i+701)*.65
  }));
  const sparks=Array.from({length:54},(_,i)=>({a:rnd(i+801)*TAU,r:.13+rnd(i+861)*.84,s:.35+rnd(i+921)*1.0,p:rnd(i+981)*TAU}));
  function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;cssW=r.width;cssH=r.height;dpr=Math.min(devicePixelRatio||1,1.25);const w=Math.round(cssW*dpr),h=Math.round(cssH*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;canvas.style.width=cssW+'px';canvas.style.height=cssH+'px';ctx.setTransform(dpr,0,0,dpr,0,0);}}
  function starRadius(a){const p=.585,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));return 1/Math.pow(Math.pow(c,p)+Math.pow(s,p),1/p);}
  function xy(a,r,cx,cy,sx,sy){const b=starRadius(a),q=b*r;return[cx+Math.cos(a)*sx*q,cy+Math.sin(a)*sy*q];}
  function clipStar(cx,cy,sx,sy){ctx.beginPath();for(let i=0;i<=192;i++){const a=i/192*TAU,[x,y]=xy(a,1,cx,cy,sx,sy);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.clip();}
  function strokeGlow(color,width,blur,alpha=1){ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.stroke();ctx.shadowBlur=0;}
  function ring(cx,cy,rx,ry,color,width,alpha,noiseAmp=0){ctx.beginPath();for(let i=0;i<=120;i++){const a=i/120*TAU,j=noiseAmp*Math.sin(a*7.1+phase*.22)+noiseAmp*.55*Math.sin(a*13.3-phase*.13),x=cx+Math.cos(a)*(rx+j),y=cy+Math.sin(a)*(ry+j*.82);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}strokeGlow(color,width,5,alpha);}
  function render(now){raf=0;if(!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();if(cssW<2||cssH<2)return;
    const dt=Math.min(40,Math.max(0,now-last));last=now;if(!reduced.matches)phase+=dt*.001;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cssW,cssH);
    const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0],energy=Number(window.FormatXCoreMobileV69?.energy||.3),cx=cssW*(.5+clamp(cp[0]||0,-.08,.08)*.28),cy=cssH*(.5-clamp(cp[1]||0,-.08,.08)*.23);
    const sx=cssW*.455,sy=cssH*.445;
    ctx.save();clipStar(cx,cy,sx,sy);ctx.globalCompositeOperation='lighter';

    // broad refractive membranes: irregular nested four-point surfaces
    for(let k=0;k<7;k++){
      const rr=.28+k*.092,cyan=k%3!==1,color=cyan?'rgba(62,229,255,.92)':'rgba(190,83,255,.88)';
      ctx.beginPath();for(let i=0;i<=160;i++){const a=i/160*TAU,j=.012*Math.sin(a*(5+k)+k*.9+phase*.09)+.008*Math.sin(a*(11-k*.4)-phase*.06),[x,y]=xy(a,rr+j,cx,cy,sx,sy);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();strokeGlow(color,.52+(k%2)*.22,4,.16+.035*k);
    }

    // central circular reactor: target-like circular rings, not full-shape stripes
    const base=Math.min(cssW,cssH);
    [18,27,39,53,69,87,106].forEach((v,i)=>{const rr=v/412*base,cyc=i%3===2;ring(cx,cy,rr,rr*(.96+.02*Math.sin(i)),cyc?'rgba(196,84,255,.95)':'rgba(75,236,255,.98)',i<3?1.05:.72,i<3?.54:.28,.7+i*.08)});

    // organic radial veins with curved control points
    veins.forEach((v,i)=>{
      const start=.08+rnd(i+1001)*.10,end=v.reach,[x0,y0]=xy(v.a,start,cx,cy,sx,sy),[x3,y3]=xy(v.a,end,cx,cy,sx,sy);
      const a1=v.a+v.bend*.24*Math.sin(phase*.18+v.wobble+i),a2=v.a-v.bend*.20*Math.cos(phase*.14+i*.7),[x1,y1]=xy(a1,start+(end-start)*.34,cx,cy,sx,sy),[x2,y2]=xy(a2,start+(end-start)*.69,cx,cy,sx,sy);
      ctx.beginPath();ctx.moveTo(x0,y0);ctx.bezierCurveTo(x1,y1,x2,y2,x3,y3);
      const violet=v.hue>.67,color=violet?'rgba(201,79,255,.96)':'rgba(83,239,255,.98)';strokeGlow(color,v.width,4.5,.22+.18*rnd(i+1071));
      if(i%5===0){ctx.lineWidth=.28;ctx.strokeStyle='rgba(239,255,255,.72)';ctx.globalAlpha=.22;ctx.stroke();}
    });

    // cross-facet chords; these break symmetry and create crystal planes
    chords.forEach((c,i)=>{const p1=xy(c.a,c.r1,cx,cy,sx,sy),p2=xy(c.b,c.r2,cx,cy,sx,sy),midA=(c.a+c.b)*.5+(rnd(i+1101)-.5)*.7,midR=(c.r1+c.r2)*.44,pM=xy(midA,midR,cx,cy,sx,sy);ctx.beginPath();ctx.moveTo(...p1);ctx.quadraticCurveTo(...pM,...p2);strokeGlow(c.hue>.62?'rgba(191,74,255,.91)':'rgba(102,239,255,.94)',c.width,3,.14+.12*rnd(i+1161));});

    // cardinal beams and diagonal secondary rays
    const beam=(a,len,color,w,alpha)=>{const p0=xy(a,.03,cx,cy,sx,sy),p1=xy(a,len,cx,cy,sx,sy);ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);strokeGlow(color,w,7,alpha);};
    beam(0,.99,'rgba(214,255,255,.98)',1.05,.48);beam(Math.PI,.99,'rgba(214,255,255,.98)',1.05,.48);beam(Math.PI/2,.99,'rgba(212,255,255,.96)',.95,.40);beam(-Math.PI/2,.99,'rgba(212,255,255,.96)',.95,.40);
    [Math.PI*.25,Math.PI*.75,Math.PI*1.25,Math.PI*1.75].forEach((a,i)=>beam(a,.76,i%2?'rgba(197,80,255,.92)':'rgba(77,230,255,.92)',.48,.16));

    // moving spectral arcs outside the reactor but inside the glass
    for(let i=0;i<9;i++){const rr=(.33+i*.061)*Math.min(sx,sy),start=-2.5+i*.61+phase*(i%2?.07:-.05);ctx.beginPath();ctx.arc(cx,cy,rr,start,start+.58+.22*Math.sin(i+phase*.1));strokeGlow(i%3===1?'rgba(193,73,255,.96)':'rgba(73,233,255,.96)',.65,5,.20);}

    // stars/sparks embedded in material
    sparks.forEach((s,i)=>{const a=s.a+Math.sin(phase*.08+s.p)*.014,[x,y]=xy(a,s.r,cx,cy,sx,sy),tw=.25+.75*Math.pow(.5+.5*Math.sin(phase*(.8+s.s)+s.p),10);if(tw<.30)return;ctx.beginPath();ctx.arc(x,y,.35+s.s*.33,0,TAU);ctx.fillStyle=i%5===0?'rgba(211,100,255,.95)':'rgba(218,253,255,.96)';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=7;ctx.globalAlpha=.22+.44*tw;ctx.fill();ctx.shadowBlur=0;});

    ctx.restore();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    // compact white reactor hotspot above all clipped detail
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,base*.045);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.12,'rgba(246,255,255,.98)');g.addColorStop(.30,'rgba(102,245,255,.78)');g.addColorStop(.58,'rgba(50,174,255,.24)');g.addColorStop(1,'rgba(50,174,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,base*.045,0,TAU);ctx.fill();
    root.dataset.fxCoreDetailEnergy=energy.toFixed(2);root.dataset.fxCoreDetailFrame='procedural-r122';if(!raf)raf=requestAnimationFrame(render);
  }
  const ro=new ResizeObserver(resize);ro.observe(stage);const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible&&!raf&&root.dataset.fxReferenceMotionPaused!=='true')raf=requestAnimationFrame(render);},{rootMargin:'160px'});io.observe(stage);resize();
  addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&visible){last=performance.now();raf=requestAnimationFrame(render)}},{passive:true});
  root.dataset.fxCoreDetailR122='ready';dispatchEvent(new CustomEvent('formatx:coredetailready',{detail:{version:'r122',mode:'procedural-vector-caustics'}}));raf=requestAnimationFrame(render);
}
boot();
}());
