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

The CI workflow enforces the following Lighthouse thresholds:

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.10
- TTFB (Time to First Byte): < 600ms

**Lighthouse Categories:**
- Performance: ≥ 90%
- Accessibility: ≥ 95%
- Best Practices: ≥ 95%
- SEO: ≥ 90%

Run Lighthouse CI:

```bash
npm install -g @lhci/cli
lhci autorun
```

The CI workflow runs automatically on pull requests and pushes to main/master branches that modify files under `docs/scifi-ui/`.

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
- Adds `role="status"` and `aria-live="polite"` to preloader container
- Preloads critical CSS/SVG assets via `fetch()` with `cache:'force-cache'`
- Shows LCARS-style boot bar with `role="progressbar"`
- Respects `prefers-reduced-motion` (100ms shortcut to completion)
- Updates `aria-valuenow` as resources load
- Sets `aria-hidden="true"` and hides preloader on completion
- Dispatches `CustomEvent('preloader:done')` when finished

**Accessible Features:**
- ARIA progressbar with live value updates
- `role="status"` and `aria-live="polite"` for screen reader announcements
- Visual boot animation (LCARS style)
- Reduced motion support with fast completion

### anim-controller.js

**Behavior:**
- Manages background SVG/CSS layers per theme
- Star Wars: HUD grid overlay with animated scanning line (2s linear animation)
- Cyberpunk: Neon noise overlay with shift animation
- LCARS: Minimal/none (clean interface)
- Applies gentle pointer parallax after preloader (disabled for reduced-motion)
- Listens for `theme:changed` and `preloader:done` events
- Activates theme-specific animations:
  - LCARS: 1.6s cubic-bezier(.2,.9,.2,1) transitions
  - Star Wars: 1.8s ease-in-out with HUD class activation
  - Cyberpunk: 1.2s steps(6,end) with 'glitch' class
- Sets loader-sample `.bar` width to 100% and adds 'active' class on preloader:done

**Parallax:**
- Smooth lerp-based movement
- Theme-specific strength values
- Disabled when `prefers-reduced-motion: reduce`

## 📄 Assets & Licenses

### Created Assets

All visual assets are created with CSS and SVG:

- **hud-grid.svg**: Minimal Star Wars-style HUD grid (original work)
- **lcars-panels.svg**: LCARS-style decorative panels placeholder (original work)
- **hologram-activation.svg**: Holographic activation effect placeholder (original work)
- **CSS animations**: All effects implemented in pure CSS
- **Fonts**: System font stacks used (no external fonts loaded)

### Asset Inventory

- **SVG Files**: 3 original placeholder files (hud-grid, lcars-panels, hologram-activation)
- **Images**: Empty directory with .gitkeep (ready for WebP/AVIF assets)
- **Fonts**: Empty directory with .gitkeep; using system font stacks
- **Audio**: Empty directory with .gitkeep (optional ambient sounds)

### Fonts Used

System fallbacks (no licensing required):
- LCARS: `"Eurostile", "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif`
- Star Wars: `"Orbitron", "Roboto Mono", ui-monospace, system-ui, monospace`
- Cyberpunk: `"OCR-A", "VT323", ui-monospace, monospace`

**Font Preloading**: Font preload tags are commented in `index.html` until licensed fonts are added. See commented examples for woff2 format.

### No Unlicensed IP

This demo does **NOT** include:
- Trademarked logos or symbols (e.g., Starfleet insignia, Star Wars emblems)
- Copyrighted imagery from films/shows
- Licensed sound effects or music
- Proprietary typefaces
- Star Trek ship designs (enterprise.svg removed in commit 4)

All designs are inspired aesthetics created from scratch using generic geometric shapes and color schemes.

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

- [x] Demo works from `/docs` with redirect active
- [x] Available at `https://hutoczky.github.io/FormatX/scifi-ui/`
- [x] Live theme swapping without page reload
- [x] CustomEvent dispatched on theme change
- [x] Theme selection persisted to localStorage
- [x] Preloader runs with accessible progress bar
- [x] Animation controller activates background layers
- [x] Reduced motion preference honored
- [x] Visual parity with mockups (±5%)
- [x] Lighthouse CI workflow configured
- [x] Accessibility thresholds met (axe/Lighthouse)
- [x] No unlicensed IP used
- [x] Complete directory structure with .gitkeep files
- [x] Comprehensive documentation

## 📞 Support

For issues or questions, please open an issue on the [GitHub repository](https://github.com/hutoczky/FormatX/issues).

## 📜 License

This demo is part of the FormatX project. See the main repository LICENSE for details.

---

**Built with ❤️ using pure CSS, SVG, and vanilla JavaScript**
