/* FormatX r456 — mobile native WebGL solid-glass surface correction.
   The r326 geometry stays fully 3D. Only the phone shader lighting contract is
   adjusted before compilation: per-triangle flat lighting is blended into a
   continuous volumetric normal and barycentric triangle-edge paint is removed.
   Desktop rendering is deliberately untouched. */
(function(){
'use strict';
const root=document.documentElement;
const VERSION='r456-solid-volume-smooth-normal-no-triangle-edges';
if(root.dataset.fxCoreMobileSurfaceR456)return;

const mobile=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
if(!mobile){
  root.dataset.fxCoreMobileSurfaceR456='desktop-bypass';
  return;
}

const vertexNeedle='vec3 normal=normalize(mix(aCrystalNormal,aSphereNormal,morph));';
const vertexReplacement=`vec3 crystalSmoothNormal=normalize(vec3(aCrystal.x*1.04,aCrystal.y*.86,aCrystal.z*1.22));
        vec3 crystalLitNormal=normalize(mix(aCrystalNormal,crystalSmoothNormal,.97));
        vec3 normal=normalize(mix(crystalLitNormal,aSphereNormal,morph));`;
const edgePattern=/float edge=1\.0-smoothstep\([^;]+;\s*edge\*=pow\(1\.0-vMorph,1\.7\)\*\([^;]+;/;
const specularA='float specular=pow(max(dot(n,normalize(key+view)),0.),42.0);';
const specularB='specular+=.72*pow(max(dot(n,normalize(side+view)),0.),24.0);';

let vertexPatched=false;
let fragmentPatched=false;
let restored=false;
const restorers=[];
const prototypes=[];
for(const ctor of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){
  const proto=ctor?.prototype;
  if(!proto||prototypes.includes(proto)||typeof proto.shaderSource!=='function')continue;
  prototypes.push(proto);
}

function markReady(){
  if(vertexPatched&&fragmentPatched){
    root.dataset.fxCoreMobileSurfaceR456=VERSION;
    root.dataset.fxCoreMobileNormalR456='continuous-volume-97-percent-smooth';
    root.dataset.fxCoreMobileTriangleEdgesR456='disabled';
    root.dataset.fxCoreMobileSpecularR456='soft-physical-phone-highlight';
  }
}

function patchSource(source){
  if(typeof source!=='string')return source;
  let next=source;

  if(next.includes(vertexNeedle)
    && next.includes('aCrystalNormal')
    && next.includes('aSphereNormal')
    && next.includes('vBary')){
    next=next.replace(vertexNeedle,vertexReplacement);
    if(next!==source)vertexPatched=true;
  }

  if(next.includes('float facetPulse=')
    && next.includes('vBary')
    && next.includes('uSurfacePulse')){
    const before=next;
    next=next.replace(edgePattern,'float edge=0.0;');
    next=next.replace(specularA,'float specular=pow(max(dot(n,normalize(key+view)),0.),28.0);');
    next=next.replace(specularB,'specular+=.58*pow(max(dot(n,normalize(side+view)),0.),18.0);');
    if(next!==before)fragmentPatched=true;
  }

  markReady();
  return next;
}

function restore(){
  if(restored)return;
  restored=true;
  for(const restore of restorers)restore();
  root.dataset.fxCoreMobileShaderHookR456='released-after-r326-compile';
}

for(const proto of prototypes){
  const hadOwn=Object.prototype.hasOwnProperty.call(proto,'shaderSource');
  const original=proto.shaderSource;
  const wrapped=function(shader,source){
    const patched=patchSource(source);
    const result=original.call(this,shader,patched);
    if(vertexPatched&&fragmentPatched)queueMicrotask(restore);
    return result;
  };
  try{
    proto.shaderSource=wrapped;
    restorers.push(()=>{
      try{
        if(hadOwn)proto.shaderSource=original;
        else delete proto.shaderSource;
      }catch(_){proto.shaderSource=original;}
    });
  }catch(_){
    root.dataset.fxCoreMobileShaderHookR456='prototype-write-failed';
  }
}

root.dataset.fxCoreMobileSurfaceR456='armed-before-r326-compile';
root.dataset.fxCoreMobileShaderHookR456=restorers.length?'armed':'unavailable';
addEventListener('formatx:real3dready',()=>setTimeout(restore,0),{once:true,passive:true});
setTimeout(restore,6000);
}());
