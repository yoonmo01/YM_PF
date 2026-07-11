import { expect, test } from "@playwright/test";

test("shows the Phase 0 foundation on desktop and mobile", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Portfolio Hub/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "경험을 읽기 쉬운 이야기로 연결합니다.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("complementary", { name: "프론트엔드 상태" })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
