(function(){'use strict';
const root=document.documentElement;if(root.dataset.fxCoreMeshMaterial==='installed-v15')return;const C=window.WebGL2RenderingContext;if(!C||!C.prototype)return;const original=C.prototype.shaderSource;let patched=false;
const FS=`#version 300 es
precision highp float;
in vec3 vN,vP;out vec4 outColor;
uniform vec3 uCamera,uBase,uEmit;
uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech;
float sat(float x){return clamp(x,0.,1.);}
float sm(float a,float b,float x){return smoothstep(a,b,x);}
vec3 film(vec3 x){x=max(x,vec3(0.));vec3 y=1.-exp(-x);return pow(y,vec3(.88));}
void main(){
  vec3 sn=normalize(vN),v=normalize(uCamera-vP),fn=normalize(cross(dFdx(vP),dFdy(vP)));
  if(dot(fn,v)<0.)fn=-fn;
  vec3 n=normalize(mix(fn,sn,.24));
  float ndv=sat(dot(n,v));
  float fres=pow(1.-ndv,1.46);
  float energy=sat(uEnergy),surge=sat(uSurge),speech=sat(uSpeech);
  vec2 cp=vec2(vP.x,vP.y-.18);
  float r=length(cp),a=atan(cp.y,cp.x);

  if(uMode>1.5){
    float shimmer=.88+.12*sin(uTime*(1.10+energy*.45)+cp.y*11.+cp.x*7.5);
    float spark=pow(.5+.5*sin(cp.x*29.+cp.y*23.-uTime*(.8+energy*1.2)),24.);
    vec3 c=uEmit*(.80+energy*.52+surge*.52+speech*.14)*(1.+uHeart*.22)*shimmer+uBase*.13;
    c+=vec3(.12,.78,1.28)*spark*(.04+.20*surge);
    outColor=vec4(film(c*.92),clamp(uAlpha*(.65+.09*energy),0.,.76));return;
  }

  if(uMode<.5){
    float center=exp(-r*2.15)*(1.-sat(abs(vP.z)*1.50));
    float innerGlow=exp(-r*4.6);
    float facet=max(dot(n,normalize(vec3(-.40,.80,.45))),0.);
    float facet2=max(dot(n,normalize(vec3(.56,.40,.72))),0.);
    float causticA=pow(.5+.5*sin(cp.y*15.0+cp.x*8.2+vP.z*12.0-uTime*(.10+.14*energy)),18.);
    float causticB=pow(.5+.5*sin(cp.x*17.5-cp.y*10.5-vP.z*8.8+1.05+uTime*(.07+.09*energy)),22.);
    float violetVein=pow(.5+.5*cos(cp.x*13.0+cp.y*15.5-vP.z*7.5+1.6+uTime*.06),32.);
    float radial=pow(.5+.5*cos(a*8.0+r*12.0-uTime*(.06+.10*energy)),20.);
    float axis=exp(-abs(cp.x)*22.)+exp(-abs(cp.y)*20.);
    float shoulder=pow(sat(.52+.48*cos(a*4.0)),5.5)*sm(.15,.88,r);
    float diag=pow(abs(sin(a*2.0)),13.0)*sm(.10,.92,r);
    float lineA=pow(.5+.5*cos((cp.x+cp.y)*18.0+vP.z*7.0),42.);
    float lineB=pow(.5+.5*cos((cp.x-cp.y)*20.0-vP.z*6.0+1.1),46.);
    float lineGate=sat(.24+.76*fres+.20*shoulder);
    float spec=pow(sat(dot(reflect(-normalize(vec3(-.32,.80,.50)),n),v)),40.);
    float whiteFacet=pow(sat(facet*.62+facet2*.38),6.2);

    vec3 c=vec3(.010,.068,.13)*(.64+facet*.48+facet2*.20);
    c+=vec3(.018,.22,.42)*(.24+.31*center+.15*shoulder);
    c+=vec3(.030,.48,.88)*innerGlow*(.14+.22*energy);
    c+=vec3(.075,.88,1.48)*causticA*(.055+.14*energy+.08*fres);
    c+=vec3(.045,.58,1.06)*causticB*(.038+.10*energy);
    c+=vec3(.68,.10,1.22)*violetVein*(.038+.12*energy+.14*surge);
    c+=vec3(.085,.82,1.48)*radial*(.028+.08*fres+.045*energy);
    c+=vec3(.16,1.12,1.90)*axis*(.052+.040*energy);
    c+=vec3(.16,1.12,1.94)*fres*(.62+energy*.48+surge*.20);
    c+=vec3(.50,.12,1.05)*pow(fres,2.25)*(.09+.15*surge);
    c+=vec3(.76,1.30,1.55)*(lineA+lineB)*lineGate*(.16+.20*energy);
    c+=vec3(.54,1.16,1.48)*diag*(.10+.13*energy+.08*fres);
    c+=vec3(.96,1.34,1.50)*whiteFacet*(.16+.18*energy);
    c+=vec3(1.00,1.28,1.38)*spec*(.44+.38*energy);
    c+=uEmit*(.060+.10*uHeart+.075*energy+.075*surge);

    float alpha=clamp(uAlpha*(.50+.34*fres+.075*center+.06*energy)+.035*fres,.06,.90);
    outColor=vec4(film(c*1.82),alpha);return;
  }

  float coreMask=1.-sm(.030,.082,r);
  float violetHint=sat((uEmit.r-uEmit.g)*1.4);
  float ringMask=1.-coreMask;
  float pulse=1.0+energy*.60+surge*.74+speech*.18+uHeart*.72;
  vec3 cyanRing=vec3(.045,.70,1.26)*pulse;
  vec3 violetRing=vec3(.56,.09,1.14)*pulse;
  vec3 ringColor=mix(cyanRing,violetRing,violetHint);
  ringColor+=vec3(.16,.94,1.42)*fres*(.18+.20*energy)*(1.-violetHint*.52);
  ringColor+=vec3(.78,.22,1.18)*fres*(.09+.17*surge)*violetHint;
  float coreHalo=exp(-r*22.0);
  vec3 coreColor=mix(vec3(.18,.88,1.24),vec3(1.15,1.24,1.25),sm(.12,.96,coreMask));
  coreColor*=1.22+energy*.68+surge*.86+speech*.18+uHeart*.82;
  coreColor+=vec3(.15,.80,1.18)*coreHalo*.45;
  vec3 c=mix(ringColor,coreColor,coreMask);
  float alpha=clamp(uAlpha*(.50+.15*fres+.075*energy)*ringMask + coreMask*(.82+.16*energy),0.,.98);
  outColor=vec4(film(c*1.10),alpha);
}`;
function patchedShaderSource(shader,source){
  if(!patched&&typeof source==='string'&&source.includes('uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech')&&source.includes('float drive=.72+uEnergy*.66')){
    patched=true;source=FS;root.dataset.fxCoreMeshMaterial='reference-glass-v15';root.dataset.fxCoreMeshMaterialPatch='applied-v15';root.dataset.fxCoreMaterialCenter='object-space-y-minus-0.18';queueMicrotask(()=>{if(C.prototype.shaderSource===patchedShaderSource)C.prototype.shaderSource=original;});
  }
  return original.call(this,shader,source);
}
C.prototype.shaderSource=patchedShaderSource;root.dataset.fxCoreMeshMaterial='installed-v15';
}());