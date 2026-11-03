'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const js=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const p0=fs.readFileSync('.github/scripts/validate-native-mag-dock-entry-r2173.cjs','utf8');
assert(js.includes('let nativeHomeCompositedR2310=introDone'));
assert(js.includes('let nativeHomeGateScheduledR2310=false'));
assert(js.includes('introDone&&nativeHomeCompositedR2310&&enteredScroll'),
  'actual native scroll entry must require the real home compositor paint');
assert(js.includes("document.addEventListener('formatx:magbirthcomplete'"));
assert(js.includes("root.dataset.fxArchiveNativeHomeR2310='awaiting-two-frames'"));
assert(js.includes("root.dataset.fxArchiveNativeHomeR2310='painted-before-archive'"));
assert(js.includes('window.FormatXLivingCore?.requestRender?.(1)'));
assert(js.includes('requestAnimationFrame(()=>{\n        if(disposed)'));
assert(js.includes('requestAnimationFrame(()=>{\n          nativeHomeGateScheduledR2310=false'));
assert(js.includes('if(introDone&&!nativeHomeCompositedR2310)settleNativeHomeR2310()'));
assert(js.includes('if(!mobile()){\n        nativeHomeCompositedR2310=false;'));
assert(html.includes('formatx-cinematic-archive-r1987.js?v=20261103-r2311-compositor-atomic-flip'));
for(const token of [
 'Native stage shifts after its first real docking',
 'R2299 desktop MAG escaped the left photographic lane',
 'NATIVE_MAG_HOME_BEFORE_SCROLL',
 'opacity:getComputedStyle',
 'homeGate:document.documentElement.dataset.fxArchiveNativeHomeR2310'
])assert(p0.includes(token),'R2310 strict real browser proof must remain: '+token);
console.log('R2310_NATIVE_FIRST_PRESENT_COMPOSITOR_GATE_SOURCE_PASS');
