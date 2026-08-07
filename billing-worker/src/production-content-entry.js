import baseWorker from './production-feedback-entry.js';

const HOMEPAGE_PATHS = new Set(['/', '/scifi-ui/', '/scifi-ui/index.html']);
const HTML_PATHS = new Set([
  '/', '/scifi-ui/', '/scifi-ui/index.html', '/scifi-ui/license.html',
  '/scifi-ui/support.html', '/scifi-ui/terms.html', '/scifi-ui/privacy.html',
  '/scifi-ui/checkout.html', '/scifi-ui/downloads/', '/scifi-ui/downloads/index.html',
  '/scifi-ui/downloads/android.html', '/scifi-ui/test-matrix.html',
  '/scifi-ui/method.html', '/scifi-ui/verification.html',
  '/scifi-ui/technical-report.html',
  '/scifi-ui/known-issues.html', '/scifi-ui/security.html',
  '/scifi-ui/decision-log.html', '/scifi-ui/payment/success.html',
  '/scifi-ui/payment/cancel.html'
]);

const NO_STORE_PATHS = new Set([
  '/scifi-ui/data/current-release.json', '/scifi-ui/data/release-channel.json',
  '/scifi-ui/data/platform-status.json', '/scifi-ui/data/evidence-manifest.json',
  '/scifi-ui/data/test-matrix.json', '/scifi-ui/data/known-issues.json',
  '/scifi-ui/data/stable-gate.json', '/scifi-ui/data/decision-log.json',
  '/scifi-ui/data/workflow-cases.json', '/scifi-ui/scripts/release-metadata.js',
  '/scifi-ui/scripts/platform-status.js', '/scifi-ui/scripts/site.js',
  '/scifi-ui/scripts/formatx-public-shell.js',
  '/scifi-ui/scripts/formatx-content-standard.js',
  '/scifi-ui/scripts/formatx-content-finalizer.js',
  '/scifi-ui/scripts/formatx-platform-surface-finalizer.js',
  '/scifi-ui/scripts/formatx-organism-trust.js',
  '/scifi-ui/scripts/formatx-organism-semantic-state.js',
  '/scifi-ui/scripts/public-evidence-pages.js', '/scifi-ui/scripts/formatx-seo.js',
  '/scifi-ui/scripts/formatx-premium-finish.js',
  '/scifi-ui/scripts/formatx-feedback.js',
  '/scifi-ui/scripts/formatx-infinite-scroll.js',
  '/scifi-ui/styles/formatx-seamless-loop.css',
  '/scifi-ui/styles/formatx-content-standard.css',
  '/scifi-ui/styles/formatx-premium-finish.css',
  '/scifi-ui/styles/formatx-feedback.css',
  '/scifi-ui/technical-report.html',
  '/scifi-ui/android/', '/scifi-ui/android/index.html',
  '/scifi-ui/reports/formatx-technical-evidence-report.md'
]);

const LANGUAGE_ASSETS = [
  '<link rel="stylesheet" data-fx-single-language-style="true" href="/scifi-ui/styles/single-language-toggle.css?v=20260731-language-unified-1">',
  '<script defer src="/scifi-ui/scripts/single-language-toggle.js?v=20260731-language-unified-1"></script>'
].join('\n');
const CONTENT_ASSETS = [
  '<link rel="stylesheet" data-fx-content-standard-style="true" href="/scifi-ui/styles/formatx-content-standard.css?v=20260731-content-2">',
  '<script defer src="/scifi-ui/scripts/release-metadata.js?v=20260807-full-release-1"></script>',
  '<script defer src="/scifi-ui/scripts/formatx-public-shell.js?v=20260731-public-shell-1"></script>',
  '<script defer src="/scifi-ui/scripts/formatx-content-standard.js?v=20260731-content-1"></script>',
  '<script defer src="/scifi-ui/scripts/formatx-seo.js?v=20260807-full-release-seo-3"></script>',
  '<script defer src="/scifi-ui/scripts/formatx-content-finalizer.js?v=20260731-content-final-1"></script>',
  '<script defer src="/scifi-ui/scripts/formatx-platform-surface-finalizer.js?v=20260731-platform-final-1"></script>',
  '<script defer src="/scifi-ui/scripts/formatx-organism-trust.js?v=20260731-organism-trust-1"></script>',
  '<script defer src="/scifi-ui/scripts/formatx-organism-semantic-state.js?v=20260731-organism-semantic-1"></script>'
].join('\n');
const FEEDBACK_ASSETS = [
  '<link rel="stylesheet" data-fx-feedback-style="true" href="/scifi-ui/styles/formatx-feedback.css?v=20260806-feedback-1">',
  '<script defer data-fx-feedback-script="true" src="/scifi-ui/scripts/formatx-feedback.js?v=20260806-feedback-1"></script>'
].join('\n');
const SCROLL_ASSET = '<script defer data-fx-seamless-scroll-runtime="true" src="/scifi-ui/scripts/formatx-infinite-scroll.js?v=20260808-seamless-ratio-v4"></script>';

const HERO_LIVE_OS_CTA = '<button type="button" class="button button-solid magnetic" data-fx-live-os-cta data-hu="Live OS kipróbálása" data-en="Try Live OS"><span data-hu="Live OS kipróbálása" data-en="Try Live OS">Live OS kipróbálása</span><i>↗</i></button>';

const CATEGORY_STATIC_HEAD = '<header><p class="section-index" data-fx-category-eyebrow data-hu="01.5 — SAJÁT TECHNIKUSI KATEGÓRIA" data-en="01.5 — INDEPENDENT TECHNICIAN CATEGORY">01.5 — SAJÁT TECHNIKUSI KATEGÓRIA</p><h2 id="fx-category-title" data-fx-category-title data-hu="Nem landing page. Működő technikusi rendszerfelület." data-en="Not a landing page. An operational technician system surface.">Nem landing page. Működő technikusi rendszerfelület.</h2><p data-fx-category-lead data-hu="A FormatX a diagnosztikát, a tervet, a kontrollált végrehajtást és az ellenőrizhető eredményt egyetlen, használható rendszerélménnyé kapcsolja össze." data-en="FormatX combines diagnostics, planning, controlled execution and verifiable outcomes into one usable system experience.">A FormatX a diagnosztikát, a tervet, a kontrollált végrehajtást és az ellenőrizhető eredményt egyetlen, használható rendszerélménnyé kapcsolja össze.</p></header>';

const STATIC_LIVE_OS_SECTION = `
    <section id="live-os-overview" class="fx-static-live-os" aria-labelledby="live-os-overview-title" itemscope itemtype="https://schema.org/SoftwareApplication">
      <meta itemprop="name" content="FormatX Suite Pro">
      <meta itemprop="applicationCategory" content="UtilitiesApplication">
      <meta itemprop="operatingSystem" content="Linux, Bazzite, Windows, Android">
      <meta itemprop="url" content="https://www.formatxsuite.com/">
      <div class="fx-static-live-os__head">
        <div>
          <p class="section-index" data-hu="00.5 — ÉLŐ OPERÁCIÓS RÉTEG" data-en="00.5 — LIVE OPERATING LAYER">00.5 — ÉLŐ OPERÁCIÓS RÉTEG</p>
          <h2 id="live-os-overview-title" itemprop="headline" data-hu="A honlap, amelyet nemcsak nézel — használsz." data-en="A website you do not merely watch — you use.">A honlap, amelyet nemcsak nézel — használsz.</h2>
        </div>
        <p itemprop="description" data-hu="A FormatX Live OS helyben futó parancsréteget, valós böngésződiagnosztikát, funkcionális tárolótérképet és ellenőrizhető bizonyítékokat kapcsol össze. A beírt parancs nem kerül külső AI-szolgáltatóhoz." data-en="FormatX Live OS combines local command interpretation, real browser diagnostics, functional storage topology and verifiable evidence. Entered commands are not sent to an external AI provider.">A FormatX Live OS helyben futó parancsréteget, valós böngésződiagnosztikát, funkcionális tárolótérképet és ellenőrizhető bizonyítékokat kapcsol össze. A beírt parancs nem kerül külső AI-szolgáltatóhoz.</p>
      </div>
      <div class="fx-static-live-os__grid">
        <article><strong data-hu="Természetes nyelvű vezérlés" data-en="Natural-language control">Természetes nyelvű vezérlés</strong><p data-hu="Magyar vagy angol paranccsal kereshetsz, navigálhatsz, diagnosztikát és bemutatót indíthatsz." data-en="Use Hungarian or English commands to search, navigate, run diagnostics and start the guided demo.">Magyar vagy angol paranccsal kereshetsz, navigálhatsz, diagnosztikát és bemutatót indíthatsz.</p></article>
        <article><strong data-hu="Valós munkamenet-adatok" data-en="Real session data">Valós munkamenet-adatok</strong><p data-hu="Kijelzőfrissítés, képkockaidő, inputkésés, böngésző-, hálózati és WebGL-képességadatok." data-en="Display cadence, frame timing, input latency, browser, network and WebGL capability data.">Kijelzőfrissítés, képkockaidő, inputkésés, böngésző-, hálózati és WebGL-képességadatok.</p></article>
        <article><strong data-hu="Funkcionális 3D / Canvas térkép" data-en="Functional 3D / Canvas topology">Funkcionális 3D / Canvas térkép</strong><p data-hu="Meghajtók, partíciók, SMART-állapotok és ellenőrzési adatfolyamok. WebGL nélkül interaktív Canvas mód működik." data-en="Drives, partitions, SMART states and verification flows. An interactive Canvas mode works without WebGL.">Meghajtók, partíciók, SMART-állapotok és ellenőrzési adatfolyamok. WebGL nélkül interaktív Canvas mód működik.</p></article>
        <article><strong data-hu="Nyilvános bizonyíték" data-en="Public evidence">Nyilvános bizonyíték</strong><p data-hu="CI-kapuk, mobiltesztek, valós termékképek, kiadási rekordok és nyílt bizonyítékhiányok." data-en="CI gates, mobile tests, genuine product captures, release records and open evidence gaps.">CI-kapuk, mobiltesztek, valós termékképek, kiadási rekordok és nyílt bizonyítékhiányok.</p></article>
      </div>
      <ul class="fx-static-live-os__facts" aria-label="Live OS tulajdonságok">
        <li data-hu="Helyben futó parancsértelmezés" data-en="Local command interpretation">Helyben futó parancsértelmezés</li>
        <li data-hu="Kérésre betöltődő grafikus motor" data-en="Graphics engine loaded on request">Kérésre betöltődő grafikus motor</li>
        <li data-hu="Mobil és csökkentett mozgás támogatás" data-en="Mobile and reduced-motion support">Mobil és csökkentett mozgás támogatás</li>
        <li data-hu="Nincs kitalált hardveradat" data-en="No fabricated hardware data">Nincs kitalált hardveradat</li>
      </ul>
      <div class="fx-static-live-os__actions">
        <button type="button" class="button button-solid" data-fx-live-os-cta data-hu="Interaktív Live OS megnyitása" data-en="Open interactive Live OS">Interaktív Live OS megnyitása</button>
        <a class="button button-line" href="/scifi-ui/technical-report.html" data-hu="Technikai riport" data-en="Technical report">Technikai riport</a>
        <a class="button button-line" href="/scifi-ui/verification.html" data-hu="Bizonyítéki központ" data-en="Verification centre">Bizonyítéki központ</a>
      </div>
    </section>`;

const USER_FEEDBACK_SECTION = `
    <section id="user-feedback" aria-labelledby="user-feedback-title">
      <div class="fx-feedback-head">
        <div>
          <p class="section-index" data-hu="06.5 — VALÓDI FELHASZNÁLÓI VISSZAJELZÉS" data-en="06.5 — GENUINE USER FEEDBACK">06.5 — VALÓDI FELHASZNÁLÓI VISSZAJELZÉS</p>
          <h2 id="user-feedback-title" data-hu="Értékeld a FormatX élményt." data-en="Rate the FormatX experience.">Értékeld a FormatX élményt.</h2>
          <p data-hu="A beküldés valódi adatként, moderálásra váró állapotban kerül mentésre. A nyilvános átlagba kizárólag jóváhagyott értékelés számít bele." data-en="Each genuine submission is stored as pending moderation. Only approved ratings are included in the public average.">A beküldés valódi adatként, moderálásra váró állapotban kerül mentésre. A nyilvános átlagba kizárólag jóváhagyott értékelés számít bele.</p>
        </div>
        <output class="fx-feedback-summary" data-fx-feedback-summary role="status" aria-live="polite">A valódi, jóváhagyott értékelések betöltése…</output>
      </div>
      <form class="fx-feedback-form" data-fx-feedback-form novalidate>
        <h3 data-hu="1–5 csillagos értékelés" data-en="1–5 star rating">1–5 csillagos értékelés</h3>
        <p data-hu="Minden kategóriát értékelj. A szöveges megjegyzés és a kapcsolati e-mail opcionális." data-en="Rate every category. Written feedback and contact email are optional.">Minden kategóriát értékelj. A szöveges megjegyzés és a kapcsolati e-mail opcionális.</p>
        <div class="fx-feedback-ratings">
          <div data-rating-group="overall" data-hu-label="Összbenyomás" data-en-label="Overall"></div>
          <div data-rating-group="usability" data-hu-label="Használhatóság" data-en-label="Usability"></div>
          <div data-rating-group="performance" data-hu-label="Teljesítmény" data-en-label="Performance"></div>
          <div data-rating-group="design" data-hu-label="Dizájn" data-en-label="Design"></div>
          <div data-rating-group="features" data-hu-label="Funkciók" data-en-label="Features"></div>
        </div>
        <label class="fx-feedback-field fx-feedback-comment"><span data-hu="Rövid visszajelzés" data-en="Written feedback">Rövid visszajelzés</span><textarea name="comment" maxlength="1200" data-hu-placeholder="Mi működik jól, és min változtatnál?" data-en-placeholder="What works well, and what would you change?" placeholder="Mi működik jól, és min változtatnál?"></textarea></label>
        <label class="fx-feedback-field"><span data-hu="Megjelenítendő név (opcionális)" data-en="Display name (optional)">Megjelenítendő név (opcionális)</span><input name="display_name" type="text" maxlength="80" autocomplete="nickname"></label>
        <label class="fx-feedback-field"><span data-hu="Kapcsolati e-mail (opcionális, nem nyilvános)" data-en="Contact email (optional, never public)">Kapcsolati e-mail (opcionális, nem nyilvános)</span><input name="contact_email" type="email" maxlength="254" autocomplete="email"></label>
        <label class="fx-feedback-honeypot" aria-hidden="true">Website<input name="website" type="text" tabindex="-1" autocomplete="off"></label>
        <div class="fx-feedback-consent">
          <label class="fx-feedback-check"><input name="publish_permission" type="checkbox"><span data-hu="Hozzájárulok, hogy jóváhagyás után a nevem és a szöveges véleményem idézhető legyen. Az e-mail-cím soha nem nyilvános." data-en="I allow my display name and written feedback to be quoted after approval. Email is never public.">Hozzájárulok, hogy jóváhagyás után a nevem és a szöveges véleményem idézhető legyen. Az e-mail-cím soha nem nyilvános.</span></label>
          <label class="fx-feedback-check"><input name="privacy_consent" type="checkbox" required><span><span data-hu="Elolvastam és elfogadom az " data-en="I have read and accept the ">Elolvastam és elfogadom az </span><a href="/scifi-ui/privacy.html" target="_blank" rel="noopener" data-hu="adatkezelési tájékoztatót" data-en="privacy notice">adatkezelési tájékoztatót</a>.</span></label>
        </div>
        <div class="fx-feedback-submit-row"><button class="button button-solid" type="submit" data-hu="Értékelés beküldése" data-en="Submit rating">Értékelés beküldése</button><p data-fx-feedback-status role="status" aria-live="polite"></p></div>
      </form>
    </section>`;

const NOSCRIPT_PROOF = `<noscript><section class="fx-noscript-proof"><strong>FormatX Live OS</strong><p>A JavaScript nélküli nézetben a termékleírás és a bizonyítékok továbbra is olvashatók. Az interaktív parancsközpont, a diagnosztika és az értékelés beküldése JavaScriptet igényel.</p><p><a href="/scifi-ui/technical-report.html">Technikai riport</a> · <a href="/scifi-ui/verification.html">Bizonyítéki központ</a> · <a href="/scifi-ui/test-matrix.html">Tesztmátrix</a></p></section></noscript>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await baseWorker.fetch(request, env, ctx);
    if (request.method !== 'GET' && request.method !== 'HEAD') return response;
    if (NO_STORE_PATHS.has(url.pathname)) return noStore(response, request.method === 'HEAD');
    if (!HTML_PATHS.has(url.pathname) || request.method === 'HEAD' || !response.ok) return response;
    if (!(response.headers.get('Content-Type') || '').includes('text/html')) return response;

    let html = cleanLegacyReleaseCopy(await response.text());
    if (!html.includes('data-fx-single-language-style') && !html.includes('single-language-toggle.css')) html = html.replace('</head>', LANGUAGE_ASSETS + '\n</head>');
    if (!html.includes('data-fx-content-standard-style') && !html.includes('formatx-content-standard.css')) html = html.replace('</head>', CONTENT_ASSETS + '\n</head>');
    else if (!html.includes('formatx-public-shell.js')) html = html.replace('</head>', '<script defer src="/scifi-ui/scripts/formatx-public-shell.js?v=20260731-public-shell-1"></script>\n</head>');

    if (HOMEPAGE_PATHS.has(url.pathname)) html = enhanceHomepageHtml(html);
    if (url.pathname === '/scifi-ui/verification.html') html = enhanceVerificationHtml(html);
    if (url.pathname === '/scifi-ui/privacy.html') html = enhancePrivacyHtml(html);

    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Pragma', 'no-cache');
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};

function enhanceHomepageHtml(html) {
  if (!html.includes('data-fx-feedback-style')) html = html.replace('</head>', FEEDBACK_ASSETS + '\n</head>');
  if (!html.includes('data-fx-seamless-scroll-runtime')) html = html.replace('</head>', SCROLL_ASSET + '\n</head>');
  html = html.replace('<body id="top" class="living-architecture">', '<body id="top" class="living-architecture" itemscope itemtype="https://schema.org/WebSite">');
  if (!html.includes('data-fx-live-os-cta')) html = html.replace('<div class="hero-actions">', `<div class="hero-actions">${HERO_LIVE_OS_CTA}`);
  if (!html.includes('id="live-os-overview"')) {
    const categoryMarker = '    <section class="fx-category-deck fx-category-deck--standalone"';
    html = html.replace(categoryMarker, `${STATIC_LIVE_OS_SECTION}\n\n${categoryMarker}`);
  }
  html = html.replace(/<header><p class="section-index" data-fx-category-eyebrow><\/p><h2 id="fx-category-title" data-fx-category-title><\/h2><p data-fx-category-lead><\/p><\/header>/, CATEGORY_STATIC_HEAD);
  if (!html.includes('id="user-feedback"')) {
    const resourceMarker = '    <section id="resources"';
    if (html.includes(resourceMarker)) html = html.replace(resourceMarker, `${USER_FEEDBACK_SECTION}\n\n${resourceMarker}`);
    else html = html.replace('</main>', `${USER_FEEDBACK_SECTION}\n${NOSCRIPT_PROOF}\n  </main>`);
  }
  if (!html.includes('fx-noscript-proof')) html = html.replace('</main>', `${NOSCRIPT_PROOF}\n  </main>`);
  return html;
}

function enhanceVerificationHtml(html) {
  if (html.includes('/scifi-ui/technical-report.html')) return html;
  return html.replace('<div class="fx-evidence-grid" data-verification-root></div>', '<section class="fx-evidence-card"><h2>Technikai bizonyítékriport</h2><p>A teljesítménykapuk, Live OS böngészőtesztek, adatvédelmi határok és nyílt bizonyítékhiányok külön, letölthető riportban is elérhetők.</p><nav class="fx-page-nav"><a href="/scifi-ui/technical-report.html">Riport megnyitása</a><a href="/scifi-ui/reports/formatx-technical-evidence-report.md" download>Riport letöltése (.md)</a></nav></section><div class="fx-evidence-grid" data-verification-root></div>');
}

function enhancePrivacyHtml(html) {
  if (html.includes('Felhasználói értékelés és visszajelzés')) return html;
  html = html.replace('<li><strong>Biztonsági és működési napló:</strong>', '<li><strong>Felhasználói értékelés és visszajelzés:</strong> 1–5 közötti értékelések, opcionális megjelenítendő név, szöveges vélemény és kapcsolati e-mail, közzétételi hozzájárulás, időpont, egyirányú hálózati azonosító-lenyomat és technikai kérésadat. Jogalap: hozzájárulás, illetve a visszaélések megelőzéséhez és a szolgáltatás fejlesztéséhez fűződő jogos érdek. A nyilvános átlag csak jóváhagyott értékeléseket tartalmaz; az e-mail-cím nem nyilvános.</li>\n        <li><strong>Biztonsági és működési napló:</strong>');
  html = html.replace('<li><strong>Biztonsági és hibakeresési napló:</strong>', '<li><strong>Felhasználói visszajelzés:</strong> a függőben lévő vagy elutasított beküldés legfeljebb 12 hónap; jóváhagyott értékelés a hozzájárulás visszavonásáig vagy legfeljebb 3 évig. A kapcsolati e-mail korábban törölhető az érintett kérelmére.</li>\n        <li><strong>Biztonsági és hibakeresési napló:</strong>');
  return html;
}

function cleanLegacyReleaseCopy(html) {
  return html
    .replaceAll('https://github.com/hutoczky/FormatX-Updates/releases/download/v92/FormatX-Suite-Pro-V92.zip', '/scifi-ui/downloads/')
    .replace(/\bFormatX Suite Pro V\d+\b/gi, 'FormatX Suite Pro')
    .replace(/\bWindows V\d+\b/gi, 'Windows')
    .replace(/https:\/\/github\.com\/hutoczky\/FormatX-Updates\/releases\/tag\/v\d+/gi, 'https://github.com/hutoczky/FormatX-Updates/releases')
    .replaceAll('FormatX Suite Pro V92', 'FormatX Suite Pro')
    .replaceAll('Windows V92', 'Windows')
    .replaceAll('V92 kiadási oldal', 'Hivatalos kiadási oldal')
    .replaceAll('site.css?v=20260718-v92', 'site.css')
    .replaceAll('<span>92.00</span><b>RELEASE DNA</b>', '<span>—</span><b>OFFICIAL RELEASE</b>')
    .replaceAll('Multiplatform nyilvános béta letöltése', 'Teljes multiplatform verzió letöltése')
    .replaceAll('Download multiplatform public beta', 'Download full multiplatform version')
    .replaceAll('Multiplatform nyilvános béta', 'Teljes multiplatform verzió')
    .replaceAll('Multiplatform public beta', 'Full multiplatform version')
    .replaceAll('Android nyilvános béta', 'Android teljes verzió')
    .replaceAll('Android public beta', 'Android full version')
    .replaceAll('Android · Public beta', 'Android · Full release')
    .replaceAll('aktuális csomag multiplatform nyilvános béta', 'aktuális csomag teljes multiplatform kiadás')
    .replaceAll('current package is a multiplatform public beta', 'current package is the full multiplatform release')
    .replaceAll('nyilvános béta csomag', 'teljes multiplatform csomag')
    .replaceAll('public beta package', 'full multiplatform package')
    .replaceAll('Teljes verzió letöltése', 'Teljes multiplatform verzió letöltése')
    .replaceAll('Download full version', 'Download full multiplatform version');
}

function noStore(response, withoutBody) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.delete('ETag');
  return new Response(withoutBody ? null : response.body, { status: response.status, statusText: response.statusText, headers });
}
