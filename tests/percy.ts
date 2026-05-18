import percySnapshot from '@percy/playwright';
import { expect, test as base, type APIRequestContext, type Locator, type Page } from '@playwright/test';

const PERCY_ENABLED = Boolean(process.env.PERCY_TOKEN);

export const test = base;
export { expect };
export type { APIRequestContext, Locator, Page };

test.afterEach(async ({ page }, testInfo) => {
  if (!PERCY_ENABLED) {
    return;
  }

  if (testInfo.status === 'skipped') {
    return;
  }

  await percySnapshot(page, testInfo.titlePath.join(' › '));
});