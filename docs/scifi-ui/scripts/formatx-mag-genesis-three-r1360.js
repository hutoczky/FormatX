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
      this.qualityScale=this.lowPowerProfile?.68:(this.mobileProfile?.78:.92);
      this.lastQualityAdjust=0;

      this.renderer=new THREE.WebGLRenderer({
        canvas,
        alpha:false,
        antialias:this.highDetail,
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
      this.renderer.setClearColor(0x020811,1);
      this.renderer.outputColorSpace=THREE.SRGBColorSpace;
      this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure=1.24;

      this.scene=new THREE.Scene();
      this.scene.background=new THREE.Color(0x010304);
      this.scene.fog=new THREE.FogExp2(0x010304,0.021);
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
      this.resize();
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
        [0,'rgba(235,244,240,.82)'],
        [.20,'rgba(188,208,205,.48)'],
        [.56,'rgba(70,92,94,.16)'],
        [1,'rgba(0,0,0,0)']
      ]);
      glow(570,188,90,190,[
        [0,'rgba(210,218,208,.46)'],
        [.24,'rgba(134,143,136,.22)'],
        [.62,'rgba(55,63,61,.08)'],
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
      this.scene.add(new T.HemisphereLight(0xc6d0cf,0x030405,0.58));
      const key=new T.DirectionalLight(0xfffbf3,3.45);
      key.position.set(-3.4,4.9,6.6);
      this.scene.add(key);
      const rim=new T.PointLight(0xb8cfd1,5.65,12,2);
      rim.position.set(3.4,-1.7,3.6);
      this.scene.add(rim);
      const bioticFill=new T.PointLight(0x6f6972,2.20,10,2);
      bioticFill.position.set(-2.7,-.9,2.8);
      this.scene.add(bioticFill);
      const warmBounce=new T.PointLight(0xc3a17e,.76,8,2);
      warmBounce.position.set(2.4,2.1,1.1);
      this.scene.add(warmBounce);

      const softbox=new T.SpotLight(0xf7f6ef,7.55,15,Math.PI*.34,.91,1.58);
      softbox.position.set(-4.5,5.6,6.2);
      softbox.target.position.set(.25,.12,0);
      this.scene.add(softbox,softbox.target);

      const edgeSoftbox=new T.SpotLight(0xa8bac0,4.75,13,Math.PI*.35,.92,1.68);
      edgeSoftbox.position.set(4.8,1.5,4.1);
      edgeSoftbox.target.position.set(-.18,-.08,.1);
      this.scene.add(edgeSoftbox,edgeSoftbox.target);
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
        color:0x03070a,metalness:.26,roughness:.62,
        emissive:0x01080a,emissiveIntensity:.075,
        clearcoat:.08,clearcoatRoughness:.58,
        side:T.BackSide
      });
      const panelMat=new T.MeshPhysicalMaterial({
        color:0x071014,metalness:.12,roughness:.78,
        emissive:0x010304,emissiveIntensity:.006,
        clearcoat:.02,clearcoatRoughness:.72,
        transparent:true,opacity:.095
      });
      const darkPanelMat=new T.MeshPhysicalMaterial({
        color:0x010203,metalness:.02,roughness:.95,
        emissive:0x000000,emissiveIntensity:0,
        transparent:true,opacity:.055
      });
      const lightMat=new T.MeshBasicMaterial({
        color:0xb5d3d4,transparent:true,opacity:.024,
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
          color:0x020405,metalness:.04,roughness:.82,
          clearcoat:.04,clearcoatRoughness:.72,
          transparent:true,opacity:.62,envMapIntensity:.28
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

      this.chamber=group;
      this.scene.add(group);
    }

    makeParticles(){
      const T=this.THREE,r=this.rand;
      const count=this.lowPowerProfile?72:(this.mobileProfile?108:144);
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
      const mesh=new T.InstancedMesh(geo,mat,8);
      const dummy=new T.Object3D();
      for(let i=0;i<8;i++){
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
      const seg=this.lowPowerProfile?44:(this.mobileProfile?56:68);
      const tubeRadial=this.lowPowerProfile?6:(this.mobileProfile?8:10);
      const auraRadial=this.lowPowerProfile?5:(this.mobileProfile?6:7);
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
        color:0x718689,emissive:0x030708,emissiveIntensity:.025,
        roughness:.38,metalness:.06,transparent:true,opacity:.90,
        depthWrite:true,clearcoat:.42,clearcoatRoughness:.24,
        transmission:.025,thickness:.14
      });
      const mb=new T.MeshPhysicalMaterial({
        color:0x625e69,emissive:0x040405,emissiveIntensity:.022,
        roughness:.40,metalness:.05,transparent:true,opacity:.88,
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
        color:0x98a7a9,emissive:0x030607,emissiveIntensity:.025,
        roughness:.48,metalness:.015,transparent:true,opacity:.68,depthWrite:true,
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

      const tubeA=new T.Mesh(new T.TubeGeometry(curveA,seg,.023,tubeRadial,false),ma);
      const tubeB=new T.Mesh(new T.TubeGeometry(curveB,seg,.023,tubeRadial,false),mb);
      const auraA=new T.Mesh(new T.TubeGeometry(curveA,seg,.029,auraRadial,false),ga);
      const auraB=new T.Mesh(new T.TubeGeometry(curveB,seg,.029,auraRadial,false),gb);

      const rungGeo=new T.CylinderGeometry(.0065,.0065,1,8,1,false);
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
      group.userData.baseOpacity=[.86,.84,.006,.005,.66,.12,.11];
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
      for(const [x,y,z,rz,sc,rx,ry] of placements){
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
        color:0x151c20,metalness:.34,roughness:.28,
        emissive:0x010304,emissiveIntensity:.008,
        clearcoat:.44,clearcoatRoughness:.16,
        envMapIntensity:1.34,transparent:true,opacity:.98
      });
      const shellGlass=new T.MeshPhysicalMaterial({
        color:0x435b61,metalness:.02,roughness:.13,
        transparent:true,opacity:.075,depthWrite:false,
        clearcoat:.98,clearcoatRoughness:.040,
        transmission:.08,thickness:.12,ior:1.43
      });

      const shape=new T.Shape();
      shape.moveTo(0,1.10);
      shape.bezierCurveTo(.12,.92,.31,.66,.42,.42);
      shape.bezierCurveTo(.56,.18,.72,.10,.80,0);
      shape.bezierCurveTo(.70,-.12,.53,-.24,.42,-.44);
      shape.bezierCurveTo(.28,-.70,.13,-.91,0,-1.05);
      shape.bezierCurveTo(-.13,-.91,-.28,-.70,-.42,-.44);
      shape.bezierCurveTo(-.53,-.24,-.70,-.12,-.80,0);
      shape.bezierCurveTo(-.72,.10,-.56,.18,-.42,.42);
      shape.bezierCurveTo(-.31,.66,-.12,.92,0,1.10);
      const extrude=new T.ExtrudeGeometry(shape,{
        depth:.24,bevelEnabled:true,bevelSegments:5,steps:1,
        bevelSize:.052,bevelThickness:.060,curveSegments:28
      });
      extrude.center();

      this.coreShell=new T.Mesh(extrude,shellMat);
      this.coreShell.scale.set(.82,.82,.92);
      this.coreGroup.add(this.coreShell);

      this.coreGlass=new T.Mesh(extrude.clone(),shellGlass);
      this.coreGlass.scale.set(.86,.86,.98);
      this.coreGlass.position.z=.055;
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
          color:0x04080b,metalness:.42,roughness:.34,
          clearcoat:.30,clearcoatRoughness:.22,
          transparent:true,opacity:.98,side:T.DoubleSide
        })
      );
      socketBack.position.z=.285;
      this.irisGroup.add(socketBack);

      const socketBezel=new T.Mesh(
        new T.TorusGeometry(.205,.025,18,112),
        new T.MeshPhysicalMaterial({
          color:0x5e6d72,metalness:.74,roughness:.26,
          clearcoat:.34,clearcoatRoughness:.16,
          emissive:0x010304,emissiveIntensity:.010
        })
      );
      socketBezel.position.z=.302;
      this.irisGroup.add(socketBezel);

      const lensMat=new T.MeshPhysicalMaterial({
        color:0x1e6574,metalness:.015,roughness:.075,
        clearcoat:1,clearcoatRoughness:.025,
        transmission:.13,thickness:.16,ior:1.46,
        emissive:0x073e4c,emissiveIntensity:.44,
        transparent:true,opacity:.97
      });
      const lens=new T.Mesh(new T.SphereGeometry(.142,72,42),lensMat);
      lens.scale.set(1,1,.30);
      lens.position.z=.337;
      this.irisGroup.add(lens);

      const aperture=new T.Mesh(
        new T.CircleGeometry(.052,72),
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
          color:0x9ddce2,metalness:.03,roughness:.08,
          clearcoat:1,clearcoatRoughness:.025,
          emissive:0x0d7184,emissiveIntensity:.26,
          transparent:true,opacity:.78
        })
      );
      glassRing.position.z=.376;
      this.irisGroup.add(glassRing);

      this.irisRays=new T.Object3D();
      this.irisGroup.add(this.irisRays);
      this.irisCorona=new T.Sprite(new T.SpriteMaterial({
        map:this.makeGlowTexture(),color:0x7aefff,
        transparent:true,opacity:.10,depthWrite:false,
        blending:T.AdditiveBlending
      }));
      this.irisCorona.scale.set(.62,.62,1);
      this.irisCorona.position.z=.305;
      this.irisGroup.add(this.irisCorona);
      this.coreGroup.add(this.irisGroup);

      this.glowSprite=new T.Sprite(new T.SpriteMaterial({
        map:this.makeGlowTexture(),color:0x64e6ff,
        transparent:true,opacity:.05,blending:T.AdditiveBlending,depthWrite:false
      }));
      this.glowSprite.scale.set(.86,.86,1);
      this.glowSprite.position.z=.29;
      this.coreGroup.add(this.glowSprite);

      this.coreInner=new T.Mesh(
        new T.IcosahedronGeometry(.105,2),
        new T.MeshBasicMaterial({
          color:0xb6f8ff,transparent:true,opacity:.10,
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
        color:0x211d2a,roughness:.46,metalness:.002,
        clearcoat:.24,clearcoatRoughness:.28,
        roughnessMap:organicSurface,bumpMap:organicSurface,bumpScale:.0064,
        transparent:true,opacity:0,
        emissive:0x10091a,emissiveIntensity:.045,
        envMapIntensity:.72,
        depthWrite:false
      });
      this.organicLobeMaterial=new T.MeshPhysicalMaterial({
        color:0x33243f,roughness:.43,metalness:.004,
        clearcoat:.22,clearcoatRoughness:.30,
        roughnessMap:organicSurface,bumpMap:organicSurface,bumpScale:.009,
        transparent:true,opacity:0,
        emissive:0x160b24,emissiveIntensity:.085,
        envMapIntensity:.58,
        depthWrite:true
      });
      this.organicWireMaterial=new T.MeshBasicMaterial({
        color:0x67ddea,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });

      const shellGeo=new T.SphereGeometry(1.38,this.deterministicFrame||this.highDetail?64:40,this.deterministicFrame||this.highDetail?40:26);
      const shellPos=shellGeo.attributes.position;
      for(let i=0;i<shellPos.count;i++){
        const p=new T.Vector3().fromBufferAttribute(shellPos,i);
        const n=p.clone().normalize();
        const az=Math.atan2(n.z,n.x), el=Math.acos(Math.max(-1,Math.min(1,n.y)));
        const fold=
          Math.sin(az*2.7+el*1.55)*.036+
          Math.sin(az*5.3-el*2.9)*.014+
          Math.cos(az*3.8+el*4.6)*.010;
        const asym=1+n.x*.026+n.y*.016-n.z*.010;
        p.multiplyScalar((1+fold)*asym);
        const taper=1.02-.16*Math.pow(Math.abs(n.y),.76);
        p.x*=.92*taper;
        p.y*=.97;
        p.z*=.82*(1.0-.05*Math.abs(n.y));
        p.x+=n.y*.040-n.z*.012;
        p.y+=n.x*.018+Math.pow(Math.max(n.y,0),4.0)*.018;
        p.z-=n.x*.012;
        const equator=Math.pow(Math.max(0,1-n.y*n.y),.72);
        const lobeA=Math.sin(az*3.0+el*.62)*.078*equator;
        const lobeB=Math.cos(az*2.0-el*.86)*.044*equator;
        const lobeC=Math.sin(az*1.35+el*2.10)*.024*equator;
        p.x*=1+lobeA*.66+lobeC*.34;
        p.z*=1-lobeA*.40+lobeB*.48;
        const sideDent=Math.pow(Math.max(0,Math.cos(az-.74)),4.0)*equator;
        const rearDent=Math.pow(Math.max(0,Math.cos(az+2.15)),5.0)*equator;
        p.x-=n.x*sideDent*.085;
        p.z-=n.z*sideDent*.070;
        p.x-=n.x*rearDent*.040;
        p.z-=n.z*rearDent*.050;
        p.y+=Math.sin(az*1.70)*.044*equator;
        shellPos.setXYZ(i,p.x,p.y,p.z);
      }
      shellGeo.computeVertexNormals();
      const shell=new T.Mesh(shellGeo,this.organicShellMaterial);
      shell.scale.set(.94,1.00,.96);
      this.organicShell=shell;
      this.organicGroup.add(shell);

      this.organicMembraneMaterial=new T.MeshPhysicalMaterial({
        color:0x6a787a,roughness:.22,metalness:.001,
        clearcoat:.54,clearcoatRoughness:.13,
        transmission:.007,thickness:.055,ior:1.35,
        transparent:true,opacity:0,depthWrite:false,
        roughnessMap:organicSurface,bumpMap:organicSurface,bumpScale:.0011,
        side:T.FrontSide
      });
      this.organicMembrane=new T.Mesh(shellGeo.clone(),this.organicMembraneMaterial);
      this.organicMembrane.scale.set(.948,1.008,.968);
      this.organicGroup.add(this.organicMembrane);

      this.organicLobes=[];
      const lobeGeo=new T.SphereGeometry(.165,20,14);
      const count=innerWidth<900?32:42;
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
      for(let i=0;i<24;i++){
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
      this.cellMaterial=new T.MeshStandardMaterial({
        color:0x1c1028,roughness:.74,metalness:.015,
        emissive:0x13091d,emissiveIntensity:.12,
        transparent:true,opacity:0
      });
      this.cellEdgeMaterial=new T.MeshBasicMaterial({
        color:0x65cbdc,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      const blobGeo=new T.IcosahedronGeometry(.090,2);
      const edgeGeo=new T.IcosahedronGeometry(.093,1);
      this.cells=[];
      const count=42;
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
        color:0x10181c,metalness:.30,roughness:.31,
        emissive:0x010304,emissiveIntensity:.010,
        clearcoat:.38,clearcoatRoughness:.18,
        envMapIntensity:1.36,flatShading:false,transparent:true,opacity:0
      });
      this.mechMidMaterial=new T.MeshPhysicalMaterial({
        color:0x131c21,metalness:.52,roughness:.27,
        clearcoat:.34,clearcoatRoughness:.16,transparent:true,opacity:0
      });
      this.silverMaterial=new T.MeshPhysicalMaterial({
        color:0x68777b,metalness:.78,roughness:.24,
        clearcoat:.28,clearcoatRoughness:.18,transparent:true,opacity:0
      });
      this.crownMaterial=this.silverMaterial.clone();
      for(const material of [this.mechMaterial,this.mechMidMaterial,this.silverMaterial,this.crownMaterial]){
        material.roughnessMap=mineralRoughness;
        if(this.highDetail||this.deterministicFrame){material.bumpMap=mineralRoughness;material.bumpScale=.0032;}
        material.needsUpdate=true;
      }
      this.mechEdgeMaterial=new T.LineBasicMaterial({transparent:true,opacity:0});
      this.plates=[];this.silverParts=[];this.mechBodyParts=[];this.mechPetals=[];

      const bodyGeo=new T.SphereGeometry(1.0,this.deterministicFrame?52:36,this.deterministicFrame?34:24);
      const bp=bodyGeo.attributes.position;
      const pv=new T.Vector3();
      for(let i=0;i<bp.count;i++){
        pv.fromBufferAttribute(bp,i);
        const n=pv.clone().normalize();
        const a=Math.atan2(n.z,n.x);
        const lobe=1+Math.sin(a*4.0+n.y*1.2)*.035+Math.cos(a*3.0-n.y*2.4)*.018;
        pv.multiplyScalar(lobe);
        pv.x*=.52;pv.y*=.60;pv.z*=.38;
        pv.y+=Math.pow(Math.max(n.y,0),4.0)*.045;
        bp.setXYZ(i,pv.x,pv.y,pv.z);
      }
      bodyGeo.computeVertexNormals();
      this.mechBody=new T.Mesh(bodyGeo,this.mechMaterial);
      this.mechanicalGroup.add(this.mechBody);
      this.mechBodyParts.push(this.mechBody);

      this.mechPetalMaterial=new T.MeshPhysicalMaterial({
        color:0x10181d,metalness:.52,roughness:.18,
        emissive:0x010405,emissiveIntensity:.010,
        clearcoat:.68,clearcoatRoughness:.085,
        envMapIntensity:1.72,transparent:true,opacity:0
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
        new T.CircleGeometry(.270,72),
        new T.MeshPhysicalMaterial({
          color:0x03070a,metalness:.52,roughness:.30,
          clearcoat:.30,clearcoatRoughness:.18,side:T.DoubleSide,
          transparent:true,opacity:0
        })
      );
      this.mechSocketBack.position.z=.690;
      this.mechanicalGroup.add(this.mechSocketBack);

      this.mechInnerMaterial=new T.MeshPhysicalMaterial({
        color:0x78878a,metalness:.62,roughness:.22,
        emissive:0x020607,emissiveIntensity:.010,
        clearcoat:.36,clearcoatRoughness:.14,
        transparent:true,opacity:0,depthWrite:true
      });
      this.mechInnerRing=new T.Mesh(new T.TorusGeometry(.185,.021,18,112),this.mechInnerMaterial);
      this.mechInnerRing.position.z=.716;
      this.mechanicalGroup.add(this.mechInnerRing);

      this.mechEnergyMaterial=new T.MeshPhysicalMaterial({
        color:0x318fa4,metalness:.010,roughness:.060,
        emissive:0x087990,emissiveIntensity:.72,
        clearcoat:1,clearcoatRoughness:.024,
        transmission:.10,thickness:.16,ior:1.46,
        transparent:true,opacity:0,depthWrite:false
      });
      this.mechEyeCore=new T.Mesh(new T.SphereGeometry(.126,72,42),this.mechEnergyMaterial);
      this.mechEyeCore.scale.set(1,1,.30);
      this.mechEyeCore.position.z=.754;
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
        map:this.makeGlowTexture(),color:0x78ebff,
        transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending
      }));
      this.mechEyeCorona.scale.set(.50,.50,1);
      this.mechEyeCorona.position.z=.70;
      this.mechanicalGroup.add(this.mechEyeCorona);

      this.mechLight=new T.PointLight(0x6ee8ff,0,3.8,2);
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
        color:0x355156,metalness:.025,roughness:.16,
        emissive:0x084653,emissiveIntensity:.25,
        clearcoat:.94,clearcoatRoughness:.055,
        transmission:.22,thickness:.12,ior:1.42,
        transparent:true,opacity:0,depthWrite:false
      });
      this.tentacleEdgeMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0});
      this.tentacleNodeMaterial=new T.PointsMaterial({transparent:true,opacity:0});
      this.tentacleGlowMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0});
      this.tentacleDashMaterial=new T.LineDashedMaterial({transparent:true,opacity:0});
      this.tentacles=[];
      const count=this.lowPowerProfile?4:(this.mobileProfile?6:8);
      const tendrilSegments=this.lowPowerProfile?34:(this.mobileProfile?42:50);
      const tendrilRadial=this.lowPowerProfile?5:(this.mobileProfile?6:7);
      for(let i=0;i<count;i++){
        const base=i/count*Math.PI*2+(r()-.5)*.16;
        const sign=i%2?1:-1;
        const len=1.18+r()*.52;
        const phase=r()*Math.PI*2;
        const pts=[];
        for(let j=0;j<11;j++){
          const u=j/10;
          const radius=.72+len*u;
          const curl=sign*Math.sin(u*Math.PI*1.58+phase*.16)*(.035+.16*u);
          const a=base+curl;
          const sideWave=Math.sin(u*Math.PI*2.05+phase)*(.020+.060*u);
          pts.push(new T.Vector3(
            Math.cos(a)*radius-Math.sin(a)*sideWave,
            Math.sin(a)*radius+Math.cos(a)*sideWave,
            -.18+Math.sin(u*Math.PI*1.52+phase)*(.025+.095*u)
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
          ? Math.min(devicePixelRatio||1,this.width<900 ? 0.58 : 0.54)
          : Math.min(
              devicePixelRatio||1,
              (this.mobileProfile?.92:1.05)*this.qualityScale
            );
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
      const mineralTakeover=smooth((t-6.18)/1.25);
      const coreLife=birth*(1-mineralTakeover*.90);
      let sc=.001;
      if(t<.12)sc=.001;
      else if(t<1.10)sc=mix(.42,.72,ease((t-.12)/.98));
      else if(t<5.90)sc=.72+Math.sin(time*.0010)*.004;
      else sc=mix(.72,.62,smooth((t-5.90)/1.40));

      const endMove=smooth((t-9.78)/.20);
      const target=this.targetWorld();
      const tx=target.x*endMove,ty=target.y*endMove;
      this.coreGroup.visible=coreLife>.002;
      this.coreGroup.position.set(tx,ty,.42);
      this.organicGroup.position.set(tx,ty,0);
      this.cellGroup.position.set(tx,ty,0);
      this.mechanicalGroup.position.set(tx,ty,.02);
      this.tentacleGroup.position.set(tx,ty,-.04);
      this.coreGroup.scale.setScalar(sc*mix(1,.90,endMove));
      this.coreGroup.rotation.y=Math.sin(time*.00016)*.012;
      this.coreGroup.rotation.x=Math.sin(time*.00019)*.008;

      const irisAwake=smooth((t-.70)/.80)*coreLife;
      const pulse=.988+.012*Math.sin(time*.0042);
      this.coreShell.material.opacity=.90*coreLife;
      this.coreGlass.material.opacity=.075*coreLife;
      if(this.corePetalMaterial)this.corePetalMaterial.opacity=.96*coreLife;
      this.irisGroup.visible=coreLife>.005;
      this.irisGroup.scale.setScalar((.92+irisAwake*.08)*pulse);
      if(this.irisCorona)this.irisCorona.material.opacity=.05*coreLife+.12*irisAwake;
      this.glowSprite.material.opacity=(.020*coreLife+.060*irisAwake)*pulse;
      this.glowSprite.scale.setScalar(.78+irisAwake*.10);
      this.coreInner.material.opacity=.04*coreLife+.12*irisAwake;
      this.coreLight.intensity=.28*coreLife+irisAwake*1.60;
      if(this.coreLabel)this.coreLabel.material.opacity=0;
    }

    updateOrganic(t,time){
      const grow=smooth((t-2.20)/.88);
      const crystallise=smooth((t-6.10)/1.18);
      const visible=grow*(1-crystallise*.92);
      this.organicGroup.visible=visible>.002;
      const bodyScale=.001+visible*.999;
      this.organicGroup.scale.set(bodyScale*.84,bodyScale*.84,bodyScale*.84);

      this.organicShellMaterial.opacity=.28*visible;
      this.organicLobeMaterial.opacity=.96*visible;
      if(this.organicMembraneMaterial)this.organicMembraneMaterial.opacity=.08*visible;
      this.organicWireMaterial.opacity=0;
      this.organicVeinMaterial.opacity=.15*visible;
      this.organicHoodMaterial.opacity=0;
      if(this.organicFoldMaterial)this.organicFoldMaterial.opacity=.20*visible;
      if(this.organicFoldGlowMaterial)this.organicFoldGlowMaterial.opacity=.010*visible;
      if(this.organicHoodGroup){this.organicHoodGroup.visible=false;this.organicHoodGroup.scale.setScalar(.001);}
      this.organicShell.rotation.y=Math.sin(time*.00014)*.010;
      this.organicShell.rotation.x=Math.sin(time*.00016)*.006;
      if(this.organicMembrane)this.organicMembrane.rotation.copy(this.organicShell.rotation);
      this.organicLobes.forEach((lobe,i)=>{
        const q=1+Math.sin(time*.00082+lobe.userData.phase)*.018*visible;
        const b=lobe.userData.baseScale;
        if(b)lobe.scale.set(b.x*q,b.y*q,b.z*q);
        lobe.rotation.y+=.00005*(i%2?1:-1);
      });
      if(this.organicPrimaryVeinMaterial)this.organicPrimaryVeinMaterial.opacity=.10*visible;
      if(this.organicFolds){
        this.organicFolds.rotation.y=Math.sin(time*.00012)*.008;
        this.organicFolds.rotation.x=Math.sin(time*.00010)*.004;
      }
    }

    updateCells(t,time){
      this.cellGroup.visible=false;
      this.cellMaterial.opacity=0;
      this.cellEdgeMaterial.opacity=0;
      this.cellVeinMaterial.opacity=0;
    }

    updateMechanical(t,time){
      const bodyGrow=smooth((t-5.72)/1.08);
      const irisGrow=smooth((t-6.18)/.72);
      this.mechanicalReveal=bodyGrow;
      this.mechanicalGroup.visible=bodyGrow>.002;
      this.mechanicalGroup.scale.set(.001+bodyGrow*1.28,.001+bodyGrow*1.30,.001+bodyGrow*1.24);
      this.mechMaterial.opacity=.38*bodyGrow;
      this.mechMidMaterial.opacity=.86*bodyGrow;
      this.silverMaterial.opacity=.20*bodyGrow;
      if(this.crownMaterial)this.crownMaterial.opacity=.16*bodyGrow;
      if(this.mechPetalMaterial)this.mechPetalMaterial.opacity=.98*bodyGrow;
      this.mechEdgeMaterial.opacity=0;
      this.mechInnerMaterial.opacity=.96*irisGrow;
      if(this.mechSocketBack?.material)this.mechSocketBack.material.opacity=.98*irisGrow;
      if(this.mechEnergyMaterial){
        this.mechEnergyMaterial.opacity=.98*irisGrow;
        this.mechEnergyMaterial.emissiveIntensity=.74+.18*Math.sin(time*.0044);
      }
      if(this.mechAperture?.material)this.mechAperture.material.opacity=.98*irisGrow;
      if(this.mechEyeCore?.material)this.mechEyeCore.material.opacity=.98*irisGrow;
      if(this.seamMaterial)this.seamMaterial.opacity=0;
      this.mechInnerRing.visible=true;
      this.mechInnerRing.rotation.z=time*.00010;
      if(this.mechEyeCorona){
        this.mechEyeCorona.material.opacity=.14*irisGrow;
        const q=.56+.04*Math.sin(time*.0042);
        this.mechEyeCorona.scale.set(q,q,1);
      }
      if(this.mechLight)this.mechLight.intensity=2.15*irisGrow;
      this.mechanicalGroup.rotation.y=.08*bodyGrow+Math.sin(time*.00014)*.010*bodyGrow;
      this.mechanicalGroup.rotation.x=-.035*bodyGrow+Math.sin(time*.00012)*.006*bodyGrow;
      this.mechanicalGroup.rotation.z=-.012*bodyGrow+Math.sin(time*.00010)*.004*bodyGrow;
      this.mechPetals?.forEach((p,index)=>{
        const open=(1-bodyGrow)*.08;
        p.rotation.z=p.userData.baseRz+(index%2?open:-open);
        p.rotation.x=p.userData.baseRx+Math.sin(time*.00016+index)*.010*bodyGrow;
        p.rotation.y=p.userData.baseRy+Math.cos(time*.00014+index)*.010*bodyGrow;
      });
    }

    updateTentacles(t,time){
      const grow=smooth((t-5.42)/1.05);
      const visible=grow;
      this.tentacleGroup.visible=visible>.002;
      this.tentacleMaterial.opacity=.88*visible;
      this.tentacleEdgeMaterial.opacity=0;
      this.tentacleNodeMaterial.opacity=0;
      if(this.tentacleGlowMaterial)this.tentacleGlowMaterial.opacity=0;
      if(this.tentacleDashMaterial)this.tentacleDashMaterial.opacity=0;
      this.tentacles.forEach(g=>{
        const wave=1+Math.sin(time*.00056+g.userData.phase)*.009*visible;
        const v=.001+visible*.999;
        g.scale.set(v*wave,v*wave,v*wave);
        g.rotation.z=Math.sin(time*.00030+g.userData.phase)*.018*visible;
        g.rotation.x=Math.sin(time*.00024+g.userData.phase)*.009*visible;
      });
    }

    updateCamera(t,time){
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
      this.camera.position.set(x,y,z);
      this.camera.lookAt(0,0,0);
    }

    render(r,time){
      if(this.disposed)return;
      if(this.previousFrameTime>0){
        const interval=Math.max(1,Math.min(50,time-this.previousFrameTime));
        this.frameIntervalAverage=this.frameIntervalAverage*.86+interval*.14;
      }
      this.previousFrameTime=time;
      this.lastRender=time;
      const renderStarted=performance.now();
      const t=clamp(r)*10;
      this.updateCamera(t,time);
      this.updateDNA(t,time);
      this.updateCore(t,time);
      this.updateOrganic(t,time);
      this.updateCells(t,time);
      this.updateMechanical(t,time);
      this.updateTentacles(t,time);

      if(this.chamber)this.chamber.rotation.z=Math.sin(time*.000025)*.0035;
      this.particles.rotation.z=time*.000018;
      this.particles.rotation.y=time*.000012;
      if(this.debris){
        this.debris.rotation.y=time*.000018;
        this.debris.rotation.z=Math.sin(time*.00011)*.022;
      }
      this.particles.material.opacity=.31+.07*Math.sin(time*.00045);

      const flash=smooth((t-9.05)/.11)*(1-smooth((t-9.58)/.24));
      const after=smooth((t-9.48)/.30);
      this.renderer.toneMappingExposure=1.46+flash*.34+after*.055;
      this.coreLight.intensity+=flash*4.8+after*.62;
      if(this.glowSprite){
        const g=1+flash*.72;
        this.glowSprite.scale.multiplyScalar(g);
        this.glowSprite.material.opacity=Math.min(.88,this.glowSprite.material.opacity+flash*.34);
      }
      if(this.flashBurst){
        this.flashBurst.material.opacity=flash*.78;
        const burstScale=1.46+flash*.60;
        this.flashBurst.scale.set(burstScale,burstScale,1);
      }
      if(this.flashBeam){
        this.flashBeam.material.opacity=flash*.20;
        this.flashBeam.scale.x=1+flash*.28;
      }
      if(this.mechEyeCorona){
        const mechanicalReveal=this.mechanicalReveal||0;
        this.mechEyeCorona.material.opacity=Math.min(.92,mechanicalReveal*(.22+flash*.64));
        const q=.62+flash*.32;
        this.mechEyeCorona.scale.set(q,q,1);
      }
      if(this.mechLight)this.mechLight.intensity+=flash*5.2*(this.mechanicalReveal||0);

      this.renderer.render(this.scene,this.camera);

      if(!this.deterministicFrame && !this.softwareRenderer){
        const renderCost=performance.now()-renderStarted;
        this.renderAverage=this.renderAverage
          ? this.renderAverage*.84+renderCost*.16
          : renderCost;
        if(time-this.lastQualityAdjust>520){
          const previous=this.qualityScale;
          const framePressure=this.frameIntervalAverage>18.4;
          const severeFramePressure=this.frameIntervalAverage>22.0;
          if(severeFramePressure||this.renderAverage>15.2)this.qualityScale=Math.max(.46,this.qualityScale-(severeFramePressure?.12:.08));
          else if(framePressure||this.renderAverage>13.8)this.qualityScale=Math.max(.46,this.qualityScale-.045);
          else if(this.frameIntervalAverage<17.2&&this.renderAverage<9.2)this.qualityScale=Math.min(1,this.qualityScale+.025);
          if(Math.abs(previous-this.qualityScale)>.001){
            this.lastQualityAdjust=time;
            this.resize();
            const secondary=this.qualityScale<.70;
            const emergency=this.qualityScale<.56;
            if(this.particles)this.particles.visible=!secondary;
            if(this.debris)this.debris.visible=!secondary;
            if(this.chamber)this.chamber.visible=!emergency;
          }
        }
        document.documentElement.dataset.fxMagBirthTargetFpsR1600='60';
        document.documentElement.dataset.fxMagBirthTargetFpsR1602='60-real-frame-budget';
        document.documentElement.dataset.fxMagBirthRenderMsR1600=this.renderAverage.toFixed(2);
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
        destroy:()=>engine.destroy(),
        engine,
        minimumFrameMs: 16.67,
        targetFps:60,
        revision:'r1602-real-frame-budget-adaptive-60fps-photographic-core'
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
  document.documentElement.dataset.fxMagBirthProofR1430='real-three-solid-cortical-reference-dna-controlled-titanium';

  window.FormatXMagGenesisThreeR1360={
    attach,
    revision:'r1600-adaptive-60fps-photographic-dark-chamber-core'
  };
})();