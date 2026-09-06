/* FormatX R561 — mobile native MAG context policy.
   Mobile R326 requests WebGL2 first for compatibility. This one-shot policy
   declines that request so the existing canonical renderer naturally takes its
   WebGL1 fallback, with antialiasing disabled to reduce synchronous software/GPU
   context cost. Desktop behavior is untouched. No audit or input gate exists. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMagContextPolicyR561)return;
const mobile=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
root.dataset.fxMagContextPolicyR561=mobile?'armed-mobile-webgl1-first':'desktop-no-op';
if(!mobile)return;
const proto=HTMLCanvasElement.prototype;
const original=proto.getContext;
let restored=false;
function restore(){
  if(restored)return;restored=true;
  if(proto.getContext===wrapped)proto.getContext=original;
  root.dataset.fxMagContextPolicyR561='released-after-mobile-context';
}
function wrapped(type,options){
  const kind=String(type||'').toLowerCase();
  if(kind==='webgl2'){
    root.dataset.fxMagContextR561='webgl2-declined-mobile';
    return null;
  }
  if(kind==='webgl'||kind==='experimental-webgl'){
    const next=Object.assign({},options||{}, {antialias:false,powerPreference:'high-performance'});
    const context=original.call(this,type,next);
    root.dataset.fxMagContextR561=context?'webgl1-mobile-antialias-off':'webgl1-unavailable';
    queueMicrotask(restore);
    return context;
  }
  return original.call(this,type,options);
}
try{proto.getContext=wrapped;}catch(_){root.dataset.fxMagContextPolicyR561='prototype-write-failed';}
setTimeout(restore,4000);
}());
