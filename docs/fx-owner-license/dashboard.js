const byId=id=>document.getElementById(id);
const el={service:byId('serviceState'),email:byId('adminEmail'),licenses:byId('statLicenses'),active:byId('statActive'),pending:byId('statPending'),approved:byId('statApproved'),auth:byId('authType'),licenseApi:byId('licenseApiState'),feedbackApi:byId('feedbackApiState'),refresh:byId('dashboardRefresh'),toast:byId('toast')};
let toastTimer=0;
function toast(message,error=false){clearTimeout(toastTimer);el.toast.textContent=message;el.toast.classList.toggle('error',error);el.toast.hidden=false;toastTimer=setTimeout(()=>{el.toast.hidden=true},4500)}
async function json(url){const response=await fetch(url,{credentials:'same-origin',headers:{Accept:'application/json'}});const data=await response.json().catch(()=>({}));if(response.status===401){location.assign('/fx-owner-license/login');throw new Error('A munkamenet lejárt.')}if(!response.ok)throw new Error(data.error||data.message||`HTTP ${response.status}`);return data}
async function load(){
  el.refresh.disabled=true;
  try{
    const session=await json('/fx-owner-license/api/me');
    el.email.textContent=session.email||'—';
    el.service.textContent=session.auth_type==='cloudflare-access'?'Cloudflare Access':'védett kapcsolat';
    el.service.className='state state-ok';
    el.auth.textContent=session.auth_type==='cloudflare-access'?'Cloudflare Access':'Tulajdonosi munkamenet';
    const [lic,feedback]=await Promise.allSettled([
      json('/fx-owner-license/api/licenses?'),
      json('/fx-owner-license/api/feedback/summary')
    ]);
    if(lic.status==='fulfilled'){
      const rows=lic.value.licenses||[];
      el.licenses.textContent=String(rows.length);
      el.active.textContent=String(rows.filter(item=>item.status==='active'&&(!item.expires_at||new Date(item.expires_at).getTime()>Date.now())).length);
      el.licenseApi.textContent='online';
      el.licenseApi.style.color='var(--green)';
    }else{el.licenseApi.textContent='hiba';el.licenseApi.style.color='var(--red)'}
    if(feedback.status==='fulfilled'){
      const s=feedback.value.summary||{};
      el.pending.textContent=String(s.pending||0);el.approved.textContent=String(s.approved||0);
      el.feedbackApi.textContent='online';el.feedbackApi.style.color='var(--green)';
    }else{el.feedbackApi.textContent='hiba';el.feedbackApi.style.color='var(--red)'}
  }catch(error){el.service.textContent='hiba';el.service.className='state state-error';toast(`A vezérlőpult nem tölthető be: ${error.message}`,true)}
  finally{el.refresh.disabled=false}
}
el.refresh.addEventListener('click',load);
load();
