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
  'float assemble=curve(5.36,7.18,uPhase)',
  'const grow=smooth((t-5.88)/1.18)',
  'const opticWake=smooth((t-7.44)/.78)',
  'this.updateDNA(t,time)',
  'this.updateGenomeParticles(t,time)',
  'this.updateCore(t,time)',
  'this.updateMechanical(t,time)',
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
check(birth,['formatx-mag-genesis-three-r1280.js?v=20261025-r2182-dna-chapter-first'],
  'Live WebGL owner cache bust');
check(edge,['formatx-mag-genesis-three-r1280.js?v=20261025-r2182-dna-chapter-first'],
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
console.log('R2182_GENESIS_STORYBOARD_PASS DNA -> condensation -> cell -> four-arm titanium MAG -> optical ignition');
