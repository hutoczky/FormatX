(function(){
'use strict';
const root=document.documentElement;
const VERSION='mobile-gyro-parallax-r144';
if(root.dataset.fxCoreGyroR144===VERSION)return;
root.dataset.fxCoreGyroR144=VERSION;

const mobile=matchMedia('(max-width:900px),(pointer:coarse)').matches;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(!mobile){root.dataset.fxCoreGyroState='desktop-skip';return;}
if(reduced.matches){root.dataset.fxCoreGyroState='reduced-motion-skip';return;}
if(typeof DeviceOrientationEvent==='undefined'){
  root.dataset.fxCoreGyroState='unsupported';
  return;
}

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const wrap180=v=>{let n=v%360;if(n>180)n-=360;if(n<-180)n+=360;return n;};
let enabled=false;
let permissionState='unknown';
let baseBeta=null,baseGamma=null;
let calibrating=0,sumBeta=0,sumGamma=0;
let targetX=0,targetY=0,smoothX=0,smoothY=0;
let lastDispatch=0,raf=0;
let manualUntil=0;
let lastSensorAt=0;

function stage(){
  return document.querySelector('#hero .fx-core-r112-stage,#hero .fx-core-mobile-v55-stage');
}
function hero(){return document.getElementById('hero');}
function orientationAngle(){
  const a=Number(screen.orientation?.angle);
  if(Number.isFinite(a))return ((a%360)+360)%360;
  const legacy=Number(window.orientation);
  return Number.isFinite(legacy)?((legacy%360)+360)%360:0;
}
function resetCalibration(){
  baseBeta=null;baseGamma=null;calibrating=0;sumBeta=0;sumGamma=0;
  targetX=0;targetY=0;
  root.dataset.fxCoreGyroCalibration='pending';
}
function calibrate(beta,gamma){
  if(baseBeta!=null&&baseGamma!=null)return true;
  sumBeta+=beta;sumGamma+=gamma;calibrating+=1;
  if(calibrating<8)return false;
  baseBeta=sumBeta/calibrating;baseGamma=sumGamma/calibrating;
  root.dataset.fxCoreGyroCalibration='ready';
  return true;
}
function axes(beta,gamma){
  let dx=wrap180(gamma-baseGamma);
  let dy=wrap180(beta-baseBeta);
  const angle=orientationAngle();
  if(angle===90){const t=dx;dx=-dy;dy=t;}
  else if(angle===270){const t=dx;dx=dy;dy=-t;}
  else if(angle===180){dx=-dx;dy=-dy;}
  let x=clamp(dx/24,-.86,.86);
  let y=clamp(dy/30,-.78,.78);
  if(Math.abs(x)<.035)x=0;
  if(Math.abs(y)<.035)y=0;
  return{x,y};
}
function onOrientation(event){
  if(document.hidden||reduced.matches)return;
  const beta=Number(event.beta),gamma=Number(event.gamma);
  if(!Number.isFinite(beta)||!Number.isFinite(gamma))return;
  lastSensorAt=performance.now();
  if(!calibrate(beta,gamma))return;
  const v=axes(beta,gamma);
  targetX=v.x;targetY=v.y;
  root.dataset.fxCoreGyroState='active';
  root.dataset.fxCoreGyroInput=`${v.x.toFixed(3)},${v.y.toFixed(3)}`;
}
function emit(now){
  const s=stage(),h=hero();
  if(!(s instanceof HTMLElement)||!(h instanceof HTMLElement))return;
  const r=s.getBoundingClientRect();
  if(r.width<2||r.height<2||r.bottom<0||r.top>innerHeight)return;
  if(now<manualUntil)return;
  if(root.dataset.fxReferenceMotionPaused==='true')return;

  // Keep the gyroscope subtler than a direct finger drag. The renderer receives
  // this as an untrusted synthetic pointermove on its actual hero target, so the
  // existing pointer/touch controller remains authoritative for real input.
  const clientX=r.left+r.width*(.5+smoothX*.32);
  const clientY=r.top+r.height*(.5-smoothY*.28);
  try{
    h.dispatchEvent(new PointerEvent('pointermove',{
      bubbles:true,
      cancelable:false,
      clientX,clientY,
      pointerId:144,
      pointerType:'mouse',
      isPrimary:true,
      buttons:0,
      pressure:0
    }));
  }catch(_){
    h.dispatchEvent(new MouseEvent('mousemove',{bubbles:true,clientX,clientY}));
  }
  root.dataset.fxCoreGyroVector=`${smoothX.toFixed(3)},${smoothY.toFixed(3)}`;
}
function frame(now){
  raf=0;
  if(!document.hidden&&enabled){
    const stale=now-lastSensorAt>900;
    if(stale){targetX*=.94;targetY*=.94;}
    smoothX+=(targetX-smoothX)*.105;
    smoothY+=(targetY-smoothY)*.095;
    if(now-lastDispatch>=33){lastDispatch=now;emit(now);}
  }
  raf=requestAnimationFrame(frame);
}
function startFrame(){if(!raf)raf=requestAnimationFrame(frame);}
function enableSensor(){
  if(enabled)return;
  enabled=true;
  addEventListener('deviceorientation',onOrientation,{passive:true});
  root.dataset.fxCoreGyroPermission=permissionState;
  root.dataset.fxCoreGyroState='listening';
  startFrame();
}
async function requestPermissionFromGesture(){
  if(enabled)return;
  const request=DeviceOrientationEvent.requestPermission;
  if(typeof request!=='function'){
    permissionState='not-required';
    enableSensor();
    return;
  }
  try{
    permissionState=await request.call(DeviceOrientationEvent);
    root.dataset.fxCoreGyroPermission=permissionState;
    if(permissionState==='granted')enableSensor();
    else root.dataset.fxCoreGyroState='permission-denied';
  }catch(_){
    permissionState='error';
    root.dataset.fxCoreGyroPermission='error';
    root.dataset.fxCoreGyroState='permission-error';
  }
}
function maybeRequest(event){
  if(enabled||typeof DeviceOrientationEvent.requestPermission!=='function')return;
  if(!event.isTrusted)return;
  const path=event.composedPath?.()||[];
  const onCore=path.some(n=>n instanceof Element&&(n.matches?.('#hero,.hero-space,.fx-core-r112-stage,.fx-core-mobile-v55-stage')||n.closest?.('#hero .hero-space')));
  if(onCore)requestPermissionFromGesture();
}
function markManual(event){
  if(!event.isTrusted)return;
  if(event.pointerType==='mouse'&&event.type==='pointermove'&&event.buttons===0)return;
  manualUntil=performance.now()+(event.type==='pointerup'||event.type==='pointercancel'?650:900);
}

addEventListener('pointerdown',markManual,{passive:true,capture:true});
addEventListener('pointermove',markManual,{passive:true,capture:true});
addEventListener('pointerup',markManual,{passive:true,capture:true});
addEventListener('pointercancel',markManual,{passive:true,capture:true});
addEventListener('pointerdown',maybeRequest,{passive:true,capture:true});
addEventListener('touchstart',maybeRequest,{passive:true,capture:true});
addEventListener('orientationchange',()=>{resetCalibration();manualUntil=performance.now()+500;},{passive:true});
screen.orientation?.addEventListener?.('change',()=>{resetCalibration();manualUntil=performance.now()+500;},{passive:true});
addEventListener('visibilitychange',()=>{if(document.hidden){targetX=0;targetY=0;}else{resetCalibration();startFrame();}},{passive:true});
addEventListener('formatx:real3dready',startFrame,{passive:true});
addEventListener('formatx:coredetailready',startFrame,{passive:true});

if(typeof DeviceOrientationEvent.requestPermission==='function'){
  permissionState='gesture-required';
  root.dataset.fxCoreGyroPermission='gesture-required';
  root.dataset.fxCoreGyroState='tap-core-to-enable';
}else{
  permissionState='not-required';
  enableSensor();
}
root.dataset.fxCoreMotionR144='breathing-pointer-touch-gyro';
}());
