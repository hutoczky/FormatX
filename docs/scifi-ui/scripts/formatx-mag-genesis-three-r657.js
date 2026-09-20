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
      const seg=72;
      const aPts=[],bPts=[],rungs=[];
      const beadA=[],beadB=[];
      for(let i=0;i<=seg;i++){
        const u=i/seg;
        const x=(u-.5)*length;
        const q=u*Math.PI*2*turns;
        const y=Math.sin(q)*radius;
        const z=Math.cos(q)*radius;
        const a=new T.Vector3(x,y,z);
        const b=new T.Vector3(x,-y,-z);
        aPts.push(a);bPts.push(b);
        if(i%5===0){
          rungs.push(a.x,a.y,a.z,b.x,b.y,b.z);
          beadA.push(a.x,a.y,a.z);
          beadB.push(b.x,b.y,b.z);
        }
      }
      const curveA=new T.CatmullRomCurve3(aPts,false,'centripetal');
      const curveB=new T.CatmullRomCurve3(bPts,false,'centripetal');
      const ma=new T.MeshBasicMaterial({
        color:0x63e7ff,transparent:true,opacity:.94,depthWrite:false,
        blending:T.AdditiveBlending
      });
      const mb=new T.MeshBasicMaterial({
        color:0x8968ff,transparent:true,opacity:.83,depthWrite:false,
        blending:T.AdditiveBlending
      });
      const glowA=new T.MeshBasicMaterial({
        color:0x51dfff,transparent:true,opacity:.16,depthWrite:false,
        blending:T.AdditiveBlending
      });
      const glowB=new T.MeshBasicMaterial({
        color:0x7957ff,transparent:true,opacity:.13,depthWrite:false,
        blending:T.AdditiveBlending
      });
      const mr=new T.LineBasicMaterial({
        color:0xcaf8ff,transparent:true,opacity:.42,depthWrite:false,
        blending:T.AdditiveBlending
      });
      const mpa=new T.PointsMaterial({
        color:0xbff8ff,size:.075,transparent:true,opacity:.82,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });
      const mpb=new T.PointsMaterial({
        color:0xae92ff,size:.071,transparent:true,opacity:.75,
        depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true
      });

      const tubeA=new T.Mesh(new T.TubeGeometry(curveA,seg,.030,6,false),ma);
      const tubeB=new T.Mesh(new T.TubeGeometry(curveB,seg,.030,6,false),mb);
      const auraA=new T.Mesh(new T.TubeGeometry(curveA,seg,.061,5,false),glowA);
      const auraB=new T.Mesh(new T.TubeGeometry(curveB,seg,.061,5,false),glowB);
      const gr=new T.BufferGeometry();
      gr.setAttribute('position',new T.Float32BufferAttribute(rungs,3));
      const ga=new T.BufferGeometry();
      ga.setAttribute('position',new T.Float32BufferAttribute(beadA,3));
      const gb=new T.BufferGeometry();
      gb.setAttribute('position',new T.Float32BufferAttribute(beadB,3));
      group.add(auraA,auraB,tubeA,tubeB,new T.LineSegments(gr,mr),new T.Points(ga,mpa),new T.Points(gb,mpb));
      group.userData.materials=[ma,mb,glowA,glowB,mr,mpa,mpb];
      group.userData.baseOpacity=[.94,.83,.16,.13,.42,.82,.75];
      return group;
    }

    makeDNAField(){
      const placements=[
        [-2.60,1.62,.55,-.38,1.20],
        [2.48,1.70,.72,.34,1.15],
        [-2.76,-1.48,.36,.25,1.10],
        [2.67,-1.43,.54,-.29,1.10],
        [0,2.24,-.45,1.56,.91],
        [0,-2.28,-.30,1.56,.91],
        [-.92,.05,-1.45,.04,1.18],
        [1.25,.02,-1.25,-.07,1.15],
        [-3.48,.08,-1.15,1.52,.84],
        [3.52,.10,-.98,1.57,.84]
      ];
      this.dnas=[];
      for(const [x,y,z,rz,sc] of placements){
        const h=this.createHelix(4.55,.315,4.15);
        h.position.set(x,y,z);
        h.rotation.z=rz;
        h.rotation.y=(this.rand()-.5)*.42;
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

    makeCore(){
      const T=this.THREE;
      const dark=new T.MeshStandardMaterial({
        color:0x061018,metalness:.88,roughness:.20,
        emissive:0x061a25,emissiveIntensity:.38,
        transparent:true,opacity:.99
      });
      const glass=new T.MeshPhysicalMaterial({
        color:0x15364b,metalness:.28,roughness:.10,
        transparent:true,opacity:.23,depthWrite:false,
        emissive:0x0b6379,emissiveIntensity:.30,
        clearcoat:.75,clearcoatRoughness:.12
      });
      const cyan=new T.MeshBasicMaterial({
        color:0x9af8ff,transparent:true,opacity:.92,
        depthWrite:false,blending:T.AdditiveBlending
      });

      this.coreShell=new T.Mesh(new T.OctahedronGeometry(1.14,3),dark);
      this.coreShell.scale.set(.92,1.12,.60);
      this.coreShell.rotation.z=Math.PI/4;
      this.coreGroup.add(this.coreShell);

      this.coreGlass=new T.Mesh(new T.OctahedronGeometry(.80,2),glass);
      this.coreGlass.scale.set(.84,1.08,.60);
      this.coreGlass.rotation.z=Math.PI/4;
      this.coreGroup.add(this.coreGlass);

      const edgeGeo=new T.EdgesGeometry(new T.OctahedronGeometry(1.18,1),14);
      this.coreEdges=new T.LineSegments(edgeGeo,new T.LineBasicMaterial({
        color:0xb7f7ff,transparent:true,opacity:.38,
        blending:T.AdditiveBlending,depthWrite:false
      }));
      this.coreEdges.scale.copy(this.coreShell.scale);
      this.coreEdges.rotation.copy(this.coreShell.rotation);
      this.coreGroup.add(this.coreEdges);

      this.irisGroup=new T.Group();

      const diamondMat=new T.MeshBasicMaterial({
        color:0x4ad9f5,transparent:true,opacity:.15,
        side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending
      });
      const diamond=new T.Mesh(new T.PlaneGeometry(.94,.94),diamondMat);
      diamond.rotation.z=Math.PI/4;
      diamond.position.z=-.025;
      this.irisGroup.add(diamond);
      const diamondEdge=new T.LineSegments(
        new T.EdgesGeometry(new T.PlaneGeometry(.96,.96)),
        new T.LineBasicMaterial({
          color:0xbdfaff,transparent:true,opacity:.72,
          depthWrite:false,blending:T.AdditiveBlending
        })
      );
      diamondEdge.rotation.z=Math.PI/4;
      diamondEdge.position.z=.005;
      this.irisGroup.add(diamondEdge);

      const ring1=new T.Mesh(new T.TorusGeometry(.29,.027,10,64),cyan.clone());
      const ring2=new T.Mesh(new T.TorusGeometry(.43,.012,8,64),cyan.clone());
      ring2.material.opacity=.53;
      const ring3=new T.Mesh(new T.TorusGeometry(.53,.006,6,64),cyan.clone());
      ring3.material.opacity=.20;
      const pupil=new T.Mesh(new T.CircleGeometry(.175,48),new T.MeshBasicMaterial({color:0x01070b,side:T.DoubleSide}));
      const pupilRing=new T.Mesh(new T.RingGeometry(.18,.225,56),cyan.clone());
      pupilRing.material.opacity=.96;
      this.irisGroup.add(ring3,ring2,ring1,pupil,pupilRing);

      const rayMat=new T.LineBasicMaterial({
        color:0xa9f8ff,transparent:true,opacity:.27,
        depthWrite:false,blending:T.AdditiveBlending
      });
      const rays=[];
      for(let i=0;i<24;i++){
        const a=i/24*Math.PI*2;
        rays.push(Math.cos(a)*.24,Math.sin(a)*.24,.012,Math.cos(a)*.48,Math.sin(a)*.48,.012);
      }
      const rayGeo=new T.BufferGeometry();
      rayGeo.setAttribute('position',new T.Float32BufferAttribute(rays,3));
      this.irisRays=new T.LineSegments(rayGeo,rayMat);
      this.irisGroup.add(this.irisRays);

      this.irisGroup.position.z=.72;
      this.coreGroup.add(this.irisGroup);

      const sprite=new T.Sprite(new T.SpriteMaterial({
        map:this.makeGlowTexture(),transparent:true,opacity:.90,
        blending:T.AdditiveBlending,depthWrite:false
      }));
      sprite.scale.set(2.45,2.45,1);
      sprite.position.z=.50;
      this.glowSprite=sprite;
      this.coreGroup.add(sprite);

      const inner=new T.Mesh(new T.OctahedronGeometry(.22,1),new T.MeshBasicMaterial({
        color:0xecffff,transparent:true,opacity:.98,
        blending:T.AdditiveBlending,depthWrite:false
      }));
      inner.scale.set(.88,1.18,.56);
      inner.rotation.z=Math.PI/4;
      inner.position.z=.78;
      this.coreInner=inner;
      this.coreGroup.add(inner);

      this.coreGroup.scale.setScalar(.001);
    }


    makeOrganicLayer(){
      const T=this.THREE,r=this.rand;
      this.organicMaterial=new T.MeshPhysicalMaterial({
        color:0x110d1d,
        roughness:.58,
        metalness:.08,
        clearcoat:.26,
        clearcoatRoughness:.45,
        transparent:true,
        opacity:0,
        emissive:0x160b28,
        emissiveIntensity:.32,
        depthWrite:true
      });
      this.organicWireMaterial=new T.MeshBasicMaterial({
        color:0x72dced,
        wireframe:true,
        transparent:true,
        opacity:0,
        depthWrite:false,
        blending:T.AdditiveBlending
      });
      const shellGeo=new T.IcosahedronGeometry(1.52,4);
      const shell=new T.Mesh(shellGeo,this.organicMaterial);
      shell.scale.set(1.00,1.04,.82);
      const wire=new T.Mesh(new T.IcosahedronGeometry(1.535,2),this.organicWireMaterial);
      wire.scale.copy(shell.scale);
      this.organicShell=shell;
      this.organicWire=wire;
      this.organicGroup.add(shell,wire);

      this.organicLobes=[];
      const lobeGeo=new T.IcosahedronGeometry(.42,3);
      for(let i=0;i<30;i++){
        const phi=Math.acos(1-2*(i+.5)/30);
        const theta=Math.PI*(1+Math.sqrt(5))*i;
        const rr=1.34+(r()-.5)*.13;
        const lobe=new T.Mesh(lobeGeo,this.organicMaterial);
        lobe.position.set(
          Math.sin(phi)*Math.cos(theta)*rr,
          Math.cos(phi)*rr,
          Math.sin(phi)*Math.sin(theta)*rr*.74
        );
        const k=.66+r()*.42;
        lobe.scale.set(k,k*(.82+r()*.26),k);
        lobe.rotation.set(r()*2.2,r()*2.2,r()*2.2);
        lobe.userData.phase=r()*Math.PI*2;
        this.organicGroup.add(lobe);
        this.organicLobes.push(lobe);
      }

      this.organicVeinMaterial=new T.LineBasicMaterial({
        color:0x82eaff,
        transparent:true,
        opacity:0,
        depthWrite:false,
        blending:T.AdditiveBlending
      });
      this.organicVeins=[];
      for(let i=0;i<34;i++){
        const a=r()*Math.PI*2;
        const e=.45+r()*.72;
        const start=new T.Vector3(0,0,.74);
        const end=new T.Vector3(Math.cos(a)*e,Math.sin(a)*e,(r()-.5)*.42);
        const bend=new T.Vector3(
          Math.cos(a+.55*(r()-.5))*e*.55,
          Math.sin(a+.55*(r()-.5))*e*.55,
          .28+(r()-.5)*.32
        );
        const curve=new T.QuadraticBezierCurve3(start,bend,end);
        const geo=new T.BufferGeometry().setFromPoints(curve.getPoints(20));
        const line=new T.Line(geo,this.organicVeinMaterial);
        line.userData.phase=r()*Math.PI*2;
        this.organicGroup.add(line);
        this.organicVeins.push(line);
      }
      this.organicGroup.scale.setScalar(.001);
    }

    makeCellularLayer(){
      const T=this.THREE,r=this.rand;
      this.cellMaterial=new T.MeshStandardMaterial({
        color:0x171126,roughness:.70,metalness:.06,
        emissive:0x210e34,emissiveIntensity:.42,
        transparent:true,opacity:0
      });
      this.cellEdgeMaterial=new T.MeshBasicMaterial({
        color:0x69dff2,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      const blobGeo=new T.IcosahedronGeometry(.32,2);
      const edgeGeo=new T.IcosahedronGeometry(.326,1);
      this.cells=[];
      for(let i=0;i<42;i++){
        const phi=Math.acos(1-2*(i+.5)/42);
        const theta=Math.PI*(1+Math.sqrt(5))*i;
        const rr=1.44+(r()-.5)*.20;
        const x=Math.sin(phi)*Math.cos(theta)*rr;
        const y=Math.cos(phi)*rr;
        const z=Math.sin(phi)*Math.sin(theta)*rr*.72;
        const g=new T.Group();
        const b=new T.Mesh(blobGeo,this.cellMaterial);
        const e=new T.Mesh(edgeGeo,this.cellEdgeMaterial);
        g.add(b,e);
        g.position.set(x,y,z);
        const sc=.72+r()*.58;
        g.scale.set(sc,sc*(.84+r()*.28),sc);
        g.rotation.set(r()*2,r()*2,r()*2);
        g.userData.phase=r()*Math.PI*2;
        this.cellGroup.add(g);this.cells.push(g);
      }
      this.cellVeinMaterial=new T.LineBasicMaterial({
        color:0x78e9ff,transparent:true,opacity:0,
        blending:T.AdditiveBlending,depthWrite:false
      });
      for(let i=0;i<24;i++){
        const c=this.cells[(i*7)%this.cells.length];
        const p=c.position.clone();
        const mid=p.clone().multiplyScalar(.54);
        mid.x+=(r()-.5)*.36;mid.y+=(r()-.5)*.36;
        const curve=new T.QuadraticBezierCurve3(new T.Vector3(0,0,.1),mid,p);
        const geo=new T.BufferGeometry().setFromPoints(curve.getPoints(18));
        this.cellGroup.add(new T.Line(geo,this.cellVeinMaterial));
      }
      this.cellGroup.scale.setScalar(.001);
    }

    makeMechanicalLayer(){
      const T=this.THREE;
      this.mechMaterial=new T.MeshStandardMaterial({
        color:0x06111a,metalness:.96,roughness:.17,
        emissive:0x051823,emissiveIntensity:.38,
        transparent:true,opacity:0
      });
      this.mechEdgeMaterial=new T.LineBasicMaterial({
        color:0x8cf1ff,transparent:true,opacity:0,
        blending:T.AdditiveBlending,depthWrite:false
      });
      const plateGeo=new T.OctahedronGeometry(.62,1);
      this.plates=[];
      for(let i=0;i<8;i++){
        const a=i/8*Math.PI*2;
        const g=new T.Group();
        const p=new T.Mesh(plateGeo,this.mechMaterial);
        p.scale.set(.48,.92,.24);
        p.rotation.z=Math.PI/4;
        const edge=new T.LineSegments(new T.EdgesGeometry(plateGeo,10),this.mechEdgeMaterial);
        edge.scale.copy(p.scale);
        edge.rotation.copy(p.rotation);
        g.add(p,edge);
        g.position.set(Math.cos(a)*1.05,Math.sin(a)*1.05,.06+Math.sin(a*2)*.07);
        g.rotation.z=a-Math.PI/2;
        g.rotation.x=(i%2?.12:-.12);
        this.mechanicalGroup.add(g);
        this.plates.push(g);
      }

      this.mechInnerMaterial=new T.MeshBasicMaterial({
        color:0x67eaff,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.mechInnerRing=new T.Mesh(new T.TorusGeometry(.68,.016,8,72),this.mechInnerMaterial);
      this.mechInnerRing.position.z=.18;
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
        color:0x08232e,metalness:.48,roughness:.27,
        emissive:0x0b6174,emissiveIntensity:.70,
        transparent:true,opacity:0
      });
      this.tentacleEdgeMaterial=new T.MeshBasicMaterial({
        color:0x7ceeff,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.tentacles=[];
      const count=12;
      for(let i=0;i<count;i++){
        const a=i/count*Math.PI*2+(r()-.5)*.16;
        const start=new T.Vector3(Math.cos(a)*.94,Math.sin(a)*.94,(r()-.5)*.16);
        const dir=new T.Vector3(Math.cos(a),Math.sin(a),0);
        const side=new T.Vector3(-dir.y,dir.x,0);
        const len=2.35+r()*2.05;
        const bend1=(r()-.5)*.88;
        const bend2=(r()-.5)*1.28;
        const points=[
          start,
          start.clone().addScaledVector(dir,len*.27).addScaledVector(side,bend1).add(new T.Vector3(0,0,(r()-.5)*.42)),
          start.clone().addScaledVector(dir,len*.61).addScaledVector(side,bend2).add(new T.Vector3(0,0,(r()-.5)*.62)),
          start.clone().addScaledVector(dir,len).addScaledVector(side,(r()-.5)*.72).add(new T.Vector3(0,0,(r()-.5)*.70))
        ];
        const curve=new T.CatmullRomCurve3(points,false,'catmullrom',.48);
        const geo=this.createTaperedTube(curve,46,7,.082+r()*.025,.010+r()*.006);
        const mesh=new T.Mesh(geo,this.tentacleMaterial);
        const wire=new T.Mesh(geo,this.tentacleEdgeMaterial);
        const g=new T.Group();
        g.add(mesh,wire);
        g.scale.setScalar(.001);
        g.userData.phase=r()*Math.PI*2;
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
      let s=.66+smooth(t/2.28)*.06;
      if(t>=2.28 && t<3.12)s=.72+ease((t-2.28)/.84)*.29;
      else if(t>=3.12 && t<5.55)s=1.01+Math.sin((t-3.12)*1.35)*.016;
      else if(t>=5.55 && t<8.95)s=mix(1.01,.73,smooth((t-5.55)/3.40));
      else if(t>=8.95)s=.73+smooth((t-8.95)/.75)*.06;

      const endMove=smooth((t-9.76)/.22);
      const target=this.targetWorld();
      const tx=target.x*endMove,ty=target.y*endMove;
      this.coreGroup.position.set(tx,ty,0);
      this.organicGroup.position.copy(this.coreGroup.position);
      this.cellGroup.position.copy(this.coreGroup.position);
      this.mechanicalGroup.position.copy(this.coreGroup.position);
      this.tentacleGroup.position.copy(this.coreGroup.position);

      const endScale=mix(1,.82,endMove);
      this.coreGroup.scale.setScalar(s*endScale);
      this.coreGroup.rotation.y=Math.sin(time*.00031)*.055;
      this.coreGroup.rotation.x=Math.sin(time*.00037)*.036;
      this.coreShell.rotation.z=Math.PI/4+Math.sin(time*.00047)*.014;
      this.coreGlass.rotation.z=Math.PI/4-Math.sin(time*.00053)*.019;
      const dormant=smooth(t/2.35);
      this.coreShell.material.opacity=mix(.34,.99,dormant);
      this.coreGlass.material.opacity=mix(.06,.23,dormant);

      const eye=smooth((t-2.55)/.38);
      const peak=smooth((t-3.10)/.36)*(1-smooth((t-5.62)/1.22));
      const pulse=.89+.11*Math.sin(time*.0060);
      this.irisGroup.scale.setScalar(mix(.12,1.08,eye)*pulse*(1+peak*.07));
      this.glowSprite.material.opacity=(.10+.80*eye+.10*peak)*pulse;
      this.glowSprite.scale.setScalar(1.55+eye*.92+peak*.32+Math.sin(time*.0048)*.07);
      this.coreInner.material.opacity=.24+.74*eye;
      this.coreEdges.material.opacity=.08+.32*eye;
      this.coreLight.intensity=eye*(10.5+peak*7+Math.sin(time*.005)*2.8);
    }

    updateOrganic(t,time){
      const grow=smooth((t-2.18)/.62);
      const hold=1-smooth((t-9.18)/.68)*.28;
      const visible=grow*hold;
      this.organicGroup.visible=visible>.002;
      this.organicGroup.scale.setScalar(.001+visible*1.075);
      this.organicMaterial.opacity=.74*visible;
      this.organicWireMaterial.opacity=.045*visible;
      this.organicVeinMaterial.opacity=.22*visible;
      this.organicShell.rotation.y=time*.000055;
      this.organicShell.rotation.x=Math.sin(time*.00027)*.025;
      this.organicLobes.forEach((lobe,i)=>{
        const q=1+Math.sin(time*.00105+lobe.userData.phase)*.026*visible;
        lobe.scale.x=q*(.72+(i%3)*.05);
        lobe.scale.y=q*(.76+((i+1)%4)*.035);
        lobe.scale.z=q*(.70+((i+2)%5)*.025);
        lobe.rotation.y+=.00022*(i%2?1:-1);
      });
      this.organicVeins.forEach((line,i)=>{
        line.rotation.z=Math.sin(time*.00031+line.userData.phase)*.018;
        line.rotation.y=Math.sin(time*.00027+line.userData.phase)*.018;
      });
    }

    updateCells(t,time){
      const grow=smooth((t-2.34)/.60);
      const fade=1-smooth((t-8.98)/.62)*.72;
      const visible=grow*fade;
      this.cellGroup.visible=visible>.002;
      this.cellGroup.scale.setScalar(.001+visible*1.045);
      this.cellMaterial.opacity=.62*visible;
      this.cellEdgeMaterial.opacity=.055*visible;
      this.cellVeinMaterial.opacity=.24*visible;
      this.cells.forEach((c,i)=>{
        const q=1+Math.sin(time*.00110+c.userData.phase)*.021*visible;
        c.rotation.y+=.00034*(i%2?1:-1);
        c.children[0].scale.setScalar(q);
        c.children[1].scale.setScalar(q);
      });
    }

    updateMechanical(t,time){
      const pre=smooth((t-6.80)/1.30);
      const flashReveal=smooth((t-9.05)/.34);
      const grow=Math.min(1,pre*.64+flashReveal*.36);
      this.mechanicalGroup.visible=grow>.002;
      this.mechanicalGroup.scale.setScalar(.001+grow*.99);
      this.mechMaterial.opacity=.91*grow;
      this.mechEdgeMaterial.opacity=.42*grow;
      this.mechInnerMaterial.opacity=.34*grow;
      this.mechInnerRing.rotation.z=time*.00022;
      this.plates.forEach((p,i)=>{
        const breathe=1+Math.sin(time*.001+i*.8)*.018*grow;
        p.scale.setScalar(breathe);
        p.rotation.z+=(i%2?1:-1)*.00022;
        p.rotation.x=Math.sin(time*.00034+i)*.023*grow+(i%2?.12:-.12);
      });
    }

    updateTentacles(t,time){
      const grow=smooth((t-5.68)/1.18);
      const settle=1-smooth((t-9.45)/.42)*.06;
      this.tentacleGroup.visible=grow>.002;
      this.tentacleMaterial.opacity=.76*grow*settle;
      this.tentacleEdgeMaterial.opacity=.16*grow*settle;
      this.tentacles.forEach((g,i)=>{
        const wave=1+Math.sin(time*.00115+g.userData.phase)*.030*grow;
        const sy=.001+grow*.999;
        g.scale.set(sy*wave,sy*wave,sy*wave);
        g.rotation.z=Math.sin(time*.00066+g.userData.phase)*.064*grow;
        g.rotation.x=Math.sin(time*.00049+g.userData.phase)*.040*grow;
      });
    }

    updateCamera(t,time){
      let z=6.62,y=.08,x=0;
      if(t<2.50){
        const k=smooth(t/2.50);
        z=mix(5.55,6.32,k);
        x=Math.sin(time*.00045)*.30*(1-k*.28);
        y=.05+Math.sin(time*.00034)*.11;
      }else if(t<3.40){
        const k=smooth((t-2.50)/.90);
        z=mix(6.32,4.72,k);
        x=mix(.12,0,k);
        y=mix(.09,.01,k);
      }else if(t<5.45){
        z=4.72+Math.sin(time*.00031)*.036;
        x=Math.sin(time*.00022)*.036;
        y=Math.cos(time*.00025)*.028;
      }else if(t<8.90){
        const k=smooth((t-5.45)/3.45);
        z=mix(4.72,8.18,k);
        x=Math.sin(time*.00019)*.030*(1-k);
        y=mix(.01,.025,k);
      }else{
        z=mix(8.18,8.34,smooth((t-8.90)/.88));
        y=.025;
      }
      const portrait=this.width<this.height;
      if(portrait)z+=1.25;
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
        document.documentElement.dataset.fxMagBirthR657='software-webgl-r649-fallback';
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
        revision:'r657-reference-geometry-three-genesis'
      };
    }catch(error){
      console.error('FormatX R657 genesis renderer failed:',error);
      document.documentElement.dataset.fxMagBirthR657='fallback-r649';
      return null;
    }
  }

  window.FormatXMagGenesisThreeR657={
    attach,
    revision:'r657-reference-geometry-three-genesis-dna-cellular-living-architecture'
  };
})();