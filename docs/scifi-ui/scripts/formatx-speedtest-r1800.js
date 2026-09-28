(function(){
'use strict';

const root=document.documentElement;
const lab=document.querySelector('[data-fx-speedtest]');
if(!(lab instanceof HTMLElement))return;
if(lab.dataset.fxSpeedtestMounted==='true')return;
lab.dataset.fxSpeedtestMounted='true';

const start=lab.querySelector('[data-speed-start]');
const stop=lab.querySelector('[data-speed-stop]');
const status=lab.querySelector('[data-speed-status]');
const progressRing=lab.querySelector('[role="progressbar"]');
const dial=lab.querySelector('[data-speed-dial-value]');
const dialUnit=lab.querySelector('[data-speed-dial-unit]');
const edge=lab.querySelector('[data-speed-edge]');
const used=lab.querySelector('[data-speed-used]');
const hint=lab.querySelector('[data-speed-network]');
const ping=lab.querySelector('[data-speed-ping]');
const jitter=lab.querySelector('[data-speed-jitter]');
const down=lab.querySelector('[data-speed-download]');
const up=lab.querySelector('[data-speed-upload]');

const MiB=1024*1024;
let controller=null;
let running=false;
let transferred=0;
let lastPhase='ready';

const copy={
  hu:{
    ready:'Készen áll. A mérés csak gombnyomásra indul.',
    ping:'Késleltetés mérése…',
    download:'Letöltési sebesség mérése…',
    upload:'Feltöltési sebesség mérése…',
    complete:'Mérés kész.',
    cancelled:'A mérés megszakítva.',
    failed:'A mérés nem fejezhető be. Próbáld újra.',
    rate:'Túl sok mérés indult rövid időn belül. Próbáld újra egy perc múlva.',
    network:'Böngészői hálózati jelzés',
    edge:'FormatX edge',
    used:'Felhasznált adat',
  },
  en:{
    ready:'Ready. The test only starts after you press the button.',
    ping:'Measuring latency…',
    download:'Measuring download speed…',
    upload:'Measuring upload speed…',
    complete:'Measurement complete.',
    cancelled:'Measurement cancelled.',
    failed:'The measurement could not finish. Try again.',
    rate:'Too many tests were started recently. Try again in a minute.',
    network:'Browser network hint',
    edge:'FormatX edge',
    used:'Data used',
  }
};

function language(){
  return document.documentElement.lang.toLowerCase().startsWith('en')?'en':'hu';
}
function t(key){return copy[language()][key]||copy.hu[key]||key;}
function setStatus(key){
  lastPhase=key;
  if(status)status.textContent=t(key);
}
function setProgress(value){
  const bounded=Math.max(0,Math.min(100,Number(value)||0));
  lab.style.setProperty('--fx-speed-progress',bounded.toFixed(1)+'%');
  progressRing?.setAttribute('aria-valuenow',String(Math.round(bounded)));
}
function number(value,digits=1){
  return Number.isFinite(value)?value.toFixed(digits):'—';
}
function setMetric(node,value,digits=1){
  if(node)node.textContent=number(value,digits);
}
function median(values){
  const sorted=[...values].sort((a,b)=>a-b);
  const middle=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;
}
function jitterOf(values){
  if(values.length<2)return 0;
  let total=0;
  for(let i=1;i<values.length;i+=1)total+=Math.abs(values[i]-values[i-1]);
  return total/(values.length-1);
}
function endpoint(path,params={}){
  const url=new URL(path,location.origin);
  Object.entries(params).forEach(([key,value])=>url.searchParams.set(key,String(value)));
  url.searchParams.set('_',String(Date.now())+Math.random().toString(16).slice(2));
  return url.pathname+url.search;
}
function connectionHint(){
  const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  if(!connection)return '—';
  const parts=[];
  if(connection.effectiveType)parts.push(String(connection.effectiveType).toUpperCase());
  if(Number.isFinite(connection.downlink))parts.push('~'+connection.downlink+' Mbps');
  if(connection.saveData)parts.push('Data Saver');
  return parts.join(' · ')||'—';
}
function randomPayload(bytes){
  const data=new Uint8Array(bytes);
  for(let offset=0;offset<data.length;offset+=65536){
    crypto.getRandomValues(data.subarray(offset,Math.min(offset+65536,data.length)));
  }
  return data;
}
function abortError(error){
  return error?.name==='AbortError'||String(error?.message||'').toLowerCase().includes('abort');
}
async function checkedFetch(url,options={}){
  const response=await fetch(url,{
    cache:'no-store',
    credentials:'same-origin',
    signal:controller?.signal,
    ...options
  });
  if(response.status===429){
    const err=new Error('rate_limited');
    err.code='rate_limited';
    throw err;
  }
  if(!response.ok)throw new Error('HTTP '+response.status);
  const edgeCode=response.headers.get('x-formatx-edge');
  if(edgeCode&&edge)edge.textContent=edgeCode;
  return response;
}

async function pingTest(){
  await checkedFetch(endpoint('/api/speedtest/ping')).then(r=>r.arrayBuffer());
  const samples=[];
  for(let i=0;i<8;i+=1){
    const before=performance.now();
    const response=await checkedFetch(endpoint('/api/speedtest/ping'));
    await response.arrayBuffer();
    samples.push(performance.now()-before);
    setProgress(4+(i+1)*2);
  }
  return { ping:median(samples), jitter:jitterOf(samples) };
}

async function downloadRound(bytes,parallel){
  const before=performance.now();
  const sizes=await Promise.all(Array.from({length:parallel},async()=>{
    const response=await checkedFetch(endpoint('/api/speedtest/download',{bytes}));
    const buffer=await response.arrayBuffer();
    return buffer.byteLength;
  }));
  const elapsed=Math.max(1,performance.now()-before);
  const total=sizes.reduce((sum,value)=>sum+value,0);
  transferred+=total;
  return {mbps:(total*8)/(elapsed/1000)/1e6,elapsed,total};
}
async function downloadTest(saveData){
  let result=await downloadRound(saveData?512*1024:MiB,saveData?1:2);
  setProgress(34);
  if(!saveData&&result.elapsed<1800){
    result=await downloadRound(4*MiB,3);
    setProgress(50);
    if(result.elapsed<650){
      result=await downloadRound(8*MiB,3);
    }
  }
  setProgress(64);
  return result.mbps;
}

async function uploadRound(bytes,parallel){
  const payload=randomPayload(bytes);
  const before=performance.now();
  const responses=await Promise.all(Array.from({length:parallel},async()=>{
    const response=await checkedFetch(endpoint('/api/speedtest/upload'),{
      method:'POST',
      headers:{
        'Content-Type':'application/octet-stream',
        'X-FormatX-Speedtest':'r1800'
      },
      body:payload.slice()
    });
    return response.json();
  }));
  const elapsed=Math.max(1,performance.now()-before);
  const total=responses.reduce((sum,item)=>sum+(Number(item.received_bytes)||0),0);
  transferred+=total;
  return {mbps:(total*8)/(elapsed/1000)/1e6,elapsed,total};
}
async function uploadTest(saveData){
  let result=await uploadRound(saveData?256*1024:512*1024,1);
  setProgress(76);
  if(!saveData&&result.elapsed<1800){
    result=await uploadRound(2*MiB,2);
    setProgress(88);
    if(result.elapsed<650){
      result=await uploadRound(4*MiB,2);
    }
  }
  setProgress(98);
  return result.mbps;
}
function resetNumbers(){
  [ping,jitter,down,up].forEach(node=>{if(node)node.textContent='—';});
  if(dial)dial.textContent='0';
  if(dialUnit)dialUnit.textContent='Mbps';
  transferred=0;
}
function updateDataUsed(){
  if(used)used.textContent=(transferred/MiB).toFixed(transferred>=10?0:1)+' MB';
}
function setRunning(next){
  running=next;
  if(next)lab.dataset.state='running';
  lab.setAttribute('aria-busy',next?'true':'false');
  if(start)start.disabled=next;
  if(stop)stop.disabled=!next;
}
async function run(){
  if(running)return;
  controller=new AbortController();
  setRunning(true);
  lab.dataset.state='running';
  root.dataset.fxSpeedtestActive='true';
  resetNumbers();
  setProgress(0);
  if(hint)hint.textContent=connectionHint();
  try{
    setStatus('ping');
    const latency=await pingTest();
    setMetric(ping,latency.ping,1);
    setMetric(jitter,latency.jitter,1);
    if(dial){dial.textContent=number(latency.ping,0);if(dialUnit)dialUnit.textContent='ms';}

    const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    const saveData=Boolean(connection?.saveData);

    setStatus('download');
    const download=await downloadTest(saveData);
    setMetric(down,download,1);
    if(dial){dial.textContent=number(download,0);if(dialUnit)dialUnit.textContent='Mbps';}
    updateDataUsed();

    setStatus('upload');
    const upload=await uploadTest(saveData);
    setMetric(up,upload,1);
    if(dial){dial.textContent=number(upload,0);if(dialUnit)dialUnit.textContent='Mbps';}
    updateDataUsed();

    setProgress(100);
    lab.dataset.state='complete';
    setStatus('complete');
    window.dispatchEvent(new CustomEvent('formatx:speedtestcomplete',{detail:{
      ping:latency.ping,jitter:latency.jitter,download,upload,bytes:transferred
    }}));
  }catch(error){
    if(abortError(error)){
      setStatus('cancelled');
    }else if(error?.code==='rate_limited'||String(error?.message||'')==='rate_limited'){
      setStatus('rate');
    }else{
      console.warn('FormatX speed test failed',error);
      setStatus('failed');
    }
    lab.dataset.state='error';
  }finally{
    root.dataset.fxSpeedtestActive='false';
    setRunning(false);
    controller=null;
    updateDataUsed();
  }
}
function cancel(){
  if(controller)controller.abort();
}

start?.addEventListener('click',run);
stop?.addEventListener('click',cancel);
window.addEventListener('formatx:languagechange',()=>{
  if(!running)setStatus(lastPhase);
});
if(hint)hint.textContent=connectionHint();
setStatus('ready');
setProgress(0);
root.dataset.fxSpeedtestR1800='ready-user-activated-zero-idle';
}());
