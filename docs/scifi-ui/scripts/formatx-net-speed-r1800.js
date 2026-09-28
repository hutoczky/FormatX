/* FormatX R1800 — user-initiated network speed test.
   No automatic traffic. No idle RAF. Measures the browser -> FormatX edge path. */
(function(){
'use strict';

const section=document.querySelector('[data-fx-net-speed-r1800]');
if(!(section instanceof HTMLElement)||section.dataset.fxNetBoundR1800==='true')return;
section.dataset.fxNetBoundR1800='true';

const root=document.documentElement;
const startButton=section.querySelector('[data-net-start]');
const cancelButton=section.querySelector('[data-net-cancel]');
const copyButton=section.querySelector('[data-net-copy]');
const progress=section.querySelector('[data-net-progress]');
const status=section.querySelector('[data-net-status]');
const primary=section.querySelector('[data-net-primary]');
const unit=section.querySelector('[data-net-unit]');
const quality=section.querySelector('[data-net-quality]');
const edge=section.querySelector('[data-net-edge]');
const connection=section.querySelector('[data-net-connection]');
const pingOut=section.querySelector('[data-net-ping]');
const jitterOut=section.querySelector('[data-net-jitter]');
const downOut=section.querySelector('[data-net-download]');
const upOut=section.querySelector('[data-net-upload]');

if(!(startButton instanceof HTMLButtonElement)||!(cancelButton instanceof HTMLButtonElement))return;

const MB=1024*1024;
let controller=null;
let running=false;
let result=null;

const hu={
  idle:'A mérés csak gombnyomásra indul.',
  ping:'Kapcsolati késés mérése…',
  download:'Letöltési sávszélesség mérése…',
  upload:'Feltöltési sávszélesség mérése…',
  complete:'Mérés kész.',
  cancelled:'A mérés megszakítva.',
  error:'A mérés nem fejezhető be. Próbáld újra.',
  copied:'Az eredmény a vágólapra került.',
  excellent:'KIVÁLÓ',
  good:'JÓ',
  fair:'KÖZEPES',
  weak:'GYENGE',
  edge:'EDGE',
  browserEstimate:'Böngésző becslése'
};
const en={
  idle:'The test starts only when you press the button.',
  ping:'Measuring connection latency…',
  download:'Measuring download bandwidth…',
  upload:'Measuring upload bandwidth…',
  complete:'Test complete.',
  cancelled:'Test cancelled.',
  error:'The test could not finish. Try again.',
  copied:'Result copied to clipboard.',
  excellent:'EXCELLENT',
  good:'GOOD',
  fair:'FAIR',
  weak:'WEAK',
  edge:'EDGE',
  browserEstimate:'Browser estimate'
};
function copy(){return document.documentElement.lang==='en'?en:hu;}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function median(values){
  const a=[...values].sort((x,y)=>x-y);
  const m=Math.floor(a.length/2);
  return a.length%2?a[m]:(a[m-1]+a[m])/2;
}
function average(values){return values.reduce((a,b)=>a+b,0)/Math.max(1,values.length);}
function fmt(value,digits=1){return Number.isFinite(value)?value.toFixed(digits):'—';}
function setStatus(text){if(status)status.textContent=text;}
function setProgress(value){
  const v=clamp(value,0,100);
  if(progress instanceof HTMLProgressElement)progress.value=v;
  section.style.setProperty('--fx-net-angle',String(v*3.6)+'deg');
}
function setPrimary(value,nextUnit='Mbps',level=.15){
  if(primary)primary.textContent=value;
  if(unit)unit.textContent=nextUnit;
  section.style.setProperty('--fx-net-level',String(clamp(level,0,1)));
}
function setState(next){
  section.dataset.fxNetState=next;
  root.dataset.fxNetSpeedR1800=next;
}
function setMetric(el,value,suffix){
  if(el)el.textContent=Number.isFinite(value)?fmt(value,1)+(suffix||''):'—';
}
function scoreHigher(value,steps){
  for(const [threshold,score] of steps)if(value>=threshold)return score;
  return 8;
}
function scoreLower(value,steps){
  for(const [threshold,score] of steps)if(value<=threshold)return score;
  return 8;
}
function connectionScore(data){
  const latency=scoreLower(data.ping,[[10,100],[20,92],[40,80],[70,66],[110,48],[160,28]]);
  const jitter=scoreLower(data.jitter,[[2,100],[5,90],[10,76],[20,58],[35,38]]);
  const down=scoreHigher(data.download,[[500,100],[250,94],[100,86],[50,75],[25,61],[10,45],[5,30]]);
  const up=scoreHigher(data.upload,[[200,100],[100,94],[50,85],[25,74],[10,60],[5,45],[2,30]]);
  return Math.round(latency*.30+jitter*.15+down*.35+up*.20);
}
function qualityLabel(score){
  const t=copy();
  if(score>=88)return t.excellent;
  if(score>=74)return t.good;
  if(score>=54)return t.fair;
  return t.weak;
}
function speedLevel(mbps){
  return clamp(Math.log10(1+Math.max(0,mbps))/Math.log10(1001),.06,1);
}
function latencyLevel(ms){
  return clamp(1-(Math.max(0,ms)/180),.08,1);
}
function nonce(){return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);}
function delay(ms){return new Promise(resolve=>setTimeout(resolve,ms));}

async function request(url,options={},timeout=15000){
  if(!controller)throw new DOMException('Cancelled','AbortError');
  const local=new AbortController();
  const onAbort=()=>local.abort(controller.signal.reason);
  controller.signal.addEventListener('abort',onAbort,{once:true});
  const timer=setTimeout(()=>local.abort(new DOMException('Timeout','TimeoutError')),timeout);
  try{
    return await fetch(url,{...options,cache:'no-store',signal:local.signal});
  }finally{
    clearTimeout(timer);
    controller.signal.removeEventListener('abort',onAbort);
  }
}

async function measurePing(){
  const samples=[];
  let meta=null;
  for(let i=0;i<6;i++){
    const started=performance.now();
    const response=await request('/api/net/ping?r='+nonce(),{headers:{'Accept':'application/json'}},5000);
    if(!response.ok)throw new Error('ping '+response.status);
    const payload=await response.json();
    const elapsed=performance.now()-started;
    if(i>0)samples.push(elapsed);
    meta=payload;
    setPrimary(fmt(elapsed,0),'ms',latencyLevel(elapsed));
    setProgress(5+(i+1)*3);
    if(i<5)await delay(45);
  }
  const ping=median(samples);
  const diffs=samples.slice(1).map((v,i)=>Math.abs(v-samples[i]));
  return {ping,jitter:average(diffs),meta};
}

async function oneDownload(bytes){
  const started=performance.now();
  const response=await request('/api/net/download?bytes='+bytes+'&r='+nonce(),{headers:{'Accept':'application/octet-stream'}},18000);
  if(!response.ok)throw new Error('download '+response.status);
  let received=0;
  if(response.body&&typeof response.body.getReader==='function'){
    const reader=response.body.getReader();
    while(true){
      const part=await reader.read();
      if(part.done)break;
      received+=part.value?.byteLength||0;
    }
  }else{
    received=(await response.arrayBuffer()).byteLength;
  }
  const elapsed=Math.max(1,performance.now()-started);
  return {mbps:(received*8)/(elapsed*1000),bytes:received,elapsed};
}

async function measureDownload(){
  const values=[];
  let first=await oneDownload(1*MB);
  values.push(first.mbps);
  setPrimary(fmt(first.mbps),'Mbps',speedLevel(first.mbps));
  setProgress(38);
  const size=first.mbps>=300?8*MB:first.mbps>=140?6*MB:first.mbps>=60?4*MB:first.mbps>=20?2*MB:1*MB;
  for(let i=0;i<2;i++){
    const sample=await oneDownload(size);
    values.push(sample.mbps);
    setPrimary(fmt(sample.mbps),'Mbps',speedLevel(sample.mbps));
    setProgress(48+i*12);
  }
  return median(values);
}

function payload(size){
  const bytes=new Uint8Array(size);
  for(let i=0;i<size;i+=4096)bytes[i]=((i>>>12)*37+17)%251;
  return bytes;
}

async function oneUpload(bytes){
  const body=payload(bytes);
  const started=performance.now();
  const response=await request('/api/net/upload?r='+nonce(),{
    method:'POST',
    headers:{'Content-Type':'application/octet-stream','Accept':'application/json'},
    body
  },18000);
  if(!response.ok)throw new Error('upload '+response.status);
  const reply=await response.json();
  const elapsed=Math.max(1,performance.now()-started);
  const sent=Number(reply.bytes)||bytes;
  return {mbps:(sent*8)/(elapsed*1000),bytes:sent,elapsed};
}

async function measureUpload(){
  const values=[];
  const first=await oneUpload(512*1024);
  values.push(first.mbps);
  setPrimary(fmt(first.mbps),'Mbps',speedLevel(first.mbps));
  setProgress(76);
  const size=first.mbps>=100?4*MB:first.mbps>=35?2*MB:1*MB;
  for(let i=0;i<2;i++){
    const sample=await oneUpload(size);
    values.push(sample.mbps);
    setPrimary(fmt(sample.mbps),'Mbps',speedLevel(sample.mbps));
    setProgress(84+i*7);
  }
  return median(values);
}

function updateBrowserConnection(){
  const info=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  if(!connection)return;
  if(!info){
    connection.textContent='Network Information API: —';
    return;
  }
  const parts=[];
  if(info.effectiveType)parts.push(String(info.effectiveType).toUpperCase());
  if(Number.isFinite(info.downlink))parts.push(fmt(info.downlink,1)+' Mbps');
  if(Number.isFinite(info.rtt))parts.push(Math.round(info.rtt)+' ms RTT');
  if(info.saveData)parts.push('Data Saver');
  connection.textContent=(copy().browserEstimate+': '+(parts.join(' · ')||'—'));
}

function updateEdge(meta){
  if(!edge)return;
  const point=meta?.edge||copy().edge;
  const protocol=meta?.protocol||'';
  edge.textContent=protocol?point+' · '+protocol:point;
}

async function run(){
  if(running)return;
  running=true;
  result=null;
  controller=new AbortController();
  setState('running');
  startButton.disabled=true;
  cancelButton.hidden=false;
  if(copyButton instanceof HTMLButtonElement)copyButton.disabled=true;
  setProgress(2);
  setMetric(pingOut,NaN);
  setMetric(jitterOut,NaN);
  setMetric(downOut,NaN);
  setMetric(upOut,NaN);
  if(quality)quality.textContent='—';
  updateBrowserConnection();

  try{
    setStatus(copy().ping);
    const latency=await measurePing();
    setMetric(pingOut,latency.ping,' ms');
    setMetric(jitterOut,latency.jitter,' ms');
    updateEdge(latency.meta);
    setPrimary(fmt(latency.ping),'ms',latencyLevel(latency.ping));
    setProgress(24);

    setStatus(copy().download);
    const download=await measureDownload();
    setMetric(downOut,download,' Mbps');

    setStatus(copy().upload);
    const upload=await measureUpload();
    setMetric(upOut,upload,' Mbps');

    const score=connectionScore({ping:latency.ping,jitter:latency.jitter,download,upload});
    result={ping:latency.ping,jitter:latency.jitter,download,upload,score,edge:latency.meta?.edge||'',protocol:latency.meta?.protocol||''};
    if(quality)quality.textContent=qualityLabel(score)+' · '+score+'/100';
    setPrimary(fmt(download),'Mbps',speedLevel(download));
    setProgress(100);
    setStatus(copy().complete);
    setState('complete');
    if(copyButton instanceof HTMLButtonElement)copyButton.disabled=false;
  }catch(error){
    if(error?.name==='AbortError'){
      setState('cancelled');
      setStatus(copy().cancelled);
    }else{
      console.warn('[FormatX NET]',error);
      setState('error');
      setStatus(copy().error);
    }
    setProgress(0);
  }finally{
    running=false;
    controller=null;
    startButton.disabled=false;
    cancelButton.hidden=true;
  }
}

function cancel(){
  if(controller)controller.abort(new DOMException('Cancelled','AbortError'));
}

async function copyResult(){
  if(!result)return;
  const title='FormatX NET Speed Test';
  const lines=[
    title,
    'Ping: '+fmt(result.ping,1)+' ms',
    'Jitter: '+fmt(result.jitter,1)+' ms',
    'Download: '+fmt(result.download,1)+' Mbps',
    'Upload: '+fmt(result.upload,1)+' Mbps',
    'Quality: '+qualityLabel(result.score)+' '+result.score+'/100',
    result.edge?('Edge: '+result.edge+(result.protocol?' · '+result.protocol:'')):'',
    'formatxsuite.com'
  ].filter(Boolean).join('\n');
  try{
    await navigator.clipboard.writeText(lines);
  }catch(_){
    const area=document.createElement('textarea');
    area.value=lines;
    area.style.position='fixed';
    area.style.opacity='0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  setStatus(copy().copied);
}

startButton.addEventListener('click',run);
cancelButton.addEventListener('click',cancel);
copyButton?.addEventListener('click',copyResult);
updateBrowserConnection();
setProgress(0);
setState('idle');
setStatus(copy().idle);
root.dataset.fxNetSpeedContractR1800='user-initiated-same-origin-no-idle-network';
}());
