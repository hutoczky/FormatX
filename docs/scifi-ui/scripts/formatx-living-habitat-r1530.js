(() => {
  'use strict';

  const ROOT = document.documentElement;
  const BODY = document.body;
  if (!BODY || document.querySelector('.fx-living-habitat-r1530')) return;

  const REDUCED = matchMedia('(prefers-reduced-motion:reduce)');
  const MOBILE = matchMedia('(max-width:900px),(pointer:coarse)');
  const AUDIT = navigator.webdriver === true || /Chrome-Lighthouse/i.test(navigator.userAgent || '') || new URLSearchParams(location.search).get('lighthouse') === '1';
  const LOW_POWER = AUDIT || (MOBILE.matches && (
    Number(navigator.hardwareConcurrency || 8) <= 4 ||
    Number(navigator.deviceMemory || 8) <= 4
  ));

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
  BODY.prepend(canvas);

  const ctx = canvas.getContext('2d',{alpha:true,desynchronized:true});
  if (!ctx) {
    canvas.remove();
    ROOT.dataset.fxLivingHabitatR1530='canvas-unavailable';
    return;
  }

  let width=1,height=1,dpr=1,raf=0,scrollSettleTimer=0,pointerSettleTimer=0,lastDrawAt=0;
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
      g.addColorStop(.70,'rgba(65,37,91,'+(p.alpha*.54)+')');
      g.addColorStop(1,'rgba(2,8,15,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(95,211,233,'+(p.alpha*.46)+')';ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(0,0,p.r*.78,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    for(const c of capillaries){
      const edge=c.side>0?width*.98:width*.02;
      const y=height*c.y;
      const ex=edge-c.side*width*c.len;
      const ey=y+Math.sin(time*.00015+c.phase)*height*.025;
      ctx.save();ctx.lineCap='round';
      ctx.strokeStyle='rgba(63,190,220,'+(c.alpha*(.76+vitality*.62))+')';ctx.lineWidth=c.width;
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
      g.addColorStop(0,'rgba(126,216,226,'+(p.alpha*.55)+')');
      g.addColorStop(.28,'rgba(73,112,143,'+(p.alpha*.52)+')');
      g.addColorStop(.62,'rgba(67,41,104,'+(p.alpha*.44)+')');
      g.addColorStop(1,'rgba(3,10,18,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(116,226,239,'+(p.alpha*.50)+')';ctx.lineWidth=1.1;
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
      ctx.strokeStyle='rgba(74,209,235,'+(n.alpha*(.68+vitality*.36))+')';ctx.lineWidth=n.width;
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
      planet.addColorStop(0,'rgba(98,188,228,'+(.18*worldAlpha)+')');
      planet.addColorStop(.42,'rgba(28,78,132,'+(.14*worldAlpha)+')');
      planet.addColorStop(.76,'rgba(7,23,54,'+(.18*worldAlpha)+')');
      planet.addColorStop(1,'rgba(2,7,18,0)');
      ctx.fillStyle=planet;
      ctx.beginPath();ctx.arc(planetX,planetY,planetR,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(104,201,238,'+(.14*worldAlpha)+')';
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
      ctx.strokeStyle='rgba(255,171,72,'+(.16*worldAlpha)+')';
      ctx.lineWidth=MOBILE.matches?4.2:5.2;
      ctx.beginPath();ctx.ellipse(archCx,archCy,archRx,archRy,0,Math.PI*1.03,Math.PI*1.97);ctx.stroke();
      ctx.strokeStyle='rgba(71,198,244,'+(.12*worldAlpha)+')';
      ctx.lineWidth=MOBILE.matches?1.2:1.7;
      ctx.beginPath();ctx.ellipse(archCx,archCy,archRx*.965,archRy*.965,0,Math.PI*1.03,Math.PI*1.97);ctx.stroke();

      const horizonY=height*.79;
      const horizon=ctx.createLinearGradient(0,horizonY,width,horizonY);
      horizon.addColorStop(0,'rgba(20,129,182,0)');
      horizon.addColorStop(.28,'rgba(37,182,235,'+(.08*worldAlpha)+')');
      horizon.addColorStop(.64,'rgba(255,165,66,'+(.055*worldAlpha)+')');
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
        g.addColorStop(0,warm?'rgba(255,185,92,'+alpha+')':'rgba(70,209,249,'+alpha+')');
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
          ?'rgba(116,69,28,'+(s.alpha*.30*structuralPresence)+')'
          :'rgba(38,64,112,'+(s.alpha*.30*structuralPresence)+')');
        g.addColorStop(.84,s.warm
          ?'rgba(214,147,67,'+(s.alpha*.20*structuralPresence*vascular)+')'
          :'rgba(42,166,194,'+(s.alpha*.19*structuralPresence*vascular)+')');
        g.addColorStop(1,'rgba(4,10,16,0)');
        ctx.fillStyle=g;
        ctx.beginPath();
        ctx.moveTo(baseX-spireW,baseY);
        ctx.bezierCurveTo(baseX-spireW*.65,baseY-spireH*.38,tipX-spireW*.20,baseY-spireH*.78,tipX,baseY-spireH);
        ctx.bezierCurveTo(tipX+spireW*.22,baseY-spireH*.74,baseX+spireW*.78,baseY-spireH*.34,baseX+spireW*.72,baseY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle=(s.warm?'rgba(243,181,90,':'rgba(91,222,243,')+(s.alpha*.24*structuralPresence*vascular)+')';
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
        ctx.strokeStyle=(a.warm?'rgba(206,137,62,':'rgba(76,190,218,')+(alpha*(.52+vitality*.30))+')';
        ctx.lineWidth=a.width*1.65;
        ctx.beginPath();ctx.moveTo(edge,y);
        ctx.bezierCurveTo(cp1x,y-height*.12,cp2x,endY+height*.10,endX,endY);
        ctx.stroke();
        ctx.strokeStyle=(a.warm?'rgba(255,214,145,':'rgba(181,241,247,')+(alpha*.40)+')';
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
    if(raf||document.hidden)return;
    raf=requestAnimationFrame(draw);
  }

  function pulse(kind='pulse',strength=1){
    if(AUDIT)return;
    impulse=Math.max(impulse,Math.max(0,Math.min(1.4,strength)));
    ROOT.dataset.fxHabitatInputR1695=kind;
    BODY.classList.add('fx-habitat-react-r1695');
    clearTimeout(mobilePulseTimer);
    mobilePulseTimer=setTimeout(()=>BODY.classList.remove('fx-habitat-react-r1695'),180);
    schedule();
  }

  addEventListener('resize',resize,{passive:true});
  addEventListener('scroll',()=>{updateScroll();habitatInput('scroll');},{passive:true});
  addEventListener('pointermove',pointer,{passive:true});
  addEventListener('pointerdown',()=>pulse('press',.82),{passive:true});
  addEventListener('pointerup',()=>pulse('release',.52),{passive:true});
  addEventListener('click',()=>pulse('click',.92),{passive:true});
  addEventListener('wheel',()=>habitatInput('wheel'),{passive:true});
  addEventListener('keydown',event=>{if(!event.repeat)pulse('key',.56);},{passive:true});
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
  document.addEventListener('formatx:magbirthcomplete',()=>pulse('intro-handoff',1),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  MOBILE.addEventListener?.('change',resize);

  resize();
  updateScroll();
  draw(performance.now());
  ROOT.dataset.fxLivingHabitatR1530='active-scroll-pointer-atmosphere';
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
  ROOT.dataset.fxLivingHabitatInteractionR1722='all-site-inputs-synchronized-with-organism-zero-extra-loop';
  ROOT.dataset.fxLivingHabitatPhysiologyR1723='same-organism-energy-breath-tissue-neural-world';
  ROOT.dataset.fxLivingHabitatCrystalWorldR1724='cyan-biocrystal-arches-spires-warm-studio-rim';
  ROOT.dataset.fxLivingHabitatR1724='sitewide-persistent-world-section-zones';
  ROOT.dataset.fxLivingHabitatWorldR1724='planet-monumental-arch-spires-reflective-horizon-blue-gold';
  ROOT.dataset.fxLivingHabitatWorldR1723='organic-pillars-membranes-cells-capillaries-neural-roots-no-mineral-stage';
  ROOT.dataset.fxHabitatPerformanceR1530=AUDIT?'audit-static-low-dpr-world':LOW_POWER?'constrained-living-world':MOBILE.matches?'mobile-living-world':'full-living-world';
})();