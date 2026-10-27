'use strict';
// R2219: deterministic source and timeline guard for the ACTUAL Three.js owner.
// This is a static contract, not a replacement for WebGL screenshots.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
assert.doesNotThrow(()=>new Function(src),'production Genesis renderer must parse');
const tokens=[
  'makeGenomeParticles(){',
  'const count=this.mobileRender?6000:9600;',
  'const u=Math.floor(i/2)/(count/2-1);',
  'const strand=i%2;',
  'if(strand===0){',
  'pairCellX=radius*.82*Math.sin(b)*Math.cos(a);',
  'this.genomeParticles.visible=visible;',
  'const t=clamp(r)*10;',
  'if(t<2.52) sc=.001;',
  'const appear=smooth((t-3.28)/1.02);',
  'this.coreGroup.visible=visible>.002;',
  'this.coreShell.material.opacity=0;',
  'this.irisGroup.visible=false;',
  'this.coreLight.intensity=0;'
];
for(const token of tokens)assert(src.includes(token),'Missing Genesis DNA-first invariant: '+token);
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const state=t=>{
 const appear=smooth((t-3.28)/1.02);
 const dissolve=1-smooth((t-5.66)/1.12);
 return {nucleusVisible:appear*dissolve>.002,
   nucleusOpacity:.76*appear*dissolve,
   coreScale:t<2.52?.001:t<3.28?.001+(.94-.001)*smooth((t-2.52)/.76):.94};
};
for(const t of [0,.5,1,2,2.5,3.28]){
 const frame=state(t);
 assert(!frame.nucleusVisible,'Nucleus must not precede DNA at '+t+'s');
 assert.equal(frame.nucleusOpacity,0,'Nucleus must be transparent at '+t+'s');
}
assert(state(3.8).nucleusVisible,'Biological nucleus should appear after DNA');
assert(state(4.5).nucleusOpacity>.4,'Living nucleus must be readable at 4.5s');
assert(src.indexOf('this.updateGenomeParticles(t,time);')<src.indexOf('this.updateCore(t,time);'),
 'DNA particle update must precede nucleus update');
console.log('R2219 DNA-first source/timeline contract PASS; visual WebGL proof remains required');
