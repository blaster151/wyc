import { test, expect } from "@playwright/test";

test.describe("Route stubs", () => {
  test("affirmations page loads", async ({ page }) => {
    await page.goto("/affirmations");
    await expect(page.getByText(/coming soon/i)).toBeVisible();
  });

  test("support page loads", async ({ page }) => {
    await page.goto("/support");
    await expect(page.getByText(/coming soon/i)).toBeVisible();
  });
});
