CREATE TABLE IF NOT EXISTS public_accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_iterations INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','disabled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT,
  privacy_accepted_at TEXT NOT NULL,
  terms_accepted_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public_account_sessions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  remember INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  user_agent_hash TEXT,
  revoked_at TEXT,
  FOREIGN KEY(account_id) REFERENCES public_accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_public_account_sessions_account
  ON public_account_sessions(account_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_public_account_sessions_token
  ON public_account_sessions(token_hash);
