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

CREATE INDEX IF NOT EXISTS idx_user_feedback_status_created
  ON user_feedback(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_feedback_ip_created
  ON user_feedback(ip_hash, created_at DESC);
