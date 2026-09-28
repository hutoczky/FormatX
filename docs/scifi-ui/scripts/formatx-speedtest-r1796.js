const ROOT=document.documentElement;
const STYLE='/scifi-ui/styles/formatx-speedtest-r1796.css?v=20260928-r1796-edge-speedtest';
const PING='/api/speedtest/ping';
const DOWN='/api/speedtest/download';
const UP='/api/speedtest/upload';

let dialog=null,running=false;

function lang(){return document.documentElement.lang==='en'?'en':'hu';}
function t(hu,en){return lang()==='en'?en:hu;}
function ensureStyle(){
  if(document.querySelector('link[data-fx-speedtest-style]'))return;
  const l=document.createElement('link');
  l.rel='stylesheet';l.href=STYLE;l.dataset.fxSpeedtestStyle='true';
  document.head.appendChild(l);
}
function metric(label,id,unit){
  return '<div class="fx-speedtest-metric"><small>'+label+'</small><strong data-speedtest-'+id+'>—</strong><span>'+unit+'</span></div>';
}
function ensureDialog(){
  if(dialog)return dialog;
  ensureStyle();
  dialog=document.createElement('dialog');
  dialog.className='fx-speedtest-r1796';
  dialog.setAttribute('aria-labelledby','fx-speedtest-title');
  dialog.innerHTML=
    '<form method="dialog" class="fx-speedtest-shell">'+
      '<div class="fx-speedtest-head"><div><small>FORMATX EDGE</small><h2 id="fx-speedtest-title">'+t('Internet sebességteszt','Internet speed test')+'</h2></div><button class="fx-speedtest-close" value="close" aria-label="'+t('Bezárás','Close')+'">×</button></div>'+
      '<p class="fx-speedtest-copy">'+t('Közvetlen mérés a FormatX Cloudflare edge felé. A mérés csak gombnyomásra indul.','Direct measurement to the FormatX Cloudflare edge. The test starts only when you press the button.')+'</p>'+
      '<div class="fx-speedtest-grid">'+
        metric(t('Ping','Ping'),'ping','ms')+
        metric(t('Jitter','Jitter'),'jitter','ms')+
        metric(t('Letöltés','Download'),'download','Mbps')+
        metric(t('Feltöltés','Upload'),'upload','Mbps')+
      '</div>'+
      '<div class="fx-speedtest-progress"><i data-speedtest-progress></i></div>'+
      '<p class="fx-speedtest-status" data-speedtest-status>'+t('Készen áll.','Ready.')+'</p>'+
      '<div class="fx-speedtest-actions"><button type="button" class="button button-solid" data-speedtest-start>'+t('TESZT INDÍTÁSA','START TEST')+'</button></div>'+
      '<p class="fx-speedtest-note">'+t('Becsült adatforgalom: kb. 16–48 MB letöltés és 4–12 MB feltöltés. Az eredmény böngésző/edge mérés, nem szolgáltatói hitelesítés.','Estimated data use: about 16–48 MB download and 4–12 MB upload. Results are browser/edge measurements, not ISP certification.')+'</p>'+
    '</form>';
  document.body.appendChild(dialog);
  dialog.querySelector('[data-speedtest-start]').addEventListener('click',run);
  return dialog;
}
function setMetric(name,value,digits=0){
  const el=dialog?.querySelector('[data-speedtest-'+name+']');
  if(el)el.textContent=Number.isFinite(value)?value.toFixed(digits):'—';
}
function setStatus(text,progress){
  const s=dialog?.querySelector('[data-speedtest-status]');
  const p=dialog?.querySelector('[data-speedtest-progress]');
  if(s)s.textContent=text;
  if(p&&Number.isFinite(progress))p.style.transform='scaleX('+Math.max(0,Math.min(1,progress))+')';
}
async function pingOnce(){
  const start=performance.now();
  const r=await fetch(PING+'?r='+Date.now()+'-'+Math.random(),{cache:'no-store',credentials:'same-origin'});
  if(!r.ok)throw new Error('ping '+r.status);
  await r.text();
  return performance.now()-start;
}
async function measurePing(){
  await pingOnce();
  const values=[];
  for(let i=0;i<7;i++)values.push(await pingOnce());
  const sorted=[...values].sort((a,b)=>a-b);
  const ping=sorted[Math.floor(sorted.length/2)];
  let jitter=0;
  for(let i=1;i<values.length;i++)jitter+=Math.abs(values[i]-values[i-1]);
  jitter/=Math.max(1,values.length-1);
  return{ping,jitter};
}
async function downloadRound(bytes,count){
  const start=performance.now(),results=await Promise.all(Array.from({length:count},async(_,i)=>{
    const r=await fetch(DOWN+'?bytes='+bytes+'&r='+Date.now()+'-'+i+'-'+Math.random(),{cache:'no-store',credentials:'same-origin'});
    if(!r.ok)throw new Error('download '+r.status);
    const b=await r.arrayBuffer();
    return b.byteLength;
  }));
  const seconds=(performance.now()-start)/1000;
  const total=results.reduce((a,b)=>a+b,0);
  return{mbps:(total*8/1e6)/seconds,seconds,total};
}
async function measureDownload(){
  const first=await downloadRound(4*1024*1024,4);
  if(first.seconds>=.7)return first.mbps;
  const second=await downloadRound(8*1024*1024,4);
  return Math.max(first.mbps,second.mbps);
}
async function uploadRound(bytes,count){
  const payload=new Uint8Array(bytes);
  const start=performance.now();
  const results=await Promise.all(Array.from({length:count},async(_,i)=>{
    const r=await fetch(UP+'?r='+Date.now()+'-'+i+'-'+Math.random(),{
      method:'POST',body:payload,cache:'no-store',credentials:'same-origin',
      headers:{'Content-Type':'application/octet-stream'}
    });
    if(!r.ok)throw new Error('upload '+r.status);
    const j=await r.json();
    return Number(j.bytes||0);
  }));
  const seconds=(performance.now()-start)/1000;
  const total=results.reduce((a,b)=>a+b,0);
  return{mbps:(total*8/1e6)/seconds,seconds,total};
}
async function measureUpload(){
  const first=await uploadRound(2*1024*1024,2);
  if(first.seconds>=.7)return first.mbps;
  const second=await uploadRound(4*1024*1024,2);
  return Math.max(first.mbps,second.mbps);
}
async function run(){
  if(running)return;
  running=true;
  ROOT.dataset.fxSpeedtestR1796='running';
  const startBtn=dialog.querySelector('[data-speedtest-start]');
  startBtn.disabled=true;
  try{
    setMetric('ping',NaN);setMetric('jitter',NaN);setMetric('download',NaN);setMetric('upload',NaN);
    setStatus(t('Ping és jitter mérése…','Measuring ping and jitter…'),.12);
    const latency=await measurePing();
    setMetric('ping',latency.ping,1);setMetric('jitter',latency.jitter,1);
    setStatus(t('Letöltési sebesség mérése…','Measuring download speed…'),.38);
    const down=await measureDownload();setMetric('download',down,1);
    setStatus(t('Feltöltési sebesség mérése…','Measuring upload speed…'),.72);
    const up=await measureUpload();setMetric('upload',up,1);
    setStatus(t('Mérés kész.','Test complete.'),1);
    ROOT.dataset.fxSpeedtestR1796='complete';
  }catch(error){
    console.warn('FormatX speed test:',error);
    setStatus(t('A mérés megszakadt. Próbáld újra.','The test was interrupted. Try again.'),0);
    ROOT.dataset.fxSpeedtestR1796='error';
  }finally{
    running=false;startBtn.disabled=false;
  }
}
export function openSpeedTest(){
  const d=ensureDialog();
  if(typeof d.showModal==='function'&&!d.open)d.showModal();
  else d.setAttribute('open','');
  ROOT.dataset.fxSpeedtestR1796='open';
}
ROOT.dataset.fxSpeedtestModuleR1796='ready-user-intent-only';