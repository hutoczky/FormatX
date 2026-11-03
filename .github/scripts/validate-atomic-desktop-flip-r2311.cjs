'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const js=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const css=fs.readFileSync('docs/scifi-ui/styles/formatx-cinematic-archive-r1987.css','utf8');
const dock=js.slice(js.indexOf('    static dock(){'),js.indexOf('    static restore(){'));
for(const token of [
 'R2311: calculate the FINAL CSS viewport lane BEFORE mutating',
 'x:innerWidth*.025,y:innerHeight*.12',
 'width:innerWidth*.38,height:innerHeight*.74',
 'const target=desktopViewportTargetR2311||stage.getBoundingClientRect()',
 "stage.style.setProperty('transform',",
 'void stage.getBoundingClientRect();'
])assert(dock.includes(token),'R2311 precomputed atomic dock regression: '+token);
const measured=dock.indexOf('const previous=stage.getBoundingClientRect()');
const target=dock.indexOf('const desktopViewportTargetR2311');
const toggled=dock.indexOf("stage.classList.add('fx-archive-native-docked')");
const inverted=dock.indexOf('const target=desktopViewportTargetR2311');
const applied=dock.indexOf("stage.style.setProperty('transform',");
const flush=dock.indexOf('void stage.getBoundingClientRect()');
assert(measured>=0&&measured<target&&target<toggled&&toggled<inverted&&
 inverted<applied&&applied<flush,'FLIP must not flush the raw fixed position');
assert(!dock.includes('const target=stage.getBoundingClientRect()'),
 'A forced raw dock measurement reintroduces 1440 native MAG CLS');
assert(css.includes('left:2.5vw!important;')&&css.includes('top:12dvh!important;'));
assert(css.includes('width:38vw!important;')&&css.includes('height:74dvh!important;'));
assert(css.includes('scale:none!important;'),'No transformed ancestor may capture fixed MAG');
assert(html.includes('formatx-cinematic-archive-r1987.js?v=20261103-r2311-compositor-atomic-flip'));
assert(js.includes('introDone&&nativeHomeCompositedR2310&&enteredScroll'),
 'R2310 real painted-native compositor must remain gated');
console.log('R2311_REAL_VIEWPORT_ATOMIC_FLIP_WITH_R2310_COMPOSITOR_PASS');
