(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxCoreDetailR122==='pure-webgl-disabled-r285')return;

for(const node of document.querySelectorAll('#hero .fx-core-detail-r122'))node.remove();

root.dataset.fxCoreDetailR122='pure-webgl-disabled-r285';
root.dataset.fxCoreReferenceTextureR130='disabled-pure-webgl-r285';
root.dataset.fxCoreFacetMode='native-webgl-mesh-only-r285';
root.dataset.fxCoreReferenceHeadingR138='disabled-no-2d-reference-bitmap';
root.dataset.fxCoreDetailSchedulerR282='disabled-no-2d-canvas';
root.dataset.fxCoreCompositionR285='pure-webgl3d-no-2d-overlays';

dispatchEvent(new CustomEvent('formatx:coredetailready',{
  detail:{version:'r285',mode:'pure-webgl3d-no-2d-overlay'}
}));
}());
