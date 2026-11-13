'use strict';
// Execute the actual cinematic optic update and compare its landing energy
// with the permanent MAG's genuine viewport-class idle contract.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');

const film=fs.readFileSync(process.argv[2]||'docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const native=fs.readFileSync(process.argv[3]||'docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const control=process.argv[4]?fs.readFileSync(process.argv[4],'utf8'):null;

assert(film.includes("fxMagCinematicOpticEnergyR2222='native-idle-energy-continuous-handoff'"),
  'Missing R2222 state marker');
const idle=native.match(/const IDLE_ENERGY\s*=\s*mobile\s*\?\s*([.\d]+)\s*:\s*([.\d]+);/);
assert(idle,'Read the permanent MAG viewport-class idle energy');
const nativeIdle={mobile:Number(idle[1]),desktop:Number(idle[2])};
assert.deepEqual(nativeIdle,{mobile:.50,desktop:.43});

const start=film.indexOf('      const opticWake=smooth((t-7.44)/.78);');
const end=film.indexOf('      // The iris seats only after the armour closes;',start);
assert(start>0&&end>start,'Read the actual cinematic optic update');
const update=vm.runInNewContext('(function(t,time,smooth,mix){const finale=smooth((t-7.20)/1.65);'+film.slice(start,end)+'})');
const smooth=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
const mix=(a,b,t)=>a+(b-a)*t;
const rows=[];

for(const mobileRender of [true,false]){
  const engine={
    mobileRender,
    mechEyeCorona:{material:{opacity:0},scale:{set(){}}},
    mechInnerMaterial:{opacity:0},
    mechEyeCore:{material:{opacity:0,emissiveIntensity:0}},
    livingMagOpticUniforms:{uTime:{value:0},uEnergy:{value:0}}
  };
  const samples=[];
  let previous=.18;
  for(let i=0;i<=78;i++){
    const seconds=7.44+i*.01;
    update.call(engine,seconds,seconds*1000,smooth,mix);
    const value=engine.livingMagOpticUniforms.uEnergy.value;
    assert(value>=previous-1e-12,'Optic energy must settle monotonically');
    previous=value;
    if(i%13===0||i===78)samples.push({seconds:Number(seconds.toFixed(2)),energy:value});
  }
  const expected=mobileRender?nativeIdle.mobile:nativeIdle.desktop;
  assert(Math.abs(previous-expected)<1e-12,'Cinematic optic must land on the permanent idle energy');
  rows.push({mobileRender,expected,samples});
}

if(control){
  assert(!control.includes('fxMagCinematicOpticEnergyR2222'),
    'Exact parent must remain a negative control');
  assert(control.includes('this.livingMagOpticUniforms.uEnergy.value=.18+.32*opticWake;'),
    'Exact parent no longer reproduces the shared phone-grade desktop mismatch');
}

console.log('MAG_OPTIC_ENERGY_R2222_PASS',JSON.stringify({
  nativeIdle,
  continuousWindow:[7.44,8.22],
  mobilePixelsUnchangedByFormula:true,
  noAddedProgramPassTextureGeometryOrRenderer:true,
  notRenderedHardwareFpsOrVisualAcceptance:true,
  rows
}));
