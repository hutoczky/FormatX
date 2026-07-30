(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxOrganismVoice === 'ready-v2') return;
  ROOT.dataset.fxOrganismVoice = 'loading-v2';

  const MAX_QUESTION_LENGTH = 180;
  const STORAGE_KEY = 'formatx-organism-dialogue-enabled';
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
      enable: 'Organizmus bekapcsolása',
      disable: 'Organizmus kikapcsolása',
      close: 'Gondolatbuborék bezárása',
      inputLabel: 'Kérdés az Organizmushoz',
      placeholder: 'Kérdezz a FormatX rendszerről…',
      ask: 'Kérdés elküldése',
      organismOn: 'Organizmus be',
      organismOff: 'Organizmus ki',
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
      enable: 'Enable the Organism',
      disable: 'Disable the Organism',
      close: 'Close thought dialogue',
      inputLabel: 'Question for the Organism',
      placeholder: 'Ask about the FormatX system…',
      ask: 'Send question',
      organismOn: 'Organism on',
      organismOff: 'Organism off',
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
      ['szia|hello|üdv|ki vagy|bemutatkoz', 'Üdvözöllek. Én vagyok a FormatX MAG, az oldal helyi rendszerhangja. A látható funkciókról és licencfeltételekről adok ellenőrizhető választ.'],
      ['mi a formatx|mire jó|mit tud|funkció', 'A FormatX Suite Pro meghajtók, adathordozók és operációs környezetek felmérésére, előkészítésére, módosítására és visszaellenőrzésére készült technikusi rendszer.'],
      ['ár|ára|mennyibe|csomag', 'A havi HUF-csomagok jelenleg: Business Lite 7 900 Ft, Business Pro 15 900 Ft, Technician Team 29 900 Ft. A kereskedelmi panel EUR összegeket is mutat.'],
      ['licenc|licence|próba|5 nap', 'A teljes kiadáshoz 5 napos próbalicenc tartozik. A fizetős csomag az alkalmazás használatára ad korlátozott, nem kizárólagos és nem átruházható jogot. Automatikus megújítás nincs; a részletes licenc a FormatX honlapján nyílik meg.'],
      ['forráskód|nyílt forrás|másol|módosít|terjeszt', 'A FormatX nem nyílt forráskódú. A forráskód másolása, módosítása, közzététele, terjesztése vagy továbbértékesítése csak a szerző előzetes írásos engedélyével megengedett.'],
      ['qr|fizetés|bank|átutal', 'A csomag QR-kódja először a kiválasztott rendelési oldalt nyitja meg. A tényleges banki QR az adatok és a rendelési azonosító megadása után készül el. A rendszer nem végez automatikus terhelést.'],
      ['biztonság|biztonságos|védelem|sha|ed25519', 'A FormatX biztonsági modellje célmeghajtó-védelmet, egyértelmű megerősítéseket, naplózott lépéseket, SHA-256 ellenőrzést és Ed25519-aláírási bizonyítékot használ.'],
      ['platform|linux|bazzite|windows|macos|android', 'A Linux és Bazzite az elsődleges környezet. A honlap Windows-, macOS-, webes és Android-hozzáférést is felsorol; az Android APK a jeladó és a fő letöltési műveletek közül érhető el.'],
      ['letölt|apk|release|kiadás', 'A teljes kiadás a fő letöltési gombból, az Android APK a külön Android műveletből, a kiadások és támogatási információk pedig a 06 JELADÓ panelből érhetők el.'],
      ['modul|szerv|iso|formáz|partíció|smart|törlés', 'A hat rendszerszerv: ISO írás és ellenőrzés, formázás, partíciótervezés, biztonságos törlés, SMART-diagnosztika és AI-alapú magyarázat.'],
      ['adat|adatküldés|privát|kérdés hova', 'Ez a gondolatbuborék helyben, a böngészőben válaszol. A beírt kérdés nem kerül elküldésre külső szervernek vagy AI-szolgáltatásnak.'],
      ['köszön|köszi|rendben', 'Szívesen. A rendszer készen áll a következő kérdésre.']
    ],
    en: [
      ['hello|hi|welcome|who are you|introduce', 'Welcome. I am the FormatX CORE, the local system voice of this site. I provide verifiable answers about the visible features and licence terms.'],
      ['what is formatx|what does it do|features|purpose', 'FormatX Suite Pro is a technician system for assessing, preparing, modifying and verifying drives, storage media and operating environments.'],
      ['price|pricing|cost|plan', 'Current monthly HUF plans are Business Lite at 7,900 HUF, Business Pro at 15,900 HUF and Technician Team at 29,900 HUF. The commerce panel also shows EUR amounts.'],
      ['licence|license|trial|5 day', 'The full release includes a 5-day trial licence. A paid plan grants a limited, non-exclusive and non-transferable right to use the application. There is no automatic renewal, and the detailed licence opens inside the FormatX website.'],
      ['source code|open source|copy|modify|distribute', 'FormatX is not open-source software. Copying, modifying, publishing, distributing or reselling the source requires the author’s prior written permission.'],
      ['qr|payment|bank|transfer', 'A plan QR code first opens the selected checkout page. The actual bank-transfer QR is generated after order details and the order reference are entered. The system never charges automatically.'],
      ['safety|secure|protection|sha|ed25519', 'The FormatX safety model uses target-drive protection, explicit confirmations, logged steps, SHA-256 verification and Ed25519 signature proof.'],
      ['platform|linux|bazzite|windows|macos|android', 'Linux and Bazzite are the primary environment. The site also lists Windows, macOS, web and Android access; the Android APK is available from the beacon and the main download actions.'],
      ['download|apk|release', 'The full release is available from the main download action, the Android APK from the Android action, and releases and support information from the 06 BEACON panel.'],
      ['module|organ|iso|format|partition|smart|erase', 'The six system organs are ISO writing and verification, formatting, partition planning, secure erase, SMART diagnostics and AI-assisted guidance.'],
      ['data|privacy|send|question stored', 'This thought dialogue answers locally in your browser. Your question is not sent to an external server or AI service.'],
      ['thanks|thank you|okay', 'You are welcome. The system is ready for the next question.']
    ]
  });

  let shell;
  let trigger;
  let bubble;
  let sceneLabel;
  let output;
  let input;
  let form;
  let masterButton;
  let voiceButton;
  let repeatButton;
  let privacyNote;
  let closeButton;
  let currentScene = 0;
  let currentText = '';
  let opened = false;
  let enabled = readEnabled();
  let speechEnabled = false;
  const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let selectedVoice = null;
  let lastUserGesture = -Infinity;

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function copy() {
    return COPY[language()];
  }

  function readEnabled() {
    try { return localStorage.getItem(STORAGE_KEY) !== 'false'; } catch (_) { return true; }
  }

  function storeEnabled(value) {
    try { localStorage.setItem(STORAGE_KEY, String(Boolean(value))); } catch (_) {}
  }

  function ensureStyle() {
    if (document.querySelector('link[data-fx-organism-voice-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/organism-voice.css?v=20260730-organism-voice-2';
    link.dataset.fxOrganismVoiceStyle = 'true';
    document.head.appendChild(link);
  }

  function create(tag, className, attributes) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    Object.entries(attributes || {}).forEach(([name, value]) => {
      if (value !== null && value !== undefined) node.setAttribute(name, String(value));
    });
    return node;
  }

  function buildInterface() {
    shell = create('aside', 'fx-organism-dialogue', {
      'aria-label': copy().region,
      'data-fx-organism-dialogue': 'ready-v2'
    });
    bubble = create('section', 'fx-organism-thought', {
      hidden: '',
      'aria-hidden': 'true',
      'aria-live': 'polite',
      'aria-atomic': 'true'
    });

    const head = create('header', 'fx-organism-thought-head');
    sceneLabel = create('span', 'fx-organism-thought-label');
    closeButton = create('button', 'fx-organism-thought-close', { type: 'button' });
    closeButton.textContent = '×';
    head.append(sceneLabel, closeButton);

    output = create('p', 'fx-organism-thought-output');

    form = create('form', 'fx-organism-question');
    const hiddenLabel = create('label', 'fx-visually-hidden', { for: 'fx-organism-question-input' });
    input = create('input', '', {
      id: 'fx-organism-question-input',
      type: 'text',
      maxlength: String(MAX_QUESTION_LENGTH),
      autocomplete: 'off',
      spellcheck: 'true'
    });
    const ask = create('button', 'fx-organism-ask', { type: 'submit' });
    ask.textContent = '↗';
    form.append(hiddenLabel, input, ask);

    const controls = create('div', 'fx-organism-thought-controls');
    masterButton = create('button', 'fx-organism-master-toggle', { type: 'button', 'aria-pressed': 'true' });
    voiceButton = create('button', 'fx-organism-voice-toggle', { type: 'button', 'aria-pressed': 'false' });
    repeatButton = create('button', 'fx-organism-repeat', { type: 'button' });
    repeatButton.textContent = '↻';
    controls.append(masterButton, voiceButton, repeatButton);

    privacyNote = create('small', 'fx-organism-privacy');
    bubble.append(head, output, form, controls, privacyNote);

    trigger = create('button', 'fx-organism-thought-trigger', {
      type: 'button',
      'aria-expanded': 'false'
    });
    trigger.innerHTML = '<span aria-hidden="true">💭</span><b>MAG</b>';

    shell.append(bubble, trigger);
    document.body.appendChild(shell);

    trigger.addEventListener('click', () => {
      if (!enabled) {
        setEnabled(true, true);
        return;
      }
      setOpen(!opened, true);
    });
    closeButton.addEventListener('click', () => setOpen(false, false));
    masterButton.addEventListener('click', () => setEnabled(!enabled, false));
    voiceButton.addEventListener('click', toggleVoice);
    repeatButton.addEventListener('click', () => {
      if (!enabled) return;
      setOpen(true, false);
      speak(currentText, true);
    });
    form.addEventListener('submit', handleQuestion);
  }

  function setOpen(next, focusInput) {
    opened = enabled && Boolean(next);
    shell?.classList.toggle('is-open', opened);
    if (bubble) {
      bubble.hidden = !opened;
      bubble.setAttribute('aria-hidden', String(!opened));
    }
    trigger?.setAttribute('aria-expanded', String(opened));
    ROOT.dataset.fxOrganismThought = opened ? 'open' : 'closed';
    if (opened && focusInput) requestAnimationFrame(() => input?.focus({ preventScroll: true }));
  }

  function setEnabled(next, openAfterEnable) {
    enabled = Boolean(next);
    storeEnabled(enabled);
    ROOT.dataset.fxOrganismDialogueEnabled = String(enabled);
    shell?.classList.toggle('is-disabled', !enabled);
    if (!enabled) {
      speechEnabled = false;
      stopSpeech();
      setOpen(false, false);
    } else if (openAfterEnable) {
      currentText = copy().welcome;
      setOpen(true, true);
    }
    updateLanguage();
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
    const item = ANSWERS[language()].find(([keys]) => keys.split('|').some(key => value.includes(fold(key))));
    return item?.[1] || copy().unknown;
  }

  function handleQuestion(event) {
    event.preventDefault();
    if (!enabled) return;
    const question = String(input?.value || '').slice(0, MAX_QUESTION_LENGTH).trim();
    const answer = answerQuestion(question);
    showResponse(answer, language() === 'en' ? 'FORMATX / RESPONSE' : 'FORMATX / VÁLASZ', true, speechEnabled);
    if (input) {
      input.value = '';
      input.focus({ preventScroll: true });
    }
    ROOT.dataset.fxOrganismLastIntent = answer === copy().unknown ? 'unknown' : 'matched';
  }

  function selectVoice() {
    if (!speechSupported) return null;
    const prefix = language() === 'en' ? 'en' : 'hu';
    const voices = speechSynthesis.getVoices();
    selectedVoice = voices.find(voice => voice.lang.toLowerCase().startsWith(prefix) && voice.localService)
      || voices.find(voice => voice.lang.toLowerCase().startsWith(prefix))
      || null;
    ROOT.dataset.fxOrganismVoiceLanguage = selectedVoice?.lang || (language() === 'en' ? 'en-GB' : 'hu-HU');
    return selectedVoice;
  }

  function speak(text, explicit) {
    if (!enabled || !speechSupported || !speechEnabled || !text) return;
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
    if (speechSupported) {
      try { speechSynthesis.cancel(); } catch (_) {}
    }
    ROOT.dataset.fxOrganismSpeech = 'idle';
    shell?.classList.remove('is-speaking');
  }

  function toggleVoice() {
    if (!enabled) return;
    if (!speechSupported) {
      showResponse(copy().unsupported, '', true, false);
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

  function showResponse(text, labelText, open, shouldSpeak) {
    if (!enabled) return;
    currentText = String(text || '').trim();
    if (output) output.textContent = currentText;
    if (sceneLabel) sceneLabel.textContent = labelText || SCENES[currentScene].label[language()];
    if (open) setOpen(true, false);
    ROOT.dataset.fxOrganismResponse = 'ready';
    dispatchEvent(new CustomEvent('formatx:organismresponse', {
      detail: { text: currentText, scene: currentScene, language: language(), localOnly: true }
    }));
    if (shouldSpeak) speak(currentText, false);
  }

  function showScene(scene, shouldSpeak) {
    currentScene = Math.max(0, Math.min(SCENES.length - 1, Number(scene) || 0));
    if (!enabled) return;
    const item = SCENES[currentScene];
    showResponse(item.response[language()], item.label[language()], false, shouldSpeak);
  }

  function updateLanguage() {
    if (!shell) return;
    const words = copy();
    shell.setAttribute('aria-label', words.region);
    trigger.setAttribute('aria-label', enabled ? words.open : words.enable);
    trigger.title = enabled ? words.open : words.enable;
    trigger.querySelector('b').textContent = enabled ? (language() === 'en' ? 'CORE' : 'MAG') : (language() === 'en' ? 'OFF' : 'KI');
    closeButton.setAttribute('aria-label', words.close);
    input.placeholder = words.placeholder;
    input.setAttribute('aria-label', words.inputLabel);
    form.querySelector('label').textContent = words.inputLabel;
    const ask = form.querySelector('.fx-organism-ask');
    ask.setAttribute('aria-label', words.ask);
    ask.title = words.ask;
    masterButton.textContent = enabled ? '◉ ' + words.organismOn : '○ ' + words.organismOff;
    masterButton.setAttribute('aria-pressed', String(enabled));
    masterButton.setAttribute('aria-label', enabled ? words.disable : words.enable);
    masterButton.title = enabled ? words.disable : words.enable;
    voiceButton.textContent = speechEnabled ? '🔊 ' + words.voiceOn : '🔇 ' + words.voiceOff;
    voiceButton.setAttribute('aria-pressed', String(speechEnabled));
    voiceButton.setAttribute('aria-label', speechEnabled ? words.voiceDisable : words.voiceEnable);
    voiceButton.title = speechEnabled ? words.voiceDisable : words.voiceEnable;
    voiceButton.disabled = !enabled || !speechSupported;
    repeatButton.setAttribute('aria-label', words.repeat);
    repeatButton.title = words.repeat;
    repeatButton.disabled = !enabled || !speechSupported;
    privacyNote.textContent = words.privacy;
    selectVoice();
    if (enabled) {
      const item = SCENES[currentScene];
      currentText = currentText || item.response[language()];
      output.textContent = currentText;
      sceneLabel.textContent = item.label[language()];
    }
  }

  function handleStateChange(event) {
    const recentGesture = performance.now() - lastUserGesture < 1400;
    showScene(event.detail?.scene, enabled && speechEnabled && recentGesture);
  }

  function noteUserGesture() {
    lastUserGesture = performance.now();
  }

  function initialise() {
    ensureStyle();
    buildInterface();
    currentScene = Math.max(0, Math.min(5, Number(ROOT.dataset.fxScene || 0)));
    currentText = copy().welcome;
    setEnabled(enabled, false);
    setOpen(false, false);

    document.addEventListener('pointerdown', noteUserGesture, true);
    document.addEventListener('keydown', noteUserGesture, true);
    addEventListener('formatx:organismstatechange', handleStateChange);
    addEventListener('formatx:languagechange', () => {
      currentText = SCENES[currentScene].response[language()];
      updateLanguage();
    });
    addEventListener('pagehide', stopSpeech);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopSpeech();
    });

    if (speechSupported) {
      selectVoice();
      speechSynthesis.addEventListener?.('voiceschanged', selectVoice);
    }

    window.FormatXOrganismVoice = Object.freeze({
      ask(question) {
        if (!enabled) return '';
        const answer = answerQuestion(question);
        showResponse(answer, language() === 'en' ? 'FORMATX / RESPONSE' : 'FORMATX / VÁLASZ', true, speechEnabled);
        return answer;
      },
      say(text) {
        if (enabled) showResponse(String(text || ''), '', true, speechEnabled);
      },
      open() { if (enabled) setOpen(true, false); },
      close() { setOpen(false, false); },
      setEnabled(value) { setEnabled(Boolean(value), false); },
      setVoiceEnabled(value) {
        speechEnabled = Boolean(value) && enabled && speechSupported;
        ROOT.dataset.fxOrganismVoiceEnabled = String(speechEnabled);
        updateLanguage();
        if (!speechEnabled) stopSpeech();
      }
    });

    ROOT.dataset.fxOrganismVoice = 'ready-v2';
    ROOT.dataset.fxOrganismVoiceEnabled = 'false';
    ROOT.dataset.fxOrganismDialogueEnabled = String(enabled);
    ROOT.dataset.fxOrganismSpeech = 'idle';
    dispatchEvent(new CustomEvent('formatx:organismvoiceready', {
      detail: { speechSupported, localOnly: true, scenes: SCENES.length, enabled }
    }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());