# A/B Test — Annotation Limit (Sprint 20)

**Goal:** Determine if limiting free sticky notes drives Pro conversions without harming activation.
**Approved:** 2026-03-23 (MD)
**Owner:** CEO (Claude) — implementation in Sprint 20

---

## Hypothesis

> If free users are limited to 5 sticky notes per document, conversion rate (free → Pro) will be ≥ 1.5× the current unlimited baseline.

Current baseline conversion estimate: 1–2%.
Target with limits: 2–4%.

---

## Test Design

| | Variant A (Control) | Variant B (Treatment) |
|---|---|---|
| **Free tier** | Unlimited sticky notes | 5 sticky notes per document |
| **Trigger** | No upgrade prompt | Upgrade modal on 6th sticky note attempt |
| **Pro** | Unlimited (both variants) | Unlimited |
| **Assignment** | 50% of new users | 50% of new users |

**Assignment method:** Random bucket on first page load, stored in `localStorage` as `ab_annotation_limit` (`"control"` or `"treatment"`).

**Duration:** 2 weeks minimum. Extend to 3 weeks if < 50 conversion events by week 2.

---

## Implementation (Sprint 20 — Sonnet task)

### 1. Assignment logic (`lib/ab-test.ts`)
```typescript
export type ABVariant = 'control' | 'treatment';

export function getAnnotationLimitVariant(): ABVariant {
  const stored = localStorage.getItem('ab_annotation_limit');
  if (stored === 'control' || stored === 'treatment') return stored;
  const variant: ABVariant = Math.random() < 0.5 ? 'control' : 'treatment';
  localStorage.setItem('ab_annotation_limit', variant);
  return variant;
}

export const ANNOTATION_LIMIT_TREATMENT = 5; // notes per doc
```

### 2. Gate check (in annotation placement handler)
```typescript
const variant = getAnnotationLimitVariant();
const stickyNoteCount = annotations.filter(a => a.type === 'sticky').length;

if (variant === 'treatment' && stickyNoteCount >= ANNOTATION_LIMIT_TREATMENT && !user?.isPro) {
  // Show upgrade modal instead of placing note
  setShowUpgradeModal(true);
  return;
}
```

### 3. Upgrade modal copy
> **You've used 5 sticky notes — free limit reached.**
> Upgrade to Pro for unlimited annotations, signatures, and downloads.
> [Upgrade for $9/mo] [Maybe later]

### 4. GA4 events to fire

| Event | When | Parameters |
|-------|------|-----------|
| `annotation_limit_hit` | User hits 6th note | `{ variant: 'treatment' }` |
| `upgrade_modal_shown` | Modal appears | `{ source: 'annotation_limit' }` |
| `upgrade_clicked` | User clicks Upgrade | `{ source: 'annotation_limit', variant }` |
| `upgrade_dismissed` | User clicks Maybe later | `{ source: 'annotation_limit' }` |

**Also tag all checkout events** with `{ ab_variant: getAnnotationLimitVariant() }` so Pro conversions are attributable.

---

## How to Verify the Test is Running

### Browser verification steps (do before declaring live)
1. Open the app in an incognito window (fresh localStorage)
2. Open DevTools → Application → Local Storage
3. Confirm `ab_annotation_limit` key is set to either `control` or `treatment` on first use
4. **Treatment path:** Place 5 sticky notes → on 6th attempt, confirm upgrade modal appears, no note placed
5. **Control path:** (open second incognito window, delete localStorage key, repeat until you get control variant) → Place 6+ sticky notes → confirm no modal, unlimited notes
6. Check DevTools → Console: confirm `annotation_limit_hit` GA4 event fires on 6th attempt in treatment

### Forcing a variant (for testing)
```javascript
// In browser console
localStorage.setItem('ab_annotation_limit', 'treatment'); // force treatment
localStorage.setItem('ab_annotation_limit', 'control');   // force control
```

---

## Reading Results

### Where to check
- **GA4:** Events → `annotation_limit_hit`, `upgrade_clicked`, `upgrade_dismissed`
- **Supabase:** `user_profiles` table → filter `is_pro = true`, join with created_at for conversion timing
- **GA4 Explore:** Create funnel: `page_view` → `annotation_limit_hit` → `upgrade_clicked` → (Pro checkout)

### Decision criteria

| Outcome | Action |
|---------|--------|
| Variant B conversion ≥ 1.5× Variant A | Ship freemium limits in Sprint 21 |
| Variant B conversion 1.0–1.5× Variant A | Extend test 1 more week; consider raising limit to 10 |
| Variant B conversion < 1.0× Variant A | Revert; try different conversion lever |
| Activation rate drops > 20% in Variant B | Revert immediately — limit is too aggressive |

### How to check activation rate
Activation = user places ≥ 1 annotation in first session.
- GA4: `annotation_placed` event (ensure this is logged) — compare Variant A vs B rate
- If Variant B activation < 80% of Variant A → limit is hurting onboarding, not just conversion

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Small sample size (< 100 users in 2 weeks) | Extend to 4 weeks before deciding |
| Variant assignment skews (80/20 split due to rounding) | Log variant counts weekly; re-seed if skewed |
| Users find localStorage hack | Not a concern — this is the expected behavior for determined users |
| A/B flag persists after Pro upgrade | Clear `ab_annotation_limit` on Pro subscription activation |

---

## Rollback

Set `ANNOTATION_LIMIT_ENABLED=false` env var (or feature flag in `lib/ab-test.ts`) to disable treatment for all users instantly without a deploy.

---

**Status:** Approved — implement in Sprint 20 (Sonnet task, ~500 tokens)
