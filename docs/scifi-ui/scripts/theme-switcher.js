(function(){
  const STORAGE_KEY = 'sci-fi-ui-theme';
  const link = document.getElementById('theme-stylesheet');
  const THEMES = ['lcars','starwars','cyberpunk'];
  function apply(theme){
    if(!THEMES.includes(theme)) theme = 'lcars';
    link.setAttribute('href', `styles/${theme}.css`);
    try{ localStorage.setItem(STORAGE_KEY, theme); }catch(_){ }
    document.documentElement.setAttribute('data-theme', theme);
  }
  document.addEventListener('DOMContentLoaded', () => {
    let initial = 'lcars';
    try{
      const saved = localStorage.getItem(STORAGE_KEY);
      if(saved && THEMES.includes(saved)) initial = saved;
    }catch(_){ }
    apply(initial);
    document.querySelectorAll('nav [data-theme]').forEach(btn => {
      btn.addEventListener('click', () => apply(btn.getAttribute('data-theme')));
      btn.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); btn.click(); }});
      btn.setAttribute('role','button');
      btn.tabIndex = 0;
    });
  });
})();