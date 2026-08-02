(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxContentStandard === 'ready-v1') return;
  ROOT.dataset.fxContentStandard = 'loading-v1';

  const URLS = Object.freeze({
    status: '/scifi-ui/data/platform-status.json',
    tests: '/scifi-ui/data/test-matrix.json',
    issues: '/scifi-ui/data/known-issues.json'
  });

  let data = { status: null, tests: null, issues: null };

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function setBilingual(element, hu, en) {
    if (!element) return;
    element.dataset.hu = hu;
    element.dataset.en = en;
    element.textContent = language() === 'en' ? en : hu;
  }

  function ensureCategoryDefinition() {
    const heroCopy = document.querySelector('#hero .hero-copy');
    if (!heroCopy) return;

    let block = heroCopy.querySelector('.fx-category-definition');
    if (!block) {
      block = document.createElement('p');
      block.className = 'fx-category-definition';
      const kicker = heroCopy.querySelector('.kicker');
      if (kicker) kicker.insertAdjacentElement('afterend', block);
      else heroCopy.prepend(block);
    }

    block.innerHTML = language() === 'en'
      ? '<strong>Technician Operating Layer</strong>One shared, verifiable workflow for drive management, system diagnostics, installation and safe maintenance.'
      : '<strong>Technikusi operációs réteg</strong>Egy közös, ellenőrizhető munkafolyamat meghajtókezeléshez, rendszerdiagnosztikához, telepítéshez és biztonságos karbantartáshoz.';

    const lead = heroCopy.querySelector('.hero-lead');
    setBilingual(
      lead,
      'A FormatX Suite Pro független fejlesztésű technikusi szoftver. Valós rendszerállapotot tár fel, műveleti tervet készít, csak kontrollált megerősítés után hajt végre, majd visszaellenőrzi az eredményt.',
      'FormatX Suite Pro is independently developed technician software. It discovers real system state, builds an operation plan, executes only after controlled confirmation, then verifies the result.'
    );

    let method = heroCopy.querySelector('.fx-method-inline');
    if (!method) {
      method = document.createElement('ol');
      method.className = 'fx-method-inline';
      method.setAttribute('aria-label', 'FormatX Method');
      lead?.insertAdjacentElement('afterend', method);
    }

    const steps = language() === 'en'
      ? ['Discover', 'Plan', 'Controlled execution', 'Verify']
      : ['Felderítés', 'Terv', 'Kontrollált végrehajtás', 'Visszaellenőrzés'];
    method.replaceChildren(...steps.map(step => Object.assign(document.createElement('li'), {
      textContent: step
    })));
  }

  function updateNavigation() {
    const labels = [
      ['#experience', 'Idegrendszer — Hogyan működik', 'Nervous system — How it works'],
      ['#capabilities', 'Szervek — Funkciók és modulok', 'Organs — Functions and modules'],
      ['#pricing', 'Kereskedelmi szív — Licencek és árak', 'Commerce heart — Licences and pricing'],
      ['#system', 'Váz — Technológia és biztonság', 'Skeleton — Technology and safety'],
      ['#resources', 'Jeladó — Letöltés és bizonyítékok', 'Beacon — Downloads and evidence']
    ];

    labels.forEach(([href, hu, en]) => {
      document.querySelectorAll(`#main-nav a[href="${href}"]`).forEach(link => {
        setBilingual(link, hu, en);
      });
    });

    const nav = document.getElementById('main-nav');
    if (nav) {
      nav.setAttribute(
        'aria-label',
        language() === 'en' ? 'FormatX system navigation' : 'FormatX rendszernavigáció'
      );
    }
  }

  function updateDownloadSemantics() {
    const download = document.getElementById('hero-download');
    if (download) {
      download.dataset.releaseDownload = 'multiplatform';
      download.removeAttribute('download');
      const span = download.querySelector('span') || download;
      span.dataset.releaseDownloadLabel = 'true';
      setBilingual(
        span,
        'Multiplatform nyilvános béta letöltése',
        'Download multiplatform public beta'
      );
    }

    const android = document.querySelector('#hero .hero-actions a[href*="/download/android"]');
    if (android) {
      const span = android.querySelector('span') || android;
      setBilingual(
        span,
        'Android nyilvános béta letöltése',
        'Download Android public beta'
      );
    }
  }

  function updateHeroTelemetry() {
    const facts = document.querySelectorAll('#hero .hero-facts > span');
    const platforms = Array.isArray(data.status?.platforms) ? data.status.platforms.length : null;
    const issueCount = Array.isArray(data.issues?.items) ? data.issues.items.length : null;
    const verified = Array.isArray(data.tests?.cases)
      ? data.tests.cases.filter(item => item.status === 'verified').length
      : null;

    const values = [
      ['04', language() === 'en' ? 'method steps' : 'módszerlépés'],
      [
        platforms == null ? '—' : String(platforms).padStart(2, '0'),
        language() === 'en' ? 'published platform states' : 'közzétett platformállapot'
      ],
      [
        verified == null ? '—' : String(verified).padStart(2, '0'),
        language() === 'en' ? 'verified public tests' : 'ellenőrzött nyilvános teszt'
      ]
    ];

    facts.forEach((fact, index) => {
      if (!values[index]) return;
      const value = fact.querySelector('b');
      const label = fact.querySelector('small');
      if (value) value.textContent = values[index][0];
      if (label) label.textContent = values[index][1];
      fact.classList.add('fx-proof-metric');
      fact.dataset.state = values[index][0] === '—' ? 'unavailable' : 'available';
    });

    const labels = document.querySelectorAll('#hero .hero-label');
    if (labels[0]) {
      labels[0].querySelector('span').textContent = '01/04';
      labels[0].querySelector('b').textContent = 'METHOD STEP';
    }
    if (labels[1]) {
      labels[1].querySelector('span').textContent = 'BETA';
      labels[1].querySelector('b').textContent = 'PUBLIC RELEASE';
      labels[1].dataset.releaseTelemetry = 'true';
    }
    if (labels[2]) {
      labels[2].querySelector('span').textContent = issueCount == null
        ? '—'
        : String(issueCount).padStart(2, '0');
      labels[2].querySelector('b').textContent = 'KNOWN LIMITS';
    }
  }

  function updateReleaseTelemetry() {
    const target = document.querySelector('#hero .hero-label[data-release-telemetry] span');
    if (target) target.textContent = 'BETA';
  }

  function ensureTrustStrip() {
    if (!document.body.classList.contains('living-architecture')) return;
    if (document.querySelector('.fx-trust-strip')) return;

    const main = document.getElementById('main-content');
    const resource = document.getElementById('resources');
    if (!main) return;

    const section = document.createElement('section');
    section.className = 'fx-trust-strip';
    section.setAttribute('aria-labelledby', 'fx-trust-title');
    section.innerHTML = `
      <div class="fx-trust-strip__head">
        <div>
          <p class="section-index">VERIFICATION CENTRE</p>
          <h2 id="fx-trust-title"></h2>
        </div>
        <p data-fx-trust-lead></p>
      </div>
      <div class="fx-trust-grid">
        <a class="fx-trust-card" href="/scifi-ui/method.html"><strong data-card="method"></strong><small data-card-copy="method"></small><span>↗</span></a>
        <a class="fx-trust-card" href="/scifi-ui/verification.html"><strong data-card="verification"></strong><small data-card-copy="verification"></small><span>↗</span></a>
        <a class="fx-trust-card" href="/scifi-ui/test-matrix.html"><strong data-card="tests"></strong><small data-card-copy="tests"></small><span>↗</span></a>
        <a class="fx-trust-card" href="/scifi-ui/known-issues.html"><strong data-card="issues"></strong><small data-card-copy="issues"></small><span>↗</span></a>
      </div>`;

    if (resource) resource.before(section);
    else main.appendChild(section);
    translateTrustStrip(section);
  }

  function translateTrustStrip(section) {
    const en = language() === 'en';
    section.querySelector('#fx-trust-title').textContent = en
      ? 'Claims become useful only when they can be opened and checked.'
      : 'Az állítás akkor hasznos, ha megnyitható és ellenőrizhető.';
    section.querySelector('[data-fx-trust-lead]').textContent = en
      ? 'The public evidence layer separates released, tested, limited, planned and still-unverified work.'
      : 'A nyilvános bizonyítéki réteg elkülöníti a kiadott, tesztelt, korlátozott, tervezett és még nem igazolt részeket.';

    const copy = {
      method: [
        en ? 'The FormatX Method' : 'A FormatX módszer',
        en
          ? 'Discover → Plan → Controlled execution → Verify.'
          : 'Felderítés → Terv → Kontrollált végrehajtás → Visszaellenőrzés.'
      ],
      verification: [
        en ? 'Verification Centre' : 'Bizonyítéki központ',
        en
          ? 'Release, digest, signature availability, security model and evidence gaps.'
          : 'Kiadás, digest, aláírás-elérhetőség, biztonsági modell és bizonyítékhiányok.'
      ],
      tests: [
        en ? 'Public test matrix' : 'Nyilvános tesztmátrix',
        en
          ? 'No missing result is treated as a successful test.'
          : 'A hiányzó eredmény nem minősül sikeres tesztnek.'
      ],
      issues: [
        en ? 'Known issues' : 'Ismert hibák',
        en
          ? 'Open limitations, workarounds and publication status.'
          : 'Nyílt korlátozások, kerülőutak és javítási állapotok.'
      ]
    };

    Object.entries(copy).forEach(([key, values]) => {
      section.querySelector(`[data-card="${key}"]`).textContent = values[0];
      section.querySelector(`[data-card-copy="${key}"]`).textContent = values[1];
    });
  }

  function ensureIndependentOrigin() {
    const host = document.querySelector('.fx-trust-strip');
    if (!host) return;

    let paragraph = host.querySelector('.fx-independent-origin');
    if (!paragraph) {
      paragraph = document.createElement('p');
      paragraph.className = 'fx-independent-origin';
      host.appendChild(paragraph);
    }

    paragraph.textContent = language() === 'en'
      ? 'FormatX Suite Pro is an independent, one-person technology project. Hutóczky József is responsible for system design, development and product direction.'
      : 'A FormatX Suite Pro független, egyszemélyes technológiai projekt. A rendszer tervezését, fejlesztését és termékirányát Hutóczky József végzi.';
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
    if (!response.ok) throw new Error(`${url}: ${response.status}`);
    return response.json();
  }

  async function loadData() {
    const settled = await Promise.allSettled([
      fetchJson(URLS.status),
      fetchJson(URLS.tests),
      fetchJson(URLS.issues)
    ]);
    data.status = settled[0].status === 'fulfilled' ? settled[0].value : null;
    data.tests = settled[1].status === 'fulfilled' ? settled[1].value : null;
    data.issues = settled[2].status === 'fulfilled' ? settled[2].value : null;
    ROOT.__FORMATX_CONTENT_DATA__ = data;
  }

  function apply() {
    ensureCategoryDefinition();
    updateNavigation();
    updateDownloadSemantics();
    updateHeroTelemetry();
    ensureTrustStrip();
    const strip = document.querySelector('.fx-trust-strip');
    if (strip) translateTrustStrip(strip);
    ensureIndependentOrigin();
    ROOT.dataset.fxContentStandard = 'ready-v1';
  }

  async function init() {
    await loadData();
    apply();
  }

  addEventListener('formatx:languagechange', apply);
  addEventListener('formatx:releasemetadataready', updateReleaseTelemetry);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}());
