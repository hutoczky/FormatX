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
      'float fres=pow(1.0-sat(abs(dot(N,V))),3.45);'
    );
    next = next.replace(
      'float facetEdge=1.0-smoothstep(0.010,0.047,bary);',
      'float facetEdge=1.0-smoothstep(0.022,0.110,bary);'
    );
    next = next.replace(
      'col+=mix(cyan,ice,0.42)*facetEdge*(0.018+0.060*fres);',
      'col+=mix(cyan,ice,0.42)*facetEdge*(0.006+0.020*fres);'
    );
    next = next.replace(
      'float outer=1.0-smoothstep(0.025,0.095,abs(1.0-r));',
      'float outer=1.0-smoothstep(0.028,0.115,abs(1.0-r));'
    );
    next = next.replace(
      'col+=cyan*outer*(0.32+0.36*fres)+ice*outer*0.12+violet*outer*(0.05+0.13*spectral);',
      'col+=cyan*outer*(0.12+0.14*fres)+ice*outer*0.045+violet*outer*(0.020+0.050*spectral);'
    );
    next = next.replace(
      'col+=cyan*(core*0.46+coreHot*0.58)+ice*(coreHot*0.52+corePin*2.10)+violet*core*0.10;',
      'col+=cyan*(core*0.40+coreHot*0.46)+ice*(coreHot*0.42+corePin*1.70)+violet*core*0.08;'
    );
    next = next.replace(
      'col+=ice*glint*1.25+cyan*glint*0.36;',
      'col+=ice*glint*1.05+cyan*glint*0.28;'
    );
    next = next.replace(
      'col+=mix(cyan,violet,spectral)*fres*(0.24+0.26*thickness);',
      'col+=mix(cyan,violet,spectral)*fres*(0.11+0.12*thickness);'
    );
    next = next.replace(
      'float energy=0.94+uEnergy*0.22;',
      'float energy=0.90+uEnergy*0.18;'
    );
    next = next.replace(
      'float alpha=0.30+0.25*thickness+0.26*fres+0.11*nd1+0.12*outer+0.12*core+0.13*glint;',
      'float alpha=0.30+0.25*thickness+0.15*fres+0.11*nd1+0.045*outer+0.12*core+0.11*glint;'
    );

    if (next !== source) {
      root.dataset.fxCoreSoftlightR318 = 'shader-tuned-r319';
      root.dataset.fxCoreRimProfileR318 = 'broader-softer-low-intensity-fresnel';
      root.dataset.fxCoreGlowProfileR318 = 'balanced-mobile-perimeter-and-core';
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

  root.dataset.fxCoreSoftlightR318 = 'armed-r319';

  function restore() {
    for (const [proto, original] of patched) {
      if (proto.shaderSource?.__fxSoftlightR318) proto.shaderSource = original;
    }
    if (root.dataset.fxCoreSoftlightR318 === 'armed-r319') {
      root.dataset.fxCoreSoftlightR318 = 'armed-no-match-r319';
    }
  }

  addEventListener('formatx:real3dready', () => setTimeout(restore, 0), { once: true });
  setTimeout(restore, 8000);
}());