/* FormatX R864 — bounded, normal-lit OffscreenCanvas WebGL1 MAG worker.
   The same 12x24 closed surface uses outward crystal facet normals and smooth
   sphere normals. Front surfaces own depth; culled rear faces cannot draw bands
   across the crystal. One program, one draw, no procedural noise or extra loop. */
'use strict';
let gl=null,canvas=null,program=null,count=0,buffers=[],uniforms={},width=2,height=2;
let morph=0,energy=.5,breath=.12,pointerX=0,pointerY=0,rotationY=0,surfacePulse=-1;
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
      vec2 xy=vec2(q.x/max(.60,uAspect),q.y)*(2.62/max(1.75,camera));
      gl_Position=vec4(xy,-q.z*.12,1.0);
    }`);
  const fs=shader(gl.FRAGMENT_SHADER,`precision mediump float;
    uniform float uEnergy,uSurfacePulse;
    varying vec3 vLocal,vNormal;
    vec3 environment(vec3 ray){
      float panel=clamp((1.0-abs(ray.x+.38)*2.4)*10.0,0.0,1.0)
        *clamp((1.0-abs(ray.y-.58)*3.0)*10.0,0.0,1.0)*clamp(ray.z*4.0,0.0,1.0);
      float strip=clamp((1.0-abs(ray.x-.54)*8.0)*8.0,0.0,1.0)*clamp(ray.y+.15,0.0,1.0);
      return mix(vec3(.015,.024,.043),vec3(.10,.17,.24),clamp(ray.y*.5+.5,0.0,1.0))
        +vec3(8.0,8.5,9.0)*panel+vec3(.40,1.4,2.0)*strip;
    }
    void main(){
      vec3 n=normalize(vNormal),view=normalize(vec3(-vLocal.xy,3.05-vLocal.z));
      vec3 key=vec3(-.429,.609,.665),fill=vec3(.739,-.180,.650);
      float light=max(dot(n,key),0.0),side=max(dot(n,fill),0.0);
      float edge=1.0-clamp(dot(n,view),0.0,1.0),edge2=edge*edge;
      float fresnel=.035+.965*edge2*edge2*edge;
      float rim=edge2*edge;
      float spec=max(dot(n,normalize(key+view)),0.0);
      spec*=spec;spec*=spec;spec*=spec;spec*=spec;spec*=spec;
      vec3 refracted=refract(-view,n,.685);
      float innerDistance=max(0.0,vLocal.z)/max(.20,-refracted.z);
      vec2 inner=vLocal.xy+refracted.xy*innerDistance;
      float core=clamp(1.0-length(inner)/.16,0.0,1.0);
      core=core*core*core;
      float pulse=uSurfacePulse<0.0?0.0:clamp(1.0-abs((.5+vLocal.y*.5)-uSurfacePulse)*10.0,0.0,1.0);
      vec3 cyan=vec3(.075,.62,.84),ice=vec3(.78,.91,1.0),violet=vec3(.35,.16,.60);
      float thickness=.48+max(0.0,vLocal.z)*.65;
      vec3 absorption=vec3(1.0)/(vec3(1.0)+vec3(2.6,1.0,.55)*thickness);
      vec3 transmission=environment(refracted)*absorption;
      vec3 reflection=environment(reflect(-view,n));
      vec3 body=mix(vec3(.012,.035,.065),vec3(.12,.22,.30),light*light);
      vec3 color=mix(transmission,reflection,fresnel)+body*.10+ice*spec*.20;
      color+=cyan*(side*.09+rim*.38)+violet*rim*clamp(-n.x,0.0,1.0)*.50;
      color+=ice*core*(.45+uEnergy*.35)*absorption+cyan*pulse*(.12+rim*.18);
      gl_FragColor=vec4(sqrt(color/(vec3(1.0)+color)),clamp(.80+rim*.16+core*.04,0.0,1.0));
    }`);
  const p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);
  ['aCrystal','aSphere','aCrystalNormal','aSphereNormal'].forEach((name,index)=>gl.bindAttribLocation(p,index,name));
  gl.linkProgram(p);gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const e=gl.getProgramInfoLog(p)||'program link failed';gl.deleteProgram(p);throw new Error(e);}return p;
}
function geometry(){const latSeg=12,lonSeg=24,crystal=[],sphere=[],crystalNormals=[],sphereNormals=[];function vertex(la,lo){const phi=(la/latSeg)*Math.PI,theta=(lo/lonSeg)*Math.PI*2,s=Math.sin(phi),d=[s*Math.cos(theta),Math.cos(phi),s*Math.sin(theta)],ax=d[0]>=0?.88:.86,ay=d[1]>=0?1.09:.97,az=d[2]>=0?.64:.43,e=.78,t=Math.pow(Math.abs(d[0])/ax,e)+Math.pow(Math.abs(d[1])/ay,e)+Math.pow(Math.abs(d[2])/az,e),r=1/Math.pow(Math.max(.0001,t),1/e);return{c:d.map(x=>x*r),s:d.map(x=>x*.91),n:d};}function tri(a,b,c){const u=b.c.map((v,i)=>v-a.c[i]),v=c.c.map((q,i)=>q-a.c[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n),normal=n.map(q=>q/length);for(const q of[a,b,c]){crystal.push(...q.c);sphere.push(...q.s);crystalNormals.push(...normal);sphereNormals.push(...q.n);}}for(let la=0;la<latSeg;la++)for(let lo=0;lo<lonSeg;lo++){const a=vertex(la,lo),b=vertex(la,lo+1),c=vertex(la+1,lo),d=vertex(la+1,lo+1);if(la>0)tri(a,b,c);if(la<latSeg-1)tri(b,d,c);}return{arrays:[crystal,sphere,crystalNormals,sphereNormals].map(a=>new Float32Array(a)),count:crystal.length/3};}
function upload(index,data){const b=gl.createBuffer();buffers.push(b);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,3,gl.FLOAT,false,0,0);}
function resize(w,h){width=Math.max(2,w|0);height=Math.max(2,h|0);canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
function render(){if(!gl||!program)return;gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.uniform1f(uniforms.uMorph,morph);gl.uniform1f(uniforms.uAspect,width/Math.max(1,height));gl.uniform1f(uniforms.uRotationY,rotationY);gl.uniform1f(uniforms.uBreath,breath);gl.uniform2f(uniforms.uPointer,pointerX,pointerY);gl.uniform1f(uniforms.uEnergy,energy);gl.uniform1f(uniforms.uSurfacePulse,surfacePulse);gl.drawArrays(gl.TRIANGLES,0,count);gl.flush();}
function init(data){canvas=data.canvas;gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:true,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'low-power'});if(!gl)throw new Error('offscreen webgl unavailable');program=buildProgram();const g=geometry();count=g.count;gl.useProgram(program);g.arrays.forEach((a,i)=>upload(i,a));['uMorph','uAspect','uRotationY','uBreath','uPointer','uEnergy','uSurfacePulse'].forEach(n=>uniforms[n]=gl.getUniformLocation(program,n));gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);resize(data.width,data.height);render();postMessage({type:'ready',count,context:'webgl1-offscreen',revision:'r864-normal-lit-front-surface'});}
onmessage=event=>{const d=event.data||{};try{if(d.type==='init'){init(d);return;}if(d.type==='resize'){resize(d.width,d.height);render();return;}if(d.type==='state'){if(Number.isFinite(d.morph))morph=Math.max(0,Math.min(1,d.morph));if(Number.isFinite(d.energy))energy=d.energy;if(Number.isFinite(d.breath))breath=d.breath;if(Number.isFinite(d.pointerX))pointerX=d.pointerX;if(Number.isFinite(d.pointerY))pointerY=d.pointerY;if(Number.isFinite(d.rotationY))rotationY=d.rotationY;if(Number.isFinite(d.surfacePulse))surfacePulse=d.surfacePulse;render();return;}if(d.type==='destroy'){buffers.forEach(b=>gl?.deleteBuffer(b));if(program)gl?.deleteProgram(program);close();}}catch(error){postMessage({type:'error',message:String(error?.message||error)});}};
