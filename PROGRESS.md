# Intro and MAG progress — 2026-11-04

The current work stays on the Genesis introduction and the same living MAG's transition into the page. The requested visual reference quality and smooth hardware motion are not complete.

## Implemented in this candidate

- R2218: restrict the cinematic machined-panel domain to the same front titanium skin as the permanent MAG, and reuse its body-local cool grazing response inside the existing physical material program. Geometry, four-point silhouette, materials, light count, camera, clocks, living optic and handoff ownership remain. This improves one body/light continuity mismatch without adding a draw, program, pass, texture, context, canvas, RAF or timer. Rendered comparison and hardware motion remain open.
- R2217: match the cinematic optical anatomy to the actual permanent MAG: .135 radial / .055 axial lens, the same eight-knot lathed bezel with native radial slope normals, and eight iris quads below the glass. Reuse the existing sphere topology and socket/rim/shutter meshes and materials. The outer body geometry, silhouette, native renderer, studio lighting, clocks and handoff remain unchanged. This corrects one optical mismatch; full body/light continuity is still open.
- The new source proof builds the actual bundled Three meshes and compares every bezel vertex/normal and iris point against the permanent renderer's authored profile. The existing seven-case WebGL oracle retains all assertions/deadlines and now observes actual component draws and optical bounds.
- R2216: apply the same projected-phase footprint filter to the fine cyan/coral tissue carrier in both living optics. Resolvable close-up detail remains, while the fine carrier fades before it becomes unresolved at the smaller page MAG. Broad tissue folds and original metabolism clocks remain. The native material reuses its existing derivative capability; its genuine non-derivative path remains available. This adds fragment arithmetic and is not a speed or FPS claim.
- Extend the existing optical and metal-edge proofs to inspect the actual linked filtered material, and add genuine WebGL1 mobile/desktop observations without spoofing a GPU or extension. All original cases, assertions, deadlines and workflow steps remain.
- R2215: settle the existing cinematic studio key onto the permanent MAG's camera-space direction before handoff, while preserving frontal irradiance. The earlier DNA/embryo lighting, fill, camera, geometry and materials remain. The existing seven-case WebGL oracle now reads the actual uploaded key direction; no case or deadline is removed.
- Finish the supporting organic and cellular layers' existing fades at 7.35 seconds. Their former 4% floor kept hundreds of almost invisible meshes eligible for drawing beneath the completed metal MAG.
- Preserve the DNA and embryo chapter before these fades, the titanium silhouette, physical materials, shared living lens, camera, existing animation and handoff ownership.
- Preserve the current master's release metadata exactly. The two newer master commits change only `docs/scifi-ui/data/current-release.json`.
- Extend the existing seven-case browser oracle to inspect the actual retired scene branches and final draw budget; retain all original cases, assertions and deadlines.

## Local verification

- Actual Three r185 mobile/desktop builders match the native .135/.135/.055 lens radii within 2e-8; bezel vertices/normals match the native profile within 1e-7. The exact parent fails the radial/axial anatomy assertion. Non-optical geometry and scene-object counts match the parent. These are source/mesh checks, not rendered quality, GPU performance or frame-rate acceptance.
- The shared cell function is byte-identical in both real materials. Its numerical fine-detail weight decreases smoothly from fully resolved to zero before the sampling limit; the original native and film time assignments remain. Browser compilation, rendered differences and hardware motion require separate published evidence.
- The actual chapter-lighting and camera methods converge to the native shader's key vector, preserve frontal irradiance and keep the existing light count. The exact R2214 parent fails the direction regression. This is source/math validation; rendered quality and hardware motion need separate evidence.
- The actual bundled Three r185 scene builders and animation methods retain both living supporting branches during the biological chapter and retire them completely after the existing fade.
- Mobile and desktop geometry attribute/index buffers remain unchanged.
- The exact parent fails the new retirement regression because its organic branch remains visible after the chapter ends.
- Browser frame/resource counts, complete CI and production validation must be read for the published commit in [PR577](https://github.com/hutoczky/FormatX/pull/577). The source-level checks do not certify GPU speed or normal-clock frame rate.

## Known incomplete work

- Current parent `0b1dea39` has 25 successful workflows, 1 Lighthouse failure and 1 conditional skip; all 31 jobs and 312 steps have been inspected. Its seven optical cases and two genuine WebGL1 observations pass, retaining 4-sample film MSAA and 30 final draws. Mobile Lighthouse TBT is 1175–1287 ms; all six TBT and all three mobile FCP values miss the requested targets. Its real-clock software fallback still completes at about 10.7 seconds; reduced mobile completion is 1339.8 ms. These are parent observations, not R2217 acceptance.
- Current parent `d612c02f` has 25 successful workflows, 1 Lighthouse failure and 1 conditional skip; all 31 jobs and 312 steps have been inspected. Its seven optical cases keep 4-sample MSAA and 30 final draws, with actual uploaded key-direction error below 1.2e-8. Its mobile Lighthouse TBT is 881–946 ms and FCP is 1857–1858 ms. Normal software fallback still runs about 10–11 seconds; the mobile handoff completion was the existing absolute DOM watchdog. These are parent observations, not R2216 acceptance.
- Full visual continuity between the cinematic and permanent MAG still needs comparison against the supplied reference images.
- Normal hardware-backed Three motion, requested timing ranges, six complete Lighthouse 100/100/100/100 results and production parity remain unverified or unmet.
- The current parent `aa51b596` has 25 successful workflows, 1 Lighthouse failure and 1 conditional skip. Its 31 jobs and 312 steps have been inspected; the seven optical cases measure final draw calls 453 → 30 while retaining 4-sample MSAA. Its software reference-film fallback still completes in about 10–11 seconds. Mobile Lighthouse TBT is 385–428 ms, with first paint around 1.84 seconds. The audit loads the unchanged native renderer and does not request the Three film; no causal Lighthouse speedup is attributed to chapter retirement.
- The historical `2c7840bf` has 24 successful workflows, 2 failures and 1 conditional skip, including Lighthouse and a scroll-source mismatch (`bottom-drawer` expected, `left-shelf` observed). The original archive run passes on `aa51b596`; this does not establish a causal archive repair.
- Fresh master `4424c4fd` production validation succeeds, but its deployment job fails the desktop DNA-to-MAG browser proof after the earlier deployment steps. This is not a clean release acceptance.
- No assertions, case deadlines, clocks, GPU guards or renderer fallbacks are relaxed to obtain green results.

## Next verification

Inspect the published candidate's original WebGL images, actual draw counts, handoff/reduced/fallback/zero-idle regressions and all applicable CI jobs/steps. Continue the remaining visual and motion work before claiming final quality or release acceptance.
