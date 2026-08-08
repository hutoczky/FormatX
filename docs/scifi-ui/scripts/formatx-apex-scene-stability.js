(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxApexSceneStability === 'ready-v5') return;

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

  function volumetricCrystalShader(source) {
    let next = source;

    next = next.replace(
      "float starPrism(vec3 p,float radius,float depth,float rounding){\n        float a=atan(p.y,p.x);\n        float lobes=pow(abs(cos(2.*a)),.48);\n        float radial=radius*mix(.56,1.,lobes);\n        float d2=length(p.xy)-radial;\n        float dz=abs(p.z)-depth;\n        vec2 w=vec2(d2,dz);\n        return min(max(w.x,w.y),0.)+length(max(w,0.))-rounding;\n      }",
      "float starPrism(vec3 p,float radius,float depth,float rounding){\n        vec2 ap=abs(p.xy);\n        float along=max(ap.x,ap.y);\n        float across=min(ap.x,ap.y);\n        float t=clamp(along/max(radius,.001),0.,1.);\n        float wing=radius*.46*max(0.,1.-pow(t,.66));\n        float concave=radius*(.014+.030*pow(1.-t,3.));\n        float halfWidth=max(concave,wing);\n        float zProfile=max(.022,depth*max(0.,1.-pow(t,1.42)));\n        float side=across-halfWidth;\n        float tip=along-radius;\n        float frontBack=abs(p.z)-zProfile;\n        float shell=max(max(side,tip),frontBack);\n        float facet=.012*(1.-t)*abs(sin(atan(p.y,p.x)*8.));\n        return shell-rounding+facet;\n      }"
    );

    next = next.replace(
      "q.xz*=rot(sin(uTime*.13)*.105+uPointer.x*.045);\n        q.yz*=rot(cos(uTime*.15)*.065+uPointer.y*.04);",
      "q.xz*=rot(.26+sin(uTime*.13)*.16+uPointer.x*.055);\n        q.yz*=rot(-.17+cos(uTime*.15)*.11+uPointer.y*.050);\n        q.xy*=rot(sin(uTime*.09)*.035);"
    );

    next = next.replace(
      "crystal.y/=1.16;\n        float shell=starPrism(crystal,1.43*pulse,.32,.032);\n        shell+=(fbm(crystal*4.6)-.5)*.014;",
      "crystal.y/=1.10;\n        float shell=starPrism(crystal,1.50*pulse,.58,.003);\n        shell+=(fbm(crystal*6.2)-.5)*.0035;"
    );

    next = next.replace(
      "float nucleus=sphere(q,.215+sin(uTime*2.2)*.018);",
      "float nucleus=sphere(q,.285+sin(uTime*2.2)*.022);"
    );

    next = next.replace(
      "vec3 ring=q;ring.yz*=rot(1.57079633);\n        result=unite(result,vec2(torus(ring,vec2(.62,.011)),5.));\n        ring=q;ring.yz*=rot(1.57079633);ring.xy*=rot(.36+uTime*.018);\n        result=unite(result,vec2(torus(ring,vec2(.83,.010)),5.));\n        ring=q;ring.yz*=rot(1.57079633);ring.xy*=rot(-.44-uTime*.016);\n        result=unite(result,vec2(torus(ring,vec2(1.08,.009)),6.));",
      "vec3 ring=q;ring.yz*=rot(1.57079633);ring.xz*=rot(.38+sin(uTime*.11)*.08);\n        result=unite(result,vec2(torus(ring,vec2(.64,.007)),5.));\n        ring=q;ring.xz*=rot(1.08+cos(uTime*.10)*.07);ring.xy*=rot(.30+uTime*.018);\n        result=unite(result,vec2(torus(ring,vec2(.87,.006)),5.));\n        ring=q;ring.xy*=rot(1.57079633);ring.yz*=rot(-.72+sin(uTime*.08)*.06);\n        result=unite(result,vec2(torus(ring,vec2(1.10,.006)),6.));"
    );

    next = next.replace(
      "float angle=mix(-.035+sin(uTime*.11)*.022,travelAngle,1.-coreWeight);",
      "float angle=mix(.18+sin(uTime*.11)*.065,travelAngle,1.-coreWeight);"
    );

    next = next.replace(
      "float radius=mix(6.02,travelRadius,1.-coreWeight);",
      "float radius=mix(5.92,travelRadius,1.-coreWeight);"
    );

    next = next.replace(
      "float focal=mix(1.92,1.72,1.-coreWeight);",
      "float focal=mix(1.88,1.72,1.-coreWeight);"
    );

    next = next.replace(
      "float halo=exp(-3.2*coreDistance)*coreWeight;\n        float cross=(exp(-abs(uv.x)*105.)+exp(-abs(uv.y)*82.))*exp(-coreDistance*2.45)*coreWeight;\n        float auraRings=(exp(-abs(coreDistance-.125)*72.)+exp(-abs(coreDistance-.205)*58.)*.7+exp(-abs(coreDistance-.292)*48.)*.42)*coreWeight;\n        c+=halo*vec3(.038,.24,.38);\n        c+=cross*vec3(.12,.58,.88)*.31;\n        c+=auraRings*mix(vec3(.04,.38,.64),vec3(.36,.10,.72),sat(uScroll*.5))*.18;",
      "float halo=exp(-3.15*coreDistance)*coreWeight;\n        float coreOrb=exp(-coreDistance*18.5)*coreWeight;\n        float cross=(exp(-abs(uv.x)*126.)+exp(-abs(uv.y)*98.))*exp(-coreDistance*2.45)*coreWeight;\n        float auraRings=(exp(-abs(coreDistance-.120)*84.)+exp(-abs(coreDistance-.202)*66.)*.72+exp(-abs(coreDistance-.292)*54.)*.44)*coreWeight;\n        float waterMask=smoothstep(.30,.94,-uv.y)*coreWeight;\n        float waterRipple=.5+.5*sin(uv.y*150.+sin(uv.x*12.)*1.9+uTime*.30);\n        float reflectedCore=exp(-abs(uv.x)*4.6)*exp(-abs(uv.y+.61)*3.4)*waterMask;\n        c+=halo*vec3(.030,.24,.40);\n        c+=coreOrb*vec3(.52,1.18,1.60)*.72;\n        c+=cross*vec3(.18,.78,1.14)*.34;\n        c+=auraRings*mix(vec3(.05,.43,.76),vec3(.46,.13,.82),sat(uScroll*.5))*.19;\n        c+=waterMask*vec3(.008,.065,.110)*(.08+.09*waterRipple);\n        c+=reflectedCore*vec3(.04,.28,.47)*.19;"
    );

    next = next.replace(
      "c=mix(refl,base,.49+d*.16);\n            c+=f*vec3(.26,.86,1.30)*1.18;\n            c+=crystal*vec3(.09,.35,.54);\n            c+=pow(max(dot(n,key),0.),10.)*vec3(.72,1.0,1.18)*.82;",
      "vec3 refrDir=refract(rd,n,.73);\n            vec3 trans=background(length(refrDir)>.1?normalize(refrDir):rd);\n            float caustic=pow(.5+.5*sin(p.x*9.4+p.y*12.8-p.z*16.5+uTime*.28),10.);\n            float depthFacet=pow(sat(1.-abs(n.z)),1.8);\n            float facetAngle=atan(p.y,p.x);\n            float facetRadius=length(p.xy);\n            float veins=pow(.5+.5*cos(facetAngle*8.+facetRadius*12.-uTime*.09),22.);\n            c=mix(trans,refl,.18+f*.68);\n            c=mix(c,base,.09+d*.09);\n            c+=f*vec3(.34,1.04,1.56)*1.72;\n            c+=crystal*vec3(.05,.22,.36);\n            c+=caustic*vec3(.08,.42,.72)*(.06+.22*(1.-f));\n            c+=veins*vec3(.08,.50,.88)*(.08+.28*f);\n            c+=depthFacet*vec3(.06,.30,.50)*.30;\n            c+=pow(max(dot(n,key),0.),14.)*vec3(.92,1.16,1.34)*1.08;"
    );

    next = next.replace(
      "if(id>6.5&&id<7.5)c+=vec3(.42,1.02,1.42)*(1.25+pulse);",
      "if(id>6.5&&id<7.5)c+=vec3(.66,1.34,1.78)*(1.60+pulse*1.30);\n          c+=coreOrb*vec3(.34,1.02,1.46)*.40;"
    );

    return next;
  }

  Context.prototype.shaderSource = function patchedShaderSource(shader, source) {
    if (
      !shaderPatched
      && typeof source === 'string'
      && source.includes('float starPrism(vec3 p')
      && source.includes('uniform float uScene;')
    ) {
      const patched = volumetricCrystalShader(source);
      const complete = [
        'float zProfile=',
        'starPrism(crystal,1.50*pulse,.58,.003)',
        'vec3 refrDir=refract(rd,n,.73)',
        'ring.xz*=rot(.38+sin(uTime*.11)*.08)',
        'float angle=mix(.18+sin(uTime*.11)*.065',
      ].every(marker => patched.includes(marker));
      if (patched !== source && complete) {
        shaderPatched = true;
        root.dataset.fxApexReferenceShader = 'volumetric-glass-crystal-v6';
        source = patched;
        queueMicrotask(() => {
          if (Context.prototype.shaderSource === patchedShaderSource) Context.prototype.shaderSource = originalShaderSource;
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
      return index + smoothstep((raw - 0.38) / 0.50);
    }
    return Math.max(0, sections.length - 1);
  }

  Context.prototype.getUniformLocation = function patchedGetUniformLocation(program, name) {
    const location = originalGetUniformLocation.call(this, program, name);
    if (location && name === 'uScene' && this.canvas instanceof HTMLCanvasElement && this.canvas.dataset.fxNativeApexCanvas === 'true') {
      sceneLocations.add(location);
    }
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
  addEventListener('formatx:nativeapexready', () => {
    if (root.dataset.fxApexReferenceShader === 'volumetric-glass-crystal-v6') {
      root.dataset.fxNativeApexVisual = 'volumetric-glass-crystal-v6';
      root.dataset.fxNativeApexRenderer = 'webgl2-volumetric-glass-crystal-sdf';
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refreshSections, { once: true });
  else refreshSections();

  root.dataset.fxApexSceneStability = 'ready-v5';
  root.dataset.fxCoreHold = 'stable-before-morph';
  root.dataset.fxCoreMobileComposition = 'volumetric-glass-crystal-v6';
}());