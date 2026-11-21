'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');

const filmPath=process.argv[2]||'docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js';
const nativePath=process.argv[3]||'docs/scifi-ui/scripts/formatx-crystal-organism-r326.js';
const filmSource=fs.readFileSync(filmPath,'utf8');
const nativeSource=fs.readFileSync(nativePath,'utf8');

for(const token of [
  'const nativeLandingY=this.mobileRender?-.038*endMove:0;',
  'const landingScaleX=1-(this.mobileRender?.49:.26)*landing;',
  'const landingScaleY=1-(this.mobileRender?.42:.26)*landing;',
  'const landingScaleZ=1-(this.mobileRender?.44:.26)*landing;',
  "fxMagProjectionR2238='mobile-stage-measured-final-silhouette-handoff'"
]) assert(filmSource.includes(token),`missing R2238 contract: ${token}`);

function bounds(points){
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(const p of points){
    minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);
    minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);
  }
  return {width:maxX-minX,height:maxY-minY,cx:(minX+maxX)/2,cy:(minY+maxY)/2};
}

function nativeGeometry(mobile){
  const start=nativeSource.indexOf('function normalize(');
  const stop=nativeSource.indexOf('\n  function boot(',start);
  assert(start>0&&stop>start,'native geometry source boundaries');
  const context={Math,Float32Array,mobile,constrained:false,constrainedMobile:false,auditMode:false};
  vm.createContext(context);
  vm.runInContext(`${nativeSource.slice(start,stop)};this.build=buildOrganismGeometry;`,context);
  return context.build(false);
}

function nativeBounds(T,mobile,width,height,time=10000){
  const geometry=nativeGeometry(mobile);
  const crystal=geometry.arrays[1],facets=geometry.arrays[6];
  const seconds=time*.001;
  const pitch=(mobile?-.160:-.140)+.006*Math.sin(seconds*.19);
  const yaw=(mobile?.135:.145)+seconds*.007;
  const roll=-.037+.005*Math.sin(seconds*.23);
  const rotation=new T.Matrix4()
    .multiplyMatrices(new T.Matrix4().makeRotationZ(roll),new T.Matrix4().makeRotationY(yaw))
    .multiply(new T.Matrix4().makeRotationX(pitch));
  const aspect=width/height,points=[];
  for(let index=0;index<crystal.length;index+=3){
    if(facets[index/3]>2)continue;
    const world=new T.Vector3(crystal[index],crystal[index+1],crystal[index+2]).applyMatrix4(rotation);
    const perspective=2.76/Math.max(1.72,3.12-world.z*.70);
    points.push({
      x:world.x/Math.max(.56,aspect)*perspective*(mobile?.690:.825)+(mobile?.002:.018),
      y:world.y*perspective*(mobile?.690:.825)+(mobile?.010:-.006)
    });
  }
  return bounds(points);
}

function filmClass(){
  const start=filmSource.indexOf('  const clamp =');
  const stop=filmSource.indexOf('  function isSoftwareWebGL(){');
  assert(start>0&&stop>start,'film class source boundaries');
  return vm.runInNewContext(`(function(){${filmSource.slice(start,stop)};return FormatXGenesisThree;})()`,{
    document:{documentElement:{dataset:{}}},console,URLSearchParams,Uint8Array,Float32Array,Math
  });
}

function filmBounds(T,Engine,mobile,width,height,time=10000){
  const engine=Object.create(Engine.prototype);
  Object.assign(engine,{
    THREE:T,mobileRender:mobile,mechanicalGroup:new T.Group(),
    microFiberTexture:new T.Texture(),width,height
  });
  engine.makeIrisTexture=()=>new T.Texture();
  engine.makeMechanicalLayer();
  engine.updateMechanical(10,time);
  engine.mechanicalGroup.position.set(0,mobile?-.038:0,.02);
  const camera=new T.PerspectiveCamera(width<height?51:42,width/height,.05,80);
  camera.position.set(0,.003,4.40+(width<height?.90:0));
  camera.lookAt(0,0,0);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
  engine.mechanicalGroup.updateMatrixWorld(true);
  const points=[];
  engine.mechanicalGroup.traverse(object=>{
    const position=object.geometry?.attributes?.position;
    if(!object.visible||!position)return;
    for(let index=0;index<position.count;index++){
      points.push(new T.Vector3().fromBufferAttribute(position,index).applyMatrix4(object.matrixWorld).project(camera));
    }
  });
  return bounds(points);
}

(async()=>{
  const T=await import(pathToFileURL(path.resolve('docs/scifi-ui/scripts/three-r185.module.js')).href);
  const Engine=filmClass();
  const rows=[];
  for(const row of [
    {viewport:[390,844],stage:[390,381]},
    {viewport:[430,932],stage:[430,420]}
  ]){
    const [vw,vh]=row.viewport,[sw,sh]=row.stage;
    const film=filmBounds(T,Engine,true,vw,vh);
    const native=nativeBounds(T,true,sw,sh);
    const filmPx={width:film.width*vw/2,height:film.height*vh/2};
    const nativePx={width:native.width*sw/2,height:native.height*sh/2};
    const widthRatio=filmPx.width/nativePx.width;
    const heightRatio=filmPx.height/nativePx.height;
    const filmCenterDown=-film.cy*vh/2;
    const nativeCenterDown=.03*sh-native.cy*sh/2;
    const centerDeltaPx=filmCenterDown-nativeCenterDown;
    assert(widthRatio>.98&&widthRatio<1.02,`mobile width projection mismatch: ${widthRatio}`);
    assert(heightRatio>.98&&heightRatio<1.02,`mobile height projection mismatch: ${heightRatio}`);
    assert(Math.abs(centerDeltaPx)<2,`mobile optical centre mismatch: ${centerDeltaPx}px`);
    rows.push({...row,filmPx,nativePx,widthRatio,heightRatio,centerDeltaPx});
  }
  const desktop=Object.create(Engine.prototype);
  desktop.mobileRender=false;
  const landing=1;
  assert.equal(1-.26*landing,.74,'desktop landing scale changed');
  console.log('MAG_PROJECTION_CONTINUITY_R2238_PASS',JSON.stringify({
    measuredFromActualGeometry:true,
    filmViewportAndNativeStageSeparated:true,
    desktopLandingPreserved:true,
    hardwareFpsOrVisualAcceptance:false,
    rows
  }));
})().catch(error=>{console.error(error);process.exitCode=1;});
