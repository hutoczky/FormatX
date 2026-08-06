(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxFeedback === 'v1') return;
  root.dataset.fxFeedback = 'v1';

  const COPY = {
    hu: {
      rating: 'értékelés',
      loading: 'A valódi, jóváhagyott értékelések betöltése…',
      empty: 'Még nincs jóváhagyott nyilvános értékelés. Az első valódi visszajelzések moderálás után jelennek meg.',
      published: (average, count) => `${average.toFixed(1)} / 5 · ${count} jóváhagyott értékelés`,
      submitting: 'Visszajelzés küldése…',
      success: 'Köszönjük. A visszajelzés moderálásra vár, és csak jóváhagyás után kerülhet bele a nyilvános átlagba.',
      error: 'A visszajelzés most nem küldhető el. Ellenőrizd a mezőket, majd próbáld újra.',
      selectAll: 'Minden értékelési kategóriát tölts ki 1 és 5 között.',
      openLive: 'A Live OS megnyitása',
    },
    en: {
      rating: 'rating',
      loading: 'Loading genuine, approved ratings…',
      empty: 'No approved public rating has been published yet. Genuine submissions appear only after moderation.',
      published: (average, count) => `${average.toFixed(1)} / 5 · ${count} approved rating${count === 1 ? '' : 's'}`,
      submitting: 'Sending feedback…',
      success: 'Thank you. The submission is awaiting moderation and can affect the public average only after approval.',
      error: 'Feedback could not be sent. Check the fields and try again.',
      selectAll: 'Rate every category from 1 to 5.',
      openLive: 'Open Live OS',
    },
  };

  const language = () => root.lang === 'en' ? 'en' : 'hu';
  const copy = () => COPY[language()];

  function syncBilingual(scope = document) {
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
    if (!output) return;
    output.textContent = copy().loading;
    output.dataset.state = 'loading';
    try {
      const response = await fetch('/api/feedback/summary', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error(`summary ${response.status}`);
      const data = await response.json();
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

    const payload = {
      ...ratings,
      comment: form.elements.comment?.value || '',
      display_name: form.elements.display_name?.value || '',
      contact_email: form.elements.contact_email?.value || '',
      publish_permission: form.elements.publish_permission?.checked === true,
      privacy_consent: form.elements.privacy_consent?.checked === true,
      website: form.elements.website?.value || '',
      locale: language(),
      source: 'formatxsuite-homepage',
      page_path: location.pathname,
    };

    submit.disabled = true;
    status.textContent = copy().submitting;
    status.dataset.state = 'loading';
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || `feedback ${response.status}`);
      form.reset();
      form.querySelectorAll('.fx-rating-stars').forEach(stars => paintStars(stars));
      status.textContent = copy().success;
      status.dataset.state = 'success';
      form.dataset.submitted = 'true';
    } catch (error) {
      console.warn('FormatX feedback submission failed', error);
      status.textContent = error.message && !/^feedback \d+$/.test(error.message)
        ? error.message
        : copy().error;
      status.dataset.state = 'error';
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
    setTimeout(() => {
      document.querySelector('[data-fx-live-os-launcher]')?.click();
    }, 450);
  }

  function initialise() {
    const section = document.getElementById('user-feedback');
    document.querySelectorAll('[data-fx-live-os-cta]').forEach(button => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';
      button.addEventListener('click', openLiveOs);
    });
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
    syncBilingual(document);
    document.querySelectorAll('[data-rating-group] legend').forEach(legend => {
      legend.textContent = legend.dataset[language()];
    });
    document.querySelectorAll('.fx-rating-stars label[data-value] .sr-only').forEach(label => {
      const value = label.closest('label').dataset.value;
      label.textContent = `${value} / 5 ${copy().rating}`;
    });
    const section = document.getElementById('user-feedback');
    if (section) loadSummary(section);
  });

  if (document.readyState === 'loading') {
    addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
  ['pageshow', 'formatx:livingready', 'formatx:loop'].forEach(name => addEventListener(name, initialise));
}());
