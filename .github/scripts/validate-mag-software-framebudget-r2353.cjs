'use strict';
/* R2353 frame budget regression for genuinely detected SOFTWARE WebGL;
   exact 60+ Hz hardware, original cinematic and full GPU pixel P0 stay. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
assert(s.includes("const softwareRenderer=/swiftshader|llvmpipe|software|softpipe|mesa offscreen/.test(rendererName);"));
const expression=kind=>{
 const name=kind==='burst'?'burstDelay':'sweepDelay';
 const re=new RegExp('const '+name+'=(.*?);','s');
 const match=s.match(re);
 assert(match,kind+' must keep a true value-dependent bounded scheduler');
 const body=match[1];
 assert(body.includes('softwareRenderer&&renderAverage>28'),
  kind+' pacing must follow the actual software GPU and cost, NEVER a test flag');
 assert(!/auditMode|lighthouse|playwright|navigator\.webdriver|userAgent/i.test(body),
  'No audit-mode bypass permitted');
 return new Function('softwareRenderer','renderAverage','return ('+body+');');
};
const burst=expression('burst'),sweep=expression('sweep');
const rows=[];
for(const ms of [0,1,9,28,28.01,34,40,75,105,180,400,1000]){
 const hb=burst(false,ms),hs=sweep(false,ms);
 assert.equal(hb,0,'Hardware 60+Hz burst cannot be paced');
 assert.equal(hs,0,'Hardware 60+Hz physical sweep cannot be paced');
 const sb=burst(true,ms),ss=sweep(true,ms);
 if(ms<=28){assert.equal(sb,0);assert.equal(ss,0);}
 else{
  assert(sb>=32&&sb<=200,'Software burst bounded and finite');
  assert(ss>=24&&ss<=112,'Software surface sweep bounded and finite');
  assert(Number.isFinite(sb)&&Number.isFinite(ss));
 }
 rows.push({renderMs:ms,hardwareBurst:hb,hardwareSweep:hs,softwareBurst:sb,softwareSweep:ss});
}
for(const token of [
  'render(now);burstFrames=Math.max(0,burstFrames-1);',
  'queueFrame(burstDelay);',
  'queueFrame(sweepDelay);',
  'if(filmConcealsNativeR2261()){',
  'if(pendingGpuFenceR2253){',
  'if(finish>surfacePulseStart)render(finish);',
  'root.dataset.fxCoreReal3dTargetFps=',
  'if(qualityResizeProtectedR2283())return;',
  "listen(document,'formatx:magbirthprepare',prepareNativeFrameR2254",
  'const softwareRenderer=/swiftshader|llvmpipe|software|softpipe|mesa offscreen/.test(rendererName);'
])assert(s.includes(token),'Do not alter original optical/fence/presentation contracts: '+token);
assert.equal((s.match(/createElement\('canvas'\)/g)||[]).length,1);
const f=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
assert(f.includes('this.updateDNA(t,time);')&&f.includes('this.updateCore(t,time);')
  &&f.includes('this.updateMechanical(t,time);'),'All three original film chapters must survive');
console.log('R2353_REAL_SOFTWARE_WEBGL_FRAME_BUDGET_PASS',
 JSON.stringify({rows,hardwareNative60Untouched:true,noAuditBypass:true,
 originalFrameEndAndGpuFirstPresentation:true,realChromiumAndDeviceTestsRequired:true}));
