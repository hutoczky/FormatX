#!/usr/bin/env python3
from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file_path = Path(path)
    source = file_path.read_text(encoding="utf-8")
    if old not in source:
        raise SystemExit(f"Required source marker missing in {path}")
    if source.count(old) != 1:
        raise SystemExit(f"Required source marker is not unique in {path}")
    file_path.write_text(source.replace(old, new, 1), encoding="utf-8")


loader_old = """  function load(index) {
    if (index >= queue.length) {
      root.dataset.fxTranscendLoader = 'safe-ready-v27';
      return;
    }

    const script = document.createElement('script');
    script.src = queue[index];
    script.async = false;
    script.dataset.fxTranscendModule = String(index);
    script.addEventListener('load', () => load(index + 1), { once: true });
    script.addEventListener('error', () => {
      console.warn('FormatX optional module failed to load:', queue[index]);
      root.dataset.fxTranscendLoader = 'safe-degraded-v27';
      load(index + 1);
    }, { once: true });
    document.head.appendChild(script);
  }
"""

loader_new = """  function load(index) {
    if (index >= queue.length) {
      root.dataset.fxTranscendProgress = '100';
      root.dataset.fxTranscendLoader = 'safe-ready-v27';
      return;
    }

    root.dataset.fxTranscendProgress = String(Math.round(index / queue.length * 100));
    const script = document.createElement('script');
    script.src = queue[index];
    script.async = false;
    script.dataset.fxTranscendModule = String(index);

    let settled = false;
    let timeout = 0;
    const finish = (ok, reason) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (!ok) {
        console.warn('FormatX optional module did not complete:', queue[index], reason);
        root.dataset.fxTranscendLoader = 'safe-degraded-v27';
      }
      root.dataset.fxTranscendProgress = String(Math.round((index + 1) / queue.length * 100));
      load(index + 1);
    };

    timeout = setTimeout(() => finish(false, 'timeout'), 9000);
    script.addEventListener('load', () => finish(true, 'load'), { once: true });
    script.addEventListener('error', () => finish(false, 'error'), { once: true });
    document.head.appendChild(script);
  }
"""
replace_once("docs/scifi-ui/scripts/igloo-parity.js", loader_old, loader_new)

language_old = """    toggle.addEventListener('click', () => {
      const current = SUPPORTED.has(ROOT.lang) ? ROOT.lang : storedLanguage();
      setLanguage(current === 'hu' ? 'en' : 'hu', true, container, toggle);
    });

    container.appendChild(toggle);
"""

language_new = """    toggle.addEventListener('click', () => {
      const current = SUPPORTED.has(ROOT.lang) ? ROOT.lang : storedLanguage();
      setLanguage(current === 'hu' ? 'en' : 'hu', true, container, toggle);
    });
    container.addEventListener('click', event => {
      if (event.target === container) toggle.click();
    });

    container.appendChild(toggle);
"""
replace_once("docs/scifi-ui/scripts/single-language-toggle.js", language_old, language_new)

workflow_old = """          node .github/scripts/validate-pricing-qr.cjs
          node .github/scripts/validate-user-requested-site-features.cjs
"""
workflow_new = """          node .github/scripts/validate-pricing-qr.cjs
          node .github/scripts/validate-user-requested-site-features.cjs
          node .github/scripts/validate-formatx-110.cjs
"""
replace_once(".github/workflows/deploy-formatx-custom-domain.yml", workflow_old, workflow_new)

validator = r'''"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const loader = read("docs/scifi-ui/scripts/igloo-parity.js");
const language = read("docs/scifi-ui/scripts/single-language-toggle.js");
const webgl = read("docs/scifi-ui/scripts/webgl-fallback-loader.js");
const webgpu = read("docs/scifi-ui/scripts/experience-entry.js");

assert.ok(loader.includes("timeout = setTimeout(() => finish(false, 'timeout'), 9000);"), "module timeout is missing");
assert.ok(loader.includes("root.dataset.fxTranscendProgress = '100';"), "loader completion marker is missing");
assert.ok(loader.includes("root.dataset.fxTranscendLoader = 'safe-degraded-v27';"), "loader degradation path is missing");
assert.ok(language.includes("if (event.target === container) toggle.click();"), "full language control is not clickable");
assert.ok(webgl.includes("this.maxCount = mobile ? 1800 : 3500;"), "WebGL particle cap regressed");
assert.ok(webgl.includes("} else if (false && fps > 58 && this.tier < 3) {"), "WebGL upward particle scaling is enabled");
assert.ok(webgpu.includes("this.maxCount = reduced ? 18000 : mobile ? 60000 : 100000;"), "WebGPU particle cap regressed");
assert.ok(webgpu.includes("} else if (false && fps > 108 && this.tier < 3) {"), "WebGPU upward particle scaling is enabled");

console.log("FormatX 110% finish validation passed.");
'''
Path(".github/scripts/validate-formatx-110.cjs").write_text(validator, encoding="utf-8")
