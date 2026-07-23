import { readFileSync } from 'node:fs';
import { pbkdf2Sync } from 'node:crypto';
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

const password = 'FormatX-Test-Owner-Password-2026';
const salt = Buffer.from('formatx-license-test-salt-2026', 'utf8');
const iterations = 200_000;
const derived = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
const base64url = (value) => Buffer.from(value).toString('base64url');
const passwordRecord = `v1:${iterations}:${base64url(salt)}:${base64url(derived)}`;
const migrationSql = readFileSync(new URL('./license-migrations/0001_license_center.sql', import.meta.url), 'utf8');

export default defineWorkersConfig({
  test: {
    include: ['test/license-center.spec.js', 'test/license-center-e2e.spec.js'],
    setupFiles: ['./test/license-center.setup.js'],
    poolOptions: {
      workers: {
        wrangler: {
          configPath: './wrangler.license-test.jsonc',
        },
        miniflare: {
          bindings: {
            TEST_MIGRATION_SQL: migrationSql,
            ADMIN_PASSWORD_RECORD: passwordRecord,
            TEST_ADMIN_PASSWORD: password,
          },
        },
      },
    },
  },
});
