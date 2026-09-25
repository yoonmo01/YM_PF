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
      for (const rate of ["88.9%", "86.7%", "47.8%"]) {
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
