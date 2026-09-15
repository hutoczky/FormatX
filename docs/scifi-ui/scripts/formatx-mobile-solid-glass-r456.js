/* FormatX r465 — native WebGL uniform solid-glass + soft award mobile optics.
   R326 remains the geometry/material owner. This short-lived precompile hook
   keeps the outer shell visually continuous while reducing mobile perimeter
   bloom, hard specular edges and shader cost. The centre stays luminous; the
   silhouette transitions through a softer, low-bloom glass edge. Desktop is
   intentionally unchanged. */
(function(){
'use strict';
const root=document.documentElement;
const VERSION='r465-uniform-solid-glass-soft-perimeter-low-bloom-mobile-optics';
if(root.dataset.fxCoreSurfaceR456)return;

const mobile=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
const smoothWeight=mobile?'.998':'.930';
const specPowerA=mobile?'22.0':'36.0';
const specPowerB=mobile?'14.0':'22.0';
const specGainB=mobile?'.24':'.64';

const vertexNeedle='vec3 normal=normalize(mix(aCrystalNormal,aSphereNormal,morph));';
const vertexReplacement=`vec3 crystalSmoothNormal=normalize(vec3(aCrystal.x*1.04,aCrystal.y*.86,aCrystal.z*1.22));
        vec3 crystalLitNormal=normalize(mix(aCrystalNormal,crystalSmoothNormal,${smoothWeight}));
        vec3 normal=normalize(mix(crystalLitNormal,aSphereNormal,morph));`;

const edgePattern=/float edge=1\.0-smoothstep\([^;]+;\s*edge\*=pow\(1\.0-vMorph,1\.7\)\*\([^;]+;/;
const surfacePulsePattern=/float surfaceSweep=0\.0;\s*float surfaceFilament=0\.0;\s*if\(uSurfacePulse>=0\.0\)\{[\s\S]*?\n\s*\}\n\n\s*if\(uLayer>\.5\)\{/;
const facetPulse='float facetPulse=.5+.5*sin(vFacet*23.0+uTime*.42+uSiteProgress*5.0);';
const hueFacet='float hue=.5+.5*sin(vFacet*7.0+uSiteProgress*9.0+uTime*.12);';
const electricFacet='float electricFlicker=.78+.22*sin(uTime*46.0+vLocal.y*31.0+vFacet*5.0);';
const hashFunction='float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}';
const noiseFunction='float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}';
const ridgeFunction='float ridge(float v,float p){return pow(sat(1.-abs(fract(v)-.5)*2.),p);}';
const specularA='float specular=pow(max(dot(n,normalize(key+view)),0.),42.0);';
const specularB='specular+=.72*pow(max(dot(n,normalize(side+view)),0.),24.0);';
const fresnelMobile='float fresnel=pow(1.0-facing,1.56);';
const glassBase='vec3 glass=mix(vec3(.040,.205,.46),vec3(.10,.68,1.08),.28+.38*ndl+.15*facetPulse);';
const glassCloud='glass+=vec3(.025,.22,.50)*(.54+.76*cloud);';
const glassFresnel='glass+=spectral*fresnel*(1.22+.94*visualEnergy);';
const glassVeins='glass+=spectral*veins*(1.24+.48*uBreath);';
const glassMembrane='glass+=spectral*membrane*(.58+.36*visualEnergy);';
const innerNucleus='organ+=ice*nucleus*(3.18+1.18*visualEnergy);';
const innerAxis='organ+=(cyan*1.04+ice*.24)*(axisV*1.10+axisH*.62)*visualEnergy;';
const innerSweep='organ+=(ice*1.52+cyan*.80+violet*.28)*surfaceSweep*(1.22+.42*visualEnergy);';
const outerNucleus='glass+=ice*(rings*.30+heart*.12+nucleus*.64);';
const outerAxis='glass+=(cyan*.90+ice*.16)*(axisV*.90+axisH*.48)*visualEnergy;';
const outerSweep='glass+=(ice*1.28+cyan*.74+spectral*.30)*surfaceSweep*(1.20+.46*fresnel);';
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
  root.dataset.fxCoreNormalR456=mobile?'continuous-volume-99.8-percent-smooth':'continuous-volume-93-percent-smooth';
  root.dataset.fxCoreMobileNormalR456=root.dataset.fxCoreNormalR456;
  root.dataset.fxCoreTriangleEdgesR456='disabled';
  root.dataset.fxCoreMobileTriangleEdgesR456='disabled';
  root.dataset.fxCoreOuterNoiseR456='disabled-on-glass-shell';
  root.dataset.fxCoreInnerLifeR456='preserved-low-cost-mobile-field';
  root.dataset.fxCoreSpecularR456=mobile?'soft-broad-low-gain-highlight-r465':'continuous-controlled-highlight';
  root.dataset.fxCoreMobileOpticalBalanceR458=mobile?'superseded-by-r465-soft-perimeter':'desktop-material-unchanged';
  root.dataset.fxCoreMobileOpticalBalanceR460=mobile?'superseded-by-r465-soft-perimeter':'desktop-material-unchanged';
  root.dataset.fxCoreMobileOpticalBalanceR463=mobile?'superseded-by-r465-soft-perimeter':'desktop-material-unchanged';
  root.dataset.fxCoreMobileOpticalBalanceR465=mobile?'soft-perimeter-low-bloom-low-cost-shader':'desktop-material-unchanged';
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

    next=next.replace(facetPulse,'float facetPulse=.5;');
    next=next.replace(edgePattern,'float edge=0.0;');
    next=next.replace(hueFacet,'float hue=.5+.5*sin(vLocal.y*2.10+vLocal.x*1.35+vLocal.z*.85+uSiteProgress*2.0+uTime*.035);');
    next=next.replace(electricFacet,'float electricFlicker=.92+.08*sin(uTime*22.0+vLocal.y*11.0+vLocal.x*4.0);');

    next=next.replace(specularA,`float specular=pow(max(dot(n,normalize(key+view)),0.),${specPowerA});`);
    next=next.replace(specularB,`specular+=${specGainB}*pow(max(dot(n,normalize(side+view)),0.),${specPowerB});`);

    next=next.replace(glassBase,'vec3 glass=mix(vec3(.040,.205,.46),vec3(.10,.68,1.08),.33+.37*ndl);');
    next=next.replace(glassCloud,'glass+=vec3(.025,.22,.50)*.30;');
    next=next.replace(glassVeins,'glass+=spectral*veins*.055*fresnel;');
    next=next.replace(glassMembrane,'glass+=spectral*membrane*.030*fresnel;');

    if(mobile){
      /* R465 keeps a living interior but removes the expensive multi-hash noise
         and variable-power ridge from the phone shader. This lowers compile and
         first-frame cost while producing calmer, less brittle internal light. */
      next=next.replace(hashFunction,'float hash(vec2 p){return fract(p.x*.1031+p.y*.11369);}');
      next=next.replace(noiseFunction,'float noise(vec2 p){return .5+.5*sin(p.x*1.71+p.y*1.19);}');
      next=next.replace(ridgeFunction,'float ridge(float v,float p){float x=sat(1.-abs(fract(v)-.5)*2.);return x*x*x;}');
      // R484: a bounded, branching current follows the real curved surface.
      // Smoothstep + two sine fields avoid expensive noise and strobe flicker.
      next=next.replace(surfacePulsePattern,`float surfaceSweep=0.0;
        float surfaceFilament=0.0;
        if(uSurfacePulse>=0.0){
          float sweepCoordinate=.5+(vLocal.y*.74+vLocal.x*.22+vLocal.z*.26)*.5;
          float sweepHead=mix(-.12,1.12,sat(uSurfacePulse));
          float sweepDistance=abs(sweepCoordinate-sweepHead);
          float pathWave=.085*sin(vLocal.y*9.0+vLocal.z*4.0)
            +.035*sin(vLocal.y*21.0-vLocal.z*6.0);
          float trunk=1.0-smoothstep(.014,.060,abs(vLocal.x+pathWave));
          float branch=1.0-smoothstep(.010,.038,
            abs(vLocal.x*.76-vLocal.z*.22+pathWave*1.9));
          surfaceFilament=trunk+.50*branch;
          float band=1.0-smoothstep(.018,.070,sweepDistance);
          float tail=(1.0-smoothstep(.025,.23,sweepHead-sweepCoordinate))
            *step(0.0,sweepHead-sweepCoordinate);
          float envelope=smoothstep(0.0,.10,uSurfacePulse)
            *(1.0-smoothstep(.86,1.0,uSurfacePulse));
          surfaceSweep=(band+.30*tail)*(.58+.42*fresnel)
            *(.50+.90*surfaceFilament)*envelope;
        }

        if(uLayer>.5){`);
      next=next.replace(fresnelMobile,'float fresnel=pow(1.0-facing,1.92);');
      next=next.replace(glassFresnel,'glass+=spectral*fresnel*(.34+.18*visualEnergy);');
      next=next.replace(innerNucleus,'organ+=ice*nucleus*(1.48+.34*visualEnergy);');
      next=next.replace(innerAxis,'organ+=(cyan*.46+ice*.09)*(axisV*.46+axisH*.21)*visualEnergy;');
      next=next.replace(innerSweep,'organ+=(ice*.90+cyan*.78+violet*.24)*surfaceSweep*(.82+.20*visualEnergy);');
      next=next.replace(outerNucleus,'glass+=ice*(rings*.16+heart*.06+nucleus*.20);');
      next=next.replace(outerAxis,'glass+=(cyan*.34+ice*.06)*(axisV*.35+axisH*.16)*visualEnergy;');
      next=next.replace(outerSweep,'glass+=(ice*.72+cyan*.85+spectral*.38)*surfaceSweep*(.88+.24*fresnel);');
      next=next.replace(outerAlpha,'float alpha=.33+.16*ndl+.055*fresnel+edge*.025+veins*.060+rings*.035+specular*.070+surfaceSweep*.14;');
      next=next.replace('filmic(organ*2.92)','filmic(organ*2.30)');
      next=next.replace('filmic(glass*2.66)','filmic(glass*2.10)');
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
root.dataset.fxCoreMobileOpticalBalanceR458=mobile?'superseded-by-r465-soft-perimeter':'desktop-no-op';
root.dataset.fxCoreMobileOpticalBalanceR460=mobile?'superseded-by-r465-soft-perimeter':'desktop-no-op';
root.dataset.fxCoreMobileOpticalBalanceR463=mobile?'superseded-by-r465-soft-perimeter':'desktop-no-op';
root.dataset.fxCoreMobileOpticalBalanceR465=mobile?'armed-soft-perimeter-low-bloom-low-cost-shader':'desktop-no-op';
addEventListener('formatx:real3dready',()=>setTimeout(restore,0),{once:true,passive:true});
setTimeout(restore,6000);
}());
