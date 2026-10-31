'use strict';
// R2206 regression contract: authored living cell -> physical silver MAG.
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const read = path => fs.readFileSync(path, 'utf8');
const mag = read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const birth = read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js');
const intro = read('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js');
const html = read('docs/scifi-ui/index.html');
const worker = read('billing-worker/src/production-content-entry.js');
const rescue = read('docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js');
const current = read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const runtime = read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const scheduler = read('docs/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js');
const mobileCritical = read('docs/scifi-ui/styles/formatx-mobile-first-paint-r358.css');
for (const [name, source] of Object.entries({ mag, birth, intro, rescue, current, runtime, scheduler })) {
  assert.doesNotThrow(() => new Function(source), name + ' JavaScript syntax');
}
const tokens = [
  [mag, 'fxNativeMagSurfaceR2206'],
  [mag, "listen(document,'formatx:magbirthcomplete',()=>"],
  [mag, "root.dataset.fxMagNativeHandoffR2218='visible-reconciled'"],
  [mag, "root.dataset.fxMagNativePresentR2220='synchronous-gl-frame-committed'"],
  [mag, 'gl.finish();'],
  [mag, 'gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0)'],
  [mag, "listen(document,'formatx:magbirthprepare',prepareNativeFrameR2254"],
  [intro, "'formatx:magbirthprepare'"],
  [intro, "ROOT.dataset.fxMagHandoffGateR2254='waiting-for-actual-gpu-frame'"],
  [intro, "ROOT.dataset.fxMagHandoffGateR2254='gpu-finished-before-exposure'"],
  [mag, 'gl.clientWaitSync(fence,0,0)'],
  [mag, "root.dataset.fxMagHandoffSyncR2253='webgl2-nonblocking-fence'"],
  [mag, "root.dataset.fxMagHandoffGpuR2226='async-gpu-pending'"],
  [mag, 'gl.readPixels(px,py,Math.min(8,canvas.width),Math.min(8,canvas.height),'],
  [mag, "root.dataset.fxMagHandoffGpuR2226='finished'"],
  [mag, "stage.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'})"],
  [mag, "root.dataset.fxMagNativeCompositorR2222='already-onscreen-scroll-reconciled'"],
  [intro, "if(finished||!overlay.isConnected)return;"],
  [mag, 'render(performance.now());'],
  [mag, 'gl.flush();'],
  [mag, 'function finishBoot(program)'],
  [mag, 'buffers.forEach((buffer,index)=>upload(buffer,geometry.arrays[index],attributes[index],geometry.sizes[index]))'],
  [mag, 'if(now-lastRefreshTelemetryAt>=250 || lastRefreshTelemetryAt===-Infinity)'],
  [mag, 'let lastRefreshTelemetryAt=-Infinity;'],
  [mag, 'float tissueFold=sin('],
  [mag, 'float coralOrganelles=smoothstep(.61,.84,'],
  [mag, 'lensColor+=vec3(.93,.235,.145)*coralOrganelles'],
  [mag, 'float titaniumGrazing=pow(1.0-facing,2.4)'],
  [birth, 'const count=this.mobileRender?6000:9600;'],
  [birth, "const embryo=build(this.mobileRender?1200:3100,'embryo');"],
  [birth, 'this.embryoMaterial.opacity=.89*visible;'],
  [birth, 'this.embryoChromatinMaterial.opacity=(this.mobileRender?.11:.16)*visible;'],
  [birth, 'const metabolic=clamp(Math.pow(clamp('],
  [birth, 'this.updateDNA(t,time);'],
  [birth, 'this.updateCore(t,time);'],
  [birth, 'const vesicleCount=this.mobileRender?42:84;'],
  [birth, 'const embryoScale=this.mobileRender?.74:.90;'],
  [birth, 'const revealDolly=smooth((t-6.75)/.85)*'],
  [birth, 'col*=mix(1.78,1.38,metal);'],
  [birth, 'this.scene.environmentIntensity=this.mobileRender?.77:1.02;'],
  [birth, 'new T.InstancedMesh('],
  [birth, 'this.embryoVesicleMaterial.opacity=.58*visible;'],
  [birth, 'this.coreGroup.add(vesicles);'],
  [birth, 'this.updateMechanical(t,time);'],
  [mag, 'const constrainedFragmentSource ='],
  [mag, 'float polishedRib='],
  [mag, 'vec2 panelAA='],
  [mag, 'float opticalGlass=step(6.0,vFacet);'],
];
for (const [source, token] of tokens)
  assert(source.includes(token), 'Missing cinema/optic contract: ' + token);
assert(birth.indexOf('this.updateDNA(t,time);') < birth.indexOf('this.updateCore(t,time);'),
  'DNA must precede cellular condensation');
assert(birth.indexOf('this.updateCore(t,time);') < birth.indexOf('this.updateMechanical(t,time);'),
  'Cell nucleus must precede metal assembly');
assert(!birth.includes('new T.WebGLRenderer(') || birth.includes('canvas,'),
  'The film must remain tied to its existing canvas');
const parser = html.match(/<script data-fx-intro-bootstrap-r1629="true">([\s\S]*?)<\/script>/);
assert(parser, 'Parser-owned intro bootstrap missing');
const hash = "'sha256-" + crypto.createHash('sha256').update(parser[1]).digest('base64') + "'";
assert(html.includes(hash), 'New bootstrap must be authorized by HTML CSP');
// Active parser SHA-256 must match the Worker declaration and BOTH CSP policies.
// Compare hashes from source instead of pinning a stale R-number.
const hashDeclaration=worker.split('\n').find(line=>
  /^const INLINE_R\d+_BOOT_HASH = "/.test(line)&&line.includes(' = "'+hash+'";'));
assert(hashDeclaration,'Worker must declare exact active parser SHA-256');
const hashVariable=hashDeclaration.match(/^const (INLINE_R\d+_BOOT_HASH) = /)[1];
assert(worker.split('${'+hashVariable+'}').length-1===2,
  'Both Worker CSPs must authorize the active parser hash');
const filmRevision = '20261028-r2217-studio-spectral-titanium';
const magRevision = '20261031-r2264-fence-only-visitor';
assert(intro.includes(filmRevision),'Original R1280 biological film cache key must remain unchanged');
assert(intro.includes('const proofTurn=callback=>'),
  'R2236 cinematic test must bound animation-frame and timer scheduling');
assert(intro.includes("ROOT.dataset.fxMagBirthProofSchedulerR2236='bounded-raf-or-timeout'"),
  'R2236 proof scheduler state must be emitted only during deterministic capture');
const runtimeSrc=parser[1].match(/formatx-mag-birth-live-r533\.js\?v=[^"']+/)?.[0];
assert(runtimeSrc,'Inline parser must select a versioned R533 film bridge');
assert(rescue.includes(runtimeSrc),
  'Rescue and parser must load the EXACT same film revision');
assert(intro.includes('reconcileExposedCompositorR2219()'),
  'Film must flush exposed compositor on both teardown routes');
assert(intro.includes("ROOT.dataset.fxMagCompositorR2219='exposure-hit-test-flushed'"),
  'Native exposure must be acknowledged after real hit testing');
// R2262: keep the previously proven R2261 WebGL source while deferring
// the supplementary Mini MAG DOM/CSS until the original film completes.
const miniLoaderRevision='20261031-r2264-fence-only-visitor';
for (const [name, source] of Object.entries({ current, runtime }))
  assert(source.includes(magRevision), name + ' must preserve the original native GL');
assert(mag.includes('const proofReadbackR2264='),
  'R2264 original WebGL owner must reserve CPU readback for explicit proof');
assert(scheduler.includes(miniLoaderRevision),'Scheduler must load fresh R2262 controller owner');
assert(runtimeSrc.startsWith('formatx-mag-birth-live-r533.js?v='),
  'R533 entrypoint must have an explicit cache revision');
assert(html.includes(runtimeSrc)&&html.includes('formatx-p0-motion-scheduler-r490.js?v='+miniLoaderRevision),
  'HTML must use new Mini MAG loader while preserving original cinematic bridge');
assert(worker.includes(filmRevision)&&worker.includes(miniLoaderRevision),
  'Worker must preserve canonical film and deferred controller rewrites');
// R2256: materialize the real hero in layout before FCP. The film may
// cover the page visually, but an initial 1px clipped panel followed by a
// full-height copy creates a deterministic 0.33+ mobile CLS.
const cssPar=mobileCritical.split('/* R2256 — reserve final mobile hero copy geometry at initial paint. */')[1];
assert(cssPar&&cssPar.includes('production-r2256-critical-mobile-copy-geometry-parity'),
  'Mobile critical CSS must include settled R2256 source geometry');
for(const property of [
  'position:relative!important;',
  'width:calc(100% - 24px)!important;',
  'height:auto!important;',
  'max-height:none!important;',
  'clip-path:none!important;',
  'white-space:normal!important;'
])assert(cssPar.includes(property),'Missing first-paint hero geometry: '+property);
assert(html.match(/formatx-mobile-first-paint-r358\.css\?v=20261030-r2256-layout-parity-before-fcp/g)?.length===2,
  'Preload and blocking mobile stylesheet must have identical R2256 URL');
assert(worker.includes('formatx-mobile-first-paint-r358.css?v=20261030-r2256-layout-parity-before-fcp'),
  'Worker mobile stylesheet must share the R2256 cache identity');
assert(html.includes('data-fx-dna-first-frame-r2181'),
  'Do not replace the first-frame DNA poster with an empty loading screen');
assert(intro.includes('const THREE_OWNER_SRC ='),
  'Original cinematic runtime ownership must remain');
// R2227: render-time DOM mutation must not re-publish immutable
// html[data-*] telemetry every 250ms and force style invalidation.
assert(mag.includes('let publishedRuntimeStaticR2227=false;'),
  'R2227 immutable telemetry must be one-shot');
assert(mag.includes('if(!publishedRuntimeStaticR2227){'),
  'Permanent diagnostic flags must be inside the one-shot guard');
assert(mag.includes('if(now-lastRuntimeTelemetryAt>=250 || lastRuntimeTelemetryAt===-Infinity)'),
  'Live GPU telemetry must retain its bounded 250ms cadence');
const once=mag.slice(mag.indexOf('if(!publishedRuntimeStaticR2227){'),
  mag.indexOf('root.dataset.fxCoreRenderMs='));
for(const marker of [
  'fxNativeMagPerformanceR1694','fxNativeMagPerformanceR1701',
  'fxNativeMagPerformanceR1710','fxNativeMagDesktopInteractionR1944'
])assert(once.includes(marker),marker+' should only be published once');
console.log('MAG_BIOPHOTONIC_R2206_SOURCE_PASS', JSON.stringify({
  genomeMobile: 6000, genomeDesktop: 9600,
  cellPhotonsMobile: 1200, cellPhotonsDesktop: 3100,
  htmlAndWorkerCspExact: true, singleExistingWebGlOwner: true
}));
