# YM_PF 로컬 실행 가이드

이 문서는 Windows PowerShell과 Docker Desktop을 기준으로 YM_PF를 로컬에서 실행하는 방법을 설명합니다. Docker Compose는 PostgreSQL, Spring Boot 백엔드, Next.js 프런트엔드를 함께 실행합니다.

## 1. 준비물

- Docker Desktop
- Git으로 받은 YM_PF 저장소
- 프로젝트 경로: `C:\YM_portfolio\YM_PF`

전체 서비스를 Docker로 실행할 때는 Java, Node.js, pnpm을 별도로 실행할 필요가 없습니다. 소스 코드를 직접 개발하고 테스트할 때만 Java 21, Node.js 22+, pnpm 11+가 필요합니다.

## 2. 최초 한 번만 설정

저장소 루트에서 `.env.example`을 복사합니다.

```powershell
Set-Location C:\YM_portfolio\YM_PF
Copy-Item .env.example .env
```

`.env`에서 다음 값을 본인 로컬 환경에 맞게 설정합니다.

- `POSTGRES_PASSWORD`, `DATABASE_PASSWORD`: 같은 DB 비밀번호
- `JWT_SECRET`: 충분히 긴 무작위 문자열
- `ADMIN_EMAIL`: 관리자 로그인 이메일
- `ADMIN_PASSWORD`: 관리자 로그인 비밀번호(12자 이상, UTF-8 기준 72바이트 이하)
- `COOKIE_SECURE=false`: `http://localhost`에서 실행할 때 사용
- `ALLOWED_ORIGINS=http://localhost:3000`

로컬 `.env`에는 비밀값이 들어가므로 Git에 커밋하지 않습니다.

### PostgreSQL 이름 관련 주의사항

기본 로컬 설정은 다음 값을 사용합니다.

```dotenv
POSTGRES_DB=portfolio
POSTGRES_USER=portfolio
DATABASE_USERNAME=portfolio
```

PostgreSQL은 데이터 볼륨을 처음 만들 때만 `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`로 DB와 계정을 초기화합니다. 볼륨이 생성된 후 이 값을 임의로 변경하면 기존 DB 계정과 `.env`가 달라져 백엔드가 시작되지 않을 수 있습니다.

## 3. 처음 실행

1. Docker Desktop을 실행하고 엔진이 준비될 때까지 기다립니다.
2. 프로젝트 루트에서 다음 명령을 실행합니다.

```powershell
Set-Location C:\YM_portfolio\YM_PF
docker compose --env-file .env up -d --build --wait
```

처음에는 이미지를 빌드하고 의존성을 내려받기 때문에 시간이 걸릴 수 있습니다. 정상 완료되면 PostgreSQL, 백엔드, 프런트엔드가 모두 `Healthy`로 표시됩니다.

## 4. 접속 주소

- 공개 포트폴리오: <http://localhost:3000>
- 관리자 화면: <http://localhost:3000/admin>
- 관리자 로그인: <http://localhost:3000/admin/login>
- 백엔드 상태: <http://localhost:8080/actuator/health>
- API 문서: <http://localhost:8080/swagger-ui.html>

관리자 로그인에는 `.env`의 `ADMIN_EMAIL`, `ADMIN_PASSWORD`를 사용합니다. 관리자 계정은 사용자 테이블이 비어 있는 첫 실행 시 생성됩니다.

## 5. 평소 실행 방법

컨테이너에는 `restart: unless-stopped` 정책이 설정되어 있습니다. 컨테이너가 생성되어 있고 직접 중지하거나 삭제하지 않았다면, 일반적으로 Docker Desktop을 다시 실행할 때 서비스도 자동으로 시작됩니다.

사이트가 열리지 않거나 확실하게 실행하려면 다음 명령을 사용합니다. 이미 빌드된 이미지를 사용하므로 보통 빠르게 끝납니다.

```powershell
Set-Location C:\YM_portfolio\YM_PF
docker compose --env-file .env up -d --wait
```

소스 코드나 Dockerfile을 변경한 후에는 이미지를 다시 빌드합니다.

```powershell
docker compose --env-file .env up -d --build --wait
```

## 6. 상태와 로그 확인

세 서비스의 상태를 확인합니다.

```powershell
docker compose --env-file .env ps
```

정상 상태는 `postgres`, `backend`, `frontend`가 모두 `healthy`인 상태입니다.

백엔드 로그:

```powershell
docker compose --env-file .env logs -f backend
```

프런트엔드 로그:

```powershell
docker compose --env-file .env logs -f frontend
```

전체 로그:

```powershell
docker compose --env-file .env logs -f
```

로그 화면에서 나오려면 `Ctrl+C`를 누릅니다. 컨테이너 자체는 계속 실행됩니다.

## 7. 중지와 재시작

컨테이너를 유지한 채 잠시 중지합니다.

```powershell
docker compose --env-file .env stop
```

중지된 컨테이너를 다시 시작합니다.

```powershell
docker compose --env-file .env start
```

컨테이너와 네트워크를 제거하되 DB와 업로드 파일 볼륨은 보존합니다.

```powershell
docker compose --env-file .env down
```

`down`을 실행한 후에는 다음 명령으로 다시 생성합니다.

```powershell
docker compose --env-file .env up -d --wait
```

`docker compose down -v`는 DB와 업로드 파일 볼륨까지 삭제하므로 사용하지 마세요. 데이터를 완전히 초기화하려는 경우에만 백업 후 사용해야 합니다.

## 8. 자주 발생하는 문제

### Docker 엔진에 연결할 수 없음

`Cannot connect to the Docker daemon`, `docker_engine` 또는 pipe 관련 오류가 나오면 Docker Desktop이 실행 중인지 확인하고 엔진 준비가 끝난 후 다시 실행합니다.

### 백엔드가 unhealthy임

먼저 로그에서 가장 아래쪽의 원인을 확인합니다.

```powershell
docker compose --env-file .env logs backend --tail 200
```

`password authentication failed`, `role does not exist`, `database does not exist`가 보이면 기존 PostgreSQL 볼륨을 만든 뒤 `.env`의 DB 이름, 사용자 또는 비밀번호를 변경했을 가능성이 큽니다. DB 데이터를 유지해야 한다면 볼륨 생성 당시의 `POSTGRES_DB`와 `POSTGRES_USER` 값으로 되돌리고, 비밀번호 변경은 DB 역할에도 함께 적용해야 합니다. 데이터를 임의로 삭제하지 말고 먼저 백업하세요.

### 3000번 또는 8080번 포트를 이미 사용 중임

다른 개발 서버나 컨테이너가 포트를 사용 중인지 확인합니다.

```powershell
Get-NetTCPConnection -LocalPort 3000,8080 -ErrorAction SilentlyContinue
```

충돌하는 프로그램을 종료한 뒤 Compose를 다시 실행합니다.

### `.env` 수정이 반영되지 않음

환경 변수는 기존 컨테이너 내부에 고정되어 있을 수 있습니다. 컨테이너를 다시 생성합니다.

```powershell
docker compose --env-file .env up -d --force-recreate --wait
```

Docker에서는 프런트엔드의 `/api/**` 요청이 내부 서비스 주소 `http://backend:8080`으로 전달됩니다. 프록시 설정을 변경했다면 `--build` 옵션으로 프런트엔드 이미지를 다시 빌드합니다.

## 9. 개발 모드로 직접 실행

빠른 Hot Reload가 필요한 개발 작업에서는 PostgreSQL만 Docker로 실행하고 백엔드와 프런트엔드를 호스트에서 실행할 수 있습니다.

PostgreSQL:

```powershell
Set-Location C:\YM_portfolio\YM_PF
docker compose --env-file .env up -d postgres
```

백엔드용 PowerShell:

```powershell
Set-Location C:\YM_portfolio\YM_PF\backend
.\gradlew.bat bootRun
```

프런트엔드용 PowerShell:

```powershell
Set-Location C:\YM_portfolio\YM_PF\frontend
pnpm install
pnpm dev
```

Docker 전체 실행과 호스트 개발 실행을 동시에 사용하면 3000번 또는 8080번 포트가 충돌할 수 있습니다. 실행 방식 하나를 선택하세요.
