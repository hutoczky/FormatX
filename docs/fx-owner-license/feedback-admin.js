const API = '/fx-owner-license/api/feedback';
const state = { csrf: null, records: [], selected: null };
const byId = id => document.getElementById(id);
const elements = {
  serviceState: byId('serviceState'),
  adminEmail: byId('adminEmail'),
  refreshButton: byId('refreshButton'),
  statusFilter: byId('statusFilter'),
  summaryGrid: byId('summaryGrid'),
  feedbackList: byId('feedbackList'),
  emptyState: byId('emptyState'),
  dialog: byId('moderationDialog'),
  dialogTitle: byId('dialogTitle'),
  feedbackId: byId('feedbackId'),
  dialogRatings: byId('dialogRatings'),
  dialogMeta: byId('dialogMeta'),
  dialogComment: byId('dialogComment'),
  moderationNote: byId('moderationNote'),
  approveButton: byId('approveButton'),
  rejectButton: byId('rejectButton'),
  pendingButton: byId('pendingButton'),
  deleteButton: byId('deleteButton'),
  toast: byId('toast'),
};

function node(tag, options = {}, children = []) {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text !== undefined) element.textContent = String(options.text);
  if (options.type) element.type = options.type;
  for (const child of children) if (child !== null && child !== undefined) element.append(child);
  return element;
}

async function api(path = '', options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API}${path}`, { ...options, headers, credentials: 'same-origin' });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401) {
    window.location.assign('/fx-owner-license/');
    throw new Error('A Cloudflare Access munkamenet lejárt.');
  }
  if (!response.ok) throw new Error(errorMessage(payload.error || payload.message || `HTTP ${response.status}`));
  return payload;
}

function errorMessage(code) {
  return ({
    feedback_not_found: 'A visszajelzés nem található.',
    invalid_status: 'Érvénytelen moderációs állapot.',
    invalid_json: 'A kérés adatai hibásak.',
    origin_not_allowed: 'A kérés eredete nem engedélyezett.',
    admin_auth_required: 'Tulajdonosi Cloudflare Access belépés szükséges.',
    feedback_error: 'A visszajelző szolgáltatás hibát észlelt.',
  })[code] || String(code);
}

let toastTimer = 0;
function toast(message, isError = false) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.toggle('error', isError);
  elements.toast.hidden = false;
  toastTimer = setTimeout(() => { elements.toast.hidden = true; }, 5000);
}

function formatDate(value) {
  if (!value) return 'nincs';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'hibás dátum';
  return new Intl.DateTimeFormat('hu-HU', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function statusLabel(status) {
  return ({ pending: 'Moderálásra vár', approved: 'Jóváhagyott', rejected: 'Elutasított' })[status] || status;
}

function statusBadge(status) {
  return node('span', { className: `badge badge-${status}`, text: statusLabel(status) });
}

function ratingRow(label, value) {
  const number = Number(value || 0);
  return node('div', { className: 'rating-row' }, [
    node('span', { text: label }),
    node('strong', { text: `${'★'.repeat(number)}${'☆'.repeat(Math.max(0, 5 - number))} ${number}/5` }),
  ]);
}

async function loadSession() {
  const response = await fetch('/fx-owner-license/api/me', { credentials: 'same-origin' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    window.location.assign('/fx-owner-license/login');
    throw new Error('A tulajdonosi munkamenet nem érhető el.');
  }
  elements.adminEmail.textContent = data.email || '—';
  elements.serviceState.textContent = data.auth_type === 'cloudflare-access' ? 'Cloudflare Access' : 'védett kapcsolat';
  elements.serviceState.className = 'state state-ok';
}

async function loadSummary() {
  const data = await api('/summary');
  const summary = data.summary || {};
  const cards = [
    ['Összes', summary.total || 0],
    ['Várakozik', summary.pending || 0],
    ['Jóváhagyott', summary.approved || 0],
    ['Elutasított', summary.rejected || 0],
    ['Nyilvános átlag', summary.public_average == null ? '—' : `${Number(summary.public_average).toFixed(1)} / 5`],
  ];
  elements.summaryGrid.replaceChildren(...cards.map(([label, value]) => node('article', {}, [
    node('span', { text: label }),
    node('strong', { text: value }),
  ])));
}

async function loadFeedback() {
  elements.refreshButton.disabled = true;
  try {
    const status = elements.statusFilter.value;
    const data = await api(`?status=${encodeURIComponent(status)}&limit=200`);
    state.records = data.feedback || [];
    renderFeedback();
  } catch (error) {
    toast(`A visszajelzések nem tölthetők be: ${error.message}`, true);
  } finally {
    elements.refreshButton.disabled = false;
  }
}

function renderFeedback() {
  elements.feedbackList.replaceChildren();
  elements.emptyState.hidden = state.records.length !== 0;
  for (const record of state.records) {
    const card = node('article', { className: 'feedback-card' });
    const identity = record.display_name || 'Névtelen felhasználó';
    const header = node('div', { className: 'feedback-card-head' }, [
      node('div', {}, [
        node('strong', { text: identity }),
        node('small', { text: `${formatDate(record.created_at)} · ${record.locale || 'hu'} · ${record.source || 'website'}` }),
      ]),
      statusBadge(record.status),
    ]);
    const score = node('div', { className: 'feedback-score' }, [
      node('strong', { text: `${record.overall}/5` }),
      node('span', { text: `${'★'.repeat(record.overall)}${'☆'.repeat(5 - record.overall)}` }),
    ]);
    const comment = node('p', {
      className: 'feedback-excerpt',
      text: record.comment || 'Nincs szöveges visszajelzés.',
    });
    const meta = node('div', { className: 'feedback-card-meta' }, [
      node('span', { text: `Használhatóság ${record.usability}/5` }),
      node('span', { text: `Teljesítmény ${record.performance}/5` }),
      node('span', { text: `Dizájn ${record.design}/5` }),
      node('span', { text: `Funkciók ${record.features}/5` }),
    ]);
    const button = node('button', { type: 'button', className: 'primary', text: 'Megnyitás és moderálás' });
    button.addEventListener('click', () => openRecord(record.id));
    card.append(header, score, comment, meta, button);
    elements.feedbackList.append(card);
  }
}

async function openRecord(id) {
  try {
    const data = await api(`/${encodeURIComponent(id)}`);
    state.selected = data.feedback;
    renderDialog(data.feedback);
    elements.dialog.showModal();
  } catch (error) {
    toast(`A visszajelzés nem nyitható meg: ${error.message}`, true);
  }
}

function appendMeta(term, description) {
  elements.dialogMeta.append(node('div', {}, [node('dt', { text: term }), node('dd', { text: description || '—' })]));
}

function renderDialog(record) {
  elements.feedbackId.value = record.id;
  elements.dialogTitle.textContent = record.display_name || 'Névtelen visszajelzés';
  elements.dialogRatings.replaceChildren(
    ratingRow('Összbenyomás', record.overall),
    ratingRow('Használhatóság', record.usability),
    ratingRow('Teljesítmény', record.performance),
    ratingRow('Dizájn', record.design),
    ratingRow('Funkciók', record.features),
  );
  elements.dialogMeta.replaceChildren();
  appendMeta('Állapot', statusLabel(record.status));
  appendMeta('Beküldve', formatDate(record.created_at));
  appendMeta('Kapcsolati e-mail', record.contact_email || 'nincs');
  appendMeta('Közzétételi engedély', record.publish_permission ? 'igen' : 'nem');
  appendMeta('Forrásoldal', record.page_path || '/');
  appendMeta('Nyelv', record.locale || 'hu');
  appendMeta('Technikai környezet', record.user_agent || 'nincs');
  elements.dialogComment.textContent = record.comment || 'Nincs szöveges visszajelzés.';
  elements.moderationNote.value = record.moderation_note || '';
}

async function updateStatus(status) {
  const id = elements.feedbackId.value;
  if (!id) return;
  const label = statusLabel(status);
  if (!window.confirm(`Biztosan erre az állapotra váltod: ${label}?`)) return;
  try {
    await api(`/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, moderation_note: elements.moderationNote.value.trim() }),
    });
    elements.dialog.close();
    toast(`Visszajelzés állapota: ${label}.`);
    await refreshAll();
  } catch (error) {
    toast(`A moderáció nem menthető: ${error.message}`, true);
  }
}

async function deleteRecord() {
  const id = elements.feedbackId.value;
  if (!id) return;
  if (!window.confirm('A visszajelzés véglegesen törlődik. Ez nem vonható vissza. Folytatod?')) return;
  try {
    await api(`/${encodeURIComponent(id)}`, { method: 'DELETE' });
    elements.dialog.close();
    toast('A visszajelzés véglegesen törölve.');
    await refreshAll();
  } catch (error) {
    toast(`A visszajelzés nem törölhető: ${error.message}`, true);
  }
}

async function refreshAll() {
  await Promise.all([loadSummary(), loadFeedback()]);
}

elements.refreshButton.addEventListener('click', refreshAll);
elements.statusFilter.addEventListener('change', loadFeedback);
elements.approveButton.addEventListener('click', () => updateStatus('approved'));
elements.rejectButton.addEventListener('click', () => updateStatus('rejected'));
elements.pendingButton.addEventListener('click', () => updateStatus('pending'));
elements.deleteButton.addEventListener('click', deleteRecord);

(async () => {
  try {
    await loadSession();
    await refreshAll();
  } catch (error) {
    elements.serviceState.textContent = 'hiba';
    elements.serviceState.className = 'state state-error';
    toast(error.message, true);
  }
})();
