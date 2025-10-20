(function(){
  const STORAGE_KEY = 'sci-fi-ui-theme';
  const link = document.getElementById('theme-stylesheet');
  const loader = document.getElementById('loader');
  const THEMES = ['lcars','starwars','cyberpunk'];
  let cssLoadTimer;

  function showLoader(){ if(loader){ loader.classList.add('show'); document.body.classList.add('loading'); } }
  function hideLoader(){ if(loader){ loader.classList.remove('show'); document.body.classList.remove('loading'); } }

  function apply(theme){
    if(!THEMES.includes(theme)) theme = 'lcars';
    showLoader();
    link.setAttribute('href', `styles/${theme}.css`);
    try{ localStorage.setItem(STORAGE_KEY, theme); }catch(_){ }
    document.documentElement.setAttribute('data-theme', theme);

    const onLoaded = () => { hideLoader(); link.removeEventListener('load', onLoaded, { once:true }); if(cssLoadTimer){ clearTimeout(cssLoadTimer); cssLoadTimer = null; } };
    link.addEventListener('load', onLoaded, { once:true });
    cssLoadTimer = setTimeout(onLoaded, 1200);
  }

  document.addEventListener('DOMContentLoaded', () => {
    let initial = 'lcars';
    try{ const s = localStorage.getItem(STORAGE_KEY); if(s && THEMES.includes(s)) initial = s; }catch(_){ }
    apply(initial);
    document.querySelectorAll('nav [data-theme]').forEach(btn => {
      btn.addEventListener('click', () => apply(btn.getAttribute('data-theme')));
      btn.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); btn.click(); }});
      btn.setAttribute('role','button'); btn.tabIndex = 0;
    });
  });

  // inline kompatibilitás
  window.switchTheme = (t)=>apply(t);
})();