# Public Portfolio Launch Implementation Plan

> **For agentic workers:** Work through the checked stages in order. Use `@ponytail` full mode. Switch models between stages in the same checkout; do not run stages concurrently. Read `AGENTS.md`, all of `PROJECT_SPEC.md`, this plan, and the current diff before editing.

**Goal:** Make the existing Vercel URL a reliable, readable job-application portfolio with six public project case studies and no dependency on a running Spring Boot service.

**Architecture:** Keep the full-stack source in the repository. Build the public Next.js pages from reviewed, typed local content and pre-render the six project routes. Keep local admin development possible, but return 404 for `/admin/**` in production and remove the production `/api/**` proxy. No database, Oracle VM, contact API, or PDF download is needed for this release. This is a static-*content* Next.js deployment, not a promise that the entire Vercel build contains zero managed functions while admin source remains in the app.

**Tech Stack:** Existing Next.js 16, React 19, TypeScript, Tailwind CSS, Vitest/RTL, Playwright, Vercel; existing Spring Boot code is preserved.

**Spec:** `PROJECT_SPEC.md` public visitor flow and Phase 2 → Phase 3 → Phase 5 order; `docs/portfolio/CONTENT_DRAFT.md` is a review draft, not publishable proof. This release narrows Phase 5 to the public site; the long-term admin/resume roadmap stays in the spec.

## Global constraints

- Stay on a `codex/*` branch. Preserve all existing modified and untracked files; never reset, stash, or stage them wholesale. Review staged and full diffs before each phase-scoped local commit.
- Publish all six projects at `/projects`, feature VishBox v2, 판결문 번역·검수, 공공 감사 데이터 AI 분류·조회, and AUTH on `/`; keep VishBox v1 and POLYSTEP in the full list.
- Public routes are `/`, `/projects`, `/projects/[slug]`, `/about`, `/contact`. Do not expose admin navigation, company-specific resumes, generated PDFs, or unpublished media.
- Do not state unverified personal roles, metrics, dates, author contributions, awards, or model names as fact. Do not expose external client/research institution names or source document data. Omit an unapproved field/link/asset rather than inventing it.
- Use `frontend-design` for the visual pass, `web-design-guidelines` for the final UI audit, and `@ponytail` for implementation choices. Reuse the existing stack; add no package for content or animation.
- A future Next.js Route Handler on Vercel is allowed when a real request-time operation is required. Persistent edits would additionally require an external datastore and access control. No such endpoint is part of this launch.

## User input and release gates

Already confirmed: name 양윤모; target roles AI Agent Engineer and Backend Engineer; public email `coolalex127@gmail.com`; six projects and four featured as listed above; external client and joint research institution names remain private; administrator-specific PDF stays private.

The user supplies or confirms the following in `docs/portfolio/CONTENT_DRAFT.md` or a reply before final publication:

1. **Each of the six projects:** exact personal role versus team work, public-safe period/team size/technology, one problem and one implementation decision, what was actually verified, and which GitHub/demo links may be published. A blank link means no link.
2. **Claims needing evidence:** VishBox v1/v2 author contribution and paper metadata; VishBox v2 evaluation numbers; AUTH timing/test conditions; POLYSTEP collection counts; awards, language scores, education dates, and research-lab description. Anything still uncertain is omitted or stated without the contested number.
3. **Media:** approved screenshots or diagrams with source/usage rights and alt text. No confidential documents, real personal data, client names, unredacted browser chrome, or raw report/award scans. If none are supplied, use a clean text/diagram cover with no fabricated screenshot.
4. **Identity and links:** confirm the short/long introduction, public GitHub profile, optional LinkedIn/profile photo, and whether the contact email above remains correct.
5. **Preview review:** inspect desktop and phone preview, verify wording/anonymization/links, then authorize production publication. No Oracle, Neon, or object-storage credentials are required for this release.

Do not block technical work while input is pending. Build with safe, clearly reviewable copy; hold production promotion until the user confirms public claims and privacy.

## Review focus

- Unknown project slug gives a real 404 and does not render another case study.
- All five public routes and six detail pages render even when `/api/public/**` is unavailable.
- Production `/admin/**` is unavailable, the public header has no admin link, and no resume/PDF/private media appears in page HTML or metadata.
- At 360px and desktop widths, text, project visuals, keyboard focus, and navigation remain usable without horizontal overflow or serious accessibility violations.
- Missing images or unapproved external links do not create broken UI or publish an unchecked claim.

## Stage 1 — Safe content source (GPT-6 Luna)

**Files:** Add a short current-release note to `PROJECT_SPEC.md`; create `frontend/src/content/public-portfolio.ts` and a focused data test; read `docs/portfolio/CONTENT_DRAFT.md`. Do not alter the backend or current admin data types.

**Interface:** Export one typed `portfolio` object with `profile`, `projects`, `experiences`, `educations`, `publications`, `awards`, and `skills`. Each project has `slug`, `title`, `summary`, `featured`, `skills`, case-study sections for problem, goal, implementation, limitations, and reflection, plus optional `role`, `period`, `teamSize`, technical choice, personal work, verification, `links`, and `media`. Optional facts are absent, not filled with `미정` or fake dates. The six slugs are `vishbox-v2`, `legal-translation-review`, `public-audit-ai-viewer`, `auth-security-audit`, `vishbox`, `polystep`.

- [ ] Record the user-approved public-only Vercel launch in `PROJECT_SPEC.md` without deleting the full-stack roadmap. Map the reviewed draft into the content module, distinguishing personal contribution from team architecture. Start with conservative copy and omit disputed numbers, papers, links, and imagery until confirmed.
- [ ] Add a small Vitest check for six unique slugs, exactly four featured projects, non-empty summary/problem/implementation/limitations for each, and internal-only URLs absent from public links.
- [ ] Run `pnpm lint`, `pnpm typecheck`, and `pnpm test` from `frontend`; review the phase diff and commit only Stage 1 files.

## Stage 2 — Public data flow and deployment boundary (GPT-6 Sol)

**Files:** Update `frontend/src/app/{page.tsx,about/page.tsx,projects/page.tsx,projects/[slug]/page.tsx,contact/page.tsx,layout.tsx}`, public content components, `frontend/src/components/layout/public-shell.tsx`, `frontend/next.config.ts`, and add `frontend/src/app/admin/layout.tsx`. Keep the existing admin API client for local development.

- [ ] Replace public `contentApi.public*`/TanStack Query calls with direct imports from `portfolio`. Keep the technology filter as a small client component; render the main text on the server. Move the Query provider into the admin layout if public routes no longer need it.
- [ ] Add `generateStaticParams()` for all six slugs, set `dynamicParams = false`, call `notFound()` for unknown slugs, and generate distinct title/description metadata from local content. Home, about, projects, contact, and six details must build as pre-rendered pages.
- [ ] Remove the public `관리자` link. Gate every `/admin/**` route with `notFound()` in production while retaining local `next dev` admin work. Disable the `/api/**` rewrite for production; retain localhost proxy only in development. Preserve security headers.
- [ ] Verify with focused tests that public routes do not request `/api/public/**`, all six links resolve, unknown slug is 404, and production admin routes are 404. Run frontend lint/typecheck/test/build. Inspect build route output, full diff, and phase-scoped commit.

## Stage 3 — Visual and content pass (GPT-6 Luna)

**Files:** Update `frontend/src/app/globals.css`, public layout/components, and approved assets under `frontend/public/projects/` only.

- [ ] Apply a restrained, project-first layout: white/light-gray ground, dark ink, one deep-teal accent, strong Korean typography, no decorative gradient. Keep the content width near 1120px; keep case-study prose near 760px. Home shows a clear identity and four featured project rows; `/projects` shows all six; each detail leads with the problem and personal role, then engineering evidence.
- [ ] Reuse current CSS variables and native controls. Replace repetitive equal-height cards where they hide project context. Use approved media with alt text and captions; otherwise use text/diagram covers. Keep motion minimal and respect reduced-motion.
- [ ] Preserve `/about` experience/education/paper/award sections only for verified entries and `/contact` as `mailto:` plus approved links. Remove empty sections instead of showing backend-loading errors.
- [ ] Capture desktop and 360px screenshots, inspect visually, run frontend lint/typecheck/test/build and Playwright public flow/accessibility checks, review diff, then phase-scoped commit.

## Stage 4 — Release review and Vercel deployment (GPT-6 Sol)

**Files:** Update `README.md`, `docs/deployment.md`, and public E2E checks. Preserve the full-stack roadmap and existing Spring Boot/Flyway/PDF implementation.

- [ ] Check the existing Vercel project `yoonmo-portfolio`, canonical GitHub repository `yoonmo01/yoonmo-portfolio`, production branch `main`, and Root Directory `frontend`. The local `origin` uses its former `YM_PF` name and GitHub resolves both names to the same repository. Do not create a second Vercel project.
- [ ] Make docs describe this release accurately: static public content, code review plus redeploy for edits, no deployed Java/DB/object storage, and optional future Vercel Functions. Remove public-launch instructions that assume `API_PROXY_TARGET`, Render, or Neon are active while retaining future full-stack guidance.
- [ ] Replace API-mocked public Playwright assertions with real static-content assertions; retain local mocked admin tests separately. Check six details, unknown slug, no admin link, approved external links, mobile/keyboard/accessibility, metadata, and no public API dependency. Run canonical README checks: frontend lint/typecheck/test/build/Playwright; backend `test`, `check`, `bootJar`; Docker Compose config/build. Record environment-only failures rather than claiming success.
- [ ] Review full diff and sensitive data, create a PR from the feature branch, and test its Vercel preview. Verify production-mode `/admin/**` and `/api/admin/**` are unusable, and all public routes work without a backend. After the user's claim/privacy/preview review, merge and verify `https://yoonmo-portfolio.vercel.app/` and the production deployment commit. Keep a rollback deployment available.

## Model handoff prompts

Use the **same task and checkout** when switching models; a new default-branch worktree may not contain uncommitted input files. Do not ask Luna and Sol to edit the shared checkout simultaneously.

1. **GPT-6 Luna:** “Read `C:\YM_PF\docs\superpowers\plans\2026-09-25-public-portfolio-launch.md`, `AGENTS.md`, `PROJECT_SPEC.md`, and `docs/portfolio/CONTENT_DRAFT.md`. Apply `@ponytail`. Do Stage 1 only. Preserve existing changes, run listed checks, commit only your stage files, and report any publication claims still requiring my confirmation.”
2. **GPT-6 Sol:** “Read the same plan and current diff. Apply `@ponytail`. Do Stage 2 only after Stage 1 is complete. Keep the Spring Boot/admin source but make the production public site independent of it. Run checks, review and commit only your stage files.”
3. **GPT-6 Luna:** “Read the same plan and latest diff. Apply `@ponytail` and `frontend-design`. Do Stage 3 only. Use approved facts/assets, run visual and automated checks, review and commit only your stage files.”
4. **GPT-6 Sol:** “Read the same plan and all stage results. Apply `@ponytail` and `web-design-guidelines`. Do Stage 4. Verify Vercel settings, run the full checks, create/review the PR and preview, then publish only after I confirm the public wording and privacy.”

**Done:** A recruiter opening the production URL can read the introduction, all six projects, and contact details without a failed API request; private/admin routes and unverified claims stay out of the public site; checks and deployment SHA are recorded.
