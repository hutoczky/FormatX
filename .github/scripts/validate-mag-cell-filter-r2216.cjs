'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const native=fs.readFileSync(process.argv[2]||'docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const film=fs.readFileSync(process.argv[3]||'docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const cell=s=>s.match(/void fxLivingMagCell\(inout vec3 lensColor,vec2 oq,float od\)\{[\s\S]*?\n      \}/)?.[0];
assert(cell(native)&&cell(film),'Read both actual living-cell functions');
assert.equal(cell(native),cell(film),'Both MAGs must keep one identical cell field and pixel filter');
const body=cell(native);
assert(body.includes('#ifdef FX_MAG_CELL_DERIVATIVES'),'The fine filter must remain capability-safe');
assert(body.includes('float fineFootprint=max(fwidth(tissuePhaseA),fwidth(tissuePhaseB));'),
 'Use the actual projected phase footprint rather than a viewport or UA shortcut');
assert(body.includes('tissueIslands*=fineVisibility;'),'Filter only the fine tissue carrier');
const bounds=body.match(/float fineVisibility=1\.0-smoothstep\(([.\d]+),([.\d]+),fineFootprint\);/);
assert(bounds,'The shared fine-cell filter is missing');
const [start,end]=bounds.slice(1).map(Number);assert(start>0&&end>start&&end<Math.PI);
const weight=width=>{const t=Math.max(0,Math.min(1,(width-start)/(end-start)));return 1-t*t*(3-2*t);};
assert.equal(weight(start*.5),1,'Keep resolvable close-up tissue');
assert.equal(weight(Math.PI),0,'Remove the unresolved fine carrier before the sampling limit');
let last=1;for(let i=0;i<=100;i++){const value=weight(i*Math.PI/100);assert(value>=0&&value<=last);last=value;}
assert(body.includes('float tissueFold=sin(')&&body.includes('float metabolicPulse=.82+.18*sin(uTime*.72+oq.x*4.0);'),
 'Preserve broad living tissue and the original metabolism clock');
assert(native.includes("${derivativeSupport?'#define FX_MAG_CELL_DERIVATIVES\\n':''}"),
 'Reuse the existing native derivative capability; keep its genuine non-derivative path');
assert(film.includes('#define FX_MAG_CELL_DERIVATIVES'),'The existing Three WebGL2 material must enable the shared filter');
assert(native.includes('gl.uniform1f(uniforms.uTime,simulationTime);'));
assert(film.includes('this.livingMagOpticUniforms.uTime.value=time*.001;'));
console.log('MAG_CELL_FILTER_R2216_PASS',JSON.stringify({sharedFunctionExact:true,footprintBounds:[start,end],closeUpWeight:weight(.1),unresolvedWeight:weight(Math.PI),originalClocks:true,notBrowserOrHardwareAcceptance:true}));
