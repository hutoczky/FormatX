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

      this.renderer=new THREE.WebGLRenderer({
        canvas,
        alpha:false,
        antialias:true,
        depth:true,
        stencil:false,
        powerPreference:'high-performance',
        preserveDrawingBuffer:false
      });
      const gl=this.renderer.getContext();
      const debugInfo=gl.getExtension('WEBGL_debug_renderer_info');
      const rendererName=String(debugInfo?gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)||'').toLowerCase();
      this.softwareRenderer=/swiftshader|llvmpipe|software|softpipe|mesa offscreen/.test(rendererName);
      this.deterministicFrame=new URLSearchParams(location.search).has('introframe');
      if(this.softwareRenderer)this.highDetail=false;
      document.documentElement.dataset.fxMagBirthGpuR1541=this.softwareRenderer?'software-adaptive':'hardware-full';
      this.renderer.setClearColor(0x020811,1);
      this.renderer.outputColorSpace=THREE.SRGBColorSpace;
      this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure=1.00;

      this.scene=new THREE.Scene();
      this.scene.background=new THREE.Color(0x010407);
      this.scene.fog=new THREE.FogExp2(0x010407,0.027);

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

    makeLights(){
      const T=this.THREE;
      // R1520 — brighter neutral studio key while preserving a black chamber.
      this.scene.add(new T.HemisphereLight(0xa6bac0,0x020305,0.38));
      const key=new T.DirectionalLight(0xf6f4ef,2.78);
      key.position.set(-3.4,4.9,6.6);
      this.scene.add(key);
      const rim=new T.PointLight(0x9abfc5,5.8,12,2);
      rim.position.set(3.4,-1.7,3.6);
      this.scene.add(rim);
      const bioticFill=new T.PointLight(0x62566f,2.15,10,2);
      bioticFill.position.set(-2.7,-.9,2.8);
      this.scene.add(bioticFill);
      const warmBounce=new T.PointLight(0xb8a58e,.82,8,2);
      warmBounce.position.set(2.4,2.1,1.1);
      this.scene.add(warmBounce);

      const softbox=new T.SpotLight(0xe7f6f6,6.4,15,Math.PI*.24,.74,1.75);
      softbox.position.set(-4.5,5.6,6.2);
      softbox.target.position.set(.25,.12,0);
      this.scene.add(softbox,softbox.target);

      const edgeSoftbox=new T.SpotLight(0x8497aa,3.6,13,Math.PI*.28,.82,1.9);
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
        color:0x02070c,metalness:.84,roughness:.43,
        emissive:0x020910,emissiveIntensity:.10,
        clearcoat:.24,clearcoatRoughness:.36,
        side:T.BackSide
      });
      const panelMat=new T.MeshPhysicalMaterial({
        color:0x081116,metalness:.78,roughness:.48,
        emissive:0x010405,emissiveIntensity:.025,
        clearcoat:.08,clearcoatRoughness:.58,
        transparent:true,opacity:.22
      });
      const darkPanelMat=new T.MeshPhysicalMaterial({
        color:0x020508,metalness:.70,roughness:.62,
        emissive:0x000000,emissiveIntensity:0,
        transparent:true,opacity:.16
      });
      const lightMat=new T.MeshBasicMaterial({
        color:0xa0c7ce,transparent:true,opacity:.018,
        depthWrite:false,blending:T.AdditiveBlending
      });

      // Physical tunnel around the camera axis; this replaces the flat HUD-like disc.
      const tunnel=new T.Mesh(
        new T.CylinderGeometry(4.55,4.25,5.6,28,1,true),
        wallMat
      );
      tunnel.rotation.x=Math.PI/2;
      tunnel.position.z=-.20;
      group.add(tunnel);

      // Deep rear bulkhead.
      const bulkhead=new T.Mesh(
        new T.CircleGeometry(4.20,28),
        darkPanelMat
      );
      bulkhead.position.z=-3.02;
      group.add(bulkhead);

      // Segmented structural wall plates.
      const panelGeo=new T.BoxGeometry(.54,1.55,.22);
      const lightGeo=new T.BoxGeometry(.055,.88,.035);
      for(let i=0;i<10;i++){
        const a=i/10*Math.PI*2;
        const radius=4.06;
        const panel=new T.Mesh(panelGeo,i%3===0?panelMat:darkPanelMat);
        panel.position.set(Math.cos(a)*radius,Math.sin(a)*radius,-.28-(i%2)*.12);
        panel.rotation.set(0,0,a-Math.PI/2);
        panel.scale.y=.76+(i%4)*.055;
        group.add(panel);

        if(i%3===0){
          const light=new T.Mesh(lightGeo,lightMat);
          light.position.set(Math.cos(a)*3.72,Math.sin(a)*3.72,.06);
          light.rotation.z=a-Math.PI/2;
          group.add(light);
        }
      }

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
      const count=420;
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
        color:0x91d8e9,size:.043,transparent:true,opacity:.62,
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
      const mesh=new T.InstancedMesh(geo,mat,48);
      const dummy=new T.Object3D();
      for(let i=0;i<48;i++){
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
        color:0x5f9ca8,emissive:0x06141d,emissiveIntensity:.08,
        roughness:.26,metalness:.18,transparent:true,opacity:.96,
        depthWrite:true,clearcoat:.90,clearcoatRoughness:.10,
        transmission:.08,thickness:.18
      });
      const mb=new T.MeshPhysicalMaterial({
        color:0x51466f,emissive:0x0b0717,emissiveIntensity:.09,
        roughness:.28,metalness:.16,transparent:true,opacity:.95,
        depthWrite:true,clearcoat:.88,clearcoatRoughness:.11,
        transmission:.07,thickness:.18
      });
      const ga=new T.MeshBasicMaterial({
        color:0x4bdfff,transparent:true,opacity:.020,depthWrite:false,
        blending:T.AdditiveBlending
      });
      const gb=new T.MeshBasicMaterial({
        color:0x785cff,transparent:true,opacity:.018,depthWrite:false,
        blending:T.AdditiveBlending
      });
      const rungMat=new T.MeshPhysicalMaterial({
        color:0xa8cfd8,emissive:0x172c36,emissiveIntensity:.18,
        roughness:.40,metalness:.025,transparent:true,opacity:.80,depthWrite:true,
        clearcoat:.34,clearcoatRoughness:.24
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
      group.userData.baseOpacity=[.94,.92,.020,.018,.80,.28,.25];
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
        color:0x5d6d78,metalness:.82,roughness:.20,
        emissive:0x0d222d,emissiveIntensity:.12,
        clearcoat:.86,clearcoatRoughness:.10,
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
        color:0x080d13,metalness:.36,roughness:.40,
        emissive:0x041018,emissiveIntensity:.08,
        clearcoat:.18,clearcoatRoughness:.44,
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

      const socketBack=new T.Mesh(
        new T.CircleGeometry(.300,64),
        new T.MeshPhysicalMaterial({
          color:0x10171a,metalness:.70,roughness:.34,
          clearcoat:.28,clearcoatRoughness:.24,
          transparent:true,opacity:.96,side:T.DoubleSide
        })
      );
      socketBack.position.z=-.035;
      this.irisGroup.add(socketBack);

      const socketBezel=new T.Mesh(
        new T.TorusGeometry(.238,.030,16,96),
        new T.MeshPhysicalMaterial({
          color:0x69787b,metalness:.88,roughness:.30,
          clearcoat:.26,clearcoatRoughness:.22,
          emissive:0x020607,emissiveIntensity:.018
        })
      );
      socketBezel.position.z=.012;
      this.irisGroup.add(socketBezel);

      const lens=new T.Mesh(
        new T.SphereGeometry(.145,64,36),
        new T.MeshPhysicalMaterial({
          color:0x2a7c8b,metalness:.025,roughness:.095,
          clearcoat:1,clearcoatRoughness:.035,
          transmission:.10,thickness:.20,ior:1.46,
          emissive:0x062b34,emissiveIntensity:.18
        })
      );
      lens.scale.set(1,1,.28);
      lens.position.z=.060;
      this.irisGroup.add(lens);

      const aperture=new T.Mesh(
        new T.CircleGeometry(.060,64),
        new T.MeshPhysicalMaterial({
          color:0x010405,metalness:.06,roughness:.12,
          clearcoat:.78,clearcoatRoughness:.08,
          side:T.DoubleSide
        })
      );
      aperture.position.z=.104;
      this.irisGroup.add(aperture);

      const glassRing=new T.Mesh(
        new T.TorusGeometry(.128,.009,14,96),
        new T.MeshPhysicalMaterial({
          color:0x6ab7c2,metalness:.10,roughness:.12,
          clearcoat:.95,clearcoatRoughness:.045,
          emissive:0x062127,emissiveIntensity:.12,
          transparent:true,opacity:.62
        })
      );
      glassRing.position.z=.100;
      this.irisGroup.add(glassRing);

      // Kept as an object for the existing animation contract; no radial HUD rays.
      this.irisRays=new T.Object3D();
      this.irisGroup.add(this.irisRays);

      this.irisCorona=new T.Sprite(new T.SpriteMaterial({
        map:this.makeGlowTexture(),
        color:0x9ee5ee,
        transparent:true,
        opacity:.10,
        depthWrite:false,
        blending:T.AdditiveBlending
      }));
      this.irisCorona.scale.set(.56,.56,1);
      this.irisCorona.position.z=.020;
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
        color:0x25282a,roughness:.50,metalness:.012,
        clearcoat:.22,clearcoatRoughness:.34,
        roughnessMap:organicSurface,bumpMap:organicSurface,bumpScale:.018,
        transparent:false,opacity:1,
        emissive:0x030405,emissiveIntensity:.008,
        depthWrite:true
      });
      this.organicLobeMaterial=new T.MeshPhysicalMaterial({
        color:0x202326,roughness:.58,metalness:.008,
        clearcoat:.16,clearcoatRoughness:.44,
        roughnessMap:organicSurface,bumpMap:organicSurface,bumpScale:.014,
        transparent:false,opacity:1,
        emissive:0x020304,emissiveIntensity:.006,
        depthWrite:true
      });
      this.organicWireMaterial=new T.MeshBasicMaterial({
        color:0x67ddea,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });

      const shellGeo=new T.IcosahedronGeometry(1.38,5);
      const shellPos=shellGeo.attributes.position;
      for(let i=0;i<shellPos.count;i++){
        const p=new T.Vector3().fromBufferAttribute(shellPos,i);
        const n=p.clone().normalize();
        const az=Math.atan2(n.z,n.x), el=Math.acos(Math.max(-1,Math.min(1,n.y)));
        const fold=
          Math.sin(az*5.0+el*2.1)*.045+
          Math.sin(az*8.0-el*3.7)*.022+
          Math.cos(az*3.0+el*6.1)*.016;
        p.multiplyScalar(1+fold);
        shellPos.setXYZ(i,p.x,p.y,p.z);
      }
      shellGeo.computeVertexNormals();
      const shell=new T.Mesh(shellGeo,this.organicShellMaterial);
      shell.scale.set(1.00,1.03,.78);
      this.organicShell=shell;
      this.organicGroup.add(shell);

      this.organicMembraneMaterial=new T.MeshPhysicalMaterial({
        color:0x526066,roughness:.30,metalness:.004,
        clearcoat:.48,clearcoatRoughness:.18,
        transmission:.055,thickness:.16,ior:1.36,
        transparent:true,opacity:0,depthWrite:false,
        roughnessMap:organicSurface,bumpMap:organicSurface,bumpScale:.006,
        side:T.FrontSide
      });
      this.organicMembrane=new T.Mesh(shellGeo.clone(),this.organicMembraneMaterial);
      this.organicMembrane.scale.set(1.007,1.037,.786);
      this.organicGroup.add(this.organicMembrane);

      this.organicLobes=[];
      const lobeGeo=new T.IcosahedronGeometry(.34,2);
      const count=0;
      for(let i=0;i<count;i++){
        const phi=Math.acos(1-2*(i+.5)/count);
        const theta=Math.PI*(1+Math.sqrt(5))*i;
        const rr=.96+(r()-.5)*.045;
        const lobe=new T.Mesh(lobeGeo,this.organicLobeMaterial);
        lobe.position.set(
          Math.sin(phi)*Math.cos(theta)*rr,
          Math.cos(phi)*rr,
          Math.sin(phi)*Math.sin(theta)*rr*.71
        );
        const k=.94+r()*.16;
        lobe.scale.set(
          k*(1.02+r()*.18),
          k*(1.08+r()*.20),
          k*(.84+r()*.14)
        );
        lobe.rotation.set(r()*2.4,r()*2.4,r()*2.4);
        lobe.userData.phase=r()*Math.PI*2;
        lobe.userData.baseScale=lobe.scale.clone();
        this.organicGroup.add(lobe);
        this.organicLobes.push(lobe);
      }

      this.organicFoldMaterial=new T.MeshPhysicalMaterial({
        color:0x201d24,roughness:.88,metalness:.001,
        emissive:0x06090b,emissiveIntensity:.018,
        transparent:true,opacity:0,depthWrite:true
      });
      this.organicFoldGlowMaterial=new T.MeshBasicMaterial({
        color:0x4aa9b8,transparent:true,opacity:0,
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
        color:0x67c9db,transparent:true,opacity:0,
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
        color:0x171b1d,metalness:.56,roughness:.38,
        emissive:0x010203,emissiveIntensity:.010,
        clearcoat:.14,clearcoatRoughness:.42,
        flatShading:true,transparent:true,opacity:0
      });
      this.mechMidMaterial=new T.MeshPhysicalMaterial({
        color:0x111a1e,metalness:.72,roughness:.31,
        emissive:0x010405,emissiveIntensity:.012,
        clearcoat:.18,clearcoatRoughness:.38,
        transparent:true,opacity:0
      });
      this.silverMaterial=new T.MeshPhysicalMaterial({
        color:0x6f7475,metalness:.88,roughness:.36,
        emissive:0x000000,emissiveIntensity:0,
        clearcoat:.12,clearcoatRoughness:.46,
        transparent:true,opacity:0
      });
      this.crownMaterial=this.silverMaterial.clone();
      this.crownMaterial.opacity=0;

      for(const material of [this.mechMaterial,this.mechMidMaterial,this.silverMaterial,this.crownMaterial]){
        material.roughnessMap=mineralRoughness;
        if(this.highDetail){
          material.bumpMap=mineralRoughness;
          material.bumpScale=.0065;
        }
        material.needsUpdate=true;
      }

      this.mechEdgeMaterial=new T.LineBasicMaterial({
        color:0x9bd8e1,transparent:true,opacity:0,
        blending:T.AdditiveBlending,depthWrite:false
      });

      this.plates=[];
      this.silverParts=[];
      this.mechBodyParts=[];

      // R1500 — true closed 3D obsidian mineral body.
      // The old shallow polygon extrusion is replaced with a deformed closed
      // volume, so side planes and specular response remain physically coherent.
      let baseGeo=new T.IcosahedronGeometry(1,2);
      if(baseGeo.index)baseGeo=baseGeo.toNonIndexed();
      const basePos=baseGeo.attributes.position;
      const pnt=new T.Vector3();
      for(let i=0;i<basePos.count;i++){
        pnt.fromBufferAttribute(basePos,i).normalize();
        const theta=Math.atan2(pnt.z,pnt.x);
        const upper=pnt.y>=0,right=pnt.x>=0,front=pnt.z>=0;
        const ax=upper?(right?.70:.83):(right?.79:.67);
        const ay=upper?(right?.96:.88):(right?.83:.73);
        const az=front?(right?.58:.71):(right?.63:.74);
        const power=1.16;
        const lp=Math.pow(Math.abs(pnt.x)/ax,power)+Math.pow(Math.abs(pnt.y)/ay,power)+Math.pow(Math.abs(pnt.z)/az,power);
        const radius=1/Math.pow(Math.max(.001,lp),1/power);
        const mineralBias=1+Math.sin(theta*2.13+pnt.y*2.7)*.058+Math.cos(theta*3.31-pnt.y*3.9)*.034+Math.sin(theta*4.67-pnt.y*1.9)*.016;
        pnt.multiplyScalar(radius*mineralBias);
        pnt.x*=1.08;pnt.y*=1.05;pnt.z*=.96;
        pnt.x+=pnt.y*-.032+pnt.z*pnt.y*.020-Math.pow(Math.max(-pnt.x,0),4)*.020;
        pnt.y+=Math.pow(Math.max(pnt.y,0),5)*.056-Math.pow(Math.max(-pnt.y,0),4)*.016;
        pnt.z+=pnt.x*pnt.y*.016+Math.pow(Math.max(pnt.z,0),4)*.010;
        basePos.setXYZ(i,pnt.x,pnt.y,pnt.z);
      }
      baseGeo.computeVertexNormals();
      this.mechBody=new T.Mesh(baseGeo,this.mechMaterial);
      this.mechBody.scale.set(1.02,1.02,1.00);
      this.mechBody.position.z=-.01;
      this.mechanicalGroup.add(this.mechBody);
      this.mechBodyParts.push(this.mechBody);

      // Recessed optical cradle is attached to the front plane; no detached
      // crown/side shards are used in the final silhouette.
      const cradleShape=new T.Shape();
      cradleShape.moveTo(0,.42);
      cradleShape.lineTo(.36,0);
      cradleShape.lineTo(0,-.42);
      cradleShape.lineTo(-.36,0);
      cradleShape.closePath();
      const cradleGeo=new T.ExtrudeGeometry(cradleShape,{
        depth:.090,bevelEnabled:true,bevelSegments:2,steps:1,
        bevelSize:.018,bevelThickness:.022,curveSegments:6
      });
      cradleGeo.center();
      this.mechCradle=new T.Mesh(cradleGeo,this.mechMidMaterial);
      this.mechCradle.scale.set(.92,.92,.78);
      this.mechCradle.position.z=.58;
      this.mechanicalGroup.add(this.mechCradle);

      // R1510 — one physical optical assembly; no luminous rails or sprite corona.
      this.seamMaterial=new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0,depthWrite:false});
      this.seams=[];
      this.mechEyeCorona=null;

      this.mechEyeCore=new T.Mesh(
        new T.SphereGeometry(.090,40,24),
        new T.MeshPhysicalMaterial({
          color:0x0b171a,metalness:.03,roughness:.09,
          clearcoat:1,clearcoatRoughness:.045,
          emissive:0x071a1e,emissiveIntensity:.105,
          transparent:false,opacity:1,depthWrite:true
        })
      );
      this.mechEyeCore.scale.set(1,1,.28);
      this.mechEyeCore.position.set(0,.01,.688);
      this.mechanicalGroup.add(this.mechEyeCore);

      this.mechInnerMaterial=new T.MeshPhysicalMaterial({
        color:0x283033,metalness:.82,roughness:.30,
        emissive:0x000000,emissiveIntensity:0,
        transparent:true,opacity:0,depthWrite:true
      });
      this.mechInnerRing=new T.Mesh(new T.TorusGeometry(.126,.008,10,80),this.mechInnerMaterial);
      this.mechInnerRing.position.set(0,.01,.678);
      this.mechanicalGroup.add(this.mechInnerRing);

      this.mechLight=new T.PointLight(0x9bd7dd,0,2.8,2);
      this.mechLight.position.set(0,0,.62);
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
        color:0x182429,metalness:.20,roughness:.56,
        emissive:0x061216,emissiveIntensity:.11,
        transparent:true,opacity:0
      });
      this.tentacleEdgeMaterial=new T.MeshBasicMaterial({
        color:0x5a9eaa,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.tentacleNodeMaterial=new T.PointsMaterial({
        color:0x8af0fb,size:.066,transparent:true,opacity:0,
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
        const len=1.18+r()*.34;
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
        const geo=this.createTaperedTube(curve,52,8,.034+r()*.006,.006+r()*.0014);
        const glowGeo=this.createTaperedTube(curve,58,6,.007+r()*.0015,.0024+r()*.0006);
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
      const dpr=this.softwareRenderer
        ? Math.min(devicePixelRatio||1,this.width<900 ? 0.62 : 0.58)
        : Math.min(devicePixelRatio||1,this.width<900?1.30:1.75);
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
      // R1290 — the reference film has no visible core at frame zero.
      // The liquid MAG emerges only after the DNA field has established.
      const birth=smooth((t-2.42)/.48);
      let sc=.001;
      if(t<2.42) sc=.001;
      else if(t<2.90) sc=mix(.34,.80,ease((t-2.42)/.48));
      else if(t<3.30) sc=mix(.80,.66,smooth((t-2.90)/.40));
      else if(t<5.58) sc=.66+Math.sin((t-3.28)*1.02)*.003;
      else if(t<7.20) sc=mix(.66,.56,smooth((t-5.58)/1.62));
      else sc=.56;

      const endMove=smooth((t-9.78)/.20);
      const target=this.targetWorld();
      const tx=target.x*endMove,ty=target.y*endMove;
      const cellular=smooth((t-2.58)/.54);
      const surfaceZ=cellular*1.10;

      this.coreGroup.visible=birth>.002;
      this.coreGroup.position.set(tx,ty,surfaceZ);
      this.organicGroup.position.set(tx,ty,0);
      this.cellGroup.position.set(tx,ty,0);
      this.mechanicalGroup.position.set(tx,ty,.02);
      this.tentacleGroup.position.set(tx,ty,-.04);

      this.coreGroup.scale.setScalar(sc*mix(1,.86,endMove));
      this.coreGroup.rotation.y=Math.sin(time*.00018)*.010;
      this.coreGroup.rotation.x=Math.sin(time*.00022)*.007;

      const stage1=birth*(1-smooth((t-2.75)/.48));
      const reveal=birth*smooth((t-2.68)/.46);
      // The cyan optical core remains alive through the organic/tentacle phase.
      const eyeHold=reveal;
      const lateDim=1-smooth((t-9.08)/.34)*.28;
      const pulse=.988+.012*Math.sin(time*.0046);

      this.coreShell.material.opacity=.88*stage1+.018*reveal*lateDim;
      this.coreGlass.material.opacity=.035*stage1+.003*reveal*lateDim;
      this.coreEdges.material.opacity=.080*stage1+.006*reveal*lateDim;
      if(this.corePetalMaterial)this.corePetalMaterial.opacity=.12*stage1+.025*reveal*lateDim;

      this.irisGroup.scale.setScalar((.026+eyeHold*.76)*pulse);
      this.irisRays.rotation.z=0;
      if(this.irisCorona)this.irisCorona.material.opacity=.075*eyeHold;
      this.glowSprite.material.opacity=(.002+eyeHold*.018)*pulse;
      this.glowSprite.scale.setScalar(.94+eyeHold*.14);
      this.coreInner.material.opacity=.004+eyeHold*.025;
      this.coreLight.intensity=eyeHold*(1.25+Math.sin(time*.0046)*.08);

      if(this.coreLabel)this.coreLabel.material.opacity=.52*stage1+.028*reveal*(1-smooth((t-3.08)/.32));
    }

    updateOrganic(t,time){
      const grow=smooth((t-2.48)/.72);
      const crystallise=smooth((t-8.34)/.78);
      // R1400 keeps the cellular phase intact, then hands it to the irregular crystal.
      const visible=grow*(1-crystallise*.82);
      this.organicGroup.visible=visible>.002;
      const bodyScale=.001+visible*.999;
      this.organicGroup.scale.set(bodyScale*1.04,bodyScale*1.02,bodyScale*.94);

      this.organicShellMaterial.opacity=1;
      this.organicLobeMaterial.opacity=1;
      if(this.organicMembraneMaterial)this.organicMembraneMaterial.opacity=.12*visible;
      this.organicWireMaterial.opacity=0;
      this.organicVeinMaterial.opacity=.009*visible;
      this.organicHoodMaterial.opacity=.16*visible;
      if(this.organicFoldMaterial)this.organicFoldMaterial.opacity=.18*visible;
      if(this.organicFoldGlowMaterial)this.organicFoldGlowMaterial.opacity=.002*visible;

      if(this.organicHoodGroup){
        this.organicHoodGroup.scale.setScalar(.72);
        this.organicHoodGroup.rotation.y=Math.sin(time*.00022)*.014;
        this.organicHoodGroup.rotation.x=Math.sin(time*.00018)*.007;
      }
      this.organicShell.rotation.y=time*.000018;
      this.organicShell.rotation.x=Math.sin(time*.00016)*.006;
      if(this.organicMembrane){
        this.organicMembrane.rotation.copy(this.organicShell.rotation);
      }

      this.organicLobes.forEach((lobe,i)=>{
        const q=1+Math.sin(time*.00096+lobe.userData.phase)*.012*visible;
        const b=lobe.userData.baseScale;
        if(b)lobe.scale.set(b.x*q,b.y*q,b.z*q);
        lobe.rotation.y+=.000065*(i%2?1:-1);
      });
      this.organicVeins.forEach(vein=>{
        vein.rotation.z=Math.sin(time*.00025+vein.userData.phase)*.007;
      });
      if(this.organicPrimaryVeinMaterial)this.organicPrimaryVeinMaterial.opacity=.010*visible;
      this.organicPrimaryVeins?.forEach((vein,i)=>{
        vein.rotation.z=Math.sin(time*.00019+(vein.userData.phase||i))*.0035;
      });
      if(this.organicFolds){
        this.organicFolds.rotation.y=Math.sin(time*.00015)*.010;
        this.organicFolds.rotation.x=Math.sin(time*.00012)*.005;
      }
    }

    updateCells(t,time){
      this.cellGroup.visible=false;
      this.cellMaterial.opacity=0;
      this.cellEdgeMaterial.opacity=0;
      this.cellVeinMaterial.opacity=0;
    }

    updateMechanical(t,time){
      // R1510 — final mineral body appears as one object at the handoff.
      const crownGrow=smooth((t-5.78)/1.05);
      const bodyGrow=smooth((t-8.26)/.78);
      const groupGrow=bodyGrow;
      this.mechanicalReveal=bodyGrow;
      this.mechanicalGroup.visible=groupGrow>.002;
      this.mechanicalGroup.scale.set(.001+groupGrow*.82,.001+groupGrow*.86,.001+groupGrow*.90);

      this.mechMaterial.opacity=.995*bodyGrow;
      this.mechMidMaterial.opacity=.985*bodyGrow;
      this.silverMaterial.opacity=.10*bodyGrow;
      if(this.crownMaterial)this.crownMaterial.opacity=0;
      this.mechEdgeMaterial.opacity=.018*bodyGrow;
      this.mechInnerMaterial.opacity=.92*bodyGrow;
      if(this.seamMaterial)this.seamMaterial.opacity=0;
      this.mechInnerRing.rotation.z=time*.000035;
      if(this.mechLight)this.mechLight.intensity=.68*bodyGrow;

      if(this.mechBody){
        this.mechBody.rotation.y=Math.sin(time*.00018)*.008*bodyGrow;
        this.mechBody.rotation.x=Math.sin(time*.00015)*.005*bodyGrow;
      }
      if(this.mechCradle)this.mechCradle.rotation.z=Math.sin(time*.00016)*.006*bodyGrow;
      this.silverParts.forEach((p,i)=>{
        p.rotation.y=Math.sin(time*.00015+i)*.006*crownGrow;
      });
    }

    updateTentacles(t,time){
      const grow=smooth((t-5.55)/1.00);
      const afterGlow=smooth((t-9.42)/.42);
      this.tentacleGroup.visible=grow>.002;
      this.tentacleMaterial.opacity=(.96+.02*afterGlow)*grow;
      this.tentacleEdgeMaterial.opacity=0;
      this.tentacleNodeMaterial.opacity=0;
      if(this.tentacleGlowMaterial)this.tentacleGlowMaterial.opacity=0;
      if(this.tentacleDashMaterial)this.tentacleDashMaterial.opacity=0;
      this.tentacles.forEach((g,i)=>{
        const wave=1+Math.sin(time*.00062+g.userData.phase)*.006*grow;
        const v=.001+grow*.999;
        g.scale.set(v*wave,v*wave,v*wave);
        g.rotation.z=Math.sin(time*.00030+g.userData.phase)*.011*grow;
        g.rotation.x=Math.sin(time*.00024+g.userData.phase)*.007*grow;
      });
    }

    updateCamera(t,time){
      let z=5.34,y=.012,x=0;
      if(t<2.70){
        const k=smooth(t/2.70);
        z=mix(5.40,5.18,k);
        x=Math.sin(time*.00027)*.032*(1-k*.35);
        y=.010+Math.sin(time*.00024)*.013;
      }else if(t<3.30){
        const k=smooth((t-2.70)/.60);
        z=mix(5.18,5.08,k);
        x=mix(.012,0,k);y=mix(.008,0,k);
      }else if(t<5.55){
        z=5.08+Math.sin(time*.00020)*.006;
        x=Math.sin(time*.00015)*.003;
        y=Math.cos(time*.00018)*.003;
      }else if(t<7.15){
        const k=smooth((t-5.55)/1.60);
        z=mix(5.08,8.25,k);
        y=mix(0,.003,k);
      }else if(t<9.10){
        z=8.25+Math.sin(time*.00018)*.010;
        y=.003;
      }else{
        z=mix(8.25,8.05,smooth((t-9.10)/.60));
        y=.003;
      }
      if(this.width<this.height)z+=.90;
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
      this.particles.material.opacity=.38+.10*Math.sin(time*.00045);

      const flash=smooth((t-9.05)/.11)*(1-smooth((t-9.58)/.24));
      const after=smooth((t-9.48)/.30);
      this.renderer.toneMappingExposure=1.10+flash*.045+after*.010;
      this.coreLight.intensity+=flash*5+after*1.5;
      if(this.glowSprite){
        const g=1+flash*.72;
        this.glowSprite.scale.multiplyScalar(g);
        this.glowSprite.material.opacity=Math.min(1,this.glowSprite.material.opacity+flash*.42);
      }
      if(this.flashBurst){
        this.flashBurst.material.opacity=flash*.075;
        const burstScale=1.34+flash*.30;
        this.flashBurst.scale.set(burstScale,burstScale,1);
      }
      if(this.flashBeam){
        this.flashBeam.material.opacity=0;
        this.flashBeam.scale.x=1;
      }
      if(this.mechEyeCorona){
        const mechanicalReveal=this.mechanicalReveal||0;
        this.mechEyeCorona.material.opacity=Math.min(.68,mechanicalReveal*(.56+flash*.08));
        const q=.36+flash*.07;
        this.mechEyeCorona.scale.set(q,q,1);
      }
      if(this.mechLight)this.mechLight.intensity+=flash*2.1*(this.mechanicalReveal||0);

      this.renderer.render(this.scene,this.camera);
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
        revision:'r1540-bioceramic-organic-round-optic-photoreal-mineral-handoff'
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
  document.documentElement.dataset.fxMagBirthPerformanceR1541='hardware-full-software-reference-film-adaptive';
  document.documentElement.dataset.fxMagBirthPerformanceR1545='hardware-three-software-reference-film-no-parallel-webgl';
  document.documentElement.dataset.fxMagBirthProofR1412='vertical-asymmetric-crystal-final-handoff';
  document.documentElement.dataset.fxMagBirthProofR1430='real-three-solid-cortical-reference-dna-controlled-titanium';

  window.FormatXMagGenesisThreeR1360={
    attach,
    revision:'r1540-photoreal-bioceramic-organism-round-lens-ringless-habitat'
  };
})();