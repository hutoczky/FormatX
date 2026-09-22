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
      this.highDetail=matchMedia('(min-width:901px) and (pointer:fine)').matches
        && Number(navigator.hardwareConcurrency||8)>4;
      this.deterministicFrame=new URLSearchParams(location.search).has('introframe');

      this.renderer=new THREE.WebGLRenderer({
        canvas,
        alpha:false,
        antialias:true,
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
      this.scene.add(new T.HemisphereLight(0xb8c4c4,0x030405,0.46));
      const key=new T.DirectionalLight(0xfffbf3,3.10);
      key.position.set(-3.4,4.9,6.6);
      this.scene.add(key);
      const rim=new T.PointLight(0xaec6ca,5.0,12,2);
      rim.position.set(3.4,-1.7,3.6);
      this.scene.add(rim);
      const bioticFill=new T.PointLight(0x6f6972,2.20,10,2);
      bioticFill.position.set(-2.7,-.9,2.8);
      this.scene.add(bioticFill);
      const warmBounce=new T.PointLight(0xc3a17e,.76,8,2);
      warmBounce.position.set(2.4,2.1,1.1);
      this.scene.add(warmBounce);

      const softbox=new T.SpotLight(0xf4f5ef,6.8,15,Math.PI*.31,.88,1.62);
      softbox.position.set(-4.5,5.6,6.2);
      softbox.target.position.set(.25,.12,0);
      this.scene.add(softbox,softbox.target);

      const edgeSoftbox=new T.SpotLight(0x9bafb7,4.0,13,Math.PI*.33,.90,1.74);
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
        emissive:0x010406,emissiveIntensity:.035,
        clearcoat:.08,clearcoatRoughness:.58,
        side:T.BackSide
      });
      const panelMat=new T.MeshPhysicalMaterial({
        color:0x071014,metalness:.12,roughness:.78,
        emissive:0x010304,emissiveIntensity:.006,
        clearcoat:.02,clearcoatRoughness:.72,
        transparent:true,opacity:.030
      });
      const darkPanelMat=new T.MeshPhysicalMaterial({
        color:0x010203,metalness:.02,roughness:.95,
        emissive:0x000000,emissiveIntensity:0,
        transparent:true,opacity:.018
      });
      const lightMat=new T.MeshBasicMaterial({
        color:0xb5d3d4,transparent:true,opacity:.006,
        depthWrite:false,blending:T.AdditiveBlending
      });

      // R1563 — physical rectangular habitat, not a circular bore.
      // A shallow room gives the birth film perspective without reading as a HUD ring.
      const tunnel=new T.Mesh(
        new T.BoxGeometry(9.6,7.2,7.0,1,1,1),
        wallMat
      );
      tunnel.position.set(0,0,-.62);
      tunnel.visible=false;
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
      bulkhead.visible=false;
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
      const count=90;
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
        color:0xa8c4c7,size:.018,transparent:true,opacity:.12,
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
      const seg=84;
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

      const tubeA=new T.Mesh(new T.TubeGeometry(curveA,seg,.023,12,false),ma);
      const tubeB=new T.Mesh(new T.TubeGeometry(curveB,seg,.023,12,false),mb);
      const auraA=new T.Mesh(new T.TubeGeometry(curveA,seg,.029,9,false),ga);
      const auraB=new T.Mesh(new T.TubeGeometry(curveB,seg,.029,9,false),gb);

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
        color:0x303a3d,metalness:.025,roughness:.28,
        emissive:0x030607,emissiveIntensity:.006,
        clearcoat:.68,clearcoatRoughness:.10,
        transparent:true,opacity:.96
      });
      const shellGlass=new T.MeshPhysicalMaterial({
        color:0x4f5c60,metalness:.008,roughness:.24,
        transparent:true,opacity:.08,depthWrite:false,
        clearcoat:.78,clearcoatRoughness:.09,
        transmission:.020,thickness:.10,ior:1.38
      });

      const seedGeo=new T.SphereGeometry(.88,this.deterministicFrame?52:36,this.deterministicFrame?34:24);
      const pos=seedGeo.attributes.position;
      const p=new T.Vector3();
      for(let i=0;i<pos.count;i++){
        p.fromBufferAttribute(pos,i);
        const n=p.clone().normalize();
        const theta=Math.atan2(n.z,n.x);
        const fold=1
          +Math.sin(theta*2.15+n.y*2.3)*.018
          +Math.cos(theta*3.4-n.y*3.2)*.009;
        p.multiplyScalar(fold);
        const taper=1.02-.18*Math.pow(Math.abs(n.y),.78);
        p.x*=.75*taper;
        p.y*=1.25;
        p.z*=.64*(1.0-.10*Math.abs(n.y));
        p.x+=n.y*.072-n.z*.016;
        p.y+=Math.pow(Math.max(n.y,0),4.0)*.082+n.x*.022;
        p.z-=n.x*.016;
        pos.setXYZ(i,p.x,p.y,p.z);
      }
      pos.needsUpdate=true;
      seedGeo.computeVertexNormals();

      this.coreShell=new T.Mesh(seedGeo,shellMat);
      this.coreGroup.add(this.coreShell);

      this.coreGlass=new T.Mesh(seedGeo.clone(),shellGlass);
      this.coreGlass.scale.set(1.012,1.012,1.012);
      this.coreGroup.add(this.coreGlass);

      // Compatibility owners remain present but paint no petals, contours or wireframe.
      this.corePetalMaterial=new T.MeshPhysicalMaterial({transparent:true,opacity:0});
      this.corePetals=[];
      this.coreContourMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0});
      this.coreContours=[];
      this.coreEdges=new T.LineSegments(
        new T.BufferGeometry(),
        new T.LineBasicMaterial({transparent:true,opacity:0})
      );
      this.coreGroup.add(this.coreEdges);

      // Narrow embedded fissure: no circular iris, ring, socket or HUD.
      this.irisGroup=new T.Group();
      const fissureBackMat=new T.MeshPhysicalMaterial({
        color:0x071013,metalness:.04,roughness:.24,
        clearcoat:.55,clearcoatRoughness:.12,
        transparent:true,opacity:.50,depthWrite:false
      });
      const fissureMat=new T.MeshPhysicalMaterial({
        color:0x718d90,metalness:.025,roughness:.16,
        clearcoat:.90,clearcoatRoughness:.055,
        emissive:0x07191c,emissiveIntensity:.055,
        transparent:true,opacity:.20,depthWrite:false
      });
      const fissureBack=new T.Mesh(new T.CylinderGeometry(.017,.010,.48,10,2),fissureBackMat);
      fissureBack.rotation.z=.035;
      fissureBack.position.set(-.006,.005,.635);
      this.irisGroup.add(fissureBack);
      const fissureCore=new T.Mesh(new T.CylinderGeometry(.0055,.003,.42,8,2),fissureMat);
      fissureCore.rotation.z=-.025;
      fissureCore.position.set(.003,.010,.650);
      this.irisGroup.add(fissureCore);
      for(const [y,rz,s] of [[.09,.70,.34],[-.055,-.61,.27]]){
        const branch=new T.Mesh(new T.CylinderGeometry(.0038,.0016,.15,7,1),fissureMat.clone());
        branch.rotation.z=rz;
        branch.position.set(rz>0?.022:-.020,y,.648);
        branch.scale.setScalar(s);
        this.irisGroup.add(branch);
      }

      this.irisRays=new T.Object3D();
      this.irisGroup.add(this.irisRays);
      this.irisCorona=new T.Sprite(new T.SpriteMaterial({
        map:this.makeGlowTexture(),color:0xb2ccca,
        transparent:true,opacity:.020,depthWrite:false,
        blending:T.AdditiveBlending
      }));
      this.irisCorona.scale.set(.070,.46,1);
      this.irisCorona.position.z=.61;
      this.irisGroup.add(this.irisCorona);
      this.coreGroup.add(this.irisGroup);

      this.glowSprite=new T.Sprite(new T.SpriteMaterial({
        map:this.makeGlowTexture(),color:0x9cbfc0,
        transparent:true,opacity:.015,blending:T.AdditiveBlending,depthWrite:false
      }));
      this.glowSprite.scale.set(.090,.60,1);
      this.glowSprite.position.z=.60;
      this.coreGroup.add(this.glowSprite);

      this.coreInner=new T.Mesh(
        new T.IcosahedronGeometry(.075,2),
        new T.MeshBasicMaterial({
          color:0xa2bdba,transparent:true,opacity:.08,
          depthWrite:false,blending:T.AdditiveBlending
        })
      );
      this.coreInner.scale.set(.30,1.65,.22);
      this.coreInner.position.z=.61;
      this.coreGroup.add(this.coreInner);

      this.flashBurst=new T.Sprite(new T.SpriteMaterial({
        map:this.makeBurstTexture(),transparent:true,opacity:0,
        blending:T.AdditiveBlending,depthWrite:false
      }));
      this.flashBurst.scale.set(2.4,2.4,1);
      this.flashBurst.position.z=.68;
      this.coreGroup.add(this.flashBurst);

      this.flashBeam=new T.Mesh(
        new T.PlaneGeometry(2.8,.012),
        new T.MeshBasicMaterial({
          color:0xbce9e7,transparent:true,opacity:0,
          depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide
        })
      );
      this.flashBeam.position.z=.67;
      this.coreGroup.add(this.flashBeam);

      this.coreLabel=new T.Mesh(
        new T.PlaneGeometry(.001,.001),
        new T.MeshBasicMaterial({transparent:true,opacity:0})
      );
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
        color:0x2d3536,roughness:.58,metalness:.002,
        clearcoat:.10,clearcoatRoughness:.46,
        roughnessMap:organicSurface,bumpMap:organicSurface,bumpScale:.009,
        transparent:false,opacity:1,
        emissive:0x010203,emissiveIntensity:.0012,
        envMapIntensity:.46,
        depthWrite:true
      });
      this.organicLobeMaterial=new T.MeshPhysicalMaterial({
        color:0x292431,roughness:.54,metalness:.003,
        clearcoat:.10,clearcoatRoughness:.46,
        roughnessMap:organicSurface,bumpMap:organicSurface,bumpScale:.008,
        transparent:true,opacity:0,
        emissive:0x10091a,emissiveIntensity:.060,
        envMapIntensity:.34,
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
        p.x*=.72*taper;
        p.y*=1.12;
        p.z*=.60*(1.0-.08*Math.abs(n.y));
        p.x+=n.y*.105-n.z*.022;
        p.y+=n.x*.034+Math.pow(Math.max(n.y,0),4.0)*.040;
        p.z-=n.x*.026;
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
        color:0x697274,roughness:.36,metalness:.001,
        clearcoat:.30,clearcoatRoughness:.26,
        transmission:.006,thickness:.06,ior:1.34,
        transparent:true,opacity:0,depthWrite:false,
        roughnessMap:organicSurface,bumpMap:organicSurface,bumpScale:.0015,
        side:T.FrontSide
      });
      this.organicMembrane=new T.Mesh(shellGeo.clone(),this.organicMembraneMaterial);
      this.organicMembrane.scale.set(.948,1.008,.968);
      this.organicGroup.add(this.organicMembrane);

      this.organicLobes=[];
      const lobeGeo=new T.SphereGeometry(.16,18,12);
      const count=this.softwareRenderer?14:(this.highDetail||this.deterministicFrame?24:18);
      for(let i=0;i<count;i++){
        const phi=Math.acos(1-2*(i+.5)/count);
        const theta=Math.PI*(1+Math.sqrt(5))*i;
        const rr=.96+(r()-.5)*.12;
        const lobe=new T.Mesh(lobeGeo,this.organicLobeMaterial);
        lobe.position.set(
          Math.sin(phi)*Math.cos(theta)*rr,
          Math.cos(phi)*rr,
          Math.sin(phi)*Math.sin(theta)*rr*.71
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
        color:0x111719,roughness:.64,metalness:.003,
        emissive:0x030708,emissiveIntensity:.010,
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
        color:0x89c4c7,transparent:true,opacity:0,
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
        color:0x0a1113,metalness:.008,roughness:.26,
        emissive:0x000101,emissiveIntensity:.0004,
        clearcoat:.60,clearcoatRoughness:.14,
        transmission:.012,thickness:.26,ior:1.47,
        envMapIntensity:1.05,
        flatShading:false,
        transparent:false,opacity:1
      });
      this.mechMidMaterial=new T.MeshPhysicalMaterial({
        color:0x182124,metalness:.04,roughness:.25,
        clearcoat:.58,clearcoatRoughness:.12,
        transparent:true,opacity:0
      });
      this.silverMaterial=new T.MeshPhysicalMaterial({
        color:0x5d696b,metalness:.18,roughness:.27,
        clearcoat:.32,clearcoatRoughness:.20,
        transparent:true,opacity:0
      });
      this.crownMaterial=this.silverMaterial.clone();
      this.crownMaterial.opacity=0;

      for(const material of [this.mechMaterial,this.mechMidMaterial,this.silverMaterial,this.crownMaterial]){
        material.roughnessMap=mineralRoughness;
        if(this.highDetail||this.deterministicFrame){
          material.bumpMap=mineralRoughness;
          material.bumpScale=.0020;
        }
        material.needsUpdate=true;
      }

      this.mechEdgeMaterial=new T.LineBasicMaterial({transparent:true,opacity:0});
      this.plates=[];
      this.silverParts=[];
      this.mechBodyParts=[];
      this.mechPetals=[];

      /* R1576 — hand-cut obsidian body matching the native R326 hero.
         Broad offset polygonal rings create natural mineral planes instead of
         another deformed sphere, so the late intro cannot regress to an egg/pot. */
      const sideCount=(this.deterministicFrame||this.highDetail)?24:20;
      const ringDefs=[
        [.78,.10,.075,-.155,-.030,.120],
        [.65,.27,.185,-.215,-.020,.100],
        [.47,.43,.305,-.135,.010,.060],
        [.24,.49,.360,-.045,.015,.020],
        [.02,.44,.350,.040,.000,-.020],
        [-.22,.47,.320,.085,.010,.000],
        [-.44,.35,.245,.120,.020,.050],
        [-.62,.22,.150,.090,.020,.090],
        [-.75,.08,.060,.030,.010,.120]
      ];
      const positions=[];
      const indices=[];
      const ringIndices=[];
      const pushVertex=(x,y,z)=>{
        positions.push(x,y,z);
        return positions.length/3-1;
      };
      ringDefs.forEach((def,ringIndex)=>{
        const [y,rx,rz,ox,oz,phase]=def;
        const ring=[];
        for(let sideIndex=0;sideIndex<sideCount;sideIndex+=1){
          const a=sideIndex/sideCount*Math.PI*2+phase;
          const irregular=
            1
            +Math.sin(sideIndex*2.31+ringIndex*.91)*.036
            +Math.cos(sideIndex*1.37-ringIndex*.73)*.018;
          const cutFront=1-.120*Math.pow(Math.max(0,Math.cos(a-.52)),4.0);
          const cutRear=1-.075*Math.pow(Math.max(0,Math.cos(a+2.18)),5.0);
          const cutSide=1-.055*Math.pow(Math.max(0,Math.cos(a-2.54)),6.0);
          const cutNotch=1-.040*Math.pow(Math.max(0,Math.cos(a+1.18)),8.0);
          const radialCut=cutFront*cutRear*cutSide*cutNotch;
          ring.push(pushVertex(
            ox+Math.cos(a)*rx*irregular*radialCut,
            y,
            oz+Math.sin(a)*rz*(1+Math.cos(sideIndex*1.61+ringIndex*.57)*.018)*radialCut
          ));
        }
        ringIndices.push(ring);
      });
      const topIndex=pushVertex(-.145,.845,-.045);
      const bottomIndex=pushVertex(.020,-.805,.015);
      for(let side=0;side<sideCount;side+=1){
        const next=(side+1)%sideCount;
        indices.push(topIndex,ringIndices[0][next],ringIndices[0][side]);
      }
      for(let ring=0;ring<ringIndices.length-1;ring+=1){
        for(let side=0;side<sideCount;side+=1){
          const next=(side+1)%sideCount;
          const a=ringIndices[ring][side];
          const b=ringIndices[ring][next];
          const cc=ringIndices[ring+1][side];
          const d=ringIndices[ring+1][next];
          if((side+ring)%2===0)indices.push(a,b,d,a,d,cc);
          else indices.push(a,b,cc,b,d,cc);
        }
      }
      const last=ringIndices[ringIndices.length-1];
      for(let side=0;side<sideCount;side+=1){
        const next=(side+1)%sideCount;
        indices.push(last[side],last[next],bottomIndex);
      }
      const baseGeo=new T.BufferGeometry();
      baseGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
      baseGeo.setIndex(indices);
      baseGeo.computeVertexNormals();

      this.mechBody=new T.Mesh(baseGeo,this.mechMaterial);
      this.mechBody.position.z=-.025;
      this.mechanicalGroup.add(this.mechBody);
      this.mechBodyParts.push(this.mechBody);

      // Compatibility objects stay addressable, but the final seed has no
      // diamond cradle, no armor petals and no circular optical assembly.
      this.mechCradle=new T.Object3D();
      this.mechCradle.visible=false;
      this.mechanicalGroup.add(this.mechCradle);
      this.mechSocketBack=null;
      this.seamMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0});
      this.seams=[];

      this.mechInnerMaterial=new T.MeshPhysicalMaterial({
        color:0x11191b,metalness:.54,roughness:.24,
        emissive:0x020607,emissiveIntensity:.010,
        clearcoat:.34,clearcoatRoughness:.22,
        envMapIntensity:.86,
        transparent:true,opacity:0,depthWrite:true
      });

      this.mechEnergyMaterial=new T.MeshPhysicalMaterial({
        color:0x1b7890,metalness:.015,roughness:.10,
        emissive:0x0bcdf4,emissiveIntensity:2.2,
        clearcoat:1,clearcoatRoughness:.035,
        transmission:.10,thickness:.10,ior:1.42,
        transparent:true,opacity:0,depthWrite:false
      });
      this.mechEyeCore=new T.Mesh(
        new T.OctahedronGeometry(.096,2),
        this.mechEnergyMaterial
      );
      this.mechEyeCore.scale.set(.84,1.08,.50);
      this.mechEyeCore.rotation.set(.08,-.12,.16);
      this.mechEyeCore.position.set(.004,.006,.650);
      this.mechanicalGroup.add(this.mechEyeCore);

      this.mechRibMaterial=this.mechInnerMaterial.clone();
      this.mechRibs=[];
      const ribDefs=[
        [[-.28,.27,.585],[-.18,.16,.625],[-.095,.060,.652]],
        [[ .25,.25,.592],[ .16,.15,.630],[ .092,.055,.654]],
        [[-.26,-.24,.590],[-.17,-.15,.628],[-.090,-.050,.653]],
        [[ .27,-.22,.586],[ .17,-.14,.628],[ .092,-.047,.653]],
        [[-.31,.035,.575],[-.22,.020,.612],[-.115,.014,.646]],
        [[ .30,-.020,.578],[ .21,-.005,.615],[ .112,.008,.646]]
      ];
      ribDefs.forEach((pts,index)=>{
        const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)),false,'centripetal');
        const rib=new T.Mesh(
          new T.TubeGeometry(curve,22,index<4?.014:.010,7,false),
          this.mechRibMaterial
        );
        this.mechanicalGroup.add(rib);
        this.mechRibs.push(rib);
      });

      const branchMat=this.mechInnerMaterial.clone();
      this.mechFissureBranches=[];
      for(const [y,rz,s] of [[.12,.68,.42],[-.09,-.62,.34],[.03,1.05,.28]]){
        const branch=new T.Mesh(new T.CylinderGeometry(.0045,.0018,.17,7,1),branchMat.clone());
        branch.rotation.z=rz;
        branch.position.set(rz>0?.024:-.020,y,.638);
        branch.scale.setScalar(s);
        this.mechanicalGroup.add(branch);
        this.mechFissureBranches.push(branch);
      }

      this.mechInnerRing=new T.Object3D();
      this.mechInnerRing.visible=false;
      this.mechanicalGroup.add(this.mechInnerRing);

      this.mechEyeCorona=new T.Sprite(new T.SpriteMaterial({
        map:this.makeGlowTexture(),color:0x51e6ff,
        transparent:true,opacity:0,depthWrite:false,
        blending:T.AdditiveBlending
      }));
      this.mechEyeCorona.scale.set(.30,.30,1);
      this.mechEyeCorona.position.set(.004,.006,.642);
      this.mechanicalGroup.add(this.mechEyeCorona);

      this.mechLight=new T.PointLight(0x35dfff,0,2.6,2);
      this.mechLight.position.set(.004,.006,.80);
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
      this.tentacleMaterial=new T.MeshStandardMaterial({
        color:0x101719,metalness:.05,roughness:.62,
        emissive:0x020506,emissiveIntensity:.018,
        transparent:true,opacity:0
      });
      this.tentacleEdgeMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0});
      this.tentacleNodeMaterial=new T.PointsMaterial({transparent:true,opacity:0});
      this.tentacleGlowMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0});
      this.tentacleDashMaterial=new T.LineDashedMaterial({transparent:true,opacity:0});

      this.tentacles=[];
      const count=4;
      for(let i=0;i<count;i++){
        const base=i/count*Math.PI*2+(r()-.5)*.20;
        const sign=i%2?1:-1;
        const len=.40+r()*.30;
        const phase=r()*Math.PI*2;
        const pts=[];
        for(let j=0;j<9;j++){
          const u=j/8;
          const radius=.72+len*u;
          const curl=sign*Math.sin(u*Math.PI*1.42+phase*.16)*(.022+.075*u);
          const a=base+curl;
          const sideWave=Math.sin(u*Math.PI*1.86+phase)*(.012+.030*u);
          pts.push(new T.Vector3(
            Math.cos(a)*radius-Math.sin(a)*sideWave,
            Math.sin(a)*radius+Math.cos(a)*sideWave,
            -.22+Math.sin(u*Math.PI*1.44+phase)*(.015+.035*u)
          ));
        }
        const curve=new T.CatmullRomCurve3(pts,false,'centripetal');
        const geo=this.createTaperedTube(curve,32,6,.022+r()*.004,.0032+r()*.0008);
        const mesh=new T.Mesh(geo,this.tentacleMaterial);
        const g=new T.Group();
        g.add(mesh);
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
      const dpr=this.deterministicFrame
        ? Math.min(devicePixelRatio||1,1.00)
        : this.softwareRenderer
          ? Math.min(devicePixelRatio||1,this.width<900 ? 0.58 : 0.54)
          : Math.min(devicePixelRatio||1,this.width<900?1.00:1.18);
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
      const birth=smooth((t-.14)/.78);
      const cellular=smooth((t-2.40)/.92);
      const organicTakeover=smooth((t-2.58)/1.05);
      const mineralTakeover=smooth((t-6.10)/1.15);
      const coreLife=birth*(1-organicTakeover)*(1-mineralTakeover*.98);
      let sc=.001;
      if(t<.14)sc=.001;
      else if(t<1.20)sc=mix(.30,.58,ease((t-.14)/1.06));
      else if(t<2.60)sc=.58+Math.sin(time*.0010)*.003;
      else sc=mix(.58,.52,smooth((t-2.60)/3.4));

      const endMove=smooth((t-9.78)/.20);
      const target=this.targetWorld();
      const tx=target.x*endMove,ty=target.y*endMove;

      this.coreGroup.visible=coreLife>.002;
      this.coreGroup.position.set(tx,ty,.36);
      this.organicGroup.position.set(tx,ty,0);
      this.cellGroup.position.set(tx,ty,0);
      this.mechanicalGroup.position.set(tx,ty,.02);
      this.tentacleGroup.position.set(tx,ty,-.06);

      this.coreGroup.scale.setScalar(sc*mix(1,.92,endMove));
      this.coreGroup.rotation.y=Math.sin(time*.00016)*.010;
      this.coreGroup.rotation.x=Math.sin(time*.00019)*.006;

      const fissureAwake=cellular*coreLife;
      const pulse=.990+.010*Math.sin(time*.0038);
      this.coreShell.material.opacity=.82*coreLife;
      this.coreGlass.material.opacity=.060*coreLife;
      this.coreEdges.material.opacity=0;
      if(this.corePetalMaterial)this.corePetalMaterial.opacity=0;
      this.coreContours?.forEach(m=>{m.material.opacity=0;});
      this.irisGroup.visible=coreLife>.010;
      this.irisGroup.scale.setScalar((.48+fissureAwake*.20)*pulse);
      if(this.irisCorona)this.irisCorona.material.opacity=.012*coreLife+.024*fissureAwake;
      this.glowSprite.material.opacity=(.003*coreLife+.010*fissureAwake)*pulse;
      this.glowSprite.scale.set(.12+fissureAwake*.03,.58+fissureAwake*.08,1);
      this.coreInner.material.opacity=.010*coreLife+.030*fissureAwake;
      this.coreLight.intensity=.08*coreLife+fissureAwake*.22;
      if(this.coreLabel)this.coreLabel.material.opacity=0;
    }

    updateOrganic(t,time){
      const grow=smooth((t-2.28)/.92);
      const crystallise=smooth((t-6.02)/1.26);
      const visible=grow*(1-crystallise*.96);
      this.organicGroup.visible=visible>.002;
      const bodyScale=.001+visible*.999;
      this.organicGroup.scale.set(bodyScale*.61,bodyScale*.65,bodyScale*.63);

      this.organicShellMaterial.opacity=1;
      this.organicLobeMaterial.opacity=.74*visible*(1-crystallise*.82);
      if(this.organicMembraneMaterial)this.organicMembraneMaterial.opacity=.008*visible;
      this.organicWireMaterial.opacity=0;
      this.organicVeinMaterial.opacity=.016*visible;
      this.organicHoodMaterial.opacity=0;
      if(this.organicFoldMaterial)this.organicFoldMaterial.opacity=.095*visible;
      if(this.organicFoldGlowMaterial)this.organicFoldGlowMaterial.opacity=.0008*visible;

      if(this.organicHoodGroup){
        this.organicHoodGroup.visible=false;
        this.organicHoodGroup.scale.setScalar(.001);
      }
      this.organicShell.rotation.y=Math.sin(time*.00010)*.008;
      this.organicShell.rotation.x=Math.sin(time*.00013)*.004;
      if(this.organicMembrane)this.organicMembrane.rotation.copy(this.organicShell.rotation);
      if(this.organicPrimaryVeinMaterial)this.organicPrimaryVeinMaterial.opacity=.011*visible;
      if(this.organicFolds){
        this.organicFolds.rotation.y=Math.sin(time*.00012)*.006;
        this.organicFolds.rotation.x=Math.sin(time*.00010)*.003;
      }
    }

    updateCells(t,time){
      this.cellGroup.visible=false;
      this.cellMaterial.opacity=0;
      this.cellEdgeMaterial.opacity=0;
      this.cellVeinMaterial.opacity=0;
    }

    updateMechanical(t,time){
      const bodyGrow=smooth((t-6.02)/1.30);
      const fissureGrow=smooth((t-6.90)/.95);
      const settle=smooth((t-8.55)/.80);
      this.mechanicalReveal=bodyGrow;
      this.mechanicalGroup.visible=bodyGrow>.002;
      this.mechanicalGroup.scale.set(
        .001+bodyGrow*1.25,
        .001+bodyGrow*1.34,
        .001+bodyGrow*1.29
      );

      this.mechMaterial.opacity=1;
      this.mechMidMaterial.opacity=0;
      this.silverMaterial.opacity=0;
      if(this.crownMaterial)this.crownMaterial.opacity=0;
      this.mechEdgeMaterial.opacity=0;
      this.mechInnerMaterial.opacity=.84*fissureGrow;
      if(this.mechRibMaterial)this.mechRibMaterial.opacity=.82*fissureGrow;
      if(this.mechEnergyMaterial){
        this.mechEnergyMaterial.opacity=.96*fissureGrow;
        this.mechEnergyMaterial.emissiveIntensity=1.85+.24*Math.sin(time*.0038);
      }
      if(this.mechEyeCore?.material)this.mechEyeCore.material.opacity=.96*fissureGrow;
      if(this.seamMaterial)this.seamMaterial.opacity=0;
      this.mechInnerRing.visible=false;
      if(this.mechCradle)this.mechCradle.visible=false;
      if(this.mechEyeCorona){
        this.mechEyeCorona.material.opacity=.16*fissureGrow;
        this.mechEyeCorona.scale.set(.28,.28,1);
      }
      if(this.mechLight)this.mechLight.intensity=.62*fissureGrow;
      this.mechFissureBranches?.forEach(branch=>{
        if(branch.material)branch.material.opacity=.28*fissureGrow;
      });

      this.mechanicalGroup.rotation.y=.18*bodyGrow+Math.sin(time*.00014)*.010*bodyGrow;
      this.mechanicalGroup.rotation.x=-.055*bodyGrow+Math.sin(time*.00012)*.005*bodyGrow;
      this.mechanicalGroup.rotation.z=-.045*bodyGrow+Math.sin(time*.00010)*.004*bodyGrow;
      if(this.mechBody){
        this.mechBody.rotation.set(0,0,0);
      }
      this.mechRibs?.forEach((rib,index)=>{
        rib.rotation.z=Math.sin(time*.00020+index*.73)*.0025*bodyGrow;
      });
    }

    updateTentacles(t,time){
      const grow=smooth((t-6.18)/1.30);
      const visible=grow;
      this.tentacleGroup.visible=visible>.002;
      this.tentacleMaterial.opacity=.13*visible;
      this.tentacleEdgeMaterial.opacity=0;
      this.tentacleNodeMaterial.opacity=0;
      if(this.tentacleGlowMaterial)this.tentacleGlowMaterial.opacity=0;
      if(this.tentacleDashMaterial)this.tentacleDashMaterial.opacity=0;
      this.tentacles.forEach(g=>{
        const wave=1+Math.sin(time*.00042+g.userData.phase)*.004*visible;
        const v=.001+visible*.999;
        g.scale.set(v*wave,v*wave,v*wave);
        g.rotation.z=Math.sin(time*.00022+g.userData.phase)*.008*visible;
        g.rotation.x=Math.sin(time*.00018+g.userData.phase)*.004*visible;
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
        z=mix(5.70,5.80,k);
        y=mix(0,.002,k);
      }else if(t<9.10){
        z=5.80+Math.sin(time*.00018)*.006;
        y=.002;
      }else{
        z=mix(5.80,5.72,smooth((t-9.10)/.60));
        y=.002;
      }
      if(this.width<this.height)z+=.58;
      this.camera.position.set(x,y,z);
      this.camera.lookAt(0,0,0);
    }

    render(r,time){
      if(this.disposed)return;
      if(this.softwareRenderer&&!this.deterministicFrame&&this.lastRender&&time-this.lastRender<92)return;
      this.lastRender=time;
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
      this.particles.material.opacity=.09+.018*Math.sin(time*.00045);

      const flash=smooth((t-9.05)/.11)*(1-smooth((t-9.58)/.24));
      const after=smooth((t-9.48)/.30);
      this.renderer.toneMappingExposure=1.30+flash*.008+after*.003;
      this.coreLight.intensity+=flash*.10+after*.025;
      if(this.glowSprite){
        const g=1+flash*.72;
        this.glowSprite.scale.multiplyScalar(g);
        this.glowSprite.material.opacity=Math.min(1,this.glowSprite.material.opacity+flash*.42);
      }
      if(this.flashBurst){
        this.flashBurst.material.opacity=flash*.032;
        const burstScale=1.18+flash*.18;
        this.flashBurst.scale.set(burstScale,burstScale,1);
      }
      if(this.flashBeam){
        this.flashBeam.material.opacity=0;
        this.flashBeam.scale.x=1;
      }
      if(this.mechEyeCorona){
        this.mechEyeCorona.material.opacity=0;
        this.mechEyeCorona.scale.set(.07,.48,1);
      }
      if(this.mechLight)this.mechLight.intensity+=flash*.055*(this.mechanicalReveal||0);

      this.renderer.render(this.scene,this.camera);
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
        minimumFrameMs: innerWidth<900 ? 92 : 76,
        revision:'r1586-integrated-three-quarter-living-obsidian-reference-handoff'
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
  document.documentElement.dataset.fxMagBirthPerformanceR1541='bounded-11-to-13fps-pbr-render-low-dpr';
  document.documentElement.dataset.fxMagBirthPerformanceR1547='hardware-three-software-reference-film-adaptive-cache-safe';
  document.documentElement.dataset.fxMagBirthProofR1554='deterministic-frame-buffer-retained-at-1x-for-real-visual-review';
  document.documentElement.dataset.fxMagBirthProofR1560='smooth-biogenic-shell-no-white-facet-overlay-obsidian-seed-handoff';
  document.documentElement.dataset.fxMagBirthProofR1557='double-render-gl-finish-and-readback-before-proof-ready';
  document.documentElement.dataset.fxMagBirthVisualR1555='smooth-indexed-volcanic-glass-mineral-fissure-no-circular-eye';
  document.documentElement.dataset.fxMagBirthVisualR1561='elongated-bioceramic-seed-to-smoky-crystal-no-orb-no-hud-readable-studio-light';
  document.documentElement.dataset.fxMagBirthVisualR1570='reference-three-act-dna-cellular-four-petal-mechanical-energy-core-tendrils';
  document.documentElement.dataset.fxMagBirthVisualR1563='rectangular-physical-habitat-dry-bioceramic-seed-readable-final-crystal-fading-roots';
  document.documentElement.dataset.fxMagBirthPerformanceR1545='hardware-three-software-reference-film-no-parallel-webgl';
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
    revision:'r1586-three-act-dna-cellular-integrated-living-obsidian'
  };
})();