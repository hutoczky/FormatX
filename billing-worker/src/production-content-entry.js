import productionBase from './production-content-entry-r369-base.js';

/* FormatX R498 — canonical first-frame DOM + persistent MAG clock.
   R497 proved that promoting whole legacy CSS bundles adds blocking work and
   mobile overflow without removing the remaining CLS. R498 leaves those legacy
   bundles dormant, keeps layout CSS immutable after response delivery, and
   serializes the final hero control/proof surfaces directly into the production
   HTML so the first paint already owns the same DOM that runtime binds. */

const STARTUP_REVISION = '20260902-r498-static-hero-persistent-mag';
const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const EVENT_HORIZON_PATH = '/scifi-ui/styles/formatx-event-horizon.css';
const FIRST_FRAME_STABILITY_LINK = '<link rel="stylesheet" fetchpriority="high" media="(prefers-reduced-motion: no-preference) and (min-width: 901px) and (pointer: fine)" data-fx-first-frame-stability-r498="true" href="/scifi-ui/styles/formatx-first-frame-stability-r283.css?v=20260902-r498-static-hero">';
const P0_FIRST_PAINT_LINK = '<link rel="stylesheet" fetchpriority="high" data-fx-p0-first-paint-r498="true" href="/scifi-ui/styles/formatx-p0-first-paint-r490.css?v=20260902-r498-static-hero">';
const FIRST_PAINT_LINK = '<link rel="stylesheet" fetchpriority="high" media="(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)" data-fx-mobile-first-paint-r358="true" data-fx-production-first-paint-r370="true" href="/scifi-ui/styles/formatx-mobile-first-paint-r358.css?v=20260827-r407-static-parity">';
const P0_MOTION_SCHEDULER = '/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js?v=20260902-r493-explicit-intent';
const DEFERRED_CSS_SCRIPT = '<script defer data-fx-deferred-css-r487="true" src="/scifi-ui/scripts/formatx-deferred-css-r487.js?v=20260831-r487-first-paint"></script>';
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
  '# FormatX canonical robots policy — served by production Worker R498',
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
    'X-FormatX-Robots-Owner': 'worker-r498',
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
function injectCriticalFirstPaint(html) {
  let source = String(html || '');
  source = source.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const pathname = stylesheetPath(tag);
    if (pathname === '/scifi-ui/styles/formatx-first-frame-stability-r283.css') return '';
    if (pathname === '/scifi-ui/styles/formatx-p0-first-paint-r490.css') return '';
    if (pathname === '/scifi-ui/styles/formatx-mobile-first-paint-r358.css' && /data-fx-production-first-paint-r370/i.test(tag)) return '';
    return tag;
  });
  const critical = `  ${FIRST_PAINT_LINK}\n  ${FIRST_FRAME_STABILITY_LINK}\n  ${P0_FIRST_PAINT_LINK}\n`;
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
function heroStrings(url) {
  const en = url.searchParams.get('lang') === 'en';
  return en ? {
    heading: 'DISCOVER HOW IT WORKS',
    title: 'Proof behind the visual.',
    body: 'FormatX does not ask for blind trust: releases, tests, limitations and the security model are separately and publicly verifiable.',
    ask: 'ASK',
    askAria: 'Ask FormatX',
    controls: 'Hero controls',
    pause: 'Pause animation',
    sound: 'Enable FormatX audio',
    live: 'Live OS — open workflow',
    heart: 'Activate the living FormatX core',
    heartTitle: 'Interact with the living core',
  } : {
    heading: 'A MŰKÖDÉS MEGISMERÉSE',
    title: 'Bizonyíték a látvány mögött.',
    body: 'A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető.',
    ask: 'KÉRDEZZ',
    askAria: 'Kérdezz a FormatX-től',
    controls: 'Hero vezérlők',
    pause: 'Animáció szüneteltetése',
    sound: 'FormatX hang bekapcsolása',
    live: 'Live OS — munkafolyamat megnyitása',
    heart: 'A FormatX élő MAG interakciójának indítása',
    heartTitle: 'Interakció az élő MAG-gal',
  };
}
function escapeHtml(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function injectStaticHeroSurfaces(html, url) {
  let source = String(html || '');
  const strings = heroStrings(url);

  if (!source.includes('data-fx-static-hero-grid-r498="true"')) {
    const gridSurfaces = `\n        <div class="fx-reference-heading" data-fx-static-hero-grid-r498="true">${escapeHtml(strings.heading)}</div>\n        <article class="fx-reference-proof" data-fx-static-proof-r498="true"><span class="fx-reference-proof-kicker">PUBLIC PROOF LAYER</span><h2>${escapeHtml(strings.title)}</h2><p>${escapeHtml(strings.body)}</p><a class="fx-reference-liveos" href="#experience" aria-label="${escapeHtml(strings.live)}">Live OS</a></article>`;
    source = source.replace('<div class="hero-grid">', `<div class="hero-grid">${gridSurfaces}`);
  }

  if (!source.includes('data-fx-static-controls-r498="true"')) {
    const controls = `\n          <div class="fx-reference-controls-r204 fx-reference-controls-r264" data-fx-static-controls-r498="true" aria-label="${escapeHtml(strings.controls)}"><button type="button" class="fx-three-sound fx-wda-sound-toggle fx-control-owner-r264" aria-pressed="false" aria-label="${escapeHtml(strings.sound)}"><span class="fx-wda-sound-icon" data-fx-wda-sound-label="true" aria-hidden="true">◌</span></button><div class="fx-reference-rail fx-reference-rail-r264"><button type="button" class="fx-reference-ask" aria-label="${escapeHtml(strings.askAria)}"><i aria-hidden="true"></i><span>${escapeHtml(strings.ask)}</span></button><button type="button" class="fx-reference-pause" data-paused="false" aria-pressed="false" aria-label="${escapeHtml(strings.pause)}">Ⅱ</button></div></div>\n          <button type="button" class="fx-mag-heart-hit-r252" data-fx-heart-core-r252="true" data-fx-static-heart-r498="true" aria-label="${escapeHtml(strings.heart)}" title="${escapeHtml(strings.heartTitle)}"></button>`;
    source = source.replace('<div class="hero-space">', `<div class="hero-space">${controls}`);
  }
  return source;
}
function scheduleMotionRuntime(html) {
  return String(html || '').replace(
    /<script\b([^>]*\bdata-fx-motion-runtime-loader-r239=["']true["'][^>]*)\bsrc=(["'])[^"']*formatx-motion-runtime-loader-r239\.js[^"']*\2([^>]*)><\/script>/i,
    (_match, before, quote, after) => `<script${before}src=${quote}${P0_MOTION_SCHEDULER}${quote}${after} data-fx-p0-motion-scheduler-r490="true"></script>`
  );
}
function cacheBustR498Runtime(html) {
  return String(html || '')
    .replace(/formatx-event-horizon\.js\?v=[^"']+/g, 'formatx-event-horizon.js?v=20260902-r498-static-surfaces')
    .replace(/formatx-content-runtime-loader-r241\.js\?v=[^"']+/g, 'formatx-content-runtime-loader-r241.js?v=20260902-r497-no-late-layout')
    .replace(/formatx-mag-shape-sync-r476\.js\?v=[^"']+/g, 'formatx-mag-shape-sync-r476.js?v=20260902-r498-persistent-pause-clock');
}
function escapeAttribute(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function deferNonCriticalStyles(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const pathname = stylesheetPath(tag);
    if (!pathname || !DEFERRED_STYLE_PATHS.has(pathname)) return tag;
    const mediaMatch = tag.match(/\smedia=(["'])(.*?)\1/i);
    const originalMedia = mediaMatch ? mediaMatch[2] : 'all';
    let next = mediaMatch ? tag.replace(mediaMatch[0], '') : tag;
    const close = /\/>$/.test(next) ? '/>' : '>';
    next = next.replace(/\s*\/?>$/, '');
    return `${next} data-fx-r487-deferred-style="true" data-fx-r487-media="${escapeAttribute(originalMedia)}" media="print"${close}`;
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
    'formatx-quality-r461.css?v=20260902-r498-static-hero'
  );
}
function optimizeHomepage(html, url) {
  let source = normalizeHomepageSemantics(html);
  source = injectStaticHeroSurfaces(source, url);
  source = cacheBustR498Runtime(source);
  source = scheduleMotionRuntime(source);
  source = normalizeMobileStylesheetMedia(source);
  source = injectCriticalFirstPaint(source);
  source = cacheBustCriticalQuality(source);
  source = deferNonCriticalStyles(source);
  source = injectDeferredCssRuntime(source);
  return source;
}
function stripNestedFirstFrameImport(css) {
  return String(css || '').replace(/^\s*@import\s+url\(["']?\.\/formatx-first-frame-stability-r283\.css[^)]*\)\s*;\s*/i, '');
}
async function stabilizePublicResponse(request, url, response) {
  if (!isSafeMethod(request) || !isPublicRequest(url)) return response;
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', HEADER_CSP);
  headers.set('X-FormatX-Edge-Stability', `r498-static-hero:${STARTUP_REVISION}`);
  headers.set('X-FormatX-CSS-Scheduler', 'r498-no-legacy-bundle-promotion-no-interaction-media-mutation');
  headers.set('X-FormatX-Motion-Scheduler', 'r493-explicit-intent-late-auto');
  if (request.method === 'HEAD') {
    headers.delete('Content-Length');
    return new Response(null, { status: response.status, statusText: response.statusText, headers });
  }
  const contentType = headers.get('Content-Type') || '';
  if (url.pathname === EVENT_HORIZON_PATH && contentType.includes('text/css')) {
    const css = stripNestedFirstFrameImport(await response.text());
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('X-FormatX-First-Frame-Import', 'removed-r498-canonical-owner');
    return new Response(css, { status: response.status, statusText: response.statusText, headers });
  }
  if (!contentType.includes('text/html')) {
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
  let html = await response.text();
  html = normalizeMetaCsp(html);
  if (HOMEPAGE_PATHS.has(url.pathname)) html = optimizeHomepage(html, url);
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
