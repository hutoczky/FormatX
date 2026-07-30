(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxOrganismVoiceForeground === 'ready-v1') return;
  root.dataset.fxOrganismVoiceForeground = 'loading-v1';

  function ensureStyle() {
    if (!document.querySelector('link[data-fx-organism-voice-foreground-style]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './styles/organism-voice-foreground.css?v=20260730-organism-foreground-1';
      link.dataset.fxOrganismVoiceForegroundStyle = 'true';
      document.head.appendChild(link);
    }
  }

  function promoteDialogue() {
    const shell = document.querySelector('.fx-organism-dialogue');
    if (!(shell instanceof HTMLElement) || !document.body) return false;
    shell.dataset.fxForeground = 'true';
    if (shell.parentElement === document.body && shell !== document.body.lastElementChild) {
      document.body.appendChild(shell);
    }
    root.dataset.fxOrganismVoiceForeground = 'ready-v1';
    return true;
  }

  function initialise() {
    ensureStyle();
    if (promoteDialogue()) return;

    const observer = new MutationObserver(() => {
      if (promoteDialogue()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      promoteDialogue();
    }, 8000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }

  addEventListener('pageshow', () => {
    ensureStyle();
    promoteDialogue();
  });
}());
