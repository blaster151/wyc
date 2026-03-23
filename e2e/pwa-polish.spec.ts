import { test, expect } from "@playwright/test";

test.describe("PWA & Polish (Epic 6)", () => {
  test("manifest.json is served and has required fields", async ({ request }) => {
    const res = await request.get("/manifest.json");
    expect(res.ok()).toBe(true);
    const manifest = await res.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.background_color).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  test("page has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/WYC/);
  });

  test("page has meta description", async ({ page }) => {
    await page.goto("/");
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute("content", /affirmation|calm/i);
  });

  test("page has theme-color meta tag", async ({ page }) => {
    await page.goto("/");
    const theme = page.locator('meta[name="theme-color"]');
    await expect(theme).toHaveAttribute("content", "#1a1a2e");
  });

  test("page has Open Graph tags", async ({ page }) => {
    await page.goto("/");
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /WYC/);
    const ogDesc = page.locator('meta[property="og:description"]');
    await expect(ogDesc).toHaveAttribute("content", /affirmation|calm/i);
  });

  test("page links to manifest.json", async ({ page }) => {
    await page.goto("/");
    const link = page.locator('link[rel="manifest"]');
    await expect(link).toHaveAttribute("href", "/manifest.json");
  });
});

test.describe("Navigation shell", () => {
  test("nav menu button is visible on every page", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: /open menu/i })
    ).toBeVisible();
  });

  test("opening menu shows Home and Support links", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();
    await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /support/i })).toBeVisible();
  });

  test("navigating to Support via menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();
    await page.getByRole("link", { name: /support/i }).click();
    await expect(page).toHaveURL(/\/support/);
  });

  test("nav is present on affirmations page", async ({ page }) => {
    await page.goto("/affirmations");
    await expect(
      page.getByRole("button", { name: /open menu/i })
    ).toBeVisible();
  });

  test("nav is present on support page", async ({ page }) => {
    await page.goto("/support");
    await expect(
      page.getByRole("button", { name: /open menu/i })
    ).toBeVisible();
  });
});
