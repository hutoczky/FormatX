(() => {
  'use strict';

  const ROOT=document.documentElement;
  const BODY=document.body;
  if(!BODY||document.querySelector('.fx-living-habitat-r1530'))return;

  const REDUCED=matchMedia('(prefers-reduced-motion:reduce)');
  const MOBILE=matchMedia('(max-width:900px),(pointer:coarse)');
  const LOW_POWER=MOBILE.matches&&(Number(navigator.hardwareConcurrency||8)<=4||Number(navigator.deviceMemory||8)<=4);

  const canvas=document.createElement('canvas');
  canvas.className='fx-living-habitat-r1530';
  canvas.setAttribute('aria-hidden','true');
  canvas.dataset.renderer='canvas2d-event-driven-atmospheric-habitat';
  BODY.prepend(canvas);

  const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
  if(!ctx){
    canvas.remove();
    ROOT.dataset.fxLivingHabitatR1530='canvas-unavailable';
    return;
  }

  let width=1,height=1,dpr=1,raf=0;
  let pointerX=0,pointerY=0,targetX=0,targetY=0;
  let scrollValue=0,scrollTarget=0,impulse=0;
  let particles=[],filaments=[];
  let lastDraw=0;

  function seeded(seed=0xF04A1541){
    let s=seed>>>0;
    return()=>{
      s+=0x6D2B79F5;
      let t=s;
      t=Math.imul(t^(t>>>15),t|1);
      t^=t+Math.imul(t^(t>>>7),t|61);
      return((t^(t>>>14))>>>0)/4294967296;
    };
  }
  const random=seeded();

  function seedScene(){
    const count=LOW_POWER?14:MOBILE.matches?22:34;
    particles=Array.from({length:count},()=>({
      x:random(),y:random(),z:.18+random()*.82,
      size:.42+random()*1.25,phase:random()*Math.PI*2,
      alpha:.11+random()*.28
    }));
    const lineCount=LOW_POWER?2:MOBILE.matches?3:5;
    filaments=Array.from({length:lineCount},(_,index)=>({
      x:.10+random()*.80,y:.08+random()*.84,
      len:.17+random()*.24,bend:(random()-.5)*.19,
      phase:random()*Math.PI*2,alpha:.012+random()*.018,
      width:.4+random()*.5,dir:index%2?1:-1
    }));
  }

  function resize(){
    width=Math.max(1,innerWidth);
    height=Math.max(1,innerHeight);
    dpr=Math.min(devicePixelRatio||1,LOW_POWER ? 0.75 : MOBILE.matches ? 0.82 : 1);
    canvas.width=Math.max(1,Math.round(width*dpr));
    canvas.height=Math.max(1,Math.round(height*dpr));
    canvas.style.width=width+'px';
    canvas.style.height=height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    seedScene();
    schedule(true);
  }

  function radial(x,y,radius,stops){
    const g=ctx.createRadialGradient(x,y,0,x,y,radius);
    stops.forEach(([at,value])=>g.addColorStop(at,value));
    return g;
  }

  function draw(now=performance.now()){
    lastDraw=now;
    raf=0;
    pointerX+=(targetX-pointerX)*.42;
    pointerY+=(targetY-pointerY)*.42;
    scrollValue+=(scrollTarget-scrollValue)*.38;
    impulse*=.52;

    ctx.clearRect(0,0,width,height);
    const breath=.50+.50*Math.sin(now*.00022);

    const shaftX=width*(MOBILE.matches ? 0.50 : 0.66)+pointerX*width*.010;
    const shaftY=-height*.04+pointerY*height*.006;
    const shaftR=Math.max(width,height)*(.44+breath*.009);
    ctx.fillStyle=radial(shaftX,shaftY,shaftR,[
      [0,'rgba(214,248,251,'+(.022+breath*.006+impulse*.008)+')'],
      [.20,'rgba(112,204,220,'+(.015+breath*.004)+')'],
      [.54,'rgba(42,104,122,.007)'],
      [1,'rgba(0,0,0,0)']
    ]);
    ctx.fillRect(0,0,width,height);

    filaments.forEach(f=>{
      const x=f.x*width+pointerX*5*f.dir;
      const y=f.y*height+(scrollValue-.5)*height*.030*f.dir;
      const len=f.len*height;
      const bend=f.bend*width;
      const grad=ctx.createLinearGradient(x,y-len*.5,x+bend,y+len*.5);
      grad.addColorStop(0,'rgba(115,192,206,0)');
      grad.addColorStop(.46,'rgba(166,216,225,'+(f.alpha*(.74+breath*.20))+')');
      grad.addColorStop(1,'rgba(115,192,206,0)');
      ctx.strokeStyle=grad;
      ctx.lineWidth=f.width;
      ctx.beginPath();
      ctx.moveTo(x,y-len*.5);
      ctx.bezierCurveTo(x+bend*.34,y-len*.18,x+bend*.78,y+len*.22,x+bend,y+len*.5);
      ctx.stroke();
    });

    for(const p of particles){
      const x=p.x*width+Math.sin(now*.00008+p.phase)*5*p.z+pointerX*5*p.z;
      let y=p.y*height+Math.cos(now*.00007+p.phase)*4*p.z-scrollValue*height*.045*p.z;
      y=((y%height)+height)%height;
      const size=p.size*(.65+p.z*.70);
      const alpha=p.alpha*(.56+.35*breath)*(.45+p.z*.55);
      ctx.fillStyle='rgba(174,226,235,'+(alpha*.20)+')';
      ctx.beginPath();
      ctx.arc(x,y,size,0,Math.PI*2);
      ctx.fill();
    }
  }

  function schedule(force=false){
    if(document.hidden)return;
    const now=performance.now();
    if(!force&&now-lastDraw<70)return;
    if(raf)return;
    raf=requestAnimationFrame(draw);
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

  function pulse(){
    impulse=1;
    schedule(true);
  }

  addEventListener('resize',resize,{passive:true});
  addEventListener('scroll',updateScroll,{passive:true});
  addEventListener('pointermove',pointer,{passive:true});
  addEventListener('formatx:coretouchpulse',pulse,{passive:true});
  document.addEventListener('formatx:magbirthcomplete',pulse,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(true);},{passive:true});
  REDUCED.addEventListener?.('change',()=>schedule(true));
  MOBILE.addEventListener?.('change',resize);

  resize();
  updateScroll();
  ROOT.dataset.fxLivingHabitatR1530='event-driven-physical-atmosphere';
  ROOT.dataset.fxLivingHabitatR1541='zero-idle-raf-scroll-pointer-pulse';
  ROOT.dataset.fxHabitatPerformanceR1530=LOW_POWER?'constrained':MOBILE.matches?'mobile':'full';
})();