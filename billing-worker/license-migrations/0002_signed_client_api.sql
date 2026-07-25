CREATE TABLE IF NOT EXISTS license_api_nonces (
    nonce_hash TEXT PRIMARY KEY,
    scope TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_license_api_nonces_expiry
    ON license_api_nonces(expires_at);
