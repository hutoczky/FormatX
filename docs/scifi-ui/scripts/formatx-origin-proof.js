(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxOriginProof === 'v1') return;
  root.dataset.fxOriginProof = 'v1';

  const COPY = {
    hu: {
      eyebrow: '05.5 — EREDET / BIZONYÍTÉK / JÖVŐKÉP',
      title: 'Miért született meg a FormatX?',
      story: 'A projekt abból a problémából indult, hogy a technikusi eszközök gyakran szétszórtak, platformfüggők vagy nem mutatják meg elég világosan, mi fog történni egy kritikus művelet során. A FormatX célja ezért nem egy újabb eszköztár, hanem egy közös operációs réteg: ugyanaz a felmérési, tervezési, végrehajtási és ellenőrzési logika minden támogatott környezetben.',
      statement: 'A jövőkép: a technikus egyetlen felületen lássa, mit tud a rendszer, mit készül végrehajtani, és mi lett ténylegesen ellenőrizve.',
      cards: [
        ['KIADÁSI LÁNC', 'A stabil csomag kizárólag a hivatalos GitHub Releases csatornáról érkezhet, pontos VNN assetnévvel.'],
        ['INTEGRITÁS', 'SHA-256 és Ed25519 ellenőrzés; eltérő vagy hiányos csomagnál a frissítési folyamat fail-closed módon leáll.'],
        ['BIZTONSÁGI MODELL', 'Célmeghajtó-azonosítás, többlépcsős megerősítés, naplózott végrehajtás és dokumentálható végeredmény.'],
        ['PLATFORMSTRATÉGIA', 'Linux/Bazzite az elsődleges irány; Windows, macOS, web és Android hozzáférés támogatott.']
      ]
    },
    en: {
      eyebrow: '05.5 — ORIGIN / PROOF / VISION',
      title: 'Why was FormatX created?',
      story: 'The project began with a practical problem: technician tools are often fragmented, platform-bound or fail to explain clearly what a critical operation will do. FormatX is therefore not another toolbox. It is a shared operating layer that applies the same assess, plan, execute and verify logic across every supported environment.',
      statement: 'The vision: one interface where the technician can see what the system knows, what it is about to execute and what was actually verified.',
      cards: [
        ['RELEASE CHAIN', 'Stable packages can only come from the official GitHub Releases channel with an exact VNN asset name.'],
        ['INTEGRITY', 'SHA-256 and Ed25519 verification; a missing or mismatched package stops the update flow in fail-closed mode.'],
        ['SAFETY MODEL', 'Target identification, multi-step confirmation, logged execution and a documentable final result.'],
        ['PLATFORM STRATEGY', 'Linux/Bazzite is the primary direction; Windows, macOS, web and Android access are supported.']
      ]
    }
  };

  const language = () => root.lang === 'en' ? 'en' : 'hu';
  let retryTimer = 0;
  let attempts = 0;

  function targetSystem() {
    const candidates = Array.from(document.querySelectorAll('section#system, section[data-organ="skeleton"]'));
    return candidates.find(section => section.isConnected && !section.closest('[data-fx-loop-bridge="true"]'))
      || candidates.find(section => section.isConnected)
      || null;
  }

  function createProof() {
    const existing = document.querySelector('.fx-origin-proof');
    if (existing) return existing;
    const system = targetSystem();
    if (!system) return null;

    const proof = document.createElement('section');
    proof.className = 'fx-origin-proof';
    proof.dataset.fxOriginProofBlock = 'true';
    proof.setAttribute('aria-labelledby', 'fx-origin-title');
    proof.innerHTML = '<div class="fx-origin-copy"><p class="section-index" data-fx-proof-eyebrow></p><h3 id="fx-origin-title" data-fx-proof-title></h3><p data-fx-proof-story></p><blockquote data-fx-proof-statement></blockquote></div><div class="fx-proof-grid"></div>';

    const anchor = system.querySelector('.marquee');
    const grid = system.querySelector('.system-grid');
    if (anchor) anchor.insertAdjacentElement('beforebegin', proof);
    else if (grid) grid.insertAdjacentElement('afterend', proof);
    else system.appendChild(proof);
    return proof;
  }

  function render() {
    const proof = createProof();
    if (!proof) return false;
    const copy = COPY[language()];
    proof.querySelector('[data-fx-proof-eyebrow]').textContent = copy.eyebrow;
    proof.querySelector('[data-fx-proof-title]').textContent = copy.title;
    proof.querySelector('[data-fx-proof-story]').textContent = copy.story;
    proof.querySelector('[data-fx-proof-statement]').textContent = copy.statement;
    const grid = proof.querySelector('.fx-proof-grid');
    grid.replaceChildren(...copy.cards.map((item, index) => {
      const article = document.createElement('article');
      article.innerHTML = '<span>' + String(index + 1).padStart(2, '0') + '</span><div><h4></h4><p></p></div>';
      article.querySelector('h4').textContent = item[0];
      article.querySelector('p').textContent = item[1];
      return article;
    }));
    root.dataset.fxOriginProofState = 'ready';
    return true;
  }

  function ensure() {
    if (render()) {
      clearInterval(retryTimer);
      retryTimer = 0;
      return;
    }
    if (!retryTimer) {
      retryTimer = window.setInterval(() => {
        attempts += 1;
        if (render() || attempts >= 80) {
          clearInterval(retryTimer);
          retryTimer = 0;
          if (attempts >= 80 && !document.querySelector('.fx-origin-proof')) root.dataset.fxOriginProofState = 'missing-target';
        }
      }, 250);
    }
  }

  ensure();
  ['DOMContentLoaded', 'pageshow', 'formatx:livingready', 'formatx:threeready', 'formatx:loop'].forEach(name => {
    addEventListener(name, ensure);
  });
  addEventListener('formatx:languagechange', () => queueMicrotask(render));

  const languageObserver = new MutationObserver(entries => {
    if (entries.some(entry => entry.attributeName === 'lang')) queueMicrotask(render);
  });
  languageObserver.observe(root, { attributes: true, attributeFilter: ['lang'] });

  addEventListener('pagehide', () => {
    clearInterval(retryTimer);
    languageObserver.disconnect();
  }, { once: true });
}());