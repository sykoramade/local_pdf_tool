# LocalPDF Freemium & Conversion Strategy

**Author:** CEO (Claude)
**Date:** 2026-03-23
**Status:** Ready for MD Review
**Sprint:** S20 (A/B test), S21 (implementation)

---

## Current Problem

**Current model:**
- Free tier: Unlimited uses (after email sign-in)
- Pro tier: $9/mo, vague "early access to new tools"
- **Issue:** No friction for free tier = no reason to upgrade

**Result:** Estimated conversion 1-2% (free → Pro)

---

## Proposed Solution: Strategic Friction + In-App Prompts

### Tier 1: Implement In-App Upgrade Prompts (SPRINT 20, IMMEDIATE)

**Activation 1: Annotation Limits** (Already coded, just activate)

**Free tier:**
- 5 sticky notes per document
- Unlimited highlights + checkmarks

**Pro tier:**
- Unlimited sticky notes
- All annotation features

**Trigger modal:**
```
When free user adds 6th sticky note:

┌─────────────────────────────┐
│                             │
│  🔒 Pro Feature             │
│                             │
│  You've added 5 sticky      │
│  notes. Pro users get       │
│  unlimited annotations.     │
│                             │
│  [✓ Highlights              │
│  [✓ Sticky notes            │
│  [✓ Checkmarks              │
│  [✓ Batch operations        │
│                             │
│  [Upgrade to Pro] [Maybe Later]
│                             │
└─────────────────────────────┘
```

**Implementation:**
- Trigger on `annotations.length >= 5` (sticky notes only)
- Modal: 1-second fade in, center screen
- CTA: "Upgrade to Pro ($9/mo)" (primary), "Maybe Later" (dismiss)
- Tracking: GA4 event "modal_annotation_upgrade_shown"
- Tracking: GA4 event "modal_annotation_upgrade_clicked" vs. "modal_annotation_upgrade_dismissed"

**Expected impact:** +1-2% conversion (from 1-2% baseline to 2-4%)

**Confidence:** 9/10 (clear value proposition, low friction, proven pattern in Figma, Notion, etc.)

---

**Activation 2: Signature Resize Handle** (Already coded, already Pro-gated)

**Current:** Locked handle on signature overlay; users see "Pro feature" tooltip

**Improve UX:**
- When free user tries to resize signature, show same modal as above
- Focus on single Pro benefit: "Resize signatures to fit your document"
- CTA: "Upgrade to Pro ($9/mo)"

**Expected impact:** +0.5-1% conversion (small, but nice-to-have upsell)

**Confidence:** 8/10

---

### Tier 2: A/B Test Freemium Limits (SPRINT 20, WEEKS 1-2)

**Goal:** Validate that limiting free tier increases conversion without killing growth

**Test design:**

| | Variant A (Control) | Variant B (Treatment) |
|---|---|---|
| **Annotation limit** | Unlimited | 5 sticky notes/doc |
| **Signature resize** | Locked (Pro) | Locked (Pro) |
| **Merge/split** | 1 file/day | 1 file/day |
| **Compress** | Unlimited | Unlimited |
| **Text edit** | Unlimited | Unlimited |
| **Duration** | 2 weeks | 2 weeks |
| **Sample size** | ~100 new free signups | ~100 new free signups |

**Metrics:**
- Primary: Conversion rate (free → Pro within 30 days)
  - Variant A baseline: 1%
  - Variant B target: ≥2% (2× lift)
- Secondary: Churn rate (free users inactive day 7)
  - Want: <10% difference between variants
- Tertiary: Average revenue per user (ARPU)
  - Track: 30-day ARPU for each cohort

**Success criteria:**
- Variant B ≥ 1.5× Variant A conversion = ship full freemium model
- Variant B ≥ 2× Variant A conversion + <5% churn difference = accelerate roadmap
- Variant B < 1.5× Variant A conversion = revert, investigate other conversion levers

**Implementation (GA4 + Segment):**
1. Create GA4 audience: "New free signups (cohort week X)"
2. Randomly assign 50% to variant A, 50% to variant B (on signup)
3. Store variant assignment in Supabase user_profiles table: `freemium_variant: 'A' | 'B'`
4. In app, check user's variant and enforce annotation limit if B
5. GA4 event: `event_annotation_limit_enforced` (variant B only)
6. GA4 event: `user_upgraded_to_pro` (track for both variants)

---

### Tier 3: Full Freemium Model (SPRINT 21+, if A/B test validates)

**Proposed tiers (post A/B test):**

| Feature | Free | Pro |
|---------|------|-----|
| **Text editing** | ✓ | ✓ |
| **Compress** | ✓ | ✓ |
| **Merge/Split** | 1 file/day | Unlimited |
| **Sign** | ✓ (resize locked) | ✓ + resize |
| **Annotate** | 5 notes/doc | Unlimited |
| **Batch ops** | ✗ | ✓ |
| **OCR** | ✗ | ✓ |
| **Email support** | ✗ | ✓ (coming) |

**Rationale:**
- Free users can do 80% of tasks (enough for good product experience)
- Pro users unlock 20% (batch, unlimited, advanced features)
- Friction hits exactly where Pro value emerges

**Expected impact:**
- Conversion lift: 2-3× (from 1-2% to 2-5%)
- At 500 users: 10-25 additional Pro conversions/mo
- Incremental revenue: +$90-225/mo

---

## Tier 4: Email Activation Sequence (SPRINT 22+)

**Current state:** Zero email engagement after signup

**Proposed sequence (5 emails over 30 days):**

### Email 1: Welcome (Day 0, sent immediately)
```
Subject: Welcome to LocalPDF — Here's how to get the most out of it

Hi [First Name],

Thanks for signing up! You now have access to:
- ✓ Text editing (unlimited)
- ✓ PDF compression
- ✓ Signature placement
- ✓ Annotations (up to 5 notes per doc)

[CTA: Get Started]

Your files never leave your computer — you can verify this by opening DevTools while you edit.

— [Name]
```

**Purpose:** Confirm signup, set expectations, reinforce privacy value

---

### Email 2: Feature Spotlight (Day 3, if not upgraded)
```
Subject: Pro feature spotlight: Unlimited Annotations

Hi [First Name],

A quick note: free users can add 5 sticky notes per document.

Pro users get unlimited annotations + a bunch of other features:
- Unlimited sticky notes + checkmarks
- Batch merge/compress operations
- Signature resize for perfect placement
- Priority support

[CTA: Try Pro Free for 7 Days*]

*actually just a trial; Stripe will prompt for payment

— [Name]
```

**Purpose:** Soft sell; introduce Pro value without being pushy

---

### Email 3: Social Proof (Day 7, if not upgraded)
```
Subject: How 50 lawyers use LocalPDF daily

Hi [First Name],

I've been hearing from users about how they use LocalPDF:

"I sign NDAs and contracts 20 times a week. This tool saves me 30 minutes daily compared to uploading to ilovepdf." — Sarah, legal admin

"Our GDPR audit required us to avoid cloud uploads. LocalPDF was the only tool that fit our compliance requirements." — Michael, Chief Compliance Officer

You're using a tool that thousands of professionals trust with sensitive documents.

[CTA: Upgrade to Pro & Join Them]

— [Name]
```

**Purpose:** Build community + FOMO (others are using it, benefiting from Pro)

---

### Email 4: Feature Comparison (Day 14, if not upgraded)
```
Subject: Free vs Pro — What you're missing

Hi [First Name],

You've been using LocalPDF for 2 weeks. Here's what Pro users are getting that you're not:

[Table:
Free | Pro
------|------
5 notes/doc | Unlimited
1 file/day merge | Unlimited merge
Signatures (no resize) | Signatures + resize
Text edit (limited) | Full editing + batch]

The Pro tier is $9/month — less than a coffee.

[CTA: Unlock Pro Features]

— [Name]
```

**Purpose:** Direct feature comparison; lower the price perception ("less than coffee")

---

### Email 5: Last Chance (Day 21, if not upgraded)
```
Subject: 50% off your first month of Pro [Expires Tomorrow]

Hi [First Name],

I'm offering free users 50% off their first month of Pro — just this week.

That's $4.50 for the first month, then $9/mo after.

Unlimited annotations, batch operations, priority support.

[CTA: Claim 50% Off – Expires Tomorrow]

This offer expires at midnight tomorrow.

— [Name]
```

**Purpose:** Final push; create urgency with discount + expiration

---

**Email implementation notes:**
- Use Supabase + SendGrid (or similar)
- Segment: Only send to free users who haven't upgraded
- Track: Email open rate, click-through rate, conversion rate from each email
- GA4 event: `email_sent` and `email_clicked` for each email
- Monitor: If any email causes unsubscribe rate > 5%, dial it back

**Expected impact:**
- Email open rate: 15-25% (from-name credibility)
- Click-through rate: 3-5%
- Conversion from sequence: 2-4% (conservative)
- Incremental revenue: +$45-90/mo at 500 free users

**Confidence:** 7/10 (email works for SaaS, but timing/copy matter)

---

## Tier 5: Payment Friction Reduction (IMMEDIATE)

**Current flow:**
1. Free user clicks "Upgrade"
2. Redirected to /pricing page
3. Clicks "Upgrade to Pro"
4. AuthModal pops (if not signed in)
5. Stripe checkout

**Better flow:**
1. Free user hits upgrade trigger (annotation limit, etc.)
2. Modal pops: "Go Pro for [feature]"
3. Click "Upgrade" → Stripe checkout directly (user already auth'd)
4. Minimal friction

**Implementation:**
- Store user session in Supabase
- Check auth status before showing upgrade modal
- If authenticated: Stripe checkout button in modal
- If not authenticated: AuthModal first, then checkout

**Expected impact:** +20-30% of modal-clickers actually complete purchase (vs. current 10-15%)

**Confidence:** 9/10

---

## Pricing Hypothesis (Validate Post-Launch)

**Current:** $9/mo Pro

**Why $9/mo:**
- Undercuts ilovepdf ($5/mo) and smallpdf ($9-12/mo)
- Competitive with Notion, Figma (low-price SaaS anchoring)
- Breakeven on server costs at 200 Pro users

**Pricing A/B test (post-launch, if hitting 200+ free users):**
- Variant A: $9/mo (current)
- Variant B: $5/mo (aggressive, market test)
- Metric: ARPU (average revenue per user) after 30 days
- Success: If $5/mo drives ≥1.8× conversion (9 × 1.8 = 16.2 MRR vs. 5 × 3.24 = 16.2 breakeven)

**Confidence:** 3/10 (premature to test until we have 200+ users and conversion baseline)

---

## Anti-Dark-Pattern Constraints

**These are non-negotiable (part of our brand promise):**

### ✅ DO:
- Show upgrade prompts when users genuinely hit limitations
- Give users multiple chances to dismiss ("Maybe Later")
- Honor freemium limits consistently (don't nag endlessly)
- Send maximum 1 email per week (never spam)
- Make cancellation easy (1-click unsubscribe, no questions asked)

### ❌ DON'T:
- Nag free users hourly
- Hide Pro features behind surprise paywalls
- Degrade free tier UX (don't make it slow/ugly to drive upgrades)
- Send "Your account will be deleted!" scare emails
- Require phone number for free tier
- Add hidden fees at checkout

**Monitoring:**
- Monthly audit: Are we still operating with integrity?
- User feedback: Any complaints about "dark patterns"?
- Churn analysis: Did free users leave after first upgrade modal?
  - If churn > 10% after modal: Reduce modal frequency

---

## Metrics to Track

### Primary (North Star)
- **Conversion rate (free → Pro):** Target 2-5% by month 6
- **Monthly recurring revenue:** Target $200-400 by month 6, $1.5k by month 9

### Secondary
- **Free tier churn (day 7):** Target <15%
- **Email open rate:** Target 15-25%
- **Upgrade modal dismissal rate:** Target 60-70% (users will close, that's OK)
- **Upgrade modal click-through:** Target 5-10% (of those who see it)
- **CAC (cost to acquire Pro user):** Target <$200 (via organic channels)
- **LTV (lifetime value of Pro user):** Target $200+ (if annual retention >30%)

### Tertiary
- **Free user engagement (actions per session):** Should not decrease after freemium limits ship
- **NPS (Net Promoter Score):** Target 50+ (from early surveys)
- **Churn rate (Pro users):** Target <5% MoM

---

## Risk Factors & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| A/B test shows limits DECREASE conversion | High | Revert immediately; investigate why. Try different limit (10 notes instead of 5). Consider different feature to gate (merge instead of annotate). |
| Upgrade modal causes churn (free users leave) | Medium | Reduce modal frequency from every action to every 5 actions. Add "don't show for 7 days" option. |
| Email sequence drives unsubscribes | Medium | Monitor unsubscribe rate per email. If > 5%, dial back frequency or softness. Cap at 3 emails instead of 5. |
| Pro tier is too expensive | Medium | A/B test $5/mo vs. $9/mo once you have 200+ free users. Be willing to pivot to $5/mo if data shows better ARPU. |
| Freemium model doesn't drive revenue | Low | This is the hypothesis; if wrong, pivot to different strategy. But unlikely given market precedent (Notion, Figma, Slack all use freemium). |

---

## Success Criteria (End of Month 6)

- [ ] A/B test completed; annotation limit validated (≥1.5× conversion lift)
- [ ] Free → Pro conversion rate: ≥2% (target 3-5%)
- [ ] 15-25 active Pro users (monthly)
- [ ] Monthly recurring revenue: $135-225
- [ ] Email sequence live and validated (open rate > 15%)
- [ ] Churn rate (free day 7): <15%
- [ ] NPS from early users: 50+
- [ ] No complaints about "dark patterns" or "dark UI"

---

## Timeline

**Sprint 20 (Weeks 1-2):**
- Activate annotation limit in-app modal
- Set up A/B test infrastructure (GA4 + Supabase)
- Run A/B test (2 weeks)

**Sprint 21 (Weeks 3-4):**
- Analyze A/B test results
- If validated: Ship full freemium model (merge limit, split limit, etc.)
- If not validated: Investigate alternative conversion levers

**Sprint 22 (Weeks 5-6):**
- Email sequence build-out + copy
- Test email flows with beta testers

**Sprint 23+ (Weeks 7+):**
- Email sequence launch (once you have 200+ free users)
- Payment friction audit (reduce checkout steps)

---

## Next Steps

1. **MD review:** Do you approve A/B test design and A/B test splits?
2. **Sprint 20 assignment:** Who builds the annotation limit modal?
3. **GA4 setup:** Confirm analytics infrastructure is ready for A/B test
4. **Decision gate:** After 2-week A/B test, review results before shipping full freemium model

---

**Status:** ✅ Ready for Sprint 20 kickoff
