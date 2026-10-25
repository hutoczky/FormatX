'use strict';
// R2148 + R2143 regression: the root-domain homepage must load the same native
// Three.js birth engine as /scifi-ui/index.html. A page-relative import
// once resolved to /scripts/three-r185.module.js and forced the 2D fallback.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');
const engine=read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js');
const birth=read('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js');
const worker=read('billing-worker/src/production-content-entry.js');
const permanent=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const home=read('docs/scifi-ui/index.html');
const rescue=read('docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js');
const modulePath='/scifi-ui/scripts/three-r185.module.js';
// R2176: production source validation must parse the ACTUAL Three.js film;
// the earlier gate missed a duplicate const inside its genome loop.
assert.doesNotThrow(()=>new Function(engine),
  'The production DNA-to-MAG Three.js cinematic contains invalid JavaScript');
const revision='formatx-mag-genesis-three-r1280.js?v=20261025-r2184-paired-genetic-morph';
assert.ok(fs.statSync('docs'+modulePath).size>1000,'Real bundled Three.js module absent');
assert.ok(engine.includes("new URL('/scifi-ui/scripts/three-r185.module.js', location.origin).href"),
  '3D cinematic must resolve bundled Three.js against the canonical origin');
assert.ok(!engine.includes("new URL('./scripts/three-r185.module.js', location.href)"),
  'Page-relative Three.js import would break canonical root homepage');
// R2146 portrait composition must keep a real central 3D helix visible.
assert.ok(engine.includes('const placements=this.mobileRender?[') &&
  engine.includes('[.00,.06,.60,1.57,.92]') &&
  engine.includes('[.00,-.87,-.20,1.58,.39]'),
  'Portrait Three.js DNA must be centered within the mobile camera frustum');
// R2165: prevent the original offscreen desktop panorama from replacing
// the new first-frame, fully visible DNA double helix.
assert.ok(engine.includes('[.00,.03,.55,1.57,.76]') &&
  engine.includes('[-2.00,1.02,-.34,-.44,.43]') &&
  engine.includes('[2.00,1.02,-.34,.44,.43]'),
  'Desktop first-frame must establish a central helix and subdued arm donors');
assert.ok(engine.includes('const grow=smooth((t-5.88)/1.18)') &&
  engine.includes('const opticWake=smooth((t-7.44)/.78)') &&
  engine.includes('this.birthRungs.forEach((bridge,axis)=>'),
  'Narrative continuity must be DNA -> paired arm transfer -> assembled MAG -> eye ignition');
// R2164: enforce the story as real staged geometry, not metadata/CSS copy.
const desktopPlacement=engine.split('const placements=this.mobileRender?[')[1]?.split(']:[')[1]
  ?.match(/\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]/);
assert.ok(desktopPlacement,'Desktop DNA placements are missing');
const [heroX,heroY,heroZ,heroRotation,heroScale]=desktopPlacement.slice(1).map(Number);
assert.ok(Math.abs(heroX)<.10 && Math.abs(heroY)<.10 && heroZ>.45 &&
  Math.abs(heroRotation-Math.PI/2)<.15 && heroScale>.70,
  'Desktop establishing shot must show a centered, vertical 3D double helix');
assert.ok(engine.includes('h.userData.primary=Math.abs(x)<.03&&Math.abs(y)<.09&&z>.50'),
  'Desktop cinematic has no authoritative founding DNA');
// R2176: the GPU nucleotides must follow precisely the same authored
// 3.82-turn, 4.08-unit founding DNA, instead of an overlapping 7.75-turn
// particle ribbon. Colour both antiparallel strands consistently.
for(const token of [
  "const founding=this.dnas.find(h=>h.userData.primary)",
  "const u=Math.floor(i/2)/(count/2-1)",
  "const phase=u*Math.PI*2*3.82",
  "const localX=(u-.5)*4.08",
  "const localY=sign*Math.sin(phase)*helixRadius",
  "const localZ=sign*Math.cos(phase)*helixRadius",
  "const rolledX=localX*cosZ-localY*sinZ",
  "origin.z+scale*(-rolledX*sinY+localZ*cosY)",
  "seed[i]=strand===0?r()*.42:.58+r()*.42",
  "smoothstep(.46,.54,vSeed)"
]){
  assert.ok(engine.includes(token),'R2176 founding double-helix particle mismatch: '+token);
}
assert.ok(!engine.includes('u*Math.PI*15.5+strand*Math.PI'),
  'Do not overlay an unrelated twice-coiled DNA particle geometry');

assert.ok(engine.includes('const donorEnvelope=smooth((t-4.38)/.48)*(1-smooth((t-5.95)/.85))') &&
  engine.includes('h.userData.primary?fade:donorEnvelope*.27'),
  'Secondary DNA must stay dark through the biological chapter and feed later assembly');
// R2172: verified stage-specific optics, NOT an unrelated flash or model swap.
assert.ok(engine.includes('const birthDolly=smooth((t-5.68)/.80)*(1-smooth((t-8.52)/1.12))') &&
  engine.includes('z-=birthDolly*(this.mobileRender?.27:.47)') &&
  engine.includes('this.studioKey.position.set(') &&
  engine.includes('-3.8-dnaStudio*.42+assemblyStudio*1.30') &&
  engine.includes('4.4-dnaStudio*.32-assemblyStudio*1.15') &&
  engine.includes('const embryoStudio=smooth((t-3.48)/.62)') &&
  engine.includes('const dnaStudio=smooth((t-.12)/.38)'),
  'R2172 needs one tracked cinematic camera and physically moving key/fill lights');
const smoothNumber=v=>{v=Math.min(1,Math.max(0,v));return v*v*(3-2*v)};
const donorOpacity=t=>smoothNumber((t-4.38)/.48)*(1-smoothNumber((t-5.95)/.85));
for(const t of [0,1.6,2.6,4.2])assert.equal(donorOpacity(t),0,
  'Donor helices must be absent before the transition out of the embryo');
assert(donorOpacity(5.1)>.99,'Donor helices must feed the four arms before titanium seating');
assert.ok(engine.includes('const appear=smooth((t-3.52)/.76)') &&
  engine.includes('const grow=smooth((t-5.88)/1.18)') &&
  engine.includes('const opticWake=smooth((t-7.44)/.78)'),
  'DNA / living embryo / assembled titanium MAG / optical ignition story order regressed');
assert.ok(engine.includes('root.dataset.fxMagBirthCenteredDnaR2164'),
  'Canonical Three.js framebuffer proof must confirm the central DNA subject');
// R2173: a formerly invisible cinematic contract failure allowed the
// permanent R326 hero to leak through at t=5.0s BEFORE the titanium body
// existed. Keep the native stage fully hidden throughout DNA and embryo,
// and fade it in only once the film's mechanical pieces have seated.
assert.ok(birth.includes('const nativeReveal=smoothstep((r-.915)/.08)') &&
  birth.includes('if (r < .915) {') &&
  birth.includes("hidden-until-titanium-seated") &&
  birth.includes("if(stage instanceof HTMLElement)setStageOpacity(0);"),
  'R2173: permanent MAG must remain invisible until assembly and optic ignition');
assert.ok(permanent.includes("stage.dataset.fxBirthDeferredR2173='true'") &&
  permanent.includes("stage.style.setProperty('opacity','0','important')"),
  'R2173: asynchronously mounted permanent R326 must not flash through the birth film');
for(const [seconds,expected] of [[1.6,0],[4.2,0],[6.8,0],[7.6,0],[8.3,0],[9.5,null],[10,1]]){
  const crossfade=smoothNumber((seconds/10-.915)/.08);
  if(expected!==null)assert.equal(crossfade,expected,
    'R2173 early native MAG visibility regressed at '+seconds+'s');
  else assert(crossfade>0&&crossfade<1,'R2175 landing transition should crossfade the finished MAG');
}
// R2175: verify the actual landing choreography, not just the phase labels.
assert.ok(engine.includes('const endMove=smooth((t-8.45)/1.35)') &&
  engine.includes('const landingScale=1-.26*smooth((t-8.55)/1.30)') &&
  birth.includes('const nativeReveal=smoothstep((r-.915)/.08)') &&
  birth.includes('const nativeCadence=r>=.90?40:'),
  'R2175 must move and scale the cinematic MAG into its actual hero before native crossfade');
assert.ok(engine.includes('const capillaries=this.mobileRender?5:9') &&
  engine.includes('this.embryoCapillaryMaterial.opacity=.105*visible') &&
  engine.includes('const fade=1-smooth((t-3.10)/1.38)'),
  'R2175 biologic embryo must remain readable without the old DNA/capillary clutter');
const land=t=>smoothNumber((t-8.45)/1.35);
for(const [time,value] of [[4.2,0],[7.6,0],[8.45,0],[9.8,1]]){
  assert.equal(land(time),value,'R2175 cinematic MAG landing timing drift at '+time+' seconds');
}
const critical=read('docs/scifi-ui/styles/formatx-mag-birth-critical-r1572.css');
// R2174: a newly mounted native WebGL stage must never animate opacity
// down from 1 over the initial DNA and embryo frames.
assert.ok(birth.includes("stage.dataset.fxBirthConcealedR2174='true'") &&
  birth.includes("stage.style.setProperty('transition','none','important')") &&
  birth.includes("stage.style.setProperty('transition','none','important')") &&
  critical.includes(':not([data-fx-mag-birth-native-reveal-r2173="post-assembly-crossfade"])') &&
  critical.includes('transition:none!important;'),
  'R2174 DNA-first cinematic must instantly conceal native MAG until assembly seats');

const revisedFilm='formatx-mag-birth-live-r533.js?v=20261025-r2184-paired-genesis';
assert.ok(home.includes(revisedFilm) && rescue.includes(revisedFilm),
  'R2173 canonical first-paint and recovery bootstrap must load the same nonstale film');
assert.ok(worker.includes("'sha256-89Q+2UqrJK39vRAvJtBVjITm0d+HYPXX4ISFytBx0ps='"),
  'Cloudflare CSP lacks the exact changed R2173 parser-bootstrap hash');
assert.ok(birth.includes(revision),'Intro bootstrap is still caching old Three.js engine');
assert.ok(worker.includes(revision),'Cloudflare asset rewrite would downgrade the canonical 3D intro');
for(const home of [
  'https://formatxsuite.com/',
  'https://formatxsuite.com/scifi-ui/index.html',
  'https://www.formatxsuite.com/'
]){
  const u=new URL(modulePath,new URL(home).origin);
  assert.equal(u.pathname,modulePath,home+' must resolve the exact bundled 3D engine');
}
console.log('FORMATX_R2143_ROOT_THREE_MODULE_ROUTE_PASS');
