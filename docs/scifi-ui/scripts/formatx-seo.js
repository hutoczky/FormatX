(function(){
'use strict';

const R=document.documentElement;
const O='https://www.formatxsuite.com';
const P={
  '/':{
    hu:['FormatX Suite Pro | Technikusi operációs réteg','Független technikusi operációs réteg diagnosztikához, telepítéshez, meghajtókezeléshez és ellenőrizhető karbantartáshoz. Teljes kiadás 5 napos próbalicenccel.'],
    en:['FormatX Suite Pro | Technician Operating Layer','An independent technician operating layer for diagnostics, installation, drive management and verifiable maintenance. Full release with a 5-day trial licence.']
  },
  '/scifi-ui/downloads/':{
    hu:['Letöltések és platformállapot | FormatX','A FormatX teljes multiplatform kiadása: Bazzite/Linux elsődleges, Windows támogatott, Android külön teljes kiadás; 5 napos próbalicenccel.'],
    en:['Downloads and platform status | FormatX','FormatX full release: Bazzite/Linux primary, Windows supported, with a separate Android full release and a 5-day trial licence.']
  },
  '/scifi-ui/method.html':{
    hu:['A FormatX módszer | FormatX','Felderítés, Terv, Kontrollált végrehajtás és Visszaellenőrzés.'],
    en:['The FormatX Method | FormatX','Discover, Plan, Controlled execution and Verify.']
  },
  '/scifi-ui/verification.html':{
    hu:['Bizonyítéki központ | FormatX','Kiadási adatok, tesztek, korlátozások és nyílt bizonyítékhiányok a FormatX teljes kiadásához.'],
    en:['Verification Centre | FormatX','Release data, tests, limitations and open evidence gaps for the FormatX full release.']
  },
  '/scifi-ui/test-matrix.html':{
    hu:['Nyilvános tesztmátrix | FormatX','Bizonyítékalapú tesztesetek szöveges állapottal és ismert korlátozással.'],
    en:['Public test matrix | FormatX','Evidence-based test cases with textual status and known limitations.']
  },
  '/scifi-ui/known-issues.html':{
    hu:['Ismert hibák és korlátozások | FormatX','A teljes kiadás ismert platformkorlátai, bizonyítékhiányai, kerülőútjai és javítási állapotai.'],
    en:['Known issues and limitations | FormatX','Known platform limitations, evidence gaps, workarounds and fix states for the full release.']
  },
  '/scifi-ui/security.html':{
    hu:['Biztonsági modell | FormatX','A FormatX módszer biztonsági elvei és nyilvános bizonyítékállapota.'],
    en:['Security model | FormatX','Security principles and public evidence state of the FormatX Method.']
  },
  '/scifi-ui/decision-log.html':{
    hu:['Fejlesztési döntésnapló | FormatX','Nyilvános problémák, döntések, kompromisszumok és nyitott kérdések.'],
    en:['Development decision log | FormatX','Public problems, decisions, trade-offs and open questions.']
  },
  '/scifi-ui/technical-report.html':{
    hu:['Technikai bizonyítékriport | FormatX','A FormatX nyilvános technikai bizonyítékai, tesztkapui, korlátozásai és még hiányzó külső bizonyítékai.'],
    en:['Technical evidence report | FormatX','Public FormatX technical evidence, test gates, limitations and external evidence still outstanding.']
  },
  '/scifi-ui/license.html':{
    hu:['Részletes licenc | FormatX','A FormatX használati és forráskódlicencének közérthető feltételei.'],
    en:['Detailed licence | FormatX','Plain-language terms of the FormatX usage and source-code licence.']
  },
  '/scifi-ui/terms.html':{
    hu:['Felhasználási feltételek | FormatX','A FormatX teljes kiadásának, 5 napos próbalicencének és fizetős licenceinek használati feltételei.'],
    en:['Terms of use | FormatX','Terms for the FormatX full release, its 5-day trial licence and paid licences.']
  },
  '/scifi-ui/privacy.html':{
    hu:['Adatkezelés | FormatX','A FormatX weboldal, visszajelzési és licencfolyamatának adatkezelési tájékoztatója.'],
    en:['Privacy notice | FormatX','Privacy information for the FormatX website, feedback and licensing flows.']
  },
  '/scifi-ui/support.html':{
    hu:['Támogatás és hibajelentés | FormatX','Támogatási, hibajelentési és bizonyítékbeküldési lehetőségek.'],
    en:['Support and issue reporting | FormatX','Support, issue-reporting and evidence-submission routes.']
  },
  '/scifi-ui/checkout.html':{
    hu:['Licencrendelés | FormatX','Egyszeri banki átutalásos licencrendelés a FormatX teljes kiadásához, 5 napos próbalicenccel.'],
    en:['Licence order | FormatX','One-time bank-transfer licence order for the FormatX full release with a 5-day trial licence.']
  }
};

const NOINDEX=new Set(['/scifi-ui/payment/success.html','/scifi-ui/payment/cancel.html']);

function path(){
  let p=location.pathname||'/';
  if(['/index.html','/scifi-ui','/scifi-ui/','/scifi-ui/index.html'].includes(p))p='/';
  if(p==='/scifi-ui/downloads/index.html')p='/scifi-ui/downloads/';
  return p;
}
function lang(){return R.lang==='en'?'en':'hu'}
function link(rel,href,hl){
  const q=hl?`link[rel="${rel}"][hreflang="${hl}"]`:`link[rel="${rel}"]:not([hreflang])`;
  let x=document.head.querySelector(q);
  if(!x){x=document.createElement('link');x.rel=rel;if(hl)x.hreflang=hl;document.head.append(x)}
  x.href=href;
}
function meta(sel,name,value){
  let x=document.head.querySelector(sel);
  if(!x){x=document.createElement('meta');if(name.startsWith('og:'))x.setAttribute('property',name);else x.name=name;document.head.append(x)}
  x.content=value;
}
function release(){return R.__FORMATX_RELEASE_METADATA__?.release||null}
function install(){
  const p=path();
  if(NOINDEX.has(p)){
    meta('meta[name="robots"]','robots','noindex,nofollow,noarchive');
    R.dataset.fxSeo='ready-v4';
    return;
  }
  const u=O+p;
  const c=P[p]||P['/'];
  const v=c[lang()];
  document.title=v[0];
  meta('meta[name="description"]','description',v[1]);
  meta('meta[property="og:title"]','og:title',v[0]);
  meta('meta[property="og:description"]','og:description',v[1]);
  meta('meta[property="og:type"]','og:type','website');
  meta('meta[property="og:url"]','og:url',u);
  link('canonical',u);
  link('alternate',u+'?lang=hu','hu');
  link('alternate',u+'?lang=en','en');
  link('alternate',u,'x-default');

  const rel=release();
  const software={
    '@type':'SoftwareApplication',
    '@id':O+'/#software',
    name:'FormatX Suite Pro',
    applicationCategory:'UtilitiesApplication',
    operatingSystem:'Linux/Bazzite; Windows; Android',
    url:O+'/',
    downloadUrl:O+'/scifi-ui/downloads/',
    license:O+'/scifi-ui/license.html',
    author:{'@type':'Person',name:'Hutóczky József'},
    additionalProperty:[
      {'@type':'PropertyValue',name:'Category',value:'Technician Operating Layer'},
      {'@type':'PropertyValue',name:'Method',value:'Discover → Plan → Controlled execution → Verify'},
      {'@type':'PropertyValue',name:'Overall status',value:'Full release'},
      {'@type':'PropertyValue',name:'Trial licence',value:'5 days'},
      {'@type':'PropertyValue',name:'Primary platform',value:'Bazzite/Linux'},
      {'@type':'PropertyValue',name:'Supported secondary platforms',value:'Windows; Android'},
      {'@type':'PropertyValue',name:'Web surface',value:'Technical preview'},
      {'@type':'PropertyValue',name:'macOS and iOS/iPadOS',value:'Planned'}
    ],
    sameAs:['https://github.com/hutoczky/FormatX']
  };
  if(rel?.version)software.softwareVersion=rel.version;
  if(rel?.published_at)software.datePublished=rel.published_at;
  if(rel?.release_url)software.releaseNotes=rel.release_url;

  let s=document.getElementById('formatx-structured-data');
  if(!s){s=document.createElement('script');s.id='formatx-structured-data';s.type='application/ld+json';document.head.append(s)}
  s.textContent=JSON.stringify({'@context':'https://schema.org','@graph':[
    {'@type':'WebSite','@id':O+'/#website',url:O+'/',name:'FormatX Suite Pro',inLanguage:['hu-HU','en-GB']},
    software,
    {'@type':'WebPage','@id':u+'#webpage',url:u,name:v[0],description:v[1],isPartOf:{'@id':O+'/#website'},about:{'@id':O+'/#software'},inLanguage:lang()==='en'?'en-GB':'hu-HU'}
  ]});
  R.dataset.fxSeo='ready-v4';
}

addEventListener('formatx:languagechange',install);
addEventListener('formatx:releasemetadataready',install);
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
}());
