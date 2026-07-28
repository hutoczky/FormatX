(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxInteractionGenome === 'ready') return;
  root.dataset.fxInteractionGenome = 'loading';

  const STORAGE_KEY = 'formatx-interaction-genome-v1';
  const MAX_STATES = 48;
  const encoder = new TextEncoder();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COPY = {
    hu: {
      launch: 'Interakciós DNS', launchSub: 'Élő munkamenet', eyebrow: 'FORMATX / INTERACTION GENOME',
      title: 'A honlap emlékszik arra, hogyan gondolkodtál.',
      lead: 'Minden fontos döntésed egy csomóponttá válik ebben a helyben generált, térbeli interakciós genomban. Válassz ki egy korábbi pillanatot, és a FormatX visszaáll arra az állapotra — újratöltés és szerveroldali követés nélkül.',
      nodes: 'Állapotok', loops: 'Ciklusok', span: 'Időtáv', selected: 'Kiválasztott pillanat',
      emptyTitle: 'A genom most ébred', emptyCopy: 'Görgess, válts nyelvet, nyiss meg modult vagy kapcsold be a zenét. Minden lényeges változás új csomópontot hoz létre.',
      scene: 'Fejezet', language: 'Nyelv', audio: 'Zene', position: 'Pozíció', timeline: 'Idővonal', current: 'Jelen',
      restore: 'Visszaállítás erre a pillanatra', export: 'DNS exportálása', clear: 'Genom törlése',
      proof: 'Helyi munkamenet-lenyomat / SHA-256', noProof: 'LENYOMAT KÉSZÜL…',
      privacy: 'Adatvédelmi szabály: a genom kizárólag engedélyezett FormatX-állapotokat tárol a böngésző munkamenetében. Űrlapmezőt, személyes szöveget és hálózati adatot nem rögzít.',
      close: 'Interakciós DNS bezárása', canvas: 'A munkamenet térbeli, visszatekerhető interakciós genomja',
      init: 'Munkamenet kezdete', scroll: 'Új felfedezési pont', sceneType: 'Fejezetváltás', click: 'Művelet', languageType: 'Nyelvváltás', audioType: 'Zeneállapot', loopType: 'Új folytonos ciklus', restoreType: 'Visszaállított állapot',
      restored: 'A honlap visszaállt a kiválasztott pillanatra.', exported: 'Az interakciós DNS exportálva.', cleared: 'Új, üres genom indult.'
    },
    en: {
      launch: 'Interaction DNA', launchSub: 'Living session', eyebrow: 'FORMATX / INTERACTION GENOME',
      title: 'The website remembers how you thought.',
      lead: 'Every meaningful decision becomes a node in a locally generated spatial interaction genome. Select an earlier moment and FormatX restores that state — without reloading or server-side tracking.',
      nodes: 'States', loops: 'Loops', span: 'Timespan', selected: 'Selected moment',
      emptyTitle: 'The genome is waking up', emptyCopy: 'Scroll, switch language, open a module or enable the score. Every meaningful change creates a new node.',
      scene: 'Chapter', language: 'Language', audio: 'Music', position: 'Position', timeline: 'Timeline', current: 'Now',
      restore: 'Restore this moment', export: 'Export DNA', clear: 'Clear genome',
      proof: 'Local session fingerprint / SHA-256', noProof: 'CALCULATING FINGERPRINT…',
      privacy: 'Privacy rule: the genome stores only allow-listed FormatX states inside this browser session. It never records form fields, personal text or network data.',
      close: 'Close Interaction DNA', canvas: 'Spatial and reversible interaction genome of this session',
      init: 'Session origin', scroll: 'New exploration point', sceneType: 'Chapter transition', click: 'Action', languageType: 'Language transition', audioType: 'Music state', loopType: 'New continuous loop', restoreType: 'Restored state',
      restored: 'The website returned to the selected moment.', exported: 'Interaction DNA exported.', cleared: 'A new empty genome has started.'
    }
  };

  const state = {
    items: [],
    selected: -1,
    opened: false,
    fingerprint: '',
    startedAt: Date.now(),
    lastRecordedAt: 0,
    lastScrollState: 0,
    hashToken: 0,
    renderFrame: 0,
    canvasHits: [],
    pointerX: 0,
    pointerY: 0,
    tiltX: 0,
    tiltY: 0,
    notice: ''
  };

  const elements = {};

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function text() {
    return COPY[language()];
  }

  function safeRead() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(item => item && typeof item === 'object').slice(-MAX_STATES);
    } catch (_) {
      return [];
    }
  }

  function safeWrite() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.items)); } catch (_) {}
  }

  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (value && typeof value === 'object') {
      return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
    }
    return JSON.stringify(value);
  }

  function hex(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async function updateFingerprint() {
    const token = ++state.hashToken;
    const payload = state.items.map(item => ({ id: item.id, t: item.t, type: item.type, scene: item.scene, lang: item.lang, audio: item.audio, loop: item.loop, y: item.y, panel: item.panel, action: item.action }));
    let fingerprint = '';
    try {
      if (crypto && crypto.subtle) {
        const digest = await crypto.subtle.digest('SHA-256', encoder.encode(canonical(payload)));
        fingerprint = hex(new Uint8Array(digest)).toUpperCase();
      }
    } catch (_) {}
    if (token !== state.hashToken) return;
    state.fingerprint = fingerprint || String(Date.now()).toString(36).toUpperCase();
    renderInspector();
  }

  function currentPanel() {
    const consoleRoot = document.getElementById('fx-organism-console');
    if (!consoleRoot || consoleRoot.hidden) return '';
    const visible = consoleRoot.querySelector('[data-organism-panel]:not([hidden])');
    return visible?.getAttribute('data-organism-panel') || '';
  }

  function audioState() {
    const button = document.querySelector('.fx-three-sound');
    return button?.dataset.fxAudioState || root.dataset.fxAudioState || (button?.getAttribute('aria-pressed') === 'true' ? 'on' : 'off');
  }

  function snapshot(type, action, extra) {
    const maximum = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    return Object.assign({
      id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
      t: Date.now() - state.startedAt,
      at: new Date().toISOString(),
      type,
      action: String(action || '').slice(0, 96),
      y: Math.max(0, Math.round(scrollY)),
      progress: Math.max(0, Math.min(1, scrollY / maximum)),
      scene: Number(root.dataset.fxThreeScene || 0),
      lang: language(),
      audio: audioState(),
      loop: Number(root.dataset.fxLoopCount || 0),
      panel: currentPanel()
    }, extra || {});
  }

  function equivalent(a, b) {
    return a && b && a.type === b.type && a.scene === b.scene && a.lang === b.lang && a.audio === b.audio && a.loop === b.loop && a.panel === b.panel && Math.abs(a.y - b.y) < 42 && a.action === b.action;
  }

  function record(type, action, extra, force) {
    const item = snapshot(type, action, extra);
    const previous = state.items.at(-1);
    const now = performance.now();
    if (!force && equivalent(previous, item) && now - state.lastRecordedAt < 1200) return previous;
    state.lastRecordedAt = now;
    state.items.push(item);
    if (state.items.length > MAX_STATES) state.items.splice(0, state.items.length - MAX_STATES);
    state.selected = state.items.length - 1;
    safeWrite();
    updateFingerprint();
    renderAll();
    return item;
  }

  function typeLabel(item) {
    const copy = text();
    const map = { init: copy.init, scroll: copy.scroll, scene: copy.sceneType, click: copy.click, language: copy.languageType, audio: copy.audioType, loop: copy.loopType, restore: copy.restoreType };
    return item?.action || map[item?.type] || copy.click;
  }

  function formatTime(milliseconds) {
    const seconds = Math.max(0, Math.round(milliseconds / 1000));
    const minutes = Math.floor(seconds / 60);
    return String(minutes).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
  }

  function loadStyle() {
    if (document.querySelector('link[data-fx-interaction-genome-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/interaction-genome.css?v=20260728-genome-1';
    link.dataset.fxInteractionGenomeStyle = 'true';
    document.head.appendChild(link);
  }

  function createUi() {
    if (document.getElementById('fx-interaction-genome')) return;
    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'fx-genome-launcher';
    launcher.setAttribute('aria-haspopup', 'dialog');
    launcher.innerHTML = '<i aria-hidden="true"></i><b><span></span><small></small></b>';

    const overlay = document.createElement('section');
    overlay.id = 'fx-interaction-genome';
    overlay.className = 'fx-genome-overlay';
    overlay.dataset.open = 'false';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'fx-genome-title');
    overlay.innerHTML = `
      <div class="fx-genome-shell">
        <header class="fx-genome-topbar">
          <div class="fx-genome-heading"><p class="fx-genome-eyebrow" data-genome-copy="eyebrow"></p><h2 id="fx-genome-title" data-genome-copy="title"></h2><p data-genome-copy="lead"></p></div>
          <button class="fx-genome-close" type="button" aria-label="">×</button>
        </header>
        <div class="fx-genome-grid">
          <section class="fx-genome-stage"><canvas id="fx-genome-canvas" tabindex="0"></canvas><p class="fx-genome-stage-note" data-genome-copy="canvas"></p></section>
          <aside class="fx-genome-inspector">
            <div class="fx-genome-metrics"><div><small data-genome-copy="nodes"></small><strong id="fx-genome-count">0</strong></div><div><small data-genome-copy="loops"></small><strong id="fx-genome-loops">0</strong></div><div><small data-genome-copy="span"></small><strong id="fx-genome-span">00:00</strong></div></div>
            <section class="fx-genome-selected"><small data-genome-copy="selected"></small><h3 id="fx-genome-selected-title"></h3><p id="fx-genome-selected-copy"></p><dl><div><dt data-genome-copy="scene"></dt><dd id="fx-genome-scene">—</dd></div><div><dt data-genome-copy="language"></dt><dd id="fx-genome-language">—</dd></div><div><dt data-genome-copy="audio"></dt><dd id="fx-genome-audio">—</dd></div><div><dt data-genome-copy="position"></dt><dd id="fx-genome-position">—</dd></div></dl></section>
            <div class="fx-genome-scrubber"><label><span data-genome-copy="timeline"></span><b id="fx-genome-time-label" data-genome-copy="current"></b></label><input id="fx-genome-range" type="range" min="0" max="0" value="0" step="1"></div>
            <div class="fx-genome-actions"><button id="fx-genome-restore" type="button" data-genome-copy="restore"></button><button id="fx-genome-export" type="button" data-genome-copy="export"></button><button id="fx-genome-clear" type="button" data-genome-copy="clear"></button></div>
            <div class="fx-genome-proof"><small data-genome-copy="proof"></small><strong id="fx-genome-fingerprint"></strong></div>
            <p class="fx-genome-privacy" data-genome-copy="privacy"></p>
          </aside>
        </div>
      </div>`;

    document.body.append(launcher, overlay);
    Object.assign(elements, {
      launcher,
      overlay,
      close: overlay.querySelector('.fx-genome-close'),
      canvas: overlay.querySelector('#fx-genome-canvas'),
      count: overlay.querySelector('#fx-genome-count'),
      loops: overlay.querySelector('#fx-genome-loops'),
      span: overlay.querySelector('#fx-genome-span'),
      selectedTitle: overlay.querySelector('#fx-genome-selected-title'),
      selectedCopy: overlay.querySelector('#fx-genome-selected-copy'),
      scene: overlay.querySelector('#fx-genome-scene'),
      lang: overlay.querySelector('#fx-genome-language'),
      audio: overlay.querySelector('#fx-genome-audio'),
      position: overlay.querySelector('#fx-genome-position'),
      timeLabel: overlay.querySelector('#fx-genome-time-label'),
      range: overlay.querySelector('#fx-genome-range'),
      restore: overlay.querySelector('#fx-genome-restore'),
      exportButton: overlay.querySelector('#fx-genome-export'),
      clear: overlay.querySelector('#fx-genome-clear'),
      fingerprint: overlay.querySelector('#fx-genome-fingerprint')
    });

    bindUi();
    translate();
    resizeCanvas();
  }

  function bindUi() {
    elements.launcher.addEventListener('click', open);
    elements.close.addEventListener('click', close);
    elements.overlay.addEventListener('click', event => { if (event.target === elements.overlay) close(); });
    elements.range.addEventListener('input', () => select(Number(elements.range.value)));
    elements.restore.addEventListener('click', restoreSelected);
    elements.exportButton.addEventListener('click', exportGenome);
    elements.clear.addEventListener('click', clearGenome);
    elements.canvas.addEventListener('pointermove', onCanvasPointer);
    elements.canvas.addEventListener('pointerleave', () => { state.pointerX = 0; state.pointerY = 0; });
    elements.canvas.addEventListener('click', onCanvasClick);
    addEventListener('resize', resizeCanvas, { passive: true });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && state.opened) close();
      if (!state.opened) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); select(Math.max(0, state.selected - 1)); }
      if (event.key === 'ArrowRight') { event.preventDefault(); select(Math.min(state.items.length - 1, state.selected + 1)); }
      if (event.key === 'Enter' && document.activeElement === elements.canvas) restoreSelected();
    });
  }

  function translate() {
    if (!elements.overlay) return;
    const copy = text();
    document.querySelectorAll('[data-genome-copy]').forEach(node => {
      const key = node.dataset.genomeCopy;
      if (key in copy) node.textContent = copy[key];
    });
    elements.launcher.querySelector('span').textContent = copy.launch;
    elements.launcher.querySelector('small').textContent = copy.launchSub;
    elements.close.setAttribute('aria-label', copy.close);
    elements.canvas.setAttribute('aria-label', copy.canvas);
    renderInspector();
  }

  function open() {
    state.opened = true;
    elements.overlay.dataset.open = 'true';
    document.body.classList.add('fx-genome-open');
    elements.close.focus({ preventScroll: true });
    resizeCanvas();
    startRender();
  }

  function close() {
    state.opened = false;
    elements.overlay.dataset.open = 'false';
    document.body.classList.remove('fx-genome-open');
    cancelAnimationFrame(state.renderFrame);
    state.renderFrame = 0;
    elements.launcher.focus({ preventScroll: true });
  }

  function select(index) {
    if (!state.items.length) state.selected = -1;
    else state.selected = Math.max(0, Math.min(state.items.length - 1, index));
    renderInspector();
    drawCanvas(performance.now());
  }

  function renderInspector() {
    if (!elements.overlay) return;
    const copy = text();
    const item = state.items[state.selected];
    const latest = state.items.at(-1);
    elements.launcher.dataset.count = String(state.items.length);
    elements.count.textContent = String(state.items.length).padStart(2, '0');
    elements.loops.textContent = String(latest?.loop || 0).padStart(2, '0');
    elements.span.textContent = formatTime(latest?.t || 0);
    elements.range.max = String(Math.max(0, state.items.length - 1));
    elements.range.value = String(Math.max(0, state.selected));
    elements.range.disabled = state.items.length < 2;
    elements.restore.disabled = !item;
    elements.exportButton.disabled = !state.items.length;
    elements.clear.disabled = !state.items.length;
    elements.fingerprint.textContent = state.fingerprint ? state.fingerprint.match(/.{1,8}/g).join(' · ') : copy.noProof;

    if (!item) {
      elements.selectedTitle.textContent = copy.emptyTitle;
      elements.selectedCopy.textContent = copy.emptyCopy;
      elements.scene.textContent = '—'; elements.lang.textContent = '—'; elements.audio.textContent = '—'; elements.position.textContent = '—'; elements.timeLabel.textContent = copy.current;
      return;
    }

    elements.selectedTitle.textContent = typeLabel(item);
    elements.selectedCopy.textContent = item.type === 'restore' ? copy.restored : (item.action || typeLabel(item));
    elements.scene.textContent = String(item.scene + 1).padStart(2, '0');
    elements.lang.textContent = item.lang.toUpperCase();
    elements.audio.textContent = String(item.audio || 'off').toUpperCase();
    elements.position.textContent = Math.round((item.progress || 0) * 100) + '%';
    elements.timeLabel.textContent = formatTime(item.t);
  }

  function renderAll() {
    renderInspector();
    if (state.opened) drawCanvas(performance.now());
  }

  function resizeCanvas() {
    if (!elements.canvas) return;
    const rect = elements.canvas.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    const width = Math.max(320, Math.round(rect.width * dpr));
    const height = Math.max(360, Math.round(rect.height * dpr));
    if (elements.canvas.width !== width || elements.canvas.height !== height) {
      elements.canvas.width = width; elements.canvas.height = height;
      drawCanvas(performance.now());
    }
  }

  function colorFor(item, alpha) {
    const map = { init: '118,226,255', scroll: '118,226,255', scene: '173,121,255', click: '255,109,196', language: '151,244,202', audio: '255,209,117', loop: '203,151,255', restore: '255,255,255' };
    return 'rgba(' + (map[item?.type] || map.scroll) + ',' + alpha + ')';
  }

  function drawCanvas(now) {
    if (!elements.canvas) return;
    const canvas = elements.canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const count = Math.max(1, state.items.length);
    const phase = reducedMotion ? .8 : now * .00022;
    const radius = Math.min(width * .24, 260 * dpr);
    const centerX = width * .5 + state.tiltX * width * .08;
    const top = 58 * dpr;
    const bottom = height - 58 * dpr;
    const available = Math.max(1, bottom - top);
    state.canvasHits = [];

    ctx.clearRect(0, 0, width, height);
    const glow = ctx.createRadialGradient(centerX, height * .5, 0, centerX, height * .5, Math.max(width, height) * .62);
    glow.addColorStop(0, 'rgba(118,226,255,.07)'); glow.addColorStop(.48, 'rgba(173,121,255,.035)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);

    const points = [];
    for (let index = 0; index < count; index += 1) {
      const item = state.items[index] || { type: 'init', t: 0 };
      const ratio = count === 1 ? .5 : index / (count - 1);
      const y = top + ratio * available;
      const angle = phase + index * .82 + state.tiltY * .9;
      const depthA = Math.cos(angle);
      const depthB = Math.cos(angle + Math.PI);
      const xA = centerX + Math.sin(angle) * radius;
      const xB = centerX + Math.sin(angle + Math.PI) * radius;
      points.push({ item, index, y, xA, xB, depthA, depthB });
    }

    ctx.lineWidth = 1.2 * dpr;
    for (let strand = 0; strand < 2; strand += 1) {
      ctx.beginPath();
      points.forEach((point, index) => {
        const x = strand === 0 ? point.xA : point.xB;
        if (!index) ctx.moveTo(x, point.y); else ctx.lineTo(x, point.y);
      });
      const line = ctx.createLinearGradient(0, top, 0, bottom);
      line.addColorStop(0, strand === 0 ? 'rgba(118,226,255,.18)' : 'rgba(173,121,255,.16)');
      line.addColorStop(.5, strand === 0 ? 'rgba(118,226,255,.72)' : 'rgba(255,109,196,.6)');
      line.addColorStop(1, 'rgba(255,255,255,.08)');
      ctx.strokeStyle = line; ctx.stroke();
    }

    points.forEach(point => {
      const selected = point.index === state.selected;
      const radiusNode = (selected ? 8 : 5.2) * dpr;
      const depthScaleA = .72 + (point.depthA + 1) * .18;
      const depthScaleB = .72 + (point.depthB + 1) * .18;

      ctx.beginPath(); ctx.moveTo(point.xA, point.y); ctx.lineTo(point.xB, point.y);
      ctx.strokeStyle = colorFor(point.item, selected ? .55 : .16); ctx.lineWidth = (selected ? 1.8 : .75) * dpr; ctx.stroke();

      [[point.xA, depthScaleA, 0], [point.xB, depthScaleB, 1]].forEach(([x, depthScale, strand]) => {
        const r = radiusNode * depthScale;
        ctx.save();
        ctx.shadowBlur = (selected ? 26 : 12) * dpr;
        ctx.shadowColor = colorFor(point.item, .8);
        ctx.beginPath(); ctx.arc(x, point.y, r, 0, Math.PI * 2);
        ctx.fillStyle = colorFor(point.item, selected ? .98 : .72); ctx.fill();
        ctx.beginPath(); ctx.arc(x - r * .24, point.y - r * .22, Math.max(1, r * .22), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,.78)'; ctx.fill();
        ctx.restore();
        state.canvasHits.push({ x: x / dpr, y: point.y / dpr, r: Math.max(13, r / dpr + 8), index: point.index, strand });
      });

      if (selected) {
        ctx.font = '700 ' + (10 * dpr) + 'px ui-monospace,monospace';
        ctx.fillStyle = 'rgba(232,249,255,.9)';
        ctx.textAlign = point.xA > centerX ? 'right' : 'left';
        ctx.fillText(String(point.index + 1).padStart(2, '0') + ' / ' + typeLabel(point.item).toUpperCase().slice(0, 32), point.xA + (point.xA > centerX ? -16 : 16) * dpr, point.y - 12 * dpr);
      }
    });
  }

  function startRender() {
    cancelAnimationFrame(state.renderFrame);
    function frame(now) {
      drawCanvas(now);
      if (state.opened && !reducedMotion) state.renderFrame = requestAnimationFrame(frame);
    }
    state.renderFrame = requestAnimationFrame(frame);
  }

  function onCanvasPointer(event) {
    const rect = elements.canvas.getBoundingClientRect();
    state.pointerX = event.clientX - rect.left;
    state.pointerY = event.clientY - rect.top;
    state.tiltX += ((state.pointerX / Math.max(1, rect.width) - .5) - state.tiltX) * .16;
    state.tiltY += ((state.pointerY / Math.max(1, rect.height) - .5) - state.tiltY) * .16;
    let nearest = null;
    let distance = Infinity;
    state.canvasHits.forEach(hit => {
      const current = Math.hypot(hit.x - state.pointerX, hit.y - state.pointerY);
      if (current < hit.r && current < distance) { nearest = hit; distance = current; }
    });
    elements.canvas.style.cursor = nearest ? 'pointer' : 'crosshair';
    if (nearest) elements.canvas.dataset.hoverIndex = String(nearest.index); else delete elements.canvas.dataset.hoverIndex;
  }

  function onCanvasClick() {
    const index = Number(elements.canvas.dataset.hoverIndex);
    if (Number.isInteger(index)) select(index);
  }

  async function restoreItem(item) {
    if (!item) return;
    if (item.lang !== language()) {
      const languageButton = document.querySelector('[data-language="' + item.lang + '"]');
      if (languageButton instanceof HTMLElement) languageButton.click();
      else { root.lang = item.lang; document.dispatchEvent(new CustomEvent('formatx:languagechange', { detail: { language: item.lang } })); }
      await new Promise(resolve => setTimeout(resolve, 80));
    }

    const currentAudio = audioState();
    const wantsAudio = item.audio === 'on';
    const hasAudio = currentAudio === 'on';
    if (wantsAudio !== hasAudio) document.querySelector('.fx-three-sound')?.click();

    const consoleRoot = document.getElementById('fx-organism-console');
    if (item.panel) {
      const trigger = document.querySelector('[data-organism-open="' + CSS.escape(item.panel) + '"]');
      if (trigger instanceof HTMLElement) trigger.click();
    } else if (consoleRoot && !consoleRoot.hidden) {
      document.querySelector('.fx-organism-console-close')?.click();
    }

    scrollTo({ top: Math.max(0, item.y), left: 0, behavior: 'instant' });
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    record('restore', text().restored, { restoredFrom: item.id }, true);
  }

  async function restoreSelected() {
    const item = state.items[state.selected];
    close();
    await restoreItem(item);
  }

  function exportGenome() {
    if (!state.items.length) return;
    const payload = {
      schema: 'formatx-interaction-genome-v1',
      generated_at: new Date().toISOString(),
      local_only: true,
      contains_form_values: false,
      contains_personal_text: false,
      fingerprint_sha256: state.fingerprint,
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio || 1 },
      states: state.items
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'FormatX-Interaction-Genome-' + (state.fingerprint || 'SESSION').slice(0, 16) + '.fxgenome.json';
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    state.notice = text().exported;
  }

  function clearGenome() {
    state.items = [];
    state.selected = -1;
    state.startedAt = Date.now();
    state.fingerprint = '';
    safeWrite();
    record('init', text().cleared, null, true);
  }

  function meaningfulTarget(target) {
    if (!(target instanceof Element)) return null;
    return target.closest('[data-organism-open],[data-language],.fx-three-sound,.menu-toggle,.header-buy,.button,.price-card,.card,a[href^="#"],a[data-fx-simulator-entry]');
  }

  function targetLabel(target) {
    if (!target) return '';
    const explicit = target.getAttribute('aria-label') || target.getAttribute('data-organism-open') || target.getAttribute('data-language') || target.getAttribute('data-fx-simulator-entry');
    if (explicit) return explicit;
    return String(target.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 72);
  }

  function bindRecording() {
    let scrollTimer = 0;
    addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const maximum = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        const normalized = scrollY / maximum;
        if (Math.abs(normalized - state.lastScrollState) >= .105) {
          state.lastScrollState = normalized;
          record('scroll', text().scroll);
        }
      }, 240);
    }, { passive: true });

    document.addEventListener('click', event => {
      if (elements.overlay?.contains(event.target) || elements.launcher?.contains(event.target)) return;
      const target = meaningfulTarget(event.target);
      if (!target) return;
      queueMicrotask(() => record('click', targetLabel(target)));
    }, true);

    addEventListener('formatx:loop', event => record('loop', text().loopType, { loop: Number(event.detail?.count || root.dataset.fxLoopCount || 0) }, true));
    document.addEventListener('formatx:languagechange', () => setTimeout(() => { translate(); record('language', text().languageType, null, true); }, 0));

    let previousScene = root.dataset.fxThreeScene || '0';
    let previousAudio = audioState();
    const observer = new MutationObserver(() => {
      const scene = root.dataset.fxThreeScene || '0';
      const audio = audioState();
      if (scene !== previousScene) { previousScene = scene; record('scene', text().sceneType, null, true); }
      if (audio !== previousAudio) { previousAudio = audio; record('audio', text().audioType, null, true); }
      translate();
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-fx-three-scene', 'data-fx-audio-state', 'lang'] });
    addEventListener('pagehide', () => { observer.disconnect(); clearTimeout(scrollTimer); }, { once: true });
  }

  function expose() {
    window.FormatXInteractionGenome = Object.freeze({
      version: 'interaction-genome-v1',
      open,
      close,
      record: (type, action, extra) => record(type, action, extra, true),
      restore: index => restoreItem(state.items[index]),
      exportGenome,
      clear: clearGenome,
      getState: () => JSON.parse(JSON.stringify({ items: state.items, selected: state.selected, fingerprint: state.fingerprint, opened: state.opened }))
    });
  }

  function init() {
    loadStyle();
    state.items = safeRead();
    if (state.items.length) {
      state.startedAt = Date.now() - Number(state.items.at(-1)?.t || 0);
      state.selected = state.items.length - 1;
    }
    createUi();
    bindRecording();
    expose();
    if (!state.items.length) record('init', text().init, null, true); else updateFingerprint();
    root.dataset.fxInteractionGenome = 'ready';
    document.dispatchEvent(new CustomEvent('formatx:interaction-genome-ready'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
}());
