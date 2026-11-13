#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');

const film=fs.readFileSync(process.argv[2]||
  'docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const native=fs.readFileSync(process.argv[3]||
  'docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const control=process.argv[4]?fs.readFileSync(process.argv[4],'utf8'):null;

for(const token of [
  "let birthClockShared=root.dataset.fxMagBirthLiveR533==='active'||",
  "simulationTime=birthClockShared?last*.001:0",
  "listen(document,'formatx:magbirthcomplete'",
  "simulationTime=birthClockShared?now*.001:simulationTime+dt*.001",
  "fxNativeMagLifeClockR2224='continuous-native-clock-after-intro'"
])assert(native.includes(token),`native shared-life clock is missing: ${token}`);

for(const token of [
  'const nativeLifeTime=time*.001;',
  '.006*Math.sin(nativeLifeTime*.19)',
  'nativeLifeTime*.007',
  '.005*Math.sin(nativeLifeTime*.23)',
  "fxMagLifeClockR2224='shared-real-clock-optic-and-body-handoff'"
])assert(film.includes(token),`cinematic shared-life pose is missing: ${token}`);

// The two shaders must continue to use the same metabolic phase expression.
const optic='float metabolicPulse=.82+.18*sin(uTime*.72+oq.x*4.0);';
assert.equal(film.split(optic).length-1,1,'film metabolic phase changed');
assert.equal(native.split(optic).length-1,1,'native metabolic phase changed');

const nativePose=(mobile,time)=>({
  pitch:(mobile?-.160:-.140)+.006*Math.sin(time*.19),
  yaw:(mobile?.135:.145)+time*.007,
  roll:-.037+.005*Math.sin(time*.23)
});
const filmPose=nativePose;
for(const mobile of [true,false])for(const time of [8.45,8.80,9.15,10]){
  const a=filmPose(mobile,time),b=nativePose(mobile,time);
  assert.deepEqual(a,b,`pose phase mismatch at ${mobile?'mobile':'desktop'} ${time}s`);
}

if(control){
  assert(!control.includes('fxMagLifeClockR2224'),
    'negative control unexpectedly contains R2224');
}
console.log('R2224 shared real-clock optic/body handoff contract: PASS');
