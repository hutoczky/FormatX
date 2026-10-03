/* The site's durable navigation state directs the existing MAG's light.
   This is UI feedback, not a claim that a backend operation has run. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMagSemanticLightR866)return;
root.dataset.fxMagSemanticLightR866='listening';
const lifecycle=new AbortController(),options={passive:true,signal:lifecycle.signal};
const target='[data-scene-link],[data-organ-node],[data-organism-tab],.fx-reference-ask,.fx-organism-thought-trigger';
const semantic=node=>node instanceof Element&&Boolean(node.closest(target));
let pointerActive=false,focusActive=semantic(document.activeElement);
function reconcile(){
 const api=window.FormatXLivingCore;
 if(!api)return;
 api.setScene?.(Math.max(0,Math.min(5,Math.round(Number(root.dataset.fxScene)||0))));
 api.setAttention?.(pointerActive||focusActive?1:0);
}
addEventListener('formatx:organismstatechange',reconcile,options);
addEventListener('formatx:real3dready',reconcile,options);
document.addEventListener('pointerover',event=>{pointerActive=semantic(event.target);reconcile();},options);
document.addEventListener('pointerout',event=>{pointerActive=semantic(event.relatedTarget);reconcile();},options);
document.addEventListener('pointercancel',()=>{pointerActive=false;reconcile();},options);
document.addEventListener('focusin',event=>{focusActive=semantic(event.target);reconcile();},options);
document.addEventListener('focusout',event=>{focusActive=semantic(event.relatedTarget);reconcile();},options);
addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
reconcile();
}());
