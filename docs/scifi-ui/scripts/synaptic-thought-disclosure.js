(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxThoughtDisclosure === 'ready-v1') return;
  ROOT.dataset.fxThoughtDisclosure = 'loading-v1';

  const COPY = Object.freeze({
    hu: {
      title: 'Gondolatgenom',
      hint: 'Helyi lenyomatok és forma',
      open: 'Gondolatgenom részleteinek megnyitása',
      close: 'Gondolatgenom részleteinek bezárása'
    },
    en: {
      title: 'Thought genome',
      hint: 'Local fingerprints and shape',
      open: 'Open thought genome details',
      close: 'Close thought genome details'
    }
  });

  let details = null;
  let summary = null;
  let title = null;
  let hint = null;
  let bubbleObserver = null;

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function words() {
    return COPY[language()];
  }

  function ensureStyle() {
    if (document.querySelector('link[data-fx-thought-disclosure-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/synaptic-thought-disclosure.css?v=20260731-thought-disclosure-1';
    link.dataset.fxThoughtDisclosureStyle = 'true';
    document.head.appendChild(link);
  }

  function setOpen(open) {
    if (!details) return;
    details.open = Boolean(open);
    ROOT.dataset.fxThoughtDisclosureOpen = String(details.open);
    syncLanguage();
  }

  function syncLanguage() {
    if (!details || !summary || !title || !hint) return;
    const copy = words();
    title.textContent = copy.title;
    hint.textContent = copy.hint;
    summary.setAttribute('aria-label', details.open ? copy.close : copy.open);
    summary.title = details.open ? copy.close : copy.open;
  }

  function closeForOverlay() {
    setOpen(false);
  }

  function install() {
    const controls = document.querySelector('.fx-thought-genome-controls');
    if (!(controls instanceof HTMLElement)) return false;

    const existing = controls.closest('.fx-thought-genome-disclosure');
    if (existing instanceof HTMLDetailsElement) {
      details = existing;
      summary = details.querySelector('summary');
      title = summary?.querySelector('strong') || null;
      hint = summary?.querySelector('small') || null;
      setOpen(false);
      ROOT.dataset.fxThoughtDisclosure = 'ready-v1';
      return true;
    }

    details = document.createElement('details');
    details.className = 'fx-thought-genome-disclosure';
    details.dataset.fxThoughtDisclosure = 'ready-v1';

    summary = document.createElement('summary');
    title = document.createElement('strong');
    hint = document.createElement('small');
    const icon = document.createElement('span');
    icon.className = 'fx-thought-genome-disclosure-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '✦';
    summary.append(icon, title, hint);

    controls.before(details);
    details.append(summary, controls);
    details.open = false;
    ROOT.dataset.fxThoughtDisclosureOpen = 'false';

    details.addEventListener('toggle', () => {
      ROOT.dataset.fxThoughtDisclosureOpen = String(details.open);
      syncLanguage();
    });

    const bubble = details.closest('.fx-organism-thought');
    if (bubble instanceof HTMLElement) {
      bubbleObserver = new MutationObserver(() => {
        if (bubble.hidden || bubble.getAttribute('aria-hidden') === 'true') setOpen(false);
      });
      bubbleObserver.observe(bubble, { attributes: true, attributeFilter: ['hidden', 'aria-hidden'] });
    }

    syncLanguage();
    ROOT.dataset.fxThoughtDisclosure = 'ready-v1';
    dispatchEvent(new CustomEvent('formatx:thoughtdisclosureready', {
      detail: { defaultOpen: false, progressiveDisclosure: true }
    }));
    return true;
  }

  function initialise() {
    ensureStyle();
    if (install()) return;

    const observer = new MutationObserver(() => {
      if (install()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      install();
    }, 12000);
  }

  addEventListener('formatx:languagechange', syncLanguage);
  addEventListener('formatx:pagestartscroll', closeForOverlay);
  addEventListener('formatx:loop', closeForOverlay);
  addEventListener('formatx:organismpanelopen', closeForOverlay);
  addEventListener('pagehide', closeForOverlay);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
