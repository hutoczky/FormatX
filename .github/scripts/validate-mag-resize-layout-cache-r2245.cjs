'use strict';
// R2245: quality-only GPU resizes cannot trigger a fresh layout read.
// True stage/viewport resizes must still remeasure and update the cache.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const text=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const start=text.indexOf('    // R2245: a quality-only GPU backing-store resize');
const end=text.indexOf('\n    /* R2244: a burst',start);
assert(start>=0&&end>start,'R2245 cached stage geometry contract missing');
const impl=text.slice(start,end);
assert(impl.includes('stage.getBoundingClientRect()'),
  'Actual stage resizes must still read the real CSS box');
assert(impl.includes('if(!qualityOnly)lastStageBoxR2245='),
  'Only real layouts should update the cached measurement');
const make=new Function('stage','canvas','gl','root','devicePixelRatio',
  "const softwareRenderer=false,mobile=true,auditMode=false,"+
  "constrainedMobile=false,constrained=false;"+
  "let qualityScale=1,width=0,height=0,aspect=1;"+
  impl+
  "return {resize,setQuality:q=>qualityScale=q,getBox:()=>lastStageBoxR2245};"
);
let reads=0,viewports=0,rect={width:390,height:420};
const stage={getBoundingClientRect(){reads++;return {...rect};}};
const canvas={width:0,height:0};
const gl={viewport(){viewports++;}};
const root={dataset:{}};
const api=make(stage,canvas,gl,root,3);
assert(api.resize(),'first real layout should be measurable');
assert.equal(reads,1);
const first={w:canvas.width,h:canvas.height};
api.setQuality(.82);
for(let i=0;i<24;i++)assert(api.resize(true));
assert.equal(reads,1,'24 quality changes must not force any layout read');
assert(canvas.width<first.w&&canvas.height<first.h,
  'Quality-only framebuffer must still adapt to the real pixel budget');
rect={width:430,height:515};
assert(api.resize(),'actual viewport change must update backing-store geometry');
assert.equal(reads,2,'actual layout update must not use stale dimensions');
assert.deepEqual(api.getBox(),rect,'new CSS box must become the cached box');
api.setQuality(.74);
assert(api.resize(true));
assert.equal(reads,2,'quality changes after real resize must use fresh cache');
assert(root.dataset.fxCoreReal3dResolution===canvas.width+'x'+canvas.height,
  'public framebuffer telemetry contract must remain intact');
assert.equal(viewports,27,'one WebGL viewport configuration per resize');
console.log('MAG_R2245_QUALITY_ONLY_RESIZE_LAYOUT_CACHE_PASS');
