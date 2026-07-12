ALTER TABLE media_files ALTER COLUMN width DROP NOT NULL;
ALTER TABLE media_files ALTER COLUMN height DROP NOT NULL;
ALTER TABLE media_files DROP CONSTRAINT media_files_dimensions_check;
ALTER TABLE media_files ADD CONSTRAINT media_files_dimensions_check CHECK (
    (width IS NULL AND height IS NULL) OR
    (width BETWEEN 1 AND 20000 AND height BETWEEN 1 AND 20000)
);

CREATE TABLE resumes (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    position_name VARCHAR(200) NOT NULL,
    job_posting_url VARCHAR(500),
    deadline DATE,
    custom_summary TEXT NOT NULL,
    profile_media_id UUID REFERENCES media_files (id) ON DELETE SET NULL,
    notes TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    pdf_media_id UUID REFERENCES media_files (id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT resumes_status_check CHECK (status IN ('DRAFT', 'READY', 'SUBMITTED', 'ARCHIVED')),
    CONSTRAINT resumes_submitted_check CHECK ((status = 'SUBMITTED' AND submitted_at IS NOT NULL) OR status <> 'SUBMITTED'),
    CONSTRAINT resumes_updated_at_check CHECK (updated_at >= created_at)
);
CREATE INDEX idx_resumes_status_updated ON resumes (status, updated_at DESC);

CREATE TABLE resume_experiences (
    resume_id UUID NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    experience_id UUID NOT NULL REFERENCES experiences (id) ON DELETE RESTRICT,
    display_order INTEGER NOT NULL,
    custom_description TEXT,
    PRIMARY KEY (resume_id, experience_id),
    CONSTRAINT resume_experiences_order_check CHECK (display_order BETWEEN 0 AND 10000)
);

CREATE TABLE resume_projects (
    resume_id UUID NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects (id) ON DELETE RESTRICT,
    display_order INTEGER NOT NULL,
    custom_summary TEXT,
    PRIMARY KEY (resume_id, project_id),
    CONSTRAINT resume_projects_order_check CHECK (display_order BETWEEN 0 AND 10000)
);

CREATE TABLE resume_skills (
    resume_id UUID NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills (id) ON DELETE RESTRICT,
    display_order INTEGER NOT NULL,
    PRIMARY KEY (resume_id, skill_id),
    CONSTRAINT resume_skills_order_check CHECK (display_order BETWEEN 0 AND 10000)
);
