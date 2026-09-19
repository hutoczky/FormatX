'use strict';

// R836 — preserve the proven R718 profiler verbatim while forcing the exact
// desktop viewport that fails the bounded intro timing gate. The wrapper only
// changes Browser.newContext options; tracing, CPU sampling and evidence output
// remain owned by diagnose-r560-startup-owner-base.cjs.
const playwright = require('playwright');
const originalLaunch = playwright.chromium.launch.bind(playwright.chromium);

playwright.chromium.launch = async function launchDesktopProfile(options) {
  const browser = await originalLaunch(options);
  const originalNewContext = browser.newContext.bind(browser);
  browser.newContext = function newDesktopContext(contextOptions = {}) {
    return originalNewContext({
      ...contextOptions,
      viewport: { width: 1440, height: 900 },
      isMobile: false,
      hasTouch: false,
      deviceScaleFactor: 1,
      locale: 'hu-HU',
      colorScheme: 'dark',
      reducedMotion: 'no-preference'
    });
  };
  return browser;
};

require('./diagnose-r560-startup-owner-base.cjs');
