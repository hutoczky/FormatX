'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { summarize } = require('./summarize-p0-lighthouse.cjs');

// Synthetic unit-test inputs only; never product measurement evidence.
function reports() {
  return Array.from({ length: 3 }, (_, index) => ({
    file: `unit-fixture-${index}.json`,
    lhr: {
      categories: Object.fromEntries(['performance', 'accessibility', 'best-practices', 'seo'].map(id => [id, { score: 1 }])),
      audits: Object.fromEntries(Object.entries({
        'first-contentful-paint': 1800,
        'largest-contentful-paint': 1999.9,
        'cumulative-layout-shift': 0.0499,
        'total-blocking-time': 150,
        'server-response-time': 500
      }).map(([id, numericValue]) => [id, { numericValue }]))
    }
  }));
}

test('requires exactly three individually passing runs', () => {
  assert.deepEqual(summarize(reports()).failures, []);
  for (const length of [0, 1, 2, 4]) {
    const input = Array.from({ length }, () => reports()[0]);
    assert.match(summarize(input).failures[0], /exactly 3/);
  }
});

test('rejects 99/100/99 instead of accepting the best or median run', () => {
  const input = reports();
  input[0].lhr.categories.performance.score = 0.99;
  input[2].lhr.categories.performance.score = 0.99;
  const result = summarize(input);
  assert.equal(result.runs.length, 3);
  assert.equal(result.failures.length, 2);
  assert.match(result.failures[0], /Run 1 performance/);
  assert.match(result.failures[1], /Run 3 performance/);
});

for (const category of ['performance', 'accessibility', 'best-practices', 'seo']) {
  test(`requires ${category} 1.0 in every run`, () => {
    const input = reports();
    input[1].lhr.categories[category].score = 0.99;
    assert.equal(summarize(input).failures.length, 1);
    delete input[1].lhr.categories[category];
    assert.equal(summarize(input).failures.length, 1);
  });
}

for (const [id, failing] of Object.entries({
  'first-contentful-paint': 1800.01,
  'largest-contentful-paint': 2000,
  'cumulative-layout-shift': 0.05,
  'total-blocking-time': 150.01,
  'server-response-time': 500.01
})) {
  test(`enforces ${id}, including missing or nonnumeric evidence`, () => {
    for (const numericValue of [failing, null, undefined, NaN, Infinity, '0', -1]) {
      const input = reports();
      input[2].lhr.audits[id].numericValue = numericValue;
      assert.equal(summarize(input).failures.length, 1, String(numericValue));
    }
  });
}

test('rejects an errored report even when its other fields look valid', () => {
  const input = reports();
  input[0].lhr.runtimeError = { code: 'PROTOCOL_TIMEOUT' };
  assert.match(summarize(input).failures[0], /runtime error: PROTOCOL_TIMEOUT/);
});
