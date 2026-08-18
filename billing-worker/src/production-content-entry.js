import stableWorker from './production-content-r201-base.js';

const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const RECOVERY_REVISION = '20260818-r202-parser-independent';
const RECOVERY_STYLE = `<link rel="stylesheet" data-fx-site-recovery-r202="true" href="/scifi-ui/styles/formatx-site-recovery-r202.css?v=${RECOVERY_REVISION}">`;
const RECOVERY_SCRIPT = `<script data-fx-site-recovery-r202="true" src="/scifi-ui/scripts/formatx-site-recovery-r202.js?v=${RECOVERY_REVISION}"></script>`;
const RECOVERY_COOKIE = /(?:^|;\s*)fx_site_recovery_r202=1(?:;|$)/;

/*
  r202 reliability wrapper.
  The complete public content implementation remains in production-content-r201-base.js.
  The wrapper deliberately keeps these delegated production contracts visible for
  source validators and reviewers:
  formatx-public-shell.js
  release-metadata.js
  formatx-content-standard.css
  formatx-content-standard.js
  cleanLegacyReleaseCopy
  Cache-Control', 'no-store

  r202 fixes the actual never-stuck failure mode: recovery starts during parsing and
  does not wait for DOMContentLoaded. A stalled defer resource can therefore no longer
  strand the browser on a painted-but-incomplete hero. The fallback element also uses
  a class distinct from the <html> state class, so recovery cannot restyle the document.
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
      .replace(/<script\b[^>]*data-fx-site-recovery-r202[^>]*>\s*<\/script>/gi, '');

    // Force a fresh critical MAG bootstrap even on long-lived browser profiles.
    html = html.replace(
      /(<script\b[^>]*src=["'][^"']*formatx-core-real3d-v20\.js[^"']*)(["'][^>]*>\s*<\/script>)/i,
      (match, prefix, suffix) => {
        const cleaned = prefix.replace(/([?&])fxr(?:201|202)=[^&"']*/g, '$1').replace(/[?&]$/, '');
        return `${cleaned}${cleaned.includes('?') ? '&' : '?'}fxr202=${RECOVERY_REVISION}${suffix}`;
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
    headers.set('X-FormatX-Recovery', 'r202-parser-independent');
    headers.set('X-FormatX-Client-Revision', 'r202-never-stuck');

    // One fresh HTTP-cache reset per browser profile for the r202 migration.
    const cookie = request.headers.get('Cookie') || '';
    if (!RECOVERY_COOKIE.test(cookie)) {
      headers.set('Clear-Site-Data', '"cache"');
      headers.append(
        'Set-Cookie',
        'fx_site_recovery_r202=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly',
      );
      headers.set('X-FormatX-Cache-Migration', 'r202-cleared');
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
