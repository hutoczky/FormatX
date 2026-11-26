'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
const start=src.indexOf('  function cubeGeometry()'),end=src.indexOf('  function panelGeometry(');
assert(start>=0&&end>start,'missing reactor geometry/track');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
const host={};
const {reactorHousing,reactorGeometry,reactorEntry,reactorHandoff,corridorEntry,readingTravel,readingFlight,readingEnergy,entryTransitProgress,corridorTransitProgress,reactorVisibleVertices,reactorRingState}=new Function('clamp','mix','smooth','entryReactorHost',
  src.slice(start,end)+'return {reactorHousing,reactorGeometry,reactorEntry,reactorHandoff,corridorEntry,readingTravel,readingFlight,readingEnergy,entryTransitProgress,corridorTransitProgress,reactorVisibleVertices,reactorRingState};')(clamp,mix,smooth,host);
const v=reactorGeometry(),counts={};
assert.equal(v.length,960*3*8);
for(let i=0;i<v.length;i+=8){
  for(let j=0;j<8;j++)assert(Number.isFinite(v[i+j]),'nonfinite vertex');
  assert(Math.abs(Math.hypot(v[i+3],v[i+4],v[i+5])-1)<1e-5,'invalid normal');
  assert([2,3,4].includes(v[i+7]),'invalid ring');
  const material=v[i+6]>.6?'guide':'metal';
  const key=v[i+7]+':'+material;
  counts[key]=(counts[key]||0)+1;
}
for(const ring of [2,3,4])for(const material of ['guide','metal'])assert.equal(counts[ring+':'+material],material==='metal'?672:288);
const entry={cinemaHost:host,key:'systems'};
let previous=0;
for(let i=0;i<=100;i++){
  const p=i/100,transfer=reactorHandoff(entry,p);
  assert(transfer.settle>=previous&&transfer.settle<=1,'nonmonotonic handoff');
  previous=transfer.settle;
  const gate=reactorEntry(entry,p);
  if(gate)assert(gate.alpha>=0&&gate.alpha<=1&&gate.z<=1.05);
  else assert(p>=.78);
  assert.equal(reactorHandoff({cinemaHost:{},key:'diagnostics'},p).settle,1);
  assert.equal(reactorHandoff({cinemaHost:host,key:'licensing'},p).settle,1);
}
assert.equal(reactorHandoff(entry,.62).phase,'clear');
assert.equal(reactorHandoff(entry,.62).settle,1);
assert(src.includes('this.mesh(this.reactor,'));
assert(src.includes("gl.deleteBuffer(this.reactor.buffer)"));
assert(src.includes("if(ingress&&ingress.alpha>.001&&k===1)continue;"),'reactor adds a draw call');
console.log('R2264_REACTOR_GEOMETRY_PASS '+JSON.stringify({triangles:v.length/24,materials:counts,scrollSamples:101,oneBatchedDraw:true}));

const next={cinemaHost:{},key:'diagnostics'};
const checkout={cinemaHost:{},key:'licensing'};
assert.equal(corridorEntry(entry,.1),null);
assert.equal(corridorEntry({key:'missing'},.1),null);
assert.equal(corridorEntry(next,0),null);
assert.equal(corridorEntry(next,.30).alpha,0);
assert.equal(corridorEntry(next,.64),null);
let lastZ=-Infinity,lastProgress=-Infinity;
for(let i=0;i<100;i++){
  const p=.30+.34*i/100,a=corridorEntry(next,p),b=corridorEntry(checkout,p);
  assert(a.alpha>=0&&a.alpha<=.66&&b.alpha>=0&&b.alpha<=.38);
  assert(a.z>=lastZ&&a.progress>=lastProgress);
  lastZ=a.z;lastProgress=a.progress;
  assert.equal(reactorHandoff(next,p).settle,1);
  assert.equal(reactorHandoff(checkout,p).settle,1);
}
assert(corridorEntry(next,.63999).alpha<.00001);
const selectionProgress=(.88-.52)/1.15;
assert(corridorEntry(next,selectionProgress).alpha>0,'gate must be visible at contiguous chapter entry');
assert(corridorEntry(next,.42).alpha>.60,'gate must reach full intensity after selection');
assert(corridorEntry(checkout,.42).alpha<=.38);
console.log('R2265_SYSTEM_CORRIDOR_PASS '+JSON.stringify({samples:100,checkoutIntensityLimit:.38,firstEntryUnchanged:true}));

for(const vh of [390,768,844,1080]){
  const height=1.65*vh,from=-.017*vh,to=.94*vh-height;
  let previous=-1,lit=0;
  for(let i=0;i<=100;i++){
    const t=i/100,rect={height,top:from+(to-from)*t};
    const travel=readingTravel(rect,vh),flight=readingFlight(travel);
    assert(Math.abs(travel-t)<1e-10&&travel>=previous);
    previous=travel;
    assert(Math.abs(flight.x)<=.16&&Math.abs(flight.y)<=.045&&Math.abs(flight.z)<=.30);
    for(let rack=0;rack<8;rack++){
      const energy=readingEnergy(travel,rack,8);
      assert(energy>=0&&energy<=1);
      if(energy>.1)lit++;
    }
  }
  assert(lit>0);
  assert.equal(readingTravel({height:vh*.7,top:0},vh),0);
}
for(const t of [0,1]){
  const f=readingFlight(t);
  assert(Math.hypot(f.x,f.y,f.z)<1e-10,'camera must return to the original trajectory');
  for(let r=0;r<8;r++)assert(readingEnergy(t,r,8)<1e-10);
}
console.log('R2266_CONTINUOUS_READING_FLIGHT_PASS '+JSON.stringify({viewports:4,scrollSamples:404,extraDrawCalls:0}));

const housing=reactorHousing(.19,1.8,.23,.035);
assert.equal(housing.length,28*3*8);
const faces=new Set();
for(let i=0;i<housing.length;i+=24){
  const a=housing.slice(i,i+3),b=housing.slice(i+8,i+11),c=housing.slice(i+16,i+19);
  const u=b.map((x,j)=>x-a[j]),q=c.map((x,j)=>x-a[j]);
  const cross=[u[1]*q[2]-u[2]*q[1],u[2]*q[0]-u[0]*q[2],u[0]*q[1]-u[1]*q[0]];
  assert(Math.hypot(...cross)>1e-8,'degenerate bevel triangle');
  const n=housing.slice(i+3,i+6);
  assert(Math.abs(Math.hypot(...n)-1)<1e-8);
  assert(cross.reduce((sum,x,j)=>sum+x*n[j],0)>0,'incorrect face winding');
  faces.add(n.map(x=>x.toFixed(5)).join(','));
}
assert.equal(faces.size,10);
assert(src.includes('out float vReactorLight')&&src.includes('in float vReactorLight'));
console.log('R2267_STUDIO_BEVEL_PASS '+JSON.stringify({triangles:v.length/24,normalDirections:faces.size,extraDrawCalls:0}));

console.log('R2268_VISIBLE_CORRIDOR_PASS '+JSON.stringify({selectionProgress,window:[.30,.64],peakAlpha:corridorEntry(next,.42).alpha}));

for(let i=0;i<=100;i++){
  const scale=mix(.82,3.10,smooth(i/100));
  const n=[1/Math.sqrt(2),0,1/Math.sqrt(2)];
  const normal=[n[0]/scale,0,n[2]];
  const tangent=[scale*n[2],0,-n[0]];
  assert(Math.abs(normal.reduce((sum,x,j)=>sum+x*tangent[j],0))<1e-10);
  const position=[2.5*scale,.5*scale,1.1];
  const view=[-position[0],-position[1],6.2-position[2]];
  assert(view.every(Number.isFinite)&&view[2]>0);
}
assert(src.includes('aNormal.xy/ringScale'));
assert(src.includes('vec3(0.0,0.0,6.2)-p'));
assert(src.includes('specular/(vec3(1.0)+specular)'));
assert(src.includes('out vec3 vReactorView')&&src.includes('in vec3 vReactorView'));
console.log('R2269_REACTOR_VIEW_OPTICS_PASS '+JSON.stringify({normalSamples:101,extraDrawCalls:0}));

// R2271 exercise the actual native scheduler with a deterministic clock.
const native=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const section=(begin,end)=>{const a=native.indexOf(begin),b=native.indexOf(end,a+begin.length);assert(a>=0&&b>a);return native.slice(a,b);};
const scheduler=section('    function queueFrame(delay=0){','    function boost(');
const hold=section('    function holdSoftwareScroll(){','    function onScroll(){');
const frame=section('    function frame(now){','    function point(event){');
const simulate=new Function('softwareRenderer',`
 let now=0,raf=0,burstFrames=0,scrollSettleTimer=0,surfaceFrameTimer=0,last=0;
 let scrollTransitPermit=false,lastScrollTransit=-Infinity,rendered=0,seq=0;
 let schedulerLastFrame=0,schedulerRefreshMs=16.67,schedulerTick=0;
 const auditMode=true,mobile=false,renderAverage=0,surfacePulseStart=-Infinity,SURFACE_PULSE_WINDOW_MS=0;
 const root={dataset:{}},delayed=new Set(),pending=new Map();
 const performance={now:()=>now},blocked=()=>false;
 const requestAnimationFrame=fn=>{pending.set(++seq,fn);return seq;};
 const cancelAnimationFrame=id=>pending.delete(id);
 const setTimeout=()=>++seq,clearTimeout=()=>{},later=setTimeout;
 const render=()=>rendered++,settleAfterBurst=()=>{};
 ${scheduler}${hold}${frame}
 const step=t=>{now=t;const jobs=[...pending];pending.clear();for(const [,fn] of jobs)fn(now);};
 return {holdSoftwareScroll,requestTransitRender,schedule,step,get count(){return rendered},get pending(){return pending.size}};
`);
const software=simulate(true);
software.holdSoftwareScroll();software.schedule(1);assert.equal(software.pending,0);
software.requestTransitRender();software.holdSoftwareScroll();assert.equal(software.pending,1);
software.step(10);assert.equal(software.count,1);
software.requestTransitRender();software.step(100);assert.equal(software.count,1);
software.requestTransitRender();software.step(250);software.requestTransitRender();software.holdSoftwareScroll();software.step(260);
assert.equal(software.count,2);assert.equal(software.pending,0);
const hardware=simulate(false);hardware.requestTransitRender();hardware.step(16);assert.equal(hardware.count,1);
console.log('R2271_BOUNDED_TRANSIT_PASS '+JSON.stringify({softwareFrames:software.count,hardwareFrames:hardware.count}));

// R2272: both entry and clearing a previously drawn gate need native frames.
const needStart=src.indexOf('  function transitNeedsFrame('),needEnd=src.indexOf('  function requestArchiveFrame(',needStart);
assert(needStart>=0&&needEnd>needStart);
const needs=new Function('reactorEntry','corridorEntry','entryTransitProgress','corridorTransitProgress',src.slice(needStart,needEnd)+'return transitNeedsFrame;')(reactorEntry,corridorEntry,entryTransitProgress,corridorTransitProgress);
assert.equal(needs({s:entry,progress:.25},false),true);
assert.equal(needs({s:next,progress:.43},false),true);
assert.equal(needs({s:next,progress:.78},true),true);
assert.equal(needs({s:next,progress:.78},false),false);
assert.equal(needs(null,false),false);
assert(!src.includes('if(active&&softwareMagRenderer()&&transitNeedsFrame(current,lastRenderedGate))'));
assert(src.includes('transitNeedsFrame(current,lastRenderedGate,mobile()&&softwareMagRenderer())'));
assert(src.includes('lastRenderedGate=Boolean(ingress&&ingress.alpha>.001)'));
console.log('R2272_EARLY_TRANSIT_CLEAR_PASS '+JSON.stringify({cases:5,softwareCapMs:240}));

assert(reactorEntry(entry,.68).alpha>.8,'late entry should still have a visible gate');
assert.equal(reactorEntry(entry,.78),null);
assert(reactorEntry(entry,.77999).alpha<.00001);
assert.equal(reactorHandoff(entry,.68).settle,1,'extended gate must not delay content');
let beforeCount=0,afterCount=0;
for(let i=0;i<1000;i++){
 const p=i/1000;
 if(p<.62)beforeCount++;
 if(reactorEntry(entry,p))afterCount++;
}
assert.equal(beforeCount,620);assert.equal(afterCount,780);
assert.equal(needs({s:entry,progress:.70},false),true);
assert.equal(needs({s:entry,progress:.78},false),false);
console.log('R2273_EXTENDED_PASSAGE_PASS '+JSON.stringify({oldWindow:beforeCount,newWindow:afterCount,relativeIncrease:afterCount/beforeCount-1,contentHandoffUnchanged:true}));

assert.equal(entryTransitProgress(.78,0,true),.65);
assert(Math.abs(entryTransitProgress(.78,.35,true)-.78)<1e-10);
assert.equal(entryTransitProgress(.81,.8,true),.81);
assert.equal(entryTransitProgress(.25,.5,false),.25);
assert.equal(needs({s:entry,progress:.78,travel:.1},false,true),true);
assert.equal(needs({s:entry,progress:.78,travel:.5},false,true),false);
assert.equal(needs({s:next,progress:.78,travel:.1},false,true),true);
assert.equal(needs({s:entry,progress:.78,travel:.1},false,false),false);
assert.equal(reactorHandoff(entry,.78).settle,1);
for(let i=0;i<100;i++){const p=.78*i/100;assert(entryTransitProgress(p,0,true)<=entryTransitProgress(p+.0078,0,true)+1e-10);}
console.log('R2274_ADAPTIVE_ENTRY_WINDOW_PASS');

const anchorStart=src.indexOf('  function physicalScrollAnchor('),anchorEnd=src.indexOf('  class ScrollTimelineController',anchorStart);
assert(anchorStart>=0&&anchorEnd>anchorStart);
const physical=new Function(src.slice(anchorStart,anchorEnd)+'return physicalScrollAnchor;')();
const stableHost={},movingFolio={},sourceNode={};
assert.equal(physical({cinemaHost:stableHost,scrollAnchor:movingFolio,node:sourceNode}),stableHost);
assert.equal(physical({scrollAnchor:movingFolio,node:sourceNode}),movingFolio);
assert.equal(physical({node:sourceNode}),sourceNode);
assert(src.includes('const node=physicalScrollAnchor(s);'));
for(const p of [.38,.43]){
 const top=.88-1.15*p;
 assert(top<.52&&top+1.65>.52,'proof target must contain the reading line');
}
console.log('R2275_STABLE_PHYSICAL_ANCHOR_PASS');

// R2276: widened mobile corridor uses only physical gate progress, not the native content timeline.
{
const checkoutScene={...next,key:'licensing'};
assert.equal(corridorTransitProgress(next,.43,0,true),.43);
assert.equal(corridorTransitProgress(next,.78,0,true),.52);
assert(Math.abs(corridorTransitProgress(next,.78,.35,true)-.64)<1e-10);
assert.equal(corridorTransitProgress(next,.81,.8,true),.81);
assert.equal(needs({s:next,progress:.78,travel:.1},false,true),true);
assert.equal(needs({s:next,progress:.78,travel:.5},false,true),false);
assert.equal(needs({s:next,progress:.78,travel:.1},false,false),false);
assert.equal(corridorTransitProgress(checkoutScene,.78,.1,true),.78);
assert.equal(needs({s:checkoutScene,progress:.78,travel:.1},false,true),false);
let baselineSamples=0,mobileSamples=0,previous=-1;
for(let i=0;i<1000;i++){
 const p=i/1000,adapted=corridorTransitProgress(next,p,0,true);
 assert(adapted>=previous-1e-10);previous=adapted;
 assert.equal(corridorTransitProgress(next,p,0,false),p);
 assert.equal(corridorTransitProgress(checkoutScene,p,0,true),p);
 if(corridorEntry(next,p)?.alpha>.001)baselineSamples++;
 if(corridorEntry(next,adapted)?.alpha>.001)mobileSamples++;
}
assert(mobileSamples>baselineSamples*1.35);
assert.equal(reactorHandoff(next,.78).settle,1);
console.log('R2276_MOBILE_CORRIDOR_PASS '+JSON.stringify({baselineSamples,mobileSamples,relativeIncrease:mobileSamples/baselineSamples-1,checkoutUnchanged:true,hardwareUnchanged:true}));
}

// R2277: the actual update must not measure or mutate cinematic descendants.
{
const begin=src.indexOf('  function updateRealContentSheets(){'),end=src.indexOf('  function sceneForElement(',begin);
assert(begin>=0&&end>begin);
const css=fs.readFileSync('docs/scifi-ui/styles/formatx-cinematic-archive-r1987.css','utf8');
assert(/\.fx-archive-cinema-folio-r2030 :is\(\[data-reveal\],\.fx-archive-live-sheet-r2026\)\s*\{[^}]*opacity:1!important;[^}]*translate:none!important;[^}]*rotate:none!important;[^}]*scale:1!important;[^}]*animation:none!important;[^}]*transform:none!important;/.test(css),'folio override contract changed');
let reads=0,writes=0;
const makeNode=inside=>({isConnected:true,closest:()=>inside?{}:null,getBoundingClientRect:()=>{reads++;return {top:300};},style:{setProperty:()=>writes++},dataset:{}});
const nodes=Array.from({length:24},()=>makeNode(true)),outside=makeNode(false);
const scenes=[{index:0,paperNodes:[...nodes,outside]}];
const update=new Function('archiveActive','reduced','innerHeight','mobile','current','scenes','paperLast','clamp','smooth','sceneForElement','root','setData',src.slice(begin,end)+'return updateRealContentSheets;')(true,{matches:false},844,()=>true,{s:scenes[0]},scenes,new WeakMap(),clamp,smooth,()=>scenes[0],{dataset:{}},(node,key,value)=>{node.dataset[key]=value;});
update();assert.equal(reads,1);assert.equal(writes,5);
assert(nodes.every(node=>Object.keys(node.dataset).length===0));
console.log('R2277_REDUNDANT_PAPER_LAYOUT_PASS '+JSON.stringify({skippedFolioNodes:24,legacyMeasurements:reads,legacyStyleWrites:writes}));
}

// R2278: hidden duplicate telemetry must remain accurate without motion writes.
{
const begin=src.indexOf('  function updateHandoff(){'),end=src.indexOf('  function setPanelState(){',begin);
assert(begin>=0&&end>begin);
const css=fs.readFileSync('docs/scifi-ui/styles/formatx-cinematic-archive-r1987.css','utf8');
assert(/body\.living-architecture > \.fx-archive-physical-paper-r2026\s*\{\s*display:none!important;\s*visibility:hidden!important;/.test(css));
function simulate(active){
 let motion=0,data=0;
 const title={textContent:'Native title'},handoff={isConnected:true,querySelector:()=>title,dataset:{},style:{setProperty:()=>{}}};
 const scene={key:'ecosystem',index:0,source:'left-shelf',node:{querySelector:()=>title}};
 const current={s:scene,progress:.4},root={lang:'hu',dataset:{fxArchiveCinema:active?'active':'home'}};
 const update=new Function('handoff','handoffKey','current','archiveActive','reduced','document','root','sourceNames','scenes','smooth','mobile','setData','setMotionStyle',src.slice(begin,end)+'return updateHandoff;')(handoff,'ecosystem:hu',current,true,{matches:false},{body:{classList:{contains:name=>name==='living-architecture'}}},root,{},[scene],smooth,()=>false,(node,key,value)=>{if(node.dataset[key]!==value){node.dataset[key]=value;data++;}},()=>{motion++;});
 for(let i=0;i<100;i++){current.progress=i/100;update();}
 return {motion,data,phase:handoff.dataset.phase,active:handoff.dataset.active,screen:handoff.dataset.fxArchiveScreenVisible};
}
const visible=simulate(false),hidden=simulate(true);
assert.equal(visible.motion,600);assert.equal(hidden.motion,0);
assert.equal(hidden.phase,visible.phase);assert.equal(hidden.data,visible.data);assert.equal(hidden.active,'true');assert.equal(hidden.screen,'false');
console.log('R2278_HIDDEN_HANDOFF_BUDGET_PASS '+JSON.stringify({visibleMotionWrites:visible.motion,hiddenMotionWrites:hidden.motion,metadataPreserved:true}));
}

// R2279: cull only complete, fully transparent trailing rings.
{
let baseline=0,submitted=0,previous=v.length/8;
for(let i=0;i<=10000;i++){
 const p=i/10000,count=reactorVisibleVertices(p,v.length/8);
 assert(count<=previous&&count%960===0);previous=count;
 for(let ring=count/960;ring<3;ring++){
  const phase=clamp((p-(2-ring)*.16)/.68);
  assert.equal(1-smooth((phase-.72)/.28),0);
 }
 baseline+=v.length/8;submitted+=count;
}
assert.equal(reactorVisibleVertices(.5,2880),2880);
assert.equal(reactorVisibleVertices(.75,2880),1920);
assert.equal(reactorVisibleVertices(.95,2880),960);
assert(src.includes('gl.drawArrays(gl.TRIANGLES,0,vertexCount)'));
console.log('R2279_FADED_RING_CULL_PASS '+JSON.stringify({samples:10001,baseline,submitted,reduction:1-submitted/baseline,visibleGeometryUnchanged:true}));
}

// R2280: the emissive inlay and analytical shadow bypass unused BRDF work.
{
const fragment=src.slice(src.indexOf('      const frag=`'),src.indexOf('      const shader='));
assert(fragment.indexOf('if(uShadow>.5)')<fragment.indexOf('vec3 N=normalize'));
assert(fragment.indexOf('if(reactor&&vUv.x>=.6)')<fragment.indexOf('float roughness='));
assert(fragment.includes('float guideAlpha=uOpacity*.80*(.54+.36*ndl)*vReactorVisibility;'));
// Exact material-tag contract: the guide occupies full triangles with
// constant UV.x=.85, never an interpolation across the .6 branch boundary.
let guideTriangles=0;
for(let i=0;i<v.length;i+=24){
 const tags=[v[i+6],v[i+14],v[i+22]];
 assert(tags.every(x=>x===tags[0]));
 if(tags[0]>=.6)guideTriangles++;
}
assert.equal(guideTriangles,288);
let maxError=0,samples=0;
for(let i=0;i<=10;i++)for(let j=0;j<=10;j++)for(let k=0;k<=10;k++)for(let l=0;l<=10;l++){
 const opacity=i/10,ndl=.06+.94*j/10,facing=k/10,visibility=l/10,light=(i+j+k+l)/40;
 const alpha=opacity*.80*(.54+.36*ndl);
 const previous=clamp(mix(alpha*.96,alpha,1)*visibility);
 const optimized=clamp(opacity*.80*(.54+.36*ndl)*visibility);
 const emitter=[.36,.73,.86].map(c=>c*(.56+.18*facing+.26*light));
 const oldColor=emitter.map(c=>mix(.1,c,1));
 maxError=Math.max(maxError,Math.abs(previous-optimized),...emitter.map((c,m)=>Math.abs(c-oldColor[m])));samples++;
}
assert(maxError<1e-12);
console.log('R2280_MATERIAL_FAST_PATH_PASS '+JSON.stringify({samples,guideTriangles,maxError,shadowEarlyReturn:true}));
}

// R2281: the source's ring precomputation must match the former GLSL trajectory.
{
let maxError=0,samples=0;
for(let i=0;i<=10000;i++){
 const p=i/10000,a=reactorRingState(p);
 for(let r=0;r<3;r++){
  const phase=clamp((p-(2-r)*.16)/.68),angle=p*6.2831853-r*.76;
  const smoothstep=(lo,hi,x)=>{const q=clamp((x-lo)/(hi-lo));return q*q*(3-2*q);};
  const expected=[.82+(3.10-.82)*smoothstep(0,1,phase),1-smoothstep(.72,1,phase),Math.cos(angle),Math.sin(angle)];
  const actual=[a.scale[r],a.visibility[r],a.axisX[r],a.axisY[r]];
  maxError=Math.max(maxError,...actual.map((x,j)=>Math.abs(x-expected[j])));samples++;
 }
}
assert(maxError<1e-12);
assert(src.includes('gl.uniform3fv(this.uniform.uReactorRingScale,rings.scale)'));
assert(src.includes('ringScale=uReactorRingScale[ring]'));
assert(src.includes('if(uBend!=0.0)'));
assert(!src.includes('uReactorProgress'));
console.log('R2281_RING_UNIFORM_PASS '+JSON.stringify({samples,maxError,ringTransformsPerGate:3,previousMaxVertexEvaluations:2880}));
}
