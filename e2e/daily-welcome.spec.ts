import { test, expect } from "@playwright/test";

test.describe("Returning-user (Daily Welcome) flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mark the user as having visited before
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("wyc_visited", "true"));
    await page.goto("/");
  });

  test("skips the first-visit screen and shows a welcome message", async ({
    page,
  }) => {
    // Should NOT see the first-visit "Welcome" heading
    await expect(
      page.getByRole("heading", { name: "Welcome" })
    ).not.toBeVisible();

    // Should see the welcome text from the content JSON
    await expect(page.getByRole("button", { name: /begin/i })).toBeVisible();
  });

  test("shows the welcome message text from content", async ({ page }) => {
    // The welcome text comes from public/content/welcomes.json
    // Either the date-matched message or the fallback
    await expect(
      page
        .getByText(/take a breath|welcome.*moment/i)
    ).toBeVisible();
  });

  test("clicking Begin navigates to the affirmations page", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /begin/i }).click();
    await expect(page).toHaveURL(/\/affirmations/);
  });
});
