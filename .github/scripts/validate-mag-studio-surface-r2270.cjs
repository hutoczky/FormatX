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
assert(source.includes('appendEllipsoid([.045,.040,-.235],[.540,.575,.320],1.12,'),
  'R2327 recessed living cortex must be genuine canonical 3D geometry');
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
assert(birth.includes('20261101-r2295-vascular-cortex-microgeometry'),
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
assert.equal((html.match(/formatx-mobile-first-paint-r358\.css\?v=20261101-r2297-optic-safe-mobile-controls/g)||[]).length,2,
  'R2294 HTML firstpaint CSS preload and stylesheet must use exactly the same cache key');
assert(worker.includes('20261101-r2297-optic-safe-mobile-controls'),
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
const inlineRail=html.match(/<style data-fx-mobile-rail-prepaint-r2285="true">([\s\S]*?)<\/style>/);
assert(inlineRail,'R2285 mobile navigation layout lock must exist in first byte');
const railHash="'sha256-"+require('node:crypto').createHash('sha256').update(inlineRail[1]).digest('base64')+"'";
assert(html.includes(railHash),'R2285 parser mobile CSS must be authorized by HTML CSP');
assert.equal(worker.split(railHash).length-1,2,'R2285 CSS must be in both Worker CSPs');
assert(mobileFirstPaint.includes('R2285 — initial mobile layout / final native dock geometry')&&
  mobileFirstPaint.includes('body.living-architecture > aside.fx-rail')&&
  mobileFirstPaint.includes('div.fx-core-mobile-v55-stage.fx-archive-native-docked'),
  'R2285 initial legacy rail and final dock source missing');
console.log('MAG_R2285_MOBILE_RAIL_AND_DOCK_SOURCE_PASS');
const archive=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
assert(archive.includes('const enteredScroll=scrollY>Math.max(24,innerHeight*.06);') &&
  archive.includes('Boolean(introDone&&enteredScroll&&'),
  'R2286 must never activate archive docking at scrollY=0 after film teardown');
assert(archive.includes("if(active&&stage)ResponsiveExperience.dock();") &&
  archive.includes('else if(archiveActive)ResponsiveExperience.restore();'),
  'R2286 must keep native reversible scroll and the original home MAG');
console.log('MAG_R2286_USER_SCROLL_ARCHIVE_GATE_PASS');
const stableStageCss=[
  'R2294 — stable viewport-owned mobile MAG lane',
  'position:fixed!important',
  'top:152px!important',
  'height:43dvh!important',
  'transform:translate3d(0,calc(2dvh - 152px),0)!important'
];
for(const token of stableStageCss)
  assert(mobileFirstPaint.includes(token),'R2294 mobile fixed layout missing: '+token);
assert(archive.includes("root.dataset.fxArchiveFlipR2293='mobile-fixed-layout-compositor-entry'"),
  'R2294 live mobile native MAG cannot traverse a geometry-changing FLIP path');
console.log('MAG_R2294_SINGLE_BOX_SCROLL_COMPOSITOR_SOURCE_PASS');
for(const token of [
  'R2289: a real cortex survives the titanium assembly',
  'const handoffCortex=smooth((t-7.28)/1.43);',
  'const visible=grow*mix(fade,.82,handoffCortex);',
  'const bodyScale=.001+.63*grow*mix(fade,1.08,handoffCortex);',
  'this.organicLobeMaterial.opacity=mix(.15*visible,.23*grow,handoffCortex);',
  'this.silverMaterial.roughness=mix(.18,.19,finale);'
]) assert(three.includes(token),'R2289 physical film-to-live cortex continuity missing: '+token);
assert(birth.includes('20261101-r2295-vascular-cortex-microgeometry'),
  'R2289 film bridge must use the freshly cached true Three.js asset');
console.log('MAG_R2289_FILM_CORTEX_CONTINUITY_SOURCE_PASS');
assert(three.includes("const shellPosition=shell.geometry.getAttribute('position');") &&
  three.includes('const microPleat=Math.sin(x*8.4+z*2.8+2.1*Math.sin(y*3.1))*') &&
  three.includes('const stretch=1+.063*ridge+.037*lobe+.016*microPleat;') &&
  three.includes("shell.geometry.setAttribute('color',") &&
  three.includes('new T.BufferAttribute(cortexChromatinR2295,3)') &&
  three.includes('shell.geometry.computeVertexNormals();') &&
  three.includes('vertexColors:true,'),
  'R2295 must deform the genuine 3D cortex and upload biological vertex colors with recomputed normals');
assert(three.includes('this.organicGroup.position.z=-.54*handoffCortex;') &&
  three.includes('this.organicShellMaterial.opacity=mix(.18*visible,.68*grow,handoffCortex);') &&
  three.includes('this.organicShellMaterial.clearcoat=mix(.11,.78,handoffCortex);'),
  'R2291 requires hydrated PBR cortex behind the real titanium chassis');
assert(birth.includes('20261101-r2295-vascular-cortex-microgeometry'),
  'R2291 must load the exact new physical film version');
console.log('MAG_R2291_SCULPTED_CORTEX_SOURCE_PASS');
assert(three.includes('const born=smooth((t-8.12)/1.05);') &&
  three.includes('const leftSide=(i===3||i===4||(!this.mobileRender&&i===5));') &&
  three.includes('this.tentacleGroup.visible=born>.002;') &&
  three.includes('this.tentacleGroup.position.z=-.43*born;') &&
  three.includes('this.tentacleMaterial.opacity=(this.mobileRender?.21:.27)*born;'),
  'R2292 must reveal only bounded leftward living 3D strands');
assert(three.includes('glow.visible=false;wire.visible=false;') &&
  three.includes('dash.visible=false;nodes.visible=false;'),
  'R2292 must not resurrect neon dotted robot-cable draw passes');
assert(birth.includes('20261101-r2295-vascular-cortex-microgeometry'),
  'R2292 must load the exact immutable bioglass filament film');
console.log('MAG_R2292_BIOFILAMENT_SOURCE_PASS');
for(const token of [
  'R2297 — real mobile MAG optic-safe control placement',
  'grid-template-columns:50px 50px!important;',
  'justify-content:space-between!important;',
  'grid-column:2!important;',
  'pointer-events:auto!important;'
]) assert(mobileFirstPaint.includes(token),'R2297 accessible mobile optical corridor missing: '+token);
assert.equal((html.match(/formatx-mobile-first-paint-r358\.css\?v=20261101-r2297-optic-safe-mobile-controls/g)||[]).length,2,
  'R2297 must be the exact critical CSS preload+stylesheet revision');
console.log('MAG_R2297_MOBILE_OPTIC_CLEARANCE_SOURCE_PASS');
assert(archive.includes("root.dataset.fxArchiveFlipR2293='same-pixels-compositor-entry'") &&
  archive.includes("root.dataset.fxArchiveFlipR2293='settled-native-onecanvas'") &&
  archive.includes('void stage.getBoundingClientRect();') &&
  archive.includes('transform 360ms cubic-bezier(.20,.66,.16,1)'),
  'R2293 real native MAG must enter archive through actual compositor FLIP');
assert(html.includes('formatx-cinematic-archive-r1987.js?v=20261103-r2316-layout-invariant-dock'),
  'R2293 HTML loader must use correct cache-busted canonical scroll owner');
console.log('MAG_R2293_NATIVE_COMPOSITOR_FLIP_SOURCE_PASS');
for(const token of [
  'vertexColors:true,',
  'const cortexChromatinR2295=new Float32Array(shellPosition.count*3);',
  'const microPleat=Math.sin(x*8.4+z*2.8+2.1*Math.sin(y*3.1))',
  'const vessel=Math.pow(.5+.5*marrow,6);',
  'const coral=Math.pow(Math.max(0,(fleck-.33)/.67),3);',
  "shell.geometry.setAttribute('color',",
  'shell.geometry.computeVertexNormals();',
  'fxGenesisCortexR2295='
])assert(three.includes(token),'R2295 physical vascular cortex source missing: '+token);
assert(birth.includes('20261101-r2295-vascular-cortex-microgeometry'),
  'R2295 Three.js owner must be loaded with a physical new asset version');
console.log('MAG_R2295_REAL_PBR_CHROMATIN_SURFACE_SOURCE_PASS');
