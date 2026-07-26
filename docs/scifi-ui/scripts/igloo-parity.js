(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxTranscendLoader === 'ready') return;
  root.dataset.fxTranscendLoader = 'ready';

  const queue = [
    './scripts/formatx-transcend-bridge.js?v=20260726-transcend-1',
    './scripts/formatx-transcend.js?v=20260726-transcend-1'
  ];

  function load(index) {
    if (index >= queue.length) return;
    const script = document.createElement('script');
    script.src = queue[index];
    script.async = false;
    script.dataset.fxTranscendModule = String(index);
    script.addEventListener('load', function () { load(index + 1); }, { once: true });
    script.addEventListener('error', function () {
      root.dataset.fxTranscendLoader = 'error';
      console.warn('FormatX Transcend module failed to load:', queue[index]);
    }, { once: true });
    document.head.appendChild(script);
  }

  load(0);
}());