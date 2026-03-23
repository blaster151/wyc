import { test, expect } from "@playwright/test";

test.describe("First-visit flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so the app sees the user as a first-time visitor
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/");
  });

  test("shows the Welcome screen with heading and tagline", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
    await expect(
      page.getByText("A small moment of calm, just for you.")
    ).toBeVisible();
  });

  test("shows an Enter button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /enter/i })
    ).toBeVisible();
  });

  test("clicking Enter transitions to the Daily Welcome screen", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /enter/i }).click();

    // Daily welcome shows the welcome message text and a "Begin" button
    await expect(page.getByRole("button", { name: /begin/i })).toBeVisible();
  });

  test("sets localStorage so next visit is not first-visit", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /enter/i }).click();
    const visited = await page.evaluate(() =>
      localStorage.getItem("wyc_visited")
    );
    expect(visited).toBe("true");
  });
});
