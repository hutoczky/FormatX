const FEEDBACK_PATHS = new Set([
  '/api/feedback',
  '/api/feedback/summary',
]);
const ADMIN_FEEDBACK_ROOT = '/fx-owner-license/api/feedback';

let schemaReadyPromise = null;

const CREATE_TABLE_SQL = `
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
`;

const REQUIRED_COLUMNS = Object.freeze({
  created_at: "TEXT NOT NULL DEFAULT ''",
  updated_at: "TEXT NOT NULL DEFAULT ''",
  status: "TEXT NOT NULL DEFAULT 'pending'",
  overall: 'INTEGER NOT NULL DEFAULT 1',
  usability: 'INTEGER NOT NULL DEFAULT 1',
  performance: 'INTEGER NOT NULL DEFAULT 1',
  design: 'INTEGER NOT NULL DEFAULT 1',
  features: 'INTEGER NOT NULL DEFAULT 1',
  comment: "TEXT NOT NULL DEFAULT ''",
  display_name: "TEXT NOT NULL DEFAULT ''",
  contact_email: "TEXT NOT NULL DEFAULT ''",
  publish_permission: 'INTEGER NOT NULL DEFAULT 0',
  privacy_consent: 'INTEGER NOT NULL DEFAULT 1',
  consent_version: "TEXT NOT NULL DEFAULT ''",
  locale: "TEXT NOT NULL DEFAULT 'hu'",
  source: "TEXT NOT NULL DEFAULT 'website'",
  page_path: "TEXT NOT NULL DEFAULT '/'",
  ip_hash: "TEXT NOT NULL DEFAULT ''",
  user_agent: "TEXT NOT NULL DEFAULT ''",
  moderation_note: "TEXT NOT NULL DEFAULT ''",
  approved_at: 'TEXT',
});

export function isFeedbackRequestPath(pathname) {
  return FEEDBACK_PATHS.has(pathname) || pathname === ADMIN_FEEDBACK_ROOT
    || pathname.startsWith(`${ADMIN_FEEDBACK_ROOT}/`);
}

export async function ensureFeedbackSchemaCompatibility(database) {
  if (!database) throw new Error('feedback_database_unavailable');
  if (!schemaReadyPromise) {
    schemaReadyPromise = migrateFeedbackSchema(database).catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }
  return schemaReadyPromise;
}

async function migrateFeedbackSchema(database) {
  await database.exec(CREATE_TABLE_SQL);

  let columns = await readColumns(database);
  if (!columns.has('id')) {
    throw new Error('feedback_schema_missing_primary_key');
  }

  for (const [name, definition] of Object.entries(REQUIRED_COLUMNS)) {
    if (columns.has(name)) continue;
    try {
      await database.exec(`ALTER TABLE user_feedback ADD COLUMN ${name} ${definition};`);
    } catch (error) {
      // Another Worker isolate may have completed the same idempotent migration.
      if (!String(error instanceof Error ? error.message : error).toLowerCase().includes('duplicate column')) {
        throw error;
      }
    }
  }

  columns = await readColumns(database);
  for (const name of Object.keys(REQUIRED_COLUMNS)) {
    if (!columns.has(name)) throw new Error(`feedback_schema_column_missing:${name}`);
  }

  await database.exec(`
    UPDATE user_feedback
    SET updated_at = CASE
      WHEN updated_at IS NULL OR updated_at = '' THEN created_at
      ELSE updated_at
    END;

    UPDATE user_feedback
    SET status = 'pending'
    WHERE status IS NULL OR status NOT IN ('pending', 'approved', 'rejected');

    UPDATE user_feedback
    SET consent_version = '2026-08-06'
    WHERE consent_version IS NULL OR consent_version = '';

    UPDATE user_feedback
    SET locale = 'hu'
    WHERE locale IS NULL OR locale = '';

    UPDATE user_feedback
    SET source = 'website'
    WHERE source IS NULL OR source = '';

    UPDATE user_feedback
    SET page_path = '/'
    WHERE page_path IS NULL OR page_path = '';

    CREATE INDEX IF NOT EXISTS idx_user_feedback_status_created
      ON user_feedback(status, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_user_feedback_ip_created
      ON user_feedback(ip_hash, created_at DESC);
  `);
}

async function readColumns(database) {
  const result = await database.prepare('PRAGMA table_info(user_feedback)').all();
  return new Set((result.results || []).map((row) => String(row.name || '')));
}

export const feedbackSchemaInternals = Object.freeze({
  REQUIRED_COLUMNS,
});
