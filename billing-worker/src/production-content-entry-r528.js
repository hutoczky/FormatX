import r527Production from './production-content-entry-r527.js';

/* FormatX R528 — living-core contract + evidence-backed mobile critical-path stabilization. */
const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const MOBILE_MEDIA = '(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)';
const REDUCED_MAG_LINK = '<link rel="stylesheet" media="(prefers-reduced-motion: reduce)" data-fx-reduced-mag-identity-r528="true" href="/scifi-ui/styles/formatx-reduced-mag-identity-r528.css?v=20260905-r528-living-core">';
const R528_QUERY = '20260905-r528-living-core';
const MOBILE_DEFER_PATHS = new Set([
  '/scifi-ui/styles/formatx-mobile-reference-layout-v1.css',
  '/scifi-ui/styles/formatx-flow-first-r74.css',
  '/scifi-ui/styles/formatx-responsive-text-guard-r72.css',
  '/scifi-ui/styles/formatx-mobile-proof-controls-r204.css',
  '/scifi-ui/styles/formatx-mobile-layout-r207.css',
  '/scifi-ui/styles/formatx-native-orb-reference-r250.css',
  '/scifi-ui/styles/formatx-mobile-apex-composition.css',
]);
const SPLIT_DESKTOP_MOBILE_PATHS = new Set([
  '/scifi-ui/styles/formatx-critical-shell-v56.css',
  '/scifi-ui/styles/formatx-award-readiness.css',
  '/scifi-ui/styles/formatx-quality-r461.css',
  '/scifi-ui/styles/formatx-first-paint-r206.css',
]);
const R528_HTML_SCRIPT_REWRITES = [
  [/formatx-event-horizon\.js\?v=[^"']+/g, `formatx-event-horizon.js?v=${R528_QUERY}`],
  [/formatx-reference-production-r244\.js\?v=[^"']+/g, `formatx-reference-production-r244.js?v=${R528_QUERY}`],
  [/formatx-control-owner-r268\.js\?v=[^"']+/g, `formatx-control-owner-r268.js?v=${R528_QUERY}`],
  [/formatx-motion-runtime-loader-r239\.js\?v=[^"']+/g, `formatx-motion-runtime-loader-r239.js?v=${R528_QUERY}`],
  [/formatx-mini-mag-assistant-r459\.js\?v=[^"']+/g, `formatx-mini-mag-assistant-r459.js?v=${R528_QUERY}`],
  [/formatx-mag-shape-sync-r476\.js\?v=[^"']+/g, `formatx-mag-shape-sync-r476.js?v=${R528_QUERY}`],
];
function isSafeMethod(request){return request.method==='GET'||request.method==='HEAD';}
function stylesheetHref(tag){const match=tag.match(/\bhref=(["'])(.*?)\1/i);return match?match[2]:'';}
function stylesheetPath(tag){const href=stylesheetHref(tag);if(!href)return '';try{return new URL(href,'https://formatxsuite.com/scifi-ui/').pathname;}catch(_){return '';}}
function stripAttr(tag,name){const re=new RegExp(`\\s${name}=(["'])(.*?)\\1`,'ig');return tag.replace(re,'');}
function appendAttrs(tag,attrs){return tag.replace(/\s*\/?>$/,close=>` ${attrs}${close}`);}
function deferredTag(tag,targetMedia){let next=stripAttr(tag,'media');next=stripAttr(next,'fetchpriority');next=stripAttr(next,'data-fx-r487-deferred-style');next=stripAttr(next,'data-fx-r487-media');return appendAttrs(next,`data-fx-r487-deferred-style="true" data-fx-r487-media="${targetMedia}" media="print"`);}
function desktopTag(tag){return appendAttrs(stripAttr(tag,'media'),'media="(min-width: 901px) and (pointer: fine)"');}
function stabilizeMobileCriticalGraph(html){return String(html||'').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi,tag=>{const path=stylesheetPath(tag);if(!path)return tag;if(MOBILE_DEFER_PATHS.has(path))return deferredTag(tag,MOBILE_MEDIA);if(SPLIT_DESKTOP_MOBILE_PATHS.has(path))return `${desktopTag(tag)}\n  ${deferredTag(tag,MOBILE_MEDIA)}`;return tag;});}
function injectReducedMagIdentity(html){const source=String(html||'');if(source.includes('data-fx-reduced-mag-identity-r528="true"'))return source;return source.replace('</head>',`  ${REDUCED_MAG_LINK}\n</head>`);}
function cacheBustR528Runtime(html){let source=String(html||'');for(const [pattern,replacement] of R528_HTML_SCRIPT_REWRITES)source=source.replace(pattern,replacement);return source;}
function rewriteR528Asset(url,text){let source=String(text||'');if(url.pathname==='/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js')source=source.replace(/formatx-mag-shape-sync-r476\.js\?v=[^"']+/g,`formatx-mag-shape-sync-r476.js?v=${R528_QUERY}`);return source;}
function r528Headers(source){const headers=new Headers(source);headers.set('X-FormatX-Transport-Stability','r528-mobile-critical-graph');headers.set('X-FormatX-Edge-Stability','r528-mobile-critical-graph-deterministic');headers.set('X-FormatX-CSS-Scheduler','r526-post-first-contentful-paint');headers.set('X-FormatX-MAG-Contract','living-core-continuous-normal-motion');return headers;}
export default {
  async fetch(request,env,ctx){
    const response=await r527Production.fetch(request,env,ctx);const url=new URL(request.url);
    if(!isSafeMethod(request)||!PUBLIC_HOSTS.has(url.hostname))return response;
    const headers=r528Headers(response.headers);
    if(request.method==='HEAD'){headers.delete('Content-Length');return new Response(null,{status:response.status,statusText:response.statusText,headers});}
    const contentType=headers.get('Content-Type')||'';
    if(contentType.includes('text/html')){
      let html=await response.text();html=stabilizeMobileCriticalGraph(html);html=injectReducedMagIdentity(html);html=cacheBustR528Runtime(html);
      headers.delete('Content-Length');headers.delete('Content-Encoding');headers.delete('ETag');headers.set('Cache-Control','no-store, max-age=0');
      return new Response(html,{status:response.status,statusText:response.statusText,headers});
    }
    if(contentType.includes('javascript')&&url.pathname==='/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js'){
      const body=rewriteR528Asset(url,await response.text());headers.delete('Content-Length');headers.delete('Content-Encoding');headers.delete('ETag');headers.set('Cache-Control','no-store, max-age=0');
      return new Response(body,{status:response.status,statusText:response.statusText,headers});
    }
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  },
};