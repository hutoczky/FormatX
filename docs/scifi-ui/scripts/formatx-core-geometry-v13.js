(function(){'use strict';
const root=document.documentElement;if(root.dataset.fxCoreGeometryGrade==='ready-v13')return;const C=window.WebGL2RenderingContext;if(!C||!C.prototype)return;
const getUniform=C.prototype.getUniformLocation,uniform1f=C.prototype.uniform1f,scaleLocations=new WeakSet();
C.prototype.getUniformLocation=function(program,name){const loc=getUniform.call(this,program,name);if(loc&&name==='uScale'&&this.canvas instanceof HTMLCanvasElement&&this.canvas.classList.contains('fx-core-mesh3d-canvas'))scaleLocations.add(loc);return loc;};
C.prototype.uniform1f=function(location,value){if(location&&scaleLocations.has(location))return uniform1f.call(this,location,value*1.15);return uniform1f.call(this,location,value);};
root.dataset.fxCoreGeometryGrade='ready-v13';root.dataset.fxCoreGeometryScale='1.15x-true-3d-uniform';
}());