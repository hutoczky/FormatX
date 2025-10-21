(function(){
  const THEMES={lcars:'styles/lcars.css',starwars:'styles/starwars.css',cyberpunk:'styles/cyberpunk.css'};
  const STORAGE_KEY='scifi-theme';
  const root=document.documentElement;
  const linkEl=document.getElementById('theme-css');
  const brand=document.getElementById('brand');
  function setPressed(btn,on){btn.setAttribute('aria-pressed',String(on));btn.setAttribute('aria-selected',String(on));}
  function toggleGlitch(theme){if(!brand)return; if(theme==='cyberpunk'){brand.setAttribute('data-glitch','on');}else{brand.removeAttribute('data-glitch');}}
  function toggleLoaderSamples(theme){document.querySelectorAll('.loader-sample').forEach(el=>{if(el.dataset.themeSample===theme){el.style.display='block';}else{el.style.display='none';}});}
  function setTheme(name){if(!THEMES[name])return; linkEl.setAttribute('href',THEMES[name]); root.setAttribute('data-theme',name); try{localStorage.setItem(STORAGE_KEY,name);}catch(e){}; toggleGlitch(name); toggleLoaderSamples(name); document.querySelectorAll('.switcher .theme').forEach(b=>setPressed(b,b.dataset.theme===name)); document.dispatchEvent(new CustomEvent('theme:changed',{detail:{theme:name}}));}
  let start='lcars'; try{const saved=localStorage.getItem(STORAGE_KEY); if(saved&&THEMES[saved]) start=saved;}catch(e){}; setTheme(start);
  document.querySelectorAll('.switcher .theme').forEach(btn=>{btn.addEventListener('click',()=>setTheme(btn.dataset.theme)); btn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setTheme(btn.dataset.theme);}})});
  window.setTheme=setTheme;
})();
