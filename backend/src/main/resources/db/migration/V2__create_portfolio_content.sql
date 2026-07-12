CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    headline VARCHAR(160) NOT NULL,
    short_bio VARCHAR(500) NOT NULL,
    long_bio TEXT NOT NULL,
    email VARCHAR(254) NOT NULL,
    github_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT profiles_updated_at_check CHECK (updated_at >= created_at)
);

CREATE TABLE experiences (
    id UUID PRIMARY KEY,
    organization VARCHAR(160) NOT NULL,
    title VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT experiences_date_check CHECK (
        (is_current AND end_date IS NULL) OR
        (NOT is_current AND end_date IS NOT NULL AND end_date >= start_date)
    ),
    CONSTRAINT experiences_order_check CHECK (display_order BETWEEN 0 AND 10000)
);
CREATE INDEX idx_experiences_order ON experiences (display_order, start_date DESC);

CREATE TABLE educations (
    id UUID PRIMARY KEY,
    institution VARCHAR(160) NOT NULL,
    program VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT educations_date_check CHECK (end_date >= start_date),
    CONSTRAINT educations_order_check CHECK (display_order BETWEEN 0 AND 10000)
);
CREATE INDEX idx_educations_order ON educations (display_order, start_date DESC);

CREATE TABLE certificates (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    issuer VARCHAR(160) NOT NULL,
    issued_date DATE NOT NULL,
    expires_date DATE,
    credential_url VARCHAR(500),
    score VARCHAR(100),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT certificates_date_check CHECK (expires_date IS NULL OR expires_date >= issued_date),
    CONSTRAINT certificates_order_check CHECK (display_order BETWEEN 0 AND 10000)
);
CREATE INDEX idx_certificates_order ON certificates (display_order, issued_date DESC);

CREATE TABLE skills (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(32) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT skills_category_check CHECK (
        category IN ('BACKEND', 'FRONTEND', 'DATABASE', 'INFRASTRUCTURE', 'AI')
    ),
    CONSTRAINT skills_order_check CHECK (display_order BETWEEN 0 AND 10000)
);
CREATE UNIQUE INDEX uk_skills_lower_name ON skills (lower(name));
CREATE INDEX idx_skills_category_order ON skills (category, display_order, name);

CREATE TABLE projects (
    id UUID PRIMARY KEY,
    slug VARCHAR(160) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    summary VARCHAR(500) NOT NULL,
    background TEXT NOT NULL,
    problem TEXT NOT NULL,
    goal TEXT NOT NULL,
    role VARCHAR(300) NOT NULL,
    responsibilities TEXT NOT NULL,
    implementation TEXT NOT NULL,
    technical_decisions TEXT NOT NULL,
    results TEXT NOT NULL,
    limitations TEXT NOT NULL,
    retrospective TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    team_size INTEGER,
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT projects_slug_check CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT projects_status_check CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    CONSTRAINT projects_date_check CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
    CONSTRAINT projects_team_size_check CHECK (team_size IS NULL OR team_size >= 1),
    CONSTRAINT projects_order_check CHECK (display_order BETWEEN 0 AND 10000),
    CONSTRAINT projects_updated_at_check CHECK (updated_at >= created_at)
);
CREATE INDEX idx_projects_status_updated ON projects (status, updated_at DESC);
CREATE INDEX idx_projects_featured_order ON projects (featured DESC, display_order, start_date DESC);

CREATE TABLE project_skills (
    project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills (id) ON DELETE RESTRICT,
    display_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (project_id, skill_id),
    CONSTRAINT project_skills_order_check CHECK (display_order BETWEEN 0 AND 10000)
);
CREATE INDEX idx_project_skills_skill_project ON project_skills (skill_id, project_id);

CREATE TABLE project_problem_solutions (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    problem TEXT NOT NULL,
    cause TEXT NOT NULL,
    solution TEXT NOT NULL,
    verification TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT project_problem_solutions_order_check CHECK (display_order BETWEEN 0 AND 10000)
);
CREATE INDEX idx_project_problem_solutions_order
    ON project_problem_solutions (project_id, display_order);
