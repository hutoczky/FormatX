(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxCategoryPositioning === 'v1') return;
  root.dataset.fxCategoryPositioning = 'v1';

  const COPY = {
    hu: {
      title: 'FormatX Suite Pro | Technikusi operációs réteg',
      description: 'A FormatX Suite Pro letölthető, többplatformos technikusi operációs réteg meghajtókezeléshez, diagnosztikához, telepítéshez és ellenőrizhető rendszerkarbantartáshoz.',
      kicker: 'TECHNIKUSI OPERÁCIÓS RÉTEG',
      lead: 'A FormatX Suite Pro egy letölthető, többplatformos technikusi rendszer meghajtók, adathordozók és operációs környezetek felméréséhez, előkészítéséhez, módosításához és visszaellenőrzéséhez. Nem látványos díszadatokat mutat: minden kritikus lépést valós állapot, célazonosítás és dokumentálható eredmény köt össze.',
      enter: 'A működés megismerése',
      nav: ['Működés', 'Modulok', 'Licencek', 'Bizonyíték', 'Letöltés'],
      facts: [
        ['06', 'ellenőrizhető modul'],
        ['03', 'támogatott natív platform'],
        ['05', 'nap teljes próba']
      ],
      deckEyebrow: 'FORMATX / CATEGORY DEFINITION',
      deckTitle: 'Nem egy szebb segédprogram. Saját technikusi kategória.',
      deckLead: 'A vizuális világ egyedi, de a termékígéret mérhető: lásd a valós állapotot, tudd előre a műveleti tervet, és kapj ellenőrizhető eredményt.',
      deckCards: [
        ['MI EZ?', 'Linux/Bazzite-elsődleges technikusi operációs réteg, Windows és Android Full release támogatással. A web Technical preview; macOS és iOS/iPadOS Planned.'],
        ['KINEK?', 'Egyéni technikusoknak, szervizeknek és olyan csapatoknak, amelyek több gépet kezelnek következetes munkafolyamatban.'],
        ['MIT KEZEL?', 'ISO→USB, formázás, partíciótervezés, biztonságos törlés, SMART, diagnosztika és AI-alapú döntéstámogatás.'],
        ['MIÉRT MÁS?', 'Felderítés → terv → kontrollált végrehajtás → visszaellenőrzés. Kitalált telemetria és vak műveletek nélkül.']
      ],
      capabilitiesTitle: ['Hat valós technikusi modul.', 'Egyetlen ellenőrizhető munkafolyamat.'],
      pricingTitle: ['Három licencszint.', 'Pontosan meghatározott kapacitás.'],
      plans: {
        business_lite: {
          description: 'Egyéni technikusnak, rendszeres kisebb munkaterheléshez.',
          bullets: ['1 technikusi hozzáférés', 'Legfeljebb 10 kezelt rendszer', 'ISO→USB, formázás és partíciótervezés', 'SMART és rendszerdiagnosztika', 'Egyszeri havi vagy éves fizetés; nincs automatikus megújítás']
        },
        business_pro: {
          description: 'Növekvő szerviznek vagy kis technikusi csapatnak.',
          bullets: ['3 technikusi hozzáférés', 'Legfeljebb 50 kezelt rendszer', 'Teljes standard modulkészlet', 'Haladó automatizálás és AI-döntéstámogatás', 'Egyszeri havi vagy éves fizetés; nincs automatikus megújítás']
        },
        technician_team: {
          description: 'Nagyobb csapatnak és magasabb rendszerkapacitáshoz.',
          bullets: ['5 technikusi hozzáférés', 'Legfeljebb 150 kezelt rendszer', 'Teljes modulkészlet és csapatkapacitás', 'Egységes munkafolyamat több technikus számára', 'Egyszeri havi vagy éves fizetés; nincs automatikus megújítás']
        }
      },
      proofEyebrow: '05.5 — ORIGIN / PROOF / VISION',
      proofTitle: 'Miért született meg a FormatX?',
      proofStory: 'A projekt abból a problémából indult, hogy a technikusi eszközök gyakran szétszórtak, platformfüggők vagy nem mutatják meg elég világosan, mi fog történni egy kritikus művelet során. A FormatX célja ezért nem egy újabb eszköztár, hanem egy közös operációs réteg: ugyanaz a felmérési, tervezési, végrehajtási és ellenőrzési logika minden támogatott környezetben.',
      proofStatement: 'A jövőkép: a technikus egyetlen felületen lássa, mit tud a rendszer, mit készül végrehajtani, és mi lett ténylegesen ellenőrizve.',
      proofCards: [
        ['KIADÁSI LÁNC', 'A teljes kiadás hivatalos csomagja az ellenőrzött FormatX kiadási csatornából származik. A külön Stable minősítéshez további nyilvános tesztbizonyíték szükséges.'],
        ['INTEGRITÁS', 'A jelenlegi kiadási metaadat SHA-256 digestet közöl. Külön checksum- vagy aláírási bizonyíték csak tényleges publikálás esetén jelenhet meg.'],
        ['BIZTONSÁGI MODELL', 'Célmeghajtó-azonosítás, többlépcsős megerősítés, naplózott végrehajtás és dokumentálható végeredmény.'],
        ['PLATFORMSTRATÉGIA', 'Linux/Bazzite az elsődleges platform. Windows és Android Full release; web Technical preview; macOS és iOS/iPadOS Planned.']
      ],
      footer: 'Letölthető, ellenőrizhető technikusi operációs réteg meghajtókezeléshez, diagnosztikához, telepítéshez és biztonságos rendszerkarbantartáshoz.'
    },
    en: {
      title: 'FormatX Suite Pro | Technician Operating Layer',
      description: 'FormatX Suite Pro is a downloadable cross-platform technician operating layer for drive management, diagnostics, deployment and verifiable system maintenance.',
      kicker: 'TECHNICIAN OPERATING LAYER',
      lead: 'FormatX Suite Pro is a downloadable cross-platform technician system for assessing, preparing, modifying and verifying drives, storage media and operating environments. It does not display decorative fake data: every critical step connects real state, explicit target identification and a documentable result.',
      enter: 'See how it works',
      nav: ['How it works', 'Modules', 'Licences', 'Proof', 'Download'],
      facts: [
        ['06', 'verifiable modules'],
        ['03', 'supported native platforms'],
        ['05', 'day full trial']
      ],
      deckEyebrow: 'FORMATX / CATEGORY DEFINITION',
      deckTitle: 'Not a prettier utility. A technician category of its own.',
      deckLead: 'The visual world is distinctive, but the product promise is measurable: see the real state, know the execution plan and receive a verifiable outcome.',
      deckCards: [
        ['WHAT IS IT?', 'A Linux/Bazzite-first technician operating layer with Windows and Android Full release support. Web is a Technical preview; macOS and iOS/iPadOS are Planned.'],
        ['WHO IS IT FOR?', 'Independent technicians, service businesses and teams managing multiple machines through one consistent workflow.'],
        ['WHAT DOES IT HANDLE?', 'ISO-to-USB, formatting, partition planning, secure erase, SMART, diagnostics and AI-assisted guidance.'],
        ['WHY IS IT DIFFERENT?', 'Discover → plan → controlled execution → verification. No fabricated telemetry and no blind operations.']
      ],
      capabilitiesTitle: ['Six real technician modules.', 'One verifiable workflow.'],
      pricingTitle: ['Three licence tiers.', 'Precisely defined capacity.'],
      plans: {
        business_lite: {
          description: 'For an independent technician with a regular smaller workload.',
          bullets: ['1 technician access', 'Up to 10 managed systems', 'ISO-to-USB, formatting and partition planning', 'SMART and system diagnostics', 'One-time monthly or annual payment; no automatic renewal']
        },
        business_pro: {
          description: 'For a growing service business or small technician team.',
          bullets: ['3 technician accesses', 'Up to 50 managed systems', 'Complete standard module set', 'Advanced automation and AI-assisted guidance', 'One-time monthly or annual payment; no automatic renewal']
        },
        technician_team: {
          description: 'For a larger team requiring higher system capacity.',
          bullets: ['5 technician accesses', 'Up to 150 managed systems', 'Complete module set and team capacity', 'One consistent workflow for multiple technicians', 'One-time monthly or annual payment; no automatic renewal']
        }
      },
      proofEyebrow: '05.5 — ORIGIN / PROOF / VISION',
      proofTitle: 'Why was FormatX created?',
      proofStory: 'The project began with a practical problem: technician tools are often fragmented, platform-bound or fail to explain clearly what a critical operation will do. FormatX is therefore not another toolbox. It is a shared operating layer that applies the same assess, plan, execute and verify logic across every supported environment.',
      proofStatement: 'The vision: one interface where the technician can see what the system knows, what it is about to execute and what was actually verified.',
      proofCards: [
        ['RELEASE CHAIN', 'The official full-release package comes from the verified FormatX release channel. The separate Stable designation requires additional published test evidence.'],
        ['INTEGRITY', 'Current release metadata publishes a SHA-256 digest. Separate checksum or signature proof may appear only when it has actually been published.'],
        ['SAFETY MODEL', 'Target identification, multi-step confirmation, logged execution and a documentable final result.'],
        ['PLATFORM STRATEGY', 'Linux/Bazzite is primary. Windows and Android are Full release; Web is a Technical preview; macOS and iOS/iPadOS are Planned.']
      ],
      footer: 'A downloadable, verifiable technician operating layer for drive management, diagnostics, deployment and safe system maintenance.'
    }
  };

  const language = () => root.lang === 'en' ? 'en' : 'hu';

  function setText(element, hu, en) {
    if (!element) return;
    element.dataset.hu = hu;
    element.dataset.en = en;
    element.textContent = language() === 'en' ? en : hu;
  }

  function buildDeck() {
    const hero = document.getElementById('hero');
    const grid = hero?.querySelector('.hero-grid');
    if (!hero || !grid || hero.querySelector('.fx-category-deck')) return;
    const deck = document.createElement('section');
    deck.className = 'fx-category-deck';
    deck.setAttribute('aria-labelledby', 'fx-category-title');
    deck.innerHTML = '<header><p class="section-index" data-fx-category-eyebrow></p><h2 id="fx-category-title" data-fx-category-title></h2><p data-fx-category-lead></p></header><div class="fx-category-grid"></div>';
    grid.insertAdjacentElement('afterend', deck);
  }

  function buildProof() {
    const system = document.getElementById('system');
    const systemGrid = system?.querySelector('.system-grid');
    if (!system || !systemGrid || system.querySelector('.fx-origin-proof')) return;
    const proof = document.createElement('section');
    proof.className = 'fx-origin-proof';
    proof.setAttribute('aria-labelledby', 'fx-origin-title');
    proof.innerHTML = '<div class="fx-origin-copy"><p class="section-index" data-fx-proof-eyebrow></p><h3 id="fx-origin-title" data-fx-proof-title></h3><p data-fx-proof-story></p><blockquote data-fx-proof-statement></blockquote></div><div class="fx-proof-grid"></div>';
    systemGrid.insertAdjacentElement('afterend', proof);
  }

  function renderDeck(copy) {
    const deck = document.querySelector('.fx-category-deck');
    if (!deck) return;
    deck.querySelector('[data-fx-category-eyebrow]').textContent = copy.deckEyebrow;
    deck.querySelector('[data-fx-category-title]').textContent = copy.deckTitle;
    deck.querySelector('[data-fx-category-lead]').textContent = copy.deckLead;
    const grid = deck.querySelector('.fx-category-grid');
    grid.replaceChildren(...copy.deckCards.map((item, index) => {
      const article = document.createElement('article');
      article.innerHTML = '<span>' + String(index + 1).padStart(2, '0') + '</span><h3></h3><p></p>';
      article.querySelector('h3').textContent = item[0];
      article.querySelector('p').textContent = item[1];
      return article;
    }));
  }

  function renderProof(copy) {
    const proof = document.querySelector('.fx-origin-proof');
    if (!proof) return;
    proof.querySelector('[data-fx-proof-eyebrow]').textContent = copy.proofEyebrow;
    proof.querySelector('[data-fx-proof-title]').textContent = copy.proofTitle;
    proof.querySelector('[data-fx-proof-story]').textContent = copy.proofStory;
    proof.querySelector('[data-fx-proof-statement]').textContent = copy.proofStatement;
    const grid = proof.querySelector('.fx-proof-grid');
    grid.replaceChildren(...copy.proofCards.map((item, index) => {
      const article = document.createElement('article');
      article.innerHTML = '<span>' + String(index + 1).padStart(2, '0') + '</span><div><h4></h4><p></p></div>';
      article.querySelector('h4').textContent = item[0];
      article.querySelector('p').textContent = item[1];
      return article;
    }));
  }

  function updatePlan(planId, planCopy) {
    const card = document.querySelector('[data-plan-id="' + planId + '"]');
    if (!card) return;
    const paragraph = card.querySelector(':scope > p');
    if (paragraph) paragraph.textContent = planCopy.description;
    const list = card.querySelector('ul');
    if (list) list.replaceChildren(...planCopy.bullets.map(text => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
  }

  function syncCheckoutLinks() {
    document.querySelectorAll('a[href*="checkout.html"]').forEach(anchor => {
      try {
        const url = new URL(anchor.href, location.href);
        if (url.origin !== location.origin) return;
        url.searchParams.set('lang', language());
        anchor.href = url.pathname + url.search + url.hash;
      } catch (_) {}
    });
  }

  function render() {
    const lang = language();
    const copy = COPY[lang];
    document.title = copy.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = copy.description;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.content = copy.title;
    if (ogDescription) ogDescription.content = copy.description;

    const kicker = document.querySelector('.hero-copy .kicker');
    const lead = document.querySelector('.hero-copy .hero-lead');
    setText(kicker, COPY.hu.kicker, COPY.en.kicker);
    setText(lead, COPY.hu.lead, COPY.en.lead);
    const scroll = document.querySelector('.scroll-cue span');
    setText(scroll, COPY.hu.enter, COPY.en.enter);

    document.querySelectorAll('.main-nav a').forEach((anchor, index) => {
      if (copy.nav[index]) anchor.textContent = copy.nav[index];
    });

    document.querySelectorAll('.hero-facts > span').forEach((fact, index) => {
      const data = copy.facts[index];
      if (!data) return;
      const number = fact.querySelector('b');
      const label = fact.querySelector('small');
      if (number) number.textContent = data[0];
      if (label) label.textContent = data[1];
    });

    const capabilitiesHeading = document.querySelector('#capabilities .section-heading h2');
    if (capabilitiesHeading) {
      const span = capabilitiesHeading.querySelector('span');
      const em = capabilitiesHeading.querySelector('em');
      if (span) span.textContent = copy.capabilitiesTitle[0];
      if (em) em.textContent = copy.capabilitiesTitle[1];
    }
    const pricingHeading = document.querySelector('#pricing .section-heading h2');
    if (pricingHeading) {
      const span = pricingHeading.querySelector('span');
      const em = pricingHeading.querySelector('em');
      if (span) span.textContent = copy.pricingTitle[0];
      if (em) em.textContent = copy.pricingTitle[1];
    }

    Object.entries(copy.plans).forEach(([planId, planCopy]) => updatePlan(planId, planCopy));
    renderDeck(copy);
    renderProof(copy);
    const footer = document.querySelector('.site-footer .footer-brand p');
    if (footer) footer.textContent = copy.footer;
    syncCheckoutLinks();
    root.dataset.fxCategoryLanguage = lang;
  }

  buildDeck();
  buildProof();
  render();

  addEventListener('formatx:languagechange', () => queueMicrotask(render));
  const observer = new MutationObserver(entries => {
    if (entries.some(entry => entry.attributeName === 'lang')) queueMicrotask(render);
  });
  observer.observe(root, { attributes: true, attributeFilter: ['lang'] });
  addEventListener('pageshow', render);
  addEventListener('pagehide', () => observer.disconnect(), { once: true });
}());
