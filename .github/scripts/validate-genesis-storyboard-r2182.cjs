'use strict';
// R2182 — source-level storyboard guard for the actual R1280 Three.js owner.
// A deterministic chapter order matters more than isolated screenshot checks.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const gpu=read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js');
const birth=read('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js');
const css=read('docs/scifi-ui/styles/formatx-mag-birth-live-r533.css');
const html=read('docs/scifi-ui/index.html');
const edge=read('billing-worker/src/production-content-entry.js');
const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
const check=(source,needles,label)=>{
  for(const needle of needles)assert(source.includes(needle),label+': '+needle);
};
check(gpu,[
  'const fade=1-smooth((t-3.10)/1.38)',
  'const embryoFocus=smooth((t-3.12)/1.04)',
  'const appear=smooth((t-3.52)/.76)',
  'const grow=smooth((t-3.76)/.72)',
  'const grow=smooth((t-3.90)/.70)',
  'float condense=curve(2.94,4.38,uPhase)',
  'float assemble=curve(5.34+armBeat,6.90+armBeat,uPhase)',
  'const grow=smooth((t-5.88)/1.18)',
  'const opticWake=smooth((t-7.44)/.78)',
  'this.updateDNA(t,time)',
  'this.updateGenomeParticles(t,time)',
  'this.updateCore(t,time)',
  'this.updateMechanical(t,time)',
  'this.updateAssemblyWeld(t,time)',
  'this.coreGroup.visible=visible>.002'
],'Three.js storyboard');
check(css,[
  'R2182 — single-subject genesis staging',
  '.fx-mag-birth-r533[data-phase="0"]',
  '.fx-mag-birth-r533[data-phase="1"]',
  '.fx-mag-birth-r533[data-phase="2"]',
  'background-color:#010407',
  '.fx-mag-birth-r533[data-phase="4"]',
  'background-color:rgba(1,4,7,0)'
],'No premature native-MAG reveal');
check(html,['formatx-mag-birth-live-r533.css?v=20261025-r2182-dna-chapter-first'],
  'Static stylesheet cache bust');
check(birth,['formatx-mag-genesis-three-r1280.js?v=20261025-r2189-living-chromatin-nucleus'],
  'Live WebGL owner cache bust');
check(edge,['formatx-mag-genesis-three-r1280.js?v=20261025-r2189-living-chromatin-nucleus'],
  'Cloudflare rewrite must not serve an older film');
const embryo=t=>smooth((t-3.52)/.76)*(1-smooth((t-5.66)/1.12));
const arm=t=>smooth((t-5.88)/1.18);
const dna=t=>1-smooth((t-3.10)/1.38);
assert.equal(embryo(2.4),0,'Embryo visible during DNA opening');
assert.equal(arm(4.5),0,'The permanent titanium MAG appeared before condensation');
assert(dna(1.3)>.999,'DNA loses its establishing shot');
assert(dna(3.50)>.70,'DNA disappears before genetic condensation');
assert(embryo(4.4)>.98,'The cell fails to materialize after DNA condensation');
assert(arm(7.2)>.99,'The titanium MAG is still missing after assembly');
assert.equal(smooth((7.3-7.44)/.78),0,'The optical eye ignites before seating');
assert(smooth((8.4-7.44)/.78)>.99,'The finished MAG eye never ignites');
// R2184: paired nucleotide color/arm routing and four staggered seating beats.
// i%4 assigned alternating DNA strands to disjoint opposite arm pairs:
// cyan ONLY north/south and violet ONLY east/west. Now the two physical
// nucleotides at each base-pair station must travel to the same MAG arm.
check(gpu,[
  'const armIndex=new Float32Array(count)',
  'const axis=Math.floor(i/2)%4',
  'armIndex[i]=axis',
  "geometry.setAttribute('aArmIndex',new T.BufferAttribute(armIndex,1))",
  'attribute float aArmIndex;',
  'float armBeat=aArmIndex*.11;',
  'float curlEnvelope=assemble*(1.0-assemble);'
],'Nucleotide pairing and staggered four-arm morph');
assert(!gpu.includes('const axis=i%4,phi=axis*Math.PI*.5;'),
  'The old strand-parity-based arm assignment has returned');
for(let pair=0;pair<96;pair++){
  const first=Math.floor((pair*2)/2)%4;
  const second=Math.floor((pair*2+1)/2)%4;
  assert.equal(first,second,'One DNA base pair was routed to different arms');
}
for(const axis of [0,1,2,3]){
  const armBeat=axis*.11;
  const endTime=6.90+armBeat;
  assert(endTime<7.44,'A genetic arm assembled after the optic ignited');
}
// R2183: enforce real, independent sources for every MAG arm on desktop and
// mobile. Previously the nearest-X/Y heuristic left the south arm unconnected.
const assignment=gpu.match(/const armAssignments=this\.mobileRender\s*\?\s*(\[[^\]]+\])\s*:\s*(\[[^\]]+\]);/);
assert(assignment,'Missing explicit mobile/desktop DNA donor routing');
const routes=[JSON.parse(assignment[1]),JSON.parse(assignment[2])];
for(const [index,arms] of routes.entries()){
  const label=index===0?'mobile':'desktop';
  assert.equal(arms.length,index===0?4:7,label+' DNA donor count drift');
  for(const axis of [0,1,2,3]){
    assert(arms.includes(axis),label+' MAG arm '+axis+' has no DNA donor');
  }
}
check(gpu,[
  'return b.armAxis===axis;',
  'const nearestAxis=b.armAxis;',
  'line.userData.source=candidates[0]||null;',
  "throw new Error('Every MAG arm requires an actual DNA donor source')",
  "throw new Error('A true double helix needs two strands from one donor')"
],'DNA bridge must preserve paired helix source across all four titanium axes');
// R2186: genetic streams visibly precede the final metal shell
// and fade completely BEFORE the optical eye wakes.
check(gpu,[
  'const end=1-smooth((t-6.76)/.58)',
  'line.material.opacity=(lane===0?.70:.54)*opacity',
  'bridge.material.opacity=.48*opacity',
  'float transferGlow=curve(5.50,6.05,uPhase)*(1.0-curve(7.02,7.38,uPhase));',
  'vEnergy=first*last*(1.0+transferGlow*.16);',
  'this.assemblyWeldMaterial.uniforms.uIntensity.value=strength',
  'const count=this.mobileRender?160:320'
],'R2186 visible paired genetic-to-titanium transfer');
const transfer=t=>1-smooth((t-6.76)/.58);
assert(transfer(6.8)>.98,'Genetic bridge must still be luminous during arm assembly');
assert.equal(transfer(7.44),0,'DNA transfer must finish before the optical ignition');
console.log('R2184_GENESIS_STORYBOARD_PASS paired DNA -> biological nucleus -> staggered four-arm titanium MAG -> optical ignition');
