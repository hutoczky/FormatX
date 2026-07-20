(async function () {
  'use strict';

  try {
    const response = await fetch('/FormatX/scifi-ui/index.html', {
      cache: 'no-store',
      credentials: 'same-origin',
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);

    let html = await response.text();
    html = html
      .replace(
        '<head>',
        '<head><base href="/FormatX/scifi-ui/"><script src="/FormatX/scifi-ui/scripts/theme-system.js?v=20260720-theme-1"><\/script>',
      )
      .replace(
        '</head>',
        [
          '<link rel="stylesheet" href="/FormatX/scifi-ui/styles/main-spatial.css?v=20260720-spatial-7">',
          '<link rel="stylesheet" href="/FormatX/scifi-ui/styles/main-readability.css?v=20260720-readability-2">',
          '<link rel="stylesheet" href="/FormatX/scifi-ui/styles/quantum-twin.css?v=20260720-quantum-1">',
          '<link rel="stylesheet" href="/FormatX/scifi-ui/styles/theme-system.css?v=20260720-theme-1">',
          '</head>',
        ].join(''),
      )
      .replace(
        '</body>',
        [
          '<script defer src="/FormatX/scifi-ui/scripts/project-hub.js?v=20260720-project-hub-8"><\/script>',
          '<script defer src="/FormatX/scifi-ui/scripts/quantum-twin.js?v=20260720-quantum-1"><\/script>',
          '</body>',
        ].join(''),
      );

    document.open();
    document.write(html);
    document.close();
  } catch (_) {
    const main = document.querySelector('main');
    if (main) {
      main.textContent = '';
      const title = document.createElement('h1');
      title.textContent = 'FormatX Suite Pro';
      const message = document.createElement('p');
      message.textContent = 'A főoldal betöltése nem sikerült. Frissítsd az oldalt néhány másodperc múlva.';
      main.append(title, message);
    }
  }
}());
