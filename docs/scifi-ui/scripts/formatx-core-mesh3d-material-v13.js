(function(){'use strict';
const root=document.documentElement;if(root.dataset.fxCoreMeshMaterial==='installed-v13')return;const C=window.WebGL2RenderingContext;if(!C||!C.prototype)return;const original=C.prototype.shaderSource;let patched=false;
const FS=`#version 300 es
precision highp float;
in vec3 vN,vP;out vec4 outColor;
uniform vec3 uCamera,uBase,uEmit;
uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech;
float sat(float x){return clamp(x,0.,1.);}
float sm(float a,float b,float x){return smoothstep(a,b,x);}
vec3 film(vec3 x){x=max(x,vec3(0.));vec3 y=1.-exp(-x);return pow(y,vec3(.78));}
void main(){
  vec3 sn=normalize(vN),v=normalize(uCamera-vP),fn=normalize(cross(dFdx(vP),dFdy(vP)));
  if(dot(fn,v)<0.)fn=-fn;
  vec3 n=normalize(mix(fn,sn,.25));
  float ndv=sat(dot(n,v));
  float fres=pow(1.-ndv,1.52);
  float energy=sat(uEnergy),surge=sat(uSurge),speech=sat(uSpeech);
  float drive=.82+energy*.68+surge*.72+speech*.18;
  float r=length(vP.xy),a=atan(vP.y,vP.x);

  if(uMode>1.5){
    float shimmer=.84+.16*sin(uTime*(1.18+energy*.52)+vP.y*10.5+vP.x*7.0);
    float spark=pow(.5+.5*sin(vP.x*31.+vP.y*25.-uTime*(.9+energy*1.3)),22.);
    vec3 c=uEmit*drive*(.92+uHeart*.28)*shimmer+uBase*.18;
    c+=vec3(.10,.78,1.32)*spark*(.06+.22*surge);
    outColor=vec4(film(c*.92),clamp(uAlpha*(.72+.10*energy),0.,.82));return;
  }

  if(uMode<.5){
    float center=exp(-r*2.25)*(1.-sat(abs(vP.z)*1.55));
    float innerGlow=exp(-r*4.0);
    float facet=max(dot(n,normalize(vec3(-.42,.78,.46))),0.);
    float facet2=max(dot(n,normalize(vec3(.54,.42,.72))),0.);
    float causticA=pow(.5+.5*sin(vP.y*16.0+vP.x*8.4+vP.z*13.0-uTime*(.12+.16*energy)),16.);
    float causticB=pow(.5+.5*sin(vP.x*18.0-vP.y*11.5-vP.z*9.2+1.1+uTime*(.08+.10*energy)),20.);
    float violetVein=pow(.5+.5*cos(vP.x*14.0+vP.y*17.0-vP.z*7.0+1.8+uTime*.07),28.);
    float radial=pow(.5+.5*cos(a*8.0+r*13.0-uTime*(.07+.11*energy)),18.);
    float axis=exp(-abs(vP.x)*23.)+exp(-abs(vP.y)*20.);
    float shoulder=pow(sat(.52+.48*cos(a*4.0)),5.0)*sm(.18,.86,r);
    float wave=pow(.5+.5*sin(r*25.-uTime*(1.7+2.0*energy)),16.)*(.03+.20*surge);
    float spec=pow(sat(dot(reflect(-normalize(vec3(-.34,.78,.52)),n),v)),34.);

    vec3 c=vec3(.010,.10,.19)*(.72+facet*.66+facet2*.24);
    c+=vec3(.018,.24,.46)*(.26+.34*center+.18*shoulder);
    c+=vec3(.03,.50,.92)*innerGlow*(.18+.28*energy);
    c+=vec3(.08,.92,1.54)*causticA*(.075+.17*energy+.10*fres);
    c+=vec3(.05,.64,1.12)*causticB*(.05+.12*energy);
    c+=vec3(.66,.10,1.20)*violetVein*(.028+.09*energy+.11*surge);
    c+=vec3(.10,.90,1.56)*radial*(.035+.10*fres+.055*energy);
    c+=vec3(.16,1.12,1.84)*axis*(.045+.035*energy);
    c+=vec3(.16,1.18,2.00)*fres*(.72+energy*.58+surge*.26);
    c+=vec3(.54,.13,1.06)*pow(fres,2.2)*(.10+.16*surge);
    c+=vec3(.10,.72,1.26)*wave;
    c+=vec3(.72,1.10,1.34)*spec*(.24+.26*energy);
    c+=uEmit*(.075+.12*uHeart+.09*energy+.09*surge);

    float alpha=clamp(uAlpha*(.68+.42*fres+.085*center+.065*energy)+.035*fres,.08,.94);
    outColor=vec4(film(c*1.18),alpha);return;
  }

  float coreMask=1.-sm(.050,.095,r);
  float ringMask=1.-coreMask;
  float facing=.54+.46*ndv;
  float reactor=(1.00+energy*.68+surge*.92+speech*.24+uHeart*.78);
  vec3 ringColor=uBase*.16+uEmit*reactor*facing;
  ringColor+=vec3(.07,.66,1.18)*fres*(.24+.28*energy);
  ringColor+=vec3(.44,.10,.88)*pow(fres,2.0)*(.05+.14*surge);
  vec3 coreColor=mix(vec3(.05,.72,1.18),vec3(.95,1.16,1.22),sm(.0,.80,coreMask));
  coreColor*=1.20+energy*.72+surge*.88+speech*.18+uHeart*.86;
  vec3 c=mix(ringColor,coreColor,coreMask);
  float alpha=clamp(uAlpha*(.58+.18*fres+.09*energy)*ringMask + coreMask*(.78+.18*energy),0.,.96);
  outColor=vec4(film(c*.92),alpha);
}`;
function patchedShaderSource(shader,source){
  if(!patched&&typeof source==='string'&&source.includes('uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech')&&source.includes('float drive=.72+uEnergy*.66')){
    patched=true;source=FS;root.dataset.fxCoreMeshMaterial='reference-glass-v13';root.dataset.fxCoreMeshMaterialPatch='applied-v13';queueMicrotask(()=>{if(C.prototype.shaderSource===patchedShaderSource)C.prototype.shaderSource=original;});
  }
  return original.call(this,shader,source);
}
C.prototype.shaderSource=patchedShaderSource;root.dataset.fxCoreMeshMaterial='installed-v13';
}());