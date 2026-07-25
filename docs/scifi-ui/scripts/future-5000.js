(function () {
  'use strict';

  if (document.documentElement.dataset.fx5kReady === 'refined') return;
  document.documentElement.dataset.fx5kReady = 'refined';
  document.documentElement.classList.add('fx5k-ready');
  document.documentElement.dataset.fx5kLens = 'aether';

  const MODULE_ORDER = ['observe', 'integrity', 'workflow', 'recovery', 'audit', 'release'];
  const COPY = {
    hu: {
      eyebrow: 'FORMATX · RENDSZERARCHITEKTÚRA 5000',
      title: 'A jövő nem látványtrükk. <span>Hanem tiszta rendszerlogika.</span>',
      lead: 'Egy visszafogott, interaktív technikusi térkép, amely a FormatX valódi működési elveit mutatja be: felderítés, ellenőrzés, tervezés és nyomon követhető végrehajtás.',
      eraNow: 'JELEN',
      eraFuture: 'RENDSZERSZINTŰ JÖVŐ',
      mapLabel: 'MŰVELETI TOPOGRÁFIA',
      detailLabel: 'AKTÍV RENDSZERRÉTEG',
      lensLabel: 'MEGJELENÉSI PROFIL',
      lensAether: 'Éter',
      lensMonolith: 'Monolit',
      lensAurora: 'Auróra',
      sequenceTitle: 'Ellenőrzött műveleti lánc',
      sequenceCopy: 'A bemutató nem hajt végre meghajtóműveletet. Csak vizuálisan modellezi a FormatX háromlépcsős döntési folyamatát.',
      sequenceButton: 'MŰVELETI LÁNC BEMUTATÁSA',
      sequenceReady: 'KÉSZENLÉT',
      sequenceRunning: 'ELEMZÉS FOLYAMATBAN',
      sequenceComplete: 'ELLENŐRZÖTT TERV',
      step1: 'Felderítés',
      step2: 'Ellenőrzés',
      step3: 'Végrehajtási terv',
      principlesLabel: '5000-ES TERVEZÉSI ELVEK',
      principle1Title: 'Csendes intelligencia',
      principle1Copy: 'A felület nem akar mindenáron látványos lenni; csak ott reagál, ahol annak információs értéke van.',
      principle2Title: 'Művelet előtti bizonyosság',
      principle2Copy: 'A célmeghajtó, a kockázat és a végrehajtási terv külön állapotként jelenik meg.',
      principle3Title: 'Helyi vezérlés',
      principle3Copy: 'A technikusi döntés a középpontban marad, a rendszer pedig ellenőrizhető segítséget ad.',
      principle4Title: 'Nyomon követhető eredmény',
      principle4Copy: 'Minden fontos állapot visszakereshető és összevethető a kiindulási helyzettel.',
      modules: {
        observe: {
          label: 'Felderítés',
          title: 'A rendszer előbb megfigyel, csak utána javasol.',
          copy: 'Hardver-, meghajtó- és környezeti állapotok rendezett összegyűjtése egyetlen technikusi nézetbe.',
          points: ['Eszközök és kötetek azonosítása', 'Kockázati eltérések kiemelése', 'Kiindulási állapot rögzítése']
        },
        integrity: {
          label: 'Integritás',
          title: 'A bizonyítható állapot fontosabb a látványos ígéretnél.',
          copy: 'Ellenőrzőösszegek, kiadási információk és műveleti feltételek egységes ellenőrzési rétegben.',
          points: ['SHA-256 és Ed25519 ellenőrzés', 'Kiadási forrás összevetése', 'Eltérés esetén egyértelmű blokkolás']
        },
        workflow: {
          label: 'Munkafolyamat',
          title: 'A feladatok nem elszigetelt gombok, hanem összefüggő műveleti láncok.',
          copy: 'A FormatX a felderítést, tervezést, végrehajtást és ellenőrzést egy követhető folyamatba rendezi.',
          points: ['Lépésenkénti állapotkezelés', 'Megszakítható és folytatható feladatok', 'Egységes technikusi visszajelzés']
        },
        recovery: {
          label: 'Visszaállítás',
          title: 'A jó rendszer nemcsak végrehajt, hanem visszautat is tervez.',
          copy: 'Mentési pontok, előfeltételek és helyreállítási lehetőségek a kockázatos lépések előtt.',
          points: ['Mentési feltételek ellenőrzése', 'Visszaállítási útvonal tervezése', 'Kritikus lépések külön megerősítése']
        },
        audit: {
          label: 'Naplózás',
          title: 'A technikusi munka később is érthető marad.',
          copy: 'A lényeges döntések, eredmények és hibák visszakövethető műveleti történetbe kerülnek.',
          points: ['Időbélyegzett események', 'Állapotváltozások összevetése', 'Exportálható eredményjelentés']
        },
        release: {
          label: 'Kiadás',
          title: 'A frissítés csak ellenőrzött forrásból válik elérhetővé.',
          copy: 'Verzió, csomag, ellenőrzőösszeg és kiadási állapot egyetlen ellenőrizhető csatornában.',
          points: ['Verzióazonosítás', 'Csomagintegritás', 'Visszagörgethető kiadási állapot']
        }
      }
    },
    en: {
      eyebrow: 'FORMATX · SYSTEM ARCHITECTURE 5000',
      title: 'The future is not a visual trick. <span>It is clear system logic.</span>',
      lead: 'A restrained interactive technician map showing the real operating principles of FormatX: discovery, verification, planning and traceable execution.',
      eraNow: 'PRESENT',
      eraFuture: 'SYSTEM-LEVEL FUTURE',
      mapLabel: 'OPERATIONAL TOPOGRAPHY',
      detailLabel: 'ACTIVE SYSTEM LAYER',
      lensLabel: 'VISUAL PROFILE',
      lensAether: 'Aether',
      lensMonolith: 'Monolith',
      lensAurora: 'Aurora',
      sequenceTitle: 'Verified operation chain',
      sequenceCopy: 'The demonstration performs no drive operation. It only models the three-stage FormatX decision process visually.',
      sequenceButton: 'DEMONSTRATE OPERATION CHAIN',
      sequenceReady: 'READY',
      sequenceRunning: 'ANALYSIS IN PROGRESS',
      sequenceComplete: 'VERIFIED PLAN',
      step1: 'Discovery',
      step2: 'Verification',
      step3: 'Execution plan',
      principlesLabel: 'YEAR 5000 DESIGN PRINCIPLES',
      principle1Title: 'Quiet intelligence',
      principle1Copy: 'The interface responds only where interaction has information value.',
      principle2Title: 'Certainty before action',
      principle2Copy: 'Target, risk and execution plan are presented as separate states.',
      principle3Title: 'Local control',
      principle3Copy: 'The technician remains in control while the system provides verifiable assistance.',
      principle4Title: 'Traceable outcome',
      principle4Copy: 'Every important state can be reviewed and compared with the starting condition.',
      modules: {
        observe: { label: 'Discovery', title: 'The system observes before it recommends.', copy: 'Hardware, drive and environment states collected into one structured technician view.', points: ['Identify devices and volumes', 'Highlight risk deviations', 'Record the starting state'] },
        integrity: { label: 'Integrity', title: 'Provable state matters more than impressive promises.', copy: 'Checksums, release information and operation prerequisites in one verification layer.', points: ['SHA-256 and Ed25519 verification', 'Release source comparison', 'Clear blocking on mismatch'] },
        workflow: { label: 'Workflow', title: 'Tasks are connected operation chains, not isolated buttons.', copy: 'FormatX combines discovery, planning, execution and verification into one traceable flow.', points: ['Step-based state management', 'Cancellable and resumable tasks', 'Consistent technician feedback'] },
        recovery: { label: 'Recovery', title: 'A good system plans the way back before it acts.', copy: 'Restore points, prerequisites and recovery options before high-risk steps.', points: ['Verify backup conditions', 'Plan a recovery route', 'Separate confirmation for critical steps'] },
        audit: { label: 'Audit', title: 'Technician work remains understandable later.', copy: 'Important decisions, outcomes and errors become a traceable operation history.', points: ['Timestamped events', 'State-change comparison', 'Exportable result report'] },
        release: { label: 'Release', title: 'Updates become available only through verified sources.', copy: 'Version, package, checksum and release status in one verifiable channel.', points: ['Version identification', 'Package integrity', 'Reversible release state'] }
      }
    }
  };

  const state = { activeModule: 'integrity', lens: 'aether', sequenceRunning: false };

  function language() {
    return document.documentElement.lang === 'en' ? 'en' : 'hu';
  }

  function copy() {
    return COPY[language()];
  }

  function cleanLegacy() {
    ['formatx-future-5000', 'formatx-innovation-corridor'].forEach(function (id) {
      const node = document.getElementById(id);
      if (node) node.remove();
    });
    document.querySelectorAll('.fx5k-ambient').forEach(function (node) { node.remove(); });
  }

  function buildAmbient() {
    const ambient = document.createElement('div');
    ambient.className = 'fx5k-ambient';
    ambient.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 10; index += 1) {
      const line = document.createElement('i');
      line.style.setProperty('--fx5k-line-x', ((index + 1) * 9) + '%');
      line.style.setProperty('--fx5k-line-delay', (-index * 1.7) + 's');
      ambient.append(line);
    }
    document.body.prepend(ambient);
  }

  function moduleButton(id, index) {
    return '<button class="fx5k-map-node fx5k-node-' + id + '" type="button" data-fx5k-module="' + id + '" aria-pressed="false"><small>0' + index + '</small><strong data-fx5k-module-label="' + id + '"></strong></button>';
  }

  function buildSystem() {
    const hero = document.getElementById('product');
    if (!hero) return;

    const section = document.createElement('section');
    section.id = 'formatx-future-5000';
    section.className = 'fx5k-system';
    section.innerHTML = [
      '<header class="fx5k-system-head">',
      '<div><p class="fx5k-eyebrow" data-fx5k-key="eyebrow"></p><h2 data-fx5k-html="title"></h2><p class="fx5k-lead" data-fx5k-key="lead"></p></div>',
      '<div class="fx5k-era"><span data-fx5k-key="eraNow"></span><i></i><strong>5000</strong><small data-fx5k-key="eraFuture"></small></div>',
      '</header>',
      '<div class="fx5k-stage">',
      '<article class="fx5k-map-panel"><div class="fx5k-panel-label" data-fx5k-key="mapLabel"></div>',
      '<div class="fx5k-map">',
      '<svg class="fx5k-map-links" viewBox="0 0 600 420" aria-hidden="true"><g><path d="M300 210 L300 52"/><path d="M300 210 L92 134"/><path d="M300 210 L508 134"/><path d="M300 210 L120 322"/><path d="M300 210 L480 322"/><path d="M300 210 L300 370"/></g></svg>',
      '<div class="fx5k-core" aria-hidden="true"><span>FX</span><small>CORE</small></div>',
      moduleButton('observe', 1), moduleButton('integrity', 2), moduleButton('workflow', 3), moduleButton('recovery', 4), moduleButton('audit', 5), moduleButton('release', 6),
      '</div></article>',
      '<aside class="fx5k-detail-panel">',
      '<div class="fx5k-panel-label" data-fx5k-key="detailLabel"></div>',
      '<div class="fx5k-detail-status"><i></i><span id="fx5k-active-label"></span></div>',
      '<h3 id="fx5k-active-title"></h3><p id="fx5k-active-copy"></p><ul id="fx5k-active-points"></ul>',
      '<div class="fx5k-lens"><small data-fx5k-key="lensLabel"></small><div role="group" aria-label="Visual profile"><button type="button" data-fx5k-lens="aether" aria-pressed="true" data-fx5k-key="lensAether"></button><button type="button" data-fx5k-lens="monolith" aria-pressed="false" data-fx5k-key="lensMonolith"></button><button type="button" data-fx5k-lens="aurora" aria-pressed="false" data-fx5k-key="lensAurora"></button></div></div>',
      '<div class="fx5k-sequence"><div><strong data-fx5k-key="sequenceTitle"></strong><p data-fx5k-key="sequenceCopy"></p></div><div class="fx5k-sequence-steps"><span data-step="1"><i></i><b data-fx5k-key="step1"></b></span><span data-step="2"><i></i><b data-fx5k-key="step2"></b></span><span data-step="3"><i></i><b data-fx5k-key="step3"></b></span></div><button id="fx5k-sequence-button" type="button" data-fx5k-key="sequenceButton"></button><output id="fx5k-sequence-status" data-fx5k-key="sequenceReady"></output></div>',
      '</aside></div>',
      '<div class="fx5k-principles"><div class="fx5k-principles-title" data-fx5k-key="principlesLabel"></div>',
      '<article><span>01</span><strong data-fx5k-key="principle1Title"></strong><p data-fx5k-key="principle1Copy"></p></article>',
      '<article><span>02</span><strong data-fx5k-key="principle2Title"></strong><p data-fx5k-key="principle2Copy"></p></article>',
      '<article><span>03</span><strong data-fx5k-key="principle3Title"></strong><p data-fx5k-key="principle3Copy"></p></article>',
      '<article><span>04</span><strong data-fx5k-key="principle4Title"></strong><p data-fx5k-key="principle4Copy"></p></article>',
      '</div></section>'
    ].join('');
    hero.insertAdjacentElement('afterend', section);
  }

  function applyLanguage() {
    const current = copy();
    document.querySelectorAll('[data-fx5k-key]').forEach(function (element) {
      const value = current[element.dataset.fx5kKey];
      if (typeof value === 'string') element.textContent = value;
    });
    document.querySelectorAll('[data-fx5k-html]').forEach(function (element) {
      const value = current[element.dataset.fx5kHtml];
      if (typeof value === 'string') element.innerHTML = value;
    });
    document.querySelectorAll('[data-fx5k-module-label]').forEach(function (element) {
      const module = current.modules[element.dataset.fx5kModuleLabel];
      if (module) element.textContent = module.label;
    });
    renderModule();
  }

  function renderModule() {
    const module = copy().modules[state.activeModule];
    if (!module) return;
    const label = document.getElementById('fx5k-active-label');
    const title = document.getElementById('fx5k-active-title');
    const body = document.getElementById('fx5k-active-copy');
    const list = document.getElementById('fx5k-active-points');
    if (label) label.textContent = module.label;
    if (title) title.textContent = module.title;
    if (body) body.textContent = module.copy;
    if (list) list.innerHTML = module.points.map(function (point) { return '<li>' + point + '</li>'; }).join('');
    document.querySelectorAll('[data-fx5k-module]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.fx5kModule === state.activeModule));
    });
  }

  function runSequence() {
    if (state.sequenceRunning) return;
    state.sequenceRunning = true;
    const button = document.getElementById('fx5k-sequence-button');
    const status = document.getElementById('fx5k-sequence-status');
    const steps = Array.from(document.querySelectorAll('.fx5k-sequence-steps [data-step]'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    steps.forEach(function (step) { step.classList.remove('is-active', 'is-complete'); });
    if (button) button.disabled = true;
    if (status) status.textContent = copy().sequenceRunning;

    function finish() {
      steps.forEach(function (step) { step.classList.remove('is-active'); step.classList.add('is-complete'); });
      if (status) status.textContent = copy().sequenceComplete;
      if (button) button.disabled = false;
      state.sequenceRunning = false;
    }

    if (reduced) {
      finish();
      return;
    }

    steps.forEach(function (step, index) {
      window.setTimeout(function () {
        steps.forEach(function (item, itemIndex) {
          item.classList.toggle('is-active', itemIndex === index);
          if (itemIndex < index) item.classList.add('is-complete');
        });
        if (index === steps.length - 1) window.setTimeout(finish, 520);
      }, index * 620);
    });
  }

  function bindInteractions() {
    document.querySelectorAll('[data-fx5k-module]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.activeModule = button.dataset.fx5kModule;
        renderModule();
      });
    });

    document.querySelectorAll('[data-fx5k-lens]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.lens = button.dataset.fx5kLens;
        document.documentElement.dataset.fx5kLens = state.lens;
        document.querySelectorAll('[data-fx5k-lens]').forEach(function (candidate) {
          candidate.setAttribute('aria-pressed', String(candidate === button));
        });
      });
    });

    const sequenceButton = document.getElementById('fx5k-sequence-button');
    if (sequenceButton) sequenceButton.addEventListener('click', runSequence);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', function (event) {
        document.documentElement.style.setProperty('--fx5k-pointer-x', Math.round(event.clientX / window.innerWidth * 100) + '%');
        document.documentElement.style.setProperty('--fx5k-pointer-y', Math.round(event.clientY / window.innerHeight * 100) + '%');
      }, { passive: true });
    }
  }

  function initialise() {
    if (!document.body) return;
    cleanLegacy();
    buildAmbient();
    buildSystem();
    applyLanguage();
    bindInteractions();
    window.addEventListener('formatx:languagechange', applyLanguage);
    new MutationObserver(function (records) {
      if (records.some(function (record) { return record.attributeName === 'lang'; })) applyLanguage();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
