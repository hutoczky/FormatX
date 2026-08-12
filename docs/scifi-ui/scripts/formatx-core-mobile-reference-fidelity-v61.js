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
        <stop offset="0" stop-color="#ffffff"/><stop offset=".12" stop-color="#8ff8ff"/><stop offset=".31" stop-color="#26dfff"/><stop offset=".48" stop-color="#5b9dff"/><stop offset=".64" stop-color="#d26cff"/><stop offset=".82" stop-color="#35dfff"/><stop offset="1" stop-color="#ffffff"/>
      </linearGradient>
      <linearGradient id="fx61-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#dfffff" stop-opacity=".24"/><stop offset=".18" stop-color="#2bdfff" stop-opacity=".12"/><stop offset=".48" stop-color="#176dff" stop-opacity=".05"/><stop offset=".70" stop-color="#a643ff" stop-opacity=".10"/><stop offset="1" stop-color="#eaffff" stop-opacity=".18"/>
      </linearGradient>
      <linearGradient id="fx61-glass-violet" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".17"/><stop offset=".32" stop-color="#58eaff" stop-opacity=".08"/><stop offset=".64" stop-color="#8c4dff" stop-opacity=".12"/><stop offset="1" stop-color="#22dfff" stop-opacity=".06"/>
      </linearGradient>
      <linearGradient id="fx61-axis" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#00bfff" stop-opacity=".10"/><stop offset=".25" stop-color="#4deaff"/><stop offset=".47" stop-color="#ffffff"/><stop offset=".53" stop-color="#ffffff"/><stop offset=".74" stop-color="#c85cff"/><stop offset="1" stop-color="#00cfff" stop-opacity=".10"/>
      </linearGradient>
      <radialGradient id="fx61-reactor">
        <stop offset="0" stop-color="#ffffff"/><stop offset=".12" stop-color="#f4ffff"/><stop offset=".28" stop-color="#8cffff" stop-opacity=".96"/><stop offset=".50" stop-color="#18bfff" stop-opacity=".58"/><stop offset=".74" stop-color="#733cff" stop-opacity=".26"/><stop offset="1" stop-color="#00182f" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="fx61-halo">
        <stop offset="0" stop-color="#13dfff" stop-opacity=".15"/><stop offset=".36" stop-color="#168fff" stop-opacity=".085"/><stop offset=".67" stop-color="#783fff" stop-opacity=".05"/><stop offset="1" stop-color="#001020" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="fx61-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#43e8ff" stop-opacity=".11"/><stop offset=".34" stop-color="#2f8cff" stop-opacity=".055"/><stop offset=".70" stop-color="#733fff" stop-opacity=".025"/><stop offset="1" stop-color="#00101f" stop-opacity="0"/>
      </linearGradient>
      <filter id="fx61-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="fx61-glow-small" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="fx61-glass-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.15"/></filter>
    </defs>

    <circle cx="500" cy="600" r="452" fill="url(#fx61-halo)"/>

    <g class="fx61-floor" opacity=".42">
      <ellipse cx="500" cy="1092" rx="420" ry="78" fill="url(#fx61-floor)"/>
      <path d="M125 1072H875 M165 1092H835 M205 1112H795 M250 1132H750 M302 1152H698" stroke="#3ddfff" stroke-width="1.1" stroke-opacity=".10"/>
      <path d="M500 1052L220 1188 M500 1052L780 1188 M500 1052L355 1188 M500 1052L645 1188" stroke="#4e8fff" stroke-width="1" stroke-opacity=".055"/>
    </g>

    <g class="fx61-halo-rings" fill="none" transform-origin="500px 600px">
      <circle cx="500" cy="600" r="326" stroke="#168cff" stroke-width="1.5" stroke-opacity=".10" stroke-dasharray="150 22 42 36"/>
      <circle cx="500" cy="600" r="385" stroke="#884cff" stroke-width="1.4" stroke-opacity=".08" stroke-dasharray="116 38 28 44"/>
      <circle cx="500" cy="600" r="444" stroke="#2adfff" stroke-width="1.1" stroke-opacity=".055" stroke-dasharray="64 39"/>
    </g>

    <g class="fx61-crystal-volume" stroke-linejoin="round" stroke-linecap="round">
      <path d="M500 138 C545 286 664 432 914 600 C669 700 568 840 500 1085 C432 840 331 700 86 600 C336 432 455 286 500 138Z" fill="url(#fx61-glass)" fill-opacity=".38" stroke="none"/>
      <path d="M500 164 C522 324 603 461 846 600 C610 716 538 830 500 1048 C462 830 390 716 154 600 C397 461 478 324 500 164Z" fill="url(#fx61-glass-violet)" fill-opacity=".34" stroke="#6defff" stroke-width="1.2" stroke-opacity=".12"/>
      <path d="M500 182 L500 600 L148 600 C332 507 435 375 500 182Z" fill="#62ecff" fill-opacity=".048" stroke="#dbffff" stroke-width="2.0" stroke-opacity=".23"/>
      <path d="M500 182 L852 600 L500 600 C565 375 668 507 852 600Z" fill="#8266ff" fill-opacity=".045" stroke="#eefcff" stroke-width="1.8" stroke-opacity=".20"/>
      <path d="M500 600 L852 600 C666 704 560 842 500 1048Z" fill="#7745ff" fill-opacity=".05" stroke="#dbfaff" stroke-width="1.8" stroke-opacity=".18"/>
      <path d="M500 600 L500 1048 C440 842 334 704 148 600Z" fill="#28cfff" fill-opacity=".045" stroke="#e8ffff" stroke-width="1.8" stroke-opacity=".20"/>
    </g>

    <g class="fx61-crystal" fill="none" stroke-linejoin="round" stroke-linecap="round">
      <path d="M500 138 C545 286 664 432 914 600 C669 700 568 840 500 1085 C432 840 331 700 86 600 C336 432 455 286 500 138Z" stroke="#0d8fff" stroke-width="34" stroke-opacity=".11" filter="url(#fx61-glow)"/>
      <path d="M500 138 C545 286 664 432 914 600 C669 700 568 840 500 1085 C432 840 331 700 86 600 C336 432 455 286 500 138Z" stroke="url(#fx61-edge)" stroke-width="10" stroke-opacity=".78" filter="url(#fx61-glow-small)"/>
      <path d="M500 138 C545 286 664 432 914 600 C669 700 568 840 500 1085 C432 840 331 700 86 600 C336 432 455 286 500 138Z" stroke="#f4ffff" stroke-width="2.2" stroke-opacity=".86"/>
      <path d="M500 165 C526 326 610 458 850 600 C615 712 540 825 500 1048 C460 825 385 712 150 600 C390 458 474 326 500 165Z" stroke="#42eaff" stroke-width="3" stroke-opacity=".31"/>
      <path d="M500 200 C536 350 630 480 790 600 C630 722 552 820 500 1007 C448 820 370 722 210 600 C370 480 464 350 500 200Z" stroke="#c35cff" stroke-width="2.2" stroke-opacity=".23" stroke-dasharray="62 20 25 17"/>
    </g>

    <g class="fx61-facets" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#fx61-glow-small)">
      <path d="M500 155 L454 320 L500 454 L547 330 L500 155" stroke="#eaffff" stroke-width="3.4" stroke-opacity=".42"/>
      <path d="M500 190 L390 430 L500 600 L610 430 L500 190" stroke="#48e9ff" stroke-width="2.6" stroke-opacity=".28"/>
      <path d="M104 600 L307 555 L500 600 L313 653 L104 600" stroke="#dfffff" stroke-width="3" stroke-opacity=".38"/>
      <path d="M896 600 L693 555 L500 600 L687 653 L896 600" stroke="#f7eaff" stroke-width="3" stroke-opacity=".36"/>
      <path d="M500 600 L420 742 L500 1025 L579 744 L500 600" stroke="#51eaff" stroke-width="3" stroke-opacity=".32"/>
      <path d="M500 600 L370 720 L500 945 L633 720 L500 600" stroke="#b85cff" stroke-width="2.3" stroke-opacity=".22"/>
      <path d="M242 512 L390 500 L500 600 L355 617 Z" stroke="#72f4ff" stroke-width="1.8" stroke-opacity=".20"/>
      <path d="M758 512 L610 500 L500 600 L645 617 Z" stroke="#c975ff" stroke-width="1.8" stroke-opacity=".20"/>
    </g>

    <g class="fx61-axes" filter="url(#fx61-glow-small)">
      <path d="M86 600H914" stroke="url(#fx61-axis)" stroke-width="5.5" stroke-opacity=".72"/>
      <path d="M500 138V1085" stroke="#43ebff" stroke-width="5.2" stroke-opacity=".66"/>
      <path d="M500 138V1085" stroke="#ffffff" stroke-width="1.25" stroke-opacity=".78"/>
      <path d="M86 600H914" stroke="#ffffff" stroke-width="1.2" stroke-opacity=".66"/>
    </g>

    <g class="fx61-filaments" fill="none" stroke-linecap="round">
      <path d="M500 600 C435 520 397 400 500 170" stroke="#78f7ff" stroke-width="3.1" stroke-opacity=".50"/>
      <path d="M500 600 C565 520 603 400 500 170" stroke="#34cfff" stroke-width="2.6" stroke-opacity=".42"/>
      <path d="M500 600 C410 544 295 523 105 600" stroke="#69edff" stroke-width="2.8" stroke-opacity=".43"/>
      <path d="M500 600 C590 544 705 523 895 600" stroke="#d46aff" stroke-width="2.8" stroke-opacity=".44"/>
      <path d="M500 600 C420 686 430 842 500 1066" stroke="#38dfff" stroke-width="2.9" stroke-opacity=".46"/>
      <path d="M500 600 C580 686 570 842 500 1066" stroke="#b553ff" stroke-width="2.6" stroke-opacity=".35"/>
      <path d="M500 600 C385 488 328 472 250 434" stroke="#bc64ff" stroke-width="2" stroke-opacity=".30"/>
      <path d="M500 600 C615 488 672 472 750 434" stroke="#54eeff" stroke-width="2.1" stroke-opacity=".34"/>
      <path d="M500 600 C375 716 336 755 273 805" stroke="#4feaff" stroke-width="2.1" stroke-opacity=".33"/>
      <path d="M500 600 C625 716 664 755 727 805" stroke="#d162ff" stroke-width="2" stroke-opacity=".31"/>
    </g>

    <g class="fx61-reactor-rings" fill="none" transform-origin="500px 600px" filter="url(#fx61-glow-small)">
      <circle cx="500" cy="600" r="62" stroke="#f6ffff" stroke-width="2.4" stroke-opacity=".52"/>
      <circle cx="500" cy="600" r="91" stroke="#4df3ff" stroke-width="4" stroke-opacity=".58"/>
      <circle cx="500" cy="600" r="122" stroke="#179fff" stroke-width="3.5" stroke-opacity=".48"/>
      <circle cx="500" cy="600" r="154" stroke="#c04dff" stroke-width="2.8" stroke-opacity=".38" stroke-dasharray="185 20 48 17"/>
      <circle cx="500" cy="600" r="185" stroke="#26dfff" stroke-width="2.6" stroke-opacity=".36" stroke-dasharray="88 18"/>
      <circle cx="500" cy="600" r="218" stroke="#267fff" stroke-width="1.8" stroke-opacity=".22" stroke-dasharray="44 22"/>
    </g>

    <g class="fx61-energy-cross" filter="url(#fx61-glow-small)">
      <path d="M500 548V652 M448 600H552" stroke="#ffffff" stroke-width="2.2" stroke-opacity=".82"/>
      <path d="M500 525V675 M425 600H575" stroke="#42eaff" stroke-width="5" stroke-opacity=".28"/>
    </g>
    <circle cx="500" cy="600" r="58" fill="url(#fx61-reactor)" filter="url(#fx61-glow)"/>
    <circle cx="500" cy="600" r="19" fill="#c9ffff" fill-opacity=".94" filter="url(#fx61-glow-small)"/>
    <circle cx="500" cy="600" r="9" fill="#ffffff"/>

    <g class="fx61-stars" fill="#efffff" filter="url(#fx61-glow-small)">
      <circle cx="500" cy="138" r="3.6"/><circle cx="914" cy="600" r="3.6"/><circle cx="500" cy="1085" r="3.6"/><circle cx="86" cy="600" r="3.6"/>
      <circle cx="330" cy="478" r="4"/><circle cx="694" cy="506" r="4.2"/><circle cx="616" cy="422" r="3.3"/><circle cx="390" cy="775" r="3.5"/><circle cx="688" cy="775" r="4"/>
      <circle cx="305" cy="612" r="3.2"/><circle cx="745" cy="603" r="3.2"/><circle cx="505" cy="360" r="4"/><circle cx="501" cy="900" r="4"/>
      <circle cx="417" cy="545" r="2.8"/><circle cx="575" cy="527" r="2.5"/><circle cx="450" cy="690" r="2.6"/><circle cx="603" cy="665" r="2.8"/>
    </g>
  `;
  const style=document.createElement('style');style.textContent=`
    .fx-core-mobile-v55-stage{background:radial-gradient(circle at 50% 49%,rgba(20,149,255,.12),transparent 39%),radial-gradient(circle at 54% 52%,rgba(135,60,255,.065),transparent 52%),linear-gradient(180deg,#010610,#010915 65%,#021426)!important;}
    .fx-core-fidelity-v61{position:absolute;z-index:4;inset:0;width:100%;height:100%;display:block;pointer-events:none;overflow:visible;mix-blend-mode:screen;}
    .fx61-reactor-rings{animation:fx61-spin 22s linear infinite}.fx61-halo-rings{animation:fx61-spin-rev 38s linear infinite}.fx61-stars{animation:fx61-pulse 3.1s ease-in-out infinite}.fx61-filaments{animation:fx61-shimmer 4.8s ease-in-out infinite}.fx61-facets{animation:fx61-facet 5.6s ease-in-out infinite}
    @keyframes fx61-spin{to{transform:rotate(360deg)}}@keyframes fx61-spin-rev{to{transform:rotate(-360deg)}}@keyframes fx61-pulse{50%{opacity:.58}}@keyframes fx61-shimmer{50%{opacity:.72}}@keyframes fx61-facet{50%{opacity:.74}}
    @media (prefers-reduced-motion:reduce){.fx61-reactor-rings,.fx61-halo-rings,.fx61-stars,.fx61-filaments,.fx61-facets{animation:none!important}}
  `;stage.append(svg,style);
  root.dataset.fxCoreFidelityV61='ready-v61';
  root.dataset.fxCoreReferenceFidelity='volumetric-glass-over-real-webgl2-v61-r9';
}
start();
}());