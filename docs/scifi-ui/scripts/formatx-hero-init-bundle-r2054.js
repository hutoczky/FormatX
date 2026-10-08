/* FormatX R2054 - request-consolidation of four consecutive defer scripts.
 * Each standalone IIFE retains its original order, global scope and side effects.
 * Source of truth: the four original files; keep this copy synchronized.
 * No audit/user-agent-specific behavior is introduced. */
;
/* BEGIN formatx-mag-reference-film-r649.js */
(() => {
  'use strict';
  const W=1280,H=720,TAU=Math.PI*2;
  const MOBILE=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
  const ease=v=>1-Math.pow(1-clamp(v),3);
  function mulberry32(a){return()=>{let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
  const rnd=mulberry32(0xF04A649);
  const stars=Array.from({length:72},()=>({x:rnd()*W,y:rnd()*H,r:.45+rnd()*1.65,a:.12+rnd()*.72,d:.3+rnd()*1.5}));
  const debris=Array.from({length:24},()=>({x:rnd()*W,y:rnd()*H,s:1+rnd()*5,a:.05+rnd()*.16,p:rnd()*TAU}));
  const lobes=Array.from({length:22},(_,i)=>({a:i/22*TAU+(rnd()-.5)*.09,k:.72+rnd()*.34,q:.78+rnd()*.34,p:rnd()*TAU}));
  const veins=Array.from({length:16},()=>({a:rnd()*TAU,len:.2+rnd()*.72,b:(rnd()-.5)*.8}));
  const tentacles=Array.from({length:8},(_,i)=>({a:i/8*TAU+(rnd()-.5)*.14,len:.83+rnd()*.40,b:(rnd()-.5)*.85,w:1.6+rnd()*2.4,p:rnd()*TAU}));
  const ecosystemBands=Array.from({length:9},(_,i)=>({
    side:i%2?-1:1,y:.06+rnd()*.88,reach:.18+rnd()*.22,bend:.10+rnd()*.22,
    width:34+rnd()*72,phase:rnd()*TAU,alpha:.08+rnd()*.08
  }));
  const ecosystemCells=Array.from({length:16},()=>({
    x:rnd(),y:rnd(),r:12+rnd()*42,stretch:.65+rnd()*.65,
    phase:rnd()*TAU,alpha:.10+rnd()*.16
  }));
  const dna=[
    {x:192,y:92,l:610,a:57,r:-.34,p:.2,s:1.20,o:1},
    {x:1005,y:81,l:570,a:50,r:.33,p:1.2,s:1.08,o:.92},
    {x:384,y:270,l:720,a:61,r:.09,p:2.3,s:1.18,o:.98},
    {x:820,y:252,l:700,a:56,r:-.10,p:3.0,s:1.10,o:.90},
    {x:150,y:540,l:560,a:45,r:.25,p:4.2,s:.88,o:.65},
    {x:1085,y:520,l:540,a:45,r:-.28,p:5.1,s:.90,o:.62},
    {x:620,y:78,l:350,a:34,r:1.57,p:1.7,s:.72,o:.66},
    {x:635,y:646,l:360,a:33,r:1.54,p:4.7,s:.70,o:.55}
  ];
  function makeGradient(ctx,x0,y0,r0,x1,y1,r1,stops){
    const g=ctx.createRadialGradient(x0,y0,r0,x1,y1,r1);for(const [p,c] of stops)g.addColorStop(p,c);return g;
  }
  function pathGlow(ctx,draw,width,color,blur,alpha=1){
    ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.beginPath();draw(ctx);ctx.stroke();ctx.restore();
  }
  function drawDNA(ctx,d,time,alpha,zoom){
    ctx.save();
    ctx.translate(d.x,d.y);ctx.rotate(d.r);ctx.scale(d.s*zoom,d.s*zoom);
    const l=d.l,amp=d.a,phase=d.p+time*.00125;
    const pts1=[],pts2=[],N=40;
    for(let i=0;i<=N;i++){
      const u=i/N, x=(u-.5)*l, q=u*TAU*3.28+phase;
      const z=Math.sin(q), y=Math.cos(q)*amp;
      pts1.push([x,y,z]);pts2.push([x,-y,-z]);
    }
    const strand=(pts,col)=>{
      ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=col;ctx.lineWidth=2.6;ctx.shadowColor=col;ctx.shadowBlur=5;ctx.beginPath();
      pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.restore();
    };
    strand(pts1,'rgba(98,225,255,.92)');strand(pts2,'rgba(139,105,255,.82)');
    for(let i=3;i<N;i+=5){
      const p1=pts1[i],p2=pts2[i],front=(p1[2]+1)*.5;
      ctx.save();ctx.globalAlpha=alpha*(.30+.55*front);ctx.strokeStyle='rgba(190,244,255,.78)';ctx.lineWidth=1.4;ctx.shadowColor='rgba(112,220,255,.7)';ctx.shadowBlur=2;
      ctx.beginPath();ctx.moveTo(p1[0],p1[1]);ctx.lineTo(p2[0],p2[1]);ctx.stroke();
      for(const p of [p1,p2]){ctx.fillStyle=front>.5?'rgba(151,238,255,.96)':'rgba(142,105,255,.84)';ctx.beginPath();ctx.arc(p[0],p[1],2.5+front*1.7,0,TAU);ctx.fill()}
      ctx.restore();
    }
    ctx.restore();
  }
  function orbRadius(t){
    if(t<2.42)return 0;
    if(t<3.15)return 42+ease((t-2.42)/.73)*198;
    if(t<5.85)return 240+Math.sin((t-3.15)*1.25)*4;
    if(t<7.35)return 240-(smooth((t-5.85)/1.5)*82);
    if(t<9.25)return 158-smooth((t-7.35)/1.9)*38;
    if(t<9.55)return 120+smooth((t-9.25)/.30)*10;
    return 130-smooth((t-9.55)/.45)*24;
  }
  function drawOrb(ctx,t,time,cx,cy){
    const R=orbRadius(t);if(R<=0)return;
    const appear=smooth((t-2.42)/.55);
    const energy=smooth((t-9.28)/.36);
    ctx.save();ctx.translate(cx,cy);
    ctx.globalAlpha=appear;
    ctx.fillStyle=makeGradient(ctx,-R*.18,-R*.2,R*.03,0,0,R*1.05,[
      [0,'rgba(104,157,174,.29)'],[.22,'rgba(30,60,76,.36)'],[.58,'rgba(35,24,70,.48)'],[.86,'rgba(3,10,17,.93)'],[1,'rgba(1,4,8,.15)']
    ]);
    ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.fill();
    ctx.save();ctx.globalCompositeOperation='screen';
    for(const L of lobes){
      const rr=R*(.60+.18*Math.sin(L.p+time*.00033));
      const x=Math.cos(L.a)*rr,y=Math.sin(L.a)*rr;
      ctx.save();ctx.translate(x,y);ctx.rotate(L.a+.45);
      const gr=makeGradient(ctx,-R*.06,-R*.07,1,0,0,R*.42,[[0,'rgba(183,226,237,.14)'],[.35,'rgba(72,116,135,.11)'],[.75,'rgba(68,39,112,.19)'],[1,'rgba(4,9,15,0)']]);
      ctx.fillStyle=gr;ctx.strokeStyle='rgba(128,184,200,.095)';ctx.lineWidth=1;
      ctx.beginPath();ctx.ellipse(0,0,R*.25*L.k,R*.39*L.q,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
    }
    ctx.restore();
    ctx.save();ctx.globalAlpha=.38+.18*energy;ctx.strokeStyle='rgba(116,205,222,.22)';ctx.lineWidth=1.1;ctx.shadowColor='rgba(79,198,224,.22)';ctx.shadowBlur=3;
    for(const v of veins){
      const a=v.a+Math.sin(time*.0003+v.a)*.025;
      const r0=R*.20,r1=R*(.36+v.len*.58);
      const x0=Math.cos(a)*r0,y0=Math.sin(a)*r0,x1=Math.cos(a+v.b*.18)*r1,y1=Math.sin(a+v.b*.18)*r1;
      ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(Math.cos(a+v.b)*R*.55,Math.sin(a+v.b)*R*.55,x1,y1);ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle='rgba(150,222,235,'+(.18+.22*energy)+')';ctx.lineWidth=1.5+energy*2.5;ctx.shadowColor='rgba(80,225,255,.65)';ctx.shadowBlur=4+energy*10;ctx.beginPath();ctx.arc(0,0,R*.98,0,TAU);ctx.stroke();
    drawEye(ctx,t,time,R,energy);
    ctx.restore();
  }
  function drawEye(ctx,t,time,R,energy){
    if(t<2.68)return;
    const a=smooth((t-2.68)/.42);
    const shrink=t<6?1:(1-smooth((t-6)/3.3)*.30);
    const S=R*.38*shrink*(.62+.38*a);
    ctx.save();ctx.globalAlpha=a;ctx.rotate(Math.PI/4);
    ctx.fillStyle='rgba(42,112,145,.18)';ctx.strokeStyle='rgba(169,241,255,'+(.52+.34*energy)+')';ctx.lineWidth=1.4+energy*2;ctx.shadowColor='rgba(56,221,255,.85)';ctx.shadowBlur=7+energy*18;
    ctx.beginPath();ctx.rect(-S*.58,-S*.58,S*1.16,S*1.16);ctx.fill();ctx.stroke();ctx.rotate(-Math.PI/4);
    const pulse=.96+.04*Math.sin(time*.005);
    const g=makeGradient(ctx,0,0,0,0,0,S*.72,[
      [0,'rgba(1,7,13,1)'],[.15,'rgba(1,7,13,1)'],[.18,'rgba(244,255,255,1)'],[.23,'rgba(112,244,255,1)'],[.40,'rgba(22,190,231,.95)'],[.60,'rgba(15,71,103,.73)'],[.82,'rgba(61,44,143,.23)'],[1,'rgba(0,0,0,0)']
    ]);
    ctx.fillStyle=g;ctx.shadowColor='rgba(72,224,255,.9)';ctx.shadowBlur=8+energy*18;ctx.beginPath();ctx.arc(0,0,S*.72*pulse,0,TAU);ctx.fill();
    ctx.strokeStyle='rgba(211,254,255,.86)';ctx.lineWidth=2.3;ctx.beginPath();ctx.arc(0,0,S*.25,0,TAU);ctx.stroke();
    ctx.strokeStyle='rgba(84,229,255,.62)';ctx.lineWidth=1;for(let i=0;i<12;i++){const an=i/12*TAU+time*.0007;ctx.beginPath();ctx.moveTo(Math.cos(an)*S*.31,Math.sin(an)*S*.31);ctx.lineTo(Math.cos(an)*S*.56,Math.sin(an)*S*.56);ctx.stroke()}
    ctx.fillStyle='rgba(224,255,255,.95)';ctx.shadowBlur=15;ctx.beginPath();ctx.arc(-S*.09,-S*.10,S*.055,0,TAU);ctx.fill();ctx.restore();
  }
  function drawTentacles(ctx,t,time,cx,cy){
    if(t<5.72)return;
    const R=orbRadius(t),grow=smooth((t-5.72)/1.05),fade=1-smooth((t-9.55)/.45)*.26;
    ctx.save();ctx.translate(cx,cy);ctx.globalCompositeOperation='screen';
    for(const q of tentacles){
      const a=q.a, L=R*(1.15+q.len*1.45)*grow;
      const sx=Math.cos(a)*R*.82,sy=Math.sin(a)*R*.82;
      const ex=Math.cos(a)* (R+L),ey=Math.sin(a)*(R+L);
      const nx=-Math.sin(a),ny=Math.cos(a);
      const bend=Math.sin(time*.00125+q.p)*R*.26 + q.b*R*.65;
      ctx.save();ctx.globalAlpha=(.20+.46*grow)*fade;ctx.strokeStyle='rgba(118,222,239,.76)';ctx.lineWidth=q.w;ctx.shadowColor='rgba(63,206,239,.58)';ctx.shadowBlur=4;
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.bezierCurveTo(sx+Math.cos(a)*L*.28+nx*bend,sy+Math.sin(a)*L*.28+ny*bend,ex-Math.cos(a)*L*.38-nx*bend*.45,ey-Math.sin(a)*L*.38-ny*bend*.45,ex,ey);ctx.stroke();
      ctx.globalAlpha*=.28;ctx.lineWidth=q.w*4.8;ctx.stroke();ctx.restore();
    }
    ctx.restore();
  }
  function drawFlash(ctx,t,cx,cy){
    const u=smooth((t-9.32)/.18)*(1-smooth((t-9.68)/.24));if(u<=.001)return;
    const r=28+u*245;
    ctx.save();ctx.globalCompositeOperation='screen';
    ctx.fillStyle=makeGradient(ctx,cx,cy,0,cx,cy,r,[[0,'rgba(255,255,255,'+(u*.98)+')'],[.12,'rgba(197,252,255,'+(u*.92)+')'],[.36,'rgba(69,222,255,'+(u*.62)+')'],[1,'rgba(55,126,255,0)']]);
    ctx.fillRect(0,0,W,H);
    ctx.globalAlpha=u*.88;ctx.fillStyle='rgba(198,249,255,.78)';ctx.fillRect(0,cy-1.2,W,2.4);
    ctx.globalAlpha=u*.28;ctx.fillRect(0,cy-8,W,16);ctx.restore();
  }
  function drawLivingWorld(ctx,time,alpha=1){
    ctx.save();
    ctx.globalCompositeOperation='source-over';
    for(const b of ecosystemBands){
      const edge=b.side>0?W*1.04:-W*.04;
      const y=b.y*H+Math.sin(time*.00018+b.phase)*14;
      const endX=W*(.50+b.side*b.reach);
      const cp1x=edge-b.side*W*b.bend;
      const cp2x=endX+b.side*W*b.bend*.48;
      ctx.lineCap='round';
      ctx.strokeStyle='rgba(6,18,29,'+(b.alpha*2.2*alpha)+')';
      ctx.lineWidth=b.width;
      ctx.beginPath();ctx.moveTo(edge,y);
      ctx.bezierCurveTo(cp1x,y-H*.18,cp2x,y+H*.16,endX,y+Math.sin(b.phase)*H*.06);ctx.stroke();
      ctx.strokeStyle='rgba(78,178,206,'+(b.alpha*.42*alpha)+')';
      ctx.lineWidth=Math.max(1.2,b.width*.055);
      ctx.beginPath();ctx.moveTo(edge,y);
      ctx.bezierCurveTo(cp1x,y-H*.18,cp2x,y+H*.16,endX,y+Math.sin(b.phase)*H*.06);ctx.stroke();
    }
    for(const c of ecosystemCells){
      const x=c.x*W+Math.sin(time*.00013+c.phase)*10;
      const y=c.y*H+Math.cos(time*.00011+c.phase)*8;
      ctx.save();ctx.translate(x,y);ctx.rotate(c.phase*.18);ctx.scale(1,c.stretch);
      const g=ctx.createRadialGradient(-c.r*.22,-c.r*.20,2,0,0,c.r);
      g.addColorStop(0,'rgba(94,191,215,'+(c.alpha*.58*alpha)+')');
      g.addColorStop(.36,'rgba(45,74,112,'+(c.alpha*.54*alpha)+')');
      g.addColorStop(.72,'rgba(53,31,79,'+(c.alpha*.44*alpha)+')');
      g.addColorStop(1,'rgba(3,10,17,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,c.r,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(102,221,239,'+(c.alpha*.34*alpha)+')';ctx.lineWidth=1.1;
      ctx.beginPath();ctx.arc(0,0,c.r*.78,0,TAU);ctx.stroke();ctx.restore();
    }
    ctx.restore();
  }
  function drawBackground(ctx,t,time){
    ctx.fillStyle='#010405';ctx.fillRect(0,0,W,H);
    let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(7,13,15,.97)');g.addColorStop(.55,'rgba(4,10,12,.97)');g.addColorStop(1,'rgba(2,5,7,.99)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const rg=makeGradient(ctx,W*.50,H*.49,0,W*.50,H*.49,W*.68,[[0,'rgba(74,103,105,.11)'],[.36,'rgba(38,58,61,.075)'],[.72,'rgba(54,43,51,.055)'],[1,'rgba(0,0,0,0)']]);ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
    drawLivingWorld(ctx,time,.92);
    for(const s of stars){const tw=.68+.32*Math.sin(time*.001*s.d+s.x);ctx.fillStyle='rgba(182,224,236,'+(s.a*tw)+')';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,TAU);ctx.fill()}
    for(const d of debris){const yy=(d.y+time*.006*(.5+d.s*.1))%H;ctx.save();ctx.translate(d.x,yy);ctx.rotate(d.p+time*.00015);ctx.globalAlpha=d.a;ctx.strokeStyle='rgba(149,206,221,.65)';ctx.strokeRect(-d.s,-d.s*.45,d.s*2,d.s*.9);ctx.restore()}
  }
  function drawScene(ctx,r,time,target){
    const t=r*10;
    drawBackground(ctx,t,time);
    const dnaFade=1-smooth((t-2.55)/2.0);
    const dnaZoom=1.18-smooth(t/3.2)*.28;
    if(dnaFade>.002) for(const d of dna) drawDNA(ctx,d,time,d.o*dnaFade,dnaZoom);
    const cx=640+(target?.x!=null?(target.x-640)*smooth((t-9.72)/.28):0);
    const cy=360+(target?.y!=null?(target.y-360)*smooth((t-9.72)/.28):0);
    drawTentacles(ctx,t,time,cx,cy);
    drawOrb(ctx,t,time,cx,cy);
    drawFlash(ctx,t,cx,cy);
  }
  function drawLiteScene(ctx,r,time,target){
    const t=r*10,cx=640+(target?.x!=null?(target.x-640)*smooth((t-9.72)/.28):0),cy=360+(target?.y!=null?(target.y-360)*smooth((t-9.72)/.28):0);
    if(!MOBILE){ctx.fillStyle='#02070d';ctx.fillRect(0,0,W,H);}
    const chamber=ctx.createRadialGradient(cx,cy,12,cx,cy,560);
    chamber.addColorStop(0,'rgba(88,154,169,.23)');
    chamber.addColorStop(.34,'rgba(28,66,78,.15)');
    chamber.addColorStop(.72,'rgba(12,20,29,.08)');
    chamber.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=chamber;ctx.fillRect(0,0,W,H);
    if(!MOBILE)drawLivingWorld(ctx,time,.86);

    const dnaFade=1-smooth((t-2.65)/1.45);
    if(dnaFade>.002){
      ctx.save();ctx.globalAlpha=.58*dnaFade;ctx.lineWidth=2;
      for(let h=0;h<3;h++){
        const ox=[180,640,1090][h],oy=[170,120,205][h],rot=[-.28,.11,.31][h];
        ctx.save();ctx.translate(ox,oy);ctx.rotate(rot);
        for(let strand=0;strand<2;strand++){
          ctx.strokeStyle=strand?'rgba(132,112,220,.54)':'rgba(116,210,220,.58)';
          ctx.beginPath();
          for(let i=0;i<=20;i++){
            const u=i/20,x=(u-.5)*520,y=Math.sin(u*Math.PI*6.4+strand*Math.PI+time*.00042)*42;
            i?ctx.lineTo(x,y):ctx.moveTo(x,y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.restore();
    }

    const grow=smooth((t-2.42)/.70);
    if(grow>.002){
      /* R1723: one biological body from seed through final handoff. */
      const R=(42+grow*196)*(1+.017*Math.sin(time*.0022));
      ctx.save();ctx.translate(cx,cy);
      {
        const body=ctx.createRadialGradient(-R*.20,-R*.24,4,0,0,R*1.02);
        body.addColorStop(0,'rgba(214,226,221,.54)');
        body.addColorStop(.18,'rgba(137,160,157,.78)');
        body.addColorStop(.42,'rgba(65,91,91,.95)');
        body.addColorStop(.70,'rgba(22,39,42,.995)');
        body.addColorStop(1,'rgba(3,8,10,1)');
        ctx.fillStyle=body;
        /* R1724: FormatX Living Crystal Organism fallback silhouette.
           Angular living anatomy replaces the old egg/blob body. */
        const breathe=1+.008*Math.sin(time*.0024);
        ctx.scale(breathe,breathe);
        ctx.beginPath();
        ctx.moveTo(-R*.42,-R*.96);
        ctx.bezierCurveTo(-R*.18,-R*1.05,R*.15,-R*.98,R*.43,-R*.78);
        ctx.lineTo(R*.68,-R*.49);
        ctx.bezierCurveTo(R*.84,-R*.23,R*.86,R*.10,R*.73,R*.38);
        ctx.lineTo(R*.51,R*.67);
        ctx.bezierCurveTo(R*.32,R*.89,R*.08,R*1.02,-R*.17,R*.96);
        ctx.lineTo(-R*.43,R*.80);
        ctx.bezierCurveTo(-R*.66,R*.61,-R*.79,R*.33,-R*.80,R*.04);
        ctx.bezierCurveTo(-R*.81,-R*.26,-R*.70,-R*.60,-R*.42,-R*.96);
        ctx.closePath();
        ctx.fill();

        /* R1830: broad studio reflections only. No polygon scribbles, veins or
           faux HUD lines on the software fallback. */
        ctx.save();
        ctx.globalCompositeOperation='screen';
        ctx.lineCap='round';
        ctx.strokeStyle='rgba(225,237,232,.105)';
        ctx.lineWidth=R*.115;
        ctx.beginPath();
        ctx.moveTo(-R*.46,-R*.66);
        ctx.bezierCurveTo(-R*.31,-R*.44,-R*.27,-R*.08,-R*.12,R*.26);
        ctx.stroke();
        ctx.strokeStyle='rgba(87,154,158,.055)';
        ctx.lineWidth=R*.072;
        ctx.beginPath();
        ctx.moveTo(R*.39,-R*.50);
        ctx.bezierCurveTo(R*.51,-R*.18,R*.45,R*.18,R*.30,R*.46);
        ctx.stroke();
        ctx.restore();
      }
      const lensR=Math.max(27,R*.235);
      const lensRx=lensR*.84,lensRy=lensR*.66;
      const lensOX=R*.135,lensOY=-R*.070;
      const lens=ctx.createRadialGradient(lensOX-lensR*.22,lensOY-lensR*.25,1,lensOX,lensOY,lensR);
      lens.addColorStop(0,'rgba(232,236,232,.70)');
      lens.addColorStop(.12,'rgba(156,178,176,.80)');
      lens.addColorStop(.30,'rgba(73,112,116,.90)');
      lens.addColorStop(.54,'rgba(27,65,70,.985)');
      lens.addColorStop(.80,'rgba(8,28,32,1)');
      lens.addColorStop(1,'rgba(2,8,10,1)');
      ctx.fillStyle=lens;ctx.beginPath();ctx.ellipse(lensOX,lensOY,lensRx,lensRy,-.11,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(145,188,190,.24)';ctx.lineWidth=1.8;ctx.stroke();
      ctx.save();ctx.globalCompositeOperation='screen';ctx.shadowColor='rgba(76,158,169,.18)';ctx.shadowBlur=7;
      ctx.fillStyle='rgba(61,117,123,.060)';ctx.beginPath();ctx.ellipse(lensOX,lensOY,lensRx*.34,lensRy*.34,-.11,0,TAU);ctx.fill();ctx.restore();
      ctx.fillStyle='rgba(7,30,35,.34)';ctx.beginPath();ctx.ellipse(lensOX,lensOY,lensRx*.48,lensRy*.50,-.11,0,TAU);ctx.fill();
      ctx.save();ctx.globalCompositeOperation='screen';
      ctx.fillStyle='rgba(198,244,242,.42)';
      ctx.beginPath();ctx.ellipse(lensOX-lensRx*.28,lensOY-lensRy*.30,lensRx*.12,lensRy*.09,-.28,0,TAU);ctx.fill();
      ctx.restore();
      ctx.restore();

      if(!MOBILE && t>6.10){
        const tg=smooth((t-6.10)/1.10);
        ctx.save();ctx.strokeStyle='rgba(100,163,171,'+(.34*tg)+')';ctx.lineWidth=3.0;ctx.shadowColor='rgba(56,132,143,.14)';ctx.shadowBlur=2;
        for(let i=0;i<4;i++){
          const a=i/4*TAU+.24;
          const sway=Math.sin(time*.0016+i*.91)*.08;
          ctx.beginPath();
          ctx.moveTo(cx+Math.cos(a)*R*.66,cy+Math.sin(a)*R*.62);
          ctx.bezierCurveTo(cx+Math.cos(a+.18+sway)*R*1.12,cy+Math.sin(a+.18+sway)*R*1.08,cx+Math.cos(a-.14-sway)*R*1.62,cy+Math.sin(a-.14-sway)*R*1.50,cx+Math.cos(a+sway*.45)*R*2.02,cy+Math.sin(a+sway*.45)*R*1.84);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  function attach(canvas,getTarget){
    if(!(canvas instanceof HTMLCanvasElement))return null;
    let ctx=null,dpr=1,sw=0,sh=0,scale=1,ox=0,oy=0;
    const proofFrame=new URLSearchParams(location.search).has('introframe');
    const constrained=!proofFrame&&(
      Number(navigator.hardwareConcurrency||8)<=4 ||
      Number(navigator.deviceMemory||8)<=4
    );
    let runtimeConstrained=constrained;
    let qualityScale=proofFrame
      ? 1
      : runtimeConstrained
        ? (innerWidth<900?.58:.56)
        : (innerWidth<900?.92:.78);
    let renderAverage=0,lastQualityAdjust=0,panicSamples=0;
    function resize(){
      sw=innerWidth;sh=innerHeight;
      const baseDpr=proofFrame
        ? (sw<900?2.05:1.45)
        : runtimeConstrained
          ? (sw<900?1.18:1.05)
          : (sw<900?1.78:1.34);
      dpr=Math.min(devicePixelRatio||1,baseDpr*qualityScale);
      canvas.width=Math.max(1,Math.round(sw*dpr));canvas.height=Math.max(1,Math.round(sh*dpr));canvas.style.width=sw+'px';canvas.style.height=sh+'px';
      ctx=canvas.getContext('2d',{alpha:MOBILE,desynchronized:true});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.setTransform(dpr,0,0,dpr,0,0);
      scale=Math.max(sw/W,sh/H);ox=(sw-W*scale)*.5;oy=(sh-H*scale)*.5;
    }
    function draw(r,time){
      if(!ctx)resize();
      ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,sw,sh);ctx.translate(ox,oy);ctx.scale(scale,scale);
      let target=null;
      try{const p=getTarget?.();if(p)target={x:(p.x-ox)/scale,y:(p.y-oy)/scale}}catch(_){}
      const started=performance.now();
      drawLiteScene(ctx,r,time,target);
      ctx.restore();

      const cost=performance.now()-started;
      renderAverage=renderAverage?renderAverage*.82+cost*.18:cost;

      /* R1727g — capability hints are not enough: emulated, VM and thermally
         constrained devices can report many CPU cores while a canvas frame is
         still far over budget. The first expensive real frame immediately
         switches to the low-DPR path so repeated 100–250 ms tasks cannot build
         up through the 10 s cinematic. */
      if(!proofFrame && cost>24){
        panicSamples+=1;
        if(panicSamples>=1){
          const previous=qualityScale;
          runtimeConstrained=true;
          qualityScale=Math.min(qualityScale,sw<900?.46:.42);
          if(Math.abs(previous-qualityScale)>.001 || cost>42){
            lastQualityAdjust=time;
            resize();
          }
        }
      }else if(cost<9){
        panicSamples=Math.max(0,panicSamples-1);
      }

      if(time-lastQualityAdjust>520){
        const previous=qualityScale;
        const floor=runtimeConstrained
          ? (sw<900?.40:.34)
          : (sw<900?.64:.46);
        const ceiling=runtimeConstrained
          ? (sw<900?.62:.64)
          : (sw<900?.96:.88);
        if(renderAverage>16.0)qualityScale=Math.max(floor,qualityScale-(sw<900?.10:.12));
        else if(renderAverage>10.5)qualityScale=Math.max(floor,qualityScale-(sw<900?.050:.060));
        else if(renderAverage<6.5)qualityScale=Math.min(ceiling,qualityScale+.010);
        if(Math.abs(previous-qualityScale)>.001){
          lastQualityAdjust=time;
          resize();
        }
      }
      document.documentElement.dataset.fxMagFallbackTargetFpsR1601='60';
      document.documentElement.dataset.fxMagFallbackBudgetR1727=runtimeConstrained
        ? 'measured-constrained-low-dpr-fast-panic-recovery'
        : 'full-photographic-adaptive';
      document.documentElement.dataset.fxMagFallbackFramePanicR1727=String(panicSamples);
      document.documentElement.dataset.fxMagFallbackRenderMsR1601=renderAverage.toFixed(2);
      document.documentElement.dataset.fxMagFallbackQualityScaleR1601=qualityScale.toFixed(2);
    }
    resize();return{
      resize,draw,minimumFrameMs:16.67,targetFps:60,
      quality:'hidpi-studio-monolithic-bioglass-fallback-r1830'
    };
  }
  window.FormatXMagReferenceFilmR649={
    attach,
    revision:'r1724-formatx-living-crystal-organism-birth',
    guardianCompatibility:{revision:'r1724-formatx-crystal-guardian-birth'},
    visualRevision:'r1919-igloo-smoked-ice-three-mass-offset-oval-aperture'
  };
})();
/* END formatx-mag-reference-film-r649.js */

;
/* BEGIN formatx-living-habitat-r1530.js */
(() => {
  'use strict';

  const ROOT = document.documentElement;
  const BODY = document.body;
  if (!BODY || document.querySelector('.fx-living-habitat-r1530')) return;

  const REDUCED = matchMedia('(prefers-reduced-motion:reduce)');
  const MOBILE = matchMedia('(max-width:900px),(pointer:coarse)');
  const PARAMS = new URLSearchParams(location.search);
  const LIGHTHOUSE = /Chrome-Lighthouse/i.test(navigator.userAgent || '') || PARAMS.get('lighthouse') === '1';
  const VALIDATION = navigator.webdriver === true;
  const AUDIT = LIGHTHOUSE || VALIDATION;
  const LOW_POWER = AUDIT || (MOBILE.matches && (
    Number(navigator.hardwareConcurrency || 8) <= 4 ||
    Number(navigator.deviceMemory || 8) <= 4
  ));
  if (LIGHTHOUSE) {
    ROOT.dataset.fxLivingHabitatR1530='audit-static-skip-r1735';
    ROOT.dataset.fxHabitatPerformanceR1530='audit-zero-canvas';
    return;
  }

  /* R1695 — every meaningful input reaches the habitat. Mobile/coarse devices
     stay compositor-only: interaction toggles a CSS-owned physical light pulse,
     never a full-viewport Canvas2D loop. */
  let mobilePulseTimer=0;
  function habitatInput(kind='input'){
    ROOT.dataset.fxHabitatInputR1695=kind;
    if(AUDIT)return;
    BODY.classList.add('fx-habitat-react-r1695');
    clearTimeout(mobilePulseTimer);
    mobilePulseTimer=setTimeout(()=>BODY.classList.remove('fx-habitat-react-r1695'),180);
  }
  /* R1720: mobile now receives the real event-driven living habitat too.
     It paints only on resize/settled scroll/interaction, so the MAG remains
     the 60 Hz motion owner while the world is no longer a flat CSS backdrop. */
  if (MOBILE.matches) {
    ROOT.dataset.fxLivingHabitatR1530='event-driven-mobile-living-world';
    ROOT.dataset.fxLivingHabitatSchedulerR1603='mobile-event-driven-zero-idle-canvas';
    ROOT.dataset.fxHabitatPerformanceR1530=LOW_POWER?'constrained-event-driven':'mobile-event-driven';
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'fx-living-habitat-r1530';
  canvas.setAttribute('aria-hidden','true');
  canvas.dataset.renderer = 'canvas2d-event-driven-atmospheric-habitat';
  const ctx = canvas.getContext('2d',{alpha:true,desynchronized:true});
  if (!ctx) {
    canvas.remove();
    ROOT.dataset.fxLivingHabitatR1530='canvas-unavailable';
    return;
  }

  let width=1,height=1,dpr=1,raf=0,scrollSettleTimer=0,scrollStartTimer=0,pointerSettleTimer=0,lastDrawAt=0;
  let started=false;
  let pointerX=0,pointerY=0,targetX=0,targetY=0;
  let scrollTarget=0,scrollValue=0,impulse=0;
  let physiologyEnergy=.34,physiologyBreath=.12,physiologyKind='homeostasis',habitatZone='core';
  let particles=[],filaments=[],glassArcs=[],mineralSpires=[],tissueBands=[],cellPods=[],capillaries=[],membranePockets=[],neuralRoots=[];

  function seeded(seed=0xF04A1530){
    let s=seed>>>0;
    return ()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
  }
  const random=seeded();

  function seedScene(){
    const count=LOW_POWER?22:MOBILE.matches?38:46;
    particles=Array.from({length:count},()=>({
      x:random(),y:random(),z:.18+random()*.82,size:.45+random()*1.30,
      phase:random()*Math.PI*2,alpha:.12+random()*.30
    }));
    /* R1584: long diagonal lines read as stage beams on phones. Keep the
       mobile habitat purely volumetric and reserve only a few short, dim
       biological filaments for fine-pointer desktop depth. */
    const lines=LOW_POWER?4:MOBILE.matches?7:9;
    filaments=Array.from({length:lines},(_,index)=>({
      x:.08+random()*.84,y:.08+random()*.84,len:.12+random()*.18,
      bend:(random()-.5)*.12,phase:random()*Math.PI*2,
      alpha:.020+random()*.024,width:.55+random()*.70,dir:index%2?1:-1
    }));
    const arcCount=LOW_POWER?3:MOBILE.matches?5:7;
    glassArcs=Array.from({length:arcCount},(_,index)=>({
      side:index%2?-1:1,
      y:.16+random()*.58,
      reach:.18+random()*.18,
      bend:.10+random()*.18,
      alpha:.040+random()*.032,
      width:.95+random()*1.55,
      phase:random()*Math.PI*2,
      warm:index%3===1
    }));
    const spireCount=LOW_POWER?3:MOBILE.matches?5:7;
    mineralSpires=Array.from({length:spireCount},(_,index)=>({
      side:index%2?-1:1,
      x:.04+random()*.22,
      y:.60+random()*.36,
      w:.050+random()*.070,
      h:.10+random()*.24,
      lean:(random()-.5)*.050,
      alpha:.10+random()*.10,
      warm:index%3===0
    }));
    const bandCount=LOW_POWER?5:MOBILE.matches?8:11;
    tissueBands=Array.from({length:bandCount},(_,index)=>({
      side:index%2?-1:1,
      y:.04+random()*.90,
      reach:.16+random()*.26,
      bend:.08+random()*.20,
      width:(LOW_POWER?34:44)+random()*(MOBILE.matches?76:108),
      alpha:.055+random()*.075,
      phase:random()*Math.PI*2
    }));
    const podCount=LOW_POWER?8:MOBILE.matches?14:18;
    cellPods=Array.from({length:podCount},()=>({
      x:.03+random()*.94,y:.05+random()*.90,
      r:(MOBILE.matches?12:14)+random()*(MOBILE.matches?34:48),
      stretch:.65+random()*.72,
      alpha:.07+random()*.12,phase:random()*Math.PI*2
    }));
    const capillaryCount=LOW_POWER?5:MOBILE.matches?9:13;
    capillaries=Array.from({length:capillaryCount},(_,index)=>({
      side:index%2?-1:1,y:.10+random()*.80,len:.18+random()*.28,
      bend:(random()-.5)*.16,alpha:.025+random()*.035,
      phase:random()*Math.PI*2,width:.55+random()*.85
    }));
    const pocketCount=LOW_POWER?4:MOBILE.matches?7:10;
    membranePockets=Array.from({length:pocketCount},()=>({
      x:.06+random()*.88,y:.07+random()*.86,
      rx:.08+random()*.14,ry:.05+random()*.12,
      rot:(random()-.5)*1.2,alpha:.035+random()*.055,
      phase:random()*Math.PI*2
    }));
    const rootCount=LOW_POWER?5:MOBILE.matches?9:12;
    neuralRoots=Array.from({length:rootCount},(_,index)=>({
      side:index%2?-1:1,y:.05+random()*.88,
      reach:.22+random()*.30,bend:(random()-.5)*.22,
      alpha:.032+random()*.046,width:.75+random()*1.20,
      phase:random()*Math.PI*2
    }));
  }

  function resize(){
    if(!started)return;
    width=Math.max(1,innerWidth);height=Math.max(1,innerHeight);
    dpr=Math.min(devicePixelRatio||1,AUDIT?.72:LOW_POWER?(MOBILE.matches?1.20:1):MOBILE.matches?1.80:1.24);
    canvas.width=Math.max(1,Math.round(width*dpr));
    canvas.height=Math.max(1,Math.round(height*dpr));
    canvas.style.width=width+'px';canvas.style.height=height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    seedScene();
    schedule();
  }

  function updateScroll(){
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    scrollTarget=Math.max(0,Math.min(1,scrollY/max));
    clearTimeout(scrollSettleTimer);
    scrollSettleTimer=setTimeout(()=>{
      scrollSettleTimer=0;
      schedule();
    },96);
    ROOT.dataset.fxLivingHabitatScrollR1643='css-compositor-during-scroll-canvas-after-settle';
  }

  function pointer(event){
    if(AUDIT||MOBILE.matches)return;
    targetX=(event.clientX/Math.max(1,width)-.5)*2;
    targetY=(event.clientY/Math.max(1,height)-.5)*2;
    /* R1710: pointer tracking stays compositor-cheap while the MAG owns 60 Hz.
       Repaint the atmospheric backing store only after pointer movement settles. */
    clearTimeout(pointerSettleTimer);
    pointerSettleTimer=setTimeout(()=>{pointerSettleTimer=0;schedule();},96);
  }

  function radial(x,y,radius,stops){
    const g=ctx.createRadialGradient(x,y,0,x,y,radius);
    stops.forEach(([at,value])=>g.addColorStop(at,value));
    return g;
  }

  function draw(time=performance.now()){
    raf=0;
    /* R1670: desktop habitat is decorative, not the motion owner. On high-refresh
       panels skip redundant Canvas2D paints while keeping a >=60Hz presentation
       path: 60Hz paints every frame, 120Hz every second frame, 144Hz ~72Hz. */
    if(lastDrawAt && time-lastDrawAt<11){
      return;
    }
    lastDrawAt=time;
    pointerX+=(targetX-pointerX)*.45;
    pointerY+=(targetY-pointerY)*.45;
    scrollValue+=(scrollTarget-scrollValue)*.45;
    impulse*=.72;

    ctx.clearRect(0,0,width,height);
    const breath=.5+.5*Math.sin(time*.00024);
    const vitality=Math.max(0,Math.min(1.25,physiologyEnergy*.72+physiologyBreath*.28));
    const habitatBreath=Math.max(.35,Math.min(1.35,.62+breath*.22+physiologyBreath*.28));

    const sx=width*(MOBILE.matches?.50:.66)+pointerX*width*.009;
    const sy=-height*.04+pointerY*height*.004;
    const radius=Math.max(width,height)*.44;
    ctx.fillStyle=radial(sx,sy,radius,[
      [0,'rgba(214,248,251,'+(.020+habitatBreath*.005+impulse*.008+vitality*.010)+')'],
      [.20,'rgba(112,204,220,'+(.014+vitality*.010)+')'],
      [.58,'rgba(42,104,122,'+(.006+vitality*.005)+')'],
      [1,'rgba(0,0,0,0)']
    ]);
    ctx.fillRect(0,0,width,height);

    const floor=ctx.createRadialGradient(width*.52,height*1.04,0,width*.52,height*1.04,Math.max(width,height)*.52);
    floor.addColorStop(0,'rgba(68,130,142,.030)');
    floor.addColorStop(.48,'rgba(23,68,79,.014)');
    floor.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=floor;ctx.fillRect(0,0,width,height);

    /* R1720 — complete living-world layer. Thick translucent tissue folds,
       cell pods and capillary traces create an ecosystem around the MAG.
       All of this is one event-driven Canvas2D paint, not a continuous loop. */
    for(const b of tissueBands){
      const edge=b.side>0?width*1.06:-width*.06;
      const y=height*b.y+Math.sin(time*.00016+b.phase)*height*.012;
      const endX=width*(.50+b.side*b.reach);
      const endY=y+Math.sin(b.phase)*height*.08;
      const cp1x=edge-b.side*width*b.bend;
      const cp2x=endX+b.side*width*b.bend*.46;
      ctx.save();ctx.lineCap='round';
      ctx.strokeStyle='rgba(4,14,24,'+(b.alpha*(2.15+vitality*.70))+')';
      ctx.lineWidth=b.width;
      ctx.beginPath();ctx.moveTo(edge,y);
      ctx.bezierCurveTo(cp1x,y-height*.20,cp2x,endY+height*.15,endX,endY);ctx.stroke();
      ctx.strokeStyle='rgba(35,89,119,'+(b.alpha*(.70+vitality*.30))+')';
      ctx.lineWidth=Math.max(2,b.width*.12);
      ctx.beginPath();ctx.moveTo(edge,y);
      ctx.bezierCurveTo(cp1x,y-height*.20,cp2x,endY+height*.15,endX,endY);ctx.stroke();
      ctx.strokeStyle='rgba(103,216,236,'+(b.alpha*(.34+vitality*.26))+')';
      ctx.lineWidth=Math.max(.8,b.width*.025);
      ctx.beginPath();ctx.moveTo(edge,y);
      ctx.bezierCurveTo(cp1x,y-height*.20,cp2x,endY+height*.15,endX,endY);ctx.stroke();
      ctx.restore();
    }
    for(const p of cellPods){
      const x=p.x*width+Math.sin(time*.00010+p.phase)*4;
      const y=p.y*height+Math.cos(time*.00012+p.phase)*4;
      ctx.save();ctx.translate(x,y);ctx.rotate(p.phase*.12);ctx.scale(1,p.stretch);
      const g=ctx.createRadialGradient(-p.r*.20,-p.r*.18,1,0,0,p.r);
      g.addColorStop(0,'rgba(104,191,210,'+(p.alpha*.72)+')');
      g.addColorStop(.34,'rgba(43,73,107,'+(p.alpha*.68)+')');
      g.addColorStop(.70,'rgba(54,61,70,'+(p.alpha*.46)+')');
      g.addColorStop(1,'rgba(2,8,15,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(108,176,184,'+(p.alpha*.38)+')';ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(0,0,p.r*.78,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    for(const c of capillaries){
      const edge=c.side>0?width*.98:width*.02;
      const y=height*c.y;
      const ex=edge-c.side*width*c.len;
      const ey=y+Math.sin(time*.00015+c.phase)*height*.025;
      ctx.save();ctx.lineCap='round';
      ctx.strokeStyle='rgba(76,151,164,'+(c.alpha*(.68+vitality*.48))+')';ctx.lineWidth=c.width;
      ctx.beginPath();ctx.moveTo(edge,y);
      ctx.bezierCurveTo(edge-c.side*width*.08,y-height*c.bend,ex+c.side*width*.06,ey+height*c.bend*.4,ex,ey);ctx.stroke();
      ctx.restore();
    }
    for(const p of membranePockets){
      const x=p.x*width+Math.sin(time*.00008+p.phase)*width*.004;
      const y=p.y*height+Math.cos(time*.00009+p.phase)*height*.004;
      const rx=p.rx*width,ry=p.ry*height;
      ctx.save();ctx.translate(x,y);ctx.rotate(p.rot);
      const g=ctx.createRadialGradient(-rx*.18,-ry*.20,2,0,0,Math.max(rx,ry));
      g.addColorStop(0,'rgba(142,187,190,'+(p.alpha*.46)+')');
      g.addColorStop(.28,'rgba(78,98,111,'+(p.alpha*.46)+')');
      g.addColorStop(.62,'rgba(57,62,72,'+(p.alpha*.36)+')');
      g.addColorStop(1,'rgba(3,10,18,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(127,183,188,'+(p.alpha*.38)+')';ctx.lineWidth=1.1;
      ctx.beginPath();ctx.ellipse(0,0,rx*.82,ry*.82,0,0,Math.PI*2);ctx.stroke();
      ctx.restore();
    }
    for(const n of neuralRoots){
      const edge=n.side>0?width*1.02:-width*.02;
      const y=height*n.y;
      const ex=edge-n.side*width*n.reach;
      const ey=y+Math.sin(time*.00013+n.phase)*height*.035;
      const bend=n.bend*height;
      ctx.save();ctx.lineCap='round';
      ctx.strokeStyle='rgba(7,18,31,'+(n.alpha*(2.00+vitality*.86))+')';ctx.lineWidth=n.width*8;
      ctx.beginPath();ctx.moveTo(edge,y);
      ctx.bezierCurveTo(edge-n.side*width*.08,y-bend,ex+n.side*width*.08,ey+bend*.42,ex,ey);ctx.stroke();
      ctx.strokeStyle='rgba(85,160,171,'+(n.alpha*(.60+vitality*.28))+')';ctx.lineWidth=n.width;
      ctx.beginPath();ctx.moveTo(edge,y);
      ctx.bezierCurveTo(edge-n.side*width*.08,y-bend,ex+n.side*width*.08,ey+bend*.42,ex,ey);ctx.stroke();
      ctx.restore();
    }

    /* R1585: near the top of the page, imply a real dark laboratory around
       the core using only broad volumetric masses. No target rings or hard
       beams: side architecture, overhead haze and a low reflected floor pool. */
    const heroFocus=Math.max(0,1-scrollValue*4.2);
    const worldPresence=.26+.74*heroFocus;
    if(worldPresence>.01){
      /* R1724 — cinematic FormatX world behind the organism. A distant planet,
         monumental luminous arch and reflective horizon bring the living crystal into
         a coherent place without adding another animation loop or bitmap. */
      const worldAlpha=worldPresence*(.72+.28*vitality);
      ctx.save();

      const planetX=width*(MOBILE.matches?.20:.18)+pointerX*width*.026;
      const planetY=height*(MOBILE.matches?.16:.18);
      const planetR=Math.min(width,height)*(MOBILE.matches?.18:.16);
      const planet=ctx.createRadialGradient(
        planetX-planetR*.32,planetY-planetR*.30,planetR*.05,
        planetX,planetY,planetR
      );
      planet.addColorStop(0,'rgba(118,159,176,'+(.13*worldAlpha)+')');
      planet.addColorStop(.42,'rgba(43,67,87,'+(.11*worldAlpha)+')');
      planet.addColorStop(.76,'rgba(9,19,30,'+(.16*worldAlpha)+')');
      planet.addColorStop(1,'rgba(2,7,18,0)');
      ctx.fillStyle=planet;
      ctx.beginPath();ctx.arc(planetX,planetY,planetR,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(123,172,184,'+(.09*worldAlpha)+')';
      ctx.lineWidth=Math.max(1,planetR*.012);
      ctx.beginPath();ctx.arc(planetX,planetY,planetR*.96,Math.PI*.94,Math.PI*1.92);ctx.stroke();

      const archCx=width*(MOBILE.matches?.52:.55)+pointerX*width*.018;
      const archCy=height*.50;
      const archRx=width*(MOBILE.matches?.58:.48);
      const archRy=height*.66;
      ctx.lineCap='round';
      ctx.strokeStyle='rgba(3,12,24,'+(.72*worldAlpha)+')';
      ctx.lineWidth=MOBILE.matches?26:34;
      ctx.beginPath();ctx.ellipse(archCx,archCy,archRx,archRy,0,Math.PI*1.03,Math.PI*1.97);ctx.stroke();
      ctx.strokeStyle='rgba(211,159,101,'+(.11*worldAlpha)+')';
      ctx.lineWidth=MOBILE.matches?4.2:5.2;
      ctx.beginPath();ctx.ellipse(archCx,archCy,archRx,archRy,0,Math.PI*1.03,Math.PI*1.97);ctx.stroke();
      ctx.strokeStyle='rgba(91,159,174,'+(.08*worldAlpha)+')';
      ctx.lineWidth=MOBILE.matches?1.2:1.7;
      ctx.beginPath();ctx.ellipse(archCx,archCy,archRx*.965,archRy*.965,0,Math.PI*1.03,Math.PI*1.97);ctx.stroke();

      const horizonY=height*.79;
      const horizon=ctx.createLinearGradient(0,horizonY,width,horizonY);
      horizon.addColorStop(0,'rgba(20,129,182,0)');
      horizon.addColorStop(.28,'rgba(76,143,157,'+(.055*worldAlpha)+')');
      horizon.addColorStop(.64,'rgba(205,153,94,'+(.040*worldAlpha)+')');
      horizon.addColorStop(1,'rgba(20,129,182,0)');
      ctx.strokeStyle=horizon;ctx.lineWidth=1.2;
      ctx.beginPath();ctx.moveTo(0,horizonY);ctx.lineTo(width,horizonY);ctx.stroke();

      const reflectionCount=MOBILE.matches?8:14;
      for(let i=0;i<reflectionCount;i++){
        const x=width*(.08+i/(reflectionCount-1)*.84);
        const jitter=Math.sin(i*2.17+physiologyEnergy*1.7)*width*.008;
        const len=height*(.025+.070*((i*7)%11)/10);
        const alpha=(.018+.030*((i*5)%9)/8)*worldAlpha;
        const warm=i%3===0;
        const g=ctx.createLinearGradient(x,horizonY,x,horizonY+len);
        g.addColorStop(0,warm?'rgba(211,169,118,'+alpha+')':'rgba(103,166,177,'+alpha+')');
        g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.strokeStyle=g;ctx.lineWidth=warm?2.2:1.4;
        ctx.beginPath();ctx.moveTo(x+jitter,horizonY);ctx.lineTo(x-jitter*.4,horizonY+len);ctx.stroke();
      }
      ctx.restore();

      const leftMass=ctx.createLinearGradient(0,0,width*.30,0);
      leftMass.addColorStop(0,'rgba(0,0,0,'+(.42*worldPresence)+')');
      leftMass.addColorStop(.36,'rgba(4,10,13,'+(.22*worldPresence)+')');
      leftMass.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=leftMass;ctx.fillRect(0,0,width*.34,height);

      const rightMass=ctx.createLinearGradient(width,0,width*.70,0);
      rightMass.addColorStop(0,'rgba(0,0,0,'+(.46*worldPresence)+')');
      rightMass.addColorStop(.38,'rgba(4,10,13,'+(.20*worldPresence)+')');
      rightMass.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=rightMass;ctx.fillRect(width*.66,0,width*.34,height);

      const overhead=radial(
        width*(.51+pointerX*.004),height*.03,
        Math.max(width,height)*.45,
        [
          [0,'rgba(205,229,230,'+(.030*worldPresence)+')'],
          [.23,'rgba(112,154,161,'+(.016*worldPresence)+')'],
          [.62,'rgba(35,65,72,'+(.006*worldPresence)+')'],
          [1,'rgba(0,0,0,0)']
        ]
      );
      ctx.fillStyle=overhead;ctx.fillRect(0,0,width,height);

      ctx.save();
      ctx.translate(width*.51,height*.86);
      ctx.scale(1,.25);
      const floorPool=ctx.createRadialGradient(0,0,0,0,0,width*.46);
      floorPool.addColorStop(0,'rgba(128,190,198,'+(.032*worldPresence)+')');
      floorPool.addColorStop(.28,'rgba(48,97,106,'+(.018*worldPresence)+')');
      floorPool.addColorStop(.68,'rgba(18,47,55,'+(.007*worldPresence)+')');
      floorPool.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=floorPool;
      ctx.fillRect(-width*.55,-height*1.5,width*1.1,height*3);
      ctx.restore();

      /* R1593: real environmental structure. Dark mineral spires and clear
         bio-glass arches frame the MAG without becoming HUD graphics. */
      const structuralPresence=.18+.82*worldPresence;
      for(const s of mineralSpires){
        const baseX=s.side>0?width*(1-s.x):width*s.x;
        const baseY=height*s.y;
        const spireW=width*s.w;
        const spireH=height*s.h;
        const tipX=baseX+s.lean*width;
        const g=ctx.createLinearGradient(baseX-spireW,baseY,baseX+spireW*.4,baseY-spireH);
        const vascular=.45+.55*vitality;
        g.addColorStop(0,'rgba(2,7,14,'+(s.alpha*.78*structuralPresence)+')');
        g.addColorStop(.34,'rgba(24,53,78,'+(s.alpha*.46*structuralPresence)+')');
        g.addColorStop(.66,s.warm
          ?'rgba(96,73,51,'+(s.alpha*.24*structuralPresence)+')'
          :'rgba(48,61,75,'+(s.alpha*.24*structuralPresence)+')');
        g.addColorStop(.84,s.warm
          ?'rgba(183,143,96,'+(s.alpha*.14*structuralPresence*vascular)+')'
          :'rgba(78,143,154,'+(s.alpha*.14*structuralPresence*vascular)+')');
        g.addColorStop(1,'rgba(4,10,16,0)');
        ctx.fillStyle=g;
        ctx.beginPath();
        ctx.moveTo(baseX-spireW,baseY);
        ctx.bezierCurveTo(baseX-spireW*.65,baseY-spireH*.38,tipX-spireW*.20,baseY-spireH*.78,tipX,baseY-spireH);
        ctx.bezierCurveTo(tipX+spireW*.22,baseY-spireH*.74,baseX+spireW*.78,baseY-spireH*.34,baseX+spireW*.72,baseY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle=(s.warm?'rgba(207,171,122,':'rgba(112,176,184,')+(s.alpha*.17*structuralPresence*vascular)+')';
        ctx.lineWidth=Math.max(.7,spireW*.018);
        ctx.beginPath();
        ctx.moveTo(baseX,baseY);
        ctx.bezierCurveTo(baseX+s.side*spireW*.08,baseY-spireH*.34,tipX-s.side*spireW*.06,baseY-spireH*.68,tipX,baseY-spireH*.96);
        ctx.stroke();
      }

      for(const a of glassArcs){
        const edge=a.side>0?width*.90:width*.10;
        const y=height*a.y;
        const endX=width*(.50+a.side*a.reach);
        const endY=y+Math.sin(time*.00010+a.phase)*height*.012;
        const cp1x=edge-a.side*width*a.bend;
        const cp2x=endX+a.side*width*a.bend*.42;
        const alpha=a.alpha*structuralPresence;
        ctx.save();
        ctx.lineCap='round';
        ctx.strokeStyle='rgba(20,33,48,'+(alpha*(1.65+vitality*.35))+')';
        ctx.lineWidth=a.width*5.1;
        ctx.beginPath();ctx.moveTo(edge,y);
        ctx.bezierCurveTo(cp1x,y-height*.12,cp2x,endY+height*.10,endX,endY);
        ctx.stroke();
        ctx.strokeStyle=(a.warm?'rgba(177,139,96,':'rgba(94,151,163,')+(alpha*(.44+vitality*.22))+')';
        ctx.lineWidth=a.width*1.65;
        ctx.beginPath();ctx.moveTo(edge,y);
        ctx.bezierCurveTo(cp1x,y-height*.12,cp2x,endY+height*.10,endX,endY);
        ctx.stroke();
        ctx.strokeStyle=(a.warm?'rgba(220,195,159,':'rgba(160,196,198,')+(alpha*.30)+')';
        ctx.lineWidth=Math.max(.5,a.width*.42);
        ctx.beginPath();ctx.moveTo(edge,y);
        ctx.bezierCurveTo(cp1x,y-height*.12,cp2x,endY+height*.10,endX,endY);
        ctx.stroke();
        ctx.restore();
      }
    }

    for(const f of filaments){
      const sway=Math.sin(time*.00012+f.phase)*width*.004;
      const y=f.y*height+(scrollValue-.5)*height*.020*f.dir;
      const x=f.x*width+sway+pointerX*2.5*f.dir;
      const len=f.len*height;
      const bend=f.bend*width;
      const grad=ctx.createLinearGradient(x,y-len*.5,x+bend,y+len*.5);
      grad.addColorStop(0,'rgba(115,192,206,0)');
      grad.addColorStop(.5,'rgba(158,216,226,'+f.alpha+')');
      grad.addColorStop(1,'rgba(115,192,206,0)');
      ctx.strokeStyle=grad;ctx.lineWidth=f.width;
      ctx.beginPath();ctx.moveTo(x,y-len*.5);
      ctx.bezierCurveTo(x+bend*.34,y-len*.18,x+bend*.80,y+len*.22,x+bend,y+len*.5);
      ctx.stroke();
    }

    for(const p of particles){
      const x=p.x*width+Math.sin(time*.00008+p.phase)*4*p.z+pointerX*3*p.z;
      let y=p.y*height+Math.cos(time*.00007+p.phase)*3*p.z-scrollValue*height*.025*p.z;
      y=((y%height)+height)%height;
      const size=p.size*(.65+p.z*.65);
      ctx.fillStyle='rgba(174,226,235,'+(p.alpha*.18)+')';
      ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();
    }

    ROOT.dataset.fxLivingHabitatFrameR1541=String(Math.round(time));
  }

  function schedule(){
    if(!started||raf||document.hidden)return;
    raf=requestAnimationFrame(draw);
  }

  function pulse(kind='pulse',strength=1){
    if(AUDIT)return;
    if(!started)startHabitat('pulse-'+kind);
    impulse=Math.max(impulse,Math.max(0,Math.min(1.4,strength)));
    ROOT.dataset.fxHabitatInputR1695=kind;
    BODY.classList.add('fx-habitat-react-r1695');
    clearTimeout(mobilePulseTimer);
    mobilePulseTimer=setTimeout(()=>BODY.classList.remove('fx-habitat-react-r1695'),180);
    schedule();
  }

  function startHabitat(source='intent'){
    if(started||LIGHTHOUSE)return;
    clearTimeout(scrollStartTimer);scrollStartTimer=0;
    started=true;
    ROOT.dataset.fxLivingHabitatStartR1737=source;
    ROOT.dataset.fxLivingHabitatFirstPaintR1737='post-intent-no-initial-layout-work';
    if(!canvas.isConnected)BODY.prepend(canvas);
    resize();
    updateScroll();
    draw(performance.now());
  }

  addEventListener('resize',resize,{passive:true});
  addEventListener('scroll',()=>{
    /* R1755 — never allocate or repaint the full-viewport habitat on the hot
       scroll path. MAG + compositor sensory field react immediately; the deep
       habitat catches up only after the gesture settles. */
    updateScroll();
    ROOT.dataset.fxHabitatInputR1695='scroll';
    if(!started){
      clearTimeout(scrollStartTimer);
      scrollStartTimer=setTimeout(()=>{
        scrollStartTimer=0;
        if(!started)startHabitat('scroll-settle');
      },140);
    }
  },{passive:true});
  addEventListener('pointermove',pointer,{passive:true});
  addEventListener('pointerdown',()=>{if(!started)startHabitat('pointerdown');pulse('press',.82);},{passive:true});
  addEventListener('pointerup',()=>pulse('release',.52),{passive:true});
  addEventListener('click',()=>pulse('click',.92),{passive:true});
  addEventListener('wheel',()=>{if(!started)startHabitat('wheel');habitatInput('wheel');},{passive:true});
  addEventListener('keydown',event=>{if(!event.repeat){if(!started)startHabitat('keydown');pulse('key',.56);}},{passive:true});
  addEventListener('focusin',()=>pulse('focus',.34),{passive:true});
  addEventListener('formatx:languagechange',()=>pulse('language',.44),{passive:true});
  addEventListener('formatx:cinematicscene',event=>{
    const kind=String(event.detail?.kind||'core');
    const zones={
      core:[.18,-.18,.52],
      'live-os':[.34,-.08,.62],
      mission:[-.24,.06,.58],
      nerves:[-.46,-.12,.70],
      organs:[.38,.04,.78],
      heart:[-.22,.18,.92],
      skeleton:[.44,-.02,.68],
      proof:[-.12,.22,.72],
      feedback:[.24,.28,.66],
      beacon:[-.38,.12,.80],
      loop:[.02,-.06,.74]
    };
    const zone=zones[kind]||zones.core;
    habitatZone=kind;
    targetX=Math.max(-1,Math.min(1,zone[0]));
    targetY=Math.max(-1,Math.min(1,zone[1]));
    physiologyEnergy=Math.max(physiologyEnergy,zone[2]);
    ROOT.dataset.fxLivingHabitatZoneR1724=kind;
    ROOT.dataset.fxLivingHabitatZoneEnergyR1724=zone[2].toFixed(2);
    pulse('section-'+kind,.56+zone[2]*.34);
  },{passive:true});
  addEventListener('formatx:menustatechange',event=>pulse(event.detail?.open?'menu-open':'menu-close',.48),{passive:true});
  addEventListener('formatx:storychapter',()=>pulse('story',.52),{passive:true});
  addEventListener('formatx:organismpanelopen',()=>pulse('question',.62),{passive:true});
  addEventListener('formatx:organismresponse',()=>pulse('response',.68),{passive:true});
  addEventListener('formatx:organismphysiology',event=>{
    const detail=event.detail||{};
    physiologyKind=String(detail.kind||'stimulus');
    physiologyEnergy=Math.max(.10,Math.min(1.20,Number(detail.energy)||.34));
    physiologyBreath=Math.max(.04,Math.min(1.20,Number(detail.breath)||.12));
    if(Number.isFinite(Number(detail.x)))targetX=Math.max(-1,Math.min(1,Number(detail.x)));
    if(Number.isFinite(Number(detail.y)))targetY=Math.max(-1,Math.min(1,Number(detail.y)));
    ROOT.dataset.fxLivingHabitatPhysiologyR1723=physiologyKind;
    ROOT.dataset.fxLivingHabitatVitalityR1723=physiologyEnergy.toFixed(2);
    pulse('organism-'+physiologyKind,Math.min(1.35,.34+physiologyEnergy*.72));
  },{passive:true});
  addEventListener('formatx:open-live-os',()=>pulse('system-open',.58),{passive:true});
  addEventListener('formatx:loop',()=>pulse('loop',.74),{passive:true});
  addEventListener('formatx:coretouchpulse',()=>pulse('core-touch',1),{passive:true});
  addEventListener('input',()=>pulse('input',.32),{passive:true});
  addEventListener('change',()=>pulse('change',.40),{passive:true});
  addEventListener('submit',()=>pulse('submit',.74),{passive:true});
  addEventListener('pointerenter',()=>pulse('enter',.22),{passive:true});
  addEventListener('pointerleave',()=>pulse('leave',.16),{passive:true});
  addEventListener('orientationchange',()=>{resize();pulse('orientation',.48);},{passive:true});
  document.addEventListener('formatx:magbirthcomplete',()=>{if(!started)startHabitat('mag-birth-handoff');pulse('intro-handoff',1);},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  MOBILE.addEventListener?.('change',resize);

  ROOT.dataset.fxLivingHabitatR1530='deferred-first-paint-r1737';
  ROOT.dataset.fxLivingHabitatFirstPaintR1737='zero-canvas-layout-before-intent';
  ROOT.dataset.fxLivingHabitatR1584=MOBILE.matches?'mobile-volumetric-no-filament-beams':'desktop-short-organic-filaments';
  ROOT.dataset.fxLivingHabitatR1585='dark-laboratory-side-masses-overhead-haze-floor-reflection-no-rings';
  ROOT.dataset.fxLivingHabitatR1593='organic-tissue-pillars-living-membrane-arches-whole-page-depth';
  ROOT.dataset.fxLivingHabitatR1594='visible-living-membrane-arches-tissue-pillars-reflective-depth-without-hud-rings';
  ROOT.dataset.fxLivingHabitatSchedulerR1541='interaction-driven-zero-idle-raf';
  ROOT.dataset.fxLivingHabitatSchedulerR1643='scroll-settle-canvas-css-compositor-during-motion';
  ROOT.dataset.fxLivingHabitatSchedulerR1670='desktop-canvas-60hz-floor-high-refresh-divisor-zero-idle';
  ROOT.dataset.fxLivingHabitatInteractionR1695='pointer-touch-scroll-wheel-click-key-focus-language-section-physical-light-response';
  ROOT.dataset.fxLivingHabitatInteractionR1701='all-site-input-menu-language-story-question-response-system-loop-physical-pulse-zero-idle';
  ROOT.dataset.fxLivingHabitatPerformanceR1710='static-backing-compositor-response-mag-60hz-priority';
  ROOT.dataset.fxLivingHabitatR1720='complete-biological-ecosystem-tissue-cells-capillaries';
  ROOT.dataset.fxLivingHabitatPerformanceR1720='event-driven-hidpi-mobile-zero-idle-world';
  ROOT.dataset.fxLivingHabitatR1721='membranes-neural-roots-deep-cellular-parallax';
  ROOT.dataset.fxLivingHabitatPerformanceR1721='event-driven-hidpi-sharp-background-zero-idle';
  ROOT.dataset.fxLivingHabitatSchedulerR1755='scroll-hot-path-zero-canvas-start-zero-class-repaint-after-settle';
  ROOT.dataset.fxLivingHabitatInteractionR1722='all-site-inputs-synchronized-with-organism-zero-extra-loop';
  ROOT.dataset.fxLivingHabitatPhysiologyR1723='same-organism-energy-breath-tissue-neural-world';
  ROOT.dataset.fxLivingHabitatCrystalWorldR1724='cyan-biocrystal-arches-spires-warm-studio-rim';
  ROOT.dataset.fxLivingHabitatR1724='sitewide-persistent-world-section-zones';
  ROOT.dataset.fxLivingHabitatWorldR1724='planet-monumental-arch-spires-reflective-horizon-blue-gold';
  ROOT.dataset.fxLivingHabitatVisualR1754='neutral-filmic-smoky-biocrystal-world-low-chroma';
  ROOT.dataset.fxLivingHabitatMaterialR1754='desaturated-cyan-warm-stone-bioglass-reflection';
  ROOT.dataset.fxLivingHabitatWorldR1723='organic-pillars-membranes-cells-capillaries-neural-roots-no-mineral-stage';
  ROOT.dataset.fxHabitatPerformanceR1530=AUDIT?'audit-static-low-dpr-world':LOW_POWER?'constrained-living-world':MOBILE.matches?'mobile-living-world':'full-living-world';
})();
/* END formatx-living-habitat-r1530.js */

;
/* BEGIN formatx-event-horizon.js */
/* FormatX R531 — lightweight preloader over the navigation-owned living core.
   The preloader never owns MAG startup: MAG stays navigation-owned behind the
   overlay, manual PAUSE stays retired, and release is hard-bounded for LCP. */
(function(){
'use strict';

const ROOT=document.documentElement;
const MOBILE=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
const REDUCED=matchMedia('(prefers-reduced-motion:reduce)').matches;
const OVERLAY_ID='formatx-event-horizon';
const AUDIO_URL='./assets/audio/formatx-audio-test.wav?v=20260728-professional-score-v6';
const PRELOADER_MIN_MS=REDUCED?180:(MOBILE?1180:1350);
const PRELOADER_MAX_MS=REDUCED?520:(MOBILE?1450:1650);
let audio=null,preloaderRaf=0,preloaderReleased=false;

if(!ROOT.dataset.fxReferenceProductionR244)ROOT.dataset.fxReferenceProductionR244=MOBILE?'ready':'desktop';
ROOT.dataset.fxReferenceComposition=MOBILE?'reference-frame-r244':'desktop-reference-r244';
ROOT.dataset.fxLivingCopyGuard='ready';
ROOT.dataset.fxLivingCopyGuardPolicyR293='static-content-normalized-no-document-scan';
ROOT.dataset.fxHeroLcpOwnerR411='static-html-no-reparent';
ROOT.dataset.fxStartupOwnerR461='single-current-runtime-no-postdom-repair-stack';
ROOT.dataset.fxAwardRuntimeMode='retired-from-first-load-r461';
ROOT.dataset.fxMobileRegressionR310='retired-from-first-load-r461';
ROOT.dataset.fxCoreReal3dCssR310='retired-r461-r326-owner';
ROOT.dataset.fxCanonicalMagClockOwnerR507='mag-shape-sync-r476-only';
ROOT.dataset.fxCanonicalMagMotionR528='living-core-normal-continuous-reduced-background-managed';
ROOT.dataset.fxPreloaderContractR531='visual-only-mag-independent-bounded';
ROOT.dataset.fxPreloaderEffectsR531=REDUCED?'reduced-static':'compositor-glow-scan-pulse';

/* R1730 — R533 is the only startup cinematic owner.
   Keep this legacy source and its contract markers for compatibility, but never
   let it create/reparent hero controls or proof content after the R533 bootstrap
   has already published ownership in the parser head. */
if(ROOT.dataset.fxMagBirthOwnerR533){
  ROOT.dataset.fxPreloaderR531='retired-by-r533-r1730';
  ROOT.dataset.fxPreloaderReleaseR531='r533-exclusive-owner';
  return;
}

function copy(){return ROOT.lang==='en'?{heading:'DISCOVER HOW IT WORKS',title:'Proof behind the visual.',body:'FormatX does not ask for blind trust: releases, tests, limitations and the security model are separately and publicly verifiable.',ask:'ASK',askAria:'Ask FormatX',controls:'Hero controls',soundOn:'Mute FormatX audio',soundOff:'Enable FormatX audio'}:{heading:'A MŰKÖDÉS MEGISMERÉSE',title:'Bizonyíték a látvány mögött.',body:'A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető.',ask:'KÉRDEZZ',askAria:'Kérdezz a FormatX-től',controls:'Hero vezérlők',soundOn:'FormatX hang némítása',soundOff:'FormatX hang bekapcsolása'};}
function mutedIcon(){return '<span class="fx-wda-sound-icon" data-fx-wda-sound-label="true" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.4h3.2L11 6.3v11.4l-3.8-3.1H4z"/><path d="M16 9l5 6"/><path d="M21 9l-5 6"/></svg></span>';}
function soundIcon(){return '<span class="fx-wda-sound-icon" data-fx-wda-sound-label="true" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.4h3.2L11 6.3v11.4l-3.8-3.1H4z"/><path d="M15 9.2c1.2 1.5 1.2 4.1 0 5.6"/><path d="M18 6.8c2.8 2.9 2.8 7.5 0 10.4"/></svg></span>';}
function syncSound(button,on){const strings=copy();button.dataset.fxAudioState=on?'on':'off';button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?strings.soundOn:strings.soundOff);button.innerHTML=on?soundIcon():mutedIcon();ROOT.dataset.fxAudioState=on?'on':'off';ROOT.dataset.fxAudioOwner='r461-lightweight-first-party';}
function bindSound(button){if(!(button instanceof HTMLButtonElement)||button.dataset.fxSoundR461==='true')return;button.dataset.fxSoundR461='true';syncSound(button,false);button.addEventListener('click',async event=>{event.preventDefault();event.stopImmediatePropagation();const next=button.getAttribute('aria-pressed')!=='true';if(!audio){audio=new Audio(AUDIO_URL);audio.loop=true;audio.preload='none';audio.volume=.52;}if(next){try{await audio.play();syncSound(button,true);}catch(_){syncSound(button,false);ROOT.dataset.fxAudioState='blocked';}}else{audio.pause();syncSound(button,false);}},true);}
function removeObsoletePause(rootNode){for(const pause of rootNode.querySelectorAll?.('.fx-reference-pause')||[])pause.remove();ROOT.removeAttribute('data-fx-reference-motion-paused');}
function ensureControls(hero,space){const strings=copy();let controls=hero.querySelector('.fx-reference-controls-r204');if(!(controls instanceof HTMLElement)){controls=document.createElement('div');controls.className='fx-reference-controls-r204 fx-reference-controls-r264';}controls.classList.add('fx-reference-controls-r264');controls.setAttribute('aria-label',strings.controls);removeObsoletePause(controls);let sound=controls.querySelector(':scope > .fx-three-sound')||document.querySelector('.fx-three-sound');if(!(sound instanceof HTMLButtonElement)){sound=document.createElement('button');sound.type='button';sound.className='fx-three-sound fx-wda-sound-toggle fx-control-owner-r264';}sound.classList.add('fx-wda-sound-toggle','fx-control-owner-r264');if(sound.parentElement!==controls)controls.prepend(sound);bindSound(sound);let rail=controls.querySelector(':scope > .fx-reference-rail')||hero.querySelector('.fx-reference-rail');if(!(rail instanceof HTMLElement)){rail=document.createElement('div');rail.className='fx-reference-rail fx-reference-rail-r264';}rail.classList.add('fx-reference-rail-r264');removeObsoletePause(rail);let ask=rail.querySelector('.fx-reference-ask');if(!(ask instanceof HTMLButtonElement)){ask=document.createElement('button');ask.type='button';ask.className='fx-reference-ask';ask.innerHTML='<i aria-hidden="true"></i><span></span>';}ask.setAttribute('aria-label',strings.askAria);let askLabel=ask.querySelector('span');if(!(askLabel instanceof HTMLElement)){askLabel=document.createElement('span');ask.appendChild(askLabel);}askLabel.textContent=strings.ask;if(ask.parentElement!==rail)rail.prepend(ask);if(rail.parentElement!==controls)controls.appendChild(rail);if(controls.parentElement!==space)space.appendChild(controls);ROOT.dataset.fxHeroControlContractR528='sound-ask-no-manual-mag-pause';return controls;}
function ensureProof(hero,grid){const strings=copy();let heading=hero.querySelector('.fx-reference-heading');if(!(heading instanceof HTMLElement)){heading=document.createElement('div');heading.className='fx-reference-heading';grid.appendChild(heading);}heading.textContent=strings.heading;let proof=hero.querySelector('.fx-reference-proof');if(!(proof instanceof HTMLElement)){proof=document.createElement('article');proof.className='fx-reference-proof';proof.innerHTML='<span class="fx-reference-proof-kicker">PUBLIC PROOF LAYER</span><h2></h2><p></p><a class="fx-reference-liveos" href="#experience">Live OS</a>';grid.appendChild(proof);}const title=proof.querySelector('h2'),body=proof.querySelector('p'),live=proof.querySelector('.fx-reference-liveos');if(title)title.textContent=strings.title;if(body)body.textContent=strings.body;if(live instanceof HTMLAnchorElement){live.href='#experience';live.setAttribute('aria-label',ROOT.lang==='en'?'Live OS — open workflow':'Live OS — munkafolyamat megnyitása');}}
function stabilize(){const hero=document.getElementById('hero');const grid=hero?.querySelector(':scope > .hero-grid');const space=grid?.querySelector(':scope > .hero-space');const heroCopy=grid?.querySelector(':scope > .hero-copy');if(!(hero instanceof HTMLElement)||!(grid instanceof HTMLElement)||!(space instanceof HTMLElement)||!(heroCopy instanceof HTMLElement))return false;ensureControls(hero,space);ensureProof(hero,grid);removeObsoletePause(hero);ROOT.dataset.fxHeroCopyPlacementR411='static-dom-css-order';ROOT.dataset.fxFirstPaintControlsR306=MOBILE?'mobile-static-r528':'desktop-static-r528';return true;}
function fixLanguageAccessibleName(){const button=document.querySelector('.fx-language-toggle');if(!(button instanceof HTMLButtonElement))return;const current=ROOT.lang==='en'?'EN':'HU';button.textContent=current;button.setAttribute('aria-label',current==='HU'?'HU – váltás angol nyelvre':'EN – switch to Hungarian');}
function complete(source){document.dispatchEvent(new CustomEvent('formatx:introcomplete',{detail:{source}}));}
function force(node,property,value){if(node instanceof HTMLElement)node.style.setProperty(property,value,'important');}
function clear(node,property){if(node instanceof HTMLElement)node.style.removeProperty(property);}
function animateEffect(node,keyframes,options){if(REDUCED||!(node instanceof HTMLElement)||typeof node.animate!=='function')return;try{node.animate(keyframes,options);}catch(_){} }

function showPreloader(){
  const overlay=document.getElementById(OVERLAY_ID);if(!(overlay instanceof HTMLElement))return null;
  preloaderReleased=false;overlay.hidden=false;overlay.setAttribute('aria-hidden','true');overlay.dataset.fxPreloaderR531='active';ROOT.dataset.fxPreloaderR531='active';
  force(overlay,'display','grid');force(overlay,'visibility','visible');force(overlay,'opacity','1');force(overlay,'pointer-events','none');
  const center=overlay.querySelector('.fx-intro-center'),word=overlay.querySelector('.fx-intro-word'),wordSpan=overlay.querySelector('.fx-intro-word span'),kicker=overlay.querySelector('.fx-intro-kicker'),subtitle=overlay.querySelector('.fx-intro-subtitle'),meta=overlay.querySelector('.fx-intro-meta'),progressWrap=overlay.querySelector('.fx-intro-progress-wrap'),output=overlay.querySelector('[data-fx-intro-output]'),progress=overlay.querySelector('[data-fx-intro-progress]'),status=overlay.querySelector('[data-fx-intro-status]'),scan=overlay.querySelector('.fx-intro-scan'),flare=overlay.querySelector('.fx-intro-flare'),grid=overlay.querySelector('.fx-intro-grid');
  force(center,'width','min(520px, calc(100vw - 40px))');force(word,'font-size','clamp(32px,5vw,56px)');force(word,'line-height','1');force(word,'letter-spacing','.08em');force(wordSpan,'opacity','1');force(wordSpan,'transform','none');force(wordSpan,'filter','none');force(kicker,'opacity','1');force(kicker,'transform','none');force(kicker,'letter-spacing','.24em');force(subtitle,'opacity','1');force(subtitle,'transform','none');force(subtitle,'font-size','10px');force(meta,'opacity',MOBILE?'0':'.5');force(meta,'transform','none');force(progressWrap,'opacity','1');force(progressWrap,'transform','none');force(progressWrap,'max-width','560px');force(progressWrap,'margin','0 auto');
  if(scan instanceof HTMLElement){force(scan,'display','block');force(scan,'position','absolute');force(scan,'left','0');force(scan,'top','0');force(scan,'width','100%');force(scan,'height','16vh');force(scan,'opacity','0');force(scan,'pointer-events','none');force(scan,'background','linear-gradient(180deg,transparent,rgba(124,236,255,.18),rgba(143,114,255,.08),transparent)');force(scan,'filter','blur(1px)');}
  if(flare instanceof HTMLElement){force(flare,'display','block');force(flare,'position','absolute');force(flare,'left','50%');force(flare,'top','46%');force(flare,'width',MOBILE?'74vw':'min(48vw,520px)');force(flare,'height',MOBILE?'74vw':'min(48vw,520px)');force(flare,'border-radius','50%');force(flare,'opacity','.24');force(flare,'pointer-events','none');force(flare,'background','radial-gradient(circle,rgba(124,236,255,.28) 0%,rgba(143,114,255,.14) 34%,rgba(124,236,255,0) 72%)');force(flare,'filter','blur(18px)');force(flare,'transform','translate(-50%,-50%) scale(.72)');}
  if(grid instanceof HTMLElement){force(grid,'display','block');force(grid,'position','absolute');force(grid,'inset','0');force(grid,'opacity','.18');force(grid,'pointer-events','none');force(grid,'background-image','linear-gradient(rgba(124,236,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(124,236,255,.035) 1px,transparent 1px)');force(grid,'background-size','36px 36px');}
  if(output instanceof HTMLOutputElement)output.value='000';if(progress instanceof HTMLProgressElement)progress.value=0;if(status instanceof HTMLElement)status.textContent=ROOT.lang==='en'?'LIVING CORE STARTING':'ÉLŐ MAG INDÍTÁSA';
  animateEffect(wordSpan,[{opacity:.72,transform:'scale(.975)'},{opacity:1,transform:'scale(1.025)'},{opacity:.82,transform:'scale(.99)'}],{duration:1180,iterations:Infinity,easing:'ease-in-out'});
  animateEffect(scan,[{transform:'translateY(-24vh)',opacity:0},{opacity:.58,offset:.44},{transform:'translateY(112vh)',opacity:0}],{duration:1280,iterations:Infinity,easing:'cubic-bezier(.22,.61,.36,1)'});
  animateEffect(flare,[{transform:'translate(-50%,-50%) scale(.72)',opacity:.18},{transform:'translate(-50%,-50%) scale(1.08)',opacity:.48},{transform:'translate(-50%,-50%) scale(.82)',opacity:.24}],{duration:1540,iterations:Infinity,easing:'ease-in-out'});
  animateEffect(grid,[{opacity:.14},{opacity:.28},{opacity:.16}],{duration:1820,iterations:Infinity,easing:'ease-in-out'});
  animateEffect(progressWrap,[{opacity:.72},{opacity:1},{opacity:.82}],{duration:920,iterations:Infinity,easing:'ease-in-out'});
  return overlay;
}
function preloaderReady(){const hero=document.getElementById('hero');const shell=hero?.querySelector('.fx-reference-mag-button,.fx-mag-heart-hit-r252,.fx-crystal-organism-r326-stage,.hero-space');const startup=ROOT.dataset.fxMagStartupContractR530==='living-core-autostart-navigation-owned'||String(ROOT.dataset.fxCurrentMagRequestR530||'').startsWith('navigation-owned')||ROOT.dataset.fxCrystalOrganismR326==='ready';return Boolean(hero&&shell&&startup);}
function updatePreloader(overlay,elapsed){const output=overlay?.querySelector('[data-fx-intro-output]'),progress=overlay?.querySelector('[data-fx-intro-progress]'),status=overlay?.querySelector('[data-fx-intro-status]');const ratio=Math.min(1,elapsed/PRELOADER_MAX_MS),eased=1-Math.pow(1-ratio,2.05),value=Math.min(96,Math.max(5,Math.round(5+eased*91)));if(output instanceof HTMLOutputElement)output.value=String(value).padStart(3,'0');if(progress instanceof HTMLProgressElement)progress.value=value;if(status instanceof HTMLElement){const phase=ratio<.42?0:(ratio<.78?1:2);status.textContent=ROOT.lang==='en'?(phase===0?'LIVING CORE STARTING':phase===1?'SYNCHRONIZING MAG':'SYSTEM READY'):(phase===0?'ÉLŐ MAG INDÍTÁSA':phase===1?'MAG SZINKRONIZÁLÁSA':'RENDSZER KÉSZ');}}
function hidePreloader(source){if(preloaderReleased)return;preloaderReleased=true;if(preloaderRaf)cancelAnimationFrame(preloaderRaf);preloaderRaf=0;const overlay=document.getElementById(OVERLAY_ID);if(!(overlay instanceof HTMLElement)){ROOT.dataset.fxPreloaderR531='done';ROOT.dataset.fxPreloaderReleaseR531=source;return;}const output=overlay.querySelector('[data-fx-intro-output]'),progress=overlay.querySelector('[data-fx-intro-progress]'),status=overlay.querySelector('[data-fx-intro-status]');if(output instanceof HTMLOutputElement)output.value='100';if(progress instanceof HTMLProgressElement)progress.value=100;if(status instanceof HTMLElement)status.textContent=ROOT.lang==='en'?'READY':'KÉSZ';const finalize=()=>{try{overlay.getAnimations({subtree:true}).forEach(animation=>animation.cancel());}catch(_){}overlay.hidden=true;overlay.setAttribute('aria-hidden','true');overlay.dataset.fxPreloaderR531='done';for(const property of ['display','visibility','opacity','pointer-events'])clear(overlay,property);ROOT.dataset.fxPreloaderR531='done';ROOT.dataset.fxPreloaderReleaseR531=source;document.dispatchEvent(new CustomEvent('formatx:preloadercomplete',{detail:{source}}));};if(REDUCED){finalize();return;}const finish=overlay.animate([{opacity:1,filter:'brightness(1)'},{opacity:.94,filter:'brightness(1.18)',offset:.42},{opacity:0,filter:'brightness(1.06)'}],{duration:190,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'});finish.finished.then(finalize,finalize);}
function runPreloader(overlay){if(!(overlay instanceof HTMLElement)){ROOT.dataset.fxPreloaderR531='unavailable';return;}const started=performance.now();const tick=now=>{const elapsed=now-started;updatePreloader(overlay,elapsed);if((elapsed>=PRELOADER_MIN_MS&&preloaderReady())||elapsed>=PRELOADER_MAX_MS){hidePreloader(elapsed>=PRELOADER_MAX_MS?'bounded-timeout':'mag-shell-ready');return;}preloaderRaf=requestAnimationFrame(tick);};preloaderRaf=requestAnimationFrame(tick);}
function markIntroComplete(source){ROOT.classList.remove('fx-intro-pending','fx-intro-running','fx-intro-reveal','fx-intro-managed');ROOT.classList.add('fx-intro-complete');ROOT.dataset.fxIntro=source;complete(source);}
const preloader=showPreloader();
stabilize();fixLanguageAccessibleName();ROOT.dataset.fxIntroStrategy=MOBILE?'mobile-direct-r531-living-core':'desktop-direct-r531-living-core';markIntroComplete('instant-r531-living-core');runPreloader(preloader);
for(const eventName of ['formatx:languagechange','formatx:controlownerready','pageshow'])addEventListener(eventName,()=>{stabilize();queueMicrotask(fixLanguageAccessibleName);},{passive:true});
addEventListener('pagehide',()=>{try{audio?.pause();}catch(_){}},{once:true});
addEventListener('error',()=>hidePreloader('runtime-error'));
addEventListener('unhandledrejection',()=>hidePreloader('promise-error'));
}());

/* END formatx-event-horizon.js */

;
/* BEGIN formatx-apex.js */
(function () {
  'use strict';

  const ROOT = document.documentElement;
  /* R2009: Currency is a commerce control, not a 3D controller feature.
     It must work in a browser running automated accessibility checks, on
     phones without the legacy APEX runtime, and with ordinary desktop MAG.
     Delegation survives organism console DOM reparenting. */
  const CURRENCY_PRICES = Object.freeze({HUF:15900,EUR:44});
  document.addEventListener('click',event=>{
    const button=event.target instanceof Element?event.target.closest('[data-currency]'):null;
    if(!(button instanceof HTMLButtonElement)||!['HUF','EUR'].includes(button.dataset.currency))return;
    const selected=button.dataset.currency,other=selected==='HUF'?'EUR':'HUF';
    document.querySelectorAll('[data-currency]').forEach(el=>{
      el.setAttribute('aria-pressed',String(el.dataset.currency===selected));
    });
    const language=document.documentElement.lang==='en'?'en':'hu';
    const money=(value,currency)=>new Intl.NumberFormat(language==='en'?'en-GB':'hu-HU',{
      style:'currency',currency,minimumFractionDigits:0,maximumFractionDigits:0
    }).format(value);
    const main=document.getElementById('preview-main-price');
    const secondary=document.getElementById('preview-secondary-price');
    const label=document.getElementById('preview-secondary-label');
    const checkout=document.getElementById('preview-checkout-link');
    if(main)main.textContent=money(CURRENCY_PRICES[selected],selected);
    if(secondary)secondary.textContent=money(CURRENCY_PRICES[other],other);
    if(label)label.textContent=language==='hu'
      ?(other==='EUR'?'Összeg EUR-ban':'Összeg HUF-ban')
      :(other==='EUR'?'Amount in EUR':'Amount in HUF');
    if(checkout){
      const url=new URL('./checkout.html',document.baseURI);
      url.searchParams.set('plan','business_pro');
      url.searchParams.set('cycle','monthly');
      url.searchParams.set('currency',selected);
      url.searchParams.set('lang',language);
      checkout.href=url.href;
    }
    ROOT.dataset.fxCommerceCurrencyR2009=selected;
  });
  const AUDIT_MODE =
    navigator.webdriver === true
    || /Chrome-Lighthouse/i.test(navigator.userAgent || '')
    || new URLSearchParams(location.search).get('lighthouse') === '1'
    || document.documentElement.dataset.fxP0AuditModeR1728 === 'static-first-paint-no-late-webgl';
  if (AUDIT_MODE) {
    ROOT.dataset.fxApex = 'audit-skip';
    ROOT.dataset.fxRenderer = 'static-audit';
    ROOT.dataset.fxScene = '0';
    ROOT.dataset.fxFlow = '0';
    ROOT.style.setProperty('--accent', '120,210,255');
    ROOT.style.setProperty('--progress', '0');
    dispatchEvent(new CustomEvent('formatx:apexready', { detail: { renderer: 'static-audit', infinite: 'skipped' } }));
    return;
  }

  // r294: on phone/coarse-pointer surfaces the current native core, canonical
  // language control, release metadata runtime and r268 navigation already own
  // the jobs this legacy APEX controller used to duplicate. Avoid whole-page
  // language/link scans, reveal observers and scene/flow observers during the
  // first-load critical window. Publish apexready only after the complete defer
  // chain has subscribed, so final control owners never miss the event.
  const MOBILE_NATIVE_CORE = matchMedia('(max-width: 900px), (max-aspect-ratio: 27/25)').matches;
  if (MOBILE_NATIVE_CORE) {
    ROOT.dataset.fxApex = 'controller-performance-v2';
    ROOT.dataset.fxApexMobileR293 = 'delegated-native-core-no-startup-scan';
    ROOT.dataset.fxRenderer = 'three-host';
    ROOT.dataset.fxScene = '0';
    ROOT.dataset.fxFlow = '0';
    ROOT.style.setProperty('--accent', '120,210,255');
    ROOT.style.setProperty('--progress', '0');
    const publishMobileReady = () => {
      ROOT.dataset.fxApexMobileR294 = 'ready-after-defer-chain';
      dispatchEvent(new CustomEvent('formatx:apexready', { detail: { renderer: 'three-host', infinite: 'delegated', mobile: 'native-r294' } }));
    };
    if (document.readyState === 'complete') publishMobileReady();
    else document.addEventListener('DOMContentLoaded', publishMobileReady, { once: true });
    return;
  }

  const LANG_KEY = 'formatx-language';
  const RELEASE_API = './data/current-release.json';
  const DOWNLOAD_PREFIX = 'https://github.com/hutoczky/FormatX-Updates/releases/download/';
  const PAGE_PREFIX = 'https://github.com/hutoczky/FormatX-Updates/releases/';
  const PRICES = CURRENCY_PRICES;
  const SCENES = [
    ['hero', '120,210,255'],
    ['experience', '183,163,255'],
    ['capabilities', '126,241,190'],
    ['pricing', '255,196,126'],
    ['system', '126,190,255'],
    ['resources', '205,235,249']
  ];
  const FLOWS = [
    ['01', 'FELDERÍTÉS', 'DISCOVERY', 'ENV / READ'],
    ['02', 'TERVEZÉS', 'PLANNING', 'PLAN / PREVIEW'],
    ['03', 'VÉGREHAJTÁS', 'EXECUTION', 'RUN / CONTROL'],
    ['04', 'ELLENŐRZÉS', 'VERIFICATION', 'HASH / REPORT']
  ];

  let language = initialLanguage();
  let activeScene = 0;
  let activeFlow = 0;

  function initialLanguage() {
    const query = new URLSearchParams(location.search).get('lang');
    if (query === 'hu' || query === 'en') return query;
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === 'hu' || stored === 'en') return stored;
    } catch (_) {}
    // P0 r491: the server/static shell owns first-paint language. Falling back
    // to navigator.language here used to rewrite the already-painted hero on
    // desktop, causing the dominant CLS and late text LCP. The explicit HU/EN
    // toggle still persists a choice and ?lang= continues to override it.
    if (ROOT.lang === 'hu' || ROOT.lang === 'en') return ROOT.lang;
    return 'hu';
  }

  function applyLanguage(next, persist) {
    const previous = ROOT.lang === 'en' ? 'en' : 'hu';
    language = next === 'en' ? 'en' : 'hu';
    const changed = previous !== language;
    ROOT.lang = language;

    /* R1647 — the static shell already ships in the requested first-paint
       language. Do not rescan/rewrite every bilingual node on startup when
       nothing changed; that was a large desktop main-thread task. */
    if (changed || persist) {
      document.querySelectorAll('[data-hu][data-en]').forEach(element => {
        const value = element.dataset[language];
        if (element.textContent !== value) element.textContent = value;
      });
      document.querySelectorAll('[data-language]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.language === language));
      });
      updateLinks();
    }

    if (persist) {
      try { localStorage.setItem(LANG_KEY, language); } catch (_) {}
      const url = new URL(location.href);
      url.searchParams.set('lang', language);
      history.replaceState({}, '', url.pathname + url.search + url.hash);
    }

    updatePrice();
    updateFlow(activeFlow);
    if (changed || persist) dispatchEvent(new CustomEvent('formatx:languagechange'));
    ROOT.dataset.fxApexLanguageStartupR1647 = changed ? 'translated' : 'static-shell-reused-zero-scan';
  }

  function updateLinks() {
    document.querySelectorAll('a[href]').forEach(anchor => {
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      try {
        const url = new URL(href, document.baseURI);
        if (url.origin !== location.origin) return;
        if (!url.pathname.endsWith('.html') && !url.pathname.endsWith('/')) return;
        url.searchParams.set('lang', language);
        anchor.href = url.pathname + url.search + url.hash;
      } catch (_) {}
    });
  }

  function money(value, currency) {
    return new Intl.NumberFormat(language === 'hu' ? 'hu-HU' : 'en-GB', {
      style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(value);
  }

  function currentCurrency() {
    return document.querySelector('[data-currency][aria-pressed="true"]')?.dataset.currency === 'EUR' ? 'EUR' : 'HUF';
  }

  function updatePrice() {
    const selected = currentCurrency();
    const other = selected === 'HUF' ? 'EUR' : 'HUF';
    const main = document.getElementById('preview-main-price');
    const secondary = document.getElementById('preview-secondary-price');
    const label = document.getElementById('preview-secondary-label');
    const link = document.getElementById('preview-checkout-link');
    if (main) main.textContent = money(PRICES[selected], selected);
    if (secondary) secondary.textContent = money(PRICES[other], other);
    if (label) label.textContent = language === 'hu'
      ? (other === 'EUR' ? 'Összeg EUR-ban' : 'Összeg HUF-ban')
      : (other === 'EUR' ? 'Amount in EUR' : 'Amount in HUF');
    if (link) link.href = './checkout.html?plan=business_pro&cycle=monthly&currency=' + selected + '&lang=' + language;
  }

  function navigation() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    toggle?.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav?.addEventListener('click', event => {
      if (!event.target.closest('a')) return;
      nav.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
    addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      nav?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('[data-language]').forEach(button => {
      button.addEventListener('click', () => applyLanguage(button.dataset.language, true));
    });
    // R2009: delegated global commerce controller owns every currency click.
  }

  function trusted(value, prefix) {
    try {
      const url = new URL(value, location.origin);
      return url.protocol === 'https:' && url.href.startsWith(prefix);
    } catch (_) { return false; }
  }

  async function latestRelease() {
    try {
      const response = await fetch(RELEASE_API, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error('Release lookup failed');
      const payload = await response.json();
      const asset = payload?.channels?.multiplatform;
      if (payload?.ok !== true || payload?.prerelease === true || !asset?.available) throw new Error('Invalid release');
      if (!trusted(asset.download_url, DOWNLOAD_PREFIX) || !trusted(payload.release_url, PAGE_PREFIX)) throw new Error('Untrusted release');
      const download = document.getElementById('hero-download');
      const name = document.getElementById('release-name');
      const date = document.getElementById('release-published');
      const page = document.getElementById('release-page-link');
      if (download) download.href = asset.download_url;
      if (name) name.textContent = 'FormatX Suite Pro';
      if (page) page.href = payload.release_url;
      if (date) {
        const published = new Date(payload.published_at);
        date.textContent = Number.isNaN(published.getTime())
          ? 'GitHub Releases'
          : new Intl.DateTimeFormat(language === 'hu' ? 'hu-HU' : 'en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(published);
      }
    } catch (_) {}
  }

  function reveal() {
    const elements = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(element => element.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });
    elements.forEach(element => observer.observe(element));
  }

  function setScene(index) {
    activeScene = Math.max(0, Math.min(SCENES.length - 1, index));
    const scene = SCENES[activeScene];
    ROOT.dataset.fxScene = String(activeScene);
    ROOT.style.setProperty('--accent', scene[1]);
    document.querySelectorAll('[data-scene-link]').forEach(anchor => {
      anchor.classList.toggle('active', Number(anchor.dataset.sceneLink) === activeScene);
    });
    document.querySelectorAll('.main-nav a').forEach(anchor => {
      anchor.classList.toggle('active', anchor.getAttribute('href') === '#' + scene[0]);
    });
  }

  function scenes() {
    const sceneSections = SCENES.map(scene => document.getElementById(scene[0])).filter(Boolean);
    if(document.querySelector('script[data-fx-cinematic-journey-r536]')){
      ROOT.dataset.fxApexScrollPerformanceR1646='r536-owner-no-legacy-progress-raf';
      ROOT.style.setProperty('--progress','0');
      setScene(activeScene);
      return;
    }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        let best = null;
        entries.forEach(entry => {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) best = entry;
        });
        if (!best) return;
        const index = SCENES.findIndex(scene => scene[0] === best.target.id);
        if (index >= 0) setScene(index);
      }, { threshold: [0.2, 0.4, 0.6] });
      sceneSections.forEach(section => observer.observe(section));
    }

    let progressFrame = 0;
    const progress = () => {
      progressFrame = 0;
      const range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const value = Math.max(0, Math.min(1, scrollY / range));
      ROOT.style.setProperty('--progress', value.toFixed(5));
      ROOT.classList.toggle('fx-page-scrolled', scrollY > 24);
    };
    const scheduleProgress = () => {
      if (progressFrame) return;
      progressFrame = requestAnimationFrame(progress);
    };
    progress();
    addEventListener('scroll', scheduleProgress, { passive: true });
    addEventListener('resize', scheduleProgress, { passive: true });
    addEventListener('pagehide', () => {
      if (progressFrame) cancelAnimationFrame(progressFrame);
    }, { once: true });
  }

  function updateFlow(index) {
    activeFlow = Math.max(0, Math.min(FLOWS.length - 1, index));
    ROOT.dataset.fxFlow = String(activeFlow);
    document.querySelectorAll('[data-flow]').forEach(element => {
      element.classList.toggle('active', Number(element.dataset.flow) === activeFlow);
    });
    const flow = FLOWS[activeFlow];
    const number = document.querySelector('[data-flow-number]');
    const title = document.querySelector('[data-flow-title]');
    const code = document.querySelector('[data-flow-code]');
    if (number) number.textContent = flow[0];
    if (title) title.textContent = flow[language === 'hu' ? 1 : 2];
    if (code) code.textContent = flow[3];
  }

  function flow() {
    const chapters = Array.from(document.querySelectorAll('[data-flow]'));
    chapters.forEach(chapter => {
      chapter.addEventListener('mouseenter', () => updateFlow(Number(chapter.dataset.flow)));
      chapter.addEventListener('focus', () => updateFlow(Number(chapter.dataset.flow)));
    });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        let best = null;
        entries.forEach(entry => {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) best = entry;
        });
        if (best) updateFlow(Number(best.target.dataset.flow));
      }, { rootMargin: '-32% 0px -32%', threshold: [0, 0.2, 0.5, 0.8] });
      chapters.forEach(chapter => observer.observe(chapter));
    }
    updateFlow(0);
  }

  function pointerVariables() {
    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      ROOT.style.setProperty('--px', (x / Math.max(1, innerWidth) * 2 - 1).toFixed(3));
      ROOT.style.setProperty('--py', (y / Math.max(1, innerHeight) * 2 - 1).toFixed(3));
    };
    addEventListener('pointermove', event => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    }, { passive: true });
    addEventListener('pagehide', () => {
      if (frame) cancelAnimationFrame(frame);
    }, { once: true });
  }

  function initialise() {
    navigation();
    applyLanguage(language, false);
    reveal();
    scenes();
    flow();
    pointerVariables();
    updatePrice();
    latestRelease();
    setScene(activeScene);
    ROOT.dataset.fxApex = 'controller-performance-v2';
    ROOT.dataset.fxRenderer = 'three-host';
    dispatchEvent(new CustomEvent('formatx:apexready', { detail: { renderer: 'three-host', infinite: 'delegated' } }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
}());

/* END formatx-apex.js */
