(function(){
'use strict';

const root=document.documentElement;
const VERSION='r335-quantum-inspired-interactive-particles';
if(root.dataset.fxQuantumParticlesR335==='ready'||root.dataset.fxQuantumParticlesR335==='booting')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxQuantumParticlesR335='audit-skip';
  return;
}
root.dataset.fxQuantumParticlesR335='booting';
root.dataset.fxQuantumParticleModel='probability-shells-entangled-pairs-collapse-tunneling';
root.dataset.fxQuantumParticleScheduler='event-driven-no-idle-raf';

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=matchMedia('(max-width:900px),(pointer:coarse)').matches;
if(!mobile){
  root.dataset.fxQuantumParticlesR335='desktop-bypass';
  return;
}

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const TAU=Math.PI*2;
let bootTimer=0;
let relaxTimer=0;
let pointerTimer=0;
let interactionSerial=0;
let disposed=false;

function hash(n){
  const x=Math.sin(n*12.9898+78.233)*43758.5453;
  return x-Math.floor(x);
}

function waitForStage(attempt=0){
  if(disposed)return;
  const stage=document.querySelector('#hero .fx-core-r317-stage');
  if(stage){
    mount(stage);
    return;
  }
  if(attempt>=90){
    root.dataset.fxQuantumParticlesR335='stage-unavailable';
    return;
  }
  bootTimer=window.setTimeout(()=>waitForStage(attempt+1),40);
}

function mount(stage){
  if(disposed||stage.querySelector('.fx-quantum-field-r335'))return;
  const host=stage.parentElement;
  if(!host){
    root.dataset.fxQuantumParticlesR335='host-unavailable';
    return;
  }

  const field=document.createElement('div');
  field.className='fx-quantum-field-r335';
  field.dataset.active='true';
  field.dataset.state='superposition';
  field.dataset.version=VERSION;
  field.setAttribute('aria-hidden','true');
  stage.append(field);

  const count=24;
  const particles=[];
  for(let i=0;i<count;i++){
    const node=document.createElement('i');
    node.className='fx-quantum-particle-r335';
    node.dataset.index=String(i);
    node.dataset.pair=String(Math.floor(i/2));
    node.style.setProperty('--fx-q-size',`${(1.8+hash(i+2)*2.25).toFixed(2)}px`);
    node.style.setProperty('--fx-q-alpha',(0.34+hash(i+9)*0.42).toFixed(3));
    node.style.setProperty('--fx-q-duration',`${(3.4+hash(i+21)*3.5).toFixed(2)}s`);
    node.style.setProperty('--fx-q-delay',`${(-hash(i+31)*4.2).toFixed(2)}s`);
    field.append(node);
    particles.push({
      node,
      index:i,
      pair:Math.floor(i/2),
      phase:hash(i+4)*TAU,
      shell:i%4,
      polarity:i%2===0?1:-1,
      seed:hash(i+71),
      x:0,
      y:0
    });
  }

  function bounds(){
    const r=field.getBoundingClientRect();
    return {
      rect:r,
      rx:Math.max(72,r.width*.43),
      ry:Math.max(96,r.height*.39),
      cx:r.width*.5,
      cy:r.height*.5
    };
  }

  function shellRadius(shell){
    return [0.22,0.37,0.54,0.72][shell]||0.54;
  }

  function setParticle(p,x,y,shell,scale,transition){
    p.x=x;p.y=y;p.shell=shell;
    p.node.dataset.shell=String(shell);
    p.node.style.setProperty('--fx-q-x',`${x.toFixed(2)}px`);
    p.node.style.setProperty('--fx-q-y',`${y.toFixed(2)}px`);
    p.node.style.setProperty('--fx-q-scale',scale.toFixed(3));
    p.node.style.setProperty('--fx-q-transition',`${transition}ms`);
  }

  function orbitalPoint(p,b,serial,interaction){
    const pairPhase=(p.pair*0.61+serial*0.13)%TAU;
    const mirror=p.polarity;
    const shell=shellRadius(p.shell);
    const jitter=(hash(p.index+serial*17.3)-.5)*0.12;
    const angle=p.phase+pairPhase*0.36+mirror*jitter;
    let x=Math.cos(angle)*b.rx*shell;
    let y=Math.sin(angle)*b.ry*shell*0.78;

    if(interaction){
      const dx=interaction.x-x;
      const dy=interaction.y-y;
      const d=Math.max(20,Math.hypot(dx,dy));
      const proximity=clamp(1-d/Math.max(b.rx,b.ry),0,1);
      const response=(p.polarity>0?-.16:.11)*proximity;
      x+=dx*response;
      y+=dy*response;
    }

    return {x,y};
  }

  function superpose(reason='idle',interaction=null){
    const b=bounds();
    interactionSerial++;
    field.dataset.state=reason==='tunnel'?'tunneling':'superposition';
    for(const p of particles){
      const jumpChance=hash(p.index+interactionSerial*23.7);
      if(jumpChance>(reason==='pointer'?0.82:0.91)){
        const direction=hash(p.index+interactionSerial*7.1)>.5?1:-1;
        p.shell=(p.shell+direction+4)%4;
      }
      const q=orbitalPoint(p,b,interactionSerial,interaction);
      const scale=.72+p.seed*.72+(p.shell===0?.12:0);
      setParticle(p,q.x,q.y,p.shell,scale,reason==='pointer'?230:420);
    }
    root.dataset.fxQuantumParticleLastState=reason;
  }

  function measure(clientX,clientY){
    const b=bounds();
    const px=clamp(clientX-b.rect.left-b.cx,-b.rx*.82,b.rx*.82);
    const py=clamp(clientY-b.rect.top-b.cy,-b.ry*.78,b.ry*.78);
    interactionSerial++;
    field.dataset.state='measured';
    root.dataset.fxQuantumParticleLastState='measurement-collapse';

    for(const p of particles){
      const pairBand=(p.pair%3)-1;
      const local=18+hash(p.index+interactionSerial*11.2)*34;
      const angle=p.phase+p.polarity*.74+pairBand*.27;
      const x=px+Math.cos(angle)*local*(p.polarity>0?1:.72);
      const y=py+Math.sin(angle)*local*.68;
      const shell=Math.min(3,Math.max(0,Math.round(hash(p.index+interactionSerial*4.4)*3)));
      setParticle(p,x,y,shell,1.05+p.seed*.62,reduced?1:145);
    }

    clearTimeout(relaxTimer);
    relaxTimer=window.setTimeout(()=>tunnel(px,py),reduced?20:190);
  }

  function tunnel(px,py){
    const b=bounds();
    interactionSerial++;
    field.dataset.state='tunneling';
    root.dataset.fxQuantumParticleLastState='probability-tunnel';
    for(const p of particles){
      if(hash(p.index+interactionSerial*19.7)<.38){
        const x=-p.x*.92+px*.08;
        const y=-p.y*.86+py*.06;
        p.shell=(p.shell+1+(p.pair%2))%4;
        setParticle(p,x,y,p.shell,.82+p.seed*.66,reduced?1:165);
      }
    }
    clearTimeout(relaxTimer);
    relaxTimer=window.setTimeout(()=>superpose('decoherence'),reduced?30:260);
  }

  function pointerInteraction(event){
    if(field.dataset.active==='false')return;
    const r=field.getBoundingClientRect();
    if(event.clientX<r.left-30||event.clientX>r.right+30||event.clientY<r.top-30||event.clientY>r.bottom+30)return;
    const x=event.clientX-r.left-r.width*.5;
    const y=event.clientY-r.top-r.height*.5;
    clearTimeout(pointerTimer);
    pointerTimer=window.setTimeout(()=>superpose('pointer',{x,y}),42);
  }

  const onPointerMove=e=>pointerInteraction(e);
  const onPointerDown=e=>{
    const r=field.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
    measure(e.clientX,e.clientY);
    dispatchEvent(new CustomEvent('formatx:coreinteraction',{detail:{source:'quantum-r335',energy:.82,mode:'measurement-collapse'}}));
  };
  const onCoreInteraction=e=>{
    if(e.detail?.source==='quantum-r335')return;
    const b=bounds();
    const x=(hash(interactionSerial+101)-.5)*b.rx*.72;
    const y=(hash(interactionSerial+131)-.5)*b.ry*.56;
    superpose('external-interaction',{x,y});
  };

  host.addEventListener('pointermove',onPointerMove,{passive:true});
  host.addEventListener('pointerdown',onPointerDown,{passive:true});
  addEventListener('formatx:coreinteraction',onCoreInteraction,{passive:true});

  const io='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    const active=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.05);
    field.dataset.active=active?'true':'false';
  },{threshold:[0,.05,.2]}):null;
  io?.observe(stage);

  const ro='ResizeObserver' in window?new ResizeObserver(()=>{
    if(field.dataset.active!=='false')superpose('resize');
  }):null;
  ro?.observe(stage);

  superpose('initial');
  root.dataset.fxQuantumParticlesR335='ready';
  dispatchEvent(new CustomEvent('formatx:quantumparticlesready',{detail:{revision:'r335',count,model:root.dataset.fxQuantumParticleModel}}));

  window.FormatXQuantumParticlesR335={
    version:VERSION,
    measureAt(clientX,clientY){measure(clientX,clientY);},
    excite(){superpose('external-excite');},
    destroy(){
      disposed=true;
      clearTimeout(bootTimer);clearTimeout(relaxTimer);clearTimeout(pointerTimer);
      host.removeEventListener('pointermove',onPointerMove);
      host.removeEventListener('pointerdown',onPointerDown);
      removeEventListener('formatx:coreinteraction',onCoreInteraction);
      io?.disconnect();ro?.disconnect();field.remove();
      root.dataset.fxQuantumParticlesR335='destroyed';
    }
  };
}

waitForStage();
}());