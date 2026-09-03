import r514Production from './production-content-entry.js';

/* FormatX R515 — restore first-paint geometry ownership after R514 proved that
   formatx-critical-core-r227.css is structural, not paint-only. Keep the R514
   implementation frozen underneath and undo only its deferred treatment of the
   critical-core stylesheet. MAG runtime/clock/renderer ownership is untouched. */

const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const CRITICAL_CORE_PATH = '/scifi-ui/styles/formatx-critical-core-r227.css';

function isSafeMethod(request) {
  return request.method === 'GET' || request.method === 'HEAD';
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

function r515Headers(source) {
  const headers = new Headers(source);
  headers.set('X-FormatX-Transport-Stability', 'r515-critical-core-first-paint');
  headers.set('X-FormatX-Edge-Stability', 'r515-critical-core-first-paint-geometry');
  headers.set('X-FormatX-CSS-Scheduler', 'r515-critical-core-first-paint-r487-deferred-enhancements');
  return headers;
}

export default {
  async fetch(request, env, ctx) {
    const response = await r514Production.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (!isSafeMethod(request) || !PUBLIC_HOSTS.has(url.hostname)) return response;

    const headers = r515Headers(response.headers);
    if (request.method === 'HEAD') {
      headers.delete('Content-Length');
      return new Response(null, { status: response.status, statusText: response.statusText, headers });
    }

    const contentType = headers.get('Content-Type') || '';
    if (!contentType.includes('text/html')) {
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    const html = restoreCriticalCoreFirstPaint(await response.text());
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('Cache-Control', 'no-store, max-age=0');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  },
};
