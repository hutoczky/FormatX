/* FormatX Genesis R2126 – GPU-friendly DNA → nucleus particle morph. */
(() => {
  'use strict';
  const COUNT = 8192;
  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = x => { x = clamp(x); return x*x*(3-2*x); };
  function create(THREE, scene) {
    const start = new Float32Array(COUNT*3);
    const end = new Float32Array(COUNT*3);
    const color = new Float32Array(COUNT*3);
    const rand = i => { const v = Math.sin(i*127.1+78.233)*43758.5453; return v-Math.floor(v); };
    for (let i=0;i<COUNT;i++) {
      const k=i*3, u=i/COUNT, strand=i%4;
      const a=u*Math.PI*13.5+(strand%2)*Math.PI;
      const r=0.67+(rand(i+9)-0.5)*0.12;
      start[k]=Math.cos(a)*r;
      start[k+1]=(u-0.5)*4.6;
      start[k+2]=Math.sin(a)*r;
      if (strand>1) {
        const cross=rand(i+100)*2-1;
        start[k]*=cross;
        start[k+2]*=cross;
      }
      const z=1-2*(i+0.5)/COUNT;
      const phi=i*2.399963229728653;
      const shell=Math.sqrt(1-z*z);
      const depth=0.22+0.78*Math.pow(rand(i+200),0.38);
      end[k]=Math.cos(phi)*shell*depth*1.36;
      end[k+1]=z*depth*1.23;
      end[k+2]=Math.sin(phi)*shell*depth*1.20;
      const warm=rand(i+300)>0.91;
      color[k]=warm?1:0.09;
      color[k+1]=warm?0.24:0.80;
      color[k+2]=warm?0.17:1;
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(start.slice(),3));
    geometry.setAttribute('aStart',new THREE.BufferAttribute(start,3));
    geometry.setAttribute('aEnd',new THREE.BufferAttribute(end,3));
    geometry.setAttribute('color',new THREE.BufferAttribute(color,3));
    const material=new THREE.ShaderMaterial({
      transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      uniforms:{uMorph:{value:0},uTime:{value:0},uOpacity:{value:1},uSize:{value:2}},
      vertexShader:`attribute vec3 aStart; attribute vec3 aEnd; attribute vec3 color;
        uniform float uMorph; uniform float uTime; uniform float uSize;
        varying vec3 vColor;
        void main(){
          float m=uMorph*uMorph*(3.0-2.0*uMorph);
          vec3 p=mix(aStart,aEnd,m);
          p+=normalize(p+vec3(0.001))*sin(uTime*1.7+float(gl_VertexID)*0.13)*0.012*m;
          vec4 mv=modelViewMatrix*vec4(p,1.0);
          gl_Position=projectionMatrix*mv;
          gl_PointSize=min(8.0,uSize*(210.0/max(1.0,-mv.z)));
          vColor=color;
        }`,
      fragmentShader:`precision highp float; varying vec3 vColor; uniform float uOpacity;
        void main(){
          float d=length(gl_PointCoord-vec2(0.5))*2.0;
          float glow=exp(-d*d*5.0);
          if(glow<0.025)discard;
          gl_FragColor=vec4(vColor*glow,glow*uOpacity);
        }`
    });
    const points=new THREE.Points(geometry,material);
    points.frustumCulled=false;
    scene.add(points);
    return {
      update(seconds) {
        material.uniforms.uMorph.value=smooth((seconds-3.0)/4.0);
        material.uniforms.uTime.value=seconds;
        material.uniforms.uOpacity.value=1;
        points.rotation.y=seconds*0.055;
      },
      dispose(){scene.remove(points);geometry.dispose();material.dispose();},
      points
    };
  }
  window.FormatXGenesisMorphR2126={create,particleCount:COUNT};
})();