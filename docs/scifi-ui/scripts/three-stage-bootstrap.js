(function () {
  'use strict';

  /* The shared Float32Array is created in the parent window realm. */
  Object.defineProperty(Float32Array, Symbol.hasInstance, {
    configurable: true,
    value: function (candidate) {
      return Boolean(candidate && ArrayBuffer.isView(candidate) && candidate.BYTES_PER_ELEMENT === 4);
    }
  });
}());
