import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const projects = [
  ["vishbox-v2", "VishBox v2"],
  ["legal-translation-review", "판결문 번역·검수 시스템"],
  ["public-audit-ai-viewer", "공공 감사 데이터 AI 분류·조회 시스템"],
  ["auth-security-audit", "AUTH"],
  ["vishbox", "VishBox v1"],
  ["polystep", "POLYSTEP"],
] as const;

test("static public pages work without API calls at desktop and mobile widths", async ({ page }, testInfo) => {
  const publicApiRequests: string[] = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/api/public/")) publicApiRequests.push(path);
  });

  await page.goto("/");
  await expect(page).toHaveTitle("양윤모 | AI Agent · Backend Engineer");
  await expect(page.getByRole("heading", { level: 1, name: "AI Agent의 판단을 검증 가능한 서비스로 연결합니다." })).toBeVisible();
  await expect(page.getByRole("link", { name: "관리자" })).toHaveCount(0);
  for (const [slug, title] of projects.slice(0, 4)) {
    await expect(page.getByRole("link", { name: title })).toHaveAttribute("href", `/projects/${slug}`);
  }
  await assertNoHorizontalOverflow(page);
  await assertNoSeriousAccessibilityViolations(page);
  if (testInfo.project.name === "chromium" || testInfo.project.name === "narrow-mobile-chromium") {
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
    const filename = testInfo.project.name === "chromium" ? "portfolio-home-desktop.png" : "portfolio-home-360.png";
    await page.screenshot({ path: testInfo.outputPath(filename), fullPage: true });
  }

  await page.goto("/projects");
  for (const [slug, title] of projects) {
    await expect(page.getByRole("link", { name: title })).toHaveAttribute("href", `/projects/${slug}`);
  }
  await page.getByLabel("사용 기술").selectOption("MinerU");
  await expect(page.getByRole("link", { name: "판결문 번역·검수 시스템" })).toBeVisible();
  await expect(page.getByRole("link", { name: "VishBox v2" })).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("1개 프로젝트");
  await assertNoHorizontalOverflow(page);
  await assertNoSeriousAccessibilityViolations(page);

  for (const [slug, title] of projects) {
    const response = await page.goto(`/projects/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(new RegExp(title));
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  }
  const missing = await page.goto("/projects/unknown-stage3-slug");
  expect(missing?.status()).toBe(404);

  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1, name: "양윤모" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "논문" })).toHaveCount(0);
  await page.goto("/contact");
  await expect(page.getByRole("link", { name: /coolalex127@gmail.com/ })).toHaveAttribute("href", "mailto:coolalex127@gmail.com");
  expect(publicApiRequests).toEqual([]);
});

async function assertNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
}

async function assertNoSeriousAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
}
