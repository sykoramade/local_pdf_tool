# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: upload.visible.spec.ts >> PDF upload area is visible on homepage
- Location: e2e\upload.visible.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Browse files/).first().or(getByRole('button', { name: /browse|upload|select/i }).first()).or(locator('input[type="file"]').first())
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/Browse files/).first().or(getByRole('button', { name: /browse|upload|select/i }).first()).or(locator('input[type="file"]').first())

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - region "Notifications (F8)":
    - list
  - generic [ref=e7]:
    - generic [ref=e8]:
      - generic [ref=e9]:
        - text: GET
        - text: STAMPS.
        - text: EAT
        - text: BANANAS.
        - text: WIN STUFF.
      - generic [ref=e10]: The Banana Stand loyalty card. Works in your browser.
    - generic [ref=e11]: 🍌
    - generic [ref=e12]:
      - button "CREATE MY CARD →" [ref=e13] [cursor=pointer]
      - button "Already have a card? Sign in" [ref=e14] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('PDF upload area is visible on homepage', async ({ page }) => {
  4  |   const consoleErrors: string[] = [];
  5  |   const KNOWN_NOISE = /^(Unrecognized feature|Permissions-Policy|third-party)/;
  6  | 
  7  |   page.on('console', msg => {
  8  |     if (msg.type() === 'error' || msg.type() === 'warning') {
  9  |       consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
  10 |     }
  11 |   });
  12 | 
  13 |   await page.goto('/');
  14 |   await page.waitForLoadState('networkidle');
  15 | 
  16 |   // LPT homepage has a "Browse files" button on the main dropzone (when not PRO)
  17 |   // The button contains both an SVG icon and the text "Browse files"
  18 |   const uploadButton =
  19 |     page.getByText(/Browse files/).first()
  20 |     .or(page.getByRole('button', { name: /browse|upload|select/i }).first())
  21 |     .or(page.locator('input[type="file"]').first());
  22 | 
> 23 |   await expect(uploadButton).toBeVisible();
     |                              ^ Error: expect(locator).toBeVisible() failed
  24 | 
  25 |   // Assert console is clean
  26 |   expect(consoleErrors.filter(e => !KNOWN_NOISE.test(e))).toHaveLength(0);
  27 | });
  28 | 
```