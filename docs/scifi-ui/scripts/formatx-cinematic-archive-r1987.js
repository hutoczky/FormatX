/* FormatX R1987 — Cinematic Archive native WebGL scene.
   Same context/canvas and original living MAG, no second WebGL renderer.
   Section content remains native HTML. All phases derive from scroll geometry. */
(() => {
  'use strict';
  const root=document.documentElement;
  const VERSION='cinematic-archive-r1987';
  if(root.dataset.fxArchiveExperience) return;
  const params=new URLSearchParams(location.search);
  const audit=/Chrome-Lighthouse/i.test(navigator.userAgent||'')||params.get('lighthouse')==='1';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const force=params.get('archive')==='1';
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const mobile=()=>matchMedia('(max-width: 900px)').matches;
  const blueprint=[
    {selector:'#experience',key:'ecosystem',hu:'FORMATX ÖKOSZISZTÉMA',en:'FORMATX ECOSYSTEM',source:'left-shelf',color:[.50,.81,.94]},
    {selector:'#live-os-overview',key:'live-os',hu:'LIVE OS',en:'LIVE OS',source:'rotor',color:[.65,.78,.99]},
    {selector:'#capabilities',key:'diagnostics',hu:'DIAGNOSZTIKA',en:'DIAGNOSTICS',source:'bottom-drawer',color:[.48,.95,.87]},
    {selector:'#network',key:'network',hu:'HÁLÓZATI ESZKÖZÖK',en:'NETWORK TOOLS',source:'right-cell',color:[.54,.80,.97]},
    {selector:'#system',key:'security',hu:'RENDSZER ÉS BIZTONSÁG',en:'SYSTEM & SECURITY',source:'sealed-vault',color:[.74,.86,.98]},
    {selector:'#pricing',key:'licensing',hu:'LICENCEK ÉS CSOMAGOK',en:'LICENSING & PLANS',source:'vertical-crystal',color:[.92,.77,.60]},
    {selector:'.fx-category-deck--standalone',key:'intelligence',hu:'RENDSZERFOLYAMATOK',en:'SYSTEM WORKFLOWS',source:'inner-chamber',color:[.66,.88,1]},
    {selector:'#resources',key:'final',hu:'FORMATX ERŐFORRÁSOK',en:'FORMATX RESOURCES',source:'assembled',color:[.82,.91,1]}
  ];
  let scenes=[],current=null,drawPass=null,detach=null,stage=null,heroHost=null,originalStyle='',placeholder=null;
  let raf=0,lastGpu=0,lastScene=-1,disposed=false,painted=0,archiveActive=false;
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
    root.dataset.fxArchiveSceneCount=String(scenes.length);
  }
  class ScrollTimelineController {
    static get(){
      if(!scenes.length)return null;
      // Absolute layout only, never alter document scroll position.
      let closest=null,score=Infinity;
      for(const s of scenes){
        const r=s.node.getBoundingClientRect();
        const anchor=innerHeight*.57;
        const delta=Math.abs(r.top+r.height*.23-anchor);
        if(delta<score){score=delta;closest={s,rect:r};}
      }
      if(!closest)return null;
      const r=closest.rect;
      const travel=innerHeight+Math.min(r.height,innerHeight*.9);
      const p=clamp((innerHeight*.87-r.top)/Math.max(1,travel));
      return {...closest,progress:p};
    }
  }
  class PerformanceManager {
    static frameInterval(){return mobile()?(mobilePerf?80:50):32;}
    static setQuality(value){quality=value==='low'?'low':'high';root.dataset.fxArchiveQuality=quality;invalidate();}
  }
  class ResponsiveExperience {
    static dock(){
      if(!stage||archiveActive)return;
      if(!heroHost||!heroHost.isConnected)return;
      originalStyle=stage.getAttribute('style')||'';
      placeholder=document.createComment('fx-native-mag-r1987-return-point');
      stage.parentNode?.insertBefore(placeholder,stage);
      document.body.appendChild(stage);
      stage.classList.add('fx-archive-native-docked');
      root.dataset.fxArchiveDock='active';
      archiveActive=true;
      stage.style.setProperty('position','fixed','important');
      stage.style.setProperty('inset',mobile()?'auto auto 8px 8px':'0','important');
      stage.style.setProperty('width',mobile()?'152px':'100vw','important');
      stage.style.setProperty('height',mobile()?'168px':'100dvh','important');
      stage.style.setProperty('max-width','none','important');
      stage.style.setProperty('max-height','none','important');
      stage.style.setProperty('margin','0','important');
      stage.style.setProperty('pointer-events','none','important');
      stage.style.setProperty('z-index','2','important');
      stage.style.setProperty('opacity',mobile()?'.86':'.68','important');
      window.FormatXLivingCore?.requestRender?.(1);
    }
    static restore(){
      if(!archiveActive||!stage)return;
      stage.classList.remove('fx-archive-native-docked');
      if(placeholder?.parentNode)placeholder.replaceWith(stage);
      else heroHost?.prepend(stage);
      placeholder=null;
      stage.setAttribute('style',originalStyle);
      root.dataset.fxArchiveDock='home';
      archiveActive=false;
      window.FormatXLivingCore?.requestRender?.(1);
    }
  }
  class CameraDirector {
    static forScene(scene,p){
      const index=scene.index,pan=Math.sin(index*1.33)*.19;
      const advance=smooth((p-.16)/.69);
      return [pan*advance,mix(-.025,.04,advance),mix(0,.15,advance)];
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
      for(const name of ['uOffset','uScale','uColor','uCamera','uRotation','uBend','uOpacity','uPanel','uAspect']){
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
uniform vec3 uOffset,uScale,uCamera;uniform float uRotation,uBend,uAspect;
out vec3 vNormal;out vec2 vUv;
void main(){
 vec3 p=aPosition*uScale;
 p.z+=uBend*pow(2.0*aUv.x-1.0,2.0)*sin(3.14159*aUv.y);
 float s=sin(uRotation),c=cos(uRotation);
 p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z)+uOffset-uCamera;
 float d=max(2.4,6.2-p.z);
 gl_Position=vec4(p.x*3.3/max(0.6,uAspect),p.y*3.3,(p.z-2.8)*.36,d);
 vNormal=vec3(c*aNormal.x+s*aNormal.z,aNormal.y,-s*aNormal.x+c*aNormal.z);
 vUv=aUv;
}`;
      const frag=`#version 300 es
precision highp float;
in vec3 vNormal;in vec2 vUv;
uniform vec3 uColor;uniform float uOpacity,uPanel;
out vec4 outColor;
void main(){
 vec3 N=normalize(vNormal+vec3(.0001));
 float n=max(.07,dot(N,normalize(vec3(-.4,.7,1.0))));
 float rim=pow(1.0-abs(N.z),3.0);
 vec3 base=mix(vec3(.024,.052,.069),uColor,uPanel>.5?.38:.19);
 float spec=pow(max(0.0,dot(N,normalize(vec3(.2,.3,1.0)))),15.0);
 vec3 col=base*(.35+.72*n)+uColor*(rim*.24+spec*.18);
 float a=uOpacity*(uPanel>.5?.78:.83);
 if(uPanel>.5){
   float edge=max(abs(vUv.x-.5)*2.0,abs(vUv.y-.5)*2.0);
   float border=smoothstep(.92,.995,edge);
   float guide=step(.988,fract(vUv.y*15.0))*step(.1,vUv.x)*step(vUv.x,.9);
   col+=uColor*(border*.37+guide*.05);
   a=mix(a,.98,border);
 }
 outColor=vec4(col,a);
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
    mesh(mesh,pos,size,color,rot=0,alpha=1,bend=0,cam=[0,0,0]){
      const gl=this.gl,u=this.uniform;
      gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);
      gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);
      gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,32,12);
      gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,2,gl.FLOAT,false,32,24);
      gl.uniform3fv(u.uOffset,pos);gl.uniform3fv(u.uScale,size);gl.uniform3fv(u.uColor,color);
      gl.uniform3fv(u.uCamera,cam);gl.uniform1f(u.uRotation,rot);
      gl.uniform1f(u.uOpacity,alpha);gl.uniform1f(u.uPanel,mesh===this.panel?1:0);
      gl.uniform1f(u.uBend,bend);gl.drawArrays(gl.TRIANGLES,0,mesh.count);
      this.drawCalls++;
    }
    render(frame){
      if(!current||!archiveActive||document.hidden)return;
      const gl=this.gl,scene=current.s,p=current.progress,index=scene.index;
      const pro=clamp(p),reveal=smooth((pro-.16)/.35),align=smooth((pro-.48)/.31),release=smooth((pro-.84)/.15);
      const cam=CameraDirector.forScene(scene,pro);
      const hue=scene.color,metal=[.23,.32,.39],edge=[.56,.71,.77];
      gl.useProgram(this.program);gl.bindVertexArray(this.vao);
      gl.uniform1f(this.uniform.uAspect,frame.aspect);
      gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.DEPTH_TEST);gl.depthMask(false);gl.disable(gl.CULL_FACE);
      this.drawCalls=0;
      const box=(x,y,z,w,h,d,c=metal,rot=0,a=.8)=>this.mesh(this.box,[x,y,z],[w,h,d],c,rot,a,0,cam);
      const plate=(x,y,z,w,h,c=hue,rot=0,a=1,bend=.2)=>this.mesh(this.panel,[x,y,z],[w,h,1],c,rot,a,bend,cam);
      const side=index%2?-1:1;
      const sx=side*2.4,sy=.12*Math.sin(index),sz=-.3;
      // Shared deep archive architectural rails. Fixed in one world, not separate scene backgrounds.
      for(let k=-2;k<=2;k++){
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
          for(let j=0;j<12;j++){const a=j*Math.PI/6+pro*.34;box(Math.cos(a)*.83,Math.sin(a)*.72,.08,.34,.038,.038,hue,a,.4);}
          box(0,0,.16,.40,.40,.40,edge,pro*.24,.5);break;
        case 'assembled':
          for(let j=0;j<7;j++){const a=j*Math.PI*2/7+pro*.30;plate(Math.cos(a)*1.9,Math.sin(a)*.95,-.3,.36,.57,hue,a*.12,.39,.1);}
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
      if(alpha>.001){
        plate(x,y,z,.88+align*.40,.78+align*.42,hue,rotation,alpha,bend);
        for(let j=-1;j<=1;j++){
          box(mix(sourceX,x,.60),y+j*.12,z-.16,.030,.012,.75,hue,rotation,.24*alpha);
        }
      }
      gl.bindVertexArray(null);
      gl.depthMask(true);
      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
      root.dataset.fxArchiveDrawCalls=String(this.drawCalls);
      root.dataset.fxArchiveNativePass='shared-webgl2';
      painted++;
    }
    dispose(){
      const gl=this.gl;
      gl.deleteBuffer(this.box.buffer);gl.deleteBuffer(this.panel.buffer);
      gl.deleteVertexArray(this.vao);gl.deleteProgram(this.program);
    }
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
  function update(){
    raf=0;if(disposed||document.hidden||reduced.matches)return;
    if(!scenes.length)discover();
    const next=ScrollTimelineController.get();
    const hero=document.getElementById('hero'),end=hero?.getBoundingClientRect().bottom||0;
    const inArchive=Boolean(next&&end<innerHeight*.36&&next.rect.top<innerHeight*.95&&next.rect.bottom>0);
    if(inArchive&&stage)ResponsiveExperience.dock();
    else if(archiveActive)ResponsiveExperience.restore();
    current=inArchive?next:null;
    setPanelState();
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
  function invalidate(){if(!raf&&!disposed)raf=requestAnimationFrame(update);}
  function connect(){
    if(disposed||reduced.matches||(!force&&audit))return;
    const api=window.FormatXLivingCore;
    if(!api?.registerScenePass||!api.sharedWebGL2||!api.canvas||!api.stage)return;
    if(detach)return;
    stage=api.stage;heroHost=document.querySelector('#hero .hero-space');
    try{
      const nativeScene=new MAGScene(api.canvas.getContext('webgl2'));
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
    if(raf)cancelAnimationFrame(raf);
    ResponsiveExperience.restore();
    detach?.();detach=null;drawPass=null;
    scenes.forEach(s=>{s.node.style.removeProperty('--fx-archive-progress');s.node.removeAttribute('data-fx-archive-active');});
    root.dataset.fxArchiveExperience='disposed';
  }
  function init(){
    if(reduced.matches){root.dataset.fxArchiveExperience='reduced-html';return;}
    if(audit&&!force){root.dataset.fxArchiveExperience='audit-html';return;}
    discover();
    if(scenes.length<2){root.dataset.fxArchiveExperience='no-scenes';return;}
    connect();
    addEventListener('formatx:real3dready',()=>{detach=null;connect();},{passive:true});
    addEventListener('scroll',invalidate,{passive:true});
    addEventListener('resize',invalidate,{passive:true});
    addEventListener('formatx:cinematicscene',invalidate,{passive:true});
    addEventListener('formatx:languagechange',invalidate,{passive:true});
    addEventListener('pageshow',invalidate,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)invalidate();},{passive:true});
    reduced.addEventListener('change',()=>{if(reduced.matches)stop();},{passive:true});
    addEventListener('pagehide',stop,{once:true});
    invalidate();
  }
  window.FormatXArchiveExperience={
    version:VERSION,get scenes(){return scenes.map(s=>({key:s.key,source:s.source,id:s.node.id||s.selector}));},
    get state(){return{active:archiveActive,scene:current?.s.key||null,progress:current?.progress??0,frames:painted,quality};},
    refresh:()=>{discover();invalidate();},setQuality:PerformanceManager.setQuality
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
