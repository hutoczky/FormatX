(function () {
  'use strict';

  const ROOT = document.documentElement;
  const PAGE = document.body.dataset.fxPublicPage || '';
  const cache = new Map();

  const language = () => ROOT.lang === 'en' ? 'en' : 'hu';
  const text = value => {
    if (value && typeof value === 'object') return value[language()] || value.hu || value.en || '';
    return String(value ?? '');
  };
  const empty = () => language() === 'en' ? 'No published data' : 'Nincs közzétett adat';
  const create = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  };
  const normalise = value => String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase(language() === 'en' ? 'en' : 'hu')
    .trim();

  async function json(path) {
    if (!cache.has(path)) {
      cache.set(path, fetch(path, { cache: 'no-store', credentials: 'same-origin' }).then(response => {
        if (!response.ok) throw new Error(path + ': ' + response.status);
        return response.json();
      }));
    }
    return cache.get(path);
  }

  function setStatus(value, state = 'ready') {
    const output = document.querySelector('[data-page-status]');
    if (!output) return;
    output.textContent = value;
    output.dataset.state = state;
  }

  function dataList(rows) {
    const list = create('dl', 'fx-data-list');
    rows.forEach(([term, description]) => {
      const row = create('div');
      row.append(create('dt', '', term), create('dd', '', description || empty()));
      list.append(row);
    });
    return list;
  }

  function link(href, label, disabled = false) {
    const anchor = create('a', disabled ? 'fx-unavailable-link' : '', label);
    if (!disabled && href) {
      anchor.href = href;
      if (/^https:\/\//.test(href)) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      }
    } else {
      anchor.setAttribute('aria-disabled', 'true');
    }
    return anchor;
  }

  const NAV = Object.freeze({
    hu: [
      ['/scifi-ui/method.html', 'Módszer'],
      ['/scifi-ui/verification.html', 'Bizonyíték'],
      ['/scifi-ui/test-matrix.html', 'Tesztek'],
      ['/scifi-ui/known-issues.html', 'Ismert hibák'],
      ['/scifi-ui/security.html', 'Biztonság'],
      ['/scifi-ui/decision-log.html', 'Döntésnapló'],
      ['/scifi-ui/downloads/', 'Letöltések']
    ],
    en: [
      ['/scifi-ui/method.html', 'Method'],
      ['/scifi-ui/verification.html', 'Verification'],
      ['/scifi-ui/test-matrix.html', 'Test matrix'],
      ['/scifi-ui/known-issues.html', 'Known issues'],
      ['/scifi-ui/security.html', 'Security'],
      ['/scifi-ui/decision-log.html', 'Decision log'],
      ['/scifi-ui/downloads/', 'Downloads']
    ]
  });

  function fillNavigation(selector) {
    document.querySelectorAll(selector).forEach(nav => {
      nav.replaceChildren(...NAV[language()].map(([href, label]) => {
        const anchor = link(href, label);
        const current = location.pathname === href || (href.endsWith('/') && location.pathname === href + 'index.html');
        if (current) anchor.setAttribute('aria-current', 'page');
        return anchor;
      }));
    });
  }

  function pageNav() {
    fillNavigation('[data-public-nav], [data-public-footer-nav]');
  }

  async function method() {
    const root = document.querySelector('[data-method-root]');
    if (!root) return;
    const data = await json('/scifi-ui/data/workflow-cases.json');
    const stepNames = language() === 'en'
      ? { discover: 'Discover', plan: 'Plan', controlled_execution: 'Controlled execution', verify: 'Verify' }
      : { discover: 'Felderítés', plan: 'Terv', controlled_execution: 'Kontrollált végrehajtás', verify: 'Visszaellenőrzés' };
    root.replaceChildren();
    data.workflows.forEach((workflow, index) => {
      const article = create('article', 'fx-method-card fx-evidence-gap');
      article.append(
        create('p', 'section-index', String(index + 1).padStart(2, '0') + ' / FORMATX METHOD'),
        create('h2', '', text(workflow.title))
      );
      const sequence = create('ol', 'fx-method-sequence');
      workflow.steps.forEach(step => {
        const item = create('li');
        item.append(create('strong', '', stepNames[step.id] || step.id), create('p', '', text(step)));
        sequence.append(item);
      });
      article.append(
        sequence,
        create('p', '', language() === 'en'
          ? 'Evidence state: awaiting a verified real run. Required evidence is listed in the canonical workflow record.'
          : 'Bizonyítékállapot: hiteles valós futásra vár. A szükséges bizonyítékokat az irányadó munkafolyamat-rekord sorolja fel.')
      );
      root.append(article);
    });
    setStatus(language() === 'en' ? 'Method records loaded' : 'Módszerrekordok betöltve');
  }

  function releaseCard(release) {
    const article = create('article', 'fx-evidence-card');
    const windows = release?.channels?.windows;
    const evidence = release?.evidence || {};
    article.append(
      create('h2', '', language() === 'en' ? 'Current official release' : 'Aktuális hivatalos kiadás'),
      dataList([
        [language() === 'en' ? 'Version' : 'Verzió', release?.version],
        [language() === 'en' ? 'Published' : 'Kiadás dátuma', release?.published_at],
        [language() === 'en' ? 'Status' : 'Állapot', language() === 'en' ? 'Public beta' : 'Nyilvános béta'],
        [language() === 'en' ? 'Windows package' : 'Windows-csomag', windows?.available ? windows.name : null],
        ['SHA-256 / digest', windows?.digest],
        [language() === 'en' ? 'Signature proof' : 'Aláírási bizonyíték', evidence.signature_asset_url ? (language() === 'en' ? 'Published' : 'Közzétéve') : null]
      ])
    );
    const navigation = create('div', 'fx-page-nav');
    navigation.append(
      link(release?.release_url, language() === 'en' ? 'Official release' : 'Hivatalos kiadás', !release?.release_url),
      link(evidence.checksum_asset_url, language() === 'en' ? 'Checksum asset' : 'Ellenőrzőösszeg', !evidence.checksum_asset_url),
      link(evidence.signature_asset_url, language() === 'en' ? 'Signature proof' : 'Aláírás', !evidence.signature_asset_url)
    );
    article.append(navigation);
    return article;
  }

  async function verification() {
    const root = document.querySelector('[data-verification-root]');
    if (!root) return;
    const [release, status, testsData, issueData, evidence, gate] = await Promise.all([
      json('/scifi-ui/data/current-release.json'),
      json('/scifi-ui/data/platform-status.json'),
      json('/scifi-ui/data/test-matrix.json'),
      json('/scifi-ui/data/known-issues.json'),
      json('/scifi-ui/data/evidence-manifest.json'),
      json('/scifi-ui/data/stable-gate.json')
    ]);
    root.replaceChildren(releaseCard(release));
    const summary = create('article', 'fx-evidence-card');
    const verified = testsData.cases.filter(item => item.status === 'verified').length;
    summary.append(
      create('h2', '', language() === 'en' ? 'Evidence summary' : 'Bizonyítéki összegzés'),
      dataList([
        [language() === 'en' ? 'Canonical platform records' : 'Irányadó platformrekordok', String(status.platforms.length)],
        [language() === 'en' ? 'Verified public tests' : 'Ellenőrzött nyilvános tesztek', String(verified)],
        [language() === 'en' ? 'Known issues and limitations' : 'Ismert hibák és korlátozások', String(issueData.items.length)],
        [language() === 'en' ? 'Real application captures published' : 'Közzétett valódi alkalmazásképek', String(evidence.captures.filter(item => item.file).length)],
        [language() === 'en' ? 'Stable-eligible platforms' : 'Stable feltételt teljesítő platformok', String(Object.values(gate.current_gate).filter(item => item.eligible).length)]
      ])
    );
    root.append(summary);
    evidence.captures.forEach(capture => {
      const article = create('article', 'fx-evidence-card ' + (capture.file ? '' : 'fx-evidence-gap'));
      article.append(
        create('h2', '', text(capture.title)),
        create('p', '', capture.file
          ? text(capture.alt)
          : language() === 'en'
            ? 'A verified application capture has not been published yet. Decorative mockups are not accepted as evidence.'
            : 'Hiteles alkalmazáskép még nincs közzétéve. Dekoratív mockup nem fogadható el bizonyítékként.')
      );
      root.append(article);
    });
    setStatus(language() === 'en' ? 'Verification data loaded' : 'Bizonyítéki adatok betöltve');
  }

  const ISSUE_TYPE_LABELS = Object.freeze({
    hu: { limitation: 'Korlátozás', evidence_gap: 'Bizonyítékhiány', roadmap: 'Ütemterv' },
    en: { limitation: 'Limitation', evidence_gap: 'Evidence gap', roadmap: 'Roadmap' }
  });

  function option(value, label) {
    const element = create('option', '', label);
    element.value = value;
    return element;
  }

  function issueFilterState() {
    return {
      query: document.querySelector('[data-issue-search]')?.value || '',
      platform: document.querySelector('[data-issue-filter="platform"]')?.value || '',
      severity: document.querySelector('[data-issue-filter="severity"]')?.value || '',
      status: document.querySelector('[data-issue-filter="status"]')?.value || ''
    };
  }

  function applyIssueFilters() {
    const state = issueFilterState();
    const query = normalise(state.query);
    let visible = 0;
    document.querySelectorAll('[data-issue-record]').forEach(card => {
      const matches = (!query || normalise(card.dataset.searchText).includes(query))
        && (!state.platform || card.dataset.platform === state.platform)
        && (!state.severity || card.dataset.severity === state.severity)
        && (!state.status || card.dataset.fixStatus === state.status);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    const count = document.querySelector('[data-issue-results]');
    if (count) count.textContent = language() === 'en'
      ? `${visible} matching record${visible === 1 ? '' : 's'}`
      : `${visible} megfelelő rekord`;
    let emptyState = document.querySelector('[data-issue-empty]');
    const root = document.querySelector('[data-issues-root]');
    if (!emptyState && root) {
      emptyState = create('p', 'fx-empty-state');
      emptyState.dataset.issueEmpty = 'true';
      root.append(emptyState);
    }
    if (emptyState) {
      emptyState.hidden = visible !== 0;
      emptyState.textContent = language() === 'en'
        ? 'No known-issue record matches the selected filters.'
        : 'A kiválasztott szűrőknek egyetlen ismert hibarekord sem felel meg.';
    }
  }

  function configureIssueControls(data) {
    const controls = document.querySelector('[data-issue-controls]');
    if (!controls) return;
    const current = issueFilterState();
    const platform = controls.querySelector('[data-issue-filter="platform"]');
    const severity = controls.querySelector('[data-issue-filter="severity"]');
    const status = controls.querySelector('[data-issue-filter="status"]');
    const search = controls.querySelector('[data-issue-search]');

    if (search) search.placeholder = language() === 'en'
      ? 'Platform, problem or identifier'
      : 'Platform, probléma vagy azonosító';
    if (platform) {
      const values = [...new Set(data.items.map(item => item.platform))].sort((a, b) => a.localeCompare(b));
      platform.replaceChildren(option('', language() === 'en' ? 'All platforms' : 'Minden platform'), ...values.map(value => option(value, value)));
      platform.value = current.platform;
    }
    if (severity) {
      severity.replaceChildren(
        option('', language() === 'en' ? 'All severities' : 'Minden súlyosság'),
        ...Object.entries(data.severity_labels).map(([value, label]) => option(value, text(label)))
      );
      severity.value = current.severity;
    }
    if (status) {
      status.replaceChildren(
        option('', language() === 'en' ? 'All statuses' : 'Minden állapot'),
        ...Object.entries(data.fix_labels).map(([value, label]) => option(value, text(label)))
      );
      status.value = current.status;
    }
    if (controls.dataset.bound !== 'true') {
      controls.dataset.bound = 'true';
      controls.addEventListener('input', applyIssueFilters);
      controls.addEventListener('change', applyIssueFilters);
      controls.addEventListener('reset', () => setTimeout(applyIssueFilters, 0));
    }
  }

  function renderIssueSummary(data, release) {
    const root = document.querySelector('[data-issues-summary]');
    if (!root) return;
    const attention = data.items.filter(item => ['open', 'investigating', 'blocked'].includes(item.fix_status)).length;
    const workarounds = data.items.filter(item => item.fix_status === 'workaround' || text(item.workaround)).length;
    const lastUpdate = data.items.map(item => item.last_updated).filter(Boolean).sort().at(-1) || data.updated;
    const metrics = language() === 'en'
      ? [['Published records', data.items.length], ['Need attention', attention], ['Documented workarounds', workarounds], ['Release context', release?.version || empty()]]
      : [['Közzétett rekordok', data.items.length], ['Figyelmet igényel', attention], ['Dokumentált kerülőutak', workarounds], ['Kiadási környezet', release?.version || empty()]];
    root.replaceChildren(...metrics.map(([label, value]) => {
      const card = create('article', 'fx-issue-metric');
      card.append(create('span', '', label), create('strong', '', String(value)));
      return card;
    }));
    root.dataset.lastUpdated = lastUpdate || '';
  }

  async function issues() {
    const root = document.querySelector('[data-issues-root]');
    if (!root) return;
    root.setAttribute('aria-busy', 'true');
    const [data, release] = await Promise.all([
      json('/scifi-ui/data/known-issues.json'),
      json('/scifi-ui/data/current-release.json').catch(() => null)
    ]);
    renderIssueSummary(data, release);
    configureIssueControls(data);
    root.replaceChildren();
    data.items.forEach(item => {
      const article = create('article', 'fx-issue-card');
      article.id = item.id.toLocaleLowerCase('en-US');
      article.dataset.issueRecord = item.id;
      article.dataset.platform = item.platform;
      article.dataset.severity = item.severity;
      article.dataset.fixStatus = item.fix_status;
      article.dataset.searchText = [item.id, item.platform, text(item.problem), text(item.workaround), text(data.fix_labels[item.fix_status]), text(data.severity_labels[item.severity])].join(' ');

      const identifier = link('#' + article.id, item.id);
      identifier.className = 'fx-issue-card__id';
      const heading = create('h2', '', item.platform);
      const meta = create('div', 'fx-issue-card__meta');
      const type = create('span', 'fx-issue-chip', ISSUE_TYPE_LABELS[language()][item.type] || item.type);
      const severity = create('span', 'fx-issue-chip', text(data.severity_labels[item.severity]));
      severity.dataset.severity = item.severity;
      const fix = create('span', 'fx-issue-chip', text(data.fix_labels[item.fix_status]));
      fix.dataset.fixStatus = item.fix_status;
      meta.append(type, severity, fix);
      article.append(
        identifier,
        heading,
        meta,
        create('p', '', text(item.problem)),
        dataList([
          [language() === 'en' ? 'Affected version' : 'Érintett verzió', item.affected_version],
          [language() === 'en' ? 'Workaround' : 'Kerülőút', text(item.workaround)],
          [language() === 'en' ? 'Fix status' : 'Javítás állapota', text(data.fix_labels[item.fix_status])],
          [language() === 'en' ? 'Last update' : 'Utolsó frissítés', item.last_updated]
        ])
      );
      if (item.issue_url) article.append(link(item.issue_url, language() === 'en' ? 'Open public issue tracker' : 'Nyilvános hibajegyek megnyitása'));
      root.append(article);
    });
    root.setAttribute('aria-busy', 'false');
    applyIssueFilters();
    setStatus(language() === 'en'
      ? `Known-issue register updated: ${data.updated}`
      : `Ismert hibák nyilvántartása frissítve: ${data.updated}`);
  }

  async function decisions() {
    const root = document.querySelector('[data-decisions-root]');
    if (!root) return;
    const data = await json('/scifi-ui/data/decision-log.json');
    root.replaceChildren();
    data.entries.forEach(item => {
      const article = create('article', 'fx-decision-card');
      article.append(
        create('p', 'section-index', item.id + ' · ' + item.date),
        create('h2', '', text(item.problem)),
        dataList([
          [language() === 'en' ? 'Decision' : 'Döntés', text(item.decision)],
          [language() === 'en' ? 'Trade-off' : 'Kompromisszum', text(item.tradeoff)],
          [language() === 'en' ? 'Verification' : 'Ellenőrzés', item.verification],
          [language() === 'en' ? 'Open question' : 'Nyitott kérdés', item.open_question]
        ])
      );
      root.append(article);
    });
    setStatus(language() === 'en' ? 'Decision log loaded' : 'Döntésnapló betöltve');
  }

  async function tests() {
    const body = document.querySelector('[data-test-table-body]');
    if (!body) return;
    const data = await json('/scifi-ui/data/test-matrix.json');
    body.replaceChildren();
    data.cases.forEach(item => {
      const row = create('tr');
      const values = [
        item.id, item.test_date, item.build, item.platform,
        [item.operating_system, item.os_version].filter(Boolean).join(' / '),
        item.hardware, item.module, item.input_conditions, item.expected_result,
        item.actual_result, text(data.status_labels[item.status]), item.known_limitation,
        item.evidence_url, item.last_verified
      ];
      values.forEach((value, index) => {
        const cell = create('td');
        if (index === 10) {
          const status = create('span', 'fx-test-status', value);
          status.dataset.status = item.status;
          cell.append(status);
        } else if (index === 12 && value) {
          cell.append(link(value, language() === 'en' ? 'Open evidence' : 'Bizonyíték'));
        } else {
          cell.textContent = value || empty();
        }
        row.append(cell);
      });
      body.append(row);
    });
    setStatus(language() === 'en' ? 'Test matrix loaded' : 'Teszttáblázat betöltve');
  }

  async function run() {
    pageNav();
    try {
      if (PAGE === 'method') await method();
      if (PAGE === 'verification') await verification();
      if (PAGE === 'known-issues') await issues();
      if (PAGE === 'decision-log') await decisions();
      if (PAGE === 'test-matrix') await tests();
    } catch (error) {
      setStatus((language() === 'en' ? 'Data could not be loaded: ' : 'Az adat nem tölthető be: ') + String(error.message || error), 'error');
      document.querySelector('[data-issues-root]')?.setAttribute('aria-busy', 'false');
    }
  }

  addEventListener('formatx:languagechange', run);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
}());
