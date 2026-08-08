(function(){'use strict';
const root=document.documentElement;if(root.dataset.fxCoreMeshMaterial==='installed-v12')return;const C=window.WebGL2RenderingContext;if(!C||!C.prototype)return;const original=C.prototype.shaderSource;let patched=false;
const FS=`#version 300 es
precision highp float;
in vec3 vN,vP;out vec4 outColor;
uniform vec3 uCamera,uBase,uEmit;
uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech;
float sat(float x){return clamp(x,0.,1.);}
vec3 film(vec3 x){x=max(x,vec3(0.));return 1.-exp(-x);}
void main(){
  vec3 sn=normalize(vN),v=normalize(uCamera-vP),fn=normalize(cross(dFdx(vP),dFdy(vP)));
  if(dot(fn,v)<0.)fn=-fn;
  vec3 n=normalize(mix(fn,sn,.22));
  float ndv=sat(dot(n,v));
  float fres=pow(1.-ndv,1.62);
  float energy=sat(uEnergy),surge=sat(uSurge),speech=sat(uSpeech);
  float drive=.80+energy*.72+surge*.82+speech*.22;
  if(uMode>1.5){
    float shimmer=.74+.26*sin(uTime*(1.34+energy*.78)+vP.y*13.+vP.x*9.5);
    float spark=pow(.5+.5*sin(vP.x*35.+vP.y*29.-uTime*(1.1+energy*1.8)),18.);
    vec3 c=uEmit*drive*(1.10+uHeart*.46)*shimmer+uBase*.24;
    c+=vec3(.15,.92,1.54)*spark*(.12+.32*surge);
    outColor=vec4(film(c*1.28),clamp(uAlpha*(.92+.16*energy),0.,1.));return;
  }
  if(uMode<.5){
    float r=length(vP.xy),a=atan(vP.y,vP.x);
    float center=exp(-r*2.65)*(1.-sat(abs(vP.z)*1.6));
    float shell=exp(-abs(r-.58)*3.2);
    float causticA=pow(.5+.5*sin(vP.y*18.5+vP.x*9.2+vP.z*14.0-uTime*(.15+.18*energy)),18.);
    float causticB=pow(.5+.5*sin(vP.x*21.0-vP.y*12.4-vP.z*10.5+1.4+uTime*(.11+.12*energy)),24.);
    float violetVein=pow(.5+.5*cos(vP.x*17.0+vP.y*20.0-vP.z*8.0+2.0+uTime*.09),26.);
    float radial=pow(.5+.5*cos(a*8.0+r*16.0-uTime*(.09+.15*energy)),22.);
    float spine=exp(-abs(vP.x)*25.)+exp(-abs(vP.y)*22.);
    float facet=pow(sat(dot(n,normalize(vec3(-.44,.76,.48)))),3.0);
    float rimSpark=pow(fres,2.15);
    float pulseWave=pow(.5+.5*sin(r*31.-uTime*(2.1+2.4*energy)),18.)*(.04+.26*surge);
    vec3 c=vec3(.006,.075,.14)*(.58+facet*.70);
    c+=vec3(.03,.42,.78)*(center*.58+shell*.18);
    c+=vec3(.08,.90,1.56)*causticA*(.10+.23*energy+.16*fres);
    c+=vec3(.06,.66,1.22)*causticB*(.07+.16*energy);
    c+=vec3(.74,.12,1.34)*violetVein*(.045+.13*energy+.16*surge);
    c+=vec3(.12,.96,1.66)*radial*(.055+.16*fres+.08*energy);
    c+=vec3(.18,1.18,1.92)*spine*(.055+.05*energy);
    c+=vec3(.20,1.38,2.30)*fres*(1.12+energy*.88+surge*.40);
    c+=vec3(.56,.18,1.22)*rimSpark*(.22+.25*surge);
    c+=vec3(.12,.82,1.46)*pulseWave;
    c+=uEmit*(.10+.18*uHeart+.13*energy+.14*surge);
    float spec=pow(sat(dot(reflect(-normalize(vec3(-.35,.76,.55)),n),v)),46.);
    c+=vec3(.82,1.28,1.58)*spec*(.42+.42*energy);
    float alpha=clamp(uAlpha*(.30+.42*fres+.075*center+.065*energy+.035*causticA),.10,.88);
    outColor=vec4(film(c*1.42),alpha);return;
  }
  float facing=.50+.50*ndv;
  float reactor=(1.04+energy*.76+surge*1.10+speech*.30+uHeart*.92);
  vec3 c=uBase*.14+uEmit*reactor*facing;
  c+=vec3(.10,.84,1.50)*fres*(.42+.42*energy);
  c+=vec3(.58,.16,1.10)*pow(fres,2.0)*(.10+.22*surge);
  outColor=vec4(film(c*1.16),clamp(uAlpha*(.62+.23*fres+.10*energy),0.,1.));
}`;
function patchedShaderSource(shader,source){
  if(!patched&&typeof source==='string'&&source.includes('uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech')&&source.includes('float drive=.72+uEnergy*.66')){
    patched=true;source=FS;root.dataset.fxCoreMeshMaterial='reference-glass-v12';root.dataset.fxCoreMeshMaterialPatch='applied';queueMicrotask(()=>{if(C.prototype.shaderSource===patchedShaderSource)C.prototype.shaderSource=original;});
  }
  return original.call(this,shader,source);
}
C.prototype.shaderSource=patchedShaderSource;root.dataset.fxCoreMeshMaterial='installed-v12';
}());