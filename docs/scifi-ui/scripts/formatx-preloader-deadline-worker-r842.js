'use strict';

self.addEventListener('message', event => {
  const data = event.data || {};
  const delay = Math.max(0, Number(data.delay) || 0);
  const token = String(data.token || '');
  setTimeout(() => {
    self.postMessage({ token });
  }, delay);
});
