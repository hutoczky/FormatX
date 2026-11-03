'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const js=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
const css=fs.readFileSync('docs/scifi-ui/styles/formatx-cinematic-archive-r1987.css','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const p0=fs.readFileSync('.github/scripts/validate-native-mag-dock-entry-r2173.cjs','utf8');
for(const token of [
 'function prepareNativeHomeR2315(){',
 'if(disposed||reduced.matches||mobile()||archiveActive||!introDone||document.hidden)',
 "if(root.dataset.fxCrystalOrganismR326!=='ready')return",
 'const original=target.getBoundingClientRect()',
 "root.dataset.fxMagNativeHomeR2315==='prepared'?",
 "root.dataset.fxMagNativeHomeR2315='prepared'",
 "document.addEventListener('formatx:magbirthcomplete'",
 'prepareNativeHomeR2315();',
 "delete root.dataset.fxMagNativeHomeR2315"
])assert(js.includes(token),'R2315 true fixed native hero readiness missing: '+token);
for(const token of [
 'R2315 – viewport-owned native desktop home before scroll',
 '[data-fx-mag-native-home-r2315="prepared"]',
 ':not([data-fx-archive-dock="active"])',
 'position:fixed!important',
 'top:var(--fx-native-home-top-r2315)!important',
 'left:var(--fx-native-home-left-r2315)!important',
 'width:var(--fx-native-home-width-r2315)!important',
 'height:var(--fx-native-home-height-r2315)!important',
 'scale:none!important'
])assert(css.includes(token),'R2315 CSS native stage stable geometry lost: '+token);
assert(html.includes('formatx-cinematic-archive-r1987.js?v=20261103-r2315-prepared-fixed-home'));
assert(html.includes('formatx-cinematic-archive-r1987.css?v=20261103-r2315-prepared-fixed-home'));
assert(p0.includes("assert.equal(atHome.position,'fixed'"),'Real P0 must enforce initial fixed desktop MAG');
assert(p0.includes("'Native stage shifts after its first real docking'"),
 'No native stage CLS test may be bypassed');
console.log('R2315_STABLE_PHYSICAL_FIXED_HOME_BEFORE_SCROLL_SOURCE_PASS');
