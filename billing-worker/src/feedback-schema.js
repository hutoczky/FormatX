const FEEDBACK_PATHS = new Set([
  '/api/feedback',
  '/api/feedback/summary',
]);
const ADMIN_FEEDBACK_ROOT = '/fx-owner-license/api/feedback';
const SCHEMA_VERSION = '6';
const SCHEMA_KEY = 'feedback_schema_version';
let schemaReadyPromise = null;
let bootstrapPromise = null;

const REQUIRED_COLUMNS = Object.freeze({
  id: "TEXT NOT NULL DEFAULT ''",
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
  consent_version: "TEXT NOT NULL DEFAULT '2026-08-06'",
  locale: "TEXT NOT NULL DEFAULT 'hu'",
  source: "TEXT NOT NULL DEFAULT 'website'",
  page_path: "TEXT NOT NULL DEFAULT '/'",
  ip_hash: "TEXT NOT NULL DEFAULT ''",
  user_agent: "TEXT NOT NULL DEFAULT ''",
  moderation_note: "TEXT NOT NULL DEFAULT ''",
  approved_at: 'TEXT',
});

const UUID_SQL = "lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))";
const NOW_SQL = "strftime('%Y-%m-%dT%H:%M:%fZ','now')";

function createTableSql() {
  return `CREATE TABLE IF NOT EXISTS user_feedback (
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
  )`;
}

export function isFeedbackRequestPath(pathname) {
  return FEEDBACK_PATHS.has(pathname) || pathname === ADMIN_FEEDBACK_ROOT
    || pathname.startsWith(`${ADMIN_FEEDBACK_ROOT}/`);
}

// Used only after a real query proves that the table is absent.
export async function createFeedbackTableIfMissing(database) {
  if (!database) throw new Error('feedback_database_unavailable');
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await database.prepare(createTableSql()).run();
      await createIndexesBestEffort(database);
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }
  return bootstrapPromise;
}

// Maintenance-only compatibility helper. It is intentionally not called on every
// public feedback request.
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
  let columns = await readColumns(database);
  if (hasCanonicalColumns(columns)) return;

  if (columns.size === 0) {
    await createFeedbackTableIfMissing(database);
    columns = await readColumns(database);
  }

  for (const [name, definition] of Object.entries(REQUIRED_COLUMNS)) {
    if (columns.has(name)) continue;
    try {
      await database.prepare(`ALTER TABLE user_feedback ADD COLUMN ${name} ${definition}`).run();
    } catch (error) {
      const message = String(error instanceof Error ? error.message : error).toLowerCase();
      if (!message.includes('duplicate column')) throw error;
    }
  }

  columns = await readColumns(database);
  const missing = Object.keys(REQUIRED_COLUMNS).filter(name => !columns.has(name));
  if (missing.length) throw new Error(`feedback_schema_column_missing:${missing.join(',')}`);

  await normaliseRecoveredRows(database);
  await createIndexesBestEffort(database);
  await saveSchemaVersionBestEffort(database);
}

function hasCanonicalColumns(columns) {
  return Object.keys(REQUIRED_COLUMNS).every(name => columns.has(name));
}

async function normaliseRecoveredRows(database) {
  await database.exec(`
    UPDATE user_feedback SET id = ${UUID_SQL} WHERE id IS NULL OR trim(CAST(id AS TEXT)) = '';
    UPDATE user_feedback SET created_at = ${NOW_SQL} WHERE created_at IS NULL OR trim(CAST(created_at AS TEXT)) = '';
    UPDATE user_feedback SET updated_at = created_at WHERE updated_at IS NULL OR trim(CAST(updated_at AS TEXT)) = '';
    UPDATE user_feedback SET status = 'pending' WHERE status IS NULL OR status NOT IN ('pending', 'approved', 'rejected');
    UPDATE user_feedback SET overall = 1 WHERE overall IS NULL OR CAST(overall AS INTEGER) NOT BETWEEN 1 AND 5;
    UPDATE user_feedback SET usability = 1 WHERE usability IS NULL OR CAST(usability AS INTEGER) NOT BETWEEN 1 AND 5;
    UPDATE user_feedback SET performance = 1 WHERE performance IS NULL OR CAST(performance AS INTEGER) NOT BETWEEN 1 AND 5;
    UPDATE user_feedback SET design = 1 WHERE design IS NULL OR CAST(design AS INTEGER) NOT BETWEEN 1 AND 5;
    UPDATE user_feedback SET features = 1 WHERE features IS NULL OR CAST(features AS INTEGER) NOT BETWEEN 1 AND 5;
    UPDATE user_feedback SET comment = '' WHERE comment IS NULL;
    UPDATE user_feedback SET display_name = '' WHERE display_name IS NULL;
    UPDATE user_feedback SET contact_email = '' WHERE contact_email IS NULL;
    UPDATE user_feedback SET publish_permission = CASE WHEN CAST(publish_permission AS INTEGER) = 1 THEN 1 ELSE 0 END;
    UPDATE user_feedback SET privacy_consent = CASE WHEN CAST(privacy_consent AS INTEGER) = 0 THEN 0 ELSE 1 END;
    UPDATE user_feedback SET consent_version = '2026-08-06' WHERE consent_version IS NULL OR consent_version = '';
    UPDATE user_feedback SET locale = 'hu' WHERE locale IS NULL OR locale NOT IN ('hu', 'en');
    UPDATE user_feedback SET source = 'website' WHERE source IS NULL OR source = '';
    UPDATE user_feedback SET page_path = '/' WHERE page_path IS NULL OR page_path = '';
    UPDATE user_feedback SET ip_hash = '' WHERE ip_hash IS NULL;
    UPDATE user_feedback SET user_agent = '' WHERE user_agent IS NULL;
    UPDATE user_feedback SET moderation_note = '' WHERE moderation_note IS NULL;
  `);
}

async function createIndexesBestEffort(database) {
  try {
    await database.prepare('CREATE INDEX IF NOT EXISTS idx_user_feedback_status_created ON user_feedback(status, created_at DESC)').run();
    await database.prepare('CREATE INDEX IF NOT EXISTS idx_user_feedback_ip_created ON user_feedback(ip_hash, created_at DESC)').run();
  } catch (error) {
    console.warn('FormatX feedback index maintenance skipped', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function saveSchemaVersionBestEffort(database) {
  try {
    await database.prepare(`CREATE TABLE IF NOT EXISTS formatx_schema_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`).run();
    await database.prepare(`
      INSERT INTO formatx_schema_meta (key, value, updated_at)
      VALUES (?1, ?2, ?3)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).bind(SCHEMA_KEY, SCHEMA_VERSION, new Date().toISOString()).run();
  } catch (error) {
    console.warn('FormatX feedback schema metadata write skipped', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function readColumns(database) {
  const result = await database.prepare('PRAGMA table_info(user_feedback)').all();
  return new Set((result.results || []).map(row => String(row.name || '')));
}

export const feedbackSchemaInternals = Object.freeze({
  REQUIRED_COLUMNS,
  SCHEMA_VERSION,
  hasCanonicalColumns,
});
