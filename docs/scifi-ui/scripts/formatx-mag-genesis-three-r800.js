(() => {
  'use strict';

  const THREE_SOURCES = [
    new URL('./scripts/three-r185.module.js', location.href).href
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
        antialias:false,
        depth:true,
        stencil:false,
        powerPreference:'high-performance',
        preserveDrawingBuffer:false
      });
      this.renderer.setClearColor(0x06131c,1);
      this.renderer.outputColorSpace=THREE.SRGBColorSpace;
      this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure=1.16;

      this.scene=new THREE.Scene();
      this.scene.background=new THREE.Color(0x06131c);
      this.scene.fog=new THREE.FogExp2(0x06131c,0.056);

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
      this.scene.add(new T.HemisphereLight(0x6fc9df,0x080612,0.86));
      const key=new T.DirectionalLight(0xd3f3ff,2.05);
      key.position.set(-3.5,5,6);
      this.scene.add(key);
      const rim=new T.PointLight(0x7457ff,18,13,2);
      rim.position.set(2.8,-2.2,3.6);
      this.scene.add(rim);
      this.coreLight=new T.PointLight(0x6feeff,0,8,2);
      this.coreLight.position.set(0,0,2.0);
      this.scene.add(this.coreLight);
      this.mechLight=new T.PointLight(0xc8f4ff,0,9,2);
      this.mechLight.position.set(-2.4,2.8,4.2);
      this.scene.add(this.mechLight);
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
        color:0x91d8e9,size:.038,transparent:true,opacity:.62,
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
        color:0x5fb9c9,emissive:0x173d50,emissiveIntensity:.82,
        roughness:.43,metalness:.03,transparent:true,opacity:.78,
        depthWrite:false,clearcoat:.20,clearcoatRoughness:.32
      });
      const mb=new T.MeshPhysicalMaterial({
        color:0x735ba9,emissive:0x2a1f55,emissiveIntensity:.84,
        roughness:.45,metalness:.02,transparent:true,opacity:.72,
        depthWrite:false,clearcoat:.18,clearcoatRoughness:.34
      });
      const ga=new T.MeshBasicMaterial({
        color:0x4bdfff,transparent:true,opacity:.050,depthWrite:false,
        blending:T.AdditiveBlending
      });
      const gb=new T.MeshBasicMaterial({
        color:0x785cff,transparent:true,opacity:.045,depthWrite:false,
        blending:T.AdditiveBlending
      });
      const rungMat=new T.MeshPhysicalMaterial({
        color:0x8ac8d7,emissive:0x28435e,emissiveIntensity:.46,
        roughness:.42,transparent:true,opacity:.88,depthWrite:false
      });
      const mpa=new T.PointsMaterial({
        color:0xb7f3ff,size:.038,transparent:true,opacity:.68,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });
      const mpb=new T.PointsMaterial({
        color:0xa994ff,size:.036,transparent:true,opacity:.62,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });

      const tubeA=new T.Mesh(new T.TubeGeometry(curveA,seg,.038,8,false),ma);
      const tubeB=new T.Mesh(new T.TubeGeometry(curveB,seg,.038,8,false),mb);
      const auraA=new T.Mesh(new T.TubeGeometry(curveA,seg,.070,7,false),ga);
      const auraB=new T.Mesh(new T.TubeGeometry(curveB,seg,.070,7,false),gb);

      const rungGeo=new T.CylinderGeometry(.024,.024,1,8,1,false);
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
      group.userData.baseOpacity=[.86,.80,.072,.066,.88,.68,.62];
      return group;
    }

    makeDNAField(){
      const placements=[
        [-.36,.18,1.42,.58,1.38],
        [.34,-.08,1.24,-.80,1.26],
        [-2.48,1.50,.40,-.38,.92],
        [2.46,1.44,.42,.43,.90],
        [-2.42,-1.40,.34,.40,.92],
        [2.44,-1.36,.36,-.38,.90],
        [0,2.16,-.38,1.56,.80],
        [0,-2.10,-.34,1.56,.80],
        [-3.04,.02,-.62,1.50,.62],
        [3.02,.02,-.58,1.60,.62]
      ];
      this.dnas=[];
      for(const [x,y,z,rz,sc] of placements){
        const h=this.createHelix(4.06,.286,3.72);
        h.position.set(x,y,z);
        h.rotation.z=rz;
        h.rotation.y=(this.rand()-.5)*.28;
        h.scale.setScalar(sc);
        h.userData.base={x,y,z,rz,s:sc,phase:this.rand()*Math.PI*2};
        this.dnaGroup.add(h);this.dnas.push(h);
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
        x.strokeStyle='rgba(103,229,255,'+alpha.toFixed(3)+')';
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
      iris.addColorStop(.46,'rgba(133,246,255,.92)');
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
        color:0x202b35,metalness:.34,roughness:.46,
        emissive:0x0b1a24,emissiveIntensity:.16,
        clearcoat:.38,clearcoatRoughness:.30,
        transparent:true,opacity:.92
      });
      const shellGlass=new T.MeshPhysicalMaterial({
        color:0x244650,metalness:.10,roughness:.28,
        transparent:true,opacity:.10,depthWrite:false,
        emissive:0x0a3946,emissiveIntensity:.12,
        clearcoat:.46,clearcoatRoughness:.24
      });
      const cyan=new T.MeshBasicMaterial({
        color:0x52dfff,transparent:true,opacity:.94,
        depthWrite:false,blending:T.AdditiveBlending
      });

      const shape=new T.Shape();
      shape.moveTo(0,1.16);
      shape.bezierCurveTo(.14,.88,.58,.40,.86,0);
      shape.bezierCurveTo(.58,-.40,.14,-.88,0,-1.16);
      shape.bezierCurveTo(-.14,-.88,-.58,-.40,-.86,0);
      shape.bezierCurveTo(-.58,.40,-.14,.88,0,1.16);

      const extrude=new T.ExtrudeGeometry(shape,{
        depth:.28,bevelEnabled:true,bevelSegments:4,steps:1,
        bevelSize:.065,bevelThickness:.070,curveSegments:20
      });
      extrude.center();

      this.coreShell=new T.Mesh(extrude,shellMat);
      this.coreShell.scale.set(.90,.92,1.10);
      this.coreGroup.add(this.coreShell);

      this.corePetalMaterial=new T.MeshPhysicalMaterial({
        color:0x091820,metalness:.48,roughness:.26,
        emissive:0x082a34,emissiveIntensity:.24,
        clearcoat:.72,clearcoatRoughness:.16,
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
      this.coreGlass.scale.set(.70,.71,.82);
      this.coreGlass.position.z=.13;
      this.coreGroup.add(this.coreGlass);

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
        color:0x2b7d8d,transparent:true,opacity:.012,
        side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending
      });
      const diamond=new T.Mesh(new T.PlaneGeometry(.86,.86),diamondMat);
      diamond.rotation.z=Math.PI/4;
      diamond.position.z=-.02;
      this.irisGroup.add(diamond);

      const diamondEdge=new T.LineSegments(
        new T.EdgesGeometry(new T.PlaneGeometry(.90,.90)),
        new T.LineBasicMaterial({
          color:0x69c8d7,transparent:true,opacity:.055,
          depthWrite:false,blending:T.AdditiveBlending
        })
      );
      diamondEdge.rotation.z=Math.PI/4;diamondEdge.position.z=.01;
      this.irisGroup.add(diamondEdge);

      const ring1=new T.Mesh(new T.TorusGeometry(.218,.014,10,80),cyan.clone());
      ring1.material.opacity=.30;
      const ring2=new T.Mesh(new T.TorusGeometry(.320,.007,8,80),cyan.clone());
      ring2.material.opacity=.10;
      const pupil=new T.Mesh(new T.CircleGeometry(.112,64),new T.MeshBasicMaterial({color:0x073441,side:T.DoubleSide}));
      const pupilRing=new T.Mesh(new T.RingGeometry(.118,.150,72),cyan.clone());
      pupilRing.material.opacity=.30;
      this.irisGroup.add(ring2,ring1,pupil,pupilRing);

      const rayMat=new T.LineBasicMaterial({color:0x45d8ff,transparent:true,opacity:.40,depthWrite:false,blending:T.AdditiveBlending});
      const rays=[];
      for(let i=0;i<64;i++){
        const a=i/64*Math.PI*2;
        const inner=.166+(i%3)*.006;
        const outer=.470+(i%7)*.012;
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
      this.irisCorona.scale.set(.84,.84,1);
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
      this.coreLabel.scale.set(.88,.22,1);
      this.coreLabel.position.set(0,-.05,.38);
      this.coreGroup.add(this.coreLabel);

      this.coreGroup.scale.setScalar(.001);
    }


    makeOrganicLayer(){
      const T=this.THREE,r=this.rand;

      this.organicShellMaterial=new T.MeshPhysicalMaterial({
        color:0x140d1e,roughness:.78,metalness:.012,
        clearcoat:.10,clearcoatRoughness:.58,
        transparent:true,opacity:0,
        emissive:0x1c0b2a,emissiveIntensity:.24,
        depthWrite:true
      });
      this.organicLobeMaterial=new T.MeshPhysicalMaterial({
        color:0x2b193d,roughness:.72,metalness:.015,
        clearcoat:.12,clearcoatRoughness:.54,
        transparent:true,opacity:0,
        emissive:0x261036,emissiveIntensity:.27,
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
      const lobeGeo=new T.IcosahedronGeometry(.265,3);
      const count=46;
      for(let i=0;i<count;i++){
        const phi=Math.acos(1-2*(i+.5)/count);
        const theta=Math.PI*(1+Math.sqrt(5))*i;
        const rr=1.29+(r()-.5)*.10;
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
        color:0x432958,roughness:.69,metalness:.01,
        emissive:0x331748,emissiveIntensity:.38,
        transparent:true,opacity:0,depthWrite:true
      });
      this.organicFoldGlowMaterial=new T.MeshBasicMaterial({
        color:0x5edff1,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.organicFolds=new T.Group();
      for(let i=0;i<34;i++){
        const baseA=-1.10+r()*2.20;
        const baseP=.30+r()*2.42;
        const phase=r()*Math.PI*2;
        const pts=[];
        for(let j=0;j<9;j++){
          const u=(j-4)/8;
          const a=baseA+u*(.30+r()*.18)+Math.sin(j*.88+phase)*.050;
          const p=Math.max(.17,Math.min(2.97,baseP+u*(.42+r()*.16)+Math.sin(j*1.13+phase)*.042));
          const rr=1.365+(r()-.5)*.018;
          pts.push(new T.Vector3(
            Math.sin(p)*Math.sin(a)*rr,
            Math.cos(p)*rr,
            Math.sin(p)*Math.cos(a)*rr*.72+.030
          ));
        }
        const curve=new T.CatmullRomCurve3(pts,false,'centripetal');
        const fold=new T.Mesh(new T.TubeGeometry(curve,34,.042,7,false),this.organicFoldMaterial);
        const glow=new T.Mesh(new T.TubeGeometry(curve,34,.0075,5,false),this.organicFoldGlowMaterial);
        fold.userData.phase=phase;
        this.organicFolds.add(fold,glow);
      }
      this.organicGroup.add(this.organicFolds);

      this.organicVeinMaterial=new T.MeshBasicMaterial({
        color:0x72e7f6,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.organicVeins=[];
      for(let i=0;i<28;i++){
        const a=r()*Math.PI*2;
        const e=.46+r()*.74;
        const start=new T.Vector3(0,0,.74);
        const end=new T.Vector3(Math.cos(a)*e,Math.sin(a)*e,(r()-.5)*.26);
        const bend=new T.Vector3(
          Math.cos(a+.42*(r()-.5))*e*.56,
          Math.sin(a+.42*(r()-.5))*e*.56,
          .41+(r()-.5)*.20
        );
        const curve=new T.QuadraticBezierCurve3(start,bend,end);
        const vein=new T.Mesh(
          new T.TubeGeometry(curve,20,.007+r()*.003,5,false),
          this.organicVeinMaterial
        );
        vein.userData.phase=r()*Math.PI*2;
        this.organicGroup.add(vein);
        this.organicVeins.push(vein);
      }

      this.organicHoodMaterial=new T.MeshPhysicalMaterial({
        color:0x303744,
        roughness:.54,
        metalness:.13,
        clearcoat:.18,
        clearcoatRoughness:.42,
        transparent:true,
        opacity:0,
        emissive:0x102630,
        emissiveIntensity:.11
      });
      this.organicHoodGroup=new T.Group();

      const hoodShape=new T.Shape();
      hoodShape.moveTo(0,.84);
      hoodShape.bezierCurveTo(.13,.61,.36,.20,.44,-.14);
      hoodShape.bezierCurveTo(.22,-.06,.09,.02,0,.18);
      hoodShape.bezierCurveTo(-.09,.02,-.22,-.06,-.44,-.14);
      hoodShape.bezierCurveTo(-.36,.20,-.13,.61,0,.84);

      const hoodGeo=new T.ExtrudeGeometry(hoodShape,{
        depth:.17,
        bevelEnabled:true,
        bevelSegments:3,
        steps:1,
        bevelSize:.038,
        bevelThickness:.048,
        curveSegments:16
      });
      hoodGeo.center();

      const hoodDefs=[
        [0,.64,.92,.88,.94,.78,0,0],
        [-.32,.48,.90,.70,.80,.70,-.32,.14],
        [.32,.48,.90,.70,.80,.70,.32,-.14]
      ];
      for(const [x,y,z,sx,sy,sz,rz,ry] of hoodDefs){
        const m=new T.Mesh(hoodGeo,this.organicHoodMaterial);
        m.position.set(x,y,z);
        m.scale.set(sx,sy,sz);
        m.rotation.set(-.09,ry,rz);
        this.organicHoodGroup.add(m);
      }
      this.organicGroup.add(this.organicHoodGroup);

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
      for(let i=0;i<34;i++){
        const c=this.cells[(i*17)%this.cells.length];
        const p=c.position.clone();
        const mid=p.clone().multiplyScalar(.50);
        mid.x+=(r()-.5)*.25;mid.y+=(r()-.5)*.25;
        const curve=new T.QuadraticBezierCurve3(new T.Vector3(0,0,.78),mid,p);
        this.cellGroup.add(new T.Line(
          new T.BufferGeometry().setFromPoints(curve.getPoints(18)),
          this.cellVeinMaterial
        ));
      }
      this.cellGroup.scale.setScalar(.001);
    }

    makeMechanicalLayer(){
      const T=this.THREE;

      this.mechMaterial=new T.MeshPhysicalMaterial({
        color:0x07131d,metalness:.94,roughness:.16,
        emissive:0x061e2b,emissiveIntensity:.38,
        clearcoat:.80,clearcoatRoughness:.11,
        transparent:true,opacity:0
      });
      this.mechMidMaterial=new T.MeshPhysicalMaterial({
        color:0x0c2433,metalness:.88,roughness:.18,
        emissive:0x082c3a,emissiveIntensity:.44,
        clearcoat:.72,clearcoatRoughness:.13,
        transparent:true,opacity:0
      });
      this.silverMaterial=new T.MeshPhysicalMaterial({
        color:0xa9bbc3,metalness:.96,roughness:.14,
        emissive:0x173a46,emissiveIntensity:.26,
        clearcoat:.88,clearcoatRoughness:.08,
        transparent:true,opacity:0
      });
      this.mechEdgeMaterial=new T.LineBasicMaterial({
        color:0xaaf6ff,transparent:true,opacity:0,
        blending:T.AdditiveBlending,depthWrite:false
      });

      this.plates=[];
      this.silverParts=[];
      this.mechBodyParts=[];

      // One continuous armored pod silhouette. This is the visual backbone of
      // the final living MAG and prevents the previous "floating triangles" look.
      const bodyShape=new T.Shape();
      bodyShape.moveTo(0,1.34);
      bodyShape.bezierCurveTo(.26,1.18,.67,.68,.94,.22);
      bodyShape.bezierCurveTo(.82,-.22,.62,-.58,.36,-.86);
      bodyShape.bezierCurveTo(.22,-1.02,.10,-1.16,0,-1.28);
      bodyShape.bezierCurveTo(-.10,-1.16,-.22,-1.02,-.36,-.86);
      bodyShape.bezierCurveTo(-.62,-.58,-.82,-.22,-.94,.22);
      bodyShape.bezierCurveTo(-.67,.68,-.26,1.18,0,1.34);

      const bodyGeo=new T.ExtrudeGeometry(bodyShape,{
        depth:.34,
        bevelEnabled:true,
        bevelSegments:4,
        steps:1,
        bevelSize:.055,
        bevelThickness:.075,
        curveSegments:22
      });
      bodyGeo.center();

      this.mechBody=new T.Mesh(bodyGeo,this.mechMaterial);
      this.mechBody.scale.set(1.00,1.00,.88);
      this.mechBody.position.z=-.05;
      this.mechanicalGroup.add(this.mechBody);
      this.mechBodyParts.push(this.mechBody);

      this.mechBodyEdge=new T.LineSegments(
        new T.EdgesGeometry(bodyGeo,18),
        this.mechEdgeMaterial
      );
      this.mechBodyEdge.scale.copy(this.mechBody.scale);
      this.mechBodyEdge.position.copy(this.mechBody.position);
      this.mechanicalGroup.add(this.mechBodyEdge);

      // Recessed central cradle behind the luminous iris.
      const cradleShape=new T.Shape();
      cradleShape.moveTo(0,.72);
      cradleShape.lineTo(.56,0);
      cradleShape.lineTo(0,-.72);
      cradleShape.lineTo(-.56,0);
      cradleShape.closePath();
      const cradleGeo=new T.ExtrudeGeometry(cradleShape,{
        depth:.18,bevelEnabled:true,bevelSegments:3,steps:1,
        bevelSize:.035,bevelThickness:.045,curveSegments:10
      });
      cradleGeo.center();
      this.mechCradle=new T.Mesh(cradleGeo,this.mechMidMaterial);
      this.mechCradle.scale.set(1.03,1.03,.74);
      this.mechCradle.position.z=.20;
      this.mechanicalGroup.add(this.mechCradle);
      this.mechBodyParts.push(this.mechCradle);

      // Broad silver crown matching the reference's armored top.
      const crownShape=new T.Shape();
      crownShape.moveTo(0,1.02);
      crownShape.lineTo(.50,.18);
      crownShape.lineTo(.18,.04);
      crownShape.lineTo(0,.36);
      crownShape.lineTo(-.18,.04);
      crownShape.lineTo(-.50,.18);
      crownShape.closePath();
      const crownGeo=new T.ExtrudeGeometry(crownShape,{
        depth:.16,bevelEnabled:true,bevelSegments:3,steps:1,
        bevelSize:.035,bevelThickness:.04,curveSegments:8
      });
      crownGeo.center();
      this.crown=new T.Mesh(crownGeo,this.silverMaterial);
      this.crown.scale.set(1.15,1.15,.85);
      this.crown.position.set(0,.26,.30);
      this.mechanicalGroup.add(this.crown);
      this.silverParts.push(this.crown);

      // Side armor shoulders are compact and overlap the body, not detached fins.
      const shoulderShape=new T.Shape();
      shoulderShape.moveTo(0,.46);
      shoulderShape.lineTo(.62,.10);
      shoulderShape.lineTo(.46,-.28);
      shoulderShape.lineTo(.10,-.12);
      shoulderShape.closePath();
      const shoulderGeo=new T.ExtrudeGeometry(shoulderShape,{
        depth:.15,bevelEnabled:true,bevelSegments:2,steps:1,
        bevelSize:.03,bevelThickness:.035,curveSegments:6
      });
      shoulderGeo.center();

      const leftShoulder=new T.Mesh(shoulderGeo,this.mechMidMaterial);
      leftShoulder.scale.set(.95,.95,.82);
      leftShoulder.position.set(-.54,.04,.25);
      leftShoulder.rotation.z=.12;
      this.mechanicalGroup.add(leftShoulder);
      this.plates.push(leftShoulder);

      const rightShoulder=new T.Mesh(shoulderGeo,this.mechMidMaterial);
      rightShoulder.scale.set(-.95,.95,.82);
      rightShoulder.position.set(.54,.04,.25);
      rightShoulder.rotation.z=-.12;
      this.mechanicalGroup.add(rightShoulder);
      this.plates.push(rightShoulder);

      // Lower armored jaw and twin spine.
      const jawShape=new T.Shape();
      jawShape.moveTo(0,.20);
      jawShape.lineTo(.36,-.02);
      jawShape.lineTo(.18,-.56);
      jawShape.lineTo(0,-.72);
      jawShape.lineTo(-.18,-.56);
      jawShape.lineTo(-.36,-.02);
      jawShape.closePath();
      const jawGeo=new T.ExtrudeGeometry(jawShape,{
        depth:.18,bevelEnabled:true,bevelSegments:2,steps:1,
        bevelSize:.028,bevelThickness:.035,curveSegments:7
      });
      jawGeo.center();
      this.jaw=new T.Mesh(jawGeo,this.mechMaterial);
      this.jaw.scale.set(.82,.82,.88);
      this.jaw.position.set(0,-.48,.22);
      this.mechanicalGroup.add(this.jaw);
      this.plates.push(this.jaw);

      const spineGeo=new T.BoxGeometry(.09,.40,.12);
      const spineL=new T.Mesh(spineGeo,this.mechMidMaterial);
      spineL.position.set(-.10,-.91,.18);
      spineL.rotation.z=.045;
      const spineR=new T.Mesh(spineGeo,this.mechMidMaterial);
      spineR.position.set(.10,-.91,.18);
      spineR.rotation.z=-.045;
      this.mechanicalGroup.add(spineL,spineR);
      this.plates.push(spineL,spineR);

      // Cyan energy seams.
      this.mechInnerMaterial=new T.MeshBasicMaterial({
        color:0x7af0ff,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.mechInnerRing=new T.Mesh(
        new T.TorusGeometry(.40,.014,8,72),
        this.mechInnerMaterial
      );
      this.mechInnerRing.position.z=.36;
      this.mechanicalGroup.add(this.mechInnerRing);

      this.seamMaterial=new T.MeshBasicMaterial({
        color:0x66ecff,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.seams=[];
      const seamDefs=[
        [0,.55,.34,.36,.022,0],
        [-.53,.03,.33,.26,.018,Math.PI/2],
        [.53,.03,.33,.26,.018,Math.PI/2],
        [0,-.58,.34,.26,.018,0]
      ];
      for(const [x,y,z,len,h,rz] of seamDefs){
        const m=new T.Mesh(new T.BoxGeometry(len,h,.020),this.seamMaterial);
        m.position.set(x,y,z);
        m.rotation.z=rz;
        this.mechanicalGroup.add(m);
        this.seams.push(m);
      }

      this.mechLight=new T.PointLight(0x6eeeff,0,5.5,2);
      this.mechLight.position.set(0,0,.75);
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
        color:0x050e14,metalness:.34,roughness:.38,
        emissive:0x073c48,emissiveIntensity:.34,
        transparent:true,opacity:0
      });
      this.tentacleEdgeMaterial=new T.MeshBasicMaterial({
        color:0x73dfe9,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.tentacleNodeMaterial=new T.PointsMaterial({
        color:0x82e9f7,size:.025,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });
      this.tentacleGlowMaterial=new T.MeshBasicMaterial({
        color:0x42d8ec,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });

      this.tentacles=[];
      const count=9;
      for(let i=0;i<count;i++){
        const base=i/count*Math.PI*2+(r()-.5)*.12;
        const sign=i%2?1:-1;
        const len=1.68+r()*.96;
        const phase=r()*Math.PI*2;
        const pts=[];
        for(let j=0;j<9;j++){
          const u=j/8;
          const radius=1.07+len*u;
          const curl=sign*Math.sin(u*Math.PI*1.80+phase*.18)*(.055+.16*u);
          const a=base+curl;
          const sideWave=Math.sin(u*Math.PI*2.35+phase)*(.035+.075*u);
          pts.push(new T.Vector3(
            Math.cos(a)*radius-Math.sin(a)*sideWave,
            Math.sin(a)*radius+Math.cos(a)*sideWave,
            Math.sin(u*Math.PI*1.85+phase)*(.055+.14*u)
          ));
        }
        const curve=new T.CatmullRomCurve3(pts,false,'centripetal');
        const geo=this.createTaperedTube(curve,62,8,.078+r()*.014,.010+r()*.003);
        const glowGeo=this.createTaperedTube(curve,62,6,.015+r()*.003,.004+r()*.001);
        const mesh=new T.Mesh(geo,this.tentacleMaterial);
        const glow=new T.Mesh(glowGeo,this.tentacleGlowMaterial);
        const wire=new T.Mesh(geo,this.tentacleEdgeMaterial);
        const nodeGeo=new T.BufferGeometry().setFromPoints(curve.getPoints(28).filter((_,idx)=>idx%4===0));
        const nodes=new T.Points(nodeGeo,this.tentacleNodeMaterial);
        const g=new T.Group();
        g.add(mesh,glow,wire,nodes);
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
      const dpr=Math.min(devicePixelRatio||1,this.width<900?1.15:1.6);
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
      const fade=1-smooth((t-2.48)/1.05);
      const intro=ease(t/.52);
      this.dnaGroup.visible=fade>.002;
      this.dnas.forEach((h,i)=>{
        const b=h.userData.base;
        const fly=1-intro;
        h.position.x=b.x*(1+fly*.62);
        h.position.y=b.y*(1+fly*.52);
        h.position.z=b.z+fly*.72;
        h.rotation.x=Math.sin(time*.00050+b.phase)*.11;
        h.rotation.y=Math.sin(time*.00038+b.phase)*.24;
        h.rotation.z=b.rz+time*.000070*(i%2?1:-1);
        const sc=b.s*(.95+.05*intro);
        h.scale.setScalar(sc);
        const bases=h.userData.baseOpacity||[];
        h.userData.materials.forEach((m,mi)=>{
          m.opacity=(bases[mi]??.5)*fade*intro;
        });
      });
    }

    updateCore(t,time){
      let sc=.001;
      if(t<2.55)sc=.34+ease(t/2.55)*.08;
      else if(t<3.35)sc=mix(.42,.62,smooth((t-2.55)/.80));
      else if(t<5.65)sc=.62+Math.sin((t-3.35)*1.02)*.003;
      else if(t<8.95)sc=mix(.62,.46,smooth((t-5.65)/3.30));
      else sc=.44;

      const endMove=smooth((t-9.76)/.22);
      const target=this.targetWorld();
      const tx=target.x*endMove,ty=target.y*endMove;
      const cellSurface=smooth((t-2.52)/.48)*(1-smooth((t-9.48)/.36));
      const surfaceZ=cellSurface*1.08;

      this.coreGroup.position.set(tx,ty,surfaceZ);
      this.organicGroup.position.set(tx,ty,0);
      this.cellGroup.position.set(tx,ty,0);
      this.mechanicalGroup.position.set(tx,ty,.02);
      this.tentacleGroup.position.set(tx,ty,-.04);

      this.coreGroup.scale.setScalar(sc*mix(1,.84,endMove));
      this.coreGroup.rotation.y=Math.sin(time*.00020)*.008;
      this.coreGroup.rotation.x=Math.sin(time*.00024)*.006;

      const early=smooth((t-.10)/.55);
      const eye=smooth((t-2.60)/.40);
      const eyeHold=eye*(1-smooth((t-9.46)/.28));
      const pulse=.980+.020*Math.sin(time*.0048);

      this.coreShell.material.opacity=early*(.32+.06*eyeHold);
      this.coreGlass.material.opacity=early*(.022+.035*eyeHold);
      this.coreEdges.material.opacity=early*(.022+.032*eyeHold);
      if(this.corePetalMaterial)this.corePetalMaterial.opacity=early*(.94+.04*eyeHold);

      this.irisGroup.scale.setScalar((.040+eyeHold*.76)*pulse);
      this.irisRays.rotation.z=time*.000066;
      if(this.irisCorona)this.irisCorona.material.opacity=.72*eyeHold;
      this.glowSprite.material.opacity=(.001+eyeHold*.10)*pulse;
      this.glowSprite.scale.setScalar(1.02+eyeHold*.18);
      this.coreInner.material.opacity=.004+eyeHold*.12;
      this.coreLight.intensity=eyeHold*(3.4+Math.sin(time*.0048)*.26);

      if(this.coreLabel)this.coreLabel.material.opacity=.14*early*(1-smooth((t-2.62)/.30));
    }

    updateOrganic(t,time){
      const grow=smooth((t-1.48)/.86);
      const fade=1-smooth((t-9.46)/.40)*.92;
      const visible=grow*fade;
      this.organicGroup.visible=visible>.002;
      const bodyScale=.001+visible*.999;
      this.organicGroup.scale.set(bodyScale*1.30,bodyScale*1.18,bodyScale);

      this.organicShellMaterial.opacity=.56*visible;
      this.organicLobeMaterial.opacity=.48*visible;
      this.organicWireMaterial.opacity=.001*visible;
      this.organicVeinMaterial.opacity=.74*visible;
      this.organicHoodMaterial.opacity=.86*visible;
      if(this.organicFoldMaterial)this.organicFoldMaterial.opacity=.98*visible;
      if(this.organicFoldGlowMaterial)this.organicFoldGlowMaterial.opacity=.38*visible;

      if(this.organicHoodGroup){
        this.organicHoodGroup.rotation.y=Math.sin(time*.00024)*.020;
        this.organicHoodGroup.rotation.x=Math.sin(time*.00020)*.010;
      }
      this.organicShell.rotation.y=time*.000032;
      this.organicShell.rotation.x=Math.sin(time*.00022)*.012;

      this.organicLobes.forEach((lobe,i)=>{
        const q=1+Math.sin(time*.00102+lobe.userData.phase)*.014*visible;
        const b=lobe.userData.baseScale;
        if(b)lobe.scale.set(b.x*q,b.y*q,b.z*q);
        lobe.rotation.y+=.00009*(i%2?1:-1);
      });
      this.organicVeins.forEach(vein=>{
        vein.rotation.z=Math.sin(time*.00027+vein.userData.phase)*.010;
      });
      if(this.organicFolds){
        this.organicFolds.rotation.y=Math.sin(time*.00016)*.015;
        this.organicFolds.rotation.x=Math.sin(time*.00013)*.008;
      }
    }

    updateCells(t,time){
      const grow=smooth((t-1.68)/.88);
      const fade=1-smooth((t-9.40)/.46)*.94;
      const visible=grow*fade;
      this.cellGroup.visible=visible>.002;
      const cellScale=.001+visible*.99;
      this.cellGroup.scale.set(cellScale*1.28,cellScale*1.16,cellScale);
      this.cellMaterial.opacity=.12*visible;
      this.cellEdgeMaterial.opacity=.0015*visible;
      this.cellVeinMaterial.opacity=.28*visible;
      this.cells.forEach((c,i)=>{
        const q=1+Math.sin(time*.00108+c.userData.phase)*.014*visible;
        c.rotation.y+=.00016*(i%2?1:-1);
        const b=c.userData.baseScale;
        if(b)c.scale.set(b.x*q,b.y*q,b.z*q);
      });
    }

    updateMechanical(t,time){
      // The supplied video remains organic through the 9.25 s flash.
      // The armored R669 native MAG is revealed by the handoff after 10 s.
      const grow=smooth((t-9.58)/.34);
      this.mechanicalGroup.visible=grow>.002;
      this.mechanicalGroup.scale.setScalar(.001+grow*1.02);

      this.mechMaterial.opacity=.995*grow;
      this.mechMidMaterial.opacity=.985*grow;
      this.silverMaterial.opacity=.97*grow;
      this.mechEdgeMaterial.opacity=.30*grow;
      this.mechInnerMaterial.opacity=.70*grow;
      if(this.seamMaterial)this.seamMaterial.opacity=.70*grow;
      this.mechInnerRing.rotation.z=time*.00016;
      if(this.mechLight)this.mechLight.intensity=10.5*grow;

      if(this.mechBody){
        this.mechBody.rotation.y=Math.sin(time*.00022)*.018*grow;
        this.mechBody.rotation.x=Math.sin(time*.00017)*.010*grow;
      }
      if(this.mechCradle)this.mechCradle.rotation.z=Math.sin(time*.00020)*.012*grow;
      if(this.crown)this.crown.rotation.x=-.10+Math.sin(time*.00018)*.015*grow;
    }

    updateTentacles(t,time){
      const grow=smooth((t-5.55)/1.35);
      const flashFade=1-smooth((t-9.50)/.30)*.14;
      this.tentacleGroup.visible=grow>.002;
      this.tentacleMaterial.opacity=.92*grow*flashFade;
      this.tentacleEdgeMaterial.opacity=.006*grow;
      this.tentacleNodeMaterial.opacity=.18*grow;
      if(this.tentacleGlowMaterial)this.tentacleGlowMaterial.opacity=.68*grow;
      this.tentacles.forEach((g,i)=>{
        const wave=1+Math.sin(time*.00074+g.userData.phase)*.008*grow;
        const v=.001+grow*.999;
        g.scale.set(v*wave,v*wave,v*wave);
        g.rotation.z=Math.sin(time*.00038+g.userData.phase)*.017*grow;
        g.rotation.x=Math.sin(time*.00030+g.userData.phase)*.011*grow;
      });
    }

    updateCamera(t,time){
      let z=4.90,y=.022,x=0;
      if(t<2.55){
        const k=smooth(t/2.55);
        z=mix(5.18,5.46,k);
        x=Math.sin(time*.00031)*.090*(1-k*.35);
        y=.018+Math.sin(time*.00027)*.030;
      }else if(t<3.40){
        const k=smooth((t-2.55)/.85);
        z=mix(5.46,3.66,k);
        x=mix(.034,0,k);y=mix(.024,0,k);
      }else if(t<5.55){
        z=3.66+Math.sin(time*.00024)*.012;
        x=Math.sin(time*.00018)*.008;
        y=Math.cos(time*.00021)*.007;
      }else if(t<9.10){
        const k=smooth((t-5.55)/3.55);
        z=mix(3.66,4.58,k);
        y=mix(0,.006,k);
      }else{
        z=mix(4.58,4.76,smooth((t-9.10)/.60));
        y=.006;
      }
      if(this.width<this.height)z+=.92;
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

      this.particles.rotation.z=time*.000018;
      this.particles.rotation.y=time*.000012;
      if(this.debris){
        this.debris.rotation.y=time*.000018;
        this.debris.rotation.z=Math.sin(time*.00011)*.022;
      }
      this.particles.material.opacity=.38+.10*Math.sin(time*.00045);

      const flash=smooth((t-9.15)/.10)*(1-smooth((t-9.55)/.24));
      const after=smooth((t-9.44)/.34);
      this.renderer.toneMappingExposure=1.13+flash*.08+after*.02;
      this.coreLight.intensity+=flash*4+after*2;
      if(this.glowSprite){
        const g=1+flash*2.55;
        this.glowSprite.scale.multiplyScalar(g);
        this.glowSprite.material.opacity=Math.min(1,this.glowSprite.material.opacity+flash*.42);
      }
      if(this.flashBurst){
        this.flashBurst.material.opacity=flash*.82;
        const burstScale=3.8+flash*3.0;
        this.flashBurst.scale.set(burstScale,burstScale,1);
      }
      if(this.flashBeam){
        this.flashBeam.material.opacity=flash*.78;
        this.flashBeam.scale.x=1+flash*1.15;
      }

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
      const visualProof=new URLSearchParams(location.search).get('visualintro')==='1';
      if(!visualProof && isSoftwareWebGL()){
        document.documentElement.dataset.fxMagBirthR800='software-webgl-r649-fallback';
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
        revision:'r800-reference-locked-three-genesis'
      };
    }catch(error){
      console.error('FormatX R800 genesis renderer failed:',error);
      document.documentElement.dataset.fxMagBirthR800='fallback-r649';
      return null;
    }
  }

  document.documentElement.dataset.fxMagBirthThreeR658='r658-csp-local-three-proof';
  document.documentElement.dataset.fxMagBirthProofR658='r658-early-keyframe-proof';
  document.documentElement.dataset.fxMagBirthReferenceR721='frame-locked-source-video-proof';

  window.FormatXMagGenesisThreeR800={
    attach,
    revision:'r800-reference-locked-three-genesis-dna-cellular-living-architecture'
  };
})();