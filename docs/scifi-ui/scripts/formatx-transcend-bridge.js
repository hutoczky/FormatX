(function () {
  'use strict';

  const root = document.documentElement;

  // Mobile routing must be installed before formatx-three-host.js registers
  // its pointer listeners. One-finger touch is reserved for native scrolling.
  if (matchMedia('(pointer: coarse), (max-width: 900px)').matches && root.dataset.fxMobileTouchGuard !== 'ready') {
    const nativeAdd = window.addEventListener;
    const nativeRemove = window.removeEventListener;
    const wrappedListeners = new WeakMap();
    const guardedNames = new Set(['onPointerDown', 'onPointerMove', 'releasePointer']);
    const guardedTypes = new Set(['pointerdown', 'pointermove', 'pointerup', 'pointercancel']);

    window.addEventListener = function guardedAddEventListener(type, listener, options) {
      if (guardedTypes.has(type) && typeof listener === 'function' && guardedNames.has(listener.name)) {
        const wrapped = function formatXMobileTouchFilter(event) {
          if (event && event.pointerType === 'touch') return;
          return listener.call(this, event);
        };
        wrappedListeners.set(listener, wrapped);
        return nativeAdd.call(this, type, wrapped, options);
      }
      return nativeAdd.call(this, type, listener, options);
    };

    window.removeEventListener = function guardedRemoveEventListener(type, listener, options) {
      return nativeRemove.call(this, type, wrappedListeners.get(listener) || listener, options);
    };

    const observer = new MutationObserver(() => {
      if (root.dataset.fxThreeHost !== 'ready') return;
      window.addEventListener = nativeAdd;
      window.removeEventListener = nativeRemove;
      observer.disconnect();
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-fx-three-host'] });

    root.style.setProperty('touch-action', 'pan-y pinch-zoom', 'important');
    if (document.body) document.body.style.setProperty('touch-action', 'pan-y pinch-zoom', 'important');
    root.dataset.fxMobileTouchGuard = 'ready';
  }

  const legacyCanvas = document.getElementById('fx-apex-canvas');
  if (legacyCanvas) {
    legacyCanvas.width = 1;
    legacyCanvas.height = 1;
    legacyCanvas.hidden = true;
  }

  const legacyParticle = document.getElementById('fx-particle-canvas');
  if (legacyParticle) {
    legacyParticle.width = 1;
    legacyParticle.height = 1;
    legacyParticle.hidden = true;
  }

  document.querySelectorAll('.loop-toggle,.scene-loop-clone,.fx-transcend-loop-bridge').forEach(node => {
    node.remove();
  });

  const languageObserver = new MutationObserver(entries => {
    if (entries.some(entry => entry.attributeName === 'lang')) {
      document.dispatchEvent(new CustomEvent('formatx:languagechange'));
    }
  });
  languageObserver.observe(root, { attributes: true, attributeFilter: ['lang'] });

  addEventListener('pagehide', () => languageObserver.disconnect(), { once: true });

  root.dataset.fxQrVisibility = 'direct-data-url';
  root.dataset.fxLegacyRenderer = 'retired';
  root.dataset.fxRenderer = 'three-host';
}());
