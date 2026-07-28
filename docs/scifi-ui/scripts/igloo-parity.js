(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxTranscendLoader === 'ready') return;
  root.dataset.fxTranscendLoader = 'ready';

  const qrData = {
    'business_lite-huf': [49, 'AAAAAAAAAAAAAAAAD+RtRXy/hBGfhSyQQuqTx/tLoXWk34410LqEj8Y66EFL1HbBBD+qqqqq/gAYrxHTAAvmCv5yPgCKg+KQRMMrow/2/cFKn7Hz+8DnnGuXRQgy4u0HzvwRp4r5fJgbHMoFUf4JPl74FwSBgrQS9OZBCvV+pcvB+GQhPanQ/91vw3+4XF6MaYx0NqQSuH6sERkhGZEfDf68/HP8A0Gl+ryTQ1+/qIDwQDOeP/0t8C+llOEKkAqk8e/BHDaxcho6VBkyVj+abwxrbZhyNALi/dp0oEAsWpGm4MDyX6UbtOCaoa+gL+gAQHRLjHQ/iI6uXqwQU68Vkx8Lqvb8c/wF15COOhDC66V5w/HBBNqYMalA/oczhy8QAAAAAAAAAAAAAAAAAA=='],
    'business_lite-eur': [49, 'AAAAAAAAAAAAAAAAD+RVRXy/hBGbhSyQQuqVx/tLoXWk34410LqEj8Y66EFr1HbBBD+qqqqq/gAUrxHTAAvhiv5yPgCKQ+KQRMMr4w/2/cFCj7Hz+8DrnGuXRQgw4u0Hzvwzpor5fNgLHMoFUf4PPn74FwSDAqAS9OZBCvF+pcvB2GQhPanQ/91vw3+4XF6MaYx0NrwSuH6sER0hGZEfDfq8/HP8A07l+ryTQ12/qIDwQDCuP/0t8C+llOEKkAqk8e/BHBaxcho6VBkylj+abwmrTZhyJABC5dp0o0AsWpGm4cDyXaUbtOCaoa+gL+gAQHRLjHQ/mJauXqwQU68Vkx8LrXL8c/wF1JKOOhDC68V5w/HBBNqYMalA/oczhy8QAAAAAAAAAAAAAAAAAA=='],
    'business_pro-huf': [49, 'AAAAAAAAAAAAAAAAD+QFRXi/hBOahe6QQuuIRn9LoXUo34410LrID8c66EFfZHZhBD+qqqqq/gAdgxGxAAvijP5iPgDMgcK4xMEL40fkncDKK4Lf+cAfiXMBRAgKzGKDzvA3pAr6fJwLLyovWR4C5ldoEwWBpryStORCe2L/hNrAOyihPaHQz5Bvoz/4RGmsSQx0NqpqqH6sERgdGZEfDfo6/HP8A0Sn+rAzQVpeKIawQDLyP/E10PJqlPcCkBI2BefJHBbw1Rg+UBIj9/WebgvrVQxwPIfC8dz0q0AtWpin58DyWafZNOCbOE/BD6gAc9RrrHQ/lo6ubqwQWLcVkx8LrPD8U/wF1lGiPoDC6hV3wenBBNqYOalA/t3zgTMQAAAAAAAAAAAAAAAAAA=='],
    'business_pro-eur': [49, 'AAAAAAAAAAAAAAAAD+RFRXi/hBOShe6QQuuORn9LoXUo34410LrID8c66EF/ZHZhBD+qqqqq/gAdgxGxAAvmjP5iPgDPQcK4xMEL40fkncDSK4Lf+cAfiXMBRAgIzGKDzvA1pAr6fJwbL2ovWR4N5jdoEwWAJqiStOdC+2D/hNvAOiuhPaHQz5Bvoz/4RGmsSQx0NrJqqH6sERQdGZEfDfm6/HP8A0fn+rAzQVpeKIawQDPyP/E10PJqlPcCkBI2BefJHDbwVRg+UAojd/WebgPrNQxwPIJCzdz0q0AtXpin58DyW6fZNuCbOE/BD+gAc9RrrHQ/npaubqwQXLsVkx8LrPb8U/wF1lKiPoDC6lV3wenBBMqYOalA/t3zgTMQAAAAAAAAAAAAAAAAAA=='],
    'technician_team-huf': [49, 'AAAAAAAAAAAAAAAAD+DJp3S/hBM2mRyQQukNW45LoXTJPMI10LpcX7b66EFTHGdhBD+qqqqq/gAMRxCWAAluFv+VUABgmnyAJ0PdV1Il4aFY1tk85LDuCvC/p4BEZ5BE0vQFzD+5YIwQgVQnunMHt+61DVADbBlVKJCCG9aHRltgg2vmoRgQv6Wv/0+YdGB8akRMJrUytH6qBxh3FcEYDv9k/7z8h8yu5s1kQoxhNPF3QJu3nHcZAG8OyJLNkGhAMZ4GCCm4YdYCtgEwR4pRcgk0dem3LQbKA3gOQ8Ar2lFg/aDwcpoeKTCavO/578AAS3xsVEQ/kTa5ErwQW00dMRELpsv7b/2F1itBCk0C6bdBNjfhBCUfDfmA/pS0m05QAAAAAAAAAAAAAAAAAA=='],
    'technician_team-eur': [49, 'AAAAAAAAAAAAAAAAD+DJp3S/hBMymRyQQukNW45LoXTJPMI10LpcX7b66EFzHGdhBD+qqqqq/gAERxCWAAlrlv+VUABiWnyAJ0PdN1Il4aFAxtk85LDqCvC/p4BAZ5BE0nQXzL+5YOwQgRQnunMFt/61DVABbDVVKJCCG9CHRltggWvmoRgQv6Wv/0+YdGB8akRMJr0ytH6qBxh3FcEYDvjk/7z8h8fu5s1kQo4BNPF3QJuHnHcRAG8OyJLNkGhAMZ4GCCm54dYCthkwh4pRcgg0dem3LQTqA3gOQ8Ar3lFg/aDwcpoeKTCavO/578AAS3xsVEQ/kT65ErwQU0kdMRELo0/7b/2F1ylBCk0C6ddBNjfhBDUfDfmA/pS0m15QAAAAAAAAAAAAAAAAAA==']
  };

  const qrUrls = new Map();

  function qrUrl(key) {
    if (qrUrls.has(key)) return qrUrls.get(key);
    const entry = qrData[key];
    if (!entry) return '';
    const size = entry[0];
    const bytes = Uint8Array.from(atob(entry[1]), char => char.charCodeAt(0));
    const bit = index => (bytes[index >> 3] >> (7 - (index & 7))) & 1;
    let path = '';
    for (let y = 0; y < size; y += 1) {
      let x = 0;
      while (x < size) {
        if (!bit(y * size + x)) { x += 1; continue; }
        const start = x;
        while (x < size && bit(y * size + x)) x += 1;
        const width = x - start;
        path += 'M' + start + ' ' + y + 'h' + width + 'v1h-' + width + 'z';
      }
    }
    const quiet = 4;
    const total = size + quiet * 2;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total + '" shape-rendering="crispEdges"><rect width="' + total + '" height="' + total + '" fill="#fff"/><g transform="translate(' + quiet + ' ' + quiet + ')"><path d="' + path + '" fill="#07131c"/></g></svg>';
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    qrUrls.set(key, url);
    return url;
  }

  function qrKey(value) {
    const match = String(value || '').match(/assets\/qr\/(business_lite|business_pro|technician_team)-(huf|eur)\.svg/i);
    return match ? match[1].toLowerCase() + '-' + match[2].toLowerCase() : '';
  }

  function markReady(image) {
    const card = image.closest('[data-plan-qr]');
    if (!card) return;
    card.classList.remove('is-qr-loading', 'is-qr-error');
    card.classList.add('is-qr-ready');
  }

  function localizeImage(image, source) {
    if (!(image instanceof HTMLImageElement)) return false;
    const key = qrKey(source || image.getAttribute('src') || image.src);
    if (!key) return false;
    const local = qrUrl(key);
    image.onload = function () { markReady(image); };
    image.onerror = function () {
      const card = image.closest('[data-plan-qr]');
      if (!card) return;
      card.classList.remove('is-qr-loading', 'is-qr-ready');
      card.classList.add('is-qr-error');
    };
    if (image.src !== local) image.src = local;
    if (image.complete && image.naturalWidth > 0) markReady(image);
    return true;
  }

  const qrObserver = new MutationObserver(entries => {
    entries.forEach(entry => {
      if (entry.type === 'attributes') localizeImage(entry.target, entry.target.getAttribute('src'));
      entry.addedNodes.forEach(node => {
        if (node instanceof HTMLImageElement) localizeImage(node);
        if (node instanceof Element) node.querySelectorAll('img').forEach(image => localizeImage(image));
      });
    });
  });

  qrObserver.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });

  function replaceExistingQr() {
    const currency = document.querySelector('[data-currency][aria-pressed="true"]')?.dataset.currency === 'EUR' ? 'eur' : 'huf';
    document.querySelectorAll('[data-plan-qr]').forEach(card => {
      const image = card.querySelector('[data-plan-qr-image]');
      if (!image) return;
      card.classList.remove('is-qr-error');
      card.classList.add('is-qr-loading');
      image.src = qrUrl(card.dataset.planQr + '-' + currency);
      if (image.complete && image.naturalWidth > 0) markReady(image);
    });
  }

  root.dataset.fxLocalQr = 'ready';
  replaceExistingQr();
  document.addEventListener('click', event => {
    if (event.target.closest('[data-currency]')) setTimeout(replaceExistingQr, 0);
  });
  addEventListener('pageshow', replaceExistingQr);

  const queue = [
    './scripts/formatx-transcend-bridge.js?v=20260727-transcend-5',
    './scripts/formatx-three-host.js?v=20260727-audio-pro-1',
    './scripts/formatx-audio-repair.js?v=20260728-cinematic-v4',
    './scripts/formatx-professional-refinement.js?v=20260727-professional-1',
    './scripts/formatx-nextgen-controls.js?v=20260727-webgpu-1',
    './scripts/formatx-living-core-launcher.js?v=20260727-living-core-1',
    './scripts/formatx-three-frame-bootstrap.js?v=20260727-webgpu-1',
    './scripts/formatx-infinite-loop-fix.js?v=20260727-loop-1'
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
      console.warn('FormatX Three module failed to load:', queue[index]);
    }, { once: true });
    document.head.appendChild(script);
  }

  addEventListener('pagehide', function () {
    qrObserver.disconnect();
    qrUrls.clear();
  }, { once: true });

  load(0);
}());
