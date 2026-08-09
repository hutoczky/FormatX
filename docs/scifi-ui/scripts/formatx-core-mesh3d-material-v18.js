(function(){'use strict';
const root=document.documentElement;if(root.dataset.fxCoreMeshMaterial==='installed-v18')return;const C=window.WebGL2RenderingContext;if(!C||!C.prototype)return;const original=C.prototype.shaderSource;let patched=false;
const FS=`#version 300 es
precision highp float;
in vec3 vN,vP;out vec4 outColor;
uniform vec3 uCamera,uBase,uEmit;
uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech;
float sat(float x){return clamp(x,0.,1.);}
float sm(float a,float b,float x){return smoothstep(a,b,x);}
vec3 film(vec3 x){x=max(x,vec3(0.));vec3 y=1.-exp(-x);return pow(y,vec3(.92));}
void main(){
  vec3 sn=normalize(vN),v=normalize(uCamera-vP),fn=normalize(cross(dFdx(vP),dFdy(vP)));
  if(dot(fn,v)<0.)fn=-fn;
  vec3 n=normalize(mix(fn,sn,.22));float ndv=sat(dot(n,v));float fres=pow(1.-ndv,1.42);
  float energy=sat(uEnergy),surge=sat(uSurge),speech=sat(uSpeech);vec2 cp=vec2(vP.x,vP.y-.18);float r=length(cp),a=atan(cp.y,cp.x);
  if(uMode>1.5){
    float shimmer=.88+.12*sin(uTime*(1.05+energy*.42)+cp.y*11.+cp.x*8.);float spark=pow(.5+.5*sin(cp.x*31.+cp.y*27.-uTime*(.8+energy*1.1)),28.);
    vec3 c=uEmit*(.64+energy*.44+surge*.42+speech*.12)*(1.+uHeart*.18)*shimmer+uBase*.10;c+=vec3(.18,.90,1.38)*spark*(.06+.22*surge);
    outColor=vec4(film(c*.82),clamp(uAlpha*(.58+.08*energy),0.,.70));return;
  }
  if(uMode<.5){
    float center=exp(-r*2.25)*(1.-sat(abs(vP.z)*1.55));float inner=exp(-r*4.8);
    float facet=max(dot(n,normalize(vec3(-.42,.78,.46))),0.),facet2=max(dot(n,normalize(vec3(.58,.38,.72))),0.);
    float webA=pow(.5+.5*cos((cp.x+cp.y)*15.0+vP.z*7.5-uTime*.045),13.0);
    float webB=pow(.5+.5*cos((cp.x-cp.y)*16.5-vP.z*6.5+1.15+uTime*.035),14.0);
    float webC=pow(.5+.5*cos(a*8.0+r*13.5-uTime*(.05+.08*energy)),15.0);
    float webGate=sm(.08,.30,r)*(1.-sm(.88,1.08,r));
    float diag=pow(abs(sin(a*2.0)),15.0)*sm(.10,.90,r);
    float axis=(exp(-abs(cp.x)*31.)+exp(-abs(cp.y)*29.))*exp(-r*.75);
    float violet=pow(.5+.5*cos(cp.x*13.5+cp.y*17.0-vP.z*8.0+1.7+uTime*.055),30.0);
    float caustic=pow(.5+.5*sin(cp.y*16.0+cp.x*9.0+vP.z*12.5-uTime*(.10+.13*energy)),18.0);
    float spec=pow(sat(dot(reflect(-normalize(vec3(-.30,.82,.48)),n),v)),36.0);
    float whiteFacet=pow(sat(facet*.58+facet2*.42),5.6);
    float micro=pow(.5+.5*sin(cp.x*43.+cp.y*37.+vP.z*19.-uTime*.18),52.0)*webGate;
    vec3 c=vec3(.004,.028,.060)*(.72+facet*.28+facet2*.12);
    c+=vec3(.010,.12,.26)*center*.30+vec3(.018,.30,.62)*inner*(.10+.15*energy);
    c+=vec3(.10,.86,1.42)*caustic*(.055+.12*energy);
    c+=vec3(.56,.08,1.16)*violet*(.055+.16*energy+.16*surge);
    c+=vec3(.24,1.22,1.74)*(webA+webB)*webGate*(.24+.30*energy);
    c+=vec3(.10,.88,1.48)*webC*webGate*(.10+.14*energy);
    c+=vec3(.56,1.34,1.66)*diag*(.16+.20*energy);
    c+=vec3(.58,1.46,1.78)*axis*(.13+.14*energy);
    c+=vec3(.16,1.16,1.92)*fres*(.42+.34*energy+.14*surge);
    c+=vec3(.90,1.42,1.58)*whiteFacet*(.30+.30*energy);
    c+=vec3(1.12,1.46,1.55)*spec*(.62+.46*energy);
    c+=vec3(.92,1.38,1.58)*micro*(.22+.34*surge);
    c+=uEmit*(.030+.055*uHeart+.040*energy+.045*surge);
    float alpha=clamp(uAlpha*(.38+.28*fres+.05*center+.045*energy)+.025*fres,.045,.78);
    outColor=vec4(film(c*1.28),alpha);return;
  }
  float coreMask=1.-sm(.030,.082,r);float violetHint=sat((uEmit.r-uEmit.g)*1.45);float ringMask=1.-coreMask;
  float pulse=1.+energy*.54+surge*.68+speech*.16+uHeart*.68;
  vec3 cyanRing=vec3(.015,.38,.88)*pulse, violetRing=vec3(.34,.025,.78)*pulse;vec3 ringColor=mix(cyanRing,violetRing,violetHint);
  ringColor+=mix(vec3(.05,.54,1.02),vec3(.48,.08,.92),violetHint)*fres*(.14+.18*energy);
  float coreHalo=exp(-r*23.0);vec3 coreColor=mix(vec3(.10,.68,1.08),vec3(1.18,1.30,1.32),sm(.10,.94,coreMask));coreColor*=1.16+energy*.62+surge*.78+speech*.16+uHeart*.76;coreColor+=vec3(.18,.82,1.18)*coreHalo*.48;
  vec3 c=mix(ringColor,coreColor,coreMask);float alpha=clamp(uAlpha*(.43+.13*fres+.065*energy)*ringMask+coreMask*(.82+.16*energy),0.,.98);outColor=vec4(film(c*1.02),alpha);
}`;
function patchedShaderSource(shader,source){if(!patched&&typeof source==='string'&&source.includes('uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech')&&source.includes('float drive=.72+uEnergy*.66')){patched=true;source=FS;root.dataset.fxCoreMeshMaterial='reference-glass-v18';root.dataset.fxCoreMeshMaterialPatch='applied-v18';root.dataset.fxCoreMaterialCenter='object-space-y-minus-0.18';root.dataset.fxCoreHighlightModel='sparse-high-dynamic-facets-v18';queueMicrotask(()=>{if(C.prototype.shaderSource===patchedShaderSource)C.prototype.shaderSource=original;});}return original.call(this,shader,source);}
C.prototype.shaderSource=patchedShaderSource;root.dataset.fxCoreMeshMaterial='installed-v18';
}());