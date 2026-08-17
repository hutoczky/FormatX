import contentEntry from './production-content-entry.js';

const HOMEPAGE_ALIASES = new Set([
  '/',
  '/index.html',
  '/scifi-ui',
  '/scifi-ui/',
  '/scifi-ui/index.html',
]);

const CACHEABLE_PREFIXES = Object.freeze({
  scripts: '/scifi-ui/scripts/',
  styles: '/scifi-ui/styles/',
  assets: '/scifi-ui/assets/',
  data: '/scifi-ui/data/',
});

const PROOF_NAV = `<nav class="fx-award-proof-r193" data-fx-award-proof-r193="true" aria-label="Nyilvános bizonyíték / Public proof">
  <a href="/method" data-hu="MÓDSZER" data-en="METHOD">MÓDSZER</a>
  <a href="/verification" data-hu="ELLENŐRZÉS" data-en="VERIFICATION">ELLENŐRZÉS</a>
  <a href="/test-matrix" data-hu="TESZTMÁTRIX" data-en="TEST MATRIX">TESZTMÁTRIX</a>
  <a href="/known-issues" data-hu="ISMERT HIBÁK" data-en="KNOWN ISSUES">ISMERT HIBÁK</a>
</nav>`;

const PROOF_STYLE = `<style data-fx-award-proof-style-r193>
.fx-award-proof-r193{margin-top:18px;display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center}
.fx-award-proof-r193 a{position:relative;color:rgba(205,228,239,.66);font-size:8px;font-weight:800;letter-spacing:.12em;text-decoration:none;text-transform:uppercase;transition:color .18s ease}
.fx-award-proof-r193 a::after{content:"";position:absolute;right:0;bottom:-4px;left:0;height:1px;background:rgba(124,236,255,.48);transform:scaleX(.25);transform-origin:left;transition:transform .18s ease}
.fx-award-proof-r193 a:hover,.fx-award-proof-r193 a:focus-visible{color:#fff}
.fx-award-proof-r193 a:hover::after,.fx-award-proof-r193 a:focus-visible::after{transform:scaleX(1)}
@media(max-width:900px),(pointer:coarse){.fx-award-proof-r193{margin-top:16px;gap:10px 16px}.fx-award-proof-r193 a{font-size:9px;min-height:28px;display:inline-flex;align-items:center}}
</style>`;

function isVersioned(url) {
  return url.searchParams.has('v') || url.searchParams.has('rev');
}

function cachePolicy(url, response) {
  if (response.status !== 200) return null;
  const path = url.pathname;

  if (path.startsWith(CACHEABLE_PREFIXES.scripts) || path.startsWith(CACHEABLE_PREFIXES.styles)) {
    return isVersioned(url)
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=86400, stale-while-revalidate=604800';
  }

  if (path.startsWith(CACHEABLE_PREFIXES.assets)) {
    return isVersioned(url)
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=604800, stale-while-revalidate=2592000';
  }

  if (path.startsWith(CACHEABLE_PREFIXES.data)) {
    return 'public, max-age=60, stale-while-revalidate=300';
  }

  return null;
}

function improveHomepageR193(html) {
  let output = String(html || '');

  output = output.replace(
    /formatx-production-idle-loader-r192\.js\?v=20260817-r192c/g,
    'formatx-production-idle-loader-r192.js?v=20260817-r193',
  );

  output = output.replace(
    /<div class="hero-facts">[\s\S]*?<\/div>/i,
    `<div class="hero-facts" data-fx-proof-metrics-r193="true"><span><b>04</b><small data-hu="módszerlépés" data-en="method steps">módszerlépés</small></span><span><b>06</b><small data-hu="közzétett platformállapot" data-en="published platform states">közzétett platformállapot</small></span><span><b>04</b><small data-hu="nyilvános bizonyítéki útvonal" data-en="public proof routes">nyilvános bizonyítéki útvonal</small></span></div>`,
  );

  if (!output.includes('data-fx-award-proof-r193')) {
    output = output.replace(
      /(<div class="hero-facts"[^>]*>[\s\S]*?<\/div>)/i,
      `$1\n${PROOF_NAV}`,
    );
  }

  if (!output.includes('data-fx-award-proof-style-r193')) {
    output = output.replace('</head>', `  ${PROOF_STYLE}\n</head>`);
  }

  return output;
}

export default {
  async fetch(request, env, ctx) {
    const response = await contentEntry.fetch(request, env, ctx);
    const url = new URL(request.url);
    const headers = new Headers(response.headers);
    const contentType = headers.get('Content-Type') || '';

    if (
      request.method === 'GET'
      && response.status === 200
      && HOMEPAGE_ALIASES.has(url.pathname)
      && contentType.includes('text/html')
    ) {
      const html = improveHomepageR193(await response.text());
      headers.set('Cache-Control', 'no-store, max-age=0');
      headers.set('Pragma', 'no-cache');
      headers.set('X-FormatX-Performance', 'r193-cache-staged-hydration');
      headers.set('X-FormatX-Award-Proof', 'r193-visible-proof-routes');
      headers.delete('Content-Length');
      headers.delete('Content-Encoding');
      headers.delete('ETag');
      return new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    const policy = cachePolicy(url, response);
    if (policy) {
      headers.set('Cache-Control', policy);
      headers.delete('Pragma');
      headers.set('X-FormatX-Cache', isVersioned(url) ? 'r193-versioned' : 'r193-revalidate');
      headers.delete('Content-Length');
      headers.delete('Content-Encoding');
      headers.delete('ETag');
    }

    return new Response(request.method === 'HEAD' ? null : response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
