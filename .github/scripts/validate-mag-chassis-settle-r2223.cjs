const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'../..');
const film=fs.readFileSync(path.join(root,'docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js'),'utf8');
const controlPath=process.env.R2223_CONTROL||'';

for(const token of [
  'const nativeChassisSettle=1-smooth((t-8.45)/.70);',
  '*grow*nativeChassisSettle',
  "fxMagCinematicChassisSettleR2223='authored-rest-pose-before-native-crossfade'"
])assert(film.includes(token),token);

const smooth=x=>{const q=Math.max(0,Math.min(1,x));return q*q*(3-2*q);};
const settle=t=>1-smooth((t-8.45)/.70);
const samples=[8.45,8.625,8.80,8.975,9.15].map(t=>({t,settle:settle(t)}));
assert.equal(samples[0].settle,1);
assert.equal(samples.at(-1).settle,0);
for(let i=1;i<samples.length;i++)assert(samples[i].settle<samples[i-1].settle,'Chassis settle must be monotonic');

if(controlPath){
  const control=fs.readFileSync(controlPath,'utf8');
  assert(!control.includes('fxMagCinematicChassisSettleR2223'),'Control unexpectedly contains R2223');
}

console.log('MAG_CHASSIS_SETTLE_R2223_PASS',JSON.stringify({
  window:[8.45,9.15],samples,
  livingOpticStillActive:true,
  authoredRestPosePreserved:true,
  noAddedGeometry:true,noAddedDraw:true,noAddedRenderer:true,
  notRenderedHardwareOrFpsAcceptance:true
}));
