import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => mockApi(route));
});

test("public portfolio is accessible and responsive", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Portfolio Hub/);
  await expect(page.getByRole("heading", { level: 1, name: "문제를 구조화하고, 검증 가능한 제품으로 만듭니다." })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "주 메뉴" })).toBeVisible();
  await expect(page.getByRole("link", { name: "관리자" })).toHaveAttribute("href", "/admin");
  await expect(page.getByText("공개된 프로젝트가 아직 없습니다.")).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await assertNoSeriousAccessibilityViolations(page);

  await page.getByRole("link", { name: "프로젝트", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "프로젝트" })).toBeVisible();
  await expect(page.getByText("공개된 프로젝트가 아직 없습니다.")).toBeVisible();
  await assertNoHorizontalOverflow(page);
});

test("administrator can complete the mocked login flow", async ({ page }) => {
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
