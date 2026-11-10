'use strict';
/* R2365 — execute actual desktop-phase-3 native warmup gate with original
 * 10s R533 film and full mobile/reduced-motion ownership untouched. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
const marker='    // R2365 experimental:';
const start=source.indexOf(marker);
const end=source.indexOf('    if(MOBILE){\n      const values=[8,34,62,86,100];',start);
assert(start>=0&&end>start&&end-start<1200,'Exact R2365 original phase boundary missing');
const gate=source.slice(start,end);
const exec=new Function('MOBILE','REDUCED','value','requestCoreWarmup',gate);
for(const MOBILE of [false,true])
for(const REDUCED of [false,true])
for(let value=0;value<=4;value++){
 const requests=[];
 exec(MOBILE,REDUCED,value,source=>requests.push(source));
 const enabled=!MOBILE&&!REDUCED&&value===3;
 assert.equal(requests.length,enabled?1:0,
   'Desktop earlier warmup must happen at the real phase-3 boundary only');
 if(enabled)assert.equal(requests[0],'r2365-desktop-film-phase-3');
}
for(const token of [
 'const DURATION = 10000;',
 'const CORE_WARMUP_PROGRESS = MOBILE ? .72 : .72;',
 "if(value===2)requestCoreWarmup('mobile-css-phase-2-r631');",
 'if (r >= CORE_WARMUP_PROGRESS) requestCoreWarmup(\'timeline-\'+Math.round(r*100));',
 'const nativeReveal=smoothstep((r-.915)/.08);',
 'if (warmupDispatched) return;',
 "document.dispatchEvent(new CustomEvent('formatx:magbirthcorewarmup'",
 'if(!nativeFencePrefetchedR2278 && r>=.90',
 "document.dispatchEvent(new CustomEvent('formatx:magbirthprepare'"
])assert(source.includes(token),'Original real film/handoff contract absent: '+token);
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const native=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
assert(native.includes('function buildOrganismGeometry(software=false)'));
assert(native.includes('root.dataset.fxMagBootPhasesR2241=JSON.stringify'));
assert(html.includes('formatx-mag-birth-live-r533.js'));
console.log('R2365_ORIGINAL_DESKTOP_PHASE3_SINGLE_WARMUP_GATE_PASS',
 JSON.stringify({desktopPhase3Only:true,anyMobileDifference:false,reducedMotionUnchanged:true,
   tenSecondFilm:true,originalNativeR326:true,realChromiumP0And3xLHRStillRequired:true}));
