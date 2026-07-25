import { env, SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

const origin = 'https://www.formatxsuite.com';

async function json(response) {
  return response.json();
}

async function ownerSession() {
  const form = new URLSearchParams({
    email: 'owner@example.com',
    password: env.TEST_ADMIN_PASSWORD,
  });
  const response = await SELF.fetch(`${origin}/fx-owner-license/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
    redirect: 'manual',
  });
  expect(response.status).toBe(303);
  const cookie = response.headers.get('Set-Cookie')?.split(';')[0];
  expect(cookie).toContain('fx_owner_session=');

  const meResponse = await SELF.fetch(`${origin}/fx-owner-license/api/me`, {
    headers: { Cookie: cookie },
  });
  expect(meResponse.status).toBe(200);
  const me = await json(meResponse);
  expect(me.email).toBe('owner@example.com');
  expect(me.auth_type).toBe('password');
  expect(me.csrf).toBeTruthy();
  return { cookie, csrf: me.csrf };
}

async function adminRequest(session, path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Cookie', session.cookie);
  headers.set('Origin', origin);
  if (!['GET', 'HEAD'].includes((options.method || 'GET').toUpperCase())) {
    headers.set('X-FormatX-CSRF', session.csrf);
  }
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return SELF.fetch(`${origin}/fx-owner-license/api${path}`, { ...options, headers });
}

async function publicLicenseRequest(path, body) {
  return SELF.fetch(`${origin}/api/license/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function signedPayload(response, expectedNonce = null) {
  const envelope = await json(response);
  expect(envelope.schema_version).toBe(1);
  expect(envelope.canonicalization).toBe('json-sort-keys-compact-utf8');
  expect(envelope.signature_algorithm).toBe('Ed25519');
  expect(envelope.issuer_key_id).toBe(env.FORMATX_ISSUER_KEY_ID);

  const payloadBytes = Uint8Array.from(atob(envelope.payload_base64), (character) => character.charCodeAt(0));
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', payloadBytes));
  const digestHex = Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('');
  expect(digestHex).toBe(envelope.payload_hash);

  const publicKey = await crypto.subtle.importKey(
    'spki',
    pemBytes(env.FORMATX_ISSUER_PUBLIC_KEY, 'PUBLIC KEY'),
    { name: 'Ed25519' },
    false,
    ['verify'],
  );
  const signature = Uint8Array.from(atob(envelope.signature), (character) => character.charCodeAt(0));
  expect(await crypto.subtle.verify('Ed25519', publicKey, signature, payloadBytes)).toBe(true);

  const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
  expect(payload).toEqual(envelope.payload);
  if (expectedNonce) expect(payload.response_nonce).toBe(expectedNonce);
  return payload;
}

function pemBytes(value, label) {
  const base64 = String(value)
    .replace(`-----BEGIN ${label}-----`, '')
    .replace(`-----END ${label}-----`, '')
    .replace(/\s+/gu, '');
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

function signedRequest(nonce, values = {}) {
  return {
    device_hash: 'ab'.repeat(32),
    platform: 'linux',
    architecture: 'x86_64',
    app_version: '0.3.120',
    request_nonce: nonce,
    timestamp: new Date().toISOString(),
    ...values,
  };
}

describe('FormatX complete website license lifecycle', () => {
  it('generates, activates, limits, edits, suspends, replaces and revokes a licence', async () => {
    const session = await ownerSession();

    const createResponse = await adminRequest(session, '/licenses', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: 'Teszt Ügyfél',
        customer_email: 'customer@example.com',
        plan: 'pro',
        max_devices: 1,
        expires_at: '2027-07-23T12:00:00.000Z',
        notes: 'Automatikus D1 integrációs teszt',
      }),
    });
    expect(createResponse.status).toBe(201);
    const created = (await json(createResponse)).license;
    expect(created.license_key).toMatch(/^FXP-(?:[A-Z2-9]{4}-){4}[A-Z2-9]{4}$/);
    expect(created.key_hash).toBeUndefined();
    expect(created.status).toBe('active');

    const requestOne = {
      license_key: created.license_key,
      device_id: 'device-one-stable-test-id',
      device_name: 'Első tesztgép',
      platform: 'linux-x64',
      app_version: '1.0.0-test',
    };
    const activateOne = await publicLicenseRequest('activate', requestOne);
    expect(activateOne.status).toBe(200);
    const activeOne = await json(activateOne);
    expect(activeOne.valid).toBe(true);
    expect(activeOne.max_devices).toBe(1);
    expect(activeOne.active_devices).toBe(1);
    expect(activeOne.devices_allowed).toBe(1);
    expect(activeOne.devices_used).toBe(1);
    expect(activeOne.license_hint).toContain(created.key_last4);

    const checkOne = await publicLicenseRequest('check', requestOne);
    expect(checkOne.status).toBe(200);
    expect((await json(checkOne)).valid).toBe(true);

    const activateSecond = await publicLicenseRequest('activate', {
      ...requestOne,
      device_id: 'device-two-stable-test-id',
      device_name: 'Második tesztgép',
    });
    expect(activateSecond.status).toBe(409);
    expect((await json(activateSecond)).error).toBe('device_limit_reached');

    const editResponse = await adminRequest(session, `/licenses/${created.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ max_devices: 2, notes: 'Két eszközre bővítve' }),
    });
    expect(editResponse.status).toBe(200);
    expect((await json(editResponse)).license.max_devices).toBe(2);

    const activateSecondAfterEdit = await publicLicenseRequest('activate', {
      ...requestOne,
      device_id: 'device-two-stable-test-id',
      device_name: 'Második tesztgép',
    });
    expect(activateSecondAfterEdit.status).toBe(200);
    expect((await json(activateSecondAfterEdit)).active_devices).toBe(2);

    const suspend = await adminRequest(session, `/licenses/${created.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(suspend.status).toBe(200);
    const suspendedCheck = await publicLicenseRequest('check', requestOne);
    expect(suspendedCheck.status).toBe(403);
    expect((await json(suspendedCheck)).error).toBe('license_suspended');

    const reactivate = await adminRequest(session, `/licenses/${created.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: 'active' }),
    });
    expect(reactivate.status).toBe(200);

    const detailResponse = await adminRequest(session, `/licenses/${created.id}`);
    expect(detailResponse.status).toBe(200);
    const detail = await json(detailResponse);
    expect(detail.activations).toHaveLength(2);

    const deactivateDevice = await adminRequest(session, `/activations/${detail.activations[0].id}`, {
      method: 'DELETE',
    });
    expect(deactivateDevice.status).toBe(200);
    expect((await json(deactivateDevice)).deactivated).toBe(true);

    const replacementResponse = await adminRequest(session, `/licenses/${created.id}/replacement`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Tesztelt kulcscsere' }),
    });
    expect(replacementResponse.status).toBe(201);
    const replacement = (await json(replacementResponse)).license;
    expect(replacement.id).not.toBe(created.id);
    expect(replacement.license_key).toMatch(/^FXP-/);

    const oldCheck = await publicLicenseRequest('check', requestOne);
    expect(oldCheck.status).toBe(403);
    expect((await json(oldCheck)).error).toBe('license_revoked');

    const revokeReplacement = await adminRequest(session, `/licenses/${replacement.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: 'revoked', reason: 'Integrációs teszt lezárása' }),
    });
    expect(revokeReplacement.status).toBe(200);
    expect((await json(revokeReplacement)).license.revoke_reason).toBe('Integrációs teszt lezárása');

    const auditResponse = await adminRequest(session, '/audit');
    expect(auditResponse.status).toBe(200);
    const audit = await json(auditResponse);
    const actions = audit.entries.map((entry) => entry.action);
    expect(actions).toContain('license.created');
    expect(actions).toContain('license.suspended');
    expect(actions).toContain('license.replaced');
    expect(actions).toContain('license.revoked');
    expect(actions).toContain('device.deactivated');
  });

  it('rejects admin mutations without CSRF in password-authenticated mode', async () => {
    const session = await ownerSession();
    const response = await SELF.fetch(`${origin}/fx-owner-license/api/licenses`, {
      method: 'POST',
      headers: {
        Cookie: session.cookie,
        Origin: origin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customer_name: 'Tiltott kérés', plan: 'pro', max_devices: 1 }),
    });
    expect(response.status).toBe(403);
    expect((await json(response)).error).toBe('csrf_invalid');
  });

  it('accepts an admin-generated key through the signed FormatX client protocol', async () => {
    const session = await ownerSession();
    const createResponse = await adminRequest(session, '/licenses', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: 'Aláírt kliens teszt',
        customer_email: 'signed-client@example.com',
        plan: 'pro',
        max_devices: 1,
        expires_at: '2027-07-25T12:00:00.000Z',
        notes: 'A /fx-owner-license/ oldalon kiadott kulcs',
      }),
    });
    expect(createResponse.status).toBe(201);
    const created = (await json(createResponse)).license;

    const activateNonce = 'signed-activate-nonce-0001';
    const activate = await publicLicenseRequest('activate', signedRequest(activateNonce, {
      license_key: created.license_key,
    }));
    expect(activate.status).toBe(200);
    const active = await signedPayload(activate, activateNonce);
    expect(active.status).toBe('active');
    expect(active.license_id).toBe(created.id);
    expect(active.license_type).toBe('business_pro');
    expect(active.activation_token).toMatch(/^[A-Za-z0-9_-]{40,}$/u);
    expect(active.features).toContain('advanced_diagnostics');

    const checkNonce = 'signed-check-nonce-0002';
    const check = await publicLicenseRequest('check', signedRequest(checkNonce, {
      license_id: active.license_id,
      activation_token: active.activation_token,
    }));
    expect(check.status).toBe(200);
    expect((await signedPayload(check, checkNonce)).status).toBe('active');

    const replay = await publicLicenseRequest('check', signedRequest(checkNonce, {
      license_id: active.license_id,
      activation_token: active.activation_token,
    }));
    expect(replay.status).toBe(409);
    const replayPayload = await signedPayload(replay, checkNonce);
    expect(replayPayload.status).toBe('invalid_request');
    expect(replayPayload.error_code).toBe('request_replay_detected');

    const suspend = await adminRequest(session, `/licenses/${created.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(suspend.status).toBe(200);
    const suspendedNonce = 'signed-check-nonce-0003';
    const suspended = await publicLicenseRequest('check', signedRequest(suspendedNonce, {
      license_id: active.license_id,
      activation_token: active.activation_token,
    }));
    expect(suspended.status).toBe(403);
    const suspendedPayload = await signedPayload(suspended, suspendedNonce);
    expect(suspendedPayload.status).toBe('suspended');
    expect(suspendedPayload.error_code).toBe('license_suspended');

    const reactivate = await adminRequest(session, `/licenses/${created.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: 'active' }),
    });
    expect(reactivate.status).toBe(200);
    const revoke = await adminRequest(session, `/licenses/${created.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: 'revoked', reason: 'Aláírt visszavonási teszt' }),
    });
    expect(revoke.status).toBe(200);

    const revokedNonce = 'signed-check-nonce-0004';
    const revoked = await publicLicenseRequest('check', signedRequest(revokedNonce, {
      license_id: active.license_id,
      activation_token: active.activation_token,
    }));
    expect(revoked.status).toBe(403);
    const revokedPayload = await signedPayload(revoked, revokedNonce);
    expect(revokedPayload.status).toBe('revoked');
    expect(revokedPayload.error_code).toBe('license_revoked');

    const revocations = await SELF.fetch(`${origin}/api/license/revocations`);
    expect(revocations.status).toBe(200);
    const revocationPayload = await signedPayload(revocations);
    const expectedIdHashBytes = new TextEncoder().encode(`formatx-license-id-v1:${created.id}`);
    const expectedIdHash = Array.from(
      new Uint8Array(await crypto.subtle.digest('SHA-256', expectedIdHashBytes)),
      (byte) => byte.toString(16).padStart(2, '0'),
    ).join('');
    expect(revocationPayload.revocations).toContainEqual(expect.objectContaining({
      license_id_hash: expectedIdHash,
      status: 'revoked',
      reason_code: 'admin_revoked',
    }));
  });

  it('activates every website licence plan through the signed client protocol', async () => {
    const session = await ownerSession();
    const plans = [
      { plan: 'trial', prefix: /^FXT-/u, licenseType: 'trial', feature: 'trial_pro' },
      { plan: 'pro', prefix: /^FXP-/u, licenseType: 'business_pro', feature: 'advanced_diagnostics' },
      { plan: 'owner', prefix: /^FXO-/u, licenseType: 'owner_master', feature: 'all' },
    ];

    for (const [index, testCase] of plans.entries()) {
      const createResponse = await adminRequest(session, '/licenses', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: `Aláírt ${testCase.plan} teszt`,
          customer_email: `${testCase.plan}@example.com`,
          plan: testCase.plan,
          max_devices: 1,
          expires_at: '2027-07-26T12:00:00.000Z',
          notes: 'Webes generálás és FormatX kliensaktiválás regressziós teszt',
        }),
      });
      expect(createResponse.status).toBe(201);
      const created = (await json(createResponse)).license;
      expect(created.license_key).toMatch(testCase.prefix);

      const nonce = `signed-${testCase.plan}-activation-${index + 1}`;
      const activation = await publicLicenseRequest('activate', signedRequest(nonce, {
        license_key: created.license_key,
        device_hash: `${index + 1}`.repeat(64),
      }));
      expect(activation.status).toBe(200);
      const active = await signedPayload(activation, nonce);
      expect(active.status).toBe('active');
      expect(active.license_id).toBe(created.id);
      expect(active.license_type).toBe(testCase.licenseType);
      expect(active.activation_token).toMatch(/^[A-Za-z0-9_-]{40,}$/u);
      expect(active.features).toContain(testCase.feature);
    }
  });
});
