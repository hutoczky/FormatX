(function () {
  'use strict';

  const LANGUAGE_KEY = 'formatx-language';
  const RELEASE_API = 'https://api.github.com/repos/hutoczky/FormatX-Updates/releases/latest';
  const RELEASE_DOWNLOAD_PREFIX = 'https://github.com/hutoczky/FormatX-Updates/releases/download/';
  const RELEASE_PAGE_PREFIX = 'https://github.com/hutoczky/FormatX-Updates/releases/';

  const COPY = {
    hu: {
      skip: 'Ugrás a tartalomra', menu: 'Menü', navProduct: 'Termék', navFeatures: 'Funkciók', navSolutions: 'Megoldások', navPricing: 'Árak', navResources: 'Források', navCompany: 'Projekt', support: 'Támogatás', getPro: 'FormatX Suite Pro',
      heroEyebrow: 'A JÖVŐ TECHNIKUSI MUNKAFOLYAMATA', heroTagline: 'Rendszerez. Ellenőriz. Biztonságosan végrehajt.', heroDescription: 'A FormatX meghajtókezeléshez, rendszerdiagnosztikához és rendszer-előkészítéshez készül. Jelenleg a Windowsra készült asztali prototípus tölthető le. A natív Linux/Bazzite-verzió fejlesztés alatt áll; a macOS-verzió későbbi terv.', startTrial: 'Windowsos próbaverzió letöltése', androidApp: 'Android-alkalmazás', exploreFeatures: 'Funkciók megtekintése', assuranceAi: 'AI-alapú segítség', assuranceSpeed: 'Átlátható munkafolyamat', assuranceSecurity: 'Többrétegű védelem', platformNow: 'Windowsos prototípus elérhető', platformLinux: 'Linux/Bazzite-verzió fejlesztés alatt', platformMac: 'macOS-verzió későbbre tervezve',
      engineOverview: 'Áttekintés', engineTransform: 'Átalakítás', engineValidate: 'Ellenőrzés', engineAutomate: 'Automatizálás', engineIntegrations: 'Integrációk', engineInsights: 'Elemzések', performance: 'Rendszerállapot', releaseIntegrity: 'Kiadási integritás', jobsCompleted: 'Fő modulok', successRate: 'Asztali kiadás', timeSaved: 'Platformok',
      pricingTitle: 'VÁLASZD KI A MUNKÁDHOZ ILLŐ LICENCCSOMAGOT', planLite: 'Business Lite', planLiteCopy: 'Egyéni technikusoknak és kisebb feladatokra', planPro: 'Business Pro', planProCopy: 'Növekvő technikusi és üzleti környezethez', planTeam: 'Technician Team', planTeamCopy: 'Nagyobb csapatok és több rendszer kezeléséhez', perMonth: '/ hónap', lite1: '1 technikus', lite2: 'Legfeljebb 10 gép', lite3: 'Minden alapfunkció', lite4: 'Normál támogatás', pro1: '3 technikus', pro2: 'Legfeljebb 50 gép', pro3: 'Haladó automatizálás', pro4: 'Elsőbbségi támogatás', team1: '5 technikus', team2: 'Legfeljebb 150 gép', team3: 'Teljes modulkészlet', team4: 'Kiemelt támogatás', choosePlan: 'Csomag választása', mostPopular: 'LEGNÉPSZERŰBB', trialNote: '5 napos próbaidő', noCard: 'Nincs bankkártya-adatkezelés', cancelAnytime: 'Nincs automatikus megújítás',
      checkoutPreview: 'BIZTONSÁGOS CHECKOUT ELŐNÉZET', selectedPlan: 'Business Pro licenc', monthlyAccess: '1 hónapos hozzáférés', amountEur: 'Összeg EUR-ban', amountHuf: 'Összeg HUF-ban', fixedAmount: 'Fix, előre rögzített összeg', openCheckout: 'Checkout megnyitása', scanToPay: 'FIZETÉS QR-KÓDDAL', secureQr: 'Biztonságos banki átutalás', instantSecure: 'Fix összeg · HUF / EUR · Kézi ellenőrzés',
      featuresTitle: 'HATÉKONY FUNKCIÓK. ÁTLÁTHATÓ MUNKAFOLYAMATOK.', feature1Title: 'Meghajtókezelő eszköztár', feature1Copy: 'Ellenőrizhető meghajtó- és fájlműveletek a jelenlegi Windows prototípusban.', feature2Title: 'Rendszerdiagnosztika', feature2Copy: 'Valós CPU-, memória-, hálózati és tárhelyadatok.', feature3Title: 'Munkafolyamat-automatizálás', feature3Copy: 'Telepítés, ellenőrzés és frissítés egységes folyamatban.', feature4Title: 'Többrétegű biztonság', feature4Copy: 'Megerősítés, naplózás, SHA256 és Ed25519 ellenőrzés.', feature5Title: 'Valós idejű áttekintés', feature5Copy: 'Mérhető rendszerállapotok kitalált adatok nélkül.', feature6Title: 'Platformállapot', feature6Copy: 'Jelenleg a Windowsos asztali prototípus érhető el. A Linux/Bazzite a következő, elsődleges fejlesztési cél; a macOS-verzió későbbi terv.',
      trustedTitle: 'ELLENŐRIZHETŐ TECHNOLÓGIAI ALAPOK', trust1Title: 'Ellenőrzött kiadás', trust1Copy: 'GitHub Release és hash-ellenőrzés', trust2Title: 'Közvetlen támogatás', trust2Copy: 'Nyilvános hibajegy és licenctámogatás', trust3Title: 'Adatvédelem', trust3Copy: 'Nincs bankkártyaadat-kezelés', releaseChannel: 'ELLENŐRZÖTT KIADÁSI CSATORNA', releaseDetails: 'Kiadási részletek →',
      footerCopy: 'Technikusi platform formázáshoz, rendszerdiagnosztikához, telepítéshez és ellenőrzött karbantartási feladatokhoz.', footerProduct: 'TERMÉK', overview: 'Áttekintés', whatsNew: 'Funkciók', integrations: 'Integrációk', roadmap: 'Csomagok', footerResources: 'FORRÁSOK', documentation: 'Támogatás', guides: 'Hibajegyek', community: 'Kiadások', footerLegal: 'JOGI', privacy: 'Adatvédelem', terms: 'Felhasználási feltételek', security: 'Biztonság', checkout: 'Checkout', stayUpdated: 'NAPRAKÉSZ INFORMÁCIÓK', updatesCopy: 'A legújabb stabil kiadás és a projektállapot a GitHub kiadási csatornáján követhető.', followReleases: 'Kiadások követése →', backTop: 'Vissza a tetejére ↑'
    },
    en: {
      skip: 'Skip to content', menu: 'Menu', navProduct: 'Product', navFeatures: 'Features', navSolutions: 'Solutions', navPricing: 'Pricing', navResources: 'Resources', navCompany: 'Project', support: 'Support', getPro: 'Get FormatX Suite Pro',
      heroEyebrow: 'THE NEXT GENERATION OF TECHNICIAN WORKFLOWS', heroTagline: 'Organise. Verify. Execute safely.', heroDescription: 'FormatX is being developed for drive management, system diagnostics and system preparation. The current downloadable desktop prototype runs on Windows. A native Linux/Bazzite version is under development, while macOS support is planned for a later phase.', startTrial: 'Download Windows prototype', androidApp: 'Android app', exploreFeatures: 'Explore Features', assuranceAi: 'AI-assisted guidance', assuranceSpeed: 'Clear technician workflow', assuranceSecurity: 'Multi-layer protection', platformNow: 'Windows prototype available now', platformLinux: 'Linux/Bazzite version in development', platformMac: 'macOS version planned later',
      engineOverview: 'Overview', engineTransform: 'Transform', engineValidate: 'Validate', engineAutomate: 'Automate', engineIntegrations: 'Integrations', engineInsights: 'Insights', performance: 'System status', releaseIntegrity: 'Release Integrity', jobsCompleted: 'Core modules', successRate: 'Desktop release', timeSaved: 'Platforms',
      pricingTitle: 'CHOOSE THE LICENCE PLAN THAT FITS YOUR WORKFLOW', planLite: 'Business Lite', planLiteCopy: 'For individual technicians and smaller workloads', planPro: 'Business Pro', planProCopy: 'For growing technician and business environments', planTeam: 'Technician Team', planTeamCopy: 'For larger teams managing more systems', perMonth: '/ month', lite1: '1 technician', lite2: 'Up to 10 devices', lite3: 'All standard features', lite4: 'Standard support', pro1: '3 technicians', pro2: 'Up to 50 devices', pro3: 'Advanced automation', pro4: 'Priority support', team1: '5 technicians', team2: 'Up to 150 devices', team3: 'Complete module set', team4: 'Priority team support', choosePlan: 'Choose Plan', mostPopular: 'MOST POPULAR', trialNote: '5-day trial included', noCard: 'No card data processed', cancelAnytime: 'No automatic renewal',
      checkoutPreview: 'SECURE CHECKOUT PREVIEW', selectedPlan: 'Business Pro Licence', monthlyAccess: '1 month access', amountEur: 'Amount in EUR', amountHuf: 'Amount in HUF', fixedAmount: 'Fixed, predefined amount', openCheckout: 'Open Checkout', scanToPay: 'PAY BY QR CODE', secureQr: 'Secure bank transfer', instantSecure: 'Fixed amount · HUF / EUR · Manual verification',
      featuresTitle: 'PRACTICAL FEATURES. CLEAR WORKFLOWS.', feature1Title: 'Drive management toolkit', feature1Copy: 'Verifiable drive and file operations in the current Windows prototype.', feature2Title: 'System Diagnostics', feature2Copy: 'Real CPU, memory, network and storage data.', feature3Title: 'Workflow Automation', feature3Copy: 'Deployment, validation and updates in one workflow.', feature4Title: 'Multi-Layer Security', feature4Copy: 'Confirmation, audit logs, SHA256 and Ed25519 verification.', feature5Title: 'Real-Time Overview', feature5Copy: 'Measurable system states without fabricated data.', feature6Title: 'Platform status', feature6Copy: 'The Windows desktop prototype is currently available. Linux / Bazzite is the next primary development target, while macOS is planned for a later phase.',
      trustedTitle: 'VERIFIABLE TECHNOLOGY FOUNDATIONS', trust1Title: 'Verified Releases', trust1Copy: 'GitHub Releases and hash verification', trust2Title: 'Direct Support', trust2Copy: 'Public issues and licence support', trust3Title: 'Data Privacy', trust3Copy: 'No payment card data processing', releaseChannel: 'VERIFIED RELEASE CHANNEL', releaseDetails: 'Release details →',
      footerCopy: 'A technician platform for formatting, system diagnostics, deployment and controlled maintenance tasks.', footerProduct: 'PRODUCT', overview: 'Overview', whatsNew: 'Features', integrations: 'Integrations', roadmap: 'Plans', footerResources: 'RESOURCES', documentation: 'Support', guides: 'Issues', community: 'Releases', footerLegal: 'LEGAL', privacy: 'Privacy', terms: 'Terms of Use', security: 'Security', checkout: 'Checkout', stayUpdated: 'STAY UPDATED', updatesCopy: 'Follow the latest stable release and project status through the GitHub release channel.', followReleases: 'Follow Releases →', backTop: 'Back to top ↑'
    }
  };

  let language = initialLanguage();

  function initialLanguage() {
    const query = new URLSearchParams(window.location.search).get('lang');
    if (query === 'hu' || query === 'en') return query;
    try {
      const stored = window.localStorage.getItem(LANGUAGE_KEY);
      if (stored === 'hu' || stored === 'en') return stored;
    } catch (_) {}
    return String(window.navigator.language || '').toLowerCase().startsWith('hu') ? 'hu' : 'en';
  }

  function applyLanguage(nextLanguage, persist) {
    language = nextLanguage === 'en' ? 'en' : 'hu';
    const dictionary = COPY[language];
    document.documentElement.lang = language;
    document.querySelectorAll('[data-text]').forEach(function (element) {
      const value = dictionary[element.dataset.text];
      if (typeof value === 'string') element.textContent = value;
    });
    document.querySelectorAll('[data-language]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    if (persist) {
      try { window.localStorage.setItem(LANGUAGE_KEY, language); } catch (_) {}
      const current = new URL(window.location.href);
      current.searchParams.set('lang', language);
      window.history.replaceState({}, '', current.pathname + current.search + current.hash);
    }
    updateInternalLinks();
    updateCheckoutPreview();
  }

  function updateInternalLinks() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (!url.pathname.endsWith('.html') && !url.pathname.endsWith('/')) return;
        url.searchParams.set('lang', language);
        link.href = url.pathname + url.search + url.hash;
      } catch (_) {}
    });
  }

  function initialiseMenu() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function formatPrice(value, currency) {
    return new Intl.NumberFormat(language === 'hu' ? 'hu-HU' : 'en-GB', {
      style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(value);
  }

  function currentCurrency() {
    const active = document.querySelector('[data-currency][aria-pressed="true"]');
    return active && active.dataset.currency === 'EUR' ? 'EUR' : 'HUF';
  }

  function updateCheckoutPreview() {
    const currency = currentCurrency();
    const mainPrice = document.getElementById('preview-main-price');
    const secondaryPrice = document.getElementById('preview-secondary-price');
    const secondaryLabel = document.getElementById('preview-secondary-label');
    const checkoutLink = document.getElementById('preview-checkout-link');
    const qrLink = document.getElementById('qr-preview-link');
    if (mainPrice) mainPrice.textContent = currency === 'EUR' ? formatPrice(110, 'EUR') : formatPrice(39900, 'HUF');
    if (secondaryPrice) secondaryPrice.textContent = currency === 'EUR' ? formatPrice(39900, 'HUF') : formatPrice(110, 'EUR');
    if (secondaryLabel) secondaryLabel.textContent = COPY[language][currency === 'EUR' ? 'amountHuf' : 'amountEur'];
    const href = './checkout.html?plan=business_pro&cycle=monthly&currency=' + currency + '&lang=' + language;
    if (checkoutLink) checkoutLink.href = href;
    if (qrLink) qrLink.href = href;
  }

  function initialiseCurrencyTabs() {
    document.querySelectorAll('[data-currency]').forEach(function (button) {
      button.addEventListener('click', function () {
        document.querySelectorAll('[data-currency]').forEach(function (candidate) {
          candidate.setAttribute('aria-pressed', String(candidate === button));
        });
        updateCheckoutPreview();
      });
    });
  }

  function isTrustedUrl(value, prefix) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.href.startsWith(prefix);
    } catch (_) { return false; }
  }

  async function loadLatestRelease() {
    const heroDownload = document.getElementById('hero-download');
    const releaseName = document.getElementById('release-name');
    const releasePublished = document.getElementById('release-published');
    const releasePageLink = document.getElementById('release-page-link');
    try {
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = controller ? window.setTimeout(function () { controller.abort(); }, 7000) : null;
      const response = await fetch(RELEASE_API, { headers: { Accept: 'application/vnd.github+json' }, signal: controller ? controller.signal : undefined });
      if (timer) window.clearTimeout(timer);
      if (!response.ok) throw new Error('GitHub API HTTP ' + response.status);
      const payload = await response.json();
      const versionMatch = String(payload.tag_name || '').match(/^v?(\d+)$/i);
      if (!versionMatch || payload.draft || payload.prerelease || !Array.isArray(payload.assets)) throw new Error('Invalid release metadata');
      const version = 'V' + versionMatch[1];
      const expectedAsset = 'FormatX-Suite-Pro-' + version + '.zip';
      const asset = payload.assets.find(function (candidate) { return candidate && candidate.name === expectedAsset; });
      if (!asset || !isTrustedUrl(asset.browser_download_url, RELEASE_DOWNLOAD_PREFIX)) throw new Error('Missing trusted release asset');
      if (!isTrustedUrl(payload.html_url, RELEASE_PAGE_PREFIX)) throw new Error('Untrusted release page');
      if (heroDownload) heroDownload.href = asset.browser_download_url;
      if (releaseName) releaseName.textContent = 'FormatX Suite Pro ' + version;
      if (releasePublished) {
        const date = new Date(payload.published_at);
        releasePublished.textContent = Number.isNaN(date.getTime()) ? 'GitHub Releases' : new Intl.DateTimeFormat(language === 'hu' ? 'hu-HU' : 'en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
      }
      if (releasePageLink) releasePageLink.href = payload.html_url;
    } catch (_) {}
  }

  document.querySelectorAll('[data-language]').forEach(function (button) {
    button.addEventListener('click', function () { applyLanguage(button.dataset.language, true); });
  });
  initialiseMenu();
  initialiseCurrencyTabs();
  applyLanguage(language, false);
  loadLatestRelease();
}());
