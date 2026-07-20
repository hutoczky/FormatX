(function () {
  'use strict';

  document.querySelectorAll('a[href="#project-details"]').forEach(function (anchorLink) {
    anchorLink.href = '/project.html';
  });

  const anchor = document.getElementById('project-details');
  if (!anchor || document.querySelector('.project-hub')) return;

  const section = document.createElement('section');
  section.className = 'project-hub';
  section.innerHTML = '<header class="project-hub-header"><span>Részletes projektbemutató</span><h2>Ismerd meg a FormatX teljes rendszerét</h2><p>A főoldal gyors áttekintése után külön oldalakon mutatjuk be, kinek készült a rendszer, milyen előnyöket ad, miből épül fel, hogyan működik és milyen biztonsági elveket követ.</p></header><div class="project-hub-grid"><a class="project-hub-card" href="/project.html"><strong>A projekt teljes képe</strong><p>Célok, kiinduló probléma, architektúra, alapelvek és hosszú távú jövőkép.</p><em>Projektbemutató →</em></a><a class="project-hub-card" href="/audiences.html"><strong>Kinek ajánljuk?</strong><p>Technikusok, szervizek, rendszergazdák, laborok és haladó felhasználók.</p><em>Célcsoportok →</em></a><a class="project-hub-card" href="/benefits.html"><strong>Miért FormatX?</strong><p>Kevesebb eszközváltás, követhetőbb feladatok és kiszámíthatóbb technikusi minőség.</p><em>Előnyök →</em></a><a class="project-hub-card" href="/modules.html"><strong>Modulok részletesen</strong><p>ISO-kezelés, formázás, partíciók, diagnosztika, fájlkezelés és kiadásellenőrzés.</p><em>Modulok →</em></a><a class="project-hub-card" href="/workflow.html"><strong>Technikusi munkafolyamat</strong><p>A felderítéstől a tervezésen és végrehajtáson át a végső ellenőrzésig.</p><em>Munkafolyamat →</em></a><a class="project-hub-card" href="/security.html"><strong>Biztonság és kontroll</strong><p>Célazonosítás, megerősítések, mentési elvek, állapotok és integritás.</p><em>Biztonság →</em></a></div>';
  anchor.insertAdjacentElement('afterend', section);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const wideViewport = window.matchMedia('(min-width: 901px)').matches;
  if (reduceMotion || !finePointer || !wideViewport) return;

  document.querySelectorAll(
    '.project-hub-card,.price-card,.feature-cards article,.project-module-grid article,.project-workflow article,.project-foundation-grid article',
  ).forEach(function (card) {
    let frame = 0;

    card.addEventListener('pointermove', function (event) {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        const rect = card.getBoundingClientRect();
        const px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
        const py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
        const isProjectHubCard = card.classList.contains('project-hub-card');
        const maxRotateX = isProjectHubCard ? 2.6 : 2.1;
        const maxRotateY = isProjectHubCard ? 3.8 : 3.1;

        card.style.setProperty('--rx', (-(py - 0.5) * maxRotateX).toFixed(2) + 'deg');
        card.style.setProperty('--ry', ((px - 0.5) * maxRotateY).toFixed(2) + 'deg');
        card.style.setProperty('--glare-x', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--glare-y', (py * 100).toFixed(1) + '%');
      });
    }, { passive: true });

    card.addEventListener('pointerleave', function () {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      card.style.removeProperty('--rx');
      card.style.removeProperty('--ry');
      card.style.removeProperty('--glare-x');
      card.style.removeProperty('--glare-y');
    });
  });

  const engine = document.querySelector('.core-engine');
  if (engine) {
    let engineFrame = 0;

    window.addEventListener('pointermove', function (event) {
      if (engineFrame) cancelAnimationFrame(engineFrame);
      engineFrame = requestAnimationFrame(function () {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        engine.style.transform = 'rotateY(' + (-4 + x * 4).toFixed(2) + 'deg) rotateX(' + (1.5 - y * 3).toFixed(2) + 'deg) translateZ(16px)';
      });
    }, { passive: true });

    window.addEventListener('mouseleave', function () {
      if (engineFrame) cancelAnimationFrame(engineFrame);
      engineFrame = 0;
      engine.style.transform = '';
    });
  }
}());
