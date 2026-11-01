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
assert(source.includes('const tendrilCount = 0;'),
  'no new detached appendage silhouette without proof');
assert(source.includes("root.dataset.fxNativeMagSurfaceR2203="),
  'original titanium surface and optical iris must remain');
assert(birth.includes('const DURATION = 10000;'),
  'physical Genesis 10-second DNA-to-core sequence must be preserved');
assert.equal((source.match(/createElement\('canvas'\)/g)||[]).length,1,
  'native MAG must retain exactly one original WebGL canvas allocation');
console.log('MAG_R2270_STUDIO_SURFACE_SOURCE_PASS');
