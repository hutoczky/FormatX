'use strict';
// Build the actual bundled Three meshes and compare their optical anatomy
// with the permanent renderer's authored geometry. No GPU/FPS certificate.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const crypto=require('node:crypto'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
 const source=fs.readFileSync(process.argv[2]||'docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
 const native=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
 const profileMatch=native.match(/const opticProfile=\[([\s\S]*?)\n    \];/);assert(profileMatch);
 const profile=Array.from(profileMatch[1].matchAll(/\[([.\d]+),([.\d]+)\]/g),m=>m.slice(1).map(Number));
 const lens=native.match(/const opticalCentreZ=magSkinZ\(0,0\)-([.\d]+);\s*appendEllipsoid\(\[0,0,opticalCentreZ\],\[([.\d]+),([.\d]+),([.\d]+)\]/);assert(lens);
 const socket=native.match(/const opticalSocketZ=magSkinZ\(0,0\)-([.\d]+);/);assert(socket);
 const depthOffset=Number(lens[1])-Number(socket[1]),radii=lens.slice(2).map(Number);
 const irisStart=native.indexOf('for(let j=0;j<8;j++){',profileMatch.index);
 const iris=native.slice(irisStart,native.indexOf('// R2179: true curved',irisStart));
 const irisAngle=Number(iris.match(/const angle=j\*Math.PI\/4\+([.\d]+);/)?.[1]);
 const irisPoints=Array.from(iris.matchAll(/opticPoint\(([.\d]+),angle(?:\+([.\d]+))?,([.\d]+)\)/g),m=>[Number(m[1]),Number(m[2]||0),Number(m[3])]);
 assert.equal(irisPoints.length,4);assert(Number.isFinite(irisAngle));
 const T=await import(pathToFileURL(path.resolve('docs/scifi-ui/scripts/three-r185.module.js')).href);
 const make=(text,mobileRender)=>{
  const start=text.indexOf('  const clamp ='),end=text.indexOf('  function isSoftwareWebGL(){');assert(start>0&&end>start);
  const K=vm.runInNewContext('(function(){'+text.slice(start,end)+';return FormatXGenesisThree;})()', {document:{documentElement:{dataset:{}}},console});
  const engine=Object.create(K.prototype);Object.assign(engine,{THREE:T,mobileRender,mechanicalGroup:new T.Group(),microFiberTexture:new T.Texture()});
  // Only the unrelated generated bitmap is a fixture; meshes/materials and
  // their real constructor method are the product implementation.
  engine.makeIrisTexture=()=>new T.Texture();engine.makeMechanicalLayer();return engine;
 };
 const geometryHash=(engine,excluded)=>{const hash=crypto.createHash('sha256');engine.mechanicalGroup.traverse(node=>{
  if(!node.geometry||excluded.has(node))return;
  for(const name of Object.keys(node.geometry.attributes).sort()){const a=node.geometry.attributes[name].array;hash.update(name);hash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));}
  if(node.geometry.index){const a=node.geometry.index.array;hash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));}
 });return hash.digest('hex');};
 const rows=[];
 for(const mobileRender of [true,false]){
  const engine=make(source,mobileRender),eye=engine.mechEyeCore,p=eye.geometry.attributes.position;
  const actualRadii=[0,0,0];for(let i=0;i<p.count;i++)for(let c=0;c<3;c++)actualRadii[c]=Math.max(actualRadii[c],Math.abs(p.getComponent(i,c)*eye.scale.getComponent(c)));
  actualRadii.forEach((r,i)=>assert(Math.abs(r-radii[i])<2e-8,'The cinematic lens still differs from the permanent radial/axial anatomy'));
  const bands=[['mechOpticSocket',[0,5,6]],['mechOpticRim',[1,2,3,4]]];let maximumProfileError=0,maximumNormalError=0,triangles=0;
  for(const [name,indices]of bands){const mesh=engine[name],g=mesh.geometry,a=g.attributes.position,n=g.attributes.normal;
   assert.equal(a.count,indices.length*48*6,'Only the native profile bands may occupy the existing socket/rim meshes');
   for(let i=0;i<a.count;i++){
    const band=indices[Math.floor(i/(48*6))],[r0,z0]=profile[band],[r1,z1]=profile[band+1];
    const x=a.getX(i),y=a.getY(i),radius=Math.hypot(x,y),depth=a.getZ(i)+mesh.position.z-eye.position.z;
    const error=Math.min(Math.hypot(radius-r0,depth-(z0+depthOffset)),Math.hypot(radius-r1,depth-(z1+depthOffset)));
    maximumProfileError=Math.max(maximumProfileError,error);assert(error<4e-8,'Cinematic bezel vertex differs from native lathed profile');
    const dr=r1-r0,dz=z1-z0,length=Math.hypot(dr,dz);
    const expected=new T.Vector3(-dz*x/radius/length,-dz*y/radius/length,dr/length);
    const normal=new T.Vector3().fromBufferAttribute(n,i);const normalError=normal.distanceTo(expected);
    maximumNormalError=Math.max(maximumNormalError,normalError);assert(normalError<1e-7,'Use native radial slope normals');
   }
   for(let i=0;i<a.count;i+=3){const v0=new T.Vector3().fromBufferAttribute(a,i),v1=new T.Vector3().fromBufferAttribute(a,i+1),v2=new T.Vector3().fromBufferAttribute(a,i+2);
    const face=v1.sub(v0).cross(v2.sub(v0));assert(face.dot(new T.Vector3().fromBufferAttribute(n,i))>0,'A bezel triangle is reversed or degenerate');triangles++;}
  }
  const shutter=engine.mechOpticShutters.geometry.attributes.position;assert.equal(shutter.count,48);
  const order=[0,1,2,0,2,3];for(let blade=0;blade<8;blade++)for(let i=0;i<6;i++){
   const [radius,offset,depth]=irisPoints[order[i]],angle=blade*Math.PI/4+irisAngle+offset;
   const expected=new T.Vector3(radius*Math.cos(angle),eye.position.y+radius*Math.sin(angle),eye.position.z+depthOffset+depth);
   assert(expected.distanceTo(new T.Vector3().fromBufferAttribute(shutter,blade*6+i))<4e-8,'The iris must seat beneath the same curved lens');
  }
  if(process.argv[3]){const control=make(fs.readFileSync(process.argv[3],'utf8'),mobileRender);assert.equal(engine.mechanicalGroup.children.length,control.mechanicalGroup.children.length,'Do not add an optical rendering object');
   const omit=e=>new Set([e.mechOpticSocket,e.mechOpticRim,e.mechOpticShutters]);assert.equal(geometryHash(engine,omit(engine)),geometryHash(control,omit(control)),'Non-optical geometry changed');}
  rows.push({mobileRender,actualRadii,maximumProfileError,maximumNormalError,bezelTriangles:triangles,shutterVertices:shutter.count,originalSphereTopology:{positions:p.count,indices:eye.geometry.index.count},children:engine.mechanicalGroup.children.length});
 }
 console.log('MAG_OPTICAL_ANATOMY_R2217_PASS',JSON.stringify({three:T.REVISION,nativeProfile:profile,lensRadii:radii,depthOffset,actualSceneBuilder:true,notBrowserHardwareOrFpsCertification:true,rows}));
})().catch(error=>{console.error(error);process.exitCode=1;});
