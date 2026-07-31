(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxOrganismVoiceStability === 'ready-v1') return;
  ROOT.dataset.fxOrganismVoiceStability = 'loading-v1';

  let shell = null;
  let rootObserver = null;
  let bodyObserver = null;
  let installObserver = null;

  function interfaceBlocked() {
    return ROOT.classList.contains('fx-intro-pending')
      || ROOT.classList.contains('fx-intro-running')
      || ROOT.classList.contains('fx-intro-reveal')
      || ROOT.classList.contains('fx-organism-menu-open')
      || ROOT.classList.contains('fx-page-scrolling')
      || document.body?.classList.contains('fx-organism-panel-open');
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
    ROOT.dataset.fxOrganismSpeech = 'idle';
    shell?.classList.remove('is-speaking');
  }

  function closeDialogue() {
    const api = window.FormatXOrganismVoice;
    if (api && typeof api.close === 'function') {
      try { api.close(); } catch (_) {}
    } else if (shell) {
      const bubble = shell.querySelector('.fx-organism-thought');
      shell.classList.remove('is-open');
      if (bubble instanceof HTMLElement) {
        bubble.hidden = true;
        bubble.setAttribute('aria-hidden', 'true');
      }
      shell.querySelector('.fx-organism-thought-trigger')?.setAttribute('aria-expanded', 'false');
      ROOT.dataset.fxOrganismThought = 'closed';
    }
  }

  function suspendForOverlay() {
    if (!interfaceBlocked()) return;
    closeDialogue();
    stopSpeech();
  }

  function repairAccessibility(target) {
    const bubble = target.querySelector('.fx-organism-thought');
    const output = target.querySelector('.fx-organism-thought-output');
    const trigger = target.querySelector('.fx-organism-thought-trigger');
    if (!(bubble instanceof HTMLElement) || !(output instanceof HTMLElement) || !(trigger instanceof HTMLElement)) return;

    if (!bubble.id) bubble.id = 'fx-organism-thought-panel';
    trigger.setAttribute('aria-controls', bubble.id);
    trigger.setAttribute('aria-haspopup', 'dialog');
    bubble.setAttribute('role', 'dialog');
    bubble.removeAttribute('aria-live');
    bubble.removeAttribute('aria-atomic');
    output.setAttribute('role', 'status');
    output.setAttribute('aria-live', 'polite');
    output.setAttribute('aria-atomic', 'true');
    output.dataset.fxOrganismLiveRegion = 'response-only';
    ROOT.dataset.fxOrganismLiveRegion = 'response-only';
  }

  function install() {
    const candidates = Array.from(document.querySelectorAll('.fx-organism-dialogue'));
    if (!candidates.length) return false;

    shell = candidates[candidates.length - 1];
    candidates.slice(0, -1).forEach(node => node.remove());
    shell.dataset.fxVoiceStability = 'ready-v1';
    repairAccessibility(shell);
    suspendForOverlay();

    rootObserver?.disconnect();
    bodyObserver?.disconnect();
    rootObserver = new MutationObserver(suspendForOverlay);
    rootObserver.observe(ROOT, { attributes: true, attributeFilter: ['class'] });
    if (document.body) {
      bodyObserver = new MutationObserver(suspendForOverlay);
      bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    ROOT.dataset.fxOrganismVoiceStability = 'ready-v1';
    dispatchEvent(new CustomEvent('formatx:organismvoicestabilityready', {
      detail: {
        duplicateGuard: true,
        overlaySpeechGuard: true,
        liveRegion: 'response-only'
      }
    }));
    return true;
  }

  function initialise() {
    if (install()) return;
    installObserver = new MutationObserver(() => {
      if (install()) installObserver.disconnect();
    });
    installObserver.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => {
      installObserver?.disconnect();
      install();
    }, 12000);
  }

  addEventListener('formatx:organismvoiceready', install);
  addEventListener('formatx:organismpanelopen', suspendForOverlay);
  addEventListener('formatx:pagestartscroll', suspendForOverlay);
  addEventListener('formatx:loop', suspendForOverlay);
  addEventListener('pagehide', stopSpeech);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopSpeech();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
