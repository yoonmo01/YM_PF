CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    role VARCHAR(32) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT users_email_normalized_check CHECK (
        email = lower(email)
        AND email = btrim(email)
        AND length(email) > 3
    ),
    CONSTRAINT users_password_hash_check CHECK (length(password_hash) = 60),
    CONSTRAINT users_role_check CHECK (role IN ('ADMIN')),
    CONSTRAINT users_updated_at_check CHECK (updated_at >= created_at)
);

CREATE INDEX idx_users_enabled_role ON users (enabled, role);

CREATE TABLE refresh_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT refresh_sessions_token_hash_check CHECK (token_hash ~ '^[0-9a-f]{64}$'),
    CONSTRAINT refresh_sessions_expiry_check CHECK (expires_at > created_at),
    CONSTRAINT refresh_sessions_revoked_at_check CHECK (
        revoked_at IS NULL OR revoked_at >= created_at
    )
);

CREATE INDEX idx_refresh_sessions_user_id ON refresh_sessions (user_id);
CREATE INDEX idx_refresh_sessions_expires_at ON refresh_sessions (expires_at);
CREATE INDEX idx_refresh_sessions_active_user
    ON refresh_sessions (user_id, expires_at)
    WHERE revoked_at IS NULL;
