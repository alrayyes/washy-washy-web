import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * One assertion in an existing journey test, not a parallel suite re-driving
 * the same pages — see rules/a11y.md. WCAG 2.1 A/AA only; any violation
 * fails the run rather than only being logged.
 *
 * `knownViolationIds` excludes specific rule ids already tracked by their
 * own open issue — every caller that passes one must say which issue in a
 * comment, so a rule can't quietly stay excluded after its fix lands.
 */
export async function expectNoA11yViolations(page: Page, knownViolationIds: string[] = []) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const unexpected = results.violations.filter((v) => !knownViolationIds.includes(v.id));
  expect(unexpected).toEqual([]);
}
