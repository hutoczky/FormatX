/* FormatX r458 — native WebGL uniform solid-glass + restrained mobile optics.
   R326 remains the geometry/material owner. This short-lived precompile hook
   removes topology-driven and noise-driven colour breakup from the OUTER glass
   shell while keeping the living/noise structures inside the organism layer.
   On phones it also trims the nucleus/axis flare and Fresnel rim at shader
   source level so the crystal stays luminous without a burned centre or a
   knife-sharp neon silhouette. */
(function(){
'use strict';
const root=document.documentElement;
const VERSION='r456-uniform-solid-glass-no-vram-artifact';
if(root.dataset.fxCoreSurfaceR456)return;

const mobile=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
const smoothWeight=mobile?'.985':'.930';
const specPowerA=mobile?'30.0':'36.0';
const specPowerB=mobile?'20.0':'22.0';
const specGainB=mobile?'.56':'.64';

const vertexNeedle='vec3 normal=normalize(mix(aCrystalNormal,aSphereNormal,morph));';
const vertexReplacement=`vec3 crystalSmoothNormal=normalize(vec3(aCrystal.x*1.04,aCrystal.y*.86,aCrystal.z*1.22));
        vec3 crystalLitNormal=normalize(mix(aCrystalNormal,crystalSmoothNormal,${smoothWeight}));
        vec3 normal=normalize(mix(crystalLitNormal,aSphereNormal,morph));`;

const edgePattern=/float edge=1\.0-smoothstep\([^;]+;\s*edge\*=pow\(1\.0-vMorph,1\.7\)\*\([^;]+;/;
const facetPulse='float facetPulse=.5+.5*sin(vFacet*23.0+uTime*.42+uSiteProgress*5.0);';
const hueFacet='float hue=.5+.5*sin(vFacet*7.0+uSiteProgress*9.0+uTime*.12);';
const electricFacet='float electricFlicker=.78+.22*sin(uTime*46.0+vLocal.y*31.0+vFacet*5.0);';
const specularA='float specular=pow(max(dot(n,normalize(key+view)),0.),42.0);';
const specularB='specular+=.72*pow(max(dot(n,normalize(side+view)),0.),24.0);';
const glassBase='vec3 glass=mix(vec3(.040,.205,.46),vec3(.10,.68,1.08),.28+.38*ndl+.15*facetPulse);';
const glassCloud='glass+=vec3(.025,.22,.50)*(.54+.76*cloud);';
const glassFresnel='glass+=spectral*fresnel*(1.22+.94*visualEnergy);';
const glassVeins='glass+=spectral*veins*(1.24+.48*uBreath);';
const glassMembrane='glass+=spectral*membrane*(.58+.36*visualEnergy);';
const innerNucleus='organ+=ice*nucleus*(3.18+1.18*visualEnergy);';
const innerAxis='organ+=(cyan*1.04+ice*.24)*(axisV*1.10+axisH*.62)*visualEnergy;';
const outerNucleus='glass+=ice*(rings*.30+heart*.12+nucleus*.64);';
const outerAxis='glass+=(cyan*.90+ice*.16)*(axisV*.90+axisH*.48)*visualEnergy;';
const outerAlpha='float alpha=.36+.20*ndl+.32*fresnel+edge*.072+veins*.105+rings*.060+specular*.17+surfaceSweep*.13;';

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
  if(!(vertexPatched&&fragmentPatched))return;
  root.dataset.fxCoreSurfaceR456=VERSION;
  root.dataset.fxCoreMobileSurfaceR456=VERSION;
  root.dataset.fxCoreNormalR456=mobile?'continuous-volume-98.5-percent-smooth':'continuous-volume-93-percent-smooth';
  root.dataset.fxCoreMobileNormalR456=root.dataset.fxCoreNormalR456;
  root.dataset.fxCoreTriangleEdgesR456='disabled';
  root.dataset.fxCoreMobileTriangleEdgesR456='disabled';
  root.dataset.fxCoreOuterNoiseR456='disabled-on-glass-shell';
  root.dataset.fxCoreInnerLifeR456='preserved';
  root.dataset.fxCoreSpecularR456='continuous-controlled-highlight';
  root.dataset.fxCoreMobileOpticalBalanceR458=mobile?'restrained-nucleus-soft-fresnel-rim':'desktop-material-unchanged';
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
    && next.includes('vec3 glass=mix')
    && next.includes('uSurfacePulse')){
    const before=next;

    // Never expose triangle identity as visible material information.
    next=next.replace(facetPulse,'float facetPulse=.5;');
    next=next.replace(edgePattern,'float edge=0.0;');
    next=next.replace(hueFacet,'float hue=.5+.5*sin(vLocal.y*2.10+vLocal.x*1.35+vLocal.z*.85+uSiteProgress*2.0+uTime*.035);');
    next=next.replace(electricFacet,'float electricFlicker=.86+.14*sin(uTime*38.0+vLocal.y*18.0+vLocal.x*7.0);');

    // Broad physical highlights instead of hard per-facet flashes.
    next=next.replace(specularA,`float specular=pow(max(dot(n,normalize(key+view)),0.),${specPowerA});`);
    next=next.replace(specularB,`specular+=${specGainB}*pow(max(dot(n,normalize(side+view)),0.),${specPowerB});`);

    // The OUTER shell must remain one homogeneous glass material. Organic
    // noise/veins/membrane remain available to the inner layer above.
    next=next.replace(glassBase,'vec3 glass=mix(vec3(.040,.205,.46),vec3(.10,.68,1.08),.34+.40*ndl);');
    next=next.replace(glassCloud,'glass+=vec3(.025,.22,.50)*.42;');
    next=next.replace(glassVeins,'glass+=spectral*veins*.10*fresnel;');
    next=next.replace(glassMembrane,'glass+=spectral*membrane*.055*fresnel;');

    // r458: phone output was still being driven into clipping by the nucleus,
    // cross-axis light and outer Fresnel term. Restrain only the mobile shader;
    // desktop keeps the established optical balance.
    if(mobile){
      next=next.replace(glassFresnel,'glass+=spectral*fresnel*(.92+.62*visualEnergy);');
      next=next.replace(innerNucleus,'organ+=ice*nucleus*(2.36+.78*visualEnergy);');
      next=next.replace(innerAxis,'organ+=(cyan*.84+ice*.18)*(axisV*.84+axisH*.46)*visualEnergy;');
      next=next.replace(outerNucleus,'glass+=ice*(rings*.30+heart*.12+nucleus*.44);');
      next=next.replace(outerAxis,'glass+=(cyan*.72+ice*.12)*(axisV*.70+axisH*.36)*visualEnergy;');
      next=next.replace(outerAlpha,'float alpha=.36+.20*ndl+.20*fresnel+edge*.072+veins*.105+rings*.060+specular*.15+surfaceSweep*.11;');
    }

    if(next!==before)fragmentPatched=true;
  }

  markReady();
  return next;
}

function restore(){
  if(restored)return;
  restored=true;
  for(const restore of restorers)restore();
  root.dataset.fxCoreShaderHookR456='released-after-r326-compile';
  root.dataset.fxCoreMobileShaderHookR456=root.dataset.fxCoreShaderHookR456;
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
    root.dataset.fxCoreShaderHookR456='prototype-write-failed';
    root.dataset.fxCoreMobileShaderHookR456=root.dataset.fxCoreShaderHookR456;
  }
}

root.dataset.fxCoreSurfaceR456='armed-before-r326-compile';
root.dataset.fxCoreMobileSurfaceR456=root.dataset.fxCoreSurfaceR456;
root.dataset.fxCoreShaderHookR456=restorers.length?'armed':'unavailable';
root.dataset.fxCoreMobileShaderHookR456=root.dataset.fxCoreShaderHookR456;
root.dataset.fxCoreMobileOpticalBalanceR458=mobile?'armed-restrained-mobile-optics':'desktop-no-op';
addEventListener('formatx:real3dready',()=>setTimeout(restore,0),{once:true,passive:true});
setTimeout(restore,6000);
}());