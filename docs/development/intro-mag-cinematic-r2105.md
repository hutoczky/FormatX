# Intro + MAG cinematic upgrade — R2105

Status: development branch only. Not approved for production.

## Verified baseline
- Existing live birth runtime: `docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js`
- Intro bootstrap: `docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js`
- Existing replay controller: `docs/scifi-ui/scripts/formatx-intro-replay.js`
- R2104 production-revision notes: canvas fallback refinement; original Three.js intro and persistent WebGL MAG remain unchanged.
- R2104 reported Lighthouse desktop 0.92/0.92/0.91, mobile 0.93/0.93/0.93, below 0.95 target.

## Required implementation sequence
1. Capture desktop (1920x1080, 1440x900) and mobile (390x844, 360x800) frames at 0, 25, 50, 75 and 100 percent of intro timeline.
2. Identify the single canonical intro owner; preserve first-visit/forced-intro/session-skip semantics, accessible Skip and the R326 MAG handoff.
3. Build one coherent material language for intro and persistent MAG: smoked titanium, sapphire optic, energy field, PBR light response and contact shadowing. No duplicate canvases or independent render loops.
4. Use camera keyframes with continuous eased interpolation, stable framing and responsive safe areas. Preserve content readability.
5. Add GPU capability tiers and prefers-reduced-motion support; maintain low-power canvas fallback.
6. Verify no duplicate evidence blocks, no visual layout shift, and no regressions to routing, bilingual copy, downloads, licenses or checkout.
7. Run browser screenshot comparisons and functional tests before requesting production release.

## Release gates
- Desktop and mobile intro screenshots reviewed against reference art direction.
- Intro visible on first visit and with ?intro=1; subsequent visits obey existing session policy.
- Skip always exits; MAG remains interactive after handoff.
- No unhandled errors, double canvas, stuck overlay, or broken checkout.
- Lighthouse performance/accessibility/best-practices >= 0.95 each on target desktop/mobile runs, or explicitly documented exceptions.
- No production deployment without explicit approval.

## Known limits
This document defines acceptance criteria; it does not assert that visual implementation, browser validation or deployment is complete.
