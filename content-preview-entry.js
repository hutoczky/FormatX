import baseWorker from './worker.js';

const HTML_PATHS = new Set([
  '/scifi-ui/', '/scifi-ui/index.html', '/scifi-ui/license.html',
  '/scifi-ui/support.html', '/scifi-ui/terms.html', '/scifi-ui/privacy.html',
  '/scifi-ui/checkout.html', '/scifi-ui/downloads/', '/scifi-ui/downloads/index.html',
  '/scifi-ui/downloads/android.html', '/scifi-ui/test-matrix.html',
  '/scifi-ui/method.html', '/scifi-ui/verification.html',
  '/scifi-ui/known-issues.html', '/scifi-ui/security.html',
  '/scifi-ui/decision-log.html'
]);
const DATA_PATHS = new Set([
  '/scifi-ui/data/current-release.json', '/scifi-ui/data/release-channel.json',
  '/scifi-ui/data/platform-status.json', '/scifi-ui/data/evidence-manifest.json',
  '/scifi-ui/data/test-matrix.json', '/scifi-ui/data/known-issues.json',
  '/scifi-ui/data/stable-gate.json', '/scifi-ui/data/decision-log.json',
  '/scifi-ui/data/workflow-cases.json', '/scifi-ui/scripts/release-metadata.js',
  '/scifi-ui/scripts/formatx-public-shell.js',
  '/scifi-ui/scripts/formatx-content-standard.js',
  '/scifi-ui/scripts/formatx-content-finalizer.js',
  '/scifi-ui/scripts/formatx-platform-surface-finalizer.js',
  '/scifi-ui/scripts/formatx-organism-trust.js',
  '/scifi-ui/scripts/formatx-organism-semantic-state.js',
  '/scifi-ui/scripts/public-evidence-pages.js', '/scifi-ui/scripts/formatx-seo.js',
  '/scifi-ui/styles/formatx-content-standard.css'
]);
const LANGUAGE = '<link rel="stylesheet" data-fx-single-language-style="true" href="/scifi-ui/styles/single-language-toggle.css?v=20260731-language-unified-1">\n<script defer src="/scifi-ui/scripts/single-language-toggle.js?v=20260731-language-unified-1"></script>';
const ASSETS = '<link rel="stylesheet" data-fx-content-standard-style="true" href="/scifi-ui/styles/formatx-content-standard.css?v=20260731-content-2">\n<script defer src="/scifi-ui/scripts/release-metadata.js?v=20260731-release-2"></script>\n<script defer src="/scifi-ui/scripts/formatx-public-shell.js?v=20260731-public-shell-1"></script>\n<script defer src="/scifi-ui/scripts/formatx-content-standard.js?v=20260731-content-1"></script>\n<script defer src="/scifi-ui/scripts/formatx-seo.js?v=20260731-seo-2"></script>\n<script defer src="/scifi-ui/scripts/formatx-content-finalizer.js?v=20260731-content-final-1"></script>\n<script defer src="/scifi-ui/scripts/formatx-platform-surface-finalizer.js?v=20260731-platform-final-1"></script>\n<script defer src="/scifi-ui/scripts/formatx-organism-trust.js?v=20260731-organism-trust-1"></script>\n<script defer src="/scifi-ui/scripts/formatx-organism-semantic-state.js?v=20260731-organism-semantic-1"></script>';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await baseWorker.fetch(request, env, ctx);
    if (request.method !== 'GET' && request.method !== 'HEAD') return response;
    if (DATA_PATHS.has(url.pathname)) return noStore(response, request.method === 'HEAD');
    if (!HTML_PATHS.has(url.pathname) || request.method === 'HEAD' || !response.ok) return response;
    if (!(response.headers.get('Content-Type') || '').includes('text/html')) return response;
    let html = cleanLegacyReleaseCopy(await response.text());
    if (!html.includes('data-fx-single-language-style') && !html.includes('single-language-toggle.css')) {
      html = html.replace('</head>', LANGUAGE + '\n</head>');
    }
    if (!html.includes('data-fx-content-standard-style') && !html.includes('formatx-content-standard.css')) {
      html = html.replace('</head>', ASSETS + '\n</head>');
    } else if (!html.includes('formatx-public-shell.js')) {
      html = html.replace('</head>', '<script defer src="/scifi-ui/scripts/formatx-public-shell.js?v=20260731-public-shell-1"></script>\n</head>');
    }
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};
function cleanLegacyReleaseCopy(html) {
  return html
    .replaceAll('https://github.com/hutoczky/FormatX-Updates/releases/download/v92/FormatX-Suite-Pro-V92.zip', '/scifi-ui/downloads/')
    .replaceAll('FormatX Suite Pro V92', 'FormatX Suite Pro')
    .replaceAll('Windows V92', 'Windows')
    .replaceAll('V92 kiadási oldal', 'Hivatalos kiadási oldal')
    .replaceAll('site.css?v=20260718-v92', 'site.css')
    .replaceAll('<span>92.00</span><b>RELEASE DNA</b>', '<span>—</span><b>OFFICIAL RELEASE</b>')
    .replaceAll('Teljes verzió letöltése', 'Windows nyilvános béta letöltése')
    .replaceAll('Download full version', 'Download Windows public beta');
}
function noStore(response, head) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.delete('ETag');
  return new Response(head ? null : response.body, { status: response.status, statusText: response.statusText, headers });
}
