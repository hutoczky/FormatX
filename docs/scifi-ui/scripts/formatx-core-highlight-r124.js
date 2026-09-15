(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxCoreHighlightR124==='ready'||root.dataset.fxCoreHighlightR124==='booting')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxCoreHighlightR124='audit-skip';return;}
root.dataset.fxCoreHighlightR124='booting';
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function boot(n=0){
 const stage=document.querySelector('#hero .fx-core-r112-stage, #hero .fx-core-mobile-v55-stage');if(!stage){if(n<300)return requestAnimationFrame(()=>boot(n+1));root.dataset.fxCoreHighlightR124='host-unavailable';return}
 stage.querySelectorAll('.fx-core-highlight-r124').forEach(x=>x.remove());const canvas=document.createElement('canvas');canvas.className='fx-core-highlight-r124';canvas.setAttribute('aria-hidden','true');stage.append(canvas);const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});if(!ctx){canvas.remove();root.dataset.fxCoreHighlightR124='context-unavailable';return}
 let w=0,h=0,dpr=1,raf=0,visible=true,last=performance.now(),t=0;
 function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;w=r.width;h=r.height;dpr=Math.min(devicePixelRatio||1,1.25);const cw=Math.round(w*dpr),ch=Math.round(h*dpr);if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}}
 function radius(a){const p=.585,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));return 1/Math.pow(Math.pow(c,p)+Math.pow(s,p),1/p)}
 function pt(a,r,cx,cy,sx,sy){const q=radius(a)*r;return[cx+Math.cos(a)*sx*q,cy+Math.sin(a)*sy*q]}
 function glow(color,width,blur,alpha){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=alpha;ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.stroke();ctx.shadowBlur=0}
 function render(now){raf=0;if(!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();if(w<2||h<2)return;const dt=Math.min(40,Math.max(0,now-last));last=now;if(!reduced.matches)t+=dt*.001;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation='lighter';const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0],cx=w*(.5+clamp(cp[0]||0,-.08,.08)*.25),cy=h*(.50-clamp(cp[1]||0,-.08,.08)*.20),sx=w*.468,sy=h*.485;
 // luminous outer membrane with spectral quadrants
 for(let q=0;q<4;q++){const a0=q*Math.PI/2-.04,a1=(q+1)*Math.PI/2+.04;ctx.beginPath();for(let i=0;i<=60;i++){const a=a0+(a1-a0)*i/60,r=.985+.007*Math.sin(a*9+t*.12+q),p=pt(a,r,cx,cy,sx,sy);if(i===0)ctx.moveTo(...p);else ctx.lineTo(...p)}glow(q%2?'rgba(196,76,255,.98)':'rgba(75,239,255,.99)',1.05,8,.44)}
 // four high-energy cardinal spines to force the reference tips to read clearly
 [[0,'rgba(224,255,255,.98)'],[Math.PI,'rgba(220,255,255,.98)'],[Math.PI/2,'rgba(213,255,255,.96)'],[-Math.PI/2,'rgba(216,255,255,.98)']].forEach(([a,color],i)=>{const p0=pt(a,.03,cx,cy,sx,sy),p1=pt(a,.995,cx,cy,sx,sy);ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);glow(color,i<2?1.30:1.20,10,.62)});
 // paired cyan/violet caustic ribs following the four lobes
 for(let arm=0;arm<4;arm++)for(let k=0;k<5;k++){const base=arm*Math.PI/2,side=(k%2?1:-1),a=base+side*(.12+.075*k),start=.16+.025*k,end=.86-.035*k,p0=pt(a,start,cx,cy,sx,sy),p3=pt(a,end,cx,cy,sx,sy),pm1=pt(a+side*.08,.38+.035*k,cx,cy,sx,sy),pm2=pt(a-side*.05,.63-.015*k,cx,cy,sx,sy);ctx.beginPath();ctx.moveTo(...p0);ctx.bezierCurveTo(...pm1,...pm2,...p3);glow((arm+k)%3===1?'rgba(198,77,255,.95)':'rgba(91,239,255,.96)',.58+(k===0?.25:0),5,.22+.04*k)}
 // tip flashes
 [-Math.PI/2,0,Math.PI/2,Math.PI].forEach((a,i)=>{const p=pt(a,.992,cx,cy,sx,sy),r=2.1+(i===0?1.0:.35),g=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],r*4.2);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.18,i%2?'rgba(194,92,255,.85)':'rgba(92,244,255,.88)');g.addColorStop(1,'rgba(80,220,255,0)');ctx.fillStyle=g;ctx.globalAlpha=.72;ctx.beginPath();ctx.arc(p[0],p[1],r*4.2,0,TAU);ctx.fill()});
 ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;root.dataset.fxCoreHighlightFrame='target-edge-r124';raf=requestAnimationFrame(render)}
 const ro=new ResizeObserver(resize);ro.observe(stage);const io=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible&&!raf&&root.dataset.fxReferenceMotionPaused!=='true'){last=performance.now();raf=requestAnimationFrame(render)}},{rootMargin:'160px'});io.observe(stage);addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&visible){last=performance.now();raf=requestAnimationFrame(render)}},{passive:true});resize();root.dataset.fxCoreHighlightR124='ready';dispatchEvent(new CustomEvent('formatx:corehighlightready',{detail:{version:'r124'}}));raf=requestAnimationFrame(render)
}
boot();
}());
