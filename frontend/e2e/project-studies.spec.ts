import { expect, test } from "@playwright/test";

const studies = [
  ["vishbox-v2", "571", "VishBox v2 시스템 구조"],
  ["legal-translation-review", "TranslateGemma", null],
  ["public-audit-ai-viewer", "1만 5천", null],
  ["auth-security-audit", "2~3분", null],
  ["vishbox", "48.04%", "VishBox 시스템 아키텍처"],
  ["polystep", "407건", "POLYSTEP 첫 화면"],
] as const;

test("six project studies show their evidence without setup instructions", async ({ page }, testInfo) => {
  for (const [slug, evidence, imageAlt] of studies) {
    await page.goto(`/projects/${slug}`);
    await expect(page.getByText(evidence, { exact: false }).first()).toBeVisible();
    if (slug === "public-audit-ai-viewer") {
      for (const rate of ["89.0%", "79.4%", "47.8%"]) {
        await expect(page.getByText(rate, { exact: false })).toBeVisible();
      }
    }
    await expect(page.getByRole("heading", { name: "검증 및 성과" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /설치|실행 방법|프로젝트 구조/ })).toHaveCount(0);
    if (imageAlt) {
      const figure = page.getByRole("img", { name: imageAlt });
      await expect(figure).toBeVisible();
      const images = page.locator("article img");
      await expect(images).toHaveCount(4);
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      }
    }
    if (slug === "polystep" && testInfo.project.name === "chromium") {
      await page.screenshot({ path: testInfo.outputPath("polystep-detail.png") });
    }
  }
});

test("AUTH study renders its Mermaid architecture as a diagram", async ({ page }, testInfo) => {
  await page.goto("/projects/auth-security-audit");
  await expect(page.getByRole("img", { name: "AUTH 시스템 아키텍처" })).toBeVisible();
  await expect(page.locator('figure[role="img"]')).toHaveCount(5);
  await expect.poll(() => page.locator('figure[role="img"] svg').count()).toBe(5);
  if (testInfo.project.name === "chromium") {
    await page.getByRole("img", { name: "AUTH 시스템 아키텍처" }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath("auth-architecture.png") });
  }
});

test("study prose and tables share the article width", async ({ page }) => {
  await page.goto("/projects/legal-translation-review");
  const heading = page.getByRole("heading", { name: /왜 만들었나/ });
  const table = page.locator("article table").first().locator("..");
  const headingWidth = await heading.evaluate((node) => node.getBoundingClientRect().width);
  const tableWidth = await table.evaluate((node) => node.getBoundingClientRect().width);
  expect(Math.abs(headingWidth - tableWidth)).toBeLessThan(2);
});

test("audit study shows the local data viewer, map, and chart", async ({ page }) => {
  await page.goto("/projects/public-audit-ai-viewer");
  for (const alt of [
    "공공 감사 결과분석 시스템 첫 화면",
    "공공 감사 결과 조회 조건 화면",
    "공공 감사 지역별 지도와 분야별 통계",
    "공공 감사 분야별 막대 차트",
  ]) {
    const image = page.getByRole("img", { name: alt });
    await expect(image).toBeVisible();
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await expect(page.getByText("캡처에 사용한 JSON과 약 1만 5천 건 구축 규모는 집계 범위가 다릅니다.")).toBeVisible();
  expect(await page.locator("article").innerText()).not.toContain("crud/map.py");
});

test("VishBox v1 dialogue diagram fits on screen and opens at full size", async ({ page }) => {
  await page.goto("/projects/vishbox");
  const image = page.getByRole("img", { name: "MCP 기반 대화 시뮬레이션 구조" });
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(await image.evaluate((node) => node.getBoundingClientRect().height)).toBeLessThanOrEqual(550);
  await expect(page.getByRole("link", { name: "MCP 대화 구조 원본 크게 보기" })).toHaveAttribute("href", "/projects/VP/fig2-mcp-dialogue.png");
});
