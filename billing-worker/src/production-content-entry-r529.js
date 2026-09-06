import canonicalProduction from './production-content-entry.js';

/* FormatX R554 — direct canonical production ownership + first-paint geometry lock.
   Candidate mode exists only behind Wrangler-only FORMATX_LOCAL_CANDIDATE=1.
   Layout-critical hero geometry and the semantic hero shell are present before
   first paint. Only genuinely noncritical enhancements remain deferred. MAG and
   the extended intro keep their normal visitor lifecycle with no audit-only path. */
const PUBLIC_HOSTS=new Set(['formatxsuite.com','www.formatxsuite.com']);
const CANONICAL_CANDIDATE_ORIGIN='https://formatxsuite.com';
const HOMEPAGE_PATHS=new Set(['/','/index.html','/scifi-ui','/scifi-ui/','/scifi-ui/index.html']);
const P0_SCHEDULER_PATH='/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js';
const P0_MOTION_SCHEDULER_RE=/formatx-p0-motion-scheduler-r490\.js\?v=[^"']+/g;
const P0_MOTION_SCHEDULER_URL='formatx-p0-motion-scheduler-r490.js?v=20260906-r549-navigation-mag-under-intro';
const MOTION_RUNTIME_RE=/formatx-motion-runtime-loader-r239\.js\?v=[^"']+/g;
const MOTION_RUNTIME_URL='formatx-motion-runtime-loader-r239.js?v=20260906-r550-parallel-shader-under-intro';
const CONTENT_RUNTIME_RE=/formatx-content-runtime-loader-r241\.js\?v=[^"']+/g;
const CONTENT_RUNTIME_URL='formatx-content-runtime-loader-r241.js?v=20260906-r538-no-manual-pause';
const CONTENT_STANDARD_RE=/formatx-content-standard\.css(?:\?v=[^"']+)?/g;
const CONTENT_STANDARD_URL='formatx-content-standard.css?v=20260906-r538-mobile-touch-spacing';
const DEFERRED_SCHEDULER_RE=/formatx-deferred-css-r487\.js\?v=[^"']+/g;
const DEFERRED_SCHEDULER_URL='formatx-deferred-css-r487.js?v=20260906-r535-mobile-scroll-intent-v2';
const EVENT_HORIZON_RE=/formatx-event-horizon\.js\?v=[^"']+/g;
const EVENT_HORIZON_URL='formatx-event-horizon.js?v=20260906-r549-extended-static-intro-fade-deadline';
const DEFERRED_REDUCED_RE=/formatx-deferred-reduced-style-r232\.js\?v=[^"']+/g;
const DEFERRED_REDUCED_URL='formatx-deferred-reduced-style-r232.js?v=20260905-r531-preloader-owner';
const QUALITY_RE=/formatx-quality-r461\.css\?v=[^"']+/g;
const QUALITY_URL='formatx-quality-r461.css?v=20260906-r538-no-manual-pause';
const HEART_STYLE_RE=/formatx-heart-core-r252\.css(?:\?v=[^"']+)?/g;
const HEART_STYLE_URL='formatx-heart-core-r252.css?v=20260906-r549-pointer-transparent-router';
const PAYMENT_SURFACE_SCRIPT='/scifi-ui/scripts/formatx-payment-surface-r553.js?v=20260906-r553-visible-payment-qr';
const PAYMENT_SURFACE_TAG=`<script defer data-fx-payment-surface-r553="true" src="${PAYMENT_SURFACE_SCRIPT}"></script>`;
const MOBILE_MEDIA='(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)';
const DESKTOP_MOTION_MEDIA='(prefers-reduced-motion: no-preference) and (min-width: 901px)';
const HEART_BUTTON='<button type="button" class="fx-mag-heart-hit-r252" data-fx-heart-core-r252="true" aria-label="A FormatX élő MAG interakciójának indítása"></button>';
const HERO_CONTROLS='<div class="fx-reference-controls-r204 fx-reference-controls-r264" aria-label="Hero vezérlők"><button type="button" class="fx-three-sound fx-wda-sound-toggle fx-control-owner-r264" aria-label="FormatX hang bekapcsolása" aria-pressed="false"></button><div class="fx-reference-rail fx-reference-rail-r264"><button type="button" class="fx-reference-ask" aria-label="Kérdezz a FormatX-től"><i aria-hidden="true"></i><span>KÉRDEZZ</span></button></div></div>';
const HERO_PROOF='<div class="fx-reference-heading">A MŰKÖDÉS MEGISMERÉSE</div><article class="fx-reference-proof"><span class="fx-reference-proof-kicker">PUBLIC PROOF LAYER</span><h2>Bizonyíték a látvány mögött.</h2><p>A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető.</p><a class="fx-reference-liveos" href="#experience" aria-label="Live OS — munkafolyamat megnyitása">Live OS</a></article>';
const HERO_GRID_TAIL='        </div>\n      </div>\n      <a class="scroll-cue"';

const MOBILE_FIRST_PAINT_PRELOAD=`</scifi-ui/styles/formatx-mobile-first-paint-r358.css?v=20260827-r407-static-parity>; rel=preload; as=style; media="${MOBILE_MEDIA}"`;
const P0_FIRST_PAINT_PRELOAD='</scifi-ui/styles/formatx-p0-first-paint-r490.css?v=20260903-r503-hero-ancestor-first-frame>; rel=preload; as=style';
const CRITICAL_SHELL_PRELOAD='</scifi-ui/styles/formatx-critical-shell-v56.css?v=20260818-r206-first-paint>; rel=preload; as=style';
const CRITICAL_CORE_PRELOAD=`</scifi-ui/styles/formatx-critical-core-r227.css?v=20260819-r227>; rel=preload; as=style; media="${DESKTOP_MOTION_MEDIA}"`;
const QUALITY_PRELOAD='</scifi-ui/styles/formatx-quality-r461.css?v=20260906-r538-no-manual-pause>; rel=preload; as=style';
const AWARD_READINESS_PRELOAD='</scifi-ui/styles/formatx-award-readiness.css?v=20260818-r206-lcp-stability>; rel=preload; as=style';
const FIRST_PAINT_R206_PRELOAD='</scifi-ui/styles/formatx-first-paint-r206.css?v=20260818-r206-stable-hero>; rel=preload; as=style';
const REFERENCE_BOOT_PRELOAD='</scifi-ui/scripts/formatx-reference-mode-boot-r334.js?v=20260903-r504-prepaint-reference-mode>; rel=preload; as=script';
const REFERENCE_PRODUCTION_PRELOAD=`</scifi-ui/styles/formatx-reference-production-r244.css?v=20260824-native-orb-r250>; rel=preload; as=style; media="${DESKTOP_MOTION_MEDIA}"`;
const MOBILE_LEGACY_PATHS=new Set([
  '/scifi-ui/styles/formatx-mobile-reference-layout-v1.css',
  '/scifi-ui/styles/formatx-flow-first-r74.css',
  '/scifi-ui/styles/formatx-responsive-text-guard-r72.css',
  '/scifi-ui/styles/formatx-mobile-proof-controls-r204.css',
  '/scifi-ui/styles/formatx-mobile-layout-r207.css',
  '/scifi-ui/styles/formatx-mobile-apex-composition.css'
]);

function isSafeMethod(request){return request.method==='GET'||request.method==='HEAD';}
function isLocalCandidateEnv(env){return String(env?.FORMATX_LOCAL_CANDIDATE||'')==='1';}
function isDeliveryHost(url,localCandidate){return PUBLIC_HOSTS.has(url.hostname)||localCandidate;}
function canonicalDeliveryRequest(request,url){const canonicalUrl=new URL(url.pathname+url.search,CANONICAL_CANDIDATE_ORIGIN);return new Request(canonicalUrl,request);}
function stylesheetPath(tag){const hrefMatch=tag.match(/\bhref=(["'])(.*?)\1/i);if(!hrefMatch)return'';try{return new URL(hrefMatch[2],'https://formatxsuite.com/scifi-ui/').pathname;}catch(_){return'';}}
function withoutAttr(tag,name){if(!/^[a-z0-9-]+$/i.test(name))return tag;const lower=tag.toLowerCase(),needle=`${name.toLowerCase()}=`;let index=0;while((index=lower.indexOf(needle,index))!==-1){const before=index-1;if(before<0||!/\s/.test(tag[before])){index+=needle.length;continue;}const quote=tag[index+needle.length];if(quote!=='"'&&quote!=="'"){index+=needle.length;continue;}const end=tag.indexOf(quote,index+needle.length+1);if(end===-1)return tag;return tag.slice(0,before)+tag.slice(end+1);}return tag;}
function addAttrs(tag,attrs){return tag.replace(/\s*\/?>$/,close=>`${attrs}${close}`);}
function deferredMobile(tag){let next=withoutAttr(withoutAttr(withoutAttr(withoutAttr(tag,'media'),'fetchpriority'),'data-fx-r487-deferred-style'),'data-fx-r487-media');return addAttrs(next,` data-fx-r487-deferred-style="true" data-fx-r487-media="${MOBILE_MEDIA}" media="print" data-fx-r529-mobile-legacy="true"`);}
function stabilizeMobileFirstPaint(html){return String(html||'').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi,tag=>MOBILE_LEGACY_PATHS.has(stylesheetPath(tag))?deferredMobile(tag):tag);}
function restoreCriticalCoreFirstPaint(html){return String(html||'').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi,tag=>{if(stylesheetPath(tag)!=='/scifi-ui/styles/formatx-critical-core-r227.css')return tag;let next=withoutAttr(withoutAttr(withoutAttr(withoutAttr(withoutAttr(tag,'media'),'fetchpriority'),'data-fx-r487-deferred-style'),'data-fx-r487-media'),'data-fx-r554-prepaint-geometry');return addAttrs(next,` fetchpriority="high" media="${DESKTOP_MOTION_MEDIA}" data-fx-r554-prepaint-geometry="true"`);});}
function injectStaticHeart(html){let source=String(html||'');if(!source.includes('class="fx-mag-heart-hit-r252"'))source=source.replace(/<div\s+class=(["'])hero-space\1\s*>/i,match=>`${match}\n          ${HEART_BUTTON}`);return source;}
function injectStaticHeroShell(html){let source=String(html||'');if(!source.includes('class="fx-reference-controls-r204'))source=source.replace(/<div\s+class=(["'])hero-space\1\s*>/i,match=>`${match}\n          ${HERO_CONTROLS}`);if(!source.includes('class="fx-reference-heading"')||!source.includes('class="fx-reference-proof"'))source=source.replace(HERO_GRID_TAIL,`        </div>\n        ${HERO_PROOF}\n      </div>\n      <a class="scroll-cue"`);return source;}
function injectPaymentSurface(html){let source=String(html||'');if(source.includes('data-fx-payment-surface-r553='))return source;return source.replace(/<\/body>/i,`${PAYMENT_SURFACE_TAG}\n</body>`);}
function addFirstPaintPreloads(headers){const existing=headers.get('Link');const preloads=[MOBILE_FIRST_PAINT_PRELOAD,P0_FIRST_PAINT_PRELOAD,CRITICAL_SHELL_PRELOAD,CRITICAL_CORE_PRELOAD,QUALITY_PRELOAD,AWARD_READINESS_PRELOAD,FIRST_PAINT_R206_PRELOAD,REFERENCE_BOOT_PRELOAD,REFERENCE_PRODUCTION_PRELOAD].join(', ');headers.set('Link',existing?`${existing}, ${preloads}`:preloads);}
function r543Headers(source,localCandidate){const headers=new Headers(source);headers.set('X-FormatX-Transport-Stability','r543-direct-canonical-extended-intro');headers.set('X-FormatX-Edge-Stability','r551-post-paint-critical-core-navigation-mag');headers.set('X-FormatX-CSS-Scheduler','r551-canonical-post-first-paint-critical-core');headers.set('X-FormatX-Product-Contract','r543-navigation-mag-elevated-heart-no-manual-pause');headers.set('X-FormatX-MAG-Startup','r543-navigation-owned-elevated-body-heart');headers.set('X-FormatX-Mobile-LCP','r551-critical-core-post-first-paint-heart-runtime-style');headers.set('X-FormatX-Preloader','r543-static-content-extended-roadmap-timing');headers.set('X-FormatX-Preloader-Cache','r543-extended-static-lcp-audio-owner-safe');headers.set('X-FormatX-Reference-Boot','r536-prepaint-layout-selector');headers.set('X-FormatX-Payment-Surface','r553-post-paint-visible-qr');headers.set('X-FormatX-Layout-Stability','r554-static-hero-shell-critical-core-prepaint');if(localCandidate){headers.set('X-FormatX-Candidate-Delivery','r543-exact-production-entry-localhost-8787');headers.set('X-FormatX-Candidate-Canonical-Origin','formatxsuite.com');headers.set('Link','<https://formatxsuite.com/>; rel="canonical"');}return headers;}
function rewrittenSchedulerResponse(response,headers){return response.text().then(source=>{const body=String(source||'').replace(MOTION_RUNTIME_RE,MOTION_RUNTIME_URL);headers.delete('Content-Length');headers.delete('Content-Encoding');headers.delete('ETag');headers.set('Cache-Control','no-store, max-age=0');headers.set('X-FormatX-Scheduler-Cache','r543-extended-intro-elevated-heart');return new Response(body,{status:response.status,statusText:response.statusText,headers});});}

export default{async fetch(request,env,ctx){
  const deliveryUrl=new URL(request.url),localCandidate=isLocalCandidateEnv(env);
  if(localCandidate)request=canonicalDeliveryRequest(request,deliveryUrl);
  const response=await canonicalProduction.fetch(request, env, ctx);
  if(!isSafeMethod(request)||!isDeliveryHost(deliveryUrl,localCandidate))return response;
  const headers=r543Headers(response.headers,localCandidate);
  if(request.method==='HEAD'){headers.delete('Content-Length');return new Response(null,{status:response.status,statusText:response.statusText,headers});}
  const type=headers.get('Content-Type')||'';
  if(deliveryUrl.pathname===P0_SCHEDULER_PATH&&/javascript|text\/plain/i.test(type))return rewrittenSchedulerResponse(response,headers);
  if(!type.includes('text/html'))return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  let html=await response.text();
  html=html.replace(P0_MOTION_SCHEDULER_RE,P0_MOTION_SCHEDULER_URL);
  html=html.replace(MOTION_RUNTIME_RE,MOTION_RUNTIME_URL);
  html=html.replace(CONTENT_RUNTIME_RE,CONTENT_RUNTIME_URL);
  html=html.replace(CONTENT_STANDARD_RE,CONTENT_STANDARD_URL);
  html=html.replace(DEFERRED_SCHEDULER_RE,DEFERRED_SCHEDULER_URL);
  html=html.replace(EVENT_HORIZON_RE,EVENT_HORIZON_URL);
  html=html.replace(DEFERRED_REDUCED_RE,DEFERRED_REDUCED_URL);
  html=html.replace(QUALITY_RE,QUALITY_URL);
  html=html.replace(HEART_STYLE_RE,HEART_STYLE_URL);
  if(HOMEPAGE_PATHS.has(deliveryUrl.pathname)){
    html=stabilizeMobileFirstPaint(html);
    html=restoreCriticalCoreFirstPaint(html);
    html=injectStaticHeart(html);
    html=injectStaticHeroShell(html);
    html=injectPaymentSurface(html);
    addFirstPaintPreloads(headers);
  }
  headers.delete('Content-Length');headers.delete('Content-Encoding');headers.delete('ETag');headers.set('Cache-Control','no-store, max-age=0');
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}};
