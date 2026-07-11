# YM_PF contributor guide

## Source of truth

Read `PROJECT_SPEC.md` completely before changing code. Implement work in its Phase order and keep public portfolio data separate from administrator-only resume and media data.

## Stack and structure

- `frontend/`: TypeScript, Next.js App Router, React, Tailwind CSS, TanStack Query, React Hook Form, Zod, Vitest/RTL, Playwright.
- `backend/`: Java 21, Spring Boot, Web, JPA, Security, Bean Validation, PostgreSQL, Flyway, springdoc, JUnit/Mockito/Testcontainers.
- Root: Docker Compose and GitHub Actions. Database changes must use Flyway.

## Development rules

- Preserve unrelated and user-authored changes. Do not work directly on or merge into `main`.
- Keep controllers focused on HTTP, services on business rules, and repositories on persistence. Never expose JPA entities as API DTOs.
- Keep frontend API access separate from UI; provide loading, empty, and error states and accessible labels.
- Avoid new dependencies unless they solve a documented requirement and their operational/security impact is understood.
- Review the complete diff at the end of every Phase and create a Phase-scoped local commit only after validation.

## Validation

Run the commands documented in `README.md`. The canonical checks are:

```text
cd frontend && pnpm lint && pnpm typecheck && pnpm test && pnpm build
cd backend && ./gradlew test && ./gradlew check && ./gradlew bootJar
docker compose --env-file .env.example config
docker compose --env-file .env.example build
cd frontend && pnpm playwright test
```

Fix failures and rerun the affected command. Report any check that cannot run and why.

## Security rules

- Never commit credentials or production URLs. `.env.example` contains placeholders only.
- Never persist browser auth tokens in `localStorage`; use secure HttpOnly cookies and revocable, hashed refresh sessions.
- Protect `/api/admin/**`, resumes, generated PDFs, and unpublished media in the backend, not only in the UI.
- Validate every request and both file MIME signatures and extensions; generate storage keys server-side.
- Never store image or PDF binaries in PostgreSQL or expose resume data through public APIs.

## Done means

Requirements and acceptance tests for the current Phase are implemented; lint, typecheck, tests, builds, migrations, OpenAPI, Docker impact, access control, regression risk, docs, and the full diff have been reviewed. Unverified items are not complete.
