# YM_PF 포트폴리오·회사별 이력서 관리 서비스 요구사항

## 0. 이 문서의 목적

이 문서는 `yoonmo01/YM_PF` 저장소에서 개발할 포트폴리오 및 회사별 이력서 관리 서비스의 단일 기준 문서다.

Codex는 구현을 시작하기 전에 이 문서 전체를 읽고 다음 원칙을 따른다.

1. 명시된 기술 스택과 제품 범위를 임의로 변경하지 않는다.
2. 한 번에 전체 기능을 구현하지 않고 이 문서의 Phase 순서대로 진행한다.
3. 각 Phase마다 테스트, 빌드, 자체 코드 리뷰를 수행한다.
4. 검증하지 못한 항목은 완료로 표시하지 않는다.
5. 기존 사용자 변경사항과 관련 없는 파일을 보존한다.
6. `main` 브랜치에 직접 작업하지 않고 기능별 브랜치와 Pull Request를 사용한다.

---

## 1. 프로젝트 개요

### 1.1 프로젝트명

YM_PF / Portfolio Hub

### 1.2 프로젝트 목표

개발자가 자신의 소개, 경력, 기술 스택과 프로젝트 사례를 외부에 공개하고, 로그인 후 지원 회사와 포지션에 맞는 이력서를 별도로 작성하고 관리할 수 있는 풀스택 웹 서비스다.

이 프로젝트는 다음 두 가지 목적을 가진다.

1. 실제 취업 활동에 사용할 수 있는 개인 포트폴리오 및 이력서 관리 도구를 만든다.
2. 국내 개발자 채용공고에서 반복적으로 요구되는 기술 스택을 실제 서비스 수준으로 경험한다.

### 1.3 핵심 가치

- 공개 포트폴리오와 개인용 취업 관리 기능을 분리한다.
- 단순 기술 나열이 아니라 문제, 역할, 해결 과정과 결과를 보여준다.
- 회사와 포지션에 따라 서로 다른 이력서를 작성하고 관리한다.
- 프로젝트 이미지, 화면 캡처, 아키텍처와 PDF를 체계적으로 관리한다.
- 테스트, CI, Docker, 배포까지 포함한 완성도 있는 포트폴리오 프로젝트로 만든다.

---

## 2. 확정 기술 스택

### 2.1 Frontend

- TypeScript
- Next.js App Router
- React
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- 필요 시 Zustand
- Vitest 또는 Jest
- React Testing Library
- Playwright

### 2.2 Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- Bean Validation
- PostgreSQL Driver
- Flyway
- springdoc-openapi / Swagger UI
- JUnit 5
- Mockito
- Testcontainers

### 2.3 Database

- PostgreSQL
- 로컬: Docker PostgreSQL
- 운영: Neon PostgreSQL 무료 플랜 우선 검토

### 2.4 Infrastructure

- Docker
- Docker Compose
- GitHub Actions

### 2.5 Deployment

- Frontend: Vercel
- Backend: Render 또는 다른 무료·저비용 Docker 호스팅
- Database: Neon PostgreSQL
- Media: 객체 스토리지 서비스

운영 서비스는 특정 공급자에 강하게 결합하지 않는다. 이미지 저장 기능은 `MediaStorage` 인터페이스로 추상화해 공급자를 교체할 수 있게 한다.

### 2.6 현재 도입하지 않는 기술

명확한 필요가 생기기 전까지 다음 기술을 도입하지 않는다.

- Kubernetes
- Kafka
- MSA
- Elasticsearch
- Jenkins
- Redis
- 복수 OAuth 공급자

Redis는 Refresh Token, Rate Limiting 또는 캐싱 요구가 실제로 생겼을 때 별도 Phase로 검토한다.

---

## 3. 사용자 구분

## 3.1 공개 방문자

채용담당자, 면접관, 개발자 또는 일반 방문자다.

공개 방문자는 다음 기능을 사용할 수 있다.

- 개발자 소개 조회
- 경력과 활동 조회
- 기술 스택 조회
- 공개된 프로젝트 목록 조회
- 프로젝트 상세 사례 조회
- 프로젝트 대표 이미지 조회
- 프로젝트 본문 이미지와 아키텍처 조회
- GitHub, 배포 서비스 및 연락처 접근

공개 방문자는 다음 기능을 사용할 수 없다.

- 관리자 페이지 접근
- 회사별 이력서 조회
- 이력서 작성 및 수정
- 비공개 프로젝트 조회
- 임시저장 콘텐츠 조회
- 미공개 파일 조회

## 3.2 관리자

사이트 소유자 한 명을 전제로 한다.

관리자는 로그인 후 다음 기능을 사용할 수 있다.

- 프로필 관리
- 경력과 활동 관리
- 학력과 교육 관리
- 기술 스택 관리
- 자격증과 어학성적 관리
- 프로젝트 CRUD
- 프로젝트 공개 상태 관리
- 프로젝트 대표 이미지와 본문 이미지 관리
- 사진, PDF, 첨부파일 관리
- 회사 및 포지션별 이력서 CRUD
- 기존 이력서 복제
- 이력서 미리보기
- PDF 생성
- 제출 상태 관리

---

## 4. 사용자 흐름

## 4.1 공개 방문자 흐름

```text
사이트 접속
→ 개발자 소개와 대표 프로젝트 확인
→ 프로젝트 목록 확인
→ 프로젝트 상세 확인
→ 문제·역할·해결 과정·성과 확인
→ GitHub 또는 배포 서비스 확인
→ 연락처 확인
```

공개 화면에는 공통 이력서 메뉴를 제공하지 않는다.

공개 포트폴리오의 소개, 경력과 프로젝트가 지원자의 공개 프로필 역할을 담당한다. 회사별 이력서는 로그인한 관리자만 관리한다.

향후 필요하면 특정 이력서에 만료 가능한 비공개 공유 링크를 생성하는 기능을 별도 Phase로 추가할 수 있다.

## 4.2 관리자 프로젝트 관리 흐름

```text
로그인
→ 대시보드
→ 프로젝트 관리
→ 프로젝트 작성 또는 수정
→ 대표 이미지 등록
→ 본문 이미지·아키텍처 등록
→ 미리보기
→ 임시저장 또는 공개
```

## 4.3 관리자 회사별 이력서 흐름

```text
로그인
→ 회사별 이력서
→ 회사명과 포지션 입력
→ 채용공고 URL·마감일 입력
→ 기본 이력서 또는 기존 버전 복제
→ 맞춤 요약 작성
→ 포함할 경력과 프로젝트 선택
→ 기술 강조 순서 설정
→ 선택적 프로필 사진 등록
→ 미리보기
→ PDF 생성
→ 완료 또는 제출 상태 변경
```

---

## 5. 페이지 및 라우팅

## 5.1 공개 화면

| 화면 | URL | 주요 내용 |
|---|---|---|
| 홈 | `/` | Hero, 소개, 대표 프로젝트, 주요 경력, 기술, 연락 |
| 프로젝트 목록 | `/projects` | 전체 공개 프로젝트, 기술 필터 |
| 프로젝트 상세 | `/projects/[slug]` | 문제, 역할, 구현, 이미지, 성과, 회고 |
| 상세 소개 | `/about` | 경력, 학력, 교육, 기술, 자격증 |
| 연락 | `/contact` | 이메일, GitHub, 선택적 연락 폼 |

MVP에는 공개 `/resume` 페이지를 만들지 않는다.

## 5.2 관리자 화면

| 화면 | URL | 주요 내용 |
|---|---|---|
| 로그인 | `/admin/login` | 관리자 인증 |
| 대시보드 | `/admin` | 콘텐츠 현황과 최근 수정 |
| 프로젝트 목록 | `/admin/projects` | 프로젝트 검색과 상태 관리 |
| 프로젝트 작성 | `/admin/projects/new` | 신규 프로젝트 작성 |
| 프로젝트 수정 | `/admin/projects/[id]` | 기존 프로젝트 수정 |
| 프로필 | `/admin/profile` | 소개와 연락처 관리 |
| 경력 | `/admin/experiences` | 경력과 활동 관리 |
| 학력·교육 | `/admin/educations` | 학력과 교육 관리 |
| 기술 | `/admin/skills` | 기술 스택 관리 |
| 자격증 | `/admin/certificates` | 자격증과 어학 관리 |
| 파일 | `/admin/media` | 이미지, PDF, 첨부파일 관리 |
| 이력서 목록 | `/admin/resumes` | 회사별 이력서 목록 |
| 이력서 작성 | `/admin/resumes/new` | 신규 이력서 작성 |
| 이력서 수정 | `/admin/resumes/[id]` | 이력서 수정·미리보기·PDF |

---

## 6. 공개 화면 요구사항

## 6.1 홈

### Hero

- 이름
- 목표 직무
- 한 줄 소개
- 대표 프로젝트 이동 버튼
- GitHub 링크
- 연락 버튼

예시 문구:

```text
양윤모
Backend · Full-stack Developer

복잡한 데이터를 실제 사용 가능한 서비스로 만듭니다.
AI와 데이터 처리 경험을 바탕으로 문제를 구조화하고,
운영 가능한 웹 서비스로 구현합니다.
```

### 대표 프로젝트

- 대표 프로젝트 3~4개
- 대표 이미지
- 프로젝트명
- 한 줄 설명
- 역할
- 핵심 기술 4~6개
- 대표 성과
- 상세 이동
- 선택적으로 GitHub·Demo 링크

### 경력과 활동

- 시간순 타임라인
- 기간
- 소속 또는 프로젝트
- 역할
- 핵심 성과

### 기술 스택

퍼센트나 별점으로 숙련도를 표현하지 않는다.

다음과 같이 목적별로 분류한다.

- Backend
- Frontend
- Database
- Infrastructure
- AI

기술을 선택하면 해당 기술을 사용한 프로젝트를 확인할 수 있게 확장할 수 있다.

## 6.2 프로젝트 목록

- PUBLISHED 상태 프로젝트만 표시
- 대표 이미지가 없으면 접근 가능한 Placeholder 표시
- 기술 스택 필터
- 최신순·대표순 정렬
- 모바일 카드 레이아웃
- 빈 상태와 오류 상태 제공

## 6.3 프로젝트 상세

프로젝트 상세는 다음 순서로 구성한다.

1. 프로젝트 요약
2. 기간, 인원, 역할, 상태
3. 문제 정의
4. 목표와 요구사항
5. 담당 업무
6. 기술 선택 이유
7. 시스템 아키텍처
8. 핵심 구현
9. 문제 해결 사례
10. 검증 및 성과
11. 한계와 회고
12. 이미지 갤러리
13. GitHub·Demo 링크

문제 해결 사례는 가능한 경우 다음 형식을 사용한다.

```text
문제
→ 원인 분석
→ 해결 방법
→ 검증 결과
```

검증하지 않은 수치나 성과를 임의로 작성하지 않는다.

---

## 7. 관리자 기능 요구사항

## 7.1 대시보드

MVP 대시보드에는 다음 정보를 표시한다.

- 공개 프로젝트 수
- 임시저장 프로젝트 수
- 저장된 파일 수
- 회사별 이력서 수
- 최근 수정 콘텐츠
- 빠른 프로젝트 추가
- 빠른 이력서 추가
- 공개 사이트 미리보기

실제 의미가 없는 장식용 차트는 만들지 않는다.

## 7.2 프로젝트 관리

프로젝트 필드:

- 제목
- slug
- 한 줄 설명
- 프로젝트 배경
- 문제 정의
- 목표
- 담당 역할
- 담당 업무
- 핵심 구현
- 기술 선택 이유
- 문제 해결 사례
- 검증 및 성과
- 한계와 회고
- 시작일
- 종료일
- 팀 규모
- GitHub URL
- Demo URL
- 대표 여부
- 공개 상태
- 표시 순서
- 생성일
- 수정일

프로젝트 상태:

- `DRAFT`
- `PUBLISHED`
- `ARCHIVED`

공개 API는 `PUBLISHED` 상태만 반환한다.

## 7.3 파일과 이미지 관리

프로젝트는 다음 미디어를 지원한다.

- 대표 이미지 1개
- 본문 이미지 여러 개
- 시스템 아키텍처 이미지
- 대시보드 화면
- 결과 화면
- 선택적 Demo 영상 URL
- PDF 첨부파일

이미지 기능:

- 업로드 전 확장자와 MIME 검증
- 파일 크기 제한
- 이미지 크기 또는 비율 검증
- 대체 텍스트 필수
- 캡션 선택 입력
- 표시 순서 변경
- 대표 이미지 지정
- 미사용 파일 확인
- 삭제 전 사용 위치 경고

PostgreSQL에 이미지나 PDF 바이너리를 직접 저장하지 않는다.

PostgreSQL에는 다음 메타데이터만 저장한다.

- 원본 파일명
- 저장 키
- 공개 또는 서명 URL 생성에 필요한 정보
- MIME type
- 파일 크기
- 이미지 width와 height
- 대체 텍스트
- 캡션
- 표시 순서
- 연결 대상
- 생성일

로컬 개발에서는 저장소 인터페이스의 Local 구현 또는 테스트용 저장소를 사용하고, 운영에서는 객체 스토리지 구현을 사용한다.

## 7.4 회사별 이력서 관리

이력서는 관리자 전용 데이터다.

이력서 필드:

- 이력서 제목
- 회사명
- 포지션명
- 채용공고 URL
- 마감일
- 맞춤 요약
- 선택된 경력
- 선택된 프로젝트
- 기술 강조 순서
- 선택적 프로필 이미지
- 메모
- 상태
- 생성된 PDF 파일
- 생성일
- 수정일
- 제출일

이력서 상태:

- `DRAFT`
- `READY`
- `SUBMITTED`
- `ARCHIVED`

기능:

- 신규 이력서 작성
- 기본 데이터 불러오기
- 기존 이력서 복제
- 프로젝트 선택
- 경력 선택
- 순서 변경
- 지원처 맞춤 요약 작성
- 선택적 프로필 사진
- 미리보기
- PDF 생성
- 상태 변경

회사별 이력서 데이터와 PDF는 공개 API에서 절대 노출하지 않는다.

향후 선택적 확장:

- 만료 가능한 공유 링크
- 비밀번호가 있는 공유 링크
- 열람 이력
- 채용공고 원문 보관
- 면접 일정과 결과

이 확장 기능은 MVP에 포함하지 않는다.

---

## 8. 데이터 모델 초안

정확한 컬럼과 제약조건은 구현 전에 ERD와 함께 검토한다.

## 8.1 사용자 및 프로필

### users

- id
- email
- password_hash
- role
- enabled
- created_at
- updated_at

### profiles

- id
- user_id
- name
- headline
- short_bio
- long_bio
- email
- github_url
- linkedin_url
- profile_media_id
- created_at
- updated_at

## 8.2 경력·교육·기술

### experiences

- id
- organization
- title
- description
- start_date
- end_date
- is_current
- display_order
- created_at
- updated_at

### educations

- id
- institution
- program
- description
- start_date
- end_date
- display_order

### certificates

- id
- name
- issuer
- issued_date
- expires_date
- credential_url
- score
- display_order

### skills

- id
- name
- category
- display_order
- is_visible

## 8.3 프로젝트

### projects

- id
- slug
- title
- summary
- background
- problem
- goal
- role
- responsibilities
- implementation
- technical_decisions
- results
- limitations
- retrospective
- start_date
- end_date
- team_size
- github_url
- demo_url
- status
- featured
- display_order
- created_at
- updated_at

### project_skills

- project_id
- skill_id
- display_order

### project_problem_solutions

- id
- project_id
- problem
- cause
- solution
- verification
- display_order

## 8.4 미디어

### media_files

- id
- original_name
- storage_key
- mime_type
- file_size
- width
- height
- alt_text
- caption
- created_at
- updated_at

### project_media

- id
- project_id
- media_id
- media_role
- display_order

media_role 예시:

- `COVER`
- `CONTENT`
- `ARCHITECTURE`
- `DASHBOARD`
- `RESULT`

## 8.5 회사별 이력서

### resumes

- id
- title
- company_name
- position_name
- job_posting_url
- deadline
- custom_summary
- profile_media_id
- notes
- status
- pdf_media_id
- submitted_at
- created_at
- updated_at

### resume_experiences

- resume_id
- experience_id
- display_order
- custom_description

### resume_projects

- resume_id
- project_id
- display_order
- custom_summary

### resume_skills

- resume_id
- skill_id
- display_order

## 8.6 인증 세션

Refresh Token 방식을 사용할 경우 원문 토큰을 DB에 그대로 저장하지 않는다.

### refresh_sessions

- id
- user_id
- token_hash
- expires_at
- revoked_at
- created_at

---

## 9. REST API 초안

최종 경로는 OpenAPI 문서와 함께 확정한다.

## 9.1 공개 API

```text
GET /api/public/profile
GET /api/public/experiences
GET /api/public/educations
GET /api/public/skills
GET /api/public/projects
GET /api/public/projects/{slug}
```

공개 프로젝트 API는 `PUBLISHED` 상태만 반환한다.

## 9.2 인증 API

```text
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

## 9.3 관리자 프로젝트 API

```text
GET    /api/admin/projects
POST   /api/admin/projects
GET    /api/admin/projects/{id}
PUT    /api/admin/projects/{id}
DELETE /api/admin/projects/{id}
POST   /api/admin/projects/{id}/publish
POST   /api/admin/projects/{id}/archive
```

## 9.4 관리자 미디어 API

```text
GET    /api/admin/media
POST   /api/admin/media
PUT    /api/admin/media/{id}
DELETE /api/admin/media/{id}
POST   /api/admin/projects/{id}/media
PUT    /api/admin/projects/{id}/media/order
```

## 9.5 관리자 이력서 API

```text
GET    /api/admin/resumes
POST   /api/admin/resumes
GET    /api/admin/resumes/{id}
PUT    /api/admin/resumes/{id}
DELETE /api/admin/resumes/{id}
POST   /api/admin/resumes/{id}/copy
POST   /api/admin/resumes/{id}/preview
POST   /api/admin/resumes/{id}/pdf
POST   /api/admin/resumes/{id}/submit
```

API 응답에서 JPA Entity를 직접 노출하지 않는다. Request DTO와 Response DTO를 사용한다.

오류 응답은 일관된 형식으로 제공한다.

```json
{
  "code": "PROJECT_NOT_FOUND",
  "message": "프로젝트를 찾을 수 없습니다.",
  "fieldErrors": [],
  "timestamp": "2026-07-12T00:00:00Z"
}
```

---

## 10. 인증 및 보안

## 10.1 인증 방식

- Spring Security 사용
- 관리자 이메일·비밀번호 로그인
- 비밀번호는 BCrypt 또는 Argon2 해시
- Access Token과 Refresh Token 사용 가능
- 토큰을 브라우저 `localStorage`에 장기 저장하지 않음
- 가능한 경우 `HttpOnly`, `Secure`, 적절한 `SameSite` 쿠키 사용
- Refresh Token은 해시해 저장하고 폐기 가능하게 구성

OAuth 로그인은 MVP에 포함하지 않는다.

## 10.2 권한

- 공개 API: 인증 없이 조회 가능
- `/api/admin/**`: 관리자 인증 필수
- `/admin/**`: 프론트엔드에서도 인증 확인
- 회사별 이력서와 PDF: 관리자만 접근
- 미공개 미디어: 관리자만 접근

프론트엔드 라우트 보호만으로 보안을 처리하지 않는다. 백엔드 API에서 반드시 권한을 검증한다.

## 10.3 입력과 파일 검증

- 모든 Request DTO 검증
- 허용하지 않은 HTML 또는 스크립트 차단
- SQL 문자열 직접 결합 금지
- 업로드 MIME과 확장자 동시 검증
- 최대 파일 크기 제한
- 파일명 신뢰 금지
- 저장 키는 서버에서 생성
- 비밀값과 운영 URL을 코드에 하드코딩하지 않음

---

## 11. 백엔드 구조 원칙

권장 패키지 구조:

```text
backend/src/main/java/.../
├── auth/
├── profile/
├── experience/
├── education/
├── skill/
├── project/
├── media/
├── resume/
└── common/
    ├── config/
    ├── exception/
    ├── security/
    └── response/
```

원칙:

- Controller는 HTTP 입출력만 담당
- Service에 비즈니스 로직 배치
- Repository는 데이터 접근 담당
- Entity와 API DTO 분리
- 트랜잭션 경계 명시
- 조회 API의 N+1 문제 검토
- 목록 API 페이지네이션 적용
- Flyway로 모든 스키마 변경 관리
- 예외 응답 중앙 처리
- 환경별 설정 분리

---

## 12. 프론트엔드 구조 원칙

권장 구조:

```text
frontend/src/
├── app/
│   ├── (public)/
│   ├── admin/
│   └── api/
├── features/
│   ├── auth/
│   ├── projects/
│   ├── media/
│   └── resumes/
├── components/
│   ├── ui/
│   └── layout/
├── lib/
├── hooks/
├── types/
└── test/
```

원칙:

- Next.js App Router 사용
- Server Component와 Client Component를 목적에 맞게 구분
- API 요청과 화면 컴포넌트 분리
- TanStack Query로 서버 상태 관리
- React Hook Form과 Zod로 폼 검증
- 로딩, 빈 상태, 오류 상태 구현
- 이미지에 대체 텍스트 제공
- 폼 Label과 오류 메시지 연결
- 키보드만으로 주요 기능 사용 가능
- 모바일에서 겹침과 가로 스크롤 방지

---

## 13. 디자인 방향

## 13.1 전체 분위기

- 밝고 정돈된 미니멀 디자인
- 흰색 또는 밝은 회색 배경
- 진한 네이비 또는 차콜 본문
- 블루 또는 청록 계열 포인트 컬러
- 약한 테두리와 제한적인 그림자
- 과도한 3D와 무거운 스크롤 효과 지양
- 이미지와 프로젝트 내용의 가독성 우선

## 13.2 타이포그래피

- 한국어: Pretendard 우선 검토
- 영문: Inter 또는 시스템 폰트
- 본문 최소 가독성 확보
- 긴 프로젝트 설명의 행 길이 제한

## 13.3 공개 포트폴리오

- 최대 콘텐츠 폭 약 1120~1200px
- Hero에서 직무와 정체성을 즉시 전달
- 프로젝트 대표 이미지가 충분히 보이는 카드
- Case Study 상세 페이지는 긴 글을 읽기 편하게 구성
- 애니메이션은 진입과 Hover에 제한적으로 사용
- Dark Mode는 MVP 필수 기능이 아님

## 13.4 관리자 화면

- 왼쪽 사이드바
- 상단 페이지 제목과 주요 동작
- 목록은 테이블 또는 명확한 리스트
- 작성 화면은 Label이 있는 폼
- 임시저장, 공개, 보관 상태 Badge
- 이미지 미리보기와 순서 변경
- 삭제와 공개 변경에 확인 절차

## 13.5 반응형 기준

- 공개 화면: 360px 이상 지원
- 관리자 화면: 768px 이상 우선 지원하되 작은 화면에서도 핵심 기능 접근 가능
- 텍스트와 버튼 겹침 금지
- 불필요한 가로 스크롤 금지
- 이미지 비율 유지

## 13.6 디자인 레퍼런스

- SiteInspire Minimal: https://www.siteinspire.com/websites/category/minimal
- Land-book Portfolio: https://land-book.com/design/portfolio
- Land-book Case Study: https://land-book.com/design/case-study
- Mobbin Admin Dashboard: https://mobbin.com/explore/web/screens/admin-dashboard

레퍼런스를 그대로 복제하지 않는다. 정보 구조, 여백, 프로젝트 이미지 사용 방식과 관리자 UX 패턴만 참고한다.

---

## 14. 로컬 개발 환경

초기 디렉터리:

```text
YM_PF/
├── AGENTS.md
├── README.md
├── PROJECT_SPEC.md
├── docs/
├── frontend/
├── backend/
├── docker-compose.yml
└── .github/workflows/ci.yml
```

Docker Compose 최소 구성:

- PostgreSQL
- 필요 시 Backend

Next.js는 개발 중 빠른 Hot Reload를 위해 호스트에서 실행할 수 있다.

환경변수 예시:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
JWT_SECRET
ACCESS_TOKEN_TTL
REFRESH_TOKEN_TTL
MEDIA_STORAGE_PROVIDER
MEDIA_STORAGE_BUCKET
MEDIA_STORAGE_ENDPOINT
MEDIA_STORAGE_ACCESS_KEY
MEDIA_STORAGE_SECRET_KEY
NEXT_PUBLIC_API_BASE_URL
```

실제 값은 `.env`에 두고 커밋하지 않는다. `.env.example`에는 키 이름과 설명만 제공한다.

---

## 15. 자동 검수 전략

## 15.1 프론트엔드 검수

필수 명령은 프로젝트 초기화 후 `AGENTS.md`와 `README.md`에 실제 명령으로 확정한다.

예상 검수:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm playwright test
```

검수 대상:

- TypeScript 오류
- ESLint 오류
- 컴포넌트 단위 테스트
- 폼 검증
- 공개 프로젝트 흐름
- 관리자 로그인 흐름
- 이미지 업로드 UI
- 회사별 이력서 작성 흐름
- 모바일 레이아웃
- 키보드 접근성

## 15.2 백엔드 검수

```text
./gradlew test
./gradlew check
./gradlew bootJar
```

검수 대상:

- Service 단위 테스트
- Controller 테스트
- PostgreSQL Testcontainers 통합 테스트
- 인증 성공과 실패
- 관리자 권한
- 공개 API의 PUBLISHED 필터
- 공개 API의 이력서 비노출
- 파일 메타데이터 검증
- 프로젝트 상태 전환
- 이력서 복제
- Flyway 마이그레이션

## 15.3 Docker 검수

```text
docker compose config
docker compose build
docker compose up
```

검수 대상:

- PostgreSQL 연결
- 백엔드 Health Check
- 환경변수 누락 처리
- 컨테이너 재시작
- 운영 이미지 빌드

## 15.4 GitHub Actions

Pull Request마다 다음 Job을 실행한다.

- `frontend-check`
- `backend-check`
- `docker-check`
- `e2e-check`

가능하면 `main` 브랜치 보호 규칙에서 필수 검사로 지정한다.

## 15.5 Codex 리뷰

각 Phase 종료 후 다음 기준으로 자체 리뷰한다.

- 요구사항 누락
- 인증 및 권한 우회
- 회사별 이력서 공개 노출
- 미공개 미디어 노출
- 파일 업로드 검증
- Entity 직접 노출
- 트랜잭션 문제
- N+1 문제
- 테스트 누락
- 모바일 UI 깨짐
- 접근성 문제
- 비밀값 하드코딩
- 관련 없는 리팩터링

VS Code Codex에서 구현 후 `/review`를 사용해 변경사항을 다시 검수한다.

---

## 16. 인수 조건

## 16.1 인증

- [ ] 인증되지 않은 사용자는 관리자 API에 접근할 수 없다.
- [ ] 인증되지 않은 사용자는 관리자 페이지를 사용할 수 없다.
- [ ] 잘못된 로그인은 일반화된 오류를 반환한다.
- [ ] 비밀번호는 안전한 해시로 저장된다.
- [ ] 토큰을 localStorage에 장기 저장하지 않는다.
- [ ] 로그아웃 또는 폐기된 Refresh Session은 재사용할 수 없다.

## 16.2 공개 포트폴리오

- [ ] PUBLISHED 프로젝트만 공개된다.
- [ ] 프로젝트 대표 이미지가 표시된다.
- [ ] 이미지가 없으면 접근 가능한 Placeholder가 표시된다.
- [ ] 프로젝트 상세 이미지가 지정된 순서대로 표시된다.
- [ ] 모든 의미 있는 이미지에 대체 텍스트가 있다.
- [ ] 공개 페이지에 회사별 이력서 메뉴가 없다.
- [ ] 공개 API에 이력서 데이터가 없다.

## 16.3 프로젝트 관리

- [ ] 관리자는 프로젝트를 생성할 수 있다.
- [ ] 관리자는 프로젝트를 수정할 수 있다.
- [ ] 관리자는 프로젝트를 임시저장할 수 있다.
- [ ] 관리자는 프로젝트를 공개할 수 있다.
- [ ] 관리자는 프로젝트를 보관할 수 있다.
- [ ] 대표 이미지 한 개를 설정할 수 있다.
- [ ] 본문 이미지 여러 개를 등록할 수 있다.
- [ ] 이미지 순서와 대체 텍스트를 수정할 수 있다.
- [ ] 허용하지 않은 파일 형식은 거부된다.
- [ ] 제한을 초과한 파일은 거부된다.

## 16.4 회사별 이력서

- [ ] 회사와 포지션별 이력서를 생성할 수 있다.
- [ ] 기존 이력서를 복제할 수 있다.
- [ ] 포함할 프로젝트와 경력을 선택할 수 있다.
- [ ] 기술 강조 순서를 설정할 수 있다.
- [ ] 프로필 이미지는 선택적으로 첨부할 수 있다.
- [ ] 이력서를 미리 볼 수 있다.
- [ ] PDF를 생성할 수 있다.
- [ ] 이력서 상태를 변경할 수 있다.
- [ ] 이력서는 관리자만 접근할 수 있다.

## 16.5 품질

- [ ] 프론트엔드 lint가 통과한다.
- [ ] TypeScript 검사가 통과한다.
- [ ] 프론트엔드 테스트가 통과한다.
- [ ] Next.js 운영 빌드가 성공한다.
- [ ] 백엔드 테스트가 통과한다.
- [ ] PostgreSQL 통합 테스트가 통과한다.
- [ ] Flyway 마이그레이션이 성공한다.
- [ ] Docker 이미지 빌드가 성공한다.
- [ ] 핵심 Playwright 테스트가 통과한다.
- [ ] 모바일 화면에서 겹침이 없다.
- [ ] 주요 기능을 키보드로 사용할 수 있다.

---

## 17. 구현 Phase

## Phase 0 — 프로젝트 기반

- [ ] 저장소 상태 확인
- [ ] `AGENTS.md` 생성
- [ ] `README.md` 보완
- [ ] Java·Gradle·Node·Next.js용 `.gitignore` 보완
- [ ] Next.js + TypeScript 초기화
- [ ] Spring Boot + Java 21 초기화
- [ ] PostgreSQL Docker Compose
- [ ] Frontend Dockerfile
- [ ] Backend Dockerfile
- [ ] Backend Health Check
- [ ] 기본 테스트
- [ ] GitHub Actions CI
- [ ] `.env.example`

Phase 0에서는 인증과 비즈니스 CRUD를 구현하지 않는다.

## Phase 1 — 관리자 인증

- [ ] users 테이블
- [ ] 관리자 초기 계정 생성 방식
- [ ] Spring Security
- [ ] 로그인
- [ ] Refresh
- [ ] 로그아웃
- [ ] `/api/auth/me`
- [ ] 관리자 API 보호
- [ ] 관리자 페이지 보호
- [ ] 인증 단위·통합 테스트

## Phase 2 — 포트폴리오 콘텐츠

- [ ] 프로필 CRUD
- [ ] 경력 CRUD
- [ ] 학력·교육 CRUD
- [ ] 기술 CRUD
- [ ] 자격증 CRUD
- [ ] 프로젝트 CRUD
- [ ] 프로젝트 상태
- [ ] 공개 API
- [ ] 공개 홈
- [ ] 프로젝트 목록
- [ ] 프로젝트 상세
- [ ] 관리자 콘텐츠 화면

## Phase 3 — 미디어

- [ ] `MediaStorage` 인터페이스
- [ ] 로컬 또는 테스트 구현
- [ ] 운영 객체 스토리지 구현
- [ ] 대표 이미지 업로드
- [ ] 다중 본문 이미지 업로드
- [ ] 아키텍처 이미지
- [ ] 파일 형식과 크기 검증
- [ ] 대체 텍스트
- [ ] 이미지 순서
- [ ] 미디어 관리 화면
- [ ] 업로드 테스트

## Phase 4 — 회사별 이력서

- [ ] 이력서 CRUD
- [ ] 회사·포지션·채용공고 필드
- [ ] 기존 이력서 복제
- [ ] 경력 선택
- [ ] 프로젝트 선택
- [ ] 기술 순서
- [ ] 맞춤 요약
- [ ] 선택적 프로필 이미지
- [ ] 미리보기
- [ ] PDF 생성
- [ ] 상태 변경
- [ ] 관리자 전용 권한 테스트

## Phase 5 — 최종 검수와 배포

- [ ] 단위 테스트 보완
- [ ] 통합 테스트 보완
- [ ] Playwright 핵심 흐름
- [ ] 접근성 검사
- [ ] 모바일 검수
- [ ] 운영 Docker 빌드
- [ ] Vercel 배포 설정
- [ ] Backend 호스팅 설정
- [ ] Neon 연결
- [ ] 비밀값 검수
- [ ] OpenAPI 검수
- [ ] README 실행·배포 안내
- [ ] 최종 Codex `/review`

---

## 18. Codex 작업 규칙

Codex는 각 작업에서 다음 순서를 따른다.

1. 이 문서와 `AGENTS.md`를 읽는다.
2. 현재 저장소와 사용자 변경사항을 확인한다.
3. 대상 Phase와 범위를 확인한다.
4. 구현 계획을 세운다.
5. 필요한 파일만 수정한다.
6. 테스트를 추가하거나 갱신한다.
7. 가능한 검증 명령을 모두 실행한다.
8. 실패하면 원인을 수정하고 다시 실행한다.
9. 전체 diff를 자체 리뷰한다.
10. 완료 항목과 미완료 항목을 보고한다.

금지 사항:

- 요청하지 않은 다음 Phase 선행 구현
- main 직접 작업 또는 병합
- 검증 없이 완료 주장
- 기존 사용자 변경사항 삭제
- 비밀값 커밋
- 이미지·PDF 바이너리의 PostgreSQL 저장
- 공개 API의 회사별 이력서 노출
- 관련 없는 대규모 리팩터링
- 이유 없는 신규 의존성 추가

새 의존성이 필요한 경우 다음을 설명한다.

- 필요한 이유
- 기존 도구만으로 해결하기 어려운 이유
- 운영과 보안 영향

---

## 19. Definition of Done

작업은 다음 조건을 모두 충족해야 완료다.

1. 요청된 Phase 범위가 구현됐다.
2. 인수 조건과 연결되는 테스트가 있다.
3. 관련 lint, typecheck, test와 build가 통과했다.
4. DB 변경에 Flyway 마이그레이션이 있다.
5. API 변경이 OpenAPI에 반영됐다.
6. Docker 또는 실행 환경에 영향이 있으면 검증했다.
7. 보안과 권한을 자체 리뷰했다.
8. 기존 기능의 회귀 여부를 확인했다.
9. 문서와 실제 실행 명령이 일치한다.
10. 실행하지 못한 검증과 남은 제한사항을 명시했다.

---

## 20. VS Code Codex 첫 실행 프롬프트

이 파일을 저장소 루트에 `PROJECT_SPEC.md`라는 이름으로 추가한 뒤 VS Code Codex에 다음 프롬프트를 사용한다.

```text
이 저장소의 PROJECT_SPEC.md를 처음부터 끝까지 읽고 현재 저장소 상태를 확인해줘.

이번 작업은 Phase 0만 진행해.

작업 요구사항:

1. 먼저 PROJECT_SPEC.md의 요구사항과 현재 저장소 상태를 요약해.
2. Phase 0 구현 계획과 예상 디렉터리 구조를 제시해.
3. 저장소 루트에 AGENTS.md를 생성하고 다음 내용을 간결하게 넣어.
   - PROJECT_SPEC.md를 먼저 읽을 것
   - 기술 스택
   - 개발 규칙
   - 검증 명령
   - 보안 규칙
   - 완료 조건
4. Next.js + TypeScript 프론트엔드를 초기화해.
5. Java 21 + Spring Boot 백엔드를 초기화해.
6. PostgreSQL Docker Compose를 구성해.
7. 프론트엔드와 백엔드 Dockerfile을 작성해.
8. 백엔드 Health Check와 테스트를 구현해.
9. 프론트엔드 기본 화면과 최소 테스트를 구현해.
10. GitHub Actions CI를 구성해.
11. .env.example과 실행 방법을 README.md에 작성해.
12. 가능한 lint, typecheck, test, build, docker 검증을 직접 실행해.
13. 실패한 검증이 있으면 원인을 수정하고 다시 실행해.
14. git diff 전체를 자체 리뷰해.
15. Phase 0을 벗어난 인증이나 CRUD는 구현하지 마.

브랜치 이름:
feat/phase-0-foundation

main 브랜치에 직접 커밋하거나 병합하지 마.
기존 사용자 변경사항과 관련 없는 파일은 수정하지 마.

완료 후 다음 내용을 보고해.

- 구현 내용
- 변경 파일
- 실행한 검증과 결과
- 실행하지 못한 검증과 이유
- 남은 제한사항
- Phase 1 시작 전 확인할 사항
```

Phase 0 완료 후에는 다음 프롬프트를 사용한다.

```text
PROJECT_SPEC.md와 AGENTS.md를 다시 읽고 Phase 0 변경사항을 검수해줘.

다음 항목을 중점적으로 확인해.

- 기술 스택이 요구사항과 일치하는가
- 프론트와 백엔드 구조가 이후 Phase 확장에 적합한가
- Docker PostgreSQL 연결이 재현 가능한가
- 환경변수와 비밀값이 안전하게 분리됐는가
- GitHub Actions가 실제 로컬 검증 명령과 일치하는가
- 테스트와 Health Check가 정상 동작하는가
- Phase 1 이후 기능을 불필요하게 선행 구현하지 않았는가
- 관련 없는 파일 변경이 없는가

가능한 테스트와 빌드를 다시 실행하고 git diff 전체를 리뷰해.
문제가 있으면 수정하고 재검증해.
검수 완료 후 Phase 1 구현 준비 상태를 보고해.
```

---

## 21. 최종 원칙

이 프로젝트의 목표는 기술을 많이 넣는 것이 아니라, 선택한 기술을 실제 제품 흐름과 검증 가능한 품질로 보여주는 것이다.

다음 네 가지를 우선한다.

1. 채용담당자가 빠르게 이해할 수 있는 공개 포트폴리오
2. 실제 취업 활동에 사용할 수 있는 회사별 이력서 관리
3. 프로젝트 이미지와 기술적 의사결정을 보여주는 Case Study
4. 테스트, CI, Docker와 배포가 포함된 재현 가능한 풀스택 시스템

## 현재 공개 릴리스 범위 (2026-09)

현재 채용용 공개 사이트는 Vercel에서 정적 콘텐츠로 제공하며, 공개 프로필과 프로젝트 데이터는 프론트엔드 저장소의 공개 전용 콘텐츠 모듈에서 관리한다. 이 릴리스는 공개 화면을 보여주기 위해 Java 백엔드, 데이터베이스 또는 객체 저장소를 실행하지 않는다. Spring Boot 관리자·이력서 기능과 풀스택 운영 로드맵은 유지하며, 추후 별도 검증·배포 단계에서 연결한다. 공개 데이터에는 관리자 전용 이력서·PDF와 미공개 미디어를 포함하지 않는다.
