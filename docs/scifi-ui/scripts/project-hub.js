(function () {
  'use strict';

  initialiseAndroidAppMode();
  initialiseAndroidMobilePromotion();

  document.querySelectorAll('a[href="#project-details"]').forEach(function (anchorLink) {
    anchorLink.href = '/project.html';
  });

  const anchor = document.getElementById('project-details');
  if (!anchor || document.querySelector('.project-hub')) return;

  const section = document.createElement('section');
  section.className = 'project-hub';
  section.innerHTML = '<header class="project-hub-header"><span>Részletes projektbemutató</span><h2>Ismerd meg a FormatX teljes rendszerét</h2><p>A főoldal gyors áttekintése után külön oldalakon mutatjuk be, kinek készült a rendszer, milyen előnyöket ad, miből épül fel, hogyan működik és milyen biztonsági elveket követ.</p></header><div class="project-hub-grid"><a class="project-hub-card" href="/project.html"><strong>A projekt teljes képe</strong><p>Célok, kiinduló probléma, architektúra, alapelvek és hosszú távú jövőkép.</p><em>Projektbemutató →</em></a><a class="project-hub-card" href="/audiences.html"><strong>Kinek ajánljuk?</strong><p>Technikusok, szervizek, rendszergazdák, laborok és haladó felhasználók.</p><em>Célcsoportok →</em></a><a class="project-hub-card" href="/benefits.html"><strong>Miért FormatX?</strong><p>Kevesebb eszközváltás, követhetőbb feladatok és kiszámíthatóbb technikusi minőség.</p><em>Előnyök →</em></a><a class="project-hub-card" href="/modules.html"><strong>Modulok részletesen</strong><p>ISO-kezelés, formázás, partíciók, diagnosztika, fájlkezelés és kiadásellenőrzés.</p><em>Modulok →</em></a><a class="project-hub-card" href="/workflow.html"><strong>Technikusi munkafolyamat</strong><p>A felderítéstől a tervezésen és végrehajtáson át a végső ellenőrzésig.</p><em>Munkafolyamat →</em></a><a class="project-hub-card" href="/security.html"><strong>Biztonság és kontroll</strong><p>Célazonosítás, megerősítések, mentési elvek, állapotok és integritás.</p><em>Biztonság →</em></a></div>';
  anchor.insertAdjacentElement('afterend', section);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const wideViewport = window.matchMedia('(min-width: 901px)').matches;
  const androidApp = document.documentElement.dataset.formatxApp === 'android';
  if (reduceMotion || !finePointer || !wideViewport || androidApp) return;

  document.querySelectorAll(
    '.project-hub-card,.price-card,.feature-cards article,.project-module-grid article,.project-workflow article,.project-foundation-grid article,.android-mobile-promo',
  ).forEach(function (card) {
    let frame = 0;

    card.addEventListener('pointermove', function (event) {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        const rect = card.getBoundingClientRect();
        const px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
        const py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
        const isProjectHubCard = card.classList.contains('project-hub-card');
        const maxRotateX = isProjectHubCard ? 2.6 : 2.1;
        const maxRotateY = isProjectHubCard ? 3.8 : 3.1;

        card.style.setProperty('--rx', (-(py - 0.5) * maxRotateX).toFixed(2) + 'deg');
        card.style.setProperty('--ry', ((px - 0.5) * maxRotateY).toFixed(2) + 'deg');
        card.style.setProperty('--glare-x', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--glare-y', (py * 100).toFixed(1) + '%');
      });
    }, { passive: true });

    card.addEventListener('pointerleave', function () {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      card.style.removeProperty('--rx');
      card.style.removeProperty('--ry');
      card.style.removeProperty('--glare-x');
      card.style.removeProperty('--glare-y');
    });
  });

  const engine = document.querySelector('.core-engine');
  if (engine) {
    let engineFrame = 0;

    window.addEventListener('pointermove', function (event) {
      if (engineFrame) cancelAnimationFrame(engineFrame);
      engineFrame = requestAnimationFrame(function () {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        engine.style.transform = 'rotateY(' + (-4 + x * 4).toFixed(2) + 'deg) rotateX(' + (1.5 - y * 3).toFixed(2) + 'deg) translateZ(16px)';
      });
    }, { passive: true });

    window.addEventListener('mouseleave', function () {
      if (engineFrame) cancelAnimationFrame(engineFrame);
      engineFrame = 0;
      engine.style.transform = '';
    });
  }

  function initialiseAndroidAppMode() {
    const query = new URLSearchParams(window.location.search);
    const userAgent = String(window.navigator.userAgent || '');
    if (query.get('app') !== 'android' && userAgent.indexOf('FormatXAndroid/') === -1) return;

    document.documentElement.dataset.formatxApp = 'android';
    if (document.body) document.body.classList.add('formatx-android-app');
    if (document.querySelector('link[data-formatx-android-style]')) return;

    const currentScript = findCurrentScript();
    if (!currentScript) return;

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.dataset.formatxAndroidStyle = 'true';
    stylesheet.href = new URL('../styles/android-app.css?v=20260720-android-app-1', currentScript.src).href;
    document.head.appendChild(stylesheet);
  }

  function initialiseAndroidMobilePromotion() {
    if (document.querySelector('.android-mobile-promo')) return;
    const insertionPoint = document.getElementById('features') || document.getElementById('project-details');
    if (!insertionPoint) return;

    const currentScript = findCurrentScript();
    if (currentScript && !document.querySelector('link[data-formatx-mobile-promo-style]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.dataset.formatxMobilePromoStyle = 'true';
      stylesheet.href = new URL('../styles/android-mobile-promo.css?v=20260725-mobile-promo-1', currentScript.src).href;
      document.head.appendChild(stylesheet);
    }

    const promo = document.createElement('section');
    promo.id = 'android-mobile';
    promo.className = 'android-mobile-promo';
    promo.setAttribute('aria-labelledby', 'android-mobile-title');
    promo.innerHTML = '<div class="android-mobile-promo-copy"><p class="android-mobile-promo-kicker" data-mobile-hu="KÜLÖN ANDROID KIADÁS" data-mobile-en="DEDICATED ANDROID EDITION">KÜLÖN ANDROID KIADÁS</p><h2 id="android-mobile-title" data-mobile-hu="FormatX Mobile — a projekt saját Android-központja." data-mobile-en="FormatX Mobile — the project’s dedicated Android centre.">FormatX Mobile — a projekt saját Android-központja.</h2><p data-mobile-hu="Nem a számítógépes oldal lekicsinyített másolata. Mobilra tervezett projekt-, kiadás-, támogatási és licencfelület, külön telepíthető alkalmazáscsomaggal." data-mobile-en="Not a scaled-down copy of the desktop page. A mobile-first project, release, support and licence interface with a separately installable app package.">Nem a számítógépes oldal lekicsinyített másolata. Mobilra tervezett projekt-, kiadás-, támogatási és licencfelület, külön telepíthető alkalmazáscsomaggal.</p><div class="android-mobile-promo-points"><span><i>✓</i><b data-mobile-hu="Külön alkalmazásazonosító" data-mobile-en="Separate application identity">Külön alkalmazásazonosító</b></span><span><i>✓</i><b data-mobile-hu="Mobilra optimalizált felület" data-mobile-en="Mobile-optimised interface">Mobilra optimalizált felület</b></span><span><i>✓</i><b data-mobile-hu="HTTPS és biztonságos WebView" data-mobile-en="HTTPS and secure WebView">HTTPS és biztonságos WebView</b></span><span><i>✓</i><b data-mobile-hu="SHA-256 ellenőrzött APK" data-mobile-en="SHA-256 verified APK">SHA-256 ellenőrzött APK</b></span></div><div class="android-mobile-promo-actions"><a class="android-mobile-primary" href="/scifi-ui/downloads/FormatX-Mobile-Android.apk" download><span data-mobile-hu="ANDROID APK LETÖLTÉSE" data-mobile-en="DOWNLOAD ANDROID APK">ANDROID APK LETÖLTÉSE</span><b>↓</b></a><a class="android-mobile-secondary" href="/scifi-ui/android/"><span data-mobile-hu="MOBILVERZIÓ MEGNYITÁSA" data-mobile-en="OPEN MOBILE EDITION">MOBILVERZIÓ MEGNYITÁSA</span><b>→</b></a></div></div><div class="android-mobile-device" aria-hidden="true"><div class="android-mobile-screen"><div class="android-mobile-screen-head"><img src="/scifi-ui/assets/images/formatx-icon.png" width="34" height="34" alt=""><span><strong>FORMATX</strong><small>MOBILE · ANDROID</small></span></div><h3 data-mobile-hu="Mobil központ" data-mobile-en="Mobile centre">Mobil központ</h3><p data-mobile-hu="Projekt, kiadások, támogatás és licencek egy Androidra tervezett nézetben." data-mobile-en="Project, releases, support and licences in an Android-first view.">Projekt, kiadások, támogatás és licencek egy Androidra tervezett nézetben.</p><div class="android-mobile-screen-grid"><span><i>⌘</i><b data-mobile-hu="Projekt" data-mobile-en="Project">Projekt</b></span><span><i>⇩</i><b data-mobile-hu="Kiadások" data-mobile-en="Releases">Kiadások</b></span><span><i>◎</i><b data-mobile-hu="Támogatás" data-mobile-en="Support">Támogatás</b></span><span><i>◇</i><b data-mobile-hu="Licencek" data-mobile-en="Licences">Licencek</b></span></div><div class="android-mobile-screen-status"><span data-mobile-hu="ANDROID KIADÁS" data-mobile-en="ANDROID RELEASE">ANDROID KIADÁS</span><strong id="android-mobile-version">1.0.0</strong><i></i></div></div></div>';
    insertionPoint.insertAdjacentElement('afterend', promo);

    function applyPromoLanguage() {
      const english = document.documentElement.lang === 'en';
      promo.querySelectorAll('[data-mobile-hu][data-mobile-en]').forEach(function (element) {
        element.textContent = english ? element.dataset.mobileEn : element.dataset.mobileHu;
      });
    }

    applyPromoLanguage();
    new MutationObserver(applyPromoLanguage).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });

    fetch('/scifi-ui/downloads/android-mobile-update.json', {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    }).then(function (response) {
      return response.ok ? response.json() : null;
    }).then(function (payload) {
      const version = payload && String(payload.versionName || '').trim();
      const node = document.getElementById('android-mobile-version');
      if (node && /^\d+\.\d+\.\d+$/.test(version)) node.textContent = version;
    }).catch(function () {});
  }

  function findCurrentScript() {
    return Array.prototype.find.call(
      document.scripts,
      function (script) { return /\/scripts\/project-hub\.js(?:\?|$)/.test(script.src); },
    ) || null;
  }
}());
