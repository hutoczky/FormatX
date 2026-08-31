(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'crystal-organism-r326';
  const REVISION = 'living-luminous-electric-crystal-r454';
  const READY = 'ready-v69';
  const mobile = matchMedia('(max-width:900px),(pointer:coarse)').matches;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const auditMode = new URLSearchParams(location.search).get('lighthouse') === '1';
  const IDLE_ENERGY = mobile ? .50 : .43;
  const SURFACE_PULSE_MS = 1160;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const optics = mobile ? Object.freeze({
    fresnelPower: '1.56',
    innerExposure: '2.92',
    outerExposure: '2.66'
  }) : Object.freeze({
    fresnelPower: '1.68',
    innerExposure: '2.62',
    outerExposure: '2.38'
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
    gl.bindAttribLocation(program, 0, 'aSphere');
    gl.bindAttribLocation(program, 1, 'aCrystal');
    gl.bindAttribLocation(program, 2, 'aSphereNormal');
    gl.bindAttribLocation(program, 3, 'aCrystalNormal');
    gl.bindAttribLocation(program, 4, 'aUv');
    gl.bindAttribLocation(program, 5, 'aBary');
    gl.bindAttribLocation(program, 6, 'aFacet');
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

  function normalize(vector) {
    const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
    return [vector[0] / length, vector[1] / length, vector[2] / length];
  }

  function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  function cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  /* One closed topology owns both endpoints. r442 uses a lighter phone mesh:
     the silhouette and morph remain fully 3D, but the larger native facets need
     fewer fragment invocations and also avoid the razor-fine edge impression. */
  function buildOrganismGeometry() {
    const latitudeSegments = auditMode ? 18 : mobile ? 18 : 30;
    const longitudeSegments = auditMode ? 32 : mobile ? 36 : 56;
    const sphere = [];
    const crystal = [];
    const sphereNormals = [];
    const crystalNormals = [];
    const uvs = [];
    const barycentrics = [];
    const facets = [];

    function random(x, y) {
      const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return value - Math.floor(value);
    }

    function vertex(latitudeIndex, longitudeIndex) {
      const latitude = latitudeIndex / latitudeSegments;
      const longitude = longitudeIndex / longitudeSegments;
      const phi = latitude * Math.PI;
      const theta = longitude * Math.PI * 2;
      const sinPhi = Math.sin(phi);
      const direction = [sinPhi * Math.cos(theta), Math.cos(phi), sinPhi * Math.sin(theta)];
      const sphereRadius = .91;
      const spherePosition = direction.map(value => value * sphereRadius);

      const axisX = direction[0] >= 0 ? .88 : .86;
      const axisY = direction[1] >= 0 ? 1.09 : .97;
      const axisZ = direction[2] >= 0 ? .64 : .43;
      const exponent = .78;
      const terms = Math.pow(Math.abs(direction[0]) / axisX, exponent)
        + Math.pow(Math.abs(direction[1]) / axisY, exponent)
        + Math.pow(Math.abs(direction[2]) / axisZ, exponent);
      const radial = 1 / Math.pow(Math.max(.0001, terms), 1 / exponent);
      const organic = 1
        + .022 * Math.sin(theta * 4 + phi * 1.7) * Math.pow(sinPhi, 2)
        + .010 * Math.sin(theta * 7 - phi * 3.1);
      const crystalPosition = direction.map(value => value * radial * organic);
      return {
        sphere: spherePosition,
        crystal: crystalPosition,
        sphereNormal: direction,
        uv: [longitude, latitude]
      };
    }

    function triangle(vertices, facet) {
      let crystalNormal = normalize(cross(
        subtract(vertices[1].crystal, vertices[0].crystal),
        subtract(vertices[2].crystal, vertices[0].crystal)
      ));
      const centre = [0, 1, 2].map(index => (
        vertices[0].crystal[index] + vertices[1].crystal[index] + vertices[2].crystal[index]
      ) / 3);
      if (dot(crystalNormal, centre) < 0) crystalNormal = crystalNormal.map(value => -value);
      const barycentric = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
      vertices.forEach((item, index) => {
        sphere.push(...item.sphere);
        crystal.push(...item.crystal);
        sphereNormals.push(...item.sphereNormal);
        crystalNormals.push(...crystalNormal);
        uvs.push(...item.uv);
        barycentrics.push(...barycentric[index]);
        facets.push(facet);
      });
    }

    for (let latitude = 0; latitude < latitudeSegments; latitude += 1) {
      for (let longitude = 0; longitude < longitudeSegments; longitude += 1) {
        const a = vertex(latitude, longitude);
        const b = vertex(latitude, longitude + 1);
        const c = vertex(latitude + 1, longitude);
        const d = vertex(latitude + 1, longitude + 1);
        if (latitude > 0) triangle([a, b, c], .08 + .92 * random(longitude, latitude * 2));
        if (latitude < latitudeSegments - 1) triangle([b, d, c], .08 + .92 * random(longitude + 37, latitude * 2 + 1));
      }
    }

    return {
      arrays: [sphere, crystal, sphereNormals, crystalNormals, uvs, barycentrics, facets]
        .map(values => new Float32Array(values)),
      sizes: [3, 3, 3, 3, 2, 3, 1],
      count: facets.length,
      topology: `${latitudeSegments}x${longitudeSegments}-closed-uv-surface`
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
    stage.dataset.revision = REVISION;
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
      powerPreference:'high-performance'
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

    const vertexIn = webgl2 ? 'in' : 'attribute';
    const vertexOut = webgl2 ? 'out' : 'varying';
    const fragmentIn = webgl2 ? 'in' : 'varying';
    const outputName = webgl2 ? 'outColor' : 'gl_FragColor';
    const versionLine = webgl2 ? '#version 300 es\n' : '';
    const vertexSource = `${versionLine}precision highp float;
      ${vertexIn} vec3 aSphere;
      ${vertexIn} vec3 aCrystal;
      ${vertexIn} vec3 aSphereNormal;
      ${vertexIn} vec3 aCrystalNormal;
      ${vertexIn} vec2 aUv;
      ${vertexIn} vec3 aBary;
      ${vertexIn} float aFacet;
      uniform float uTime,uEnergy,uBreath,uLayer,uMorph,uAspect,uSiteProgress;
      uniform vec2 uPointer;
      uniform vec3 uRotation;
      ${vertexOut} vec3 vNormal;
      ${vertexOut} vec3 vLocal;
      ${vertexOut} vec2 vUv;
      ${vertexOut} vec3 vBary;
      ${vertexOut} float vFacet;
      ${vertexOut} float vMorph;
      mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}
      mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}
      mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,-s,0.,s,c,0.,0.,0.,1.);}
      void main(){
        float morph=uMorph*uMorph*(3.0-2.0*uMorph);
        vec3 normal=normalize(mix(aCrystalNormal,aSphereNormal,morph));
        vec3 base=mix(aCrystal,aSphere,morph);
        float cell=sin(uTime*.71+dot(aSphereNormal,vec3(5.7,4.1,6.3))+uSiteProgress*6.28318);
        float membrane=sin(uTime*1.17+aUv.x*12.566-aUv.y*9.2+sin(aUv.y*6.283)*1.4);
        float living=(cell*.018+membrane*.009)*(.42+.58*uEnergy)*mix(.72,1.34,morph);
        float layerScale=uLayer>.5?.50:1.0;
        float heartbeat=1.0+uBreath*(uLayer>.5?.040:.018);
        vec3 local=(base+normal*living)*layerScale*heartbeat;
        local.xy+=uPointer*.038*uLayer;
        float yaw=.08+uRotation.y+uPointer.x*.23+uTime*.021;
        float pitch=-.055+uRotation.x-uPointer.y*.16+.014*sin(uTime*.19);
        float roll=uRotation.z+uPointer.x*uPointer.y*.035+.010*sin(uTime*.23);
        mat3 rotation=rz(roll)*ry(yaw)*rx(pitch);
        vec3 world=rotation*local;
        vNormal=normalize(rotation*normal);
        vLocal=world;
        vUv=aUv;
        vBary=aBary;
        vFacet=aFacet;
        vMorph=morph;
        float camera=3.12-world.z*.70;
        float perspective=2.76/max(1.72,camera);
        vec2 silhouetteScale=vec2(mix(1.48,1.0,morph),mix(1.30,1.0,morph));
        vec2 projected=vec2(world.x/max(.56,uAspect),world.y)*silhouetteScale*perspective;
        projected.y+=.010;
        gl_Position=vec4(projected,world.z*.13,1.0);
      }`;

    const fragmentSource = `${versionLine}precision highp float;
      uniform float uTime,uEnergy,uBreath,uLayer,uMorph,uSiteProgress,uSurfacePulse;
      uniform vec2 uPointer;
      ${fragmentIn} vec3 vNormal;
      ${fragmentIn} vec3 vLocal;
      ${fragmentIn} vec2 vUv;
      ${fragmentIn} vec3 vBary;
      ${fragmentIn} float vFacet;
      ${fragmentIn} float vMorph;
      ${webgl2 ? 'out vec4 outColor;' : ''}
      float sat(float v){return clamp(v,0.,1.);}
      float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
      float ridge(float v,float p){return pow(sat(1.-abs(fract(v)-.5)*2.),p);}
      vec3 filmic(vec3 c){return 1.0-exp(-max(c,vec3(0.)));}
      void main(){
        vec3 n=normalize(vNormal);
        vec3 view=normalize(vec3(-vLocal.xy,2.9-vLocal.z));
        vec3 key=normalize(vec3(-.42,.73,.54));
        vec3 side=normalize(vec3(.72,-.18,.66));
        float ndl=max(dot(n,key),0.);
        float sideLight=max(dot(n,side),0.);
        float facing=sat(abs(dot(n,view)));
        float fresnel=pow(1.0-facing,${optics.fresnelPower});
        float specular=pow(max(dot(n,normalize(key+view)),0.),42.0);
        specular+=.72*pow(max(dot(n,normalize(side+view)),0.),24.0);
        float facetPulse=.5+.5*sin(vFacet*23.0+uTime*.42+uSiteProgress*5.0);
        float edge=1.0-smoothstep(${mobile?'.004':'.010'},${mobile?'.095':'.050'},min(vBary.x,min(vBary.y,vBary.z)));
        edge*=pow(1.0-vMorph,1.7)*(${mobile?'.006':'.026'}+${mobile?'.026':'.13'}*fresnel)*smoothstep(.38,.88,facetPulse);
        vec2 field=vec2(vUv.x*8.0+vLocal.z*2.1,vUv.y*5.0+vLocal.x*1.7);
        float cloud=noise(field*2.2+vec2(-uTime*.08,uTime*.05));
        float warp=noise(field*1.34+vec2(uTime*.025,-uTime*.018));
        float veins=ridge(vLocal.y*3.4-vLocal.x*5.1+cloud*2.4+warp*1.6-uTime*.13,21.0);
        veins+=.72*ridge(vLocal.y*5.7+vLocal.z*4.8-cloud*1.7-warp*1.2+uTime*.09,24.0);
        veins*=.40+.82*fresnel;
        float cellField=noise(vec2(vLocal.x*5.1+vLocal.z*2.7,vLocal.y*5.8-vLocal.z*1.9)+vec2(uTime*.045,-uTime*.032));
        float membrane=ridge(cellField*2.2+vLocal.y*1.7-vLocal.x*.8-uTime*.055,10.0);
        membrane*=.24+.76*fresnel;
        vec2 heartOffset=vec2(uPointer.x*${mobile?'.070':'.045'},uPointer.y*${mobile?'.058':'.036'});
        vec2 heartLocal=vec2(vLocal.x,vLocal.y*1.025)-heartOffset;
        float radial=length(heartLocal);
        float angle=atan(heartLocal.y,heartLocal.x);
        float visualEnergy=sat(.48+uEnergy*.66);
        float heart=pow(sat(1.0-radial/.39),3.15);
        float nucleus=pow(sat(1.0-radial/.128),4.8);
        float ringA=1.0-smoothstep(.007,.018,abs(radial-.072));
        float ringB=1.0-smoothstep(.008,.021,abs(radial-.127));
        float ringC=1.0-smoothstep(.010,.026,abs(radial-.196));
        float ringBreak=.42+.58*smoothstep(.22,.74,noise(vec2(angle*1.75+uTime*.025,radial*17.0-uTime*.035)));
        float rings=(ringA+.72*ringB+.42*ringC)*ringBreak*(1.0-smoothstep(.23,.39,radial));
        float petalRadius=.238+.030*sin(angle*4.0+cloud*1.2-uTime*.10);
        float irisBand=1.0-smoothstep(.012,.042,abs(radial-petalRadius));
        float petals=pow(.5+.5*cos(angle*4.0+warp*1.1-uTime*.15),5.0);
        float iris=irisBand*(.28+.72*petals)*(1.0-smoothstep(.31,.46,radial));
        float axisV=(1.0-smoothstep(.004,.021,abs(heartLocal.x)))*(1.0-smoothstep(.58,.96,abs(heartLocal.y)));
        float axisH=(1.0-smoothstep(.004,.020,abs(heartLocal.y)))*(1.0-smoothstep(.54,.91,abs(heartLocal.x)));
        float hue=.5+.5*sin(vFacet*7.0+uSiteProgress*9.0+uTime*.12);
        vec3 cyan=vec3(.03,1.18,1.72);
        vec3 violet=vec3(.98,.16,1.72);
        vec3 ice=vec3(1.08,1.52,1.92);
        vec3 spectral=mix(cyan,violet,.20+.46*hue);
        float surfaceSweep=0.0;
        float surfaceFilament=0.0;
        if(uSurfacePulse>=0.0){
          float pathWarp=.075*sin(vLocal.y*8.4+vLocal.z*5.7-uTime*5.1)
            +.038*sin(vLocal.y*17.0-vLocal.z*9.0+uTime*7.3);
          float mainPath=abs(vLocal.x+pathWarp);
          float branchPath=abs(vLocal.x*.72-vLocal.z*.30
            +.11*sin(vLocal.y*13.0+uTime*4.4));
          float trunk=exp(-pow(mainPath/.032,2.0));
          float branches=exp(-pow(branchPath/.025,2.0))
            *smoothstep(.10,.92,abs(vLocal.y))
            *(.45+.55*ridge(vLocal.y*3.2+vLocal.z*2.1,7.0));
          float electricFlicker=.78+.22*sin(uTime*46.0+vLocal.y*31.0+vFacet*5.0);
          surfaceFilament=(trunk+.68*branches)*electricFlicker;
          float sweepCoordinate=.5+(vLocal.y*.60+vLocal.x*.16+vLocal.z*.24)*.5;
          float sweepHead=mix(-.18,1.18,sat(uSurfacePulse));
          float sweepBand=exp(-pow((sweepCoordinate-sweepHead)/.052,2.0));
          float sweepTail=.30*exp(-pow((sweepCoordinate-(sweepHead-.10))/.095,2.0));
          surfaceSweep=(sweepBand+sweepTail)
            *(.28+.72*fresnel)
            *(.72+.28*facetPulse)
            *(.44+1.12*surfaceFilament);
        }

        if(uLayer>.5){
          vec3 organ=mix(vec3(.045,.30,.70),spectral,.38+.32*visualEnergy);
          organ*=.68+.78*cloud;
          organ+=ice*heart*(.82+.78*uBreath);
          organ+=ice*nucleus*(3.18+1.18*visualEnergy);
          organ+=spectral*(rings*2.08+iris*2.30+veins*1.72+membrane*.74);
          organ+=(cyan*1.04+ice*.24)*(axisV*1.10+axisH*.62)*visualEnergy;
          organ+=(ice*1.52+cyan*.80+violet*.28)*surfaceSweep*(1.22+.42*visualEnergy);
          float alpha=.16+.23*heart+.17*visualEnergy+rings*.18+iris*.17+nucleus*.36+veins*.072+surfaceSweep*.15;
          ${outputName}=vec4(filmic(organ*${optics.innerExposure}),clamp(alpha,.16,.88));
          return;
        }

        vec3 glass=mix(vec3(.040,.205,.46),vec3(.10,.68,1.08),.28+.38*ndl+.15*facetPulse);
        glass+=vec3(.045,.55,1.02)*sideLight*.56;
        glass+=vec3(.025,.22,.50)*(.54+.76*cloud);
        glass+=spectral*fresnel*(1.22+.94*visualEnergy);
        glass+=spectral*veins*(1.24+.48*uBreath);
        glass+=spectral*membrane*(.58+.36*visualEnergy);
        glass+=spectral*iris*.48;
        glass+=ice*(rings*.30+heart*.12+nucleus*.64);
        glass+=ice*specular*(1.76+.62*visualEnergy);
        glass+=(cyan*.90+ice*.16)*(axisV*.90+axisH*.48)*visualEnergy;
        glass+=(spectral*1.02+ice*.22)*edge;
        glass+=(ice*1.28+cyan*.74+spectral*.30)*surfaceSweep*(1.20+.46*fresnel);
        float alpha=.36+.20*ndl+.32*fresnel+edge*.072+veins*.105+rings*.060+specular*.17+surfaceSweep*.13;
        ${outputName}=vec4(filmic(glass*${optics.outerExposure}),clamp(alpha,.34,.84));
      }`;

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
    const buffers=geometry.arrays.map(()=>gl.createBuffer());
    const attributeNames=['aSphere','aCrystal','aSphereNormal','aCrystalNormal','aUv','aBary','aFacet'];
    const attributes=attributeNames.map(name=>gl.getAttribLocation(program,name));
    const uniforms={};
    ['uTime','uEnergy','uBreath','uLayer','uMorph','uPointer','uAspect','uSiteProgress','uSurfacePulse','uRotation']
      .forEach(name=>{uniforms[name]=gl.getUniformLocation(program,name);});

    function upload(buffer,data,index,size){
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribPointer(index,size,gl.FLOAT,false,0,0);
    }
    gl.useProgram(program);
    buffers.forEach((buffer,index)=>upload(buffer,geometry.arrays[index],attributes[index],geometry.sizes[index]));
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0,0,0,0);

    const controller=new AbortController();
    const listen=(target,type,handler,options={})=>target.addEventListener(type,handler,{...options,signal:controller.signal});
    const delayed=new Set();
    const later=(handler,delay)=>{
      const timer=setTimeout(()=>{delayed.delete(timer);handler();},delay);
      delayed.add(timer);
      return timer;
    };
    const initialShape=root.dataset.fxCoreShapeR337==='sphere'?'sphere':'crystal';
    let disposed=false,contextLost=false,visible=true,paused=false;
    let raf=0,burstFrames=0,width=0,height=0,aspect=1;
    let px=0,py=0,tx=0,ty=0;
    let energy=IDLE_ENERGY,targetEnergy=IDLE_ENERGY,breath=.12,targetBreath=.12;
    let morph=initialShape==='sphere'?1:0,targetMorph=morph;
    let rotationX=-.035,rotationY=0,rotationZ=0;
    let targetRotationX=rotationX,targetRotationY=0,targetRotationZ=0,angularVelocityY=0;
    let siteProgress=0,targetSiteProgress=0;
    let last=performance.now(),simulationTime=0,renderAverage=0;
    let heartbeatTimer=0,surfacePulseTimer=0,autonomousTimer=0,scrollFrame=0,tapCandidate=null;
    let surfacePulseStart=-Infinity,lastSurfacePulseAt=-Infinity,surfacePulseCount=0;
    let activeOrgan='hero',shapeLockUntil=0;
    const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};
    cinematic.version=REVISION;
    cinematic.corePosition=[0,0,.52];

    function resize(){
      const rect=stage.getBoundingClientRect();
      if(rect.width<2||rect.height<2)return false;
      const cap=auditMode?1:mobile?1.75:1.65;
      const dpr=Math.min(devicePixelRatio||1,cap);
      const budget=auditMode?390000:mobile?920000:1150000;
      let w=Math.max(2,Math.round(rect.width*dpr));
      let h=Math.max(2,Math.round(rect.height*dpr));
      if(w*h>budget){const k=Math.sqrt(budget/(w*h));w=Math.round(w*k);h=Math.round(h*k);}
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      width=w;height=h;aspect=rect.width/Math.max(1,rect.height);gl.viewport(0,0,w,h);
      root.dataset.fxCoreReal3dResolution=`${w}x${h}`;
      root.dataset.fxCoreReal3dScale=(w/Math.max(1,rect.width)).toFixed(2);
      root.dataset.fxCoreViewportAspect=aspect.toFixed(4);
      return true;
    }

    function blocked(){return disposed||contextLost||document.hidden||!visible||paused||root.dataset.fxReferenceMotionPaused==='true';}
    function schedule(frames=1){
      if(blocked())return;
      const frameCap=mobile?8:24;
      burstFrames=Math.max(burstFrames,Math.min(frameCap,Math.max(1,frames)));
      if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}
    }
    function boost(value=.84,frames=8){
      targetEnergy=Math.max(targetEnergy,value);
      targetBreath=Math.max(targetBreath,.38+value*.48);
      schedule(reduced.matches?1:frames);
    }
    function shapeName(value=targetMorph){return value>=.5?'sphere':'crystal';}
    function publishShape(source='renderer'){
      const target=shapeName();
      const settled=Math.abs(morph-targetMorph)<.008;
      root.dataset.fxCoreShapeR337=target;
      root.dataset.fxCoreTargetShape=target;
      root.dataset.fxCoreShape=settled?target:`morphing-to-${target}`;
      root.dataset.fxCoreMorph=morph.toFixed(3);
      root.dataset.fxCoreMorphSource=source;
      root.dataset.fxCoreMorphEngine='native-webgl-closed-volume-r413';
      stage.dataset.shape=root.dataset.fxCoreShape;
    }
    function setMorph(value,source='api-morph',announce=true){
      const next=clamp(Number(value)||0,0,1);
      const changed=Math.abs(next-targetMorph)>.001;
      targetMorph=next;
      if(/mag-button|api|keyboard|core-tap/.test(source))shapeLockUntil=performance.now()+7600;
      if(reduced.matches)morph=targetMorph;
      publishShape(source);
      boost(changed?1.04:.68,changed?8:3);
      if(changed&&announce)dispatchEvent(new CustomEvent('formatx:coreshapechange',{detail:{
        shape:shapeName(next),source,revision:'r413',renderer:VERSION,geometry:'closed-3d-volume'
      }}));
      return targetMorph;
    }
    function setShape(shape,source='api'){return setMorph(shape==='sphere'||shape===1||shape===true?1:0,source,true);}
    function toggleShape(source='interaction'){return setShape(targetMorph>=.5?'crystal':'sphere',source);}
    function rotateBy(x,y,source='api-rotate'){
      targetRotationX=clamp(targetRotationX+x,-1.02,1.02);
      targetRotationY+=y;
      root.dataset.fxCoreRotationSource=source;
      boost(.84,mobile?5:8);
    }

    /* heartbeat-and-interaction-bursts-no-idle-loop-r326.
       R484 has one bounded native surface sweep every five to six seconds.
       Its timeout is suspended when hidden, offscreen, user-paused or reduced.
       Between sweeps the renderer returns to zero idle frames. */
    function scheduleHeartbeat(){
      clearTimeout(heartbeatTimer);heartbeatTimer=0;
      root.dataset.fxCoreIdleHeartbeatR441='disabled-no-continuous-rendering';
    }
    function startSurfacePulse(source='autonomous'){
      const now=performance.now();
      if(disposed||contextLost||reduced.matches||document.hidden||!visible||paused
        ||document.querySelector('.fx-reference-pause')?.dataset.paused==='true'
        ||now-lastSurfacePulseAt<2200)return false;
      // The mobile governor's idle flag is not the user's PAUSE control.
      // Reserve the full sweep before asking the single renderer to draw it.
      dispatchEvent(new CustomEvent('formatx:coresurfacesweep',{
        detail:{phase:'start',source,duration:SURFACE_PULSE_MS}
      }));
      if(blocked())return false;
      surfacePulseStart=lastSurfacePulseAt=now;
      surfacePulseCount+=1;
      const pulseId=surfacePulseCount;
      targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+.24);
      targetBreath=Math.max(targetBreath,.42);
      root.dataset.fxCoreSurfacePulseR454=`sweep-${surfacePulseCount}-${source}`;
      root.dataset.fxCoreEnergyBoltR455=`surface-sweep-${source}-${surfacePulseCount}`;
      root.dataset.fxCoreSurfaceCountR484=String(surfacePulseCount);
      schedule(68);
      later(()=>{
        if(pulseId!==surfacePulseCount)return;
        surfacePulseStart=-Infinity;
        root.dataset.fxCoreSurfacePulseR454='idle';
        schedule(4);
        dispatchEvent(new CustomEvent('formatx:coresurfacesweep',{
          detail:{phase:'end',source,duration:SURFACE_PULSE_MS}
        }));
      },SURFACE_PULSE_MS);
      return true;
    }
    function scheduleSurfacePulse(){
      clearTimeout(surfacePulseTimer);surfacePulseTimer=0;
      if(disposed||contextLost||reduced.matches||document.hidden||!visible||paused
        ||document.querySelector('.fx-reference-pause')?.dataset.paused==='true'){
        root.dataset.fxCoreSurfaceSchedulerR484='suspended';
        return;
      }
      const delay=surfacePulseCount===0
        ? (mobile?3400:3000)
        : (mobile?5400:4900)+(surfacePulseCount%3)*520;
      root.dataset.fxCoreSurfaceSchedulerR484='armed-single-native-timer';
      surfacePulseTimer=setTimeout(()=>{
        surfacePulseTimer=0;
        startSurfacePulse('autonomous');
        scheduleSurfacePulse();
      },delay);
    }
    function scheduleAutonomousMorph(){
      clearTimeout(autonomousTimer);autonomousTimer=0;
      root.dataset.fxCoreAutonomousMorphR441='disabled-until-explicit-interaction';
    }

    function render(now){
      const begin=performance.now();
      const dt=Math.min(48,Math.max(1,now-last));last=now;
      if(!reduced.matches)simulationTime+=dt*.001;
      const pointerEase=1-Math.exp(-dt*.018);
      const rotationEase=1-Math.exp(-dt*.011);
      px+=(tx-px)*pointerEase;py+=(ty-py)*pointerEase;
      rotationX+=(targetRotationX-rotationX)*rotationEase;
      rotationY+=(targetRotationY-rotationY)*rotationEase;
      rotationZ+=(targetRotationZ-rotationZ)*rotationEase;
      if(Math.abs(angularVelocityY)>.00002){targetRotationY+=angularVelocityY*dt;angularVelocityY*=Math.exp(-dt*.010);}
      energy+=(targetEnergy-energy)*(1-Math.exp(-dt*.026));
      breath+=(targetBreath-breath)*(1-Math.exp(-dt*.032));
      targetEnergy+=(IDLE_ENERGY-targetEnergy)*(1-Math.exp(-dt*.006));
      targetBreath+=(.12-targetBreath)*(1-Math.exp(-dt*.007));
      morph+=(targetMorph-morph)*(reduced.matches?1:1-Math.exp(-dt*.0078));
      if(Math.abs(morph-targetMorph)<.0008)morph=targetMorph;
      siteProgress+=(targetSiteProgress-siteProgress)*(1-Math.exp(-dt*.005));
      cinematic.energy=energy;
      cinematic.openness=.08+breath*.025;
      cinematic.corePosition=[px*.055,-py*.045,.52+energy*.012];
      cinematic.morph=morph;
      cinematic.shape=shapeName();
      cinematic.rotation=[rotationX,rotationY,rotationZ];
      cinematic.siteProgress=siteProgress;
      publishShape();

      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform1f(uniforms.uTime,simulationTime);
      gl.uniform1f(uniforms.uEnergy,energy);
      gl.uniform1f(uniforms.uBreath,breath);
      gl.uniform1f(uniforms.uMorph,morph);
      gl.uniform2f(uniforms.uPointer,px,py);
      gl.uniform3f(uniforms.uRotation,rotationX,rotationY,rotationZ);
      gl.uniform1f(uniforms.uAspect,aspect);
      gl.uniform1f(uniforms.uSiteProgress,siteProgress);
      const surfacePulseElapsed=(now-surfacePulseStart)/SURFACE_PULSE_MS;
      const surfacePulse=surfacePulseElapsed>=0&&surfacePulseElapsed<=1?surfacePulseElapsed:-1;
      gl.uniform1f(uniforms.uSurfacePulse,surfacePulse);

      /* r442 phone budget: desktop keeps the three-pass optical depth. Mobile
         drops the extra front-cull outer-glow pass, which both reduces the bloom
         seen in the physical phone capture and removes roughly one third of the
         expensive fragment work per interaction frame. */
      gl.depthMask(false);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      if(!mobile){
        gl.cullFace(gl.FRONT);
        gl.uniform1f(uniforms.uLayer,0);
        gl.drawArrays(gl.TRIANGLES,0,geometry.count);
      }
      gl.cullFace(gl.BACK);
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

    function settleAfterBurst(){
      px=tx;py=ty;
      rotationX=targetRotationX;rotationY=targetRotationY;rotationZ=targetRotationZ;
      angularVelocityY=0;
      energy=targetEnergy=IDLE_ENERGY;
      breath=targetBreath=.12;
      morph=targetMorph;
      siteProgress=targetSiteProgress;
      cinematic.energy=energy;
      cinematic.openness=.08+breath*.025;
      cinematic.corePosition=[px*.055,-py*.045,.52+energy*.012];
      cinematic.morph=morph;
      cinematic.shape=shapeName();
      cinematic.rotation=[rotationX,rotationY,rotationZ];
      cinematic.siteProgress=siteProgress;
      publishShape('burst-settle-r442');
      root.dataset.fxCoreIdleRenderR441='zero-frame';
    }

    function frame(now){
      raf=0;if(blocked())return;
      render(now);burstFrames=Math.max(0,burstFrames-1);
      const surfacePulseActive=now-surfacePulseStart>=0&&now-surfacePulseStart<=SURFACE_PULSE_MS;
      if(burstFrames>0||surfacePulseActive)raf=requestAnimationFrame(frame);
      else settleAfterBurst();
    }

    function point(event){
      const rect=stage.getBoundingClientRect();
      if(rect.width<2||rect.height<2)return null;
      return{x:clamp(((event.clientX-rect.left)/rect.width-.5)*2,-1,1),y:clamp(-((event.clientY-rect.top)/rect.height-.5)*2,-1,1)};
    }
    function onMove(event){if(event.pointerType==='touch')return;const q=point(event);if(!q)return;tx=q.x;ty=q.y;targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+.12);schedule(2);}
    function onDown(event){const q=point(event);if(q){tx=q.x;ty=q.y;}shapeLockUntil=performance.now()+4800;boost(.82,mobile?4:6);}
    function onLeave(){tx=0;ty=0;targetEnergy=IDLE_ENERGY;targetBreath=.12;schedule(2);}
    function pulse(detail){
      if(Number.isFinite(detail?.x))tx=clamp(detail.x,-1,1);
      if(Number.isFinite(detail?.y))ty=clamp(detail.y,-1,1);
      const drag=detail?.phase==='drag';
      targetEnergy=Math.max(targetEnergy,drag ? .58 : .88);
      targetBreath=Math.max(targetBreath,drag ? .58 : .92);
      cinematic.corePosition=[tx*.055,-ty*.045,.52+targetEnergy*.012];
      cinematic.interaction=[tx,ty];
      cinematic.lastInteractionAt=performance.now();
      root.dataset.fxCoreInteractionStateR454=`${detail?.phase||'pulse'}-synced`;
      schedule(drag?(mobile?3:5):(mobile?8:14));
    }
    function onCoreInteraction(event){
      const detail=event.detail||{};pulse(detail);
      const x=Number(detail.x)||0,y=Number(detail.y)||0;
      if(detail.phase==='press')tapCandidate={x,y,lastX:x,lastY:y,started:performance.now(),moved:false};
      else if(detail.phase==='drag'&&tapCandidate){
        const totalX=x-tapCandidate.x,totalY=y-tapCandidate.y;
        const deltaX=x-tapCandidate.lastX,deltaY=y-tapCandidate.lastY;
        tapCandidate.lastX=x;tapCandidate.lastY=y;
        if(Math.hypot(totalX,totalY)>.075)tapCandidate.moved=true;
        targetRotationY+=deltaX*2.4;
        targetRotationX=clamp(targetRotationX-deltaY*1.8,-1.02,1.02);
        angularVelocityY=deltaX*.020;
      }else if(detail.phase==='release'){
        const candidate=tapCandidate;tapCandidate=null;
        if(candidate&&!candidate.moved&&performance.now()-candidate.started<720)toggleShape('core-tap');
      }else if(detail.phase==='cancel')tapCandidate=null;
    }
    function onPause(event){
      paused=event.detail?.paused===true||root.dataset.fxReferenceMotionPaused==='true';
      if(paused){
        surfacePulseStart=-Infinity;
        root.dataset.fxCoreSurfacePulseR454='idle';
        if(!disposed&&!contextLost&&resize())render(performance.now());
      }else schedule(1);
      scheduleSurfacePulse();
    }
    function onReducedMotionChange(){
      clearTimeout(surfacePulseTimer);surfacePulseTimer=0;
      surfacePulseStart=-Infinity;
      root.dataset.fxCoreSurfacePulseR454='idle';
      scheduleSurfacePulse();
      schedule(1);
    }
    function onScroll(){
      if(scrollFrame)return;
      scrollFrame=requestAnimationFrame(()=>{
        scrollFrame=0;
        const range=Math.max(1,document.documentElement.scrollHeight-innerHeight);
        targetSiteProgress=clamp(scrollY/range,0,1);
        root.dataset.fxCoreSiteProgress=targetSiteProgress.toFixed(3);
        targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+.08+Math.sin(targetSiteProgress*Math.PI)*.12);
        schedule(mobile?1:2);
      });
    }
    function signalShape(shape,source){
      if(performance.now()<shapeLockUntil)return;
      setShape(shape,source);
    }

    listen(hero,'pointermove',onMove,{passive:true});
    listen(hero,'pointerdown',onDown,{passive:true});
    listen(hero,'pointerleave',onLeave,{passive:true});
    listen(window,'formatx:coreinteraction',onCoreInteraction,{passive:true});
    listen(window,'formatx:referencepause',onPause,{passive:true});
    listen(reduced,'change',onReducedMotionChange,{passive:true});
    listen(window,'scroll',onScroll,{passive:true});
    listen(window,'resize',resize,{passive:true});
    listen(window,'orientationchange',resize,{passive:true});
    listen(window,'formatx:organismpanelopen',()=>signalShape('sphere','organism-listening'),{passive:true});
    listen(window,'formatx:organismresponse',()=>signalShape('crystal','organism-response'),{passive:true});
    listen(window,'formatx:open-live-os',()=>signalShape('sphere','live-os-open'),{passive:true});
    listen(window,'formatx:loop',()=>{signalShape('crystal','site-loop');boost(.92,mobile?4:6);},{passive:true});
    listen(window,'formatx:menustatechange',event=>{boost(event.detail?.open ? .76 : .52,mobile?2:4);},{passive:true});
    listen(window,'formatx:languagechange',()=>boost(.62,mobile?2:3),{passive:true});
    listen(document,'visibilitychange',()=>{
      if(!document.hidden)schedule(1);
      scheduleSurfacePulse();
    },{passive:true});
    listen(document,'click',event=>{
      if(!(event.target instanceof Element))return;
      const action=event.target.closest('a,button,[role="button"]');
      if(!action||action.closest('.fx-reference-mag-button'))return;
      if(action.matches('.fx-reference-ask,[data-fx-organism-question]'))signalShape('sphere','site-question');
      else if(action.matches('a[href*="download"],[data-release-download]'))signalShape('crystal','release-action');
      boost(action.matches('a[href*="download"],[data-release-download]') ? .92 : .62,mobile?2:4);
    },{passive:true});
    listen(document,'focusin',event=>{
      if(event.target instanceof Element&&event.target.matches('a,button,input,select,textarea,[tabindex]'))boost(.48,mobile?1:2);
    },{passive:true});
    listen(canvas,'webglcontextlost',event=>{
      event.preventDefault();contextLost=true;if(raf)cancelAnimationFrame(raf);raf=0;
      scheduleSurfacePulse();
      root.dataset.fxCoreReal3d='context-lost';root.dataset.fxCrystalOrganismR326='context-lost';
    });
    listen(canvas,'webglcontextrestored',()=>{
      root.dataset.fxCrystalOrganismR326='restoring';destroy();requestAnimationFrame(()=>boot());
    });

    const ro=new ResizeObserver(()=>{if(resize())schedule(1);});
    ro.observe(stage);
    const io=new IntersectionObserver(entries=>{
      visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.04);
      if(visible)schedule(1);else if(raf){cancelAnimationFrame(raf);raf=0;}
      scheduleSurfacePulse();
    },{threshold:[0,.04]});
    io.observe(stage);
    const sectionShapes={hero:'crystal',experience:'sphere',capabilities:'crystal',pricing:'sphere',system:'crystal',resources:'sphere'};
    const organObserver=new IntersectionObserver(entries=>{
      const candidate=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      const id=candidate?.target?.id;
      if(!id||id===activeOrgan)return;
      activeOrgan=id;root.dataset.fxCoreActiveOrgan=id;cinematic.activeOrgan=id;
      if(sectionShapes[id])signalShape(sectionShapes[id],'site-section');
      boost(.54,mobile?2:3);
    },{rootMargin:'-22% 0px -54% 0px',threshold:[0,.15,.35,.6]});
    document.querySelectorAll('main > section[id],main section.scene[id]').forEach(section=>organObserver.observe(section));

    function destroy(){
      if(disposed)return;disposed=true;
      clearTimeout(heartbeatTimer);clearTimeout(surfacePulseTimer);clearTimeout(autonomousTimer);delayed.forEach(clearTimeout);delayed.clear();
      if(raf)cancelAnimationFrame(raf);if(scrollFrame)cancelAnimationFrame(scrollFrame);
      controller.abort();ro.disconnect();io.disconnect();organObserver.disconnect();
      if(!contextLost){buffers.forEach(buffer=>gl.deleteBuffer(buffer));gl.deleteProgram(program);}
      stage.remove();
      if(window.FormatXCoreMobileV69?.destroy===destroy)delete window.FormatXCoreMobileV69;
      if(window.FormatXLivingCore?.destroy===destroy)delete window.FormatXLivingCore;
    }

    resize();
    const publicApi={
      version:VERSION,
      revision:REVISION,
      renderer:'single-webgl-crystal-organism-r326',
      material:'translucent-living-facet-organism-r326',
      geometry:'four-direction-asymmetric-crystal-organism-r326',
      scheduler:'interaction-bursts-idle-zero-frame-r441',
      pulse,
      surfacePulse:source=>startSurfacePulse(typeof source==='string'?source:'api'),
      surfacePulseDurationMs:SURFACE_PULSE_MS,
      setMorph:(value,source)=>setMorph(value,source||'api-morph',true),
      setShape:(shape,source)=>setShape(shape,source||'api-set'),
      toggleShape:source=>toggleShape(source||'api-toggle'),
      rotateBy:(x,y,source)=>rotateBy(Number(x)||0,Number(y)||0,source||'api-rotate'),
      requestRender:schedule,
      destroy,
      canvas,
      stage,
      get energy(){return energy;},
      get openness(){return .08+breath*.025;},
      get morph(){return morph;},
      get shape(){return shapeName();},
      get rotation(){return[rotationX,rotationY,rotationZ];},
      get vertexCount(){return geometry.count;}
    };
    window.FormatXCoreMobileV69=publicApi;
    window.FormatXLivingCore=publicApi;

    root.dataset.fxCrystalOrganismR326='ready';
    root.dataset.fxLivingOrganicCoreR413='ready';
    root.dataset.fxLivingOrganicCoreR454='luminous-electric-single-webgl-ready';
    root.dataset.fxCoreMobileR99=READY;
    root.dataset.fxCoreMobileV69=READY;
    root.dataset.fxCoreMobileV55='ready-v55';
    root.dataset.fxCoreReferenceLock=READY;
    root.dataset.fxCoreReal3d=READY;
    root.dataset.fxCoreRenderer='single-webgl-crystal-organism-r326';
    root.dataset.fxCoreMaterial='translucent-living-facet-organism-r326';
    root.dataset.fxCoreGeometry='four-direction-asymmetric-crystal-organism-r326';
    root.dataset.fxCoreRendererVersion=REVISION;
    root.dataset.fxCoreGeometryTopology=geometry.topology;
    root.dataset.fxCoreVertexCount=String(geometry.count);
    root.dataset.fxCoreDimension='native-closed-3d-volume-r413';
    root.dataset.fxCoreMorphGeometryR413='closed-sphere-and-four-tip-crystal-same-topology';
    root.dataset.fxCoreMorphNormalsR413='sphere-smooth-to-crystal-faceted-native-shader';
    root.dataset.fxCoreReferenceGeometry='closed-four-tip-crystal-and-sphere-r413';
    root.dataset.fxCoreReferenceMaterial='living-organic-prismatic-membrane-r413';
    root.dataset.fxCoreInteractionVisual='pointer-drag-tap-keyboard-scroll-site-state-r413';
    root.dataset.fxCoreLivingBehavior='interaction-and-intermittent-native-electric-surface-r454';
    root.dataset.fxCoreSiteRole='primary-living-site-interface-r413';
    root.dataset.fxCoreContexts='1';
    root.dataset.fxCoreScheduler='interaction-bursts-idle-zero-frame-r441';
    root.dataset.fxCoreSchedulerCompatibility='heartbeat-and-interaction-bursts-no-idle-loop-r326';
    root.dataset.fxCoreSchedulerR442='mobile-two-pass-lower-density-idle-zero';
    root.dataset.fxCoreCompositionR285='pure-webgl3d-no-2d-overlays';
    root.dataset.fxCoreCompositionRevisionR326='new-crystal-organism-no-legacy-fallback';
    root.dataset.fxCoreMobileVisualR326=mobile?'soft-translucent-organic-rim':'desktop-translucent-organic-rim';
    root.dataset.fxCoreMobileLightingR375=mobile?'superseded-r454-luminous-native-webgl':'desktop-r454-luminous-native-webgl';
    root.dataset.fxCoreMobileOpticsR414=mobile?'superseded-r454-native-shader-optics':'desktop-r454-native-shader-optics';
    root.dataset.fxCoreVisualR424=mobile?'r454-luminous-translucent-electric-caustics':'desktop-r454-luminous-electric-caustics';
    root.dataset.fxCoreVisualR440=mobile?'superseded-by-r454-sharp-readable-living-volume':'desktop-superseded-by-r454';
    root.dataset.fxCoreMobileLightingR374=mobile?'idle-visible-high-density-r454':'desktop-high-contrast-volume-r454';
    root.dataset.fxCoreOpticsR424='native-webgl-filmic-caustics-no-bitmap-no-css-core';
    root.dataset.fxCoreOpticsR454='single-luminous-webgl-material-owner';
    root.dataset.fxCoreSurfaceMotionR454='intermittent-native-electric-filament-every-five-to-six-seconds';
    root.dataset.fxCoreSurfacePulseR454='idle';
    root.dataset.fxCoreSurfaceEnergyR484='periodic-native-surface-energy';
    root.dataset.fxCoreSurfaceCountR484='0';
    root.dataset.fxCoreMobileResolutionR424=mobile?'r454-dpr-cap-1.75-pixel-budget-920k':'r454-desktop-dpr-cap-1.65-pixel-budget-1150k';
    root.dataset.fxCoreMobileOpticsR435=mobile?'superseded-by-r454-visible-native-surface':'desktop-preserved-r454';
    root.dataset.fxCoreMobileOpticsR440=mobile?'superseded-by-r454-luminous-electric-surface':'desktop-superseded-by-r454';
    root.dataset.fxCoreMobilePerformanceR442=mobile?'18x36-two-pass-intermittent-pulse-idle-zero':'desktop-three-pass-intermittent-pulse-idle-zero';
    root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';
    root.dataset.fxCoreReal3dTargetFps='interaction-60-idle-zero-r441';
    root.dataset.fxCoreIdleRenderR441='zero-frame';
    root.dataset.fxCoreRenderMs='0';
    root.dataset.fxCoreReal3dFps='60';

    publishShape('initial');
    schedule(1);
    scheduleHeartbeat();
    scheduleSurfacePulse();
    scheduleAutonomousMorph();
    dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{
      version:'r413',renderer:VERSION,revision:REVISION,context:webgl2?'webgl2':'webgl1',
      geometry:'closed-3d-volume',morph:'crystal-sphere-native-webgl',interactive:true,organism:true,legacyFallback:false
    }}));
    listen(window,'pagehide',destroy,{once:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});
  else boot();
}());
