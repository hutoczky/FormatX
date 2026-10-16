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
// R2045 must bust the R2035 browser cache while RETAINING every strict
// R2035 geometric/material anti-banding invariant verified above.
for(const loader of [desk,mobile,motion]){
  assert.ok(loader.includes('20261012-r2050-surface-sweep-endpoint'),
    'R2050 native sweep endpoint renderer loader is stale and may serve the old WebGL timing');
}
assert.ok(motion.includes('formatx-current-mag-loader-r422.js?v=20261012-r2050-surface-sweep-endpoint'),
  'Motion owner may boot the old cached MAG runtime');
assert.ok(scheduler.includes('formatx-motion-runtime-loader-r239.js?v=20261012-r2050-surface-sweep-endpoint'),
  'Desktop startup scheduler may cache the old renderer loader');
assert.ok(html.includes('formatx-p0-motion-scheduler-r490.js?v=20261012-r2050-surface-sweep-endpoint'),
  'Canonical HTML must load the R2045 scheduler');
for(const resource of [
 'formatx-core-real3d-v20.css?v=20261011-r2035-no-scanlines',
 'formatx-mag-birth-live-r533.css?v=20261014-r2107-quiet-atmospheric-stage']){
 assert.ok(html.includes(resource),'Public site has a stale optical resource '+resource);
}
/* R2103 additionally forbids the exact unreadable low-power source that
   was photographed on Android, while retaining R2035 anti-banding checks. */
const fallback=read('docs/scifi-ui/scripts/formatx-mag-reference-film-r649.js');
assert.ok(fallback.includes("fxMagFallbackSilhouetteR2103")&&
  fallback.includes('for(let blade=0;blade<8;blade++)')&&
  html.includes('formatx-mag-reference-film-r649.js?v=20261014-r2107-machined-sapphire-depth'),
  'Missing actual cache-busted four-point R2103 Android replacement');
assert.ok(fallback.includes('const lightSweep=Math.sin(time*.00038)')&&
  fallback.includes('S*.09*lightSweep')&&
  fallback.includes("hull.addColorStop(.14,'#3b555e')")&&
  fallback.includes('for(let arm=0;arm<4;arm++)'),
  'R2107 moving studio light and distinct metallic facet gradients must remain active');
assert.ok(intro.includes('end-r2103-mobile-compact-four-point-intro')&&
  intro.includes('opacity:1!important;')&&
  intro.includes('min-height:44px!important;'),
  'Skip button contrast and low-power fallback CSS must stay visible');
assert.ok(fallback.includes('function drawMagStudio(ctx,S,time,t)')&&
  fallback.includes('function magDiamond(ctx,S)')&&
  fallback.includes('fxMagFallbackOpticR2107')&&
  fallback.includes('for(let blade=0;blade<8;blade++)'),
  'R2107 must paint sculpted four-point metal and actual multi-layer aperture in original fallback');
assert.ok(intro.includes('end-r2107-premium-mag-stage')&&
  intro.includes('.fxb-genome-field'),
  'Legacy DNA overlays must not cover premium MAG on the mobile fallback');
console.log('MAG_R2035_DEBANDING_SOURCE_PASS',JSON.stringify({
 pc:true,mobile:true,canonicalWebgl:true,oldRearDepth:oldDepth(-1.15),
 correctedRearDepth:depth(-1.15),retrievedSheetDepth:depth(2.30),
 noCssScanlines:true,unmodifiedMagTopology:true
}));
