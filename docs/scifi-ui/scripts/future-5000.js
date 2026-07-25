(function () {
  'use strict';

  if (document.documentElement.dataset.fx5kReady === 'true') return;
  document.documentElement.dataset.fx5kReady = 'true';
  document.documentElement.classList.add('fx5k-ready');
  document.documentElement.dataset.fx5kLens = 'prism';

  const COPY = {
    hu: {
      kicker: 'FORMATX IDŐKOORDINÁTA · 5000',
      title: 'Technikusi rendszer a <span>következő évezredből.</span>',
      coordinateLabel: 'Vizuális időkoordináta',
      lensLabel: 'KVANTUM-LENCSE',
      lensTitle: 'Három eltérő jövőnézet',
      lensCopy: 'A teljes vizuális energiarendszert egyetlen mozdulattal hangolhatod át.',
      prism: 'Prizma',
      chrono: 'Kronó',
      void: 'Mélyűr',
      meshLabel: 'NEURÁLIS RÁCS',
      meshTitle: 'Érintésre épülő fényháló',
      meshCopy: 'Kapcsold össze a csomópontokat. Minden aktiválás új vizuális mintát hoz létre.',
      signalLabel: 'FOTON-INTENZITÁS',
      signalTitle: 'Szabályozható energiafelület',
      signalCopy: 'A háttérfény, a rács és a holografikus panelek ereje valós időben változik.',
      logLabel: 'JÖVŐNAPLÓ',
      logTitle: 'Élő rendszerüzenetek',
      echoLabel: 'IDŐVISSZHANG',
      echoTitle: 'Pillanatlenyomat készítése',
      echoCopy: 'A gomb a jelenlegi vizuális állapotból egy helyi időbélyegzett visszhangot készít.',
      echoButton: 'IDŐVISSZHANG RÖGZÍTÉSE',
      echoEmpty: 'Még nincs rögzített idővisszhang.',
      corridorKicker: 'EREDETI FORMATX KÍSÉRLETI MODULOK',
      corridorTitle: 'Négy új <span>interakciós elv.</span>',
      corridorCopy: 'Nem egyszerű díszítés: a felület reagál, állapotot vált, emléket készít és a mozgást a hozzáférhetőséghez igazítja.',
      corridor1Title: 'Adaptív fénymező',
      corridor1Copy: 'Az egér vagy érintés helyzete finoman átrendezi a háttér energiaközéppontját.',
      corridor2Title: 'Kvantum-lencse',
      corridor2Copy: 'Három teljes szín- és energiaprofil váltható újratöltés nélkül.',
      corridor3Title: 'Neurális csillagtér',
      corridor3Copy: 'Az aktivált csomópontokból minden látogató saját fénykonstellációt készíthet.',
      corridor4Title: 'Idővisszhang',
      corridor4Copy: 'A rendszer egy helyi, személyes állapotlenyomatot készít a kiválasztott nézetből.',
      logs: [
        '5000. rendszerkapu: online\nKvantumrács: stabil\nVizuális koherencia: 99,8%',
        'Holografikus réteg újraszinkronizálva\nFotonmező: adaptív\nHozzáférhetőségi korlátok: aktívak',
        'FormatX magrendszer: készenlét\nNeurális csomópontok: válaszolnak\nIdőfolyam: helyi vizuális mód'
      ],
      echoResult: 'Visszhang #{count}\nLencse: {lens}\nIntenzitás: {intensity}%\nKoordináta: {coordinate}'
    },
    en: {
      kicker: 'FORMATX TIME COORDINATE · 5000',
      title: 'A technician system from the <span>next millennium.</span>',
      coordinateLabel: 'Visual time coordinate',
      lensLabel: 'QUANTUM LENS',
      lensTitle: 'Three different future views',
      lensCopy: 'Retune the complete visual energy system with a single action.',
      prism: 'Prism',
      chrono: 'Chrono',
      void: 'Deep space',
      meshLabel: 'NEURAL MESH',
      meshTitle: 'A touch-responsive light network',
      meshCopy: 'Connect the nodes. Every activation creates a new visual pattern.',
      signalLabel: 'PHOTON INTENSITY',
      signalTitle: 'Adjustable energy surface',
      signalCopy: 'Background light, grid and holographic panels change in real time.',
      logLabel: 'FUTURE LOG',
      logTitle: 'Live system messages',
      echoLabel: 'TIME ECHO',
      echoTitle: 'Capture a moment',
      echoCopy: 'The button creates a local timestamped echo of the current visual state.',
      echoButton: 'CAPTURE TIME ECHO',
      echoEmpty: 'No time echo has been captured yet.',
      corridorKicker: 'ORIGINAL FORMATX EXPERIMENTAL MODULES',
      corridorTitle: 'Four new <span>interaction principles.</span>',
      corridorCopy: 'More than decoration: the interface responds, changes state, captures a memory and adapts motion to accessibility preferences.',
      corridor1Title: 'Adaptive light field',
      corridor1Copy: 'Pointer or touch position gently relocates the energy centre of the background.',
      corridor2Title: 'Quantum lens',
      corridor2Copy: 'Switch between three complete colour and energy profiles without reloading.',
      corridor3Title: 'Neural star field',
      corridor3Copy: 'Every visitor can create a personal light constellation from active nodes.',
      corridor4Title: 'Time echo',
      corridor4Copy: 'The system creates a local personal state snapshot from the selected view.',
      logs: [
        '5000 system gate: online\nQuantum grid: stable\nVisual coherence: 99.8%',
        'Holographic layer resynchronised\nPhoton field: adaptive\nAccessibility limits: active',
        'FormatX core system: ready\nNeural nodes: responding\nTime stream: local visual mode'
      ],
      echoResult: 'Echo #{count}\nLens: {lens}\nIntensity: {intensity}%\nCoordinate: {coordinate}'
    }
  };

  const state = {
    lens: 'prism',
    intensity: 68,
    echoCount: 0,
    logIndex: 0,
    coordinate: '5000.000.000'
  };

  function language() {
    return document.documentElement.lang === 'en' ? 'en' : 'hu';
  }

  function text(key) {
    return COPY[language()][key];
  }

  function buildAmbient() {
    if (document.querySelector('.fx5k-ambient')) return;
    const ambient = document.createElement('div');
    ambient.className = 'fx5k-ambient';
    ambient.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 22; index += 1) {
      const dust = document.createElement('i');
      dust.className = 'fx5k-dust';
      dust.style.left = ((index * 41) % 97 + 1) + '%';
      dust.style.setProperty('--fx5k-duration', (12 + (index % 7) * 2.1) + 's');
      dust.style.setProperty('--fx5k-delay', (-index * 0.83) + 's');
      dust.style.setProperty('--fx5k-drift', ((index % 2 ? 1 : -1) * (22 + index * 2)) + 'px');
      ambient.append(dust);
    }
    document.body.prepend(ambient);
  }

  function buildCommandDeck() {
    const hero = document.getElementById('product');
    if (!hero || document.getElementById('formatx-future-5000')) return;

    const deck = document.createElement('section');
    deck.id = 'formatx-future-5000';
    deck.className = 'fx5k-command-deck';
    deck.innerHTML = [
      '<header class="fx5k-command-head">',
      '<div><p class="fx5k-kicker" data-fx5k-key="kicker"></p><h2 data-fx5k-html="title"></h2></div>',
      '<div class="fx5k-coordinate"><small data-fx5k-key="coordinateLabel"></small><strong id="fx5k-coordinate">5000.000.000</strong></div>',
      '</header>',
      '<div class="fx5k-deck-grid">',
      '<article class="fx5k-module fx5k-module-lens">',
      '<div class="fx5k-module-label"><span data-fx5k-key="lensLabel"></span><i></i></div>',
      '<h3 data-fx5k-key="lensTitle"></h3><p data-fx5k-key="lensCopy"></p>',
      '<div class="fx5k-lens-switch" role="group" aria-label="Future visual lens">',
      '<button type="button" data-fx5k-lens="prism" aria-pressed="true" data-fx5k-key="prism"></button>',
      '<button type="button" data-fx5k-lens="chrono" aria-pressed="false" data-fx5k-key="chrono"></button>',
      '<button type="button" data-fx5k-lens="void" aria-pressed="false" data-fx5k-key="void"></button>',
      '</div></article>',
      '<article class="fx5k-module fx5k-module-mesh">',
      '<div class="fx5k-module-label"><span data-fx5k-key="meshLabel"></span><i></i></div>',
      '<h3 data-fx5k-key="meshTitle"></h3><p data-fx5k-key="meshCopy"></p>',
      '<div class="fx5k-neural-mesh" role="group" aria-label="Interactive neural light mesh"></div>',
      '</article>',
      '<article class="fx5k-module fx5k-module-signal">',
      '<div class="fx5k-module-label"><span data-fx5k-key="signalLabel"></span><i></i></div>',
      '<h3 data-fx5k-key="signalTitle"></h3><p data-fx5k-key="signalCopy"></p>',
      '<input class="fx5k-signal-control" type="range" min="28" max="100" value="68" aria-label="Visual intensity">',
      '<div class="fx5k-signal-value"><span>MIN</span><strong>68%</strong><span>MAX</span></div>',
      '</article>',
      '<article class="fx5k-module fx5k-module-log">',
      '<div class="fx5k-module-label"><span data-fx5k-key="logLabel"></span><i></i></div>',
      '<h3 data-fx5k-key="logTitle"></h3><div class="fx5k-log-window" aria-live="polite"></div>',
      '</article>',
      '<article class="fx5k-module fx5k-module-echo">',
      '<div class="fx5k-module-label"><span data-fx5k-key="echoLabel"></span><i></i></div>',
      '<h3 data-fx5k-key="echoTitle"></h3><p data-fx5k-key="echoCopy"></p>',
      '<div class="fx5k-echo-output" aria-live="polite" data-fx5k-key="echoEmpty"></div>',
      '<button class="fx5k-echo-button" type="button" data-fx5k-key="echoButton"></button>',
      '</article>',
      '</div>'
    ].join('');

    hero.insertAdjacentElement('afterend', deck);

    const mesh = deck.querySelector('.fx5k-neural-mesh');
    for (let index = 0; index < 16; index += 1) {
      const node = document.createElement('button');
      node.type = 'button';
      node.className = 'fx5k-neural-node';
      node.setAttribute('aria-label', 'Neural node ' + (index + 1));
      if ([1, 6, 9, 14].includes(index)) node.classList.add('is-active');
      mesh.append(node);
    }
  }

  function buildCorridor() {
    const anchor = document.getElementById('features') || document.getElementById('project-details');
    if (!anchor || document.getElementById('formatx-innovation-corridor')) return;

    const corridor = document.createElement('section');
    corridor.id = 'formatx-innovation-corridor';
    corridor.className = 'fx5k-innovation-corridor';
    corridor.innerHTML = [
      '<header class="fx5k-corridor-head">',
      '<div><p class="fx5k-kicker" data-fx5k-key="corridorKicker"></p><h2 data-fx5k-html="corridorTitle"></h2></div>',
      '<p data-fx5k-key="corridorCopy"></p>',
      '</header>',
      '<div class="fx5k-corridor-track">',
      corridorCard('01', '◎', 'corridor1Title', 'corridor1Copy'),
      corridorCard('02', '◇', 'corridor2Title', 'corridor2Copy'),
      corridorCard('03', '✦', 'corridor3Title', 'corridor3Copy'),
      corridorCard('04', '◴', 'corridor4Title', 'corridor4Copy'),
      '</div>'
    ].join('');
    anchor.insertAdjacentElement('afterend', corridor);
  }

  function corridorCard(index, icon, titleKey, copyKey) {
    return '<article class="fx5k-corridor-card" data-index="' + index + '"><i>' + icon + '</i><h3 data-fx5k-key="' + titleKey + '"></h3><p data-fx5k-key="' + copyKey + '"></p></article>';
  }

  function applyLanguage() {
    document.querySelectorAll('[data-fx5k-key]').forEach(function (element) {
      const value = text(element.dataset.fx5kKey);
      if (typeof value === 'string') element.textContent = value;
    });
    document.querySelectorAll('[data-fx5k-html]').forEach(function (element) {
      const value = text(element.dataset.fx5kHtml);
      if (typeof value === 'string') element.innerHTML = value;
    });
    updateLog(true);
  }

  function bindInteractions() {
    document.querySelectorAll('.fx5k-lens-switch [data-fx5k-lens]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.lens = button.dataset.fx5kLens;
        document.documentElement.dataset.fx5kLens = state.lens;
        document.querySelectorAll('.fx5k-lens-switch [data-fx5k-lens]').forEach(function (candidate) {
          candidate.setAttribute('aria-pressed', String(candidate === button));
        });
      });
    });

    document.querySelectorAll('.fx5k-neural-node').forEach(function (node) {
      node.addEventListener('click', function () {
        node.classList.toggle('is-active');
      });
    });

    const range = document.querySelector('.fx5k-signal-control');
    const output = document.querySelector('.fx5k-signal-value strong');
    if (range && output) {
      range.addEventListener('input', function () {
        state.intensity = Number(range.value);
        document.documentElement.style.setProperty('--fx5k-intensity', String(state.intensity / 100));
        output.textContent = state.intensity + '%';
      });
    }

    const echoButton = document.querySelector('.fx5k-echo-button');
    const echoOutput = document.querySelector('.fx5k-echo-output');
    if (echoButton && echoOutput) {
      echoButton.addEventListener('click', function () {
        state.echoCount += 1;
        echoOutput.textContent = text('echoResult')
          .replace('{count}', String(state.echoCount).padStart(2, '0'))
          .replace('{lens}', text(state.lens))
          .replace('{intensity}', String(state.intensity))
          .replace('{coordinate}', state.coordinate);
      });
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', function (event) {
        const x = Math.round(event.clientX / window.innerWidth * 100);
        const y = Math.round(event.clientY / window.innerHeight * 100);
        document.documentElement.style.setProperty('--fx5k-pointer-x', x + '%');
        document.documentElement.style.setProperty('--fx5k-pointer-y', y + '%');
      }, { passive: true });
    }
  }

  function updateCoordinate() {
    const now = Date.now();
    const phase = String(Math.floor(now / 137) % 1000).padStart(3, '0');
    const pulse = String(Math.floor(now / 17) % 1000).padStart(3, '0');
    state.coordinate = '5000.' + phase + '.' + pulse;
    const node = document.getElementById('fx5k-coordinate');
    if (node) node.textContent = state.coordinate;
  }

  function updateLog(reset) {
    const log = document.querySelector('.fx5k-log-window');
    if (!log) return;
    if (reset) state.logIndex = 0;
    const logs = text('logs');
    log.textContent = logs[state.logIndex % logs.length];
  }

  function startTimers() {
    updateCoordinate();
    window.setInterval(updateCoordinate, 110);
    window.setInterval(function () {
      state.logIndex += 1;
      updateLog(false);
    }, 4200);
  }

  function revealCorridor() {
    const cards = document.querySelectorAll('.fx5k-corridor-card');
    if (!('IntersectionObserver' in window)) {
      cards.forEach(function (card) { card.classList.add('fx5k-visible'); });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fx5k-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    cards.forEach(function (card) { observer.observe(card); });
  }

  function initialise() {
    if (!document.body) return;
    buildAmbient();
    buildCommandDeck();
    buildCorridor();
    applyLanguage();
    bindInteractions();
    startTimers();
    revealCorridor();

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
