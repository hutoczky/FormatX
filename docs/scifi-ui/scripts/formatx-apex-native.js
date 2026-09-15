(function () {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(max-width: 820px), (pointer: coarse)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const sections = Array.from(document.querySelectorAll('main > .scene'));

  if (!body || !sections.length || root.dataset.fxNativeApex === 'ready') return;
  if (root.dataset.fxImmersive !== 'active') {
    root.dataset.fxNativeApex = 'deferred';
    return;
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (from, to, amount) => from + (to - from) * amount;
  const chapterNames = {
    hu: ['MAG', 'IDEGRENDSZER', 'RENDSZERSZERVEK', 'KERESKEDELMI SZÍV', 'RENDSZERVÁZ', 'JELADÓ'],
    en: ['CORE', 'NERVOUS SYSTEM', 'SYSTEM ORGANS', 'COMMERCE HEART', 'SYSTEM SKELETON', 'BEACON']
  };

  const state = {
    visible: !document.hidden,
    reduced: reducedMotion.matches,
    active: 0,
    scene: 0,
    smoothScene: 0,
    scroll: 0,
    smoothScroll: 0,
    velocity: 0,
    pointerX: 0,
    pointerY: 0,
    targetPointerX: 0,
    targetPointerY: 0,
    lastScrollY: scrollY,
    quality: coarse.matches ? 0.82 : 0.88,
    targetQuality: coarse.matches ? 0.82 : 0.88,
    fps: 0,
    sound: false
  };

  function element(tag, className, parent) {
    const node = document.createElement(tag);
    node.className = className;
    (parent || body).appendChild(node);
    return node;
  }

  function installSurface() {
    document.querySelectorAll('.fx-transcend-shell[data-fx-native-apex], .fx-transcend-hud[data-fx-native-apex], .fx-transcend-sound[data-fx-native-apex]').forEach(node => node.remove());

    const shell = element('div', 'fx-transcend-shell');
    shell.dataset.fxNativeApex = 'true';
    shell.setAttribute('aria-hidden', 'true');
    const canvas = element('canvas', 'fx-transcend-canvas', shell);
    canvas.dataset.fxNativeApexCanvas = 'true';
    const lens = element('div', 'fx-transcend-lens', shell);
    lens.innerHTML = '<i></i><i></i><i></i>';
    element('div', 'fx-transcend-film', shell);

    const hud = element('aside', 'fx-transcend-hud');
    hud.dataset.fxNativeApex = 'true';
    hud.setAttribute('aria-live', 'polite');
    hud.innerHTML = [
      '<div class="fx-transcend-chapter">',
      '<span data-fx-apex-chapter>01</span>',
      '<div><small>FORMATX / NATIVE APEX</small><strong data-fx-apex-title>MAG</strong><p data-fx-apex-copy>LUMINOUS 3D ENERGY CRYSTAL</p></div>',
      '</div>',
      '<div class="fx-transcend-progress" aria-hidden="true"><i></i><b></b></div>',
      '<div class="fx-transcend-telemetry" aria-hidden="true"><span>GPU</span><b data-fx-apex-mode>WEBGL2 / STAR CRYSTAL SDF</b><span>FPS</span><b data-fx-apex-fps>—</b></div>'
    ].join('');

    const sound = element('button', 'fx-transcend-sound');
    sound.dataset.fxNativeApex = 'true';
    sound.type = 'button';
    sound.setAttribute('aria-pressed', 'false');
    sound.setAttribute('aria-label', 'FormatX generative soundscape');
    sound.innerHTML = '<i aria-hidden="true"><b></b><b></b><b></b></i><span>SOUND OFF</span>';

    const footer = document.querySelector('.particle-footer');
    let footerCanvas = null;
    if (footer) {
      footer.classList.add('fx-transcend-footer-stage');
      footer.querySelectorAll('.fx-transcend-footer-canvas[data-fx-native-apex], .fx-transcend-footer-hint[data-fx-native-apex]').forEach(node => node.remove());
      footerCanvas = element('canvas', 'fx-transcend-footer-canvas', footer);
      footerCanvas.dataset.fxNativeApex = 'true';
      const hint = element('div', 'fx-transcend-footer-hint', footer);
      hint.dataset.fxNativeApex = 'true';
      hint.innerHTML = '<span>PROCEDURAL SIGNAL FIELD</span><b>FORMATX</b><small>FIRST-PARTY / NATIVE GPU / NO SCROLL CAPTURE</small>';
    }

    return { shell, canvas, hud, sound, footerCanvas };
  }

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'shader compile failed';
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  function link(gl, vertexSource, fragmentSource) {
    const program = gl.createProgram();
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || 'program link failed';
      gl.deleteProgram(program);
      throw new Error(message);
    }
    return program;
  }

  function createRenderer(canvas, mode, fpsOutput) {
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    });
    if (!gl) return null;

    const vertexSource = `#version 300 es
      in vec2 aPosition;
      void main(){gl_Position=vec4(aPosition,0.,1.);}
    `;

    const fragmentSource = `#version 300 es
      precision highp float;
      out vec4 outColor;
      uniform vec2 uResolution;
      uniform vec2 uPointer;
      uniform float uTime;
      uniform float uScroll;
      uniform float uScene;
      uniform float uVelocity;
      uniform float uQuality;

      #define TAU 6.28318530718
      #define FAR 16.0
      #define MAX_STEPS 86

      mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
      float sat(float x){return clamp(x,0.,1.);}
      float hash11(float p){return fract(sin(p*127.13)*43758.5453);}
      float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float hash31(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float noise3(vec3 p){
        vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(mix(hash31(i),hash31(i+vec3(1,0,0)),f.x),mix(hash31(i+vec3(0,1,0)),hash31(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash31(i+vec3(0,0,1)),hash31(i+vec3(1,0,1)),f.x),mix(hash31(i+vec3(0,1,1)),hash31(i+vec3(1,1,1)),f.x),f.y),f.z);
      }
      float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=noise3(p)*a;p=p*2.03+11.71;a*=.5;}return v;}
      float sphere(vec3 p,float r){return length(p)-r;}
      float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
      float roundBox(vec3 p,vec3 b,float r){return box(p,b)-r;}
      float octa(vec3 p,float s){p=abs(p);return(p.x+p.y+p.z-s)*.57735027;}
      float capsule(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
      float torus(vec3 p,vec2 t){vec2 q=vec2(length(p.xz)-t.x,p.y);return length(q)-t.y;}
      float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
      vec2 unite(vec2 a,vec2 b){return a.x<b.x?a:b;}
      float starPrism(vec3 p,float radius,float depth,float rounding){
        float a=atan(p.y,p.x);
        float lobes=pow(abs(cos(2.*a)),.48);
        float radial=radius*mix(.56,1.,lobes);
        float d2=length(p.xy)-radial;
        float dz=abs(p.z)-depth;
        vec2 w=vec2(d2,dz);
        return min(max(w.x,w.y),0.)+length(max(w,0.))-rounding;
      }

      vec2 core(vec3 p){
        vec3 q=p;
        q.xz*=rot(sin(uTime*.13)*.105+uPointer.x*.045);
        q.yz*=rot(cos(uTime*.15)*.065+uPointer.y*.04);
        float pulse=1.+sin(uTime*1.72)*.018;

        vec3 crystal=q;
        crystal.y/=1.16;
        float shell=starPrism(crystal,1.43*pulse,.32,.032);
        shell+=(fbm(crystal*4.6)-.5)*.014;
        vec2 result=vec2(shell,1.);

        float nucleus=sphere(q,.215+sin(uTime*2.2)*.018);
        result=unite(result,vec2(nucleus,7.));

        for(int i=0;i<4;i++){
          float fi=float(i),a=fi*1.57079633;
          vec3 end=vec3(cos(a)*1.48,sin(a)*1.62,0.);
          result=unite(result,vec2(capsule(q,end*.18,end,.018),3.));
          result=unite(result,vec2(sphere(q-end*.56,.028),6.));
        }
        for(int i=0;i<4;i++){
          float fi=float(i),a=fi*1.57079633+.78539816;
          vec3 end=vec3(cos(a)*.96,sin(a)*1.06,0.);
          result=unite(result,vec2(capsule(q,end*.30,end,.010),4.));
        }
        result=unite(result,vec2(capsule(q,vec3(-1.52,0,0),vec3(1.52,0,0),.014),3.));
        result=unite(result,vec2(capsule(q,vec3(0,-1.68,0),vec3(0,1.68,0),.014),3.));

        vec3 ring=q;ring.yz*=rot(1.57079633);
        result=unite(result,vec2(torus(ring,vec2(.62,.011)),5.));
        ring=q;ring.yz*=rot(1.57079633);ring.xy*=rot(.36+uTime*.018);
        result=unite(result,vec2(torus(ring,vec2(.83,.010)),5.));
        ring=q;ring.yz*=rot(1.57079633);ring.xy*=rot(-.44-uTime*.016);
        result=unite(result,vec2(torus(ring,vec2(1.08,.009)),6.));
        return result;
      }
      vec2 nerves(vec3 p){
        vec2 result=core(p);
        for(int i=0;i<8;i++){
          float fi=float(i),a=fi/8.*TAU+uTime*.03;
          vec3 end=vec3(cos(a)*(1.55+.12*sin(fi*2.1)),sin(fi*1.63)*.72,sin(a)*(1.55+.12*cos(fi*1.4)));
          result=unite(result,vec2(capsule(p,normalize(end)*.45,end,.025),2.+mod(fi,2.)));
          result=unite(result,vec2(sphere(p-end,.085+.015*sin(uTime+fi)),6.));
        }
        return result;
      }
      vec2 organs(vec3 p){
        vec3 q=p;q.xz*=rot(uTime*.06+uScroll*1.5);vec2 result=vec2(sphere(q,.28),7.);
        for(int i=0;i<6;i++){
          float fi=float(i),a=fi/6.*TAU+uTime*.028,r=1.38+.1*sin(uTime*.5+fi);
          vec3 center=vec3(cos(a)*r,(hash11(fi+3.)-.5)*1.05,sin(a)*r);
          vec3 local=q-center;local.xy*=rot(a*.6+fi);
          float shape=mix(octa(local,.48),roundBox(local,vec3(.29,.43,.27),.07),step(.5,mod(fi,2.)));
          result=unite(result,vec2(shape,2.+mod(fi,3.)));
          result=unite(result,vec2(capsule(q,normalize(center)*.33,center,.02),5.));
        }
        return result;
      }
      vec2 commerce(vec3 p){
        vec3 q=p;q.xz*=rot(uTime*.14);float beat=.5+.5*sin(uTime*2.1);
        vec2 result=vec2(smin(sphere(q,.59+beat*.06),octa(q,.99+beat*.07),.2),8.);
        for(int i=0;i<4;i++){float fi=float(i);vec3 r=q;r.xy*=rot(fi*1.03+uTime*.055*(mod(fi,2.)*2.-1.));r.yz*=rot(fi*.61);result=unite(result,vec2(torus(r,vec2(.96+fi*.2,.017+.005*beat)),5.));}
        return result;
      }
      vec2 skeleton(vec3 p){
        vec2 result=vec2(capsule(p,vec3(0,-1.7,0),vec3(0,1.72,0),.065),4.);
        for(int i=0;i<7;i++){float fi=float(i),y=-1.3+fi*.43,w=.5+sin(fi*.8)*.22;result=unite(result,vec2(capsule(p,vec3(0,y,0),vec3(w,y+.16,.4*sin(fi)),.03),3.));result=unite(result,vec2(capsule(p,vec3(0,y,0),vec3(-w,y+.16,-.4*sin(fi)),.03),3.));}
        vec3 q=p;q.xz*=rot(uTime*.075);return unite(result,vec2(octa(q,.68),1.));
      }
      vec2 beacon(vec3 p){
        vec3 q=p;q.xz*=rot(uTime*.085);float pulse=.5+.5*sin(uTime*2.4);
        vec2 result=vec2(octa(q-vec3(0,.2,0),.8+pulse*.055),7.);
        result=unite(result,vec2(max(length(q.xz)-(.052+.013*pulse),abs(q.y)-2.55),9.));
        for(int i=0;i<12;i++){float fi=float(i),a=fi/12.*TAU+uTime*.06,r=.9+hash11(fi)*1.15;vec3 center=vec3(cos(a)*r,(hash11(fi+5.)-.5)*2.45,sin(a)*r);result=unite(result,vec2(sphere(q-center,.03+.035*hash11(fi+9.)),6.));}
        return result;
      }
      vec2 shapeAt(vec3 p,float index){if(index<.5)return core(p);if(index<1.5)return nerves(p);if(index<2.5)return organs(p);if(index<3.5)return commerce(p);if(index<4.5)return skeleton(p);return beacon(p);}
      vec2 mapScene(vec3 p){
        float chapter=clamp(uScene,0.,5.);float base=floor(chapter+.0001),local=fract(chapter);float t=smoothstep(.15,.88,local);
        vec3 q=p;q.xz*=rot((t-.5)*.16*q.y+uVelocity*.01);
        vec2 a=shapeAt(q,base),b=shapeAt(q,min(base+1.,5.));
        vec2 result=vec2(mix(a.x,b.x,t),t<.5?a.y:b.y);
        result.x+=(fbm(p*2.7+vec3(0,uTime*.055,0))-.5)*.07*sin(t*3.14159);
        float floorBlend=smoothstep(.82,1.18,uScene);
        if(floorBlend>.001){float floorD=p.y+2.18+(noise3(vec3(p.xz*.65,uTime*.018))-.5)*.045;if(floorD<result.x)result=vec2(mix(result.x,floorD,floorBlend),10.);}
        return result;
      }
      vec3 normalAt(vec3 p){vec2 e=vec2(.0020,0);return normalize(vec3(mapScene(p+e.xyy).x-mapScene(p-e.xyy).x,mapScene(p+e.yxy).x-mapScene(p-e.yxy).x,mapScene(p+e.yyx).x-mapScene(p-e.yyx).x));}
      mat3 camera(vec3 ro,vec3 target){vec3 f=normalize(target-ro),r=normalize(cross(f,vec3(0,1,0)));return mat3(r,normalize(cross(r,f)),f);}
      vec3 background(vec3 rd){
        float horizon=pow(sat(1.-abs(rd.y)),4.);float aurora=pow(sat(sin(rd.x*5.2+uTime*.075+uScroll*4.)*.5+.5),10.)*pow(sat(rd.y+.38),2.);
        float stars=step(.998,hash21(floor((rd.xy+1.)*vec2(560.,340.))));
        vec3 c=mix(vec3(.0012,.004,.010),vec3(.010,.038,.068),horizon);
        c+=aurora*mix(vec3(.004,.22,.30),vec3(.27,.052,.38),sat(uScroll))*.40;
        c+=stars*vec3(.48,.76,1.08);
        return c;
      }
      vec3 material(float id,float fresnel,float diffuse,float pulse){
        vec3 cyan=vec3(.08,.72,1.02),ice=vec3(.73,.98,1.12),violet=vec3(.64,.26,1.04),white=vec3(.96,1.04,1.12);
        if(id<1.5){vec3 glass=mix(vec3(.012,.16,.25),cyan,.24+fresnel*.58);return mix(glass,ice,diffuse*.30+fresnel*.18);}
        if(id<4.5)return mix(cyan,ice,.52+fresnel*.38);
        if(id<6.5)return mix(cyan,violet,.34+.28*sin(uTime*.3)+fresnel*.26);
        if(id<7.5)return white*(1.65+pulse*.90);
        if(id<8.5)return mix(vec3(1.,.20,.05),vec3(1.,.72,.18),pulse);
        if(id<9.5)return vec3(.34,.87,1.)*(1.35+pulse);
        return mix(vec3(.008,.018,.030),vec3(.050,.14,.20),diffuse);
      }
      void main(){
        vec2 uv=(gl_FragCoord.xy*2.-uResolution)/uResolution.y;
        float coreWeight=1.-smoothstep(.58,1.08,uScene);
        float travelAngle=-.62+uScroll*5.7+sin(uTime*.08)*.03;
        float angle=mix(-.035+sin(uTime*.11)*.022,travelAngle,1.-coreWeight);
        float travelRadius=5.0-.38*sin(uScroll*3.14159)-.34*smoothstep(4.2,5.,uScene);
        float radius=mix(6.02,travelRadius,1.-coreWeight);
        float cameraY=mix(.02,.15+sin(uScroll*TAU)*.38+uPointer.y*.2,1.-coreWeight);
        vec3 ro=vec3(sin(angle)*radius,cameraY,cos(angle)*radius);
        vec3 target=vec3(uPointer.x*.065,mix(-.015,.28,smoothstep(4.,5.,uScene)),0.);
        float focal=mix(1.92,1.72,1.-coreWeight);
        vec3 rd=camera(ro,target)*normalize(vec3(uv,focal));

        float distance=0.,id=0.,glow=0.;vec3 p=ro;
        for(int i=0;i<MAX_STEPS;i++){
          if(float(i)>mix(52.,84.,uQuality))break;
          p=ro+rd*distance;vec2 hit=mapScene(p);id=hit.y;
          glow+=exp(-11.*abs(hit.x))*.0046;
          if(abs(hit.x)<mix(.0028,.00115,uQuality)||distance>FAR)break;
          distance+=hit.x*.68;
        }

        vec3 c=background(rd);
        float coreDistance=length(uv);
        float halo=exp(-3.2*coreDistance)*coreWeight;
        float cross=(exp(-abs(uv.x)*105.)+exp(-abs(uv.y)*82.))*exp(-coreDistance*2.45)*coreWeight;
        float auraRings=(exp(-abs(coreDistance-.125)*72.)+exp(-abs(coreDistance-.205)*58.)*.7+exp(-abs(coreDistance-.292)*48.)*.42)*coreWeight;
        c+=halo*vec3(.038,.24,.38);
        c+=cross*vec3(.12,.58,.88)*.31;
        c+=auraRings*mix(vec3(.04,.38,.64),vec3(.36,.10,.72),sat(uScroll*.5))*.18;

        if(distance<FAR){
          vec3 n=normalAt(p),key=normalize(vec3(-.48,.82,.37));
          float d=max(dot(n,key),0.),f=pow(1.-max(dot(n,-rd),0.),2.65);
          float pulse=.5+.5*sin(uTime*2.2);
          vec3 base=material(id,f,d,pulse);
          vec3 refl=background(reflect(rd,n));
          float crystal=sat((fbm(p*6.0)-.33)*1.65);
          if(id<1.5){
            c=mix(refl,base,.49+d*.16);
            c+=f*vec3(.26,.86,1.30)*1.18;
            c+=crystal*vec3(.09,.35,.54);
            c+=pow(max(dot(n,key),0.),10.)*vec3(.72,1.0,1.18)*.82;
          }else{
            c=mix(base,refl,.14+f*.24);
            c*=.38+d*.84;
            c+=f*vec3(.22,.64,.94)*.52;
          }
          if(id>6.5&&id<7.5)c+=vec3(.42,1.02,1.42)*(1.25+pulse);
        }

        c+=glow*mix(vec3(.16,.82,1.22),vec3(.74,.24,1.12),sat(uScroll));
        float aberration=(uv.x*uPointer.x+uv.y*uPointer.y)*.006+uVelocity*.0012;
        c.r*=1.+aberration;c.b*=1.-aberration*.60;
        float vignette=1.-smoothstep(.48,1.25,length(uv));c*=.80+.20*vignette;
        c=c/(1.+c);c=pow(c,vec3(.80,.87,.95));
        c+=(hash21(gl_FragCoord.xy+fract(uTime)*91.)-.5)/340.;
        outColor=vec4(c,1.);
      }
    `;

    let shaderProgram;
    try {
      shaderProgram = link(gl, vertexSource, fragmentSource);
    } catch (error) {
      console.warn('FormatX Native Apex shader fallback:', error);
      root.dataset.fxNativeApexError = 'shader';
      return null;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(shaderProgram, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {};
    ['uResolution','uPointer','uTime','uScroll','uScene','uVelocity','uQuality'].forEach(name => { uniforms[name] = gl.getUniformLocation(shaderProgram, name); });
    let width = 1;
    let height = 1;
    let raf = 0;
    let frames = 0;
    let sampleStarted = performance.now();
    let lastFrame = 0;
    const started = performance.now();

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, coarse.matches ? 1.25 : 1.5);
      const scale = clamp(state.quality, coarse.matches ? .62 : .56, 1);
      width = Math.max(2, Math.floor(innerWidth * dpr * scale));
      height = Math.max(2, Math.floor(innerHeight * dpr * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      gl.viewport(0, 0, width, height);
    }

    function adapt(now) {
      frames += 1;
      const elapsed = now - sampleStarted;
      if (elapsed < 1800) return;
      const fps = frames / (elapsed / 1000);
      state.fps = fps;
      frames = 0;
      sampleStarted = now;
      const min = coarse.matches ? .62 : .56;
      const max = coarse.matches ? .92 : 1;
      if (fps < (coarse.matches ? 28 : 45)) state.targetQuality = clamp(state.targetQuality - .055, min, max);
      else if (fps > (coarse.matches ? 34 : 57)) state.targetQuality = clamp(state.targetQuality + .028, min, max);
      if (Math.abs(state.targetQuality - state.quality) > .035) {
        state.quality = state.targetQuality;
        resize();
      }
      if (fpsOutput) fpsOutput.textContent = Math.round(fps) + ' / Q' + Math.round(state.quality * 100);
    }

    function render(now) {
      raf = requestAnimationFrame(render);
      if (!state.visible || root.dataset.fxImmersive !== 'active') return;
      const targetFps = coarse.matches ? 36 : 60;
      if (now - lastFrame < 1000 / targetFps) return;
      lastFrame = now;
      resize();
      gl.useProgram(shaderProgram);
      gl.uniform2f(uniforms.uResolution, width, height);
      gl.uniform2f(uniforms.uPointer, state.pointerX, state.pointerY);
      gl.uniform1f(uniforms.uTime, state.reduced ? 0 : (now - started) * .001);
      gl.uniform1f(uniforms.uScroll, state.smoothScroll);
      gl.uniform1f(uniforms.uScene, state.smoothScene);
      gl.uniform1f(uniforms.uVelocity, state.velocity);
      gl.uniform1f(uniforms.uQuality, state.quality);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      adapt(now);
    }

    addEventListener('resize', resize, { passive: true });
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      root.dataset.fxNativeApexError = 'context-lost';
      cancelAnimationFrame(raf);
    });
    canvas.addEventListener('webglcontextrestored', () => {
      root.dataset.fxNativeApexError = 'context-restored-reload-required';
    });
    resize();
    if (state.reduced) render(started + 16);
    else raf = requestAnimationFrame(render);
    mode.textContent = 'WEBGL2 / STAR CRYSTAL SDF';

    return {
      destroy() {
        cancelAnimationFrame(raf);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(shaderProgram);
      }
    };
  }

  function createFallback(canvas, mode) {
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return null;
    let raf = 0;
    let width = 1;
    let height = 1;
    let last = 0;
    const particles = Array.from({ length: coarse.matches ? 110 : 190 }, () => ({ a: Math.random()*Math.PI*2, r: .12+Math.random()*.43, z: Math.random(), s: .3+Math.random()*1.1 }));
    function resize(){width=canvas.width=Math.max(1,Math.floor(innerWidth*Math.min(devicePixelRatio||1,1.15)));height=canvas.height=Math.max(1,Math.floor(innerHeight*Math.min(devicePixelRatio||1,1.15)));canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';}
    function draw(now){raf=requestAnimationFrame(draw);if(!state.visible||now-last<33)return;last=now;context.fillStyle='#02060b';context.fillRect(0,0,width,height);const cx=width*.5,cy=height*.46,scale=Math.min(width,height)*(.22+state.smoothScroll*.025);particles.forEach((p,i)=>{p.a+=(state.reduced?0:.0014+p.z*.0018);const r=scale*(p.r+Math.sin(now*.0005+i)*.02);const x=cx+Math.cos(p.a+state.smoothScene*.65)*r,y=cy+Math.sin(p.a*1.3+state.smoothScene*.4)*r*.74;context.fillStyle='rgba(150,225,255,'+(.11+p.z*.43)+')';context.beginPath();context.arc(x,y,p.s+p.z,0,Math.PI*2);context.fill();});}
    resize();addEventListener('resize',resize,{passive:true});raf=requestAnimationFrame(draw);mode.textContent='CANVAS2D / SAFE';return{destroy(){cancelAnimationFrame(raf);}};
  }

  function createFooterField(canvas) {
    if (!canvas) return null;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return null;
    const offscreen = document.createElement('canvas');
    const off = offscreen.getContext('2d', { willReadFrequently: true });
    let width = 1;
    let height = 1;
    let dpr = 1;
    let visible = false;
    let raf = 0;
    let last = 0;
    let localPointer = { x: -9999, y: -9999 };
    const particles = [];

    function sample(count) {
      offscreen.width = 820; offscreen.height = 220;
      off.clearRect(0,0,820,220); off.fillStyle='#fff'; off.textAlign='center'; off.textBaseline='middle'; off.font='900 154px Arial Black,Arial,sans-serif'; off.fillText('FORMATX',410,110);
      const data=off.getImageData(0,0,820,220).data, points=[];
      for(let y=4;y<220;y+=6){for(let x=4;x<820;x+=6){if(data[(y*820+x)*4+3]>100)points.push([x/820,y/220]);}}
      return Array.from({length:count},(_,i)=>points[Math.floor(i*points.length/count)]||[Math.random(),Math.random()]);
    }

    function resize(){const rect=canvas.parentElement.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);dpr=Math.min(devicePixelRatio||1,1.2);canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);canvas.style.width=width+'px';canvas.style.height=height+'px';context.setTransform(dpr,0,0,dpr,0,0);const count=coarse.matches?180:420,targets=sample(count);particles.length=0;for(let i=0;i<count;i++)particles.push({x:Math.random()*width,y:Math.random()*height,vx:0,vy:0,z:Math.random(),target:targets[i]});}
    function draw(now){raf=requestAnimationFrame(draw);if(!visible||!state.visible||now-last<33)return;last=now;context.clearRect(0,0,width,height);context.globalCompositeOperation='lighter';particles.forEach(p=>{let tx=width*(.08+p.target[0]*.84),ty=height*(.33+p.target[1]*.36);const dx=p.x-localPointer.x,dy=p.y-localPointer.y,d=Math.hypot(dx,dy)+1;if(d<130){const f=(1-d/130)*.35;tx+=dx/d*f*100;ty+=dy/d*f*100;}p.vx+=(tx-p.x)*.003;p.vy+=(ty-p.y)*.003;p.vx*=.9;p.vy*=.9;p.x+=p.vx;p.y+=p.vy;const speed=Math.hypot(p.vx,p.vy),hue=190+p.z*72+speed*7;context.fillStyle='hsla('+hue+',90%,72%,'+(.18+p.z*.5)+')';context.beginPath();context.arc(p.x,p.y,.55+p.z*1.4+Math.min(speed,1.4),0,Math.PI*2);context.fill();});context.globalCompositeOperation='source-over';}

    const footer=canvas.parentElement;
    const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);},{rootMargin:'180px'}):null;
    observer?.observe(footer); if(!observer)visible=true;
    footer.addEventListener('pointermove',event=>{const rect=footer.getBoundingClientRect();localPointer={x:event.clientX-rect.left,y:event.clientY-rect.top};},{passive:true});
    footer.addEventListener('pointerleave',()=>{localPointer={x:-9999,y:-9999};},{passive:true});
    resize();addEventListener('resize',resize,{passive:true});raf=requestAnimationFrame(draw);
    return{destroy(){cancelAnimationFrame(raf);observer?.disconnect();}};
  }

  function createSoundscape(button) {
    let context = null;
    let master = null;
    let enabled = false;
    function build(){const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return false;context=new AudioContext();master=context.createGain();master.gain.value=0;master.connect(context.destination);[43.65,65.41,98].forEach((frequency,index)=>{const oscillator=context.createOscillator(),filter=context.createBiquadFilter(),gain=context.createGain();oscillator.type=index===0?'sine':'triangle';oscillator.frequency.value=frequency;filter.type='lowpass';filter.frequency.value=170+index*125;gain.gain.value=index===0?.07:.015;oscillator.connect(filter).connect(gain).connect(master);oscillator.start();});return true;}
    function set(next){if(!context&&!build())return;context.resume();enabled=next;master.gain.cancelScheduledValues(context.currentTime);master.gain.linearRampToValueAtTime(enabled?.2:0,context.currentTime+(enabled?.7:.3));state.sound=enabled;button.setAttribute('aria-pressed',String(enabled));button.querySelector('span').textContent=enabled?'SOUND ON':'SOUND OFF';}
    button.addEventListener('click',()=>set(!enabled));
    return{destroy(){if(context)context.close();}};
  }

  const surface = installSurface();
  const renderer = createRenderer(surface.canvas, surface.hud.querySelector('[data-fx-apex-mode]'), surface.hud.querySelector('[data-fx-apex-fps]')) || createFallback(surface.canvas, surface.hud.querySelector('[data-fx-apex-mode]'));
  const footerField = createFooterField(surface.footerCanvas);
  const soundscape = createSoundscape(surface.sound);

  function updateScene() {
    const center = scrollY + innerHeight * .5;
    let nearest = 0;
    let nearestDistance = Infinity;
    sections.forEach((section,index)=>{const distance=Math.abs(section.offsetTop+section.offsetHeight*.5-center);if(distance<nearestDistance){nearestDistance=distance;nearest=index;}});
    const section=sections[nearest];
    const local=section?clamp((scrollY-(section.offsetTop-innerHeight*.45))/Math.max(1,section.offsetHeight),0,.98):0;
    state.active=nearest;
    state.scene=clamp(nearest+local,0,5);
    const language=root.lang==='en'?'en':'hu';
    const chapter=chapterNames[language][nearest]||chapterNames.hu[0];
    surface.hud.querySelector('[data-fx-apex-chapter]').textContent=String(nearest+1).padStart(2,'0');
    surface.hud.querySelector('[data-fx-apex-title]').textContent=chapter;
  }

  function updateScroll() {
    const current=scrollY,delta=current-state.lastScrollY;state.lastScrollY=current;
    const range=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    state.scroll=clamp(current/range,0,1);
    state.velocity=mix(state.velocity,clamp(delta/Math.max(1,innerHeight)*16,-1.8,1.8),.3);
    root.style.setProperty('--fx-transcend-progress',state.scroll.toFixed(5));
    root.style.setProperty('--fx-transcend-velocity',state.velocity.toFixed(4));
    updateScene();
  }

  function animateState() {
    state.pointerX=mix(state.pointerX,state.targetPointerX,.07);state.pointerY=mix(state.pointerY,state.targetPointerY,.07);state.smoothScroll=mix(state.smoothScroll,state.scroll,.05);state.smoothScene=mix(state.smoothScene,state.scene,.05);state.velocity*=.9;
    root.style.setProperty('--fx-transcend-pointer-x',state.pointerX.toFixed(4));root.style.setProperty('--fx-transcend-pointer-y',state.pointerY.toFixed(4));
    requestAnimationFrame(animateState);
  }

  addEventListener('scroll',updateScroll,{passive:true});
  addEventListener('resize',updateScroll,{passive:true});
  if(fine.matches&&!state.reduced){addEventListener('pointermove',event=>{state.targetPointerX=event.clientX/Math.max(1,innerWidth)*2-1;state.targetPointerY=-(event.clientY/Math.max(1,innerHeight)*2-1);},{passive:true});addEventListener('pointerleave',()=>{state.targetPointerX=0;state.targetPointerY=0;},{passive:true});}
  document.addEventListener('visibilitychange',()=>{state.visible=!document.hidden;});
  document.addEventListener('formatx:languagechange',updateScene);
  reducedMotion.addEventListener?.('change',event=>{state.reduced=event.matches;});

  root.dataset.fxTranscend='ready';
  root.dataset.fxNativeApex='ready';
  root.dataset.fxNativeApexRenderer=surface.canvas.getContext('webgl2')?'webgl2-star-crystal-sdf':'canvas2d-safe';
  root.dataset.fxNativeApexVisual='luminous-star-core-v3';
  root.dataset.fxScrollOwnership='seamless-v7';
  root.dataset.fxSectionSnap='disabled';
  root.dataset.fxInputInterception='none';
  root.dataset.fxApexBenchmark='igloo-floor-plus-functional-system';
  updateScroll();
  animateState();
  dispatchEvent(new CustomEvent('formatx:nativeapexready',{detail:{renderer:root.dataset.fxNativeApexRenderer,visual:'luminous-star-core-v3',scrollOwnership:'seamless-v7'}}));

  addEventListener('pagehide',()=>{renderer?.destroy();footerField?.destroy();soundscape?.destroy();},{once:true});
}());