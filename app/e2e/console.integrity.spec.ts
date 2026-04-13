import { test, expect } from '@playwright/test';

test('homepage loads without console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  const KNOWN_NOISE = /^(Unrecognized feature|Permissions-Policy|third-party)/;

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[error] ${msg.text()}`);
    }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Filter out known browser noise and assert clean console
  const unexpectedErrors = consoleErrors.filter(e => !KNOWN_NOISE.test(e));
  expect(unexpectedErrors).toHaveLength(0);
});
