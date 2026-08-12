(function(){
'use strict';
const root=document.documentElement;
const VERSION='emissive-vector-over-real-webgl2-v61';
if(root.dataset.fxCoreFidelityV61==='ready-v61'||root.dataset.fxCoreFidelityV61==='booting-v61')return;
root.dataset.fxCoreFidelityV61='booting-v61';
root.dataset.fxCoreFidelityRevision='organic-glass-reference-r10';

function start(attempt=0){
  const stage=document.querySelector('#hero .hero-space > .fx-core-mobile-v55-stage');
  if(!stage){
    if(attempt<240){requestAnimationFrame(()=>start(attempt+1));return;}
    root.dataset.fxCoreFidelityV61='stage-unavailable-v61';
    return;
  }

  stage.querySelectorAll('.fx-core-fidelity-v61').forEach(n=>n.remove());
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 1000 1200');
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  svg.setAttribute('aria-hidden','true');
  svg.classList.add('fx-core-fidelity-v61');
  svg.dataset.renderer=VERSION;

  svg.innerHTML=`
  <defs>
    <linearGradient id="fx61-edge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".12" stop-color="#a7ffff"/>
      <stop offset=".30" stop-color="#27e5ff"/>
      <stop offset=".48" stop-color="#54a8ff"/>
      <stop offset=".66" stop-color="#d16cff"/>
      <stop offset=".84" stop-color="#3ee8ff"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="fx61-glass-a" x1=".08" y1="0" x2=".92" y2="1">
      <stop offset="0" stop-color="#efffff" stop-opacity=".34"/>
      <stop offset=".20" stop-color="#5ceeff" stop-opacity=".22"/>
      <stop offset=".46" stop-color="#257fff" stop-opacity=".08"/>
      <stop offset=".68" stop-color="#874fff" stop-opacity=".16"/>
      <stop offset="1" stop-color="#efffff" stop-opacity=".25"/>
    </linearGradient>
    <linearGradient id="fx61-glass-b" x1="1" y1=".08" x2="0" y2=".92">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".30"/>
      <stop offset=".26" stop-color="#51dfff" stop-opacity=".16"/>
      <stop offset=".56" stop-color="#194cff" stop-opacity=".07"/>
      <stop offset=".80" stop-color="#bd5aff" stop-opacity=".16"/>
      <stop offset="1" stop-color="#60efff" stop-opacity=".18"/>
    </linearGradient>
    <radialGradient id="fx61-reactor">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".10" stop-color="#ffffff"/>
      <stop offset=".24" stop-color="#9effff" stop-opacity=".98"/>
      <stop offset=".46" stop-color="#18d9ff" stop-opacity=".72"/>
      <stop offset=".66" stop-color="#445dff" stop-opacity=".38"/>
      <stop offset=".82" stop-color="#9b45ff" stop-opacity=".20"/>
      <stop offset="1" stop-color="#00172f" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="fx61-halo">
      <stop offset="0" stop-color="#28dfff" stop-opacity=".20"/>
      <stop offset=".40" stop-color="#147cff" stop-opacity=".09"/>
      <stop offset=".72" stop-color="#7f46ff" stop-opacity=".05"/>
      <stop offset="1" stop-color="#001020" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fx61-floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#62efff" stop-opacity=".18"/>
      <stop offset=".30" stop-color="#2d9dff" stop-opacity=".10"/>
      <stop offset=".62" stop-color="#723fff" stop-opacity=".05"/>
      <stop offset="1" stop-color="#00101f" stop-opacity="0"/>
    </linearGradient>
    <filter id="fx61-glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="fx61-glow-small" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="fx61-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5.5"/></filter>
  </defs>

  <circle cx="500" cy="605" r="445" fill="url(#fx61-halo)" opacity=".96"/>

  <g class="fx61-floor" opacity=".56">
    <ellipse cx="500" cy="1098" rx="412" ry="86" fill="url(#fx61-floor)" filter="url(#fx61-soft)"/>
    <ellipse cx="500" cy="1094" rx="355" ry="38" fill="#58e8ff" fill-opacity=".055"/>
    <path d="M102 1082H898 M155 1102H845 M214 1122H786 M278 1142H722" stroke="#47dfff" stroke-width="1.2" stroke-opacity=".10"/>
  </g>

  <g class="fx61-halo-rings" fill="none" transform-origin="500px 605px">
    <circle cx="500" cy="605" r="290" stroke="#2bdfff" stroke-width="1.8" stroke-opacity=".12" stroke-dasharray="126 26 40 18"/>
    <circle cx="500" cy="605" r="354" stroke="#7560ff" stroke-width="1.5" stroke-opacity=".10" stroke-dasharray="86 34 22 42"/>
    <circle cx="500" cy="605" r="420" stroke="#36ccff" stroke-width="1.3" stroke-opacity=".07" stroke-dasharray="52 31"/>
  </g>

  <g class="fx61-crystal-volume" stroke-linejoin="round" stroke-linecap="round">
    <path d="M500 128 C544 235 622 372 741 467 C812 523 874 562 931 602 C855 642 790 688 719 754 C617 849 550 958 500 1091 C451 960 383 850 281 756 C211 691 145 646 69 603 C128 561 190 521 261 465 C378 371 455 235 500 128Z" fill="url(#fx61-glass-a)" fill-opacity=".62"/>
    <path d="M500 154 C520 280 580 404 712 500 C775 546 823 575 872 603 C815 633 766 669 699 731 C603 819 542 914 500 1048 C457 915 396 819 301 731 C234 670 185 634 127 603 C177 575 226 546 288 500 C420 405 480 279 500 154Z" fill="url(#fx61-glass-b)" fill-opacity=".56" stroke="#86f7ff" stroke-width="1.3" stroke-opacity=".20"/>

    <path d="M500 152 C467 275 394 407 276 499 C219 543 159 577 87 603 C183 619 267 648 338 705 C414 766 463 851 500 1049 C527 848 575 764 656 701 C727 646 811 617 913 603 C839 574 779 541 722 497 C606 407 533 274 500 152Z" fill="#64e8ff" fill-opacity=".070"/>
    <path d="M500 171 C527 319 608 455 846 602 C625 723 544 829 500 1028 C456 829 374 723 154 602 C392 455 473 319 500 171Z" fill="#8f57ff" fill-opacity=".050"/>

    <path d="M500 139 C473 224 441 301 390 375 C351 432 296 482 221 523 C168 552 119 578 71 603 C140 593 212 584 278 564 C377 535 446 480 500 395Z" fill="#dffeff" fill-opacity=".075"/>
    <path d="M500 139 C527 224 559 301 610 375 C649 432 704 482 779 523 C832 552 881 578 929 603 C860 593 788 584 722 564 C623 535 554 480 500 395Z" fill="#84dbff" fill-opacity=".060"/>
    <path d="M70 603 C151 617 230 642 303 690 C390 747 446 836 500 1091 C472 871 422 781 347 720 C276 662 182 624 70 603Z" fill="#46dcff" fill-opacity=".055"/>
    <path d="M930 603 C849 617 770 642 697 690 C610 747 554 836 500 1091 C528 871 578 781 653 720 C724 662 818 624 930 603Z" fill="#a658ff" fill-opacity=".060"/>
  </g>

  <g class="fx61-crystal" fill="none" stroke-linejoin="round" stroke-linecap="round">
    <path d="M500 128 C544 235 622 372 741 467 C812 523 874 562 931 602 C855 642 790 688 719 754 C617 849 550 958 500 1091 C451 960 383 850 281 756 C211 691 145 646 69 603 C128 561 190 521 261 465 C378 371 455 235 500 128Z" stroke="#149cff" stroke-width="38" stroke-opacity=".10" filter="url(#fx61-glow)"/>
    <path d="M500 128 C544 235 622 372 741 467 C812 523 874 562 931 602 C855 642 790 688 719 754 C617 849 550 958 500 1091 C451 960 383 850 281 756 C211 691 145 646 69 603 C128 561 190 521 261 465 C378 371 455 235 500 128Z" stroke="url(#fx61-edge)" stroke-width="11" stroke-opacity=".93" filter="url(#fx61-glow-small)"/>
    <path d="M500 128 C544 235 622 372 741 467 C812 523 874 562 931 602 C855 642 790 688 719 754 C617 849 550 958 500 1091 C451 960 383 850 281 756 C211 691 145 646 69 603 C128 561 190 521 261 465 C378 371 455 235 500 128Z" stroke="#ffffff" stroke-width="2.15" stroke-opacity=".82"/>
  </g>

  <g class="fx61-facets" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#fx61-glow-small)">
    <path d="M500 143 C486 245 453 335 402 412 C454 387 489 342 500 292 C512 342 547 387 599 412 C548 335 515 245 500 143Z" stroke="#e8ffff" stroke-width="3.3" stroke-opacity=".48"/>
    <path d="M500 176 C468 344 417 463 303 548 C380 527 447 486 500 420 C553 486 620 527 697 548 C583 463 532 344 500 176Z" stroke="#56eaff" stroke-width="2.6" stroke-opacity=".33"/>
    <path d="M85 603 C249 584 374 551 500 603 C372 653 250 625 85 603Z" stroke="#efffff" stroke-width="3.0" stroke-opacity=".38"/>
    <path d="M915 603 C751 584 626 551 500 603 C628 653 750 625 915 603Z" stroke="#f7eaff" stroke-width="3.0" stroke-opacity=".36"/>
    <path d="M500 603 C450 722 439 847 500 1066 C561 847 550 722 500 603Z" stroke="#59ebff" stroke-width="3.2" stroke-opacity=".35"/>
    <path d="M500 603 C417 719 390 817 500 1015 C610 817 583 719 500 603Z" stroke="#c763ff" stroke-width="2.3" stroke-opacity=".24"/>

    <path d="M500 603 C430 535 368 500 294 470" stroke="#89faff" stroke-width="2" stroke-opacity=".24"/>
    <path d="M500 603 C570 535 632 500 706 470" stroke="#a96cff" stroke-width="2" stroke-opacity=".22"/>
    <path d="M500 603 C399 571 293 566 171 590" stroke="#6eeeff" stroke-width="1.8" stroke-opacity=".22"/>
    <path d="M500 603 C601 571 707 566 829 590" stroke="#d675ff" stroke-width="1.8" stroke-opacity=".20"/>
    <path d="M500 603 C430 680 381 750 338 847" stroke="#65edff" stroke-width="1.9" stroke-opacity=".22"/>
    <path d="M500 603 C570 680 619 750 662 847" stroke="#c35fff" stroke-width="1.9" stroke-opacity=".21"/>
  </g>

  <g class="fx61-filaments" fill="none" stroke-linecap="round">
    <path d="M500 603 C455 516 437 422 466 323 C478 281 489 230 500 157" stroke="#d9ffff" stroke-width="3.1" stroke-opacity=".56"/>
    <path d="M500 603 C545 516 563 422 534 323 C522 281 511 230 500 157" stroke="#36dfff" stroke-width="2.8" stroke-opacity=".45"/>
    <path d="M500 603 C421 551 335 534 237 556 C177 570 126 589 79 603" stroke="#75f3ff" stroke-width="2.9" stroke-opacity=".48"/>
    <path d="M500 603 C579 551 665 534 763 556 C823 570 874 589 921 603" stroke="#df72ff" stroke-width="2.9" stroke-opacity=".44"/>
    <path d="M500 603 C447 693 435 793 469 908 C483 958 493 1007 500 1076" stroke="#46eaff" stroke-width="2.9" stroke-opacity=".46"/>
    <path d="M500 603 C553 693 565 793 531 908 C517 958 507 1007 500 1076" stroke="#bf5eff" stroke-width="2.7" stroke-opacity=".38"/>

    <path d="M500 603 C412 488 350 447 276 408" stroke="#c675ff" stroke-width="2.2" stroke-opacity=".30"/>
    <path d="M500 603 C588 488 650 447 724 408" stroke="#60efff" stroke-width="2.2" stroke-opacity=".33"/>
    <path d="M500 603 C385 704 327 754 258 820" stroke="#50e8ff" stroke-width="2.1" stroke-opacity=".31"/>
    <path d="M500 603 C615 704 673 754 742 820" stroke="#cf69ff" stroke-width="2.1" stroke-opacity=".30"/>

    <path d="M500 603 C477 529 472 459 487 385" stroke="#ffffff" stroke-width="1.4" stroke-opacity=".44"/>
    <path d="M500 603 C523 529 528 459 513 385" stroke="#73f4ff" stroke-width="1.4" stroke-opacity=".40"/>
    <path d="M500 603 C421 585 344 584 268 600" stroke="#aafcff" stroke-width="1.4" stroke-opacity=".35"/>
    <path d="M500 603 C579 585 656 584 732 600" stroke="#f0a1ff" stroke-width="1.4" stroke-opacity=".32"/>
  </g>

  <g class="fx61-reactor-rings" fill="none" transform-origin="500px 603px" filter="url(#fx61-glow-small)">
    <circle cx="500" cy="603" r="52" stroke="#ffffff" stroke-width="2.8" stroke-opacity=".70"/>
    <circle cx="500" cy="603" r="78" stroke="#6ef7ff" stroke-width="4.4" stroke-opacity=".66"/>
    <circle cx="500" cy="603" r="108" stroke="#21caff" stroke-width="3.6" stroke-opacity=".54"/>
    <circle cx="500" cy="603" r="139" stroke="#8b58ff" stroke-width="3.0" stroke-opacity=".42" stroke-dasharray="170 21 46 15"/>
    <circle cx="500" cy="603" r="172" stroke="#29e1ff" stroke-width="2.5" stroke-opacity=".36" stroke-dasharray="86 16"/>
    <circle cx="500" cy="603" r="208" stroke="#5a6fff" stroke-width="1.7" stroke-opacity=".22" stroke-dasharray="44 21"/>
  </g>

  <g class="fx61-energy-cross" filter="url(#fx61-glow-small)">
    <path d="M500 520V686 M417 603H583" stroke="#40eaff" stroke-width="5.5" stroke-opacity=".42"/>
    <path d="M500 546V660 M443 603H557" stroke="#ffffff" stroke-width="2.1" stroke-opacity=".88"/>
  </g>

  <circle cx="500" cy="603" r="96" fill="url(#fx61-reactor)" opacity=".80" filter="url(#fx61-glow)"/>
  <circle cx="500" cy="603" r="35" fill="#83ffff" fill-opacity=".88" filter="url(#fx61-glow-small)"/>
  <circle cx="500" cy="603" r="19" fill="#ffffff"/>

  <g class="fx61-particles" fill="#eaffff">
    <circle cx="500" cy="151" r="5.6"/><circle cx="500" cy="1078" r="5.2"/><circle cx="81" cy="603" r="5.4"/><circle cx="919" cy="603" r="5.4"/>
    <circle cx="371" cy="420" r="3.5"/><circle cx="644" cy="447" r="3.1"/><circle cx="704" cy="546" r="3.7"/><circle cx="278" cy="570" r="3.4"/>
    <circle cx="383" cy="777" r="3.4"/><circle cx="672" cy="799" r="3.6"/><circle cx="482" cy="390" r="2.7"/><circle cx="519" cy="742" r="3.0"/>
  </g>`;

  const style=document.createElement('style');
  style.textContent=`
  .fx-core-fidelity-v61{position:absolute;inset:0;width:100%;height:100%;z-index:4;pointer-events:none;overflow:visible;mix-blend-mode:screen;filter:saturate(1.12) contrast(1.04)}
  .fx-core-fidelity-v61 .fx61-crystal-volume{mix-blend-mode:screen}
  .fx-core-fidelity-v61 .fx61-crystal{mix-blend-mode:screen}
  .fx-core-fidelity-v61 .fx61-particles{filter:drop-shadow(0 0 6px rgba(124,238,255,.88))}
  @media (prefers-reduced-motion:reduce){.fx-core-fidelity-v61{filter:saturate(1.06) contrast(1.02)}}`;
  svg.prepend(style);

  stage.appendChild(svg);
  root.dataset.fxCoreFidelityV61='ready-v61';
  root.dataset.fxCoreReferenceLock='ready-v61';
  root.dataset.fxCoreReferenceFidelity='emissive-vector-over-real-webgl2-v61';
  root.dataset.fxCoreFidelitySilhouette='organic-deep-concave-four-point-r10';
  root.dataset.fxCoreFidelityGlass='layered-volumetric-cyan-violet-r10';
  root.dataset.fxCoreFidelityReactor='white-cyan-violet-nucleus-r10';
  dispatchEvent(new CustomEvent('formatx:core3dready',{detail:{reference:'v61',fidelity:'organic-glass-reference-r10'}}));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>start(),{once:true});
else start();
}());