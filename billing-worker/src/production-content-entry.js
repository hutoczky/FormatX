import productionBase from './production-content-entry-r369-base.js';

/* FormatX R720 — preserve canonical geometry through the production pipeline.
   Critical core supplies the desktop body, hero and canvas geometry before paint.
   Removing its href here defeated the source first-frame contract: later wrappers
   restored its media/priority but left it unfetched until the 2100ms CSS checkpoint.
   Only secondary styles belong to the autonomous deferred stylesheet scheduler. */

const STARTUP_REVISION = '20260908-r675-nonblocking-reference-and-visual-css';
const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const EVENT_HORIZON_PATH = '/scifi-ui/styles/formatx-event-horizon.css';
const INTRO_P0_PATH = '/scifi-ui/styles/formatx-intro-p0-r575.css';
const EVENT_HORIZON_SCRIPT_PATH = '/scifi-ui/scripts/formatx-event-horizon.js';
const REFERENCE_MODE_BOOT_SCRIPT = '<script defer fetchpriority="high" data-fx-reference-mode-boot-r504="true" src="/scifi-ui/scripts/formatx-reference-mode-boot-r334.js?v=20260903-r504-prepaint-reference-mode"></script>';
const FIRST_FRAME_STABILITY_LINK = '<link rel="stylesheet" fetchpriority="high" media="(prefers-reduced-motion: no-preference) and (min-width: 901px) and (pointer: fine), (prefers-reduced-motion: no-preference) and (min-width: 901px) and (pointer: none)" data-fx-first-frame-stability-r500="true" href="/scifi-ui/styles/formatx-first-frame-stability-r283.css?v=20260902-r500-canonical-hero-state">';
const P0_FIRST_PAINT_LINK = '<link rel="stylesheet" fetchpriority="high" data-fx-p0-first-paint-r503="true" href="/scifi-ui/styles/formatx-p0-first-paint-r490.css?v=20260903-r503-hero-ancestor-first-frame">';
const P0_FIRST_PAINT_PRELOAD = '</scifi-ui/styles/formatx-p0-first-paint-r490.css?v=20260903-r503-hero-ancestor-first-frame>; rel=preload; as=style';
const INTRO_P0_PRELOAD = '</scifi-ui/styles/formatx-intro-p0-r575.css?v=20260907-r635-three-phase-absolute-reveal>; rel=preload; as=style';
const FIRST_PAINT_LINK = '<link rel="stylesheet" fetchpriority="high" media="(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)" data-fx-mobile-first-paint-r358="true" data-fx-production-first-paint-r370="true" href="/scifi-ui/styles/formatx-mobile-first-paint-r358.css?v=20260827-r407-static-parity">';
const P0_MOTION_SCHEDULER = '/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js?v=20260903-r505-mag-resume-clock';
const DEFERRED_CSS_SCRIPT = '<script defer data-fx-deferred-css-r487="true" src="/scifi-ui/scripts/formatx-deferred-css-r637.js?v=20260907-r637-post-fcp-network-restore"></script>';
const MOBILE_MEDIA = '(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)';
const META_CSP = "default-src 'self';base-uri 'self';object-src 'none';script-src 'self' https://static.cloudflareinsights.com;style-src 'self' 'sha256-7rBs0DG3JKiyRfhDmfxpOZ+oAz3c/ADQoufKFW6Kd68=';img-src 'self' data: https://quickchart.io;connect-src 'self' https://api.github.com https://cloudflareinsights.com https://static.cloudflareinsights.com;form-action 'self'";
const HEADER_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' https://static.cloudflareinsights.com",
  "style-src 'self' 'sha256-7rBs0DG3JKiyRfhDmfxpOZ+oAz3c/ADQoufKFW6Kd68='",
  "img-src 'self' data: https://quickchart.io",
  "font-src 'self'",
  "connect-src 'self' https://api.github.com https://cloudflareinsights.com https://static.cloudflareinsights.com",
  "media-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');
const ROBOTS = [
  '# FormatX canonical robots policy — served by production Worker R499',
  'User-agent: *',
  'Allow: /',
  'Disallow: /api/',
  'Disallow: /scifi-ui/payment/',
  '',
  'Sitemap: https://formatxsuite.com/sitemap.xml',
  '',
].join('\n');

const DEFERRED_STYLE_PATHS = new Set([
  '/scifi-ui/styles/formatx-continuous-scroll.css',
  '/scifi-ui/styles/formatx-seamless-loop.css',
  '/scifi-ui/styles/platform-status.css',
  '/scifi-ui/styles/formatx-copy-polish.css',
  '/scifi-ui/styles/formatx-feedback.css',
  '/scifi-ui/styles/single-language-toggle.css',
  '/scifi-ui/styles/formatx-content-standard.css',
  '/scifi-ui/styles/formatx-award-readiness.css',
  '/scifi-ui/styles/formatx-flow-first-r74.css',
  '/scifi-ui/styles/formatx-mobile-reference-layout-v1.css',
  '/scifi-ui/styles/formatx-responsive-text-guard-r72.css',
  '/scifi-ui/styles/formatx-mobile-proof-controls-r204.css',
  '/scifi-ui/styles/formatx-mobile-layout-r207.css',
  '/scifi-ui/styles/formatx-native-orb-reference-r250.css',
  '/scifi-ui/styles/formatx-mobile-apex-composition.css',
]);

const R502_ASSET_REWRITES = new Map([
  ['/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js', {
    marker: 'scheduler-to-loader-r505',
    rewrites: [[/formatx-motion-runtime-loader-r239\.js\?v=[^"']+/g, 'formatx-motion-runtime-loader-r239.js?v=20260903-r505-mag-resume-clock']],
  }],
  ['/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js', {
    marker: 'loader-to-mag-shape-sync-r505',
    rewrites: [[/formatx-mag-shape-sync-r476\.js\?v=[^"']+/g, 'formatx-mag-shape-sync-r476.js?v=20260903-r505-mag-resume-clock']],
  }],
  ['/scifi-ui/scripts/living-architecture.js', {
    marker: 'living-to-igloo',
    rewrites: [[/igloo-parity\.js\?v=[^"']+/g, 'igloo-parity.js?v=20260903-r502-mobile-box-model']],
  }],
  ['/scifi-ui/scripts/igloo-parity.js', {
    marker: 'igloo-to-site-stability',
    rewrites: [[/formatx-site-stability\.css\?v=[^"']+/g, 'formatx-site-stability.css?v=20260903-r502-mobile-box-model']],
  }],
]);

function isSafeMethod(request) {
  return request.method === 'GET' || request.method === 'HEAD';
}
function isPublicRequest(url) {
  return PUBLIC_HOSTS.has(url.hostname);
}
function robotsResponse(request) {
  const headers = new Headers({
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0',
    'X-Content-Type-Options': 'nosniff',
    'X-FormatX-Robots-Owner': 'worker-r499',
    'Alt-Svc': 'clear',
    'X-FormatX-Transport-Stability': 'r514-critical-core-post-first-paint',
  });
  return new Response(request.method === 'HEAD' ? null : ROBOTS, { status: 200, headers });
}
function normalizeMetaCsp(html) {
  const source = String(html || '');
  const tag = `<meta http-equiv="Content-Security-Policy" content="${META_CSP}">`;
  if (/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i.test(source)) {
    return source.replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i, tag);
  }
  return source.replace(/<meta\s+name=["']color-scheme["'][^>]*>/i, match => `${match}\n  ${tag}`);
}
function stylesheetPath(tag) {
  const hrefMatch = tag.match(/\bhref=(["'])(.*?)\1/i);
  if (!hrefMatch) return '';
  try {
    return new URL(hrefMatch[2], 'https://formatxsuite.com/scifi-ui/').pathname;
  } catch (_) {
    return '';
  }
}
function injectReferenceModeBoot(html) {
  const source = String(html || '');
  if (source.includes('data-fx-reference-mode-boot-r504="true"') || /formatx-reference-mode-boot-r334\.js/i.test(source)) return source;
  return source.replace('</head>', `  ${REFERENCE_MODE_BOOT_SCRIPT}\n</head>`);
}
function injectCriticalFirstPaint(html) {
  let source = String(html || '');
  let introStyle = '';
  let firstFrameStyle = FIRST_FRAME_STABILITY_LINK;
  source = source.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const pathname = stylesheetPath(tag);
    // R761: keep the intro's settled hero geometry after the blocking P0 layer,
    // in the same cascade slot formerly occupied by its runtime-created link.
    if (pathname === '/scifi-ui/styles/formatx-intro-p0-r575.css') {
      introStyle = tag;
      return '';
    }
    if (pathname === '/scifi-ui/styles/formatx-first-frame-stability-r283.css') {
      // R763: the authored stylesheet covers mouse and keyboard-only desktops.
      // Do not replace its current media/cache contract with an older snapshot.
      firstFrameStyle = tag;
      return '';
    }
    if (pathname === '/scifi-ui/styles/formatx-p0-first-paint-r490.css') return '';
    if (pathname === '/scifi-ui/styles/formatx-mobile-first-paint-r358.css' && /data-fx-production-first-paint-r370/i.test(tag)) return '';
    return tag;
  });
  const critical = `  ${FIRST_PAINT_LINK}\n  ${firstFrameStyle}\n  ${P0_FIRST_PAINT_LINK}\n  ${introStyle}\n`;
  return source.replace('</head>', `${critical}</head>`);
}
function normalizeMobileStylesheetMedia(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const pathname = stylesheetPath(tag);
    if (pathname !== '/scifi-ui/styles/formatx-mobile-apex-composition.css') return tag;
    if (/\smedia=(["'])(.*?)\1/i.test(tag)) return tag;
    return tag.replace(/\s*\/?>$/, close => ` media="${MOBILE_MEDIA}"${close}`);
  });
}
function armR848DesktopFirstFrameIntro(html) {
  return String(html || '').replace(
    'class="fx-intro-complete" data-fx-intro="instant-award-r251"',
    'class="fx-intro-pending" data-fx-intro="bounded-release-pending-r848"'
  );
}
function normalizeHomepageSemantics(html) {
  let source = String(html || '');
  source = source.replace(
    /<section\s+id=["']live-os-overview["']/i,
    match => /data-fx-live-os=/i.test(match) ? match : `${match} data-fx-live-os="true"`
  );
  source = source.replace(
    /<a\b([^>]*\bclass=["'][^"']*\bskip-link\b[^"']*["'][^>]*)>/i,
    (match, attrs) => /data-fx-skip-link=/i.test(attrs) ? match : `<a${attrs} data-fx-skip-link="true">`
  );
  return source;
}
function scheduleMotionRuntime(html) {
  return String(html || '').replace(
    /<script\b([^>]*\bdata-fx-motion-runtime-loader-r239=["']true["'][^>]*)\bsrc=(["'])[^"']*formatx-motion-runtime-loader-r239\.js[^"']*\2([^>]*)><\/script>/i,
    (_match, before, quote, after) => `<script${before}src=${quote}${P0_MOTION_SCHEDULER}${quote}${after} data-fx-p0-motion-scheduler-r490="true"></script>`
  );
}
function cacheBustR502Runtime(html) {
  return String(html || '')
    .replace(/formatx-event-horizon\.js\?v=[^"']+/g, 'formatx-event-horizon.js?v=20260903-r507-mag-single-clock-owner')
    .replace(/formatx-content-runtime-loader-r241\.js\?v=[^"']+/g, 'formatx-content-runtime-loader-r241.js?v=20260902-r497-no-late-layout')
    .replace(/formatx-mag-shape-sync-r476\.js\?v=[^"']+/g, 'formatx-mag-shape-sync-r476.js?v=20260903-r505-mag-resume-clock')
    .replace(/living-architecture\.js\?v=[^"']+/g, 'living-architecture.js?v=20260903-r502-mobile-box-model')
    .replace(/platform-status\.js\?v=[^"']+/g, 'platform-status.js?v=20260902-r500-canonical-hero-state')
    .replace(/platform-status\.css\?v=[^"']+/g, 'platform-status.css?v=20260902-r500-canonical-hero-state');
}
function escapeAttribute(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function dedupeAwardReadinessStylesheet(html) {
  const source = String(html || '');
  const links = source.match(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi) || [];
  const target = '/scifi-ui/styles/formatx-award-readiness.css';
  const count = links.reduce((total, tag) => total + (stylesheetPath(tag) === target ? 1 : 0), 0);
  if (count <= 1) return source;
  let remaining = count;
  return source.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    if (stylesheetPath(tag) !== target) return tag;
    const keep = remaining === 1;
    remaining -= 1;
    return keep ? tag : '';
  });
}
function deferNonCriticalStyles(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const pathname = stylesheetPath(tag);
    if (!pathname || !DEFERRED_STYLE_PATHS.has(pathname)) return tag;
    const hrefMatch = tag.match(/\shref=(["'])(.*?)\1/i);
    if (!hrefMatch) return tag;
    const deferredHref = hrefMatch[2];
    const mediaMatch = tag.match(/\smedia=(["'])(.*?)\1/i);
    const declaredDeferredMedia = tag.match(/\sdata-fx-deferred-media-r300=(["'])(.*?)\1/i);
    const originalMedia = declaredDeferredMedia ? declaredDeferredMedia[2] : (mediaMatch ? mediaMatch[2] : 'all');
    let next = tag.replace(hrefMatch[0], '');
    if (mediaMatch) next = next.replace(mediaMatch[0], '');
    next = next.replace(/\sfetchpriority=(["'])(.*?)\1/i, '');
    next = next.replace(/\sdata-fx-r487-deferred-style=(["'])(.*?)\1/i, '');
    next = next.replace(/\sdata-fx-r487-media=(["'])(.*?)\1/i, '');
    next = next.replace(/\sdata-fx-r637-href=(["'])(.*?)\1/i, '');
    const close = /\/>$/.test(next) ? '/>' : '>';
    next = next.replace(/\s*\/?>$/, '');
    return `${next} data-fx-r637-href="${escapeAttribute(deferredHref)}" data-fx-r487-deferred-style="true" data-fx-r487-media="${escapeAttribute(originalMedia)}" media="not all"${close}`;
  });
}
function injectDeferredCssRuntime(html) {
  const source = String(html || '');
  if (source.includes('data-fx-deferred-css-r487="true"')) return source;
  return source.replace('</head>', `  ${DEFERRED_CSS_SCRIPT}\n</head>`);
}
function cacheBustCriticalQuality(html) {
  return String(html || '').replace(
    /formatx-quality-r461\.css\?v=[^"']+/g,
    'formatx-quality-r461.css?v=20260902-r500-canonical-hero-state'
  );
}
function optimizeHomepage(html) {
  let source = armR848DesktopFirstFrameIntro(html);
  source = normalizeHomepageSemantics(source);
  source = cacheBustR502Runtime(source);
  source = scheduleMotionRuntime(source);
  source = normalizeMobileStylesheetMedia(source);
  source = injectReferenceModeBoot(source);
  source = injectCriticalFirstPaint(source);
  source = cacheBustCriticalQuality(source);
  source = dedupeAwardReadinessStylesheet(source);
  source = deferNonCriticalStyles(source);
  source = injectDeferredCssRuntime(source);
  return source;
}
function r848FirstFrameIntroCss(source) {
  return String(source || '') + `
@media (prefers-reduced-motion: no-preference) and (min-width: 901px) {
  html.fx-intro-pending #formatx-event-horizon.fx-intro-overlay[hidden] {
    display: grid !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: none !important;
  }
}
/* production-r848-desktop-intro-first-frame-owner */
`;
}
function stripNestedFirstFrameImport(css) {
  return String(css || '').replace(/^\s*@import\s+url\(["']?\.\/formatx-first-frame-stability-r283\.css[^)]*\)\s*;\s*/i, '');
}
function r845StaticDesktopIntroCss(source) {
  return String(source || '') + `
@keyframes fx-r846-mag-core-breathe {
  0% { opacity: .18; transform: translate(-50%,-50%) scale(.72); }
  42% { opacity: .58; transform: translate(-50%,-50%) scale(1.04); }
  72% { opacity: .82; transform: translate(-50%,-50%) scale(.94); }
  100% { opacity: .42; transform: translate(-50%,-50%) scale(1); }
}
@keyframes fx-r846-mag-portal-turn {
  0% { transform: translate(-50%,-50%) scale(.82) rotate(-20deg); }
  55% { transform: translate(-50%,-50%) scale(1.03) rotate(8deg); }
  100% { transform: translate(-50%,-50%) scale(.96) rotate(24deg); }
}
@keyframes fx-r846-mag-scan {
  0% { opacity: 0; transform: translate(-50%,-74px) scaleX(.18); }
  28% { opacity: .26; }
  62% { opacity: .72; transform: translate(-50%,0) scaleX(1); }
  100% { opacity: 0; transform: translate(-50%,74px) scaleX(.32); }
}
@media (prefers-reduced-motion: no-preference) and (min-width: 901px) {
  #formatx-event-horizon[data-fx-preloader-r531="active"] {
    background: linear-gradient(145deg,#01040b 0%,#030917 52%,#08051a 100%) !important;
  }
  #formatx-event-horizon[data-fx-preloader-r531="active"] .fx-intro-center,
  #formatx-event-horizon[data-fx-preloader-r531="active"] .fx-intro-progress-wrap,
  #formatx-event-horizon[data-fx-preloader-r531="active"] .fx-intro-meta {
    position: relative !important;
    z-index: 4 !important;
  }
  #formatx-event-horizon[data-fx-preloader-r531="active"] .fx-intro-grid {
    display: block !important;
    visibility: visible !important;
    position: absolute !important;
    inset: 16% 18% !important;
    z-index: 0 !important;
    opacity: .14 !important;
    transform: none !important;
    filter: none !important;
    background-image:
      linear-gradient(rgba(124,236,255,.035) 1px,transparent 1px),
      linear-gradient(90deg,rgba(124,236,255,.035) 1px,transparent 1px) !important;
    background-size: 42px 42px !important;
    mask-image: radial-gradient(circle at 50% 50%,#000 0 30%,rgba(0,0,0,.82) 50%,transparent 76%) !important;
    -webkit-mask-image: radial-gradient(circle at 50% 50%,#000 0 30%,rgba(0,0,0,.82) 50%,transparent 76%) !important;
    animation: none !important;
    transition: opacity 120ms ease !important;
    will-change: auto !important;
  }
  #formatx-event-horizon[data-fx-preloader-r531="active"] .fx-intro-portal {
    display: block !important;
    visibility: visible !important;
    position: absolute !important;
    left: 50% !important;
    top: 48% !important;
    inset: auto !important;
    z-index: 1 !important;
    width: min(38vw,390px) !important;
    height: min(38vw,390px) !important;
    aspect-ratio: 1 !important;
    border-radius: 50% !important;
    opacity: .48 !important;
    filter: none !important;
    box-shadow: 0 0 54px rgba(76,220,255,.08), inset 0 0 34px rgba(118,105,255,.08) !important;
    animation: fx-r846-mag-portal-turn 1480ms cubic-bezier(.22,.61,.36,1) both !important;
    will-change: transform,opacity !important;
  }
  #formatx-event-horizon[data-fx-preloader-r531="active"] .fx-intro-flare {
    display: block !important;
    visibility: visible !important;
    position: absolute !important;
    left: 50% !important;
    top: 48% !important;
    inset: auto !important;
    z-index: 2 !important;
    width: min(25vw,250px) !important;
    height: min(25vw,250px) !important;
    border-radius: 50% !important;
    background: radial-gradient(circle,rgba(235,253,255,.80) 0 3%,rgba(105,226,255,.28) 12%,rgba(104,90,255,.14) 34%,transparent 68%) !important;
    box-shadow: 0 0 24px rgba(156,247,255,.28),0 0 72px rgba(82,121,255,.12) !important;
    filter: none !important;
    animation: fx-r846-mag-core-breathe 1320ms ease-in-out both !important;
    will-change: transform,opacity !important;
  }
  #formatx-event-horizon[data-fx-preloader-r531="active"] .fx-intro-scan {
    display: block !important;
    visibility: visible !important;
    position: absolute !important;
    left: 50% !important;
    top: 48% !important;
    inset: auto !important;
    z-index: 3 !important;
    width: min(46vw,520px) !important;
    height: 2px !important;
    opacity: 0;
    background: linear-gradient(90deg,transparent,rgba(124,236,255,.82),rgba(143,114,255,.46),transparent) !important;
    box-shadow: 0 0 16px rgba(124,236,255,.24) !important;
    filter: none !important;
    animation: fx-r846-mag-scan 1080ms cubic-bezier(.22,.61,.36,1) both !important;
    will-change: transform,opacity !important;
  }
  #formatx-event-horizon[data-fx-preloader-r531="active"] .fx-intro-word {
    color: #f7fdff !important;
    transition: color 120ms ease !important;
    text-shadow: none !important;
    -webkit-text-stroke: 0 !important;
  }
  #formatx-event-horizon[data-fx-preloader-r531="active"] .fx-intro-word span {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    background: none !important;
    color: #f7fdff !important;
    -webkit-text-fill-color: currentColor !important;
    animation: none !important;
    transition: none !important;
  }
  #formatx-event-horizon[data-fx-preloader-r531="active"][data-fx-intro-phase-r635="wake"] .fx-intro-grid { opacity: .08 !important; }
  #formatx-event-horizon[data-fx-preloader-r531="active"][data-fx-intro-phase-r635="wake"] .fx-intro-portal { opacity: .34 !important; }
  #formatx-event-horizon[data-fx-preloader-r531="active"][data-fx-intro-phase-r635="wake"] .fx-intro-flare { opacity: .28 !important; }
  #formatx-event-horizon[data-fx-preloader-r531="active"][data-fx-intro-phase-r635="sync"] .fx-intro-grid { opacity: .16 !important; }
  #formatx-event-horizon[data-fx-preloader-r531="active"][data-fx-intro-phase-r635="sync"] .fx-intro-portal { opacity: .62 !important; }
  #formatx-event-horizon[data-fx-preloader-r531="active"][data-fx-intro-phase-r635="sync"] .fx-intro-flare { opacity: .56 !important; }
  #formatx-event-horizon[data-fx-preloader-r531="active"][data-fx-intro-phase-r635="ready"] .fx-intro-grid { opacity: .20 !important; }
  #formatx-event-horizon[data-fx-preloader-r531="active"][data-fx-intro-phase-r635="ready"] .fx-intro-portal { opacity: .78 !important; }
  #formatx-event-horizon[data-fx-preloader-r531="active"][data-fx-intro-phase-r635="ready"] .fx-intro-flare { opacity: .72 !important; }
}
/* production-r846-desktop-living-mag-intro-lcp */
`;
}
async function rewriteR845IntroAsset(url, response, headers) {
  const contentType = headers.get('Content-Type') || '';
  if (url.pathname === EVENT_HORIZON_SCRIPT_PATH && /javascript|text\/plain/i.test(contentType)) {
    let source = await response.text();
    const compact = "force(center,'width','min(520px, calc(100vw - 40px))');force(word,'font-size','clamp(32px,5vw,56px)');";
    const staticDesktop = "force(center,'width',MOBILE?'min(520px, calc(100vw - 40px))':'min(700px, calc(100vw - 80px))');force(word,'font-size',MOBILE?'clamp(32px,5vw,56px)':'clamp(64px,8.8vw,124px)');";
    if (!source.includes(compact)) return null;
    source = source.replace(compact, staticDesktop);
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('X-FormatX-R845-Intro-LCP', 'static-desktop-word');
    return new Response(source, { status: response.status, statusText: response.statusText, headers });
  }
  if (url.pathname === INTRO_P0_PATH && contentType.includes('text/css')) {
    const source = r845StaticDesktopIntroCss(await response.text());
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('X-FormatX-R845-Intro-LCP', 'static-desktop-word');
    return new Response(source, { status: response.status, statusText: response.statusText, headers });
  }
  return null;
}

async function rewriteR502DeliveryAsset(url, response, headers) {
  const spec = R502_ASSET_REWRITES.get(url.pathname);
  if (!spec) return null;
  let source = await response.text();
  for (const [pattern, replacement] of spec.rewrites) source = source.replace(pattern, replacement);
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('X-FormatX-R502-Asset-Graph', spec.marker);
  headers.set('X-FormatX-R505-Asset-Graph', spec.marker);
  return new Response(source, { status: response.status, statusText: response.statusText, headers });
}
function mergeHomepageLinkHeader(existing) {
  const values = String(existing || '')
    .split(/,\s*(?=<)/)
    .map(value => value.trim())
    .filter(Boolean)
    .filter(value => !value.includes('/scifi-ui/styles/formatx-p0-first-paint-r490.css'))
    .filter(value => !value.includes('/scifi-ui/styles/formatx-intro-p0-r575.css'));
  return [...values, P0_FIRST_PAINT_PRELOAD, INTRO_P0_PRELOAD].join(', ');
}
async function stabilizePublicResponse(request, url, response) {
  if (!isSafeMethod(request) || !isPublicRequest(url)) return response;
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', HEADER_CSP);
  headers.set('Alt-Svc', 'clear');
  headers.set('X-FormatX-Transport-Stability', 'r514-critical-core-post-first-paint');
  headers.set('X-FormatX-Edge-Stability', `r514-critical-core:${STARTUP_REVISION}`);
  headers.set('X-FormatX-CSS-Scheduler', 'r514-critical-core-r487-post-first-paint-r504-prepaint');
  headers.set('X-FormatX-Motion-Scheduler', 'r507-single-css-animation-clock-owner');
  headers.set('X-FormatX-Mag-Clock-Owner', 'shape-sync-r476-only');
  if (HOMEPAGE_PATHS.has(url.pathname)) {
    headers.set('Link', mergeHomepageLinkHeader(headers.get('Link')));
  }
  if (request.method === 'HEAD') {
    headers.delete('Content-Length');
    return new Response(null, { status: response.status, statusText: response.statusText, headers });
  }
  const contentType = headers.get('Content-Type') || '';
  if (url.pathname === EVENT_HORIZON_PATH && contentType.includes('text/css')) {
    const css = r848FirstFrameIntroCss(stripNestedFirstFrameImport(await response.text()));
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('X-FormatX-First-Frame-Import', 'removed-r499-canonical-owner');
    return new Response(css, { status: response.status, statusText: response.statusText, headers });
  }
  const r845IntroAsset = await rewriteR845IntroAsset(url, response, headers);
  if (r845IntroAsset) return r845IntroAsset;
  const r502Asset = await rewriteR502DeliveryAsset(url, response, headers);
  if (r502Asset) return r502Asset;
  if (!contentType.includes('text/html')) {
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
  let html = await response.text();
  html = normalizeMetaCsp(html);
  if (HOMEPAGE_PATHS.has(url.pathname)) html = optimizeHomepage(html);
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');
  headers.set('Cache-Control', 'no-store, max-age=0');
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (isSafeMethod(request) && isPublicRequest(url) && url.pathname === '/robots.txt') {
      return robotsResponse(request);
    }
    const response = await productionBase.fetch(request, env, ctx);
    return stabilizePublicResponse(request, url, response);
  },
};
