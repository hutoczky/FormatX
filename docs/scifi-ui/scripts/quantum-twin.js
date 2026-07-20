(function () {
  'use strict';

  const hero = document.querySelector('.hero');
  if (!hero || document.querySelector('.quantum-twin')) return;

  const section = document.createElement('section');
  section.className = 'quantum-twin';
  section.setAttribute('aria-labelledby', 'quantum-twin-title');
  section.innerHTML = [
    '<div class="quantum-twin-head">',
      '<div>',
        '<p class="quantum-twin-kicker">FormatX Quantum Twin</p>',
        '<h2 id="quantum-twin-title">Lásd a rendszer állapotát, mielőtt hozzányúlsz.</h2>',
        '<p class="quantum-twin-lead">Egy saját fejlesztésű, élő rendszeriker mutatja meg, hogyan változik a töredezett, bizonytalan környezet ellenőrzött és optimalizált állapottá. A csúszka nem dísz: ugyanazt a gondolkodást modellezi, amelyre a FormatX munkafolyamata épül.</p>',
      '</div>',
      '<div class="quantum-twin-badge">LOCAL · PRIVATE · VERIFIED</div>',
    '</div>',
    '<div class="quantum-twin-stage">',
      '<aside class="quantum-panel" aria-label="Élő rendszerértékek">',
        '<span class="quantum-panel-label">Élő rendszerértékek</span>',
        '<h3>Állapotváltozás</h3>',
        '<div class="quantum-metrics">',
          '<div class="quantum-metric"><div><span>Integritás</span><strong data-qt-integrity>61%</strong></div><div class="quantum-bar"><i data-qt-bar="integrity" style="--value:61%"></i></div></div>',
          '<div class="quantum-metric"><div><span>Stabilitás</span><strong data-qt-stability>54%</strong></div><div class="quantum-bar"><i data-qt-bar="stability" style="--value:54%"></i></div></div>',
          '<div class="quantum-metric"><div><span>Átláthatóság</span><strong data-qt-clarity>47%</strong></div><div class="quantum-bar"><i data-qt-bar="clarity" style="--value:47%"></i></div></div>',
          '<div class="quantum-metric"><div><span>Kockázat</span><strong data-qt-risk>43%</strong></div><div class="quantum-bar"><i data-qt-bar="risk" style="--value:43%"></i></div></div>',
        '</div>',
        '<div class="quantum-signature" data-qt-signature>FX-TWIN://STATE-52/VERIFIED-LOCAL</div>',
      '</aside>',
      '<div class="quantum-core">',
        '<canvas aria-hidden="true"></canvas>',
        '<div class="quantum-core-ui">',
          '<div class="quantum-core-title"><strong>QUANTUM SYSTEM MAP</strong><span>LIVE STATE RECONSTRUCTION</span></div>',
          '<div class="quantum-score"><strong data-qt-score>72</strong><span>RENDSZERMINŐSÉG</span></div>',
          '<div class="quantum-timeline">',
            '<div class="quantum-timeline-labels"><span>Töredezett állapot</span><span>Ellenőrzött állapot</span></div>',
            '<input type="range" min="0" max="100" value="52" aria-label="Rendszerállapot átalakításának mértéke">',
          '</div>',
        '</div>',
      '</div>',
      '<aside class="quantum-panel" aria-label="FormatX munkafolyamat">',
        '<span class="quantum-panel-label">Műveleti intelligencia</span>',
        '<h3>FormatX kontrollrétegek</h3>',
        '<div class="quantum-state-list">',
          '<div class="quantum-state active" data-qt-state="0"><i>01</i><div><strong>Felderítés</strong><span>Hardver, meghajtók és kockázatok azonosítása.</span></div></div>',
          '<div class="quantum-state" data-qt-state="1"><i>02</i><div><strong>Tervezés</strong><span>Műveleti terv, partíciók és ellenőrzések.</span></div></div>',
          '<div class="quantum-state" data-qt-state="2"><i>03</i><div><strong>Végrehajtás</strong><span>Kontrollált műveletek és élő visszajelzés.</span></div></div>',
          '<div class="quantum-state" data-qt-state="3"><i>04</i><div><strong>Ellenőrzés</strong><span>Integritás, naplózás és visszaigazolás.</span></div></div>',
        '</div>',
      '</aside>',
    '</div>',
  ].join('');

  hero.insertAdjacentElement('afterend', section);

  const slider = section.querySelector('input[type="range"]');
  const canvas = section.querySelector('canvas');
  const context = canvas.getContext('2d', { alpha: true });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const appMode = new URLSearchParams(window.location.search).get('app') === 'android'
    || /FormatXAndroid\//.test(navigator.userAgent);
  const nodes = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let progress = Number(slider.value) / 100;

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    buildNodes();
    draw();
  }

  function buildNodes() {
    nodes.length = 0;
    const count = appMode ? 30 : 48;
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const radius = 0.19 + ((index * 17) % 31) / 100;
      nodes.push({
        angle: angle,
        radius: radius,
        drift: ((index * 13) % 9 - 4) * 0.0014,
        size: 1.6 + (index % 4) * 0.7,
        phase: (index % 7) * 0.41,
      });
    }
  }

  function interpolate(metricStart, metricEnd) {
    return Math.round(metricStart + (metricEnd - metricStart) * progress);
  }

  function setMetric(name, value) {
    const number = section.querySelector('[data-qt-' + name + ']');
    const bar = section.querySelector('[data-qt-bar="' + name + '"]');
    if (number) number.textContent = value + '%';
    if (bar) bar.style.setProperty('--value', value + '%');
  }

  function updateInterface() {
    progress = clamp(Number(slider.value) / 100, 0, 1);
    const integrity = interpolate(42, 99);
    const stability = interpolate(36, 97);
    const clarity = interpolate(31, 96);
    const risk = interpolate(78, 4);
    const score = interpolate(38, 99);

    setMetric('integrity', integrity);
    setMetric('stability', stability);
    setMetric('clarity', clarity);
    setMetric('risk', risk);
    section.querySelector('[data-qt-score]').textContent = score;
    section.querySelector('[data-qt-signature]').textContent =
      'FX-TWIN://STATE-' + String(Math.round(progress * 100)).padStart(2, '0') + '/SHA256-LOCAL/NO-TELEMETRY';

    const activeIndex = Math.min(3, Math.floor(progress * 4));
    section.querySelectorAll('[data-qt-state]').forEach(function (item, index) {
      item.classList.toggle('active', index === activeIndex);
    });
    section.style.setProperty('--qt-progress', Math.round(progress * 100) + '%');
    draw();
  }

  function nodePosition(node, time) {
    const chaos = 1 - progress;
    const order = progress;
    const pulse = Math.sin(time * 0.001 + node.phase) * 8 * chaos;
    const angle = node.angle + time * node.drift * (0.25 + chaos);
    const baseRadius = Math.min(width, height) * node.radius;
    const orderedRadius = Math.min(width, height) * (0.22 + (node.radius % 0.18));
    const radius = baseRadius * chaos + orderedRadius * order + pulse;
    const offsetX = Math.sin(node.phase * 2.3 + time * 0.0007) * 42 * chaos;
    const offsetY = Math.cos(node.phase * 1.7 + time * 0.0005) * 34 * chaos;
    return {
      x: width / 2 + Math.cos(angle) * radius + offsetX,
      y: height / 2 + Math.sin(angle) * radius * 0.72 + offsetY,
    };
  }

  function draw(time) {
    if (!context || !width || !height) return;
    const now = typeof time === 'number' ? time : 0;
    context.clearRect(0, 0, width, height);

    const gradient = context.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.min(width, height) * 0.42);
    gradient.addColorStop(0, 'rgba(92, 225, 255, ' + (0.10 + progress * 0.18).toFixed(3) + ')');
    gradient.addColorStop(0.45, 'rgba(83, 86, 255, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    const positions = nodes.map(function (node) { return nodePosition(node, now); });
    const connectionDistance = 92 + progress * 54;

    for (let first = 0; first < positions.length; first += 1) {
      for (let second = first + 1; second < positions.length; second += 1) {
        const dx = positions[first].x - positions[second].x;
        const dy = positions[first].y - positions[second].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > connectionDistance) continue;
        const opacity = (1 - distance / connectionDistance) * (0.12 + progress * 0.32);
        context.strokeStyle = progress > 0.56
          ? 'rgba(78, 226, 255, ' + opacity.toFixed(3) + ')'
          : 'rgba(119, 101, 255, ' + opacity.toFixed(3) + ')';
        context.lineWidth = 0.7 + progress * 0.7;
        context.beginPath();
        context.moveTo(positions[first].x, positions[first].y);
        context.lineTo(positions[second].x, positions[second].y);
        context.stroke();
      }
    }

    positions.forEach(function (position, index) {
      const node = nodes[index];
      const glow = 4 + progress * 9;
      context.shadowBlur = glow;
      context.shadowColor = progress > 0.56 ? 'rgba(69, 227, 255, .75)' : 'rgba(155, 87, 255, .68)';
      context.fillStyle = index % 5 === 0 ? '#f3fbff' : (progress > 0.56 ? '#52e1ff' : '#9b6dff');
      context.beginPath();
      context.arc(position.x, position.y, node.size + progress * 0.7, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    });

    context.strokeStyle = 'rgba(83, 221, 255, ' + (0.18 + progress * 0.25).toFixed(3) + ')';
    context.lineWidth = 1.2;
    for (let ring = 0; ring < 3; ring += 1) {
      context.beginPath();
      context.ellipse(width / 2, height / 2, 72 + ring * 53 + progress * 8, 34 + ring * 27, 0, 0, Math.PI * 2);
      context.stroke();
    }
  }

  function animate(time) {
    draw(time);
    frame = window.requestAnimationFrame(animate);
  }

  slider.addEventListener('input', updateInterface, { passive: true });
  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(canvas);
  updateInterface();

  if (!reduceMotion && !appMode) frame = window.requestAnimationFrame(animate);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    } else if (!document.hidden && !reduceMotion && !appMode && !frame) {
      frame = window.requestAnimationFrame(animate);
    }
  });
}());
