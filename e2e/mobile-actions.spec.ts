import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";
import { expectTapTargets, gotoHome, PHONE } from "./mobile-support";

test.use({ viewport: PHONE });

const MENU = "Download and share";

test("on a phone the download and share actions sit behind one menu button, in one row", async ({
  page,
}) => {
  await gotoHome(page);
  const menu = page.getByRole("button", { name: MENU });

  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toHaveAttribute("aria-controls", "pdf-actions");
  await expect(page.getByTestId("download-phone")).toBeHidden();
  await expect(page.getByTestId("download-print")).toBeHidden();
  await expect(page.getByTestId("share-sheet")).toBeHidden();

  const box = await page.getByTestId("pdf-actions-bar").boundingBox();
  expect(box?.height ?? 0).toBeLessThanOrEqual(56);
});

test("the menu button opens the three actions and closes them again", async ({ page }) => {
  await gotoHome(page);
  const menu = page.getByRole("button", { name: MENU });

  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByTestId("download-phone")).toBeVisible();
  await expect(page.getByTestId("download-print")).toBeVisible();
  await expect(page.getByTestId("share-sheet")).toBeVisible();
  await expectTapTargets(page.getByTestId("pdf-actions-bar"));
  await expectNoA11yViolations(page);

  await menu.click();
  await expect(page.getByTestId("download-phone")).toBeHidden();
});

test("Escape closes the menu and returns focus to its button", async ({ page }) => {
  await gotoHome(page);
  const menu = page.getByRole("button", { name: MENU });

  await menu.focus();
  await page.keyboard.press("Enter");
  await page.getByTestId("download-phone").focus();
  await page.keyboard.press("Escape");

  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByTestId("download-phone")).toBeHidden();
  await expect(menu).toBeFocused();
});

test("a download started from the menu still produces the PDF", async ({ page }) => {
  await gotoHome(page);
  await page.getByRole("button", { name: MENU }).click();
  const download = page.waitForEvent("download");
  await page.getByTestId("download-phone").click();
  expect((await download).suggestedFilename()).toBe("washing-instructions-phone.pdf");
});
