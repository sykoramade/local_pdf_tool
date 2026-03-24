# LocalPDF GTM Tactics — Week-by-Week Execution (Months 1-6)

**Purpose:** Day-by-day / week-by-week playbook for executing GTM plan
**Owner:** CEO (Claude), with MD oversight
**Timeline:** Weeks 1-26 (6 months)

---

## MONTH 1: Foundation (Weeks 1-4)

### WEEK 1: Launch Foundation
**Goal:** Establish presence across SEO, Twitter, Reddit. Publish first blog post.

#### Monday-Tuesday
- [ ] Install GA4 on app (track user flow, conversion funnel)
- [ ] Install Google Search Console (monitor impressions for existing 10 guides)
- [ ] Create `/docs/gtm-metrics.md` (template for weekly review)
- [ ] Set up Rank Tracker account (Semrush free tier or Ahrefs free trial)
  - Add all 5 target keywords for new blog posts
  - Add all existing guide keywords

**Time estimate:** 2-3 hours

#### Wednesday
- [ ] Publish Blog Post #1: "Why Your PDF Editor Uploads Your Files (And How LocalPDF Doesn't)"
  - Target keyword: "pdf editor privacy", "does pdf editor upload"
  - Internal links to: /privacy-architecture, /guides/gdpr-pdf-editor
  - SEO metadata: title tag, meta description, H1
  - Share on Twitter + Reddit (organic, not self-promo)

**Time estimate:** 2 hours (writing) + 0.5 (SEO setup)

#### Thursday
- [ ] Create @localpdf Twitter account
  - Bio: "The PDF editor that doesn't upload your files. Privacy-first. Client-side only. Open feedback."
  - Avatar: LocalPDF logo
  - Header image: Screenshot of DevTools Network tab (zero uploads)
- [ ] Post thread: "I built a PDF editor that doesn't upload your files. Here's a thread about why that matters." (5-7 tweets)
  - Tweet 1: Problem statement (ilovepdf, smallpdf upload files)
  - Tweet 2: How to verify (DevTools screenshot)
  - Tweet 3: Why it matters (privacy, GDPR, HIPAA)
  - Tweet 4: How LocalPDF works (client-side architecture)
  - Tweet 5: CTA ("Try it free, check DevTools yourself")
  - Pin tweet: 30-second Loom demo of text edit → signature → download
- [ ] Follow: @alexstamos, @theprivacyguide, @shipstreams, @indiehackers (community leaders)

**Time estimate:** 1.5 hours (account setup + thread writing)

#### Friday
- [ ] Draft Reddit posts for r/privacy, r/freelance, r/compliance (do NOT post yet; iterate)
  - r/privacy: "I built LocalPDF, a PDF editor that doesn't upload your files. Feedback?"
  - r/freelance: "Freelancers: tired of ilovepdf? I built a PDF signer that never uploads your contracts."
  - r/compliance: "GDPR-safe PDF editing — files never leave the browser. For compliance teams."
- [ ] Research newsletter sponsors (3-5 targets)
  - Privacy Guides (15k subs)
  - Indie Hackers digest (50k subs)
  - The Diff newsletter (50k subs)
  - Alex Rogo's Privacy Weekly (5k subs, highest ROI)
  - (Email list — get contact info from each newsletter's homepage)

**Time estimate:** 2 hours (drafts) + 1 hour (research)

#### Weekly Review (Friday evening)
- [ ] GA4 check: Baseline metrics (current site traffic, conversion funnel)
- [ ] Check Analytics: Are we seeing any lift from Twitter thread?
- [ ] Document in `/docs/gtm-metrics.md`:
  - Twitter followers: X
  - Blog post views: X
  - Signups: X
  - Pro conversions: X

**Total week 1 effort:** ~11 hours (mostly one-time setup)

---

### WEEK 2: Content + Community
**Goal:** Publish second blog post, launch Reddit presence, plan A/B test, recruit beta testers.

#### Monday-Tuesday
- [ ] Publish Blog Post #2: "LocalPDF vs Smallpdf vs ilovepdf — Honest Comparison" (HIGHEST ROI post)
  - This is the big one; spend extra time on it
  - Target keyword: "smallpdf alternative", "ilovepdf alternative"
  - Create comparison table (features, privacy, speed, pricing)
  - DevTools proof section: screenshots of each competitor's network uploads
  - Internal links to: /pricing, /privacy-architecture, 3-4 existing guides
  - External backlinks to: Smallpdf, ilovepdf, mybestpdf (SEO authority)

**Time estimate:** 3-4 hours

#### Wednesday
- [ ] Post #1 to Reddit: r/privacy
  - Title: "I built LocalPDF — a PDF editor that doesn't upload your files"
  - Body: 3-4 sentence description + link + "Feedback welcome"
  - Monitor comments; respond to all questions within 2 hours
  - Goal: 500-1.5k upvotes, 20-50 unique visitors

**Time estimate:** 0.5 hours (posting) + 2 hours (engagement)

#### Thursday
- [ ] Beta recruitment email (send to Twitter followers + personal network)
  - Subject: "Help me test LocalPDF? Free Pro access in exchange for feedback"
  - Body: 2-3 sentences, link to beta signup form
  - Target: 20-30 responses (expect 5-10% response rate)
  - Create Slack channel #localpdf-beta for feedback

**Time estimate:** 1 hour

#### Friday
- [ ] Plan A/B test: Annotation limit (free: 5 notes vs. unlimited)
  - Assign 50% of new free users to variant A (unlimited)
  - Assign 50% to variant B (5-note limit)
  - Duration: 2 weeks
  - Success metric: Variant B ≥ 2× Variant A conversion rate
  - Create GA4 segment for each variant
- [ ] Plan conversion improvements for Sprint 20 (in-app upgrade prompts)
  - Design modal: "You've added 5 notes. Go Pro for unlimited?"
  - Add to Figma / design spec
  - Assign to UI builder

**Time estimate:** 1.5 hours

#### Friday evening review
- [ ] Update `/docs/gtm-metrics.md`:
  - Blog post views (Post #1, Post #2)
  - Reddit: upvotes + unique visitors from post #1
  - Twitter: followers (+X), engagement (+X likes/retweets)
  - Beta recruits: X signups
  - Pro conversions: X

**Total week 2 effort:** ~8 hours

---

### WEEK 3: Scale Reddit + Product Polish
**Goal:** Second Reddit post, publish third blog post, begin beta tester engagement, finalize ProductHunt timing.

#### Monday-Tuesday
- [ ] Publish Blog Post #3: "GDPR Compliance for PDF Processing — A Procurement Checklist"
  - Target keyword: "GDPR pdf editor", "compliant pdf tools"
  - Create 8-point checklist (LocalPDF checks all boxes)
  - Include compliance officer testimonial / case study
  - CTA: "Use LocalPDF free to test compliance requirements"

**Time estimate:** 2-3 hours

#### Wednesday
- [ ] Post #2 to Reddit: r/freelance
  - Title: "Freelancers: tired of uploading contracts to ilovepdf? Try LocalPDF (100% client-side)"
  - Highlight: Signature workflow, zero upload risk, instant download as "_signed.pdf"
  - Monitor + engage

**Time estimate:** 2 hours (posting + engagement)

#### Thursday
- [ ] Email beta testers (first weekly check-in)
  - Subject: "Welcome to LocalPDF beta! Let's hear about your workflow."
  - Body: "Quick survey — what do you use PDFs for?"
  - Create Google Form for quick feedback

**Time estimate:** 0.5 hours

#### Friday
- [ ] Decide ProductHunt launch date (early vs. mid-June)
  - Check Sprint 19-20 status: Are S19 bugs resolved? Is S20 annotation/limit work done?
  - If on track: Set PH launch for June 4-6 (Tuesday)
  - If behind: Defer to June 11-13
  - Create ProductHunt account (if not already done)
  - Draft ProductHunt tagline: "The PDF editor that doesn't upload your files — 100% in-browser, privacy-first design"

**Time estimate:** 1 hour

#### Weekly review
- [ ] Update metrics:
  - Blog traffic (Post #1, #2, #3 views)
  - Reddit posts: Combined upvotes + visitors from posts #1 + #2
  - Twitter: followers, daily impressions
  - Beta: active testers (X responding to weekly check-in)
  - Signups: X free, Y Pro
  - Calculate: cost-per-signup so far (should be $0)

**Total week 3 effort:** ~7 hours

---

### WEEK 4: Newsletter Outreach + Hacker News Prep
**Goal:** Secure 1-2 newsletter sponsorships, finalize HN post, publish Blog Post #4.

#### Monday-Tuesday
- [ ] Publish Blog Post #4: "Signing PDFs Without Uploading: The Ultimate Guide"
  - Target keyword: "sign pdf without upload", "free pdf signer private"
  - Step-by-step workflow with screenshots
  - FAQ: "Is my signature legally binding?" (answer: varies by jurisdiction)
  - CTA: "Try free — 3 signatures/day without signup"

**Time estimate:** 2-3 hours

#### Wednesday
- [ ] Outreach to newsletter sponsors (5 targets)
  - Email templates:
    ```
    Subject: Sponsorship opportunity — LocalPDF (PDF editor, privacy-first)

    Hi [Name],

    I'm building LocalPDF — a PDF editor that never uploads files. Designed for privacy-conscious users and compliance teams.

    Would [Newsletter Name] be interested in sponsoring? I can offer:
    - Ad copy + unique landing page for tracking
    - Potential barter (I give you free Pro access if you sponsor)

    Let me know if this is a fit.

    [LocalPDF link]
    ```
  - Target: Privacy Guides + Alex Rogo's Privacy Weekly + Indie Hackers
  - Expected: 1-2 responses (50% reply rate)

**Time estimate:** 1.5 hours

#### Thursday
- [ ] Draft Hacker News "Show HN" post (do NOT submit yet)
  - Title: "Show HN: LocalPDF — edit, sign, and compress PDFs without uploading them"
  - Body: 2-3 sentences + link
  - Prep responses to common HN objections:
    - "How do I verify files don't leave the browser?"
    - "Why should I trust you vs Smallpdf?"
    - "Will you open-source this?"
  - Choose submission window: Tuesday-Thursday, 8-10 AM PT (next week)

**Time estimate:** 1 hour (prep)

#### Friday
- [ ] Beta feedback synthesis (week 2 responses)
  - Collect all Slack + Google Form responses
  - Categorize: bugs vs. feature requests vs. "it's great"
  - Top 3 issues to fix in Sprint 21
  - Document in `/docs/messages/beta-feedback-week2.md`

**Time estimate:** 1.5 hours

#### Weekly review
- [ ] Update metrics:
  - Cumulative blog traffic: X views (all 4 posts)
  - Cumulative signups: X
  - Beta tester feedback quality: X bugs identified, Y features requested
  - Newsletter outreach: X emails sent, Y responses
  - Pro conversion rate: X%
  - Document "What's working": SEO + Reddit generating best signups?

**Total week 4 effort:** ~7 hours

---

## MONTH 2: Momentum (Weeks 5-8)

### WEEK 5: Newsletter Sponsor #1 + Hacker News Launch
**Goal:** First newsletter sponsorship goes live, launch HN post.

#### Monday-Tuesday
- [ ] Finalize newsletter sponsorship #1 (likely Alex Rogo's Privacy Weekly)
  - Negotiate copy + unique landing URL (for tracking)
  - Provide banner (if required)
  - Expected launch: Friday week 6

**Time estimate:** 1 hour

#### Tuesday evening
- [ ] Publish Blog Post #5: "Batch PDF Operations" (can delay if writers busy)
  - Target keyword: "batch pdf processing", "merge multiple pdfs free"
  - Walkthroughs: merge, split, compress (with screenshots)
  - Use case deep-dives: legal, HR, research
  - CTA: "Try batch merge free (limit 3 files) or upgrade to Pro for unlimited"

**Time estimate:** 2-3 hours (or defer to week 6 if context limited)

#### Wednesday-Thursday
- [ ] Submit Hacker News "Show HN" post
  - Best time: Tuesday-Thursday, 8-10 AM PT
  - Title: "Show HN: LocalPDF — edit, sign, and compress PDFs without uploading them"
  - Monitor comments actively for first 4 hours
  - Respond to every question; be helpful, not defensive
  - Pin a comment with link to /privacy-architecture for DevTools explanation

**Time estimate:** 0.5 hours (submission) + 3 hours (active engagement)

#### Friday
- [ ] Analyze Week 5 HN results
  - Upvotes: X
  - Comments: X
  - Estimated visitors: X
  - Estimated signups: X
  - Document: `/docs/messages/hn-launch-week5.md`

**Time estimate:** 1 hour

#### Friday weekly review
- [ ] Metrics update:
  - HN traffic + signups
  - Newsletter sponsor pipeline: X confirmed, Y in negotiation
  - Cumulative users: X (should be ~80-100 by now)
  - Pro conversion: X%
  - Identify: Which channel is generating best signups? (expected: SEO + Reddit)

**Total week 5 effort:** ~8 hours

---

### WEEKS 6-8: Scale + ProductHunt Prep
**Goal:** Confirm newsletter sponsors, finalize ProductHunt launch prep, reach 150 cumulative users.

#### WEEK 6
- [ ] Newsletter sponsor #1 live (Alex Rogo's Privacy Weekly)
  - Monitor traffic from newsletter (use UTM parameter)
  - Expected: 30-80 visitors, 3-8 signups
- [ ] Post #3 to Reddit: r/compliance
  - Title: "GDPR-safe PDF editing — for compliance teams and legal teams"
  - Body: "I built LocalPDF for teams with strict data handling policies. Files never leave the browser."
- [ ] Begin ProductHunt launch prep:
  - Create ProductHunt account (if not done)
  - Draft ProductHunt page copy
  - Prepare 3-4 demo GIFs (text edit, sign, compress)
  - Identify 2-3 ProductHunt "hunters" (power users who will upvote)

**Time estimate:** 6-7 hours

#### WEEK 7
- [ ] Finalize ProductHunt page
  - Tagline: "The PDF editor that doesn't upload your files — 100% in-browser, privacy-first design"
  - Gallery: 4-5 demo GIFs + screenshots
  - Description: Feature list, privacy explanation, CTA
  - Pricing: Free tier info + Pro pricing
- [ ] Newsletter sponsor #2 negotiation (Indie Hackers or Privacy Guides)
  - Aim for launch by week 9 (before ProductHunt)
- [ ] Recruit ProductHunt "hunters" (send messages)
  - "Would you be interested in upvoting LocalPDF on ProductHunt? It's launching June 4."
  - Offer: Free Pro access for 3 months in exchange

**Time estimate:** 5-6 hours

#### WEEK 8: ProductHunt Launch Prep
- [ ] Final ProductHunt page polish
- [ ] Prepare launch day schedule:
  - 7 AM PT: ProductHunt "hunters" start upvoting
  - 8 AM PT: Launch official ProductHunt post
  - 8 AM-12 PM PT: Active engagement (answer all comments)
  - 12 PM-6 PM PT: Continue monitoring, pin helpful comments
  - 6 PM PT: Wind down, prepare next-day follow-up
- [ ] Prep "thank you" email (send to all ProductHunt visitors post-launch)
  - Mention feedback survey (Google Form)
  - Link to Slack community for beta testers
- [ ] PR outreach (optional):
  - Email 5-10 tech bloggers: "ProductHunt launch Tuesday, would you cover it?"
  - Expected: 0-1 coverage (long shot, but worth 30 min)

**Time estimate:** 4-5 hours prep

---

### WEEKS 9-12: Post-ProductHunt Scale

#### WEEK 9: ProductHunt Launch Day
- [ ] **ProductHunt Launch!** (Tuesday, June 4)
  - Expected: 300-800 upvotes, 1.5k-3.5k unique visitors, 50-150 free signups
  - 4-6 hours of active engagement (Monday-Wednesday)
- [ ] Monitor HN comments (if additional discussions emerge)
- [ ] Send "thank you for feedback" email to ProductHunt visitors

**Time estimate:** 6-8 hours (launch week is intense)

#### WEEK 10: Post-ProductHunt Momentum
- [ ] Analyze ProductHunt results
  - Document in `/docs/messages/ph-launch-results.md`
  - Extract top 5 feature requests → backlog for Sprint 22
  - Extract top 3 bug reports → fix in Sprint 20-21
- [ ] Newsletter sponsor #2 launches (Indie Hackers or Privacy Guides)
  - Expected: 50-100 visitors, 5-15 signups
- [ ] Reddit post #4 to r/webdev (optional, lower priority)
  - Title: "I open-sourced the client-side PDF processing library from LocalPDF"
  - (Only if we extract library by this point; otherwise skip)

**Time estimate:** 4-5 hours

#### WEEK 11: Scale Analysis + Paid Search Test
- [ ] Analyze month 2 channel performance
  - Which channels driving best signups? (expected: SEO + ProductHunt)
  - Which channels driving best Pro conversions? (expected: Compliance content)
- [ ] Begin paid search test:
  - Set up Google Ads account
  - Budget: $100/week (4 weeks test)
  - Target keywords: "pdf editor privacy", "free pdf editor no upload", "GDPR pdf tool"
  - Bid strategy: Maximize conversions
  - Track: CPC, CTR, conversion rate, CAC

**Time estimate:** 3-4 hours (setup)

#### WEEK 12: Newsletter Scale + A/B Test Results
- [ ] Confirm newsletter sponsor #3 (optional, if pipeline exists)
- [ ] Analyze A/B test results (annotation limit)
  - Variant A (control): X% conversion (free → Pro)
  - Variant B (5-note limit): Y% conversion
  - If Y ≥ 1.5× X: Implement full freemium limits model in Sprint 21
  - If Y < 1.5× X: Keep unlimited free tier, focus on other conversion levers
- [ ] Document: `/docs/gtm-metrics.md` month 2 summary
  - Cumulative users: X (expected: 150-180)
  - Pro users: X (expected: 8-15)
  - Monthly revenue: $X (expected: $72-135)
  - Best channels: [ranked]

**Time estimate:** 3-4 hours

---

## MONTH 3: Validation (Weeks 13-16)

### Focus: Validate paid search ROI, expand winning channels, launch new features

#### WEEK 13
- [ ] Evaluate paid search performance (week 1-4 results)
  - If CAC < $150: Scale to $200/week
  - If CAC > $150: Pause and optimize keywords
  - If CAC > $200: Pause ads, focus on organic
- [ ] Publish additional SEO content (if writers available)
  - Target: Long-tail keywords (e.g., "Sign PDF on Mac free", "Edit scanned PDFs")
  - Expected: Lower volume, easier to rank, niche audiences

**Time estimate:** 2-3 hours

#### WEEKS 14-16
- [ ] Scale ProductHunt tail traffic (still getting organic upvotes)
- [ ] Maintain newsletter sponsorships (rotate sponsors every 2 weeks)
- [ ] Continue Reddit engagement (answer questions in r/privacy, r/compliance, r/freelance)
- [ ] Monitor Twitter growth (should be 300-500 followers by now)
- [ ] Prepare Sprint 21+ feature launches (batch operations, etc.)
  - Blog posts on new features
  - Product Hunt "update" posts
  - Newsletter sponsor highlights

**Time estimate:** 5-10 hours/week (ongoing operations)

---

## MONTHS 4-6: Scale Phase (Weeks 17-26)

### Focus: Double down on winning channels, test new partners, approach $500 users

#### Monthly cadence:
1. **Monday:** Channel analysis (GA4 review, ROI calculation)
2. **Mid-week:** Blog post #6-7 (targeting secondary keywords)
3. **Friday:** Newsletter engagement + partner outreach
4. **Weekly:** Twitter activity (2-3 tweets/week), Reddit comments, Reddit new posts

#### Partner expansion:
- Week 17-18: Approach 3-5 complementary tools for partnership (Signal, ProtonMail, DuckDuckGo, Mullvad, etc.)
- Week 19-20: Launch 1-2 partnerships (10-20 referral users/mo each)
- Week 21+: Affiliate program launch (if 200+ users)

#### Paid channel expansion:
- Week 17: Evaluate Google Ads ROI (3 months of data)
  - If positive ROI: Scale to $400-500/mo budget
  - If negative: Shift budget to partnership/affiliate programs
- Week 18+: Test LinkedIn ads (if B2B ICP validation is strong)
  - Target: Compliance officers, HR professionals
  - Budget: $50-100/week
  - Expected: Very high CAC, but highest LTV (compliance users)

#### Content pipeline:
- Week 17-26: Publish 1 blog post every 2 weeks (3-4 total)
- Target: Long-tail keywords + case studies + updates on feature launches

---

## Success Metrics — End of Month 6

### User Growth
- [ ] 300-500 cumulative users (from 0)
- [ ] 15-25 Pro users (monthly active)
- [ ] Organic channels ≥60% of new users
- [ ] Conversion rate (free → Pro): ≥2%

### Revenue
- [ ] Monthly recurring revenue: $135-225
- [ ] Trajectory to $1.5k by month 9-10 is clear

### Channel Performance (ranked by ROI)
1. **SEO:** 100-150 users, $300-500/mo annualized
2. **ProductHunt:** 100-150 users (spike month 2), $200-300/mo tail
3. **Newsletter sponsorships:** 50-100 users, $100-200/mo
4. **Reddit:** 50-80 users, $50-100/mo
5. **Paid search:** 50-100 users (if tested), cost-neutral to positive
6. **Twitter:** 30-50 users, mostly brand awareness
7. **Hacker News:** 50-150 users (if launched), $100-200/mo tail
8. **Cold email:** 10-20 users, high CAC, low priority

### Feedback Loops
- [ ] 5-10 backlog items from ProductHunt feedback
- [ ] 2-3 partnerships established
- [ ] A/B test results validate conversion strategy
- [ ] Product roadmap shaped by user feedback (backlog prioritization)

---

## Weekly Reporting Template

**Every Friday, update `/docs/gtm-metrics.md`:**

```markdown
## Week X (Dates)

### Channel Performance
- SEO blog traffic: X views, X clicks (cumulative: X)
- Reddit posts: X upvotes, X unique visitors
- ProductHunt: X upvotes, X visitors (if active)
- Twitter: X followers, X new followers this week
- Newsletter sponsors: X visitors, X clicks
- Paid search: X clicks, X CTR, X conversions

### User Acquisition
- New free signups: X
- New Pro signups: X
- Conversion rate (free → Pro): X%
- Cumulative total: X free users, X Pro users

### Revenue
- Monthly recurring: $X
- Annualized: $X

### Observations
- What's working: [channel/tactic]
- What's not: [channel/tactic]
- Next week focus: [top 3 priorities]
```

---

## Contingency Plan

**If SEO not ranking by week 8:**
- Increase Reddit + cold email outreach
- Speed up ProductHunt launch to week 7
- Double newsletter sponsor outreach (expected: 2-3 sponsors active)

**If ProductHunt launch flops (< 100 upvotes):**
- Not a blocker; rely on SEO + Reddit
- Hacker News provides backup credibility signal
- Paid search becomes more important (shift budget)

**If free → Pro conversion < 1% by week 12:**
- Revisit freemium limits (may be too aggressive)
- Add in-app upgrade prompts aggressively (Sprint 20)
- Revisit pricing hypothesis ($9/mo may be too high)

**If paid search CAC > $200 by week 18:**
- Pause Google Ads
- Shift budget to partnerships + affiliate programs
- Focus on organic growth (SEO + community)

---

## Next Steps

1. **Week 1:** MD approval of GTM plan + assignment of writing/analytics tasks
2. **Week 2:** Blog writing begins (post #1-5 draft pipeline)
3. **Week 3:** Analytics setup complete (GA4 + GSC + Rank Tracker)
4. **Week 5:** Newsletter sponsor outreach begins
5. **Week 9:** ProductHunt launch (success metrics in place)

---

**Owner:** CEO (Claude) + MD oversight
**Status:** ✅ Ready for Sprint 20 + GTM execution
