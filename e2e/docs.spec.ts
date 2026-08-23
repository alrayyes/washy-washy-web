import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

test("the header nav's Docs link reaches the docs site from the app's own chrome", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector('[data-hydrated="true"]');

  await page.getByRole("navigation", { name: "Site" }).getByRole("link", { name: "Docs" }).click();
  await expect(page).toHaveURL(/\/docs\/?$/);
  await expect(page.getByRole("heading", { level: 1, name: "Washy washy docs" })).toBeVisible();
});

test("the docs sidebar reaches every page, and the overview page passes an accessibility scan", async ({
  page,
}) => {
  await page.goto("/docs");

  const sidebar = page.getByRole("navigation", { name: "Main" });
  await expect(
    sidebar.getByRole("link", { name: "The chart and machine files", exact: true }),
  ).toHaveAttribute("href", "/docs/chart-and-machine/");
  await expect(
    sidebar.getByRole("link", { name: "Using the web app", exact: true }),
  ).toHaveAttribute("href", "/docs/web-app/");
  await expect(
    sidebar.getByRole("link", { name: "Generate a config with AI", exact: true }),
  ).toHaveAttribute("href", "/docs/ai-prompt/");

  await expectNoA11yViolations(page);
});

test("a docs page has the same header and footer chrome as the rest of the site", async ({
  page,
}) => {
  await page.goto("/docs/chart-and-machine/");

  const nav = page.getByRole("navigation", { name: "Site" });
  await expect(nav.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Washing loads" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Machine" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Docs" })).toHaveAttribute("aria-current", "page");
  // Role-based lookup is ambiguous here: a file <input> carries an
  // implicit "button" role too, alongside the real <button> (#80).
  await expect(page.locator("button", { hasText: "Upload config" })).toBeVisible();
  await expect(page.getByTestId("theme-toggle")).toBeVisible();

  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: "Washy washy on GitHub" })).toBeVisible();
  await expect(footer.getByRole("link", { name: "Disclaimer" })).toBeVisible();
  await expect(footer.getByRole("link", { name: "Privacy policy" })).toBeVisible();
});

test("the header and sidebar scroll away with the page, matching the rest of the site — not pinned like Starlight's default", async ({
  page,
}) => {
  await page.goto("/docs/chart-and-machine/");

  const header = page.locator("header");
  const initialTop = (await header.boundingBox())?.y;

  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(100);

  const scrolledBox = await header.boundingBox();
  // Scrolled off-screen (or at least moved well away from its start) —
  // a pinned/fixed header would report the same y on every check.
  expect(scrolledBox === null || (scrolledBox.y ?? 0) < (initialTop ?? 0) - 100).toBe(true);
});

test("the mobile menu toggle opens the sidebar and reaches another page — without breaking the sibling selector that shows it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/docs/chart-and-machine/");

  const nav = page.getByRole("navigation", { name: "Site" });
  await expect(nav.getByRole("link", { name: "Home" })).toBeVisible();

  const toggle = page.getByRole("button", { name: /menu/i });
  await toggle.click();

  const sidebar = page.getByRole("navigation", { name: "Main" });
  const webAppLink = sidebar.getByRole("link", { name: "Using the web app", exact: true });
  await expect(webAppLink).toBeVisible();
  await webAppLink.click();
  await expect(page).toHaveURL(/\/docs\/web-app\/?$/);
});

test("an explicit theme choice made on the main site carries to docs pages, no flash of the other mode", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.waitForSelector('[data-hydrated="true"]');
  await page.getByTestId("theme-toggle").click(); // dark (OS) -> light (explicit)

  await page.goto("/docs/chart-and-machine/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
