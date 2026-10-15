'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');

const names = [
  'formatx-ai-core-ident-r1951.js', 'formatx-apex.js',
  'formatx-award-narrative-r175.js', 'formatx-award-runtime-r206.js',
  'formatx-cinematic-archive-r1987.js', 'formatx-cinematic-continuity-r535.js',
  'formatx-cinematic-journey-r536.js', 'formatx-crystal-organism-r326.js',
  'formatx-current-mag-loader-r422.js', 'formatx-core-mobile-v55.js',
  'formatx-deferred-css-r487.js', 'formatx-infinite-scroll-desktop-v7.js',
  'formatx-infinite-scroll.js', 'formatx-return-state-recovery.js',
  'formatx-intro-bootstrap-r1629.js', 'formatx-intro-prepaint-owner-r1611.js',
  'formatx-living-architecture-loader-r1985.js', 'formatx-living-habitat-r1530.js',
  'formatx-mag-birth-live-r533.js', 'formatx-motion-runtime-loader-r239.js',
  'formatx-p0-motion-scheduler-r490.js', 'formatx-sensory-on-demand-r2000.js',
  'formatx-site-sensory-r1755.js', 'living-architecture.js'
];
const read = name => fs.readFileSync(name, 'utf8');
const html = read('docs/scifi-ui/index.html');
const bootstrap = html.match(/<script data-fx-intro-bootstrap-r1629="true">([\s\S]*?)<\/script>/)?.[1];
assert.ok(bootstrap, 'Parser-owned introductory bootstrap is missing');
const forbidden = /navigator\s*\.\s*(?:webdriver|userAgent)|Chrome-Lighthouse|HeadlessChrome|fxP0AuditModeR1728|(?:get|has)\(\s*['"](?:lighthouse|r486-optics-energy-check|mobileproof|organism-validation|scroll-test|design-test|verify)['"]\s*\)/;
for (const [name, source] of [['parser-bootstrap', bootstrap], ...names.map(name => [name, read('docs/scifi-ui/scripts/' + name)])]) {
  new vm.Script(source, { filename: name });
  assert.doesNotMatch(source, forbidden, name + ': visitor identity must not select a different runtime');
}

// The parser bootstrap decides visibility before a body or renderer exists.
// Vary identity while preserving viewport, session and explicit replay intent.
function prepaint(source, { mobile, seen, search, webdriver, userAgent, storageThrows = false }) {
  const root = { dataset: {} };
  const context = {
    document: { documentElement: root, readyState: 'loading', addEventListener() {} },
    location: { search }, URLSearchParams,
    navigator: { webdriver, userAgent },
    sessionStorage: { getItem() { if (storageThrows) throw new Error('storage unavailable'); return seen ? '1' : null; } },
    matchMedia: () => ({ matches: mobile })
  };
  vm.runInNewContext(source, context);
  return { visibility: root.dataset.fxIntroPrepaintR1611, owner: root.dataset.fxIntroPrepaintOwnerR1611 };
}
let cases = 0;
for (const source of [bootstrap, read('docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js'), read('docs/scifi-ui/scripts/formatx-intro-prepaint-owner-r1611.js')]) {
  for (const mobile of [false, true]) {
    for (const session of [{ seen: false, search: '' }, { seen: true, search: '' }, { seen: true, search: '?intro=1' }, { seen: false, search: '?lighthouse=1&r548=mobile-skip' }, { seen: false, search: '', storageThrows: true }]) {
      const base = { mobile, ...session };
      const expected = prepaint(source, { ...base, webdriver: false, userAgent: 'Mozilla Chrome' });
      for (const identity of [{ webdriver: true, userAgent: 'Mozilla HeadlessChrome' }, { webdriver: true, userAgent: 'Mozilla Chrome-Lighthouse' }]) {
        assert.deepEqual(prepaint(source, { ...base, ...identity }), expected, 'Prepaint visibility changes with visitor identity');
        cases++;
      }
      assert.equal(expected.visibility, !session.seen || session.search === '?intro=1' ? 'show' : 'skip');
    }
  }
}

const hash = 'sha256-' + crypto.createHash('sha256').update(bootstrap).digest('base64');
assert.ok(html.includes(hash), 'Authored CSP must permit the current inline bootstrap');
assert.ok(read('billing-worker/src/production-content-entry.js').includes(hash), 'Production CSP must permit the same bootstrap');
console.log(JSON.stringify({ sourceFiles: names.length + 1, prepaintIdentityComparisons: cases, cspHash: hash, result: 'pass' }));
require('./validate-intro-rescue-lifecycle-r2060.cjs');
require('./validate-shared-genesis-r2063.cjs');
const criticalControls=read('docs/scifi-ui/styles/formatx-menu-owner-r1956.css');
const downloadHitArea=criticalControls.match(/html body\.living-architecture a#hero-download\{([^}]+)\}/)?.[1];
assert.ok(downloadHitArea,'The original download anchor needs an unconditional critical hit area after archive relocation');
assert.match(downloadHitArea,/display:inline-flex!important/);
assert.match(downloadHitArea,/min-height:48px!important/);
assert.match(downloadHitArea,/min-width:48px!important/);
assert.equal((html.match(/formatx-menu-owner-r1956\.css\?v=20261015-r2106-late-scroll-input-ownership/g)||[]).length,2,'Preload and synchronous stylesheet must use the same current control CSS');
