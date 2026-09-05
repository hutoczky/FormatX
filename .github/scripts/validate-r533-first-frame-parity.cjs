'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const canonical = fs.readFileSync('docs/scifi-ui/styles/formatx-reference-production-r244.css', 'utf8');
const blocking = fs.readFileSync('docs/scifi-ui/styles/formatx-p0-first-paint-r490.css', 'utf8');

function ruleBody(css, selector, startMarker = '') {
  const start = startMarker ? css.indexOf(startMarker) : 0;
  assert.ok(start >= 0, `missing start marker: ${startMarker}`);
  const selectorIndex = css.indexOf(selector, start);
  assert.ok(selectorIndex >= 0, `missing selector: ${selector}`);
  const open = css.indexOf('{', selectorIndex + selector.length);
  const close = css.indexOf('}', open + 1);
  assert.ok(open >= 0 && close > open, `malformed rule: ${selector}`);
  return css.slice(open + 1, close);
}

function value(body, property, required = true) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = body.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*:\\s*([^;!]+?)\\s*!important\\s*;`, 'm'));
  if (!match) {
    if (required) assert.fail(`missing property ${property}`);
    return null;
  }
  return match[1].trim().replace(/\s+/g, ' ');
}

const canonicalMarker = '@media (min-width: 901px)';
const blockingMarker = '/* R533:';
const canonicalHero = 'html[data-fx-reference-production-r244="desktop"] body.living-architecture main#main-content section#hero.scene.hero';
const canonicalGrid = 'html[data-fx-reference-production-r244="desktop"] body.living-architecture #hero > .hero-grid';
const canonicalCopy = 'html[data-fx-reference-production-r244="desktop"] body.living-architecture #hero .hero-grid > .hero-copy';
const blockingHero = 'html body.living-architecture main#main-content section#hero.scene.hero';
const blockingGrid = 'html body.living-architecture #hero > .hero-grid';
const blockingCopy = 'html body.living-architecture #hero > .hero-grid > .hero-copy';

assert.match(blocking, /production-r533-p0-r244-auto-row-parity/, 'R533 parity marker missing');

const cHero = ruleBody(canonical, canonicalHero, canonicalMarker);
const bHero = ruleBody(blocking, blockingHero, blockingMarker);
for (const property of ['position', 'box-sizing', 'width', 'min-height', 'margin', 'padding', 'overflow']) {
  assert.equal(value(bHero, property), value(cHero, property), `hero ${property} is not r244-parity`);
}

const cGrid = ruleBody(canonical, canonicalGrid, canonicalMarker);
const bGrid = ruleBody(blocking, blockingGrid, blockingMarker);
for (const property of ['position', 'display', 'grid-template-columns', 'grid-template-areas', 'align-items', 'box-sizing', 'width', 'max-width', 'height', 'min-height', 'margin', 'padding', 'gap', 'overflow']) {
  assert.equal(value(bGrid, property), value(cGrid, property), `hero-grid ${property} is not r244-parity`);
}
assert.equal(value(cGrid, 'grid-template-rows', false), null, 'settled r244 must keep desktop rows implicit/auto');
assert.equal(value(bGrid, 'grid-template-rows'), 'none', 'blocking desktop rows must reset stale r283 explicit rows');
assert.equal(value(bGrid, 'min-height'), '0', 'blocking desktop grid must not retain the stale 808px minimum');

const cCopy = ruleBody(canonical, canonicalCopy, canonicalMarker);
const bCopy = ruleBody(blocking, blockingCopy, blockingMarker);
assert.equal(value(cCopy, 'height'), 'auto', 'settled r244 copy height changed unexpectedly');
assert.equal(value(cCopy, 'min-height'), '0', 'settled r244 copy minimum changed unexpectedly');
assert.equal(value(bCopy, 'height'), 'auto', 'blocking copy must use settled auto height');
assert.equal(value(bCopy, 'min-height'), '0', 'blocking copy must neutralize stale 505px minimum');

const lead = ruleBody(blocking, 'html body.living-architecture #hero .hero-lead', blockingMarker);
assert.equal(value(lead, 'min-block-size'), '0', 'blocking lead retains a stale minimum');
const method = ruleBody(blocking, 'html body.living-architecture #hero .fx-method-inline,', blockingMarker);
assert.equal(value(method, 'min-height'), '0', 'blocking method retains a stale minimum');

console.log('PASS: R533 blocking desktop first frame mirrors settled r244 auto-row/zero-minimum hero geometry.');
