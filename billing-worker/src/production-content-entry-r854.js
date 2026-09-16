import canonicalProduction from './production-content-entry.js';

/* FormatX R854 — R837 evidence-locked Lighthouse probe.
   Preserve the exact R837 canonical production wrapper and header contract.
   1) Start the already-blocking intro stylesheet earlier from the HTTP Link header.
   2) Keep superseded R206 first-paint CSS eventual instead of render-blocking.
   The canonical P0/mobile/desktop geometry owners and their cascade stay untouched. */

const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const INTRO_P0_PATH = '/scifi-ui/styles/formatx-intro-p0-r575.css';
const INTRO_P0_PRELOAD = '<' + INTRO_P0_PATH + '?v=20260907-r635-three-phase-absolute-reveal>; rel=preload; as=style';
const LEGACY_FIRST_PAINT_PATH = '/scifi-ui/styles/formatx-first-paint-r206.css';

function mergeIntroPreload(existing) {
  const values = String(existing || '')
    .split(/,\s*(?=<)/)
    .map(value => value.trim())
    .filter(Boolean)
    .filter(value => !value.includes(INTRO_P0_PATH));
  return [...values, INTRO_P0_PRELOAD].join(', ');
}

function escapeAttribute(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function deferLegacyFirstPaint(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const hrefMatch = tag.match(/\shref=(["'])(.*?)\1/i);
    if (!hrefMatch || !hrefMatch[2].includes(LEGACY_FIRST_PAINT_PATH)) return tag;

    const deferredHref = hrefMatch[2];
    const mediaMatch = tag.match(/\smedia=(["'])(.*?)\1/i);
    const originalMedia = mediaMatch ? mediaMatch[2] : 'all';
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

export default {
  async fetch(request, env, ctx) {
    const response = await canonicalProduction.fetch(request, env, ctx);
    const url = new URL(request.url);
    const safeMethod = request.method === 'GET' || request.method === 'HEAD';
    if (!safeMethod || !PUBLIC_HOSTS.has(url.hostname) || !HOMEPAGE_PATHS.has(url.pathname)) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set('Link', mergeIntroPreload(headers.get('Link')));
    if (request.method === 'HEAD') {
      headers.delete('Content-Length');
      return new Response(null, { status: response.status, statusText: response.statusText, headers });
    }

    const contentType = headers.get('Content-Type') || '';
    if (!contentType.includes('text/html')) {
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    const html = deferLegacyFirstPaint(await response.text());
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  },
};
