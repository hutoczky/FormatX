import r527Production from './production-content-entry-r527.js';

/* FormatX R528 — evidence-backed mobile first-paint stabilization.
   R527 remains the canonical FCP wrapper. R528 changes only the R206-era
   legacy stylesheet delivery on mobile: desktop keeps its existing blocking
   cascade, while mobile receives those legacy layers through the already-proven
   post-FCP R487/R526 scheduler. The current R358/R490 first-paint owners stay
   blocking. MAG remains the real living product; no audit-specific content. */
const PUBLIC_HOSTS=new Set(['formatxsuite.com','www.formatxsuite.com']);
const MOBILE_MEDIA='(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)';
const DESKTOP_MEDIA='(min-width: 901px) and (pointer: fine) and (min-aspect-ratio: 27/25)';
const MOBILE_LEGACY_PATHS=new Set([
  '/scifi-ui/styles/formatx-mobile-reference-layout-v1.css',
  '/scifi-ui/styles/formatx-flow-first-r74.css',
  '/scifi-ui/styles/formatx-responsive-text-guard-r72.css',
  '/scifi-ui/styles/formatx-mobile-proof-controls-r204.css',
  '/scifi-ui/styles/formatx-mobile-layout-r207.css',
  '/scifi-ui/styles/formatx-mobile-apex-composition.css',
]);
const GLOBAL_LEGACY_PATHS=new Set([
  '/scifi-ui/styles/formatx-critical-shell-v56.css',
  '/scifi-ui/styles/formatx-award-readiness.css',
  '/scifi-ui/styles/formatx-first-paint-r206.css',
  '/scifi-ui/styles/formatx-quality-r461.css',
]);
function safe(request){return request.method==='GET'||request.method==='HEAD';}
function pathOf(tag){const m=tag.match(/\bhref=(["'])(.*?)\1/i);if(!m)return'';try{return new URL(m[2],'https://formatxsuite.com/scifi-ui/').pathname;}catch(_){return'';}}
function withoutAttr(tag,name){const re=new RegExp(`\\s${name}=(["'])(.*?)\\1`,'gi');return tag.replace(re,'');}
function addAttrs(tag,attrs){return tag.replace(/\s*\/?>$/,close=>`${attrs}${close}`);}
function deferredMobile(tag){let next=withoutAttr(withoutAttr(withoutAttr(withoutAttr(tag,'media'),'fetchpriority'),'data-fx-r487-deferred-style'),'data-fx-r487-media');return addAttrs(next,` data-fx-r487-deferred-style="true" data-fx-r487-media="${MOBILE_MEDIA}" media="print" data-fx-r528-mobile-legacy="true"`);}
function desktopCopy(tag){let next=withoutAttr(withoutAttr(tag,'media'),'fetchpriority');return addAttrs(next,` media="${DESKTOP_MEDIA}" data-fx-r528-desktop-preserved="true"`);}
function stabilizeMobileFirstPaint(html){return String(html||'').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi,tag=>{const pathname=pathOf(tag);if(MOBILE_LEGACY_PATHS.has(pathname))return deferredMobile(tag);if(GLOBAL_LEGACY_PATHS.has(pathname)){if(/data-fx-r487-deferred-style/i.test(tag))return tag;return `${desktopCopy(tag)}\n  ${deferredMobile(tag)}`;}return tag;});}
function headersOf(source){const h=new Headers(source);h.set('X-FormatX-Transport-Stability','r528-mobile-first-paint-stable');h.set('X-FormatX-Edge-Stability','r528-r527-delegate-mobile-legacy-post-fcp');h.set('X-FormatX-CSS-Scheduler','r528-current-first-paint-legacy-post-fcp');h.set('X-FormatX-Product-Contract','r528-living-core-no-manual-pause');return h;}
export default{async fetch(request,env,ctx){const response=await r527Production.fetch(request,env,ctx);const url=new URL(request.url);if(!safe(request)||!PUBLIC_HOSTS.has(url.hostname))return response;const headers=headersOf(response.headers);if(request.method==='HEAD'){headers.delete('Content-Length');return new Response(null,{status:response.status,statusText:response.statusText,headers});}const type=headers.get('Content-Type')||'';if(!type.includes('text/html'))return new Response(response.body,{status:response.status,statusText:response.statusText,headers});const html=stabilizeMobileFirstPaint(await response.text());headers.delete('Content-Length');headers.delete('Content-Encoding');headers.delete('ETag');headers.set('Cache-Control','no-store, max-age=0');return new Response(html,{status:response.status,statusText:response.statusText,headers});}};
