(() => {
  'use strict';

  const THREE_SOURCES = [
    'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js',
    'https://unpkg.com/three@0.185.1/build/three.module.js?module'
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

  function seeded(seed=649650){
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
      this.cellGroup=new THREE.Group();
      this.mechanicalGroup=new THREE.Group();
      this.tentacleGroup=new THREE.Group();
      this.coreGroup=new THREE.Group();

      this.world.add(this.dnaGroup,this.cellGroup,this.tentacleGroup,this.mechanicalGroup,this.coreGroup);

      this.makeLights();
      this.makeParticles();
      this.makeDNAField();
      this.makeCore();
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
      const seg=96;
      const pa=new Float32Array((seg+1)*3);
      const pb=new Float32Array((seg+1)*3);
      const rung=[];
      for(let i=0;i<=seg;i++){
        const u=i/seg;
        const x=(u-.5)*length;
        const q=u*Math.PI*2*turns;
        const y=Math.sin(q)*radius;
        const z=Math.cos(q)*radius;
        pa.set([x,y,z],i*3);
        pb.set([x,-y,-z],i*3);
        if(i%6===0){
          rung.push(x,y,z,x,-y,-z);
        }
      }
      const ga=new T.BufferGeometry();ga.setAttribute('position',new T.BufferAttribute(pa,3));
      const gb=new T.BufferGeometry();gb.setAttribute('position',new T.BufferAttribute(pb,3));
      const gr=new T.BufferGeometry();gr.setAttribute('position',new T.Float32BufferAttribute(rung,3));
      const ma=new T.LineBasicMaterial({color:0x6eeaff,transparent:true,opacity:.84,depthWrite:false,blending:T.AdditiveBlending});
      const mb=new T.LineBasicMaterial({color:0x8c6aff,transparent:true,opacity:.72,depthWrite:false,blending:T.AdditiveBlending});
      const mr=new T.LineBasicMaterial({color:0xd1f8ff,transparent:true,opacity:.33,depthWrite:false,blending:T.AdditiveBlending});
      group.add(new T.Line(ga,ma),new T.Line(gb,mb),new T.LineSegments(gr,mr));
      group.userData.materials=[ma,mb,mr];
      return group;
    }

    makeDNAField(){
      const placements=[
        [-2.55,1.68,-.8,-.38,1.12],
        [2.52,1.72,-.7,.33,1.06],
        [-2.82,-1.52,-.5,.26,1.02],
        [2.68,-1.46,-.4,-.28,1.02],
        [0,2.18,-1.7,1.55,.82],
        [0,-2.18,-1.3,1.55,.82],
        [-.88,.12,-2.4,.05,1.12],
        [1.18,.05,-2.1,-.08,1.08],
        [-3.65,.05,-2.6,1.52,.78],
        [3.62,.10,-2.2,1.57,.78]
      ];
      this.dnas=[];
      for(const [x,y,z,rz,s] of placements){
        const h=this.createHelix(4.4,.29,4.0);
        h.position.set(x,y,z);
        h.rotation.z=rz;
        h.rotation.y=(this.rand()-.5)*.5;
        h.scale.setScalar(s);
        h.userData.base={x,y,z,rz,s,phase:this.rand()*Math.PI*2};
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
        color:0x07131d,metalness:.84,roughness:.24,
        emissive:0x061826,emissiveIntensity:.34,
        transparent:true,opacity:.98
      });
      const glass=new T.MeshPhysicalMaterial({
        color:0x153b4d,metalness:.35,roughness:.14,
        transparent:true,opacity:.27,depthWrite:false,
        emissive:0x0d6275,emissiveIntensity:.22
      });
      const cyan=new T.MeshBasicMaterial({
        color:0x8ef5ff,transparent:true,opacity:.85,
        depthWrite:false,blending:T.AdditiveBlending
      });

      this.coreShell=new T.Mesh(new T.OctahedronGeometry(1.18,2),dark);
      this.coreShell.scale.set(.90,1.14,.62);
      this.coreShell.rotation.z=Math.PI/4;
      this.coreGroup.add(this.coreShell);

      this.coreGlass=new T.Mesh(new T.OctahedronGeometry(.78,1),glass);
      this.coreGlass.scale.set(.82,1.06,.58);
      this.coreGlass.rotation.z=Math.PI/4;
      this.coreGroup.add(this.coreGlass);

      const edgeGeo=new T.EdgesGeometry(new T.OctahedronGeometry(1.20,1),18);
      this.coreEdges=new T.LineSegments(edgeGeo,new T.LineBasicMaterial({
        color:0xa6edff,transparent:true,opacity:.32,
        blending:T.AdditiveBlending,depthWrite:false
      }));
      this.coreEdges.scale.copy(this.coreShell.scale);
      this.coreEdges.rotation.copy(this.coreShell.rotation);
      this.coreGroup.add(this.coreEdges);

      this.irisGroup=new T.Group();
      const ring1=new T.Mesh(new T.TorusGeometry(.30,.025,10,64),cyan.clone());
      const ring2=new T.Mesh(new T.TorusGeometry(.43,.012,8,64),cyan.clone());
      ring2.material.opacity=.46;
      const pupil=new T.Mesh(new T.CircleGeometry(.18,40),new T.MeshBasicMaterial({color:0x02090e,side:T.DoubleSide}));
      const pupilRing=new T.Mesh(new T.RingGeometry(.19,.225,48),cyan.clone());
      pupilRing.material.opacity=.92;
      this.irisGroup.add(ring1,ring2,pupil,pupilRing);
      this.irisGroup.position.z=.72;
      this.coreGroup.add(this.irisGroup);

      const sprite=new T.Sprite(new T.SpriteMaterial({
        map:this.makeGlowTexture(),transparent:true,opacity:.82,
        blending:T.AdditiveBlending,depthWrite:false
      }));
      sprite.scale.set(2.15,2.15,1);
      sprite.position.z=.52;
      this.glowSprite=sprite;
      this.coreGroup.add(sprite);

      const inner=new T.Mesh(new T.OctahedronGeometry(.23,1),new T.MeshBasicMaterial({
        color:0xd8feff,transparent:true,opacity:.96,
        blending:T.AdditiveBlending,depthWrite:false
      }));
      inner.scale.set(.9,1.2,.6);
      inner.rotation.z=Math.PI/4;
      inner.position.z=.78;
      this.coreInner=inner;
      this.coreGroup.add(inner);

      this.coreGroup.scale.setScalar(.001);
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
        color:0x08121b,metalness:.94,roughness:.19,
        emissive:0x04111b,emissiveIntensity:.30,
        transparent:true,opacity:0
      });
      this.mechEdgeMaterial=new T.LineBasicMaterial({
        color:0x78e9ff,transparent:true,opacity:0,
        blending:T.AdditiveBlending,depthWrite:false
      });
      const plateGeo=new T.ConeGeometry(.78,1.9,3,1,false);
      this.plates=[];
      const defs=[
        [0,1.02,.12,0,0,Math.PI],
        [0,-1.02,.12,0,0,0],
        [1.02,0,.12,0,0,-Math.PI/2],
        [-1.02,0,.12,0,0,Math.PI/2]
      ];
      for(const d of defs){
        const g=new T.Group();
        const p=new T.Mesh(plateGeo,this.mechMaterial);
        p.scale.set(.72,1.0,.38);
        p.rotation.x=Math.PI/2;
        const edge=new T.LineSegments(new T.EdgesGeometry(plateGeo,16),this.mechEdgeMaterial);
        edge.scale.copy(p.scale);edge.rotation.copy(p.rotation);
        g.add(p,edge);
        g.position.set(d[0],d[1],d[2]);
        g.rotation.z=d[5];
        this.mechanicalGroup.add(g);this.plates.push(g);
      }
      this.mechanicalGroup.scale.setScalar(.001);
    }

    makeTentacles(){
      const T=this.THREE,r=this.rand;
      this.tentacleMaterial=new T.MeshStandardMaterial({
        color:0x092530,metalness:.55,roughness:.30,
        emissive:0x0b697a,emissiveIntensity:.62,
        transparent:true,opacity:0
      });
      this.tentacleEdgeMaterial=new T.MeshBasicMaterial({
        color:0x79eaff,wireframe:true,transparent:true,opacity:0,
        depthWrite:false,blending:T.AdditiveBlending
      });
      this.tentacles=[];
      for(let i=0;i<11;i++){
        const a=i/11*Math.PI*2+(r()-.5)*.20;
        const start=new T.Vector3(Math.cos(a)*1.0,Math.sin(a)*1.0,(r()-.5)*.18);
        const dir=new T.Vector3(Math.cos(a),Math.sin(a),0);
        const side=new T.Vector3(-dir.y,dir.x,0);
        const len=2.0+r()*1.8;
        const points=[
          start,
          start.clone().addScaledVector(dir,len*.30).addScaledVector(side,(r()-.5)*.72).add(new T.Vector3(0,0,(r()-.5)*.35)),
          start.clone().addScaledVector(dir,len*.66).addScaledVector(side,(r()-.5)*1.05).add(new T.Vector3(0,0,(r()-.5)*.55)),
          start.clone().addScaledVector(dir,len).addScaledVector(side,(r()-.5)*.70).add(new T.Vector3(0,0,(r()-.5)*.60))
        ];
        const curve=new T.CatmullRomCurve3(points,false,'catmullrom',.52);
        const geo=new T.TubeGeometry(curve,48,.035+r()*.025,7,false);
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
      const fade=1-smooth((t-2.55)/1.25);
      const intro=ease(t/.75);
      this.dnaGroup.visible=fade>.002;
      this.dnas.forEach((h,i)=>{
        const b=h.userData.base;
        const fly=1-intro;
        h.position.x=b.x*(1+fly*.52);
        h.position.y=b.y*(1+fly*.45);
        h.position.z=b.z-fly*2.8;
        h.rotation.x=Math.sin(time*.00045+b.phase)*.10;
        h.rotation.y=Math.sin(time*.00032+b.phase)*.22;
        h.rotation.z=b.rz+time*.000055*(i%2?1:-1);
        const s=b.s*(.92+.08*intro);
        h.scale.setScalar(s);
        for(const m of h.userData.materials){
          const base=m.color.getHex()===0x6eeaff?.84:(m.color.getHex()===0x8c6aff?.72:.33);
          m.opacity=base*fade*intro;
        }
      });
    }

    updateCore(t,time){
      let s=.001;
      if(t>1.15 && t<3.05)s=.18+ease((t-1.15)/1.90)*.70;
      else if(t>=3.05 && t<6.25)s=.88+Math.sin((t-3.05)*1.1)*.025;
      else if(t>=6.25)s=.88+smooth((t-6.25)/2.0)*.12;
      const endMove=smooth((t-9.68)/.28);
      const target=this.targetWorld();
      this.coreGroup.position.set(target.x*endMove,target.y*endMove,0);
      this.cellGroup.position.copy(this.coreGroup.position);
      this.mechanicalGroup.position.copy(this.coreGroup.position);
      this.tentacleGroup.position.copy(this.coreGroup.position);

      this.coreGroup.scale.setScalar(s*mix(1,.78,endMove));
      this.coreGroup.rotation.y=time*.00013;
      this.coreGroup.rotation.x=Math.sin(time*.00037)*.045;
      this.coreShell.rotation.z=Math.PI/4+Math.sin(time*.00055)*.018;
      this.coreGlass.rotation.z=Math.PI/4-Math.sin(time*.00062)*.025;

      const eye=smooth((t-2.28)/.52);
      const pulse=.86+.14*Math.sin(time*.0055);
      this.irisGroup.scale.setScalar(mix(.2,1,eye)*pulse);
      this.glowSprite.material.opacity=(.18+.64*eye)*pulse;
      this.glowSprite.scale.setScalar(1.7+eye*.55+Math.sin(time*.004)*.08);
      this.coreInner.material.opacity=.35+.62*eye;
      this.coreEdges.material.opacity=.12+.26*eye;
      this.coreLight.intensity=eye*(9+Math.sin(time*.005)*2.5);
    }

    updateCells(t,time){
      const grow=smooth((t-2.62)/.65);
      const hold=1-smooth((t-6.30)/1.18);
      const visible=grow*hold;
      this.cellGroup.visible=visible>.002;
      this.cellGroup.scale.setScalar(.001+visible*.98);
      this.cellMaterial.opacity=.78*visible;
      this.cellEdgeMaterial.opacity=.10*visible;
      this.cellVeinMaterial.opacity=.42*visible;
      this.cells.forEach((c,i)=>{
        const q=1+Math.sin(time*.00125+c.userData.phase)*.028*visible;
        c.scale.multiplyScalar(1);
        c.rotation.y+=.0007*(i%2?1:-1);
        c.position.z+=Math.sin(time*.00042+c.userData.phase)*.0006;
        c.children[0].scale.setScalar(q);
        c.children[1].scale.setScalar(q);
      });
    }

    updateMechanical(t,time){
      const grow=smooth((t-6.05)/1.00);
      this.mechanicalGroup.visible=grow>.002;
      this.mechanicalGroup.scale.setScalar(.001+grow*.99);
      this.mechMaterial.opacity=.92*grow;
      this.mechEdgeMaterial.opacity=.40*grow;
      this.plates.forEach((p,i)=>{
        const open=(1-grow)*.34;
        const a=i*Math.PI/2;
        p.position.x+=(Math.cos(a)*open-p.position.x*0)*0;
        p.rotation.z+=(i%2?1:-1)*.00025;
      });
    }

    updateTentacles(t,time){
      const grow=smooth((t-6.18)/1.20);
      this.tentacleGroup.visible=grow>.002;
      this.tentacleMaterial.opacity=.68*grow;
      this.tentacleEdgeMaterial.opacity=.18*grow;
      this.tentacles.forEach((g,i)=>{
        const wave=1+Math.sin(time*.00105+g.userData.phase)*.018*grow;
        const sy=.001+grow*.999;
        g.scale.set(sy*wave,sy*wave,sy*wave);
        g.rotation.z=Math.sin(time*.00055+g.userData.phase)*.035*grow;
        g.rotation.x=Math.sin(time*.00043+g.userData.phase)*.025*grow;
      });
    }

    updateCamera(t,time){
      let z=7.25,y=.10,x=0;
      if(t<2.45){
        const k=smooth(t/2.45);
        z=mix(6.20,7.0,k);
        x=Math.sin(time*.00034)*.24*(1-k*.45);
        y=.10+Math.sin(time*.00029)*.10;
      }else if(t<3.25){
        const k=smooth((t-2.45)/.80);
        z=mix(7.0,4.72,k);
        y=mix(.10,.02,k);
      }else if(t<5.85){
        z=4.72+Math.sin(time*.00028)*.06;
        x=Math.sin(time*.00021)*.07;
        y=Math.cos(time*.00024)*.05;
      }else if(t<8.15){
        const k=smooth((t-5.85)/2.30);
        z=mix(4.72,6.55,k);
        x=Math.sin(time*.00020)*.08*(1-k);
        y=.02;
      }else{
        z=mix(6.55,6.95,smooth((t-8.15)/1.55));
      }
      const portrait=this.width<this.height;
      if(portrait)z+=1.15;
      this.camera.position.set(x,y,z);
      this.camera.lookAt(0,0,0);
    }

    render(r,time){
      if(this.disposed)return;
      const t=clamp(r)*10;
      this.updateCamera(t,time);
      this.updateDNA(t,time);
      this.updateCore(t,time);
      this.updateCells(t,time);
      this.updateMechanical(t,time);
      this.updateTentacles(t,time);

      this.particles.rotation.z=time*.000018;
      this.particles.rotation.y=time*.000012;
      this.particles.material.opacity=.38+.10*Math.sin(time*.00045);

      const flash=smooth((t-9.28)/.12)*(1-smooth((t-9.62)/.22));
      this.renderer.toneMappingExposure=1.16+flash*2.35;
      this.coreLight.intensity+=flash*34;

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

  let loader=null;
  async function attach(canvas,getTarget){
    if(!(canvas instanceof HTMLCanvasElement))return null;
    try{
      loader ||= loadThree();
      const THREE=await loader;
      const engine=new FormatXGenesisThree(THREE,canvas,getTarget);
      return {
        resize:()=>engine.resize(),
        draw:(r,time)=>engine.render(r,time),
        destroy:()=>engine.destroy(),
        engine,
        revision:'r650-three-genesis'
      };
    }catch(error){
      console.error('FormatX R650 genesis renderer failed:',error);
      document.documentElement.dataset.fxMagBirthR650='fallback-r649';
      return null;
    }
  }

  window.FormatXMagGenesisThreeR650={
    attach,
    revision:'r650-three-genesis-dna-cellular-living-architecture'
  };
})();