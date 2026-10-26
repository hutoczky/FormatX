(() => {
  'use strict';

  // R2143: the production homepage is served at '/', even though the
  // renderer source lives below '/scifi-ui/scripts/'. Resolving against
  // location.href previously requested /scripts/three-r185.module.js and
  // silently forced the phone intro to its flat 2D fallback.
  const THREE_SOURCES = [
    new URL('/scifi-ui/scripts/three-r185.module.js', location.origin).href
  ];

  const clamp = (v,a=0,b=1) => Math.max(a,Math.min(b,v));
  const smooth = v => { v=clamp(v); return v*v*(3-2*v); };
  const ease = v => 1-Math.pow(1-clamp(v),3);
  const mix = (a,b,t) => a+(b-a)*t;

  async function loadThree(){
    let last=null;
    for(const url of THREE_SOURCES){
      try { return await import(url); } catch(error){ last=error; }
    }
    throw last || new Error('Three.js could not be loaded');
  }

  function seeded(seed=649651){
    let s=seed>>>0;
    return () => {
      s += 0x6D2B79F5;
      let t=s;
      t=Math.imul(t^(t>>>15),t|1);
      t^=t+Math.imul(t^(t>>>7),t|61);
      return ((t^(t>>>14))>>>0)/4294967296;
    };
  }

  function setOpacity(root,opacity){
    root.traverse?.(node=>{
      const m=node.material;
      if(!m)return;
      if(Array.isArray(m))m.forEach(x=>{x.transparent=true;x.opacity=opacity;});
      else {m.transparent=true;m.opacity=opacity;}
    });
  }

  class FormatXGenesisThree {
    constructor(THREE,canvas,getTarget){
      this.THREE=THREE;
      this.canvas=canvas;
      this.getTarget=getTarget;
      this.rand=seeded(0xF04A650);
      this.width=1;
      this.height=1;
      this.lastRender=0;
      this.disposed=false;
      // R2146: inspect real GPU pixels only in deterministic visual proofs.
      // Never stall a user's normal cinematic with gl.readPixels.
      this.proofReadback=new URLSearchParams(location.search).has('introframe');
      this.proofPixel=this.proofReadback?new Uint8Array(4):null;

      this.mobileRender=matchMedia('(max-width:900px),(max-aspect-ratio:27/25)').matches;
      this.renderer=new THREE.WebGLRenderer({
        canvas,
        alpha:false,
        antialias:true,
        depth:true,
        stencil:false,
        powerPreference:'high-performance',
        preserveDrawingBuffer:false
      });
      this.renderer.setClearColor(0x02070b,1);
      this.renderer.outputColorSpace=THREE.SRGBColorSpace;
      this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure=1.08;

      this.scene=new THREE.Scene();
      this.scene.background=new THREE.Color(0x02070b);
      this.scene.fog=new THREE.FogExp2(0x02070b,0.044);

      this.camera=new THREE.PerspectiveCamera(42,1,0.05,80);
      this.camera.position.set(0,0.12,7.25);

      this.world=new THREE.Group();
      this.scene.add(this.world);

      this.dnaGroup=new THREE.Group();
      this.organicGroup=new THREE.Group();
      this.cellGroup=new THREE.Group();
      this.mechanicalGroup=new THREE.Group();
      this.tentacleGroup=new THREE.Group();
      this.coreGroup=new THREE.Group();

      this.world.add(this.dnaGroup,this.organicGroup,this.cellGroup,this.tentacleGroup,this.mechanicalGroup,this.coreGroup);

      this.makeLights();
      this.makeStudioEnvironment();
      this.makeParticles();
      this.makeDebris();
      this.makeDNAField();
      this.makeGenomeParticles();
      this.makeCore();
      this.makeEmbryoFilm();
      this.makeOrganicLayer();
      this.makeCellularLayer();
      this.makeMechanicalLayer();
      this.makeAssemblyWeld();
      this.makeTentacles();
      this.resize();
    }

    makeLights(){
      const T=this.THREE;
      /* R1950 — studio lighting, not game-VFX lighting.
         Neutral soft key + restrained cyan transmission + very faint cool rim. */
      this.scene.add(new T.HemisphereLight(0x8fb8bd,0x05080b,0.54));
      const key=new T.DirectionalLight(0xe7f2ef,1.62);
      key.position.set(-3.8,5.4,6.4);
      this.scene.add(key);
      this.studioKey=key;
      const fill=new T.DirectionalLight(0x9fb9b8,.42);
      fill.position.set(4.4,1.8,5.2);
      this.scene.add(fill);
      this.studioFill=fill;
      // R2114: restrained opposing studio strip, only on desktop-class
      // hardware. This illuminates actual 3D geometry and specular normals,
      // unlike a CSS overlay or a 2D fallback highlight.
      if(!this.mobileRender && Number(navigator.hardwareConcurrency||8)>4){
        const studioStrip=new T.SpotLight(0xc5e4e5,1.10,13,Math.PI*.32,.94,1.8);
        studioStrip.position.set(4.3,3.6,5.8);
        studioStrip.target.position.set(-.18,.10,0);
        this.scene.add(studioStrip,studioStrip.target);
      }
      const rim=new T.PointLight(0x6b9da9,10.5,13,2);
      rim.position.set(3.1,-1.9,3.9);
      this.scene.add(rim);
      const bioticFill=new T.PointLight(0x385866,5.8,11,2);
      bioticFill.position.set(-2.8,-.4,3.4);
      this.scene.add(bioticFill);
      this.coreLight=new T.PointLight(0x78e6e8,0,7.2,2);
      this.coreLight.position.set(0,0,2.0);
      this.scene.add(this.coreLight);
      this.mechLight=new T.PointLight(0xcde7e4,0,7.6,2);
      this.mechLight.position.set(-2.6,3.0,4.4);
      this.scene.add(this.mechLight);
    }

    makeStudioEnvironment(){
      // R2193 — camera-grade specular light tent. Three real broad light cards
      // and a cool horizon are baked once into one low-resolution HDR-like
      // equirectangular environment. Physically based metal receives coherent
      // broad softbox reflections, not extra CSS overlays or neon bloom.
      const T=this.THREE;
      const canvas=document.createElement('canvas');
      const w=this.mobileRender?256:512;
      canvas.width=w;canvas.height=w/2;
      const ctx=canvas.getContext('2d',{alpha:false});
      if(!ctx)return;
      const h=canvas.height;
      const fill=ctx.createLinearGradient(0,0,0,h);
      fill.addColorStop(0,'#18252b');
      fill.addColorStop(.35,'#091319');
      fill.addColorStop(.61,'#101b21');
      fill.addColorStop(1,'#03070b');
      ctx.fillStyle=fill;ctx.fillRect(0,0,w,h);
      // Feathered reflections from long, physically plausible studio panels.
      const card=(x,y,rx,ry,angle,white,outer)=>{
        ctx.save();ctx.translate(x*w,y*h);ctx.rotate(angle);
        ctx.scale(rx*w,ry*h);
        const g=ctx.createRadialGradient(0,0,.02,0,0,1);
        g.addColorStop(0,white);g.addColorStop(.50,white);
        g.addColorStop(.78,outer);g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);
        ctx.fill();ctx.restore();
      };
      card(.22,.36,.063,.31,-.22,'rgba(226,244,242,.91)','rgba(94,142,145,.18)');
      card(.68,.46,.043,.37,.14,'rgba(194,220,217,.77)','rgba(82,122,128,.14)');
      card(.49,.19,.32,.068,0,'rgba(135,180,195,.32)','rgba(54,99,114,.05)');
      card(.87,.58,.12,.18,.35,'rgba(71,154,175,.26)','rgba(34,83,110,.04)');
      let texture=null,pmrem=null;
      try{
        texture=new T.CanvasTexture(canvas);
        texture.mapping=T.EquirectangularReflectionMapping;
        texture.colorSpace=T.SRGBColorSpace;
        pmrem=new T.PMREMGenerator(this.renderer);
        this.studioEnvTarget=pmrem.fromEquirectangular(texture);
        this.scene.environment=this.studioEnvTarget.texture;
        this.scene.environmentIntensity=this.mobileRender?.64:.84;
        this.studioEnvironmentTexture=texture;
      }catch(error){
        this.studioEnvTarget?.dispose?.();
        this.studioEnvTarget=null;
        this.scene.environment=null;
        texture?.dispose?.();
        console.warn('FormatX neutral studio environment fallback:',error);
      }finally{
        pmrem?.dispose?.();
      }
    }

    makeParticles(){
      const T=this.THREE,r=this.rand;
      const count=640;
      const pos=new Float32Array(count*3);
      const size=new Float32Array(count);
      for(let i=0;i<count;i++){
        const rr=2.4+r()*8.5;
        const a=r()*Math.PI*2;
        const y=(r()-.5)*7.2;
        pos[i*3]=Math.cos(a)*rr;
        pos[i*3+1]=y;
        pos[i*3+2]=-1-r()*10;
        size[i]=.6+r()*2.0;
      }
      const g=new T.BufferGeometry();
      g.setAttribute('position',new T.BufferAttribute(pos,3));
      const m=new T.PointsMaterial({
        color:0x9bc8ce,size:.034,transparent:true,opacity:.34,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });
      this.particles=new T.Points(g,m);
      this.scene.add(this.particles);
    }

    makeDebris(){
      const T=this.THREE,r=this.rand;
      const geo=new T.IcosahedronGeometry(.050,0);
      const mat=new T.MeshStandardMaterial({
        color:0x73728f,roughness:.72,metalness:.03,
        emissive:0x142b3b,emissiveIntensity:.28,
        transparent:true,opacity:.40,depthWrite:false
      });
      const mesh=new T.InstancedMesh(geo,mat,72);
      const dummy=new T.Object3D();
      for(let i=0;i<72;i++){
        const a=r()*Math.PI*2, rr=1.55+r()*3.8, sc=.42+r()*1.8;
        dummy.position.set(Math.cos(a)*rr,(r()-.5)*4.3,-1.15+(r()-.5)*3.2);
        dummy.rotation.set(r()*3,r()*3,r()*3);
        dummy.scale.set(sc*(.55+r()*.7),sc,sc*(.45+r()*.7));
        dummy.updateMatrix();
        mesh.setMatrixAt(i,dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate=true;
      // R2195: polygonal rubble competed with the molecular hero and read as
      // an asteroid game scene, not photographic studio set dressing.
      // Retain the object for compatible lifecycle but exclude its draw call.
      mesh.visible=false;
      this.debris=mesh;
      this.scene.add(mesh);
    }

    makeBioticSurface(){
      // Shared microscopic relief, generated once without an image request or
      // another canvas/context. The existing studio lights reveal these fibres.
      const T=this.THREE,width=256,height=128,r=seeded(0x2187b10);
      const pixels=new Uint8Array(width*height*4),tau=Math.PI*2;
      for(let y=0;y<height;y++){
        for(let x=0;x<width;x++){
          const u=x/width,v=y/height;
          const fibre=Math.sin(tau*(v*19+u*3)+1.7*Math.sin(tau*u*2));
          const fine=Math.sin(tau*(v*43-u*7));
          const relief=.5+.20*fibre+.10*fine+(r()-.5)*.16;
          const value=Math.round(126+relief*112),offset=(y*width+x)*4;
          pixels[offset]=pixels[offset+1]=pixels[offset+2]=value;
          pixels[offset+3]=255;
        }
      }
      const texture=new T.DataTexture(pixels,width,height,T.RGBAFormat);
      texture.wrapS=texture.wrapT=T.RepeatWrapping;
      texture.magFilter=T.LinearFilter;
      texture.minFilter=T.LinearMipmapLinearFilter;
      texture.generateMipmaps=true;
      texture.needsUpdate=true;
      this.bioticSurfaceTexture=texture;
    }

    createHelix(length=4.7,radius=.28,turns=4.1){
      const T=this.THREE;
      const group=new T.Group();
      const seg=120;
      const aPts=[],bPts=[],rungPairs=[],beadA=[],beadB=[];
      for(let i=0;i<=seg;i++){
        const u=i/seg;
        const x=(u-.5)*length;
        const q=u*Math.PI*2*turns;
        const y=Math.sin(q)*radius;
        const z=Math.cos(q)*radius;
        const a=new T.Vector3(x,y,z),b=new T.Vector3(x,-y,-z);
        aPts.push(a);bPts.push(b);
        if(i%4===0){
          rungPairs.push([a,b]);
          beadA.push(a.x,a.y,a.z);beadB.push(b.x,b.y,b.z);
        }
      }

      const curveA=new T.CatmullRomCurve3(aPts,false,'centripetal');
      const curveB=new T.CatmullRomCurve3(bPts,false,'centripetal');
      const ma=new T.MeshPhysicalMaterial({
        color:0x80cbd5,emissive:0x185463,emissiveIntensity:.82,
        roughness:.29,metalness:.06,transparent:true,opacity:.90,
        depthWrite:false,clearcoat:.62,clearcoatRoughness:.14,
        bumpMap:this.bioticSurfaceTexture,bumpScale:.0045,
        roughnessMap:this.bioticSurfaceTexture
      });
      const mb=new T.MeshPhysicalMaterial({
        color:0x9d8ad5,emissive:0x493176,emissiveIntensity:.82,
        roughness:.30,metalness:.05,transparent:true,opacity:.88,
        depthWrite:false,clearcoat:.58,clearcoatRoughness:.16,
        bumpMap:this.bioticSurfaceTexture,bumpScale:.0045,
        roughnessMap:this.bioticSurfaceTexture
      });
      const ga=new T.MeshBasicMaterial({
        color:0x4bdfff,transparent:true,opacity:.080,depthWrite:false,
        blending:T.AdditiveBlending
      });
      const gb=new T.MeshBasicMaterial({
        color:0x997bff,transparent:true,opacity:.070,depthWrite:false,
        blending:T.AdditiveBlending
      });
      // R2188: complementary nucleotide chemistry is readable as genuine
      // alternating base pairs inside the 3D molecule. Per-instance color
      // uses the SAME instanced draw call, including on Android.
      const rungMat=new T.MeshPhysicalMaterial({
        color:0xf0f7ff,emissive:0x24353e,emissiveIntensity:.35,
        metalness:.04,roughness:.32,clearcoat:.62,clearcoatRoughness:.18,
        transparent:true,opacity:.94,depthWrite:false,
        bumpMap:this.bioticSurfaceTexture,bumpScale:.0020,
        roughnessMap:this.bioticSurfaceTexture
      });
      const mpa=new T.PointsMaterial({
        color:0xb7f3ff,size:.034,transparent:true,opacity:.42,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });
      const mpb=new T.PointsMaterial({
        color:0xa994ff,size:.032,transparent:true,opacity:.38,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });

      // R2185: broader founding helix receives a physically thicker hydrated
      // phosphate backbone; smaller donors keep their original profile.
      const backbone=radius>.35?.043:.031;
      const aureole=radius>.35?.087:.065;
      const tubeA=new T.Mesh(new T.TubeGeometry(curveA,seg,backbone,12,false),ma);
      const tubeB=new T.Mesh(new T.TubeGeometry(curveB,seg,backbone,12,false),mb);
      const auraA=new T.Mesh(new T.TubeGeometry(curveA,seg,aureole,8,false),ga);
      const auraB=new T.Mesh(new T.TubeGeometry(curveB,seg,aureole,8,false),gb);

      const rungGeo=new T.CylinderGeometry(.018,.018,1,10,1,false);
      const rungs=new T.InstancedMesh(rungGeo,rungMat,rungPairs.length);
      const dummy=new T.Object3D();
      const up=new T.Vector3(0,1,0);
      rungPairs.forEach(([a,b],i)=>{
        const mid=a.clone().add(b).multiplyScalar(.5);
        const dir=b.clone().sub(a);
        const len=dir.length();
        dummy.position.copy(mid);
        dummy.quaternion.setFromUnitVectors(up,dir.normalize());
        dummy.scale.set(1,len,1);
        dummy.updateMatrix();
        rungs.setMatrixAt(i,dummy.matrix);
        // A-T / G-C / T-A / C-G complementary pairs; icy turquoise,
        // lilac, pale silver-blue and violet. One GPU instanced palette.
        const baseColors=[0x8af5e2,0xc6a3fa,0xbce8fb,0x99b0ff];
        rungs.setColorAt(i,new T.Color(baseColors[i%baseColors.length]));
      });
      rungs.instanceMatrix.needsUpdate=true;
      if(rungs.instanceColor)rungs.instanceColor.needsUpdate=true;

      const pga=new T.BufferGeometry();pga.setAttribute('position',new T.Float32BufferAttribute(beadA,3));
      const pgb=new T.BufferGeometry();pgb.setAttribute('position',new T.Float32BufferAttribute(beadB,3));
      group.add(auraA,auraB,tubeA,tubeB,rungs,new T.Points(pga,mpa),new T.Points(pgb,mpb));
      group.userData.materials=[ma,mb,ga,gb,rungMat,mpa,mpb];
      group.userData.baseOpacity=[.90,.88,.080,.070,.88,.50,.46];
      return group;
    }

    makeDNAField(){
      this.makeBioticSurface();
      // R2146: a portrait camera only covers about 2 world units in width.
      // The old panoramic sources at x=+/-2.3 lived offscreen on phones,
      // so a capable Android device could still appear to open on black.
      // Establish one large, genuine 3D double helix in the center, plus
      // three smaller biological satellites feeding the four MAG arms.
      // R2164: frame one must show ONE complete, central 3D DNA double
      // helix on desktop as well as phones. The older desktop composition
      // put all ten sources around the edges and left the hero centre empty.
      // Supporting helices join later and flow into the four MAG arms.
      const placements=this.mobileRender?[
        [.00,.06,.60,1.57,.92],
        [-.55,.18,.16,1.30,.48],
        [.56,.16,.12,1.82,.48],
        [.00,-.87,-.20,1.58,.39]
      ]:[
        // R2165: the entire main helix remains inside the cinematic frame,
        // while smaller distant donors assemble into four chassis arms.
        [.00,.03,.55,1.57,.76],
        [-2.00,1.02,-.34,-.44,.43],
        [2.00,1.02,-.34,.44,.43],
        [-2.01,-1.02,-.39,.45,.43],
        [2.01,-1.02,-.39,-.45,.43],
        [-1.05,.06,-.82,1.38,.34],
        [1.05,.06,-.82,1.76,.34]
      ];
      // R2183: explicit four-arm source assignment. On desktop, nearest-axis
      // classification of the seven authored DNA parents produced ZERO south
      // donors (every bottom diagonal was classified as east/west), leaving
      // the lower titanium arm without any visible double-helix feed.
      // This physical routing covers N/E/S/W on both viewport profiles.
      const armAssignments=this.mobileRender
        ? [1,2,0,3]
        : [1,1,0,2,3,2,0];
      if(placements.length!==armAssignments.length){
        throw new Error('DNA donor routing must match the authored helix positions');
      }
      // R2131: four persistent, GPU-light DNA-to-arm transfer strands.
      // Their endpoints are animated with the same chassis-axis mapping
      // as the parent helices, visually bridging DNA and emerging metal.
      this.birthStrands=[];
      const T=this.THREE;
      // R2133: two phase-opposed strands per arm carry the helix's
      // double-stranded identity all the way into the metal silhouette.
      for(let axis=0;axis<4;axis++){
        for(let lane=0;lane<2;lane++){
          const positions=new Float32Array(3*40);
          const geometry=new T.BufferGeometry();
          geometry.setAttribute('position',new T.BufferAttribute(positions,3));
          const material=new T.LineBasicMaterial({
            color:lane===0?0x81fff3:0xb69bff,transparent:true,opacity:0,
            depthWrite:false,blending:T.AdditiveBlending
          });
          const strand=new T.Line(geometry,material);
          strand.userData.axis=axis;
          strand.userData.lane=lane;
          strand.visible=false;
          strand.frustumCulled=false;
          this.dnaGroup.add(strand);
          this.birthStrands.push(strand);
          // R2188: actual 3D molecular transfer filaments. A standard
          // WebGL line collapses to one pixel on mobile; a tiny preallocated
          // tubular mesh has physical width and a genuine rotating surface.
          const sides=6,rings=40;
          const tubeGeometry=new T.BufferGeometry();
          const tubePositions=new Float32Array(rings*sides*3);
          const tubeIndices=[];
          for(let k=0;k<rings-1;k++){
            for(let side=0;side<sides;side++){
              const nextSide=(side+1)%sides;
              const a=k*sides+side,b=k*sides+nextSide;
              const c=(k+1)*sides+side,d=(k+1)*sides+nextSide;
              tubeIndices.push(a,c,b,b,c,d);
            }
          }
          tubeGeometry.setAttribute('position',new T.BufferAttribute(tubePositions,3));
          tubeGeometry.setIndex(tubeIndices);
          // R2191: physically lit mineral-biomolecule, not a white-hot
          // additive tube. Retain cyan/violet molecular identity.
          const tubeMaterial=new T.MeshStandardMaterial({
            color:lane===0?0x4aaeb5:0x9a80cf,
            emissive:lane===0?0x155e67:0x493776,
            emissiveIntensity:.26,metalness:.28,roughness:.34,
            transparent:true,opacity:0,depthWrite:false,
            blending:T.NormalBlending,side:T.DoubleSide
          });
          const tube=new T.Mesh(tubeGeometry,tubeMaterial);
          tube.visible=false;
          tube.frustumCulled=false;
          strand.userData.tube=tube;
          this.dnaGroup.add(tube);
        }
      }
      // R2157: paired cross-bridges make the arm transfer read as
      // recognizable DNA, rather than two independent light trails.
      // Four shared GPU line batches (one per arm), no per-frame allocations.
      this.birthRungs=[];
      for(let axis=0;axis<4;axis++){
        const geometry=new T.BufferGeometry();
        geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(12*2*3),3));
        const material=new T.LineBasicMaterial({
          color:0xb8eae7,transparent:true,opacity:0,
          depthWrite:false,blending:T.AdditiveBlending
        });
        const bridges=new T.LineSegments(geometry,material);
        bridges.visible=false;
        bridges.frustumCulled=false;
        this.dnaGroup.add(bridges);
        this.birthRungs.push(bridges);
      }
      this.dnas=[];
      for(const [index,[x,y,z,rz,sc]] of placements.entries()){
        // R2185: opening DNA is a wide, legible molecular subject rather
        // than a thin luminous wire. Preserve donors and total animation time.
        // R2187: keep the full founding DNA ladder within the cinematic frame.
        // A shorter molecular shaft preserves its readable wide base pairs.
        const h=this.createHelix(index===0?3.54:4.08,index===0?.410:.272,3.82);
        h.position.set(x,y,z);
        h.rotation.z=rz;
        h.rotation.y=(this.rand()-.5)*.24;
        h.scale.setScalar(sc);
        h.userData.base={x,y,z,rz,s:sc,phase:this.rand()*Math.PI*2,armAxis:armAssignments[index]};
        // A dominant, recognizable nucleotide chain owns the opening shot.
        h.userData.primary=Math.abs(x)<.03&&Math.abs(y)<.09&&z>.50;
        this.dnaGroup.add(h);
        this.dnas.push(h);
      }
      // R2132: bind each arm to the closest authored DNA origin once,
      // rather than searching the helix array on every animation frame.
      this.birthStrands.forEach((line)=>{
        const axis=line.userData.axis;
        const candidates=this.dnas.filter(h=>{
          const b=h.userData.base;
          return b.armAxis===axis;
        });
        // R2183: the two opposing strands of ONE helix must share their
        // genetic root. The old lane-index choice spanned unrelated donor
        // helices with nucleotide bridges, producing impossible cross-frame
        // rungs instead of a coherent DNA chain during MAG assembly.
        candidates.sort((a,b)=>
          Math.hypot(a.userData.base.x,a.userData.base.y)-
          Math.hypot(b.userData.base.x,b.userData.base.y)
        );
        line.userData.source=candidates[0]||null;
      });
      // A broken arm source must never silently render a blank DNA transfer.
      if(this.birthStrands.some(line=>!line.userData.source)){
        throw new Error('Every MAG arm requires an actual DNA donor source');
      }
      for(let axis=0;axis<4;axis++){
        const pair=this.birthStrands.filter(line=>line.userData.axis===axis);
        if(pair.length!==2 || pair[0].userData.source!==pair[1].userData.source){
          throw new Error('A true double helix needs two strands from one donor');
        }
      }
    }

    makeGlowTexture(){
      const c=document.createElement('canvas');
      c.width=c.height=128;
      const x=c.getContext('2d');
      const g=x.createRadialGradient(64,64,0,64,64,64);
      g.addColorStop(0,'rgba(255,255,255,1)');
      g.addColorStop(.08,'rgba(176,250,255,.96)');
      g.addColorStop(.28,'rgba(67,225,255,.58)');
      g.addColorStop(.62,'rgba(72,99,255,.18)');
      g.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle=g;x.fillRect(0,0,128,128);
      const tex=new this.THREE.CanvasTexture(c);
      tex.colorSpace=this.THREE.SRGBColorSpace;
      return tex;
    }

    makeIrisTexture(){
      const c=document.createElement('canvas');
      c.width=c.height=256;
      const x=c.getContext('2d');
      x.translate(128,128);

      const halo=x.createRadialGradient(0,0,14,0,0,118);
      halo.addColorStop(0,'rgba(0,5,12,0)');
      halo.addColorStop(.18,'rgba(7,94,176,.18)');
      halo.addColorStop(.33,'rgba(28,198,255,.43)');
      halo.addColorStop(.48,'rgba(137,247,255,.27)');
      halo.addColorStop(.68,'rgba(26,112,224,.09)');
      halo.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle=halo;
      x.beginPath();x.arc(0,0,118,0,Math.PI*2);x.fill();

      x.globalCompositeOperation='lighter';
      for(let i=0;i<28;i++){
        const a=i/28*Math.PI*2;
        const inner=34+(i%4)*.55;
        const outer=50+((i*7)%13);
        const alpha=.020+((i*5)%9)/420;
        x.strokeStyle='rgba(118,232,238,'+alpha.toFixed(3)+')';
        x.lineWidth=i%7===0?.72:.42;
        x.beginPath();
        x.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);
        x.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);
        x.stroke();
      }

      x.globalCompositeOperation='source-over';
      const iris=x.createRadialGradient(0,0,12,0,0,63);
      iris.addColorStop(0,'rgba(0,3,8,1)');
      iris.addColorStop(.25,'rgba(0,8,17,.98)');
      iris.addColorStop(.37,'rgba(14,138,219,.62)');
      iris.addColorStop(.46,'rgba(48,208,255,.92)');
      iris.addColorStop(.54,'rgba(29,189,247,.58)');
      iris.addColorStop(.72,'rgba(7,72,150,.12)');
      iris.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle=iris;
      x.beginPath();x.arc(0,0,66,0,Math.PI*2);x.fill();

      const tex=new this.THREE.CanvasTexture(c);
      tex.colorSpace=this.THREE.SRGBColorSpace;
      return tex;
    }

    makeBurstTexture(){
      const c=document.createElement('canvas');
      c.width=c.height=256;
      const x=c.getContext('2d');
      x.clearRect(0,0,256,256);
      const g=x.createRadialGradient(128,128,0,128,128,118);
      g.addColorStop(0,'rgba(255,255,255,1)');
      g.addColorStop(.07,'rgba(202,254,255,.98)');
      g.addColorStop(.20,'rgba(79,229,255,.78)');
      g.addColorStop(.48,'rgba(48,156,255,.23)');
      g.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle=g;x.fillRect(0,0,256,256);
      x.save();
      x.translate(128,128);
      x.globalCompositeOperation='screen';
      for(let i=0;i<32;i++){
        const a=i/32*Math.PI*2;
        const len=58+(i%5)*10;
        const width=i%4===0?3.2:1.55;
        const grad=x.createLinearGradient(0,0,Math.cos(a)*len,Math.sin(a)*len);
        grad.addColorStop(0,'rgba(235,255,255,.90)');
        grad.addColorStop(.32,'rgba(95,236,255,.68)');
        grad.addColorStop(1,'rgba(76,174,255,0)');
        x.strokeStyle=grad;x.lineWidth=width;x.lineCap='round';
        x.beginPath();x.moveTo(Math.cos(a)*14,Math.sin(a)*14);
        x.lineTo(Math.cos(a)*len,Math.sin(a)*len);x.stroke();
      }
      x.restore();
      const tex=new this.THREE.CanvasTexture(c);
      tex.colorSpace=this.THREE.SRGBColorSpace;
      return tex;
    }

    makeCore(){
      const T=this.THREE;

      const shellMat=new T.MeshPhysicalMaterial({
        color:0x5d6d78,metalness:.82,roughness:.20,
        emissive:0x0d222d,emissiveIntensity:.12,
        clearcoat:.92,clearcoatRoughness:.075,
        specularIntensity:1.0,specularColor:new T.Color(0xe2f4f4),
        transparent:true,opacity:.96
      });
      const shellGlass=new T.MeshPhysicalMaterial({
        color:0x354b56,metalness:.20,roughness:.18,
        transparent:true,opacity:.08,depthWrite:false,
        emissive:0x0c3c48,emissiveIntensity:.09,
        clearcoat:.76,clearcoatRoughness:.12
      });
      const cyan=new T.MeshBasicMaterial({
        color:0x52dfff,transparent:true,opacity:.94,
        depthWrite:false,blending:T.AdditiveBlending
      });

      const shape=new T.Shape();
      shape.moveTo(.02,1.18);
      shape.bezierCurveTo(.13,1.00,.30,.78,.38,.58);
      shape.bezierCurveTo(.48,.40,.76,.26,.86,.07);
      shape.bezierCurveTo(.78,-.12,.55,-.29,.44,-.48);
      shape.bezierCurveTo(.34,-.68,.18,-.92,-.02,-1.10);
      shape.bezierCurveTo(-.20,-.94,-.38,-.70,-.48,-.50);
      shape.bezierCurveTo(-.58,-.30,-.80,-.13,-.87,.06);
      shape.bezierCurveTo(-.76,.27,-.50,.43,-.40,.61);
      shape.bezierCurveTo(-.28,.82,-.12,1.03,.02,1.18);

      const extrude=new T.ExtrudeGeometry(shape,{
        depth:.28,bevelEnabled:true,bevelSegments:4,steps:1,
        bevelSize:.065,bevelThickness:.070,curveSegments:20
      });
      extrude.center();

      this.coreShell=new T.Mesh(extrude,shellMat);
      this.coreShell.scale.set(1.00,.94,1.12);
      this.coreGroup.add(this.coreShell);

      this.corePetalMaterial=new T.MeshPhysicalMaterial({
        color:0x151d24,metalness:.70,roughness:.25,
        emissive:0x071a23,emissiveIntensity:.08,
        clearcoat:.42,clearcoatRoughness:.28,
        transparent:true,opacity:0
      });
      this.corePetals=[];
      const petalShape=new T.Shape();
      petalShape.moveTo(0,-.11);
      petalShape.bezierCurveTo(.17,.08,.43,.52,0,1.12);
      petalShape.bezierCurveTo(-.43,.52,-.17,.08,0,-.11);
      const petalGeo=new T.ExtrudeGeometry(petalShape,{
        depth:.14,bevelEnabled:true,bevelSegments:3,steps:1,
        bevelSize:.030,bevelThickness:.040,curveSegments:20
      });
      petalGeo.center();
      const petalDefs=[
        [0,.12,.16,0,.82,.80],
        [.12,0,.15,-Math.PI/2,.80,.82],
        [0,-.12,.15,Math.PI,.82,.80],
        [-.12,0,.15,Math.PI/2,.80,.82]
      ];
      for(const [x,y,z,rz,sx,sy] of petalDefs){
        const p=new T.Mesh(petalGeo,this.corePetalMaterial);
        p.position.set(x,y,z);p.rotation.z=rz;p.scale.set(sx,sy,.84);
        this.coreGroup.add(p);this.corePetals.push(p);
      }

      this.coreGlass=new T.Mesh(extrude,shellGlass);
      this.coreGlass.scale.set(.76,.72,.86);
      this.coreGlass.position.z=.13;
      this.coreGroup.add(this.coreGlass);

      this.coreContourMaterial=new T.MeshBasicMaterial({
        color:0x9bd8e5,transparent:true,opacity:.10,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.coreContours=[];
      for(const cfg of [
        [.86,.82,.98,.16,.04],
        [.72,.68,.94,.20,-.03]
      ]){
        const m=new T.Mesh(extrude,this.coreContourMaterial.clone());
        m.scale.set(cfg[0],cfg[1],cfg[2]);
        m.position.z=cfg[3];
        m.rotation.z=cfg[4];
        this.coreGroup.add(m);
        this.coreContours.push(m);
      }

      this.coreEdges=new T.LineSegments(
        new T.EdgesGeometry(extrude,18),
        new T.LineBasicMaterial({
          color:0xaef4ff,transparent:true,opacity:.34,
          depthWrite:false,blending:T.AdditiveBlending
        })
      );
      this.coreEdges.scale.copy(this.coreShell.scale);
      this.coreGroup.add(this.coreEdges);

      this.irisGroup=new T.Group();
      const diamondMat=new T.MeshBasicMaterial({
        color:0x102833,transparent:true,opacity:.30,
        side:T.DoubleSide,depthWrite:false
      });
      const diamond=new T.Mesh(new T.PlaneGeometry(.78,.78),diamondMat);
      diamond.rotation.z=Math.PI/4;
      diamond.position.z=-.02;
      this.irisGroup.add(diamond);

      const diamondEdge=new T.LineSegments(
        new T.EdgesGeometry(new T.PlaneGeometry(.82,.82)),
        new T.LineBasicMaterial({
          color:0x74d8e7,transparent:true,opacity:.14,
          depthWrite:false,blending:T.AdditiveBlending
        })
      );
      diamondEdge.rotation.z=Math.PI/4;diamondEdge.position.z=.01;
      this.irisGroup.add(diamondEdge);

      const ring1=new T.Mesh(new T.TorusGeometry(.142,.011,10,80),cyan.clone());
      ring1.material.opacity=.22;
      const ring2=new T.Mesh(new T.TorusGeometry(.222,.0055,8,80),cyan.clone());
      ring2.material.opacity=.07;
      const pupil=new T.Mesh(new T.CircleGeometry(.082,64),new T.MeshBasicMaterial({color:0x01090f,side:T.DoubleSide}));
      const pupilRing=new T.Mesh(new T.RingGeometry(.088,.118,72),cyan.clone());
      pupilRing.material.opacity=.24;
      this.irisGroup.add(ring2,ring1,pupil,pupilRing);

      const rayMat=new T.LineBasicMaterial({
        color:0x45d8ff,transparent:true,opacity:.012,
        depthWrite:false,blending:T.AdditiveBlending
      });
      const rays=[];
      for(let i=0;i<48;i++){
        const a=i/48*Math.PI*2;
        const inner=.132+(i%3)*.004;
        const outer=.235+(i%7)*.006;
        rays.push(
          Math.cos(a)*inner,Math.sin(a)*inner,.012,
          Math.cos(a)*outer,Math.sin(a)*outer,.012
        );
      }
      const rayGeo=new T.BufferGeometry();rayGeo.setAttribute('position',new T.Float32BufferAttribute(rays,3));
      this.irisRays=new T.LineSegments(rayGeo,rayMat);
      this.irisGroup.add(this.irisRays);

      this.irisCorona=new T.Sprite(new T.SpriteMaterial({
        map:this.makeIrisTexture(),
        color:0x78e8ff,
        transparent:true,
        opacity:.64,
        depthWrite:false,
        blending:T.AdditiveBlending
      }));
      this.irisCorona.scale.set(.76,.76,1);
      this.irisCorona.position.z=.024;
      this.irisGroup.add(this.irisCorona);

      this.irisGroup.position.z=.30;
      this.coreGroup.add(this.irisGroup);

      this.glowSprite=new T.Sprite(new T.SpriteMaterial({
        map:this.makeGlowTexture(),transparent:true,opacity:.82,
        blending:T.AdditiveBlending,depthWrite:false
      }));
      this.glowSprite.scale.set(2.10,2.10,1);
      this.glowSprite.position.z=.17;
      this.coreGroup.add(this.glowSprite);

      this.coreInner=new T.Mesh(new T.OctahedronGeometry(.17,1),new T.MeshBasicMaterial({
        color:0x35c4e6,transparent:true,opacity:.62,
        depthWrite:false,blending:T.AdditiveBlending
      }));
      this.coreInner.scale.set(.90,1.15,.55);
      this.coreInner.rotation.z=Math.PI/4;
      this.coreInner.position.z=.28;
      this.coreGroup.add(this.coreInner);

      this.flashBurst=new T.Sprite(new T.SpriteMaterial({
        map:this.makeBurstTexture(),transparent:true,opacity:0,
        blending:T.AdditiveBlending,depthWrite:false
      }));
      this.flashBurst.scale.set(3.6,3.6,1);
      this.flashBurst.position.z=.62;
      this.coreGroup.add(this.flashBurst);

      this.flashBeam=new T.Mesh(
        new T.PlaneGeometry(3.8,.020),
        new T.MeshBasicMaterial({
          color:0x7defff,transparent:true,opacity:0,
          depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide
        })
      );
      this.flashBeam.position.z=.58;
      this.coreGroup.add(this.flashBeam);

      const labelCanvas=document.createElement('canvas');
      labelCanvas.width=512;labelCanvas.height=128;
      const labelCtx=labelCanvas.getContext('2d');
      labelCtx.clearRect(0,0,512,128);
      labelCtx.textAlign='center';
      labelCtx.textBaseline='middle';
      labelCtx.font='500 54px Arial, sans-serif';
      labelCtx.strokeStyle='rgba(141,207,222,.22)';
      labelCtx.lineWidth=2;
      labelCtx.strokeText('FORMATX',256,64);
      labelCtx.fillStyle='rgba(120,172,187,.32)';
      labelCtx.fillText('FORMATX',256,64);
      const labelTexture=new T.CanvasTexture(labelCanvas);
      labelTexture.colorSpace=T.SRGBColorSpace;
      this.coreLabel=new T.Sprite(new T.SpriteMaterial({
        map:labelTexture,transparent:true,opacity:.28,depthWrite:false
      }));
      this.coreLabel.scale.set(.96,.24,1);
      this.coreLabel.position.set(0,-.05,.38);
      this.coreGroup.add(this.coreLabel);

      this.coreGroup.scale.setScalar(.001);
    }


    /* R1983 — physically readable microfibril relief.
       The grayscale texture is generated locally (no network asset) and feeds
       actual bump mapping on tissue and smoked bioglass. It is complemented by
       true LineSegments below so close-up silhouette hairs remain razor sharp. */
    makeMicroFiberTexture(){
      if(this.microFiberTexture)return this.microFiberTexture;
      const T=this.THREE;
      const size=this.mobileRender?256:512;
      const c=document.createElement('canvas');
      c.width=c.height=size;
      const x=c.getContext('2d',{alpha:false});
      x.fillStyle='rgb(118,118,118)';
      x.fillRect(0,0,size,size);
      let state=0x1983f1b7;
      const rnd=()=>{
        state=(Math.imul(state^state>>>15,1|state)+0x6D2B79F5)|0;
        let q=state^state>>>7;
        return ((q^q>>>14)>>>0)/4294967296;
      };
      const strands=this.mobileRender?420:1480;
      for(let i=0;i<strands;i++){
        const sx=rnd()*size;
        const sy=rnd()*size;
        const len=(.035+rnd()*.16)*size;
        const angle=(-.34+rnd()*.68)+(i%5===0?.72:0);
        const ex=sx+Math.cos(angle)*len;
        const ey=sy+Math.sin(angle)*len;
        const bend=(rnd()-.5)*len*.18;
        const cx=(sx+ex)*.5-Math.sin(angle)*bend;
        const cy=(sy+ey)*.5+Math.cos(angle)*bend;
        const raised=i%3!==0;
        const alpha=.15+rnd()*.26;
        const tone=raised?178+Math.floor(rnd()*36):66+Math.floor(rnd()*28);
        x.strokeStyle=`rgba(${tone},${tone},${tone},${alpha.toFixed(3)})`;
        x.lineWidth=this.mobileRender?.55:(.38+rnd()*.55);
        x.beginPath();
        x.moveTo(sx,sy);
        x.quadraticCurveTo(cx,cy,ex,ey);
        x.stroke();
      }
      const pores=this.mobileRender?150:520;
      for(let i=0;i<pores;i++){
        const px=rnd()*size,py=rnd()*size,r=.22+rnd()*.75;
        const tone=rnd()>.48?154:78;
        x.fillStyle=`rgba(${tone},${tone},${tone},${(.08+rnd()*.16).toFixed(3)})`;
        x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.fill();
      }
      const tex=new T.CanvasTexture(c);
      tex.wrapS=tex.wrapT=T.RepeatWrapping;
      tex.repeat.set(this.mobileRender?3.0:5.2,this.mobileRender?2.6:4.4);
      tex.minFilter=T.LinearMipmapLinearFilter;
      tex.magFilter=T.LinearFilter;
      tex.generateMipmaps=true;
      tex.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy?.()||1);
      if('NoColorSpace' in T)tex.colorSpace=T.NoColorSpace;
      this.microFiberTexture=tex;
      return tex;
    }

    makeGenomeParticles(){
      // R2159: GPU-interpolated living nucleotides: DNA -> condensation ->
      // cell nucleus -> four MAG arms. One Points draw call, no CPU per-frame
      // position uploads. No secondary renderer or costly framebuffer bloom.
      const T=this.THREE,r=this.rand;
      // R2167: film-grade DNA has 6k particles even on phones;
      // geometry is static and GPU morphs all particles in one draw call.
      const count=this.mobileRender?6000:9600;
      const initial=new Float32Array(count*3);
      const cell=new Float32Array(count*3);
      const arms=new Float32Array(count*3);
      const seed=new Float32Array(count);
      // R2184: carry a physically paired cyan/violet nucleotide pair
      // to ONE of the four titanium arms, rather than routing opposite
      // DNA strands to unrelated cardinal arms.
      const armIndex=new Float32Array(count);
      // R2176: a SINGLE founding DNA shape owns the opening shot. Previously
      // the 9,600 glowing nucleotides wound 7.75 turns while the visible
      // 3D helix wound 3.82; two mismatched objects overlapped on screen.
      // Sample the real parent helix, including its authored 3D transforms.
      const founding=this.dnas.find(h=>h.userData.primary);
      if(!founding)throw new Error('Genesis founding DNA helix is missing');
      // Keep nucleotide origins in the real helix's local coordinate system.
      // Baking its initial pose here made a second, drifting helix once the
      // photographed phosphate strands started moving in updateDNA().
      this.genomeFoundingHelix=founding;
      for(let i=0;i<count;i++){
        const u=Math.floor(i/2)/(count/2-1);
        const strand=i%2;
        const sign=strand===0?1:-1;
        const phase=u*Math.PI*2*3.82;
        // R2185: nucleotides must coincide with the wider real founding
        // 3D phosphate strands at every base-pair station.
        const helixRadius=.410+(r()-.5)*.013;
        const localX=(u-.5)*3.54;
        const localY=sign*Math.sin(phase)*helixRadius;
        const localZ=sign*Math.cos(phase)*helixRadius;
        initial.set([localX,localY,localZ],i*3);
        const a=r()*Math.PI*2,b=Math.acos(2*r()-1);
        // R2185: biological nucleotides settle mostly in the envelope,
        // with a smaller organelle interior rather than a noisy solid ball.
        // Both distributions use the same cell centre and an ellipsoid skin.
        const membrane=i%4!==0;
        const radius=membrane?.77+(r()-.5)*.13:.14+Math.cbrt(r())*.56;
        // R2192: the biological target must occupy the SAME 3D volume as
        // coreGroup's visible embryo, which is raised to z=1.10 during birth.
        // Previously the genome condensed at z=.20, nearly a full world unit
        // behind the cell membrane: a dissolve/crossfade, not a genuine morph.
        // Slightly reduce the cloud envelope to fit the nonuniform glass shell.
        cell.set([
          radius*.82*Math.sin(b)*Math.cos(a),
          radius*.94*Math.cos(b),
          1.10+radius*.65*Math.sin(b)*Math.sin(a)
        ],i*3);
        // Both nucleotides at one base-pair station share one arm destination.
        // The old i%4 tied cyan to N/S and violet to E/W: not a double helix.
        const axis=Math.floor(i/2)%4,phi=axis*Math.PI*.5;
        const reach=.20+.74*r();
        // R2195: paired DNA matter seats in narrow metallic arm channels.
        const lateral=(r()-.5)*.088;
        // R2192: molecular matter seats above the actual titanium front
        // (typically z=.38-.48), rather than vanishing behind opaque armour.
        arms.set([
          Math.cos(phi)*reach-Math.sin(phi)*lateral,
          Math.sin(phi)*reach+Math.cos(phi)*lateral,
          .62+(r()-.5)*.11
        ],i*3);
        armIndex[i]=axis;
        // Cyan strand A, violet strand B: one identifiable double helix.
        seed[i]=strand===0?r()*.42:.58+r()*.42;
      }
      const geometry=new T.BufferGeometry();
      geometry.setAttribute('position',new T.BufferAttribute(initial,3));
      geometry.setAttribute('aCell',new T.BufferAttribute(cell,3));
      geometry.setAttribute('aArm',new T.BufferAttribute(arms,3));
      geometry.setAttribute('aSeed',new T.BufferAttribute(seed,1));
      geometry.setAttribute('aArmIndex',new T.BufferAttribute(armIndex,1));
      const material=new T.ShaderMaterial({
        uniforms:{uTime:{value:0},uPhase:{value:0},uPixelRatio:{value:1},
          uDnaMatrix:{value:new T.Matrix4()}},
        transparent:true,depthWrite:false,depthTest:true,
        blending:T.AdditiveBlending,
        vertexShader:`
          attribute vec3 aCell;
          attribute vec3 aArm;
          attribute float aSeed;
          attribute float aArmIndex;
          uniform float uTime,uPhase,uPixelRatio;
          uniform mat4 uDnaMatrix;
          varying float vSeed,vEnergy,vCellFocus;
          float curve(float a,float b,float x){
            float t=clamp((x-a)/(b-a),0.0,1.0);
            return t*t*(3.0-2.0*t);
          }
          void main(){
            float condense=curve(2.94,4.38,uPhase);
            // R2184: the four paired DNA streams seat at slightly offset
            // beats. The final south/west feed reaches its titanium arm
            // BEFORE the mechanical optic wakes at 7.44 seconds.
            float armBeat=aArmIndex*.11;
            float assemble=curve(5.34+armBeat,6.90+armBeat,uPhase);
            vec3 dna=(uDnaMatrix*vec4(position,1.0)).xyz;
            vec3 p=mix(dna,aCell,condense);
            p=mix(p,aArm,assemble);
            // Physically curl the genetic matter toward its destination,
            // with zero residual motion at either endpoint of the morph.
            float curlEnvelope=assemble*(1.0-assemble);
            vec2 radial=normalize(aArm.xy+vec2(.0001,.0001));
            vec2 tangent=vec2(-radial.y,radial.x);
            float curlAngle=aSeed*31.4159+uTime*.0012;
            p.xy+=tangent*(sin(curlAngle)*.19*curlEnvelope);
            p.z+=cos(curlAngle)*.16*curlEnvelope;
            float coil=1.0-curve(2.94,4.38,uPhase);
            p.x+=coil*.018*sin(uTime*.00082+aSeed*32.0);
            p.y+=.013*sin(uTime*.0011+aSeed*20.0)*(1.0-assemble);
            p.z+=.012*cos(uTime*.00072+aSeed*17.0);
            vec4 mv=modelViewMatrix*vec4(p,1.0);
            gl_Position=projectionMatrix*mv;
            // R2186: the genetic matter becomes a visible energetic stream
            // only while the metal is physically closing around it.
            float transferGlow=curve(5.50,6.05,uPhase)*(1.0-curve(7.02,7.38,uPhase));
            gl_PointSize=clamp((aSeed*.76+1.02)*uPixelRatio*11.6/(-mv.z)*(1.0+transferGlow*.16),1.0,5.6*uPixelRatio);
            float first=curve(0.08,.65,uPhase);
            // R2192: all genetic matter departs BEFORE the optical organ
            // starts igniting at 7.44 s; no ghost DNA over the born MAG.
            float last=1.0-curve(6.96,7.44,uPhase);
            vEnergy=first*last*(1.0+transferGlow*.16);
            vCellFocus=condense*(1.0-assemble);
            vSeed=aSeed;
          }`,
        fragmentShader:`
          precision mediump float;
          varying float vSeed,vEnergy,vCellFocus;
          void main(){
            vec2 p=gl_PointCoord-.5;
            float r=dot(p,p);
            if(r>.25)discard;
            float glow=exp(-r*15.0);
            float center=exp(-r*53.0);
            vec3 cool=mix(vec3(.14,.68,.75),vec3(.62,.34,.90),smoothstep(.46,.54,vSeed));
            // The cell chapter stays in the reference's cyan/teal family.
            // Warm depth comes from sparse physical organelles, not thousands
            // of orange genome points that obscure the nucleus silhouette.
            vec3 cellular=mix(vec3(.08,.60,.56),vec3(.18,.78,.72),smoothstep(.56,.94,vSeed));
            vec3 color=mix(cool,cellular,vCellFocus)*glow*.70+vec3(.75,1.0,.98)*center*.32;
            gl_FragColor=vec4(color,vEnergy*mix(.34,.58,vSeed)*(1.0-smoothstep(.04,.25,r)));
          }`
      });
      this.genomeParticles=new T.Points(geometry,material);
      this.genomeParticles.frustumCulled=false;
      this.world.add(this.genomeParticles);
      this.genomeParticleMaterial=material;
    }

    makeEmbryoFilm(){
      // R2159: the pre-mechanical nucleus is an irregular organic cell,
      // not the old metallic diamond with an illuminated MAG eye.
      const T=this.THREE;
      this.coreGroup.children.forEach(part=>{part.visible=false;});
      const geometry=new T.SphereGeometry(.98,this.mobileRender?28:42,this.mobileRender?20:30);
      const positions=geometry.attributes.position;
      for(let i=0;i<positions.count;i++){
        const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
        const phi=Math.atan2(z,x);
        const envelope=1+.045*Math.sin(phi*5.0+y*4.2)+.024*Math.cos(phi*3.0-y*7.1);
        positions.setXYZ(i,x*envelope,y*(1+.024*Math.cos(phi*4.0))*envelope,z*envelope);
      }
      positions.needsUpdate=true;geometry.computeVertexNormals();
      this.embryoMaterial=new T.MeshPhysicalMaterial({
        color:0x2b7881,emissive:0x0a3f48,emissiveIntensity:.32,
        metalness:.01,roughness:.31,clearcoat:.42,clearcoatRoughness:.31,
        transmission:.15,thickness:.27,ior:1.35,
        bumpMap:this.bioticSurfaceTexture,bumpScale:.012,
        roughnessMap:this.bioticSurfaceTexture,
        transparent:true,opacity:0,depthWrite:false
      });
      this.embryoShell=new T.Mesh(geometry,this.embryoMaterial);
      this.embryoShell.scale.set(.88,1.12,.78);
      this.coreGroup.add(this.embryoShell);
      // R2189: no flat 2D turquoise button inside the embryo. The genetic
      // nucleus is a physically shaded translucent organelle with an actual
      // clear-coated lens, lit by the same three-dimensional studio rig.
      this.embryoNucleusMaterial=new T.MeshPhysicalMaterial({
        color:0x23818d,emissive:0x126879,emissiveIntensity:.34,
        metalness:.005,roughness:.38,transmission:.12,thickness:.28,ior:1.35,
        clearcoat:.32,clearcoatRoughness:.36,
        bumpMap:this.bioticSurfaceTexture,bumpScale:.018,
        roughnessMap:this.bioticSurfaceTexture,
        transparent:true,opacity:0,depthWrite:false
      });
      this.embryoNucleus=new T.Mesh(
        new T.SphereGeometry(.25,32,24),this.embryoNucleusMaterial
      );
      this.embryoNucleus.position.set(-.10,.06,.37);
      this.coreGroup.add(this.embryoNucleus);
      // R2167 — nucleus organelle and continuous curved membrane networks.
      // These sit at genuinely different z depths inside the cell; they
      // remain biological and are removed before metallic chassis birth.
      this.embryoInnerMaterial=new T.MeshPhysicalMaterial({
        color:0x376b77,emissive:0x16414b,emissiveIntensity:.17,
        metalness:0,roughness:.40,clearcoat:.24,clearcoatRoughness:.42,
        transmission:.10,thickness:.18,
        bumpMap:this.bioticSurfaceTexture,bumpScale:.015,
        roughnessMap:this.bioticSurfaceTexture,
        transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide
      });
      this.embryoOrganelle=new T.Mesh(
        new T.IcosahedronGeometry(.40,3),this.embryoInnerMaterial
      );
      this.embryoOrganelle.position.set(-.045,.032,.17);
      this.embryoOrganelle.scale.set(1.0,.82,.67);
      this.coreGroup.add(this.embryoOrganelle);
      // Sparse warm organelle sites occupy real, different depths inside the
      // turquoise cell. One instanced draw call replaces the previous flat,
      // homogeneous centre without turning the cell into particle noise.
      const organelleCount=this.mobileRender?20:28;
      const organelleGeometry=new T.IcosahedronGeometry(.016,1);
      this.embryoSiteMaterial=new T.MeshPhysicalMaterial({
        color:0xff9a72,emissive:0xff3d1f,emissiveIntensity:.82,
        metalness:0,roughness:.54,clearcoat:.16,clearcoatRoughness:.48,
        transparent:true,opacity:0,depthWrite:false
      });
      this.embryoSites=new T.InstancedMesh(
        organelleGeometry,this.embryoSiteMaterial,organelleCount
      );
      const siteRand=seeded(0x2192ce11),siteDummy=new T.Object3D();
      const coral=new T.Color(0xff775c),amber=new T.Color(0xffc36b);
      for(let i=0;i<organelleCount;i++){
        const a=siteRand()*Math.PI*2,b=Math.acos(2*siteRand()-1);
        const rr=.22+Math.cbrt(siteRand())*.48;
        siteDummy.position.set(
          Math.sin(b)*Math.cos(a)*rr*.82,
          Math.cos(b)*rr*.92,
          .20+Math.sin(b)*Math.sin(a)*rr*.58
        );
        const siteScale=.48+siteRand()*.72;
        siteDummy.scale.setScalar(siteScale);
        siteDummy.rotation.set(siteRand()*2.4,siteRand()*2.4,siteRand()*2.4);
        siteDummy.updateMatrix();
        this.embryoSites.setMatrixAt(i,siteDummy.matrix);
        this.embryoSites.setColorAt(i,coral.clone().lerp(amber,siteRand()));
      }
      this.embryoSites.instanceMatrix.needsUpdate=true;
      if(this.embryoSites.instanceColor)this.embryoSites.instanceColor.needsUpdate=true;
      this.embryoSites.renderOrder=3;
      this.coreGroup.add(this.embryoSites);
      const membraneLines=[];
      const capillaries=this.mobileRender?5:9;
      for(let strand=0;strand<capillaries;strand++){
        const phase=strand*Math.PI*2/capillaries;
        const shift=(strand%3-1)*.065;
        for(let segment=0;segment<46;segment++){
          for(let k=0;k<2;k++){
            const u=(segment+k)/46;
            const a=u*Math.PI*2+phase;
            const radial=.64+.085*Math.sin(a*3.0+phase*2.0);
            membraneLines.push(
              radial*Math.cos(a)*.92+shift,
              radial*Math.sin(a)*1.07,
              Math.sin(a*1.8+phase)*.26+.29
            );
          }
        }
      }
      const membranes=new T.BufferGeometry();
      membranes.setAttribute('position',new T.Float32BufferAttribute(membraneLines,3));
      this.embryoCapillaryMaterial=new T.LineBasicMaterial({
        color:0x86c6c5,transparent:true,opacity:0,
        depthWrite:false,blending:T.NormalBlending
      });
      this.embryoCapillaries=new T.LineSegments(membranes,this.embryoCapillaryMaterial);
      this.coreGroup.add(this.embryoCapillaries);

      // R2189: chromatin is a family of genuinely volumetric curved fibres
      // suspended BETWEEN membrane and nucleus. One GPU line batch, not a
      // texture painted onto the glass shell; adaptive strand count on phones.
      const chromatinPositions=[],chromatinColors=[];
      const chromatinCount=this.mobileRender?10:17;
      const cool=new T.Color(0x83f1e8),violet=new T.Color(0xb7a6e9);
      for(let strand=0;strand<chromatinCount;strand++){
        const phase=strand*Math.PI*2/chromatinCount;
        const hue=cool.clone().lerp(violet,strand/(chromatinCount-1));
        const points=[];
        for(let k=0;k<=60;k++){
          const u=k/60,turn=u*Math.PI*2.5+phase;
          const radius=.32+.26*Math.sin(u*Math.PI)+.048*Math.sin(6*turn+phase);
          points.push([
            Math.cos(turn)*radius*.90,
            Math.sin(turn)*radius*1.10,
            .18+.30*Math.sin(turn*.75+phase)*Math.sin(u*Math.PI)
          ]);
        }
        for(let k=0;k<60;k++){
          chromatinPositions.push(...points[k],...points[k+1]);
          for(let e=0;e<2;e++)chromatinColors.push(hue.r,hue.g,hue.b);
        }
      }
      const chromatinGeometry=new T.BufferGeometry();
      chromatinGeometry.setAttribute('position',
        new T.Float32BufferAttribute(chromatinPositions,3));
      chromatinGeometry.setAttribute('color',
        new T.Float32BufferAttribute(chromatinColors,3));
      this.embryoChromatinMaterial=new T.LineBasicMaterial({
        vertexColors:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.NormalBlending
      });
      this.embryoChromatin=new T.LineSegments(chromatinGeometry,this.embryoChromatinMaterial);
      this.embryoChromatin.renderOrder=4;
      this.coreGroup.add(this.embryoChromatin);
      this.embryoChromatin.scale.set(1,1,.95);
    }

    updateGenomeParticles(t,time){
      if(!this.genomeParticles)return;
      const visible=t>.08&&t<8.05;
      this.genomeParticles.visible=visible;
      if(!visible)return;
      // A single 4x4 uniform follows the ACTUAL animated mesh pose. The
      // particle buffers remain static; cell/arm targets stay in world space.
      this.genomeFoundingHelix.updateMatrix();
      this.genomeParticleMaterial.uniforms.uDnaMatrix.value.copy(this.genomeFoundingHelix.matrix);
      this.genomeParticleMaterial.uniforms.uTime.value=time;
      this.genomeParticleMaterial.uniforms.uPhase.value=t;
      this.genomeParticleMaterial.uniforms.uPixelRatio.value=Math.min(
        this.mobileRender?1.6:2.0,this.renderer.getPixelRatio()
      );
    }

    makeOrganicLayer(){
      const T=this.THREE,r=this.rand;
      const microFiberTexture=this.makeMicroFiberTexture();

      this.organicShellMaterial=new T.MeshPhysicalMaterial({
        color:0x160d20,roughness:.66,metalness:.010,
        clearcoat:.11,clearcoatRoughness:.54,
        bumpMap:microFiberTexture,bumpScale:.036,
        transparent:true,opacity:0,
        emissive:0x1c0b29,emissiveIntensity:.18,
        depthWrite:true
      });
      this.organicLobeMaterial=new T.MeshPhysicalMaterial({
        color:0x25162e,roughness:.70,metalness:.006,
        clearcoat:.08,clearcoatRoughness:.62,
        bumpMap:microFiberTexture,bumpScale:.031,
        transparent:true,opacity:0,
        emissive:0x170a22,emissiveIntensity:.10,
        depthWrite:true
      });
      this.organicWireMaterial=new T.MeshBasicMaterial({
        color:0x67ddea,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });

      const shell=new T.Mesh(new T.IcosahedronGeometry(1.38,4),this.organicShellMaterial);
      shell.scale.set(1.00,1.03,.78);
      this.organicShell=shell;
      this.organicGroup.add(shell);

      this.organicLobes=[];
      const lobeGeo=new T.IcosahedronGeometry(.275,3);
      const count=42;
      for(let i=0;i<count;i++){
        const phi=Math.acos(1-2*(i+.5)/count);
        const theta=Math.PI*(1+Math.sqrt(5))*i;
        const rr=1.25+(r()-.5)*.17;
        const lobe=new T.Mesh(lobeGeo,this.organicLobeMaterial);
        lobe.position.set(
          Math.sin(phi)*Math.cos(theta)*rr,
          Math.cos(phi)*rr,
          Math.sin(phi)*Math.sin(theta)*rr*.71
        );
        const k=.70+r()*.24;
        lobe.scale.set(
          k*(.76+r()*.24),
          k*(1.02+r()*.30),
          k*(.78+r()*.22)
        );
        lobe.rotation.set(r()*2.4,r()*2.4,r()*2.4);
        lobe.userData.phase=r()*Math.PI*2;
        lobe.userData.baseScale=lobe.scale.clone();
        this.organicGroup.add(lobe);
        this.organicLobes.push(lobe);
      }

      this.organicFoldMaterial=new T.MeshPhysicalMaterial({
        color:0x36283d,roughness:.68,metalness:.004,
        emissive:0x140b1b,emissiveIntensity:.038,
        bumpMap:microFiberTexture,bumpScale:.019,
        transparent:true,opacity:0,depthWrite:true
      });
      this.organicFoldGlowMaterial=new T.MeshBasicMaterial({
        color:0x4aa9b8,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.organicFolds=new T.Group();

      const frontRadius=1.355;
      for(let i=0;i<74;i++){
        let cx=(r()-.5)*2.05;
        let cy=(r()-.5)*2.05;
        const d=Math.hypot(cx,cy);
        if(d>1.12){
          const k=1.12/d;cx*=k;cy*=k;
        }
        const angle=r()*Math.PI;
        const half=.19+r()*.20;
        const phase=r()*Math.PI*2;
        const pts=[];
        for(let j=0;j<9;j++){
          const u=j/8;
          const along=(u-.5)*2*half;
          const wiggle=Math.sin(u*Math.PI*2.1+phase)*(.035+r()*.025)
            +Math.sin(u*Math.PI*4.2+phase*.7)*.012;
          const x=cx+Math.cos(angle)*along-Math.sin(angle)*wiggle;
          const y=cy+Math.sin(angle)*along+Math.cos(angle)*wiggle;
          const rr2=x*x+y*y;
          if(rr2>frontRadius*frontRadius*.96)continue;
          const z=Math.sqrt(Math.max(.018,frontRadius*frontRadius-rr2))*.765+.065;
          pts.push(new T.Vector3(x,y,z));
        }
        if(pts.length<5)continue;
        const curve=new T.CatmullRomCurve3(pts,false,'centripetal');
        const radius=.047+r()*.020;
        const fold=new T.Mesh(
          new T.TubeGeometry(curve,34,radius,8,false),
          this.organicFoldMaterial
        );
        const glow=new T.Mesh(
          new T.TubeGeometry(curve,32,.0050+r()*.0016,5,false),
          this.organicFoldGlowMaterial
        );
        fold.userData.phase=phase;
        glow.userData.phase=phase;
        this.organicFolds.add(fold,glow);
      }
      this.organicGroup.add(this.organicFolds);;;

      this.organicVeinMaterial=new T.MeshBasicMaterial({
        color:0x67c9db,transparent:true,opacity:0,
        depthWrite:false,depthTest:true,blending:T.AdditiveBlending
      });
      this.organicVeins=[];
      const surfacePoint=(a,p,rr=1.385)=>new T.Vector3(
        Math.sin(p)*Math.sin(a)*rr,
        Math.cos(p)*rr,
        Math.sin(p)*Math.cos(a)*rr*.735+.055
      );
      for(let i=0;i<46;i++){
        const a0=(i/46)*Math.PI*2+(r()-.5)*.16;
        const p0=.34+r()*2.38;
        const da=(r()>.5?1:-1)*(.22+r()*.52);
        const dp=(r()-.5)*(.46+r()*.28);
        const a1=a0+da;
        const p1=Math.max(.20,Math.min(2.94,p0+dp));
        const start=surfacePoint(a0,p0,1.392);
        const end=surfacePoint(a1,p1,1.392);
        const mid=start.clone().lerp(end,.50);
        const normal=mid.clone();
        normal.z=(normal.z-.055)/.735;
        normal.normalize();
        mid.addScaledVector(normal,.12+r()*.07);
        mid.x+=(r()-.5)*.08;
        mid.y+=(r()-.5)*.08;
        const curve=new T.QuadraticBezierCurve3(start,mid,end);
        const vein=new T.Mesh(
          new T.TubeGeometry(curve,32,.015+r()*.005,7,false),
          this.organicVeinMaterial
        );
        vein.userData.phase=r()*Math.PI*2;
        this.organicGroup.add(vein);
        this.organicVeins.push(vein);

        if(i%5===0){
          const branchEnd=surfacePoint(
            a1+(r()-.5)*.34,
            Math.max(.20,Math.min(2.94,p1+(r()-.5)*.32)),
            1.394
          );
          const bmid=end.clone().lerp(branchEnd,.50);
          const bn=bmid.clone();
          bn.z=(bn.z-.055)/.735;
          bn.normalize();
          bmid.addScaledVector(bn,.09+r()*.05);
          const branch=new T.Mesh(
            new T.TubeGeometry(new T.QuadraticBezierCurve3(end,bmid,branchEnd),20,.008+r()*.0025,6,false),
            this.organicVeinMaterial
          );
          branch.userData.phase=r()*Math.PI*2;
          this.organicGroup.add(branch);
          this.organicVeins.push(branch);
        }
      }

      this.organicPrimaryVeinMaterial=new T.MeshBasicMaterial({
        color:0x315763,transparent:true,opacity:0,
        depthWrite:false,depthTest:true,blending:T.AdditiveBlending
      });
      this.organicPrimaryVeins=[];
      for(let i=0;i<12;i++){
        const a=i/12*Math.PI*2+(r()-.5)*.18;
        const inner=.34+r()*.08;
        const outer=.78+r()*.28;
        const start=new T.Vector3(
          Math.cos(a)*inner,
          Math.sin(a)*inner,
          1.05+(r()-.5)*.04
        );
        const endA=a+(r()-.5)*.34;
        const ex=Math.cos(endA)*outer;
        const ey=Math.sin(endA)*outer;
        const ez=Math.sqrt(Math.max(.04,1.35*1.35-outer*outer))*.54+.10;
        const end=new T.Vector3(ex,ey,ez);
        const bendA=a+(r()-.5)*.46;
        const bendR=(inner+outer)*.52;
        const bend=new T.Vector3(
          Math.cos(bendA)*bendR,
          Math.sin(bendA)*bendR,
          .96+(r()-.5)*.10
        );
        const curve=new T.QuadraticBezierCurve3(start,bend,end);
        const branch=new T.Mesh(
          new T.TubeGeometry(curve,26,.0045+r()*.0018,5,false),
          this.organicPrimaryVeinMaterial
        );
        branch.userData.phase=r()*Math.PI*2;
        this.organicGroup.add(branch);
        this.organicPrimaryVeins.push(branch);
      }

      this.organicHoodMaterial=new T.MeshPhysicalMaterial({
        color:0x241829,
        roughness:.68,
        metalness:.035,
        clearcoat:.12,
        clearcoatRoughness:.52,
        transparent:true,
        opacity:0,
        emissive:0x180b21,
        emissiveIntensity:.14,
        side:T.DoubleSide
      });
      this.organicHoodGroup=new T.Group();

      const membraneShape=new T.Shape();
      membraneShape.moveTo(0,.98);
      membraneShape.bezierCurveTo(.12,.76,.28,.46,.38,.18);
      membraneShape.bezierCurveTo(.46,-.04,.34,-.22,.18,-.42);
      membraneShape.bezierCurveTo(.08,-.54,.02,-.60,0,-.64);
      membraneShape.bezierCurveTo(-.02,-.60,-.08,-.54,-.18,-.42);
      membraneShape.bezierCurveTo(-.34,-.22,-.46,-.04,-.38,.18);
      membraneShape.bezierCurveTo(-.28,.46,-.12,.76,0,.98);
      const membraneGeo=new T.ExtrudeGeometry(membraneShape,{
        depth:.10,bevelEnabled:true,bevelSegments:3,steps:1,
        bevelSize:.026,bevelThickness:.032,curveSegments:20
      });
      membraneGeo.center();

      const hoodDefs=[
        [-.20,.55,1.04,.38,.54,.54,-.14,.12],
        [.20,.55,1.04,.38,.54,.54,.14,-.12],
        [0,.70,1.01,.22,.34,.46,0,0]
      ];
      for(const [x,y,z,sx,sy,sz,rz,ry] of hoodDefs){
        const m=new T.Mesh(membraneGeo,this.organicHoodMaterial);
        m.position.set(x,y,z);
        m.scale.set(sx,sy,sz);
        m.rotation.set(-.12,ry,rz);
        this.organicHoodGroup.add(m);
      }
      this.organicGroup.add(this.organicHoodGroup);

      /* R1983 — real hair-thin surface fibrils.
         Every strand is two connected 3D line segments grown from the ellipsoid
         normal, with a small deterministic tangent curl. The line stays a native
         one-device-pixel primitive, so individual strands remain sharp instead
         of becoming a blurred alpha texture. */
      this.organicFiberMaterial=new T.LineBasicMaterial({
        color:0xb8c7bf,
        transparent:true,
        opacity:0,
        depthWrite:false,
        depthTest:true,
        blending:T.NormalBlending,
        toneMapped:true
      });
      const fiberPositions=[];
      const fiberCount=this.mobileRender?168:560;
      let fiberState=0x1983a17d;
      const fiberRnd=()=>{
        fiberState=(Math.imul(fiberState^fiberState>>>16,2246822507)+3266489909)|0;
        return ((fiberState^fiberState>>>13)>>>0)/4294967296;
      };
      const golden=2.399963229728653;
      const rx=1.385,ry=1.425,rz=1.075;
      for(let i=0;i<fiberCount;i++){
        const y=1-2*(i+.5)/fiberCount;
        const phi=Math.acos(Math.max(-1,Math.min(1,y)));
        const theta=i*golden+(fiberRnd()-.5)*.20;
        const sp=Math.sin(phi),cp=Math.cos(phi),ct=Math.cos(theta),st=Math.sin(theta);
        const base=new T.Vector3(sp*ct*rx,cp*ry,sp*st*rz);
        const normal=new T.Vector3(base.x/(rx*rx),base.y/(ry*ry),base.z/(rz*rz)).normalize();
        const tangent=new T.Vector3(-st,0,ct).normalize();
        const binormal=new T.Vector3().crossVectors(normal,tangent).normalize();
        const len=(this.mobileRender?.016:.022)+fiberRnd()*(this.mobileRender?.024:.040);
        const curlT=(fiberRnd()-.5)*(this.mobileRender?.010:.016);
        const curlB=(fiberRnd()-.5)*(this.mobileRender?.008:.013);
        const root=base.clone().addScaledVector(normal,.0045);
        const mid=root.clone()
          .addScaledVector(normal,len*.52)
          .addScaledVector(tangent,curlT*.42)
          .addScaledVector(binormal,curlB*.32);
        const tip=root.clone()
          .addScaledVector(normal,len)
          .addScaledVector(tangent,curlT)
          .addScaledVector(binormal,curlB);
        fiberPositions.push(
          root.x,root.y,root.z,mid.x,mid.y,mid.z,
          mid.x,mid.y,mid.z,tip.x,tip.y,tip.z
        );
      }
      const fiberGeometry=new T.BufferGeometry();
      fiberGeometry.setAttribute('position',new T.Float32BufferAttribute(fiberPositions,3));
      this.organicFibers=new T.LineSegments(fiberGeometry,this.organicFiberMaterial);
      this.organicFibers.renderOrder=5;
      this.organicFibers.frustumCulled=false;
      this.organicGroup.add(this.organicFibers);
      document.documentElement.dataset.fxMagBirthMicrofibrilsR1983=`${fiberCount}-native-line-fibrils-plus-physical-bump`;

      this.organicGroup.scale.setScalar(.001);
    }

    makeCellularLayer(){
      const T=this.THREE,r=this.rand;
      this.cellMaterial=new T.MeshStandardMaterial({
        color:0x180d24,roughness:.76,metalness:.02,
        emissive:0x1d0c2c,emissiveIntensity:.22,
        transparent:true,opacity:0
      });
      this.cellEdgeMaterial=new T.MeshBasicMaterial({
        color:0x65cbdc,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      const blobGeo=new T.IcosahedronGeometry(.090,2);
      const edgeGeo=new T.IcosahedronGeometry(.093,1);
      this.cells=[];
      const count=68;
      for(let i=0;i<count;i++){
        const phi=Math.acos(1-2*(i+.5)/count);
        const theta=Math.PI*(1+Math.sqrt(5))*i;
        const rr=1.34+(r()-.5)*.13;
        const g=new T.Group();
        const b=new T.Mesh(blobGeo,this.cellMaterial);
        const e=new T.Mesh(edgeGeo,this.cellEdgeMaterial);
        g.add(b,e);
        g.position.set(
          Math.sin(phi)*Math.cos(theta)*rr,
          Math.cos(phi)*rr,
          Math.sin(phi)*Math.sin(theta)*rr*.70
        );
        const sc=.70+r()*.30;
        const sx=sc*(.48+r()*.28);
        const sy=sc*(1.05+r()*.46);
        const sz=sc*(.54+r()*.28);
        g.scale.set(sx,sy,sz);
        g.rotation.set(r()*2.8,r()*2.8,r()*2.8);
        g.userData.phase=r()*Math.PI*2;
        g.userData.baseScale=g.scale.clone();
        this.cellGroup.add(g);this.cells.push(g);
      }
      this.cellVeinMaterial=new T.LineBasicMaterial({
        color:0x83edff,transparent:true,opacity:0,
        blending:T.AdditiveBlending,depthWrite:false
      });
      this.cellVeins=[];
      for(let i=0;i<38;i++){
        const a=this.cells[(i*11)%this.cells.length];
        const b=this.cells[(i*11+7+(i%5))%this.cells.length];
        const start=a.position.clone();
        const end=b.position.clone();
        if(start.distanceTo(end)>1.38){ continue; }
        const mid=start.clone().lerp(end,.5);
        const outward=mid.clone().normalize().multiplyScalar(.08+(i%4)*.012);
        mid.add(outward);
        const curve=new T.QuadraticBezierCurve3(start,mid,end);
        const line=new T.Line(
          new T.BufferGeometry().setFromPoints(curve.getPoints(16)),
          this.cellVeinMaterial
        );
        line.userData.phase=r()*Math.PI*2;
        this.cellGroup.add(line);
        this.cellVeins.push(line);
      }
      this.cellGroup.scale.setScalar(.001);
    }

    makeMechanicalLayer(){
      const T=this.THREE;

      /* R1945g — intro finale material converges into the permanent Signature MAG:
         neutral smoked-silver bioglass, internal ice facets and recessed optic. */
      this.mechMaterial=new T.MeshPhysicalMaterial({
        color:0x17262c,metalness:.58,roughness:.23,
        transmission:.055,thickness:.42,ior:1.45,
        emissive:0x041216,emissiveIntensity:.018,
        clearcoat:.98,clearcoatRoughness:.065,
        bumpMap:this.microFiberTexture,bumpScale:.013,
        transparent:true,opacity:0
      });
      this.mechMidMaterial=new T.MeshPhysicalMaterial({
        color:0x233940,metalness:.48,roughness:.20,
        transmission:.075,thickness:.32,ior:1.46,
        emissive:0x04191d,emissiveIntensity:.020,
        clearcoat:.98,clearcoatRoughness:.060,
        bumpMap:this.microFiberTexture,bumpScale:.010,
        transparent:true,opacity:0
      });
      this.silverMaterial=new T.MeshPhysicalMaterial({
        color:0xb8c8c6,metalness:.78,roughness:.16,
        transmission:.025,thickness:.22,ior:1.42,
        emissive:0x0a252b,emissiveIntensity:.012,
        clearcoat:1.0,clearcoatRoughness:.042,
        specularIntensity:1.0,specularColor:new T.Color(0xe8f6f4),
        bumpMap:this.microFiberTexture,bumpScale:.004,
        transparent:true,opacity:0
      });
      this.mechEdgeMaterial=new T.LineBasicMaterial({
        color:0x9fe7e7,transparent:true,opacity:0,
        blending:T.AdditiveBlending,depthWrite:false
      });

      this.plates=[];
      this.silverParts=[];
      this.mechBodyParts=[];

      // R1941 Signature body: four authored points with recessed curved valleys.
      const baseShape=new T.Shape();
      baseShape.moveTo(0,1.08);
      baseShape.bezierCurveTo(.08,.76,.17,.42,.24,.25);
      baseShape.bezierCurveTo(.43,.18,.74,.08,.99,0);
      baseShape.bezierCurveTo(.72,-.08,.42,-.18,.23,-.26);
      baseShape.bezierCurveTo(.16,-.45,.08,-.78,0,-1.03);
      baseShape.bezierCurveTo(-.08,-.78,-.16,-.45,-.23,-.26);
      baseShape.bezierCurveTo(-.42,-.18,-.72,-.08,-.99,0);
      baseShape.bezierCurveTo(-.74,.08,-.43,.18,-.24,.25);
      baseShape.bezierCurveTo(-.17,.42,-.08,.76,0,1.08);
      const baseGeo=new T.ExtrudeGeometry(baseShape,{
        depth:.40,bevelEnabled:true,bevelSegments:6,steps:1,
        bevelSize:.060,bevelThickness:.078,curveSegments:28
      });
      baseGeo.center();
      this.mechBody=new T.Mesh(baseGeo,this.mechMaterial);
      this.mechBody.scale.set(1.02,1.02,1.00);
      this.mechBody.position.z=-.03;
      this.mechanicalGroup.add(this.mechBody);
      this.mechBodyParts.push(this.mechBody);

      /* R1984 — final-stage edge fibrils.
         Sample the actual four-point signature outline and grow one-pixel fibers
         out of its silhouette. This keeps microscopic detail visible through the
         final 6–10 s handoff instead of dropping back to a perfectly machined CGI
         edge before the permanent R1982 MAG takes over. */
      this.mechFiberMaterial=new T.LineBasicMaterial({
        color:0x9aaba5,
        transparent:true,
        opacity:0,
        depthWrite:false,
        depthTest:true,
        blending:T.NormalBlending,
        toneMapped:true
      });
      const edgeSamples=baseShape.getSpacedPoints(this.mobileRender?72:184);
      const mechFiberPositions=[];
      let mechFiberState=0x1984cafe;
      const mechFiberRnd=()=>{
        mechFiberState=(Math.imul(mechFiberState^mechFiberState>>>15,1597334677)+3812015801)|0;
        return ((mechFiberState^mechFiberState>>>12)>>>0)/4294967296;
      };
      edgeSamples.forEach((point,index)=>{
        if(index===edgeSamples.length-1)return;
        const radial=new T.Vector2(point.x,point.y).normalize();
        const len=(this.mobileRender?.014:.018)+mechFiberRnd()*(this.mobileRender?.016:.026);
        const z=.205+(mechFiberRnd()-.5)*.020;
        const root=new T.Vector3(point.x*1.015,point.y*1.015,z);
        const mid=root.clone();
        mid.x+=radial.x*len*.52;
        mid.y+=radial.y*len*.52;
        mid.z+=(mechFiberRnd()-.5)*.008;
        const tip=root.clone();
        tip.x+=radial.x*len;
        tip.y+=radial.y*len;
        tip.z+=(mechFiberRnd()-.5)*.014;
        mechFiberPositions.push(
          root.x,root.y,root.z,mid.x,mid.y,mid.z,
          mid.x,mid.y,mid.z,tip.x,tip.y,tip.z
        );
      });
      const mechFiberGeometry=new T.BufferGeometry();
      mechFiberGeometry.setAttribute('position',new T.Float32BufferAttribute(mechFiberPositions,3));
      this.mechFibers=new T.LineSegments(mechFiberGeometry,this.mechFiberMaterial);
      this.mechFibers.scale.set(1.02,1.02,1.00);
      this.mechFibers.position.z=-.03;
      this.mechFibers.renderOrder=6;
      this.mechFibers.frustumCulled=false;
      this.mechanicalGroup.add(this.mechFibers);

      /* R1950b — nested optical volume.
         A smaller translucent copy lives inside the outer shell so the finale
         reads as layered cut glass instead of one flat teal extrusion. */
      this.innerPrismMaterial=new T.MeshPhysicalMaterial({
        color:0x17343a,metalness:.02,roughness:.075,
        transmission:.58,thickness:.26,ior:1.47,
        emissive:0x05171b,emissiveIntensity:.035,
        clearcoat:1.0,clearcoatRoughness:.035,
        bumpMap:this.microFiberTexture,bumpScale:.006,
        transparent:true,opacity:0,depthWrite:false
      });
      this.innerPrism=new T.Mesh(baseGeo.clone(),this.innerPrismMaterial);
      this.innerPrism.scale.set(.72,.72,.54);
      this.innerPrism.position.z=.075;
      this.mechanicalGroup.add(this.innerPrism);

      // Central smoked optical cradle, fused visually into the glass body.
      const cradleShape=new T.Shape();
      cradleShape.moveTo(0,.43);
      cradleShape.bezierCurveTo(.18,.31,.36,.16,.43,0);
      cradleShape.bezierCurveTo(.34,-.17,.18,-.33,0,-.43);
      cradleShape.bezierCurveTo(-.18,-.33,-.34,-.17,-.43,0);
      cradleShape.bezierCurveTo(-.36,.16,-.18,.31,0,.43);
      const cradleGeo=new T.ExtrudeGeometry(cradleShape,{
        depth:.14,bevelEnabled:true,bevelSegments:5,steps:1,
        bevelSize:.024,bevelThickness:.032,curveSegments:20
      });
      cradleGeo.center();
      this.mechCradle=new T.Mesh(cradleGeo,this.mechMidMaterial);
      this.mechCradle.scale.set(.78,.78,.64);
      this.mechCradle.position.z=.24;
      this.mechanicalGroup.add(this.mechCradle);

      // Four internal silver-ice facets reinforce the signature points.
      const topPlateShape=new T.Shape();
      topPlateShape.moveTo(0,.82);
      topPlateShape.lineTo(.10,.58);
      topPlateShape.lineTo(.44,.08);
      topPlateShape.lineTo(.18,-.04);
      topPlateShape.lineTo(0,.16);
      topPlateShape.lineTo(-.18,-.04);
      topPlateShape.lineTo(-.44,.08);
      topPlateShape.lineTo(-.10,.58);
      topPlateShape.closePath();
      const topPlateGeo=new T.ExtrudeGeometry(topPlateShape,{
        depth:.14,bevelEnabled:true,bevelSegments:3,steps:1,
        bevelSize:.030,bevelThickness:.040,curveSegments:8
      });
      topPlateGeo.center();

      // R2180: the two-piece crown seats as one narrow titanium arm. Keeping
      // both authored pieces preserves the five-step birth choreography while
      // matching the permanent MAG's slim top insert at the handoff.
      const crownL=new T.Mesh(topPlateGeo,this.silverMaterial);
      crownL.scale.set(.30,.90,.76);
      crownL.position.set(-.065,.40,.31);
      crownL.rotation.z=-.025;
      this.mechanicalGroup.add(crownL);
      this.silverParts.push(crownL);
      crownL.visible=false;

      const crownR=new T.Mesh(topPlateGeo,this.silverMaterial);
      crownR.scale.set(-.30,.90,.76);
      crownR.position.set(.065,.40,.31);
      crownR.rotation.z=.025;
      this.mechanicalGroup.add(crownR);
      this.silverParts.push(crownR);
      crownR.visible=false;
      this.crown=crownL;

      const sideShape=new T.Shape();
      sideShape.moveTo(0,.46);
      sideShape.lineTo(.54,.12);
      sideShape.lineTo(.46,-.20);
      sideShape.lineTo(.16,-.08);
      sideShape.lineTo(-.04,.10);
      sideShape.closePath();
      const sideGeo=new T.ExtrudeGeometry(sideShape,{
        depth:.14,bevelEnabled:true,bevelSegments:3,steps:1,
        bevelSize:.026,bevelThickness:.034,curveSegments:8
      });
      sideGeo.center();

      const left=new T.Mesh(sideGeo,this.silverMaterial);
      left.scale.set(.72,.40,.74);
      left.position.set(-.48,.00,.28);
      left.rotation.z=.05;
      this.mechanicalGroup.add(left);
      this.plates.push(left);
      left.visible=false;

      const right=new T.Mesh(sideGeo,this.silverMaterial);
      right.scale.set(-.72,.40,.74);
      right.position.set(.48,.00,.28);
      right.rotation.z=-.05;
      this.mechanicalGroup.add(right);
      this.plates.push(right);
      right.visible=false;

      const lowerShape=new T.Shape();
      lowerShape.moveTo(0,.24);
      lowerShape.lineTo(.34,.04);
      lowerShape.lineTo(.22,-.54);
      lowerShape.lineTo(.08,-.80);
      lowerShape.lineTo(-.08,-.80);
      lowerShape.lineTo(-.22,-.54);
      lowerShape.lineTo(-.34,.04);
      lowerShape.closePath();
      const lowerGeo=new T.ExtrudeGeometry(lowerShape,{
        depth:.15,bevelEnabled:true,bevelSegments:3,steps:1,
        bevelSize:.025,bevelThickness:.034,curveSegments:8
      });
      lowerGeo.center();
      this.jaw=new T.Mesh(lowerGeo,this.mechMaterial);
      this.jaw.scale.set(.48,.88,.76);
      this.jaw.position.set(0,-.39,.28);
      this.mechanicalGroup.add(this.jaw);
      this.plates.push(this.jaw);
      this.jaw.visible=false;

      // R2180: four real machined titanium inlays, not flat screen-space
      // lines. Each plate has bevelled depth and a recessed axial engraving.
      // The parts arrive on distinct tracks during the MAG birth sequence.
      // The geometry is shared by all four arms to bound GPU memory.
      this.armInlays=[];
      this.armInlayMaterial=new T.MeshPhysicalMaterial({
        color:0xa9bdbe,metalness:.86,roughness:.23,
        emissive:0x071b21,emissiveIntensity:.018,
        clearcoat:.82,clearcoatRoughness:.09,
        bumpMap:this.microFiberTexture,bumpScale:.0025,
        transparent:true,opacity:0,depthWrite:false
      });
      this.armEtchMaterial=new T.LineBasicMaterial({
        color:0x132c34,transparent:true,opacity:0,depthWrite:false
      });
      const inlayProfile=new T.Shape();
      inlayProfile.moveTo(-.066,.28);
      inlayProfile.bezierCurveTo(-.13,.42,-.106,.60,-.025,.88);
      inlayProfile.lineTo(.025,.88);
      inlayProfile.bezierCurveTo(.106,.60,.13,.42,.066,.28);
      inlayProfile.bezierCurveTo(.035,.215,-.035,.215,-.066,.28);
      const inlayGeometry=new T.ExtrudeGeometry(inlayProfile,{
        depth:.032,steps:1,bevelEnabled:true,bevelSegments:3,
        bevelSize:.009,bevelThickness:.012,curveSegments:12
      });
      const etchGeometry=new T.BufferGeometry();
      etchGeometry.setAttribute('position',new T.Float32BufferAttribute([
        0,.35,.433,0,.47,.433,0,.47,.433,0,.67,.433,
        -.018,.70,.433,0,.765,.433,0,.765,.433,.018,.70,.433
      ],3));
      for(let axis=0;axis<4;axis++){
        const arm=new T.Group();
        arm.userData.axis=axis;
        const plate=new T.Mesh(inlayGeometry,this.armInlayMaterial);
        plate.position.z=.378;
        plate.renderOrder=3;
        arm.add(plate);
        const engraving=new T.LineSegments(etchGeometry,this.armEtchMaterial);
        engraving.renderOrder=4;
        arm.add(engraving);
        arm.visible=false;
        this.mechanicalGroup.add(arm);
        this.armInlays.push(arm);
      }

      // R2194 — the same eight continuous studio-polished titanium ribs
      // as the permanent R326 MAG. One batched 3D mesh and one material;
      // no second canvas or screen-space decorative overlay.
      const ribPositions=[],ribIndices=[];
      for(let axis=0;axis<4;axis++){
        const angle=axis*Math.PI*.5;
        const dx=Math.cos(angle),dy=Math.sin(angle);
        const sx=-dy,sy=dx;
        for(const side of [-1,1]){
          const start=ribPositions.length/3;
          for(let j=0;j<=20;j++){
            const u=j/20;
            const reach=.29+.59*u;
            const lateral=side*(.053+.024*Math.sin(Math.PI*u));
            const width=.010*(1-.43*u);
            const z=.470-.034*u+.020*Math.sin(Math.PI*u);
            ribPositions.push(
              dx*reach+sx*(lateral-width),
              dy*reach+sy*(lateral-width),z,
              dx*reach+sx*(lateral+width),
              dy*reach+sy*(lateral+width),z
            );
            if(j>0){
              const p=start+(j-1)*2,q=start+j*2;
              ribIndices.push(p,q,p+1,p+1,q,q+1);
            }
          }
        }
      }
      const ribGeometry=new T.BufferGeometry();
      ribGeometry.setAttribute('position',
        new T.Float32BufferAttribute(ribPositions,3));
      ribGeometry.setIndex(ribIndices);
      ribGeometry.computeVertexNormals();
      this.armTrimMaterial=new T.MeshPhysicalMaterial({
        color:0xd5e6e2,metalness:.89,roughness:.16,
        clearcoat:1,clearcoatRoughness:.042,
        specularIntensity:1,
        transparent:true,opacity:0,depthWrite:false,
        side:T.DoubleSide,envMapIntensity:2.2
      });
      this.armTrim=new T.Mesh(ribGeometry,this.armTrimMaterial);
      this.armTrim.renderOrder=5;
      this.armTrim.visible=false;
      this.mechanicalGroup.add(this.armTrim);

      // Minimal internal seam energy; no external robotic rails in R1941.
      this.seamMaterial=new T.MeshBasicMaterial({
        color:0x52d9ef,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      const railGeo=new T.BoxGeometry(.27,.024,.070);
      this.seams=[];
      for(const x of []){
        const rail=new T.Mesh(railGeo,this.seamMaterial);
        rail.position.set(x,.00,.43);
        this.mechanicalGroup.add(rail);
        this.seams.push(rail);
      }
      const spineGeo=new T.BoxGeometry(.034,.25,.070);
      for(const x of []){
        const spine=new T.Mesh(spineGeo,this.seamMaterial);
        spine.position.set(x,-.64,.38);
        this.mechanicalGroup.add(spine);
        this.seams.push(spine);
      }

      // R1942 recessed optical organ: compact, bright inside, never a black HUD disc.
      this.mechEyeCorona=new T.Sprite(new T.SpriteMaterial({
        map:this.makeIrisTexture(),
        color:0x8feff4,
        transparent:true,
        opacity:0,
        depthWrite:false,
        blending:T.AdditiveBlending
      }));
      this.mechEyeCorona.scale.set(.50,.50,1);
      this.mechEyeCorona.position.set(0,.01,.48);
      this.mechanicalGroup.add(this.mechEyeCorona);

      this.mechEyeCore=new T.Mesh(
        new T.SphereGeometry(.120,48,24),
        new T.MeshPhysicalMaterial({
          color:0x12383e,metalness:.02,roughness:.075,
          transmission:.34,thickness:.18,ior:1.47,
          clearcoat:1.0,clearcoatRoughness:.035,
          emissive:0x06252b,emissiveIntensity:.045,
          transparent:true,opacity:.92
        })
      );
      this.mechEyeCore.scale.set(1,1,.30);
      this.mechEyeCore.position.set(0,.01,.505);
      this.mechanicalGroup.add(this.mechEyeCore);

      // R2148 — physically raised optical assembly: a dark machined socket,
      // bright brushed-titanium rim, secondary cyan capillary and eight
      // individual shutter facets. The final R326 hero uses this same
      // approximately 0.20-unit aperture, preventing a small-eye handoff.
      this.mechOpticSocket=new T.Mesh(
        new T.TorusGeometry(.191,.026,12,96),
        new T.MeshPhysicalMaterial({
          color:0x081a20,metalness:.55,roughness:.31,
          clearcoat:.72,clearcoatRoughness:.12,
          transparent:true,opacity:0,depthWrite:false
        })
      );
      this.mechOpticSocket.position.set(0,.01,.477);
      this.mechanicalGroup.add(this.mechOpticSocket);

      this.mechOpticRim=new T.Mesh(
        new T.TorusGeometry(.192,.010,12,96),
        new T.MeshPhysicalMaterial({
          color:0xc2d7d4,metalness:.69,roughness:.15,
          clearcoat:1,clearcoatRoughness:.043,
          specularIntensity:1,
          transparent:true,opacity:0,depthWrite:false
        })
      );
      this.mechOpticRim.position.set(0,.01,.507);
      this.mechanicalGroup.add(this.mechOpticRim);

      this.mechOpticCapillary=new T.Mesh(
        new T.TorusGeometry(.142,.0038,6,96),
        new T.MeshBasicMaterial({
          color:0x5ddddc,transparent:true,opacity:0,
          blending:T.AdditiveBlending,depthWrite:false
        })
      );
      this.mechOpticCapillary.position.set(0,.01,.514);
      this.mechanicalGroup.add(this.mechOpticCapillary);

      const shutterVertices=[];
      for(let blade=0;blade<8;blade++){
        const angle=blade*Math.PI/4+.12;
        const p=(radius,offset)=>[
          Math.cos(angle+offset)*radius,
          .01+Math.sin(angle+offset)*radius,
          .495
        ];
        shutterVertices.push(
          ...p(.107,-.15),...p(.178,-.23),...p(.178,.35)
        );
      }
      const shutterGeometry=new T.BufferGeometry();
      shutterGeometry.setAttribute('position',
        new T.Float32BufferAttribute(shutterVertices,3));
      shutterGeometry.computeVertexNormals();
      this.mechOpticShutters=new T.Mesh(
        shutterGeometry,
        new T.MeshPhysicalMaterial({
          color:0x98b5b7,metalness:.67,roughness:.23,
          clearcoat:.9,clearcoatRoughness:.08,
          side:T.DoubleSide,transparent:true,opacity:0,depthWrite:false
        })
      );
      this.mechanicalGroup.add(this.mechOpticShutters);

      this.mechInnerMaterial=new T.MeshBasicMaterial({
        color:0x8af6f5,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.mechInnerRing=new T.Mesh(
        new T.TorusGeometry(.132,.0042,8,72),
        this.mechInnerMaterial
      );
      this.mechInnerRing.position.set(0,.01,.49);
      this.mechanicalGroup.add(this.mechInnerRing);

      this.mechLight=new T.PointLight(0x86f4f3,0,4.2,2);
      this.mechLight.position.set(0,0,.90);
      this.mechanicalGroup.add(this.mechLight);

      this.mechanicalGroup.scale.setScalar(.001);
    }

    createTaperedTube(curve,segments=44,radial=7,r0=.078,r1=.012){
      const T=this.THREE;
      const frames=curve.computeFrenetFrames(segments,false);
      const positions=[];
      const indices=[];
      for(let i=0;i<=segments;i++){
        const u=i/segments;
        const p=curve.getPointAt(u);
        const radius=mix(r0,r1,Math.pow(u,.78))*(1+.08*Math.sin(u*Math.PI*5));
        const normal=frames.normals[i];
        const binormal=frames.binormals[i];
        for(let j=0;j<radial;j++){
          const a=j/radial*Math.PI*2;
          const c=Math.cos(a),sn=Math.sin(a);
          positions.push(
            p.x+(normal.x*c+binormal.x*sn)*radius,
            p.y+(normal.y*c+binormal.y*sn)*radius,
            p.z+(normal.z*c+binormal.z*sn)*radius
          );
        }
      }
      for(let i=0;i<segments;i++){
        for(let j=0;j<radial;j++){
          const n=(j+1)%radial;
          const a=i*radial+j,b=(i+1)*radial+j,c=(i+1)*radial+n,d=i*radial+n;
          indices.push(a,b,d,b,c,d);
        }
      }
      const geo=new T.BufferGeometry();
      geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      return geo;
    }

    makeAssemblyWeld(){
      // R2187 — sparse, actual 3D molecular welding along each arriving
      // titanium arm. Single batched GPU draw; not a CSS overlay or a flash.
      // The DNA remains the source and this welding is visible only AFTER
      // the biological nucleus has condensed into four assembly lanes.
      const T=this.THREE,r=this.rand;
      // R2195: precise welding at metal edges, not a confetti cloud.
      const count=this.mobileRender?112:224;
      const positions=new Float32Array(count*3);
      const seed=new Float32Array(count);
      for(let i=0;i<count;i++){
        const axis=i%4;
        const angle=axis*Math.PI*.5;
        const reach=.24+r()*.66;
        const tangent=(r()-.5)*.090;
        positions[i*3]=Math.cos(angle)*reach-Math.sin(angle)*tangent;
        positions[i*3+1]=Math.sin(angle)*reach+Math.cos(angle)*tangent;
        positions[i*3+2]=.33+(r()-.5)*.21;
        seed[i]=r();
      }
      const geometry=new T.BufferGeometry();
      geometry.setAttribute('position',new T.BufferAttribute(positions,3));
      geometry.setAttribute('aSeed',new T.BufferAttribute(seed,1));
      const material=new T.ShaderMaterial({
        uniforms:{
          uTime:{value:0},
          uIntensity:{value:0},
          uPixelRatio:{value:1}
        },
        vertexShader:`
          attribute float aSeed;
          uniform float uTime,uIntensity,uPixelRatio;
          varying float vFlare,vSeed;
          void main(){
            vSeed=aSeed;
            float pulse=pow(.5+.5*sin(uTime*.0054+aSeed*48.0),6.0);
            vFlare=uIntensity*(.38+.62*pulse);
            vec3 pos=position;
            pos.z+=.025*sin(uTime*.0017+aSeed*23.0);
            vec4 mv=modelViewMatrix*vec4(pos,1.0);
            gl_Position=projectionMatrix*mv;
            gl_PointSize=clamp((1.1+1.35*pulse)*uPixelRatio*4.2/max(1.0,-mv.z),
              1.0,4.5*uPixelRatio);
          }`,
        fragmentShader:`
          precision mediump float;
          varying float vFlare,vSeed;
          void main(){
            vec2 p=gl_PointCoord-.5;
            float d=dot(p,p);
            if(d>.25)discard;
            float core=exp(-d*21.0);
            vec3 plasma=mix(vec3(.22,.77,.82),vec3(.80,.90,.98),
              smoothstep(.25,.95,vSeed));
            gl_FragColor=vec4(plasma*(.40+.60*core),
              vFlare*core*.36);
          }`,
        transparent:true,depthTest:true,depthWrite:false,
        blending:T.AdditiveBlending
      });
      this.assemblyWeld=new T.Points(geometry,material);
      this.assemblyWeld.frustumCulled=false;
      this.assemblyWeld.visible=false;
      this.assemblyWeldMaterial=material;
      this.mechanicalGroup.add(this.assemblyWeld);
    }

    updateAssemblyWeld(t,time){
      const ignition=smooth((t-5.72)/.43);
      const extinguish=1-smooth((t-7.22)/.55);
      const strength=ignition*extinguish;
      this.assemblyWeld.visible=strength>.002;
      if(this.assemblyWeld.visible){
        this.assemblyWeldMaterial.uniforms.uTime.value=time;
        this.assemblyWeldMaterial.uniforms.uIntensity.value=strength;
        this.assemblyWeldMaterial.uniforms.uPixelRatio.value=
          Math.min(devicePixelRatio||1,this.mobileRender?1.15:1.8);
      }
    }

    makeTentacles(){
      const T=this.THREE,r=this.rand;
      this.tentacleMaterial=new T.MeshStandardMaterial({
        color:0x17333d,metalness:.44,roughness:.34,
        emissive:0x0c4b58,emissiveIntensity:.42,
        transparent:true,opacity:0
      });
      this.tentacleEdgeMaterial=new T.MeshBasicMaterial({
        color:0x5a9eaa,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.tentacleNodeMaterial=new T.PointsMaterial({
        color:0x80e8f4,size:.052,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });
      this.tentacleGlowMaterial=new T.MeshBasicMaterial({
        color:0x40cfe4,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.tentacleDashMaterial=new T.LineDashedMaterial({
        color:0x78edf8,dashSize:.052,gapSize:.034,
        transparent:true,opacity:0,depthWrite:false,
        blending:T.AdditiveBlending
      });

      this.tentacles=[];
      const count=8;
      for(let i=0;i<count;i++){
        const base=i/count*Math.PI*2+(r()-.5)*.11;
        const sign=i%2?1:-1;
        const len=1.42+r()*.62;
        const phase=r()*Math.PI*2;
        const pts=[];
        for(let j=0;j<10;j++){
          const u=j/9;
          const radius=1.05+len*u;
          const curl=sign*Math.sin(u*Math.PI*1.72+phase*.16)*(.050+.145*u);
          const a=base+curl;
          const sideWave=Math.sin(u*Math.PI*2.18+phase)*(.032+.068*u);
          pts.push(new T.Vector3(
            Math.cos(a)*radius-Math.sin(a)*sideWave,
            Math.sin(a)*radius+Math.cos(a)*sideWave,
            Math.sin(u*Math.PI*1.72+phase)*(.050+.130*u)
          ));
        }
        const curve=new T.CatmullRomCurve3(pts,false,'centripetal');
        const geo=this.createTaperedTube(curve,66,8,.060+r()*.012,.009+r()*.0025);
        const glowGeo=this.createTaperedTube(curve,66,6,.010+r()*.002,.003+r()*.0008);
        const mesh=new T.Mesh(geo,this.tentacleMaterial);
        const glow=new T.Mesh(glowGeo,this.tentacleGlowMaterial);
        const wire=new T.Mesh(geo,this.tentacleEdgeMaterial);
        const nodeGeo=new T.BufferGeometry().setFromPoints(curve.getPoints(48).filter((_,idx)=>idx%3===0));
        const nodes=new T.Points(nodeGeo,this.tentacleNodeMaterial);
        const dashGeo=new T.BufferGeometry().setFromPoints(curve.getPoints(82));
        const dash=new T.Line(dashGeo,this.tentacleDashMaterial);
        dash.computeLineDistances();
        const g=new T.Group();
        g.add(mesh,glow,wire,dash,nodes);
        g.scale.setScalar(.001);
        g.userData.phase=phase;
        this.tentacleGroup.add(g);
        this.tentacles.push(g);
      }
    }

    resize(){
      if(this.disposed)return;
      this.width=Math.max(1,innerWidth);
      this.height=Math.max(1,innerHeight);
      const dpr=Math.min(devicePixelRatio||1,this.mobileRender?1.15:2.0);
      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(this.width,this.height,false);
      this.camera.aspect=this.width/this.height;
      const portrait=this.camera.aspect<1;
      this.camera.fov=portrait?51:42;
      this.camera.updateProjectionMatrix();
    }

    targetWorld(){
      const T=this.THREE;
      let p=null;
      try { p=this.getTarget?.(); } catch(_){}
      if(!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return new T.Vector3(0,0,0);
      const ndc=new T.Vector3((p.x/this.width)*2-1,1-(p.y/this.height)*2,.1);
      ndc.unproject(this.camera);
      const dir=ndc.sub(this.camera.position).normalize();
      const distance=(0-this.camera.position.z)/dir.z;
      return this.camera.position.clone().add(dir.multiplyScalar(distance));
    }

    updateDNA(t,time){
      // R2120: DNA is the visible origin of the MAG, not an unrelated
      // opening motif. Hold the double helix through the biological
      // construction and let it collapse into the emerging metal chassis.
      const assembly=smooth((t-4.85)/2.25);
      // R2182: do not reveal a large embryonic globe behind the founding DNA.
      // First 3.1s establish one complete helix, then nucleotides condense;
      // biological membranes appear after that transition is unmistakable.
      // R2175: the founding helix physically dissolves into the embryo
      // particles by 4.6 s. Supporting DNA is a low-opacity donor during
      // arm formation, not a second helix tangled inside the living cell.
      const fade=1-smooth((t-3.10)/1.38);
      const donorEnvelope=smooth((t-4.38)/.48)*(1-smooth((t-5.95)/.85));
      // R2180: DNA is readable on the FIRST rendered frame, not hidden
      // behind a zero-opacity establishing shot while Three.js warms up.
      // R2188: no dark DNA first frame. The molecular hero is at film-grade
      // exposure immediately, even before the first browser rAF settles.
      const intro=.82+.18*ease(t/.30);
      // R2164: the central DNA is alone during the establishing shot.
      // Side genomes develop AFTER viewers have recognized its double helix.
      // Keep the timing in the existing 10-second film (no delayed handoff).
      // R2172: keep the first DNA chapter uncluttered and the embryo fully
      // readable. Donor helices illuminate ONLY when their nucleotides are
      // being recruited into the four mechanical construction lanes.
      // R2175: donor opacity is controlled by the separate transfer envelope.
      // R2149: DNA is the establishing shot; once the embryo forms,
      // helices become a transparent scaffold instead of blocking it.
      const embryoFocus=smooth((t-3.12)/1.04);
      // R2164: soften the desktop DNA around the new embryonic cell,
      // as phones already do. The bright helix must not occlude the cell.
      const helixScaleFocus=1-embryoFocus*(this.mobileRender?.47:.35);
      const helixOpacityFocus=1-embryoFocus*(this.mobileRender?.72:.66);
      // Keep the transfer strands/rungs alive after the opening helix fades.
      this.dnaGroup.visible=t<7.24;
      this.dnas.forEach((h,i)=>{
        const b=h.userData.base;
        const fly=1-intro;
        // R2122: the collapsing helices flow into four separate radial
        // construction lanes rather than vanishing into one central dot.
        // Reuse existing helix meshes: no additional GPU draw calls.
        const converge=1-assembly*.86;
        // R2126: each DNA filament feeds a distinct assembly arm at a
        // staggered phase; no uniform teleport or simultaneous collapse.
        // R2129: map each helix to the nearest actual four-point
        // chassis axis, rather than assigning directions by array index.
        // This prevents filaments from crossing the frame unnecessarily.
        const nearestAxis=b.armAxis;
        const armAngle=nearestAxis*Math.PI*.5;
        const armProgress=smooth((t-4.72-nearestAxis*.11)/2.06);
        // R2130: blend each filament onto its actual final arm position.
        // Interpolation preserves the source DNA silhouette at birth,
        // while removing the old residual offsets at full convergence.
        const armReach=.69*armProgress;
        const originX=b.x*(1+fly*.38);
        const originY=b.y*(1+fly*.34);
        const destinationX=Math.cos(armAngle)*armReach;
        const destinationY=Math.sin(armAngle)*armReach;
        h.position.x=mix(originX,destinationX,assembly);
        h.position.y=mix(originY,destinationY,assembly);
        h.position.z=b.z+fly*.54-assembly*.24;
        h.rotation.x=Math.sin(time*.00045+b.phase)*.082;
        h.rotation.y=Math.sin(time*.00033+b.phase)*.17;
        h.rotation.z=b.rz+time*.000058*(i%2?1:-1);
        h.scale.setScalar(b.s*(.95+.05*intro)*(1-assembly*.56)*helixScaleFocus);
        const bases=h.userData.baseOpacity||[];
        h.userData.materials.forEach((m,mi)=>{
          const chapterAlpha=h.userData.primary?fade:donorEnvelope*.27;
          m.opacity=(bases[mi]??.5)*intro*.94*helixOpacityFocus*chapterAlpha;
        });
      });
    }

    updateBirthStrands(t,time){
      // R2131: each strand bridges its DNA origin to the corresponding
      // four-point metal arm. Reuse buffers; no frame-by-frame allocation.
      const start=smooth((t-4.68)/.62);
      // R2186: the visible paired genetic bridges persist through titanium
      // arm seating, then disappear completely before optical ignition.
      const end=1-smooth((t-6.76)/.58);
      const opacity=start*end;
      this.birthStrands.forEach((line)=>{
        const axis=line.userData.axis;
        const lane=line.userData.lane;
        line.visible=opacity>.002;
        if(!line.visible){
          if(line.userData.tube)line.userData.tube.visible=false;
          return;
        }
        line.material.opacity=(lane===0?.18:.16)*opacity;
        const angle=axis*Math.PI*.5;
        const dx=Math.cos(angle),dy=Math.sin(angle);
        const source=line.userData.source;
        if(!source){line.visible=false;return;}
        const a=line.geometry.attributes.position;
        for(let j=0;j<40;j++){
          const u=j/39;
          const eased=smooth(u);
          // R2191: R2190 proved the gene-transfer was four tiny glowing
          // stubs, because start and end had already converged. Stretch
          // DNA from the inner chassis to each real titanium arm tip.
          const seatAlongArm=smooth((t-5.12)/1.23);
          const rootX=mix(source.position.x,dx*.24,seatAlongArm);
          const rootY=mix(source.position.y,dy*.24,seatAlongArm);
          const x=mix(rootX,dx*.89,eased);
          const y=mix(rootY,dy*.89,eased);
          // R2190: the double helix must remain PHYSICALLY IN FRONT of the
          // emerging titanium inlays during the genetic welding shot.
          // Previously z=.19 left it behind the .38-.48 metal face: the
          // actual 6.8s WebGL capture showed metal but almost no DNA.
          // This 3D path rises onto the arm, then fades before eye ignition.
          const frontSource=Math.max(.28,source.position.z+.22);
          const z=mix(frontSource,.65,eased);
          // R2135: a real volumetric, phase-opposed double helix twists
          // around each forming MAG arm, rather than oscillating in a plane.
          // Its tapered radius seats into the emerging metal at both ends.
          const radius=.065*Math.sin(Math.PI*u)*(1-.38*smooth((t-5.15)/1.65));
          const phase=u*Math.PI*8+time*.0028+axis*Math.PI*.5+lane*Math.PI;
          const sideways=radius*Math.cos(phase);
          const depth=radius*Math.sin(phase);
          a.setXYZ(j,x-dy*sideways,y+dx*sideways,z+depth);
        }
        a.needsUpdate=true;
        const tube=line.userData.tube;
        if(tube){
          tube.visible=opacity>.002;
          tube.material.opacity=(lane===0?.59:.52)*opacity;
          const p=tube.geometry.attributes.position;
          const sides=6;
          for(let j=0;j<40;j++){
            const prev=Math.max(0,j-1),next=Math.min(39,j+1);
            const cx=a.getX(j),cy=a.getY(j),cz=a.getZ(j);
            let tx=a.getX(next)-a.getX(prev);
            let ty=a.getY(next)-a.getY(prev);
            let tz=a.getZ(next)-a.getZ(prev);
            const length=Math.hypot(tx,ty,tz)||1;
            tx/=length;ty/=length;tz/=length;
            let nx=-ty,ny=tx;
            const nl=Math.hypot(nx,ny)||1;
            nx/=nl;ny/=nl;
            const bx=-tz*ny,by=tz*nx,bz=tx*ny-ty*nx;
            const radius=.013+.006*Math.sin(Math.PI*j/39);
            for(let k=0;k<sides;k++){
              const angle=k*Math.PI*2/sides;
              const co=Math.cos(angle),si=Math.sin(angle);
              p.setXYZ(j*sides+k,
                cx+radius*(nx*co+bx*si),
                cy+radius*(ny*co+by*si),
                cz+radius*bz*si);
            }
          }
          p.needsUpdate=true;
          // R2193: specular softboxes need the ACTUAL moving tube surface
          // normals; fixed fallback normals made the gene strands look flat.
          tube.geometry.computeVertexNormals();
        }
      });
      // R2157: reuse the already-updated opposite DNA strands as the
      // moving endpoints of the base-pair bridges. This tracks the same
      // four mechanical axes throughout the arm seating animation.
      this.birthRungs.forEach((bridge,axis)=>{
        const first=this.birthStrands[axis*2];
        const second=this.birthStrands[axis*2+1];
        const show=opacity>.002 && first?.visible && second?.visible;
        bridge.visible=Boolean(show);
        if(!show)return;
        bridge.material.opacity=.29*opacity;
        const a=bridge.geometry.attributes.position;
        const p=first.geometry.attributes.position;
        const q=second.geometry.attributes.position;
        for(let i=0;i<12;i++){
          const j=Math.round((i+.5)/12*39);
          a.setXYZ(i*2,p.getX(j),p.getY(j),p.getZ(j));
          a.setXYZ(i*2+1,q.getX(j),q.getY(j),q.getZ(j));
        }
        a.needsUpdate=true;
      });
    }

    updateCore(t,time){
      // R2149: the phone's biological hero needs readable foreground
      // scale, not a distant diamond trapped behind oversized helices.
      // Preserve the established ten-second camera and end-state framing.
      // R2167: the embryonic cell must fill the lens as an actual subject,
      // not read as a tiny smooth bead behind distracting orbiting DNA.
      const embryoScale=this.mobileRender?.72:.66;
      let sc;
      if(t<2.52) sc=1.28+ease(t/2.52)*.12;
      else if(t<3.28) sc=mix(1.40,embryoScale,smooth((t-2.52)/.76));
      else if(t<5.58) sc=embryoScale+Math.sin((t-3.28)*1.02)*.002;
      else if(t<7.15) sc=mix(embryoScale,.30,smooth((t-5.58)/1.57));
      else sc=.30;

      // R2175: the born MAG travels into the permanent hero position in a
      // continuous 1.35 s photographic dolly, instead of teleporting there
      // during the final 200 ms of the film.
      const endMove=smooth((t-8.45)/1.35);
      const target=this.targetWorld();
      const tx=target.x*endMove,ty=target.y*endMove;
      const cellular=smooth((t-2.58)/.54)*(1-smooth((t-9.52)/.30));
      const surfaceZ=cellular*1.10;

      this.coreGroup.position.set(tx,ty,surfaceZ);
      this.organicGroup.position.set(tx,ty,0);
      this.cellGroup.position.set(tx,ty,0);
      this.mechanicalGroup.position.set(tx,ty,.02);
      this.tentacleGroup.position.set(tx,ty,-.04);

      this.coreGroup.scale.setScalar(sc*mix(1,.86,endMove));
      this.coreGroup.rotation.y=Math.sin(time*.00018)*.010;
      this.coreGroup.rotation.x=Math.sin(time*.00022)*.007;

      // R2159: only a living, soft-edged biological cell is visible
      // between the founding DNA and the mechanically assembling MAG.
      // All the old early diamond/iris shapes stay invisible.
      const appear=smooth((t-3.52)/.76);
      const dissolve=1-smooth((t-5.66)/1.12);
      const visible=appear*dissolve;
      this.coreGroup.visible=visible>.002;
      // R2189: translucent outer membrane reveals living chromatin and
      // the physically shaded organelle without exposing a hard MAG eye.
      this.embryoMaterial.opacity=.72*visible;
      this.embryoNucleusMaterial.opacity=.76*visible;
      this.embryoChromatinMaterial.opacity=(this.mobileRender?.16:.22)*visible;
      this.embryoChromatin.rotation.y=Math.sin(time*.00024)*.16;
      this.embryoChromatin.rotation.x=Math.sin(time*.00018)*.085;
      const pulse=1+.025*Math.sin(time*.0021);
      this.embryoShell.scale.set(.88*pulse,1.12*pulse,.78*pulse);
      this.embryoShell.rotation.y=Math.sin(time*.00024)*.050;
      this.embryoShell.rotation.z=Math.sin(time*.00018)*.018;
      this.embryoNucleus.scale.setScalar(.96+.045*Math.sin(time*.0030));
      this.embryoInnerMaterial.opacity=.34*visible;
      this.embryoOrganelle.rotation.y=Math.sin(time*.00036)*.15;
      this.embryoOrganelle.rotation.z=Math.sin(time*.00029)*.06;
      this.embryoSiteMaterial.opacity=.48*visible;
      this.embryoSites.rotation.y=Math.sin(time*.00031)*.11;
      this.embryoSites.rotation.z=Math.sin(time*.00023)*.035;
      this.embryoCapillaryMaterial.opacity=.25*visible;
      this.embryoCapillaries.rotation.y=time*.000043;
      this.embryoCapillaries.rotation.x=Math.sin(time*.00019)*.08;
      this.coreShell.material.opacity=0;
      this.coreGlass.material.opacity=0;
      this.coreEdges.material.opacity=0;
      if(this.corePetalMaterial)this.corePetalMaterial.opacity=0;
      this.irisGroup.visible=false;
      if(this.irisCorona)this.irisCorona.material.opacity=0;
      if(this.glowSprite)this.glowSprite.material.opacity=0;
      if(this.coreInner)this.coreInner.material.opacity=0;
      if(this.coreLabel)this.coreLabel.material.opacity=0;
      this.coreLight.intensity=0;
    }

    updateOrganic(t,time){
      const grow=smooth((t-3.76)/.72);
      const fade=1-smooth((t-6.20)/1.15)*.96;
      const visible=grow*fade;
      this.organicGroup.visible=visible>.002;
      const bodyScale=.001+visible*.63;
      this.organicGroup.scale.set(bodyScale*1.02,bodyScale*.98,bodyScale*.94);

      this.organicShellMaterial.opacity=.18*visible;
      this.organicLobeMaterial.opacity=.15*visible;
      this.organicWireMaterial.opacity=.0003*visible;
      this.organicVeinMaterial.opacity=.068*visible;
      this.organicHoodMaterial.opacity=.13*visible;
      if(this.organicFoldMaterial)this.organicFoldMaterial.opacity=.16*visible;
      if(this.organicFoldGlowMaterial)this.organicFoldGlowMaterial.opacity=.022*visible;
      if(this.organicFiberMaterial)this.organicFiberMaterial.opacity=(this.mobileRender?.20:.34)*visible*(.94+.06*Math.sin(time*.0011));
      if(this.organicFibers){
        this.organicFibers.rotation.y=Math.sin(time*.00013)*.010;
        this.organicFibers.rotation.x=Math.sin(time*.00011)*.006;
      }

      if(this.organicHoodGroup){
        this.organicHoodGroup.scale.setScalar(.80);
        this.organicHoodGroup.rotation.y=Math.sin(time*.00022)*.014;
        this.organicHoodGroup.rotation.x=Math.sin(time*.00018)*.007;
      }
      this.organicShell.rotation.y=time*.000024;
      this.organicShell.rotation.x=Math.sin(time*.00020)*.008;

      this.organicLobes.forEach((lobe,i)=>{
        const q=1+Math.sin(time*.00096+lobe.userData.phase)*.012*visible;
        const b=lobe.userData.baseScale;
        if(b)lobe.scale.set(b.x*q,b.y*q,b.z*q);
        lobe.rotation.y+=.000065*(i%2?1:-1);
      });
      this.organicVeins.forEach(vein=>{
        vein.rotation.z=Math.sin(time*.00025+vein.userData.phase)*.007;
      });
      if(this.organicPrimaryVeinMaterial)this.organicPrimaryVeinMaterial.opacity=.040*visible;
      this.organicPrimaryVeins?.forEach((vein,i)=>{
        vein.rotation.z=Math.sin(time*.00019+(vein.userData.phase||i))*.0035;
      });
      if(this.organicFolds){
        this.organicFolds.rotation.y=Math.sin(time*.00015)*.010;
        this.organicFolds.rotation.x=Math.sin(time*.00012)*.005;
      }
    }

    updateCells(t,time){
      const grow=smooth((t-3.90)/.70);
      const fade=1-smooth((t-6.25)/1.10)*.96;
      const visible=grow*fade;
      this.cellGroup.visible=visible>.002;
      const cellScale=.001+visible*.76;
      this.cellGroup.scale.set(cellScale*.94,cellScale*.92,cellScale*.90);
      this.cellMaterial.opacity=.045*visible;
      this.cellEdgeMaterial.opacity=.0005*visible;
      this.cellVeinMaterial.opacity=.040*visible;
      this.cells.forEach((c,i)=>{
        const q=1+Math.sin(time*.00102+c.userData.phase)*.010*visible;
        c.rotation.y+=.00010*(i%2?1:-1);
        const b=c.userData.baseScale;
        if(b)c.scale.set(b.x*q,b.y*q,b.z*q);
      });
      this.cellVeins?.forEach((line,i)=>{
        line.rotation.z=Math.sin(time*.00018+(line.userData.phase||i))*.0035*visible;
      });
    }

    updateMechanical(t,time){
      // R2121: overlap the first chassis emergence with the final DNA
      // convergence so the mechanical MAG is born from the helix on screen.
      const grow=smooth((t-5.88)/1.18);
      const finale=smooth((t-7.20)/1.65);
      this.mechanicalGroup.visible=grow>.002;
      // R2175: match the physical size of the native R326 MAG as it settles
      // into the upper hero viewport, eliminating the final size jump.
      const landingScale=1-.26*smooth((t-8.55)/1.30);
      this.mechanicalGroup.scale.set((.001+grow*1.04)*landingScale,(.001+grow*1.04)*landingScale,(.001+grow*1.02)*landingScale);

      /* R1945k — studio-smoked material convergence, not a flash.
         The final 2.5 s gradually become the same smoked-silver/cyan bioglass
         family as the permanent hero, so handoff reads as one continuous object. */
      this.mechMaterial.color.setRGB(
        mix(.031,.072,finale),
        mix(.090,.124,finale),
        mix(.106,.132,finale)
      );
      this.mechMidMaterial.color.setRGB(
        mix(.039,.066,finale),
        mix(.125,.142,finale),
        mix(.145,.150,finale)
      );
      this.silverMaterial.color.setRGB(
        mix(.480,.440,finale),
        mix(.575,.540,finale),
        mix(.565,.530,finale)
      );
      // R2118: previous per-frame animation silently reverted the physical
      // metal material settings on every render. Keep cinematic progression
      // while retaining an opaque, textured machined chassis.
      this.mechMaterial.transmission=mix(.075,.045,finale);
      this.mechMidMaterial.transmission=mix(.095,.065,finale);
      this.silverMaterial.transmission=mix(.040,.020,finale);
      this.mechMaterial.metalness=mix(.50,.64,finale);
      this.mechMidMaterial.metalness=mix(.43,.54,finale);
      this.silverMaterial.metalness=mix(.70,.82,finale);
      this.mechMaterial.roughness=mix(.26,.21,finale);
      this.mechMidMaterial.roughness=mix(.24,.19,finale);
      this.silverMaterial.roughness=mix(.18,.14,finale);

      this.mechMaterial.opacity=(.97+.018*finale)*grow;
      // R2119: reveal machined inserts as solid layers, not ghosted decals.
      // Opacity is still animated from zero to preserve the cinematic reveal.
      this.mechMidMaterial.opacity=(.91+.07*finale)*grow;
      this.silverMaterial.opacity=(.92+.06*finale)*grow;
      this.mechEdgeMaterial.opacity=(.045+.020*finale)*grow;
      this.mechInnerMaterial.opacity=(.070+.020*finale)*grow;
      if(this.mechFiberMaterial)this.mechFiberMaterial.opacity=(this.mobileRender?.055:.115)*grow*(.82+.18*finale);
      if(this.seamMaterial)this.seamMaterial.opacity=(.06-.020*finale)*grow;
      // R2123: the optical organ awakens only after the four-arm
      // chassis has assembled; a short restrained ignition, not a flash.
      // R2148: the final jaw finishes seating around 7.48s. Do not
      // ignite the optical organ before all five metal parts are in place.
      const opticWake=smooth((t-7.44)/.78);
      const opticPulse=1+.075*Math.sin(time*.0022);
      if(this.mechEyeCorona){
        this.mechEyeCorona.material.opacity=(.145+.018*finale)*opticWake*opticPulse;
        this.mechEyeCorona.scale.set(.50*(.90+.10*opticWake),.50*(.90+.10*opticWake),1);
      }
      this.mechInnerMaterial.opacity=(.070+.020*finale)*opticWake;
      // R2124: the recessed glass pupil must remain dark until ignition.
      // Previously its fixed .92 opacity revealed the eye prematurely.
      if(this.mechEyeCore){
        this.mechEyeCore.material.opacity=.92*opticWake;
        this.mechEyeCore.material.emissiveIntensity=.045+opticWake*.17;
      }
      // The iris seats only after the armour closes; no premature luminous
      // HUD or arbitrary late flash in the DNA/embryo chapters.
      if(this.mechOpticSocket){
        const wake=opticWake*grow;
        this.mechOpticSocket.material.opacity=.88*wake;
        this.mechOpticRim.material.opacity=.94*wake;
        this.mechOpticCapillary.material.opacity=.26*wake;
        this.mechOpticShutters.material.opacity=.79*wake;
        this.mechOpticShutters.rotation.z=.11*(1-opticWake)+Math.sin(time*.00023)*.007*wake;
        this.mechOpticRim.rotation.z=Math.sin(time*.00012)*.010*wake;
      }
      this.mechInnerRing.rotation.z=time*.00012;
      if(this.mechLight)this.mechLight.intensity=(.92+.18*finale)*opticWake*opticPulse;

      if(this.mechBody){
        this.mechBody.rotation.y=Math.sin(time*.00018)*.008*grow;
        this.mechBody.rotation.x=Math.sin(time*.00015)*.005*grow;
      }
      if(this.mechCradle)this.mechCradle.rotation.z=Math.sin(time*.00016)*.006*grow;
      if(this.innerPrism){
        this.innerPrismMaterial.opacity=(.10+.16*finale)*grow;
        this.innerPrism.rotation.z=Math.sin(time*.00013)*.012*grow;
        this.innerPrism.rotation.y=Math.sin(time*.00011)*.010*grow;
      }
      // R2127: sequentially seat machined silver elements into the
      // four-armed chassis. Capture each mesh's authored final transform
      // once, so repeated animation frames never accumulate drift.
      this.silverParts.forEach((p,i)=>{
        if(!p.userData.birthTransform){
          p.userData.birthTransform={
            position:p.position.clone(),
            scale:p.scale.clone(),
            rotationY:p.rotation.y
          };
        }
        const base=p.userData.birthTransform;
        const seat=smooth((t-5.91-(i%8)*.105)/1.10);
        // R2147: these metal assemblies were authored but permanently hidden
        // since R1941. Reveal them as each metal segment reaches its seat.
        p.visible=seat>.008;
        const direction=(i%4)*Math.PI*.5;
        const offset=(1-seat)*.16;
        p.position.set(
          base.position.x+Math.cos(direction)*offset,
          base.position.y+Math.sin(direction)*offset,
          base.position.z+(1-seat)*.22
        );
        p.scale.copy(base.scale).multiplyScalar(.78+.22*seat);
        p.rotation.y=base.rotationY+(1-seat)*.17+Math.sin(time*.00015+i)*.006*grow;
      });
      // R2180: titanium inlays mechanically seat after the supporting DNA
      // reaches each arm. Shared geometry, deterministic authored end pose.
      const inlayBirth=smooth((t-5.86)/1.14);
      // R2194: real metal veins only become visible after DNA molecular
      // filaments begin seating into the four machined titanium arms.
      const trimSeat=smooth((t-6.02)/1.18);
      this.armTrim.visible=trimSeat>.002;
      this.armTrimMaterial.opacity=.90*grow*trimSeat;
      this.armInlayMaterial.opacity=.985*grow;
      this.armEtchMaterial.opacity=.55*inlayBirth;
      this.armInlays.forEach((part,axis)=>{
        const seat=smooth((t-5.90-axis*.13)/1.16);
        part.visible=seat>.004;
        const direction=axis*Math.PI*.5;
        part.rotation.z=-direction+(1-seat)*(axis%2?-.23:.23);
        part.position.set(Math.cos(direction)*(1-seat)*.17,
          Math.sin(direction)*(1-seat)*.17,(1-seat)*.16);
        part.scale.setScalar(.70+.30*seat);
      });
      // R2147: lateral titanium shoulders and lower machined jaw follow
      // separate staggered tracks. Transform bases are authored once; no
      // accumulating per-frame position drift or extra WebGL draw pipeline.
      this.plates.forEach((p,i)=>{
        if(!p.userData.birthTransformR2147){
          p.userData.birthTransformR2147={
            position:p.position.clone(),
            scale:p.scale.clone(),
            rotationZ:p.rotation.z
          };
        }
        const base=p.userData.birthTransformR2147;
        const seat=smooth((t-5.90-i*.18)/1.22);
        p.visible=seat>.008;
        const swing=(1-seat)*.17;
        const sign=i===0?-1:i===1?1:0;
        p.position.set(
          base.position.x+sign*swing,
          base.position.y+(i===2?-.12:0)*(1-seat),
          base.position.z+(1-seat)*.21
        );
        p.scale.copy(base.scale).multiplyScalar(.76+.24*seat);
        p.rotation.z=base.rotationZ+(1-seat)*(i===0?-.10:i===1?.10:0);
      });
    }

    updateTentacles(t,time){
      /* R1941 — the award hero ends as one uninterrupted signature object.
         The old segmented cables made the final frame read as a robot prop. */
      this.tentacleGroup.visible=false;
      if(this.tentacleMaterial)this.tentacleMaterial.opacity=0;
      if(this.tentacleEdgeMaterial)this.tentacleEdgeMaterial.opacity=0;
      if(this.tentacleNodeMaterial)this.tentacleNodeMaterial.opacity=0;
      if(this.tentacleGlowMaterial)this.tentacleGlowMaterial.opacity=0;
      if(this.tentacleDashMaterial)this.tentacleDashMaterial.opacity=0;
    }

    updateCamera(t,time){
      let z=5.18,y=.012,x=0;
      if(t<2.70){
        const k=smooth(t/2.70);
        z=mix(5.42,5.12,k);
        x=Math.sin(time*.00027)*.024*(1-k*.35);
        y=.010+Math.sin(time*.00024)*.009;
      }else if(t<3.30){
        const k=smooth((t-2.70)/.60);
        z=mix(5.12,3.86,k);
        x=mix(.018,0,k);y=mix(.012,0,k);
      }else if(t<5.55){
        // R2115: restrained camera dolly and parallax while the mechanical
        // iris resolves; sub-centimetre movement keeps the MAG centered.
        const k=smooth((t-3.30)/2.25);
        z=mix(3.86,3.82,k)+Math.sin(time*.00020)*.0035;
        x=Math.sin(k*Math.PI)*.024+Math.sin(time*.00015)*.0018;
        y=Math.sin(k*Math.PI)*.010+Math.cos(time*.00018)*.0018;
      }else if(t<7.25){
        // R2128: during DNA-to-chassis birth, a slow lateral tracking
        // move creates real parallax across the layered 3D geometry.
        const k=smooth((t-5.55)/1.70);
        z=mix(3.82,4.28,k);
        x=.105*Math.sin(k*Math.PI);
        y=mix(-.018,.003,k)+.022*Math.sin(k*Math.PI);
      }else if(t<9.10){
        // Settle on a symmetrical hero portrait as the pupil ignites.
        const k=smooth((t-7.25)/1.85);
        z=4.28+Math.sin(time*.00018)*.006;
        x=.022*Math.sin(k*Math.PI);
        y=.003+.009*Math.sin(k*Math.PI);
      }else{
        z=mix(4.28,4.40,smooth((t-9.10)/.60));
        y=.003;
      }
      // R2172: one physical camera, one uninterrupted photographic take.
      // Gently dolly toward the moving titanium parts, then return to the
      // exact established final hero distance before the native R326 handoff.
      // This keeps the 10-second story and mobile crop intact.
      const birthDolly=smooth((t-5.68)/.80)*(1-smooth((t-8.52)/1.12));
      z-=birthDolly*(this.mobileRender?.27:.47);
      x+=birthDolly*.038*Math.sin((t-5.68)*1.12);
      y+=birthDolly*.018;
      if(this.width<this.height)z+=.90;
      this.camera.position.set(x,y,z);
      this.camera.lookAt(0,0,0);
    }

    render(r,time){
      if(this.disposed)return;
      const t=clamp(r)*10;
      this.updateCamera(t,time);
      this.updateDNA(t,time);
      this.updateBirthStrands(t,time);
      this.updateGenomeParticles(t,time);
      this.updateCore(t,time);
      this.updateOrganic(t,time);
      this.updateCells(t,time);
      this.updateMechanical(t,time);
      this.updateAssemblyWeld(t,time);
      this.updateTentacles(t,time);

      this.particles.rotation.z=time*.000018;
      this.particles.rotation.y=time*.000012;
      if(this.debris){
        this.debris.rotation.y=time*.000018;
        this.debris.rotation.z=Math.sin(time*.00011)*.022;
      }
      const finaleClean=smooth((t-6.45)/1.70);
      this.particles.material.opacity=(.26+.045*Math.sin(time*.00045))*(1-finaleClean*.78);
      // Film the genetic origin against a restrained neutral studio set:
      // early drifting rubble competes with the DNA silhouette.
      // R2195: keep tiny optical motes but no faceted polygonal rubble.
      if(this.debris)this.debris.visible=false;

      const flash=smooth((t-9.12)/.20)*(1-smooth((t-9.46)/.34));
      /* R1950 — controlled studio finale. The handoff lifts the optical core,
         not the whole frame, and lands on the permanent smoked-silver grade. */
      const after=smooth((t-9.44)/.38);
      // R2171: a focused studio key/fill illuminates the PHYSICAL titanium
      // only while the DNA is becoming a chassis. The eye still remains dark
      // until 7.44 s, and the final grade settles back to its original look.
      const assemblyStudio=smooth((t-5.45)/.95)*(1-smooth((t-7.15)/1.45));
      // R2174: three physically illuminated chapters from one continuous
      // camera take. The opening blue/violet DNA receives a narrow cool studio
      // key, the biological cell gets a gentle subsurface fill, and only then
      // does the titanium carry the moving broad metallic softbox. No new lights,
      // glow overlays or GPU draw calls are allocated per frame.
      const dnaStudio=smooth((t-.12)/.38)*(1-smooth((t-2.12)/.70));
      const embryoStudio=smooth((t-3.48)/.62)*(1-smooth((t-5.10)/.72));
      this.studioKey.intensity=1.62+dnaStudio*.35+embryoStudio*.20+assemblyStudio*.70;
      this.studioFill.intensity=.42+dnaStudio*.16+embryoStudio*.34+assemblyStudio*.38;
      // The DNA key and embryonic fill converge back to the authored
      // neutral studio positions before the first titanium plate seats.
      this.studioKey.position.set(
        -3.8-dnaStudio*.42+assemblyStudio*1.30,
        5.4+embryoStudio*.34-assemblyStudio*.70,6.4
      );
      this.studioFill.position.set(
        4.4-dnaStudio*.32-assemblyStudio*1.15,
        1.8+embryoStudio*.65+assemblyStudio*.50,5.2
      );
      this.renderer.toneMappingExposure=
        1.075+dnaStudio*.035+embryoStudio*.045+assemblyStudio*.11+
        flash*.006+after*.002;
      // Keep the premature embryo optic off; only the seated MAG eye may ignite.
      this.coreLight.intensity=0;
      if(this.glowSprite)this.glowSprite.material.opacity=0;
      if(this.flashBurst){
        this.flashBurst.material.opacity=flash*.010;
        const burstScale=2.08+flash*.10;
        this.flashBurst.scale.set(burstScale,burstScale,1);
      }
      if(this.flashBeam){
        this.flashBeam.material.opacity=flash*.004;
        this.flashBeam.scale.x=1+flash*.035;
      }
      // R2148: respect the mechanical layer's opticWake contract.
      // The former finale pass replaced a hidden pupil with a visible
      // 1.0-wide ring every frame, even before the eye was born.
      const eyeWake=smooth((t-7.44)/.78);
      if(this.mechEyeCorona){
        const finale=smooth((t-7.20)/1.65);
        const breathing=1+.075*Math.sin(time*.0022);
        this.mechEyeCorona.material.opacity=Math.min(.24,
          ((.145+.018*finale)*breathing+flash*.018)*eyeWake
        );
        const q=.50*(.90+.10*eyeWake)*(1+flash*.022*eyeWake);
        this.mechEyeCorona.scale.set(q,q,1);
      }
      if(this.mechLight)this.mechLight.intensity+=flash*.34*eyeWake;

      this.renderer.render(this.scene,this.camera);
      if(this.proofReadback){
        // R2146: real framebuffer evidence for the canonical R1280 Three.js
        // owner. The former visual proof only supported the retired R1360
        // renderer, and therefore reported a false blank GPU frame.
        try{
          const gl=this.renderer.getContext();
          const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
          let peak=0,lit=0;
          const px=this.proofPixel;
          for(let yi=0;yi<15;yi++){
            const y=Math.max(0,Math.min(h-1,Math.floor(h*(.10+yi*.057))));
            for(let xi=0;xi<15;xi++){
              const x=Math.max(0,Math.min(w-1,Math.floor(w*(.12+xi*.054))));
              gl.readPixels(x,y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);
              peak=Math.max(peak,px[0],px[1],px[2]);
              if(px[1]>35&&px[2]>45)lit++;
            }
          }
          const root=document.documentElement;
          // R2183 visual-proof-only: inspect the ACTUAL assembled Three.js
          // donor graph in the scene, rather than trusting source markers.
          const donorArms=new Set(
            this.birthStrands.filter(line=>Boolean(line.userData.source))
              .map(line=>line.userData.axis)
          );
          const donorPairs=[0,1,2,3].every(axis=>{
            const pair=this.birthStrands.filter(line=>line.userData.axis===axis);
            return pair.length===2&&Boolean(pair[0].userData.source)&&
              pair[0].userData.source===pair[1].userData.source;
          });
          root.dataset.fxMagBirthDonorArmsR2183=String(donorArms.size);
          root.dataset.fxMagBirthDonorPairsR2183=String(donorPairs);
          root.dataset.fxMagBirthFramePeakR1557=String(peak);
          root.dataset.fxMagBirthVisibleArmorR2147=String(
            [...this.silverParts,...this.plates].filter(part=>part.visible).length
          );
          // R2180: real GPU scene proof, not a CSS or semantic placeholder.
          root.dataset.fxMagBirthArmInlaysR2180=String(
            this.armInlays.filter(part=>part.visible).length
          );
          root.dataset.fxMagBirthArmInlayOpacityR2180=String(
            this.armInlayMaterial.opacity
          );
          // R2190: verify real transfer tube opacity and physical world-space
          // front depth on the exact browser-rendered film frame.
          root.dataset.fxMagBirthTransferTubeOpacityR2190=String(
            this.birthStrands[0]?.userData?.tube?.visible ? this.birthStrands[0].userData.tube.material.opacity : 0
          );
          root.dataset.fxMagBirthTransferTubeFrontR2190=String(
            this.birthStrands[0]?.userData?.tube?.geometry?.attributes?.position?.getZ(39*6)??0
          );
          // R2191: a bright dot on a metal tip is NOT a genome-to-MAG morph.
          const transferPoints=this.birthStrands[0]?.geometry?.attributes?.position;
          root.dataset.fxMagBirthTransferSpanR2191=String(transferPoints ?
            Math.hypot(
              transferPoints.getX(39)-transferPoints.getX(0),
              transferPoints.getY(39)-transferPoints.getY(0)
            ) : 0
          );
          root.dataset.fxMagBirthAssemblyWeldR2187=String(
            this.assemblyWeld.visible &&
            this.assemblyWeldMaterial.uniforms.uIntensity.value>.05
          );
          // R2148: test-only true GPU-scene optic state; never emit per-frame
          // telemetry during a normal mobile visitor's ten-second intro.
          root.dataset.fxMagBirthEyeOpacityR2148=String(
            this.mechEyeCorona?.material?.opacity??0
          );
          root.dataset.fxMagBirthEyeScaleR2148=String(
            this.mechEyeCorona?.scale?.x??0
          );
          root.dataset.fxMagBirthEmbryoScaleR2149=String(this.coreGroup.scale.x);
          root.dataset.fxMagBirthEmbryoOpacityR2160=String(this.embryoMaterial.opacity);
          root.dataset.fxMagBirthGenomeParticlesR2160=String(
            this.genomeParticles?.geometry?.attributes?.position?.count||0
          );
          root.dataset.fxMagBirthEarlyDiamondVisibleR2160=String(
            this.coreShell?.visible||false
          );
          root.dataset.fxMagBirthDnaOpacityR2149=String(
            this.dnas[0]?.userData?.materials?.[0]?.opacity??0
          );
          // R2164 proof-only center opening check: don't emit live DOM telemetry.
          const heroDna=this.dnas[0];
          root.dataset.fxMagBirthCenteredDnaR2164=String(Boolean(
            heroDna?.userData?.primary &&
            Math.abs(heroDna.userData.base.x)<.03 &&
            Math.abs(heroDna.userData.base.y)<.09 &&
            heroDna.userData.base.z>.50
          ));
          root.dataset.fxMagBirthThreeLitPixelsR2146=String(lit);
          root.dataset.fxMagBirthFrameR1557='r2146-canonical-three-framebuffer-readback';
        }catch(error){
          document.documentElement.dataset.fxMagBirthFrameR1557='r2146-three-readback-unavailable';
        }
      }
    }

    destroy(){
      if(this.disposed)return;
      this.disposed=true;
      this.scene.traverse(node=>{
        node.geometry?.dispose?.();
        const m=node.material;
        if(Array.isArray(m))m.forEach(x=>x?.dispose?.());
        else m?.dispose?.();
      });
      this.microFiberTexture?.dispose?.();
      this.bioticSurfaceTexture?.dispose?.();
      this.studioEnvironmentTexture?.dispose?.();
      this.studioEnvTarget?.dispose?.();
      this.renderer.dispose();
    }
  }

  function isSoftwareWebGL(){
    try{
      const probe=document.createElement('canvas');
      const gl=probe.getContext('webgl2',{powerPreference:'high-performance'})||probe.getContext('webgl',{powerPreference:'high-performance'});
      if(!gl)return true;
      const ext=gl.getExtension('WEBGL_debug_renderer_info');
      const renderer=String(ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)||'').toLowerCase();
      return /swiftshader|llvmpipe|software|softpipe|mesa offscreen/.test(renderer);
    }catch(_){
      return true;
    }
  }

  let loader=null;
  async function attach(canvas,getTarget){
    if(!(canvas instanceof HTMLCanvasElement))return null;
    try{
      const visualProof=new URLSearchParams(location.search).get('visualintro')==='1';
      if(!visualProof && isSoftwareWebGL()){
        document.documentElement.dataset.fxMagBirthR1280='software-webgl-r649-fallback';
        return null;
      }
      loader ||= loadThree();
      const THREE=await loader;
      const engine=new FormatXGenesisThree(THREE,canvas,getTarget);
      return {
        resize:()=>engine.resize(),
        draw:(r,time)=>engine.render(r,time),
        destroy:()=>engine.destroy(),
        engine,
        revision:'r1240-organic-gyri-lock'
      };
    }catch(error){
      console.error('FormatX R1280 genesis renderer failed:',error);
      document.documentElement.dataset.fxMagBirthR1280='fallback-r649';
      return null;
    }
  }

  document.documentElement.dataset.fxMagBirthThreeR658='r658-csp-local-three-proof';
  document.documentElement.dataset.fxMagBirthProofR658='r658-early-keyframe-proof';
  document.documentElement.dataset.fxMagBirthReferenceR721='frame-locked-source-video-proof';
  document.documentElement.dataset.fxMagBirthVisualProofR911='current-r900-reference-keyframes';
  document.documentElement.dataset.fxMagBirthProofR1204='isolated-r1200-r1151-reference-proof';
  document.documentElement.dataset.fxMagBirthProofR1206='fast-six-frame-reference-proof';
  document.documentElement.dataset.fxMagBirthProofR1211='fast-six-frame-r1210-reference-proof';
  document.documentElement.dataset.fxMagBirthProofR1231='fast-six-frame-r1230-reference-proof';
  document.documentElement.dataset.fxMagBirthProofR1241='fast-six-frame-r1240-reference-proof';
  document.documentElement.dataset.fxMagBirthProofR1252='clean-current-r1250-proof';
  document.documentElement.dataset.fxMagBirthVisualR1983='photoreal-physical-bump-plus-native-line-microfibrils-studio-sharp';
  document.documentElement.dataset.fxMagBirthVisualR1984='continuous-organic-to-smoked-bioglass-edge-fibrils-permanent-mag-handoff';

  window.FormatXMagGenesisThreeR1280={
    attach,
    revision:'r1941-signature-four-point-bioglass-central-optic-studio'
  };
  /* R1940 — the user-selected reference visual is the R1280 armored living
     pod. Keep the existing R1360 loader contract intact by exposing R1280 as
     its production owner instead of maintaining two divergent renderers. */
  window.FormatXMagGenesisThreeR1360=window.FormatXMagGenesisThreeR1280;
  document.documentElement.dataset.fxMagReferenceR1940='r1280-armored-pod-cyan-eye-segmented-tendrils';
  document.documentElement.dataset.fxMagSignatureR1941='four-point-smoked-bioglass-central-optic-single-iconic-object';
  document.documentElement.dataset.fxMagSignatureR1942='four-point-prism-depth-recessed-optic-smoked-silver-bioglass';
  document.documentElement.dataset.fxMagIntroStudioR1950='desktop-msaa-2x-dpr-neutral-softbox-controlled-optical-finale';
  document.documentElement.dataset.fxMagIntroStudioR1950b='nested-prism-physical-lens-clean-finale-debris-fade';
  document.documentElement.dataset.fxMagIntroStudioR1950c='clean-genome-transition-neutral-fill-early-debris-fade';
  document.documentElement.dataset.fxMagSignatureR1945='controlled-softbox-finale-no-whiteout-prism-optic-handoff';
  document.documentElement.dataset.fxMagSignatureR1945d='single-body-no-petals-restrained-optic-micro-ridges';
})();
