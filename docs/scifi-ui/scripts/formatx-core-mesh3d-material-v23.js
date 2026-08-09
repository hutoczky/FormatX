(function(){'use strict';
const root=document.documentElement;if(root.dataset.fxCoreMeshMaterial==='installed-v23')return;const C=window.WebGL2RenderingContext;if(!C||!C.prototype)return;const original=C.prototype.shaderSource;let patched=false;
const FS=`#version 300 es
precision highp float;
in vec3 vN,vP;out vec4 outColor;
uniform vec3 uCamera,uBase,uEmit;
uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech;
float sat(float x){return clamp(x,0.,1.);}
float sm(float a,float b,float x){return smoothstep(a,b,x);}
vec3 film(vec3 x){x=max(x,vec3(0.));vec3 y=1.-exp(-x);return pow(y,vec3(.91));}
void main(){
 vec3 sn=normalize(vN),v=normalize(uCamera-vP),fn=normalize(cross(dFdx(vP),dFdy(vP)));if(dot(fn,v)<0.)fn=-fn;vec3 n=normalize(mix(fn,sn,.20));
 float ndv=sat(dot(n,v)),fres=pow(1.-ndv,1.42),energy=sat(uEnergy),surge=sat(uSurge),speech=sat(uSpeech);vec2 cp=vec2(vP.x,vP.y-.18);float r=length(cp),a=atan(cp.y,cp.x);
 if(uMode>1.5){float shimmer=.88+.12*sin(uTime*(1.08+energy*.42)+cp.y*11.+cp.x*8.);float spark=pow(.5+.5*sin(cp.x*31.+cp.y*27.-uTime*(.82+energy*1.1)),24.);vec3 c=uEmit*(.72+energy*.50+surge*.48+speech*.13)*(1.+uHeart*.21)*shimmer+uBase*.10;c+=vec3(.26,1.10,1.62)*spark*(.10+.32*surge);outColor=vec4(film(c*.96),clamp(uAlpha*(.61+.08*energy)+spark*.06,0.,.80));return;}
 if(uMode<.5){
   float center=exp(-r*2.20)*(1.-sat(abs(vP.z)*1.58)),inner=exp(-r*4.65);
   float lineA=1.-sm(.045,.115,abs(sin((cp.x+cp.y)*11.4+vP.z*5.4-uTime*.040)));
   float lineB=1.-sm(.045,.115,abs(sin((cp.x-cp.y)*12.2-vP.z*5.0+1.10+uTime*.034)));
   float radialLine=1.-sm(.040,.105,abs(sin(a*6.0+r*11.6-vP.z*4.2-uTime*(.045+.055*energy))));
   float gate=sm(.10,.27,r)*(1.-sm(.86,1.08,r));
   lineA*=gate;lineB*=gate;radialLine*=gate*(1.-sm(.68,.94,r));
   float web=max(max(lineA,lineB),radialLine*.92);
   float hAxis=exp(-abs(cp.y)*25.0)*exp(-r*.60),vAxis=exp(-abs(cp.x)*28.0)*exp(-r*.64),axis=sat(hAxis+vAxis);
   float ridgeA=exp(-abs(cp.x+cp.y*.92)*18.0),ridgeB=exp(-abs(cp.x-cp.y*.92)*18.0),ridge=sat(ridgeA+ridgeB)*sm(.11,.93,r);
   float ringGlow=(exp(-abs(r-.255)*42.0)+exp(-abs(r-.385)*36.0)*.78+exp(-abs(r-.515)*31.0)*.54)*sm(.07,.86,r);
   float node=pow(.5+.5*cos(cp.x*17.0+cp.y*21.0-vP.z*9.0+1.45+uTime*.065),28.0)*web;
   float violetNode=pow(.5+.5*cos(cp.x*13.0-cp.y*18.0+vP.z*8.0+2.2-uTime*.052),30.0)*gate;
   float caustic=pow(.5+.5*sin(cp.y*16.0+cp.x*9.0+vP.z*12.5-uTime*(.10+.13*energy)),13.0);
   vec3 L1=normalize(vec3(-.42,.82,.42)),L2=normalize(vec3(.58,.36,.73));float spec=max(pow(sat(dot(reflect(-L1,n),v)),30.0),pow(sat(dot(reflect(-L2,n),v)),34.0));
   float facetEdge=pow(1.-abs(dot(fn,sn)),4.0)*sm(.10,.92,r);
   vec3 c=vec3(.0035,.024,.056)*(1.+.12*center);
   c+=vec3(.010,.13,.29)*center*.30+vec3(.014,.30,.66)*inner*(.10+.16*energy);
   c+=vec3(.16,1.48,2.50)*web*(1.18+.82*energy+.30*surge);
   c+=vec3(.42,1.78,2.66)*axis*(.72+.58*energy+.20*surge);
   c+=mix(vec3(.18,1.38,2.30),vec3(.94,.18,1.78),sat(.45+.44*sin(a*2.0+uTime*.06)))*ridge*(.62+.54*energy+.18*surge);
   c+=mix(vec3(.16,1.22,2.10),vec3(.78,.14,1.62),sat(.42+.46*sin(a*3.0-uTime*.05)))*ringGlow*(.60+.52*energy+.20*surge);
   c+=vec3(.70,.10,1.62)*violetNode*(.92+.78*energy+.70*surge);
   c+=vec3(1.22,1.78,1.94)*node*(1.18+.92*energy+.58*surge);
   c+=vec3(.10,1.08,1.92)*caustic*(.10+.20*energy);
   c+=vec3(.22,1.32,2.24)*fres*(.50+.42*energy+.16*surge);
   c+=vec3(1.38,1.82,1.98)*spec*(2.20+1.22*energy+.46*surge);
   c+=vec3(.54,1.46,1.96)*facetEdge*(.38+.32*energy);
   c+=uEmit*(.025+.050*uHeart+.040*energy+.044*surge);
   float highlight=sat(max(web,max(axis*.84,max(ridge*.74,max(ringGlow*.70,max(node,spec))))));
   float alphaBase=uAlpha*(.34+.27*fres+.045*center+.042*energy)+.020*fres;
   float alpha=clamp(alphaBase+uAlpha*(.17*web+.08*axis+.065*ridge+.055*ringGlow+.10*node+.10*spec),.038,.88);
   outColor=vec4(film(c*1.36),alpha);return;
 }
 float coreMask=1.-sm(.026,.078,r),violetHint=sat((uEmit.r-uEmit.g)*1.45),ringMask=1.-coreMask,pulse=1.+energy*.62+surge*.82+speech*.20+uHeart*.80;
 vec3 cyanRing=vec3(.026,.62,1.34)*pulse,violetRing=vec3(.56,.035,1.14)*pulse,ringColor=mix(cyanRing,violetRing,violetHint);ringColor+=mix(vec3(.12,.96,1.62),vec3(.78,.12,1.40),violetHint)*fres*(.30+.28*energy);
 float coreHalo=exp(-r*24.0);vec3 coreColor=mix(vec3(.18,.98,1.54),vec3(1.40,1.48,1.50),sm(.08,.94,coreMask));coreColor*=1.42+energy*.78+surge*.96+speech*.20+uHeart*.90;coreColor+=vec3(.34,1.28,1.72)*coreHalo*.76;
 vec3 c=mix(ringColor,coreColor,coreMask);float alpha=clamp(uAlpha*(.52+.18*fres+.080*energy)*ringMask+coreMask*(.92+.08*energy),0.,1.);outColor=vec4(film(c*1.18),alpha);
}`;
function patchedShaderSource(shader,source){if(!patched&&typeof source==='string'&&source.includes('uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech')&&source.includes('float drive=.72+uEnergy*.66')){patched=true;source=FS;root.dataset.fxCoreMeshMaterial='reference-glass-v23';root.dataset.fxCoreMeshMaterialPatch='applied-v23';root.dataset.fxCoreMaterialCenter='object-space-y-minus-0.18';root.dataset.fxCoreHighlightModel='reference-energy-network-v23';root.dataset.fxCoreHighlightCoverage='controlled-10-20pct-network-v23';queueMicrotask(()=>{if(C.prototype.shaderSource===patchedShaderSource)C.prototype.shaderSource=original;});}return original.call(this,shader,source);}
C.prototype.shaderSource=patchedShaderSource;root.dataset.fxCoreMeshMaterial='installed-v23';
}());