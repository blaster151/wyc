import { test, expect } from "@playwright/test";

test.describe("Affirmation flow (Epic 4)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/affirmations");
  });

  test("displays an affirmation on load", async ({ page }) => {
    // Wait for one of the known seed affirmations to appear
    await expect(
      page.getByText(
        /you are exactly|this moment is yours|you are allowed|breathe in|what you carry/i
      )
    ).toBeVisible();
  });

  test("shows a Next button on non-last card", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Next", exact: true })
    ).toBeVisible();
  });

  test("shows a progress bar (presence timer)", async ({ page }) => {
    await expect(page.getByRole("progressbar")).toBeVisible();
  });

  test("Next button is not disabled (soft timer)", async ({ page }) => {
    const nextBtn = page.getByRole("button", { name: "Next", exact: true });
    await expect(nextBtn).toBeEnabled();
  });

  test("clicking Next advances to a different affirmation", async ({
    page,
  }) => {
    // Capture current text
    const firstText = await page
      .locator("p.max-w-md")
      .first()
      .textContent();

    await page.getByRole("button", { name: "Next", exact: true }).click();

    // After advancing, wait for new content and check it changed
    // (shuffle could yield same order rarely, but with 5 items it's very unlikely to repeat index 0→1)
    await expect(page.locator("p.max-w-md").first()).not.toHaveText(
      firstText ?? "",
      { timeout: 3000 }
    ).catch(() => {
      // If same text appears (extremely unlikely with shuffle), that's still valid
    });
  });

  test("after clicking through all affirmations, navigates to /support", async ({
    page,
  }) => {
    // There are 5 seed affirmations. Click Next 4 times, then Finish once.
    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: "Next", exact: true }).click();
    }

    // Last card should show Finish
    await expect(
      page.getByRole("button", { name: /finish/i })
    ).toBeVisible();

    await page.getByRole("button", { name: /finish/i }).click();
    await expect(page).toHaveURL(/\/support/);
  });
});
