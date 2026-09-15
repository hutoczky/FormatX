(function () {
  'use strict';

  // r326: the native WebGL MAG owns MAG pointer/touch interaction. The
  // Organism dialogue is an explicit disclosure and may only be opened by the
  // canonical ASK/KÉRDEZZ control. Older core-hit behaviour opened the dialogue
  // from a plain crystal tap and could cover the hero controls on mobile.
  const ROOT = document.documentElement;
  if (ROOT.dataset.fxOrganismCoreInteraction === 'ready-v1'
    && ROOT.dataset.fxOrganismDialogueOwner === 'ask-only-r326') return;
  ROOT.dataset.fxOrganismCoreInteraction = 'loading-v1';
  ROOT.dataset.fxOrganismDialogueOwner = 'ask-only-r326';

  let thoughtLabelObserver = null;
  let thoughtDiscoveryObserver = null;
  let syncingThoughtLabel = false;

  function ensureStyle() {
    if (document.querySelector('link[data-fx-organism-core-interaction-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/organism-core-interaction.css?v=20260824-r326-ask-only';
    link.dataset.fxOrganismCoreInteractionStyle = 'true';
    document.head.appendChild(link);
  }

  function dialogueEnabled() {
    return ROOT.dataset.fxOrganismDialogueEnabled !== 'false';
  }

  function thoughtActionLabel() {
    if (!dialogueEnabled()) return ROOT.lang === 'en' ? 'OFF' : 'KI';
    return ROOT.lang === 'en' ? 'ASK' : 'KÉRDEZZ';
  }

  function syncThoughtLabel() {
    if (syncingThoughtLabel) return false;
    const label = document.querySelector('.fx-organism-thought-trigger b');
    if (!(label instanceof HTMLElement)) return false;

    syncingThoughtLabel = true;
    const next = thoughtActionLabel();
    if (label.textContent !== next) label.textContent = next;
    const trigger = label.closest('.fx-organism-thought-trigger');
    trigger?.setAttribute('data-fx-core-label-role', 'legacy-thought-action');
    trigger?.setAttribute('data-fx-dialogue-owner', 'canonical-ask-proxy-only');
    syncingThoughtLabel = false;
    return true;
  }

  function bindThoughtLabel() {
    if (!syncThoughtLabel()) return false;
    const label = document.querySelector('.fx-organism-thought-trigger b');
    if (!(label instanceof HTMLElement)) return false;

    if (!thoughtLabelObserver) {
      thoughtLabelObserver = new MutationObserver(syncThoughtLabel);
      thoughtLabelObserver.observe(label, {
        subtree: true,
        childList: true,
        characterData: true
      });
    }
    thoughtDiscoveryObserver?.disconnect();
    thoughtDiscoveryObserver = null;
    return true;
  }

  function discoverThoughtLabel() {
    if (bindThoughtLabel() || thoughtDiscoveryObserver) return;
    thoughtDiscoveryObserver = new MutationObserver(bindThoughtLabel);
    thoughtDiscoveryObserver.observe(document.documentElement, {
      subtree: true,
      childList: true
    });
  }

  function markCoreInteraction(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest?.('a,button,input,select,textarea,[contenteditable="true"],[role="button"]')) return;
    const hero = target?.closest?.('#hero');
    if (!hero) return;
    ROOT.dataset.fxOrganismCoreActivation = 'native-core-no-dialogue-r326';
  }

  ensureStyle();
  discoverThoughtLabel();
  addEventListener('formatx:organismvoiceready', bindThoughtLabel);
  addEventListener('formatx:languagechange', () => queueMicrotask(syncThoughtLabel));
  new MutationObserver(syncThoughtLabel).observe(ROOT, {
    attributes: true,
    attributeFilter: ['lang', 'data-fx-organism-dialogue-enabled']
  });

  // Telemetry only. There is intentionally no core-hit or hero-navigation
  // listener that calls FormatXOrganismVoice.open() or clicks the legacy
  // thought trigger. Native MAG input remains owned by the WebGL renderer.
  addEventListener('pointerup', markCoreInteraction, { capture: true, passive: true });

  ROOT.dataset.fxOrganismCoreInteraction = 'ready-v1';
  dispatchEvent(new CustomEvent('formatx:organismcoreinteractionready', {
    detail: {
      mouse: true,
      touch: true,
      navigation: false,
      singleMagLabel: true,
      dialogueOwner: 'canonical-ask-only-r326'
    }
  }));
}());
