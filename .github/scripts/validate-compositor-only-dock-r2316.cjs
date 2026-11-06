'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const js=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
const css=fs.readFileSync('docs/scifi-ui/styles/formatx-cinematic-archive-r1987.css','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const p0=fs.readFileSync('.github/scripts/validate-native-mag-dock-entry-r2173.cjs','utf8');
const dock=js.slice(js.indexOf('    static dock(){'),js.indexOf('    static restore(){'));
for(const word of [
 'R2316: stable fixed-layout desktop hero',
 "root.dataset.fxMagNativeHomeR2315==='prepared'",
 'const dx=x-previous.x,dy=y-previous.y',
 'const sx=w/previous.width,sy=h/previous.height',
 "const finalTransform='translate('",
 "stage.style.setProperty('transform',finalTransform,'important')",
 "root.dataset.fxArchiveFlipR2293='settled-native-onecanvas'",
 'window.FormatXLivingCore?.requestRender?.(1)'
])assert(dock.includes(word),'R2316 compositor-only physical canvas contract lost: '+word);
assert(dock.indexOf("const finalTransform='translate('")<
       dock.indexOf("stage.classList.add('fx-archive-native-docked')"),
 'The final native viewport transform must be resolved before docking');
const block=css.slice(css.indexOf('R2316 – physical-layout invariant for native MAG dock'));
for(const part of [
 '[data-fx-mag-native-home-r2315="prepared"][data-fx-archive-dock="active"]',
 'position:fixed!important',
 'top:var(--fx-native-home-top-r2315)!important',
 'left:var(--fx-native-home-left-r2315)!important',
 'width:var(--fx-native-home-width-r2315)!important',
 'height:var(--fx-native-home-height-r2315)!important'
])assert(block.includes(part),'R2316 archive must preserve fixed home layout: '+part);
assert(html.includes('formatx-cinematic-archive-r1987.js?v=20261103-r2316-layout-invariant-dock'));
assert(html.includes('formatx-cinematic-archive-r1987.css?v=20261103-r2316-layout-invariant-dock'));
assert(p0.includes('Native stage shifts after its first real docking'));
console.log('R2316_SAME_NATIVE_CANVAS_FIXED_LAYOUT_TRANSFORM_ONLY_SOURCE_PASS');
