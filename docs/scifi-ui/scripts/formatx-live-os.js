(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxLiveOs === 'v1') return;
  root.dataset.fxLiveOs = 'v1';

  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js';
  const PRODUCT_ROOT = './assets/images/product-showcase/';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const state = {
    section: null,
    index: [],
    language: root.lang === 'en' ? 'en' : 'hu',
    three: null,
    demoTimer: 0,
    scanTimer: 0,
    inputLatency: null,
    lastPointerAt: 0
  };

  const COPY = {
    hu: {
      eyebrow: '00.5 — ÉLŐ OPERÁCIÓS RÉTEG',
      title: 'A weboldal, amelyet nemcsak nézel — használsz.',
      lead: 'A FormatX Live OS helyben futó parancsrétege természetes nyelvű navigációt, valós böngésződiagnosztikát, funkcionális 3D-s tárolótérképet és ellenőrizhető termékbizonyítékokat kapcsol össze.',
      privacy: 'Helyi működés · nincs parancsfeltöltés · nincs kitalált hardveradat',
      commandLabel: 'Mit szeretnél megvizsgálni vagy megnyitni?',
      commandPlaceholder: 'Például: „mutasd a diagnosztikát”, „indíts 3D vizsgálatot”, „keresd meg az USB készítőt”',
      run: 'Futtatás',
      scan: 'Élő vizsgálat',
      start3d: '3D rendszerkép indítása',
      stop3d: '3D leállítása',
      demo: 'Interaktív bemutató',
      proof: 'Bizonyítékközpont',
      metrics: 'Élő munkamenet',
      results: 'Rendszerválasz',
      topology: 'Funkcionális 3D tárolótérkép',
      topologyLead: 'A meghajtók, partíciók, adatfolyamok és ellenőrzési gyűrűk nem díszek. Kattints egy elemre, húzd a nézetet, vagy indíts vizsgálatot.',
      ready: 'A rendszer készen áll. Írj be egy parancsot, vagy válassz egy gyorsműveletet.',
      noResult: 'Nem találtam pontos egyezést. Próbáld: diagnosztika, USB, biztonság, árak, letöltés, 3D vagy tesztek.',
      searchTitle: 'Találatok',
      open: 'Megnyitás',
      diagnosticsDone: 'A helyi böngésződiagnosztika elkészült. Ezek a jelenlegi munkamenet valós adatai.',
      threeIdle: 'A 3D rendszerkép csak kérésre töltődik be.',
      threeLoading: 'A 3D motor betöltése folyamatban…',
      threeReady: 'A funkcionális 3D térkép aktív. Kattints a meghajtókra vagy indíts ellenőrzést.',
      threeError: 'A WebGL 3D nézet ezen az eszközön nem indítható. A diagnosztika és a parancsréteg továbbra is működik.',
      reviewPending: 'Független értékelés: még nincs publikálva — nem helyettesítjük kitalált idézettel.',
      proofItems: [
        ['LIGHTHOUSE KAPU', 'Automatikus minimum: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.'],
        ['MOBIL ÉS MOZGÁS', 'Külön mobil-, csökkentett mozgás- és adaptív teljesítményellenőrzések futnak.'],
        ['KIADÁSI INTEGRITÁS', 'A publikus kiadási lánc és a letöltési hivatkozások automatizált szerződésekkel ellenőrzöttek.'],
        ['VALÓDI TERMÉKKÉPEK', 'A bemutató a működő Linux / Bazzite kiadás képernyőit használja, nem koncepciórenderelést.']
      ],
      suggestions: ['Diagnosztika', '3D meghajtók', 'USB készítő', 'Biztonság', 'Tesztek', 'Interaktív demo'],
      demoSteps: [
        ['FELMÉRÉS', 'A rendszer feltérképezi a böngészőt, a kijelzőt, a hálózatot és a grafikus képességeket.', 'diagnostics.svg'],
        ['TERVEZÉS', 'A 3D tárolótérkép megmutatja a célmeghajtókat, partíciókat és biztonsági határokat.', 'control-center.svg'],
        ['VÉGREHAJTÁS', 'A termékfolyamatok csak értelmezhető állapot és megerősítés után lépnek tovább.', 'usb-creator.svg'],
        ['ELLENŐRZÉS', 'A napló, a diagnosztika és a kiadási kapuk dokumentálják az eredményt.', 'live-system-monitor.svg']
      ],
      statusLabels: {
        fps: 'Kijelzőritmus',
        frame: 'Képkocka-idő',
        latency: 'Input → kép',
        webgl: 'WebGL',
        cores: 'Logikai mag',
        memory: 'Eszközmemória',
        network: 'Hálózat',
        viewport: 'Nézet'
      },
      launcher: 'FormatX parancs',
      close: 'Bezárás',
      selected: 'Kiválasztott elem',
      smart: 'SMART állapot',
      partitions: 'Partíciók',
      safety: 'Ellenőrzés',
      verified: 'ellenőrzött',
      warning: 'figyelmeztetés',
      unknown: 'nem érhető el'
    },
    en: {
      eyebrow: '00.5 — LIVE OPERATING LAYER',
      title: 'A website you do not only watch — you operate.',
      lead: 'FormatX Live OS combines local natural-language navigation, real browser diagnostics, a functional 3D storage map and verifiable product evidence.',
      privacy: 'Local execution · no command upload · no invented hardware data',
      commandLabel: 'What would you like to inspect or open?',
      commandPlaceholder: 'For example: “show diagnostics”, “start 3D inspection”, “find the USB creator”',
      run: 'Run',
      scan: 'Live scan',
      start3d: 'Start 3D system map',
      stop3d: 'Stop 3D',
      demo: 'Interactive demo',
      proof: 'Evidence centre',
      metrics: 'Live session',
      results: 'System response',
      topology: 'Functional 3D storage map',
      topologyLead: 'Drives, partitions, data flows and verification rings are functional. Select an element, drag the view or start a scan.',
      ready: 'The system is ready. Enter a command or select a quick action.',
      noResult: 'No exact match. Try diagnostics, USB, security, pricing, download, 3D or tests.',
      searchTitle: 'Results',
      open: 'Open',
      diagnosticsDone: 'Local browser diagnostics completed. These are real values from the current session.',
      threeIdle: 'The 3D system map loads only on demand.',
      threeLoading: 'Loading the 3D engine…',
      threeReady: 'The functional 3D map is active. Select a drive or start verification.',
      threeError: 'The WebGL view cannot start on this device. Diagnostics and commands remain available.',
      reviewPending: 'Independent review: not published yet — no fabricated quote is used as a substitute.',
      proofItems: [
        ['LIGHTHOUSE GATE', 'Automated minimums: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95 and SEO ≥ 90.'],
        ['MOBILE AND MOTION', 'Dedicated mobile, reduced-motion and adaptive performance checks run in CI.'],
        ['RELEASE INTEGRITY', 'The public release chain and download references are validated by automated contracts.'],
        ['REAL PRODUCT SCREENS', 'The showcase uses the working Linux / Bazzite edition, not concept renders.']
      ],
      suggestions: ['Diagnostics', '3D drives', 'USB creator', 'Security', 'Tests', 'Interactive demo'],
      demoSteps: [
        ['ASSESS', 'The system maps browser, display, network and graphics capabilities.', 'diagnostics.svg'],
        ['PLAN', 'The 3D storage map exposes targets, partitions and safety boundaries.', 'control-center.svg'],
        ['EXECUTE', 'Product flows continue only after a readable state and explicit confirmation.', 'usb-creator.svg'],
        ['VERIFY', 'Logs, diagnostics and release gates document the result.', 'live-system-monitor.svg']
      ],
      statusLabels: {
        fps: 'Display cadence',
        frame: 'Frame time',
        latency: 'Input → frame',
        webgl: 'WebGL',
        cores: 'Logical cores',
        memory: 'Device memory',
        network: 'Network',
        viewport: 'Viewport'
      },
      launcher: 'FormatX command',
      close: 'Close',
      selected: 'Selected object',
      smart: 'SMART state',
      partitions: 'Partitions',
      safety: 'Verification',
      verified: 'verified',
      warning: 'warning',
      unknown: 'unavailable'
    }
  };

  const COMMANDS = [
    { id: 'diagnostics', words: ['diagnosztika', 'vizsgálat', 'hardver', 'teljesítmény', 'diagnostics', 'hardware', 'performance'], action: () => runDiagnostics(true) },
    { id: 'three', words: ['3d', 'meghajtó', 'partíció', 'smart', 'drive', 'partition', 'storage'], action: () => startThree(true) },
    { id: 'usb', words: ['usb', 'iso', 'boot', 'indítható'], selector: '#product-showcase', card: 4 },
    { id: 'monitor', words: ['rendszerfelügyelet', 'telemetria', 'monitor', 'telemetry'], selector: '#product-showcase', card: 1 },
    { id: 'security', words: ['biztonság', 'védelem', 'security', 'safety'], selectors: ['#security', '[data-organ="immune"]'] },
    { id: 'pricing', words: ['ár', 'árak', 'csomag', 'pricing', 'price', 'plans'], selectors: ['#pricing', '[data-organ="heart"]'] },
    { id: 'download', words: ['letöltés', 'kiadás', 'download', 'release'], selectors: ['#download', '#cta', '[data-organ="beacon"]'] },
    { id: 'tests', words: ['teszt', 'tesztek', 'bizonyíték', 'lighthouse', 'benchmark', 'test', 'proof', 'evidence'], action: () => showProof() },
    { id: 'demo', words: ['demo', 'bemutató', 'tour', 'túra'], action: () => startDemo() },
    { id: 'search', words: ['keres', 'talál', 'search', 'find'], action: query => searchContent(query) }
  ];

  function copy() {
    state.language = root.lang === 'en' ? 'en' : 'hu';
    return COPY[state.language];
  }

  function normalize(value) {
    return String(value || '')
      .toLocaleLowerCase(state.language === 'hu' ? 'hu-HU' : 'en-US')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function targetCapabilities() {
    return document.getElementById('product-showcase')
      || document.querySelector('section#capabilities, section[data-organ="organs"]');
  }

  function makeSection() {
    if (state.section && state.section.isConnected) return state.section;
    const anchor = targetCapabilities();
    if (!anchor) return null;

    const section = document.createElement('section');
    section.id = 'live-operating-system';
    section.className = 'fx-live-os';
    section.dataset.fxLiveOsBlock = 'true';
    section.setAttribute('aria-labelledby', 'fx-live-os-title');
    section.innerHTML = [
      '<header class="fx-live-os__header">',
      '  <div><p class="section-index" data-fx-live-eyebrow></p><h2 id="fx-live-os-title" data-fx-live-title></h2><p data-fx-live-lead></p></div>',
      '  <span class="fx-live-os__privacy" data-fx-live-privacy></span>',
      '</header>',
      '<div class="fx-live-os__command">',
      '  <label for="fx-live-command" data-fx-command-label></label>',
      '  <div><input id="fx-live-command" type="search" autocomplete="off" spellcheck="false"><button type="button" data-fx-command-run></button></div>',
      '  <div class="fx-live-os__suggestions" data-fx-suggestions></div>',
      '</div>',
      '<div class="fx-live-os__workspace">',
      '  <article class="fx-live-os__panel fx-live-os__session"><div class="fx-live-os__panel-head"><h3 data-fx-metrics-title></h3><button type="button" data-fx-scan></button></div><div class="fx-live-os__metrics" data-fx-metrics></div></article>',
      '  <article class="fx-live-os__panel fx-live-os__topology"><div class="fx-live-os__panel-head"><div><h3 data-fx-topology-title></h3><p data-fx-topology-lead></p></div><button type="button" data-fx-three></button></div><div class="fx-live-os__stage" data-fx-stage><canvas data-fx-three-canvas aria-label="FormatX functional 3D storage map"></canvas><div class="fx-live-os__stage-idle" data-fx-three-state></div></div><div class="fx-live-os__object" data-fx-object></div></article>',
      '  <article class="fx-live-os__panel fx-live-os__response"><div class="fx-live-os__panel-head"><h3 data-fx-results-title></h3><button type="button" data-fx-demo></button></div><div class="fx-live-os__output" data-fx-output aria-live="polite"></div><div class="fx-live-os__demo" data-fx-demo-panel hidden><img data-fx-demo-image width="800" height="418" alt=""><div><small data-fx-demo-step></small><strong data-fx-demo-title></strong><p data-fx-demo-copy></p><span data-fx-demo-progress></span></div></div></article>',
      '</div>',
      '<aside class="fx-live-os__proof" data-fx-proof-panel hidden><div class="fx-live-os__panel-head"><h3 data-fx-proof-title></h3><a href="https://github.com/hutoczky/FormatX/actions" target="_blank" rel="noopener">GitHub Actions ↗</a></div><div data-fx-proof-grid></div><p data-fx-review-state></p></aside>'
    ].join('');

    anchor.insertAdjacentElement('afterend', section);
    state.section = section;
    wire(section);
    renderLanguage();
    runDiagnostics(false);
    observeVisibility();
    root.dataset.fxLiveOsState = 'ready';
    dispatchEvent(new CustomEvent('formatx:liveosready'));
    return section;
  }

  function metricCard(key, value, hint) {
    const labels = copy().statusLabels;
    const article = document.createElement('article');
    article.dataset.metric = key;
    article.innerHTML = '<small></small><strong></strong><span></span>';
    article.querySelector('small').textContent = labels[key] || key;
    article.querySelector('strong').textContent = value;
    article.querySelector('span').textContent = hint || '';
    return article;
  }

  async function measureFrames(sampleCount = 48) {
    return new Promise(resolve => {
      const times = [];
      let previous = performance.now();
      function frame(now) {
        times.push(now - previous);
        previous = now;
        if (times.length < sampleCount) requestAnimationFrame(frame);
        else {
          const usable = times.slice(4).sort((a, b) => a - b);
          const median = usable[Math.floor(usable.length / 2)] || 16.7;
          const p95 = usable[Math.floor(usable.length * 0.95)] || median;
          resolve({
            fps: Math.max(1, Math.round(1000 / median)),
            median,
            p95
          });
        }
      }
      requestAnimationFrame(frame);
    });
  }

  function webglInfo() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { powerPreference: 'high-performance' });
    if (!gl) return { label: 'WebGL 1 / fallback', detail: '' };
    const extension = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : 'WebGL 2';
    return { label: 'WebGL 2', detail: String(renderer).slice(0, 72) };
  }

  async function runDiagnostics(announce) {
    const section = makeSection();
    if (!section) return;
    const metrics = section.querySelector('[data-fx-metrics]');
    metrics.setAttribute('aria-busy', 'true');
    const frames = await measureFrames();
    const gl = webglInfo();
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const memory = navigator.deviceMemory ? navigator.deviceMemory + ' GB+' : copy().unknown;
    const network = connection
      ? [connection.effectiveType || 'online', connection.rtt ? connection.rtt + ' ms' : '', connection.downlink ? connection.downlink + ' Mb/s' : ''].filter(Boolean).join(' · ')
      : (navigator.onLine ? 'online' : 'offline');
    const latency = Number.isFinite(state.inputLatency) ? Math.round(state.inputLatency) + ' ms' : '—';
    const viewport = innerWidth + '×' + innerHeight + ' @' + Math.min(devicePixelRatio || 1, 4).toFixed(2) + 'x';

    metrics.replaceChildren(
      metricCard('fps', frames.fps + ' Hz', 'median ' + frames.median.toFixed(1) + ' ms'),
      metricCard('frame', frames.p95.toFixed(1) + ' ms', 'p95'),
      metricCard('latency', latency, 'current session'),
      metricCard('webgl', gl.label, gl.detail),
      metricCard('cores', String(navigator.hardwareConcurrency || copy().unknown), 'navigator.hardwareConcurrency'),
      metricCard('memory', memory, 'navigator.deviceMemory'),
      metricCard('network', network, 'Network Information API'),
      metricCard('viewport', viewport, screen.width + '×' + screen.height)
    );
    metrics.removeAttribute('aria-busy');
    if (announce) output(copy().diagnosticsDone, 'success');
  }

  function buildSearchIndex() {
    const nodes = Array.from(document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main a, main button'))
      .filter(node => !node.closest('.fx-live-os') && node.offsetParent !== null);
    state.index = nodes.map(node => ({
      node,
      text: (node.textContent || '').trim().replace(/\s+/g, ' '),
      normalized: normalize(node.textContent)
    })).filter(item => item.normalized.length > 2);
  }

  function searchContent(query) {
    if (!state.index.length) buildSearchIndex();
    const terms = normalize(query).split(' ').filter(term => term.length > 2 && !['keres', 'keresd', 'search', 'find', 'mutasd', 'show'].includes(term));
    if (!terms.length) {
      output(copy().noResult, 'warning');
      return;
    }
    const matches = state.index
      .map(item => ({ ...item, score: terms.reduce((score, term) => score + (item.normalized.includes(term) ? 2 : 0), 0) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.text.length - b.text.length)
      .slice(0, 6);

    if (!matches.length) {
      output(copy().noResult, 'warning');
      return;
    }
    const wrapper = document.createElement('div');
    wrapper.className = 'fx-live-os__results';
    const heading = document.createElement('strong');
    heading.textContent = copy().searchTitle;
    wrapper.appendChild(heading);
    matches.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.text.slice(0, 120);
      button.addEventListener('click', () => {
        item.node.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
        item.node.classList.add('fx-live-os__target');
        setTimeout(() => item.node.classList.remove('fx-live-os__target'), 1600);
      });
      wrapper.appendChild(button);
    });
    output(wrapper, 'search');
  }

  function findTarget(command) {
    if (command.selector) return document.querySelector(command.selector);
    if (command.selectors) {
      for (const selector of command.selectors) {
        const target = document.querySelector(selector);
        if (target) return target;
      }
    }
    return null;
  }

  function execute(raw) {
    const query = normalize(raw);
    if (!query) return;
    const command = COMMANDS
      .map(item => ({ item, score: item.words.reduce((score, word) => score + (query.includes(normalize(word)) ? normalize(word).length : 0), 0) }))
      .sort((a, b) => b.score - a.score)[0];

    if (!command || command.score === 0) {
      searchContent(raw);
      return;
    }

    const item = command.item;
    if (item.action) {
      item.action(raw);
      return;
    }
    const target = findTarget(item);
    if (!target) {
      searchContent(raw);
      return;
    }
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    if (Number.isInteger(item.card)) {
      const buttons = target.querySelectorAll('[data-showcase-index]');
      const button = buttons[item.card];
      if (button) setTimeout(() => button.click(), reducedMotion.matches ? 0 : 450);
    }
    output((state.language === 'hu' ? 'Megnyitva: ' : 'Opened: ') + item.id, 'success');
  }

  function output(content, type) {
    const section = makeSection();
    if (!section) return;
    const target = section.querySelector('[data-fx-output]');
    target.className = 'fx-live-os__output fx-live-os__output--' + (type || 'info');
    target.replaceChildren();
    if (content instanceof Node) target.appendChild(content);
    else target.textContent = String(content);
  }

  function showProof() {
    const section = makeSection();
    if (!section) return;
    const panel = section.querySelector('[data-fx-proof-panel]');
    panel.hidden = false;
    panel.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
    output(state.language === 'hu' ? 'A bizonyítékközpont megnyílt. Csak ellenőrizhető állításokat mutat.' : 'Evidence centre opened. Only verifiable claims are shown.', 'success');
  }

  function renderProof() {
    const section = state.section;
    if (!section) return;
    const c = copy();
    section.querySelector('[data-fx-proof-title]').textContent = c.proof;
    section.querySelector('[data-fx-review-state]').textContent = c.reviewPending;
    const grid = section.querySelector('[data-fx-proof-grid]');
    grid.replaceChildren(...c.proofItems.map((item, index) => {
      const article = document.createElement('article');
      article.innerHTML = '<span>' + String(index + 1).padStart(2, '0') + '</span><div><strong></strong><p></p></div>';
      article.querySelector('strong').textContent = item[0];
      article.querySelector('p').textContent = item[1];
      return article;
    }));
  }

  function renderLanguage() {
    const section = state.section;
    if (!section) return;
    const c = copy();
    section.querySelector('[data-fx-live-eyebrow]').textContent = c.eyebrow;
    section.querySelector('[data-fx-live-title]').textContent = c.title;
    section.querySelector('[data-fx-live-lead]').textContent = c.lead;
    section.querySelector('[data-fx-live-privacy]').textContent = c.privacy;
    section.querySelector('[data-fx-command-label]').textContent = c.commandLabel;
    const input = section.querySelector('#fx-live-command');
    input.placeholder = c.commandPlaceholder;
    section.querySelector('[data-fx-command-run]').textContent = c.run;
    section.querySelector('[data-fx-scan]').textContent = c.scan;
    section.querySelector('[data-fx-three]').textContent = state.three ? c.stop3d : c.start3d;
    section.querySelector('[data-fx-demo]').textContent = c.demo;
    section.querySelector('[data-fx-metrics-title]').textContent = c.metrics;
    section.querySelector('[data-fx-results-title]').textContent = c.results;
    section.querySelector('[data-fx-topology-title]').textContent = c.topology;
    section.querySelector('[data-fx-topology-lead]').textContent = c.topologyLead;
    if (!section.querySelector('[data-fx-output]').textContent.trim()) output(c.ready, 'info');
    if (!state.three) section.querySelector('[data-fx-three-state]').textContent = c.threeIdle;
    const suggestions = section.querySelector('[data-fx-suggestions]');
    suggestions.replaceChildren(...c.suggestions.map(label => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', () => {
        input.value = label;
        execute(label);
      });
      return button;
    }));
    renderProof();
    const launcher = document.querySelector('[data-fx-live-os-launcher]');
    if (launcher) {
      launcher.setAttribute('aria-label', c.launcher);
      launcher.title = c.launcher + ' · Ctrl/⌘ K';
    }
  }

  function wire(section) {
    const input = section.querySelector('#fx-live-command');
    section.querySelector('[data-fx-command-run]').addEventListener('click', () => execute(input.value));
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') execute(input.value);
    });
    section.querySelector('[data-fx-scan]').addEventListener('click', () => {
      runDiagnostics(true);
      pulseThree();
    });
    section.querySelector('[data-fx-three]').addEventListener('click', () => {
      if (state.three) stopThree();
      else startThree(true);
    });
    section.querySelector('[data-fx-demo]').addEventListener('click', startDemo);
    addEventListener('pointerdown', () => {
      state.lastPointerAt = performance.now();
      requestAnimationFrame(() => { state.inputLatency = performance.now() - state.lastPointerAt; });
    }, { passive: true });
  }

  async function startThree(announce) {
    const section = makeSection();
    if (!section) return;
    if (state.three) {
      state.three.active = true;
      state.three.visible = true;
      return;
    }
    const stage = section.querySelector('[data-fx-stage]');
    const status = section.querySelector('[data-fx-three-state]');
    status.textContent = copy().threeLoading;
    stage.dataset.state = 'loading';

    try {
      const THREE = await import(THREE_URL);
      const canvas = section.querySelector('[data-fx-three-canvas]');
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 3.5, 9.5);
      const group = new THREE.Group();
      scene.add(group);
      scene.add(new THREE.AmbientLight(0x6ddfff, 1.25));
      const key = new THREE.PointLight(0x28f3ff, 18, 30);
      key.position.set(3, 6, 5);
      scene.add(key);
      const magenta = new THREE.PointLight(0xff42c8, 10, 24);
      magenta.position.set(-5, 1, 2);
      scene.add(magenta);

      const drives = [];
      const driveData = [
        { name: 'NVMe / SYSTEM', smart: 'verified', partitions: 3, x: -2.7, color: 0x29e6ff },
        { name: 'SSD / WORKSPACE', smart: 'verified', partitions: 4, x: 0, color: 0x62ff91 },
        { name: 'USB / TARGET', smart: 'warning', partitions: 2, x: 2.7, color: 0xffb548 }
      ];

      driveData.forEach((data, driveIndex) => {
        const drive = new THREE.Group();
        drive.position.x = data.x;
        const shell = new THREE.Mesh(
          new THREE.BoxGeometry(2.05, 0.55, 3.2),
          new THREE.MeshStandardMaterial({ color: 0x081624, metalness: 0.72, roughness: 0.27, emissive: data.color, emissiveIntensity: 0.12 })
        );
        shell.userData = { ...data, type: 'drive', driveIndex };
        drive.add(shell);
        const edge = new THREE.LineSegments(
          new THREE.EdgesGeometry(shell.geometry),
          new THREE.LineBasicMaterial({ color: data.color, transparent: true, opacity: 0.9 })
        );
        drive.add(edge);

        const totalWidth = 1.8;
        const gap = 0.04;
        const width = (totalWidth - gap * (data.partitions - 1)) / data.partitions;
        for (let i = 0; i < data.partitions; i += 1) {
          const partition = new THREE.Mesh(
            new THREE.BoxGeometry(width, 0.12, 2.72),
            new THREE.MeshStandardMaterial({ color: data.color, emissive: data.color, emissiveIntensity: 0.35, transparent: true, opacity: 0.72 })
          );
          partition.position.set(-totalWidth / 2 + width / 2 + i * (width + gap), 0.38, 0);
          partition.userData = { ...data, type: 'partition', partition: i + 1, driveIndex };
          drive.add(partition);
        }

        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(1.18, 0.028, 8, 72),
          new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.8 })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.46;
        ring.userData = { type: 'ring', driveIndex };
        drive.add(ring);
        drive.userData = data;
        drives.push(drive);
        group.add(drive);
      });

      const flowGeometry = new THREE.SphereGeometry(0.055, 8, 8);
      const flows = [];
      for (let i = 0; i < 24; i += 1) {
        const flow = new THREE.Mesh(flowGeometry, new THREE.MeshBasicMaterial({ color: i % 2 ? 0x29e6ff : 0x62ff91 }));
        flow.visible = false;
        group.add(flow);
        flows.push(flow);
      }

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let dragging = false;
      let moved = false;
      let previousX = 0;
      let previousY = 0;
      let velocityX = 0;
      let velocityY = 0;
      let scan = 0;
      let last = performance.now();
      let frameAverage = 8;
      let visible = true;

      function resize() {
        const rect = stage.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(260, Math.floor(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      function selectObject(object) {
        if (!object) return;
        const data = object.userData || {};
        const panel = section.querySelector('[data-fx-object]');
        const c = copy();
        const name = data.name || drives[data.driveIndex]?.userData?.name || 'FormatX storage node';
        const partitions = data.partitions || drives[data.driveIndex]?.userData?.partitions || '—';
        const smart = data.smart || drives[data.driveIndex]?.userData?.smart || c.unknown;
        panel.innerHTML = '<small></small><strong></strong><span></span><span></span><span></span>';
        panel.querySelector('small').textContent = c.selected;
        panel.querySelector('strong').textContent = name;
        const spans = panel.querySelectorAll('span');
        spans[0].textContent = c.smart + ': ' + (smart === 'verified' ? c.verified : c.warning);
        spans[1].textContent = c.partitions + ': ' + partitions;
        spans[2].textContent = c.safety + ': ' + (smart === 'verified' ? c.verified : c.warning);
        drives.forEach(drive => drive.scale.setScalar(drive === drives[data.driveIndex] ? 1.08 : 1));
      }

      canvas.addEventListener('pointerdown', event => {
        dragging = true;
        moved = false;
        previousX = event.clientX;
        previousY = event.clientY;
        canvas.setPointerCapture(event.pointerId);
      });
      canvas.addEventListener('pointermove', event => {
        if (!dragging) return;
        const dx = event.clientX - previousX;
        const dy = event.clientY - previousY;
        if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        velocityX = dx * 0.006;
        velocityY = dy * 0.004;
        group.rotation.y += velocityX;
        group.rotation.x = Math.max(-0.45, Math.min(0.45, group.rotation.x + velocityY));
        previousX = event.clientX;
        previousY = event.clientY;
      });
      canvas.addEventListener('pointerup', event => {
        dragging = false;
        if (!moved) {
          const rect = canvas.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(pointer, camera);
          const hits = raycaster.intersectObjects(group.children, true);
          const hit = hits.find(entry => entry.object.userData && (entry.object.userData.type === 'drive' || entry.object.userData.type === 'partition'));
          if (hit) selectObject(hit.object);
        }
      });
      canvas.addEventListener('wheel', event => {
        event.preventDefault();
        camera.position.z = Math.max(6.5, Math.min(13, camera.position.z + event.deltaY * 0.006));
      }, { passive: false });

      function animate(now) {
        if (!state.three || !state.three.active) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        frameAverage = frameAverage * 0.94 + dt * 1000 * 0.06;
        if (frameAverage > 18 && renderer.getPixelRatio() > 1) renderer.setPixelRatio(1);
        if (visible && !document.hidden) {
          velocityX *= 0.93;
          velocityY *= 0.93;
          if (!dragging) {
            group.rotation.y += velocityX;
            group.rotation.x += velocityY;
          }
          if (!reducedMotion.matches && scan > 0) group.rotation.y += dt * 0.12;
          scan = Math.max(0, scan - dt * 0.16);
          drives.forEach((drive, index) => {
            const ring = drive.children.find(child => child.userData?.type === 'ring');
            if (ring) {
              ring.rotation.z += dt * (scan > 0 ? 2.2 + index * 0.25 : 0);
              ring.material.opacity = 0.32 + scan * 0.68;
            }
          });
          flows.forEach((flow, index) => {
            flow.visible = scan > 0.02;
            if (!flow.visible) return;
            const t = (now * 0.00035 + index / flows.length) % 1;
            const source = drives[index % 2].position;
            const target = drives[(index % 2) + 1].position;
            flow.position.x = source.x + (target.x - source.x) * t;
            flow.position.z = Math.sin(t * Math.PI) * (1.1 + (index % 3) * 0.18);
            flow.position.y = 0.3 + Math.sin((t + index) * Math.PI * 2) * 0.18;
          });
          renderer.render(scene, camera);
        }
        requestAnimationFrame(animate);
      }

      const visibilityObserver = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
      }, { threshold: 0.05 });
      visibilityObserver.observe(stage);
      resize();
      addEventListener('resize', resize, { passive: true });
      state.three = {
        active: true,
        visible: true,
        renderer,
        scene,
        camera,
        group,
        drives,
        flows,
        setScan(value = 1) { scan = Math.max(scan, value); },
        dispose() {
          visibilityObserver.disconnect();
          renderer.dispose();
          scene.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              const materials = Array.isArray(object.material) ? object.material : [object.material];
              materials.forEach(material => material.dispose());
            }
          });
        }
      };
      stage.dataset.state = 'ready';
      status.textContent = copy().threeReady;
      section.querySelector('[data-fx-three]').textContent = copy().stop3d;
      selectObject(drives[0].children[0]);
      requestAnimationFrame(animate);
      if (announce) output(copy().threeReady, 'success');
    } catch (error) {
      console.warn('[FormatX Live OS] 3D unavailable', error);
      stage.dataset.state = 'error';
      status.textContent = copy().threeError;
      output(copy().threeError, 'warning');
    }
  }

  function pulseThree() {
    if (state.three) {
      state.three.setScan(1);
      output(state.language === 'hu' ? 'Az ellenőrzési adatfolyam aktív.' : 'Verification data flow is active.', 'success');
    }
  }

  function stopThree() {
    if (!state.three) return;
    state.three.dispose();
    state.three = null;
    const section = makeSection();
    const stage = section.querySelector('[data-fx-stage]');
    stage.dataset.state = 'idle';
    section.querySelector('[data-fx-three-state]').textContent = state.language === 'hu' ? 'A 3D nézet leállítva.' : '3D view stopped.';
    section.querySelector('[data-fx-three]').textContent = copy().start3d;
  }

  function startDemo() {
    const section = makeSection();
    if (!section) return;
    clearInterval(state.demoTimer);
    const panel = section.querySelector('[data-fx-demo-panel]');
    panel.hidden = false;
    let index = 0;
    function renderStep() {
      const steps = copy().demoSteps;
      const step = steps[index];
      const image = panel.querySelector('[data-fx-demo-image]');
      image.src = PRODUCT_ROOT + step[2];
      image.alt = step[0] + ' — FormatX Suite Pro';
      panel.querySelector('[data-fx-demo-step]').textContent = String(index + 1).padStart(2, '0') + ' / ' + String(steps.length).padStart(2, '0');
      panel.querySelector('[data-fx-demo-title]').textContent = step[0];
      panel.querySelector('[data-fx-demo-copy]').textContent = step[1];
      panel.querySelector('[data-fx-demo-progress]').style.setProperty('--progress', ((index + 1) / steps.length * 100) + '%');
      if (index === 0) runDiagnostics(false);
      if (index === 1) startThree(false).then(pulseThree);
      if (index === 3) showProof();
      index = (index + 1) % steps.length;
    }
    renderStep();
    if (!reducedMotion.matches) state.demoTimer = window.setInterval(renderStep, 3600);
    output(state.language === 'hu' ? 'Az interaktív termékbemutató elindult.' : 'Interactive product demo started.', 'success');
    panel.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
  }

  function observeVisibility() {
    const section = state.section;
    if (!section || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      root.dataset.fxLiveOsVisible = entries.some(entry => entry.isIntersecting) ? 'true' : 'false';
    }, { threshold: 0.03 });
    observer.observe(section);
    addEventListener('pagehide', () => observer.disconnect(), { once: true });
  }

  function openFromLauncher() {
    const section = makeSection();
    if (!section) return;
    section.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    const input = section.querySelector('#fx-live-command');
    setTimeout(() => input.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 480);
  }

  addEventListener('formatx:open-live-os', openFromLauncher);
  addEventListener('formatx:languagechange', () => queueMicrotask(renderLanguage));
  const languageObserver = new MutationObserver(entries => {
    if (entries.some(entry => entry.attributeName === 'lang')) queueMicrotask(renderLanguage);
  });
  languageObserver.observe(root, { attributes: true, attributeFilter: ['lang'] });

  function ensure() {
    if (makeSection()) return;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (makeSection() || attempts >= 80) clearInterval(timer);
    }, 250);
  }

  ensure();
  ['DOMContentLoaded', 'pageshow', 'formatx:livingready', 'formatx:loop', 'formatx:productshowcaseready'].forEach(name => addEventListener(name, ensure));
  addEventListener('pagehide', () => {
    clearInterval(state.demoTimer);
    clearTimeout(state.scanTimer);
    languageObserver.disconnect();
    if (state.three) state.three.dispose();
  }, { once: true });
}());
