(function(){'use strict';
const root=document.documentElement;if(root.dataset.fxCoreMeshMaterial==='installed-v19')return;const C=window.WebGL2RenderingContext;if(!C||!C.prototype)return;const original=C.prototype.shaderSource;let patched=false;
const FS=`#version 300 es
precision highp float;
in vec3 vN,vP;out vec4 outColor;
uniform vec3 uCamera,uBase,uEmit;
uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech;
float sat(float x){return clamp(x,0.,1.);}
float sm(float a,float b,float x){return smoothstep(a,b,x);}
vec3 film(vec3 x){x=max(x,vec3(0.));vec3 y=1.-exp(-x);return pow(y,vec3(.92));}
void main(){
  vec3 sn=normalize(vN),v=normalize(uCamera-vP),fn=normalize(cross(dFdx(vP),dFdy(vP)));if(dot(fn,v)<0.)fn=-fn;
  vec3 n=normalize(mix(fn,sn,.22));float ndv=sat(dot(n,v));float fres=pow(1.-ndv,1.40);float energy=sat(uEnergy),surge=sat(uSurge),speech=sat(uSpeech);
  vec2 cp=vec2(vP.x,vP.y-.18);float r=length(cp),a=atan(cp.y,cp.x);
  if(uMode>1.5){float shimmer=.88+.12*sin(uTime*(1.05+energy*.42)+cp.y*11.+cp.x*8.);float spark=pow(.5+.5*sin(cp.x*31.+cp.y*27.-uTime*(.8+energy*1.1)),25.);vec3 c=uEmit*(.72+energy*.48+surge*.46+speech*.12)*(1.+uHeart*.20)*shimmer+uBase*.10;c+=vec3(.22,.98,1.46)*spark*(.08+.24*surge);outColor=vec4(film(c*.90),clamp(uAlpha*(.60+.08*energy),0.,.74));return;}
  if(uMode<.5){
    float center=exp(-r*2.15)*(1.-sat(abs(vP.z)*1.55));float inner=exp(-r*4.5);
    float facet=max(dot(n,normalize(vec3(-.42,.78,.46))),0.),facet2=max(dot(n,normalize(vec3(.58,.38,.72))),0.);
    float planeGlow=pow(facet,2.55)*.72+pow(facet2,2.85)*.50;
    float webA=pow(.5+.5*cos((cp.x+cp.y)*14.0+vP.z*7.0-uTime*.045),9.0);
    float webB=pow(.5+.5*cos((cp.x-cp.y)*15.2-vP.z*6.0+1.15+uTime*.035),10.0);
    float webC=pow(.5+.5*cos(a*8.0+r*13.0-uTime*(.05+.08*energy)),11.0);
    float webGate=sm(.06,.26,r)*(1.-sm(.90,1.10,r));
    float diag=pow(abs(sin(a*2.0)),10.0)*sm(.08,.92,r);
    float axis=(exp(-abs(cp.x)*28.)+exp(-abs(cp.y)*27.))*exp(-r*.68);
    float violet=pow(.5+.5*cos(cp.x*13.5+cp.y*17.0-vP.z*8.0+1.7+uTime*.055),25.0);
    float caustic=pow(.5+.5*sin(cp.y*16.0+cp.x*9.0+vP.z*12.5-uTime*(.10+.13*energy)),14.0);
    float spec=pow(sat(dot(reflect(-normalize(vec3(-.30,.82,.48)),n),v)),30.0);
    float micro=pow(.5+.5*sin(cp.x*43.+cp.y*37.+vP.z*19.-uTime*.18),42.0)*webGate;
    vec3 c=vec3(.005,.032,.068)*(.72+facet*.28+facet2*.14);
    c+=vec3(.012,.15,.30)*center*.32+vec3(.020,.34,.68)*inner*(.12+.17*energy);
    c+=vec3(.10,.90,1.48)*caustic*(.08+.16*energy);
    c+=vec3(.62,.09,1.24)*violet*(.07+.18*energy+.18*surge);
    c+=vec3(.32,1.30,1.78)*(webA+webB)*webGate*(.52+.58*energy);
    c+=vec3(.14,.98,1.58)*webC*webGate*(.24+.28*energy);
    c+=vec3(.64,1.42,1.70)*diag*(.32+.34*energy);
    c+=vec3(.68,1.50,1.82)*axis*(.26+.28*energy);
    c+=vec3(.18,1.20,1.96)*fres*(.52+.40*energy+.16*surge);
    c+=vec3(.72,1.24,1.48)*planeGlow*(.48+.44*energy);
    c+=vec3(1.10,1.52,1.64)*spec*(1.05+.78*energy);
    c+=vec3(.98,1.44,1.62)*micro*(.42+.48*surge);
    c+=uEmit*(.034+.060*uHeart+.045*energy+.050*surge);
    float alpha=clamp(uAlpha*(.40+.30*fres+.055*center+.050*energy)+.030*fres,.05,.82);
    outColor=vec4(film(c*1.34),alpha);return;
  }
  float coreMask=1.-sm(.030,.082,r);float violetHint=sat((uEmit.r-uEmit.g)*1.45);float ringMask=1.-coreMask;float pulse=1.+energy*.56+surge*.70+speech*.16+uHeart*.70;
  vec3 cyanRing=vec3(.018,.42,.94)*pulse,violetRing=vec3(.38,.025,.84)*pulse;vec3 ringColor=mix(cyanRing,violetRing,violetHint);ringColor+=mix(vec3(.06,.62,1.08),vec3(.54,.08,.98),violetHint)*fres*(.18+.20*energy);
  float coreHalo=exp(-r*23.0);vec3 coreColor=mix(vec3(.12,.72,1.12),vec3(1.22,1.32,1.34),sm(.10,.94,coreMask));coreColor*=1.20+energy*.64+surge*.80+speech*.16+uHeart*.78;coreColor+=vec3(.20,.86,1.22)*coreHalo*.52;
  vec3 c=mix(ringColor,coreColor,coreMask);float alpha=clamp(uAlpha*(.45+.14*fres+.070*energy)*ringMask+coreMask*(.84+.14*energy),0.,.98);outColor=vec4(film(c*1.06),alpha);
}`;
function patchedShaderSource(shader,source){if(!patched&&typeof source==='string'&&source.includes('uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech')&&source.includes('float drive=.72+uEnergy*.66')){patched=true;source=FS;root.dataset.fxCoreMeshMaterial='reference-glass-v19';root.dataset.fxCoreMeshMaterialPatch='applied-v19';root.dataset.fxCoreMaterialCenter='object-space-y-minus-0.18';root.dataset.fxCoreHighlightModel='broad-high-dynamic-facets-v19';queueMicrotask(()=>{if(C.prototype.shaderSource===patchedShaderSource)C.prototype.shaderSource=original;});}return original.call(this,shader,source);}
C.prototype.shaderSource=patchedShaderSource;root.dataset.fxCoreMeshMaterial='installed-v19';
}());