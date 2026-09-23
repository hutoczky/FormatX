(() => {
  'use strict';

  const ROOT = document.documentElement;
  const BODY = document.body;
  if (!BODY || document.querySelector('.fx-living-habitat-r1530')) return;

  const REDUCED = matchMedia('(prefers-reduced-motion:reduce)');
  const MOBILE = matchMedia('(max-width:900px),(pointer:coarse)');
  const LOW_POWER = MOBILE.matches && (
    Number(navigator.hardwareConcurrency || 8) <= 4 ||
    Number(navigator.deviceMemory || 8) <= 4
  );

  /* R1603 — mobile/coarse pointers use the same full-page habitat through
     compositor-owned CSS layers. A full-viewport Canvas2D redraw is visually
     redundant there and can monopolise the main thread on weak/software GPUs. */
  if (MOBILE.matches) {
    ROOT.dataset.fxLivingHabitatR1530='css-compositor-mobile-habitat';
    ROOT.dataset.fxLivingHabitatSchedulerR1603='zero-main-thread-mobile-compositor';
    ROOT.dataset.fxHabitatPerformanceR1530=LOW_POWER?'constrained-css':'mobile-css';
    return;
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

  let width=1,height=1,dpr=1,raf=0,scrollSettleTimer=0,lastDrawAt=0;
  let pointerX=0,pointerY=0,targetX=0,targetY=0;
  let scrollTarget=0,scrollValue=0,impulse=0;
  let particles=[],filaments=[],glassArcs=[],mineralSpires=[];

  function seeded(seed=0xF04A1530){
    let s=seed>>>0;
    return ()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
  }
  const random=seeded();

  function seedScene(){
    const count=LOW_POWER?12:MOBILE.matches?18:28;
    particles=Array.from({length:count},()=>({
      x:random(),y:random(),z:.18+random()*.82,size:.45+random()*1.30,
      phase:random()*Math.PI*2,alpha:.12+random()*.30
    }));
    /* R1584: long diagonal lines read as stage beams on phones. Keep the
       mobile habitat purely volumetric and reserve only a few short, dim
       biological filaments for fine-pointer desktop depth. */
    const lines=LOW_POWER||MOBILE.matches?0:3;
    filaments=Array.from({length:lines},(_,index)=>({
      x:.14+random()*.72,y:.12+random()*.76,len:.08+random()*.08,
      bend:(random()-.5)*.065,phase:random()*Math.PI*2,
      alpha:.005+random()*.006,width:.32+random()*.28,dir:index%2?1:-1
    }));
    const arcCount=LOW_POWER?2:MOBILE.matches?3:5;
    glassArcs=Array.from({length:arcCount},(_,index)=>({
      side:index%2?-1:1,
      y:.16+random()*.58,
      reach:.18+random()*.18,
      bend:.10+random()*.18,
      alpha:.036+random()*.026,
      width:.90+random()*1.45,
      phase:random()*Math.PI*2
    }));
    const spireCount=LOW_POWER?3:MOBILE.matches?4:7;
    mineralSpires=Array.from({length:spireCount},(_,index)=>({
      side:index%2?-1:1,
      x:.04+random()*.24,
      y:.54+random()*.42,
      w:.055+random()*.085,
      h:.12+random()*.30,
      lean:(random()-.5)*.055,
      alpha:.16+random()*.14,
      warm:random()>.72
    }));
  }

  function resize(){
    width=Math.max(1,innerWidth);height=Math.max(1,innerHeight);
    dpr=Math.min(devicePixelRatio||1,LOW_POWER?1:MOBILE.matches?1:1.12);
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
    if(MOBILE.matches)return;
    targetX=(event.clientX/Math.max(1,width)-.5)*2;
    targetY=(event.clientY/Math.max(1,height)-.5)*2;
    schedule();
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

    const sx=width*(MOBILE.matches?.50:.66)+pointerX*width*.009;
    const sy=-height*.04+pointerY*height*.004;
    const radius=Math.max(width,height)*.44;
    ctx.fillStyle=radial(sx,sy,radius,[
      [0,'rgba(214,248,251,'+(.026+breath*.004+impulse*.008)+')'],
      [.20,'rgba(112,204,220,.018)'],
      [.58,'rgba(42,104,122,.008)'],
      [1,'rgba(0,0,0,0)']
    ]);
    ctx.fillRect(0,0,width,height);

    const floor=ctx.createRadialGradient(width*.52,height*1.04,0,width*.52,height*1.04,Math.max(width,height)*.52);
    floor.addColorStop(0,'rgba(68,130,142,.018)');
    floor.addColorStop(.48,'rgba(23,68,79,.008)');
    floor.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=floor;ctx.fillRect(0,0,width,height);

    /* R1585: near the top of the page, imply a real dark laboratory around
       the core using only broad volumetric masses. No target rings or hard
       beams: side architecture, overhead haze and a low reflected floor pool. */
    const heroPresence=Math.max(0,1-scrollValue*4.2);
    if(heroPresence>.01){
      const leftMass=ctx.createLinearGradient(0,0,width*.30,0);
      leftMass.addColorStop(0,'rgba(0,0,0,'+(.42*heroPresence)+')');
      leftMass.addColorStop(.36,'rgba(4,10,13,'+(.22*heroPresence)+')');
      leftMass.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=leftMass;ctx.fillRect(0,0,width*.34,height);

      const rightMass=ctx.createLinearGradient(width,0,width*.70,0);
      rightMass.addColorStop(0,'rgba(0,0,0,'+(.46*heroPresence)+')');
      rightMass.addColorStop(.38,'rgba(4,10,13,'+(.20*heroPresence)+')');
      rightMass.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=rightMass;ctx.fillRect(width*.66,0,width*.34,height);

      const overhead=radial(
        width*(.51+pointerX*.004),height*.03,
        Math.max(width,height)*.45,
        [
          [0,'rgba(205,229,230,'+(.030*heroPresence)+')'],
          [.23,'rgba(112,154,161,'+(.016*heroPresence)+')'],
          [.62,'rgba(35,65,72,'+(.006*heroPresence)+')'],
          [1,'rgba(0,0,0,0)']
        ]
      );
      ctx.fillStyle=overhead;ctx.fillRect(0,0,width,height);

      ctx.save();
      ctx.translate(width*.51,height*.86);
      ctx.scale(1,.25);
      const floorPool=ctx.createRadialGradient(0,0,0,0,0,width*.46);
      floorPool.addColorStop(0,'rgba(128,190,198,'+(.032*heroPresence)+')');
      floorPool.addColorStop(.28,'rgba(48,97,106,'+(.018*heroPresence)+')');
      floorPool.addColorStop(.68,'rgba(18,47,55,'+(.007*heroPresence)+')');
      floorPool.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=floorPool;
      ctx.fillRect(-width*.55,-height*1.5,width*1.1,height*3);
      ctx.restore();

      /* R1593: real environmental structure. Dark mineral spires and clear
         bio-glass arches frame the MAG without becoming HUD graphics. */
      const structuralPresence=.18+.82*heroPresence;
      for(const s of mineralSpires){
        const baseX=s.side>0?width*(1-s.x):width*s.x;
        const baseY=height*s.y;
        const spireW=width*s.w;
        const spireH=height*s.h;
        const tipX=baseX+s.lean*width;
        const g=ctx.createLinearGradient(baseX-spireW,baseY,baseX+spireW*.4,baseY-spireH);
        const tint=s.warm?'86,69,54':'37,56,61';
        g.addColorStop(0,'rgba(0,0,0,'+(s.alpha*.72*structuralPresence)+')');
        g.addColorStop(.46,'rgba('+tint+','+(s.alpha*.34*structuralPresence)+')');
        g.addColorStop(.74,'rgba(74,98,101,'+(s.alpha*.18*structuralPresence)+')');
        g.addColorStop(1,'rgba(4,8,9,0)');
        ctx.fillStyle=g;
        ctx.beginPath();
        ctx.moveTo(baseX-spireW,baseY);
        ctx.lineTo(tipX-spireW*.15,baseY-spireH);
        ctx.lineTo(tipX+spireW*.22,baseY-spireH*.72);
        ctx.lineTo(baseX+spireW*.72,baseY);
        ctx.closePath();
        ctx.fill();
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
        ctx.strokeStyle='rgba(194,224,225,'+(alpha*.28)+')';
        ctx.lineWidth=a.width*3.6;
        ctx.beginPath();ctx.moveTo(edge,y);
        ctx.bezierCurveTo(cp1x,y-height*.12,cp2x,endY+height*.10,endX,endY);
        ctx.stroke();
        ctx.strokeStyle='rgba(222,241,239,'+(alpha*.92)+')';
        ctx.lineWidth=a.width;
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

  function pulse(){
    impulse=1;
    schedule();
  }

  addEventListener('resize',resize,{passive:true});
  addEventListener('scroll',updateScroll,{passive:true});
  addEventListener('pointermove',pointer,{passive:true});
  addEventListener('formatx:coretouchpulse',pulse,{passive:true});
  document.addEventListener('formatx:magbirthcomplete',pulse,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  MOBILE.addEventListener?.('change',resize);

  resize();
  updateScroll();
  draw(performance.now());
  ROOT.dataset.fxLivingHabitatR1530='active-scroll-pointer-atmosphere';
  ROOT.dataset.fxLivingHabitatR1584=MOBILE.matches?'mobile-volumetric-no-filament-beams':'desktop-short-organic-filaments';
  ROOT.dataset.fxLivingHabitatR1585='dark-laboratory-side-masses-overhead-haze-floor-reflection-no-rings';
  ROOT.dataset.fxLivingHabitatR1593='physical-mineral-spires-clear-bioglass-arches-whole-page-depth';
  ROOT.dataset.fxLivingHabitatR1594='visible-bioglass-arches-mineral-spires-reflective-floor-depth-without-hud-rings';
  ROOT.dataset.fxLivingHabitatSchedulerR1541='interaction-driven-zero-idle-raf';
  ROOT.dataset.fxLivingHabitatSchedulerR1643='scroll-settle-canvas-css-compositor-during-motion';
  ROOT.dataset.fxLivingHabitatSchedulerR1670='desktop-canvas-60hz-floor-high-refresh-divisor-zero-idle';
  ROOT.dataset.fxHabitatPerformanceR1530=LOW_POWER?'constrained':MOBILE.matches?'mobile':'full';
})();