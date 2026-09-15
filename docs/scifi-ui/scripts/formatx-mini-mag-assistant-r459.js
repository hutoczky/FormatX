/* FormatX R528 — persistent Mini MAG site controller. Manual MAG pause is
   intentionally absent; motion accessibility is handled by reduced-motion. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMiniMagAssistantR459==='ready'||root.dataset.fxMiniMagAssistantR459==='booting')return;
root.dataset.fxMiniMagAssistantR459='booting';
const STYLE='/scifi-ui/styles/formatx-mini-mag-assistant-r459.css?v=20260830-r459-persistent-site-controller';
const SECTION_IDS=['hero','experience','capabilities','pricing','system','resources'];
let pendingHeroRequest=false;
const COPY={
  hu:{launcher:'MAG vezérlő megnyitása',title:'MAG',subtitle:'Állandó oldalvezérlő · a fő MAG megmarad',close:'Bezárás',controls:'VEZÉRLÉS',navigation:'NAVIGÁCIÓ',ask:['ASSZISZTENS','Kérdezz'],menu:['OLDAL','Menü'],sound:['HANG','Hang ki / be'],language:['NYELV','HU / EN'],shape:['MAG','Alakváltás'],hero:['01','Kezdőlap'],experience:['02','Munkafolyamat'],capabilities:['03','Képességek'],pricing:['04','Csomagok'],system:['05','Rendszer'],resources:['06','Letöltések'],foot:'Alt+M: MAG · Esc: panel bezárása'},
  en:{launcher:'Open MAG controller',title:'MAG',subtitle:'Persistent site controller · primary MAG remains',close:'Close',controls:'CONTROLS',navigation:'NAVIGATION',ask:['ASSISTANT','Ask'],menu:['SITE','Menu'],sound:['SOUND','Sound on / off'],language:['LANGUAGE','HU / EN'],shape:['MAG','Change shape'],hero:['01','Home'],experience:['02','Workflow'],capabilities:['03','Capabilities'],pricing:['04','Plans'],system:['05','System'],resources:['06','Downloads'],foot:'Alt+M: MAG · Esc: close panel'}
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
function toggleShape(){if(typeof window.FormatXCoreShapeR337?.next==='function'){window.FormatXCoreShapeR337.next();return true;}return clickButton('.fx-reference-mag-button');}
function buildAction(action){const button=node('button','fx-mini-mag-action-r459');button.type='button';button.dataset.action=action;button.append(node('span'),node('b'));return button;}
function buildNav(id){const button=node('button');button.type='button';button.dataset.section=id;button.append(node('span'),node('b'));return button;}
addEventListener('formatx:heromagcontrollerrequest',()=>{const api=window.FormatXMiniMagR459;if(typeof api?.toggle==='function'){api.toggle();root.dataset.fxMiniMagHeroBridgeR460='handled-live-request';}else{pendingHeroRequest=true;root.dataset.fxMiniMagHeroBridgeR460='queued-until-ready';}},{passive:true});
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
  function setOpen(open,focusPanel=false){host.dataset.open=open?'true':'false';launcher.setAttribute('aria-expanded',String(open));panel.setAttribute('aria-hidden',String(!open));root.dataset.fxMiniMagPanelR459=open?'open':'closed';if(open){window.FormatXCoreMobileV69?.pulse?.({phase:'mini-mag-open',x:.18,y:-.12});if(focusPanel)close.focus({preventScroll:true});}else if(document.activeElement&&panel.contains(document.activeElement))launcher.focus({preventScroll:true});}
  function syncCopy(){const c=COPY[language()];launcher.setAttribute('aria-label',c.launcher);launcher.title=c.launcher;title.textContent=c.title;subtitle.textContent=c.subtitle;close.setAttribute('aria-label',c.close);close.title=c.close;controlLabel.textContent=c.controls;navLabel.textContent=c.navigation;foot.textContent=c.foot;actions.querySelectorAll('[data-action]').forEach(button=>setPair(button,c[button.dataset.action]));nav.querySelectorAll('[data-section]').forEach(button=>setPair(button,c[button.dataset.section]));root.dataset.fxMiniMagLanguageR459=language();}
  launcher.addEventListener('click',()=>setOpen(host.dataset.open!=='true',true));close.addEventListener('click',()=>setOpen(false));
  actions.addEventListener('click',event=>{const button=event.target instanceof Element?event.target.closest('[data-action]'):null;if(!(button instanceof HTMLButtonElement))return;const action=button.dataset.action;let handled=false;if(action==='ask')handled=openAsk();else if(action==='menu')handled=toggleMenu();else if(action==='sound')handled=toggleSound();else if(action==='language')handled=toggleLanguage();else if(action==='shape')handled=toggleShape();root.dataset.fxMiniMagLastActionR459=handled?String(action):`${action}-unavailable`;if(action==='ask'||action==='menu')setOpen(false);});
  nav.addEventListener('click',event=>{const button=event.target instanceof Element?event.target.closest('[data-section]'):null;if(!(button instanceof HTMLButtonElement))return;if(scrollToSection(button.dataset.section||''))setOpen(false);});
  document.addEventListener('pointerdown',event=>{if(host.dataset.open!=='true'||!(event.target instanceof Node)||host.contains(event.target))return;setOpen(false);},{passive:true});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&host.dataset.open==='true'){event.preventDefault();setOpen(false);return;}if(event.altKey&&!event.ctrlKey&&!event.metaKey&&String(event.key).toLowerCase()==='m'){event.preventDefault();setOpen(host.dataset.open!=='true',true);}});
  for(const name of ['formatx:languagechange','pageshow'])addEventListener(name,syncCopy,{passive:true});syncCopy();
  window.FormatXMiniMagR459={open:()=>setOpen(true,true),close:()=>setOpen(false),toggle:()=>setOpen(host.dataset.open!=='true',true),navigate:scrollToSection,ask:openAsk,menu:toggleMenu,sound:toggleSound,language:toggleLanguage,shape:toggleShape,element:host};
  root.dataset.fxMiniMagAssistantR459='ready';root.dataset.fxMiniMagPrimaryHeroR459='preserved-native-webgl';root.dataset.fxMiniMagHeroBridgeR460='ready';root.dataset.fxMiniMagMotionControlR528='reduced-motion-only-no-manual-pause';
  if(pendingHeroRequest){pendingHeroRequest=false;setOpen(true,true);root.dataset.fxMiniMagHeroBridgeR460='opened-queued-request';}
  dispatchEvent(new CustomEvent('formatx:minimagready',{detail:{version:'r528',persistent:true,heroBridge:'r460'}}));
}
addStyle();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
}());
