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
    // R2107: polished metal-glass surface with layered softbox reflections.
    // Reflections are clipped to the existing organism silhouette, avoiding
    // additional canvas layers and keeping the mobile adaptive DPR intact.
    ctx.save();
    ctx.beginPath();ctx.arc(0,0,R*.975,0,TAU);ctx.clip();
    const drift=Math.sin(time*.00022)*R*.045;
    const reflection=ctx.createLinearGradient(-R*.85+drift,-R*.9,R*.75+drift,R*.8);
    reflection.addColorStop(0,'rgba(221,251,255,0)');
    reflection.addColorStop(.24,'rgba(221,251,255,.025)');
    reflection.addColorStop(.39,'rgba(214,248,255,.16)');
    reflection.addColorStop(.43,'rgba(255,255,255,.055)');
    reflection.addColorStop(.54,'rgba(12,28,42,0)');
    reflection.addColorStop(.72,'rgba(139,205,225,.07)');
    reflection.addColorStop(1,'rgba(4,11,19,0)');
    ctx.fillStyle=reflection;ctx.fillRect(-R,-R,R*2,R*2);
    ctx.strokeStyle='rgba(198,243,250,.15)';ctx.lineWidth=Math.max(.7,R*.006);
    ctx.beginPath();ctx.ellipse(-R*.24,-R*.32,R*.52,R*.24,-.52,Math.PI*1.12,Math.PI*1.89);ctx.stroke();
    ctx.strokeStyle='rgba(68,164,190,.11)';ctx.lineWidth=Math.max(.6,R*.004);
    ctx.beginPath();ctx.ellipse(R*.24,R*.27,R*.64,R*.33,-.52,0,Math.PI*.82);ctx.stroke();
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
      /* R2103: the real low-power/non-WebGL fallback now uses the same
         four-arm MAG identity as the single native R326/Three renderer.
         The old oval biological ball was larger than the entire phone.
         radiusCap is the CSS viewport-derived budget, BEFORE virtual-720p
         letterbox/cover scaling. This remains centered at all phone ratios. */
      const R=Math.min(
        (28+grow*164)*(1+.008*Math.sin(time*.0022)),
        Number.isFinite(radiusCap)?radiusCap:192
      );
      const S=R;
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(.012*Math.sin(time*.00033));
      ctx.lineJoin='round';
      ctx.lineCap='round';

      const outer=()=>{
        ctx.beginPath();
        ctx.moveTo(0,-S*1.23);
        ctx.bezierCurveTo(S*.18,-S*.91,S*.28,-S*.59,S*.41,-S*.45);
        ctx.bezierCurveTo(S*.56,-S*.31,S*.88,-S*.18,S*1.13,0);
        ctx.bezierCurveTo(S*.87,S*.18,S*.55,S*.31,S*.41,S*.47);
        ctx.bezierCurveTo(S*.27,S*.63,S*.16,S*.96,0,S*1.22);
        ctx.bezierCurveTo(-S*.16,S*.95,-S*.29,S*.62,-S*.43,S*.47);
        ctx.bezierCurveTo(-S*.58,S*.29,-S*.90,S*.17,-S*1.14,0);
        ctx.bezierCurveTo(-S*.88,-S*.18,-S*.57,-S*.30,-S*.42,-S*.46);
        ctx.bezierCurveTo(-S*.27,-S*.63,-S*.18,-S*.94,0,-S*1.23);
        ctx.closePath();
      };

      // Real vector geometry: polished stepped four-point crystal silhouette.
      /* R2104: a coherent smoked-chrome material instead of a flat grey
         badge. High-order reflections sweep across the SAME clipped
         four-point shape; no extra canvas, DOM image or WebGL context. */
      const studioTravel=.5+.5*Math.sin(time*.00053);
      const skin=ctx.createLinearGradient(-S,-S*.92,S,S*.95);
      skin.addColorStop(0,'#829698');
      skin.addColorStop(.12,'#394951');
      skin.addColorStop(.29,'#1c323c');
      skin.addColorStop(.50,'#081820');
      skin.addColorStop(.68,'#0a1922');
      skin.addColorStop(.82,'#3e5860');
      skin.addColorStop(.93,'#1b313a');
      skin.addColorStop(1,'#020a12');
      ctx.save();
      ctx.shadowColor='rgba(79,175,190,.33)';
      ctx.shadowBlur=MOBILE?7:14;
      outer();
      ctx.fillStyle=skin;
      ctx.fill();
      ctx.restore();

      outer();
      ctx.strokeStyle='rgba(196,230,224,.64)';
      ctx.lineWidth=Math.max(1.35,S*.013);
      ctx.stroke();
      // A second, recessed silhouette makes the crystal visibly thick.
      ctx.save();
      outer();
      ctx.clip();
      const bevelFalloff=ctx.createLinearGradient(-S*.8,-S*.9,S*.9,S*.8);
      bevelFalloff.addColorStop(0,'rgba(211,229,219,.28)');
      bevelFalloff.addColorStop(.34,'rgba(92,142,151,.035)');
      bevelFalloff.addColorStop(.71,'rgba(4,13,20,.12)');
      bevelFalloff.addColorStop(1,'rgba(131,187,186,.29)');
      ctx.strokeStyle=bevelFalloff;
      ctx.lineWidth=Math.max(2.5,S*.045);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      outer();ctx.clip();
      // Four bevelled radial facets with individual photographic reflections.
      for(let arm=0;arm<4;arm++){
        ctx.save();ctx.rotate(arm*Math.PI*.5);
        const face=ctx.createLinearGradient(
          -S*.42,-S*(.66+.08*studioTravel),S*.45,0
        );
        if(arm%2===0){
          face.addColorStop(0,'rgba(236,250,243,.68)');
          face.addColorStop(.15,'rgba(133,184,184,.44)');
          face.addColorStop(.39,'rgba(58,100,111,.23)');
          face.addColorStop(.71,'rgba(11,29,41,.06)');
          face.addColorStop(1,'rgba(1,10,19,.02)');
        }else{
          face.addColorStop(0,'rgba(180,224,222,.48)');
          face.addColorStop(.18,'rgba(104,152,157,.39)');
          face.addColorStop(.49,'rgba(40,75,88,.22)');
          face.addColorStop(.81,'rgba(8,23,32,.03)');
          face.addColorStop(1,'rgba(4,17,24,.015)');
        }
        ctx.beginPath();
        ctx.moveTo(0,-S*1.14);
        ctx.lineTo(-S*.34,-S*.47);
        ctx.lineTo(-S*.16,-S*.24);
        ctx.lineTo(S*.18,-S*.24);
        ctx.lineTo(S*.34,-S*.46);
        ctx.closePath();
        ctx.fillStyle=face;ctx.fill();
        // The travelling reflected softbox is restricted to this facet,
        // preserving its darkness rather than flattening the whole body.
        ctx.save();ctx.clip();
        const beam=ctx.createLinearGradient(
          -S*(.24+.12*studioTravel),-S*.80,
          S*(.12+.28*studioTravel),-S*.17
        );
        beam.addColorStop(0,'rgba(240,255,251,0)');
        beam.addColorStop(.44,'rgba(220,246,236,0)');
        beam.addColorStop(.52,'rgba(220,248,245,'+
          (.10+.13*studioTravel).toFixed(3)+')');
        beam.addColorStop(.64,'rgba(130,193,194,.055)');
        beam.addColorStop(1,'rgba(12,39,51,0)');
        ctx.fillStyle=beam;
        ctx.fillRect(-S*.50,-S*1.22,S, S*1.12);
        ctx.restore();
        ctx.strokeStyle=arm%2===0?'rgba(230,248,239,.62)':'rgba(150,196,197,.50)';
        ctx.lineWidth=Math.max(1.0,S*.010);
        ctx.beginPath();
        ctx.moveTo(-S*.33,-S*.45);
        ctx.lineTo(0,-S*1.12);
        ctx.lineTo(S*.33,-S*.45);
        ctx.stroke();
        // Routed inset physical machining, restrained on small displays.
        ctx.strokeStyle='rgba(118,165,170,.43)';
        ctx.lineWidth=Math.max(.8,S*.009);
        ctx.beginPath();
        ctx.moveTo(-S*.17,-S*.35);
        ctx.lineTo(-S*.075,-S*.74);
        ctx.stroke();
        // R2108: sub-facet machining and a tiny inset optical witness line.
        // Geometry scales with the existing four-arm silhouette and adds no
        // textures, DOM nodes, shaders, or separate rendering passes.
        if(S>42){
          ctx.strokeStyle='rgba(200,239,233,.19)';
          ctx.lineWidth=Math.max(.55,S*.004);
          ctx.beginPath();
          ctx.moveTo(S*.075,-S*.83);
          ctx.lineTo(S*.19,-S*.56);
          ctx.lineTo(S*.13,-S*.39);
          ctx.stroke();
          ctx.strokeStyle='rgba(4,13,20,.58)';
          ctx.lineWidth=Math.max(.7,S*.007);
          ctx.beginPath();
          ctx.moveTo(S*.11,-S*.81);
          ctx.lineTo(S*.225,-S*.56);
          ctx.stroke();
          ctx.fillStyle='rgba(181,236,231,.33)';
          ctx.beginPath();
          ctx.arc(-S*.12,-S*.47,Math.max(.65,S*.008),0,TAU);
          ctx.fill();
        }
        ctx.restore();
      }
      const inset=ctx.createRadialGradient(-S*.12,-S*.18,S*.03,0,0,S*.66);
      inset.addColorStop(0,'rgba(64,106,113,.20)');
      inset.addColorStop(.40,'rgba(13,40,51,.42)');
      inset.addColorStop(.75,'rgba(2,13,21,.62)');
      inset.addColorStop(1,'rgba(1,9,15,.05)');
      ctx.fillStyle=inset;
      ctx.beginPath();
      ctx.moveTo(0,-S*.47);
      ctx.lineTo(S*.43,0);
      ctx.lineTo(0,S*.46);
      ctx.lineTo(-S*.44,0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      const breathing=.98+.02*Math.sin(time*.0026);
      const rx=S*.355*breathing,ry=S*.340*breathing;
      // Actual recessed bezel, concentric depths, eight machined shutters.
      const titanium=ctx.createLinearGradient(
        -rx*(1+studioTravel*.24),-ry,rx,ry
      );
      titanium.addColorStop(0,'#f1fff9');
      titanium.addColorStop(.10,'#9fc2c1');
      titanium.addColorStop(.20,'#3c6472');
      titanium.addColorStop(.38,'#091c2a');
      titanium.addColorStop(.59,'#17343f');
      titanium.addColorStop(.74,'#9dbdb9');
      titanium.addColorStop(.87,'#4b747d');
      titanium.addColorStop(1,'#081e29');
      ctx.beginPath();ctx.ellipse(0,0,rx*1.17,ry*1.17,0,0,TAU);
      ctx.fillStyle=titanium;ctx.fill();
      ctx.strokeStyle='rgba(222,240,235,.86)';
      ctx.lineWidth=Math.max(1.5,S*.014);ctx.stroke();
      ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);
      const sapphire=ctx.createRadialGradient(
        -rx*(.27+.08*studioTravel),-ry*.32,2,
        rx*.04,ry*.02,rx*1.10
      );
      sapphire.addColorStop(0,'#779ba2');
      sapphire.addColorStop(.14,'#3c6b76');
      sapphire.addColorStop(.37,'#193c4a');
      sapphire.addColorStop(.65,'#0b2434');
      sapphire.addColorStop(.83,'#04111f');
      sapphire.addColorStop(1,'#01060d');
      ctx.fillStyle=sapphire;ctx.fill();
      ctx.strokeStyle='rgba(15,30,40,.93)';
      ctx.lineWidth=Math.max(1.8,S*.022);ctx.stroke();

      for(let blade=0;blade<8;blade++){
        const angle=blade*TAU/8+.025*Math.sin(time*.00022);
        ctx.save();ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(rx*.36,-ry*.18);
        ctx.lineTo(rx*.86,-ry*.36);
        ctx.lineTo(rx*.91,ry*.01);
        ctx.lineTo(rx*.52,ry*.22);
        ctx.closePath();
        const shutter=ctx.createLinearGradient(
          rx*.28,-ry*.40,rx*.97,ry*.21
        );
        shutter.addColorStop(0,blade%2===0?'#96b5b7':'#597d89');
        shutter.addColorStop(.28,blade%2===0?'#4d7481':'#264b5a');
        shutter.addColorStop(.66,'#142f3f');
        shutter.addColorStop(1,'#071c2a');
        ctx.fillStyle=shutter;
        ctx.fill();
        ctx.strokeStyle='rgba(204,239,234,.51)';
        ctx.lineWidth=Math.max(.9,S*.008);ctx.stroke();
        ctx.restore();
      }
      const pupil=ctx.createRadialGradient(-rx*.12,-ry*.19,1,0,0,rx*.50);
      pupil.addColorStop(0,'#75a5aa');
      pupil.addColorStop(.14,'#35626d');
      pupil.addColorStop(.60,'#0c2938');
      pupil.addColorStop(1,'#030f1b');
      ctx.beginPath();ctx.arc(0,0,rx*.42,0,TAU);
      ctx.fillStyle=pupil;ctx.fill();
      ctx.strokeStyle='rgba(198,240,235,.62)';
      ctx.lineWidth=Math.max(1,S*.010);ctx.stroke();
      ctx.beginPath();ctx.ellipse(-rx*.19,-ry*.23,rx*.14,ry*.085,-.42,0,TAU);
      ctx.fillStyle='rgba(245,252,243,.68)';ctx.fill();
      // R2104 photographic side-light trace on the recessed blue glass:
      // one arc, two highlights and the original iris geometry.
      ctx.beginPath();
      ctx.ellipse(0,0,rx*.925,ry*.925,0,-2.68,-.84,false);
      ctx.strokeStyle='rgba(224,253,245,'+
        (.30+.18*studioTravel).toFixed(3)+')';
      ctx.lineWidth=Math.max(.8,S*.009);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(rx*.26,ry*.27,rx*.095,ry*.045,-.45,0,TAU);
      ctx.fillStyle='rgba(91,172,185,.16)';
      ctx.fill();
      document.documentElement.dataset.fxMagFallbackMaterialR2104=
        'moving-softbox-smoked-chrome-sapphire-facets';
      ctx.restore();
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
        ? Math.max(38,Math.min(sw*.36,sh*.35)/Math.max(.001,scale))
        : 192;
      document.documentElement.dataset.fxMagFallbackSilhouetteR2103=
        'four-point-bevelled-metal-glass-iris';
      document.documentElement.dataset.fxMagFallbackDiameterR2103=
        String(Math.round(radiusCap*2*scale));
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
      quality:'r2104-softbox-smoked-chrome-sapphire-low-power'
    };
  }
  window.FormatXMagReferenceFilmR649={
    attach,
    revision:'r1724-formatx-living-crystal-organism-birth',
    guardianCompatibility:{revision:'r1724-formatx-crystal-guardian-birth'},
    visualRevision:'r2108-machined-crystal-microfacets'
  };
})();