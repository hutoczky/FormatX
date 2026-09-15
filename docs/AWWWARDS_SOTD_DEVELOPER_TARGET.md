# FormatX — Awwwards SOTD / Developer Award target

This document is the non-negotiable completion specification for the public FormatX experience. A technical green build alone is not sufficient. The target is an Igloo-class or stronger cinematic experience with a real product, evidence layer, accessibility and stable performance.

## Completion rule

The project may be called **100% complete** only when every required gate below is verified on the production candidate and the deployed canonical site. External Awwwards jury scores are not under repository control and must never be represented as guaranteed.

## 1. Unified art direction
- [ ] Every section belongs to the same Living System / digital-organism world.
- [ ] MAG, nervous system, organs, commercial heart, safety skeleton and beacon each have a distinct visual role.
- [ ] No generic/template section remains.

## 2. Continuous cinematic journey
- [ ] Section transitions read as one continuous composition.
- [ ] Scroll drives camera, light, depth and layer state without breaking native input.
- [ ] Transitions are choreographed rather than isolated animation demos.

## 3. WebGL / shader quality
- [ ] Native depth/parallax is visible and useful.
- [ ] Shader lighting, controlled glow, refraction and energy flow are premium but restrained.
- [ ] Particle/network effects are GPU-budgeted.
- [ ] Canvas/CSS fallback remains functional when WebGL is unavailable.

## 4. Motion design
- [ ] Consistent premium easing and velocity response.
- [ ] Entrance/exit, hover, focus, press and drag states are intentional.
- [ ] Mobile motion is separately tuned.
- [ ] `prefers-reduced-motion` has complete functional parity without decorative motion.

## 5. Hero
- [ ] First 3–5 seconds communicate award-level craft immediately.
- [ ] MAG is the strong central 3D object without excessive bloom or razor edges.
- [ ] Mouse/touch/scroll interaction is immediate and stable.
- [ ] The product category is instantly clear: **FormatX = Technician Operating Layer / Technikusi operációs réteg**.

## 6. Typography
- [ ] Unified display + UI type system.
- [ ] Strong hierarchy, line-height, tracking and kerning.
- [ ] Mobile typography has dedicated tuning.
- [ ] No overflow, clipping or accidental wrapping.

## 7. Pixel-precise responsive system
- [ ] 320 px minimum width.
- [ ] Mobile portrait and landscape.
- [ ] Tablet.
- [ ] 1080p / 1440p / 4K.
- [ ] Ultrawide.
- [ ] Mobile is a deliberate composition, not compressed desktop.

## 8. Microinteractions
- [ ] Buttons, language switch, cards, pricing, tooltip, navigation, Live OS and diagnostics all expose clear interaction feedback.
- [ ] Focus and press states are visible and consistent.

## 9. Live OS integration
- [ ] Live OS reads as an active organ of the site, not a detached demo widget.
- [ ] Commands visibly influence surrounding system state where meaningful.
- [ ] Terminal state and visual system state remain synchronized.

## 10. Proof / evidence layer
- [ ] Release hash and build ID.
- [ ] CI state.
- [ ] Lighthouse evidence.
- [ ] Version and platform support.
- [ ] Checksum/signature truth.
- [ ] Test matrix.
- [ ] Premium visual presentation without invented claims.

## 11. Accessibility
- [ ] WCAG AA minimum.
- [ ] Lighthouse Accessibility 100.
- [ ] Complete keyboard navigation and visible focus.
- [ ] Correct landmarks and skip link.
- [ ] ARIA only where semantically required.
- [ ] Screen-reader compatible.
- [ ] 200% zoom usable.
- [ ] Reduced-motion and no-JS/fallback paths are usable.

## 12. Lighthouse stability
Required on **desktop and mobile, three consecutive runs**:
- [ ] Performance = 100 target; repository hard gate may not be weakened to create a pass.
- [ ] Accessibility = 100.
- [ ] Best Practices = 100.
- [ ] SEO = 100.
- [ ] No audit-only visual downgrade.

## 13. Core Web Vitals
- [ ] LCP < 2.0 s target.
- [ ] CLS near zero.
- [ ] INP < 200 ms target.
- [ ] Low TTFB.
- [ ] WebGL does not block the first meaningful render.

## 14. Asset and runtime optimisation
- [ ] AVIF/WebP where appropriate.
- [ ] Texture compression where useful.
- [ ] Lazy loading and code splitting.
- [ ] Dynamic import for non-critical systems.
- [ ] Shader/3D assets deferred behind first paint where possible.
- [ ] Critical CSS minimized and stable.
- [ ] Font preload/subsetting only when it improves the measured path.

## 15. SEO / machine readability
- [ ] Canonical + HU/EN hreflang.
- [ ] Open Graph and social metadata.
- [ ] JSON-LD.
- [ ] Sitemap and robots.
- [ ] Correct heading structure.
- [ ] Important content statically readable.

## 16. Content quality
- [ ] Technical copy is reduced where visuals communicate the point better.
- [ ] Shorter, stronger section headlines.
- [ ] One clear message per section.
- [ ] HU and EN are equally professional.

## 17. Branding
- [ ] Recognizable FormatX visual language.
- [ ] Custom icon system.
- [ ] Consistent glow/light/network motifs.
- [ ] Consistent cursor/interaction language where pointer hardware supports it.
- [ ] Consistent sound/motion identity.

## 18. Audio
- [ ] Optional, restrained UI/haptic-like audio only.
- [ ] Muted/consent-respecting default behaviour.
- [ ] Easy mute control.
- [ ] Non-disruptive mobile behaviour.

## 19. Commercial trust
- [ ] Accurate operator/company/contact information available for the actual legal entity/owner model.
- [ ] Privacy, terms, support and licensing are accessible.
- [ ] Refund/licence conditions are explicit where applicable.
- [ ] Security information and a genuine contact route are visible.

## 20. External credibility
- [ ] GitHub release/activity is real and linked.
- [ ] Third-party reviews are displayed only when they actually exist.
- [ ] Product Hunt / Hacker News / community coverage is pursued and cited only if real.
- [ ] User testimonials are genuine/moderated.
- [ ] Press/backlinks are never fabricated.

## 21. Award-specific internal scorecard
- [ ] Design.
- [ ] Usability.
- [ ] Creativity.
- [ ] Content.
- [ ] Developer Award technical quality.

## 22. Final QA matrix
- [ ] Chrome.
- [ ] Firefox.
- [ ] Safari.
- [ ] Edge.
- [ ] Android.
- [ ] iPhone/iOS Safari.
- [ ] Slower GPU profile.
- [ ] WebGL disabled.
- [ ] JavaScript disabled/readable fallback.
- [ ] Touch.
- [ ] Keyboard.
- [ ] 200% zoom.
- [ ] Weak-network profile.

## Current measured baseline before final SOTD pass
From the R487 production candidate Lighthouse run on 2026-08-31:
- Desktop Performance: 0.91 / 0.89 / 0.93.
- Mobile Performance: 0.84 / 0.78 / 0.78.
- Mobile Accessibility: 0.96 / 0.96 / 0.96.
- Mobile Total Blocking Time: approximately 586–949 ms.

These values are baseline evidence, not completion scores. The production gate remains intentionally strict.
