CREATE TABLE media_files (
    id UUID PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL UNIQUE,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    alt_text VARCHAR(300) NOT NULL,
    caption VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT media_files_size_check CHECK (file_size BETWEEN 1 AND 5242880),
    CONSTRAINT media_files_dimensions_check CHECK (width BETWEEN 1 AND 8000 AND height BETWEEN 1 AND 8000),
    CONSTRAINT media_files_updated_at_check CHECK (updated_at >= created_at)
);
CREATE INDEX idx_media_files_updated ON media_files (updated_at DESC);

CREATE TABLE project_media (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    media_id UUID NOT NULL REFERENCES media_files (id) ON DELETE RESTRICT,
    media_role VARCHAR(32) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT project_media_unique UNIQUE (project_id, media_id),
    CONSTRAINT project_media_role_check CHECK (media_role IN ('COVER', 'CONTENT', 'ARCHITECTURE', 'DASHBOARD', 'RESULT')),
    CONSTRAINT project_media_order_check CHECK (display_order BETWEEN 0 AND 10000)
);
CREATE UNIQUE INDEX uk_project_media_cover ON project_media (project_id) WHERE media_role = 'COVER';
CREATE INDEX idx_project_media_order ON project_media (project_id, media_role, display_order);
