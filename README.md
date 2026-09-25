# YM_PF · Portfolio Hub

현재 채용용 공개 사이트는 기존 Vercel 프로젝트 `yoonmo-portfolio`에서 **정적 콘텐츠 기반 Next.js 페이지**로 제공할 준비 중입니다. 홈, 소개, 연락, 프로젝트 목록과 여섯 상세 페이지는 [`frontend/src/content/public-portfolio.ts`](frontend/src/content/public-portfolio.ts)의 검토된 데이터에서 빌드됩니다. 문구를 바꾸려면 코드 검토와 재배포가 필요합니다. 이번 공개 릴리스는 Java 백엔드, PostgreSQL, 객체 스토리지를 운영하지 않으며 관리자·회사별 이력서·PDF는 공개하지 않습니다.

저장소에는 향후 풀스택 서비스를 위한 Spring Boot 관리자·이력서 구현이 남아 있습니다. 로컬에서는 개발할 수 있지만 현재 운영 공개 화면은 그 API에 의존하지 않습니다. 전체 제품 요구사항은 [`PROJECT_SPEC.md`](PROJECT_SPEC.md), 이번 릴리스와 미래 배포의 구분은 [`docs/deployment.md`](docs/deployment.md)를 참고하세요.

## Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod, Vitest/React Testing Library, Playwright
- Backend: Java 21, Spring Boot, Spring Web, JPA, Security, Bean Validation, Flyway, springdoc, JUnit/Mockito/Testcontainers
- Data and runtime: PostgreSQL, provider-neutral media storage, Docker Compose, GitHub Actions

## 현재 공개 화면

- 개인 소개, 연락처, 기술과 여섯 프로젝트 사례를 로컬 공개 콘텐츠에서 사전 렌더링
- 공개 프로젝트는 기술별로 필터링 가능하며 알 수 없는 상세 주소는 404
- 운영 `/admin/**`는 404이고 운영 `/api/**` 백엔드 프록시는 없음

## 로컬 개발용 풀스택 구현

- Spring Boot 콘텐츠 CRUD와 공개 API 소스. 현재 Vercel 공개 화면에서는 사용하지 않음
- Single-administrator cookie authentication with refresh rotation, CSRF, exact-origin CORS, and default-deny admin APIs
- Content CRUD with project draft/published/archived states and public DTO isolation
- Validated PNG/JPEG upload, local or S3-compatible storage, cover/gallery/architecture roles, ordering, and usage-aware deletion
- Private company-specific resume CRUD, copy, ordered experience/project/skill selections, preview, Korean PDF generation, and lifecycle states

## Prerequisites

- Node.js 22+
- pnpm 11+
- Java 21 (the Gradle wrapper is included)
- Docker with Compose

## 풀스택 로컬 개발

Windows에서 Docker Desktop으로 실행하는 전체 절차와 문제 해결 방법은 [`docs/LOCAL_RUN.md`](docs/LOCAL_RUN.md)를 참고하세요.

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

## 풀스택 로컬 환경변수

See [`.env.example`](.env.example) for the complete list. Important groups are:

- PostgreSQL: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- Authentication: `JWT_SECRET`, token TTLs, cookie security, and optional first-run `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- Media: `MEDIA_STORAGE_PROVIDER` plus local-path or S3-compatible object-storage settings
- Resume PDF: optional `RESUME_PDF_FONT_PATH` pointing to a Korean-capable TrueType font; Windows uses Malgun Gothic automatically and the backend image includes NanumGothic
- Local web routing: `API_PROXY_TARGET` for the development-only Next.js `/api` proxy, plus backend `ALLOWED_ORIGINS`

현재 Vercel 공개 릴리스에는 위 백엔드·DB·스토리지 설정이 필요하지 않습니다.

Administrator bootstrap runs only when the database has no users and both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are explicitly set. The password must contain at least 12 characters and at most 72 UTF-8 bytes, and is stored with BCrypt cost 12. Remove `ADMIN_PASSWORD` from the runtime environment after the first account is created. Never commit a populated `.env` file.

## 로컬 관리자 인증

Open `/admin/login` after creating the first administrator. The browser requests a CSRF token, then sends credentialed requests using HttpOnly access and refresh cookies. Refresh tokens are rotated on use and only SHA-256 hashes are stored in PostgreSQL. The main endpoints are:

```text
GET  /api/auth/csrf
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

All `/api/admin/**` endpoints require an enabled administrator account when the backend runs. The frontend route guard prevents protected content from rendering before `/api/auth/me` succeeds, while the backend remains the final authorization boundary. Production Vercel does not connect to this backend, and `/admin/**` returns 404.

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

Playwright checks the actual static public pages without API fixtures and runs a separate mocked local-admin login flow. It runs desktop Chromium, Pixel 7, and a 360px viewport, including horizontal-overflow and serious/critical WCAG A/AA checks. Backend integration tests require a running Docker daemon because they start PostgreSQL with Testcontainers.

## Deployment configuration

- Existing Vercel project `yoonmo-portfolio`: canonical repository `yoonmo01/yoonmo-portfolio`, production branch `main`, Root Directory `frontend`. `frontend/vercel.json` sets the Next.js build commands.
- `render.yaml`: candidate Render Docker Blueprint for a future backend deployment. Neon and object storage are also future options.

See [`docs/deployment.md`](docs/deployment.md) for preview review, release gating, and future full-stack deployment guidance. The project is not published from this branch until the owner approves the public copy and preview.

## Repository layout

```text
frontend/                 Next.js application and browser tests
backend/                  Spring Boot API and database migrations
docs/                     Architecture and deployment notes
.github/workflows/ci.yml  Pull-request quality gates
docker-compose.yml        Reproducible local stack
```

처음 코드를 읽는다면 [`docs/PROJECT_GUIDE.md`](docs/PROJECT_GUIDE.md)의 구조 설명, 요청 흐름, 데이터 모델, 보안 설계, 추천 학습 순서를 따라가세요.

## Security invariants

- Authentication uses secure HttpOnly cookies; tokens are never stored in browser local storage.
- Refresh tokens are stored only as revocable hashes and are rotated on refresh.
- PostgreSQL will store media metadata, never image or PDF bytes.
- The backend is the authority for admin, resume, PDF, and unpublished-media access.
- Uploads must be validated by size, extension, declared MIME type, and file signature; storage keys must be server-generated.

Deployment configuration is committed only as infrastructure metadata. This repository does not provision credentials automatically.

## Future full-stack operational constraints

- Authentication across unrelated frontend/backend domains depends on third-party-cookie browser policy. Same-site custom domains are preferred.
- The application intentionally supports one administrator and has no public resume sharing in the MVP.
- Generated PDFs require a Korean-capable `.ttf`; configure `RESUME_PDF_FONT_PATH` if the platform does not use the supplied Docker image.
- Uploaded project images are limited to genuine PNG/JPEG files and 5MB by default. Generated PDFs are private administrator media.
