'use strict';
// R2270: source contract for the real live MAG material. This is a
// supplemental guard: browser shader-compile, handoff, screenshot and
// actual Lighthouse gates remain mandatory and are never replaced.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const birth=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
for(const token of [
  'R2270: a single material-coherent asymmetric cortical warp',
  'float sculptEnvelope=smoothstep(.22,.72,sculptRadius)',
  '(1.0-step(6.0,aFacet))',
  'R2270: continuous body-following, elongated sinuous titanium',
  'vec2 panelCoord=vec2(radial*17.0,lateral/panelWidth*2.4)',
  'studioSilver*=1.0-panelJoint*.125*panelEnvelope',
  'R2270: photographic nacre and living vascular backscatter',
  'studioSilver+=vec3(.035,.155,.166)*narrowVein*',
  "fxNativeMagStudioR2270='asymmetric-living-sculpt"
]) assert(source.includes(token),'R2270 live MAG studio optics missing: '+token);
assert(!source.includes('vec2 panelCoord=vec2(radial*28.0,lateral/panelWidth*4.0)'),
  'old rectilinear checker-grid is still active');
assert(source.includes('const tendrilCount = software ? 3 : mobile ? 4 : 6;'),
  'R2273 actual cortical filaments must be bounded across GPU tiers');
assert(source.includes('appendEllipsoid([.055,.055,-.170],[.665,.710,.405],1.12,'),
  'R2273 deep biological cortex must be genuine canonical 3D geometry');
assert(source.includes('fxNativeMagStudioR2273='),
  'R2273 studio geometry state missing');
assert(source.includes("root.dataset.fxNativeMagSurfaceR2203="),
  'original titanium surface and optical iris must remain');
assert(birth.includes('const DURATION = 10000;'),
  'physical Genesis 10-second DNA-to-core sequence must be preserved');
assert.equal((source.match(/createElement\('canvas'\)/g)||[]).length,1,
  'native MAG must retain exactly one original WebGL canvas allocation');
const three=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
for(const token of [
  'R2271: hydrated biopolymer, not emissive candy-light tubing',
  'color:0xa7c8e2,emissive:0x224267,emissiveIntensity:.63',
  'color:0xc8b5dd,emissive:0x523b77,emissiveIntensity:.61',
  'R2271: both axes tile seamlessly on the curved cell',
  'const coral=Math.pow(clamp((coralCloud-.575)*4.25),1.4)',
  'bumpMap:this.embryoTexture,bumpScale:.023',
  'dataset.fxGenesisStudioR2271'
]) assert(three.includes(token),'R2271 Genesis studio source missing: '+token);
assert(birth.includes('20261101-r2271-film-grade-genesis-optics'),
  'R2271 film must use a versioned physical Three.js owner');
const mobileFirstPaint=fs.readFileSync('docs/scifi-ui/styles/formatx-mobile-first-paint-r358.css','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
for(const token of [
  'R2274 — exact first-byte mobile layout-lock',
  'height:70px!important',
  'header.topbar > .fx-language-toggle',
  'header.topbar > #menu-toggle',
  '#hero .hero-space > .fx-core-mobile-v55-stage',
  'canvas.fx-core-mobile-v55-canvas'
]) assert(mobileFirstPaint.includes(token),'R2274 critical mobile stability missing: '+token);
assert.equal((html.match(/20261101-r2281-no-double-mobile-translate/g)||[]).length,2,
  'R2276 HTML firstpaint CSS preload and stylesheet must use the same cache key');
assert(worker.includes('20261101-r2281-no-double-mobile-translate'),
  'R2276 Cloudflare Worker must serve the same critical CSS revision');
assert(mobileFirstPaint.includes('left:50%!important;') &&
  mobileFirstPaint.includes('transform:translate(-50%,-1.4%) scaleY(.935)!important;'),
  'Native MAG must preserve its exact centered 100vw R303 mobile stage placement');
assert(source.includes('const isCortex=facetBase>=1.10&&facetBase<1.34;') &&
  source.includes('.103*Math.sin(th*3.0+cp*4.20)') &&
  source.includes('software?18:mobile?22:30,software?28:mobile?38:52'),
  'R2275 native cortex geometry must be irregular, pole-safe and topology-bounded');
assert(source.includes('float originalMineralMask=1.0-step(1.0,vFacet);') &&
  source.includes('float livingCortex=step(1.10,vFacet)') &&
  source.includes('vec3 cortexMaterial=vec3(.009,.020,.027)'),
  'R2275 living cortex must be dark physical bioglass, not silver-washed flat geometry');
assert(source.includes('fxNativeMagStudioR2275='),'R2275 studio profile missing');
assert(birth.includes('let nativeFencePrefetchedR2278=false;') &&
  birth.includes("ROOT.dataset.fxMagEarlyNativePrepareR2278='submitted-behind-genesis'") &&
  birth.includes("revision:'r2278-early-native-fence'") &&
  birth.includes("ROOT.dataset.fxCrystalOrganismR326==='ready'"),
  'R2278 must preflight only the original ready WebGL2 native MAG behind its real film');
assert(birth.includes("ROOT.dataset.fxMagHandoffGateR2254='gpu-finished-before-exposure'") &&
  birth.includes("ROOT.dataset.fxMagHandoffGateR2254='gpu-timeout-released'"),
  'Do not weaken the original real GPU complete safety gate or accessibility bound');
assert(mobileFirstPaint.includes('R2280 — genuine archive-state MAG') &&
  mobileFirstPaint.includes('[data-fx-archive-cinema="active"]') &&
  mobileFirstPaint.includes('[data-fx-archive-dock="active"]') &&
  mobileFirstPaint.includes('.fx-core-mobile-v55-stage.fx-archive-native-docked') &&
  mobileFirstPaint.includes('transform:none!important;'),
  'R2280 native archive must cancel half-width translation on the actual mobile GL stage');
assert(mobileFirstPaint.includes('R2281: prevent a second -50% independent CSS translate') &&
  mobileFirstPaint.includes('transform:translate(-50%,-1.4%) scaleY(.935)!important;\n    translate:none!important;'),
  'R2281 native mobile MAG must not combine transform and independent translateX(-50%)');
console.log('MAG_R2281_SINGLE_NATIVE_MOBILE_TRANSLATION_SOURCE_PASS');
