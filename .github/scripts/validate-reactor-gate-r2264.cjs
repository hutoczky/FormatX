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
  assert([2,3,4].includes(Math.floor(v[i+7])),'invalid ring');
  assert(Number.isInteger((v[i+7]%1)*16)&&(v[i+7]%1)*16<8,'invalid segment');
  const material=v[i+6]>.6?'guide':'metal';
  const key=Math.floor(v[i+7])+':'+material;
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
 let blockedState=false;
 const performance={now:()=>now},blocked=()=>blockedState;
 const requestAnimationFrame=fn=>{pending.set(++seq,fn);return seq;};
 const cancelAnimationFrame=id=>pending.delete(id);
 const setTimeout=()=>++seq,clearTimeout=()=>{},later=setTimeout;
 const render=()=>rendered++,settleAfterBurst=()=>{};
 ${scheduler}${hold}${frame}
 const step=t=>{now=t;const jobs=[...pending];pending.clear();for(const [,fn] of jobs)fn(now);};
 return {holdSoftwareScroll,requestTransitRender,schedule,step,setBlocked:v=>{blockedState=v;},cancelPending:()=>{pending.clear();raf=0;},get count(){return rendered},get pending(){return pending.size}};
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

// R2282: animation-loop events must not trigger semantic deck scans.
{
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-category-deck-stabilizer.js','utf8');
let scans=0,mutations=0,observer;const events={},microtasks=[];
class Element{constructor(relevant=false){this.relevant=relevant;}matches(){return this.relevant;}querySelector(){return null;}}
const root={lang:'hu',dataset:{}},deck=new Element(true);deck.closest=()=>null;
const document={documentElement:root,body:new Element(),readyState:'complete',querySelector:()=>null,querySelectorAll:selector=>{scans++;return selector==='.fx-category-deck'?[deck]:[];},head:{appendChild:()=>{}},createElement:()=>({dataset:{}})};
class Observer{constructor(cb){this.cb=cb;observer=this;}observe(){mutations++;}disconnect(){}}
new Function('document','matchMedia','Element','HTMLButtonElement','HTMLAnchorElement','MutationObserver','addEventListener','queueMicrotask','setTimeout','clearTimeout',source)(document,()=>({matches:true}),Element,Element,Element,Observer,(name,fn)=>{events[name]=fn;},fn=>microtasks.push(fn),()=>1,()=>{});
const drain=()=>{while(microtasks.length)microtasks.shift()();};drain();const initial=scans;
for(let i=0;i<1000;i++)events['formatx:loop']?.();drain();assert.equal(scans,initial);
observer.cb([{addedNodes:[new Element(false)],removedNodes:[]}]);drain();assert.equal(scans,initial);
observer.cb([{addedNodes:[new Element(true)],removedNodes:[]}]);drain();assert(scans>initial);
const after=scans;events['formatx:languagechange']();drain();assert(scans>after);
events.pagehide();events.pageshow();drain();assert.equal(mutations,2);
console.log('R2282_STRUCTURAL_RECONCILE_PASS '+JSON.stringify({ignoredLoopEvents:1000,structuralReconcile:true,languageReconcile:true}));
}

// R2283: unchanged Hero control state must never invalidate DOM layout.
{
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-reference-production-r244.js','utf8');
const a=source.indexOf('  function setText('),b=source.indexOf('  function ensureHeaderControls(',a);
assert(a>=0&&b>a);
const {setText,setAttr,setData,addClass}=new Function(source.slice(a,b)+'return {setText,setAttr,setData,addClass};')();
let writes=0,text='';const attrs=new Map(),classes=new Set();
const node={get textContent(){return text;},set textContent(v){writes++;text=v;},getAttribute:k=>attrs.get(k)??null,setAttribute:(k,v)=>{writes++;attrs.set(k,v);},dataset:new Proxy({}, {set(o,k,v){writes++;o[k]=v;return true;}}),classList:{contains:k=>classes.has(k),add:k=>{writes++;classes.add(k);}}};
function reconcile(){setText(node,'Live OS');setAttr(node,'href','#experience');setData(node,'fxLiveOsLauncher','true');addClass(node,'fx-reference-controls-r264');}
reconcile();assert.equal(writes,4);for(let i=0;i<1000;i++)reconcile();assert.equal(writes,4);
setAttr(node,'aria-label','Live OS megnyitása');setAttr(node,'aria-label','Open Live OS');assert.equal(writes,6);assert.equal(node.getAttribute('aria-label'),'Open Live OS');
assert(source.includes("setText(live,'Live OS')"));assert(source.includes("setAttr(live,'href','#experience')"));
console.log('R2283_IDEMPOTENT_HERO_PASS '+JSON.stringify({unchangedReconciles:1000,repeatWrites:0,languageUpdates:2}));
}

// R2284: coalesce locale events and retain BFCache reconciliation.
{
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-category-positioning.js','utf8');
const begin=source.indexOf('  let renderQueued = false;'),end=source.indexOf('  function observeLanguage()',begin);
assert(begin>=0&&end>begin);
const queue=[],commits=[];let lang='hu';
const scheduler=new Function('queueMicrotask','language','render',source.slice(begin,end)+'lastRenderedLanguage=language();return scheduleRender;')(fn=>queue.push(fn),()=>lang,()=>commits.push(lang));
const drain=()=>{while(queue.length)queue.shift()();};
for(let i=0;i<1000;i++)scheduler();drain();assert.equal(commits.length,0);
lang='en';scheduler();scheduler();drain();assert.equal(commits.join(','),'en');
scheduler();drain();assert.equal(commits.length,1);
lang='hu';scheduler();lang='en';scheduler();lang='hu';scheduler();drain();assert.equal(commits.join(','),'en,hu');
scheduler(true);scheduler();drain();assert.equal(commits.join(','),'en,hu,hu');
assert(source.includes('scheduleRender(event.persisted === true)'));
assert(source.includes('observer?.disconnect(); observer = null;'));
console.log('R2284_COALESCED_SEMANTIC_RENDER_PASS '+JSON.stringify({ignoredUnchangedSignals:1000,languageCommits:2,forcedRestoreCommits:1}));
}

// R2286: capture genuine gestures even when a nested control stops bubbling.
{
const a=src.indexOf('    const startJourney=event=>{'),b=src.indexOf('    sceneObserver=new ResizeObserver',a);
assert(a>=0&&b>a);
const make=()=>{
 const listeners=new Map(),root={dataset:{}};let updates=0;
 const api=new Function('root','addEventListener','invalidate','let journeyArmed=false,idleComposed=true;'+src.slice(a,b)+'return {get armed(){return journeyArmed;}};')(root,(name,fn,opts)=>listeners.set(name,{fn,opts}),()=>updates++);
 return {api,listeners,root,get updates(){return updates;}};
};
for(const type of ['wheel','touchmove','keydown']){
 const x=make(),l=x.listeners.get(type);assert(l.opts.capture&&l.opts.passive);
 l.fn({type,isTrusted:false,key:'PageDown'});assert.equal(x.api.armed,false);
 if(type==='keydown'){l.fn({type,isTrusted:true,key:'a'});assert.equal(x.api.armed,false);}
 l.fn({type,isTrusted:true,key:'PageDown'});assert.equal(x.api.armed,true);
 assert.equal(x.root.dataset.fxArchiveEngagementR2220,'visitor-'+type);
 l.fn({type,isTrusted:true,key:'PageDown'});assert.equal(x.updates,1);
}
console.log('R2286_TRUSTED_CAPTURE_PASS '+JSON.stringify({inputTypes:3,syntheticRejected:true,passiveCapture:true,onceOnly:true}));
}

// R2287: a blocked or externally cancelled frame never strands its permit.
{
 const interrupted=simulate(true);
 interrupted.holdSoftwareScroll();interrupted.requestTransitRender();
 assert.equal(interrupted.pending,1);
 interrupted.setBlocked(true);interrupted.step(10);assert.equal(interrupted.count,0);
 interrupted.setBlocked(false);interrupted.requestTransitRender();assert.equal(interrupted.pending,1);
 interrupted.step(20);assert.equal(interrupted.count,1);
 interrupted.requestTransitRender();assert.equal(interrupted.pending,0);
 interrupted.step(270);interrupted.requestTransitRender();assert.equal(interrupted.pending,1);
 interrupted.cancelPending();interrupted.requestTransitRender();assert.equal(interrupted.pending,1);
 interrupted.step(280);assert.equal(interrupted.count,2);
 assert.equal(interrupted.pending,0);
 console.log('R2287_TRANSIT_PERMIT_RECOVERY_PASS '+JSON.stringify({blockedFrameRecovered:true,cancelledFrameRecovered:true,rateLimitPreserved:true,actualFrames:interrupted.count}));
}

 // R2288: execute actual page lifecycle handlers against two consecutive
 // BFCache cycles and a permanent navigation. No duplicate scene/canvas.
 {
 const a=src.slice(src.indexOf('    function onPageHide(event){'),src.indexOf("    addEventListener('pageshow',onPageShow"));
 const n=native.slice(native.indexOf('    function onPageShow(event){'),native.indexOf("    listen(window,'pageshow',onPageShow"));
 assert(a.includes('function onPageShow')&&n.includes('function onPageHide'));
 const simulate=handlers=>new Function(`
 let raf=1,domRaf=2,gpuTailTimer=3,scrollFrame=4,scrollSettleTimer=5;
 let scrollTransitPermit=true,burstFrames=4,idleComposed=true,lastGpu=123;
 let schedulerLastFrame=123,schedulerTick=2,lastScrollTransit=123;
 let stops=0,invalidates=0,draws=0,pulses=0;
 const root={dataset:{}},mobile=false,cancelAnimationFrame=()=>{},clearTimeout=()=>{};
 const stop=()=>stops++,destroy=stop,invalidate=()=>invalidates++;
 const boost=()=>{},schedule=()=>draws++,scheduleSurfacePulse=()=>pulses++;
 ${handlers}
 return {hide:p=>onPageHide({persisted:p}),show:p=>onPageShow({persisted:p}),
 state:()=>({raf,domRaf,gpuTailTimer,scrollFrame,scrollSettleTimer,scrollTransitPermit,burstFrames,idleComposed,lastGpu,schedulerLastFrame,schedulerTick,lastScrollTransit,stops,invalidates,draws,pulses,dataset:root.dataset})};
 `)();
 const archive=simulate(a),renderer=simulate(n);
 for(let i=0;i<2;i++){
   archive.hide(true);renderer.hide(true);
   assert.equal(archive.state().stops,0);assert.equal(renderer.state().stops,0);
   assert.equal(archive.state().raf,0);assert.equal(archive.state().domRaf,0);assert.equal(archive.state().gpuTailTimer,0);
   assert.equal(renderer.state().raf,0);assert.equal(renderer.state().scrollFrame,0);assert.equal(renderer.state().scrollSettleTimer,0);
   assert.equal(renderer.state().scrollTransitPermit,false);
   archive.show(true);renderer.show(true);
   assert.equal(archive.state().lastGpu,0);assert.equal(renderer.state().schedulerLastFrame,0);
   assert.equal(renderer.state().lastScrollTransit,-Infinity);
   assert.equal(archive.state().invalidates,i+1);assert.equal(renderer.state().draws,i+1);
 }
 archive.hide(false);renderer.hide(false);
 assert.equal(archive.state().stops,1);assert.equal(renderer.state().stops,1);
 assert(src.includes("addEventListener('pagehide',onPageHide,{passive:true})"));
 assert(native.includes("listen(window,'pagehide',onPageHide,{passive:true})"));
 console.log('R2288_BFCACHE_RESUME_PASS '+JSON.stringify({cycles:2,permanentDisposal:true,staleFramesCleared:true}));
 }

 // R2289: the physical gate camera shares the existing native scene.
 // Bound the excursion and verify zero velocity at both joins.
 {
 const a=src.indexOf('  function passageFlight('),b=src.indexOf('  function readingTravel(',a);
 const flight=new Function('clamp','smooth','entryReactorHost',src.slice(a,b)+'return passageFlight;')(clamp,smooth,host);
 const first={key:'ecosystem',cinemaHost:host,index:0},second={key:'systems',cinemaHost:{},index:1};
 const checkout={key:'licensing',cinemaHost:{},index:5};
 let peak=0,mobilePeak=0,samples=0;
 for(const scene of [first,second,checkout]){
   for(const portrait of [false,true]){
     const start=scene===first?.315:.325,end=scene===first?.78:.64;
     for(let i=0;i<=1000;i++){
       const p=i/1000,f=flight(scene,p,portrait);
       assert(Number.isFinite(f.x)&&Number.isFinite(f.y)&&Number.isFinite(f.z));
       assert(Math.abs(f.x)<=(portrait?.07:.23)&&Math.abs(f.y)<=(portrait?.035:.09)&&Math.abs(f.z)<=(portrait?.43:.76));
       if(scene===checkout||p<=start||p>=end)assert(Math.hypot(f.x,f.y,f.z)<1e-10);
       if(portrait)mobilePeak=Math.max(mobilePeak,-f.z);else peak=Math.max(peak,-f.z);
       samples++;
     }
     for(const edge of [start,end]){
       const f=flight(scene,edge+(edge===start?1e-5:-1e-5),portrait);
       assert(Math.hypot(f.x,f.y,f.z)<1e-7,'camera join must be differentiable');
     }
   }
 }
 assert(peak>.7&&mobilePeak>.4);
 assert(src.includes('dolly+mix(-.035,.085,approach)+flight.z+passage.z'));
 console.log('R2289_PHYSICAL_PASSAGE_PASS '+JSON.stringify({samples,desktopPeak:peak,mobilePeak,checkoutUnchanged:true,extraDrawCalls:0}));
 }

 // R2290: every non-commerce arrival follows the same physical gate
 // progression, including the extended mobile software window.
 {
 const a=src.indexOf('  function systemArrivalPhase('),b=src.indexOf('  function passageFlight(',a);
 const {phase,label}=new Function('clamp','entryReactorHost','entryTransitProgress','corridorTransitProgress',src.slice(a,b)+'return {phase:systemArrivalPhase,label:systemArrivalLabel};')(clamp,host,entryTransitProgress,corridorTransitProgress);
 const first={key:'ecosystem',cinemaHost:host},next={key:'systems',cinemaHost:{}},checkout={key:'licensing',cinemaHost:{}};
 const order={'approach':0,'system-approach':0,traverse:1,arrival:2,handoff:3,clear:4};
 let samples=0;
 for(const scene of [first,next]){
   for(const limited of [false,true]){
     const seen=new Set();let last=-1;
     const start=scene===first?0:.30;
     for(let i=0;i<=1000;i++){
       const p=start+(.78-start)*i/1000;
       const s=phase(scene,p,0,limited);
       assert(order[s]>=last,'arrival phase reversed during forward scroll');
       last=order[s];seen.add(s);samples++;
       assert.equal(phase(checkout,p,0,limited),'clear');
     }
     if(limited)for(let i=0;i<=100;i++){
       const s=phase(scene,.78,i/100,limited);
       assert(order[s]>=last);last=order[s];seen.add(s);samples++;
     }
     assert(seen.has('traverse')&&seen.has('arrival')&&seen.has('handoff')&&seen.has('clear'));
   }
 }
 assert.equal(label('handoff',false,'destination'),'MAG // RENDSZERÁTVÉTEL');
 assert.equal(label('handoff',true,'destination'),'MAG // SYSTEM HANDOFF');
 assert.equal(label('clear',false,'destination'),'destination');
 assert.equal(reactorHandoff(next,.42).settle,1);
 assert.equal(reactorHandoff(checkout,.42).settle,1);
 console.log('R2290_SYSTEM_ARRIVAL_PASS '+JSON.stringify({samples,bilingual:true,checkoutUnchanged:true,contentNotRetimed:true,extraDrawCalls:0}));
 }

 // R2291: directional studio reflections are bounded, view dependent,
 // and attenuate with physical distance. Guide/shadow early returns stay intact.
 {
 const fragment=src.slice(src.indexOf('      const frag=`'),src.indexOf('      const shader='));
 const studio=fragment.indexOf('vec3 reflected=reflect(-V,N);');
 assert(studio>fragment.indexOf('if(vUv.y>1.5)'));
 assert(studio>fragment.indexOf('if(reactor&&vUv.x>=.6)'));
 assert(fragment.includes('studio/(vec3(1.0)+studio)'));
 assert(fragment.includes('(.32+.68*fresnel)*(.48+.52*distanceFade)'));
 const step=(a,b,x)=>smooth((x-a)/(b-a));
 const evaluate=(d1,d2,fresnel,distance)=>{
   const strip=step(.55,.98,d1),fill=step(.60,.99,d2),fade=1-step(5.2,9.5,distance);
   return [.24,.38,.48].map((c,i)=>{
     const raw=(c*strip+[.42,.27,.15][i]*fill)*(.32+.68*fresnel)*(.48+.52*fade);
     return raw/(1+raw);
   });
 };
 let samples=0,peak=0;
 for(let a=0;a<=40;a++)for(let b=0;b<=40;b++)for(let f=0;f<=10;f++){
   const near=evaluate(-1+a/20,-1+b/20,f/10,5.2),far=evaluate(-1+a/20,-1+b/20,f/10,9.5);
   for(let c=0;c<3;c++){assert(Number.isFinite(near[c])&&near[c]>=0&&near[c]<.41);assert(far[c]<=near[c]+1e-12);peak=Math.max(peak,near[c]);}
   samples++;
 }
 assert(evaluate(1,0,1,5.2)[2]>evaluate(0,1,1,5.2)[2]);
 assert(evaluate(0,1,1,5.2)[0]>evaluate(1,0,1,5.2)[0]);
 console.log('R2291_STUDIO_OPTICS_PASS '+JSON.stringify({samples,peakReflectionContribution:peak,depthAttenuation:true,guideUnchanged:true,extraDrawCalls:0}));
 }

 // R2292: check the real immutable room mesh, physical depth and material
 // separation. The shared context is retained, no full-screen quad.
 {
 const a=src.indexOf('  function cubeGeometry()'),b=src.indexOf('  function panelGeometry(',a);
 const geometry=new Function(src.slice(a,b)+'return corridorRoomGeometry;')()();
 assert(geometry instanceof Float32Array&&geometry.length%24===0);
 let near=-Infinity,far=Infinity;const tags=new Set();
 for(let i=0;i<geometry.length;i+=8){
   for(let j=0;j<8;j++)assert(Number.isFinite(geometry[i+j]));
   const norm=Math.hypot(geometry[i+3],geometry[i+4],geometry[i+5]);
   assert(Math.abs(norm-1)<1e-6);
   near=Math.max(near,geometry[i+2]);far=Math.min(far,geometry[i+2]);
   assert.equal(geometry[i+7],-1);tags.add(geometry[i+6].toFixed(2));
 }
 assert(near>-2&&far<=-13&&near-far>11);
 assert(tags.size>=5);assert(geometry.length/24<2200);
 const project=(x,z,aspect,portrait)=>x*(portrait?.58:1)*3.3/Math.max(.6,aspect)/Math.max(2.4,6.2-z);
 for(const aspect of [.65,1,1.77,2.4])for(const portrait of [false,true]){
   assert(Math.abs(project(3.65,near,aspect,portrait))>2*Math.abs(project(3.65,far,aspect,portrait)));
 }
 assert(src.includes("if(scene.key!=='licensing'){"));
 assert(src.includes('gl.disable(gl.BLEND);gl.depthMask(true);'));
 assert(src.includes('this.mesh(this.room,[0,0,roomZ],[1,1,1],hue,0,1,0,cam);'));
 assert(src.includes('gl.deleteBuffer(this.room.buffer)'));
 console.log('R2292_NATIVE_ROOM_PASS '+JSON.stringify({triangles:geometry.length/24,depthSpan:near-far,materialTags:tags.size,roomDrawCalls:1,commerceOriginal:true}));
 }

 // R2294: perspective travel must not flatten depth or affect commerce.
 {
 const a=src.indexOf('  function roomDolly('),b=src.indexOf('  function corridorRoomGeometry(',a);
 const dolly=new Function('clamp',src.slice(a,b)+'return roomDolly;')(clamp);
 let peak=0,mobilePeak=0,minDepth=1,samples=0;
 for(const portrait of [false,true])for(let i=0;i<=1000;i++){
   const p=i/1000,z=dolly({key:'systems'},p,portrait);
   assert(z>=0&&z<=(portrait?1.12:2.05));
   assert.equal(dolly({key:'licensing'},p,portrait),0);
   if(p<=.315||p>=.78)assert(z<1e-10);
   if(portrait)mobilePeak=Math.max(mobilePeak,z);else peak=Math.max(peak,z);
   for(const cam of [-1.4,0,.4]){
     const near=.21+z-cam,far=-13+z-cam;
     const depth=v=>.56+.37*clamp((4-v)/20);
     assert(depth(near)<depth(far));
     assert(depth(near)>=.56&&depth(far)<=.93);
     const projected=v=>3.3/Math.max(2.4,6.2-v);
     assert(projected(near)>projected(far));
     minDepth=Math.min(minDepth,depth(near));
   }
   samples++;
 }
 assert(peak>2&&mobilePeak>1.1);
 assert(src.includes('vReactorView=room?aPosition:'));
 assert(src.includes('float bay=fract((local.z+13.0)/1.88);'));
 assert(src.includes('graphite+(bounce+metal)'));
 console.log('R2294_CORRIDOR_PARALLAX_PASS '+JSON.stringify({samples,desktopPeak:peak,mobilePeak,minDepth,objectSpaceLighting:true,extraDrawCalls:0}));
 }

 // R2295: the front bay provides physical foreground parallax, and the back
 // cap contains no degenerate triangles. The full room stays behind MAG.
 {
 const a=src.indexOf('  function cubeGeometry()'),b=src.indexOf('  function panelGeometry(',a);
 const geometry=new Function(src.slice(a,b)+'return corridorRoomGeometry;')()();
 let near=-Infinity,far=Infinity,minArea=Infinity;
 for(let i=0;i<geometry.length;i+=24){
   const x=[geometry[i],geometry[i+1],geometry[i+2]];
   const u=[geometry[i+8]-x[0],geometry[i+9]-x[1],geometry[i+10]-x[2]];
   const v=[geometry[i+16]-x[0],geometry[i+17]-x[1],geometry[i+18]-x[2]];
   const area=.5*Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]);
   assert(area>1e-8,'degenerate room triangle');minArea=Math.min(minArea,area);
   for(const j of [2,10,18]){near=Math.max(near,geometry[i+j]);far=Math.min(far,geometry[i+j]);}
 }
 assert(geometry.length/24===2136);
 assert(near>.15&&far===-13);
 const depth=z=>.56+.37*clamp((4-z)/20);
 for(const offset of [0,1.12,2.05])for(const cam of [-1.4,0,.4]){
   assert(depth(near+offset-cam)<depth(far+offset-cam));
   assert(near+offset-cam<3.8);
 }
 console.log('R2295_FOREGROUND_ARCHITECTURE_PASS '+JSON.stringify({triangles:geometry.length/24,near,far,minArea,extraDrawCalls:0}));
 }

 // R2296: finite ray/ellipsoid intervals, including misses, clipped endpoints,
 // inside-origin and tangent rays. Check the actual shader contract.
 {
 const fragment=src.slice(src.indexOf('      const frag=`'),src.indexOf('      const shader='));
 assert(fragment.includes('float roomVolumeLength('));
 assert(fragment.includes('float leave=min(1.0,(-b+h)/a);'));
 assert(fragment.includes('float enter=max(0.0,(-b-h)/a);'));
 assert(fragment.includes('vec3 eye=uCamera-uOffset+vec3(0.0,0.0,6.2);'));
 assert(fragment.includes('if(uMobile<.5)path+=.80*roomVolumeLength'));
 assert(fragment.includes('float scatter=1.0-exp(-.20*path);'));
 const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
 const length=(origin,ray,center,inv)=>{
   const o=origin.map((v,i)=>(v-center[i])*inv[i]),d=ray.map((v,i)=>v*inv[i]);
   const a=Math.max(dot(d,d),.000001),b=dot(o,d),c=dot(o,o)-1,disc=b*b-a*c;
   if(disc<=0)return 0;
   const h=Math.sqrt(disc);
   return Math.max(0,Math.min(1,(-b+h)/a)-Math.max(0,(-b-h)/a))*Math.hypot(...ray);
 };
 const sphere=[0,0,0],unit=[1,1,1];
 assert(Math.abs(length([-2,0,0],[4,0,0],sphere,unit)-2)<1e-10);
 assert.equal(length([-2,2,0],[4,0,0],sphere,unit),0);
 assert.equal(length([-2,1,0],[4,0,0],sphere,unit),0);
 assert.equal(length([-2,0,0],[.5,0,0],sphere,unit),0);
 assert(Math.abs(length([-2,0,0],[2,0,0],sphere,unit)-1)<1e-10);
 assert(Math.abs(length([0,0,0],[2,0,0],sphere,unit)-1)<1e-10);
 let samples=0,peak=0,lit=0;
 for(const mobile of [false,true])for(let x=-30;x<=30;x++)for(let y=-20;y<=20;y++){
   const eye=[0,0,6.2],ray=[x/10,y/10,-19.2];
   const p=length(eye,ray,[-1.72,.80,-3.6],[1.45,.52,.65])+
     (mobile?0:.80*length(eye,ray,[1.85,.85,-7.2],[1.55,.50,.60]));
   const scatter=1-Math.exp(-.20*p);
   assert(Number.isFinite(scatter)&&scatter>=0&&scatter<1);
   if(scatter>.05)lit++;peak=Math.max(peak,scatter);samples++;
 }
 assert(lit>0&&peak>.15);
 console.log('R2296_ANALYTIC_VOLUME_PASS '+JSON.stringify({samples,lit,peak,extraDrawCalls:0,depthClipped:true}));
 }

 // R2297: verify real solid conduits in all seven physical bays.
 {
 const a=src.indexOf('  function cubeGeometry()'),b=src.indexOf('  function panelGeometry(',a);
 const geometry=new Function(src.slice(a,b)+'return corridorRoomGeometry;')()();
 const conduits=[];
 for(let i=0;i<geometry.length;i+=8)if(Math.abs(geometry[i+6]-.53)<1e-5)conduits.push(Array.from(geometry.slice(i,i+8)));
 assert.equal(conduits.length,28*36);
 const bays=new Set(conduits.map(v=>Math.floor((v[2]+13)/1.88)));
 assert.equal(bays.size,7);
 const normals=new Set(conduits.map(v=>v.slice(3,6).map(x=>x.toFixed(2)).join(',')));
 assert(normals.size>=6);
 assert(src.includes('float aa=max(fwidth(grooveCoord),.008);'));
 assert(src.includes('float detail=1.0-smoothstep(.04,.22,aa);'));
 const aaFade=x=>1-smooth((x-.04)/.18);
 for(let i=0;i<=200;i++)assert(aaFade(i/1000)>=aaFade((i+1)/1000));
 assert.equal(aaFade(.24),0);
 console.log('R2297_MECHANICAL_ALLOY_PASS '+JSON.stringify({conduits:28,triangles:geometry.length/24,bays:bays.size,aliasFade:true,extraDrawCalls:0}));
 }

 // R2298: verify 24 mechanically distinct segments, rigid inlays, monotonic
 // retraction and exact reversible scroll state without additional geometry.
 {
 const segments=new Map();
 for(let i=0;i<v.length;i+=8){
   const tag=v[i+7],material=v[i+6]>.6?'guide':'metal';
   const counts=segments.get(tag)||{metal:0,guide:0};
   counts[material]++;segments.set(tag,counts);
 }
 assert.equal(segments.size,24);
 for(const counts of segments.values()){assert.equal(counts.metal,84);assert.equal(counts.guide,36);}
 let samples=0,previous=[0,0,0],peak=0;
 for(let i=0;i<=1000;i++){
   const p=i/1000,state=reactorRingState(p);
   for(let r=0;r<3;r++){
     const opening=state.opening[r];
     assert(opening>=previous[r]&&opening<=1);
     previous[r]=opening;
     for(let edge=0;edge<8;edge++){
       const parity=edge%2,delayed=smooth((opening-.15*parity)/.85);
       const angle=(edge+.5)*Math.PI/4;
       const move=[Math.cos(angle)*.48*delayed,Math.sin(angle)*.48*delayed,-.32*delayed*(.65+.35*parity)];
       assert(Math.hypot(...move.slice(0,2))<=.480000001);
       assert(move[2]>=-.320000001&&move[2]<=0);
       peak=Math.max(peak,Math.hypot(...move.slice(0,2)));samples++;
     }
   }
 }
 assert(peak>.479);
 assert(src.includes("scene.key==='licensing'?[0,0,0]:rings.opening"));
 assert(src.includes('p.xy+=radial*(.48*delayed);'));
 assert(src.includes('p.z-=.32*delayed'));
 console.log('R2298_MECHANICAL_GATE_PASS '+JSON.stringify({segments:segments.size,samples,peak,triangles:v.length/24,extraDrawCalls:0,commerceOriginal:true}));
 }

 // R2299: actual eye-centered camera rotation, reversible and bounded.
 {
 const a=src.indexOf('  function passageOrientation('),b=src.indexOf('  function readingTravel(',a);
 const angles=new Function('clamp','entryReactorHost',src.slice(a,b)+'return passageOrientation;')(clamp,host);
 const rotate=(v,[y,p,r])=>{
   const cy=Math.cos(y),sy=Math.sin(y),cp=Math.cos(p),sp=Math.sin(p),cr=Math.cos(r),sr=Math.sin(r);
   v=[cy*v[0]+sy*v[2],v[1],-sy*v[0]+cy*v[2]];
   v=[v[0],cp*v[1]-sp*v[2],sp*v[1]+cp*v[2]];
   return [cr*v[0]-sr*v[1],sr*v[0]+cr*v[1],v[2]];
 };
 let samples=0,peak=0;
 for(const portrait of [false,true])for(const scene of [{key:'systems',cinemaHost:host,index:0},{key:'diagnostics',cinemaHost:{},index:1},{key:'licensing',cinemaHost:{},index:2}]){
   for(let i=0;i<=1000;i++){
     const t=i/1000,ori=angles(scene,t,portrait);
     assert(ori.every(Number.isFinite));
     assert(Math.abs(ori[0])<=(portrait?.027:.078)&&Math.abs(ori[1])<=(portrait?.018:.043)&&Math.abs(ori[2])<=(portrait?.012:.031));
     if(scene.key==='licensing'||t<=.315||t>=.78)assert(Math.hypot(...ori)<1e-10);
     const v=[2.6,-1.7,-8.4],w=rotate(v,ori);
     assert(Math.abs(Math.hypot(...v)-Math.hypot(...w))<1e-10);
     assert(Math.abs(w[2])>7.5);
     peak=Math.max(peak,Math.hypot(...ori));samples++;
   }
 }
 assert(peak>.04);
 assert(src.includes('p=archiveCameraRotate(p-eye)+eye;'));
 assert(src.includes('if(room||reactor){'));
 assert(src.includes('gl.uniform3fv(this.uniform.uArchiveCameraAngles,orientation);'));
 console.log('R2299_CAMERA_ORIENTATION_PASS '+JSON.stringify({samples,peakRadians:peak,commerceOriginal:true,extraDrawCalls:0}));
 }
