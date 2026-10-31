'use strict';
/* R2261: suppress redundant native GPU work behind the fully opaque Genesis
   film. Preserve one warm frame, normal visible crossfade, true single-owner
   GPU-fence handoff and all original geometry/shader declarations. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const text=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
assert.doesNotThrow(()=>new Function(text),'native MAG JavaScript parses');
const start=text.indexOf('    function filmConcealsNativeR2261(){');
const end=text.indexOf('    function frame(now){',start);
assert(start>0&&end>start,'film concealment predicate missing');
const predicate=new Function('root','stage',
  text.slice(start,end)+'return filmConcealsNativeR2261();');
const root=(active)=>({
  dataset:{fxMagBirthLiveR533:active?'active':'complete'},
  getAttribute:(name)=>name==='data-fx-mag-birth-live'&&active?'active':null
});
const stage=(alpha,concealed,deferred)=>({
  dataset:{
    fxBirthConcealedR2174:concealed?'true':'post-assembly-reveal',
    fxBirthDeferredR2173:deferred?'true':'false'
  },
  style:{getPropertyValue:(name)=>name==='opacity'?String(alpha):''}
});
assert.equal(predicate(root(true),stage('0',true,true)),true,
  'DNA and cell phases must suppress invisible native frames');
assert.equal(predicate(root(true),stage('0',false,true)),true,
  'initial stage opacity must suppress hidden frames before first morph');
assert.equal(predicate(root(true),stage('0.20',false,true)),false,
  'crossfade must keep actual physical WebGL animation');
assert.equal(predicate(root(true),stage('1',false,false)),false,
  'fully revealed native MAG must be unthrottled');
assert.equal(predicate(root(false),stage('0',true,true)),false,
  'no film must retain the normal standalone MAG runtime');
const head=text.slice(end,text.indexOf('      /* R1622',end));
assert(head.includes('raf=0;if(blocked())return;'),
  'PAUSE and browser visibility must still own scheduling');
assert(head.includes('if(filmConcealsNativeR2261()){'),
  'occlusion test must precede any normal frame draw');
assert(head.includes('if(concealedWarmFramesR2261>=1){'),
  'one original warm GPU frame must remain');
assert(head.includes('++concealedSkippedFramesR2261;')&&
  head.includes('burstFrames=0;')&&
  head.includes('return;'),
  'subsequent invisible frames must be discarded without additional RAF');
assert(head.includes('concealedWarmFramesR2261=1;'),
  'first shader/prewarm frame must still execute');
assert(head.includes('if(pendingGpuFenceR2253){'),
  'original asynchronous GPU-fence guard must survive');
assert(text.includes('root.dataset.fxMagHiddenFramesSkippedR2261=String(concealedSkippedFramesR2261)'),
  'publish final skip count once at the real cinematic GPU gate');
assert(text.includes("listen(document,'formatx:magbirthprepare',prepareNativeFrameR2254"),
  'do not bypass the real cinematic GPU preparation');
assert(text.includes("root.dataset.fxMagHandoffGpuR2226='finished'"),
  'real GPU completion gate must remain');
assert(text.includes('gl.readPixels('),
  'retain real native center-pixel proof');
console.log('MAG_R2261_HIDDEN_FILM_GPU_CADENCE_PASS');
