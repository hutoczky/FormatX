'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2]||'docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const method=source.indexOf('    updateMechanical(t,time){');
const neutralStart=source.indexOf('      // R2211:',method);
const first=neutralStart>=0?neutralStart:source.indexOf('      this.mechMaterial.color.setRGB(',method);
const end=source.indexOf('      // R2118:',first);
assert(first>method&&end>first,'The actual animated neutral metal section must be present');
assert(source.includes('const finale=smooth((t-7.20)/1.65);'),'Keep the authored material convergence clock');
const metals=['mechMaterial','mechMidMaterial','silverMaterial'];
const old=[[[.105,.140,.170],[.190,.230,.260]],[[.130,.180,.210],[.220,.270,.300]],[[.480,.575,.565],[.600,.660,.690]]];
const y=c=>c[0]*.2126+c[1]*.7152+c[2]*.0722;
const mix=(a,b,t)=>a+(b-a)*t;
const apply=new vm.Script('(function(finale){'+source.slice(first,end)+'})').runInNewContext({mix});
let maximumLuminanceDifference=0;
for(let step=0;step<=100;step++){
 const holder=Object.fromEntries(metals.map(name=>[name,{color:{setRGB(r,g,b){this.rgb=[r,g,b];}}}]));
 const t=step/100;apply.call(holder,t);
 for(let i=0;i<metals.length;i++){
  const rgb=holder[metals[i]].color.rgb;
  assert.equal(rgb[0],rgb[1],'The animated chassis must not reintroduce a green base tint');
  assert.equal(rgb[1],rgb[2],'The animated chassis must not reintroduce a blue base tint');
  const previous=old[i][0].map((v,c)=>mix(v,old[i][1][c],t));
  const difference=Math.abs(y(rgb)-y(previous));maximumLuminanceDifference=Math.max(maximumLuminanceDifference,difference);
  assert(difference<1e-12,'Preserve the original linear-light luminance ramp');
 }
}
console.log('MAG_NEUTRAL_SILVER_R2211_PASS',JSON.stringify({actualAnimatedSection:true,materialSamples:303,maximumLuminanceDifference,notRenderedBrightnessOrHardwareCertification:true}));
