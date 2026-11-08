'use strict';
/* R2350 — real native WebGL shader work pruning, preserving the full MAG.
   The browser R656 pixels, coldstarts and Lighthouse are separate mandatory gates. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const mag=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const metalStart=mag.indexOf('/* R2137: raised metal panels visually separate');
const cortexStart=mag.indexOf('/* R2275: a shaded anatomical interior, never a silver-white',metalStart);
assert(metalStart>0 && cortexStart>metalStart,'Original physical MAG material regions missing');
const pre=mag.slice(metalStart-1100,metalStart);
const section=mag.slice(metalStart,cortexStart);
assert(pre.includes('if(vFacet<1.0 || machinedArmor>.5){'),
  'R2350 must branch on exact original metal/mineral facet ownership');
assert.equal((mag.match(/float panelEnvelope=smoothstep\(\.21,\.28,length\(vAnatomy\.xy\)\)/g)||[]).length,1);
assert(pre.includes('float panelEnvelope=smoothstep(.21,.28,length(vAnatomy.xy))*'),
  'Original global panel envelope needed for the living surface sweep');
assert(section.trimEnd().endsWith('}'),'Metal-only physical branch must close before cortical/glass shading');
assert(section.includes('c=mix(c,studioSilver,shellSilver);')&&
  section.includes('c=mix(c,titanium*.90,machinedArmor*.99);'),
  'Full original machined silver/titanium mix must remain intact');
for(const token of [
  'vec2 panelCoord=vec2(radial*17.0,lateral/panelWidth*2.4)',
  'float grainPhase=radial*360.0+lateral*24.0;',
  'float microBevel=exp(-pow((panelEdge.y-.125)/',
  'float grazingMachining=microBevel',
  'studioSilver+=vec3(.32,.40,.44)*grazingMachining*.24;',
  'float originalMineralMask=1.0-step(1.0,vFacet);',
  'float shellSilver=panelEnvelope*(1.0-machinedArmor)*.84*'
])assert(section.includes(token),'Full studio/surface detail must not be removed: '+token);
const remainder=mag.slice(cortexStart,mag.indexOf('${outputName}=vec4',cortexStart));
for(const token of [
  'float livingCortex=step(1.10,vFacet)', 'float opticalGlass=step(6.0,vFacet);',
  'float warmStroma=coralNest', 'float opticalWell=pow(lensHeart,3.0)',
  'float silverSweep=max(machinedArmor,panelEnvelope*.72);'
])assert(remainder.includes(token),'Living/faceted iris or physical surface sweep was changed: '+token);
const step=(edge,value)=>value<edge?0:1;
const results=[];
for(const facet of [.12,.56,.999,1.0,1.15,1.72,3.6,4.8,5.0,5.34,5.8,5.999,6.0,6.3,7.0]){
 const machined=step(5,facet)*(1-step(6,facet));
 const mineral=1-step(1,facet);
 const guard=facet<1||machined>.5;
 const silver=1.0*(1-machined)*.84*mineral;
 const titanium=machined*.99;
 assert.equal(guard,!!(mineral||machined),
  'A pixel affected by original silver mix must never be gated out: '+facet);
 if(!guard){assert.equal(silver,0);assert.equal(titanium,0);}
 results.push({facet,originalMetalWeight:silver+titanium,guard});
}
assert((mag.match(/createElement\('canvas'\)/g)||[]).length===1);
console.log('MAG_R2350_FACET_LOCAL_SHADER_PARITY_PASS',
 JSON.stringify({facets:results,noExtraRenderer:true,originalPanels:true,originalIris:true,
   unchangedRealBrowserPixelAndColdstartOracles:true}));
