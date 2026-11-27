'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
assert.doesNotThrow(()=>new Function(s));
const a=s.indexOf('    function resize(onlyChanged=false){'),b=s.indexOf('    function blocked(){',a);
const make=new Function('w','h','dpr','maxW','maxH','buffer',`
 let width=0,height=0,aspect=1,qualityScale=1,devicePixelRatio=dpr,queries=0;
 const stage={getBoundingClientRect:()=>({width:w,height:h})},canvas={width:0,height:0},root={dataset:{}};
 const gl={MAX_VIEWPORT_DIMS:1,MAX_RENDERBUFFER_SIZE:2,viewport(){},getParameter(k){queries++;return k===1?[maxW,maxH]:buffer;}};
 const softwareRenderer=false,mobile=false,auditMode=false,constrainedMobile=false,constrained=false;
 ${s.slice(a,b)}
 resize();resize(true);return {w:width,h:height,queries};
`);
assert.deepEqual(make(3840,2160,1,8192,8192,8192),{w:3840,h:2160,queries:2});
assert.deepEqual(make(1920,1080,2,8192,8192,8192),{w:3840,h:2160,queries:2});
assert.deepEqual(make(3840,2160,1,2048,8192,8192),{w:2048,h:1152,queries:2});
assert.deepEqual(make(7680,1080,1,4096,4096,4096),{w:4096,h:576,queries:2});
assert.deepEqual(make(3840,2160,1,8192,8192,2048),{w:2048,h:1152,queries:2});
const start=s.indexOf('            const studioRecovery='),end=s.indexOf('              stableBudgetFrames=0;',start);
const recovery=new Function('mobile','softwareRenderer','constrained','stableBudgetFrames','qualityScale','renderAverage',`
 const qualityCeiling=1,frameIntervalAverage=16,expectedFrame=16.67,renderPeak=4;
 ${s.slice(start,end)} } return qualityScale;
`);
assert.ok(Math.abs(recovery(false,false,false,61,.74,2)-.775)<1e-9);
assert.equal(recovery(false,false,false,61,.74,5),.74);
assert.equal(recovery(true,false,false,61,.74,2),.74);
assert.ok(Math.abs(recovery(false,true,false,361,.74,2)-.7415)<1e-9);
console.log('R2328 native GPU dimension limits and UHD quality recovery: PASS');
