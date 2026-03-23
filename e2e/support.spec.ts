import { test, expect } from "@playwright/test";

test.describe("Support screen (Epic 5)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/support");
  });

  test("displays the support note from config", async ({ page }) => {
    await expect(
      page.getByText(/made with love|consider supporting/i)
    ).toBeVisible();
  });

  test("shows a donation link that opens in new tab", async ({ page }) => {
    const link = page.getByRole("link", { name: /support this project/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  });

  test("shows a Start again link back to home", async ({ page }) => {
    const link = page.getByRole("link", { name: /start again/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/");
  });

  test("clicking Start again navigates to home", async ({ page }) => {
    await page.getByRole("link", { name: /start again/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
