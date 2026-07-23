PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY,
    key_hash TEXT NOT NULL UNIQUE,
    key_last4 TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    plan TEXT NOT NULL DEFAULT 'pro',
    max_devices INTEGER NOT NULL DEFAULT 1 CHECK (max_devices BETWEEN 1 AND 50),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
    issued_at TEXT NOT NULL,
    expires_at TEXT,
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    revoked_at TEXT,
    revoke_reason TEXT
);

CREATE TABLE IF NOT EXISTS license_activations (
    id TEXT PRIMARY KEY,
    license_id TEXT NOT NULL,
    device_hash TEXT NOT NULL,
    device_name TEXT,
    platform TEXT,
    app_version TEXT,
    first_seen_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    deactivated_at TEXT,
    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE,
    UNIQUE (license_id, device_hash)
);

CREATE TABLE IF NOT EXISTS license_audit (
    id TEXT PRIMARY KEY,
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS license_rate_limits (
    scope TEXT NOT NULL,
    bucket INTEGER NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (scope, bucket)
);

CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_email ON licenses(customer_email);
CREATE INDEX IF NOT EXISTS idx_licenses_created_at ON licenses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_license_activations_license ON license_activations(license_id);
CREATE INDEX IF NOT EXISTS idx_license_activations_last_seen ON license_activations(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_license_audit_created_at ON license_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_license_rate_limits_updated_at ON license_rate_limits(updated_at);
