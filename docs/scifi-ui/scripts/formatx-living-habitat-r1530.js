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

  let width=1,height=1,dpr=1,raf=0;
  let pointerX=0,pointerY=0,targetX=0,targetY=0;
  let scrollTarget=0,scrollValue=0,impulse=0;
  let particles=[],filaments=[];

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
    schedule();
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
  ROOT.dataset.fxLivingHabitatSchedulerR1541='interaction-driven-zero-idle-raf';
  ROOT.dataset.fxHabitatPerformanceR1530=LOW_POWER?'constrained':MOBILE.matches?'mobile':'full';
})();