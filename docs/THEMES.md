# FormatX Multi-Theme System

## Overview

FormatX features a sophisticated multi-theme system with franchise-inspired themes, each with unique color palettes, animations, and aesthetic elements.

## Available Themes

### 🖖 LCARS (Default - Star Trek inspired)
- **Colors**: Cyan (`#00eaff`), Purple (`#7c4dff`), Teal (`#00ffc6`)
- **Aesthetic**: Sleek Star Trek LCARS interface design
- **Intro Animation**: Smooth warp effect
- **Message**: "Initializing FormatX… — LCARS Online"

### 🌃 Cyberpunk 2077
- **Colors**: Hot Pink (`#ff003c`), Electric Blue (`#00f0ff`), Neon Yellow (`#fcee09`)
- **Aesthetic**: Dystopian neon-soaked cyberpunk
- **Intro Animation**: Digital glitch effect
- **Message**: "Initializing FormatX… — Jacking In..."

### ⚔️ Star Wars
- **Colors**: Jedi Blue (`#0d6efd`), Sith Red (`#dc3545`), Logo Gold (`#ffe81f`)
- **Aesthetic**: Classic Star Wars color scheme with lightsaber hues
- **Intro Animation**: Opening crawl perspective effect
- **Message**: "Initializing FormatX… — A long time ago..."

### 🌀 Stargate
- **Colors**: Wormhole Blue (`#4d9fff`), Orange (`#ff6b35`), Bright Cyan (`#00d4ff`)
- **Aesthetic**: Event horizon blues with orange accents
- **Intro Animation**: Chevron rotation and lock
- **Message**: "Initializing FormatX… — Chevrons Locked"

## Features

### ✨ Core Features
- **Four Complete Themes**: Each with unique color palettes and aesthetics
- **Theme-Specific Intro Animations**: Franchise-inspired loading animations
- **Persistent Selection**: Theme choice saved in localStorage
- **Dynamic CSS Injection**: themes.css loaded automatically by theme-loader.js
- **Theme Selector UI**: Easy-to-use dropdown menu in the navigation bar
- **Light Mode Support**: All four themes include light mode variants
- **Reduced-Motion Support**: Respects `prefers-reduced-motion` user preference
- **Smooth Transitions**: Seamless theme switching with CSS transitions

### 🎨 Technical Details

#### File Structure
```
docs/
├── index.html          # Includes theme-loader.js
├── styles.css          # Base styles with CSS variables
├── themes.css          # Theme definitions and animations
├── theme-loader.js     # Theme management and UI
└── script.js           # Main application logic
```

#### CSS Variables
Each theme defines the following CSS variables:
- `--bg`: Background color
- `--text`: Primary text color
- `--muted`: Secondary text color
- `--primary`: Primary accent color
- `--primary-2`: Secondary accent color
- `--accent`: Tertiary accent color
- `--glass`: Glass effect background
- `--glass-strong`: Stronger glass effect
- `--border`: Border color
- `--shadow`: Shadow effect
- `--theme-glow`: Theme-specific glow color
- `--theme-ring-1`, `--theme-ring-2`, `--theme-ring-3`: Ring colors for preloader
- `--theme-core`: Core color for preloader
- `--theme-scanline`: Scanline effect color

#### Theme Selection API
The theme system exposes a JavaScript API:
```javascript
// Get current theme
const currentTheme = window.FormatXThemes.getTheme();

// Set theme
window.FormatXThemes.setTheme('cyberpunk');

// Get available themes
const themes = window.FormatXThemes.themes;
// Returns: { lcars: 'LCARS', cyberpunk: 'Cyberpunk 2077', ... }

// Listen for theme changes
window.addEventListener('franchiseThemeChanged', (event) => {
  console.log('Theme changed to:', event.detail.theme);
});
```

## Usage

### For Users
1. Open the FormatX website
2. Click the "Téma" button in the navigation bar
3. Select your preferred theme from the dropdown
4. Your choice is automatically saved and will persist across visits

### For Developers

#### Adding a New Theme
1. Add theme definition in `themes.css`:
```css
:root[data-franchise-theme="mytheme"] {
  --bg: #000000;
  --text: #ffffff;
  /* ... other variables ... */
}
```

2. Add light mode variant:
```css
:root[data-theme="light"][data-franchise-theme="mytheme"] {
  /* light mode colors */
}
```

3. Add intro animation:
```css
@keyframes mytheme-intro {
  /* animation keyframes */
}

:root[data-franchise-theme="mytheme"] #preloader .warp-core {
  animation: mytheme-intro 1.5s ease forwards;
}
```

4. Add theme to `theme-loader.js`:
```javascript
const THEMES = {
  // ... existing themes ...
  mytheme: 'My Theme Name'
};
```

#### Customizing Existing Themes
Themes are defined using CSS custom properties (variables), making customization easy. Simply override the desired variables in a custom stylesheet loaded after `themes.css`.

## Accessibility

- **Reduced Motion**: All animations respect the `prefers-reduced-motion` media query
- **Keyboard Navigation**: Theme selector is fully keyboard accessible
- **ARIA Labels**: Proper ARIA labels for screen readers
- **Color Contrast**: All themes maintain sufficient color contrast ratios

## Browser Support

The multi-theme system works in all modern browsers that support:
- CSS Custom Properties (CSS Variables)
- ES6 JavaScript
- localStorage API
- CSS Grid and Flexbox

## Deployment

The theme system is ready for GitHub Pages deployment. When merged to the `master` branch:
1. GitHub Pages automatically publishes from the `docs` folder
2. All theme files are included and functional
3. No build step required - pure HTML, CSS, and JavaScript

## Testing

All features have been tested and verified:
- ✓ Theme switching functionality
- ✓ localStorage persistence
- ✓ Theme-specific animations
- ✓ Light mode variants
- ✓ Reduced-motion support
- ✓ Theme selector UI
- ✓ CSS variable inheritance
- ✓ Cross-browser compatibility

## License

Part of the FormatX project. See main LICENSE file for details.
