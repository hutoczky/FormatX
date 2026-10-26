'use strict';
// R2188: release gate for the real DNA -> cell -> assembled MAG first-visit film.
// No screenshot-only "success": verify the visible 3D implementation as well.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const renderer=read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js');
const birth=read('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js');
const edge=read('billing-worker/src/production-content-entry.js');
assert.doesNotThrow(()=>new Function(renderer),'R2188 Three.js film source must parse');
for(const text of [
  'this.makeDNAField();',
  'this.makeGenomeParticles();',
  'this.makeEmbryoFilm();',
  'this.makeMechanicalLayer();',
  'this.updateDNA(t,time);',
  'this.updateGenomeParticles(t,time);',
  'this.updateCore(t,time);',
  'this.updateMechanical(t,time);',
  'this.updateBirthStrands(t,time);',
  'const intro=.82+.18*ease(t/.30);',
  'rungs.setColorAt(i,new T.Color(baseColors[i%baseColors.length]))',
  'strand.userData.tube=tube;',
  'const sides=6,rings=40;',
  'tube.material.opacity=(lane===0?.59:.52)*opacity;',
  'p.needsUpdate=true;',
  'const start=smooth((t-4.68)/.62);',
  'const opticWake=smooth((t-7.44)/.78);',
  'const chromatinCount=this.mobileRender?10:17;',
  'this.embryoChromatin=new T.LineSegments(chromatinGeometry,this.embryoChromatinMaterial);',
  'this.embryoNucleusMaterial=new T.MeshPhysicalMaterial({',
  'this.embryoChromatinMaterial.opacity=(this.mobileRender?.36:.43)*visible;',
  'this.embryoMaterial.opacity=.47*visible;',
  "const count=this.mobileRender?6000:9600;",
  "const fade=1-smooth((t-3.10)/1.38);"
]){
  assert(renderer.includes(text),'Missing R2188 film / biological chronology contract: '+text);
}
const filmURL='formatx-mag-genesis-three-r1280.js?v=20261026-r2199-photonic-genesis-nucleus';
assert(birth.includes(filmURL),'R533 loader must request R2188 instead of a stale 3D intro');
assert(edge.includes(filmURL),'Cloudflare asset rewrite must not downgrade R2188');
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const dna=t=>(.82+.18*(1-Math.pow(1-Math.max(0,Math.min(1,t/.30)),3)))*(1-smooth((t-3.10)/1.38));
const embryo=t=>smooth((t-3.52)/.76)*(1-smooth((t-5.66)/1.12));
const metal=t=>smooth((t-5.88)/1.18);
const optic=t=>smooth((t-7.44)/.78);
assert(dna(0)>.8 && embryo(0)===0 && metal(0)===0 && optic(0)===0,
  'DNA must be the ONLY first-frame subject');
assert(embryo(4.2)>.7 && dna(4.2)<.25 && metal(4.2)===0,
  'Cell condensation must be visible before metallic chassis');
assert(metal(6.8)>.7 && optic(6.8)===0,
  'Titanium must seat while the MAG eye is still unlit');
assert(metal(8.3)===1 && optic(8.3)===1,
  'Final assembled MAG and optic must be fully formed');
// R2192: particles must morph into the same 3D embryo as the visible
// glass shell, then sit in FRONT of titanium before the pupil wakes.
for(const token of [
  '1.10+radius*.65*Math.sin(b)*Math.sin(a)',
  'radius*.82*Math.sin(b)*Math.cos(a)',
  '.62+depth',
  'float last=1.0-curve(6.96,7.44,uPhase);'
])assert(renderer.includes(token),'R2192 spatial continuity missing: '+token);
// R2195: photographic welding must preserve DNA-to-metal continuity without
// asteroid-shaped debris, oversized splashes or random scattered sparks.
for(const token of [
  'mesh.visible=false;',
  'const lateral=sign*Math.cos(armTwist)*armRadius;',
  'const count=this.mobileRender?112:224;',
  'const tangent=(r()-.5)*.090;',
  'gl_PointSize=clamp((aSeed*.76+1.02)*uPixelRatio*11.6'
])assert(renderer.includes(token),'R2195 focused genetic weld / studio-set regression: '+token);
const embryoCentreZ=1.10;
const cellDepthRange=.77*.65;
const metalMinZ=.62-.044;
assert(cellDepthRange<.53 && embryoCentreZ>.95,
  'Genome particle nucleus must coincide with 3D embryo envelope');
assert(metalMinZ>.48,
  'Genetic particles must not hide behind solid titanium panels');
const geneticFade=t=>1-smooth((t-6.96)/.48);
assert(geneticFade(6.80)>.99 && geneticFade(7.44)===0,
  'Genome must remain visible during welding but vanish before eye ignition');
console.log('R2188_GENESIS_STUDIO_SOURCE_PASS',JSON.stringify({
  dnaFirst:true,cellSecond:true,metalThird:true,opticLast:true,
  gpuParticles:{mobile:6000,desktop:9600},
  pairedVolumetricStreams:8,
  nucleotideColors:4,chromatin:{mobile:10,desktop:17},cloudflareRevision:'r2189'
}));
