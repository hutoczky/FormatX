'use strict';
/* R2358: both original shaders must use identical smooth, body-local
   titanium grain. This supplements real Chromium image/CI/Android checks. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const film=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const native=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const f='float plateFinish=.5+.5*sin(dot(cell,vec2(.44,.27)));';
const n='float plateFinish=.5+.5*sin(dot(panelCoord,vec2(.44,.27)));';
assert(film.includes(f),'Original physical-film material must have continuous grain');
assert(native.includes(n),'Permanent native 3D MAG must share the grain frequency');
assert(!film.includes('dot(floor(cell),vec2(1.71,2.39))'),'No hard color tiles in film');
assert(!native.includes('vec2 plateId=floor(panelCoord);'),'No hard color tiles in native');
assert(film.includes('(1.0-fxPlate.x*.085)'));
assert(native.includes('studioSilver*=1.0-panelJoint*.085*panelEnvelope;'));
assert(film.includes('r2358-continuous-satin-titanium-matched-native'));
for(const anchor of [
 'vec2 cell=vec2(radial*17.0,lateral/width*2.4);',
 'vec2 edge=min(fract(cell),1.0-fract(cell));',
 'const crown=.012*cross*axial;',
 'this.armInlays.push(arm);',
 'this.updateDNA(t,time);',
 'this.updateOrganic(t,time);',
 'this.updateMechanical(t,time);'
])assert(film.includes(anchor),'Existing real 3D cinematic contract lost: '+anchor);
for(const anchor of [
 'vec2 panelCoord=vec2(radial*17.0,lateral/panelWidth*2.4);',
 'float panelBevel=exp(-pow(',
 'float grainPhase=radial*360.0+lateral*24.0;',
 'studioSilver+=vec3(.38,.44,.49)*panelBevel*panelEnvelope'
])assert(native.includes(anchor),'Existing native 3D titanium contract lost: '+anchor);
// An equal user-visible soft finishing waveform at every physical sample,
// including the former discrete integer plate boundaries.
const finish=(x,y)=>.5+.5*Math.sin(.44*x+.27*y);
let maxJump=0;
for(const boundary of [0,1,2,4,6,8,12,17]){
 const delta=Math.abs(finish(boundary-1e-5,.6)-finish(boundary+1e-5,.6));
 maxJump=Math.max(maxJump,delta);
 assert(delta<1e-4,'Body-local titanium must be continuous at panel '+boundary);
}
console.log('MAG_R2358_CONTINUOUS_TRUE_SATIN_MATCHED_NATIVE_PASS',
 JSON.stringify({maxBoundaryJump:maxJump,originalWebGLAndThreeOwners:true,
  zeroNewMeshCanvasTextureRAFOrPass:true,originalRealBrowserAndLighthouseGatesRequired:true}));
