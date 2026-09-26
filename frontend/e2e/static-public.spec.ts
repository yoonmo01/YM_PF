import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const projects = [
  ["vishbox-v2", "VishBox v2", "https://github.com/yoonmo01/VP2"],
  ["legal-translation-review", "판결문 번역·검수 시스템", "https://github.com/yoonmo01/translation"],
  ["public-audit-ai-viewer", "공공 감사 데이터 AI 분류·조회 시스템", "https://github.com/yoonmo01/pap2025_viewer"],
  ["auth-security-audit", "AUTH", "https://github.com/yoonmo01/AUTH"],
  ["vishbox", "VishBox v1", "https://github.com/yoonmo01/VP"],
  ["polystep", "POLYSTEP", "https://github.com/yoonmo01/POLYSTEP"],
] as const;

test("static public pages work without API calls at desktop and mobile widths", async ({ page }, testInfo) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/api/")) apiRequests.push(path);
  });

  await page.goto("/");
  await expect(page).toHaveTitle("양윤모 | AX Engineer · AI Agent · Backend Engineer");
  await expect(page.getByRole("heading", { level: 1, name: "양윤모" })).toBeVisible();
  await expect(page.getByRole("link", { name: "관리자" })).toHaveCount(0);
  if (testInfo.project.name === "chromium" || testInfo.project.name === "narrow-mobile-chromium") {
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
    const filename = testInfo.project.name === "chromium" ? "portfolio-home-desktop.png" : "portfolio-home-360.png";
    await page.screenshot({ path: testInfo.outputPath(filename), fullPage: true });
  }
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "본문으로 건너뛰기" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  for (const [slug, title] of [projects[0], projects[1], projects[3]]) {
    await expect(page.getByRole("link", { name: title, exact: true })).toHaveAttribute("href", `/projects/${slug}`);
  }
  await expect(page.getByRole("heading", { name: "공공 감사 데이터 AI 분류·조회 시스템" })).toHaveCount(0);
  await assertNoHorizontalOverflow(page);
  await assertNoSeriousAccessibilityViolations(page);
  await page.goto("/projects");
  for (const [slug, title] of projects) {
    await expect(page.getByRole("link", { name: title, exact: true })).toHaveAttribute("href", `/projects/${slug}`);
  }
  await expect(page.getByLabel("사용 기술")).toHaveCount(0);
  await assertNoHorizontalOverflow(page);
  await assertNoSeriousAccessibilityViolations(page);

  for (const [slug, title, github] of projects) {
    const response = await page.goto(`/projects/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(new RegExp(title));
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByRole("link", { name: "GitHub 저장소" })).toHaveAttribute("href", github);
    await assertNoHorizontalOverflow(page);
  }
  const missing = await page.goto("/projects/unknown-stage3-slug");
  expect(missing?.status()).toBe(404);

  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1, name: "양윤모" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "연구 활동" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "학력" })).toBeVisible();
  await expect(page.getByRole("link", { name: /VishBox v2: A Multi-Agent System/ })).toHaveAttribute("href", "https://aclanthology.org/2026.acl-industry.145/");
  await assertNoSeriousAccessibilityViolations(page);
  await page.goto("/contact");
  await expect(page.getByRole("link", { name: /coolalex127@gmail.com/ })).toHaveAttribute("href", "mailto:coolalex127@gmail.com");
  await expect(page.locator("main").getByRole("link", { name: "GitHub 프로필" })).toHaveAttribute("href", "https://github.com/yoonmo01");
  await assertNoHorizontalOverflow(page);
  await assertNoSeriousAccessibilityViolations(page);
  expect(await page.locator("main").innerText()).not.toMatch(/회사별 이력서|PDF 다운로드|미공개 미디어/);
  expect(apiRequests).toEqual([]);
});

test("language link preserves the public route and shows English content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /^KO/ })).toHaveAttribute("href", "/en");
  await page.getByRole("link", { name: /^KO/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Yoonmo Yang" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
  await page.getByRole("link", { name: "VishBox v2" }).click();
  await expect(page.getByRole("heading", { name: "Full case study" })).toBeVisible();
  await assertNoSeriousAccessibilityViolations(page);
  await expect(page.getByRole("link", { name: /^EN/ })).toHaveAttribute("href", "/projects/vishbox-v2");
  await page.getByRole("link", { name: /^EN/ }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await expect(page.getByRole("heading", { level: 1, name: "VishBox v2" })).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await assertNoSeriousAccessibilityViolations(page);
});

test("production admin and API routes are unavailable", async ({ request }) => {
  test.skip(!process.env.PLAYWRIGHT_BASE_URL, "Run against a production-mode build or Vercel preview");
  for (const path of ["/admin", "/admin/login", "/admin/resumes", "/api/admin/projects", "/api/public/projects"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
  }
});

async function assertNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
}

async function assertNoSeriousAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
}
