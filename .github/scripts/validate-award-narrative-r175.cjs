'use strict';
// r176 public-integrity revalidation: first-paint-stable narrative + responsive composition + RAF optical scheduler.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'../..');
const read=f=>fs.readFileSync(path.join(repo,f),'utf8');
const index=read('docs/scifi-ui/index.html');
const css=read('docs/scifi-ui/styles/formatx-award-narrative-r175.css');
const js=read('docs/scifi-ui/scripts/formatx-award-narrative-r175.js');
const energy=read('docs/scifi-ui/scripts/formatx-living-energy-r168.js');

for(const token of [
  'formatx-award-narrative-r175.css?v=20260816-r175-award-narrative',
  'formatx-award-narrative-r175.js?v=20260816-r175-award-narrative'
])assert.ok(index.includes(token),`missing r175 index asset ${token}`);

for(const token of [
  'data-fx-design-system="2"',
  '--fx-r175-space-scene',
  '.section-heading h2',
  'text-wrap: balance',
  'data-fx-story-state="active"',
  '@media (max-width: 900px)',
  '@media (prefers-reduced-motion: reduce)'
])assert.ok(css.includes(token),`missing r175 CSS contract ${token}`);

for(const token of [
  "VERSION='r175-award-narrative-system'",
  'IntersectionObserver',
  'requestAnimationFrame',
  "addEventListener('scroll',scheduleProgress,{passive:true})",
  'formatx:storychapter',
  'fxActiveOrganR175',
  'fxNarrativeMotionR175',
  'SENSE / MAP / DECIDE',
  'ACT / VERIFY / REPORT',
  'PROOF / SUPPORT / SIGNAL'
])assert.ok(js.includes(token),`missing r175 JS contract ${token}`);

assert.doesNotMatch(js,/setInterval\s*\(/,'r175 story runtime must not use setInterval');
assert.doesNotMatch(css,/transition:\s*all\b/i,'r175 CSS must not animate all properties');
assert.doesNotMatch(css,/var\(--fx-r175-[^)]+\)\s*\*/,'r175 CSS must not depend on custom-property multiplication');
assert.ok(energy.includes("fxLivingEnergySchedulerR175='requestAnimationFrame-throttled-30ms'"),'r168 optical scheduler not upgraded to RAF-throttled r175 mode');
assert.doesNotMatch(energy,/setInterval\s*\(tick\s*,\s*32\s*\)/,'legacy 32ms setInterval still present');
new Function(js);new Function(energy);
console.log('PASS: r176 first-paint-stable award narrative, responsive composition, reduced motion and RAF-synchronised optical runtime are valid.');
