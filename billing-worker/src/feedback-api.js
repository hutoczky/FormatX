import { ensureFeedbackSchemaCompatibility } from './feedback-schema.js';

const FEEDBACK_PATH = '/api/feedback';
const SUMMARY_PATH = '/api/feedback/summary';
const ADMIN_FEEDBACK_ROOT = '/fx-owner-license/api/feedback';
const CONSENT_VERSION = '2026-08-06';
const MAX_BODY_BYTES = 16 * 1024;
const MAX_COMMENT_LENGTH = 1200;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;
const MAX_USER_AGENT_LENGTH = 320;
const ALLOWED_STATUSES = new Set(['pending', 'approved', 'rejected']);
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
let accessJwksCache = { url: '', expiresAt: 0, keys: [] };

export async function handleFeedbackRequest(request, env) {
  const url = new URL(request.url);
  const isPublicPath = url.pathname === FEEDBACK_PATH || url.pathname === SUMMARY_PATH;
  const isAdminPath = url.pathname === ADMIN_FEEDBACK_ROOT
    || url.pathname.startsWith(`${ADMIN_FEEDBACK_ROOT}/`);
  if (!isPublicPath && !isAdminPath) return null;

  if (request.method === 'OPTIONS') {
    return response(null, 204, request, { 'Access-Control-Max-Age': '86400' });
  }

  if (!env.LICENSE_DB) {
    return json({ error: 'feedback_unavailable', message: 'A visszajelző adatbázis nem érhető el.' }, 503, request);
  }

  try {
    // One central compatibility check. Its normal path is read-only and cached per isolate.
    await ensureFeedbackSchemaCompatibility(env.LICENSE_DB);

    if (isAdminPath) {
      return await handleAdminFeedbackRequest(request, env, url);
    }

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
      message: 'A visszajelzés most nem kezelhető. Próbáld meg később.',
    }, 500, request);
  }
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

async function handleAdminFeedbackRequest(request, env, url) {
  const admin = await authenticateAccessAdmin(request, env);
  if (!admin.ok) {
    return json({ ok: false, error: 'admin_auth_required' }, 401, request, {
      'WWW-Authenticate': 'Cloudflare-Access',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    });
  }

  if (!['GET', 'HEAD'].includes(request.method) && !sameOrigin(request)) {
    return json({ ok: false, error: 'origin_not_allowed' }, 403, request);
  }

  const relative = url.pathname.slice(ADMIN_FEEDBACK_ROOT.length) || '/';
  if (relative === '/' && request.method === 'GET') {
    return adminListFeedback(request, env, url, admin.email);
  }
  if (relative === '/summary' && request.method === 'GET') {
    return adminFeedbackSummary(request, env, admin.email);
  }

  const recordMatch = relative.match(/^\/([0-9a-f-]{36})$/i);
  if (recordMatch && request.method === 'GET') {
    return adminFeedbackDetail(request, env, recordMatch[1], admin.email);
  }
  if (recordMatch && request.method === 'PATCH') {
    return adminUpdateFeedback(request, env, recordMatch[1], admin.email);
  }
  if (recordMatch && request.method === 'DELETE') {
    return adminDeleteFeedback(request, env, recordMatch[1], admin.email);
  }

  return json({ ok: false, error: 'not_found' }, 404, request);
}

async function adminListFeedback(request, env, url, actorEmail) {
  const status = url.searchParams.get('status') || 'pending';
  if (!ALLOWED_STATUSES.has(status) && status !== 'all') {
    return json({ ok: false, error: 'invalid_status' }, 400, request);
  }
  const limit = Math.min(200, Math.max(1, Number.parseInt(url.searchParams.get('limit') || '100', 10) || 100));
  const where = status === 'all' ? '' : 'WHERE status = ?1';
  const statement = env.LICENSE_DB.prepare(`
    SELECT id, created_at, updated_at, status,
      overall, usability, performance, design, features,
      comment, display_name, contact_email, publish_permission,
      locale, source, page_path, moderation_note, approved_at
    FROM user_feedback
    ${where}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);
  const rows = status === 'all' ? await statement.all() : await statement.bind(status).all();
  return adminJson({ ok: true, actor: actorEmail, feedback: rows.results || [] }, request);
}

async function adminFeedbackSummary(request, env, actorEmail) {
  const row = await env.LICENSE_DB.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
      ROUND(AVG(CASE WHEN status = 'approved' THEN overall END), 2) AS public_average
    FROM user_feedback
  `).first();
  return adminJson({
    ok: true,
    actor: actorEmail,
    summary: {
      total: Number(row?.total || 0),
      pending: Number(row?.pending || 0),
      approved: Number(row?.approved || 0),
      rejected: Number(row?.rejected || 0),
      public_average: row?.public_average == null ? null : Number(row.public_average),
    },
  }, request);
}

async function adminFeedbackDetail(request, env, id, actorEmail) {
  const record = await env.LICENSE_DB.prepare(`
    SELECT id, created_at, updated_at, status,
      overall, usability, performance, design, features,
      comment, display_name, contact_email, publish_permission,
      privacy_consent, consent_version, locale, source, page_path,
      user_agent, moderation_note, approved_at
    FROM user_feedback WHERE id = ?1
  `).bind(id).first();
  if (!record) return json({ ok: false, error: 'feedback_not_found' }, 404, request);
  return adminJson({ ok: true, actor: actorEmail, feedback: record }, request);
}

async function adminUpdateFeedback(request, env, id, actorEmail) {
  let body;
  try {
    body = await readJson(request);
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400, request);
  }
  const status = String(body.status || '').trim();
  if (!ALLOWED_STATUSES.has(status)) {
    return json({ ok: false, error: 'invalid_status' }, 400, request);
  }
  const note = cleanText(body.moderation_note, 1000);
  const existing = await env.LICENSE_DB.prepare('SELECT id, status FROM user_feedback WHERE id = ?1').bind(id).first();
  if (!existing) return json({ ok: false, error: 'feedback_not_found' }, 404, request);
  const now = new Date().toISOString();
  await env.LICENSE_DB.prepare(`
    UPDATE user_feedback
    SET status = ?1,
        moderation_note = ?2,
        approved_at = ?3,
        updated_at = ?4
    WHERE id = ?5
  `).bind(status, note, status === 'approved' ? now : null, now, id).run();
  console.log('FormatX feedback moderation', JSON.stringify({ actor: actorEmail, id, from: existing.status, to: status }));
  return adminFeedbackDetail(request, env, id, actorEmail);
}

async function adminDeleteFeedback(request, env, id, actorEmail) {
  const result = await env.LICENSE_DB.prepare('DELETE FROM user_feedback WHERE id = ?1').bind(id).run();
  const deleted = Number(result.meta?.changes || 0) > 0;
  if (!deleted) return json({ ok: false, error: 'feedback_not_found' }, 404, request);
  console.log('FormatX feedback deleted', JSON.stringify({ actor: actorEmail, id }));
  return adminJson({ ok: true, deleted: true, id }, request);
}

async function authenticateAccessAdmin(request, env) {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.ADMIN_EMAILS) return { ok: false };
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return { ok: false };
  try {
    const payload = await verifyAccessJwt(token, env.ACCESS_TEAM_DOMAIN, env.ACCESS_AUD);
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    if (!email || !adminEmails(env).has(email)) return { ok: false };
    return { ok: true, email };
  } catch (error) {
    console.warn('FormatX feedback Access validation failed', error instanceof Error ? error.message : String(error));
    return { ok: false };
  }
}

async function verifyAccessJwt(token, teamDomain, audience) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('invalid_jwt');
  const header = JSON.parse(textDecoder.decode(base64UrlDecode(parts[0])));
  const payload = JSON.parse(textDecoder.decode(base64UrlDecode(parts[1])));
  if (header.alg !== 'RS256' || !header.kid) throw new Error('unsupported_jwt');
  const issuer = teamDomain.replace(/\/$/, '');
  if (payload.iss !== issuer) throw new Error('issuer_mismatch');
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(audience)) throw new Error('audience_mismatch');
  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= now || (payload.nbf && payload.nbf > now + 30)) throw new Error('token_expired');
  const jwksUrl = `${issuer}/cdn-cgi/access/certs`;
  const keys = await getAccessJwks(jwksUrl);
  const jwk = keys.find((key) => key.kid === header.kid);
  if (!jwk) throw new Error('unknown_kid');
  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    base64UrlDecode(parts[2]),
    textEncoder.encode(`${parts[0]}.${parts[1]}`),
  );
  if (!valid) throw new Error('signature_invalid');
  return payload;
}

async function getAccessJwks(url) {
  if (accessJwksCache.url === url && accessJwksCache.expiresAt > Date.now()) {
    return accessJwksCache.keys;
  }
  const jwksResponse = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!jwksResponse.ok) throw new Error(`jwks_${jwksResponse.status}`);
  const payload = await jwksResponse.json();
  const keys = Array.isArray(payload.keys) ? payload.keys : [];
  accessJwksCache = { url, expiresAt: Date.now() + 5 * 60 * 1000, keys };
  return keys;
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
  const input = textEncoder.encode(`${purpose}|${secret}|${ip}`);
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
  if (textEncoder.encode(text).byteLength > MAX_BODY_BYTES) throw new Error('Payload too large');
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

function adminEmails(env) {
  return new Set(String(env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean));
}

function base64UrlDecode(value) {
  const raw = String(value);
  const padded = raw.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(raw.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function adminJson(payload, request, status = 200) {
  return json(payload, status, request, {
    'Cache-Control': 'no-store, max-age=0',
    'X-Robots-Tag': 'noindex, nofollow,noarchive'.replace('nofollow,noarchive', 'nofollow, noarchive'),
  });
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
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }
  return new Response(body, { status, headers });
}

export const feedbackConstants = Object.freeze({
  FEEDBACK_PATH,
  SUMMARY_PATH,
  ADMIN_FEEDBACK_ROOT,
  CONSENT_VERSION,
  ALLOWED_STATUSES,
});
