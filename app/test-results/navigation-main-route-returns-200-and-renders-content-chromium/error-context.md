# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> main route returns 200 and renders content
- Location: e2e\navigation.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Edit PDFs/)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/Edit PDFs/)

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
  3  | test('main route returns 200 and renders content', async ({ page }) => {
  4  |   const consoleErrors: string[] = [];
  5  |   const KNOWN_NOISE = /^(Unrecognized feature|Permissions-Policy|third-party)/;
  6  | 
  7  |   page.on('console', msg => {
  8  |     if (msg.type() === 'error' || msg.type() === 'warning') {
  9  |       consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
  10 |     }
  11 |   });
  12 | 
  13 |   const response = await page.goto('/');
  14 |   expect(response?.status()).toBe(200);
  15 | 
  16 |   await page.waitForLoadState('networkidle');
  17 | 
  18 |   // Assert main content area is visible (check for visible heading or text)
  19 |   // The homepage has an h1 with "Edit PDFs" text
> 20 |   await expect(page.getByText(/Edit PDFs/)).toBeVisible();
     |                                             ^ Error: expect(locator).toBeVisible() failed
  21 | 
  22 |   // Assert console is clean
  23 |   expect(consoleErrors.filter(e => !KNOWN_NOISE.test(e))).toHaveLength(0);
  24 | });
  25 | 
```