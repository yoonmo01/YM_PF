# Deployment guide

This repository contains deployable metadata only. Applying it requires separate provider accounts and manually supplied secrets; no deployment or credential creation is automated.

## Frontend on Vercel

1. Create a Vercel project with `frontend` as the Root Directory.
2. Keep the detected Next.js settings; `frontend/vercel.json` pins the install and build commands.
3. Set the server-only `API_PROXY_TARGET` to the HTTPS backend origin before building. Browser requests stay on the frontend origin under `/api/**`; Next.js rewrites them to this fixed target.
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

The browser uses the Vercel origin for both pages and `/api/**`; the rewrite forwards API traffic to Render. Set `COOKIE_SECURE=true` in production and keep authentication cookies host-only. This avoids third-party-cookie dependence even when Vercel and Render use unrelated provider domains. Keep the rewrite target fixed in server configuration, do not add business logic to the proxy, and test login, refresh, logout, CSRF, media upload, and CORS on every preview and production domain.

The extra proxy hop adds latency and makes Vercel part of the API availability path. Authenticated API responses must remain non-cacheable. If media uploads outgrow platform proxy limits, move uploads to short-lived signed object-storage URLs rather than weakening cookie or CSRF protection.

## Object storage

Production uses the `s3` provider. Configure bucket, region, optional S3-compatible HTTPS endpoint, access key, and secret key in the backend provider only. Grant only object read/write/delete permissions for the application bucket. The database stores metadata and generated keys, not file bytes.

## Release verification

Before deployment, run all commands in the root README. After deployment, verify `/actuator/health`, `/v3/api-docs`, public project filtering, administrator login, media upload, resume preview/PDF, security response headers, and the absence of draft/resume data from public APIs.
