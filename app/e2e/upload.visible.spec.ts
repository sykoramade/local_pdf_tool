import { test, expect } from '@playwright/test';

test('PDF upload area is visible on homepage', async ({ page }) => {
  const consoleErrors: string[] = [];
  const KNOWN_NOISE = /^(Unrecognized feature|Permissions-Policy|third-party)/;

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // LPT homepage has a "Browse files" button on the main dropzone (when not PRO)
  // The button contains both an SVG icon and the text "Browse files"
  const uploadButton =
    page.getByText(/Browse files/).first()
    .or(page.getByRole('button', { name: /browse|upload|select/i }).first())
    .or(page.locator('input[type="file"]').first());

  await expect(uploadButton).toBeVisible();

  // Assert console is clean
  expect(consoleErrors.filter(e => !KNOWN_NOISE.test(e))).toHaveLength(0);
});
