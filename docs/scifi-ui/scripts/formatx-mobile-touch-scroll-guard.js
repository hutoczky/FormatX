// Mobile touch routing guard for the FormatX 3D host.
// One-finger touch is reserved for native page scrolling.
(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxMobileTouchGuard === 'ready') return;

  const coarsePointer = matchMedia('(pointer: coarse), (max-width: 900px)').matches;
  if (!coarsePointer) {
    root.dataset.fxMobileTouchGuard = 'desktop-skip';
    return;
  }

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

  const restoreNativeMethods = () => {
    window.addEventListener = nativeAdd;
    window.removeEventListener = nativeRemove;
    observer.disconnect();
  };

  const observer = new MutationObserver(() => {
    if (root.dataset.fxThreeHost === 'ready') restoreNativeMethods();
  });
  observer.observe(root, { attributes: true, attributeFilter: ['data-fx-three-host'] });

  root.style.setProperty('touch-action', 'pan-y pinch-zoom', 'important');
  if (document.body) document.body.style.setProperty('touch-action', 'pan-y pinch-zoom', 'important');
  root.dataset.fxMobileTouchGuard = 'ready';
}());
