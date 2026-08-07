import productionWorker from './production-entry.js';
import { handleFeedbackRequest } from './feedback-api.js';

const PUBLIC_ORIGIN = 'https://www.formatxsuite.com';
const HOMEPAGE_PATHS = new Set(['/', '/scifi-ui/', '/scifi-ui/index.html']);
const PUBLIC_PAGE_ALIASES = new Map([
  ['/downloads', '/scifi-ui/downloads/'],
  ['/downloads/', '/scifi-ui/downloads/'],
  ['/support', '/scifi-ui/support.html'],
  ['/support.html', '/scifi-ui/support.html'],
  ['/license', '/scifi-ui/license.html'],
  ['/license.html', '/scifi-ui/license.html'],
  ['/privacy', '/scifi-ui/privacy.html'],
  ['/privacy.html', '/scifi-ui/privacy.html'],
  ['/terms', '/scifi-ui/terms.html'],
  ['/terms.html', '/scifi-ui/terms.html'],
  ['/verification', '/scifi-ui/verification.html'],
  ['/verification.html', '/scifi-ui/verification.html'],
  ['/test-matrix', '/scifi-ui/test-matrix.html'],
  ['/test-matrix.html', '/scifi-ui/test-matrix.html'],
  ['/known-issues', '/scifi-ui/known-issues.html'],
  ['/known-issues.html', '/scifi-ui/known-issues.html'],
  ['/security', '/scifi-ui/security.html'],
  ['/security.html', '/scifi-ui/security.html'],
  ['/technical-report', '/scifi-ui/technical-report.html'],
  ['/technical-report.html', '/scifi-ui/technical-report.html'],
  ['/method', '/scifi-ui/method.html'],
  ['/method.html', '/scifi-ui/method.html'],
]);

function canonicalPublicRedirect(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  const alias = PUBLIC_PAGE_ALIASES.get(url.pathname);
  const nonCanonicalHost = url.hostname === 'formatxsuite.com';
  if (!alias && !nonCanonicalHost) return null;

  const target = new URL(alias || url.pathname, PUBLIC_ORIGIN);
  target.search = url.search;
  if (target.href === url.href) return null;
  return Response.redirect(target.toString(), 308);
}

async function stabiliseHomepageSemantics(request, url, response) {
  if (request.method !== 'GET' || !response.ok || !HOMEPAGE_PATHS.has(url.pathname)) return response;
  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) return response;

  let html = await response.text();
  const emptyCategory = '<p class="section-index" data-fx-category-eyebrow></p><h2 id="fx-category-title" data-fx-category-title></h2><p data-fx-category-lead></p>';
  const staticCategory = '<p class="section-index" data-fx-category-eyebrow data-hu="FORMATX TECHNICIAN OPERATING LAYER" data-en="FORMATX TECHNICIAN OPERATING LAYER">FORMATX TECHNICIAN OPERATING LAYER</p><h2 id="fx-category-title" data-fx-category-title data-hu="Egy élő operációs réteg technikusi munkához." data-en="A living operating layer for technician workflows.">Egy élő operációs réteg technikusi munkához.</h2><p data-fx-category-lead data-hu="Felderítés, tervezés, kontrollált végrehajtás és visszaellenőrzés egy közös, ellenőrizhető rendszerben." data-en="Discovery, planning, controlled execution and verification in one shared, verifiable system.">Felderítés, tervezés, kontrollált végrehajtás és visszaellenőrzés egy közös, ellenőrizhető rendszerben.</p>';
  html = html.replace(emptyCategory, staticCategory);

  const headers = new Headers(response.headers);
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const redirect = canonicalPublicRedirect(request, url);
    if (redirect) return redirect;

    // Feedback requests go straight to their real SELECT/INSERT operation.
    // Schema maintenance is never allowed to block a healthy database request.
    const feedbackResponse = await handleFeedbackRequest(request, env);
    if (feedbackResponse) return feedbackResponse;

    const response = await productionWorker.fetch(request, env, ctx);
    return stabiliseHomepageSemantics(request, url, response);
  },
};

export const publicPageAliases = PUBLIC_PAGE_ALIASES;
