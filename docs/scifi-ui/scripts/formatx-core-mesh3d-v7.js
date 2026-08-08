(function () {
  'use strict';

  const root = document.documentElement;
  if (!document.body || root.dataset.fxCoreMesh3d === 'ready-v7') return;
  if (!window.WebGL2RenderingContext) {
    root.dataset.fxCoreMesh3d = 'webgl2-unavailable';
    return;
  }

  document.querySelectorAll('.fx-core-mesh3d-stage[data-fx-core-mesh3d]').forEach(node => node.remove());

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(max-width: 820px), (pointer: coarse)');
  const stage = document.createElement('div');
  stage.className = 'fx-core-mesh3d-stage';
  stage.dataset.fxCoreMesh3d = 'v7';
  stage.dataset.active = 'false';
  stage.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-core-mesh3d-canvas';
  stage.appendChild(canvas);
  document.body.appendChild(stage);

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: true,
    depth: true,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance'
  });
  if (!gl) {
    root.dataset.fxCoreMesh3d = 'context-unavailable';
    stage.remove();
    return;
  }

  const vertexSource = `#version 300 es
    precision highp float;
    in vec3 aPosition;
    in vec3 aNormal;
    uniform mat4 uView;
    uniform mat4 uProjection;
    uniform vec3 uTilt;
    uniform vec3 uRotation;
    uniform float uScale;
    uniform float uPulse;
    uniform float uY;
    out vec3 vNormal;
    out vec3 vWorld;

    mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}
    mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}
    mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,-s,0.,s,c,0.,0.,0.,1.);}

    void main(){
      mat3 local=rz(uTilt.z)*ry(uTilt.y)*rx(uTilt.x);
      mat3 global=rz(uRotation.z)*ry(uRotation.y)*rx(uRotation.x);
      vec3 p=global*(local*(aPosition*uScale*uPulse));
      p.y+=uY;
      vWorld=p;
      vNormal=normalize(global*(local*aNormal));
      gl_Position=uProjection*uView*vec4(p,1.);
    }
  `;

  const fragmentSource = `#version 300 es
    precision highp float;
    in vec3 vNormal;
    in vec3 vWorld;
    out vec4 outColor;
    uniform vec3 uCamera;
    uniform vec3 uBase;
    uniform vec3 uEmit;
    uniform float uAlpha;
    uniform float uTime;
    uniform float uHeart;
    uniform float uMode;

    float sat(float x){return clamp(x,0.,1.);}

    void main(){
      vec3 smoothN=normalize(vNormal);
      vec3 viewDir=normalize(uCamera-vWorld);
      vec3 faceN=normalize(cross(dFdx(vWorld),dFdy(vWorld)));
      if(dot(faceN,viewDir)<0.)faceN=-faceN;
      vec3 n=normalize(mix(faceN,smoothN,.18));
      float fresnel=pow(1.-sat(dot(n,viewDir)),2.55);
      float diffuse=max(dot(n,normalize(vec3(-.38,.78,.58))),0.);

      if(uMode>1.5){
        float shimmer=.82+.18*sin(uTime*1.18+vWorld.y*11.+vWorld.x*8.);
        vec3 line=uEmit*(1.25+uHeart*.42)*shimmer+uBase*.34;
        outColor=vec4(line,uAlpha);
        return;
      }

      if(uMode<.5){
        float r=length(vWorld.xy);
        float a=atan(vWorld.y,vWorld.x);
        float veinA=pow(.5+.5*cos(a*8.+r*13.5-uTime*.045),19.);
        float veinB=pow(.5+.5*cos(vWorld.x*16.-vWorld.y*19.+vWorld.z*9.+1.15),24.);
        float veinC=pow(.5+.5*cos(vWorld.x*19.+vWorld.y*11.-vWorld.z*8.-.7),26.);
        float caustic=pow(.5+.5*sin(vWorld.x*12.+vWorld.y*16.-vWorld.z*18.+uTime*.18),11.);
        float axis=exp(-abs(vWorld.x)*25.)+exp(-abs(vWorld.y)*22.);
        float interior=exp(-r*1.8)*(1.-sat(abs(vWorld.z)*1.9));
        float plane=pow(max(dot(n,normalize(vec3(.10,.88,.46))),0.),6.);

        vec3 c=uBase*(.80+1.18*diffuse);
        c+=vec3(.05,.42,.72)*(.55+.45*diffuse);
        c+=vec3(.36,1.32,2.02)*fresnel*3.15;
        c+=vec3(.08,.76,1.22)*veinA*(.14+.34*fresnel);
        c+=vec3(.10,.90,1.42)*veinC*(.08+.23*fresnel);
        c+=vec3(.72,.18,1.22)*veinB*(.08+.22*fresnel);
        c+=vec3(.08,.54,.92)*caustic*.14;
        c+=vec3(.18,1.06,1.58)*axis*.10;
        c+=vec3(.04,.45,.78)*interior*.42;
        c+=vec3(.18,.68,1.08)*plane*.16;
        c+=uEmit*(.18+.14*uHeart);

        float alpha=uAlpha*(.28+.42*fresnel+.055*veinA+.035*(veinB+veinC)+.03*caustic);
        outColor=vec4(c,clamp(alpha,.12,.82));
        return;
      }

      float facing=.55+.45*sat(dot(n,viewDir));
      vec3 emission=uEmit*(1.12+uHeart*.98)*facing+uBase*.20;
      outColor=vec4(emission,clamp(uAlpha*(.66+.28*fresnel),0.,1.));
    }
  `;

  function compile(type, source) {
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader)||'shader compile');
    return shader;
  }

  let program;
  try {
    program=gl.createProgram();
    const vertex=compile(gl.VERTEX_SHADER,vertexSource);
    const fragment=compile(gl.FRAGMENT_SHADER,fragmentSource);
    gl.attachShader(program,vertex);
    gl.attachShader(program,fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program)||'program link');
  } catch (error) {
    console.warn('FormatX mesh v7 failed:',error);
    root.dataset.fxCoreMesh3d='shader-failed';
    stage.remove();
    return;
  }

  const attributes={
    position:gl.getAttribLocation(program,'aPosition'),
    normal:gl.getAttribLocation(program,'aNormal')
  };
  const uniforms={};
  ['uView','uProjection','uTilt','uRotation','uScale','uPulse','uY','uCamera','uBase','uEmit','uAlpha','uTime','uHeart','uMode'].forEach(name=>{
    uniforms[name]=gl.getUniformLocation(program,name);
  });

  function computeNormals(positions,indices){
    const out=new Float32Array(positions.length);
    for(let i=0;i<indices.length;i+=3){
      const ia=indices[i]*3,ib=indices[i+1]*3,ic=indices[i+2]*3;
      const ab=[positions[ib]-positions[ia],positions[ib+1]-positions[ia+1],positions[ib+2]-positions[ia+2]];
      const ac=[positions[ic]-positions[ia],positions[ic+1]-positions[ia+1],positions[ic+2]-positions[ia+2]];
      const n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
      for(const offset of [ia,ib,ic]){out[offset]+=n[0];out[offset+1]+=n[1];out[offset+2]+=n[2];}
    }
    for(let i=0;i<out.length;i+=3){const len=Math.hypot(out[i],out[i+1],out[i+2])||1;out[i]/=len;out[i+1]/=len;out[i+2]/=len;}
    return out;
  }

  function upload(geometry){
    const vao=gl.createVertexArray();
    const positionBuffer=gl.createBuffer();
    const normalBuffer=gl.createBuffer();
    const indexBuffer=gl.createBuffer();
    const lineBuffer=geometry.lines?.length?gl.createBuffer():null;
    const normals=computeNormals(geometry.positions,geometry.indices);
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,geometry.positions,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attributes.position);
    gl.vertexAttribPointer(attributes.position,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,normals,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attributes.normal);
    gl.vertexAttribPointer(attributes.normal,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,geometry.indices,gl.STATIC_DRAW);
    if(lineBuffer){gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,lineBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,geometry.lines,gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);}
    gl.bindVertexArray(null);
    return {vao,indexBuffer,lineBuffer,count:geometry.indices.length,lineCount:geometry.lines?.length||0};
  }

  const controls=[
    [0,1],[.10,.77],[.28,.42],[.66,.12],
    [1,0],[.66,-.12],[.28,-.42],[.10,-.77],
    [0,-1],[-.10,-.77],[-.28,-.42],[-.66,-.12],
    [-1,0],[-.66,.12],[-.28,.42],[-.10,.77]
  ];

  function curve(index,t){
    const n=controls.length;
    const p0=controls[(index-1+n)%n],p1=controls[index],p2=controls[(index+1)%n],p3=controls[(index+2)%n];
    const q=.30,t2=t*t,t3=t2*t;
    const h00=2*t3-3*t2+1,h10=t3-2*t2+t,h01=-2*t3+3*t2,h11=t3-t2;
    return [
      h00*p1[0]+h10*(p2[0]-p0[0])*q+h01*p2[0]+h11*(p3[0]-p1[0])*q,
      h00*p1[1]+h10*(p2[1]-p0[1])*q+h01*p2[1]+h11*(p3[1]-p1[1])*q
    ];
  }

  function buildCrystal(){
    const boundary=[];
    for(let i=0;i<16;i++) for(let s=0;s<8;s++) boundary.push(curve(i,s/8));
    const positions=[],indices=[],lines=[],front=[],back=[];
    const rings=15,depth=.34,radius=1.34,yStretch=1.18;
    const add=(x,y,z)=>(positions.push(x,y,z),positions.length/3-1);
    const frontCenter=add(0,0,depth),backCenter=add(0,0,-depth);

    for(let ring=1;ring<=rings;ring++){
      const t=ring/rings;
      const z=depth*(.07+.93*Math.pow(Math.max(0,1-Math.pow(t,1.75)),.64));
      const f=[],b=[];
      for(const point of boundary){
        f.push(add(point[0]*radius*t,point[1]*radius*t*yStretch,z));
        b.push(add(point[0]*radius*t,point[1]*radius*t*yStretch,-z));
      }
      front.push(f);back.push(b);
    }

    const count=boundary.length;
    for(let i=0;i<count;i++){
      const next=(i+1)%count;
      indices.push(frontCenter,front[0][i],front[0][next],backCenter,back[0][next],back[0][i]);
    }
    for(let ring=1;ring<rings;ring++){
      for(let i=0;i<count;i++){
        const next=(i+1)%count;
        const pf=front[ring-1],cf=front[ring],pb=back[ring-1],cb=back[ring];
        indices.push(pf[i],cf[i],cf[next],pf[i],cf[next],pf[next]);
        indices.push(pb[i],cb[next],cb[i],pb[i],pb[next],cb[next]);
      }
    }
    const outerFront=front[rings-1],outerBack=back[rings-1];
    for(let i=0;i<count;i++){
      const next=(i+1)%count;
      indices.push(outerFront[i],outerBack[i],outerBack[next],outerFront[i],outerBack[next],outerFront[next]);
      lines.push(outerFront[i],outerFront[next]);
    }
    for(const ring of [4,8,12]){
      for(let i=0;i<count;i+=2){const next=(i+2)%count;lines.push(front[ring][i],front[ring][next]);}
    }
    for(let i=0;i<count;i+=14){
      lines.push(frontCenter,front[0][i]);
      for(let ring=2;ring<rings;ring+=2) lines.push(front[ring-2][i],front[ring][i]);
    }
    return {positions:new Float32Array(positions),indices:new Uint16Array(indices),lines:new Uint16Array(lines)};
  }

  function buildSphere(radius,lat=20,lon=28){
    const positions=[],indices=[];
    for(let y=0;y<=lat;y++){
      const phi=y/lat*Math.PI;
      for(let x=0;x<=lon;x++){
        const theta=x/lon*Math.PI*2;
        positions.push(radius*Math.sin(phi)*Math.cos(theta),radius*Math.cos(phi),radius*Math.sin(phi)*Math.sin(theta));
      }
    }
    const stride=lon+1;
    for(let y=0;y<lat;y++) for(let x=0;x<lon;x++){
      const a=y*stride+x,b=(y+1)*stride+x;
      indices.push(a,b,a+1,b,b+1,a+1);
    }
    return {positions:new Float32Array(positions),indices:new Uint16Array(indices)};
  }

  function buildTorus(major,minor,majorSegments=88,minorSegments=10){
    const positions=[],indices=[];
    for(let a=0;a<=majorSegments;a++){
      const u=a/majorSegments*Math.PI*2;
      for(let b=0;b<=minorSegments;b++){
        const v=b/minorSegments*Math.PI*2;
        const r=major+minor*Math.cos(v);
        positions.push(r*Math.cos(u),r*Math.sin(u),minor*Math.sin(v));
      }
    }
    const stride=minorSegments+1;
    for(let a=0;a<majorSegments;a++) for(let b=0;b<minorSegments;b++){
      const q=a*stride+b,w=(a+1)*stride+b;
      indices.push(q,w,w+1,q,w+1,q+1);
    }
    return {positions:new Float32Array(positions),indices:new Uint16Array(indices)};
  }

  const crystal=upload(buildCrystal());
  const core=upload(buildSphere(.080));
  const halo=upload(buildSphere(.150));
  const reactorRings=[upload(buildTorus(.34,.006)),upload(buildTorus(.50,.0055)),upload(buildTorus(.66,.005))];
  const outerOrbits=[upload(buildTorus(.98,.0045)),upload(buildTorus(1.16,.004))];

  function perspective(fov,aspect,near,far){
    const q=1/Math.tan(fov/2),nf=1/(near-far);
    return new Float32Array([q/aspect,0,0,0,0,q,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);
  }

  const camera=[0,0,4.62];
  const view=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,-4.62,1]);
  let projection,width=0,height=0,raf=0;
  const started=performance.now();

  function resize(){
    const dpr=Math.min(devicePixelRatio||1,coarse.matches?1.5:1.75);
    const nextWidth=Math.max(2,Math.floor(innerWidth*dpr));
    const nextHeight=Math.max(2,Math.floor(innerHeight*dpr));
    if(nextWidth!==width||nextHeight!==height){
      width=nextWidth;height=nextHeight;canvas.width=width;canvas.height=height;
      projection=perspective(coarse.matches?.70:.66,width/height,.1,20);
      gl.viewport(0,0,width,height);
    }
  }

  function smoothstep(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
  function vec3(location,value){gl.uniform3f(location,value[0],value[1],value[2]);}

  function setParams(mode,scale,pulse,tilt,base,emit,alpha,rotation,time,heart){
    vec3(uniforms.uTilt,tilt);vec3(uniforms.uRotation,rotation);
    gl.uniform1f(uniforms.uScale,scale);gl.uniform1f(uniforms.uPulse,pulse);gl.uniform1f(uniforms.uY,.20);
    vec3(uniforms.uBase,base);vec3(uniforms.uEmit,emit);
    gl.uniform1f(uniforms.uAlpha,alpha);gl.uniform1f(uniforms.uTime,time);gl.uniform1f(uniforms.uHeart,heart);gl.uniform1f(uniforms.uMode,mode);
  }

  function drawTriangles(mesh,mode,scale,pulse,tilt,base,emit,alpha,rotation,time,heart){
    gl.bindVertexArray(mesh.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.indexBuffer);
    setParams(mode,scale,pulse,tilt,base,emit,alpha,rotation,time,heart);
    gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_SHORT,0);
  }

  function drawLines(mesh,scale,pulse,base,emit,alpha,rotation,time,heart){
    if(!mesh.lineBuffer||!mesh.lineCount)return;
    gl.bindVertexArray(mesh.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.lineBuffer);
    setParams(2,scale,pulse,[0,0,0],base,emit,alpha,rotation,time,heart);
    gl.drawElements(gl.LINES,mesh.lineCount,gl.UNSIGNED_SHORT,0);
  }

  function frame(now){
    raf=requestAnimationFrame(frame);
    const scene=parseFloat(root.dataset.fxApexMappedScene||'0');
    const visible=1-smoothstep(.56,.92,Number.isFinite(scene)?scene:0);
    stage.dataset.active=visible>.01?'true':'false';stage.style.opacity=String(visible);
    if(visible<=.002||document.hidden||root.dataset.fxImmersive!=='active')return;

    resize();
    const time=reduced.matches?0:(now-started)*.001;
    const beatA=.5+.5*Math.sin(time*1.55),beatB=.5+.5*Math.sin(time*3.10-.78);
    const heart=Math.pow(beatA,4)*.72+Math.pow(beatB,9)*.28;
    const breath=.5+.5*Math.sin(time*.62-.4);
    const pulse=1+heart*.022+breath*.005;
    const rotation=reduced.matches?[.008,.018,0]:[.008+Math.sin(time*.20)*.010,.020+Math.sin(time*.24)*.026,Math.sin(time*.16)*.0035];

    gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.useProgram(program);
    gl.uniformMatrix4fv(uniforms.uView,false,view);gl.uniformMatrix4fv(uniforms.uProjection,false,projection);vec3(uniforms.uCamera,camera);
    gl.depthMask(false);

    // Real 3D luminous glass layers. Additive blend creates an energy-filled transparent membrane while the geometry remains true indexed 3D.
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    drawTriangles(crystal,0,.455,pulse,[.018,-.012,.010],[.18,.04,.40],[.86,.20,1.48],.16*visible,rotation,time,heart);
    drawTriangles(crystal,0,.505,pulse,[-.012,.014,-.008],[.015,.22,.42],[.08,.88,1.50],.22*visible,rotation,time,heart);
    drawTriangles(crystal,0,.550,pulse,[0,0,0],[.018,.20,.38],[.10,1.16,1.72],.34*visible,rotation,time,heart);
    drawTriangles(crystal,0,.563,pulse,[0,0,0],[.005,.08,.18],[.06,.72,1.22],.10*visible,rotation,time,heart);

    drawLines(crystal,.552,pulse,[.08,.64,1.00],[.22,1.22,1.82],.17*visible,rotation,time,heart);
    drawLines(crystal,.548,pulse,[.30,.18,.92],[.74,.18,1.42],.07*visible,rotation,time,heart);

    drawTriangles(halo,1,.55*(1+heart*.10),1,[0,0,0],[.08,.58,.86],[.20,1.05,1.52],.10*visible,rotation,time,heart);
    drawTriangles(core,1,.55*(1+heart*.13),1,[0,0,0],[.94,1.20,1.25],[1.95,2.45,2.72],1.0*visible,rotation,time,heart);

    const ringPulse=.55*(1+heart*.035+breath*.007);
    drawTriangles(reactorRings[0],1,ringPulse,1,[.04,-.02,time*.014],[.08,.82,1.0],[.24,1.26,1.76],.88*visible,rotation,time,heart);
    drawTriangles(reactorRings[1],1,ringPulse,1,[-.06,.07,-.04-time*.010],[.10,.72,1.0],[.34,1.00,1.68],.74*visible,rotation,time,heart);
    drawTriangles(reactorRings[2],1,ringPulse,1,[.08,-.10,.03+time*.007],[.42,.28,1.0],[.90,.18,1.54],.58*visible,rotation,time,heart);
    drawTriangles(outerOrbits[0],1,ringPulse,1,[.46,.08,.18+time*.009],[.48,.16,1.0],[.94,.14,1.64],.50*visible,rotation,time,heart);
    drawTriangles(outerOrbits[1],1,ringPulse,1,[-.34,.42,-.15-time*.007],[.04,.62,.98],[.20,.76,1.42],.30*visible,rotation,time,heart);

    gl.depthMask(true);gl.bindVertexArray(null);
  }

  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(raf);root.dataset.fxCoreMesh3d='context-lost';});
  addEventListener('resize',resize,{passive:true});
  resize();

  root.dataset.fxCoreMesh3d='ready-v7';
  root.dataset.fxCoreGeometry='indexed-triangle-mesh-v7';
  root.dataset.fxCoreDepthBuffer='enabled';
  root.dataset.fxCoreNormals='faceted-plus-vertex';
  root.dataset.fxCoreCamera='perspective';
  root.dataset.fxCoreReference='additive-layered-four-tip-glass-crystal-v7';
  root.dataset.fxCoreRenderer='webgl2-indexed-mesh';
  root.dataset.fxCoreLineGeometry='sparse-indexed-3d-grid';
  root.dataset.fxCoreGlassLayers='4-real-mesh-passes';
  root.dataset.fxCoreReactorGeometry='sphere-plus-3-tori';
  const mode=document.querySelector('[data-fx-apex-mode]');
  if(mode)mode.textContent='WEBGL2 / ADDITIVE LAYERED GLASS 3D';
  dispatchEvent(new CustomEvent('formatx:coremesh3dready',{detail:{version:'v7',geometry:'indexed-triangle-mesh',depth:true,layers:4,reactor:'sphere-plus-3-tori'}}));
  raf=requestAnimationFrame(frame);
}());