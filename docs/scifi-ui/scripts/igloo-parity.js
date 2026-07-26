(function () {
  'use strict';

  const ROOT = document.documentElement;
  const BODY = document.body;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
  const MOBILE = matchMedia('(max-width: 820px), (pointer: coarse)');
  const FINE = matchMedia('(hover: hover) and (pointer: fine)');
  const SECTIONS = Array.from(document.querySelectorAll('main > .scene'));
  const TAU = Math.PI * 2;

  if (!BODY || !SECTIONS.length || ROOT.dataset.fxCryosphere === 'ready') return;

  let visible = !document.hidden;
  let sceneIndex = 0;
  let previousScene = -1;
  let scrollProgress = 0;
  let smoothProgress = 0;
  let scrollVelocity = 0;
  let previousScrollY = scrollY;
  let shockStartedAt = -9999;
  let snapping = false;
  let snapFrame = 0;
  let snapTimer = 0;
  let pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let webglRenderer = null;
  let snowRenderer = null;
  let soundscape = null;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function easeInOutCubic(value) {
    return value < .5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  function createElement(tag, className, parent) {
    const element = document.createElement(tag);
    element.className = className;
    (parent || BODY).appendChild(element);
    return element;
  }

  function installLayers() {
    const world = createElement('div', 'fx-cryosphere-world');
    world.setAttribute('aria-hidden', 'true');

    const glCanvas = createElement('canvas', 'fx-cryosphere-canvas', world);
    glCanvas.id = 'fx-cryosphere-canvas';

    const snowCanvas = createElement('canvas', 'fx-cryosphere-snow', world);
    snowCanvas.id = 'fx-cryosphere-snow';

    const aurora = createElement('div', 'fx-cryosphere-aurora', world);
    aurora.innerHTML = '<i></i><i></i><i></i>';

    createElement('div', 'fx-cryosphere-frost', world);
    createElement('div', 'fx-cryosphere-grade', world);
    createElement('div', 'fx-cryosphere-shock', BODY);

    const progress = createElement('div', 'fx-journey-meter', BODY);
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<span></span><i></i><b>FORMATX / CRYOSPHERE</b>';

    const sound = createElement('button', 'fx-sound-toggle', BODY);
    sound.type = 'button';
    sound.setAttribute('aria-pressed', 'false');
    sound.innerHTML = '<span aria-hidden="true">◌</span><b>SOUND OFF</b>';
    sound.addEventListener('click', function () {
      if (!soundscape) soundscape = createSoundscape();
      const enabled = soundscape.toggle();
      sound.setAttribute('aria-pressed', String(enabled));
      sound.querySelector('span').textContent = enabled ? '◉' : '◌';
      sound.querySelector('b').textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
    });

    installIntroCrystal();
    return { glCanvas, snowCanvas };
  }

  function installIntroCrystal() {
    const overlay = document.getElementById('formatx-event-horizon');
    if (!overlay || overlay.querySelector('.fx-intro-ice-construct')) return;
    const construct = createElement('div', 'fx-intro-ice-construct', overlay);
    construct.setAttribute('aria-hidden', 'true');
    construct.innerHTML = [
      '<span class="fx-ice-block a"></span>',
      '<span class="fx-ice-block b"></span>',
      '<span class="fx-ice-block c"></span>',
      '<span class="fx-ice-block d"></span>',
      '<span class="fx-ice-block e"></span>',
      '<span class="fx-ice-core"></span>',
      '<span class="fx-ice-orbit one"></span>',
      '<span class="fx-ice-orbit two"></span>'
    ].join('');
  }

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader) || 'Unknown shader compilation error';
      gl.deleteShader(shader);
      throw new Error(info);
    }
    return shader;
  }

  function linkProgram(gl, vertexSource, fragmentSource) {
    const program = gl.createProgram();
    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program) || 'Unknown WebGL link error';
      gl.deleteProgram(program);
      throw new Error(info);
    }
    return program;
  }

  function createCryosphereRenderer(canvas) {
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance'
    });
    if (!gl) return null;

    const vertexSource = `#version 300 es
      in vec2 aPosition;
      out vec2 vUv;
      void main(){
        vUv=aPosition*.5+.5;
        gl_Position=vec4(aPosition,0.,1.);
      }
    `;

    const fragmentSource = `#version 300 es
      precision highp float;
      out vec4 fragColor;
      in vec2 vUv;
      uniform vec2 uResolution;
      uniform vec2 uPointer;
      uniform float uTime;
      uniform float uScroll;
      uniform float uScene;
      uniform float uShock;
      uniform float uVelocity;
      uniform float uQuality;

      #define MAX_STEPS 84
      #define FAR 13.0
      #define PI 3.14159265359
      #define TAU 6.28318530718

      mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
      float sat(float x){return clamp(x,0.,1.);}
      float hash11(float p){return fract(sin(p*127.1)*43758.5453123);}
      float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
      float hash31(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453123);}
      float noise3(vec3 p){
        vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        float n000=hash31(i+vec3(0,0,0)),n100=hash31(i+vec3(1,0,0));
        float n010=hash31(i+vec3(0,1,0)),n110=hash31(i+vec3(1,1,0));
        float n001=hash31(i+vec3(0,0,1)),n101=hash31(i+vec3(1,0,1));
        float n011=hash31(i+vec3(0,1,1)),n111=hash31(i+vec3(1,1,1));
        return mix(mix(mix(n000,n100,f.x),mix(n010,n110,f.x),f.y),mix(mix(n001,n101,f.x),mix(n011,n111,f.x),f.y),f.z);
      }
      float fbm(vec3 p){float a=.5,v=0.;for(int i=0;i<4;i++){v+=a*noise3(p);p=p*2.03+17.17;a*=.5;}return v;}
      float sdBox(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
      float sdRoundBox(vec3 p,vec3 b,float r){return sdBox(p,b)-r;}
      float sdOcta(vec3 p,float s){p=abs(p);return(p.x+p.y+p.z-s)*.57735027;}
      float sdCapsule(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
      float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*h*k*(1./6.);}

      vec2 mapScene(vec3 p){
        float phase=clamp(uScene,0.,5.);
        float pulse=.5+.5*sin(uTime*1.35);
        float explode=smoothstep(.7,2.6,phase);
        float commerce=smoothstep(2.7,3.35,phase)*(1.-smoothstep(3.8,4.25,phase));
        float beacon=smoothstep(4.5,5.,phase);

        vec3 coreP=p;
        coreP.xz*=rot(.18*uTime+uScroll*1.8);
        coreP.xy*=rot(-.12*uTime+uPointer.y*.12);
        float fracture=(fbm(coreP*2.7+uTime*.08)-.5)*.11;
        float core=sdOcta(coreP,1.42+commerce*.12*pulse)+fracture;
        float inner=sdRoundBox(coreP,vec3(.72,.92,.72),.14);
        core=smin(core,inner,.18);
        vec2 result=vec2(core,1.);

        for(int i=0;i<7;i++){
          float fi=float(i);
          float a=fi/7.*TAU+uScroll*2.25+sin(uTime*.22)*.08;
          float radial=mix(.62,1.75,explode)+sin(fi*2.17+uTime*.55)*.05;
          vec3 bp=p-vec3(cos(a)*radial,(hash11(fi*4.3)-.5)*1.5*explode,sin(a)*radial);
          bp.xz*=rot(-a+.45);
          bp.xy*=rot((hash11(fi+2.1)-.5)*.8+uTime*.025*(mod(fi,2.)*2.-1.));
          vec3 size=vec3(.28+.18*hash11(fi),.52+.46*hash11(fi+4.7),.22+.2*hash11(fi+9.));
          size*=mix(.2,1.,explode);
          float block=sdRoundBox(bp,size,.075)+(fbm(bp*5.+fi)-.5)*.035;
          result = block<result.x ? vec2(block,2.+mod(fi,3.)) : result;
        }

        float ringRadius=mix(.8,1.85,explode);
        float ring=abs(length(p.xz)-ringRadius)-mix(.012,.035,commerce);
        ring=max(ring,abs(p.y)-(.2+commerce*.36));
        result = ring<result.x ? vec2(ring,5.) : result;

        vec3 heartP=p;
        heartP.y-=sin(uTime*1.8)*.04;
        float heart=length(heartP)-(.28+commerce*(.16+.06*pulse));
        heart=max(heart,-sdOcta(heartP,1.1));
        if(commerce>0.) result = heart<result.x ? vec2(heart,6.) : result;

        float spine=sdCapsule(p,vec3(0,-1.7,0),vec3(0,1.9,0),.045+.025*smoothstep(3.6,4.4,phase));
        if(phase>3.55) result=spine<result.x?vec2(spine,7.):result;

        vec3 beaconP=p-vec3(0,1.2+beacon*.5,0);
        float beaconCore=length(beaconP)-mix(.1,.34,beacon)*(1.+.12*sin(uTime*4.));
        if(beacon>0.) result=beaconCore<result.x?vec2(beaconCore,8.):result;

        float floorNoise=(fbm(vec3(p.xz*1.35,uTime*.025))-.5)*.08;
        float ground=p.y+1.72+floorNoise;
        if(ground<result.x) result=vec2(ground,9.);
        return result;
      }

      vec3 normalAt(vec3 p){
        vec2 e=vec2(.0018,0.);
        return normalize(vec3(
          mapScene(p+e.xyy).x-mapScene(p-e.xyy).x,
          mapScene(p+e.yxy).x-mapScene(p-e.yxy).x,
          mapScene(p+e.yyx).x-mapScene(p-e.yyx).x));
      }

      float softShadow(vec3 ro,vec3 rd,float mint,float maxt){
        float res=1.,t=mint;
        for(int i=0;i<24;i++){
          float h=mapScene(ro+rd*t).x;
          res=min(res,12.*h/t);
          t+=clamp(h,.025,.18);
          if(h<.001||t>maxt)break;
        }
        return clamp(res,0.,1.);
      }

      float ambientOcclusion(vec3 p,vec3 n){
        float occ=0.,scale=1.;
        for(int i=1;i<=5;i++){
          float h=.055*float(i);
          float d=mapScene(p+n*h).x;
          occ+=(h-d)*scale;
          scale*=.72;
        }
        return clamp(1.-occ*2.2,0.,1.);
      }

      mat3 cameraBasis(vec3 ro,vec3 ta,float roll){
        vec3 cw=normalize(ta-ro);
        vec3 cp=vec3(sin(roll),cos(roll),0.);
        vec3 cu=normalize(cross(cw,cp));
        vec3 cv=normalize(cross(cu,cw));
        return mat3(cu,cv,cw);
      }

      vec3 sky(vec3 rd){
        float horizon=pow(sat(1.-abs(rd.y)),4.);
        float aurora=pow(sat(sin(rd.x*5.2+uTime*.12)*.5+.5),5.)*pow(sat(rd.y+.15),2.);
        vec3 col=mix(vec3(.004,.009,.016),vec3(.025,.065,.095),horizon);
        col+=aurora*mix(vec3(.02,.16,.21),vec3(.16,.08,.24),sin(uScroll*PI)*.5+.5)*.32;
        return col;
      }

      vec3 shade(vec3 ro,vec3 rd,float t,float material){
        vec3 p=ro+rd*t;
        vec3 n=normalAt(p);
        vec3 key=normalize(vec3(-.55,.78,.42));
        float diff=max(dot(n,key),0.);
        float rim=pow(1.-max(dot(n,-rd),0.),2.7);
        float spec=pow(max(dot(reflect(-key,n),-rd),0.),64.);
        float shadow=softShadow(p+n*.015,key,.025,5.5);
        float ao=ambientOcclusion(p,n);
        float fresnel=pow(1.-abs(dot(n,-rd)),3.2);
        float veins=fbm(p*5.4+n*1.2);
        float strata=.5+.5*sin((p.y+p.x*.22-p.z*.15)*16.+veins*4.);

        vec3 ice=mix(vec3(.12,.38,.5),vec3(.66,.9,1.),diff*.75+fresnel*.35);
        ice=mix(ice,vec3(.52,.37,.92),sat(uScroll*.72+uPointer.x*.08));
        ice+=vec3(.23,.66,.86)*pow(strata,12.)*.28;
        ice*=.2+.8*ao*(.35+.65*shadow);
        ice+=rim*mix(vec3(.2,.72,1.),vec3(.68,.42,1.),uScroll)*1.1;
        ice+=spec*vec3(1.1,1.25,1.35);

        if(material>5.5&&material<6.5){
          ice=mix(ice,vec3(1.,.4,.12),.82);
          ice+=vec3(1.,.16,.035)*(1.5+.7*sin(uTime*4.));
        } else if(material>7.5&&material<8.5){
          ice=mix(ice,vec3(.65,.92,1.),.8)+vec3(.5,.8,1.)*1.4;
        } else if(material>8.5){
          ice=mix(vec3(.018,.03,.04),vec3(.09,.15,.18),diff)*ao;
          ice+=fresnel*vec3(.12,.28,.35);
        }
        return ice;
      }

      float snowLayer(vec2 uv,float depth,float speed){
        vec2 grid=vec2(18.,11.)*mix(.7,1.6,depth);
        vec2 p=uv*grid;
        p.x+=uTime*speed*(.7+depth)+uVelocity*.02;
        p.y-=uTime*speed*(.34+depth*.22);
        vec2 id=floor(p),f=fract(p)-.5;
        float h=hash21(id+depth*31.7);
        f.x+=sin(uTime*(.7+h)+h*TAU)*.26;
        f.y+=cos(uTime*(.35+h*.3)+h*TAU)*.12;
        float d=length(f);
        return smoothstep(.065,.0,d)*step(.72,h);
      }

      void main(){
        vec2 frag=gl_FragCoord.xy;
        vec2 uv=(frag*2.-uResolution)/uResolution.y;
        vec2 rawUv=uv;

        float waveCenter=mix(-.15,1.75,uShock);
        float radial=length(uv);
        float shockWave=exp(-pow((radial-waveCenter)*22.,2.))*(1.-uShock);
        uv+=normalize(uv+1e-4)*shockWave*.075;
        uv.x+=sin(uv.y*28.+uTime*5.)*uVelocity*.0007;

        float cameraAngle=-.5+uScroll*5.05+sin(uTime*.11)*.055;
        float radius=mix(5.25,4.15,sin(uScroll*PI)*.65+.2);
        radius-=smoothstep(4.45,5.,uScene)*.6;
        vec3 ro=vec3(sin(cameraAngle)*radius,.22+sin(uScroll*TAU)*.44+uPointer.y*.2,cos(cameraAngle)*radius);
        vec3 target=vec3(0,mix(.05,.35,smoothstep(4.,5.,uScene)),0);
        target.x+=uPointer.x*.12;
        mat3 cam=cameraBasis(ro,target,sin(uScroll*PI*2.)*.04);
        vec3 rd=cam*normalize(vec3(uv,1.68));

        float t=0.,material=0.,glow=0.;
        vec2 hit=vec2(0.);
        for(int i=0;i<MAX_STEPS;i++){
          vec3 p=ro+rd*t;
          hit=mapScene(p);
          glow+=exp(-13.*abs(hit.x))*.0035;
          if(abs(hit.x)<mix(.0016,.003,uQuality)||t>FAR){material=hit.y;break;}
          t+=hit.x*.72;
        }

        vec3 col=sky(rd);
        if(t<FAR) col=shade(ro,rd,t,material);
        col+=glow*mix(vec3(.1,.55,.85),vec3(.65,.32,1.),uScroll)*1.6;

        float snow=0.;
        snow+=snowLayer(vUv,0.15,.12)*.28;
        snow+=snowLayer(vUv+vec2(.17,.09),.48,.2)*.55;
        snow+=snowLayer(vUv+vec2(.37,.21),.88,.34)*.82;
        col+=snow*vec3(.72,.9,1.);

        float frost=fbm(vec3(rawUv*3.2,uTime*.025));
        float frostMask=smoothstep(.58,.88,frost+shockWave*.7)*uShock*(1.-uShock)*3.6;
        col=mix(col,vec3(.72,.9,.98),frostMask*.34);

        float edge=pow(sat(length(rawUv)*.72),2.2);
        col.r+=shockWave*.16+edge*.012;
        col.b+=shockWave*.24+edge*.026;
        col.g-=shockWave*.035;

        col=col/(1.+col);
        col=pow(max(col,0.),vec3(.84,.89,.96));
        col*=1.-dot(rawUv,rawUv)*.12;
        col+=hash21(frag+fract(uTime)*71.)/255.;
        float alpha=sat(.28+length(col)*.85);
        fragColor=vec4(col,alpha);
      }
    `;

    let program;
    try {
      program = linkProgram(gl, vertexSource, fragmentSource);
    } catch (error) {
      console.warn('FormatX Cryosphere shader fallback:', error);
      return null;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {};
    ['uResolution', 'uPointer', 'uTime', 'uScroll', 'uScene', 'uShock', 'uVelocity', 'uQuality'].forEach(function (name) {
      uniforms[name] = gl.getUniformLocation(program, name);
    });

    let width = 0;
    let height = 0;
    let raf = 0;
    const started = performance.now();

    function resize() {
      const dpr = Math.min(MOBILE.matches ? 1.05 : 1.45, devicePixelRatio || 1);
      width = Math.max(1, innerWidth);
      height = Math.max(1, innerHeight);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function render(now) {
      raf = requestAnimationFrame(render);
      if (!visible) return;
      const shockAge = clamp((now - shockStartedAt) / 1150, 0, 1);
      gl.useProgram(program);
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.uPointer, pointer.x, pointer.y);
      gl.uniform1f(uniforms.uTime, (now - started) * .001);
      gl.uniform1f(uniforms.uScroll, smoothProgress);
      gl.uniform1f(uniforms.uScene, smoothProgress * Math.max(1, SECTIONS.length - 1));
      gl.uniform1f(uniforms.uShock, shockAge);
      gl.uniform1f(uniforms.uVelocity, scrollVelocity);
      gl.uniform1f(uniforms.uQuality, MOBILE.matches ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    resize();
    addEventListener('resize', resize, { passive: true });
    if (!REDUCE.matches) raf = requestAnimationFrame(render);
    else render(started);

    return {
      destroy: function () {
        cancelAnimationFrame(raf);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      }
    };
  }

  function createSnowRenderer(canvas) {
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return null;
    const particles = [];
    const count = MOBILE.matches ? 150 : 360;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;

    function reset(particle, initial) {
      particle.x = Math.random() * width;
      particle.y = initial ? Math.random() * height : -30;
      particle.z = .12 + Math.random() * .88;
      particle.size = .35 + particle.z * 1.65;
      particle.speed = .18 + particle.z * .92;
      particle.phase = Math.random() * TAU;
      particle.streak = Math.random() > .78;
    }

    function resize() {
      dpr = Math.min(MOBILE.matches ? 1 : 1.35, devicePixelRatio || 1);
      width = Math.max(1, innerWidth);
      height = Math.max(1, innerHeight);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles.forEach(function (particle) { reset(particle, true); });
    }

    for (let index = 0; index < count; index += 1) {
      const particle = {};
      particles.push(particle);
    }
    resize();

    function draw(now) {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      context.clearRect(0, 0, width, height);
      const time = now * .001;
      const wind = 18 + Math.sin(time * .18) * 13 + scrollVelocity * 18 + pointer.x * 12;
      context.lineCap = 'round';
      particles.forEach(function (particle) {
        particle.x += (wind * particle.z + Math.sin(time + particle.phase) * 3) * .016;
        particle.y += (26 + particle.speed * 62 + Math.abs(scrollVelocity) * 55) * .016;
        if (particle.y > height + 35 || particle.x > width + 45 || particle.x < -45) reset(particle, false);
        const alpha = (.12 + particle.z * .42) * (1 - Math.abs(particle.z - .55) * .35);
        context.strokeStyle = 'rgba(203,238,255,' + alpha.toFixed(3) + ')';
        context.fillStyle = 'rgba(232,250,255,' + Math.min(.85, alpha * 1.45).toFixed(3) + ')';
        if (particle.streak || Math.abs(scrollVelocity) > .55) {
          context.lineWidth = particle.size * .62;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(particle.x - wind * particle.z * .12, particle.y - (4 + particle.z * 13));
          context.stroke();
        } else {
          context.beginPath();
          context.arc(particle.x, particle.y, particle.size, 0, TAU);
          context.fill();
        }
      });
    }

    addEventListener('resize', resize, { passive: true });
    if (!REDUCE.matches) raf = requestAnimationFrame(draw);
    return { destroy: function () { cancelAnimationFrame(raf); } };
  }

  function createSoundscape() {
    let context = null;
    let master = null;
    let enabled = false;

    function start() {
      if (enabled) return true;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      if (!context) {
        context = new AudioContext();
        master = context.createGain();
        master.gain.value = 0;
        master.connect(context.destination);
        [48, 72, 109].forEach(function (frequency, index) {
          const oscillator = context.createOscillator();
          const filter = context.createBiquadFilter();
          const gain = context.createGain();
          oscillator.type = index === 0 ? 'sine' : 'triangle';
          oscillator.frequency.value = frequency;
          filter.type = 'lowpass';
          filter.frequency.value = 190 + index * 110;
          gain.gain.value = index === 0 ? .08 : .022;
          oscillator.connect(filter).connect(gain).connect(master);
          oscillator.start();
        });
      }
      context.resume();
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.linearRampToValueAtTime(.22, context.currentTime + 1.2);
      enabled = true;
      return true;
    }

    function stop() {
      if (!context || !master) return false;
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.linearRampToValueAtTime(0, context.currentTime + .5);
      enabled = false;
      return false;
    }

    function ping(index) {
      if (!enabled || !context || !master) return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 220 * Math.pow(1.12246, index * 2);
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(.13, context.currentTime + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + 1.35);
      oscillator.connect(gain).connect(master);
      oscillator.start();
      oscillator.stop(context.currentTime + 1.4);
    }

    return {
      toggle: function () { return enabled ? stop() : start(); },
      ping
    };
  }

  function sceneProgressFromScroll() {
    const viewportCenter = scrollY + innerHeight * .5;
    const centers = SECTIONS.map(function (section) {
      return section.offsetTop + section.offsetHeight * .5;
    });
    if (viewportCenter <= centers[0]) return 0;
    if (viewportCenter >= centers[centers.length - 1]) return 1;
    for (let index = 0; index < centers.length - 1; index += 1) {
      if (viewportCenter >= centers[index] && viewportCenter <= centers[index + 1]) {
        const local = (viewportCenter - centers[index]) / Math.max(1, centers[index + 1] - centers[index]);
        return (index + local) / Math.max(1, centers.length - 1);
      }
    }
    return 0;
  }

  function updateSectionPresence() {
    const viewportCenter = scrollY + innerHeight * .5;
    let nearest = 0;
    let nearestDistance = Infinity;
    SECTIONS.forEach(function (section, index) {
      const center = section.offsetTop + section.offsetHeight * .5;
      const distance = Math.abs(center - viewportCenter);
      const presence = clamp(1 - distance / Math.max(innerHeight * .9, section.offsetHeight * .72), 0, 1);
      const signed = clamp((center - viewportCenter) / innerHeight, -1.4, 1.4);
      section.style.setProperty('--fx-presence', presence.toFixed(4));
      section.style.setProperty('--fx-section-offset', signed.toFixed(4));
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });
    sceneIndex = nearest;
    if (sceneIndex !== previousScene) {
      previousScene = sceneIndex;
      shockStartedAt = performance.now();
      ROOT.dataset.fxCryoScene = String(sceneIndex);
      ROOT.classList.remove('fx-shockwave');
      void ROOT.offsetWidth;
      ROOT.classList.add('fx-shockwave');
      if (soundscape) soundscape.ping(sceneIndex);
      dispatchEvent(new CustomEvent('formatx:cryoscene', { detail: { scene: sceneIndex } }));
    }
  }

  function updateScroll() {
    const current = scrollY;
    const delta = current - previousScrollY;
    previousScrollY = current;
    scrollVelocity += (clamp(delta / Math.max(1, innerHeight), -.1, .1) * 12 - scrollVelocity) * .28;
    scrollProgress = sceneProgressFromScroll();
    updateSectionPresence();
    ROOT.style.setProperty('--fx-journey', scrollProgress.toFixed(5));
    ROOT.style.setProperty('--fx-scroll-velocity', scrollVelocity.toFixed(4));
  }

  function animateState() {
    pointer.x += (pointer.tx - pointer.x) * .07;
    pointer.y += (pointer.ty - pointer.y) * .07;
    smoothProgress += (scrollProgress - smoothProgress) * .055;
    scrollVelocity *= .91;
    ROOT.style.setProperty('--fx-pointer-x', pointer.x.toFixed(4));
    ROOT.style.setProperty('--fx-pointer-y', pointer.y.toFixed(4));
    requestAnimationFrame(animateState);
  }

  function cancelSnap() {
    if (!snapping) return;
    snapping = false;
    cancelAnimationFrame(snapFrame);
  }

  function smoothSnapTo(target) {
    cancelSnap();
    const start = scrollY;
    const distance = target - start;
    if (Math.abs(distance) < 4) return;
    snapping = true;
    const duration = clamp(520 + Math.abs(distance) * .18, 520, 920);
    const began = performance.now();
    function frame(now) {
      if (!snapping) return;
      const progress = clamp((now - began) / duration, 0, 1);
      scrollTo(0, start + distance * easeInOutCubic(progress));
      if (progress < 1) snapFrame = requestAnimationFrame(frame);
      else snapping = false;
    }
    snapFrame = requestAnimationFrame(frame);
  }

  function scheduleSnap(event) {
    if (REDUCE.matches || MOBILE.matches || event?.target?.closest('input,select,textarea,button,[contenteditable=true],#pricing')) return;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(function () {
      if (Math.abs(scrollVelocity) > .22 || snapping) return;
      const viewportCenter = scrollY + innerHeight * .5;
      let targetSection = null;
      let distance = Infinity;
      SECTIONS.forEach(function (section) {
        const center = section.offsetTop + section.offsetHeight * .5;
        const currentDistance = Math.abs(center - viewportCenter);
        if (currentDistance < distance) {
          distance = currentDistance;
          targetSection = section;
        }
      });
      if (!targetSection || distance > innerHeight * .58) return;
      smoothSnapTo(targetSection.offsetTop + targetSection.offsetHeight * .5 - innerHeight * .5);
    }, 520);
  }

  function bindInteraction() {
    addEventListener('pointermove', function (event) {
      pointer.tx = event.clientX / Math.max(1, innerWidth) * 2 - 1;
      pointer.ty = -(event.clientY / Math.max(1, innerHeight) * 2 - 1);
    }, { passive: true });
    addEventListener('pointerleave', function () { pointer.tx = 0; pointer.ty = 0; });
    addEventListener('scroll', function (event) { updateScroll(); scheduleSnap(event); }, { passive: true });
    addEventListener('wheel', function (event) { cancelSnap(); scheduleSnap(event); }, { passive: true });
    addEventListener('touchstart', cancelSnap, { passive: true });
    addEventListener('resize', updateScroll, { passive: true });
    document.addEventListener('visibilitychange', function () { visible = !document.hidden; });
  }

  const layers = installLayers();
  webglRenderer = createCryosphereRenderer(layers.glCanvas);
  snowRenderer = createSnowRenderer(layers.snowCanvas);
  bindInteraction();
  updateScroll();
  animateState();

  ROOT.dataset.fxCryosphere = 'ready';
  ROOT.dataset.fxCryosphereRenderer = webglRenderer ? 'webgl2' : 'css-fallback';
  dispatchEvent(new CustomEvent('formatx:cryosphereready', {
    detail: { renderer: ROOT.dataset.fxCryosphereRenderer }
  }));

  addEventListener('pagehide', function () {
    webglRenderer?.destroy();
    snowRenderer?.destroy();
    cancelSnap();
  }, { once: true });
}());
