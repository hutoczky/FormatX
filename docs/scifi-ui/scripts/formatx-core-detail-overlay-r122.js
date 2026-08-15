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
  const sectors=28,bands=[.10,.19,.30,.43,.57,.72,.86,1.0];
  const facets=[];
  for(let b=0;b<bands.length-1;b++)for(let i=0;i<sectors;i++)facets.push({
    b,i,
    split:rnd(b*101+i*7)>.5,
    hue:rnd(b*211+i*19),
    alpha:.42+rnd(b*307+i*29)*.58,
    edge:rnd(b*401+i*31)>.43
  });
  const plates=Array.from({length:18},(_,i)=>({
    a:(i/18)*TAU+(rnd(i+41)-.5)*.20,
    span:.22+rnd(i+71)*.38,
    inner:.08+rnd(i+101)*.17,
    outer:.56+rnd(i+131)*.39,
    hue:rnd(i+161),
    skew:(rnd(i+191)-.5)*.20
  }));
  const glints=Array.from({length:26},(_,i)=>({a:rnd(i+251)*TAU,r:.17+rnd(i+281)*.76,p:rnd(i+311)*TAU,s:.45+rnd(i+341)*1.0}));
  function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;cssW=r.width;cssH=r.height;dpr=Math.min(devicePixelRatio||1,1.25);const w=Math.round(cssW*dpr),h=Math.round(cssH*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;canvas.style.width=cssW+'px';canvas.style.height=cssH+'px';}}
  function starRadius(a){const p=.585,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));return 1/Math.pow(Math.pow(c,p)+Math.pow(s,p),1/p);}
  function xy(a,r,cx,cy,sx,sy){const b=starRadius(a),q=b*r;return[cx+Math.cos(a)*sx*q,cy+Math.sin(a)*sy*q];}
  function starPath(cx,cy,sx,sy,r=1){ctx.beginPath();for(let i=0;i<=224;i++){const a=i/224*TAU,[x,y]=xy(a,r,cx,cy,sx,sy);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();}
  function poly(points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();}
  function rgba(kind,a){if(kind==='violet')return `rgba(189,72,255,${a})`;if(kind==='ice')return `rgba(226,252,255,${a})`;if(kind==='blue')return `rgba(40,132,255,${a})`;return `rgba(47,230,255,${a})`;}
  function ring(cx,cy,r,color,width,alpha,blur){ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=alpha;ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.stroke();ctx.shadowBlur=0;}
  function render(now){
    raf=0;if(!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();if(cssW<2||cssH<2)return;
    const dt=Math.min(40,Math.max(0,now-last));last=now;if(!reduced.matches)phase+=dt*.001;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cssW,cssH);
    const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0],energy=Number(window.FormatXCoreMobileV69?.energy||.3);
    const cx=cssW*(.5+clamp(cp[0]||0,-.08,.08)*.20),cy=cssH*(.5-clamp(cp[1]||0,-.08,.08)*.16);
    const sx=cssW*.455,sy=cssH*.445,base=Math.min(cssW,cssH),breath=1+(.008+energy*.002)*Math.sin(phase*.65);
    const SX=sx*breath,SY=sy*breath;

    ctx.save();starPath(cx,cy,SX,SY);ctx.clip();
    const body=ctx.createRadialGradient(cx,cy,base*.025,cx,cy,base*.47);
    body.addColorStop(0,'rgba(91,245,255,.18)');
    body.addColorStop(.24,'rgba(23,133,255,.105)');
    body.addColorStop(.52,'rgba(122,45,220,.075)');
    body.addColorStop(.78,'rgba(22,111,212,.055)');
    body.addColorStop(1,'rgba(2,15,44,.01)');
    ctx.fillStyle=body;ctx.globalCompositeOperation='screen';ctx.globalAlpha=.92;ctx.fillRect(0,0,cssW,cssH);

    /* Broad translucent crystal plates. These create solid glass mass before fine facets. */
    plates.forEach((p,i)=>{
      const drift=reduced.matches?0:Math.sin(phase*.12+i*.73)*.012;
      const a=p.a+drift,aL=a-p.span*.5,aR=a+p.span*.5;
      const q0=xy(a+p.skew,p.inner,cx,cy,SX,SY),q1=xy(aL,p.outer,cx,cy,SX,SY),q2=xy(aR,p.outer*(.93+rnd(i+401)*.08),cx,cy,SX,SY);
      poly([q0,q1,q2]);
      const kind=p.hue>.70?'violet':p.hue>.54?'ice':p.hue>.18?'cyan':'blue';
      const grad=ctx.createLinearGradient(q0[0],q0[1],(q1[0]+q2[0])*.5,(q1[1]+q2[1])*.5);
      grad.addColorStop(0,rgba(kind,.13));grad.addColorStop(.58,rgba(kind,.055));grad.addColorStop(1,rgba(kind,.015));
      ctx.fillStyle=grad;ctx.globalAlpha=.72+.14*Math.sin(phase*.20+i);ctx.fill();
      if(i%3===0){ctx.strokeStyle=rgba(kind,.26);ctx.lineWidth=.7;ctx.shadowColor=rgba(kind,.55);ctx.shadowBlur=5;ctx.stroke();ctx.shadowBlur=0;}
    });

    /* Filled triangular facet field. Edges stay secondary so the object reads as glass, not a wireframe. */
    facets.forEach((f,idx)=>{
      const a0=f.i/sectors*TAU,a1=(f.i+1)/sectors*TAU;
      const r0=bands[f.b],r1=bands[f.b+1];
      const j0=1+(rnd(idx+701)-.5)*.035,j1=1+(rnd(idx+751)-.5)*.035;
      const p00=xy(a0,r0*j0,cx,cy,SX,SY),p01=xy(a1,r0/j0,cx,cy,SX,SY),p10=xy(a0,r1*j1,cx,cy,SX,SY),p11=xy(a1,r1/j1,cx,cy,SX,SY);
      const tris=f.split?[[p00,p10,p11],[p00,p11,p01]]:[[p00,p10,p01],[p01,p10,p11]];
      tris.forEach((t,k)=>{
        poly(t);
        const h=(f.hue+.11*k+.035*Math.sin(phase*.10+idx))%1;
        const kind=h>.76?'violet':h>.61?'ice':h>.15?'cyan':'blue';
        const alpha=(.032+.060*f.alpha)*(1-f.b*.035);
        const g=ctx.createLinearGradient(t[0][0],t[0][1],t[2][0],t[2][1]);
        g.addColorStop(0,rgba(kind,alpha*1.6));g.addColorStop(.50,rgba(kind,alpha*.62));g.addColorStop(1,rgba(kind,alpha*.18));
        ctx.fillStyle=g;ctx.globalAlpha=.82;ctx.fill();
        if(f.edge&&((idx+k)%3!==1)){ctx.strokeStyle=rgba(kind,.10+.08*f.alpha);ctx.lineWidth=.42;ctx.globalAlpha=.70;ctx.stroke();}
      });
    });

    /* Four structural glass ribs, matching the reference's strong cardinal crystal planes. */
    ctx.globalCompositeOperation='lighter';
    [0,Math.PI*.5,Math.PI,Math.PI*1.5].forEach((a,i)=>{
      const p0=xy(a,.08,cx,cy,SX,SY),p1=xy(a,.98,cx,cy,SX,SY);
      ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);
      ctx.strokeStyle=i%2?'rgba(222,255,255,.74)':'rgba(124,243,255,.78)';ctx.lineWidth=1.15;ctx.globalAlpha=.55;ctx.shadowColor='rgba(65,221,255,.75)';ctx.shadowBlur=9;ctx.stroke();ctx.shadowBlur=0;
    });
    [Math.PI*.25,Math.PI*.75,Math.PI*1.25,Math.PI*1.75].forEach((a,i)=>{
      const p0=xy(a,.15,cx,cy,SX,SY),p1=xy(a,.73,cx,cy,SX,SY);ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.strokeStyle=i%2?'rgba(202,84,255,.52)':'rgba(90,232,255,.55)';ctx.lineWidth=.65;ctx.globalAlpha=.32;ctx.stroke();
    });

    /* Compact reactor rings. Keep them circular and local; never recreate the previous full-object web. */
    const rr=[.045,.073,.108,.151,.205,.266].map(v=>base*v);
    rr.forEach((r,i)=>ring(cx,cy,r,i%3===2?'rgba(203,89,255,.95)':'rgba(92,241,255,.98)',i<2?1.15:.75,i<2?.62:.34,5+i*.35));
    for(let i=0;i<7;i++){
      const r=base*(.115+i*.030),start=-2.6+i*.73+(reduced.matches?0:phase*(i%2?.035:-.028));ctx.beginPath();ctx.arc(cx,cy,r,start,start+.42+.12*Math.sin(i+phase*.12));ctx.strokeStyle=i%3===1?'rgba(211,87,255,.72)':'rgba(109,244,255,.72)';ctx.lineWidth=.8;ctx.globalAlpha=.28;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=6;ctx.stroke();ctx.shadowBlur=0;
    }

    glints.forEach((s,i)=>{const a=s.a+(reduced.matches?0:Math.sin(phase*.09+s.p)*.007),p=xy(a,s.r,cx,cy,SX,SY),tw=Math.pow(.5+.5*Math.sin(phase*(.45+s.s)+s.p),12);if(tw<.20)return;ctx.beginPath();ctx.arc(p[0],p[1],.38+s.s*.28,0,TAU);ctx.fillStyle=i%6===0?'rgba(214,101,255,.92)':'rgba(230,255,255,.96)';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;ctx.globalAlpha=.12+.48*tw;ctx.fill();ctx.shadowBlur=0;});
    ctx.restore();

    /* Strong icy silhouette and local halo, drawn outside the clip. */
    ctx.globalCompositeOperation='lighter';
    starPath(cx,cy,SX,SY);ctx.strokeStyle='rgba(102,239,255,.90)';ctx.lineWidth=1.55;ctx.globalAlpha=.67;ctx.shadowColor='rgba(54,211,255,.82)';ctx.shadowBlur=12;ctx.stroke();ctx.shadowBlur=0;
    starPath(cx,cy,SX*.985,SY*.985);ctx.strokeStyle='rgba(228,255,255,.72)';ctx.lineWidth=.62;ctx.globalAlpha=.48;ctx.stroke();
    starPath(cx,cy,SX*.90,SY*.90);ctx.strokeStyle='rgba(191,76,255,.34)';ctx.lineWidth=.75;ctx.globalAlpha=.30;ctx.shadowColor='rgba(164,54,255,.50)';ctx.shadowBlur=11;ctx.stroke();ctx.shadowBlur=0;

    /* White-hot centre with cyan and violet refraction halo. */
    ctx.globalCompositeOperation='screen';ctx.globalAlpha=1;
    const hot=ctx.createRadialGradient(cx,cy,0,cx,cy,base*.072);
    hot.addColorStop(0,'rgba(255,255,255,1)');hot.addColorStop(.08,'rgba(255,255,255,1)');hot.addColorStop(.20,'rgba(196,255,255,.96)');hot.addColorStop(.39,'rgba(59,239,255,.70)');hot.addColorStop(.64,'rgba(73,145,255,.25)');hot.addColorStop(.82,'rgba(179,63,255,.12)');hot.addColorStop(1,'rgba(24,119,255,0)');
    ctx.fillStyle=hot;ctx.beginPath();ctx.arc(cx,cy,base*.072,0,TAU);ctx.fill();
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    root.dataset.fxCoreDetailEnergy=energy.toFixed(2);root.dataset.fxCoreDetailFrame='filled-faceted-glass-r125';
    if(!raf)raf=requestAnimationFrame(render);
  }
  const ro=new ResizeObserver(resize);ro.observe(stage);
  const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible&&!raf&&root.dataset.fxReferenceMotionPaused!=='true')raf=requestAnimationFrame(render);},{rootMargin:'160px'});io.observe(stage);resize();
  addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&visible){last=performance.now();raf=requestAnimationFrame(render)}},{passive:true});
  root.dataset.fxCoreDetailR122='ready';root.dataset.fxCoreFacetMode='filled-crystal-r125';
  dispatchEvent(new CustomEvent('formatx:coredetailready',{detail:{version:'r125',mode:'filled-faceted-crystal'}}));raf=requestAnimationFrame(render);
}
boot();
}());
