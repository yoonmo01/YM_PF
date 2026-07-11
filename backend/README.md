# YM_PF Backend

Java 21과 Spring Boot 기반의 YM_PF API 서버입니다. Phase 0에는 인증이나 도메인 CRUD 없이 실행 기반과 헬스 체크만 포함합니다.

## 환경 변수

- `DATABASE_URL`: JDBC PostgreSQL URL (예: `jdbc:postgresql://localhost:5432/portfolio`)
- `DATABASE_USERNAME`: PostgreSQL 사용자 이름
- `DATABASE_PASSWORD`: PostgreSQL 비밀번호

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
