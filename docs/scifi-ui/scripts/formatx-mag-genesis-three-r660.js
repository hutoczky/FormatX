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
      shape.moveTo(0,1.30);
      shape.bezierCurveTo(.10,.96,.42,.42,.68,0);
      shape.bezierCurveTo(.42,-.42,.10,-.96,0,-1.30);
      shape.bezierCurveTo(-.10,-.96,-.42,-.42,-.68,0);
      shape.bezierCurveTo(-.42,.42,-.10,.96,0,1.30);

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

      const ring1=new T.Mesh(new T.TorusGeometry(.285,.026,10,64),cyan.clone());
      const ring2=new T.Mesh(new T.TorusGeometry(.405,.011,8,64),cyan.clone());
      ring2.material.opacity=.50;
      const pupil=new T.Mesh(new T.CircleGeometry(.155,48),new T.MeshBasicMaterial({color:0x01070b,side:T.DoubleSide}));
      const pupilRing=new T.Mesh(new T.RingGeometry(.162,.202,56),cyan.clone());
      pupilRing.material.opacity=.98;
      this.irisGroup.add(ring2,ring1,pupil,pupilRing);

      const rayMat=new T.LineBasicMaterial({color:0xb5fbff,transparent:true,opacity:.23,depthWrite:false,blending:T.AdditiveBlending});
      const rays=[];
      for(let i=0;i<24;i++){
        const a=i/24*Math.PI*2;
        rays.push(Math.cos(a)*.22,Math.sin(a)*.22,.012,Math.cos(a)*.43,Math.sin(a)*.43,.012);
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
        color:0xe8ffff,transparent:true,opacity:.98,
        depthWrite:false,blending:T.AdditiveBlending
      }));
      this.coreInner.scale.set(.90,1.15,.55);
      this.coreInner.rotation.z=Math.PI/4;
      this.coreInner.position.z=.28;
      this.coreGroup.add(this.coreInner);

      this.coreGroup.scale.setScalar(.001);
    }


    makeOrganicLayer(){
      const T=this.THREE,r=this.rand;
      this.organicMaterial=new T.MeshPhysicalMaterial({
        color:0x130d22,roughness:.72,metalness:.04,
        clearcoat:.16,clearcoatRoughness:.55,
        transparent:true,opacity:0,
        emissive:0x160b2a,emissiveIntensity:.26,
        depthWrite:true
      });
      this.organicWireMaterial=new T.MeshBasicMaterial({
        color:0x65d8e9,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });

      const shell=new T.Mesh(new T.IcosahedronGeometry(1.43,3),this.organicMaterial);
      shell.scale.set(1.00,1.03,.80);
      const wire=new T.Mesh(new T.IcosahedronGeometry(1.445,1),this.organicWireMaterial);
      wire.scale.copy(shell.scale);
      this.organicShell=shell;this.organicWire=wire;
      this.organicGroup.add(shell,wire);

      this.organicLobes=[];
      const lobeGeo=new T.IcosahedronGeometry(.255,2);
      const count=54;
      for(let i=0;i<count;i++){
        const phi=Math.acos(1-2*(i+.5)/count);
        const theta=Math.PI*(1+Math.sqrt(5))*i;
        const rr=1.32+(r()-.5)*.10;
        const lobe=new T.Mesh(lobeGeo,this.organicMaterial);
        lobe.position.set(
          Math.sin(phi)*Math.cos(theta)*rr,
          Math.cos(phi)*rr,
          Math.sin(phi)*Math.sin(theta)*rr*.72
        );
        const k=.72+r()*.32;
        lobe.scale.set(k,k*(.86+r()*.20),k*(.90+r()*.16));
        lobe.rotation.set(r()*2.2,r()*2.2,r()*2.2);
        lobe.userData.phase=r()*Math.PI*2;
        this.organicGroup.add(lobe);this.organicLobes.push(lobe);
      }

      this.organicVeinMaterial=new T.LineBasicMaterial({
        color:0x79e8f8,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.organicVeins=[];
      for(let i=0;i<28;i++){
        const a=r()*Math.PI*2;
        const e=.42+r()*.78;
        const start=new T.Vector3(0,0,.42);
        const end=new T.Vector3(Math.cos(a)*e,Math.sin(a)*e,(r()-.5)*.30);
        const bend=new T.Vector3(Math.cos(a+.45*(r()-.5))*e*.54,Math.sin(a+.45*(r()-.5))*e*.54,.20+(r()-.5)*.25);
        const curve=new T.QuadraticBezierCurve3(start,bend,end);
        const geo=new T.BufferGeometry().setFromPoints(curve.getPoints(18));
        const line=new T.Line(geo,this.organicVeinMaterial);
        line.userData.phase=r()*Math.PI*2;
        this.organicGroup.add(line);this.organicVeins.push(line);
      }
      this.organicGroup.scale.setScalar(.001);
    }

    makeCellularLayer(){
      const T=this.THREE,r=this.rand;
      this.cellMaterial=new T.MeshStandardMaterial({
        color:0x1a1027,roughness:.78,metalness:.03,
        emissive:0x201037,emissiveIntensity:.30,
        transparent:true,opacity:0
      });
      this.cellEdgeMaterial=new T.MeshBasicMaterial({
        color:0x66d7e8,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      const blobGeo=new T.IcosahedronGeometry(.225,2);
      const edgeGeo=new T.IcosahedronGeometry(.228,1);
      this.cells=[];
      const count=58;
      for(let i=0;i<count;i++){
        const phi=Math.acos(1-2*(i+.5)/count);
        const theta=Math.PI*(1+Math.sqrt(5))*i;
        const rr=1.39+(r()-.5)*.14;
        const g=new T.Group();
        const b=new T.Mesh(blobGeo,this.cellMaterial);
        const e=new T.Mesh(edgeGeo,this.cellEdgeMaterial);
        g.add(b,e);
        g.position.set(Math.sin(phi)*Math.cos(theta)*rr,Math.cos(phi)*rr,Math.sin(phi)*Math.sin(theta)*rr*.70);
        const sc=.70+r()*.34;
        g.scale.set(sc,sc*(.86+r()*.20),sc*(.90+r()*.16));
        g.rotation.set(r()*2,r()*2,r()*2);
        g.userData.phase=r()*Math.PI*2;
        this.cellGroup.add(g);this.cells.push(g);
      }
      this.cellVeinMaterial=new T.LineBasicMaterial({
        color:0x78e9ff,transparent:true,opacity:0,
        blending:T.AdditiveBlending,depthWrite:false
      });
      for(let i=0;i<20;i++){
        const c=this.cells[(i*11)%this.cells.length];
        const p=c.position.clone();
        const mid=p.clone().multiplyScalar(.52);
        mid.x+=(r()-.5)*.25;mid.y+=(r()-.5)*.25;
        const curve=new T.QuadraticBezierCurve3(new T.Vector3(0,0,.18),mid,p);
        this.cellGroup.add(new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(16)),this.cellVeinMaterial));
      }
      this.cellGroup.scale.setScalar(.001);
    }

    makeMechanicalLayer(){
      const T=this.THREE;
      this.mechMaterial=new T.MeshStandardMaterial({
        color:0x07131c,metalness:.96,roughness:.16,
        emissive:0x061824,emissiveIntensity:.34,
        transparent:true,opacity:0
      });
      this.mechEdgeMaterial=new T.LineBasicMaterial({
        color:0x8df2ff,transparent:true,opacity:0,
        blending:T.AdditiveBlending,depthWrite:false
      });

      const petalShape=new T.Shape();
      petalShape.moveTo(0,.96);
      petalShape.bezierCurveTo(.18,.76,.42,.35,.48,0);
      petalShape.bezierCurveTo(.26,-.08,.10,-.14,0,-.18);
      petalShape.bezierCurveTo(-.10,-.14,-.26,-.08,-.48,0);
      petalShape.bezierCurveTo(-.42,.35,-.18,.76,0,.96);
      const petalGeo=new T.ExtrudeGeometry(petalShape,{
        depth:.14,bevelEnabled:true,bevelSegments:2,steps:1,
        bevelSize:.035,bevelThickness:.035,curveSegments:14
      });
      petalGeo.center();

      this.plates=[];
      const defs=[
        [0,.82,0,0],
        [.82,0,0,-Math.PI/2],
        [0,-.82,0,Math.PI],
        [-.82,0,0,Math.PI/2]
      ];
      for(const [x,y,z,rz] of defs){
        const g=new T.Group();
        const p=new T.Mesh(petalGeo,this.mechMaterial);
        const edge=new T.LineSegments(new T.EdgesGeometry(petalGeo,16),this.mechEdgeMaterial);
        g.add(p,edge);
        g.position.set(x,y,z+.09);
        g.rotation.z=rz;
        this.mechanicalGroup.add(g);this.plates.push(g);
      }

      this.mechInnerMaterial=new T.MeshBasicMaterial({
        color:0x6deeff,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.mechInnerRing=new T.Mesh(new T.TorusGeometry(.57,.015,8,72),this.mechInnerMaterial);
      this.mechInnerRing.position.z=.16;
      this.mechanicalGroup.add(this.mechInnerRing);
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
        color:0x08242e,metalness:.52,roughness:.25,
        emissive:0x0a6072,emissiveIntensity:.68,
        transparent:true,opacity:0
      });
      this.tentacleEdgeMaterial=new T.MeshBasicMaterial({
        color:0x79ebff,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.tentacles=[];
      const count=9;
      for(let i=0;i<count;i++){
        const a=i/count*Math.PI*2+(r()-.5)*.20;
        const start=new T.Vector3(Math.cos(a)*.92,Math.sin(a)*.92,(r()-.5)*.12);
        const dir=new T.Vector3(Math.cos(a),Math.sin(a),0);
        const side=new T.Vector3(-dir.y,dir.x,0);
        const len=2.15+r()*1.55;
        const sign=i%2?1:-1;
        const points=[
          start,
          start.clone().addScaledVector(dir,len*.28).addScaledVector(side,sign*(.28+r()*.34)).add(new T.Vector3(0,0,(r()-.5)*.32)),
          start.clone().addScaledVector(dir,len*.62).addScaledVector(side,-sign*(.38+r()*.46)).add(new T.Vector3(0,0,(r()-.5)*.50)),
          start.clone().addScaledVector(dir,len).addScaledVector(side,sign*(.20+r()*.32)).add(new T.Vector3(0,0,(r()-.5)*.56))
        ];
        const curve=new T.CatmullRomCurve3(points,false,'catmullrom',.52);
        const geo=this.createTaperedTube(curve,44,7,.064+r()*.020,.009+r()*.005);
        const mesh=new T.Mesh(geo,this.tentacleMaterial);
        const wire=new T.Mesh(geo,this.tentacleEdgeMaterial);
        const g=new T.Group();g.add(mesh,wire);
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
      if(t>=.70 && t<2.55)sc=.08+ease((t-.70)/1.85)*.88;
      else if(t>=2.55 && t<5.60)sc=.96+Math.sin((t-2.55)*1.15)*.012;
      else if(t>=5.60 && t<8.95)sc=mix(.96,.76,smooth((t-5.60)/3.35));
      else if(t>=8.95)sc=.76+smooth((t-8.95)/.72)*.05;

      const endMove=smooth((t-9.76)/.22);
      const target=this.targetWorld();
      const tx=target.x*endMove,ty=target.y*endMove;
      this.coreGroup.position.set(tx,ty,0);
      this.organicGroup.position.copy(this.coreGroup.position);
      this.cellGroup.position.copy(this.coreGroup.position);
      this.mechanicalGroup.position.copy(this.coreGroup.position);
      this.tentacleGroup.position.copy(this.coreGroup.position);

      this.coreGroup.scale.setScalar(sc*mix(1,.82,endMove));
      this.coreGroup.rotation.y=Math.sin(time*.00026)*.030;
      this.coreGroup.rotation.x=Math.sin(time*.00031)*.022;

      const eye=smooth((t-1.35)/.75);
      const peak=smooth((t-2.70)/.38)*(1-smooth((t-5.70)/1.18));
      const pulse=.91+.09*Math.sin(time*.0057);
      this.irisGroup.scale.setScalar(mix(.30,1.06,eye)*pulse*(1+peak*.05));
      this.irisRays.rotation.z=time*.00012;
      this.glowSprite.material.opacity=(.12+.76*eye+.10*peak)*pulse;
      this.glowSprite.scale.setScalar(1.72+eye*.62+peak*.25+Math.sin(time*.0045)*.05);
      this.coreInner.material.opacity=.30+.68*eye;
      this.coreEdges.material.opacity=.16+.26*eye;
      this.coreLight.intensity=eye*(9.5+peak*7+Math.sin(time*.005)*2.2);
    }

    updateOrganic(t,time){
      const grow=smooth((t-2.72)/.68);
      const fade=1-smooth((t-6.20)/1.85)*.80;
      const visible=grow*fade;
      this.organicGroup.visible=visible>.002;
      this.organicGroup.scale.setScalar(.001+visible*.999);
      this.organicMaterial.opacity=.68*visible;
      this.organicWireMaterial.opacity=.010*visible;
      this.organicVeinMaterial.opacity=.18*visible;
      this.organicShell.rotation.y=time*.000045;
      this.organicShell.rotation.x=Math.sin(time*.00025)*.020;
      this.organicLobes.forEach((lobe,i)=>{
        const q=1+Math.sin(time*.00100+lobe.userData.phase)*.018*visible;
        lobe.scale.x*=1;
        lobe.children?.length;
        lobe.rotation.y+=.00016*(i%2?1:-1);
        lobe.scale.multiplyScalar(1);
        lobe.userData.q=q;
      });
      this.organicVeins.forEach(line=>{
        line.rotation.z=Math.sin(time*.00028+line.userData.phase)*.014;
      });
    }

    updateCells(t,time){
      const grow=smooth((t-2.86)/.62);
      const fade=1-smooth((t-6.15)/1.95)*.92;
      const visible=grow*fade;
      this.cellGroup.visible=visible>.002;
      this.cellGroup.scale.setScalar(.001+visible*.99);
      this.cellMaterial.opacity=.60*visible;
      this.cellEdgeMaterial.opacity=.008*visible;
      this.cellVeinMaterial.opacity=.19*visible;
      this.cells.forEach((c,i)=>{
        const q=1+Math.sin(time*.00104+c.userData.phase)*.016*visible;
        c.rotation.y+=.00024*(i%2?1:-1);
        c.children[0].scale.setScalar(q);
        c.children[1].scale.setScalar(q);
      });
    }

    updateMechanical(t,time){
      const grow=smooth((t-6.05)/1.55);
      this.mechanicalGroup.visible=grow>.002;
      this.mechanicalGroup.scale.setScalar(.001+grow*.99);
      this.mechMaterial.opacity=.94*grow;
      this.mechEdgeMaterial.opacity=.44*grow;
      this.mechInnerMaterial.opacity=.42*grow;
      this.mechInnerRing.rotation.z=time*.00020;
      this.plates.forEach((p,i)=>{
        const breathe=1+Math.sin(time*.00095+i*.9)*.010*grow;
        p.scale.setScalar(breathe);
        p.rotation.x=Math.sin(time*.00030+i)*.012*grow;
      });
    }

    updateTentacles(t,time){
      const grow=smooth((t-5.55)/1.35);
      this.tentacleGroup.visible=grow>.002;
      this.tentacleMaterial.opacity=.78*grow;
      this.tentacleEdgeMaterial.opacity=.11*grow;
      this.tentacles.forEach((g,i)=>{
        const wave=1+Math.sin(time*.00105+g.userData.phase)*.018*grow;
        const v=.001+grow*.999;
        g.scale.set(v*wave,v*wave,v*wave);
        g.rotation.z=Math.sin(time*.00056+g.userData.phase)*.040*grow;
        g.rotation.x=Math.sin(time*.00044+g.userData.phase)*.025*grow;
      });
    }

    updateCamera(t,time){
      let z=6.55,y=.05,x=0;
      if(t<2.55){
        const k=smooth(t/2.55);
        z=mix(6.00,5.70,k);
        x=Math.sin(time*.00034)*.16*(1-k*.45);
        y=.04+Math.sin(time*.00029)*.06;
      }else if(t<3.45){
        const k=smooth((t-2.55)/.90);
        z=mix(5.70,4.00,k);
        x=mix(.06,0,k);y=mix(.05,.01,k);
      }else if(t<5.55){
        z=4.00+Math.sin(time*.00027)*.028;
        x=Math.sin(time*.00020)*.022;y=Math.cos(time*.00023)*.018;
      }else if(t<8.90){
        const k=smooth((t-5.55)/3.35);
        z=mix(4.00,6.22,k);
        y=mix(.01,.02,k);
      }else{
        z=mix(6.22,6.70,smooth((t-8.90)/.90));
        y=.02;
      }
      if(this.width<this.height)z+=1.18;
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

      const flash=smooth((t-9.12)/.10)*(1-smooth((t-9.58)/.25));
      const after=smooth((t-9.46)/.32);
      this.renderer.toneMappingExposure=1.16+flash*3.65+after*.20;
      this.coreLight.intensity+=flash*54+after*8;
      if(this.glowSprite){
        const g=1+flash*1.85;
        this.glowSprite.scale.multiplyScalar(g);
        this.glowSprite.material.opacity=Math.min(1,this.glowSprite.material.opacity+flash*.18);
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
        document.documentElement.dataset.fxMagBirthR660='software-webgl-r649-fallback';
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
        revision:'r660-storyboard-match-three-genesis'
      };
    }catch(error){
      console.error('FormatX R660 genesis renderer failed:',error);
      document.documentElement.dataset.fxMagBirthR660='fallback-r649';
      return null;
    }
  }

  document.documentElement.dataset.fxMagBirthThreeR658='r658-csp-local-three-proof';
  document.documentElement.dataset.fxMagBirthProofR658='r658-early-keyframe-proof';

  window.FormatXMagGenesisThreeR660={
    attach,
    revision:'r660-storyboard-match-three-genesis-dna-cellular-living-architecture'
  };
})();