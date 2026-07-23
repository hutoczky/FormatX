const API = '/fx-owner-license/api';
const state = { licenses: [], selectedId: null, selectedLicense: null, generated: null, csrf: null, searchTimer: null };
const byId = (id) => document.getElementById(id);
const elements = {
  serviceState: byId('serviceState'), adminEmail: byId('adminEmail'), createForm: byId('createForm'), createButton: byId('createButton'),
  generatedCard: byId('generatedCard'), generatedKey: byId('generatedKey'), generatedSummary: byId('generatedSummary'), copyKeyButton: byId('copyKeyButton'),
  copyMessageButton: byId('copyMessageButton'), emailButton: byId('emailButton'), dismissKeyButton: byId('dismissKeyButton'), refreshButton: byId('refreshButton'),
  searchInput: byId('searchInput'), statusFilter: byId('statusFilter'), licenseRows: byId('licenseRows'), emptyState: byId('emptyState'),
  detailTitle: byId('detailTitle'), detailContent: byId('detailContent'), auditList: byId('auditList'), toast: byId('toast'), editDialog: byId('editDialog'),
  editForm: byId('editForm'), editLicenseId: byId('editLicenseId'), editCustomerName: byId('editCustomerName'), editCustomerEmail: byId('editCustomerEmail'),
  editMaxDevices: byId('editMaxDevices'), editExpiresAt: byId('editExpiresAt'), editNotes: byId('editNotes'), saveEditButton: byId('saveEditButton'),
};

function node(tag, options = {}, children = []) {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text !== undefined) element.textContent = String(options.text);
  if (options.type) element.type = options.type;
  if (options.title) element.title = options.title;
  for (const child of children) if (child !== null && child !== undefined) element.append(child);
  return element;
}

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (state.csrf && !['GET', 'HEAD'].includes((options.method || 'GET').toUpperCase())) headers.set('X-FormatX-CSRF', state.csrf);
  const response = await fetch(`${API}${path}`, { ...options, headers, credentials: 'same-origin' });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401) {
    window.location.assign('/fx-owner-license/login');
    throw new Error('A munkamenet lejárt.');
  }
  if (!response.ok) throw new Error(errorMessage(payload.error || payload.message || `HTTP ${response.status}`));
  return payload;
}

function errorMessage(code) {
  return ({
    license_not_found: 'A licenc nem található.', license_revoked: 'A licenc vissza van vonva.', license_suspended: 'A licenc fel van függesztve.',
    license_expired: 'A licenc lejárt.', device_limit_reached: 'A licenchez tartozó eszközlimit betelt.', invalid_email: 'Az e-mail-cím hibás.',
    invalid_expiry: 'A lejárati idő hibás.', revocation_reason_required: 'A visszavonás oka kötelező.', csrf_invalid: 'A biztonsági munkamenet érvénytelen.',
    rate_limited: 'Túl sok kérés érkezett. Várj, majd próbáld újra.', internal_error: 'A szerver hibát észlelt.',
  })[code] || String(code);
}

let toastTimer = null;
function toast(message, isError = false) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.toggle('error', isError);
  elements.toast.hidden = false;
  toastTimer = window.setTimeout(() => { elements.toast.hidden = true; }, 5000);
}

function formatDate(value, includeTime = false) {
  if (!value) return 'nincs';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'hibás dátum';
  return new Intl.DateTimeFormat('hu-HU', { dateStyle: 'medium', ...(includeTime ? { timeStyle: 'short' } : {}) }).format(date);
}

function toLocalInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function effectiveStatus(license) {
  if (license.status === 'active' && license.expires_at && new Date(license.expires_at).getTime() <= Date.now()) return 'expired';
  return license.status;
}

function statusLabel(status) {
  return ({ active: 'Aktív', suspended: 'Felfüggesztett', revoked: 'Visszavont', expired: 'Lejárt' })[status] || status;
}

function planLabel(plan) {
  return ({ trial: 'Trial', pro: 'Pro', technician: 'Technician', business: 'Business', lifetime: 'Lifetime', owner: 'Owner' })[plan] || plan;
}

function statusBadge(status) { return node('span', { className: `badge badge-${status}`, text: statusLabel(status) }); }
function fact(label, value) { return node('div', { className: 'fact' }, [node('span', { text: label }), node('strong', { text: value ?? '—' })]); }
function actionButton(text, className, handler) { const button = node('button', { text, type: 'button', className }); button.addEventListener('click', handler); return button; }

async function loadSession() {
  const data = await api('/me');
  elements.adminEmail.textContent = data.email;
  state.csrf = data.csrf || null;
  elements.serviceState.textContent = data.auth_type === 'cloudflare-access' ? 'Cloudflare Access' : 'védett kapcsolat';
  elements.serviceState.className = 'state state-ok';
}

async function loadLicenses() {
  elements.refreshButton.disabled = true;
  const params = new URLSearchParams();
  const query = elements.searchInput.value.trim();
  const status = elements.statusFilter.value;
  if (query) params.set('q', query);
  if (status) params.set('status', status);
  try {
    const data = await api(`/licenses?${params.toString()}`);
    state.licenses = data.licenses || [];
    renderLicenses();
    if (state.selectedId && state.licenses.some((item) => item.id === state.selectedId)) await loadDetail(state.selectedId, false);
  } catch (error) { toast(`A licenclista nem tölthető be: ${error.message}`, true); }
  finally { elements.refreshButton.disabled = false; }
}

function renderLicenses() {
  elements.licenseRows.replaceChildren();
  elements.emptyState.hidden = state.licenses.length !== 0;
  for (const license of state.licenses) {
    const row = document.createElement('tr');
    row.dataset.id = license.id;
    row.tabIndex = 0;
    row.classList.toggle('selected', license.id === state.selectedId);
    const customer = node('div', { className: 'customer-cell' }, [node('strong', { text: license.customer_name }), node('small', { text: license.customer_email || 'nincs e-mail' })]);
    const status = effectiveStatus(license);
    row.append(
      node('td', {}, [customer]), node('td', { text: `FX*-****-${license.key_last4}` }), node('td', { text: planLabel(license.plan) }),
      node('td', { text: `${license.active_devices || 0}/${license.max_devices}` }), node('td', {}, [statusBadge(status)]), node('td', { text: formatDate(license.expires_at) }),
    );
    row.addEventListener('click', () => loadDetail(license.id));
    row.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); loadDetail(license.id); } });
    elements.licenseRows.append(row);
  }
}

async function loadDetail(id, showError = true) {
  state.selectedId = id;
  renderLicenses();
  elements.detailTitle.textContent = 'Betöltés…';
  elements.detailContent.className = 'detail-empty';
  elements.detailContent.textContent = 'A licenc adatainak lekérése folyamatban.';
  try {
    const data = await api(`/licenses/${encodeURIComponent(id)}`);
    state.selectedLicense = data.license;
    renderDetail(data.license, data.activations || []);
  } catch (error) {
    elements.detailTitle.textContent = 'Betöltési hiba'; elements.detailContent.textContent = error.message;
    if (showError) toast(`A licenc nem tölthető be: ${error.message}`, true);
  }
}

function renderDetail(license, activations) {
  const status = effectiveStatus(license);
  elements.detailTitle.textContent = license.customer_name;
  elements.detailContent.className = 'detail-content';
  elements.detailContent.replaceChildren();
  const facts = node('div', { className: 'fact-grid' }, [
    fact('Kulcsazonosító', `FX*-****-${license.key_last4}`), fact('Állapot', statusLabel(status)), fact('Típus', planLabel(license.plan)),
    fact('Aktív eszköz', `${license.active_devices || activations.filter((item) => !item.deactivated_at).length}/${license.max_devices}`),
    fact('Kiállítva', formatDate(license.issued_at, true)), fact('Lejárat', formatDate(license.expires_at, true)),
    fact('E-mail', license.customer_email || 'nincs'), fact('Létrehozta', license.created_by), fact('Utolsó módosítás', formatDate(license.updated_at, true)),
  ]);
  const actions = node('div', { className: 'detail-actions' });
  actions.append(actionButton('Módosítás', '', () => openEditDialog(license)));
  if (license.status !== 'active') actions.append(actionButton('Újraaktiválás', 'success', () => changeStatus(license.id, 'active')));
  if (license.status !== 'suspended') actions.append(actionButton('Felfüggesztés', 'warn', () => changeStatus(license.id, 'suspended')));
  if (license.status !== 'revoked') actions.append(actionButton('Visszavonás', 'danger', () => revokeLicense(license.id)));
  actions.append(actionButton('Helyettesítő licenc', 'success', () => replaceLicense(license.id)));
  const activationTitle = node('h3', { text: 'Eszközaktiválások' });
  const activationList = node('div', { className: 'activation-list' });
  if (!activations.length) activationList.append(node('p', { className: 'detail-empty', text: 'Még nincs eszközaktiválás.' }));
  for (const activation of activations) {
    const active = !activation.deactivated_at;
    const description = node('div', {}, [node('strong', { text: activation.device_name || 'Névtelen eszköz' }), node('small', { text: `${activation.platform || 'ismeretlen platform'} · ${activation.app_version || 'ismeretlen verzió'}` }), node('small', { text: `Első: ${formatDate(activation.first_seen_at, true)} · Utolsó: ${formatDate(activation.last_seen_at, true)}` })]);
    const controls = node('div');
    if (active) controls.append(actionButton('Leválasztás', 'danger', () => deactivateActivation(activation.id, license.id)));
    else controls.append(statusBadge('revoked'));
    activationList.append(node('div', { className: 'activation' }, [description, controls]));
  }
  const notes = fact('Belső megjegyzés', license.notes || 'nincs');
  if (license.revoke_reason) elements.detailContent.append(facts, actions, fact('Visszavonás oka', license.revoke_reason), notes, activationTitle, activationList);
  else elements.detailContent.append(facts, actions, notes, activationTitle, activationList);
}

function openEditDialog(license) {
  elements.editLicenseId.value = license.id;
  elements.editCustomerName.value = license.customer_name || '';
  elements.editCustomerEmail.value = license.customer_email || '';
  elements.editMaxDevices.value = String(license.max_devices || 1);
  elements.editExpiresAt.value = toLocalInput(license.expires_at);
  elements.editNotes.value = license.notes || '';
  elements.editDialog.showModal();
}

async function changeStatus(id, status) {
  if (!window.confirm(`Biztosan erre az állapotra váltod a licencet: ${statusLabel(status)}?`)) return;
  await runAction(async () => {
    await api(`/licenses/${encodeURIComponent(id)}/status`, { method: 'POST', body: JSON.stringify({ status }) });
    toast(`Licencállapot módosítva: ${statusLabel(status)}.`);
    await refreshAll(id);
  }, 'Az állapot nem módosítható');
}

async function revokeLicense(id) {
  const reason = window.prompt('Add meg a visszavonás okát. Ez kötelező és az auditnaplóba kerül:');
  if (!reason?.trim()) return;
  if (!window.confirm('A licenc a következő hiteles ellenőrzéskor letiltódik. Biztosan visszavonod?')) return;
  await runAction(async () => {
    await api(`/licenses/${encodeURIComponent(id)}/status`, { method: 'POST', body: JSON.stringify({ status: 'revoked', reason: reason.trim() }) });
    toast('A licenc visszavonva.');
    await refreshAll(id);
  }, 'A licenc nem vonható vissza');
}

async function replaceLicense(id) {
  const reason = window.prompt('Miért készül helyettesítő licenc? A régi licenc visszavonásra kerül:');
  if (!reason?.trim()) return;
  if (!window.confirm('A régi licenc visszavonódik, és új teljes kulcs készül. Folytatod?')) return;
  await runAction(async () => {
    const data = await api(`/licenses/${encodeURIComponent(id)}/replacement`, { method: 'POST', body: JSON.stringify({ reason: reason.trim() }) });
    showGenerated(data.license);
    toast('A helyettesítő licenc elkészült. A teljes kulcsot most mentsd el.');
    await refreshAll(data.license.id);
  }, 'A helyettesítő licenc nem készíthető el');
}

async function deactivateActivation(activationId, licenseId) {
  if (!window.confirm('Biztosan leválasztod ezt az eszközt a licencről?')) return;
  await runAction(async () => {
    await api(`/activations/${encodeURIComponent(activationId)}`, { method: 'DELETE' });
    toast('Az eszközaktiválás leválasztva.');
    await refreshAll(licenseId);
  }, 'Az eszköz nem választható le');
}

async function loadAudit() {
  try {
    const data = await api('/audit');
    elements.auditList.replaceChildren();
    for (const entry of data.entries || []) elements.auditList.append(node('li', {}, [node('time', { text: formatDate(entry.created_at, true) }), node('strong', { text: entry.action }), node('small', { text: entry.actor_email })]));
    if (!elements.auditList.children.length) elements.auditList.append(node('li', {}, [node('small', { text: 'Még nincs naplóbejegyzés.' })]));
  } catch (error) { toast(`Az auditnapló nem tölthető be: ${error.message}`, true); }
}

function activationText(license) {
  return `FormatX Suite Pro licenc\n\nLicenctípus: ${planLabel(license.plan)}\nLicenckulcs: ${license.license_key}\nEszközlimit: ${license.max_devices}\nÉrvényesség: ${license.expires_at ? formatDate(license.expires_at, true) : 'nincs lejárat'}\n\nAktiválás: nyisd meg a FormatX alkalmazás Licenc menüjét, illeszd be a kulcsot, majd válaszd az Aktiválás lehetőséget.\n\nA kulcsot ne tedd közzé és csak az engedélyezett számú eszközön használd.`;
}

function showGenerated(license) {
  state.generated = license;
  elements.generatedKey.textContent = license.license_key;
  elements.generatedSummary.replaceChildren(
    node('span', { text: `Típus: ${planLabel(license.plan)}` }), node('span', { text: `Eszközlimit: ${license.max_devices}` }),
    node('span', { text: `Ügyfél: ${license.customer_name}` }), node('span', { text: `Lejárat: ${license.expires_at ? formatDate(license.expires_at) : 'nincs'}` }),
  );
  elements.generatedCard.hidden = false;
  elements.generatedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function copyText(value, success) {
  try { await navigator.clipboard.writeText(value); toast(success); }
  catch { toast('A vágólap nem érhető el. Jelöld ki és másold kézzel.', true); }
}

async function refreshAll(selectedId = state.selectedId) {
  state.selectedId = selectedId;
  await Promise.all([loadLicenses(), loadAudit()]);
  if (selectedId) await loadDetail(selectedId, false);
}

async function runAction(action, prefix) {
  try { await action(); } catch (error) { toast(`${prefix}: ${error.message}`, true); }
}

elements.createForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  elements.createButton.disabled = true; elements.createButton.textContent = 'Generálás…';
  const expiry = byId('expiresAt').value;
  const payload = { customer_name: byId('customerName').value.trim(), customer_email: byId('customerEmail').value.trim() || null, plan: byId('plan').value, max_devices: Number(byId('maxDevices').value), expires_at: expiry ? new Date(expiry).toISOString() : null, notes: byId('notes').value.trim() || null };
  try {
    if (payload.plan === 'owner' && !window.confirm('Owner licencet hozol létre. Ez a legmagasabb jogosultság. Biztosan folytatod?')) return;
    const data = await api('/licenses', { method: 'POST', body: JSON.stringify(payload) });
    showGenerated(data.license);
    elements.createForm.reset(); byId('maxDevices').value = '1'; byId('plan').value = 'pro';
    toast('A licenc elkészült. A teljes kulcsot most mentsd el.');
    await refreshAll(data.license.id);
  } catch (error) { toast(`A licenc nem hozható létre: ${error.message}`, true); }
  finally { elements.createButton.disabled = false; elements.createButton.textContent = 'Licenc generálása'; }
});

elements.editForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = elements.editLicenseId.value;
  const expiry = elements.editExpiresAt.value;
  const payload = { customer_name: elements.editCustomerName.value.trim(), customer_email: elements.editCustomerEmail.value.trim() || null, max_devices: Number(elements.editMaxDevices.value), expires_at: expiry ? new Date(expiry).toISOString() : null, notes: elements.editNotes.value.trim() || null };
  elements.saveEditButton.disabled = true;
  await runAction(async () => {
    await api(`/licenses/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
    elements.editDialog.close(); toast('A licenc adatai elmentve.'); await refreshAll(id);
  }, 'A licenc nem módosítható');
  elements.saveEditButton.disabled = false;
});

elements.copyKeyButton.addEventListener('click', () => state.generated && copyText(state.generated.license_key, 'A licenckulcs a vágólapra került.'));
elements.copyMessageButton.addEventListener('click', () => state.generated && copyText(activationText(state.generated), 'Az aktiválási szöveg a vágólapra került.'));
elements.emailButton.addEventListener('click', () => {
  if (!state.generated) return;
  const subject = encodeURIComponent(`FormatX ${planLabel(state.generated.plan)} licenc`);
  const body = encodeURIComponent(activationText(state.generated));
  const recipient = encodeURIComponent(state.generated.customer_email || '');
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
});
elements.dismissKeyButton.addEventListener('click', () => { state.generated = null; elements.generatedKey.textContent = ''; elements.generatedCard.hidden = true; });
elements.refreshButton.addEventListener('click', () => refreshAll());
elements.statusFilter.addEventListener('change', loadLicenses);
elements.searchInput.addEventListener('input', () => { window.clearTimeout(state.searchTimer); state.searchTimer = window.setTimeout(loadLicenses, 280); });

async function start() {
  try { await loadSession(); await Promise.all([loadLicenses(), loadAudit()]); }
  catch (error) { elements.serviceState.textContent = 'hitelesítési hiba'; elements.serviceState.className = 'state state-error'; toast(`A licenckezelő nem indítható: ${error.message}`, true); }
}
start();
