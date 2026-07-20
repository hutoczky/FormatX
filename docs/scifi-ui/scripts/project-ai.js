(function () {
  'use strict';

  if (document.getElementById('project-ai-launcher')) return;

  const STORAGE_KEY = 'formatx-ai-language';
  const SESSION_KEY = 'formatx-ai-session';
  const COPY = {
    hu: {
      title: 'FormatX Project AI',
      status: 'PROJEKTISMERET · HU / EN',
      close: 'Projekt-AI bezárása',
      open: 'Projekt-AI megnyitása',
      privacy: 'Nincs adatbázis-mentés',
      welcomeTitle: 'Kérdezz a FormatX projektről',
      welcomeText: 'A projekt moduljairól, működéséről, platformjairól, biztonságáról és támogatásáról tudok válaszolni.',
      placeholder: 'Írd be a kérdésed…',
      send: 'Kérdés elküldése',
      hint: 'Enter: küldés · Shift+Enter: új sor · Legfeljebb 800 karakter',
      thinking: 'A projekt-AI ellenőrzi a tudásbázist…',
      error: 'A válasz most nem érhető el. Próbáld újra néhány másodperc múlva.',
      rate: 'Túl sok kérdés érkezett rövid idő alatt. Várj egy percet, majd próbáld újra.',
      modeAi: 'Cloudflare Workers AI · ellenőrzött projektkontextus',
      modeLocal: 'Ellenőrzött helyi projektválasz',
      suggestions: [
        'Mi a FormatX Suite Pro?',
        'Milyen modulok vannak benne?',
        'Hogyan védi a meghajtókat?',
        'Milyen rendszereket támogat?',
      ],
    },
    en: {
      title: 'FormatX Project AI',
      status: 'PROJECT KNOWLEDGE · HU / EN',
      close: 'Close Project AI',
      open: 'Open Project AI',
      privacy: 'No database storage',
      welcomeTitle: 'Ask about the FormatX project',
      welcomeText: 'I can answer questions about the project modules, workflow, platforms, security and support.',
      placeholder: 'Type your question…',
      send: 'Send question',
      hint: 'Enter: send · Shift+Enter: new line · Maximum 800 characters',
      thinking: 'Project AI is checking the verified knowledge base…',
      error: 'The answer is temporarily unavailable. Try again in a few seconds.',
      rate: 'Too many questions were submitted in a short period. Wait one minute and try again.',
      modeAi: 'Cloudflare Workers AI · verified project context',
      modeLocal: 'Verified local project answer',
      suggestions: [
        'What is FormatX Suite Pro?',
        'Which modules are included?',
        'How are drives protected?',
        'Which operating systems are supported?',
      ],
    },
  };

  let language = loadLanguage();
  let busy = false;

  const launcher = document.createElement('button');
  launcher.id = 'project-ai-launcher';
  launcher.className = 'project-ai-launcher';
  launcher.type = 'button';
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'project-ai-shell');
  launcher.innerHTML = '<span>FX AI</span>';

  const shell = document.createElement('section');
  shell.id = 'project-ai-shell';
  shell.className = 'project-ai-shell';
  shell.hidden = true;
  shell.setAttribute('role', 'dialog');
  shell.setAttribute('aria-modal', 'false');
  shell.setAttribute('aria-labelledby', 'project-ai-title');
  shell.innerHTML = [
    '<header class="project-ai-header">',
      '<div class="project-ai-orb" aria-hidden="true"></div>',
      '<div class="project-ai-heading"><strong id="project-ai-title"></strong><span id="project-ai-status"></span></div>',
      '<button class="project-ai-close" type="button" aria-label="">×</button>',
    '</header>',
    '<div class="project-ai-toolbar">',
      '<div class="project-ai-language" role="group" aria-label="Language / Nyelv">',
        '<button type="button" data-ai-language="hu">HU</button>',
        '<button type="button" data-ai-language="en">EN</button>',
      '</div>',
      '<span class="project-ai-privacy"></span>',
    '</div>',
    '<div class="project-ai-log" aria-live="polite" aria-relevant="additions">',
      '<div class="project-ai-welcome">',
        '<strong></strong>',
        '<p></p>',
        '<div class="project-ai-suggestions"></div>',
      '</div>',
    '</div>',
    '<form class="project-ai-form">',
      '<div class="project-ai-input-row">',
        '<textarea class="project-ai-input" rows="1" maxlength="800"></textarea>',
        '<button class="project-ai-submit" type="submit">↑</button>',
      '</div>',
      '<p class="project-ai-hint"></p>',
    '</form>',
  ].join('');

  document.body.append(launcher, shell);

  const closeButton = shell.querySelector('.project-ai-close');
  const log = shell.querySelector('.project-ai-log');
  const form = shell.querySelector('.project-ai-form');
  const input = shell.querySelector('.project-ai-input');
  const submit = shell.querySelector('.project-ai-submit');
  const languageButtons = Array.from(shell.querySelectorAll('[data-ai-language]'));

  function loadLanguage() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'hu' || stored === 'en') return stored;
    } catch (_) {}
    return String(document.documentElement.lang || navigator.language || '').toLowerCase().startsWith('hu') ? 'hu' : 'en';
  }

  function persistLanguage(next) {
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
  }

  function sessionId() {
    try {
      const existing = window.sessionStorage.getItem(SESSION_KEY);
      if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing;
      const created = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID().replace(/-/g, '')
        : Array.from(crypto.getRandomValues(new Uint8Array(16))).map(function (value) { return value.toString(16).padStart(2, '0'); }).join('');
      window.sessionStorage.setItem(SESSION_KEY, created);
      return created;
    } catch (_) {
      return 'anonymous-session';
    }
  }

  function setLanguage(next, persist) {
    language = next === 'en' ? 'en' : 'hu';
    const text = COPY[language];
    shell.querySelector('#project-ai-title').textContent = text.title;
    shell.querySelector('#project-ai-status').textContent = text.status;
    closeButton.setAttribute('aria-label', text.close);
    launcher.setAttribute('aria-label', text.open);
    shell.querySelector('.project-ai-privacy').textContent = text.privacy;
    shell.querySelector('.project-ai-welcome strong').textContent = text.welcomeTitle;
    shell.querySelector('.project-ai-welcome p').textContent = text.welcomeText;
    input.placeholder = text.placeholder;
    submit.setAttribute('aria-label', text.send);
    shell.querySelector('.project-ai-hint').textContent = text.hint;
    languageButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.aiLanguage === language));
    });
    rebuildSuggestions();
    if (persist) persistLanguage(language);
  }

  function rebuildSuggestions() {
    const container = shell.querySelector('.project-ai-suggestions');
    container.textContent = '';
    COPY[language].suggestions.forEach(function (question) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = question;
      button.addEventListener('click', function () {
        input.value = question;
        resizeInput();
        input.focus();
      });
      container.appendChild(button);
    });
  }

  function openPanel() {
    shell.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    window.requestAnimationFrame(function () { input.focus(); });
  }

  function closePanel() {
    shell.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }

  function resizeInput() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 130) + 'px';
  }

  function addMessage(role, text, mode) {
    const message = document.createElement('div');
    message.className = 'project-ai-message ' + role;
    const content = document.createElement('div');
    content.textContent = text;
    message.appendChild(content);
    if (mode) {
      const label = document.createElement('span');
      label.className = 'project-ai-mode';
      label.textContent = mode === 'workers-ai' ? COPY[language].modeAi : COPY[language].modeLocal;
      message.appendChild(label);
    }
    log.appendChild(message);
    log.scrollTop = log.scrollHeight;
    return message;
  }

  function addThinking() {
    const message = document.createElement('div');
    message.className = 'project-ai-message assistant';
    const label = document.createElement('div');
    label.textContent = COPY[language].thinking;
    const dots = document.createElement('span');
    dots.className = 'project-ai-thinking';
    dots.setAttribute('aria-hidden', 'true');
    dots.innerHTML = '<i></i><i></i><i></i>';
    message.append(label, dots);
    log.appendChild(message);
    log.scrollTop = log.scrollHeight;
    return message;
  }

  async function ask(question) {
    if (busy) return;
    busy = true;
    submit.disabled = true;
    input.disabled = true;
    addMessage('user', question);
    const thinking = addThinking();

    try {
      const response = await fetch('/api/project-ai', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'X-FormatX-Session': sessionId(),
        },
        body: JSON.stringify({ question: question, language: language }),
      });
      const payload = await response.json().catch(function () { return {}; });
      thinking.remove();
      if (!response.ok) {
        addMessage('assistant error', payload.answer || (response.status === 429 ? COPY[language].rate : COPY[language].error));
      } else {
        addMessage('assistant', String(payload.answer || COPY[language].error), payload.mode || 'verified-local');
      }
    } catch (_) {
      thinking.remove();
      addMessage('assistant error', COPY[language].error);
    } finally {
      busy = false;
      submit.disabled = false;
      input.disabled = false;
      input.value = '';
      resizeInput();
      input.focus();
    }
  }

  launcher.addEventListener('click', openPanel);
  closeButton.addEventListener('click', closePanel);
  languageButtons.forEach(function (button) {
    button.addEventListener('click', function () { setLanguage(button.dataset.aiLanguage, true); });
  });
  input.addEventListener('input', resizeInput);
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const question = input.value.replace(/\s+/g, ' ').trim();
    if (question.length < 2 || question.length > 800) return;
    ask(question);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !shell.hidden) closePanel();
  });

  const languageObserver = new MutationObserver(function () {
    if (!window.localStorage.getItem(STORAGE_KEY)) setLanguage(loadLanguage(), false);
  });
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  setLanguage(language, false);
}());
