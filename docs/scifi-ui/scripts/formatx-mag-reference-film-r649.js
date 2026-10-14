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
  /* R2107: photographic light-stage for the low-power film. This is the
     REAL fallback that appeared in the user's Android screenshot; improving
     Three.js alone cannot correct it. All surfaces are drawn into the
     existing one canvas, at its existing adaptive pixel budget. */
  function magDiamond(ctx,S){
    ctx.beginPath();
    ctx.moveTo(0,-S*1.21);
    ctx.bezierCurveTo(S*.16,-S*.90,S*.28,-S*.60,S*.43,-S*.45);
    ctx.bezierCurveTo(S*.60,-S*.29,S*.88,-S*.15,S*1.14,0);
    ctx.bezierCurveTo(S*.88,S*.17,S*.60,S*.29,S*.43,S*.47);
    ctx.bezierCurveTo(S*.28,S*.64,S*.16,S*.95,0,S*1.21);
    ctx.bezierCurveTo(-S*.16,S*.95,-S*.28,S*.64,-S*.43,S*.47);
    ctx.bezierCurveTo(-S*.60,S*.29,-S*.88,S*.17,-S*1.14,0);
    ctx.bezierCurveTo(-S*.88,-S*.15,-S*.60,-S*.29,-S*.43,-S*.45);
    ctx.bezierCurveTo(-S*.28,-S*.60,-S*.16,-S*.90,0,-S*1.21);
    ctx.closePath();
  }
  function magArmPath(ctx,S){
    ctx.beginPath();
    ctx.moveTo(0,-S*1.13);
    ctx.lineTo(-S*.35,-S*.43);
    ctx.lineTo(-S*.18,-S*.24);
    ctx.lineTo(S*.18,-S*.24);
    ctx.lineTo(S*.35,-S*.43);
    ctx.closePath();
  }
  function drawMagStudio(ctx,S,time,t){
    const lightSweep=Math.sin(time*.00038);
    const pulse=.50+.50*Math.sin(time*.0024);
    ctx.save();
    ctx.lineJoin='round';ctx.lineCap='round';
    ctx.rotate(-.018+.025*Math.sin(time*.00030));

    // Wide soft atmospheric scatter: present, but never a flat cyan halo.
    const atmosphere=ctx.createRadialGradient(-S*.10,-S*.18,0,0,0,S*1.86);
    atmosphere.addColorStop(0,'rgba(92,153,162,.13)');
    atmosphere.addColorStop(.35,'rgba(46,103,116,.075)');
    atmosphere.addColorStop(.78,'rgba(10,34,48,.045)');
    atmosphere.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=atmosphere;
    ctx.fillRect(-S*1.95,-S*1.95,S*3.90,S*3.90);

    // Extruded silhouette: physically separates the object from the void.
    ctx.save();
    ctx.shadowColor='rgba(3,8,14,.96)';ctx.shadowBlur=S*.28;
    ctx.translate(S*.070,S*.092);
    magDiamond(ctx,S);ctx.fillStyle='#01080f';ctx.fill();
    ctx.restore();
    for(let layer=5;layer>=1;layer--){
      ctx.save();ctx.translate(S*.007*layer,S*.010*layer);
      magDiamond(ctx,S);
      ctx.fillStyle=layer>3?'#07141d':'#142731';ctx.fill();
      ctx.restore();
    }
    magDiamond(ctx,S);
    const hull=ctx.createLinearGradient(-S*.90+S*.09*lightSweep,-S*1.05,S*.94+S*.09*lightSweep,S*1.03);
    hull.addColorStop(0,'#819498');
    hull.addColorStop(.14,'#3b555e');
    hull.addColorStop(.37,'#182c36');
    hull.addColorStop(.57,'#07141c');
    hull.addColorStop(.80,'#324953');
    hull.addColorStop(1,'#0b1823');
    ctx.fillStyle=hull;ctx.fill();
    ctx.save();magDiamond(ctx,S);ctx.clip();

    // Four radial sculpted arms. The opposing faces have different normals,
    // highlights, inset mechanical recesses and actual cross-facet shadows.
    for(let arm=0;arm<4;arm++){
      ctx.save();ctx.rotate(arm*Math.PI*.5);
      const even=(arm%2===0);
      magArmPath(ctx,S);
      const slab=ctx.createLinearGradient(-S*.37,-S*.72,S*.38,-S*.30);
      slab.addColorStop(0,even?'#91a7a7':'#4d666b');
      slab.addColorStop(.17,even?'#425e65':'#294450');
      slab.addColorStop(.49,'#132833');
      slab.addColorStop(.66,even?'#263e48':'#0b1f2b');
      slab.addColorStop(1,'#04111a');
      ctx.fillStyle=slab;ctx.fill();

      // Face break-line creates true directional visual relief.
      ctx.beginPath();
      ctx.moveTo(-S*.34,-S*.43);
      ctx.lineTo(0,-S*1.10);
      ctx.lineTo(-S*.040,-S*.33);
      ctx.lineTo(-S*.16,-S*.25);
      ctx.closePath();
      const bevel=ctx.createLinearGradient(-S*.27,-S*.61,S*.01,-S*.61);
      bevel.addColorStop(0,'rgba(204,224,221,.38)');
      bevel.addColorStop(.60,'rgba(70,115,123,.18)');
      bevel.addColorStop(1,'rgba(8,21,31,.13)');
      ctx.fillStyle=bevel;ctx.fill();

      ctx.beginPath();
      ctx.moveTo(S*.35,-S*.43);
      ctx.lineTo(0,-S*1.10);
      ctx.lineTo(S*.045,-S*.33);
      ctx.lineTo(S*.18,-S*.25);
      ctx.closePath();
      ctx.fillStyle='rgba(1,12,22,.32)';ctx.fill();

      // Machined arm insert: two actual offset channels with small bevels.
      ctx.beginPath();
      ctx.moveTo(-S*.153,-S*.48);
      ctx.lineTo(-S*.046,-S*.88);
      ctx.quadraticCurveTo(-S*.025,-S*.90,-S*.015,-S*.87);
      ctx.lineTo(-S*.074,-S*.45);
      ctx.strokeStyle='rgba(3,14,23,.72)';
      ctx.lineWidth=Math.max(1.4,S*.032);ctx.stroke();
      ctx.strokeStyle='rgba(147,181,180,.49)';
      ctx.lineWidth=Math.max(.85,S*.009);ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(S*.145,-S*.47);ctx.lineTo(S*.060,-S*.76);
      ctx.strokeStyle='rgba(140,173,173,.24)';
      ctx.lineWidth=Math.max(1,S*.008);ctx.stroke();

      // Long polished crest, intentionally NOT a continuous white stroke.
      ctx.beginPath();
      ctx.moveTo(-S*.32,-S*.44);
      ctx.lineTo(-S*.005,-S*1.10);
      ctx.lineTo(S*.085,-S*.91);
      ctx.strokeStyle=even?'rgba(217,235,223,.42)':'rgba(129,180,181,.29)';
      ctx.lineWidth=Math.max(1,S*.011);
      ctx.stroke();

      // Recessed panel seams—different distances to avoid repeated vector art.
      for(let j=0;j<3;j++){
        const dy=.49+j*.13;
        ctx.beginPath();
        ctx.moveTo(-S*(.115-j*.022),-S*dy);
        ctx.lineTo(-S*(.081-j*.013),-S*(dy+.040));
        ctx.strokeStyle=j===0?'rgba(5,14,22,.48)':'rgba(158,199,196,.21)';
        ctx.lineWidth=Math.max(.65,S*.004);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Anisotropic specular shoulder follows the actual light orientation.
    const shine=ctx.createLinearGradient(-S,-S*.82,S,S*.85);
    shine.addColorStop(0,'rgba(231,240,221,.17)');
    shine.addColorStop(.29,'rgba(129,161,157,.07)');
    shine.addColorStop(.57,'rgba(0,0,0,0)');
    shine.addColorStop(.85,'rgba(162,198,192,.09)');
    shine.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=shine;ctx.fillRect(-S*1.3,-S*1.3,S*2.6,S*2.6);
    ctx.restore();

    // Segmented perimeter edge: restrained pewter, not a bright white logo.
    magDiamond(ctx,S);
    ctx.strokeStyle='rgba(109,157,163,.43)';
    ctx.lineWidth=Math.max(.9,S*.009);ctx.stroke();
    ctx.save();ctx.beginPath();
    ctx.moveTo(-S*1.12,0);
    ctx.bezierCurveTo(-S*.82,-S*.19,-S*.55,-S*.28,-S*.41,-S*.46);
    ctx.bezierCurveTo(-S*.27,-S*.63,-S*.16,-S*.92,0,-S*1.20);
    ctx.strokeStyle='rgba(204,222,214,.32)';
    ctx.lineWidth=Math.max(1,S*.010);ctx.stroke();
    ctx.restore();

    // Central aperture has REAL visual depth: shadowed recess, two metal
    // collars, a gasket, blades and a layered sapphire rather than a ball.
    const rx=S*.405,ry=S*.399;
    const rot=.012*Math.sin(time*.00022);
    ctx.save();
    ctx.shadowColor='rgba(1,3,9,.90)';ctx.shadowBlur=S*.090;
    ctx.beginPath();ctx.ellipse(0,S*.016,rx*1.25,ry*1.25,0,0,TAU);
    ctx.fillStyle='#020b14';ctx.fill();
    ctx.restore();

    const outerRing=ctx.createLinearGradient(-rx,-ry,rx,ry);
    outerRing.addColorStop(0,'#d4ded4');
    outerRing.addColorStop(.16,'#657f83');
    outerRing.addColorStop(.38,'#243d48');
    outerRing.addColorStop(.62,'#0b1b27');
    outerRing.addColorStop(.86,'#809da0');
    outerRing.addColorStop(1,'#122530');
    ctx.beginPath();ctx.ellipse(0,0,rx*1.17,ry*1.17,0,0,TAU);
    ctx.fillStyle=outerRing;ctx.fill();
    ctx.strokeStyle='rgba(177,203,197,.53)';
    ctx.lineWidth=Math.max(1,S*.009);ctx.stroke();

    // Mechanical fastener seats anchor optic to the four reinforced arms.
    for(let bolt=0;bolt<8;bolt++){
      const angle=(bolt+.5)*TAU/8;
      const bx=Math.cos(angle)*rx*1.08,by=Math.sin(angle)*ry*1.08;
      ctx.beginPath();ctx.arc(bx,by,S*.014,0,TAU);
      ctx.fillStyle='#0b2029';ctx.fill();
      ctx.beginPath();ctx.arc(bx-S*.003,by-S*.004,S*.006,0,TAU);
      ctx.fillStyle='rgba(208,226,216,.57)';ctx.fill();
    }

    ctx.beginPath();ctx.ellipse(0,0,rx*1.027,ry*1.027,0,0,TAU);
    ctx.fillStyle='#020a13';ctx.fill();
    ctx.strokeStyle='rgba(4,11,18,.96)';
    ctx.lineWidth=Math.max(1,S*.020);ctx.stroke();
    const innerMetal=ctx.createRadialGradient(-rx*.22,-ry*.26,0,0,0,rx*1.03);
    innerMetal.addColorStop(0,'#365d65');
    innerMetal.addColorStop(.38,'#132e3d');
    innerMetal.addColorStop(.79,'#091a27');
    innerMetal.addColorStop(.94,'#030c17');
    innerMetal.addColorStop(1,'#01060c');
    ctx.beginPath();ctx.ellipse(0,0,rx*.94,ry*.94,0,0,TAU);
    ctx.fillStyle=innerMetal;ctx.fill();

    // Eight interlocking, foreshortened titanium shutter plates. Each is
    // individually lit and edged, casting onto the dark central chamber.
    for(let blade=0;blade<8;blade++){
      const a=blade*TAU/8+rot;
      ctx.save();ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(rx*.22,-ry*.065);
      ctx.lineTo(rx*.81,-ry*.32);
      ctx.quadraticCurveTo(rx*.90,-ry*.23,rx*.90,-ry*.12);
      ctx.lineTo(rx*.54,ry*.23);
      ctx.closePath();
      const steel=ctx.createLinearGradient(rx*.20,-ry*.34,rx*.86,ry*.25);
      steel.addColorStop(0,blade%2===0?'#80999a':'#5e7c80');
      steel.addColorStop(.30,blade%2===0?'#3d6168':'#30505a');
      steel.addColorStop(.72,'#102e3a');
      steel.addColorStop(1,'#061925');
      ctx.shadowColor='rgba(0,5,13,.72)';
      ctx.shadowBlur=S*.014;ctx.shadowOffsetY=S*.008;
      ctx.fillStyle=steel;ctx.fill();
      ctx.shadowBlur=0;ctx.shadowOffsetY=0;
      ctx.strokeStyle='rgba(136,185,184,.54)';
      ctx.lineWidth=Math.max(.80,S*.008);ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rx*.33,-ry*.097);
      ctx.lineTo(rx*.73,-ry*.26);
      ctx.strokeStyle='rgba(227,241,228,.22)';
      ctx.lineWidth=Math.max(.7,S*.006);ctx.stroke();
      ctx.restore();
    }

    // Deep obsidian aperture, offset refraction and asymmetrical photometric
    // reflection; the center should read as multi-element OPTICS, not a sphere.
    const pupil=ctx.createRadialGradient(-rx*.17,-ry*.22,S*.006,0,0,rx*.66);
    pupil.addColorStop(0,'#658c91');
    pupil.addColorStop(.12,'#355c66');
    pupil.addColorStop(.36,'#163e4d');
    pupil.addColorStop(.66,'#071b2a');
    pupil.addColorStop(.86,'#010c18');
    pupil.addColorStop(1,'#00040c');
    ctx.beginPath();ctx.arc(0,0,rx*.59,0,TAU);
    ctx.fillStyle=pupil;ctx.fill();
    ctx.lineWidth=Math.max(1,S*.013);
    ctx.strokeStyle='rgba(4,13,21,.93)';ctx.stroke();
    const refracted=ctx.createRadialGradient(-rx*.18,-ry*.27,0,-rx*.07,-ry*.07,rx*.52);
    refracted.addColorStop(0,'rgba(178,213,211,.32)');
    refracted.addColorStop(.29,'rgba(77,136,146,.22)');
    refracted.addColorStop(.62,'rgba(11,47,65,.17)');
    refracted.addColorStop(1,'rgba(2,15,24,.02)');
    ctx.beginPath();ctx.arc(0,0,rx*.49,0,TAU);
    ctx.fillStyle=refracted;ctx.fill();

    ctx.save();
    ctx.translate(-rx*.20,-ry*.31);
    ctx.rotate(-.35);
    ctx.beginPath();ctx.ellipse(0,0,rx*.19,ry*.075,0,0,TAU);
    ctx.fillStyle='rgba(237,250,238,.59)';ctx.fill();
    ctx.restore();
    ctx.beginPath();ctx.arc(rx*.22,ry*.24,rx*.13,Math.PI*.08,Math.PI*.64);
    ctx.strokeStyle='rgba(115,184,193,'+(.13+pulse*.08)+')';
    ctx.lineWidth=Math.max(1,S*.010);ctx.stroke();

    // One low-energy optical heartbeat, limited to the lens center.
    ctx.beginPath();ctx.arc(0,0,rx*.26,0,TAU);
    ctx.strokeStyle='rgba(84,176,191,'+(.11+pulse*.13)+')';
    ctx.lineWidth=Math.max(.8,S*.006);ctx.stroke();
    ctx.restore();
  }

  function drawLiteScene(ctx,r,time,target,radiusCap){
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
      const R=Math.min(
        (28+grow*164)*(1+.005*Math.sin(time*.0022)),
        Number.isFinite(radiusCap)?radiusCap:192
      );
      ctx.save();ctx.translate(cx,cy);
      drawMagStudio(ctx,R,time,t);
      ctx.restore();
      document.documentElement.dataset.fxMagFallbackSilhouetteR2107=
        'sculpted-fourpoint-3d-illusion-machined-optic';
      document.documentElement.dataset.fxMagFallbackOpticR2107=
        'eight-deep-shutter-blades-sapphire-glass';
    }
  }

  function attach(canvas,getTarget){
    if(!(canvas instanceof HTMLCanvasElement))return null;
    let ctx=null,dpr=1,sw=0,sh=0,scale=1,ox=0,oy=0;
    const proofFrame=new URLSearchParams(location.search).has('introframe');
    const constrained=!proofFrame&&(
      Number(navigator.hardwareConcurrency||8)<=4 ||
      Number(navigator.deviceMemory||8)<=2
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
      const radiusCap=MOBILE
        ? Math.max(34,Math.min(sw*.255,sh*.275)/Math.max(.001,scale))
        : 192;
      document.documentElement.dataset.fxMagFallbackSilhouetteR2103=
        'four-point-bevelled-metal-glass-iris';
      document.documentElement.dataset.fxMagFallbackDiameterR2103=
        String(Math.round(radiusCap*2.42*scale));
      drawLiteScene(ctx,r,time,target,radiusCap);
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
      quality:'r2107-machined-3d-illusion-sapphire-low-power'
    };
  }
  window.FormatXMagReferenceFilmR649={
    attach,
    revision:'r1724-formatx-living-crystal-organism-birth',
    guardianCompatibility:{revision:'r1724-formatx-crystal-guardian-birth'},
    visualRevision:'r2107-sculpted-machined-sapphire-deep-optics'
  };
})();