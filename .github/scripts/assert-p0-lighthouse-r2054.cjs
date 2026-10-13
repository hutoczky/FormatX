'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const directory = process.argv[2];
assert.ok(directory, 'A directory of three freshly collected reports is required');
const reports = fs.readdirSync(directory).filter(name => /^lhr-.*\.json$/.test(name))
  .map(name => ({ name, report: JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')) }));
assert.equal(reports.length, 3, 'Each viewport must contain exactly three actual Lighthouse runs');
const failures = [];
for (const { name, report } of reports) {
  const requested = new URL(report.requestedUrl);
  for (const key of ['lighthouse', 'mobileproof', 'r486-optics-energy-check', 'introframe', 'proofrenderer']) {
    if (requested.searchParams.has(key)) failures.push({ name, audit: 'normal-visitor-url', query: key });
  }
  if (report.runtimeError) failures.push({ name, audit: 'runtime-error', error: report.runtimeError });
  for (const category of ['performance', 'accessibility', 'best-practices', 'seo']) {
    if (report.categories?.[category]?.score !== 1) failures.push({ name, audit: category, score: report.categories?.[category]?.score ?? null });
  }
  for (const [audit, max] of [['first-contentful-paint', 1800], ['largest-contentful-paint', 1999],
    ['cumulative-layout-shift', .049], ['total-blocking-time', 150], ['server-response-time', 500]]) {
    const value = report.audits?.[audit]?.numericValue;
    if (typeof value !== 'number' || !Number.isFinite(value) || value > max) failures.push({ name, audit, value: value ?? null, max });
  }
}
console.log(JSON.stringify({ reports: reports.map(({ name, report }) => ({ name, fetchTime: report.fetchTime, requestedUrl: report.requestedUrl })), failures }, null, 2));
assert.equal(failures.length, 0, 'Every individual run must meet the full P0 contract; a better sibling run cannot hide a failure');
