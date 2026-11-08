'use strict';
/* R2351 — original living cell chemistry is the same on the visible lens.
   Full Chromium GPU screenshot & mobile performance acceptance remain separate. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const begin=s.indexOf('/* R2351: bound the original expensive living cell chemistry');
const end=s.indexOf('        c+=vec3(.05,.49,.51)*livingInterior',begin);
assert(begin>0&&end>begin,'Physical aperture shader and original tissue shading must exist');
const block=s.slice(begin,end);
for(const token of [
 'float livingInterior=0.0;', 'float coralSite=0.0;', 'float aquaSites=0.0;',
 'if(front>0.0 && od<1.55){',
 'float cellVein=sin(oq.x*23.0+sin(oq.y*19.0+uTime*.25)*2.1);',
 'float cellCross=sin(oq.y*31.0-oq.x*8.0+uTime*.18);',
 'float cellNoise=(cellVein*.55+cellCross*.45)*.5+.5;',
 'livingInterior=exp(-pow(od/.73,4.0))*front;',
 'coralSite=pow(max(0.0,cellNoise-.67)*3.0,2.6);',
 'aquaSites=pow(max(0.0,cellNoise-.33),3.1);'
])assert(block.includes(token),'R2351 original visible biological chemistry modified: '+token);
const envelope=od=>Math.exp(-Math.pow(od/.73,4));
const maxOmitted=envelope(1.55);
assert(maxOmitted<1.5e-9,'Aperture outer radius discards a visible chemical envelope');
const clamp=x=>Math.max(0,x);
function tissue(ox,oy,time,front){
 const od=Math.hypot(ox,oy);
 const cellVein=Math.sin(ox*23+Math.sin(oy*19+time*.25)*2.1);
 const cellCross=Math.sin(oy*31-ox*8+time*.18);
 const noise=(cellVein*.55+cellCross*.45)*.5+.5;
 return {od,living:envelope(od)*front,
   coral:Math.pow(clamp(noise-.67)*3,2.6),
   aqua:Math.pow(clamp(noise-.33),3.1)};
}
let inside=0,outside=0,maxInvisible=0;
for(const time of [0,2.5,5.5,7.5,9.25,28]){
 for(const angle of [0,.6,1.3,2.9,4.1,5.5]){
  for(const od of [0,.24,.5,.73,1.03,1.3,1.549,1.55,1.7,2.2,3.6]){
   const x=od*Math.cos(angle),y=od*Math.sin(angle);
   for(const front of [0,.35,1]){
    const old=tissue(x,y,time,front);
    const gated=(front>0&&od<1.55)?old:{...old,living:0,coral:0,aqua:0};
    if(front>0&&od<1.55){
     assert.deepEqual(gated,old,'Visible eye chemistry is not identical');inside++;
    }else{
     const oldCoralContribution=old.living*old.coral;
     const oldCyanContribution=old.living*old.aqua;
     maxInvisible=Math.max(maxInvisible,oldCoralContribution,oldCyanContribution);
     assert(maxInvisible<1.5e-9,'Omitted material contribution exceeds one sub-pixel LSB');
     outside++;
    }
   }
  }
 }
}
const next=s.slice(end,s.indexOf('/* R2275: a shaded anatomical interior',end));
assert(next.includes('c+=vec3(.05,.49,.51)*livingInterior*aquaSites*')&&
 next.includes('c+=vec3(.89,.27,.20)*livingInterior*coralSite*'),
 'Original tissue tint/falloff must still be rendered');
assert(s.includes('float opticalWell=pow(lensHeart,3.0)'));
assert(s.includes('if(vFacet<1.0 || machinedArmor>.5){'));
assert.equal((s.match(/createElement\('canvas'\)/g)||[]).length,1);
console.log('MAG_R2351_TRUE_APERTURE_BOUND_BIOCHEMISTRY_PASS',
 JSON.stringify({inside,outside,maxOmitted,maxInvisible,originalRenderedChemistry:true,
  singleOriginalGpuCanvas:true,realGpuAndHardwareAcceptanceRequired:true}));
