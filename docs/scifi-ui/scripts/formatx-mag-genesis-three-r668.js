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
      this.renderer.setClearColor(0x02070d,1);
      this.renderer.outputColorSpace=THREE.SRGBColorSpace;
      this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure=1.16;

      this.scene=new THREE.Scene();
      this.scene.background=new THREE.Color(0x02070d);
      this.scene.fog=new THREE.FogExp2(0x02070d,0.075);

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
      this.scene.add(new T.HemisphereLight(0x5fc8e8,0x05030d,0.72));
      const key=new T.DirectionalLight(0xc7f4ff,1.75);
      key.position.set(-3.5,5,6);
      this.scene.add(key);
      const rim=new T.PointLight(0x6847ff,16,13,2);
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
      const count=360;
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
        color:0x9bdff0,size:.022,transparent:true,opacity:.52,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });
      this.particles=new T.Points(g,m);
      this.scene.add(this.particles);
    }

    createHelix(length=4.7,radius=.28,turns=4.1){
      const T=this.THREE;
      const group=new T.Group();
      const seg=80;
      const aPts=[],bPts=[],rungs=[],beadA=[],beadB=[];
      for(let i=0;i<=seg;i++){
        const u=i/seg;
        const x=(u-.5)*length;
        const q=u*Math.PI*2*turns;
        const y=Math.sin(q)*radius;
        const z=Math.cos(q)*radius;
        const a=new T.Vector3(x,y,z),b=new T.Vector3(x,-y,-z);
        aPts.push(a);bPts.push(b);
        if(i%4===0){
          rungs.push(a.x,a.y,a.z,b.x,b.y,b.z);
          beadA.push(a.x,a.y,a.z);beadB.push(b.x,b.y,b.z);
        }
      }
      const curveA=new T.CatmullRomCurve3(aPts,false,'centripetal');
      const curveB=new T.CatmullRomCurve3(bPts,false,'centripetal');
      const ma=new T.MeshBasicMaterial({color:0x72eaff,transparent:true,opacity:.78,depthWrite:false,blending:T.AdditiveBlending});
      const mb=new T.MeshBasicMaterial({color:0x8870e9,transparent:true,opacity:.66,depthWrite:false,blending:T.AdditiveBlending});
      const ga=new T.MeshBasicMaterial({color:0x55dfff,transparent:true,opacity:.08,depthWrite:false,blending:T.AdditiveBlending});
      const gb=new T.MeshBasicMaterial({color:0x7359d8,transparent:true,opacity:.07,depthWrite:false,blending:T.AdditiveBlending});
      const mr=new T.LineBasicMaterial({color:0xc9f8ff,transparent:true,opacity:.42,depthWrite:false,blending:T.AdditiveBlending});
      const mpa=new T.PointsMaterial({color:0xcafaff,size:.045,transparent:true,opacity:.72,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true});
      const mpb=new T.PointsMaterial({color:0xb9a0ff,size:.043,transparent:true,opacity:.64,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true});

      const tubeA=new T.Mesh(new T.TubeGeometry(curveA,seg,.016,5,false),ma);
      const tubeB=new T.Mesh(new T.TubeGeometry(curveB,seg,.016,5,false),mb);
      const auraA=new T.Mesh(new T.TubeGeometry(curveA,seg,.036,5,false),ga);
      const auraB=new T.Mesh(new T.TubeGeometry(curveB,seg,.036,5,false),gb);
      const gr=new T.BufferGeometry();gr.setAttribute('position',new T.Float32BufferAttribute(rungs,3));
      const pga=new T.BufferGeometry();pga.setAttribute('position',new T.Float32BufferAttribute(beadA,3));
      const pgb=new T.BufferGeometry();pgb.setAttribute('position',new T.Float32BufferAttribute(beadB,3));
      group.add(auraA,auraB,tubeA,tubeB,new T.LineSegments(gr,mr),new T.Points(pga,mpa),new T.Points(pgb,mpb));
      group.userData.materials=[ma,mb,ga,gb,mr,mpa,mpb];
      group.userData.baseOpacity=[.78,.66,.08,.07,.42,.72,.64];
      return group;
    }

    makeDNAField(){
      const placements=[
        [-2.60,1.62,.30,-.43,.86],
        [2.58,1.58,.36,.40,.84],
        [-2.64,-1.52,.20,.34,.82],
        [2.60,-1.50,.24,-.36,.84],
        [0,2.22,-.42,1.57,.68],
        [0,-2.20,-.36,1.57,.68],
        [-3.34,.00,-.75,1.56,.66],
        [3.32,.03,-.70,1.58,.66]
      ];
      this.dnas=[];
      for(const [x,y,z,rz,sc] of placements){
        const h=this.createHelix(4.15,.225,4.05);
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

    makeCore(){
      const T=this.THREE;

      const shellMat=new T.MeshPhysicalMaterial({
        color:0x071019,metalness:.84,roughness:.20,
        emissive:0x071825,emissiveIntensity:.28,
        clearcoat:.65,clearcoatRoughness:.17,
        transparent:true,opacity:.99
      });
      const shellGlass=new T.MeshPhysicalMaterial({
        color:0x17384b,metalness:.34,roughness:.11,
        transparent:true,opacity:.19,depthWrite:false,
        emissive:0x0d6075,emissiveIntensity:.23,
        clearcoat:.82,clearcoatRoughness:.10
      });
      const cyan=new T.MeshBasicMaterial({
        color:0xa5f9ff,transparent:true,opacity:.94,
        depthWrite:false,blending:T.AdditiveBlending
      });

      const shape=new T.Shape();
      shape.moveTo(0,1.16);
      shape.bezierCurveTo(.14,.88,.58,.40,.86,0);
      shape.bezierCurveTo(.58,-.40,.14,-.88,0,-1.16);
      shape.bezierCurveTo(-.14,-.88,-.58,-.40,-.86,0);
      shape.bezierCurveTo(-.58,.40,-.14,.88,0,1.16);

      const extrude=new T.ExtrudeGeometry(shape,{
        depth:.18,bevelEnabled:true,bevelSegments:3,steps:1,
        bevelSize:.055,bevelThickness:.055,curveSegments:18
      });
      extrude.center();

      this.coreShell=new T.Mesh(extrude,shellMat);
      this.coreShell.scale.set(.92,.92,.92);
      this.coreGroup.add(this.coreShell);

      this.coreGlass=new T.Mesh(extrude,shellGlass);
      this.coreGlass.scale.set(.73,.73,.64);
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
        color:0x4edcf5,transparent:true,opacity:.13,
        side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending
      });
      const diamond=new T.Mesh(new T.PlaneGeometry(.86,.86),diamondMat);
      diamond.rotation.z=Math.PI/4;
      diamond.position.z=-.02;
      this.irisGroup.add(diamond);

      const diamondEdge=new T.LineSegments(
        new T.EdgesGeometry(new T.PlaneGeometry(.90,.90)),
        new T.LineBasicMaterial({
          color:0xc3fbff,transparent:true,opacity:.70,
          depthWrite:false,blending:T.AdditiveBlending
        })
      );
      diamondEdge.rotation.z=Math.PI/4;diamondEdge.position.z=.01;
      this.irisGroup.add(diamondEdge);

      const ring1=new T.Mesh(new T.TorusGeometry(.205,.022,10,64),cyan.clone());
      const ring2=new T.Mesh(new T.TorusGeometry(.305,.009,8,64),cyan.clone());
      ring2.material.opacity=.27;
      const pupil=new T.Mesh(new T.CircleGeometry(.105,48),new T.MeshBasicMaterial({color:0x01070b,side:T.DoubleSide}));
      const pupilRing=new T.Mesh(new T.RingGeometry(.112,.145,56),cyan.clone());
      pupilRing.material.opacity=.76;
      this.irisGroup.add(ring2,ring1,pupil,pupilRing);

      const rayMat=new T.LineBasicMaterial({color:0x98f3ff,transparent:true,opacity:.12,depthWrite:false,blending:T.AdditiveBlending});
      const rays=[];
      for(let i=0;i<24;i++){
        const a=i/24*Math.PI*2;
        rays.push(Math.cos(a)*.16,Math.sin(a)*.16,.012,Math.cos(a)*.32,Math.sin(a)*.32,.012);
      }
      const rayGeo=new T.BufferGeometry();rayGeo.setAttribute('position',new T.Float32BufferAttribute(rays,3));
      this.irisRays=new T.LineSegments(rayGeo,rayMat);
      this.irisGroup.add(this.irisRays);

      this.irisGroup.position.z=.26;
      this.coreGroup.add(this.irisGroup);

      this.glowSprite=new T.Sprite(new T.SpriteMaterial({
        map:this.makeGlowTexture(),transparent:true,opacity:.82,
        blending:T.AdditiveBlending,depthWrite:false
      }));
      this.glowSprite.scale.set(2.10,2.10,1);
      this.glowSprite.position.z=.17;
      this.coreGroup.add(this.glowSprite);

      this.coreInner=new T.Mesh(new T.OctahedronGeometry(.17,1),new T.MeshBasicMaterial({
        color:0x8ff7ff,transparent:true,opacity:.92,
        depthWrite:false,blending:T.AdditiveBlending
      }));
      this.coreInner.scale.set(.90,1.15,.55);
      this.coreInner.rotation.z=Math.PI/4;
      this.coreInner.position.z=.28;
      this.coreGroup.add(this.coreInner);

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
        color:0x0d0a17,roughness:.82,metalness:.02,
        clearcoat:.08,clearcoatRoughness:.66,
        transparent:true,opacity:0,
        emissive:0x13091f,emissiveIntensity:.18,
        depthWrite:true
      });
      this.organicLobeMaterial=new T.MeshPhysicalMaterial({
        color:0x21132f,roughness:.66,metalness:.03,
        clearcoat:.14,clearcoatRoughness:.50,
        transparent:true,opacity:0,
        emissive:0x28113b,emissiveIntensity:.33,
        depthWrite:true
      });
      this.organicWireMaterial=new T.MeshBasicMaterial({
        color:0x67dded,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });

      const shell=new T.Mesh(new T.IcosahedronGeometry(1.40,3),this.organicShellMaterial);
      shell.scale.set(1.00,1.04,.80);
      const wire=new T.Mesh(new T.IcosahedronGeometry(1.415,1),this.organicWireMaterial);
      wire.scale.copy(shell.scale);
      this.organicShell=shell;this.organicWire=wire;
      this.organicGroup.add(shell,wire);

      this.organicLobes=[];
      const lobeGeo=new T.IcosahedronGeometry(.205,2);
      const count=68;
      for(let i=0;i<count;i++){
        const phi=Math.acos(1-2*(i+.5)/count);
        const theta=Math.PI*(1+Math.sqrt(5))*i;
        const rr=1.34+(r()-.5)*.13;
        const lobe=new T.Mesh(lobeGeo,this.organicLobeMaterial);
        lobe.position.set(
          Math.sin(phi)*Math.cos(theta)*rr,
          Math.cos(phi)*rr,
          Math.sin(phi)*Math.sin(theta)*rr*.72
        );
        const k=.72+r()*.30;
        lobe.scale.set(k,k*(.82+r()*.23),k*(.86+r()*.20));
        lobe.rotation.set(r()*2.2,r()*2.2,r()*2.2);
        lobe.userData.phase=r()*Math.PI*2;
        lobe.userData.baseScale=lobe.scale.clone();
        this.organicGroup.add(lobe);this.organicLobes.push(lobe);
      }

      this.organicVeinMaterial=new T.LineBasicMaterial({
        color:0x78e9fb,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.organicHoodMaterial=new T.MeshPhysicalMaterial({
        color:0x211a2d,roughness:.74,metalness:.04,
        clearcoat:.10,clearcoatRoughness:.58,
        transparent:true,opacity:0,
        emissive:0x1a0f2b,emissiveIntensity:.12
      });
      this.organicHoodGroup=new T.Group();
      const hoodGeo=new T.IcosahedronGeometry(.36,2);
      const hoodDefs=[
        [-.40,.62,1.03,.50,.78,.34,-.24],
        [-.20,.70,1.07,.54,.88,.36,-.12],
        [0,.74,1.10,.58,.92,.38,0],
        [.20,.70,1.07,.54,.88,.36,.12],
        [.40,.62,1.03,.50,.78,.34,.24]
      ];
      for(const [x,y,z,sx,sy,sz,rz] of hoodDefs){
        const m=new T.Mesh(hoodGeo,this.organicHoodMaterial);
        m.position.set(x,y,z);
        m.scale.set(sx,sy,sz);
        m.rotation.z=rz;
        this.organicHoodGroup.add(m);
      }
      this.organicGroup.add(this.organicHoodGroup);

      this.organicVeins=[];
      for(let i=0;i<38;i++){
        const a=r()*Math.PI*2;
        const e=.44+r()*.82;
        const start=new T.Vector3(0,0,.60);
        const end=new T.Vector3(Math.cos(a)*e,Math.sin(a)*e,(r()-.5)*.35);
        const bend=new T.Vector3(
          Math.cos(a+.52*(r()-.5))*e*.56,
          Math.sin(a+.52*(r()-.5))*e*.56,
          .34+(r()-.5)*.28
        );
        const curve=new T.QuadraticBezierCurve3(start,bend,end);
        const line=new T.Line(
          new T.BufferGeometry().setFromPoints(curve.getPoints(18)),
          this.organicVeinMaterial
        );
        line.userData.phase=r()*Math.PI*2;
        this.organicGroup.add(line);this.organicVeins.push(line);
      }
      this.organicGroup.scale.setScalar(.001);
    }

    makeCellularLayer(){
      const T=this.THREE,r=this.rand;
      this.cellMaterial=new T.MeshStandardMaterial({
        color:0x241334,roughness:.76,metalness:.02,
        emissive:0x28123d,emissiveIntensity:.30,
        transparent:true,opacity:0
      });
      this.cellEdgeMaterial=new T.MeshBasicMaterial({
        color:0x65cbdc,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      const blobGeo=new T.IcosahedronGeometry(.165,2);
      const edgeGeo=new T.IcosahedronGeometry(.168,1);
      this.cells=[];
      const count=84;
      for(let i=0;i<count;i++){
        const phi=Math.acos(1-2*(i+.5)/count);
        const theta=Math.PI*(1+Math.sqrt(5))*i;
        const rr=1.40+(r()-.5)*.13;
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
        color:0x08242e,metalness:.56,roughness:.23,
        emissive:0x0a6476,emissiveIntensity:.74,
        transparent:true,opacity:0
      });
      this.tentacleEdgeMaterial=new T.MeshBasicMaterial({
        color:0x83efff,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.tentacleNodeMaterial=new T.PointsMaterial({
        color:0x8cf3ff,size:.035,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });
      this.tentacles=[];
      const count=8;
      for(let i=0;i<count;i++){
        const a=i/count*Math.PI*2+(r()-.5)*.18;
        const start=new T.Vector3(Math.cos(a)*.92,Math.sin(a)*.92,(r()-.5)*.10);
        const dir=new T.Vector3(Math.cos(a),Math.sin(a),0);
        const side=new T.Vector3(-dir.y,dir.x,0);
        const len=1.35+r()*.86;
        const sign=i%2?1:-1;
        const points=[
          start,
          start.clone().addScaledVector(dir,len*.30).addScaledVector(side,sign*(.24+r()*.25)).add(new T.Vector3(0,0,(r()-.5)*.24)),
          start.clone().addScaledVector(dir,len*.64).addScaledVector(side,-sign*(.30+r()*.34)).add(new T.Vector3(0,0,(r()-.5)*.38)),
          start.clone().addScaledVector(dir,len).addScaledVector(side,sign*(.18+r()*.24)).add(new T.Vector3(0,0,(r()-.5)*.46))
        ];
        const curve=new T.CatmullRomCurve3(points,false,'catmullrom',.54);
        const geo=this.createTaperedTube(curve,42,7,.036+r()*.012,.006+r()*.003);
        const mesh=new T.Mesh(geo,this.tentacleMaterial);
        const wire=new T.Mesh(geo,this.tentacleEdgeMaterial);
        const nodeGeo=new T.BufferGeometry().setFromPoints(curve.getPoints(24).filter((_,idx)=>idx%2===0));
        const nodes=new T.Points(nodeGeo,this.tentacleNodeMaterial);
        const g=new T.Group();g.add(mesh,wire,nodes);
        g.scale.setScalar(.001);
        g.userData.phase=r()*Math.PI*2;
        this.tentacleGroup.add(g);this.tentacles.push(g);
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
      if(t>=.70 && t<2.55)sc=.05+ease((t-.70)/1.85)*1.16;
      else if(t>=2.55 && t<3.30)sc=mix(1.21,.72,smooth((t-2.55)/.75));
      else if(t>=3.30 && t<5.55)sc=.72+Math.sin((t-3.30)*1.02)*.005;
      else if(t>=5.55 && t<8.95)sc=mix(.72,.88,smooth((t-5.55)/3.40));
      else if(t>=8.95)sc=.88+smooth((t-8.95)/.72)*.03;

      const endMove=smooth((t-9.76)/.22);
      const target=this.targetWorld();
      const tx=target.x*endMove,ty=target.y*endMove;
      const phase2=smooth((t-2.70)/.58)*(1-smooth((t-6.05)/1.10));
      const finalSurface=smooth((t-5.95)/1.45);
      const surfaceZ=phase2*1.10+finalSurface*.38;

      this.coreGroup.position.set(tx,ty,surfaceZ);
      this.organicGroup.position.set(tx,ty,0);
      this.cellGroup.position.set(tx,ty,0);
      this.mechanicalGroup.position.set(tx,ty,.02);
      this.tentacleGroup.position.set(tx,ty,-.02);

      this.coreGroup.scale.setScalar(sc*mix(1,.84,endMove));
      this.coreGroup.rotation.y=Math.sin(time*.00024)*.018;
      this.coreGroup.rotation.x=Math.sin(time*.00029)*.014;

      const eye=smooth((t-1.78)/.70);
      const phase1=smooth((t-1.50)/.70)*(1-smooth((t-2.50)/.45));
      const phase2Boost=smooth((t-2.78)/.48)*(1-smooth((t-6.00)/1.15));
      const finalBoost=smooth((t-5.95)/1.25);
      const pulse=.95+.05*Math.sin(time*.0052);

      this.irisGroup.scale.setScalar(
        (phase1*.18 + phase2Boost*.92 + finalBoost*1.06 + .065)*pulse
      );
      this.irisRays.rotation.z=time*.000095;
      this.glowSprite.material.opacity=(.018+.018*phase1+.46*phase2Boost+.56*finalBoost)*pulse;
      this.glowSprite.scale.setScalar(1.38+phase1*.16+phase2Boost*.40+finalBoost*.34);
      this.coreInner.material.opacity=.05+.035*phase1+.64*phase2Boost+.72*finalBoost;
      this.coreEdges.material.opacity=.18+.18*eye;
      this.coreLight.intensity=eye*(.9+phase1*.30+phase2Boost*7.5+finalBoost*10.5+Math.sin(time*.005)*.9);
      if(this.coreLabel)this.coreLabel.material.opacity=.46*(1-smooth((t-2.58)/.48))+.035*finalBoost;
    }

    updateOrganic(t,time){
      const grow=smooth((t-2.70)/.78);
      const fade=1-smooth((t-6.00)/1.65)*.86;
      const visible=grow*fade;
      this.organicGroup.visible=visible>.002;
      this.organicGroup.scale.setScalar(.001+visible*.999);
      this.organicShellMaterial.opacity=.34*visible;
      this.organicLobeMaterial.opacity=.88*visible;
      this.organicWireMaterial.opacity=.005*visible;
      this.organicVeinMaterial.opacity=.46*visible;
      this.organicHoodMaterial.opacity=.58*visible;
      if(this.organicHoodGroup){
        this.organicHoodGroup.rotation.y=Math.sin(time*.00028)*.035;
        this.organicHoodGroup.rotation.x=Math.sin(time*.00022)*.018;
      }
      this.organicShell.rotation.y=time*.000040;
      this.organicShell.rotation.x=Math.sin(time*.00024)*.018;
      this.organicLobes.forEach((lobe,i)=>{
        const q=1+Math.sin(time*.00105+lobe.userData.phase)*.022*visible;
        const b=lobe.userData.baseScale;
        if(b)lobe.scale.set(b.x*q,b.y*q,b.z*q);
        lobe.rotation.y+=.00014*(i%2?1:-1);
      });
      this.organicVeins.forEach(line=>{
        line.rotation.z=Math.sin(time*.00030+line.userData.phase)*.016;
      });
    }

    updateCells(t,time){
      const grow=smooth((t-2.82)/.68);
      const fade=1-smooth((t-5.95)/1.70)*.96;
      const visible=grow*fade;
      this.cellGroup.visible=visible>.002;
      this.cellGroup.scale.setScalar(.001+visible*.99);
      this.cellMaterial.opacity=.72*visible;
      this.cellEdgeMaterial.opacity=.002*visible;
      this.cellVeinMaterial.opacity=.44*visible;
      this.cells.forEach((c,i)=>{
        const q=1+Math.sin(time*.00108+c.userData.phase)*.018*visible;
        c.rotation.y+=.00018*(i%2?1:-1);
        const b=c.userData.baseScale;
        if(b)c.scale.set(b.x*q,b.y*q,b.z*q);
      });
    }

    updateMechanical(t,time){
      const grow=smooth((t-5.92)/1.42);
      this.mechanicalGroup.visible=grow>.002;
      this.mechanicalGroup.scale.setScalar(.001+grow*1.04);

      this.mechMaterial.opacity=.995*grow;
      this.mechMidMaterial.opacity=.985*grow;
      this.silverMaterial.opacity=.97*grow;
      this.mechEdgeMaterial.opacity=.31*grow;
      this.mechInnerMaterial.opacity=.72*grow;
      if(this.seamMaterial)this.seamMaterial.opacity=.72*grow;
      this.mechInnerRing.rotation.z=time*.00016;
      if(this.mechLight)this.mechLight.intensity=10.5*grow;

      if(this.mechBody){
        this.mechBody.rotation.y=Math.sin(time*.00022)*.018*grow;
        this.mechBody.rotation.x=Math.sin(time*.00017)*.010*grow;
      }
      if(this.mechCradle){
        this.mechCradle.rotation.z=Math.sin(time*.00020)*.012*grow;
      }
      if(this.crown){
        this.crown.rotation.x=-.10+Math.sin(time*.00018)*.015*grow;
      }
      this.plates.forEach((p,i)=>{
        p.rotation.y+=Math.sin(time*.00020+i)*.00003*grow;
      });
    }

    updateTentacles(t,time){
      const grow=smooth((t-5.80)/1.45);
      this.tentacleGroup.visible=grow>.002;
      this.tentacleMaterial.opacity=.78*grow;
      this.tentacleEdgeMaterial.opacity=.055*grow;
      this.tentacleNodeMaterial.opacity=.54*grow;
      this.tentacles.forEach((g,i)=>{
        const wave=1+Math.sin(time*.00096+g.userData.phase)*.014*grow;
        const v=.001+grow*.999;
        g.scale.set(v*wave,v*wave,v*wave);
        g.rotation.z=Math.sin(time*.00052+g.userData.phase)*.030*grow;
        g.rotation.x=Math.sin(time*.00040+g.userData.phase)*.020*grow;
      });
    }

    updateCamera(t,time){
      let z=6.60,y=.05,x=0;
      if(t<2.55){
        const k=smooth(t/2.55);
        z=mix(6.08,5.74,k);
        x=Math.sin(time*.00034)*.15*(1-k*.45);
        y=.04+Math.sin(time*.00029)*.055;
      }else if(t<3.42){
        const k=smooth((t-2.55)/.87);
        z=mix(5.74,4.06,k);
        x=mix(.055,0,k);y=mix(.05,.01,k);
      }else if(t<5.52){
        z=4.06+Math.sin(time*.00027)*.024;
        x=Math.sin(time*.00020)*.018;
        y=Math.cos(time*.00023)*.016;
      }else if(t<8.90){
        const k=smooth((t-5.52)/3.38);
        z=mix(4.06,6.05,k);
        y=mix(.01,.018,k);
      }else{
        z=mix(6.05,6.42,smooth((t-8.90)/.90));
        y=.018;
      }
      if(this.width<this.height)z+=1.14;
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
      this.particles.material.opacity=.38+.10*Math.sin(time*.00045);

      const flash=smooth((t-9.18)/.12)*(1-smooth((t-9.50)/.22));
      const after=smooth((t-9.42)/.34);
      this.renderer.toneMappingExposure=1.16+flash*.82+after*.06;
      this.coreLight.intensity+=flash*18+after*5;
      if(this.glowSprite){
        const g=1+flash*.52;
        this.glowSprite.scale.multiplyScalar(g);
        this.glowSprite.material.opacity=Math.min(1,this.glowSprite.material.opacity+flash*.07);
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
        document.documentElement.dataset.fxMagBirthR668='software-webgl-r649-fallback';
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
        revision:'r668-unified-armored-pod-three-genesis'
      };
    }catch(error){
      console.error('FormatX R668 genesis renderer failed:',error);
      document.documentElement.dataset.fxMagBirthR668='fallback-r649';
      return null;
    }
  }

  document.documentElement.dataset.fxMagBirthThreeR658='r658-csp-local-three-proof';
  document.documentElement.dataset.fxMagBirthProofR658='r658-early-keyframe-proof';

  window.FormatXMagGenesisThreeR668={
    attach,
    revision:'r668-unified-armored-pod-three-genesis-dna-cellular-living-architecture'
  };
})();