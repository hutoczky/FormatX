'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = process.argv[2] || 'lighthouse-results';
const outDir = process.argv[3] || 'p0-evidence';
fs.mkdirSync(outDir, { recursive: true });

const profiles = ['desktop', 'mobile'];
const required = {
  performance: 1,
  accessibility: 1,
  'best-practices': 1,
  seo: 1,
  lcpMs: 1999,
  cls: 0.049,
  tbtMs: 150,
  fcpMs: 1800,
  ttfbMs: 500,
  runsPerProfile: 3
};

function readLhrs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(name => /^lhr-.*\.json$/i.test(name))
    .sort()
    .map(name => ({ name, lhr: JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')) }));
}

function metric(lhr, id) {
  const value = lhr.audits?.[id]?.numericValue;
  return Number.isFinite(value) ? value : null;
}

const report = {
  schema: 'formatx-p0-lighthouse/v1',
  generatedAt: new Date().toISOString(),
  required,
  profiles: {},
  pass: true,
  failures: []
};

for (const profile of profiles) {
  const files = readLhrs(path.join(root, profile));
  const runs = files.map(({ name, lhr }, index) => {
    const categories = {
      performance: lhr.categories?.performance?.score ?? null,
      accessibility: lhr.categories?.accessibility?.score ?? null,
      'best-practices': lhr.categories?.['best-practices']?.score ?? null,
      seo: lhr.categories?.seo?.score ?? null
    };
    const metrics = {
      fcpMs: metric(lhr, 'first-contentful-paint'),
      lcpMs: metric(lhr, 'largest-contentful-paint'),
      tbtMs: metric(lhr, 'total-blocking-time'),
      cls: metric(lhr, 'cumulative-layout-shift'),
      ttfbMs: metric(lhr, 'server-response-time')
    };
    const reasons = [];
    for (const [key, target] of Object.entries({ performance: 1, accessibility: 1, 'best-practices': 1, seo: 1 })) {
      if (categories[key] !== target) reasons.push(`${key}=${categories[key]}`);
    }
    if (!(metrics.lcpMs !== null && metrics.lcpMs < 2000)) reasons.push(`LCP=${metrics.lcpMs}ms`);
    if (!(metrics.cls !== null && metrics.cls < 0.05)) reasons.push(`CLS=${metrics.cls}`);
    if (!(metrics.tbtMs !== null && metrics.tbtMs <= required.tbtMs)) reasons.push(`TBT=${metrics.tbtMs}ms`);
    if (!(metrics.fcpMs !== null && metrics.fcpMs <= required.fcpMs)) reasons.push(`FCP=${metrics.fcpMs}ms`);
    if (!(metrics.ttfbMs !== null && metrics.ttfbMs <= required.ttfbMs)) reasons.push(`TTFB=${metrics.ttfbMs}ms`);
    const pass = reasons.length === 0;
    if (!pass) report.failures.push(`${profile} run ${index + 1}: ${reasons.join(', ')}`);
    return {
      run: index + 1,
      file: name,
      url: lhr.finalDisplayedUrl || lhr.finalUrl || null,
      lighthouseVersion: lhr.lighthouseVersion || null,
      categories,
      scores100: Object.fromEntries(Object.entries(categories).map(([k, v]) => [k, v === null ? null : Math.round(v * 100)])),
      metrics,
      pass,
      reasons
    };
  });

  if (runs.length !== required.runsPerProfile) {
    report.failures.push(`${profile}: expected ${required.runsPerProfile} runs, found ${runs.length}`);
  }
  report.profiles[profile] = { runs, pass: runs.length === required.runsPerProfile && runs.every(run => run.pass) };
}

report.pass = report.failures.length === 0 && profiles.every(profile => report.profiles[profile]?.pass);

const jsonPath = path.join(outDir, 'p0-lighthouse-summary.json');
const logPath = path.join(outDir, 'p0-lighthouse-summary.log');
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + '\n');

const lines = [
  `FormatX P0 VIP Lighthouse: ${report.pass ? 'PASS' : 'FAIL'}`,
  `Generated: ${report.generatedAt}`,
  'Required: desktop + mobile 100/100/100/100, 3/3 runs; LCP < 2000ms; CLS < 0.05; TBT <= 150ms; FCP <= 1800ms; TTFB <= 500ms.',
  ''
];
for (const profile of profiles) {
  lines.push(`[${profile.toUpperCase()}]`);
  for (const run of report.profiles[profile]?.runs || []) {
    const s = run.scores100;
    const m = run.metrics;
    lines.push(`run ${run.run}: ${run.pass ? 'PASS' : 'FAIL'} | ${s.performance}/${s.accessibility}/${s['best-practices']}/${s.seo} | LCP ${Math.round(m.lcpMs ?? -1)}ms | CLS ${m.cls} | TBT ${Math.round(m.tbtMs ?? -1)}ms | FCP ${Math.round(m.fcpMs ?? -1)}ms | TTFB ${Math.round(m.ttfbMs ?? -1)}ms`);
  }
  lines.push('');
}
if (report.failures.length) {
  lines.push('[FAILURES]');
  report.failures.forEach((failure, index) => lines.push(`${index + 1}. ${failure}`));
}
fs.writeFileSync(logPath, lines.join('\n') + '\n');
console.log(lines.join('\n'));
if (!report.pass) process.exit(1);
