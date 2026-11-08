'use strict';
/* R2352: execute the REAL 3D organic transformation and verify that the
   translucent cell becomes the MAG's recessed physical cortex by the
   9.25-second shot, without losing the actual 5.50-second embryo. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const start=source.indexOf('    updateOrganic(t,time){');
const end=source.indexOf('\n    updateCells(t,time){',start);
assert(start>0&&end>start,'The actual 3D organic updater must exist');
const script=source.slice(start,end);
assert(script.trimEnd().endsWith('}'),'The original Three.js updater must end normally');
const body=script.slice(script.indexOf('{')+1,script.lastIndexOf('}'));
const fn=new Function('t','time','smooth','mix',body);
const smooth=v=>{const n=Math.max(0,Math.min(1,v));return n*n*(3-2*n);};
const mix=(a,b,t)=>a+(b-a)*t;
const color=()=>({copy(){return this;},lerp(){return this;}});
function subject(){
 const scale={x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}};
 const group={visible:false,scale,position:{z:0}};
 const material=()=>({color:color(),opacity:0,roughness:0,clearcoat:0,clearcoatRoughness:0});
 return {
  mobileRender:false,organicGroup:group,
  organicShellMaterial:material(),organicShellSourceColor:color(),organicShellBornColor:color(),
  organicLobeMaterial:material(),organicLobeSourceColor:color(),organicLobeBornColor:color(),
  organicWireMaterial:material(),organicVeinMaterial:material(),organicHoodMaterial:material(),
  organicShell:{rotation:{}},organicLobes:[],organicVeins:[],
  organicPrimaryVeins:[],organicFoldMaterial:null,organicFoldGlowMaterial:null,
  organicFiberMaterial:null,organicHoodGroup:null,organicFibers:null,organicFolds:null,
  organicPrimaryVeinMaterial:null
 };
}
function shot(t){
 const s=subject();fn.call(s,t,9250,smooth,mix);
 return {scale:s.organicGroup.scale.x/1.02,
   visible:s.organicGroup.visible,
   depth:s.organicGroup.position.z,
   opacity:s.organicShellMaterial.opacity,
   lobeOpacity:s.organicLobeMaterial.opacity};
}
const embryo=shot(5.50),seating=shot(7.50),finale=shot(9.25),handoff=shot(9.90);
assert(Math.abs(embryo.scale-.631)<1e-8,
 '5.50s original 3D cell scale must remain exactly preserved');
assert(Math.abs(embryo.opacity-.18)<1e-8,
 '5.50s original cell shell opacity must remain preserved');
assert(Math.abs(finale.scale-(.001+.63*.56))<1e-8);
assert(Math.abs(finale.depth-(-.62))<1e-8);
assert(Math.abs(finale.opacity-.58)<1e-8);
assert(Math.abs(finale.lobeOpacity-.19)<1e-8);
assert(finale.scale<.36 && finale.scale>.3 && finale.visible,
 'The final real cell must be compact and still physically alive in the lens');
assert(handoff.visible && Math.abs(handoff.scale-finale.scale)<1e-8,
 'There must be no late optical geometry jump');
let previous=shot(7.0),worstStep=0;
for(let i=1;i<=300;i++){
 const current=shot(7+i*.01);
 worstStep=Math.max(worstStep,Math.abs(current.scale-previous.scale));
 assert(Number.isFinite(current.scale)&&current.scale>=0,'All scale frames must be finite');
 previous=current;
}
assert(worstStep<.019,'Film must contract continuously without late hard scale jumps');
for(const token of [
 'this.organicGroup.position.z=-.62*handoffCortex;',
 'this.organicShellMaterial.opacity=mix(.18*visible,.58*grow,handoffCortex);',
 'this.organicLobeMaterial.opacity=mix(.15*visible,.19*grow,handoffCortex);',
 'this.organicShell.rotation.y=time*.000024;',
 'this.organicFibers.rotation.y=Math.sin(time*.00013)*.010;'
])assert(script.includes(token),'Original full-detail physical 3D cortex lost: '+token);
assert(source.includes('this.updateCore(t,time);')&&
 source.includes('this.updateOrganic(t,time);')&&
 source.includes('this.updateMechanical(t,time);'),
 'Three.js Genesis and MAG ownership must remain');
console.log('GENESIS_R2352_REAL_ORGANIC_IRIS_CONVERGENCE_PASS',
 JSON.stringify({embryo,seating,finale,handoff,worstStep,
  original3D:true,realBrowserVisualAcceptanceStillRequired:true}));
