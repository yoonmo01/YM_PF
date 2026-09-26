import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";

test("public portfolio is accessible and responsive", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("양윤모 | AI Agent · Backend Engineer");
  await expect(page.getByRole("heading", { level: 1, name: "양윤모" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "주 메뉴" })).toBeVisible();
  await expect(page.getByRole("link", { name: "관리자" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "VishBox v2", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Experience" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Awards" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Papers" })).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await assertNoSeriousAccessibilityViolations(page);

  await page.getByRole("link", { name: "프로젝트", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "프로젝트" })).toBeVisible();
  await expect(page.getByRole("link", { name: "POLYSTEP" })).toBeVisible();
  await assertNoHorizontalOverflow(page);
});

test("six studies render with evidence on desktop and 360px mobile", async ({ page }) => {
  for (const width of [1280, 360]) {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const slug of ["vishbox-v2", "legal-translation-review", "public-audit-ai-viewer", "auth-security-audit", "vishbox", "polystep"]) {
      await page.goto(`/projects/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await assertNoHorizontalOverflow(page);
    }
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "본문으로 건너뛰기" })).toBeFocused();
    await assertNoHorizontalOverflow(page);
  }
  const missing = await page.goto("/projects/no-such-project");
  expect(missing?.status()).toBe(404);
});

test("administrator can complete the mocked login flow", async ({ page }) => {
  await page.route("**/api/**", async (route) => mockApi(route));
  await page.goto("/admin/login");
  await page.getByLabel("이메일").fill("admin@example.com");
  await page.getByLabel("비밀번호").fill("correct-horse-battery-staple");
  await page.getByRole("button", { name: "관리자 로그인" }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { level: 1, name: "콘텐츠 현황" })).toBeVisible();
  await expect(page.getByText("admin@example.com")).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await assertNoSeriousAccessibilityViolations(page);
});

async function mockApi(route: Route) {
  const request = route.request(); const path = new URL(request.url()).pathname; const method = request.method();
  if (path === "/api/public/profile") return route.fulfill({ status: 204 });
  if (path === "/api/public/projects") return json(route, { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });
  if (path === "/api/auth/csrf") return json(route, { token: "e2e-csrf", headerName: "X-XSRF-TOKEN" });
  if (path === "/api/auth/login" && method === "POST") return route.fulfill({ status: 204 });
  if (path === "/api/auth/me") return json(route, { id: "admin-id", email: "admin@example.com", role: "ADMIN" });
  if (path === "/api/admin/dashboard") return json(route, { publishedProjectCount: 0, draftProjectCount: 0, mediaFileCount: 0, resumeCount: 0, recentItems: [] });
  return json(route, { code: "NOT_MOCKED", message: `No mock for ${method} ${path}`, fieldErrors: [] }, 404);
}

async function json(route: Route, body: unknown, status = 200) { await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) }); }
async function assertNoHorizontalOverflow(page: Page) { const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth); expect(overflow).toBe(false); }
async function assertNoSeriousAccessibilityViolations(page: Page) { const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze(); expect(results.violations.filter((item) => item.impact === "serious" || item.impact === "critical")).toEqual([]); }
