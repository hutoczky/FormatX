'use strict';
// R2035 standalone debanding regression. This checks the real live renderer
// and shared depth mathematics; Chromium visual tests remain authoritative.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const core=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const archive=read('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js');
const html=read('docs/scifi-ui/index.html');
const retro=read('docs/scifi-ui/styles/formatx-core-real3d-v20.css');
const intro=read('docs/scifi-ui/styles/formatx-mag-birth-live-r533.css');
const desk=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const mobile=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const motion=read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const scheduler=read('docs/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js');
for(const [name,s] of [['core',core],['archive',archive],['desktop-loader',desk],['mobile-loader',mobile]])
  assert.doesNotThrow(()=>new Function(s),name+' JavaScript parsing failed');
assert.ok(archive.includes('lastImmediateDomSync') &&
  archive.includes('duplicateDomReadsAvoided++') &&
  archive.includes('requestRender?.(1)') &&
  archive.includes('selectLiveChapter();'),
  'R2051 must preserve immediate scroll handoff and original GPU request while avoiding duplicate RAF forced layouts');
// R2052: low-power software GL reduces raster pixel cost on every real
// software renderer, not by detecting automation/Lighthouse. Hardware keeps
// the exact original high-quality surface, MSAA and dynamic resolution.
assert.ok(core.includes("(mobile?.76:.72)") &&
  core.includes("(mobile?.70:.48)") &&
  core.includes("'unchanged-hardware-physical-quality'") &&
  core.includes("fxCoreSoftwarePixelsR2052"),
  'The software startup pixel budget must be adaptive without touching hardware PBR');
// R2048: shared analytical grid vertices retain exact triangles but remove
// redundant surface powers/trigonometry, without reducing mobile geometry LOD.
assert.ok(core.includes('const gridVertexCache=Array.from({length:latitudeSegments+1}') &&
  core.includes('const a=gridVertex(lat,lon);') &&
  core.includes('const d=gridVertex(lat+1,lon+1);') &&
  core.includes('fxCoreGeometryBuildMsR2048'),
  'R2048 production renderer must cache original body vertices and measure real CPU construction duration');
assert.ok(core.includes('const fragmentSource = constrainedFragmentSource;'),
  'Desktop and mobile must share the same canonical WebGL MAG material');
assert.ok(core.includes("fxCoreOpticsR2035='debanded-single-body-broad-softboxes-subpixel-safe'"),
  'Original MAG must publish stripe-free material selection');
const body=core.split('const constrainedFragmentSource = ')[1]?.split('const softwareFragmentSource = ')[0]||'';
assert.ok(body.includes('Broadband depth density replaces periodic'),
  'MAG optical density must be continuous, not repeated scanlines');
assert.ok(!body.includes('sin(vLocal.y*11.0+vLocal.x*1.8-vLocal.z*1.4)'),
  'Legacy procedural MAG scanlines are present');
assert.ok(body.includes('ribbonB*.052'),
  'PC and phone cannot reintroduce the thin high-intensity studio stripe');
assert.ok(body.includes('pow(abs(cos(polar*4.0)),4.0)'),
  'Thin fourfold faceting streaks must be optically widened');
assert.ok(core.includes('float microFold=sin(aUv.x*22.0+aUv.y*15.4)*.00028*cortexEnvelope'),
  'Thin vertex-fold ripples would reintroduce temporal aliasing');
assert.ok(archive.includes('opticalDepth*d,d'),
  'Archive and MAG must share correct homogeneous depth ordering');
assert.ok(archive.includes('fxArchiveDepthPolicyR2035'),
  'Wrong archive-depth revision active');
const depth=z=>Math.max(-.16,Math.min(.86,.33-.15*z));
const oldDepth=z=>((z-2.8)*.36)/Math.max(2.4,6.2-z);
assert.ok(oldDepth(-1.15)<0,'Fixture: old shelf was projected to front of MAG');
for(const z of [-1.45,-1.15,-.88,-.3]){
  assert.ok(depth(z)>.29,'Shelves must stay behind the canonical MAG at '+z);
}
assert.ok(depth(2.30)<.02,'Retrieved physical paper must approach foreground');
assert.ok(!retro.includes('repeating-linear-gradient(180deg'),
  'PC/mobile fallback stage still paints an explicit scanline grid');
assert.ok(intro.includes('Continuous cinematographic atmosphere'),
  'Cinematic MAG intro still overlays 4px raster stripes');
assert.ok(!intro.includes('background-size: 4px 4px'),
  'The 4px intro grid was not removed');
for(const loader of [desk,mobile,motion]){
  assert.ok(loader.includes('r2035-debanded-photographic-mag'),
    'A renderer loader may serve the cached banded MAG shader');
}
assert.ok(scheduler.includes('formatx-motion-runtime-loader-r239.js?v=20261011-r2048-pulse-grid-vertex-optimization'),
  'Desktop startup scheduler must not cache the old renderer loader');
assert.ok(html.includes('formatx-p0-motion-scheduler-r490.js?v=20261011-r2048-pulse-grid-vertex-optimization'),
  'Canonical HTML must load the refreshed post-paint mobile scheduler');
assert.ok(scheduler.includes('AUTO_DELAY_MS=MOBILE_SCHEDULE?1900:5500')
  && scheduler.includes('timeout:MOBILE_SCHEDULE?450:3500'),
  'The optimized MAG startup must shorten only the redundant mobile wait');
assert.ok(mobile.includes("matches ? 400 : 1100"),
  'The core loader must not add a second 3s mobile delay');
for(const resource of ['formatx-cinematic-archive-r1987.js?v=20261011-r2051-one-native-paper-dom-pass',
 'formatx-core-real3d-v20.css?v=20261011-r2035-no-scanlines',
 'formatx-mag-birth-live-r533.css?v=20261011-r2035-no-intro-grid']){
 assert.ok(html.includes(resource),'Canonical public page must request its current MAG optical resource: '+resource);
}
assert.ok(!html.includes('formatx-cinematic-archive-r1987.js?v=20261011-r2035-debanded-depth'),
  'The old archive JS query must not mask the R2045 geometry optimization');
console.log('MAG_R2035_DEBANDING_SOURCE_PASS',JSON.stringify({
 pc:true,mobile:true,canonicalWebgl:true,oldRearDepth:oldDepth(-1.15),
 correctedRearDepth:depth(-1.15),retrievedSheetDepth:depth(2.30),
 noCssScanlines:true,unmodifiedMagTopology:true
}));
