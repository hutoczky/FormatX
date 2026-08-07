import { createHash, generateKeyPairSync, pbkdf2Sync } from 'node:crypto';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

const password = 'FormatX-Test-Owner-Password-2026';
const salt = Buffer.from('formatx-license-test-salt-2026', 'utf8');
const iterations = 200_000;
const derived = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
const base64url = (value) => Buffer.from(value).toString('base64url');
const passwordRecord = `v1:${iterations}:${base64url(salt)}:${base64url(derived)}`;
const issuerKeys = generateKeyPairSync('ed25519');
const issuerPrivateKey = issuerKeys.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const issuerPublicKey = issuerKeys.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const issuerFingerprint = createHash('sha256')
  .update(issuerKeys.publicKey.export({ type: 'spki', format: 'der' }))
  .digest('hex');
const issuerKeyId = `formatx-license-issuer-${issuerFingerprint.slice(0, 16)}`;
const migrations = await readD1Migrations('./license-migrations');

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: {
        configPath: './wrangler.license-test.jsonc',
      },
      miniflare: {
        bindings: {
          TEST_MIGRATIONS: migrations,
          ADMIN_PASSWORD_RECORD: passwordRecord,
          TEST_ADMIN_PASSWORD: password,
          FORMATX_ISSUER_PRIVATE_KEY: issuerPrivateKey,
          FORMATX_ISSUER_PUBLIC_KEY: issuerPublicKey,
          FORMATX_ISSUER_KEY_ID: issuerKeyId,
        },
      },
    }),
  ],
  test: {
    include: [
      'test/license-center.spec.js',
      'test/license-center-e2e.spec.js',
      'test/production-routing.spec.js',
    ],
    setupFiles: ['./test/license-center.setup.js'],
  },
});
