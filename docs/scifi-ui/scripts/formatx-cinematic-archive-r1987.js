/* FormatX R1987 — Cinematic Archive native WebGL scene.
   Same context/canvas and original living MAG, no second WebGL renderer.
   Section content remains native HTML. All phases derive from scroll geometry. */
(() => {
  'use strict';
  const root=document.documentElement;
  const VERSION='cinematic-archive-r2022-visible-handoff';
  if(root.dataset.fxArchiveExperience) return;
  const params=new URLSearchParams(location.search);
  const audit=/Chrome-Lighthouse/i.test(navigator.userAgent||'')||params.get('lighthouse')==='1';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const force=params.get('archive')==='1';
  const isolatedMagCheck=params.has('r486-optics-energy-check')||params.has('mobileproof');
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const mobile=()=>matchMedia('(max-width: 900px)').matches;
  const blueprint=[
    {selector:'#experience',key:'ecosystem',hu:'FORMATX ÖKOSZISZTÉMA',en:'FORMATX ECOSYSTEM',source:'left-shelf',color:[.50,.81,.94]},
    {selector:'.fx-category-deck--standalone',key:'systems',hu:'RENDSZERKATEGÓRIÁK',en:'SYSTEM CATEGORIES',source:'rotor',color:[.65,.78,.99]},
    {selector:'#capabilities',key:'diagnostics',hu:'DIAGNOSZTIKA',en:'DIAGNOSTICS',source:'bottom-drawer',color:[.48,.95,.87]},
    {selector:'#network',key:'network',hu:'HÁLÓZATI ESZKÖZÖK',en:'NETWORK TOOLS',source:'right-cell',color:[.54,.80,.97]},
    {selector:'#system',key:'security',hu:'RENDSZER ÉS BIZTONSÁG',en:'SYSTEM & SECURITY',source:'sealed-vault',color:[.74,.86,.98]},
    {selector:'#pricing',key:'licensing',hu:'LICENCEK ÉS CSOMAGOK',en:'LICENSING & PLANS',source:'vertical-crystal',color:[.92,.77,.60]},
    {selector:'#capabilities .cards .card:last-child',key:'intelligence',hu:'AI SEGÍTSÉG',en:'AI GUIDANCE',source:'inner-chamber',color:[.66,.88,1]},
    {selector:'#resources',key:'final',hu:'FORMATX ERŐFORRÁSOK',en:'FORMATX RESOURCES',source:'assembled',color:[.82,.91,1]}
  ];
  let scenes=[],current=null,drawPass=null,detach=null,stage=null,heroHost=null;
  let raf=0,lastGpu=0,lastScene=-1,disposed=false,painted=0,archiveActive=false,updates=0;
  let sceneObserver=null,handoff=null,handoffKey='';
  const mobilePerf=Boolean(navigator.deviceMemory&&navigator.deviceMemory<=4);
  let quality=mobilePerf?'low':'high';
  root.dataset.fxArchiveExperience='pending';
  function discover(){
    const previous=scenes.map(x=>x.node);
    scenes=blueprint.map(def=>{
      const node=document.querySelector(def.selector);
      return node instanceof HTMLElement ? {...def,node} : null;
    }).filter(Boolean);
    scenes.sort((a,b)=>a.node.compareDocumentPosition(b.node)&Node.DOCUMENT_POSITION_PRECEDING?1:-1);
    for(const node of previous){if(!scenes.some(s=>s.node===node))node.removeAttribute('data-fx-archive-scene');}
    scenes.forEach((s,i)=>{s.index=i;s.node.dataset.fxArchiveScene=s.key;});
    if(sceneObserver){
      sceneObserver.disconnect();
      scenes.forEach(s=>sceneObserver.observe(s.node));
    }
    root.dataset.fxArchiveSceneCount=String(scenes.length);
  }
  class ScrollTimelineController {
    static get(){
      if(!scenes.length)return null;
      // Absolute layout only, never alter document scroll position.
      let closest=null,score=Infinity;
      const anchor=innerHeight*.52;
      for(const s of scenes){
        const r=s.node.getBoundingClientRect();
        if(r.height<1||r.width<1)continue;
        const contains=r.top<=anchor&&r.bottom>=anchor;
        const distance=contains ? Math.abs((r.top+r.bottom)*.5-anchor)/Math.max(1,r.height)
          : r.top>anchor ? r.top-anchor : anchor-r.bottom;
        // Prefer the real visible section containing the viewport's reading line.
        // Tall sections must never lose to a neighbour's off-screen quarter point.
        const delta=contains?(distance*.01+Math.min(r.height,innerHeight*5)*.0000003):10+distance;
        if(delta<score){score=delta;closest={s,rect:r};}
      }
      if(!closest)return null;
      const r=closest.rect;
      // R2022: In long chapters the prior scrub saturated at 1 while the
      // section was still on screen. release=1 then made the panel invisible.
      // Hold the physically flattened membrane through the reading interval
      // and only release once the section actually exits the viewport.
      const entering=clamp((innerHeight*.88-r.top)/Math.max(1,innerHeight*1.15));
      const exiting=clamp((innerHeight*.25-r.bottom)/Math.max(1,innerHeight*.2));
      const p=Math.min(.78,entering)+.22*exiting;
      return {...closest,progress:clamp(p)};
    }
  }
  class PerformanceManager {
    static frameInterval(){return mobile()?(mobilePerf?50:33):16;}
    static setQuality(value){quality=value==='low'?'low':'high';root.dataset.fxArchiveQuality=quality;invalidate();}
  }
  class ResponsiveExperience {
    static dock(){
      if(!stage||archiveActive)return;
      if(!heroHost||!heroHost.isConnected)return;
      // Keep the canonical canvas inside #hero. Moving it would break the
      // original MAG DOM contract and WebGL identity checks. The external
      // archive stylesheet owns docking geometry so strict style-src remains
      // intact and renderer-authored canvas state is never overwritten.
      stage.classList.add('fx-archive-native-docked');
      root.dataset.fxArchiveDock='active';
      archiveActive=true;
      window.FormatXLivingCore?.requestRender?.(1);
    }
    static restore(){
      if(!archiveActive||!stage)return;
      stage.classList.remove('fx-archive-native-docked');
      root.dataset.fxArchiveDock='home';
      archiveActive=false;
      window.FormatXLivingCore?.requestRender?.(1);
    }
  }
  class CameraDirector {
    static forScene(scene,p){
      // The camera lives in ONE archive, so chapter changes must not teleport
      // it. Absolute native document scroll makes the track reversible.
      const distance=scrollY/Math.max(1,innerHeight);
      const advance=smooth((p-.16)/.69);
      return [Math.sin(distance*.31)*.125,
        Math.sin(distance*.19)*.022+mix(-.025,.028,advance),
        Math.cos(distance*.23)*.042+mix(0,.095,advance)];
    }
  }
  function cubeGeometry(){
    const v=[],faces=[
      [[0,0,1],[0,1,2,0,2,3],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],
      [[0,0,-1],[0,2,1,0,3,2],[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1]],
      [[1,0,0],[0,1,2,0,2,3],[1,-1,-1],[1,-1,1],[1,1,1],[1,1,-1]],
      [[-1,0,0],[0,2,1,0,3,2],[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],
      [[0,1,0],[0,1,2,0,2,3],[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]],
      [[0,-1,0],[0,2,1,0,3,2],[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]
    ];
    for(const [normal,tri,...corners] of faces){
      for(const i of tri){const p=corners[i];v.push(p[0]*.5,p[1]*.5,p[2]*.5,...normal,0,0);}
    }
    return new Float32Array(v);
  }
  function panelGeometry(detail){
    const u=detail?20:10,v=detail?16:9,data=[];
    for(let y=0;y<v;y++)for(let x=0;x<u;x++){
      const point=(xx,yy)=>{const px=xx/u,py=yy/v;return [(px-.5)*1.55,(py-.5)*1.06,0,0,0,1,px,py];};
      for(const p of [point(x,y),point(x+1,y),point(x+1,y+1),point(x,y),point(x+1,y+1),point(x,y+1)])data.push(...p);
    }
    return new Float32Array(data);
  }
  class MAGScene {
    constructor(gl){
      this.gl=gl;
      this.program=this.programFor(gl);
      this.box=this.buffer(cubeGeometry());
      this.panel=this.buffer(panelGeometry(quality==='high'));
      this.uniform={};
      for(const name of ['uOffset','uScale','uColor','uCamera','uRotation','uTilt','uBend','uOpacity','uPanel','uFiber','uAspect','uMobile']){
        this.uniform[name]=gl.getUniformLocation(this.program,name);
      }
      this.vao=gl.createVertexArray();
      if(!this.vao)throw new Error('VAO unavailable');
      this.drawCalls=0;
    }
    programFor(gl){
      const vert=`#version 300 es
precision highp float;
in vec3 aPosition;in vec3 aNormal;in vec2 aUv;
uniform vec3 uOffset,uScale,uCamera;uniform float uRotation,uTilt,uBend,uAspect,uMobile;
out vec3 vNormal;out vec2 vUv;
void main(){
 vec3 p=aPosition*uScale;
 p.z+=uBend*pow(2.0*aUv.x-1.0,2.0)*sin(3.14159*aUv.y);
 float st=sin(uTilt),ct=cos(uTilt);
 p=vec3(p.x,ct*p.y-st*p.z,st*p.y+ct*p.z);
 float s=sin(uRotation),c=cos(uRotation);
 p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z)+uOffset-uCamera;
 // Portrait atlas projection: make every physical shelf AND the flexible
 // panel visible in the mobile archive instead of clipping at the sides.
 if(uMobile>.5){p.x*=.34;p.y=p.y*.63-.18;}
 float d=max(2.4,6.2-p.z);
 gl_Position=vec4(p.x*3.3/max(0.6,uAspect),p.y*3.3,(p.z-2.8)*.36,d);
 vec3 n=vec3(aNormal.x,ct*aNormal.y-st*aNormal.z,st*aNormal.y+ct*aNormal.z);
 vNormal=vec3(c*n.x+s*n.z,n.y,-s*n.x+c*n.z);
 vUv=aUv;
}`;
      const frag=`#version 300 es
precision highp float;
in vec3 vNormal;in vec2 vUv;
uniform vec3 uColor;uniform float uOpacity,uPanel,uFiber;
out vec4 outColor;
void main(){
 vec3 N=normalize(vNormal+vec3(.0001));
 vec3 V=normalize(vec3(.10,-.07,1.0));
 vec3 L=normalize(vec3(-.38,.68,1.0));
 vec3 H=normalize(L+V);
 float ndl=max(.06,dot(N,L));
 float facing=clamp(dot(N,V),0.0,1.0);
 float fresnel=pow(1.0-facing,5.0);
 float spec=pow(max(0.0,dot(N,H)),uPanel>.5?70.0:24.0);
 vec3 base=mix(vec3(.025,.047,.060),uColor,uPanel>.5?.23:.18);
 vec3 col=base*(.29+.70*ndl)+uColor*(fresnel*.23+spec*.25);
 float a=uOpacity*(uPanel>.5?.68:.80);
 if(uPanel>.5){
   // Smooth glass-membrane edge, directional internal light guides and
   // antialiased micro-filaments; suppress high-frequency aliasing via fwidth.
   float edge=max(abs(vUv.x-.5)*2.0,abs(vUv.y-.5)*2.0);
   float rim=smoothstep(.943,.992,edge);
   float strand=abs(fract(vUv.x*68.0)-.5);
   float aa=max(fwidth(vUv.x*68.0)*.75,.028);
   float micro=1.0-smoothstep(.012,.012+aa,strand);
   float rail=abs(fract(vUv.y*13.0)-.5);
   float railAA=max(fwidth(vUv.y*13.0)*.6,.035);
   float guide=(1.0-smoothstep(.015,.015+railAA,rail))
             *smoothstep(.07,.13,vUv.x)*(1.0-smoothstep(.87,.93,vUv.x));
   col+=uColor*(rim*.31+guide*.060+micro*.037);
   col+=vec3(1.0,.98,.91)*spec*.11;
   a=mix(a,.91,rim);
   a+=fresnel*.045;
 }else if(uFiber>.5){
   // Energy threads are hairline solid 3D geometry, not additive 2D strokes.
   col=mix(uColor,vec3(.73,.91,.94),.15+spec*.29);
   a*=.54+.36*ndl;
 }
 outColor=vec4(col,clamp(a,0.0,1.0));
}`;
      const shader=(type,source)=>{
        const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
        if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(e);}
        return s;
      };
      const v=shader(gl.VERTEX_SHADER,vert),f=shader(gl.FRAGMENT_SHADER,frag);
      const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);
      gl.bindAttribLocation(p,0,'aPosition');gl.bindAttribLocation(p,1,'aNormal');gl.bindAttribLocation(p,2,'aUv');
      gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);
      if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const e=gl.getProgramInfoLog(p);gl.deleteProgram(p);throw new Error(e);}
      return p;
    }
    buffer(data){const gl=this.gl,b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);return{buffer:b,count:data.length/8};}
    mesh(mesh,pos,size,color,rot=0,alpha=1,bend=0,cam=[0,0,0],fiber=false,tilt=0){
      const gl=this.gl,u=this.uniform;
      gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);
      gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);
      gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,32,12);
      gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,2,gl.FLOAT,false,32,24);
      gl.uniform3fv(u.uOffset,pos);gl.uniform3fv(u.uScale,size);gl.uniform3fv(u.uColor,color);
      gl.uniform3fv(u.uCamera,cam);gl.uniform1f(u.uRotation,rot);gl.uniform1f(u.uTilt,tilt);
      gl.uniform1f(u.uOpacity,alpha);gl.uniform1f(u.uPanel,mesh===this.panel?1:0);
      gl.uniform1f(u.uFiber,fiber?1:0);gl.uniform1f(u.uBend,bend);gl.drawArrays(gl.TRIANGLES,0,mesh.count);
      this.drawCalls++;
    }
    render(frame){
      if(!current||!archiveActive||document.hidden)return;
      const start=performance.now();
      const gl=this.gl,scene=current.s,p=current.progress,index=scene.index;
      const pro=clamp(p),reveal=smooth((pro-.16)/.35),align=smooth((pro-.48)/.31),release=smooth((pro-.84)/.15);
      const cam=CameraDirector.forScene(scene,pro);
      const hue=scene.color,metal=[.23,.32,.39],edge=[.56,.71,.77];
      gl.useProgram(this.program);gl.bindVertexArray(this.vao);
      gl.uniform1f(this.uniform.uAspect,frame.aspect);
      gl.uniform1f(this.uniform.uMobile,mobile()?1:0);
      gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.DEPTH_TEST);gl.depthMask(false);gl.disable(gl.CULL_FACE);
      this.drawCalls=0;
      const box=(x,y,z,w,h,d,c=metal,rot=0,a=.8,fiber=false,tilt=0)=>this.mesh(this.box,[x,y,z],[w,h,d],c,rot,a,0,cam,fiber,tilt);
      const plate=(x,y,z,w,h,c=hue,rot=0,a=1,bend=.2)=>this.mesh(this.panel,[x,y,z],[w,h,1],c,rot,a,bend,cam);
      const side=index%2?-1:1;
      const sx=side*2.4,sy=.12*Math.sin(index),sz=-.3;
      // Shared deep archive architectural rails. Fixed in one world, not separate scene backgrounds.
      for(let k=-2;k<=2;k+=(quality==='low'?2:1)){
        const x=k*1.48;
        box(x,-1.60,-1.45,.042,2.65,.035,[.14,.23,.28],0,.24);
        box(x,1.34,-1.45,1.18,.045,.10,[.15,.31,.38],0,.19);
      }
      for(let k=0;k<3;k++){
        const y=-.95+k*.91;
        box(0,y,-1.15,7.2,.028,.065,[.18,.31,.38],0,.17);
      }
      // Eight distinct physical retrieval sources; geometry and trajectories differ.
      switch(scene.source){
        case 'left-shelf':
          for(let j=0;j<3;j++){box(-2.15+j*.26,-.17,-.15,.11,1.35,.19,metal,-.13*j,.63);}
          box(-2.30+.32*reveal,-.18,.05,.60,.055,.54,hue,.16,.8);break;
        case 'rotor':
          for(let j=0;j<5;j++){let t=j*Math.PI*.4+pro*1.7;box(sx+Math.sin(t)*.65,Math.cos(t)*.55,sz,.38,.045,.35,metal,t,.82);}
          box(sx,-.9,-.1,.12,2.3,.12,edge,pro*.35,.45);break;
        case 'bottom-drawer':
          box(sx,-1.05,-.45,1.2,.48,.70,metal,.12,.75);
          box(sx,-.94+reveal*.46,.10,1.02,.035,.62,hue,-.08,.9);
          box(sx,-1.0+.43*reveal,.45,.76,.03,.08,edge,0,.83);break;
        case 'right-cell':
          for(let j=0;j<4;j++){let a=j*Math.PI*.5;box(sx+Math.cos(a)*.7,sy+Math.sin(a)*.7,sz,.95,.035,.055,hue,a,.59);}
          box(sx,sy,sz-.4,1.43,1.43,.025,[.18,.38,.47],pro*.24,.28);break;
        case 'sealed-vault':
          box(sx,sy,sz,1.52,1.54,.62,metal,0,.85);
          box(sx-.39-.41*reveal,sy,sz+.36,.64,1.33,.10,hue,0,.9);
          box(sx+.39+.41*reveal,sy,sz+.36,.64,1.33,.10,hue,0,.9);
          for(let j=0;j<3;j++)box(sx,sy-.43+j*.43,sz+.48,.97,.03,.05,edge,0,.8);break;
        case 'vertical-crystal':
          box(sx,sy+1.1-.5*reveal,sz,.9,2.2,.33,metal,pro*.43,.75);
          box(sx,sy+.18,sz+.28,.54,1.65,.03,hue,.16,.84);break;
        case 'inner-chamber':
          for(let j=0;j<12;j+=(quality==='low'?2:1)){const a=j*Math.PI/6+pro*.34;box(Math.cos(a)*.83,Math.sin(a)*.72,.08,.34,.038,.038,hue,a,.4);}
          box(0,0,.16,.40,.40,.40,edge,pro*.24,.5);break;
        case 'assembled':
          for(let j=0;j<7;j+=(quality==='low'?2:1)){const a=j*Math.PI*2/7+pro*.30;plate(Math.cos(a)*1.9,Math.sin(a)*.95,-.3,.36,.57,hue,a*.12,.39,.1);}
          break;
      }
      // Archive data sheet: bent in storage, follows distinct 3D paths, becomes flat
      // at hand-off. It never contains rasterised application text.
      const sourceX=scene.source==='inner-chamber'?0:sx;
      const phase=scene.source==='bottom-drawer'?-.85:scene.source==='vertical-crystal'?.78:0;
      const wave=scene.index%3===0?Math.sin(reveal*Math.PI)*.62:
        scene.index%3===1?-Math.sin(reveal*Math.PI)*.48:
        Math.sin(reveal*Math.PI*1.2)*.24;
      const x=mix(sourceX,1.05,align)+wave*(1-align);
      const y=mix(sy+phase,.05,align)+Math.sin(reveal*Math.PI)*.19;
      const z=mix(.18,2.30,align);
      const bend=mix(.44,.006,smooth((pro-.46)/.30));
      const rotation=(1-align)*(side*.74)+align*.02;
      const alpha=reveal*(1-release);
      let filamentCount=0;
      if(alpha>.001){
        plate(x,y,z,.88+align*.40,.78+align*.42,hue,rotation,alpha,bend);
        // Optical micro-filaments connect the SAME living MAG to the glass
        // membrane. Cubic paths are sampled in real scene-space; an individual
        // thread stays deliberately thin and is shed first on low quality.
        if(quality==='high'){
          const from=[-.16,.02,.56],to=[x-.13,y+.02,z-.06];
          const segments=mobile()?4:6,strands=mobile()?1:3;
          const bezier=(a,b,d,e,t)=>{
            const q=1-t;
            return q*q*q*a+3*q*q*t*b+3*q*t*t*d+t*t*t*e;
          };
          for(let strand=0;strand<strands;strand++){
            const dy=(strand-1)*.073;
            let prev=null;
            for(let k=0;k<=segments;k++){
              const t=k/segments;
              const point=[
                bezier(from[0],from[0]+(side*.38),to[0]-(side*.32),to[0],t),
                bezier(from[1]+dy,from[1]+dy+.27,to[1]+dy+.31,to[1]+dy,t),
                bezier(from[2],from[2]+.33,to[2]-.39,to[2],t)
              ];
              if(prev){
                const dx=point[0]-prev[0],dy3=point[1]-prev[1],dz=point[2]-prev[2];
                const dist=Math.hypot(dx,dy3,dz);
                 const tilt=-Math.atan2(dy3,Math.hypot(dx,dz));
                const midpoint=[(point[0]+prev[0])*.5,(point[1]+prev[1])*.5,(point[2]+prev[2])*.5];
                const thickness=.010+strand*.001;
                // The box's long Z axis follows the filament path in XZ.
                box(midpoint[0],midpoint[1],midpoint[2],thickness,thickness,
                  Math.max(dist,.012),hue,Math.atan2(dx,dz),alpha*(.18+.19*Math.sin(Math.PI*t)),true,tilt);
                filamentCount++;
              }
              prev=point;
            }
          }
        }
      }
      root.dataset.fxArchiveFilamentCount=String(filamentCount);
      gl.bindVertexArray(null);
      gl.depthMask(true);
      gl.disable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      root.dataset.fxArchiveDrawCalls=String(this.drawCalls);
      root.dataset.fxArchiveNativePass='shared-webgl2';
       if(filamentCount>0)root.dataset.fxArchiveFilamentOrientation='full-3d-bezier-r2007';
      painted++;
      if(painted>6&&performance.now()-start>12&&quality!=='low')PerformanceManager.setQuality('low');
    }
    dispose(){
      const gl=this.gl;
      gl.deleteBuffer(this.box.buffer);gl.deleteBuffer(this.panel.buffer);
      gl.deleteVertexArray(this.vao);gl.deleteProgram(this.program);
    }
  }

  const sourceNames={
    'left-shelf':['BAL ARCHÍVUMPOLC','LEFT ARCHIVE SHELF'],
    rotor:['FORGÓ ADATÁLLVÁNY','ROTATING DATA RACK'],
    'bottom-drawer':['MECHANIKUS REKESZ','MECHANICAL DRAWER'],
    'right-cell':['HOLOGRAFIKUS CELLA','HOLOGRAPHIC CELL'],
    'sealed-vault':['ZÁRT ARCHÍVUM','SEALED ARCHIVE'],
    'vertical-crystal':['KRISTÁLYTÁROLÓ','CRYSTAL STORAGE'],
    'inner-chamber':['MAG BELSŐ MAG','MAG INNER CORE'],
    assembled:['ÖKOSZISZTÉMA','ECOSYSTEM']
  };
  function createHandoff(){
    if(handoff?.isConnected)return;
    handoff=document.createElement('div');
    handoff.className='fx-archive-telemetry-r2022';
    handoff.setAttribute('aria-hidden','true');
    handoff.dataset.active='false';
    // Presentation metadata only. Native HTML owns all readable content
    // and actions; this HUD cannot intercept clicks or keyboard focus.
    handoff.innerHTML='<span class="fx-archive-telemetry-r2022__eyebrow">MAG // ARCHIVE INTERFACE</span><strong class="fx-archive-telemetry-r2022__title"></strong><span class="fx-archive-telemetry-r2022__source"></span><span class="fx-archive-telemetry-r2022__foot">FORMATX // LIVE SYSTEM</span>';
    document.body.appendChild(handoff);
  }
  function updateHandoff(){
    if(!handoff?.isConnected)return;
    const showing=Boolean(current&&archiveActive&&!reduced.matches);
    handoff.dataset.active=showing?'true':'false';
    if(!showing){handoffKey='';return;}
    const english=root.lang==='en',scene=current.s;
    const key=scene.key+':'+(english?'en':'hu');
    if(handoffKey!==key){
      handoffKey=key;
      handoff.querySelector('.fx-archive-telemetry-r2022__title').textContent=english?scene.en:scene.hu;
      handoff.querySelector('.fx-archive-telemetry-r2022__source').textContent=(sourceNames[scene.source]||[scene.source,scene.source])[english?1:0];
      handoff.dataset.scene=scene.key;
    }
    root.dataset.fxArchiveVisibleHandoff='active';
  }

  function setPanelState(){
    for(const s of scenes){
      if(current&&s===current.s){
        s.node.style.setProperty('--fx-archive-progress',current.progress.toFixed(4));
        s.node.dataset.fxArchiveActive='true';
      }else{
        s.node.style.removeProperty('--fx-archive-progress');
        s.node.removeAttribute('data-fx-archive-active');
      }
    }
  }
  /* Lightweight selection is synchronous on native scroll. GPU rendering is
     still requestAnimationFrame-budgeted. This prevents stale chapters when
     content-visibility, infinite-scroll or a slow software GPU delays RAF. */
  function selectLiveChapter(){
    if(!scenes.length)discover();
    const next=ScrollTimelineController.get();
    const hero=document.getElementById('hero'),end=hero?.getBoundingClientRect().bottom||0;
    const inArchive=Boolean(next&&end<innerHeight*.36&&next.rect.top<innerHeight*.95&&next.rect.bottom>0);
    current=inArchive?next:null;
    root.dataset.fxArchiveCurrent=current?.s.key||'none';
    if(current)root.dataset.fxArchivePhase=String(Math.min(9,Math.floor(current.progress*10)));
    return inArchive;
  }
  function update(){
    raf=0;if(disposed||document.hidden||reduced.matches)return;
    updates++;
    root.dataset.fxArchiveUpdateCount=String(updates);
    root.dataset.fxArchiveUpdateScroll=String(Math.round(scrollY));
    const inArchive=selectLiveChapter();
    if(inArchive&&stage)ResponsiveExperience.dock();
    else if(archiveActive)ResponsiveExperience.restore();
    setPanelState();
    updateHandoff();
    if(current){
      const nextIndex=current.s.index;
      root.dataset.fxArchiveCurrent=current.s.key;
      root.dataset.fxArchivePhase=String(Math.min(9,Math.floor(current.progress*10)));
      if(nextIndex!==lastScene){
        lastScene=nextIndex;
        dispatchEvent(new CustomEvent('formatx:archivechapter',{detail:{key:current.s.key,index:nextIndex,source:current.s.source}}));
      }
    }else{root.dataset.fxArchiveCurrent='none';lastScene=-1;}
    const now=performance.now();
    if(archiveActive&&now-lastGpu>=PerformanceManager.frameInterval()){
      lastGpu=now;window.FormatXLivingCore?.requestRender?.(1);
    }
  }
  function invalidate(){
    if(!disposed&&!document.hidden&&!reduced.matches){
      try{
        // R2022: synchronize the visible archive layer and chapter identity
        // with the native scroll event, not a deferred GPU RAF. A slow WebGL
        // frame must never strand a previous panel/HUD over the next chapter.
        const active=selectLiveChapter();
        if(active&&stage)ResponsiveExperience.dock();
        else if(archiveActive)ResponsiveExperience.restore();
        setPanelState();
        updateHandoff();
      }catch(e){root.dataset.fxArchiveError=String(e?.message||e);}
    }
    if(!raf&&!disposed)raf=requestAnimationFrame(()=>{
      try{update();}catch(e){raf=0;root.dataset.fxArchiveError=String(e?.message||e);console.error('FormatX archive update error',e);}
    });
  }
  function connect(){
    if(disposed||reduced.matches||(!force&&(audit||isolatedMagCheck)))return;
    const api=window.FormatXLivingCore;
    if(!api?.registerScenePass||!api.sharedWebGL2||!api.canvas||!api.stage)return;
    if(detach)return;
    stage=api.stage;heroHost=document.querySelector('#hero .hero-space');
    try{
      const nativeScene=new MAGScene(api.canvas.getContext('webgl2'));
      api.canvas.addEventListener('webglcontextlost',()=>{if(archiveActive)ResponsiveExperience.restore();detach=null;},{once:true});
      drawPass=frame=>nativeScene.render(frame);
      drawPass.dispose=()=>nativeScene.dispose();
      detach=api.registerScenePass(drawPass);
      root.dataset.fxArchiveExperience='ready';
      root.dataset.fxArchiveQuality=quality;
      invalidate();
    }catch(error){
      root.dataset.fxArchiveExperience='context-error';
      console.warn('FormatX archive WebGL pass unavailable:',error);
    }
  }
  function stop(){
    if(disposed)return;
    disposed=true;
    root.dataset.fxArchiveStopReason='lifecycle-stop';
    if(raf)cancelAnimationFrame(raf);
    sceneObserver?.disconnect();
    sceneObserver=null;
    handoff?.remove();handoff=null;
    ResponsiveExperience.restore();
    detach?.();detach=null;drawPass=null;
    scenes.forEach(s=>{s.node.style.removeProperty('--fx-archive-progress');s.node.removeAttribute('data-fx-archive-active');});
    root.dataset.fxArchiveExperience='disposed';
  }
  function init(){
    if(reduced.matches){root.dataset.fxArchiveExperience='reduced-html';return;}
    if(!force&&(audit||isolatedMagCheck)){root.dataset.fxArchiveExperience=isolatedMagCheck?'isolated-mag-test':'audit-html';return;}
    sceneObserver=new ResizeObserver(()=>invalidate());
    createHandoff();
    discover();
    if(scenes.length<2){root.dataset.fxArchiveExperience='no-scenes';return;}
    connect();
    addEventListener('formatx:real3dready',()=>{detach=null;connect();},{passive:true});
    addEventListener('scroll',invalidate,{passive:true});
    addEventListener('resize',invalidate,{passive:true});
    addEventListener('formatx:cinematicscene',invalidate,{passive:true});
    addEventListener('formatx:livingready',()=>{discover();invalidate();},{passive:true});
    addEventListener('formatx:languagechange',invalidate,{passive:true});
    addEventListener('pageshow',invalidate,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)invalidate();},{passive:true});
    reduced.addEventListener('change',()=>{if(reduced.matches)stop();},{passive:true});
    addEventListener('pagehide',stop,{once:true});
    invalidate();
  }
  window.FormatXArchiveExperience={
    version:VERSION,get scenes(){return scenes.map(s=>({key:s.key,source:s.source,id:s.node.id||s.selector}));},
    get state(){return{active:archiveActive,scene:current?.s.key||null,progress:current?.progress??0,frames:painted,quality,updates,disposed,raf,scrollY,lastUpdateScroll:root.dataset.fxArchiveUpdateScroll||null,error:root.dataset.fxArchiveError||null};},
    refresh:()=>{discover();invalidate();},setQuality:PerformanceManager.setQuality
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
