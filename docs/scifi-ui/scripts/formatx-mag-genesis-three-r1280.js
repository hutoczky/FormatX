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
      const rim=new T.PointLight(0x7457ff,26,13,2);
      rim.position.set(2.8,-2.2,3.6);
      this.scene.add(rim);
      const bioticFill=new T.PointLight(0x5b2f9d,18,11,2);
      bioticFill.position.set(-2.4,-.6,3.2);
      this.scene.add(bioticFill);
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
        color:0x6caebc,emissive:0x173746,emissiveIntensity:.62,
        roughness:.48,metalness:.02,transparent:true,opacity:.82,
        depthWrite:false,clearcoat:.20,clearcoatRoughness:.32
      });
      const mb=new T.MeshPhysicalMaterial({
        color:0x735f9f,emissive:0x291d4b,emissiveIntensity:.64,
        roughness:.49,metalness:.02,transparent:true,opacity:.78,
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
        color:0xb7f3ff,size:.034,transparent:true,opacity:.42,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });
      const mpb=new T.PointsMaterial({
        color:0xa994ff,size:.032,transparent:true,opacity:.38,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });

      const tubeA=new T.Mesh(new T.TubeGeometry(curveA,seg,.046,8,false),ma);
      const tubeB=new T.Mesh(new T.TubeGeometry(curveB,seg,.046,8,false),mb);
      const auraA=new T.Mesh(new T.TubeGeometry(curveA,seg,.078,7,false),ga);
      const auraB=new T.Mesh(new T.TubeGeometry(curveB,seg,.078,7,false),gb);

      const rungGeo=new T.CylinderGeometry(.027,.027,1,8,1,false);
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
      group.userData.baseOpacity=[.82,.76,.050,.046,.80,.42,.38];
      return group;
    }

    makeDNAField(){
      const placements=[
        [-2.34,1.34,.60,-.48,.96],
        [2.30,1.36,.64,.46,.94],
        [-2.26,-1.32,.56,.42,.98],
        [2.28,-1.28,.58,-.44,.96],
        [-.16,2.06,.18,1.52,.82],
        [.18,-2.02,.20,1.58,.82],
        [-3.00,.08,-.44,1.50,.66],
        [2.98,.04,-.42,1.60,.66],
        [-1.42,.18,-1.08,-.12,.68],
        [1.48,.10,-1.02,.10,.66]
      ];
      this.dnas=[];
      for(const [x,y,z,rz,sc] of placements){
        const h=this.createHelix(4.08,.272,3.82);
        h.position.set(x,y,z);
        h.rotation.z=rz;
        h.rotation.y=(this.rand()-.5)*.24;
        h.scale.setScalar(sc);
        h.userData.base={x,y,z,rz,s:sc,phase:this.rand()*Math.PI*2};
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


    makeOrganicLayer(){
      const T=this.THREE,r=this.rand;

      this.organicShellMaterial=new T.MeshPhysicalMaterial({
        color:0x160d20,roughness:.66,metalness:.010,
        clearcoat:.11,clearcoatRoughness:.54,
        transparent:true,opacity:0,
        emissive:0x1c0b29,emissiveIntensity:.18,
        depthWrite:true
      });
      this.organicLobeMaterial=new T.MeshPhysicalMaterial({
        color:0x25162e,roughness:.70,metalness:.006,
        clearcoat:.08,clearcoatRoughness:.62,
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
        color:0x08171b,metalness:.10,roughness:.115,
        transmission:.32,thickness:.42,ior:1.45,
        emissive:0x041216,emissiveIntensity:.065,
        clearcoat:.98,clearcoatRoughness:.065,
        transparent:true,opacity:0
      });
      this.mechMidMaterial=new T.MeshPhysicalMaterial({
        color:0x0a2025,metalness:.08,roughness:.105,
        transmission:.38,thickness:.32,ior:1.46,
        emissive:0x04191d,emissiveIntensity:.075,
        clearcoat:.98,clearcoatRoughness:.060,
        transparent:true,opacity:0
      });
      this.silverMaterial=new T.MeshPhysicalMaterial({
        color:0xb8c8c6,metalness:.12,roughness:.085,
        transmission:.28,thickness:.22,ior:1.42,
        emissive:0x0a252b,emissiveIntensity:.070,
        clearcoat:1.0,clearcoatRoughness:.050,
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
      this.mechCradle.scale.set(.92,.92,.76);
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

      const crownL=new T.Mesh(topPlateGeo,this.silverMaterial);
      crownL.scale.set(.56,.90,.76);
      crownL.position.set(-.14,.40,.31);
      crownL.rotation.z=-.10;
      this.mechanicalGroup.add(crownL);
      this.silverParts.push(crownL);
      crownL.visible=false;

      const crownR=new T.Mesh(topPlateGeo,this.silverMaterial);
      crownR.scale.set(-.56,.90,.76);
      crownR.position.set(.14,.40,.31);
      crownR.rotation.z=.10;
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
      left.scale.set(.66,.70,.74);
      left.position.set(-.48,.00,.28);
      left.rotation.z=.05;
      this.mechanicalGroup.add(left);
      this.plates.push(left);
      left.visible=false;

      const right=new T.Mesh(sideGeo,this.silverMaterial);
      right.scale.set(-.66,.70,.74);
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
      this.jaw.scale.set(.84,.86,.76);
      this.jaw.position.set(0,-.39,.28);
      this.mechanicalGroup.add(this.jaw);
      this.plates.push(this.jaw);
      this.jaw.visible=false;

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
        new T.CircleGeometry(.082,64),
        new T.MeshBasicMaterial({color:0x0a3037,transparent:true,opacity:.88,side:T.DoubleSide})
      );
      this.mechEyeCore.position.set(0,.01,.50);
      this.mechanicalGroup.add(this.mechEyeCore);

      this.mechInnerMaterial=new T.MeshBasicMaterial({
        color:0x8af6f5,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.mechInnerRing=new T.Mesh(
        new T.TorusGeometry(.148,.0055,8,72),
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
      const fade=1-smooth((t-2.70)/.78);
      const intro=ease(t/.42);
      this.dnaGroup.visible=fade>.002;
      this.dnas.forEach((h,i)=>{
        const b=h.userData.base;
        const fly=1-intro;
        h.position.x=b.x*(1+fly*.38);
        h.position.y=b.y*(1+fly*.34);
        h.position.z=b.z+fly*.54;
        h.rotation.x=Math.sin(time*.00045+b.phase)*.082;
        h.rotation.y=Math.sin(time*.00033+b.phase)*.17;
        h.rotation.z=b.rz+time*.000058*(i%2?1:-1);
        h.scale.setScalar(b.s*(.95+.05*intro));
        const bases=h.userData.baseOpacity||[];
        h.userData.materials.forEach((m,mi)=>{
          m.opacity=(bases[mi]??.5)*fade*intro*.84;
        });
      });
    }

    updateCore(t,time){
      let sc;
      if(t<2.52) sc=1.28+ease(t/2.52)*.12;
      else if(t<3.28) sc=mix(1.40,.34,smooth((t-2.52)/.76));
      else if(t<5.58) sc=.36+Math.sin((t-3.28)*1.02)*.002;
      else if(t<7.15) sc=mix(.36,.30,smooth((t-5.58)/1.57));
      else sc=.30;

      const endMove=smooth((t-9.78)/.20);
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

      const stage1=1-smooth((t-2.60)/.42);
      const reveal=smooth((t-2.68)/.46);
      const eyeHold=reveal*(1-smooth((t-6.35)/.78));
      const preFlash=1-smooth((t-6.55)/.72);
      const pulse=.988+.012*Math.sin(time*.0046);

      this.coreShell.material.opacity=.96*stage1+.16*reveal*preFlash;
      this.coreGlass.material.opacity=.08*stage1+.015*reveal*preFlash;
      this.coreEdges.material.opacity=.16*stage1+.012*reveal*preFlash;
      if(this.corePetalMaterial)this.corePetalMaterial.opacity=.72*stage1+.065*reveal*preFlash;

      this.irisGroup.scale.setScalar((.018+eyeHold*.72)*pulse);
      this.irisRays.rotation.z=time*.000050;
      if(this.irisCorona)this.irisCorona.material.opacity=.76*eyeHold;
      this.glowSprite.material.opacity=(.001+eyeHold*.010)*pulse;
      this.glowSprite.scale.setScalar(.80+eyeHold*.05);
      this.coreInner.material.opacity=.0015+eyeHold*.018;
      this.coreLight.intensity=eyeHold*(2.4+Math.sin(time*.0046)*.10);

      if(this.coreLabel)this.coreLabel.material.opacity=.52*stage1+.028*reveal*(1-smooth((t-3.08)/.32));
    }

    updateOrganic(t,time){
      const grow=smooth((t-2.48)/.72);
      const fade=1-smooth((t-6.20)/1.15)*.96;
      const visible=grow*fade;
      this.organicGroup.visible=visible>.002;
      const bodyScale=.001+visible*.999;
      this.organicGroup.scale.set(bodyScale*1.12,bodyScale*1.08,bodyScale*1.02);

      this.organicShellMaterial.opacity=.58*visible;
      this.organicLobeMaterial.opacity=.70*visible;
      this.organicWireMaterial.opacity=.0003*visible;
      this.organicVeinMaterial.opacity=.34*visible;
      this.organicHoodMaterial.opacity=.42*visible;
      if(this.organicFoldMaterial)this.organicFoldMaterial.opacity=.42*visible;
      if(this.organicFoldGlowMaterial)this.organicFoldGlowMaterial.opacity=.07*visible;

      if(this.organicHoodGroup){
        this.organicHoodGroup.scale.setScalar(.92);
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
      if(this.organicPrimaryVeinMaterial)this.organicPrimaryVeinMaterial.opacity=.10*visible;
      this.organicPrimaryVeins?.forEach((vein,i)=>{
        vein.rotation.z=Math.sin(time*.00019+(vein.userData.phase||i))*.0035;
      });
      if(this.organicFolds){
        this.organicFolds.rotation.y=Math.sin(time*.00015)*.010;
        this.organicFolds.rotation.x=Math.sin(time*.00012)*.005;
      }
    }

    updateCells(t,time){
      const grow=smooth((t-2.60)/.70);
      const fade=1-smooth((t-6.25)/1.10)*.96;
      const visible=grow*fade;
      this.cellGroup.visible=visible>.002;
      const cellScale=.001+visible*.99;
      this.cellGroup.scale.set(cellScale*1.10,cellScale*1.06,cellScale);
      this.cellMaterial.opacity=.085*visible;
      this.cellEdgeMaterial.opacity=.0005*visible;
      this.cellVeinMaterial.opacity=.12*visible;
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
      const grow=smooth((t-6.25)/.90);
      const finale=smooth((t-7.20)/1.65);
      this.mechanicalGroup.visible=grow>.002;
      this.mechanicalGroup.scale.set(.001+grow*1.04,.001+grow*1.04,.001+grow*1.02);

      /* R1945k — studio-smoked material convergence, not a flash.
         The final 2.5 s gradually become the same smoked-silver/cyan bioglass
         family as the permanent hero, so handoff reads as one continuous object. */
      this.mechMaterial.color.setRGB(
        mix(.031,.090,finale),
        mix(.090,.175,finale),
        mix(.106,.185,finale)
      );
      this.mechMidMaterial.color.setRGB(
        mix(.039,.075,finale),
        mix(.125,.160,finale),
        mix(.145,.175,finale)
      );
      this.silverMaterial.color.setRGB(
        mix(.480,.440,finale),
        mix(.575,.540,finale),
        mix(.565,.530,finale)
      );
      this.mechMaterial.transmission=mix(.32,.36,finale);
      this.mechMidMaterial.transmission=mix(.38,.42,finale);
      this.mechMaterial.roughness=mix(.115,.135,finale);
      this.mechMidMaterial.roughness=mix(.105,.125,finale);
      this.silverMaterial.roughness=mix(.085,.100,finale);

      this.mechMaterial.opacity=(.90+.028*finale)*grow;
      this.mechMidMaterial.opacity=(.67+.052*finale)*grow;
      this.silverMaterial.opacity=(.36+.055*finale)*grow;
      this.mechEdgeMaterial.opacity=(.020+.010*finale)*grow;
      this.mechInnerMaterial.opacity=(.22+.035*finale)*grow;
      if(this.seamMaterial)this.seamMaterial.opacity=(.06-.020*finale)*grow;
      if(this.mechEyeCorona)this.mechEyeCorona.material.opacity=(.22+.022*finale)*grow;
      this.mechInnerRing.rotation.z=time*.00012;
      if(this.mechLight)this.mechLight.intensity=(1.35+.25*finale)*grow;

      if(this.mechBody){
        this.mechBody.rotation.y=Math.sin(time*.00018)*.008*grow;
        this.mechBody.rotation.x=Math.sin(time*.00015)*.005*grow;
      }
      if(this.mechCradle)this.mechCradle.rotation.z=Math.sin(time*.00016)*.006*grow;
      this.silverParts.forEach((p,i)=>{
        p.rotation.y=Math.sin(time*.00015+i)*.006*grow;
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
        x=Math.sin(time*.00027)*.040*(1-k*.35);
        y=.010+Math.sin(time*.00024)*.015;
      }else if(t<3.30){
        const k=smooth((t-2.70)/.60);
        z=mix(5.12,3.86,k);
        x=mix(.018,0,k);y=mix(.012,0,k);
      }else if(t<5.55){
        z=3.86+Math.sin(time*.00020)*.006;
        x=Math.sin(time*.00015)*.003;
        y=Math.cos(time*.00018)*.003;
      }else if(t<7.25){
        const k=smooth((t-5.55)/1.70);
        z=mix(3.86,4.28,k);
        y=mix(0,.003,k);
      }else if(t<9.10){
        z=4.28+Math.sin(time*.00018)*.006;
        y=.003;
      }else{
        z=mix(4.28,4.40,smooth((t-9.10)/.60));
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

      this.particles.rotation.z=time*.000018;
      this.particles.rotation.y=time*.000012;
      if(this.debris){
        this.debris.rotation.y=time*.000018;
        this.debris.rotation.z=Math.sin(time*.00011)*.022;
      }
      this.particles.material.opacity=.38+.10*Math.sin(time*.00045);

      const flash=smooth((t-9.12)/.16)*(1-smooth((t-9.50)/.30));
      /* R1945l — finale energy remains below clipping and converges to the permanent hero tone. */
      const after=smooth((t-9.46)/.34);
      this.renderer.toneMappingExposure=1.10+flash*.012+after*.004;
      this.coreLight.intensity+=flash*.80+after*.25;
      if(this.glowSprite){
        const g=1+flash*.10;
        this.glowSprite.scale.multiplyScalar(g);
        this.glowSprite.material.opacity=Math.min(.12,this.glowSprite.material.opacity+flash*.035);
      }
      if(this.flashBurst){
        this.flashBurst.material.opacity=flash*.028;
        const burstScale=2.18+flash*.18;
        this.flashBurst.scale.set(burstScale,burstScale,1);
      }
      if(this.flashBeam){
        this.flashBeam.material.opacity=flash*.012;
        this.flashBeam.scale.x=1+flash*.08;
      }
      if(this.mechEyeCorona){
        this.mechEyeCorona.material.opacity=Math.min(.42,.34+flash*.04);
        const q=1.00+flash*.04;
        this.mechEyeCorona.scale.set(q,q,1);
      }
      if(this.mechLight)this.mechLight.intensity+=flash*1.20;

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
  document.documentElement.dataset.fxMagSignatureR1945='controlled-softbox-finale-no-whiteout-prism-optic-handoff';
  document.documentElement.dataset.fxMagSignatureR1945d='single-body-no-petals-restrained-optic-micro-ridges';
})();