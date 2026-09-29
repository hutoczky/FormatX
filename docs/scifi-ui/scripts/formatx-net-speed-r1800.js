/* FormatX R1810 — user-initiated multi-stream gigabit network meter.
   No automatic traffic. No idle RAF. Measures this browser -> FormatX Cloudflare edge.
   High-throughput phases use parallel same-origin transfers so request/setup latency
   cannot cap gigabit-class connections near ~100 Mbps. */
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
const downLatencyOut=section.querySelector('[data-net-down-latency]');
const upLatencyOut=section.querySelector('[data-net-up-latency]');
const downOut=section.querySelector('[data-net-download]');
const upOut=section.querySelector('[data-net-upload]');

if(!(startButton instanceof HTMLButtonElement)||!(cancelButton instanceof HTMLButtonElement))return;

const MB=1024*1024;
const MAX_DOWNLOAD_STREAMS=8;
const MAX_UPLOAD_STREAMS=8;
let controller=null;
let running=false;
let result=null;

const hu={
  idle:'A mérés csak gombnyomásra indul.',
  ping:'Kapcsolati késés mérése…',
  download:'Letöltési sávszélesség mérése több párhuzamos adatfolyamon…',
  upload:'Feltöltési sávszélesség mérése több párhuzamos adatfolyamon…',
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
  download:'Measuring download bandwidth over multiple parallel streams…',
  upload:'Measuring upload bandwidth over multiple parallel streams…',
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
  const a=values.filter(Number.isFinite).sort((x,y)=>x-y);
  if(!a.length)return NaN;
  const m=Math.floor(a.length/2);
  return a.length%2?a[m]:(a[m-1]+a[m])/2;
}
function average(values){
  const a=values.filter(Number.isFinite);
  return a.length?a.reduce((x,y)=>x+y,0)/a.length:NaN;
}
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
  const down=scoreHigher(data.download,[[1000,100],[750,98],[500,96],[250,92],[100,84],[50,74],[25,60],[10,44],[5,30]]);
  const up=scoreHigher(data.upload,[[750,100],[500,98],[250,96],[100,92],[50,84],[25,73],[10,59],[5,44],[2,30]]);
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
  return clamp(Math.log10(1+Math.max(0,mbps))/Math.log10(2001),.06,1);
}
function latencyLevel(ms){
  return clamp(1-(Math.max(0,ms)/220),.08,1);
}
function nonce(){return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);}
function delay(ms){return new Promise(resolve=>setTimeout(resolve,ms));}

async function request(url,options={},timeout=20000){
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

async function pingSample(timeout=5000){
  const started=performance.now();
  const response=await request('/api/net/ping?r='+nonce(),{headers:{'Accept':'application/json'}},timeout);
  if(!response.ok)throw new Error('ping '+response.status);
  const payload=await response.json();
  return {elapsed:performance.now()-started,payload};
}

async function measurePing(){
  const samples=[];
  let meta=null;
  for(let i=0;i<8;i++){
    const sample=await pingSample();
    if(i>1)samples.push(sample.elapsed);
    meta=sample.payload;
    setPrimary(fmt(sample.elapsed,0),'ms',latencyLevel(sample.elapsed));
    setProgress(4+(i+1)*2.25);
    if(i<7)await delay(35);
  }
  const ping=median(samples);
  const diffs=samples.slice(1).map((v,i)=>Math.abs(v-samples[i]));
  return {ping,jitter:average(diffs),meta};
}

async function downloadStream(bytes){
  const response=await request('/api/net/download?bytes='+bytes+'&r='+nonce(),{
    headers:{'Accept':'application/octet-stream'}
  },25000);
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
  return received;
}

async function parallelDownload(streams,bytesPerStream,progressStart,progressSpan){
  const count=clamp(Math.round(streams),1,MAX_DOWNLOAD_STREAMS);
  const started=performance.now();
  let completed=0;
  let received=0;
  const tasks=Array.from({length:count},()=>downloadStream(bytesPerStream).then(bytes=>{
    received+=bytes;
    completed+=1;
    const elapsed=Math.max(1,performance.now()-started);
    const live=(received*8)/(elapsed*1000);
    setPrimary(fmt(live),'Mbps',speedLevel(live));
    setProgress(progressStart+progressSpan*(completed/count));
    return bytes;
  }));
  const chunks=await Promise.all(tasks);
  const elapsed=Math.max(1,performance.now()-started);
  const total=chunks.reduce((sum,bytes)=>sum+bytes,0);
  return {mbps:(total*8)/(elapsed*1000),bytes:total,elapsed,streams:count};
}

async function loadedLatencyDuring(taskFactory){
  let done=false;
  const samples=[];
  const sampler=(async()=>{
    while(!done&&samples.length<14){
      try{
        const sample=await pingSample(3500);
        samples.push(sample.elapsed);
      }catch(error){
        if(error?.name==='AbortError')throw error;
      }
      if(!done)await delay(55);
    }
  })();
  try{
    const value=await taskFactory();
    return {value,latency:median(samples)};
  }finally{
    done=true;
    await sampler.catch(()=>{});
  }
}

function downloadProfile(probeMbps){
  if(probeMbps>=500)return {streams:8,bytes:8*MB};
  if(probeMbps>=220)return {streams:7,bytes:8*MB};
  if(probeMbps>=90)return {streams:6,bytes:6*MB};
  if(probeMbps>=35)return {streams:4,bytes:4*MB};
  return {streams:3,bytes:2*MB};
}

async function measureDownload(){
  await parallelDownload(3,1*MB,27,4);
  const probe=await parallelDownload(6,4*MB,31,9);
  const profile=downloadProfile(probe.mbps);
  const measured=await loadedLatencyDuring(
    ()=>parallelDownload(profile.streams,profile.bytes,40,27)
  );
  return {
    mbps:measured.value.mbps,
    loadedLatency:measured.latency,
    streams:measured.value.streams,
    bytes:measured.value.bytes
  };
}

function payload(size){
  const bytes=new Uint8Array(size);
  for(let i=0;i<size;i+=4096)bytes[i]=((i>>>12)*37+17)%251;
  return bytes;
}

async function uploadStream(body){
  const response=await request('/api/net/upload?r='+nonce(),{
    method:'POST',
    headers:{'Content-Type':'application/octet-stream','Accept':'application/json'},
    body
  },25000);
  if(!response.ok)throw new Error('upload '+response.status);
  const reply=await response.json();
  return Number(reply.bytes)||body.size||0;
}

async function parallelUpload(streams,bytesPerStream,progressStart,progressSpan){
  const count=clamp(Math.round(streams),1,MAX_UPLOAD_STREAMS);
  const body=new Blob([payload(bytesPerStream)],{type:'application/octet-stream'});
  let completed=0;
  let sent=0;
  const started=performance.now();
  const tasks=Array.from({length:count},()=>uploadStream(body).then(bytes=>{
    sent+=bytes;
    completed+=1;
    const elapsed=Math.max(1,performance.now()-started);
    const live=(sent*8)/(elapsed*1000);
    setPrimary(fmt(live),'Mbps',speedLevel(live));
    setProgress(progressStart+progressSpan*(completed/count));
    return bytes;
  }));
  const chunks=await Promise.all(tasks);
  const elapsed=Math.max(1,performance.now()-started);
  const total=chunks.reduce((sum,bytes)=>sum+bytes,0);
  return {mbps:(total*8)/(elapsed*1000),bytes:total,elapsed,streams:count};
}

function uploadProfile(probeMbps){
  if(probeMbps>=300)return {streams:8,bytes:4*MB};
  if(probeMbps>=120)return {streams:7,bytes:4*MB};
  if(probeMbps>=50)return {streams:6,bytes:3*MB};
  if(probeMbps>=20)return {streams:4,bytes:2*MB};
  return {streams:3,bytes:1*MB};
}

async function measureUpload(){
  await parallelUpload(2,512*1024,70,4);
  const probe=await parallelUpload(4,2*MB,74,8);
  const profile=uploadProfile(probe.mbps);
  const measured=await loadedLatencyDuring(
    ()=>parallelUpload(profile.streams,profile.bytes,82,16)
  );
  return {
    mbps:measured.value.mbps,
    loadedLatency:measured.latency,
    streams:measured.value.streams,
    bytes:measured.value.bytes
  };
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
  for(const el of [pingOut,jitterOut,downLatencyOut,upLatencyOut,downOut,upOut])setMetric(el,NaN);
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
    setMetric(downOut,download.mbps,' Mbps');
    setMetric(downLatencyOut,download.loadedLatency,' ms');

    setStatus(copy().upload);
    const upload=await measureUpload();
    setMetric(upOut,upload.mbps,' Mbps');
    setMetric(upLatencyOut,upload.loadedLatency,' ms');

    const score=connectionScore({
      ping:latency.ping,
      jitter:latency.jitter,
      download:download.mbps,
      upload:upload.mbps
    });
    result={
      ping:latency.ping,
      jitter:latency.jitter,
      download:download.mbps,
      upload:upload.mbps,
      downloadLoadedLatency:download.loadedLatency,
      uploadLoadedLatency:upload.loadedLatency,
      downloadStreams:download.streams,
      uploadStreams:upload.streams,
      score,
      edge:latency.meta?.edge||'',
      protocol:latency.meta?.protocol||''
    };
    if(quality)quality.textContent=qualityLabel(score)+' · '+score+'/100';
    setPrimary(fmt(download.mbps),'Mbps',speedLevel(download.mbps));
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
    'Download loaded latency: '+fmt(result.downloadLoadedLatency,1)+' ms',
    'Upload: '+fmt(result.upload,1)+' Mbps',
    'Upload loaded latency: '+fmt(result.uploadLoadedLatency,1)+' ms',
    'Streams: ↓ '+result.downloadStreams+' / ↑ '+result.uploadStreams,
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
root.dataset.fxNetSpeedContractR1800='user-initiated-same-origin-multistream-gigabit-no-idle-network-r1810';
root.dataset.fxNetSpeedThroughputR1810='parallel-aggregate-wall-clock-download-upload';
root.dataset.fxNetSpeedLatencyR1810='idle-ping-jitter-plus-loaded-download-upload-latency';
}());
