# Project documentation

`PROJECT_SPEC.md` is the product source of truth. This directory holds implementation-specific architecture, security, API, and deployment notes as the corresponding Phases are completed.

- [`LOCAL_RUN.md`](LOCAL_RUN.md): Windows, Docker Desktop 기반 로컬 실행·종료·재빌드·문제 해결
- [`PROJECT_GUIDE.md`](PROJECT_GUIDE.md): 코드 구조, 기술적 특징, 학습 순서
- [`security.md`](security.md): 인증, 권한, 데이터 보호 원칙
- [`deployment.md`](deployment.md): 배포 준비와 운영 점검표

No document in this directory may weaken the public/private boundary, bypass backend authorization, or introduce committed credentials.
