(function(){'use strict';
const root=document.documentElement;if(root.dataset.fxCoreMeshMaterial==='installed-v20')return;const C=window.WebGL2RenderingContext;if(!C||!C.prototype)return;const original=C.prototype.shaderSource;let patched=false;
const FS=`#version 300 es
precision highp float;
in vec3 vN,vP;out vec4 outColor;
uniform vec3 uCamera,uBase,uEmit;
uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech;
float sat(float x){return clamp(x,0.,1.);}
float sm(float a,float b,float x){return smoothstep(a,b,x);}
vec3 film(vec3 x){x=max(x,vec3(0.));vec3 y=1.-exp(-x);return pow(y,vec3(.94));}
void main(){
  vec3 sn=normalize(vN),v=normalize(uCamera-vP),fn=normalize(cross(dFdx(vP),dFdy(vP)));if(dot(fn,v)<0.)fn=-fn;
  vec3 n=normalize(mix(fn,sn,.20));float ndv=sat(dot(n,v));float fres=pow(1.-ndv,1.34);float energy=sat(uEnergy),surge=sat(uSurge),speech=sat(uSpeech);
  vec2 cp=vec2(vP.x,vP.y-.18);float r=length(cp),a=atan(cp.y,cp.x);
  if(uMode>1.5){float shimmer=.86+.14*sin(uTime*(1.08+energy*.48)+cp.y*11.+cp.x*8.);float spark=pow(.5+.5*sin(cp.x*31.+cp.y*27.-uTime*(.85+energy*1.15)),18.);vec3 c=uEmit*(.82+energy*.56+surge*.58+speech*.16)*(1.+uHeart*.22)*shimmer+uBase*.12;c+=vec3(.42,1.26,1.62)*spark*(.12+.34*surge+.14*energy);outColor=vec4(film(c*1.02),clamp(uAlpha*(.68+.10*energy)+spark*.10,0.,.90));return;}
  if(uMode<.5){
    float center=exp(-r*2.10)*(1.-sat(abs(vP.z)*1.52));float inner=exp(-r*4.25);
    vec3 L1=normalize(vec3(-.46,.78,.43)),L2=normalize(vec3(.62,.31,.72)),L3=normalize(vec3(-.22,-.64,.74)),L4=normalize(vec3(.48,-.54,.68));
    float f1=sat(dot(fn,L1)),f2=sat(dot(fn,L2)),f3=sat(dot(fn,L3)),f4=sat(dot(fn,L4));
    float face=max(max(f1,f2),max(f3,f4));
    float planeGlow=sm(.34,.72,face);float planePeak=pow(face,6.0);
    float webA=pow(.5+.5*cos((cp.x+cp.y)*14.0+vP.z*7.0-uTime*.045),5.2);
    float webB=pow(.5+.5*cos((cp.x-cp.y)*15.2-vP.z*6.0+1.15+uTime*.035),5.8);
    float webC=pow(.5+.5*cos(a*8.0+r*13.0-uTime*(.05+.08*energy)),6.4);
    float webGate=sm(.055,.23,r)*(1.-sm(.91,1.11,r));float web=sat((webA+webB)*.74+webC*.42)*webGate;
    float hAxis=exp(-abs(cp.y)*11.0)*exp(-r*.42),vAxis=exp(-abs(cp.x)*14.0)*exp(-r*.46);float axis=sat(hAxis+vAxis);
    float ridgeA=exp(-abs(cp.x+cp.y*.92)*8.6),ridgeB=exp(-abs(cp.x-cp.y*.92)*8.6);float ridge=sat(ridgeA+ridgeB)*sm(.10,.96,r);
    float ringGlow=(exp(-abs(r-.26)*18.0)+exp(-abs(r-.39)*15.0)*.76+exp(-abs(r-.54)*13.0)*.52)*sm(.07,.90,r);
    float violet=pow(.5+.5*cos(cp.x*13.5+cp.y*17.0-vP.z*8.0+1.7+uTime*.055),15.0);
    float caustic=pow(.5+.5*sin(cp.y*16.0+cp.x*9.0+vP.z*12.5-uTime*(.10+.13*energy)),7.5);
    float spec1=pow(sat(dot(reflect(-L1,n),v)),18.0),spec2=pow(sat(dot(reflect(-L2,n),v)),20.0);float spec=max(spec1,spec2);
    float micro=pow(.5+.5*sin(cp.x*43.+cp.y*37.+vP.z*19.-uTime*.18),26.0)*webGate;
    float highlight=sat(planeGlow*.76+web*.74+axis*.38+ridge*.34+ringGlow*.26+spec*1.10+micro*.40);
    vec3 c=vec3(.004,.027,.058)*(1.+face*.12);
    c+=vec3(.010,.13,.28)*center*.28+vec3(.018,.31,.64)*inner*(.10+.16*energy);
    c+=vec3(.12,.96,1.46)*caustic*(.12+.23*energy);
    c+=vec3(.66,.10,1.28)*violet*(.12+.25*energy+.22*surge);
    c+=vec3(.42,1.52,1.88)*web*(.94+.82*energy+.18*surge);
    c+=vec3(.78,1.58,1.82)*planeGlow*(.66+.58*energy);
    c+=vec3(1.20,1.62,1.78)*planePeak*(1.16+.90*energy+.20*surge);
    c+=vec3(.32,1.34,1.82)*axis*(.54+.42*energy);
    c+=vec3(.42,1.28,1.72)*ridge*(.38+.34*energy);
    c+=mix(vec3(.12,.90,1.54),vec3(.58,.16,1.30),sat(.35+.45*sin(a*3.0+uTime*.06)))*ringGlow*(.32+.34*energy);
    c+=vec3(.22,1.30,2.02)*fres*(.68+.48*energy+.18*surge);
    c+=vec3(1.30,1.70,1.82)*spec*(1.72+1.08*energy+.38*surge);
    c+=vec3(1.08,1.58,1.78)*micro*(.66+.62*surge+.22*energy);
    c+=uEmit*(.030+.058*uHeart+.043*energy+.050*surge);
    float layerWeight=sat(uAlpha*1.28);float alphaBase=uAlpha*(.39+.31*fres+.052*center+.050*energy);
    float alpha=clamp(alphaBase+layerWeight*(.24*planeGlow+.18*web+.11*axis+.10*ridge+.14*spec+.07*micro)+.024*fres,.045,.96);
    outColor=vec4(film(c*1.30),alpha);return;
  }
  float coreMask=1.-sm(.028,.080,r);float violetHint=sat((uEmit.r-uEmit.g)*1.45);float ringMask=1.-coreMask;float pulse=1.+energy*.60+surge*.78+speech*.18+uHeart*.74;
  vec3 cyanRing=vec3(.025,.50,1.08)*pulse,violetRing=vec3(.44,.030,.94)*pulse;vec3 ringColor=mix(cyanRing,violetRing,violetHint);ringColor+=mix(vec3(.10,.78,1.22),vec3(.64,.10,1.08),violetHint)*fres*(.28+.26*energy);
  float coreHalo=exp(-r*22.0);vec3 coreColor=mix(vec3(.16,.82,1.24),vec3(1.34,1.40,1.42),sm(.08,.92,coreMask));coreColor*=1.30+energy*.70+surge*.88+speech*.18+uHeart*.82;coreColor+=vec3(.28,1.04,1.38)*coreHalo*.64;
  vec3 c=mix(ringColor,coreColor,coreMask);float alpha=clamp(uAlpha*(.50+.18*fres+.076*energy)*ringMask+coreMask*(.90+.10*energy),0.,1.);outColor=vec4(film(c*1.14),alpha);
}`;
function patchedShaderSource(shader,source){if(!patched&&typeof source==='string'&&source.includes('uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech')&&source.includes('float drive=.72+uEnergy*.66')){patched=true;source=FS;root.dataset.fxCoreMeshMaterial='reference-glass-v20';root.dataset.fxCoreMeshMaterialPatch='applied-v20';root.dataset.fxCoreMaterialCenter='object-space-y-minus-0.18';root.dataset.fxCoreHighlightModel='distributed-high-dynamic-facets-v20';root.dataset.fxCoreHighlightCoverage='facet-web-axis-ring-distribution-v20';queueMicrotask(()=>{if(C.prototype.shaderSource===patchedShaderSource)C.prototype.shaderSource=original;});}return original.call(this,shader,source);}
C.prototype.shaderSource=patchedShaderSource;root.dataset.fxCoreMeshMaterial='installed-v20';
}());