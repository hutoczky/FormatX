'use strict';
// R2199 cinematic birth: guard actual executable WebGL optics, not screenshots.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const engine=read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js');
const birth=read('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js');
const rescue=read('docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js');
const html=read('docs/scifi-ui/index.html');
const worker=read('billing-worker/src/production-content-entry.js');
assert.doesNotThrow(()=>new Function(engine),'R2199 Three.js cinema must parse');
for(const [name,source] of [['R533',birth],['rescue',rescue]])
  assert.doesNotThrow(()=>new Function(source),name+' must parse');
const checks=[
  ['3D atmospheric background','makeCosmicAtmosphere(){'],
  ['blue/violet DNA stage','float dna=1.0-smoothstep(2.60,3.85,uPhase);'],
  ['turquoise embryo atmosphere','float embryo=smoothstep(2.95,3.72,uPhase)*'],
  ['3D photon creation','makeCinematicBiophotons(){'],
  ['3D photon update','updateCinematicBiophotons(t,time){'],
  ['DNA founding parent','parent.add(dna.points);'],
  ['biological cell parent','this.coreGroup.add(embryo.points);'],
  ['DNA particle density',"build(this.mobileRender?260:620,'dna')"],
  ['cellular photon density',"build(this.mobileRender?850:2200,'embryo')"],
  ['photo-real bokeh softness','gl_PointCoord-.5'],
  ['3D WebGL soft glow','fragmentShader:'],
  ['cyan/purple DNA palette','new T.Color(0xbd86ff)'],
  ['teal/coral cell palette','new T.Color(0xffa257)'],
  ['near-lens DNA approach',"z=mix(this.mobileRender?5.15:4.68,4.88,k);"],
  ['large living cell',"const embryoScale=this.mobileRender?.94:1.07;"],
  ['translucent biological membrane',"this.embryoMaterial.opacity=.86*visible;"],
  ['volumetric organelle',"this.embryoNucleusMaterial.opacity=.82*visible;"],
  ['first-frame genome','this.makeGenomeParticles();'],
  ['physical titanium chassis','this.updateMechanical(t,time);'],
  ['final optic awakening','const opticWake=smooth((t-7.44)/.'],
];
for(const [label,token] of checks)
  assert(engine.includes(token),'R2199 missing '+label+': '+token);
// Camera, genetic matter and embryonic shell are already animated in the
// master 10-second cinematic; do not let the bokeh become an independent video.
const creation=engine.indexOf('this.makeCinematicBiophotons();');
const film=engine.indexOf('this.makeEmbryoFilm();');
const mechanical=engine.indexOf('this.makeMechanicalLayer();');
assert(film>=0 && film<creation && creation<mechanical,
  'Biophotonic field must be constructed between embryo and metal');
const updateCore=engine.indexOf('this.updateCore(t,time);');
const updatePhotons=engine.indexOf('this.updateCinematicBiophotons(t,time);');
const updateMech=engine.indexOf('this.updateMechanical(t,time);');
assert(updateCore>=0&&updateCore<updatePhotons&&updatePhotons<updateMech,
  'Film update order must be biological before mechanical');
assert(engine.includes('setup(this.dnaBiofield,(1-smooth((t-2.94)/1.42))*.84);'),
  'Opening molecule lights must fade before the embryo becomes dominant');
assert(engine.includes('smooth((t-3.47)/.66)*(1-smooth((t-5.63)/1.03))*.94'),
  'Biological lights must extinguish before titanium assembly');
assert(engine.includes('const count=this.mobileRender?6000:9600;'),
  'GPU nucleotide morph must remain 6000/9600 instances');
// R2201: recovery/canonical boot load R533 while R533/edge load R1280.
for(const [label,src,revision] of [
  ['R533',birth,'20261026-r2202-aa-focused-microcell'],
  ['rescue',rescue,'20261026-r2202-aa-focused-genesis'],
  ['HTML',html,'20261026-r2202-aa-focused-genesis'],
  ['Worker',worker,'20261026-r2202-aa-focused-microcell']
]){
  assert(src.includes(revision),'Stale '+label+' cinematic delivery cache: '+revision);
}
assert(html.includes('INLINE_R2199_BOOT_HASH')===false,
  'CSP hash constants belong in the Worker, not in HTML');
assert(worker.includes('INLINE_R2199_BOOT_HASH'),
  'Worker must authorize the exact R2199 first-byte bootstrap');
console.log('R2199_BIOPHOTONIC_GENESIS_PASS',{
  dnaPhotons:620,embryoPhotons:2200,genomeParticles:9600,
  mobileDnaPhotons:260,mobileEmbryoPhotons:850,mobileGenome:6000
});
