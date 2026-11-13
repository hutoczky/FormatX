/* FormatX MAG scroll narrative R2202 — progressive enhancement, native input preserved. */
(() => {
  'use strict';
  if (window.__FORMATX_MAG_SCROLL_R2202__) return;
  const root = document.documentElement;
  const main = document.getElementById('main-content');
  if (!main) return;
  const specs = [
    ['hero','MAG','CORE','01'],
    ['experience','IDEGRENDSZER','NERVOUS SYSTEM','02'],
    ['capabilities','KÉPESSÉGEK','CAPABILITIES','03'],
    ['pricing','KERESKEDELMI MAG','COMMERCE CORE','04'],
    ['system','RENDSZER','SYSTEM','05'],
    ['network','HÁLÓZAT','NETWORK','06'],
    ['resources','JELADÓ','RELEASE BEACON','07']
  ];
  const chapters = specs.map(([id,hu,en,num]) => ({id,hu,en,num,element:document.getElementById(id)}))
    .filter(chapter => chapter.element);
  if (chapters.length < 2) return;
  window.__FORMATX_MAG_SCROLL_R2202__ = true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const rail = document.createElement('nav');
  rail.className = 'fx-mag-story-rail';
  rail.setAttribute('aria-label', 'MAG történet navigáció');
  rail.innerHTML = '<span class="fx-mag-story-rail__caption" aria-hidden="true">MAG / SYSTEM JOURNEY</span><div class="fx-mag-story-rail__track"></div><span class="fx-mag-story-rail__counter" aria-hidden="true"></span>';
  const track = rail.querySelector('.fx-mag-story-rail__track');
  const styleLink = document.querySelector('link[data-fx-mag-story-r2202]');
  const styleReady = () => !styleLink || (styleLink.media!=='print' && Boolean(styleLink.sheet));
  rail.hidden = true;
  chapters.forEach(chapter => {
    chapter.element.classList.add('fx-mag-story-chapter');
    chapter.element.style.setProperty('--fx-mag-story-index', chapter.num);
    const link = document.createElement('a');
    link.href = '#' + chapter.id;
    link.dataset.chapter = chapter.id;
    link.setAttribute('aria-label', chapter.hu);
    link.innerHTML = '<span class="fx-mag-story-rail__dot" aria-hidden="true"></span><span class="fx-mag-story-rail__name"></span>';
    track.appendChild(link);
    chapter.link = link;
  });
  document.body.appendChild(rail);

  const clamp = (n,a=0,b=1) => Math.max(a,Math.min(b,n));
  const links = chapters.map(chapter => chapter.link);
  // R2216: keep each chapter's last compositor state.
  // Native scrolling should update CSS only when a visible value changes.
  const lastChapterStyles = chapters.map(() => ({visibility:null,offset:null}));
  const footer = document.querySelector('footer.site-footer');
  const mobileLayout = matchMedia('(max-width:900px),(pointer:coarse)');
  let scheduled = false;
  let active = -1;
  let eased = 0;
  let lastFrame = 0;
  let destroyed = false;
  let lastCoreTurn = 0;
  let lastCoreScene = -1;
  let lastCore = null;
  let lastCoreArchive = false;
  const archiveOwnsStage = () =>
    root.dataset.fxArchiveExperience === 'ready' &&
    root.dataset.fxArchiveDock === 'active' &&
    root.dataset.fxArchiveCinema === 'active';
  const coreAvailable = () => {
    const core = window.FormatXLivingCore || window.FormatXCoreMobileV69;
    return core && typeof core.rotateBy === 'function' ? core : null;
  };
  function driveCore(sceneIndex, progress, heroRect, archiveActive) {
    if (reduced.matches || document.hidden) return;
    // The same R326 stage is visible either in the hero OR in the existing
    // full-page R1987 cinematic archive. Never wake any other offscreen GPU.
    if (!archiveActive &&
        (heroRect.bottom <= 0 || heroRect.top >= innerHeight)) return;
    const core = coreAvailable();
    if (!core) return;
    if (lastCore !== core || lastCoreArchive !== archiveActive) {
      lastCore = core;
      lastCoreArchive = archiveActive;
      lastCoreTurn = progress;
      lastCoreScene = sceneIndex;
    }
    const difference = clamp(progress - lastCoreTurn, -.018, .018);
    lastCoreTurn = progress;
    if (Math.abs(difference) > .00008)
      core.rotateBy(difference * 170, difference * -32, 'mag-scroll-r2203');
    if (sceneIndex !== lastCoreScene) {
      lastCoreScene = sceneIndex;
      core.requestRender?.();
    }
  }

  function updateLabels() {
    const english = root.lang.toLowerCase().startsWith('en');
    rail.setAttribute('aria-label',english?'MAG story navigation':'MAG történet navigáció');
    chapters.forEach(chapter => {
      chapter.link.setAttribute('aria-label',english?chapter.en:chapter.hu);
      chapter.link.querySelector('.fx-mag-story-rail__name').textContent = english?chapter.en:chapter.hu;
    });
  }
  function render(now) {
    scheduled = false;
    if (destroyed) return;
    if (document.hidden) return;
    // Avoid expensive full-page geometry reads during the critical first paint.
    // R487 will notify this controller once its deferred CSS has applied.
    if (!styleReady()) return;
    const vh = Math.max(1,innerHeight);
    // Geometry READ pass: one layout snapshot before any style writes.
    const footerRect = footer?.getBoundingClientRect();
    const bounds = chapters.map(chapter => chapter.element.getBoundingClientRect());
    const first = bounds[0];
    const last = bounds[bounds.length-1];
    const center = vh * .52;
    let nearest = 0, closest = Infinity;
    const updates = bounds.map((r,index) => {
      const distance = center < r.top ? r.top-center : center > r.bottom ? center-r.bottom : 0;
      if (distance < closest) {closest=distance;nearest=index;}
      const enter = clamp((vh-r.top)/(vh*.85));
      const exit = clamp(r.bottom/(vh*.65));
      const visibility = reduced.matches ? 1 : Math.min(enter,exit);
      return {
        visibility:visibility.toFixed(3),
        offset:(reduced.matches ? 0 : (1-visibility)*22).toFixed(1)+'px'
      };
    });
    const total = Math.max(1,(last.bottom-first.top)-vh);
    const archiveActive = archiveOwnsStage();
    // In cinematic mode the old hero may be hidden/fixed. Use the document
    // scroll track, which remains continuous and reversible across 8 folios.
    const target = archiveActive
      ? clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-vh))
      : clamp((-first.top)/total);
    // Geometry WRITE pass: no subsequent getBoundingClientRect in this frame.
    const hideRail = !styleReady() || Boolean(footerRect && footerRect.top < vh && footerRect.bottom > 0);
    if (rail.hidden !== hideRail) rail.hidden = hideRail;
    updates.forEach((update,index) => {
      const node = chapters[index].element;
      const prior = lastChapterStyles[index];
      if (prior.visibility!==update.visibility) {
        node.style.setProperty('--fx-mag-story-visibility',update.visibility);
        prior.visibility=update.visibility;
      }
      if (prior.offset!==update.offset) {
        node.style.setProperty('--fx-mag-story-offset',update.offset);
        prior.offset=update.offset;
      }
    });
    driveCore(nearest,target,first,archiveActive);
    const elapsed = Math.min(64,Math.max(0,now-(lastFrame||now)));
    lastFrame=now;
    eased = reduced.matches ? target : eased+(target-eased)*(1-Math.exp(-elapsed/110));
    root.style.setProperty('--fx-mag-story-progress',eased.toFixed(4));
    root.style.setProperty('--fx-mag-story-camera',reduced.matches?'0':(eased*1.0).toFixed(4));
    rail.style.setProperty('--fx-mag-story-progress',eased.toFixed(4));
    if (active!==nearest) {
      active=nearest;
      chapters.forEach((chapter,index) => {
        const selected = index===active;
        chapter.link.classList.toggle('is-active',selected);
        if (selected) chapter.link.setAttribute('aria-current','location');
        else chapter.link.removeAttribute('aria-current');
      });
      rail.querySelector('.fx-mag-story-rail__counter').textContent=chapters[nearest].num+' / '+String(chapters.length).padStart(2,'0');
      if (innerWidth <= 440) {
        // On narrow phones all seven 44px targets fit; clear residual scroll offsets.
        track.scrollLeft = 0;
      } else if (mobileLayout.matches) {
        const link = chapters[nearest].link;
        const wanted = link.offsetLeft + link.offsetWidth*.5 - track.clientWidth*.5;
        track.scrollLeft = Math.max(0,wanted);
      }
      root.dataset.fxMagStoryChapter = chapters[nearest].id;
      dispatchEvent(new CustomEvent('formatx:mag-chapter',{detail:{id:chapters[nearest].id,index:nearest}}));
    }
    if (!reduced.matches && Math.abs(target-eased)>.0005) request();
  }
  function request() {
    if (!scheduled && !destroyed && !document.hidden) {
      scheduled=true;
      requestAnimationFrame(render);
    }
  }
  const languageObserver=new MutationObserver(() => {updateLabels();request();});
  languageObserver.observe(root,{attributes:true,attributeFilter:['lang']});
  const resizeObserver=typeof ResizeObserver==='function' ? new ResizeObserver(request) : null;
  chapters.forEach(chapter => resizeObserver?.observe(chapter.element));
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',request,{passive:true});
  addEventListener('pageshow',request);
  addEventListener('formatx:loop',request,{passive:true});
  addEventListener('formatx:loopgeometryrefresh',request,{passive:true});
  addEventListener('formatx:real3dready',request,{passive:true});
  addEventListener('formatx:deferredcssready',request,{passive:true});
  styleLink?.addEventListener('load',request,{once:true});
  document.addEventListener('visibilitychange',request);
  reduced.addEventListener?.('change',request);
  updateLabels();
  root.dataset.fxMagStory = 'r2202';
  request();
  // Exposed only for deterministic visual and interaction smoke tests.
  window.__FORMATX_MAG_STORY_STATUS__ = () => ({
    version:'r2202',active:chapters[active]?.id||null,progress:eased,
    chapters:chapters.length,reducedMotion:reduced.matches,links:links.length,
    coreConnected:Boolean(coreAvailable()),coreScrollOwner:'native-r326-api'
  });
})();
