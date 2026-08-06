(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxLiveOsFallback === 'v1') return;
  root.dataset.fxLiveOsFallback = 'v1';

  const DRIVES = [
    { name: 'NVMe / SYSTEM', smart: 'verified', partitions: 3, color: '#29e6ff' },
    { name: 'SSD / WORKSPACE', smart: 'verified', partitions: 4, color: '#62ff91' },
    { name: 'USB / TARGET', smart: 'warning', partitions: 2, color: '#ffb548' }
  ];

  let engine = null;
  let observer = null;

  const isEnglish = () => root.lang === 'en';
  const text = () => isEnglish() ? {
    active: 'WebGL is unavailable. Interactive Canvas topology is active.',
    stopped: 'Canvas topology stopped.',
    selected: 'Selected object',
    smart: 'SMART state',
    partitions: 'Partitions',
    safety: 'Verification',
    verified: 'verified',
    warning: 'warning',
    start: 'Start 3D system map',
    stop: 'Stop topology',
    flow: 'Verification flow is active.'
  } : {
    active: 'A WebGL nem érhető el. Az interaktív Canvas-térkép aktív.',
    stopped: 'A Canvas-térkép leállítva.',
    selected: 'Kiválasztott elem',
    smart: 'SMART állapot',
    partitions: 'Partíciók',
    safety: 'Ellenőrzés',
    verified: 'ellenőrzött',
    warning: 'figyelmeztetés',
    start: '3D rendszerkép indítása',
    stop: 'Térkép leállítása',
    flow: 'Az ellenőrzési adatfolyam aktív.'
  };

  function updateObject(section, index) {
    const drive = DRIVES[index] || DRIVES[0];
    const copy = text();
    const panel = section.querySelector('[data-fx-object]');
    panel.innerHTML = '<small></small><strong></strong><span></span><span></span><span></span>';
    panel.querySelector('small').textContent = copy.selected;
    panel.querySelector('strong').textContent = drive.name;
    const spans = panel.querySelectorAll('span');
    spans[0].textContent = copy.smart + ': ' + (drive.smart === 'verified' ? copy.verified : copy.warning);
    spans[1].textContent = copy.partitions + ': ' + drive.partitions;
    spans[2].textContent = copy.safety + ': ' + (drive.smart === 'verified' ? copy.verified : copy.warning);
  }

  function startFallback(stage) {
    if (engine && engine.stage === stage) return;
    if (engine) engine.dispose();

    const section = stage.closest('.fx-live-os');
    const canvas = stage.querySelector('[data-fx-three-canvas]');
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const status = stage.querySelector('[data-fx-three-state]');
    const toggle = section.querySelector('[data-fx-three]');
    const scanButton = section.querySelector('[data-fx-scan]');
    let selected = 0;
    let scan = 0;
    let rotation = 0;
    let dragging = false;
    let previousX = 0;
    let frame = 0;
    let disposed = false;
    const hitAreas = [];

    function resize() {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(260, Math.floor(rect.height * dpr));
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }

    function roundedRect(x, y, width, height, radius) {
      const r = Math.min(radius, width / 2, height / 2);
      context.beginPath();
      context.moveTo(x + r, y);
      context.arcTo(x + width, y, x + width, y + height, r);
      context.arcTo(x + width, y + height, x, y + height, r);
      context.arcTo(x, y + height, x, y, r);
      context.arcTo(x, y, x + width, y, r);
      context.closePath();
    }

    function drawGrid(width, height) {
      context.save();
      context.strokeStyle = 'rgba(44,231,243,.09)';
      context.lineWidth = 1;
      const step = 34;
      for (let x = 0; x <= width; x += step) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = 0; y <= height; y += step) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
      context.restore();
    }

    function drivePosition(index, width, height) {
      const spacing = Math.min(width * .29, 240);
      const centre = width / 2;
      const x = centre + (index - 1) * spacing + Math.sin(rotation + index * .8) * 12;
      const y = height * .48 + Math.cos(rotation * .7 + index) * 10;
      return { x, y };
    }

    function drawDrive(drive, index, width, height, now) {
      const position = drivePosition(index, width, height);
      const boxWidth = Math.max(118, Math.min(190, width * .19));
      const boxHeight = Math.max(92, Math.min(130, height * .28));
      const x = position.x - boxWidth / 2;
      const y = position.y - boxHeight / 2;
      const active = selected === index;
      hitAreas[index] = { x, y, width: boxWidth, height: boxHeight };

      context.save();
      context.shadowColor = drive.color;
      context.shadowBlur = active ? 26 : 12;
      roundedRect(x, y, boxWidth, boxHeight, 15);
      context.fillStyle = active ? 'rgba(18,45,62,.96)' : 'rgba(6,19,31,.94)';
      context.fill();
      context.shadowBlur = 0;
      context.strokeStyle = drive.color;
      context.lineWidth = active ? 2.5 : 1.2;
      context.stroke();

      context.fillStyle = '#eefaff';
      context.font = '700 12px system-ui, sans-serif';
      context.fillText(drive.name, x + 12, y + 22);
      context.fillStyle = drive.smart === 'verified' ? '#62ff91' : '#ffb548';
      context.font = '800 9px system-ui, sans-serif';
      context.fillText('SMART · ' + drive.smart.toUpperCase(), x + 12, y + 39);

      const gap = 4;
      const partitionY = y + 55;
      const partitionHeight = boxHeight - 70;
      const partitionWidth = (boxWidth - 24 - gap * (drive.partitions - 1)) / drive.partitions;
      for (let p = 0; p < drive.partitions; p += 1) {
        const px = x + 12 + p * (partitionWidth + gap);
        roundedRect(px, partitionY, partitionWidth, partitionHeight, 5);
        context.fillStyle = drive.color + (p === 0 ? 'b8' : '70');
        context.fill();
      }

      context.beginPath();
      context.strokeStyle = drive.color;
      context.globalAlpha = .45 + scan * .5;
      context.lineWidth = 2;
      context.arc(position.x, position.y, Math.max(boxWidth, boxHeight) * .62, now * .0012 + index, now * .0012 + index + Math.PI * 1.45);
      context.stroke();
      context.restore();
    }

    function drawFlows(width, height, now) {
      if (scan <= .01) return;
      context.save();
      context.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 22; i += 1) {
        const from = drivePosition(i % 2, width, height);
        const to = drivePosition((i % 2) + 1, width, height);
        const t = (now * .00036 + i / 22) % 1;
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t - Math.sin(t * Math.PI) * (34 + (i % 3) * 10);
        context.beginPath();
        context.fillStyle = i % 2 ? '#29e6ff' : '#62ff91';
        context.shadowColor = context.fillStyle;
        context.shadowBlur = 10;
        context.arc(x, y, 2.2, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    }

    function draw(now) {
      if (disposed) return;
      const rect = stage.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(260, rect.height);
      context.clearRect(0, 0, width, height);
      const gradient = context.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width * .55);
      gradient.addColorStop(0, 'rgba(20,71,92,.28)');
      gradient.addColorStop(1, 'rgba(1,7,13,.96)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
      drawGrid(width, height);
      DRIVES.forEach((drive, index) => drawDrive(drive, index, width, height, now));
      drawFlows(width, height, now);
      scan = Math.max(0, scan - .008);
      rotation += scan > 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches ? .002 : 0;
      if (scan > 0 || dragging) frame = requestAnimationFrame(draw);
      else frame = 0;
    }

    function requestDraw() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    function selectAt(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const index = hitAreas.findIndex(area => area && x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height);
      if (index >= 0) {
        selected = index;
        updateObject(section, selected);
        requestDraw();
      }
    }

    function onPointerDown(event) {
      dragging = true;
      previousX = event.clientX;
      canvas.setPointerCapture?.(event.pointerId);
    }
    function onPointerMove(event) {
      if (!dragging) return;
      rotation += (event.clientX - previousX) * .004;
      previousX = event.clientX;
      requestDraw();
    }
    function onPointerUp(event) {
      const delta = Math.abs(event.clientX - previousX);
      dragging = false;
      if (delta < 5) selectAt(event.clientX, event.clientY);
      requestDraw();
    }
    function onScan() {
      scan = 1;
      status.textContent = text().flow;
      requestDraw();
    }
    function onToggle(event) {
      if (stage.dataset.state !== 'fallback') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      dispose();
      stage.dataset.state = 'idle';
      status.textContent = text().stopped;
      toggle.textContent = text().start;
    }

    function dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      scanButton.removeEventListener('click', onScan);
      toggle.removeEventListener('click', onToggle, true);
      removeEventListener('resize', resize);
      if (engine && engine.stage === stage) engine = null;
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    scanButton.addEventListener('click', onScan);
    toggle.addEventListener('click', onToggle, true);
    addEventListener('resize', resize, { passive: true });

    engine = { stage, dispose, setScan: onScan };
    stage.dataset.state = 'fallback';
    status.textContent = text().active;
    toggle.textContent = text().stop;
    updateObject(section, selected);
    resize();
  }

  function inspect() {
    const stages = document.querySelectorAll('.fx-live-os [data-fx-stage]');
    stages.forEach(stage => {
      if (stage.dataset.state === 'error') startFallback(stage);
    });
  }

  observer = new MutationObserver(inspect);
  observer.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['data-state'], childList: true });
  addEventListener('formatx:liveosready', inspect);
  addEventListener('pageshow', inspect);
  addEventListener('formatx:languagechange', () => {
    if (!engine) return;
    const status = engine.stage.querySelector('[data-fx-three-state]');
    status.textContent = text().active;
    engine.stage.closest('.fx-live-os').querySelector('[data-fx-three]').textContent = text().stop;
  });
  addEventListener('pagehide', () => {
    observer.disconnect();
    if (engine) engine.dispose();
  }, { once: true });
  inspect();
}());
