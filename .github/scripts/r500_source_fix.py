from __future__ import annotations
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]

def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")

def write(rel, text):
    (ROOT / rel).write_text(text, encoding="utf-8")

def one(text, old, new, label):
    if old not in text:
        raise SystemExit(f"missing patch anchor: {label}")
    return text.replace(old, new, 1)

def patch_source():
    rel = "docs/scifi-ui/index.html"
    html = read(rel)
    if 'data-fx-canonical-hero-product-state="true"' not in html:
        m = re.search(r'(?P<lead><p class="hero-lead"[^>]*>.*?</p>)', html, re.S)
        if not m:
            raise SystemExit("canonical hero lead not found")
        block = """
          <div class="fx-hero-product-state" data-fx-canonical-hero-product-state="true" data-fx-hero-product-state="first-frame">
            <span class="fx-platform-status-badge" data-status="full_release" data-hu="Teljes verzió" data-en="Full release">Teljes verzió</span>
            <span data-fx-hero-product-state-copy="true" data-hu="Bazzite/Linux elsődleges · Windows támogatott · teljes verzió · 5 napos próbalicenc" data-en="Bazzite/Linux primary · Windows supported · full version · 5-day trial licence">Bazzite/Linux elsődleges · Windows támogatott · teljes verzió · 5 napos próbalicenc</span>
          </div>"""
        html = html[:m.end()] + block + html[m.end():]
    if html.count('data-fx-canonical-hero-product-state="true"') != 1:
        raise SystemExit("canonical hero state count is not one")
    write(rel, html)

    rel = "docs/scifi-ui/scripts/platform-status.js"
    js = read(rel)
    a = js.find("  function installHeroState(data) {")
    b = js.find("\n  function installCheckoutNotice(data) {", a)
    if a < 0 or b < 0:
        raise SystemExit("installHeroState boundaries missing")
    fn = r"""  function installHeroState(data) {
    const heroCopy = document.querySelector('#hero .hero-copy');
    if (!heroCopy) return;
    const canonicalHome = Boolean(
      heroCopy.closest('#hero')?.parentElement?.id === 'main-content'
      && document.querySelector('link[rel="canonical"][href^="https://formatxsuite.com/"]')
    );
    let state = heroCopy.querySelector('.fx-hero-product-state');
    if (!state) {
      if (canonicalHome) {
        ROOT.dataset.fxHeroProductState = 'missing-canonical-node';
        return;
      }
      state = document.createElement('div');
      state.className = 'fx-hero-product-state';
      state.dataset.fxHeroProductState = 'legacy-fallback';
      const lead = heroCopy.querySelector('.hero-lead');
      if (lead) lead.insertAdjacentElement('afterend', state);
      else heroCopy.prepend(state);
    }

    const lang = language();
    let statusBadge = state.querySelector('.fx-platform-status-badge');
    let statusCopy = state.querySelector('[data-fx-hero-product-state-copy]');
    if (!statusBadge || !statusCopy) {
      if (canonicalHome) {
        ROOT.dataset.fxHeroProductState = 'invalid-canonical-node';
        return;
      }
      if (!statusBadge) {
        statusBadge = badge(data.product_release.status, data.status_labels, lang);
        state.prepend(statusBadge);
      }
      if (!statusCopy) {
        statusCopy = document.createElement('span');
        statusCopy.dataset.fxHeroProductStateCopy = 'true';
        state.append(statusCopy);
      }
    }

    statusBadge.dataset.status = data.product_release.status;
    statusBadge.textContent = text(data.status_labels[data.product_release.status], lang);
    statusCopy.textContent = lang === 'en'
      ? 'Bazzite/Linux primary · Windows supported · full version · 5-day trial licence'
      : 'Bazzite/Linux elsődleges · Windows támogatott · teljes verzió · 5 napos próbalicenc';
    state.dataset.fxHeroProductState = 'ready';
    ROOT.dataset.fxHeroProductState = canonicalHome ? 'canonical-reused' : 'fallback-ready';

    const download = document.getElementById('hero-download');
    if (download instanceof HTMLAnchorElement) {
      download.href = './downloads/';
      download.dataset.releaseDownload = 'multiplatform';
      download.removeAttribute('download');
      const label = download.querySelector('[data-release-download-label], span');
      if (label) {
        label.textContent = lang === 'en'
          ? 'Full multiplatform version'
          : 'Teljes multiplatform verzió';
      }
    }
  }
"""
    write(rel, js[:a] + fn + js[b:])

    rel = "docs/scifi-ui/styles/formatx-p0-first-paint-r490.css"
    css = read(rel)
    if "R500 canonical hero product-state first-frame geometry" not in css:
        block = r"""

/* R500 canonical hero product-state first-frame geometry.
   This mirrors the settled platform-status + desktop r244 cascade. */
html body.living-architecture #hero .fx-hero-product-state {
  position: relative !important;
  inset: auto !important;
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  box-sizing: border-box !important;
  width: 100% !important;
  max-width: 560px !important;
  height: auto !important;
  min-height: 0 !important;
  margin: 18px 0 0 !important;
  padding: 0 !important;
  gap: 10px !important;
  color: rgba(224, 241, 248, .78) !important;
  font-size: 13px !important;
  line-height: 1.45 !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
}
html body.living-architecture #hero .fx-hero-product-state .fx-platform-status-badge {
  display: inline-flex !important;
  align-items: center !important;
  box-sizing: border-box !important;
  min-height: 28px !important;
  padding: 5px 10px !important;
  border: 1px solid currentColor !important;
  border-radius: 999px !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  line-height: 1.2 !important;
  letter-spacing: .04em !important;
  white-space: nowrap !important;
}
@media (min-width: 901px) {
  html body.living-architecture #hero .fx-hero-product-state {
    gap: 8px 12px !important;
    color: rgba(189, 210, 222, .75) !important;
    font-size: 12px !important;
    line-height: 1.45 !important;
  }
}
"""
        css = one(
            css,
            "/* production-r499-p0-first-paint-mag-pause-invariant */",
            block + "\n/* production-r500-p0-first-paint-canonical-hero-state */",
            "P0 css tail",
        )
    write(rel, css)

    rel = ".github/scripts/validate-semantic-first-paint.cjs"
    sem = read(rel)
    if "EXPECTED_CONTENT_GATE" not in sem:
        anchor = (
            "const RECOVERY_SOURCE = fs.readFileSync(\n"
            "  path.join(REPO, 'docs/scifi-ui/scripts/formatx-canonical-recovery.js'),\n"
            "  'utf8',\n"
            ");\n"
        )
        extra = anchor + r"""const CONTENT_RUNTIME_SOURCE = fs.readFileSync(
  path.join(REPO, 'docs/scifi-ui/scripts/formatx-content-runtime-loader-r241.js'),
  'utf8',
);
function sourceDatasetValue(name) {
  const match = CONTENT_RUNTIME_SOURCE.match(
    new RegExp(`root\\.dataset\\.${name}\\s*=\\s*['"]([^'"]+)['"]`)
  );
  assert.ok(match, `missing source dataset contract ${name}`);
  return match[1];
}
const EXPECTED_CONTENT_GATE = sourceDatasetValue('fxContentRuntimeR241');
const EXPECTED_STABILITY = sourceDatasetValue('fxFirstFrameStabilityR283');
"""
        sem = one(sem, anchor, extra, "semantic source")
    sem = sem.replace("    'armed-r301-user-intent',", "    EXPECTED_CONTENT_GATE,")
    sem = sem.replace(
        "assert.equal(state.stability, 'critical-only-r300',",
        "assert.equal(state.stability, EXPECTED_STABILITY,"
    )
    if "armed-r301-user-intent" in sem:
        raise SystemExit("stale semantic gate remains")
    write(rel, sem)

    rel = ".github/scripts/validate-mag-surface-energy-r484.cjs"
    mag = read(rel)
    if "MOBILE_OPTICS_SOURCE" not in mag:
        anchor = "fs.mkdirSync(output, { recursive: true });\n"
        extra = anchor + r"""const MOBILE_OPTICS_SOURCE = fs.readFileSync(
  path.join(__dirname, '../../docs/scifi-ui/styles/formatx-mag-mobile-optics-r480.css'),
  'utf8',
);
function sourceFilterToken(name, unit = '') {
  const match = MOBILE_OPTICS_SOURCE.match(
    new RegExp(`${name}\\(([-\\d.]+)${unit}\\)`)
  );
  assert.ok(match, `missing canonical mobile optics token ${name}`);
  return `${name}(${match[1]}${unit})`;
}
const EXPECTED_MOBILE_FILTER = [
  sourceFilterToken('brightness'),
  sourceFilterToken('contrast'),
  sourceFilterToken('saturate'),
  sourceFilterToken('hue-rotate', 'deg'),
  sourceFilterToken('blur', 'px'),
];
"""
        mag = one(mag, anchor, extra, "MAG source")
    old = (
        "      assert.match(report.dom.filter, /brightness\\\\(0?\\\\.965\\\\)/);\n"
        "      assert.match(report.dom.filter, /contrast\\\\(0?\\\\.885\\\\)/);\n"
        "      assert.match(report.dom.filter, /saturate\\\\(1\\\\.14\\\\)/);\n"
        "      assert.match(report.dom.filter, /blur\\\\(0?\\\\.58px\\\\)/);"
    )
    new = r"""      for (const token of EXPECTED_MOBILE_FILTER) {
        assert.ok(
          report.dom.filter.includes(token),
          `${name}: canonical mobile optics token missing ${token}; computed=${report.dom.filter}`,
        );
      }"""
    if old in mag:
        mag = mag.replace(old, new, 1)
    if r"brightness\(0?\.965\)" in mag:
        raise SystemExit("stale MAG optics remains")
    write(rel, mag)

    html = read("docs/scifi-ui/index.html")
    if not re.search(
        r'<p class="hero-lead"[^>]*>.*?</p>\s*<div class="fx-hero-product-state"',
        html, re.S,
    ):
        raise SystemExit("product state is not directly after hero lead")
    if html.count('data-fx-canonical-hero-product-state="true"') != 1:
        raise SystemExit("canonical product-state count invalid")

def prepare_deploy():
    rel = "billing-worker/src/production-content-entry.js"
    s = read(rel)
    replacements = [
        ("FormatX R499 — canonical frame rollback + MAG pause invariant.",
         "FormatX R500 — canonical hero product-state first-frame ownership."),
        ("20260902-r499-canonical-frame-mag-pause",
         "20260902-r500-canonical-hero-product-state"),
        ('data-fx-first-frame-stability-r499="true"',
         'data-fx-first-frame-stability-r500="true"'),
        ("20260902-r499-canonical-frame", "20260902-r500-canonical-hero-state"),
        ('data-fx-p0-first-paint-r499="true"',
         'data-fx-p0-first-paint-r500="true"'),
        ("20260902-r499-mag-pause-invariant", "20260902-r500-canonical-hero-state"),
        ("r499-canonical-frame:${STARTUP_REVISION}",
         "r500-canonical-hero-state:${STARTUP_REVISION}"),
        ("r499-no-static-hero-injection-no-interaction-media-mutation",
         "r500-canonical-hero-state-no-runtime-insertion"),
    ]
    for old, new in replacements:
        if old not in s:
            raise SystemExit(f"missing deploy token {old}")
        s = s.replace(old, new)
    anchor = r"""    .replace(/formatx-mag-shape-sync-r476\.js\?v=[^"']+/g, 'formatx-mag-shape-sync-r476.js?v=20260902-r499-persistent-pause-clock');"""
    repl = r"""    .replace(/formatx-mag-shape-sync-r476\.js\?v=[^"']+/g, 'formatx-mag-shape-sync-r476.js?v=20260902-r499-persistent-pause-clock')
    .replace(/platform-status\.js\?v=[^"']+/g, 'platform-status.js?v=20260902-r500-canonical-hero-state')
    .replace(/platform-status\.css\?v=[^"']+/g, 'platform-status.css?v=20260902-r500-canonical-hero-state');"""
    s = one(s, anchor, repl, "platform cache bust")
    write(rel, s)

    rel = "docs/p0-validation-version.txt"
    marker = read(rel)
    marker = marker.replace(
        "version=2026-09-02-p0-100x3-r9",
        "version=2026-09-02-p0-100x3-r10",
    )
    marker = re.sub(
        r"^trigger=.*$",
        "trigger=r500-canonical-hero-product-state-cls",
        marker,
        flags=re.M,
    )
    write(rel, marker)

if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in {"source", "deploy"}:
        raise SystemExit("usage: r500_source_fix.py source|deploy")
    patch_source() if sys.argv[1] == "source" else prepare_deploy()
