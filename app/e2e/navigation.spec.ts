import { test, expect } from '@playwright/test';

test('main route returns 200 and renders content', async ({ page }) => {
  const consoleErrors: string[] = [];
  const KNOWN_NOISE = /^(Unrecognized feature|Permissions-Policy|third-party)/;

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  const response = await page.goto('/');
  expect(response?.status()).toBe(200);

  await page.waitForLoadState('networkidle');

  // Assert main content area is visible (check for visible heading or text)
  // The homepage has an h1 with "Edit PDFs" text
  await expect(page.getByText(/Edit PDFs/)).toBeVisible();

  // Assert console is clean
  expect(consoleErrors.filter(e => !KNOWN_NOISE.test(e))).toHaveLength(0);
});
