'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const report = JSON.parse(fs.readFileSync(process.argv[2] || 'artifacts/r2054-visitor-parity/report.json', 'utf8'));
assert.equal(report.cases.filter(item => item.name.startsWith('chromium-')).length, 6, 'All six visitor identity cases must execute');
const failures = [];
for (const item of report.cases.filter(item => item.name.startsWith('chromium-'))) {
  const duration = (item.evidence || item.partial?.evidence)?.birth?.[0]?.duration;
  const mobile = item.name.includes('-mobile-');
  const min = mobile ? 1180 : 1350, max = mobile ? 1450 : 1650;
  if (typeof duration !== 'number' || !Number.isFinite(duration) || duration < min || duration > max) failures.push({ case: item.name, measuredMs: duration ?? null, min, max });
}
console.log(JSON.stringify({ actualIntroTimingFailures: failures }, null, 2));
assert.equal(failures.length, 0, 'The actual first-visit intro must meet the original bounded duration; no synthesized preloader timestamp');
