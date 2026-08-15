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
  const shards=Array.from({length:52},(_,i)=>({a:rnd(i+11)*TAU,span:.12+rnd(i+71)*.44,inner:.04+rnd(i+131)*.43,outer:.46+rnd(i+191)*.52,outer2:.43+rnd(i+251)*.54,skew:(rnd(i+311)-.5)*.32,hue:rnd(i+371),shade:rnd(i+431),edge:rnd(i+491)>.56}));
  const jewels=Array.from({length:30},(_,i)=>({a:rnd(i+551)*TAU,r:.28+rnd(i+611)*.64,span:.04+rnd(i+671)*.15,h:rnd(i+731),v:.45+rnd(i+791)*.55}));
  const sparks=Array.from({length:32},(_,i)=>({a:rnd(i+851)*TAU,r:.16+rnd(i+911)*.77,p:rnd(i+971)*TAU,s:.4+rnd(i+1031)*1.0}));
  function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;cssW=r.width;cssH=r.height;dpr=Math.min(devicePixelRatio||1,1.25);const w=Math.round(cssW*dpr),h=Math.round(cssH*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;canvas.style.width=cssW+'px';canvas.style.height=cssH+'px';}}
  function starRadius(a){const p=.585,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));return 1/Math.pow(Math.pow(c,p)+Math.pow(s,p),1/p);}
  function xy(a,r,cx,cy,sx,sy){const b=starRadius(a),q=b*r;return[cx+Math.cos(a)*sx*q,cy+Math.sin(a)*sy*q];}
  function starPath(cx,cy,sx,sy,r=1,wobble=0){ctx.beginPath();for(let i=0;i<=224;i++){const a=i/224*TAU,j=wobble*(Math.sin(a*7.1+phase*.10)+.45*Math.sin(a*13.3-phase*.06)),p=xy(a,r+j,cx,cy,sx,sy);if(!i)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);}ctx.closePath();}
  function poly(p){ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();}
  function rgba(h,a){if(h>.80)return `rgba(199,68,255,${a})`;if(h>.64)return `rgba(231,253,255,${a})`;if(h>.17)return `rgba(42,232,255,${a})`;return `rgba(42,120,255,${a})`;}
  function dark(h,a){if(h>.80)return `rgba(42,8,68,${a})`;if(h>.64)return `rgba(22,47,66,${a})`;if(h>.17)return `rgba(3,45,72,${a})`;return `rgba(3,18,65,${a})`;}
  function ring(cx,cy,r,color,w,a,blur){ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.strokeStyle=color;ctx.lineWidth=w;ctx.globalAlpha=a;ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.stroke();ctx.shadowBlur=0;}
  function render(now){
    raf=0;if(!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();if(cssW<2||cssH<2)return;
    const dt=Math.min(40,Math.max(0,now-last));last=now;if(!reduced.matches)phase+=dt*.001;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cssW,cssH);
    const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0],energy=Number(window.FormatXCoreMobileV69?.energy||.3);
    const cx=cssW*(.5+clamp(cp[0]||0,-.08,.08)*.17),cy=cssH*(.5-clamp(cp[1]||0,-.08,.08)*.14);
    const sx=cssW*.455,sy=cssH*.445,base=Math.min(cssW,cssH),breath=1+(.006+energy*.0015)*Math.sin(phase*.60),SX=sx*breath,SY=sy*breath;

    ctx.save();starPath(cx,cy,SX,SY);ctx.clip();
    ctx.globalCompositeOperation='source-over';
    const body=ctx.createRadialGradient(cx,cy,base*.015,cx,cy,base*.50);
    body.addColorStop(0,'rgba(9,87,122,.52)');body.addColorStop(.18,'rgba(3,54,94,.57)');body.addColorStop(.39,'rgba(4,31,78,.62)');body.addColorStop(.62,'rgba(20,16,70,.58)');body.addColorStop(.82,'rgba(3,28,61,.54)');body.addColorStop(1,'rgba(0,10,31,.34)');ctx.fillStyle=body;ctx.globalAlpha=.88;ctx.fillRect(0,0,cssW,cssH);

    /* Irregular dark glass faces break the perfect radial symmetry. */
    shards.forEach((s,i)=>{
      const drift=reduced.matches?0:Math.sin(phase*.08+i*.39)*.006,a=s.a+drift,p0=xy(a+s.skew,s.inner,cx,cy,SX,SY),p1=xy(a-s.span*.55,s.outer,cx,cy,SX,SY),p2=xy(a+s.span*.45,s.outer2,cx,cy,SX,SY);
      poly([p0,p1,p2]);ctx.fillStyle=dark(s.hue,.28+.30*s.shade);ctx.globalAlpha=.78;ctx.fill();
      ctx.globalCompositeOperation='screen';const g=ctx.createLinearGradient(p0[0],p0[1],(p1[0]+p2[0])*.5,(p1[1]+p2[1])*.5);g.addColorStop(0,rgba(s.hue,.30+.18*s.shade));g.addColorStop(.36,rgba((s.hue+.14)%1,.15+.10*s.shade));g.addColorStop(.74,rgba((s.hue+.55)%1,.055));g.addColorStop(1,rgba(s.hue,.014));ctx.fillStyle=g;ctx.globalAlpha=.86;ctx.fill();ctx.globalCompositeOperation='source-over';
      if(s.edge){ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.strokeStyle=rgba(s.hue,.42+.20*s.shade);ctx.lineWidth=.65+.45*s.shade;ctx.globalAlpha=.52;ctx.shadowColor=rgba(s.hue,.60);ctx.shadowBlur=6;ctx.stroke();ctx.shadowBlur=0;}
    });

    /* Four layered crystalline petals. This is the main reference-defining volume. */
    const axes=[-Math.PI/2,0,Math.PI/2,Math.PI];
    ctx.globalCompositeOperation='screen';
    axes.forEach((axis,j)=>{
      for(let level=0;level<4;level++){
        const r=.53+level*.115,tipR=Math.min(.985,r+.20),spread=.58-level*.055,inner=.06+level*.040;
        const p0=xy(axis,inner,cx,cy,SX,SY),pL=xy(axis-spread,r*(.90+.025*level),cx,cy,SX,SY),pT=xy(axis,tipR,cx,cy,SX,SY),pR=xy(axis+spread,r*(.91+.020*level),cx,cy,SX,SY);
        poly([p0,pL,pT,pR]);const h=(.17+j*.21+level*.13)%1,g=ctx.createLinearGradient(p0[0],p0[1],pT[0],pT[1]);g.addColorStop(0,rgba(h,.26));g.addColorStop(.34,rgba((h+.08)%1,.22));g.addColorStop(.67,rgba((h+.55)%1,.095));g.addColorStop(1,rgba(h,.025));ctx.fillStyle=g;ctx.globalAlpha=.72-level*.07;ctx.fill();
        ctx.beginPath();ctx.moveTo(...pL);ctx.lineTo(...pT);ctx.lineTo(...pR);ctx.strokeStyle=level%2?'rgba(207,88,255,.76)':'rgba(129,246,255,.86)';ctx.lineWidth=1.20-level*.13;ctx.globalAlpha=.34+.05*(3-level);ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=7+level;ctx.stroke();ctx.shadowBlur=0;
        const mL=xy(axis-spread*.42,r*.63,cx,cy,SX,SY),mR=xy(axis+spread*.38,r*.66,cx,cy,SX,SY);ctx.beginPath();ctx.moveTo(...mL);ctx.lineTo(...pT);ctx.moveTo(...mR);ctx.lineTo(...pT);ctx.strokeStyle=level%2?'rgba(103,238,255,.65)':'rgba(226,252,255,.72)';ctx.lineWidth=.62;ctx.globalAlpha=.24;ctx.stroke();
      }
    });

    /* Bright local shard planes provide the white/cyan fractured highlights in the target. */
    jewels.forEach((q,i)=>{
      const a=q.a+(reduced.matches?0:Math.sin(phase*.07+i)*.004),p0=xy(a,q.r,cx,cy,SX,SY),p1=xy(a-q.span,q.r+.12+.08*q.v,cx,cy,SX,SY),p2=xy(a+q.span*.55,q.r+.07+.06*q.v,cx,cy,SX,SY);poly([p0,p1,p2]);const g=ctx.createLinearGradient(p0[0],p0[1],p1[0],p1[1]);g.addColorStop(0,rgba(q.h,.45));g.addColorStop(.48,rgba((q.h+.62)%1,.20));g.addColorStop(1,rgba(q.h,.015));ctx.fillStyle=g;ctx.globalAlpha=.55+.16*q.v;ctx.fill();ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.strokeStyle=q.h>.72?'rgba(218,92,255,.86)':'rgba(214,255,255,.90)';ctx.lineWidth=.55+.55*q.v;ctx.globalAlpha=.33+.20*q.v;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=6;ctx.stroke();ctx.shadowBlur=0;
    });

    /* Three broad shell laminations only; avoid full-object wireframe. */
    ctx.globalCompositeOperation='lighter';
    [{r:.95,w:7,h:.24,a:.14},{r:.82,w:5,h:.84,a:.11},{r:.69,w:3.5,h:.31,a:.09}].forEach((s,i)=>{starPath(cx,cy,SX,SY,s.r,.004);ctx.strokeStyle=rgba(s.h,.88);ctx.lineWidth=s.w;ctx.globalAlpha=s.a;ctx.shadowColor=rgba(s.h,.72);ctx.shadowBlur=13-i*2;ctx.stroke();ctx.shadowBlur=0;});

    /* Strong cardinal crystal spines, plus short diagonal specular rays. */
    axes.forEach((a,i)=>{const p0=xy(a,.035,cx,cy,SX,SY),p1=xy(a,.995,cx,cy,SX,SY);ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.strokeStyle='rgba(235,255,255,.99)';ctx.lineWidth=1.45;ctx.globalAlpha=.66;ctx.shadowColor=i%2?'rgba(70,235,255,.95)':'rgba(201,85,255,.82)';ctx.shadowBlur=12;ctx.stroke();ctx.shadowBlur=0;});
    [Math.PI*.25,Math.PI*.75,Math.PI*1.25,Math.PI*1.75].forEach((a,i)=>{const p0=xy(a,.13,cx,cy,SX,SY),p1=xy(a,.73,cx,cy,SX,SY);ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.strokeStyle=i%2?'rgba(216,88,255,.78)':'rgba(99,241,255,.82)';ctx.lineWidth=.72;ctx.globalAlpha=.25;ctx.stroke();});

    /* Compact circular reactor. */
    [.039,.061,.086,.113,.145,.181,.222].forEach((v,i)=>ring(cx,cy,base*v,i%3===2?'rgba(218,89,255,1)':'rgba(111,247,255,1)',i<2?1.55:.98,i<2?.86:.55,7+i*.35));
    for(let i=0;i<6;i++){const r=base*(.102+i*.030),start=-2.50+i*.79+(reduced.matches?0:phase*(i%2?.025:-.021));ctx.beginPath();ctx.arc(cx,cy,r,start,start+.29+.09*Math.sin(i+phase*.09));ctx.strokeStyle=i%3===1?'rgba(221,94,255,.92)':'rgba(133,248,255,.94)';ctx.lineWidth=1.0;ctx.globalAlpha=.32;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=7;ctx.stroke();ctx.shadowBlur=0;}

    sparks.forEach((s,i)=>{const a=s.a+(reduced.matches?0:Math.sin(phase*.06+s.p)*.005),p=xy(a,s.r,cx,cy,SX,SY),tw=Math.pow(.5+.5*Math.sin(phase*(.36+s.s)+s.p),13);if(tw<.21)return;ctx.beginPath();ctx.arc(p[0],p[1],.42+s.s*.30,0,TAU);ctx.fillStyle=i%5===0?'rgba(223,102,255,1)':'rgba(241,255,255,1)';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;ctx.globalAlpha=.13+.58*tw;ctx.fill();ctx.shadowBlur=0;});
    ctx.restore();

    /* Icy boundary with violet refraction. */
    ctx.globalCompositeOperation='lighter';starPath(cx,cy,SX,SY,1,.003);ctx.strokeStyle='rgba(124,246,255,1)';ctx.lineWidth=2.15;ctx.globalAlpha=.84;ctx.shadowColor='rgba(42,211,255,1)';ctx.shadowBlur=16;ctx.stroke();ctx.shadowBlur=0;starPath(cx,cy,SX,SY,.984,.002);ctx.strokeStyle='rgba(242,255,255,.98)';ctx.lineWidth=.80;ctx.globalAlpha=.65;ctx.stroke();starPath(cx,cy,SX,SY,.956,.003);ctx.strokeStyle='rgba(205,77,255,.62)';ctx.lineWidth=1.12;ctx.globalAlpha=.45;ctx.shadowColor='rgba(172,47,255,.78)';ctx.shadowBlur=12;ctx.stroke();ctx.shadowBlur=0;

    /* White-hot reactor core and lens flare. */
    ctx.globalCompositeOperation='screen';ctx.globalAlpha=1;const hot=ctx.createRadialGradient(cx,cy,0,cx,cy,base*.089);hot.addColorStop(0,'rgba(255,255,255,1)');hot.addColorStop(.07,'rgba(255,255,255,1)');hot.addColorStop(.17,'rgba(223,255,255,1)');hot.addColorStop(.33,'rgba(72,247,255,.90)');hot.addColorStop(.55,'rgba(56,170,255,.40)');hot.addColorStop(.76,'rgba(195,67,255,.22)');hot.addColorStop(1,'rgba(18,108,255,0)');ctx.fillStyle=hot;ctx.beginPath();ctx.arc(cx,cy,base*.089,0,TAU);ctx.fill();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(234,255,255,.94)';ctx.lineWidth=.84;ctx.globalAlpha=.48;ctx.beginPath();ctx.moveTo(cx-base*.31,cy);ctx.lineTo(cx+base*.31,cy);ctx.moveTo(cx,cy-base*.30);ctx.lineTo(cx,cy+base*.30);ctx.shadowColor='rgba(75,238,255,.84)';ctx.shadowBlur=9;ctx.stroke();ctx.shadowBlur=0;
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;root.dataset.fxCoreDetailEnergy=energy.toFixed(2);root.dataset.fxCoreDetailFrame='layered-crystal-petals-r128';if(!raf)raf=requestAnimationFrame(render);
  }
  const ro=new ResizeObserver(resize);ro.observe(stage);const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible&&!raf&&root.dataset.fxReferenceMotionPaused!=='true')raf=requestAnimationFrame(render);},{rootMargin:'160px'});io.observe(stage);resize();
  addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&visible){last=performance.now();raf=requestAnimationFrame(render)}},{passive:true});
  root.dataset.fxCoreDetailR122='ready';root.dataset.fxCoreFacetMode='layered-crystal-petals-r128';dispatchEvent(new CustomEvent('formatx:coredetailready',{detail:{version:'r128',mode:'layered-crystal-petals'}}));raf=requestAnimationFrame(render);
}
boot();
}());
