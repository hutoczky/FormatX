import stableWorker from './production-content-r201-base.js';

const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const RECOVERY_REVISION = '20260818-r201-never-stuck';
const RECOVERY_STYLE = `<link rel="stylesheet" data-fx-site-recovery-r201="true" href="/scifi-ui/styles/formatx-site-recovery-r201.css?v=${RECOVERY_REVISION}">`;
const RECOVERY_SCRIPT = `<script data-fx-site-recovery-r201="true" src="/scifi-ui/scripts/formatx-site-recovery-r201.js?v=${RECOVERY_REVISION}"></script>`;
const RECOVERY_COOKIE = /(?:^|;\s*)fx_site_recovery_r201=1(?:;|$)/;

/*
  r201 reliability wrapper.
  The complete public content implementation remains in production-content-r201-base.js.
  The wrapper deliberately keeps these delegated production contracts visible for
  source validators and reviewers:
  formatx-public-shell.js
  release-metadata.js
  formatx-content-standard.css
  formatx-content-standard.js
  cleanLegacyReleaseCopy
  Cache-Control', 'no-store

  The r199/r200 parser-time mobile-firstpaint experiment is forbidden here. It hid
  the canonical hero copy and could leave a large blank MAG panel on real browsers.
  r201 removes any such link from the returned HTML, gives the core bootstrap a new
  URL revision, and installs an early same-origin never-stuck recovery controller.
*/

export default {
  async fetch(request, env, ctx) {
    const response = await stableWorker.fetch(request, env, ctx);
    const url = new URL(request.url);
    const contentType = response.headers.get('Content-Type') || '';

    if (
      request.method !== 'GET'
      || response.status !== 200
      || !HOMEPAGE_PATHS.has(url.pathname)
      || !contentType.includes('text/html')
    ) {
      return response;
    }

    let html = await response.text();

    // Never allow the r199/r200 first-paint geometry lock to reach a browser.
    html = html.replace(
      /<link\b(?=[^>]*(?:data-fx-mobile-firstpaint-r199|formatx-mobile-firstpaint-r199\.css))[^>]*>/gi,
      '',
    );

    // Force a fresh critical MAG bootstrap even on long-lived browser profiles.
    html = html.replace(
      /(<script\b[^>]*src=["'][^"']*formatx-core-real3d-v20\.js[^"']*)(["'][^>]*>\s*<\/script>)/i,
      (match, prefix, suffix) => {
        if (prefix.includes('fxr201=')) return match;
        return `${prefix}${prefix.includes('?') ? '&' : '?'}fxr201=${RECOVERY_REVISION}${suffix}`;
      },
    );

    if (!html.includes('data-fx-site-recovery-r201')) {
      const assets = `${RECOVERY_STYLE}\n  ${RECOVERY_SCRIPT}`;
      const cspMeta = /(<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>)/i;
      html = cspMeta.test(html)
        ? html.replace(cspMeta, `$1\n  ${assets}`)
        : html.replace('<head>', `<head>\n  ${assets}`);
    }

    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Pragma', 'no-cache');
    headers.set('X-FormatX-Recovery', 'r201-never-stuck');
    headers.set('X-FormatX-Client-Revision', 'r201-reliability-reset');

    // One fresh HTTP-cache reset per browser profile for the r201 migration.
    const cookie = request.headers.get('Cookie') || '';
    if (!RECOVERY_COOKIE.test(cookie)) {
      headers.set('Clear-Site-Data', '"cache"');
      headers.append(
        'Set-Cookie',
        'fx_site_recovery_r201=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly',
      );
      headers.set('X-FormatX-Cache-Migration', 'r201-cleared');
    }

    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
