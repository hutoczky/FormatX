(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxCoreFidelityV61==='ready-v61'||root.dataset.fxCoreFidelityV61==='booting-v61')return;
root.dataset.fxCoreFidelityV61='booting-v61';
function start(attempt=0){
  const stage=document.querySelector('#hero .hero-space > .fx-core-mobile-v55-stage');
  if(!stage){if(attempt<180){requestAnimationFrame(()=>start(attempt+1));return;}root.dataset.fxCoreFidelityV61='stage-unavailable-v61';return;}
  stage.querySelectorAll('.fx-core-fidelity-v61').forEach(n=>n.remove());
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 1000 1200');
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  svg.setAttribute('aria-hidden','true');
  svg.classList.add('fx-core-fidelity-v61');
  svg.innerHTML=`
    <defs>
      <linearGradient id="fx61-edge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#eaffff"/><stop offset=".18" stop-color="#25eaff"/><stop offset=".42" stop-color="#35aaff"/><stop offset=".58" stop-color="#be68ff"/><stop offset=".78" stop-color="#22e6ff"/><stop offset="1" stop-color="#f4ffff"/>
      </linearGradient>
      <linearGradient id="fx61-axis" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#00bfff" stop-opacity=".15"/><stop offset=".26" stop-color="#63eaff"/><stop offset=".48" stop-color="#fff"/><stop offset=".54" stop-color="#fff"/><stop offset=".72" stop-color="#c54cff"/><stop offset="1" stop-color="#00cfff" stop-opacity=".15"/>
      </linearGradient>
      <radialGradient id="fx61-reactor">
        <stop offset="0" stop-color="#fff"/><stop offset=".14" stop-color="#efffff"/><stop offset=".32" stop-color="#58f5ff" stop-opacity=".95"/><stop offset=".58" stop-color="#128eff" stop-opacity=".52"/><stop offset=".82" stop-color="#7c35ff" stop-opacity=".22"/><stop offset="1" stop-color="#00182f" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="fx61-halo">
        <stop offset="0" stop-color="#18cfff" stop-opacity=".13"/><stop offset=".38" stop-color="#0c8fff" stop-opacity=".08"/><stop offset=".68" stop-color="#7135ff" stop-opacity=".05"/><stop offset="1" stop-color="#001020" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="fx61-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#16d9ff" stop-opacity=".14"/><stop offset=".34" stop-color="#167dff" stop-opacity=".07"/><stop offset=".72" stop-color="#5d32ff" stop-opacity=".025"/><stop offset="1" stop-color="#00101f" stop-opacity="0"/>
      </linearGradient>
      <filter id="fx61-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="fx61-glow-small" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect x="40" y="50" width="920" height="1100" rx="50" fill="#010711" fill-opacity=".22"/>
    <circle cx="500" cy="600" r="430" fill="url(#fx61-halo)"/>
    <g class="fx61-floor" opacity=".8">
      <ellipse cx="500" cy="1100" rx="430" ry="92" fill="url(#fx61-floor)"/>
      <path d="M80 1065H920 M120 1090H880 M155 1115H845 M190 1140H810 M225 1165H775 M270 1185H730" stroke="#22bfff" stroke-width="1.4" stroke-opacity=".15"/>
      <path d="M500 1050L190 1190 M500 1050L810 1190 M500 1050L340 1190 M500 1050L660 1190" stroke="#4b8fff" stroke-width="1" stroke-opacity=".08"/>
    </g>
    <g class="fx61-halo-rings" fill="none" transform-origin="500px 600px">
      <circle cx="500" cy="600" r="348" stroke="#168cff" stroke-width="2" stroke-opacity=".12"/>
      <circle cx="500" cy="600" r="402" stroke="#8545ff" stroke-width="1.6" stroke-opacity=".08" stroke-dasharray="140 24 48 35"/>
      <circle cx="500" cy="600" r="438" stroke="#22dfff" stroke-width="1.2" stroke-opacity=".07" stroke-dasharray="70 42"/>
    </g>
    <g class="fx61-crystal" fill="none" stroke-linejoin="round" stroke-linecap="round">
      <path d="M500 155 C540 300 653 440 902 600 C657 700 560 835 500 1075 C440 835 343 700 98 600 C347 440 460 300 500 155Z" stroke="#0d8fff" stroke-width="28" stroke-opacity=".13" filter="url(#fx61-glow)"/>
      <path d="M500 155 C540 300 653 440 902 600 C657 700 560 835 500 1075 C440 835 343 700 98 600 C347 440 460 300 500 155Z" stroke="url(#fx61-edge)" stroke-width="9" stroke-opacity=".72" filter="url(#fx61-glow-small)"/>
      <path d="M500 155 C540 300 653 440 902 600 C657 700 560 835 500 1075 C440 835 343 700 98 600 C347 440 460 300 500 155Z" stroke="#efffff" stroke-width="2.4" stroke-opacity=".82"/>
      <path d="M500 178 C518 322 590 456 842 600 C600 716 535 825 500 1040 C465 825 400 716 158 600 C410 456 482 322 500 178Z" stroke="#17dfff" stroke-width="3.2" stroke-opacity=".34"/>
      <path d="M500 208 C531 342 626 475 782 600 C626 726 548 820 500 1005 C452 820 374 726 218 600 C374 475 469 342 500 208Z" stroke="#a94fff" stroke-width="2.4" stroke-opacity=".25" stroke-dasharray="58 19 23 14"/>
    </g>
    <g class="fx61-axes" filter="url(#fx61-glow-small)">
      <path d="M98 600H902" stroke="url(#fx61-axis)" stroke-width="6.5" stroke-opacity=".78"/>
      <path d="M500 155V1075" stroke="#34e9ff" stroke-width="6" stroke-opacity=".70"/>
      <path d="M500 155V1075" stroke="#fff" stroke-width="1.5" stroke-opacity=".76"/>
      <path d="M98 600H902" stroke="#fff" stroke-width="1.4" stroke-opacity=".62"/>
    </g>
    <g class="fx61-filaments" fill="none" stroke-linecap="round">
      <path d="M500 600 C430 520 398 404 500 178" stroke="#73f5ff" stroke-width="3.3" stroke-opacity=".54"/>
      <path d="M500 600 C570 520 602 404 500 178" stroke="#36cfff" stroke-width="2.8" stroke-opacity=".47"/>
      <path d="M500 600 C405 545 292 522 116 600" stroke="#5eeaff" stroke-width="3.2" stroke-opacity=".48"/>
      <path d="M500 600 C595 545 708 522 884 600" stroke="#d15aff" stroke-width="3.2" stroke-opacity=".48"/>
      <path d="M500 600 C416 680 424 835 500 1055" stroke="#37dfff" stroke-width="3.1" stroke-opacity=".50"/>
      <path d="M500 600 C584 680 576 835 500 1055" stroke="#a94aff" stroke-width="2.8" stroke-opacity=".38"/>
      <path d="M500 600 C382 486 330 470 258 438" stroke="#b655ff" stroke-width="2.2" stroke-opacity=".34"/>
      <path d="M500 600 C618 486 670 470 742 438" stroke="#42eaff" stroke-width="2.4" stroke-opacity=".40"/>
      <path d="M500 600 C372 716 334 752 272 798" stroke="#42dfff" stroke-width="2.4" stroke-opacity=".38"/>
      <path d="M500 600 C628 716 666 752 728 798" stroke="#cf55ff" stroke-width="2.2" stroke-opacity=".34"/>
    </g>
    <g class="fx61-reactor-rings" fill="none" transform-origin="500px 600px" filter="url(#fx61-glow-small)">
      <circle cx="500" cy="600" r="70" stroke="#efffff" stroke-width="3.2" stroke-opacity=".60"/>
      <circle cx="500" cy="600" r="104" stroke="#32f0ff" stroke-width="5" stroke-opacity=".62"/>
      <circle cx="500" cy="600" r="138" stroke="#169fff" stroke-width="4" stroke-opacity=".52"/>
      <circle cx="500" cy="600" r="171" stroke="#b542ff" stroke-width="3.2" stroke-opacity=".42" stroke-dasharray="210 20 54 16"/>
      <circle cx="500" cy="600" r="204" stroke="#20dfff" stroke-width="3" stroke-opacity=".40" stroke-dasharray="95 18"/>
      <circle cx="500" cy="600" r="238" stroke="#2688ff" stroke-width="2" stroke-opacity=".25" stroke-dasharray="48 24"/>
    </g>
    <circle cx="500" cy="600" r="80" fill="url(#fx61-reactor)" filter="url(#fx61-glow)"/>
    <circle cx="500" cy="600" r="25" fill="#bcfbff" fill-opacity=".95" filter="url(#fx61-glow-small)"/>
    <circle cx="500" cy="600" r="13" fill="#fff"/>
    <g class="fx61-stars" fill="#ecffff" filter="url(#fx61-glow-small)">
      <circle cx="500" cy="155" r="6"/><circle cx="902" cy="600" r="6"/><circle cx="500" cy="1075" r="6"/><circle cx="98" cy="600" r="6"/>
      <circle cx="330" cy="478" r="5"/><circle cx="694" cy="506" r="5"/><circle cx="616" cy="422" r="4"/><circle cx="390" cy="775" r="4"/><circle cx="688" cy="775" r="5"/>
      <circle cx="305" cy="612" r="4"/><circle cx="745" cy="603" r="4"/><circle cx="505" cy="360" r="5"/><circle cx="501" cy="900" r="5"/>
    </g>
  `;
  const style=document.createElement('style');style.textContent=`
    .fx-core-mobile-v55-stage{background:radial-gradient(circle at 50% 49%,rgba(20,149,255,.13),transparent 37%),radial-gradient(circle at 54% 52%,rgba(135,60,255,.07),transparent 50%),linear-gradient(180deg,#010610,#010915 64%,#021629)!important;}
    .fx-core-fidelity-v61{position:absolute;z-index:4;inset:0;width:100%;height:100%;display:block;pointer-events:none;overflow:visible;mix-blend-mode:screen;}
    .fx61-reactor-rings{animation:fx61-spin 20s linear infinite}.fx61-halo-rings{animation:fx61-spin-rev 34s linear infinite}.fx61-stars{animation:fx61-pulse 2.8s ease-in-out infinite}
    @keyframes fx61-spin{to{transform:rotate(360deg)}}@keyframes fx61-spin-rev{to{transform:rotate(-360deg)}}@keyframes fx61-pulse{50%{opacity:.66}}
    @media (prefers-reduced-motion:reduce){.fx61-reactor-rings,.fx61-halo-rings,.fx61-stars{animation:none!important}}
  `;stage.append(svg,style);
  root.dataset.fxCoreFidelityV61='ready-v61';
  root.dataset.fxCoreReferenceFidelity='emissive-vector-over-real-webgl2-v61';
}
start();
}());