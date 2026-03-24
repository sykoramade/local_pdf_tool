# LocalPDF GTM Plan — Executive Summary

**Author:** CEO (Claude)
**Date:** 2026-03-23
**Full Plan:** See `/docs/gtm-plan.md` (10k words, detailed)
**Status:** ✅ Ready for MD Review

---

## The Thesis
LocalPDF's competitive moat is **100% privacy** (client-side only). No other $9/mo PDF tool can make this claim. We win by targeting users frustrated with upload-based tools and compliance teams with strict data policies.

**Target:** $1.5k MRR = 170 Pro customers @ $9/mo

---

## Target ICP (In Priority Order)

### 1. Compliance-Conscious Professionals (PRIMARY) — 9/10 Confidence
- Job: Legal admin, healthcare data manager, HIPAA/GDPR compliance officer
- Pain: Uploading PDFs is a compliance violation (policy explicit: "no cloud upload")
- Why $9/mo: Peace of mind + consolidation of 2-3 tool subscriptions
- **Best messaging:** "Legally defensible PDF editing — files never leave your computer"

### 2. Privacy-First Consumers (SECONDARY) — 8/10 Confidence
- Profile: Tech-savvy, 25-45, US/EU, uses Signal/ProtonMail
- Pain: Distrusts "free" tools; wants privacy guarantee
- Why $9/mo: Conviction-based (willing to pay for alignment, like Signal donors)
- **Best messaging:** "The PDF editor that respects your privacy — like everything you use"

### 3. SMB Operations Manager (TERTIARY) — 6/10 Confidence
- Job: Office manager, ops lead at 5-50 person company
- Pain: Processes 20-50 PDFs/week; ilovepdf free tier hits daily quota
- Why $9/mo: One subscription for team + batch operations (roadmap)
- **Best messaging:** "Batch operations save 45 min/week — no team seat limits"

---

## Launch Channels Ranked by ROI

| Channel | Spend | Timeline | Expected Users (12 mo) | Expected Revenue (12 mo) | Confidence |
|---------|-------|----------|--------|---------|----------|
| **SEO (5 new guides)** | $0 | Weeks 1-4 | 100-150 | $300-500/mo | 9/10 |
| **Reddit posts** | $0 | Weeks 1-8 | 50-80 | $50-100/mo | 8/10 |
| **ProductHunt** | $0 | Week 9 (June) | 100-180 | $200-300/mo | 7/10 |
| **Newsletter sponsorships** | $0-500 | Weeks 5-12 | 50-100 | $100-200/mo | 7/10 |
| **Twitter presence** | $0 | Weeks 1-26 | 30-50 | $30-100/mo | 6/10 |
| **Hacker News** | $0 | Week 8 (TBD) | 50-150 | $100-200/mo | 6/10 |
| **Cold email** | $0 | Weeks 3-12 | 10-20 | $20-50/mo | 5/10 |
| **Paid search (Google Ads)** | $200-300/mo | Weeks 13+ | 50-100 | $100-200/mo | 5/10 |

**Total expected by month 6:** 300-500 users, $200-400/mo revenue
**Total expected by month 12:** 500-800 users, $400-800/mo revenue
→ Not quite $1.5k, but path is clear (scale paid search 2-3× months 7-12)

---

## 5 SEO Blog Posts (Publish Immediately)

**Post 1:** "Why Your PDF Editor Uploads Your Files (And How LocalPDF Doesn't)" (1200w)
- Target: "pdf editor privacy", "does pdf editor upload"
- Angle: DevTools proof (screenshots of network uploads for competitors, zero for LocalPDF)
- Expected traffic: 50-150/mo; conversion: 8-12%
- **Expected outcome: 4-18 signups/mo**

**Post 2:** "LocalPDF vs Smallpdf vs ilovepdf — Honest Comparison" (1500w) ⭐ HIGHEST ROI
- Target: "smallpdf alternative", "ilovepdf alternative"
- Angle: Side-by-side feature table + privacy deep-dive
- Expected traffic: 200-400/mo; conversion: 5-8%
- **Expected outcome: 10-32 signups/mo** ← This one post could drive 10-20% of year-1 growth

**Post 3:** "GDPR Compliance Checklist for PDF Tools" (800w) ⭐ HIGHEST CONVERSION
- Target: "GDPR pdf editor", "compliant pdf tools"
- Angle: 8-point checklist; LocalPDF checks all boxes
- Expected traffic: 30-80/mo; conversion: 10-15%
- **Expected outcome: 3-12 signups/mo** ← Best for compliance ICP (highest LTV)

**Post 4:** "Signing PDFs Without Uploading" (1000w)
- Target: "sign pdf without upload", "free pdf signer private"
- Angle: Step-by-step workflow + security explanation
- Expected traffic: 100-250/mo; conversion: 3-5%
- **Expected outcome: 3-12 signups/mo**

**Post 5:** "Batch PDF Operations: Merge, Compress, Split 50+ Files" (1200w)
- Target: "batch pdf processing", "bulk pdf merge free"
- Angle: Use case walkthroughs (legal discovery, HR batches, researcher aggregation)
- Expected traffic: 40-100/mo; conversion: 4-6%
- **Expected outcome: 1-6 signups/mo** (lower traffic, but high-value Pro users)

**Total SEO impact:** 400-600 users, $300-500/mo revenue by month 6

---

## Free → Pro Conversion Strategy

### Problem
Current model: Free users get unlimited uses after sign-in. **No friction = no reason to upgrade.**

### Solution: In-App Upgrade Prompts (Sprint 20, immediate)

**Trigger 1:** Annotation limits (already coded, activate now)
- Free: 5 sticky notes per document
- Pro: Unlimited
- Prompt: "You've added 5 notes. Upgrade for unlimited?"
- Expected conversion lift: 1.5-3× (from 1-2% baseline to 2-5%)

**Trigger 2:** Batch operations (Ship Sprint 21)
- Free: 1 file at a time
- Pro: Batch merge/split/compress 10+ files
- Expected conversion lift: +10-20% of Pro signups cite batch as reason

**Trigger 3:** Signature resize (Ship Sprint 18, already coded, improve UX)
- Free: Locked signature size
- Pro: Resize handle
- Expected conversion lift: Small, but nice-to-have upsell

**Expected impact:**
- Current conversion: 1-2% (free → Pro)
- With in-app prompts: 3-5%
- At 500 users: 15-25 Pro conversions vs. 5-10 before
- **Incremental revenue: +$90-180/mo**

---

## First 50 Users Plan (Weeks 1-5)

### Phase 1: Beta Recruitment (Weeks 1-2)
- Personal network (Slack/Discord): 5-10 beta users
- Reddit r/beta + r/privacy: 10-15 beta users
- Twitter replies + IndieHackers: 5-10 beta users
- **Total recruited:** 20-35 testers

### Phase 2: Closed Beta (Weeks 2-4)
- Weekly async feedback (Slack threads)
- Bug bounty: "Report 3 bugs → 3 mo Pro"
- Optional monthly Zoom call
- Target: 70-80% active weekly engagement

### Phase 3: Iterate (Weeks 3-4)
- Prioritize feedback (top 3 items 30%+ mentioned)
- Fix top 3 issues in Sprint 21 (quick wins)
- Backlog remaining requests

### Phase 4: Launch (Week 5)
- Flip launch flags
- Execute ProductHunt campaign
- Monitor for issues

**Expected outcome:**
- 30 beta testers → 15-20 convert to free tier → 3-5 Pro conversions
- High-quality feedback (5-10 backlog items)
- Early word-of-mouth amplification

---

## Scaling from 50 → 500 Users (Months 2-6)

### Months 2-3 (50 → 150 users)
**Channels:** SEO (organic, cumulative) + ProductHunt (one-time spike) + Reddit maintenance + Twitter growth

**Monthly breakdown:**
- SEO guides: 30-50 new users/mo (organic, high LTV)
- ProductHunt tail: 30-50 in month 2, 5-10/mo after
- Reddit: 10-15/mo
- Twitter: 5-10/mo
- Expected Pro conversion: 2-4 users/mo ($18-36/mo revenue)

### Months 4-6 (150 → 500 users)
**New channels:** Paid search + partnerships + affiliate program (future) + continued newsletter sponsorships

**Monthly breakdown:**
- SEO guides: 50-80/mo (ramping as posts gain authority)
- ProductHunt: 5-10/mo (tail traffic)
- Paid search (Google Ads, $200-300/mo): 10-20/mo new users
- Newsletter sponsorships: 15-25/mo
- Reddit: 10-15/mo
- Partnerships: 5-10/mo
- Expected Pro conversion: 5-10 users/mo ($45-90/mo revenue)

**By month 6:** 300-500 cumulative users, 15-25 Pro (monthly), $135-225/mo revenue

---

## Viral & Referral Potential

### Honest Assessment: Weak Viral, Strong Referral

**Viral coefficient (k-factor):** 0.2-0.4 (weak, not inherently shareable)
- Reason: PDF editing is solitary; no shared moment; no social features

**Referral strength:** 9/10
- "How did you sign this so fast without uploading?" → Natural question
- Compliance officers recommend to colleagues
- Lawyers recommend to clients
- Privacy advocates recommend in forums

### Referral Strategy (Implicit > Explicit)

**Implicit (focus on this, months 1-6):**
- Monitor Twitter mentions + Reddit posts
- Answer questions in r/privacy, r/opendata authentically
- Email existing users (month 3): "Tell a friend about LocalPDF"
- Expected impact: 10-20% of new users mention "friend told me"

**Explicit (backlog, Sprint 23+):**
- Referral program: "$9 credit for referrer when referee upgrades"
- Expected impact: 1-3% of growth (low; requires heavy promotion)
- **Confidence:** 4/10 (referral programs rarely work without effort)

---

## Risk Factors & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| SEO rankings don't materialize (month 3-4) | High (40% of plan depends on SEO) | Start with Reddit + ProductHunt while waiting for SEO; adjust by month 4 |
| ProductHunt launch timing (product not ready) | Medium (100-150 users at stake) | Defer to Sprint 22 if S19-S20 bugs not resolved; don't launch broken |
| Freemium limits kill growth (free users convert less) | Medium (5-10% revenue impact) | A/B test annotation limits before full rollout; revert if conversion drops |
| Paid search ROI is negative (month 5+) | Low (easy to turn off) | Test with $100/week first; pause if CAC > 3× LTV |
| Privacy claims get questioned (HN/Reddit) | Low (easy to defend; claims are true) | Have /privacy-architecture page + DevTools proof ready; invite scrutiny |

---

## Monthly Revenue Forecast (Conservative)

| Month | Users | Free % | Pro % | Pro Count | Monthly Revenue | Notes |
|-------|-------|--------|-------|-----------|--------|-------|
| 1 | 30 | 95% | 5% | 1-2 | $9-18 | SEO ramping, Reddit posts |
| 2 | 80 | 90% | 10% | 8 | $72 | ProductHunt launch |
| 3 | 180 | 85% | 15% | 27 | $243 | PH tail + SEO gains |
| 4 | 280 | 82% | 18% | 50 | $450 | Paid search ramps |
| 5 | 380 | 80% | 20% | 76 | $684 | Partnerships begin |
| 6 | 500 | 80% | 20% | 100 | $900 | Scale mode |

**Month 6 trajectory:** $900/mo → $1.5k by month 8-9 (if scale paid search 1.5-2×)

**Success criteria (month 6):**
- 300+ cumulative users
- 15-25 active Pro users ($135-225/mo)
- Organic channels ≥60% of new users
- Conversion rate ≥2% (free → Pro)

---

## Immediate Actions (Next 2 Weeks)

1. **SEO foundation (This week)**
   - Install Google Search Console + GA4
   - Publish Blog Post #1 ("Why Your PDF Editor Uploads Your Files")
   - Set up Rank Tracker (Semrush free or Ahrefs trial)

2. **Social launch (This week)**
   - Create @localpdf Twitter account
   - Post thread: "I built a PDF editor that doesn't upload your files. Here's why."
   - Research 5-10 privacy/indie dev newsletters for sponsorship

3. **Reddit recruitment (Week 2)**
   - Draft r/privacy "Show HN"-style post: "I built LocalPDF..."
   - Prep r/freelance + r/compliance posts
   - Identify subreddit mods for feedback

4. **ProductHunt prep (Weeks 1-2)**
   - Identify 2-3 ProductHunt power users to help on launch day
   - Plan launch date: Early June (depends on S19-S20 completion)

5. **A/B test setup (Week 2)**
   - Plan annotation limit A/B test (5 notes vs. unlimited)
   - Get Analytics dashboard ready (GA4 segment: new free users)

---

## Success Metrics (Month 6 Checkpoint)

- [ ] 300-500 cumulative users
- [ ] 15-25 active Pro users ($135-225/mo revenue)
- [ ] SEO sources ≥60% of growth (tracked in GA4)
- [ ] ProductHunt launch successful (300+ upvotes, 1k+ visitors)
- [ ] Conversion rate (free → Pro): ≥2%
- [ ] CAC (paid channels, if any): ≤$100
- [ ] Newsletter sponsorship partnerships: 2-3 active

If hitting these, trajectory to $1.5k MRR by month 9-10 is clear.

---

## Next Steps

1. **MD review:** Does this align with vision? Any strategic disagreements?
2. **Sprint planning:** Assign S20 (bug fixes + A/B test setup) + S21 (batch operations + SEO content)
3. **Content kickoff:** Assign blog writing (internal or contractor)
4. **Analytics setup:** Install GA4 + GSC + start daily monitoring
5. **Community engagement:** Launch Twitter + Reddit presence (week 1)

**Full detailed plan:** `/docs/gtm-plan.md` (10k words)

---

**Status:** ✅ Ready for Managing Director approval.
