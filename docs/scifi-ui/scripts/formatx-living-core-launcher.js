(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxLivingCoreLauncher === 'ready') return;
  root.dataset.fxLivingCoreLauncher = 'ready';

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './styles/living-core-launcher.css?v=20260727-living-core-1';
  style.dataset.fxLivingCoreLauncherStyle = 'true';
  document.head.appendChild(style);

  const link = document.createElement('a');
  link.className = 'fx-living-core-launcher';
  link.href = './living-core.html';
  link.setAttribute('aria-label', 'FormatX Living Core kísérleti kezelőfelület megnyitása');
  link.innerHTML = '<i aria-hidden="true"><b></b><b></b></i><span><strong>LIVING CORE</strong><small>ORGANISM UI LAB</small></span><em aria-hidden="true">↗</em>';
  document.body.appendChild(link);

  addEventListener('pagehide', () => link.remove(), { once: true });
}());
