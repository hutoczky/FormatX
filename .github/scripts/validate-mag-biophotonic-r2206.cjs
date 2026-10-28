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
assert(worker.includes('const INLINE_R2211_BOOT_HASH = "' + hash + '";'),
  'Worker must authorize the exact R2211 inline bootstrap');
assert((worker.match(/\$\{INLINE_R2211_BOOT_HASH\}/g) || []).length === 2,
  'Both Worker CSPs must authorize R2206');
const filmRevision = '20261028-r2207-filtered-silver-living-optic';
const magRevision = '20261028-r2208-mag-mesh-row-cache';
for (const [name, source] of Object.entries({ intro, rescue }))
  assert(source.includes(filmRevision), name + ' must preserve the canonical biological film');
for (const [name, source] of Object.entries({ current, runtime, scheduler }))
  assert(source.includes(magRevision), name + ' must load the optimized native MAG');
assert(parser[1].includes('formatx-mag-birth-live-r533.js?v=20261028-r2211-native-handoff-present-frame'),
  'R533 entrypoint must have a distinct R2211 cache generation');
assert(html.includes(filmRevision)&&html.includes(magRevision),
  'HTML must preserve film and native MAG cache keys');
assert(worker.includes(filmRevision)&&worker.includes(magRevision),
  'Worker must preserve film and native MAG rewrite keys');
assert(html.includes('data-fx-dna-first-frame-r2181'),
  'Do not replace the first-frame DNA poster with an empty loading screen');
assert(intro.includes('const THREE_OWNER_SRC ='),
  'Original cinematic runtime ownership must remain');
console.log('MAG_BIOPHOTONIC_R2206_SOURCE_PASS', JSON.stringify({
  genomeMobile: 6000, genomeDesktop: 9600,
  cellPhotonsMobile: 1200, cellPhotonsDesktop: 3100,
  htmlAndWorkerCspExact: true, singleExistingWebGlOwner: true
}));
