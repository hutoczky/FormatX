const API='/api/account';
const q=new URLSearchParams(location.search);
const next=safeNext(q.get('next'));
const reason=q.get('reason');
const initialMode=q.get('mode')==='register'?'register':'login';
const el=id=>document.getElementById(id);
const nodes={
 loading:el('authLoading'),forms:el('authForms'),signed:el('signedIn'),reason:el('downloadReason'),
 loginTab:el('loginTab'),registerTab:el('registerTab'),loginForm:el('loginForm'),registerForm:el('registerForm'),
 loginStatus:el('loginStatus'),registerStatus:el('registerStatus'),userName:el('userName'),userEmail:el('userEmail'),
 continue:el('continueDownload'),logout:el('logoutButton')
};
if(reason==='download')nodes.reason.hidden=false;
nodes.continue.href=next||'/scifi-ui/downloads/';

function safeNext(value){const raw=String(value||'');return /^\/download\/(?:multiplatform|android|android-native-beta)(?:\?.*)?$/.test(raw)?raw:'/scifi-ui/downloads/'}
function message(node,text,error=false){node.textContent=text;node.classList.toggle('error',error)}
function setMode(mode){
 const login=mode!=='register';
 nodes.loginTab.setAttribute('aria-selected',String(login));nodes.registerTab.setAttribute('aria-selected',String(!login));
 nodes.loginForm.hidden=!login;nodes.registerForm.hidden=login;
}
nodes.loginTab.addEventListener('click',()=>setMode('login'));
nodes.registerTab.addEventListener('click',()=>setMode('register'));
setMode(initialMode);

async function api(path,options={}){
 const headers=new Headers(options.headers||{});if(options.body)headers.set('Content-Type','application/json');
 const response=await fetch(API+path,{...options,headers,credentials:'same-origin'});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(errorText(data.error));
 return data;
}
function errorText(code){return({
 invalid_name:'Adj meg legalább két karakteres nevet.',
 invalid_email:'Érvényes e-mail-címet adj meg.',
 weak_password:'A jelszó legalább 10 karakter legyen.',
 privacy_consent_required:'A feltételek és az adatkezelési tájékoztató elfogadása szükséges.',
 email_already_registered:'Ehhez az e-mail-címhez már tartozik fiók. Lépj be.',
 invalid_credentials:'Hibás e-mail-cím vagy jelszó.',
 rate_limited:'Túl sok próbálkozás. Várj egy percet.',
 account_database_unavailable:'A fiókszolgáltatás átmenetileg nem érhető el.'
})[code]||'A művelet nem sikerült. Próbáld újra.'}

function showSigned(user){
 nodes.loading.hidden=true;nodes.forms.hidden=true;nodes.signed.hidden=false;
 nodes.userName.textContent=user.display_name||'FormatX felhasználó';nodes.userEmail.textContent=user.email||'';
}
function showForms(){nodes.loading.hidden=true;nodes.signed.hidden=true;nodes.forms.hidden=false}

nodes.loginForm.addEventListener('submit',async event=>{
 event.preventDefault();message(nodes.loginStatus,'Belépés…');
 const button=event.currentTarget.querySelector('button[type="submit"]');button.disabled=true;
 try{
  const data=await api('/login',{method:'POST',body:JSON.stringify({
   email:el('loginEmail').value,password:el('loginPassword').value,remember:el('loginRemember').checked
  })});
  if(next.startsWith('/download/'))location.assign(next);else showSigned(data.user);
 }catch(error){message(nodes.loginStatus,error.message,true)}
 finally{button.disabled=false}
});

nodes.registerForm.addEventListener('submit',async event=>{
 event.preventDefault();message(nodes.registerStatus,'Regisztráció…');
 const password=el('registerPassword').value;
 if(password!==el('registerPasswordAgain').value){message(nodes.registerStatus,'A két jelszó nem egyezik.',true);return}
 const button=event.currentTarget.querySelector('button[type="submit"]');button.disabled=true;
 try{
  const data=await api('/register',{method:'POST',body:JSON.stringify({
   display_name:el('registerName').value,email:el('registerEmail').value,password,
   remember:el('registerRemember').checked,privacy_consent:el('privacyConsent').checked
  })});
  if(next.startsWith('/download/'))location.assign(next);else showSigned(data.user);
 }catch(error){
  message(nodes.registerStatus,error.message,true);
  if(/már tartozik fiók/.test(error.message)){el('loginEmail').value=el('registerEmail').value;setMode('login')}
 }finally{button.disabled=false}
});

nodes.logout.addEventListener('click',async()=>{
 nodes.logout.disabled=true;
 try{await api('/logout',{method:'POST',body:'{}'});showForms();setMode('login')}
 catch(_){location.reload()}
 finally{nodes.logout.disabled=false}
});

(async()=>{
 try{const data=await api('/me');if(data.authenticated)showSigned(data.user);else showForms()}
 catch(_){showForms()}
})();
