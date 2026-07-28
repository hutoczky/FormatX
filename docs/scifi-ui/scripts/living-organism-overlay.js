// Lightweight living organism overlay for the FormatX WebGPU stage.
// Uses compositor-friendly CSS transforms only: no extra canvas and no RAF loop.
(() => {
  'use strict';

  if (document.getElementById('fx-living-organism')) return;

  const style = document.createElement('style');
  style.textContent = `
    :root {
      --organism-x: 54%;
      --organism-y: 48%;
      --organism-size: min(48vmin, 540px);
    }

    body {
      position: relative;
      isolation: isolate;
    }

    #fx-living-organism {
      position: fixed;
      z-index: 20;
      left: var(--organism-x);
      top: var(--organism-y);
      width: var(--organism-size);
      aspect-ratio: .78;
      pointer-events: none;
      transform: translate(-50%, -50%);
      contain: layout paint style;
      will-change: transform;
    }

    #fx-living-organism .fx-organism-mask {
      position: absolute;
      z-index: -2;
      inset: -25%;
      border-radius: 50%;
      background: radial-gradient(ellipse at center,
        rgba(1, 3, 7, .995) 0 47%,
        rgba(1, 4, 8, .94) 58%,
        rgba(1, 4, 8, .62) 70%,
        transparent 84%);
    }

    #fx-living-organism .fx-organism-aura {
      position: absolute;
      z-index: -1;
      inset: -14%;
      border-radius: 50%;
      background: radial-gradient(ellipse at center,
        rgba(72, 248, 239, .19),
        rgba(0, 188, 214, .09) 42%,
        transparent 72%);
      opacity: .9;
      transform: scale(.94);
      animation: fx-organism-aura 4.8s ease-in-out infinite;
    }

    #fx-living-organism .fx-organism-body {
      position: absolute;
      inset: 1%;
      overflow: hidden;
      border: 1px solid rgba(220, 254, 255, .52);
      border-radius: 46% 54% 48% 52% / 40% 44% 56% 60%;
      background:
        radial-gradient(ellipse at 48% 47%, rgba(215, 255, 252, .66) 0 2%, transparent 6%),
        radial-gradient(ellipse at 48% 48%, rgba(0, 255, 224, .32) 0 22%, rgba(0, 185, 207, .28) 39%, rgba(0, 46, 59, .52) 67%, rgba(1, 7, 12, .96) 100%);
      box-shadow:
        inset 0 0 24px rgba(225, 255, 255, .44),
        inset 0 0 88px rgba(0, 218, 224, .27),
        0 0 26px rgba(137, 243, 255, .34),
        0 0 72px rgba(0, 174, 201, .22);
      transform-origin: 50% 54%;
      animation: fx-organism-breathe 5.2s cubic-bezier(.42, 0, .3, 1) infinite;
    }

    #fx-living-organism .fx-organism-body::before,
    #fx-living-organism .fx-organism-body::after {
      content: "";
      position: absolute;
      inset: 7%;
      border-radius: inherit;
      pointer-events: none;
    }

    #fx-living-organism .fx-organism-body::before {
      background:
        conic-gradient(from 35deg at 50% 52%,
          transparent 0 5%, rgba(211, 255, 250, .56) 7% 9%, transparent 12% 19%,
          rgba(45, 246, 225, .25) 22% 27%, transparent 30% 38%,
          rgba(221, 255, 253, .48) 41% 44%, transparent 47% 55%,
          rgba(35, 218, 229, .27) 58% 64%, transparent 67% 75%,
          rgba(224, 255, 253, .54) 79% 82%, transparent 86% 100%);
      opacity: .84;
      transform: rotate(-8deg) scale(.94, 1.04);
      animation: fx-organism-tissue 13s ease-in-out infinite alternate;
    }

    #fx-living-organism .fx-organism-body::after {
      inset: 12% 18%;
      background:
        radial-gradient(ellipse at 50% 55%, rgba(0, 255, 224, .38), transparent 38%),
        repeating-radial-gradient(ellipse at 50% 50%,
          rgba(183, 255, 250, .18) 0 1px,
          transparent 2px 19px);
      opacity: .72;
      transform: rotate(7deg);
      animation: fx-organism-fluid 9s ease-in-out infinite alternate;
    }

    #fx-living-organism .fx-organism-heart {
      position: absolute;
      z-index: 3;
      left: 50%;
      top: 52%;
      width: 26%;
      aspect-ratio: .86;
      border-radius: 48% 52% 46% 54% / 42% 44% 58% 56%;
      background:
        radial-gradient(circle at 45% 38%, rgba(240, 255, 255, .98) 0 4%, transparent 9%),
        radial-gradient(ellipse at center, rgba(74, 255, 224, .9), rgba(0, 196, 214, .62) 44%, rgba(0, 67, 83, .1) 70%);
      box-shadow:
        inset 0 0 17px rgba(255, 255, 255, .7),
        0 0 18px rgba(130, 255, 244, .76),
        0 0 52px rgba(0, 236, 225, .5);
      transform: translate(-50%, -50%);
      transform-origin: 50% 58%;
      animation: fx-organism-heartbeat 1.7s cubic-bezier(.2, .7, .25, 1) infinite;
    }

    #fx-living-organism .fx-organism-heart::before,
    #fx-living-organism .fx-organism-heart::after {
      content: "";
      position: absolute;
      width: 48%;
      height: 82%;
      top: -36%;
      border-radius: 999px;
      background: linear-gradient(180deg, rgba(210, 255, 252, .76), rgba(0, 229, 220, .16), transparent);
      transform-origin: 50% 100%;
    }

    #fx-living-organism .fx-organism-heart::before {
      left: 16%;
      transform: rotate(-24deg);
    }

    #fx-living-organism .fx-organism-heart::after {
      right: 13%;
      transform: rotate(28deg);
    }

    #fx-living-organism .fx-organism-veins {
      position: absolute;
      z-index: 2;
      inset: 7%;
      width: 86%;
      height: 86%;
      overflow: visible;
      opacity: .78;
      filter: drop-shadow(0 0 4px rgba(92, 255, 242, .52));
      animation: fx-organism-veins 6.4s ease-in-out infinite alternate;
    }

    #fx-living-organism .fx-organism-veins path {
      fill: none;
      stroke: rgba(162, 255, 248, .62);
      stroke-width: 1.15;
      stroke-linecap: round;
      vector-effect: non-scaling-stroke;
    }

    #fx-living-organism .fx-organism-veins path:nth-child(2n) {
      stroke: rgba(31, 232, 224, .44);
      stroke-width: .8;
    }

    #fx-living-organism .fx-organism-membrane {
      position: absolute;
      z-index: 4;
      inset: -1%;
      border-radius: 45% 55% 49% 51% / 41% 45% 55% 59%;
      border: 2px solid rgba(226, 255, 255, .4);
      box-shadow:
        inset 13px 0 22px rgba(228, 255, 255, .13),
        inset -15px 2px 26px rgba(28, 241, 232, .12),
        0 0 14px rgba(199, 255, 255, .26);
      opacity: .84;
      animation: fx-organism-membrane 7.8s ease-in-out infinite alternate;
    }

    @keyframes fx-organism-breathe {
      0%, 100% { transform: scale(.975, 1.015) rotate(-1.8deg); }
      48% { transform: scale(1.025, .985) rotate(1.4deg); }
      62% { transform: scale(1.006, 1.004) rotate(.4deg); }
    }

    @keyframes fx-organism-heartbeat {
      0%, 54%, 100% { transform: translate(-50%, -50%) scale(.94); }
      60% { transform: translate(-50%, -50%) scale(1.12, 1.08); }
      67% { transform: translate(-50%, -50%) scale(.98); }
      73% { transform: translate(-50%, -50%) scale(1.055); }
      80% { transform: translate(-50%, -50%) scale(.96); }
    }

    @keyframes fx-organism-aura {
      0%, 100% { opacity: .48; transform: scale(.9); }
      50% { opacity: .92; transform: scale(1.06); }
    }

    @keyframes fx-organism-tissue {
      from { transform: rotate(-10deg) scale(.92, 1.045); opacity: .66; }
      to { transform: rotate(8deg) scale(1.04, .96); opacity: .9; }
    }

    @keyframes fx-organism-fluid {
      from { transform: rotate(8deg) translate3d(-2%, 1%, 0); opacity: .48; }
      to { transform: rotate(-7deg) translate3d(2%, -1%, 0); opacity: .82; }
    }

    @keyframes fx-organism-veins {
      from { transform: scale(.98, 1.02) rotate(-1deg); opacity: .56; }
      to { transform: scale(1.02, .98) rotate(1deg); opacity: .9; }
    }

    @keyframes fx-organism-membrane {
      from { transform: scale(.992, 1.008) rotate(-.8deg); border-radius: 45% 55% 49% 51% / 41% 45% 55% 59%; }
      to { transform: scale(1.012, .988) rotate(.9deg); border-radius: 52% 48% 55% 45% / 47% 54% 46% 53%; }
    }

    @media (max-width: 820px), (pointer: coarse) {
      :root {
        --organism-x: 52%;
        --organism-y: 45%;
        --organism-size: min(62vmin, 420px);
      }

      #fx-living-organism .fx-organism-veins {
        opacity: .58;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #fx-living-organism *,
      #fx-living-organism *::before,
      #fx-living-organism *::after {
        animation: none !important;
      }
    }
  `;

  const organism = document.createElement('div');
  organism.id = 'fx-living-organism';
  organism.setAttribute('aria-hidden', 'true');
  organism.innerHTML = `
    <i class="fx-organism-mask"></i>
    <i class="fx-organism-aura"></i>
    <div class="fx-organism-body">
      <svg class="fx-organism-veins" viewBox="0 0 400 520" preserveAspectRatio="none" aria-hidden="true">
        <path d="M199 261 C152 220 122 166 115 92 M199 261 C244 214 280 161 294 85 M198 262 C142 279 98 334 83 426 M201 261 C256 284 301 338 319 430"/>
        <path d="M198 261 C178 194 182 126 204 48 M201 261 C219 331 218 402 196 478"/>
        <path d="M156 212 C130 197 107 174 91 145 M150 315 C123 330 105 356 93 390 M246 208 C274 190 294 168 309 139 M250 318 C278 337 297 365 308 397"/>
        <path d="M177 160 C151 145 139 119 133 91 M222 157 C248 142 261 116 268 88 M169 364 C144 380 134 409 132 437 M231 366 C256 384 266 413 269 443"/>
        <path d="M199 261 C166 250 139 248 112 255 M201 261 C234 250 264 249 292 259"/>
      </svg>
      <i class="fx-organism-heart"></i>
      <i class="fx-organism-membrane"></i>
    </div>
  `;

  document.head.appendChild(style);
  document.body.appendChild(organism);

  const syncVisibility = () => {
    organism.style.animationPlayState = document.hidden ? 'paused' : 'running';
  };
  document.addEventListener('visibilitychange', syncVisibility, { passive: true });
  syncVisibility();
})();
