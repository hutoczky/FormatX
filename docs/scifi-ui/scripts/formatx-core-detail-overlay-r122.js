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
  const sectors=26,bands=[.08,.17,.28,.41,.55,.70,.84,1.0],facets=[];
  for(let b=0;b<bands.length-1;b++)for(let i=0;i<sectors;i++)facets.push({b,i,split:rnd(b*97+i*11)>.5,hue:rnd(b*193+i*23),edge:rnd(b*313+i*37)>.79,light:.55+rnd(b*419+i*41)*.45});
  const plates=Array.from({length:24},(_,i)=>({a:i/24*TAU+(rnd(i+31)-.5)*.19,span:.16+rnd(i+61)*.34,inner:.05+rnd(i+91)*.20,outer:.58+rnd(i+121)*.38,hue:rnd(i+151),skew:(rnd(i+181)-.5)*.24,bright:rnd(i+211)>.55}));
  const cracks=Array.from({length:34},(_,i)=>({a:rnd(i+251)*TAU,r:.18+rnd(i+281)*.67,len:.06+rnd(i+311)*.17,h:rnd(i+341),w:.35+rnd(i+371)*.65}));
  const glints=Array.from({length:31},(_,i)=>({a:rnd(i+401)*TAU,r:.13+rnd(i+431)*.80,p:rnd(i+461)*TAU,s:.4+rnd(i+491)*1.1}));
  function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;cssW=r.width;cssH=r.height;dpr=Math.min(devicePixelRatio||1,1.25);const w=Math.round(cssW*dpr),h=Math.round(cssH*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;canvas.style.width=cssW+'px';canvas.style.height=cssH+'px';}}
  function starRadius(a){const p=.585,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));return 1/Math.pow(Math.pow(c,p)+Math.pow(s,p),1/p);}
  function xy(a,r,cx,cy,sx,sy){const b=starRadius(a),q=b*r;return[cx+Math.cos(a)*sx*q,cy+Math.sin(a)*sy*q];}
  function starPath(cx,cy,sx,sy,r=1,wobble=0){ctx.beginPath();for(let i=0;i<=224;i++){const a=i/224*TAU,j=wobble*(Math.sin(a*7.1+phase*.11)+.45*Math.sin(a*13.4-phase*.07)),p=xy(a,r+j,cx,cy,sx,sy);if(i===0)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);}ctx.closePath();}
  function poly(points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();}
  function col(h,a){if(h>.78)return `rgba(207,75,255,${a})`;if(h>.62)return `rgba(225,252,255,${a})`;if(h>.16)return `rgba(47,232,255,${a})`;return `rgba(48,125,255,${a})`;}
  function ring(cx,cy,r,color,width,alpha,blur){ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=alpha;ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.stroke();ctx.shadowBlur=0;}
  function render(now){
    raf=0;if(!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();if(cssW<2||cssH<2)return;
    const dt=Math.min(40,Math.max(0,now-last));last=now;if(!reduced.matches)phase+=dt*.001;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cssW,cssH);
    const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0],energy=Number(window.FormatXCoreMobileV69?.energy||.3);
    const cx=cssW*(.5+clamp(cp[0]||0,-.08,.08)*.18),cy=cssH*(.5-clamp(cp[1]||0,-.08,.08)*.15);
    const sx=cssW*.455,sy=cssH*.445,base=Math.min(cssW,cssH),breath=1+(.0065+energy*.0015)*Math.sin(phase*.62),SX=sx*breath,SY=sy*breath;

    ctx.save();starPath(cx,cy,SX,SY);ctx.clip();ctx.globalCompositeOperation='screen';
    const body=ctx.createRadialGradient(cx,cy,base*.02,cx,cy,base*.49);
    body.addColorStop(0,'rgba(154,255,255,.30)');body.addColorStop(.20,'rgba(32,181,255,.20)');body.addColorStop(.43,'rgba(52,104,230,.145)');body.addColorStop(.64,'rgba(145,49,232,.115)');body.addColorStop(.83,'rgba(22,114,215,.085)');body.addColorStop(1,'rgba(4,20,55,.025)');ctx.fillStyle=body;ctx.globalAlpha=.97;ctx.fillRect(0,0,cssW,cssH);

    /* Thick nested glass ridges create the deep laminated crystal body. */
    [{r:.93,w:10,h:.27,a:.12},{r:.82,w:8,h:.83,a:.12},{r:.70,w:6,h:.31,a:.13},{r:.58,w:4,h:.69,a:.12}].forEach((s,i)=>{starPath(cx,cy,SX,SY,s.r,.0045);ctx.strokeStyle=col(s.h,.92);ctx.lineWidth=s.w;ctx.globalAlpha=s.a;ctx.shadowColor=col(s.h,.75);ctx.shadowBlur=13-i*2;ctx.stroke();ctx.shadowBlur=0;});

    /* Large refractive plates: irregular, overlapping and substantially filled. */
    plates.forEach((p,i)=>{
      const drift=reduced.matches?0:Math.sin(phase*.105+i*.67)*.010,a=p.a+drift,aL=a-p.span*.55,aR=a+p.span*.45;
      const q0=xy(a+p.skew,p.inner,cx,cy,SX,SY),q1=xy(aL,p.outer,cx,cy,SX,SY),q2=xy(aR,p.outer*(.91+rnd(i+601)*.10),cx,cy,SX,SY);
      poly([q0,q1,q2]);const g=ctx.createLinearGradient(q0[0],q0[1],(q1[0]+q2[0])*.5,(q1[1]+q2[1])*.5);
      g.addColorStop(0,col(p.hue,p.bright?.28:.22));g.addColorStop(.38,col((p.hue+.15)%1,p.bright?.17:.12));g.addColorStop(.78,col((p.hue+.52)%1,.065));g.addColorStop(1,col(p.hue,.018));ctx.fillStyle=g;ctx.globalAlpha=.90;ctx.fill();
      const e=[q1,q2];ctx.beginPath();ctx.moveTo(e[0][0],e[0][1]);ctx.lineTo(e[1][0],e[1][1]);ctx.strokeStyle=col(p.hue,p.bright?.48:.30);ctx.lineWidth=p.bright?1.0:.62;ctx.globalAlpha=.50;ctx.shadowColor=col(p.hue,.62);ctx.shadowBlur=p.bright?7:4;ctx.stroke();ctx.shadowBlur=0;
    });

    /* Filled low-poly facet field; almost all grid edges are suppressed. */
    facets.forEach((f,idx)=>{
      const a0=f.i/sectors*TAU,a1=(f.i+1)/sectors*TAU,r0=bands[f.b],r1=bands[f.b+1],j0=1+(rnd(idx+701)-.5)*.045,j1=1+(rnd(idx+751)-.5)*.045;
      const p00=xy(a0,r0*j0,cx,cy,SX,SY),p01=xy(a1,r0/j0,cx,cy,SX,SY),p10=xy(a0,r1*j1,cx,cy,SX,SY),p11=xy(a1,r1/j1,cx,cy,SX,SY);
      const tris=f.split?[[p00,p10,p11],[p00,p11,p01]]:[[p00,p10,p01],[p01,p10,p11]];
      tris.forEach((t,k)=>{poly(t);const h=(f.hue+.14*k+.025*Math.sin(phase*.08+idx))%1,alpha=(.070+.095*f.light)*(1-f.b*.025),g=ctx.createLinearGradient(t[0][0],t[0][1],t[2][0],t[2][1]);g.addColorStop(0,col(h,alpha*1.45));g.addColorStop(.52,col((h+.10)%1,alpha*.68));g.addColorStop(1,col((h+.58)%1,alpha*.18));ctx.fillStyle=g;ctx.globalAlpha=.74;ctx.fill();if(f.edge&&((idx+k)%2===0)){ctx.strokeStyle=col(h,.19);ctx.lineWidth=.48;ctx.globalAlpha=.38;ctx.stroke();}});
    });

    /* Broken internal caustics: short shard highlights rather than a radial web. */
    ctx.globalCompositeOperation='lighter';
    cracks.forEach((c,i)=>{const p0=xy(c.a,c.r,cx,cy,SX,SY),bend=(rnd(i+801)-.5)*.32,p1=xy(c.a+bend,c.r+c.len,cx,cy,SX,SY);ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.strokeStyle=col(c.h,.72);ctx.lineWidth=c.w;ctx.globalAlpha=.18+.18*rnd(i+831);ctx.shadowColor=col(c.h,.65);ctx.shadowBlur=5;ctx.stroke();ctx.shadowBlur=0;});

    /* Four bright crystal spines and four secondary violet/cyan ribs. */
    [0,Math.PI*.5,Math.PI,Math.PI*1.5].forEach((a,i)=>{const p0=xy(a,.055,cx,cy,SX,SY),p1=xy(a,.985,cx,cy,SX,SY);ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.strokeStyle='rgba(225,255,255,.92)';ctx.lineWidth=1.30;ctx.globalAlpha=.54;ctx.shadowColor=i%2?'rgba(91,235,255,.85)':'rgba(193,87,255,.72)';ctx.shadowBlur=10;ctx.stroke();ctx.shadowBlur=0;});
    [Math.PI*.25,Math.PI*.75,Math.PI*1.25,Math.PI*1.75].forEach((a,i)=>{const p0=xy(a,.14,cx,cy,SX,SY),p1=xy(a,.79,cx,cy,SX,SY);ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.strokeStyle=i%2?'rgba(206,84,255,.72)':'rgba(89,238,255,.75)';ctx.lineWidth=.78;ctx.globalAlpha=.32;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=6;ctx.stroke();ctx.shadowBlur=0;});

    /* Target-style circular reactor: bright rings with restrained spectral arcs. */
    [.042,.067,.094,.128,.168,.214,.268].forEach((v,i)=>ring(cx,cy,base*v,i%3===2?'rgba(214,91,255,.98)':'rgba(104,244,255,.99)',i<2?1.35:.92,i<2?.76:.47,6+i*.35));
    for(let i=0;i<8;i++){const r=base*(.11+i*.027),start=-2.4+i*.69+(reduced.matches?0:phase*(i%2?.026:-.021));ctx.beginPath();ctx.arc(cx,cy,r,start,start+.35+.11*Math.sin(i+phase*.10));ctx.strokeStyle=i%3===1?'rgba(216,91,255,.86)':'rgba(121,246,255,.88)';ctx.lineWidth=.95;ctx.globalAlpha=.31;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=7;ctx.stroke();ctx.shadowBlur=0;}

    glints.forEach((s,i)=>{const a=s.a+(reduced.matches?0:Math.sin(phase*.075+s.p)*.006),p=xy(a,s.r,cx,cy,SX,SY),tw=Math.pow(.5+.5*Math.sin(phase*(.42+s.s)+s.p),13);if(tw<.19)return;ctx.beginPath();ctx.arc(p[0],p[1],.42+s.s*.31,0,TAU);ctx.fillStyle=i%5===0?'rgba(220,103,255,.98)':'rgba(235,255,255,.99)';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;ctx.globalAlpha=.14+.56*tw;ctx.fill();ctx.shadowBlur=0;});
    ctx.restore();

    /* Multi-layer icy silhouette with cyan/violet refraction. */
    ctx.globalCompositeOperation='lighter';
    starPath(cx,cy,SX,SY,1,.003);ctx.strokeStyle='rgba(117,242,255,.98)';ctx.lineWidth=1.9;ctx.globalAlpha=.76;ctx.shadowColor='rgba(48,208,255,.95)';ctx.shadowBlur=14;ctx.stroke();ctx.shadowBlur=0;
    starPath(cx,cy,SX,SY,.986,.002);ctx.strokeStyle='rgba(235,255,255,.91)';ctx.lineWidth=.72;ctx.globalAlpha=.58;ctx.stroke();
    starPath(cx,cy,SX,SY,.958,.003);ctx.strokeStyle='rgba(196,78,255,.52)';ctx.lineWidth=1.05;ctx.globalAlpha=.40;ctx.shadowColor='rgba(166,52,255,.70)';ctx.shadowBlur=11;ctx.stroke();ctx.shadowBlur=0;

    /* White-hot centre and lens flare. */
    ctx.globalCompositeOperation='screen';ctx.globalAlpha=1;const hot=ctx.createRadialGradient(cx,cy,0,cx,cy,base*.082);hot.addColorStop(0,'rgba(255,255,255,1)');hot.addColorStop(.07,'rgba(255,255,255,1)');hot.addColorStop(.18,'rgba(214,255,255,.99)');hot.addColorStop(.35,'rgba(70,244,255,.82)');hot.addColorStop(.58,'rgba(56,164,255,.34)');hot.addColorStop(.78,'rgba(187,66,255,.18)');hot.addColorStop(1,'rgba(20,112,255,0)');ctx.fillStyle=hot;ctx.beginPath();ctx.arc(cx,cy,base*.082,0,TAU);ctx.fill();
    ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(226,255,255,.86)';ctx.lineWidth=.75;ctx.globalAlpha=.42;ctx.beginPath();ctx.moveTo(cx-base*.30,cy);ctx.lineTo(cx+base*.30,cy);ctx.moveTo(cx,cy-base*.29);ctx.lineTo(cx,cy+base*.29);ctx.shadowColor='rgba(78,233,255,.76)';ctx.shadowBlur=8;ctx.stroke();ctx.shadowBlur=0;
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    root.dataset.fxCoreDetailEnergy=energy.toFixed(2);root.dataset.fxCoreDetailFrame='dense-filled-crystal-r126';if(!raf)raf=requestAnimationFrame(render);
  }
  const ro=new ResizeObserver(resize);ro.observe(stage);const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible&&!raf&&root.dataset.fxReferenceMotionPaused!=='true')raf=requestAnimationFrame(render);},{rootMargin:'160px'});io.observe(stage);resize();
  addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&visible){last=performance.now();raf=requestAnimationFrame(render)}},{passive:true});
  root.dataset.fxCoreDetailR122='ready';root.dataset.fxCoreFacetMode='dense-filled-crystal-r126';dispatchEvent(new CustomEvent('formatx:coredetailready',{detail:{version:'r126',mode:'dense-filled-crystal'}}));raf=requestAnimationFrame(render);
}
boot();
}());
