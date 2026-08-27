(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'crystal-organism-r326';
  const READY = 'ready-v69';
  const mobile = matchMedia('(max-width:900px),(pointer:coarse)').matches;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lighting = mobile ? Object.freeze({
    fresnelPower: '2.0',
    innerHeartBase: '.15',
    innerHeartBreath: '.27',
    innerHeartAlpha: '.14',
    innerAlphaMax: '.52',
    rimBase: '.10',
    rimEnergy: '.07',
    rimAlpha: '.035',
    outerHeartBase: '.040',
    outerHeartEnergy: '.055'
  }) : Object.freeze({
    fresnelPower: '2.7',
    innerHeartBase: '.24',
    innerHeartBreath: '.42',
    innerHeartAlpha: '.22',
    innerAlphaMax: '.62',
    rimBase: '.16',
    rimEnergy: '.12',
    rimAlpha: '.08',
    outerHeartBase: '.055',
    outerHeartEnergy: '.08'
  });

  if (root.dataset.fxCrystalOrganismR326 === 'ready' || root.dataset.fxCrystalOrganismR326 === 'booting') return;
  root.dataset.fxCrystalOrganismR326 = 'booting';
  root.dataset.fxCoreMobileV55 = 'booting-v55';
  root.dataset.fxCoreMobileV69 = 'booting-v69';

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'crystal organism shader compile failed';
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
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.bindAttribLocation(program, 1, 'aNormal');
    gl.bindAttribLocation(program, 2, 'aFacet');
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || 'crystal organism program link failed';
      gl.deleteProgram(program);
      throw new Error(message);
    }
    return program;
  }

  function normal(a, b, c) {
    const ab = [b[0]-a[0], b[1]-a[1], b[2]-a[2]];
    const ac = [c[0]-a[0], c[1]-a[1], c[2]-a[2]];
    const n = [
      ab[1]*ac[2]-ab[2]*ac[1],
      ab[2]*ac[0]-ab[0]*ac[2],
      ab[0]*ac[1]-ab[1]*ac[0]
    ];
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    return [n[0]/l, n[1]/l, n[2]/l];
  }

  function buildOrganismGeometry() {
    const p = [
      [ 0.00,  1.09,  0.00],
      [ 0.39,  0.58,  0.05],
      [ 0.86,  0.00,  0.00],
      [ 0.34, -0.49,  0.04],
      [ 0.00, -0.96,  0.00],
      [-0.34, -0.49,  0.04],
      [-0.86,  0.00,  0.00],
      [-0.39,  0.58,  0.05]
    ];
    const front = [0.00, 0.045, 0.62];
    const back  = [0.00, 0.035,-0.39];
    const positions = [];
    const normals = [];
    const facets = [];

    function tri(a, b, c, facet) {
      const n = normal(a, b, c);
      for (const v of [a,b,c]) {
        positions.push(v[0],v[1],v[2]);
        normals.push(n[0],n[1],n[2]);
        facets.push(facet);
      }
    }

    for (let i=0;i<8;i+=1) {
      const next=(i+1)%8;
      const jitter = 0.13 + ((i*37)%11)/17;
      tri(front, p[i], p[next], jitter);
      tri(back, p[next], p[i], 1.0-jitter*0.58);
    }
    return {
      positions:new Float32Array(positions),
      normals:new Float32Array(normals),
      facets:new Float32Array(facets),
      count:positions.length/3
    };
  }

  function boot(attempt=0) {
    const hero = document.getElementById('hero');
    const host = hero?.querySelector('.hero-space');
    if (!(hero instanceof HTMLElement) || !(host instanceof HTMLElement)) {
      if (attempt < 180) requestAnimationFrame(() => boot(attempt+1));
      else root.dataset.fxCrystalOrganismR326 = 'host-unavailable';
      return;
    }

    window.FormatXCoreMobileV69?.destroy?.();
    host.querySelectorAll(':scope > .fx-core-mobile-v55-stage').forEach(node => node.remove());

    const stage = document.createElement('div');
    stage.className = 'fx-core-mobile-v55-stage fx-crystal-organism-r326-stage';
    stage.dataset.renderer = VERSION;
    stage.dataset.active = 'true';
    stage.setAttribute('aria-hidden','true');
    host.prepend(stage);

    const canvas = document.createElement('canvas');
    canvas.className = 'fx-core-mobile-v55-canvas fx-crystal-organism-r326-canvas';
    canvas.setAttribute('aria-hidden','true');
    stage.appendChild(canvas);

    const options = {
      alpha:true,
      antialias:true,
      depth:true,
      stencil:false,
      premultipliedAlpha:false,
      preserveDrawingBuffer:false,
      powerPreference:mobile?'default':'high-performance'
    };
    let gl = canvas.getContext('webgl2', options);
    const webgl2 = Boolean(gl);
    if (!gl) gl = canvas.getContext('webgl', options);
    if (!gl) {
      stage.remove();
      root.dataset.fxCrystalOrganismR326 = 'context-unavailable';
      root.dataset.fxCoreReal3d = 'context-unavailable';
      dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'r326-webgl-unavailable',fallback:'none'}}));
      return;
    }

    const vertexBody = `
      precision highp float;
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute float aFacet;
      uniform float uTime;
      uniform float uEnergy;
      uniform float uBreath;
      uniform float uLayer;
      uniform vec2 uPointer;
      uniform float uAspect;
      varying vec3 vNormal;
      varying vec3 vLocal;
      varying float vFacet;
      mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}
      mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}
      mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,-s,0.,s,c,0.,0.,0.,1.);}
      void main(){
        vec3 local=aPosition;
        float asym=1.0+0.018*sin(aFacet*17.0+uBreath*3.14159);
        local.xy*=asym;
        float layerScale=mix(1.0,.43,uLayer);
        local*=layerScale*(1.0+uBreath*(uLayer>.5?.028:.010));
        mat3 rot=rz(uPointer.x*uPointer.y*.035)*ry(.10+uPointer.x*.23)*rx(-.055-uPointer.y*.15);
        vec3 world=rot*local;
        vNormal=normalize(rot*aNormal);
        vLocal=local;
        vFacet=aFacet;
        float camera=3.35-world.z;
        vec2 projected=vec2(world.x/max(.62,uAspect),world.y)*2.60;
        gl_Position=vec4(projected,world.z*.13,camera);
      }
    `;

    const fragmentBody = `
      precision highp float;
      uniform float uTime;
      uniform float uEnergy;
      uniform float uBreath;
      uniform float uLayer;
      varying vec3 vNormal;
      varying vec3 vLocal;
      varying float vFacet;
      float sat(float v){return clamp(v,0.,1.);}
      void main(){
        vec3 n=normalize(vNormal);
        vec3 view=normalize(vec3(0.,0.,1.));
        vec3 key=normalize(vec3(-.42,.73,.54));
        vec3 side=normalize(vec3(.72,-.18,.66));
        float ndl=max(dot(n,key),0.);
        float sideLight=max(dot(n,side),0.);
        float fresnel=pow(1.0-sat(dot(n,view)),${lighting.fresnelPower});
        float facetPulse=.5+.5*sin(vFacet*23.0+uTime*.42);
        float veinA=abs(sin(vLocal.y*17.0+vLocal.x*11.0+vFacet*7.0));
        float veinB=abs(sin(vLocal.y*9.0-vLocal.x*19.0-vFacet*13.0));
        float veins=pow(1.0-min(veinA,veinB),7.0);
        float heart=pow(sat(1.0-length(vec2(vLocal.x*.92,vLocal.y*1.12))/.52),2.2);

        if(uLayer>.5){
          vec3 cold=vec3(.035,.42,.72);
          vec3 alive=vec3(.14,.78,1.06);
          vec3 organ=mix(cold,alive,.45+.35*uEnergy);
          organ+=vec3(.22,.08,.48)*facetPulse*.24;
          organ+=vec3(.74,1.08,1.28)*heart*(${lighting.innerHeartBase}+${lighting.innerHeartBreath}*uBreath);
          float alpha=.18+${lighting.innerHeartAlpha}*heart+.11*uEnergy;
          ${webgl2?'outColor':'gl_FragColor'}=vec4(max(organ,vec3(0.)),clamp(alpha,0.,${lighting.innerAlphaMax}));
          return;
        }

        vec3 deep=vec3(.045,.16,.25);
        vec3 ice=vec3(.24,.66,.82);
        vec3 glass=mix(deep,ice,.20+.48*ndl+.17*facetPulse);
        glass+=vec3(.09,.43,.70)*sideLight*.22;
        glass+=vec3(.18,.72,1.00)*fresnel*(${lighting.rimBase}+${lighting.rimEnergy}*uEnergy);
        glass+=vec3(.22,.62,.82)*veins*(.035+.060*uBreath);
        glass+=vec3(.20,.54,.68)*heart*(${lighting.outerHeartBase}+${lighting.outerHeartEnergy}*uEnergy);
        float alpha=.56+.17*ndl+${lighting.rimAlpha}*fresnel;
        ${webgl2?'outColor':'gl_FragColor'}=vec4(max(glass,vec3(0.)),clamp(alpha,.48,.86));
      }
    `;

    const vertexSource = webgl2
      ? `#version 300 es\n${vertexBody.replace('attribute vec3 aPosition;','layout(location=0) in vec3 aPosition;').replace('attribute vec3 aNormal;','layout(location=1) in vec3 aNormal;').replace('attribute float aFacet;','layout(location=2) in float aFacet;').replace('varying vec3 vNormal;','out vec3 vNormal;').replace('varying vec3 vLocal;','out vec3 vLocal;').replace('varying float vFacet;','out float vFacet;')}`
      : vertexBody;
    const fragmentSource = webgl2
      ? `#version 300 es\nprecision highp float;\nin vec3 vNormal;\nin vec3 vLocal;\nin float vFacet;\nout vec4 outColor;\n${fragmentBody.replace('precision highp float;','').replace('varying vec3 vNormal;','').replace('varying vec3 vLocal;','').replace('varying float vFacet;','')}`
      : fragmentBody;

    let program;
    try { program=link(gl,vertexSource,fragmentSource); }
    catch(error){
      console.warn('FormatX crystal organism unavailable:',error);
      stage.remove();
      root.dataset.fxCrystalOrganismR326='shader-failed';
      root.dataset.fxCoreReal3d='shader-failed';
      return;
    }

    const geometry=buildOrganismGeometry();
    const buffers=[gl.createBuffer(),gl.createBuffer(),gl.createBuffer()];
    const attributes={
      position:gl.getAttribLocation(program,'aPosition'),
      normal:gl.getAttribLocation(program,'aNormal'),
      facet:gl.getAttribLocation(program,'aFacet')
    };
    const uniforms={};
    ['uTime','uEnergy','uBreath','uLayer','uPointer','uAspect'].forEach(name=>{uniforms[name]=gl.getUniformLocation(program,name);});

    function upload(buffer,data,index,size){
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribPointer(index,size,gl.FLOAT,false,0,0);
    }
    gl.useProgram(program);
    upload(buffers[0],geometry.positions,attributes.position,3);
    upload(buffers[1],geometry.normals,attributes.normal,3);
    upload(buffers[2],geometry.facets,attributes.facet,1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.disable(gl.CULL_FACE);
    gl.clearColor(0,0,0,0);

    let disposed=false;
    let visible=true;
    let paused=false;
    let raf=0;
    let burstFrames=0;
    let width=0,height=0;
    let px=0,py=0,tx=0,ty=0;
    let energy=.22,targetEnergy=.22;
    let breath=.18,targetBreath=.18;
    let last=performance.now();
    let renderAverage=0;
    let heartbeatTimer=0;
    const started=performance.now();
    const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};
    cinematic.version=VERSION;
    cinematic.corePosition=[0,0,.52];

    function resize(){
      const rect=stage.getBoundingClientRect();
      if(rect.width<2||rect.height<2)return false;
      const cap=mobile?1.35:1.55;
      const dpr=Math.min(devicePixelRatio||1,cap);
      const budget=mobile?620000:1050000;
      let w=Math.max(2,Math.round(rect.width*dpr));
      let h=Math.max(2,Math.round(rect.height*dpr));
      if(w*h>budget){const k=Math.sqrt(budget/(w*h));w=Math.round(w*k);h=Math.round(h*k);}
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      width=w;height=h;gl.viewport(0,0,w,h);
      root.dataset.fxCoreReal3dResolution=`${w}x${h}`;
      return true;
    }

    function blocked(){return disposed||document.hidden||!visible||paused||root.dataset.fxReferenceMotionPaused==='true';}
    function schedule(frames=1){
      if(blocked())return;
      burstFrames=Math.max(burstFrames,Math.min(18,Math.max(1,frames)));
      if(!raf)raf=requestAnimationFrame(frame);
    }

    function scheduleHeartbeat(){
      clearTimeout(heartbeatTimer);
      if(disposed)return;
      heartbeatTimer=setTimeout(()=>{
        if(!blocked()){
          targetBreath=.78;
          targetEnergy=Math.max(targetEnergy,.34);
          schedule(reduced.matches?1:6);
          setTimeout(()=>{targetBreath=.18;targetEnergy=.22;schedule(reduced.matches?1:5);},220);
        }
        scheduleHeartbeat();
      }, mobile?1850:1650);
    }

    function render(now){
      const begin=performance.now();
      const dt=Math.min(48,Math.max(1,now-last));last=now;
      const k=Math.min(1,dt*.018);
      px+=(tx-px)*k;py+=(ty-py)*k;
      energy+=(targetEnergy-energy)*Math.min(1,dt*.026);
      breath+=(targetBreath-breath)*Math.min(1,dt*.032);
      targetEnergy+=(.22-targetEnergy)*Math.min(1,dt*.007);
      cinematic.energy=energy;
      cinematic.openness=.08+breath*.025;
      cinematic.corePosition=[px*.055,-py*.045,.52+energy*.012];

      const t=reduced.matches?0:(now-started)*.001;
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform1f(uniforms.uTime,t);
      gl.uniform1f(uniforms.uEnergy,energy);
      gl.uniform1f(uniforms.uBreath,breath);
      gl.uniform2f(uniforms.uPointer,px,py);
      gl.uniform1f(uniforms.uAspect,width/Math.max(1,height));

      gl.depthMask(false);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      gl.uniform1f(uniforms.uLayer,1);
      gl.drawArrays(gl.TRIANGLES,0,geometry.count);
      gl.depthMask(true);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform1f(uniforms.uLayer,0);
      gl.drawArrays(gl.TRIANGLES,0,geometry.count);

      const ms=performance.now()-begin;
      renderAverage=renderAverage?renderAverage*.82+ms*.18:ms;
      root.dataset.fxCoreRenderMs=renderAverage.toFixed(2);
      root.dataset.fxCoreFrameMs=dt.toFixed(2);
      root.dataset.fxCoreReal3dFps=String(Math.min(60,Math.round(1000/Math.max(16.67,renderAverage))));
    }

    function frame(now){
      raf=0;
      if(blocked())return;
      render(now);
      burstFrames=Math.max(0,burstFrames-1);
      const unsettled=Math.abs(tx-px)>.0025||Math.abs(ty-py)>.0025||Math.abs(targetEnergy-energy)>.004||Math.abs(targetBreath-breath)>.004;
      if(burstFrames>0||unsettled)raf=requestAnimationFrame(frame);
    }

    function point(event){
      const rect=stage.getBoundingClientRect();
      if(rect.width<2||rect.height<2)return null;
      return{x:clamp(((event.clientX-rect.left)/rect.width-.5)*2,-1,1),y:clamp(-((event.clientY-rect.top)/rect.height-.5)*2,-1,1)};
    }
    function onMove(event){if(event.pointerType==='touch')return;const q=point(event);if(!q)return;tx=q.x;ty=q.y;targetEnergy=Math.max(targetEnergy,.34);schedule(5);}
    function onDown(event){const q=point(event);if(q){tx=q.x;ty=q.y;}targetEnergy=.72;targetBreath=.88;schedule(14);}
    function onLeave(){tx=0;ty=0;targetEnergy=.22;targetBreath=.18;schedule(8);}
    function pulse(detail){
      if(Number.isFinite(detail?.x))tx=clamp(detail.x,-1,1);
      if(Number.isFinite(detail?.y))ty=clamp(detail.y,-1,1);
      targetEnergy=Math.max(targetEnergy,detail?.phase==='drag' ? .58 : .84);
      targetBreath=Math.max(targetBreath,detail?.phase==='drag' ? .62 : .94);
      schedule(detail?.phase==='drag'?10:16);
    }
    function onCoreInteraction(event){pulse(event.detail||{});}
    function onPause(event){paused=event.detail?.paused===true||root.dataset.fxReferenceMotionPaused==='true';if(!paused)schedule(2);}

    hero.addEventListener('pointermove',onMove,{passive:true});
    hero.addEventListener('pointerdown',onDown,{passive:true});
    hero.addEventListener('pointerleave',onLeave,{passive:true});
    addEventListener('formatx:coreinteraction',onCoreInteraction,{passive:true});
    addEventListener('formatx:referencepause',onPause,{passive:true});

    const ro=new ResizeObserver(()=>{if(resize())schedule(2);});
    ro.observe(stage);
    const io=new IntersectionObserver(entries=>{
      visible=entries.some(entry=>entry.isIntersecting);
      if(visible)schedule(2);else if(raf){cancelAnimationFrame(raf);raf=0;}
    },{rootMargin:'120px'});
    io.observe(stage);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(2);},{passive:true});

    function destroy(){
      if(disposed)return;disposed=true;
      clearTimeout(heartbeatTimer);if(raf)cancelAnimationFrame(raf);
      ro.disconnect();io.disconnect();
      hero.removeEventListener('pointermove',onMove);
      hero.removeEventListener('pointerdown',onDown);
      hero.removeEventListener('pointerleave',onLeave);
      removeEventListener('formatx:coreinteraction',onCoreInteraction);
      removeEventListener('formatx:referencepause',onPause);
      buffers.forEach(buffer=>gl.deleteBuffer(buffer));
      gl.deleteProgram(program);stage.remove();
      if(window.FormatXCoreMobileV69?.destroy===destroy)delete window.FormatXCoreMobileV69;
    }

    resize();
    window.FormatXCoreMobileV69={
      version:VERSION,
      renderer:'single-webgl-crystal-organism-r326',
      material:'translucent-living-facet-organism-r326',
      geometry:'four-direction-asymmetric-crystal-organism-r326',
      scheduler:'heartbeat-and-interaction-bursts-no-idle-loop-r326',
      pulse,
      requestRender:schedule,
      destroy,
      canvas,
      stage,
      get energy(){return energy;},
      get openness(){return .08+breath*.025;}
    };

    root.dataset.fxCrystalOrganismR326='ready';
    root.dataset.fxCoreMobileR99=READY;
    root.dataset.fxCoreMobileV69=READY;
    root.dataset.fxCoreMobileV55='ready-v55';
    root.dataset.fxCoreReferenceLock=READY;
    root.dataset.fxCoreReal3d=READY;
    root.dataset.fxCoreRenderer='single-webgl-crystal-organism-r326';
    root.dataset.fxCoreMaterial='translucent-living-facet-organism-r326';
    root.dataset.fxCoreGeometry='four-direction-asymmetric-crystal-organism-r326';
    root.dataset.fxCoreScheduler='heartbeat-and-interaction-bursts-no-idle-loop-r326';
    root.dataset.fxCoreCompositionR285='pure-webgl3d-no-2d-overlays';
    root.dataset.fxCoreCompositionRevisionR326='new-crystal-organism-no-legacy-fallback';
    root.dataset.fxCoreMobileVisualR326=mobile?'soft-translucent-organic-rim':'desktop-translucent-organic-rim';
    root.dataset.fxCoreMobileLightingR374=mobile?'feathered-heart-fresnel-r374':'desktop-r326-unchanged';
    root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';
    root.dataset.fxCoreReal3dTargetFps='interaction-60-heartbeat-burst-idle-zero';
    root.dataset.fxCoreRenderMs='0';
    root.dataset.fxCoreReal3dFps='60';

    schedule(4);
    scheduleHeartbeat();
    dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'r326',renderer:VERSION,context:webgl2?'webgl2':'webgl1',organism:true,legacyFallback:false}}));
    addEventListener('pagehide',destroy,{once:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});
  else boot();
}());
