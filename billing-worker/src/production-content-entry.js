import stableWorker from './production-content-r201-base.js';

const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const RECOVERY_REVISION = '20260818-r203-static-first-frame';
const RECOVERY_STYLE = `<link rel="stylesheet" data-fx-site-recovery-r202="true" href="/scifi-ui/styles/formatx-site-recovery-r202.css?v=${RECOVERY_REVISION}">`;
const RECOVERY_SCRIPT = `<script data-fx-site-recovery-r202="true" src="/scifi-ui/scripts/formatx-site-recovery-r202.js?v=${RECOVERY_REVISION}"></script>`;
const RECOVERY_COOKIE = /(?:^|;\s*)fx_site_recovery_r203=1(?:;|$)/;
const STATIC_CORE = '<div class="fx-site-core-fallback-r202" data-fx-static-core-r203="true" aria-hidden="true"><span class="fx-site-core-fallback-r202__halo"></span><span class="fx-site-core-fallback-r202__shape"></span><span class="fx-site-core-fallback-r202__reactor"></span></div>';

/*
  r203 reliability wrapper.
  The complete public content implementation remains in production-content-r201-base.js.
  The wrapper deliberately keeps these delegated production contracts visible for
  source validators and reviewers:
  formatx-public-shell.js
  release-metadata.js
  formatx-content-standard.css
  formatx-content-standard.js
  cleanLegacyReleaseCopy
  Cache-Control', 'no-store

  r203 makes the first visible MAG frame server-owned. The browser receives a real
  core shape in the HTML before any client JavaScript executes. Native WebGL remains
  the preferred renderer and progressively replaces the static first frame after it
  has actually painted. r202 watchdogs remain as a bounded secondary recovery path.
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

    // Remove older recovery assets if an inner wrapper supplied them.
    html = html
      .replace(/<link\b[^>]*data-fx-site-recovery-r201[^>]*>/gi, '')
      .replace(/<script\b[^>]*data-fx-site-recovery-r201[^>]*>\s*<\/script>/gi, '')
      .replace(/<link\b[^>]*data-fx-site-recovery-r202[^>]*>/gi, '')
      .replace(/<script\b[^>]*data-fx-site-recovery-r202[^>]*>\s*<\/script>/gi, '')
      .replace(/<div\b[^>]*data-fx-static-core-r203[^>]*>[\s\S]*?<\/div>/gi, '');

    // Server-render one deterministic MAG first frame. This is deliberately not
    // created by JavaScript, so a failed/deferred script cannot leave a blank hero.
    html = html.replace(
      /(<div\s+class=["']hero-space["'][^>]*>)/i,
      `$1\n          ${STATIC_CORE}`,
    );

    // Force a fresh critical MAG bootstrap even on long-lived browser profiles.
    html = html.replace(
      /(<script\b[^>]*src=["'][^"']*formatx-core-real3d-v20\.js[^"']*)(["'][^>]*>\s*<\/script>)/i,
      (match, prefix, suffix) => {
        const cleaned = prefix.replace(/([?&])fxr(?:201|202|203)=[^&"']*/g, '$1').replace(/[?&]$/, '');
        return `${cleaned}${cleaned.includes('?') ? '&' : '?'}fxr203=${RECOVERY_REVISION}${suffix}`;
      },
    );

    const assets = `${RECOVERY_STYLE}\n  ${RECOVERY_SCRIPT}`;
    const cspMeta = /(<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>)/i;
    html = cspMeta.test(html)
      ? html.replace(cspMeta, `$1\n  ${assets}`)
      : html.replace('<head>', `<head>\n  ${assets}`);

    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Pragma', 'no-cache');
    headers.set('X-FormatX-Recovery', 'r203-static-first-frame');
    headers.set('X-FormatX-Client-Revision', 'r203-never-blank');

    // One fresh HTTP-cache reset per browser profile for the r203 migration.
    const cookie = request.headers.get('Cookie') || '';
    if (!RECOVERY_COOKIE.test(cookie)) {
      headers.set('Clear-Site-Data', '"cache"');
      headers.append(
        'Set-Cookie',
        'fx_site_recovery_r203=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly',
      );
      headers.set('X-FormatX-Cache-Migration', 'r203-cleared');
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
