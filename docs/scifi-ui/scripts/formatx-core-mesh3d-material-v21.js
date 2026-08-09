(function(){'use strict';
const root=document.documentElement;if(root.dataset.fxCoreMeshMaterial==='installed-v21')return;const C=window.WebGL2RenderingContext;if(!C||!C.prototype)return;const original=C.prototype.shaderSource;let patched=false;
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
  if(uMode>1.5){float shimmer=.88+.12*sin(uTime*(1.05+energy*.42)+cp.y*11.+cp.x*8.);float spark=pow(.5+.5*sin(cp.x*31.+cp.y*27.-uTime*(.8+energy*1.1)),23.);vec3 c=uEmit*(.72+energy*.48+surge*.46+speech*.12)*(1.+uHeart*.20)*shimmer+uBase*.10;c+=vec3(.28,1.06,1.56)*spark*(.10+.30*surge);outColor=vec4(film(c*.94),clamp(uAlpha*(.61+.08*energy)+spark*.06,0.,.80));return;}
  if(uMode<.5){
    float center=exp(-r*2.15)*(1.-sat(abs(vP.z)*1.55));float inner=exp(-r*4.5);
    vec3 L1=normalize(vec3(-.46,.78,.43)),L2=normalize(vec3(.62,.31,.72)),L3=normalize(vec3(-.22,-.64,.74)),L4=normalize(vec3(.48,-.54,.68));
    float f1=sat(dot(fn,L1)),f2=sat(dot(fn,L2)),f3=sat(dot(fn,L3)),f4=sat(dot(fn,L4));float face=max(max(f1,f2),max(f3,f4));
    float planeGlow=sm(.70,.90,face),planePeak=pow(face,8.0);
    float webA=pow(.5+.5*cos((cp.x+cp.y)*14.0+vP.z*7.0-uTime*.045),7.6);
    float webB=pow(.5+.5*cos((cp.x-cp.y)*15.2-vP.z*6.0+1.15+uTime*.035),8.1);
    float webC=pow(.5+.5*cos(a*8.0+r*13.0-uTime*(.05+.08*energy)),8.6);
    float webGate=sm(.06,.26,r)*(1.-sm(.90,1.10,r));float web=max(max(webA,webB),webC)*webGate;
    float hAxis=exp(-abs(cp.y)*19.0)*exp(-r*.52),vAxis=exp(-abs(cp.x)*21.0)*exp(-r*.54);float axis=sat(hAxis+vAxis);
    float ridgeA=exp(-abs(cp.x+cp.y*.92)*14.0),ridgeB=exp(-abs(cp.x-cp.y*.92)*14.0);float ridge=sat(ridgeA+ridgeB)*sm(.10,.96,r);
    float ringGlow=(exp(-abs(r-.26)*34.0)+exp(-abs(r-.39)*29.0)*.74+exp(-abs(r-.54)*25.0)*.50)*sm(.07,.90,r);
    float violet=pow(.5+.5*cos(cp.x*13.5+cp.y*17.0-vP.z*8.0+1.7+uTime*.055),20.0);
    float caustic=pow(.5+.5*sin(cp.y*16.0+cp.x*9.0+vP.z*12.5-uTime*(.10+.13*energy)),10.0);
    float spec1=pow(sat(dot(reflect(-L1,n),v)),24.0),spec2=pow(sat(dot(reflect(-L2,n),v)),26.0);float spec=max(spec1,spec2);
    float micro=pow(.5+.5*sin(cp.x*43.+cp.y*37.+vP.z*19.-uTime*.18),34.0)*webGate;
    float highlight=sat(max(max(planeGlow,web*.94),max(axis*.80,max(ridge*.72,max(ringGlow*.68,spec)))));
    vec3 c=vec3(.005,.032,.068)*(.72+face*.18);
    c+=vec3(.012,.15,.30)*center*.32+vec3(.020,.34,.68)*inner*(.12+.17*energy);
    c+=vec3(.10,.90,1.48)*caustic*(.09+.18*energy);
    c+=vec3(.68,.09,1.30)*violet*(.10+.22*energy+.22*surge);
    c+=vec3(.38,1.48,1.92)*web*(1.08+.90*energy+.26*surge);
    c+=vec3(.84,1.64,1.86)*planeGlow*(1.06+.86*energy+.22*surge);
    c+=vec3(1.36,1.76,1.88)*planePeak*(1.65+1.14*energy+.36*surge);
    c+=vec3(.28,1.30,1.86)*axis*(.70+.52*energy);
    c+=mix(vec3(.24,1.20,1.76),vec3(.78,.16,1.44),sat(.45+.42*sin(a*2.0+uTime*.07)))*ridge*(.58+.48*energy+.18*surge);
    c+=mix(vec3(.16,1.02,1.66),vec3(.62,.14,1.38),sat(.40+.42*sin(a*3.0+uTime*.06)))*ringGlow*(.50+.46*energy+.18*surge);
    c+=vec3(.20,1.20,1.96)*fres*(.54+.42*energy+.16*surge);
    c+=vec3(1.38,1.74,1.86)*spec*(2.10+1.30*energy+.48*surge);
    c+=vec3(1.08,1.56,1.78)*micro*(.70+.72*surge+.20*energy);
    c+=uEmit*(.034+.060*uHeart+.045*energy+.050*surge);
    float alphaBase=uAlpha*(.40+.30*fres+.055*center+.050*energy)+.030*fres;
    float alpha=clamp(alphaBase+uAlpha*(.13*planeGlow+.10*web+.055*axis+.045*ridge+.040*ringGlow+.080*spec+.035*micro),.05,.90);
    outColor=vec4(film(c*1.40),alpha);return;
  }
  float coreMask=1.-sm(.030,.080,r);float violetHint=sat((uEmit.r-uEmit.g)*1.45);float ringMask=1.-coreMask;float pulse=1.+energy*.58+surge*.76+speech*.18+uHeart*.74;
  vec3 cyanRing=vec3(.022,.48,1.04)*pulse,violetRing=vec3(.42,.028,.92)*pulse;vec3 ringColor=mix(cyanRing,violetRing,violetHint);ringColor+=mix(vec3(.08,.72,1.18),vec3(.60,.09,1.04),violetHint)*fres*(.24+.24*energy);
  float coreHalo=exp(-r*23.0);vec3 coreColor=mix(vec3(.14,.78,1.18),vec3(1.32,1.39,1.42),sm(.10,.94,coreMask));coreColor*=1.28+energy*.68+surge*.86+speech*.18+uHeart*.80;coreColor+=vec3(.24,.98,1.34)*coreHalo*.60;
  vec3 c=mix(ringColor,coreColor,coreMask);float alpha=clamp(uAlpha*(.48+.16*fres+.074*energy)*ringMask+coreMask*(.88+.12*energy),0.,1.);outColor=vec4(film(c*1.12),alpha);
}`;
function patchedShaderSource(shader,source){if(!patched&&typeof source==='string'&&source.includes('uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech')&&source.includes('float drive=.72+uEnergy*.66')){patched=true;source=FS;root.dataset.fxCoreMeshMaterial='reference-glass-v21';root.dataset.fxCoreMeshMaterialPatch='applied-v21';root.dataset.fxCoreMaterialCenter='object-space-y-minus-0.18';root.dataset.fxCoreHighlightModel='sparse-high-dynamic-facets-v21';root.dataset.fxCoreHighlightCoverage='thresholded-facet-web-axis-ring-v21';queueMicrotask(()=>{if(C.prototype.shaderSource===patchedShaderSource)C.prototype.shaderSource=original;});}return original.call(this,shader,source);}
C.prototype.shaderSource=patchedShaderSource;root.dataset.fxCoreMeshMaterial='installed-v21';
}());