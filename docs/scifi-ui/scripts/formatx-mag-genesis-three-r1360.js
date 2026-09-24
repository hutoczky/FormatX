(() => {
  'use strict';

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
      this.mobileProfile=matchMedia('(max-width:900px),(pointer:coarse)').matches;
      this.lowPowerProfile=(
        Number(navigator.hardwareConcurrency||8)<=4 ||
        Number(navigator.deviceMemory||8)<=4
      );
      this.highDetail=matchMedia('(min-width:901px) and (pointer:fine)').matches
        && !this.lowPowerProfile;
      this.deterministicFrame=new URLSearchParams(location.search).has('introframe');
      this.targetFrameMs=1000/60;
      this.renderAverage=0;
      this.frameIntervalAverage=this.targetFrameMs;
      this.previousFrameTime=0;
      /* R1722 — the primary intro renderer must begin at genuinely sharp
         mobile resolution. The former 0.36× quality and 0.80 DPR cap yielded
         only ~0.29 effective DPR on phones. */
      this.qualityScale=this.lowPowerProfile?.74:(this.mobileProfile?1.00:.96);
      this.qualityCeiling=this.lowPowerProfile?.86:(this.mobileProfile?1.00:1.00);
      this.qualityFloor=this.lowPowerProfile?.62:(this.mobileProfile?.76:.44);
      this.lastQualityAdjust=0;
      this.renderPeak=0;
      this.framePeak=this.targetFrameMs;
      this.stableBudgetFrames=0;
      this.panicFrames=0;

      // R1690 — one low-cost physical response state for every input source.
      // Inputs never spawn extra render loops; they only modulate the existing
      // 60 Hz cinematic frame, so interaction cannot create a second GPU owner.
      this.interactionX=0;
      this.interactionY=0;
      this.interactionTargetX=0;
      this.interactionTargetY=0;
      this.interactionImpulse=0;
      this.interactionScroll=0;
      this.interactionSpin=0;
      this.interactionPress=0;
      this.interactionSemantic=0;
      this.interactionVelocityX=0;
      this.interactionVelocityY=0;
      this.interactionKind='idle';

      this.renderer=new THREE.WebGLRenderer({
        canvas,
        alpha:false,
        antialias:!this.mobileProfile && !this.lowPowerProfile,
        depth:true,
        stencil:false,
        powerPreference:'high-performance',
        /* R1554: deterministic visual-proof pages render one frame and wait for
           screenshot capture. Retain that buffer only there; production keeps
           the cheaper discard path. */
        preserveDrawingBuffer:this.deterministicFrame
      });
      const gl=this.renderer.getContext();
      const debugInfo=gl.getExtension('WEBGL_debug_renderer_info');
      const rendererName=String(debugInfo?gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)||'').toLowerCase();
      this.softwareRenderer=/swiftshader|llvmpipe|software|softpipe|mesa offscreen/.test(rendererName);
      if(this.softwareRenderer)this.highDetail=false;
      document.documentElement.dataset.fxMagBirthGpuR1541=this.softwareRenderer?'software-adaptive':'hardware-full';
      document.documentElement.dataset.fxMagBirthQualityR1722='primary-three-hidpi-msaa-gradual-adaptive-60hz';
      document.documentElement.dataset.fxMagBirthVisualR1722='fully-living-cortical-cellular-neural-studio-organism';
      document.documentElement.dataset.fxMagBirthVisualR1723='zero-robotic-shell-one-cortical-living-organism';
      document.documentElement.dataset.fxMagBirthSilhouetteR1724='same-asymmetric-living-crystal-organism-as-hero';
      document.documentElement.dataset.fxMagBirthOrganismR1724='faceted-pearl-cyan-living-crystal-organism';
      document.documentElement.dataset.fxMagBirthCoreR1724='biocrystal-cartilage-cyan-energy-warm-rim';
      document.documentElement.dataset.fxMagBirthAnatomyR1724='same-rhombic-cortical-lobes-membranes-energy-core-as-hero';
      document.documentElement.dataset.fxMagBirthMotionR1724='energy-core-living-membranes-tendrils-interactive';
      document.documentElement.dataset.fxMagBirthCellsR1724='anatomy-bound-dark-tissue-no-spherical-cell-shell';
      document.documentElement.dataset.fxMagBirthVisualR1725='studio-photoreal-smoky-pearl-living-biocrystal';
      document.documentElement.dataset.fxMagBirthMaterialR1725='desaturated-mineral-clearcoat-low-emission-warm-rim';
      document.documentElement.dataset.fxMagBirthVisualR1726='cinematic-photographic-smoky-pearl-living-biocrystal';
      document.documentElement.dataset.fxMagBirthMaterialR1726='neutral-studio-softbox-physical-clearcoat-restrained-cyan-physiology';
      document.documentElement.dataset.fxMagBirthSharpnessR1723='native-pixel-css-zero-resample-mobile-2.15x-adaptive';
      document.documentElement.dataset.fxMagBirthContinuityR1723='organic-cells-tendrils-persist-through-10s-handoff';
      this.renderer.setClearColor(0x020811,1);
      this.renderer.outputColorSpace=THREE.SRGBColorSpace;
      this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure=1.24;

      this.scene=new THREE.Scene();
      this.scene.background=new THREE.Color(0x020608);
      this.scene.fog=new THREE.FogExp2(0x02080d,0.0115);
      this.studioEnvironment=this.makeStudioEnvironment();
      this.scene.environment=this.studioEnvironment;

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
      this.makeChamber();
      this.makeParticles();
      this.makeDebris();
      this.makeDNAField();
      this.makeCore();
      this.makeOrganicLayer();
      this.makeCellularLayer();
      this.makeMechanicalLayer();
      this.makeTentacles();
      this.applyQualityTier(true);
      this.resize();
    }

    applyQualityTier(initial=false){
      const secondary=this.lowPowerProfile||this.mobileProfile||this.qualityScale<.50;
      const emergency=this.lowPowerProfile||this.qualityScale<.28;
      if(this.particles)this.particles.visible=!secondary;
      if(this.debris)this.debris.visible=!secondary;
      if(this.chamber)this.chamber.visible=!emergency;
      if(this.qualityScale<.34 && this.organicMembrane)this.organicMembrane.visible=false;
      else if(this.organicMembrane)this.organicMembrane.visible=true;
      document.documentElement.dataset.fxMagBirthQualityTierR1676=emergency?'emergency-60fps':secondary?'lean-60fps':'photoreal-60fps';
      if(initial)document.documentElement.dataset.fxMagBirthStartupTierR1676=document.documentElement.dataset.fxMagBirthQualityTierR1676;
    }

    makeStudioEnvironment(){
      const T=this.THREE;
      const c=document.createElement('canvas');
      c.width=768;c.height=384;
      const x=c.getContext('2d');
      x.fillStyle='#010304';
      x.fillRect(0,0,c.width,c.height);
      const glow=(cx,cy,rx,ry,stops)=>{
        x.save();
        x.translate(cx,cy);
        x.scale(rx,ry);
        const g=x.createRadialGradient(0,0,0,0,0,1);
        stops.forEach(([p,color])=>g.addColorStop(p,color));
        x.fillStyle=g;
        x.fillRect(-1,-1,2,2);
        x.restore();
      };
      glow(190,122,128,230,[
        [0,'rgba(205,222,217,.34)'],
        [.24,'rgba(146,167,164,.22)'],
        [.62,'rgba(63,82,84,.10)'],
        [1,'rgba(0,0,0,0)']
      ]);
      glow(570,188,90,190,[
        [0,'rgba(177,188,181,.24)'],
        [.28,'rgba(111,124,120,.14)'],
        [.66,'rgba(48,58,57,.06)'],
        [1,'rgba(0,0,0,0)']
      ]);
      glow(470,324,240,70,[
        [0,'rgba(118,91,68,.22)'],
        [.42,'rgba(61,47,37,.10)'],
        [1,'rgba(0,0,0,0)']
      ]);
      const ceiling=x.createLinearGradient(0,0,0,120);
      ceiling.addColorStop(0,'rgba(170,190,188,.16)');
      ceiling.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle=ceiling;
      x.fillRect(0,0,c.width,120);
      const tex=new T.CanvasTexture(c);
      tex.mapping=T.EquirectangularReflectionMapping;
      tex.colorSpace=T.SRGBColorSpace;
      tex.needsUpdate=true;
      return tex;
    }

    makeLights(){
      const T=this.THREE;
      // R1583 — softer photographic studio lighting plus procedural environment reflections.
      this.scene.add(new T.HemisphereLight(0xd9e1df,0x050708,0.88));
      const key=new T.DirectionalLight(0xfffbf3,2.86);
      key.position.set(-3.4,4.9,6.6);
      this.scene.add(key);
      this.keyLight=key;
      const rim=new T.PointLight(0xbfdadd,this.mobileProfile||this.lowPowerProfile?2.05:3.48,12,2);
      rim.position.set(3.4,-1.7,3.6);
      this.scene.add(rim);
      this.rimLight=rim;
      if(!this.mobileProfile&&!this.lowPowerProfile){
        const bioticFill=new T.PointLight(0x929095,1.68,10,2);
        bioticFill.position.set(-2.7,-.9,2.8);
        this.scene.add(bioticFill);
        const warmBounce=new T.PointLight(0xc9a681,.74,8,2);
        warmBounce.position.set(2.4,2.1,1.1);
        this.scene.add(warmBounce);

        const softbox=new T.SpotLight(0xeaf2ef,4.18,15,Math.PI*.40,.96,1.45);
        softbox.position.set(-4.5,5.6,6.2);
        softbox.target.position.set(.25,.12,0);
        this.scene.add(softbox,softbox.target);
        this.softboxLight=softbox;

        const edgeSoftbox=new T.SpotLight(0xa6b9bb,2.62,13,Math.PI*.42,.97,1.58);
        edgeSoftbox.position.set(4.8,1.5,4.1);
        edgeSoftbox.target.position.set(-.18,-.08,.1);
        this.scene.add(edgeSoftbox,edgeSoftbox.target);
        this.edgeSoftboxLight=edgeSoftbox;
      }
      if(this.mobileProfile&&!this.lowPowerProfile){
        const mobileSoftbox=new T.SpotLight(0xdff9fb,2.10,12,Math.PI*.44,.98,1.55);
        mobileSoftbox.position.set(-3.2,4.2,5.4);
        mobileSoftbox.target.position.set(.18,.10,0);
        this.scene.add(mobileSoftbox,mobileSoftbox.target);
        this.softboxLight=mobileSoftbox;
        const mobileWarmRim=new T.PointLight(0xf0b26a,.38,7,2);
        mobileWarmRim.position.set(2.5,1.4,2.2);
        this.scene.add(mobileWarmRim);
      }
      this.coreLight=new T.PointLight(0x79dbe7,0,7,2);
      this.coreLight.position.set(0,0,2.0);
      this.scene.add(this.coreLight);
      this.mechLight=new T.PointLight(0xd5e7e8,0,8,2);
      this.mechLight.position.set(-2.4,2.8,4.2);
      this.scene.add(this.mechLight);
    }

    makeChamber(){
      const T=this.THREE;
      const group=new T.Group();
      group.position.z=-3.65;

      const wallMat=new T.MeshPhysicalMaterial({
        color:0x0b1420,metalness:.015,roughness:.54,
        emissive:0x071321,emissiveIntensity:.13,
        clearcoat:.16,clearcoatRoughness:.46,
        sheen:.18,sheenColor:new T.Color(0x153f52),sheenRoughness:.60,
        side:T.BackSide
      });
      const panelMat=new T.MeshPhysicalMaterial({
        color:0x213042,metalness:.005,roughness:.56,
        emissive:0x0a1d2e,emissiveIntensity:.10,
        clearcoat:.14,clearcoatRoughness:.48,
        transparent:true,opacity:.24,
        sheen:.15,sheenColor:new T.Color(0x244d61),sheenRoughness:.58
      });
      const darkPanelMat=new T.MeshPhysicalMaterial({
        color:0x04090c,metalness:.02,roughness:.90,
        emissive:0x000000,emissiveIntensity:0,
        transparent:true,opacity:.11
      });
      const lightMat=new T.MeshBasicMaterial({
        color:0xc2dcdd,transparent:true,opacity:.052,
        depthWrite:false,blending:T.AdditiveBlending
      });

      // R1563 — physical rectangular habitat, not a circular bore.
      // A shallow room gives the birth film perspective without reading as a HUD ring.
      const tunnel=new T.Mesh(
        new T.BoxGeometry(9.6,7.2,7.0,1,1,1),
        wallMat
      );
      tunnel.position.set(0,0,-.62);
      tunnel.visible=true;
      group.add(tunnel);

      const floor=new T.Mesh(
        new T.PlaneGeometry(12,10,1,1),
        new T.MeshPhysicalMaterial({
          color:0x071013,metalness:.04,roughness:.74,
          clearcoat:.10,clearcoatRoughness:.60,
          transparent:true,opacity:.76,envMapIntensity:.46
        })
      );
      floor.rotation.x=-Math.PI/2;
      floor.position.set(0,-2.20,-1.25);
      group.add(floor);

      // Deep rear bulkhead.
      const bulkhead=new T.Mesh(
        new T.PlaneGeometry(11.0,8.0,1,1),
        darkPanelMat
      );
      bulkhead.position.z=-3.02;
      bulkhead.visible=true;
      group.add(bulkhead);

      // Asymmetric wall ribs. They establish scale and depth without forming a ring.
      const panelGeo=new T.BoxGeometry(.46,1.72,.18);
      const lightGeo=new T.BoxGeometry(.045,1.10,.025);
      const panelDefs=[
        [-3.78, 1.76,-.34,-.12,1.02],
        [-3.92,-1.48,-.52, .10,.84],
        [ 3.66, 1.18,-.42, .14,.92],
        [ 3.86,-1.80,-.30,-.09,1.06],
        [-2.20, 2.84,-.78, 1.48,.72],
        [ 2.46,-2.92,-.66, 1.62,.66]
      ];
      panelDefs.forEach(([x,y,z,rz,sy],i)=>{
        const panel=new T.Mesh(panelGeo,i%3===0?panelMat:darkPanelMat);
        panel.position.set(x,y,z);
        panel.rotation.z=rz;
        panel.scale.y=sy;
        group.add(panel);
        if(i===0||i===2){
          const light=new T.Mesh(lightGeo,lightMat);
          light.position.set(x*.94,y*.94,z+.17);
          light.rotation.z=rz;
          group.add(light);
        }
      });

      // R1540 — no concentric tunnel rings. The intro must read as a physical
      // dark habitat, not a targeting reticle or circular HUD.

      // Soft central ceiling/floor light wells for volumetric depth.
      const wellMat=new T.MeshBasicMaterial({
        color:0x7dd9e9,transparent:true,opacity:.024,
        depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide
      });
      const wellGeo=new T.PlaneGeometry(.38,5.0);
      const topWell=new T.Mesh(wellGeo,wellMat);
      topWell.position.set(0,2.18,-1.35);
      topWell.rotation.z=Math.PI/2;
      const bottomWell=topWell.clone();
      bottomWell.position.y=-2.18;
      group.add(topWell,bottomWell);

      /* R1722 — living chamber. Reused geometry/materials keep draw cost bounded
         while the birth environment reads as a biological ecosystem, not a room. */
      const tissueMat=new T.MeshPhysicalMaterial({
        color:0x3b2948,roughness:.46,metalness:0,
        emissive:0x0d2030,emissiveIntensity:.13,
        clearcoat:.24,clearcoatRoughness:.34,
        transparent:true,opacity:.42,
        sheen:.22,sheenColor:new T.Color(0x286078),sheenRoughness:.56
      });
      const vesselMat=new T.MeshPhysicalMaterial({
        color:0x1d5666,roughness:.28,metalness:0,
        emissive:0x08748b,emissiveIntensity:.38,
        clearcoat:.38,clearcoatRoughness:.18,
        transparent:true,opacity:.58
      });
      const sacGeo=new T.SphereGeometry(1,18,12);
      const sacDefs=[
        [-4.15,1.85,-1.55,1.45,2.25,.68,.18],
        [-4.35,-1.55,-1.10,1.25,1.85,.62,-.24],
        [4.18,1.42,-1.32,1.36,2.05,.66,-.18],
        [4.34,-1.72,-1.48,1.44,2.16,.70,.22],
        [-2.20,3.28,-1.82,1.70,.82,.58,.08],
        [2.48,-3.22,-1.72,1.65,.86,.60,-.08]
      ];
      sacDefs.forEach(([x,y,z,sx,sy,sz,rz])=>{
        const sac=new T.Mesh(sacGeo,tissueMat);
        sac.position.set(x,y,z);sac.scale.set(sx,sy,sz);sac.rotation.z=rz;group.add(sac);
      });
      const vesselCurves=[
        [[-4.0,2.7,-.70],[-2.5,1.9,-.25],[-1.35,2.55,.05]],
        [[4.0,2.5,-.72],[2.55,1.65,-.18],[1.40,2.30,.02]],
        [[-4.1,-2.7,-.80],[-2.6,-1.9,-.30],[-1.45,-2.45,.00]],
        [[4.1,-2.6,-.82],[2.7,-1.75,-.25],[1.50,-2.35,.00]]
      ];
      vesselCurves.forEach(points=>{
        const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');
        group.add(new T.Mesh(new T.TubeGeometry(curve,24,.028,6,false),vesselMat));
      });
      this.chamberTissueMaterial=tissueMat;
      this.chamberVesselMaterial=vesselMat;

      this.chamber=group;
      this.scene.add(group);
    }

    makeParticles(){
      const T=this.THREE,r=this.rand;
      const count=this.lowPowerProfile?18:(this.mobileProfile?32:96);
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
        color:0xa8c4c7,size:.020,transparent:true,opacity:.19,
        depthWrite:false,blending:T.NormalBlending,sizeAttenuation:true
      });
      this.particles=new T.Points(g,m);
      this.scene.add(this.particles);
    }

    makeDebris(){
      const T=this.THREE,r=this.rand;
      const geo=new T.IcosahedronGeometry(.050,0);
      const mat=new T.MeshStandardMaterial({
        color:0x34383c,roughness:.82,metalness:.01,
        emissive:0x06090a,emissiveIntensity:.04,
        transparent:true,opacity:.08,depthWrite:false
      });
      const debrisCount=this.lowPowerProfile?2:(this.mobileProfile?4:8);
      const mesh=new T.InstancedMesh(geo,mat,debrisCount);
      const dummy=new T.Object3D();
      for(let i=0;i<debrisCount;i++){
        const a=r()*Math.PI*2, rr=1.55+r()*3.8, sc=.42+r()*1.8;
        dummy.position.set(Math.cos(a)*rr,(r()-.5)*4.3,-1.15+(r()-.5)*3.2);
        dummy.rotation.set(r()*3,r()*3,r()*3);
        dummy.scale.set(sc*(.55+r()*.7),sc,sc*(.45+r()*.7));
        dummy.updateMatrix();
        mesh.setMatrixAt(i,dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate=true;
      this.debris=mesh;
      this.scene.add(mesh);
    }

        createHelix(length=4.7,radius=.28,turns=4.1){
      const T=this.THREE;
      const group=new T.Group();
      const seg=this.lowPowerProfile?22:(this.mobileProfile?30:58);
      const tubeRadial=this.lowPowerProfile?4:(this.mobileProfile?5:8);
      const auraRadial=this.lowPowerProfile?3:(this.mobileProfile?4:6);
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
        color:0x92a8a9,emissive:0x030708,emissiveIntensity:.018,
        roughness:.34,metalness:.04,transparent:true,opacity:.96,
        depthWrite:true,clearcoat:.42,clearcoatRoughness:.24,
        transmission:.025,thickness:.14
      });
      const mb=new T.MeshPhysicalMaterial({
        color:0x817b86,emissive:0x040405,emissiveIntensity:.016,
        roughness:.36,metalness:.04,transparent:true,opacity:.95,
        depthWrite:true,clearcoat:.38,clearcoatRoughness:.27,
        transmission:.020,thickness:.14
      });
      const ga=new T.MeshBasicMaterial({
        color:0x9ec7ca,transparent:true,opacity:.006,depthWrite:false,
        blending:T.NormalBlending
      });
      const gb=new T.MeshBasicMaterial({
        color:0x9994a0,transparent:true,opacity:.005,depthWrite:false,
        blending:T.NormalBlending
      });
      const rungMat=new T.MeshPhysicalMaterial({
        color:0xb6c2c2,emissive:0x030607,emissiveIntensity:.014,
        roughness:.43,metalness:.01,transparent:true,opacity:.82,depthWrite:true,
        clearcoat:.22,clearcoatRoughness:.32
      });
      const mpa=new T.PointsMaterial({
        color:0xb7f3ff,size:.034,transparent:true,opacity:.42,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });
      const mpb=new T.PointsMaterial({
        color:0xa994ff,size:.032,transparent:true,opacity:.38,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });

      const tubeA=new T.Mesh(new T.TubeGeometry(curveA,seg,.034,tubeRadial,false),ma);
      const tubeB=new T.Mesh(new T.TubeGeometry(curveB,seg,.034,tubeRadial,false),mb);
      const auraA=new T.Mesh(new T.TubeGeometry(curveA,seg,.040,auraRadial,false),ga);
      const auraB=new T.Mesh(new T.TubeGeometry(curveB,seg,.040,auraRadial,false),gb);

      const rungGeo=new T.CylinderGeometry(.010,.010,1,8,1,false);
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
      });
      rungs.instanceMatrix.needsUpdate=true;

      const pga=new T.BufferGeometry();pga.setAttribute('position',new T.Float32BufferAttribute(beadA,3));
      const pgb=new T.BufferGeometry();pgb.setAttribute('position',new T.Float32BufferAttribute(beadB,3));
      group.add(auraA,auraB,tubeA,tubeB,rungs,new T.Points(pga,mpa),new T.Points(pgb,mpb));
      group.userData.materials=[ma,mb,ga,gb,rungMat,mpa,mpb];
      group.userData.baseOpacity=[.96,.95,.008,.007,.82,.15,.14];
      return group;
    }

    makeDNAField(){
      const placements=[
        [-2.34,1.30,.82,-.54,1.00,.26,-.42],
        [2.28,1.18,.48,.58,.96,-.20,.52],
        [-2.16,-1.42,.34,.42,.92,.18,.38],
        [2.34,-1.30,.70,-.46,.90,-.26,-.46],
        [-.54,2.18,-.60,1.40,.60,.56,.18],
        [.62,-2.18,-.82,1.56,.58,-.52,-.16]
      ];
      this.dnas=[];
      for(const [x,y,z,rz,sc,rx,ry] of placements.slice(0,this.lowPowerProfile?3:(this.mobileProfile?4:placements.length))){
        const h=this.createHelix(3.34,.220,3.18);
        h.position.set(x,y,z);
        h.rotation.set(rx,ry,rz);
        h.scale.setScalar(sc);
        h.userData.base={x,y,z,rx,ry,rz,s:sc,phase:this.rand()*Math.PI*2};
        this.dnaGroup.add(h);
        this.dnas.push(h);
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
      for(let i=0;i<128;i++){
        const a=i/128*Math.PI*2;
        const inner=25+(i%7)*.8;
        const outer=72+((i*17)%36);
        const alpha=.09+((i*13)%23)/76;
        x.strokeStyle='rgba(66,211,255,'+alpha.toFixed(3)+')';
        x.lineWidth=i%9===0?1.7:.70;
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
        color:0x214b5d,metalness:.008,roughness:.15,
        emissive:0x07364d,emissiveIntensity:.10,
        clearcoat:.82,clearcoatRoughness:.065,
        envMapIntensity:2.06,transparent:true,opacity:.99,
        ior:1.42,specularIntensity:.98,specularColor:new T.Color(0xf1ffff),
        sheen:.24,sheenColor:new T.Color(0x78dcf0),sheenRoughness:.34
      });
      const shellGlass=new T.MeshPhysicalMaterial({
        color:0x8fd6e2,metalness:0,roughness:.050,
        transparent:true,opacity:.085,depthWrite:false,
        clearcoat:1,clearcoatRoughness:.020,
        transmission:.24,thickness:.20,ior:1.41,
        attenuationColor:new T.Color(0x1a7590),attenuationDistance:2.1,
        envMapIntensity:1.62
      });

      const seedGeo=new T.IcosahedronGeometry(.84,this.deterministicFrame?3:2);
      const seedPos=seedGeo.attributes.position;
      const seedV=new T.Vector3();
      for(let i=0;i<seedPos.count;i++){
        seedV.fromBufferAttribute(seedPos,i);
        const n=seedV.clone().normalize();
        const a=Math.atan2(n.z,n.x);
        const warp=1+Math.sin(a*2.4+n.y*3.2)*.045+Math.cos(a*4.1-n.y*1.7)*.024;
        seedV.multiplyScalar(warp);
        seedV.x*=.78;seedV.y*=1.02;seedV.z*=.60;
        seedV.x+=n.y*.035;seedV.z-=n.x*.018;
        seedPos.setXYZ(i,seedV.x,seedV.y,seedV.z);
      }
      seedGeo.computeVertexNormals();

      this.coreShell=new T.Mesh(seedGeo,shellMat);
      this.coreShell.scale.set(.82,.82,.82);
      this.coreGroup.add(this.coreShell);

      this.coreGlass=new T.Mesh(seedGeo.clone(),shellGlass);
      this.coreGlass.scale.set(.84,.84,.84);
      this.coreGlass.position.z=.018;
      this.coreGroup.add(this.coreGlass);

      this.corePetalMaterial=new T.MeshPhysicalMaterial({
        color:0x1b2429,metalness:.54,roughness:.29,
        emissive:0x010507,emissiveIntensity:.010,
        clearcoat:.40,clearcoatRoughness:.18,
        envMapIntensity:1.32,transparent:true,opacity:0
      });
      this.corePetals=[];
      const petalShape=new T.Shape();
      petalShape.moveTo(0,-.12);
      petalShape.bezierCurveTo(.15,.08,.40,.48,0,1.00);
      petalShape.bezierCurveTo(-.40,.48,-.15,.08,0,-.12);
      const petalGeo=new T.ExtrudeGeometry(petalShape,{
        depth:.10,bevelEnabled:true,bevelSegments:4,steps:1,
        bevelSize:.024,bevelThickness:.030,curveSegments:24
      });
      petalGeo.center();
      const petalDefs=[
        [0,.13,.18,0,.70,.62],
        [.13,0,.18,-Math.PI/2,.70,.62],
        [0,-.13,.18,Math.PI,.70,.62],
        [-.13,0,.18,Math.PI/2,.70,.62]
      ];
      for(const [x,y,z,rz,sx,sy] of petalDefs){
        const p=new T.Mesh(petalGeo,this.corePetalMaterial);
        p.position.set(x,y,z);p.rotation.z=rz;p.scale.set(sx,sy,.76);
        p.userData.homeZ=rz;
        this.coreGroup.add(p);this.corePetals.push(p);
      }

      this.coreContourMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0});
      this.coreContours=[];
      this.coreEdges=new T.LineSegments(new T.BufferGeometry(),new T.LineBasicMaterial({transparent:true,opacity:0}));
      this.coreGroup.add(this.coreEdges);

      this.irisGroup=new T.Group();
      const socketBack=new T.Mesh(
        new T.CircleGeometry(.258,72),
        new T.MeshPhysicalMaterial({
          color:0x071927,metalness:.01,roughness:.20,
          clearcoat:.58,clearcoatRoughness:.12,
          emissive:0x05283a,emissiveIntensity:.12,
          specularIntensity:.82,specularColor:new T.Color(0xaeefff),
          transparent:true,opacity:.98,side:T.DoubleSide
        })
      );
      socketBack.position.z=.285;
      this.irisGroup.add(socketBack);

      const socketBezel=new T.Mesh(
        new T.TorusGeometry(.205,.025,18,112),
        new T.MeshPhysicalMaterial({
          color:0xb9dfe6,metalness:.04,roughness:.14,
          clearcoat:.78,clearcoatRoughness:.065,
          emissive:0x0a6c89,emissiveIntensity:.22,
          specularIntensity:.96,specularColor:new T.Color(0xffffff)
        })
      );
      socketBezel.position.z=.302;
      this.irisGroup.add(socketBezel);

      const lensMat=new T.MeshPhysicalMaterial({
        color:0x0a4760,metalness:0,roughness:.052,
        clearcoat:1,clearcoatRoughness:.020,
        transmission:.34,thickness:.26,ior:1.46,
        attenuationColor:new T.Color(0x0a5f79),attenuationDistance:.54,
        emissive:0x0a83a8,emissiveIntensity:.42,
        envMapIntensity:1.82,
        transparent:true,opacity:.995
      });
      this.introLensMaterial=lensMat;
      const lens=new T.Mesh(new T.SphereGeometry(.142,72,42),lensMat);
      lens.scale.set(1,1,.30);
      lens.position.z=.337;
      this.irisGroup.add(lens);

      const aperture=new T.Mesh(
        new T.CircleGeometry(.027,48),
        new T.MeshPhysicalMaterial({
          color:0x010305,metalness:.04,roughness:.10,
          clearcoat:.88,clearcoatRoughness:.06,side:T.DoubleSide
        })
      );
      aperture.position.z=.381;
      this.irisGroup.add(aperture);

      const glassRing=new T.Mesh(
        new T.TorusGeometry(.119,.0085,16,112),
        new T.MeshPhysicalMaterial({
          color:0xe0b16a,metalness:.08,roughness:.11,
          clearcoat:.92,clearcoatRoughness:.040,
          emissive:0xc85d12,emissiveIntensity:.30,
          specularIntensity:.94,specularColor:new T.Color(0xffecd0),
          transparent:true,opacity:.48
        })
      );
      glassRing.position.z=.376;
      this.irisGroup.add(glassRing);

      this.irisRays=new T.Object3D();
      this.irisGroup.add(this.irisRays);
      this.irisCorona=new T.Sprite(new T.SpriteMaterial({
        map:this.makeGlowTexture(),color:0xa8c9cc,
        transparent:true,opacity:.018,depthWrite:false,
        blending:T.NormalBlending
      }));
      this.irisCorona.scale.set(.62,.62,1);
      this.irisCorona.position.z=.305;
      this.irisGroup.add(this.irisCorona);
      this.coreGroup.add(this.irisGroup);

      this.glowSprite=new T.Sprite(new T.SpriteMaterial({
        map:this.makeGlowTexture(),color:0x9fc8cc,
        transparent:true,opacity:.012,blending:T.NormalBlending,depthWrite:false
      }));
      this.glowSprite.scale.set(.86,.86,1);
      this.glowSprite.position.z=.29;
      this.coreGroup.add(this.glowSprite);

      this.coreInner=new T.Mesh(
        new T.IcosahedronGeometry(.105,2),
        new T.MeshBasicMaterial({
          color:0xe8ffff,transparent:true,opacity:.34,
          depthWrite:false,blending:T.AdditiveBlending
        })
      );
      this.coreInner.scale.set(.72,.72,.34);
      this.coreInner.position.z=.31;
      this.coreGroup.add(this.coreInner);

      this.flashBurst=new T.Sprite(new T.SpriteMaterial({
        map:this.makeBurstTexture(),transparent:true,opacity:0,
        blending:T.AdditiveBlending,depthWrite:false
      }));
      this.flashBurst.scale.set(3.1,3.1,1);
      this.flashBurst.position.z=.58;
      this.coreGroup.add(this.flashBurst);

      this.flashBeam=new T.Mesh(
        new T.PlaneGeometry(3.4,.016),
        new T.MeshBasicMaterial({
          color:0x8eeeff,transparent:true,opacity:0,
          depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide
        })
      );
      this.flashBeam.position.z=.57;
      this.coreGroup.add(this.flashBeam);

      this.coreLabel=new T.Mesh(new T.PlaneGeometry(.001,.001),new T.MeshBasicMaterial({transparent:true,opacity:0}));
      this.coreGroup.add(this.coreLabel);
      this.coreGroup.scale.setScalar(.001);
    }

    makeOrganicSurfaceTexture(){
      const T=this.THREE;
      const c=document.createElement('canvas');
      c.width=c.height=256;
      const x=c.getContext('2d');
      const image=x.createImageData(256,256);
      const data=image.data;
      for(let y=0;y<256;y++){
        for(let xx=0;xx<256;xx++){
          const i=(y*256+xx)*4;
          const broad=
            Math.sin(xx*.083)+Math.cos(y*.071)+
            Math.sin((xx+y)*.037)+Math.cos((xx-y)*.049);
          const pore=(this.rand()-.5)*42;
          const v=Math.max(44,Math.min(222,132+broad*13+pore));
          data[i]=v;data[i+1]=v;data[i+2]=v;data[i+3]=255;
        }
      }
      x.putImageData(image,0,0);
      x.globalAlpha=.10;
      x.strokeStyle='#f0f0f0';
      for(let i=0;i<26;i++){
        const y=12+this.rand()*232;
        x.lineWidth=.28+this.rand()*.65;
        x.beginPath();
        x.moveTo(-12,y);
        x.bezierCurveTo(72,y+(this.rand()-.5)*22,180,y+(this.rand()-.5)*28,268,y+(this.rand()-.5)*15);
        x.stroke();
      }
      x.globalAlpha=1;
      const texture=new T.CanvasTexture(c);
      texture.wrapS=texture.wrapT=T.RepeatWrapping;
      texture.repeat.set(1.32,1.48);
      texture.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy?.()||1);
      return texture;
    }

    makeOrganicLayer(){
      const T=this.THREE,r=this.rand;
      const organicSurface=this.makeOrganicSurfaceTexture();
      this.organicSurfaceTexture=organicSurface;

      this.organicShellMaterial=new T.MeshPhysicalMaterial({
        color:0x293236,roughness:.34,metalness:0,
        clearcoat:.54,clearcoatRoughness:.16,
        roughnessMap:organicSurface,bumpMap:organicSurface,bumpScale:.0048,
        transparent:true,opacity:0,
        emissive:0x02090d,emissiveIntensity:.026,
        envMapIntensity:1.54,
        ior:1.39,specularIntensity:.88,specularColor:new T.Color(0xe8f6f7),
        sheen:.11,sheenColor:new T.Color(0x8aa6a8),sheenRoughness:.52,
        depthWrite:true
      });
      this.organicLobeMaterial=new T.MeshPhysicalMaterial({
        color:0x46575c,roughness:.30,metalness:.001,
        clearcoat:.56,clearcoatRoughness:.14,
        roughnessMap:organicSurface,bumpMap:organicSurface,bumpScale:.0075,
        transparent:true,opacity:0,
        emissive:0x063044,emissiveIntensity:.075,
        envMapIntensity:1.72,
        sheen:.16,sheenColor:new T.Color(0x88c3ca),sheenRoughness:.46,
        specularIntensity:.82,specularColor:new T.Color(0xdffbff),
        depthWrite:true
      });
      this.organicWireMaterial=new T.MeshBasicMaterial({
        color:0x67ddea,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });

      const shellWidth=this.deterministicFrame||this.highDetail?42:(this.lowPowerProfile?18:(this.mobileProfile?24:32));
      const shellHeight=this.deterministicFrame||this.highDetail?26:(this.lowPowerProfile?12:(this.mobileProfile?16:20));
      const shellGeo=new T.SphereGeometry(1.38,shellWidth,shellHeight);
      const shellPos=shellGeo.attributes.position;
      for(let i=0;i<shellPos.count;i++){
        const p=new T.Vector3().fromBufferAttribute(shellPos,i);
        const n=p.clone().normalize();
        const az=Math.atan2(n.z,n.x), el=Math.acos(Math.max(-1,Math.min(1,n.y)));
        const shoulder=Math.max(0,1-n.y*n.y);
        const ax=.78+shoulder*.08+n.x*.035-n.z*.018;
        const ay=1.10+shoulder*.04+n.y*.025+n.x*.015;
        const azr=.67+shoulder*.06+n.z*.025-n.x*.015;
        const exponent=1.18;
        const lp=
          Math.pow(Math.abs(n.x)/ax,exponent)+
          Math.pow(Math.abs(n.y)/ay,exponent)+
          Math.pow(Math.abs(n.z)/azr,exponent);
        const radius=1/Math.pow(Math.max(.001,lp),1/exponent);
        const livingBias=1+Math.sin(az*2.1+el*.8)*.020+Math.cos(az*4.0-el*1.3)*.010;
        p.set(n.x*radius*livingBias,n.y*radius*livingBias,n.z*radius*livingBias);
        p.x+=-.055*Math.pow(Math.max(n.y,0),1.7)+.028*Math.pow(Math.max(-n.y,0),1.4);
        p.y+=Math.sin(az*2.2+el*.5)*.018*shoulder;
        p.z-=n.x*.018;
        shellPos.setXYZ(i,p.x,p.y,p.z);
      }
      shellGeo.computeVertexNormals();
      const shell=new T.Mesh(shellGeo,this.organicShellMaterial);
      shell.scale.set(.82,.78,.70);
      shell.position.set(-.03,.00,-.015);
      shell.userData.baseScale=shell.scale.clone();
      this.organicShell=shell;
      this.organicGroup.add(shell);

      this.organicMembraneMaterial=new T.MeshPhysicalMaterial({
        color:0x81999c,roughness:.22,metalness:0,
        clearcoat:.68,clearcoatRoughness:.080,
        transmission:.24,thickness:.080,ior:1.38,
        attenuationColor:new T.Color(0x174c5b),attenuationDistance:1.9,
        transparent:true,opacity:0,depthWrite:false,
        roughnessMap:organicSurface,bumpMap:organicSurface,bumpScale:.00045,
        envMapIntensity:1.28,side:T.FrontSide
      });
      this.organicMembrane=new T.Mesh(shellGeo.clone(),this.organicMembraneMaterial);
      this.organicMembrane.scale.set(.836,.796,.714);
      this.organicMembrane.position.set(-.03,.00,.000);
      this.organicMembrane.userData.baseScale=this.organicMembrane.scale.clone();
      this.organicGroup.add(this.organicMembrane);

      this.organicLobes=[];
      const lobeGeo=new T.SphereGeometry(.145,12,8);
      const count=innerWidth<900?5:8;
      for(let i=0;i<count;i++){
        const phi=Math.acos(1-2*(i+.5)/count);
        const theta=Math.PI*(1+Math.sqrt(5))*i;
        const rr=.92+(r()-.5)*.12;
        const lobe=new T.Mesh(lobeGeo,this.organicLobeMaterial);
        lobe.position.set(
          Math.sin(phi)*Math.cos(theta)*rr,
          Math.cos(phi)*rr,
          Math.sin(phi)*Math.sin(theta)*rr*.83
        );
        const k=.78+r()*.38;
        lobe.scale.set(
          k*(.88+r()*.30),
          k*(.90+r()*.34),
          k*(.82+r()*.26)
        );
        lobe.rotation.set(r()*2.4,r()*2.4,r()*2.4);
        lobe.userData.phase=r()*Math.PI*2;
        lobe.userData.baseScale=lobe.scale.clone();
        this.organicGroup.add(lobe);
        this.organicLobes.push(lobe);
      }

      /* R1724 — FormatX living-crystal anatomy.
         The intro grows the same unique crystalline organism used by the hero:
         faceted cortical lobes, translucent membranes and one energy organ.
         No animal head, paws, limbs or robotic armour. */
      this.guardianPlateMaterial=new T.MeshPhysicalMaterial({
        color:0x667b82,roughness:.27,metalness:0,
        clearcoat:.68,clearcoatRoughness:.12,
        emissive:0x06222d,emissiveIntensity:.075,
        envMapIntensity:1.72,
        sheen:.16,sheenColor:new T.Color(0x89ced8),sheenRoughness:.46,
        specularIntensity:.92,specularColor:new T.Color(0xecf8f8),
        transparent:true,opacity:0,depthWrite:true,
        flatShading:true
      });
      this.guardianGoldMaterial=new T.MeshPhysicalMaterial({
        color:0x6c5549,roughness:.31,metalness:.015,
        clearcoat:.42,clearcoatRoughness:.17,
        emissive:0x2b120a,emissiveIntensity:.025,
        envMapIntensity:1.28,specularIntensity:.70,specularColor:new T.Color(0xf2d8c7),
        transparent:true,opacity:0,flatShading:true
      });
      this.guardianAnatomy=new T.Group();
      this.guardianParts=[];
      const facetDetail=this.lowPowerProfile?1:2;
      const facetGeo=new T.IcosahedronGeometry(1,facetDetail);
      const addFacet=(name,pos,scale,rot=[0,0,0],warm=false)=>{
        const mesh=new T.Mesh(facetGeo.clone(),warm?this.guardianGoldMaterial:this.guardianPlateMaterial);
        mesh.name=name;
        mesh.position.set(...pos);
        mesh.scale.set(...scale);
        mesh.rotation.set(...rot);
        mesh.userData.baseScale=mesh.scale.clone();
        mesh.userData.phase=r()*Math.PI*2;
        this.guardianAnatomy.add(mesh);
        this.guardianParts.push(mesh);
        return mesh;
      };
      addFacet('upperLeft',[-.36,.34,.02],[.30,.42,.24],[.05,.08,.30]);
      addFacet('upperRight',[.38,.28,.04],[.33,.38,.26],[-.03,-.08,-.27]);
      addFacet('lowerLeft',[-.31,-.33,.00],[.28,.36,.22],[-.04,.05,-.22]);
      addFacet('lowerRight',[.34,-.38,.03],[.27,.34,.23],[.04,-.05,.25]);
      addFacet('crown',[-.06,.69,-.03],[.24,.42,.19],[0,.08,.08]);
      addFacet('root',[.03,-.70,-.02],[.22,.38,.18],[0,-.06,-.06],true);

      const livingCrystalMembraneMaterial=new T.MeshPhysicalMaterial({
        color:0x829da0,roughness:.20,metalness:0,
        clearcoat:.72,clearcoatRoughness:.075,
        transmission:.34,thickness:.065,ior:1.38,
        emissive:0x05252d,emissiveIntensity:.036,
        transparent:true,opacity:0,depthWrite:false,
        side:T.DoubleSide
      });
      this.guardianMembraneMaterial=livingCrystalMembraneMaterial;
      const livingCrystalMembraneShape=new T.Shape();
      livingCrystalMembraneShape.moveTo(0,0);
      livingCrystalMembraneShape.bezierCurveTo(.16,.10,.27,.32,.08,.62);
      livingCrystalMembraneShape.bezierCurveTo(-.06,.42,-.15,.18,0,0);
      const livingCrystalMembraneGeo=new T.ShapeGeometry(livingCrystalMembraneShape,12);
      const membraneDefs=[
        [-.28,.63,.00,-.62,1.00,.72],
        [ .25,.65,.02,.58,1.00,.68],
        [-.52,.18,-.06,-1.10,.90,.62],
        [ .52,.14,-.05,1.08,.92,.62],
        [-.36,-.50,-.04,-2.38,.82,.58],
        [ .34,-.52,-.03,2.34,.82,.58]
      ];
      this.guardianMembranes=[];
      membraneDefs.forEach((d,index)=>{
        const m=new T.Mesh(livingCrystalMembraneGeo.clone(),livingCrystalMembraneMaterial);
        m.position.set(d[0],d[1],d[2]);
        m.rotation.z=d[3];
        m.scale.set(d[4],d[5],1);
        m.userData.baseScale=m.scale.clone();
        m.userData.phase=index*.87+r();
        this.guardianAnatomy.add(m);
        this.guardianMembranes.push(m);
      });
      this.guardianAnatomy.rotation.y=-.04;
      this.organicGroup.add(this.guardianAnatomy);

      this.organicFoldMaterial=new T.MeshPhysicalMaterial({
        color:0x0b1113,roughness:.58,metalness:.002,
        emissive:0x020506,emissiveIntensity:.004,
        transparent:true,opacity:0,depthWrite:true
      });
      this.organicFoldGlowMaterial=new T.MeshBasicMaterial({
        color:0x88c4c8,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.organicFolds=new T.Group();

      const frontRadius=1.355;
      for(let i=0;i<10;i++){
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
        const radius=.012+r()*.003;
        const fold=new T.Mesh(
          new T.TubeGeometry(curve,34,radius,7,false),
          this.organicFoldMaterial
        );
        const glow=new T.Mesh(
          new T.TubeGeometry(curve,32,.0028+r()*.0011,5,false),
          this.organicFoldGlowMaterial
        );
        fold.userData.phase=phase;
        glow.userData.phase=phase;
        this.organicFolds.add(fold,glow);
      }
      this.organicGroup.add(this.organicFolds);;;

      this.organicVeinMaterial=new T.MeshBasicMaterial({
        color:0x6f8e91,transparent:true,opacity:0,
        depthWrite:false,depthTest:true,blending:T.AdditiveBlending
      });
      this.organicVeins=[];
      const surfacePoint=(a,p,rr=1.385)=>new T.Vector3(
        Math.sin(p)*Math.sin(a)*rr,
        Math.cos(p)*rr,
        Math.sin(p)*Math.cos(a)*rr*.735+.055
      );
      for(let i=0;i<14;i++){
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
          new T.TubeGeometry(curve,32,.007+r()*.0028,6,false),
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
            new T.TubeGeometry(new T.QuadraticBezierCurve3(end,bmid,branchEnd),20,.004+r()*.0016,5,false),
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

      this.organicGroup.scale.setScalar(.001);
    }

    makeCellularLayer(){
      const T=this.THREE,r=this.rand;
      this.cellMaterial=new T.MeshPhysicalMaterial({
        color:0x0b1524,roughness:.40,metalness:.001,
        emissive:0x06314a,emissiveIntensity:.24,
        clearcoat:.26,clearcoatRoughness:.26,
        sheen:.20,sheenColor:new T.Color(0x3c9db8),sheenRoughness:.44,
        transparent:true,opacity:0
      });
      this.cellEdgeMaterial=new T.MeshBasicMaterial({
        color:0x65cbdc,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      const blobGeo=new T.IcosahedronGeometry(.090,2);
      const edgeGeo=new T.IcosahedronGeometry(.093,1);
      this.cells=[];
      const count=this.lowPowerProfile?16:(this.mobileProfile?24:36);
      const tissueAnchors=[
        {c:[-.18,.02,0],r:[.88,.54,.56],w:5},
        {c:[.34,.27,.02],r:[.34,.29,.28],w:3},
        {c:[.48,.47,.01],r:[.23,.34,.22],w:2},
        {c:[.73,.66,.04],r:[.30,.23,.24],w:3}
      ];
      const weighted=[];
      tissueAnchors.forEach((a,index)=>{for(let k=0;k<a.w;k++)weighted.push(index);});
      for(let i=0;i<count;i++){
        const anchor=tissueAnchors[weighted[i%weighted.length]];
        const phi=Math.acos(1-2*((i+.5)/count));
        const theta=Math.PI*(1+Math.sqrt(5))*i;
        const nx=Math.sin(phi)*Math.cos(theta);
        const ny=Math.cos(phi);
        const nz=Math.sin(phi)*Math.sin(theta);
        const jitter=.92+r()*.12;
        const g=new T.Group();
        const b=new T.Mesh(blobGeo,this.cellMaterial);
        const e=new T.Mesh(edgeGeo,this.cellEdgeMaterial);
        g.add(b,e);
        g.position.set(
          anchor.c[0]+nx*anchor.r[0]*jitter,
          anchor.c[1]+ny*anchor.r[1]*jitter,
          anchor.c[2]+nz*anchor.r[2]*jitter
        );
        const sc=.58+r()*.22;
        const sx=sc*(.44+r()*.22);
        const sy=sc*(.88+r()*.32);
        const sz=sc*(.48+r()*.24);
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
      for(let i=0;i<64;i++){
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

    makeMineralRoughnessTexture(){
      const T=this.THREE;
      const c=document.createElement('canvas');
      c.width=c.height=128;
      const x=c.getContext('2d');
      const image=x.createImageData(128,128);
      const data=image.data;
      for(let i=0;i<128*128;i++){
        const grain=.64+this.rand()*.28;
        const value=Math.max(0,Math.min(255,Math.round(grain*255)));
        const p=i*4;
        data[p]=value;data[p+1]=value;data[p+2]=value;data[p+3]=255;
      }
      x.putImageData(image,0,0);
      x.globalAlpha=.13;
      x.strokeStyle='#202020';
      for(let i=0;i<18;i++){
        const y=this.rand()*128;
        x.lineWidth=.35+this.rand()*.7;
        x.beginPath();
        x.moveTo(-8,y);
        x.lineTo(136,y+(this.rand()-.5)*12);
        x.stroke();
      }
      x.globalAlpha=1;
      const texture=new T.CanvasTexture(c);
      texture.wrapS=texture.wrapT=T.RepeatWrapping;
      texture.repeat.set(2.35,2.85);
      texture.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy?.()||1);
      return texture;
    }

    makeMechanicalLayer(){
      const T=this.THREE;
      const mineralRoughness=this.makeMineralRoughnessTexture();
      this.mineralRoughnessTexture=mineralRoughness;
      this.mechMaterial=new T.MeshPhysicalMaterial({
        color:0x202b2e,metalness:.035,roughness:.17,
        emissive:0x000101,emissiveIntensity:.001,
        clearcoat:.84,clearcoatRoughness:.070,
        envMapIntensity:2.05,flatShading:false,transparent:true,opacity:0,
        ior:1.50,specularIntensity:.96,specularColor:new T.Color(0xc9d0cd)
      });
      this.mechMidMaterial=new T.MeshPhysicalMaterial({
        color:0x2b3639,metalness:.16,roughness:.22,
        clearcoat:.64,clearcoatRoughness:.11,transparent:true,opacity:0
      });
      this.silverMaterial=new T.MeshPhysicalMaterial({
        color:0x69777a,metalness:.62,roughness:.27,
        clearcoat:.24,clearcoatRoughness:.22,transparent:true,opacity:0
      });
      this.crownMaterial=this.silverMaterial.clone();
      for(const material of [this.mechMaterial,this.mechMidMaterial,this.silverMaterial,this.crownMaterial]){
        material.roughnessMap=mineralRoughness;
        if(this.highDetail||this.deterministicFrame){material.bumpMap=mineralRoughness;material.bumpScale=.0032;}
        material.needsUpdate=true;
      }
      this.mechEdgeMaterial=new T.LineBasicMaterial({transparent:true,opacity:0});
      this.plates=[];this.silverParts=[];this.mechBodyParts=[];this.mechPetals=[];

      const bodyGeo=new T.IcosahedronGeometry(
        1.0,
        this.deterministicFrame?4:(this.lowPowerProfile||this.mobileProfile?2:3)
      );
      const bp=bodyGeo.attributes.position;
      const pv=new T.Vector3();
      for(let i=0;i<bp.count;i++){
        pv.fromBufferAttribute(bp,i);
        const n=pv.clone().normalize();
        const a=Math.atan2(n.z,n.x);
        const geological=
          1+
          Math.sin(a*2.75+n.y*1.8)*.080+
          Math.cos(a*4.25-n.y*2.6)*.050+
          Math.sin(a*1.65+n.y*5.0)*.030;
        pv.multiplyScalar(geological);
        pv.x*=.58;
        pv.y*=.76;
        pv.z*=.43;
        pv.x+=.080*n.y-.045*Math.sin(a*1.8);
        pv.z+=.032*Math.cos(a*2.7+n.y*1.3);
        pv.y+=Math.pow(Math.max(n.y,0),2.7)*.110-Math.pow(Math.max(-n.y,0),2.1)*.060;
        if(n.x>.58&&n.y>.04)pv.x+=.045;
        if(n.x<-.52&&n.y<.28)pv.x-=.055;
        if(n.y<-.62)pv.y+=.055;
        bp.setXYZ(i,pv.x,pv.y,pv.z);
      }
      bodyGeo.computeVertexNormals();
      this.mechBody=new T.Mesh(bodyGeo,this.mechMaterial);
      this.mechanicalGroup.add(this.mechBody);
      this.mechBodyParts.push(this.mechBody);

      this.mechPetalMaterial=new T.MeshPhysicalMaterial({
        color:0x171d20,metalness:.09,roughness:.26,
        emissive:0x000000,emissiveIntensity:0,
        clearcoat:.54,clearcoatRoughness:.14,
        envMapIntensity:1.48,transparent:true,opacity:0
      });
      const petalShape=new T.Shape();
      petalShape.moveTo(0,-.16);
      petalShape.bezierCurveTo(.18,.10,.46,.55,0,1.04);
      petalShape.bezierCurveTo(-.46,.55,-.18,.10,0,-.16);
      const petalGeo=new T.ExtrudeGeometry(petalShape,{
        depth:.12,bevelEnabled:true,bevelSegments:4,steps:1,
        bevelSize:.026,bevelThickness:.034,curveSegments:24
      });
      petalGeo.center();
      const petalDefs=[
        [0,.17,.60,0,.96,.98,-.070,0],
        [.17,0,.60,-Math.PI/2,.96,.98,0,.070],
        [0,-.17,.60,Math.PI,.96,.98,.070,0],
        [-.17,0,.60,Math.PI/2,.96,.98,0,-.070]
      ];
      for(const [x,y,z,rz,sx,sy,rx,ry] of petalDefs){
        const p=new T.Mesh(petalGeo,this.mechPetalMaterial);
        p.position.set(x,y,z);
        p.rotation.set(rx,ry,rz);
        p.scale.set(sx,sy,.88);
        p.userData.baseRz=rz;p.userData.baseRx=rx;p.userData.baseRy=ry;
        this.mechanicalGroup.add(p);this.mechPetals.push(p);
      }

      this.mechCradle=new T.Object3D();this.mechCradle.visible=false;this.mechanicalGroup.add(this.mechCradle);
      this.seamMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0});this.seams=[];

      this.mechSocketBack=new T.Mesh(
        new T.CircleGeometry(.205,64),
        new T.MeshPhysicalMaterial({
          color:0x03070a,metalness:.52,roughness:.30,
          clearcoat:.30,clearcoatRoughness:.18,side:T.DoubleSide,
          transparent:true,opacity:0
        })
      );
      this.mechSocketBack.position.z=.690;
      this.mechanicalGroup.add(this.mechSocketBack);

      this.mechInnerMaterial=new T.MeshPhysicalMaterial({
        color:0x343f42,metalness:.58,roughness:.29,
        emissive:0x010203,emissiveIntensity:.004,
        clearcoat:.28,clearcoatRoughness:.18,
        transparent:true,opacity:0,depthWrite:true
      });
      this.mechInnerRing=new T.Mesh(new T.TorusGeometry(.154,.010,12,72),this.mechInnerMaterial);
      this.mechInnerRing.position.z=.716;
      this.mechanicalGroup.add(this.mechInnerRing);

      this.mechEnergyMaterial=new T.MeshPhysicalMaterial({
        color:0x22383b,metalness:0,roughness:.060,
        emissive:0x010304,emissiveIntensity:.010,
        clearcoat:1,clearcoatRoughness:.024,
        transmission:.28,thickness:.24,ior:1.49,
        attenuationColor:new T.Color(0x143239),attenuationDistance:.64,
        envMapIntensity:1.76,
        transparent:true,opacity:0,depthWrite:false
      });
      this.mechEyeCore=new T.Mesh(new T.SphereGeometry(.150,48,28),this.mechEnergyMaterial);
      this.mechEyeCore.scale.set(1,1,.46);
      this.mechEyeCore.position.z=.748;
      this.mechanicalGroup.add(this.mechEyeCore);

      this.mechAperture=new T.Mesh(
        new T.CircleGeometry(.052,72),
        new T.MeshPhysicalMaterial({color:0x010305,metalness:.04,roughness:.10,clearcoat:.9,clearcoatRoughness:.05,side:T.DoubleSide,transparent:true,opacity:0})
      );
      this.mechAperture.position.z=.800;
      this.mechanicalGroup.add(this.mechAperture);

      this.mechRibMaterial=this.mechInnerMaterial.clone();
      this.mechRibs=[];
      this.mechFissureBranches=[];
      this.mechEyeCorona=new T.Sprite(new T.SpriteMaterial({
        map:this.makeGlowTexture(),color:0x8cc6ce,
        transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending
      }));
      this.mechEyeCorona.scale.set(.34,.34,1);
      this.mechEyeCorona.position.z=.70;
      this.mechanicalGroup.add(this.mechEyeCorona);

      this.mechLight=new T.PointLight(0x7fc7d1,0,2.8,2);
      this.mechLight.position.set(0,0,.92);
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

    makeTentacles(){
      const T=this.THREE,r=this.rand;
      this.tentacleMaterial=new T.MeshPhysicalMaterial({
        color:0x124f69,metalness:.002,roughness:.105,
        emissive:0x087fa7,emissiveIntensity:.42,
        clearcoat:.92,clearcoatRoughness:.038,
        transmission:.52,thickness:.16,ior:1.36,
        attenuationColor:new T.Color(0x157da0),attenuationDistance:.74,
        sheen:.30,sheenColor:new T.Color(0xb9f6ff),sheenRoughness:.22,
        transparent:true,opacity:0,depthWrite:false,
        envMapIntensity:1.72
      });
      this.tentacleEdgeMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0});
      this.tentacleNodeMaterial=new T.PointsMaterial({transparent:true,opacity:0});
      this.tentacleGlowMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0});
      this.tentacleDashMaterial=new T.LineDashedMaterial({transparent:true,opacity:0});
      this.tentacles=[];
      const count=this.lowPowerProfile?4:(this.mobileProfile?7:10);
      const tendrilSegments=this.lowPowerProfile?18:(this.mobileProfile?30:48);
      const tendrilRadial=this.lowPowerProfile?5:(this.mobileProfile?6:7);
      for(let i=0;i<count;i++){
        const lane=(i-(count-1)*.5)/Math.max(1,count-1);
        const len=1.20+r()*.64;
        const phase=r()*Math.PI*2;
        const pts=[];
        for(let j=0;j<11;j++){
          const u=j/10;
          const wave=Math.sin(u*Math.PI*1.65+phase)*(.04+.17*u);
          const rise=Math.sin(u*Math.PI*.92+phase*.55)*(.03+.12*u);
          pts.push(new T.Vector3(
            -.56-len*u-.24*u*u,
            .10+lane*.72+rise+wave*.25,
            -.05+Math.sin(u*Math.PI+phase)*(.035+.13*u)+wave
          ));
        }
        const curve=new T.CatmullRomCurve3(pts,false,'centripetal');
        const geo=this.createTaperedTube(curve,tendrilSegments,tendrilRadial,.044+r()*.006,.0055+r()*.0012);
        const mesh=new T.Mesh(geo,this.tentacleMaterial);
        const g=new T.Group();g.add(mesh);g.scale.setScalar(.001);g.userData.phase=phase;
        this.tentacleGroup.add(g);this.tentacles.push(g);
      }
    }

    resize(){
      if(this.disposed)return;
      this.width=Math.max(1,innerWidth);
      this.height=Math.max(1,innerHeight);
      const dpr=this.deterministicFrame
        ? Math.min(devicePixelRatio||1,1.00)
        : this.softwareRenderer
          ? Math.min(devicePixelRatio||1,this.width<900 ? Math.max(.82,.98*this.qualityScale) : Math.max(.70,.90*this.qualityScale))
          : Math.min(
              devicePixelRatio||1,
              (this.mobileProfile?2.15:1.72)*this.qualityScale
            );
      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(this.width,this.height,false);
      this.camera.aspect=this.width/this.height;
      const portrait=this.camera.aspect<1;
      this.camera.fov=portrait?51:42;
      this.camera.updateProjectionMatrix();
    }

    interact(detail={}){
      if(this.disposed)return;
      const clampInput=v=>Math.max(-1,Math.min(1,Number(v)||0));
      const kind=String(detail.kind||detail.phase||'pulse');
      const strength=Math.max(0,Math.min(1.5,Number(detail.strength)||.35));
      const nextX=clampInput(detail.x);
      const nextY=clampInput(detail.y);
      const dx=Number.isFinite(Number(detail.dx))?Number(detail.dx):(nextX-this.interactionTargetX)*120;
      const dy=Number.isFinite(Number(detail.dy))?Number(detail.dy):(nextY-this.interactionTargetY)*120;
      this.interactionVelocityX=Math.max(-1,Math.min(1,dx/180));
      this.interactionVelocityY=Math.max(-1,Math.min(1,dy/180));
      this.interactionTargetX=nextX;
      this.interactionTargetY=nextY;
      this.interactionImpulse=Math.max(this.interactionImpulse,strength);
      this.interactionScroll=Math.max(-1,Math.min(1,(Number(detail.dy)||0)/140));
      this.interactionSpin+=this.interactionVelocityX*.018+(kind==='wheel'?this.interactionScroll*.025:0);
      if(/press|down|touch|drag/.test(kind))this.interactionPress=Math.max(this.interactionPress,strength);
      if(/release|cancel/.test(kind))this.interactionPress=Math.min(this.interactionPress,.18);
      if(/menu|language|scene|section|story|question|response|download|loop|focus|key|system/.test(kind)){
        this.interactionSemantic=Math.max(this.interactionSemantic,strength);
      }
      this.interactionKind=kind;
      /* R1701 — all input classes share one physical response state. No extra
         renderer, HUD animation or secondary RAF is created by interaction. */
      document.documentElement.dataset.fxMagBirthInteractionR1690=kind;
      document.documentElement.dataset.fxMagBirthInteractionR1695='inertial-camera-light-lens-material-response';
      document.documentElement.dataset.fxMagBirthInteractionR1701='pointer-touch-drag-scroll-wheel-click-key-focus-menu-language-scene-system-physical-response';
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
      const fade=1-smooth((t-2.76)/.46);
      const intro=ease(t/.42);
      this.dnaGroup.visible=fade>.002;
      this.dnas.forEach((h,i)=>{
        const b=h.userData.base;
        const fly=1-intro;
        h.position.x=b.x*(1+fly*.38);
        h.position.y=b.y*(1+fly*.34);
        h.position.z=b.z+fly*.54;
        h.rotation.x=b.rx+Math.sin(time*.00032+b.phase)*.040;
        h.rotation.y=b.ry+Math.sin(time*.00027+b.phase)*.055;
        h.rotation.z=b.rz+time*.000036*(i%2?1:-1);
        h.scale.setScalar(b.s*(.95+.05*intro));
        const bases=h.userData.baseOpacity||[];
        h.userData.materials.forEach((m,mi)=>{
          m.opacity=(bases[mi]??.5)*fade*intro*.84;
        });
      });
    }

    updateCore(t,time){
      const birth=smooth((t-.12)/.72);
      const seedHandoff=smooth((t-2.18)/.82);
      const coreLife=birth;
      const seedShellLife=birth*(1-seedHandoff*.94);
      let sc=.001;
      if(t<.12)sc=.001;
      else if(t<1.10)sc=mix(.42,.72,ease((t-.12)/.98));
      else if(t<5.90)sc=.72+Math.sin(time*.0010)*.004;
      else sc=mix(.72,.56,smooth((t-5.90)/1.40));

      const endMove=smooth((t-9.78)/.20);
      const target=this.targetWorld();
      const tx=target.x*endMove,ty=target.y*endMove;
      const chestEmbed=smooth((t-3.10)/1.55);
      this.coreGroup.visible=coreLife>.002;
      this.coreGroup.position.set(tx+.16*chestEmbed,ty+.045*chestEmbed,.42+.12*chestEmbed);
      this.organicGroup.position.set(tx,ty,0);
      this.cellGroup.position.set(tx,ty,0);
      this.mechanicalGroup.position.set(tx,ty,.02);
      this.tentacleGroup.position.set(tx,ty,-.04);
      this.coreGroup.scale.setScalar(sc*mix(1,.90,endMove));
      this.coreGroup.rotation.y=Math.sin(time*.00016)*.012+this.interactionX*.030+this.interactionSpin;
      this.coreGroup.rotation.x=Math.sin(time*.00019)*.008-this.interactionY*.022;

      const irisAwake=smooth((t-.70)/.80)*coreLife;
      const pulse=.988+.012*Math.sin(time*.0042);
      this.coreShell.material.opacity=.82*seedShellLife;
      this.coreGlass.material.opacity=.030*seedShellLife;
      if(this.corePetalMaterial)this.corePetalMaterial.opacity=0;
      this.irisGroup.visible=coreLife>.005;
      this.irisGroup.scale.setScalar((.84+irisAwake*.05)*pulse);
      if(this.irisCorona)this.irisCorona.material.opacity=.030*coreLife+.050*irisAwake;
      this.glowSprite.material.opacity=(.012*coreLife+.028*irisAwake)*pulse;
      this.glowSprite.scale.setScalar(.66+irisAwake*.08+this.interactionImpulse*.025);
      this.coreInner.material.opacity=.022*coreLife+.044*irisAwake;
      this.coreLight.intensity=.28*coreLife+irisAwake*.64+this.interactionImpulse*.16;
      if(this.coreLabel)this.coreLabel.material.opacity=0;
    }

    updateOrganic(t,time){
      const grow=smooth((t-2.20)/.88);
      const maturity=smooth((t-5.60)/1.45);
      const visible=grow;
      this.organicGroup.visible=visible>.002;
      const bodyScale=.001+visible*.999;
      this.organicGroup.scale.set(bodyScale*.84,bodyScale*.84,bodyScale*.84);

      this.organicShellMaterial.opacity=(.36+.08*maturity)*visible;
      this.organicLobeMaterial.opacity=(.14+.08*maturity)*visible;
      if(this.organicMembraneMaterial)this.organicMembraneMaterial.opacity=(.12+.07*maturity)*visible;
      this.organicWireMaterial.opacity=0;
      this.organicVeinMaterial.opacity=(.12+.12*maturity)*visible;
      this.organicHoodMaterial.opacity=0;
      if(this.organicFoldMaterial)this.organicFoldMaterial.opacity=.075*visible;
      if(this.organicFoldGlowMaterial)this.organicFoldGlowMaterial.opacity=.003*visible;
      if(this.organicHoodGroup){this.organicHoodGroup.visible=false;this.organicHoodGroup.scale.setScalar(.001);}
      this.organicShell.rotation.y=Math.sin(time*.00014)*.010+this.interactionX*.022;
      this.organicShell.rotation.x=Math.sin(time*.00016)*.006-this.interactionY*.016;
      const shellBase=this.organicShell.userData.baseScale;
      const shellPulse=1+this.interactionImpulse*.006+Math.sin(time*.0012)*.006;
      if(shellBase)this.organicShell.scale.set(shellBase.x*shellPulse,shellBase.y*shellPulse,shellBase.z*shellPulse);
      if(this.organicMembrane){
        this.organicMembrane.rotation.copy(this.organicShell.rotation);
        const mb=this.organicMembrane.userData.baseScale;
        if(mb)this.organicMembrane.scale.set(mb.x*shellPulse,mb.y*shellPulse,mb.z*shellPulse);
      }
      if(this.guardianAnatomy){
        this.guardianAnatomy.visible=visible>.002;
        this.guardianAnatomy.rotation.y=-.04+Math.sin(time*.00018)*.016+this.interactionX*.042;
        this.guardianAnatomy.rotation.x=Math.sin(time*.00015)*.010-this.interactionY*.028;
        this.guardianAnatomy.rotation.z=Math.sin(time*.00012)*.007+this.interactionSpin*.16;
        this.guardianParts?.forEach((part,i)=>{
          const base=part.userData.baseScale;
          const q=1+Math.sin(time*.0010+part.userData.phase+i*.31)*(.010+.008*maturity)+this.interactionImpulse*.010;
          if(base)part.scale.set(base.x*q,base.y*q,base.z*q);
        });
        this.guardianMembranes?.forEach((membrane,i)=>{
          const base=membrane.userData.baseScale;
          const q=1+Math.sin(time*.0014+membrane.userData.phase+i*.47)*(.018+.010*maturity)+this.interactionImpulse*.018;
          if(base)membrane.scale.set(base.x*q,base.y*q,1);
        });
      }
      if(this.guardianPlateMaterial)this.guardianPlateMaterial.opacity=(.66+.18*maturity)*visible;
      if(this.guardianGoldMaterial)this.guardianGoldMaterial.opacity=(.07+.05*maturity)*visible;
      if(this.guardianMembraneMaterial)this.guardianMembraneMaterial.opacity=(.16+.10*maturity)*visible;
      this.organicLobes.forEach((lobe,i)=>{
        const q=1+Math.sin(time*.00082+lobe.userData.phase)*.018*visible;
        const b=lobe.userData.baseScale;
        if(b)lobe.scale.set(b.x*q,b.y*q,b.z*q);
        lobe.rotation.y+=.00005*(i%2?1:-1);
      });
      if(this.organicPrimaryVeinMaterial)this.organicPrimaryVeinMaterial.opacity=(.12+.14*maturity)*visible;
      if(this.organicFolds){
        this.organicFolds.rotation.y=Math.sin(time*.00012)*.008;
        this.organicFolds.rotation.x=Math.sin(time*.00010)*.004;
      }
    }

    updateCells(t,time){
      const grow=smooth((t-3.10)/1.20);
      const awake=smooth((t-5.35)/1.35);
      const visible=grow;
      this.cellGroup.visible=visible>.002;
      const base=.001+visible*.999;
      this.cellGroup.scale.setScalar(base*.96);
      this.cellMaterial.opacity=(.10+.12*awake)*visible;
      this.cellEdgeMaterial.opacity=(.025+.035*awake)*visible;
      this.cellVeinMaterial.opacity=(.20+.30*awake)*visible;
      this.cells.forEach((g,i)=>{
        const breath=1+Math.sin(time*.00125+g.userData.phase)*(.018+.012*awake);
        const b=g.userData.baseScale;
        if(b)g.scale.set(b.x*breath,b.y*breath,b.z*breath);
        g.rotation.y+=.00006*(i%2?1:-1);
      });
      this.cellGroup.rotation.y=Math.sin(time*.00016)*.012+this.interactionX*.030;
      this.cellGroup.rotation.x=Math.sin(time*.00013)*.007-this.interactionY*.020;
    }

    updateMechanical(t,time){
      /* R1723 — no robotic/armoured handoff. The same cortical organism stays
         visible from birth to site handoff; the persistent coreGroup owns the
         energy organ, so the old mechanical shell is deliberately not painted. */
      this.mechanicalReveal=0;
      this.mechanicalGroup.visible=false;
      this.mechanicalGroup.scale.setScalar(.001);
      this.mechMaterial.opacity=0;
      this.mechMidMaterial.opacity=0;
      this.silverMaterial.opacity=0;
      if(this.crownMaterial)this.crownMaterial.opacity=0;
      if(this.mechPetalMaterial)this.mechPetalMaterial.opacity=0;
      this.mechEdgeMaterial.opacity=0;
      this.mechInnerMaterial.opacity=0;
      if(this.mechSocketBack?.material)this.mechSocketBack.material.opacity=0;
      if(this.mechEnergyMaterial)this.mechEnergyMaterial.opacity=0;
      if(this.mechAperture?.material)this.mechAperture.material.opacity=0;
      if(this.mechEyeCore?.material)this.mechEyeCore.material.opacity=0;
      if(this.seamMaterial)this.seamMaterial.opacity=0;
      if(this.mechInnerRing)this.mechInnerRing.visible=false;
      if(this.mechEyeCorona)this.mechEyeCorona.material.opacity=0;
      if(this.mechLight)this.mechLight.intensity=0;
    }

    updateTentacles(t,time){
      const grow=smooth((t-5.42)/1.05);
      const visible=grow;
      this.tentacleGroup.visible=visible>.002;
      this.tentacleMaterial.opacity=.82*visible;
      this.tentacleEdgeMaterial.opacity=0;
      this.tentacleNodeMaterial.opacity=0;
      if(this.tentacleGlowMaterial)this.tentacleGlowMaterial.opacity=0;
      if(this.tentacleDashMaterial)this.tentacleDashMaterial.opacity=0;
      this.tentacles.forEach((g,index)=>{
        const wave=1+Math.sin(time*.00056+g.userData.phase)*(.010+.008*this.interactionImpulse)*visible;
        const v=.001+visible*.999;
        g.scale.set(v*wave,v*wave,v*wave);
        g.rotation.z=Math.sin(time*.00030+g.userData.phase)*.022*visible
          +this.interactionY*.018*(.35+index/Math.max(1,this.tentacles.length));
        g.rotation.x=Math.sin(time*.00024+g.userData.phase)*.012*visible
          -this.interactionX*.015;
        g.rotation.y=this.interactionX*.020;
      });
    }

    updateCamera(t,time){
      const ix=this.interactionX,iy=this.interactionY;
      const impulse=this.interactionImpulse;
      let z=5.86,y=.012,x=0;
      if(t<2.70){
        const k=smooth(t/2.70);
        z=mix(5.98,5.70,k);
        x=Math.sin(time*.00027)*.028*(1-k*.35);
        y=.010+Math.sin(time*.00024)*.010;
      }else if(t<5.55){
        z=5.70+Math.sin(time*.00020)*.006;
        x=Math.sin(time*.00015)*.003;
        y=Math.cos(time*.00018)*.003;
      }else if(t<7.25){
        const k=smooth((t-5.55)/1.70);
        z=mix(5.70,5.18,k);
        y=mix(0,.002,k);
      }else if(t<9.10){
        z=5.18+Math.sin(time*.00018)*.006;
        y=.002;
      }else{
        z=mix(5.18,5.08,smooth((t-9.10)/.60));
        y=.002;
      }
      if(this.width<this.height)z+=.44;
      // Physical parallax: the camera moves millimetres, never like a HUD.
      x+=ix*(this.mobileProfile?.025:.055)*(1+.18*impulse);
      y+=iy*(this.mobileProfile?.018:.038)*(1+.14*impulse);
      z+=Math.abs(this.interactionScroll)*.018-this.interactionPress*.026-this.interactionSemantic*.010;
      this.camera.position.set(x,y,z);
      this.camera.lookAt(
        ix*.026+this.interactionVelocityX*.006,
        -iy*.020-this.interactionVelocityY*.005,
        0
      );
    }

    render(r,time){
      if(this.disposed)return;

      const responseEase=1-Math.exp(-Math.max(1,Math.min(34,time-(this.previousFrameTime||time-16.67)))*.020);
      this.interactionX+=(this.interactionTargetX-this.interactionX)*responseEase;
      this.interactionY+=(this.interactionTargetY-this.interactionY)*responseEase;
      this.interactionImpulse*=.955;
      this.interactionScroll*=.88;
      this.interactionSpin*=.91;
      this.interactionPress*=.88;
      this.interactionSemantic*=.92;
      this.interactionVelocityX*=.84;
      this.interactionVelocityY*=.84;

      /* R1701 — the entire photographed world responds with millimetre-scale
         inertia. This is scene-space parallax, not a UI transform. */
      this.world.position.x=this.interactionX*.012+this.interactionVelocityX*.006;
      this.world.position.y=-this.interactionY*.009-this.interactionVelocityY*.004;
      this.world.rotation.x=-this.interactionY*.004;
      this.world.rotation.y=this.interactionX*.006;
      this.scene.fog.density=.021+Math.min(1,this.interactionImpulse)*.00045;

      /* R1695 — physically plausible input response. Existing lights move by
         centimetres in scene-space and material parameters change only within
         subtle photographic ranges. This costs no extra draw calls. */
      const physicalImpulse=Math.min(1,this.interactionImpulse+this.interactionPress*.18+this.interactionSemantic*.12);
      if(this.keyLight){
        this.keyLight.position.x=-3.4+this.interactionX*.22;
        this.keyLight.position.y=4.9-this.interactionY*.14;
        this.keyLight.intensity=2.86+physicalImpulse*.12;
      }
      if(this.rimLight){
        this.rimLight.position.x=3.4-this.interactionX*.16;
        this.rimLight.position.y=-1.7+this.interactionY*.10;
        this.rimLight.intensity=(this.mobileProfile||this.lowPowerProfile?2.05:3.48)+physicalImpulse*.10;
      }
      if(this.softboxLight){
        this.softboxLight.position.x=-4.5+this.interactionX*.18;
        this.softboxLight.intensity=4.18+physicalImpulse*.14;
      }
      if(this.edgeSoftboxLight){
        this.edgeSoftboxLight.position.x=4.8-this.interactionX*.14;
        this.edgeSoftboxLight.intensity=2.62+physicalImpulse*.11;
      }
      if(this.introLensMaterial){
        this.introLensMaterial.roughness=.065+Math.abs(this.interactionY)*.010;
        this.introLensMaterial.clearcoatRoughness=.025+Math.abs(this.interactionX)*.008;
        this.introLensMaterial.envMapIntensity=1.62+physicalImpulse*.10;
      }
      if(this.mechEnergyMaterial){
        this.mechEnergyMaterial.roughness=.060+Math.abs(this.interactionY)*.009;
        this.mechEnergyMaterial.envMapIntensity=1.76+physicalImpulse*.11;
      }
      if(this.organicShellMaterial){
        this.organicShellMaterial.roughness=.29+Math.abs(this.interactionY)*.016;
        this.organicShellMaterial.clearcoatRoughness=.16+Math.abs(this.interactionX)*.010;
        this.organicShellMaterial.envMapIntensity=1.54+physicalImpulse*.07;
      }
      if(this.mechMaterial){
        this.mechMaterial.roughness=.18+Math.abs(this.interactionY)*.014;
        this.mechMaterial.clearcoatRoughness=.070+Math.abs(this.interactionX)*.008;
        this.mechMaterial.envMapIntensity=1.72+physicalImpulse*.10;
      }

      if(this.previousFrameTime>0){
        const interval=Math.max(1,Math.min(50,time-this.previousFrameTime));
        this.frameIntervalAverage=this.frameIntervalAverage*.86+interval*.14;
      }
      this.previousFrameTime=time;
      this.lastRender=time;
      const renderStarted=performance.now();
      const t=clamp(r)*10;
      this.updateCamera(t,time);
      if(t<3.34)this.updateDNA(t,time);
      else if(this.dnaGroup.visible)this.dnaGroup.visible=false;
      this.updateCore(t,time);
      if(t>1.86)this.updateOrganic(t,time);
      else if(this.organicGroup.visible)this.organicGroup.visible=false;
      if(t>3.00)this.updateCells(t,time);
      else if(this.cellGroup.visible)this.cellGroup.visible=false;
      if(t>5.00)this.updateMechanical(t,time);
      else if(this.mechanicalGroup.visible)this.mechanicalGroup.visible=false;
      if(t>4.95)this.updateTentacles(t,time);
      else if(this.tentacleGroup.visible)this.tentacleGroup.visible=false;

      if(this.chamber?.visible)this.chamber.rotation.z=Math.sin(time*.000025)*.0035;
      if(this.particles?.visible){
        this.particles.rotation.z=time*.000018;
        this.particles.rotation.y=time*.000012;
        this.particles.material.opacity=.31+.07*Math.sin(time*.00045);
      }
      if(this.debris?.visible){
        this.debris.rotation.y=time*.000018;
        this.debris.rotation.z=Math.sin(time*.00011)*.022;
      }

      const flash=smooth((t-9.05)/.11)*(1-smooth((t-9.58)/.24));
      const after=smooth((t-9.48)/.30);
      this.renderer.toneMappingExposure=1.24+flash*.075+after*.018+physicalImpulse*.009;
      this.coreLight.intensity+=flash*1.10+after*.18;
      if(this.glowSprite){
        const g=1+flash*.72;
        this.glowSprite.scale.multiplyScalar(g);
        this.glowSprite.material.opacity=Math.min(.88,this.glowSprite.material.opacity+flash*.34);
      }
      if(this.flashBurst){
        this.flashBurst.material.opacity=flash*.22;
        const burstScale=1.26+flash*.24;
        this.flashBurst.scale.set(burstScale,burstScale,1);
      }
      if(this.flashBeam){
        this.flashBeam.material.opacity=0;
        this.flashBeam.scale.x=1;
      }
      if(this.mechEyeCorona){
        const mechanicalReveal=this.mechanicalReveal||0;
        this.mechEyeCorona.material.opacity=Math.min(.12,mechanicalReveal*(.030+flash*.070));
        const q=.34+flash*.050;
        this.mechEyeCorona.scale.set(q,q,1);
      }
      if(this.mechLight)this.mechLight.intensity+=flash*.12*(this.mechanicalReveal||0);

      this.renderer.render(this.scene,this.camera);

      if(!this.deterministicFrame && !this.softwareRenderer){
        const renderCost=performance.now()-renderStarted;
        this.renderAverage=this.renderAverage
          ? this.renderAverage*.84+renderCost*.16
          : renderCost;
        this.renderPeak=Math.max(renderCost,this.renderPeak*.86);
        this.framePeak=Math.max(this.frameIntervalAverage,this.framePeak*.90);
        const panicFrame=this.frameIntervalAverage>16.75||renderCost>6.4||this.framePeak>17.05;
        if(panicFrame && time-this.lastQualityAdjust>18){
          const previous=this.qualityScale;
          this.qualityScale=Math.max(this.qualityFloor,this.qualityScale-(this.mobileProfile?(this.framePeak>20||renderCost>9?.10:.055):(this.framePeak>20||renderCost>9?.18:.10)));
          this.panicFrames=24;
          this.stableBudgetFrames=0;
          if(Math.abs(previous-this.qualityScale)>.001){
            this.lastQualityAdjust=time;
            this.resize();
            this.applyQualityTier();
            document.documentElement.dataset.fxMagBirthGovernorR1660='panic-lod-one-frame-spike';
          }
        }else if(time-this.lastQualityAdjust>120){
          const previous=this.qualityScale;
          /* R1660 — intro quality yields before cadence. One bad presentation
             frame immediately drops resolution/secondary detail, while recovery
             requires sustained headroom to avoid oscillation. */
          const framePressure=this.frameIntervalAverage>16.08||this.framePeak>16.55;
          const severeFramePressure=this.frameIntervalAverage>16.42||this.framePeak>17.05;
          const renderPressure=this.renderAverage>4.4||this.renderPeak>5.8;
          const severeRenderPressure=this.renderAverage>5.8||this.renderPeak>7.4;
          if(severeFramePressure||severeRenderPressure){
            this.qualityScale=Math.max(this.qualityFloor,this.qualityScale-(this.mobileProfile?.075:.16));
            this.stableBudgetFrames=0;
            this.panicFrames=Math.max(this.panicFrames,12);
          }else if(framePressure||renderPressure){
            this.qualityScale=Math.max(this.qualityFloor,this.qualityScale-(this.mobileProfile?.032:.075));
            this.stableBudgetFrames=0;
          }else{
            if(this.panicFrames>0)this.panicFrames-=1;
            else this.stableBudgetFrames+=1;
            if(this.stableBudgetFrames>360&&this.frameIntervalAverage<15.92&&this.renderAverage<3.4&&this.renderPeak<4.8){
              this.qualityScale=Math.min(this.qualityCeiling,this.qualityScale+.0015);
              this.stableBudgetFrames=0;
            }
          }
          if(Math.abs(previous-this.qualityScale)>.001){
            this.lastQualityAdjust=time;
            this.resize();
            this.applyQualityTier();
            document.documentElement.dataset.fxMagBirthGovernorR1627=
              this.qualityScale<previous?'hard-60fps-quality-first':'slow-quality-recovery';
            document.documentElement.dataset.fxMagBirthGovernorR1660=
              this.qualityScale<previous?'preemptive-frame-budget-shed':'guarded-quality-recovery';
          }
        }
        document.documentElement.dataset.fxMagBirthTargetFpsR1600='60';
        document.documentElement.dataset.fxMagBirthTargetFpsR1602='60-real-frame-budget';
        document.documentElement.dataset.fxMagBirthTargetFpsR1627='60fps-hard-budget-secondary-detail-first';
        document.documentElement.dataset.fxMagBirthTargetFpsR1640='60fps-priority-preemptive-quality-shedding';
        document.documentElement.dataset.fxMagBirthTargetFpsR1660='minimum-60fps-target-panic-lod-quality-before-cadence';
        document.documentElement.dataset.fxMagBirthPerformanceR1713='16-67ms-first-intro-quality-yields-before-cadence';
        document.documentElement.dataset.fxMagBirthRenderMsR1600=this.renderAverage.toFixed(2);
        document.documentElement.dataset.fxMagBirthRenderPeakR1627=this.renderPeak.toFixed(2);
        document.documentElement.dataset.fxMagBirthFramePeakR1627=this.framePeak.toFixed(2);
        document.documentElement.dataset.fxMagBirthFrameIntervalR1602=this.frameIntervalAverage.toFixed(2);
        document.documentElement.dataset.fxMagBirthMeasuredFpsR1602=String(Math.min(60,Math.round(1000/Math.max(16.67,this.frameIntervalAverage))));
        document.documentElement.dataset.fxMagBirthQualityScaleR1600=this.qualityScale.toFixed(2);
        document.documentElement.dataset.fxMagBirthEstimatedFpsR1600=String(
          Math.min(60,Math.max(1,Math.round(1000/Math.max(16.67,this.renderAverage))))
        );
      }

      if(this.deterministicFrame){
        /* R1557 visual proof must wait for SwiftShader/ANGLE to finish the real
           Three frame before Playwright captures it. Production never pays for
           this synchronization or readback. */
        const gl=this.renderer.getContext();
        try{gl.finish();}catch(_){}
        try{
          const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
          const px=new Uint8Array(4);
          let peak=0;
          for(const uv of [[.50,.50],[.38,.50],[.62,.50],[.50,.36],[.50,.64],[.30,.32],[.70,.32],[.30,.68],[.70,.68]]){
            gl.readPixels(
              Math.max(0,Math.min(w-1,Math.floor(w*uv[0]))),
              Math.max(0,Math.min(h-1,Math.floor(h*uv[1]))),
              1,1,gl.RGBA,gl.UNSIGNED_BYTE,px
            );
            peak=Math.max(peak,px[0],px[1],px[2]);
          }
          document.documentElement.dataset.fxMagBirthFramePeakR1557=String(peak);
          document.documentElement.dataset.fxMagBirthFrameR1557='render-finished-readback-complete';
        }catch(_){
          document.documentElement.dataset.fxMagBirthFrameR1557='render-finished-readback-unavailable';
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
      this.mineralRoughnessTexture?.dispose?.();
      this.organicSurfaceTexture?.dispose?.();
      this.studioEnvironment?.dispose?.();
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
      const params=new URLSearchParams(location.search);
      if(params.get('force2dintro')==='1'){
        document.documentElement.dataset.fxMagBirthR1360='explicit-r649-fallback';
        return null;
      }
      document.documentElement.dataset.fxMagBirthR1460='prefer-local-three-webgl-cinematic';
      const deterministicFrame=params.has('introframe');
      if(isSoftwareWebGL() && !deterministicFrame){
        document.documentElement.dataset.fxMagBirthR1545='software-webgl-reference-film-fallback';
        document.documentElement.dataset.fxMagBirthGpuR1545='software-fallback-no-continuous-three';
        return null;
      }
      loader ||= loadThree();
      const THREE=await loader;
      const engine=new FormatXGenesisThree(THREE,canvas,getTarget);
      return {
        resize:()=>engine.resize(),
        draw:(r,time)=>engine.render(r,time),
        interact:detail=>engine.interact(detail),
        destroy:()=>engine.destroy(),
        engine,
        minimumFrameMs: 16.67,
        targetFps:60,
        revision:'r1701-photoreal-whole-scene-inertia-all-input-60fps-quality-first'
      };
    }catch(error){
      console.error('FormatX R1360 genesis renderer failed:',error);
      document.documentElement.dataset.fxMagBirthR1360='fallback-r649';
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
  document.documentElement.dataset.fxMagBirthProofR1460='cinematic-three-dna-organic-cut-crystal-proof';
  document.documentElement.dataset.fxMagBirthProofR1470='cinematic-cortical-organic-to-obsidian-cut-crystal-proof';
  document.documentElement.dataset.fxMagBirthProofR1480='volumetric-dna-solid-cortex-realistic-obsidian-handoff';
  document.documentElement.dataset.fxMagBirthProofR1400='irregular-crystal-final-handoff';
  document.documentElement.dataset.fxMagBirthProofR1490='realistic-tunnel-solid-organism-obsidian-crystal-handoff';
  document.documentElement.dataset.fxMagBirthProofR1500='photoreal-closed-volume-obsidian-mineral-handoff';
  document.documentElement.dataset.fxMagBirthProofR1510='physical-lens-no-hud-rails-organic-tendrils-handoff';
  document.documentElement.dataset.fxMagBirthProofR1520='visible-irregular-obsidian-facets-no-orbit-ring-handoff';
  document.documentElement.dataset.fxMagBirthProofR1530='microtextured-obsidian-physical-studio-light-living-habitat-handoff';
  document.documentElement.dataset.fxMagBirthProofR1540='physical-bioceramic-organism-round-optic-ringless-habitat-crystal-handoff';
  document.documentElement.dataset.fxMagBirthProofR1572='single-bioceramic-seed-to-smoky-obsidian-no-lobe-cloud-no-eye-no-petal-hud';
  document.documentElement.dataset.fxMagBirthProofR1573='waist-corrected-single-seed-readable-volcanic-glass-material-fracture-no-central-flash';
  document.documentElement.dataset.fxMagBirthProofR1574='single-continuous-bioceramic-organism-rounded-irregular-volcanic-glass-no-dumbbell-no-diamond';
  document.documentElement.dataset.fxMagBirthProofR1575='opaque-bioceramic-seed-to-truncated-obsidian-crystal-no-translucent-lowpoly-shells';
  document.documentElement.dataset.fxMagBirthProofR1576='hand-cut-broad-facet-obsidian-final-act-matches-native-shard-no-pot';
  document.documentElement.dataset.fxMagBirthProofR1578='tall-seven-ring-obsidian-final-act-readable-studio-lit-no-egg';
  document.documentElement.dataset.fxMagBirthProofR1587='single-biogenic-shell-no-floating-orbs-readable-obsidian-subtle-fissure-no-eye';
  document.documentElement.dataset.fxMagBirthProofR1588='dark-wet-bioceramic-seed-natural-veins-to-polished-obsidian-cinematic-handoff';
  document.documentElement.dataset.fxMagBirthPerformanceR1541='superseded-by-r1600-adaptive-60fps';
  document.documentElement.dataset.fxMagBirthPerformanceR1600='60fps-target-adaptive-resolution-quality-first-frame-budget';
  document.documentElement.dataset.fxMagBirthPerformanceR1606='16-67ms-frame-budget-aggressive-adaptive-resolution';
  document.documentElement.dataset.fxMagBirthPerformanceR1617='preemptive-16-67ms-budget-secondary-detail-then-resolution';
  document.documentElement.dataset.fxMagBirthPerformanceR1620='60hz-ceiling-13ms-headroom-adaptive-resolution-secondary-detail-first';
  document.documentElement.dataset.fxMagBirthPerformanceR1627='hard-60fps-spike-guard-secondary-detail-resolution-before-cadence';
  document.documentElement.dataset.fxMagBirthPerformanceR1633='mobile-startup-lod-dna-organic-cells-tendrils-before-first-frame';
  document.documentElement.dataset.fxMagBirthPerformanceR1640='preemptive-60fps-governor-lower-start-resolution-fast-quality-shedding';
  document.documentElement.dataset.fxMagBirthPerformanceR1670='lower-start-resolution-mobile-geometry-lod-stable-60fps-headroom';
  document.documentElement.dataset.fxMagBirthPerformanceR1676='phase-gated-mobile-light-budget-preemptive-60fps-headroom';
  document.documentElement.dataset.fxMagBirthVisualR1672='brighter-photographic-material-response-subdued-physical-optic-no-extra-geometry';
  document.documentElement.dataset.fxMagBirthPerformanceR1547='hardware-three-software-reference-film-adaptive-cache-safe';
  document.documentElement.dataset.fxMagBirthProofR1554='deterministic-frame-buffer-retained-at-1x-for-real-visual-review';
  document.documentElement.dataset.fxMagBirthProofR1560='smooth-biogenic-shell-no-white-facet-overlay-obsidian-seed-handoff';
  document.documentElement.dataset.fxMagBirthProofR1557='double-render-gl-finish-and-readback-before-proof-ready';
  document.documentElement.dataset.fxMagBirthVisualR1555='smooth-indexed-volcanic-glass-mineral-fissure-no-circular-eye';
  document.documentElement.dataset.fxMagBirthVisualR1561='elongated-bioceramic-seed-to-smoky-crystal-no-orb-no-hud-readable-studio-light';
  document.documentElement.dataset.fxMagBirthVisualR1570='reference-three-act-dna-cellular-four-petal-mechanical-energy-core-tendrils';
  document.documentElement.dataset.fxMagBirthVisualR1563='rectangular-physical-habitat-dry-bioceramic-seed-readable-final-crystal-fading-roots';
  document.documentElement.dataset.fxMagBirthPerformanceR1545='hardware-three-software-reference-film-no-parallel-webgl';
  document.documentElement.dataset.fxMagBirthProofR1591='brighter-wet-bioceramic-readable-obsidian-broad-studio-reflection-organic-fissure';
  document.documentElement.dataset.fxMagBirthProofR1593='reference-video-dna-cellular-armored-iris-eight-tendril-cinematic-handoff';
  document.documentElement.dataset.fxMagBirthProofR1594='dense-cellular-shell-four-petal-armored-core-bright-physical-iris-eight-glass-tendrils';
  document.documentElement.dataset.fxMagBirthProofR1599='photographic-dark-chamber-floating-armored-core-glass-tendrils-scaled-reference-stage';
  document.documentElement.dataset.fxMagBirthProofR1412='vertical-asymmetric-crystal-final-handoff';
  document.documentElement.dataset.fxMagBirthProofR1580='photographic-bioceramic-seed-sculpted-obsidian-handoff-soft-studio-light';
  document.documentElement.dataset.fxMagBirthProofR1581='truncated-smooth-obsidian-no-box-reflections-bioceramic-handoff';
  document.documentElement.dataset.fxMagBirthProofR1582='scaled-bioceramic-seed-dark-habitat-slender-satin-obsidian-continuous-size-handoff';
  document.documentElement.dataset.fxMagBirthProofR1583='asymmetric-biogenic-seed-procedural-studio-environment-geological-obsidian-handoff-no-room-box';
  document.documentElement.dataset.fxMagBirthProofR1584='porous-biogenic-seed-surface-folds-hand-hewn-obsidian-crystal-larger-continuous-handoff';
  document.documentElement.dataset.fxMagBirthProofR1585='dna-to-cell-cluster-to-living-obsidian-energy-chamber-and-organic-rib-handoff';
  document.documentElement.dataset.fxMagBirthProofR1586='integrated-three-quarter-living-crystal-ribs-and-energy-chamber-reference-scale';
  document.documentElement.dataset.fxMagBirthProofR1607='single-asymmetric-obsidian-body-smoked-physical-dome-bioglass-tendrils-no-cgi-petals';
  document.documentElement.dataset.fxMagBirthProofR1609='hand-hewn-faceted-obsidian-wet-bioceramic-transition-dark-smoked-dome-no-eye-glow';
  document.documentElement.dataset.fxMagBirthProofR1612='neutral-wet-bioceramic-seed-handoff-natural-obsidian-reflection-smoked-dome-no-hud';
  document.documentElement.dataset.fxMagBirthProofR1430='real-three-solid-cortical-reference-dna-controlled-titanium';

  document.documentElement.dataset.fxMagBirthInteractionR1690='all-input-physical-response-single-render-loop';
  document.documentElement.dataset.fxMagBirthVisualR1691='physically-based-obsidian-bioceramic-glass-low-emission-natural-studio-response';
  document.documentElement.dataset.fxMagBirthVisualR1695='photoreal-physical-inertia-light-lens-response-all-input-single-loop';
  document.documentElement.dataset.fxMagBirthVisualR1702='photographic-exposure-readable-bioceramic-obsidian-physical-dna-dark-habitat';
  document.documentElement.dataset.fxMagBirthVisualR1701='photoreal-whole-scene-parallax-physical-material-response-no-hud';
  document.documentElement.dataset.fxMagBirthPerformanceR1701='quality-sheds-before-cadence-60fps-animation-target';
  window.FormatXMagGenesisThreeR1360={
    attach,
    revision:'r1701-physically-based-whole-scene-reactive-quality-first-60fps'
  };
})();