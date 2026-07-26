(function () {
  'use strict';

  const ROOT = document.documentElement;
  const BODY = document.body;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
  const MOBILE = matchMedia('(max-width: 820px), (pointer: coarse)');
  const FINE = matchMedia('(hover: hover) and (pointer: fine)');
  const SECTIONS = Array.from(document.querySelectorAll('main > .scene'));
  const IDS = ['hero', 'experience', 'capabilities', 'pricing', 'system', 'resources'];
  const CHAPTERS = {
    hu: [
      ['01', 'MAG', 'A rendszer felébred.'],
      ['02', 'IDEGRENDSZER', 'Az adat döntési úttá alakul.'],
      ['03', 'RENDSZERSZERVEK', 'Hat modul egyetlen testként dolgozik.'],
      ['04', 'KERESKEDELMI SZÍV', 'A licenc a munkaterheléshez igazodik.'],
      ['05', 'RENDSZERVÁZ', 'Minden művelet ellenőrizhető marad.'],
      ['06', 'JELADÓ', 'A kiadás részecskékből jellé áll össze.']
    ],
    en: [
      ['01', 'CORE', 'The system wakes.'],
      ['02', 'NERVOUS SYSTEM', 'Data becomes a decision path.'],
      ['03', 'SYSTEM ORGANS', 'Six modules operate as one body.'],
      ['04', 'COMMERCE HEART', 'Licensing scales with the workload.'],
      ['05', 'SYSTEM SKELETON', 'Every operation remains verifiable.'],
      ['06', 'BEACON', 'The release resolves from particles into signal.']
    ]
  };

  if (!BODY || !SECTIONS.length || ROOT.dataset.fxTranscend === 'ready') return;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const language = () => ROOT.lang === 'en' ? 'en' : 'hu';

  const state = {
    visible: !document.hidden,
    active: 0,
    previousActive: -1,
    scroll: 0,
    smoothScroll: 0,
    scene: 0,
    smoothScene: 0,
    velocity: 0,
    pointerX: 0,
    pointerY: 0,
    targetPointerX: 0,
    targetPointerY: 0,
    lastScrollY: scrollY,
    quality: MOBILE.matches ? .48 : .62,
    targetQuality: MOBILE.matches ? .48 : .62,
    activityUntil: performance.now() + 1800,
    snapping: false,
    snapFrame: 0,
    snapTimer: 0,
    looping: false,
    loopCount: 0,
    reduced: REDUCE.matches
  };

  function element(tag, className, parent) {
    const node = document.createElement(tag);
    node.className = className;
    (parent || BODY).appendChild(node);
    return node;
  }

  function installExperience() {
    document.querySelectorAll('.fx-transcend-shell,.fx-transcend-hud,.fx-transcend-sound').forEach(node => node.remove());

    const shell = element('div', 'fx-transcend-shell');
    shell.setAttribute('aria-hidden', 'true');
    const canvas = element('canvas', 'fx-transcend-canvas', shell);
    const lens = element('div', 'fx-transcend-lens', shell);
    lens.innerHTML = '<i></i><i></i>';
    element('div', 'fx-transcend-film', shell);

    const hud = element('aside', 'fx-transcend-hud');
    hud.setAttribute('aria-live', 'polite');
    hud.innerHTML = [
      '<div class="fx-transcend-chapter">',
      '<span data-fx-chapter-number>01</span>',
      '<div><small>FORMATX / LIVE SYSTEM</small><strong data-fx-chapter-title>MAG</strong><p data-fx-chapter-copy>A rendszer felébred.</p></div>',
      '</div>',
      '<div class="fx-transcend-progress" aria-hidden="true"><i></i><b></b></div>',
      '<div class="fx-transcend-telemetry" aria-hidden="true"><span>GPU</span><b data-fx-render-mode>LEAN / 1 PASS</b><span>STATE</span><b data-fx-state>CORE</b></div>'
    ].join('');

    const sound = element('button', 'fx-transcend-sound');
    sound.type = 'button';
    sound.setAttribute('aria-pressed', 'false');
    sound.innerHTML = '<i aria-hidden="true"><b></b><b></b><b></b></i><span>SOUND OFF</span>';

    const footer = document.querySelector('.particle-footer');
    let footerCanvas = null;
    if (footer) {
      footer.classList.add('fx-transcend-footer-stage');
      footer.querySelectorAll('.fx-transcend-footer-canvas,.fx-transcend-footer-hint').forEach(node => node.remove());
      footerCanvas = element('canvas', 'fx-transcend-footer-canvas', footer);
      const hint = element('div', 'fx-transcend-footer-hint', footer);
      hint.innerHTML = '<span>INTERACTIVE SIGNAL FIELD</span><b>FORMATX</b><small>MOVE / HOVER / SCROLL</small>';
    }

    SECTIONS.forEach((section, index) => {
      section.dataset.fxTranscendSection = String(index);
      if (!section.querySelector(':scope > .fx-section-scanline')) {
        const line = element('span', 'fx-section-scanline', section);
        line.setAttribute('aria-hidden', 'true');
      }
      if (!section.querySelector(':scope > .fx-section-coordinate')) {
        const coordinate = element('span', 'fx-section-coordinate', section);
        coordinate.setAttribute('aria-hidden', 'true');
        coordinate.textContent = String(index + 1).padStart(2, '0') + ' / 06';
      }
    });

    document.querySelectorAll('.card,.price-card,.fx-plan-qr-card,.system-grid article').forEach((card, index) => {
      card.dataset.fxTilt = String(index);
    });

    return { canvas, hud, sound, footerCanvas };
  }

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'Shader compilation failed';
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
      const message = gl.getProgramInfoLog(program) || 'Program link failed';
      gl.deleteProgram(program);
      throw new Error(message);
    }
    return program;
  }

  function createRenderer(canvas, modeOutput) {
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

    const vertex = `#version 300 es
      in vec2 aPosition;
      out vec2 vUv;
      void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}
    `;

    const fragment = `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 outColor;
      uniform vec2 uResolution;
      uniform vec2 uPointer;
      uniform float uTime;
      uniform float uScroll;
      uniform float uScene;
      uniform float uVelocity;
      uniform float uQuality;

      #define TAU 6.28318530718
      #define FAR 13.0
      #define MAX_STEPS 58

      mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
      float sat(float x){return clamp(x,0.,1.);}
      float hash11(float p){return fract(sin(p*127.13)*43758.5453);}
      float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float hash31(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash31(i),hash31(i+vec3(1,0,0)),f.x),mix(hash31(i+vec3(0,1,0)),hash31(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash31(i+vec3(0,0,1)),hash31(i+vec3(1,0,1)),f.x),mix(hash31(i+vec3(0,1,1)),hash31(i+vec3(1,1,1)),f.x),f.y),f.z);}
      float fbm(vec3 p){float value=0.,amplitude=.5;for(int i=0;i<3;i++){value+=noise3(p)*amplitude;p=p*2.03+11.7;amplitude*=.5;}return value;}
      float sphere(vec3 p,float r){return length(p)-r;}
      float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
      float roundBox(vec3 p,vec3 b,float r){return box(p,b)-r;}
      float octa(vec3 p,float s){p=abs(p);return(p.x+p.y+p.z-s)*.57735027;}
      float capsule(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
      float torus(vec3 p,vec2 t){vec2 q=vec2(length(p.xz)-t.x,p.y);return length(q)-t.y;}
      float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
      vec2 unite(vec2 a,vec2 b){return a.x<b.x?a:b;}

      vec2 core(vec3 p){
        p.xz*=rot(uTime*.10+uScroll*2.0);
        p.xy*=rot(-uTime*.06+uPointer.y*.10);
        float body=smin(octa(p,1.38)+(fbm(p*2.8)-.5)*.06,roundBox(p,vec3(.66,.82,.66),.12),.18);
        vec2 result=vec2(body,1.);
        float inner=sphere(p,.34+sin(uTime*1.8)*.025);
        if(inner<result.x)result=vec2(inner,7.);
        return result;
      }

      vec2 nerves(vec3 p){
        vec2 result=core(p);
        for(int i=0;i<6;i++){
          float fi=float(i),angle=fi/6.*TAU+uTime*.025;
          vec3 end=vec3(cos(angle)*1.55,sin(fi*1.7)*.66,sin(angle)*1.55);
          result=unite(result,vec2(capsule(p,normalize(end)*.46,end,.026),2.+mod(fi,2.)));
          result=unite(result,vec2(sphere(p-end,.085),6.));
        }
        return result;
      }

      vec2 organs(vec3 p){
        vec3 q=p;q.xz*=rot(uTime*.055+uScroll*1.35);
        vec2 result=vec2(sphere(q,.28),7.);
        for(int i=0;i<5;i++){
          float fi=float(i),angle=fi/5.*TAU+uTime*.03;
          vec3 center=vec3(cos(angle)*1.34,(hash11(fi+3.)-.5)*1.0,sin(angle)*1.34);
          vec3 local=q-center;local.xy*=rot(angle*.65+fi);
          float shape=mix(octa(local,.48),roundBox(local,vec3(.29,.42,.27),.07),step(.5,mod(fi,2.)));
          result=unite(result,vec2(shape,2.+mod(fi,3.)));
          result=unite(result,vec2(capsule(q,normalize(center)*.32,center,.02),5.));
        }
        return result;
      }

      vec2 commerce(vec3 p){
        vec3 q=p;q.xz*=rot(uTime*.12);
        float beat=.5+.5*sin(uTime*2.05);
        vec2 result=vec2(smin(sphere(q,.58+beat*.055),octa(q,.98+beat*.06),.2),8.);
        for(int i=0;i<3;i++){
          float fi=float(i);vec3 r=q;r.xy*=rot(fi*1.1+uTime*.05*(mod(fi,2.)*2.-1.));r.yz*=rot(fi*.62);
          result=unite(result,vec2(torus(r,vec2(.96+fi*.24,.018)),5.));
        }
        return result;
      }

      vec2 skeleton(vec3 p){
        vec2 result=vec2(capsule(p,vec3(0,-1.65,0),vec3(0,1.7,0),.065),4.);
        for(int i=0;i<6;i++){
          float fi=float(i),y=-1.2+fi*.43,width=.5+sin(fi*.8)*.2;
          result=unite(result,vec2(capsule(p,vec3(0,y,0),vec3(width,y+.16,.38*sin(fi)),.03),3.));
          result=unite(result,vec2(capsule(p,vec3(0,y,0),vec3(-width,y+.16,-.38*sin(fi)),.03),3.));
        }
        vec3 q=p;q.xz*=rot(uTime*.07);return unite(result,vec2(octa(q,.66),1.));
      }

      vec2 beacon(vec3 p){
        vec3 q=p;q.xz*=rot(uTime*.08);float pulse=.5+.5*sin(uTime*2.3);
        vec2 result=vec2(octa(q-vec3(0,.2,0),.78+pulse*.05),7.);
        result=unite(result,vec2(max(length(q.xz)-(.05+.012*pulse),abs(q.y)-2.45),9.));
        for(int i=0;i<8;i++){
          float fi=float(i),angle=fi/8.*TAU+uTime*.055,r=.95+hash11(fi)*1.0;
          vec3 center=vec3(cos(angle)*r,(hash11(fi+5.)-.5)*2.2,sin(angle)*r);
          result=unite(result,vec2(sphere(q-center,.035+.03*hash11(fi+9.)),6.));
        }
        return result;
      }

      vec2 morph(vec2 a,vec2 b,float t){return mix(a,b,smoothstep(.08,.92,t));}

      vec2 mapScene(vec3 p){
        float chapter=max(uScene,0.);
        float base=floor(chapter+.0001);
        float local=fract(chapter);
        vec3 warped=p;warped.xz*=rot((local-.5)*.16*warped.y+uVelocity*.01);
        vec2 result;
        if(base<.5)result=morph(core(warped),nerves(warped),local);
        else if(base<1.5)result=morph(nerves(warped),organs(warped),local);
        else if(base<2.5)result=morph(organs(warped),commerce(warped),local);
        else if(base<3.5)result=morph(commerce(warped),skeleton(warped),local);
        else if(base<4.5)result=morph(skeleton(warped),beacon(warped),local);
        else if(base<5.5){
          vec2 hero=morph(core(warped),nerves(warped),local);
          result=local<.22?morph(beacon(warped),hero,local/.22):hero;
        } else result=core(warped);
        result.x+=(fbm(p*2.4+vec3(0,uTime*.055,0))-.5)*.055*sin(local*3.14159);
        float ground=p.y+1.92+(noise3(vec3(p.xz*.7,uTime*.02))-.5)*.08;
        if(ground<result.x)result=vec2(ground,10.);
        return result;
      }

      vec3 normalAt(vec3 p){vec2 e=vec2(.0022,0);return normalize(vec3(mapScene(p+e.xyy).x-mapScene(p-e.xyy).x,mapScene(p+e.yxy).x-mapScene(p-e.yxy).x,mapScene(p+e.yyx).x-mapScene(p-e.yyx).x));}
      mat3 camera(vec3 ro,vec3 target){vec3 f=normalize(target-ro),r=normalize(cross(f,vec3(0,1,0)));return mat3(r,normalize(cross(r,f)),f);}
      vec3 sky(vec3 rd){
        float horizon=pow(sat(1.-abs(rd.y)),4.);
        float aurora=pow(sat(sin(rd.x*5.+uTime*.09+uScroll*3.4)*.5+.5),8.)*pow(sat(rd.y+.3),2.);
        float stars=step(.9982,hash21(floor((rd.xy+1.)*vec2(430.,250.))));
        vec3 color=mix(vec3(.003,.008,.014),vec3(.016,.047,.072),horizon);
        color+=aurora*mix(vec3(.02,.2,.24),vec3(.2,.07,.3),sat(uScroll))*.42;
        color+=stars*vec3(.45,.7,1.);return color;
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy*2.-uResolution)/uResolution.y;
        float angle=-.58+mod(uScroll,1.)*5.25+sin(uTime*.08)*.035;
        float radius=4.95-.38*sin(mod(uScroll,1.)*3.14159);
        vec3 ro=vec3(sin(angle)*radius,.16+sin(mod(uScroll,1.)*TAU)*.34+uPointer.y*.16,cos(angle)*radius);
        vec3 rd=camera(ro,vec3(uPointer.x*.11,.08,0))*normalize(vec3(uv,1.68));
        float distance=0.,material=0.,glow=0.;vec3 position=ro;
        for(int i=0;i<MAX_STEPS;i++){
          if(float(i)>mix(36.,56.,uQuality))break;
          position=ro+rd*distance;vec2 hit=mapScene(position);material=hit.y;
          glow+=exp(-14.*abs(hit.x))*.0028;
          if(abs(hit.x)<mix(.0036,.0019,uQuality)||distance>FAR)break;
          distance+=hit.x*.76;
        }
        vec3 color=sky(rd);
        if(distance<FAR){
          vec3 normal=normalAt(position),key=normalize(vec3(-.52,.78,.42));
          float diffuse=max(dot(normal,key),0.),fresnel=pow(1.-max(dot(normal,-rd),0.),3.),spec=pow(max(dot(reflect(-key,normal),-rd),0.),48.);
          vec3 tint=mix(vec3(.18,.66,.86),vec3(.55,.34,.94),sat(mod(uScroll,1.)*.95));
          if(material>7.5&&material<8.5)tint=mix(vec3(1.,.25,.06),vec3(1.,.72,.2),.5+.5*sin(uTime*2.));
          if(material>8.5&&material<9.5)tint=vec3(.34,.84,1.)*1.6;
          if(material>9.5)tint=vec3(.035,.09,.12);
          color=tint*(.16+diffuse*.66)+fresnel*vec3(.35,.78,1.)+spec*vec3(1.2);
          color+=pow(.5+.5*sin((position.y+position.x*.18-position.z*.14)*16.+fbm(position*4.)*4.),14.)*vec3(.1,.52,.72)*.22;
        }
        color+=glow*mix(vec3(.08,.62,1.),vec3(.62,.25,1.),mod(uScroll,1.))*1.45;
        color=mix(color,sky(rd),1.-exp(-distance*.03));
        float vignette=1.-smoothstep(.28,1.1,length(uv));color*=.78+.22*vignette;
        float aberration=abs(uVelocity)*.012;
        color.r+=aberration*sat(uv.x);color.b+=aberration*sat(-uv.x);
        color=color/(1.+color);color=pow(max(color,0.),vec3(.84,.89,.96));
        color+=(hash21(gl_FragCoord.xy+fract(uTime)*77.)-.5)/255.;
        outColor=vec4(color,1.);
      }
    `;

    let shaderProgram;
    try {
      shaderProgram = link(gl, vertex, fragment);
    } catch (error) {
      console.warn('FormatX lean renderer fallback:', error);
      return null;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(shaderProgram);
    const position = gl.getAttribLocation(shaderProgram, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {};
    ['uResolution','uPointer','uTime','uScroll','uScene','uVelocity','uQuality'].forEach(name => {
      uniforms[name] = gl.getUniformLocation(shaderProgram, name);
    });

    let width = 1;
    let height = 1;
    let raf = 0;
    let lastFrame = 0;
    let frameCount = 0;
    let fpsWindow = performance.now();
    const started = performance.now();

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, MOBILE.matches ? 1 : 1.2);
      const baseWidth = Math.max(1, innerWidth * dpr);
      const baseHeight = Math.max(1, innerHeight * dpr);
      const maxPixels = MOBILE.matches ? 520000 : (innerWidth > 2560 ? 950000 : 1250000);
      const targetPixels = maxPixels * (.72 + state.quality * .36);
      const scale = Math.min(1, Math.sqrt(targetPixels / Math.max(1, baseWidth * baseHeight)));
      width = Math.max(320, Math.floor(baseWidth * scale));
      height = Math.max(180, Math.floor(baseHeight * scale));
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      gl.viewport(0, 0, width, height);
    }

    function adapt(now, targetFps) {
      frameCount += 1;
      const elapsed = now - fpsWindow;
      if (elapsed < 2200) return;
      const fps = frameCount / (elapsed / 1000);
      frameCount = 0;
      fpsWindow = now;
      const previous = state.targetQuality;
      if (fps < targetFps - 7) state.targetQuality = clamp(state.targetQuality - .08, MOBILE.matches ? .34 : .42, .82);
      else if (fps > targetFps - 1) state.targetQuality = clamp(state.targetQuality + .035, MOBILE.matches ? .34 : .42, .82);
      if (Math.abs(previous - state.targetQuality) > .045) {
        state.quality = state.targetQuality;
        resize();
      }
      if (modeOutput) modeOutput.textContent = 'Q' + Math.round(state.quality * 100) + ' / ' + Math.round(fps) + 'FPS / 1P';
    }

    function render(now) {
      raf = requestAnimationFrame(render);
      if (!state.visible) return;
      const active = now < state.activityUntil;
      const targetFps = state.reduced ? 12 : (active ? (MOBILE.matches ? 42 : 55) : (MOBILE.matches ? 22 : 30));
      const interval = 1000 / targetFps;
      if (now - lastFrame < interval) return;
      lastFrame = now;

      gl.useProgram(shaderProgram);
      gl.uniform2f(uniforms.uResolution, width, height);
      gl.uniform2f(uniforms.uPointer, state.pointerX, state.pointerY);
      gl.uniform1f(uniforms.uTime, (now - started) * .001);
      gl.uniform1f(uniforms.uScroll, state.smoothScroll);
      gl.uniform1f(uniforms.uScene, state.smoothScene);
      gl.uniform1f(uniforms.uVelocity, state.velocity);
      gl.uniform1f(uniforms.uQuality, state.quality);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      adapt(now, targetFps);
    }

    resize();
    addEventListener('resize', resize, { passive: true });
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      cancelAnimationFrame(raf);
    });
    raf = requestAnimationFrame(render);

    return {
      mode: 'webgl2-lean',
      destroy() {
        cancelAnimationFrame(raf);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(shaderProgram);
      }
    };
  }

  function createFallback(canvas) {
    const context = canvas.getContext('2d');
    if (!context) return null;
    let width = 1;
    let height = 1;
    let raf = 0;
    let lastFrame = 0;
    const particles = Array.from({ length: MOBILE.matches ? 70 : 140 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: .12 + Math.random() * .42,
      depth: Math.random(),
      size: .3 + Math.random() * 1.2
    }));

    function resize() {
      width = canvas.width = Math.min(innerWidth, 1600);
      height = canvas.height = Math.max(1, Math.round(width * innerHeight / Math.max(1, innerWidth)));
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
    }

    function draw(now) {
      raf = requestAnimationFrame(draw);
      if (!state.visible || now - lastFrame < 33) return;
      lastFrame = now;
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#02060b';
      context.fillRect(0, 0, width, height);
      const cx = width * (.62 + state.pointerX * .02);
      const cy = height * (.48 - state.pointerY * .02);
      const scale = Math.min(width, height) * (.2 + state.smoothScroll * .03);
      particles.forEach((particle, index) => {
        particle.angle += .0015 + particle.depth * .002;
        const radius = scale * (particle.radius + Math.sin(now * .0005 + index) * .02);
        const x = cx + Math.cos(particle.angle + state.smoothScene * .7) * radius;
        const y = cy + Math.sin(particle.angle * 1.3 + state.smoothScene * .4) * radius * .72;
        context.fillStyle = 'rgba(150,225,255,' + (.12 + particle.depth * .45) + ')';
        context.beginPath();
        context.arc(x, y, particle.size + particle.depth, 0, Math.PI * 2);
        context.fill();
      });
    }

    resize();
    addEventListener('resize', resize, { passive: true });
    raf = requestAnimationFrame(draw);
    return { mode: 'canvas-fallback', destroy() { cancelAnimationFrame(raf); } };
  }

  function createFooterField(canvas) {
    if (!canvas) return null;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return null;
    const offscreen = document.createElement('canvas');
    const off = offscreen.getContext('2d', { willReadFrequently: true });
    const particles = [];
    const words = ['FORMATX', 'SAFE', 'AI', 'USB'];
    const targets = {};
    let targetWord = 'FORMATX';
    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let visible = false;
    let lastFrame = 0;
    let localPointer = { x: -9999, y: -9999 };

    function sample(word, count) {
      offscreen.width = 760;
      offscreen.height = 220;
      off.clearRect(0, 0, offscreen.width, offscreen.height);
      off.fillStyle = '#fff';
      off.textAlign = 'center';
      off.textBaseline = 'middle';
      off.font = '900 150px Arial Black,Arial,sans-serif';
      off.fillText(word, offscreen.width / 2, offscreen.height / 2);
      const data = off.getImageData(0, 0, offscreen.width, offscreen.height).data;
      const available = [];
      for (let y = 4; y < offscreen.height; y += 6) {
        for (let x = 4; x < offscreen.width; x += 6) {
          if (data[(y * offscreen.width + x) * 4 + 3] > 100) available.push([x / offscreen.width, y / offscreen.height]);
        }
      }
      return Array.from({ length: count }, (_, index) => available[Math.floor(index * available.length / count)] || [Math.random(), Math.random()]);
    }

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(devicePixelRatio || 1, 1.15);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = MOBILE.matches ? 150 : 320;
      words.forEach(word => { targets[word] = sample(word, count); });
      particles.length = 0;
      for (let index = 0; index < count; index += 1) {
        particles.push({ x: Math.random() * width, y: Math.random() * height, vx: 0, vy: 0, depth: Math.random(), index });
      }
    }

    function draw(now) {
      raf = requestAnimationFrame(draw);
      if (!visible || !state.visible || now - lastFrame < 33) return;
      lastFrame = now;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';
      particles.forEach(particle => {
        const target = targets[targetWord]?.[particle.index] || [.5, .5];
        let tx = width * (.08 + target[0] * .84);
        let ty = height * (.34 + target[1] * .35);
        const dx = particle.x - localPointer.x;
        const dy = particle.y - localPointer.y;
        const distance = Math.hypot(dx, dy) + 1;
        if (distance < 125) {
          const force = (1 - distance / 125) * .33;
          tx += dx / distance * force * 95;
          ty += dy / distance * force * 95;
        }
        particle.vx += (tx - particle.x) * .003;
        particle.vy += (ty - particle.y) * .003;
        particle.vx *= .9;
        particle.vy *= .9;
        particle.x += particle.vx;
        particle.y += particle.vy;
        const speed = Math.hypot(particle.vx, particle.vy);
        const hue = 190 + particle.depth * 68 + speed * 6;
        context.fillStyle = 'hsla(' + hue + ',88%,72%,' + (.17 + particle.depth * .5) + ')';
        context.beginPath();
        context.arc(particle.x, particle.y, .55 + particle.depth * 1.35 + Math.min(speed, 1.5), 0, Math.PI * 2);
        context.fill();
      });
      context.globalCompositeOperation = 'source-over';
    }

    const footer = canvas.parentElement;
    new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
    }, { rootMargin: '140px' }).observe(footer);
    footer.addEventListener('pointermove', event => {
      const rect = footer.getBoundingClientRect();
      localPointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }, { passive: true });
    footer.addEventListener('pointerleave', () => { localPointer = { x: -9999, y: -9999 }; });
    document.querySelectorAll('.site-footer a').forEach((link, index) => {
      link.addEventListener('pointerenter', () => { targetWord = words[index % words.length]; });
      link.addEventListener('pointerleave', () => { targetWord = 'FORMATX'; });
    });
    resize();
    addEventListener('resize', resize, { passive: true });
    raf = requestAnimationFrame(draw);
    return { destroy() { cancelAnimationFrame(raf); } };
  }

  function createSoundscape(button) {
    let context = null;
    let master = null;
    let enabled = false;

    function build() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = 0;
      master.connect(context.destination);
      [43.65, 65.41].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();
        oscillator.type = index === 0 ? 'sine' : 'triangle';
        oscillator.frequency.value = frequency;
        filter.type = 'lowpass';
        filter.frequency.value = 180 + index * 140;
        gain.gain.value = index === 0 ? .07 : .016;
        oscillator.connect(filter).connect(gain).connect(master);
        oscillator.start();
      });
      return true;
    }

    function set(next) {
      if (!context && !build()) return;
      context.resume();
      enabled = next;
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.linearRampToValueAtTime(enabled ? .2 : 0, context.currentTime + (enabled ? .7 : .3));
      button.setAttribute('aria-pressed', String(enabled));
      button.querySelector('span').textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
    }

    button.addEventListener('click', () => set(!enabled));
    return { destroy() { if (context) context.close(); } };
  }

  function installInfiniteLoop() {
    const hero = document.getElementById('hero');
    if (!hero) return null;
    document.querySelectorAll('.fx-transcend-loop-bridge').forEach(node => node.remove());
    const clone = hero.cloneNode(true);
    clone.removeAttribute('id');
    clone.removeAttribute('aria-labelledby');
    clone.classList.add('fx-transcend-loop-bridge');
    clone.dataset.fxLoopBridge = 'true';
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    clone.querySelectorAll('[data-reveal]').forEach(node => {
      node.removeAttribute('data-reveal');
      node.classList.add('visible');
    });
    clone.querySelectorAll('a,button,input,select,textarea,[tabindex]').forEach(node => node.setAttribute('tabindex', '-1'));
    clone.querySelectorAll('img').forEach(image => {
      image.loading = 'lazy';
      image.decoding = 'async';
    });
    const label = element('div', 'fx-loop-continuum', clone);
    label.innerHTML = '<span>∞</span><b>CONTINUUM</b><small>BEACON → CORE</small>';
    BODY.appendChild(clone);
    ROOT.dataset.fxInfinite = 'ready';
    ROOT.dataset.fxLoopCount = '0';
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    return { hero, clone };
  }

  function optimiseQrAndImages() {
    document.querySelectorAll('img').forEach(image => {
      image.decoding = 'async';
      if (!image.closest('.brand')) image.loading = 'lazy';
    });

    function applyLocalQr() {
      const currency = document.querySelector('[data-currency][aria-pressed="true"]')?.dataset.currency === 'EUR' ? 'eur' : 'huf';
      document.querySelectorAll('[data-plan-qr]').forEach(card => {
        const plan = card.dataset.planQr;
        const image = card.querySelector('[data-plan-qr-image]');
        if (!image || !plan) return;
        image.onload = () => {
          card.classList.remove('is-qr-loading', 'is-qr-error');
          card.classList.add('is-qr-ready');
        };
        image.onerror = () => {
          card.classList.remove('is-qr-loading', 'is-qr-ready');
          card.classList.add('is-qr-error');
        };
        card.classList.remove('is-qr-error');
        card.classList.add('is-qr-loading');
        image.loading = 'lazy';
        image.fetchPriority = 'low';
        image.src = './assets/qr/' + plan + '-' + currency + '.svg?v=20260726-local-qr-1';
      });
    }

    applyLocalQr();
    document.addEventListener('click', event => {
      if (event.target.closest('[data-currency]')) setTimeout(applyLocalQr, 0);
    });
    addEventListener('pageshow', applyLocalQr);
  }

  function updateHud(hud) {
    const chapter = CHAPTERS[language()][state.active] || CHAPTERS.hu[0];
    hud.querySelector('[data-fx-chapter-number]').textContent = chapter[0];
    hud.querySelector('[data-fx-chapter-title]').textContent = chapter[1];
    hud.querySelector('[data-fx-chapter-copy]').textContent = chapter[2];
    hud.querySelector('[data-fx-state]').textContent = IDS[state.active].toUpperCase();
  }

  let loop = null;

  function localProgress(section) {
    if (!section) return 0;
    const start = section.offsetTop - innerHeight * .45;
    return clamp((scrollY - start) / Math.max(1, section.offsetHeight), 0, .98);
  }

  function updateSections() {
    const center = scrollY + innerHeight * .5;
    let nearest = 0;
    let nearestDistance = Infinity;

    SECTIONS.forEach((section, index) => {
      const sectionCenter = section.offsetTop + section.offsetHeight * .5;
      const distance = Math.abs(sectionCenter - center);
      const signed = clamp((sectionCenter - center) / innerHeight, -1.5, 1.5);
      const presence = clamp(1 - distance / Math.max(innerHeight * .96, section.offsetHeight * .72), 0, 1);
      section.style.setProperty('--fx-presence', presence.toFixed(4));
      section.style.setProperty('--fx-section-offset', signed.toFixed(4));
      section.classList.toggle('fx-section-active', presence > .5);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });

    if (loop && center >= loop.clone.offsetTop) {
      state.active = 5;
      state.scene = 5 + localProgress(loop.clone);
    } else {
      state.active = nearest;
      state.scene = nearest + localProgress(SECTIONS[nearest]);
    }

    if (state.active !== state.previousActive) {
      state.previousActive = state.active;
      ROOT.dataset.fxTranscendScene = String(state.active);
      updateHud(elements.hud);
    }
  }

  function cancelSnap() {
    state.snapping = false;
    cancelAnimationFrame(state.snapFrame);
  }

  function snapTo(target) {
    cancelSnap();
    const start = scrollY;
    const distance = target - start;
    if (Math.abs(distance) < 4) return;
    state.snapping = true;
    const began = performance.now();
    const duration = clamp(480 + Math.abs(distance) * .1, 480, 820);
    function frame(now) {
      if (!state.snapping) return;
      const progress = clamp((now - began) / duration, 0, 1);
      const eased = progress < .5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      scrollTo(0, start + distance * eased);
      if (progress < 1) state.snapFrame = requestAnimationFrame(frame);
      else state.snapping = false;
    }
    state.snapFrame = requestAnimationFrame(frame);
  }

  function scheduleSnap() {
    if (state.reduced || MOBILE.matches || (loop && scrollY > loop.clone.offsetTop - innerHeight)) return;
    clearTimeout(state.snapTimer);
    state.snapTimer = setTimeout(() => {
      if (state.snapping || Math.abs(state.velocity) > .16) return;
      const active = SECTIONS[state.active];
      if (!active || active.id === 'pricing') return;
      const target = active.offsetTop + Math.min(active.offsetHeight * .16, innerHeight * .1);
      if (Math.abs(target - scrollY) < innerHeight * .48) snapTo(target);
    }, 420);
  }

  function transferLoopIfNeeded() {
    if (!loop || state.looping) return;
    const progress = localProgress(loop.clone);
    if (progress < .76) return;
    state.looping = true;
    cancelSnap();
    const relative = scrollY - loop.clone.offsetTop;
    ROOT.classList.add('fx-loop-transfer');
    requestAnimationFrame(() => {
      scrollTo(0, loop.hero.offsetTop + relative);
      state.lastScrollY = scrollY;
      state.scene = localProgress(loop.hero);
      state.smoothScene = state.scene;
      state.scroll = clamp(scrollY / Math.max(1, loop.clone.offsetTop), 0, 1);
      state.smoothScroll = state.scroll;
      state.loopCount += 1;
      ROOT.dataset.fxLoopCount = String(state.loopCount);
      requestAnimationFrame(() => {
        ROOT.classList.remove('fx-loop-transfer');
        state.looping = false;
        dispatchEvent(new CustomEvent('formatx:loop', { detail: { count: state.loopCount } }));
      });
    });
  }

  function updateScroll() {
    const current = scrollY;
    const delta = current - state.lastScrollY;
    state.lastScrollY = current;
    const cycleEnd = loop ? loop.clone.offsetTop : Math.max(1, document.documentElement.scrollHeight - innerHeight);
    state.scroll = current < cycleEnd ? clamp(current / Math.max(1, cycleEnd), 0, 1) : clamp(localProgress(loop.clone), 0, 1);
    state.velocity = mix(state.velocity, clamp(delta / Math.max(1, innerHeight) * 16, -1.8, 1.8), .32);
    state.activityUntil = performance.now() + 850;
    ROOT.style.setProperty('--fx-transcend-progress', state.scroll.toFixed(5));
    ROOT.style.setProperty('--fx-transcend-velocity', state.velocity.toFixed(4));
    updateSections();
    transferLoopIfNeeded();
    scheduleSnap();
  }

  function animateState() {
    state.pointerX = mix(state.pointerX, state.targetPointerX, .07);
    state.pointerY = mix(state.pointerY, state.targetPointerY, .07);
    state.smoothScroll = mix(state.smoothScroll, state.scroll, .05);
    state.smoothScene = mix(state.smoothScene, state.scene, .05);
    state.velocity *= .9;
    ROOT.style.setProperty('--fx-transcend-pointer-x', state.pointerX.toFixed(4));
    ROOT.style.setProperty('--fx-transcend-pointer-y', state.pointerY.toFixed(4));
    requestAnimationFrame(animateState);
  }

  function bindInteractions() {
    addEventListener('scroll', updateScroll, { passive: true });
    addEventListener('wheel', () => { cancelSnap(); state.activityUntil = performance.now() + 900; }, { passive: true });
    addEventListener('touchstart', () => { cancelSnap(); state.activityUntil = performance.now() + 900; }, { passive: true });
    addEventListener('resize', updateScroll, { passive: true });
    addEventListener('pointermove', event => {
      state.targetPointerX = event.clientX / Math.max(1, innerWidth) * 2 - 1;
      state.targetPointerY = -(event.clientY / Math.max(1, innerHeight) * 2 - 1);
      state.activityUntil = performance.now() + 450;
    }, { passive: true });
    addEventListener('pointerleave', () => {
      state.targetPointerX = 0;
      state.targetPointerY = 0;
    });
    document.addEventListener('visibilitychange', () => { state.visible = !document.hidden; });
    document.addEventListener('formatx:languagechange', () => updateHud(elements.hud));

    if (FINE.matches && !state.reduced) {
      document.querySelectorAll('[data-fx-tilt]').forEach(card => {
        card.addEventListener('pointermove', event => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - .5;
          const y = (event.clientY - rect.top) / rect.height - .5;
          card.style.setProperty('--fx-card-rx', (-y * 2.4).toFixed(2) + 'deg');
          card.style.setProperty('--fx-card-ry', (x * 3.4).toFixed(2) + 'deg');
          card.style.setProperty('--cx', ((x + .5) * 100).toFixed(1) + '%');
          card.style.setProperty('--cy', ((y + .5) * 100).toFixed(1) + '%');
        }, { passive: true });
        card.addEventListener('pointerleave', () => {
          card.style.setProperty('--fx-card-rx', '0deg');
          card.style.setProperty('--fx-card-ry', '0deg');
        });
      });
    }
  }

  const elements = installExperience();
  loop = installInfiniteLoop();
  optimiseQrAndImages();
  const renderer = createRenderer(elements.canvas, elements.hud.querySelector('[data-fx-render-mode]')) || createFallback(elements.canvas);
  const footerField = createFooterField(elements.footerCanvas);
  const soundscape = createSoundscape(elements.sound);

  bindInteractions();
  updateScroll();
  updateHud(elements.hud);
  animateState();

  ROOT.dataset.fxCryosphere = 'ready';
  ROOT.dataset.fxTranscend = 'ready';
  ROOT.dataset.fxPerformance = 'balanced';
  ROOT.dataset.fxTranscendRenderer = renderer?.mode || 'none';
  dispatchEvent(new CustomEvent('formatx:transcendready', { detail: { renderer: ROOT.dataset.fxTranscendRenderer, infinite: true } }));

  addEventListener('pagehide', () => {
    renderer?.destroy();
    footerField?.destroy();
    soundscape?.destroy();
    cancelSnap();
  }, { once: true });
}());
