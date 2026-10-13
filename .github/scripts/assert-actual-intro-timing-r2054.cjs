'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const report = JSON.parse(fs.readFileSync(process.argv[2] || 'artifacts/r2054-visitor-parity/report.json', 'utf8'));
assert.equal(report.cases.filter(item => item.name.startsWith('chromium-')).length, 6, 'All six visitor identity cases must execute');
const failures = [];
for (const item of report.cases.filter(item => item.name.startsWith('chromium-'))) {
  const at = (item.evidence || item.partial?.evidence)?.birth?.[0]?.at;
  const mobile = item.name.includes('-mobile-');
  const min = mobile ? 1180 : 1350, max = mobile ? 1450 : 1650;
  if (typeof at !== 'number' || !Number.isFinite(at) || at < min || at > max) failures.push({ case: item.name, measuredMs: at ?? null, min, max });
}
console.log(JSON.stringify({ actualIntroTimingFailures: failures }, null, 2));
assert.equal(failures.length, 0, 'The actual first-visit intro must meet the original bounded duration; no synthesized preloader timestamp');
