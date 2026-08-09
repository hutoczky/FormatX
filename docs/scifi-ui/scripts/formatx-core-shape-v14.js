(function(){'use strict';
const root=document.documentElement;if(root.dataset.fxCoreShape==='installed-v14')return;const C=window.WebGL2RenderingContext;if(!C||!C.prototype)return;const original=C.prototype.shaderSource;let meshPatched=false,fracturePatched=false;
function maybeRestore(){if(meshPatched&&fracturePatched&&C.prototype.shaderSource===patchedShaderSource)C.prototype.shaderSource=original;}
function patchedShaderSource(shader,source){
  if(typeof source==='string'&&!meshPatched&&source.includes('uniform vec3 uTilt,uRotation;')&&source.includes('vec3 p=r*(l*(aPosition*uScale*uPulse));')){
    source=source.replace('vec3 p=r*(l*(aPosition*uScale*uPulse));','vec3 q=vec3(aPosition.x,aPosition.y*.72,aPosition.z);vec3 p=r*(l*(q*uScale*uPulse));');
    meshPatched=true;root.dataset.fxCoreShapeMesh='applied-v14';root.dataset.fxCoreShape='reference-ratio-v14';queueMicrotask(maybeRestore);
  }
  if(typeof source==='string'&&!fracturePatched&&source.includes('uniform vec3 uRotation;')&&source.includes('vec3 p=rz*ry*rx*(aPosition*uScale*uPulse);')){
    source=source.replace('vec3 p=rz*ry*rx*(aPosition*uScale*uPulse);','vec3 q=vec3(aPosition.x,aPosition.y*.72,aPosition.z);vec3 p=rz*ry*rx*(q*uScale*uPulse);');
    fracturePatched=true;root.dataset.fxCoreShapeFracture='applied-v14';root.dataset.fxCoreShape='reference-ratio-v14';queueMicrotask(maybeRestore);
  }
  return original.call(this,shader,source);
}
C.prototype.shaderSource=patchedShaderSource;root.dataset.fxCoreShape='installed-v14';root.dataset.fxCoreShapeY='0.72x-vertex-space';
}());