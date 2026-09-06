/* FormatX R558 — bounded-cost single native WebGL living core.
   One canonical canvas, one renderer and one lifecycle owner. The shader keeps
   the crystal/sphere morph, cyan-violet glass, Fresnel response, nucleus, facet
   energy and deterministic surface sweep without procedural noise stacks that
   made the synchronous SwiftShader fallback monopolise the main thread. */
(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'crystal-organism-r326';
  const REVISION = 'living-luminous-electric-crystal-r558-bounded-shader';
  const READY = 'ready-v69';
  const mobile = matchMedia('(max-width:900px),(pointer:coarse)').matches;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const IDLE_ENERGY = mobile ? .50 : .43;
  const SURFACE_PULSE_MS = 1160;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  if (root.dataset.fxCrystalOrganismR326 === 'ready' || root.dataset.fxCrystalOrganismR326 === 'booting') return;
  root.dataset.fxCrystalOrganismR326 = 'booting';
  root.dataset.fxCoreMobileV55 = 'booting-v55';
  root.dataset.fxCoreMobileV69 = 'booting-v69';
  root.dataset.fxCoreShaderBudgetR558 = 'bounded-no-procedural-noise-stack';

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  function shaderFailure(gl, shader, fallback) {
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return '';
    return gl.getShaderInfoLog(shader) || fallback;
  }

  function waitForProgram(gl, program, extension) {
    if (!extension) {
      root.dataset.fxCoreShaderCompileR550 = 'synchronous-fallback';
      root.dataset.fxCoreShaderCompileR558 = 'bounded-synchronous-fallback';
      return Promise.resolve('synchronous-fallback');
    }
    root.dataset.fxCoreShaderCompileR550 = 'parallel-khr-pending';
    root.dataset.fxCoreShaderCompileR558 = 'parallel-khr-pending';
    return new Promise(resolve => {
      const poll = () => {
        if (gl.isContextLost()) { resolve('context-lost'); return; }
        if (gl.getProgramParameter(program, extension.COMPLETION_STATUS_KHR)) {
          root.dataset.fxCoreShaderCompileR550 = 'parallel-khr-complete';
          root.dataset.fxCoreShaderCompileR558 = 'parallel-khr-complete';
          resolve('parallel-khr');
          return;
        }
        setTimeout(poll, 12);
      };
      poll();
    });
  }

  async function link(gl, vertexSource, fragmentSource) {
    const program = gl.createProgram();
    const vertex = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
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
    const parallel = gl.getExtension('KHR_parallel_shader_compile');
    const compileMode = await waitForProgram(gl, program, parallel);
    if (compileMode === 'context-lost') {
      gl.deleteShader(vertex); gl.deleteShader(fragment); gl.deleteProgram(program);
      throw new Error('crystal organism context lost during shader compile');
    }
    const vertexError = shaderFailure(gl, vertex, 'crystal organism vertex shader compile failed');
    const fragmentError = shaderFailure(gl, fragment, 'crystal organism fragment shader compile failed');
    gl.deleteShader(vertex); gl.deleteShader(fragment);
    if (vertexError || fragmentError) { gl.deleteProgram(program); throw new Error(vertexError || fragmentError); }
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || 'crystal organism program link failed';
      gl.deleteProgram(program); throw new Error(message);
    }
    return program;
  }

  function normalize(v) { const length = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0]/length,v[1]/length,v[2]/length]; }
  function subtract(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
  function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}

  function buildOrganismGeometry() {
    const latitudeSegments = mobile ? 18 : 30;
    const longitudeSegments = mobile ? 36 : 56;
    const sphere=[],crystal=[],sphereNormals=[],crystalNormals=[],uvs=[],barycentrics=[],facets=[];
    function facetValue(x,y){const value=Math.sin(x*127.1+y*311.7)*43758.5453;return value-Math.floor(value);}
    function vertex(latitudeIndex, longitudeIndex) {
      const latitude=latitudeIndex/latitudeSegments,longitude=longitudeIndex/longitudeSegments;
      const phi=latitude*Math.PI,theta=longitude*Math.PI*2,sinPhi=Math.sin(phi);
      const direction=[sinPhi*Math.cos(theta),Math.cos(phi),sinPhi*Math.sin(theta)];
      const spherePosition=direction.map(value=>value*.91);
      const axisX=direction[0]>=0?.88:.86,axisY=direction[1]>=0?1.09:.97,axisZ=direction[2]>=0?.64:.43,exponent=.78;
      const terms=Math.pow(Math.abs(direction[0])/axisX,exponent)+Math.pow(Math.abs(direction[1])/axisY,exponent)+Math.pow(Math.abs(direction[2])/axisZ,exponent);
      const radial=1/Math.pow(Math.max(.0001,terms),1/exponent);
      const organic=1+.022*Math.sin(theta*4+phi*1.7)*Math.pow(sinPhi,2)+.010*Math.sin(theta*7-phi*3.1);
      return{sphere:spherePosition,crystal:direction.map(value=>value*radial*organic),sphereNormal:direction,uv:[longitude,latitude]};
    }
    function triangle(vertices,facet){
      let crystalNormal=normalize(cross(subtract(vertices[1].crystal,vertices[0].crystal),subtract(vertices[2].crystal,vertices[0].crystal)));
      const centre=[0,1,2].map(i=>(vertices[0].crystal[i]+vertices[1].crystal[i]+vertices[2].crystal[i])/3);
      if(dot(crystalNormal,centre)<0)crystalNormal=crystalNormal.map(value=>-value);
      const bary=[[1,0,0],[0,1,0],[0,0,1]];
      vertices.forEach((item,index)=>{sphere.push(...item.sphere);crystal.push(...item.crystal);sphereNormals.push(...item.sphereNormal);crystalNormals.push(...crystalNormal);uvs.push(...item.uv);barycentrics.push(...bary[index]);facets.push(facet);});
    }
    for(let latitude=0;latitude<latitudeSegments;latitude+=1){for(let longitude=0;longitude<longitudeSegments;longitude+=1){const a=vertex(latitude,longitude),b=vertex(latitude,longitude+1),c=vertex(latitude+1,longitude),d=vertex(latitude+1,longitude+1);if(latitude>0)triangle([a,b,c],.08+.92*facetValue(longitude,latitude*2));if(latitude<latitudeSegments-1)triangle([b,d,c],.08+.92*facetValue(longitude+37,latitude*2+1));}}
    return{arrays:[sphere,crystal,sphereNormals,crystalNormals,uvs,barycentrics,facets].map(values=>new Float32Array(values)),sizes:[3,3,3,3,2,3,1],count:facets.length,topology:`${latitudeSegments}x${longitudeSegments}-closed-uv-surface`};
  }

  async function boot(attempt=0) {
    const hero=document.getElementById('hero');
    const host=hero?.querySelector('.hero-space');
    if(!(hero instanceof HTMLElement)||!(host instanceof HTMLElement)){if(attempt<180)requestAnimationFrame(()=>{void boot(attempt+1);});else root.dataset.fxCrystalOrganismR326='host-unavailable';return;}
    window.FormatXCoreMobileV69?.destroy?.();
    host.querySelectorAll(':scope > .fx-core-mobile-v55-stage').forEach(node=>node.remove());
    const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-crystal-organism-r326-stage';stage.dataset.renderer=VERSION;stage.dataset.revision=REVISION;stage.dataset.active='true';stage.setAttribute('aria-hidden','true');host.prepend(stage);
    const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas fx-crystal-organism-r326-canvas';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);
    const options={alpha:true,antialias:true,depth:true,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'high-performance'};
    let gl=canvas.getContext('webgl2',options);const webgl2=Boolean(gl);if(!gl)gl=canvas.getContext('webgl',options);
    if(!gl){stage.remove();root.dataset.fxCrystalOrganismR326='context-unavailable';root.dataset.fxCoreReal3d='context-unavailable';dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'r326-webgl-unavailable',fallback:'none'}}));return;}

    const vertexIn=webgl2?'in':'attribute',vertexOut=webgl2?'out':'varying',fragmentIn=webgl2?'in':'varying',outputName=webgl2?'outColor':'gl_FragColor',versionLine=webgl2?'#version 300 es\n':'';
    const vertexSource=`${versionLine}precision highp float;
${vertexIn} vec3 aSphere;${vertexIn} vec3 aCrystal;${vertexIn} vec3 aSphereNormal;${vertexIn} vec3 aCrystalNormal;${vertexIn} vec2 aUv;${vertexIn} vec3 aBary;${vertexIn} float aFacet;
uniform float uTime,uEnergy,uBreath,uLayer,uMorph,uAspect,uSiteProgress;uniform vec2 uPointer;uniform vec3 uRotation;
${vertexOut} vec3 vNormal;${vertexOut} vec3 vLocal;${vertexOut} vec2 vUv;${vertexOut} vec3 vBary;${vertexOut} float vFacet;${vertexOut} float vMorph;
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,-s,0.,s,c,0.,0.,0.,1.);}
void main(){float morph=uMorph*uMorph*(3.0-2.0*uMorph);vec3 normal=normalize(mix(aCrystalNormal,aSphereNormal,morph));vec3 base=mix(aCrystal,aSphere,morph);float living=sin(uTime*.9+aUv.y*10.0+aUv.x*6.283)*.012*(.45+.55*uEnergy);float layerScale=uLayer>.5?.50:1.0;vec3 local=(base+normal*living)*layerScale*(1.0+uBreath*(uLayer>.5?.038:.016));local.xy+=uPointer*.036*uLayer;float yaw=.08+uRotation.y+uPointer.x*.22+uTime*.020;float pitch=-.055+uRotation.x-uPointer.y*.15;mat3 rotation=rz(uRotation.z)*ry(yaw)*rx(pitch);vec3 world=rotation*local;vNormal=normalize(rotation*normal);vLocal=world;vUv=aUv;vBary=aBary;vFacet=aFacet;vMorph=morph;float camera=3.12-world.z*.70;float perspective=2.76/max(1.72,camera);vec2 silhouette=vec2(mix(1.48,1.0,morph),mix(1.30,1.0,morph));vec2 projected=vec2(world.x/max(.56,uAspect),world.y)*silhouette*perspective;projected.y+=.010;gl_Position=vec4(projected,world.z*.13,1.0);}`;

    const fragmentSource=`${versionLine}precision highp float;
uniform float uTime,uEnergy,uBreath,uLayer,uMorph,uSiteProgress,uSurfacePulse;uniform vec2 uPointer;
${fragmentIn} vec3 vNormal;${fragmentIn} vec3 vLocal;${fragmentIn} vec2 vUv;${fragmentIn} vec3 vBary;${fragmentIn} float vFacet;${fragmentIn} float vMorph;${webgl2?'out vec4 outColor;':''}
float sat(float v){return clamp(v,0.,1.);}vec3 filmic(vec3 c){return 1.0-exp(-max(c,vec3(0.)));}
void main(){vec3 n=normalize(vNormal);vec3 view=normalize(vec3(-vLocal.xy,2.9-vLocal.z));vec3 key=normalize(vec3(-.42,.73,.54));float ndl=max(dot(n,key),0.);float facing=sat(abs(dot(n,view)));float fresnel=pow(1.0-facing,${mobile?'1.56':'1.68'});float specular=pow(max(dot(n,normalize(key+view)),0.),20.0);float facet=.5+.5*sin(vFacet*11.0+uTime*.35+uSiteProgress*4.0);float edge=1.0-smoothstep(${mobile?'.005':'.010'},${mobile?'.085':'.052'},min(vBary.x,min(vBary.y,vBary.z)));edge*=pow(1.0-vMorph,1.4)*(.025+.075*fresnel);vec2 heartLocal=vec2(vLocal.x,vLocal.y*1.025)-vec2(uPointer.x*.05,uPointer.y*.04);float radial=length(heartLocal);float heart=pow(sat(1.0-radial/.40),3.0);float nucleus=pow(sat(1.0-radial/.13),4.0);float ring=1.0-smoothstep(.012,.035,abs(radial-.19));float pulse=.5+.5*sin(uTime*2.4+vUv.y*6.283);float sweep=0.0;if(uSurfacePulse>=0.0){float coordinate=.5+(vLocal.y*.62+vLocal.x*.15+vLocal.z*.18)*.5;float head=mix(-.18,1.18,sat(uSurfacePulse));sweep=exp(-pow((coordinate-head)/.070,2.0))*(.38+.62*fresnel);}vec3 cyan=vec3(.03,1.14,1.66),violet=vec3(.74,.18,1.30),ice=vec3(.95,1.42,1.76);vec3 spectral=mix(cyan,violet,.16+.28*facet);float visual=sat(.48+uEnergy*.62);if(uLayer>.5){vec3 organ=mix(vec3(.035,.20,.50),spectral,.42+.22*visual);organ+=ice*heart*(.90+.55*uBreath);organ+=ice*nucleus*(2.60+.90*visual);organ+=spectral*ring*(1.10+.35*pulse);organ+=(ice+cyan*.55)*sweep*1.55;float alpha=.18+.20*visual+.20*heart+.32*nucleus+.14*ring+.12*sweep;${outputName}=vec4(filmic(organ*${mobile?'2.72':'2.45'}),clamp(alpha,.16,.86));return;}vec3 glass=mix(vec3(.035,.17,.40),vec3(.08,.58,.96),.26+.34*ndl);glass+=spectral*fresnel*(1.05+.75*visual);glass+=ice*specular*(1.15+.45*visual);glass+=spectral*edge*(.55+.45*facet);glass+=ice*(nucleus*.42+ring*.16);glass+=(ice+cyan*.48)*sweep*(1.05+.38*fresnel);float alpha=.34+.17*ndl+.28*fresnel+.07*edge+.12*specular+.10*sweep;${outputName}=vec4(filmic(glass*${mobile?'2.46':'2.24'}),clamp(alpha,.32,.82));}`;

    let program;try{program=await link(gl,vertexSource,fragmentSource);}catch(error){console.warn('FormatX crystal organism unavailable:',error);stage.remove();root.dataset.fxCrystalOrganismR326='shader-failed';root.dataset.fxCoreReal3d='shader-failed';return;}
    const geometry=buildOrganismGeometry(),buffers=geometry.arrays.map(()=>gl.createBuffer()),attributeNames=['aSphere','aCrystal','aSphereNormal','aCrystalNormal','aUv','aBary','aFacet'],attributes=attributeNames.map(name=>gl.getAttribLocation(program,name)),uniforms={};
    ['uTime','uEnergy','uBreath','uLayer','uMorph','uPointer','uAspect','uSiteProgress','uSurfacePulse','uRotation'].forEach(name=>{uniforms[name]=gl.getUniformLocation(program,name);});
    function upload(buffer,data,index,size){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,size,gl.FLOAT,false,0,0);}
    gl.useProgram(program);buffers.forEach((buffer,index)=>upload(buffer,geometry.arrays[index],attributes[index],geometry.sizes[index]));gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.clearColor(0,0,0,0);

    const controller=new AbortController(),listen=(target,type,handler,options={})=>target.addEventListener(type,handler,{...options,signal:controller.signal}),delayed=new Set(),later=(handler,delay)=>{const timer=setTimeout(()=>{delayed.delete(timer);handler();},delay);delayed.add(timer);return timer;};
    const initialShape=root.dataset.fxCoreShapeR337==='sphere'?'sphere':'crystal';
    let disposed=false,contextLost=false,visible=true,raf=0,burstFrames=0,width=0,height=0,aspect=1,px=0,py=0,tx=0,ty=0,energy=IDLE_ENERGY,targetEnergy=IDLE_ENERGY,breath=.12,targetBreath=.12,morph=initialShape==='sphere'?1:0,targetMorph=morph,rotationX=-.035,rotationY=0,rotationZ=0,targetRotationX=rotationX,targetRotationY=0,targetRotationZ=0,angularVelocityY=0,siteProgress=0,targetSiteProgress=0,last=performance.now(),simulationTime=0,renderAverage=0,surfacePulseTimer=0,scrollFrame=0,tapCandidate=null,surfacePulseStart=-Infinity,lastSurfacePulseAt=-Infinity,surfacePulseCount=0,activeOrgan='hero',shapeLockUntil=0;
    const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};cinematic.version=REVISION;cinematic.corePosition=[0,0,.52];
    function resize(){const rect=stage.getBoundingClientRect();if(rect.width<2||rect.height<2)return false;const cap=mobile?1.75:1.65,dpr=Math.min(devicePixelRatio||1,cap),budget=mobile?920000:1150000;let w=Math.max(2,Math.round(rect.width*dpr)),h=Math.max(2,Math.round(rect.height*dpr));if(w*h>budget){const k=Math.sqrt(budget/(w*h));w=Math.round(w*k);h=Math.round(h*k);}if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}width=w;height=h;aspect=rect.width/Math.max(1,rect.height);gl.viewport(0,0,w,h);root.dataset.fxCoreReal3dResolution=`${w}x${h}`;root.dataset.fxCoreReal3dScale=(w/Math.max(1,rect.width)).toFixed(2);root.dataset.fxCoreViewportAspect=aspect.toFixed(4);return true;}
    function blocked(){return disposed||contextLost||document.hidden||!visible||root.dataset.fxRenderLifecycleSuspended==='true';}
    function schedule(frames=1){if(blocked())return;const frameCap=mobile?8:24;burstFrames=Math.max(burstFrames,Math.min(frameCap,Math.max(1,frames)));if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}}
    function boost(value=.84,frames=8){targetEnergy=Math.max(targetEnergy,value);targetBreath=Math.max(targetBreath,.38+value*.48);schedule(reduced.matches?1:frames);}
    function shapeName(value=targetMorph){return value>=.5?'sphere':'crystal';}
    function publishShape(source='renderer'){const target=shapeName(),settled=Math.abs(morph-targetMorph)<.008;root.dataset.fxCoreShapeR337=target;root.dataset.fxCoreTargetShape=target;root.dataset.fxCoreShape=settled?target:`morphing-to-${target}`;root.dataset.fxCoreMorph=morph.toFixed(3);root.dataset.fxCoreMorphSource=source;root.dataset.fxCoreMorphEngine='native-webgl-closed-volume-r413';stage.dataset.shape=root.dataset.fxCoreShape;}
    function setMorph(value,source='api-morph',announce=true){const next=clamp(Number(value)||0,0,1),changed=Math.abs(next-targetMorph)>.001;targetMorph=next;if(/mag-button|api|keyboard|core-tap/.test(source))shapeLockUntil=performance.now()+7600;if(reduced.matches)morph=targetMorph;publishShape(source);boost(changed?1.04:.68,changed?8:3);if(changed&&announce)dispatchEvent(new CustomEvent('formatx:coreshapechange',{detail:{shape:shapeName(next),source,revision:'r413',renderer:VERSION,geometry:'closed-3d-volume'}}));return targetMorph;}
    function setShape(shape,source='api'){return setMorph(shape==='sphere'||shape===1||shape===true?1:0,source,true);}function toggleShape(source='interaction'){return setShape(targetMorph>=.5?'crystal':'sphere',source);}function rotateBy(x,y,source='api-rotate'){targetRotationX=clamp(targetRotationX+x,-1.02,1.02);targetRotationY+=y;root.dataset.fxCoreRotationSource=source;boost(.84,mobile?5:8);}
    function startSurfacePulse(source='autonomous'){const now=performance.now();if(disposed||contextLost||reduced.matches||document.hidden||!visible||now-lastSurfacePulseAt<2200)return false;dispatchEvent(new CustomEvent('formatx:coresurfacesweep',{detail:{phase:'start',source,duration:SURFACE_PULSE_MS}}));if(blocked())return false;surfacePulseStart=lastSurfacePulseAt=now;surfacePulseCount+=1;const pulseId=surfacePulseCount;targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+.24);targetBreath=Math.max(targetBreath,.42);root.dataset.fxCoreSurfacePulseR454=`sweep-${surfacePulseCount}-${source}`;root.dataset.fxCoreEnergyBoltR455=`surface-sweep-${source}-${surfacePulseCount}`;root.dataset.fxCoreSurfaceCountR484=String(surfacePulseCount);schedule(1);later(()=>{if(pulseId!==surfacePulseCount)return;surfacePulseStart=-Infinity;root.dataset.fxCoreSurfacePulseR454='idle';schedule(1);dispatchEvent(new CustomEvent('formatx:coresurfacesweep',{detail:{phase:'end',source,duration:SURFACE_PULSE_MS}}));},SURFACE_PULSE_MS);return true;}
    function scheduleSurfacePulse(){clearTimeout(surfacePulseTimer);surfacePulseTimer=0;if(disposed||contextLost||reduced.matches||document.hidden||!visible){root.dataset.fxCoreSurfaceSchedulerR484='suspended';return;}const delay=surfacePulseCount===0?(mobile?3400:3000):(mobile?5400:4900)+(surfacePulseCount%3)*520;root.dataset.fxCoreSurfaceSchedulerR484='armed-single-native-timer';surfacePulseTimer=setTimeout(()=>{surfacePulseTimer=0;startSurfacePulse('autonomous');scheduleSurfacePulse();},delay);}
    function render(now){const begin=performance.now(),dt=Math.min(48,Math.max(1,now-last));last=now;if(!reduced.matches)simulationTime+=dt*.001;const pointerEase=1-Math.exp(-dt*.018),rotationEase=1-Math.exp(-dt*.011);px+=(tx-px)*pointerEase;py+=(ty-py)*pointerEase;rotationX+=(targetRotationX-rotationX)*rotationEase;rotationY+=(targetRotationY-rotationY)*rotationEase;rotationZ+=(targetRotationZ-rotationZ)*rotationEase;if(Math.abs(angularVelocityY)>.00002){targetRotationY+=angularVelocityY*dt;angularVelocityY*=Math.exp(-dt*.010);}energy+=(targetEnergy-energy)*(1-Math.exp(-dt*.026));breath+=(targetBreath-breath)*(1-Math.exp(-dt*.032));targetEnergy+=(IDLE_ENERGY-targetEnergy)*(1-Math.exp(-dt*.006));targetBreath+=(.12-targetBreath)*(1-Math.exp(-dt*.007));morph+=(targetMorph-morph)*(reduced.matches?1:1-Math.exp(-dt*.0078));if(Math.abs(morph-targetMorph)<.0008)morph=targetMorph;siteProgress+=(targetSiteProgress-siteProgress)*(1-Math.exp(-dt*.005));cinematic.energy=energy;cinematic.openness=.08+breath*.025;cinematic.corePosition=[px*.055,-py*.045,.52+energy*.012];cinematic.morph=morph;cinematic.shape=shapeName();cinematic.rotation=[rotationX,rotationY,rotationZ];cinematic.siteProgress=siteProgress;publishShape();gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.uniform1f(uniforms.uTime,simulationTime);gl.uniform1f(uniforms.uEnergy,energy);gl.uniform1f(uniforms.uBreath,breath);gl.uniform1f(uniforms.uMorph,morph);gl.uniform2f(uniforms.uPointer,px,py);gl.uniform3f(uniforms.uRotation,rotationX,rotationY,rotationZ);gl.uniform1f(uniforms.uAspect,aspect);gl.uniform1f(uniforms.uSiteProgress,siteProgress);const pulseElapsed=(now-surfacePulseStart)/SURFACE_PULSE_MS;gl.uniform1f(uniforms.uSurfacePulse,pulseElapsed>=0&&pulseElapsed<=1?pulseElapsed:-1);gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);if(!mobile){gl.cullFace(gl.FRONT);gl.uniform1f(uniforms.uLayer,0);gl.drawArrays(gl.TRIANGLES,0,geometry.count);}gl.cullFace(gl.BACK);gl.uniform1f(uniforms.uLayer,1);gl.drawArrays(gl.TRIANGLES,0,geometry.count);gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1f(uniforms.uLayer,0);gl.drawArrays(gl.TRIANGLES,0,geometry.count);const ms=performance.now()-begin;renderAverage=renderAverage?renderAverage*.82+ms*.18:ms;root.dataset.fxCoreRenderMs=renderAverage.toFixed(2);root.dataset.fxCoreFrameMs=dt.toFixed(2);root.dataset.fxCoreReal3dFps=String(Math.min(60,Math.round(1000/Math.max(16.67,renderAverage))));}
    function frame(now){raf=0;if(blocked())return;render(now);burstFrames=Math.max(0,burstFrames-1);const pulseActive=now-surfacePulseStart>=0&&now-surfacePulseStart<=SURFACE_PULSE_MS;if(burstFrames>0||pulseActive)raf=requestAnimationFrame(frame);else{energy=targetEnergy=IDLE_ENERGY;breath=targetBreath=.12;morph=targetMorph;root.dataset.fxCoreIdleRenderR441='zero-frame';}}
    function point(event){const rect=stage.getBoundingClientRect();if(rect.width<2||rect.height<2)return null;return{x:clamp(((event.clientX-rect.left)/rect.width-.5)*2,-1,1),y:clamp(-((event.clientY-rect.top)/rect.height-.5)*2,-1,1)};}
    function onMove(event){if(event.pointerType==='touch')return;const q=point(event);if(!q)return;tx=q.x;ty=q.y;targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+.12);schedule(2);}function onDown(event){const q=point(event);if(q){tx=q.x;ty=q.y;}shapeLockUntil=performance.now()+4800;boost(.82,mobile?4:6);}function onLeave(){tx=0;ty=0;targetEnergy=IDLE_ENERGY;targetBreath=.12;schedule(2);}function pulse(detail){if(Number.isFinite(detail?.x))tx=clamp(detail.x,-1,1);if(Number.isFinite(detail?.y))ty=clamp(detail.y,-1,1);targetEnergy=Math.max(targetEnergy,detail?.phase==='drag'?.58:.88);targetBreath=Math.max(targetBreath,detail?.phase==='drag'?.58:.92);cinematic.lastInteractionAt=performance.now();root.dataset.fxCoreInteractionStateR454=`${detail?.phase||'pulse'}-synced`;schedule(detail?.phase==='drag'?(mobile?3:5):(mobile?8:14));}
    function onCoreInteraction(event){const detail=event.detail||{};pulse(detail);const x=Number(detail.x)||0,y=Number(detail.y)||0;if(detail.phase==='press')tapCandidate={x,y,lastX:x,lastY:y,started:performance.now(),moved:false};else if(detail.phase==='drag'&&tapCandidate){const totalX=x-tapCandidate.x,totalY=y-tapCandidate.y,deltaX=x-tapCandidate.lastX,deltaY=y-tapCandidate.lastY;tapCandidate.lastX=x;tapCandidate.lastY=y;if(Math.hypot(totalX,totalY)>.075)tapCandidate.moved=true;targetRotationY+=deltaX*2.4;targetRotationX=clamp(targetRotationX-deltaY*1.8,-1.02,1.02);angularVelocityY=deltaX*.020;}else if(detail.phase==='release'){const candidate=tapCandidate;tapCandidate=null;if(candidate&&!candidate.moved&&performance.now()-candidate.started<720)toggleShape('core-tap');}else if(detail.phase==='cancel')tapCandidate=null;}
    function onScroll(){if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;const range=Math.max(1,document.documentElement.scrollHeight-innerHeight);targetSiteProgress=clamp(scrollY/range,0,1);root.dataset.fxCoreSiteProgress=targetSiteProgress.toFixed(3);targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+.08+Math.sin(targetSiteProgress*Math.PI)*.12);schedule(mobile?1:2);});}
    function signalShape(shape,source){if(performance.now()<shapeLockUntil)return;setShape(shape,source);}
    listen(hero,'pointermove',onMove,{passive:true});listen(hero,'pointerdown',onDown,{passive:true});listen(hero,'pointerleave',onLeave,{passive:true});listen(window,'formatx:coreinteraction',onCoreInteraction,{passive:true});listen(reduced,'change',()=>{surfacePulseStart=-Infinity;scheduleSurfacePulse();schedule(1);},{passive:true});listen(window,'scroll',onScroll,{passive:true});listen(window,'resize',resize,{passive:true});listen(window,'orientationchange',resize,{passive:true});listen(window,'formatx:organismpanelopen',()=>signalShape('sphere','organism-listening'),{passive:true});listen(window,'formatx:organismresponse',()=>signalShape('crystal','organism-response'),{passive:true});listen(window,'formatx:open-live-os',()=>signalShape('sphere','live-os-open'),{passive:true});listen(document,'visibilitychange',()=>{if(!document.hidden)schedule(1);scheduleSurfacePulse();},{passive:true});
    listen(canvas,'webglcontextlost',event=>{event.preventDefault();contextLost=true;if(raf)cancelAnimationFrame(raf);raf=0;scheduleSurfacePulse();root.dataset.fxCoreReal3d='context-lost';root.dataset.fxCrystalOrganismR326='context-lost';});listen(canvas,'webglcontextrestored',()=>{root.dataset.fxCrystalOrganismR326='restoring';destroy();requestAnimationFrame(()=>{void boot();});});
    const ro=new ResizeObserver(()=>{if(resize())schedule(1);});ro.observe(stage);const io=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.04);if(visible)schedule(1);else if(raf){cancelAnimationFrame(raf);raf=0;}scheduleSurfacePulse();},{threshold:[0,.04]});io.observe(stage);const sectionShapes={hero:'crystal',experience:'sphere',capabilities:'crystal',pricing:'sphere',system:'crystal',resources:'sphere'};const organObserver=new IntersectionObserver(entries=>{const candidate=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0],id=candidate?.target?.id;if(!id||id===activeOrgan)return;activeOrgan=id;root.dataset.fxCoreActiveOrgan=id;cinematic.activeOrgan=id;if(sectionShapes[id])signalShape(sectionShapes[id],'site-section');boost(.54,mobile?2:3);},{rootMargin:'-22% 0px -54% 0px',threshold:[0,.15,.35,.6]});document.querySelectorAll('main > section[id],main section.scene[id]').forEach(section=>organObserver.observe(section));
    function destroy(){if(disposed)return;disposed=true;clearTimeout(surfacePulseTimer);delayed.forEach(clearTimeout);delayed.clear();if(raf)cancelAnimationFrame(raf);if(scrollFrame)cancelAnimationFrame(scrollFrame);controller.abort();ro.disconnect();io.disconnect();organObserver.disconnect();if(!contextLost){buffers.forEach(buffer=>gl.deleteBuffer(buffer));gl.deleteProgram(program);}stage.remove();if(window.FormatXCoreMobileV69?.destroy===destroy)delete window.FormatXCoreMobileV69;if(window.FormatXLivingCore?.destroy===destroy)delete window.FormatXLivingCore;}
    resize();
    const publicApi={version:VERSION,revision:REVISION,renderer:'single-webgl-crystal-organism-r326',material:'translucent-living-facet-organism-r326',geometry:'four-direction-asymmetric-crystal-organism-r326',scheduler:'interaction-bursts-idle-zero-frame-r441',pulse,surfacePulse:source=>startSurfacePulse(typeof source==='string'?source:'api'),surfacePulseDurationMs:SURFACE_PULSE_MS,setMorph:(value,source)=>setMorph(value,source||'api-morph',true),setShape:(shape,source)=>setShape(shape,source||'api-set'),toggleShape:source=>toggleShape(source||'api-toggle'),rotateBy:(x,y,source)=>rotateBy(Number(x)||0,Number(y)||0,source||'api-rotate'),requestRender:schedule,destroy,canvas,stage,get energy(){return energy;},get openness(){return .08+breath*.025;},get morph(){return morph;},get shape(){return shapeName();},get rotation(){return[rotationX,rotationY,rotationZ];},get vertexCount(){return geometry.count;}};window.FormatXCoreMobileV69=publicApi;window.FormatXLivingCore=publicApi;
    root.dataset.fxCrystalOrganismR326='ready';root.dataset.fxLivingOrganicCoreR413='ready';root.dataset.fxLivingOrganicCoreR454='luminous-electric-single-webgl-ready';root.dataset.fxCoreMobileR99=READY;root.dataset.fxCoreMobileV69=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock=READY;root.dataset.fxCoreReal3d=READY;root.dataset.fxCoreRenderer='single-webgl-crystal-organism-r326';root.dataset.fxCoreMaterial='translucent-living-facet-organism-r326';root.dataset.fxCoreGeometry='four-direction-asymmetric-crystal-organism-r326';root.dataset.fxCoreRendererVersion=REVISION;root.dataset.fxCoreGeometryTopology=geometry.topology;root.dataset.fxCoreVertexCount=String(geometry.count);root.dataset.fxCoreDimension='native-closed-3d-volume-r413';root.dataset.fxCoreMorphGeometryR413='closed-sphere-and-four-tip-crystal-same-topology';root.dataset.fxCoreMorphNormalsR413='sphere-smooth-to-crystal-faceted-native-shader';root.dataset.fxCoreReferenceGeometry='closed-four-tip-crystal-and-sphere-r413';root.dataset.fxCoreReferenceMaterial='living-organic-prismatic-membrane-r413';root.dataset.fxCoreInteractionVisual='pointer-drag-tap-keyboard-scroll-site-state-r413';root.dataset.fxCoreLivingBehavior='interaction-and-intermittent-native-electric-surface-r454';root.dataset.fxCoreSiteRole='primary-living-site-interface-r413';root.dataset.fxCoreContexts='1';root.dataset.fxCoreScheduler='interaction-bursts-idle-zero-frame-r441';root.dataset.fxCoreCompositionR285='pure-webgl3d-no-2d-overlays';root.dataset.fxCoreCompositionRevisionR326='new-crystal-organism-no-legacy-fallback';root.dataset.fxCoreOpticsR424='native-webgl-filmic-caustics-no-bitmap-no-css-core';root.dataset.fxCoreOpticsR454='single-luminous-webgl-material-owner';root.dataset.fxCoreSurfaceMotionR454='intermittent-native-electric-filament-every-five-to-six-seconds';root.dataset.fxCoreSurfacePulseR454='idle';root.dataset.fxCoreSurfaceEnergyR484='periodic-native-surface-energy';root.dataset.fxCoreSurfaceCountR484='0';root.dataset.fxCoreMobilePerformanceR442=mobile?'18x36-two-pass-intermittent-pulse-idle-zero':'desktop-three-pass-intermittent-pulse-idle-zero';root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';root.dataset.fxCoreReal3dTargetFps='interaction-60-idle-zero-r441';root.dataset.fxCoreIdleRenderR441='zero-frame';root.dataset.fxCoreRenderMs='0';root.dataset.fxCoreReal3dFps='60';root.dataset.fxCoreLifecycleR536='automatic-zero-idle-visible-pulse';root.dataset.fxCoreShaderCompileModeR550=root.dataset.fxCoreShaderCompileR550||'synchronous-fallback';root.dataset.fxCoreShaderCompileModeR558=root.dataset.fxCoreShaderCompileR558||'bounded-synchronous-fallback';
    publishShape('initial');schedule(1);scheduleSurfacePulse();dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'r558',renderer:VERSION,revision:REVISION,context:webgl2?'webgl2':'webgl1',geometry:'closed-3d-volume',morph:'crystal-sphere-native-webgl',interactive:true,organism:true,legacyFallback:false,shaderCompile:root.dataset.fxCoreShaderCompileModeR558}}));listen(window,'pagehide',destroy,{once:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void boot();},{once:true});else void boot();
}());