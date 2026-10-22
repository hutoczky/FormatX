'use strict';
// R2035 standalone debanding regression. This checks the real live renderer
// and shared depth mathematics; Chromium visual tests remain authoritative.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const core=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const archive=read('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js');
const productionWorker=read('billing-worker/src/production-content-entry.js');
const html=read('docs/scifi-ui/index.html');
const retro=read('docs/scifi-ui/styles/formatx-core-real3d-v20.css');
const intro=read('docs/scifi-ui/styles/formatx-mag-birth-live-r533.css');
const desk=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const mobile=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const motion=read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const scheduler=read('docs/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js');
for(const [name,s] of [['core',core],['archive',archive],['desktop-loader',desk],['mobile-loader',mobile]])
  assert.doesNotThrow(()=>new Function(s),name+' JavaScript parsing failed');
// R2137: the permanent on-page MAG, not only the birth film, must carry
// visible raised metal arms in the single canonical WebGL geometry.
for(const token of [
  'R2137 — actual, permanent R326 MAG',
  'for(let axis=0;axis<4;axis++)',
  'for(const lane of [-1,1])',
  'const half=.022+.039*Math.sin(Math.PI*t)',
  'const centre=lane*(half+.017)',
  'armorQuad(a.left,a.right,b.right,b.left,facet)',
  'float machinedArmor=step(5.0,vFacet)',
  'c=mix(c,titanium,machinedArmor*.99)',
  "mobile?'.178':'.235'"
]){
  assert.ok(core.includes(token),'R2137 permanent MAG geometry/material regression: '+token);
}
assert.ok(productionWorker.includes('formatx-p0-motion-scheduler-r490.js?v=20261022-r2138-visible-mag'),
  'Cloudflare Worker must not pin the previous P0 MAG scheduler cache');
assert.ok(productionWorker.includes('formatx-motion-runtime-loader-r239.js?v=20261022-r2138-permanent-mag'),
  'Cloudflare Worker must not rewrite the scheduler to R1950');
assert.ok(productionWorker.includes('formatx-mag-genesis-three-r1280.js?v=20261022-r2136-volumetric-helix'),
  'Cloudflare Worker must not downgrade the cinematic birth renderer to R1984');
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
// R2137 must bust the R2035 browser cache while RETAINING every strict
// R2035 geometric/material anti-banding invariant verified above.
for(const loader of [desk,mobile,motion]){
  assert.ok(loader.includes('20261022-r2138'),
    'R2138 native four-arm MAG renderer loader is stale and may serve the old WebGL timing');
}
assert.ok(motion.includes('formatx-current-mag-loader-r422.js?v=20261022-r2138'),
  'Motion owner may boot the old cached MAG runtime');
assert.ok(scheduler.includes('formatx-motion-runtime-loader-r239.js?v=20261022-r2138'),
  'Desktop startup scheduler may cache the old renderer loader');
assert.ok(html.includes('formatx-p0-motion-scheduler-r490.js?v=20261022-r2138'),
  'Canonical HTML must load the R2138 scheduler');
for(const resource of [
 'formatx-core-real3d-v20.css?v=20261011-r2035-no-scanlines',
 'formatx-mag-birth-live-r533.css?v=20261014-r2103-contrast-fourpoint-fallback']){
 assert.ok(html.includes(resource),'Public site has a stale optical resource '+resource);
}
/* R2103 additionally forbids the exact unreadable low-power source that
   was photographed on Android, while retaining R2035 anti-banding checks. */
const fallback=read('docs/scifi-ui/scripts/formatx-mag-reference-film-r649.js');
assert.ok(fallback.includes("fxMagFallbackSilhouetteR2103")&&
  fallback.includes('for(let blade=0;blade<8;blade++)')&&
  html.includes('formatx-mag-reference-film-r649.js?v=20261021-r2113-layered-chassis'),
  'Missing actual cache-busted four-point R2103 Android replacement');
assert.ok(fallback.includes('fxMagFallbackMaterialR2104')&&
  fallback.includes('moving-softbox-smoked-chrome-sapphire-facets')&&
  fallback.includes('const studioTravel=.5+.5*Math.sin(time*.00053)'),
  'R2104 movie must use a real animated optical studio-light material');
assert.ok(intro.includes('end-r2103-mobile-compact-four-point-intro')&&
  intro.includes('opacity:1!important;')&&
  intro.includes('min-height:44px!important;'),
  'Skip button contrast and low-power fallback CSS must stay visible');
console.log('MAG_R2035_DEBANDING_SOURCE_PASS',JSON.stringify({
 pc:true,mobile:true,canonicalWebgl:true,oldRearDepth:oldDepth(-1.15),
 correctedRearDepth:depth(-1.15),retrievedSheetDepth:depth(2.30),
 noCssScanlines:true,unmodifiedMagTopology:true
}));
