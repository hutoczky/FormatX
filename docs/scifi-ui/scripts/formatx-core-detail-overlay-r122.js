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
 const shards=Array.from({length:72},(_,i)=>({a:rnd(i+13)*TAU,span:.08+rnd(i+73)*.36,inner:.06+rnd(i+133)*.50,outer:.48+rnd(i+193)*.50,outer2:.44+rnd(i+253)*.53,skew:(rnd(i+313)-.5)*.42,h:rnd(i+373),shade:rnd(i+433),edge:rnd(i+493)>.46}));
 const fractures=Array.from({length:94},(_,i)=>({a:rnd(i+553)*TAU,r:.16+rnd(i+613)*.78,da:(rnd(i+673)-.5)*.50,dr:.035+rnd(i+733)*.13,h:rnd(i+793),w:.28+rnd(i+853)*.78,alpha:.13+rnd(i+913)*.27}));
 const water=Array.from({length:145},(_,i)=>({y:.57+rnd(i+973)*.40,x:(rnd(i+1033)-.5)*1.76,w:.035+rnd(i+1093)*.23,a:.025+rnd(i+1153)*.13,h:rnd(i+1213),p:rnd(i+1273)*TAU}));
 const sparks=Array.from({length:46},(_,i)=>({a:rnd(i+1333)*TAU,r:.13+rnd(i+1393)*.84,p:rnd(i+1453)*TAU,s:.35+rnd(i+1513)*1.1}));
 function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;cssW=r.width;cssH=r.height;dpr=Math.min(devicePixelRatio||1,1.25);const w=Math.round(cssW*dpr),h=Math.round(cssH*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;canvas.style.width=cssW+'px';canvas.style.height=cssH+'px';}}
 function starRadius(a){const p=.585,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));return 1/Math.pow(Math.pow(c,p)+Math.pow(s,p),1/p);}
 function xy(a,r,cx,cy,sx,sy){const b=starRadius(a),q=b*r;return[cx+Math.cos(a)*sx*q,cy+Math.sin(a)*sy*q];}
 function starPath(cx,cy,sx,sy,r=1,wobble=0){ctx.beginPath();for(let i=0;i<=240;i++){const a=i/240*TAU,j=wobble*(Math.sin(a*5.7+phase*.09)+.60*Math.sin(a*11.3-phase*.07)+.28*Math.sin(a*19.1+1.7)),p=xy(a,r+j,cx,cy,sx,sy);if(!i)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);}ctx.closePath();}
 function poly(p){ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();}
 function rgba(h,a){if(h>.79)return `rgba(201,70,255,${a})`;if(h>.63)return `rgba(232,254,255,${a})`;if(h>.16)return `rgba(43,233,255,${a})`;return `rgba(45,122,255,${a})`;}
 function dark(h,a){if(h>.79)return `rgba(36,6,63,${a})`;if(h>.63)return `rgba(14,40,58,${a})`;if(h>.16)return `rgba(2,37,67,${a})`;return `rgba(2,15,58,${a})`;}
 function ring(cx,cy,r,color,w,a,blur,irregular=0){ctx.beginPath();for(let i=0;i<=128;i++){const t=i/128*TAU,j=irregular*(Math.sin(t*5.2+phase*.11)+.45*Math.sin(t*9.7-phase*.08)),x=cx+Math.cos(t)*(r+j),y=cy+Math.sin(t)*(r+j*.72);if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.strokeStyle=color;ctx.lineWidth=w;ctx.globalAlpha=a;ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.stroke();ctx.shadowBlur=0;}
 function render(now){
  raf=0;if(!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();if(cssW<2||cssH<2)return;
  const dt=Math.min(40,Math.max(0,now-last));last=now;if(!reduced.matches)phase+=dt*.001;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cssW,cssH);
  const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0],energy=Number(window.FormatXCoreMobileV69?.energy||.3),tx=clamp(cp[0]||0,-.08,.08),ty=clamp(cp[1]||0,-.08,.08);
  const cx=cssW*(.5+tx*.18),cy=cssH*(.5-ty*.15),sx=cssW*.455,sy=cssH*.445,base=Math.min(cssW,cssH),breath=1+(.0055+energy*.0014)*Math.sin(phase*.58),SX=sx*breath,SY=sy*breath;

  /* Reflective water/floor behind the crystal. */
  ctx.save();ctx.globalCompositeOperation='screen';
  const floor=ctx.createLinearGradient(0,cy+base*.05,0,cssH);floor.addColorStop(0,'rgba(0,69,105,0)');floor.addColorStop(.20,'rgba(0,89,135,.10)');floor.addColorStop(.62,'rgba(5,82,132,.16)');floor.addColorStop(1,'rgba(2,27,63,.03)');ctx.fillStyle=floor;ctx.fillRect(0,cy+base*.04,cssW,cssH-(cy+base*.04));
  water.forEach((s,i)=>{const y=cssH*s.y+(reduced.matches?0:Math.sin(phase*.20+s.p)*1.2),x=cx+cssW*s.x*.5,len=cssW*s.w*(.65+.35*Math.sin(i*.7+1.2));ctx.beginPath();ctx.moveTo(x-len*.5,y);ctx.lineTo(x+len*.5,y);ctx.strokeStyle=s.h>.78?'rgba(173,72,255,.70)':s.h>.22?'rgba(33,177,255,.76)':'rgba(87,238,255,.72)';ctx.lineWidth=.45+rnd(i+1601)*1.05;ctx.globalAlpha=s.a;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=3;ctx.stroke();ctx.shadowBlur=0;});
  const refl=ctx.createLinearGradient(cx,cy+base*.11,cx,cssH);refl.addColorStop(0,'rgba(94,246,255,.22)');refl.addColorStop(.35,'rgba(42,165,255,.08)');refl.addColorStop(.72,'rgba(177,64,255,.055)');refl.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=refl;ctx.globalAlpha=.65;ctx.fillRect(cx-base*.12,cy+base*.08,base*.24,cssH-cy);ctx.restore();

  ctx.save();starPath(cx,cy,SX,SY,1,.003);ctx.clip();
  /* Dense blue-violet glass mass. */
  ctx.globalCompositeOperation='source-over';const body=ctx.createRadialGradient(cx,cy,base*.01,cx,cy,base*.51);body.addColorStop(0,'rgba(9,91,126,.62)');body.addColorStop(.18,'rgba(3,56,99,.67)');body.addColorStop(.40,'rgba(4,31,79,.73)');body.addColorStop(.60,'rgba(24,15,75,.69)');body.addColorStop(.80,'rgba(4,30,65,.65)');body.addColorStop(1,'rgba(0,10,31,.43)');ctx.fillStyle=body;ctx.globalAlpha=.91;ctx.fillRect(0,0,cssW,cssH);

  /* Large irregular refractive faces. */
  shards.forEach((s,i)=>{const drift=reduced.matches?0:Math.sin(phase*.072+i*.43)*.005,a=s.a+drift+tx*.10,p0=xy(a+s.skew,s.inner,cx,cy,SX,SY),p1=xy(a-s.span*.58,s.outer,cx,cy,SX,SY),p2=xy(a+s.span*.42,s.outer2,cx,cy,SX,SY);poly([p0,p1,p2]);ctx.fillStyle=dark(s.h,.34+.34*s.shade);ctx.globalAlpha=.82;ctx.fill();ctx.globalCompositeOperation='screen';const g=ctx.createLinearGradient(p0[0],p0[1],(p1[0]+p2[0])*.5,(p1[1]+p2[1])*.5);g.addColorStop(0,rgba(s.h,.33+.22*s.shade));g.addColorStop(.35,rgba((s.h+.13)%1,.17+.10*s.shade));g.addColorStop(.73,rgba((s.h+.53)%1,.062));g.addColorStop(1,rgba(s.h,.012));ctx.fillStyle=g;ctx.globalAlpha=.87;ctx.fill();ctx.globalCompositeOperation='source-over';if(s.edge){ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.strokeStyle=rgba(s.h,.45+.22*s.shade);ctx.lineWidth=.65+.52*s.shade;ctx.globalAlpha=.52;ctx.shadowColor=rgba(s.h,.70);ctx.shadowBlur=6;ctx.stroke();ctx.shadowBlur=0;}});

  /* Four sculptural lobes built from offset folded glass blades, not concentric diamonds. */
  const axes=[-Math.PI/2,0,Math.PI/2,Math.PI];ctx.globalCompositeOperation='screen';
  axes.forEach((axis,j)=>{
   for(let k=0;k<7;k++){
    const side=k%2?-1:1,off=(k-3)*.075,aa=axis+off+tx*.045,inner=.045+.032*(k%4),mid=.43+.045*((k+j)%4),tip=.73+.043*((k*3+j)%6),spread=.34+.035*((k+j)%3);
    const p0=xy(aa,inner,cx,cy,SX,SY),p1=xy(aa-side*spread,mid,cx,cy,SX,SY),p2=xy(aa+side*.035,Math.min(.995,tip+.16),cx,cy,SX,SY),p3=xy(aa+side*spread*.60,mid*.96,cx,cy,SX,SY);poly([p0,p1,p2,p3]);const h=(.10+j*.22+k*.11)%1,g=ctx.createLinearGradient(p0[0],p0[1],p2[0],p2[1]);g.addColorStop(0,rgba(h,.40));g.addColorStop(.30,rgba((h+.10)%1,.27));g.addColorStop(.62,rgba((h+.56)%1,.11));g.addColorStop(1,rgba(h,.022));ctx.fillStyle=g;ctx.globalAlpha=.62+.05*(k%3);ctx.fill();ctx.beginPath();ctx.moveTo(...p1);ctx.lineTo(...p2);ctx.lineTo(...p3);ctx.strokeStyle=k%3===1?'rgba(217,92,255,.90)':'rgba(185,254,255,.95)';ctx.lineWidth=.75+(k%3)*.30;ctx.globalAlpha=.32+.06*(k%2);ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=7;ctx.stroke();ctx.shadowBlur=0;
   }
  });

  /* Broken fracture network: short angular pieces only. */
  ctx.globalCompositeOperation='lighter';fractures.forEach((f,i)=>{const a=f.a+(reduced.matches?0:Math.sin(phase*.06+i*.37)*.004),p0=xy(a,f.r,cx,cy,SX,SY),p1=xy(a+f.da,f.r+f.dr,cx,cy,SX,SY);ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.strokeStyle=rgba(f.h,.92);ctx.lineWidth=f.w;ctx.globalAlpha=f.alpha;ctx.shadowColor=rgba(f.h,.70);ctx.shadowBlur=4;ctx.stroke();ctx.shadowBlur=0;});

  /* Central dark lens masks line clutter and gives the reactor depth. */
  ctx.globalCompositeOperation='source-over';const lens=ctx.createRadialGradient(cx,cy,base*.015,cx,cy,base*.245);lens.addColorStop(0,'rgba(0,14,31,.02)');lens.addColorStop(.34,'rgba(1,21,47,.12)');lens.addColorStop(.68,'rgba(1,12,35,.32)');lens.addColorStop(1,'rgba(0,5,24,.05)');ctx.fillStyle=lens;ctx.globalAlpha=.78;ctx.beginPath();ctx.arc(cx,cy,base*.245,0,TAU);ctx.fill();

  /* Fewer, irregular reactor rings. */
  ctx.globalCompositeOperation='lighter';[.052,.092,.139,.193].forEach((v,i)=>ring(cx,cy,base*v,i===2?'rgba(219,91,255,.99)':'rgba(116,249,255,1)',i<2?1.55:1.05,i<2?.87:.62,8+i,.7+i*.22));
  for(let i=0;i<11;i++){const r=base*(.083+i*.0145),start=-2.7+i*.59+(reduced.matches?0:phase*(i%2?.021:-.018));ctx.beginPath();ctx.arc(cx,cy,r,start,start+.22+.13*rnd(i+1701));ctx.strokeStyle=i%4===1?'rgba(224,95,255,.96)':'rgba(144,250,255,.98)';ctx.lineWidth=.65+rnd(i+1761)*.65;ctx.globalAlpha=.24+.13*rnd(i+1821);ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=6;ctx.stroke();ctx.shadowBlur=0;}

  /* Cardinal spines and small specular stars. */
  axes.forEach((a,i)=>{const p0=xy(a,.035,cx,cy,SX,SY),p1=xy(a,.995,cx,cy,SX,SY);ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.strokeStyle='rgba(238,255,255,1)';ctx.lineWidth=1.55;ctx.globalAlpha=.69;ctx.shadowColor=i%2?'rgba(66,236,255,.98)':'rgba(204,86,255,.85)';ctx.shadowBlur=12;ctx.stroke();ctx.shadowBlur=0;});
  sparks.forEach((s,i)=>{const a=s.a+(reduced.matches?0:Math.sin(phase*.058+s.p)*.004),p=xy(a,s.r,cx,cy,SX,SY),tw=Math.pow(.5+.5*Math.sin(phase*(.34+s.s)+s.p),14);if(tw<.20)return;ctx.beginPath();ctx.arc(p[0],p[1],.38+s.s*.28,0,TAU);ctx.fillStyle=i%6===0?'rgba(227,105,255,1)':'rgba(243,255,255,1)';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;ctx.globalAlpha=.13+.60*tw;ctx.fill();ctx.shadowBlur=0;});ctx.restore();

  /* Fragmented icy boundary. */
  ctx.globalCompositeOperation='lighter';starPath(cx,cy,SX,SY,1,.005);ctx.strokeStyle='rgba(126,247,255,1)';ctx.lineWidth=2.05;ctx.globalAlpha=.82;ctx.shadowColor='rgba(42,213,255,1)';ctx.shadowBlur=16;ctx.stroke();ctx.shadowBlur=0;starPath(cx,cy,SX,SY,.982,.003);ctx.strokeStyle='rgba(244,255,255,.98)';ctx.lineWidth=.72;ctx.globalAlpha=.58;ctx.stroke();starPath(cx,cy,SX,SY,.948,.004);ctx.strokeStyle='rgba(207,77,255,.66)';ctx.lineWidth=1.05;ctx.globalAlpha=.40;ctx.shadowColor='rgba(176,47,255,.80)';ctx.shadowBlur=12;ctx.stroke();ctx.shadowBlur=0;

  /* White-hot core plus horizontal/vertical lens flare. */
  ctx.globalCompositeOperation='screen';ctx.globalAlpha=1;const hot=ctx.createRadialGradient(cx,cy,0,cx,cy,base*.092);hot.addColorStop(0,'rgba(255,255,255,1)');hot.addColorStop(.065,'rgba(255,255,255,1)');hot.addColorStop(.16,'rgba(226,255,255,1)');hot.addColorStop(.31,'rgba(74,248,255,.92)');hot.addColorStop(.54,'rgba(57,173,255,.42)');hot.addColorStop(.75,'rgba(198,68,255,.24)');hot.addColorStop(1,'rgba(18,108,255,0)');ctx.fillStyle=hot;ctx.beginPath();ctx.arc(cx,cy,base*.092,0,TAU);ctx.fill();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(237,255,255,.96)';ctx.lineWidth=.90;ctx.globalAlpha=.50;ctx.beginPath();ctx.moveTo(cx-base*.36,cy);ctx.lineTo(cx+base*.36,cy);ctx.moveTo(cx,cy-base*.33);ctx.lineTo(cx,cy+base*.33);ctx.shadowColor='rgba(76,239,255,.86)';ctx.shadowBlur=10;ctx.stroke();ctx.shadowBlur=0;
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;root.dataset.fxCoreDetailEnergy=energy.toFixed(2);root.dataset.fxCoreDetailFrame='fractured-volume-floor-r129';if(!raf)raf=requestAnimationFrame(render);
 }
 const ro=new ResizeObserver(resize);ro.observe(stage);const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible&&!raf&&root.dataset.fxReferenceMotionPaused!=='true')raf=requestAnimationFrame(render);},{rootMargin:'160px'});io.observe(stage);resize();
 addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&visible){last=performance.now();raf=requestAnimationFrame(render)}},{passive:true});
 root.dataset.fxCoreDetailR122='ready';root.dataset.fxCoreFacetMode='fractured-volume-floor-r129';dispatchEvent(new CustomEvent('formatx:coredetailready',{detail:{version:'r129',mode:'fractured-volume-floor'}}));raf=requestAnimationFrame(render);
}
boot();
}());
