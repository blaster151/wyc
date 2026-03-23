import { test, expect } from "@playwright/test";

test.describe("Route stubs", () => {
  test("affirmations page loads and shows affirmation content", async ({ page }) => {
    await page.goto("/affirmations");
    // Should show affirmation content with a Next or Finish button
    await expect(
      page.getByRole("button", { name: "Next", exact: true }).or(
        page.getByRole("button", { name: "Finish", exact: true })
      )
    ).toBeVisible();
  });

  test("support page loads", async ({ page }) => {
    await page.goto("/support");
    await expect(page.getByText(/coming soon/i)).toBeVisible();
  });
});
