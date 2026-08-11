'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const worker = read('billing-worker/src/production-feedback-entry.js');
const seo = read('docs/scifi-ui/scripts/formatx-seo.js');
const css = read('docs/scifi-ui/styles/formatx-award-readiness.css');
const sitemap = read('docs/sitemap.xml');
const contract = JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));
const scrollPolicy = JSON.parse(read('docs/scifi-ui/data/scroll-policy.json'));
const scrollBootstrap = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');
const desktopScroll = read('docs/scifi-ui/scripts/formatx-infinite-scroll-desktop-v7.js');

assert.match(worker, /data-fx-award-readiness-style/, 'server-rendered award-readiness stylesheet missing');
assert.match(worker, /award-readiness-2/, 'award-readiness v2 stylesheet is not server-rendered');
assert.match(worker, /data-fx-award-positioning=\"v2\"/, 'award positioning marker missing');
assert.match(worker, /data-fx-hero-trustline/, 'first-screen factual trust line missing');
assert.match(worker, /Technikusi operációs réteg/, 'server-first product positioning title missing');
assert.match(worker, /5 napos próbalicenc/, 'trial proof missing from first response');
assert.match(worker, /Bazzite\/Linux elsődleges/, 'primary-platform truth missing from first response');
assert.match(worker, /id=\"formatx-structured-data\"/, 'server-rendered structured data missing');
assert.match(worker, /'@type': 'SoftwareApplication'/, 'server SoftwareApplication schema missing');
assert.match(worker, /offers:\s*\{/, 'server SoftwareApplication offer missing');
assert.match(worker, /price:\s*'7900'/, 'server SoftwareApplication offers.price missing');
assert.match(worker, /priceCurrency:\s*'HUF'/, 'server SoftwareApplication priceCurrency missing');
assert.match(worker, /twitter:card/, 'server social preview metadata missing');
assert.match(worker, /data-fx-award-proof/, 'public proof layer missing from first response');
assert.match(worker, /verification\.html/, 'public proof layer must link to verification');
assert.match(worker, /technical-report\.html/, 'public proof layer must link to technical report');
assert.match(worker, /security\.html/, 'public proof layer must link to security model');
assert.match(worker, /\/scifi-ui\/downloads\//, 'public proof layer must link to first-party release evidence');
assert.doesNotMatch(worker, /github\.com/i, 'server-rendered homepage proof/schema must remain first-party');

assert.match(seo, /offers:\s*\{/, 'client SoftwareApplication offer missing');
assert.match(seo, /price:'7900'/, 'client SoftwareApplication offers.price missing');
assert.match(seo, /priceCurrency:'HUF'/, 'client SoftwareApplication priceCurrency missing');
assert.match(seo, /twitter:card/, 'client social preview metadata missing');
assert.match(seo, /ready-v7/, 'SEO runtime revision must remain on the award-readiness v2 contract');
assert.match(seo, /award-readiness-2/, 'client award-readiness stylesheet revision missing');
assert.match(seo, /canonicalizeSoftwareSchema/, 'duplicate SoftwareApplication microdata cleanup missing');
assert.match(seo, /fxCanonicalSoftwareSchema='jsonld-only'/, 'canonical JSON-LD-only schema marker missing');
assert.doesNotMatch(seo, /github\.com/i, 'client SEO identity metadata must remain first-party');

assert.match(css, /:focus-visible/, 'high-visibility keyboard focus styling missing');
assert.match(css, /outline:\s*2px solid/, 'focus indicator size regressed below award-readiness target');
assert.match(css, /min-block-size:\s*44px/, 'enhanced coarse-pointer target size missing');
assert.match(css, /prefers-reduced-motion:\s*reduce/, 'reduced-motion treatment missing');
assert.match(css, /scroll-margin-top:/, 'sticky-header focus/anchor clearance missing');
assert.match(css, /\.fx-hero-trustline/, 'hero trust-line styling missing');
assert.match(css, /text-wrap:\s*pretty/, 'editorial text wrapping polish missing');
assert.match(css, /animation-timeline:\s*view\(\)/, 'progressive scroll-driven proof motion missing');
assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/, 'fine-pointer-only hover polish missing');

function sitemapLastmod(url) {
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = sitemap.match(new RegExp(`<url><loc>${escaped}<\\/loc><lastmod>(\\d{4}-\\d{2}-\\d{2})<\\/lastmod>`));
  assert.ok(match, `sitemap lastmod missing for ${url}`);
  assert.ok(!Number.isNaN(Date.parse(match[1] + 'T00:00:00Z')), `invalid sitemap lastmod for ${url}`);
  return match[1];
}

assert.ok(
  sitemapLastmod('https://www.formatxsuite.com/') >= '2026-08-08',
  'homepage sitemap lastmod is older than the audited award-readiness baseline'
);
assert.ok(
  sitemapLastmod('https://www.formatxsuite.com/scifi-ui/technical-report.html') >= '2026-08-10',
  'technical-report sitemap lastmod is older than the current evidence report'
);

assert.equal(contract.schema_version, 4, 'public platform contract schema is stale');
assert.equal(contract.public_delivery?.first_party_only, true, 'first-party public delivery contract regressed');
assert.equal(contract.layout_contract?.scroll_policy_source, '/scifi-ui/data/scroll-policy.json', 'public contract does not delegate scroll truth to the canonical policy');
assert.equal(contract.layout_contract?.mobile?.controller, 'mobile-native-document-v1', 'public contract mobile controller is stale');
assert.equal(contract.layout_contract?.mobile?.automatic_scroll_loop, false, 'public contract incorrectly claims a mobile loop');
assert.equal(contract.layout_contract?.desktop?.controller, 'seamless-v7', 'public contract desktop controller regressed');
assert.equal(contract.layout_contract?.desktop?.automatic_scroll_loop, true, 'desktop seamless loop must remain enabled');

assert.equal(scrollPolicy.mobile?.controller, 'mobile-native-document-v1', 'canonical mobile native-document controller regressed');
assert.equal(scrollPolicy.mobile?.automatic_loop, false, 'mobile automatic loop must remain disabled');
assert.equal(scrollPolicy.mobile?.visual_bridge, false, 'mobile visual bridge must remain disabled');
assert.equal(scrollPolicy.mobile?.automatic_page_position_changes, false, 'mobile automatic page positioning must remain disabled');
assert.equal(scrollPolicy.desktop?.controller, 'seamless-v7', 'desktop seamless-v7 controller regressed');
assert.equal(scrollPolicy.desktop?.automatic_loop, true, 'desktop seamless scrolling must remain enabled');
assert.equal(scrollPolicy.policy?.input_capture, false, 'wheel/touch capture must remain disabled');
assert.equal(scrollPolicy.policy?.section_scroll_snap, false, 'section scroll snap must remain disabled');
assert.match(scrollBootstrap, /platform-scroll-v2/, 'platform scroll bootstrap missing');
assert.doesNotMatch(scrollBootstrap, /scrollTo\s*\(|scrollIntoView\s*\(|cloneNode\s*\(/, 'mobile-capable bootstrap must not move or clone the page');
assert.match(desktopScroll, /const VERSION = 'seamless-v7'/, 'desktop seamless runtime missing');

console.log('FormatX award-readiness SEO, hierarchy, proof, accessibility, first-party delivery, sitemap freshness and platform-specific scroll validation passed.');
