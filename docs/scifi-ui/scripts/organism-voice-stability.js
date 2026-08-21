(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxOrganismVoiceStability === 'ready-v3') return;
  ROOT.dataset.fxOrganismVoiceStability = 'loading-v3';

  const MOBILE = matchMedia('(max-width: 820px), (pointer: coarse)');
  let shell = null;
  let rootObserver = null;
  let bodyObserver = null;
  let installObserver = null;
  let viewportFrame = 0;

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

  function closeSystemPanelBeforeDialogue() {
    if (!document.body?.classList.contains('fx-organism-panel-open')) return;
    const consoleRoot = document.getElementById('fx-organism-console');
    const closeControl = consoleRoot?.querySelector('[data-organism-close]');
    if (closeControl instanceof HTMLElement) {
      closeControl.click();
      ROOT.dataset.fxOrganismDialoguePanelHandoff = 'closed-through-owner';
    }
  }

  function clearDialogueVisibilityGuards() {
    closeSystemPanelBeforeDialogue();
    ROOT.classList.remove('fx-organism-menu-open', 'fx-page-scrolling');
    document.body?.classList.remove('fx-organism-panel-open');
    const nav = document.getElementById('main-nav');
    nav?.classList.remove('open');
    document.getElementById('menu-toggle')?.setAttribute('aria-expanded', 'false');
    ROOT.dataset.fxOrganismDialogueVisibility = 'explicit-user-open-r272';
  }

  function suspendForOverlay() {
    if (!interfaceBlocked()) return;
    closeDialogue();
    stopSpeech();
  }

  function syncVisualViewport() {
    viewportFrame = 0;
    if (!(shell instanceof HTMLElement)) return;

    const bubble = shell.querySelector('.fx-organism-thought');
    if (!MOBILE.matches) {
      shell.style.removeProperty('bottom');
      shell.style.removeProperty('max-height');
      bubble?.style.removeProperty('max-height');
      ROOT.dataset.fxOrganismViewport = 'desktop-css';
      return;
    }

    const viewport = window.visualViewport;
    const visibleHeight = Math.max(220, viewport?.height || innerHeight);
    const visibleBottom = (viewport?.offsetTop || 0) + visibleHeight;
    const keyboardInset = Math.max(0, innerHeight - visibleBottom);
    const bottomInset = Math.max(72, Math.round(keyboardInset + 12));
    const shellHeight = Math.max(180, Math.floor(visibleHeight - 24));
    const bubbleHeight = Math.max(150, Math.floor(visibleHeight - 104));

    shell.style.bottom = bottomInset + 'px';
    shell.style.maxHeight = shellHeight + 'px';
    if (bubble instanceof HTMLElement) bubble.style.maxHeight = bubbleHeight + 'px';

    ROOT.dataset.fxOrganismViewport = 'visual-viewport-v1';
    ROOT.dataset.fxOrganismKeyboardInset = String(Math.round(keyboardInset));
    ROOT.style.setProperty('--fx-organism-visible-height', visibleHeight.toFixed(1) + 'px');
  }

  function scheduleViewportSync() {
    if (viewportFrame) return;
    viewportFrame = requestAnimationFrame(syncVisualViewport);
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
    shell.dataset.fxVoiceStability = 'ready-v3';
    repairAccessibility(shell);
    suspendForOverlay();
    scheduleViewportSync();

    rootObserver?.disconnect();
    bodyObserver?.disconnect();
    rootObserver = new MutationObserver(() => {
      suspendForOverlay();
      scheduleViewportSync();
    });
    rootObserver.observe(ROOT, { attributes: true, attributeFilter: ['class'] });
    if (document.body) {
      bodyObserver = new MutationObserver(() => {
        suspendForOverlay();
        scheduleViewportSync();
      });
      bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    ROOT.dataset.fxOrganismVoiceStability = 'ready-v3';
    dispatchEvent(new CustomEvent('formatx:organismvoicestabilityready', {
      detail: {
        duplicateGuard: true,
        overlaySpeechGuard: true,
        liveRegion: 'response-only',
        mobileVisualViewportGuard: true,
        panelDialogueHandoff: true,
        explicitOpenVisibilityGuard: true
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
  addEventListener('resize', scheduleViewportSync, { passive: true });
  addEventListener('orientationchange', scheduleViewportSync, { passive: true });
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest('.fx-reference-ask, .fx-organism-thought-trigger')) return;
    clearDialogueVisibilityGuards();
  }, true);
  document.addEventListener('focusin', event => {
    if (event.target?.closest?.('.fx-organism-dialogue')) {
      scheduleViewportSync();
      setTimeout(scheduleViewportSync, 120);
      setTimeout(scheduleViewportSync, 320);
    }
  });
  window.visualViewport?.addEventListener('resize', scheduleViewportSync, { passive: true });
  window.visualViewport?.addEventListener('scroll', scheduleViewportSync, { passive: true });
  MOBILE.addEventListener?.('change', scheduleViewportSync);
  addEventListener('pagehide', stopSpeech);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopSpeech();
    else scheduleViewportSync();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
