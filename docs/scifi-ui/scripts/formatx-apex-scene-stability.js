(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxApexSceneStability === 'ready-v3') return;

  function ensureMobileCompositionStyle() {
    if (document.querySelector('link[data-fx-mobile-apex-composition]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/formatx-mobile-apex-composition.css?v=20260808-core-mobile-1';
    link.dataset.fxMobileApexComposition = 'true';
    link.addEventListener('load', () => {
      root.dataset.fxMobileApexComposition = 'ready-v1';
    }, { once: true });
    link.addEventListener('error', () => {
      root.dataset.fxMobileApexComposition = 'failed';
    }, { once: true });
    document.head.appendChild(link);
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
  let referenceShaderPatched = false;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smoothstep = value => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };

  function referenceCrystalShader(source) {
    let next = source;

    next = next.replace(
      "float lobes=pow(abs(cos(2.*a)),.48);\n        float radial=radius*mix(.56,1.,lobes);",
      "float axis=pow(abs(cos(2.*a)),4.8);\n        float shoulder=pow(abs(cos(2.*a)),1.15);\n        float lobes=mix(axis,shoulder,.18);\n        float radial=radius*mix(.255,1.,lobes);"
    );

    next = next.replace(
      "q.xz*=rot(sin(uTime*.13)*.105+uPointer.x*.045);\n        q.yz*=rot(cos(uTime*.15)*.065+uPointer.y*.04);",
      "q.xz*=rot(sin(uTime*.13)*.052+uPointer.x*.030);\n        q.yz*=rot(cos(uTime*.15)*.038+uPointer.y*.028);"
    );

    next = next.replace(
      "crystal.y/=1.16;\n        float shell=starPrism(crystal,1.43*pulse,.32,.032);\n        shell+=(fbm(crystal*4.6)-.5)*.014;",
      "crystal.y/=1.08;\n        float shell=starPrism(crystal,1.48*pulse,.205,.014);\n        shell+=(fbm(crystal*5.2)-.5)*.006;"
    );

    next = next.replace(
      "float nucleus=sphere(q,.215+sin(uTime*2.2)*.018);",
      "float nucleus=sphere(q,.265+sin(uTime*2.2)*.020);"
    );

    next = next.replace(
      "float angle=mix(-.035+sin(uTime*.11)*.022,travelAngle,1.-coreWeight);",
      "float angle=mix(-.012+sin(uTime*.11)*.012,travelAngle,1.-coreWeight);"
    );

    next = next.replace(
      "float radius=mix(6.02,travelRadius,1.-coreWeight);",
      "float radius=mix(5.68,travelRadius,1.-coreWeight);"
    );

    next = next.replace(
      "float focal=mix(1.92,1.72,1.-coreWeight);",
      "float focal=mix(1.96,1.72,1.-coreWeight);"
    );

    next = next.replace(
      "float halo=exp(-3.2*coreDistance)*coreWeight;\n        float cross=(exp(-abs(uv.x)*105.)+exp(-abs(uv.y)*82.))*exp(-coreDistance*2.45)*coreWeight;\n        float auraRings=(exp(-abs(coreDistance-.125)*72.)+exp(-abs(coreDistance-.205)*58.)*.7+exp(-abs(coreDistance-.292)*48.)*.42)*coreWeight;\n        c+=halo*vec3(.038,.24,.38);\n        c+=cross*vec3(.12,.58,.88)*.31;\n        c+=auraRings*mix(vec3(.04,.38,.64),vec3(.36,.10,.72),sat(uScroll*.5))*.18;",
      "float halo=exp(-3.0*coreDistance)*coreWeight;\n        float coreOrb=exp(-coreDistance*17.5)*coreWeight;\n        float cross=(exp(-abs(uv.x)*118.)+exp(-abs(uv.y)*92.))*exp(-coreDistance*2.35)*coreWeight;\n        float auraRings=(exp(-abs(coreDistance-.118)*78.)+exp(-abs(coreDistance-.198)*62.)*.78+exp(-abs(coreDistance-.286)*50.)*.48)*coreWeight;\n        float waterMask=smoothstep(.30,.92,-uv.y)*coreWeight;\n        float waterRipple=.5+.5*sin(uv.y*145.+sin(uv.x*11.)*1.8+uTime*.32);\n        float reflectedCore=exp(-abs(uv.x)*4.4)*exp(-abs(uv.y+.62)*3.3)*waterMask;\n        c+=halo*vec3(.040,.28,.44);\n        c+=coreOrb*vec3(.40,1.05,1.42)*.62;\n        c+=cross*vec3(.16,.72,1.08)*.40;\n        c+=auraRings*mix(vec3(.05,.46,.78),vec3(.48,.12,.82),sat(uScroll*.5))*.24;\n        c+=waterMask*vec3(.010,.080,.135)*(.10+.11*waterRipple);\n        c+=reflectedCore*vec3(.05,.32,.50)*.22;"
    );

    next = next.replace(
      "c=mix(refl,base,.49+d*.16);\n            c+=f*vec3(.26,.86,1.30)*1.18;\n            c+=crystal*vec3(.09,.35,.54);\n            c+=pow(max(dot(n,key),0.),10.)*vec3(.72,1.0,1.18)*.82;",
      "c=mix(refl,base,.40+d*.13);\n            c+=f*vec3(.30,.96,1.44)*1.48;\n            c+=crystal*vec3(.08,.30,.48);\n            float facetAngle=atan(p.y,p.x);\n            float facetRadius=length(p.xy);\n            float veins=pow(.5+.5*cos(facetAngle*8.+facetRadius*11.-uTime*.10),18.);\n            c+=veins*vec3(.10,.52,.84)*(.10+.28*f);\n            c+=pow(max(dot(n,key),0.),12.)*vec3(.82,1.08,1.26)*.96;"
    );

    next = next.replace(
      "if(id>6.5&&id<7.5)c+=vec3(.42,1.02,1.42)*(1.25+pulse);",
      "if(id>6.5&&id<7.5)c+=vec3(.58,1.22,1.62)*(1.48+pulse*1.22);\n          c+=coreOrb*vec3(.30,.92,1.32)*.34;"
    );

    return next;
  }

  Context.prototype.shaderSource = function patchedShaderSource(shader, source) {
    if (
      !referenceShaderPatched
      && typeof source === 'string'
      && source.includes('float starPrism(vec3 p')
      && source.includes('uniform float uScene;')
      && source.includes('WEBGL2') === false
    ) {
      const patched = referenceCrystalShader(source);
      if (patched !== source && patched.includes('pow(abs(cos(2.*a)),4.8)')) {
        referenceShaderPatched = true;
        root.dataset.fxApexReferenceShader = 'reference-crystal-v4';
        source = patched;
        queueMicrotask(() => {
          if (Context.prototype.shaderSource === patchedShaderSource) {
            Context.prototype.shaderSource = originalShaderSource;
          }
        });
      } else {
        root.dataset.fxApexReferenceShader = 'patch-miss';
      }
    }
    return originalShaderSource.call(this, shader, source);
  };

  function refreshSections() {
    sections = Array.from(document.querySelectorAll('main > .scene'));
  }

  function mappedScene() {
    if (sections.length < 2) refreshSections();
    if (!sections.length) return 0;

    const probe = scrollY + innerHeight * 0.18;
    if (probe <= sections[0].offsetTop) return 0;

    for (let index = 0; index < sections.length - 1; index += 1) {
      const start = sections[index].offsetTop;
      const end = sections[index + 1].offsetTop;
      if (probe >= end) continue;

      const span = Math.max(1, end - start);
      const raw = clamp((probe - start) / span, 0, 1);
      const morph = smoothstep((raw - 0.38) / 0.50);
      return index + morph;
    }

    return Math.max(0, sections.length - 1);
  }

  Context.prototype.getUniformLocation = function patchedGetUniformLocation(program, name) {
    const location = originalGetUniformLocation.call(this, program, name);
    if (
      location
      && name === 'uScene'
      && this.canvas instanceof HTMLCanvasElement
      && this.canvas.dataset.fxNativeApexCanvas === 'true'
    ) {
      sceneLocations.add(location);
    }
    return location;
  };

  Context.prototype.uniform1f = function patchedUniform1f(location, value) {
    if (location && sceneLocations.has(location)) {
      const target = mappedScene();
      if (smoothedScene === null || Math.abs(target - smoothedScene) > 2.25) {
        smoothedScene = target;
      } else {
        smoothedScene += (target - smoothedScene) * 0.115;
      }
      root.dataset.fxApexMappedScene = smoothedScene.toFixed(3);
      return originalUniform1f.call(this, location, smoothedScene);
    }
    return originalUniform1f.call(this, location, value);
  };

  addEventListener('resize', refreshSections, { passive: true });
  addEventListener('orientationchange', refreshSections, { passive: true });
  addEventListener('formatx:loop', () => { smoothedScene = null; });
  addEventListener('formatx:nativeapexready', () => {
    if (root.dataset.fxApexReferenceShader === 'reference-crystal-v4') {
      root.dataset.fxNativeApexVisual = 'reference-crystal-v4';
      root.dataset.fxNativeApexRenderer = 'webgl2-reference-crystal-sdf';
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshSections, { once: true });
  } else {
    refreshSections();
  }

  root.dataset.fxApexSceneStability = 'ready-v3';
  root.dataset.fxCoreHold = 'stable-before-morph';
  root.dataset.fxCoreMobileComposition = 'native-reference-framing-v4';
}());
