import { beforeAll } from 'vitest';
import { env } from 'cloudflare:test';

beforeAll(async () => {
  await env.LICENSE_DB.exec(env.TEST_MIGRATION_SQL);
});
