'use strict';

const fs = require('node:fs');
const path = require('node:path');
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const METRICS = {
  fcp: ['first-contentful-paint', value => value <= 1800, '<=1800ms'],
  lcp: ['largest-contentful-paint', value => value < 2000, '<2000ms'],
  cls: ['cumulative-layout-shift', value => value < 0.05, '<0.05'],
  tbt: ['total-blocking-time', value => value <= 150, '<=150ms'],
  ttfb: ['server-response-time', value => value <= 500, '<=500ms']
};

function summarize(reports) {
  const failures = [];
  if (reports.length !== 3) failures.push(`Expected exactly 3 Lighthouse runs, got ${reports.length}`);
  const runs = reports.map(({ file, lhr }, index) => {
    const run = index + 1;
    const row = { run, file, url: lhr.finalDisplayedUrl || lhr.finalUrl, categories: {} };
    if (lhr.runtimeError) failures.push(`Run ${run} runtime error: ${lhr.runtimeError.code || lhr.runtimeError.message}`);
    for (const id of CATEGORIES) {
      const score = lhr.categories?.[id]?.score;
      row.categories[id] = score ?? null;
      if (score !== 1) failures.push(`Run ${run} ${id} ${score} is not 1.0`);
    }
    for (const [key, [id, passes, limit]] of Object.entries(METRICS)) {
      const value = lhr.audits?.[id]?.numericValue;
      row[key] = value ?? null;
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || !passes(value)) {
        failures.push(`Run ${run} ${id} ${value} must be finite, nonnegative and ${limit}`);
      }
    }
    row.speedIndex = lhr.audits?.['speed-index']?.numericValue ?? null;
    return row;
  });
  return { runs, failures };
}

function main(dir) {
  if (!dir) throw new Error('Usage: node summarize-p0-lighthouse.cjs <result-dir>');
  const profile = process.env.PROFILE || 'unknown';
  const files = fs.readdirSync(dir).filter(file => /^lhr-.*\.json$/.test(file)).sort();
  const reports = files.map(file => ({ file, lhr: JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) }));
  const result = summarize(reports);
  for (const [index, { lhr }] of reports.entries()) {
    console.log(`RUN ${index + 1} ${JSON.stringify(result.runs[index])}`);
    for (const id of CATEGORIES) {
      for (const ref of lhr.categories?.[id]?.auditRefs || []) {
        const audit = lhr.audits?.[ref.id];
        if (ref.weight > 0 && audit && audit.score !== null && audit.score < 1) {
          console.log(`FAIL-AUDIT run=${index + 1} ${ref.id} score=${audit.score} title=${audit.title} display=${audit.displayValue || ''}`);
        }
      }
    }
    for (const id of ['largest-contentful-paint-element', 'lcp-breakdown-insight', 'render-blocking-insight', 'network-dependency-tree-insight', 'unused-javascript', 'unused-css-rules', 'bootup-time', 'mainthread-work-breakdown', 'image-delivery-insight', 'font-display-insight']) {
      const audit = lhr.audits?.[id];
      if (!audit) continue;
      console.log(`DIAG run=${index + 1} ${id} score=${audit.score} numeric=${audit.numericValue ?? ''} display=${audit.displayValue ?? ''}`);
      if (Array.isArray(audit.details?.items) && audit.details.items.length) console.log(`  items=${JSON.stringify(audit.details.items.slice(0, 8)).slice(0, 9000)}`);
    }
  }
  fs.writeFileSync(path.join(dir, 'p0-summary.json'), JSON.stringify({ profile, auditedSha: process.env.AUDITED_SHA || null, ...result }, null, 2) + '\n');
  if (result.failures.length) throw new Error(result.failures.join('\n'));
  console.log(`P0_LIGHTHOUSE_${profile.toUpperCase()}_3X_PASS`);
}

module.exports = { summarize };
if (require.main === module) {
  try { main(process.argv[2]); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
