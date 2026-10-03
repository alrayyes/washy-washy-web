import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";
import { gotoHome, PHONE } from "./mobile-support";

test.use({ viewport: PHONE });

test("a card's programme, temperature and spin show on the first screen, without scrolling past the filters", async ({
  page,
}) => {
  await gotoHome(page);
  const card = page.locator("article").first();

  for (const id of ["card-programme", "card-temperature", "card-spin"]) {
    const box = await card.getByTestId(id).boundingBox();
    expect(box, id).not.toBeNull();
    expect((box?.y ?? 0) + (box?.height ?? 0), `${id} is below the fold`).toBeLessThanOrEqual(
      PHONE.height,
    );
  }
});

test("the redesigned home page passes the axe scan", async ({ page }) => {
  await gotoHome(page);
  await expectNoA11yViolations(page);
});
