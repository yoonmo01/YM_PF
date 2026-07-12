# Security model

## Trust boundary

The Spring Boot API is the authorization boundary. Frontend route guards improve user experience but never replace backend authorization. Public APIs must not return drafts, private media, resumes, or generated resume PDFs.

## Administrator authentication

- Access tokens are short-lived signed JWTs carried in an HttpOnly cookie.
- Refresh tokens are 256-bit opaque random values. PostgreSQL stores only their SHA-256 hashes.
- A successful refresh rotates the token and revokes the previous session; expired, revoked, or replayed values are rejected.
- Logout revokes the matching refresh session and expires both cookies.
- Browser storage such as `localStorage` and `sessionStorage` is never used for credentials.

Cookie authentication is protected by Spring Security CSRF. The frontend first requests `GET /api/auth/csrf`, retains the returned value in memory, and sends it in the documented CSRF header for every mutation. Credentialed CORS accepts only the exact origins configured by `ALLOWED_ORIGINS`; wildcard origins are invalid.

For local same-site development, `SameSite=Lax` and `COOKIE_SECURE=false` are supported. Production must use HTTPS and `COOKIE_SECURE=true`. Cross-site hosting additionally requires `SameSite=None`, but a same-site custom-domain arrangement is preferred because browsers can block third-party cookies.

## First administrator

There are no built-in credentials. At startup, bootstrap runs only when both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are explicitly configured and valid. The password is BCrypt-hashed before persistence, is never logged, and an existing account is never overwritten. Remove the bootstrap password from the runtime environment after the first account is created.

## Secrets

Only placeholder values belong in `.env.example`. Real JWT keys, database passwords, administrator credentials, object-storage keys, and deployment URLs belong in the deployment provider's secret store or an ignored local `.env` file.
