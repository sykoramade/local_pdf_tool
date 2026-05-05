# LPT E2E Test Conventions

## 1. Console Capture (Mandatory)

Every test must register a console capture handler **before any navigation**:

```typescript
const consoleErrors: string[] = [];
const KNOWN_NOISE = /^(Unrecognized feature|Permissions-Policy|third-party)/;
page.on('console', msg => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
  }
});
```

At the end of the test, assert that no unexpected errors were logged:

```typescript
expect(consoleErrors.filter(e => !KNOWN_NOISE.test(e))).toHaveLength(0);
```

This is not optional. See OSL-S49-15 for details.

## 2. Hard Assertions Only

Every assertion must be a hard assertion — failures halt the test immediately:

```typescript
// CORRECT — hard assertion
await expect(uploadArea).toBeVisible();
expect(response?.status()).toBe(200);

// WRONG — soft assertions / catch blocks
await expect(uploadArea).toBeVisible({ soft: true });
try { await page.goto('/') } catch { /* ignored */ }
const isVisible = await uploadArea.isVisible().catch(() => false);
```

Soft assertions, catch blocks, and error swallowing hide real failures. Document test intent and let hard assertions prove it. See OSL-S49-13.

## 3. Fail-First Protocol

Before committing tests:

1. **Write** the test file
2. **Run** it with `npm run test:e2e` from `app/`
3. **Confirm** that at least one test FAILS on the current branch
4. **Document** the failure reason in a comment if it's expected (e.g., "PRO feature placeholder")
5. **Commit** the test file WITH the failure as evidence

Fail-first proves the test actually exercises real code and is not a vacuous pass.

## 4. File Naming

Use the pattern: `app/e2e/[feature].[scenario].spec.ts`

Examples:
- `console.integrity.spec.ts` — homepage console errors
- `upload.visible.spec.ts` — PDF upload UI visibility
- `navigation.spec.ts` — route integrity

All test files must end in `.spec.ts`.

## 5. Locator Strategy

Prefer Playwright's semantic locators in this order:

1. **getByRole** — `page.getByRole('button', { name: /upload/i })`
2. **getByLabel** — `page.getByLabel('PDF file')`
3. **getByText** — `page.getByText('Drop your PDF here')`
4. **getByTestId** — `page.getByTestId('upload-area')` (if data-testid is available)

Never use CSS selectors or xpath unless semantic locators are impossible:

```typescript
// GOOD
await expect(page.getByRole('button', { name: /upload|select/i })).toBeVisible();

// ACCEPTABLE LAST RESORT
await expect(page.locator('input[type="file"]')).toBeVisible();

// BAD
await expect(page.locator('.some-class > div.nested-sel')).toBeVisible();
```

## 6. Test Data

Do NOT hardcode real Supabase, Stripe, or auth credentials:

- Use environment variables: `process.env.LPT_TEST_PDF_PATH`, `process.env.LPT_TEST_EMAIL`
- Never commit API keys, tokens, or passwords
- For test PDFs: use mock files in `e2e/fixtures/` (create as needed)
- For auth: skip authenticated tests in CI unless `LPT_TEST_FULL_AUTH` is set

Example:

```typescript
const testPdfPath = process.env.LPT_TEST_PDF_PATH ?? './e2e/fixtures/sample.pdf';
```

## 7. Viewport

All tests run at a fixed desktop viewport: **1280 × 800**. This is set globally in `playwright.config.ts`.

**Never** override the viewport inside a test. If you need to test responsive behavior, that's a separate test suite (not in scope for S50).

## 8. Working Directory

All commands run from the `app/` subdirectory:

```bash
cd C:\Users\MobilePC\Documents\GitHub_Repos\local_pdf_tool\app
npm run test:e2e
```

CI inherits this via `defaults.run.working-directory: app` in `.github/workflows/playwright.yml`. Do not add `cd app` in test commands.

## 9. CI Contract

The GitHub Actions workflow (`playwright.yml`) runs:

```bash
npm ci                                  # from app/
npx playwright install chromium --with-deps
npm run build
npm run test:e2e
```

Tests must pass this exact sequence with no additional setup. If your test requires environment variables, add them to the workflow's `env:` block.

---

## Example Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('feature: behavior under condition', async ({ page }) => {
  // 1. Register console capture BEFORE any navigation
  const consoleErrors: string[] = [];
  const KNOWN_NOISE = /^(Unrecognized feature|Permissions-Policy|third-party)/;
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  // 2. Navigate and interact
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 3. Assert behavior with hard assertions
  await expect(page.getByRole('main')).toBeVisible();
  const button = page.getByRole('button', { name: /upload/i });
  await expect(button).toBeVisible();

  // 4. Assert console is clean
  expect(consoleErrors.filter(e => !KNOWN_NOISE.test(e))).toHaveLength(0);
});
```
