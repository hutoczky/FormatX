(function () {
  'use strict';

  const root = document.documentElement;
  const LANGUAGE_KEY = 'formatx-language';

  const TEXT = {
    hu: {
      skip: 'Ugrás a szimulátorhoz',
      headerStatus: 'SZIMULÁCIÓS KÖRNYEZET / NINCS VALÓDI ESZKÖZHOZZÁFÉRÉS',
      back: 'Vissza a főoldalra',
      heroTitle: 'Teszteld a projektet, mielőtt éles környezetbe kerül.',
      heroLead: 'A szimulátor ugyanazt a döntési és biztonsági logikát modellezi, amelyet a FormatX éles technikusi munkafolyamata használna. Válassz projektet, platformot és céleszközt, majd nézd végig a felmérést, a tervet, a biztonsági reteszt, a végrehajtást és az ellenőrzést.',
      badgeScenarios: 'éles munkatípus',
      badgePlatforms: 'platformprofil',
      badgeHardware: 'valódi hardverművelet',
      manifestTitle: 'Éles működés — biztonságos digitális másolatban',
      manifestOne: 'Valós munkafolyamat-logika',
      manifestTwo: 'Kockázat és célazonosítás',
      manifestThree: 'Hibainjektálás és fail-closed leállás',
      manifestFour: 'Exportálható végrehajtási jelentés',
      workspaceTitle: 'Éles projekt digitális ikerpárja',
      workspaceMode: 'MÓD',
      configurationEyebrow: 'PROJEKTKONFIGURÁCIÓ',
      configurationTitle: 'Mit szeretnél kipróbálni?',
      scenarioLegend: 'Munkatípus',
      scenarioIso: 'Telepítő adathordozó előkészítése és visszaellenőrzése',
      scenarioDiagnostics: 'Meghajtóállapot, hőmérséklet és hibakockázat elemzése',
      scenarioPartition: 'Partíciós terv előnézettel és célzárral',
      scenarioErase: 'Többlépcsős célmeghajtó-védelem és törlési szimuláció',
      platformLegend: 'Platformprofil',
      targetLegend: 'Szimulált céleszköz',
      twinEyebrow: 'DIGITÁLIS IKERPÁR',
      twinTitle: 'A projekt állapota valós időben',
      stepDiscover: 'FELDERÍTÉS',
      stepPlan: 'TERV',
      stepLock: 'CÉLZÁR',
      stepExecute: 'VÉGREHAJTÁS',
      stepVerify: 'ELLENŐRZÉS',
      telemetrySource: 'FORRÁS',
      telemetryTarget: 'CÉL',
      telemetryResult: 'VÁRHATÓ EREDMÉNY',
      inspectorEyebrow: 'ÉLES ELŐNÉZET',
      inspectorTitle: 'Mi történne valódi környezetben?',
      factProject: 'Projekt',
      factPlatform: 'Platform',
      factTarget: 'Céleszköz',
      factDuration: 'Becsült idő',
      riskLabel: 'KOCKÁZATI PROFIL',
      safetyTitle: 'Biztonsági retesz aktív',
      safetyCopy: 'Eltérés vagy bizonytalan cél esetén a folyamat fail-closed módon leáll.',
      faultTitle: 'Hibainjektálás',
      faultCopy: 'Szimulálj célazonosítási vagy integritási hibát a védelmi reakció teszteléséhez.',
      run: 'Szimuláció indítása',
      reset: 'Alaphelyzet',
      export: 'Jelentés exportálása',
      disclaimer: 'A szimulátor nem olvas, nem formáz és nem töröl valódi meghajtót. Az eredmények bemutató és munkafolyamat-tervezési célúak.',
      consoleTitle: 'Élő végrehajtási napló',
      logReady: 'Válassz projektet és indítsd el a digitális ikerpárt.',
      liveTitle: 'Mit mutat meg ez az éles termékről?',
      meaningOneTitle: 'Nem vakon hajt végre',
      meaningOneCopy: 'A FormatX előbb feltérképezi a környezetet, majd egyértelmű tervet és célazonosítást mutat.',
      meaningTwoTitle: 'A hiba is tervezett állapot',
      meaningTwoCopy: 'Az eltérés nem rejtett összeomlás: a rendszer leáll, megnevezi az okot és megőrzi az auditnyomot.',
      meaningThreeTitle: 'Minden eredmény ellenőrizhető',
      meaningThreeCopy: 'A végrehajtás végén állapot, integritás és dokumentálható eredmény tartozik a projekthez.',
      footer: 'Biztonságos digitális ikerpár a FormatX technikusi munkafolyamatainak éles előnézetéhez.',
      footerBack: 'Vissza a szimulátorhoz ↑',
      ready: 'KÉSZENLÉT',
      running: 'FUTÓ SZIMULÁCIÓ',
      complete: 'ELLENŐRZÖTT EREDMÉNY',
      blocked: 'BIZTONSÁGI LEÁLLÁS',
      progressReady: 'READY / VÁLASSZ KONFIGURÁCIÓT',
      progressComplete: 'COMPLETE / JELENTÉS ELKÉSZÜLT',
      progressBlocked: 'FAIL-CLOSED / MŰVELET LEÁLLÍTVA',
      riskNames: ['ALACSONY', 'KÖZEPES', 'MAGAS', 'KRITIKUS'],
      select: 'KIJELÖLVE',
      safetyRequired: 'A kiválasztott magas kockázatú munkafolyamat csak aktív biztonsági retesszel szimulálható.',
      exported: 'A szimulációs jelentés exportálva.',
      resetLog: 'A digitális ikerpár alaphelyzetbe állt.',
      cancelled: 'A korábbi szimuláció megszakítva.',
      pageTitle: 'FormatX Operational Twin | Projekt szimulátor',
      pageDescription: 'FormatX Operational Twin — biztonságos projekt-szimulátor az éles technikusi munkafolyamat kipróbálásához valódi meghajtó-hozzáférés nélkül.'
    },
    en: {
      skip: 'Skip to simulator',
      headerStatus: 'SIMULATION ENVIRONMENT / NO REAL DEVICE ACCESS',
      back: 'Back to home',
      heroTitle: 'Test the project before it reaches a live environment.',
      heroLead: 'The simulator models the same decision and safety logic that a live FormatX technician workflow would use. Choose a project, platform and target, then follow discovery, planning, target lock, controlled execution and verification.',
      badgeScenarios: 'live workflow types',
      badgePlatforms: 'platform profiles',
      badgeHardware: 'real hardware operations',
      manifestTitle: 'Production behaviour — inside a safe digital twin',
      manifestOne: 'Real workflow logic',
      manifestTwo: 'Risk and target identification',
      manifestThree: 'Fault injection and fail-closed stop',
      manifestFour: 'Exportable execution report',
      workspaceTitle: 'Digital twin of a live project',
      workspaceMode: 'MODE',
      configurationEyebrow: 'PROJECT CONFIGURATION',
      configurationTitle: 'What would you like to test?',
      scenarioLegend: 'Workflow type',
      scenarioIso: 'Prepare and verify bootable installation media',
      scenarioDiagnostics: 'Analyse drive health, temperature and failure risk',
      scenarioPartition: 'Preview a partition plan with explicit target lock',
      scenarioErase: 'Multi-stage target protection and erase simulation',
      platformLegend: 'Platform profile',
      targetLegend: 'Simulated target device',
      twinEyebrow: 'DIGITAL TWIN',
      twinTitle: 'Project state in real time',
      stepDiscover: 'DISCOVER',
      stepPlan: 'PLAN',
      stepLock: 'TARGET LOCK',
      stepExecute: 'EXECUTE',
      stepVerify: 'VERIFY',
      telemetrySource: 'SOURCE',
      telemetryTarget: 'TARGET',
      telemetryResult: 'EXPECTED OUTCOME',
      inspectorEyebrow: 'LIVE PREVIEW',
      inspectorTitle: 'What would happen in production?',
      factProject: 'Project',
      factPlatform: 'Platform',
      factTarget: 'Target device',
      factDuration: 'Estimated time',
      riskLabel: 'RISK PROFILE',
      safetyTitle: 'Safety interlock active',
      safetyCopy: 'A mismatch or uncertain target stops the workflow in fail-closed mode.',
      faultTitle: 'Fault injection',
      faultCopy: 'Simulate a target-identification or integrity fault to test the protection response.',
      run: 'Run simulation',
      reset: 'Reset',
      export: 'Export report',
      disclaimer: 'The simulator does not read, format or erase a real drive. Results are intended for demonstration and workflow planning.',
      consoleTitle: 'Live execution log',
      logReady: 'Choose a project and start the digital twin.',
      liveTitle: 'What does this reveal about the live product?',
      meaningOneTitle: 'No blind execution',
      meaningOneCopy: 'FormatX maps the environment first, then exposes a clear plan and explicit target identity.',
      meaningTwoTitle: 'Failure is a designed state',
      meaningTwoCopy: 'A mismatch is not a hidden crash: the system stops, identifies the cause and preserves the audit trail.',
      meaningThreeTitle: 'Every outcome is verifiable',
      meaningThreeCopy: 'Each project ends with state, integrity and a documentable result.',
      footer: 'A safe digital twin for previewing FormatX technician workflows as they would behave in production.',
      footerBack: 'Back to simulator ↑',
      ready: 'READY',
      running: 'SIMULATION RUNNING',
      complete: 'VERIFIED RESULT',
      blocked: 'SAFETY STOP',
      progressReady: 'READY / SELECT CONFIGURATION',
      progressComplete: 'COMPLETE / REPORT READY',
      progressBlocked: 'FAIL-CLOSED / OPERATION STOPPED',
      riskNames: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      select: 'SELECTED',
      safetyRequired: 'The selected high-risk workflow can only be simulated with the safety interlock enabled.',
      exported: 'Simulation report exported.',
      resetLog: 'The digital twin returned to its initial state.',
      cancelled: 'The previous simulation was cancelled.',
      pageTitle: 'FormatX Operational Twin | Project simulator',
      pageDescription: 'FormatX Operational Twin — a safe project simulator for testing production technician workflows without real drive access.'
    }
  };

  const PLATFORMS = {
    bazzite: {
      name: { hu: 'Bazzite / Linux', en: 'Bazzite / Linux' },
      devices: [
        { name: 'NVMe0 / 1 TB', meta: 'BTRFS · SYSTEM · 42 °C', type: 'internal' },
        { name: 'USB 3.2 / 64 GB', meta: 'EXFAT · REMOVABLE · 38 °C', type: 'removable' },
        { name: 'SATA SSD / 2 TB', meta: 'EXT4 · DATA · 35 °C', type: 'internal' }
      ]
    },
    windows: {
      name: { hu: 'Windows 11', en: 'Windows 11' },
      devices: [
        { name: 'Disk 0 / NVMe 1 TB', meta: 'NTFS · SYSTEM · 44 °C', type: 'internal' },
        { name: 'Disk 2 / USB 64 GB', meta: 'EXFAT · REMOVABLE · 37 °C', type: 'removable' },
        { name: 'Disk 3 / SSD 2 TB', meta: 'NTFS · DATA · 36 °C', type: 'internal' }
      ]
    },
    macos: {
      name: { hu: 'macOS / Apple Silicon', en: 'macOS / Apple Silicon' },
      devices: [
        { name: 'APPLE SSD / 1 TB', meta: 'APFS · SYSTEM · 41 °C', type: 'internal' },
        { name: 'External USB / 64 GB', meta: 'EXFAT · REMOVABLE · 36 °C', type: 'removable' },
        { name: 'Thunderbolt SSD / 2 TB', meta: 'APFS · DATA · 34 °C', type: 'external' }
      ]
    }
  };

  const SCENARIOS = {
    iso_usb: {
      name: { hu: 'ISO → USB telepítő', en: 'ISO → USB deployment' },
      short: 'ISO → USB',
      duration: { hu: '08–12 perc', en: '08–12 minutes' },
      risk: 2,
      riskDescription: {
        hu: 'A céleszköz tartalma felülíródna. Éles módban kötelező lenne a célazonosítás és a megerősítés.',
        en: 'The target contents would be overwritten. Production mode would require explicit target identification and confirmation.'
      },
      source: 'FormatX-Rescue.iso',
      sourceMeta: '6.8 GB · SHA-256 READY',
      result: 'BOOTABLE MEDIA',
      resultMeta: 'GPT · UEFI · VERIFIED',
      logs: {
        hu: [
          'A platform és a csatlakoztatott meghajtók felmérése.',
          'GPT/UEFI telepítési terv és írási előnézet elkészült.',
          'A cserélhető céleszköz azonosítója rögzítve.',
          'Az ISO-kép blokkjainak szimulált írása folyamatban.',
          'SHA-256 visszaellenőrzés és indíthatósági jelentés elkészült.'
        ],
        en: [
          'Platform and attached-drive discovery started.',
          'GPT/UEFI deployment plan and write preview created.',
          'Removable target identity locked.',
          'Simulated block write of the ISO image in progress.',
          'SHA-256 verification and bootability report completed.'
        ]
      }
    },
    diagnostics: {
      name: { hu: 'Meghajtódiagnosztika', en: 'Drive diagnostics' },
      short: 'SMART / HEALTH',
      duration: { hu: '02–04 perc', en: '02–04 minutes' },
      risk: 1,
      riskDescription: {
        hu: 'Csak olvasási és elemzési művelet. Az éles rendszer nem módosítaná a meghajtó tartalmát.',
        en: 'Read-only analysis. The live system would not modify the drive contents.'
      },
      source: 'S.M.A.R.T. / NVMe LOG',
      sourceMeta: 'READ-ONLY · SENSOR STREAM',
      result: 'HEALTH PROFILE',
      resultMeta: 'TEMPERATURE · MEDIA · RISK',
      logs: {
        hu: [
          'A meghajtóazonosító és vezérlőprofil beolvasása.',
          'SMART, NVMe és hőmérsékleti adatforrások kiválasztása.',
          'Az elemzendő meghajtó egyértelműen kijelölve.',
          'Médiahibák, tartalékterület és hőterhelés elemzése.',
          'Egészségi profil és technikusi javaslat elkészült.'
        ],
        en: [
          'Drive identity and controller profile read.',
          'SMART, NVMe and temperature data sources selected.',
          'Analysis target explicitly locked.',
          'Media errors, spare capacity and thermal load analysed.',
          'Health profile and technician guidance completed.'
        ]
      }
    },
    partition: {
      name: { hu: 'Partíciótervezés', en: 'Partition planning' },
      short: 'PARTITION PLAN',
      duration: { hu: '04–07 perc', en: '04–07 minutes' },
      risk: 3,
      riskDescription: {
        hu: 'A partíciós tábla módosítása adatvesztést okozhat. Éles módban előnézet, célzár és külön megerősítés szükséges.',
        en: 'Changing a partition table can cause data loss. Production mode requires preview, target lock and separate confirmation.'
      },
      source: 'GPT LAYOUT MODEL',
      sourceMeta: 'EFI · SYSTEM · DATA · RECOVERY',
      result: 'PARTITION MAP',
      resultMeta: 'PREVIEWED · ALIGNED · REVERSIBLE',
      logs: {
        hu: [
          'Lemezgeometria, partíciós tábla és szabad terület felmérése.',
          'Az új partíciók mérete és igazítása előnézetben elkészült.',
          'A fizikai céleszköz és a tervezett GPT-azonosító zárolva.',
          'A partíciós módosítások szimulált alkalmazása folyamatban.',
          'Az új térkép ütközés- és konzisztencia-ellenőrzése elkészült.'
        ],
        en: [
          'Disk geometry, partition table and free space discovered.',
          'New partition sizing and alignment preview generated.',
          'Physical target and planned GPT identity locked.',
          'Simulated application of partition changes in progress.',
          'Collision and consistency verification of the new map completed.'
        ]
      }
    },
    secure_erase: {
      name: { hu: 'Biztonságos törlés', en: 'Secure erase' },
      short: 'SECURE ERASE',
      duration: { hu: '18–90 perc', en: '18–90 minutes' },
      risk: 4,
      riskDescription: {
        hu: 'Visszafordíthatatlan művelet. Éles módban többszintű célazonosítás, kézi megerősítés és naplózott engedély szükséges.',
        en: 'Irreversible operation. Production mode requires multi-stage target identification, manual confirmation and logged authorization.'
      },
      source: 'ERASE POLICY / NIST',
      sourceMeta: 'SANITIZE · VERIFY · AUDIT',
      result: 'SANITIZED DEVICE',
      resultMeta: 'IDENTITY LOCKED · REPORT SIGNED',
      logs: {
        hu: [
          'Meghajtótípus, firmware-képesség és törlési módszer felmérése.',
          'A támogatott sanitize vagy felülírási terv elkészült.',
          'A céleszköz sorozatszáma és kapacitása többszörösen ellenőrizve.',
          'A visszafordíthatatlan törlés szimulált végrehajtása folyamatban.',
          'Mintavételes ellenőrzés és aláírható törlési jelentés elkészült.'
        ],
        en: [
          'Drive type, firmware capability and erase method discovered.',
          'Supported sanitize or overwrite plan created.',
          'Target serial and capacity verified through multiple checks.',
          'Simulated execution of the irreversible erase in progress.',
          'Sample verification and signable erase report completed.'
        ]
      }
    }
  };

  const STEP_KEYS = ['discover', 'plan', 'lock', 'execute', 'verify'];
  const STEP_LABELS = ['DISCOVER', 'PLAN', 'TARGET LOCK', 'EXECUTE', 'VERIFY'];

  const state = {
    language: 'hu',
    scenario: 'iso_usb',
    platform: 'bazzite',
    targetIndex: 1,
    running: false,
    runToken: 0,
    startedAt: 0,
    clockTimer: 0,
    report: null,
    events: []
  };

  const elements = {
    targetList: document.getElementById('target-list'),
    workspaceState: document.getElementById('workspace-state-label'),
    simClock: document.getElementById('sim-clock'),
    progressLabel: document.getElementById('progress-label'),
    progressValue: document.getElementById('progress-value'),
    progressBar: document.getElementById('progress-bar'),
    telemetrySource: document.getElementById('telemetry-source'),
    telemetrySourceMeta: document.getElementById('telemetry-source-meta'),
    telemetryTarget: document.getElementById('telemetry-target'),
    telemetryTargetMeta: document.getElementById('telemetry-target-meta'),
    telemetryResult: document.getElementById('telemetry-result'),
    telemetryResultMeta: document.getElementById('telemetry-result-meta'),
    factProject: document.getElementById('fact-project'),
    factPlatform: document.getElementById('fact-platform'),
    factTarget: document.getElementById('fact-target'),
    factDuration: document.getElementById('fact-duration'),
    riskTitle: document.getElementById('risk-title'),
    riskDescription: document.getElementById('risk-description'),
    safetyGate: document.getElementById('safety-gate'),
    faultInjection: document.getElementById('fault-injection'),
    runButton: document.getElementById('run-simulation'),
    resetButton: document.getElementById('reset-simulation'),
    exportButton: document.getElementById('export-report'),
    eventLog: document.getElementById('event-log'),
    consoleStatus: document.getElementById('console-status')
  };

  function initialLanguage() {
    const query = new URLSearchParams(location.search).get('lang');
    if (query === 'hu' || query === 'en') return query;
    try {
      const stored = localStorage.getItem(LANGUAGE_KEY);
      if (stored === 'hu' || stored === 'en') return stored;
    } catch (_) {}
    return String(navigator.language || '').toLowerCase().startsWith('hu') ? 'hu' : 'en';
  }

  function copy() {
    return TEXT[state.language];
  }

  function scenario() {
    return SCENARIOS[state.scenario];
  }

  function platform() {
    return PLATFORMS[state.platform];
  }

  function target() {
    return platform().devices[state.targetIndex] || platform().devices[0];
  }

  function setLanguage(language, persist) {
    state.language = language === 'en' ? 'en' : 'hu';
    root.lang = state.language;
    document.title = copy().pageTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = copy().pageDescription;

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;
      if (Object.prototype.hasOwnProperty.call(copy(), key)) element.textContent = copy()[key];
    });
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === state.language));
    });

    if (persist) {
      try { localStorage.setItem(LANGUAGE_KEY, state.language); } catch (_) {}
      const url = new URL(location.href);
      url.searchParams.set('lang', state.language);
      history.replaceState({}, '', url.pathname + url.search + url.hash);
    }

    renderConfiguration();
    renderRuntimeLabels();
  }

  function renderTargets() {
    elements.targetList.replaceChildren(...platform().devices.map((device, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'target-button';
      button.dataset.targetIndex = String(index);
      button.setAttribute('aria-pressed', String(index === state.targetIndex));
      button.innerHTML = '<strong></strong><small></small><b></b>';
      button.querySelector('strong').textContent = device.name;
      button.querySelector('small').textContent = device.meta;
      button.querySelector('b').textContent = index === state.targetIndex ? copy().select : device.type.toUpperCase();
      return button;
    }));
  }

  function renderConfiguration() {
    const selectedScenario = scenario();
    const selectedPlatform = platform();
    const selectedTarget = target();

    renderTargets();
    elements.telemetrySource.textContent = selectedScenario.source;
    elements.telemetrySourceMeta.textContent = selectedScenario.sourceMeta;
    elements.telemetryTarget.textContent = selectedTarget.name;
    elements.telemetryTargetMeta.textContent = selectedTarget.meta;
    elements.telemetryResult.textContent = selectedScenario.result;
    elements.telemetryResultMeta.textContent = selectedScenario.resultMeta;

    elements.factProject.textContent = selectedScenario.name[state.language];
    elements.factPlatform.textContent = selectedPlatform.name[state.language];
    elements.factTarget.textContent = selectedTarget.name;
    elements.factDuration.textContent = selectedScenario.duration[state.language];
    elements.riskTitle.textContent = copy().riskNames[selectedScenario.risk - 1];
    elements.riskDescription.textContent = selectedScenario.riskDescription[state.language];
    document.querySelectorAll('.risk-scale i').forEach((item, index) => {
      item.classList.toggle('active', index < selectedScenario.risk);
    });

    document.querySelectorAll('[data-scenario]').forEach(button => {
      const active = button.dataset.scenario === state.scenario;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-platform]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.platform === state.platform));
    });
  }

  function renderRuntimeLabels() {
    const mode = root.dataset.simulatorState || 'idle';
    if (mode === 'running') elements.workspaceState.textContent = copy().running;
    else if (mode === 'complete') elements.workspaceState.textContent = copy().complete;
    else if (mode === 'blocked') elements.workspaceState.textContent = copy().blocked;
    else elements.workspaceState.textContent = copy().ready;

    if (mode === 'complete') elements.progressLabel.textContent = copy().progressComplete;
    else if (mode === 'blocked') elements.progressLabel.textContent = copy().progressBlocked;
    else if (mode !== 'running') elements.progressLabel.textContent = copy().progressReady;
  }

  function setSimulatorState(value) {
    root.dataset.simulatorState = value;
    renderRuntimeLabels();
  }

  function setControlsDisabled(disabled) {
    document.querySelectorAll('[data-scenario], [data-platform], .target-button, #safety-gate, #fault-injection').forEach(control => {
      control.disabled = disabled;
    });
    elements.runButton.disabled = disabled;
  }

  function formatElapsed(milliseconds) {
    const total = Math.max(0, milliseconds);
    const minutes = Math.floor(total / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    const millis = Math.floor(total % 1000);
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0') + '.' + String(millis).padStart(3, '0');
  }

  function startClock() {
    stopClock();
    state.startedAt = performance.now();
    state.clockTimer = window.setInterval(() => {
      elements.simClock.textContent = formatElapsed(performance.now() - state.startedAt);
    }, 33);
  }

  function stopClock() {
    window.clearInterval(state.clockTimer);
    state.clockTimer = 0;
  }

  function resetNodes() {
    document.querySelectorAll('.workflow-node').forEach((node, index) => {
      node.classList.remove('active', 'complete', 'blocked');
      if (index === 0) node.classList.add('active');
    });
  }

  function activateNode(index) {
    document.querySelectorAll('.workflow-node').forEach((node, nodeIndex) => {
      node.classList.toggle('active', nodeIndex === index);
      node.classList.toggle('complete', nodeIndex < index);
      node.classList.remove('blocked');
    });
  }

  function blockNode(index) {
    const nodes = document.querySelectorAll('.workflow-node');
    nodes.forEach((node, nodeIndex) => {
      node.classList.remove('active');
      node.classList.toggle('complete', nodeIndex < index);
      node.classList.toggle('blocked', nodeIndex === index);
    });
  }

  function completeNodes() {
    document.querySelectorAll('.workflow-node').forEach(node => {
      node.classList.remove('active', 'blocked');
      node.classList.add('complete');
    });
  }

  function timestamp() {
    return formatElapsed(state.startedAt ? performance.now() - state.startedAt : 0);
  }

  function appendLog(level, label, message) {
    const entry = { time: timestamp(), level, label, message };
    state.events.push(entry);
    const paragraph = document.createElement('p');
    if (level !== 'info') paragraph.className = level;
    const time = document.createElement('time');
    const strong = document.createElement('b');
    const span = document.createElement('span');
    time.textContent = entry.time;
    strong.textContent = label;
    span.textContent = message;
    paragraph.append(time, strong, span);
    elements.eventLog.appendChild(paragraph);
    elements.eventLog.scrollTop = elements.eventLog.scrollHeight;
  }

  function clearLog() {
    elements.eventLog.replaceChildren();
    state.events = [];
  }

  function setProgress(value, label) {
    const safe = Math.max(0, Math.min(100, value));
    elements.progressBar.style.width = safe + '%';
    elements.progressValue.textContent = Math.round(safe) + '%';
    if (label) elements.progressLabel.textContent = label;
  }

  function delay(milliseconds, token) {
    return new Promise(resolve => {
      window.setTimeout(() => resolve(token === state.runToken), milliseconds);
    });
  }

  function faultPoint() {
    if (state.scenario === 'diagnostics') return 4;
    if (state.scenario === 'iso_usb') return 2;
    return 2;
  }

  function buildReport(outcome, reason) {
    return {
      schema: 'formatx-operational-twin-report-v1',
      generated_at: new Date().toISOString(),
      simulation_only: true,
      real_device_access: false,
      language: state.language,
      project: {
        id: state.scenario,
        name: scenario().name[state.language],
        platform: platform().name[state.language],
        target: target().name,
        target_meta: target().meta,
        estimated_duration: scenario().duration[state.language],
        risk_level: scenario().risk,
        safety_interlock: elements.safetyGate.checked,
        fault_injection: elements.faultInjection.checked
      },
      outcome,
      reason: reason || null,
      elapsed: elements.simClock.textContent,
      workflow: STEP_KEYS,
      events: state.events.slice()
    };
  }

  async function runSimulation() {
    if (state.running) return;
    const selectedScenario = scenario();
    if (selectedScenario.risk >= 3 && !elements.safetyGate.checked) {
      clearLog();
      setSimulatorState('blocked');
      setProgress(0, copy().progressBlocked);
      elements.consoleStatus.textContent = 'SAFETY INTERLOCK';
      appendLog('error', 'BLOCKED', copy().safetyRequired);
      state.report = buildReport('blocked', 'safety_interlock_required');
      elements.exportButton.disabled = false;
      return;
    }

    const token = ++state.runToken;
    state.running = true;
    state.report = null;
    elements.exportButton.disabled = true;
    setControlsDisabled(true);
    clearLog();
    resetNodes();
    setSimulatorState('running');
    setProgress(0, 'INITIALISING / OPERATIONAL TWIN');
    elements.consoleStatus.textContent = 'RUNNING';
    startClock();
    appendLog('info', 'INIT', state.language === 'hu' ? 'A digitális ikerpár inicializálása.' : 'Initialising the digital twin.');

    for (let index = 0; index < STEP_KEYS.length; index += 1) {
      if (token !== state.runToken) return;
      activateNode(index);
      const startPercent = index * 20;
      setProgress(startPercent + 4, STEP_LABELS[index] + ' / ACTIVE');
      appendLog('info', STEP_LABELS[index], selectedScenario.logs[state.language][index]);

      const firstWait = await delay(520, token);
      if (!firstWait) return;
      setProgress(startPercent + 13, STEP_LABELS[index] + ' / VALIDATING');
      const secondWait = await delay(480, token);
      if (!secondWait) return;

      if (elements.faultInjection.checked && index === faultPoint()) {
        const faultMessage = state.language === 'hu'
          ? 'Eltérés észlelve: a szimulált célazonosító vagy integritási érték nem egyezik. A végrehajtás biztonságosan leállt.'
          : 'Mismatch detected: the simulated target identity or integrity value does not match. Execution stopped safely.';
        blockNode(index);
        setSimulatorState('blocked');
        setProgress(startPercent + 15, copy().progressBlocked);
        elements.consoleStatus.textContent = 'FAIL-CLOSED';
        appendLog('error', 'INTERLOCK', faultMessage);
        stopClock();
        state.report = buildReport('fail-closed', 'injected_identity_or_integrity_fault');
        elements.exportButton.disabled = false;
        state.running = false;
        setControlsDisabled(false);
        return;
      }

      setProgress((index + 1) * 20, STEP_LABELS[index] + ' / COMPLETE');
      appendLog('success', 'PASS', state.language === 'hu' ? 'A munkafázis ellenőrzötten lezárult.' : 'Workflow phase completed and verified.');
    }

    completeNodes();
    setSimulatorState('complete');
    setProgress(100, copy().progressComplete);
    elements.consoleStatus.textContent = 'VERIFIED';
    appendLog('success', 'COMPLETE', state.language === 'hu'
      ? 'A projekt szimulációja sikeresen befejeződött. Az auditjelentés exportálható.'
      : 'Project simulation completed successfully. The audit report is ready for export.');
    stopClock();
    state.report = buildReport('verified', null);
    elements.exportButton.disabled = false;
    state.running = false;
    setControlsDisabled(false);
  }

  function resetSimulation(writeLog) {
    const wasRunning = state.running;
    state.runToken += 1;
    state.running = false;
    stopClock();
    setControlsDisabled(false);
    elements.exportButton.disabled = true;
    state.report = null;
    elements.simClock.textContent = '00:00.000';
    setSimulatorState('idle');
    setProgress(0, copy().progressReady);
    elements.consoleStatus.textContent = 'IDLE';
    resetNodes();
    clearLog();
    appendLog('info', 'READY', wasRunning ? copy().cancelled : (writeLog ? copy().resetLog : copy().logReady));
  }

  function exportReport() {
    if (!state.report) return;
    const payload = JSON.stringify(state.report, null, 2);
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'FormatX-Operational-Twin-' + state.scenario + '-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    appendLog('success', 'EXPORT', copy().exported);
  }

  document.addEventListener('click', event => {
    const languageButton = event.target.closest('[data-language]');
    if (languageButton) {
      setLanguage(languageButton.dataset.language, true);
      return;
    }

    const scenarioButton = event.target.closest('[data-scenario]');
    if (scenarioButton && !state.running) {
      state.scenario = scenarioButton.dataset.scenario;
      renderConfiguration();
      resetSimulation(false);
      return;
    }

    const platformButton = event.target.closest('[data-platform]');
    if (platformButton && !state.running) {
      state.platform = platformButton.dataset.platform;
      state.targetIndex = Math.min(1, platform().devices.length - 1);
      renderConfiguration();
      resetSimulation(false);
      return;
    }

    const targetButton = event.target.closest('[data-target-index]');
    if (targetButton && !state.running) {
      state.targetIndex = Number(targetButton.dataset.targetIndex) || 0;
      renderConfiguration();
      resetSimulation(false);
    }
  });

  elements.runButton.addEventListener('click', runSimulation);
  elements.resetButton.addEventListener('click', () => resetSimulation(true));
  elements.exportButton.addEventListener('click', exportReport);

  addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      runSimulation();
    }
    if (event.key === 'Escape' && state.running) {
      event.preventDefault();
      resetSimulation(true);
    }
  });

  addEventListener('pagehide', () => {
    state.runToken += 1;
    stopClock();
  }, { once: true });

  state.language = initialLanguage();
  setLanguage(state.language, false);
  renderConfiguration();
  resetSimulation(false);
  root.dataset.projectSimulator = 'operational-twin-v1';
}());
