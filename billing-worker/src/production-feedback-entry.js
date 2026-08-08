import productionWorker from './production-entry.js';
import { handleFeedbackRequest } from './feedback-api.js';

const PUBLIC_ORIGIN = 'https://www.formatxsuite.com';
const SECURE_ORDER_REFERENCE = /^FX-\d{8}-[A-F0-9]{24}$/;
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

const HOMEPAGE_STRUCTURED_DATA = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${PUBLIC_ORIGIN}/#website`,
      url: `${PUBLIC_ORIGIN}/`,
      name: 'FormatX Suite Pro',
      inLanguage: ['hu-HU', 'en-GB']
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${PUBLIC_ORIGIN}/#software`,
      name: 'FormatX Suite Pro',
      description: 'Technician operating layer for diagnostics, installation, drive management and verifiable maintenance.',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Linux/Bazzite; Windows; Android',
      url: `${PUBLIC_ORIGIN}/`,
      downloadUrl: `${PUBLIC_ORIGIN}/download/multiplatform`,
      image: `${PUBLIC_ORIGIN}/scifi-ui/assets/images/formatx-technician-console.png`,
      license: `${PUBLIC_ORIGIN}/scifi-ui/license.html`,
      offers: {
        '@type': 'Offer',
        name: 'Business Lite',
        price: '7900',
        priceCurrency: 'HUF',
        availability: 'https://schema.org/InStock',
        url: `${PUBLIC_ORIGIN}/scifi-ui/checkout.html?plan=business_lite&cycle=monthly&currency=HUF`
      },
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Category', value: 'Technician Operating Layer' },
        { '@type': 'PropertyValue', name: 'Method', value: 'Discover → Plan → Controlled execution → Verify' },
        { '@type': 'PropertyValue', name: 'Overall status', value: 'Full release' },
        { '@type': 'PropertyValue', name: 'Trial licence', value: '5 days' },
        { '@type': 'PropertyValue', name: 'Primary platform', value: 'Bazzite/Linux' },
        { '@type': 'PropertyValue', name: 'Supported secondary platforms', value: 'Windows; Android' },
        { '@type': 'PropertyValue', name: 'Web surface', value: 'Technical preview' },
        { '@type': 'PropertyValue', name: 'macOS and iOS/iPadOS', value: 'Planned' }
      ]
    },
    {
      '@type': 'WebPage',
      '@id': `${PUBLIC_ORIGIN}/#webpage`,
      url: `${PUBLIC_ORIGIN}/`,
      name: 'FormatX Suite Pro | Technician Operating Layer',
      description: 'Független technikusi operációs réteg diagnosztikához, telepítéshez, meghajtókezeléshez és ellenőrizhető karbantartáshoz.',
      isPartOf: { '@id': `${PUBLIC_ORIGIN}/#website` },
      about: { '@id': `${PUBLIC_ORIGIN}/#software` },
      inLanguage: 'hu-HU'
    }
  ]
});

const HOMEPAGE_SEO = [
  '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">',
  '<meta name="application-name" content="FormatX Suite Pro">',
  '<meta property="og:site_name" content="FormatX Suite Pro">',
  '<meta property="og:locale" content="hu_HU">',
  '<meta property="og:locale:alternate" content="en_GB">',
  '<meta property="og:image:alt" content="FormatX Suite Pro technician operating layer">',
  '<meta name="twitter:card" content="summary_large_image">',
  '<meta name="twitter:title" content="FormatX Suite Pro | Technician Operating Layer">',
  '<meta name="twitter:description" content="Technician operating layer for diagnostics, installation, drive management and verifiable maintenance.">',
  '<meta name="twitter:image" content="https://www.formatxsuite.com/scifi-ui/assets/images/formatx-technician-console.png">',
  '<link rel="stylesheet" data-fx-award-readiness-style="true" href="/scifi-ui/styles/formatx-award-readiness.css?v=20260808-award-readiness-1">',
  `<script id="formatx-structured-data" type="application/ld+json">${HOMEPAGE_STRUCTURED_DATA}</script>`
].join('\n');

const HOMEPAGE_PROOF_STRIP = `
    <section class="fx-award-proof" data-fx-award-proof aria-labelledby="fx-award-proof-title">
      <div class="fx-award-proof__head">
        <div>
          <p class="section-index" data-hu="PUBLIC PROOF LAYER" data-en="PUBLIC PROOF LAYER">PUBLIC PROOF LAYER</p>
          <h2 id="fx-award-proof-title" data-hu="Bizonyíték a látvány mögött." data-en="Evidence behind the experience.">Bizonyíték a látvány mögött.</h2>
        </div>
        <p data-hu="A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető felületen követhető." data-en="FormatX does not ask for blind trust: releases, tests, limitations and the safety model are available through separate public verification surfaces.">A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető felületen követhető.</p>
      </div>
      <nav class="fx-award-proof__grid" aria-label="FormatX public proof">
        <a href="/scifi-ui/verification.html"><strong data-hu="Nyilvános ellenőrzés" data-en="Public verification">Nyilvános ellenőrzés</strong><span data-hu="Tesztmátrix, ismert korlátok és bizonyítékállapot." data-en="Test matrix, known limitations and evidence state.">Tesztmátrix, ismert korlátok és bizonyítékállapot.</span></a>
        <a href="/scifi-ui/technical-report.html"><strong data-hu="Technikai riport" data-en="Technical report">Technikai riport</strong><span data-hu="Lighthouse-, CI- és böngészőkapuk, nyílt bizonyítékhiányokkal." data-en="Lighthouse, CI and browser gates with open evidence gaps.">Lighthouse-, CI- és böngészőkapuk, nyílt bizonyítékhiányokkal.</span></a>
        <a href="/scifi-ui/security.html"><strong data-hu="Biztonsági modell" data-en="Safety model">Biztonsági modell</strong><span data-hu="SHA-256 digest, célmeghajtó-védelem és kontrollhatárok." data-en="SHA-256 digest, target protection and control boundaries.">SHA-256 digest, célmeghajtó-védelem és kontrollhatárok.</span></a>
        <a href="/scifi-ui/downloads/"><strong data-hu="Kiadási bizonyíték" data-en="Release evidence">Kiadási bizonyíték</strong><span data-hu="Aktuális kiadási csatorna, csomagállapot és first-party letöltési útvonal." data-en="Current release channel, package state and first-party download route.">Aktuális kiadási csatorna, csomagállapot és first-party letöltési útvonal.</span></a>
      </nav>
    </section>`;

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

export async function redactLegacySessionStatus(request, url, response) {
  if (request.method !== 'GET' || url.pathname !== '/api/session-status' || !response.ok) return response;
  const reference = String(
    url.searchParams.get('session_id') || url.searchParams.get('order_reference') || ''
  ).trim().toUpperCase();
  if (SECURE_ORDER_REFERENCE.test(reference)) return response;
  if (!(response.headers.get('Content-Type') || '').includes('application/json')) return response;

  let payload;
  try {
    payload = await response.json();
  } catch (_) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.set('Cache-Control', 'no-store');

  return new Response(JSON.stringify({
    ...payload,
    license_key: null,
    legacy_reference: true,
    license_key_available: false,
    message: payload.license_active
      ? 'A licenc aktív. Régi, rövid rendelési azonosítóval a licenckulcs biztonsági okból nem jeleníthető meg; kérj privát támogatást.'
      : payload.message,
  }), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function stabiliseHomepageSemantics(request, url, response) {
  if (request.method !== 'GET' || !response.ok || !HOMEPAGE_PATHS.has(url.pathname)) return response;
  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) return response;

  let html = await response.text();
  const emptyCategory = '<p class="section-index" data-fx-category-eyebrow></p><h2 id="fx-category-title" data-fx-category-title></h2><p data-fx-category-lead></p>';
  const staticCategory = '<p class="section-index" data-fx-category-eyebrow data-hu="FORMATX TECHNICIAN OPERATING LAYER" data-en="FORMATX TECHNICIAN OPERATING LAYER">FORMATX TECHNICIAN OPERATING LAYER</p><h2 id="fx-category-title" data-fx-category-title data-hu="Egy élő operációs réteg technikusi munkához." data-en="A living operating layer for technician workflows.">Egy élő operációs réteg technikusi munkához.</h2><p data-fx-category-lead data-hu="Felderítés, tervezés, kontrollált végrehajtás és visszaellenőrzés egy közös, ellenőrizhető rendszerben." data-en="Discovery, planning, controlled execution and verification in one shared, verifiable system.">Felderítés, tervezés, kontrollált végrehajtás és visszaellenőrzés egy közös, ellenőrizhető rendszerben.</p>';
  html = html.replace(emptyCategory, staticCategory);

  if (!html.includes('data-fx-award-readiness-style')) {
    html = html.replace('</head>', `${HOMEPAGE_SEO}\n</head>`);
  }
  if (!html.includes('data-fx-award-proof')) {
    const categoryMarker = '    <section class="fx-category-deck fx-category-deck--standalone"';
    html = html.replace(categoryMarker, `${HOMEPAGE_PROOF_STRIP}\n\n${categoryMarker}`);
  }

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

    let response = await productionWorker.fetch(request, env, ctx);
    response = await redactLegacySessionStatus(request, url, response);
    return stabiliseHomepageSemantics(request, url, response);
  },
};

export const publicPageAliases = PUBLIC_PAGE_ALIASES;