/* FormatX R866 — bounded dielectric optics and semantic light state.
   The same 12x24 closed surface uses outward crystal facet normals and smooth
   sphere normals. Front surfaces own depth; culled rear faces cannot draw bands
   across the crystal. One program, one draw, no procedural noise or extra loop. */
'use strict';
let gl=null,canvas=null,program=null,count=0,buffers=[],uniforms={},width=2,height=2;
let morph=0,energy=.5,breath=.12,pointerX=0,pointerY=0,rotationY=0,surfacePulse=-1,scene=0,attention=0;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(s)||'shader compile failed';gl.deleteShader(s);throw new Error(e);}return s;}
function buildProgram(){
  const vs=shader(gl.VERTEX_SHADER,`precision mediump float;
    attribute vec3 aCrystal,aSphere,aCrystalNormal,aSphereNormal;
    uniform float uMorph,uAspect,uRotationY,uBreath;
    uniform vec2 uPointer;
    varying vec3 vLocal,vNormal;
    void main(){
      float m=uMorph*uMorph*(3.0-2.0*uMorph);
      vec3 p=mix(aCrystal,aSphere,m);
      vec3 n=normalize(mix(aCrystalNormal,aSphereNormal,m));
      float c=cos(uRotationY),s=sin(uRotationY);
      vec3 q=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);
      vNormal=vec3(c*n.x+s*n.z,n.y,-s*n.x+c*n.z);
      q*=1.0+uBreath*.015;q.xy+=uPointer*.02;vLocal=q;
      float camera=3.05-q.z*.62;
      // The same projected silhouette, with perspective-correct optical varyings.
      gl_Position=vec4(q.x/max(.60,uAspect)*2.62,q.y*2.62,-q.z*.12*camera,camera);
    }`);
  const fs=shader(gl.FRAGMENT_SHADER,`precision mediump float;
    uniform float uEnergy,uSurfacePulse,uScene,uAttention;
    varying vec3 vLocal,vNormal;
    float softbox(vec3 ray,vec2 center,vec2 extent,float side){
      vec2 distance=abs(ray.xy/max(.08,abs(ray.z))-center)-extent;
      return (1.0-smoothstep(-.025,.045,max(distance.x,distance.y)))*clamp(ray.z*side*8.0,0.0,1.0);
    }
    vec3 environment(vec3 ray){
      float key=softbox(ray,vec2(-.68,.86),vec2(.16,.46),1.0);
      float rim=softbox(ray,vec2(.92,.12),vec2(.035,1.1),1.0);
      float rear=softbox(ray,vec2(-.38,.32),vec2(.035,.66),-1.0);
      return mix(vec3(.004,.008,.018),vec3(.032,.048,.066),clamp(ray.y*.5+.5,0.0,1.0))
        +vec3(11.0,10.4,9.5)*key+vec3(.70,1.45,2.0)*rim+vec3(2.2,2.4,2.6)*rear;
    }
    vec3 sceneAccent(){
      if(uScene<.5)return vec3(.13,.66,.83);
      if(uScene<2.5)return vec3(.48,.35,.82);
      if(uScene<4.5)return vec3(.91,.56,.22);
      return vec3(.20,.78,.62);
    }
    void main(){
      vec3 n=normalize(vNormal),view=normalize(vec3(-vLocal.xy,3.05-vLocal.z));
      vec3 key=vec3(-.429,.609,.665),fill=vec3(.739,-.180,.650);
      float light=max(dot(n,key),0.0),side=max(dot(n,fill),0.0);
      float facing=clamp(dot(n,view),0.0,1.0),edge=1.0-facing,edge2=edge*edge;
      // IOR 1.46: dielectric Fresnel and Beer-Lambert absorption, in linear light.
      float fresnel=.035+.965*edge2*edge2*edge;
      float rim=edge2*edge;
      vec3 refracted=refract(-view,n,.685);
      float innerDistance=max(0.0,vLocal.z)/max(.20,-refracted.z);
      vec2 inner=vLocal.xy+refracted.xy*innerDistance;
      float radius=length(inner),core=exp(-dot(inner,inner)*240.0);
      float halo=exp(-abs(radius-.105)*95.0)*.09;
      float pulse=uSurfacePulse<0.0?0.0:clamp(1.0-abs((.5+vLocal.y*.5)-uSurfacePulse)*10.0,0.0,1.0);
      vec3 accent=sceneAccent(),ice=vec3(.83,.92,1.0);
      float thickness=(.43+max(0.0,vLocal.z)) / max(.38,facing);
      vec3 absorption=exp(-vec3(.85,.16,.07)*thickness);
      vec3 transmission=environment(refracted)*absorption;
      vec3 reflection=environment(reflect(-view,n));
      vec3 color=mix(transmission,reflection,fresnel);
      color+=ice*light*.008+accent*(side*.015+rim*.055);
      color+=(ice*core*(.55+uEnergy*.32+uAttention*.18)+accent*halo)*absorption;
      color+=accent*pulse*(.045+rim*.09);
      color=clamp((color*(2.51*color+.03))/(color*(2.43*color+.59)+.14),0.0,1.0);
      gl_FragColor=vec4(sqrt(color),clamp(.84+rim*.12+core*.04,0.0,1.0));
    }`);
  const p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);
  ['aCrystal','aSphere','aCrystalNormal','aSphereNormal'].forEach((name,index)=>gl.bindAttribLocation(p,index,name));
  gl.linkProgram(p);gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const e=gl.getProgramInfoLog(p)||'program link failed';gl.deleteProgram(p);throw new Error(e);}return p;
}
function geometry(){const latSeg=12,lonSeg=24,crystal=[],sphere=[],crystalNormals=[],sphereNormals=[];function vertex(la,lo){const phi=(la/latSeg)*Math.PI,theta=(lo/lonSeg)*Math.PI*2,s=Math.sin(phi),d=[s*Math.cos(theta),Math.cos(phi),s*Math.sin(theta)],ax=d[0]>=0?.88:.86,ay=d[1]>=0?1.09:.97,az=d[2]>=0?.64:.43,e=.78,t=Math.pow(Math.abs(d[0])/ax,e)+Math.pow(Math.abs(d[1])/ay,e)+Math.pow(Math.abs(d[2])/az,e),r=1/Math.pow(Math.max(.0001,t),1/e);return{c:d.map(x=>x*r),s:d.map(x=>x*.91),n:d};}function tri(a,b,c){const u=b.c.map((v,i)=>v-a.c[i]),v=c.c.map((q,i)=>q-a.c[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n),normal=n.map(q=>q/length);for(const q of[a,b,c]){crystal.push(...q.c);sphere.push(...q.s);crystalNormals.push(...normal);sphereNormals.push(...q.n);}}for(let la=0;la<latSeg;la++)for(let lo=0;lo<lonSeg;lo++){const a=vertex(la,lo),b=vertex(la,lo+1),c=vertex(la+1,lo),d=vertex(la+1,lo+1);if(la>0)tri(a,b,c);if(la<latSeg-1)tri(b,d,c);}return{arrays:[crystal,sphere,crystalNormals,sphereNormals].map(a=>new Float32Array(a)),count:crystal.length/3};}
function upload(index,data){const b=gl.createBuffer();buffers.push(b);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,3,gl.FLOAT,false,0,0);}
function resize(w,h){width=Math.max(2,w|0);height=Math.max(2,h|0);canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
function render(){if(!gl||!program)return;gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.uniform1f(uniforms.uMorph,morph);gl.uniform1f(uniforms.uAspect,width/Math.max(1,height));gl.uniform1f(uniforms.uRotationY,rotationY);gl.uniform1f(uniforms.uBreath,breath);gl.uniform2f(uniforms.uPointer,pointerX,pointerY);gl.uniform1f(uniforms.uEnergy,energy);gl.uniform1f(uniforms.uSurfacePulse,surfacePulse);gl.uniform1f(uniforms.uScene,scene);gl.uniform1f(uniforms.uAttention,attention);gl.drawArrays(gl.TRIANGLES,0,count);gl.flush();}
// Context creation can wait inside a device driver before any shader executes.
// These actual phase notifications are diagnostics, never readiness signals.
function init(data){canvas=data.canvas;
 // Allocate the device before its presentation-sized colour/depth surfaces.
 // The first useful frame still uses the measured full-quality dimensions below.
 canvas.width=2;canvas.height=2;
 const contextAt=performance.now();postMessage({type:'phase',phase:'context-enter',at:contextAt,width:canvas.width,height:canvas.height});gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:true,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'low-power'});postMessage({type:'phase',phase:'context-return',at:performance.now(),elapsed:performance.now()-contextAt,available:Boolean(gl)});if(!gl)throw new Error('offscreen webgl unavailable');
 // Device identity is optional diagnostics. A synchronous driver query must
 // never become a prerequisite for drawing the real full-size first frame.
 postMessage({type:'phase',phase:'program-enter',at:performance.now()});
 program=buildProgram();postMessage({type:'phase',phase:'program-return',at:performance.now()});const g=geometry();count=g.count;gl.useProgram(program);g.arrays.forEach((a,i)=>upload(i,a));['uMorph','uAspect','uRotationY','uBreath','uPointer','uEnergy','uSurfacePulse','uScene','uAttention'].forEach(n=>uniforms[n]=gl.getUniformLocation(program,n));gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);resize(data.width,data.height);postMessage({type:'phase',phase:'first-frame-enter',at:performance.now(),width,height});render();postMessage({type:'phase',phase:'first-frame-return',at:performance.now(),width,height});postMessage({type:'ready',count,context:'webgl1-offscreen',revision:'r866-dielectric-semantic-light'});
 setTimeout(()=>{if(!gl)return;try{
  const started=performance.now();postMessage({type:'phase',phase:'device-identity-enter',at:started});
  const debug=gl.getExtension('WEBGL_debug_renderer_info');
  const device=String(debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)||'');
  const rendererClass=/swiftshader|llvmpipe|software|softpipe|mesa offscreen/i.test(device)?'software':debug?'hardware':'unknown';
  postMessage({type:'phase',phase:'device-identity-return',at:performance.now(),elapsed:performance.now()-started});
  postMessage({type:'capability',rendererClass,device});
 }catch(_){postMessage({type:'capability',rendererClass:'unknown',device:''});}},0);
}
onmessage=event=>{const d=event.data||{};try{if(d.type==='init'){init(d);return;}if(d.type==='resize'){resize(d.width,d.height);render();return;}if(d.type==='state'){if(Number.isFinite(d.morph))morph=Math.max(0,Math.min(1,d.morph));if(Number.isFinite(d.energy))energy=d.energy;if(Number.isFinite(d.breath))breath=d.breath;if(Number.isFinite(d.pointerX))pointerX=d.pointerX;if(Number.isFinite(d.pointerY))pointerY=d.pointerY;if(Number.isFinite(d.rotationY))rotationY=d.rotationY;if(Number.isFinite(d.surfacePulse))surfacePulse=d.surfacePulse;if(Number.isFinite(d.scene))scene=Math.max(0,Math.min(5,Math.round(d.scene)));if(Number.isFinite(d.attention))attention=Math.max(0,Math.min(1,d.attention));render();return;}if(d.type==='destroy'){buffers.forEach(b=>gl?.deleteBuffer(b));if(program)gl?.deleteProgram(program);close();}}catch(error){postMessage({type:'error',message:String(error?.message||error)});}};
