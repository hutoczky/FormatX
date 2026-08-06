(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxFeedback === 'v2') return;
  root.dataset.fxFeedback = 'v2';

  const FEEDBACK_SUMMARY_URL = '/api/feedback/summary';
  const FEEDBACK_SUBMIT_URL = '/api/feedback';
  const PORTABLE_INSTALLER_ASSET = '/scifi-ui/assets/images/product-showcase/portable-installer-compatible.svg?v=20260806-mobile-compatible-2';
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
    },
  };

  const language = () => root.lang === 'en' ? 'en' : 'hu';
  const copy = () => COPY[language()];

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
      image.src = PORTABLE_INSTALLER_ASSET;
    });
  }

  const showcaseObserver = new MutationObserver(entries => {
    entries.forEach(entry => entry.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) patchPortableInstallerImages(node);
    }));
  });

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

  async function loadSummary(section) {
    const output = section.querySelector('[data-fx-feedback-summary]');
    if (!output || output.dataset.loading === 'true') return;
    output.dataset.loading = 'true';
    output.textContent = copy().loading;
    output.dataset.state = 'loading';
    try {
      const data = await fetchJson(FEEDBACK_SUMMARY_URL);
      if (!data.count || !data.average) {
        output.textContent = copy().empty;
        output.dataset.state = 'empty';
        return;
      }
      output.textContent = copy().published(Number(data.average.overall), Number(data.count));
      output.dataset.state = 'published';
      output.dataset.count = String(data.count);
      output.dataset.average = String(data.average.overall);
    } catch (error) {
      console.warn('FormatX feedback summary unavailable', error);
      output.textContent = copy().empty;
      output.dataset.state = 'unavailable';
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
      setTimeout(() => loadSummary(document.getElementById('user-feedback')), 500);
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
    section.querySelectorAll('[data-rating-group]').forEach(buildRatingGroup);
    syncBilingual(section);
    const form = section.querySelector('[data-fx-feedback-form]');
    if (form && form.dataset.bound !== 'true') {
      form.dataset.bound = 'true';
      form.addEventListener('submit', submitFeedback);
    }
    loadSummary(section);
    root.dataset.fxFeedbackState = 'ready';
  }

  addEventListener('formatx:languagechange', () => {
    const section = document.getElementById('user-feedback');
    syncBilingual(section);
    syncLiveOsCtas();
    document.querySelectorAll('#user-feedback [data-rating-group] legend').forEach(legend => {
      legend.textContent = legend.dataset[language()];
    });
    document.querySelectorAll('#user-feedback .fx-rating-stars label[data-value] .sr-only').forEach(label => {
      const value = label.closest('label').dataset.value;
      label.textContent = `${value} / 5 ${copy().rating}`;
    });
    if (section) loadSummary(section);
  });

  if (document.body) showcaseObserver.observe(document.body, { childList: true, subtree: true });
  else addEventListener('DOMContentLoaded', () => showcaseObserver.observe(document.body, { childList: true, subtree: true }), { once: true });

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
  ['pageshow', 'formatx:livingready', 'formatx:loop'].forEach(name => addEventListener(name, initialise));
  addEventListener('pagehide', () => showcaseObserver.disconnect(), { once: true });
}());
