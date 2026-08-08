(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxApexSceneStability === 'ready-v13') return;

  function ensureMobileCompositionStyle() {
    if (document.querySelector('link[data-fx-mobile-apex-composition]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/formatx-mobile-apex-composition.css?v=20260808-core-mobile-1';
    link.dataset.fxMobileApexComposition = 'true';
    link.addEventListener('load', () => { root.dataset.fxMobileApexComposition = 'ready-v1'; }, { once: true });
    link.addEventListener('error', () => { root.dataset.fxMobileApexComposition = 'failed'; }, { once: true });
    document.head.appendChild(link);
  }

  function ensureTrueMeshAssets() {
    if (!document.querySelector('link[data-fx-core-mesh3d-style]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './styles/formatx-core-mesh3d.css?v=20260808-true-mesh3d-v5';
      link.dataset.fxCoreMesh3dStyle = 'true';
      link.addEventListener('load', () => { root.dataset.fxCoreMesh3dStyle = 'ready'; }, { once: true });
      link.addEventListener('error', () => { root.dataset.fxCoreMesh3dStyle = 'failed'; }, { once: true });
      document.head.appendChild(link);
    }
    if (document.querySelector('script[data-fx-core-mesh3d-runtime]')) return;
    const script = document.createElement('script');
    script.src = './scripts/formatx-core-mesh3d-v5.js?v=20260808-true-mesh3d-v5';
    script.async = false;
    script.dataset.fxCoreMesh3dRuntime = 'true';
    script.addEventListener('load', () => { root.dataset.fxCoreMesh3dLoad = 'ready-v5'; }, { once: true });
    script.addEventListener('error', () => { root.dataset.fxCoreMesh3dLoad = 'failed'; }, { once: true });
    document.head.appendChild(script);
  }

  ensureMobileCompositionStyle();

  const Context = window.WebGL2RenderingContext;
  if (!Context || !Context.prototype) {
    root.dataset.fxApexSceneStability = 'webgl2-unavailable';
    return;
  }

  const originalShaderSource = Context.prototype.shaderSource;
  const originalGetUniformLocation = Context.prototype.getUniformLocation;
  const originalUniform1f = Context.prototype.uniform1f;
  const sceneLocations = new WeakSet();
  let sections = [];
  let smoothedScene = null;
  let shaderPatched = false;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smoothstep = value => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };

  function referenceMeshBackgroundShader(source) {
    let next = source;
    next = next.replace(
      "vec2 core(vec3 p){\n        vec3 q=p;",
      "vec2 core(vec3 p){\n        if(uScene<.92)return vec2(10.,1.);\n        vec3 q=p;"
    );
    next = next.replace(
      "float angle=mix(-.035+sin(uTime*.11)*.022,travelAngle,1.-coreWeight);",
      "float angle=mix(.014+sin(uTime*.11)*.014,travelAngle,1.-coreWeight);"
    );
    next = next.replace(
      "float radius=mix(6.02,travelRadius,1.-coreWeight);",
      "float radius=mix(5.88,travelRadius,1.-coreWeight);"
    );
    next = next.replace(
      "float focal=mix(1.92,1.72,1.-coreWeight);",
      "float focal=mix(1.99,1.72,1.-coreWeight);"
    );
    next = next.replace(
      "float halo=exp(-3.2*coreDistance)*coreWeight;\n        float cross=(exp(-abs(uv.x)*105.)+exp(-abs(uv.y)*82.))*exp(-coreDistance*2.45)*coreWeight;\n        float auraRings=(exp(-abs(coreDistance-.125)*72.)+exp(-abs(coreDistance-.205)*58.)*.7+exp(-abs(coreDistance-.292)*48.)*.42)*coreWeight;\n        c+=halo*vec3(.038,.24,.38);\n        c+=cross*vec3(.12,.58,.88)*.31;\n        c+=auraRings*mix(vec3(.04,.38,.64),vec3(.36,.10,.72),sat(uScroll*.5))*.18;",
      "float meshBeatA=.5+.5*sin(uTime*1.55);\n        float meshBeatB=.5+.5*sin(uTime*3.10-.78);\n        float meshHeart=pow(meshBeatA,4.)*.72+pow(meshBeatB,9.)*.28;\n        float halo=exp(-3.12*coreDistance)*coreWeight;\n        float hotCore=exp(-coreDistance*39.)*coreWeight*(1.0+meshHeart*.88);\n        float reactor1=exp(-abs(coreDistance-.050)*132.)*coreWeight;\n        float reactor2=exp(-abs(coreDistance-.090)*112.)*coreWeight;\n        float reactor3=exp(-abs(coreDistance-.145)*86.)*coreWeight;\n        float waveRadius=.125+meshHeart*.045;\n        float pulseWave=exp(-abs(coreDistance-waveRadius)*70.)*coreWeight;\n        float cross=(exp(-abs(uv.x)*148.)+exp(-abs(uv.y)*122.))*exp(-coreDistance*2.25)*coreWeight*(.92+meshHeart*.62);\n        float auraRings=(exp(-abs(coreDistance-.24)*62.)*.32+exp(-abs(coreDistance-.34)*50.)*.20)*coreWeight;\n        float waterMask=smoothstep(.33,.96,-uv.y)*coreWeight;\n        float waterRipple=.5+.5*sin(uv.y*158.+sin(uv.x*12.5)*1.8+uTime*.27);\n        float reflectedCore=exp(-abs(uv.x)*5.2)*exp(-abs(uv.y+.61)*3.7)*waterMask;\n        c+=halo*vec3(.018,.14,.25);\n        c+=hotCore*vec3(1.34,2.24,2.70)*1.26;\n        c+=(reactor1*1.20+reactor2*.92+reactor3*.68)*vec3(.16,.94,1.42);\n        c+=pulseWave*vec3(.15,.92,1.38)*(.16+meshHeart*.32);\n        c+=cross*vec3(.22,.86,1.26)*.44;\n        c+=auraRings*mix(vec3(.08,.46,.80),vec3(.54,.14,.96),sat(uScroll*.5))*.22;\n        c+=waterMask*vec3(.008,.070,.120)*(.07+.10*waterRipple);\n        c+=reflectedCore*vec3(.04,.31,.52)*.18;"
    );
    return next;
  }

  Context.prototype.shaderSource = function patchedShaderSource(shader, source) {
    if (!shaderPatched && typeof source === 'string' && source.includes('vec2 core(vec3 p)') && source.includes('uniform float uScene;')) {
      const patched = referenceMeshBackgroundShader(source);
      const complete = [
        'if(uScene<.92)return vec2(10.,1.)',
        'float hotCore=exp(-coreDistance*39.)',
        'float reactor1=exp(-abs(coreDistance-.050)*132.)',
        'float pulseWave=exp(-abs(coreDistance-waveRadius)*70.)',
        'float angle=mix(.014+sin(uTime*.11)*.014',
      ].every(marker => patched.includes(marker));
      if (patched !== source && complete) {
        shaderPatched = true;
        root.dataset.fxApexReferenceShader = 'reference-mesh3d-background-v14';
        root.dataset.fxSdfCore = 'disabled-before-scene-0.92';
        source = patched;
        queueMicrotask(() => {
          if (Context.prototype.shaderSource === patchedShaderSource) Context.prototype.shaderSource = originalShaderSource;
        });
      } else root.dataset.fxApexReferenceShader = 'patch-miss';
    }
    return originalShaderSource.call(this, shader, source);
  };

  function refreshSections() { sections = Array.from(document.querySelectorAll('main > .scene')); }
  function mappedScene() {
    if (sections.length < 2) refreshSections();
    if (!sections.length) return 0;
    const probe = scrollY + innerHeight * 0.18;
    if (probe <= sections[0].offsetTop) return 0;
    for (let index = 0; index < sections.length - 1; index += 1) {
      const start = sections[index].offsetTop, end = sections[index + 1].offsetTop;
      if (probe >= end) continue;
      const raw = clamp((probe - start) / Math.max(1, end - start), 0, 1);
      return index + smoothstep((raw - 0.38) / 0.50);
    }
    return Math.max(0, sections.length - 1);
  }

  Context.prototype.getUniformLocation = function patchedGetUniformLocation(program, name) {
    const location = originalGetUniformLocation.call(this, program, name);
    if (location && name === 'uScene' && this.canvas instanceof HTMLCanvasElement && this.canvas.dataset.fxNativeApexCanvas === 'true') sceneLocations.add(location);
    return location;
  };
  Context.prototype.uniform1f = function patchedUniform1f(location, value) {
    if (location && sceneLocations.has(location)) {
      const target = mappedScene();
      if (smoothedScene === null || Math.abs(target - smoothedScene) > 2.25) smoothedScene = target;
      else smoothedScene += (target - smoothedScene) * 0.115;
      root.dataset.fxApexMappedScene = smoothedScene.toFixed(3);
      return originalUniform1f.call(this, location, smoothedScene);
    }
    return originalUniform1f.call(this, location, value);
  };

  addEventListener('resize', refreshSections, { passive: true });
  addEventListener('orientationchange', refreshSections, { passive: true });
  addEventListener('formatx:loop', () => { smoothedScene = null; });
  addEventListener('formatx:nativeapexready', ensureTrueMeshAssets, { once: true });
  addEventListener('formatx:coremesh3dready', event => {
    const version = event.detail?.version;
    root.dataset.fxNativeApexVisual = version === 'v5'
      ? 'reference-bright-faceted-true-mesh3d-v14'
      : version === 'v4'
        ? 'reference-faceted-true-mesh3d-v13'
        : version === 'v3'
          ? 'reference-luminous-true-mesh3d-v12'
          : version === 'v2'
            ? 'reference-calibrated-true-mesh3d-v11'
            : 'reference-locked-true-mesh3d-v10';
    root.dataset.fxNativeApexRenderer = 'webgl2-indexed-mesh-plus-apex-background';
    root.dataset.fxCoreMobileComposition = root.dataset.fxNativeApexVisual;
  });

  if (root.dataset.fxNativeApex === 'ready') ensureTrueMeshAssets();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refreshSections, { once: true });
  else refreshSections();

  root.dataset.fxApexSceneStability = 'ready-v13';
  root.dataset.fxCoreHold = 'stable-before-morph';
  root.dataset.fxCoreMobileComposition = 'true-mesh3d-v5-pending';
}());