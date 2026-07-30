(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxOrganismVoice === 'ready-v1') return;
  ROOT.dataset.fxOrganismVoice = 'loading-v1';

  const SUPPORTED_LANGUAGES = new Set(['hu', 'en']);
  const MAX_QUESTION_LENGTH = 180;
  const SCENES = Object.freeze([
    {
      id: 'hero',
      label: { hu: '01 / MAG', en: '01 / CORE' },
      response: {
        hu: 'A MAG fogja össze a FormatX teljes élő rendszerét. Innen érhető el az idegrendszer, a hat modul, a licencelés, a biztonsági váz és a kiadási jeladó.',
        en: 'The CORE coordinates the entire FormatX living system. From here you can reach the nervous system, six modules, licensing, the safety skeleton and the release beacon.'
      }
    },
    {
      id: 'experience',
      label: { hu: '02 / IDEGRENDSZER', en: '02 / NERVOUS SYSTEM' },
      response: {
        hu: 'Az idegrendszer felderíti a környezetet, tervet készít, kontrolláltan végrehajtja a műveletet, majd visszaellenőrzi az eredményt.',
        en: 'The nervous system discovers the environment, builds a plan, executes under control and then verifies the result.'
      }
    },
    {
      id: 'capabilities',
      label: { hu: '03 / SZERVEK', en: '03 / ORGANS' },
      response: {
        hu: 'A rendszerszervek hat specializált modult jelentenek: ISO-írás, formázás, partíciótervezés, biztonságos törlés, SMART-vizsgálat és AI-alapú magyarázat.',
        en: 'The system organs are six specialised modules: ISO writing, formatting, partition planning, secure erase, SMART diagnostics and AI-assisted guidance.'
      }
    },
    {
      id: 'pricing',
      label: { hu: '04 / LICENC ÉS ÁRAK', en: '04 / LICENCE & PRICING' },
      response: {
        hu: 'A kereskedelmi szív kezeli a csomagokat, a HUF és EUR összegeket, a QR-belépést és a kézi banki ellenőrzéshez kapcsolódó fizetési folyamatot.',
        en: 'The commerce heart manages plans, HUF and EUR amounts, QR access and the payment flow connected to manual bank verification.'
      }
    },
    {
      id: 'system',
      label: { hu: '05 / BIZTONSÁGI VÁZ', en: '05 / SAFETY SKELETON' },
      response: {
        hu: 'A biztonsági váz célmeghajtó-védelmet, megerősítéseket, naplózást, SHA-256 ellenőrzést és Ed25519-aláírási bizonyítékot kapcsol a kritikus műveletekhez.',
        en: 'The safety skeleton adds target-drive protection, confirmations, logging, SHA-256 verification and Ed25519 signature proof to critical operations.'
      }
    },
    {
      id: 'resources',
      label: { hu: '06 / JELADÓ', en: '06 / BEACON' },
      response: {
        hu: 'A jeladó gyűjti össze a stabil kiadásokat, az Android alkalmazást, a támogatást, a dokumentációt és a helyben megnyíló jogi információkat.',
        en: 'The beacon collects stable releases, the Android application, support, documentation and legal information that opens inside the FormatX site.'
      }
    }
  ]);

  const COPY = Object.freeze({
    hu: {
      region: 'A FormatX Organizmus válaszai',
      open: 'Az Organizmus gondolatainak megnyitása',
      close: 'Gondolatbuborék bezárása',
      inputLabel: 'Kérdés az Organizmushoz',
      placeholder: 'Kérdezz a FormatX rendszerről…',
      ask: 'Kérdés elküldése',
      voiceOn: 'Hang be',
      voiceOff: 'Hang ki',
      voiceEnable: 'Organizmus hangjának bekapcsolása',
      voiceDisable: 'Organizmus hangjának kikapcsolása',
      repeat: 'Válasz újbóli felolvasása',
      privacy: 'Helyi válaszadás · nincs adatküldés',
      unsupported: 'A böngésző ezen az eszközön nem támogatja a gépi beszédet.',
      welcome: 'Kapcsolat létrejött. Én vagyok a FormatX MAG. Kérdezz a működésről, modulokról, licencekről, biztonságról, fizetésről vagy letöltésről.',
      empty: 'Írj be egy kérdést, és a helyi FormatX tudás alapján válaszolok.',
      unknown: 'Ezt a kérdést a helyi tudásom nem tudja biztosan megválaszolni. Kérdezz a működésről, modulokról, árakról, licencről, QR-fizetésről, biztonságról vagy letöltésről.'
    },
    en: {
      region: 'FormatX Organism responses',
      open: 'Open the Organism thought dialogue',
      close: 'Close thought dialogue',
      inputLabel: 'Question for the Organism',
      placeholder: 'Ask about the FormatX system…',
      ask: 'Send question',
      voiceOn: 'Voice on',
      voiceOff: 'Voice off',
      voiceEnable: 'Enable the Organism voice',
      voiceDisable: 'Disable the Organism voice',
      repeat: 'Read the response again',
      privacy: 'Local responses · no data is sent',
      unsupported: 'Speech synthesis is not supported by this browser on this device.',
      welcome: 'Connection established. I am the FormatX CORE. Ask about workflow, modules, licences, safety, payment or downloads.',
      empty: 'Enter a question and I will answer from the local FormatX knowledge base.',
      unknown: 'My local knowledge cannot answer that question reliably. Ask about workflow, modules, pricing, licences, QR payment, safety or downloads.'
    }
  });

  const ANSWERS = Object.freeze({
    hu: [
      {
        keys: ['szia', 'hello', 'üdv', 'ki vagy', 'bemutatkoz'],
        text: 'Üdvözöllek. Én vagyok a FormatX MAG, az oldal helyi rendszerhangja. A látható funkciókról és licencfeltételekről adok ellenőrizhető választ.'
      },
      {
        keys: ['mi a formatx', 'mire jó', 'mit tud', 'funkció'],
        text: 'A FormatX Suite Pro meghajtók, adathordozók és operációs környezetek felmérésére, előkészítésére, módosítására és visszaellenőrzésére készült technikusi rendszer.'
      },
      {
        keys: ['ár', 'ára', 'mennyibe', 'csomag'],
        text: 'A havi HUF-csomagok jelenleg: Business Lite 7 900 Ft, Business Pro 15 900 Ft, Technician Team 29 900 Ft. A kereskedelmi panel EUR összegeket is mutat.'
      },
      {
        keys: ['licenc', 'licence', 'próba', '5 nap'],
        text: 'A teljes kiadáshoz 5 napos próbalicenc tartozik. A fizetős csomag az alkalmazás használatára ad korlátozott, nem kizárólagos és nem átruházható jogot. Automatikus megújítás nincs; a részletes licenc a FormatX honlapján nyílik meg.'
      },
      {
        keys: ['forráskód', 'nyílt forrás', 'másol', 'módosít', 'terjeszt'],
        text: 'A FormatX nem nyílt forráskódú. A forráskód másolása, módosítása, közzététele, terjesztése vagy továbbértékesítése csak a szerző előzetes írásos engedélyével megengedett.'
      },
      {
        keys: ['qr', 'fizetés', 'bank', 'átutal'],
        text: 'A csomag QR-kódja először a kiválasztott rendelési oldalt nyitja meg. A tényleges banki QR az adatok és a rendelési azonosító megadása után készül el. A rendszer nem végez automatikus terhelést.'
      },
      {
        keys: ['biztonság', 'biztonságos', 'védelem', 'sha', 'ed25519'],
        text: 'A FormatX biztonsági modellje célmeghajtó-védelmet, egyértelmű megerősítéseket, naplózott lépéseket, SHA-256 ellenőrzést és Ed25519-aláírási bizonyítékot használ.'
      },
      {
        keys: ['platform', 'linux', 'bazzite', 'windows', 'macos', 'android'],
        text: 'A Linux és Bazzite az elsődleges környezet. A honlap Windows-, macOS-, webes és Android-hozzáférést is felsorol; az Android APK a jeladó és a fő letöltési műveletek közül érhető el.'
      },
      {
        keys: ['letölt', 'apk', 'release', 'kiadás'],
        text: 'A teljes kiadás a fő letöltési gombból, az Android APK a külön Android műveletből, a kiadások és támogatási információk pedig a 06 JELADÓ panelből érhetők el.'
      },
      {
        keys: ['modul', 'szerv', 'iso', 'formáz', 'partíció', 'smart', 'törlés'],
        text: 'A hat rendszerszerv: ISO írás és ellenőrzés, formázás, partíciótervezés, biztonságos törlés, SMART-diagnosztika és AI-alapú magyarázat.'
      },
      {
        keys: ['adat', 'adatküldés', 'privát', 'kérdés hova'],
        text: 'Ez a gondolatbuborék helyben, a böngészőben válaszol. A beírt kérdés nem kerül elküldésre külső szervernek vagy AI-szolgáltatásnak.'
      },
      {
        keys: ['köszön', 'köszi', 'rendben'],
        text: 'Szívesen. A rendszer készen áll a következő kérdésre.'
      }
    ],
    en: [
      {
        keys: ['hello', 'hi', 'welcome', 'who are you', 'introduce'],
        text: 'Welcome. I am the FormatX CORE, the local system voice of this site. I provide verifiable answers about the visible features and licence terms.'
      },
      {
        keys: ['what is formatx', 'what does it do', 'features', 'purpose'],
        text: 'FormatX Suite Pro is a technician system for assessing, preparing, modifying and verifying drives, storage media and operating environments.'
      },
      {
        keys: ['price', 'pricing', 'cost', 'plan'],
        text: 'Current monthly HUF plans are Business Lite at 7,900 HUF, Business Pro at 15,900 HUF and Technician Team at 29,900 HUF. The commerce panel also shows EUR amounts.'
      },
      {
        keys: ['licence', 'license', 'trial', '5 day'],
        text: 'The full release includes a 5-day trial licence. A paid plan grants a limited, non-exclusive and non-transferable right to use the application. There is no automatic renewal, and the detailed licence opens inside the FormatX website.'
      },
      {
        keys: ['source code', 'open source', 'copy', 'modify', 'distribute'],
        text: 'FormatX is not open-source software. Copying, modifying, publishing, distributing or reselling the source requires the author’s prior written permission.'
      },
      {
        keys: ['qr', 'payment', 'bank', 'transfer'],
        text: 'A plan QR code first opens the selected checkout page. The actual bank-transfer QR is generated after order details and the order reference are entered. The system never charges automatically.'
      },
      {
        keys: ['safety', 'secure', 'protection', 'sha', 'ed25519'],
        text: 'The FormatX safety model uses target-drive protection, explicit confirmations, logged steps, SHA-256 verification and Ed25519 signature proof.'
      },
      {
        keys: ['platform', 'linux', 'bazzite', 'windows', 'macos', 'android'],
        text: 'Linux and Bazzite are the primary environment. The site also lists Windows, macOS, web and Android access; the Android APK is available from the beacon and the main download actions.'
      },
      {
        keys: ['download', 'apk', 'release'],
        text: 'The full release is available from the main download action, the Android APK from the Android action, and releases and support information from the 06 BEACON panel.'
      },
      {
        keys: ['module', 'organ', 'iso', 'format', 'partition', 'smart', 'erase'],
        text: 'The six system organs are ISO writing and verification, formatting, partition planning, secure erase, SMART diagnostics and AI-assisted guidance.'
      },
      {
        keys: ['data', 'privacy', 'send', 'question stored'],
        text: 'This thought dialogue answers locally in your browser. Your question is not sent to an external server or AI service.'
      },
      {
        keys: ['thanks', 'thank you', 'okay'],
        text: 'You are welcome. The system is ready for the next question.'
      }
    ]
  });

  let shell;
  let trigger;
  let bubble;
  let label;
  let output;
  let input;
  let voiceButton;
  let repeatButton;
  let privacyNote;
  let form;
  let closeButton;
  let currentScene = 0;
  let currentText = '';
  let opened = false;
  let speechEnabled = false;
  let speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let selectedVoice = null;
  let welcomeShown = false;

  function language() {
    return SUPPORTED_LANGUAGES.has(ROOT.lang) ? ROOT.lang : 'hu';
  }

  function copy() {
    return COPY[language()];
  }

  function ensureStyle() {
    if (document.querySelector('link[data-fx-organism-voice-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/organism-voice.css?v=20260730-organism-voice-1';
    link.dataset.fxOrganismVoiceStyle = 'true';
    document.head.appendChild(link);
  }

  function create(tag, className, attributes) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (attributes) {
      Object.entries(attributes).forEach(([name, value]) => {
        if (value !== null && value !== undefined) node.setAttribute(name, String(value));
      });
    }
    return node;
  }

  function buildInterface() {
    shell = create('aside', 'fx-organism-dialogue', {
      'aria-label': copy().region,
      'data-fx-organism-dialogue': 'ready-v1'
    });

    bubble = create('section', 'fx-organism-thought', {
      hidden: '',
      'aria-hidden': 'true',
      'aria-live': 'polite',
      'aria-atomic': 'true'
    });

    const head = create('header', 'fx-organism-thought-head');
    label = create('span', 'fx-organism-thought-label');
    closeButton = create('button', 'fx-organism-thought-close', {
      type: 'button',
      'aria-label': copy().close
    });
    closeButton.textContent = '×';
    head.append(label, closeButton);

    output = create('p', 'fx-organism-thought-output');

    form = create('form', 'fx-organism-question');
    const inputLabel = create('label', 'fx-visually-hidden', { for: 'fx-organism-question-input' });
    inputLabel.textContent = copy().inputLabel;
    input = create('input', '', {
      id: 'fx-organism-question-input',
      type: 'text',
      maxlength: String(MAX_QUESTION_LENGTH),
      autocomplete: 'off',
      spellcheck: 'true',
      placeholder: copy().placeholder,
      'aria-label': copy().inputLabel
    });
    const ask = create('button', 'fx-organism-ask', {
      type: 'submit',
      'aria-label': copy().ask,
      title: copy().ask
    });
    ask.textContent = '↗';
    form.append(inputLabel, input, ask);

    const controls = create('div', 'fx-organism-thought-controls');
    voiceButton = create('button', 'fx-organism-voice-toggle', {
      type: 'button',
      'aria-pressed': 'false'
    });
    repeatButton = create('button', 'fx-organism-repeat', {
      type: 'button',
      'aria-label': copy().repeat,
      title: copy().repeat
    });
    repeatButton.textContent = '↻';
    privacyNote = create('small', 'fx-organism-privacy');
    controls.append(voiceButton, repeatButton);

    bubble.append(head, output, form, controls, privacyNote);

    trigger = create('button', 'fx-organism-thought-trigger', {
      type: 'button',
      'aria-expanded': 'false',
      'aria-label': copy().open,
      title: copy().open
    });
    trigger.innerHTML = '<span aria-hidden="true">💭</span><b>MAG</b>';

    shell.append(bubble, trigger);
    document.body.appendChild(shell);

    trigger.addEventListener('click', () => setOpen(!opened, true));
    closeButton.addEventListener('click', () => setOpen(false, true));
    form.addEventListener('submit', handleQuestion);
    voiceButton.addEventListener('click', toggleVoice);
    repeatButton.addEventListener('click', () => {
      setOpen(true, false);
      speak(currentText, true);
    });
  }

  function setOpen(next, focusInput) {
    opened = Boolean(next);
    shell?.classList.toggle('is-open', opened);
    if (bubble) {
      bubble.hidden = !opened;
      bubble.setAttribute('aria-hidden', String(!opened));
    }
    trigger?.setAttribute('aria-expanded', String(opened));
    ROOT.dataset.fxOrganismThought = opened ? 'open' : 'closed';
    if (opened && focusInput) requestAnimationFrame(() => input?.focus({ preventScroll: true }));
  }

  function fold(value) {
    return String(value || '')
      .toLocaleLowerCase(language() === 'hu' ? 'hu-HU' : 'en-GB')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9€£$\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function answerQuestion(question) {
    const value = fold(question);
    if (!value) return copy().empty;
    const answer = ANSWERS[language()].find(item => item.keys.some(key => value.includes(fold(key))));
    return answer?.text || copy().unknown;
  }

  function handleQuestion(event) {
    event.preventDefault();
    const question = String(input?.value || '').slice(0, MAX_QUESTION_LENGTH).trim();
    const answer = answerQuestion(question);
    showResponse(answer, {
      labelText: language() === 'en' ? 'FORMATX / RESPONSE' : 'FORMATX / VÁLASZ',
      open: true,
      speak: speechEnabled
    });
    if (input) {
      input.value = '';
      input.focus({ preventScroll: true });
    }
    ROOT.dataset.fxOrganismLastIntent = answer === copy().unknown ? 'unknown' : 'matched';
  }

  function selectVoice() {
    if (!speechSupported) return null;
    const langPrefix = language() === 'en' ? 'en' : 'hu';
    const voices = speechSynthesis.getVoices();
    selectedVoice = voices.find(voice => voice.lang.toLowerCase().startsWith(langPrefix) && voice.localService)
      || voices.find(voice => voice.lang.toLowerCase().startsWith(langPrefix))
      || null;
    ROOT.dataset.fxOrganismVoiceLanguage = selectedVoice?.lang || (language() === 'en' ? 'en-GB' : 'hu-HU');
    return selectedVoice;
  }

  function speak(text, explicit) {
    if (!speechSupported || !speechEnabled || !text) return;
    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language() === 'en' ? 'en-GB' : 'hu-HU';
      utterance.rate = language() === 'en' ? 0.94 : 0.91;
      utterance.pitch = 0.82;
      utterance.volume = 0.96;
      const voice = selectedVoice || selectVoice();
      if (voice) utterance.voice = voice;
      utterance.addEventListener('start', () => {
        ROOT.dataset.fxOrganismSpeech = 'speaking';
        shell?.classList.add('is-speaking');
        dispatchEvent(new CustomEvent('formatx:organismspeechstart', { detail: { text, explicit: Boolean(explicit) } }));
      });
      const finish = () => {
        ROOT.dataset.fxOrganismSpeech = 'idle';
        shell?.classList.remove('is-speaking');
        dispatchEvent(new CustomEvent('formatx:organismspeechend'));
      };
      utterance.addEventListener('end', finish, { once: true });
      utterance.addEventListener('error', finish, { once: true });
      speechSynthesis.speak(utterance);
    } catch (error) {
      ROOT.dataset.fxOrganismSpeech = 'error';
      ROOT.dataset.fxOrganismVoiceError = String(error?.message || error).slice(0, 120);
    }
  }

  function stopSpeech() {
    if (!speechSupported) return;
    try { speechSynthesis.cancel(); } catch (_) {}
    ROOT.dataset.fxOrganismSpeech = 'idle';
    shell?.classList.remove('is-speaking');
  }

  function toggleVoice() {
    if (!speechSupported) {
      showResponse(copy().unsupported, { open: true, speak: false });
      return;
    }
    speechEnabled = !speechEnabled;
    ROOT.dataset.fxOrganismVoiceEnabled = String(speechEnabled);
    updateLanguage();
    if (speechEnabled) {
      selectVoice();
      speak(currentText || copy().welcome, true);
    } else {
      stopSpeech();
    }
  }

  function showResponse(text, options) {
    const settings = Object.assign({ labelText: '', open: false, speak: false }, options);
    currentText = String(text || '').trim();
    if (output) output.textContent = currentText;
    if (label) label.textContent = settings.labelText || SCENES[currentScene]?.label[language()] || SCENES[0].label[language()];
    if (settings.open) setOpen(true, false);
    ROOT.dataset.fxOrganismResponse = 'ready';
    dispatchEvent(new CustomEvent('formatx:organismresponse', {
      detail: { text: currentText, scene: currentScene, language: language() }
    }));
    if (settings.speak) speak(currentText, false);
  }

  function showScene(scene, options) {
    const bounded = Math.max(0, Math.min(SCENES.length - 1, Number(scene) || 0));
    currentScene = bounded;
    const item = SCENES[bounded];
    showResponse(item.response[language()], {
      labelText: item.label[language()],
      open: options?.open === true,
      speak: options?.speak === true && speechEnabled
    });
  }

  function updateLanguage() {
    if (!shell) return;
    const words = copy();
    shell.setAttribute('aria-label', words.region);
    trigger.setAttribute('aria-label', words.open);
    trigger.title = words.open;
    closeButton.setAttribute('aria-label', words.close);
    input.placeholder = words.placeholder;
    input.setAttribute('aria-label', words.inputLabel);
    form.querySelector('label').textContent = words.inputLabel;
    const ask = form.querySelector('.fx-organism-ask');
    ask.setAttribute('aria-label', words.ask);
    ask.title = words.ask;
    voiceButton.textContent = speechEnabled ? '🔊 ' + words.voiceOn : '🔇 ' + words.voiceOff;
    voiceButton.setAttribute('aria-pressed', String(speechEnabled));
    voiceButton.setAttribute('aria-label', speechEnabled ? words.voiceDisable : words.voiceEnable);
    voiceButton.title = speechEnabled ? words.voiceDisable : words.voiceEnable;
    voiceButton.disabled = !speechSupported;
    repeatButton.setAttribute('aria-label', words.repeat);
    repeatButton.title = words.repeat;
    privacyNote.textContent = words.privacy;
    selectVoice();
    showScene(currentScene, { open: opened, speak: false });
  }

  function handleStateChange(event) {
    const scene = Math.max(0, Math.min(5, Number(event.detail?.scene) || 0));
    const sourceIsUser = performance.now() > 1000;
    showScene(scene, {
      open: opened,
      speak: speechEnabled && sourceIsUser
    });
  }

  function showWelcome() {
    if (welcomeShown) return;
    welcomeShown = true;
    currentScene = 0;
    showResponse(copy().welcome, {
      labelText: SCENES[0].label[language()],
      open: true,
      speak: false
    });
  }

  function initialise() {
    ensureStyle();
    buildInterface();
    updateLanguage();
    showScene(Number(ROOT.dataset.fxScene || 0), { open: false, speak: false });

    addEventListener('formatx:organismstatechange', handleStateChange);
    addEventListener('formatx:organismpanelopen', event => {
      const scene = SCENES.findIndex(item => item.id === event.detail?.id);
      if (scene >= 0) showScene(scene, { open: false, speak: speechEnabled });
    });
    addEventListener('formatx:organismpanelclose', () => showScene(0, { open: opened, speak: speechEnabled }));
    addEventListener('formatx:languagechange', updateLanguage);
    addEventListener('pagehide', stopSpeech);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopSpeech();
    });
    document.addEventListener('formatx:introcomplete', () => window.setTimeout(showWelcome, 420), { once: true });
    if (ROOT.classList.contains('fx-intro-complete')) window.setTimeout(showWelcome, 120);

    if (speechSupported) {
      selectVoice();
      speechSynthesis.addEventListener?.('voiceschanged', selectVoice);
    }

    window.FormatXOrganismVoice = Object.freeze({
      ask(question) {
        const answer = answerQuestion(question);
        showResponse(answer, { open: true, speak: speechEnabled });
        return answer;
      },
      say(text) {
        showResponse(String(text || ''), { open: true, speak: speechEnabled });
      },
      open() { setOpen(true, false); },
      close() { setOpen(false, false); },
      setVoiceEnabled(enabled) {
        speechEnabled = Boolean(enabled) && speechSupported;
        ROOT.dataset.fxOrganismVoiceEnabled = String(speechEnabled);
        updateLanguage();
        if (!speechEnabled) stopSpeech();
      }
    });

    ROOT.dataset.fxOrganismVoice = 'ready-v1';
    ROOT.dataset.fxOrganismVoiceEnabled = 'false';
    ROOT.dataset.fxOrganismSpeech = 'idle';
    dispatchEvent(new CustomEvent('formatx:organismvoiceready', {
      detail: { speechSupported, localOnly: true, scenes: SCENES.length }
    }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());