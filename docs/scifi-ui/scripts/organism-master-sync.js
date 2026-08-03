(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxOrganismMasterSync === 'ready-v1') return;
  ROOT.dataset.fxOrganismMasterSync = 'loading-v1';

  let lastEnabled = null;
  let installObserver = null;

  function masterEnabled() {
    return ROOT.dataset.fxOrganismDialogueEnabled !== 'false';
  }

  function ensureStyle() {
    if (document.querySelector('link[data-fx-organism-master-sync-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/organism-master-sync.css?v=20260802-master-sync-1';
    link.dataset.fxOrganismMasterSyncStyle = 'true';
    link.addEventListener('load', () => {
      ROOT.dataset.fxOrganismMasterSyncStyle = 'ready';
    }, { once: true });
    link.addEventListener('error', () => {
      ROOT.dataset.fxOrganismMasterSyncStyle = 'failed';
      console.warn('FormatX Organism master synchronizer stylesheet failed to load.');
    }, { once: true });
    document.head.appendChild(link);
  }

  function closeGenomeDisclosure() {
    document.querySelectorAll('.fx-thought-genome-disclosure').forEach(node => {
      if (node instanceof HTMLDetailsElement) node.open = false;
      node.setAttribute('aria-hidden', 'true');
    });
  }

  function restoreGenomeDisclosureAccessibility() {
    document.querySelectorAll('.fx-thought-genome-disclosure').forEach(node => {
      node.removeAttribute('aria-hidden');
    });
  }

  function apply(source) {
    const enabled = masterEnabled();
    ROOT.classList.toggle('fx-organism-master-disabled', !enabled);
    ROOT.dataset.fxOrganismMasterEnabled = String(enabled);

    document.querySelectorAll('.fx-thought-genome-layer').forEach(layer => {
      layer.classList.toggle('is-master-disabled', !enabled);
      layer.setAttribute('aria-hidden', 'true');
    });

    if (!enabled) {
      closeGenomeDisclosure();
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
      }
      ROOT.dataset.fxOrganismSpeech = 'idle';
    } else {
      restoreGenomeDisclosureAccessibility();
    }

    if (lastEnabled !== enabled) {
      lastEnabled = enabled;
      dispatchEvent(new CustomEvent('formatx:organismmastersync', {
        detail: {
          enabled,
          source: source || 'dataset',
          thoughtGenomeVisible: enabled,
          speechAllowed: enabled
        }
      }));
    }

    ROOT.dataset.fxOrganismMasterSync = 'ready-v1';
  }

  function initialise() {
    ensureStyle();
    apply('initialise');

    const rootObserver = new MutationObserver(() => apply('dialogue-state'));
    rootObserver.observe(ROOT, {
      attributes: true,
      attributeFilter: ['data-fx-organism-dialogue-enabled']
    });

    installObserver = new MutationObserver(() => apply('component-install'));
    installObserver.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => installObserver?.disconnect(), 15000);

    addEventListener('formatx:organismvoiceready', () => apply('voice-ready'));
    addEventListener('formatx:thoughtgenomeready', () => apply('genome-ready'));
    addEventListener('pageshow', () => apply('pageshow'));
    addEventListener('pagehide', () => {
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
