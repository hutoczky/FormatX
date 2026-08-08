(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxApexSceneStability === 'ready-v7') return;

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

  function referenceLuminousCrystalShader(source) {
    let next = source;

    next = next.replace(
      "float starPrism(vec3 p,float radius,float depth,float rounding){\n        float a=atan(p.y,p.x);\n        float lobes=pow(abs(cos(2.*a)),.48);\n        float radial=radius*mix(.56,1.,lobes);\n        float d2=length(p.xy)-radial;\n        float dz=abs(p.z)-depth;\n        vec2 w=vec2(d2,dz);\n        return min(max(w.x,w.y),0.)+length(max(w,0.))-rounding;\n      }",
      "float starPrism(vec3 p,float radius,float depth,float rounding){\n        float a=atan(p.y,p.x);\n        float axis=pow(abs(cos(2.*a)),2.15);\n        float radial=radius*mix(.47,1.,axis);\n        float rho=length(p.xy);\n        float rn=clamp(rho/max(radial,.001),0.,1.);\n        float zCap=depth*pow(max(0.,1.-pow(rn,1.72)),.58)+.018*(1.-rn);\n        float edge=rho-radial;\n        float frontBack=abs(p.z)-zCap;\n        vec2 w=vec2(edge,frontBack);\n        float shell=min(max(w.x,w.y),0.)+length(max(w,0.));\n        float facet=.006*(1.-rn)*abs(sin(a*8.));\n        return shell-rounding+facet;\n      }"
    );

    next = next.replace(
      "q.xz*=rot(sin(uTime*.13)*.105+uPointer.x*.045);\n        q.yz*=rot(cos(uTime*.15)*.065+uPointer.y*.04);\n        float pulse=1.+sin(uTime*1.72)*.018;",
      "q.xz*=rot(.080+sin(uTime*.13)*.062+uPointer.x*.034);\n        q.yz*=rot(-.050+cos(uTime*.15)*.044+uPointer.y*.032);\n        q.xy*=rot(sin(uTime*.09)*.014);\n        float beatA=.5+.5*sin(uTime*1.55);\n        float beatB=.5+.5*sin(uTime*3.10-.78);\n        float heart=pow(beatA,4.)*.72+pow(beatB,9.)*.28;\n        float breath=.5+.5*sin(uTime*.62-.4);\n        float pulse=1.+heart*.040+breath*.010;"
    );

    next = next.replace(
      "crystal.y/=1.16;\n        float shell=starPrism(crystal,1.43*pulse,.32,.032);\n        shell+=(fbm(crystal*4.6)-.5)*.014;\n        vec2 result=vec2(shell,1.);",
      "crystal.y/=1.055;\n        float shell=starPrism(crystal,1.54*pulse,.62*(1.+heart*.025),.004);\n        shell+=(fbm(crystal*6.0)-.5)*.0032;\n        float cavity=sphere(crystal,.455+heart*.018);\n        shell=max(shell,-cavity);\n        vec2 result=vec2(shell,1.);"
    );

    next = next.replace(
      "float nucleus=sphere(q,.215+sin(uTime*2.2)*.018);",
      "float nucleus=sphere(q,.245+heart*.050+sin(uTime*2.2)*.010);"
    );

    next = next.replace(
      "vec3 ring=q;ring.yz*=rot(1.57079633);\n        result=unite(result,vec2(torus(ring,vec2(.62,.011)),5.));\n        ring=q;ring.yz*=rot(1.57079633);ring.xy*=rot(.36+uTime*.018);\n        result=unite(result,vec2(torus(ring,vec2(.83,.010)),5.));\n        ring=q;ring.yz*=rot(1.57079633);ring.xy*=rot(-.44-uTime*.016);\n        result=unite(result,vec2(torus(ring,vec2(1.08,.009)),6.));",
      "float ringPulse=1.+heart*.055+breath*.012;\n        vec3 ring=q;ring.yz*=rot(1.57079633);ring.xz*=rot(.10+sin(uTime*.11)*.035);\n        result=unite(result,vec2(torus(ring,vec2(.43*ringPulse,.016+heart*.004)),5.));\n        ring=q;ring.yz*=rot(1.57079633);ring.xz*=rot(-.16+cos(uTime*.10)*.030);ring.xy*=rot(.18+uTime*.014);\n        result=unite(result,vec2(torus(ring,vec2(.58*ringPulse,.012+heart*.003)),5.));\n        ring=q;ring.yz*=rot(1.57079633);ring.xz*=rot(.22+sin(uTime*.08)*.028);ring.xy*=rot(-.26-uTime*.012);\n        result=unite(result,vec2(torus(ring,vec2(.78*ringPulse,.010+heart*.002)),6.));"
    );

    next = next.replace(
      "float angle=mix(-.035+sin(uTime*.11)*.022,travelAngle,1.-coreWeight);",
      "float angle=mix(.042+sin(uTime*.11)*.030,travelAngle,1.-coreWeight);"
    );

    next = next.replace(
      "float radius=mix(6.02,travelRadius,1.-coreWeight);",
      "float radius=mix(5.72,travelRadius,1.-coreWeight);"
    );

    next = next.replace(
      "float focal=mix(1.92,1.72,1.-coreWeight);",
      "float focal=mix(1.96,1.72,1.-coreWeight);"
    );

    next = next.replace(
      "float halo=exp(-3.2*coreDistance)*coreWeight;\n        float cross=(exp(-abs(uv.x)*105.)+exp(-abs(uv.y)*82.))*exp(-coreDistance*2.45)*coreWeight;\n        float auraRings=(exp(-abs(coreDistance-.125)*72.)+exp(-abs(coreDistance-.205)*58.)*.7+exp(-abs(coreDistance-.292)*48.)*.42)*coreWeight;\n        c+=halo*vec3(.038,.24,.38);\n        c+=cross*vec3(.12,.58,.88)*.31;\n        c+=auraRings*mix(vec3(.04,.38,.64),vec3(.36,.10,.72),sat(uScroll*.5))*.18;",
      "float screenBeatA=.5+.5*sin(uTime*1.55);\n        float screenBeatB=.5+.5*sin(uTime*3.10-.78);\n        float screenHeart=pow(screenBeatA,4.)*.72+pow(screenBeatB,9.)*.28;\n        float waveRadius=.19+screenHeart*.055;\n        float pulseWave=exp(-abs(coreDistance-waveRadius)*54.)*coreWeight;\n        float halo=exp(-2.75*coreDistance)*coreWeight;\n        float coreOrb=exp(-coreDistance*9.4)*coreWeight*(.82+screenHeart*.78);\n        float coreBloom=exp(-coreDistance*4.8)*coreWeight*(.78+screenHeart*.55);\n        float cross=(exp(-abs(uv.x)*132.)+exp(-abs(uv.y)*104.))*exp(-coreDistance*2.30)*coreWeight*(.80+screenHeart*.55);\n        float auraRings=(exp(-abs(coreDistance-.108)*82.)+exp(-abs(coreDistance-.174)*70.)*.82+exp(-abs(coreDistance-.248)*58.)*.56)*coreWeight;\n        float waterMask=smoothstep(.31,.94,-uv.y)*coreWeight;\n        float waterRipple=.5+.5*sin(uv.y*150.+sin(uv.x*12.)*1.7+uTime*.27);\n        float reflectedCore=exp(-abs(uv.x)*4.8)*exp(-abs(uv.y+.61)*3.5)*waterMask;\n        c+=halo*vec3(.035,.26,.44);\n        c+=coreBloom*vec3(.045,.24,.40)*.28;\n        c+=coreOrb*vec3(.74,1.48,1.92)*1.08;\n        c+=pulseWave*vec3(.14,.86,1.28)*(.14+screenHeart*.30);\n        c+=cross*vec3(.22,.88,1.28)*.48;\n        c+=auraRings*mix(vec3(.08,.58,.94),vec3(.56,.16,.94),sat(uScroll*.5))*.31*(.88+screenHeart*.22);\n        c+=waterMask*vec3(.008,.070,.118)*(.08+.10*waterRipple);\n        c+=reflectedCore*vec3(.05,.33,.54)*.21;"
    );

    next = next.replace(
      "c=mix(refl,base,.49+d*.16);\n            c+=f*vec3(.26,.86,1.30)*1.18;\n            c+=crystal*vec3(.09,.35,.54);\n            c+=pow(max(dot(n,key),0.),10.)*vec3(.72,1.0,1.18)*.82;",
      "vec3 refrDir=refract(rd,n,.75);\n            vec3 trans=background(length(refrDir)>.1?normalize(refrDir):rd);\n            float caustic=pow(.5+.5*sin(p.x*10.2+p.y*13.6-p.z*15.8+uTime*.24),12.);\n            float facetAngle=atan(p.y,p.x);\n            float facetRadius=length(p.xy);\n            float veins=pow(.5+.5*cos(facetAngle*8.+facetRadius*10.5-uTime*.08),20.);\n            float axisVein=exp(-abs(p.x)*17.)+exp(-abs(p.y)*17.);\n            float depthFacet=pow(sat(1.-abs(n.z)),1.9);\n            c=mix(trans,refl,.12+f*.72);\n            c=mix(c,base,.08+d*.08);\n            c+=f*vec3(.40,1.16,1.70)*1.92;\n            c+=crystal*vec3(.04,.19,.32);\n            c+=caustic*vec3(.10,.52,.86)*(.08+.24*(1.-f));\n            c+=veins*vec3(.10,.64,1.02)*(.10+.30*f);\n            c+=axisVein*vec3(.18,.88,1.28)*.09;\n            c+=depthFacet*vec3(.07,.32,.52)*.24;\n            c+=pow(max(dot(n,key),0.),15.)*vec3(.98,1.20,1.38)*1.14;"
    );

    next = next.replace(
      "if(id>6.5&&id<7.5)c+=vec3(.42,1.02,1.42)*(1.25+pulse);",
      "if(id>6.5&&id<7.5)c+=vec3(.90,1.62,2.04)*(1.78+pulse*1.42);\n          c+=coreOrb*vec3(.52,1.28,1.76)*.58;"
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
      const patched = referenceLuminousCrystalShader(source);
      const complete = [
        'float radial=radius*mix(.47,1.,axis)',
        'float cavity=sphere(crystal,.455+heart*.018)',
        'float heart=pow(beatA,4.)*.72+pow(beatB,9.)*.28',
        'float ringPulse=1.+heart*.055+breath*.012',
        'float screenHeart=pow(screenBeatA,4.)*.72+pow(screenBeatB,9.)*.28',
        'float pulseWave=exp(-abs(coreDistance-waveRadius)*54.)',
        'vec3 refrDir=refract(rd,n,.75)',
      ].every(marker => patched.includes(marker));
      if (patched !== source && complete) {
        shaderPatched = true;
        root.dataset.fxApexReferenceShader = 'reference-luminous-crystal-pulse-v8';
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
    if (root.dataset.fxApexReferenceShader === 'reference-luminous-crystal-pulse-v8') {
      root.dataset.fxNativeApexVisual = 'reference-luminous-crystal-pulse-v8';
      root.dataset.fxNativeApexRenderer = 'webgl2-reference-luminous-pulsing-crystal-sdf';
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refreshSections, { once: true });
  else refreshSections();

  root.dataset.fxApexSceneStability = 'ready-v7';
  root.dataset.fxCoreHold = 'stable-before-morph';
  root.dataset.fxCoreMobileComposition = 'reference-luminous-crystal-pulse-v8';
}());