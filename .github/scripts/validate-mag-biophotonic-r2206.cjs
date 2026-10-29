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
for (const [name, source] of Object.entries({ mag, birth, intro, rescue, current, runtime, scheduler })) {
  assert.doesNotThrow(() => new Function(source), name + ' JavaScript syntax');
}
const tokens = [
  [mag, 'fxNativeMagSurfaceR2206'],
  [mag, "listen(document,'formatx:magbirthcomplete',()=>"],
  [mag, "root.dataset.fxMagNativeHandoffR2218='visible-reconciled'"],
  [mag, "root.dataset.fxMagNativePresentR2220='synchronous-gl-frame-committed'"],
  [mag, 'gl.finish();'],
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
assert(worker.includes('const INLINE_R2220_BOOT_HASH = "' + hash + '";'),
  'Worker must authorize the exact R2219 inline bootstrap');
assert((worker.match(/\$\{INLINE_R2220_BOOT_HASH\}/g) || []).length === 2,
  'Both Worker CSPs must authorize R2206');
const filmRevision = '20261028-r2217-studio-spectral-titanium';
const magRevision = '20261029-r2228-changed-telemetry';
assert(intro.includes(filmRevision),'Original R1280 biological film cache key must remain unchanged');
assert(rescue.includes('20261028-r2220-direct-gl-handoff'),
  'Parser fallback must load R2219 canonical bridge only');
assert(intro.includes('reconcileExposedCompositorR2219()'),
  'Film must flush exposed compositor on both teardown routes');
assert(intro.includes("ROOT.dataset.fxMagCompositorR2219='exposure-hit-test-flushed'"),
  'Native exposure must be acknowledged after real hit testing');
for (const [name, source] of Object.entries({ current, runtime, scheduler }))
  assert(source.includes(magRevision), name + ' must load the optimized native MAG');
assert(parser[1].includes('formatx-mag-birth-live-r533.js?v=20261028-r2220-direct-gl-handoff'),
  'R533 entrypoint must have a distinct R2211 cache generation');
assert(html.includes('20261028-r2220-direct-gl-handoff')&&html.includes('formatx-p0-motion-scheduler-r490.js?v='+magRevision),
  'HTML must reference fresh R533 bridge and original native MAG cache key');
assert(worker.includes(filmRevision)&&worker.includes(magRevision),
  'Worker must preserve film and native MAG rewrite keys');
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
