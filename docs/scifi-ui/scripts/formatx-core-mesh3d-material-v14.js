(function(){'use strict';
const root=document.documentElement;if(root.dataset.fxCoreMeshMaterial==='installed-v14')return;const C=window.WebGL2RenderingContext;if(!C||!C.prototype)return;const original=C.prototype.shaderSource;let patched=false;
const FS=`#version 300 es
precision highp float;
in vec3 vN,vP;out vec4 outColor;
uniform vec3 uCamera,uBase,uEmit;
uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech;
float sat(float x){return clamp(x,0.,1.);}
float sm(float a,float b,float x){return smoothstep(a,b,x);}
vec3 film(vec3 x){x=max(x,vec3(0.));vec3 y=1.-exp(-x);return pow(y,vec3(.86));}
void main(){
  vec3 sn=normalize(vN),v=normalize(uCamera-vP),fn=normalize(cross(dFdx(vP),dFdy(vP)));
  if(dot(fn,v)<0.)fn=-fn;
  vec3 n=normalize(mix(fn,sn,.24));
  float ndv=sat(dot(n,v));
  float fres=pow(1.-ndv,1.48);
  float energy=sat(uEnergy),surge=sat(uSurge),speech=sat(uSpeech);
  float r=length(vP.xy),a=atan(vP.y,vP.x);

  if(uMode>1.5){
    float shimmer=.88+.12*sin(uTime*(1.10+energy*.45)+vP.y*10.+vP.x*7.5);
    float spark=pow(.5+.5*sin(vP.x*29.+vP.y*23.-uTime*(.8+energy*1.2)),24.);
    vec3 c=uEmit*(.76+energy*.46+surge*.48+speech*.12)*(1.+uHeart*.20)*shimmer+uBase*.13;
    c+=vec3(.10,.72,1.20)*spark*(.04+.18*surge);
    outColor=vec4(film(c*.82),clamp(uAlpha*(.62+.08*energy),0.,.72));return;
  }

  if(uMode<.5){
    float center=exp(-r*2.0)*(1.-sat(abs(vP.z)*1.50));
    float innerGlow=exp(-r*4.4);
    float facet=max(dot(n,normalize(vec3(-.40,.80,.45))),0.);
    float facet2=max(dot(n,normalize(vec3(.56,.40,.72))),0.);
    float causticA=pow(.5+.5*sin(vP.y*15.0+vP.x*8.2+vP.z*12.0-uTime*(.10+.14*energy)),18.);
    float causticB=pow(.5+.5*sin(vP.x*17.5-vP.y*10.5-vP.z*8.8+1.05+uTime*(.07+.09*energy)),22.);
    float violetVein=pow(.5+.5*cos(vP.x*13.0+vP.y*15.5-vP.z*7.5+1.6+uTime*.06),32.);
    float radial=pow(.5+.5*cos(a*8.0+r*12.0-uTime*(.06+.10*energy)),20.);
    float axis=exp(-abs(vP.x)*22.)+exp(-abs(vP.y)*18.);
    float shoulder=pow(sat(.52+.48*cos(a*4.0)),5.5)*sm(.15,.88,r);
    float lineA=pow(.5+.5*cos((vP.x+vP.y)*18.0+vP.z*7.0),42.);
    float lineB=pow(.5+.5*cos((vP.x-vP.y)*20.0-vP.z*6.0+1.1),46.);
    float lineGate=sat(.22+.78*fres+.20*shoulder);
    float spec=pow(sat(dot(reflect(-normalize(vec3(-.32,.80,.50)),n),v)),42.);
    float whiteFacet=pow(sat(facet*.62+facet2*.38),7.0);

    vec3 c=vec3(.008,.060,.12)*(.62+facet*.44+facet2*.18);
    c+=vec3(.016,.20,.40)*(.20+.28*center+.13*shoulder);
    c+=vec3(.025,.42,.82)*innerGlow*(.12+.20*energy);
    c+=vec3(.07,.82,1.42)*causticA*(.05+.13*energy+.07*fres);
    c+=vec3(.04,.54,1.02)*causticB*(.035+.09*energy);
    c+=vec3(.62,.09,1.18)*violetVein*(.035+.11*energy+.13*surge);
    c+=vec3(.08,.78,1.44)*radial*(.025+.075*fres+.04*energy);
    c+=vec3(.12,1.02,1.76)*axis*(.032+.026*energy);
    c+=vec3(.13,1.02,1.82)*fres*(.54+energy*.42+surge*.18);
    c+=vec3(.48,.11,1.02)*pow(fres,2.25)*(.08+.14*surge);
    c+=vec3(.54,1.12,1.44)*(lineA+lineB)*lineGate*(.10+.15*energy);
    c+=vec3(.82,1.22,1.42)*whiteFacet*(.10+.14*energy);
    c+=vec3(.88,1.18,1.30)*spec*(.34+.34*energy);
    c+=uEmit*(.055+.09*uHeart+.07*energy+.07*surge);

    float alpha=clamp(uAlpha*(.54+.34*fres+.07*center+.055*energy)+.025*fres,.06,.88);
    outColor=vec4(film(c*1.12),alpha);return;
  }

  float coreMask=1.-sm(.030,.070,r);
  float violetHint=sat((uEmit.r-uEmit.g)*1.4);
  float ringMask=1.-coreMask;
  float pulse=1.0+energy*.56+surge*.70+speech*.18+uHeart*.68;
  vec3 cyanRing=vec3(.035,.62,1.18)*pulse;
  vec3 violetRing=vec3(.50,.08,1.08)*pulse;
  vec3 ringColor=mix(cyanRing,violetRing,violetHint);
  ringColor+=vec3(.10,.82,1.34)*fres*(.16+.18*energy)*(1.-violetHint*.55);
  ringColor+=vec3(.72,.18,1.12)*fres*(.08+.16*surge)*violetHint;
  vec3 coreColor=mix(vec3(.04,.68,1.10),vec3(.96,1.10,1.12),sm(.0,.78,coreMask));
  coreColor*=1.06+energy*.58+surge*.74+speech*.16+uHeart*.72;
  vec3 c=mix(ringColor,coreColor,coreMask);
  float alpha=clamp(uAlpha*(.48+.14*fres+.07*energy)*ringMask + coreMask*(.70+.16*energy),0.,.92);
  outColor=vec4(film(c*.88),alpha);
}`;
function patchedShaderSource(shader,source){
  if(!patched&&typeof source==='string'&&source.includes('uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech')&&source.includes('float drive=.72+uEnergy*.66')){
    patched=true;source=FS;root.dataset.fxCoreMeshMaterial='reference-glass-v14';root.dataset.fxCoreMeshMaterialPatch='applied-v14';queueMicrotask(()=>{if(C.prototype.shaderSource===patchedShaderSource)C.prototype.shaderSource=original;});
  }
  return original.call(this,shader,source);
}
C.prototype.shaderSource=patchedShaderSource;root.dataset.fxCoreMeshMaterial='installed-v14';
}());