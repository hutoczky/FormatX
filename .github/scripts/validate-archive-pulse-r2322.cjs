'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const a=s.indexOf('    function finishArchiveSurfacePulse('),b=s.indexOf('    function startSurfacePulse(',a);
assert.ok(a>=0&&b>a);
const simulate=new Function(`
 let raf=7,scrollTransitPermit=true,qualityResizeTimer=9,surfacePulseStart=100,draws=0,pulses=0,events=[];
 const root={dataset:{fxArchiveDock:'active'}};
 const schedule=()=>draws++,scheduleSurfacePulse=()=>pulses++,SURFACE_PULSE_WINDOW_MS=1880;
 class CustomEvent{constructor(name,options){this.name=name;this.detail=options.detail;}}
 const dispatchEvent=e=>events.push(e);
 ${s.slice(a,b)}
 return {finish:finishArchiveSurfacePulse,home:()=>root.dataset.fxArchiveDock='home',state:()=>({raf,scrollTransitPermit,qualityResizeTimer,surfacePulseStart,draws,pulses,events,dataset:root.dataset})};
`);
const t=simulate();assert.equal(t.finish('autonomous'),true);
const r=t.state();assert.equal(r.raf,7);assert.equal(r.scrollTransitPermit,true);assert.equal(r.qualityResizeTimer,9);assert.equal(r.surfacePulseStart,-Infinity);
assert.equal(r.draws,1);assert.equal(r.pulses,1);assert.equal(r.events.length,1);assert.equal(r.events[0].detail.phase,'end');
assert.equal(r.dataset.fxCoreIdleBoundaryR1710,'archive-frame-preserved');
const h=simulate();h.home();assert.equal(h.finish('autonomous'),false);assert.equal(h.state().draws,0);assert.equal(h.state().surfacePulseStart,100);
const i=simulate();i.finish('interaction');assert.equal(i.state().pulses,0);
assert.ok(s.includes('if(finishArchiveSurfacePulse(source))return;'));
assert.ok(s.includes('hard-zero-frame-after-sweep'));
console.log('R2322 archive pulse ownership PASS: pending transit, resize, lifecycle event and hero idle contract preserved');
