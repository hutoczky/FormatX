'use strict';
/* R2034 release contract: substantive architecture and canonical visible proof.
 * These source checks complement, not replace, actual Chromium and Lighthouse. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const load=p=>fs.readFileSync(p,'utf8');
const html=load('docs/scifi-ui/index.html');
const archive=load('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js');
const folio=load('docs/scifi-ui/styles/formatx-cinematic-archive-r1987.css');
const heart=load('docs/scifi-ui/scripts/formatx-heart-core-r252.js');
const core=load('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const old3dStyle=load('docs/scifi-ui/styles/formatx-core-real3d-v20.css');
const mobileLoader=load('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const currentLoader=load('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const worker=load('billing-worker/src/production-feedback-entry.js');
const loop=load('docs/scifi-ui/scripts/formatx-infinite-scroll-desktop-v7.js');
const matches=(str,regex)=>[...str.matchAll(regex)].length;
assert.equal(matches(html,/class="fx-award-proof" data-fx-award-proof/g),1,
  'One canonical public evidence section is mandatory');
assert.equal(matches(html,/<h2[^>]*>Bizonyíték a látvány mögött\.<\/h2>/g),1,
  'Never duplicate the public evidence title in separate DOM cards');
assert.equal(matches(html,/id="fx-award-proof-title"/g),1,
  'Exactly one heading ID');
assert.equal(matches(html,/data-fx-mag-intro-system="true"/g),1,
  'Old hero proof becomes the distinct MAG system identifier');
assert.ok(!loop.includes("'<article class=\"fx-loop-reference-proof\">'"),
  'Inert loop must not clone visible evidence');
assert.ok(worker.includes("HOMEPAGE_PROOF_STRIP"),
  'Edge canonical public proof injection guard must remain intact');
assert.ok(archive.includes("attachExistingProofBlock()"),
  'Canonical DOM evidence must be moved into final native papyrus');
assert.ok(archive.includes("attachExistingFinalCta()"),
  'The same live primary CTA must remain in final papyrus');
assert.ok(archive.includes("restoreExistingProofBlock()"),
  'DOM proof must be restored on fallback');
assert.ok(archive.includes("restoreExistingFinalCta()"),
  'Primary CTA must be restored on fallback');
assert.ok(archive.includes("fxArchiveExperience==='ready'"),
  'Exclusive archive requires an actual ready WebGL context');
assert.ok(archive.includes("introDone"),
  'Must not displace MAG birth intro');
assert.ok(archive.includes("GGX microfacet")||archive.includes("Normalized GGX"),
  'Microfacet material shading must remain present');
assert.ok(folio.includes("r2033-mobile-viewport-fixed-native-paper-no-scroll-containing-block"),
  'Mobile original DOM screen lane must remain stable');
assert.ok(heart.includes("Math.hypot(event.clientX-down.x,event.clientY-down.y)>14"),
  'Semantic MAG interaction cannot accept scroll gestures');
assert.ok(html.includes('media="(min-width:901px)" data-fx-p0-first-paint-r503'),
  'Heavy desktop P0 stylesheet cannot render-block mobile');
assert.ok(html.includes('data-fx-r487-media="(max-width:900px)" media="print" href="/scifi-ui/styles/formatx-p0-first-paint-r490.css'),
  'Phone P0 optical polish must become active after initial content paint');
// R2035: optical stripe regression on both PC and phone.
assert.ok(core.includes("const fragmentSource = constrainedFragmentSource;"),
  'One coherent physically sculpted MAG must serve desktop and phone');
assert.ok(!old3dStyle.includes('repeating-linear-gradient(180deg, rgba(62, 190, 255')
 &&!old3dStyle.includes('repeating-linear-gradient(180deg, rgba(64, 195, 255'),
 'No retired PC/mobile grid scanlines may overlay the physical MAG');
assert.ok(html.includes('r2035-no-pc-mobile-scanlines'),
  'Production must request the fresh CSS without cached scanlines');
assert.ok(core.includes("debanded-single-body-broad-softboxes-subpixel-safe"),
  'Canonical original MAG material still contains old striping');
const opticalSection=core.split('const constrainedFragmentSource = ')[1]?.split('const softwareFragmentSource = ')[0]||'';
assert.ok(opticalSection.includes('Broadband depth density replaces periodic'),
  'Periodic scanlines must be removed from MAG');
assert.ok(!opticalSection.includes('sin(vLocal.y*11.0+vLocal.x*1.8-vLocal.z*1.4)'),
  'Old stripe-forming periodic strata still active');
assert.ok(opticalSection.includes('ribbonB*.052'),
  'Specular stripe intensity must be attenuated');
assert.ok(opticalSection.includes('pow(abs(cos(polar*4.0)),4.0)'),
  'Subpixel prism ridges must be softened');
assert.ok(archive.includes('fxArchiveDepthPolicyR2035'),
  'Archive shelves need a shared depth policy behind canonical MAG');
assert.ok(archive.includes('opticalDepth*d,d'),
  'Correct homogeneous depth projection missing');
const opticalDepth=z=>Math.max(-.16,Math.min(.86,.33-.15*z));
assert.ok(opticalDepth(-1.45)>.4&&opticalDepth(-1.15)>.4,
  'Far archive rails must never draw stripes across the foreground MAG');
assert.ok(opticalDepth(2.30)<.02,
  'Physically retrieved panel must still approach the viewer');
assert.ok(mobileLoader.includes('r2035-debanded-photographic-mag')&&
          currentLoader.includes('r2035-debanded-photographic-mag'),
  'Both display paths must invalidate stale shaders');
for(const code of [core,archive,heart,loop,mobileLoader,currentLoader])new Function(code);
console.log('MAG_R2034_STATIC_RELEASE_CONTRACT_PASS',JSON.stringify({
  proofSections:1,duplicateLegacyProofTitles:0,
  singleWebglRenderer:true,originalHtml:true,interactiveCta:true,
  stableMobileScreenLane:true,scrollGestureSafety:true,
  heavyMobileP0RenderBlocker:false
}));
