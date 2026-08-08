(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxApexSceneStability === 'ready-v8') return;

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

  function referenceLockedCrystalShader(source) {
    let next = source;

    next = next.replace(
      "float starPrism(vec3 p,float radius,float depth,float rounding){\n        float a=atan(p.y,p.x);\n        float lobes=pow(abs(cos(2.*a)),.48);\n        float radial=radius*mix(.56,1.,lobes);\n        float d2=length(p.xy)-radial;\n        float dz=abs(p.z)-depth;\n        vec2 w=vec2(d2,dz);\n        return min(max(w.x,w.y),0.)+length(max(w,0.))-rounding;\n      }",
      "float referenceStar2D(vec2 p){\n        vec2 v[16];\n        v[0]=vec2(0.,1.);v[1]=vec2(.115,.705);v[2]=vec2(.305,.325);v[3]=vec2(.705,.115);\n        v[4]=vec2(1.,0.);v[5]=vec2(.705,-.115);v[6]=vec2(.305,-.325);v[7]=vec2(.115,-.705);\n        v[8]=vec2(0.,-1.);v[9]=vec2(-.115,-.705);v[10]=vec2(-.305,-.325);v[11]=vec2(-.705,-.115);\n        v[12]=vec2(-1.,0.);v[13]=vec2(-.705,.115);v[14]=vec2(-.305,.325);v[15]=vec2(-.115,.705);\n        float d=1e5;bool inside=false;\n        for(int i=0;i<16;i++){int j=(i+15)%16;vec2 a=v[i],b=v[j];vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-6),0.,1.);d=min(d,length(pa-ba*h));bool cross=((a.y>p.y)!=(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y+1e-6)+a.x);if(cross)inside=!inside;}\n        return inside?-d:d;\n      }\n      float starPrism(vec3 p,float radius,float depth,float rounding){\n        vec2 sp=p.xy/radius;\n        float d2=referenceStar2D(sp)*radius;\n        float radial=clamp(length(sp),0.,1.35);\n        float zCap=depth*(.10+.90*pow(max(0.,1.-pow(radial*.78,1.65)),.58));\n        float dz=abs(p.z)-zCap;\n        vec2 w=vec2(d2,dz);\n        float shell=min(max(w.x,w.y),0.)+length(max(w,0.));\n        float facet=.0045*(1.-clamp(radial,0.,1.))*abs(sin(atan(p.y,p.x)*8.));\n        return shell-rounding+facet;\n      }"
    );

    next = next.replace(
      "q.xz*=rot(sin(uTime*.13)*.105+uPointer.x*.045);\n        q.yz*=rot(cos(uTime*.15)*.065+uPointer.y*.04);\n        float pulse=1.+sin(uTime*1.72)*.018;",
      "q.xz*=rot(.052+sin(uTime*.13)*.044+uPointer.x*.028);\n        q.yz*=rot(-.032+cos(uTime*.15)*.032+uPointer.y*.026);\n        q.xy*=rot(sin(uTime*.09)*.010);\n        float beatA=.5+.5*sin(uTime*1.55);\n        float beatB=.5+.5*sin(uTime*3.10-.78);\n        float heart=pow(beatA,4.)*.72+pow(beatB,9.)*.28;\n        float breath=.5+.5*sin(uTime*.62-.4);\n        float pulse=1.+heart*.032+breath*.007;"
    );

    next = next.replace(
      "crystal.y/=1.16;\n        float shell=starPrism(crystal,1.43*pulse,.32,.032);\n        shell+=(fbm(crystal*4.6)-.5)*.014;\n        vec2 result=vec2(shell,1.);",
      "crystal.y/=1.015;\n        float shell=starPrism(crystal,1.50*pulse,.48*(1.+heart*.020),.0025);\n        shell+=(fbm(crystal*7.0)-.5)*.0022;\n        vec2 result=vec2(shell,1.);"
    );

    next = next.replace(
      "float nucleus=sphere(q,.215+sin(uTime*2.2)*.018);",
      "float nucleus=sphere(q,.205+heart*.040+sin(uTime*2.2)*.008);"
    );

    next = next.replace(
      "vec3 ring=q;ring.yz*=rot(1.57079633);\n        result=unite(result,vec2(torus(ring,vec2(.62,.011)),5.));\n        ring=q;ring.yz*=rot(1.57079633);ring.xy*=rot(.36+uTime*.018);\n        result=unite(result,vec2(torus(ring,vec2(.83,.010)),5.));\n        ring=q;ring.yz*=rot(1.57079633);ring.xy*=rot(-.44-uTime*.016);\n        result=unite(result,vec2(torus(ring,vec2(1.08,.009)),6.));",
      "float ringPulse=1.+heart*.040+breath*.010;\n        vec3 ring=q;ring.yz*=rot(1.57079633);ring.xz*=rot(.08+sin(uTime*.11)*.030);\n        result=unite(result,vec2(torus(ring,vec2(.36*ringPulse,.010+heart*.003)),5.));\n        ring=q;ring.yz*=rot(1.57079633);ring.xz*=rot(-.13+cos(uTime*.10)*.026);ring.xy*=rot(.15+uTime*.012);\n        result=unite(result,vec2(torus(ring,vec2(.51*ringPulse,.009+heart*.002)),5.));\n        ring=q;ring.yz*=rot(1.57079633);ring.xz*=rot(.18+sin(uTime*.08)*.024);ring.xy*=rot(-.22-uTime*.010);\n        result=unite(result,vec2(torus(ring,vec2(.91*ringPulse,.008+heart*.0015)),6.));"
    );

    next = next.replace(
      "float angle=mix(-.035+sin(uTime*.11)*.022,travelAngle,1.-coreWeight);",
      "float angle=mix(.018+sin(uTime*.11)*.018,travelAngle,1.-coreWeight);"
    );

    next = next.replace(
      "float radius=mix(6.02,travelRadius,1.-coreWeight);",
      "float radius=mix(5.84,travelRadius,1.-coreWeight);"
    );

    next = next.replace(
      "float focal=mix(1.92,1.72,1.-coreWeight);",
      "float focal=mix(1.98,1.72,1.-coreWeight);"
    );

    next = next.replace(
      "float halo=exp(-3.2*coreDistance)*coreWeight;\n        float cross=(exp(-abs(uv.x)*105.)+exp(-abs(uv.y)*82.))*exp(-coreDistance*2.45)*coreWeight;\n        float auraRings=(exp(-abs(coreDistance-.125)*72.)+exp(-abs(coreDistance-.205)*58.)*.7+exp(-abs(coreDistance-.292)*48.)*.42)*coreWeight;\n        c+=halo*vec3(.038,.24,.38);\n        c+=cross*vec3(.12,.58,.88)*.31;\n        c+=auraRings*mix(vec3(.04,.38,.64),vec3(.36,.10,.72),sat(uScroll*.5))*.18;",
      "float screenBeatA=.5+.5*sin(uTime*1.55);\n        float screenBeatB=.5+.5*sin(uTime*3.10-.78);\n        float screenHeart=pow(screenBeatA,4.)*.72+pow(screenBeatB,9.)*.28;\n        float halo=exp(-2.55*coreDistance)*coreWeight;\n        float hotCore=exp(-coreDistance*32.)*coreWeight*(1.05+screenHeart*.80);\n        float coreBloom=exp(-coreDistance*7.2)*coreWeight*(.88+screenHeart*.62);\n        float reactor1=exp(-abs(coreDistance-.074)*115.)*coreWeight;\n        float reactor2=exp(-abs(coreDistance-.132)*92.)*coreWeight;\n        float reactor3=exp(-abs(coreDistance-.205)*70.)*coreWeight;\n        float waveRadius=.18+screenHeart*.065;\n        float pulseWave=exp(-abs(coreDistance-waveRadius)*56.)*coreWeight;\n        float cross=(exp(-abs(uv.x)*138.)+exp(-abs(uv.y)*112.))*exp(-coreDistance*2.15)*coreWeight*(.90+screenHeart*.60);\n        float auraRings=(exp(-abs(coreDistance-.285)*52.)*.46+exp(-abs(coreDistance-.39)*42.)*.30)*coreWeight;\n        float waterMask=smoothstep(.33,.96,-uv.y)*coreWeight;\n        float waterRipple=.5+.5*sin(uv.y*154.+sin(uv.x*12.5)*1.8+uTime*.27);\n        float reflectedCore=exp(-abs(uv.x)*4.8)*exp(-abs(uv.y+.61)*3.5)*waterMask;\n        c+=halo*vec3(.030,.25,.43);\n        c+=coreBloom*vec3(.06,.34,.56)*.46;\n        c+=hotCore*vec3(1.30,2.20,2.65)*1.28;\n        c+=(reactor1*1.25+reactor2*.92+reactor3*.66)*vec3(.18,1.05,1.55);\n        c+=pulseWave*vec3(.16,.94,1.40)*(.18+screenHeart*.34);\n        c+=cross*vec3(.24,.96,1.42)*.52;\n        c+=auraRings*mix(vec3(.10,.60,.96),vec3(.62,.18,1.05),sat(uScroll*.5))*.34*(.88+screenHeart*.25);\n        c+=waterMask*vec3(.008,.072,.122)*(.08+.10*waterRipple);\n        c+=reflectedCore*vec3(.05,.34,.56)*.22;"
    );

    next = next.replace(
      "c=mix(refl,base,.49+d*.16);\n            c+=f*vec3(.26,.86,1.30)*1.18;\n            c+=crystal*vec3(.09,.35,.54);\n            c+=pow(max(dot(n,key),0.),10.)*vec3(.72,1.0,1.18)*.82;",
      "vec3 refrDir=refract(rd,n,.76);\n            vec3 trans=background(length(refrDir)>.1?normalize(refrDir):rd);\n            float caustic=pow(.5+.5*sin(p.x*11.4+p.y*14.1-p.z*16.7+uTime*.23),13.);\n            float facetAngle=atan(p.y,p.x);\n            float facetRadius=length(p.xy);\n            float veins=pow(.5+.5*cos(facetAngle*8.+facetRadius*12.0-uTime*.075),24.);\n            float axisVein=exp(-abs(p.x)*20.)+exp(-abs(p.y)*20.);\n            float innerGlow=exp(-length(p.xy)*2.3)*(1.-sat(abs(p.z)*1.5));\n            float depthFacet=pow(sat(1.-abs(n.z)),2.0);\n            c=mix(trans,refl,.09+f*.76);\n            c=mix(c,base,.055+d*.060);\n            c+=f*vec3(.46,1.30,1.90)*2.12;\n            c+=crystal*vec3(.035,.18,.31);\n            c+=caustic*vec3(.11,.58,.96)*(.10+.28*(1.-f));\n            c+=veins*vec3(.12,.72,1.14)*(.10+.34*f);\n            c+=axisVein*vec3(.22,1.02,1.48)*.12;\n            c+=innerGlow*vec3(.08,.48,.80)*.22;\n            c+=depthFacet*vec3(.07,.31,.52)*.21;\n            c+=pow(max(dot(n,key),0.),16.)*vec3(1.02,1.25,1.45)*1.20;"
    );

    next = next.replace(
      "if(id>6.5&&id<7.5)c+=vec3(.42,1.02,1.42)*(1.25+pulse);",
      "if(id>6.5&&id<7.5)c+=vec3(1.10,1.86,2.32)*(2.00+pulse*1.55);"
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
      const patched = referenceLockedCrystalShader(source);
      const complete = [
        'float referenceStar2D(vec2 p)',
        'v[0]=vec2(0.,1.)',
        'v[4]=vec2(1.,0.)',
        'v[8]=vec2(0.,-1.)',
        'v[12]=vec2(-1.,0.)',
        'starPrism(crystal,1.50*pulse,.48*(1.+heart*.020),.0025)',
        'float hotCore=exp(-coreDistance*32.)',
        'float reactor1=exp(-abs(coreDistance-.074)*115.)',
        'float pulseWave=exp(-abs(coreDistance-waveRadius)*56.)',
        'vec3 refrDir=refract(rd,n,.76)',
      ].every(marker => patched.includes(marker));
      if (patched !== source && complete) {
        shaderPatched = true;
        root.dataset.fxApexReferenceShader = 'reference-locked-crystal-3d-v9';
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
    if (root.dataset.fxApexReferenceShader === 'reference-locked-crystal-3d-v9') {
      root.dataset.fxNativeApexVisual = 'reference-locked-crystal-3d-v9';
      root.dataset.fxNativeApexRenderer = 'webgl2-reference-locked-crystal-sdf';
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refreshSections, { once: true });
  else refreshSections();

  root.dataset.fxApexSceneStability = 'ready-v8';
  root.dataset.fxCoreHold = 'stable-before-morph';
  root.dataset.fxCoreMobileComposition = 'reference-locked-crystal-3d-v9';
}());