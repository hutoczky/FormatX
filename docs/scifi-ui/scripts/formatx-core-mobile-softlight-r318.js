(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxCoreSoftlightR318) return;

  const mobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  if (!mobile) {
    root.dataset.fxCoreSoftlightR318 = 'desktop-skip';
    return;
  }

  const TARGET = 'float fres=pow(1.0-sat(abs(dot(N,V))),2.65);';
  const patched = [];

  function tune(source) {
    if (typeof source !== 'string' || !source.includes(TARGET)) return source;

    let next = source;
    next = next.replace(
      TARGET,
      'float fres=pow(1.0-sat(abs(dot(N,V))),3.15);'
    );
    next = next.replace(
      'float facetEdge=1.0-smoothstep(0.010,0.047,bary);',
      'float facetEdge=1.0-smoothstep(0.014,0.072,bary);'
    );
    next = next.replace(
      'col+=mix(cyan,ice,0.42)*facetEdge*(0.018+0.060*fres);',
      'col+=mix(cyan,ice,0.42)*facetEdge*(0.010+0.034*fres);'
    );
    next = next.replace(
      'float outer=1.0-smoothstep(0.025,0.095,abs(1.0-r));',
      'float outer=1.0-smoothstep(0.018,0.068,abs(1.0-r));'
    );
    next = next.replace(
      'col+=cyan*outer*(0.32+0.36*fres)+ice*outer*0.12+violet*outer*(0.05+0.13*spectral);',
      'col+=cyan*outer*(0.20+0.22*fres)+ice*outer*0.07+violet*outer*(0.035+0.08*spectral);'
    );
    next = next.replace(
      'col+=mix(cyan,violet,spectral)*fres*(0.24+0.26*thickness);',
      'col+=mix(cyan,violet,spectral)*fres*(0.16+0.18*thickness);'
    );
    next = next.replace(
      'float alpha=0.30+0.25*thickness+0.26*fres+0.11*nd1+0.12*outer+0.12*core+0.13*glint;',
      'float alpha=0.30+0.25*thickness+0.20*fres+0.11*nd1+0.07*outer+0.12*core+0.13*glint;'
    );

    if (next !== source) {
      root.dataset.fxCoreSoftlightR318 = 'shader-tuned';
      root.dataset.fxCoreRimProfileR318 = 'narrower-softer-fresnel';
      root.dataset.fxCoreGlowProfileR318 = 'reduced-mobile-perimeter';
    }
    return next;
  }

  function patchPrototype(proto) {
    if (!proto || typeof proto.shaderSource !== 'function') return;
    const original = proto.shaderSource;
    if (original.__fxSoftlightR318) return;

    function shaderSource(shader, source) {
      return original.call(this, shader, tune(source));
    }
    shaderSource.__fxSoftlightR318 = true;
    shaderSource.__fxOriginal = original;
    proto.shaderSource = shaderSource;
    patched.push([proto, original]);
  }

  patchPrototype(window.WebGLRenderingContext?.prototype);
  patchPrototype(window.WebGL2RenderingContext?.prototype);

  if (!patched.length) {
    root.dataset.fxCoreSoftlightR318 = 'webgl-api-unavailable';
    return;
  }

  root.dataset.fxCoreSoftlightR318 = 'armed';

  function restore() {
    for (const [proto, original] of patched) {
      if (proto.shaderSource?.__fxSoftlightR318) proto.shaderSource = original;
    }
    if (root.dataset.fxCoreSoftlightR318 === 'armed') {
      root.dataset.fxCoreSoftlightR318 = 'armed-no-match';
    }
  }

  addEventListener('formatx:real3dready', () => setTimeout(restore, 0), { once: true });
  setTimeout(restore, 8000);
}());
