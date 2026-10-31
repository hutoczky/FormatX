/* FormatX R560 — collision-safe persistent Mini MAG site controller. Manual MAG pause is
   intentionally absent; motion accessibility is handled by reduced-motion. */
(function(){
'use strict';
const root=document.documentElement;
if(['ready','booting','cinematic-deferred','primary-deferred'].includes(root.dataset.fxMiniMagAssistantR459))return;
root.dataset.fxMiniMagAssistantR459='booting';
const STYLE='/scifi-ui/styles/formatx-mini-mag-assistant-r459.css?v=20260920-r560-context-collision-safe';
const SECTION_IDS=['hero','experience','capabilities','pricing','system','resources'];
let pendingHeroRequest=false,installDeferredNow=null;
const COPY={
  hu:{launcher:'MAG vezérlő megnyitása',title:'MAG',subtitle:'Állandó oldalvezérlő · a fő MAG megmarad',close:'Bezárás',controls:'VEZÉRLÉS',navigation:'NAVIGÁCIÓ',ask:['ASSZISZTENS','Kérdezz'],menu:['OLDAL','Menü'],sound:['HANG','Hang ki / be'],language:['NYELV','HU / EN'],shape:['MAG','Élő reakció'],hero:['01','Kezdőlap'],experience:['02','Munkafolyamat'],capabilities:['03','Képességek'],pricing:['04','Csomagok'],system:['05','Rendszer'],resources:['06','Letöltések'],foot:'Alt+M: MAG · Esc: panel bezárása'},
  en:{launcher:'Open MAG controller',title:'MAG',subtitle:'Persistent site controller · primary MAG remains',close:'Close',controls:'CONTROLS',navigation:'NAVIGATION',ask:['ASSISTANT','Ask'],menu:['SITE','Menu'],sound:['SOUND','Sound on / off'],language:['LANGUAGE','HU / EN'],shape:['MAG','Living response'],hero:['01','Home'],experience:['02','Workflow'],capabilities:['03','Capabilities'],pricing:['04','Plans'],system:['05','System'],resources:['06','Downloads'],foot:'Alt+M: MAG · Esc: close panel'}
};
function language(){return root.lang==='en'?'en':'hu';}
function node(tag,className){const el=document.createElement(tag);if(className)el.className=className;return el;}
function setPair(button,pair){const over=button.querySelector('span'),main=button.querySelector('b');if(over)over.textContent=pair[0];if(main)main.textContent=pair[1];}
function addStyle(){if(document.querySelector('link[data-fx-mini-mag-assistant-r459]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href=STYLE;link.dataset.fxMiniMagAssistantR459='true';document.head.appendChild(link);}
function visibleButton(selector){return Array.from(document.querySelectorAll(selector)).find(item=>{if(!(item instanceof HTMLButtonElement))return false;const style=getComputedStyle(item),rect=item.getBoundingClientRect();return !item.hidden&&style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity||1)>.02&&rect.width>0&&rect.height>0;})||document.querySelector(selector);}
function clickButton(selector){const target=visibleButton(selector);if(target instanceof HTMLButtonElement){target.click();return true;}return false;}
function scrollToSection(id){const target=document.getElementById(id);if(!(target instanceof HTMLElement))return false;target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});root.dataset.fxMiniMagLastNavigationR459=id;window.FormatXCoreMobileV69?.pulse?.({phase:'mini-mag-navigation',x:0,y:0});return true;}
function openAsk(){if(clickButton('.fx-reference-ask'))return true;const api=window.FormatXOrganismVoice;if(typeof api?.open==='function'){api.open();window.FormatXCoreMobileV69?.pulse?.();return true;}const trigger=visibleButton('.fx-organism-thought-trigger');if(trigger instanceof HTMLButtonElement){trigger.click();return true;}return false;}
function toggleMenu(){if(clickButton('#menu-toggle,.fx-reference-menu-button'))return true;const nav=document.getElementById('main-nav');if(!(nav instanceof HTMLElement))return false;const open=!nav.classList.contains('open');nav.classList.toggle('open',open);root.dataset.fxMiniMagMenuFallbackR459=open?'open':'closed';return true;}
function toggleSound(){return clickButton('.fx-three-sound');}
function toggleLanguage(){return clickButton('.fx-language-toggle');}
function triggerLivingResponse(){if(typeof window.FormatXCoreShapeR337?.next==='function'){window.FormatXCoreShapeR337.next('mini-mag-living-response');return true;}return clickButton('.fx-reference-mag-button');}
function buildAction(action){const button=node('button','fx-mini-mag-action-r459');button.type='button';button.dataset.action=action;button.append(node('span'),node('b'));return button;}
function buildNav(id){const button=node('button');button.type='button';button.dataset.section=id;button.append(node('span'),node('b'));return button;}
addEventListener('formatx:heromagcontrollerrequest',()=>{const api=window.FormatXMiniMagR459;if(typeof api?.toggle==='function'){api.toggle();root.dataset.fxMiniMagHeroBridgeR460='handled-live-request';}else{pendingHeroRequest=true;root.dataset.fxMiniMagHeroBridgeR460='queued-until-ready';installDeferredNow?.();}},{passive:true});
function install(){
  if(!document.body||document.body.dataset.fxPublicPage){root.dataset.fxMiniMagAssistantR459='public-page-skip';return;}
  if(document.querySelector('.fx-mini-mag-assistant-r459')){root.dataset.fxMiniMagAssistantR459='ready';return;}
  const host=node('aside','fx-mini-mag-assistant-r459');host.dataset.open='false';host.setAttribute('aria-label','MAG');
  const launcher=node('button','fx-mini-mag-launcher-r459');launcher.type='button';launcher.setAttribute('aria-expanded','false');launcher.setAttribute('aria-controls','fx-mini-mag-panel-r459');
  const glyph=node('span','fx-mini-mag-glyph-r459');glyph.setAttribute('aria-hidden','true');const status=node('span','fx-mini-mag-status-r459');status.setAttribute('aria-hidden','true');launcher.append(glyph,status);
  const panel=node('section','fx-mini-mag-panel-r459');panel.id='fx-mini-mag-panel-r459';panel.setAttribute('aria-hidden','true');
  const head=node('div','fx-mini-mag-head-r459'),titleWrap=node('div'),title=node('strong'),subtitle=node('small'),close=node('button','fx-mini-mag-close-r459');titleWrap.append(title,subtitle);close.type='button';close.textContent='×';head.append(titleWrap,close);
  const controlLabel=node('span','fx-mini-mag-section-label-r459'),actions=node('div','fx-mini-mag-actions-r459');
  for(const action of ['ask','menu','sound','language','shape'])actions.appendChild(buildAction(action));
  const navLabel=node('span','fx-mini-mag-section-label-r459'),nav=node('div','fx-mini-mag-nav-r459');for(const id of SECTION_IDS)nav.appendChild(buildNav(id));const foot=node('div','fx-mini-mag-foot-r459');
  panel.append(head,controlLabel,actions,navLabel,nav,foot);host.append(panel,launcher);document.body.appendChild(host);
  function setOpen(open,focusPanel=false){host.dataset.open=open?'true':'false';launcher.setAttribute('aria-expanded',String(open));panel.setAttribute('aria-hidden',String(!open));root.dataset.fxMiniMagPanelR459=open?'open':'closed';if(open){window.FormatXCoreMobileV69?.pulse?.({phase:'mini-mag-open',x:.18,y:-.12});if(focusPanel)close.focus({preventScroll:true});}else if(document.activeElement&&panel.contains(document.activeElement))launcher.focus({preventScroll:true});scheduleContextSafety('panel-state');}
  function syncCopy(){const c=COPY[language()];launcher.setAttribute('aria-label',c.launcher);launcher.title=c.launcher;title.textContent=c.title;subtitle.textContent=c.subtitle;close.setAttribute('aria-label',c.close);close.title=c.close;controlLabel.textContent=c.controls;navLabel.textContent=c.navigation;foot.textContent=c.foot;actions.querySelectorAll('[data-action]').forEach(button=>setPair(button,c[button.dataset.action]));nav.querySelectorAll('[data-section]').forEach(button=>setPair(button,c[button.dataset.section]));root.dataset.fxMiniMagLanguageR459=language();}
  launcher.addEventListener('click',()=>setOpen(host.dataset.open!=='true',true));close.addEventListener('click',()=>setOpen(false));
  actions.addEventListener('click',event=>{const button=event.target instanceof Element?event.target.closest('[data-action]'):null;if(!(button instanceof HTMLButtonElement))return;const action=button.dataset.action;let handled=false;if(action==='ask')handled=openAsk();else if(action==='menu')handled=toggleMenu();else if(action==='sound')handled=toggleSound();else if(action==='language')handled=toggleLanguage();else if(action==='shape')handled=triggerLivingResponse();root.dataset.fxMiniMagLastActionR459=handled?String(action):`${action}-unavailable`;if(action==='ask'||action==='menu')setOpen(false);});
  nav.addEventListener('click',event=>{const button=event.target instanceof Element?event.target.closest('[data-section]'):null;if(!(button instanceof HTMLButtonElement))return;if(scrollToSection(button.dataset.section||''))setOpen(false);});
  document.addEventListener('pointerdown',event=>{if(host.dataset.open!=='true'||!(event.target instanceof Node)||host.contains(event.target))return;setOpen(false);},{passive:true});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&host.dataset.open==='true'){event.preventDefault();setOpen(false);return;}if(event.altKey&&!event.ctrlKey&&!event.metaKey&&String(event.key).toLowerCase()==='m'){event.preventDefault();setOpen(host.dataset.open!=='true',true);}});
  let terminalHidden=false,collisionHidden=false,contextFrame=0;
  const collisionSelector='a[href],button,input,select,textarea,[role="button"],h1,h2,h3,h4,p,li,label,small,th,td,output';
  function applyContextSafety(source='runtime'){
    const hidden=host.dataset.open!=='true'&&(terminalHidden||collisionHidden);
    host.dataset.contextHidden=hidden?'true':'false';
    root.dataset.fxMiniMagContextR539=hidden?'terminal-information-safe':'normal';
    root.dataset.fxMiniMagContextR560=hidden?(terminalHidden?'terminal-information-safe':'collision-information-safe'):'normal';
    root.dataset.fxMiniMagContextSourceR560=source;
  }
  function collidesWithInformation(){
    if(host.dataset.open==='true')return false;
    const rect=launcher.getBoundingClientRect();
    if(rect.width<1||rect.height<1)return false;
    const samples=[.12,.38,.62,.88];
    // R2231: repeated sample points often hit the same DOM element.
    // Its style and geometry cannot change during this read-only pass.
    const inspectedTargets=new Set();
    for(const fx of samples)for(const fy of samples){
      const x=Math.max(1,Math.min(innerWidth-1,rect.left+rect.width*fx));
      const y=Math.max(1,Math.min(innerHeight-1,rect.top+rect.height*fy));
      for(const el of document.elementsFromPoint(x,y)){
        if(!(el instanceof Element)||host.contains(el))continue;
        const target=el.matches(collisionSelector)?el:el.closest(collisionSelector);
        if(!(target instanceof Element)||host.contains(target))continue;
        if(inspectedTargets.has(target))continue;
        inspectedTargets.add(target);
        const style=getComputedStyle(target),box=target.getBoundingClientRect();
        const visible=style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity||1)>.02&&box.width>0&&box.height>0;
        if(visible)return true;
      }
    }
    return false;
  }
  function updateContextSafety(source='runtime'){
    contextFrame=0;
    // R2242: during the canonical Genesis film, the cinema occluder owns the
    // visible viewport. Sampling 16 underlying hit-test rays forces Chrome
    // to resolve the full layout/style tree before the actual MAG is ready.
    // Keep the closed mini controller hidden (the full hero MAG remains);
    // resume accurate collision protection on the real film-end event.
    // Intro=0, reduced-motion fallback and an explicitly open panel are
    // unaffected. One owner, no extra renderer or polling timer.
    const cinematicActive=root.dataset.fxMagBirthLiveR533==='active'
      ||!!document.getElementById('fx-mag-birth-prepaint-r1606');
    if(host.dataset.open!=='true'&&cinematicActive){
      collisionHidden=true;
      applyContextSafety('cinematic-safe-deferred');
      return;
    }
    collisionHidden=collidesWithInformation();
    applyContextSafety(source);
  }
  function scheduleContextSafety(source='event'){
    if(contextFrame)return;
    contextFrame=requestAnimationFrame(()=>updateContextSafety(source));
  }
  const terminalZones=[document.getElementById('resources'),document.querySelector('footer.site-footer')].filter(node=>node instanceof HTMLElement);
  if('IntersectionObserver' in window&&terminalZones.length){
    const terminalObserver=new IntersectionObserver(entries=>{
      terminalHidden=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.03);
      scheduleContextSafety('terminal-intersection');
    },{threshold:[0,.03,.15],rootMargin:'0px 0px 0px 0px'});
    terminalZones.forEach(node=>terminalObserver.observe(node));
  }
  addEventListener('scroll',()=>scheduleContextSafety('scroll'),{passive:true});
  addEventListener('resize',()=>scheduleContextSafety('resize'),{passive:true});
  addEventListener('orientationchange',()=>scheduleContextSafety('orientation'),{passive:true});
  addEventListener('formatx:cinematicscene',()=>scheduleContextSafety('cinematic-scene'),{passive:true});
  // R2243: canonical R533 dispatches this NON-bubbling event on document.
  document.addEventListener('formatx:magbirthcomplete',()=>scheduleContextSafety('post-genesis'),{passive:true});
  addEventListener('formatx:loop',()=>scheduleContextSafety('loop'),{passive:true});
  addEventListener('pageshow',()=>scheduleContextSafety('pageshow'),{passive:true});
  scheduleContextSafety('install');
  for(const name of ['formatx:languagechange','pageshow'])addEventListener(name,syncCopy,{passive:true});syncCopy();
  window.FormatXMiniMagR459={open:()=>setOpen(true,true),close:()=>setOpen(false),toggle:()=>setOpen(host.dataset.open!=='true',true),navigate:scrollToSection,ask:openAsk,menu:toggleMenu,sound:toggleSound,language:toggleLanguage,shape:triggerLivingResponse,livingResponse:triggerLivingResponse,element:host};
  root.dataset.fxMiniMagAssistantR459='ready';root.dataset.fxMiniMagPrimaryHeroR459='preserved-native-webgl';root.dataset.fxMiniMagHeroBridgeR460='ready';root.dataset.fxMiniMagMotionControlR528='reduced-motion-only-no-manual-pause';
  if(pendingHeroRequest){pendingHeroRequest=false;setOpen(true,true);root.dataset.fxMiniMagHeroBridgeR460='opened-queued-request';}
  dispatchEvent(new CustomEvent('formatx:minimagready',{detail:{version:'r528',persistent:true,heroBridge:'r460'}}));
}
/* R2262 — do not build the duplicate control DOM and synchronously load its
   stylesheet while the full-screen cinematic birth already owns the display.
   Desktop Lighthouse isolated a 114–118 ms Mini MAG source task overlapping
   native R326 GPU startup around 3.7–3.9 s. Keep the command bridge ready,
   defer only this secondary controller until the first post-film idle slot.
   Direct user requests always mount immediately; intro=0/public fallbacks
   retain the original prompt startup. No recurring timer or observer. */
function mountAfterCinemaR2262(){
  const cinematicActive=root.dataset.fxMagBirthLiveR533==='active'
    ||!!document.getElementById('fx-mag-birth-prepaint-r1606');
  const hasPrimaryHero=!!document.getElementById('hero');
  if(!cinematicActive&&(!hasPrimaryHero||document.body?.dataset.fxPublicPage)){
    addStyle();install();return;
  }
  // R2263: the no-intro (including audit/skip) startup is also a real
  // primary-MAG-first experience. Building the secondary Mini MAG at 3.7s
  // while the native R326 is compiling caused 128–137 ms competing tasks.
  // Listen to the ORIGINAL current-MAG readiness event on WINDOW, unlike
  // the non-bubbling film completion event which is dispatched on DOCUMENT.
  const primaryReady=!cinematicActive&&(
    root.dataset.fxCurrentMagRuntimeR422==='ready'
    ||root.dataset.fxCoreFirstFrameR1913==='painted'
  );
  const eventTarget=cinematicActive?document:window;
  const eventName=cinematicActive?'formatx:magbirthcomplete'
    :'formatx:currentmagready';
  root.dataset.fxMiniMagAssistantR459=cinematicActive?
    'cinematic-deferred':'primary-deferred';
  let pending=true,watchdog=0;
  const onSafe=()=>settle(false);
  function settle(urgent){
    if(!pending)return;
    pending=false;
    eventTarget.removeEventListener(eventName,onSafe);
    if(watchdog)clearTimeout(watchdog);
    installDeferredNow=null;
    const attach=()=>{
      if(root.dataset.fxMiniMagAssistantR459==='ready')return;
      addStyle();install();
    };
    if(urgent)attach();
    else if('requestIdleCallback' in window)
      requestIdleCallback(attach,{timeout:800});
    else setTimeout(attach,150);
  }
  installDeferredNow=()=>settle(true);
  if(primaryReady){settle(false);return;}
  eventTarget.addEventListener(eventName,onSafe,{once:true,passive:true});
  // One-shot safety net: never leave controls absent if a third-party
  // script suppresses the expected lifecycle event.
  watchdog=setTimeout(()=>settle(false),cinematicActive?11500:6000);
}
if(document.readyState==='loading')
  document.addEventListener('DOMContentLoaded',mountAfterCinemaR2262,{once:true});
else mountAfterCinemaR2262();
}());
