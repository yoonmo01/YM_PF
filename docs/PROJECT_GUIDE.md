# YM_PF 프로젝트 구조·기술·코드 학습 가이드

이 문서는 YM_PF 코드를 처음 읽는 사람이 프로젝트의 목적, 전체 구조, 핵심 기술, 요청 흐름, 데이터 모델, 보안 설계, 테스트 전략을 이해하고 실제 코드를 단계적으로 공부할 수 있도록 만든 안내서입니다.

기능 요구사항의 원문은 [`PROJECT_SPEC.md`](../PROJECT_SPEC.md), 로컬 실행과 환경 설정은 [`LOCAL_RUN.md`](LOCAL_RUN.md), 전체 프로젝트 소개는 [`README.md`](../README.md), 운영 보안 원칙은 [`security.md`](security.md), 배포 준비는 [`deployment.md`](deployment.md)를 함께 참고합니다.

## 1. 현재 완성 상태

PROJECT_SPEC의 Phase 0부터 Phase 5까지 구현되어 있습니다.

- 공개 포트폴리오: 프로필, 경력, 교육, 기술, 자격증, 공개 프로젝트 목록과 상세
- 관리자: 로그인, 대시보드, 콘텐츠 CRUD, 프로젝트 상태 관리
- 미디어: PNG/JPEG 업로드, 메타데이터, 프로젝트 연결과 순서, 로컬/S3 저장소
- 회사별 이력서: 복제, 경력·프로젝트·기술 선택, 맞춤 문구, 미리보기, PDF, 상태 관리
- 품질: 백엔드 통합 테스트, 프런트엔드 단위 테스트, Playwright, 접근성, Docker, CI
- 배포 준비: Vercel, Render, Neon, S3 호환 저장소 설정 문서

필수 기능 구현 관점에서 남은 작업은 없습니다. 실제 사용을 위해서는 `.env` 설정, 최초 관리자 생성, 본인 콘텐츠 입력이 필요합니다. 외부 서비스 배포와 실제 운영 자격증명 생성은 아직 수행하지 않았습니다.

## 2. 서비스가 해결하는 문제

이 프로젝트는 두 종류의 데이터를 명확하게 분리합니다.

1. 누구나 볼 수 있는 공개 포트폴리오
2. 관리자만 접근할 수 있는 회사·포지션별 맞춤 이력서

공개 프로젝트는 단순 기술 목록보다 문제, 원인, 해결, 검증, 결과를 보여주는 Case Study를 지향합니다. 맞춤 이력서는 같은 경력 데이터에서 지원 회사에 필요한 항목만 골라 순서와 설명을 바꾸고 PDF로 만들 수 있습니다.

핵심 보안 불변 조건은 다음과 같습니다.

- `DRAFT`, `ARCHIVED` 프로젝트는 공개 API에서 반환하지 않는다.
- 이력서와 생성 PDF는 공개 API에서 절대 반환하지 않는다.
- 미공개 프로젝트에만 연결된 미디어는 공개 URL로 읽을 수 없다.
- 프런트엔드 화면 숨김이 아니라 백엔드가 최종 권한 경계가 된다.

## 3. 전체 아키텍처

```text
Browser
  │
  ├─ Public pages: /, /projects, /projects/[slug], /about, /contact
  ├─ Admin pages:  /admin/**
  │
  ▼
Next.js 16 + React 19
  ├─ App Router
  ├─ TanStack Query
  ├─ cookie credential API client
  └─ Tailwind CSS
  │  HTTP/JSON + cookies + CSRF header
  ▼
Spring Boot 4 + Java 21
  ├─ Spring Security
  ├─ Controller → Service → Repository
  ├─ Bean Validation
  ├─ JPA + Flyway
  ├─ MediaStorage abstraction
  └─ PDFBox resume renderer
  │
  ├─ PostgreSQL: 사용자, 콘텐츠, 관계, 파일 메타데이터
  └─ Local/S3 storage: 이미지와 PDF 바이너리
```

PostgreSQL에는 파일 바이너리를 저장하지 않습니다. DB에는 파일명, 저장 키, MIME, 크기, 이미지 치수, 대체 텍스트와 연결 관계만 저장합니다.

## 4. 저장소 구조

```text
YM_PF/
├─ PROJECT_SPEC.md              전체 요구사항과 인수 조건
├─ AGENTS.md                    개발·검증·보안 규칙
├─ README.md                    실행과 운영 진입점
├─ .env.example                환경 변수 예시
├─ docker-compose.yml          PostgreSQL + Backend + Frontend
├─ render.yaml                 Render 백엔드 배포 메타데이터
├─ docs/
│  ├─ PROJECT_GUIDE.md         현재 문서
│  ├─ security.md              보안 원칙
│  └─ deployment.md            Vercel/Render/Neon 배포 안내
├─ .github/workflows/ci.yml    CI 품질 게이트
├─ frontend/                   Next.js 애플리케이션
└─ backend/                    Spring Boot API
```

### 4.1 프런트엔드 구조

```text
frontend/
├─ e2e/core-flows.spec.ts
├─ playwright.config.ts
├─ src/
│  ├─ app/                     URL과 App Router 페이지
│  │  ├─ page.tsx              공개 홈
│  │  ├─ projects/             공개 프로젝트 목록·상세
│  │  ├─ about/                경력·교육·기술·자격증
│  │  ├─ contact/              연락처
│  │  └─ admin/
│  │     ├─ login/             관리자 로그인
│  │     └─ (protected)/       인증된 관리자 전용 페이지 그룹
│  ├─ features/
│  │  ├─ auth/                 인증 API, 로그인, Route Guard
│  │  └─ content/              공개·관리자 콘텐츠 UI와 API
│  ├─ components/
│  │  ├─ layout/               공개·관리자 공통 레이아웃
│  │  └─ ui/                   작은 재사용 UI
│  ├─ lib/query-client.ts      TanStack Query 기본 정책
│  └─ test/                    RTL 테스트 유틸리티
├─ Dockerfile
└─ package.json
```

### 4.2 백엔드 구조

```text
backend/src/main/java/com/ympf/portfolio/
├─ auth/                       사용자, JWT, Refresh Session, 쿠키
├─ profile/                    프로필 Entity/Repository
├─ experience/                 경력 Entity/Repository
├─ education/                  교육 Entity/Repository
├─ certificate/                자격증 Entity/Repository
├─ skill/                      기술 Entity/Repository
├─ portfolio/                  공통 콘텐츠 CRUD와 공개 조회
├─ project/                    프로젝트, 상태, 문제 해결 기록
├─ media/                      파일 검증, 저장소, 프로젝트 미디어
├─ resume/                     회사별 이력서와 PDF
├─ dashboard/                  관리자 요약 정보
└─ common/
   ├─ config/                  Security/CORS 설정
   ├─ exception/               공통 예외 처리
   ├─ persistence/             공통 감사 필드
   ├─ response/                오류·페이지 응답
   ├─ security/                401/403 JSON 처리
   └─ validation/              SafeText/HttpsUrl
```

백엔드는 기능별 패키지를 사용합니다. 각 기능 안에서 역할은 다음처럼 분리됩니다.

- Controller: HTTP 경로, 상태 코드, DTO 입출력
- Service: 트랜잭션과 비즈니스 규칙
- Repository: 데이터 조회와 저장
- Entity: DB 상태와 도메인 상태 변경
- DTO: API 계약, Bean Validation

JPA Entity를 API 응답으로 직접 반환하지 않는 것이 중요한 설계 원칙입니다.

## 5. 사용 기술과 역할

### Frontend

| 기술 | 현재 역할 |
|---|---|
| TypeScript 5.9 | API와 UI 데이터 타입 검사 |
| Next.js 16 App Router | URL, 레이아웃, 정적/동적 페이지 |
| React 19 | 화면과 상호작용 |
| Tailwind CSS 4 | 반응형 레이아웃과 디자인 토큰 |
| TanStack Query 5 | 서버 상태, 캐시, mutation 이후 무효화 |
| React Hook Form + Zod | 로그인 폼의 입력 검증 |
| FormData + React state | 콘텐츠·프로젝트·미디어·이력서 편집 폼 |
| Vitest + RTL | 컴포넌트와 API 클라이언트 테스트 |
| Playwright + axe | 실제 Chromium 흐름, 모바일, 접근성 |

TanStack Query 기본 설정은 [`query-client.ts`](../frontend/src/lib/query-client.ts)에 있습니다. 조회는 30초 동안 fresh 상태이고 한 번 재시도하며, mutation은 자동 재시도하지 않습니다.

### Backend

| 기술 | 현재 역할 |
|---|---|
| Java 21 | 백엔드 언어와 Gradle toolchain |
| Spring Boot 4.1 | 애플리케이션 구성과 실행 |
| Spring Web MVC | REST Controller |
| Spring Data JPA | Entity와 Repository |
| Spring Security | 인증, 권한, CORS, CSRF |
| Bean Validation | DTO 입력 검증 |
| PostgreSQL 17 | 관계형 데이터 저장 |
| Flyway | 버전 순서가 있는 스키마 관리 |
| springdoc-openapi | `/v3/api-docs`, Swagger UI |
| AWS SDK S3 | S3 호환 객체 저장소 구현 |
| PDFBox | 한글 이력서 PDF 생성 |
| JUnit 5 + Mockito | 단위·통합 테스트 |
| Testcontainers | 실제 PostgreSQL 통합 테스트 |

## 6. 프런트엔드 URL과 화면

### 공개 화면

| URL | 코드 진입점 | 설명 |
|---|---|---|
| `/` | `src/app/page.tsx` | Hero, 공개 프로젝트, 관리자 바로가기 |
| `/projects` | `src/app/projects/page.tsx` | 공개 프로젝트 목록 |
| `/projects/[slug]` | `src/app/projects/[slug]/page.tsx` | Case Study 상세 |
| `/about` | `src/app/about/page.tsx` | 경력, 교육, 기술, 자격증 |
| `/contact` | `src/app/contact/page.tsx` | 이메일, GitHub, LinkedIn |

### 관리자 화면

| URL | 주요 컴포넌트 | 설명 |
|---|---|---|
| `/admin/login` | `LoginForm` | 관리자 로그인 |
| `/admin` | `AdminDashboard` | 콘텐츠 현황 |
| `/admin/profile` | `AdminProfile` | 공개 프로필 |
| `/admin/experiences` | `AdminCollection` | 경력 CRUD |
| `/admin/educations` | `AdminCollection` | 교육 CRUD |
| `/admin/skills` | `AdminCollection` | 기술 CRUD |
| `/admin/certificates` | `AdminCollection` | 자격증 CRUD |
| `/admin/projects` | `AdminProjects` | 프로젝트 목록·상태 |
| `/admin/projects/new` | `AdminProjectEditor` | 프로젝트 생성 |
| `/admin/projects/[id]` | `AdminProjectEditor` | 프로젝트 편집 |
| `/admin/media` | `AdminMediaManager` | 업로드·연결·순서 |
| `/admin/resumes` | `AdminResumes` | 회사별 이력서 목록 |
| `/admin/resumes/new` | `AdminResumeEditor` | 이력서 생성 |
| `/admin/resumes/[id]` | `AdminResumeEditor` | 이력서 편집 |
| `/admin/resumes/[id]/preview` | `AdminResumePreview` | 이력서 미리보기 |

공개 헤더의 `관리자` 링크는 `/admin`으로 연결됩니다. 인증되지 않은 경우 `AuthGate`가 `/admin/login?next=...`으로 보내며, 로그인 후 원래 페이지로 돌아갑니다.

## 7. 프런트엔드 데이터 흐름

예를 들어 프로젝트 목록을 읽는 흐름은 다음과 같습니다.

```text
/projects/page.tsx
  → PublicProjects
  → useQuery(["public", "projects"])
  → contentApi.publicProjects()
  → apiJson("/api/public/projects")
  → Spring PublicProjectController
```

주요 파일은 다음 순서로 읽으면 좋습니다.

1. [`content/types.ts`](../frontend/src/features/content/types.ts): 화면이 기대하는 타입
2. [`content/api.ts`](../frontend/src/features/content/api.ts): 백엔드 경로 매핑
3. 공개 또는 관리자 컴포넌트: Query와 mutation 사용법
4. `src/app/**/page.tsx`: URL과 기능 컴포넌트 연결

조회에는 `useQuery`, 생성·수정·삭제에는 `useMutation`을 사용합니다. 성공한 mutation은 관련 query key를 invalidate하거나 `setQueryData`로 캐시를 갱신합니다.

## 8. 인증 흐름

### 8.1 최초 관리자 생성

백엔드 시작 시 사용자가 하나도 없고 `ADMIN_EMAIL`, `ADMIN_PASSWORD`가 모두 설정된 경우에만 관리자 계정을 만듭니다.

- 이메일은 정규화해 저장
- 비밀번호는 BCrypt cost 12
- 비밀번호는 12자 이상, BCrypt 제한 때문에 UTF-8 72바이트 이하
- 계정 생성 후 운영 환경에서는 `ADMIN_PASSWORD` 제거 권장

### 8.2 로그인

```text
LoginForm
  → GET /api/auth/csrf
  → POST /api/auth/login + X-XSRF-TOKEN
  → BCrypt 비밀번호 검증
  → Access JWT + Refresh Token 발급
  → HttpOnly cookie 설정
```

존재하지 않는 이메일에도 dummy BCrypt hash를 검증해 계정 존재 여부에 따른 시간 차이를 줄입니다. 로그인 오류는 구체적인 실패 원인을 노출하지 않습니다.

### 8.3 Access Token

- JWT HMAC 서명
- subject, role, issuer, audience, 만료 검증
- HttpOnly cookie에서만 읽음
- 요청마다 DB 사용자 존재·활성·역할을 다시 확인
- 브라우저 `localStorage`와 `sessionStorage`에 저장하지 않음

### 8.4 Refresh Token

- `SecureRandom`으로 원문 생성
- DB에는 SHA-256 해시만 저장
- refresh 시 행 잠금 조회 후 기존 session 폐기
- 새 Refresh Token으로 회전
- 같은 토큰 replay 거부
- logout 시 session 폐기와 cookie 삭제

### 8.5 프런트 API 클라이언트

[`features/auth/api.ts`](../frontend/src/features/auth/api.ts)는 다음을 중앙 처리합니다.

- 모든 요청에 `credentials: "include"`
- mutation 전에 CSRF token 확보
- 401이면 Refresh 요청을 한 번만 공유하는 single-flight 처리
- refresh 성공 후 원 요청 한 번 재시도
- 재시도도 401이면 무한 반복하지 않음
- 공통 `ApiError`로 status, code, fieldErrors 전달

## 9. 백엔드 보안 경계

[`SecurityConfig`](../backend/src/main/java/com/ympf/portfolio/common/config/SecurityConfig.java)의 정책은 다음과 같습니다.

```text
OPTIONS /**                         permitAll
/actuator/health, OpenAPI           permitAll
/api/auth/csrf|login|refresh|logout permitAll
GET /api/public/**                  permitAll
/api/admin/**                       ROLE_ADMIN
/api/auth/me                        authenticated
그 밖의 요청                        denyAll
```

추가 방어:

- CORS는 설정된 정확한 HTTP(S) origin만 허용하고 wildcard를 거부
- cookie 기반 요청에 CSRF 보호
- 세션 정책은 STATELESS
- 401과 403을 일관된 JSON 오류로 반환
- `SafeText`는 `<`, `>`, NUL과 위험한 control 문자를 차단
- `HttpsUrl`은 사용자 정보가 없는 HTTPS URL만 허용
- 예외는 `GlobalExceptionHandler`에서 공통 오류 형식으로 변환

공통 오류 형식:

```json
{
  "code": "VALIDATION_FAILED",
  "message": "Request validation failed",
  "fieldErrors": [
    { "field": "title", "message": "must not be blank" }
  ],
  "timestamp": "2026-07-13T00:00:00Z"
}
```

## 10. 포트폴리오 콘텐츠와 프로젝트

프로필, 경력, 교육, 기술, 자격증 CRUD는 `portfolio` 패키지의 Controller와 Service가 조정하고 각 도메인 Repository를 사용합니다.

프로젝트는 다음 관계를 가집니다.

```text
Project 1 ── N ProjectSkill N ── 1 Skill
Project 1 ── N ProjectProblemSolution
Project 1 ── N ProjectMedia N ── 1 MediaFile
```

프로젝트 상태:

```text
DRAFT ───────── publish ────────> PUBLISHED
DRAFT/PUBLISHED ── archive ─────> ARCHIVED
ARCHIVED ────── publish(재검증) ─> PUBLISHED
```

초안은 처음 공개할 수 있고, 공개 프로젝트는 보관할 수 있습니다. 보관된 프로젝트도 공개 필수 필드를 다시 검증한 뒤 재공개할 수 있습니다.

프로젝트 공개 전 Service가 다음을 확인합니다.

- 배경, 문제, 목표, 역할, 담당 업무
- 구현, 기술적 의사결정, 결과, 한계, 회고
- 시작일과 팀 규모
- 하나 이상의 공개 기술

공개 조회는 Repository 단계에서 `PUBLISHED`만 검색합니다. 공개 DTO에는 UUID, 상태, 생성·수정일 같은 관리자 필드를 넣지 않습니다. 목록 관계 데이터는 프로젝트 ID 목록으로 한 번에 조회해 N+1을 줄입니다.

## 11. 미디어 설계

`MediaStorage` 인터페이스는 다음 세 동작만 정의합니다.

```text
store(key, bytes, contentType)
read(key)
delete(key)
```

구현체:

- `LocalMediaStorage`: 로컬 개발과 Docker volume
- `S3MediaStorage`: AWS S3 또는 S3 호환 객체 저장소

업로드 검증 순서:

1. 원본 파일명에서 경로 제거
2. 허용 확장자 `.png`, `.jpg`, `.jpeg` 확인
3. 최대 크기 확인, 기본값 5MB
4. 선언 MIME 확인
5. PNG/JPEG magic byte 확인
6. 확장자·선언 MIME·탐지 MIME 일치 확인
7. `ImageIO` 실제 디코딩
8. width/height 한도 확인
9. 서버가 날짜와 UUID 기반 storage key 생성
10. 바이너리 저장 후 DB 메타데이터 저장

프로젝트에는 검증된 이미지만 연결할 수 있습니다. `COVER`는 프로젝트당 하나만 허용하고, 같은 파일 중복 연결을 막습니다.

공개 미디어 URL은 해당 파일이 `PUBLISHED` 프로젝트에 연결됐을 때만 읽을 수 있습니다. 프로젝트나 이력서가 사용하는 파일은 먼저 관계를 해제해야 삭제할 수 있습니다.

## 12. 회사별 이력서와 PDF

```text
Resume 1 ── N ResumeExperience N ── 1 Experience
Resume 1 ── N ResumeProject    N ── 1 Project
Resume 1 ── N ResumeSkill      N ── 1 Skill
Resume N ── 0..1 profile MediaFile
Resume N ── 0..1 PDF MediaFile
```

선택 관계는 표시 순서를 저장하며, 경력 설명과 프로젝트 요약은 이력서별로 덮어쓸 수 있습니다. 원본 경력과 프로젝트는 변경하지 않습니다.

이력서 상태:

```text
DRAFT ── ready ──> READY ── submit ──> SUBMITTED
  │                   │                     │
  └───────────────────┴─────────────────────┴──> ARCHIVED
```

상태 규칙:

- `READY`: 경력 또는 프로젝트 하나 이상, 기술 하나 이상 필요
- `SUBMITTED`: READY 상태이고 생성된 PDF가 있어야 함
- `SUBMITTED`, `ARCHIVED`: 일반 편집 불가
- `ARCHIVED`: PDF 재생성 불가

PDF 생성 흐름:

```text
ResumeService
  → ResumeDetailResponse 구성
  → Profile 조회
  → ResumePdfRenderer(PDFBox)
  → 한글 TTF 탐색
  → byte[] 생성
  → MediaStorage에 private PDF 저장
  → MediaFile 메타데이터와 Resume 연결
```

폰트 탐색 순서:

1. `RESUME_PDF_FONT_PATH`
2. Windows Malgun Gothic
3. Docker 이미지의 NanumGothic

## 13. 데이터베이스와 Flyway

`spring.jpa.hibernate.ddl-auto=validate`이므로 Hibernate가 운영 스키마를 임의 생성하지 않습니다. 모든 변경은 다음 Flyway 파일로 관리됩니다.

| Migration | 주요 내용 |
|---|---|
| `V1__create_auth_tables.sql` | users, refresh_sessions |
| `V2__create_portfolio_content.sql` | profile, 경력, 교육, 자격증, 기술, 프로젝트 |
| `V3__create_media_tables.sql` | media_files, project_media |
| `V4__create_resume_tables.sql` | resumes와 선택 관계, PDF 지원 |

DB 제약 조건도 비즈니스 규칙의 마지막 방어선입니다.

- 이메일 정규화와 유일성
- 프로젝트 slug 정규식과 유일성
- 프로젝트·이력서 상태 enum 값
- 날짜 범위와 표시 순서
- 기술 이름 대소문자 무시 유일성
- 프로젝트당 하나의 COVER partial unique index
- 참조 중인 원본 콘텐츠는 FK `RESTRICT`

새 컬럼이나 테이블을 추가할 때 기존 migration을 수정하지 말고 다음 번호의 migration을 추가해야 합니다.

## 14. 주요 API

### 인증

```text
GET  /api/auth/csrf
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### 공개

```text
GET /api/public/profile
GET /api/public/experiences
GET /api/public/educations
GET /api/public/skills
GET /api/public/certificates
GET /api/public/projects
GET /api/public/projects/{slug}
GET /api/public/media/{id}/content
```

### 관리자

```text
/api/admin/profile
/api/admin/experiences
/api/admin/educations
/api/admin/skills
/api/admin/certificates
/api/admin/projects
/api/admin/media
/api/admin/resumes
/api/admin/dashboard
```

세부 API 계약은 실행 후 <http://localhost:8080/swagger-ui.html>에서 확인합니다.

## 15. 테스트 전략

### 백엔드

테스트는 실제 `postgres:17-alpine` Testcontainer를 사용합니다.

- Health endpoint
- Flyway 스키마와 인덱스
- BCrypt 관리자 bootstrap
- JWT issuer/audience/만료/변조
- 로그인 성공·실패와 일반화된 오류
- CSRF, CORS, cookie 속성
- Refresh rotation과 replay 차단
- 관리자 권한 경계
- 콘텐츠 CRUD와 공개 필터
- 파일 magic/MIME/확장자/치수 검증
- 미디어 공개 조건과 사용 중 삭제 차단
- 이력서 CRUD, 복제, 선택, PDF, 상태
- 공개 이력서 API 부재
- OpenAPI 경로

### 프런트엔드

Vitest/RTL은 다음을 검증합니다.

- 인증 API의 cookie, CSRF, single-flight refresh
- 로그인 입력 검증과 안전한 redirect
- AuthGate가 인증 전 관리자 UI를 숨기는지
- logout 캐시 정리
- 공개 홈 empty state
- 미지원 업로드 사전 거부
- 이력서 기술 순서 보존

Playwright는 API를 결정적 fixture로 대체하고 다음 환경에서 실행합니다.

- Desktop Chromium
- Pixel 7
- 360px 모바일 viewport

공개 흐름, 관리자 로그인, 가로 overflow, WCAG A/AA serious·critical 위반을 검사합니다. Playwright는 전용 포트 3100을 사용해 기존 개발 서버를 잘못 재사용하지 않습니다.

## 16. Docker와 CI

Docker Compose 서비스:

- `postgres`: 영속 volume과 `pg_isready`
- `backend`: Java 21, NanumGothic, 비root 사용자, Actuator healthcheck
- `frontend`: Next.js standalone, 비root 사용자, HTTP healthcheck

GitHub Actions job:

- `frontend-check`: install, lint, typecheck, test, build
- `backend-check`: test, check, bootJar
- `docker-check`: config, build, up, health, cleanup
- `e2e-check`: Chromium 설치와 Playwright

## 17. 환경 변수 읽는 법

시작점은 [`.env.example`](../.env.example)입니다.

| 그룹 | 대표 변수 |
|---|---|
| DB | `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` |
| JWT | `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE` |
| Token | `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL` |
| Cookie | `COOKIE_SECURE`, `COOKIE_SAME_SITE` |
| Bootstrap | `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| CORS | `ALLOWED_ORIGINS` |
| Media | `MEDIA_STORAGE_PROVIDER`, `MEDIA_STORAGE_*` |
| PDF | `RESUME_PDF_FONT_PATH` |
| Frontend | server-only `API_PROXY_TARGET` for the same-origin `/api` rewrite |

로컬 `.env`는 Git에 커밋하지 않습니다. 브라우저에 공개되는 변수는 `NEXT_PUBLIC_` 접두사가 있는 값뿐이어야 합니다.

## 18. 추천 코드 읽기 순서

### 1단계: 사용자 화면에서 시작

1. `frontend/src/app/page.tsx`
2. `frontend/src/features/content/public-home.tsx`
3. `frontend/src/features/content/api.ts`
4. `backend/.../portfolio/PublicPortfolioController.java`
5. `backend/.../project/PublicProjectController.java`

목표: URL 하나가 어떤 API를 호출하는지 이해합니다.

### 2단계: CRUD 한 개 추적

기술 관리(`/admin/skills`)를 고릅니다.

1. App Router page
2. `AdminCollection`
3. `contentApi.create/update/remove`
4. `AdminPortfolioController`
5. `PortfolioService`
6. `SkillRepository`, `Skill`
7. `V2__create_portfolio_content.sql`

목표: UI 입력이 DB row가 되는 전체 흐름을 이해합니다.

### 3단계: 인증 추적

1. `login-form.tsx`
2. `features/auth/api.ts`
3. `AuthController.java`
4. `AuthService.java`
5. `JwtTokenService.java`, `RefreshTokenService.java`
6. `SecurityConfig.java`, `JwtAuthenticationFilter.java`
7. `AuthIntegrationTest.java`

목표: cookie, CSRF, Access/Refresh 역할을 설명할 수 있어야 합니다.

### 4단계: 프로젝트 상태와 관계

1. `admin-project-editor.tsx`
2. `ProjectDtos.java`
3. `ProjectService.java`
4. Project/ProjectSkill/ProjectProblemSolution Entity
5. Repository의 공개·관리자 query
6. `PortfolioContentIntegrationTest.java`

목표: DRAFT와 PUBLISHED가 어디에서 분리되는지 찾습니다.

### 5단계: 파일 시스템 경계

1. `admin-media.tsx`
2. `AdminMediaController.java`
3. `MediaService.java`
4. `MediaStorage.java`
5. Local/S3 구현체
6. `MediaIntegrationTest.java`

목표: 파일 검증, 바이너리 저장, DB 메타데이터 저장의 경계를 이해합니다.

### 6단계: 이력서 집계와 PDF

1. `admin-resume-editor.tsx`
2. `ResumeDtos.java`
3. `ResumeService.java`
4. 관계 Entity와 복합 ID
5. `ResumePdfRenderer.java`
6. `ResumeIntegrationTest.java`

목표: 기존 원본 데이터를 이력서별로 재구성하는 방법을 이해합니다.

## 19. 공부할 때 사용할 질문

각 기능을 읽을 때 다음 질문에 답해 보세요.

1. 이 URL의 page component는 무엇인가?
2. 서버 상태의 query key는 무엇인가?
3. 실제 API 경로와 HTTP method는 무엇인가?
4. Request/Response DTO는 Entity와 어떻게 다른가?
5. Service의 트랜잭션 경계는 어디인가?
6. DB 제약 조건은 어떤 잘못된 상태를 막는가?
7. 인증되지 않은 요청은 어디에서 차단되는가?
8. 공개 DTO에서 제거된 관리자 정보는 무엇인가?
9. 실패 시 어떤 error code와 status가 반환되는가?
10. 이 규칙을 증명하는 테스트는 어디에 있는가?

## 20. 추천 실습 과제

### 초급

- 공개 홈 Hero 기본 문구를 본인 문구로 변경하고 테스트 갱신
- 기술 카테고리별 표시 색상 추가
- empty state 문구와 스타일 개선
- 관리자 대시보드 카드에 상태 설명 추가

### 중급

- 프로젝트 목록에 기술 filter UI 연결
- 관리자 목록에 검색과 pagination UI 추가
- 프로젝트 미리보기 화면 추가
- 미디어 업로드 progress와 drag-and-drop 추가

### 고급

- 실제 백엔드를 연결한 Playwright 별도 suite
- 관리자 비밀번호 변경 기능
- 이력서 공유용 만료 링크를 별도 Phase로 설계
- S3 presigned upload를 도입할 때의 보안·트랜잭션 설계
- OWASP Dependency Check 같은 백엔드 CVE 자동 점검

## 21. 기능을 추가하는 표준 절차

1. `PROJECT_SPEC.md`와 `AGENTS.md` 확인
2. API/DB/UI 영향 정리
3. DB 변경이면 새 Flyway migration 작성
4. Request/Response DTO와 validation 작성
5. Repository query 작성
6. Service에 트랜잭션과 비즈니스 규칙 작성
7. Controller 연결
8. 프런트 타입과 API client 연결
9. loading, empty, error, 접근성 상태 구현
10. 단위·통합·E2E 테스트 추가
11. lint, typecheck, test, build, Docker 검증
12. 전체 diff에서 권한·공개 데이터·비밀값 재검토

## 22. 실행과 검증 명령

### 전체 Docker 실행

```powershell
Set-Location C:\YM_portfolio\YM_PF
Copy-Item .env.example .env
# .env의 CHANGE_ME와 관리자 값을 로컬 값으로 수정
docker compose --env-file .env up -d --build --wait
```

### 프런트엔드

```powershell
Push-Location C:\YM_portfolio\YM_PF\frontend
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm playwright test
Pop-Location
```

### 백엔드

```powershell
Push-Location C:\YM_portfolio\YM_PF\backend
.\gradlew.bat test check bootJar --no-daemon
Pop-Location
```

### 서비스 상태

```powershell
docker compose --env-file .env ps
docker compose --env-file .env logs -f backend
docker compose --env-file .env logs -f frontend
```

접속 주소:

- 공개 사이트: <http://localhost:3000>
- 관리자: <http://localhost:3000/admin>
- 백엔드 health: <http://localhost:8080/actuator/health>
- Swagger UI: <http://localhost:8080/swagger-ui.html>

## 23. 현재 제한사항과 다음 선택지

필수 범위는 완료됐지만 다음은 운영 또는 확장 작업입니다.

- `.env`를 만들고 본인 관리자 계정과 콘텐츠 입력
- 실제 Vercel/Render/Neon/S3 연결과 도메인 설정
- 서로 다른 사이트 도메인에서 cookie 정책 실환경 검증
- 실제 API를 사용하는 full browser E2E 추가
- 백엔드 의존성 CVE scanner를 CI에 추가
- 단일 관리자 모델을 다중 사용자 권한 모델로 확장
- 이력서 공유 링크, 만료, 비밀번호 보호 기능

이 항목들은 현재 구현이 불완전해서 남은 것이 아니라 MVP 이후에 선택할 수 있는 운영·확장 범위입니다.
