'use strict';

// Non-intro feature tests enter the page through its real Skip control.
// The original first-visit timing lane measures the untouched automatic path.
async function finishIntroThroughControls(page) {
  const deadline = Date.now() + 5000;
  const remaining = () => {
    const time = deadline - Date.now();
    if (time <= 0) throw new Error('The genuine intro handoff exceeded the existing 5000ms setup budget');
    return time;
  };
  const completed = () => page.evaluate(() => {
    const root = document.documentElement;
    const legacy = document.getElementById('formatx-event-horizon');
    return !document.querySelector('#fx-mag-birth-prepaint-r1606,.fx-mag-birth-r533')
      && !root.hasAttribute('data-fx-mag-birth-live')
      && !root.hasAttribute('data-fx-native-genesis-r2064')
      && !root.classList.contains('fx-intro-running')
      && (!legacy || legacy.hidden);
  });

  await page.waitForFunction(() => {
    const overlay = document.querySelector('#fx-mag-birth-prepaint-r1606,.fx-mag-birth-r533');
    return !overlay || (overlay.matches('.fx-mag-birth-r533') && !overlay.inert);
  }, null, { timeout: remaining() });

  let usedNativeSkip = false;
  const nativeSkip = page.locator('.fx-mag-birth-r533 .fxb-skip').first();
  if (await nativeSkip.count()) {
    try {
      await nativeSkip.click({ timeout: remaining() });
      usedNativeSkip = true;
    } catch (error) {
      // The bounded automatic film may finish between locating and clicking.
      // Accept only a genuinely completed handoff; never mutate its DOM/state.
      if (!await completed()) throw error;
    }
  } else {
    const legacySkip = page.locator('.fx-intro-skip').first();
    if (await legacySkip.count() && await legacySkip.isVisible()) {
      await legacySkip.click({ timeout: remaining() });
    }
  }

  await page.waitForFunction(() => {
    const root = document.documentElement;
    const legacy = document.getElementById('formatx-event-horizon');
    return !document.querySelector('#fx-mag-birth-prepaint-r1606,.fx-mag-birth-r533')
      && !root.hasAttribute('data-fx-mag-birth-live')
      && !root.hasAttribute('data-fx-native-genesis-r2064')
      && !root.classList.contains('fx-intro-running')
      && (!legacy || legacy.hidden);
  }, null, { timeout: remaining() });
  console.log('INTRO_ACTUAL_HANDOFF_R2110_PASS ' + JSON.stringify({ usedNativeSkip }));
}

module.exports = { finishIntroThroughControls };
