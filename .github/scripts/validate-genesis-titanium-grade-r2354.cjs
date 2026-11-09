'use strict';
/* R2354 – real 3D cinematic titanium must converge to a smoked silver
   neutral native grade instead of the R2352 cyan/white plastic sheen.
   Source math tests supplement (not replace) real R656 Chromium photos. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const i=src.indexOf('    updateMechanical(t,time){');
const end=src.indexOf('\n    updateTentacles(t,time){',i);
assert(i>0&&end>i);
const block=src.slice(i,end);
const color=name=>{
 const anchor='this.'+name+'.color.setRGB(';
 const start=block.indexOf(anchor);assert(start>=0,name+' physical material not used');
 const token=block.slice(start+anchor.length,block.indexOf(');',start));
 const tuples=[...token.matchAll(/mix\(([-.\d]+),([-\.\d]+),finale\)/g)].map(z=>z.slice(1).map(Number));
 assert.equal(tuples.length,3,name+' must keep smooth RGB interpolation');
 return tuples;
};
const value=(name,field)=>{
 const rgx=new RegExp('this\\.'+name+'\\.'+field+'=mix\\(([-.\\d]+),([-\\.\\d]+),finale\\);');
 const match=block.match(rgx);assert(match,name+'.'+field+' PBR property lost');
 return [Number(match[1]),Number(match[2])];
};
const names=['mechMaterial','mechMidMaterial','silverMaterial'];
const finals={
 mechMaterial:{color:[.145,.164,.184],metalness:.79,roughness:.265,clearcoat:.66},
 mechMidMaterial:{color:[.205,.232,.249],metalness:.72,roughness:.235,clearcoat:.67},
 silverMaterial:{color:[.485,.538,.553],metalness:.86,roughness:.19,clearcoat:.86}
};
const early={
 mechMaterial:[.135,.155,.173],
 mechMidMaterial:[.172,.189,.206],
 silverMaterial:[.530,.595,.590]
};
const records={};
for(const name of names){
 const c=color(name), f=finals[name];
 for(let k=0;k<3;k++){
  assert(Math.abs(c[k][1]-f.color[k])<1e-12,name+' final RGB');
  assert(Math.abs(c[k][0]-early[name][k])<1e-12,name+' original pre-assembly RGB');
 }
 for(const param of ['metalness','roughness','clearcoat']){
  const v=value(name,param);
  assert(Math.abs(v[1]-f[param])<1e-12,name+' final PBR '+param);
  assert(v[1]>=0&&v[1]<=1,'Physical property out of range');
 }
 records[name]={rgbFinal:f.color,metalness:f.metalness,roughness:f.roughness,clearcoat:f.clearcoat};
}
assert(block.includes('const finale=smooth((t-7.20)/1.65);'),'Original continuous 10-second physical film chronology lost');
assert(block.includes('this.mechMaterial.transmission=mix(.052,.028,finale);'));
assert(block.includes('this.mechMidMaterial.transmission=mix(.070,.040,finale);'));
assert(block.includes('this.silverMaterial.transmission=mix(.028,.015,finale);'));
assert(block.includes('this.mechEyeCore.material.opacity=.92*opticWake;'));
assert(block.includes('const opticWake=smooth((t-7.44)/.78);'));
assert(src.includes('this.updateDNA(t,time);')&&src.includes('this.updateCore(t,time);')
  &&src.includes('this.updateMechanical(t,time);'));
assert(src.includes('this.mechMaterial=new T.MeshPhysicalMaterial({'));
assert(src.includes('bumpMap:this.microFiberTexture,bumpScale:.013,'));
assert(src.includes('bumpMap:this.microFiberTexture,bumpScale:.010,'));
assert(src.includes('bumpMap:this.microFiberTexture,bumpScale:.004,'));
assert(src.includes('const bodyScale=.001+.63*grow*mix(fade,.56,handoffCortex);'),
 'R2352 physical living iris convergence must survive');
console.log('MAG_R2354_PHYSICAL_SATIN_TITANIUM_SOURCE_PASS',
 JSON.stringify({materials:records,originalIntroAndDNA:true,noSecondMaterialOrRenderOwner:true,
   realFilmPixelReviewAndNativeColorMatchStillRequired:true}));
