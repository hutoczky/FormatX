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

      this.renderer=new THREE.WebGLRenderer({
        canvas,
        alpha:false,
        antialias:true,
        depth:true,
        stencil:false,
        powerPreference:'high-performance',
        preserveDrawingBuffer:false
      });
      this.renderer.setClearColor(0x020811,1);
      this.renderer.outputColorSpace=THREE.SRGBColorSpace;
      this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure=1.04;

      this.scene=new THREE.Scene();
      this.scene.background=new THREE.Color(0x020811);
      this.scene.fog=new THREE.FogExp2(0x020811,0.032);

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
      this.scene.add(new T.HemisphereLight(0x8dc8d6,0x03050a,0.48));
      const key=new T.DirectionalLight(0xe8f8ff,2.55);
      key.position.set(-3.2,4.8,6.8);
      this.scene.add(key);
      const rim=new T.PointLight(0x4aa9ff,15,12,2);
      rim.position.set(3.2,-1.5,3.8);
      this.scene.add(rim);
      const bioticFill=new T.PointLight(0x5d3b86,9,10,2);
      bioticFill.position.set(-2.6,-.8,3.0);
      this.scene.add(bioticFill);
      this.coreLight=new T.PointLight(0x6feeff,0,8,2);
      this.coreLight.position.set(0,0,2.0);
      this.scene.add(this.coreLight);
      this.mechLight=new T.PointLight(0xc8f4ff,0,9,2);
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
        color:0x07151d,metalness:.90,roughness:.34,
        emissive:0x031018,emissiveIntensity:.13,
        clearcoat:.22,clearcoatRoughness:.32
      });
      const darkPanelMat=new T.MeshPhysicalMaterial({
        color:0x03090f,metalness:.82,roughness:.52,
        emissive:0x01060b,emissiveIntensity:.08
      });
      const lightMat=new T.MeshBasicMaterial({
        color:0x6ccfe0,transparent:true,opacity:.085,
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
      for(let i=0;i<20;i++){
        const a=i/20*Math.PI*2;
        const radius=4.06;
        const panel=new T.Mesh(panelGeo,i%3===0?panelMat:darkPanelMat);
        panel.position.set(Math.cos(a)*radius,Math.sin(a)*radius,-.28-(i%2)*.12);
        panel.rotation.set(0,0,a-Math.PI/2);
        panel.scale.y=.76+(i%4)*.055;
        group.add(panel);

        if(i%2===0){
          const light=new T.Mesh(lightGeo,lightMat);
          light.position.set(Math.cos(a)*3.72,Math.sin(a)*3.72,.06);
          light.rotation.z=a-Math.PI/2;
          group.add(light);
        }
      }

      // Recessed depth rings are dark metal, not luminous UI outlines.
      const ringMat=new T.MeshPhysicalMaterial({
        color:0x07131b,metalness:.88,roughness:.40,
        emissive:0x020b11,emissiveIntensity:.08
      });
      for(const [radius,tube,z] of [[3.92,.085,-.58],[3.36,.045,-1.22],[2.80,.030,-2.00]]){
        const ring=new T.Mesh(new T.TorusGeometry(radius,tube,8,96),ringMat);
        ring.position.z=z;
        group.add(ring);
      }

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
      const diamondMat=new T.MeshBasicMaterial({
        color:0x050c12,transparent:true,opacity:.82,
        side:T.DoubleSide,depthWrite:false
      });
      const diamond=new T.Mesh(new T.PlaneGeometry(.78,.78),diamondMat);
      diamond.rotation.z=Math.PI/4;
      diamond.position.z=-.02;
      this.irisGroup.add(diamond);

      const diamondEdge=new T.LineSegments(
        new T.EdgesGeometry(new T.PlaneGeometry(.82,.82)),
        new T.LineBasicMaterial({
          color:0x58b9ca,transparent:true,opacity:.065,
          depthWrite:false,blending:T.AdditiveBlending
        })
      );
      diamondEdge.rotation.z=Math.PI/4;diamondEdge.position.z=.01;
      this.irisGroup.add(diamondEdge);

      const ring1=new T.Mesh(new T.TorusGeometry(.170,.010,10,96),cyan.clone());
      ring1.material.opacity=.22;
      const ring2=new T.Mesh(new T.TorusGeometry(.275,.0060,8,96),cyan.clone());
      ring2.material.opacity=.07;
      const pupil=new T.Mesh(new T.CircleGeometry(.072,64),new T.MeshBasicMaterial({color:0x01070c,side:T.DoubleSide}));
      const pupilRing=new T.Mesh(new T.RingGeometry(.080,.126,80),cyan.clone());
      pupilRing.material.opacity=.24;
      this.irisGroup.add(ring2,ring1,pupil,pupilRing);

      const rayMat=new T.LineBasicMaterial({
        color:0x45d8ff,transparent:true,opacity:.145,
        depthWrite:false,blending:T.AdditiveBlending
      });
      const rays=[];
      for(let i=0;i<48;i++){
        const a=i/48*Math.PI*2;
        const inner=.118+(i%3)*.004;
        const outer=.315+(i%7)*.007;
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
      this.irisCorona.scale.set(.92,.92,1);
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


    makeOrganicLayer(){
      const T=this.THREE,r=this.rand;

      this.organicShellMaterial=new T.MeshPhysicalMaterial({
        color:0x17101f,roughness:.58,metalness:.018,
        clearcoat:.18,clearcoatRoughness:.42,
        transparent:false,opacity:1,
        emissive:0x0d0714,emissiveIntensity:.075,
        depthWrite:true
      });
      this.organicLobeMaterial=new T.MeshPhysicalMaterial({
        color:0x21152a,roughness:.64,metalness:.012,
        clearcoat:.08,clearcoatRoughness:.58,
        transparent:false,opacity:1,
        emissive:0x100719,emissiveIntensity:.060,
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
        color:0x24172d,roughness:.72,metalness:.002,
        emissive:0x0b121a,emissiveIntensity:.035,
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

    makeMechanicalLayer(){
      const T=this.THREE;

      this.mechMaterial=new T.MeshPhysicalMaterial({
        color:0x07131b,metalness:.90,roughness:.19,
        emissive:0x03131d,emissiveIntensity:.070,
        clearcoat:.84,clearcoatRoughness:.11,
        transparent:true,opacity:0
      });
      this.mechMidMaterial=new T.MeshPhysicalMaterial({
        color:0x0b202b,metalness:.88,roughness:.22,
        emissive:0x041722,emissiveIntensity:.075,
        clearcoat:.78,clearcoatRoughness:.13,
        transparent:true,opacity:0
      });
      this.silverMaterial=new T.MeshPhysicalMaterial({
        color:0x5b6970,metalness:.96,roughness:.34,
        emissive:0x041117,emissiveIntensity:.020,
        clearcoat:.50,clearcoatRoughness:.22,
        transparent:true,opacity:0
      });
      this.crownMaterial=this.silverMaterial.clone();
      this.crownMaterial.opacity=0;

      this.mechEdgeMaterial=new T.LineBasicMaterial({
        color:0x9bd8e1,transparent:true,opacity:0,
        blending:T.AdditiveBlending,depthWrite:false
      });

      this.plates=[];
      this.silverParts=[];
      this.mechBodyParts=[];

      // R1470 — compact asymmetric obsidian cut crystal.
      const baseShape=new T.Shape();
      baseShape.moveTo(-.03,.91);
      baseShape.lineTo(.20,.66);
      baseShape.lineTo(.50,.40);
      baseShape.lineTo(.66,.08);
      baseShape.lineTo(.48,-.20);
      baseShape.lineTo(.25,-.58);
      baseShape.lineTo(-.04,-.79);
      baseShape.lineTo(-.28,-.57);
      baseShape.lineTo(-.60,-.25);
      baseShape.lineTo(-.64,.08);
      baseShape.lineTo(-.42,.45);
      baseShape.lineTo(-.17,.73);
      baseShape.closePath();
      const baseGeo=new T.ExtrudeGeometry(baseShape,{
        depth:.34,bevelEnabled:true,bevelSegments:2,steps:1,
        bevelSize:.028,bevelThickness:.044,curveSegments:2
      });
      baseGeo.center();
      this.mechBody=new T.Mesh(baseGeo,this.mechMaterial);
      this.mechBody.scale.set(1.04,1.02,.98);
      this.mechBody.position.z=-.02;
      this.mechanicalGroup.add(this.mechBody);
      this.mechBodyParts.push(this.mechBody);

      // Central recessed diamond cradle.
      const cradleShape=new T.Shape();
      cradleShape.moveTo(0,.66);
      cradleShape.lineTo(.58,0);
      cradleShape.lineTo(0,-.66);
      cradleShape.lineTo(-.58,0);
      cradleShape.closePath();
      const cradleGeo=new T.ExtrudeGeometry(cradleShape,{
        depth:.16,bevelEnabled:true,bevelSegments:3,steps:1,
        bevelSize:.028,bevelThickness:.036,curveSegments:10
      });
      cradleGeo.center();
      this.mechCradle=new T.Mesh(cradleGeo,this.mechMidMaterial);
      this.mechCradle.scale.set(.92,.92,.74);
      this.mechCradle.position.z=.22;
      this.mechanicalGroup.add(this.mechCradle);

      // Four armor petals around the optical core.
      const topPlateShape=new T.Shape();
      topPlateShape.moveTo(0,.76);
      topPlateShape.lineTo(.10,.58);
      topPlateShape.lineTo(.52,.10);
      topPlateShape.lineTo(.18,-.04);
      topPlateShape.lineTo(0,.16);
      topPlateShape.lineTo(-.18,-.04);
      topPlateShape.lineTo(-.52,.10);
      topPlateShape.lineTo(-.10,.58);
      topPlateShape.closePath();
      const topPlateGeo=new T.ExtrudeGeometry(topPlateShape,{
        depth:.14,bevelEnabled:true,bevelSegments:3,steps:1,
        bevelSize:.030,bevelThickness:.040,curveSegments:8
      });
      topPlateGeo.center();

      const crownL=new T.Mesh(topPlateGeo,this.crownMaterial);
      crownL.scale.set(.78,1.08,.90);
      crownL.position.set(-.23,.39,.35);
      crownL.rotation.z=-.15;
      this.mechanicalGroup.add(crownL);
      this.silverParts.push(crownL);

      const crownR=new T.Mesh(topPlateGeo,this.crownMaterial);
      crownR.scale.set(-.56,.86,.82);
      crownR.position.set(.20,.31,.33);
      crownR.rotation.z=.07;
      this.mechanicalGroup.add(crownR);
      this.silverParts.push(crownR);
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
      left.scale.set(.84,.83,.88);
      left.position.set(-.46,.04,.31);
      left.rotation.z=.10;
      this.mechanicalGroup.add(left);
      this.plates.push(left);

      const right=new T.Mesh(sideGeo,this.silverMaterial);
      right.scale.set(-.62,.70,.82);
      right.position.set(.40,-.01,.29);
      right.rotation.z=-.02;
      this.mechanicalGroup.add(right);
      this.plates.push(right);

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
      this.jaw.scale.set(.92,.96,.86);
      this.jaw.position.set(-.035,-.35,.30);
      this.jaw.rotation.z=-.035;
      this.mechanicalGroup.add(this.jaw);
      this.plates.push(this.jaw);

      // Horizontal shoulder rails with cyan seams.
      this.seamMaterial=new T.MeshBasicMaterial({
        color:0x52d9ef,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      const railGeo=new T.BoxGeometry(.27,.024,.070);
      this.seams=[];
      for(const x of [-.68,.68]){
        const rail=new T.Mesh(railGeo,this.seamMaterial);
        rail.position.set(x,.00,.43);
        this.mechanicalGroup.add(rail);
        this.seams.push(rail);
      }
      const spineGeo=new T.BoxGeometry(.034,.25,.070);
      for(const x of [-.075,.075]){
        const spine=new T.Mesh(spineGeo,this.seamMaterial);
        spine.position.set(x,-.64,.38);
        this.mechanicalGroup.add(spine);
        this.seams.push(spine);
      }

      // Large optical eye, owned by the final pod itself.
      this.mechEyeCorona=new T.Sprite(new T.SpriteMaterial({
        map:this.makeIrisTexture(),
        color:0x73e5ff,
        transparent:true,
        opacity:0,
        depthWrite:false,
        blending:T.AdditiveBlending
      }));
      this.mechEyeCorona.scale.set(.54,.54,1);
      this.mechEyeCorona.position.set(0,.01,.48);
      this.mechanicalGroup.add(this.mechEyeCorona);

      this.mechEyeCore=new T.Mesh(
        new T.CircleGeometry(.074,64),
        new T.MeshBasicMaterial({color:0x74eeff,transparent:true,opacity:.90,side:T.DoubleSide})
      );
      this.mechEyeCore.position.set(0,.01,.50);
      this.mechanicalGroup.add(this.mechEyeCore);

      this.mechInnerMaterial=new T.MeshBasicMaterial({
        color:0x71e9ff,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.mechInnerRing=new T.Mesh(
        new T.TorusGeometry(.172,.009,8,72),
        this.mechInnerMaterial
      );
      this.mechInnerRing.position.set(0,.01,.49);
      this.mechanicalGroup.add(this.mechInnerRing);

      this.mechLight=new T.PointLight(0x6eeeff,0,3.6,2);
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

    makeTentacles(){
      const T=this.THREE,r=this.rand;
      this.tentacleMaterial=new T.MeshStandardMaterial({
        color:0x17313a,metalness:.48,roughness:.34,
        emissive:0x093842,emissiveIntensity:.34,
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
      const dpr=Math.min(devicePixelRatio||1,this.width<900?1.30:1.75);
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
      if(this.corePetalMaterial)this.corePetalMaterial.opacity=.34*stage1+.38*reveal*lateDim;

      this.irisGroup.scale.setScalar((.026+eyeHold*.94)*pulse);
      this.irisRays.rotation.z=time*.000050;
      if(this.irisCorona)this.irisCorona.material.opacity=.86*eyeHold;
      this.glowSprite.material.opacity=(.004+eyeHold*.048)*pulse;
      this.glowSprite.scale.setScalar(.94+eyeHold*.14);
      this.coreInner.material.opacity=.008+eyeHold*.095;
      this.coreLight.intensity=eyeHold*(3.35+Math.sin(time*.0046)*.14);

      if(this.coreLabel)this.coreLabel.material.opacity=.52*stage1+.028*reveal*(1-smooth((t-3.08)/.32));
    }

    updateOrganic(t,time){
      const grow=smooth((t-2.48)/.72);
      const crystallise=smooth((t-9.18)/.62);
      // R1400 keeps the cellular phase intact, then hands it to the irregular crystal.
      const visible=grow*(1-crystallise*.82);
      this.organicGroup.visible=visible>.002;
      const bodyScale=.001+visible*.999;
      this.organicGroup.scale.set(bodyScale*1.04,bodyScale*1.02,bodyScale*.94);

      this.organicShellMaterial.opacity=1;
      this.organicLobeMaterial.opacity=1;
      this.organicWireMaterial.opacity=.0003*visible;
      this.organicVeinMaterial.opacity=.016*visible;
      this.organicHoodMaterial.opacity=.30*visible;
      if(this.organicFoldMaterial)this.organicFoldMaterial.opacity=.18*visible;
      if(this.organicFoldGlowMaterial)this.organicFoldGlowMaterial.opacity=.002*visible;

      if(this.organicHoodGroup){
        this.organicHoodGroup.scale.setScalar(.72);
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
      // The silver crown is already visible in the middle film section.
      // The complete mechanical pod is deliberately delayed until the final flash.
      const crownGrow=smooth((t-5.78)/1.05);
      const bodyGrow=smooth((t-8.82)/.62);
      const groupGrow=Math.max(crownGrow,bodyGrow);
      this.mechanicalReveal=bodyGrow;
      this.mechanicalGroup.visible=groupGrow>.002;
      this.mechanicalGroup.scale.set(.001+groupGrow*.82,.001+groupGrow*.86,.001+groupGrow*.90);

      this.mechMaterial.opacity=.995*bodyGrow;
      this.mechMidMaterial.opacity=.985*bodyGrow;
      this.silverMaterial.opacity=.18*bodyGrow;
      if(this.crownMaterial)this.crownMaterial.opacity=.24*crownGrow;
      this.mechEdgeMaterial.opacity=.065*bodyGrow;
      this.mechInnerMaterial.opacity=.48*bodyGrow;
      if(this.seamMaterial)this.seamMaterial.opacity=.20*bodyGrow;
      if(this.mechEyeCorona)this.mechEyeCorona.material.opacity=1.00*bodyGrow;
      this.mechInnerRing.rotation.z=time*.00012;
      if(this.mechLight)this.mechLight.intensity=2.8*bodyGrow;

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
      this.tentacleEdgeMaterial.opacity=(.014+.018*afterGlow)*grow;
      this.tentacleNodeMaterial.opacity=.10*grow;
      if(this.tentacleGlowMaterial)this.tentacleGlowMaterial.opacity=(.025+.060*afterGlow)*grow;
      if(this.tentacleDashMaterial)this.tentacleDashMaterial.opacity=.08*grow;
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
        this.flashBurst.material.opacity=flash*.30;
        const burstScale=1.72+flash*.72;
        this.flashBurst.scale.set(burstScale,burstScale,1);
      }
      if(this.flashBeam){
        this.flashBeam.material.opacity=flash*.24;
        this.flashBeam.scale.x=1+flash*.65;
      }
      if(this.mechEyeCorona){
        const mechanicalReveal=this.mechanicalReveal||0;
        this.mechEyeCorona.material.opacity=Math.min(1,mechanicalReveal*(.88+flash*.12));
        const q=.76+flash*.18;
        this.mechEyeCorona.scale.set(q,q,1);
      }
      if(this.mechLight)this.mechLight.intensity+=flash*5.5*(this.mechanicalReveal||0);

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
      loader ||= loadThree();
      const THREE=await loader;
      const engine=new FormatXGenesisThree(THREE,canvas,getTarget);
      return {
        resize:()=>engine.resize(),
        draw:(r,time)=>engine.render(r,time),
        destroy:()=>engine.destroy(),
        engine,
        revision:'r1490-realistic-dna-solid-organism-obsidian-crystal'
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
  document.documentElement.dataset.fxMagBirthProofR1412='vertical-asymmetric-crystal-final-handoff';
  document.documentElement.dataset.fxMagBirthProofR1430='real-three-solid-cortical-reference-dna-controlled-titanium';

  window.FormatXMagGenesisThreeR1360={
    attach,
    revision:'r1480-volumetric-dna-solid-cortex-realistic-obsidian-crystal'
  };
})();