const ADMIN_ROOT = '/fx-owner-license';
const PUBLIC_API_ROOT = '/api/license';
const SESSION_COOKIE = 'fx_owner_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
let accessJwksCache = { url: '', expiresAt: 0, keys: [] };

export async function handleLicenseCenterRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (!path.startsWith(ADMIN_ROOT) && !path.startsWith(PUBLIC_API_ROOT)) {
    return null;
  }

  try {
    if (!env.LICENSE_DB) {
      return json({ ok: false, error: 'license_database_unavailable' }, 503);
    }

    if (path === `${PUBLIC_API_ROOT}/health` && request.method === 'GET') {
      return json({ ok: true, service: 'formatx-license-center', time: nowIso() });
    }

    if (path === `${PUBLIC_API_ROOT}/activate` && request.method === 'POST') {
      return await publicActivate(request, env);
    }
    if (path === `${PUBLIC_API_ROOT}/check` && request.method === 'POST') {
      return await publicCheck(request, env);
    }
    if (path === `${PUBLIC_API_ROOT}/deactivate` && request.method === 'POST') {
      return await publicDeactivate(request, env);
    }

    if (path === ADMIN_ROOT) {
      return Response.redirect(new URL(`${ADMIN_ROOT}/`, request.url).toString(), 308);
    }

    if (path === `${ADMIN_ROOT}/login` || path === `${ADMIN_ROOT}/login/`) {
      return await handlePasswordLogin(request, env);
    }
    if (path === `${ADMIN_ROOT}/logout` && request.method === 'POST') {
      return logoutResponse(request);
    }

    const admin = await authenticateAdmin(request, env);
    if (!admin.ok) return admin.response;

    if (path.startsWith(`${ADMIN_ROOT}/api/`)) {
      if (!['GET', 'HEAD'].includes(request.method)) {
        const origin = request.headers.get('Origin');
        if (origin && origin !== url.origin) {
          return json({ ok: false, error: 'origin_not_allowed' }, 403);
        }
        if (admin.authType === 'password') {
          const csrf = request.headers.get('X-FormatX-CSRF') || '';
          if (!admin.csrf || !constantTimeStringEqual(csrf, admin.csrf)) {
            return json({ ok: false, error: 'csrf_invalid' }, 403);
          }
        }
      }
      return await handleAdminApi(request, env, admin);
    }

    if (path === `${ADMIN_ROOT}/` || path.startsWith(`${ADMIN_ROOT}/`)) {
      const relative = path.slice(ADMIN_ROOT.length) || '/';
      return await serveAdminAsset(request, env, relative);
    }

    return json({ ok: false, error: 'not_found' }, 404);
  } catch (error) {
    console.error('FormatX license center error', error instanceof Error ? error.message : String(error));
    return json({ ok: false, error: 'internal_error' }, 500);
  }
}

async function publicActivate(request, env) {
  await enforceRateLimit(request, env, 'activate', 20, 60);
  const body = await readJson(request);
  const license = await findLicenseByKey(env, body.license_key);
  requireUsableLicense(license);

  const deviceId = validateDeviceId(body.device_id);
  const deviceHash = await hmacHex(env.LICENSE_PEPPER, `device:${deviceId}`);
  const existing = await env.LICENSE_DB.prepare(
    `SELECT * FROM license_activations
     WHERE license_id = ? AND device_hash = ?`
  ).bind(license.id, deviceHash).first();

  const timestamp = nowIso();
  if (existing && !existing.deactivated_at) {
    await env.LICENSE_DB.prepare(
      `UPDATE license_activations SET device_name = ?, platform = ?, app_version = ?, last_seen_at = ? WHERE id = ?`
    ).bind(
      optionalText(body.device_name, 160) ?? existing.device_name,
      optionalText(body.platform, 80) ?? existing.platform,
      optionalText(body.app_version, 80) ?? existing.app_version,
      timestamp,
      existing.id,
    ).run();
    return json(publicLicenseResult(license, await activeDeviceCount(env, license.id), existing.id));
  }

  const count = await activeDeviceCount(env, license.id);
  if (count >= license.max_devices) {
    return json({ ok: false, valid: false, error: 'device_limit_reached', devices_used: count, devices_allowed: license.max_devices }, 409);
  }

  const activationId = existing?.id || crypto.randomUUID();
  if (existing) {
    await env.LICENSE_DB.prepare(
      `UPDATE license_activations
       SET device_name = ?, platform = ?, app_version = ?, first_seen_at = ?, last_seen_at = ?, deactivated_at = NULL
       WHERE id = ?`
    ).bind(
      optionalText(body.device_name, 160),
      optionalText(body.platform, 80),
      optionalText(body.app_version, 80),
      timestamp,
      timestamp,
      activationId,
    ).run();
  } else {
    await env.LICENSE_DB.prepare(
      `INSERT INTO license_activations
       (id, license_id, device_hash, device_name, platform, app_version, first_seen_at, last_seen_at, deactivated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`
    ).bind(
      activationId,
      license.id,
      deviceHash,
      optionalText(body.device_name, 160),
      optionalText(body.platform, 80),
      optionalText(body.app_version, 80),
      timestamp,
      timestamp,
    ).run();
  }

  await audit(env, 'public-api', 'device.activated', 'license', license.id, { activation_id: activationId });
  return json(publicLicenseResult(license, count + 1, activationId));
}

async function publicCheck(request, env) {
  await enforceRateLimit(request, env, 'check', 60, 60);
  const body = await readJson(request);
  const license = await findLicenseByKey(env, body.license_key);
  requireUsableLicense(license);
  const deviceId = validateDeviceId(body.device_id);
  const deviceHash = await hmacHex(env.LICENSE_PEPPER, `device:${deviceId}`);
  const activation = await env.LICENSE_DB.prepare(
    `SELECT * FROM license_activations
     WHERE license_id = ? AND device_hash = ? AND deactivated_at IS NULL`
  ).bind(license.id, deviceHash).first();
  if (!activation) {
    return json({ ok: false, valid: false, error: 'device_not_activated' }, 403);
  }
  await env.LICENSE_DB.prepare(
    `UPDATE license_activations SET device_name = ?, platform = ?, app_version = ?, last_seen_at = ? WHERE id = ?`
  ).bind(
    optionalText(body.device_name, 160) ?? activation.device_name,
    optionalText(body.platform, 80) ?? activation.platform,
    optionalText(body.app_version, 80) ?? activation.app_version,
    nowIso(),
    activation.id,
  ).run();
  return json(publicLicenseResult(license, await activeDeviceCount(env, license.id), activation.id));
}

async function publicDeactivate(request, env) {
  await enforceRateLimit(request, env, 'deactivate', 20, 60);
  const body = await readJson(request);
  const license = await findLicenseByKey(env, body.license_key);
  const deviceId = validateDeviceId(body.device_id);
  const deviceHash = await hmacHex(env.LICENSE_PEPPER, `device:${deviceId}`);
  const result = await env.LICENSE_DB.prepare(
    `UPDATE license_activations SET deactivated_at = ?, last_seen_at = ?
     WHERE license_id = ? AND device_hash = ? AND deactivated_at IS NULL`
  ).bind(nowIso(), nowIso(), license.id, deviceHash).run();
  return json({ ok: true, deactivated: (result.meta.changes || 0) > 0, server_time: nowIso() });
}

async function handleAdminApi(request, env, admin) {
  const url = new URL(request.url);
  const path = url.pathname.slice(`${ADMIN_ROOT}/api`.length) || '/';

  if (path === '/me' && request.method === 'GET') {
    return json({ ok: true, email: admin.email, auth_type: admin.authType, csrf: admin.csrf || null });
  }
  if (path === '/licenses' && request.method === 'GET') return adminListLicenses(request, env);
  if (path === '/licenses' && request.method === 'POST') return adminCreateLicense(request, env, admin.email);
  if (path === '/audit' && request.method === 'GET') return adminAudit(request, env);

  const licenseMatch = path.match(/^\/licenses\/([0-9a-f-]{36})$/i);
  if (licenseMatch && request.method === 'GET') return adminLicenseDetail(env, licenseMatch[1]);
  if (licenseMatch && request.method === 'PATCH') return adminUpdateLicense(request, env, admin.email, licenseMatch[1]);

  const statusMatch = path.match(/^\/licenses\/([0-9a-f-]{36})\/status$/i);
  if (statusMatch && request.method === 'POST') return adminChangeStatus(request, env, admin.email, statusMatch[1]);

  const replacementMatch = path.match(/^\/licenses\/([0-9a-f-]{36})\/replacement$/i);
  if (replacementMatch && request.method === 'POST') return adminReplacementLicense(request, env, admin.email, replacementMatch[1]);

  const activationMatch = path.match(/^\/activations\/([0-9a-f-]{36})$/i);
  if (activationMatch && request.method === 'DELETE') return adminDeactivateDevice(env, admin.email, activationMatch[1]);

  return json({ ok: false, error: 'not_found' }, 404);
}

async function adminListLicenses(request, env) {
  const url = new URL(request.url);
  const query = optionalText(url.searchParams.get('q'), 100);
  const status = optionalText(url.searchParams.get('status'), 20);
  const clauses = [];
  const bindings = [];
  if (query) {
    clauses.push('(customer_name LIKE ? OR customer_email LIKE ? OR key_last4 LIKE ?)');
    const like = `%${query}%`;
    bindings.push(like, like, like);
  }
  if (['active', 'suspended', 'revoked'].includes(status)) {
    clauses.push('status = ?');
    bindings.push(status);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = await env.LICENSE_DB.prepare(
    `SELECT l.*,
      (SELECT COUNT(*) FROM license_activations a WHERE a.license_id = l.id AND a.deactivated_at IS NULL) AS active_devices
     FROM licenses l ${where}
     ORDER BY l.created_at DESC LIMIT 200`
  ).bind(...bindings).all();
  return json({ ok: true, licenses: (rows.results || []).map(safeLicense) });
}

async function adminCreateLicense(request, env, actorEmail, source = null) {
  const body = source || await readJson(request);
  const customerName = requiredText(body.customer_name, 160, 'customer_name');
  const customerEmail = optionalEmail(body.customer_email);
  const plan = validatePlan(body.plan);
  const maxDevices = integerInRange(body.max_devices, 1, 50, 'max_devices');
  const expiresAt = validateExpiry(body.expires_at);
  const notes = optionalText(body.notes, 2000);
  const id = crypto.randomUUID();
  const key = generateLicenseKey(plan);
  const keyHash = await hmacHex(env.LICENSE_PEPPER, `license:${normaliseLicenseKey(key)}`);
  const timestamp = nowIso();
  await env.LICENSE_DB.prepare(
    `INSERT INTO licenses
     (id, key_hash, key_last4, customer_name, customer_email, plan, max_devices, status,
      issued_at, expires_at, notes, created_by, created_at, updated_at, revoked_at, revoke_reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, NULL, NULL)`
  ).bind(
    id, keyHash, key.slice(-4), customerName, customerEmail, plan, maxDevices,
    timestamp, expiresAt, notes, actorEmail, timestamp, timestamp,
  ).run();
  await audit(env, actorEmail, 'license.created', 'license', id, { plan, max_devices: maxDevices, expires_at: expiresAt });
  return json({ ok: true, license: { ...(await getLicense(env, id)), license_key: key } }, 201);
}

async function adminLicenseDetail(env, id) {
  const license = await getLicense(env, id);
  if (!license) return json({ ok: false, error: 'license_not_found' }, 404);
  const activations = await env.LICENSE_DB.prepare(
    `SELECT id, device_name, platform, app_version, first_seen_at, last_seen_at, deactivated_at
     FROM license_activations WHERE license_id = ? ORDER BY last_seen_at DESC`
  ).bind(id).all();
  return json({ ok: true, license: safeLicense(license), activations: activations.results || [] });
}

async function adminUpdateLicense(request, env, actorEmail, id) {
  const license = await getLicense(env, id);
  if (!license) return json({ ok: false, error: 'license_not_found' }, 404);
  const body = await readJson(request);
  const customerName = body.customer_name === undefined ? license.customer_name : requiredText(body.customer_name, 160, 'customer_name');
  const customerEmail = body.customer_email === undefined ? license.customer_email : optionalEmail(body.customer_email);
  const maxDevices = body.max_devices === undefined ? license.max_devices : integerInRange(body.max_devices, 1, 50, 'max_devices');
  const expiresAt = body.expires_at === undefined ? license.expires_at : validateExpiry(body.expires_at);
  const notes = body.notes === undefined ? license.notes : optionalText(body.notes, 2000);
  await env.LICENSE_DB.prepare(
    `UPDATE licenses SET customer_name = ?, customer_email = ?, max_devices = ?, expires_at = ?, notes = ?, updated_at = ? WHERE id = ?`
  ).bind(customerName, customerEmail, maxDevices, expiresAt, notes, nowIso(), id).run();
  await audit(env, actorEmail, 'license.updated', 'license', id, { customer_name: customerName, customer_email: customerEmail, max_devices: maxDevices, expires_at: expiresAt });
  return json({ ok: true, license: safeLicense(await getLicense(env, id)) });
}

async function adminChangeStatus(request, env, actorEmail, id) {
  const body = await readJson(request);
  const status = String(body.status || '').trim();
  if (!['active', 'suspended', 'revoked'].includes(status)) return json({ ok: false, error: 'invalid_status' }, 400);
  const license = await getLicense(env, id);
  if (!license) return json({ ok: false, error: 'license_not_found' }, 404);
  const reason = optionalText(body.reason, 500);
  if (status === 'revoked' && !reason) return json({ ok: false, error: 'revocation_reason_required' }, 400);
  await env.LICENSE_DB.prepare(
    `UPDATE licenses SET status = ?, updated_at = ?, revoked_at = ?, revoke_reason = ? WHERE id = ?`
  ).bind(status, nowIso(), status === 'revoked' ? nowIso() : null, status === 'revoked' ? reason : null, id).run();
  await audit(env, actorEmail, `license.${status}`, 'license', id, { reason });
  return json({ ok: true, license: safeLicense(await getLicense(env, id)) });
}

async function adminReplacementLicense(request, env, actorEmail, id) {
  const old = await getLicense(env, id);
  if (!old) return json({ ok: false, error: 'license_not_found' }, 404);
  const body = await readJson(request);
  const reason = requiredText(body.reason, 500, 'reason');
  await env.LICENSE_DB.prepare(
    `UPDATE licenses SET status = 'revoked', revoked_at = ?, revoke_reason = ?, updated_at = ? WHERE id = ?`
  ).bind(nowIso(), `Helyettesítve: ${reason}`, nowIso(), id).run();
  const response = await adminCreateLicense(request, env, actorEmail, {
    customer_name: old.customer_name,
    customer_email: old.customer_email,
    plan: old.plan,
    max_devices: old.max_devices,
    expires_at: old.expires_at,
    notes: `Helyettesítő licenc a következőhöz: ${old.key_last4}. ${old.notes || ''}`.trim(),
  });
  await audit(env, actorEmail, 'license.replaced', 'license', id, { reason });
  return response;
}

async function adminDeactivateDevice(env, actorEmail, activationId) {
  const result = await env.LICENSE_DB.prepare(
    `UPDATE license_activations SET deactivated_at = ?, last_seen_at = ? WHERE id = ? AND deactivated_at IS NULL`
  ).bind(nowIso(), nowIso(), activationId).run();
  await audit(env, actorEmail, 'device.deactivated', 'activation', activationId, {});
  return json({ ok: true, deactivated: (result.meta.changes || 0) > 0 });
}

async function adminAudit(request, env) {
  const rows = await env.LICENSE_DB.prepare(
    `SELECT id, actor_email, action, entity_type, entity_id, details_json, created_at
     FROM license_audit ORDER BY created_at DESC LIMIT 100`
  ).all();
  return json({ ok: true, entries: rows.results || [] });
}

async function serveAdminAsset(request, env, relative) {
  const assetPath = relative === '/' ? '/fx-owner-license/index.html' : `/fx-owner-license${relative}`;
  const assetUrl = new URL(assetPath, request.url);
  const response = await env.ASSETS.fetch(new Request(assetUrl, { method: 'GET', headers: request.headers }));
  if (!response.ok) return response;
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'");
  return new Response(response.body, { status: response.status, headers });
}

async function authenticateAdmin(request, env) {
  const access = await authenticateAccess(request, env);
  if (access.ok) return access;
  const session = await readPasswordSession(request, env);
  if (session) return { ok: true, email: session.email, authType: 'password', csrf: session.csrf };
  if (request.headers.get('Accept')?.includes('text/html')) {
    return { ok: false, response: Response.redirect(new URL(`${ADMIN_ROOT}/login`, request.url).toString(), 302) };
  }
  return { ok: false, response: json({ ok: false, error: 'admin_auth_required' }, 401) };
}

async function authenticateAccess(request, env) {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.ADMIN_EMAILS) return { ok: false };
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return { ok: false };
  try {
    const payload = await verifyAccessJwt(token, env.ACCESS_TEAM_DOMAIN, env.ACCESS_AUD);
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    if (!email || !adminEmails(env).has(email)) return { ok: false };
    return { ok: true, email, authType: 'cloudflare-access', csrf: null };
  } catch (error) {
    console.warn('FormatX Access validation failed', error instanceof Error ? error.message : String(error));
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
  const cryptoKey = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, base64UrlDecode(parts[2]), textEncoder.encode(`${parts[0]}.${parts[1]}`));
  if (!valid) throw new Error('signature_invalid');
  return payload;
}

async function getAccessJwks(url) {
  if (accessJwksCache.url === url && accessJwksCache.expiresAt > Date.now()) return accessJwksCache.keys;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`jwks_${response.status}`);
  const payload = await response.json();
  const keys = Array.isArray(payload.keys) ? payload.keys : [];
  accessJwksCache = { url, expiresAt: Date.now() + 5 * 60 * 1000, keys };
  return keys;
}

async function handlePasswordLogin(request, env) {
  if (request.method === 'GET') return loginPage();
  if (request.method !== 'POST') return new Response(null, { status: 405 });
  if (!env.ADMIN_PASSWORD_RECORD || !env.ADMIN_SESSION_SECRET || !env.ADMIN_EMAILS) {
    return loginPage('A jelszavas belépés nincs konfigurálva.', 503);
  }
  await enforceRateLimit(request, env, 'admin-login', 10, 600);
  const form = await request.formData();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  const valid = adminEmails(env).has(email) && await verifyPassword(password, env.ADMIN_PASSWORD_RECORD);
  if (!valid) return loginPage('Hibás e-mail-cím vagy jelszó.', 401);
  const csrf = base64UrlEncode(crypto.getRandomValues(new Uint8Array(24)));
  const session = await createPasswordSession(email, csrf, env.ADMIN_SESSION_SECRET);
  const headers = new Headers({ Location: `${ADMIN_ROOT}/`, 'Cache-Control': 'no-store' });
  headers.append('Set-Cookie', `${SESSION_COOKIE}=${session}; Path=${ADMIN_ROOT}/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Strict`);
  return new Response(null, { status: 303, headers });
}

function loginPage(message = '', status = 200) {
  const notice = message ? `<p class="error">${escapeHtml(message)}</p>` : '';
  return new Response(`<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>FormatX tulajdonosi belépés</title><style>:root{color-scheme:dark;font-family:Inter,system-ui,sans-serif}*{box-sizing:border-box}body{min-height:100vh;margin:0;display:grid;place-items:center;background:radial-gradient(circle at 20% 0%,#0b3947 0,transparent 32rem),#05090d;color:#e9fbff}.card{width:min(430px,calc(100% - 2rem));padding:1.5rem;border:1px solid rgba(69,229,255,.35);border-radius:18px;background:linear-gradient(145deg,rgba(9,18,24,.98),rgba(13,29,37,.98));box-shadow:0 25px 70px #0009}.eyebrow{margin:0 0 .35rem;color:#45e5ff;font-size:.72rem;font-weight:800;letter-spacing:.18em}h1{margin:.2rem 0 1.2rem;font-size:1.55rem}label{display:grid;gap:.4rem;margin:.8rem 0;color:#8caab4;font-size:.82rem;font-weight:700}input{width:100%;padding:.78rem;border:1px solid #29414a;border-radius:9px;background:#03090c;color:#e9fbff;font:inherit}button{width:100%;margin-top:.8rem;padding:.8rem;border:1px solid #45e5ff;border-radius:9px;background:linear-gradient(135deg,#17434d,#153d35);color:#e9fbff;font-weight:800;cursor:pointer}.hint{margin:1rem 0 0;color:#8caab4;font-size:.76rem}.error{padding:.75rem;border:1px solid #ff6f91;border-radius:9px;background:#2a1018;color:#ffd4df;font-size:.82rem}</style></head><body><main class="card"><p class="eyebrow">FORMATX SUITE PRO</p><h1>Tulajdonosi licenckezelő</h1>${notice}<form method="post" action="${ADMIN_ROOT}/login" autocomplete="off"><label>Admin e-mail-cím<input name="email" type="email" maxlength="254" required autocomplete="username"></label><label>Admin jelszó<input name="password" type="password" minlength="12" maxlength="200" required autocomplete="current-password"></label><button type="submit">Biztonságos belépés</button></form><p class="hint">Cloudflare Access beállításakor az egyszer használatos e-mail-kódos belépés automatikusan elsődleges lesz.</p></main></body></html>`, { status, headers: secureHtmlHeaders() });
}

function logoutResponse(request) {
  const headers = new Headers({ Location: `${ADMIN_ROOT}/login`, 'Cache-Control': 'no-store' });
  headers.append('Set-Cookie', `${SESSION_COOKIE}=; Path=${ADMIN_ROOT}/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`);
  return new Response(null, { status: 303, headers });
}

async function createPasswordSession(email, csrf, secret) {
  const payload = base64UrlEncode(textEncoder.encode(JSON.stringify({ email, csrf, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })));
  return `${payload}.${base64UrlEncode(await hmacBytes(secret, payload))}`;
}

async function readPasswordSession(request, env) {
  if (!env.ADMIN_SESSION_SECRET) return null;
  const raw = readCookie(request, SESSION_COOKIE);
  if (!raw) return null;
  const [payloadRaw, signatureRaw] = raw.split('.');
  if (!payloadRaw || !signatureRaw) return null;
  const expected = await hmacBytes(env.ADMIN_SESSION_SECRET, payloadRaw);
  if (!constantTimeBytesEqual(expected, base64UrlDecode(signatureRaw))) return null;
  try {
    const payload = JSON.parse(textDecoder.decode(base64UrlDecode(payloadRaw)));
    if (!payload.email || !payload.csrf || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    const email = String(payload.email).toLowerCase();
    if (!adminEmails(env).has(email)) return null;
    return { email, csrf: String(payload.csrf) };
  } catch {
    return null;
  }
}

async function verifyPassword(password, record) {
  const [version, iterationsRaw, saltRaw, expectedRaw] = String(record || '').split(':');
  const iterations = Number.parseInt(iterationsRaw || '', 10);
  if (version !== 'v1' || iterations < 200000 || !saltRaw || !expectedRaw) return false;
  const salt = base64UrlDecode(saltRaw);
  const expected = base64UrlDecode(expectedRaw);
  const material = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, material, expected.length * 8));
  return constantTimeBytesEqual(derived, expected);
}

async function findLicenseByKey(env, rawKey) {
  const key = normaliseLicenseKey(requiredText(rawKey, 100, 'license_key'));
  const hash = await hmacHex(env.LICENSE_PEPPER, `license:${key}`);
  const license = await env.LICENSE_DB.prepare('SELECT * FROM licenses WHERE key_hash = ?').bind(hash).first();
  if (!license) throw new PublicError(404, 'license_not_found');
  return license;
}

function requireUsableLicense(license) {
  if (license.status === 'revoked') throw new PublicError(403, 'license_revoked');
  if (license.status === 'suspended') throw new PublicError(403, 'license_suspended');
  if (license.expires_at && Date.parse(license.expires_at) <= Date.now()) throw new PublicError(403, 'license_expired');
}

function publicLicenseResult(license, devicesUsed, activationId) {
  return {
    ok: true,
    valid: true,
    license_id: license.id,
    plan: license.plan,
    status: license.status,
    devices_used: devicesUsed,
    devices_allowed: license.max_devices,
    expires_at: license.expires_at,
    activation_id: activationId,
    next_check_after: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    server_time: nowIso(),
  };
}

async function activeDeviceCount(env, licenseId) {
  const row = await env.LICENSE_DB.prepare(
    'SELECT COUNT(*) AS count FROM license_activations WHERE license_id = ? AND deactivated_at IS NULL'
  ).bind(licenseId).first();
  return Number(row?.count || 0);
}

async function getLicense(env, id) {
  return env.LICENSE_DB.prepare('SELECT * FROM licenses WHERE id = ?').bind(id).first();
}

function safeLicense(license) {
  if (!license) return null;
  const { key_hash: ignored, ...safe } = license;
  return safe;
}

async function audit(env, actorEmail, action, entityType, entityId, details) {
  await env.LICENSE_DB.prepare(
    `INSERT INTO license_audit (id, actor_email, action, entity_type, entity_id, details_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(crypto.randomUUID(), actorEmail, action, entityType, entityId, JSON.stringify(details || {}), nowIso()).run();
}

async function enforceRateLimit(request, env, scope, limit, periodSeconds) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const hashedIp = await hmacHex(env.LICENSE_PEPPER, `rate:${scope}:${ip}`);
  const bucket = Math.floor(Date.now() / 1000 / periodSeconds);
  await env.LICENSE_DB.prepare(
    `INSERT INTO license_rate_limits (scope, bucket, count, updated_at) VALUES (?, ?, 1, ?)
     ON CONFLICT(scope, bucket) DO UPDATE SET count = count + 1, updated_at = excluded.updated_at`
  ).bind(hashedIp, bucket, nowIso()).run();
  const row = await env.LICENSE_DB.prepare('SELECT count FROM license_rate_limits WHERE scope = ? AND bucket = ?').bind(hashedIp, bucket).first();
  if (Number(row?.count || 0) > limit) throw new PublicError(429, 'rate_limited');
}

async function readJson(request) {
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > 32 * 1024) throw new PublicError(413, 'request_too_large');
  try {
    const payload = await request.json();
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('invalid');
    return payload;
  } catch {
    throw new PublicError(400, 'invalid_json');
  }
}

function generateLicenseKey(plan) {
  const prefix = plan === 'owner' ? 'FXO' : plan === 'trial' ? 'FXT' : 'FXP';
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const chars = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
  return `${prefix}-${chars.match(/.{1,4}/g).join('-')}`;
}

function normaliseLicenseKey(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
}

function validateDeviceId(value) {
  const device = requiredText(value, 300, 'device_id');
  if (device.length < 8) throw new PublicError(400, 'device_id_too_short');
  return device;
}

function validatePlan(value) {
  const plan = String(value || 'pro').trim().toLowerCase();
  if (!['trial', 'pro', 'technician', 'business', 'lifetime', 'owner'].includes(plan)) throw new PublicError(400, 'invalid_plan');
  return plan;
}

function validateExpiry(value) {
  if (value === null || value === undefined || value === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new PublicError(400, 'invalid_expiry');
  return date.toISOString();
}

function requiredText(value, max, field) {
  const text = String(value || '').trim();
  if (!text) throw new PublicError(400, `${field}_required`);
  if (text.length > max) throw new PublicError(400, `${field}_too_long`);
  return text;
}

function optionalText(value, max) {
  if (value === null || value === undefined || value === '') return null;
  const text = String(value).trim();
  if (!text) return null;
  if (text.length > max) throw new PublicError(400, 'value_too_long');
  return text;
}

function optionalEmail(value) {
  const email = optionalText(value, 254);
  if (!email) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new PublicError(400, 'invalid_email');
  return email.toLowerCase();
}

function integerInRange(value, min, max, field) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) throw new PublicError(400, `invalid_${field}`);
  return number;
}

function adminEmails(env) {
  return new Set(String(env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean));
}

function readCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  for (const part of cookie.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

async function hmacHex(secret, value) {
  const bytes = await hmacBytes(secret, value);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hmacBytes(secret, value) {
  if (!secret || String(secret).length < 32) throw new Error('LICENSE_PEPPER or session secret is missing/short');
  const key = await crypto.subtle.importKey('raw', textEncoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, textEncoder.encode(value)));
}

function base64UrlEncode(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function base64UrlDecode(value) {
  const padded = String(value).replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(String(value).length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function constantTimeBytesEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

function constantTimeStringEqual(left, right) {
  return constantTimeBytesEqual(textEncoder.encode(String(left)), textEncoder.encode(String(right)));
}

function secureHtmlHeaders() {
  return {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
  };
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex',
    },
  });
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function nowIso() {
  return new Date().toISOString();
}

class PublicError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export function licenseErrorResponse(error) {
  if (error instanceof PublicError) return json({ ok: false, valid: false, error: error.code }, error.status);
  return null;
}
