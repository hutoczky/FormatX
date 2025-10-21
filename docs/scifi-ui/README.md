# Sci-Fi UI Demo

A production-ready, accessible, and performant demonstration of three science fiction user interface themes: **LCARS** (Star Trek), **Star Wars** holographic HUD, and **Cyberpunk** neon aesthetics.

## 🎯 Goals

- Demonstrate theme-switchable UI design with live CSS swapping
- Showcase accessible, progressive enhancement patterns
- Provide a performant, production-ready reference implementation
- Illustrate pure CSS/SVG visual effects without unlicensed assets

## 📁 Structure

```
docs/scifi-ui/
├── index.html              # Main demo page (works without JS)
├── assets/
│   ├── images/             # WebP/AVIF optimized images (.gitkeep)
│   ├── svgs/               # Animated SVG assets (hud-grid.svg)
│   ├── fonts/              # Font files (.gitkeep, system fallbacks used)
│   └── audio/              # Optional ambient sounds (.gitkeep)
├── styles/
│   ├── base.css            # Reset, layout, components
│   ├── themes.css          # Shared helpers, focus rings, a11y
│   ├── lcars.css           # LCARS theme (Star Trek)
│   ├── starwars.css        # Star Wars holographic theme
│   └── cyberpunk.css       # Cyberpunk neon theme
├── scripts/
│   ├── theme-switcher.js   # Theme switching with CustomEvent
│   ├── preloader.js        # LCARS boot animation
│   └── anim-controller.js  # Background layers & parallax
├── manifests/
│   └── themes.json         # Theme metadata
└── README.md               # This file
```

## 🎨 Themes

### LCARS (Star Trek)
- **Default theme**
- Rounded orange/amber panels with magenta accents
- LCARS side rails and header plate
- Subtle sheen and glow effects
- Hero progress bar with darker right cap

### Star Wars
- Holographic cyan/teal color palette
- Animated HUD grid overlay
- Bluish glow and reticle/HUD lines
- Orbitron/Michroma font family aesthetic
- Scanning line animations

### Cyberpunk
- Neon magenta/cyan/yellow palette
- Pixel/mono title with glitch effects
- Steps-based micro-glitch animation
- Stronger scanlines and noise overlay
- Diagonal data stream effects

## 🚀 Deployment

### GitHub Pages

The demo is deployed via GitHub Pages from the `/docs` directory:

1. Repository settings → Pages → Source: `main` branch → `/docs` folder
2. Available at: `https://hutoczky.github.io/FormatX/scifi-ui/`
3. Root redirect at `/docs/index.html` forwards to `scifi-ui/`

### Local Development

Simply open `index.html` in a modern browser:

```bash
# Using Python's HTTP server
cd docs
python3 -m http.server 8000

# Using Node's http-server
npx http-server docs -p 8000

# Then visit: http://localhost:8000/scifi-ui/
```

## ♿ Accessibility

### Features

- **Progressive Enhancement**: Base UX works without JavaScript (LCARS theme active)
- **Keyboard Navigation**: Full keyboard support with Enter/Space handlers on theme buttons
- **ARIA Attributes**: 
  - `role="progressbar"` on preloader with `aria-valuenow/min/max`
  - `aria-pressed`/`aria-selected` on theme buttons
  - `aria-label` on interactive elements
  - `aria-hidden="true"` on decorative layers
- **Focus Rings**: High-contrast focus indicators for all interactive elements
- **Screen Reader Support**: Semantic HTML, skip-to-content link, descriptive labels
- **Reduced Motion**: Respects `prefers-reduced-motion` with simplified animations
- **High Contrast**: Supports `prefers-contrast: high` with enhanced borders

### Testing

Run accessibility audits:

```bash
# Using axe-core
npx @axe-core/cli docs/scifi-ui/index.html

# Using Lighthouse CLI
npx lighthouse http://localhost:8000/scifi-ui/ --view
```

## 📊 Performance

### Optimizations

- **Critical CSS Inline**: Above-the-fold styles inlined for LCP
- **Resource Preloading**: CSS and SVG assets preloaded
- **Lazy Loading**: Images loaded with `decoding="async"`
- **Image Formats**: WebP/AVIF with srcset for responsive images
- **SVG Optimization**: Minimal, optimized SVG for shapes/effects
- **CSP Headers**: Content Security Policy meta tag (self + data)

### Lighthouse Thresholds (CI)

The CI enforces these specific performance thresholds:

| Metric | Threshold | Description |
|--------|-----------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Time to render largest content element |
| **CLS** (Cumulative Layout Shift) | < 0.10 | Visual stability score |
| **TTFB** (Time to First Byte) | < 600ms | Server response time |
| Performance Score | ≥ 90% | Overall performance rating |
| Accessibility Score | ≥ 95% | WCAG compliance and a11y features |
| Best Practices Score | ≥ 95% | Security, standards compliance |
| SEO Score | ≥ 90% | Search engine optimization |

Run Lighthouse CI:

```bash
npm install -g @lhci/cli
lhci autorun
```

Run single Lighthouse audit:

```bash
npx lighthouse http://localhost:8000/scifi-ui/ \
  --view \
  --preset=desktop \
  --only-categories=performance,accessibility,best-practices,seo
```

## 🔧 JavaScript Modules

### theme-switcher.js

**Behavior:**
- Swaps `link#theme-css` href between theme stylesheets
- Persists selection to `localStorage` (key: `scifi-theme`)
- Sets `data-theme` attribute on `documentElement`
- Updates button `aria-pressed`/`aria-selected` states
- Dispatches `CustomEvent('theme:changed', {detail: {theme: name}})`

**Usage:**
```javascript
// Programmatically change theme
window.setTheme('starwars');

// Listen for theme changes
document.addEventListener('theme:changed', (e) => {
  console.log('Theme changed to:', e.detail.theme);
});
```

### preloader.js

**Behavior:**
- Preloads critical CSS/SVG assets
- Shows LCARS-style boot bar with `role="progressbar"`
- Respects `prefers-reduced-motion` (simplified indicator)
- Updates `aria-valuenow` as resources load
- Hides and dispatches `CustomEvent('preloader:done')` on completion

**Accessible Features:**
- ARIA progressbar with live value updates
- Visual boot animation (LCARS style)
- Status text for screen readers
- Reduced motion support

### anim-controller.js

**Behavior:**
- Manages background SVG/CSS layers per theme
- Star Wars: HUD grid overlay with animated scanning line
- Cyberpunk: Neon noise overlay with shift animation
- LCARS: Minimal/none (clean interface)
- Applies gentle pointer parallax after preloader (disabled for reduced-motion)
- Listens for `theme:changed` and `preloader:done` events

**Parallax:**
- Smooth lerp-based movement
- Theme-specific strength values
- Disabled when `prefers-reduced-motion: reduce`

## 📄 Assets & Licenses

### Asset License Matrix

| Asset Type | Location | Status | License | Notes |
|------------|----------|--------|---------|-------|
| **SVG Graphics** | `assets/svgs/` | ✅ Included | Original work | Created from scratch |
| `hud-grid.svg` | `assets/svgs/` | ✅ Included | Original work | Star Wars-style HUD grid (placeholder) |
| `lcars-panels.svg` | `assets/svgs/` | ✅ Included | Original work | LCARS-style side panels (placeholder) |
| `hologram-activation.svg` | `assets/svgs/` | ✅ Included | Original work | Holographic UI element (placeholder) |
| **Fonts** | `assets/fonts/` | ⏳ Placeholder | TBD | System fallbacks currently used |
| Eurostile | `assets/fonts/Eurostile.woff2` | ❌ Not included | Commercial | Requires license acquisition |
| Orbitron | `assets/fonts/Orbitron.woff2` | ⏳ Can add | SIL OFL 1.1 | Free to use, attribution required |
| OCR-A | `assets/fonts/OCR-A.woff2` | ⏳ Can add | Public domain | Free to use |
| **Images** | `assets/images/` | ⏳ Placeholder | N/A | WebP/AVIF optimized when added |
| **Audio** | `assets/audio/` | ⏳ Placeholder | N/A | Optional ambient sounds |

### Created Assets

All visual assets are created with CSS and SVG:

- **hud-grid.svg**: Minimal Star Wars-style HUD grid (original work)
- **lcars-panels.svg**: LCARS-style decorative panels (original work)
- **hologram-activation.svg**: Holographic UI activation element (original work)
- **CSS animations**: All effects implemented in pure CSS
- **Fonts**: System font stacks used (no external fonts loaded)

### Fonts Used

System fallbacks (no licensing required):
- LCARS: `"Eurostile", "Microgramma", "Orbitron", "Exo 2", system-ui`
- Star Wars: `"Share Tech Mono", "Orbitron", ui-monospace`
- Cyberpunk: `"OCR A", "Audiowide", "Exo 2", system-ui`

**To add licensed fonts:**
1. Acquire proper licenses for commercial fonts (e.g., Eurostile)
2. Place `.woff2` files in `assets/fonts/`
3. Uncomment font preload tags in `index.html`
4. Uncomment `@font-face` declarations in `styles/base.css`
5. Update this asset matrix with license details

### No Unlicensed IP

This demo does **NOT** include:
- Trademarked logos or symbols
- Copyrighted imagery from films/shows
- Licensed sound effects or music
- Proprietary typefaces

All designs are inspired aesthetics created from scratch.

## ✅ Testing Steps

### Manual Testing

1. **Theme Switching**
   - [ ] Click each theme button
   - [ ] Verify visual theme changes
   - [ ] Check localStorage persistence (refresh page)
   - [ ] Test keyboard navigation (Tab + Enter/Space)

2. **Preloader**
   - [ ] Verify boot animation appears on load
   - [ ] Check progress bar fills
   - [ ] Confirm preloader hides after completion

3. **Animation Controller**
   - [ ] Star Wars: Verify HUD grid overlay appears
   - [ ] Cyberpunk: Check neon noise overlay
   - [ ] Test parallax effect (mouse movement)
   - [ ] Verify reduced-motion disables animations

4. **Accessibility**
   - [ ] Tab through all interactive elements
   - [ ] Verify focus indicators visible
   - [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
   - [ ] Check ARIA states update correctly

5. **Responsive**
   - [ ] Test on mobile viewport (320px+)
   - [ ] Verify layout adapts correctly
   - [ ] Check touch interactions work

### Automated Testing

```bash
# Lighthouse audit
npx lighthouse http://localhost:8000/scifi-ui/ --view

# Axe accessibility audit
npx @axe-core/cli http://localhost:8000/scifi-ui/

# Run CI locally
npm install -g @lhci/cli
lhci autorun
```

## 🎓 Learning Resources

### Techniques Demonstrated

- **CSS Custom Properties**: Theme variables
- **CSS Grid/Flexbox**: Responsive layouts
- **SVG Animation**: Animated HUD elements
- **JavaScript Modules**: IIFE pattern, event-driven architecture
- **Progressive Enhancement**: Works without JS
- **Accessibility**: ARIA, keyboard navigation, reduced motion
- **Performance**: Critical CSS, resource hints, lazy loading
- **GitHub Actions**: Automated Lighthouse CI

### References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [web.dev - Performance](https://web.dev/performance/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)

## 📝 Acceptance Checklist

Use this checklist for PR reviews and deployment verification:

- [ ] docs/index.html redirect created and repository Pages set to main:/docs
- [ ] File structure committed as specified
- [ ] Theme CSS files contain the exact HEX values and keyframes
- [ ] theme-switcher: dispatches event and persists to localStorage
- [ ] preloader preloads critical resources and dispatches preloader:done
- [ ] anim-controller starts per-theme animations after preloader:done
- [ ] prefers-reduced-motion and ARIA attributes verified
- [ ] README includes asset list and licenses
- [ ] CI runs and Lighthouse thresholds are met

### Additional Verification

- [ ] Demo works from `/docs` with redirect active
- [ ] Available at `https://hutoczky.github.io/FormatX/scifi-ui/`
- [ ] Live theme swapping without page reload
- [ ] CustomEvent dispatched on theme change
- [ ] Theme selection persisted to localStorage
- [ ] Preloader runs with accessible progress bar
- [ ] Animation controller activates background layers
- [ ] Reduced motion preference honored
- [ ] Lighthouse CI workflow configured
- [ ] Accessibility thresholds met (axe/Lighthouse)
- [ ] No unlicensed IP used
- [ ] Complete directory structure with .gitkeep files
- [ ] Comprehensive documentation

## 📞 Support

For issues or questions, please open an issue on the [GitHub repository](https://github.com/hutoczky/FormatX/issues).

## 📜 License

This demo is part of the FormatX project. See the main repository LICENSE for details.

---

**Built with ❤️ using pure CSS, SVG, and vanilla JavaScript**
