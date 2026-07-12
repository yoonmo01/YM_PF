# YM_PF Backend

Java 21과 Spring Boot 기반의 YM_PF API 서버입니다. 관리자 인증, 포트폴리오 콘텐츠, 미디어 저장소, 회사별 이력서와 PDF 생성을 제공합니다.

## 환경 변수

- `DATABASE_URL`: JDBC PostgreSQL URL (예: `jdbc:postgresql://localhost:5432/portfolio`)
- `DATABASE_USERNAME`: PostgreSQL 사용자 이름
- `DATABASE_PASSWORD`: PostgreSQL 비밀번호
- `JWT_SECRET`: 32바이트 이상의 JWT 서명 비밀값
- `MEDIA_STORAGE_PROVIDER`: `local` 또는 `s3`
- `RESUME_PDF_FONT_PATH`: 선택적 한국어 TTF 경로

## 검증

Windows에서는 다음 명령을 실행합니다.

```powershell
.\gradlew.bat bootRun
.\gradlew.bat test
.\gradlew.bat check
.\gradlew.bat bootJar
```

저장소 루트의 `.env`는 호스트 실행 시 자동으로 불러옵니다. 먼저 `.env.example`을 복사하고 placeholder를 로컬 값으로 교체해야 합니다.

Linux와 macOS에서는 `./gradlew`을 사용합니다. 테스트는 Docker에서 `postgres:17-alpine` 컨테이너를 시작합니다.

서버가 실행되면 기본 헬스 체크는 `GET /actuator/health`, Swagger UI는 `/swagger-ui.html`에서 확인할 수 있습니다.

공개 API는 공개 상태 프로젝트와 그 미디어만 반환합니다. `/api/admin/**`, 이력서, 생성 PDF, 미공개 미디어는 관리자 쿠키 인증과 CSRF 검증 대상입니다. 운영 배포 설정은 루트의 `render.yaml`과 `docs/deployment.md`를 참고합니다.
