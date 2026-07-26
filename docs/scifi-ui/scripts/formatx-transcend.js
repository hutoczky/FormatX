(function () {
  'use strict';

  const ROOT = document.documentElement;
  const BODY = document.body;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
  const MOBILE = matchMedia('(max-width: 820px), (pointer: coarse)');
  const FINE = matchMedia('(hover: hover) and (pointer: fine)');
  const SECTIONS = Array.from(document.querySelectorAll('main > .scene'));
  const SECTION_IDS = ['hero', 'experience', 'capabilities', 'pricing', 'system', 'resources'];
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
    shock: 1,
    lastScrollY: scrollY,
    reduced: REDUCE.matches,
    quality: MOBILE.matches ? 0.58 : 0.88,
    targetQuality: MOBILE.matches ? 0.58 : 0.88,
    snapping: false,
    snapRaf: 0,
    snapTimer: 0,
    sound: false
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = value => value < .5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
  const language = () => ROOT.lang === 'en' ? 'en' : 'hu';

  function el(tag, className, parent) {
    const node = document.createElement(tag);
    node.className = className;
    (parent || BODY).appendChild(node);
    return node;
  }

  function installExperience() {
    const shell = el('div', 'fx-transcend-shell');
    shell.setAttribute('aria-hidden', 'true');

    const canvas = el('canvas', 'fx-transcend-canvas', shell);
    const lens = el('div', 'fx-transcend-lens', shell);
    lens.innerHTML = '<i></i><i></i><i></i>';
    el('div', 'fx-transcend-film', shell);

    const hud = el('aside', 'fx-transcend-hud');
    hud.setAttribute('aria-live', 'polite');
    hud.innerHTML = [
      '<div class="fx-transcend-chapter">',
      '<span data-fx-chapter-number>01</span>',
      '<div><small>FORMATX / LIVE SYSTEM</small><strong data-fx-chapter-title>MAG</strong><p data-fx-chapter-copy>A rendszer felébred.</p></div>',
      '</div>',
      '<div class="fx-transcend-progress" aria-hidden="true"><i></i><b></b></div>',
      '<div class="fx-transcend-telemetry" aria-hidden="true"><span>GPU</span><b data-fx-render-mode>ADAPTIVE</b><span>STATE</span><b data-fx-state>CORE</b></div>'
    ].join('');

    const sound = el('button', 'fx-transcend-sound');
    sound.type = 'button';
    sound.setAttribute('aria-pressed', 'false');
    sound.innerHTML = '<i aria-hidden="true"><b></b><b></b><b></b></i><span>SOUND OFF</span>';

    const footer = document.querySelector('.particle-footer');
    let footerCanvas = null;
    if (footer) {
      footer.classList.add('fx-transcend-footer-stage');
      footerCanvas = el('canvas', 'fx-transcend-footer-canvas', footer);
      const hint = el('div', 'fx-transcend-footer-hint', footer);
      hint.innerHTML = '<span>INTERACTIVE SIGNAL FIELD</span><b>FORMATX</b><small>MOVE / HOVER / SCROLL</small>';
    }

    decorateSections();
    return { canvas, hud, sound, footerCanvas };
  }

  function decorateSections() {
    SECTIONS.forEach((section, index) => {
      section.dataset.fxTranscendSection = String(index);
      const rail = el('span', 'fx-section-scanline', section);
      rail.setAttribute('aria-hidden', 'true');
      const marker = el('span', 'fx-section-coordinate', section);
      marker.setAttribute('aria-hidden', 'true');
      marker.textContent = String(index + 1).padStart(2, '0') + ' / 06';
    });

    document.querySelectorAll('.card,.price-card,.fx-plan-qr-card,.system-grid article').forEach((card, index) => {
      card.dataset.fxTilt = String(index);
    });
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

  function program(gl, vertexSource, fragmentSource) {
    const result = gl.createProgram();
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(result, vertex);
    gl.attachShader(result, fragment);
    gl.linkProgram(result);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(result, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(result) || 'Program link failed';
      gl.deleteProgram(result);
      throw new Error(message);
    }
    return result;
  }

  function createTexture(gl, width, height) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return texture;
  }

  function createTarget(gl, width, height) {
    const texture = createTexture(gl, width, height);
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return { texture, framebuffer, width, height };
  }

  function destroyTarget(gl, target) {
    if (!target) return;
    gl.deleteTexture(target.texture);
    gl.deleteFramebuffer(target.framebuffer);
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

    const vertexSource = `#version 300 es
      in vec2 aPosition;
      out vec2 vUv;
      void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}
    `;

    const sceneSource = `#version 300 es
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
      #define FAR 16.0
      #define MAX_STEPS 92

      mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
      float sat(float x){return clamp(x,0.,1.);}
      float hash11(float p){return fract(sin(p*127.13)*43758.5453);}
      float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float hash31(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float noise3(vec3 p){
        vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(mix(hash31(i),hash31(i+vec3(1,0,0)),f.x),mix(hash31(i+vec3(0,1,0)),hash31(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash31(i+vec3(0,0,1)),hash31(i+vec3(1,0,1)),f.x),mix(hash31(i+vec3(0,1,1)),hash31(i+vec3(1,1,1)),f.x),f.y),f.z);
      }
      float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=noise3(p)*a;p=p*2.07+13.17;a*=.5;}return v;}
      float sdSphere(vec3 p,float r){return length(p)-r;}
      float sdBox(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
      float sdRoundBox(vec3 p,vec3 b,float r){return sdBox(p,b)-r;}
      float sdOcta(vec3 p,float s){p=abs(p);return(p.x+p.y+p.z-s)*.57735027;}
      float sdCapsule(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
      float sdTorus(vec3 p,vec2 t){vec2 q=vec2(length(p.xz)-t.x,p.y);return length(q)-t.y;}
      float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}

      vec2 opUnion(vec2 a,vec2 b){return a.x<b.x?a:b;}

      vec2 coreShape(vec3 p,float phase){
        p.xz*=rot(uTime*.12+uScroll*2.4);
        p.xy*=rot(-uTime*.08+uPointer.y*.12);
        float pulse=1.+sin(uTime*1.7)*.025;
        float crystal=sdOcta(p,1.45*pulse)+(fbm(p*3.2)-.5)*.075;
        float chamber=sdRoundBox(p,vec3(.68,.84,.68),.12);
        float body=smin(crystal,chamber,.2);
        float inner=sdSphere(p,.38+sin(uTime*2.2)*.035);
        vec2 result=vec2(body,1.);
        if(inner<result.x)result=vec2(inner,7.);
        return result;
      }

      vec2 nerveShape(vec3 p,float phase){
        vec2 result=coreShape(p,phase);
        for(int i=0;i<9;i++){
          float fi=float(i);
          float a=fi/9.*TAU+uTime*.035;
          vec3 endpoint=vec3(cos(a)*(1.55+.18*sin(fi*2.3)),sin(fi*1.7)*.75,sin(a)*(1.55+.18*cos(fi*1.4)));
          endpoint.y+=sin(uTime*.8+fi)*.12;
          float branch=sdCapsule(p,normalize(endpoint)*.48,endpoint,.028+.014*sin(fi+uTime));
          result=opUnion(result,vec2(branch,2.+mod(fi,2.)));
          float node=sdSphere(p-endpoint,.10+.025*sin(uTime*1.4+fi));
          result=opUnion(result,vec2(node,6.));
        }
        return result;
      }

      vec2 organShape(vec3 p,float phase){
        vec3 q=p;
        q.xz*=rot(uTime*.08+uScroll*1.8);
        vec2 result=vec2(sdSphere(q,.31),7.);
        for(int i=0;i<6;i++){
          float fi=float(i);
          float a=fi/6.*TAU+uTime*(.04+fi*.002);
          float radius=1.42+.12*sin(uTime*.6+fi);
          vec3 center=vec3(cos(a)*radius,(hash11(fi+3.)-.5)*1.15,sin(a)*radius);
          vec3 b=q-center;
          b.xy*=rot(a*.7+fi);
          float shape=mix(sdOcta(b,.52),sdRoundBox(b,vec3(.31,.46,.28),.08),step(.5,mod(fi,2.)));
          shape+=(fbm(b*5.+fi)-.5)*.035;
          result=opUnion(result,vec2(shape,2.+mod(fi,3.)));
          float link=sdCapsule(q,normalize(center)*.35,center,.022);
          result=opUnion(result,vec2(link,5.));
        }
        return result;
      }

      vec2 commerceShape(vec3 p,float phase){
        vec3 q=p;
        q.xz*=rot(uTime*.18);
        float beat=.5+.5*sin(uTime*2.15);
        float heart=sdSphere(q,.62+beat*.07);
        heart=smin(heart,sdOcta(q,1.02+beat*.08),.22);
        vec2 result=vec2(heart,8.);
        for(int i=0;i<4;i++){
          float fi=float(i);
          vec3 r=q;
          r.xy*=rot(fi*1.07+uTime*.08*(mod(fi,2.)*2.-1.));
          r.yz*=rot(fi*.66);
          float ring=sdTorus(r,vec2(1.02+fi*.22,.018+.008*beat));
          result=opUnion(result,vec2(ring,5.+mod(fi,2.)));
        }
        return result;
      }

      vec2 skeletonShape(vec3 p,float phase){
        vec2 result=vec2(sdCapsule(p,vec3(0,-1.75,0),vec3(0,1.78,0),.075),4.);
        for(int i=0;i<7;i++){
          float fi=float(i);
          float y=-1.35+fi*.45;
          float width=.55+sin(fi*.8)*.24;
          float ribA=sdCapsule(p,vec3(0,y,0),vec3(width,y+.18,.48*sin(fi)),.035);
          float ribB=sdCapsule(p,vec3(0,y,0),vec3(-width,y+.18,-.48*sin(fi)),.035);
          result=opUnion(result,vec2(ribA,3.));
          result=opUnion(result,vec2(ribB,3.));
        }
        vec3 core=p;core.xz*=rot(uTime*.1);
        result=opUnion(result,vec2(sdOcta(core,.72),1.));
        return result;
      }

      vec2 beaconShape(vec3 p,float phase){
        vec3 q=p;
        q.xz*=rot(uTime*.1);
        float pulse=.5+.5*sin(uTime*2.6);
        vec2 result=vec2(sdOcta(q-vec3(0,.25,0),.83+pulse*.06),7.);
        float beam=max(length(q.xz)-(.055+.015*pulse),abs(q.y)-2.7);
        result=opUnion(result,vec2(beam,9.));
        for(int i=0;i<14;i++){
          float fi=float(i);
          float a=fi/14.*TAU+uTime*(.08+.002*fi);
          float r=.95+hash11(fi)*1.25;
          vec3 center=vec3(cos(a)*r,(hash11(fi+5.)-.5)*2.7,sin(a)*r);
          float particle=sdSphere(q-center,.035+.045*hash11(fi+9.));
          result=opUnion(result,vec2(particle,6.));
        }
        return result;
      }

      vec2 mapScene(vec3 p){
        float chapter=clamp(uScene,0.,5.);
        float base=floor(chapter+.0001);
        float local=fract(chapter);
        float transition=smoothstep(.1,.9,local);
        vec3 warped=p;
        float twist=(transition-.5)*.26+uVelocity*.015;
        warped.xz*=rot(twist*warped.y);

        vec2 a;
        vec2 b;
        if(base<.5){a=coreShape(warped,local);b=nerveShape(warped,local);}
        else if(base<1.5){a=nerveShape(warped,local);b=organShape(warped,local);}
        else if(base<2.5){a=organShape(warped,local);b=commerceShape(warped,local);}
        else if(base<3.5){a=commerceShape(warped,local);b=skeletonShape(warped,local);}
        else if(base<4.5){a=skeletonShape(warped,local);b=beaconShape(warped,local);}
        else {a=beaconShape(warped,local);b=a;}

        float dissolve=(fbm(p*2.8+vec3(0,uTime*.08,0))-.5)*.16*sin(transition*3.14159);
        vec2 result=mix(a,b,transition);
        result.x+=dissolve;

        float ground=p.y+2.05+(noise3(vec3(p.xz*.8,uTime*.025))-.5)*.12;
        if(ground<result.x)result=vec2(ground,10.);
        return result;
      }

      vec3 normalAt(vec3 p){
        vec2 e=vec2(.002,0.);
        return normalize(vec3(mapScene(p+e.xyy).x-mapScene(p-e.xyy).x,mapScene(p+e.yxy).x-mapScene(p-e.yxy).x,mapScene(p+e.yyx).x-mapScene(p-e.yyx).x));
      }

      float shadow(vec3 ro,vec3 rd){
        float result=1.,distance=.035;
        for(int i=0;i<22;i++){
          if(float(i)>mix(11.,21.,uQuality))break;
          float h=mapScene(ro+rd*distance).x;
          result=min(result,14.*h/distance);
          distance+=clamp(h,.025,.22);
          if(h<.001||distance>7.)break;
        }
        return sat(result);
      }

      float ao(vec3 p,vec3 n){
        float result=0.,weight=1.;
        for(int i=1;i<=5;i++){
          if(float(i)>mix(3.,5.,uQuality))break;
          float distance=.055*float(i);
          result+=(distance-mapScene(p+n*distance).x)*weight;
          weight*=.7;
        }
        return sat(1.-result*2.4);
      }

      mat3 camera(vec3 ro,vec3 target,float roll){
        vec3 forward=normalize(target-ro);
        vec3 up=vec3(sin(roll),cos(roll),0.);
        vec3 right=normalize(cross(forward,up));
        return mat3(right,normalize(cross(right,forward)),forward);
      }

      vec3 background(vec3 rd){
        float horizon=pow(sat(1.-abs(rd.y)),4.);
        float aurora=pow(sat(sin(rd.x*5.5+uTime*.11+uScroll*4.)*.5+.5),8.)*pow(sat(rd.y+.32),2.);
        float stars=step(.997,hash21(floor((rd.xy+1.)*vec2(520.,310.))))*(.35+.65*hash21(rd.xy*900.));
        vec3 color=mix(vec3(.003,.008,.014),vec3(.018,.055,.085),horizon);
        color+=aurora*mix(vec3(.02,.22,.27),vec3(.23,.08,.34),sat(uScroll))*0.48;
        color+=stars*vec3(.55,.76,1.);
        return color;
      }

      vec3 materialColor(float material,float fresnel,float diff,float pulse){
        vec3 cyan=vec3(.22,.72,.91),violet=vec3(.51,.34,.94),white=vec3(.82,.96,1.);
        vec3 ice=mix(cyan,violet,sat(uScroll*.9));
        ice=mix(ice,white,diff*.58+fresnel*.42);
        if(material>6.5&&material<7.5)ice=mix(ice,white,.75);
        if(material>7.5&&material<8.5)ice=mix(vec3(1.,.25,.06),vec3(1.,.72,.2),pulse);
        if(material>8.5&&material<9.5)ice=vec3(.35,.86,1.)*(1.5+pulse);
        if(material>9.5)ice=mix(vec3(.015,.025,.035),vec3(.09,.16,.19),diff);
        return ice;
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy*2.-uResolution)/uResolution.y;
        float chapter=uScene;
        float angle=-.62+uScroll*5.55+sin(uTime*.1)*.045;
        float radius=5.15-.48*sin(uScroll*3.14159)-.42*smoothstep(4.2,5.,chapter);
        vec3 ro=vec3(sin(angle)*radius,.18+sin(uScroll*TAU)*.42+uPointer.y*.22,cos(angle)*radius);
        vec3 target=vec3(uPointer.x*.14,mix(.02,.35,smoothstep(4.,5.,chapter)),0.);
        mat3 cam=camera(ro,target,sin(uScroll*TAU)*.035);
        vec3 rd=cam*normalize(vec3(uv,1.72));

        float distance=0.,material=0.,glow=0.;
        vec3 p=ro;
        for(int i=0;i<MAX_STEPS;i++){
          if(float(i)>mix(48.,90.,uQuality))break;
          p=ro+rd*distance;
          vec2 hit=mapScene(p);
          material=hit.y;
          glow+=exp(-16.*abs(hit.x))*.0034;
          if(abs(hit.x)<mix(.0032,.0014,uQuality)||distance>FAR)break;
          distance+=hit.x*.7;
        }

        vec3 color=background(rd);
        if(distance<FAR){
          vec3 n=normalAt(p);
          vec3 key=normalize(vec3(-.55,.75,.45));
          float diffuse=max(dot(n,key),0.);
          float fresnel=pow(1.-max(dot(n,-rd),0.),3.2);
          float specular=pow(max(dot(reflect(-key,n),-rd),0.),72.);
          float ambient=ao(p,n);
          float shade=shadow(p+n*.012,key);
          float pulse=.5+.5*sin(uTime*2.2);
          color=materialColor(material,fresnel,diffuse,pulse);
          color*=.18+.82*ambient*(.35+.65*shade);
          color+=fresnel*mix(vec3(.18,.72,1.),vec3(.7,.35,1.),uScroll)*1.15;
          color+=specular*vec3(1.4,1.55,1.7);
          float veins=pow(.5+.5*sin((p.y+p.x*.21-p.z*.18)*18.+fbm(p*5.)*5.),14.);
          color+=veins*vec3(.16,.62,.82)*.28;
        }
        color+=glow*mix(vec3(.08,.7,1.),vec3(.65,.28,1.),uScroll)*1.8;

        float fog=1.-exp(-distance*.035);
        color=mix(color,background(rd),fog);
        outColor=vec4(max(color,0.),1.);
      }
    `;

    const postSource = `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 outColor;
      uniform sampler2D uSceneTexture;
      uniform sampler2D uHistoryTexture;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform float uVelocity;
      uniform float uShock;
      uniform float uHistoryMix;
      uniform float uScroll;

      float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}

      void main(){
        vec2 uv=vUv;
        vec2 centered=uv-.5;
        float radius=length(centered);
        float waveRadius=mix(.0,1.15,uShock);
        float wave=exp(-pow((radius-waveRadius)*31.,2.))*(1.-uShock);
        vec2 direction=normalize(centered+1e-5);
        vec2 warped=uv+direction*wave*.026;
        float aberration=(.0007+abs(uVelocity)*.0035+wave*.008)*(0.35+radius);

        vec3 color;
        color.r=texture(uSceneTexture,warped+direction*aberration).r;
        color.g=texture(uSceneTexture,warped).g;
        color.b=texture(uSceneTexture,warped-direction*aberration).b;

        vec3 bloom=vec3(0.);
        vec2 pixel=1./uResolution;
        bloom+=texture(uSceneTexture,warped+pixel*vec2(3.,0.)).rgb;
        bloom+=texture(uSceneTexture,warped+pixel*vec2(-3.,0.)).rgb;
        bloom+=texture(uSceneTexture,warped+pixel*vec2(0.,3.)).rgb;
        bloom+=texture(uSceneTexture,warped+pixel*vec2(0.,-3.)).rgb;
        bloom+=texture(uSceneTexture,warped+pixel*vec2(2.,2.)).rgb;
        bloom+=texture(uSceneTexture,warped+pixel*vec2(-2.,-2.)).rgb;
        bloom/=6.;
        bloom=max(bloom-.34,0.);
        color+=bloom*.34;

        vec2 historyUv=uv-vec2(uVelocity*.0012,0.);
        vec3 history=texture(uHistoryTexture,historyUv).rgb;
        color=mix(color,history,clamp(uHistoryMix,0.,.22));

        float vignette=1.-smoothstep(.28,.86,radius);
        color*=.78+.22*vignette;
        color+=wave*mix(vec3(.12,.68,1.),vec3(.65,.3,1.),uScroll)*.36;
        color=color/(1.+color);
        color=pow(color,vec3(.82,.88,.96));
        color+=((hash21(gl_FragCoord.xy+fract(uTime)*83.)-.5)/255.)*1.5;
        outColor=vec4(color,1.);
      }
    `;

    const blitSource = `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 outColor;
      uniform sampler2D uTexture;
      void main(){outColor=texture(uTexture,vUv);}
    `;

    let sceneProgram;
    let postProgram;
    let blitProgram;
    try {
      sceneProgram = program(gl, vertexSource, sceneSource);
      postProgram = program(gl, vertexSource, postSource);
      blitProgram = program(gl, vertexSource, blitSource);
    } catch (error) {
      console.warn('FormatX Transcend shader fallback:', error);
      return null;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    function configure(programObject) {
      gl.useProgram(programObject);
      const location = gl.getAttribLocation(programObject, 'aPosition');
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    }

    const sceneUniforms = {};
    const postUniforms = {};
    const blitUniforms = {};
    ['uResolution','uPointer','uTime','uScroll','uScene','uVelocity','uQuality'].forEach(name => sceneUniforms[name]=gl.getUniformLocation(sceneProgram,name));
    ['uSceneTexture','uHistoryTexture','uResolution','uTime','uVelocity','uShock','uHistoryMix','uScroll'].forEach(name => postUniforms[name]=gl.getUniformLocation(postProgram,name));
    ['uTexture'].forEach(name => blitUniforms[name]=gl.getUniformLocation(blitProgram,name));

    let width=1;
    let height=1;
    let sceneTarget=null;
    let historyA=null;
    let historyB=null;
    let historyWrite=historyA;
    let historyRead=historyB;
    let raf=0;
    let frameCount=0;
    let qualityWindowStart=performance.now();
    const started=performance.now();

    function resizeTargets() {
      const dpr=Math.min(devicePixelRatio||1,MOBILE.matches?1.05:1.5);
      const renderScale=clamp(state.quality,.48,1);
      width=Math.max(2,Math.floor(innerWidth*dpr*renderScale));
      height=Math.max(2,Math.floor(innerHeight*dpr*renderScale));
      canvas.width=width;
      canvas.height=height;
      canvas.style.width=innerWidth+'px';
      canvas.style.height=innerHeight+'px';
      destroyTarget(gl,sceneTarget);
      destroyTarget(gl,historyA);
      destroyTarget(gl,historyB);
      sceneTarget=createTarget(gl,width,height);
      historyA=createTarget(gl,width,height);
      historyB=createTarget(gl,width,height);
      historyWrite=historyA;
      historyRead=historyB;
      gl.bindFramebuffer(gl.FRAMEBUFFER,historyA.framebuffer);
      gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER,historyB.framebuffer);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.viewport(0,0,width,height);
    }

    function adapt(now) {
      frameCount+=1;
      const elapsed=now-qualityWindowStart;
      if(elapsed<2200)return;
      const fps=frameCount/(elapsed/1000);
      frameCount=0;
      qualityWindowStart=now;
      if(fps<46)state.targetQuality=clamp(state.targetQuality-.08,MOBILE.matches?.46:.54,1);
      else if(fps>57)state.targetQuality=clamp(state.targetQuality+.04,MOBILE.matches?.72:1,1);
      if(Math.abs(state.targetQuality-state.quality)>.055){
        state.quality=state.targetQuality;
        resizeTargets();
      }
      if(modeOutput)modeOutput.textContent='Q'+Math.round(state.quality*100)+' / '+Math.round(fps)+'FPS';
    }

    function render(now) {
      raf=requestAnimationFrame(render);
      if(!state.visible)return;
      const time=(now-started)*.001;
      state.shock=clamp(state.shock+(1-state.shock)*.045,0,1);

      gl.viewport(0,0,width,height);
      gl.bindFramebuffer(gl.FRAMEBUFFER,sceneTarget.framebuffer);
      configure(sceneProgram);
      gl.uniform2f(sceneUniforms.uResolution,width,height);
      gl.uniform2f(sceneUniforms.uPointer,state.pointerX,state.pointerY);
      gl.uniform1f(sceneUniforms.uTime,time);
      gl.uniform1f(sceneUniforms.uScroll,state.smoothScroll);
      gl.uniform1f(sceneUniforms.uScene,state.smoothScene);
      gl.uniform1f(sceneUniforms.uVelocity,state.velocity);
      gl.uniform1f(sceneUniforms.uQuality,state.quality);
      gl.drawArrays(gl.TRIANGLES,0,3);

      gl.bindFramebuffer(gl.FRAMEBUFFER,historyWrite.framebuffer);
      configure(postProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D,sceneTarget.texture);
      gl.uniform1i(postUniforms.uSceneTexture,0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D,historyRead.texture);
      gl.uniform1i(postUniforms.uHistoryTexture,1);
      gl.uniform2f(postUniforms.uResolution,width,height);
      gl.uniform1f(postUniforms.uTime,time);
      gl.uniform1f(postUniforms.uVelocity,state.velocity);
      gl.uniform1f(postUniforms.uShock,state.shock);
      gl.uniform1f(postUniforms.uHistoryMix,clamp(Math.abs(state.velocity)*.035,0,.18));
      gl.uniform1f(postUniforms.uScroll,state.smoothScroll);
      gl.drawArrays(gl.TRIANGLES,0,3);

      gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      configure(blitProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D,historyWrite.texture);
      gl.uniform1i(blitUniforms.uTexture,0);
      gl.drawArrays(gl.TRIANGLES,0,3);

      const temporary=historyRead;
      historyRead=historyWrite;
      historyWrite=temporary;
      adapt(now);
    }

    function resize() {
      state.quality=state.targetQuality;
      resizeTargets();
    }

    resize();
    addEventListener('resize',resize,{passive:true});
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(raf);});
    if(!state.reduced)raf=requestAnimationFrame(render);
    else render(started+16);

    return {
      destroy(){cancelAnimationFrame(raf);destroyTarget(gl,sceneTarget);destroyTarget(gl,historyA);destroyTarget(gl,historyB);gl.deleteBuffer(buffer);gl.deleteProgram(sceneProgram);gl.deleteProgram(postProgram);gl.deleteProgram(blitProgram);}
    };
  }

  function createFallback(canvas) {
    const context=canvas.getContext('2d');
    if(!context)return null;
    let width=1,height=1,raf=0;
    const particles=Array.from({length:MOBILE.matches?100:220},()=>({a:Math.random()*Math.PI*2,r:.12+Math.random()*.4,z:Math.random(),s:.2+Math.random()}));
    function resize(){width=canvas.width=innerWidth; height=canvas.height=innerHeight; canvas.style.width=width+'px';canvas.style.height=height+'px';}
    function draw(now){
      raf=requestAnimationFrame(draw);if(!state.visible)return;
      context.clearRect(0,0,width,height);
      const gradient=context.createRadialGradient(width*.62,height*.48,10,width*.62,height*.48,Math.min(width,height)*.55);
      gradient.addColorStop(0,'rgba(84,196,230,.18)');gradient.addColorStop(.5,'rgba(70,52,160,.08)');gradient.addColorStop(1,'rgba(1,4,9,0)');
      context.fillStyle='#02060b';context.fillRect(0,0,width,height);context.fillStyle=gradient;context.fillRect(0,0,width,height);
      const cx=width*(.62+state.pointerX*.02),cy=height*(.48-state.pointerY*.02),scale=Math.min(width,height)*(.2+state.smoothScroll*.035);
      particles.forEach((p,index)=>{p.a+=(.0015+p.z*.002)*(1+Math.abs(state.velocity));const radius=scale*(p.r+Math.sin(now*.0005+index)*.025);const x=cx+Math.cos(p.a+state.smoothScene*.7)*radius;const y=cy+Math.sin(p.a*1.3+state.smoothScene*.4)*radius*.72;context.fillStyle='rgba(150,225,255,'+(.12+p.z*.45)+')';context.beginPath();context.arc(x,y,p.s+p.z*1.5,0,Math.PI*2);context.fill();});
    }
    resize();addEventListener('resize',resize,{passive:true});if(!state.reduced)raf=requestAnimationFrame(draw);
    return {destroy(){cancelAnimationFrame(raf);}};
  }

  function createFooterField(canvas) {
    if(!canvas)return null;
    const context=canvas.getContext('2d',{alpha:true});
    if(!context)return null;
    const offscreen=document.createElement('canvas');
    const off=offscreen.getContext('2d',{willReadFrequently:true});
    const particles=[];
    let width=1,height=1,dpr=1,raf=0,targetWord='FORMATX';
    const words=['FORMATX','SAFE','AI','USB'];

    function sampleWord(word,count) {
      const sampleWidth=900,sampleHeight=260;
      offscreen.width=sampleWidth;offscreen.height=sampleHeight;
      off.clearRect(0,0,sampleWidth,sampleHeight);
      off.fillStyle='#fff';off.textAlign='center';off.textBaseline='middle';off.font='900 180px Arial Black,Arial,sans-serif';off.fillText(word,sampleWidth/2,sampleHeight/2);
      const data=off.getImageData(0,0,sampleWidth,sampleHeight).data;
      const available=[];
      for(let y=4;y<sampleHeight;y+=5){for(let x=4;x<sampleWidth;x+=5){if(data[(y*sampleWidth+x)*4+3]>100)available.push([x/sampleWidth,y/sampleHeight]);}}
      const result=[];
      for(let i=0;i<count;i++)result.push(available[Math.floor(i*available.length/count)]||[Math.random(),Math.random()]);
      return result;
    }

    const targets={};
    function ensureTargets(count){words.forEach(word=>targets[word]=sampleWord(word,count));}

    function resize(){
      const rect=canvas.parentElement.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);canvas.style.width=width+'px';canvas.style.height=height+'px';context.setTransform(dpr,0,0,dpr,0,0);
      const count=MOBILE.matches?360:720;particles.length=0;ensureTargets(count);
      for(let i=0;i<count;i++)particles.push({x:width*(.5+(Math.random()-.5)*.8),y:height*(.5+(Math.random()-.5)*.8),vx:0,vy:0,z:Math.random(),i});
    }

    function targetFor(particle){const point=targets[targetWord]?.[particle.i]||[.5,.5];return {x:width*(.08+point[0]*.84),y:height*(.34+point[1]*.35)};}

    function draw(){
      raf=requestAnimationFrame(draw);if(!state.visible)return;
      context.clearRect(0,0,width,height);context.globalCompositeOperation='lighter';
      particles.forEach((particle,index)=>{
        const target=targetFor(particle);let dx=target.x-particle.x,dy=target.y-particle.y;
        particle.vx+=dx*.0032;particle.vy+=dy*.0032;
        const pointerX=(state.pointerX*.5+.5)*width,pointerY=(-state.pointerY*.5+.5)*height;
        const pdx=particle.x-pointerX,pdy=particle.y-pointerY,dist=Math.hypot(pdx,pdy)+1;
        if(dist<150){const force=(1-dist/150)*.38;particle.vx+=pdx/dist*force;particle.vy+=pdy/dist*force;}
        particle.vx*=.91;particle.vy*=.91;particle.x+=particle.vx;particle.y+=particle.vy;
        const speed=Math.hypot(particle.vx,particle.vy);const hue=190+particle.z*75+speed*8+state.smoothScroll*40;const alpha=.18+particle.z*.52;
        context.fillStyle='hsla('+hue+',88%,72%,'+alpha+')';context.beginPath();context.arc(particle.x,particle.y,.55+particle.z*1.5+Math.min(speed,2),0,Math.PI*2);context.fill();
        if(index%7===0&&speed>.5){context.strokeStyle='hsla('+hue+',90%,70%,'+(alpha*.22)+')';context.beginPath();context.moveTo(particle.x,particle.y);context.lineTo(particle.x-particle.vx*4,particle.y-particle.vy*4);context.stroke();}
      });
      context.globalCompositeOperation='source-over';
    }

    resize();addEventListener('resize',resize,{passive:true});
    const footer=canvas.parentElement;
    footer.addEventListener('pointermove',event=>{const rect=footer.getBoundingClientRect();state.targetPointerX=(event.clientX-rect.left)/rect.width*2-1;state.targetPointerY=-((event.clientY-rect.top)/rect.height*2-1);},{passive:true});
    const links=Array.from(document.querySelectorAll('.site-footer a'));
    links.forEach((link,index)=>{link.addEventListener('pointerenter',()=>{targetWord=words[index%words.length];});link.addEventListener('pointerleave',()=>{targetWord='FORMATX';});});
    if(!state.reduced)raf=requestAnimationFrame(draw);
    return {destroy(){cancelAnimationFrame(raf);}};
  }

  function createSoundscape(button) {
    let context=null,master=null,wind=null,enabled=false;
    function build(){
      const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return false;
      context=new AudioContext();master=context.createGain();master.gain.value=0;master.connect(context.destination);
      [43.65,65.41,98].forEach((frequency,index)=>{const oscillator=context.createOscillator();const filter=context.createBiquadFilter();const gain=context.createGain();oscillator.type=index===0?'sine':'triangle';oscillator.frequency.value=frequency;filter.type='lowpass';filter.frequency.value=180+index*120;gain.gain.value=index===0?.075:.018;oscillator.connect(filter).connect(gain).connect(master);oscillator.start();});
      const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.25;
      wind=context.createBufferSource();const windFilter=context.createBiquadFilter();const windGain=context.createGain();wind.buffer=buffer;wind.loop=true;windFilter.type='bandpass';windFilter.frequency.value=680;windFilter.Q.value=.35;windGain.gain.value=.035;wind.connect(windFilter).connect(windGain).connect(master);wind.start();return true;
    }
    function set(next){if(!context&&!build())return false;context.resume();enabled=next;master.gain.cancelScheduledValues(context.currentTime);master.gain.linearRampToValueAtTime(enabled?.22:0,context.currentTime+(enabled?.8:.35));state.sound=enabled;button.setAttribute('aria-pressed',String(enabled));button.querySelector('span').textContent=enabled?'SOUND ON':'SOUND OFF';return enabled;}
    function chime(index){if(!enabled||!context)return;const oscillator=context.createOscillator();const gain=context.createGain();oscillator.type='sine';oscillator.frequency.value=196*Math.pow(1.12246,index*2);gain.gain.setValueAtTime(.0001,context.currentTime);gain.gain.exponentialRampToValueAtTime(.08,context.currentTime+.02);gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+1.4);oscillator.connect(gain).connect(master);oscillator.start();oscillator.stop(context.currentTime+1.5);}
    button.addEventListener('click',()=>set(!enabled));
    return {chime,destroy(){if(context)context.close();}};
  }

  function updateHud(hud) {
    const chapter=CHAPTERS[language()][state.active]||CHAPTERS.hu[0];
    hud.querySelector('[data-fx-chapter-number]').textContent=chapter[0];
    hud.querySelector('[data-fx-chapter-title]').textContent=chapter[1];
    hud.querySelector('[data-fx-chapter-copy]').textContent=chapter[2];
    hud.querySelector('[data-fx-state]').textContent=SECTION_IDS[state.active].toUpperCase();
  }

  function updateSections() {
    const center=scrollY+innerHeight*.5;
    let nearest=0,nearestDistance=Infinity;
    SECTIONS.forEach((section,index)=>{
      const sectionCenter=section.offsetTop+section.offsetHeight*.5;
      const distance=Math.abs(sectionCenter-center);
      const signed=clamp((sectionCenter-center)/innerHeight,-1.5,1.5);
      const presence=clamp(1-distance/Math.max(innerHeight*.96,section.offsetHeight*.72),0,1);
      section.style.setProperty('--fx-presence',presence.toFixed(4));
      section.style.setProperty('--fx-section-offset',signed.toFixed(4));
      section.classList.toggle('fx-section-active',presence>.56);
      if(distance<nearestDistance){nearestDistance=distance;nearest=index;}
    });
    state.active=nearest;
    state.scene=nearest+sectionLocalProgress(SECTIONS[nearest]);
    if(state.active!==state.previousActive){state.previousActive=state.active;state.shock=0;updateHud(elements.hud);soundscape.chime(state.active);ROOT.dataset.fxTranscendScene=String(state.active);}
  }

  function sectionLocalProgress(section) {
    if(!section)return 0;
    const start=section.offsetTop-innerHeight*.45;
    const span=Math.max(1,section.offsetHeight);
    return clamp((scrollY-start)/span,0,.98);
  }

  function updateScroll() {
    const current=scrollY;
    const delta=current-state.lastScrollY;
    state.lastScrollY=current;
    const range=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    state.scroll=clamp(current/range,0,1);
    state.velocity=mix(state.velocity,clamp(delta/Math.max(1,innerHeight)*18,-2.2,2.2),.35);
    ROOT.style.setProperty('--fx-transcend-progress',state.scroll.toFixed(5));
    ROOT.style.setProperty('--fx-transcend-velocity',state.velocity.toFixed(4));
    updateSections();
    scheduleSnap();
  }

  function animateState() {
    state.pointerX=mix(state.pointerX,state.targetPointerX,.075);
    state.pointerY=mix(state.pointerY,state.targetPointerY,.075);
    state.smoothScroll=mix(state.smoothScroll,state.scroll,.055);
    state.smoothScene=mix(state.smoothScene,state.scene,.045);
    state.velocity*=.9;
    ROOT.style.setProperty('--fx-transcend-pointer-x',state.pointerX.toFixed(4));
    ROOT.style.setProperty('--fx-transcend-pointer-y',state.pointerY.toFixed(4));
    requestAnimationFrame(animateState);
  }

  function cancelSnap() {state.snapping=false;cancelAnimationFrame(state.snapRaf);}

  function snapTo(target) {
    cancelSnap();const start=scrollY,distance=target-start;if(Math.abs(distance)<4)return;
    state.snapping=true;const began=performance.now(),duration=clamp(580+Math.abs(distance)*.13,580,980);
    function frame(now){if(!state.snapping)return;const progress=clamp((now-began)/duration,0,1);scrollTo(0,start+distance*ease(progress));if(progress<1)state.snapRaf=requestAnimationFrame(frame);else state.snapping=false;}
    state.snapRaf=requestAnimationFrame(frame);
  }

  function scheduleSnap() {
    if(state.reduced||MOBILE.matches)return;
    clearTimeout(state.snapTimer);
    state.snapTimer=setTimeout(()=>{
      if(state.snapping||Math.abs(state.velocity)>.17)return;
      const active=SECTIONS[state.active];if(!active||active.id==='pricing')return;
      const target=active.offsetTop+Math.min(active.offsetHeight*.18,innerHeight*.12);
      if(Math.abs(target-scrollY)<innerHeight*.52)snapTo(target);
    },480);
  }

  function bindInteractions() {
    addEventListener('scroll',updateScroll,{passive:true});
    addEventListener('wheel',cancelSnap,{passive:true});
    addEventListener('touchstart',cancelSnap,{passive:true});
    addEventListener('resize',updateScroll,{passive:true});
    addEventListener('pointermove',event=>{state.targetPointerX=event.clientX/Math.max(1,innerWidth)*2-1;state.targetPointerY=-(event.clientY/Math.max(1,innerHeight)*2-1);},{passive:true});
    addEventListener('pointerleave',()=>{state.targetPointerX=0;state.targetPointerY=0;});
    document.addEventListener('visibilitychange',()=>{state.visible=!document.hidden;});
    document.addEventListener('formatx:languagechange',()=>updateHud(elements.hud));

    if(FINE.matches&&!state.reduced){
      document.querySelectorAll('[data-fx-tilt]').forEach(card=>{
        card.addEventListener('pointermove',event=>{const rect=card.getBoundingClientRect();const x=(event.clientX-rect.left)/rect.width-.5;const y=(event.clientY-rect.top)/rect.height-.5;card.style.setProperty('--fx-card-rx',(-y*3.5).toFixed(2)+'deg');card.style.setProperty('--fx-card-ry',(x*5).toFixed(2)+'deg');card.style.setProperty('--cx',((x+.5)*100).toFixed(1)+'%');card.style.setProperty('--cy',((y+.5)*100).toFixed(1)+'%');});
        card.addEventListener('pointerleave',()=>{card.style.setProperty('--fx-card-rx','0deg');card.style.setProperty('--fx-card-ry','0deg');});
      });
    }
  }

  const elements=installExperience();
  const renderer=createRenderer(elements.canvas,elements.hud.querySelector('[data-fx-render-mode]'))||createFallback(elements.canvas);
  const footerField=createFooterField(elements.footerCanvas);
  const soundscape=createSoundscape(elements.sound);

  bindInteractions();
  updateScroll();
  updateHud(elements.hud);
  animateState();

  ROOT.dataset.fxCryosphere='ready';
  ROOT.dataset.fxTranscend='ready';
  ROOT.dataset.fxTranscendRenderer=renderer&&elements.canvas.getContext('webgl2')?'webgl2-multipass':'canvas-fallback';
  dispatchEvent(new CustomEvent('formatx:transcendready',{detail:{renderer:ROOT.dataset.fxTranscendRenderer}}));

  addEventListener('pagehide',()=>{renderer?.destroy();footerField?.destroy();soundscape?.destroy();cancelSnap();},{once:true});
}());