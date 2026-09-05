/* FormatX R530 — strict P0/WDA contract on current living-core architecture. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

require('./validate-living-core-r425-source.cjs');

const controls = read('docs/scifi-ui/scripts/formatx-control-owner-r268.js');
const language = read('docs/scifi-ui/scripts/single-language-toggle.js');
const renderer = read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const governor = read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const desktop = JSON.parse(read('lighthouserc.live.json'));
const mobile = JSON.parse(read('lighthouserc.live.mobile.json'));

for (const token of ['fx-reference-controls-r204', 'fx-reference-ask'])
  assert.ok(controls.includes(token), `missing canonical control contract: ${token}`);
assert.ok(!controls.includes('visibleControl(pause)'), 'manual MAG PAUSE cannot be a required control');
assert.ok(!controls.includes('function ensurePause'), 'manual MAG PAUSE creator returned');

for (const token of ['HU – váltás angol nyelvre', 'EN – switch to Hungarian', "fxSingleLanguageToggle='ready-v3'"])
  assert.ok(language.includes(token), `missing stable language contract: ${token}`);
assert.ok(!language.includes('new MutationObserver'), 'language owner must remain observer-free');

for (const token of ['single-webgl-crystal-organism-r326', 'function setLifecycleSuspended', 'document.hidden||!visible||renderSuspended', "listen(reduced,'change',onReducedMotionChange"])
  assert.ok(renderer.includes(token), `missing living renderer contract: ${token}`);
for (const obsolete of ['formatx:referencepause', 'fxReferenceMotionPaused', '.fx-reference-pause'])
  assert.ok(!renderer.includes(obsolete), `renderer still contains obsolete pause contract: ${obsolete}`);

for (const token of ['setLifecycleSuspended', "fxMobileRenderContractR528='automatic-resource-lifecycle-not-user-pause'"])
  assert.ok(governor.includes(token), `missing mobile lifecycle budget: ${token}`);

function threshold(assertions, key) {
  const entry = assertions[key];
  assert.ok(Array.isArray(entry) && entry[1] && typeof entry[1] === 'object', `missing Lighthouse assertion ${key}`);
  return entry[1];
}

function validateLighthouse(config, label) {
  const collect = config.ci.collect;
  const assertions = config.ci.assert.assertions;
  assert.equal(collect.numberOfRuns, 3, `${label}: final proof requires 3 consecutive runs`);
  assert.ok(Array.isArray(collect.url) && collect.url.length > 0, `${label}: public URL missing`);
  assert.ok(collect.url.every(url => !url.includes('lighthouse=1')), `${label}: audit-only URL forbidden`);
  assert.ok(!String(collect.settings?.chromeFlags || '').includes('force-prefers-reduced-motion'), `${label}: forced reduced motion forbidden`);
  assert.ok(!('skipAudits' in (collect.settings || {})), `${label}: skipped audits forbidden`);
  assert.equal(threshold(assertions, 'categories:performance').minScore, 1, `${label}: performance must be 100`);
  assert.equal(threshold(assertions, 'categories:accessibility').minScore, 1, `${label}: accessibility must be 100`);
  assert.equal(threshold(assertions, 'categories:best-practices').minScore, 1, `${label}: best-practices must be 100`);
  assert.equal(threshold(assertions, 'categories:seo').minScore, 1, `${label}: SEO must be 100`);
  assert.ok(threshold(assertions, 'largest-contentful-paint').maxNumericValue < 2000, `${label}: LCP must be <2.0s`);
  assert.ok(threshold(assertions, 'cumulative-layout-shift').maxNumericValue < 0.05, `${label}: CLS must be <0.05`);
  assert.ok(threshold(assertions, 'total-blocking-time').maxNumericValue <= 150, `${label}: TBT must be <=150ms`);
  assert.ok(threshold(assertions, 'server-response-time').maxNumericValue <= 500, `${label}: TTFB must be <=500ms`);
}

validateLighthouse(desktop, 'desktop');
validateLighthouse(mobile, 'mobile');
for (const source of [controls, language, renderer, governor]) new Function(source);
console.log('PASS: R530 WDA contract uses current living-core semantics and strict 100x3 Lighthouse thresholds.');
