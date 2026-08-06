const FEEDBACK_PATH = '/api/feedback';
const SUMMARY_PATH = '/api/feedback/summary';
const CONSENT_VERSION = '2026-08-06';
const MAX_BODY_BYTES = 16 * 1024;
const MAX_COMMENT_LENGTH = 1200;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;
const MAX_USER_AGENT_LENGTH = 320;
const ALLOWED_STATUSES = new Set(['pending', 'approved', 'rejected']);

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS user_feedback (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  overall INTEGER NOT NULL CHECK (overall BETWEEN 1 AND 5),
  usability INTEGER NOT NULL CHECK (usability BETWEEN 1 AND 5),
  performance INTEGER NOT NULL CHECK (performance BETWEEN 1 AND 5),
  design INTEGER NOT NULL CHECK (design BETWEEN 1 AND 5),
  features INTEGER NOT NULL CHECK (features BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  display_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  publish_permission INTEGER NOT NULL DEFAULT 0 CHECK (publish_permission IN (0, 1)),
  privacy_consent INTEGER NOT NULL DEFAULT 1 CHECK (privacy_consent IN (0, 1)),
  consent_version TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'hu',
  source TEXT NOT NULL DEFAULT 'website',
  page_path TEXT NOT NULL DEFAULT '/',
  ip_hash TEXT NOT NULL,
  user_agent TEXT NOT NULL DEFAULT '',
  moderation_note TEXT NOT NULL DEFAULT '',
  approved_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status_created ON user_feedback(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_ip_created ON user_feedback(ip_hash, created_at DESC);
`;

export async function handleFeedbackRequest(request, env) {
  const url = new URL(request.url);
  if (url.pathname !== FEEDBACK_PATH && url.pathname !== SUMMARY_PATH) return null;

  if (request.method === 'OPTIONS') {
    return response(null, 204, request, { 'Access-Control-Max-Age': '86400' });
  }

  if (!env.LICENSE_DB) {
    return json({ error: 'feedback_unavailable', message: 'A visszajelző adatbázis nem érhető el.' }, 503, request);
  }

  try {
    await ensureFeedbackSchema(env.LICENSE_DB);

    if (request.method === 'GET' && url.pathname === SUMMARY_PATH) {
      return await feedbackSummary(env.LICENSE_DB, request);
    }

    if (request.method === 'POST' && url.pathname === FEEDBACK_PATH) {
      return await submitFeedback(request, env);
    }

    return json({ error: 'method_not_allowed' }, 405, request, { Allow: 'GET, POST, OPTIONS' });
  } catch (error) {
    console.error('FormatX feedback API error', error);
    return json({
      error: 'feedback_error',
      message: 'A visszajelzés most nem menthető. Próbáld meg később.',
    }, 500, request);
  }
}

async function ensureFeedbackSchema(database) {
  await database.exec(SCHEMA_SQL);
}

async function feedbackSummary(database, request) {
  const row = await database.prepare(`
    SELECT
      COUNT(*) AS count,
      ROUND(AVG(overall), 2) AS overall,
      ROUND(AVG(usability), 2) AS usability,
      ROUND(AVG(performance), 2) AS performance,
      ROUND(AVG(design), 2) AS design,
      ROUND(AVG(features), 2) AS features,
      MAX(approved_at) AS updated_at
    FROM user_feedback
    WHERE status = 'approved'
  `).first();

  const count = Number(row?.count || 0);
  return json({
    ok: true,
    state: count > 0 ? 'published' : 'awaiting-approved-feedback',
    count,
    average: count > 0 ? {
      overall: Number(row.overall),
      usability: Number(row.usability),
      performance: Number(row.performance),
      design: Number(row.design),
      features: Number(row.features),
    } : null,
    updated_at: row?.updated_at || null,
    moderation: 'Only approved, genuine submissions are included. No review text or email address is exposed by this endpoint.',
  }, 200, request, { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' });
}

async function submitFeedback(request, env) {
  if (!sameOrigin(request)) {
    return json({ error: 'invalid_origin', message: 'A beküldés csak a FormatX oldaláról engedélyezett.' }, 403, request);
  }

  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json({ error: 'payload_too_large', message: 'A visszajelzés adatcsomagja túl nagy.' }, 413, request);
  }

  const rateLimited = await applyRateLimit(request, env);
  if (rateLimited) return rateLimited;

  let payload;
  try {
    payload = await readJson(request);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === 'Payload too large';
    return json({
      error: tooLarge ? 'payload_too_large' : 'invalid_json',
      message: tooLarge
        ? 'A visszajelzés adatcsomagja túl nagy.'
        : 'A visszajelzés csak érvényes JSON-adatcsomagként küldhető.',
    }, tooLarge ? 413 : 400, request);
  }

  const validation = validateFeedbackPayload(payload);
  if (!validation.ok) {
    return json({
      error: 'invalid_feedback',
      message: 'Egy vagy több értékelési mező hibás vagy hiányzik.',
      fields: validation.errors,
    }, 400, request);
  }

  // Honeypot: return a neutral accepted response without storing bot content.
  if (cleanText(payload.website, 200)) {
    return json({ ok: true, state: 'pending-moderation' }, 202, request);
  }

  const ipHash = await hashRequestIdentity(request, env);
  const recent = await env.LICENSE_DB.prepare(`
    SELECT COUNT(*) AS count
    FROM user_feedback
    WHERE ip_hash = ?1
      AND created_at >= datetime('now', '-24 hours')
  `).bind(ipHash).first();

  if (Number(recent?.count || 0) >= 3) {
    return json({
      error: 'feedback_rate_limited',
      message: 'Erről a kapcsolatról 24 órán belül legfeljebb három értékelés küldhető.',
    }, 429, request, { 'Retry-After': '86400' });
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const pagePath = normalisePagePath(payload.page_path);

  await env.LICENSE_DB.prepare(`
    INSERT INTO user_feedback (
      id, created_at, updated_at, status,
      overall, usability, performance, design, features,
      comment, display_name, contact_email,
      publish_permission, privacy_consent, consent_version,
      locale, source, page_path, ip_hash, user_agent
    ) VALUES (
      ?1, ?2, ?2, 'pending',
      ?3, ?4, ?5, ?6, ?7,
      ?8, ?9, ?10,
      ?11, 1, ?12,
      ?13, ?14, ?15, ?16, ?17
    )
  `).bind(
    id,
    now,
    Number(payload.overall),
    Number(payload.usability),
    Number(payload.performance),
    Number(payload.design),
    Number(payload.features),
    cleanText(payload.comment, MAX_COMMENT_LENGTH),
    cleanText(payload.display_name, MAX_NAME_LENGTH),
    normaliseEmail(payload.contact_email),
    payload.publish_permission === true ? 1 : 0,
    CONSENT_VERSION,
    payload.locale === 'en' ? 'en' : 'hu',
    cleanText(payload.source, 40) || 'website',
    pagePath,
    ipHash,
    cleanText(request.headers.get('User-Agent'), MAX_USER_AGENT_LENGTH),
  ).run();

  return json({
    ok: true,
    state: 'pending-moderation',
    reference: id,
    message: 'Köszönjük. A visszajelzés moderálásra vár; csak jóváhagyás után kerülhet bele a nyilvános átlagba.',
  }, 202, request);
}

export function validateFeedbackPayload(payload) {
  const errors = {};
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, errors: { payload: 'Hiányzó vagy hibás adatcsomag.' } };
  }

  for (const field of ['overall', 'usability', 'performance', 'design', 'features']) {
    const value = Number(payload[field]);
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      errors[field] = '1 és 5 közötti egész szám szükséges.';
    }
  }

  if (String(payload.comment || '').length > MAX_COMMENT_LENGTH) errors.comment = `Legfeljebb ${MAX_COMMENT_LENGTH} karakter.`;
  if (String(payload.display_name || '').length > MAX_NAME_LENGTH) errors.display_name = `Legfeljebb ${MAX_NAME_LENGTH} karakter.`;
  if (String(payload.contact_email || '').length > MAX_EMAIL_LENGTH) errors.contact_email = `Legfeljebb ${MAX_EMAIL_LENGTH} karakter.`;
  if (payload.contact_email && !isValidEmail(payload.contact_email)) errors.contact_email = 'Érvénytelen e-mail-cím.';
  if (payload.privacy_consent !== true) errors.privacy_consent = 'Az adatkezelési tájékoztató elfogadása kötelező.';

  return { ok: Object.keys(errors).length === 0, errors };
}

async function applyRateLimit(request, env) {
  const limiter = env.PUBLIC_API_RATE_LIMIT;
  if (!limiter || typeof limiter.limit !== 'function') return null;
  const key = await hashRequestIdentity(request, env, 'ratelimit');
  const result = await limiter.limit({ key: `feedback:${key}` });
  if (result.success) return null;
  return json({
    error: 'rate_limited',
    message: 'Túl sok kérés érkezett. Várj egy percet, majd próbáld újra.',
  }, 429, request, { 'Retry-After': '60' });
}

async function hashRequestIdentity(request, env, purpose = 'storage') {
  const ip = request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    || 'unknown';
  const secret = env.FEEDBACK_HASH_PEPPER || env.FORMATX_ISSUER_KEY_ID || 'formatx-feedback-v1';
  const input = new TextEncoder().encode(`${purpose}|${secret}|${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function sameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function readJson(request) {
  const type = request.headers.get('Content-Type') || '';
  if (!type.toLowerCase().includes('application/json')) throw new Error('JSON content type required');
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new Error('Payload too large');
  return JSON.parse(text || '{}');
}

function cleanText(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function normaliseEmail(value) {
  return cleanText(value, MAX_EMAIL_LENGTH).toLowerCase();
}

function isValidEmail(value) {
  const email = normaliseEmail(value);
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalisePagePath(value) {
  const text = cleanText(value, 240);
  if (!text.startsWith('/')) return '/';
  return text.split(/[?#]/, 1)[0] || '/';
}

function json(payload, status, request, extraHeaders = {}) {
  return response(JSON.stringify(payload), status, request, {
    'Content-Type': 'application/json; charset=utf-8',
    ...extraHeaders,
  });
}

function response(body, status, request, extraHeaders = {}) {
  const origin = request.headers.get('Origin');
  const headers = new Headers({
    'Cache-Control': 'no-store, max-age=0',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    ...extraHeaders,
  });
  if (origin && sameOrigin(request)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }
  return new Response(body, { status, headers });
}

export const feedbackConstants = Object.freeze({
  FEEDBACK_PATH,
  SUMMARY_PATH,
  CONSENT_VERSION,
  ALLOWED_STATUSES,
});
