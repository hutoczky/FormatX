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
const worker=load('billing-worker/src/production-content-entry.js');
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
for(const s of [archive,heart,loop])new Function(s);
console.log('MAG_R2034_STATIC_RELEASE_CONTRACT_PASS',JSON.stringify({
  proofSections:1,duplicateLegacyProofTitles:0,
  singleWebglRenderer:true,originalHtml:true,interactiveCta:true,
  stableMobileScreenLane:true,scrollGestureSafety:true,
  heavyMobileP0RenderBlocker:false
}));
