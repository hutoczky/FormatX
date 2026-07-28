(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxRealityFork === 'ready') return;
  root.dataset.fxRealityFork = 'loading';

  const COPY = {
    hu: {
      title: 'Két valóságág. Egyetlen bizonyítható döntési különbség.',
      lead: 'Rögzíts egy befejezett futást, változtass meg pontosan egy döntést, majd nézd végig szinkronban, hol és miért tér el a két eredmény. A teljes összehasonlítás helyben aláírható és később változatlanul ellenőrizhető.',
      baseline: 'ALAPVALÓSÁG', branch: 'ELLENVALÓSÁG', noRun: 'Előbb futtass le egy szimulációt.', readyRun: 'A legutóbbi futás rögzíthető.', captured: 'Alapvalóság rögzítve',
      intervention: 'Egyetlen megváltoztatott döntés', safety: 'Erősebb védelem', safetyCopy: 'Kötelező retesz és alacsonyabb kockázat.', speed: 'Gyorsított út', speedCopy: 'Rövidebb idő, kisebb ellenőrzési tartalék.', fault: 'Integritási eltérés', faultCopy: 'Szándékos hash-eltérés a végrehajtásnál.', target: 'Hibás célazonosítás', targetCopy: 'Eltérő eszközazonosító a célzárnál.',
      capture: 'Alapvalóság rögzítése', fork: 'Ellenvalóság létrehozása', replay: 'Eltérés szinkron visszajátszása', seal: 'Reality Capsule lezárása', verify: 'Kapszula ellenőrzése',
      waiting: 'NINCS RÖGZÍTETT FUTÁS', outcome: 'Eredmény', risk: 'Kockázat', time: 'Tervezett idő', assurance: 'Ellenőrzési szint', divergence: 'ELTÉRÉSI PONT', none: 'Az ellenvalóság még nem készült el.',
      verified: 'ELLENŐRZÖTT', failClosed: 'FAIL-CLOSED', reduced: 'CSÖKKENTETT BIZONYOSSÁG', capsuleTitle: 'Bizonyítékot hordozó Reality Capsule',
      capsuleCopy: 'A böngésző egyszer használatos P-256 kulcspárt készít, SHA-256 lenyomatot számol, majd aláírja a teljes kétágú futást. Egyetlen módosított karakter is érvényteleníti az ellenőrzést.',
      limitation: 'A munkamenet-aláírás a fájl változatlanságát bizonyítja; nem helyettesít kiadói vagy hatósági tanúsítványt.', fingerprint: 'KAPSZULA-AZONOSÍTÓ', notSealed: 'NINCS LEZÁRT KAPSZULA', valid: 'ÉRVÉNYES / VÁLTOZATLAN KAPSZULA', invalid: 'ÉRVÉNYTELEN VAGY MÓDOSÍTOTT KAPSZULA',
      needRun: 'Nincs rögzíthető befejezett szimuláció.', needBranch: 'Előbb hozd létre az ellenvalóságot.', replaying: 'SZINKRON VISSZAJÁTSZÁS', done: 'KÉSZ',
      safetyNarrative: 'A biztonsági retesz megerősítve; a modell több ellenőrzést futtat.', speedNarrative: 'Az ellenőrzési tartalék csökkent; a futás gyorsabb, de kevésbé konzervatív.', faultNarrative: 'A végrehajtási hash eltér; a rendszer fail-closed módon leáll.', targetNarrative: 'A célazonosító eltér; a rendszer a célzárnál leáll.'
    },
    en: {
      title: 'Two reality branches. One provable decision difference.',
      lead: 'Capture a completed run, change exactly one decision, then replay both paths in sync to see where and why the outcomes diverge. The complete comparison can be signed locally and verified later without alteration.',
      baseline: 'BASELINE REALITY', branch: 'COUNTERFACTUAL REALITY', noRun: 'Run a simulation first.', readyRun: 'The latest run can be captured.', captured: 'Baseline reality captured',
      intervention: 'Exactly one changed decision', safety: 'Stronger protection', safetyCopy: 'Mandatory interlock and lower risk.', speed: 'Accelerated path', speedCopy: 'Shorter duration with less verification reserve.', fault: 'Integrity mismatch', faultCopy: 'Intentional hash mismatch during execution.', target: 'Wrong target identity', targetCopy: 'Different device identity at target lock.',
      capture: 'Capture baseline reality', fork: 'Generate counterfactual reality', replay: 'Replay divergence in sync', seal: 'Seal Reality Capsule', verify: 'Verify capsule',
      waiting: 'NO CAPTURED RUN', outcome: 'Outcome', risk: 'Risk', time: 'Planned time', assurance: 'Assurance level', divergence: 'DIVERGENCE POINT', none: 'The counterfactual branch has not been generated.',
      verified: 'VERIFIED', failClosed: 'FAIL-CLOSED', reduced: 'REDUCED ASSURANCE', capsuleTitle: 'Proof-carrying Reality Capsule',
      capsuleCopy: 'The browser creates a one-use P-256 key pair, calculates a SHA-256 digest, then signs the complete dual-branch run. Changing one character invalidates verification.',
      limitation: 'The session signature proves file integrity; it does not replace a publisher or authority certificate.', fingerprint: 'CAPSULE ID', notSealed: 'NO SEALED CAPSULE', valid: 'VALID / UNCHANGED CAPSULE', invalid: 'INVALID OR MODIFIED CAPSULE',
      needRun: 'No completed simulation is available to capture.', needBranch: 'Generate the counterfactual branch first.', replaying: 'SYNCHRONISED REPLAY', done: 'READY',
      safetyNarrative: 'The safety interlock is strengthened and the model runs additional checks.', speedNarrative: 'Verification reserve is reduced; the run is faster but less conservative.', faultNarrative: 'The execution hash diverges and the system stops fail-closed.', targetNarrative: 'The target identity diverges and the system stops at target lock.'
    }
  };

  const STEPS = ['discover', 'plan', 'lock', 'execute', 'verify'];
  const LABELS = { hu: ['FELDERÍTÉS', 'TERV', 'CÉLZÁR', 'VÉGREHAJTÁS', 'ELLENŐRZÉS'], en: ['DISCOVER', 'PLAN', 'TARGET LOCK', 'EXECUTE', 'VERIFY'] };
  const state = { language: root.lang === 'en' ? 'en' : 'hu', baseline: null, branch: null, delta: null, intervention: 'safety', capsule: null, replayToken: 0 };

  const text = () => COPY[state.language];
  const clone = value => value == null ? null : JSON.parse(JSON.stringify(value));
  const canonical = value => Array.isArray(value)
    ? '[' + value.map(canonical).join(',') + ']'
    : value && typeof value === 'object'
      ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}'
      : JSON.stringify(value);
  const hex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  const b64u = bytes => { let binary = ''; bytes.forEach(byte => { binary += String.fromCharCode(byte); }); return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''); };
  const fromB64u = value => { const normalized = String(value).replace(/-/g, '+').replace(/_/g, '/'); const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4)); return Uint8Array.from(binary, char => char.charCodeAt(0)); };

  function parseDuration(value) {
    const match = String(value || '').match(/(\d+)\D+(\d+)/);
    return { low: match ? Number(match[1]) : 1, high: match ? Number(match[2]) : 1, unit: state.language === 'hu' ? 'perc' : 'minutes' };
  }
  const formatDuration = duration => String(Math.max(1, Math.round(duration.low))).padStart(2, '0') + '–' + String(Math.max(1, Math.round(duration.high))).padStart(2, '0') + ' ' + duration.unit;
  function assurance(report) { let score = 3; if (report?.project?.safety_interlock) score += 1; if (report?.project?.fault_injection) score -= 1; if (['fail-closed', 'blocked'].includes(report?.outcome)) score += 1; if (report?.outcome === 'verified-with-reduced-assurance') score -= 2; return Math.max(1, Math.min(5, score)); }
  function outcome(value) { return ['fail-closed', 'blocked'].includes(value) ? text().failClosed : value === 'verified-with-reduced-assurance' ? text().reduced : text().verified; }

  function ui() {
    const anchor = document.querySelector('.operations-console') || document.getElementById('simulator');
    if (!anchor || document.getElementById('reality-fork-capsule')) return;
    const section = document.createElement('section');
    section.id = 'reality-fork-capsule';
    section.className = 'reality-fork-capsule';
    section.innerHTML = `
      <header class="reality-fork-heading"><div><p class="sim-eyebrow">05 / REALITY FORK CAPSULE</p><h2 data-rf="title"></h2><p data-rf="lead"></p></div><div class="reality-fork-mark" aria-hidden="true"><span>R</span><i></i><b>±</b></div></header>
      <div class="reality-fork-workspace">
        <aside class="reality-fork-controls">
          <div class="reality-baseline-status"><small data-rf="baseline"></small><strong id="rf-baseline-status" data-rf="noRun"></strong><span id="rf-baseline-id">—</span></div>
          <fieldset class="reality-interventions"><legend data-rf="intervention"></legend>
            <button type="button" data-intervention="safety" aria-pressed="true"><b data-rf="safety"></b><small data-rf="safetyCopy"></small></button>
            <button type="button" data-intervention="speed" aria-pressed="false"><b data-rf="speed"></b><small data-rf="speedCopy"></small></button>
            <button type="button" data-intervention="fault" aria-pressed="false"><b data-rf="fault"></b><small data-rf="faultCopy"></small></button>
            <button type="button" data-intervention="target" aria-pressed="false"><b data-rf="target"></b><small data-rf="targetCopy"></small></button>
          </fieldset>
          <div class="reality-fork-actions"><button id="rf-capture" class="action-primary" type="button" data-rf="capture"></button><button id="rf-fork" class="action-secondary" type="button" disabled data-rf="fork"></button><button id="rf-replay" class="action-secondary" type="button" disabled data-rf="replay"></button></div>
          <output id="rf-notice" class="reality-notice" aria-live="polite"></output>
        </aside>
        <section class="reality-comparison">
          <article class="reality-lane"><header><span>01</span><div><small data-rf="baseline"></small><strong id="rf-base-head" data-rf="waiting"></strong></div></header><dl><div><dt data-rf="outcome"></dt><dd id="rf-base-out">—</dd></div><div><dt data-rf="risk"></dt><dd id="rf-base-risk">—</dd></div><div><dt data-rf="time"></dt><dd id="rf-base-time">—</dd></div><div><dt data-rf="assurance"></dt><dd id="rf-base-assurance">—</dd></div></dl><div class="reality-timeline" data-lane="baseline"></div></article>
          <div class="reality-divergence"><span data-rf="divergence"></span><strong id="rf-div-step">—</strong><p id="rf-div-copy" data-rf="none"></p></div>
          <article class="reality-lane reality-lane-branch"><header><span>02</span><div><small data-rf="branch"></small><strong id="rf-branch-head" data-rf="waiting"></strong></div></header><dl><div><dt data-rf="outcome"></dt><dd id="rf-branch-out">—</dd></div><div><dt data-rf="risk"></dt><dd id="rf-branch-risk">—</dd></div><div><dt data-rf="time"></dt><dd id="rf-branch-time">—</dd></div><div><dt data-rf="assurance"></dt><dd id="rf-branch-assurance">—</dd></div></dl><div class="reality-timeline" data-lane="branch"></div></article>
        </section>
      </div>
      <section class="reality-capsule-proof"><div class="reality-capsule-copy"><p class="sim-eyebrow">06 / PROOF-CARRYING RUN</p><h3 data-rf="capsuleTitle"></h3><p data-rf="capsuleCopy"></p><small data-rf="limitation"></small></div><div class="reality-capsule-controls"><button id="rf-seal" class="action-primary" type="button" disabled data-rf="seal"></button><label class="reality-file-control"><input id="rf-import" type="file" accept=".json,.fxcapsule,application/json"><span data-rf="verify"></span></label><div class="reality-proof-output"><small data-rf="fingerprint"></small><strong id="rf-fingerprint" data-rf="notSealed"></strong><span id="rf-verification"></span></div></div></section>`;
    anchor.insertAdjacentElement('afterend', section);
    document.querySelectorAll('.reality-timeline').forEach(lane => lane.replaceChildren(...STEPS.map((step, index) => { const item = document.createElement('div'); item.dataset.step = step; item.innerHTML = '<span>' + String(index + 1).padStart(2, '0') + '</span><b></b><small></small>'; return item; })));
    bind(); translate(); refresh(); root.dataset.fxRealityFork = 'ready';
  }

  function translate() {
    state.language = root.lang === 'en' ? 'en' : 'hu';
    document.querySelectorAll('[data-rf]').forEach(element => { const key = element.dataset.rf; if (key in text()) element.textContent = text()[key]; });
    document.querySelectorAll('.reality-timeline').forEach(lane => lane.querySelectorAll('[data-step]').forEach((item, index) => { item.querySelector('small').textContent = LABELS[state.language][index]; }));
    render(); refresh();
  }

  function report() { try { return window.FormatXOperationalTwin?.getReport?.() || null; } catch (_) { return null; } }
  function refresh() { const node = document.getElementById('rf-baseline-status'); if (node) node.textContent = state.baseline ? text().captured : report() ? text().readyRun : text().noRun; }
  async function idFor(value) { if (!crypto?.subtle) return Date.now().toString(36).toUpperCase(); return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(value))))).slice(0, 16).toUpperCase(); }

  async function capture() {
    const current = report();
    if (!current) { document.getElementById('rf-notice').textContent = text().needRun; return; }
    state.baseline = clone(current); state.branch = null; state.delta = null; state.capsule = null;
    document.getElementById('rf-baseline-id').textContent = await idFor(current);
    document.getElementById('rf-fork').disabled = false; document.getElementById('rf-replay').disabled = true; document.getElementById('rf-seal').disabled = true;
    document.getElementById('rf-notice').textContent = text().captured; document.getElementById('rf-fingerprint').textContent = text().notSealed; document.getElementById('rf-verification').textContent = ''; render();
  }

  function spec() {
    const risk = Number(state.baseline?.project?.risk_level || 1); const duration = parseDuration(state.baseline?.project?.estimated_duration || '');
    if (state.intervention === 'safety') return { index: 1, risk: Math.max(1, risk - 1), duration: formatDuration({ low: duration.low * 1.12, high: duration.high * 1.12, unit: duration.unit }), outcome: 'verified', assurance: Math.min(5, assurance(state.baseline) + 1), reason: null, narrative: text().safetyNarrative };
    if (state.intervention === 'speed') return { index: 1, risk: Math.min(4, risk + 1), duration: formatDuration({ low: duration.low * .78, high: duration.high * .78, unit: duration.unit }), outcome: 'verified-with-reduced-assurance', assurance: Math.max(1, assurance(state.baseline) - 2), reason: 'reduced_verification_reserve', narrative: text().speedNarrative };
    if (state.intervention === 'fault') return { index: 3, risk, duration: formatDuration({ low: duration.low * .64, high: duration.high * .64, unit: duration.unit }), outcome: 'fail-closed', assurance: 5, reason: 'counterfactual_integrity_mismatch', narrative: text().faultNarrative };
    return { index: 2, risk, duration: formatDuration({ low: duration.low * .42, high: duration.high * .42, unit: duration.unit }), outcome: 'fail-closed', assurance: 5, reason: 'counterfactual_target_identity_mismatch', narrative: text().targetNarrative };
  }

  function fork() {
    if (!state.baseline) { document.getElementById('rf-notice').textContent = text().needRun; return; }
    const change = spec(); const branch = clone(state.baseline);
    branch.schema = 'formatx-counterfactual-operational-twin-v1'; branch.generated_at = new Date().toISOString(); branch.counterfactual = true; branch.parent_outcome = state.baseline.outcome; branch.intervention = state.intervention;
    branch.project.risk_level = change.risk; branch.project.estimated_duration = change.duration; branch.project.safety_interlock = state.intervention === 'safety' ? true : branch.project.safety_interlock; branch.project.fault_injection = ['fault', 'target'].includes(state.intervention);
    branch.outcome = change.outcome; branch.reason = change.reason; branch.assurance_level = change.assurance; branch.divergence_step = STEPS[change.index];
    state.branch = branch; state.delta = { risk: change.risk - Number(state.baseline.project.risk_level || 0), assurance: change.assurance - assurance(state.baseline), divergence_step: STEPS[change.index], intervention: state.intervention, narrative: change.narrative };
    state.capsule = null; document.getElementById('rf-replay').disabled = false; document.getElementById('rf-seal').disabled = false; document.getElementById('rf-fingerprint').textContent = text().notSealed; document.getElementById('rf-verification').textContent = ''; document.getElementById('rf-notice').textContent = text().done; render();
  }

  function set(id, value) { const node = document.getElementById(id); if (node) node.textContent = value; }
  function render() {
    if (state.baseline) { set('rf-base-head', outcome(state.baseline.outcome)); set('rf-base-out', outcome(state.baseline.outcome)); set('rf-base-risk', state.baseline.project.risk_level + ' / 4'); set('rf-base-time', state.baseline.project.estimated_duration); set('rf-base-assurance', assurance(state.baseline) + ' / 5'); }
    else { set('rf-base-head', text().waiting); ['rf-base-out','rf-base-risk','rf-base-time','rf-base-assurance'].forEach(id => set(id,'—')); }
    if (state.branch) { set('rf-branch-head', outcome(state.branch.outcome)); set('rf-branch-out', outcome(state.branch.outcome)); set('rf-branch-risk', state.branch.project.risk_level + ' / 4'); set('rf-branch-time', state.branch.project.estimated_duration); set('rf-branch-assurance', state.branch.assurance_level + ' / 5'); const index = STEPS.indexOf(state.delta.divergence_step); set('rf-div-step', LABELS[state.language][index]); set('rf-div-copy', state.delta.narrative); }
    else { set('rf-branch-head', text().waiting); ['rf-branch-out','rf-branch-risk','rf-branch-time','rf-branch-assurance'].forEach(id => set(id,'—')); set('rf-div-step','—'); set('rf-div-copy',text().none); }
    document.querySelectorAll('.reality-timeline [data-step]').forEach(node => node.classList.remove('active','done','diverged','blocked'));
  }

  async function replay() {
    if (!state.branch) { document.getElementById('rf-notice').textContent = text().needBranch; return; }
    const token = ++state.replayToken; const wait = new URLSearchParams(location.search).get('reality-test') === '1' ? 40 : 580; const divergence = STEPS.indexOf(state.delta.divergence_step);
    const base = Array.from(document.querySelectorAll('[data-lane="baseline"] [data-step]')); const branch = Array.from(document.querySelectorAll('[data-lane="branch"] [data-step]'));
    base.concat(branch).forEach(node => node.classList.remove('active','done','diverged','blocked')); document.getElementById('rf-notice').textContent = text().replaying;
    for (let index = 0; index < STEPS.length; index += 1) { if (token !== state.replayToken) return; base[index].classList.add('active'); branch[index].classList.add('active'); if (index === divergence) branch[index].classList.add('diverged'); await new Promise(resolve => setTimeout(resolve, wait)); base[index].classList.remove('active'); base[index].classList.add('done'); branch[index].classList.remove('active'); if (state.branch.outcome === 'fail-closed' && index >= divergence) branch[index].classList.add('blocked'); else branch[index].classList.add('done'); }
    document.getElementById('rf-notice').textContent = text().done;
  }

  async function verifyCapsule(capsule, imported) {
    try {
      const bytes = new TextEncoder().encode(canonical(capsule.payload)); const digest = hex(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))); if (digest !== capsule.proof.digest_sha256) throw new Error('digest');
      const key = await crypto.subtle.importKey('jwk', capsule.proof.public_key_jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      const valid = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, fromB64u(capsule.proof.signature_base64url), bytes); if (!valid) throw new Error('signature');
      if (imported) { state.baseline = clone(capsule.payload.baseline); state.branch = clone(capsule.payload.counterfactual); state.delta = clone(capsule.payload.delta); state.capsule = clone(capsule); set('rf-baseline-id', digest.slice(0,16).toUpperCase()); set('rf-fingerprint', digest.slice(0,20).toUpperCase()); set('rf-verification', text().valid); document.getElementById('rf-fork').disabled = false; document.getElementById('rf-replay').disabled = false; document.getElementById('rf-seal').disabled = false; render(); }
      return true;
    } catch (_) { set('rf-verification', text().invalid); return false; }
  }

  async function seal() {
    if (!state.branch || !crypto?.subtle) { set('rf-verification', text().needBranch); return; }
    const payload = { schema: 'formatx-reality-fork-capsule-v1', engine: 'formatx-counterfactual-operational-twin-v1', created_at: new Date().toISOString(), origin: location.origin + location.pathname, assumptions_locked: true, simulation_only: true, real_device_access: false, baseline: clone(state.baseline), counterfactual: clone(state.branch), delta: clone(state.delta), replay: { workflow: STEPS, divergence_step: state.delta.divergence_step, deterministic_from_payload: true } };
    const bytes = new TextEncoder().encode(canonical(payload)); const digestBytes = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    const keys = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign','verify']); const signature = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, keys.privateKey, bytes)); const publicKey = await crypto.subtle.exportKey('jwk', keys.publicKey);
    const capsule = { payload, proof: { type: 'session-integrity-signature', algorithm: 'ECDSA-P256-SHA256', digest_sha256: hex(digestBytes), public_key_jwk: publicKey, signature_base64url: b64u(signature), limitation: 'Integrity proof only; not publisher identity attestation.' } };
    if (!await verifyCapsule(capsule, false)) return; state.capsule = capsule; const id = capsule.proof.digest_sha256.slice(0,20).toUpperCase(); set('rf-fingerprint', id); set('rf-verification', text().valid);
    const blob = new Blob([JSON.stringify(capsule,null,2)], { type:'application/json;charset=utf-8' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'FormatX-Reality-Capsule-' + id + '.fxcapsule.json'; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url),0);
  }

  function bind() {
    document.getElementById('rf-capture').addEventListener('click', capture); document.getElementById('rf-fork').addEventListener('click', fork); document.getElementById('rf-replay').addEventListener('click', replay); document.getElementById('rf-seal').addEventListener('click', seal);
    document.getElementById('rf-import').addEventListener('change', async event => { try { const capsule = JSON.parse(await event.target.files[0].text()); await verifyCapsule(capsule, true); } catch (_) { set('rf-verification', text().invalid); } });
    document.querySelector('.reality-interventions').addEventListener('click', event => { const button = event.target.closest('[data-intervention]'); if (!button) return; state.intervention = button.dataset.intervention; document.querySelectorAll('[data-intervention]').forEach(item => item.setAttribute('aria-pressed', String(item === button))); state.branch = null; state.delta = null; document.getElementById('rf-replay').disabled = true; document.getElementById('rf-seal').disabled = true; render(); });
    new MutationObserver(refresh).observe(root,{attributes:true,attributeFilter:['data-simulator-state']}); new MutationObserver(translate).observe(root,{attributes:true,attributeFilter:['lang']});
  }

  function expose() { window.FormatXRealityFork = Object.freeze({ version:'reality-fork-capsule-v1', capture, fork, replay, seal, verifyCapsule, getState: () => clone(state) }); }
  function init() { ui(); expose(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else init();
}());
