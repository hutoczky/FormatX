const textEncoder = new TextEncoder();
const SIGNED_API_SCHEMA = 1;
const CHECK_INTERVAL_SECONDS = 8 * 60 * 60;
const OFFLINE_GRACE_SECONDS = 3 * 24 * 60 * 60;

export function signedClientApiConfigured(env) {
  return Boolean(
    String(env.FORMATX_ISSUER_PRIVATE_KEY || '').trim()
    && String(env.FORMATX_ISSUER_KEY_ID || '').trim()
    && String(env.LICENSE_PEPPER || '').length >= 32
  );
}

export function signedClientApiCapabilities(env) {
  return {
    signed_client_api: signedClientApiConfigured(env),
    signed_client_api_schema: SIGNED_API_SCHEMA,
    signature_algorithm: 'Ed25519',
    issuer_key_id: String(env.FORMATX_ISSUER_KEY_ID || '').trim() || null,
  };
}

export function isSignedClientRequest(body) {
  return Boolean(
    body
    && typeof body === 'object'
    && (
      Object.hasOwn(body, 'request_nonce')
      || Object.hasOwn(body, 'device_hash')
      || Object.hasOwn(body, 'activation_token')
    )
  );
}

export async function handleSignedClientRequest(operation, request, body, env) {
  if (!signedClientApiConfigured(env)) {
    return json({ ok: false, error: 'signed_license_api_unavailable' }, 503);
  }

  let nonce = '';
  try {
    nonce = requireNonce(body.request_nonce);
    validateTimestamp(body.timestamp);
    const platform = requirePlatform(body.platform);
    const architecture = requireArchitecture(body.architecture);
    const deviceHash = requireDeviceHash(body.device_hash);
    if (!(await consumeNonce(env, operation, nonce))) {
      return signedStatusResponse(
        errorStatus('invalid_request', 'request_replay_detected', nonce, env),
        env,
        409,
      );
    }

    if (operation === 'activate') {
      return activateSigned(request, body, env, nonce, deviceHash, platform, architecture);
    }
    if (operation === 'check') {
      return checkSigned(request, body, env, nonce, deviceHash, platform, architecture);
    }
    if (operation === 'deactivate') {
      return deactivateSigned(request, body, env, nonce, deviceHash, platform, architecture);
    }
    return signedStatusResponse(errorStatus('not_found', 'route_not_found', nonce, env), env, 404);
  } catch (error) {
    const code = error instanceof SignedProtocolError ? error.code : 'license_service_unavailable';
    const status = error instanceof SignedProtocolError ? error.status : 503;
    if (nonce && signedClientApiConfigured(env)) {
      return signedStatusResponse(errorStatus('invalid_request', code, nonce, env), env, status);
    }
    return json({ ok: false, error: code }, status);
  }
}

export async function handleSignedRevocations(env) {
  if (!signedClientApiConfigured(env)) {
    return json({ ok: false, error: 'signed_license_api_unavailable' }, 503);
  }
  const now = new Date();
  const rows = await env.LICENSE_DB.prepare(
    `SELECT id, revoked_at
     FROM licenses
     WHERE status = 'revoked'
     ORDER BY revoked_at DESC`
  ).all();
  const issuerKeyId = String(env.FORMATX_ISSUER_KEY_ID).trim();
  const revocations = await Promise.all((rows.results || []).map(async (license) => ({
    license_id_hash: await sha256Hex(`formatx-license-id-v1:${license.id}`),
    status: 'revoked',
    reason_code: 'admin_revoked',
    issuer_key_id: issuerKeyId,
    revoked_at: license.revoked_at || now.toISOString(),
  })));
  const payload = {
    schema_version: SIGNED_API_SCHEMA,
    generated_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    issuer_key_id: issuerKeyId,
    revocations,
  };
  return json(await signEnvelope(payload, env), 200, 'public, max-age=300');
}

async function activateSigned(request, body, env, nonce, deviceHash, platform, architecture) {
  const rawKey = requiredText(body.license_key, 100, 'license_key');
  const license = await findLicenseByKey(env, rawKey);
  if (!license) {
    return signedStatusResponse(errorStatus('not_found', 'license_not_found', nonce, env), env, 401);
  }

  const status = effectiveLicenseStatus(license);
  if (status !== 'active') {
    await audit(env, 'public-api', 'device.activation_rejected', license.id, { status });
    return signedStatusResponse(statusForLicense(license, status, 0, nonce, env), env, 403);
  }

  const storedDeviceHash = await hmacHex(env.LICENSE_PEPPER, `device:${deviceHash}`);
  const existing = await env.LICENSE_DB.prepare(
    `SELECT * FROM license_activations
     WHERE license_id = ? AND device_hash = ?`
  ).bind(license.id, storedDeviceHash).first();
  const now = new Date().toISOString();

  if (existing && !existing.deactivated_at) {
    await env.LICENSE_DB.prepare(
      `UPDATE license_activations
       SET platform = ?, app_version = ?, last_seen_at = ?
       WHERE id = ?`
    ).bind(platform, optionalText(body.app_version, 80) ?? existing.app_version, now, existing.id).run();
    const devicesUsed = await activeDeviceCount(env, license.id);
    const activationToken = await activationTokenFor(env, license.id, existing.id, storedDeviceHash);
    return signedStatusResponse(
      statusForLicense(license, 'active', devicesUsed, nonce, env, activationToken),
      env,
    );
  }

  const devicesUsed = await activeDeviceCount(env, license.id);
  if (devicesUsed >= Number(license.max_devices)) {
    return signedStatusResponse(
      statusForLicense(license, 'device_limit_reached', devicesUsed, nonce, env),
      env,
      409,
    );
  }

  const activationId = existing?.id || crypto.randomUUID();
  if (existing) {
    await env.LICENSE_DB.prepare(
      `UPDATE license_activations
       SET device_name = ?, platform = ?, app_version = ?, first_seen_at = ?,
           last_seen_at = ?, deactivated_at = NULL
       WHERE id = ?`
    ).bind(
      optionalText(body.device_name, 160),
      platform,
      optionalText(body.app_version, 80),
      now,
      now,
      activationId,
    ).run();
  } else {
    await env.LICENSE_DB.prepare(
      `INSERT INTO license_activations
       (id, license_id, device_hash, device_name, platform, app_version,
        first_seen_at, last_seen_at, deactivated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`
    ).bind(
      activationId,
      license.id,
      storedDeviceHash,
      optionalText(body.device_name, 160),
      platform,
      optionalText(body.app_version, 80),
      now,
      now,
    ).run();
  }
  await audit(env, 'public-api', 'device.activated', license.id, {
    activation_id: activationId,
    protocol: 'signed-v1',
    platform,
    architecture,
  });
  const activationToken = await activationTokenFor(env, license.id, activationId, storedDeviceHash);
  return signedStatusResponse(
    statusForLicense(license, 'active', devicesUsed + 1, nonce, env, activationToken),
    env,
  );
}

async function checkSigned(request, body, env, nonce, deviceHash, platform, architecture) {
  const context = await authenticatedActivation(body, env, deviceHash);
  if (!context) {
    return signedStatusResponse(errorStatus('not_found', 'license_credentials_invalid', nonce, env), env, 401);
  }
  const { license, activation } = context;
  const now = new Date().toISOString();
  await env.LICENSE_DB.prepare(
    `UPDATE license_activations
     SET platform = ?, app_version = ?, last_seen_at = ?
     WHERE id = ?`
  ).bind(platform, optionalText(body.app_version, 80) ?? activation.app_version, now, activation.id).run();
  const status = effectiveLicenseStatus(license);
  const devicesUsed = await activeDeviceCount(env, license.id);
  await audit(env, 'public-api', 'device.checked', license.id, {
    activation_id: activation.id,
    status,
    protocol: 'signed-v1',
    platform,
    architecture,
  });
  return signedStatusResponse(
    statusForLicense(license, status, devicesUsed, nonce, env),
    env,
    status === 'active' ? 200 : 403,
  );
}

async function deactivateSigned(request, body, env, nonce, deviceHash, platform, architecture) {
  const context = await authenticatedActivation(body, env, deviceHash);
  if (!context) {
    return signedStatusResponse(errorStatus('not_found', 'license_credentials_invalid', nonce, env), env, 401);
  }
  const { license, activation } = context;
  const now = new Date().toISOString();
  await env.LICENSE_DB.prepare(
    `UPDATE license_activations
     SET deactivated_at = ?, last_seen_at = ?
     WHERE id = ? AND deactivated_at IS NULL`
  ).bind(now, now, activation.id).run();
  await audit(env, 'public-api', 'device.deactivated', license.id, {
    activation_id: activation.id,
    protocol: 'signed-v1',
    platform,
    architecture,
  });
  const devicesUsed = await activeDeviceCount(env, license.id);
  const payload = statusForLicense(license, effectiveLicenseStatus(license), devicesUsed, nonce, env);
  payload.device_accepted = false;
  return signedStatusResponse(payload, env);
}

async function authenticatedActivation(body, env, deviceHash) {
  const licenseId = requiredText(body.license_id, 80, 'license_id');
  const token = requiredText(body.activation_token, 200, 'activation_token');
  const license = await env.LICENSE_DB.prepare('SELECT * FROM licenses WHERE id = ?').bind(licenseId).first();
  if (!license) return null;
  const storedDeviceHash = await hmacHex(env.LICENSE_PEPPER, `device:${deviceHash}`);
  const activation = await env.LICENSE_DB.prepare(
    `SELECT * FROM license_activations
     WHERE license_id = ? AND device_hash = ? AND deactivated_at IS NULL`
  ).bind(license.id, storedDeviceHash).first();
  if (!activation) return null;
  const expected = await activationTokenFor(env, license.id, activation.id, storedDeviceHash);
  if (!constantTimeStringEqual(token, expected)) return null;
  return { license, activation };
}

function statusForLicense(license, status, devicesUsed, nonce, env, activationToken = null) {
  const now = new Date();
  const payload = {
    ok: status === 'active',
    status,
    error_code: status === 'active' ? null : errorCodeForStatus(status),
    message: publicMessageForStatus(status),
    license_type: licenseTypeForPlan(license.plan),
    package: licenseTypeForPlan(license.plan),
    features: featuresForPlan(license.plan),
    valid_until: license.expires_at || null,
    max_devices: Number(license.max_devices),
    devices_used: Number(devicesUsed),
    device_accepted: status === 'active',
    server_time: now.toISOString(),
    offline_grace_until: new Date(now.getTime() + OFFLINE_GRACE_SECONDS * 1000).toISOString(),
    next_check_after: new Date(now.getTime() + CHECK_INTERVAL_SECONDS * 1000).toISOString(),
    response_nonce: nonce,
    issuer_key_id: String(env.FORMATX_ISSUER_KEY_ID).trim(),
    license_id: license.id,
    activation_token: activationToken,
    public_reason: publicReasonForStatus(status),
    status_changed_at: license.revoked_at || license.updated_at || license.issued_at,
  };
  return payload;
}

function errorStatus(status, errorCode, nonce, env) {
  const now = new Date();
  return {
    ok: false,
    status,
    error_code: errorCode,
    message: publicMessageForStatus(status),
    device_accepted: false,
    devices_used: 0,
    max_devices: 0,
    valid_until: null,
    server_time: now.toISOString(),
    offline_grace_until: null,
    next_check_after: new Date(now.getTime() + CHECK_INTERVAL_SECONDS * 1000).toISOString(),
    response_nonce: nonce,
    issuer_key_id: String(env.FORMATX_ISSUER_KEY_ID || '').trim(),
  };
}

function effectiveLicenseStatus(license) {
  if (license.status === 'revoked') return 'revoked';
  if (license.status === 'suspended') return 'suspended';
  if (license.expires_at && Date.parse(license.expires_at) <= Date.now()) return 'expired';
  return 'active';
}

function licenseTypeForPlan(plan) {
  switch (String(plan || '').toLowerCase()) {
    case 'trial': return 'trial';
    case 'business': return 'business_lite';
    case 'technician': return 'technician_team';
    case 'owner': return 'owner_master';
    case 'pro':
    case 'lifetime':
    default:
      return 'business_pro';
  }
}

function featuresForPlan(plan) {
  switch (String(plan || '').toLowerCase()) {
    case 'trial':
      return ['basic', 'trial_pro'];
    case 'business':
      return ['basic', 'portable_installer', 'reports_export'];
    case 'technician':
      return ['all_pro', 'team'];
    case 'owner':
      return ['all'];
    case 'pro':
    case 'lifetime':
    default:
      return ['basic', 'portable_installer', 'advanced_diagnostics', 'reports_export', 'partition_tools'];
  }
}

function errorCodeForStatus(status) {
  switch (status) {
    case 'revoked': return 'license_revoked';
    case 'suspended': return 'license_suspended';
    case 'expired': return 'license_expired';
    case 'device_limit_reached': return 'max_devices_reached';
    case 'not_found': return 'license_not_found';
    default: return 'online_license_not_active';
  }
}

function publicMessageForStatus(status) {
  switch (status) {
    case 'active': return 'A licenc aktív.';
    case 'revoked': return 'Ezt a FormatX licencet a kibocsátó visszavonta.';
    case 'suspended': return 'A licenc ideiglenesen fel van függesztve.';
    case 'expired': return 'A licenc lejárt.';
    case 'device_limit_reached': return 'A licenchez tartozó géplimit elérve.';
    default: return 'A licenc nem található vagy nem használható.';
  }
}

function publicReasonForStatus(status) {
  if (status === 'revoked') return 'admin_revoked';
  if (status === 'suspended') return 'temporarily_suspended';
  if (status === 'expired') return 'expired';
  return null;
}

async function findLicenseByKey(env, rawKey) {
  const key = normaliseLicenseKey(rawKey);
  const hash = await hmacHex(env.LICENSE_PEPPER, `license:${key}`);
  return env.LICENSE_DB.prepare('SELECT * FROM licenses WHERE key_hash = ?').bind(hash).first();
}

async function activeDeviceCount(env, licenseId) {
  const row = await env.LICENSE_DB.prepare(
    'SELECT COUNT(*) AS count FROM license_activations WHERE license_id = ? AND deactivated_at IS NULL'
  ).bind(licenseId).first();
  return Number(row?.count || 0);
}

async function activationTokenFor(env, licenseId, activationId, deviceHash) {
  const bytes = await hmacBytes(
    env.LICENSE_PEPPER,
    `formatx-activation-token-v1:${licenseId}:${activationId}:${deviceHash}`,
  );
  return base64UrlEncode(bytes);
}

async function consumeNonce(env, scope, nonce) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
  const nonceHash = await sha256Hex(`formatx-license-api-nonce-v1:${scope}:${nonce}`);
  await env.LICENSE_DB.prepare('DELETE FROM license_api_nonces WHERE expires_at <= ?')
    .bind(now.toISOString()).run();
  const result = await env.LICENSE_DB.prepare(
    `INSERT OR IGNORE INTO license_api_nonces
     (nonce_hash, scope, expires_at, created_at)
     VALUES (?, ?, ?, ?)`
  ).bind(nonceHash, scope, expiresAt, now.toISOString()).run();
  return Number(result.meta?.changes || 0) === 1;
}

async function audit(env, actorEmail, action, licenseId, details) {
  await env.LICENSE_DB.prepare(
    `INSERT INTO license_audit
     (id, actor_email, action, entity_type, entity_id, details_json, created_at)
     VALUES (?, ?, ?, 'license', ?, ?, ?)`
  ).bind(
    crypto.randomUUID(),
    actorEmail,
    action,
    licenseId,
    JSON.stringify(details || {}),
    new Date().toISOString(),
  ).run();
}

async function signedStatusResponse(payload, env, status = 200) {
  return json(await signEnvelope(payload, env), status);
}

async function signEnvelope(payload, env) {
  const privateKey = String(env.FORMATX_ISSUER_PRIVATE_KEY || '').trim();
  const issuerKeyId = String(env.FORMATX_ISSUER_KEY_ID || '').trim();
  if (!privateKey || !issuerKeyId) throw new Error('issuer_signing_key_not_configured');
  const canonical = canonicalJson(payload);
  const payloadBytes = textEncoder.encode(canonical);
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemOrBase64ToArrayBuffer(privateKey, 'PRIVATE KEY'),
    { name: 'Ed25519' },
    false,
    ['sign'],
  );
  const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', key, payloadBytes));
  return {
    schema_version: SIGNED_API_SCHEMA,
    canonicalization: 'json-sort-keys-compact-utf8',
    signature_algorithm: 'Ed25519',
    issuer_key_id: issuerKeyId,
    payload_base64: bytesToBase64(payloadBytes),
    payload_hash: await sha256Hex(payloadBytes),
    signature: bytesToBase64(signature),
    payload,
  };
}

function canonicalJson(value) {
  return JSON.stringify(sortJson(value));
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value !== null && typeof value === 'object') {
    const result = {};
    for (const key of Object.keys(value).sort()) {
      if (value[key] !== undefined) result[key] = sortJson(value[key]);
    }
    return result;
  }
  return value;
}

async function sha256Hex(value) {
  const bytes = typeof value === 'string' ? textEncoder.encode(value) : value;
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hmacHex(secret, value) {
  const bytes = await hmacBytes(secret, value);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hmacBytes(secret, value) {
  if (!secret || String(secret).length < 32) throw new Error('LICENSE_PEPPER is missing/short');
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, textEncoder.encode(value)));
}

function requireNonce(value) {
  const nonce = String(value || '').trim();
  if (!/^[A-Za-z0-9_-]{16,128}$/u.test(nonce)) throw new SignedProtocolError(400, 'request_nonce_invalid');
  return nonce;
}

function validateTimestamp(value) {
  const timestamp = Date.parse(String(value || ''));
  if (!Number.isFinite(timestamp)) throw new SignedProtocolError(400, 'timestamp_invalid');
  if (Math.abs(Date.now() - timestamp) > 5 * 60 * 1000) {
    throw new SignedProtocolError(401, 'timestamp_outside_window');
  }
}

function requireDeviceHash(value) {
  const hash = String(value || '').trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/u.test(hash)) throw new SignedProtocolError(400, 'device_hash_invalid');
  return hash;
}

function requirePlatform(value) {
  const platform = String(value || '').trim().toLowerCase();
  if (!['linux', 'windows', 'macos'].includes(platform)) {
    throw new SignedProtocolError(400, 'platform_invalid');
  }
  return platform;
}

function requireArchitecture(value) {
  const architecture = String(value || '').trim().toLowerCase();
  if (!/^[a-z0-9_-]{2,32}$/u.test(architecture)) {
    throw new SignedProtocolError(400, 'architecture_invalid');
  }
  return architecture;
}

function requiredText(value, maxLength, field) {
  const text = String(value || '').trim();
  if (!text) throw new SignedProtocolError(400, `${field}_required`);
  if (text.length > maxLength) throw new SignedProtocolError(400, `${field}_too_long`);
  return text;
}

function optionalText(value, maxLength) {
  if (value === null || value === undefined || value === '') return null;
  const text = String(value).trim();
  if (!text) return null;
  if (text.length > maxLength) throw new SignedProtocolError(400, 'value_too_long');
  return text;
}

function normaliseLicenseKey(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/gu, '');
}

function pemOrBase64ToArrayBuffer(value, label) {
  const normalised = String(value)
    .replace(`-----BEGIN ${label}-----`, '')
    .replace(`-----END ${label}-----`, '')
    .replace(/\s+/gu, '');
  return base64ToBytes(normalised).buffer;
}

function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(String(value));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function base64UrlEncode(bytes) {
  return bytesToBase64(bytes).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function constantTimeStringEqual(left, right) {
  const leftBytes = textEncoder.encode(String(left));
  const rightBytes = textEncoder.encode(String(right));
  if (leftBytes.length !== rightBytes.length) return false;
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }
  return difference === 0;
}

function json(payload, status = 200, cacheControl = 'no-store') {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex',
    },
  });
}

class SignedProtocolError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}
