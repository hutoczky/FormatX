'use strict';
// R2302 real desktop dock geometry regression; keep strict Chromium P0.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
const css=fs.readFileSync('docs/scifi-ui/styles/formatx-cinematic-archive-r1987.css','utf8');
const test=fs.readFileSync('.github/scripts/validate-native-mag-dock-entry-r2173.cjs','utf8');
assert(source.includes('function clearStageFlipR2293(restoreHome=true)'),
 'FLIP cleanup must distinguish archive settlement from original hero restoration');
assert(source.includes('clearStageFlipR2293(false);'),
 'settlement cannot restore pre-dock hero matrix');
assert(source.includes('const desktopNativeDockR2302=!mobile();'),
 'mobile stable compositor box must be left unchanged');
assert(source.includes("stage._fxArchiveFlipOriginalR2293="),
 'save authentic original inline transform for home return');
assert(source.includes("stage.style.setProperty('transform','none','important');"),
 'desktop docking must clear inline important transform');
assert(source.includes("if(restoreHome){") &&
 source.includes("delete stage._fxArchiveFlipOriginalR2293;"),
 'home return must restore original transform, transition and origin');
assert(source.includes("root.dataset.fxArchiveFlipR2293='settled-native-onecanvas';"),
 'film-to-archive must keep original single-canvas handoff');
assert(css.includes('width:38vw!important;')&&css.includes('height:74dvh!important;'),
 'original physical desktop viewport lane must be preserved');
for(const guard of [
 "result.final.width<first.viewport.width*.5",
 "result.final.x>=-2&&result.final.x+result.final.width<first.viewport.width*.53",
 "result.final.y>=0&&result.final.y+result.final.height<=first.viewport.height+2",
 "assert.deepEqual(result.observation.shifts.filter(s=>!s.recentInput&&s.at>=first.at),[]",
 "assert.equal(result.canvases,1)"
])assert(test.includes(guard),'Do not relax real Chromium dock geometry or CLS: '+guard);
console.log('R2302_DESKTOP_FLIP_HERO_MATRIX_RESTORATION_SOURCE_PASS');
