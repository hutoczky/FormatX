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
  const shards=Array.from({length:64},(_,i)=>({
    a:rnd(i+11)*TAU,
    span:.10+rnd(i+71)*.42,
    inner:.04+rnd(i+131)*.43,
    outer:.48+rnd(i+191)*.50,
    outer2:.44+rnd(i+251)*.52,
    skew:(rnd(i+311)-.5)*.30,
    hue:rnd(i+371),
    shade:rnd(i+431),
    edge:rnd(i+491)>.47
  }));
  const blades=[];
  [0,Math.PI*.5,Math.PI,Math.PI*1.5].forEach((axis,j)=>{
    [-.31,-.18,-.08,.08,.18,.31].forEach((off,k)=>blades.push({a:axis+off,inner:.04+.035*k,outer:.64+.055*((k+j)%4),hue:(j*.19+k*.11)%1,side:k%2?-1:1}));
  });
  const caustics=Array.from({length:38},(_,i)=>({a:rnd(i+551)*TAU,r:.12+rnd(i+611)*.77,len:.05+rnd(i+671)*.18,bend:(rnd(i+731)-.5)*.35,h:rnd(i+791),w:.35+rnd(i+851)*.85}));
  const sparks=Array.from({length:34},(_,i)=>({a:rnd(i+911)*TAU,r:.15+rnd(i+971)*.78,p:rnd(i+1031)*TAU,s:.4+rnd(i+1091)*1.0}));
  function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;cssW=r.width;cssH=r.height;dpr=Math.min(devicePixelRatio||1,1.25);const w=Math.round(cssW*dpr),h=Math.round(cssH*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;canvas.style.width=cssW+'px';canvas.style.height=cssH+'px';}}
  function starRadius(a){const p=.585,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));return 1/Math.pow(Math.pow(c,p)+Math.pow(s,p),1/p);}
  function xy(a,r,cx,cy,sx,sy){const b=starRadius(a),q=b*r;return[cx+Math.cos(a)*sx*q,cy+Math.sin(a)*sy*q];}
  function starPath(cx,cy,sx,sy,r=1,wobble=0){ctx.beginPath();for(let i=0;i<=224;i++){const a=i/224*TAU,j=wobble*(Math.sin(a*7.1+phase*.10)+.45*Math.sin(a*13.3-phase*.06)),p=xy(a,r+j,cx,cy,sx,sy);if(!i)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);}ctx.closePath();}
  function poly(p){ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();}
  function rgba(h,a){if(h>.80)return `rgba(197,68,255,${a})`;if(h>.64)return `rgba(225,251,255,${a})`;if(h>.17)return `rgba(44,226,255,${a})`;return `rgba(42,116,255,${a})`;}
  function dark(h,a){if(h>.80)return `rgba(38,10,64,${a})`;if(h>.64)return `rgba(20,45,62,${a})`;if(h>.17)return `rgba(4,42,66,${a})`;return `rgba(5,20,63,${a})`;}
  function ring(cx,cy,r,color,w,a,blur){ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.strokeStyle=color;ctx.lineWidth=w;ctx.globalAlpha=a;ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.stroke();ctx.shadowBlur=0;}
  function render(now){
    raf=0;if(!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();if(cssW<2||cssH<2)return;
    const dt=Math.min(40,Math.max(0,now-last));last=now;if(!reduced.matches)phase+=dt*.001;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cssW,cssH);
    const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0],energy=Number(window.FormatXCoreMobileV69?.energy||.3);
    const cx=cssW*(.5+clamp(cp[0]||0,-.08,.08)*.17),cy=cssH*(.5-clamp(cp[1]||0,-.08,.08)*.14);
    const sx=cssW*.455,sy=cssH*.445,base=Math.min(cssW,cssH),breath=1+(.006+energy*.0015)*Math.sin(phase*.60),SX=sx*breath,SY=sy*breath;

    ctx.save();starPath(cx,cy,SX,SY);ctx.clip();
    /* Opaque-blue optical body masks the legacy wire shader without flattening the silhouette. */
    ctx.globalCompositeOperation='source-over';
    const body=ctx.createRadialGradient(cx,cy,base*.02,cx,cy,base*.50);
    body.addColorStop(0,'rgba(8,78,112,.40)');body.addColorStop(.22,'rgba(3,43,82,.44)');body.addColorStop(.48,'rgba(4,24,63,.52)');body.addColorStop(.70,'rgba(15,16,64,.48)');body.addColorStop(.88,'rgba(2,22,49,.42)');body.addColorStop(1,'rgba(0,10,32,.20)');ctx.fillStyle=body;ctx.globalAlpha=.82;ctx.fillRect(0,0,cssW,cssH);

    /* Dark and coloured crystal faces produce real visual mass instead of a polar grid. */
    shards.forEach((s,i)=>{
      const drift=reduced.matches?0:Math.sin(phase*.085+i*.39)*.006,a=s.a+drift;
      const p0=xy(a+s.skew,s.inner,cx,cy,SX,SY),p1=xy(a-s.span*.55,s.outer,cx,cy,SX,SY),p2=xy(a+s.span*.45,s.outer2,cx,cy,SX,SY);
      poly([p0,p1,p2]);ctx.fillStyle=dark(s.hue,.20+.22*s.shade);ctx.globalAlpha=.72;ctx.fill();
      const g=ctx.createLinearGradient(p0[0],p0[1],(p1[0]+p2[0])*.5,(p1[1]+p2[1])*.5);g.addColorStop(0,rgba(s.hue,.21+.15*s.shade));g.addColorStop(.42,rgba((s.hue+.12)%1,.10+.08*s.shade));g.addColorStop(.78,rgba((s.hue+.54)%1,.045));g.addColorStop(1,rgba(s.hue,.012));ctx.fillStyle=g;ctx.globalCompositeOperation='screen';ctx.globalAlpha=.92;ctx.fill();ctx.globalCompositeOperation='source-over';
      if(s.edge){ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.strokeStyle=rgba(s.hue,.30+.22*s.shade);ctx.lineWidth=.55+.45*s.shade;ctx.globalAlpha=.50;ctx.shadowColor=rgba(s.hue,.52);ctx.shadowBlur=5;ctx.stroke();ctx.shadowBlur=0;}
    });

    /* Long crystalline blades give the target its sharp laminated four-point depth. */
    ctx.globalCompositeOperation='screen';
    blades.forEach((b,i)=>{const a=b.a+(reduced.matches?0:Math.sin(phase*.055+i)*.004),p0=xy(a,b.inner,cx,cy,SX,SY),p1=xy(a-.055*b.side,b.outer,cx,cy,SX,SY),p2=xy(a+.075*b.side,Math.min(.98,b.outer+.12),cx,cy,SX,SY);poly([p0,p1,p2]);const g=ctx.createLinearGradient(p0[0],p0[1],p2[0],p2[1]);g.addColorStop(0,rgba(b.hue,.34));g.addColorStop(.45,rgba((b.hue+.16)%1,.18));g.addColorStop(1,rgba((b.hue+.55)%1,.025));ctx.fillStyle=g;ctx.globalAlpha=.70;ctx.fill();ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p2);ctx.strokeStyle=rgba(b.hue,.62);ctx.lineWidth=.88;ctx.globalAlpha=.42;ctx.shadowColor=rgba(b.hue,.75);ctx.shadowBlur=7;ctx.stroke();ctx.shadowBlur=0;});

    /* Broad shell ridges add thickness without recreating the old wireframe. */
    ctx.globalCompositeOperation='lighter';
    [{r:.94,w:7,h:.24,a:.13},{r:.82,w:5,h:.84,a:.11},{r:.69,w:4,h:.32,a:.10}].forEach((s,i)=>{starPath(cx,cy,SX,SY,s.r,.004);ctx.strokeStyle=rgba(s.h,.86);ctx.lineWidth=s.w;ctx.globalAlpha=s.a;ctx.shadowColor=rgba(s.h,.68);ctx.shadowBlur=12-i*2;ctx.stroke();ctx.shadowBlur=0;});

    caustics.forEach((c,i)=>{const a=c.a+(reduced.matches?0:Math.sin(phase*.07+i)*.004),p0=xy(a,c.r,cx,cy,SX,SY),p1=xy(a+c.bend,c.r+c.len,cx,cy,SX,SY);ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.strokeStyle=rgba(c.h,.78);ctx.lineWidth=c.w;ctx.globalAlpha=.18+.20*rnd(i+1201);ctx.shadowColor=rgba(c.h,.65);ctx.shadowBlur=5;ctx.stroke();ctx.shadowBlur=0;});

    [0,Math.PI*.5,Math.PI,Math.PI*1.5].forEach((a,i)=>{const p0=xy(a,.04,cx,cy,SX,SY),p1=xy(a,.992,cx,cy,SX,SY);ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.strokeStyle='rgba(228,255,255,.96)';ctx.lineWidth=1.35;ctx.globalAlpha=.60;ctx.shadowColor=i%2?'rgba(74,234,255,.92)':'rgba(195,82,255,.78)';ctx.shadowBlur=11;ctx.stroke();ctx.shadowBlur=0;});
    [Math.PI*.25,Math.PI*.75,Math.PI*1.25,Math.PI*1.75].forEach((a,i)=>{const p0=xy(a,.13,cx,cy,SX,SY),p1=xy(a,.78,cx,cy,SX,SY);ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.strokeStyle=i%2?'rgba(213,86,255,.78)':'rgba(92,239,255,.82)';ctx.lineWidth=.72;ctx.globalAlpha=.28;ctx.stroke();});

    /* Compact bright reactor rings. */
    [.040,.064,.090,.120,.154,.193,.239].forEach((v,i)=>ring(cx,cy,base*v,i%3===2?'rgba(215,88,255,.99)':'rgba(105,244,255,.99)',i<2?1.45:.95,i<2?.82:.52,7+i*.3));
    for(let i=0;i<7;i++){const r=base*(.105+i*.029),start=-2.55+i*.73+(reduced.matches?0:phase*(i%2?.026:-.022));ctx.beginPath();ctx.arc(cx,cy,r,start,start+.31+.10*Math.sin(i+phase*.09));ctx.strokeStyle=i%3===1?'rgba(218,91,255,.91)':'rgba(126,247,255,.92)';ctx.lineWidth=1.02;ctx.globalAlpha=.34;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=7;ctx.stroke();ctx.shadowBlur=0;}

    sparks.forEach((s,i)=>{const a=s.a+(reduced.matches?0:Math.sin(phase*.065+s.p)*.005),p=xy(a,s.r,cx,cy,SX,SY),tw=Math.pow(.5+.5*Math.sin(phase*(.38+s.s)+s.p),13);if(tw<.20)return;ctx.beginPath();ctx.arc(p[0],p[1],.42+s.s*.30,0,TAU);ctx.fillStyle=i%5===0?'rgba(222,102,255,.99)':'rgba(238,255,255,1)';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;ctx.globalAlpha=.14+.58*tw;ctx.fill();ctx.shadowBlur=0;});
    ctx.restore();

    /* Icy multi-layer boundary and external refraction halo. */
    ctx.globalCompositeOperation='lighter';starPath(cx,cy,SX,SY,1,.003);ctx.strokeStyle='rgba(120,244,255,1)';ctx.lineWidth=2.05;ctx.globalAlpha=.80;ctx.shadowColor='rgba(45,208,255,.98)';ctx.shadowBlur=15;ctx.stroke();ctx.shadowBlur=0;starPath(cx,cy,SX,SY,.985,.002);ctx.strokeStyle='rgba(239,255,255,.95)';ctx.lineWidth=.76;ctx.globalAlpha=.62;ctx.stroke();starPath(cx,cy,SX,SY,.957,.003);ctx.strokeStyle='rgba(201,75,255,.58)';ctx.lineWidth=1.05;ctx.globalAlpha=.43;ctx.shadowColor='rgba(170,48,255,.74)';ctx.shadowBlur=11;ctx.stroke();ctx.shadowBlur=0;

    /* White-hot core and restrained cross flare. */
    ctx.globalCompositeOperation='screen';ctx.globalAlpha=1;const hot=ctx.createRadialGradient(cx,cy,0,cx,cy,base*.086);hot.addColorStop(0,'rgba(255,255,255,1)');hot.addColorStop(.07,'rgba(255,255,255,1)');hot.addColorStop(.17,'rgba(219,255,255,1)');hot.addColorStop(.34,'rgba(68,245,255,.86)');hot.addColorStop(.57,'rgba(54,166,255,.38)');hot.addColorStop(.78,'rgba(191,65,255,.20)');hot.addColorStop(1,'rgba(18,108,255,0)');ctx.fillStyle=hot;ctx.beginPath();ctx.arc(cx,cy,base*.086,0,TAU);ctx.fill();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(230,255,255,.92)';ctx.lineWidth=.82;ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(cx-base*.31,cy);ctx.lineTo(cx+base*.31,cy);ctx.moveTo(cx,cy-base*.30);ctx.lineTo(cx,cy+base*.30);ctx.shadowColor='rgba(74,235,255,.82)';ctx.shadowBlur=8;ctx.stroke();ctx.shadowBlur=0;
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;root.dataset.fxCoreDetailEnergy=energy.toFixed(2);root.dataset.fxCoreDetailFrame='volumetric-shards-r127';if(!raf)raf=requestAnimationFrame(render);
  }
  const ro=new ResizeObserver(resize);ro.observe(stage);const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible&&!raf&&root.dataset.fxReferenceMotionPaused!=='true')raf=requestAnimationFrame(render);},{rootMargin:'160px'});io.observe(stage);resize();
  addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&visible){last=performance.now();raf=requestAnimationFrame(render)}},{passive:true});
  root.dataset.fxCoreDetailR122='ready';root.dataset.fxCoreFacetMode='volumetric-shards-r127';dispatchEvent(new CustomEvent('formatx:coredetailready',{detail:{version:'r127',mode:'volumetric-shards'}}));raf=requestAnimationFrame(render);
}
boot();
}());
