'use strict';
/* R2357 — execute the REAL authored titanium Shape path rather than
   trusting a comment or introducing a fake screenshot/overlay.
   Physical Chromium PNG, original P0 and device FPS remain release gates. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const start=src.indexOf('      const inlayProfile=new T.Shape();');
const end=src.indexOf('      const inlayGeometry=new T.ExtrudeGeometry(inlayProfile,{',start);
assert(start>0&&end>start,'Original physical titanium inlay Shape is missing');
const block=src.slice(start,end);
class Shape{
  constructor(){this.commands=[];}
  moveTo(x,y){this.commands.push(['M',x,y]);}
  lineTo(x,y){this.commands.push(['L',x,y]);}
  bezierCurveTo(x1,y1,x2,y2,x3,y3){
    this.commands.push(['C',x1,y1,x2,y2,x3,y3]);
  }
}
const profile=new Function('T',block+'\nreturn inlayProfile;')({Shape});
assert.deepEqual(profile.commands.map(x=>x[0]),['M','C','L','C','C'],
  'Keep the original five-command topology (no extra tessellation path)');
const points=[];
let previous=profile.commands[0].slice(1);
points.push(previous);
for(const cmd of profile.commands.slice(1)){
  if(cmd[0]==='L'){
    previous=cmd.slice(1);points.push(previous);continue;
  }
  const origin=previous;
  for(let k=1;k<=36;k++){
    const t=k/36,u=1-t;
    previous=[0,1].map(axis=>
      u*u*u*origin[axis]+3*u*u*t*cmd[1+axis]+
      3*u*t*t*cmd[3+axis]+t*t*t*cmd[5+axis]);
    points.push(previous);
  }
}
const minX=Math.min(...points.map(x=>x[0]));
const maxX=Math.max(...points.map(x=>x[0]));
const minY=Math.min(...points.map(x=>x[1]));
const maxY=Math.max(...points.map(x=>x[1]));
const polygonArea=Math.abs(points.reduce((sum,p,i)=>{
  const q=points[(i+1)%points.length];
  return sum+p[0]*q[1]-q[0]*p[1];
},0)/2);
assert(minX>-.075&&maxX<.075,'Inlay must be a narrow machined spear, not an oval badge');
assert(minY>.23&&maxY>=.90&&maxY<=.92,'Spear must retain real arm length');
assert(polygonArea>.06&&polygonArea<.08,'No inverted or collapsed physical profile');
assert(src.includes('Math.abs(cx)/.10'),'Dome width must match the narrower profile');
assert(src.includes('const crown=.012*cross*axial;'),'Keep true vertex-relief crown');
assert(src.includes('engraving.position.set(0,.045,-.101);'),
  'Engraving must be seated near the actual crown, not floating');
for(const token of [
 'plate.scale.set(.82,.84,1);',
 'plate.position.set(0,.045,.270);',
 'const plate=new T.Mesh(inlayGeometry,this.armInlayMaterial);',
 'this.armInlays.push(arm);',
 'this.updateDNA(t,time);',
 'this.updateOrganic(t,time);',
 'this.updateMechanical(t,time);',
 'const count=this.mobileRender?6000:9600;'
])assert(src.includes(token),'MAG/GENESIS original contract lost: '+token);
console.log('MAG_R2357_SCULPTED_REAL_3D_SPEAR_INLAY_PASS',
 JSON.stringify({minX,maxX,minY,maxY,polygonArea,commands:profile.commands.length,
  fourOriginal3DMeshes:true,realChromiumAndMobilePerformanceReviewStillRequired:true}));
