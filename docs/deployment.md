# Deployment guide

This repository contains deployable metadata only. Applying it requires separate provider accounts and manually supplied secrets; no deployment or credential creation is automated.

## Frontend on Vercel

1. Create a Vercel project with `frontend` as the Root Directory.
2. Keep the detected Next.js settings; `frontend/vercel.json` pins the install and build commands.
3. Set `NEXT_PUBLIC_API_BASE_URL` to the HTTPS backend origin before building.
4. Add the Vercel origin to backend `ALLOWED_ORIGINS` exactly, without a trailing slash.

## Backend on Render

The root `render.yaml` defines a Docker web service and leaves every credential as `sync: false`. Supply the Neon and object-storage values in Render's secret settings before the first deployment. The image includes NanumGothic for Korean resume PDFs and runs as an unprivileged user.

After the first successful start creates the sole administrator, remove `ADMIN_PASSWORD` from the service environment. Do not rotate or remove `JWT_SECRET` while active refresh sessions must remain valid.

## PostgreSQL on Neon

Create a Neon project manually and map its connection details as follows:

```text
DATABASE_URL=jdbc:postgresql://<host>/<database>?sslmode=require
DATABASE_USERNAME=<role>
DATABASE_PASSWORD=<password>
```

Use the pooled Neon hostname for normal application traffic unless a migration-specific direct connection is required. Flyway runs at backend startup. Test migrations against a disposable branch before production changes, retain Neon backups, and never place the connection string in Vercel's public variables.

## Cookies and domains

Separate Vercel and Render domains require `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=None`. Browser third-party-cookie policies can still block authentication, so production should prefer same-site custom domains such as `www.example.com` and `api.example.com`; then `SameSite=Lax` can be evaluated. Always test login, refresh, logout, CSRF, and CORS on the final domains.

## Object storage

Production uses the `s3` provider. Configure bucket, region, optional S3-compatible HTTPS endpoint, access key, and secret key in the backend provider only. Grant only object read/write/delete permissions for the application bucket. The database stores metadata and generated keys, not file bytes.

## Release verification

Before deployment, run all commands in the root README. After deployment, verify `/actuator/health`, `/v3/api-docs`, public project filtering, administrator login, media upload, resume preview/PDF, security response headers, and the absence of draft/resume data from public APIs.
