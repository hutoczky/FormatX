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
assert.ok(core.includes('const fragmentSource = constrainedFragmentSource;'),
  'Desktop and mobile must share the same canonical WebGL MAG material');
assert.ok(core.includes("fxCoreOpticsR2035='debanded-single-body-broad-softboxes-subpixel-safe'"),
  'Original MAG must publish stripe-free material selection');
const body=core.split('const constrainedFragmentSource = ')[1]?.split('const softwareFragmentSource = ')[0]||'';
assert.ok(body.includes('vec3 absorption=exp(-vec3(')&&body.includes('float thickness='),
  'MAG optical density must be continuous, not repeated scanlines');
assert.ok(!body.includes('sin(vLocal.y*11.0+vLocal.x*1.8-vLocal.z*1.4)'),
  'Legacy procedural MAG scanlines are present');
assert.ok(body.includes('gaussian(d.x-.46,.105+softness)'),
  'PC and phone cannot reintroduce the thin high-intensity studio stripe');
assert.ok(body.includes('float fold=gaussian(abs(inside.x)*.92+abs(inside.y)*.75-.27,.037)'),
  'Thin fourfold faceting streaks must be optically widened');
assert.ok(core.includes('float microFold=sin(aUv.x*18.8495559215+aUv.y*15.4)*.00028*cortexEnvelope'),
  'Thin vertex-fold ripples would reintroduce temporal aliasing');
for(const latitude of [.05,.25,.5,.75,.95]){
  const first=Math.sin(latitude*15.4)*.00028;
  const last=Math.sin(18.8495559215+latitude*15.4)*.00028;
  assert.ok(Math.abs(first-last)<1e-12,'The actual closed longitude seam must not acquire a displaced gap');
}
assert.ok(archive.includes('opticalDepth*d,d'),
  'Archive and MAG must share correct homogeneous depth ordering');
const archiveRevision=archive.match(/const VERSION='cinematic-archive-(r\d{4})-[^']*'/)?.[1];
assert.ok(archiveRevision,'The WebGL MAG archive must publish one recognized cinematic revision');
const scriptRevision=html.match(/formatx-cinematic-archive-r1987\.js\?v=(\d{8})-(r\d{4})-[^"]+/);
assert.ok(scriptRevision&&scriptRevision[1]>='20261012'&&scriptRevision[2]===archiveRevision,
  'The HTML and native eight-module MAG archive must load the SAME revision; never accept stale caches');
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
// R2045 must bust the R2035 browser cache while RETAINING every strict
// R2035 geometric/material anti-banding invariant verified above.
for(const loader of [desk,mobile,motion]){
  assert.ok(loader.includes('20261014-r2064-transform-genesis-csp'),
    'R2059 normal visitor runtime renderer loader is stale and may serve the old WebGL timing');
}
assert.ok(motion.includes('formatx-current-mag-loader-r422.js?v=20261014-r2064-transform-genesis-csp'),
  'Motion owner may boot the old cached MAG runtime');
assert.ok(scheduler.includes('formatx-motion-runtime-loader-r239.js?v=20261014-r2064-transform-genesis-csp'),
  'Desktop startup scheduler may cache the old renderer loader');
assert.ok(html.includes('formatx-p0-motion-scheduler-r490.js?v=20261014-r2064-transform-genesis-csp'),
  'Canonical HTML must load the R2045 scheduler');
for(const resource of [
 'formatx-core-real3d-v20.css?v=20261011-r2035-no-scanlines',
 'formatx-mag-birth-live-r533.css?v=20261014-r2064-transform-genesis-csp']){
 assert.ok(html.includes(resource),'Public site has a stale optical resource '+resource);
}
console.log('MAG_R2035_DEBANDING_SOURCE_PASS',JSON.stringify({
 pc:true,mobile:true,canonicalWebgl:true,oldRearDepth:oldDepth(-1.15),
 correctedRearDepth:depth(-1.15),retrievedSheetDepth:depth(2.30),
 noCssScanlines:true,unmodifiedMagTopology:true
}));
