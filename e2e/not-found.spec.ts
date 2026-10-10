import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

/**
 * Runs against `wrangler dev` like delivery.spec.ts: the 404 page only exists
 * when `assets.not_found_handling` is set, and scripts/serve-dist.ts doesn't
 * read wrangler.jsonc.
 */
test.use({ baseURL: "http://127.0.0.1:4322" });

for (const path of ["/nope", "/docs/nope", "/de/nope"]) {
  test(`${path} answers 404 with the site's own page`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(page.getByRole("main").getByRole("link", { name: "Docs" })).toHaveAttribute(
      "href",
      "/docs/",
    );
  });
}

test("the 404 page has no accessibility violations", async ({ page }) => {
  await page.goto("/nope");
  await expectNoA11yViolations(page);
});
