# R2206 — Biophotonic nucleus and live MAG, cinematic continuity

Status: **stacked development changes on open PR #577**, not an approved release. The photographs supplied by the user are the **minimum art-direction reference**, not automated approval criteria.

## Visual target and sequence

1. **0–3.1 seconds — DNA**, wide, genuinely three-dimensional blue/violet double helix with floating luminous phosphors. The physical cell and permanent MAG must remain hidden.
2. **3.5–5.7 seconds — biological nucleus**, large, textured turquoise cytoplasm with clustered coral organelles and different-depth chromatin inside a transmitting spherical membrane.
3. **5.9–7.4 seconds — material transfer**, paired genome particles feed the four silver titanium arms. Do not reveal the final eye before chassis assembly.
4. **7.4–10 seconds — living MAG**, polished articulated silver surfaces, recessed rounded glass optic carrying the same cyan/coral living chemistry. Camera makes the original permanent MAG handoff without flashing a second owner.

## R2206 physical changes

- The existing permanent `formatx-crystal-organism-r326.js` fragment shader now models body-local teal cortical folds, coral metabolic sites, a slow pulse under the actual curved lens and a cool silver grazing highlight. No extra draw pass, render target or canvas.
- The existing Three.js `formatx-mag-genesis-three-r1280.js` builds richer deterministic aqua/coral membrane microtexture **once**. It retains the same physical 3D shell, UV geometry, camera, old ten-second timing, GPU DNA morph and actual separate organelle.
- Embryo photon density: **1200 mobile / 3100 desktop** in the existing Points batch; DNA genome morph stays **6000 mobile / 9600 desktop**. Higher shader complexity and photon density require actual GPU measurement.
- Membrane visibility is now 0.89 of timeline visibility and chromatin visibility 0.11 mobile / 0.16 desktop. Not a claim of photographic equivalence.

## Delivery contract

The preexisting asset chain is retained, but all affected references use `20261028-r2206-biophotonic-nucleus-mag`. The inlined root bootstrap is covered by the precise SHA256 `lGPKw2slszeCOq/FIHj93C7a7TNTnG9pK02fiUnPrnc=` in the HTML meta CSP and both Worker CSP policies. This remains a development change.

## Release acceptance — all required

- Actual browser comparison, at film times 0s / 3.8s / 5.1s / 7.5s / 10s: **390×844**, **430×932**, **1440×900** and **1920×1080**. Inspect actual pixels and compare to supplied references.
- At most one original active intro canvas, one permanent MAG owner; correct first frame, 10-second timeline, session replay, explicit Skip, reduced-motion static shortcut and no unintended hidden MAG flash.
- No shader errors, no WebGL context loss, no dangling film listeners, no uncaught exceptions, no frozen permanent MAG and zero idle renders outside the bounded animation window.
- Lighthouse desktop + mobile: measure actual Performance, Accessibility, Best Practices, SEO against project targets; do not claim 100/100/100/100 before four real 100-point results.
- Keyboard/touch/mobile safe areas and semantic content must remain navigable. LCP/CLS/TBT must be verified rather than inferred.
- This branch **must not be presented as deployed**. Production remains the default branch until reviewed and intentionally released. Automatic checks do not certify the minimum art-quality bar.
