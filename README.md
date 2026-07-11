# YM_PF · Portfolio Hub

YM_PF is a full-stack portfolio and private, company-specific resume manager. Public visitors can explore published case studies; a single administrator manages portfolio content, media, and tailored resumes behind authenticated APIs.

The implementation follows [`PROJECT_SPEC.md`](PROJECT_SPEC.md) phase by phase. Public APIs never expose resume records, generated PDFs, draft projects, or unpublished media.

## Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod, Vitest/React Testing Library, Playwright
- Backend: Java 21, Spring Boot, Spring Web, JPA, Security, Bean Validation, Flyway, springdoc, JUnit/Mockito/Testcontainers
- Data and runtime: PostgreSQL, provider-neutral media storage, Docker Compose, GitHub Actions

## Prerequisites

- Node.js 22+
- pnpm 11+
- Java 21 (the Gradle wrapper is included)
- Docker with Compose

## Local setup

1. Create local environment settings. The example contains development placeholders only; replace every `CHANGE_ME` value.

   ```powershell
   Copy-Item .env.example .env
   ```

2. Start PostgreSQL, or the entire container stack:

   ```powershell
   docker compose up -d postgres
   # or
   docker compose up --build
   ```

3. Run the backend from `backend/`:

   ```powershell
   .\gradlew.bat bootRun
   ```

4. In another terminal, run the frontend from `frontend/`:

   ```powershell
   pnpm install
   pnpm dev
   ```

The frontend is served at <http://localhost:3000>, the backend at <http://localhost:8080>, health information at <http://localhost:8080/actuator/health>, and OpenAPI UI at <http://localhost:8080/swagger-ui.html>.

## Environment variables

See [`.env.example`](.env.example) for the complete list. Important groups are:

- PostgreSQL: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- Authentication: `JWT_SECRET`, token TTLs, cookie security, and optional first-run `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- Media: `MEDIA_STORAGE_PROVIDER` plus local-path or S3-compatible object-storage settings
- Web origins: `NEXT_PUBLIC_API_BASE_URL`, `ALLOWED_ORIGINS`

From Phase 1 onward, administrator bootstrap is disabled when its email or password is blank. Never commit a populated `.env` file.

## Validation

Frontend, from `frontend/`:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm playwright test
```

Backend, from `backend/`:

```powershell
.\gradlew.bat test
.\gradlew.bat check
.\gradlew.bat bootJar
```

Containers, from the repository root:

```powershell
docker compose --env-file .env.example config
docker compose --env-file .env.example build
docker compose --env-file .env.example up
```

The GitHub Actions workflow runs matching `frontend-check`, `backend-check`, `docker-check`, and `e2e-check` jobs.

## Repository layout

```text
frontend/                 Next.js application and browser tests
backend/                  Spring Boot API and database migrations
docs/                     Architecture and deployment notes
.github/workflows/ci.yml  Pull-request quality gates
docker-compose.yml        Reproducible local stack
```

## Security invariants

The later feature phases must preserve these rules; Phase 0 only establishes the foundation that they build on.

- Authentication will use secure cookies; tokens must not be stored in browser local storage.
- Refresh tokens must be stored only as revocable hashes.
- PostgreSQL will store media metadata, never image or PDF bytes.
- The backend must remain the authority for admin, resume, PDF, and unpublished-media access.
- Uploads must be validated by size, extension, declared MIME type, and file signature; storage keys must be server-generated.

Deployment configuration is committed only as infrastructure metadata. This repository does not provision credentials or deploy to external services automatically.
