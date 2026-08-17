#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def p(rel: str) -> Path:
    return ROOT / rel


def read(rel: str) -> str:
    return p(rel).read_text(encoding="utf-8")


def write(rel: str, text: str) -> None:
    path = p(rel)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def replace_exact(rel: str, old: str, new: str, *, count: int = 1) -> None:
    text = read(rel)
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f"{rel}: expected {count} exact match(es), found {actual}: {old[:120]!r}")
    write(rel, text.replace(old, new, count))


def replace_regex(rel: str, pattern: str, replacement: str, *, count: int = 1, flags: int = 0) -> None:
    text = read(rel)
    new_text, actual = re.subn(pattern, replacement, text, count=count, flags=flags)
    if actual != count:
        raise SystemExit(f"{rel}: expected {count} regex match(es), found {actual}: {pattern}")
    write(rel, new_text)


WDA_CSS = r'''/* FormatX r198 — Web Design Awards 100-target hardening.
   Clear audio consent, keyboard/touch affordances and inclusive media modes.
   No inline style ownership: strict CSP remains intact. */

html body .fx-three-sound.fx-wda-sound-toggle {
  position: fixed !important;
  top: max(86px, calc(env(safe-area-inset-top) + 78px)) !important;
  right: max(16px, env(safe-area-inset-right)) !important;
  bottom: auto !important;
  left: auto !important;
  z-index: 2147481000 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  min-width: 112px !important;
  min-height: 48px !important;
  padding: 0 16px !important;
  border: 1px solid rgba(105, 226, 255, .58) !important;
  border-radius: 999px !important;
  background: rgba(2, 10, 20, .94) !important;
  color: #effcff !important;
  opacity: 1 !important;
  visibility: visible !important;
  pointer-events: auto !important;
  transform: none !important;
  box-shadow: 0 10px 36px rgba(0, 0, 0, .42), inset 0 0 20px rgba(56, 211, 255, .08) !important;
  backdrop-filter: blur(14px) saturate(125%) !important;
  font: 800 11px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
  letter-spacing: .15em !important;
  text-transform: uppercase !important;
  cursor: pointer !important;
  touch-action: manipulation !important;
  -webkit-tap-highlight-color: transparent !important;
}

html body .fx-three-sound.fx-wda-sound-toggle::before {
  content: "";
  width: 9px;
  height: 9px;
  flex: 0 0 9px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 14px rgba(106, 232, 255, .82);
  opacity: .92;
}

html[data-fx-audio-state="on"] body .fx-three-sound.fx-wda-sound-toggle {
  border-color: rgba(132, 255, 211, .72) !important;
  box-shadow: 0 10px 36px rgba(0, 0, 0, .42), inset 0 0 24px rgba(80, 255, 195, .11) !important;
}

html body .fx-three-sound.fx-wda-sound-toggle:hover {
  border-color: rgba(197, 247, 255, .9) !important;
}

:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 3px solid #8eefff !important;
  outline-offset: 4px !important;
}

@media (max-width: 900px), (pointer: coarse) {
  html body .fx-three-sound.fx-wda-sound-toggle {
    top: max(80px, calc(env(safe-area-inset-top) + 74px)) !important;
    right: max(12px, env(safe-area-inset-right)) !important;
    min-width: 104px !important;
    min-height: 48px !important;
    padding-inline: 14px !important;
  }

  html body :where(.menu-toggle, .fx-language-toggle, .fx-reference-menu-button, .fx-reference-mag-button, .fx-three-sound) {
    min-width: 44px !important;
    min-height: 44px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  html body .fx-three-sound.fx-wda-sound-toggle,
  html body .fx-three-sound.fx-wda-sound-toggle::before {
    animation: none !important;
    transition: none !important;
  }
}

@media (prefers-contrast: more) {
  html body .fx-three-sound.fx-wda-sound-toggle {
    border-width: 2px !important;
    border-color: currentColor !important;
    background: #000 !important;
  }
}

@media (forced-colors: active) {
  html body .fx-three-sound.fx-wda-sound-toggle {
    border: 2px solid ButtonText !important;
    background: ButtonFace !important;
    color: ButtonText !important;
    forced-color-adjust: auto;
  }
}
'''

WDA_CONTROLS = r'''(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxWdaHardening === 'r198') return;
  root.dataset.fxWdaHardening = 'r198';
  root.dataset.fxWdaSound = 'muted-default';

  const SELECTOR = '.fx-three-sound';
  const AUDIO_SRC = '/scifi-ui/scripts/formatx-audio-repair.js?v=20260817-r198-wda-sound';
  let loadingAudio = false;
  let syncing = false;

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function pickButton() {
    const buttons = Array.from(document.querySelectorAll(SELECTOR)).filter(node => node instanceof HTMLButtonElement);
    if (!buttons.length) return null;
    return buttons.find(button => button.dataset.fxAudioOwner === 'professional-v6') || buttons[0];
  }

  function ensureLabel(button) {
    let label = button.querySelector('[data-fx-wda-sound-label]');
    if (!(label instanceof HTMLElement)) {
      label = button.querySelector('span');
      if (!(label instanceof HTMLElement)) {
        label = document.createElement('span');
        button.appendChild(label);
      }
      label.dataset.fxWdaSoundLabel = 'true';
    }
    return label;
  }

  function sync(button) {
    if (!(button instanceof HTMLButtonElement) || syncing) return;
    syncing = true;
    try {
      button.classList.add('fx-wda-sound-toggle');
      button.type = 'button';
      button.hidden = false;
      const state = button.dataset.fxAudioState || root.dataset.fxAudioState || 'off';
      const on = state === 'on';
      const pending = state === 'pending';
      const blocked = state === 'blocked';
      const text = pending ? 'STARTING…' : blocked ? 'RETRY' : on ? 'MUTE' : 'UNMUTE';
      const label = ensureLabel(button);
      if (label.textContent !== text) label.textContent = text;
      button.setAttribute('aria-pressed', String(on));
      button.setAttribute('aria-label', on
        ? (language() === 'en' ? 'Mute FormatX cinematic audio' : 'FormatX filmes hang némítása')
        : (language() === 'en' ? 'Unmute FormatX cinematic audio' : 'FormatX filmes hang bekapcsolása'));
      button.setAttribute('title', on ? 'MUTE' : 'UNMUTE');
      root.dataset.fxWdaSound = pending ? 'starting' : blocked ? 'retry' : on ? 'unmuted' : 'muted';
    } finally {
      syncing = false;
    }
  }

  function ensureButton() {
    let button = pickButton();
    if (!button) {
      button = document.createElement('button');
      button.className = 'fx-three-sound fx-wda-sound-toggle';
      button.type = 'button';
      button.dataset.fxAudioState = 'off';
      button.setAttribute('aria-pressed', 'false');
      const label = document.createElement('span');
      label.dataset.fxWdaSoundLabel = 'true';
      label.textContent = 'UNMUTE';
      button.appendChild(label);
      document.body.appendChild(button);
    }

    for (const duplicate of Array.from(document.querySelectorAll(SELECTOR))) {
      if (duplicate !== button) duplicate.remove();
    }
    sync(button);
    return button;
  }

  function requestProfessionalAudio() {
    if (root.dataset.fxAudioOwner === 'professional-v6' || loadingAudio) return;
    if (document.querySelector('script[src*="formatx-audio-repair.js"]')) return;
    loadingAudio = true;
    root.dataset.fxWdaSound = 'loading-engine';
    const script = document.createElement('script');
    script.src = AUDIO_SRC;
    script.async = true;
    script.dataset.fxWdaAudioR198 = 'true';
    script.addEventListener('load', () => {
      loadingAudio = false;
      setTimeout(() => sync(ensureButton()), 0);
    }, { once: true });
    script.addEventListener('error', () => {
      loadingAudio = false;
      root.dataset.fxWdaSound = 'engine-load-failed';
      const button = ensureButton();
      button.dataset.fxAudioState = 'blocked';
      sync(button);
    }, { once: true });
    document.head.appendChild(script);
  }

  document.addEventListener('pointerdown', event => {
    const target = event.target instanceof Element ? event.target.closest(SELECTOR) : null;
    if (!target || root.dataset.fxAudioOwner === 'professional-v6') return;
    requestProfessionalAudio();
  }, { capture: true, passive: true });

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest(SELECTOR) : null;
    if (!target || root.dataset.fxAudioOwner === 'professional-v6') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    requestProfessionalAudio();
    const button = ensureButton();
    button.dataset.fxAudioState = 'blocked';
    sync(button);
  }, true);

  const bodyObserver = new MutationObserver(() => ensureButton());
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  const rootObserver = new MutationObserver(() => {
    const button = pickButton();
    if (button) sync(button);
  });
  rootObserver.observe(root, {
    attributes: true,
    attributeFilter: ['data-fx-audio-owner', 'data-fx-audio-state', 'data-fx-audio-level']
  });

  addEventListener('formatx:languagechange', () => sync(ensureButton()));
  addEventListener('pageshow', () => sync(ensureButton()));
  ensureButton();
}());
'''

WDA_VALIDATOR = r'''/* FormatX Web Design Awards r198 — 100-target source contract. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(root, rel));

const home = read('docs/scifi-ui/index.html');
const controls = read('docs/scifi-ui/scripts/formatx-wda-controls-r198.js');
const css = read('docs/scifi-ui/styles/formatx-wda-hardening-r198.css');
const audio = read('docs/scifi-ui/scripts/formatx-audio-repair.js');
const renderer = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js');
const wrapper = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrangler = JSON.parse(read('billing-worker/wrangler.jsonc'));
const desktop = JSON.parse(read('lighthouserc.live.json'));
const mobile = JSON.parse(read('lighthouserc.live.mobile.json'));

// UX / accessibility / audio consent.
assert.match(home, /class="skip-link"[^>]+href="#main-content"/);
assert.match(home, /<main id="main-content">/);
assert.match(home, /formatx-wda-hardening-r198\.css\?v=20260817-r198/);
assert.match(home, /formatx-wda-controls-r198\.js\?v=20260817-r198/);
for (const token of ['UNMUTE', 'MUTE', 'aria-pressed', 'professional-v6', 'muted-default']) assert.ok(controls.includes(token), `missing WDA sound contract: ${token}`);
assert.doesNotMatch(controls, /AudioContext|webkitAudioContext|\.style\.|setAttribute\(['"]style/i);
for (const token of ['min-height: 48px', ':focus-visible', 'prefers-reduced-motion: reduce', 'prefers-contrast: more', 'forced-colors: active']) assert.ok(css.includes(token), `missing inclusive CSS contract: ${token}`);

// Professional Web Audio stays user-initiated, muted by default and CSP-safe.
for (const token of ['professional-v6', 'let enabled = false', "sync('off')", "'MUTE'", "'UNMUTE'"]) assert.ok(audio.includes(token), `missing professional audio contract: ${token}`);
assert.doesNotMatch(audio, /root\.style\.setProperty/);

// Performance / mobile WebGL: real 60fps target with adaptive resolution and stable silhouette.
for (const token of ['TARGET_FPS=60', 'FRAME_BUDGET_MS', 'renderScale', 'fxCoreTargetFps', 'fxCoreRenderScale', 'visibilitychange', 'touch-pointer-stable-silhouette-spectral-refraction-r198']) assert.ok(renderer.includes(token), `missing r198 GPU contract: ${token}`);
assert.doesNotMatch(renderer, /b=1\.\+\.007\*sin\(t\*\.70\)/);
assert.doesNotMatch(renderer, /audit-skip/);
assert.doesNotMatch(wrapper, /audit-skip/);
assert.doesNotMatch(bootstrap, /audit-skip/);
assert.match(wrapper, /formatx-core-mobile-reference-r99\.js\?v=20260817-r198-wda-60fps/);
assert.match(bootstrap, /formatx-core-mobile-v55\.js\?v=20260817-r198-wda-60fps/);

// Stable production ownership: do not reintroduce the partial-hydration performance wrapper.
assert.equal(wrangler.main, 'src/production-content-entry.js');

// Strategy/content proof must remain public and crawlable.
for (const rel of ['docs/scifi-ui/method.html', 'docs/scifi-ui/verification.html', 'docs/scifi-ui/test-matrix.html', 'docs/scifi-ui/known-issues.html', 'docs/scifi-ui/security.html']) assert.ok(exists(rel), `missing public proof page: ${rel}`);

function validateLighthouse(config, label) {
  const collect = config.ci.collect;
  const assertions = config.ci.assert.assertions;
  assert.equal(collect.numberOfRuns, 3, `${label}: needs 3 runs`);
  assert.ok(collect.url.every(url => !url.includes('lighthouse=1')), `${label}: audit-only URL is forbidden`);
  assert.ok(!String(collect.settings.chromeFlags || '').includes('force-prefers-reduced-motion'), `${label}: forced reduced-motion is forbidden`);
  assert.ok(!('skipAudits' in collect.settings), `${label}: skipped audits are forbidden`);
  assert.equal(assertions['categories:performance'][1].minScore, 0.9, `${label}: performance floor`);
  assert.equal(assertions['categories:accessibility'][1].minScore, 1, `${label}: accessibility floor`);
  assert.equal(assertions['categories:best-practices'][1].minScore, 1, `${label}: best-practices floor`);
  assert.equal(assertions['categories:seo'][1].minScore, 1, `${label}: SEO floor`);
  assert.equal(assertions['first-contentful-paint'][1].maxNumericValue, 1800, `${label}: FCP budget`);
  assert.equal(assertions['largest-contentful-paint'][1].maxNumericValue, 2500, `${label}: LCP budget`);
  assert.equal(assertions['total-blocking-time'][1].maxNumericValue, 200, `${label}: TBT budget`);
  assert.equal(assertions['cumulative-layout-shift'][1].maxNumericValue, 0.1, `${label}: CLS budget`);
  assert.equal(assertions['server-response-time'][1].maxNumericValue, 600, `${label}: TTFB budget`);
}
validateLighthouse(desktop, 'desktop');
validateLighthouse(mobile, 'mobile');

for (const source of [controls, audio, renderer, wrapper, bootstrap]) new Function(source);
console.log('PASS: WDA r198 100-target source contracts passed.');
'''

WDA_WORKFLOW = r'''name: Validate FormatX WDA 100-target r198

on:
  workflow_dispatch:
  pull_request:
    branches: [master]
    paths:
      - 'docs/scifi-ui/index.html'
      - 'docs/scifi-ui/scripts/formatx-wda-controls-r198.js'
      - 'docs/scifi-ui/styles/formatx-wda-hardening-r198.css'
      - 'docs/scifi-ui/scripts/formatx-audio-repair.js'
      - 'docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js'
      - 'docs/scifi-ui/scripts/formatx-core-mobile-v55.js'
      - 'docs/scifi-ui/scripts/formatx-core-real3d-v20.js'
      - 'billing-worker/wrangler.jsonc'
      - 'lighthouserc.live.json'
      - 'lighthouserc.live.mobile.json'
      - '.github/scripts/validate-wda-100-r198.cjs'
      - '.github/workflows/validate-wda-100-r198.yml'
  push:
    branches: [master]
    paths:
      - 'docs/scifi-ui/index.html'
      - 'docs/scifi-ui/scripts/formatx-wda-controls-r198.js'
      - 'docs/scifi-ui/styles/formatx-wda-hardening-r198.css'
      - 'docs/scifi-ui/scripts/formatx-audio-repair.js'
      - 'docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js'
      - 'docs/scifi-ui/scripts/formatx-core-mobile-v55.js'
      - 'docs/scifi-ui/scripts/formatx-core-real3d-v20.js'
      - 'billing-worker/wrangler.jsonc'
      - 'lighthouserc.live.json'
      - 'lighthouserc.live.mobile.json'
      - '.github/scripts/validate-wda-100-r198.cjs'
      - '.github/workflows/validate-wda-100-r198.yml'

permissions:
  contents: read
  statuses: write

concurrency:
  group: formatx-wda-r198-${{ github.ref }}
  cancel-in-progress: true

jobs:
  wda-100-target:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout repository
        uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683

      - name: Validate WDA 100-target source contracts
        run: |
          set -euo pipefail
          node --check docs/scifi-ui/scripts/formatx-wda-controls-r198.js
          node --check docs/scifi-ui/scripts/formatx-audio-repair.js
          node --check docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js
          node --check docs/scifi-ui/scripts/formatx-core-mobile-v55.js
          node --check docs/scifi-ui/scripts/formatx-core-real3d-v20.js
          node --check .github/scripts/validate-wda-100-r198.cjs
          node .github/scripts/validate-wda-100-r198.cjs
          node .github/scripts/validate-real3d-mobile-startup-v22.cjs
          git diff --check

      - name: Publish WDA target status
        if: always() && github.event_name == 'push'
        env:
          GH_TOKEN: ${{ github.token }}
          JOB_STATUS: ${{ job.status }}
        run: |
          if [ "$JOB_STATUS" = success ]; then
            state=success
            description='WDA r198 UX, a11y, audio, WebGL and truthful Lighthouse contracts passed'
          else
            state=failure
            description='FormatX WDA r198 100-target source gate failed'
          fi
          gh api --method POST "repos/$GITHUB_REPOSITORY/statuses/$GITHUB_SHA" \
            -f state="$state" \
            -f context='FormatX WDA 100-target' \
            -f description="$description" \
            -f target_url="https://github.com/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"
'''

# 1. Add external WDA hardening assets to the canonical page.
write('docs/scifi-ui/styles/formatx-wda-hardening-r198.css', WDA_CSS)
write('docs/scifi-ui/scripts/formatx-wda-controls-r198.js', WDA_CONTROLS)
index_rel = 'docs/scifi-ui/index.html'
index = read(index_rel)
if 'data-fx-wda-hardening-r198' not in index:
    anchor = '  <link rel="stylesheet" href="./styles/formatx-event-horizon.css?v=20260726-event-horizon-3">'
    if anchor not in index:
        raise SystemExit('index.html: first stylesheet anchor not found')
    hardening = (
        '  <link rel="stylesheet" data-fx-wda-hardening-r198="true" href="./styles/formatx-wda-hardening-r198.css?v=20260817-r198">\n'
        '  <script defer data-fx-wda-hardening-r198="true" src="./scripts/formatx-wda-controls-r198.js?v=20260817-r198"></script>\n'
    )
    index = index.replace(anchor, hardening + anchor, 1)

# Fresh core bootstrap URL so returning clients cannot keep an earlier renderer chain.
index, n = re.subn(
    r'formatx-core-real3d-v20\.js\?v=[^"\']+',
    'formatx-core-real3d-v20.js?v=20260817-r198-wda',
    index,
    count=1,
)
if n != 1:
    raise SystemExit(f'index.html: expected one core bootstrap URL, found {n}')
write(index_rel, index)

# 2. Professional audio: unmistakable MUTE/UNMUTE, default muted, strict-CSP telemetry.
audio_rel = 'docs/scifi-ui/scripts/formatx-audio-repair.js'
audio = read(audio_rel)
for old, new in [
    ("'MUSIC ON'", "'MUTE'"),
    ("'ZENE BE'", "'MUTE'"),
    ("'MUSIC OFF'", "'UNMUTE'"),
    ("'ZENE KI'", "'UNMUTE'"),
    ("root.style.setProperty('--fx-audio-self-test-peak', peak.toFixed(3));", "root.dataset.fxAudioSelfTestPeak = peak.toFixed(3);"),
    ("root.style.setProperty('--fx-audio-signal', String(deviation));", "root.dataset.fxAudioSignal = String(deviation);"),
]:
    if old not in audio:
        raise SystemExit(f'audio repair: missing token {old!r}')
    audio = audio.replace(old, new)
write(audio_rel, audio)

igloo_rel = 'docs/scifi-ui/scripts/igloo-parity.js'
igloo = read(igloo_rel)
igloo, n = re.subn(
    r'formatx-audio-repair\.js\?v=[^\'"\]]+',
    'formatx-audio-repair.js?v=20260817-r198-wda-sound',
    igloo,
    count=1,
)
if n != 1:
    raise SystemExit(f'igloo parity: expected one audio URL, found {n}')
write(igloo_rel, igloo)

# 3. Truthful, adaptive 60fps-target WebGL. No audit bypass and no idle silhouette wobble.
renderer_rel = 'docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js'
renderer = read(renderer_rel)
audit_line = "if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxCoreMobileR99='audit-skip';root.dataset.fxCoreMobileV69='audit-skip';root.dataset.fxCoreMobileV55='audit-skip';return;}\n"
if audit_line not in renderer:
    raise SystemExit('renderer: lighthouse audit bypass not found')
renderer = renderer.replace(audit_line, '', 1)
mobile_line = "const mobile=matchMedia('(max-width:900px),(pointer:coarse)').matches,reduced=matchMedia('(prefers-reduced-motion: reduce)'),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));"
if mobile_line not in renderer:
    raise SystemExit('renderer: mobile constants anchor not found')
renderer = renderer.replace(
    mobile_line,
    mobile_line + "\nconst TARGET_FPS=60,FRAME_BUDGET_MS=1000/TARGET_FPS;let renderScale=mobile?.86:1,slowFrames=0,fastFrames=0;root.dataset.fxCoreTargetFps=String(TARGET_FPS);root.dataset.fxCoreFrameBudgetMs=FRAME_BUDGET_MS.toFixed(2);root.dataset.fxCoreRenderScale=renderScale.toFixed(2);",
    1,
)
old_shader = "float t=uTime,b=1.+.007*sin(t*.70)+.0025*sin(t*1.17);mat3 R=ry(uPointer.x*.20+.012*sin(t*.24))*rx(-uPointer.y*.15+.009*cos(t*.19));"
if renderer.count(old_shader) != 2:
    raise SystemExit(f'renderer: expected two breathing shader copies, found {renderer.count(old_shader)}')
renderer = renderer.replace(old_shader, "float t=uTime,b=1.;mat3 R=ry(uPointer.x*.20)*rx(-uPointer.y*.15);", 2)
old_state = "let w=0,h=0,raf=0,last=performance.now(),energy=.30,target=.30,px=0,py=0,tx=0,ty=0,visible=true,disposed=false,avg=16.7,frames=0,timer=0;"
new_state = "let w=0,h=0,raf=0,last=performance.now(),energy=.30,target=.30,px=0,py=0,tx=0,ty=0,visible=true,pageVisible=!document.hidden,disposed=false,avg=16.7,frames=0,timer=0;"
if old_state not in renderer:
    raise SystemExit('renderer: runtime state anchor not found')
renderer = renderer.replace(old_state, new_state, 1)
old_resize = "function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;const cap=mobile?1.35:1.5,budget=mobile?720000:1080000,dpr=Math.min(devicePixelRatio||1,cap);let cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr),pix=cw*ch;if(pix>budget){const k=Math.sqrt(budget/pix);cw=Math.round(cw*k);ch=Math.round(ch*k)}if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}w=cw;h=ch;gl.viewport(0,0,w,h);root.dataset.fxCoreReal3dResolution=w+'x'+h}"
new_resize = "function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;const cap=mobile?1.35:1.5,budget=mobile?720000:1080000,dpr=Math.min(devicePixelRatio||1,cap)*renderScale;let cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr),pix=cw*ch;if(pix>budget){const k=Math.sqrt(budget/pix);cw=Math.round(cw*k);ch=Math.round(ch*k)}if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}w=cw;h=ch;gl.viewport(0,0,w,h);root.dataset.fxCoreReal3dResolution=w+'x'+h;root.dataset.fxCoreRenderScale=renderScale.toFixed(2)}"
if old_resize not in renderer:
    raise SystemExit('renderer: resize anchor not found')
renderer = renderer.replace(old_resize, new_resize, 1)
old_io = "const ro=new ResizeObserver(resize);ro.observe(stage);resize();const io=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible&&!raf&&!disposed&&root.dataset.fxReferenceMotionPaused!=='true')raf=requestAnimationFrame(frame)},{rootMargin:'160px'});io.observe(stage);"
new_io = "const ro=new ResizeObserver(resize);ro.observe(stage);resize();const io=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible&&pageVisible&&!raf&&!disposed&&root.dataset.fxReferenceMotionPaused!=='true')raf=requestAnimationFrame(frame)},{rootMargin:'160px'});io.observe(stage);function onVisibility(){pageVisible=!document.hidden;if(pageVisible&&visible&&!raf&&!disposed&&root.dataset.fxReferenceMotionPaused!=='true'){last=performance.now();raf=requestAnimationFrame(frame)}}document.addEventListener('visibilitychange',onVisibility);"
if old_io not in renderer:
    raise SystemExit('renderer: observer anchor not found')
renderer = renderer.replace(old_io, new_io, 1)
frame_pattern = r" function frame\(now\)\{.*?\}\n function destroy\(\)\{"
new_frame = """ function frame(now){raf=0;if(disposed||!visible||!pageVisible||root.dataset.fxReferenceMotionPaused==='true')return;resize();const st=performance.now(),dt=Math.min(40,Math.max(0,now-last));last=now;avg+=(dt-avg)*.05;frames++;if(mobile){if(avg>19.5){slowFrames++;fastFrames=0;if(slowFrames>=12&&renderScale>.58){renderScale=Math.max(.58,renderScale*.88);slowFrames=0;resize()}}else if(avg<16.2){fastFrames++;slowFrames=0;if(fastFrames>=150&&renderScale<1){renderScale=Math.min(1,renderScale+.04);fastFrames=0;resize()}}else{slowFrames=Math.max(0,slowFrames-1);fastFrames=0}}px+=(tx-px)*.075;py+=(ty-py)*.075;energy+=(target-energy)*.09;target+=(.30-target)*.01;cinematic.corePosition=[px*.09,-py*.08,.55+energy*.014];cinematic.energy=energy;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.useProgram(program);gl.uniform1f(U.time,reduced.matches?0:now*.001);gl.uniform1f(U.energy,energy);gl.uniform2f(U.pointer,px,py);gl.drawArrays(gl.TRIANGLES,0,triShade.length);gl.depthMask(true);gl.disable(gl.BLEND);const ms=performance.now()-st;root.dataset.fxCoreRenderMs=ms.toFixed(2);if(frames%24===0){root.dataset.fxCoreFrameMs=avg.toFixed(1);root.dataset.fxCoreReal3dFps=String(Math.round(1000/Math.max(1,avg)));root.dataset.fxCoreReal3dQuality=renderScale<.72?'1':renderScale<.90?'2':'3';root.dataset.fxCorePerformanceMode=avg>19.5?'r198-resolution-down':avg<16.2?'r198-60fps-headroom':'r198-60fps-balanced';root.dataset.fxCoreTargetFps=String(TARGET_FPS);root.dataset.fxCoreFrameBudgetMs=FRAME_BUDGET_MS.toFixed(2);root.dataset.fxCoreRenderScale=renderScale.toFixed(2)}if(!disposed)raf=requestAnimationFrame(frame)}
 function destroy(){"""
renderer, n = re.subn(frame_pattern, new_frame, renderer, count=1, flags=re.S)
if n != 1:
    raise SystemExit(f'renderer: expected one frame/destroy block, found {n}')
old_destroy_tail = "ro.disconnect();io.disconnect();stage.remove();"
if old_destroy_tail not in renderer:
    raise SystemExit('renderer: destroy cleanup anchor not found')
renderer = renderer.replace(old_destroy_tail, "ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',onVisibility);stage.remove();", 1)
old_marker = "root.dataset.fxCoreInteractionVisual='touch-pointer-breathing-spectral-refraction-r99';"
if old_marker not in renderer:
    raise SystemExit('renderer: interaction marker not found')
renderer = renderer.replace(old_marker, "root.dataset.fxCoreInteractionVisual='touch-pointer-stable-silhouette-spectral-refraction-r198';", 1)
write(renderer_rel, renderer)

# Fresh renderer chain and no special Lighthouse path.
wrapper_rel = 'docs/scifi-ui/scripts/formatx-core-mobile-v55.js'
wrapper = read(wrapper_rel)
wrapper, n = re.subn(r"\s*if \(new URLSearchParams\(location\.search\)\.get\('lighthouse'\) === '1'\) \{ root\.dataset\.fxCoreMobileV55 = 'audit-skip'; return; \}\n", "\n", wrapper, count=1)
if n != 1:
    raise SystemExit(f'wrapper: expected one audit bypass, found {n}')
wrapper, n = re.subn(r"formatx-core-mobile-reference-r99\.js\?v=[^']+", "formatx-core-mobile-reference-r99.js?v=20260817-r198-wda-60fps", wrapper, count=1)
if n != 1:
    raise SystemExit(f'wrapper: expected one renderer URL, found {n}')
write(wrapper_rel, wrapper)

bootstrap_rel = 'docs/scifi-ui/scripts/formatx-core-real3d-v20.js'
bootstrap = read(bootstrap_rel)
bootstrap, n = re.subn(r"\s*if \(new URLSearchParams\(location\.search\)\.get\('lighthouse'\) === '1'\) \{ root\.dataset\.fxCoreReal3d='audit-skip';root\.dataset\.fxCoreReferenceLock='audit-skip';return; \}\n", "\n", bootstrap, count=1)
if n != 1:
    raise SystemExit(f'bootstrap: expected one audit bypass, found {n}')
bootstrap, n = re.subn(r"const MOBILE_SCRIPT = '/scifi-ui/scripts/formatx-core-mobile-v55\.js\?v=[^']+';", "const MOBILE_SCRIPT = '/scifi-ui/scripts/formatx-core-mobile-v55.js?v=20260817-r198-wda-60fps';", bootstrap, count=1)
if n != 1:
    raise SystemExit(f'bootstrap: expected one mobile script URL, found {n}')
write(bootstrap_rel, bootstrap)

# Keep the legacy Real3D source validator useful without hard-locking an old cache query.
real3d_validator_rel = '.github/scripts/validate-real3d-mobile-startup-v22.cjs'
real3d_validator = read(real3d_validator_rel)
real3d_validator, n = re.subn(
    r"assert\.match\(wrapper,/formatx-core-mobile-reference-r99\\\.js\\\?v=20260814-luminous-cinematic-r99/\);",
    "assert.match(wrapper,/formatx-core-mobile-reference-r99\\.js\\?v=20260817-r198-wda-60fps/);",
    real3d_validator,
    count=1,
)
if n != 1:
    raise SystemExit(f'real3d validator: expected old wrapper cache contract, found {n}')
needle = "'fxCoreRenderMs','corePosition','single-webgl-luminous-crystal-r99'"
if needle not in real3d_validator:
    raise SystemExit('real3d validator: renderer token list anchor missing')
real3d_validator = real3d_validator.replace(
    needle,
    "'fxCoreRenderMs','corePosition','single-webgl-luminous-crystal-r99','TARGET_FPS=60','fxCoreRenderScale','touch-pointer-stable-silhouette-spectral-refraction-r198'",
    1,
)
write(real3d_validator_rel, real3d_validator)

# 4. Truthful live Lighthouse: normal public URL, no forced reduced-motion, no skipped audits.
def harden_lighthouse(rel: str, mode: str) -> None:
    data = json.loads(read(rel))
    collect = data['ci']['collect']
    collect['url'] = [f'https://formatxsuite.com/?live={mode}&r198=1']
    collect['numberOfRuns'] = 3
    settings = collect.setdefault('settings', {})
    settings['chromeFlags'] = '--headless=new --no-sandbox --disable-dev-shm-usage'
    settings.pop('skipAudits', None)
    assertions = data['ci']['assert']['assertions']
    assertions['categories:performance'] = ['error', {'minScore': 0.9}]
    assertions['categories:accessibility'] = ['error', {'minScore': 1.0}]
    assertions['categories:best-practices'] = ['error', {'minScore': 1.0}]
    assertions['categories:seo'] = ['error', {'minScore': 1.0}]
    assertions['first-contentful-paint'] = ['error', {'maxNumericValue': 1800}]
    assertions['largest-contentful-paint'] = ['error', {'maxNumericValue': 2500}]
    assertions['total-blocking-time'] = ['error', {'maxNumericValue': 200}]
    assertions['cumulative-layout-shift'] = ['error', {'maxNumericValue': 0.1}]
    assertions['server-response-time'] = ['error', {'maxNumericValue': 600}]
    write(rel, json.dumps(data, indent=2, ensure_ascii=False) + '\n')

harden_lighthouse('lighthouserc.live.json', 'desktop')
harden_lighthouse('lighthouserc.live.mobile.json', 'mobile')

# 5. Dedicated WDA source gate.
write('.github/scripts/validate-wda-100-r198.cjs', WDA_VALIDATOR)
write('.github/workflows/validate-wda-100-r198.yml', WDA_WORKFLOW)

print('PASS: r198 WDA 100-target patch prepared.')
