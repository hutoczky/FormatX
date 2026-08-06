const FEEDBACK_PATHS = new Set([
  '/api/feedback',
  '/api/feedback/summary',
]);
const ADMIN_FEEDBACK_ROOT = '/fx-owner-license/api/feedback';
const SCHEMA_VERSION = '3';
const SCHEMA_KEY = 'feedback_schema_version';
const RECOVERY_TABLE = 'user_feedback_recovery_v3';
let schemaReadyPromise = null;

const REQUIRED_COLUMNS = Object.freeze([
  'id', 'created_at', 'updated_at', 'status',
  'overall', 'usability', 'performance', 'design', 'features',
  'comment', 'display_name', 'contact_email',
  'publish_permission', 'privacy_consent', 'consent_version',
  'locale', 'source', 'page_path', 'ip_hash', 'user_agent',
  'moderation_note', 'approved_at',
]);

function createTableSql(tableName) {
  return `
CREATE TABLE IF NOT EXISTS ${tableName} (
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
);`;
}

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
  await database.exec(`
    CREATE TABLE IF NOT EXISTS formatx_schema_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const version = await database.prepare(
    'SELECT value FROM formatx_schema_meta WHERE key = ?1'
  ).bind(SCHEMA_KEY).first();

  const tableExists = await database.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'user_feedback'"
  ).first();

  if (!tableExists) {
    await database.exec(createTableSql('user_feedback'));
  } else if (!await canonicalColumnsPresent(database)) {
    await rebuildCanonicalTable(database);
  }

  if (!await canonicalColumnsPresent(database)) {
    throw new Error('feedback_schema_recovery_failed');
  }

  await normaliseAndIndex(database);
  if (version?.value !== SCHEMA_VERSION) await saveSchemaVersion(database);
}

async function rebuildCanonicalTable(database) {
  const oldColumns = await readColumns(database);
  await database.exec(`DROP TABLE IF EXISTS ${RECOVERY_TABLE};`);
  await database.exec(createTableSql(RECOVERY_TABLE));

  const uuid = "lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))";
  const now = "strftime('%Y-%m-%dT%H:%M:%fZ','now')";
  const has = (name) => oldColumns.has(name);
  const text = (name, fallback = "''") => has(name)
    ? `COALESCE(CAST(${name} AS TEXT), ${fallback})`
    : fallback;
  const rating = (name) => has(name)
    ? `CASE WHEN CAST(${name} AS INTEGER) BETWEEN 1 AND 5 THEN CAST(${name} AS INTEGER) ELSE 1 END`
    : '1';

  const expressions = {
    id: has('id') ? `CASE WHEN trim(COALESCE(CAST(id AS TEXT), '')) = '' THEN ${uuid} ELSE CAST(id AS TEXT) END` : uuid,
    created_at: has('created_at') ? `CASE WHEN trim(COALESCE(CAST(created_at AS TEXT), '')) = '' THEN ${now} ELSE CAST(created_at AS TEXT) END` : now,
    updated_at: has('updated_at') ? `CASE WHEN trim(COALESCE(CAST(updated_at AS TEXT), '')) = '' THEN ${now} ELSE CAST(updated_at AS TEXT) END` : now,
    status: has('status') ? "CASE WHEN status IN ('pending','approved','rejected') THEN status ELSE 'pending' END" : "'pending'",
    overall: rating('overall'),
    usability: rating('usability'),
    performance: rating('performance'),
    design: rating('design'),
    features: rating('features'),
    comment: text('comment'),
    display_name: text('display_name'),
    contact_email: text('contact_email'),
    publish_permission: has('publish_permission') ? 'CASE WHEN CAST(publish_permission AS INTEGER) = 1 THEN 1 ELSE 0 END' : '0',
    privacy_consent: has('privacy_consent') ? 'CASE WHEN CAST(privacy_consent AS INTEGER) = 0 THEN 0 ELSE 1 END' : '1',
    consent_version: text('consent_version', "'2026-08-06'"),
    locale: has('locale') ? "CASE WHEN locale = 'en' THEN 'en' ELSE 'hu' END" : "'hu'",
    source: text('source', "'website'"),
    page_path: text('page_path', "'/'"),
    ip_hash: text('ip_hash'),
    user_agent: text('user_agent'),
    moderation_note: text('moderation_note'),
    approved_at: has('approved_at') ? 'CAST(approved_at AS TEXT)' : 'NULL',
  };

  await database.exec(`
    INSERT INTO ${RECOVERY_TABLE} (${REQUIRED_COLUMNS.join(', ')})
    SELECT ${REQUIRED_COLUMNS.map(name => expressions[name]).join(', ')}
    FROM user_feedback;
  `);

  await database.exec(`
    DROP INDEX IF EXISTS idx_user_feedback_status_created;
    DROP INDEX IF EXISTS idx_user_feedback_ip_created;
    DROP TABLE user_feedback;
    ALTER TABLE ${RECOVERY_TABLE} RENAME TO user_feedback;
  `);
}

async function normaliseAndIndex(database) {
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

    UPDATE user_feedback SET locale = 'hu' WHERE locale IS NULL OR locale NOT IN ('hu', 'en');
    UPDATE user_feedback SET source = 'website' WHERE source IS NULL OR source = '';
    UPDATE user_feedback SET page_path = '/' WHERE page_path IS NULL OR page_path = '';
    UPDATE user_feedback SET ip_hash = '' WHERE ip_hash IS NULL;

    CREATE INDEX IF NOT EXISTS idx_user_feedback_status_created
      ON user_feedback(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_user_feedback_ip_created
      ON user_feedback(ip_hash, created_at DESC);
  `);
}

async function saveSchemaVersion(database) {
  await database.prepare(`
    INSERT INTO formatx_schema_meta (key, value, updated_at)
    VALUES (?1, ?2, ?3)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).bind(SCHEMA_KEY, SCHEMA_VERSION, new Date().toISOString()).run();
}

async function canonicalColumnsPresent(database) {
  const columns = await readColumns(database);
  return REQUIRED_COLUMNS.every(name => columns.has(name));
}

async function readColumns(database) {
  const result = await database.prepare('PRAGMA table_info(user_feedback)').all();
  return new Set((result.results || []).map(row => String(row.name || '')));
}

export const feedbackSchemaInternals = Object.freeze({
  REQUIRED_COLUMNS,
  SCHEMA_VERSION,
  RECOVERY_TABLE,
});
