(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxFeedback === 'v3') return;
  root.dataset.fxFeedback = 'v3';

  const FEEDBACK_SUMMARY_URL = '/api/feedback/summary';
  const FEEDBACK_SUBMIT_URL = '/api/feedback';
  const PORTABLE_INSTALLER_ASSET = '/scifi-ui/assets/images/product-showcase/portable-installer-compatible.svg?v=20260806-mobile-compatible-2';
  const PUBLIC_REVIEW_STYLE = '/scifi-ui/styles/formatx-feedback-public.css?v=20260807-public-reviews-1';
  const REQUEST_TIMEOUT_MS = 15000;

  const COPY = {
    hu: {
      rating: 'értékelés',
      loading: 'A valódi, jóváhagyott értékelések betöltése…',
      empty: 'Még nincs jóváhagyott nyilvános értékelés. Az első valódi visszajelzések moderálás után jelennek meg.',
      published: (average, count) => `${average.toFixed(1)} / 5 · ${count} jóváhagyott értékelés`,
      submitting: 'Visszajelzés küldése…',
      success: 'Köszönjük. A visszajelzés moderálásra vár, és csak jóváhagyás után kerülhet bele a nyilvános átlagba.',
      error: 'A visszajelzés most nem küldhető el. Ellenőrizd a kapcsolatot, majd próbáld újra.',
      timeout: 'A visszajelző szolgáltatás nem válaszolt időben. Próbáld meg újra.',
      selectAll: 'Minden értékelési kategóriát tölts ki 1 és 5 között.',
      privacy: 'Az adatkezelési tájékoztató elfogadása kötelező.',
      publicTitle: 'Jóváhagyott hozzászólások',
      publicNote: 'Csak moderált, kifejezett közzétételi engedéllyel beküldött vélemény jelenhet meg itt.',
      publicEmpty: 'Még nincs közzétételre engedélyezett szöveges hozzászólás.',
      anonymous: 'Névtelen felhasználó',
      approved: 'jóváhagyva',
    },
    en: {
      rating: 'rating',
      loading: 'Loading genuine, approved ratings…',
      empty: 'No approved public rating has been published yet. Genuine submissions appear only after moderation.',
      published: (average, count) => `${average.toFixed(1)} / 5 · ${count} approved rating${count === 1 ? '' : 's'}`,
      submitting: 'Sending feedback…',
      success: 'Thank you. The submission is awaiting moderation and can affect the public average only after approval.',
      error: 'Feedback could not be sent. Check the connection and try again.',
      timeout: 'The feedback service did not respond in time. Please try again.',
      selectAll: 'Rate every category from 1 to 5.',
      privacy: 'Accepting the privacy notice is required.',
      publicTitle: 'Approved comments',
      publicNote: 'Only moderated reviews submitted with explicit publication permission can appear here.',
      publicEmpty: 'No text comment has been approved for publication yet.',
      anonymous: 'Anonymous user',
      approved: 'approved',
    },
  };

  const language = () => root.lang === 'en' ? 'en' : 'hu';
  const copy = () => COPY[language()];
  let feedbackActivated = false;
  let feedbackObserver = null;
  let latestSummary = null;

  function ensurePublicReviewStyles() {
    if (document.querySelector('link[data-fx-feedback-public-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = PUBLIC_REVIEW_STYLE;
    link.dataset.fxFeedbackPublicStyle = 'true';
    document.head.append(link);
  }

  function syncBilingual(scope) {
    if (!scope) return;
    scope.querySelectorAll('[data-hu][data-en]').forEach(element => {
      if (element.matches('input, textarea')) {
        if (element.dataset.huPlaceholder && element.dataset.enPlaceholder) {
          element.placeholder = element.dataset[language() + 'Placeholder'];
        }
        return;
      }
      element.textContent = element.dataset[language()];
    });
  }

  function syncLiveOsCtas() {
    document.querySelectorAll('[data-fx-live-os-cta]').forEach(element => {
      const label = element.querySelector('[data-hu][data-en]');
      if (label) label.textContent = label.dataset[language()];
      else if (element.dataset.hu && element.dataset.en) element.textContent = element.dataset[language()];
    });
  }

  function patchPortableInstallerImages(scope = document) {
    const images = [];
    if (scope instanceof HTMLImageElement) images.push(scope);
    if (scope.querySelectorAll) {
      images.push(...scope.querySelectorAll('img[src*="product-showcase/portable-installer.svg"], img[data-fx-portable-installer]'));
    }
    images.forEach(image => {
      if (image.dataset.fxPortableInstallerPatched === 'true') return;
      image.dataset.fxPortableInstallerPatched = 'true';
      image.dataset.fxPortableInstaller = 'compatible';
      image.loading = 'lazy';
      image.decoding = 'async';
      image.src = PORTABLE_INSTALLER_ASSET;
    });
  }

  async function fetchJson(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        credentials: 'same-origin',
        ...options,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(options.headers || {}),
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.code = data.error || '';
        throw error;
      }
      return data;
    } catch (error) {
      if (error && error.name === 'AbortError') {
        const timeoutError = new Error(copy().timeout);
        timeoutError.code = 'timeout';
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  function buildRatingGroup(host) {
    if (host.dataset.ready === 'true') return;
    const name = host.dataset.ratingGroup;
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'fx-feedback-rating';
    const legend = document.createElement('legend');
    legend.dataset.hu = host.dataset.huLabel || name;
    legend.dataset.en = host.dataset.enLabel || name;
    legend.textContent = legend.dataset[language()];
    const stars = document.createElement('div');
    stars.className = 'fx-rating-stars';
    stars.setAttribute('role', 'radiogroup');

    for (let value = 1; value <= 5; value += 1) {
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.id = `fx-feedback-${name}-${value}`;
      input.value = String(value);
      input.required = true;

      const label = document.createElement('label');
      label.htmlFor = input.id;
      label.dataset.value = String(value);
      label.innerHTML = '<span aria-hidden="true">★</span><span class="sr-only"></span>';
      label.querySelector('.sr-only').textContent = `${value} / 5 ${copy().rating}`;
      stars.append(input, label);
    }

    stars.addEventListener('change', () => paintStars(stars));
    stars.addEventListener('pointerover', event => {
      const label = event.target.closest('label[data-value]');
      if (label) paintStars(stars, Number(label.dataset.value));
    });
    stars.addEventListener('pointerleave', () => paintStars(stars));

    fieldset.append(legend, stars);
    host.replaceChildren(fieldset);
    host.dataset.ready = 'true';
  }

  function paintStars(stars, previewValue) {
    const selected = Number(stars.querySelector('input:checked')?.value || 0);
    const active = Number.isFinite(previewValue) ? previewValue : selected;
    stars.querySelectorAll('label[data-value]').forEach(label => {
      label.classList.toggle('is-active', Number(label.dataset.value) <= active);
    });
  }

  function ensurePublicReviewsHost(section) {
    let host = section.querySelector('[data-fx-feedback-public]');
    if (host) return host;

    host = document.createElement('section');
    host.className = 'fx-feedback-public';
    host.dataset.fxFeedbackPublic = 'true';
    host.setAttribute('aria-labelledby', 'fx-feedback-public-title');

    const head = document.createElement('div');
    head.className = 'fx-feedback-public-head';
    const title = document.createElement('h3');
    title.id = 'fx-feedback-public-title';
    title.dataset.hu = COPY.hu.publicTitle;
    title.dataset.en = COPY.en.publicTitle;
    const note = document.createElement('p');
    note.dataset.hu = COPY.hu.publicNote;
    note.dataset.en = COPY.en.publicNote;
    head.append(title, note);

    const list = document.createElement('div');
    list.className = 'fx-feedback-public-grid';
    list.dataset.fxFeedbackPublicList = 'true';
    list.setAttribute('aria-live', 'polite');

    host.append(head, list);
    const form = section.querySelector('[data-fx-feedback-form]');
    if (form) form.before(host);
    else section.append(host);
    syncBilingual(host);
    return host;
  }

  function reviewDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(language() === 'en' ? 'en-GB' : 'hu-HU', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(date);
  }

  function renderPublicReviews(section, reviews) {
    const host = ensurePublicReviewsHost(section);
    syncBilingual(host);
    const list = host.querySelector('[data-fx-feedback-public-list]');
    if (!list) return;
    list.replaceChildren();

    if (!Array.isArray(reviews) || reviews.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'fx-feedback-public-empty';
      empty.textContent = copy().publicEmpty;
      list.append(empty);
      host.dataset.state = 'empty';
      return;
    }

    reviews.slice(0, 6).forEach(review => {
      const article = document.createElement('article');
      article.className = 'fx-feedback-public-card';

      const rating = Math.max(1, Math.min(5, Number(review.overall || 0)));
      const stars = document.createElement('div');
      stars.className = 'fx-feedback-public-stars';
      stars.textContent = `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;
      stars.setAttribute('aria-label', `${rating} / 5`);

      const quote = document.createElement('blockquote');
      const paragraph = document.createElement('p');
      paragraph.textContent = String(review.comment || '').trim();
      quote.append(paragraph);

      const footer = document.createElement('footer');
      const name = document.createElement('strong');
      name.textContent = String(review.display_name || '').trim() || copy().anonymous;
      const meta = document.createElement('span');
      const date = reviewDate(review.approved_at);
      meta.textContent = date ? `${copy().approved}: ${date}` : copy().approved;
      footer.append(name, meta);

      article.append(stars, quote, footer);
      list.append(article);
    });
    host.dataset.state = 'published';
  }

  function renderSummary(section, data) {
    const output = section.querySelector('[data-fx-feedback-summary]');
    if (!output) return;
    if (!data?.count || !data?.average) {
      output.textContent = copy().empty;
      output.dataset.state = 'empty';
    } else {
      output.textContent = copy().published(Number(data.average.overall), Number(data.count));
      output.dataset.state = 'published';
      output.dataset.count = String(data.count);
      output.dataset.average = String(data.average.overall);
    }
    renderPublicReviews(section, data?.reviews || []);
  }

  async function loadSummary(section, force = false) {
    const output = section.querySelector('[data-fx-feedback-summary]');
    if (!output || output.dataset.loading === 'true') return;
    if (latestSummary && !force) {
      renderSummary(section, latestSummary);
      return;
    }
    output.dataset.loading = 'true';
    output.textContent = copy().loading;
    output.dataset.state = 'loading';
    try {
      const data = await fetchJson(FEEDBACK_SUMMARY_URL);
      latestSummary = data;
      renderSummary(section, data);
    } catch (error) {
      console.warn('FormatX feedback summary unavailable', error);
      output.textContent = copy().empty;
      output.dataset.state = 'unavailable';
      renderPublicReviews(section, []);
    } finally {
      delete output.dataset.loading;
    }
  }

  function selectedRating(form, name) {
    const selected = form.querySelector(`input[name="${name}"]:checked`);
    return selected ? Number(selected.value) : 0;
  }

  async function submitFeedback(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector('[data-fx-feedback-status]');
    const submit = form.querySelector('button[type="submit"]');
    const ratings = {};
    for (const name of ['overall', 'usability', 'performance', 'design', 'features']) {
      ratings[name] = selectedRating(form, name);
    }
    if (Object.values(ratings).some(value => value < 1 || value > 5)) {
      status.textContent = copy().selectAll;
      status.dataset.state = 'error';
      return;
    }
    if (form.elements.privacy_consent?.checked !== true) {
      status.textContent = copy().privacy;
      status.dataset.state = 'error';
      form.elements.privacy_consent?.focus();
      return;
    }

    const payload = {
      ...ratings,
      comment: form.elements.comment?.value || '',
      display_name: form.elements.display_name?.value || '',
      contact_email: form.elements.contact_email?.value || '',
      publish_permission: form.elements.publish_permission?.checked === true,
      privacy_consent: true,
      website: form.elements.website?.value || '',
      locale: language(),
      source: 'formatxsuite-homepage',
      page_path: location.pathname,
    };

    submit.disabled = true;
    status.textContent = copy().submitting;
    status.dataset.state = 'loading';
    try {
      await fetchJson(FEEDBACK_SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      form.reset();
      form.querySelectorAll('.fx-rating-stars').forEach(stars => paintStars(stars));
      status.textContent = copy().success;
      status.dataset.state = 'success';
      form.dataset.submitted = 'true';
      setTimeout(() => loadSummary(document.getElementById('user-feedback'), true), 500);
    } catch (error) {
      console.warn('FormatX feedback submission failed', error);
      status.textContent = error && error.message ? error.message : copy().error;
      status.dataset.state = 'error';
      status.dataset.errorCode = error && error.code ? error.code : 'request_failed';
    } finally {
      submit.disabled = false;
    }
  }

  function openLiveOs() {
    const launcher = document.querySelector('[data-fx-live-os-launcher]');
    if (launcher) {
      launcher.click();
      return;
    }
    document.getElementById('live-os-overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => document.querySelector('[data-fx-live-os-launcher]')?.click(), 450);
  }

  function activateFeedbackSection(section) {
    if (!section || feedbackActivated) return;
    feedbackActivated = true;
    feedbackObserver?.disconnect();
    feedbackObserver = null;
    ensurePublicReviewStyles();
    section.querySelectorAll('[data-rating-group]').forEach(buildRatingGroup);
    syncBilingual(section);
    ensurePublicReviewsHost(section);
    const form = section.querySelector('[data-fx-feedback-form]');
    if (form && form.dataset.bound !== 'true') {
      form.dataset.bound = 'true';
      form.addEventListener('submit', submitFeedback);
    }
    loadSummary(section);
    root.dataset.fxFeedbackState = 'ready-visible';
  }

  function prepareFeedbackSection(section) {
    if (!section || feedbackActivated || feedbackObserver) return;
    if (!('IntersectionObserver' in window)) {
      activateFeedbackSection(section);
      return;
    }
    root.dataset.fxFeedbackState = 'deferred';
    feedbackObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) activateFeedbackSection(section);
    }, { rootMargin: '800px 0px', threshold: 0 });
    feedbackObserver.observe(section);
  }

  function initialise() {
    patchPortableInstallerImages();
    document.querySelectorAll('[data-fx-live-os-cta]').forEach(button => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';
      button.addEventListener('click', openLiveOs);
    });
    syncLiveOsCtas();

    const section = document.getElementById('user-feedback');
    if (!section) return;
    syncBilingual(section);
    prepareFeedbackSection(section);
  }

  addEventListener('formatx:languagechange', () => {
    const section = document.getElementById('user-feedback');
    syncBilingual(section);
    syncLiveOsCtas();
    if (!feedbackActivated) return;
    document.querySelectorAll('#user-feedback [data-rating-group] legend').forEach(legend => {
      legend.textContent = legend.dataset[language()];
    });
    document.querySelectorAll('#user-feedback .fx-rating-stars label[data-value] .sr-only').forEach(label => {
      const value = label.closest('label').dataset.value;
      label.textContent = `${value} / 5 ${copy().rating}`;
    });
    if (section && latestSummary) renderSummary(section, latestSummary);
  });

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
  ['pageshow', 'formatx:livingready', 'formatx:loop'].forEach(name => addEventListener(name, initialise));
  addEventListener('pagehide', () => {
    feedbackObserver?.disconnect();
    feedbackObserver = null;
  }, { once: true });
}());
