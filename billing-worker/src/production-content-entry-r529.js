import canonicalProduction from './production-content-entry.js';

/* FormatX R529 — direct canonical production ownership + R527 FCP preservation
   + R528 living-core/mobile first-paint closeout.

   Evidence:
   - R528 deploy 33931843758 was blocked before deployment because the versioned
     entry delegated indirectly through R527 instead of directly to the canonical
     production-content-entry.js required by production preflight.
   - R527 mobile LHRs proved a client/render slow path. The bad runs introduced a
     late fx-mag-heart-hit-r252 layout shift and ~1.8 s of legacy mobile CSS
     render blocking. R529 makes the real heart hit-surface part of initial HTML
     and keeps R528's mobile legacy CSS on the existing post-FCP scheduler.
   - Manual MAG pause is not a product contract. Normal MAG remains alive;
     reduced-motion/background lifecycle stays owned by the R528 runtime.
   - R531 hotfix refreshes only the proven lightweight preloader assets. The
     canonical quality stylesheet revision passes through from source HTML so
     production cannot pin a retired quality cache revision. */

const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const CRITICAL_CORE_PATH = '/scifi-ui/styles/formatx-critical-core-r227.css';
const DEFERRED_SCHEDULER_RE = /formatx-deferred-css-r487\.js\?v=[^"']+/g;
const DEFERRED_SCHEDULER_URL = 'formatx-deferred-css-r487.js?v=20260904-r526-fcp-observer';
const EVENT_HORIZON_RE = /formatx-event-horizon\.js\?v=[^"']+/g;
const EVENT_HORIZON_URL = 'formatx-event-horizon.js?v=20260905-r531-preloader-effects-v2';
const DEFERRED_REDUCED_RE = /formatx-deferred-reduced-style-r232\.js\?v=[^"']+/g;
const DEFERRED_REDUCED_URL = 'formatx-deferred-reduced-style-r232.js?v=20260905-r531-preloader-owner';
const MOBILE_MEDIA = '(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)';
const DESKTOP_MEDIA = '(min-width: 901px) and (pointer: fine) and (min-aspect-ratio: 27/25)';
const HEART_STYLE_PATH = '/scifi-ui/styles/formatx-heart-core-r252.css';
const HEART_STYLE_LINK = '<link rel="stylesheet" fetchpriority="high" data-fx-heart-core-r252="true" href="/scifi-ui/styles/formatx-heart-core-r252.css?v=20260924-r1723-semantic-pointer-owner">';
const HEART_BUTTON = '<button type="button" class="fx-mag-heart-hit-r252" data-fx-heart-core-r252="true" aria-label="A FormatX élő MAG interakciójának indítása"></button>';

const MOBILE_LEGACY_PATHS = new Set([
  '/scifi-ui/styles/formatx-mobile-reference-layout-v1.css',
  '/scifi-ui/styles/formatx-flow-first-r74.css',
  '/scifi-ui/styles/formatx-responsive-text-guard-r72.css',
  '/scifi-ui/styles/formatx-mobile-proof-controls-r204.css',
  '/scifi-ui/styles/formatx-mobile-layout-r207.css',
  '/scifi-ui/styles/formatx-mobile-apex-composition.css',
]);
const GLOBAL_LEGACY_PATHS = new Set([
  '/scifi-ui/styles/formatx-critical-shell-v56.css',
  '/scifi-ui/styles/formatx-award-readiness.css',
  '/scifi-ui/styles/formatx-first-paint-r206.css',
  '/scifi-ui/styles/formatx-quality-r461.css',
]);

function isSafeMethod(request) {
  return request.method === 'GET' || request.method === 'HEAD';
}
function stylesheetPath(tag) {
  const hrefMatch = tag.match(/\bhref=(["'])(.*?)\1/i);
  if (!hrefMatch) return '';
  try { return new URL(hrefMatch[2], 'https://formatxsuite.com/scifi-ui/').pathname; }
  catch (_) { return ''; }
}
function withoutAttr(tag, name) {
  return tag.replace(new RegExp(`\\s${name}=(["'])(.*?)\\1`, 'gi'), '');
}
function addAttrs(tag, attrs) {
  return tag.replace(/\s*\/?>$/, close => `${attrs}${close}`);
}
function deferredMobile(tag) {
  let next = withoutAttr(withoutAttr(withoutAttr(withoutAttr(tag, 'media'), 'fetchpriority'), 'data-fx-r487-deferred-style'), 'data-fx-r487-media');
  return addAttrs(next, ` data-fx-r487-deferred-style="true" data-fx-r487-media="${MOBILE_MEDIA}" media="print" data-fx-r529-mobile-legacy="true"`);
}
function desktopCopy(tag) {
  let next = withoutAttr(withoutAttr(tag, 'media'), 'fetchpriority');
  return addAttrs(next, ` media="${DESKTOP_MEDIA}" data-fx-r529-desktop-preserved="true"`);
}
function restoreCriticalCoreFirstPaint(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    if (stylesheetPath(tag) !== CRITICAL_CORE_PATH) return tag;
    const mediaMatch = tag.match(/\sdata-fx-r487-media=(["'])(.*?)\1/i);
    const originalMedia = mediaMatch ? mediaMatch[2] : 'all';
    let next = tag
      .replace(/\sdata-fx-r487-deferred-style=(["'])true\1/gi, '')
      .replace(/\sdata-fx-r487-media=(["'])(.*?)\1/gi, '')
      .replace(/\smedia=(["'])print\1/gi, '');
    if (originalMedia && originalMedia !== 'all' && !/\smedia=(["'])(.*?)\1/i.test(next)) {
      next = next.replace(/\s*\/?>$/, close => ` media="${originalMedia}"${close}`);
    }
    if (!/\sfetchpriority=/i.test(next)) {
      next = next.replace(/\s*\/?>$/, close => ` fetchpriority="high"${close}`);
    }
    return next;
  });
}
function stabilizeMobileFirstPaint(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const pathname = stylesheetPath(tag);
    if (MOBILE_LEGACY_PATHS.has(pathname)) return deferredMobile(tag);
    if (GLOBAL_LEGACY_PATHS.has(pathname)) {
      if (/data-fx-r487-deferred-style/i.test(tag)) return tag;
      return `${desktopCopy(tag)}\n  ${deferredMobile(tag)}`;
    }
    return tag;
  });
}
function injectStaticHeart(html) {
  let source = String(html || '');
  const links = source.match(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi) || [];
  if (!links.some(tag => stylesheetPath(tag) === HEART_STYLE_PATH)) {
    source = source.replace('</head>', `  ${HEART_STYLE_LINK}\n</head>`);
  }
  if (!source.includes('class="fx-mag-heart-hit-r252"')) {
    source = source.replace(/<div\s+class=(["'])hero-space\1\s*>/i, match => `${match}\n          ${HEART_BUTTON}`);
  }
  return source;
}
function mergeVaryR1950(current, token) {
  const values=String(current||'').split(',').map(value=>value.trim()).filter(Boolean);
  if(!values.some(value=>value.toLowerCase()===String(token).toLowerCase()))values.push(token);
  return values.join(', ');
}
function encodingQualityR1950(header, coding) {
  let wildcard=null;
  for(const raw of String(header||'').split(',')){
    const parts=raw.trim().split(';');
    const name=String(parts.shift()||'').trim().toLowerCase();
    if(!name)continue;
    let q=1;
    for(const parameter of parts){
      const match=parameter.trim().match(/^q\s*=\s*(0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/i);
      if(match){q=Math.max(0,Math.min(1,Number(match[1])));break;}
    }
    if(name===String(coding).toLowerCase())return q;
    if(name==='*')wildcard=q;
  }
  return wildcard??0;
}
function compressibleR1950(contentType) {
  const type=String(contentType||'').toLowerCase().split(';',1)[0].trim();
  return type.startsWith('text/')
    || type==='application/javascript'
    || type==='application/x-javascript'
    || type==='application/json'
    || type==='application/manifest+json'
    || type==='application/xml'
    || type==='application/xhtml+xml'
    || type==='image/svg+xml';
}
function gzipFinalR1950(request,response) {
  if(request.method==='HEAD'||!response.body||[204,206,304].includes(response.status))return response;
  if(response.headers.get('Content-Encoding'))return response;
  if(!compressibleR1950(response.headers.get('Content-Type')))return response;
  if(encodingQualityR1950(request.headers.get('Accept-Encoding'),'gzip')<=0)return response;
  if(typeof CompressionStream!=='function')return response;
  const headers=new Headers(response.headers);
  headers.delete('Content-Length');
  headers.delete('ETag');
  headers.set('Content-Encoding','gzip');
  headers.set('Vary',mergeVaryR1950(headers.get('Vary'),'Accept-Encoding'));
  headers.set('X-FormatX-Text-Compression','gzip-r1950-final-wrapper');
  return new Response(response.body.pipeThrough(new CompressionStream('gzip')),{
    status:response.status,statusText:response.statusText,headers
  });
}

function r529Headers(source) {
  const headers = new Headers(source);
  headers.set('X-FormatX-Transport-Stability', 'r529-direct-canonical-living-core');
  headers.set('X-FormatX-Edge-Stability', 'r529-r527-fcp-r528-mobile-post-fcp');
  headers.set('X-FormatX-CSS-Scheduler', 'r526-post-first-contentful-paint');
  headers.set('X-FormatX-Product-Contract', 'r529-living-core-no-manual-pause');
  headers.set('X-FormatX-Mobile-LCP', 'static-heart-hit-plus-legacy-post-fcp');
  headers.set('X-FormatX-Preloader', 'r531-extended-effects-navigation-owned');
  headers.set('X-FormatX-Preloader-Cache', 'r531-effects-v2-fresh-assets');
  return headers;
}

export default {
  async fetch(request, env, ctx) {
    const response = await canonicalProduction.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (!isSafeMethod(request) || !PUBLIC_HOSTS.has(url.hostname)) return response;

    const headers = r529Headers(response.headers);
    if (request.method === 'HEAD') {
      headers.delete('Content-Length');
      return new Response(null, { status: response.status, statusText: response.statusText, headers });
    }
    const type = headers.get('Content-Type') || '';
    if (!type.includes('text/html')) {
      return gzipFinalR1950(request,new Response(response.body, { status: response.status, statusText: response.statusText, headers }));
    }

    let html = restoreCriticalCoreFirstPaint(await response.text());
    html = html.replace(DEFERRED_SCHEDULER_RE, DEFERRED_SCHEDULER_URL);
    html = html.replace(EVENT_HORIZON_RE, EVENT_HORIZON_URL);
    html = html.replace(DEFERRED_REDUCED_RE, DEFERRED_REDUCED_URL);
    if (HOMEPAGE_PATHS.has(url.pathname)) {
      html = stabilizeMobileFirstPaint(html);
      html = injectStaticHeart(html);
    }
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('Cache-Control', 'no-store, max-age=0');
    return gzipFinalR1950(request,new Response(html, { status: response.status, statusText: response.statusText, headers }));
  },
};
