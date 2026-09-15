(function(){'use strict';
const root=document.documentElement;if(root.dataset.fxCoreMeshMaterial==='installed-v27')return;const C=window.WebGL2RenderingContext;if(!C||!C.prototype)return;const original=C.prototype.shaderSource;let patched=false;
const FS=`#version 300 es
precision highp float;
in vec3 vN,vP;out vec4 outColor;
uniform vec3 uCamera,uBase,uEmit;
uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech;
float sat(float x){return clamp(x,0.,1.);}float sm(float a,float b,float x){return smoothstep(a,b,x);}vec3 film(vec3 x){x=max(x,vec3(0.));vec3 y=1.-exp(-x);return pow(y,vec3(.91));}
void main(){vec3 sn=normalize(vN),v=normalize(uCamera-vP),fn=normalize(cross(dFdx(vP),dFdy(vP)));if(dot(fn,v)<0.)fn=-fn;vec3 n=normalize(mix(fn,sn,.22));float fres=pow(1.-sat(dot(n,v)),1.45),energy=sat(uEnergy),surge=sat(uSurge),speech=sat(uSpeech);vec2 cp=vec2(vP.x,vP.y-.18);float x=abs(cp.x),y=abs(cp.y),r=length(cp),a=atan(cp.y,cp.x);
if(uMode>1.5){float orbital=.5+.5*sin(a*4.+uTime*(.34+.30*energy));float spark=pow(.5+.5*cos(a*8.-uTime*(.72+.72*energy)),20.);vec3 c=mix(vec3(.02,.82,1.72),vec3(.72,.04,1.44),sat(.44+.42*sin(a*2.+uTime*.08)))*(1.10+.62*energy+.54*surge);c+=vec3(.10,1.50,2.46)*orbital*.18+vec3(.80,.18,1.72)*spark*(.18+.40*surge);outColor=vec4(film(c*1.12),clamp(uAlpha*(.58+.10*energy)+spark*.10,0.,.84));return;}
if(uMode<.5){
 float body=exp(-r*2.15)*(1.-sat(abs(vP.z)*1.55));float inner=exp(-r*4.55);
 float hAxis=exp(-y*23.)*(1.-sm(.88,1.08,r));float vAxis=exp(-x*27.)*(1.-sm(.88,1.08,r));float axis=sat(hAxis+vAxis);
 float diamond=x+y*.93;float shell1=exp(-abs(diamond-.34)*20.);float shell2=exp(-abs(diamond-.53)*18.);float shell3=exp(-abs(diamond-.72)*16.);float shell=sat(shell1*.72+shell2*.62+shell3*.44)*(1.-sm(.94,1.10,r));
 float diag1=exp(-abs(cp.x-cp.y*.94)*17.);float diag2=exp(-abs(cp.x+cp.y*.94)*17.);float diag=sat(diag1+diag2)*sm(.12,.88,r)*(1.-sm(.92,1.08,r));
 float ring1=exp(-abs(r-.205)*34.);float ring2=exp(-abs(r-.300)*30.);float ring3=exp(-abs(r-.405)*26.);float rings=sat(ring1+ring2*.76+ring3*.50)*(1.-sm(.72,.90,r));
 float four=.5+.5*cos(a*4.);float starRing=exp(-abs(r-(.36+.055*four))*28.)*sm(.10,.75,r);
 float purpleArc=pow(.5+.5*cos(a*4.+r*8.5-uTime*.075),18.)*sm(.22,.70,r)*(1.-sm(.78,.94,r));
 float node=pow(.5+.5*cos(a*8.+r*15.-uTime*.10),26.)*sat(rings+shell*.70+diag*.40);
 vec3 L1=normalize(vec3(-.46,.80,.39)),L2=normalize(vec3(.62,.30,.72));float spec=max(pow(sat(dot(reflect(-L1,n),v)),28.),pow(sat(dot(reflect(-L2,n),v)),30.));
 float caustic=pow(.5+.5*sin(cp.y*15.+cp.x*8.+vP.z*12.-uTime*(.09+.12*energy)),13.);
 vec3 c=vec3(.003,.022,.054);c+=vec3(.010,.13,.29)*body*.28+vec3(.014,.31,.70)*inner*(.10+.15*energy);
 c+=vec3(.02,1.80,3.55)*axis*(.76+.58*energy+.20*surge);
 c+=vec3(.06,1.48,2.92)*shell*(.60+.48*energy+.16*surge);
 c+=vec3(.10,1.56,3.02)*diag*(.52+.44*energy+.14*surge);
 c+=mix(vec3(.04,1.82,3.48),vec3(.82,.08,1.96),sat(.36+.44*sin(a*2.+uTime*.05)))*rings*(.78+.62*energy+.18*surge);
 c+=mix(vec3(.08,1.52,3.08),vec3(1.02,.06,2.18),sat(.48+.45*sin(a*4.-uTime*.06)))*starRing*(.58+.48*energy+.18*surge);
 c+=vec3(1.14,.04,2.62)*purpleArc*(.58+.58*energy+.60*surge);
 c+=vec3(.72,2.18,3.48)*node*(.80+.72*energy+.42*surge);
 c+=vec3(.04,1.10,2.16)*caustic*(.10+.18*energy);
 c+=vec3(.08,1.28,2.44)*fres*(.48+.40*energy+.15*surge);
 c+=vec3(.90,1.72,2.10)*spec*(1.52+1.04*energy+.34*surge);c+=uEmit*(.020+.046*uHeart+.036*energy+.040*surge);
 float alphaBase=uAlpha*(.265+.215*fres+.034*body+.032*energy)+.013*fres;float emissiveAlpha=.18*axis+.14*shell+.10*diag+.18*rings+.12*starRing+.10*purpleArc+.18*node+.30*spec;float alpha=clamp(alphaBase+emissiveAlpha,.032,.92);outColor=vec4(film(c*1.42),alpha);return;}
 float core=1.-sm(.018,.058,r),vh=sat((uEmit.r-uEmit.g)*1.45),rm=1.-core,pulse=1.+energy*.64+surge*.86+speech*.20+uHeart*.84;float ringA=exp(-abs(r-.105)*40.),ringB=exp(-abs(r-.175)*34.),ringC=exp(-abs(r-.255)*28.);float ringEnergy=sat(ringA+ringB*.82+ringC*.60);vec3 cr=mix(vec3(.02,.88,1.92),vec3(.82,.03,1.66),vh)*pulse;cr+=mix(vec3(.03,1.42,2.68),vec3(1.18,.04,2.36),vh)*ringEnergy*(.58+.46*energy+.18*surge);cr+=mix(vec3(.04,1.22,2.30),vec3(.92,.04,1.94),vh)*fres*(.28+.26*energy);float halo=exp(-r*30.);vec3 cc=mix(vec3(.12,1.38,2.30),vec3(1.52,1.58,1.60),sm(.12,.96,core));cc*=1.62+energy*.88+surge*1.08+speech*.22+uHeart*.98;cc+=vec3(.10,1.72,2.74)*halo*.86;vec3 c=mix(cr,cc,core);float alpha=clamp(uAlpha*(.50+.16*fres+.075*energy)*rm+ringEnergy*.22+core*(.95+.05*energy),0.,1.);outColor=vec4(film(c*1.24),alpha);}`;
function patchedShaderSource(shader,source){if(!patched&&typeof source==='string'&&source.includes('uniform float uAlpha,uTime,uHeart,uMode,uEnergy,uSurge,uSpeech')&&source.includes('float drive=.72+uEnergy*.66')){patched=true;source=FS;root.dataset.fxCoreMeshMaterial='reference-glass-v27';root.dataset.fxCoreMeshMaterialPatch='applied-v27';root.dataset.fxCoreMaterialCenter='object-space-y-minus-0.18';root.dataset.fxCoreHighlightModel='structured-crystal-energy-v27';root.dataset.fxCoreHighlightCoverage='axis-diamond-rings-orbits-v27';queueMicrotask(()=>{if(C.prototype.shaderSource===patchedShaderSource)C.prototype.shaderSource=original;});}return original.call(this,shader,source);}C.prototype.shaderSource=patchedShaderSource;root.dataset.fxCoreMeshMaterial='installed-v27';}());