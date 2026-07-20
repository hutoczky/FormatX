(function () {
  'use strict';

  const compactQuery = window.matchMedia('(max-width: 1220px)');
  let actionsPlaceholder = null;
  let mobileThemeButton = null;
  let themeObserver = null;

  function syncMobileThemeButton() {
    const source = document.getElementById('theme-switch');
    if (!source || !mobileThemeButton) return;

    mobileThemeButton.dataset.theme = source.dataset.theme || '';
    mobileThemeButton.setAttribute('aria-label', source.getAttribute('aria-label') || 'Témaváltás');
    mobileThemeButton.setAttribute('title', source.getAttribute('title') || 'Témaváltás');
    mobileThemeButton.setAttribute('aria-pressed', source.getAttribute('aria-pressed') || 'false');

    const sourceIcon = source.querySelector('.theme-switch-icon');
    const targetIcon = mobileThemeButton.querySelector('.theme-switch-icon');
    if (sourceIcon && targetIcon) targetIcon.textContent = sourceIcon.textContent;
  }

  function ensureMobileThemeButton() {
    const source = document.getElementById('theme-switch');
    const menuToggle = document.getElementById('menu-toggle');
    if (!source || !menuToggle || mobileThemeButton) return;

    mobileThemeButton = source.cloneNode(true);
    mobileThemeButton.id = 'theme-switch-mobile';
    mobileThemeButton.classList.add('theme-switch-mobile');
    mobileThemeButton.querySelector('.theme-switch-label')?.remove();
    mobileThemeButton.addEventListener('click', function () {
      source.click();
      window.requestAnimationFrame(syncMobileThemeButton);
    });

    menuToggle.parentNode.insertBefore(mobileThemeButton, menuToggle);
    syncMobileThemeButton();

    themeObserver = new MutationObserver(syncMobileThemeButton);
    themeObserver.observe(source, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['aria-label', 'aria-pressed', 'title', 'data-theme'],
    });
  }

  function ensurePlaceholder(actions) {
    if (actionsPlaceholder || !actions?.parentNode) return;
    actionsPlaceholder = document.createComment('formatx-header-actions-home');
    actions.parentNode.insertBefore(actionsPlaceholder, actions);
  }

  function syncHeaderActions() {
    const nav = document.querySelector('.main-nav');
    const actions = document.querySelector('.header-actions');
    if (!nav || !actions) return;

    ensurePlaceholder(actions);
    document.documentElement.classList.toggle('fx-compact-viewport', compactQuery.matches);

    if (compactQuery.matches) {
      actions.classList.add('fx-mobile-actions');
      if (actions.parentNode !== nav) nav.appendChild(actions);
    } else {
      actions.classList.remove('fx-mobile-actions');
      if (actionsPlaceholder?.parentNode && actions.parentNode !== actionsPlaceholder.parentNode) {
        actionsPlaceholder.parentNode.insertBefore(actions, actionsPlaceholder.nextSibling);
      }
    }
  }

  function initialise() {
    ensureMobileThemeButton();
    syncHeaderActions();

    compactQuery.addEventListener('change', syncHeaderActions);
    window.addEventListener('orientationchange', function () {
      window.setTimeout(syncHeaderActions, 80);
    });

    document.addEventListener('formatx:themechange', syncMobileThemeButton);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
